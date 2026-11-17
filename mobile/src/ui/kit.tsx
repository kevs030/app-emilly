import { ChevronLeft, CircleHelp, Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "~/lib/lang";
import { helpHidden, ScreenHelp, setHelpHidden, type HelpId } from "./ScreenHelp";

/** Piezas comunes del sistema de diseño. Las pantallas se construyen con estas, no con estilos sueltos. */

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="A Posto">
      <rect width="64" height="64" rx="18" fill="#A65D3D" />
      <path d="M18 33.5l9.5 9.5L46 23" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Screen({ title, back, help, children }: { title?: string; back?: boolean; help?: HelpId; children: ReactNode }) {
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
              <ChevronLeft size={26} className="rtl:rotate-180" aria-hidden />
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
