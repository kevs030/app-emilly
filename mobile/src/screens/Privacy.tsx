import { PrivacyContent } from "@/components/PrivacyContent";
import { useLang } from "~/lib/lang";
import { CONTENT_LANG } from "~/lib/strings";
import { Screen } from "~/ui/kit";

/** Política de privacidad dentro de la app (obligatoria en las tiendas). Mismo texto que en la web. */
export function Privacy() {
  const { t, lang, contentFallback } = useLang();
  return (
    <Screen back title={t("privacyPolicy")}>
      {contentFallback && <p className="mb-4 rounded-2xl bg-beige p-3 text-[14px]">{t("notTranslated")}</p>}
      <div className="card">
        <PrivacyContent lang={CONTENT_LANG[lang]} />
      </div>
    </Screen>
  );
}
