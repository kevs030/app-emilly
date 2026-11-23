import { FileText, HandCoins, House, LogIn, MapPin, MessageCircle, UserRound, UsersRound, WifiOff } from "lucide-react";
import { forumBadge, useForumActivity } from "~/lib/forumActivity";
import { useEffect, useState } from "react";
import { useApkUpdate } from "~/lib/liveUpdate";
import { API_URL } from "~/lib/supabase";
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "~/auth/AuthProvider";
import { LangProvider, useLang } from "~/lib/lang";
import { PersonalProvider } from "~/lib/personal";
import { useSessionTracking } from "~/lib/useSessionTracking";
import { useScreenTracking } from "~/lib/useScreenTracking";
import { MyData } from "~/screens/MyData";
import { Appointments } from "~/screens/Appointments";
import { Assistant } from "~/screens/Assistant";
import { ChatHistory } from "~/screens/ChatHistory";
import { Community, CommunityNew, CommunityPost } from "~/screens/Community";
import { Documents } from "~/screens/Documents";
import { MyFile } from "~/screens/MyFile";
import { Notifications } from "~/screens/Notifications";
import { OfficesMap } from "~/screens/OfficesMap";
import { Scan } from "~/screens/Scan";
import { Simulator } from "~/screens/Simulator";
import { AppLock } from "~/ui/AppLock";
import { NotifySync } from "~/ui/NotifySync";
import { isRecovering } from "~/ui/EmailCode";
import { Auth } from "~/screens/Auth";
import { Benefits } from "~/screens/Benefits";
import { Consulates } from "~/screens/Consulates";
import { Work } from "~/screens/Work";
import { GuideDetail, Guides } from "~/screens/Guides";
import { Home } from "~/screens/Home";
import { NewPassword, ResetPassword } from "~/screens/Password";
import { Privacy } from "~/screens/Privacy";
import { Profile } from "~/screens/Profile";
import { Search } from "~/screens/Search";
import { Start } from "~/screens/Start";
import { Tour } from "~/screens/Tour";
import { Welcome } from "~/screens/Welcome";

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function Splash() {
  const { t } = useLang();
  return <div className="flex h-full items-center justify-center text-ink-soft">{t("loading")}</div>;
}

/**
 * Pantallas de la app. Sin sesión se vuelve a la bienvenida, salvo las de consulta (`guestOk`):
 * guías, ayudas, buscador y mapa se pueden leer sin cuenta, para que nadie tenga que dar
 * un correo o un número solo para informarse.
 */
function Private({ guestOk = false }: { guestOk?: boolean }) {
  const { ready, session, profile } = useAuth();
  const { t } = useLang();
  const online = useOnline();
  const path = useLocation().pathname;
  const bare = path === "/tour" || path === "/start"; // guía de uso y cuestionario a pantalla completa
  useSessionTracking(Boolean(session && profile?.consent_analytics));
  useScreenTracking(Boolean(session && profile?.consent_analytics));
  // Punto rojo en «Comunidad»: preguntas nuevas y respuestas a mis preguntas.
  const forum = useForumActivity(session?.user.id);
  const apk = useApkUpdate();
  if (!ready) return <Splash />;
  if (!session && !guestOk) return <Navigate to="/welcome" replace />;
  const guest = !session;
  const badge = forumBadge(forum);
  const tabs = guest
    ? [
        { to: "/guides", icon: FileText, label: t("tabGuides"), end: false },
        { to: "/benefits", icon: HandCoins, label: t("benefits"), end: false },
        { to: "/map", icon: MapPin, label: t("offices"), end: false },
        { to: "/welcome", icon: LogIn, label: t("signIn"), end: false },
      ]
    : [
        { to: "/", icon: House, label: t("tabHome"), end: true },
        { to: "/guides", icon: FileText, label: t("tabGuides"), end: false },
        { to: "/community", icon: UsersRound, label: t("community"), end: false },
        { to: "/assistant", icon: MessageCircle, label: t("tabAssistant"), end: false },
        { to: "/profile", icon: UserRound, label: t("tabProfile"), end: false },
      ];
  return (
    <AppLock>
      <div className="flex h-full flex-col">
        {!online && (
          <p className="safe-top flex items-center justify-center gap-2 bg-beige px-4 pb-2 text-[14px]" role="status">
            <WifiOff size={16} aria-hidden /> {t("offline")}
          </p>
        )}
        {guest && (
          <p className="safe-top flex flex-wrap items-center justify-center gap-x-2 bg-sage-soft px-4 pb-2 pt-2 text-center text-[14px]" role="note">
            {t("guestBanner")}{" "}
            <Link to="/welcome" className="inline-flex min-h-11 items-center font-semibold text-brown underline">
              {t("guestCreate")}
            </Link>
          </p>
        )}
        {apk && (
          <p className="safe-top flex flex-wrap items-center justify-center gap-x-3 bg-gold-soft px-4 pb-2 pt-2 text-center text-[14px] font-medium" role="status">
            {t("apkUpdate")}
            <a href={new URL(apk.url, API_URL).toString()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold text-terracotta-hover underline">
              {t("apkUpdateCta")}
            </a>
          </p>
        )}
        <main className="flex-1 overflow-y-auto">
          <PersonalProvider>
            <NotifySync />
            <Outlet />
          </PersonalProvider>
        </main>
        {!bare && (
          <nav className="safe-bottom border-t border-line bg-white" aria-label="Principal">
            <ul className="mx-auto flex max-w-md">
              {tabs.map((tab) => (
                <li key={tab.to} className="flex-1">
                  <NavLink to={tab.to} end={tab.end} className={({ isActive }) => `group flex min-h-14 flex-col items-center justify-center gap-0.5 pt-1.5 text-[12px] ${isActive ? "font-bold text-terracotta-deep" : "font-medium text-ink-soft"}`}>
                    <span className="relative flex h-8 items-center justify-center">
                      <tab.icon size={24} strokeWidth={2} aria-hidden />
                      {tab.to === "/community" && badge > 0 && (
                        <span className="absolute -end-2.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta-deep px-1 text-[11px] font-bold text-white" data-testid="community-badge" aria-label={`${badge}`}>
                          {badge > 9 ? "9+" : badge}
                        </span>
                      )}
                    </span>
                    {tab.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </AppLock>
  );
}

/** Pantallas públicas: con sesión se va directo al inicio. */
function Public() {
  const { ready, session } = useAuth();
  if (!ready) return <Splash />;
  if (session) return <Navigate to={isRecovering() ? "/new-password" : "/"} replace />;
  return <Outlet />;
}

export function App() {
  return (
    <LangProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <Routes>
            <Route element={<Public />}>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset" element={<ResetPassword />} />
            </Route>
            <Route path="/new-password" element={<NewPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route element={<Private guestOk />}>
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<GuideDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/map" element={<OfficesMap />} />
              <Route path="/consulates" element={<Consulates />} />
              <Route path="/work" element={<Work />} />
            </Route>
            <Route element={<Private />}>
              <Route path="/" element={<Home />} />
              <Route path="/tour" element={<Tour />} />
              <Route path="/start" element={<Start />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/assistant/history" element={<ChatHistory />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/file" element={<MyFile />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/new" element={<CommunityNew />} />
              <Route path="/community/:id" element={<CommunityPost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/data" element={<MyData />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LangProvider>
  );
}
