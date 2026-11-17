import { createHmac, timingSafeEqual } from "node:crypto";

/** Justificante firmado de «anuncio visto». Lógica pura, sin red: se prueba en tests/ads.test.ts. */

export const REWARD_SECONDS = 15;
export const DAILY_LIMIT = 3;
const TOKEN_TTL_MS = 10 * 60 * 1000;

export type AdToken = { u: string; s: number; n: string; t: number };

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function signToken(p: AdToken, key: Buffer): string {
  const body = b64(JSON.stringify(p));
  return `${body}.${b64(createHmac("sha256", key).update(body).digest())}`;
}

export function verifyToken(token: string, key: Buffer): AdToken | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", key).update(body).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as AdToken;
    return typeof p.u === "string" && Number.isInteger(p.s) && typeof p.n === "string" && Number.isFinite(p.t) ? p : null;
  } catch {
    return null;
  }
}

/** ¿Se puede cobrar ya este justificante? */
export function claimable(p: AdToken, userId: string, now = Date.now()): "ok" | "wrong_user" | "too_soon" | "expired" {
  if (p.u !== userId) return "wrong_user";
  if (now - p.t < REWARD_SECONDS * 1000 - 500) return "too_soon";
  if (now - p.t > TOKEN_TTL_MS) return "expired";
  return "ok";
}
