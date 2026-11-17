import { CircleCheckBig, Clapperboard, ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { adStatus, claimAd, openSponsor, startAd, type AdStart, type AdStatus } from "~/lib/ads";
import { useLang } from "~/lib/lang";
import { Alert } from "./kit";

type Phase = { kind: "idle" } | { kind: "loading" } | { kind: "watching"; ad: AdStart; left: number } | { kind: "claiming" } | { kind: "done" } | { kind: "error"; message: string };

/**
 * «Ver un anuncio = 1 pregunta». Solo aparece si el servidor tiene anuncios y premios disponibles hoy.
 * El anuncio se muestra a pantalla completa con una cuenta atrás; al terminar, el servidor comprueba
 * el tiempo y suma la pregunta. Cerrar antes no da premio.
 */
export function RewardedAd({ onCredits, variant = "button", fallback = null }: { onCredits: (credits: number | null) => void; variant?: "button" | "row"; fallback?: ReactNode }) {
  const { t } = useLang();
  const [status, setStatus] = useState<AdStatus | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  // El saldo nuevo se entrega al cerrar el aviso de «gracias», para no desmontar la pantalla antes de tiempo.
  const [earned, setEarned] = useState<number | null | undefined>(undefined);

  const refresh = useCallback(() => void adStatus().then(setStatus), []);
  useEffect(refresh, [refresh]);

  // Cuenta atrás mientras se ve el anuncio
  useEffect(() => {
    if (phase.kind !== "watching" || phase.left <= 0) return;
    const id = setTimeout(() => setPhase({ ...phase, left: phase.left - 1 }), 1000);
    return () => clearTimeout(id);
  }, [phase]);

  async function begin() {
    setPhase({ kind: "loading" });
    const r = await startAd();
    if (!r.ok) return setPhase({ kind: "error", message: t(r.error === "daily_limit" ? "adLimit" : "adUnavailable") });
    setPhase({ kind: "watching", ad: r.data, left: r.data.seconds });
  }

  async function claim(token: string) {
    setPhase({ kind: "claiming" });
    const r = await claimAd(token);
    if (!r.ok) return setPhase({ kind: "error", message: t(r.error === "daily_limit" ? "adLimit" : "adUnavailable") });
    setEarned(r.data.credits);
    setPhase({ kind: "done" });
  }

  function close() {
    setPhase({ kind: "idle" });
    if (earned !== undefined) {
      onCredits(earned);
      setEarned(undefined);
    }
    refresh();
  }

  if (!status && phase.kind === "idle") return <>{fallback}</>;

  const trigger =
    variant === "row" ? (
      <button type="button" onClick={begin} disabled={!status || phase.kind === "loading"} className="flex w-full items-center gap-3 rounded-2xl bg-sage-soft p-3 text-left">
        <span className="icon-tile" style={{ background: "var(--white)" }}>
          <Clapperboard size={20} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{t("adWatch")}</span>
          {status && <span className="block text-[13px] text-ink-soft">{t("adLeftToday").replace("{n}", String(status.left))}</span>}
        </span>
      </button>
    ) : (
      <button type="button" onClick={begin} disabled={!status || phase.kind === "loading"} className="flex min-h-11 items-center gap-1 rounded-full bg-sage-soft px-3 text-[14px] font-semibold">
        <Clapperboard size={16} aria-hidden /> {t("adWatchShort")}
      </button>
    );

  return (
    <>
      {trigger}
      {phase.kind === "error" && (
        <div className="w-full">
          <Alert kind="error">{phase.message}</Alert>
        </div>
      )}
      {(phase.kind === "watching" || phase.kind === "claiming" || phase.kind === "done") && (
        <div role="dialog" aria-modal="true" aria-labelledby="ad-title" className="safe-top safe-bottom fixed inset-0 z-50 flex flex-col bg-cream px-6">
          <div className="flex items-center justify-between pt-3">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">{t("adLabel")}</p>
            <button type="button" onClick={close} aria-label={t("close")} className="flex h-11 w-11 items-center justify-center rounded-full bg-beige">
              <X size={20} aria-hidden />
            </button>
          </div>
          {phase.kind === "watching" && (
            <div className="flex flex-1 flex-col justify-center gap-4">
              <h2 id="ad-title" className="text-[28px] font-bold leading-tight">
                {phase.ad.sponsor.title}
              </h2>
              <p className="text-lg text-ink-soft">{phase.ad.sponsor.body}</p>
              <button type="button" onClick={() => void openSponsor(phase.ad.sponsor.id)} className="btn btn-secondary">
                {phase.ad.sponsor.cta} <ExternalLink size={18} aria-hidden />
              </button>
            </div>
          )}
          {phase.kind === "done" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <CircleCheckBig size={56} className="text-sage-dark" aria-hidden />
              <h2 id="ad-title" className="text-[26px] font-bold">
                {t("adThanks")}
              </h2>
              <p className="text-ink-soft">{t("adThanksBody")}</p>
            </div>
          )}
          <div className="pb-4">
            {phase.kind === "watching" &&
              (phase.left > 0 ? (
                <div className="space-y-2" aria-live="polite">
                  <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={phase.ad.seconds} aria-valuenow={phase.ad.seconds - phase.left} aria-label={t("adWaiting")}>
                    <span style={{ width: `${((phase.ad.seconds - phase.left) / phase.ad.seconds) * 100}%` }} />
                  </div>
                  <p className="text-center text-[15px] text-ink-soft">{t("adCountdown").replace("{n}", String(phase.left))}</p>
                </div>
              ) : (
                <button type="button" className="btn" onClick={() => void claim(phase.ad.token)}>
                  {t("adClaim")}
                </button>
              ))}
            {phase.kind === "claiming" && (
              <button type="button" className="btn" disabled>
                …
              </button>
            )}
            {phase.kind === "done" && (
              <button type="button" className="btn" onClick={close}>
                {t("adBackToChat")}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
