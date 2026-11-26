import { BellPlus, Check, Circle, ExternalLink, IdCard, Mailbox, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/auth/AuthProvider";
import { cleanPermitCode, permitCodeOk, POLICE_STATUS_URL, POSTE_PORTAL_URL, PS, type PermitColor } from "~/content/modules/permitStatus";
import { usePersonal } from "~/lib/personal";
import { Alert, Screen } from "~/ui/kit";
import { useT9 } from "~/ui/modules/ModuleBlocks";

type Saved = { code: string; color?: PermitColor; at?: string };
const key = (uid?: string) => `aposto:permit-status:${uid ?? "guest"}`;
function load(uid?: string): Saved {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) ?? "null") ?? { code: "" };
  } catch {
    return { code: "" };
  }
}
function store(uid: string | undefined, s: Saved | null) {
  try {
    if (s) localStorage.setItem(key(uid), JSON.stringify(s));
    else localStorage.removeItem(key(uid));
  } catch {
    /* sin almacenamiento */
  }
}

const COLORS: { id: PermitColor; dot: string; means: string }[] = [
  { id: "green", dot: "#3f8f4f", means: "greenMeans" },
  { id: "orange", dot: "#d9822b", means: "orangeMeans" },
  { id: "red", dot: "#c0392b", means: "redMeans" },
];

/**
 * «¿En qué punto está mi permiso?». La consulta oficial es una web de la Polizia di Stato que la app no puede leer por ti:
 * aquí guardas el número (solo en el teléfono), se copia con un toque y se abre la página; luego eliges el color
 * que te salió y la app te explica qué significa y te recuerda volver a mirar.
 */
export function PermitStatus() {
  const { x, lang } = useT9();
  const { user } = useAuth();
  const { addReminder, available } = usePersonal();
  const [saved, setSaved] = useState<Saved>(() => load(user?.id));
  const [code, setCode] = useState(saved.code);
  const [msg, setMsg] = useState<"" | "copied" | "bad" | "reminded">("");
  const clean = cleanPermitCode(code);
  const ok = permitCodeOk(clean);

  function update(next: Saved) {
    setSaved(next);
    store(user?.id, next);
  }
  async function check() {
    if (!ok) return setMsg("bad");
    update({ ...saved, code: clean });
    try {
      await navigator.clipboard.writeText(clean);
      setMsg("copied");
    } catch {
      setMsg("");
    }
    window.open(POLICE_STATUS_URL, "_blank", "noopener,noreferrer");
  }
  async function remind() {
    const d = new Date(Date.now() + 7 * 86_400_000).toLocaleDateString("sv");
    if (await addReminder(x(PS.reminderTitle), d)) setMsg("reminded");
  }
  const color = COLORS.find((c) => c.id === saved.color);

  return (
    <Screen title={x(PS.title)} back>
      <div className="space-y-5">
        <p className="flex items-start gap-3 text-[15px]">
          <IdCard size={24} className="mt-0.5 shrink-0 text-terracotta" aria-hidden /> {x(PS.intro)}
        </p>

        <section className="card space-y-3">
          <label className="block">
            <span className="field-label">{x(PS.codeLabel)}</span>
            <input className="input text-center text-xl tracking-[0.2em]" value={code} onChange={(e) => setCode(e.target.value)} maxLength={16} autoComplete="off" autoCapitalize="characters" spellCheck={false} inputMode="text" data-testid="permit-code" />
          </label>
          <p className="hint">{x(PS.codeHint)}</p>
          {msg === "bad" && <Alert kind="error">{x(PS.codeBad)}</Alert>}
          <button type="button" className="btn" onClick={check} disabled={!clean} data-testid="permit-check">
            <ExternalLink size={18} aria-hidden /> {x(PS.check)}
          </button>
          {msg === "copied" && (
            <p className="alert alert-ok text-[14px]" role="status">
              <Check size={16} className="me-1 inline" aria-hidden />
              {x(PS.copied)}. {x(PS.checkHint)}
            </p>
          )}
          {msg !== "copied" && <p className="hint">{x(PS.checkHint)}</p>}
        </section>

        <section className="card space-y-3" aria-labelledby="ps-color">
          <h2 id="ps-color" className="font-bold">
            {x(PS.whatColor)}
          </h2>
          <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="ps-color">
            {COLORS.map((c) => (
              <button key={c.id} type="button" aria-pressed={saved.color === c.id} onClick={() => update({ ...saved, code: ok ? clean : saved.code, color: c.id, at: new Date().toISOString() })} className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 font-semibold ${saved.color === c.id ? "border-ink" : "border-line"}`} data-testid={`permit-${c.id}`}>
                <Circle size={16} fill={c.dot} stroke={c.dot} aria-hidden /> {x(PS[c.id])}
              </button>
            ))}
          </div>
          {color && (
            <div className="space-y-2" data-testid="permit-meaning">
              <p className="text-[15px]">{x(PS[color.means])}</p>
              {saved.at && (
                <p className="hint">
                  {x(PS.last)}: {new Date(saved.at).toLocaleDateString(lang, { day: "numeric", month: "long" })}
                </p>
              )}
              {color.id === "orange" &&
                (user && available ? (
                  <button type="button" className="btn btn-secondary" onClick={remind} disabled={msg === "reminded"} data-testid="permit-remind">
                    <BellPlus size={18} aria-hidden /> {x(PS.remind)}
                  </button>
                ) : (
                  <p className="hint">{x(PS.loginForReminder)}</p>
                ))}
              {msg === "reminded" && <p className="alert alert-ok text-[14px]">{x(PS.reminded)}</p>}
            </div>
          )}
        </section>

        <p className="alert alert-info text-[14px]">{x(PS.delay)}</p>

        <section className="card space-y-2">
          <h2 className="flex items-center gap-2 font-bold">
            <Mailbox size={20} className="text-terracotta" aria-hidden /> {x(PS.poste)}
          </h2>
          <p className="text-[15px]">{x(PS.posteBody)}</p>
          <a href={POSTE_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <ExternalLink size={18} aria-hidden /> portaleimmigrazione.it
          </a>
        </section>

        {saved.code && (
          <button type="button" className="btn btn-quiet" onClick={() => { update({ code: "" }); setCode(""); store(user?.id, null); }}>
            <Trash2 size={18} aria-hidden /> {x(PS.forget)}
          </button>
        )}
        <p className="hint">{x(PS.source)}</p>
      </div>
    </Screen>
  );
}
