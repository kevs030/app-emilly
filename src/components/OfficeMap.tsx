"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocateFixed, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MIRRORS, overpassBody, toPoints, type OsmElement, type Point } from "@/lib/overpass";

type Lang = "es" | "en" | "it";

export const CATEGORIES = [
  { id: "questura", color: "#1d4ed8", es: "Questura (permisos)", en: "Questura (permits)", it: "Questura" },
  { id: "entrate", color: "#0f766e", es: "Agenzia delle Entrate", en: "Agenzia delle Entrate", it: "Agenzia delle Entrate" },
  { id: "ayuda", color: "#be185d", es: "Ayuda a migrantes", en: "Migrant support", it: "Aiuto ai migranti" },
  { id: "patronato", color: "#b45309", es: "Patronatos y CAF (gratis)", en: "Patronati & CAF (free)", it: "Patronati e CAF" },
  { id: "inps", color: "#6d28d9", es: "INPS", en: "INPS", it: "INPS" },
  { id: "prefettura", color: "#475569", es: "Prefectura", en: "Prefecture", it: "Prefettura" },
] as const;
type CatId = (typeof CATEGORIES)[number]["id"];

const T = {
  es: { city: "Ciudad o dirección (ej. Milano)", search: "Buscar", near: "Cerca de mí", loading: "Cargando puntos…", failed: "Para verlos, busca tu ciudad arriba. No se cargaron para toda Italia:", nearest: "Los más cercanos al centro del mapa", directions: "Cómo llegar", none: "Activa una categoría para ver puntos.", notFound: "No encontramos ese lugar.", geoErr: "No pudimos obtener tu ubicación.", points: "puntos" },
  en: { city: "City or address (e.g. Milano)", search: "Search", near: "Near me", loading: "Loading points…", failed: "To see them, search your city above. Not loaded for all of Italy:", nearest: "Closest to the map centre", directions: "Directions", none: "Turn on a category to see points.", notFound: "We couldn't find that place.", geoErr: "We couldn't get your location.", points: "points" },
  it: { city: "Città o indirizzo (es. Milano)", search: "Cerca", near: "Vicino a me", loading: "Caricamento…", failed: "Per vederli cerca la tua città. Non caricati per tutta Italia:", nearest: "I più vicini al centro della mappa", directions: "Indicazioni", none: "Attiva una categoria per vedere i punti.", notFound: "Luogo non trovato.", geoErr: "Posizione non disponibile.", points: "punti" },
};

const NOMINATIM_TERM: Record<CatId, string> = { questura: "Questura", entrate: "Agenzia delle Entrate", ayuda: "Caritas", patronato: "Patronato", inps: "INPS", prefettura: "Prefettura" };

const CACHE_DAYS = 7;

async function loadCategory(cat: CatId): Promise<Point[]> {
  const key = `emilly:points:${cat}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? "null") as { at: number; points: Point[] } | null;
    if (cached && Date.now() - cached.at < CACHE_DAYS * 86_400_000 && cached.points.length) return cached.points;
  } catch {
    // caché ilegible: se vuelve a pedir
  }
  let points: Point[] = [];
  try {
    const res = await fetch(`/api/points?cat=${cat}`, { signal: AbortSignal.timeout(9_000) });
    if (res.ok) points = ((await res.json()) as { points: Point[] }).points;
  } catch {
    // seguimos con el plan B
  }
  // Plan B: el navegador consulta OpenStreetMap directamente (los servidores públicos lo permiten).
  for (const mirror of points.length ? [] : MIRRORS) {
    try {
      const res = await fetch(mirror, { method: "POST", body: overpassBody(cat)!, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) continue;
      points = toPoints(((await res.json()) as { elements?: OsmElement[] }).elements ?? []);
      if (points.length) break;
    } catch {
      // probamos el siguiente servidor
    }
  }
  if (!points.length) throw new Error("unavailable");
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), points }));
  } catch {
    // sin espacio: seguimos sin caché
  }
  return points;
}

function directionsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

/** Popup construido con nodos DOM y textContent: los nombres de OpenStreetMap nunca se interpretan como HTML. */
function popupNode(p: Point, label: string, directions: string) {
  const box = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = p[2];
  const cat = document.createElement("div");
  cat.textContent = label;
  cat.style.opacity = "0.7";
  box.append(name, cat);
  if (p[3]) {
    const addr = document.createElement("div");
    addr.textContent = p[3];
    box.append(addr);
  }
  const a = document.createElement("a");
  a.href = directionsUrl(p[0], p[1]);
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = directions;
  box.append(a);
  return box;
}

function PointsLayer({ data, active, lang }: { data: Partial<Record<CatId, Point[]>>; active: CatId[]; lang: Lang }) {
  const map = useMap();
  const groups = useRef<Partial<Record<CatId, L.LayerGroup>>>({});
  const built = useRef<Partial<Record<CatId, Point[]>>>({});
  useEffect(() => {
    const renderer = L.canvas({ padding: 0.5 });
    for (const c of CATEGORIES) {
      const points = data[c.id];
      const on = active.includes(c.id);
      if (points && built.current[c.id] !== points && groups.current[c.id]) {
        map.removeLayer(groups.current[c.id]!);
        delete groups.current[c.id];
      }
      if (on && points && !groups.current[c.id]) {
        const group = L.layerGroup();
        for (const p of points) {
          L.circleMarker([p[0], p[1]], { renderer, radius: 7, color: "#ffffff", weight: 1.5, fillColor: c.color, fillOpacity: 0.9 })
            .bindPopup(() => popupNode(p, c[lang], T[lang].directions))
            .addTo(group);
        }
        groups.current[c.id] = group;
        built.current[c.id] = points;
      }
      const group = groups.current[c.id];
      if (group) {
        if (on && !map.hasLayer(group)) group.addTo(map);
        if (!on && map.hasLayer(group)) map.removeLayer(group);
      }
    }
  }, [map, data, active, lang]);
  return null;
}

function CenterWatcher({ onMove }: { onMove: (c: [number, number], zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => onMove([map.getCenter().lat, map.getCenter().lng], map.getZoom()),
  });
  return null;
}

function FlyTo({ target }: { target: { center: [number, number]; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target.center, target.zoom, { duration: 0.8 });
  }, [map, target]);
  return null;
}

function km(a: [number, number], b: [number, number]) {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLon = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export default function OfficeMap({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [active, setActive] = useState<CatId[]>(["questura", "entrate", "ayuda"]);
  const [data, setData] = useState<Partial<Record<CatId, Point[]>>>({});
  const [loading, setLoading] = useState<CatId[]>([]);
  const [failed, setFailed] = useState<CatId[]>([]);
  const [center, setCenter] = useState<[number, number]>([42.3, 12.6]);
  const [zoom, setZoom] = useState(6);
  const [target, setTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState("");
  const requested = useRef(new Set<CatId>());

  useEffect(() => {
    for (const cat of active) {
      if (requested.current.has(cat)) continue;
      requested.current.add(cat);
      setLoading((l) => [...l, cat]);
      loadCategory(cat)
        .then((points) => setData((d) => ({ ...d, [cat]: points })))
        .catch(() => {
          requested.current.delete(cat);
          setFailed((f) => (f.includes(cat) ? f : [...f, cat]));
        })
        .finally(() => setLoading((l) => l.filter((x) => x !== cat)));
    }
  }, [active]);

  const onMove = useCallback((c: [number, number], z: number) => {
    setCenter(c);
    setZoom(z);
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (city.trim().length < 2) return;
    setMsg("");
    try {
      const params = new URLSearchParams({ q: city.trim(), format: "jsonv2", countrycodes: "it", limit: "1" });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { "Accept-Language": "it" } });
      const hits = (await res.json()) as { lat: string; lon: string }[];
      if (!hits.length) return setMsg(s.notFound);
      setTarget({ center: [Number(hits[0].lat), Number(hits[0].lon)], zoom: 13 });
      // Plan C: si una categoría no se pudo cargar para toda Italia, buscamos sus oficinas en esta ciudad.
      for (const cat of active.filter((c) => !data[c]?.length)) {
        await new Promise((r) => setTimeout(r, 1100)); // Nominatim: máximo 1 petición por segundo
        const q = new URLSearchParams({ q: `${NOMINATIM_TERM[cat]} ${city.trim()}`, format: "jsonv2", countrycodes: "it", limit: "20" });
        const r = await fetch(`https://nominatim.openstreetmap.org/search?${q}`, { headers: { "Accept-Language": "it" } });
        const found = (await r.json()) as { lat: string; lon: string; name?: string; display_name: string }[];
        const points: Point[] = found.map((f) => [Number(f.lat), Number(f.lon), (f.name || NOMINATIM_TERM[cat]).slice(0, 120), f.display_name.slice(0, 160)]);
        if (points.length) {
          setData((d) => ({ ...d, [cat]: [...(d[cat] ?? []), ...points] }));
          setFailed((f) => f.filter((x) => x !== cat));
        }
      }
    } catch {
      setMsg(s.notFound);
    }
  }

  function nearMe() {
    setMsg("");
    if (!navigator.geolocation) return setMsg(s.geoErr);
    navigator.geolocation.getCurrentPosition(
      (pos) => setTarget({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 13 }),
      () => setMsg(s.geoErr),
      { timeout: 10_000 },
    );
  }

  const nearest =
    zoom >= 9
      ? active
          .flatMap((cat) => (data[cat] ?? []).map((p) => ({ p, cat, d: km(center, [p[0], p[1]]) })))
          .sort((a, b) => a.d - b.d)
          .slice(0, 8)
      : [];

  return (
    <div className="space-y-3">
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <input className="input" placeholder={s.city} value={city} maxLength={80} onChange={(e) => setCity(e.target.value)} />
        <button className="btn">
          <Search size={18} aria-hidden /> {s.search}
        </button>
        <button type="button" className="btn-ghost" onClick={nearMe}>
          <LocateFixed size={18} aria-hidden /> {s.near}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = active.includes(c.id);
          const count = data[c.id]?.length;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              className="chip"
              onClick={() => {
                setFailed((f) => f.filter((x) => x !== c.id));
                setActive((a) => (on ? a.filter((x) => x !== c.id) : [...a, c.id]));
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              {c[lang]}
              {on && count !== undefined && <span className="text-xs opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      <p className="min-h-5 text-sm text-muted" aria-live="polite">
        {loading.length > 0 && s.loading}
        {failed.length > 0 && ` ${s.failed} ${failed.map((f) => CATEGORIES.find((c) => c.id === f)?.[lang]).join(", ")}.`}
        {msg && ` ${msg}`}
        {active.length === 0 && s.none}
      </p>

      <div className="h-[460px] overflow-hidden rounded-2xl border border-border">
        <MapContainer center={[42.3, 12.6]} zoom={6} minZoom={5} className="h-full w-full" scrollWheelZoom preferCanvas>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <PointsLayer data={data} active={active} lang={lang} />
          <CenterWatcher onMove={onMove} />
          <FlyTo target={target} />
        </MapContainer>
      </div>

      {nearest.length > 0 && (
        <section>
          <h2 className="font-semibold">{s.nearest}</h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {nearest.map(({ p, cat, d }) => {
              const c = CATEGORIES.find((x) => x.id === cat)!;
              return (
                <li key={`${cat}-${p[0]}-${p[1]}`} className="card py-3 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                    {p[2]}
                  </p>
                  <p className="text-muted">
                    {c[lang]} · {d < 10 ? d.toFixed(1) : Math.round(d)} km{p[3] ? ` · ${p[3]}` : ""}
                  </p>
                  <a className="text-brand underline" href={directionsUrl(p[0], p[1])} target="_blank" rel="noopener noreferrer">
                    {s.directions}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
