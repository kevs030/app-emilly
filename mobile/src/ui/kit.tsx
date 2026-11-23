import { ArrowLeft, CircleHelp, Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "~/lib/lang";
import { HELP, helpHidden, ScreenHelp, setHelpHidden, type HelpId } from "./ScreenHelp";
import { Illustration } from "./Illustration";

/** Piezas comunes del sistema de diseño. Las pantallas se construyen con estas, no con estilos sueltos. */

export function Logo({ size = 44 }: { size?: number }) {
  // Casa con ✓ de A Posto: el mismo dibujo que en la web (public/logo-aposto.svg).
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="A Posto">
      <path d="M10 30 32 12l22 18v20a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5z" fill="#A65337" stroke="#A65337" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 35.5l7 7 13.5-14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Screen({ title, back, help, banner = true, children }: { title?: string; back?: boolean; help?: HelpId; banner?: boolean; children: ReactNode }) {
  const navigate = useNavigate();
  const { t } = useLang();
  // «Cómo funciona»: abierta la primera vez; luego se abre con el botón «?».
  const [helpOpen, setHelpOpen] = useState(() => (help ? !helpHidden(help) : false));
  const toggleHelp = (open: boolean) => {
    if (!help) return;
    setHelpHidden(help, !open);
    setHelpOpen(open);
  };
  return (
    <div className="safe-top mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-6">
      {(back || title) && (
        <header className="mb-4 flex min-h-11 items-center gap-1">
          {back && (
            <button type="button" onClick={() => navigate(-1)} aria-label={t("back")} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-brown">
              <ArrowLeft size={24} className="rtl:rotate-180" aria-hidden />
            </button>
          )}
          {title && <h1 className="min-w-0 flex-1 text-2xl font-bold tracking-tight">{title}</h1>}
          {help && !helpOpen && (
            <button type="button" onClick={() => toggleHelp(true)} aria-label={t("helpTitle")} className="ms-auto flex min-h-11 items-center gap-1 rounded-full bg-beige px-3 text-[14px] font-semibold text-brown">
              <CircleHelp size={18} aria-hidden /> {t("helpShort")}
            </button>
          )}
        </header>
      )}
      {help && helpOpen && <ScreenHelp id={help} onClose={() => toggleHelp(false)} />}
      {/* Cada sección tiene su ilustración (personas y lugares de Italia); con la ayuda abierta ya se ve dentro de ella. */}
      {help && banner && !helpOpen && <Illustration name={HELP[help]} className="mb-5 !aspect-[16/7] object-cover" />}
      {children}
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function Field({ label, hint, ...props }: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} className="input" {...props} />
      {hint && <p className="hint mt-1">{hint}</p>}
    </div>
  );
}

export function PasswordField({ label, ...props }: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input id={id} className="input pr-14" type={show ? "text" : "password"} {...props} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ocultar" : "Mostrar"} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-ink-soft">
          {show ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p className={`alert ${kind === "error" ? "alert-error" : "alert-ok"}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
