import { useEffect, useState } from "react";
import { useLang } from "~/lib/lang";
import { supabase } from "~/lib/supabase";
import { Alert } from "~/ui/kit";

const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/**
 * Paso 2 del acceso por teléfono: escribir el código del SMS.
 * - Reenvío bloqueado 60 s (evita abuso y costes de SMS).
 * - Tras 5 códigos incorrectos hay que pedir uno nuevo.
 * El servidor aplica además sus propios límites y la caducidad del código.
 */
export function PhoneCode({ phone, type, onDone, onBack, resend }: { phone: string; type: "sms" | "phone_change"; onDone: () => void; onBack: () => void; resend: () => Promise<boolean> }) {
  const { t } = useLang();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const locked = attempts >= MAX_ATTEMPTS;

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (locked || busy) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type });
    setBusy(false);
    if (error) {
      setAttempts((a) => a + 1);
      setCode("");
      return setError(attempts + 1 >= MAX_ATTEMPTS ? t("codeLocked") : t("badCode"));
    }
    onDone();
  }

  async function again() {
    setError("");
    const ok = await resend();
    if (!ok) return setError(t("tooMany"));
    setAttempts(0);
    setCode("");
    setWait(RESEND_SECONDS);
  }

  return (
    <form onSubmit={verify} className="rise space-y-4">
      <h2 className="text-xl font-bold">{t("codeTitle")}</h2>
      <p className="text-ink-soft">
        {t("codeBody")} <strong className="text-ink">{phone}</strong>. {t("codeExpires")}
      </p>
      <input
        className="input text-center text-2xl tracking-[0.5em]"
        aria-label={t("codeTitle")}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        disabled={locked}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      />
      {error && <Alert kind="error">{error}</Alert>}
      <button className="btn" disabled={busy || locked || code.length !== 6}>
        {t("verify")}
      </button>
      <button type="button" className="btn btn-quiet" disabled={wait > 0} onClick={again}>
        {wait > 0 ? `${t("resendIn")} ${wait} s` : t("resend")}
      </button>
      <button type="button" className="btn btn-quiet" onClick={onBack}>
        {t("back")}
      </button>
    </form>
  );
}
