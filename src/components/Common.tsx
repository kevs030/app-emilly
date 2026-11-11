import type { Lang, Source } from "@/content/types";
import { isStale, t } from "@/lib/i18n";

export function Sources({ sources, lang }: { sources: Source[]; lang: Lang }) {
  return (
    <div className="mt-4 text-sm">
      <h3 className="font-semibold">{t("sources", lang)}</h3>
      <ul className="mt-1 space-y-1">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">
              {s.title}
            </a>{" "}
            {s.official && (
              <span className="rounded bg-brand-soft px-1.5 py-0.5 text-xs text-brand">{t("official", lang)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Verified({ date, lang }: { date: string; lang: Lang }) {
  return (
    <div className="mt-3 text-xs text-muted">
      {t("verified", lang)} {date}
      {isStale(date) && <p className="mt-1 rounded bg-warn-bg p-2 text-warn-fg">⚠️ {t("stale", lang)}</p>}
    </div>
  );
}

const CC_LANG: Record<Lang, string> = { es: "es", en: "en", it: "it" };

/**
 * Reproductor oficial de YouTube en modo privacidad (youtube-nocookie).
 * No descargamos ni volvemos a subir videos: así respetamos los derechos de autor.
 * cc_load_policy + cc_lang_pref piden a YouTube los subtítulos en el idioma del usuario.
 */
export function VideoEmbed({ id, title, lang }: { id: string; title: string; lang: Lang }) {
  const params = new URLSearchParams({ cc_load_policy: "1", cc_lang_pref: CC_LANG[lang], hl: CC_LANG[lang], rel: "0" });
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?${params}`}
        title={title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
