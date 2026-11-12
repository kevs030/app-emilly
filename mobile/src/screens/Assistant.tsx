import { Bot, Clapperboard, Package, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "~/lib/lang";
import { API_URL, supabase } from "~/lib/supabase";
import { Alert, Screen } from "~/ui/kit";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Asistente de IA. Cada pregunta gasta 1 crédito; el servidor lo descuenta y es quien manda.
 * La app solo muestra el saldo que el servidor le dice.
 */
export function Assistant() {
  const { t } = useLang();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    void supabase
      .from("ai_wallets")
      .select("credits")
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data) setCredits(data.credits as number);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function ask(text: string) {
    if (!text || busy) return;
    setError("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ messages: next.slice(-20) }),
      });
      if (res.status === 402) {
        setCredits(0);
        setMessages(messages);
        return;
      }
      if (res.status === 429) throw new Error(t("tooMany"));
      if (res.status === 503) throw new Error(t("asstNotReady"));
      if (!res.ok || !res.body) throw new Error(t("asstError"));
      const left = Number(res.headers.get("X-Credits-Remaining"));
      if (Number.isFinite(left)) setCredits(left);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
        bottom.current?.scrollIntoView({ block: "end" });
      }
    } catch (e) {
      setMessages(messages);
      setInput(text);
      setError(e instanceof TypeError ? t("offline") : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const out = credits === 0;

  return (
    <Screen title={t("tabAssistant")}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start gap-2 rounded-2xl bg-sage-soft p-3 text-[14px]">
          <Bot size={20} className="mt-0.5 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1">{t("asstNotice")}</p>
        </div>
        {credits !== null && (
          <p className="text-[14px] font-semibold text-brown" aria-live="polite">
            {credits} {t("creditsLeft")}
          </p>
        )}

        <div className="flex-1 space-y-3">
          {messages.length === 0 && !out && (
            <div className="rise space-y-3">
              <p className="card">{t("asstHello")}</p>
              {(["ex1", "ex2"] as const).map((k) => (
                <button key={k} type="button" className="block w-full rounded-2xl bg-beige px-4 py-3 text-start text-[15px] font-medium" onClick={() => ask(t(k))}>
                  {t(k)}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="ms-auto max-w-[88%] whitespace-pre-wrap rounded-3xl rounded-ee-lg bg-terracotta-deep px-4 py-3 text-white">
                {m.content}
              </p>
            ) : (
              <p key={i} className="card max-w-[92%] whitespace-pre-wrap rounded-es-lg text-[16px]">
                {m.content || "…"}
              </p>
            ),
          )}
          <div ref={bottom} />
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        {out ? (
          <section className="card space-y-3">
            <h2 className="text-lg font-bold">{t("noCreditsTitle")}</h2>
            <p className="text-[15px] text-ink-soft">{t("noCreditsBody")}</p>
            {(
              [
                [Package, "packSoon"],
                [Clapperboard, "adSoon"],
              ] as const
            ).map(([Icon, key]) => (
              <div key={key} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                <span className="icon-tile">
                  <Icon size={20} aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-medium">{t(key)}</span>
                <span className="rounded-full bg-beige px-3 py-1 text-[12px] font-semibold">{t("soon")}</span>
              </div>
            ))}
          </section>
        ) : (
          <form
            className="sticky bottom-2 flex items-end gap-2 rounded-3xl bg-white p-2 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input.trim());
            }}
          >
            <textarea
              className="min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-[17px] outline-none"
              rows={1}
              maxLength={4000}
              placeholder={t("asstPlaceholder")}
              aria-label={t("asstPlaceholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta-deep text-white disabled:opacity-50" disabled={busy || !input.trim()} aria-label={t("send")}>
              <Send size={20} className="rtl:-scale-x-100" aria-hidden />
            </button>
          </form>
        )}
      </div>
    </Screen>
  );
}
