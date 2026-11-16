-- A posto — endurecimiento tras la auditoría de seguridad (16/11/2026)
-- No cambia datos. Se puede ejecutar más de una vez.

-- 1. Las funciones de los disparadores son internas: nadie debe poder invocarlas desde la API.
revoke execute on function
  public.activity_prune(),
  public.ai_wallet_create(),
  public.analytics_consent_cleanup(),
  public.enforce_row_cap(),
  public.forum_auto_hide(),
  public.forum_before_insert(),
  public.handle_new_user(),
  public.procedure_items_touch(),
  public.procedures_touch()
from public, anon, authenticated;

-- 2. Índices para las claves externas que no tenían (borrados y uniones más rápidos).
create index if not exists forum_comments_author_idx on public.forum_comments (author_id);
create index if not exists forum_posts_author_idx on public.forum_posts (author_id);
create index if not exists forum_reports_post_idx on public.forum_reports (post_id);
create index if not exists forum_reports_comment_idx on public.forum_reports (comment_id);
create index if not exists procedure_items_user_idx on public.procedure_items (user_id);
create index if not exists reminders_procedure_idx on public.reminders (procedure_id);
