"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { captchaEnabled, useCaptcha } from "@/components/Captcha";

/**
 * Acceso al panel con el mismo correo y contraseña de la app.
 * Tras entrar, la página se vuelve a cargar y el servidor comprueba si la cuenta es de administración:
 * si no lo es, la página responde «no existe», igual que antes.
 */
export function AdminLogin() {
  const router = useRouter();
  const captcha = useCaptcha("es");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password, options: { captchaToken: captcha.token } });
    captcha.reset();
    setBusy(false);
    if (error) return setError(error.status === 429 ? "Demasiados intentos. Espera unos minutos." : "Correo o contraseña incorrectos.");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <LockKeyhole size={22} aria-hidden /> Acceso de administración
      </h1>
      <p className="text-sm text-muted">Entra con el mismo correo y contraseña que usas en la app A Posto.</p>
      <form onSubmit={submit} className="card space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Correo</span>
          <input className="input w-full" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Contraseña</span>
          <input className="input w-full" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {captcha.node}
        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <button className="btn w-full" disabled={busy || (captchaEnabled && !captcha.token)}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="text-xs text-muted">¿No recuerdas la contraseña? Cámbiala desde la app: Entrar → «¿Olvidaste tu contraseña?».</p>
    </div>
  );
}
