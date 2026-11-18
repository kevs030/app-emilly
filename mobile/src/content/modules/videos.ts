import type { T9 } from "./types";

/**
 * Vídeos paso a paso por sección, uno por idioma, SIN subtítulos (la narración ya está en ese idioma).
 * Archivos en la web: /videos/<idioma>/<sección>.mp4 (+ .jpg de portada).
 * /videos/manifest.json dice cuáles existen; si falta, la app muestra un aviso y los pasos escritos.
 * Guiones para grabarlos o generarlos con IA: /scripts-videos/<idioma>/<sección>.md (npm run gen:video-scripts).
 */
export type VideoSection = "tessera-sanitaria" | "codice-fiscale" | "articolo-31";

export const VIDEO_FOR_GUIDE: Record<string, VideoSection> = {
  "sanidad-tessera-sanitaria": "tessera-sanitaria",
  "codice-fiscale": "codice-fiscale",
  "articolo-31": "articolo-31",
};

export const V = {
  title: { es: "Vídeo paso a paso", it: "Video passo dopo passo", en: "Step-by-step video", fr: "Vidéo pas à pas", ar: "فيديو خطوة بخطوة", ro: "Video pas cu pas", sq: "Video hap pas hapi", uk: "Відео крок за кроком", bn: "ধাপে ধাপে ভিডিও" },
  soon: {
    es: "El vídeo en tu idioma está en preparación. Mientras tanto, sigue los pasos escritos de esta página.",
    it: "Il video nella tua lingua è in preparazione. Nel frattempo segui i passi scritti in questa pagina.",
    en: "The video in your language is being prepared. Meanwhile, follow the written steps on this page.",
    fr: "La vidéo dans votre langue est en préparation. En attendant, suivez les étapes écrites de cette page.",
    ar: "الفيديو بلغتك قيد التحضير. في الأثناء اتبع الخطوات المكتوبة في هذه الصفحة.",
    ro: "Videoclipul în limba ta este în pregătire. Între timp, urmează pașii scriși din această pagină.",
    sq: "Videoja në gjuhën tuaj është në përgatitje. Ndërkohë ndiqni hapat e shkruar në këtë faqe.",
    uk: "Відео вашою мовою готується. Тим часом виконуйте кроки, описані на цій сторінці.",
    bn: "আপনার ভাষার ভিডিওটি তৈরি হচ্ছে। ততক্ষণ এই পাতার লেখা ধাপগুলো অনুসরণ করুন।",
  },
} satisfies Record<string, T9>;

/** Títulos de cada vídeo y cierre común (también los usan los guiones de /scripts-videos). */
export const SECTION_TITLE: Record<VideoSection, T9> = {
  "tessera-sanitaria": { es: "Cómo conseguir la tarjeta sanitaria", it: "Come ottenere la tessera sanitaria", en: "How to get your health card", fr: "Comment obtenir la carte sanitaire", ar: "كيف تحصل على البطاقة الصحية", ro: "Cum obții cardul de sănătate", sq: "Si të merrni kartën shëndetësore", uk: "Як отримати медичну картку", bn: "কীভাবে স্বাস্থ্য কার্ড পাবেন" },
  "codice-fiscale": { es: "Cómo pedir el codice fiscale", it: "Come chiedere il codice fiscale", en: "How to get your codice fiscale", fr: "Comment demander le codice fiscale", ar: "كيف تطلب الرقم الضريبي", ro: "Cum ceri codice fiscale", sq: "Si të kërkoni codice fiscale", uk: "Як отримати codice fiscale", bn: "কীভাবে codice fiscale পাবেন" },
  "articolo-31": { es: "El artículo 31: quedarte por el bien de tu hijo", it: "L'articolo 31: restare per il bene di tuo figlio", en: "Article 31: staying for your child's sake", fr: "L'article 31 : rester pour le bien de votre enfant", ar: "المادة 31: البقاء من أجل مصلحة طفلك", ro: "Articolul 31: să rămâi pentru binele copilului", sq: "Neni 31: të qëndroni për të mirën e fëmijës", uk: "Стаття 31: залишитися заради дитини", bn: "৩১ ধারা: সন্তানের কল্যাণে থেকে যাওয়া" },
};
export const OUTRO: T9 = {
  es: "Encontrarás todos los enlaces, los formularios y los resúmenes en PDF en la app A Posto. Mucha suerte.",
  it: "Trovi tutti i link, i moduli e i riepiloghi in PDF nell'app A Posto. In bocca al lupo.",
  en: "You will find all the links, forms and PDF summaries in the A Posto app. Good luck.",
  fr: "Vous trouverez tous les liens, formulaires et résumés PDF dans l'application A Posto. Bonne chance.",
  ar: "ستجد كل الروابط والاستمارات والملخصات بصيغة PDF في تطبيق A Posto. بالتوفيق.",
  ro: "Găsești toate linkurile, formularele și rezumatele PDF în aplicația A Posto. Mult succes.",
  sq: "Të gjitha lidhjet, formularët dhe përmbledhjet në PDF i gjeni në aplikacionin A Posto. Suksese.",
  uk: "Усі посилання, бланки й підсумки в PDF ви знайдете в застосунку A Posto. Успіхів.",
  bn: "সব লিংক, ফর্ম ও PDF সারাংশ A Posto অ্যাপে পাবেন। শুভকামনা।",
};
