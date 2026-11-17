import { existsSync } from "node:fs";
import type { NextConfig } from "next";
import { SUPABASE_URL } from "./src/lib/supabase/config";
import { MIRROR_ORIGINS } from "./src/lib/overpass";

const supabase = SUPABASE_URL;
const supabaseWs = supabase.replace(/^https:/, "wss:");
const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy: el navegador solo carga recursos de los orígenes de esta lista.
 * Mitiga XSS, secuestro de clics (clickjacking) e inyección de scripts de terceros.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://i.ytimg.com",
  "font-src 'self'",
  `connect-src 'self' ${supabase} ${supabaseWs} https://nominatim.openstreetmap.org ${MIRROR_ORIGINS.join(" ")}`.trim(),
  "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

// El botón de descarga directa solo aparece si el archivo existe al compilar: nunca un enlace roto.
const apkAvailable = existsSync("public/a-posto.apk");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APK_AVAILABLE: apkAvailable ? "1" : "" },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // La app es independiente (se instala en el teléfono); la web solo informa y ofrece la descarga.
  // Las direcciones de la antigua app dentro de la web llevan a la página de descarga. Son temporales (307)
  // para poder volver atrás sin que los navegadores las recuerden.
  async redirects() {
    const toDownload = ["/app", "/app/:path*", "/entrar", "/perfil", "/asistente", "/foro", "/foro/:path*"];
    return toDownload.map((source) => ({ source, destination: "/descargar", permanent: false }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self), payment=()" },
        ],
      },
      // El Service Worker debe comprobarse siempre contra el servidor, para que las actualizaciones lleguen.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
      // Verificación de la app de Android (TWA): Google exige JSON y sin redirecciones.
      { source: "/.well-known/assetlinks.json", headers: [{ key: "Content-Type", value: "application/json" }, { key: "Cache-Control", value: "public, max-age=3600" }] },
      // Actualizaciones en vivo de la app: el manifiesto siempre fresco; los paquetes no cambian nunca (llevan su huella en el nombre).
      { source: "/app-update/latest.json", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
      { source: "/app-update/:file*.zip", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/video/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
      { source: "/a-posto.apk", headers: [{ key: "Content-Type", value: "application/vnd.android.package-archive" }, { key: "Content-Disposition", value: 'attachment; filename="A-Posto.apk"' }] },
    ];
  },
};

export default nextConfig;
