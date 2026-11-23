import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";

const BASE = "https://www.apostoapp.app";

/** Mapa del sitio para buscadores: portada, trámites (cada guía) y páginas de información. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/guias", "/ayudas", "/mapa", "/documentos", "/videos", "/contactos", "/descargar", "/sobre", "/privacidad"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...guides.map((g) => ({ url: `${BASE}/guias/${g.slug}`, lastModified: g.lastVerified, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
