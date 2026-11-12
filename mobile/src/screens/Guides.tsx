import { ArrowRight, ExternalLink, FileDown, TriangleAlert } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { documentsFor } from "@/content/documents";
import { getGuide, guides } from "@/content/guides";
import { isStale } from "@/lib/i18n";
import { useLang } from "~/lib/lang";
import { Screen } from "~/ui/kit";

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
  const guide = getGuide(slug);
  if (!guide) return <Navigate to="/guides" replace />;
  const docs = documentsFor(guide.slug);

  return (
    <Screen back>
      <article className="rise space-y-5">
        <header>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight">{c(guide.title)}</h1>
          <p className="mt-2 text-ink-soft">{c(guide.summary)}</p>
        </header>

        <section className="card">
          <h2 className="text-lg font-bold">{t("steps")}</h2>
          <ol className="mt-3 space-y-4">
            {guide.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-deep text-[15px] font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{c(s.title)}</h3>
                  <p className="text-[15px] text-ink-soft">{c(s.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h2 className="text-lg font-bold">{t("documents")}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
            {guide.documents.map((d, i) => (
              <li key={i}>{c(d)}</li>
            ))}
          </ul>
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
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-cream p-3">
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
        <p className="hint">{t("disclaimer")}</p>
      </article>
    </Screen>
  );
}
