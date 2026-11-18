import { CalendarCheck, ExternalLink, Landmark, Map, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { COUNTRIES, CS, findConsulates, IT_CITIES, type Consulate } from "~/content/modules/consulates";
import { ConsulateMap } from "~/ui/ConsulateMap";
import { Screen } from "~/ui/kit";
import { useT9 } from "~/ui/modules/ModuleBlocks";

const KEY = "aposto:consulate";
type Sel = { country: string; city: string };
function load(): Sel {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Sel> | null;
    return { country: typeof v?.country === "string" ? v.country : "", city: typeof v?.city === "string" ? v.city : "" };
  } catch {
    return { country: "", city: "" };
  }
}

/** Nombre del país en el idioma de la persona (lo da el propio teléfono). */
function countryNamer(lang: string): (code: string) => string {
  try {
    const dn = new Intl.DisplayNames([lang, "en"], { type: "region" });
    return (code) => dn.of(code) ?? code;
  } catch {
    return (code) => code;
  }
}

export function Consulates() {
  const { x, lang } = useT9();
  const name = useMemo(() => countryNamer(lang), [lang]);
  const [sel, setSel] = useState<Sel>(load);
  const [map, setMap] = useState<Consulate | null>(null);
  const update = (patch: Partial<Sel>) => {
    const next = { ...sel, ...patch };
    setSel(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* sin almacenamiento */
    }
  };
  const countries = useMemo(() => [...COUNTRIES].sort((a, b) => name(a).localeCompare(name(b), lang)), [name, lang]);
  const results = sel.country && sel.country !== "other" ? findConsulates(sel.country, sel.city) : [];

  return (
    <Screen title={x(CS.title)} back>
      <div className="rise space-y-5">
        <p className="text-[15px] text-ink-soft">{x(CS.sub)}</p>
        <section className="card grid gap-3">
          <label className="block">
            <span className="field-label">{x(CS.nationality)}</span>
            <select className="input" value={sel.country} onChange={(e) => update({ country: e.target.value })} data-testid="cs-country">
              <option value="">{x(CS.choose)}</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {name(c)}
                </option>
              ))}
              <option value="other">{x(CS.other)}</option>
            </select>
          </label>
          <label className="block">
            <span className="field-label">{x(CS.city)}</span>
            <select className="input" value={sel.city} onChange={(e) => update({ city: e.target.value })} data-testid="cs-city">
              <option value="">{x(CS.choose)}</option>
              {IT_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        {sel.country === "other" && <p className="alert alert-info">{x(CS.none)}</p>}

        {results.length > 0 && (
          <ul className="space-y-3" aria-live="polite" data-testid="cs-results">
            {results.map((c) => (
              <li key={c.id} className="card space-y-2" data-testid={`cs-${c.id}`}>
                <div className="flex items-start gap-3">
                  <span className="icon-tile shrink-0">
                    <Landmark size={20} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold leading-snug">{c.name}</h2>
                    <p className="text-[13px] text-ink-soft">
                      {c.city}
                      {c.local ? (
                        <span className="tag ms-2">{x(CS.inCity)}</span>
                      ) : (
                        c.km !== null && (
                          <>
                            {" "}
                            · {c.km} {x(CS.away)}
                          </>
                        )
                      )}
                    </p>
                  </div>
                </div>
                <p className="flex gap-2 text-[15px]">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-sage" aria-hidden /> <span>{c.address}</span>
                </p>
                {c.phone && (
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex min-h-11 items-center gap-2 font-semibold text-terracotta-hover underline underline-offset-2">
                    <Phone size={18} aria-hidden /> {c.phone}
                  </a>
                )}
                <div className="grid gap-2 pt-1">
                  <button type="button" className="btn" onClick={() => setMap(c)}>
                    <Map size={18} aria-hidden /> {x(CS.map)}
                  </button>
                  {c.booking && (
                    <a href={c.booking} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                      <CalendarCheck size={18} aria-hidden /> {x(CS.booking)}
                    </a>
                  )}
                  {c.web && c.web !== c.booking && (
                    <a href={c.web} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                      <ExternalLink size={18} aria-hidden /> {x(CS.web)}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {sel.country && <p className="alert alert-info text-[14px]">{x(CS.verify)}</p>}
        <p className="hint">© OpenStreetMap</p>
      </div>
      {map && <ConsulateMap c={map} onClose={() => setMap(null)} />}
    </Screen>
  );
}
