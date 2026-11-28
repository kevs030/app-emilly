import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { refreshJobs } from "@/lib/jobs-refresh";
import { SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** ¿La petición trae el secreto de la tarea programada? (Vercel lo envía solo en las llamadas de su cron.) */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const a = Buffer.from(req.headers.get("authorization") ?? "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Tarea diaria (vercel.json → crons, 6:00 UTC): descarga de Adzuna las ofertas de las 15 ciudades,
 * las guarda en `job_offers` y borra las de más de 14 días.
 */
export async function GET(req: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401, headers });
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!appId || !appKey || !service) return Response.json({ error: "not_configured" }, { status: 503, headers });

  const db = createClient(SUPABASE_URL, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await refreshJobs({
    appId,
    appKey,
    base: process.env.ADZUNA_BASE || undefined,
    getJson: async (url) => {
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000), cache: "no-store" });
      if (!res.ok) throw new Error(`adzuna ${res.status}`);
      return res.json();
    },
    upsert: async (rows) => {
      const { error } = await db.from("job_offers").upsert(rows.map((r) => ({ ...r, fetched_at: new Date().toISOString() })), { onConflict: "id" });
      if (error) throw error;
    },
    deleteBefore: async (iso) => {
      const { error } = await db.from("job_offers").delete().lt("posted_at", iso);
      if (error) throw error;
    },
  });
  return Response.json(result, { status: result.ok ? 200 : 502, headers });
}
