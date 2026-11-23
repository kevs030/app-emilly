// Compila la app (carpeta mobile/) y la coloca en public/app para servirla en /app/.
// Se ejecuta antes de compilar la web: `npm run build`.
import { execSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const run = (cmd, env = {}) => execSync(cmd, { cwd: "mobile", stdio: "inherit", env: { ...process.env, ...env } });

if (!existsSync("mobile/node_modules/vite")) run("npm ci --include=dev --no-audit --no-fund");
run("npx tsc --noEmit");
run("npx vite build", { VITE_BASE: "/app/" });
rmSync("public/app", { recursive: true, force: true });
cpSync("mobile/dist", "public/app", { recursive: true });
// En la web, la app usa el manifiesto, los iconos y el Service Worker del sitio (los del teléfono no se publican).
for (const f of ["manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-1024.png"]) rmSync(`public/app/${f}`, { force: true });
const page = "public/app/index.html";
// Manifiesto propio de la app web: al instalarla (Android «Instalar app», iPhone «Añadir a pantalla de inicio»)
// se abre directamente en /app/, a pantalla completa, como una app.
writeFileSync(
  "public/app/manifest.webmanifest",
  JSON.stringify(
    {
      id: "/app",
      name: "A Posto",
      short_name: "A Posto",
      description: "Tus trámites en Italia, paso a paso, en tu idioma.",
      start_url: "/app",
      scope: "/app",
      display: "standalone",
      orientation: "portrait",
      background_color: "#F7F2EA",
      theme_color: "#F7F2EA",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    null,
    2,
  ),
);
const head = [
  '<link rel="manifest" href="/app/manifest.webmanifest" />',
  '<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
  '<meta name="apple-mobile-web-app-title" content="A Posto" />',
  '<script defer src="/sw-register.js"></script>',
].join("\n    ");
const html = readFileSync(page, "utf8");
if (!html.includes("</head>")) throw new Error("index.html de la app sin </head>");
writeFileSync(page, html.replace("</head>", `  ${head}\n  </head>`));
console.log("App compilada en public/app");
