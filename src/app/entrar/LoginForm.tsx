"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const L = {
  es: { email: "Correo", phone: "Teléfono", send: "Enviarme el código", code: "Código de 6 dígitos", verify: "Entrar", sent: "Te enviamos un código. Revisa tu correo/SMS.", phoneHint: "Con prefijo internacional, ej. +39 333 1234567", err: "No se pudo completar. Revisa los datos e inténtalo otra vez." },
  en: { email: "Email", phone: "Phone", send: "Send me a code", code: "6-digit code", verify: "Sign in", sent: "We sent you a code. Check your email/SMS.", phoneHint: "With country code, e.g. +39 333 1234567", err: "Something went wrong. Check your details and try again." },
  it: { email: "Email", phone: "Telefono", send: "Inviami il codice", code: "Codice a 6 cifre", verify: "Accedi", sent: "Ti abbiamo inviato un codice.", phoneHint: "Con prefisso, es. +39 333 1234567", err: "Operazione non riuscita. Riprova." },
};

/**
 * Acceso sin contraseña con código de un solo uso (OTP) por correo o SMS.
 * Sin contraseñas = nada que robar ni reutilizar. Supabase limita los intentos
 * y se puede activar CAPTCHA (Turnstile) en el panel. Ver docs/03-arquitectura-y-seguridad.md.
 */
export function LoginForm({ lang }: { lang: "es" | "en" | "it" }) {
  const s = L[lang];
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"ask" | "verify">("ask");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } =
      mode === "email"
        ? await supabase.auth.signInWithOtp({ email: id.trim(), options: { shouldCreateUser: true } })
        : await supabase.auth.signInWithOtp({ phone: id.replace(/\s/g, ""), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) setError(s.err);
    else setStep("verify");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } =
      mode === "email"
        ? await supabase.auth.verifyOtp({ email: id.trim(), token: code.trim(), type: "email" })
        : await supabase.auth.verifyOtp({ phone: id.replace(/\s/g, ""), token: code.trim(), type: "sms" });
    setBusy(false);
    if (error) return setError(s.err);
    router.push("/perfil");
    router.refresh();
  }

  return (
    <div className="card mx-auto max-w-md space-y-4">
      {step === "ask" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <div className="flex gap-2">
            {(["email", "phone"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg border px-3 py-2 ${mode === m ? "border-brand bg-brand-soft" : "border-border"}`}
              >
                {m === "email" ? `✉️ ${s.email}` : `📱 ${s.phone}`}
              </button>
            ))}
          </div>
          <input
            className="input"
            required
            type={mode === "email" ? "email" : "tel"}
            autoComplete={mode === "email" ? "email" : "tel"}
            placeholder={mode === "email" ? "nombre@correo.com" : "+39…"}
            pattern={mode === "phone" ? "\\+[0-9 ]{8,18}" : undefined}
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          {mode === "phone" && <p className="text-xs text-muted">{s.phoneHint}</p>}
          <button className="btn w-full" disabled={busy}>
            {s.send}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-sm">{s.sent}</p>
          <input
            className="input text-center text-2xl tracking-widest"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn w-full" disabled={busy}>
            {s.verify}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-warn-fg">{error}</p>}
    </div>
  );
}
