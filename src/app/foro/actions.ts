"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: boolean };

const CATEGORIES = ["permesso", "lavoro", "casa", "salute", "famiglia", "bonus", "cittadinanza", "altro"] as const;

const PostSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().trim().min(5).max(140),
  body: z.string().trim().min(10).max(5000),
  lang: z.enum(["es", "en", "it"]),
});

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/entrar");
  return { supabase, user: data.user };
}

function dbError(message: string | undefined): string {
  return message?.includes("rate_limited") ? "rate_limited" : "save_failed";
}

export async function createPost(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = PostSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "invalid" };
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("forum_posts")
    .insert({ ...parsed.data, author_id: user.id })
    .select("id")
    .single();
  if (error) return { error: dbError(error.message) };
  revalidatePath("/foro");
  redirect(`/foro/${data.id}`);
}

const CommentSchema = z.object({ post_id: z.coerce.number().int().positive(), body: z.string().trim().min(2).max(3000) });

export async function createComment(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = CommentSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "invalid" };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("forum_comments").insert({ ...parsed.data, author_id: user.id });
  if (error) return { error: dbError(error.message) };
  revalidatePath(`/foro/${parsed.data.post_id}`);
  return { ok: true };
}

const ReportSchema = z
  .object({
    post_id: z.coerce.number().int().positive().optional(),
    comment_id: z.coerce.number().int().positive().optional(),
    reason: z.string().trim().min(3).max(500),
    back: z.coerce.number().int().positive(),
  })
  .refine((r) => Boolean(r.post_id) !== Boolean(r.comment_id));

export async function report(form: FormData) {
  const parsed = ReportSchema.safeParse(Object.fromEntries([...form].filter(([, v]) => v !== "")));
  if (!parsed.success) return;
  const { supabase, user } = await requireUser();
  const { back, ...rest } = parsed.data;
  // Duplicados ignorados por la restricción UNIQUE de la base de datos.
  await supabase.from("forum_reports").insert({ ...rest, reporter_id: user.id });
  revalidatePath(`/foro/${back}`);
}

export async function deletePost(form: FormData) {
  const id = z.coerce.number().int().positive().safeParse(form.get("id"));
  if (!id.success) return;
  const { supabase } = await requireUser();
  // RLS garantiza que solo el autor (o un moderador) pueda borrar.
  await supabase.from("forum_posts").delete().eq("id", id.data);
  revalidatePath("/foro");
  redirect("/foro");
}
