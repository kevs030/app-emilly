"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

/** Menú de la web en el móvil: un botón que abre la lista de secciones y el buscador (sin barra inferior tipo app). */
export function MobileMenu({ groups, searchLabel, menuLabel, closeLabel }: { groups: { label: string; items: Item[] }[]; searchLabel: string; menuLabel: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={menuLabel} aria-expanded={open} className="flex h-11 w-11 items-center justify-center rounded-xl border border-border md:hidden" data-testid="mobile-menu-button">
        <Menu size={22} aria-hidden />
      </button>
      {open && (
        <div className="fixed inset-0 z-[1100] bg-black/30 md:hidden" onClick={() => setOpen(false)}>
          <nav aria-label={menuLabel} className="absolute inset-y-0 end-0 w-[min(340px,88vw)] overflow-y-auto bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()} data-testid="mobile-menu">
            <div className="flex items-center justify-between">
              <span className="font-bold">A Posto</span>
              <button type="button" onClick={() => setOpen(false)} aria-label={closeLabel} className="flex h-11 w-11 items-center justify-center rounded-xl">
                <X size={22} aria-hidden />
              </button>
            </div>
            <form action="/guias" role="search" className="mt-3">
              <label className="relative block">
                <span className="sr-only">{searchLabel}</span>
                <Search size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
                <input type="search" name="q" maxLength={60} placeholder={searchLabel} className="input !min-h-11 w-full !ps-9" />
              </label>
            </form>
            {groups.map((g) => (
              <div key={g.label} className="mt-5">
                <p className="eyebrow">{g.label}</p>
                <ul className="mt-2">
                  {g.items.map((n) => (
                    <li key={n.href}>
                      <Link href={n.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-lg px-2 text-[15px] font-medium hover:bg-[var(--background-alt)]">
                        {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
