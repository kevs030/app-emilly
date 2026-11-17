import { ArrowRight, CircleCheckBig, CircleHelp, CircleX } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { bonuses } from "@/content/bonuses";
import { useLang } from "~/lib/lang";
import { simulate, type Answers, type IseeBand, type SimResult, type Tri, type Verdict } from "~/lib/simulator";
import type { StringKey } from "~/lib/strings";
import { Screen } from "~/ui/kit";

const QUESTIONS: [Exclude<keyof Answers, "isee">, StringKey][] = [
  ["childrenUnder21", "simQChildren"],
  ["newborn", "simQNewborn"],
  ["nursery", "simQNursery"],
  ["vulnerableHousehold", "simQHousehold"],
  ["fiveYearsResidence", "simQResidence"],
  ["permitOneYear", "simQPermit"],
];
const ISEE: [IseeBand, string | null][] = [
  ["upTo10140", "≤ 10.140 €"],
  ["upTo17468", "10.140 € – 17.468,51 €"],
  ["upTo40000", "17.468,51 € – 40.000 €"],
  ["over40000", "> 40.000 €"],
  ["none", null],
  ["unknown", null],
];
const LOOK: Record<Verdict, { icon: typeof CircleHelp; label: StringKey; cls: string }> = {
  possible: { icon: CircleCheckBig, label: "simPossible", cls: "bg-sage-soft text-[#3d5238]" },
  check: { icon: CircleHelp, label: "simCheck", cls: "bg-beige text-brown" },
  unlikely: { icon: CircleX, label: "simUnlikely", cls: "bg-white text-ink-soft" },
};

/** Simulador orientativo de ayudas. Las respuestas se quedan en el dispositivo: no se guardan ni se envían. */
export function Simulator() {
  const { t, c } = useLang();
  const [tri, setTri] = useState<Partial<Record<keyof Answers, Tri>>>({});
  const [isee, setIsee] = useState<IseeBand | "">("");
  const [results, setResults] = useState<SimResult[] | null>(null);
  const complete = QUESTIONS.every(([k]) => tri[k]) && isee !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setResults(simulate({ ...(tri as Omit<Answers, "isee">), isee: isee as IseeBand }));
  }

  if (results) {
    return (
      <Screen title={t("simulator")} back help="simulator">
        <p className="rounded-2xl bg-beige p-3 text-[14px]">{t("simDisclaimer")}</p>
        {results.length === 0 && <p className="card mt-4 text-ink-soft">{t("simNone")}</p>}
        <ul className="mt-4 space-y-3">
          {results.map((r) => {
            const b = bonuses.find((x) => x.slug === r.slug)!;
            const look = LOOK[r.verdict];
            return (
              <li key={r.slug} className="card space-y-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${look.cls}`}>
                  <look.icon size={16} aria-hidden /> {t(look.label)}
                </span>
                <h2 className="font-bold">{c(b.name)}</h2>
                {r.reasons.length > 0 && (
                  <ul className="list-disc space-y-1 ps-5 text-[15px]">
                    {r.reasons.map((reason) => (
                      <li key={reason}>{t(`simR_${reason}` as StringKey)}</li>
                    ))}
                  </ul>
                )}
                <Link to={`/benefits#${r.slug}`} className="flex min-h-11 items-center gap-1 font-semibold text-terracotta-deep">
                  {t("simSeeRequirements")} <ArrowRight size={18} className="rtl:rotate-180" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
        <button type="button" className="btn btn-secondary mt-5" onClick={() => setResults(null)}>
          {t("simAgain")}
        </button>
      </Screen>
    );
  }

  return (
    <Screen title={t("simulator")} back help="simulator">
      <p className="text-[15px] text-ink-soft">{t("simLead")}</p>
      <form onSubmit={submit} className="mt-4 space-y-4">
        {QUESTIONS.map(([key, label]) => (
          <fieldset key={key} className="card">
            <legend className="float-start mb-3 w-full font-medium">{t(label)}</legend>
            <div className="segmented three clear-both">
              {(["yes", "no", "unknown"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={tri[key] === v} onClick={() => setTri((s) => ({ ...s, [key]: v }))}>
                  {t(v === "unknown" ? "dontKnow" : v)}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="card">
          <label className="field-label" htmlFor="isee">
            {t("simQIsee")}
          </label>
          <select id="isee" className="input" value={isee} onChange={(e) => setIsee(e.target.value as IseeBand)}>
            <option value="" disabled>
              —
            </option>
            {ISEE.map(([value, label]) => (
              <option key={value} value={value}>
                {label ?? t(value === "none" ? "simIseeNone" : "dontKnow")}
              </option>
            ))}
          </select>
          <p className="hint mt-1">{t("simIseeHint")}</p>
        </div>
        <button className="btn" disabled={!complete}>
          {t("simSee")}
        </button>
      </form>
    </Screen>
  );
}
