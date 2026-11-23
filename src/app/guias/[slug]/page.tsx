import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bell, CheckSquare, Download, FileDown } from "lucide-react";
import { stageOf } from "@/content/journey";
import { GUIDE_ART, PageArt } from "@/components/PageArt";
import Link from "next/link";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { getGuide, guides } from "@/content/guides";
import { videos } from "@/content/videos";
import { Sources, Verified, VideoEmbed } from "@/components/Common";
import { documentsFor } from "@/content/documents";
import { DocumentList } from "@/components/DocumentList";
import { GuideIcon } from "@/components/Icons";

/** Título y descripción propios de cada trámite: lo que lee Google y lo que se ve al compartir el enlace. */
const APPCTA = {
  title: { es: "Haz este trámite con la app, gratis", en: "Do this procedure with the app, for free", it: "Fai questa pratica con l'app, gratis" },
  a: { es: "Marca cada paso y cada documento", en: "Tick off each step and document", it: "Segna ogni passo e documento" },
  b: { es: "Recordatorios de tus citas y plazos", en: "Reminders for your appointments and deadlines", it: "Promemoria per appuntamenti e scadenze" },
  c: { es: "Tus PDFs guardados, también sin internet", en: "Your PDFs saved, even offline", it: "I tuoi PDF salvati, anche senza internet" },
  cta: { es: "Descargar A Posto (Android y iPhone)", en: "Get A Posto (Android and iPhone)", it: "Scarica A Posto (Android e iPhone)" },
};

export async function generateMetadata(props: PageProps<"/guias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const lang = await getLang();
  const title = tr(guide.title, lang);
  const description = tr(guide.summary, lang).slice(0, 158);
  return { title, description, alternates: { canonical: `/guias/${slug}` }, openGraph: { title, description, type: "article" } };
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage(props: PageProps<"/guias/[slug]">) {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const lang = await getLang();
  const related = videos.filter((v) => guide.videoIds?.includes(v.youtubeId));
  const docs = documentsFor(guide.slug);
  const stage = stageOf(guide.slug);
  const docsTitle = lang === "en" ? "Official forms and documents" : lang === "it" ? "Moduli e documenti ufficiali" : "Formularios y documentos oficiales";

  return (
    <article className="space-y-5">
      {GUIDE_ART[guide.slug] && <PageArt name={GUIDE_ART[guide.slug]} priority />}
      <Link href="/guias" className="text-sm text-brand">
        ← {t("navGuides", lang)}
      </Link>
      <header>
        <GuideIcon slug={guide.slug} size={24} />
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{tr(guide.title, lang)}</h1>
        <p className="mt-2 text-muted">{tr(guide.summary, lang)}</p>
        {stage && <p className="mt-2 text-sm font-medium text-brand">{tr(stage.title, lang)}</p>}
      </header>

      {/* La web informa; seguir el trámite (avances, recordatorios, PDF sin internet) se hace en la app. */}
      <section className="app-card relative overflow-hidden rounded-[20px] p-5 text-white" aria-label={tr(APPCTA.title, lang)} data-testid="guide-app-cta">
        <p className="relative z-10 text-lg font-bold">{tr(APPCTA.title, lang)}</p>
        <ul className="relative z-10 mt-2 space-y-1 text-sm text-white/90">
          <li className="flex items-center gap-2"><CheckSquare size={16} aria-hidden /> {tr(APPCTA.a, lang)}</li>
          <li className="flex items-center gap-2"><Bell size={16} aria-hidden /> {tr(APPCTA.b, lang)}</li>
          <li className="flex items-center gap-2"><FileDown size={16} aria-hidden /> {tr(APPCTA.c, lang)}</li>
        </ul>
        <Link href="/descargar" className="btn relative z-10 mt-4 !border-white !bg-white !text-[var(--ap-sage-dark)] sm:w-auto">
          <Download size={18} aria-hidden /> {tr(APPCTA.cta, lang)}
        </Link>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t("steps", lang)}</h2>
        <ol className="mt-3 space-y-4">
          {guide.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{tr(s.title, lang)}</h3>
                <p className="text-sm text-muted">{tr(s.body, lang)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">📎 {t("documents", lang)}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {guide.documents.map((d, i) => (
            <li key={i}>{tr(d, lang)}</li>
          ))}
        </ul>
        {guide.costs && (
          <>
            <h2 className="mt-4 text-lg font-semibold">💶 {t("costs", lang)}</h2>
            <p className="mt-1 text-sm">{tr(guide.costs, lang)}</p>
          </>
        )}
      </section>

      {guide.extra && (
        <section className="card border-brand">
          <h2 className="text-lg font-semibold">{tr(guide.extra.title, lang)}</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
            {guide.extra.items.map((x, i) => (
              <li key={i}>{tr(x, lang)}</li>
            ))}
          </ul>
        </section>
      )}

      {docs.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">{docsTitle}</h2>
          <DocumentList docs={docs} lang={lang} />
        </section>
      )}

      {guide.warnings && (
        <section className="space-y-2">
          {guide.warnings.map((w, i) => (
            <p key={i} className="rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">
              ⚠️ {tr(w, lang)}
            </p>
          ))}
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">🎬 {t("navVideos", lang)}</h2>
          <p className="text-xs text-muted">{t("subtitlesNote", lang)}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {related.map((v) => (
              <div key={v.youtubeId}>
                <VideoEmbed id={v.youtubeId} title={v.title} lang={lang} />
                <p className="mt-1 text-sm">
                  {v.title} · <span className="text-muted">{v.channel}</span>{" "}
                  <span className="text-xs">{v.official ? `✅ ${t("official", lang)}` : t("community", lang)}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <Sources sources={guide.sources} lang={lang} />
        <Verified date={guide.lastVerified} lang={lang} />
      </section>
      <p className="text-xs text-muted">{t("disclaimer", lang)}</p>
    </article>
  );
}
