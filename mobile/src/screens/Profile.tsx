import { Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LANG_LABEL, LANGS } from "@/lib/i18n";
import type { Lang } from "@/content/types";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { redirectUrl, supabase } from "~/lib/supabase";
import { COUNTRIES, isEmail, toE164 } from "~/lib/validation";
import { Alert, Field, Screen } from "~/ui/kit";
import { PhoneCode } from "./PhoneCode";

export function Profile() {
  const { t, lang, setLang } = useLang();
  const { user, profile, saveProfile, phoneLoginEnabled } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<"email" | "phone" | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [dial, setDial] = useState("+39");
  const [national, setNational] = useState("");
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [info, setInfo] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError("");
    const ok = await saveProfile({ display_name: name.trim() || null, preferred_language: lang });
    if (ok) setSaved(true);
    else setError(t("generic"));
  }

  async function changeLang(l: Lang) {
    setLang(l);
    await saveProfile({ preferred_language: l });
  }

  // Vincular el segundo dato a ESTA cuenta. Solo queda unido cuando se verifica;
  // si ya pertenece a otra cuenta, Supabase lo rechaza (no se crean duplicados).
  async function linkEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!isEmail(newEmail)) return setError(t("invalidEmail"));
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() }, { emailRedirectTo: redirectUrl("/") });
    if (error) return setError(error.status === 429 ? t("tooMany") : t("generic"));
    setInfo(t("emailLinkSent"));
    setAdding(null);
  }

  async function sendPhoneChange(phone: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ phone });
    return !error;
  }

  async function linkPhone(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const phone = toE164(dial, national);
    if (!phone) return setError(t("invalidPhone"));
    if (await sendPhoneChange(phone)) setPendingPhone(phone);
    else setError(t("generic"));
  }

  async function removeAccount() {
    if (!window.confirm(t("deleteConfirm"))) return;
    const { error } = await supabase.rpc("delete_my_account");
    if (error) return setError(t("generic"));
    await supabase.auth.signOut();
  }

  if (pendingPhone) {
    return (
      <Screen>
        <PhoneCode
          phone={pendingPhone}
          type="phone_change"
          resend={() => sendPhoneChange(pendingPhone)}
          onBack={() => setPendingPhone(null)}
          onDone={async () => {
            setPendingPhone(null);
            setAdding(null);
            await supabase.auth.refreshSession();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen title={t("profile")}>
      <div className="rise space-y-5">
        <form onSubmit={save} className="card space-y-4">
          <Field label={t("name")} hint={t("askNameHint")} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <label className="field-label" htmlFor="lang">
              {t("language")}
            </label>
            <select id="lang" className="input" value={lang} onChange={(e) => changeLang(e.target.value as Lang)}>
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_LABEL[l]}
                </option>
              ))}
            </select>
          </div>
          {saved && <Alert kind="ok">{t("saved")}</Alert>}
          <button className="btn">{t("save")}</button>
        </form>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold">{t("account")}</h2>
          <p className="text-[15px] text-ink-soft">{t("accountBody")}</p>
          {(
            [
              ["email", Mail, user?.email],
              ["phone", Smartphone, user?.phone ? `+${user.phone.replace(/^\+/, "")}` : undefined],
            ] as const
          ).map(([kind, Icon, value]) => (
            <div key={kind} className="flex items-center gap-3">
              <span className="icon-tile">
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-ink-soft">{t(kind)}</span>
                <span className="block truncate font-medium">{value || t("notAdded")}</span>
              </span>
              {!value && (kind === "email" || phoneLoginEnabled) && (
                <button type="button" className="rounded-xl bg-beige px-4 py-2.5 font-semibold" onClick={() => setAdding(kind)}>
                  {t("add")}
                </button>
              )}
            </div>
          ))}

          {adding === "email" && (
            <form onSubmit={linkEmail} className="space-y-3 pt-2" noValidate>
              <Field label={t("email")} type="email" inputMode="email" autoCapitalize="none" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <button className="btn">{t("add")}</button>
            </form>
          )}
          {adding === "phone" && (
            <form onSubmit={linkPhone} className="space-y-3 pt-2" noValidate>
              <select aria-label={t("country")} className="input" value={dial} onChange={(e) => setDial(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.dial}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
              <Field label={t("phoneNumber")} type="tel" inputMode="tel" required value={national} onChange={(e) => setNational(e.target.value)} />
              <button className="btn">{t("sendCode")}</button>
            </form>
          )}
          {info && <Alert kind="ok">{info}</Alert>}
          {error && <Alert kind="error">{error}</Alert>}
        </section>

        <Link to="/data" className="btn btn-secondary">
          {t("myData")}
        </Link>
        <button type="button" className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>
          {t("signOut")}
        </button>
        <button type="button" className="btn btn-danger" onClick={removeAccount}>
          {t("deleteAccount")}
        </button>
      </div>
    </Screen>
  );
}
