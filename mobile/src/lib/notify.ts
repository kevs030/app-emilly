import { isNative } from "./supabase";

/** Los avisos de citas usan ids por debajo de este número; las frases del día, desde aquí. */
export const QUOTE_ID_BASE = 2_100_000_000;

export type NotifySettings = { enabled: boolean; daysBefore: number; showTitle: boolean };
export const DEFAULT_NOTIFY: NotifySettings = { enabled: false, daysBefore: 1, showTitle: false };
const KEY = "aposto:notify";

export function loadNotify(): NotifySettings {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<NotifySettings> | null;
    if (!v) return DEFAULT_NOTIFY;
    return { enabled: v.enabled === true, daysBefore: [0, 1, 3, 7].includes(v.daysBefore as number) ? (v.daysBefore as number) : 1, showTitle: v.showTitle === true };
  } catch {
    return DEFAULT_NOTIFY;
  }
}
export function saveNotify(s: NotifySettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export type Planned = { id: number; at: Date; reminderId: number; title: string; daysLeft: number };
type Rem = { id: number; title: string; due_date: string; done: boolean };

/**
 * Qué avisos programar: uno el mismo día a las 9:00 y otro N días antes, también a las 9:00.
 * Solo fechas futuras y citas pendientes. Sin consentimiento (enabled=false) no se programa nada.
 */
export function planNotifications(reminders: Rem[], settings: NotifySettings, now: Date): Planned[] {
  if (!settings.enabled) return [];
  const out: Planned[] = [];
  for (const r of reminders) {
    if (r.done) continue;
    const [y, m, d] = r.due_date.split("-").map(Number);
    const offsets = settings.daysBefore > 0 ? [0, settings.daysBefore] : [0];
    offsets.forEach((days, slot) => {
      const at = new Date(y, m - 1, d - days, 9, 0, 0);
      // id estable y dentro del rango de enteros de 32 bits que exige Android
      if (at.getTime() > now.getTime()) out.push({ id: (r.id % 100_000_000) * 10 + slot, at, reminderId: r.id, title: r.title, daysLeft: days });
    });
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, 48); // iOS admite 64 avisos pendientes: 48 citas + 14 frases del día
}

export type NotifyTexts = { title: string; today: string; soon: string };

/** Pide permiso al sistema. Solo se llama cuando la persona activa los avisos. */
export async function requestNotifyPermission(): Promise<boolean> {
  if (!isNative) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const res = await LocalNotifications.requestPermissions();
  return res.display === "granted";
}

/** Reprograma todos los avisos del teléfono según las citas actuales. */
export async function syncNotifications(reminders: Rem[], settings: NotifySettings, texts: NotifyTexts): Promise<number> {
  if (!isNative) return 0;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const pending = await LocalNotifications.getPending();
  // Solo se tocan los avisos de citas; las frases del día (ids desde QUOTE_ID_BASE) se gestionan aparte.
  const mine = pending.notifications.filter((n) => n.id < QUOTE_ID_BASE);
  if (mine.length) await LocalNotifications.cancel({ notifications: mine.map((n) => ({ id: n.id })) });
  const plan = planNotifications(reminders, settings, new Date());
  if (!plan.length) return 0;
  if ((await LocalNotifications.checkPermissions()).display !== "granted") return 0;
  await LocalNotifications.schedule({
    notifications: plan.map((p) => ({
      id: p.id,
      title: texts.title,
      // Por defecto el aviso no muestra el contenido de la cita: puede verse con el teléfono bloqueado.
      body: (p.daysLeft === 0 ? texts.today : texts.soon) + (settings.showTitle ? ` ${p.title}` : ""),
      schedule: { at: p.at, allowWhileIdle: true },
    })),
  });
  return plan.length;
}
