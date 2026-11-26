import type { T9 } from "./types";

/**
 * Apoyo emocional y psicológico para personas migrantes: líneas nacionales y centros por ciudad.
 * Datos comprobados en fuentes oficiales o de las propias entidades el 26/11/2026 (campo `source`).
 * Si un centro cambia, se corrige aquí; las ciudades sin centro propio ven las opciones nacionales.
 */
export const SUPPORT_VERIFIED = "2026-11-26";

export type SupportPlace = {
  id: string;
  /** Ciudad tal como aparece en la lista (null = toda Italia) */
  city: string | null;
  name: string;
  what: T9;
  /** Para quién es, si no es para todos */
  forWho?: T9;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  web?: string;
  hours?: T9;
  source: string;
};

export const SP: Record<string, T9> = {
  title: { es: "Apoyo emocional", it: "Supporto emotivo", en: "Emotional support", fr: "Soutien émotionnel", ar: "الدعم النفسي", ro: "Sprijin emoțional", sq: "Mbështetje emocionale", uk: "Емоційна підтримка", bn: "মানসিক সহায়তা" },
  hero: { es: "No estás solo", it: "Non sei solo", en: "You are not alone", fr: "Vous n'êtes pas seul", ar: "لست وحدك", ro: "Nu ești singur", sq: "Nuk je vetëm", uk: "Ви не самі", bn: "আপনি একা নন" },
  heroSub: {
    es: "Empezar de nuevo en otro país cansa. Si te sientes solo, triste o con mucho estrés, hablar con alguien ayuda. Estos servicios te escuchan, muchos son gratuitos y no te piden papeles.",
    it: "Ricominciare in un altro Paese stanca. Se ti senti solo, triste o molto stressato, parlarne aiuta. Questi servizi ti ascoltano, molti sono gratuiti e non chiedono documenti.",
    en: "Starting over in another country is tiring. If you feel alone, sad or very stressed, talking to someone helps. These services listen to you; many are free and don't ask for papers.",
    fr: "Recommencer dans un autre pays fatigue. Si vous vous sentez seul, triste ou très stressé, en parler aide. Ces services vous écoutent ; beaucoup sont gratuits et ne demandent pas de papiers.",
    ar: "البدء من جديد في بلد آخر متعب. إذا شعرت بالوحدة أو الحزن أو التوتر الشديد، فالكلام مع أحد يساعد. هذه الخدمات تستمع إليك، وكثير منها مجاني ولا يطلب أوراقًا.",
    ro: "Să o iei de la capăt în altă țară e obositor. Dacă te simți singur, trist sau foarte stresat, să vorbești cu cineva ajută. Aceste servicii te ascultă; multe sunt gratuite și nu cer acte.",
    sq: "Të fillosh nga e para në një vend tjetër lodh. Nëse ndihesh vetëm, i trishtuar ose shumë i stresuar, të flasësh me dikë ndihmon. Këto shërbime të dëgjojnë; shumë janë falas dhe nuk kërkojnë dokumente.",
    uk: "Почати все спочатку в іншій країні виснажливо. Якщо вам самотньо, сумно або дуже напружено, розмова допомагає. Ці служби вас вислухають; багато з них безкоштовні й не вимагають документів.",
    bn: "অন্য দেশে নতুন করে শুরু করা ক্লান্তিকর। একা, দুঃখী বা খুব চাপে থাকলে কারও সঙ্গে কথা বললে উপকার হয়। এই সেবাগুলো আপনার কথা শোনে; অনেকগুলো বিনামূল্যে এবং কাগজপত্র চায় না।",
  },
  urgent: { es: "¿Estás en peligro o piensas en hacerte daño?", it: "Sei in pericolo o pensi di farti del male?", en: "Are you in danger or thinking of hurting yourself?", fr: "Êtes-vous en danger ou pensez-vous à vous faire du mal ?", ar: "هل أنت في خطر أو تفكر في إيذاء نفسك؟", ro: "Ești în pericol sau te gândești să-ți faci rău?", sq: "Je në rrezik ose mendon të lëndosh veten?", uk: "Ви в небезпеці або думаєте заподіяти собі шкоду?", bn: "আপনি কি বিপদে আছেন বা নিজের ক্ষতি করার কথা ভাবছেন?" },
  urgentBody: { es: "Llama ahora al 112 (emergencias, gratis, las 24 horas).", it: "Chiama subito il 112 (emergenze, gratis, 24 ore su 24).", en: "Call 112 now (emergencies, free, 24 hours).", fr: "Appelez maintenant le 112 (urgences, gratuit, 24 h/24).", ar: "اتصل الآن بالرقم 112 (الطوارئ، مجاني، على مدار 24 ساعة).", ro: "Sună acum la 112 (urgențe, gratuit, 24 de ore din 24).", sq: "Telefono tani 112 (emergjenca, falas, 24 orë).", uk: "Телефонуйте зараз на 112 (екстрені служби, безкоштовно, цілодобово).", bn: "এখনই ১১২ নম্বরে ফোন করুন (জরুরি, বিনামূল্যে, ২৪ ঘণ্টা)।" },
  talkNow: { es: "Hablar con alguien ahora", it: "Parlare con qualcuno adesso", en: "Talk to someone now", fr: "Parler à quelqu'un maintenant", ar: "تحدث مع أحد الآن", ro: "Vorbește acum cu cineva", sq: "Fol me dikë tani", uk: "Поговорити з кимось зараз", bn: "এখনই কারও সঙ্গে কথা বলুন" },
  nearYou: { es: "Centros cerca de ti", it: "Centri vicino a te", en: "Centres near you", fr: "Centres près de chez vous", ar: "مراكز قريبة منك", ro: "Centre lângă tine", sq: "Qendra pranë teje", uk: "Центри поруч із вами", bn: "আপনার কাছের কেন্দ্র" },
  yourCity: { es: "Tu ciudad", it: "La tua città", en: "Your city", fr: "Votre ville", ar: "مدينتك", ro: "Orașul tău", sq: "Qyteti yt", uk: "Ваше місто", bn: "আপনার শহর" },
  otherCity: { es: "Otra ciudad", it: "Altra città", en: "Another city", fr: "Autre ville", ar: "مدينة أخرى", ro: "Alt oraș", sq: "Qytet tjetër", uk: "Інше місто", bn: "অন্য শহর" },
  noCity: {
    es: "Todavía no tenemos centros comprobados en tu ciudad. Puedes usar las opciones de toda Italia de abajo: el consultorio familiar de tu ASL y el centro de escucha de Cáritas existen en todas las ciudades.",
    it: "Non abbiamo ancora centri verificati nella tua città. Puoi usare le opzioni valide in tutta Italia qui sotto: il consultorio familiare della tua ASL e il centro d'ascolto Caritas ci sono in ogni città.",
    en: "We don't have verified centres in your city yet. You can use the options for all of Italy below: your ASL family counselling centre and the Caritas listening centre exist in every city.",
    fr: "Nous n'avons pas encore de centres vérifiés dans votre ville. Utilisez les options valables dans toute l'Italie ci-dessous : le consultorio familial de votre ASL et le centre d'écoute Caritas existent dans chaque ville.",
    ar: "لا تتوفر لدينا بعد مراكز موثقة في مدينتك. يمكنك استخدام الخيارات المتاحة في كل إيطاليا أدناه: مركز الاستشارة العائلية التابع للـASL ومركز الاستماع التابع لكاريتاس موجودان في كل مدينة.",
    ro: "Încă nu avem centre verificate în orașul tău. Poți folosi opțiunile din toată Italia de mai jos: consultoriul familial al ASL-ului tău și centrul de ascultare Caritas există în fiecare oraș.",
    sq: "Ende nuk kemi qendra të verifikuara në qytetin tënd. Mund të përdorësh opsionet për gjithë Italinë më poshtë: konsultori familjar i ASL-së dhe qendra e dëgjimit Caritas ekzistojnë në çdo qytet.",
    uk: "У вашому місті ще немає перевірених центрів. Скористайтеся варіантами для всієї Італії нижче: сімейна консультація вашого ASL і центр вислуховування Caritas є в кожному місті.",
    bn: "আপনার শহরে এখনও যাচাই করা কেন্দ্র নেই। নিচের সারা ইতালির বিকল্পগুলো ব্যবহার করুন: আপনার ASL-এর পারিবারিক পরামর্শ কেন্দ্র এবং কারিতাসের শোনার কেন্দ্র প্রতিটি শহরে আছে।",
  },
  allItaly: { es: "En toda Italia", it: "In tutta Italia", en: "All over Italy", fr: "Dans toute l'Italie", ar: "في كل إيطاليا", ro: "În toată Italia", sq: "Në gjithë Italinë", uk: "По всій Італії", bn: "সারা ইতালিতে" },
  call: { es: "Llamar", it: "Chiama", en: "Call", fr: "Appeler", ar: "اتصال", ro: "Sună", sq: "Telefono", uk: "Зателефонувати", bn: "ফোন করুন" },
  write: { es: "Escribir", it: "Scrivi", en: "Write", fr: "Écrire", ar: "اكتب", ro: "Scrie", sq: "Shkruaj", uk: "Написати", bn: "লিখুন" },
  map: { es: "Cómo llegar", it: "Come arrivare", en: "Directions", fr: "Itinéraire", ar: "الاتجاهات", ro: "Cum ajungi", sq: "Si të shkosh", uk: "Як дістатися", bn: "কীভাবে যাবেন" },
  web: { es: "Web", it: "Sito", en: "Website", fr: "Site", ar: "الموقع", ro: "Site", sq: "Faqja", uk: "Сайт", bn: "ওয়েবসাইট" },
  verify: {
    es: "Horarios y teléfonos pueden cambiar: llama o escribe antes de ir. Comprobado el 26/11/2026.",
    it: "Orari e telefoni possono cambiare: chiama o scrivi prima di andare. Verificato il 26/11/2026.",
    en: "Hours and phone numbers can change: call or write before going. Checked on 26/11/2026.",
    fr: "Horaires et téléphones peuvent changer : appelez ou écrivez avant d'y aller. Vérifié le 26/11/2026.",
    ar: "قد تتغير المواعيد والأرقام: اتصل أو اكتب قبل الذهاب. تم التحقق في 26/11/2026.",
    ro: "Programul și telefoanele se pot schimba: sună sau scrie înainte să mergi. Verificat la 26/11/2026.",
    sq: "Oraret dhe telefonat mund të ndryshojnë: telefono ose shkruaj para se të shkosh. Verifikuar më 26/11/2026.",
    uk: "Години роботи й телефони можуть змінюватися: зателефонуйте або напишіть перед візитом. Перевірено 26.11.2026.",
    bn: "সময় ও ফোন নম্বর বদলাতে পারে: যাওয়ার আগে ফোন করুন বা লিখুন। যাচাই: ২৬/১১/২০২৬।",
  },
  cardTitle: { es: "¿Te sientes solo o con mucho estrés?", it: "Ti senti solo o molto stressato?", en: "Feeling alone or very stressed?", fr: "Vous vous sentez seul ou très stressé ?", ar: "هل تشعر بالوحدة أو بالتوتر الشديد؟", ro: "Te simți singur sau foarte stresat?", sq: "Ndihesh vetëm ose shumë i stresuar?", uk: "Почуваєтеся самотньо чи дуже напружено?", bn: "একা বা খুব চাপে আছেন?" },
  cardBody: { es: "Hay personas para escucharte, en tu ciudad y por teléfono. Gratis.", it: "Ci sono persone pronte ad ascoltarti, nella tua città e al telefono. Gratis.", en: "There are people ready to listen, in your city and by phone. Free.", fr: "Des personnes sont là pour vous écouter, dans votre ville et par téléphone. Gratuit.", ar: "هناك من يستمع إليك، في مدينتك وعبر الهاتف. مجانًا.", ro: "Există oameni care te ascultă, în orașul tău și la telefon. Gratuit.", sq: "Ka njerëz që të dëgjojnë, në qytetin tënd dhe në telefon. Falas.", uk: "Є люди, які вислухають, у вашому місті й телефоном. Безкоштовно.", bn: "আপনার শহরে ও ফোনে আপনার কথা শোনার মানুষ আছে। বিনামূল্যে।" },
};

const T = (es: string, it: string, en: string, fr: string, ar: string, ro: string, sq: string, uk: string, bn: string): T9 => ({ es, it, en, fr, ar, ro, sq, uk, bn });

/** Opciones válidas en toda Italia */
export const NATIONAL: SupportPlace[] = [
  {
    id: "telefono-amico",
    city: null,
    name: "Telefono Amico Italia",
    what: T(
      "Línea de escucha anónima para quien se siente solo o pasa un mal momento. En italiano. Todos los días de 9:00 a 24:00; también por WhatsApp.",
      "Linea di ascolto anonima per chi si sente solo o attraversa un momento difficile. In italiano. Tutti i giorni dalle 9 alle 24; anche su WhatsApp.",
      "Anonymous listening line for anyone feeling alone or going through a hard time. In Italian. Every day 9:00–24:00; also on WhatsApp.",
      "Ligne d'écoute anonyme pour qui se sent seul ou traverse un moment difficile. En italien. Tous les jours de 9 h à 24 h ; aussi sur WhatsApp.",
      "خط استماع مجهول الهوية لمن يشعر بالوحدة أو يمر بوقت صعب. بالإيطالية. يوميًا من 9:00 إلى 24:00؛ وعبر واتساب أيضًا.",
      "Linie de ascultare anonimă pentru cine se simte singur sau trece printr-un moment greu. În italiană. Zilnic 9:00–24:00; și pe WhatsApp.",
      "Linjë dëgjimi anonime për kë ndihet vetëm ose kalon një moment të vështirë. Në italisht. Çdo ditë 9:00–24:00; edhe në WhatsApp.",
      "Анонімна лінія підтримки для тих, кому самотньо або важко. Італійською. Щодня з 9:00 до 24:00; також у WhatsApp.",
      "একাকী বা কঠিন সময় পার করা মানুষের জন্য বেনামি শোনার লাইন। ইতালীয় ভাষায়। প্রতিদিন ৯:০০–২৪:০০; হোয়াটসঅ্যাপেও।",
    ),
    phone: "+39 02 2327 2327",
    whatsapp: "393240117252",
    web: "https://www.telefonoamico.it",
    source: "https://www.telefonoamico.it",
  },
  {
    id: "1522",
    city: null,
    name: "1522 — Antiviolenza e stalking",
    what: T(
      "Si sufres violencia o acoso (en casa, en el trabajo o en la calle). Gratis, anónimo, las 24 horas, también en español, inglés y francés. Chat en 1522.eu.",
      "Se subisci violenza o stalking (in casa, al lavoro o per strada). Gratuito, anonimo, 24 ore su 24, anche in spagnolo, inglese e francese. Chat su 1522.eu.",
      "If you suffer violence or stalking (at home, at work or in the street). Free, anonymous, 24 hours, also in Spanish, English and French. Chat at 1522.eu.",
      "Si vous subissez des violences ou du harcèlement (à la maison, au travail ou dans la rue). Gratuit, anonyme, 24 h/24, aussi en espagnol, anglais et français. Chat sur 1522.eu.",
      "إذا تعرضت لعنف أو ملاحقة (في البيت أو العمل أو الشارع). مجاني، مجهول الهوية، على مدار 24 ساعة، وبالإسبانية والإنجليزية والفرنسية أيضًا. دردشة على 1522.eu.",
      "Dacă suferi violență sau hărțuire (acasă, la muncă sau pe stradă). Gratuit, anonim, 24 de ore din 24, și în spaniolă, engleză și franceză. Chat pe 1522.eu.",
      "Nëse vuan dhunë ose ndjekje (në shtëpi, në punë ose në rrugë). Falas, anonim, 24 orë, edhe në spanjisht, anglisht dhe frëngjisht. Chat në 1522.eu.",
      "Якщо ви зазнаєте насильства чи переслідування (вдома, на роботі чи на вулиці). Безкоштовно, анонімно, цілодобово, також іспанською, англійською та французькою. Чат на 1522.eu.",
      "আপনি যদি সহিংসতা বা হয়রানির শিকার হন (বাড়িতে, কাজে বা রাস্তায়)। বিনামূল্যে, বেনামি, ২৪ ঘণ্টা, স্প্যানিশ, ইংরেজি ও ফরাসিতেও। চ্যাট: 1522.eu।",
    ),
    phone: "1522",
    web: "https://www.1522.eu",
    source: "https://www.pariopportunita.gov.it",
  },
  {
    id: "consultorio",
    city: null,
    name: "Consultorio familiare (ASL)",
    what: T(
      "En cada barrio hay un consultorio familiar de la sanidad pública con psicólogos. Atienden también a personas extranjeras, incluso sin permiso (con el código STP). Busca el de tu zona en la web de tu ASL o pregunta a tu médico.",
      "In ogni zona c'è un consultorio familiare della sanità pubblica con psicologi. Accolgono anche persone straniere, anche senza permesso (con il codice STP). Cerca quello della tua zona sul sito della tua ASL o chiedi al tuo medico.",
      "Every area has a public family counselling centre (consultorio) with psychologists. They also see foreigners, even without a permit (with the STP code). Find yours on your ASL website or ask your doctor.",
      "Chaque quartier a un consultorio familial public avec des psychologues. Ils reçoivent aussi les étrangers, même sans titre de séjour (avec le code STP). Trouvez le vôtre sur le site de votre ASL ou demandez à votre médecin.",
      "في كل منطقة مركز استشارة عائلية (consultorio) تابع للصحة العامة فيه أخصائيون نفسيون. يستقبلون الأجانب أيضًا، حتى بدون تصريح (برمز STP). ابحث عن مركز منطقتك في موقع الـASL أو اسأل طبيبك.",
      "În fiecare zonă există un consultoriu familial public cu psihologi. Primesc și străini, chiar fără permis (cu codul STP). Caută-l pe al tău pe site-ul ASL-ului sau întreabă medicul.",
      "Në çdo zonë ka një konsultor familjar publik me psikologë. Pranojnë edhe të huaj, edhe pa leje (me kodin STP). Gjeje atë të zonës tënde në faqen e ASL-së ose pyet mjekun.",
      "У кожному районі є державна сімейна консультація (consultorio) з психологами. Там приймають і іноземців, навіть без дозволу (з кодом STP). Знайдіть свою на сайті вашого ASL або запитайте лікаря.",
      "প্রতিটি এলাকায় সরকারি পারিবারিক পরামর্শ কেন্দ্র (consultorio) আছে, যেখানে মনোবিজ্ঞানী থাকেন। বিদেশিদেরও দেখেন, অনুমতি ছাড়াও (STP কোড দিয়ে)। আপনার ASL-এর ওয়েবসাইটে খুঁজুন বা ডাক্তারকে জিজ্ঞেস করুন।",
    ),
    source: "https://www.salute.gov.it",
  },
  {
    id: "caritas",
    city: null,
    name: "Caritas — Centri di ascolto",
    what: T(
      "Cada diócesis tiene centros de escucha de Cáritas: te reciben, te escuchan y te orientan hacia ayudas, comida, ropa o apoyo psicológico. No importa tu religión ni tus papeles.",
      "Ogni diocesi ha centri d'ascolto Caritas: ti accolgono, ti ascoltano e ti orientano verso aiuti, cibo, vestiti o supporto psicologico. Non importa la tua religione né i tuoi documenti.",
      "Every diocese has Caritas listening centres: they welcome you, listen and guide you to help, food, clothes or psychological support. Your religion or papers don't matter.",
      "Chaque diocèse a des centres d'écoute Caritas : ils vous accueillent, vous écoutent et vous orientent vers des aides, de la nourriture, des vêtements ou un soutien psychologique. Votre religion ou vos papiers n'ont pas d'importance.",
      "لكل أبرشية مراكز استماع تابعة لكاريتاس: يستقبلونك ويستمعون إليك ويوجهونك إلى المساعدات أو الطعام أو الملابس أو الدعم النفسي. لا يهم دينك ولا أوراقك.",
      "Fiecare dieceză are centre de ascultare Caritas: te primesc, te ascultă și te îndrumă spre ajutoare, mâncare, haine sau sprijin psihologic. Nu contează religia sau actele tale.",
      "Çdo dioqezë ka qendra dëgjimi Caritas: të presin, të dëgjojnë dhe të orientojnë drejt ndihmave, ushqimit, rrobave ose mbështetjes psikologjike. Nuk ka rëndësi feja apo dokumentet.",
      "У кожній дієцезії є центри вислуховування Caritas: вас приймуть, вислухають і скерують до допомоги, їжі, одягу чи психологічної підтримки. Релігія та документи не мають значення.",
      "প্রতিটি ডায়োসিসে কারিতাসের শোনার কেন্দ্র আছে: তারা আপনাকে স্বাগত জানায়, কথা শোনে এবং সাহায্য, খাবার, পোশাক বা মানসিক সহায়তার দিকে পথ দেখায়। ধর্ম বা কাগজপত্র কোনো ব্যাপার নয়।",
    ),
    web: "https://www.caritas.it",
    source: "https://www.caritas.it",
  },
];

/** Centros por ciudad (comprobados). */
export const LOCAL: SupportPlace[] = [
  {
    id: "milano-welcome",
    city: "Milano",
    name: "Milano Welcome Center (Comune di Milano)",
    what: T(
      "Centro del Ayuntamiento para personas migrantes y refugiadas: mediadores, trabajadores sociales, asesoría legal y psicólogos. Te orientan y te acompañan. Se puede ir sin cita.",
      "Centro del Comune per persone migranti e rifugiate: mediatori, assistenti sociali, consulenza legale e psicologi. Ti orientano e ti accompagnano. Si può andare senza appuntamento.",
      "City centre for migrants and refugees: mediators, social workers, legal advice and psychologists. They guide and accompany you. You can go without an appointment.",
      "Centre de la Ville pour personnes migrantes et réfugiées : médiateurs, travailleurs sociaux, conseil juridique et psychologues. Ils vous orientent et vous accompagnent. On peut y aller sans rendez-vous.",
      "مركز البلدية للمهاجرين واللاجئين: وسطاء ثقافيون وأخصائيون اجتماعيون واستشارات قانونية وأخصائيون نفسيون. يوجهونك ويرافقونك. يمكن الذهاب بدون موعد.",
      "Centrul Primăriei pentru migranți și refugiați: mediatori, asistenți sociali, consultanță juridică și psihologi. Te îndrumă și te însoțesc. Poți merge fără programare.",
      "Qendra e Bashkisë për migrantë dhe refugjatë: ndërmjetës, punonjës socialë, këshillim ligjor dhe psikologë. Të orientojnë dhe të shoqërojnë. Mund të shkosh pa takim.",
      "Міський центр для мігрантів і біженців: медіатори, соціальні працівники, юридичні консультації та психологи. Вас зорієнтують і супроводять. Можна прийти без запису.",
      "অভিবাসী ও শরণার্থীদের জন্য পৌর কেন্দ্র: মধ্যস্থতাকারী, সমাজকর্মী, আইনি পরামর্শ ও মনোবিজ্ঞানী। তারা পথ দেখায় ও সঙ্গে থাকে। অ্যাপয়েন্টমেন্ট ছাড়াই যাওয়া যায়।",
    ),
    address: "Via Sammartini 75, 20125 Milano",
    email: "MilanoWelcomeCenter@comune.milano.it",
    hours: T("Lunes a viernes, 9:00–17:00", "Dal lunedì al venerdì, 9–17", "Monday to Friday, 9:00–17:00", "Du lundi au vendredi, 9 h–17 h", "من الاثنين إلى الجمعة، 9:00–17:00", "Luni–vineri, 9:00–17:00", "E hënë–e premte, 9:00–17:00", "Понеділок–п'ятниця, 9:00–17:00", "সোম থেকে শুক্র, ৯:০০–১৭:০০"),
    web: "https://servizicrm.comune.milano.it/centro-supporto/KA-02793/Milano-Welcome-Center",
    source: "https://www.comune.milano.it/en/w/welfare.-inaugurato-il-milano-welcome-center-in-via-sammartini-75",
  },
  {
    id: "milano-wasi",
    city: "Milano",
    name: "WASI — Sportello psicologico (ASCS)",
    what: T(
      "Apoyo psicológico gratuito, en persona u online, con psicólogas que hablan tu idioma (español, portugués, inglés, árabe, ucraniano, ruso…).",
      "Supporto psicologico gratuito, in presenza o online, con psicologhe che parlano la tua lingua (spagnolo, portoghese, inglese, arabo, ucraino, russo…).",
      "Free psychological support, in person or online, with psychologists who speak your language (Spanish, Portuguese, English, Arabic, Ukrainian, Russian…).",
      "Soutien psychologique gratuit, sur place ou en ligne, avec des psychologues qui parlent votre langue (espagnol, portugais, anglais, arabe, ukrainien, russe…).",
      "دعم نفسي مجاني، حضوريًا أو عبر الإنترنت، مع أخصائيات يتحدثن لغتك (الإسبانية، البرتغالية، الإنجليزية، العربية، الأوكرانية، الروسية…).",
      "Sprijin psihologic gratuit, la sediu sau online, cu psihologe care vorbesc limba ta (spaniolă, portugheză, engleză, arabă, ucraineană, rusă…).",
      "Mbështetje psikologjike falas, me prani ose online, me psikologe që flasin gjuhën tënde (spanjisht, portugalisht, anglisht, arabisht, ukrainisht, rusisht…).",
      "Безкоштовна психологічна підтримка, очно або онлайн, з психологинями, які говорять вашою мовою (іспанською, португальською, англійською, арабською, українською, російською…).",
      "বিনামূল্যে মানসিক সহায়তা, সরাসরি বা অনলাইনে, আপনার ভাষায় কথা বলা মনোবিজ্ঞানীদের সঙ্গে (স্প্যানিশ, পর্তুগিজ, ইংরেজি, আরবি, ইউক্রেনীয়, রুশ…)।",
    ),
    forWho: T("Sobre todo para mujeres migrantes", "Soprattutto per donne migranti", "Mainly for migrant women", "Surtout pour les femmes migrantes", "بشكل خاص للنساء المهاجرات", "În special pentru femei migrante", "Sidomos për gra migrante", "Переважно для жінок-мігранток", "প্রধানত অভিবাসী নারীদের জন্য"),
    address: "Piazza del Carmine 2, 20121 Milano",
    phone: "+39 351 687 4011",
    email: "wasi@ascs.it",
    web: "https://www.ascs.it/wasi/",
    source: "https://www.chiesadelcarmine.net/en/wasi",
  },
  {
    id: "roma-wasi",
    city: "Roma",
    name: "WASI — Sportello psicologico (ASCS)",
    what: T(
      "Apoyo psicológico gratuito, en persona u online, con psicólogas que hablan español y portugués.",
      "Supporto psicologico gratuito, in presenza o online, con psicologhe che parlano spagnolo e portoghese.",
      "Free psychological support, in person or online, with psychologists who speak Spanish and Portuguese.",
      "Soutien psychologique gratuit, sur place ou en ligne, avec des psychologues qui parlent espagnol et portugais.",
      "دعم نفسي مجاني، حضوريًا أو عبر الإنترنت، مع أخصائيات يتحدثن الإسبانية والبرتغالية.",
      "Sprijin psihologic gratuit, la sediu sau online, cu psihologe care vorbesc spaniolă și portugheză.",
      "Mbështetje psikologjike falas, me prani ose online, me psikologe që flasin spanjisht dhe portugalisht.",
      "Безкоштовна психологічна підтримка, очно або онлайн, з психологинями, які говорять іспанською та португальською.",
      "বিনামূল্যে মানসিক সহায়তা, সরাসরি বা অনলাইনে, স্প্যানিশ ও পর্তুগিজভাষী মনোবিজ্ঞানীদের সঙ্গে।",
    ),
    forWho: T("Sobre todo para mujeres migrantes", "Soprattutto per donne migranti", "Mainly for migrant women", "Surtout pour les femmes migrantes", "بشكل خاص للنساء المهاجرات", "În special pentru femei migrante", "Sidomos për gra migrante", "Переважно для жінок-мігранток", "প্রধানত অভিবাসী নারীদের জন্য"),
    phone: "+39 351 735 8406",
    email: "wasi@ascs.it",
    web: "https://www.ascs.it/wasi/",
    source: "https://www.chiesadelcarmine.net/en/wasi",
  },
  {
    id: "roma-samifo",
    city: "Roma",
    name: "Centro SaMiFo (ASL Roma 1)",
    what: T(
      "Centro de salud de la sanidad pública para personas solicitantes de asilo y con protección internacional: médicos, mediadores y acompañamiento. Pregunta por el apoyo psicológico.",
      "Centro di salute della sanità pubblica per richiedenti asilo e titolari di protezione internazionale: medici, mediatori e accompagnamento. Chiedi del supporto psicologico.",
      "Public health centre for asylum seekers and people with international protection: doctors, mediators and support. Ask about psychological support.",
      "Centre de santé public pour demandeurs d'asile et bénéficiaires de la protection internationale : médecins, médiateurs et accompagnement. Demandez le soutien psychologique.",
      "مركز صحي عام لطالبي اللجوء والحاصلين على الحماية الدولية: أطباء ووسطاء ومرافقة. اسأل عن الدعم النفسي.",
      "Centru de sănătate public pentru solicitanți de azil și beneficiari de protecție internațională: medici, mediatori și însoțire. Întreabă de sprijinul psihologic.",
      "Qendër shëndetësore publike për azilkërkues dhe përfitues të mbrojtjes ndërkombëtare: mjekë, ndërmjetës dhe shoqërim. Pyet për mbështetjen psikologjike.",
      "Державний центр здоров'я для шукачів притулку та осіб із міжнародним захистом: лікарі, медіатори й супровід. Запитайте про психологічну підтримку.",
      "আশ্রয়প্রার্থী ও আন্তর্জাতিক সুরক্ষাপ্রাপ্তদের জন্য সরকারি স্বাস্থ্যকেন্দ্র: ডাক্তার, মধ্যস্থতাকারী ও সহায়তা। মানসিক সহায়তার কথা জিজ্ঞেস করুন।",
    ),
    forWho: T("Solicitantes de asilo y protección internacional", "Richiedenti asilo e protezione internazionale", "Asylum seekers and international protection", "Demandeurs d'asile et protection internationale", "طالبو اللجوء والحماية الدولية", "Solicitanți de azil și protecție internațională", "Azilkërkues dhe mbrojtje ndërkombëtare", "Шукачі притулку та міжнародний захист", "আশ্রয়প্রার্থী ও আন্তর্জাতিক সুরক্ষা"),
    address: "Via Luigi Luzzatti 8, 00185 Roma",
    phone: "+39 06 7730 7555",
    email: "samifo@aslroma1.it",
    web: "https://www.aslroma1.it",
    source: "https://www.aslroma1.it/uploads/files/59_14_SAMIFO_SPAGNOLO_ICARE.pdf",
  },
  {
    id: "torino-fanon",
    city: "Torino",
    name: "Centro Frantz Fanon",
    what: T(
      "Escucha, apoyo psicológico y psicoterapia para personas migrantes, refugiadas y sus familias, con mediadores culturales. Pregunta si es gratuito en tu caso.",
      "Ascolto, supporto psicologico e psicoterapia per persone migranti, rifugiate e le loro famiglie, con mediatori culturali. Chiedi se è gratuito nel tuo caso.",
      "Listening, psychological support and psychotherapy for migrants, refugees and their families, with cultural mediators. Ask whether it is free in your case.",
      "Écoute, soutien psychologique et psychothérapie pour personnes migrantes, réfugiées et leurs familles, avec des médiateurs culturels. Demandez si c'est gratuit dans votre cas.",
      "استماع ودعم نفسي وعلاج نفسي للمهاجرين واللاجئين وعائلاتهم، مع وسطاء ثقافيين. اسأل إن كان مجانيًا في حالتك.",
      "Ascultare, sprijin psihologic și psihoterapie pentru migranți, refugiați și familiile lor, cu mediatori culturali. Întreabă dacă e gratuit în cazul tău.",
      "Dëgjim, mbështetje psikologjike dhe psikoterapi për migrantë, refugjatë dhe familjet e tyre, me ndërmjetës kulturorë. Pyet nëse është falas për rastin tënd.",
      "Вислуховування, психологічна підтримка й психотерапія для мігрантів, біженців та їхніх родин, з культурними медіаторами. Запитайте, чи це безкоштовно у вашому випадку.",
      "অভিবাসী, শরণার্থী ও তাদের পরিবারের জন্য শোনা, মানসিক সহায়তা ও সাইকোথেরাপি, সাংস্কৃতিক মধ্যস্থতাকারীসহ। আপনার ক্ষেত্রে বিনামূল্যে কি না জিজ্ঞেস করুন।",
    ),
    address: "Via San Francesco d'Assisi 3, 10122 Torino",
    phone: "+39 011 454 6552",
    email: "associazionefanon@associazionefanon.it",
    hours: T("Lunes y miércoles (confirma el horario)", "Lunedì e mercoledì (verifica l'orario)", "Monday and Wednesday (confirm hours)", "Lundi et mercredi (vérifiez l'horaire)", "الاثنين والأربعاء (تأكد من الموعد)", "Luni și miercuri (verifică programul)", "E hënë dhe e mërkurë (konfirmo orarin)", "Понеділок і середа (уточніть години)", "সোম ও বুধবার (সময় নিশ্চিত করুন)"),
    web: "https://associazionefanon.it",
    source: "https://associazionefanon.it/en/contact-us/",
  },
];

export const SUPPORT_CITIES = [...new Set(LOCAL.map((p) => p.city!))].sort();
