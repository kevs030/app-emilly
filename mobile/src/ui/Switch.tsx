/** Interruptor accesible con texto y explicación. */
export function Switch({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className="flex min-h-11 w-full items-center gap-3 text-start disabled:opacity-50">
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-[14px] text-ink-soft">{hint}</span>}
      </span>
      <span className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${checked ? "bg-terracotta-deep" : "bg-beige"}`}>
        <span className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6 rtl:-translate-x-6" : ""}`} />
      </span>
    </button>
  );
}
