import { JOB_CITY_INFO } from "~/content/modules/jobs";

/** Oferta tal como está en la tabla `job_offers` (ver supabase/migrations/0010_ofertas_empleo.sql). */
export type Job = {
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

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/** La ciudad del perfil («milán», «Milano (MI)»…) convertida a una de las 15 ciudades con ofertas, o null. */
export function matchCity(text?: string | null): string | null {
  if (!text) return null;
  const t = norm(text);
  if (!t) return null;
  for (const c of JOB_CITY_INFO) {
    for (const a of c.aliases) {
      const n = norm(a);
      if (t === n || t.startsWith(n + " ") || t.startsWith(n + ",") || t.startsWith(n + "(")) return c.city;
    }
  }
  return null;
}

/** «Nuevas hoy» = publicadas hoy (día del teléfono); «Esta semana» = los 7 días anteriores. */
export function splitJobs(jobs: Job[], now = new Date()): { today: Job[]; week: Job[] } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = start - 7 * 86_400_000;
  const sorted = [...jobs].sort((a, b) => b.posted_at.localeCompare(a.posted_at));
  return {
    today: sorted.filter((j) => Date.parse(j.posted_at) >= start),
    week: sorted.filter((j) => { const t = Date.parse(j.posted_at); return t < start && t >= weekStart; }),
  };
}

export function filterJobs(jobs: Job[], q: string): Job[] {
  const n = norm(q);
  if (!n) return jobs;
  return jobs.filter((j) => norm(`${j.title} ${j.company ?? ""} ${j.area ?? ""}`).includes(n));
}

// ── Ofertas guardadas: solo en este teléfono ──
const SAVED_KEY = "aposto:jobs:saved";
const MAX_SAVED = 100;

export function savedJobs(): Job[] {
  try {
    const v = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((j) => j && typeof j.id === "string" && typeof j.url === "string" && j.url.startsWith("https://")) : [];
  } catch {
    return [];
  }
}
export function isSaved(id: string): boolean {
  return savedJobs().some((j) => j.id === id);
}
/** Guarda o quita. Devuelve true si queda guardada. */
export function toggleSaved(job: Job): boolean {
  const list = savedJobs();
  const on = !list.some((j) => j.id === job.id);
  const next = on ? [job, ...list].slice(0, MAX_SAVED) : list.filter((j) => j.id !== job.id);
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {
    /* sin almacenamiento */
  }
  return on;
}

// ── Ciudad elegida (para quien no tiene ciudad en el perfil) ──
const CITY_KEY = "aposto:jobs:city";
export function chosenCity(): string | null {
  try {
    return matchCity(localStorage.getItem(CITY_KEY));
  } catch {
    return null;
  }
}
export function chooseCity(city: string) {
  try {
    localStorage.setItem(CITY_KEY, city);
  } catch {
    /* sin almacenamiento */
  }
}
