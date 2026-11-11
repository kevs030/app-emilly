import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { topics, videos } from "@/content/videos";
import { VideoEmbed } from "@/components/Common";

export default async function VideosPage() {
  const lang = await getLang();
  const tl = lang === "en" ? "en" : "es";
  const byTopic = Object.entries(topics).map(([key, label]) => ({
    key,
    label: label[tl],
    items: videos.filter((v) => v.topic === key).sort((a, b) => Number(b.official) - Number(a.official)),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("navVideos", lang)}</h1>
      <p className="text-sm text-muted">{t("subtitlesNote", lang)}</p>
      {byTopic.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.key}>
              <h2 className="text-lg font-semibold">{g.label}</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {g.items.map((v) => (
                  <div key={v.youtubeId}>
                    <VideoEmbed id={v.youtubeId} title={v.title} lang={lang} />
                    <p className="mt-1 text-sm font-medium">{v.title}</p>
                    <p className="text-xs text-muted">
                      {v.channel} · {v.durationMin} min · {v.official ? `✅ ${t("official", lang)}` : t("community", lang)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}
