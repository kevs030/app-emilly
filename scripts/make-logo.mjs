// Genera el logo oficial «A Posto» y sus iconos PNG.
// Uso: node scripts/make-logo.mjs
// Las letras están dibujadas con trazos (no dependen de ninguna tipografía instalada),
// así el logo se ve igual en cualquier dispositivo.
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SIZE = 512;
const GREEN = "#16A34A";
const DARK = "#064E3B";
const SAFE = SIZE * 0.15; // margen de seguridad: nada se dibuja fuera de 15 %–85 %

// ── Insignia circular ondulada ──
const badge = { cx: 256, cy: 190, r: 100, wave: 7, lobes: 12 };
const pts = [];
for (let i = 0; i < 360; i++) {
  const a = (i * Math.PI) / 180;
  const r = badge.r + badge.wave * Math.cos(badge.lobes * a);
  pts.push(`${(badge.cx + r * Math.cos(a)).toFixed(2)},${(badge.cy + r * Math.sin(a)).toFixed(2)}`);
}
const badgePath = `M${pts.join("L")}Z`;
const check = `M${badge.cx - 46} ${badge.cy + 4}l32 32l60 -68`;

// ── Palabra «A Posto» con trazos redondeados ──
const W = 13; // grosor del trazo
const R = 22; // radio de las letras redondas
const GAP = 12;
const SPACE = 46;
const h = W / 2;
let x = 0; // borde izquierdo de la letra siguiente
const parts = [];
const round = (cx) => `<circle cx="${cx}" cy="0" r="${R}"/>`;
const letters = {
  a() {
    const cx = x + h + R;
    parts.push(round(cx), `<path d="M${cx + R} ${-R}V${R}"/>`);
    x = cx + R + h;
  },
  p() {
    const cx = x + h + R;
    parts.push(round(cx), `<path d="M${cx - R} ${-R}V${R + 30}"/>`);
    x = cx + R + h;
  },
  o() {
    const cx = x + h + R;
    parts.push(round(cx));
    x = cx + R + h;
  },
  s() {
    const q = R / 2;
    const cx = x + h + q;
    parts.push(`<path d="M${cx + q} ${-q}A${q} ${q} 0 1 0 ${cx} 0A${q} ${q} 0 1 1 ${cx - q} ${q}"/>`);
    x = cx + q + h;
  },
  A() {
    const half = 26;
    const top = -R - 22;
    const cx = x + h + half;
    const barY = R - 20;
    const barHalf = (half * (barY - top)) / (R - top) - 2;
    parts.push(`<path d="M${cx - half} ${R}L${cx} ${top}L${cx + half} ${R}"/>`, `<path d="M${(cx - barHalf).toFixed(1)} ${barY}H${(cx + barHalf).toFixed(1)}"/>`);
    x = cx + half + h;
  },
  P() {
    const top = -R - 22;
    const rb = 17;
    const sx = x + h;
    parts.push(`<path d="M${sx} ${R}V${top}H${sx + 16}a${rb} ${rb} 0 0 1 0 ${2 * rb}H${sx}"/>`);
    x = sx + 16 + rb + h;
  },
  t() {
    const sx = x + h + 12;
    parts.push(`<path d="M${sx} ${-R - 22}V${R - 10}a10 10 0 0 0 10 10h6"/>`, `<path d="M${sx - 12} ${-R}H${sx + 16}"/>`);
    x = sx + 16 + h;
  },
};
for (const ch of "A Posto") {
  if (ch === " ") {
    x += SPACE - GAP;
    continue;
  }
  letters[ch]();
  x += GAP;
}
const wordWidth = x - GAP;
const scale = Math.min(1, (SIZE - 2 * SAFE - 8) / wordWidth);
const wordY = 372; // línea central de las letras
const tx = (SIZE - wordWidth * scale) / 2;
const bottom = wordY + (R + h) * scale;
if (bottom > SIZE - SAFE || badge.cy - badge.r - badge.wave < SAFE) throw new Error("El dibujo se sale del margen de seguridad");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="A Posto">
  <title>A Posto</title>
  <rect width="${SIZE}" height="${SIZE}" fill="#FFFFFF"/>
  <path d="${badgePath}" fill="${GREEN}"/>
  <path d="${check}" fill="none" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(${tx.toFixed(2)} ${wordY}) scale(${scale.toFixed(4)})" fill="none" stroke="${DARK}" stroke-width="${W}" stroke-linecap="round" stroke-linejoin="round">
    ${parts.join("\n    ")}
  </g>
</svg>
`;

writeFileSync("public/logo-aposto.svg", svg);
mkdirSync("public/icons", { recursive: true });
for (const size of [192, 512]) {
  await sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(`public/icons/icon-${size}.png`);
}
// Icono para la pantalla de inicio del iPhone (sin transparencia, 180 px).
await sharp(Buffer.from(svg), { density: 300 }).resize(180, 180).flatten({ background: "#FFFFFF" }).png({ compressionLevel: 9 }).toFile("public/icons/apple-touch-icon.png");
console.log(`logo-aposto.svg, icons/icon-192.png e icons/icon-512.png generados (palabra a escala ${scale.toFixed(2)})`);
