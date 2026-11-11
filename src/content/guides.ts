import type { Guide } from "./types";

/**
 * Guías paso a paso. REGLA: nada se publica sin fuente.
 * Cada guía tiene `lastVerified`; el script `npm run check:freshness`
 * avisa cuando una guía lleva más de 7 días sin revisión.
 */
export const guides: Guide[] = [
  {
    slug: "permesso-di-soggiorno",
    icon: "🪪",
    category: "documentos",
    title: {
      es: "Pedir o renovar el permiso de residencia (permesso di soggiorno)",
      en: "Apply for or renew your residence permit (permesso di soggiorno)",
      it: "Richiedere o rinnovare il permesso di soggiorno",
    },
    summary: {
      es: "Para la mayoría de los permisos se usa el 'kit amarillo' de Correos (Poste Italiane). Luego la Questura te cita para las huellas y para recoger la tarjeta.",
      en: "For most permit types you use the yellow 'kit' from the post office (Poste Italiane). The Questura then calls you in for fingerprints and to collect the card.",
      it: "Per la maggior parte dei permessi si usa il kit giallo di Poste Italiane. Poi la Questura convoca per le impronte e per il ritiro.",
    },
    steps: [
      {
        title: { es: "Revisa la fecha", en: "Check the date", it: "Controlla la scadenza" },
        body: {
          es: "Pide la renovación antes de que venza. Se recomienda hacerlo hasta 60 días antes del vencimiento.",
          en: "Apply before your permit expires. It is recommended to apply up to 60 days before the expiry date.",
          it: "Presenta la domanda prima della scadenza, idealmente fino a 60 giorni prima.",
        },
      },
      {
        title: { es: "Recoge el kit", en: "Get the kit", it: "Ritira il kit" },
        body: {
          es: "Recoge el kit amarillo gratis en una oficina de Correos con 'Sportello Amico'. Los Patronatos y algunos Comunes ayudan a rellenarlo gratis.",
          en: "Pick up the free yellow kit at a post office with a 'Sportello Amico' desk. Patronati and some municipalities help you fill it in for free.",
          it: "Ritira gratuitamente il kit giallo in un ufficio postale 'Sportello Amico'. Patronati e alcuni Comuni aiutano a compilarlo gratis.",
        },
      },
      {
        title: { es: "Rellena y prepara copias", en: "Fill it in and prepare copies", it: "Compila e prepara le copie" },
        body: {
          es: "Rellena los formularios (módulo 1, y el 2 si aplica). Adjunta FOTOCOPIAS de los documentos, nunca originales. NO cierres el sobre: Correos lo revisa.",
          en: "Fill in the forms (form 1, and form 2 if it applies). Attach PHOTOCOPIES of your documents, never originals. Do NOT seal the envelope: the post office checks it.",
          it: "Compila i moduli (modulo 1 e, se serve, modulo 2). Allega FOTOCOPIE, mai originali. NON chiudere la busta.",
        },
      },
      {
        title: { es: "Envíalo y guarda el recibo", en: "Send it and keep the receipt", it: "Spedisci e conserva la ricevuta" },
        body: {
          es: "Solo tú puedes entregar el kit en Correos. El recibo de Correos sirve como permiso provisional mientras esperas: te permite seguir viviendo, trabajando y usando la sanidad.",
          en: "Only you can hand in the kit at the post office. The postal receipt works as a temporary permit while you wait: you can keep living, working and using healthcare.",
          it: "Solo il richiedente può presentare il kit. La ricevuta vale come permesso provvisorio durante l'attesa.",
        },
      },
      {
        title: { es: "Ve a la cita en la Questura", en: "Attend the Questura appointment", it: "Vai all'appuntamento in Questura" },
        body: {
          es: "La Questura te da una cita para las huellas. Cuando el permiso está listo, lo recoges. Revisa el estado en el Portale Immigrazione o en la web de la Polizia di Stato.",
          en: "The Questura gives you an appointment for fingerprints. When the permit is ready, you collect it. Check the status on the Portale Immigrazione or the Polizia di Stato website.",
          it: "La Questura fissa l'appuntamento per le impronte e poi per il ritiro. Controlla lo stato sul Portale Immigrazione.",
        },
      },
    ],
    documents: [
      { es: "Pasaporte (copia de todas las páginas)", en: "Passport (copy of all pages)", it: "Passaporto (copia di tutte le pagine)" },
      { es: "Permiso actual (copia), si es una renovación", en: "Current permit (copy), if renewing", it: "Permesso attuale (copia), se rinnovo" },
      { es: "4 fotos de carnet", en: "4 passport photos", it: "4 fototessere" },
      { es: "Documentos según el tipo de permiso (contrato de trabajo, nóminas, CUD, matrícula escolar…)", en: "Documents for your permit type (work contract, payslips, school enrolment…)", it: "Documenti specifici per il tipo di permesso" },
      { es: "Sello fiscal (marca da bollo)", en: "Revenue stamp (marca da bollo)", it: "Marca da bollo" },
    ],
    costs: {
      es: "Aproximado, y las fuentes no coinciden: envío del kit unos 30 €, recibo de pago de 70,46 € (permisos de hasta 1 año) u 80,46 € (permisos más largos) y la marca da bollo. Confirma el importe en Correos o en tu Questura antes de pagar.",
      en: "Approximate, and sources disagree: about €30 to send the kit, a €70.46 (permits up to 1 year) or €80.46 (longer permits) payment slip, plus the revenue stamp. Confirm the amount at the post office or your Questura before paying.",
      it: "Indicativo (le fonti non coincidono): circa 30 € di spedizione, bollettino da 70,46 € o 80,46 € e marca da bollo. Verifica in Posta o in Questura.",
    },
    warnings: [
      {
        es: "Algunas Questure cambiaron en 2026 a recogida solo con cita. Revisa la página de TU Questura.",
        en: "Some Questure switched in 2026 to collection by appointment only. Check YOUR Questura's page.",
        it: "Alcune Questure dal 2026 consegnano solo su appuntamento. Controlla la tua Questura.",
      },
      {
        es: "Nadie puede 'acelerar' tu permiso a cambio de dinero. Si te lo ofrecen, es una estafa.",
        en: "Nobody can 'speed up' your permit for money. If someone offers that, it is a scam.",
        it: "Nessuno può 'velocizzare' il permesso a pagamento: è una truffa.",
      },
    ],
    videoIds: ["X99d3lCnvhM", "jPuB4nk6VJc"],
    sources: [
      {
        title: "Polizia di Stato: documentos del kit postal por tipo de permiso (PDF)",
        url: "https://questure.poliziadistato.it/statics/29/documenti-da-inserire-nel-kit-postale-per-le-principali-tipologie-di-permesso-di-soggiorno.pdf",
        official: true,
      },
      {
        title: "Questura di Asti: emisión o renovación del permiso",
        url: "https://questure.poliziadistato.it/it/Asti/articolo/81861fc0bf87c624531899609",
        official: true,
      },
      { title: "Portale Immigrazione", url: "https://www.portaleimmigrazione.it/", official: true },
    ],
    lastVerified: "2026-11-11",
  },
  {
    slug: "codice-fiscale",
    icon: "🔢",
    category: "documentos",
    title: {
      es: "Obtener el código fiscal (codice fiscale)",
      en: "Get your tax code (codice fiscale)",
      it: "Ottenere il codice fiscale",
    },
    summary: {
      es: "Es tu número personal en Italia. Lo necesitas para trabajar, alquilar, ir al médico y pedir ayudas. Es gratis y no caduca.",
      en: "It is your personal number in Italy. You need it to work, rent, see a doctor and apply for benefits. It is free and never expires.",
      it: "È il tuo numero personale in Italia: serve per lavoro, affitto, sanità e bonus. È gratuito e non scade.",
    },
    steps: [
      {
        title: { es: "Rellena el formulario", en: "Fill in the form", it: "Compila il modulo" },
        body: {
          es: "Rellena el formulario de solicitud de código fiscal de la Agenzia delle Entrate (en el video oficial te explican cómo).",
          en: "Fill in the Agenzia delle Entrate tax code application form (the official video shows how).",
          it: "Compila il modulo di richiesta di attribuzione del codice fiscale (vedi video ufficiale).",
        },
      },
      {
        title: { es: "Ve a la Agenzia delle Entrate", en: "Go to the Agenzia delle Entrate", it: "Vai all'Agenzia delle Entrate" },
        body: {
          es: "Llévalo a una oficina territorial de la Agenzia delle Entrate con tu pasaporte y tu permiso de residencia (o el recibo). Conviene pedir cita por su web.",
          en: "Take it to an Agenzia delle Entrate local office with your passport and residence permit (or the receipt). It is best to book an appointment online.",
          it: "Presentalo a un ufficio territoriale dell'Agenzia con passaporto e permesso (o ricevuta). Meglio prenotare.",
        },
      },
      {
        title: { es: "Guarda el certificado", en: "Keep the certificate", it: "Conserva il certificato" },
        body: {
          es: "Te dan un certificado con el código. Sirve mientras llega la tarjeta. También lo puedes descargar en el área personal de la Agenzia.",
          en: "You get a certificate with your code. It works until the card arrives. You can also download it from your Agenzia personal area.",
          it: "Ricevi un certificato valido in attesa della tessera, scaricabile anche dall'area riservata.",
        },
      },
    ],
    documents: [
      { es: "Pasaporte", en: "Passport", it: "Passaporto" },
      { es: "Permiso de residencia o recibo de la solicitud", en: "Residence permit or application receipt", it: "Permesso di soggiorno o ricevuta" },
    ],
    costs: { es: "Gratis.", en: "Free.", it: "Gratuito." },
    videoIds: ["x6jHgcuyJ5o", "ZZLnIPbpd1Q"],
    sources: [{ title: "Agenzia delle Entrate", url: "https://www.agenziaentrate.gov.it/", official: true }],
    lastVerified: "2026-11-11",
  },
  {
    slug: "sanidad-tessera-sanitaria",
    icon: "🏥",
    category: "salud",
    title: {
      es: "Inscribirte en la sanidad pública (SSN) y elegir médico",
      en: "Register with public healthcare (SSN) and choose a doctor",
      it: "Iscriversi al Servizio Sanitario Nazionale e scegliere il medico",
    },
    summary: {
      es: "Con permiso de residencia válido te inscribes en la ASL, eliges médico de cabecera y después te llega la tarjeta sanitaria (tessera sanitaria).",
      en: "With a valid residence permit you register at the ASL, choose a family doctor and then receive your health card (tessera sanitaria).",
      it: "Con permesso valido ci si iscrive all'ASL, si sceglie il medico e poi arriva la tessera sanitaria.",
    },
    steps: [
      {
        title: { es: "Prepara los documentos", en: "Prepare documents", it: "Prepara i documenti" },
        body: {
          es: "Necesitas el permiso (o el recibo), el código fiscal y el certificado de residencia o de domicilio.",
          en: "You need your permit (or receipt), your tax code and a residence or domicile certificate.",
          it: "Servono permesso (o ricevuta), codice fiscale e certificato di residenza o domicilio.",
        },
      },
      {
        title: { es: "Ve a la ASL", en: "Go to the ASL", it: "Vai all'ASL" },
        body: {
          es: "En la oficina de la ASL de tu zona pides la inscripción y eliges tu médico de cabecera (medico di base). Si tienes hijos, eliges también su pediatra.",
          en: "At your local ASL office, register and choose your family doctor (medico di base). If you have children, also choose their paediatrician.",
          it: "All'ASL ti iscrivi e scegli il medico di base (e il pediatra per i figli).",
        },
      },
      {
        title: { es: "Recibe la tarjeta", en: "Receive the card", it: "Ricevi la tessera" },
        body: {
          es: "La tarjeta sanitaria llega a casa después de la inscripción. Si se pierde, puedes pedir un duplicado online en la web de la Agenzia delle Entrate.",
          en: "The health card arrives at home after registration. If you lose it, you can request a duplicate online from the Agenzia delle Entrate website.",
          it: "La tessera arriva a casa. In caso di smarrimento si chiede il duplicato online.",
        },
      },
    ],
    documents: [
      { es: "Permiso de residencia o recibo", en: "Residence permit or receipt", it: "Permesso o ricevuta" },
      { es: "Código fiscal", en: "Tax code", it: "Codice fiscale" },
      { es: "Certificado de residencia o domicilio", en: "Residence or domicile certificate", it: "Certificato di residenza o domicilio" },
      { es: "Documento de identidad", en: "ID document", it: "Documento d'identità" },
    ],
    warnings: [
      {
        es: "Sin permiso de residencia también tienes derecho a atención urgente y esencial con el código STP. Ir al médico no te denuncia.",
        en: "Without a residence permit you still have the right to urgent and essential care through an STP code.",
        it: "Anche senza permesso hai diritto alle cure urgenti ed essenziali con il codice STP.",
      },
      {
        es: "Algunos tipos de permiso no tienen inscripción obligatoria y deben pagar una inscripción voluntaria. Pregunta en la ASL.",
        en: "Some permit types do not get mandatory registration and must pay for voluntary registration. Ask at the ASL.",
        it: "Per alcuni permessi l'iscrizione è volontaria e a pagamento. Chiedi all'ASL.",
      },
    ],
    videoIds: ["VgLavmwPb70", "R8h9OAtgD1E"],
    sources: [
      { title: "Istituto Superiore di Sanità: folleto de derechos sanitarios (PDF)", url: "https://www.epicentro.iss.it/ivg/pdf/3_Opuscolo%20diritti%20sanitari-STAMPA.pdf", official: true },
      { title: "Sistema Tessera Sanitaria", url: "https://sistemats1.sanita.finanze.it/portale/", official: true },
    ],
    lastVerified: "2026-11-11",
  },
  {
    slug: "residencia-anagrafica",
    icon: "🏠",
    category: "documentos",
    title: {
      es: "Registrar tu residencia en el Ayuntamiento (Comune)",
      en: "Register your residence at the town hall (Comune)",
      it: "Iscrizione anagrafica (residenza) in Comune",
    },
    summary: {
      es: "Registrarte como residente abre la puerta a la carta de identidad, a muchas ayudas y, con los años, a la ciudadanía. Los años de residencia cuentan desde que te registras.",
      en: "Registering as a resident unlocks the ID card, many benefits and, over the years, citizenship. Years of residence count from your registration.",
      it: "L'iscrizione anagrafica dà accesso a carta d'identità, molti bonus e, nel tempo, alla cittadinanza.",
    },
    steps: [
      {
        title: { es: "Pide la inscripción", en: "Apply", it: "Fai la domanda" },
        body: {
          es: "Presenta la solicitud en la oficina de registro (Ufficio Anagrafe) de tu Comune. Muchos Comunes la aceptan también online o por correo electrónico certificado (PEC).",
          en: "Apply at your Comune's registry office (Ufficio Anagrafe). Many Comuni also accept it online or by certified email (PEC).",
          it: "Presenta la dichiarazione all'Ufficio Anagrafe del Comune (anche online o PEC in molti Comuni).",
        },
      },
      {
        title: { es: "Espera el control", en: "Wait for the check", it: "Attendi il controllo" },
        body: {
          es: "La Policía Local pasa por tu casa para comprobar que vives allí. Pon tu nombre en el buzón y en el timbre.",
          en: "Local police visit your home to check that you live there. Put your name on the mailbox and doorbell.",
          it: "La Polizia Locale verifica la dimora: metti il nome su campanello e cassetta postale.",
        },
      },
    ],
    documents: [
      { es: "Pasaporte y permiso de residencia (o recibo)", en: "Passport and residence permit (or receipt)", it: "Passaporto e permesso (o ricevuta)" },
      { es: "Código fiscal", en: "Tax code", it: "Codice fiscale" },
      { es: "Contrato de alquiler, escritura o declaración de hospitalidad", en: "Rental contract, deed, or declaration of hospitality", it: "Contratto d'affitto, atto di proprietà o dichiarazione di ospitalità" },
    ],
    warnings: [
      {
        es: "Los requisitos cambian de un Comune a otro. Revisa la web de tu Comune antes de ir.",
        en: "Requirements vary from one Comune to another. Check your Comune's website before you go.",
        it: "Ogni Comune ha procedure proprie: controlla il sito del tuo Comune.",
      },
    ],
    sources: [{ title: "Integrazione Migranti (Ministerio de Trabajo)", url: "https://integrazionemigranti.gov.it/", official: true }],
    lastVerified: "2026-11-11",
  },
  {
    slug: "decreto-flussi",
    icon: "💼",
    category: "trabajo",
    title: {
      es: "Venir a trabajar con el Decreto Flussi 2026-2028",
      en: "Coming to work through the Decreto Flussi 2026-2028",
      it: "Ingresso per lavoro: Decreto Flussi 2026-2028",
    },
    summary: {
      es: "Es el sistema de cupos para entrar a trabajar legalmente. Para 2026-2028 hay unos 497.550 cupos. La solicitud la presenta el EMPLEADOR, no el trabajador.",
      en: "This is the quota system for entering Italy legally to work. There are about 497,550 places for 2026-2028. The EMPLOYER submits the application, not the worker.",
      it: "Il sistema di quote per l'ingresso per lavoro: circa 497.550 ingressi nel triennio. La domanda la presenta il DATORE DI LAVORO.",
    },
    steps: [
      {
        title: { es: "El empleador hace la solicitud", en: "The employer applies", it: "Il datore presenta la domanda" },
        body: {
          es: "Una empresa real en Italia presenta la solicitud online en las fechas fijadas por el decreto. El decreto 2026-2028 reorganizó el sistema y cambió el antiguo 'click day' único.",
          en: "A real company in Italy applies online on the dates set by the decree. The 2026-2028 decree reorganised the system and changed the old single 'click day'.",
          it: "Un'azienda reale presenta la domanda online nelle date previste. Il decreto 2026-2028 ha rivisto il vecchio click day.",
        },
      },
      {
        title: { es: "Nulla osta y visado", en: "Work authorisation and visa", it: "Nulla osta e visto" },
        body: {
          es: "Si la solicitud entra en el cupo, se emite la autorización (nulla osta). Con ella pides el visado en el consulado italiano de tu país. Si no pides el visado a tiempo, la autorización caduca sola.",
          en: "If the application falls within the quota, the authorisation (nulla osta) is issued. With it, you apply for a visa at the Italian consulate in your country. If you don't apply for the visa in time, the authorisation lapses automatically.",
          it: "Se rientra nelle quote si ottiene il nulla osta e si chiede il visto al consolato. Il nulla osta decade se il visto non è chiesto in tempo.",
        },
      },
      {
        title: { es: "Al llegar a Italia", en: "On arrival in Italy", it: "All'arrivo" },
        body: {
          es: "Firma el contrato de residencia en la Prefectura (Sportello Unico) y pide el permiso de residencia.",
          en: "Sign the residence contract at the Prefecture (Sportello Unico) and apply for the residence permit.",
          it: "Firma il contratto di soggiorno allo Sportello Unico e chiedi il permesso.",
        },
      },
    ],
    documents: [{ es: "Pasaporte válido", en: "Valid passport", it: "Passaporto valido" }],
    warnings: [
      {
        es: "ESTAFA MUY COMÚN: intermediarios cobran miles de euros por un 'contrato' de una empresa que no existe. Nunca pagues por un puesto de trabajo. Ha habido detenciones en Nápoles, Mantua, Salerno y otras ciudades.",
        en: "VERY COMMON SCAM: middlemen charge thousands of euros for a 'contract' with a company that doesn't exist. Never pay for a job offer. There have been arrests in Naples, Mantua, Salerno and other cities.",
        it: "TRUFFA FREQUENTE: intermediari chiedono migliaia di euro per contratti di aziende inesistenti. Non pagare mai per un posto di lavoro.",
      },
      {
        es: "Pocas solicitudes acaban en un permiso real. Para 2024, de 146.850 entradas programadas solo se pidieron 24.858 permisos de residencia.",
        en: "Few applications end in an actual permit. For 2024, out of 146,850 planned entries, only 24,858 residence permits were requested.",
        it: "Pochi ingressi si traducono in permessi: nel 2024 solo 24.858 permessi richiesti su 146.850 quote.",
      },
    ],
    sources: [
      { title: "Ministerio de Trabajo: Flussi 2026-2028", url: "https://www.lavoro.gov.it/priorita/pagine/flussi-2026-2028-pubblicato-il-decreto-da-oltre-497mila-ingressi", official: true },
      { title: "Integrazione Migranti: Flussi 2026", url: "https://integrazionemigranti.gov.it/it-it/Dettaglio-approfondimento/id/64/Flussi-2026", official: true },
      { title: "Il Post: estafas del decreto flussi (enero 2026)", url: "https://www.ilpost.it/2026/01/27/decreto-flussi-truffati-napoli/", official: false },
      { title: "Avvenire: datos del decreto flussi", url: "https://www.avvenire.it/attualita/meno-di-un-lavoratore-migrante-su-12-e-regolarizzato-tutti-i-numeri-dei-decreti-flussi_104821", official: false },
    ],
    lastVerified: "2026-11-11",
  },
  {
    slug: "ciudadania",
    icon: "🇮🇹",
    category: "ciudadania",
    title: {
      es: "Pedir la ciudadanía italiana por residencia",
      en: "Apply for Italian citizenship by residence",
      it: "Cittadinanza italiana per residenza",
    },
    summary: {
      es: "Si eres de fuera de la UE, la regla general es tener 10 años de residencia legal, un nivel B1 de italiano, ingresos suficientes y antecedentes penales limpios.",
      en: "If you are from outside the EU, the general rule is 10 years of legal residence, B1-level Italian, sufficient income and a clean criminal record.",
      it: "Per gli extra-UE: 10 anni di residenza legale, italiano B1, reddito adeguato e fedina penale pulita.",
    },
    steps: [
      {
        title: { es: "Revisa los requisitos", en: "Check the requirements", it: "Verifica i requisiti" },
        body: {
          es: "Cuentan los años con residencia registrada en el Comune y permiso válido, sin interrupciones. La ley 74/2025 cambió sobre todo la ciudadanía por descendencia, no los 10 años de la naturalización.",
          en: "What counts are the years with registered residence at the Comune and a valid permit, without gaps. Law 74/2025 mainly changed citizenship by descent, not the 10-year naturalisation rule.",
          it: "Contano gli anni di residenza anagrafica con permesso valido, senza interruzioni. La legge 74/2025 ha toccato soprattutto lo ius sanguinis.",
        },
      },
      {
        title: { es: "Certificado B1", en: "B1 certificate", it: "Certificazione B1" },
        body: {
          es: "Obtén un certificado de italiano B1 de un centro autorizado. Los titulares del permiso UE de larga duración (soggiornanti di lungo periodo) pueden estar exentos.",
          en: "Get a B1 Italian certificate from an authorised centre. Holders of the EU long-term residence permit (soggiornanti di lungo periodo) may be exempt.",
          it: "Ottieni la certificazione B1 da un ente certificatore. I soggiornanti di lungo periodo possono essere esenti.",
        },
      },
      {
        title: { es: "Solicitud online", en: "Online application", it: "Domanda online" },
        body: {
          es: "La solicitud se presenta online en el portal del Ministerio del Interior, con SPID. Prepara el certificado de nacimiento y el de antecedentes penales de tu país, legalizados y traducidos.",
          en: "You apply online on the Ministry of the Interior portal, using SPID. Prepare your birth certificate and criminal record certificate from your country, legalised and translated.",
          it: "La domanda si presenta online sul portale del Ministero dell'Interno con SPID.",
        },
      },
    ],
    documents: [
      { es: "Certificado de nacimiento (legalizado y traducido)", en: "Birth certificate (legalised and translated)", it: "Atto di nascita (legalizzato e tradotto)" },
      { es: "Antecedentes penales de tu país (legalizados y traducidos)", en: "Criminal record from your country (legalised and translated)", it: "Certificato penale del Paese d'origine" },
      { es: "Certificado de italiano B1", en: "B1 Italian certificate", it: "Certificazione B1" },
      { es: "Declaraciones de la renta de los últimos años", en: "Tax returns for recent years", it: "Dichiarazioni dei redditi" },
    ],
    warnings: [
      {
        es: "Los trámites tardan años. Revisa el texto vigente de la ley en Normattiva antes de presentar la solicitud.",
        en: "The process takes years. Check the current law text on Normattiva before applying.",
        it: "I tempi sono lunghi: verifica il testo vigente su Normattiva.",
      },
    ],
    sources: [
      { title: "Normattiva: texto consolidado DL 36/2025", url: "https://www.normattiva.it/eli/id/2025/03/28/25G00049/CONSOLIDATED", official: true },
      { title: "Ministerio del Interior", url: "https://www.interno.gov.it/", official: true },
    ],
    lastVerified: "2026-11-11",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
