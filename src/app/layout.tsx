import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { getUser } from "@/lib/supabase/server";
import { LangSwitcher } from "@/components/LangSwitcher";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Icons";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "A posto — Guía para migrantes en Italia", template: "%s · A posto" },
  description: "Trámites, ayudas, mapas, videos y comunidad para personas migrantes en Italia. Información gratuita con fuentes oficiales.",
  applicationName: "A posto",
  appleWebApp: { capable: true, title: "A posto", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

const FOOT = {
  es: {
    about: "A posto es un proyecto independiente. No es una web del Gobierno ni de ninguna institución, y nunca te pedirá dinero por un trámite.",
    explore: "Explorar",
    trust: "Confianza",
    who: "Quiénes somos",
    docs: "Formularios oficiales",
    install: "Descargar la app",
    privacy: "Privacidad",
  },
  en: {
    about: "A posto is an independent project. It is not a government or institutional website, and it will never ask you for money for a procedure.",
    explore: "Explore",
    trust: "Trust",
    who: "About us",
    docs: "Official forms",
    install: "Get the app",
    privacy: "Privacy",
  },
  it: {
    about: "A posto è un progetto indipendente. Non è un sito del Governo né di un'istituzione e non ti chiederà mai denaro per una pratica.",
    explore: "Esplora",
    trust: "Fiducia",
    who: "Chi siamo",
    docs: "Moduli ufficiali",
    install: "Scarica l'app",
    privacy: "Privacy",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const user = await getUser();
  const f = FOOT[lang];
  const nav = [
    { href: "/guias", label: t("navGuides", lang) },
    { href: "/ayudas", label: t("navBonus", lang) },
    { href: "/asistente", label: t("navAssistant", lang) },
    { href: "/mapa", label: t("navMap", lang) },
    { href: "/videos", label: t("navVideos", lang) },
    { href: "/contactos", label: t("navDirectory", lang) },
    { href: "/foro", label: t("navForum", lang) },
  ];
  return (
    <html lang={lang} className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-[1000] border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <Logo /> A posto
            </Link>
            <nav className="hidden gap-4 text-sm sm:flex" aria-label="Secciones">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap text-muted transition-colors hover:text-brand">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3 text-sm">
              <LangSwitcher current={lang} />
              <Link href={user ? "/perfil" : "/entrar"} className="btn-ghost px-3 py-1.5">
                <UserRound size={16} aria-hidden />
                {user ? t("navProfile", lang) : t("login", lang)}
              </Link>
            </div>
          </div>
          <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm sm:hidden" aria-label="Más secciones">
            {nav
              .filter((n) => ["/ayudas", "/videos", "/contactos"].includes(n.href))
              .concat([{ href: "/documentos", label: f.docs }])
              .map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap text-muted">
                  {n.label}
                </Link>
              ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

        <footer className="border-t border-border bg-card pb-24 sm:pb-0">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 font-bold">
                <Logo size={24} /> A posto
              </p>
              <p className="mt-2 text-muted">{f.about}</p>
            </div>
            <div>
              <p className="font-semibold">{f.explore}</p>
              <ul className="mt-2 space-y-1 text-muted">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="hover:text-brand">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">{f.trust}</p>
              <ul className="mt-2 space-y-1 text-muted">
                <li>
                  <Link href="/sobre" className="hover:text-brand">
                    {f.who}
                  </Link>
                </li>
                <li>
                  <Link href="/documentos" className="hover:text-brand">
                    {f.docs}
                  </Link>
                </li>
                <li>
                  <Link href="/instalar" className="hover:text-brand">
                    {f.install}
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-brand">
                    {f.privacy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <p className="mx-auto flex max-w-5xl items-start gap-2 border-t border-border px-4 py-4 text-xs text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
            {t("disclaimer", lang)}
          </p>
        </footer>
        <BottomNav lang={lang} />
      </body>
    </html>
  );
}
