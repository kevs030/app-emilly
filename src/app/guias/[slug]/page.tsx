import { notFound } from "next/navigation";
import Link from "next/link";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { getGuide, guides } from "@/content/guides";
import { videos } from "@/content/videos";
import { Sources, Verified, VideoEmbed } from "@/components/Common";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage(props: PageProps<"/guias/[slug]">) {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const lang = await getLang();
  const related = videos.filter((v) => guide.videoIds?.includes(v.youtubeId));

  return (
    <article className="space-y-5">
      <Link href="/guias" className="text-sm text-brand">
        ← {t("navGuides", lang)}
      </Link>
      <header>
        <div className="text-4xl">{guide.icon}</div>
        <h1 className="mt-1 text-2xl font-bold">{tr(guide.title, lang)}</h1>
        <p className="mt-2 text-muted">{tr(guide.summary, lang)}</p>
      </header>

      <section className="card">
        <h2 className="text-lg font-semibold">{t("steps", lang)}</h2>
        <ol className="mt-3 space-y-4">
          {guide.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white dark:text-black">
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
