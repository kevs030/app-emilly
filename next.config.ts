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
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://i.ytimg.com",
  "font-src 'self'",
  `connect-src 'self' ${supabase} ${supabaseWs} https://nominatim.openstreetmap.org ${MIRROR_ORIGINS.join(" ")}`.trim(),
  "frame-src https://www.youtube-nocookie.com",
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
      { source: "/a-posto.apk", headers: [{ key: "Content-Type", value: "application/vnd.android.package-archive" }, { key: "Content-Disposition", value: 'attachment; filename="A-Posto.apk"' }] },
    ];
  },
};

export default nextConfig;
