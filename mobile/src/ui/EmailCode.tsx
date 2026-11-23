import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useLang } from "~/lib/lang";
import { supabase } from "~/lib/supabase";
import { Alert, Field } from "~/ui/kit";

const RECOVERING = "aposto:recovering";
/** Tras el código de recuperación, la sesión abierta debe llevar a «Nueva contraseña», no al inicio. */
export function markRecovering() {
  try {
    sessionStorage.setItem(RECOVERING, "1");
  } catch {
    /* sin almacenamiento */
  }
}
export function isRecovering(): boolean {
  try {
    return sessionStorage.getItem(RECOVERING) === "1";
  } catch {
    return false;
  }
}
export function clearRecovering() {
  try {
    sessionStorage.removeItem(RECOVERING);
  } catch {
    /* sin almacenamiento */
  }
}

/**
 * Código numérico del correo (6 cifras): confirma la cuenta o abre la sesión para cambiar la contraseña,
 * sin depender de que el enlace del correo se abra bien en el navegador del teléfono.
 */
export function EmailCode({ email, kind, onDone }: { email: string; kind: "signup" | "recovery"; onDone: () => void }) {
  const { t } = useLang();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clean = code.replace(/\D/g, "");

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    // Confirmación de registro: Supabase la acepta como «email» o, en proyectos antiguos, como «signup».
    const types = kind === "recovery" ? (["recovery"] as const) : (["email", "signup"] as const);
    let ok = false;
    for (const type of types) {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: clean, type });
      if (!error) {
        ok = true;
        break;
      }
      if (error.status === 429) break;
    }
    setBusy(false);
    if (!ok) return setError(t("codeWrong"));
    if (kind === "recovery") markRecovering();
    onDone();
  }

  return (
    <form onSubmit={verify} className="card space-y-3" noValidate>
      <h2 className="flex items-center gap-2 font-bold">
        <KeyRound size={20} className="text-sage" aria-hidden /> {t("emailCodeTitle")}
      </h2>
      <p className="text-[15px] text-ink-soft">{t("codeHint")}</p>
      <Field label={t("codeLabel")} inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(e) => setCode(e.target.value)} className="input text-center text-2xl tracking-[0.3em]" />
      {error && <Alert kind="error">{error}</Alert>}
      <button className="btn" disabled={busy || clean.length < 6}>
        {busy ? "…" : t("codeVerify")}
      </button>
    </form>
  );
}
