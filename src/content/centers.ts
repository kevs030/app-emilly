import type { Lang } from "@/content/types";

type T = Record<Lang, string>;

/** Oficinas a las que una persona migrante suele tener que ir en Italia. Las fotos son ilustrativas (generadas), no de una oficina concreta. */
export type Center = { id: string; img: string; name: T; local: string; what: T; href: string };

export const centers: Center[] = [
  {
    id: "questura",
    img: "questura",
    local: "Questura · Ufficio Immigrazione",
    name: { es: "Oficina de inmigración", en: "Immigration office", it: "Ufficio Immigrazione" },
    what: {
      es: "Huellas, foto y entrega del permiso de residencia (permesso di soggiorno). Se va con cita.",
      en: "Fingerprints, photo and collection of your residence permit (permesso di soggiorno). By appointment.",
      it: "Impronte, foto e ritiro del permesso di soggiorno. Si va su appuntamento.",
    },
    href: "/guias/permesso-di-soggiorno",
  },
  {
    id: "correos",
    img: "correos",
    local: "Poste Italiane · Sportello Amico",
    name: { es: "Oficina de correos", en: "Post office", it: "Ufficio postale" },
    what: {
      es: "Aquí se recoge y se envía el «kit» para pedir o renovar muchos permisos de residencia.",
      en: "Where you collect and send the “kit” to apply for or renew many residence permits.",
      it: "Qui si ritira e si spedisce il «kit» per chiedere o rinnovare molti permessi di soggiorno.",
    },
    href: "/guias/permesso-di-soggiorno",
  },
  {
    id: "comune",
    img: "comune",
    local: "Comune · Anagrafe",
    name: { es: "Ayuntamiento (registro civil)", en: "Town hall (registry office)", it: "Comune · Anagrafe" },
    what: {
      es: "Residencia (empadronamiento) y carta de identidad. La residencia abre la puerta a muchos otros trámites.",
      en: "Registered residence and identity card. Residence opens the door to many other procedures.",
      it: "Residenza anagrafica e carta d'identità. La residenza apre la porta a molte altre pratiche.",
    },
    href: "/guias/residencia-anagrafica",
  },
  {
    id: "sanidad",
    img: "sanidad",
    local: "ASL · Medico di base",
    name: { es: "Centro de salud", en: "Health centre", it: "ASL e medico di base" },
    what: {
      es: "Inscripción en la sanidad pública y elección de médico. Sin permiso, el código STP da acceso a la atención urgente y esencial.",
      en: "Join the public health service and choose a doctor. Without a permit, the STP code gives access to urgent and essential care.",
      it: "Iscrizione al Servizio sanitario e scelta del medico. Senza permesso, il codice STP dà accesso alle cure urgenti ed essenziali.",
    },
    href: "/guias/sanidad-tessera-sanitaria",
  },
  {
    id: "inps",
    img: "inps",
    local: "Agenzia delle Entrate · INPS",
    name: { es: "Hacienda y Seguridad Social", en: "Tax office and social security", it: "Agenzia delle Entrate e INPS" },
    what: {
      es: "Código fiscal (Agenzia delle Entrate) y ayudas, cotizaciones y prestaciones (INPS).",
      en: "Tax code (Agenzia delle Entrate) and benefits, contributions and allowances (INPS).",
      it: "Codice fiscale (Agenzia delle Entrate) e bonus, contributi e prestazioni (INPS).",
    },
    href: "/guias/codice-fiscale",
  },
  {
    id: "patronato",
    img: "patronato",
    local: "Patronato · CAF",
    name: { es: "Patronato y CAF", en: "Patronato and CAF", it: "Patronato e CAF" },
    what: {
      es: "Ayuda gratuita para rellenar formularios, el kit del permiso y solicitudes al INPS. Nadie debe cobrarte por un trámite.",
      en: "Free help filling in forms, the permit kit and INPS applications. Nobody should charge you for a procedure.",
      it: "Aiuto gratuito per moduli, kit del permesso e domande all'INPS. Nessuno deve farti pagare una pratica.",
    },
    href: "/contactos",
  },
  {
    id: "escuela",
    img: "escuela",
    local: "CPIA · Scuola per adulti",
    name: { es: "Escuela de italiano para adultos", en: "Italian school for adults", it: "CPIA · Scuola per adulti" },
    what: {
      es: "Cursos de italiano gratuitos. El nivel A2 se pide, por ejemplo, para el permiso UE de larga duración.",
      en: "Free Italian courses. Level A2 is required, for example, for the EU long-term residence permit.",
      it: "Corsi di italiano gratuiti. Il livello A2 serve, per esempio, per il permesso UE per soggiornanti di lungo periodo.",
    },
    href: "/mapa",
  },
];
