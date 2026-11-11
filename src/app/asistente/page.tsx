import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { Chat } from "@/components/Chat";

export default async function AssistantPage() {
  const lang = await getLang();
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{t("navAssistant", lang)}</h1>
      <Chat lang={lang} notice={`${t("aiNotice", lang)} ${t("disclaimer", lang)}`} />
    </div>
  );
}
