"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const L = {
  es: {
    email: "Tu correo",
    send: "Enviarme el enlace para entrar",
    sentTitle: "📩 Revisa tu correo",
    sent: "Te enviamos un correo de Supabase con el asunto «Your sign-in link». Ábrelo y pulsa «Sign in». Si no lo ves, mira en Spam.",
    again: "Usar otro correo",
    err: "No se pudo enviar. Revisa el correo o inténtalo dentro de unos minutos.",
    linkErr: "El enlace no es válido o ya caducó. Pide uno nuevo.",
  },
  en: {
    email: "Your email",
    send: "Email me a sign-in link",
    sentTitle: "📩 Check your email",
    sent: "We sent you an email with the subject “Your sign-in link”. Open it and tap “Sign in”. If you can't find it, check Spam.",
    again: "Use another email",
    err: "Couldn't send. Check the address or try again in a few minutes.",
    linkErr: "The link is invalid or has expired. Request a new one.",
  },
  it: {
    email: "La tua email",
    send: "Inviami il link per accedere",
    sentTitle: "📩 Controlla la tua email",
    sent: "Ti abbiamo inviato un'email con oggetto «Your sign-in link». Aprila e premi «Sign in». Controlla anche lo spam.",
    again: "Usa un'altra email",
    err: "Invio non riuscito. Controlla l'indirizzo o riprova tra qualche minuto.",
    linkErr: "Il link non è valido o è scaduto. Richiedine uno nuovo.",
  },
};

/**
 * Acceso sin contraseña con enlace mágico por correo (Supabase).
 * Sin contraseñas = nada que robar ni reutilizar. Cuando se configure un SMTP propio
 * se podrá volver al código de 6 dígitos y añadir SMS. Ver docs/03-arquitectura-y-seguridad.md.
 */
export function LoginForm({ lang, linkError }: { lang: "es" | "en" | "it"; linkError?: boolean }) {
  const s = L[lang];
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(linkError ? s.linkErr : "");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setBusy(false);
    if (error) setError(s.err);
    else setSent(true);
  }

  return (
    <div className="card mx-auto max-w-md space-y-4">
      {sent ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{s.sentTitle}</h2>
          <p className="text-sm">{s.sent}</p>
          <p className="text-sm font-medium">{email}</p>
          <button type="button" className="text-sm text-brand underline" onClick={() => setSent(false)}>
            {s.again}
          </button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-3">
          <label className="block text-sm font-medium">
            ✉️ {s.email}
            <input
              className="input mt-1"
              required
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="btn w-full" disabled={busy}>
            {busy ? "…" : s.send}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-warn-fg">{error}</p>}
    </div>
  );
}
