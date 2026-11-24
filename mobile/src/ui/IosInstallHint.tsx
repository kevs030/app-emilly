import { Share, SquarePlus, ToggleRight, X } from "lucide-react";
import { useState } from "react";
import { useT9 } from "~/ui/modules/ModuleBlocks";
import type { T9 } from "~/content/modules/types";
import { isNative } from "~/lib/supabase";

const KEY = "aposto:ios-hint";
const I: Record<string, T9> = {
  title: { es: "Instala A Posto en tu iPhone", it: "Installa A Posto sul tuo iPhone", en: "Install A Posto on your iPhone", fr: "Installez A Posto sur votre iPhone", ar: "ثبّت A Posto على iPhone", ro: "Instalează A Posto pe iPhone", sq: "Instaloni A Posto në iPhone", uk: "Встановіть A Posto на iPhone", bn: "আপনার iPhone-এ A Posto ইনস্টল করুন" },
  step1: { es: "Pulsa Compartir en Safari (el cuadrado con la flecha hacia arriba).", it: "Tocca Condividi in Safari (il quadrato con la freccia in su).", en: "Tap Share in Safari (the square with the up arrow).", fr: "Touchez Partager dans Safari (le carré avec la flèche vers le haut).", ar: "اضغط مشاركة في Safari (المربع مع السهم للأعلى).", ro: "Apasă Partajare în Safari (pătratul cu săgeata în sus).", sq: "Shtypni Ndaj në Safari (katrori me shigjetë lart).", uk: "Натисніть «Поділитися» в Safari (квадрат зі стрілкою вгору).", bn: "Safari-তে শেয়ার চাপুন (উপরের দিকে তীরসহ বর্গ)।" },
  step2: { es: "Elige «Añadir a pantalla de inicio» (si no la ves, desliza hacia arriba o pulsa «Más»).", it: "Scegli «Aggiungi alla schermata Home» (se non la vedi, scorri in su o tocca «Altro»).", en: "Choose “Add to Home Screen” (if you don't see it, scroll up or tap “More”).", fr: "Choisissez « Sur l'écran d'accueil » (sinon, faites défiler ou touchez « Plus »).", ar: "اختر «إضافة إلى الشاشة الرئيسية» (إن لم تجده، مرّر للأعلى أو اضغط «المزيد»).", ro: "Alege „Adaugă pe ecranul principal” (dacă nu apare, derulează sau apasă „Mai multe”).", sq: "Zgjidhni «Shto në ekranin bazë» (nëse nuk e shihni, rrëshqitni ose shtypni «Më shumë»).", uk: "Виберіть «На початковий екран» (якщо не видно, прокрутіть або натисніть «Більше»).", bn: "«হোম স্ক্রিনে যোগ করুন» বেছে নিন (না দেখলে উপরে স্ক্রল করুন বা «আরও» চাপুন)।" },
  step3: { es: "Si aparece «Abrir como app web», déjalo activado y pulsa «Añadir».", it: "Se compare «Apri come app web», lascialo attivo e tocca «Aggiungi».", en: "If “Open as Web App” appears, leave it on and tap “Add”.", fr: "Si « Ouvrir comme app web » apparaît, laissez-le activé et touchez « Ajouter ».", ar: "إذا ظهر «فتح كتطبيق ويب» فاتركه مفعّلًا واضغط «إضافة».", ro: "Dacă apare „Deschide ca aplicație web”, lasă-l activat și apasă „Adaugă”.", sq: "Nëse shfaqet «Hap si aplikacion uebi», lëreni aktiv dhe shtypni «Shto».", uk: "Якщо з'явиться «Відкривати як вебпрограму», залиште увімкненим і натисніть «Додати».", bn: "«ওয়েব অ্যাপ হিসেবে খুলুন» দেখালে চালু রাখুন এবং «যোগ করুন» চাপুন।" },
  inApp: { es: "Estás dentro de otra app o navegador. Para instalar A Posto, abre esta página en Safari: menú (⋯ o ⋮) → «Abrir en Safari».", it: "Sei dentro un'altra app o browser. Per installare A Posto apri questa pagina in Safari: menu (⋯ o ⋮) → «Apri in Safari».", en: "You are inside another app or browser. To install A Posto, open this page in Safari: menu (⋯ or ⋮) → “Open in Safari”.", fr: "Vous êtes dans une autre app ou un autre navigateur. Pour installer A Posto, ouvrez cette page dans Safari : menu (⋯ ou ⋮) → « Ouvrir dans Safari ».", ar: "أنت داخل تطبيق أو متصفح آخر. لتثبيت A Posto افتح هذه الصفحة في Safari: القائمة (⋯ أو ⋮) ← «فتح في Safari».", ro: "Ești în altă aplicație sau alt browser. Pentru a instala A Posto, deschide pagina în Safari: meniu (⋯ sau ⋮) → „Deschide în Safari”.", sq: "Jeni brenda një aplikacioni ose shfletuesi tjetër. Për të instaluar A Posto hapeni këtë faqe në Safari: menuja (⋯ ose ⋮) → «Hap në Safari».", uk: "Ви в іншому застосунку чи браузері. Щоб встановити A Posto, відкрийте сторінку в Safari: меню (⋯ або ⋮) → «Відкрити в Safari».", bn: "আপনি অন্য অ্যাপ বা ব্রাউজারে আছেন। A Posto ইনস্টল করতে পাতাটি Safari-তে খুলুন: মেনু (⋯ বা ⋮) → «Safari-তে খুলুন»।" },
  after: { es: "Se abrirá como una app, a pantalla completa, con tus datos guardados en el teléfono.", it: "Si aprirà come un'app, a schermo intero, con i tuoi dati salvati sul telefono.", en: "It will open like an app, full screen, with your data saved on the phone.", fr: "Elle s'ouvrira comme une app, en plein écran, avec vos données sur le téléphone.", ar: "ستفتح كتطبيق بملء الشاشة، وبياناتك محفوظة على الهاتف.", ro: "Se va deschide ca o aplicație, pe tot ecranul, cu datele salvate pe telefon.", sq: "Do të hapet si aplikacion, në ekran të plotë, me të dhënat në telefon.", uk: "Вона відкриватиметься як застосунок, на весь екран, із даними на телефоні.", bn: "এটি অ্যাপের মতো পূর্ণ স্ক্রিনে খুলবে, আপনার তথ্য ফোনেই থাকবে।" },
  close: { es: "Cerrar", it: "Chiudi", en: "Close", fr: "Fermer", ar: "إغلاق", ro: "Închide", sq: "Mbyll", uk: "Закрити", bn: "বন্ধ করুন" },
};

/** Navegadores y apps que no pueden «Añadir a pantalla de inicio» como Safari. */
const IN_APP = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|Instagram|FBAN|FBAV|FB_IAB|Line\/|GSA\/|Snapchat|musical_ly|BytedanceWebview|Twitter|LinkedInApp|Telegram/;

/** iPhone o iPad en el navegador (no instalada todavía): "safari", "inapp" o null. */
export function iosWhere(ua: string, touchPoints: number, standalone: boolean, native = isNative): "safari" | "inapp" | null {
  if (native) return null;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1);
  if (!ios || standalone) return null;
  return IN_APP.test(ua) ? "inapp" : "safari";
}
function currentWhere() {
  if (typeof navigator === "undefined") return null;
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia?.("(display-mode: standalone)").matches;
  return iosWhere(navigator.userAgent, navigator.maxTouchPoints || 0, standalone);
}

/** Aviso para instalar A Posto en el iPhone como app web (Safari → Compartir → Añadir a pantalla de inicio). */
export function IosInstallHint() {
  const { x } = useT9();
  const [where] = useState(currentWhere);
  const [show, setShow] = useState(() => {
    try {
      return where !== null && localStorage.getItem(KEY) !== "closed";
    } catch {
      return where !== null;
    }
  });
  if (!show || !where) return null;
  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "closed");
    } catch {
      /* sin almacenamiento */
    }
  };
  return (
    <section className="card relative space-y-2 border-gold/60 bg-gold-soft" aria-labelledby="ios-install" data-testid="ios-install" data-where={where}>
      <button type="button" onClick={close} aria-label={x(I.close)} className="absolute end-1 top-1 flex h-11 w-11 items-center justify-center text-ink-soft">
        <X size={20} aria-hidden />
      </button>
      <h2 id="ios-install" className="pe-10 font-bold">
        {x(I.title)}
      </h2>
      {where === "inapp" ? (
        <p className="text-[15px] font-medium" data-testid="ios-inapp">
          {x(I.inApp)}
        </p>
      ) : (
        <>
          <p className="flex items-start gap-2 text-[15px]">
            <Share size={20} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(I.step1)}
          </p>
          <p className="flex items-start gap-2 text-[15px]">
            <SquarePlus size={20} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(I.step2)}
          </p>
          <p className="flex items-start gap-2 text-[15px]">
            <ToggleRight size={20} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(I.step3)}
          </p>
          <p className="hint">{x(I.after)}</p>
        </>
      )}
    </section>
  );
}
