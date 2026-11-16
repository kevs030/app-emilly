import { CalendarCheck, FileCheck2, HeartHandshake, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "~/lib/lang";
import { UI_LANGS, type UiLang } from "~/lib/strings";
import { Logo } from "~/ui/kit";

export function Welcome() {
  const { t, lang, setLang } = useLang();
  const points = [
    { icon: FileCheck2, key: "pt1" },
    { icon: CalendarCheck, key: "pt2" },
    { icon: HeartHandshake, key: "pt3" },
  ] as const;
  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-md flex-col px-6">
      <div className="flex justify-end pt-1">
        <select aria-label={t("language")} className="rounded-xl bg-beige px-3 py-2 text-[15px] font-medium" value={lang} onChange={(e) => setLang(e.target.value as UiLang)}>
          {UI_LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
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
            <li key={p.key} className="flex items-center gap-3">
              <span className="icon-tile">
                <p.icon size={22} aria-hidden />
              </span>
              <span className="font-medium">{t(p.key)}</span>
            </li>
          ))}
        </ul>
        <section className="mt-8" aria-labelledby="langs-title">
          <h2 id="langs-title" className="flex items-center gap-2 text-[15px] font-semibold text-ink-soft">
            <Languages size={18} aria-hidden /> {t("langsAvailable")}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {UI_LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  lang={l.code}
                  aria-pressed={lang === l.code}
                  onClick={() => setLang(l.code)}
                  className={`min-h-11 rounded-full px-4 text-[15px] font-medium ${lang === l.code ? "bg-terracotta-deep text-white" : "bg-beige"}`}
                >
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="space-y-3 pb-4">
        <Link to="/auth?mode=signup" className="btn">
          {t("start")}
        </Link>
        <Link to="/auth?mode=signin" className="btn btn-secondary">
          {t("haveAccount")}
        </Link>
        <p className="hint text-center">{t("free")}</p>
        <Link to="/privacy" className="flex min-h-11 items-center justify-center text-[14px] font-medium text-brown underline">
          {t("privacyPolicy")}
        </Link>
      </div>
    </div>
  );
}
