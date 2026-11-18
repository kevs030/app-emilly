import { ArrowRight, Briefcase, Landmark, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { CS } from "~/content/modules/consulates";
import { MQ, QUOTES, quoteIndexFor, WORK } from "~/content/modules/motivation";
import { useT9 } from "~/ui/modules/ModuleBlocks";

/** Frase de ánimo del día (cambia a medianoche). */
export function DailyQuote() {
  const { x } = useT9();
  const q = QUOTES[quoteIndexFor(new Date())];
  return (
    <figure className="card border-gold/60 bg-gold-soft" data-testid="daily-quote">
      <figcaption className="flex items-center gap-2 text-[14px] font-semibold text-terracotta-hover">
        <Quote size={18} aria-hidden /> {x(MQ.ofDay)}
      </figcaption>
      <blockquote className="mt-2 text-[18px] font-semibold leading-snug">«{x(q)}»</blockquote>
    </figure>
  );
}

/** Acceso a «Mi consulado». */
export function ConsulateCard() {
  const { x } = useT9();
  return (
    <Link to="/consulates" className="card flex items-center gap-3" data-testid="consulate-card">
      <span className="icon-tile shrink-0">
        <Landmark size={22} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{x(CS.title)}</span>
        <span className="block text-[14px] text-ink-soft">{x(CS.sub)}</span>
      </span>
      <ArrowRight size={20} className="rtl:rotate-180 shrink-0 text-terracotta" aria-hidden />
    </Link>
  );
}

/** «Trabajo y beneficios laborales»: sección en preparación (sin botones que no hagan nada). */
export function WorkSoon() {
  const { x } = useT9();
  return (
    <section className="card space-y-2" aria-labelledby="work-title" data-testid="work-soon">
      <div className="flex flex-wrap items-center gap-2">
        <span className="icon-tile shrink-0">
          <Briefcase size={22} aria-hidden />
        </span>
        <h2 id="work-title" className="min-w-0 flex-1 text-lg font-bold">
          {x(WORK.title)}
        </h2>
      </div>
      <span className="tag !bg-gold-soft !text-terracotta-hover">{x(WORK.badge)}</span>
      <p className="text-[15px] text-ink-soft">{x(WORK.body)}</p>
    </section>
  );
}
