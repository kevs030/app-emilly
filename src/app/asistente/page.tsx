import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { Chat } from "@/components/Chat";

export const metadata: Metadata = { title: "Asistente" };

const GATE = {
  es: { body: "El asistente responde tus dudas con la información verificada de A posto y recuerda tus trámites. Crea tu cuenta gratis y recibe 3 preguntas de regalo.", cta: "Crear cuenta o entrar" },
  en: { body: "The assistant answers your questions using A posto's verified information and remembers your procedures. Create your free account and get 3 free questions.", cta: "Create account or sign in" },
  it: { body: "L'assistente risponde alle tue domande con le informazioni verificate di A posto e ricorda le tue pratiche. Crea il tuo account gratis e ricevi 3 domande in regalo.", cta: "Crea account o accedi" },
};

export default async function AssistantPage() {
  const lang = await getLang();
  let signedIn = false;
  let credits: number | null = null;
  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      signedIn = true;
      const wallet = await supabase.from("ai_wallets").select("credits").eq("user_id", data.user.id).maybeSingle();
      credits = wallet.data?.credits ?? null;
    }
  }
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">{t("navAssistant", lang)}</h1>
      {signedIn ? (
        <Chat lang={lang} notice={t("aiNotice", lang)} initialCredits={credits} />
      ) : (
        <div className="card max-w-xl space-y-4">
          <span className="icon-tile">
            <MessageCircle size={22} aria-hidden />
          </span>
          <p>{GATE[lang].body}</p>
          <Link href="/entrar" className="btn">
            {GATE[lang].cta}
          </Link>
        </div>
      )}
    </div>
  );
}
