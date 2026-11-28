import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { createClient as createSupabase, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/config";

/**
 * «Ver un anuncio = 1 pregunta extra» con los anuncios propios (tabla `sponsors`).
 *
 * Cómo se evita el fraude:
 * - El servidor entrega un justificante firmado (HMAC) con la cuenta, el anuncio y la hora.
 * - Solo se cobra si han pasado al menos REWARD_SECONDS desde esa hora, y antes de que caduque.
 * - Cada justificante vale una vez: `grant_ai_credits` rechaza una referencia repetida.
 * - Límite de DAILY_LIMIT premios por cuenta en 24 horas, contado en el libro de créditos.
 * La app no puede darse créditos: solo este servidor, con la clave de servidor, llama a `grant_ai_credits`.
 */

import { DAILY_LIMIT, signToken, verifyToken, type AdToken } from "./ads-token";
export { claimable, DAILY_LIMIT, REWARD_SECONDS } from "./ads-token";

function secret(): Buffer | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // La firma se deriva de la clave de servidor: no hace falta otro secreto en Vercel.
  return key ? createHmac("sha256", "aposto-ads-v1").update(key).digest() : null;
}

export function adsConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function admin(): SupabaseClient {
  return createSupabase(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Premios por anuncio que le quedan hoy a la persona (ventana de 24 horas). */
export async function rewardsLeft(userId: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count, error } = await admin().from("ai_credit_ledger").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("reason", "ad_reward").gte("created_at", since);
  if (error) throw error;
  return Math.max(0, DAILY_LIMIT - (count ?? 0));
}

export type SponsorAd = { id: number; title: string; body: string; cta: string };

export async function pickSponsor(): Promise<SponsorAd | null> {
  const { data, error } = await admin().from("sponsors").select("id, title, body, cta").eq("active", true).limit(50);
  if (error || !data?.length) return null;
  return data[Math.floor(Math.random() * data.length)] as SponsorAd;
}

export function newToken(userId: string, sponsorId: number): string | null {
  const key = secret();
  return key ? signToken({ u: userId, s: sponsorId, n: randomUUID(), t: Date.now() }, key) : null;
}

export function readToken(token: string): AdToken | null {
  const key = secret();
  return key ? verifyToken(token, key) : null;
}

let atomicAvailable = true;

/**
 * Suma 1 pregunta. Devuelve el saldo nuevo, o el motivo por el que no se dio.
 * Usa `claim_ad_reward` (migración 0011): cuenta los premios del día y concede el nuevo en un solo paso
 * bloqueado, así que varios cobros a la vez no pueden superar DAILY_LIMIT.
 * Si la migración aún no está aplicada, usa el método anterior (que la ruta protege como puede).
 */
export async function claimReward(p: AdToken): Promise<{ granted: true; credits: number | null } | { granted: false; reason: "daily_limit" | "already_claimed" }> {
  const ref = `sponsor:${p.s}:${p.n}`;
  if (atomicAvailable) {
    const { data, error } = await admin().rpc("claim_ad_reward", { p_user: p.u, p_ref: ref, p_daily_limit: DAILY_LIMIT });
    if (!error) {
      if (data === -1) return { granted: false, reason: "daily_limit" };
      if (data === -2) return { granted: false, reason: "already_claimed" };
      return { granted: true, credits: typeof data === "number" ? data : null };
    }
    // PGRST202 = la función no existe todavía: no se vuelve a intentar hasta reiniciar el servidor.
    if (error.code !== "PGRST202") throw error;
    atomicAvailable = false;
    console.warn("claim_ad_reward_missing: aplica supabase/migrations/0011_premios_atomicos.sql");
  }
  const { granted, credits } = await grantRewardLegacy(p);
  return granted ? { granted: true, credits } : { granted: false, reason: "already_claimed" };
}

/** Método anterior (sin bloqueo). Solo se usa mientras falte la migración 0011. */
async function grantRewardLegacy(p: AdToken): Promise<{ granted: boolean; credits: number | null }> {
  const db = admin();
  const { data, error } = await db.rpc("grant_ai_credits", { p_user: p.u, p_amount: 1, p_reason: "ad_reward", p_ref: `sponsor:${p.s}:${p.n}` });
  if (error) throw error;
  const wallet = await db.from("ai_wallets").select("credits").eq("user_id", p.u).maybeSingle();
  return { granted: data === true, credits: (wallet.data?.credits as number | undefined) ?? null };
}
