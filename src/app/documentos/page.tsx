import type { Metadata } from "next";
import { PageArt } from "@/components/PageArt";
import Link from "next/link";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/i18n";
import { guides } from "@/content/guides";
import { documentsFor } from "@/content/documents";
import { DocumentList } from "@/components/DocumentList";
import { GuideIcon } from "@/components/Icons";
import { AppGate } from "@/components/AppGate";

export const metadata: Metadata = { title: "Formularios oficiales" };

const L = {
  title: { es: "Formularios y documentos oficiales", en: "Official forms and documents", it: "Moduli e documenti ufficiali" },
  intro: {
    es: "Aquí ves qué formularios oficiales necesita cada trámite. En la app los descargas de la web del organismo (siempre la versión vigente) y te explicamos qué escribir en cada casilla. Son gratuitos: nadie debe cobrarte por un formulario.",
    en: "Here you can see which official forms each procedure needs. In the app you download them from the issuing body's website (always the current version) and we explain what to write in each box. They are free: nobody should charge you for a form.",
    it: "Qui vedi quali moduli ufficiali servono per ogni pratica. Nell'app li scarichi dal sito dell'ente (sempre la versione aggiornata) e ti spieghiamo cosa scrivere in ogni casella. Sono gratuiti: nessuno deve farti pagare un modulo.",
  },
  guide: { es: "Ver la guía paso a paso", en: "See the step-by-step guide", it: "Vedi la guida" },
};

export default async function DocumentsPage() {
  const lang = await getLang();
  return (
    <div className="space-y-6">
      <PageArt name="documentos" priority />
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{tr(L.title, lang)}</h1>
        <p className="mt-2 max-w-2xl text-muted">{tr(L.intro, lang)}</p>
      </header>
      <AppGate lang={lang} />
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
            <DocumentList docs={docs} lang={lang} locked />
          </section>
        );
      })}
    </div>
  );
}
