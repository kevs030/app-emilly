import { Check, Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { redirectUrl, supabase } from "~/lib/supabase";
import { COUNTRIES, isEmail, passwordIssues, toE164 } from "~/lib/validation";
import { Alert, Field, PasswordField, Screen } from "~/ui/kit";
import { PhoneCode } from "./PhoneCode";

type Step = "form" | "email-sent" | "phone-code";

/** Registro y acceso. Dos caminos independientes: correo + contraseña, o teléfono + código SMS. */
export function Auth() {
  const { t } = useLang();
  const { phoneLoginEnabled } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "signin" ? "signin" : "signup";
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dial, setDial] = useState("+39");
  const [national, setNational] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const issues = passwordIssues(password);
  const phone = toE164(dial, national);

  function fail(message: string | undefined, status?: number) {
    if (status === 429 || /rate limit|too many/i.test(message ?? "")) return setError(t("tooMany"));
    if (/not confirmed/i.test(message ?? "")) return setError(t("notConfirmed"));
    if (/invalid login/i.test(message ?? "")) return setError(t("badLogin"));
    setError(t("generic"));
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isEmail(email)) return setError(t("invalidEmail"));
    setBusy(true);
    if (mode === "signup") {
      if (issues.length) return setBusy(false);
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectUrl("/") } });
      setBusy(false);
      // Misma respuesta exista o no la cuenta: así nadie puede averiguar qué correos están registrados.
      if (error && error.status !== 422) return fail(error.message, error.status);
      setStep("email-sent");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (error) return fail(error.message, error.status);
      navigate("/", { replace: true });
    }
  }

  async function sendSms(): Promise<boolean> {
    if (!phone) return false;
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    if (error) fail(error.message, error.status);
    return !error;
  }

  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone) return setError(t("invalidPhone"));
    setBusy(true);
    const ok = await sendSms();
    setBusy(false);
    if (ok) setStep("phone-code");
  }

  async function resendEmail() {
    setInfo("");
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: redirectUrl("/") } });
    if (error) return fail(error.message, error.status);
    setInfo(t("checkEmailBody"));
  }

  if (step === "email-sent") {
    return (
      <Screen back>
        <div className="rise space-y-4">
          <span className="icon-tile">
            <Mail size={22} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold">{t("checkEmailTitle")}</h1>
          <p className="text-ink-soft">{t("checkEmailBody")}</p>
          <p className="font-semibold">{email}</p>
          {error && <Alert kind="error">{error}</Alert>}
          {info && <Alert kind="ok">{info}</Alert>}
          <button type="button" className="btn btn-secondary" onClick={resendEmail}>
            {t("resend")}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => setStep("form")}>
            {t("back")}
          </button>
        </div>
      </Screen>
    );
  }

  if (step === "phone-code" && phone) {
    return (
      <Screen>
        <PhoneCode phone={phone} type="sms" resend={sendSms} onBack={() => setStep("form")} onDone={() => navigate("/", { replace: true })} />
      </Screen>
    );
  }

  return (
    <Screen back title={mode === "signup" ? t("signUp") : t("signIn")}>
      <div className="rise space-y-5">
        <div className="segmented" role="tablist">
          {(["email", "phone"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={method === m}
              onClick={() => {
                setMethod(m);
                setError("");
              }}
            >
              {m === "email" ? <Mail size={18} aria-hidden /> : <Smartphone size={18} aria-hidden />}
              {t(m)}
            </button>
          ))}
        </div>

        {method === "email" ? (
          <form onSubmit={submitEmail} className="space-y-4" noValidate>
            <Field label={t("email")} type="email" autoComplete="email" inputMode="email" autoCapitalize="none" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <PasswordField label={t("password")} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode === "signup" && (
              <>
                <ul className="space-y-1 text-[15px]" aria-live="polite">
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
                <label className="flex items-start gap-3 text-[15px]">
                  <input type="checkbox" required className="mt-1 h-5 w-5 accent-[#A65D3D]" />{" "}
                  <span>
                    {t("age")}{" "}
                    <Link to="/privacy" className="font-semibold text-brown underline">
                      {t("privacyPolicy")}
                    </Link>
                  </span>
                </label>
              </>
            )}
            {error && <Alert kind="error">{error}</Alert>}
            <button className="btn" disabled={busy || !email || !password || (mode === "signup" && issues.length > 0)}>
              {busy ? "…" : mode === "signup" ? t("signUp") : t("signIn")}
            </button>
            {mode === "signin" && (
              <Link to="/reset" className="btn btn-quiet">
                {t("forgot")}
              </Link>
            )}
          </form>
        ) : !phoneLoginEnabled ? (
          <Alert kind="ok">{t("phoneOff")}</Alert>
        ) : (
          <form onSubmit={submitPhone} className="space-y-4" noValidate>
            <div>
              <label className="field-label" htmlFor="dial">
                {t("country")}
              </label>
              <select id="dial" className="input" value={dial} onChange={(e) => setDial(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.dial}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
            </div>
            <Field label={t("phoneNumber")} type="tel" inputMode="tel" autoComplete="tel-national" required value={national} onChange={(e) => setNational(e.target.value)} />
            {mode === "signup" && (
              <label className="flex items-start gap-3 text-[15px]">
                <input type="checkbox" required className="mt-1 h-5 w-5 accent-[#A65D3D]" />{" "}
                  <span>
                    {t("age")}{" "}
                    <Link to="/privacy" className="font-semibold text-brown underline">
                      {t("privacyPolicy")}
                    </Link>
                  </span>
              </label>
            )}
            {error && <Alert kind="error">{error}</Alert>}
            <button className="btn" disabled={busy || !national}>
              {busy ? "…" : t("sendCode")}
            </button>
          </form>
        )}

        <button type="button" className="btn btn-quiet" onClick={() => setParams({ mode: mode === "signup" ? "signin" : "signup" })}>
          {mode === "signup" ? t("toSignIn") : t("toSignUp")}
        </button>
      </div>
    </Screen>
  );
}
