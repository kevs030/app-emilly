import type { Metadata } from "next";
import Link from "next/link";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";
import { guides } from "@/content/guides";
import { documentsFor } from "@/content/documents";
import { DocumentList } from "@/components/DocumentList";
import { GuideIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Formularios oficiales" };

const L = {
  title: { es: "Formularios y documentos oficiales", en: "Official forms and documents", it: "Moduli e documenti ufficiali" },
  intro: {
    es: "Todos los enlaces llevan a la web del organismo que publica el documento, para que descargues siempre la versión vigente. Son gratuitos: nadie debe cobrarte por un formulario.",
    en: "Every link goes to the website of the body that publishes the document, so you always download the current version. They are free: nobody should charge you for a form.",
    it: "Ogni link porta al sito dell'ente che pubblica il documento. Sono gratuiti: nessuno deve farti pagare un modulo.",
  },
  guide: { es: "Ver la guía paso a paso", en: "See the step-by-step guide", it: "Vedi la guida" },
};

export default async function DocumentsPage() {
  const lang = await getLang();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{tr(L.title, lang)}</h1>
        <p className="mt-2 max-w-2xl text-muted">{tr(L.intro, lang)}</p>
      </header>
      {guides.map((g) => {
        const docs = documentsFor(g.slug);
        if (docs.length === 0) return null;
        return (
          <section key={g.slug} className="card">
            <div className="mb-3 flex items-center gap-3">
              <GuideIcon slug={g.slug} />
              <div>
                <h2 className="font-semibold">{tr(g.title, lang)}</h2>
                <Link href={`/guias/${g.slug}`} className="text-sm text-brand underline">
                  {tr(L.guide, lang)}
                </Link>
              </div>
            </div>
            <DocumentList docs={docs} lang={lang} />
          </section>
        );
      })}
    </div>
  );
}
