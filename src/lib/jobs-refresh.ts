import { adzunaUrl, JOB_CITIES, KEEP_DAYS, toJobRow, type JobRow } from "./jobs";

export type RefreshDeps = {
  /** Descarga una URL y devuelve el JSON (lanza si falla). */
  getJson: (url: string) => Promise<unknown>;
  /** Guarda (o actualiza) las filas por id. */
  upsert: (rows: JobRow[]) => Promise<void>;
  /** Borra las ofertas publicadas antes de esta fecha (ISO). */
  deleteBefore: (iso: string) => Promise<void>;
  appId: string;
  appKey: string;
  base?: string;
  now?: Date;
};

export type RefreshResult = { ok: boolean; saved: number; failed: string[] };

/**
 * Actualiza las ofertas de todas las ciudades. Un fallo en una ciudad no para las demás.
 * Las ofertas antiguas solo se borran si al menos una ciudad trajo datos: si Adzuna está caído,
 * la app sigue mostrando las de los días anteriores.
 */
export async function refreshJobs(d: RefreshDeps): Promise<RefreshResult> {
  let saved = 0;
  const failed: string[] = [];
  for (const city of JOB_CITIES) {
    try {
      const data = await d.getJson(adzunaUrl(city, d.appId, d.appKey, d.base));
      const results = data && typeof data === "object" ? (data as { results?: unknown }).results : null;
      if (!Array.isArray(results)) throw new Error("sin resultados");
      const rows = new Map<string, JobRow>();
      for (const r of results) {
        const row = toJobRow(r, city);
        if (row) rows.set(row.id, row);
      }
      if (rows.size) await d.upsert([...rows.values()]);
      saved += rows.size;
    } catch {
      failed.push(city);
    }
  }
  if (failed.length < JOB_CITIES.length) {
    const limit = new Date((d.now ?? new Date()).getTime() - KEEP_DAYS * 86_400_000).toISOString();
    await d.deleteBefore(limit);
  }
  return { ok: failed.length < JOB_CITIES.length, saved, failed };
}
