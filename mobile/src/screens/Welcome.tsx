import { CalendarCheck, FileCheck2, HeartHandshake } from "lucide-react";
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
