import Anthropic from "@anthropic-ai/sdk";
import { createClient as createSupabase, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getGuide } from "@/content/guides";
import { SYSTEM_PROMPT, userContextBlock, type UserContext } from "@/lib/assistant-prompt";
import { rateLimit } from "@/lib/rate-limit";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Asistente de A posto. Cada pregunta gasta 1 crédito de la persona (ver migración 0005).
 * - Exige cuenta: por cookie (web) o por token en la cabecera Authorization (app móvil).
 * - El crédito se descuenta en la base de datos ANTES de llamar a la IA y de forma atómica.
 * - El proveedor y el modelo se eligen aquí, en un solo sitio.
 */
const MODEL = "claude-haiku-5-5";

// Orígenes de la app empaquetada (iOS, Android) y de las pruebas locales.
const APP_ORIGINS = new Set(["capacitor://localhost", "https://localhost", "http://localhost", "http://localhost:5173", "http://localhost:4173"]);

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !APP_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Expose-Headers": "X-Credits-Remaining",
    "Access-Control-Max-Age": "600",
  };
}

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) }))
    .min(1)
    .max(30)
    .refine((m) => m[m.length - 1].role === "user", "last message must be from the user")
    .refine((m) => m[0].role === "user", "first message must be from the user")
    .refine((m) => m.every((x, i) => i === 0 || x.role !== m[i - 1].role), "roles must alternate"),
});

const anthropic = new Anthropic();

async function authenticate(req: Request): Promise<{ supabase: SupabaseClient; userId: string } | null> {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();
    const supabase = createSupabase(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase.auth.getUser(token);
    return data.user ? { supabase, userId: data.user.id } : null;
  }
  const supabase = await createCookieClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, userId: data.user.id } : null;
}

/** Datos reales guardados por la persona. Nada de esto lo deduce ni lo inventa la IA. */
async function loadContext(supabase: SupabaseClient, userId: string): Promise<UserContext> {
  const [profile, procedures, items, reminders] = await Promise.all([
    supabase.from("profiles").select("display_name, country_of_origin, city, permit_type, permit_expiry, has_children, preferred_language, consent_personalization").eq("id", userId).maybeSingle(),
    supabase.from("procedures").select("id, guide_slug, status").order("updated_at", { ascending: false }).limit(10),
    supabase.from("procedure_items").select("procedure_id, kind, idx"),
    supabase.from("reminders").select("title, due_date").eq("done", false).order("due_date").limit(5),
  ]);
  const p = profile.data;
  const ctx: UserContext = { language: p?.preferred_language ?? undefined, name: p?.display_name ?? undefined };
  if (p?.consent_personalization) {
    ctx.profile = { country_of_origin: p.country_of_origin, city: p.city, permit_type: p.permit_type, permit_expiry: p.permit_expiry, has_children: p.has_children };
  }
  ctx.procedures = (procedures.data ?? []).flatMap((proc) => {
    const guide = getGuide(proc.guide_slug);
    if (!guide) return [];
    const done = (items.data ?? []).filter((i) => i.procedure_id === proc.id);
    const stepsDone = done.filter((i) => i.kind === "step" && i.idx < guide.steps.length).map((i) => i.idx);
    const next = guide.steps.findIndex((_, n) => !stepsDone.includes(n));
    return [
      {
        guide: proc.guide_slug,
        title: guide.title.en,
        status: proc.status as string,
        steps_done: stepsDone.length,
        steps_total: guide.steps.length,
        documents_ready: done.filter((i) => i.kind === "document" && i.idx < guide.documents.length).length,
        documents_total: guide.documents.length,
        next_step: next >= 0 ? guide.steps[next].title.en : null,
      },
    ];
  });
  ctx.reminders = (reminders.data ?? []) as { title: string; due_date: string }[];
  return ctx;
}

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  const headers = cors(req);
  const json = (body: unknown, status: number) => Response.json(body, { status, headers });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  const auth = await authenticate(req);
  if (!auth) return json({ error: "login_required" }, 401);
  if (!rateLimit(`assistant:${auth.userId}`, 12, 60_000)) return json({ error: "rate_limited" }, 429);

  // Sin clave del proveedor no cobramos nada.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return json({ error: "not_ready" }, 503);

  const spend = await auth.supabase.rpc("spend_ai_credit");
  if (spend.error) return json({ error: "not_ready" }, 503); // la migración de créditos aún no está ejecutada
  const remaining = spend.data as number;
  if (remaining < 0) return json({ error: "no_credits" }, 402);

  const context = await loadContext(auth.supabase, auth.userId);
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: userContextBlock(context) },
    ],
    messages: body.messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sent = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\n(No puedo ayudar con esta petición. / I can't help with this request.)"));
      } catch (err) {
        console.error("assistant_error", err instanceof Anthropic.APIError ? err.status : err);
        // Si la IA falló sin responder nada, devolvemos el crédito (solo posible con la clave de servidor).
        if (!sent) await refund(auth.userId);
        controller.enqueue(encoder.encode("\n\n⚠️ Error. Inténtalo de nuevo en un momento. / Please try again shortly."));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { ...headers, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Credits-Remaining": String(remaining) },
  });
}

async function refund(userId: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return;
  try {
    const admin = createSupabase(SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await admin.rpc("grant_ai_credits", { p_user: userId, p_amount: 1, p_reason: "refund", p_ref: null });
  } catch (e) {
    console.error("refund_failed", e);
  }
}
