"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/supabase/config";
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
  const [visible, setVisible] = useState(false);
  const [sent, setSent] = useState(false);

  /** «¿Olvidaste tu contraseña?»: el correo trae un botón que abre /nueva-contrasena (funciona en cualquier navegador). */
  async function forgot() {
    setError("");
    if (!email.trim()) return setError("Escribe primero tu correo arriba.");
    if (captchaEnabled && !captcha.token) return setError("Marca primero la casilla de verificación.");
    setBusy(true);
    const plain = createPlainClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const { error } = await plain.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/nueva-contrasena`, captchaToken: captcha.token });
    captcha.reset();
    setBusy(false);
    if (error) return setError(error.status === 429 ? "Ya pediste varios correos. Espera unos minutos y abre solo el último." : "No se pudo enviar el correo. Inténtalo de nuevo.");
    setSent(true);
  }

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
          <span className="relative block">
            <input className="input w-full !pe-12" type={visible ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-password" />
            <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted" data-testid="admin-eye">
              {visible ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
            </button>
          </span>
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
      {sent ? (
        <p role="status" className="card text-sm" data-testid="admin-forgot-sent">
          Te enviamos un correo a <strong>{email.trim()}</strong>. Ábrelo (mira también en Spam), pulsa <strong>«Crear una contraseña nueva»</strong> y guárdala. Después vuelve a esta página y entra con la contraseña nueva.
        </p>
      ) : (
        <button type="button" onClick={forgot} disabled={busy} className="text-sm font-semibold text-brand underline underline-offset-2" data-testid="admin-forgot">
          ¿Olvidaste tu contraseña?
        </button>
      )}
    </div>
  );
}
