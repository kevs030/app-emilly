import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocateFixed, Navigation, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MIRRORS, overpassBody, toPoints, type OsmElement, type Point } from "@/lib/overpass";
import { useLang } from "~/lib/lang";
import type { StringKey } from "~/lib/strings";
import { API_URL } from "~/lib/supabase";
import { Alert, Screen } from "~/ui/kit";

const CATEGORIES = [
  { id: "questura", color: "#1d4ed8", name: "Questura" },
  { id: "entrate", color: "#2f6f4f", name: "Agenzia delle Entrate" },
  { id: "patronato", color: "#b45309", name: "Patronato / CAF" },
  { id: "inps", color: "#6d28d9", name: "INPS" },
  { id: "prefettura", color: "#475569", name: "Prefettura" },
  { id: "ayuda", color: "#be185d", name: null },
] as const;
type CatId = (typeof CATEGORIES)[number]["id"];

export function km(a: [number, number], b: [number, number]) {
  const rad = Math.PI / 180;
  const h = Math.sin(((b[0] - a[0]) * rad) / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(((b[1] - a[1]) * rad) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

async function loadCategory(cat: CatId): Promise<Point[]> {
  const key = `aposto:points:${cat}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? "null") as { at: number; points: Point[] } | null;
    if (cached && Date.now() - cached.at < 7 * 86_400_000 && cached.points.length) return cached.points;
  } catch {
    // caché ilegible: se vuelve a pedir
  }
  let points: Point[] = [];
  try {
    const res = await fetch(`${API_URL}/api/points?cat=${cat}`, { signal: AbortSignal.timeout(9_000) });
    if (res.ok) points = ((await res.json()) as { points: Point[] }).points;
  } catch {
    // plan B abajo
  }
  for (const mirror of points.length ? [] : MIRRORS) {
    try {
      const res = await fetch(mirror, { method: "POST", body: overpassBody(cat)!, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) continue;
      points = toPoints(((await res.json()) as { elements?: OsmElement[] }).elements ?? []);
      if (points.length) break;
    } catch {
      // siguiente servidor
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

/** Oficinas cercanas: datos de OpenStreetMap. La ubicación solo se usa en el dispositivo y no se guarda. */
export function OfficesMap() {
  const { t } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const [cat, setCat] = useState<CatId>("questura");
  const [points, setPoints] = useState<Point[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [center, setCenter] = useState<[number, number]>([41.9, 12.5]);
  const [located, setLocated] = useState(false);
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState<StringKey | "">("");
  const info = CATEGORIES.find((c) => c.id === cat)!;
  const label = info.name ?? t("mapSupport");

  useEffect(() => {
    if (!box.current || map.current) return;
    const m = L.map(box.current, { zoomControl: true, attributionControl: true }).setView([41.9, 12.5], 6);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
    m.on("moveend", () => setCenter([m.getCenter().lat, m.getCenter().lng]));
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- estado de carga al cambiar de categoría
    setState("loading");
    loadCategory(cat)
      .then((p) => {
        if (!alive) return;
        setPoints(p);
        setState("ready");
      })
      .catch(() => {
        if (!alive) return;
        setPoints([]);
        setState("failed");
      });
    return () => {
      alive = false;
    };
  }, [cat]);

  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    const renderer = L.canvas({ padding: 0.5 });
    for (const p of points) {
      // textContent: los nombres de OpenStreetMap nunca se interpretan como HTML
      const node = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = p[2];
      node.append(name);
      if (p[3]) {
        const addr = document.createElement("div");
        addr.textContent = p[3];
        node.append(addr);
      }
      L.circleMarker([p[0], p[1]], { renderer, radius: 8, color: "#ffffff", weight: 1.5, fillColor: info.color, fillOpacity: 0.9 }).bindPopup(node).addTo(group);
    }
  }, [points, info.color]);

  const nearest = useMemo(
    () =>
      points
        .map((p) => ({ p, d: km(center, [p[0], p[1]]) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 6),
    [points, center],
  );

  function nearMe() {
    setMsg("");
    if (!navigator.geolocation) return setMsg("mapNoLocation");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocated(true);
        map.current?.setView([pos.coords.latitude, pos.coords.longitude], 13);
      },
      () => setMsg("mapNoLocation"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (city.trim().length < 2) return;
    setMsg("");
    try {
      const q = new URLSearchParams({ q: city.trim(), format: "jsonv2", countrycodes: "it", limit: "1" });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${q}`, { headers: { "Accept-Language": "it" } });
      const hits = (await res.json()) as { lat: string; lon: string }[];
      if (!hits.length) return setMsg("mapNotFound");
      setLocated(true);
      map.current?.setView([Number(hits[0].lat), Number(hits[0].lon)], 13);
    } catch {
      setMsg("offline");
    }
  }

  return (
    <Screen title={t("offices")} back help="map">
      <form onSubmit={search} className="flex gap-2" role="search">
        <input className="input min-w-0 flex-1" aria-label={t("mapCity")} placeholder={t("mapCity")} maxLength={80} value={city} onChange={(e) => setCity(e.target.value)} />
        <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta-deep text-white" aria-label={t("searchTitle")}>
          <Search size={20} aria-hidden />
        </button>
      </form>
      <button type="button" className="btn btn-secondary mt-3" onClick={nearMe}>
        <LocateFixed size={20} aria-hidden /> {t("mapNearMe")}
      </button>
      <p className="hint mt-1">{t("mapLocationHint")}</p>
      {msg && <Alert kind="error">{t(msg)}</Alert>}

      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={t("mapKind")}>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={`min-h-11 shrink-0 rounded-full px-4 text-[14px] font-medium ${cat === c.id ? "bg-terracotta-deep text-white" : "bg-beige"}`}>
            {c.name ?? t("mapSupport")}
          </button>
        ))}
      </div>

      <div ref={box} className="relative z-0 mt-3 h-72 w-full overflow-hidden rounded-2xl bg-beige" aria-label={t("offices")} />

      <section className="mt-4" aria-live="polite">
        {state === "loading" && <p className="text-ink-soft">{t("loading")}</p>}
        {state === "failed" && <p className="card text-ink-soft">{t("mapFailed")}</p>}
        {state === "ready" && (
          <>
            <h2 className="mb-2 font-bold">
              {label} · {t(located ? "mapNearestHere" : "mapNearestCentre")}
            </h2>
            <ul className="space-y-2">
              {nearest.map(({ p, d }) => (
                <li key={`${p[0]},${p[1]}`} className="card flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium break-words">{p[2]}</span>
                    {p[3] && <span className="block text-[14px] text-ink-soft break-words">{p[3]}</span>}
                    <span className="block text-[13px] text-ink-soft">{d < 10 ? d.toFixed(1) : Math.round(d)} km</span>
                  </span>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${p[0]},${p[1]}`} target="_blank" rel="noopener noreferrer" aria-label={`${t("mapDirections")}: ${p[2]}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-beige text-terracotta-deep">
                    <Navigation size={18} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-ink-soft">{t("mapSource")}</p>
          </>
        )}
      </section>
    </Screen>
  );
}
