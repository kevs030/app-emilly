import { Briefcase, Calculator, ChevronDown, ExternalLink, LifeBuoy, Phone, ReceiptText } from "lucide-react";
import { useState } from "react";
import { P } from "~/content/modules/phrases";
import { PAYSLIP, tfrEstimate, TOPICS, WK, WORK_HELP, type WorkTopic } from "~/content/modules/work";
import { Screen } from "~/ui/kit";
import { PdfButton, useT9 } from "~/ui/modules/ModuleBlocks";

function Topic({ t, open, onToggle }: { t: WorkTopic; open: boolean; onToggle: () => void }) {
  const { x, rtl, lang } = useT9();
  return (
    <li className="rounded-2xl border border-line bg-white" data-testid={`work-${t.id}`}>
      <button type="button" aria-expanded={open} aria-controls={`wk-${t.id}`} onClick={onToggle} className="flex min-h-14 w-full items-center gap-3 p-3 text-start">
        <span className="min-w-0 flex-1 font-semibold">{x(t.title)}</span>
        <ChevronDown size={20} className={`shrink-0 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div id={`wk-${t.id}`} className="rise space-y-3 border-t border-line p-3 text-[15px]">
          <p>{x(t.summary)}</p>
          <ul className="list-disc space-y-1.5 ps-5">
            {t.points.map((p, i) => (
              <li key={i}>{x(p)}</li>
            ))}
          </ul>
          {t.links?.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary !min-h-12 !text-[15px]">
              <ExternalLink size={18} aria-hidden /> {l.label}
            </a>
          ))}
          <PdfButton
            label={x(WK.pdf)}
            filename={`A Posto - ${x(t.title)}`}
            make={() => ({ title: x(t.title), subtitle: x(t.summary), rtl, lang, url: t.links?.[0]?.url, sections: [{ items: t.points.map(x) }, { items: [x(WK.note)] }], footer: x(P.generatedBy) })}
          />
        </div>
      )}
    </li>
  );
}

function TfrCalculator() {
  const { x, lang } = useT9();
  const [gross, setGross] = useState("");
  const [years, setYears] = useState("1");
  const value = tfrEstimate(Number(gross.replace(",", ".")), Number(years.replace(",", ".")));
  return (
    <section className="card space-y-3" aria-labelledby="tfr-calc">
      <h2 id="tfr-calc" className="flex items-center gap-2 text-lg font-bold">
        <Calculator size={20} className="text-sage" aria-hidden /> {x(WK.calcTitle)}
      </h2>
      <label className="block">
        <span className="field-label">{x(WK.calcGross)}</span>
        <input className="input" inputMode="decimal" value={gross} onChange={(e) => setGross(e.target.value)} placeholder="20000" data-testid="tfr-gross" />
      </label>
      <label className="block">
        <span className="field-label">{x(WK.calcYears)}</span>
        <input className="input" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} data-testid="tfr-years" />
      </label>
      {value > 0 && (
        <p className="alert alert-ok" aria-live="polite" data-testid="tfr-result">
          {x(WK.calcResult)} <strong>{value.toLocaleString(lang, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</strong>
        </p>
      )}
      <p className="hint">{x(WK.calcHint)}</p>
    </section>
  );
}

/** «Trabajo y beneficios laborales»: derechos, nómina, TFR, paro y ayuda gratuita. */
export function Work() {
  const { x } = useT9();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Screen title={x(WK.title)} back>
      <div className="rise space-y-5">
        <p className="text-[15px] text-ink-soft">{x(WK.sub)}</p>

        <ul className="space-y-2">
          {TOPICS.map((t) => (
            <Topic key={t.id} t={t} open={open === t.id} onToggle={() => setOpen(open === t.id ? null : t.id)} />
          ))}
        </ul>

        <section className="card space-y-3" aria-labelledby="payslip">
          <h2 id="payslip" className="flex items-center gap-2 text-lg font-bold">
            <ReceiptText size={20} className="text-sage" aria-hidden /> {x(WK.glossary)}
          </h2>
          <p className="hint">{x(WK.glossaryHint)}</p>
          <dl className="divide-y divide-line">
            {PAYSLIP.map((g) => (
              <div key={g.term} className="py-2">
                <dt className="font-semibold" lang="it">
                  {g.term}
                </dt>
                <dd className="text-[15px] text-ink-soft">{x(g.explain)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <TfrCalculator />

        <section className="card space-y-3" aria-labelledby="work-help">
          <h2 id="work-help" className="flex items-center gap-2 text-lg font-bold">
            <LifeBuoy size={20} className="text-sage" aria-hidden /> {x(WK.help)}
          </h2>
          <ul className="space-y-2">
            {WORK_HELP.map((h) => (
              <li key={h.name}>
                <a href={h.url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-cream p-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{h.name}</span>
                    <span className="block text-[14px] text-ink-soft">{x(h.what)}</span>
                  </span>
                  <ExternalLink size={18} className="shrink-0 text-terracotta" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <div className="alert alert-info space-y-2 text-[15px]">
            <p>{x(WK.antitratta)}</p>
            <a href="tel:800290290" className="inline-flex min-h-11 items-center gap-2 font-bold text-terracotta-hover underline">
              <Phone size={18} aria-hidden /> 800 290 290
            </a>
          </div>
        </section>

        <p className="flex gap-2 text-[14px] text-ink-soft">
          <Briefcase size={18} className="mt-0.5 shrink-0" aria-hidden /> {x(WK.note)}
        </p>
      </div>
    </Screen>
  );
}
