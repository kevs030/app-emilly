"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, FileText, HandCoins, House, MapPin } from "lucide-react";

const ITEMS = [
  { href: "/", icon: House, es: "Inicio", en: "Home", it: "Home" },
  { href: "/guias", icon: FileText, es: "Trámites", en: "Guides", it: "Pratiche" },
  { href: "/ayudas", icon: HandCoins, es: "Ayudas", en: "Benefits", it: "Bonus" },
  { href: "/mapa", icon: MapPin, es: "Mapa", en: "Map", it: "Mappa" },
  { href: "/descargar", icon: Download, es: "La app", en: "The app", it: "L'app" },
] as const;

/** Barra inferior tipo app, solo en móvil. */
export function BottomNav({ lang }: { lang: "es" | "en" | "it" }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-[1100] border-t border-border bg-card/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "font-semibold text-brand" : "text-muted"}`}
              >
                <Icon size={20} aria-hidden />
                {it[lang]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
