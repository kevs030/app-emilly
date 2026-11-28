import { z } from "zod";
import { adsConfigured, claimable, claimReward, DAILY_LIMIT, newToken, pickSponsor, readToken, REWARD_SECONDS, rewardsLeft } from "@/lib/ads-server";
import { authenticate, cors } from "@/lib/ai-server";
import { rateLimitShared } from "@/lib/rate-limit";

/**
 * Anuncio con recompensa: ver un anuncio propio durante REWARD_SECONDS segundos = 1 pregunta al asistente.
 *   { action: "status" }        → ¿hay anuncio disponible y cuántos premios quedan hoy?
 *   { action: "start" }         → un anuncio y su justificante firmado
 *   { action: "claim", token }  → cobra el premio si el justificante es válido y ya pasó el tiempo
 */
const Body = z.discriminatedUnion("action", [z.object({ action: z.literal("status") }), z.object({ action: z.literal("start") }), z.object({ action: z.literal("claim"), token: z.string().min(20).max(600) })]);

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  const headers = cors(req);
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  const auth = await authenticate(req);
  if (!auth) return json({ error: "login_required" }, 401);
  if (!(await rateLimitShared(`ads:${auth.userId}`, 20, 60_000))) return json({ error: "rate_limited" }, 429);
  // Sin la clave de servidor no se pueden dar premios: la app oculta el botón.
  if (!adsConfigured()) return json({ available: false, reason: "not_configured" });

  try {
    const left = await rewardsLeft(auth.userId);

    if (body.action === "status") {
      const sponsor = left > 0 ? await pickSponsor() : null;
      return json({ available: Boolean(sponsor), left, limit: DAILY_LIMIT, seconds: REWARD_SECONDS });
    }

    if (body.action === "start") {
      if (left <= 0) return json({ error: "daily_limit", left: 0 }, 429);
      const sponsor = await pickSponsor();
      if (!sponsor) return json({ error: "no_ads" }, 404);
      return json({ sponsor, token: newToken(auth.userId, sponsor.id), seconds: REWARD_SECONDS, left });
    }

    const token = readToken(body.token);
    if (!token) return json({ error: "invalid_token" }, 400);
    const state = claimable(token, auth.userId);
    if (state !== "ok") return json({ error: state }, state === "too_soon" ? 425 : 400);
    if (left <= 0) return json({ error: "daily_limit", left: 0 }, 429); // atajo rápido; el límite de verdad lo impone claimReward
    const result = await claimReward(token);
    if (!result.granted) return result.reason === "daily_limit" ? json({ error: "daily_limit", left: 0 }, 429) : json({ error: "already_claimed" }, 409);
    return json({ ok: true, credits: result.credits, left: Math.max(0, left - 1) });
  } catch (e) {
    console.error("ads_failed", e);
    return json({ error: "not_ready" }, 503);
  }
}
