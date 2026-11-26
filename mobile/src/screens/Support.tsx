import { HeartHandshake, Mail, MapPin, MessageCircle, Phone, Siren, Globe } from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/auth/AuthProvider";
import { LOCAL, NATIONAL, SP, SUPPORT_CITIES, type SupportPlace } from "~/content/modules/support";
import { addressUrl, mapLink } from "~/lib/maps";
import { Screen } from "~/ui/kit";
import { useT9 } from "~/ui/modules/ModuleBlocks";

const KEY = "aposto:support-city";
const tel = (p: string) => `tel:${p.replace(/\s/g, "")}`;

function readCity(fallback: string | null | undefined): string {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
  } catch {
    /* sin almacenamiento */
  }
  const f = (fallback ?? "").trim().toLowerCase();
  return SUPPORT_CITIES.find((c) => c.toLowerCase() === f) ?? "";
}

function Place({ p }: { p: SupportPlace }) {
  const { x } = useT9();
  return (
    <li className="card space-y-2" data-testid={`support-${p.id}`}>
      <h3 className="font-bold">{p.name}</h3>
      {p.forWho && <p className="tag">{x(p.forWho)}</p>}
      <p className="text-[15px]">{x(p.what)}</p>
      {p.address && (
        <p className="flex items-start gap-2 text-[14px] text-ink-soft">
          <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden /> {p.address}
        </p>
      )}
      {p.hours && <p className="text-[14px] text-ink-soft">{x(p.hours)}</p>}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {p.phone && (
          <a href={tel(p.phone)} className="btn min-h-11 py-2 text-[15px]">
            <Phone size={17} aria-hidden /> {x(SP.call)}
          </a>
        )}
        {p.whatsapp && (
          <a href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary min-h-11 py-2 text-[15px]">
            <MessageCircle size={17} aria-hidden /> WhatsApp
          </a>
        )}
        {p.email && (
          <a href={`mailto:${p.email}`} className="btn btn-secondary min-h-11 py-2 text-[15px]">
            <Mail size={17} aria-hidden /> {x(SP.write)}
          </a>
        )}
        {p.address && (
          <a {...mapLink(addressUrl(p.address))} className="btn btn-secondary min-h-11 py-2 text-[15px]">
            <MapPin size={17} aria-hidden /> {x(SP.map)}
          </a>
        )}
        {p.web && (
          <a href={p.web} target="_blank" rel="noopener noreferrer" className="btn btn-quiet min-h-11 py-2 text-[15px]">
            <Globe size={17} aria-hidden /> {x(SP.web)}
          </a>
        )}
      </div>
    </li>
  );
}

/** Apoyo emocional: líneas para hablar ya, centros de escucha en tu ciudad y opciones en toda Italia. Sin cuenta. */
export function Support() {
  const { x } = useT9();
  const { profile } = useAuth();
  const [city, setCity] = useState(() => readCity(profile?.city));
  const pick = (c: string) => {
    setCity(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* sin almacenamiento */
    }
  };
  const local = LOCAL.filter((p) => p.city === city);
  const [talk, ...rest] = NATIONAL;
  return (
    <Screen title={x(SP.title)} back>
      <div className="space-y-6">
        <header className="rise rounded-3xl bg-sage-soft p-5">
          <HeartHandshake size={34} className="text-sage" aria-hidden />
          <h2 className="mt-2 text-2xl font-bold">{x(SP.hero)}</h2>
          <p className="mt-2 text-[15px]">{x(SP.heroSub)}</p>
        </header>

        <section className="alert alert-error space-y-2" aria-labelledby="sp-urgent" data-testid="support-urgent">
          <h2 id="sp-urgent" className="flex items-center gap-2 font-bold">
            <Siren size={20} aria-hidden /> {x(SP.urgent)}
          </h2>
          <p>{x(SP.urgentBody)}</p>
          <a href="tel:112" className="btn">
            <Phone size={18} aria-hidden /> 112
          </a>
        </section>

        <section aria-labelledby="sp-talk">
          <h2 id="sp-talk" className="mb-3 text-lg font-bold">
            {x(SP.talkNow)}
          </h2>
          <ul>
            <Place p={talk} />
          </ul>
        </section>

        <section aria-labelledby="sp-near">
          <h2 id="sp-near" className="mb-3 text-lg font-bold">
            {x(SP.nearYou)}
          </h2>
          <label className="field-label" htmlFor="sp-city">
            {x(SP.yourCity)}
          </label>
          <select id="sp-city" className="input" value={city} onChange={(e) => pick(e.target.value)} data-testid="support-city">
            <option value="">{x(SP.otherCity)}</option>
            {SUPPORT_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {local.length ? (
            <ul className="mt-3 space-y-3">
              {local.map((p) => (
                <Place key={p.id} p={p} />
              ))}
            </ul>
          ) : (
            <p className="card mt-3 text-ink-soft" data-testid="support-nocity">
              {x(SP.noCity)}
            </p>
          )}
        </section>

        <section aria-labelledby="sp-all">
          <h2 id="sp-all" className="mb-3 text-lg font-bold">
            {x(SP.allItaly)}
          </h2>
          <ul className="space-y-3">
            {rest.map((p) => (
              <Place key={p.id} p={p} />
            ))}
          </ul>
        </section>

        <p className="hint">{x(SP.verify)}</p>
      </div>
    </Screen>
  );
}
