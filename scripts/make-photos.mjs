// Convierte las fotos de Pexels (licencia libre, uso comercial) en WebP de 800 y 1600 px para la web.
// Las originales se descargan aparte; la lista con su origen está en docs/fotos-licencias.md.
// Uso: node scripts/make-photos.mjs <carpeta-con-los-jpg>
import { readdirSync } from "node:fs";
import sharp from "sharp";

const dir = process.argv[2];
for (const f of readdirSync(dir).filter((x) => x.endsWith(".jpg"))) {
  const name = f.replace(/\.jpg$/, "");
  for (const w of [800, 1600]) {
    const info = await sharp(`${dir}/${f}`).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`public/web/fotos/${name}-${w}.webp`);
    console.log(name, w, info.width + "x" + info.height, Math.round(info.size / 1024) + " KB");
  }
}
