import type { OfficialDocument } from "./types";

/**
 * Formularios y documentos OFICIALES por trámite.
 * Enlazamos al archivo en la web del organismo (no guardamos copias): así el usuario
 * descarga siempre la versión vigente. Todos los enlaces se comprobaron el 2026-11-12
 * y `npm run check:freshness` los vuelve a comprobar cada semana.
 */
export const documents: OfficialDocument[] = [
  // ── Permiso de residencia ──
  {
    id: "kit-documenti",
    guide: "permesso-di-soggiorno",
    title: {
      es: "Lista de documentos que van dentro del kit, según tu tipo de permiso",
      en: "List of documents to put in the kit, by permit type",
      it: "Documenti da inserire nel kit postale per tipologia di permesso",
    },
    description: {
      es: "Tabla oficial de la Polizia di Stato. Busca tu tipo de permiso y marca cada documento.",
      en: "Official Polizia di Stato table. Find your permit type and tick off each document.",
      it: "Tabella ufficiale della Polizia di Stato.",
    },
    url: "https://questure.poliziadistato.it/statics/29/documenti-da-inserire-nel-kit-postale-per-le-principali-tipologie-di-permesso-di-soggiorno.pdf",
    kind: "pdf",
    fillable: false,
    issuer: "Polizia di Stato",
    lastVerified: "2026-11-12",
  },
  {
    id: "modalita-rilascio-rinnovo",
    guide: "permesso-di-soggiorno",
    title: {
      es: "Cómo se pide y se renueva el permiso (instrucciones oficiales)",
      en: "How to apply for and renew the permit (official instructions)",
      it: "Modalità di richiesta, rilascio e rinnovo del permesso di soggiorno",
    },
    description: {
      es: "Documento de la Polizia di Stato con el procedimiento completo.",
      en: "Polizia di Stato document describing the full procedure.",
      it: "Documento della Polizia di Stato con la procedura completa.",
    },
    url: "https://questure.poliziadistato.it/statics/44/1_modalita-richiesta-rilascio-rinnovo-soggiorno.pdf?lang=it",
    kind: "pdf",
    fillable: false,
    issuer: "Polizia di Stato",
    lastVerified: "2026-11-12",
  },
  {
    id: "dichiarazione-presenza",
    guide: "permesso-di-soggiorno",
    title: {
      es: "Declaración de presencia (dichiarazione di presenza)",
      en: "Declaration of presence (dichiarazione di presenza)",
      it: "Dichiarazione di presenza",
    },
    description: {
      es: "Formulario bilingüe (italiano/inglés) para estancias cortas de hasta 90 días. Si entras desde otro país Schengen, se presenta en la Questura en un plazo de 8 días.",
      en: "Bilingual form (Italian/English) for short stays of up to 90 days. If you enter from another Schengen country, file it at the Questura within 8 days.",
      it: "Modulo bilingue per soggiorni brevi fino a 90 giorni: va presentato in Questura entro 8 giorni se si entra da un Paese Schengen.",
    },
    url: "https://www.poliziadistato.it/statics/14/dichiarazione-di-presenza.pdf",
    kind: "pdf",
    fillable: true,
    issuer: "Polizia di Stato",
    lastVerified: "2026-11-12",
  },
  {
    id: "portale-tipologie",
    guide: "permesso-di-soggiorno",
    title: {
      es: "Qué permisos se piden con el kit de Correos y oficinas habilitadas",
      en: "Which permits use the post office kit, and authorised offices",
      it: "Tipologie di richiesta e uffici abilitati",
    },
    description: {
      es: "Portale Immigrazione: tipos de solicitud, estado de tu trámite y buscador de oficinas. El kit en papel solo se recoge en Correos.",
      en: "Portale Immigrazione: request types, application status and office finder. The paper kit is only available at the post office.",
      it: "Portale Immigrazione: tipologie, stato della pratica e ricerca strutture.",
    },
    url: "https://www.portaleimmigrazione.it/ITA/tipologiedirichiesta.html",
    kind: "web",
    fillable: false,
    issuer: "Portale Immigrazione",
    lastVerified: "2026-11-12",
  },
  // ── Código fiscal ──
  {
    id: "aa48-editabile",
    guide: "codice-fiscale",
    title: {
      es: "Modelo AA4/8: solicitud del código fiscal (PDF rellenable)",
      en: "Form AA4/8: tax code application (fillable PDF)",
      it: "Modello AA4/8: richiesta di codice fiscale (PDF editabile)",
    },
    description: {
      es: "El formulario oficial. Puedes rellenarlo en el ordenador o el móvil y luego imprimirlo.",
      en: "The official form. Fill it in on your computer or phone, then print it.",
      it: "Il modello ufficiale, compilabile a video.",
    },
    url: "https://www.agenziaentrate.gov.it/portale/documents/20143/278893/modello+editabile+AA4_8_AA4-8+ita_giugno.pdf/2094fd47-b6ec-f19e-dace-f49eb1ba07a8?t=1749733351614",
    kind: "pdf",
    fillable: true,
    issuer: "Agenzia delle Entrate",
    lastVerified: "2026-11-12",
  },
  {
    id: "aa48-istruzioni",
    guide: "codice-fiscale",
    title: {
      es: "Instrucciones para rellenar el modelo AA4/8",
      en: "Instructions for filling in form AA4/8",
      it: "Istruzioni per la compilazione del modello AA4/8",
    },
    description: {
      es: "Explica cada casilla del formulario (en italiano).",
      en: "Explains each box on the form (in Italian).",
      it: "Spiega ogni campo del modello.",
    },
    url: "https://www.agenziaentrate.gov.it/portale/documents/20143/278893/istruzioni+cf+AA48_istruzioni+modello+AA4+8.pdf/1c62b06c-535a-5b59-c8e0-4a329a5b4668?t=1372163197137",
    kind: "pdf",
    fillable: false,
    issuer: "Agenzia delle Entrate",
    lastVerified: "2026-11-12",
  },
  {
    id: "cf-stranieri-en",
    guide: "codice-fiscale",
    title: {
      es: "Folleto oficial: código fiscal para extranjeros (en inglés)",
      en: "Official leaflet: tax code for foreign citizens (English)",
      it: "Pieghevole ufficiale: codice fiscale per stranieri (inglese)",
    },
    description: {
      es: "Guía breve de la Agenzia delle Entrate para personas extranjeras.",
      en: "Short Agenzia delle Entrate guide for foreign citizens.",
      it: "Guida breve dell'Agenzia delle Entrate.",
    },
    url: "https://www.agenziaentrate.gov.it/portale/documents/20143/233505/Folder_CodiceFiscaleStranieri_ING.pdf/23b9c5b2-4713-155c-9e18-07e60798dbfa?t=1682082532628",
    kind: "pdf",
    fillable: false,
    issuer: "Agenzia delle Entrate",
    lastVerified: "2026-11-12",
  },
  // ── Sanidad ──
  {
    id: "guida-tessera-sanitaria",
    guide: "sanidad-tessera-sanitaria",
    title: {
      es: "Guía oficial de la tarjeta sanitaria",
      en: "Official health card guide",
      it: "Guida alla Tessera Sanitaria",
    },
    description: {
      es: "Qué es, cómo se obtiene y cómo pedir un duplicado. El formulario de inscripción al médico lo da cada ASL: pídelo en la tuya.",
      en: "What it is, how to get it and how to request a duplicate. The doctor registration form is provided by each ASL: ask at yours.",
      it: "Cos'è, come si ottiene e come chiedere il duplicato. Il modulo di iscrizione è fornito da ogni ASL.",
    },
    url: "https://www.agenziaentrate.gov.it/portale/documents/20143/233439/Guida_Tessera_Sanitaria.pdf/b5425990-f483-2600-cd6e-d45f660782a3",
    kind: "pdf",
    fillable: false,
    issuer: "Agenzia delle Entrate",
    lastVerified: "2026-11-12",
  },
  // ── Residencia ──
  {
    id: "ospitalita",
    guide: "residencia-anagrafica",
    title: {
      es: "Comunicación de hospitalidad (comunicazione di ospitalità)",
      en: "Declaration of hospitality (comunicazione di ospitalità)",
      it: "Comunicazione di ospitalità in favore di cittadino extracomunitario",
    },
    description: {
      es: "La rellena quien te aloja en su casa (art. 7 del D.Lgs. 286/1998) y la presenta en 48 horas. Algunas Questure usan su propio modelo: confírmalo en la tuya.",
      en: "Filled in by the person hosting you (art. 7, D.Lgs. 286/1998) and filed within 48 hours. Some Questure use their own form: check with yours.",
      it: "La compila chi ospita (art. 7 D.Lgs. 286/1998), entro 48 ore. Alcune Questure usano un proprio modulo.",
    },
    url: "https://questure.poliziadistato.it/statics/24/modulo-dichiarazione-ospitalita.pdf",
    kind: "pdf",
    fillable: true,
    issuer: "Polizia di Stato",
    lastVerified: "2026-11-12",
  },
  {
    id: "anpr-residenza",
    guide: "residencia-anagrafica",
    title: {
      es: "Declaración de residencia online (ANPR)",
      en: "Online residence declaration (ANPR)",
      it: "Dichiarazione di residenza online (ANPR)",
    },
    description: {
      es: "Servicio oficial del Ministerio del Interior para declarar o cambiar la residencia con SPID o CIE. Si no puedes hacerlo online, tu Comune te da el formulario en papel.",
      en: "Official Ministry of the Interior service to declare or change residence with SPID or CIE. If you can't do it online, your Comune gives you the paper form.",
      it: "Servizio ufficiale per dichiarare o cambiare residenza con SPID o CIE.",
    },
    url: "https://www.anagrafenazionale.interno.it/servizi-al-cittadino/",
    kind: "web",
    fillable: true,
    issuer: "Ministero dell'Interno",
    lastVerified: "2026-11-12",
  },
];

export function documentsFor(guide: string): OfficialDocument[] {
  return documents.filter((d) => d.guide === guide);
}
