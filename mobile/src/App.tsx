import { FileText, House, MessageCircle, UserRound, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "~/auth/AuthProvider";
import { LangProvider, useLang } from "~/lib/lang";
import { PersonalProvider } from "~/lib/personal";
import { useSessionTracking } from "~/lib/useSessionTracking";
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
import { NotifySync } from "~/ui/NotifySync";
import { Auth } from "~/screens/Auth";
import { Benefits } from "~/screens/Benefits";
import { GuideDetail, Guides } from "~/screens/Guides";
import { Home } from "~/screens/Home";
import { NewPassword, ResetPassword } from "~/screens/Password";
import { Privacy } from "~/screens/Privacy";
import { Profile } from "~/screens/Profile";
import { Search } from "~/screens/Search";
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

/** Pantallas privadas: sin sesión se vuelve a la bienvenida. */
function Private() {
  const { ready, session, profile } = useAuth();
  const { t } = useLang();
  const online = useOnline();
  const bare = useLocation().pathname === "/tour"; // la guía de uso ocupa toda la pantalla
  useSessionTracking(Boolean(session && profile?.consent_analytics));
  if (!ready) return <Splash />;
  if (!session) return <Navigate to="/welcome" replace />;
  const tabs = [
    { to: "/", icon: House, label: t("tabHome"), end: true },
    { to: "/guides", icon: FileText, label: t("tabGuides"), end: false },
    { to: "/assistant", icon: MessageCircle, label: t("tabAssistant"), end: false },
    { to: "/profile", icon: UserRound, label: t("tabProfile"), end: false },
  ];
  return (
    <div className="flex h-full flex-col">
      {!online && (
        <p className="safe-top flex items-center justify-center gap-2 bg-beige px-4 pb-2 text-[14px]" role="status">
          <WifiOff size={16} aria-hidden /> {t("offline")}
        </p>
      )}
      <main className="flex-1 overflow-y-auto">
        <PersonalProvider>
          <NotifySync />
          <Outlet />
        </PersonalProvider>
      </main>
      {!bare && (
        <nav className="safe-bottom border-t border-beige bg-white" aria-label="Principal">
          <ul className="mx-auto flex max-w-md">
            {tabs.map((tab) => (
              <li key={tab.to} className="flex-1">
                <NavLink to={tab.to} end={tab.end} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-0.5 pt-2 text-[12px] ${isActive ? "font-bold text-terracotta-deep" : "text-ink-soft"}`}>
                  <tab.icon size={23} aria-hidden />
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

/** Pantallas públicas: con sesión se va directo al inicio. */
function Public() {
  const { ready, session } = useAuth();
  if (!ready) return <Splash />;
  if (session) return <Navigate to="/" replace />;
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
            <Route element={<Private />}>
              <Route path="/" element={<Home />} />
              <Route path="/tour" element={<Tour />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<GuideDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/assistant/history" element={<ChatHistory />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/file" element={<MyFile />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/map" element={<OfficesMap />} />
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
