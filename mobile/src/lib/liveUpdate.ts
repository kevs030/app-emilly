import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { useSyncExternalStore } from "react";
import { API_URL } from "./supabase";

/**
 * Actualizaciones en vivo (alojadas en nuestra propia web, sin servicios externos ni estadísticas).
 * Al abrir la app y al volver a ella: consulta /app-update/latest.json; si el contenido publicado es distinto
 * del instalado, lo descarga en segundo plano (comprobando su SHA-256) y se aplica la próxima vez que se abra.
 * Si el paquete necesita un APK más nuevo, no se instala: se muestra «Nueva versión disponible».
 */
export type Manifest = { hash: string; url: string; checksum: string; minNative: number; apk?: { versionCode: number; versionName: string; url: string } };

let needsApk: Manifest["apk"] | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Aviso de APK nuevo (solo cuando el cambio no puede llegar en vivo). */
export function useApkUpdate() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => needsApk,
  );
}

/** Decide qué hacer con el manifiesto publicado. Pura: se prueba sin teléfono. */
export function plan(m: Manifest, own: { hash: string; native: number }): "none" | "download" | "apk" {
  if (!m?.hash || !m.url) return "none";
  if (m.minNative > own.native) return "apk";
  if (m.hash === own.hash) return "none";
  return "download";
}

async function ownHash(): Promise<string> {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}live-version.json`, { cache: "no-store" });
    return ((await r.json()) as { hash: string }).hash;
  } catch {
    return "";
  }
}

/** Paquete ya descargado y listo: se aplica en cuanto la persona sale de la app (no tiene que cerrarla del todo). */
let ready: string | null = null;

let checking = false;
let lastCheck = 0;
async function check() {
  if (checking || Date.now() - lastCheck < 30 * 60_000) return;
  checking = true;
  lastCheck = Date.now();
  try {
    const res = await fetch(`${API_URL}/app-update/latest.json`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return;
    const m = (await res.json()) as Manifest;
    const native = Number((await App.getInfo()).build) || 0;
    const what = plan(m, { hash: await ownHash(), native });
    if (what === "apk") {
      needsApk = m.apk ?? { versionCode: m.minNative, versionName: "", url: "/descargar" };
      emit();
      return;
    }
    if (what !== "download") return;
    // ¿Ya descargado en una apertura anterior? Entonces solo se programa.
    const { bundles } = await CapacitorUpdater.list();
    let bundle = bundles.find((b) => b.version === m.hash && b.status === "success");
    if (!bundle) bundle = await CapacitorUpdater.download({ url: new URL(m.url, API_URL).toString(), version: m.hash, checksum: m.checksum });
    await CapacitorUpdater.next({ id: bundle.id }); // por si el sistema cierra la app: se aplica al volver a abrirla
    ready = bundle.id;
    // Limpieza: borra paquetes viejos que ya no se usarán (deja el actual y el próximo).
    const current = (await CapacitorUpdater.current()).bundle.id;
    for (const b of bundles) if (b.id !== current && b.id !== bundle.id && b.id !== "builtin") await CapacitorUpdater.delete({ id: b.id }).catch(() => {});
  } catch {
    // Sin conexión o servidor caído: se reintenta en la próxima apertura. La app sigue funcionando igual.
  } finally {
    checking = false;
  }
}

export function initLiveUpdates() {
  if (!Capacitor.isNativePlatform()) return;
  // Confirma que esta versión arrancó bien; si una actualización fallara al arrancar, el complemento vuelve sola a la anterior.
  void CapacitorUpdater.notifyAppReady().catch(() => {});
  void check();
  void App.addListener("resume", () => void check());
  // Al salir de la app (botón de inicio, otra app), si hay un paquete listo se aplica en ese momento:
  // al volver, la persona ya ve la versión nueva sin tener que cerrar la app del todo.
  void App.addListener("pause", () => {
    if (ready) void CapacitorUpdater.set({ id: ready }).catch(() => {});
  });
}
