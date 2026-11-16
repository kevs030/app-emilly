import { MessageCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "~/lib/lang";
import { supabase } from "~/lib/supabase";
import { Alert, Screen } from "~/ui/kit";

type Conversation = { id: number; title: string; updated_at: string };

/** Conversaciones guardadas con el asistente. La persona puede abrirlas o borrarlas. */
export function ChatHistory() {
  const { t, lang } = useLang();
  const [list, setList] = useState<Conversation[] | null | undefined>(undefined);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    const { data, error: e } = await supabase.from("ai_conversations").select("id, title, updated_at").order("updated_at", { ascending: false });
    setList(e ? null : (data as Conversation[]));
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    reload();
  }, [reload]);

  async function remove(id?: number) {
    if (!window.confirm(t(id ? "chatDeleteOne" : "chatDeleteAll"))) return;
    setError(false);
    const q = supabase.from("ai_conversations").delete();
    const { error: e } = await (id ? q.eq("id", id) : q.gt("id", 0));
    if (e) setError(true);
    await reload();
  }

  return (
    <Screen title={t("chatHistory")} back>
      <p className="text-[15px] text-ink-soft">{t("chatHistoryLead")}</p>
      {list === undefined && <p className="mt-4 text-ink-soft">{t("loading")}</p>}
      {list === null && <p className="card mt-4 text-ink-soft">{t("notReady")}</p>}
      {list?.length === 0 && <p className="card mt-4 text-ink-soft">{t("chatEmpty")}</p>}
      {error && <Alert kind="error">{t("generic")}</Alert>}
      {list && list.length > 0 && (
        <>
          <ul className="mt-4 space-y-3">
            {list.map((c) => (
              <li key={c.id} className="card flex items-center gap-2">
                <Link to={`/assistant?c=${c.id}`} className="flex min-h-11 min-w-0 flex-1 items-center gap-3">
                  <MessageCircle size={20} className="shrink-0 text-terracotta" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{c.title}</span>
                    <span className="block text-[13px] text-ink-soft">{new Date(c.updated_at).toLocaleDateString(lang, { day: "numeric", month: "long" })}</span>
                  </span>
                </Link>
                <button type="button" aria-label={t("delete")} onClick={() => remove(c.id)} className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-soft">
                  <Trash2 size={18} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-danger mt-5" onClick={() => remove()}>
            {t("chatDeleteAllBtn")}
          </button>
        </>
      )}
    </Screen>
  );
}
