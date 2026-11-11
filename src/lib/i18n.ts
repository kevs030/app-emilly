import type { L10n, Lang } from "@/content/types";

export const LANGS: Lang[] = ["es", "en", "it"];
export const LANG_LABEL: Record<Lang, string> = { es: "Español", en: "English", it: "Italiano" };

export function isLang(v: unknown): v is Lang {
  return v === "es" || v === "en" || v === "it";
}

/** Devuelve el texto en el idioma pedido; si no hay italiano, usa inglés. */
export function tr(text: L10n, lang: Lang): string {
  if (lang === "it") return text.it ?? text.en;
  return text[lang];
}

const ui = {
  appName: { es: "Emilly", en: "Emilly", it: "Emilly" },
  tagline: {
    es: "Tu guía para vivir en Italia: trámites, ayudas, mapas y comunidad.",
    en: "Your guide to living in Italy: paperwork, benefits, maps and community.",
    it: "La tua guida per vivere in Italia: pratiche, bonus, mappe e comunità.",
  },
  navGuides: { es: "Trámites", en: "Paperwork", it: "Pratiche" },
  navBonus: { es: "Ayudas", en: "Benefits", it: "Bonus" },
  navMap: { es: "Mapa", en: "Map", it: "Mappa" },
  navVideos: { es: "Videos", en: "Videos", it: "Video" },
  navDirectory: { es: "Contactos", en: "Contacts", it: "Contatti" },
  navForum: { es: "Foro", en: "Forum", it: "Forum" },
  navAssistant: { es: "Asistente", en: "Assistant", it: "Assistente" },
  navProfile: { es: "Mi perfil", en: "My profile", it: "Il mio profilo" },
  login: { es: "Entrar", en: "Sign in", it: "Accedi" },
  logout: { es: "Salir", en: "Sign out", it: "Esci" },
  steps: { es: "Pasos", en: "Steps", it: "Passaggi" },
  documents: { es: "Documentos", en: "Documents", it: "Documenti" },
  costs: { es: "Costes", en: "Costs", it: "Costi" },
  warnings: { es: "Atención", en: "Watch out", it: "Attenzione" },
  sources: { es: "Fuentes", en: "Sources", it: "Fonti" },
  official: { es: "Oficial", en: "Official", it: "Ufficiale" },
  community: { es: "Comunidad (no oficial)", en: "Community (unofficial)", it: "Comunità (non ufficiale)" },
  verified: { es: "Revisado el", en: "Checked on", it: "Verificato il" },
  stale: {
    es: "Esta información lleva más de 7 días sin revisarse. Confírmala en la fuente oficial.",
    en: "This information hasn't been checked for more than 7 days. Confirm it with the official source.",
    it: "Informazione non verificata da oltre 7 giorni: controlla la fonte ufficiale.",
  },
  disclaimer: {
    es: "Emilly da información general, no asesoramiento legal. Para tu caso concreto, consulta a un abogado o a un Patronato (gratis).",
    en: "Emilly provides general information, not legal advice. For your specific case, talk to a lawyer or a Patronato (free).",
    it: "Emilly fornisce informazioni generali, non consulenza legale. Per il tuo caso rivolgiti a un avvocato o a un Patronato.",
  },
  aiNotice: {
    es: "Estás hablando con una inteligencia artificial. Puede equivocarse: comprueba siempre los enlaces oficiales.",
    en: "You are talking to an artificial intelligence. It can make mistakes: always check the official links.",
    it: "Stai parlando con un'intelligenza artificiale. Può sbagliare: verifica sempre le fonti ufficiali.",
  },
  subtitlesNote: {
    es: "Los subtítulos se activan en tu idioma cuando YouTube los ofrece (rueda ⚙ → Subtítulos → Traducir automáticamente).",
    en: "Subtitles turn on in your language when YouTube offers them (⚙ → Subtitles → Auto-translate).",
    it: "I sottotitoli si attivano nella tua lingua quando YouTube li offre.",
  },
} satisfies Record<string, L10n>;

export type UiKey = keyof typeof ui;

export function t(key: UiKey, lang: Lang): string {
  return tr(ui[key], lang);
}

export function isStale(lastVerified: string, days = 7): boolean {
  const age = Date.now() - new Date(lastVerified + "T00:00:00Z").getTime();
  return age > days * 24 * 60 * 60 * 1000;
}
