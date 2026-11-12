import { CalendarCheck, FileCheck2, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import { LANG_LABEL, LANGS } from "@/lib/i18n";
import { useLang } from "~/lib/lang";
import { Logo } from "~/ui/kit";

export function Welcome() {
  const { t, lang, setLang } = useLang();
  const points = [
    { icon: FileCheck2, es: "Guías con fuentes oficiales", it: "Guide con fonti ufficiali", en: "Guides with official sources" },
    { icon: CalendarCheck, es: "Tu progreso, siempre guardado", it: "I tuoi progressi, sempre salvati", en: "Your progress, always saved" },
    { icon: HeartHandshake, es: "Gratis y en tu idioma", it: "Gratis e nella tua lingua", en: "Free and in your language" },
  ];
  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-md flex-col px-6">
      <div className="flex justify-end pt-1">
        <select aria-label={t("language")} className="rounded-xl bg-beige px-3 py-2 text-[15px] font-medium" value={lang} onChange={(e) => setLang(e.target.value as typeof lang)}>
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {LANG_LABEL[l]}
            </option>
          ))}
        </select>
      </div>
      <div className="rise flex flex-1 flex-col justify-center py-8">
        <Logo size={72} />
        <h1 className="mt-6 text-[34px] font-bold leading-tight tracking-tight">{t("tagline")}</h1>
        <p className="mt-3 text-lg text-ink-soft">{t("welcomeBody")}</p>
        <ul className="mt-8 space-y-3">
          {points.map((p) => (
            <li key={p.es} className="flex items-center gap-3">
              <span className="icon-tile">
                <p.icon size={22} aria-hidden />
              </span>
              <span className="font-medium">{p[lang] ?? p.es}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3 pb-4">
        <Link to="/auth?mode=signup" className="btn">
          {t("start")}
        </Link>
        <Link to="/auth?mode=signin" className="btn btn-secondary">
          {t("haveAccount")}
        </Link>
        <p className="hint text-center">{t("free")}</p>
      </div>
    </div>
  );
}
