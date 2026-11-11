"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/content/types";
import { LANGS, LANG_LABEL } from "@/lib/i18n";

export function LangSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  return (
    <select
      aria-label="Idioma / Language"
      className="rounded-md border border-border bg-card px-2 py-1"
      value={current}
      onChange={(e) => {
        document.cookie = `lang=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
    >
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {LANG_LABEL[l]}
        </option>
      ))}
    </select>
  );
}
