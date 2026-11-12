"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Acciones del panel. Cada una comprueba que quien llama es admin o moderador, y además
 * la base de datos lo vuelve a comprobar (RLS y funciones): no basta con conocer la URL.
 */
async function staff(level: "admin" | "moderator") {
  const supabase = await createClient();
  const { data } = await supabase.rpc(level === "admin" ? "is_admin" : "is_moderator");
  if (data !== true) throw new Error("forbidden");
  return supabase;
}

const Id = z.coerce.number().int().positive();

export async function setHidden(form: FormData) {
  const kind = z.enum(["post", "comment"]).parse(form.get("kind"));
  const id = Id.parse(form.get("id"));
  const hidden = form.get("hidden") === "true";
  const supabase = await staff("moderator");
  await supabase.rpc("moderate", { p_post_id: kind === "post" ? id : null, p_comment_id: kind === "comment" ? id : null, p_hidden: hidden });
  revalidatePath("/admin");
}

export async function deleteContent(form: FormData) {
  const kind = z.enum(["post", "comment"]).parse(form.get("kind"));
  const id = Id.parse(form.get("id"));
  const supabase = await staff("moderator");
  await supabase.from(kind === "post" ? "forum_posts" : "forum_comments").delete().eq("id", id);
  revalidatePath("/admin");
}

/** Cierra las denuncias de un contenido (se considera correcto) y lo vuelve a mostrar. */
export async function dismissReports(form: FormData) {
  const kind = z.enum(["post", "comment"]).parse(form.get("kind"));
  const id = Id.parse(form.get("id"));
  const supabase = await staff("moderator");
  await supabase.from("forum_reports").delete().eq(kind === "post" ? "post_id" : "comment_id", id);
  await supabase.rpc("moderate", { p_post_id: kind === "post" ? id : null, p_comment_id: kind === "comment" ? id : null, p_hidden: false });
  revalidatePath("/admin");
}

const SponsorSchema = z.object({
  title: z.string().trim().min(3).max(60),
  body: z.string().trim().min(10).max(160),
  cta: z.string().trim().min(2).max(30),
  url: z.url({ protocol: /^https$/ }).max(300),
  placement: z.enum(["all", "home", "guias", "foro"]),
});

export type SponsorState = { ok?: boolean; error?: string };

export async function createSponsor(_prev: SponsorState, form: FormData): Promise<SponsorState> {
  const parsed = SponsorSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Revisa los campos: el enlace debe empezar por https:// y los textos respetar su longitud." };
  const supabase = await staff("admin");
  const { error } = await supabase.from("sponsors").insert(parsed.data);
  if (error) return { error: "No se pudo guardar el anuncio." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleSponsor(form: FormData) {
  const id = Id.parse(form.get("id"));
  const active = form.get("active") === "true";
  const supabase = await staff("admin");
  await supabase.from("sponsors").update({ active }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteSponsor(form: FormData) {
  const id = Id.parse(form.get("id"));
  const supabase = await staff("admin");
  await supabase.from("sponsors").delete().eq("id", id);
  revalidatePath("/admin");
}
