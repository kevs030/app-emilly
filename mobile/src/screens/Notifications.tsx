import { BellRing, CalendarDays, FileText, IdCard, MessageCircleReply } from "lucide-react";
import { useForumActivity } from "~/lib/forumActivity";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { listDocuments, type Doc } from "~/lib/documents";
import { useLang } from "~/lib/lang";
import { loadNotify, requestNotifyPermission, saveNotify, syncNotifications, type NotifySettings } from "~/lib/notify";
import { usePersonal } from "~/lib/personal";
import { isNative } from "~/lib/supabase";
import { Alert, Screen } from "~/ui/kit";
import { Switch } from "~/ui/Switch";

type Item = { key: string; date: string; title: string; to: string; icon: typeof BellRing };

function daysFrom(today: string, date: string) {
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}

/** Centro de avisos: fechas próximas que la persona guardó, y ajustes de los avisos del teléfono. */
export function Notifications() {
  const { t, lang } = useLang();
  const { user, profile } = useAuth();
  const { reminders, available } = usePersonal();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [settings, setSettings] = useState<NotifySettings>(loadNotify);
  const [denied, setDenied] = useState(false);
  const forum = useForumActivity(user?.id);

  useEffect(() => {
    if (user) void listDocuments(user.id).then((d) => setDocs(d ?? []));
  }, [user]);

  const today = new Date().toLocaleDateString("sv"); // AAAA-MM-DD en hora local
  const items: Item[] = [
    ...reminders.filter((r) => !r.done).map((r) => ({ key: `r${r.id}`, date: r.due_date, title: r.title, to: "/appointments", icon: CalendarDays })),
    ...docs.filter((d) => d.expires_on).map((d) => ({ key: `d${d.id}`, date: d.expires_on!, title: `${t("docExpires")} ${d.title}`, to: "/documents", icon: FileText })),
    ...(profile?.permit_expiry ? [{ key: "permit", date: profile.permit_expiry, title: t("permitExpires"), to: "/file", icon: IdCard }] : []),
  ]
    .filter((i) => daysFrom(today, i.date) <= 60)
    .sort((a, b) => a.date.localeCompare(b.date));

  async function update(patch: Partial<NotifySettings>) {
    let next = { ...settings, ...patch };
    setDenied(false);
    if (patch.enabled && !(await requestNotifyPermission())) {
      next = { ...next, enabled: false };
      setDenied(true);
    }
    setSettings(next);
    saveNotify(next);
    await syncNotifications(reminders, next, { title: "A Posto", today: t("notifToday"), soon: t("notifSoon") }).catch(() => undefined);
  }

  return (
    <Screen title={t("notifications")} back help="notifications">
      {forum && forum.replies.length > 0 && (
        <section className="mb-6" data-testid="notif-replies">
          <h2 className="mb-3 text-lg font-bold">{t("community")}</h2>
          <ul className="space-y-3">
            {forum.replies.map((r) => (
              <li key={`${r.post_id}-${r.created_at}`}>
                <Link to={`/community/${r.post_id}`} className="card flex items-start gap-3">
                  <span className="icon-tile shrink-0">
                    <MessageCircleReply size={20} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t("commNewReplies")}</span>
                    <span className="block text-[14px] text-ink-soft break-words">
                      {r.author_name} {t("commReplyFrom")}: «{r.title}»
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2 className="mb-3 text-lg font-bold">{t("notifUpcoming")}</h2>
        {!available && <p className="card text-ink-soft">{t("notReady")}</p>}
        {available && items.length === 0 && <p className="card text-ink-soft">{t("notifEmpty")}</p>}
        <ul className="space-y-3">
          {items.map((i) => {
            const n = daysFrom(today, i.date);
            const when = n < 0 ? t("overdue") : n === 0 ? t("today") : n === 1 ? t("tomorrow") : t("inDays").replace("{n}", String(n));
            return (
              <li key={i.key}>
                <Link to={i.to} className="card flex items-center gap-3">
                  <span className="icon-tile shrink-0">
                    <i.icon size={20} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium break-words">{i.title}</span>
                    <span className={`block text-[14px] ${n < 0 ? "font-semibold text-danger" : "text-ink-soft"}`}>
                      {new Date(`${i.date}T12:00:00`).toLocaleDateString(lang, { day: "numeric", month: "long" })} · {when}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card mt-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <BellRing size={20} className="text-terracotta" aria-hidden /> {t("notifPhone")}
        </h2>
        {!isNative && <p className="rounded-xl bg-beige p-3 text-[14px]">{t("notifOnlyApp")}</p>}
        <Switch label={t("notifEnable")} hint={t("notifEnableHint")} checked={settings.enabled} disabled={!isNative} onChange={(v) => update({ enabled: v })} />
        {denied && <Alert kind="error">{t("notifDenied")}</Alert>}
        <div>
          <label className="field-label" htmlFor="notif-days">
            {t("notifWhen")}
          </label>
          <select id="notif-days" className="input" disabled={!settings.enabled} value={settings.daysBefore} onChange={(e) => update({ daysBefore: Number(e.target.value) })}>
            <option value={0}>{t("notifSameDay")}</option>
            {[1, 3, 7].map((d) => (
              <option key={d} value={d}>
                {t("notifDaysBefore").replace("{n}", String(d))}
              </option>
            ))}
          </select>
        </div>
        <Switch label={t("notifShowTitle")} hint={t("notifShowTitleHint")} checked={settings.showTitle} disabled={!settings.enabled} onChange={(v) => update({ showTitle: v })} />
      </section>
    </Screen>
  );
}
