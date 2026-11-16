import Anthropic from "@anthropic-ai/sdk";
import { createClient as createSupabase, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { createClient as createCookieClient } from "@/lib/supabase/server";

/**
 * Piezas comunes de las funciones de IA del servidor (asistente y lector de documentos).
 * La clave del proveedor solo existe aquí, en el servidor: nunca llega al navegador ni a la app.
 */
export const AI_MODEL = "claude-haiku-5-5";

export function aiKeyPresent(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

const anthropic = new Anthropic();

/** Motivo de un fallo del proveedor de IA, sin datos sensibles: sirve para saber qué arreglar. */
export function aiErrorCode(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "invalid_key";
  if (err instanceof Anthropic.PermissionDeniedError) return "no_permission";
  if (err instanceof Anthropic.NotFoundError) return "model_not_found";
  if (err instanceof Anthropic.RateLimitError) return "rate_limited";
  if (err instanceof Anthropic.BadRequestError) return /credit balance/i.test(err.message) ? "no_balance" : "bad_request";
  if (err instanceof Anthropic.APIConnectionError) return "unreachable";
  if (err instanceof Anthropic.APIError) return `error_${err.status ?? "unknown"}`;
  // Error que no viene del proveedor (por ejemplo, una clave con caracteres que no caben en una cabecera).
  const e = err as { name?: unknown; code?: unknown };
  return `local_${String(e?.name ?? "Error")}${e?.code ? `_${String(e.code)}` : ""}`.replace(/[^A-Za-z0-9_]/g, "").slice(0, 60);
}

/** Forma de la clave guardada, sin revelar su contenido: sirve para detectar un pegado incorrecto. */
export function aiKeyShape() {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  return {
    length: key.length,
    starts_with_sk_ant: key.startsWith("sk-ant-"),
    has_spaces_or_line_breaks: /\s/.test(key),
    has_quotes: /["'`]/.test(key),
    has_unusual_characters: /[^A-Za-z0-9_\-\s"'`]/.test(key),
    auth_token_also_set: Boolean(process.env.ANTHROPIC_AUTH_TOKEN),
    base_url_overridden: Boolean(process.env.ANTHROPIC_BASE_URL),
  };
}

let lastCheck: { at: number; status: string } | null = null;

/** Comprueba, sin gastar nada, que la clave es válida y que el modelo está disponible. Se repite como mucho cada minuto. */
export async function aiProviderStatus(): Promise<string> {
  if (!aiKeyPresent()) return "key_missing";
  if (lastCheck && Date.now() - lastCheck.at < 60_000) return lastCheck.status;
  let status = "ok";
  try {
    await anthropic.models.retrieve(AI_MODEL);
  } catch (err) {
    status = aiErrorCode(err);
  }
  lastCheck = { at: Date.now(), status };
  return status;
}

// Orígenes de la app empaquetada (iOS, Android) y de las pruebas locales.
const APP_ORIGINS = new Set(["capacitor://localhost", "https://localhost", "http://localhost", "http://localhost:5173", "http://localhost:4173"]);

export function cors(req: Request): Record<string, string> {
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

/** Cuenta por cookie (web) o por token en la cabecera Authorization (app). */
export async function authenticate(req: Request): Promise<{ supabase: SupabaseClient; userId: string } | null> {
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

/** Devuelve 1 crédito si la IA falló sin responder nada (solo posible con la clave de servidor). */
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

type StreamInput = {
  userId: string;
  headers: Record<string, string>;
  remaining: number;
  system: Anthropic.TextBlockParam[];
  messages: Anthropic.MessageParam[];
  effort?: "low" | "medium";
};

/** Llama al modelo y devuelve la respuesta como texto que va llegando poco a poco. */
export function streamAnswer({ userId, headers, remaining, system, messages, effort = "medium" }: StreamInput): Response {
  const stream = anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort },
    system,
    messages,
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
        const code = aiErrorCode(err);
        console.error("ai_error", code, err instanceof Anthropic.APIError ? err.message : err);
        if (!sent) await refund(userId);
        controller.enqueue(encoder.encode(`\n\n⚠️ Error. Inténtalo de nuevo en un momento. / Please try again shortly. [${code}]`));
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
