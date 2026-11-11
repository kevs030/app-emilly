import type { DirectoryEntry } from "./types";

/**
 * Directorio de servicios.
 * REGLA: no se publica ningún abogado, dentista ni profesional privado sin verificar
 * su inscripción en el colegio profesional (Ordine degli Avvocati / Ordine dei Medici e Odontoiatri)
 * y sin su consentimiento por escrito para aparecer. Ver docs/02-analisis-legal.md.
 */
export const directory: DirectoryEntry[] = [
  {
    id: "112",
    name: "112 — Emergencias",
    category: "emergencia",
    description: { es: "Número único de emergencias europeo: policía, ambulancia y bomberos.", en: "Single European emergency number: police, ambulance, fire.", it: "Numero unico europeo di emergenza." },
    phone: "112",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
  {
    id: "antitratta",
    name: "Numero Verde Antitratta",
    category: "emergencia",
    description: {
      es: "Línea anónima y gratuita las 24 horas para víctimas de trata o explotación laboral. Atienden en varios idiomas. Si conoces un caso, también puedes llamar para denunciarlo.",
      en: "Anonymous, free 24h helpline for victims of trafficking or labour exploitation. Multilingual. Anyone can call to report a case.",
      it: "Numero gratuito e anonimo h24 per vittime di tratta e sfruttamento, multilingue.",
    },
    phone: "800 290 290",
    url: "https://www.osservatoriointerventitratta.it/en/helpline-800-290-290/",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
  {
    id: "inps",
    name: "INPS — Contact Center",
    category: "institucion",
    description: {
      es: "Pensiones, Assegno Unico, ADI y ayudas. Desde fijo llama al 803 164 (gratis); desde móvil, al 06 164 164 (de pago, según tu tarifa).",
      en: "Pensions, Assegno Unico, ADI and benefits. From a landline call 803 164 (free); from a mobile, 06 164 164 (charged at your carrier's rate).",
      it: "803 164 da fisso, 06 164 164 da cellulare.",
    },
    phone: "803 164",
    url: "https://www.inps.it/",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
  {
    id: "agenzia-entrate",
    name: "Agenzia delle Entrate",
    category: "institucion",
    description: {
      es: "Código fiscal, tarjeta sanitaria e impuestos. Pide cita en su web.",
      en: "Tax code, health card and taxes. Book appointments on their website.",
      it: "Codice fiscale, tessera sanitaria, fisco.",
    },
    url: "https://www.agenziaentrate.gov.it/",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
  {
    id: "portale-immigrazione",
    name: "Portale Immigrazione",
    category: "institucion",
    description: { es: "Estado de tu solicitud de permiso y oficinas habilitadas.", en: "Permit application status and authorised offices.", it: "Stato della pratica di permesso." },
    url: "https://www.portaleimmigrazione.it/",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
  {
    id: "integrazione-migranti",
    name: "Integrazione Migranti (gov.it)",
    category: "institucion",
    description: { es: "Portal oficial del Gobierno para personas extranjeras, con información en varios idiomas.", en: "Official government portal for foreign nationals, multilingual.", it: "Portale istituzionale multilingue." },
    url: "https://integrazionemigranti.gov.it/",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
  {
    id: "unhcr-help",
    name: "UNHCR Help Italia",
    category: "ong",
    description: { es: "Información de ACNUR sobre asilo, protección y servicios en Italia.", en: "UNHCR information on asylum, protection and services in Italy.", it: "Informazioni UNHCR su asilo e servizi." },
    url: "https://help.unhcr.org/italy/",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
  {
    id: "asgi",
    name: "ASGI — Associazione per gli Studi Giuridici sull'Immigrazione",
    category: "ong",
    description: { es: "Asociación de juristas especializada en inmigración y antidiscriminación.", en: "Association of immigration and anti-discrimination legal experts.", it: "Associazione di giuristi sull'immigrazione." },
    url: "https://www.asgi.it/",
    free: true,
    verified: true,
    lastVerified: "2026-11-11",
  },
];

export const directoryCategories = {
  emergencia: { es: "Emergencias", en: "Emergencies" },
  institucion: { es: "Instituciones", en: "Institutions" },
  ong: { es: "ONG y asociaciones", en: "NGOs" },
  patronato: { es: "Patronatos y CAF (gratis)", en: "Patronati & CAF (free)" },
  abogado: { es: "Abogados", en: "Lawyers" },
  salud: { es: "Salud", en: "Health" },
  dentista: { es: "Dentistas", en: "Dentists" },
} as const;
