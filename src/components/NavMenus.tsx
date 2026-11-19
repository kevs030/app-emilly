"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Menu = { label: string; items: { href: string; label: string }[] };

/**
 * Menús desplegables del encabezado: solo uno abierto a la vez.
 * Se abre y cierra con clic (o Enter/Espacio); al abrir otro, el anterior se cierra.
 * Se cierra también al elegir un enlace, al hacer clic fuera o con la tecla Escape.
 */
export function NavMenus({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open === null) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={root} className="flex items-center gap-1">
      {menus.map((m, i) => {
        const isOpen = open === i;
        const id = `nav-menu-${i}`;
        return (
          <div key={m.label} className="relative">
            <button type="button" className="nav-link flex cursor-pointer items-center gap-1" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? null : i)}>
              {m.label} <ChevronDown size={16} aria-hidden className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <ul id={id} className="card absolute start-0 top-full z-10 mt-2 w-64 space-y-0.5 !p-2">
                {m.items.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="nav-link block" onClick={() => setOpen(null)}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
