import { API_URL, supabase } from "./supabase";

/**
 * Publicidad de A Posto.
 * - Anuncios propios (tabla `sponsors`): textos que vende y publica el administrador. Sin cookies ni
 *   rastreadores: la app solo pide la lista y, al tocar, se cuenta el clic.
 * - «Ver un anuncio = 1 pregunta»: el servidor entrega un justificante firmado y solo da la pregunta si
 *   pasaron los segundos necesarios, con un límite diario.
 */

export type Sponsor = { id: number; title: string; body: string; cta: string };
export type Placement = "home" | "guias" | "foro";

export async function loadSponsors(placement: Placement): Promise<Sponsor[]> {
  const { data, error } = await supabase.from("sponsors").select("id, title, body, cta").eq("active", true).in("placement", [placement, "all"]).limit(20);
  return error || !data ? [] : (data as Sponsor[]);
}

/** Cuenta el clic y abre la web del anunciante en una pestaña nueva. */
export async function openSponsor(id: number): Promise<boolean> {
  const { data } = await supabase.rpc("sponsor_click", { p_id: id });
  if (typeof data !== "string" || !data.startsWith("https://")) return false;
  window.open(data, "_blank", "noopener,noreferrer");
  return true;
}

export type AdStatus = { available: boolean; left: number; limit: number; seconds: number };
export type AdStart = { sponsor: Sponsor; token: string; seconds: number; left: number };

async function call<T>(body: object): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const { data } = await supabase.auth.getSession();
    const res = await fetch(`${API_URL}/api/ads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: string };
    return res.ok && !json.error ? { ok: true, data: json } : { ok: false, error: json.error ?? `http_${res.status}` };
  } catch {
    return { ok: false, error: "offline" };
  }
}

export async function adStatus(): Promise<AdStatus | null> {
  const r = await call<AdStatus>({ action: "status" });
  return r.ok && r.data.available ? r.data : null;
}
export const startAd = () => call<AdStart>({ action: "start" });
export const claimAd = (token: string) => call<{ ok: true; credits: number | null; left: number }>({ action: "claim", token });
