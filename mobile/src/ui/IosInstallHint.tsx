import { Download, Settings, X } from "lucide-react";
import { useState } from "react";
import { useT9 } from "~/ui/modules/ModuleBlocks";
import type { T9 } from "~/content/modules/types";
import { isNative } from "~/lib/supabase";

const KEY = "aposto:ios-hint";
const I: Record<string, T9> = {
  title: { es: "Instala A Posto en tu iPhone", it: "Installa A Posto sul tuo iPhone", en: "Install A Posto on your iPhone", fr: "Installez A Posto sur votre iPhone", ar: "ثبّت A Posto على iPhone", ro: "Instalează A Posto pe iPhone", sq: "Instaloni A Posto në iPhone", uk: "Встановіть A Posto на iPhone", bn: "আপনার iPhone-এ A Posto ইনস্টল করুন" },
  cta: { es: "Instalar A Posto", it: "Installa A Posto", en: "Install A Posto", fr: "Installer A Posto", ar: "تثبيت A Posto", ro: "Instalează A Posto", sq: "Instalo A Posto", uk: "Встановити A Posto", bn: "A Posto ইনস্টল করুন" },
  step1: { es: "Pulsa «Instalar A Posto» y luego «Permitir».", it: "Tocca «Installa A Posto» e poi «Consenti».", en: "Tap “Install A Posto”, then “Allow”.", fr: "Touchez « Installer A Posto », puis « Autoriser ».", ar: "اضغط «تثبيت A Posto» ثم «سماح».", ro: "Apasă „Instalează A Posto”, apoi „Permite”.", sq: "Shtypni «Instalo A Posto» dhe pastaj «Lejo».", uk: "Натисніть «Встановити A Posto», потім «Дозволити».", bn: "«A Posto ইনস্টল করুন» চাপুন, তারপর «অনুমতি দিন»।" },
  step2: { es: "Abre Ajustes → «Perfil descargado» → «Instalar».", it: "Apri Impostazioni → «Profilo scaricato» → «Installa».", en: "Open Settings → “Profile Downloaded” → “Install”.", fr: "Ouvrez Réglages → « Profil téléchargé » → « Installer ».", ar: "افتح الإعدادات ← «تم تنزيل ملف التعريف» ← «تثبيت».", ro: "Deschide Setări → „Profil descărcat” → „Instalează”.", sq: "Hapni Cilësimet → «Profili u shkarkua» → «Instalo».", uk: "Відкрийте Параметри → «Профіль завантажено» → «Встановити».", bn: "সেটিংস খুলুন → «প্রোফাইল ডাউনলোড হয়েছে» → «ইনস্টল»।" },
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

/** Aviso para instalar A Posto en el iPhone con el instalador (mientras no esté en el App Store). */
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
      {/* Instalador para iPhone (solo un acceso directo con el icono): vive en la web. */}
      <a href="https://www.apostoapp.app/a-posto.mobileconfig" className="btn" data-testid="ios-install-profile">
        <Download size={18} aria-hidden /> {x(I.cta)}
      </a>
      <p className="flex items-start gap-2 text-[15px]">
        <Download size={20} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(I.step1)}
      </p>
      <p className="flex items-start gap-2 text-[15px]">
        <Settings size={20} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(I.step2)}
      </p>
      <p className="hint">{x(I.after)}</p>
    </section>
  );
}
