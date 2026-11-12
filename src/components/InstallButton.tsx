import Link from "next/link";
import { Download } from "lucide-react";

const LABEL = { es: "Descargar la app", en: "Get the app", it: "Scarica l'app" };

/** Lleva a la página oficial de descarga (Google Play, App Store y APK). */
export function InstallButton({ lang, className = "btn" }: { lang: "es" | "en" | "it"; className?: string }) {
  return (
    <Link href="/descargar" className={className}>
      <Download size={18} aria-hidden /> {LABEL[lang]}
    </Link>
  );
}
