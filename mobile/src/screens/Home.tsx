import { ArrowRight, Bell, BellRing, Calculator, CalendarDays, FolderLock, IdCard, ScanText, CircleCheckBig, Clock, HandCoins, ListChecks, MapPin, MessageCircle, Scale, Search, Sparkles, Sprout, UserRound, Users } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getGuide, guides } from "@/content/guides";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { usePersonal, type Procedure } from "~/lib/personal";
import type { StringKey } from "~/lib/strings";
import { Alert, Field, Screen } from "~/ui/kit";
import { AddReminder, ReminderRow } from "~/ui/Reminders";
import { Landscape } from "~/ui/Illustration";
import { startDone } from "./Start";
import { tourSeen } from "./Tour";
import { SponsorBanner } from "~/ui/SponsorBanner";

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

type Shortcut = { icon: typeof Search; label: StringKey; to: string };

/** Accesos del inicio. Cada uno abre una pantalla que existe y funciona. */
const SHORTCUTS: Shortcut[] = [
  { to: "/guides", icon: ListChecks, label: "tabGuides" },
  { to: "/benefits", icon: HandCoins, label: "benefits" },
  { to: "/assistant", icon: MessageCircle, label: "tabAssistant" },
  { to: "/map", icon: MapPin, label: "offices" },
  { to: "/appointments", icon: CalendarDays, label: "appointments" },
  { to: "/documents", icon: FolderLock, label: "myDocuments" },
  { to: "/scan", icon: ScanText, label: "translator" },
  { to: "/community", icon: Users, label: "community" },
  { to: "/notifications", icon: BellRing, label: "notifications" },
  { to: "/file", icon: IdCard, label: "myFile" },
  { to: "/simulator", icon: Calculator, label: "simulator" },
  { to: "/profile", icon: UserRound, label: "tabProfile" },
];

export function Home() {
  const { t, c, lang } = useLang();
  const { user, profile, saveProfile } = useAuth();
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

  // Primera vez con esta cuenta en este dispositivo: se abre la guía de uso.
  if (!tourSeen(user?.id)) return <Navigate to="/tour" replace />;

  return (
    <Screen>
      <div className="rise space-y-6">
        <header className="flex items-center gap-3 pt-2">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-gold-soft text-xl font-bold text-terracotta-hover" aria-hidden>
            {(profile?.display_name?.trim()[0] ?? "").toUpperCase() || <UserRound size={24} />}
          </span>
          <h1 className="min-w-0 flex-1 text-[26px] font-bold leading-tight tracking-tight">{profile?.display_name ? `${t("hello")}, ${profile.display_name}` : t("helloNoName")}</h1>
          <Link to="/notifications" aria-label={t("notifications")} className="-me-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-terracotta-deep">
            <BellRing size={24} aria-hidden />
          </Link>
        </header>

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

        {/* Cuestionario inicial pendiente: se ofrece, nunca se impone. */}
        {!startDone(user?.id) && (
          <Link to="/start" className="card flex items-center gap-3 border-gold/60 bg-gold-soft">
            <span className="icon-tile" style={{ background: "var(--white)" }}>
              <Scale size={22} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{t("startCard")}</span>
              <span className="block text-[14px] text-ink-soft">{t("startCardHint")}</span>
            </span>
            <ArrowRight size={20} className="rtl:rotate-180 shrink-0 text-terracotta" aria-hidden />
          </Link>
        )}

        {/* Buscador y accesos: cada uno lleva a una pantalla que existe y funciona. */}
        <Link to="/search" className="input flex items-center gap-3 text-ink-soft" role="search">
          <Search size={20} className="shrink-0" aria-hidden /> <span className="min-w-0 flex-1 truncate">{t("searchPlaceholder")}</span>
        </Link>

        <nav aria-label={t("quickAccess")}>
          <ul className="grid grid-cols-3 gap-3">
            {SHORTCUTS.map((s) => {
              const inner = (
                <>
                  <span className="duo">
                    <s.icon size={34} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-[13px] font-medium leading-tight">{t(s.label)}</span>
                </>
              );
              const cls = "card flex h-full min-h-24 flex-col items-center justify-center gap-2 px-2 py-3 text-center";
              return (
                <li key={s.label}>
                  <Link to={s.to} className={cls}>
                    {inner}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!available && <p className="card text-ink-soft">{t("notReady")}</p>}

        <SponsorBanner placement="home" />

        {/* Continuar donde lo dejaste: todo sale de datos guardados, nada es una estimación. */}
        {available && last && lastProgress && (
          <section className="card bg-sage-soft">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-sage-dark">
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
        {/* Paisaje italiano al final del inicio: decorativo */}
        <Landscape className="-mx-5 -mb-6 w-[calc(100%+2.5rem)] max-w-none" />
      </div>
    </Screen>
  );
}
