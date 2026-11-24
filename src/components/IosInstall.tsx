"use client";

import { Check, Copy, Ellipsis, ExternalLink, Share, Smartphone, SquarePlus, ToggleRight } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

/**
 * Instalar A Posto en iPhone/iPad como app web (PWA), con el método estándar de iOS:
 * Safari → Compartir → Añadir a pantalla de inicio. iOS no tiene un botón web que instale solo,
 * así que aquí no se descarga nada: se detecta la situación y se explican los pasos.
 */
export type IosInstallText = {
  button: string;
  open: string;
  steps: string[];
  moreHint: string;
  installed: string;
  inApp: string;
  copy: string;
  copied: string;
  other: string;
};

type Where = "unknown" | "safari" | "inapp" | "installed" | "other";
const IN_APP: [RegExp, string][] = [
  [/CriOS/, "Chrome"], [/FxiOS/, "Firefox"], [/EdgiOS/, "Edge"], [/OPiOS|OPT\//, "Opera"],
  [/Instagram/, "Instagram"], [/FBAN|FBAV|FB_IAB/, "Facebook"], [/Line\//, "LINE"], [/GSA\//, "Google"],
  [/Snapchat/, "Snapchat"], [/musical_ly|BytedanceWebview/, "TikTok"], [/Twitter/, "X"], [/LinkedInApp/, "LinkedIn"], [/Telegram/, "Telegram"],
];

export function detectIos(ua: string, touchPoints: number, standalone: boolean): { where: Where; app?: string } {
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1);
  if (!ios) return { where: "other" };
  if (standalone) return { where: "installed" };
  const hit = IN_APP.find(([re]) => re.test(ua));
  return hit ? { where: "inapp", app: hit[1] } : { where: "safari" };
}

const noop = () => () => {};
function useWhere() {
  const key = useSyncExternalStore(
    noop,
    () => {
      const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia?.("(display-mode: standalone)").matches;
      const r = detectIos(navigator.userAgent, navigator.maxTouchPoints || 0, standalone);
      return `${r.where}|${r.app ?? ""}`;
    },
    () => "unknown|",
  );
  const [where, app] = key.split("|") as [Where, string];
  return { where, app };
}

const ICONS = [Smartphone, Share, SquarePlus, ToggleRight, Check];

export function IosInstall({ t }: { t: IosInstallText }) {
  const { where, app } = useWhere();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/app`);
      setCopied(true);
    } catch {
      /* sin portapapeles: el enlace se ve escrito debajo */
    }
  };

  if (where === "installed")
    return (
      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-brand-soft p-4 font-medium" role="status" data-testid="ios-installed">
        <Check size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {t.installed}
      </p>
    );

  return (
    <div className="mt-4" data-testid="ios-install" data-where={where}>
      <button type="button" className="btn" aria-expanded={open} aria-controls="ios-steps" onClick={() => setOpen(!open)} data-testid="ios-install-btn">
        <Smartphone size={18} aria-hidden /> {t.button}
      </button>
      {open && (
        <div id="ios-steps" className="mt-4 space-y-4">
          {where === "inapp" && (
            <div className="rounded-2xl bg-warn-bg p-4 text-sm text-warn-fg" role="alert" data-testid="ios-inapp">
              <p className="font-semibold">{t.inApp.replace("{app}", app || "esta app")}</p>
              <button type="button" onClick={copy} className="btn-ghost mt-3 inline-flex">
                {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copied ? t.copied : t.copy}
              </button>
              <p className="mt-2 break-all text-muted">apostoapp.app/app</p>
            </div>
          )}
          {where === "other" && <p className="rounded-2xl bg-[var(--background-alt)] p-4 text-sm" data-testid="ios-other">{t.other}</p>}
          <ol className="space-y-3" data-testid="ios-steps">
            {t.steps.map((step, i) => {
              const Icon = ICONS[i] ?? Check;
              return (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 pt-1.5 text-sm">
                    <Icon size={18} className="me-1.5 inline align-[-3px] text-brand" aria-hidden />
                    {step}
                    {i === 0 && (
                      <span className="mt-3 block">
                        <a href="/app" className="btn !w-auto" data-testid="ios-open-app">
                          <ExternalLink size={16} aria-hidden /> {t.open}
                        </a>
                      </span>
                    )}
                    {i === 2 && (
                      <span className="mt-1 block text-muted">
                        <Ellipsis size={16} className="me-1 inline align-[-3px]" aria-hidden />
                        {t.moreHint}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
