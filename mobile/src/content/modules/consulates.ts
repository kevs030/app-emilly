import type { T9 } from "./types";

/**
 * «Mi consulado»: consulados en Italia de los países de quienes usan la app.
 * Coordenadas: OpenStreetMap / Nominatim (18-11-2026). `poi: true` = el propio consulado figura en el mapa;
 * si no, el punto es el número de la calle. Teléfono y web solo si están confirmados en una fuente oficial
 * o un directorio fiable; si no, se omiten. Para añadir uno, añade un objeto (país en código ISO de 2 letras).
 */
export type Consulate = {
  id: string;
  country: string; // ISO 3166-1 alfa-2
  city: string; // ciudad italiana donde está
  name: string;
  address: string;
  lat: number;
  lon: number;
  poi: boolean;
  phone?: string;
  web?: string;
  booking?: string;
};

export const CONSULATES: Consulate[] = [
  { id: "pe-milano", country: "PE", city: "Milano", name: "Consolato Generale del Perù", address: "Via Fabio Filzi 23, 20124 Milano", lat: 45.48393, lon: 9.19977, poi: true, web: "https://www.gob.pe/institucion/consulado-del-peru-en-milan", booking: "https://www.gob.pe/institucion/consulado-del-peru-en-milan" },
  { id: "pe-roma", country: "PE", city: "Roma", name: "Consolato Generale del Perù", address: "Via Sibari 4, 00183 Roma", lat: 41.8821, lon: 12.50313, poi: true, phone: "+39 06 8848063", web: "https://www.gob.pe/institucion/consulado-del-peru-en-roma", booking: "https://www.gob.pe/institucion/consulado-del-peru-en-roma" },
  { id: "ec-milano", country: "EC", city: "Milano", name: "Consolato Generale dell'Ecuador", address: "Via Vittor Pisani 9, 20124 Milano", lat: 45.48403, lon: 9.20243, poi: false, phone: "+39 02 4979 5989" },
  { id: "ec-roma", country: "EC", city: "Roma", name: "Ambasciata dell'Ecuador · Sezione consolare", address: "Via Antonio Bertoloni 8, 00197 Roma", lat: 41.92137, lon: 12.4915, poi: true, phone: "+39 06 4543 9007" },
  { id: "co-milano", country: "CO", city: "Milano", name: "Consolato Generale di Colombia", address: "Via Tivoli 3, 20121 Milano", lat: 45.47185, lon: 9.18344, poi: false, phone: "+39 02 72003872", web: "https://milan.consulado.gov.co", booking: "https://milan.consulado.gov.co" },
  { id: "co-roma", country: "CO", city: "Roma", name: "Consolato di Colombia", address: "Piazzale Flaminio 9, 00196 Roma", lat: 41.912, lon: 12.47534, poi: false, phone: "+39 06 3222722", web: "https://roma.consulado.gov.co", booking: "https://roma.consulado.gov.co" },
  { id: "sv-milano", country: "SV", city: "Milano", name: "Consolato Generale di El Salvador", address: "Via Losanna 16, Milano", lat: 45.4856, lon: 9.16338, poi: false },
  { id: "ma-milano", country: "MA", city: "Milano", name: "Consolato Generale del Regno del Marocco", address: "Via Adele Martignoni 10, 20124 Milano", lat: 45.49273, lon: 9.19653, poi: true, phone: "+39 02 6680 6919" },
  { id: "al-milano", country: "AL", city: "Milano", name: "Consolato Generale d'Albania", address: "Piazza del Duomo 17, Milano", lat: 45.46468, lon: 9.18823, poi: false, phone: "+39 02 86995396" },
  { id: "ua-milano", country: "UA", city: "Milano", name: "Consolato Generale dell'Ucraina", address: "Via Ludovico di Breme 11, 20156 Milano", lat: 45.49671, lon: 9.13914, poi: true, phone: "+39 02 801333", web: "https://milan.mfa.gov.ua" },
  { id: "bd-milano", country: "BD", city: "Milano", name: "Consolato Generale del Bangladesh", address: "Via Giambellino 7, 20146 Milano", lat: 45.45169, lon: 9.1524, poi: false, phone: "+39 02 8706 8580", web: "https://bcgmilan.portal.gov.bd" },
  { id: "ph-milano", country: "PH", city: "Milano", name: "Consolato Generale delle Filippine", address: "Viale Stelvio 71 (angolo Via Bernina 18), 20159 Milano", lat: 45.49544, lon: 9.18152, poi: false, phone: "+39 02 6682 5232", web: "https://milanpcg.dfa.gov.ph", booking: "https://milanpcg.dfa.gov.ph" },
  { id: "ve-milano", country: "VE", city: "Milano", name: "Consolato Generale del Venezuela", address: "Corso Europa 5, 20122 Milano", lat: 45.46411, lon: 9.1957, poi: true, phone: "+39 02 7600 6293" },
  // Añadidos el 24-11-2026. Web oficial: India, Pakistán y Perú (Génova). El resto, de directorios que coinciden entre sí.
  { id: "pe-genova", country: "PE", city: "Genova", name: "Consolato Generale del Perù", address: "Piazza della Vittoria 15, 16121 Genova", lat: 44.40225, lon: 8.94372, poi: false, phone: "+39 010 0996340", web: "https://www.gob.pe/institucion/consulado-del-peru-en-genova", booking: "https://www.gob.pe/institucion/consulado-del-peru-en-genova" },
  { id: "ec-genova", country: "EC", city: "Genova", name: "Consolato Generale dell'Ecuador", address: "Via Antonio Cecchi 4, 16129 Genova", lat: 44.39834, lon: 8.94565, poi: false, phone: "+39 010 868 0502" },
  { id: "ma-roma", country: "MA", city: "Roma", name: "Ambasciata del Regno del Marocco (sezione consolare)", address: "Via Lazzaro Spallanzani 8/10, 00161 Roma", lat: 41.91237, lon: 12.51085, poi: false, phone: "+39 06 4402524" },
  { id: "ma-torino", country: "MA", city: "Torino", name: "Consolato Generale del Regno del Marocco", address: "Via Belfiore 27, Torino", lat: 45.05471, lon: 7.67871, poi: false, phone: "+39 011 650 6482" },
  { id: "ma-bologna", country: "MA", city: "Bologna", name: "Consolato Generale del Regno del Marocco", address: "Via Caduti di Amola 30, 40132 Bologna", lat: 44.51166, lon: 11.2793, poi: false, phone: "+39 051 531199" },
  { id: "ma-verona", country: "MA", city: "Verona", name: "Consolato Generale del Regno del Marocco", address: "Via Evangelista Torricelli 49, 37136 Verona", lat: 45.41269, lon: 10.95358, poi: false, phone: "+39 045 862 0858" },
  { id: "in-milano", country: "IN", city: "Milano", name: "Consulate General of India", address: "Piazza Paolo Ferrari 8, 20121 Milano", lat: 45.46698, lon: 9.18843, poi: true, phone: "+39 02 8057691", web: "https://www.cgimilan.gov.in" },
  { id: "pk-milano", country: "PK", city: "Milano", name: "Consulate General of Pakistan", address: "Via Privata Gadames 123, 20151 Milano", lat: 45.50166, lon: 9.12241, poi: false, phone: "+39 02 6670 3271", web: "https://mofa.gov.pk/milan" },
  { id: "sn-milano", country: "SN", city: "Milano", name: "Consulat Général du Sénégal", address: "Viale Legioni Romane 5, 20147 Milano", lat: 45.4588, lon: 9.12655, poi: false, phone: "+39 02 4154 0073" },
];

/** Ciudades italianas para el filtro «dónde vives» (centro aproximado, para ordenar por distancia). */
export const IT_CITIES: { name: string; lat: number; lon: number }[] = [
  { name: "Milano", lat: 45.4642, lon: 9.19 },
  { name: "Roma", lat: 41.9028, lon: 12.4964 },
  { name: "Torino", lat: 45.0703, lon: 7.6869 },
  { name: "Genova", lat: 44.4056, lon: 8.9463 },
  { name: "Bologna", lat: 44.4949, lon: 11.3426 },
  { name: "Firenze", lat: 43.7696, lon: 11.2558 },
  { name: "Venezia", lat: 45.4408, lon: 12.3155 },
  { name: "Verona", lat: 45.4384, lon: 10.9916 },
  { name: "Brescia", lat: 45.5416, lon: 10.2118 },
  { name: "Bergamo", lat: 45.6983, lon: 9.6773 },
  { name: "Napoli", lat: 40.8518, lon: 14.2681 },
  { name: "Bari", lat: 41.1171, lon: 16.8719 },
  { name: "Palermo", lat: 38.1157, lon: 13.3615 },
  { name: "Cagliari", lat: 39.2238, lon: 9.1217 },
  { name: "Perugia", lat: 43.1107, lon: 12.3908 },
];

export const COUNTRIES = [...new Set(CONSULATES.map((c) => c.country))];

/** Distancia en km (fórmula del haversine). */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Consulados de un país, el más cercano a la ciudad elegida primero. */
export function findConsulates(country: string, city: string): (Consulate & { km: number | null; local: boolean })[] {
  const at = IT_CITIES.find((c) => c.name === city);
  return CONSULATES.filter((c) => c.country === country)
    .map((c) => ({ ...c, km: at ? Math.round(distanceKm(at, c)) : null, local: c.city === city }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
}

export const CS = {
  title: { es: "Mi consulado", it: "Il mio consolato", en: "My consulate", fr: "Mon consulat", ar: "قنصليتي", ro: "Consulatul meu", sq: "Konsullata ime", uk: "Моє консульство", bn: "আমার কনস্যুলেট" },
  sub: { es: "Busca el consulado de tu país en Italia: dirección, teléfono, citas y mapa.", it: "Trova il consolato del tuo Paese in Italia: indirizzo, telefono, appuntamenti e mappa.", en: "Find your country's consulate in Italy: address, phone, appointments and map.", fr: "Trouvez le consulat de votre pays en Italie : adresse, téléphone, rendez-vous et carte.", ar: "ابحث عن قنصلية بلدك في إيطاليا: العنوان والهاتف والمواعيد والخريطة.", ro: "Găsește consulatul țării tale în Italia: adresă, telefon, programări și hartă.", sq: "Gjeni konsullatën e vendit tuaj në Itali: adresa, telefoni, takimet dhe harta.", uk: "Знайдіть консульство своєї країни в Італії: адреса, телефон, запис і мапа.", bn: "ইতালিতে আপনার দেশের কনস্যুলেট খুঁজুন: ঠিকানা, ফোন, অ্যাপয়েন্টমেন্ট ও মানচিত্র।" },
  nationality: { es: "Nacionalidad", it: "Nazionalità", en: "Nationality", fr: "Nationalité", ar: "الجنسية", ro: "Naționalitate", sq: "Kombësia", uk: "Громадянство", bn: "জাতীয়তা" },
  city: { es: "Ciudad actual en Italia", it: "Città attuale in Italia", en: "Current city in Italy", fr: "Ville actuelle en Italie", ar: "مدينتك الحالية في إيطاليا", ro: "Orașul actual din Italia", sq: "Qyteti aktual në Itali", uk: "Поточне місто в Італії", bn: "ইতালিতে বর্তমান শহর" },
  choose: { es: "Elige…", it: "Scegli…", en: "Choose…", fr: "Choisir…", ar: "اختر…", ro: "Alege…", sq: "Zgjidhni…", uk: "Оберіть…", bn: "বেছে নিন…" },
  inCity: { es: "En tu ciudad", it: "Nella tua città", en: "In your city", fr: "Dans votre ville", ar: "في مدينتك", ro: "În orașul tău", sq: "Në qytetin tuaj", uk: "У вашому місті", bn: "আপনার শহরে" },
  away: { es: "km de tu ciudad", it: "km dalla tua città", en: "km from your city", fr: "km de votre ville", ar: "كم من مدينتك", ro: "km de orașul tău", sq: "km nga qyteti juaj", uk: "км від вашого міста", bn: "কিমি আপনার শহর থেকে" },
  phone: { es: "Llamar", it: "Chiama", en: "Call", fr: "Appeler", ar: "اتصال", ro: "Sună", sq: "Telefono", uk: "Зателефонувати", bn: "কল করুন" },
  web: { es: "Web oficial", it: "Sito ufficiale", en: "Official website", fr: "Site officiel", ar: "الموقع الرسمي", ro: "Site oficial", sq: "Faqja zyrtare", uk: "Офіційний сайт", bn: "অফিসিয়াল ওয়েবসাইট" },
  booking: { es: "Pedir cita", it: "Prenota appuntamento", en: "Book an appointment", fr: "Prendre rendez-vous", ar: "حجز موعد", ro: "Programare", sq: "Rezervo takim", uk: "Записатися", bn: "অ্যাপয়েন্টমেন্ট নিন" },
  map: { es: "Ver en el mapa", it: "Vedi sulla mappa", en: "View on map", fr: "Voir sur la carte", ar: "عرض على الخريطة", ro: "Vezi pe hartă", sq: "Shiko në hartë", uk: "Показати на мапі", bn: "মানচিত্রে দেখুন" },
  go: { es: "Cómo llegar", it: "Indicazioni", en: "Directions", fr: "Itinéraire", ar: "الاتجاهات", ro: "Indicații", sq: "Udhëzime", uk: "Маршрут", bn: "দিকনির্দেশ" },
  streetLevel: { es: "Punto en el número de la calle; el portal puede estar a unos metros.", it: "Punto al numero civico; l'ingresso può essere a pochi metri.", en: "Pin at the street number; the entrance may be a few metres away.", fr: "Repère au numéro de rue ; l'entrée peut être à quelques mètres.", ar: "العلامة عند رقم الشارع؛ قد يكون المدخل على بعد أمتار.", ro: "Punct la numărul străzii; intrarea poate fi la câțiva metri.", sq: "Pika te numri i rrugës; hyrja mund të jetë disa metra larg.", uk: "Мітка на номері будинку; вхід може бути за кілька метрів.", bn: "পিনটি রাস্তার নম্বরে; প্রবেশপথ কয়েক মিটার দূরে হতে পারে।" },
  verify: { es: "Cada consulado atiende una zona (circoscrizione). Antes de ir, confirma en su web oficial la zona, el horario y si hace falta cita.", it: "Ogni consolato copre una zona (circoscrizione). Prima di andare, verifica sul sito ufficiale zona, orari e se serve l'appuntamento.", en: "Each consulate covers an area (circoscrizione). Before going, check its official website for the area, hours and whether you need an appointment.", fr: "Chaque consulat couvre une zone (circoscrizione). Avant d'y aller, vérifiez sur son site officiel la zone, les horaires et s'il faut un rendez-vous.", ar: "كل قنصلية تخدم منطقة معينة. قبل الذهاب، تحقق في موقعها الرسمي من المنطقة والمواعيد وهل يلزم حجز موعد.", ro: "Fiecare consulat acoperă o zonă (circoscrizione). Înainte să mergi, verifică pe site-ul oficial zona, programul și dacă e nevoie de programare.", sq: "Çdo konsullatë mbulon një zonë (circoscrizione). Para se të shkoni, kontrolloni në faqen zyrtare zonën, oraret dhe nëse duhet takim.", uk: "Кожне консульство обслуговує свій округ (circoscrizione). Перед візитом перевірте на офіційному сайті округ, графік і чи потрібен запис.", bn: "প্রতিটি কনস্যুলেট একটি এলাকা দেখে (circoscrizione)। যাওয়ার আগে অফিসিয়াল ওয়েবসাইটে এলাকা, সময়সূচি ও অ্যাপয়েন্টমেন্ট লাগবে কিনা দেখে নিন।" },
  none: { es: "Todavía no tenemos datos comprobados del consulado de este país. Búscalo en la web del Ministerio de Exteriores de tu país.", it: "Non abbiamo ancora dati verificati sul consolato di questo Paese. Cercalo sul sito del Ministero degli Esteri del tuo Paese.", en: "We don't have verified data for this country's consulate yet. Look it up on your country's foreign ministry website.", fr: "Nous n'avons pas encore de données vérifiées pour ce consulat. Cherchez-le sur le site du ministère des Affaires étrangères de votre pays.", ar: "لا تتوفر لدينا بعد بيانات موثقة عن قنصلية هذا البلد. ابحث عنها في موقع وزارة خارجية بلدك.", ro: "Încă nu avem date verificate despre consulatul acestei țări. Caută-l pe site-ul Ministerului de Externe al țării tale.", sq: "Ende nuk kemi të dhëna të verifikuara për konsullatën e këtij vendi. Kërkojeni në faqen e Ministrisë së Jashtme të vendit tuaj.", uk: "Перевірених даних про консульство цієї країни ще немає. Знайдіть його на сайті МЗС вашої країни.", bn: "এই দেশের কনস্যুলেটের যাচাই করা তথ্য এখনও আমাদের কাছে নেই। আপনার দেশের পররাষ্ট্র মন্ত্রণালয়ের ওয়েবসাইটে খুঁজুন।" },
  other: { es: "Otro país", it: "Altro Paese", en: "Other country", fr: "Autre pays", ar: "بلد آخر", ro: "Altă țară", sq: "Vend tjetër", uk: "Інша країна", bn: "অন্য দেশ" },
  mapTitle: { es: "Mapa del consulado", it: "Mappa del consolato", en: "Consulate map", fr: "Carte du consulat", ar: "خريطة القنصلية", ro: "Harta consulatului", sq: "Harta e konsullatës", uk: "Мапа консульства", bn: "কনস্যুলেটের মানচিত্র" },
  mapError: { es: "No se pudo cargar el mapa. Usa «Cómo llegar».", it: "Impossibile caricare la mappa. Usa «Indicazioni».", en: "The map could not load. Use “Directions”.", fr: "La carte n'a pas pu se charger. Utilisez « Itinéraire ».", ar: "تعذر تحميل الخريطة. استخدم «الاتجاهات».", ro: "Harta nu s-a putut încărca. Folosește „Indicații”.", sq: "Harta nuk u ngarkua. Përdorni «Udhëzime».", uk: "Не вдалося завантажити мапу. Скористайтеся «Маршрут».", bn: "মানচিত্র লোড হয়নি। «দিকনির্দেশ» ব্যবহার করুন।" },
} satisfies Record<string, T9>;
