import { ArrowRight, ExternalLink, FileText, HandCoins, ListChecks, Search as SearchIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "~/lib/lang";
import { usePersonal } from "~/lib/personal";
import { search, type SearchKind } from "~/lib/search";
import { CONTENT_LANG, type StringKey } from "~/lib/strings";
import { Screen } from "~/ui/kit";

const KIND: Record<SearchKind, { icon: typeof FileText; label: StringKey }> = {
  guide: { icon: ListChecks, label: "kindGuide" },
  benefit: { icon: HandCoins, label: "kindBenefit" },
  form: { icon: FileText, label: "kindForm" },
};

/** Buscador global: trámites, ayudas y formularios oficiales del contenido verificado. */
export function Search() {
  const { t, lang } = useLang();
  const { log } = usePersonal();
  const id = useId();
  const [q, setQ] = useState("");
  const results = useMemo(() => search(q, CONTENT_LANG[lang]), [q, lang]);
  const typed = q.trim().length >= 2;

  return (
    <Screen title={t("searchTitle")} back>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor={id} className="sr-only">
          {t("searchPlaceholder")}
        </label>
        <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft rtl:left-auto rtl:right-4" aria-hidden />
        <input id={id} type="search" autoFocus enterKeyHint="search" className="input pl-12 rtl:pl-4 rtl:pr-12" placeholder={t("searchPlaceholder")} maxLength={80} value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      <div className="mt-4" aria-live="polite">
        {!typed && <p className="text-[15px] text-ink-soft">{t("searchHint")}</p>}
        {typed && results.length === 0 && <p className="card text-ink-soft">{t("searchEmpty")}</p>}
        {results.length > 0 && (
          <ul className="space-y-3">
            {results.map((r) => {
              const Icon = KIND[r.kind].icon;
              const body = (
                <>
                  <span className="icon-tile shrink-0">
                    <Icon size={20} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-terracotta-deep">{t(KIND[r.kind].label)}</span>
                    <span className="block font-semibold">{r.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[14px] text-ink-soft">{r.snippet}</span>
                  </span>
                  {r.href ? <ExternalLink size={18} className="mt-1 shrink-0 text-terracotta" aria-hidden /> : <ArrowRight size={20} className="mt-1 shrink-0 text-terracotta rtl:rotate-180" aria-hidden />}
                </>
              );
              return (
                <li key={`${r.kind}:${r.id}`}>
                  {r.href ? (
                    <a href={r.href} target="_blank" rel="noopener noreferrer" className="card flex gap-3" onClick={() => log("document_open", r.id)}>
                      {body}
                    </a>
                  ) : (
                    <Link to={r.to!} className="card flex gap-3">
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Screen>
  );
}
