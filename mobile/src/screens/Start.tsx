import { ArrowRight, Check, HandCoins, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGuide, guides } from "@/content/guides";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { usePersonal } from "~/lib/personal";
import { recommend, suggestBenefits, type PlanAnswers } from "~/lib/plan";
import { Alert, Field } from "~/ui/kit";
import { Illustration } from "~/ui/Illustration";
import { PERMITS } from "./MyFile";

/** Guarda en este dispositivo que la persona ya hizo (o aplazó) el cuestionario inicial. */
const doneKey = (uid: string) => `aposto:start:${uid}`;
export function startDone(uid: string | undefined): boolean {
  if (!uid) return true;
  try {
    return localStorage.getItem(doneKey(uid)) === "1";
  } catch {
    return true;
  }
}
function markDone(uid: string | undefined) {
  if (!uid) return;
  try {
    localStorage.setItem(doneKey(uid), "1");
  } catch {
    /* sin almacenamiento: la tarjeta del inicio lo volverá a ofrecer */
  }
}

const QUESTIONS = 4;

/**
 * Cuestionario inicial: 4 preguntas cortas, una por pantalla, todas opcionales.
 * Con las respuestas se rellena «Mi expediente» y se marcan las guías recomendadas («Para ti»).
 */
export function Start() {
  const { t, c } = useLang();
  const { user, profile, saveProfile } = useAuth();
  const { facts, setInterest } = usePersonal();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 intro · 1..4 preguntas · 5 resultado
  const [a, setA] = useState<PlanAnswers>({ goals: [], permit: profile?.permit_type ?? "", expiry: profile?.permit_expiry ?? "", children: profile?.has_children == null ? "" : profile.has_children ? "yes" : "no" });
  const [city, setCity] = useState(profile?.city ?? "");
  const [country, setCountry] = useState(profile?.country_of_origin ?? "");
  const [plan, setPlan] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  function later() {
    markDone(user?.id);
    navigate("/", { replace: true });
  }

  async function finish() {
    setBusy(true);
    setError(false);
    const ok = await saveProfile({
      permit_type: a.permit || null,
      permit_expiry: a.permit && a.permit !== "nessuno" && a.expiry ? a.expiry : null,
      has_children: a.children === "" ? null : a.children === "yes",
      city: city.trim() || null,
      country_of_origin: country.trim() || null,
    });
    if (!ok) {
      setBusy(false);
      return setError(true);
    }
    const slugs = recommend(a, (s) => Boolean(getGuide(s)));
    const already = new Set(facts.filter((f) => f.key === "interest").map((f) => f.value));
    for (const s of slugs) if (!already.has(s)) await setInterest(s, true);
    markDone(user?.id);
    setPlan(slugs);
    setBusy(false);
    setStep(5);
  }

  const choice = (on: boolean) => `flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-medium ${on ? "bg-terracotta-deep text-white" : "bg-beige text-ink"}`;
  const next = () => setStep((s) => s + 1);

  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-md flex-col px-6">
      {step >= 1 && step <= QUESTIONS && (
        <div className="flex items-center justify-between pt-3">
          <p className="text-[14px] font-medium text-ink-soft" aria-live="polite">
            {t("question")} {step} / {QUESTIONS}
          </p>
          <button type="button" className="min-h-11 px-2 text-[15px] font-medium text-brown underline" onClick={step === QUESTIONS ? finish : next}>
            {t("skipQuestion")}
          </button>
        </div>
      )}

      <div key={step} className="rise flex flex-1 flex-col py-5">
        {step === 0 && (
          <>
            <Illustration name="tramites" eager />
            <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight">{t("startTitle")}</h1>
            <p className="mt-3 text-lg text-ink-soft">{t("startBody")}</p>
          </>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="text-[26px] font-bold leading-tight">{t("qGoals")}</legend>
            <p className="mt-2 text-ink-soft">{t("qGoalsHint")}</p>
            <ul className="mt-5 space-y-2">
              {guides.map((g) => {
                const on = a.goals.includes(g.slug);
                return (
                  <li key={g.slug}>
                    <button type="button" aria-pressed={on} className={choice(on)} onClick={() => setA({ ...a, goals: on ? a.goals.filter((s) => s !== g.slug) : [...a.goals, g.slug] })}>
                      <span className="min-w-0 flex-1">{c(g.title).split(/[:(]/)[0].trim()}</span>
                      {on && <Check size={20} aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-[26px] font-bold leading-tight">{t("qPermit")}</legend>
            <p className="mt-2 flex items-start gap-2 text-[14px] text-ink-soft">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden /> {t("situationLocal")}
            </p>
            <ul className="mt-5 space-y-2">
              {PERMITS.map(([value, label]) => (
                <li key={value}>
                  <button type="button" aria-pressed={a.permit === value} className={choice(a.permit === value)} onClick={() => setA({ ...a, permit: value })}>
                    <span className="min-w-0 flex-1">{label ?? t(value === "altro" ? "cat_altro" : "fileNoPermit")}</span>
                    {a.permit === value && <Check size={20} aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
            {a.permit && a.permit !== "nessuno" && (
              <div className="mt-5">
                <Field label={t("filePermitExpiry")} type="date" value={a.expiry} onChange={(e) => setA({ ...a, expiry: e.target.value })} hint={t("qExpiryHint")} />
              </div>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="text-[26px] font-bold leading-tight">{t("fileChildren")}</legend>
            <ul className="mt-5 space-y-2">
              {(
                [
                  ["yes", "yes"],
                  ["no", "no"],
                  ["", "fileNoAnswer"],
                ] as const
              ).map(([value, label]) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-pressed={a.children === value}
                    className={choice(a.children === value)}
                    onClick={() => {
                      setA({ ...a, children: value });
                      next();
                    }}
                  >
                    <span className="min-w-0 flex-1">{t(label)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="space-y-4">
            <legend className="text-[26px] font-bold leading-tight">{t("qPlace")}</legend>
            <Field label={t("fileCity")} autoComplete="address-level2" maxLength={60} value={city} onChange={(e) => setCity(e.target.value)} />
            <Field label={t("fileCountry")} autoComplete="country-name" maxLength={60} value={country} onChange={(e) => setCountry(e.target.value)} />
            {error && <Alert kind="error">{t("generic")}</Alert>}
          </fieldset>
        )}

        {step === 5 && (
          <>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight">{t("planTitle")}</h1>
            <p className="mt-2 text-ink-soft">{t("planBody")}</p>
            <ol className="mt-5 space-y-3">
              {plan.map((slug, n) => (
                <li key={slug}>
                  <Link to={`/guides/${slug}`} className="card flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-soft font-bold text-sage-dark">{n + 1}</span>
                    <span className="min-w-0 flex-1 font-semibold">{c(getGuide(slug)!.title)}</span>
                    <ArrowRight size={20} className="rtl:rotate-180 shrink-0 text-terracotta" aria-hidden />
                  </Link>
                </li>
              ))}
              {suggestBenefits(a) && (
                <li>
                  <Link to="/benefits" className="card flex items-center gap-3">
                    <span className="icon-tile">
                      <HandCoins size={20} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 font-semibold">{t("planBenefits")}</span>
                    <ArrowRight size={20} className="rtl:rotate-180 shrink-0 text-terracotta" aria-hidden />
                  </Link>
                </li>
              )}
            </ol>
            <p className="hint mt-4">{t("planEdit")}</p>
          </>
        )}
      </div>

      <div className="flex gap-3 pb-4">
        {step === 0 && (
          <>
            <button type="button" className="btn btn-secondary flex-1" onClick={later}>
              {t("startLater")}
            </button>
            <button type="button" className="btn flex-1" onClick={next}>
              {t("startGo")}
            </button>
          </>
        )}
        {step >= 1 && step <= QUESTIONS && (
          <>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setStep(step - 1)}>
              {t("back")}
            </button>
            {step !== 3 && (
              <button type="button" className="btn flex-1" disabled={busy} onClick={step === QUESTIONS ? finish : next}>
                {step === QUESTIONS ? (busy ? "…" : t("planSee")) : t("tourNext")}
              </button>
            )}
          </>
        )}
        {step === 5 && (
          <button type="button" className="btn flex-1" onClick={() => navigate("/", { replace: true })}>
            {t("planHome")}
          </button>
        )}
      </div>
    </div>
  );
}
