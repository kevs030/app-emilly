"use client";

import { useActionState } from "react";
import { createPost, type FormState } from "../actions";
import { CATEGORY_LABEL, ERRORS, FORUM_RULES } from "../forum-i18n";

export function NewPostForm({ lang }: { lang: "es" | "en" | "it" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createPost, {});
  const l = lang === "en" ? "en" : "es";
  return (
    <form action={action} className="card space-y-3">
      <input type="hidden" name="lang" value={lang} />
      <select name="category" className="input" required defaultValue="">
        <option value="" disabled>
          {l === "en" ? "Category" : "Categoría"}
        </option>
        {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v[l]}
          </option>
        ))}
      </select>
      <input name="title" className="input" required minLength={5} maxLength={140} placeholder={l === "en" ? "Your question in one line" : "Tu pregunta en una línea"} />
      <textarea name="body" className="input min-h-40" required minLength={10} maxLength={5000} placeholder={l === "en" ? "Explain your situation (without personal data)" : "Explica tu situación (sin datos personales)"} />
      <p className="text-xs text-muted">{FORUM_RULES[l]}</p>
      <button className="btn" disabled={pending}>
        {l === "en" ? "Publish" : "Publicar"}
      </button>
      {state.error && <p className="text-sm text-warn-fg">{ERRORS[state.error]?.[l] ?? state.error}</p>}
    </form>
  );
}
