import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SYSTEM_PROMPT, profileBlock, type ProfileContext } from "@/lib/assistant-prompt";
import { rateLimit } from "@/lib/rate-limit";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) }))
    .min(1)
    .max(30)
    .refine((m) => m[m.length - 1].role === "user", "last message must be from the user")
    .refine((m) => m[0].role === "user", "first message must be from the user")
    .refine((m) => m.every((x, i) => i === 0 || x.role !== m[i - 1].role), "roles must alternate"),
});

const client = new Anthropic();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`assistant:${ip}`, 20, 10 * 60 * 1000)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // Personalización solo si el usuario inició sesión Y dio su consentimiento.
  const system: Anthropic.Beta.BetaTextBlockParam[] = [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }];
  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("country_of_origin, city, permit_type, permit_expiry, has_children, preferred_language, consent_personalization")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (profile?.consent_personalization) {
        const ctx: ProfileContext = {
          country_of_origin: profile.country_of_origin,
          city: profile.city,
          permit_type: profile.permit_type,
          permit_expiry: profile.permit_expiry,
          has_children: profile.has_children,
          preferred_language: profile.preferred_language,
        };
        system.push({ type: "text", text: profileBlock(ctx) });
      }
    }
  }

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    // Si el modelo rechaza la petición por política, la API reintenta con un modelo alternativo.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: body.messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n(No puedo ayudar con esta petición. / I can't help with this request.)"));
        }
      } catch (err) {
        console.error("assistant_error", err instanceof Anthropic.APIError ? err.status : err);
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
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
