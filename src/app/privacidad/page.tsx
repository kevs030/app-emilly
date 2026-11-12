import type { Metadata } from "next";
import { PrivacyContent } from "@/components/PrivacyContent";
import { privacyLabels } from "@/content/legal";
import { tr } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = { title: "Privacidad / Privacy" };

/** Política de privacidad pública. Es la URL que se indica en Google Play y en el App Store. */
export default async function PrivacyPage() {
  const lang = await getLang();
  return (
    <article className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{tr(privacyLabels.title, lang)}</h1>
      <PrivacyContent lang={lang} />
    </article>
  );
}
