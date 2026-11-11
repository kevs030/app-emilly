import type { Video } from "./types";

/**
 * Videos recopilados el 2026-11-11 con búsqueda en YouTube.
 * Se muestran con el reproductor oficial de YouTube (sin descargar ni volver a subir nada),
 * con subtítulos activados en el idioma del usuario cuando YouTube los ofrece.
 * Prioridad: canales oficiales (INPS, Agenzia delle Entrate, Polizia di Stato...).
 * Los videos de creadores no oficiales se marcan como "Comunidad".
 */
export const videos: Video[] = [
  { youtubeId: "1PKXRk5vCHw", title: "Tutorial Assegno Unico", channel: "INPS - Canale ufficiale", official: true, language: "it", topic: "bonus", publishedAt: "2022-01-24", durationMin: 5 },
  { youtubeId: "x6jHgcuyJ5o", title: "Il codice fiscale - Come compilare il modulo", channel: "Agenzia Entrate", official: true, language: "it", topic: "codice-fiscale", publishedAt: "2022-05-02", durationMin: 4 },
  { youtubeId: "ZZLnIPbpd1Q", title: "Il certificato di attribuzione del codice fiscale - come ottenerlo", channel: "Agenzia Entrate", official: true, language: "it", topic: "codice-fiscale", publishedAt: "2021-07-23", durationMin: 1 },
  { youtubeId: "VgLavmwPb70", title: "La richiesta del duplicato della Tessera Sanitaria - Codice Fiscale", channel: "Agenzia Entrate", official: true, language: "it", topic: "sanidad", publishedAt: "2025-03-19", durationMin: 2 },
  { youtubeId: "R8h9OAtgD1E", title: "Radio Tax - La Tessera Sanitaria", channel: "Agenzia Entrate", official: true, language: "it", topic: "sanidad", publishedAt: "2026-02-09", durationMin: 3 },
  { youtubeId: "X99d3lCnvhM", title: "Cómo completar el KIT del Permesso di Soggiorno (parte 1)", channel: "Ciao Torino!", official: false, language: "es", topic: "permesso", publishedAt: "2022-10-09", durationMin: 17 },
  { youtubeId: "jPuB4nk6VJc", title: "Come fare Kit Postale permesso di soggiorno per il RILASCIO", channel: "Pratichiamo Legge", official: false, language: "it", topic: "permesso", publishedAt: "2022-07-01", durationMin: 16 },
];

export const topics: Record<string, { es: string; en: string }> = {
  permesso: { es: "Permiso de residencia", en: "Residence permit" },
  "codice-fiscale": { es: "Código fiscal", en: "Tax code" },
  sanidad: { es: "Sanidad", en: "Healthcare" },
  bonus: { es: "Ayudas y bonos", en: "Benefits" },
};
