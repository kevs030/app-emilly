/**
 * Consultas a Overpass (OpenStreetMap, licencia ODbL) compartidas por el servidor y el navegador.
 * Italia como rectángulo (sur, oeste, norte, este): mucho más rápido que buscar por área.
 * Incluye zonas fronterizas de países vecinos; el filtro por nombre italiano las descarta casi todas.
 */
const BBOX = "(35.4,6.6,47.1,18.6)";

// Cada consulta empieza por una etiqueta exacta (indexada) y solo después filtra por nombre.
export const QUERIES: Record<string, string> = {
  questura: `nwr["amenity"="police"]["name"~"^Questura"]${BBOX};`,
  entrate: `nwr["office"="government"]["name"~"Agenzia delle Entrate"]["name"!~"Riscossione"]${BBOX};nwr["office"="tax"]["name"~"Agenzia delle Entrate"]${BBOX};`,
  prefettura: `nwr["office"="government"]["name"~"^Prefettura"]${BBOX};`,
  inps: `nwr["office"="government"]["name"~"^INPS"]${BBOX};nwr["office"="government"]["operator"="INPS"]${BBOX};`,
  patronato: `nwr["office"]["name"~"^Patronato|^CAF |^CAAF "]${BBOX};`,
  ayuda: `nwr["social_facility:for"~"migrant|refugee"]${BBOX};nwr["amenity"="social_facility"]["name"~"Immigra|Stranieri|Caritas"]${BBOX};`,
};

export const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

export const MIRROR_ORIGINS = MIRRORS.map((m) => new URL(m).origin);

export function overpassBody(cat: string): URLSearchParams | null {
  const query = QUERIES[cat];
  return query ? new URLSearchParams({ data: `[out:json][timeout:25];(${query});out center tags;` }) : null;
}

export type OsmElement = { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
/** [lat, lon, nombre, dirección] */
export type Point = [number, number, string, string];

export function toPoints(elements: OsmElement[]): Point[] {
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
    out.push([Number(lat.toFixed(5)), Number(lon.toFixed(5)), String(tags.name).slice(0, 120), address.slice(0, 160)]);
  }
  return out;
}
