"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

type Place = { id: number; name: string; address: string; lat: number; lon: number };

export const OFFICE_TYPES = [
  { q: "Questura", es: "Questura (permisos)", en: "Questura (permits)" },
  { q: "Agenzia delle Entrate", es: "Agenzia delle Entrate", en: "Agenzia delle Entrate" },
  { q: "Ufficio postale", es: "Correos (Poste)", en: "Post office" },
  { q: "Patronato", es: "Patronato (ayuda gratis)", en: "Patronato (free help)" },
  { q: "ASL", es: "ASL (sanidad)", en: "ASL (healthcare)" },
  { q: "Comune anagrafe", es: "Comune / Anagrafe", en: "Town hall / Registry" },
  { q: "Prefettura", es: "Prefectura", en: "Prefecture" },
] as const;

function FitTo({ places }: { places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length > 0) {
      map.fitBounds(places.map((p) => [p.lat, p.lon] as [number, number]), { padding: [30, 30], maxZoom: 15 });
    }
  }, [map, places]);
  return null;
}

export default function OfficeMap({ lang }: { lang: "es" | "en" | "it" }) {
  const [city, setCity] = useState("");
  const [type, setType] = useState<string>(OFFICE_TYPES[0].q);
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const L = lang === "en" ? "en" : "es";

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (city.trim().length < 2) return;
    setStatus("loading");
    try {
      // Nominatim (OpenStreetMap). Política de uso: máx. 1 petición/segundo; para producción usar un proveedor propio.
      const params = new URLSearchParams({ q: `${type} ${city.trim()}`, format: "jsonv2", countrycodes: "it", limit: "15", addressdetails: "0" });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { "Accept-Language": "it" } });
      if (!res.ok) throw new Error(String(res.status));
      const data: { place_id: number; name: string; display_name: string; lat: string; lon: string }[] = await res.json();
      const list = data.map((d) => ({ id: d.place_id, name: d.name || type, address: d.display_name, lat: Number(d.lat), lon: Number(d.lon) }));
      setPlaces(list);
      setStatus(list.length ? "idle" : "empty");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <select className="input sm:w-64" value={type} onChange={(e) => setType(e.target.value)}>
          {OFFICE_TYPES.map((o) => (
            <option key={o.q} value={o.q}>
              {o[L]}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder={L === "en" ? "Your city (e.g. Milano)" : "Tu ciudad (ej. Milano)"}
          value={city}
          maxLength={60}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className="btn" disabled={status === "loading"}>
          {status === "loading" ? "…" : L === "en" ? "Search" : "Buscar"}
        </button>
      </form>
      {status === "empty" && <p className="text-sm text-muted">{L === "en" ? "No results. Try another city." : "Sin resultados. Prueba otra ciudad."}</p>}
      {status === "error" && <p className="text-sm text-warn-fg">{L === "en" ? "Map search unavailable, try again." : "La búsqueda no está disponible, inténtalo de nuevo."}</p>}

      <div className="h-[420px] overflow-hidden rounded-xl border border-border">
        <MapContainer center={[42.5, 12.5]} zoom={5} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {places.map((p) => (
            <CircleMarker key={p.id} center={[p.lat, p.lon]} radius={9} pathOptions={{ color: "#0f766e", fillOpacity: 0.8 }}>
              <Popup>
                <strong>{p.name}</strong>
                <br />
                {p.address}
                <br />
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`} target="_blank" rel="noopener noreferrer">
                  {L === "en" ? "Directions" : "Cómo llegar"}
                </a>
              </Popup>
            </CircleMarker>
          ))}
          <FitTo places={places} />
        </MapContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {places.map((p) => (
          <li key={p.id} className="card py-2">
            <strong>{p.name}</strong> — <span className="text-muted">{p.address}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
