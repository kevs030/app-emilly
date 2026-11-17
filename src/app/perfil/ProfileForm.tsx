"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "./actions";
import type { Profile } from "@/lib/next-steps";

export function ProfileForm({ profile, lang }: { profile: Profile; lang: "es" | "en" | "it" }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfile, {});
  const l = lang === "en" ? "en" : "es";
  const T = (es: string, en: string) => (l === "en" ? en : es);

  return (
    <form action={action} className="card space-y-4">
      <label className="block">
        <span className="text-sm font-medium">{T("Nombre público en el foro", "Public name in the forum")}</span>
        <input name="display_name" className="input mt-1" maxLength={40} defaultValue={profile.display_name ?? ""} placeholder={T("Ej. Ana M.", "e.g. Ana M.")} />
        <span className="text-xs text-muted">{T("No uses tu nombre completo.", "Don't use your full name.")}</span>
      </label>

      <label className="block">
        <span className="text-sm font-medium">{T("Idioma", "Language")}</span>
        <select name="preferred_language" className="input mt-1" defaultValue={profile.preferred_language}>
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="it">Italiano</option>
        </select>
      </label>

      <fieldset className="space-y-3 rounded-lg border border-border p-3">
        <legend className="px-1 text-sm font-semibold">{T("Personalización (opcional)", "Personalisation (optional)")}</legend>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consent_personalization" defaultChecked={profile.consent_personalization} className="mt-1" />
          <span>
            {T(
              "Acepto que A Posto use los datos de abajo para darme avisos y respuestas personalizadas. Puedo retirarlo cuando quiera y los datos se borran.",
              "I agree that A Posto uses the data below to give me personalised reminders and answers. I can withdraw at any time and the data is deleted.",
            )}
          </span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="country_of_origin" className="input" maxLength={60} defaultValue={profile.country_of_origin ?? ""} placeholder={T("País de origen", "Country of origin")} />
          <input name="city" className="input" maxLength={60} defaultValue={profile.city ?? ""} placeholder={T("Ciudad en Italia", "City in Italy")} />
        </div>
        <p className="rounded-xl bg-brand-soft p-3 text-sm">
          {T(
            "Tu tipo de permiso, su caducidad y si tienes hijos se guardan solo en la app de tu teléfono, nunca en nuestro servidor. Puedes indicarlos en la app: Perfil → Mi expediente.",
            "Your permit type, its expiry date and whether you have children are stored only in the app on your phone, never on our server. You can add them in the app: Profile → My file.",
          )}
        </p>
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent_analytics" defaultChecked={profile.consent_analytics} className="mt-1" />
        <span>
          {T(
            "Acepto estadísticas de uso anónimas para mejorar la app (opcional).",
            "I accept anonymous usage statistics to improve the app (optional).",
          )}
        </span>
      </label>

      <button className="btn" disabled={pending}>
        {pending ? "…" : T("Guardar", "Save")}
      </button>
      {state.ok && <p className="text-sm text-brand">✅ {T("Guardado", "Saved")}</p>}
      {state.error && <p className="text-sm text-warn-fg">{T("Revisa los datos.", "Please check the data.")}</p>}
    </form>
  );
}
