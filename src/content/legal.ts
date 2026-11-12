import type { L10n } from "./types";

/**
 * Política de privacidad de A posto (app y web). Describe lo que el código hace de verdad.
 * BORRADOR: debe revisarlo un profesional de protección de datos antes del lanzamiento.
 * Si cambia el tratamiento de datos en el código, hay que actualizar este texto y su fecha.
 */
export const PRIVACY_UPDATED = "2026-11-12";

export const privacyIntro: L10n = {
  es: "A posto te ayuda con tus trámites en Italia. Aquí explicamos, en claro, qué datos guardamos, para qué y cómo puedes borrarlos.",
  it: "A posto ti aiuta con le pratiche in Italia. Qui spieghiamo in modo chiaro quali dati conserviamo, perché e come puoi cancellarli.",
  en: "A posto helps you with paperwork in Italy. Here we explain plainly which data we keep, why, and how you can delete it.",
};

export const privacySections: { title: L10n; items: L10n[] }[] = [
  {
    title: { es: "Qué datos guardamos", it: "Quali dati conserviamo", en: "What data we keep" },
    items: [
      {
        es: "Tu cuenta: correo o número de teléfono, para que puedas entrar. Tu contraseña se guarda cifrada y no podemos leerla.",
        it: "Il tuo account: email o numero di telefono, per farti accedere. La password è conservata cifrata e non possiamo leggerla.",
        en: "Your account: email or phone number, so you can sign in. Your password is stored encrypted and we cannot read it.",
      },
      {
        es: "Tu perfil: el nombre que elijas y tu idioma. Solo si lo aceptas, también país de origen, ciudad, tipo de permiso, su fecha de vencimiento y si tienes hijos a cargo.",
        it: "Il tuo profilo: il nome che scegli e la lingua. Solo se acconsenti, anche Paese d'origine, città, tipo di permesso, scadenza e figli a carico.",
        en: "Your profile: the name you choose and your language. Only if you agree, also country of origin, city, permit type, its expiry date and whether you have dependent children.",
      },
      {
        es: "Tu progreso: los trámites que empiezas, los pasos y documentos que marcas, tus recordatorios y los temas que eliges como interés.",
        it: "I tuoi progressi: le pratiche che inizi, i passaggi e i documenti che segni, i promemoria e i temi che scegli come interesse.",
        en: "Your progress: the procedures you start, the steps and documents you tick, your reminders and the topics you pick as interests.",
      },
      {
        es: "Historial de actividad: qué guía abriste o qué paso marcaste, para que puedas continuar donde lo dejaste. Guardamos como máximo las últimas 300 acciones y puedes borrarlas.",
        it: "Cronologia attività: quale guida hai aperto o quale passaggio hai segnato, per riprendere da dove avevi lasciato. Conserviamo al massimo le ultime 300 azioni e puoi cancellarle.",
        en: "Activity history: which guide you opened or which step you ticked, so you can pick up where you left off. We keep at most the last 300 actions and you can delete them.",
      },
      {
        es: "Asistente de IA: tus preguntas se envían a nuestro proveedor de inteligencia artificial (Anthropic, en Estados Unidos) junto con tu progreso guardado, para generar la respuesta. A posto no guarda las conversaciones. Guardamos cuántas preguntas te quedan y sus movimientos.",
        it: "Assistente IA: le tue domande sono inviate al nostro fornitore di intelligenza artificiale (Anthropic, negli Stati Uniti) insieme ai tuoi progressi salvati, per generare la risposta. A posto non conserva le conversazioni. Conserviamo quante domande ti restano e i relativi movimenti.",
        en: "AI assistant: your questions are sent to our artificial intelligence provider (Anthropic, in the United States) together with your saved progress, to generate the answer. A posto does not store conversations. We keep how many questions you have left and their movements.",
      },
      {
        es: "Estadísticas de uso: solo si las activas. Contamos tus sesiones y el tiempo de uso activo. Nunca lo que escribes. Si las desactivas, se borran.",
        it: "Statistiche di utilizzo: solo se le attivi. Contiamo le sessioni e il tempo di uso attivo. Mai ciò che scrivi. Se le disattivi, vengono cancellate.",
        en: "Usage statistics: only if you turn them on. We count your sessions and active time. Never what you type. Turning them off deletes them.",
      },
      {
        es: "Foro (solo en la web): tu nombre público y lo que publiques, que es visible para los demás.",
        it: "Forum (solo sul web): il tuo nome pubblico e ciò che pubblichi, visibile agli altri.",
        en: "Forum (web only): your public name and what you post, which is visible to others.",
      },
    ],
  },
  {
    title: { es: "Para qué los usamos", it: "Perché li usiamo", en: "Why we use it" },
    items: [
      {
        es: "Para darte el servicio: tu cuenta, tu progreso y tus recordatorios (base legal: ejecución del servicio que pides).",
        it: "Per fornirti il servizio: account, progressi e promemoria (base giuridica: esecuzione del servizio richiesto).",
        en: "To provide the service: your account, progress and reminders (legal basis: performing the service you ask for).",
      },
      {
        es: "Para personalizar y para las estadísticas, solo con tu consentimiento. Puedes retirarlo cuando quieras en «Mis datos y privacidad».",
        it: "Per personalizzare e per le statistiche, solo con il tuo consenso. Puoi revocarlo quando vuoi in «I miei dati e privacy».",
        en: "To personalise and for statistics, only with your consent. You can withdraw it any time in “My data and privacy”.",
      },
    ],
  },
  {
    title: { es: "Lo que no hacemos", it: "Cosa non facciamo", en: "What we don't do" },
    items: [
      { es: "No vendemos tus datos.", it: "Non vendiamo i tuoi dati.", en: "We do not sell your data." },
      {
        es: "No pedimos número de pasaporte, datos de salud, religión ni antecedentes penales. No los escribas en el asistente.",
        it: "Non chiediamo numero di passaporto, dati sanitari, religione o precedenti penali. Non scriverli nell'assistente.",
        en: "We do not ask for passport numbers, health data, religion or criminal records. Do not type them into the assistant.",
      },
      {
        es: "No compartimos tus datos con autoridades, salvo obligación legal.",
        it: "Non condividiamo i tuoi dati con le autorità, salvo obbligo di legge.",
        en: "We do not share your data with authorities unless legally required.",
      },
      {
        es: "No usamos tus conversaciones ni tus datos para entrenar modelos de inteligencia artificial.",
        it: "Non usiamo le tue conversazioni né i tuoi dati per addestrare modelli di intelligenza artificiale.",
        en: "We do not use your conversations or data to train artificial intelligence models.",
      },
    ],
  },
  {
    title: { es: "Quién trata los datos por nosotros", it: "Chi tratta i dati per nostro conto", en: "Who processes data for us" },
    items: [
      { es: "Supabase: base de datos y cuentas.", it: "Supabase: database e account.", en: "Supabase: database and accounts." },
      { es: "Vercel: alojamiento de la web y del servidor.", it: "Vercel: hosting del sito e del server.", en: "Vercel: hosting of the website and server." },
      { es: "Anthropic: respuestas del asistente de IA.", it: "Anthropic: risposte dell'assistente IA.", en: "Anthropic: AI assistant answers." },
      {
        es: "El proveedor de SMS, si te registras con el teléfono, solo para enviarte el código.",
        it: "Il fornitore di SMS, se ti registri con il telefono, solo per inviarti il codice.",
        en: "The SMS provider, if you sign up by phone, only to send you the code.",
      },
    ],
  },
  {
    title: { es: "Tus derechos", it: "I tuoi diritti", en: "Your rights" },
    items: [
      {
        es: "Ver y corregir tus datos: en «Mi perfil» y «Mis datos y privacidad».",
        it: "Vedere e correggere i tuoi dati: in «Il mio profilo» e «I miei dati e privacy».",
        en: "See and correct your data: in “My profile” and “My data and privacy”.",
      },
      { es: "Descargar todos tus datos en un archivo: botón «Descargar mis datos».", it: "Scaricare tutti i tuoi dati in un file: pulsante «Scarica i miei dati».", en: "Download all your data in a file: “Download my data” button." },
      {
        es: "Borrar tu cuenta y todos tus datos, de forma inmediata y definitiva: botón «Borrar mi cuenta y mis datos» en el perfil.",
        it: "Eliminare l'account e tutti i dati, subito e in modo definitivo: pulsante «Elimina il mio account e i miei dati» nel profilo.",
        en: "Delete your account and all your data, immediately and permanently: “Delete my account and data” button in your profile.",
      },
      {
        es: "Reclamar ante la autoridad italiana de protección de datos (Garante per la protezione dei dati personali).",
        it: "Proporre reclamo al Garante per la protezione dei dati personali.",
        en: "Lodge a complaint with the Italian data protection authority (Garante per la protezione dei dati personali).",
      },
    ],
  },
  {
    title: { es: "Edad", it: "Età", en: "Age" },
    items: [{ es: "A posto es para personas de 14 años o más.", it: "A posto è destinato a persone dai 14 anni in su.", en: "A posto is for people aged 14 or older." }],
  },
];

export const privacyLabels = {
  title: { es: "Política de privacidad", it: "Informativa sulla privacy", en: "Privacy policy" },
  updated: { es: "Última actualización:", it: "Ultimo aggiornamento:", en: "Last updated:" },
  controller: { es: "Responsable de los datos", it: "Titolare del trattamento", en: "Data controller" },
  contact: { es: "Contacto", it: "Contatto", en: "Contact" },
  pending: {
    es: "Los datos del responsable y el contacto se publicarán aquí antes del lanzamiento.",
    it: "I dati del titolare e il contatto saranno pubblicati qui prima del lancio.",
    en: "The controller's details and contact will be published here before launch.",
  },
} satisfies Record<string, L10n>;
