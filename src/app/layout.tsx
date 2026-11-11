import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { getUser } from "@/lib/supabase/server";
import { LangSwitcher } from "@/components/LangSwitcher";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Emilly — Guía para migrantes en Italia",
  description: "Trámites, ayudas, mapas, videos y comunidad para personas migrantes en Italia.",
  applicationName: "Emilly",
  appleWebApp: { capable: true, title: "Emilly", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const user = await getUser();
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
        <header className="sticky top-0 z-[1000] border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand">
              Emilly
            </Link>
            <nav className="order-3 flex w-full gap-3 overflow-x-auto text-sm sm:order-none sm:w-auto">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-brand">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3 text-sm">
              <LangSwitcher current={lang} />
              {user ? (
                <Link href="/perfil" className="hover:text-brand">
                  {t("navProfile", lang)}
                </Link>
              ) : (
                <Link href="/entrar" className="hover:text-brand">
                  {t("login", lang)}
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted">
          <p>{t("disclaimer", lang)}</p>
          <p className="mt-2 space-x-3">
            <Link href="/instalar" className="underline">
              📲 {lang === "en" ? "Install the app" : lang === "it" ? "Installa l'app" : "Instalar la app"}
            </Link>
            <Link href="/privacidad" className="underline">
              Privacidad / Privacy
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
