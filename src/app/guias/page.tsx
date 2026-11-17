import Link from "next/link";
import { GuideThumb, PageArt } from "@/components/PageArt";
import { SearchX } from "lucide-react";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { guides } from "@/content/guides";
import { AdSlot } from "@/components/AdSlot";

const L = {
  results: { es: "Resultados para", en: "Results for", it: "Risultati per" },
  none: { es: "No encontramos trámites con esas palabras. Prueba con otra, por ejemplo «permiso», «sanidad» o «código fiscal».", en: "No procedures match those words. Try another, for example “permit”, “health” or “tax code”.", it: "Nessuna pratica con queste parole. Prova con un'altra, per esempio «permesso», «sanità» o «codice fiscale»." },
  all: { es: "Ver todos los trámites", en: "See all procedures", it: "Vedi tutte le pratiche" },
};

/** Sin mayúsculas ni tildes: «Código» y «codigo» coinciden. */
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const lang = await getLang();
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const words = norm(q).split(/\s+/).filter((w) => w.length > 1);
  // Busca en el título y el resumen en todos los idiomas: quien escribe en otro idioma también encuentra su trámite.
  const list = words.length
    ? guides.filter((g) => {
        const text = norm([g.slug, ...Object.values(g.title), ...Object.values(g.summary)].join(" "));
        return words.every((w) => text.includes(w));
      })
    : guides;
  return (
    <div>
      <PageArt name="tramites" priority />
      <h1 className="mt-5 text-3xl font-bold tracking-tight">{t("navGuides", lang)}</h1>
      {q && (
        <p className="mt-2 text-muted" role="status">
          {tr(L.results, lang)} «{q}»: {list.length}
        </p>
      )}
      {list.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((g) => (
            <Link key={g.slug} href={`/guias/${g.slug}`} className="card card-link flex flex-col overflow-hidden !p-0">
              <GuideThumb slug={g.slug} className="aspect-[16/7]" />
              <span className="p-5">
                <span className="block font-semibold">{tr(g.title, lang)}</span>
                <span className="mt-1 block text-sm text-muted">{tr(g.summary, lang)}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card mt-4 flex gap-3">
          <SearchX size={22} className="mt-0.5 shrink-0 text-sage" aria-hidden />
          <div>
            <p>{tr(L.none, lang)}</p>
            <Link href="/guias" className="link mt-2 inline-flex min-h-11 items-center font-medium">
              {tr(L.all, lang)}
            </Link>
          </div>
        </div>
      )}
      <div className="mt-6">
        <AdSlot placement="guias" lang={lang} />
      </div>
    </div>
  );
}
