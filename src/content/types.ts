export type Lang = "es" | "en" | "it";

/** Texto traducido. `it` es opcional: si falta, se muestra la versión en inglés. */
export type L10n = { es: string; en: string; it?: string };

export interface Source {
  title: string;
  url: string;
  /** true = web de una institución pública italiana o de la UE */
  official: boolean;
}

export interface GuideStep {
  title: L10n;
  body: L10n;
}

export interface Guide {
  slug: string;
  icon: string;
  category: "documentos" | "salud" | "trabajo" | "familia" | "ciudadania";
  title: L10n;
  summary: L10n;
  steps: GuideStep[];
  documents: L10n[];
  costs?: L10n;
  warnings?: L10n[];
  /** IDs de videos de `videos.ts` relacionados con esta guía */
  videoIds?: string[];
  sources: Source[];
  /** Fecha (AAAA-MM-DD) de la última verificación humana. Se revisa cada semana. */
  lastVerified: string;
}

export interface Bonus {
  slug: string;
  name: L10n;
  amount: L10n;
  who: L10n;
  requirements: L10n[];
  howToApply: L10n;
  sources: Source[];
  lastVerified: string;
}

export interface Video {
  /** ID de YouTube */
  youtubeId: string;
  title: string;
  channel: string;
  /** true = canal oficial de una institución pública */
  official: boolean;
  /** Idioma del audio */
  language: Lang | "other";
  topic: string;
  publishedAt: string;
  durationMin: number;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  category: "emergencia" | "institucion" | "ong" | "abogado" | "salud" | "dentista" | "patronato";
  description: L10n;
  phone?: string;
  url?: string;
  free: boolean;
  /** Solo se muestran entradas verificadas por una persona del equipo */
  verified: boolean;
  lastVerified: string;
}

export interface OfficialDocument {
  id: string;
  /** Guía a la que pertenece (slug) */
  guide: string;
  title: L10n;
  description: L10n;
  url: string;
  /** "pdf" = formulario o documento descargable; "web" = página o servicio oficial online */
  kind: "pdf" | "web";
  /** true = formulario que la persona debe rellenar */
  fillable: boolean;
  issuer: string;
  lastVerified: string;
}
