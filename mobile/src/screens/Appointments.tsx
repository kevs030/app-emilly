import { useState } from "react";
import { useLang } from "~/lib/lang";
import { usePersonal } from "~/lib/personal";
import { Screen } from "~/ui/kit";
import { MonthCalendar } from "~/ui/MonthCalendar";
import { AddReminder, ReminderRow } from "~/ui/Reminders";

/** Citas y fechas que la persona apunta. No se calculan plazos: solo se guarda lo que ella escribe. */
export function Appointments() {
  const { t, lang } = useLang();
  const { available, loading, reminders } = usePersonal();
  const byDate = [...reminders].sort((a, b) => a.due_date.localeCompare(b.due_date));
  const [day, setDay] = useState<string | null>(null);
  const pending = byDate.filter((r) => !r.done && (!day || r.due_date === day));
  const marked = new Set(byDate.filter((r) => !r.done).map((r) => r.due_date));
  const done = byDate.filter((r) => r.done).reverse();

  return (
    <Screen title={t("appointments")} back help="appointments">
      <p className="text-[15px] text-ink-soft">{t("appointmentsLead")}</p>
      {!available && <p className="card mt-4 text-ink-soft">{t("notReady")}</p>}
      {available && loading && <p className="mt-4 text-ink-soft">{t("loading")}</p>}
      {available && !loading && (
        <div className="mt-4 space-y-5">
          <section className="card">
            <MonthCalendar marked={marked} selected={day} onSelect={setDay} />
          </section>
          <section className="card space-y-3">
            <h2 className="text-lg font-bold">
              {day ? new Date(`${day}T12:00:00`).toLocaleDateString(lang, { day: "numeric", month: "long" }) : t("pendingOnes")}
            </h2>
            {pending.length === 0 ? (
              <p className="text-[15px] text-ink-soft">{t("noReminders")}</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((r) => (
                  <ReminderRow key={r.id} r={r} />
                ))}
              </ul>
            )}
            <AddReminder key={day ?? "all"} initialDate={day ?? undefined} />
          </section>
          {done.length > 0 && (
            <section className="card space-y-3">
              <h2 className="text-lg font-bold">{t("doneOnes")}</h2>
              <ul className="space-y-3">
                {done.map((r) => (
                  <ReminderRow key={r.id} r={r} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Screen>
  );
}
