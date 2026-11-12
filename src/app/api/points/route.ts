import { MIRRORS, overpassBody, toPoints, type OsmElement } from "@/lib/overpass";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Puntos de toda Italia por categoría. La respuesta se guarda 7 días en la caché de Vercel (CDN):
 * Overpass recibe, como mucho, una petición por categoría a la semana.
 * Si ningún servidor de Overpass responde, el navegador hace la consulta por su cuenta (OfficeMap).
 */
export async function GET(req: Request) {
  const cat = new URL(req.url).searchParams.get("cat") ?? "";
  const body = overpassBody(cat);
  if (!body) return Response.json({ error: "unknown_category" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`points:${ip}`, 30, 60_000)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const tried: string[] = [];
  for (const mirror of MIRRORS) {
    const host = new URL(mirror).host;
    try {
      const res = await fetch(mirror, {
        method: "POST",
        body,
        headers: { "User-Agent": "emilly-app (https://app-emilly.vercel.app)" },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      if (!res.ok) {
        tried.push(`${host}:${res.status}`);
        continue;
      }
      const json = (await res.json()) as { elements?: OsmElement[] };
      const points = toPoints(json.elements ?? []);
      if (points.length === 0) {
        tried.push(`${host}:empty`);
        continue;
      }
      return Response.json(
        { cat, updated: new Date().toISOString().slice(0, 10), points },
        { headers: { "Cache-Control": "public, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000" } },
      );
    } catch (e) {
      tried.push(`${host}:${(e as Error).name}`);
    }
  }
  return Response.json({ error: "unavailable", tried }, { status: 502, headers: { "Cache-Control": "no-store" } });
}
