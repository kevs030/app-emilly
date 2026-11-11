import Link from "next/link";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { supabaseConfigured } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { NotConfigured } from "@/components/NotConfigured";

export default async function LoginPage() {
  const lang = await getLang();
  return (
    <div className="space-y-4">
      <h1 className="text-center text-2xl font-bold">{t("login", lang)}</h1>
      {supabaseConfigured() ? <LoginForm lang={lang} /> : <NotConfigured />}
      <p className="text-center text-xs text-muted">
        {lang === "en" ? "By signing in you accept our " : "Al entrar aceptas nuestra "}
        <Link className="underline" href="/privacidad">
          {lang === "en" ? "privacy policy" : "política de privacidad"}
        </Link>
        .
      </p>
    </div>
  );
}
