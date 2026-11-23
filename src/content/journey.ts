import type { L10n } from "./types";

/**
 * Los trámites agrupados por el momento del viaje de la persona migrante («dolor urgente»).
 * Sirve para la portada, el índice de trámites y el cuestionario «Tu hoja de ruta».
 */
export type Stage = { id: "llegada" | "quedarme" | "anos"; title: L10n; pain: L10n; slugs: string[] };

export const STAGES: Stage[] = [
  {
    id: "llegada",
    title: { es: "1. Acabo de llegar", en: "1. I just arrived", it: "1. Sono appena arrivato" },
    pain: {
      es: "Lo primero para existir en Italia: código fiscal, médico y residencia.",
      en: "The first things to exist in Italy: tax code, doctor and residence.",
      it: "Le prime cose per esistere in Italia: codice fiscale, medico e residenza.",
    },
    slugs: ["codice-fiscale", "sanidad-tessera-sanitaria", "residencia-anagrafica"],
  },
  {
    id: "quedarme",
    title: { es: "2. Quiero trabajar o quedarme", en: "2. I want to work or stay", it: "2. Voglio lavorare o restare" },
    pain: {
      es: "Los caminos legales para trabajar y quedarte, y tus derechos aunque aún no tengas papeles.",
      en: "The legal paths to work and stay, and your rights even if you don't have papers yet.",
      it: "Le vie legali per lavorare e restare, e i tuoi diritti anche senza documenti.",
    },
    slugs: ["permesso-di-soggiorno", "decreto-flussi", "articolo-31", "art-35-sanidad-sin-papeles"],
  },
  {
    id: "anos",
    title: { es: "3. Llevo años aquí", en: "3. I've been here for years", it: "3. Sono qui da anni" },
    pain: {
      es: "Estabilidad: carta de identidad, permiso de larga duración y ciudadanía.",
      en: "Stability: identity card, long-term permit and citizenship.",
      it: "Stabilità: carta d'identità, permesso di lungo periodo e cittadinanza.",
    },
    slugs: ["carta-identita-elettronica", "permesso-ue-lungo-periodo", "ciudadania"],
  },
];

export const stageOf = (slug: string) => STAGES.find((s) => s.slugs.includes(slug));

export type Situation = "abroad" | "arrived" | "undocumented" | "permit";
export type Goal = "work" | "health" | "residence" | "family";
export type Device = "android" | "iphone" | "computer";
export type Answers = { situation: Situation; goal: Goal; hasCf: boolean; device: Device };

/**
 * Los 3 trámites que conviene hacer primero, en orden. Reglas simples y explicables:
 * situación → lo imprescindible; objetivo → lo que más urge; sin código fiscal → va primero cuando ya se puede pedir.
 */
export function roadmap(a: Answers): string[] {
  const out: string[] = [];
  const add = (...s: string[]) => s.forEach((x) => !out.includes(x) && out.push(x));
  const cfFirst = !a.hasCf && (a.situation === "arrived" || a.situation === "permit");

  if (a.situation === "abroad") {
    if (a.goal === "work") add("decreto-flussi");
    add("permesso-di-soggiorno", "decreto-flussi", "codice-fiscale");
  } else if (a.situation === "undocumented") {
    if (a.goal === "health") add("art-35-sanidad-sin-papeles");
    if (a.goal === "family") add("articolo-31");
    add("art-35-sanidad-sin-papeles", "articolo-31", "permesso-di-soggiorno");
  } else if (a.situation === "arrived") {
    if (cfFirst) add("codice-fiscale");
    if (a.goal === "health") add("sanidad-tessera-sanitaria");
    if (a.goal === "residence") add("residencia-anagrafica");
    if (a.goal === "work" || a.goal === "family") add("permesso-di-soggiorno");
    add("codice-fiscale", "residencia-anagrafica", "sanidad-tessera-sanitaria");
  } else {
    if (cfFirst) add("codice-fiscale");
    if (a.goal === "health") add("sanidad-tessera-sanitaria");
    if (a.goal === "residence") add("residencia-anagrafica", "carta-identita-elettronica");
    if (a.goal === "family") add("permesso-di-soggiorno");
    add("permesso-di-soggiorno", "permesso-ue-lungo-periodo", "ciudadania");
  }
  return out.slice(0, 3);
}
