import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/auth/AuthProvider";
import type { T9 } from "~/content/modules/types";
import { useT9 } from "~/ui/modules/ModuleBlocks";

const S: Record<string, T9> = {
  title: { es: "¿Nos ayudas a mejorar A Posto?", it: "Ci aiuti a migliorare A Posto?", en: "Will you help us improve A Posto?", fr: "Vous nous aidez à améliorer A Posto ?", ar: "هل تساعدنا على تحسين A Posto؟", ro: "Ne ajuți să îmbunătățim A Posto?", sq: "Na ndihmoni të përmirësojmë A Posto?", uk: "Допоможете покращити A Posto?", bn: "A Posto উন্নত করতে আমাদের সাহায্য করবেন?" },
  body: {
    es: "Contamos, solo en totales, cuánto tiempo usas la app y qué pantallas y trámites abres. Nunca lo que escribes ni tus documentos. Puedes cambiarlo cuando quieras en Perfil → Mis datos.",
    it: "Contiamo, solo in totale, quanto tempo usi l'app e quali schermate e pratiche apri. Mai ciò che scrivi né i tuoi documenti. Puoi cambiarlo quando vuoi in Profilo → I miei dati.",
    en: "We count, only as totals, how long you use the app and which screens and procedures you open. Never what you type or your documents. You can change this anytime in Profile → My data.",
    fr: "Nous comptons, uniquement en totaux, le temps d'utilisation et les écrans et démarches ouverts. Jamais ce que vous écrivez ni vos documents. Modifiable à tout moment dans Profil → Mes données.",
    ar: "نحسب، كأرقام إجمالية فقط، مدة استخدامك للتطبيق والشاشات والمعاملات التي تفتحها. لا نرى أبدًا ما تكتبه ولا مستنداتك. يمكنك تغيير ذلك متى شئت من الملف الشخصي ← بياناتي.",
    ro: "Numărăm, doar în total, cât timp folosești aplicația și ce ecrane și proceduri deschizi. Niciodată ce scrii sau documentele tale. Poți schimba oricând din Profil → Datele mele.",
    sq: "Numërojmë, vetëm në total, sa kohë e përdorni aplikacionin dhe cilat ekrane e procedura hapni. Kurrë çfarë shkruani as dokumentet tuaja. Mund ta ndryshoni kur të doni te Profili → Të dhënat e mia.",
    uk: "Ми рахуємо, лише загальними числами, скільки часу ви користуєтеся застосунком і які екрани та процедури відкриваєте. Ніколи — що ви пишете чи ваші документи. Змінити можна будь-коли: Профіль → Мої дані.",
    bn: "শুধু মোট হিসেবে আমরা গুনি আপনি কতক্ষণ অ্যাপ ব্যবহার করেন এবং কোন স্ক্রিন ও কাজ খোলেন। আপনি যা লেখেন বা আপনার ডকুমেন্ট কখনো নয়। প্রোফাইল → আমার তথ্য থেকে যেকোনো সময় বদলাতে পারেন।",
  },
  yes: { es: "Sí, ayudar", it: "Sì, aiuto", en: "Yes, help", fr: "Oui, aider", ar: "نعم، أساعد", ro: "Da, ajut", sq: "Po, ndihmoj", uk: "Так, допомогти", bn: "হ্যাঁ, সাহায্য করব" },
  no: { es: "No, gracias", it: "No, grazie", en: "No, thanks", fr: "Non, merci", ar: "لا، شكرًا", ro: "Nu, mulțumesc", sq: "Jo, faleminderit", uk: "Ні, дякую", bn: "না, ধন্যবাদ" },
};

const asked = (uid?: string) => `aposto:stats-asked:${uid ?? "x"}`;

/** Pide, una sola vez y sin presionar, el permiso para las estadísticas de uso. Sí y No pesan lo mismo. */
export function StatsConsent() {
  const { x } = useT9();
  const { user, profile, saveProfile } = useAuth();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(asked(user?.id)) === "1";
    } catch {
      return false;
    }
  });
  if (hidden || !profile || profile.consent_analytics) return null;
  const answer = async (yes: boolean) => {
    try {
      localStorage.setItem(asked(user?.id), "1");
    } catch {
      /* sin almacenamiento */
    }
    setHidden(true);
    if (yes) await saveProfile({ consent_analytics: true });
  };
  return (
    <section className="card space-y-3" aria-labelledby="stats-consent" data-testid="stats-consent">
      <h2 id="stats-consent" className="flex items-center gap-2 font-bold">
        <BarChart3 size={20} className="text-sage" aria-hidden /> {x(S.title)}
      </h2>
      <p className="text-[15px] text-ink-soft">{x(S.body)}</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => void answer(false)}>
          {x(S.no)}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => void answer(true)}>
          {x(S.yes)}
        </button>
      </div>
    </section>
  );
}
