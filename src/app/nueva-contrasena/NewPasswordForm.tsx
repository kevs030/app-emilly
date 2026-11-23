"use client";

import { CheckCircle2, Circle, Eye, EyeOff, KeyRound, TriangleAlert } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/content/types";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const L = {
  es: {
    title: "Crea tu contraseña nueva",
    sub: "Después entra en la app A Posto con tu correo y esta contraseña.",
    label: "Contraseña nueva",
    rules: ["Al menos 12 caracteres", "Mayúsculas y minúsculas", "Al menos un número", "Al menos un símbolo (!?@#…)"],
    save: "Guardar la contraseña",
    show: "Mostrar contraseña",
    hide: "Ocultar contraseña",
    checking: "Comprobando el enlace…",
    expired: "Este enlace ya no sirve: caducó o ya se usó. En la app, pulsa «Entrar» → «¿Olvidaste tu contraseña?» y pide otro. Abre solo el último correo.",
    done: "¡Listo! Tu contraseña está cambiada. Abre la app A Posto y entra con tu correo y la contraseña nueva.",
    error: "No se pudo guardar. Revisa que cumpla las reglas o pide un enlace nuevo.",
  },
  it: {
    title: "Crea la nuova password",
    sub: "Poi accedi all'app A Posto con la tua email e questa password.",
    label: "Nuova password",
    rules: ["Almeno 12 caratteri", "Maiuscole e minuscole", "Almeno un numero", "Almeno un simbolo (!?@#…)"],
    save: "Salva la password",
    show: "Mostra password",
    hide: "Nascondi password",
    checking: "Controllo del link…",
    expired: "Questo link non è più valido: è scaduto o è già stato usato. Nell'app tocca «Accedi» → «Password dimenticata?» e chiedine un altro. Apri solo l'ultima email.",
    done: "Fatto! La password è cambiata. Apri l'app A Posto ed entra con la tua email e la nuova password.",
    error: "Impossibile salvare. Controlla le regole o chiedi un nuovo link.",
  },
  en: {
    title: "Create your new password",
    sub: "Then sign in to the A Posto app with your email and this password.",
    label: "New password",
    rules: ["At least 12 characters", "Upper and lower case", "At least one number", "At least one symbol (!?@#…)"],
    save: "Save the password",
    show: "Show password",
    hide: "Hide password",
    checking: "Checking the link…",
    expired: "This link no longer works: it expired or was already used. In the app tap “Sign in” → “Forgot your password?” and request another. Open only the latest email.",
    done: "Done! Your password has been changed. Open the A Posto app and sign in with your email and the new password.",
    error: "Couldn't save. Check the rules or request a new link.",
  },
} as const;

// Mismas reglas que la app y que Supabase (12 caracteres, mayúscula, minúscula, número y símbolo).
const SYMBOLS = /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/;
const checks = (pw: string) => [pw.length >= 12, /[a-z]/.test(pw) && /[A-Z]/.test(pw), /[0-9]/.test(pw), SYMBOLS.test(pw)];

type State = "checking" | "ready" | "expired" | "saving" | "done";

export function NewPasswordForm({ lang }: { lang: Lang }) {
  const s = L[lang];
  // Cliente propio, sin guardar la sesión: solo sirve para cambiar la contraseña en esta página.
  const supabase = useMemo(() => createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }), []);
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const ok = checks(password);

  useEffect(() => {
    // El enlace trae la sesión en la parte «#» de la dirección (nunca llega al servidor).
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const access = hash.get("access_token");
    const refresh = hash.get("refresh_token");
    window.history.replaceState(null, "", window.location.pathname);
    const valid = Boolean(access && refresh) && !hash.get("error") && !query.get("error");
    // Siempre asíncrono: primero se comprueba el enlace con Supabase y después se muestra el resultado.
    void (valid ? supabase.auth.setSession({ access_token: access!, refresh_token: refresh! }) : Promise.resolve({ error: true })).then(({ error }) => setState(error ? "expired" : "ready"));
  }, [supabase]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!ok.every(Boolean)) return;
    setError("");
    setState("saving");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState("ready");
      return setError(s.error);
    }
    await supabase.auth.signOut();
    setState("done");
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <KeyRound size={24} aria-hidden /> {s.title}
      </h1>
      {state === "checking" && <p className="text-muted">{s.checking}</p>}
      {state === "expired" && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl border border-border bg-card p-4 font-medium">
          <TriangleAlert size={22} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {s.expired}
        </p>
      )}
      {state === "done" && (
        <p role="status" className="flex items-start gap-2 rounded-2xl bg-brand-soft p-4 font-medium">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {s.done}
        </p>
      )}
      {(state === "ready" || state === "saving") && (
        <form onSubmit={save} className="card space-y-4">
          <p className="text-sm text-muted">{s.sub}</p>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">{s.label}</span>
            <span className="relative block">
              <input className="input w-full !pe-12" type={visible ? "text" : "password"} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? s.hide : s.show} className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted">
                {visible ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
            </span>
          </label>
          <ul className="space-y-1 text-sm">
            {s.rules.map((r, i) => (
              <li key={r} className={`flex items-center gap-2 ${ok.at(i) ? "text-brand" : "text-muted"}`}>
                {ok.at(i) ? <CheckCircle2 size={16} aria-hidden /> : <Circle size={16} aria-hidden />} {r}
              </li>
            ))}
          </ul>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button className="btn w-full" disabled={state === "saving" || !ok.every(Boolean)}>
            {state === "saving" ? "…" : s.save}
          </button>
        </form>
      )}
    </div>
  );
}
