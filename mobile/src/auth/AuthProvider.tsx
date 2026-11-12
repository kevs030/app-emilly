import { App as CapApp } from "@capacitor/app";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { isNative, supabase, SUPABASE_KEY, SUPABASE_URL } from "~/lib/supabase";

export type Profile = {
  display_name: string | null;
  preferred_language: "es" | "en" | "it";
  country_of_origin: string | null;
  city: string | null;
  consent_personalization: boolean;
  consent_analytics: boolean;
};

type Ctx = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  phoneLoginEnabled: boolean;
  refreshProfile: () => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<boolean>;
};
const AuthContext = createContext<Ctx | null>(null);

const PROFILE_COLUMNS = "display_name, preferred_language, country_of_origin, city, consent_personalization, consent_analytics";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phoneLoginEnabled, setPhoneLoginEnabled] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") navigate("/new-password");
      if (event === "SIGNED_OUT") setProfile(null);
    });
    // ¿Tiene el proyecto un proveedor de SMS? Si no, la pestaña de teléfono lo avisa en vez de fallar.
    fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { external?: { phone?: boolean } } | null) => setPhoneLoginEnabled(j?.external?.phone === true))
      .catch(() => setPhoneLoginEnabled(false));
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // Solo en el teléfono: enlaces de los correos (verificación, nueva contraseña) y ciclo de vida de la app.
  useEffect(() => {
    if (!isNative) return;
    const handles = [
      CapApp.addListener("appUrlOpen", async ({ url }) => {
        try {
          const u = new URL(url);
          const code = u.searchParams.get("code");
          if (code) await supabase.auth.exchangeCodeForSession(code);
          const path = u.pathname && u.pathname !== "/" ? u.pathname : "/";
          navigate(path.startsWith("/") && !path.startsWith("//") ? path : "/");
        } catch {
          navigate("/");
        }
      }),
      CapApp.addListener("appStateChange", ({ isActive }) => {
        if (isActive) supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
      }),
      CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else CapApp.exitApp();
      }),
    ];
    return () => {
      handles.forEach((h) => h.then((x) => x.remove()));
    };
  }, [navigate]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga del perfil al iniciar sesión
    refreshProfile();
  }, [refreshProfile]);

  const saveProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!userId) return false;
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) return false;
      await refreshProfile();
      return true;
    },
    [userId, refreshProfile],
  );

  const value = useMemo<Ctx>(
    () => ({ ready, session, user: session?.user ?? null, profile, phoneLoginEnabled, refreshProfile, saveProfile }),
    [ready, session, profile, phoneLoginEnabled, refreshProfile, saveProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
