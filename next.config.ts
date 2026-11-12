import type { NextConfig } from "next";
import { SUPABASE_URL } from "./src/lib/supabase/config";

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
  `connect-src 'self' ${supabase} ${supabaseWs} https://nominatim.openstreetmap.org`.trim(),
  "frame-src https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
