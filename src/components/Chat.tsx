"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const L = {
  es: { placeholder: "Escribe tu pregunta… (ej. 'Mi permiso vence en un mes, ¿qué hago?')", send: "Enviar", busy: "Pensando…", limit: "Has hecho muchas preguntas seguidas. Espera unos minutos." },
  en: { placeholder: "Type your question… (e.g. 'My permit expires next month, what do I do?')", send: "Send", busy: "Thinking…", limit: "Too many questions in a row. Please wait a few minutes." },
  it: { placeholder: "Scrivi la tua domanda…", send: "Invia", busy: "Sto pensando…", limit: "Troppe domande di seguito. Attendi qualche minuto." },
};

export function Chat({ lang, notice }: { lang: "es" | "en" | "it"; notice: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const s = L[lang];

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-20) }),
      });
      if (res.status === 429) throw new Error(s.limit);
      if (!res.ok || !res.body) throw new Error("Error");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
        bottom.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      setMessages([...next, { role: "assistant", content: `⚠️ ${(err as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg bg-brand-soft p-3 text-sm">🤖 {notice}</p>
      <div className="min-h-[300px] space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-brand text-white dark:text-black" : "card"
            }`}
          >
            {m.content || (busy && i === messages.length - 1 ? s.busy : "")}
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="sticky bottom-2 flex gap-2">
        <textarea
          className="input min-h-[48px] flex-1 resize-none"
          rows={2}
          maxLength={4000}
          placeholder={s.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) send(e);
          }}
        />
        <button className="btn" disabled={busy || !input.trim()}>
          {s.send}
        </button>
      </form>
    </div>
  );
}
