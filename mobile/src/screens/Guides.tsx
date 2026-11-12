import { ArrowRight, Check, CircleCheckBig, ExternalLink, FileDown, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { documentsFor } from "@/content/documents";
import { getGuide, guides } from "@/content/guides";
import { isStale } from "@/lib/i18n";
import { useLang } from "~/lib/lang";
import { usePersonal } from "~/lib/personal";
import { Alert, Screen } from "~/ui/kit";
import { AddReminder, ReminderRow } from "~/ui/Reminders";

/** Casilla grande para marcar un paso o documento como hecho. */
function Tick({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-sage bg-sage text-white" : "border-beige bg-white"}`}
    >
      {on && <Check size={18} aria-hidden />}
    </button>
  );
}

export function Guides() {
  const { t, c } = useLang();
  return (
    <Screen title={t("guidesTitle")}>
      <ul className="rise space-y-3">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link to={`/guides/${g.slug}`} className="card flex items-start gap-3">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{c(g.title)}</span>
                <span className="mt-1 line-clamp-2 block text-[15px] text-ink-soft">{c(g.summary)}</span>
              </span>
              <ArrowRight size={20} className="mt-1 shrink-0 text-terracotta" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

export function GuideDetail() {
  const { slug = "" } = useParams();
  const { t, c } = useLang();
  const { available, procedureFor, progressOf, isDone, start, toggleItem, setStatus, removeProcedure, reminders, log } = usePersonal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const guide = getGuide(slug);

  useEffect(() => {
    if (guide) log("guide_view", guide.slug);
    // Solo al abrir la guía: no queremos registrar cada repintado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.slug]);

  if (!guide) return <Navigate to="/guides" replace />;
  const docs = documentsFor(guide.slug);
  const proc = procedureFor(guide.slug);
  const pr = proc ? progressOf(proc) : null;
  const tracking = Boolean(proc && proc.status === "active");
  const mine = proc ? reminders.filter((r) => r.procedure_id === proc.id) : [];

  async function begin() {
    setBusy(true);
    setError(false);
    const ok = await start(guide!.slug);
    setBusy(false);
    if (!ok) setError(true);
  }

  return (
    <Screen back>
      <article className="rise space-y-5">
        <header>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight">{c(guide.title)}</h1>
          <p className="mt-2 text-ink-soft">{c(guide.summary)}</p>
        </header>

        {available && !proc && (
          <section className="card bg-sage-soft">
            <p className="text-[15px]">{t("startHint")}</p>
            {error && (
              <div className="mt-3">
                <Alert kind="error">{t("generic")}</Alert>
              </div>
            )}
            <button type="button" className="btn mt-3" disabled={busy} onClick={begin}>
              {t("startProcedure")}
            </button>
          </section>
        )}

        {proc && pr && (
          <section className="card">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#3d5238]">
              {proc.status === "done" ? <CircleCheckBig size={18} aria-hidden /> : null}
              {proc.status === "done" ? `${t("finishedOn")} ${new Date(proc.completed_at ?? proc.updated_at).toLocaleDateString()}` : t("inProgress")}
            </p>
            <div className="progress mt-3" role="progressbar" aria-valuenow={pr.percent} aria-valuemin={0} aria-valuemax={100} aria-label={t("myProgress")}>
              <span style={{ width: `${pr.percent}%` }} />
            </div>
            <p className="mt-2 text-[14px] text-ink-soft">
              {pr.stepsDone} {t("of")} {pr.stepsTotal} {t("stepsWord")} · {pr.docsDone} {t("of")} {pr.docsTotal} {t("docsWord")}
            </p>
            {tracking && <p className="mt-1 text-[14px] text-ink-soft">{t("tickHint")}</p>}
          </section>
        )}

        <section className="card">
          <h2 className="text-lg font-bold">{t("steps")}</h2>
          <ol className="mt-3 space-y-4">
            {guide.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                {tracking && proc ? (
                  <Tick on={isDone(proc.id, "step", i)} label={c(s.title)} onClick={() => toggleItem(proc, "step", i)} />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta-deep text-[15px] font-bold text-white">{i + 1}</span>
                )}
                <div>
                  <h3 className={`font-semibold ${tracking && proc && isDone(proc.id, "step", i) ? "text-ink-soft line-through" : ""}`}>
                    {tracking && `${i + 1}. `}
                    {c(s.title)}
                  </h3>
                  <p className="text-[15px] text-ink-soft">{c(s.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold">{t("documents")}</h2>
          {tracking && proc ? (
            <ul className="mt-3 space-y-3 text-[15px]">
              {guide.documents.map((d, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Tick on={isDone(proc.id, "document", i)} label={c(d)} onClick={() => toggleItem(proc, "document", i)} />
                  <span className={isDone(proc.id, "document", i) ? "text-ink-soft line-through" : ""}>{c(d)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
              {guide.documents.map((d, i) => (
                <li key={i}>{c(d)}</li>
              ))}
            </ul>
          )}
          {guide.costs && (
            <>
              <h2 className="mt-4 text-lg font-bold">{t("costs")}</h2>
              <p className="mt-1 text-[15px]">{c(guide.costs)}</p>
            </>
          )}
        </section>

        {guide.extra && (
          <section className="card bg-sage-soft">
            <h2 className="text-lg font-bold">{c(guide.extra.title)}</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px]">
              {guide.extra.items.map((x, i) => (
                <li key={i}>{c(x)}</li>
              ))}
            </ul>
          </section>
        )}

        {docs.length > 0 && (
          <section className="card">
            <h2 className="text-lg font-bold">{t("forms")}</h2>
            <ul className="mt-3 space-y-3">
              {docs.map((d) => (
                <li key={d.id}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={() => log("document_open", guide.slug)} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                    <span className="icon-tile">{d.kind === "pdf" ? <FileDown size={20} aria-hidden /> : <ExternalLink size={20} aria-hidden />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">{c(d.title)}</span>
                      <span className="block text-[13px] text-ink-soft">{d.issuer}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {proc && (
          <section className="card space-y-3">
            <h2 className="text-lg font-bold">{t("reminders")}</h2>
            {mine.length > 0 && (
              <ul className="space-y-3">
                {mine.map((r) => (
                  <ReminderRow key={r.id} r={r} />
                ))}
              </ul>
            )}
            <AddReminder procedureId={proc.id} />
          </section>
        )}

        {guide.warnings?.map((w, i) => (
          <p key={i} className="flex gap-3 rounded-2xl bg-beige p-4 text-[15px]">
            <TriangleAlert size={20} className="mt-0.5 shrink-0 text-terracotta-deep" aria-hidden />
            <span>{c(w)}</span>
          </p>
        ))}

        <section className="card">
          <h2 className="font-bold">{t("sources")}</h2>
          <ul className="mt-2 space-y-2 text-[15px]">
            {guide.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brown underline">
                  {s.title}
                </a>
                {s.official && <span className="ml-2 rounded-full bg-sage-soft px-2 py-0.5 text-[12px] font-semibold text-[#3d5238]">{t("official")}</span>}
              </li>
            ))}
          </ul>
          <p className="hint mt-3">
            {t("checkedOn")} {guide.lastVerified}
          </p>
          {isStale(guide.lastVerified) && <p className="mt-2 rounded-xl bg-beige p-3 text-[14px]">{t("stale")}</p>}
        </section>
        {proc && (
          <section className="space-y-2">
            {proc.status === "active" ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pr?.nextStep !== null}
                onClick={() => window.confirm(t("finishConfirm")) && setStatus(proc, "done")}
              >
                {t("markFinished")}
              </button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => setStatus(proc, "active")}>
                {t("reopen")}
              </button>
            )}
            <button type="button" className="btn btn-quiet" onClick={() => window.confirm(t("removeConfirm")) && removeProcedure(proc)}>
              {t("removeProcedure")}
            </button>
          </section>
        )}
        <p className="hint">{t("disclaimer")}</p>
      </article>
    </Screen>
  );
}
