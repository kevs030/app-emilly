"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSponsor, type SponsorState } from "./actions";

export function SponsorForm() {
  const [state, action, pending] = useActionState<SponsorState, FormData>(createSponsor, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">
        Título (máx. 60)
        <input name="title" className="input mt-1" required minLength={3} maxLength={60} placeholder="Patronato XYZ Milano" />
      </label>
      <label className="text-sm">
        Texto del botón (máx. 30)
        <input name="cta" className="input mt-1" required minLength={2} maxLength={30} defaultValue="Más información" />
      </label>
      <label className="text-sm sm:col-span-2">
        Descripción (máx. 160)
        <input name="body" className="input mt-1" required minLength={10} maxLength={160} placeholder="Ayuda gratuita con tu ISEE, bonos y permisos." />
      </label>
      <label className="text-sm">
        Enlace (https://…)
        <input name="url" type="url" className="input mt-1" required maxLength={300} pattern="https://.+" placeholder="https://ejemplo.it" />
      </label>
      <label className="text-sm">
        Dónde se muestra
        <select name="placement" className="input mt-1" defaultValue="all">
          <option value="all">En todas las zonas</option>
          <option value="home">Solo portada</option>
          <option value="guias">Solo trámites</option>
          <option value="foro">Solo foro</option>
        </select>
      </label>
      <div className="sm:col-span-2">
        <button className="btn" disabled={pending}>
          {pending ? "…" : "Publicar anuncio"}
        </button>
        {state.ok && <span className="ml-3 text-sm text-brand">Publicado ✓</span>}
        {state.error && <span className="ml-3 text-sm text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
