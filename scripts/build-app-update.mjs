// Actualizaciones en vivo de la app (sin descargar un APK nuevo).
// Compila la app (carpeta mobile/), calcula una huella de su contenido y publica en public/app-update/:
//   - bundle-<huella>.zip : los archivos de la app
//   - latest.json         : qué paquete es el último, su comprobación SHA-256 y la versión nativa mínima
// La app instalada consulta latest.json al abrirse; si la huella es distinta de la suya, descarga el paquete
// y lo aplica la próxima vez que se abra. Se ejecuta en cada publicación (npm run build) y antes de compilar el APK.
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { zipSync } from "fflate";

const run = (cmd) => execSync(cmd, { cwd: "mobile", stdio: "inherit", env: { ...process.env } });
if (!existsSync("mobile/node_modules/vite")) run("npm ci --include=dev --no-audit --no-fund");
run("npx vite build");

const DIST = "mobile/dist";
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const files = walk(DIST)
  .map((f) => relative(DIST, f).split("\\").join("/"))
  .filter((f) => f !== "live-version.json")
  .sort();

// Huella de las FUENTES de la app (no del resultado compilado): el compilador puede repartir el código en trozos
// de forma distinta según la máquina, pero mismas fuentes ⇒ misma app ⇒ misma huella, en cualquier máquina.
const SOURCES = ["mobile/src", "mobile/public", "mobile/index.html", "mobile/vite.config.ts", "mobile/package-lock.json", "src/content", "src/lib/i18n.ts", "src/lib/overpass.ts", "src/components/PrivacyContent.tsx", "src/styles/tokens.css"];
const srcFiles = SOURCES.flatMap((p) => (statSync(p).isDirectory() ? walk(p) : [p])).map((f) => f.split("\\").join("/")).sort();
const h = createHash("sha256");
for (const f of srcFiles) h.update(f).update("\0").update(readFileSync(f)).update("\0");
// Variables VITE_* (se incrustan en la app al compilar)
for (const [k, v] of Object.entries(process.env).filter(([k]) => k.startsWith("VITE_")).sort()) h.update(`${k}=${v}\0`);
const hash = h.digest("hex");
writeFileSync(join(DIST, "live-version.json"), JSON.stringify({ hash }));

const entries = {};
for (const f of [...files, "live-version.json"]) entries[f] = readFileSync(join(DIST, f));
const zip = zipSync(entries, { level: 9 });
const checksum = createHash("sha256").update(zip).digest("hex");

const OUT = "public/app-update";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const name = `bundle-${hash.slice(0, 16)}.zip`;
writeFileSync(join(OUT, name), zip);

// En Vercel no está la carpeta android (.vercelignore): la versión del APK publicado se anota en live-update.json.
const { minNative, versionCode, versionName } = JSON.parse(readFileSync("mobile/live-update.json", "utf8"));
if (existsSync("mobile/android/app/build.gradle")) {
  const gradle = readFileSync("mobile/android/app/build.gradle", "utf8");
  const code = Number(gradle.match(/versionCode\s+(\d+)/)?.[1] ?? 0);
  if (code !== versionCode) console.warn(`Aviso: build.gradle tiene versionCode ${code} y live-update.json ${versionCode}. Actualiza live-update.json.`);
}
writeFileSync(
  join(OUT, "latest.json"),
  JSON.stringify({ hash, url: `/app-update/${name}`, checksum, minNative, apk: { versionCode, versionName, url: "/descargar" } }, null, 2),
);
console.log(`Paquete de actualización ${hash.slice(0, 12)} (${(zip.length / 1048576).toFixed(1)} MB), mínimo nativo ${minNative}`);
