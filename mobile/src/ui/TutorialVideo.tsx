import { PlayCircle } from "lucide-react";
import { useLang } from "~/lib/lang";
import { API_URL } from "~/lib/supabase";

/**
 * Vídeo «Cómo se usa A Posto» (1 min, voz y subtítulos en español).
 * Vive en la web (/video/…) y no se descarga hasta que la persona pulsa «reproducir»: ahorra datos.
 */
export function TutorialVideo({ className = "" }: { className?: string }) {
  const { t, lang } = useLang();
  const base = `${API_URL}/video/tutorial-es`;
  return (
    <figure className={`card space-y-3 ${className}`}>
      <figcaption className="flex items-start gap-3">
        <span className="icon-tile">
          <PlayCircle size={22} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{t("tutorialTitle")}</span>
          <span className="block text-[14px] text-ink-soft">{t("tutorialHint")}</span>
          {lang !== "es" && <span className="block text-[13px] text-ink-soft">{t("tutorialLangNote")}</span>}
        </span>
      </figcaption>
      <video src={`${base}.mp4`} poster={`${base}.jpg`} controls playsInline preload="none" width={300} height={649} className="mx-auto block w-full max-w-[300px] rounded-3xl bg-black">
        <track kind="captions" src={`${base}.vtt`} srcLang="es" label="Español" />
      </video>
    </figure>
  );
}
