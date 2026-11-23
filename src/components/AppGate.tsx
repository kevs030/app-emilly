import Link from "next/link";
import { Bell, CheckSquare, Download, FileText, Lock, PenLine, Smartphone } from "lucide-react";
import type { Lang } from "@/content/types";
import { tr } from "@/lib/i18n";

const L = {
  title: { es: "Continúa este trámite en la app", en: "Continue this procedure in the app", it: "Continua questa pratica nell'app" },
  more: { es: "pasos más te esperan en la app", en: "more steps are waiting in the app", it: "passi in più ti aspettano nell'app" },
  a: { es: "Todos los pasos, con casillas para marcar tu avance", en: "Every step, with boxes to tick your progress", it: "Tutti i passi, con caselle per segnare i progressi" },
  b: { es: "Formularios oficiales y qué escribir en cada casilla", en: "Official forms and what to write in each box", it: "Moduli ufficiali e cosa scrivere in ogni casella" },
  c: { es: "Recordatorios de citas y plazos", en: "Reminders for appointments and deadlines", it: "Promemoria di appuntamenti e scadenze" },
  d: { es: "Tus documentos y PDFs guardados, también sin internet", en: "Your documents and PDFs saved, even offline", it: "Documenti e PDF salvati, anche senza internet" },
  android: { es: "Descargar para Android", en: "Download for Android", it: "Scarica per Android" },
  iphone: { es: "Abrir en iPhone", en: "Open on iPhone", it: "Apri su iPhone" },
  free: { es: "Gratis · En 9 idiomas · Tus documentos solo en tu teléfono", en: "Free · In 9 languages · Your documents only on your phone", it: "Gratis · In 9 lingue · I tuoi documenti solo sul telefono" },
};

/** Tarjeta que «desbloquea» en la app lo que la web solo resume. `remaining` = pasos que no se muestran aquí. */
export function AppGate({ lang, remaining, id }: { lang: Lang; remaining?: number; id?: string }) {
  return (
    <section id={id} className="app-card relative overflow-hidden rounded-[20px] p-5 text-white sm:p-6" data-testid="app-gate">
      <p className="relative z-10 flex items-center gap-2 text-lg font-bold">
        <Lock size={20} aria-hidden /> {tr(L.title, lang)}
      </p>
      {remaining ? (
        <p className="relative z-10 mt-1 text-sm text-white/90">
          <strong className="text-base text-white">+{remaining}</strong> {tr(L.more, lang)}
        </p>
      ) : null}
      <ul className="relative z-10 mt-3 grid gap-1.5 text-sm text-white/95 sm:grid-cols-2">
        <li className="flex items-center gap-2"><CheckSquare size={16} className="shrink-0" aria-hidden /> {tr(L.a, lang)}</li>
        <li className="flex items-center gap-2"><PenLine size={16} className="shrink-0" aria-hidden /> {tr(L.b, lang)}</li>
        <li className="flex items-center gap-2"><Bell size={16} className="shrink-0" aria-hidden /> {tr(L.c, lang)}</li>
        <li className="flex items-center gap-2"><FileText size={16} className="shrink-0" aria-hidden /> {tr(L.d, lang)}</li>
      </ul>
      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        <Link href="/descargar#apk" className="btn !w-auto !border-white !bg-white !text-[var(--ap-sage-dark)]">
          <Download size={18} aria-hidden /> {tr(L.android, lang)}
        </Link>
        <a href="/app" className="btn btn-hero-outline !w-auto !border-white !bg-transparent !text-white">
          <Smartphone size={18} aria-hidden /> {tr(L.iphone, lang)}
        </a>
      </div>
      <p className="relative z-10 mt-3 text-xs text-white/80">{tr(L.free, lang)}</p>
    </section>
  );
}
