/**
 * Ofertas de empleo por ciudad (sección «Empleo» de la app).
 * Cada mañana /api/jobs/refresh las pide a Adzuna (API oficial y gratuita) y las guarda en `job_offers`.
 * Aquí solo está la parte pura: qué ciudades, qué URL y cómo limpiar cada oferta antes de guardarla.
 */

/** Las 15 ciudades de la app (mismas que `IT_CITIES` en mobile/src/content/modules/consulates.ts). */
export const JOB_CITIES = ["Milano", "Roma", "Torino", "Genova", "Bologna", "Firenze", "Venezia", "Verona", "Brescia", "Bergamo", "Napoli", "Bari", "Palermo", "Cagliari", "Perugia"];

/** Días que se guardan las ofertas antes de borrarse. */
export const KEEP_DAYS = 14;

export type JobRow = {
  id: string;
  city: string;
  title: string;
  company: string | null;
  area: string | null;
  contract_type: string | null;
  contract_time: string | null;
  category: string | null;
  url: string;
  posted_at: string;
};

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs/it/search/1";

export function adzunaUrl(city: string, appId: string, appKey: string, base = ADZUNA_BASE): string {
  const u = new URL(base);
  u.search = new URLSearchParams({ app_id: appId, app_key: appKey, where: city, results_per_page: "50", max_days_old: "3", sort_by: "date", "content-type": "application/json" }).toString();
  return u.toString();
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

/** Texto plano: sin etiquetas HTML, entidades resueltas, espacios simples y longitud máxima. */
function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v
    .replace(/<[^>]*>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
  return s || null;
}

const field = (o: unknown, k: string): unknown => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined);
const oneOf = (v: unknown, allowed: string[]) => (typeof v === "string" && allowed.includes(v) ? v : null);

/** Convierte una oferta de Adzuna en una fila de `job_offers`, o null si le falta algo imprescindible. */
export function toJobRow(raw: unknown, city: string): JobRow | null {
  if (!raw || typeof raw !== "object") return null;
  const id = field(raw, "id");
  const title = clean(field(raw, "title"), 200);
  const url = field(raw, "redirect_url");
  const created = field(raw, "created");
  const when = typeof created === "string" ? new Date(created) : null;
  if ((typeof id !== "string" && typeof id !== "number") || !String(id).trim() || !title) return null;
  if (typeof url !== "string" || !url.startsWith("https://") || url.length > 2000) return null;
  if (!when || Number.isNaN(when.getTime())) return null;
  return {
    id: `adzuna:${String(id).trim().slice(0, 64)}`,
    city,
    title,
    company: clean(field(field(raw, "company"), "display_name"), 120),
    area: clean(field(field(raw, "location"), "display_name"), 120),
    contract_type: oneOf(field(raw, "contract_type"), ["permanent", "contract"]),
    contract_time: oneOf(field(raw, "contract_time"), ["full_time", "part_time"]),
    category: clean(field(field(raw, "category"), "label"), 80),
    url,
    posted_at: when.toISOString(),
  };
}
