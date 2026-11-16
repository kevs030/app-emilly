import type { MetadataRoute } from "next";

/** Convierte la web en una app instalable (PWA) y es la base del paquete de Android (TWA). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A Posto",
    short_name: "A Posto",
    description: "Trámites, ayudas, mapas, videos y comunidad para personas migrantes en Italia.",
    id: "/",
    start_url: "/app/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#16A34A",
    lang: "es",
    dir: "ltr",
    categories: ["education", "utilities", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // El logo deja un 15 % de margen, así que también sirve como icono adaptable de Android.
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Asistente", url: "/app/assistant" },
      { name: "Trámites", url: "/app/guides" },
      { name: "Mis documentos", url: "/app/documents" },
    ],
  };
}
