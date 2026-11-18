import { Quote } from "lucide-react";
import { useState } from "react";
import { MQ } from "~/content/modules/motivation";
import { loadQuoteSettings, saveQuoteSettings, syncQuoteNotifications, type QuoteSettings as QS } from "~/lib/dailyQuote";
import { requestNotifyPermission } from "~/lib/notify";
import { isNative } from "~/lib/supabase";
import { useT9 } from "~/ui/modules/ModuleBlocks";
import { Switch } from "~/ui/Switch";

/** Interruptor y hora del aviso diario con la frase de ánimo (por defecto 08:30). */
export function QuoteSettings() {
  const { x, lang } = useT9();
  const [s, setS] = useState<QS>(loadQuoteSettings);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function apply(next: QS) {
    setMsg(null);
    if (next.enabled && !s.enabled && !(await requestNotifyPermission())) {
      setMsg({ kind: "error", text: x(MQ.denied) });
      return;
    }
    setS(next);
    saveQuoteSettings(next);
    const r = await syncQuoteNotifications(next, lang, x(MQ.ofDay)).catch(() => 0);
    if (r === "denied") setMsg({ kind: "error", text: x(MQ.denied) });
    else if (next.enabled) setMsg({ kind: "ok", text: `${x(MQ.scheduled)} ${next.time}.` });
  }

  return (
    <section className="card space-y-3" aria-labelledby="quote-settings">
      <h2 id="quote-settings" className="flex items-center gap-2 text-lg font-bold">
        <Quote size={20} className="text-sage" aria-hidden /> {x(MQ.settingsTitle)}
      </h2>
      <Switch label={x(MQ.settingsTitle)} hint={isNative ? x(MQ.settingsHint) : x(MQ.webOnly)} checked={s.enabled} disabled={!isNative} onChange={(v) => void apply({ ...s, enabled: v })} />
      <label className="block">
        <span className="field-label">{x(MQ.time)}</span>
        <input type="time" className="input" value={s.time} disabled={!isNative || !s.enabled} onChange={(e) => e.target.value && void apply({ ...s, time: e.target.value })} data-testid="quote-time" />
      </label>
      {msg && <p className={`alert ${msg.kind === "ok" ? "alert-ok" : "alert-error"}`}>{msg.text}</p>}
    </section>
  );
}
