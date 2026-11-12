import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Puntos de toda Italia por categoría, sacados de OpenStreetMap (licencia ODbL) con Overpass.
 * La respuesta se guarda 7 días en la caché de Vercel (CDN): Overpass recibe, como mucho,
 * una petición por categoría a la semana, y los usuarios reciben los datos al instante.
 */
const AREA = 'area["ISO3166-1"="IT"][admin_level=2]->.it;';
const QUERIES: Record<string, string> = {
  questura: 'nwr["name"~"^Questura",i](area.it);',
  entrate: 'nwr["name"~"Agenzia delle Entrate",i]["name"!~"Riscossione",i](area.it);',
  prefettura: 'nwr["name"~"^Prefettura",i](area.it);',
  inps: 'nwr["office"]["name"~"^INPS",i](area.it);nwr["office"]["operator"~"^INPS$",i](area.it);',
  patronato: 'nwr["office"]["name"~"Patronato|^CAF |^CAAF",i](area.it);',
  ayuda:
    'nwr["social_facility:for"~"migrant|refugee"](area.it);' +
    'nwr["amenity"~"social_facility|community_centre"]["name"~"Sportello Immigra|Centro Immigra|Ufficio Immigra|Ufficio Stranieri|Caritas",i](area.it);' +
    'nwr["office"]["name"~"Sportello Immigra|Ufficio Immigra|Ufficio Stranieri",i](area.it);',
};

const MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

type OsmElement = { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
/** [lat, lon, nombre, dirección] */
export type Point = [number, number, string, string];

function toPoints(elements: OsmElement[]): Point[] {
  const seen = new Set<string>();
  const out: Point[] = [];
  for (const e of elements) {
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    const tags = e.tags ?? {};
    if (typeof lat !== "number" || typeof lon !== "number" || !tags.name) continue;
    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
    const address = [street, tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(", ");
    out.push([Number(lat.toFixed(5)), Number(lon.toFixed(5)), tags.name.slice(0, 120), address.slice(0, 160)]);
  }
  return out;
}

export async function GET(req: Request) {
  const cat = new URL(req.url).searchParams.get("cat") ?? "";
  const query = QUERIES[cat];
  if (!query) return Response.json({ error: "unknown_category" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`points:${ip}`, 30, 60_000)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const body = new URLSearchParams({ data: `[out:json][timeout:25];${AREA}(${query});out center tags;` });
  for (const mirror of MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: "POST",
        body,
        headers: { "User-Agent": "emilly-app (https://app-emilly.vercel.app)" },
        signal: AbortSignal.timeout(18_000),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { elements?: OsmElement[] };
      const points = toPoints(json.elements ?? []);
      if (points.length === 0) continue;
      return Response.json(
        { cat, updated: new Date().toISOString().slice(0, 10), points },
        { headers: { "Cache-Control": "public, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000" } },
      );
    } catch {
      // probamos el siguiente servidor
    }
  }
  return Response.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
}
