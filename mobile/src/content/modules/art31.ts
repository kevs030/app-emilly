import { P } from "./phrases";
import type { CityEntry, ExternalLink, T9 } from "./types";

/**
 * Art. 31 (c. 3) D.Lgs. 286/1998: autorización del Tribunale per i Minorenni para que un familiar se quede en Italia
 * por graves motivos ligados al desarrollo del menor. La competencia es del Tribunal de Menores del distrito donde vive el niño.
 * Webs de los tribunales: dominio tribmin-<ciudad>.giustizia.it (Torino, Milano, Bologna, Palermo y Bari comprobados el 18-11-2026).
 * Para añadir una ciudad: un objeto más en COURTS.
 */
export const A31 = {
  courtTitle: { es: "Dónde se presenta en tu ciudad", it: "Dove si presenta nella tua città", en: "Where to file in your city", fr: "Où déposer la demande dans votre ville", ar: "أين يُقدَّم الطلب في مدينتك", ro: "Unde se depune în orașul tău", sq: "Ku dorëzohet në qytetin tuaj", uk: "Куди подавати у вашому місті", bn: "আপনার শহরে কোথায় জমা দেবেন" },
  how: {
    es: "Cómo se presenta: con un abogado (por vía telemática) o, en algunos tribunales, en persona en la cancillería con su formulario. Si tus ingresos son bajos puedes pedir abogado de oficio gratuito (patrocinio a spese dello Stato).",
    it: "Come si presenta: tramite avvocato (deposito telematico) oppure, in alcuni tribunali, di persona in cancelleria con il loro modulo. Con redditi bassi puoi chiedere il patrocinio a spese dello Stato.",
    en: "How to file: through a lawyer (online filing) or, at some courts, in person at the registry using their form. On a low income you can ask for a free state-funded lawyer (patrocinio a spese dello Stato).",
    fr: "Comment déposer : par un avocat (dépôt télématique) ou, dans certains tribunaux, en personne au greffe avec leur formulaire. Avec de faibles revenus, vous pouvez demander l'aide juridictionnelle (patrocinio a spese dello Stato).",
    ar: "طريقة التقديم: عن طريق محامٍ (إيداع إلكتروني) أو، في بعض المحاكم، حضوريًا في قلم الكتّاب باستخدام استمارتهم. إذا كان دخلك منخفضًا يمكنك طلب محامٍ مجاني على نفقة الدولة (patrocinio a spese dello Stato).",
    ro: "Cum se depune: prin avocat (depunere telematică) sau, la unele tribunale, personal la grefă cu formularul lor. Dacă ai venituri mici, poți cere avocat din oficiu gratuit (patrocinio a spese dello Stato).",
    sq: "Si dorëzohet: përmes avokatit (dorëzim elektronik) ose, në disa gjykata, personalisht në sekretari me formularin e tyre. Me të ardhura të ulëta mund të kërkoni avokat falas me shpenzime të shtetit (patrocinio a spese dello Stato).",
    uk: "Як подати: через адвоката (електронне подання) або в деяких судах особисто в канцелярії на їхньому бланку. За низького доходу можна попросити безоплатного адвоката (patrocinio a spese dello Stato).",
    bn: "কীভাবে জমা দেবেন: আইনজীবীর মাধ্যমে (অনলাইনে জমা) অথবা কিছু আদালতে তাদের ফর্ম দিয়ে সরাসরি দপ্তরে। আয় কম হলে সরকারি খরচে বিনামূল্যে আইনজীবী (patrocinio a spese dello Stato) চাইতে পারেন।",
  },
  docs: {
    es: "Suele pedirse: pasaporte del familiar, acta de nacimiento del menor y prueba del parentesco, prueba de que el niño vive en Italia (residencia u hospitalidad), certificados del colegio o del pediatra y todo lo que muestre por qué la separación le haría daño.",
    it: "Di solito servono: passaporto del familiare, atto di nascita del minore e prova della parentela, prova che il bambino vive in Italia (residenza o ospitalità), certificati di scuola o pediatra e tutto ciò che mostra perché la separazione gli farebbe danno.",
    en: "Usually needed: the relative's passport, the child's birth certificate and proof of the relationship, proof that the child lives in Italy (residence or hospitality), school or paediatrician certificates, and anything showing why separation would harm the child.",
    fr: "Généralement demandés : passeport du parent, acte de naissance de l'enfant et preuve du lien, preuve que l'enfant vit en Italie (résidence ou hébergement), certificats de l'école ou du pédiatre et tout ce qui montre pourquoi la séparation lui nuirait.",
    ar: "يُطلب عادةً: جواز سفر القريب، وشهادة ميلاد القاصر وإثبات القرابة، وإثبات أن الطفل يعيش في إيطاليا (إقامة أو استضافة)، وشهادات المدرسة أو طبيب الأطفال، وكل ما يبيّن لماذا يضرّ الانفصال بالطفل.",
    ro: "De obicei se cer: pașaportul rudei, certificatul de naștere al minorului și dovada rudeniei, dovada că minorul locuiește în Italia (rezidență sau găzduire), adeverințe de la școală sau pediatru și tot ce arată de ce despărțirea i-ar face rău.",
    sq: "Zakonisht kërkohen: pasaporta e të afërmit, akti i lindjes së të miturit dhe prova e lidhjes familjare, prova se fëmija jeton në Itali (rezidencë ose mikpritje), vërtetime nga shkolla ose pediatri dhe çdo gjë që tregon pse ndarja do ta dëmtonte.",
    uk: "Зазвичай потрібні: паспорт родича, свідоцтво про народження дитини та доказ спорідненості, доказ, що дитина живе в Італії (реєстрація чи проживання), довідки зі школи або від педіатра й усе, що показує, чому розлука зашкодить дитині.",
    bn: "সাধারণত লাগে: আত্মীয়ের পাসপোর্ট, শিশুর জন্মসনদ ও সম্পর্কের প্রমাণ, শিশুটি ইতালিতে থাকে তার প্রমাণ (residenza বা ospitalità), স্কুল বা শিশু-চিকিৎসকের সনদ, এবং বিচ্ছেদ কেন শিশুর ক্ষতি করবে তা দেখায় এমন সবকিছু।",
  },
  cost: {
    es: "Coste: el procedimiento no paga contributo unificato, pero muchos tribunales piden un anticipo fijo de unos 27 € (marca da bollo o pagoPA). Confírmalo en tu tribunal.",
    it: "Costi: niente contributo unificato, ma molti tribunali chiedono un'anticipazione forfettaria di circa 27 € (marca da bollo o pagoPA). Verifica presso il tuo tribunale.",
    en: "Cost: no contributo unificato, but many courts ask for a fixed advance of about €27 (revenue stamp or pagoPA). Check with your court.",
    fr: "Coût : pas de contributo unificato, mais de nombreux tribunaux demandent une avance forfaitaire d'environ 27 € (timbre fiscal ou pagoPA). Vérifiez auprès de votre tribunal.",
    ar: "التكلفة: لا يُدفع contributo unificato، لكن كثيرًا من المحاكم تطلب دفعة ثابتة نحو 27 يورو (طابع ضريبي أو pagoPA). تأكد من محكمتك.",
    ro: "Cost: fără contributo unificato, dar multe tribunale cer un avans fix de circa 27 € (timbru fiscal sau pagoPA). Verifică la tribunalul tău.",
    sq: "Kostoja: nuk paguhet contributo unificato, por shumë gjykata kërkojnë një paradhënie fikse rreth 27 € (pullë takse ose pagoPA). Verifikojeni në gjykatën tuaj.",
    uk: "Вартість: contributo unificato не сплачується, але багато судів просять фіксований аванс близько 27 € (гербова марка або pagoPA). Уточніть у своєму суді.",
    bn: "খরচ: contributo unificato লাগে না, তবে অনেক আদালত প্রায় ২৭ € নির্দিষ্ট অগ্রিম চায় (রেভিনিউ স্ট্যাম্প বা pagoPA)। আপনার আদালতে নিশ্চিত হোন।",
  },
  otherCity: {
    es: "Hay un Tribunal de Menores por cada distrito de Corte de Apelación (29 en Italia). Busca «Tribunale per i Minorenni di» y la capital de tu distrito, o pregunta en un Patronato o una asociación.",
    it: "C'è un Tribunale per i Minorenni per ogni distretto di Corte d'Appello (29 in Italia). Cerca «Tribunale per i Minorenni di» e il capoluogo del tuo distretto, o chiedi a un Patronato o un'associazione.",
    en: "There is one Juvenile Court for each Court of Appeal district (29 in Italy). Search “Tribunale per i Minorenni di” plus your district's main city, or ask a Patronato or an association.",
    fr: "Il y a un Tribunal pour mineurs par district de Cour d'appel (29 en Italie). Cherchez « Tribunale per i Minorenni di » et le chef-lieu de votre district, ou demandez à un Patronato ou une association.",
    ar: "توجد محكمة قاصرين لكل دائرة محكمة استئناف (29 في إيطاليا). ابحث عن «Tribunale per i Minorenni di» مع اسم المدينة الرئيسية لدائرتك، أو اسأل أحد الـPatronato أو جمعية.",
    ro: "Există un Tribunal pentru Minori pentru fiecare district de Curte de Apel (29 în Italia). Caută „Tribunale per i Minorenni di” și capitala districtului tău sau întreabă la un Patronato ori o asociație.",
    sq: "Ka një Gjykatë për të Miturit për çdo distrikt të Gjykatës së Apelit (29 në Itali). Kërkoni «Tribunale per i Minorenni di» dhe qytetin kryesor të distriktit, ose pyesni një Patronato ose shoqatë.",
    uk: "Для кожного округу апеляційного суду є свій суд у справах неповнолітніх (29 в Італії). Шукайте «Tribunale per i Minorenni di» і головне місто вашого округу або запитайте в Patronato чи асоціації.",
    bn: "প্রতিটি আপিল আদালত জেলার জন্য একটি কিশোর আদালত আছে (ইতালিতে ২৯টি)। «Tribunale per i Minorenni di» এবং আপনার জেলার প্রধান শহরের নাম লিখে খুঁজুন, অথবা কোনো Patronato বা সংগঠনে জিজ্ঞেস করুন।",
  },
} satisfies Record<string, T9>;

const courtNote = (court: string, area: string): T9 => ({
  es: `Tribunal competente: Tribunale per i Minorenni di ${court} (para ${area}). Presenta la solicitud allí: con abogado por vía telemática o, si el tribunal lo permite, en su cancillería.`,
  it: `Tribunale competente: Tribunale per i Minorenni di ${court} (per ${area}). Deposita lì il ricorso: tramite avvocato in via telematica o, se il tribunale lo consente, in cancelleria.`,
  en: `Competent court: Tribunale per i Minorenni di ${court} (for ${area}). File there: through a lawyer online or, if the court allows it, at its registry.`,
  fr: `Tribunal compétent : Tribunale per i Minorenni di ${court} (pour ${area}). Déposez la demande là-bas : par un avocat en ligne ou, si le tribunal l'accepte, au greffe.`,
  ar: `المحكمة المختصة: Tribunale per i Minorenni di ${court} (لـ ${area}). قدّم الطلب هناك: عن طريق محامٍ إلكترونيًا أو في قلم الكتّاب إن سمحت المحكمة بذلك.`,
  ro: `Tribunal competent: Tribunale per i Minorenni di ${court} (pentru ${area}). Depune cererea acolo: prin avocat, telematic, sau, dacă tribunalul permite, la grefă.`,
  sq: `Gjykata kompetente: Tribunale per i Minorenni di ${court} (për ${area}). Dorëzojeni atje: përmes avokatit në mënyrë elektronike ose, nëse gjykata e lejon, në sekretari.`,
  uk: `Компетентний суд: Tribunale per i Minorenni di ${court} (для ${area}). Подавайте туди: через адвоката електронно або, якщо суд дозволяє, у канцелярії.`,
  bn: `সংশ্লিষ্ট আদালত: Tribunale per i Minorenni di ${court} (${area}-এর জন্য)। সেখানে জমা দিন: আইনজীবীর মাধ্যমে অনলাইনে, অথবা আদালত অনুমতি দিলে দপ্তরে।`,
});

const court = (id: string, name: string): ExternalLink => ({
  id: `tm-${id}`,
  url: `https://tribmin-${id}.giustizia.it`,
  label: { es: `Tribunale per i Minorenni di ${name}`, it: `Tribunale per i Minorenni di ${name}`, en: `Tribunale per i Minorenni di ${name}`, fr: `Tribunale per i Minorenni di ${name}`, ar: `Tribunale per i Minorenni di ${name}`, ro: `Tribunale per i Minorenni di ${name}`, sq: `Tribunale per i Minorenni di ${name}`, uk: `Tribunale per i Minorenni di ${name}`, bn: `Tribunale per i Minorenni di ${name}` },
  what: P.wCourt,
  steps: [
    {
      es: "Busca la sección «Servizi» o «Modulistica» y la información sobre el art. 31.",
      it: "Cerca la sezione «Servizi» o «Modulistica» e le informazioni sull'art. 31.",
      en: "Look for the “Servizi” or “Modulistica” section and the art. 31 information.",
      fr: "Cherchez la section « Servizi » ou « Modulistica » et les informations sur l'art. 31.",
      ar: "ابحث عن قسم «Servizi» أو «Modulistica» والمعلومات الخاصة بالمادة 31.",
      ro: "Caută secțiunea „Servizi” sau „Modulistica” și informațiile despre art. 31.",
      sq: "Kërkoni seksionin «Servizi» ose «Modulistica» dhe informacionin për nenin 31.",
      uk: "Знайдіть розділ «Servizi» або «Modulistica» та інформацію про ст. 31.",
      bn: "«Servizi» বা «Modulistica» অংশ এবং ৩১ ধারার তথ্য খুঁজুন।",
    },
    P.sCheckSite,
  ],
});

export const COURTS: CityEntry[] = [
  { id: "milano", city: "Milano", region: "Lombardia", note: courtNote("Milano", "Milano, Como, Lecco, Lodi, Monza, Pavia, Sondrio, Varese"), links: [court("milano", "Milano")] },
  { id: "roma", city: "Roma", region: "Lazio", note: courtNote("Roma", "Lazio"), links: [court("roma", "Roma")] },
  {
    id: "torino",
    city: "Torino",
    region: "Piemonte",
    note: {
      ...courtNote("Torino", "Piemonte e Valle d'Aosta"),
      es: courtNote("Torino", "Piamonte y Valle de Aosta").es + " Este tribunal publica sus propias instrucciones y un formulario para el art. 31.",
      it: courtNote("Torino", "Piemonte e Valle d'Aosta").it + " Questo tribunale pubblica istruzioni e modulo propri per l'art. 31.",
      en: courtNote("Torino", "Piedmont and Aosta Valley").en + " This court publishes its own instructions and form for art. 31.",
      fr: courtNote("Torino", "Piémont et Vallée d'Aoste").fr + " Ce tribunal publie ses propres instructions et un formulaire pour l'art. 31.",
      ar: courtNote("Torino", "بييمونتي ووادي أوستا").ar + " تنشر هذه المحكمة تعليماتها واستمارتها الخاصة بالمادة 31.",
      ro: courtNote("Torino", "Piemont și Valea Aosta").ro + " Acest tribunal publică instrucțiuni și un formular propriu pentru art. 31.",
      sq: courtNote("Torino", "Piemonte dhe Lugina e Aostës").sq + " Kjo gjykatë publikon udhëzimet dhe formularin e vet për nenin 31.",
      uk: courtNote("Torino", "П'ємонт і Валле-д'Аоста").uk + " Цей суд публікує власні інструкції та бланк для ст. 31.",
      bn: courtNote("Torino", "পিয়েমন্তে ও ভাল্লে দাওস্তা").bn + " এই আদালত ৩১ ধারার জন্য নিজস্ব নির্দেশনা ও ফর্ম প্রকাশ করে।",
    },
    links: [
      court("torino", "Torino"),
      {
        id: "tm-torino-modulo",
        url: "https://tribmin-torino.giustizia.it/cmsresources/cms/documents/Istruzioni_+_Mod._Istanza_Art_31_4.pdf",
        label: { es: "Instrucciones y formulario art. 31 (Turín)", it: "Istruzioni e modulo art. 31 (Torino)", en: "Art. 31 instructions and form (Turin)", fr: "Instructions et formulaire art. 31 (Turin)", ar: "تعليمات واستمارة المادة 31 (تورينو)", ro: "Instrucțiuni și formular art. 31 (Torino)", sq: "Udhëzime dhe formular neni 31 (Torino)", uk: "Інструкції та бланк ст. 31 (Турин)", bn: "৩১ ধারার নির্দেশনা ও ফর্ম (তুরিন)" },
        what: {
          es: "PDF oficial en italiano del Tribunal de Menores de Turín: qué documentos adjuntar y el modelo de solicitud.",
          it: "PDF ufficiale del Tribunale per i Minorenni di Torino: documenti da allegare e modello di istanza.",
          en: "Official Italian PDF from the Turin Juvenile Court: documents to attach and the application template.",
          fr: "PDF officiel en italien du Tribunal pour mineurs de Turin : documents à joindre et modèle de demande.",
          ar: "ملف PDF رسمي بالإيطالية من محكمة قاصرين تورينو: الوثائق المطلوب إرفاقها ونموذج الطلب.",
          ro: "PDF oficial în italiană al Tribunalului pentru Minori din Torino: documentele de anexat și modelul de cerere.",
          sq: "PDF zyrtar në italisht i Gjykatës për të Miturit në Torino: dokumentet që bashkëngjiten dhe modeli i kërkesës.",
          uk: "Офіційний PDF італійською від суду в справах неповнолітніх Турина: які документи додати та зразок заяви.",
          bn: "তুরিন কিশোর আদালতের ইতালীয় ভাষার অফিসিয়াল PDF: কোন কাগজ সংযুক্ত করতে হবে এবং আবেদনের নমুনা।",
        },
        steps: [A31.docs, A31.cost],
      },
    ],
  },
  { id: "napoli", city: "Napoli", region: "Campania", note: courtNote("Napoli", "Napoli e la sua Corte d'Appello"), links: [court("napoli", "Napoli")] },
  { id: "bologna", city: "Bologna", region: "Emilia-Romagna", note: courtNote("Bologna", "Emilia-Romagna"), links: [court("bologna", "Bologna")] },
  { id: "firenze", city: "Firenze", region: "Toscana", note: courtNote("Firenze", "Toscana"), links: [court("firenze", "Firenze")] },
  { id: "palermo", city: "Palermo", region: "Sicilia", note: courtNote("Palermo", "Palermo, Agrigento, Trapani, Termini Imerese, Sciacca, Marsala"), links: [court("palermo", "Palermo")] },
  { id: "bari", city: "Bari", region: "Puglia", note: courtNote("Bari", "Bari, Foggia, Trani"), links: [court("bari", "Bari")] },
];
