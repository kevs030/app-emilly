import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getGuide } from "@/content/guides";
import { SYSTEM_PROMPT, userContextBlock, type UserContext } from "@/lib/assistant-prompt";
import { rateLimit } from "@/lib/rate-limit";
import { aiKeyPresent, authenticate, cors, streamAnswer } from "@/lib/ai-server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Asistente de A posto. Cada pregunta gasta 1 crédito de la persona (ver migración 0005).
 * - Exige cuenta: por cookie (web) o por token en la cabecera Authorization (app móvil).
 * - El crédito se descuenta en la base de datos ANTES de llamar a la IA y de forma atómica.
 * - El proveedor y el modelo se eligen en `lib/ai-server.ts`, en un solo sitio.
 */
const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) }))
    .min(1)
    .max(30)
    .refine((m) => m[m.length - 1].role === "user", "last message must be from the user")
    .refine((m) => m[0].role === "user", "first message must be from the user")
    .refine((m) => m.every((x, i) => i === 0 || x.role !== m[i - 1].role), "roles must alternate"),
});

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
  if (!aiKeyPresent()) return json({ error: "not_ready", reason: "ai_key_missing" }, 503);

  const spend = await auth.supabase.rpc("spend_ai_credit");
  if (spend.error) return json({ error: "not_ready", reason: "credits_db" }, 503); // la migración de créditos aún no está ejecutada
  const remaining = spend.data as number;
  if (remaining < 0) return json({ error: "no_credits" }, 402);

  const context = await loadContext(auth.supabase, auth.userId);
  return streamAnswer({
    userId: auth.userId,
    headers,
    remaining,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: userContextBlock(context) },
    ],
    messages: body.messages,
  });
}
