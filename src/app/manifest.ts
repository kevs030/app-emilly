import type { MetadataRoute } from "next";

/** Convierte la web en una app instalable (PWA) en Android, iPhone y ordenador. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A posto — Guía para migrantes en Italia",
    short_name: "A posto",
    description: "Trámites, ayudas, mapas, videos y comunidad para personas migrantes en Italia.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f7f4",
    theme_color: "#0f766e",
    lang: "es",
    categories: ["education", "utilities", "social"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Asistente", url: "/asistente" },
      { name: "Trámites", url: "/guias" },
      { name: "Foro", url: "/foro" },
    ],
  };
}
