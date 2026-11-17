import { Compass, Hand, ShieldAlert } from "lucide-react";
import { useLang } from "~/lib/lang";
import type { StringKey } from "~/lib/strings";
import { Illustration, type IllustrationName } from "./Illustration";

/**
 * «Cómo funciona»: al entrar por primera vez en cada función, una tarjeta explica
 * para qué sirve, cómo se usa y lo importante. Se cierra con «Entendido» y se vuelve
 * a abrir desde el botón «?» de la cabecera.
 */
export const HELP = {
  guides: "tramites",
  benefits: "ayudas",
  assistant: "asistente",
  map: "mapa",
  appointments: "citas",
  documents: "documentos",
  scan: "traductor",
  community: "comunidad",
  notifications: "citas",
  file: "privacidad",
  simulator: "ayudas",
  profile: "privacidad",
} as const satisfies Record<string, IllustrationName>;
export type HelpId = keyof typeof HELP;

const key = (id: HelpId) => `aposto:help:${id}`;
export function helpHidden(id: HelpId): boolean {
  try {
    return localStorage.getItem(key(id)) === "hidden";
  } catch {
    return false;
  }
}
export function setHelpHidden(id: HelpId, hidden: boolean) {
  try {
    if (hidden) localStorage.setItem(key(id), "hidden");
    else localStorage.removeItem(key(id));
  } catch {
    /* sin almacenamiento: la tarjeta volverá a aparecer, no pasa nada */
  }
}

export function ScreenHelp({ id, onClose }: { id: HelpId; onClose: () => void }) {
  const { t } = useLang();
  const rows = [
    { icon: Compass, label: t("helpWhat"), text: t(`help_${id}_what` as StringKey) },
    { icon: Hand, label: t("helpHow"), text: t(`help_${id}_how` as StringKey) },
    { icon: ShieldAlert, label: t("helpImportant"), text: t(`help_${id}_imp` as StringKey) },
  ];
  return (
    <section className="help-card rise mb-5 space-y-4 rounded-3xl border border-beige bg-white p-4" aria-labelledby={`help-${id}`}>
      <Illustration name={HELP[id]} />
      <h2 id={`help-${id}`} className="text-lg font-bold">
        {t("helpTitle")}
      </h2>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-3">
            <span className="icon-tile" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <r.icon size={20} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold uppercase tracking-wide text-ink-soft">{r.label}</span>
              <span className="block text-[15px]">{r.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        {t("helpGotIt")}
      </button>
    </section>
  );
}
