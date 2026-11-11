import "server-only";
import { cookies, headers } from "next/headers";
import type { Lang } from "@/content/types";
import { isLang } from "./i18n";

/** Idioma: cookie `lang` → idioma del navegador → español. */
export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get("lang")?.value;
  if (isLang(c)) return c;
  const accept = (await headers()).get("accept-language") ?? "";
  const first = accept.split(",")[0]?.slice(0, 2).toLowerCase();
  return isLang(first) ? first : "es";
}
