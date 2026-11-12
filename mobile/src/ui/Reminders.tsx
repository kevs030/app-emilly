import { CalendarPlus, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLang } from "~/lib/lang";
import { usePersonal, type Reminder } from "~/lib/personal";
import { Alert, Field } from "~/ui/kit";

function daysUntil(date: string): number {
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = date.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - a) / 86_400_000);
}

export function ReminderRow({ r }: { r: Reminder }) {
  const { t, lang } = useLang();
  const { toggleReminder, removeReminder } = usePersonal();
  const n = daysUntil(r.due_date);
  const when = r.done ? "" : n < 0 ? t("overdue") : n === 0 ? t("today") : n === 1 ? t("tomorrow") : t("inDays").replace("{n}", String(n));
  const [y, m, d] = r.due_date.split("-").map(Number);
  const pretty = new Date(y, m - 1, d).toLocaleDateString(lang, { day: "numeric", month: "long" });
  return (
    <li className="flex items-center gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={r.done}
        aria-label={r.title}
        onClick={() => toggleReminder(r)}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${r.done ? "border-sage bg-sage text-white" : "border-beige bg-white"}`}
      >
        {r.done && <Check size={18} aria-hidden />}
      </button>
      <span className="min-w-0 flex-1">
        <span className={`block font-medium ${r.done ? "text-ink-soft line-through" : ""}`}>{r.title}</span>
        <span className={`block text-[14px] ${!r.done && n < 0 ? "font-semibold text-danger" : "text-ink-soft"}`}>
          {pretty}
          {when && ` · ${when}`}
        </span>
      </span>
      <button type="button" aria-label={t("delete")} onClick={() => removeReminder(r)} className="flex h-11 w-11 items-center justify-center text-ink-soft">
        <Trash2 size={18} aria-hidden />
      </button>
    </li>
  );
}

/** Formulario para añadir un recordatorio. Las fechas las pone la persona: no son plazos oficiales. */
export function AddReminder({ procedureId }: { procedureId?: number }) {
  const { t } = useLang();
  const { addReminder } = usePersonal();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        <CalendarPlus size={20} aria-hidden /> {t("addReminder")}
      </button>
    );
  }
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(false);
        if (await addReminder(title, date, procedureId)) {
          setTitle("");
          setDate("");
          setOpen(false);
        } else setError(true);
      }}
    >
      <Field label={t("reminderTitle")} placeholder={t("reminderExample")} minLength={2} maxLength={120} required value={title} onChange={(e) => setTitle(e.target.value)} />
      <Field label={t("date")} type="date" required value={date} onChange={(e) => setDate(e.target.value)} hint={t("yourDates")} />
      {error && <Alert kind="error">{t("generic")}</Alert>}
      <button className="btn" disabled={title.trim().length < 2 || !date}>
        {t("save")}
      </button>
      <button type="button" className="btn btn-quiet" onClick={() => setOpen(false)}>
        {t("back")}
      </button>
    </form>
  );
}
