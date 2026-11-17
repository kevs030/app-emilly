import { BookOpen, Languages, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "~/lib/lang";
import { openedFromEmailLink } from "~/lib/supabase";
import { UI_LANGS, type UiLang } from "~/lib/strings";
import { Illustration } from "~/ui/Illustration";
import { Logo } from "~/ui/kit";
import { TutorialVideo } from "~/ui/TutorialVideo";
import { AuthForm, type AuthMode } from "./Auth";

/**
 * Portada: lo primero que ve quien abre la app sin haber entrado.
 * Arriba la bienvenida; debajo, la tarjeta para entrar o crear la cuenta (correo o celular).
 * Nadie llega al resto de la app sin una cuenta verificada.
 */
export function Welcome() {
  const { t, lang, setLang } = useLang();
  const [mode, setMode] = useState<AuthMode>(openedFromEmailLink ? "signin" : "signup");
  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-md flex-col px-5">
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Logo size={32} /> A Posto
        </span>
        <select aria-label={t("language")} className="min-h-11 rounded-xl border border-line bg-white px-3 text-[15px] font-medium" value={lang} onChange={(e) => setLang(e.target.value as UiLang)}>
          {UI_LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <header className="rise pt-2 text-center">
        <Illustration name="bienvenida" alt={t("peopleAlt")} className="mx-auto max-w-[340px]" eager />
        <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight">{t("welcomeTitle")}</h1>
        <p className="mt-2 text-lg text-ink-soft">{t("tagline")}</p>
      </header>

      <section className="card mt-6 space-y-5" aria-label={mode === "signup" ? t("signUp") : t("signIn")}>
        <div className="segmented" role="group">
          {(
            [
              ["signup", UserPlus, "signUp"],
              ["signin", LogIn, "signIn"],
            ] as const
          ).map(([m, Icon, label]) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
              <Icon size={18} aria-hidden /> {t(label)}
            </button>
          ))}
        </div>
        {openedFromEmailLink && (
          <p role="status" className="rounded-xl bg-beige px-4 py-3 font-medium">
            {t("emailLinkSignIn")}
          </p>
        )}
        <AuthForm mode={mode} setMode={setMode} hideSwitch />
      </section>

      <p className="hint mt-3 text-center">{t("free")}</p>
      <Link to="/guides" className="btn btn-secondary mt-4">
        <BookOpen size={20} aria-hidden /> {t("browseNoAccount")}
      </Link>

      <TutorialVideo className="mt-6" />

      <section className="mt-6" aria-labelledby="langs-title">
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

      <div className="py-4">
        <Link to="/privacy" className="flex min-h-11 items-center justify-center text-[14px] font-medium text-brown underline">
          {t("privacyPolicy")}
        </Link>
      </div>
    </div>
  );
}
