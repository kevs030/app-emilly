import { CheckCircle2, ChevronDown, Circle, Download, ExternalLink, Fingerprint, GraduationCap, HeartPulse, House, Landmark, MapPin, Phone } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "~/auth/AuthProvider";
import { BANK, BANKS, CPIA, CPIA_CARDS, CPIA_SEARCH_URL, HOSP, HOSP_FORM_URL, IG, ISEE, ISEE_LINKS, questuraUrl, SPID, SPID_URL } from "~/content/modules/integration";
import type { T9 } from "~/content/modules/types";
import { useT9 } from "~/ui/modules/ModuleBlocks";

type Item = { id: string; icon: typeof House; title: T9; body: () => ReactNode };
const ITEMS_IDS = ["hosp", "spid", "cpia", "isee", "bank"] as const;

const progressKey = (userId?: string) => `aposto:integration:${userId ?? "guest"}`;
function loadDone(userId?: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(progressKey(userId)) ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((s): s is string => (ITEMS_IDS as readonly string[]).includes(s as string)) : [];
  } catch {
    return [];
  }
}

function Out({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn ${primary ? "" : "btn-secondary"} !min-h-12 !text-[15px]`}>
      <ExternalLink size={18} className="shrink-0" aria-hidden /> <span className="min-w-0 break-words">{children}</span>
    </a>
  );
}
function H({ children }: { children: ReactNode }) {
  return <h4 className="mt-4 text-[13px] font-bold uppercase tracking-wide text-ink-soft">{children}</h4>;
}
function Bullets({ items, numbered }: { items: string[]; numbered?: boolean }) {
  const L = numbered ? "ol" : "ul";
  return (
    <L className={`mt-1 space-y-1.5 ps-5 text-[15px] ${numbered ? "list-decimal" : "list-disc"}`}>
      {items.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </L>
  );
}

function Hospitality() {
  const { x } = useT9();
  const [city, setCity] = useState(() => {
    try {
      return localStorage.getItem("aposto:city:hosp") ?? "";
    } catch {
      return "";
    }
  });
  const choose = (v: string) => {
    setCity(v);
    try {
      localStorage.setItem("aposto:city:hosp", v);
    } catch {
      /* sin almacenamiento */
    }
  };
  return (
    <>
      <p className="tag !bg-gold-soft !text-terracotta-hover">⏱ 48 h</p>
      <p className="mt-2">{x(HOSP.summary)}</p>
      <div className="mt-3 grid gap-1">
        <a href={HOSP_FORM_URL} target="_blank" rel="noopener noreferrer" download className="btn !min-h-12 !text-[15px]">
          <Download size={18} aria-hidden /> {x(HOSP.download)}
        </a>
        <p className="hint">{x(HOSP.formNote)}</p>
      </div>
      <H>{x(HOSP.reqTitle)}</H>
      <Bullets items={HOSP.reqs.map(x)} />
      <H>{x(HOSP.deliveryTitle)}</H>
      <Bullets items={HOSP.delivery.map(x)} />
      <H>{x(HOSP.cityTitle)}</H>
      <select className="input mt-1" value={city} onChange={(e) => choose(e.target.value)} aria-label={x(HOSP.cityTitle)} data-testid="hosp-city">
        <option value="">—</option>
        {HOSP.cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {city && (
        <div className="rise mt-2 space-y-2" aria-live="polite">
          <p className="alert alert-ok text-[14px]">{x(HOSP.cityNote)}</p>
          <Out href={questuraUrl(city)}>Questura di {city}</Out>
        </div>
      )}
    </>
  );
}

function Spid() {
  const { x } = useT9();
  return (
    <>
      <p>{x(SPID.summary)}</p>
      <H>{x(IG.steps)}</H>
      <Bullets numbered items={SPID.steps.map(x)} />
      <div className="mt-3 grid">
        <Out href={SPID_URL} primary>
          {x(SPID.link)}
        </Out>
      </div>
    </>
  );
}

function Cpia() {
  const { x } = useT9();
  return (
    <>
      <p>{x(CPIA.summary)}</p>
      <H>{x(IG.steps)}</H>
      <Bullets numbered items={CPIA.steps.map(x)} />
      <ul className="mt-3 space-y-3">
        {CPIA_CARDS.map((c) => (
          <li key={c.id} className="rounded-2xl border border-line bg-cream p-3 text-[15px]" data-testid={`cpia-${c.id}`}>
            <p className="font-bold">{c.name}</p>
            <p className="mt-1 flex gap-2">
              <MapPin size={18} className="mt-0.5 shrink-0 text-sage" aria-hidden /> <span>{c.main}</span>
            </p>
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="mt-1 flex min-h-11 items-center gap-2 font-semibold text-terracotta-hover underline">
                <Phone size={18} aria-hidden /> {c.phone}
              </a>
            )}
            {c.others.length > 0 && <Bullets items={c.others} />}
            {c.id === "vt" && <p className="alert alert-info mt-2 text-[14px]">{x(CPIA.romeNote)}</p>}
            <div className="mt-2 grid">
              <Out href={c.url}>{c.id === "vt" ? x(CPIA.search) : x(CPIA.web)}</Out>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 grid">
        <Out href={CPIA_SEARCH_URL}>{x(CPIA.search)}</Out>
      </div>
    </>
  );
}

function Isee() {
  const { x } = useT9();
  return (
    <>
      <p>{x(ISEE.summary)}</p>
      <H>{x(IG.steps)}</H>
      <Bullets numbered items={ISEE.steps.map(x)} />
      <ul className="mt-3 space-y-2">
        {ISEE_LINKS.map((l) => (
          <li key={l.id}>
            <Out href={l.url}>{x(l.label)}</Out>
            <p className="hint mt-1">{x(l.what)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Bank() {
  const { x } = useT9();
  return (
    <>
      <p>{x(BANK.summary)}</p>
      <H>{x(HOSP.reqTitle)}</H>
      <Bullets items={BANK.reqs.map(x)} />
      <H>{x(BANK.compare)}</H>
      <ul className="mt-2 grid gap-2">
        {BANKS.map((b) => (
          <li key={b.id}>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-cream p-3">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {b.name} · <span className="font-medium text-ink-soft">{b.product}</span>
                </span>
                <span className="block text-[14px] text-ink-soft">{x(b.kind)}</span>
              </span>
              <ExternalLink size={18} className="shrink-0 text-terracotta" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <p className="alert alert-info mt-3 text-[14px]">{x(BANK.costs)}</p>
    </>
  );
}

const ITEMS: Item[] = [
  { id: "hosp", icon: House, title: HOSP.title, body: () => <Hospitality /> },
  { id: "spid", icon: Fingerprint, title: SPID.title, body: () => <Spid /> },
  { id: "cpia", icon: GraduationCap, title: CPIA.title, body: () => <Cpia /> },
  { id: "isee", icon: HeartPulse, title: ISEE.title, body: () => <Isee /> },
  { id: "bank", icon: Landmark, title: BANK.title, body: () => <Bank /> },
];

/** «Guía de integración y primeros pasos»: lista con acordeones; el progreso se guarda en este teléfono. */
export function IntegrationGuide() {
  const { x } = useT9();
  const { user } = useAuth();
  const [done, setDone] = useState<string[]>(() => loadDone(user?.id));
  const [open, setOpen] = useState<string | null>(null);
  const toggleDone = (id: string) => {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(progressKey(user?.id), JSON.stringify(next));
    } catch {
      /* sin almacenamiento: el progreso dura hasta cerrar la app */
    }
  };
  const pct = Math.round((done.length / ITEMS.length) * 100);
  return (
    <section className="card space-y-4" aria-labelledby="ig-title" data-testid="integration-guide">
      <div>
        <h2 id="ig-title" className="text-lg font-bold">
          {x(IG.title)}
        </h2>
        <p className="mt-1 text-[15px] text-ink-soft">{x(IG.sub)}</p>
      </div>
      <div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={x(IG.title)}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[14px] text-ink-soft" data-testid="ig-count">
          {done.length} {x(IG.of)} {ITEMS.length}
        </p>
      </div>
      <ul className="space-y-2">
        {ITEMS.map((it) => {
          const isOpen = open === it.id;
          const isDone = done.includes(it.id);
          return (
            <li key={it.id} className={`rounded-2xl border ${isDone ? "border-sage/50 bg-sage-soft/50" : "border-line bg-white"}`}>
              <button type="button" aria-expanded={isOpen} aria-controls={`ig-${it.id}`} onClick={() => setOpen(isOpen ? null : it.id)} className="flex min-h-14 w-full items-center gap-3 p-3 text-start">
                <span className="icon-tile shrink-0">
                  <it.icon size={20} aria-hidden />
                </span>
                <span className="min-w-0 flex-1 font-semibold">{x(it.title)}</span>
                {isDone && <CheckCircle2 size={20} className="shrink-0 text-sage" aria-label={x(IG.done)} />}
                <ChevronDown size={20} className={`shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {isOpen && (
                <div id={`ig-${it.id}`} className="rise border-t border-line px-3 pb-3 pt-3 text-[15px]">
                  {it.body()}
                  <p className="hint mt-3">{x(IG.verify)}</p>
                  <button type="button" aria-pressed={isDone} onClick={() => toggleDone(it.id)} className={`btn mt-3 ${isDone ? "btn-secondary" : ""}`}>
                    {isDone ? <Circle size={18} aria-hidden /> : <CheckCircle2 size={18} aria-hidden />} {x(isDone ? IG.undo : IG.markDone)}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
