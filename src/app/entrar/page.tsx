import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { supabaseConfigured } from "@/lib/supabase/server";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { LoginForm } from "./LoginForm";
import { NotConfigured } from "@/components/NotConfigured";

export const metadata: Metadata = { title: "Entrar" };

/** Pregunta a Supabase si el acceso por SMS está activado (se consulta como mucho cada 5 minutos). */
async function phoneLoginEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_PUBLIC_KEY }, next: { revalidate: 300 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return false;
    const json = (await res.json()) as { external?: { phone?: boolean } };
    return json.external?.phone === true;
  } catch {
    return false;
  }
}

const SAFE = {
  es: "Sin contraseñas. Solo usamos tu correo o teléfono para que puedas entrar: no te enviaremos publicidad.",
  en: "No passwords. We only use your email or phone so you can sign in: we won't send you marketing.",
  it: "Niente password. Usiamo email o telefono solo per farti accedere.",
};

export default async function LoginPage(props: PageProps<"/entrar">) {
  const lang = await getLang();
  const { error } = await props.searchParams;
  const configured = supabaseConfigured();
  const phoneEnabled = configured ? await phoneLoginEnabled() : false;
  return (
    <div className="space-y-4 py-4">
      <h1 className="text-center text-3xl font-bold tracking-tight">{t("login", lang)}</h1>
      {configured ? <LoginForm lang={lang} linkError={error === "link"} phoneEnabled={phoneEnabled} /> : <NotConfigured />}
      <p className="mx-auto flex max-w-md items-start gap-2 text-xs text-muted">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
        <span>
          {SAFE[lang]}{" "}
          <Link className="underline" href="/privacidad">
            {lang === "en" ? "Privacy policy" : lang === "it" ? "Privacy" : "Política de privacidad"}
          </Link>
        </span>
      </p>
    </div>
  );
}
