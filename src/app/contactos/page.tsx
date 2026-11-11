import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { directory, directoryCategories } from "@/content/directory";

const L = {
  soon: {
    es: "Muy pronto: abogados de extranjería, dentistas y médicos verificados (solo profesionales inscritos en su colegio profesional y que acepten aparecer aquí).",
    en: "Coming soon: verified immigration lawyers, dentists and doctors (only professionals registered with their professional body who agree to be listed).",
    it: "Presto: avvocati, dentisti e medici verificati (solo iscritti all'Ordine e con consenso).",
  },
  free: { es: "Gratis", en: "Free", it: "Gratis" },
};

export default async function DirectoryPage() {
  const lang = await getLang();
  const cl = lang === "en" ? "en" : "es";
  const cats = Object.entries(directoryCategories).filter(([k]) => directory.some((d) => d.category === k && d.verified));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("navDirectory", lang)}</h1>
      {cats.map(([key, label]) => (
        <section key={key}>
          <h2 className="text-lg font-semibold">{label[cl]}</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {directory
              .filter((d) => d.category === key && d.verified)
              .map((d) => (
                <div key={d.id} className="card">
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="mt-1 text-sm text-muted">{tr(d.description, lang)}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {d.phone && (
                      <a className="btn py-1" href={`tel:${d.phone.replace(/\s/g, "")}`}>
                        📞 {d.phone}
                      </a>
                    )}
                    {d.url && (
                      <a className="rounded-lg border border-border px-3 py-1" href={d.url} target="_blank" rel="noopener noreferrer">
                        🌐 Web
                      </a>
                    )}
                    {d.free && <span className="self-center text-xs text-brand">{tr(L.free, lang)}</span>}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
      <p className="rounded-lg bg-brand-soft p-3 text-sm">🔜 {tr(L.soon, lang)}</p>
    </div>
  );
}
