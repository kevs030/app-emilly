import { ArrowRight, Sprout } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { guides } from "@/content/guides";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { Alert, Field, Screen } from "~/ui/kit";

export function Home() {
  const { t, c } = useLang();
  const { profile, saveProfile } = useAuth();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const ok = await saveProfile({ display_name: name.trim() });
    setBusy(false);
    if (!ok) setError(true);
  }

  return (
    <Screen>
      <div className="rise space-y-6">
        <h1 className="pt-2 text-[28px] font-bold leading-tight tracking-tight">{profile?.display_name ? `${t("hello")}, ${profile.display_name}` : t("helloNoName")}</h1>

        {/* Perfil gradual: solo pedimos el nombre, y solo si falta. */}
        {profile && !profile.display_name && (
          <form onSubmit={saveName} className="card space-y-3">
            <Field label={t("askName")} hint={t("askNameHint")} minLength={2} maxLength={40} required autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
            {error && <Alert kind="error">{t("generic")}</Alert>}
            <button className="btn" disabled={busy || name.trim().length < 2}>
              {t("save")}
            </button>
          </form>
        )}

        <section className="card">
          <div className="flex items-center gap-3">
            <span className="icon-tile">
              <Sprout size={22} aria-hidden />
            </span>
            <h2 className="text-lg font-bold">{t("myProgress")}</h2>
          </div>
          <p className="mt-3 text-ink-soft">{t("progressSoon")}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">{t("popular")}</h2>
          <ul className="space-y-3">
            {guides.slice(0, 4).map((g) => (
              <li key={g.slug}>
                <Link to={`/guides/${g.slug}`} className="card flex items-center gap-3">
                  <span className="min-w-0 flex-1 font-semibold">{c(g.title)}</span>
                  <ArrowRight size={20} className="shrink-0 text-terracotta" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/guides" className="btn btn-quiet mt-2">
            {t("guidesTitle")} →
          </Link>
        </section>
      </div>
    </Screen>
  );
}
