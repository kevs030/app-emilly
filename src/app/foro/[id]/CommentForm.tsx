"use client";

import { useActionState, useEffect, useRef } from "react";
import { createComment, type FormState } from "../actions";
import { ERRORS } from "../forum-i18n";

export function CommentForm({ postId, lang }: { postId: number; lang: "es" | "en" | "it" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createComment, {});
  const ref = useRef<HTMLFormElement>(null);
  const l = lang === "en" ? "en" : "es";
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="post_id" value={postId} />
      <textarea name="body" className="input min-h-24" required minLength={2} maxLength={3000} placeholder={l === "en" ? "Write a reply…" : "Escribe una respuesta…"} />
      <button className="btn" disabled={pending}>
        {l === "en" ? "Reply" : "Responder"}
      </button>
      {state.error && <p className="text-sm text-warn-fg">{ERRORS[state.error]?.[l] ?? state.error}</p>}
    </form>
  );
}
