import type { T9 } from "./types";

/**
 * «¿En qué punto está mi permiso?»: consulta oficial en la web de la Polizia di Stato con el número del recibo de Poste.
 * La app no puede leer esa web por ti (no hay servicio oficial para apps), así que guarda tu número en el teléfono,
 * lo copia y abre la página correcta; luego te dice qué significa el color y te recuerda volver a mirar.
 * Fuentes: questure.poliziadistato.it/stranieri y la guía de Poste Italiane (comprobado el 26/11/2026).
 */
export const POLICE_STATUS_URL = "https://questure.poliziadistato.it/stranieri";
export const POSTE_PORTAL_URL = "https://www.portaleimmigrazione.it";

export type PermitColor = "green" | "orange" | "red";

/** 10 caracteres (número de práctica) o 12 (número de la «assicurata»), sin espacios. */
export function cleanPermitCode(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}
export function permitCodeOk(code: string): boolean {
  return /^[A-Z0-9]{10}$/.test(code) || /^[0-9]{12}$/.test(code);
}

const T = (es: string, it: string, en: string, fr: string, ar: string, ro: string, sq: string, uk: string, bn: string): T9 => ({ es, it, en, fr, ar, ro, sq, uk, bn });

export const PS: Record<string, T9> = {
  title: T("¿En qué punto está mi permiso?", "A che punto è il mio permesso?", "Where is my permit?", "Où en est mon titre de séjour ?", "أين وصل تصريح إقامتي؟", "În ce stadiu e permisul meu?", "Në çfarë faze është leja ime?", "На якому етапі мій дозвіл?", "আমার পারমিট কোন পর্যায়ে?"),
  cardBody: T("Mira en 1 minuto si tu permiso de residencia ya está listo en la Questura.", "Scopri in 1 minuto se il tuo permesso di soggiorno è pronto in Questura.", "Check in 1 minute whether your residence permit is ready at the Questura.", "Vérifiez en 1 minute si votre titre de séjour est prêt à la Questura.", "تحقق في دقيقة واحدة إن كان تصريح إقامتك جاهزًا في الكويستورا.", "Verifică într-un minut dacă permisul de ședere e gata la Questura.", "Shiko për 1 minutë nëse leja e qëndrimit është gati në Kuesturë.", "Перевірте за 1 хвилину, чи готовий ваш дозвіл у Квестурі.", "১ মিনিটে দেখুন আপনার রেসিডেন্স পারমিট কোয়েস্তুরায় তৈরি কি না।"),
  intro: T(
    "Necesitas el recibo que te dio Correos (Poste) cuando enviaste el kit. Funciona después de la cita de huellas en la Questura.",
    "Ti serve la ricevuta che ti ha dato Poste quando hai spedito il kit. Funziona dopo l'appuntamento per le impronte in Questura.",
    "You need the receipt Poste gave you when you sent the kit. It works after the fingerprint appointment at the Questura.",
    "Il vous faut le reçu que la Poste vous a donné en envoyant le kit. Cela fonctionne après le rendez-vous des empreintes à la Questura.",
    "تحتاج إلى الإيصال الذي أعطاك إياه البريد (Poste) عند إرسال الطرد. يعمل ذلك بعد موعد البصمات في الكويستورا.",
    "Ai nevoie de chitanța primită de la Poștă (Poste) când ai trimis kitul. Funcționează după programarea pentru amprente la Questura.",
    "Të duhet fatura që të dha Posta (Poste) kur dërgove kit-in. Funksionon pas takimit për gjurmët në Kuesturë.",
    "Потрібна квитанція, яку вам дала пошта (Poste), коли ви надсилали набір. Працює після запису на відбитки пальців у Квестурі.",
    "কিট পাঠানোর সময় ডাকঘর (Poste) যে রসিদ দিয়েছিল সেটি লাগবে। কোয়েস্তুরায় আঙুলের ছাপের অ্যাপয়েন্টমেন্টের পরে এটি কাজ করে।",
  ),
  codeLabel: T("Número del recibo", "Numero della ricevuta", "Receipt number", "Numéro du reçu", "رقم الإيصال", "Numărul chitanței", "Numri i faturës", "Номер квитанції", "রসিদের নম্বর"),
  codeHint: T(
    "El «numero di pratica» (10 caracteres) o el número de la «assicurata» (12 números). Se guarda solo en este teléfono.",
    "Il «numero di pratica» (10 caratteri) o il numero dell'«assicurata» (12 cifre). Resta solo su questo telefono.",
    "The «numero di pratica» (10 characters) or the «assicurata» number (12 digits). It stays only on this phone.",
    "Le « numero di pratica » (10 caractères) ou le numéro de l'« assicurata » (12 chiffres). Il reste uniquement sur ce téléphone.",
    "«numero di pratica» (10 خانات) أو رقم «assicurata» (12 رقمًا). يُحفظ على هذا الهاتف فقط.",
    "«Numero di pratica» (10 caractere) sau numărul «assicurata» (12 cifre). Rămâne doar pe acest telefon.",
    "«Numero di pratica» (10 karaktere) ose numri i «assicurata» (12 shifra). Ruhet vetëm në këtë telefon.",
    "«Numero di pratica» (10 символів) або номер «assicurata» (12 цифр). Зберігається лише на цьому телефоні.",
    "«numero di pratica» (১০ অক্ষর) বা «assicurata»-র নম্বর (১২ সংখ্যা)। শুধু এই ফোনেই থাকে।",
  ),
  codeBad: T("Revisa el número: debe tener 10 caracteres o 12 números.", "Controlla il numero: deve avere 10 caratteri o 12 cifre.", "Check the number: it must have 10 characters or 12 digits.", "Vérifiez le numéro : 10 caractères ou 12 chiffres.", "تحقق من الرقم: يجب أن يتكون من 10 خانات أو 12 رقمًا.", "Verifică numărul: trebuie să aibă 10 caractere sau 12 cifre.", "Kontrollo numrin: duhet të ketë 10 karaktere ose 12 shifra.", "Перевірте номер: має бути 10 символів або 12 цифр.", "নম্বরটি দেখুন: ১০ অক্ষর বা ১২ সংখ্যা হতে হবে।"),
  check: T("Copiar el número y consultar", "Copia il numero e verifica", "Copy the number and check", "Copier le numéro et vérifier", "انسخ الرقم وتحقق", "Copiază numărul și verifică", "Kopjo numrin dhe kontrollo", "Скопіювати номер і перевірити", "নম্বর কপি করে দেখুন"),
  checkHint: T(
    "Se abre la web oficial de la Polizia di Stato. Pega el número (ya está copiado) donde lo pida y confirma.",
    "Si apre il sito ufficiale della Polizia di Stato. Incolla il numero (è già copiato) dove richiesto e conferma.",
    "The official Polizia di Stato website opens. Paste the number (already copied) where asked and confirm.",
    "Le site officiel de la Polizia di Stato s'ouvre. Collez le numéro (déjà copié) là où il est demandé et confirmez.",
    "يُفتح الموقع الرسمي للشرطة الإيطالية. الصق الرقم (منسوخ مسبقًا) حيث يُطلب وأكد.",
    "Se deschide site-ul oficial al Poliției de Stat. Lipește numărul (e deja copiat) unde se cere și confirmă.",
    "Hapet faqja zyrtare e Policisë së Shtetit. Ngjit numrin (është kopjuar) ku kërkohet dhe konfirmo.",
    "Відкриється офіційний сайт Поліції. Вставте номер (уже скопійовано) у потрібне поле й підтвердьте.",
    "পুলিশের (Polizia di Stato) সরকারি ওয়েবসাইট খুলবে। যেখানে চাইবে সেখানে নম্বরটি পেস্ট করুন (আগেই কপি করা) এবং নিশ্চিত করুন।",
  ),
  copied: T("Número copiado", "Numero copiato", "Number copied", "Numéro copié", "تم نسخ الرقم", "Număr copiat", "Numri u kopjua", "Номер скопійовано", "নম্বর কপি হয়েছে"),
  whatColor: T("¿Qué color te salió?", "Che colore ti è uscito?", "Which colour did you get?", "Quelle couleur avez-vous obtenue ?", "ما اللون الذي ظهر لك؟", "Ce culoare ți-a ieșit?", "Çfarë ngjyre të doli?", "Який колір ви побачили?", "কোন রং দেখাল?"),
  green: T("Verde", "Verde", "Green", "Vert", "أخضر", "Verde", "E gjelbër", "Зелений", "সবুজ"),
  orange: T("Naranja", "Arancione", "Orange", "Orange", "برتقالي", "Portocaliu", "Portokalli", "Помаранчевий", "কমলা"),
  red: T("Rojo", "Rosso", "Red", "Rouge", "أحمر", "Roșu", "E kuqe", "Червоний", "লাল"),
  greenMeans: T(
    "¡Está listo! Ve a recogerlo a la Questura con el recibo de Correos y tu pasaporte. Mira en la web de tu Questura si piden cita o si te avisan por SMS del día y la hora.",
    "È pronto! Vai a ritirarlo in Questura con la ricevuta di Poste e il passaporto. Controlla sul sito della tua Questura se serve un appuntamento o se ti avvisano via SMS con giorno e ora.",
    "It's ready! Collect it at the Questura with the Poste receipt and your passport. Check your Questura's website for whether you need an appointment or will get an SMS with the day and time.",
    "C'est prêt ! Allez le retirer à la Questura avec le reçu de la Poste et votre passeport. Vérifiez sur le site de votre Questura s'il faut un rendez-vous ou si vous recevrez un SMS avec le jour et l'heure.",
    "جاهز! اذهب لاستلامه من الكويستورا مع إيصال البريد وجواز سفرك. تحقق في موقع الكويستورا إن كان يلزم موعد أو إن كانوا سيرسلون لك رسالة SMS باليوم والساعة.",
    "E gata! Ridică-l de la Questura cu chitanța de la Poștă și pașaportul. Verifică pe site-ul Questurii tale dacă trebuie programare sau dacă primești SMS cu ziua și ora.",
    "Është gati! Shko ta marrësh në Kuesturë me faturën e Postës dhe pasaportën. Shiko në faqen e Kuesturës tënde nëse duhet takim ose nëse të njoftojnë me SMS për ditën dhe orën.",
    "Готово! Заберіть його в Квестурі з квитанцією пошти й паспортом. Перевірте на сайті вашої Квестури, чи потрібен запис або чи надішлють SMS із днем і часом.",
    "তৈরি! ডাকঘরের রসিদ ও পাসপোর্ট নিয়ে কোয়েস্তুরা থেকে তুলে নিন। আপনার কোয়েস্তুরার ওয়েবসাইটে দেখুন অ্যাপয়েন্টমেন্ট লাগবে কি না বা দিন-সময় জানিয়ে SMS পাঠাবে কি না।",
  ),
  orangeMeans: T(
    "Está en trámite. Es normal: vuelve a mirar en una semana. Mientras tanto, el recibo de Correos junto con tu pasaporte te sirve para demostrar que lo pediste a tiempo.",
    "È in lavorazione. È normale: ricontrolla tra una settimana. Nel frattempo la ricevuta di Poste insieme al passaporto dimostra che l'hai chiesto in tempo.",
    "It's being processed. That's normal: check again in a week. Meanwhile, the Poste receipt with your passport shows you applied on time.",
    "Il est en cours de traitement. C'est normal : revérifiez dans une semaine. En attendant, le reçu de la Poste avec votre passeport prouve que vous l'avez demandé à temps.",
    "قيد المعالجة. هذا طبيعي: تحقق مرة أخرى بعد أسبوع. في هذه الأثناء، إيصال البريد مع جواز سفرك يثبت أنك قدمت الطلب في الوقت المحدد.",
    "E în lucru. E normal: verifică din nou peste o săptămână. Între timp, chitanța de la Poștă împreună cu pașaportul arată că l-ai cerut la timp.",
    "Është në proces. Është normale: kontrollo sërish pas një jave. Ndërkohë fatura e Postës bashkë me pasaportën tregon se e kërkove në kohë.",
    "Опрацьовується. Це нормально: перевірте знову через тиждень. Тим часом квитанція пошти разом із паспортом підтверджує, що ви подали заяву вчасно.",
    "প্রক্রিয়াধীন। এটা স্বাভাবিক: এক সপ্তাহ পরে আবার দেখুন। এর মধ্যে ডাকঘরের রসিদ ও পাসপোর্ট দেখায় যে আপনি সময়মতো আবেদন করেছেন।",
  ),
  redMeans: T(
    "No aparece. Primero revisa que el número esté bien escrito y que ya hiciste la cita de huellas. Si sigue en rojo, llama o escribe a tu Questura, o pide ayuda gratis en un Patronato o una asociación.",
    "Non risulta. Prima controlla di aver scritto bene il numero e di aver già fatto l'appuntamento per le impronte. Se resta rosso, chiama o scrivi alla tua Questura, o chiedi aiuto gratis a un Patronato o a un'associazione.",
    "Not found. First check the number is written correctly and that you already had the fingerprint appointment. If it stays red, call or write to your Questura, or ask for free help at a Patronato or an association.",
    "Introuvable. Vérifiez d'abord le numéro et que vous avez déjà fait le rendez-vous des empreintes. Si c'est toujours rouge, appelez ou écrivez à votre Questura, ou demandez de l'aide gratuite à un Patronato ou une association.",
    "غير موجود. تحقق أولًا من كتابة الرقم بشكل صحيح ومن أنك حضرت موعد البصمات. إذا بقي أحمر، اتصل أو اكتب إلى الكويستورا، أو اطلب مساعدة مجانية من Patronato أو جمعية.",
    "Nu apare. Verifică întâi că ai scris corect numărul și că ai făcut deja programarea pentru amprente. Dacă rămâne roșu, sună sau scrie la Questura ta sau cere ajutor gratuit la un Patronato ori o asociație.",
    "Nuk del. Fillimisht kontrollo që numri është shkruar saktë dhe që e ke bërë takimin për gjurmët. Nëse mbetet e kuqe, telefono ose shkruaj Kuesturës, ose kërko ndihmë falas në një Patronato apo shoqatë.",
    "Не знайдено. Спершу перевірте, чи правильно введено номер і чи ви вже здали відбитки. Якщо лишається червоним, зателефонуйте чи напишіть до Квестури або зверніться по безкоштовну допомогу до Patronato чи асоціації.",
    "পাওয়া যায়নি। প্রথমে নম্বর ঠিক লেখা হয়েছে এবং আঙুলের ছাপের অ্যাপয়েন্টমেন্ট হয়ে গেছে কি না দেখুন। লাল থাকলে কোয়েস্তুরায় ফোন বা লিখুন, অথবা Patronato বা কোনো সংগঠনে বিনামূল্যে সাহায্য চান।",
  ),
  last: T("Última consulta", "Ultima verifica", "Last check", "Dernière vérification", "آخر تحقق", "Ultima verificare", "Kontrolli i fundit", "Остання перевірка", "শেষ যাচাই"),
  remind: T("Recuérdame mirarlo en 7 días", "Ricordami di controllare tra 7 giorni", "Remind me to check in 7 days", "Rappelez-moi de vérifier dans 7 jours", "ذكرني بالتحقق بعد 7 أيام", "Amintește-mi să verific peste 7 zile", "Më kujto të kontrolloj pas 7 ditësh", "Нагадати перевірити через 7 днів", "৭ দিন পরে দেখতে মনে করিয়ে দিন"),
  reminded: T("Listo: te lo recordaremos en Mis citas.", "Fatto: te lo ricorderemo in Appuntamenti.", "Done: we'll remind you in My appointments.", "C'est fait : nous vous le rappellerons dans Mes rendez-vous.", "تم: سنذكرك في مواعيدي.", "Gata: îți vom aminti în Programările mele.", "U bë: do të të kujtojmë te Takimet e mia.", "Готово: нагадаємо в розділі «Мої записи».", "হয়েছে: «আমার অ্যাপয়েন্টমেন্ট»-এ মনে করিয়ে দেব।"),
  reminderTitle: T("Mirar el estado del permiso de residencia", "Controllare lo stato del permesso di soggiorno", "Check the residence permit status", "Vérifier l'état du titre de séjour", "التحقق من حالة تصريح الإقامة", "Verifică stadiul permisului de ședere", "Kontrollo gjendjen e lejes së qëndrimit", "Перевірити статус дозволу на проживання", "রেসিডেন্স পারমিটের অবস্থা দেখা"),
  loginForReminder: T("Entra con tu cuenta para guardar recordatorios.", "Accedi con il tuo account per salvare promemoria.", "Sign in to save reminders.", "Connectez-vous pour enregistrer des rappels.", "سجّل الدخول لحفظ التذكيرات.", "Intră în cont pentru a salva mementouri.", "Hyr në llogari për të ruajtur kujtesa.", "Увійдіть, щоб зберігати нагадування.", "রিমাইন্ডার সংরক্ষণ করতে লগ ইন করুন।"),
  poste: T("Seguimiento en Correos (Portale Immigrazione)", "Stato della pratica su Poste (Portale Immigrazione)", "Tracking at Poste (Portale Immigrazione)", "Suivi à la Poste (Portale Immigrazione)", "المتابعة لدى البريد (Portale Immigrazione)", "Urmărire la Poștă (Portale Immigrazione)", "Ndjekja në Postë (Portale Immigrazione)", "Відстеження на пошті (Portale Immigrazione)", "ডাকঘরে ট্র্যাকিং (Portale Immigrazione)"),
  posteBody: T(
    "Antes de la cita en la Questura, puedes ver si Correos ya envió tu kit: entra con el usuario y la contraseña impresos en el recibo (arriba a la derecha).",
    "Prima dell'appuntamento in Questura puoi vedere se Poste ha già inoltrato il kit: entra con utente e password stampati sulla ricevuta (in alto a destra).",
    "Before the Questura appointment you can see whether Poste has forwarded your kit: log in with the username and password printed on the receipt (top right).",
    "Avant le rendez-vous à la Questura, vous pouvez voir si la Poste a transmis votre kit : connectez-vous avec l'identifiant et le mot de passe imprimés sur le reçu (en haut à droite).",
    "قبل موعد الكويستورا يمكنك معرفة إن كان البريد قد أرسل طلبك: ادخل باسم المستخدم وكلمة المرور المطبوعين على الإيصال (أعلى اليمين).",
    "Înainte de programarea la Questura poți vedea dacă Poșta a trimis kitul: intră cu utilizatorul și parola tipărite pe chitanță (sus, dreapta).",
    "Para takimit në Kuesturë mund të shohësh nëse Posta e ka dërguar kit-in: hyr me përdoruesin dhe fjalëkalimin e shtypur në faturë (lart djathtas).",
    "До запису в Квестурі можна перевірити, чи пошта вже передала ваш набір: увійдіть з логіном і паролем, надрукованими на квитанції (угорі праворуч).",
    "কোয়েস্তুরার অ্যাপয়েন্টমেন্টের আগে দেখতে পারেন ডাকঘর আপনার কিট পাঠিয়েছে কি না: রসিদে ছাপা ইউজারনেম ও পাসওয়ার্ড দিয়ে ঢুকুন (উপরে ডানে)।",
  ),
  delay: T(
    "¿Han pasado más de 60 días desde que lo pediste? La ley prevé que la Questura responda en 60 días. Un Patronato, un CAF o una asociación puede ayudarte gratis a pedir información.",
    "Sono passati più di 60 giorni dalla domanda? La legge prevede che la Questura risponda entro 60 giorni. Un Patronato, un CAF o un'associazione può aiutarti gratis a chiedere informazioni.",
    "More than 60 days since you applied? The law says the Questura should answer within 60 days. A Patronato, CAF or association can help you ask for information for free.",
    "Plus de 60 jours depuis votre demande ? La loi prévoit une réponse de la Questura sous 60 jours. Un Patronato, un CAF ou une association peut vous aider gratuitement à demander des informations.",
    "مرّ أكثر من 60 يومًا على طلبك؟ ينص القانون على أن ترد الكويستورا خلال 60 يومًا. يمكن لـPatronato أو CAF أو جمعية مساعدتك مجانًا في طلب المعلومات.",
    "Au trecut peste 60 de zile de la cerere? Legea prevede ca Questura să răspundă în 60 de zile. Un Patronato, un CAF sau o asociație te poate ajuta gratuit să ceri informații.",
    "Kanë kaluar më shumë se 60 ditë nga kërkesa? Ligji parashikon që Kuestura të përgjigjet brenda 60 ditëve. Një Patronato, CAF ose shoqatë mund të të ndihmojë falas të kërkosh informacion.",
    "Минуло понад 60 днів від подання? Закон передбачає відповідь Квестури протягом 60 днів. Patronato, CAF або асоціація безкоштовно допоможуть запитати інформацію.",
    "আবেদনের পর ৬০ দিনের বেশি হয়ে গেছে? আইন অনুযায়ী কোয়েস্তুরা ৬০ দিনের মধ্যে উত্তর দেবে। Patronato, CAF বা কোনো সংগঠন বিনামূল্যে তথ্য চাইতে সাহায্য করতে পারে।",
  ),
  forget: T("Borrar el número de este teléfono", "Cancella il numero da questo telefono", "Delete the number from this phone", "Supprimer le numéro de ce téléphone", "احذف الرقم من هذا الهاتف", "Șterge numărul de pe acest telefon", "Fshi numrin nga ky telefon", "Видалити номер з цього телефону", "এই ফোন থেকে নম্বর মুছুন"),
  source: T("Fuente oficial: Polizia di Stato y Poste Italiane. Comprobado el 26/11/2026.", "Fonte ufficiale: Polizia di Stato e Poste Italiane. Verificato il 26/11/2026.", "Official source: Polizia di Stato and Poste Italiane. Checked 26/11/2026.", "Source officielle : Polizia di Stato et Poste Italiane. Vérifié le 26/11/2026.", "المصدر الرسمي: الشرطة الإيطالية والبريد الإيطالي. تم التحقق في 26/11/2026.", "Sursă oficială: Polizia di Stato și Poste Italiane. Verificat la 26/11/2026.", "Burim zyrtar: Polizia di Stato dhe Poste Italiane. Verifikuar më 26/11/2026.", "Офіційне джерело: Polizia di Stato і Poste Italiane. Перевірено 26.11.2026.", "সরকারি সূত্র: Polizia di Stato ও Poste Italiane। যাচাই: ২৬/১১/২০২৬।"),
};
