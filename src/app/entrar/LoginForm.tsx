"use client";

import { Mail, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const L = {
  es: {
    email: "Correo",
    phone: "Teléfono",
    emailLabel: "Tu correo",
    phoneLabel: "Tu número de teléfono",
    phoneHint: "Con prefijo internacional, por ejemplo +39 333 1234567",
    sendLink: "Enviarme el enlace para entrar",
    sendCode: "Enviarme el código por SMS",
    sentTitle: "Revisa tu correo",
    sent: "Te enviamos un correo con un botón para entrar. Si no lo ves, mira en Spam.",
    codeLabel: "Código de 6 dígitos que recibiste por SMS",
    verify: "Entrar",
    again: "Cambiar",
    err: "No se pudo enviar. Revisa los datos o inténtalo dentro de unos minutos.",
    codeErr: "El código no es correcto o ya caducó.",
    linkErr: "El enlace no es válido o ya caducó. Pide uno nuevo.",
    phoneSoon: "El acceso con número de teléfono estará disponible pronto.",
    age: "Tengo 14 años o más.",
  },
  en: {
    email: "Email",
    phone: "Phone",
    emailLabel: "Your email",
    phoneLabel: "Your phone number",
    phoneHint: "With country code, for example +39 333 1234567",
    sendLink: "Email me a sign-in link",
    sendCode: "Text me a code",
    sentTitle: "Check your email",
    sent: "We sent you an email with a button to sign in. If you can't find it, check Spam.",
    codeLabel: "6-digit code you received by SMS",
    verify: "Sign in",
    again: "Change",
    err: "Couldn't send. Check your details or try again in a few minutes.",
    codeErr: "The code is wrong or has expired.",
    linkErr: "The link is invalid or has expired. Request a new one.",
    phoneSoon: "Sign-in with a phone number will be available soon.",
    age: "I am 14 or older.",
  },
  it: {
    email: "Email",
    phone: "Telefono",
    emailLabel: "La tua email",
    phoneLabel: "Il tuo numero di telefono",
    phoneHint: "Con prefisso internazionale, ad esempio +39 333 1234567",
    sendLink: "Inviami il link per accedere",
    sendCode: "Inviami il codice via SMS",
    sentTitle: "Controlla la tua email",
    sent: "Ti abbiamo inviato un'email con un pulsante per accedere. Controlla anche lo spam.",
    codeLabel: "Codice a 6 cifre ricevuto via SMS",
    verify: "Accedi",
    again: "Cambia",
    err: "Invio non riuscito. Controlla i dati o riprova tra qualche minuto.",
    codeErr: "Codice errato o scaduto.",
    linkErr: "Il link non è valido o è scaduto. Richiedine uno nuovo.",
    phoneSoon: "L'accesso con numero di telefono sarà disponibile a breve.",
    age: "Ho almeno 14 anni.",
  },
};

/**
 * Acceso sin contraseña: enlace por correo o código por SMS (Supabase Auth).
 * La pestaña de teléfono solo se activa si el proyecto de Supabase tiene un proveedor de SMS.
 */
export function LoginForm({ lang, linkError, phoneEnabled }: { lang: "es" | "en" | "it"; linkError?: boolean; phoneEnabled: boolean }) {
  const s = L[lang];
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"ask" | "sent">("ask");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(linkError ? s.linkErr : "");

  const phone = id.replace(/[\s()-]/g, "");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } =
      mode === "email"
        ? await supabase.auth.signInWithOtp({ email: id.trim(), options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/confirm` } })
        : await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) setError(s.err);
    else setStep("sent");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.verifyOtp({ phone, token: code.trim(), type: "sms" });
    setBusy(false);
    if (error) return setError(s.codeErr);
    router.push("/perfil");
    router.refresh();
  }

  function reset() {
    setStep("ask");
    setCode("");
    setError("");
  }

  return (
    <div className="card pop mx-auto max-w-md space-y-4">
      {step === "ask" && (
        <form onSubmit={send} className="space-y-4">
          <div className="grid grid-cols-2 gap-2" role="tablist">
            {(["email", "phone"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={`chip justify-center py-2.5 ${mode === m ? "chip-on" : ""}`}
                onClick={() => {
                  setMode(m);
                  setId("");
                  setError("");
                }}
              >
                {m === "email" ? <Mail size={16} aria-hidden /> : <Smartphone size={16} aria-hidden />}
                {m === "email" ? s.email : s.phone}
              </button>
            ))}
          </div>

          {mode === "phone" && !phoneEnabled ? (
            <p className="rounded-xl bg-brand-soft p-3 text-sm">{s.phoneSoon}</p>
          ) : (
            <>
              <label className="block text-sm font-medium">
                {mode === "email" ? s.emailLabel : s.phoneLabel}
                <input
                  className="input mt-1"
                  required
                  type={mode === "email" ? "email" : "tel"}
                  autoComplete={mode === "email" ? "email" : "tel"}
                  placeholder={mode === "email" ? "nombre@correo.com" : "+39 333 1234567"}
                  pattern={mode === "phone" ? "\\+[0-9 ()\\-]{8,20}" : undefined}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
                {mode === "phone" && <span className="mt-1 block text-xs font-normal text-muted">{s.phoneHint}</span>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" required /> {s.age}
              </label>
              <button className="btn w-full" disabled={busy}>
                {busy ? "…" : mode === "email" ? s.sendLink : s.sendCode}
              </button>
            </>
          )}
        </form>
      )}

      {step === "sent" && mode === "email" && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail size={20} className="text-brand" aria-hidden /> {s.sentTitle}
          </h2>
          <p className="text-sm">{s.sent}</p>
          <p className="text-sm font-medium">{id}</p>
          <button type="button" className="text-sm text-brand underline" onClick={reset}>
            {s.again}
          </button>
        </div>
      )}

      {step === "sent" && mode === "phone" && (
        <form onSubmit={verify} className="space-y-3">
          <label className="block text-sm font-medium">
            {s.codeLabel}
            <input
              className="input mt-1 text-center text-2xl tracking-[0.4em]"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <button className="btn w-full" disabled={busy}>
            {busy ? "…" : s.verify}
          </button>
          <button type="button" className="text-sm text-brand underline" onClick={reset}>
            {s.again}
          </button>
        </form>
      )}

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
