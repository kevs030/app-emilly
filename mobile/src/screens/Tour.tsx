import { BellRing, Check, ListChecks, MapPin, MessageCircle, ScanText, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { useLang } from "~/lib/lang";
import { UI_LANGS, type StringKey, type UiLang } from "~/lib/strings";
import { startDone } from "./Start";
import { PeopleTogether, SceneAssistant, SceneDates, SceneGuides, ScenePrivacy } from "~/ui/People";

/** Guarda en este dispositivo que la persona ya vio la guía de uso (una vez por cuenta). */
const seenKey = (uid: string) => `aposto:tour:${uid}`;
export function tourSeen(uid: string | undefined): boolean {
  if (!uid) return true;
  try {
    return localStorage.getItem(seenKey(uid)) === "1";
  } catch {
    return true;
  }
}
function markSeen(uid: string | undefined) {
  if (!uid) return;
  try {
    localStorage.setItem(seenKey(uid), "1");
  } catch {
    /* sin almacenamiento: la guía se volverá a ofrecer, no pasa nada */
  }
}

type Step = {
  scene: typeof PeopleTogether;
  title: StringKey;
  body: StringKey;
  items?: { icon: LucideIcon; text: StringKey; to: string }[];
};

const STEPS: Step[] = [
  { scene: PeopleTogether, title: "tour1Title", body: "tour1Body" },
  {
    scene: SceneGuides,
    title: "tour2Title",
    body: "tour2Body",
    items: [{ icon: ListChecks, text: "tour2Try", to: "/guides" }],
  },
  {
    scene: SceneAssistant,
    title: "tour3Title",
    body: "tour3Body",
    items: [
      { icon: MessageCircle, text: "tour3TryChat", to: "/assistant" },
      { icon: ScanText, text: "tour3TryScan", to: "/scan" },
    ],
  },
  {
    scene: SceneDates,
    title: "tour4Title",
    body: "tour4Body",
    items: [
      { icon: BellRing, text: "tour4TryDates", to: "/appointments" },
      { icon: MapPin, text: "tour4TryMap", to: "/map" },
    ],
  },
  { scene: ScenePrivacy, title: "tour5Title", body: "tour5Body" },
];

/** Guía de primer uso: qué hace la app y por dónde empezar. Se puede volver a abrir desde el perfil. */
export function Tour() {
  const { t, lang, setLang } = useLang();
  const { user, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  function finish(to = "/") {
    markSeen(user?.id);
    navigate(to, { replace: true });
  }

  function pickLang(l: UiLang) {
    setLang(l);
    void saveProfile({ preferred_language: l });
  }

  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-md flex-col px-6">
      <div className="flex items-center justify-between pt-3">
        <p className="text-[14px] font-medium text-ink-soft" aria-live="polite">
          {i + 1} / {STEPS.length}
        </p>
        {!last && (
          <button type="button" className="min-h-11 px-2 text-[15px] font-medium text-brown underline" onClick={() => finish()}>
            {t("tourSkip")}
          </button>
        )}
      </div>

      <div key={i} className="rise flex flex-1 flex-col py-6">
        <step.scene label={t(step.title)} />
        <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight">{t(step.title)}</h1>
        <p className="mt-3 text-lg text-ink-soft">{t(step.body)}</p>

        {i === 0 && (
          <ul className="mt-6 grid grid-cols-2 gap-2" aria-label={t("language")}>
            {UI_LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  aria-pressed={lang === l.code}
                  onClick={() => pickLang(l.code)}
                  className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-xl px-4 text-left font-medium ${lang === l.code ? "bg-terracotta-deep text-white" : "bg-beige"}`}
                >
                  <span lang={l.code}>{l.name}</span>
                  {lang === l.code && <Check size={18} aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {step.items && (
          <ul className="mt-6 space-y-3">
            {step.items.map((it) => (
              <li key={it.to}>
                <Link to={it.to} onClick={() => markSeen(user?.id)} className="card flex items-center gap-3">
                  <span className="icon-tile">
                    <it.icon size={22} aria-hidden />
                  </span>
                  <span className="font-medium">{t(it.text)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pb-4">
        <div className="mb-4 flex justify-center gap-2" aria-hidden>
          {STEPS.map((_, n) => (
            <span key={n} className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-terracotta-deep" : "w-2 bg-beige"}`} />
          ))}
        </div>
        <div className="flex gap-3">
          {i > 0 && (
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setI(i - 1)}>
              {t("back")}
            </button>
          )}
          <button type="button" className="btn flex-1" onClick={() => (last ? finish(startDone(user?.id) ? "/" : "/start") : setI(i + 1))}>
            {last ? t("tourStart") : t("tourNext")}
          </button>
        </div>
      </div>
    </div>
  );
}
