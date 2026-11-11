import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { bonuses } from "@/content/bonuses";
import { Sources, Verified } from "@/components/Common";

const L = {
  who: { es: "¿Para quién?", en: "Who is it for?", it: "Per chi?" },
  req: { es: "Requisitos", en: "Requirements", it: "Requisiti" },
  how: { es: "Cómo pedirla", en: "How to apply", it: "Come richiederlo" },
  tip: {
    es: "Los Patronatos y CAF te ayudan GRATIS a pedir estas ayudas y a calcular el ISEE.",
    en: "Patronati and CAF help you apply for these benefits and calculate your ISEE for FREE.",
    it: "Patronati e CAF aiutano GRATIS con domande e ISEE.",
  },
};

export default async function BonusPage() {
  const lang = await getLang();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("navBonus", lang)}</h1>
      <p className="rounded-lg bg-brand-soft p-3 text-sm">💡 {tr(L.tip, lang)}</p>
      {bonuses.map((b) => (
        <section key={b.slug} className="card">
          <h2 className="text-lg font-semibold">{tr(b.name, lang)}</h2>
          <p className="mt-1 font-medium text-brand">{tr(b.amount, lang)}</p>
          <h3 className="mt-3 font-medium">{tr(L.who, lang)}</h3>
          <p className="text-sm">{tr(b.who, lang)}</p>
          <h3 className="mt-3 font-medium">{tr(L.req, lang)}</h3>
          <ul className="list-disc pl-5 text-sm">
            {b.requirements.map((r, i) => (
              <li key={i}>{tr(r, lang)}</li>
            ))}
          </ul>
          <h3 className="mt-3 font-medium">{tr(L.how, lang)}</h3>
          <p className="text-sm">{tr(b.howToApply, lang)}</p>
          <Sources sources={b.sources} lang={lang} />
          <Verified date={b.lastVerified} lang={lang} />
        </section>
      ))}
    </div>
  );
}
