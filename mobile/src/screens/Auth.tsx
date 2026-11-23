import { Check, Mail, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { suggestEmail } from "~/lib/emailTypos";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { redirectUrl, supabase } from "~/lib/supabase";
import { COUNTRIES, isEmail, passwordIssues, toE164 } from "~/lib/validation";
import { EmailCode } from "~/ui/EmailCode";
import { clearPendingSignup, knownEmail, pendingSignup, setPendingSignup } from "~/lib/rememberAccount";
import { Alert, Field, PasswordField, Screen } from "~/ui/kit";
import { useCaptcha } from "~/ui/Captcha";
import { PhoneCode } from "./PhoneCode";

type Step = "form" | "email-sent" | "phone-code";

export type AuthMode = "signup" | "signin";

/** Pantalla propia de acceso (/auth): la misma tarjeta que la portada, con botón de volver. */
export function Auth() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const mode: AuthMode = params.get("mode") === "signin" ? "signin" : "signup";
  return (
    <Screen back title={mode === "signup" ? t("signUp") : t("signIn")}>
      <AuthForm mode={mode} setMode={(m) => setParams({ mode: m })} />
    </Screen>
  );
}

/**
 * Registro y acceso. Dos caminos independientes: correo + contraseña, o teléfono + código SMS.
 * Al crear la cuenta, el correo o el número se verifican antes de poder entrar.
 * Los campos llevan `autocomplete` para que el teléfono o el navegador ofrezcan guardar la contraseña.
 */
export function AuthForm({ mode, setMode, hideSwitch = false }: { mode: AuthMode; setMode: (m: AuthMode) => void; hideSwitch?: boolean }) {
  const { t } = useLang();
  const { phoneLoginEnabled } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"email" | "phone">("email");
  // Si la app se cerró a mitad del registro, se vuelve a la pantalla del código; si ya hay cuenta en este teléfono, el correo va escrito.
  const [step, setStep] = useState<Step>(() => (mode === "signup" && pendingSignup() ? "email-sent" : "form"));
  const [email, setEmail] = useState(() => pendingSignup() ?? knownEmail() ?? "");
  const [password, setPassword] = useState("");
  const [dial, setDial] = useState("+39");
  const [national, setNational] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);
  // Espera antes de poder pedir otro correo (Supabase admite uno cada 60 s)
  const [wait, setWait] = useState(0);
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);
  const suggestion = method === "email" ? suggestEmail(email) : null;

  const issues = passwordIssues(password);
  const captcha = useCaptcha();
  const phone = toE164(dial, national);

  function fail(message: string | undefined, status?: number) {
    if (status === 429 || /rate limit|too many/i.test(message ?? "")) return setError(t("tooMany"));
    // Cuenta sin confirmar: se ofrece reenviar el correo (registrarse otra vez gastaría los enlaces anteriores).
    if (/not confirmed/i.test(message ?? "")) {
      setNeedsConfirm(true);
      return setError(t("notConfirmed"));
    }
    if (/invalid login/i.test(message ?? "")) return setError(t("badLogin"));
    setError(t("generic"));
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsConfirm(false);
    if (!isEmail(email)) return setError(t("invalidEmail"));
    setBusy(true);
    if (mode === "signup") {
      if (issues.length) return setBusy(false);
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectUrl("/"), captchaToken: captcha.token } });
      captcha.reset();
      setBusy(false);
      // Misma respuesta exista o no la cuenta: así nadie puede averiguar qué correos están registrados.
      if (error && error.status !== 422) return fail(error.message, error.status);
      setWait(60);
      setPendingSignup(email);
      setStep("email-sent");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password, options: { captchaToken: captcha.token } });
      captcha.reset();
      setBusy(false);
      if (error) return fail(error.message, error.status);
      navigate("/", { replace: true });
    }
  }

  async function sendSms(): Promise<boolean> {
    if (!phone) return false;
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true, captchaToken: captcha.token } });
    captcha.reset();
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
    setWait(60);
    if (error) return fail(error.message, error.status);
    setInfo(t("checkEmailBody"));
  }

  if (step === "email-sent") {
    return (
      <div className="rise space-y-4">
        <span className="icon-tile">
          <Mail size={22} aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">{t("checkEmailTitle")}</h1>
        <p className="text-ink-soft">{t("checkEmailBody")}</p>
        <p className="break-all rounded-xl border border-line bg-white px-4 py-3 text-lg font-semibold">{email}</p>
        <EmailCode email={email} kind="signup" onDone={() => navigate("/", { replace: true })} />
        {error && <Alert kind="error">{error}</Alert>}
        {info && <Alert kind="ok">{info}</Alert>}
        <section className="alert alert-info space-y-1.5" aria-labelledby="not-arrived">
          <h2 id="not-arrived" className="font-bold">
            {t("notArrivedTitle")}
          </h2>
          <p>• {t("notArrived1")}</p>
          <p className="break-words">• {t("notArrived2")}</p>
          <p>• {t("notArrived3")}</p>
          <p className="font-semibold">• {t("notArrived4")}</p>
        </section>
        <button type="button" className="btn btn-secondary" onClick={resendEmail} disabled={wait > 0}>
          {wait > 0 ? `${t("resendIn")} ${wait} s` : t("resend")}
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            clearPendingSignup();
            setStep("form");
          }}
        >
          {t("wrongEmail")}
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            clearPendingSignup();
            setMode("signin");
            setStep("form");
          }}
        >
          {t("alreadyConfirmed")}
        </button>
      </div>
    );
  }

  if (step === "phone-code" && phone) {
    return <PhoneCode phone={phone} type="sms" resend={sendSms} onBack={() => setStep("form")} onDone={() => navigate("/", { replace: true })} />;
  }

  return (
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
          <Field label={t("email")} placeholder={t("emailPh")} type="email" autoComplete="username" inputMode="email" autoCapitalize="none" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {suggestion && (
            <p className="alert alert-info flex flex-wrap items-center gap-x-2" role="status">
              <span className="min-w-0 break-all">
                {t("didYouMean")} <strong>{suggestion}</strong>?
              </span>
              <button type="button" className="min-h-11 font-semibold text-terracotta-hover underline" onClick={() => setEmail(suggestion)}>
                {t("useThis")}
              </button>
            </p>
          )}
          <PasswordField label={t("password")} placeholder={t("passwordPh")} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="hint -mt-2">{t("pwSaveHint")}</p>
          {mode === "signup" && (
            <>
              <ul className="space-y-1 text-[15px]" aria-live="polite">
                {(
                  [
                    ["short", "pwShort"],
                    ["letters", "pwLetters"],
                    ["digits", "pwDigits"],
                    ["symbols", "pwSymbols"],
                  ] as const
                ).map(([issue, key]) => {
                  const ok = password.length > 0 && !issues.includes(issue);
                  return (
                    <li key={issue} className={`flex items-center gap-2 ${ok ? "text-sage-dark" : "text-ink-soft"}`}>
                      <Check size={16} className={ok ? "opacity-100" : "opacity-30"} aria-hidden /> {t(key)}
                    </li>
                  );
                })}
              </ul>
              <label className="flex items-start gap-3 text-[15px]">
                <input type="checkbox" required className="mt-1 h-5 w-5 accent-terracotta-deep" />{" "}
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
          {needsConfirm && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                setError("");
                setNeedsConfirm(false);
                await resendEmail();
                setStep("email-sent");
              }}
            >
              {t("resendConfirm")}
            </button>
          )}
          {captcha.node}
          <button className="btn" disabled={busy || !captcha.ready || !email || !password || (mode === "signup" && issues.length > 0)}>
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
              <input type="checkbox" required className="mt-1 h-5 w-5 accent-terracotta-deep" />{" "}
              <span>
                {t("age")}{" "}
                <Link to="/privacy" className="font-semibold text-brown underline">
                  {t("privacyPolicy")}
                </Link>
              </span>
            </label>
          )}
          {error && <Alert kind="error">{error}</Alert>}
          {captcha.node}
          <button className="btn" disabled={busy || !captcha.ready || !national}>
            {busy ? "…" : t("sendCode")}
          </button>
        </form>
      )}

      {!hideSwitch && (
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError("");
          }}
        >
          {mode === "signup" ? t("toSignIn") : t("toSignUp")}
        </button>
      )}
    </div>
  );
}
