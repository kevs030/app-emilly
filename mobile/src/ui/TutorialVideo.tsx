import { PlayCircle } from "lucide-react";
import { useState } from "react";
import { useLang } from "~/lib/lang";
import { API_URL } from "~/lib/supabase";

/**
 * Vídeo «Cómo se usa A Posto» (1 min, voz y subtítulos en español).
 * Vive en la web (/video/…) y no se descarga hasta que la persona pulsa «reproducir»: ahorra datos.
 * Ya no aparece al entrar (portada ni guía de inicio): está en Perfil, detrás de un botón.
 */
export function TutorialVideo({ className = "", collapsed = false }: { className?: string; collapsed?: boolean }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(!collapsed);
  const base = `${API_URL}/video/tutorial-es`;
  if (!open)
    return (
      <button type="button" className={`btn btn-secondary ${className}`} onClick={() => setOpen(true)} data-testid="tutorial-open">
        <PlayCircle size={18} aria-hidden /> {t("tutorialTitle")}
      </button>
    );
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
