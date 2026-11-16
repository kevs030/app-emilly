import { ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { bonuses } from "@/content/bonuses";
import { useLang } from "~/lib/lang";
import { Screen } from "~/ui/kit";

/** Ayudas públicas: el mismo contenido verificado de la web, con su fuente y fecha de revisión. */
export function Benefits() {
  const { t, c, contentFallback } = useLang();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash]);

  return (
    <Screen title={t("benefits")} back>
      <p className="text-[15px] text-ink-soft">{t("benefitsLead")}</p>
      {contentFallback && <p className="mt-3 rounded-xl bg-beige p-3 text-[14px]">{t("notTranslated")}</p>}
      <ul className="mt-4 space-y-4">
        {bonuses.map((b) => (
          <li key={b.slug} id={b.slug} className="card scroll-mt-4 space-y-3">
            <h2 className="text-lg font-bold">{c(b.name)}</h2>
            <dl className="space-y-3 text-[15px]">
              <div>
                <dt className="text-[13px] font-semibold text-terracotta-deep">{t("amount")}</dt>
                <dd>{c(b.amount)}</dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold text-terracotta-deep">{t("whoFor")}</dt>
                <dd>{c(b.who)}</dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold text-terracotta-deep">{t("requirements")}</dt>
                <dd>
                  <ul className="list-disc space-y-1 ps-5">
                    {b.requirements.map((r, i) => (
                      <li key={i}>{c(r)}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold text-terracotta-deep">{t("howApply")}</dt>
                <dd>{c(b.howToApply)}</dd>
              </div>
            </dl>
            <div className="border-t border-beige pt-3">
              <p className="text-[13px] font-semibold">{t("sources")}</p>
              <ul className="mt-1 space-y-1">
                {b.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 text-[15px] font-medium text-terracotta-deep underline">
                      <ExternalLink size={16} className="shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1">{s.title}</span>
                      {s.official && <span className="shrink-0 rounded-full bg-sage-soft px-2 py-0.5 text-[12px] no-underline">{t("official")}</span>}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[13px] text-ink-soft">
                {t("checkedOn")} {b.lastVerified}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[13px] text-ink-soft">{t("disclaimer")}</p>
    </Screen>
  );
}
