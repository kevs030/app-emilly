import { ListChecks } from "lucide-react";
import { A31, COURTS } from "~/content/modules/art31";
import { AA48_FIELDS, CF, CF_LINKS, LEAFLET } from "~/content/modules/codiceFiscale";
import { CITIES, REQUIREMENTS, T, TUPASSI, ZEROCODA } from "~/content/modules/tessera";
import { VIDEO_FOR_GUIDE } from "~/content/modules/videos";
import { CityDirectory, LinkWithSummary, OfficialFormCard, SectionVideo, SummaryCard, useT9 } from "./ModuleBlocks";
import { ArrowRight, IdCard } from "lucide-react";
import { Link } from "react-router-dom";
import { PS } from "~/content/modules/permitStatus";

/**
 * Bloques extra de los trámites con más dudas (Tessera sanitaria, Codice fiscale, Art. 31).
 * Todo cambia de idioma al momento con el selector de la app.
 */
export function GuideExtras({ slug }: { slug: string }) {
  const { x } = useT9();
  const video = VIDEO_FOR_GUIDE[slug];
  return (
    <>
      {(slug === "permesso-di-soggiorno" || slug === "articolo-31" || slug === "permesso-ue-lungo-periodo") && (
        <Link to="/permit-status" className="card flex items-center gap-3 border-terracotta/40" data-testid="guide-permit-status">
          <span className="icon-tile shrink-0">
            <IdCard size={22} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{x(PS.title)}</span>
            <span className="block text-[14px] text-ink-soft">{x(PS.cardBody)}</span>
          </span>
          <ArrowRight size={20} className="shrink-0 text-terracotta rtl:rotate-180" aria-hidden />
        </Link>
      )}
      {slug === "sanidad-tessera-sanitaria" && (
        <>
          <section className="card" aria-labelledby="tessera-req">
            <h2 id="tessera-req" className="flex items-center gap-2 text-lg font-bold">
              <ListChecks size={20} className="text-sage" aria-hidden /> {x(T.reqTitle)}
            </h2>
            <ul className="mt-3 space-y-2">
              {REQUIREMENTS.map((r, i) => (
                <li key={i} className="flex gap-2 text-[15px]">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                  <span>{x(r)}</span>
                </li>
              ))}
            </ul>
          </section>
          <CityDirectory
            storeKey="tessera"
            title={x(T.bookingTitle)}
            cities={CITIES}
            other={T.regional}
            extra={
              <div className="space-y-2 border-t border-line pt-3">
                <p className="alert alert-info text-[14px]">{x(T.regional)}</p>
                <h3 className="font-bold">{x(T.systemsTitle)}</h3>
                <ul className="space-y-2">
                  <LinkWithSummary link={ZEROCODA} />
                  <LinkWithSummary link={TUPASSI} />
                </ul>
              </div>
            }
          />
        </>
      )}
      {slug === "codice-fiscale" && (
        <>
          <OfficialFormCard
            title={x(CF.formTitle)}
            italianNote={x(CF.formItalian)}
            downloadLabel={x(CF.download)}
            url={CF_LINKS[0].url}
            guideTitle={x(CF.guideTitle)}
            guidePdfLabel={x(CF.guidePdf)}
            tips={x(CF.tips)}
            fields={AA48_FIELDS}
          />
          <SummaryCard title={x(CF.leafletTitle)} items={LEAFLET} pdfLabel={x(CF.leafletPdf)} source={CF_LINKS[2]} />
          <section className="card">
            <ul className="space-y-2">
              <LinkWithSummary link={CF_LINKS[1]} />
            </ul>
          </section>
        </>
      )}
      {slug === "articolo-31" && (
        <CityDirectory
          storeKey="art31"
          title={x(A31.courtTitle)}
          cities={COURTS}
          other={A31.otherCity}
          extra={
            <div className="space-y-2 border-t border-line pt-3 text-[15px]">
              <p>{x(A31.how)}</p>
              <p>{x(A31.docs)}</p>
              <p className="alert alert-info text-[14px]">{x(A31.cost)}</p>
            </div>
          }
        />
      )}
      {video && <SectionVideo section={video} />}
    </>
  );
}
