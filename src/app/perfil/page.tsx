import Link from "next/link";
import { redirect } from "next/navigation";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { nextSteps, type Profile } from "@/lib/next-steps";
import { NotConfigured } from "@/components/NotConfigured";
import { ProfileForm } from "./ProfileForm";
import { deleteAccount, signOut } from "./actions";

export default async function ProfilePage() {
  const lang = await getLang();
  if (!supabaseConfigured()) return <NotConfigured />;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/entrar");

  const { data } = await supabase
    .from("profiles")
    .select("display_name, country_of_origin, city, permit_type, permit_expiry, has_children, preferred_language, consent_personalization, consent_analytics")
    .eq("id", auth.user.id)
    .single();
  const profile = data as Profile;
  const steps = profile.consent_personalization ? nextSteps(profile) : [];
  const en = lang === "en";
  const { data: isAdmin } = await supabase.rpc("is_admin");

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">{t("navProfile", lang)}</h1>

      {steps.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">{en ? "Your next steps" : "Tus próximos pasos"}</h2>
          <ul className="mt-2 space-y-2">
            {steps.map((s, i) => (
              <li key={i}>
                <Link href={s.href} className="block rounded-lg bg-brand-soft p-3 text-sm hover:underline">
                  {tr(s.text, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isAdmin === true && (
        <Link href="/admin" className="btn">
          Panel de administración
        </Link>
      )}

      <ProfileForm profile={profile} lang={lang} />

      <section className="flex flex-wrap gap-3">
        <form action={signOut}>
          <button className="rounded-lg border border-border px-4 py-2">{t("logout", lang)}</button>
        </form>
        <form action={deleteAccount} className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" required /> {en ? "I confirm" : "Confirmo"}
          </label>
          <button className="rounded-lg border border-red-400 px-4 py-2 text-red-600">
            {en ? "Delete my account and data" : "Borrar mi cuenta y mis datos"}
          </button>
        </form>
      </section>
    </div>
  );
}
