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
          es: "Necesitas el permesso di soggiorno (o el recibo de la solicitud o renovación), el codice fiscale, tu documento (pasaporte o Carta d'Identità) y una prueba de dónde vives: residencia o, si no la tienes, la Dichiarazione di Ospitalità.",
          en: "You need your permesso di soggiorno (or the application/renewal receipt), your codice fiscale, your ID (passport or Carta d'Identità) and proof of where you live: residence or, if you have none, the Dichiarazione di Ospitalità.",
          it: "Servono permesso di soggiorno (o ricevuta della richiesta o del rinnovo), codice fiscale, documento (passaporto o Carta d'Identità) e prova di dove abiti: residenza oppure, se non ce l'hai, la Dichiarazione di Ospitalità.",
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
      { es: "Permesso di soggiorno o recibo de la solicitud/renovación", en: "Permesso di soggiorno or application/renewal receipt", it: "Permesso di soggiorno o ricevuta della richiesta/rinnovo" },
      { es: "Codice fiscale", en: "Codice fiscale (tax code)", it: "Codice fiscale" },
      { es: "Pasaporte o Carta d'Identità", en: "Passport or Carta d'Identità", it: "Passaporto o Carta d'Identità" },
      { es: "Certificado de residencia o Dichiarazione di Ospitalità (declaración de hospitalidad)", en: "Residence certificate or Dichiarazione di Ospitalità (hospitality declaration)", it: "Certificato di residenza o Dichiarazione di Ospitalità" },
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
  {
    slug: "articolo-31",
    icon: "👨‍👩‍👧",
    category: "familia",
    title: {
      es: "Art. 31: permiso para quedarte en Italia por el bien de tu hijo menor",
      en: "Art. 31: permit to stay in Italy for the sake of your minor child",
      it: "Art. 31: autorizzazione a restare in Italia nell'interesse del figlio minore",
    },
    summary: {
      es: "El Tribunal de Menores puede autorizar a un familiar de un niño que vive en Italia a entrar o quedarse durante un tiempo, aunque no tenga permiso, cuando hay motivos graves ligados al desarrollo físico y psicológico del menor. Con esa autorización, la Questura da el permiso «assistenza minori», que permite trabajar.",
      en: "The Juvenile Court can authorise a family member of a child living in Italy to enter or stay for a set time, even without a permit, when there are serious reasons linked to the child's physical and psychological development. With that authorisation, the Questura issues the “assistenza minori” permit, which allows you to work.",
      it: "Il Tribunale per i Minorenni può autorizzare un familiare del minore a entrare o restare in Italia per un tempo determinato, per gravi motivi legati allo sviluppo psicofisico del minore. Con il decreto, la Questura rilascia il permesso per assistenza minori, che consente di lavorare.",
    },
    steps: [
      {
        title: { es: "Busca orientación gratuita antes de empezar", en: "Get free guidance before you start", it: "Chiedi un orientamento gratuito" },
        body: {
          es: "El tribunal decide caso por caso y no siempre concede la autorización. Habla antes con un abogado de extranjería, un Patronato o una asociación (por ejemplo ASGI o Caritas). Si tienes pocos ingresos puedes pedir abogado gratuito (patrocinio a spese dello Stato).",
          en: "The court decides case by case and does not always grant the authorisation. First talk to an immigration lawyer, a Patronato or an association (such as ASGI or Caritas). On a low income you can ask for free legal aid (patrocinio a spese dello Stato).",
          it: "Il tribunale decide caso per caso. Rivolgiti prima a un avvocato, a un Patronato o a un'associazione. Con reddito basso puoi chiedere il patrocinio a spese dello Stato.",
        },
      },
      {
        title: { es: "Rellena la solicitud (istanza)", en: "Fill in the application (istanza)", it: "Compila l'istanza" },
        body: {
          es: "Cada Tribunal de Menores tiene su propio formulario: descárgalo de su web o pídelo en la secretaría (cancelleria). Se indican tus datos y los del menor, tu pasaporte, cómo y cuándo entraste en Italia, quién vive en casa y los motivos por los que el niño te necesita aquí. Algunos tribunales, como el de Campobasso, indican que puedes presentarla tú mismo sin abogado.",
          en: "Each Juvenile Court has its own form: download it from its website or ask at the registry (cancelleria). You state your details and the child's, your passport, how and when you entered Italy, who lives in the household and why the child needs you here. Some courts, such as Campobasso, state that you can file it yourself without a lawyer.",
          it: "Ogni Tribunale per i Minorenni ha il proprio modulo: scaricalo dal sito o chiedilo in cancelleria. Alcuni tribunali indicano che l'istanza può essere presentata personalmente.",
        },
      },
      {
        title: { es: "Preséntala en el Tribunal de Menores", en: "File it at the Juvenile Court", it: "Presentala al Tribunale per i Minorenni" },
        body: {
          es: "Se presenta en el Tribunale per i Minorenni que corresponde al lugar donde vive el niño (hay uno por cada distrito de Corte de Apelación, normalmente en la capital de la región). Pagas una tasa de 27 € por PagoPA. El procedimiento está exento del «contributo unificato».",
          en: "File it at the Tribunale per i Minorenni for the place where the child lives (there is one per Court of Appeal district, usually in the regional capital). You pay a €27 fee via PagoPA. The procedure is exempt from the “contributo unificato”.",
          it: "Si presenta al Tribunale per i Minorenni competente per il luogo in cui vive il minore. Si versano 27 € di diritti tramite PagoPA; il procedimento è esente da contributo unificato.",
        },
      },
      {
        title: { es: "El tribunal estudia el caso", en: "The court examines the case", it: "Il tribunale valuta" },
        body: {
          es: "El tribunal valora el interés del menor: su edad, su salud, su arraigo (escuela, vida en Italia) y el daño que le causaría separarse de ti o tener que irse. Puede pedir informes a los servicios sociales y citarte a una audiencia. Decide con un decreto que fija cuánto dura la autorización.",
          en: "The court weighs the child's interests: age, health, roots (school, life in Italy) and the harm that separation from you or having to leave would cause. It may request social services reports and call you to a hearing. It decides by decree, which sets how long the authorisation lasts.",
          it: "Il tribunale valuta età, salute e radicamento del minore e il pregiudizio derivante dalla separazione. Decide con decreto, che fissa la durata dell'autorizzazione.",
        },
      },
      {
        title: { es: "Con el decreto, ve a la Questura", en: "Take the decree to the Questura", it: "Con il decreto vai in Questura" },
        body: {
          es: "Con el decreto favorable pides en la oficina de inmigración de la Questura el permiso por «assistenza minori». Dura lo que indique el decreto y te permite trabajar. Antes de que venza, hay que pedir de nuevo la autorización al tribunal.",
          en: "With a favourable decree you apply at the Questura immigration office for the “assistenza minori” permit. It lasts as long as the decree states and allows you to work. Before it expires, you must ask the court for a new authorisation.",
          it: "Con il decreto favorevole si chiede in Questura il permesso per assistenza minori, della durata fissata dal decreto, che consente di lavorare.",
        },
      },
    ],
    documents: [
      { es: "Tu pasaporte y el del menor", en: "Your passport and the child's", it: "Passaporto tuo e del minore" },
      { es: "Certificado de nacimiento del menor (que demuestre el parentesco)", en: "The child's birth certificate (proving the relationship)", it: "Atto di nascita del minore" },
      { es: "Pruebas de la situación del niño: matrícula y asistencia a la escuela, informes médicos o psicológicos, informes de servicios sociales", en: "Evidence of the child's situation: school enrolment and attendance, medical or psychological reports, social services reports", it: "Prove della situazione del minore: scuola, relazioni mediche o psicologiche, servizi sociali" },
      { es: "Datos de la familia y de la vivienda (quién vive en casa, contrato de alquiler u hospitalidad)", en: "Family and housing details (who lives in the home, rental contract or hospitality)", it: "Composizione del nucleo familiare e alloggio" },
      { es: "Justificante del pago de 27 € (PagoPA)", en: "Proof of the €27 payment (PagoPA)", it: "Ricevuta del versamento di 27 € (PagoPA)" },
      { es: "Para la Questura, después: el decreto del tribunal y fotos de carnet", en: "For the Questura, afterwards: the court decree and passport photos", it: "Per la Questura: decreto del tribunale e fototessere" },
    ],
    costs: {
      es: "27 € de tasas de secretaría (PagoPA). Sin «contributo unificato». La lista exacta de documentos cambia según el tribunal: confírmala en su web o en la secretaría.",
      en: "€27 in registry fees (PagoPA). No “contributo unificato”. The exact document list varies by court: confirm it on its website or at the registry.",
      it: "27 € di diritti (PagoPA), senza contributo unificato. L'elenco dei documenti varia da tribunale a tribunale.",
    },
    extra: {
      title: { es: "Ayudas que puedes pedir con este permiso", en: "Benefits you can claim with this permit", it: "Prestazioni che puoi chiedere con questo permesso" },
      items: [
        {
          es: "Assegno Unico: sí. El INPS admite el permiso por «assistenza minori» (mensaje INPS 2951 del 25/07/2022). En 2026 son como máximo 203,80 € al mes por cada hijo menor (con ISEE de hasta 17.468,51 €) y como mínimo 58,30 € al mes (con ISEE por encima de 46.582,71 € o sin ISEE).",
          en: "Assegno Unico: yes. INPS accepts the “assistenza minori” permit (INPS message 2951 of 25/07/2022). In 2026 it is at most €203.80 a month per minor child (ISEE up to €17,468.51) and at least €58.30 a month (ISEE above €46,582.71 or no ISEE).",
          it: "Assegno Unico: sì (messaggio INPS 2951/2022). Nel 2026 da 58,30 € a 203,80 € al mese per figlio minorenne, in base all'ISEE.",
        },
        {
          es: "Bono por nacimiento (1.000 €): desde 2026 vale cualquier permiso de al menos 1 año, con ISEE de hasta 40.000 €. Si tu permiso dura menos de un año, pregunta en un Patronato.",
          en: "New baby bonus (€1,000): since 2026 any permit of at least 1 year qualifies, with ISEE up to €40,000. If your permit is shorter than a year, ask a Patronato.",
          it: "Bonus nuovi nati (1.000 €): dal 2026 con qualsiasi permesso di almeno un anno e ISEE fino a 40.000 €.",
        },
        {
          es: "Para cobrar cualquier ayuda necesitas código fiscal, ISEE y una cuenta con IBAN a tu nombre. Los Patronatos y CAF hacen el ISEE y la solicitud gratis.",
          en: "To receive any benefit you need a tax code, an ISEE and an account with an IBAN in your name. Patronati and CAF prepare the ISEE and the application for free.",
          it: "Servono codice fiscale, ISEE e un conto con IBAN intestato a te. Patronati e CAF aiutano gratis.",
        },
      ],
    },
    warnings: [
      {
        es: "No está garantizado. Si el tribunal lo deniega, hay muy pocos días para recurrir: habla con un abogado enseguida.",
        en: "It is not guaranteed. If the court refuses, there are very few days to appeal: talk to a lawyer straight away.",
        it: "Non è garantito. In caso di rigetto i termini per il reclamo sono brevi: rivolgiti subito a un avvocato.",
      },
      {
        es: "¿Se puede pasar después a un permiso de trabajo? Desde 2020 la ley lo incluye entre los permisos convertibles si cumples los requisitos (art. 6, apartado 1-bis, del Texto Único). Algunas webs de tribunales todavía dicen lo contrario. Confírmalo con un abogado o un Patronato antes de dar el paso.",
        en: "Can you later switch to a work permit? Since 2020 the law lists it among convertible permits if you meet the requirements (art. 6, para. 1-bis, of the Consolidated Act). Some court websites still say otherwise. Confirm with a lawyer or a Patronato first.",
        it: "Conversione in lavoro: dal 2020 la legge la prevede se ricorrono i requisiti (art. 6, c. 1-bis, TUI), ma alcuni siti di tribunali indicano ancora il contrario. Verifica con un avvocato.",
      },
      {
        es: "La autorización se puede revocar si desaparecen los motivos graves o si tu conducta es incompatible con las necesidades del menor.",
        en: "The authorisation can be revoked if the serious reasons cease or your conduct is incompatible with the child's needs.",
        it: "L'autorizzazione è revocata se cessano i gravi motivi o per attività incompatibili con le esigenze del minore.",
      },
      {
        es: "Desconfía de quien te «garantice» el art. 31 a cambio de dinero. Nadie puede prometer lo que decide un juez.",
        en: "Be wary of anyone who “guarantees” art. 31 for money. Nobody can promise what a judge decides.",
        it: "Diffida di chi «garantisce» l'art. 31 a pagamento.",
      },
    ],
    sources: [
      { title: "Normattiva: art. 31 del D.Lgs. 286/1998 (texto de la ley)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-07-25;286~art31", official: true },
      { title: "Tribunale per i Minorenni di Campobasso: solicitudes ex art. 31", url: "https://tribmin-campobasso.giustizia.it/it/art_31_d_lgs_286_98.page", official: true },
      { title: "Corte d'Appello di Trento: formularios art. 31", url: "https://www.corteappello.trento.it/minori/minori_cfp.aspx?cfp_id_scheda=3937", official: true },
      { title: "ASGI: mensaje INPS 2951/2022 (Assegno Unico y permiso assistenza minori)", url: "https://www.asgi.it/antidiscriminazione/auu-importanti-novita-con-il-messaggio-inps-n-2951-del-25-luglio-2022/", official: false },
      { title: "INPS: Assegno Unico 2026, importes actualizados", url: "https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.assegno-unico-2026-presentazione-domanda-e-aggiornamento-importi.html", official: true },
    ],
    lastVerified: "2026-11-12",
  },
  {
    slug: "derechos-trabajo-en-negro",
    icon: "⚖️",
    category: "trabajo",
    title: {
      es: "Trabajaste en negro: también te corresponden la tredicesima y el TFR",
      en: "You worked off the books: you are still owed the 13th-month pay and TFR",
      it: "Hai lavorato in nero: tredicesima e TFR ti spettano lo stesso",
    },
    summary: {
      es: "Aunque no hubiera contrato ni alta en el INPS, el trabajo que hiciste da derecho a salario, tredicesima, vacaciones, TFR y cotizaciones (art. 2126 del Código Civil). Vale también para colf, badanti y acompañantes de personas mayores, aunque el trabajo no fuera físicamente pesado.",
      en: "Even with no contract and no INPS registration, the work you did entitles you to pay, 13th-month pay, holidays, TFR (severance) and contributions (art. 2126 of the Civil Code). This also applies to domestic workers, carers and companions of elderly people, even if the work was not physically heavy.",
      it: "Anche senza contratto e senza comunicazione all'INPS, il lavoro prestato dà diritto a retribuzione, tredicesima, ferie, TFR e contributi (art. 2126 c.c.). Vale anche per colf, badanti e assistenti di compagnia, anche se il lavoro non era fisicamente pesante.",
    },
    steps: [
      {
        title: { es: "Ten claro que la ley te protege", en: "Know that the law protects you", it: "Sappi che la legge ti tutela" },
        body: {
          es: "El art. 2126 del Código Civil dice que, aunque el contrato falte o sea irregular, el trabajo ya hecho produce todos sus efectos: por ese periodo te corresponde todo como si hubieras estado en regla. No haberte dado de alta era obligación del empleador, no tuya, y no puede servirle de excusa para no pagarte. Lo que cuenta son los hechos: si trabajabas de forma continua, siguiendo las indicaciones de la familia y a cambio de un pago, eras trabajador subordinado (art. 2094).",
          en: "Art. 2126 of the Civil Code says that, even if the contract is missing or irregular, work already done has full effect: for that period you are owed everything as if you had been registered. Registering you was the employer's duty, not yours, and it cannot be an excuse not to pay you. What counts are the facts: if you worked regularly, following the family's instructions and for pay, you were an employee (art. 2094).",
          it: "L'art. 2126 c.c. stabilisce che, anche se il contratto manca o è irregolare, il lavoro prestato produce tutti i suoi effetti: per quel periodo ti spetta tutto come se fossi stato in regola. La regolarizzazione era un obbligo del datore di lavoro e non può diventare un motivo per non pagarti. Contano i fatti: lavoro continuativo, secondo le indicazioni della famiglia e dietro compenso = lavoro subordinato (art. 2094 c.c.).",
        },
      },
      {
        title: { es: "Calcula lo que te corresponde", en: "Work out what you are owed", it: "Calcola quanto ti spetta" },
        body: {
          es: "En el trabajo doméstico se aplica el convenio colectivo nacional (CCNL lavoro domestico). La tredicesima es una paga extra al año: un mes de sueldo que se acumula mes a mes y se paga en diciembre o, en proporción, al terminar. El TFR (liquidación) es, por cada año, el sueldo anual dividido entre 13,5, revalorizado. Si vivías en la casa, en el cálculo entra también el valor de la comida y el alojamiento. Un sindicato o Patronato te hace el cálculo gratis con los mínimos de cada año.",
          en: "For domestic work, the national collective agreement applies (CCNL lavoro domestico). The 13th-month pay (tredicesima) is one extra month's pay a year, built up month by month and paid in December or, pro rata, when the job ends. TFR (severance) is, for each year, the annual pay divided by 13.5, revalued. If you lived in, the value of board and lodging also counts. A trade union or Patronato will do the calculation for free using each year's minimum rates.",
          it: "Nel lavoro domestico si applica il CCNL lavoro domestico. La tredicesima matura mese per mese e si paga a dicembre o, in proporzione, alla cessazione. Il TFR è, per ogni anno, la retribuzione annua divisa per 13,5, rivalutata. Per i conviventi conta anche il valore convenzionale di vitto e alloggio. Un sindacato o un Patronato fa il calcolo gratis con i minimi di ogni anno.",
        },
      },
      {
        title: { es: "Junta las pruebas antes de reclamar", en: "Gather evidence before you claim", it: "Raccogli le prove prima di chiedere" },
        body: {
          es: "Sin contrato, tienes que demostrar que la relación existió. Vale cualquier medio: mensajes de WhatsApp con la familia (sobre todo los que hablan de horarios, tareas o del sueldo), transferencias o recibos, fotos y testigos (vecinos, médicos, enfermeras, farmacia). Guarda copias en otro sitio antes de reclamar, por si la relación con la familia se rompe.",
          en: "Without a contract, you must prove the job existed. Any evidence counts: WhatsApp messages with the family (especially about hours, tasks or pay), bank transfers or receipts, photos and witnesses (neighbours, doctors, nurses, pharmacy). Save copies somewhere else before you claim, in case the relationship with the family breaks down.",
          it: "Senza contratto devi provare il rapporto. Vale ogni mezzo: messaggi con la famiglia (soprattutto su orari, mansioni o paga), bonifici o ricevute, foto e testimoni (vicini, medici, infermieri, farmacia). Salva delle copie altrove prima di chiedere.",
        },
      },
      {
        title: { es: "Pide ayuda gratis a un sindicato o Patronato", en: "Get free help from a union or Patronato", it: "Chiedi aiuto gratuito a un sindacato o Patronato" },
        body: {
          es: "Los sindicatos que firman el convenio doméstico (Filcams-CGIL, Fisascat-CISL, UILTuCS, Federcolf) y los Patronatos revisan tu caso, calculan los importes y te acompañan. Si no tienes permiso de residencia en regla, cuéntaselo antes de reclamar: los derechos del art. 2126 existen igualmente, pero conviene preparar bien los pasos.",
          en: "The unions that sign the domestic work agreement (Filcams-CGIL, Fisascat-CISL, UILTuCS, Federcolf) and Patronati review your case, calculate the amounts and support you. If your residence permit is not in order, tell them before you claim: your art. 2126 rights still exist, but the steps need careful preparation.",
          it: "I sindacati firmatari del CCNL domestico (Filcams-CGIL, Fisascat-CISL, UILTuCS, Federcolf) e i Patronati valutano il caso, calcolano gli importi e ti accompagnano. Se il tuo permesso non è in regola, dillo prima di agire: i diritti dell'art. 2126 restano, ma i passi vanno preparati bene.",
        },
      },
      {
        title: { es: "Envía una reclamación formal por escrito", en: "Send a formal written claim", it: "Invia una richiesta formale scritta" },
        body: {
          es: "Una carta (messa in mora) por carta certificada con acuse de recibo o PEC, con las leyes y los importes, pidiendo el pago en un plazo (por ejemplo, 15 días). Además de pedir el dinero, interrumpe la prescripción (art. 2943 del Código Civil). Mantén un tono tranquilo y deja abierta la posibilidad de un acuerdo.",
          en: "A letter (messa in mora) by recorded delivery or PEC, citing the laws and amounts and asking for payment within a deadline (for example, 15 days). Besides claiming the money, it interrupts the limitation period (art. 2943 of the Civil Code). Keep a calm tone and leave the door open to an agreement.",
          it: "Una lettera di messa in mora (raccomandata A/R o PEC) con norme e importi, chiedendo il pagamento entro un termine (per esempio 15 giorni). Interrompe anche la prescrizione (art. 2943 c.c.). Tono calmo e disponibilità a un accordo.",
        },
      },
      {
        title: { es: "Si no pagan: conciliación o juez", en: "If they don't pay: conciliation or court", it: "Se non pagano: conciliazione o giudice" },
        body: {
          es: "Con el sindicato puedes pedir un intento de conciliación ante el Ispettorato Territoriale del Lavoro (art. 410 del Código de Procedimiento Civil). Si no hay acuerdo, se va al Juez Laboral, que también puede ordenar que se paguen las cotizaciones al INPS.",
          en: "With the union you can request a conciliation attempt at the Ispettorato Territoriale del Lavoro (art. 410 of the Code of Civil Procedure). If there is no agreement, the case goes to the Labour Court, which can also order the INPS contributions to be paid.",
          it: "Con il sindacato si può chiedere il tentativo di conciliazione presso l'Ispettorato Territoriale del Lavoro (art. 410 c.p.c.). In mancanza di accordo si va dal Giudice del Lavoro, anche per la regolarizzazione contributiva.",
        },
      },
    ],
    documents: [
      { es: "Mensajes con la familia (horarios, tareas, pagos)", en: "Messages with the family (hours, tasks, payments)", it: "Messaggi con la famiglia (orari, mansioni, pagamenti)" },
      { es: "Transferencias, recibos o anotaciones de los pagos", en: "Bank transfers, receipts or notes of payments", it: "Bonifici, ricevute o annotazioni dei pagamenti" },
      { es: "Nombres y contacto de testigos", en: "Names and contact details of witnesses", it: "Nomi e recapiti dei testimoni" },
      { es: "Fechas de inicio y fin, horas por semana y si vivías en la casa", en: "Start and end dates, weekly hours and whether you lived in", it: "Date di inizio e fine, ore settimanali, convivenza sì/no" },
      { es: "Si los hay: certificados de salud o invalidez de la persona asistida (definen el nivel del contrato)", en: "If available: health or disability certificates of the person cared for (they set the pay level)", it: "Se disponibili: certificati sanitari o di invalidità della persona assistita (determinano il livello)" },
      { es: "Tu documento de identidad y código fiscal", en: "Your ID and tax code", it: "Documento d'identità e codice fiscale" },
    ],
    costs: {
      es: "Sindicatos y Patronatos orientan gratis o con una cuota de afiliación baja. Si hay que ir a juicio y tienes pocos ingresos, puedes pedir abogado gratuito (patrocinio a spese dello Stato).",
      en: "Unions and Patronati advise for free or for a small membership fee. If it goes to court and you are on a low income, you can ask for free legal aid (patrocinio a spese dello Stato).",
      it: "Sindacati e Patronati orientano gratis o con una quota associativa. In giudizio, con reddito basso, si può chiedere il patrocinio a spese dello Stato.",
    },
    extra: {
      title: {
        es: "Las leyes que te protegen (para enseñarlas al empleador)",
        en: "The laws that protect you (to show the employer)",
        it: "Le norme che ti tutelano (da mostrare al datore di lavoro)",
      },
      items: [
        {
          es: "Art. 2126 del Código Civil: el trabajo hecho sin contrato o con contrato irregular da los mismos derechos que uno regular por todo el periodo trabajado. Es la ley clave para el trabajo en negro.",
          en: "Art. 2126 Civil Code: work done without a contract, or under an irregular one, gives the same rights as a regular job for the whole period worked. It is the key law for off-the-books work.",
          it: "Art. 2126 c.c.: il lavoro prestato senza contratto o con contratto irregolare dà gli stessi diritti di un rapporto regolare per tutto il periodo lavorato. È la norma chiave per il lavoro in nero.",
        },
        {
          es: "Art. 2094 del Código Civil: eres trabajador subordinado si trabajas bajo la dirección de otro y a cambio de un pago. No hace falta papel firmado.",
          en: "Art. 2094 Civil Code: you are an employee if you work under someone else's direction and for pay. No signed paper is needed.",
          it: "Art. 2094 c.c.: è subordinato chi lavora alle dipendenze e sotto la direzione altrui. Non serve un contratto firmato.",
        },
        {
          es: "Art. 2120 del Código Civil: el TFR corresponde «en todo caso» de fin de la relación laboral subordinada.",
          en: "Art. 2120 Civil Code: TFR is owed “in every case” when an employment relationship ends.",
          it: "Art. 2120 c.c.: il TFR spetta «in ogni caso di cessazione» del rapporto di lavoro subordinato.",
        },
        {
          es: "Art. 36 de la Constitución: todo trabajador tiene derecho a un salario proporcionado a su trabajo y suficiente para una vida digna. Los mínimos del convenio colectivo son la referencia.",
          en: "Art. 36 of the Constitution: every worker is entitled to pay proportionate to their work and enough for a dignified life. The collective agreement's minimums are the benchmark.",
          it: "Art. 36 Cost.: retribuzione proporzionata alla quantità e qualità del lavoro e sufficiente a un'esistenza libera e dignitosa. I minimi del CCNL sono il parametro.",
        },
        {
          es: "Convenio colectivo del trabajo doméstico (CCNL, renovado el 28 de octubre de 2025) y Ley 339/1958: reconocen 13 pagas al año (12 + tredicesima) y el TFR a colf, badanti y asistentes familiares.",
          en: "Domestic work collective agreement (CCNL, renewed on 28 October 2025) and Law 339/1958: they grant 13 monthly payments a year (12 + tredicesima) and TFR to domestic workers and carers.",
          it: "CCNL lavoro domestico (rinnovo del 28 ottobre 2025) e Legge 339/1958: 13 mensilità annue (12 + tredicesima) e TFR per colf, badanti e assistenti familiari.",
        },
        {
          es: "«No hacías trabajo pesado» no es un argumento válido: tredicesima y TFR no dependen del esfuerzo físico. El tipo de tarea solo cambia el nivel del contrato (y el importe), nunca el derecho. El convenio clasifica la asistencia según el estado de la persona atendida (autosuficiente o no), no según la fuerza que haga falta.",
          en: "“The work wasn't heavy” is not a valid argument: tredicesima and TFR do not depend on physical effort. The type of task only changes the pay level (and the amount), never the right itself. The agreement grades care work by the condition of the person cared for (self-sufficient or not), not by the strength required.",
          it: "«Non facevi lavori pesanti» non è un argomento valido: tredicesima e TFR non dipendono dalla fatica fisica. Le mansioni incidono solo sul livello (e sull'importo), mai sul diritto. Il CCNL inquadra l'assistenza in base alle condizioni della persona assistita, non allo sforzo fisico.",
        },
        {
          es: "Estar disponible para emergencias también es trabajo. El propio convenio paga la «presenza notturna» (quedarse en la casa para intervenir si hace falta) y la «assistenza notturna» (espera con intervenciones discontinuas). La ley define el tiempo de trabajo como el tiempo en que estás «a disposición del empleador» (art. 1 del D.Lgs. 66/2003), y el Tribunal de Justicia de la UE confirmó que la disponibilidad con fuertes límites cuenta como trabajo (caso Matzak, C-518/15). Quien acompaña a una persona mayor y está pendiente de caídas, malestares o cualquier imprevisto está trabajando, aunque no haga esfuerzo físico.",
          en: "Being available for emergencies is also work. The agreement itself pays for “presenza notturna” (staying in the home to step in if needed) and “assistenza notturna” (waiting with occasional interventions). The law defines working time as time when you are “at the employer's disposal” (art. 1, Legislative Decree 66/2003), and the EU Court of Justice confirmed that heavily restricted stand-by time counts as work (Matzak, C-518/15). Someone who keeps an elderly person company and watches out for falls, illness or anything unexpected is working, even without physical effort.",
          it: "Anche la disponibilità per le emergenze è lavoro. Il CCNL retribuisce la «presenza notturna» (restare in casa per intervenire in caso di necessità) e l'«assistenza notturna» (attesa con interventi discontinui). L'art. 1 del D.Lgs. 66/2003 definisce orario di lavoro il periodo in cui si è «a disposizione del datore di lavoro» e la Corte di Giustizia UE (causa C-518/15, Matzak) ha confermato che la reperibilità con forti vincoli è orario di lavoro. Chi fa compagnia a una persona anziana ed è pronto a intervenire per cadute, malori o imprevisti sta lavorando, anche senza sforzo fisico.",
        },
      ],
    },
    warnings: [
      {
        es: "Plazos: los créditos salariales y el TFR prescriben a los 5 años (art. 2948 del Código Civil), contados desde el fin de la relación laboral (Casación, sentencia 26246/2022). Para la tredicesima existe además una presunción de pago de 3 años (art. 2956), que se cae si el empleador admite que no pagó. No esperes.",
        en: "Deadlines: pay claims and TFR expire after 5 years (art. 2948 Civil Code), counted from the end of the job (Court of Cassation, ruling 26246/2022). For the tredicesima there is also a 3-year presumption of payment (art. 2956), which falls if the employer admits not paying. Don't wait.",
        it: "Prescrizione: crediti retributivi e TFR si prescrivono in 5 anni (art. 2948 c.c.), dalla cessazione del rapporto (Cass. 26246/2022). Per la tredicesima c'è anche la prescrizione presuntiva triennale (art. 2956 c.c.), che cade se il datore ammette di non aver pagato.",
      },
      {
        es: "No firmes ningún papel tipo «recibí todo y no reclamo nada más» fuera de una sede oficial (sindicato, Ispettorato del Lavoro). Una renuncia firmada en privado se puede impugnar solo dentro de 6 meses (art. 2113 del Código Civil).",
        en: "Do not sign any paper saying “I received everything and will claim nothing more” outside an official setting (union, Labour Inspectorate). A waiver signed privately can only be challenged within 6 months (art. 2113 Civil Code).",
        it: "Non firmare rinunce o quietanze «a saldo» fuori da una sede protetta (sindacato, Ispettorato). Una rinuncia firmata in privato si impugna solo entro 6 mesi (art. 2113 c.c.).",
      },
      {
        es: "El empleador puede negar la relación, decir que trabajaste menos horas o que el sueldo ya lo incluía todo. Quien dice haber pagado tiene que probarlo, pero las horas y la duración las tienes que demostrar tú: por eso las pruebas son lo más importante.",
        en: "The employer may deny the job, say you worked fewer hours or that the pay already included everything. Whoever claims to have paid must prove it, but you must prove the hours and duration: that is why evidence matters most.",
        it: "Il datore può negare il rapporto, ridurre le ore o sostenere che la paga comprendeva tutto. Chi afferma di aver pagato deve provarlo, ma ore e durata le devi provare tu: le prove sono decisive.",
      },
      {
        es: "Si cobrabas una ayuda pública (por ejemplo el Assegno di Inclusione) mientras trabajabas en negro, coméntalo con el sindicato antes de reclamar: puede tener consecuencias.",
        en: "If you were receiving a public benefit (such as the Assegno di Inclusione) while working off the books, discuss it with the union before claiming: it may have consequences.",
        it: "Se percepivi una prestazione pubblica (per esempio l'Assegno di Inclusione) mentre lavoravi in nero, parlane con il sindacato prima di agire.",
      },
      {
        es: "Esta guía resume la ley; no sustituye a un abogado laboralista o a un sindicato, que deben revisar tu caso concreto.",
        en: "This guide summarises the law; it does not replace an employment lawyer or a union, who should review your specific case.",
        it: "Questa guida riassume la normativa e non sostituisce un avvocato giuslavorista o un sindacato.",
      },
    ],
    sources: [
      { title: "Normattiva: Código Civil, art. 2126 (trabajo sin contrato o irregular)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262~art2126", official: true },
      { title: "Normattiva: Código Civil, art. 2094 (trabajador subordinado)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262~art2094", official: true },
      { title: "Normattiva: Código Civil, art. 2120 (TFR)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262~art2120", official: true },
      { title: "Normattiva: Código Civil, art. 2948 (prescripción de 5 años)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262~art2948", official: true },
      { title: "Senado: Constitución, art. 36 (salario justo)", url: "https://www.senato.it/istituzione/la-costituzione/parte-i/titolo-iii/articolo-36", official: true },
      { title: "Normattiva: Ley 339/1958 (trabajo doméstico)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1958-04-02;339", official: true },
      { title: "Normattiva: D.Lgs. 66/2003, art. 1 (tiempo de trabajo)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2003-04-08;66~art1", official: true },
      { title: "Ministerio de Trabajo: lavoro domestico, convenio y salarios mínimos 2026", url: "https://lavoro.gov.it/taxonomy/term/136", official: true },
      { title: "Ispettorato Nazionale del Lavoro: nota 1959/2022 (prescripción desde el fin de la relación, Cass. 26246/2022)", url: "https://portist-int.ispettorato.gov.it/files/2023/01/INL-nota-30-settembre-2022-prescrizione-crediti-da-lavoro.pdf", official: true },
      { title: "EUR-Lex: Tribunal de Justicia UE, caso Matzak C-518/15 (disponibilidad = tiempo de trabajo)", url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:62015CJ0518", official: true },
    ],
    lastVerified: "2026-11-21",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
