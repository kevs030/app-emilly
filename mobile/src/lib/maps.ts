import { Capacitor } from "@capacitor/core";

/**
 * Enlaces que abren la app de mapas del teléfono (no un mapa dentro de A Posto).
 * - Android: «geo:» abre la app de mapas predeterminada (Google Maps, Waze, OsmAnd…) o deja elegir.
 * - iPhone (app o web instalada): Mapas de Apple.
 * - Ordenador: Google Maps en el navegador.
 */
type Platform = "android" | "ios" | "desktop";
export function mapsPlatform(ua = typeof navigator === "undefined" ? "" : navigator.userAgent, native = Capacitor.getPlatform()): Platform {
  if (native === "android") return "android";
  if (native === "ios") return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1)) return "ios";
  return "desktop";
}

const enc = encodeURIComponent;
/** Quita paréntesis: en «geo:» delimitan la etiqueta del punto. */
const clean = (s: string) => s.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();

/** Un lugar concreto, con su nombre en el marcador. Desde ahí la app de mapas ofrece «Cómo llegar». */
export function placeUrl(lat: number, lon: number, label = "", p: Platform = mapsPlatform()): string {
  const name = clean(label);
  if (p === "android") return `geo:0,0?q=${lat},${lon}${name ? `(${enc(name)})` : ""}`;
  if (p === "ios") return `https://maps.apple.com/?ll=${lat},${lon}&q=${enc(name || `${lat},${lon}`)}`;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

/** Ruta hasta el lugar. En Android se abre el lugar en la app predeterminada (con su botón de ruta). */
export function directionsUrl(lat: number, lon: number, label = "", p: Platform = mapsPlatform()): string {
  if (p === "android") return placeUrl(lat, lon, label, p);
  if (p === "ios") return `https://maps.apple.com/?daddr=${lat},${lon}${label ? `&q=${enc(clean(label))}` : ""}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

/** Buscar un tipo de oficina alrededor de un punto. */
export function searchUrl(query: string, at: [number, number], p: Platform = mapsPlatform()): string {
  const q = enc(clean(query));
  if (p === "android") return `geo:${at[0]},${at[1]}?q=${q}`;
  if (p === "ios") return `https://maps.apple.com/?q=${q}&sll=${at[0]},${at[1]}`;
  return `https://www.google.com/maps/search/${q}/@${at[0]},${at[1]},13z`;
}

/** Atributos del enlace: «geo:» se abre en la misma pestaña (el sistema lanza la app); https, en una nueva. */
export function mapLink(url: string) {
  return url.startsWith("http") ? { href: url, target: "_blank", rel: "noopener noreferrer" } : { href: url };
}
