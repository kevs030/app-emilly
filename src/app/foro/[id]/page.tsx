import Link from "next/link";
import { notFound } from "next/navigation";
import { getLang } from "@/lib/lang";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { NotConfigured } from "@/components/NotConfigured";
import { CommentForm } from "./CommentForm";
import { deletePost, report } from "../actions";
import { CATEGORY_LABEL } from "../forum-i18n";

function ReportButton({ postId, commentId, back, l }: { postId?: number; commentId?: number; back: number; l: "es" | "en" }) {
  return (
    <details className="text-xs text-muted">
      <summary className="cursor-pointer">🚩 {l === "en" ? "Report" : "Denunciar"}</summary>
      <form action={report} className="mt-2 flex gap-2">
        <input type="hidden" name="back" value={back} />
        {postId && <input type="hidden" name="post_id" value={postId} />}
        {commentId && <input type="hidden" name="comment_id" value={commentId} />}
        <input name="reason" required minLength={3} maxLength={500} className="input py-1 text-xs" placeholder={l === "en" ? "Reason (spam, scam, insult…)" : "Motivo (spam, estafa, insulto…)"} />
        <button className="rounded border border-border px-2">OK</button>
      </form>
    </details>
  );
}

export default async function PostPage(props: PageProps<"/foro/[id]">) {
  if (!supabaseConfigured()) return <NotConfigured />;
  const { id: raw } = await props.params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const lang = await getLang();
  const l = lang === "en" ? "en" : "es";

  const supabase = await createClient();
  const [{ data: post }, { data: comments }, { data: auth }] = await Promise.all([
    supabase.from("forum_posts").select("id, title, body, category, author_id, author_name, created_at, hidden").eq("id", id).maybeSingle(),
    supabase.from("forum_comments").select("id, body, author_name, created_at").eq("post_id", id).eq("hidden", false).order("created_at"),
    supabase.auth.getUser(),
  ]);
  if (!post) notFound();
  const user = auth.user;

  return (
    <article className="space-y-4">
      <Link href="/foro" className="text-sm text-brand">
        ← Foro
      </Link>
      <div className="card">
        {post.hidden && <p className="mb-2 rounded bg-warn-bg p-2 text-xs text-warn-fg">{l === "en" ? "Hidden pending moderation" : "Oculto, en revisión por moderación"}</p>}
        <span className="text-xs text-brand">{CATEGORY_LABEL[post.category]?.[l]}</span>
        <h1 className="text-xl font-bold">{post.title}</h1>
        <p className="text-xs text-muted">
          {post.author_name} · {new Date(post.created_at).toLocaleString(lang)}
        </p>
        {/* Texto plano: React escapa el contenido, no se interpreta HTML (protección XSS). */}
        <p className="mt-3 whitespace-pre-wrap">{post.body}</p>
        <div className="mt-3 flex items-center gap-4">
          {user && user.id !== post.author_id && <ReportButton postId={post.id} back={post.id} l={l} />}
          {user?.id === post.author_id && (
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <button className="text-xs text-red-600">{l === "en" ? "Delete" : "Borrar"}</button>
            </form>
          )}
        </div>
      </div>

      <h2 className="font-semibold">
        {comments?.length ?? 0} {l === "en" ? "replies" : "respuestas"}
      </h2>
      <ul className="space-y-2">
        {(comments ?? []).map((c) => (
          <li key={c.id} className="card">
            <p className="whitespace-pre-wrap text-sm">{c.body}</p>
            <p className="mt-1 text-xs text-muted">
              {c.author_name} · {new Date(c.created_at).toLocaleString(lang)}
            </p>
            {user && <ReportButton commentId={c.id} back={post.id} l={l} />}
          </li>
        ))}
      </ul>

      {user ? (
        <CommentForm postId={post.id} lang={lang} />
      ) : (
        <Link href="/entrar" className="btn">
          {l === "en" ? "Sign in to reply" : "Entra para responder"}
        </Link>
      )}
    </article>
  );
}
