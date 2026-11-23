import { Share, SquarePlus, X } from "lucide-react";
import { useState } from "react";
import { useT9 } from "~/ui/modules/ModuleBlocks";
import type { T9 } from "~/content/modules/types";
import { isNative } from "~/lib/supabase";

const KEY = "aposto:ios-hint";
const I: Record<string, T9> = {
  title: { es: "Instala A Posto en tu iPhone", it: "Installa A Posto sul tuo iPhone", en: "Install A Posto on your iPhone", fr: "Installez A Posto sur votre iPhone", ar: "ثبّت A Posto على iPhone", ro: "Instalează A Posto pe iPhone", sq: "Instaloni A Posto në iPhone", uk: "Встановіть A Posto на iPhone", bn: "আপনার iPhone-এ A Posto ইনস্টল করুন" },
  step1: { es: "Pulsa el botón Compartir de Safari (el cuadrado con la flecha hacia arriba).", it: "Tocca il pulsante Condividi di Safari (il quadrato con la freccia in su).", en: "Tap Safari's Share button (the square with the up arrow).", fr: "Touchez le bouton Partager de Safari (le carré avec la flèche vers le haut).", ar: "اضغط زر المشاركة في Safari (المربع مع السهم للأعلى).", ro: "Apasă butonul Partajare din Safari (pătratul cu săgeata în sus).", sq: "Shtypni butonin Ndaj të Safari (katrori me shigjetë lart).", uk: "Натисніть кнопку «Поділитися» в Safari (квадрат зі стрілкою вгору).", bn: "Safari-র শেয়ার বোতামে চাপুন (উপরের দিকে তীরসহ বর্গ)।" },
  step2: { es: "Elige «Añadir a pantalla de inicio» y pulsa «Añadir».", it: "Scegli «Aggiungi alla schermata Home» e tocca «Aggiungi».", en: "Choose “Add to Home Screen” and tap “Add”.", fr: "Choisissez « Sur l'écran d'accueil » et touchez « Ajouter ».", ar: "اختر «إضافة إلى الشاشة الرئيسية» ثم اضغط «إضافة».", ro: "Alege „Adaugă pe ecranul principal” și apasă „Adaugă”.", sq: "Zgjidhni «Shto në ekranin bazë» dhe shtypni «Shto».", uk: "Виберіть «На початковий екран» і натисніть «Додати».", bn: "«হোম স্ক্রিনে যোগ করুন» বেছে «যোগ করুন» চাপুন।" },
  after: { es: "Se abrirá como una app, a pantalla completa, con tus datos guardados en el teléfono.", it: "Si aprirà come un'app, a schermo intero, con i tuoi dati salvati sul telefono.", en: "It will open like an app, full screen, with your data saved on the phone.", fr: "Elle s'ouvrira comme une app, en plein écran, avec vos données sur le téléphone.", ar: "ستفتح كتطبيق بملء الشاشة، وبياناتك محفوظة على الهاتف.", ro: "Se va deschide ca o aplicație, pe tot ecranul, cu datele salvate pe telefon.", sq: "Do të hapet si aplikacion, në ekran të plotë, me të dhënat në telefon.", uk: "Вона відкриватиметься як застосунок, на весь екран, із даними на телефоні.", bn: "এটি অ্যাপের মতো পূর্ণ স্ক্রিনে খুলবে, আপনার তথ্য ফোনেই থাকবে।" },
  close: { es: "Cerrar", it: "Chiudi", en: "Close", fr: "Fermer", ar: "إغلاق", ro: "Închide", sq: "Mbyll", uk: "Закрити", bn: "বন্ধ করুন" },
};

/** iPhone o iPad en el navegador (no instalada todavía). */
function iosBrowser(): boolean {
  if (isNative || typeof navigator === "undefined") return false;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia?.("(display-mode: standalone)").matches;
  return ios && !standalone;
}

/** Aviso para instalar la app desde Safari en el iPhone (mientras no esté en el App Store). */
export function IosInstallHint() {
  const { x } = useT9();
  const [show, setShow] = useState(() => {
    try {
      return iosBrowser() && localStorage.getItem(KEY) !== "closed";
    } catch {
      return iosBrowser();
    }
  });
  if (!show) return null;
  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "closed");
    } catch {
      /* sin almacenamiento */
    }
  };
  return (
    <section className="card relative space-y-2 border-gold/60 bg-gold-soft" aria-labelledby="ios-install" data-testid="ios-install">
      <button type="button" onClick={close} aria-label={x(I.close)} className="absolute end-1 top-1 flex h-11 w-11 items-center justify-center text-ink-soft">
        <X size={20} aria-hidden />
      </button>
      <h2 id="ios-install" className="pe-10 font-bold">
        {x(I.title)}
      </h2>
      <p className="flex items-start gap-2 text-[15px]">
        <Share size={20} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(I.step1)}
      </p>
      <p className="flex items-start gap-2 text-[15px]">
        <SquarePlus size={20} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(I.step2)}
      </p>
      <p className="hint">{x(I.after)}</p>
    </section>
  );
}
