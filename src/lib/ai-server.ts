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
        console.error("ai_error", err instanceof Anthropic.APIError ? err.status : err);
        if (!sent) await refund(userId);
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
