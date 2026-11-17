import { Bot, Clapperboard, History, Package, Send, SquarePen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { RewardedAd } from "~/ui/RewardedAd";
import { streamAI } from "~/lib/ai";
import { useLang } from "~/lib/lang";
import { supabase } from "~/lib/supabase";
import { Alert, Screen } from "~/ui/kit";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Asistente de IA. Cada pregunta gasta 1 crédito; el servidor lo descuenta y es quien manda.
 * La app solo muestra el saldo que el servidor le dice.
 */
export function Assistant() {
  const { t } = useLang();
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  // Conversación guardada en la cuenta. Si las tablas aún no existen, el chat funciona igual sin guardar.
  const conversation = useRef<number | null>(null);
  const opened = params.get("c");

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

  // Abrir una conversación anterior desde el historial.
  useEffect(() => {
    const id = Number(opened);
    if (!opened || !Number.isInteger(id) || conversation.current === id) return;
    let alive = true;
    void supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("id")
      .then(({ data }) => {
        if (!alive || !data?.length) return;
        conversation.current = id;
        setMessages(data as Msg[]);
      });
    return () => {
      alive = false;
    };
  }, [opened]);

  function startNew() {
    conversation.current = null;
    setMessages([]);
    setError("");
    setParams({}, { replace: true });
  }

  async function remember(role: Msg["role"], content: string, firstQuestion: string) {
    if (conversation.current === null) {
      const { data, error: e } = await supabase.from("ai_conversations").insert({ title: firstQuestion.slice(0, 80) }).select("id").single();
      if (e || !data) return;
      conversation.current = data.id as number;
    }
    await supabase.from("ai_messages").insert({ conversation_id: conversation.current, role, content: content.slice(0, 12000) });
  }

  async function ask(text: string) {
    if (!text || busy) return;
    setError("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    let answer = "";
    const res = await streamAI("/api/assistant", { messages: next.slice(-20), situation: profile?.consent_personalization ? { permit_type: profile.permit_type, permit_expiry: profile.permit_expiry, has_children: profile.has_children } : undefined }, (all) => {
      answer = all;
      setMessages([...next, { role: "assistant", content: all }]);
      bottom.current?.scrollIntoView({ block: "end" });
    });
    setBusy(false);
    if (res.status === "ok") {
      if (res.credits !== null) setCredits(res.credits);
      // Se guarda solo lo que de verdad se preguntó y se respondió.
      await remember("user", text, next[0].content);
      if (answer.trim()) await remember("assistant", answer, next[0].content);
      return;
    }
    setMessages(messages);
    if (res.status === "no_credits") return setCredits(0);
    setInput(text);
    setError(t(res.status === "rate_limited" ? "tooMany" : res.status === "not_ready" ? "asstNotReady" : res.status === "offline" ? "offline" : "asstError"));
  }

  const out = credits === 0;

  return (
    <Screen title={t("tabAssistant")} help="assistant">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start gap-2 rounded-2xl bg-sage-soft p-3 text-[14px]">
          <Bot size={20} className="mt-0.5 shrink-0 text-sage-dark" aria-hidden />
          <p className="min-w-0 flex-1">{t("asstNotice")}</p>
        </div>
        <div className="flex min-h-11 items-center gap-2">
          <p className="min-w-0 flex-1 text-[14px] font-semibold text-sage-dark" aria-live="polite">
            {credits !== null && `${credits} ${t("creditsLeft")}`}
          </p>
          {!out && <RewardedAd onCredits={(c) => c !== null && setCredits(c)} />}
          {messages.length > 0 && (
            <button type="button" onClick={startNew} disabled={busy} className="flex min-h-11 items-center gap-1 rounded-full bg-beige px-3 text-[14px] font-medium">
              <SquarePen size={16} aria-hidden /> {t("chatNew")}
            </button>
          )}
          <Link to="/assistant/history" className="flex min-h-11 items-center gap-1 rounded-full bg-beige px-3 text-[14px] font-medium">
            <History size={16} aria-hidden /> {t("chatHistory")}
          </Link>
        </div>

        <div className="flex-1 space-y-3">
          {messages.length === 0 && !out && (
            <div className="rise space-y-3">
              <p className="card">{t("asstHello")}</p>
              {(["ex1", "ex2"] as const).map((k) => (
                <button key={k} type="button" className="block min-h-12 w-full rounded-2xl border border-line bg-white px-4 py-3 text-start text-[15px] font-medium text-terracotta-hover shadow-[var(--ap-shadow-card)]" onClick={() => ask(t(k))}>
                  {t(k)}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="ms-auto max-w-[88%] whitespace-pre-wrap rounded-[20px] rounded-ee-md bg-terracotta-deep px-4 py-3 text-white">
                {m.content}
              </p>
            ) : (
              <p key={i} className="card max-w-[92%] whitespace-pre-wrap rounded-es-md text-[16px]">
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
            <RewardedAd
              variant="row"
              onCredits={(c) => {
                if (c !== null) setCredits(c);
                setError("");
              }}
              fallback={<SoonRow icon={Clapperboard} label={t("adSoon")} soon={t("soon")} />}
            />
            {(
              [
                [Package, "packSoon"],
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
            className="sticky bottom-2 flex items-end gap-2 rounded-[20px] border border-line bg-white p-2 shadow-[var(--ap-shadow-raised)]"
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
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-terracotta-deep text-white transition-colors active:bg-terracotta-hover disabled:opacity-50" disabled={busy || !input.trim()} aria-label={t("send")}>
              <Send size={20} className="rtl:-scale-x-100" aria-hidden />
            </button>
          </form>
        )}
      </div>
    </Screen>
  );
}

function SoonRow({ icon: Icon, label, soon }: { icon: typeof Clapperboard; label: string; soon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cream p-3">
      <span className="icon-tile">
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-[15px] font-medium">{label}</span>
      <span className="rounded-full bg-beige px-3 py-1 text-[12px] font-semibold">{soon}</span>
    </div>
  );
}
