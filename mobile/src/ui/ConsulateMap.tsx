import { Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CS, type Consulate } from "~/content/modules/consulates";
import { directionsUrl } from "~/screens/OfficesMap";
import { Modal, useT9 } from "~/ui/modules/ModuleBlocks";

/**
 * Mapa centrado en las coordenadas exactas del consulado, con un marcador destacado.
 * Leaflet se carga solo al abrir el mapa (no pesa en el arranque). Teselas de OpenStreetMap.
 */
export function ConsulateMap({ c, onClose }: { c: Consulate; onClose: () => void }) {
  const { x } = useT9();
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let alive = true;
    void (async () => {
      try {
        const [L] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
        if (!alive || !box.current) return;
        map = L.map(box.current, { zoomControl: true, attributionControl: true }).setView([c.lat, c.lon], 17);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
        const icon = L.divIcon({
          className: "",
          html: '<span class="consulate-pin" data-testid="consulate-pin"><span></span></span>',
          iconSize: [44, 56],
          iconAnchor: [22, 54],
        });
        L.marker([c.lat, c.lon], { icon, title: c.name, keyboard: true }).addTo(map);
        setTimeout(() => map?.invalidateSize(), 50);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
      map?.remove();
    };
  }, [c]);

  return (
    <Modal title={c.name} onClose={onClose}>
      <p className="text-[15px]">{c.address}</p>
      {!c.poi && <p className="hint mt-1">{x(CS.streetLevel)}</p>}
      {failed ? (
        <p className="alert alert-error mt-3">{x(CS.mapError)}</p>
      ) : (
        <div ref={box} className="mt-3 h-72 w-full overflow-hidden rounded-2xl border border-line bg-beige" role="region" aria-label={x(CS.mapTitle)} data-testid="consulate-map" data-lat={c.lat} data-lon={c.lon} />
      )}
      <a href={directionsUrl(c.lat, c.lon)} target="_blank" rel="noopener noreferrer" className="btn mt-4">
        <Navigation size={18} aria-hidden /> {x(CS.go)}
      </a>
    </Modal>
  );
}
