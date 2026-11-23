// Genera todos los iconos de A Posto a partir del logo «casa con ✓» («a posto» = en orden).
// Uso: node scripts/make-icons.mjs   (web, iPhone, app y Android)
import { mkdirSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const T = "#A65337"; // terracota
const CREAM = "#F7F2E9";
const HOUSE = (fill, stroke) =>
  `<path d="M10 30 32 12l22 18v20a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5z" fill="${fill}" stroke="${fill}" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M22 35.5l7 7 13.5-14" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Marca sobre fondo claro: casa terracota con ✓ blanco. */
export const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="A Posto">${HOUSE(T, "#fff")}</svg>`;
/** Icono de app: fondo terracota y casa blanca con ✓ terracota. `scale` = tamaño de la casa respecto al icono. */
const appIcon = (scale = 0.72, round = false) => {
  const s = 64 * scale, o = (64 - s) / 2;
  const bg = round ? `<circle cx="32" cy="32" r="32" fill="${T}"/>` : `<rect width="64" height="64" fill="${T}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${bg}<g transform="translate(${o} ${o + 1.5}) scale(${scale})">${HOUSE("#fff", T)}</g></svg>`;
};
/** Primer plano del icono adaptable de Android (transparente). */
const fg = (scale = 0.62) => {
  const s = 64 * scale, o = (64 - s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g transform="translate(${o} ${o + 1.5}) scale(${scale})">${HOUSE("#fff", T)}</g></svg>`;
};
const png = (svg, size, file) => sharp(Buffer.from(svg), { density: 512 }).resize(size, size).png().toFile(file);

// Web
writeFileSync("public/logo-aposto.svg", MARK + "\n");
mkdirSync("public/icons", { recursive: true });
await png(appIcon(), 192, "public/icons/icon-192.png");
await png(appIcon(), 512, "public/icons/icon-512.png");
await png(appIcon(0.6), 512, "public/icons/icon-maskable-512.png");
await png(appIcon(), 180, "public/icons/apple-touch-icon.png");
await png(appIcon(), 180, "src/app/apple-icon.png");
await png(appIcon(), 32, "public/icons/favicon-32.png");
// App (carpeta mobile/public)
for (const s of [192, 512, 1024]) await png(appIcon(), s, `mobile/public/icon-${s}.png`);

// Android: iconos del lanzador (clásico, redondo y adaptable)
const RES = "mobile/android/app/src/main/res";
const DENS = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
if (existsSync(RES)) {
  for (const [d, k] of Object.entries(DENS)) {
    const dir = join(RES, `mipmap-${d}`);
    if (!existsSync(dir)) continue;
    await png(appIcon(0.7), Math.round(48 * k), join(dir, "ic_launcher.png"));
    await png(appIcon(0.62, true), Math.round(48 * k), join(dir, "ic_launcher_round.png"));
    // Capa adaptable: 108 dp; el XML aplica un margen del 16,7 %.
    await png(fg(0.72), Math.round(108 * k), join(dir, "ic_launcher_foreground.png"));
    await sharp({ create: { width: Math.round(108 * k), height: Math.round(108 * k), channels: 4, background: T } }).png().toFile(join(dir, "ic_launcher_background.png"));
  }
  // Pantallas de inicio (splash): fondo crema y la marca en el centro, con el tamaño de cada archivo.
  for (const dir of readdirSync(RES).filter((d) => d.startsWith("drawable"))) {
    const f = join(RES, dir, "splash.png");
    if (!existsSync(f)) continue;
    const { width, height } = await sharp(f).metadata();
    const m = Math.round(Math.min(width, height) * 0.28);
    const mark = await sharp(Buffer.from(MARK), { density: 512 }).resize(m, m).png().toBuffer();
    await sharp({ create: { width, height, channels: 4, background: CREAM } }).composite([{ input: mark, gravity: "center" }]).png().toFile(f + ".tmp");
    await sharp(f + ".tmp").toFile(f);
  }
}
console.log("Iconos generados");
