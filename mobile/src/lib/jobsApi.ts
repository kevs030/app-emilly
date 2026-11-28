import { supabase } from "./supabase";
import type { Job } from "./jobs";

/** Ofertas de la ciudad de los últimos 14 días (más recientes primero). null si no se pudieron cargar. */
export async function loadJobs(city: string): Promise<Job[] | null> {
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("job_offers")
    .select("id, city, title, company, area, contract_type, contract_time, category, url, posted_at")
    .eq("city", city)
    .gte("posted_at", since)
    .order("posted_at", { ascending: false })
    .limit(300);
  return error || !data ? null : (data as Job[]).filter((j) => j.url?.startsWith("https://"));
}

/** Cuántas ofertas se publicaron hoy en la ciudad (para la tarjeta del inicio). 0 si falla. */
export async function countToday(city: string): Promise<number> {
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
  const { count, error } = await supabase.from("job_offers").select("id", { count: "exact", head: true }).eq("city", city).gte("posted_at", start);
  return error ? 0 : count ?? 0;
}
