import { App as CapApp } from "@capacitor/app";
import { Fingerprint } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "~/auth/AuthProvider";
import { biometricAsked, biometricAvailable, biometricEnabled, biometricUnlock, markBiometricAsked, setBiometricEnabled, shouldLock } from "~/lib/biometric";
import { useLang } from "~/lib/lang";
import { isNative, supabase } from "~/lib/supabase";
import { Alert } from "./kit";
import { PeopleTogether } from "./People";

/**
 * Solo en el teléfono:
 * - la primera vez, ofrece entrar con huella (o Face ID);
 * - si está activada, pide la huella al abrir la app y al volver tras 2 minutos fuera.
 * En el navegador no hace nada.
 */
export function AppLock({ children }: { children: ReactNode }) {
  if (!isNative) return <>{children}</>;
  return <NativeLock>{children}</NativeLock>;
}

function NativeLock({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const { user } = useAuth();
  const uid = user?.id;
  const [available, setAvailable] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState(() => biometricEnabled(uid));
  const [asked, setAsked] = useState(() => biometricAsked(uid));
  const [unlockedAt, setUnlockedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const backgroundSince = useRef<number | null>(null);
  const autoTried = useRef(false);

  useEffect(() => {
    biometricAvailable().then(setAvailable);
  }, []);

  // Al pasar a segundo plano se apunta la hora; al volver, se decide si bloquear.
  useEffect(() => {
    const h = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) {
        backgroundSince.current = Date.now();
        return;
      }
      if (shouldLock({ enabled: biometricEnabled(uid), unlockedAt: 1, backgroundSince: backgroundSince.current, now: Date.now() })) {
        autoTried.current = false;
        setUnlockedAt(null);
      }
      backgroundSince.current = null;
    });
    return () => {
      h.then((x) => x.remove());
    };
  }, [uid]);

  const texts = { reason: t("bioReason"), cancel: t("cancel"), title: "A Posto" };

  const unlock = useCallback(async () => {
    setError("");
    setBusy(true);
    const r = await biometricUnlock(texts);
    setBusy(false);
    if (r === "ok") setUnlockedAt(Date.now());
    else if (r === "error") setError(t("bioFailed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- los textos solo cambian con el idioma
  }, [t]);

  const locked = shouldLock({ enabled, unlockedAt, backgroundSince: null, now: Date.now() });

  // Al mostrar el bloqueo se abre el diálogo de la huella directamente (una vez).
  useEffect(() => {
    if (locked && !autoTried.current) {
      autoTried.current = true;
      void unlock();
    }
  }, [locked, unlock]);

  if (locked) {
    return (
      <Gate>
        <h1 className="mt-4 text-[28px] font-bold leading-tight">{t("bioLockTitle")}</h1>
        <p className="mt-2 text-ink-soft">{t("bioLockBody")}</p>
        <div className="mt-6 w-full space-y-3">
          {error && <Alert kind="error">{error}</Alert>}
          <button type="button" className="btn" disabled={busy} onClick={unlock}>
            <Fingerprint size={22} aria-hidden /> {t("bioUnlock")}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => supabase.auth.signOut()}>
            {t("bioOtherAccount")}
          </button>
        </div>
      </Gate>
    );
  }

  if (available && uid && !asked && !enabled) {
    async function accept() {
      setError("");
      const r = await biometricUnlock(texts);
      if (r !== "ok") return setError(r === "error" ? t("bioFailed") : "");
      setBiometricEnabled(uid!, true);
      setEnabled(true);
      setAsked(true);
      setUnlockedAt(Date.now());
    }
    return (
      <Gate>
        <span className="icon-tile mt-4" style={{ width: 64, height: 64, borderRadius: 20 }}>
          <Fingerprint size={34} aria-hidden />
        </span>
        <h1 className="mt-4 text-[28px] font-bold leading-tight">{t("bioOfferTitle")}</h1>
        <p className="mt-2 text-ink-soft">{t("bioOfferBody")}</p>
        <div className="mt-6 w-full space-y-3">
          {error && <Alert kind="error">{error}</Alert>}
          <button type="button" className="btn" onClick={accept}>
            {t("bioEnable")}
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              markBiometricAsked(uid);
              setAsked(true);
            }}
          >
            {t("bioNotNow")}
          </button>
        </div>
      </Gate>
    );
  }

  return <>{children}</>;
}

function Gate({ children }: { children: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 text-center">
      <PeopleTogether className="max-w-[300px]" label={t("peopleAlt")} />
      {children}
    </div>
  );
}

/** Interruptor del perfil: activar o desactivar la huella en este teléfono. */
export function BiometricToggle() {
  const { t } = useLang();
  const { user } = useAuth();
  const [available, setAvailable] = useState(false);
  const [on, setOn] = useState(() => biometricEnabled(user?.id));
  const [error, setError] = useState("");

  useEffect(() => {
    biometricAvailable().then(setAvailable);
  }, []);
  if (!available || !user) return null;

  async function toggle() {
    setError("");
    if (on) {
      setBiometricEnabled(user!.id, false);
      return setOn(false);
    }
    const r = await biometricUnlock({ reason: t("bioReason"), cancel: t("cancel"), title: "A Posto" });
    if (r !== "ok") return setError(r === "error" ? t("bioFailed") : "");
    setBiometricEnabled(user!.id, true);
    setOn(true);
  }

  return (
    <section className="card space-y-2">
      <button type="button" role="switch" aria-checked={on} onClick={toggle} className="flex min-h-11 w-full items-center gap-3 text-left">
        <span className="icon-tile">
          <Fingerprint size={22} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{t("bioToggle")}</span>
          <span className="block text-[14px] text-ink-soft">{t("bioToggleHint")}</span>
        </span>
        <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${on ? "bg-terracotta-deep" : "bg-beige"}`} aria-hidden>
          <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
        </span>
      </button>
      {error && <Alert kind="error">{error}</Alert>}
    </section>
  );
}
