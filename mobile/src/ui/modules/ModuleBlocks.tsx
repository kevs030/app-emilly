import { Download, ExternalLink as ExternalIcon, FileText, Info, Loader2, MapPin, PlayCircle, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { P } from "~/content/modules/phrases";
import type { CityEntry, ExternalLink, FormField, T9 } from "~/content/modules/types";
import { V, type VideoSection } from "~/content/modules/videos";
import { useLang } from "~/lib/lang";
import { renderPdf, savePdf, type PdfDoc } from "~/lib/pdf";
import { API_URL } from "~/lib/supabase";

/** Texto del módulo en el idioma elegido: cambia al momento cuando la persona cambia de idioma. */
export function useT9() {
  const { lang } = useLang();
  return { lang, x: (t: T9) => t[lang], rtl: lang === "ar" };
}

/** Botón que genera un PDF en el idioma de la persona y lo comparte o descarga. */
export function PdfButton({ make, label, filename }: { make: () => PdfDoc; label: string; filename: string }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function go() {
    setBusy(true);
    setFailed(false);
    try {
      await savePdf(await renderPdf(make()), filename);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button type="button" className="btn btn-secondary min-h-12 text-[15px]" onClick={go} disabled={busy} aria-busy={busy}>
      {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <FileText size={18} aria-hidden />} {label}
      {failed && <span className="sr-only">!</span>}
    </button>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { x } = useT9();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="rise max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[24px] bg-white p-5 shadow-[var(--ap-shadow-raised)] sm:rounded-[24px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start gap-3">
          <h2 className="min-w-0 flex-1 text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label={x(P.close)} className="-me-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft">
            <X size={22} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** PDF de resumen de un enlace externo: qué hay y qué hacer, en el idioma de la persona. */
export function linkPdf(l: ExternalLink, x: (t: T9) => string, rtl: boolean): PdfDoc {
  return { title: x(l.label), subtitle: x(l.what), url: l.url, rtl, sections: [{ heading: x(P.stepsToFollow), items: l.steps.map(x), numbered: true }], footer: x(P.generatedBy) };
}

/** Enlace externo con su explicación (modal) y su resumen en PDF. */
export function LinkWithSummary({ link }: { link: ExternalLink }) {
  const { x, rtl } = useT9();
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl border border-line bg-cream p-3">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 font-semibold text-terracotta-hover underline underline-offset-2">
        <ExternalIcon size={18} className="shrink-0" aria-hidden />
        <span className="min-w-0 break-words">{x(link.label)}</span>
      </a>
      <button type="button" onClick={() => setOpen(true)} className="mt-1 flex min-h-11 items-center gap-2 text-[15px] font-medium text-sage-dark">
        <Info size={18} aria-hidden /> {x(P.explainLink)}
      </button>
      {open && (
        <Modal title={x(link.label)} onClose={() => setOpen(false)}>
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-ink-soft">{x(P.whatYouFind)}</h3>
          <p className="mt-1">{x(link.what)}</p>
          <h3 className="mt-4 text-[13px] font-bold uppercase tracking-wide text-ink-soft">{x(P.stepsToFollow)}</h3>
          <ol className="mt-1 list-decimal space-y-1 ps-5">
            {link.steps.map((s, i) => (
              <li key={i}>{x(s)}</li>
            ))}
          </ol>
          <p className="hint mt-3">{x(P.generatedBy)}</p>
          <div className="mt-4 grid gap-2">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn">
              <ExternalIcon size={18} aria-hidden /> {x(P.openLink)}
            </a>
            <PdfButton make={() => linkPdf(link, x, rtl)} label={x(P.summaryPdf)} filename={`A Posto - ${x(link.label)}`} />
          </div>
        </Modal>
      )}
    </li>
  );
}

/** Selector de ciudad/región: muestra la oficina competente y sus enlaces. Recuerda la elección en el teléfono. */
export function CityDirectory({ storeKey, title, cities, other, extra }: { storeKey: string; title: string; cities: CityEntry[]; other: T9; extra?: ReactNode }) {
  const { x } = useT9();
  const key = `aposto:city:${storeKey}`;
  const [id, setId] = useState(() => {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  });
  const choose = (v: string) => {
    setId(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  };
  const city = cities.find((c) => c.id === id);
  return (
    <section className="card space-y-3" aria-labelledby={`${storeKey}-title`}>
      <h2 id={`${storeKey}-title`} className="flex items-center gap-2 text-lg font-bold">
        <MapPin size={20} className="text-sage" aria-hidden /> {title}
      </h2>
      <label className="block">
        <span className="field-label">{x(P.chooseCity)}</span>
        <select className="input" value={id} onChange={(e) => choose(e.target.value)}>
          <option value="">—</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.city} ({c.region})
            </option>
          ))}
          <option value="other">{x(P.otherCity)}</option>
        </select>
      </label>
      {city && (
        <div className="rise space-y-3" aria-live="polite">
          <p className="alert alert-ok">{x(city.note)}</p>
          <ul className="space-y-2">
            {city.links.map((l) => (
              <LinkWithSummary key={l.id} link={l} />
            ))}
          </ul>
        </div>
      )}
      {id === "other" && <p className="alert alert-info">{x(other)}</p>}
      {extra}
    </section>
  );
}

/** Formulario oficial (PDF italiano, intacto) y, al lado, qué escribir en cada casilla en el idioma de la persona. */
export function OfficialFormCard({ title, italianNote, downloadLabel, url, guideTitle, guidePdfLabel, tips, fields }: { title: string; italianNote: string; downloadLabel: string; url: string; guideTitle: string; guidePdfLabel: string; tips: string; fields: FormField[] }) {
  const { x, rtl } = useT9();
  return (
    <section className="card space-y-4" aria-label={title}>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <FileText size={20} className="text-sage" aria-hidden /> {title}
      </h2>
      <div className="grid gap-4">
        <div className="rounded-2xl border border-line bg-cream p-4" lang="it">
          <p className="text-[15px] text-ink-soft" lang="">
            {italianNote}
          </p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn mt-3" download>
            <Download size={18} aria-hidden /> {downloadLabel}
          </a>
        </div>
        <div>
          <h3 className="font-bold">{guideTitle}</h3>
          <p className="alert alert-info mt-2 text-[14px]">{tips}</p>
          <ol className="mt-3 space-y-3">
            {fields.map((f, i) => (
              <li key={f.box} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-soft text-[13px] font-bold text-sage-dark">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block font-semibold" lang="it">
                    {f.box}
                  </span>
                  <span className="block text-[15px] text-ink-soft">{x(f.explain)}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <PdfButton
              label={guidePdfLabel}
              filename={`A Posto - AA4-8 - ${guideTitle}`}
              make={() => ({ title: `${title} · ${guideTitle}`, subtitle: tips, url, rtl, sections: [{ items: fields.map((f) => `${f.box}: ${x(f.explain)}`), numbered: true }], footer: x(P.generatedBy) })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Lista de puntos con su PDF (p. ej. el folleto para extranjeros resumido en el idioma de la persona). */
export function SummaryCard({ title, items, pdfLabel, source }: { title: string; items: T9[]; pdfLabel: string; source?: ExternalLink }) {
  const { x, rtl } = useT9();
  return (
    <section className="card space-y-3" aria-label={title}>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <FileText size={20} className="text-sage" aria-hidden /> {title}
      </h2>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-[15px]">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
            <span>{x(it)}</span>
          </li>
        ))}
      </ul>
      <PdfButton label={pdfLabel} filename={`A Posto - ${title}`} make={() => ({ title, url: source?.url, rtl, sections: [{ items: items.map(x) }], footer: x(P.generatedBy) })} />
      {source && (
        <ul>
          <LinkWithSummary link={source} />
        </ul>
      )}
    </section>
  );
}

type VideoManifest = Record<string, Partial<Record<VideoSection, boolean>>>;
let manifestPromise: Promise<VideoManifest> | null = null;
function loadManifest(): Promise<VideoManifest> {
  manifestPromise ??= fetch(`${API_URL}/videos/manifest.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? (r.json() as Promise<VideoManifest>) : {}))
    .catch(() => ({}));
  return manifestPromise;
}

/**
 * Vídeo paso a paso de la sección en el idioma de la persona. Sin subtítulos: la narración ya está en su idioma.
 * Si ese vídeo aún no existe, un aviso amable y los pasos escritos de la página.
 */
export function SectionVideo({ section }: { section: VideoSection }) {
  const { lang, x } = useT9();
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- vuelve a comprobar al cambiar de idioma
    setReady(null);
    void loadManifest().then((m) => alive && setReady(Boolean(m[lang]?.[section])));
    return () => {
      alive = false;
    };
  }, [lang, section]);
  const base = `${API_URL}/videos/${lang}/${section}`;
  return (
    <section className="card space-y-3" aria-label={x(V.title)}>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <PlayCircle size={20} className="text-sage" aria-hidden /> {x(V.title)}
      </h2>
      {ready ? (
        <video key={base} src={`${base}.mp4`} poster={`${base}.jpg`} controls playsInline preload="none" className="aspect-video w-full rounded-2xl bg-black" />
      ) : (
        <p className="alert alert-info">{ready === null ? "…" : x(V.soon)}</p>
      )}
    </section>
  );
}
