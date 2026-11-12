import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "~/lib/lang";
import { redirectUrl, supabase } from "~/lib/supabase";
import { isEmail, passwordIssues } from "~/lib/validation";
import { Alert, Field, PasswordField, Screen } from "~/ui/kit";

/** Pedir el enlace de recuperación. La respuesta es la misma exista o no la cuenta. */
export function ResetPassword() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isEmail(email)) return setError(t("invalidEmail"));
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl("/new-password") });
    setBusy(false);
    if (error?.status === 429) return setError(t("tooMany"));
    setSent(true);
  }

  return (
    <Screen back title={t("resetTitle")}>
      <form onSubmit={submit} className="rise space-y-4" noValidate>
        <p className="text-ink-soft">{t("resetBody")}</p>
        <Field label={t("email")} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <Alert kind="error">{error}</Alert>}
        {sent && <Alert kind="ok">{t("resetSent")}</Alert>}
        <button className="btn" disabled={busy || !email}>
          {busy ? "…" : t("resetSend")}
        </button>
      </form>
    </Screen>
  );
}

/** Crear la contraseña nueva. Solo funciona con la sesión que abre el enlace del correo. */
export function NewPassword() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const issues = passwordIssues(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (issues.length) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.status === 429 ? t("tooMany") : t("generic"));
    navigate("/", { replace: true });
  }

  return (
    <Screen title={t("newPassword")}>
      <form onSubmit={submit} className="rise space-y-4" noValidate>
        <PasswordField label={t("newPassword")} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <ul className="space-y-1 text-[15px]">
          {(
            [
              ["short", "pwShort"],
              ["letters", "pwLetters"],
              ["digits", "pwDigits"],
            ] as const
          ).map(([issue, key]) => {
            const ok = password.length > 0 && !issues.includes(issue);
            return (
              <li key={issue} className={`flex items-center gap-2 ${ok ? "text-[#3d5238]" : "text-ink-soft"}`}>
                <Check size={16} className={ok ? "opacity-100" : "opacity-30"} aria-hidden /> {t(key)}
              </li>
            );
          })}
        </ul>
        {error && <Alert kind="error">{error}</Alert>}
        <button className="btn" disabled={busy || issues.length > 0}>
          {busy ? "…" : t("savePassword")}
        </button>
      </form>
    </Screen>
  );
}
