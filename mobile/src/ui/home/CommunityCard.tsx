import { ArrowRight, MessageCircleReply, MessageSquarePlus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "~/auth/AuthProvider";
import { useForumActivity } from "~/lib/forumActivity";
import { useLang } from "~/lib/lang";

/**
 * Comunidad en el inicio: respuestas nuevas a tus preguntas (arriba, para que no se pierdan),
 * las últimas preguntas y, en las que nadie ha respondido, una invitación a ayudar.
 */
export function CommunityCard() {
  const { t } = useLang();
  const { user } = useAuth();
  const a = useForumActivity(user?.id);
  const latest = (a?.latest ?? []).slice(0, 3);
  return (
    <section className="card space-y-3" aria-labelledby="comm-title" data-testid="community-card">
      <div className="flex items-start gap-3">
        <span className="icon-tile shrink-0">
          <UsersRound size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="comm-title" className="text-lg font-bold">
            {t("commCardTitle")}
          </h2>
          <p className="text-[15px] text-ink-soft">{t("commCardSub")}</p>
        </div>
        {a && a.newPosts > 0 && (
          <span className="shrink-0 rounded-full bg-terracotta-deep px-2.5 py-1 text-[13px] font-bold text-white" data-testid="community-new">
            {a.newPosts} {t("commNewPosts")}
          </span>
        )}
      </div>

      {a?.replies.slice(0, 2).map((r) => (
        <Link key={`${r.post_id}-${r.created_at}`} to={`/community/${r.post_id}`} className="flex items-start gap-2 rounded-2xl bg-sage-soft p-3" data-testid="community-reply">
          <MessageCircleReply size={20} className="mt-0.5 shrink-0 text-sage" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{t("commNewReplies")}</span>
            <span className="block text-[14px] text-ink-soft break-words">
              {r.author_name} {t("commReplyFrom")}: «{r.title}»
            </span>
          </span>
          <ArrowRight size={18} className="mt-1 shrink-0 text-terracotta rtl:rotate-180" aria-hidden />
        </Link>
      ))}

      {latest.length > 0 && (
        <ul className="divide-y divide-line">
          {latest.map((p) => (
            <li key={p.id}>
              <Link to={`/community/${p.id}`} className="flex min-h-12 items-center gap-2 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium break-words">{p.title}</span>
                  <span className="block text-[13px] text-ink-soft">
                    {p.author_name} ·{" "}
                    {p.answers === 0 ? <strong className="text-terracotta-deep">{t("commNoAnswer")} · {t("commHelpCta")}</strong> : <span aria-label={`${p.answers} ${t("forumAnswers").toLowerCase()}`}>💬 {p.answers}</span>}
                  </span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-terracotta rtl:rotate-180" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2">
        <Link to="/community/new" className="btn">
          <MessageSquarePlus size={20} aria-hidden /> {t("forumAsk")}
        </Link>
        <Link to="/community" className="btn btn-secondary">
          {t("commSeeAll")}
        </Link>
      </div>
    </section>
  );
}
