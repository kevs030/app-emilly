/**
 * Genera los guiones de narración de los vídeos paso a paso, uno por idioma y sección,
 * a partir de los mismos textos que muestra la app (así vídeo y app siempre dicen lo mismo).
 * Uso: npm run gen:video-scripts  →  scripts-videos/<idioma>/<sección>.md
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { A31 } from "../mobile/src/content/modules/art31";
import { AA48_FIELDS, CF, LEAFLET } from "../mobile/src/content/modules/codiceFiscale";
import { T, TUPASSI, ZEROCODA, REQUIREMENTS } from "../mobile/src/content/modules/tessera";
import type { T9 } from "../mobile/src/content/modules/types";
import { OUTRO, SECTION_TITLE, type VideoSection } from "../mobile/src/content/modules/videos";

const LANGS = ["es", "it", "en", "fr", "ar", "ro", "sq", "uk", "bn"] as const;
const NAMES: Record<(typeof LANGS)[number], string> = { es: "Español", it: "Italiano", en: "English", fr: "Français", ar: "العربية", ro: "Română", sq: "Shqip", uk: "Українська", bn: "বাংলা" };
type Scene = { visual: string; say: T9[] };

const SCENES: Record<VideoSection, Scene[]> = {
  "tessera-sanitaria": [
    { visual: "Foto del trámite (public/tramites/sanidad-tessera-sanitaria-960.webp) + título", say: [SECTION_TITLE["tessera-sanitaria"]] },
    { visual: "Lista de documentos apareciendo uno a uno", say: [T.reqTitle, ...REQUIREMENTS] },
    { visual: "Mapa de Italia con las ciudades del directorio", say: [T.regional] },
    { visual: "Pantallas de ZeroCoda y TuPassi (capturas propias)", say: [ZEROCODA.what, TUPASSI.what] },
    { visual: "Logo de A Posto", say: [OUTRO] },
  ],
  "codice-fiscale": [
    { visual: "Foto del trámite (public/tramites/codice-fiscale-960.webp) + título", say: [SECTION_TITLE["codice-fiscale"], LEAFLET[0], LEAFLET[1]] },
    { visual: "El formulario AA4/8 con cada casilla resaltada", say: [CF.tips, ...AA48_FIELDS.map((f) => f.explain)] },
    { visual: "Oficina de la Agenzia delle Entrate (foto de oficinas)", say: [LEAFLET[2], LEAFLET[3], LEAFLET[4]] },
    { visual: "Logo de A Posto", say: [OUTRO] },
  ],
  "articolo-31": [
    { visual: "Foto del trámite (public/tramites/articolo-31-960.webp) + título", say: [SECTION_TITLE["articolo-31"]] },
    { visual: "Tribunal de Menores (ilustración) y abogado", say: [A31.how] },
    { visual: "Lista de documentos", say: [A31.docs, A31.cost] },
    { visual: "Mapa de los 29 distritos", say: [A31.otherCity] },
    { visual: "Logo de A Posto", say: [OUTRO] },
  ],
};

let count = 0;
for (const lang of LANGS) {
  mkdirSync(`scripts-videos/${lang}`, { recursive: true });
  for (const [section, scenes] of Object.entries(SCENES) as [VideoSection, Scene[]][]) {
    const lines = [
      `# ${SECTION_TITLE[section][lang]}`,
      "",
      `- Idioma de la narración: **${NAMES[lang]}** (\`${lang}\`)`,
      `- Archivo final: \`public/videos/${lang}/${section}.mp4\` (y portada \`${section}.jpg\`), formato 16:9, 60–120 s.`,
      "- **Sin subtítulos ni texto superpuesto**: toda la información va en la voz.",
      "- Cuando el vídeo esté listo, pon `true` en `public/videos/manifest.json` para este idioma y sección.",
      "",
      ...scenes.flatMap((sc, i) => [`## Escena ${i + 1}`, "", `**Imagen:** ${sc.visual}`, "", "**Voz:**", "", ...sc.say.map((t) => `> ${t[lang]}`), ""]),
      "---",
      "Generado automáticamente desde los textos de la app (scripts/gen-video-scripts.ts). No editar a mano: cambia los textos en mobile/src/content/modules/ y vuelve a generar.",
      "",
    ];
    writeFileSync(`scripts-videos/${lang}/${section}.md`, lines.join("\n"));
    count++;
  }
}
console.log(`${count} guiones en scripts-videos/`);
