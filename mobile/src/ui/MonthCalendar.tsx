import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLang } from "~/lib/lang";

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Calendario mensual: marca los días con citas. Al tocar un día se elige esa fecha. */
export function MonthCalendar({ marked, selected, onSelect }: { marked: Set<string>; selected: string | null; onSelect: (date: string | null) => void }) {
  const { lang, t } = useLang();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const first = new Date(ym.y, ym.m, 1);
  const lead = (first.getDay() + 6) % 7; // la semana empieza en lunes
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const today = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const move = (d: number) => setYm(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "narrow" }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label={t("calPrev")} className="flex h-11 w-11 items-center justify-center rounded-full text-brown">
          <ChevronLeft size={22} className="rtl:rotate-180" aria-hidden />
        </button>
        <p className="font-bold capitalize" aria-live="polite">
          {first.toLocaleDateString(lang, { month: "long", year: "numeric" })}
        </p>
        <button type="button" onClick={() => move(1)} aria-label={t("calNext")} className="flex h-11 w-11 items-center justify-center rounded-full text-brown">
          <ChevronRight size={22} className="rtl:rotate-180" aria-hidden />
        </button>
      </div>
      <div className="mt-1 grid grid-cols-7 text-center text-[12px] text-ink-soft" aria-hidden>
        {weekdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = iso(ym.y, ym.m, i + 1);
          const on = selected === date;
          const has = marked.has(date);
          return (
            <button
              key={date}
              type="button"
              aria-pressed={on}
              aria-label={new Date(ym.y, ym.m, i + 1).toLocaleDateString(lang, { day: "numeric", month: "long" }) + (has ? ` · ${t("calHas")}` : "")}
              onClick={() => onSelect(on ? null : date)}
              className={`relative mx-auto flex h-11 w-11 items-center justify-center rounded-full text-[15px] ${on ? "bg-terracotta-deep font-bold text-white" : date === today ? "bg-beige font-bold" : ""}`}
            >
              {i + 1}
              {has && <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${on ? "bg-white" : "bg-terracotta-deep"}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
