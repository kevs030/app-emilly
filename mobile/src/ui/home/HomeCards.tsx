import { ArrowRight, Briefcase, Landmark, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { CS } from "~/content/modules/consulates";
import { MQ, QUOTES, quoteIndexFor } from "~/content/modules/motivation";
import { WK } from "~/content/modules/work";
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

/** Acceso a «Trabajo y beneficios laborales». */
export function WorkCard() {
  const { x } = useT9();
  return (
    <Link to="/work" className="card flex items-center gap-3" data-testid="work-card">
      <span className="icon-tile shrink-0">
        <Briefcase size={22} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-semibold">
          {x(WK.title)} <span className="tag !bg-gold-soft !text-terracotta-hover">{x(WK.isNew)}</span>
        </span>
        <span className="block text-[14px] text-ink-soft">{x(WK.sub)}</span>
      </span>
      <ArrowRight size={20} className="rtl:rotate-180 shrink-0 text-terracotta" aria-hidden />
    </Link>
  );
}
