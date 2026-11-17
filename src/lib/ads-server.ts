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

/** Suma 1 pregunta. false si este justificante ya se cobró. Devuelve el saldo nuevo. */
export async function grantReward(p: AdToken): Promise<{ granted: boolean; credits: number | null }> {
  const db = admin();
  const { data, error } = await db.rpc("grant_ai_credits", { p_user: p.u, p_amount: 1, p_reason: "ad_reward", p_ref: `sponsor:${p.s}:${p.n}` });
  if (error) throw error;
  const wallet = await db.from("ai_wallets").select("credits").eq("user_id", p.u).maybeSingle();
  return { granted: data === true, credits: (wallet.data?.credits as number | undefined) ?? null };
}
