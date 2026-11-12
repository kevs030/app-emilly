import { APP } from "@/config/app";
import { PRIVACY_UPDATED, privacyIntro, privacyLabels, privacySections } from "@/content/legal";
import type { Lang } from "@/content/types";
import { tr } from "@/lib/i18n";

/** Texto de la política de privacidad. Lo usan la web y la app para que nunca difieran. */
export function PrivacyContent({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-5">
      <p>{tr(privacyIntro, lang)}</p>
      {privacySections.map((s) => (
        <section key={s.title.es}>
          <h2 className="text-lg font-bold">{tr(s.title, lang)}</h2>
          <ul className="mt-2 list-disc space-y-2 ps-5 text-[15px]">
            {s.items.map((x) => (
              <li key={x.es}>{tr(x, lang)}</li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h2 className="text-lg font-bold">{tr(privacyLabels.controller, lang)}</h2>
        {APP.legalName && APP.contactEmail ? (
          <p className="mt-2 text-[15px]">
            {APP.legalName} · {tr(privacyLabels.contact, lang)}: <a href={`mailto:${APP.contactEmail}`}>{APP.contactEmail}</a>
          </p>
        ) : (
          <p className="mt-2 text-[15px]">{tr(privacyLabels.pending, lang)}</p>
        )}
      </section>
      <p className="text-[13px] opacity-70">
        {tr(privacyLabels.updated, lang)} {PRIVACY_UPDATED}
      </p>
    </div>
  );
}
