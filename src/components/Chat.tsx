"use client";

import { Bot, Mic, Send, Square, Volume2, VolumeX } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "es" | "en" | "it";

const SPEECH_LANG: Record<Lang, string> = { es: "es-ES", en: "en-US", it: "it-IT" };

const L = {
  es: {
    placeholder: "Escribe o dicta tu pregunta…",
    send: "Enviar",
    limit: "Has hecho muchas preguntas seguidas. Espera unos minutos.",
    voiceOn: "Voz activada",
    voiceOff: "Voz desactivada",
    listen: "Escuchar",
    stop: "Parar",
    mic: "Hablar",
    micStop: "Dejar de escuchar",
    listening: "Te escucho…",
    micErr: "No se pudo usar el micrófono. Revisa el permiso del navegador.",
    hello: "Hola, soy Emilly. Cuéntame tu situación y te digo qué pasos seguir.",
    examples: ["Mi permiso vence en un mes, ¿qué hago?", "¿Cómo saco el código fiscal?", "Tengo un hijo, ¿qué ayudas puedo pedir?"],
  },
  en: {
    placeholder: "Type or dictate your question…",
    send: "Send",
    limit: "Too many questions in a row. Please wait a few minutes.",
    voiceOn: "Voice on",
    voiceOff: "Voice off",
    listen: "Listen",
    stop: "Stop",
    mic: "Speak",
    micStop: "Stop listening",
    listening: "Listening…",
    micErr: "Couldn't use the microphone. Check your browser permission.",
    hello: "Hi, I'm Emilly. Tell me your situation and I'll explain the steps.",
    examples: ["My permit expires next month, what do I do?", "How do I get a tax code?", "I have a child, which benefits can I get?"],
  },
  it: {
    placeholder: "Scrivi o detta la tua domanda…",
    send: "Invia",
    limit: "Troppe domande di seguito. Attendi qualche minuto.",
    voiceOn: "Voce attiva",
    voiceOff: "Voce disattivata",
    listen: "Ascolta",
    stop: "Ferma",
    mic: "Parla",
    micStop: "Smetti di ascoltare",
    listening: "Ti ascolto…",
    micErr: "Impossibile usare il microfono. Controlla i permessi del browser.",
    hello: "Ciao, sono Emilly. Raccontami la tua situazione e ti spiego i passaggi.",
    examples: ["Il mio permesso scade tra un mese, cosa faccio?", "Come ottengo il codice fiscale?", "Ho un figlio: quali bonus posso chiedere?"],
  },
};

// ── Reconocimiento de voz (API del navegador; no existe en todos) ──
type RecognitionResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
function getRecognition(): (new () => Recognition) | undefined {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Quita el formato para que la voz no lea símbolos ni direcciones web. */
function forSpeech(text: string) {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#`>]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

/** Negritas y enlaces https como elementos de React (nunca HTML sin escapar). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https:\/\/[^\s)]+)\)|(https:\/\/[^\s)<]+[^\s)<.,;:!?])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index}>{m[1]}</strong>);
    else {
      const href = m[3] ?? m[4];
      out.push(
        <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className="break-words text-brand underline">
          {m[2] ?? href.replace(/^https:\/\/(www\.)?/, "").slice(0, 48)}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Formatted({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const heading = line.match(/^#{1,4}\s+(.*)$/);
        if (heading) return <p key={i} className="font-semibold">{inline(heading[1])}</p>;
        const item = line.match(/^\s*(\d+[.)]|[-•*])\s+(.*)$/);
        if (item) {
          return (
            <p key={i} className="flex gap-2">
              <span className="shrink-0 font-semibold text-brand">{/\d/.test(item[1]) ? item[1].replace(")", ".") : "•"}</span>
              <span>{inline(item[2])}</span>
            </p>
          );
        }
        return <p key={i}>{inline(line)}</p>;
      })}
    </div>
  );
}

export function Chat({ lang, notice }: { lang: Lang; notice: string }) {
  const s = L[lang];
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const recognition = useRef<Recognition | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- capacidades del navegador, solo se conocen tras montar */
    setCanSpeak("speechSynthesis" in window);
    setCanListen(Boolean(getRecognition()));
    setAutoSpeak(localStorage.getItem("emilly:voice") === "1");
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      window.speechSynthesis?.cancel();
      recognition.current?.stop();
    };
  }, []);

  const speak = useCallback(
    (text: string, index: number) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(forSpeech(text));
      u.lang = SPEECH_LANG[lang];
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
      if (voice) u.voice = voice;
      u.rate = 0.98;
      u.onend = () => setSpeaking(null);
      u.onerror = () => setSpeaking(null);
      setSpeaking(index);
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(null);
  }

  function toggleMic() {
    setError("");
    if (listening) return recognition.current?.stop();
    const Ctor = getRecognition();
    if (!Ctor) return;
    stopSpeaking();
    const r = new Ctor();
    r.lang = SPEECH_LANG[lang];
    r.interimResults = true;
    r.continuous = false;
    const base = input ? input.trimEnd() + " " : "";
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setInput((base + text).slice(0, 4000));
    };
    r.onend = () => setListening(false);
    r.onerror = () => {
      setListening(false);
      setError(s.micErr);
    };
    recognition.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setError(s.micErr);
    }
  }

  async function ask(text: string) {
    if (!text || busy) return;
    recognition.current?.stop();
    stopSpeaking();
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    let acc = "";
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
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
        bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
      if (autoSpeak && acc && !acc.includes("⚠️")) speak(acc, next.length);
    } catch (err) {
      setMessages([...next, { role: "assistant", content: `⚠️ ${(err as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-2xl bg-brand-soft p-3 text-sm sm:flex-row sm:items-center">
        <p className="flex min-w-0 flex-1 items-start gap-2">
          <Bot size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <span>{notice}</span>
        </p>
        {canSpeak && (
          <button
            type="button"
            aria-pressed={autoSpeak}
            className="chip shrink-0 self-start sm:self-auto"
            onClick={() => {
              const v = !autoSpeak;
              setAutoSpeak(v);
              localStorage.setItem("emilly:voice", v ? "1" : "0");
              if (!v) stopSpeaking();
            }}
          >
            {autoSpeak ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
            {autoSpeak ? s.voiceOn : s.voiceOff}
          </button>
        )}
      </div>

      <div className="min-h-[320px] space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="pop space-y-3">
            <div className="card max-w-[90%] text-sm">{s.hello}</div>
            <div className="flex flex-wrap gap-2">
              {s.examples.map((ex) => (
                <button key={ex} type="button" className="chip text-left" onClick={() => ask(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="pop ml-auto max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-on-brand">
              {m.content}
            </div>
          ) : (
            <div key={i} className="pop card max-w-[92%] rounded-bl-md text-sm">
              {m.content ? (
                <Fragment>
                  <Formatted text={m.content} />
                  {canSpeak && !(busy && i === messages.length - 1) && (
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand"
                      onClick={() => (speaking === i ? stopSpeaking() : speak(m.content, i))}
                    >
                      {speaking === i ? <Square size={14} aria-hidden /> : <Volume2 size={14} aria-hidden />}
                      {speaking === i ? s.stop : s.listen}
                    </button>
                  )}
                </Fragment>
              ) : (
                <span className="typing" aria-label="…">
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </div>
          ),
        )}
        <div ref={bottom} />
      </div>

      {(listening || error) && (
        <p className="text-sm text-muted" aria-live="polite">
          {listening ? s.listening : error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input.trim());
        }}
        className="sticky bottom-20 flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg sm:bottom-3"
      >
        {canListen && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? s.micStop : s.mic}
            title={listening ? s.micStop : s.mic}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${listening ? "listening bg-danger text-white" : "bg-brand-soft text-brand"}`}
          >
            {listening ? <Square size={18} aria-hidden /> : <Mic size={20} aria-hidden />}
          </button>
        )}
        <textarea
          className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 outline-none"
          rows={1}
          maxLength={4000}
          placeholder={s.placeholder}
          aria-label={s.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(input.trim());
            }
          }}
        />
        <button className="btn h-11 px-3" disabled={busy || !input.trim()} aria-label={s.send}>
          <Send size={18} aria-hidden />
        </button>
      </form>
    </div>
  );
}
