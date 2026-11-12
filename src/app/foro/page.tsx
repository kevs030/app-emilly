import Link from "next/link";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { NotConfigured } from "@/components/NotConfigured";
import { CATEGORY_LABEL, FORUM_RULES } from "./forum-i18n";
import { AdSlot } from "@/components/AdSlot";

export default async function ForumPage(props: PageProps<"/foro">) {
  const lang = await getLang();
  const l = lang === "en" ? "en" : "es";
  if (!supabaseConfigured()) return <NotConfigured />;
  const { cat } = await props.searchParams;
  const category = typeof cat === "string" && cat in CATEGORY_LABEL ? cat : null;

  const supabase = await createClient();
  let query = supabase
    .from("forum_posts")
    .select("id, title, category, author_name, created_at")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(50);
  if (category) query = query.eq("category", category);
  const { data: posts } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("navForum", lang)}</h1>
        <Link href="/foro/nuevo" className="btn">
          + {l === "en" ? "New question" : "Nueva pregunta"}
        </Link>
      </div>
      <p className="text-xs text-muted">{FORUM_RULES[l]}</p>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/foro" className={`rounded-full border px-3 py-1 ${!category ? "border-brand bg-brand-soft" : "border-border"}`}>
          {l === "en" ? "All" : "Todo"}
        </Link>
        {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
          <Link key={k} href={`/foro?cat=${k}`} className={`rounded-full border px-3 py-1 ${category === k ? "border-brand bg-brand-soft" : "border-border"}`}>
            {v[l]}
          </Link>
        ))}
      </div>
      <ul className="space-y-2">
        {(posts ?? []).map((p) => (
          <li key={p.id}>
            <Link href={`/foro/${p.id}`} className="card card-link block">
              <span className="text-xs text-brand">{CATEGORY_LABEL[p.category]?.[l]}</span>
              <h2 className="font-medium">{p.title}</h2>
              <p className="text-xs text-muted">
                {p.author_name} · {new Date(p.created_at).toLocaleDateString(lang)}
              </p>
            </Link>
          </li>
        ))}
        {posts?.length === 0 && <p className="text-sm text-muted">{l === "en" ? "No posts yet. Be the first!" : "Aún no hay preguntas. ¡Sé el primero!"}</p>}
      </ul>
      <AdSlot placement="foro" lang={lang} />
    </div>
  );
}
