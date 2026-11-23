import { ExternalLink, LocateFixed, Navigation, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MIRRORS, overpassBody, toPoints, type OsmElement, type Point } from "@/lib/overpass";
import { useLang } from "~/lib/lang";
import { directionsUrl, mapLink, searchUrl } from "~/lib/maps";
import type { StringKey } from "~/lib/strings";
import { API_URL } from "~/lib/supabase";
import { Alert, Screen } from "~/ui/kit";
import { ConsulateCard } from "~/ui/home/HomeCards";

const CATEGORIES = [
  { id: "questura", color: "#a65337", name: "Questura" },
  { id: "entrate", color: "#586747", name: "Agenzia delle Entrate" },
  { id: "patronato", color: "#c08a3e", name: "Patronato / CAF" },
  { id: "inps", color: "#302b27", name: "INPS" },
  { id: "prefettura", color: "#78866b", name: "Prefettura" },
  { id: "ayuda", color: "#88412d", name: null },
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

/**
 * Oficinas cercanas, sin mapa dentro de la app (más ligera): la lista se ordena por distancia y cada oficina
 * se abre en la app de mapas del teléfono (Android: la predeterminada; iPhone: Mapas). Datos de OpenStreetMap.
 * La ubicación solo se usa en el dispositivo para calcular distancias: no se guarda ni se envía.
 */
export function OfficesMap() {
  const { t } = useLang();
  const [cat, setCat] = useState<CatId>("questura");
  const [points, setPoints] = useState<Point[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [here, setHere] = useState<[number, number] | null>(null);
  const [byGps, setByGps] = useState(false);
  const [locating, setLocating] = useState(false);
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState<StringKey | "">("");
  const info = CATEGORIES.find((c) => c.id === cat)!;
  const label = info.name ?? t("mapSupport");

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

  const nearest = useMemo(
    () =>
      here
        ? points
            .map((p) => ({ p, d: km(here, [p[0], p[1]]) }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 8)
        : [],
    [points, here],
  );

  function nearMe() {
    setMsg("");
    if (!navigator.geolocation) return setMsg("mapNoLocation");
    setLocating(true);
    // El teléfono pide el permiso de ubicación la primera vez.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setByGps(true);
        setHere([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setLocating(false);
        setMsg("mapNoLocation");
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 },
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
      setByGps(false);
      setHere([Number(hits[0].lat), Number(hits[0].lon)]);
    } catch {
      setMsg("offline");
    }
  }

  return (
    <Screen title={t("offices")} back help="map">
      <div className="mb-4">
        <ConsulateCard />
      </div>
      <button type="button" className="btn" onClick={nearMe} disabled={locating} aria-busy={locating}>
        <LocateFixed size={20} aria-hidden /> {locating ? t("loading") : t("mapNearMe")}
      </button>
      <p className="hint mt-1">{t("mapLocationHint")}</p>
      <form onSubmit={search} className="mt-3 flex gap-2" role="search">
        <input className="input min-w-0 flex-1" aria-label={t("mapCity")} placeholder={t("mapCity")} maxLength={80} value={city} onChange={(e) => setCity(e.target.value)} />
        <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta-deep text-white" aria-label={t("searchTitle")}>
          <Search size={20} aria-hidden />
        </button>
      </form>
      {msg && <Alert kind="error">{t(msg)}</Alert>}

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={t("mapKind")}>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={`min-h-11 shrink-0 rounded-full px-4 text-[14px] font-medium ${cat === c.id ? "bg-terracotta-deep text-white" : "bg-beige"}`}>
            {c.name ?? t("mapSupport")}
          </button>
        ))}
      </div>

      <section className="mt-4" aria-live="polite">
        {!here && <p className="card text-ink-soft">{t("mapPickFirst")}</p>}
        {here && state === "loading" && <p className="text-ink-soft">{t("loading")}</p>}
        {here && state === "failed" && <p className="card text-ink-soft">{t("mapFailed")}</p>}
        {here && state === "ready" && (
          <>
            <h2 className="mb-2 font-bold">
              {label} · {t(byGps ? "mapNearestHere" : "mapNearestCentre")}
            </h2>
            <ul className="space-y-2">
              {nearest.map(({ p, d }) => (
                <li key={`${p[0]},${p[1]}`} className="card py-3">
                  <span className="block font-medium break-words">{p[2]}</span>
                  {p[3] && <span className="block text-[14px] text-ink-soft break-words">{p[3]}</span>}
                  <span className="block text-[13px] text-ink-soft">{d < 10 ? d.toFixed(1) : Math.round(d)} km</span>
                  <a {...mapLink(directionsUrl(p[0], p[1], p[2]))} className="btn btn-secondary mt-2 min-h-11 py-2 text-[15px]" data-testid="office-directions">
                    <Navigation size={18} aria-hidden /> {t("mapDirections")}
                  </a>
                </li>
              ))}
            </ul>
            <a {...mapLink(searchUrl(label, here))} data-testid="office-search-all" className="mt-3 flex min-h-11 items-center justify-center gap-2 font-medium text-brown underline">
              <ExternalLink size={18} aria-hidden /> {t("mapOpenAll")}
            </a>
            <p className="mt-3 text-[13px] text-ink-soft">{t("mapSource")}</p>
          </>
        )}
      </section>
    </Screen>
  );
}
