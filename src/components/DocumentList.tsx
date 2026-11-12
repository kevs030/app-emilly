import { ExternalLink, FileDown, PenLine } from "lucide-react";
import type { Lang, OfficialDocument } from "@/content/types";
import { tr } from "@/lib/i18n";

const L = {
  download: { es: "Descargar PDF", en: "Download PDF", it: "Scarica PDF" },
  open: { es: "Abrir web oficial", en: "Open official site", it: "Apri sito ufficiale" },
  fill: { es: "Para rellenar", en: "To fill in", it: "Da compilare" },
  checked: { es: "Enlace comprobado el", en: "Link checked on", it: "Link verificato il" },
};

/** Lista de formularios y documentos oficiales. Los enlaces van siempre a la web del organismo. */
export function DocumentList({ docs, lang }: { docs: OfficialDocument[]; lang: Lang }) {
  return (
    <ul className="space-y-3">
      {docs.map((d) => (
        <li key={d.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
          <span className="icon-tile">{d.kind === "pdf" ? <FileDown size={20} aria-hidden /> : <ExternalLink size={20} aria-hidden />}</span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {tr(d.title, lang)}{" "}
              {d.fillable && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 align-middle text-xs font-semibold text-brand">
                  <PenLine size={12} aria-hidden /> {tr(L.fill, lang)}
                </span>
              )}
            </p>
            <p className="text-sm text-muted">{tr(d.description, lang)}</p>
            <p className="mt-1 text-xs text-muted">
              {d.issuer} · {tr(L.checked, lang)} {d.lastVerified}
            </p>
          </div>
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn-ghost shrink-0 text-sm">
            {d.kind === "pdf" ? tr(L.download, lang) : tr(L.open, lang)}
          </a>
        </li>
      ))}
    </ul>
  );
}
