import { supabase } from "./supabase";

export const FORUM_CATEGORIES = ["permesso", "lavoro", "casa", "salute", "famiglia", "bonus", "cittadinanza", "altro"] as const;
export type ForumCategory = (typeof FORUM_CATEGORIES)[number];
export type Post = { id: number; author_id: string; author_name: string; category: ForumCategory; title: string; body: string; created_at: string };
export type Comment = { id: number; author_id: string; author_name: string; body: string; created_at: string };

const POST = "id, author_id, author_name, category, title, body, created_at";

export async function listPosts(category: ForumCategory | ""): Promise<Post[] | null> {
  let q = supabase.from("forum_posts").select(POST).eq("hidden", false).order("created_at", { ascending: false }).limit(50);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  return error ? null : (data as Post[]);
}

export async function getPost(id: number): Promise<{ post: Post; comments: Comment[] } | null> {
  const [post, comments] = await Promise.all([
    supabase.from("forum_posts").select(POST).eq("id", id).eq("hidden", false).maybeSingle(),
    supabase.from("forum_comments").select("id, author_id, author_name, body, created_at").eq("post_id", id).eq("hidden", false).order("created_at"),
  ]);
  if (post.error || !post.data) return null;
  return { post: post.data as Post, comments: (comments.data ?? []) as Comment[] };
}

export type WriteResult = "ok" | "rate_limited" | "error";
const result = (error: { message: string } | null): WriteResult => (!error ? "ok" : error.message.includes("rate_limited") ? "rate_limited" : "error");

/** El autor y su nombre los fija la base de datos; desde la app no se pueden falsear. */
export async function createPost(userId: string, p: { category: ForumCategory; title: string; body: string; lang: "es" | "it" | "en" }): Promise<{ res: WriteResult; id?: number }> {
  const { data, error } = await supabase.from("forum_posts").insert({ author_id: userId, ...p }).select("id").single();
  return { res: result(error), id: data?.id as number | undefined };
}
export async function createComment(userId: string, postId: number, body: string): Promise<WriteResult> {
  return result((await supabase.from("forum_comments").insert({ post_id: postId, author_id: userId, body })).error);
}
/** "duplicate" = esta persona ya había denunciado ese contenido. */
export async function report(userId: string, target: { post_id?: number; comment_id?: number }, reason: string): Promise<"ok" | "duplicate" | "error"> {
  const { error } = await supabase.from("forum_reports").insert({ reporter_id: userId, ...target, reason });
  return !error ? "ok" : error.code === "23505" ? "duplicate" : "error";
}
export async function deletePost(id: number): Promise<boolean> {
  return !(await supabase.from("forum_posts").delete().eq("id", id)).error;
}
export async function deleteComment(id: number): Promise<boolean> {
  return !(await supabase.from("forum_comments").delete().eq("id", id)).error;
}
