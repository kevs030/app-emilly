import { useEffect } from "react";
import { useLang } from "~/lib/lang";
import { MQ } from "~/content/modules/motivation";
import { loadQuoteSettings, syncQuoteNotifications } from "~/lib/dailyQuote";
import { loadNotify, syncNotifications } from "~/lib/notify";
import { usePersonal } from "~/lib/personal";

/** Mantiene los avisos del teléfono al día con las citas guardadas. Sin consentimiento no hace nada. */
export function NotifySync() {
  const { t, lang } = useLang();
  const { reminders, loading } = usePersonal();
  useEffect(() => {
    if (loading) return;
    void syncNotifications(reminders, loadNotify(), { title: "A Posto", today: t("notifToday"), soon: t("notifSoon") }).catch(() => undefined);
  }, [reminders, loading, t]);
  // Frases del día: se renuevan al abrir la app (siempre quedan 14 días por delante) y al cambiar de idioma.
  useEffect(() => {
    void syncQuoteNotifications(loadQuoteSettings(), lang, MQ.ofDay[lang]).catch(() => undefined);
  }, [lang]);
  return null;
}
