import { QUOTES, quoteIndexFor } from "~/content/modules/motivation";
import type { UiLang } from "./strings";
import { QUOTE_ID_BASE } from "./notify";
import { isNative } from "./supabase";

/** Aviso diario con una frase de ánimo. Solo en este teléfono; apagado hasta que la persona lo activa. */
export type QuoteSettings = { enabled: boolean; time: string };
export const DEFAULT_QUOTE: QuoteSettings = { enabled: false, time: "08:30" };
const KEY = "aposto:quote";
const DAYS = 14; // se programan dos semanas; cada vez que se abre la app se renuevan

export function loadQuoteSettings(): QuoteSettings {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<QuoteSettings> | null;
    if (!v) return DEFAULT_QUOTE;
    return { enabled: v.enabled === true, time: typeof v.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v.time) ? v.time : DEFAULT_QUOTE.time };
  } catch {
    return DEFAULT_QUOTE;
  }
}
export function saveQuoteSettings(s: QuoteSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* sin almacenamiento */
  }
}

export type PlannedQuote = { id: number; at: Date; body: string };

/** Los próximos avisos: uno al día a la hora elegida, con la frase de ese día en el idioma de la persona. */
export function planQuotes(s: QuoteSettings, lang: UiLang, now: Date): PlannedQuote[] {
  if (!s.enabled) return [];
  const [h, m] = s.time.split(":").map(Number);
  const out: PlannedQuote[] = [];
  for (let d = 0; out.length < DAYS && d <= DAYS; d++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, m, 0);
    if (at.getTime() <= now.getTime()) continue;
    out.push({ id: QUOTE_ID_BASE + out.length, at, body: QUOTES[quoteIndexFor(at)][lang] });
  }
  return out;
}

/** Reprograma las frases del día. Devuelve cuántas quedaron programadas, o "denied" sin permiso del sistema. */
export async function syncQuoteNotifications(s: QuoteSettings, lang: UiLang, title: string): Promise<number | "denied"> {
  if (!isNative) return 0;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const pending = await LocalNotifications.getPending();
  const old = pending.notifications.filter((n) => n.id >= QUOTE_ID_BASE && n.id < QUOTE_ID_BASE + 100);
  if (old.length) await LocalNotifications.cancel({ notifications: old.map((n) => ({ id: n.id })) });
  const plan = planQuotes(s, lang, new Date());
  if (!plan.length) return 0;
  if ((await LocalNotifications.checkPermissions()).display !== "granted") return "denied";
  await LocalNotifications.schedule({ notifications: plan.map((p) => ({ id: p.id, title, body: p.body, schedule: { at: p.at, allowWhileIdle: true } })) });
  return plan.length;
}
