import type { L10n } from "./types";

/**
 * Política de privacidad de A Posto (app y web). Describe lo que el código hace de verdad.
 * BORRADOR: debe revisarlo un profesional de protección de datos antes del lanzamiento.
 * Si cambia el tratamiento de datos en el código, hay que actualizar este texto y su fecha.
 */
export const PRIVACY_UPDATED = "2026-11-27";

export const privacyIntro: L10n = {
  es: "A Posto te ayuda con tus trámites en Italia. Aquí explicamos, en claro, qué datos guardamos, para qué y cómo puedes borrarlos.",
  it: "A Posto ti aiuta con le pratiche in Italia. Qui spieghiamo in modo chiaro quali dati conserviamo, perché e come puoi cancellarli.",
  en: "A Posto helps you with paperwork in Italy. Here we explain plainly which data we keep, why, and how you can delete it.",
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
        es: "Tu perfil: el nombre que elijas, tu idioma y, si quieres, tu país de origen y tu ciudad. Tu tipo de permiso, su fecha de vencimiento y si tienes hijos a cargo NO los guardamos: se quedan solo en tu teléfono, cifrados, y nuestro servidor no puede saberlos.",
        it: "Il tuo profilo: il nome che scegli, la lingua e, se vuoi, Paese d'origine e città. Tipo di permesso, scadenza e figli a carico NON li conserviamo: restano solo sul tuo telefono, cifrati, e il nostro server non può conoscerli.",
        en: "Your profile: the name you choose, your language and, if you want, your country of origin and city. Your permit type, its expiry date and whether you have dependent children are NOT stored by us: they stay only on your phone, encrypted, and our server cannot know them.",
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
        es: "Asistente de IA: tus preguntas se envían a nuestro proveedor de inteligencia artificial (Anthropic, en Estados Unidos) junto con tu progreso guardado y, solo si lo aceptas, los datos de tu situación que guardas en el teléfono, para generar la respuesta. Esos datos de situación no se guardan en nuestro servidor. Tus conversaciones se guardan en tu cuenta para que puedas continuarlas, y puedes borrarlas cuando quieras. Guardamos cuántas preguntas te quedan y sus movimientos.",
        it: "Assistente IA: le tue domande sono inviate al nostro fornitore di intelligenza artificiale (Anthropic, negli Stati Uniti) insieme ai tuoi progressi salvati e, solo se acconsenti, ai dati sulla tua situazione salvati sul telefono, per generare la risposta. Questi dati non vengono conservati sul nostro server. Le conversazioni sono salvate nel tuo account per poterle continuare e puoi cancellarle quando vuoi. Conserviamo quante domande ti restano e i relativi movimenti.",
        en: "AI assistant: your questions are sent to our artificial intelligence provider (Anthropic, in the United States) together with your saved progress and, only if you agree, the situation details stored on your phone, to generate the answer. Those situation details are not stored on our server. Your conversations are saved in your account so you can continue them, and you can delete them at any time. We keep how many questions you have left and their movements.",
      },
      {
        es: "Mis documentos: si guardas fotos o PDF de tus documentos, se guardan solo en tu teléfono, cifrados. No los subimos a ningún servidor. Si cambias de teléfono o borras la app, se pierden. Son opcionales: la app funciona sin ellos.",
        it: "I miei documenti: se salvi foto o PDF dei tuoi documenti, restano solo sul tuo telefono, cifrati. Non li carichiamo su nessun server. Se cambi telefono o elimini l'app, vanno persi. Sono facoltativi.",
        en: "My documents: if you save photos or PDFs of your documents, they are stored only on your phone, encrypted. We never upload them to any server. If you change phone or delete the app, they are lost. They are optional.",
      },
      {
        es: "Publicidad: la app muestra anuncios propios, siempre etiquetados como «Publicidad». No usamos cookies ni rastreadores publicitarios y no compartimos tus datos con los anunciantes: solo contamos cuántas veces se toca cada anuncio, sin saber quién. Si eliges ver un anuncio para ganar una pregunta, guardamos en tu cuenta que lo viste (fecha y anuncio), para darte la pregunta y aplicar el límite diario. En la web y en la app abierta desde el navegador (por ejemplo, en iPhone) también pueden aparecer anuncios de Google AdSense, siempre etiquetados como «Publicidad» y nunca en las pantallas de apoyo emocional, estado del permiso o documentos. Google puede usar cookies para mostrarlos; antes te preguntamos si aceptas anuncios personalizados y, si no aceptas, solo verás anuncios no personalizados. La app de Android no muestra anuncios de Google.",
        it: "Pubblicità: l'app mostra annunci propri, sempre indicati come «Pubblicità». Non usiamo cookie né tracciamenti pubblicitari e non condividiamo i tuoi dati con gli inserzionisti: contiamo solo quante volte viene toccato ogni annuncio, senza sapere chi. Se scegli di guardare un annuncio per ottenere una domanda, salviamo nel tuo account che l'hai visto (data e annuncio), per darti la domanda e applicare il limite giornaliero. Sul sito e nell'app aperta dal browser (ad esempio su iPhone) possono comparire anche annunci di Google AdSense, sempre indicati come «Pubblicità» e mai nelle schermate di supporto emotivo, stato del permesso o documenti. Google può usare cookie per mostrarli; prima ti chiediamo se accetti annunci personalizzati e, se non accetti, vedrai solo annunci non personalizzati. L'app Android non mostra annunci di Google.",
        en: "Advertising: the app shows its own ads, always labelled “Advertisement”. We use no advertising cookies or trackers and do not share your data with advertisers: we only count how many times each ad is tapped, without knowing who. If you choose to watch an ad to earn a question, we record in your account that you watched it (date and ad), to give you the question and apply the daily limit. On the website and in the app opened from the browser (for example on iPhone), Google AdSense ads may also appear, always labelled “Advertisement” and never on the emotional support, permit status or documents screens. Google may use cookies to show them; we first ask whether you accept personalised ads and, if you don't, you will only see non-personalised ads. The Android app shows no Google ads.",
      },
      {
        es: "Lector de documentos: cuando pides que la app lea y traduzca una foto, esa imagen se envía a nuestro proveedor de inteligencia artificial (Anthropic, en Estados Unidos) solo para generar la respuesta. Te pedimos confirmación cada vez. Nuestro servidor no guarda la imagen; la explicación solo se guarda si tú guardas el documento.",
        it: "Lettore di documenti: quando chiedi all'app di leggere e tradurre una foto, l'immagine è inviata al nostro fornitore di intelligenza artificiale (Anthropic, negli Stati Uniti) solo per generare la risposta. Ti chiediamo conferma ogni volta. Il nostro server non conserva l'immagine.",
        en: "Document reader: when you ask the app to read and translate a photo, that image is sent to our artificial intelligence provider (Anthropic, in the United States) only to generate the answer. We ask you to confirm each time. Our server does not keep the image.",
      },
      {
        es: "Avisos en el teléfono: solo si los activas. Se programan en tu propio dispositivo y por defecto no muestran el contenido de tus citas.",
        it: "Notifiche sul telefono: solo se le attivi. Sono programmate sul tuo dispositivo e, per impostazione predefinita, non mostrano il contenuto dei tuoi appuntamenti.",
        en: "Phone notifications: only if you turn them on. They are scheduled on your own device and by default do not show the content of your appointments.",
      },
      {
        es: "Ubicación: solo si pulsas «Cerca de mí» en el mapa. Se usa en tu dispositivo para centrar el mapa y no se guarda.",
        it: "Posizione: solo se premi «Vicino a me» sulla mappa. È usata sul dispositivo per centrare la mappa e non viene salvata.",
        en: "Location: only if you tap “Near me” on the map. It is used on your device to centre the map and is not stored.",
      },
      {
        es: "Estadísticas de uso: solo si las activas. Contamos tus sesiones, el tiempo de uso activo, qué pantallas abres y qué trámites empiezas o terminas, y las vemos solo en totales para mejorar la app. Nunca lo que escribes ni tus documentos. Si las desactivas, se borran.",
        it: "Statistiche di utilizzo: solo se le attivi. Contiamo sessioni, tempo di uso attivo, schermate aperte e pratiche iniziate o concluse, e le guardiamo solo in totale per migliorare l'app. Mai ciò che scrivi né i tuoi documenti. Se le disattivi, vengono cancellate.",
        en: "Usage statistics: only if you turn them on. We count your sessions, active time, which screens you open and which procedures you start or finish, and look at them only as totals to improve the app. Never what you type or your documents. Turning them off deletes them.",
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
    items: [{ es: "A Posto es para personas de 14 años o más.", it: "A Posto è destinato a persone dai 14 anni in su.", en: "A Posto is for people aged 14 or older." }],
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
