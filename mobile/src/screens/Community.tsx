import { ArrowRight, Flag, MessageSquarePlus, ShieldAlert, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { markPostsSeen, markRepliesSeen, useForumActivity } from "~/lib/forumActivity";
import { createComment, createPost, deleteComment, deletePost, FORUM_CATEGORIES, getPost, listPosts, report, type Comment, type ForumCategory, type Post } from "~/lib/forum";
import { useLang } from "~/lib/lang";
import { CONTENT_LANG, type StringKey } from "~/lib/strings";
import { Alert, Field, Screen } from "~/ui/kit";

const cat = (c: string) => `cat_${c}` as StringKey;

function Rules() {
  const { t } = useLang();
  return (
    <p className="flex gap-2 rounded-2xl bg-beige p-3 text-[14px]">
      <ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
      <span>{t("forumRules")}</span>
    </p>
  );
}

/** Comunidad: preguntas y respuestas entre personas. Lo que se publica es visible para todos. */
export function Community() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [filter, setFilter] = useState<ForumCategory | "">("");
  const [posts, setPosts] = useState<Post[] | null | undefined>(undefined);
  const activity = useForumActivity(user?.id);
  const answers = new Map((activity?.latest ?? []).map((p) => [p.id, p.answers]));
  const unanswered = (activity?.latest ?? []).filter((p) => p.answers === 0 && p.author_id !== user?.id).slice(0, 3);
  // Al abrir la Comunidad, las preguntas nuevas pasan a «vistas» (se apaga el punto rojo).
  useEffect(() => {
    if (user) markPostsSeen(user.id);
  }, [user]);

  useEffect(() => {
    let alive = true;
    void listPosts(filter).then((p) => alive && setPosts(p));
    return () => {
      alive = false;
    };
  }, [filter]);

  return (
    <Screen title={t("community")} back help="community">
      <Rules />
      <Link to="/community/new" className="btn mt-4">
        <MessageSquarePlus size={20} aria-hidden /> {t("forumAsk")}
      </Link>
      {activity?.replies.length ? (
        <ul className="mt-4 space-y-2" data-testid="community-replies">
          {activity.replies.slice(0, 3).map((r) => (
            <li key={`${r.post_id}-${r.created_at}`}>
              <Link to={`/community/${r.post_id}`} className="block rounded-2xl bg-sage-soft p-3">
                <span className="block font-semibold">{t("commNewReplies")}</span>
                <span className="block text-[14px] text-ink-soft break-words">
                  {r.author_name} {t("commReplyFrom")}: «{r.title}»
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {unanswered.length > 0 && (
        <section className="mt-4 rounded-2xl border border-gold/60 bg-gold-soft p-3" aria-labelledby="help-title" data-testid="community-help">
          <h2 id="help-title" className="font-bold">
            {t("commHelpTitle")}
          </h2>
          <ul className="mt-2 space-y-1">
            {unanswered.map((p) => (
              <li key={p.id}>
                <Link to={`/community/${p.id}`} className="flex min-h-11 items-center gap-2 font-medium underline-offset-2 hover:underline">
                  <span className="min-w-0 flex-1 break-words">{p.title}</span>
                  <span className="shrink-0 text-[13px] font-bold text-terracotta-deep">{t("commHelpCta")} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-4">
        <label className="field-label" htmlFor="forum-cat">
          {t("forumTopic")}
        </label>
        <select id="forum-cat" className="input" value={filter} onChange={(e) => setFilter(e.target.value as ForumCategory | "")}>
          <option value="">{t("forumAll")}</option>
          {FORUM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(cat(c))}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4" aria-live="polite">
        {posts === undefined && <p className="text-ink-soft">{t("loading")}</p>}
        {posts === null && <Alert kind="error">{t("generic")}</Alert>}
        {posts?.length === 0 && <p className="card text-ink-soft">{t("forumEmpty")}</p>}
        <ul className="space-y-3">
          {posts?.map((p) => (
            <li key={p.id}>
              <Link to={`/community/${p.id}`} className="card flex items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-terracotta-deep">{t(cat(p.category))}</span>
                  <span className="block font-semibold break-words">{p.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[14px] text-ink-soft break-words">{p.body}</span>
                  <span className="mt-1 block text-[13px] text-ink-soft">
                    {p.author_name} · {new Date(p.created_at).toLocaleDateString(lang, { day: "numeric", month: "short" })}
                    {answers.has(p.id) &&
                      (answers.get(p.id) === 0 ? (
                        <strong className="ms-2 rounded-full bg-gold-soft px-2 py-0.5 text-terracotta-deep">{t("commNoAnswer")}</strong>
                      ) : (
                        <span aria-label={`${answers.get(p.id)} ${t("forumAnswers").toLowerCase()}`}> · 💬 {answers.get(p.id)}</span>
                      ))}
                  </span>
                </span>
                <ArrowRight size={20} className="mt-1 shrink-0 text-terracotta rtl:rotate-180" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}

export function CommunityNew() {
  const { t, lang } = useLang();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ForumCategory>("permesso");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<StringKey | "">("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    const { res, id } = await createPost(user.id, { category, title: title.trim(), body: body.trim(), lang: CONTENT_LANG[lang] });
    setBusy(false);
    if (res === "ok" && id) navigate(`/community/${id}`, { replace: true });
    else setError(res === "rate_limited" ? "tooMany" : "generic");
  }

  return (
    <Screen title={t("forumAsk")} back>
      <Rules />
      {!profile?.display_name && <p className="mt-3 rounded-2xl bg-sage-soft p-3 text-[14px]">{t("forumNameHint")}</p>}
      <form onSubmit={submit} className="card mt-4 space-y-4">
        <div>
          <label className="field-label" htmlFor="new-cat">
            {t("forumTopic")}
          </label>
          <select id="new-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value as ForumCategory)}>
            {FORUM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(cat(c))}
              </option>
            ))}
          </select>
        </div>
        <Field label={t("forumTitle")} required minLength={5} maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="field-label" htmlFor="new-body">
            {t("forumBody")}
          </label>
          <textarea id="new-body" className="input min-h-36" required minLength={10} maxLength={5000} value={body} onChange={(e) => setBody(e.target.value)} />
          <p className="hint mt-1">{t("forumNoPersonal")}</p>
        </div>
        {error && <Alert kind="error">{t(error)}</Alert>}
        <button className="btn" disabled={busy || title.trim().length < 5 || body.trim().length < 10}>
          {t("forumPublish")}
        </button>
      </form>
    </Screen>
  );
}

function ReportButton({ target }: { target: { post_id?: number; comment_id?: number } }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [state, setState] = useState<"idle" | "open" | "sent" | "error">("idle");
  const [reason, setReason] = useState("");
  if (state === "sent") return <p className="text-[13px] text-ink-soft" role="status">{t("forumReported")}</p>;
  if (state === "idle" || state === "error")
    return (
      <>
        <button type="button" onClick={() => setState("open")} className="flex min-h-11 items-center gap-1 text-[13px] text-ink-soft">
          <Flag size={15} aria-hidden /> {t("forumReport")}
        </button>
        {state === "error" && <Alert kind="error">{t("generic")}</Alert>}
      </>
    );
  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!user) return;
        const res = await report(user.id, target, reason.trim());
        setState(res === "error" ? "error" : "sent");
      }}
    >
      <Field label={t("forumReportWhy")} required minLength={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
      <button className="btn btn-secondary" disabled={reason.trim().length < 3}>
        {t("forumReport")}
      </button>
      <button type="button" className="btn btn-quiet" onClick={() => setState("idle")}>
        {t("back")}
      </button>
    </form>
  );
}

export function CommunityPost() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const id = Number(useParams().id);
  const [data, setData] = useState<{ post: Post; comments: Comment[] } | null | undefined>(undefined);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<StringKey | "">("");

  const reload = useCallback(async () => setData(Number.isInteger(id) ? await getPost(id) : null), [id]);
  // Si es mi pregunta, al abrirla las respuestas nuevas pasan a «vistas».
  const mine = Boolean(user && data && data.post.author_id === user.id);
  useEffect(() => {
    if (mine && user) markRepliesSeen(user.id);
  }, [mine, user]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    reload();
  }, [reload]);

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    const res = await createComment(user.id, id, body.trim());
    setBusy(false);
    if (res === "ok") {
      setBody("");
      await reload();
    } else setError(res === "rate_limited" ? "tooMany" : "generic");
  }
  const date = (d: string) => new Date(d).toLocaleDateString(lang, { day: "numeric", month: "long" });

  if (data === undefined) return <Screen title={t("community")} back><p className="text-ink-soft">{t("loading")}</p></Screen>;
  if (data === null) return <Screen title={t("community")} back><p className="card text-ink-soft">{t("forumGone")}</p></Screen>;
  const { post, comments } = data;

  return (
    <Screen title={t("community")} back>
      <article className="card">
        <p className="text-[13px] font-semibold text-terracotta-deep">{t(cat(post.category))}</p>
        <h2 className="mt-1 text-xl font-bold break-words">{post.title}</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          {post.author_name} · {date(post.created_at)}
        </p>
        <p className="mt-3 whitespace-pre-wrap break-words">{post.body}</p>
        <div className="mt-2 flex items-center justify-between">
          {post.author_id === user?.id ? (
            <button
              type="button"
              className="flex min-h-11 items-center gap-1 text-[13px] text-danger"
              onClick={async () => {
                if (window.confirm(t("forumDeleteConfirm")) && (await deletePost(post.id))) navigate("/community", { replace: true });
              }}
            >
              <Trash2 size={15} aria-hidden /> {t("delete")}
            </button>
          ) : (
            <ReportButton target={{ post_id: post.id }} />
          )}
        </div>
      </article>

      <h3 className="mb-2 mt-5 font-bold">
        {t("forumAnswers")} ({comments.length})
      </h3>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white/70 p-4">
            <p className="text-[13px] text-ink-soft">
              {c.author_name} · {date(c.created_at)}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
            {c.author_id === user?.id ? (
              <button
                type="button"
                className="flex min-h-11 items-center gap-1 text-[13px] text-danger"
                onClick={async () => {
                  if (window.confirm(t("forumDeleteConfirm")) && (await deleteComment(c.id))) await reload();
                }}
              >
                <Trash2 size={15} aria-hidden /> {t("delete")}
              </button>
            ) : (
              <ReportButton target={{ comment_id: c.id }} />
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={reply} className="card mt-5 space-y-3">
        <label className="field-label" htmlFor="reply">
          {t("forumReply")}
        </label>
        <textarea id="reply" className="input min-h-28" required minLength={2} maxLength={3000} value={body} onChange={(e) => setBody(e.target.value)} />
        <p className="hint">{t("forumNoPersonal")}</p>
        {error && <Alert kind="error">{t(error)}</Alert>}
        <button className="btn" disabled={busy || body.trim().length < 2}>
          {t("forumPublish")}
        </button>
      </form>
    </Screen>
  );
}
