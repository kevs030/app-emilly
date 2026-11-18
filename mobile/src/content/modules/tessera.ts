import { P } from "./phrases";
import type { CityEntry, ExternalLink, T9 } from "./types";

/**
 * Tessera sanitaria: requisitos ampliados y directorio de citas por ciudad/región.
 * Para añadir una ciudad: añade un objeto a CITIES (id, ciudad, región, nota y enlaces). Nada más.
 * Fuentes revisadas el 18-11-2026: portales regionales (Lombardia, Lazio, Piemonte, Campania, Toscana, Puglia) y webs de las ASL.
 */
export const TESSERA_UPDATED = "2026-11-18";

export const T = {
  reqTitle: { es: "Qué documentos llevar", it: "Quali documenti portare", en: "Which documents to bring", fr: "Quels documents apporter", ar: "ما الوثائق التي يجب إحضارها", ro: "Ce documente să aduci", sq: "Cilat dokumente të sillni", uk: "Які документи взяти", bn: "কী কী কাগজপত্র নিতে হবে" },
  bookingTitle: { es: "Pedir cita en la ASL de tu ciudad", it: "Prenotare all'ASL della tua città", en: "Book at the ASL in your city", fr: "Prendre rendez-vous à l'ASL de votre ville", ar: "احجز موعدًا في الـASL في مدينتك", ro: "Programare la ASL din orașul tău", sq: "Rezervoni në ASL-në e qytetit tuaj", uk: "Запис до ASL у вашому місті", bn: "আপনার শহরের ASL-এ অ্যাপয়েন্টমেন্ট" },
  systemsTitle: { es: "Sistemas de cita más usados", it: "Sistemi di prenotazione più usati", en: "Most used booking systems", fr: "Systèmes de rendez-vous les plus utilisés", ar: "أنظمة الحجز الأكثر استخدامًا", ro: "Cele mai folosite sisteme de programare", sq: "Sistemet e rezervimit më të përdorura", uk: "Найпоширеніші системи запису", bn: "সবচেয়ে বেশি ব্যবহৃত বুকিং ব্যবস্থা" },
  regional: {
    es: "Cada ASL organiza el trámite a su manera: la oficina, el sistema de citas y algunos documentos cambian según la provincia. Si tu ciudad no aparece, busca la web de la ASL de tu zona.",
    it: "Ogni ASL organizza la pratica a modo suo: sportello, sistema di prenotazione e alcuni documenti cambiano da provincia a provincia. Se la tua città non c'è, cerca il sito dell'ASL della tua zona.",
    en: "Each ASL organises this in its own way: the office, the booking system and some documents change by province. If your city is not listed, look up the ASL website for your area.",
    fr: "Chaque ASL organise la démarche à sa façon : le guichet, le système de rendez-vous et certains documents changent selon la province. Si votre ville n'apparaît pas, cherchez le site de l'ASL de votre zone.",
    ar: "كل ASL تنظّم الإجراء بطريقتها: المكتب ونظام الحجز وبعض الوثائق تختلف حسب المقاطعة. إذا لم تجد مدينتك، ابحث عن موقع الـASL في منطقتك.",
    ro: "Fiecare ASL organizează procedura în felul său: ghișeul, sistemul de programare și unele documente diferă de la o provincie la alta. Dacă orașul tău nu apare, caută site-ul ASL din zona ta.",
    sq: "Çdo ASL e organizon procedurën në mënyrën e vet: zyra, sistemi i rezervimit dhe disa dokumente ndryshojnë sipas provincës. Nëse qyteti juaj nuk është në listë, kërkoni faqen e ASL-së së zonës suaj.",
    uk: "Кожна ASL організовує процедуру по-своєму: віконце, система запису й деякі документи залежать від провінції. Якщо вашого міста немає, знайдіть сайт ASL вашої зони.",
    bn: "প্রতিটি ASL নিজের মতো করে প্রক্রিয়াটি চালায়: অফিস, বুকিং ব্যবস্থা ও কিছু কাগজপত্র প্রদেশভেদে আলাদা। আপনার শহর তালিকায় না থাকলে নিজের এলাকার ASL-এর ওয়েবসাইট খুঁজুন।",
  },
} satisfies Record<string, T9>;

/** Requisitos (pedido explícito: se acepta también la Dichiarazione di Ospitalità como prueba de domicilio). */
export const REQUIREMENTS: T9[] = [
  {
    es: "Permesso di soggiorno, o el recibo (ricevuta) de la solicitud o de la renovación.",
    it: "Permesso di soggiorno, oppure la ricevuta della richiesta o del rinnovo.",
    en: "Permesso di soggiorno, or the receipt (ricevuta) of the application or renewal.",
    fr: "Permesso di soggiorno, ou le reçu (ricevuta) de la demande ou du renouvellement.",
    ar: "تصريح الإقامة (Permesso di soggiorno) أو إيصال (ricevuta) الطلب أو التجديد.",
    ro: "Permesso di soggiorno sau chitanța (ricevuta) cererii ori a reînnoirii.",
    sq: "Permesso di soggiorno, ose dëftesa (ricevuta) e kërkesës ose e rinovimit.",
    uk: "Permesso di soggiorno або квитанція (ricevuta) про подання заяви чи продовження.",
    bn: "Permesso di soggiorno, অথবা আবেদন বা নবায়নের রসিদ (ricevuta)।",
  },
  {
    es: "Codice fiscale.",
    it: "Codice fiscale.",
    en: "Codice fiscale (tax code).",
    fr: "Codice fiscale (code fiscal).",
    ar: "الرقم الضريبي (Codice fiscale).",
    ro: "Codice fiscale (cod fiscal).",
    sq: "Codice fiscale (kodi fiskal).",
    uk: "Codice fiscale (податковий код).",
    bn: "Codice fiscale (ট্যাক্স কোড)।",
  },
  {
    es: "Documento de identidad: pasaporte o Carta d'Identità.",
    it: "Documento d'identità: passaporto o Carta d'Identità.",
    en: "ID document: passport or Carta d'Identità.",
    fr: "Pièce d'identité : passeport ou Carta d'Identità.",
    ar: "وثيقة هوية: جواز السفر أو بطاقة الهوية (Carta d'Identità).",
    ro: "Act de identitate: pașaport sau Carta d'Identità.",
    sq: "Dokument identiteti: pasaportë ose Carta d'Identità.",
    uk: "Документ, що посвідчує особу: паспорт або Carta d'Identità.",
    bn: "পরিচয়পত্র: পাসপোর্ট বা Carta d'Identità।",
  },
  {
    es: "Dónde vives: certificado de residencia o, si no tienes residencia, la Dichiarazione di Ospitalità (declaración de hospitalidad firmada por quien te aloja, con copia de su documento).",
    it: "Dove abiti: certificato di residenza oppure, se non hai la residenza, la Dichiarazione di Ospitalità (firmata da chi ti ospita, con copia del suo documento).",
    en: "Where you live: residence certificate or, if you have no residence, the Dichiarazione di Ospitalità (hospitality declaration signed by your host, with a copy of their ID).",
    fr: "Où vous vivez : certificat de résidence ou, si vous n'avez pas de résidence, la Dichiarazione di Ospitalità (déclaration d'hébergement signée par votre hôte, avec copie de sa pièce d'identité).",
    ar: "مكان سكنك: شهادة الإقامة أو، إن لم تكن لديك إقامة مسجلة، تصريح الاستضافة (Dichiarazione di Ospitalità) موقّعًا ممن يستضيفك مع نسخة من وثيقته.",
    ro: "Unde locuiești: certificatul de rezidență sau, dacă nu ai rezidență, Dichiarazione di Ospitalità (declarația de găzduire semnată de cel care te găzduiește, cu copia actului său).",
    sq: "Ku jetoni: certifikata e rezidencës ose, nëse nuk keni rezidencë, Dichiarazione di Ospitalità (deklarata e mikpritjes e firmosur nga ai që ju strehon, me kopjen e dokumentit të tij).",
    uk: "Де ви живете: довідка про реєстрацію (residenza) або, якщо її немає, Dichiarazione di Ospitalità (декларація про проживання, підписана тим, хто вас приймає, з копією його документа).",
    bn: "আপনি কোথায় থাকেন: residenza সনদ, অথবা residenza না থাকলে Dichiarazione di Ospitalità (যিনি আপনাকে থাকতে দিচ্ছেন তার স্বাক্ষরসহ ঘোষণা ও তার পরিচয়পত্রের কপি)।",
  },
];

/** Sistemas de cita usados por muchas ASL. */
export const ZEROCODA: ExternalLink = {
  id: "zerocoda",
  url: "https://prenota.zerocoda.it",
  label: { es: "ZeroCoda", it: "ZeroCoda", en: "ZeroCoda", fr: "ZeroCoda", ar: "ZeroCoda", ro: "ZeroCoda", sq: "ZeroCoda", uk: "ZeroCoda", bn: "ZeroCoda" },
  what: {
    es: "Reserva de turno para las ventanillas de «Scelta e revoca» en Lombardía (Milán: ASST Fatebenefratelli Sacco y ASST Santi Paolo e Carlo; Monza, Bérgamo, Brescia, Pavía) y en zonas como Novara y Reggio Emilia.",
    it: "Prenotazione del turno agli sportelli «Scelta e revoca» in Lombardia (Milano: ASST Fatebenefratelli Sacco e ASST Santi Paolo e Carlo; Monza, Bergamo, Brescia, Pavia) e in zone come Novara e Reggio Emilia.",
    en: "Booking a turn at “Scelta e revoca” desks in Lombardy (Milan: ASST Fatebenefratelli Sacco and ASST Santi Paolo e Carlo; Monza, Bergamo, Brescia, Pavia) and areas such as Novara and Reggio Emilia.",
    fr: "Réservation d'un passage aux guichets « Scelta e revoca » en Lombardie (Milan : ASST Fatebenefratelli Sacco et ASST Santi Paolo e Carlo ; Monza, Bergame, Brescia, Pavie) et dans des zones comme Novare et Reggio d'Émilie.",
    ar: "حجز دور في شبابيك «Scelta e revoca» في لومبارديا (ميلانو: ASST Fatebenefratelli Sacco وASST Santi Paolo e Carlo؛ مونزا، بيرغامو، بريشيا، بافيا) وفي مناطق مثل نوفارا وريجيو إميليا.",
    ro: "Rezervarea rândului la ghișeele „Scelta e revoca” din Lombardia (Milano: ASST Fatebenefratelli Sacco și ASST Santi Paolo e Carlo; Monza, Bergamo, Brescia, Pavia) și în zone precum Novara și Reggio Emilia.",
    sq: "Rezervim radhe në sportelet «Scelta e revoca» në Lombardi (Milano: ASST Fatebenefratelli Sacco dhe ASST Santi Paolo e Carlo; Monza, Bergamo, Brescia, Pavia) dhe në zona si Novara dhe Reggio Emilia.",
    uk: "Запис у чергу до віконець «Scelta e revoca» в Ломбардії (Мілан: ASST Fatebenefratelli Sacco та ASST Santi Paolo e Carlo; Монца, Бергамо, Брешія, Павія) і в таких зонах, як Новара та Реджо-Емілія.",
    bn: "লোম্বার্দিয়ার «Scelta e revoca» কাউন্টারে সিরিয়াল বুকিং (মিলান: ASST Fatebenefratelli Sacco ও ASST Santi Paolo e Carlo; মনজা, বেরগামো, ব্রেশিয়া, পাভিয়া) এবং নোভারা ও রেজ্জো এমিলিয়ার মতো এলাকায়।",
  },
  steps: [
    {
      es: "Busca tu ASST/ASL y la sede de «Scelta e revoca».",
      it: "Cerca la tua ASST/ASL e la sede «Scelta e revoca».",
      en: "Find your ASST/ASL and the “Scelta e revoca” office.",
      fr: "Cherchez votre ASST/ASL et le site « Scelta e revoca ».",
      ar: "ابحث عن الـASST/ASL الخاصة بك ومكتب «Scelta e revoca».",
      ro: "Caută ASST/ASL-ul tău și sediul „Scelta e revoca”.",
      sq: "Gjeni ASST/ASL-në tuaj dhe zyrën «Scelta e revoca».",
      uk: "Знайдіть свою ASST/ASL та офіс «Scelta e revoca».",
      bn: "আপনার ASST/ASL এবং «Scelta e revoca» অফিস খুঁজুন।",
    },
    P.sBook,
  ],
};

export const TUPASSI: ExternalLink = {
  id: "tupassi",
  url: "https://www.tupassi.it",
  label: { es: "TuPassi", it: "TuPassi", en: "TuPassi", fr: "TuPassi", ar: "TuPassi", ro: "TuPassi", sq: "TuPassi", uk: "TuPassi", bn: "TuPassi" },
  what: {
    es: "Reserva de turno en ventanillas públicas. Lo usa, por ejemplo, la ASL Città di Torino y varias localidades de Véneto y Apulia.",
    it: "Prenotazione del turno agli sportelli pubblici. Lo usa, per esempio, l'ASL Città di Torino e diverse località di Veneto e Puglia.",
    en: "Booking a turn at public desks. It is used, for example, by ASL Città di Torino and several towns in Veneto and Apulia.",
    fr: "Réservation d'un passage aux guichets publics. Utilisé par exemple par l'ASL Città di Torino et plusieurs localités de Vénétie et des Pouilles.",
    ar: "حجز دور في الشبابيك العامة. تستخدمه مثلًا ASL Città di Torino وعدة بلدات في فينيتو وبوليا.",
    ro: "Rezervarea rândului la ghișee publice. Îl folosește, de exemplu, ASL Città di Torino și mai multe localități din Veneto și Puglia.",
    sq: "Rezervim radhe në sportelet publike. E përdor, për shembull, ASL Città di Torino dhe disa qytete në Veneto dhe Puglia.",
    uk: "Запис у чергу до державних віконець. Ним користується, наприклад, ASL Città di Torino і низка міст Венето та Апулії.",
    bn: "সরকারি কাউন্টারে সিরিয়াল বুকিং। উদাহরণস্বরূপ ASL Città di Torino এবং ভেনেতো ও পুলিয়ার কয়েকটি শহর এটি ব্যবহার করে।",
  },
  steps: [
    {
      es: "Escribe tu ciudad y elige la oficina de la ASL («Anagrafe sanitaria» / «Scelta e revoca»).",
      it: "Scrivi la tua città e scegli l'ufficio ASL («Anagrafe sanitaria» / «Scelta e revoca»).",
      en: "Type your city and choose the ASL office (“Anagrafe sanitaria” / “Scelta e revoca”).",
      fr: "Indiquez votre ville et choisissez le bureau de l'ASL (« Anagrafe sanitaria » / « Scelta e revoca »).",
      ar: "اكتب اسم مدينتك واختر مكتب الـASL («Anagrafe sanitaria» / «Scelta e revoca»).",
      ro: "Scrie orașul și alege biroul ASL („Anagrafe sanitaria” / „Scelta e revoca”).",
      sq: "Shkruani qytetin dhe zgjidhni zyrën e ASL-së («Anagrafe sanitaria» / «Scelta e revoca»).",
      uk: "Введіть місто й оберіть офіс ASL («Anagrafe sanitaria» / «Scelta e revoca»).",
      bn: "আপনার শহরের নাম লিখে ASL অফিস বেছে নিন («Anagrafe sanitaria» / «Scelta e revoca»)।",
    },
    P.sBook,
  ],
};

const portal = (id: string, url: string, name: string, extra: T9[] = []): ExternalLink => ({
  id,
  url,
  label: { es: name, it: name, en: name, fr: name, ar: name, ro: name, sq: name, uk: name, bn: name },
  what: P.wRegionPortal,
  steps: [P.sSpid, ...extra, P.sFirstInPerson],
});
const aslSite = (id: string, url: string, name: string, extra: T9[] = []): ExternalLink => ({
  id,
  url,
  label: { es: name, it: name, en: name, fr: name, ar: name, ro: name, sq: name, uk: name, bn: name },
  what: P.wAslSite,
  steps: [P.sFindSection, ...extra, P.sCheckSite],
});

export const CITIES: CityEntry[] = [
  {
    id: "milano",
    city: "Milano",
    region: "Lombardia",
    note: {
      es: "Pide turno con ZeroCoda en tu ASST. Con SPID o CIE, los cambios de médico también se hacen en el Fascicolo Sanitario de Lombardía.",
      it: "Prenota il turno con ZeroCoda nella tua ASST. Con SPID o CIE, i cambi di medico si fanno anche sul Fascicolo Sanitario Lombardia.",
      en: "Book a turn with ZeroCoda at your ASST. With SPID or CIE, doctor changes can also be done on the Lombardy Fascicolo Sanitario.",
      fr: "Réservez avec ZeroCoda dans votre ASST. Avec SPID ou CIE, les changements de médecin se font aussi sur le Fascicolo Sanitario de Lombardie.",
      ar: "احجز دورك عبر ZeroCoda في الـASST الخاصة بك. باستخدام SPID أو CIE يمكن أيضًا تغيير الطبيب عبر Fascicolo Sanitario في لومبارديا.",
      ro: "Rezervă rândul cu ZeroCoda la ASST-ul tău. Cu SPID sau CIE, schimbarea medicului se poate face și pe Fascicolo Sanitario Lombardia.",
      sq: "Rezervoni radhën me ZeroCoda në ASST-në tuaj. Me SPID ose CIE, ndryshimet e mjekut bëhen edhe në Fascicolo Sanitario të Lombardisë.",
      uk: "Запишіться через ZeroCoda у своїй ASST. Зі SPID або CIE лікаря можна змінити також у Fascicolo Sanitario Ломбардії.",
      bn: "আপনার ASST-তে ZeroCoda দিয়ে সিরিয়াল নিন। SPID বা CIE থাকলে লোম্বার্দিয়ার Fascicolo Sanitario-তেও ডাক্তার বদলানো যায়।",
    },
    links: [ZEROCODA, portal("fse-lombardia", "https://www.fascicolosanitario.regione.lombardia.it", "Fascicolo Sanitario Lombardia")],
  },
  {
    id: "roma",
    city: "Roma",
    region: "Lazio",
    note: {
      es: "Cada ASL de Roma (Roma 1, Roma 2…) tiene sus ventanillas; algunas sedes dan turno con TuPassi. En línea, con SPID o CIE, a través de Salute Lazio.",
      it: "Ogni ASL di Roma (Roma 1, Roma 2…) ha i suoi sportelli; alcune sedi danno il turno con TuPassi. Online, con SPID o CIE, tramite Salute Lazio.",
      en: "Each Rome ASL (Roma 1, Roma 2…) has its own desks; some offices give turns via TuPassi. Online, with SPID or CIE, through Salute Lazio.",
      fr: "Chaque ASL de Rome (Roma 1, Roma 2…) a ses guichets ; certains sites donnent les tours via TuPassi. En ligne, avec SPID ou CIE, via Salute Lazio.",
      ar: "لكل ASL في روما (Roma 1، Roma 2…) شبابيكها؛ بعض المكاتب تعطي الدور عبر TuPassi. وعبر الإنترنت باستخدام SPID أو CIE من خلال Salute Lazio.",
      ro: "Fiecare ASL din Roma (Roma 1, Roma 2…) are ghișeele sale; unele sedii dau rândul prin TuPassi. Online, cu SPID sau CIE, prin Salute Lazio.",
      sq: "Çdo ASL e Romës (Roma 1, Roma 2…) ka sportelet e veta; disa zyra japin radhë me TuPassi. Online, me SPID ose CIE, përmes Salute Lazio.",
      uk: "Кожна ASL Рима (Roma 1, Roma 2…) має власні віконця; деякі офіси дають чергу через TuPassi. Онлайн — зі SPID або CIE через Salute Lazio.",
      bn: "রোমের প্রতিটি ASL (Roma 1, Roma 2…)-এর নিজস্ব কাউন্টার আছে; কিছু অফিস TuPassi দিয়ে সিরিয়াল দেয়। অনলাইনে SPID বা CIE দিয়ে Salute Lazio-তে।",
    },
    links: [portal("salute-lazio", "https://www.salutelazio.it", "Salute Lazio"), aslSite("asl-roma1", "https://www.aslroma1.it", "ASL Roma 1"), aslSite("asl-roma2", "https://www.aslroma2.it", "ASL Roma 2"), TUPASSI],
  },
  {
    id: "torino",
    city: "Torino",
    region: "Piemonte",
    note: {
      es: "La ASL Città di Torino da turno con TuPassi. Los servicios en línea están en Salute Piemonte.",
      it: "L'ASL Città di Torino dà il turno con TuPassi. I servizi online sono su Salute Piemonte.",
      en: "ASL Città di Torino gives turns via TuPassi. Online services are on Salute Piemonte.",
      fr: "L'ASL Città di Torino donne les tours via TuPassi. Les services en ligne sont sur Salute Piemonte.",
      ar: "تعطي ASL Città di Torino الدور عبر TuPassi. والخدمات الإلكترونية على Salute Piemonte.",
      ro: "ASL Città di Torino dă rândul prin TuPassi. Serviciile online sunt pe Salute Piemonte.",
      sq: "ASL Città di Torino jep radhë me TuPassi. Shërbimet online janë në Salute Piemonte.",
      uk: "ASL Città di Torino дає чергу через TuPassi. Онлайн-послуги — на Salute Piemonte.",
      bn: "ASL Città di Torino TuPassi দিয়ে সিরিয়াল দেয়। অনলাইন সেবা Salute Piemonte-এ।",
    },
    links: [TUPASSI, portal("salute-piemonte", "https://www.salutepiemonte.it", "Salute Piemonte"), aslSite("asl-torino", "https://www.aslcittaditorino.it", "ASL Città di Torino")],
  },
  {
    id: "napoli",
    city: "Napoli",
    region: "Campania",
    note: {
      es: "Campania usa un portal único, SINFONIA: entra en la sección «Scelta e revoca».",
      it: "La Campania usa un portale unico, SINFONIA: entra nella sezione «Scelta e revoca».",
      en: "Campania uses a single portal, SINFONIA: go to the “Scelta e revoca” section.",
      fr: "La Campanie utilise un portail unique, SINFONIA : allez dans la section « Scelta e revoca ».",
      ar: "تستخدم كامبانيا بوابة واحدة هي SINFONIA: ادخل إلى قسم «Scelta e revoca».",
      ro: "Campania folosește un portal unic, SINFONIA: intră în secțiunea „Scelta e revoca”.",
      sq: "Campania përdor një portal të vetëm, SINFONIA: hyni në seksionin «Scelta e revoca».",
      uk: "У Кампанії єдиний портал — SINFONIA: перейдіть до розділу «Scelta e revoca».",
      bn: "কাম্পানিয়ায় একটি একক পোর্টাল আছে, SINFONIA: «Scelta e revoca» অংশে যান।",
    },
    links: [portal("sinfonia", "https://sinfonia.regione.campania.it", "SINFONIA Campania")],
  },
  {
    id: "bologna",
    city: "Bologna",
    region: "Emilia-Romagna",
    note: {
      es: "La AUSL de Bolonia gestiona las ventanillas CUP / Anagrafe sanitaria; en su web explica cómo pedir turno.",
      it: "L'AUSL di Bologna gestisce gli sportelli CUP / Anagrafe sanitaria; sul sito spiega come prenotare il turno.",
      en: "AUSL Bologna runs the CUP / Anagrafe sanitaria desks; its website explains how to book a turn.",
      fr: "L'AUSL de Bologne gère les guichets CUP / Anagrafe sanitaria ; son site explique comment réserver.",
      ar: "تدير AUSL بولونيا شبابيك CUP / Anagrafe sanitaria؛ ويشرح موقعها كيفية حجز الدور.",
      ro: "AUSL Bologna gestionează ghișeele CUP / Anagrafe sanitaria; pe site explică cum rezervi rândul.",
      sq: "AUSL e Bolonjës menaxhon sportelet CUP / Anagrafe sanitaria; në faqe shpjegon si rezervohet radha.",
      uk: "AUSL Болоньї керує віконцями CUP / Anagrafe sanitaria; на сайті пояснено, як записатися.",
      bn: "AUSL বোলোনিয়া CUP / Anagrafe sanitaria কাউন্টার চালায়; তাদের ওয়েবসাইটে সিরিয়াল নেওয়ার নিয়ম আছে।",
    },
    links: [aslSite("ausl-bologna", "https://www.ausl.bologna.it", "AUSL Bologna")],
  },
  {
    id: "firenze",
    city: "Firenze",
    region: "Toscana",
    note: {
      es: "En línea con Open Toscana (SPID, CIE o tarjeta sanitaria activada). En persona, en las sedes de la Azienda USL Toscana Centro.",
      it: "Online con Open Toscana (SPID, CIE o tessera sanitaria attivata). Di persona, nelle sedi dell'Azienda USL Toscana Centro.",
      en: "Online with Open Toscana (SPID, CIE or activated health card). In person, at Azienda USL Toscana Centro offices.",
      fr: "En ligne avec Open Toscana (SPID, CIE ou carte sanitaire activée). En personne, dans les sites de l'Azienda USL Toscana Centro.",
      ar: "عبر الإنترنت بواسطة Open Toscana (SPID أو CIE أو البطاقة الصحية المفعّلة). وحضوريًا في مكاتب Azienda USL Toscana Centro.",
      ro: "Online cu Open Toscana (SPID, CIE sau tessera sanitaria activată). Personal, la sediile Azienda USL Toscana Centro.",
      sq: "Online me Open Toscana (SPID, CIE ose karta shëndetësore e aktivizuar). Personalisht, në zyrat e Azienda USL Toscana Centro.",
      uk: "Онлайн — через Open Toscana (SPID, CIE або активована медична картка). Особисто — в офісах Azienda USL Toscana Centro.",
      bn: "অনলাইনে Open Toscana (SPID, CIE বা সক্রিয় স্বাস্থ্য কার্ড)। সরাসরি Azienda USL Toscana Centro-এর অফিসে।",
    },
    links: [portal("open-toscana", "https://open.toscana.it", "Open Toscana"), aslSite("usl-centro", "https://www.uslcentro.toscana.it", "Azienda USL Toscana Centro")],
  },
  {
    id: "palermo",
    city: "Palermo",
    region: "Sicilia",
    note: {
      es: "La ASP de Palermo tiene su propio sistema de reserva de ventanillas («Prenotazione sportelli») para «Scelta e revoca».",
      it: "L'ASP di Palermo ha un proprio sistema di prenotazione sportelli per «Scelta e revoca».",
      en: "ASP Palermo has its own desk booking system (“Prenotazione sportelli”) for “Scelta e revoca”.",
      fr: "L'ASP de Palerme a son propre système de réservation des guichets (« Prenotazione sportelli ») pour « Scelta e revoca ».",
      ar: "لدى ASP باليرمو نظام خاص لحجز الشبابيك («Prenotazione sportelli») لخدمة «Scelta e revoca».",
      ro: "ASP Palermo are propriul sistem de rezervare a ghișeelor („Prenotazione sportelli”) pentru „Scelta e revoca”.",
      sq: "ASP e Palermos ka sistemin e vet të rezervimit të sporteleve («Prenotazione sportelli») për «Scelta e revoca».",
      uk: "ASP Палермо має власну систему запису до віконець («Prenotazione sportelli») для «Scelta e revoca».",
      bn: "ASP পালের্মোর «Scelta e revoca»-এর জন্য নিজস্ব কাউন্টার বুকিং ব্যবস্থা («Prenotazione sportelli») আছে।",
    },
    links: [aslSite("asp-palermo", "https://www.asppalermo.org", "ASP Palermo")],
  },
  {
    id: "bari",
    city: "Bari",
    region: "Puglia",
    note: {
      es: "Portal Puglia Salute (ASL Bari – Anagrafe sanitaria). En línea con SPID o CIE; también por correo electrónico al distrito con el formulario.",
      it: "Portale Puglia Salute (ASL Bari – Anagrafe sanitaria). Online con SPID o CIE; anche via email al distretto con il modulo.",
      en: "Puglia Salute portal (ASL Bari – Anagrafe sanitaria). Online with SPID or CIE; also by email to your district with the form.",
      fr: "Portail Puglia Salute (ASL Bari – Anagrafe sanitaria). En ligne avec SPID ou CIE ; aussi par e-mail au district avec le formulaire.",
      ar: "بوابة Puglia Salute (ASL Bari – Anagrafe sanitaria). عبر الإنترنت بـSPID أو CIE؛ وأيضًا بالبريد الإلكتروني إلى المنطقة مع الاستمارة.",
      ro: "Portalul Puglia Salute (ASL Bari – Anagrafe sanitaria). Online cu SPID sau CIE; și prin e-mail la district, cu formularul.",
      sq: "Portali Puglia Salute (ASL Bari – Anagrafe sanitaria). Online me SPID ose CIE; edhe me email në distrikt me formularin.",
      uk: "Портал Puglia Salute (ASL Bari – Anagrafe sanitaria). Онлайн зі SPID або CIE; також електронною поштою до округу з бланком.",
      bn: "Puglia Salute পোর্টাল (ASL Bari – Anagrafe sanitaria)। অনলাইনে SPID বা CIE দিয়ে; ফর্মসহ এলাকার দপ্তরে ইমেইলেও করা যায়।",
    },
    links: [portal("puglia-salute", "https://www.sanita.puglia.it", "Puglia Salute"), TUPASSI],
  },
];
