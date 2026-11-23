import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Download, Mail, Search, ShieldCheck } from "lucide-react";
import { APP } from "@/config/app";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { t, tr } from "@/lib/i18n";
import { guides } from "@/content/guides";
import { LangSwitcher } from "@/components/LangSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { Logo } from "@/components/Icons";
import { ServiceWorker } from "@/components/ServiceWorker";
import { NavMenus } from "@/components/NavMenus";
import { AuthHashRedirect } from "@/components/AuthHashRedirect";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.apostoapp.app"),
  title: { default: "A Posto — Trámites en Italia para migrantes, paso a paso", template: "%s · A Posto" },
  description: "Codice fiscale, tessera sanitaria, residencia, permesso di soggiorno, Decreto Flussi, art. 31, permiso UE de larga duración y ciudadanía: qué hacer, qué documentos llevar y adónde ir. Gratis, con fuentes oficiales.",
  openGraph: { siteName: "A Posto", type: "website", locale: "es_ES" },
  applicationName: "A Posto",
  appleWebApp: { capable: true, title: "A Posto", statusBarStyle: "default" },
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }] },
};

export const viewport: Viewport = {
  themeColor: "#a65337",
  width: "device-width",
  initialScale: 1,
};

const FOOT = {
  es: {
    about: "A Posto es un proyecto independiente. No es una web del Gobierno ni de ninguna institución, y nunca te pedirá dinero por un trámite.",
    explore: "Explorar",
    trust: "Confianza",
    who: "Quiénes somos",
    docs: "Formularios oficiales",
    install: "Descargar la app",
    allGuides: "Ver todos los trámites",
    info: "Información",
    search: "Buscar un trámite",
    searchShort: "Buscar…",
    offices: "Oficinas",
    privacy: "Privacidad",
    menu: "Menú",
    close: "Cerrar",
  },
  en: {
    about: "A Posto is an independent project. It is not a government or institutional website, and it will never ask you for money for a procedure.",
    explore: "Explore",
    trust: "Trust",
    who: "About us",
    docs: "Official forms",
    install: "Get the app",
    allGuides: "See all procedures",
    info: "Information",
    search: "Search a procedure",
    searchShort: "Search…",
    offices: "Offices",
    privacy: "Privacy",
    menu: "Menu",
    close: "Close",
  },
  it: {
    about: "A Posto è un progetto indipendente. Non è un sito del Governo né di un'istituzione e non ti chiederà mai denaro per una pratica.",
    explore: "Esplora",
    trust: "Fiducia",
    who: "Chi siamo",
    docs: "Moduli ufficiali",
    install: "Scarica l'app",
    allGuides: "Vedi tutte le pratiche",
    info: "Informazioni",
    search: "Cerca una pratica",
    searchShort: "Cerca…",
    offices: "Uffici",
    privacy: "Privacy",
    menu: "Menu",
    close: "Chiudi",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const f = FOOT[lang];
  const nav = [
    { href: "/guias", label: t("navGuides", lang) },
    { href: "/ayudas", label: t("navBonus", lang) },
    { href: "/mapa", label: f.offices },
  ];
  const menus = [
    {
      label: t("navBonus", lang),
      items: [
        { href: "/ayudas", label: t("navBonus", lang) },
        { href: "/mapa", label: f.offices },
        { href: "/contactos", label: t("navDirectory", lang) },
      ],
    },
    {
      label: t("navGuides", lang),
      items: [...guides.slice(0, 5).map((g) => ({ href: `/guias/${g.slug}`, label: tr(g.title, lang) })), { href: "/guias", label: f.allGuides }],
    },
  ];
  const info = [
    { href: "/documentos", label: f.docs },
    { href: "/videos", label: t("navVideos", lang) },
    { href: "/contactos", label: t("navDirectory", lang) },
    { href: "/sobre", label: f.who },
    { href: "/privacidad", label: f.privacy },
  ];
  return (
    <html lang={lang} className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AuthHashRedirect />
        <header className="sticky top-0 z-[1000] border-b border-border bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight">
              <Logo /> A Posto
            </Link>
            <nav className="hidden items-center gap-1 text-[15px] md:flex" aria-label="Secciones">
              {/* Un solo menú abierto a la vez */}
              <NavMenus menus={[...menus, { label: f.info, items: info }]} />
            </nav>
            <form action="/guias" role="search" className="ml-auto hidden lg:block">
              <label className="relative block">
                <span className="sr-only">{f.search}</span>
                <Search size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
                <input type="search" name="q" maxLength={60} placeholder={f.searchShort} className="input !min-h-10 w-44 !ps-9 text-sm" />
              </label>
            </form>
            <div className="ml-auto flex items-center gap-2 text-sm lg:ml-0">
              <LangSwitcher current={lang} />
              <Link href="/descargar" className="btn !min-h-10 !w-auto whitespace-nowrap !px-4 text-sm" data-testid="header-download">
                <Download size={16} aria-hidden /> <span className="hidden sm:inline">{f.install}</span>
                <span className="sm:hidden">App</span>
              </Link>
              <MobileMenu groups={[...menus, { label: f.info, items: info }]} searchLabel={f.search} menuLabel={f.menu} closeLabel={f.close} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

        <footer className="border-t border-border bg-[var(--background-alt)]">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 font-bold">
                <Logo size={24} /> A Posto
              </p>
              <p className="mt-2 text-muted">{f.about}</p>
            </div>
            <div>
              <p className="font-semibold">{f.explore}</p>
              <ul className="mt-2 space-y-1 text-muted">
                {[...nav, ...info.slice(1, 3)].map((n) => (
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
                  <Link href="/descargar" className="hover:text-brand">
                    {f.install}
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-brand">
                    {f.privacy}
                  </Link>
                </li>
                <li>
                  <a href={`mailto:${APP.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-brand" data-testid="footer-support">
                    <Mail size={14} aria-hidden /> {APP.contactEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mx-auto flex max-w-5xl items-start gap-2 border-t border-border px-4 py-4 text-xs text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-sage" aria-hidden />
            {t("disclaimer", lang)}
          </p>
        </footer>
        <ServiceWorker />
      </body>
    </html>
  );
}
