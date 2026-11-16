import { useEffect } from "react";
import { useLang } from "~/lib/lang";
import { loadNotify, syncNotifications } from "~/lib/notify";
import { usePersonal } from "~/lib/personal";

/** Mantiene los avisos del teléfono al día con las citas guardadas. Sin consentimiento no hace nada. */
export function NotifySync() {
  const { t } = useLang();
  const { reminders, loading } = usePersonal();
  useEffect(() => {
    if (loading) return;
    void syncNotifications(reminders, loadNotify(), { title: "A posto", today: t("notifToday"), soon: t("notifSoon") }).catch(() => undefined);
  }, [reminders, loading, t]);
  return null;
}
