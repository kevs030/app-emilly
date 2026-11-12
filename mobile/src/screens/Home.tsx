import { ArrowRight, Bell, CircleCheckBig, Clock, Sparkles, Sprout } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getGuide, guides } from "@/content/guides";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { usePersonal, type Procedure } from "~/lib/personal";
import type { StringKey } from "~/lib/strings";
import { Alert, Field, Screen } from "~/ui/kit";
import { AddReminder, ReminderRow } from "~/ui/Reminders";

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

function ProcedureCard({ p }: { p: Procedure }) {
  const { t, c } = useLang();
  const { progressOf } = usePersonal();
  const pr = progressOf(p);
  if (!pr) return null;
  return (
    <Link to={`/guides/${p.guide_slug}`} className="card block">
      <span className="flex items-start gap-3">
        <span className="min-w-0 flex-1 font-semibold">{c(pr.guide.title)}</span>
        <ArrowRight size={20} className="rtl:rotate-180 mt-0.5 shrink-0 text-terracotta" aria-hidden />
      </span>
      <span className="mt-3 block">
        <ProgressBar percent={pr.percent} label={c(pr.guide.title)} />
      </span>
      <span className="mt-2 block text-[14px] text-ink-soft">
        {pr.stepsDone} {t("of")} {pr.stepsTotal} {t("stepsWord")} · {pr.docsDone} {t("of")} {pr.docsTotal} {t("docsWord")}
      </span>
    </Link>
  );
}

export function Home() {
  const { t, c, lang } = useLang();
  const { profile, saveProfile } = useAuth();
  const { available, loading, procedures, reminders, facts, activity, progressOf, setInterest } = usePersonal();
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

  const active = procedures.filter((p) => p.status === "active");
  const finished = procedures.filter((p) => p.status === "done");
  const last = active[0]; // la lista viene ordenada por última actualización
  const lastProgress = last ? progressOf(last) : null;
  const pendingReminders = reminders.filter((r) => !r.done).slice(0, 5);
  const interests = facts.filter((f) => f.key === "interest").map((f) => f.value);
  const started = new Set(procedures.map((p) => p.guide_slug));
  const recommended = interests.filter((s) => !started.has(s) && getGuide(s)).slice(0, 3);
  const recent = activity.filter((a) => a.type !== "item_undone").slice(0, 5);

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

        {!available && <p className="card text-ink-soft">{t("notReady")}</p>}

        {/* Continuar donde lo dejaste: todo sale de datos guardados, nada es una estimación. */}
        {available && last && lastProgress && (
          <section className="card bg-sage-soft">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#3d5238]">
              <Sprout size={18} aria-hidden /> {t("welcomeBack")}
            </p>
            <p className="mt-2">
              {t("resumeLead")} <strong>«{c(lastProgress.guide.title)}»</strong>. {t("resumeDone")} {lastProgress.stepsDone} {t("of")} {lastProgress.stepsTotal} {t("stepsWord")}.
            </p>
            <p className="mt-2 text-[15px]">
              {lastProgress.nextStep === null ? (
                t("allStepsDone")
              ) : (
                <>
                  {t("nextIs")} <strong>{c(lastProgress.guide.steps[lastProgress.nextStep].title)}</strong>
                </>
              )}
            </p>
            <Link to={`/guides/${last.guide_slug}`} className="btn mt-4">
              {t("continue")}
            </Link>
          </section>
        )}

        {available && !loading && (
          <section>
            <h2 className="mb-3 text-lg font-bold">{t("myProcedures")}</h2>
            {active.length === 0 ? (
              <p className="card text-ink-soft">{t("noProcedures")}</p>
            ) : (
              <ul className="space-y-3">
                {active.map((p) => (
                  <li key={p.id}>
                    <ProcedureCard p={p} />
                  </li>
                ))}
              </ul>
            )}
            {finished.length > 0 && (
              <ul className="mt-3 space-y-2">
                {finished.map((p) => {
                  const g = getGuide(p.guide_slug);
                  return g ? (
                    <li key={p.id}>
                      <Link to={`/guides/${p.guide_slug}`} className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 text-[15px]">
                        <CircleCheckBig size={20} className="shrink-0 text-sage" aria-hidden />
                        <span className="min-w-0 flex-1">{c(g.title)}</span>
                        <span className="text-[13px] text-ink-soft">{t("finished")}</span>
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </section>
        )}

        {available && !loading && (
          <section className="card space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Bell size={20} className="text-terracotta" aria-hidden /> {t("reminders")}
            </h2>
            {pendingReminders.length === 0 ? (
              <p className="text-[15px] text-ink-soft">{t("noReminders")}</p>
            ) : (
              <ul className="space-y-3">
                {pendingReminders.map((r) => (
                  <ReminderRow key={r.id} r={r} />
                ))}
              </ul>
            )}
            <AddReminder />
          </section>
        )}

        {/* Intereses: los elige la persona. No se deducen de su comportamiento. */}
        {available && !loading && (
          <section className="card">
            <h2 className="text-lg font-bold">{t("whatNeed")}</h2>
            <p className="mt-1 text-[15px] text-ink-soft">{t("whatNeedHint")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {guides.map((g) => {
                const on = interests.includes(g.slug);
                return (
                  <button
                    key={g.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setInterest(g.slug, !on)}
                    className={`min-h-11 rounded-2xl px-4 py-2 text-left text-[14px] font-medium ${on ? "bg-terracotta-deep text-white" : "bg-beige text-ink"}`}
                  >
                    {c(g.title).split(/[:(]/)[0].trim()}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {available && recommended.length > 0 && (
          <section>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
              <Sparkles size={20} className="text-terracotta" aria-hidden /> {t("forYou")}
            </h2>
            <p className="mb-3 text-[14px] text-ink-soft">{t("forYouWhy")}</p>
            <ul className="space-y-3">
              {recommended.map((slug) => (
                <li key={slug}>
                  <Link to={`/guides/${slug}`} className="card flex items-center gap-3">
                    <span className="min-w-0 flex-1 font-semibold">{c(getGuide(slug)!.title)}</span>
                    <ArrowRight size={20} className="rtl:rotate-180 shrink-0 text-terracotta" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {available && recent.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Clock size={20} className="text-terracotta" aria-hidden /> {t("recent")}
            </h2>
            <ul className="space-y-2 text-[15px]">
              {recent.map((a) => {
                const g = a.ref ? getGuide(a.ref) : undefined;
                return (
                  <li key={a.id} className="flex gap-2">
                    <span className="min-w-0 flex-1">
                      {t(`act_${a.type}` as StringKey)}
                      {g && <> «{c(g.title).split(/[:(]/)[0].trim()}»</>}
                    </span>
                    <span className="shrink-0 text-[13px] text-ink-soft">{new Date(a.created_at).toLocaleDateString(lang, { day: "numeric", month: "short" })}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {(!available || (!loading && active.length === 0)) && (
          <section>
            <h2 className="mb-3 text-lg font-bold">{t("popular")}</h2>
            <ul className="space-y-3">
              {guides.slice(0, 4).map((g) => (
                <li key={g.slug}>
                  <Link to={`/guides/${g.slug}`} className="card flex items-center gap-3">
                    <span className="min-w-0 flex-1 font-semibold">{c(g.title)}</span>
                    <ArrowRight size={20} className="rtl:rotate-180 shrink-0 text-terracotta" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Screen>
  );
}
