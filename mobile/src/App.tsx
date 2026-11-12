import { FileText, House, MessageCircle, UserRound, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "~/auth/AuthProvider";
import { LangProvider, useLang } from "~/lib/lang";
import { PersonalProvider } from "~/lib/personal";
import { useSessionTracking } from "~/lib/useSessionTracking";
import { MyData } from "~/screens/MyData";
import { Assistant } from "~/screens/Assistant";
import { Auth } from "~/screens/Auth";
import { GuideDetail, Guides } from "~/screens/Guides";
import { Home } from "~/screens/Home";
import { NewPassword, ResetPassword } from "~/screens/Password";
import { Profile } from "~/screens/Profile";
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
          <Outlet />
        </PersonalProvider>
      </main>
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
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Public />}>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset" element={<ResetPassword />} />
            </Route>
            <Route path="/new-password" element={<NewPassword />} />
            <Route element={<Private />}>
              <Route path="/" element={<Home />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<GuideDetail />} />
              <Route path="/assistant" element={<Assistant />} />
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
