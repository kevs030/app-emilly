import { Bookmark, BookmarkCheck, ChevronDown, ChevronRight, ExternalLink, MapPin, RefreshCw, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { AGENCIES_URL, FLUSSI_URL, JB, JOB_CITY_INFO, portalLinks, SERVIZI_LAVORO_URL } from "~/content/modules/jobs";
import { chooseCity, chosenCity, filterJobs, isSaved, matchCity, savedJobs, splitJobs, toggleSaved, type Job } from "~/lib/jobs";
import { loadJobs } from "~/lib/jobsApi";
import { Screen } from "~/ui/kit";
import { useT9 } from "~/ui/modules/ModuleBlocks";

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

/** «Hace 2 horas», «ayer»… en el idioma de la app. */
function useAgo() {
  const { lang } = useT9();
  return useCallback(
    (iso: string) => {
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
      const mins = Math.round((Date.parse(iso) - Date.now()) / 60_000);
      const s = Math.abs(mins) < 60 ? rtf.format(Math.min(-1, mins), "minute") : Math.abs(mins) < 1440 ? rtf.format(Math.round(mins / 60), "hour") : rtf.format(Math.round(mins / 1440), "day");
      return s.charAt(0).toLocaleUpperCase(lang) + s.slice(1);
    },
    [lang],
  );
}

/** Ciudad para las ofertas: la elegida aquí, si no la del perfil. */
function useJobCity(): [string | null, (c: string) => void] {
  const { profile } = useAuth();
  const [city, setCity] = useState<string | null>(() => chosenCity() ?? matchCity(profile?.city));
  useEffect(() => {
    if (!city) {
      const fromProfile = matchCity(profile?.city);
      if (fromProfile) setCity(fromProfile);
    }
  }, [profile?.city, city]);
  return [city, (c: string) => { chooseCity(c); setCity(c); }];
}

function CityPicker({ value, onPick }: { value: string | null; onPick: (c: string) => void }) {
  const { x } = useT9();
  return (
    <label className="block">
      <span className="field-label">{x(JB.chooseCity)}</span>
      <select className="input" value={value ?? ""} onChange={(e) => e.target.value && onPick(e.target.value)} data-testid="jobs-city">
        <option value="" disabled>
          {x(JB.chooseCity)}
        </option>
        {JOB_CITY_INFO.map((c) => (
          <option key={c.city} value={c.city}>
            {c.city}
          </option>
        ))}
      </select>
    </label>
  );
}

function Tag({ children }: { children: string }) {
  return <span className="rounded-lg bg-cream px-2 py-1 text-[12px] font-semibold text-ink-soft">{children}</span>;
}

function JobCard({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) {
  const { x } = useT9();
  const ago = useAgo();
  const tags = [job.area, job.contract_type && JB[job.contract_type] ? x(JB[job.contract_type]) : null, job.contract_time && JB[job.contract_time] ? x(JB[job.contract_time]) : null].filter(Boolean) as string[];
  return (
    <article className="card space-y-2" data-testid="job-card">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[16px] font-bold leading-snug">{job.title}</h3>
        <button type="button" onClick={onSave} aria-pressed={saved} aria-label={x(saved ? JB.unsave : JB.save)} className="-me-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft" data-testid="job-save">
          {saved ? <BookmarkCheck size={20} className="text-terracotta" aria-hidden /> : <Bookmark size={20} aria-hidden />}
        </button>
      </div>
      {job.company && <p className="text-[14px] text-ink-soft">{job.company}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-ink-soft">
          {ago(job.posted_at)} · Adzuna
        </span>
        <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-terracotta-deep" data-testid="job-open">
          {x(JB.seeOffer)} <ExternalLink size={14} aria-hidden />
        </a>
      </div>
    </article>
  );
}

function JobRow({ job }: { job: Job }) {
  const ago = useAgo();
  return (
    <li>
      <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-between gap-3 border-b border-line py-2" data-testid="job-row">
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold">{job.title}</span>
          <span className="block truncate text-[13px] text-ink-soft">{[job.company, job.area, ago(job.posted_at)].filter(Boolean).join(" · ")}</span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
      </a>
    </li>
  );
}

function Portals({ city }: { city: string }) {
  const { x } = useT9();
  return (
    <section className="space-y-2" aria-labelledby="jobs-portals">
      <h2 id="jobs-portals" className="text-lg font-bold">
        {fill(x(JB.portals), { city })}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {portalLinks(city).map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="card flex min-h-16 flex-col justify-center !p-3" data-testid={`portal-${p.id}`}>
            <span className="text-[15px] font-bold">{p.label}</span>
            <span className="text-[12px] text-ink-soft">{x(p.sub)}</span>
          </a>
        ))}
      </div>
      <p className="hint">{x(JB.portalsHint)}</p>
    </section>
  );
}

/** Sección «Empleo»: ofertas reales de la ciudad, renovadas cada mañana. Sin cuenta y sin publicidad. */
export function Jobs() {
  const { x } = useT9();
  const [city, setCity] = useJobCity();
  const [picking, setPicking] = useState(false);
  const [jobs, setJobs] = useState<Job[] | null | undefined>(undefined); // undefined = cargando, null = error
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState<Job[]>(() => savedJobs());
  const [showSaved, setShowSaved] = useState(false);

  const load = useCallback(() => {
    if (!city) return;
    setJobs(undefined);
    let alive = true;
    void loadJobs(city).then((r) => alive && setJobs(r));
    return () => {
      alive = false;
    };
  }, [city]);
  useEffect(load, [load]);

  const { today, week } = useMemo(() => splitJobs(filterJobs(jobs ?? [], q)), [jobs, q]);
  const all = useMemo(() => splitJobs(jobs ?? []), [jobs]);
  const save = (j: Job) => {
    toggleSaved(j);
    setSaved(savedJobs());
  };

  if (!city || picking) {
    return (
      <Screen title={x(JB.title)} back help="jobs">
        <div className="space-y-4">
          <p className="text-[15px]">{x(JB.chooseCityHint)}</p>
          <CityPicker value={city} onPick={(c) => { setCity(c); setPicking(false); }} />
        </div>
      </Screen>
    );
  }

  const nothing = jobs && all.today.length + all.week.length === 0;
  return (
    <Screen title={x(JB.title)} back help="jobs">
      <div className="space-y-5">
        <button type="button" onClick={() => setPicking(true)} className="-mt-2 inline-flex min-h-11 items-center gap-1 font-bold text-terracotta-deep" aria-label={`${x(JB.changeCity)}: ${city}`} data-testid="jobs-change-city">
          <MapPin size={16} aria-hidden /> {fill(x(JB.cityArea), { city })} <ChevronDown size={16} aria-hidden />
        </button>

        <label className="input flex items-center gap-2">
          <Search size={18} className="shrink-0 text-ink-soft" aria-hidden />
          <span className="sr-only">{x(JB.searchLabel)}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={x(JB.searchPh)} className="min-w-0 flex-1 bg-transparent outline-none" data-testid="jobs-search" />
        </label>

        <div className="grid grid-cols-3 gap-2" data-testid="jobs-counters">
          <div className="rounded-2xl bg-beige p-3">
            <p className="text-[22px] font-extrabold text-terracotta-deep" data-testid="count-today">{jobs ? all.today.length : "–"}</p>
            <p className="text-[12px] font-semibold text-ink-soft">{x(JB.newToday)}</p>
          </div>
          <div className="rounded-2xl bg-sage-soft p-3">
            <p className="text-[22px] font-extrabold text-sage-dark" data-testid="count-week">{jobs ? all.today.length + all.week.length : "–"}</p>
            <p className="text-[12px] font-semibold text-ink-soft">{x(JB.thisWeek)}</p>
          </div>
          <button type="button" onClick={() => setShowSaved((v) => !v)} aria-expanded={showSaved} className="rounded-2xl bg-gold-soft p-3 text-start" data-testid="count-saved">
            <span className="block text-[22px] font-extrabold text-info-ink">{saved.length}</span>
            <span className="block text-[12px] font-semibold text-ink-soft">{x(JB.saved)}</span>
          </button>
        </div>

        <Link to="/jobs/guide" className="flex items-center gap-2 rounded-2xl bg-info p-3 text-[14px] text-info-ink" data-testid="jobs-safe">
          <ShieldCheck size={20} className="shrink-0" aria-hidden />
          <span className="flex-1">
            <strong>{x(JB.safeTitle)}</strong> {x(JB.safeBody)}
          </span>
          <span className="whitespace-nowrap font-bold">{x(JB.learnMore)}</span>
        </Link>

        {showSaved && (
          <section className="space-y-3" aria-labelledby="jobs-saved" data-testid="jobs-saved">
            <h2 id="jobs-saved" className="text-lg font-bold">
              {x(JB.savedTitle)}
            </h2>
            {saved.length === 0 ? <p className="hint">{x(JB.savedEmpty)}</p> : saved.map((j) => <JobCard key={j.id} job={j} saved onSave={() => save(j)} />)}
          </section>
        )}

        {jobs === undefined && <p className="hint" role="status">…</p>}

        {jobs === null && (
          <div className="alert alert-error space-y-2" role="alert" data-testid="jobs-error">
            <p className="flex items-start gap-2">
              <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden /> {x(JB.loadError)}
            </p>
            <button type="button" className="btn btn-secondary" onClick={load}>
              <RefreshCw size={16} aria-hidden /> {x(JB.retry)}
            </button>
          </div>
        )}

        {nothing && (
          <p className="alert alert-info" data-testid="jobs-empty">
            {fill(x(JB.noJobs), { city })}
          </p>
        )}

        {jobs && !nothing && q.trim() && today.length + week.length === 0 && <p className="hint" data-testid="jobs-nomatch">{fill(x(JB.noMatch), { q: q.trim() })}</p>}

        {today.length > 0 && (
          <section className="space-y-3" aria-labelledby="jobs-today">
            <h2 id="jobs-today" className="text-lg font-bold">
              {x(JB.newToday)}
            </h2>
            {today.map((j) => (
              <JobCard key={j.id} job={j} saved={saved.some((s) => s.id === j.id) || isSaved(j.id)} onSave={() => save(j)} />
            ))}
          </section>
        )}

        {week.length > 0 && (
          <section aria-labelledby="jobs-week">
            <h2 id="jobs-week" className="text-lg font-bold">
              {x(JB.thisWeek)}
            </h2>
            <ul>
              {week.map((j) => (
                <JobRow key={j.id} job={j} />
              ))}
            </ul>
          </section>
        )}

        {jobs && !nothing && <p className="hint">{x(JB.source)}</p>}

        <Portals city={city} />

        <Link to="/jobs/guide" className="btn" data-testid="jobs-guide">
          {x(JB.guideBtn)}
        </Link>
      </div>
    </Screen>
  );
}

/** Guía «Cómo buscar trabajo en Italia». */
export function JobsGuide() {
  const { x } = useT9();
  const steps = [
    { t: JB.step1Title, b: JB.step1Body, l: JB.step1Link, href: SERVIZI_LAVORO_URL },
    { t: JB.step2Title, b: JB.step2Body, l: JB.step2Link, href: AGENCIES_URL },
    { t: JB.step3Title, b: JB.step3Body, l: JB.step3Link, href: "https://eures.europa.eu/" },
    { t: JB.step4Title, b: JB.step4Body, l: JB.step4Link, to: "/work" },
  ];
  return (
    <Screen title={x(JB.guideTitle)} back>
      <div className="space-y-4">
        <p className="text-[15px] text-ink-soft">{x(JB.guideIntro)}</p>
        <section className="rounded-3xl bg-sage-soft p-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-sage-dark">{x(JB.docsTitle)}</h2>
          <ul className="mt-2 space-y-1 text-[15px]">
            {[JB.doc1, JB.doc2, JB.doc3, JB.doc4].map((d, i) => (
              <li key={i}>✓ {x(d)}</li>
            ))}
          </ul>
        </section>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="card flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta font-bold text-white" aria-hidden>
                {i + 1}
              </span>
              <div className="space-y-1">
                <h2 className="font-bold">{x(s.t)}</h2>
                <p className="text-[15px]">{x(s.b)}</p>
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-terracotta-deep">
                    {x(s.l)} <ExternalLink size={14} aria-hidden />
                  </a>
                ) : (
                  <Link to={s.to!} className="inline-flex min-h-11 items-center gap-1 font-semibold text-terracotta-deep">
                    {x(s.l)} <ChevronRight size={14} aria-hidden />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        <section className="alert alert-error space-y-2" data-testid="guide-scams">
          <h2 className="font-bold">{x(JB.scamTitle)}</h2>
          <ul className="list-disc space-y-1 ps-5 text-[15px]">
            {[JB.scam1, JB.scam2, JB.scam3, JB.scam4].map((d, i) => (
              <li key={i}>{x(d)}</li>
            ))}
          </ul>
        </section>
        <section className="card space-y-1">
          <h2 className="font-bold">{x(JB.abroadTitle)}</h2>
          <p className="text-[15px]">{x(JB.abroadBody)}</p>
          <a href={FLUSSI_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-terracotta-deep">
            {x(JB.abroadLink)} <ExternalLink size={14} aria-hidden />
          </a>
        </section>
        <p className="hint">{x(JB.guideSource)}</p>
        <Link to="/jobs" className="btn">
          {x(JB.seeJobs)}
        </Link>
      </div>
    </Screen>
  );
}
