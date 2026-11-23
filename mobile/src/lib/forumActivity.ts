import { useCallback, useEffect, useState } from "react";
import type { ForumCategory } from "./forum";
import { supabase } from "./supabase";

/**
 * Actividad del foro para dar visibilidad a la Comunidad sin cambiar la base de datos:
 * - preguntas nuevas desde la última vez que la persona abrió la Comunidad;
 * - respuestas nuevas a SUS preguntas (para que no se pierdan);
 * - últimas preguntas con su número de respuestas («Sin respuesta» invita a ayudar).
 * «Visto» se guarda solo en este teléfono.
 */
export type ForumItem = { id: number; title: string; author_name: string; author_id: string; category: ForumCategory; created_at: string; answers: number };
export type ForumReply = { post_id: number; title: string; author_name: string; created_at: string };
export type ForumActivity = { newPosts: number; replies: ForumReply[]; latest: ForumItem[] };

const EVENT = "aposto:forum-activity";
const WEEK = 7 * 86_400_000;
const key = (what: "posts" | "replies", uid: string) => `aposto:forum-seen-${what}:${uid}`;

function seen(what: "posts" | "replies", uid: string): string {
  try {
    const v = localStorage.getItem(key(what, uid));
    if (v) return v;
  } catch {
    /* sin almacenamiento */
  }
  // Primera vez: cuenta lo de la última semana.
  return new Date(Date.now() - WEEK).toISOString();
}
function markSeen(what: "posts" | "replies", uid: string) {
  try {
    localStorage.setItem(key(what, uid), new Date().toISOString());
  } catch {
    /* sin almacenamiento */
  }
  cache = null;
  generation++;
  window.dispatchEvent(new Event(EVENT));
}
export const markPostsSeen = (uid: string) => markSeen("posts", uid);
export const markRepliesSeen = (uid: string) => markSeen("replies", uid);

type Row = Omit<ForumItem, "answers"> & { forum_comments?: { count: number }[] };

let cache: { uid: string; at: number; data: ForumActivity } | null = null;
/** Sube al marcar algo como visto: una carga empezada antes ya no vale (volvería a encender el punto rojo). */
let generation = 0;

export async function loadForumActivity(uid: string): Promise<ForumActivity | null> {
  if (cache && cache.uid === uid && Date.now() - cache.at < 60_000) return cache.data;
  const gen = generation;
  const { data, error } = await supabase
    .from("forum_posts")
    .select("id, title, author_name, author_id, category, created_at, forum_comments(count)")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error || !data) return null;
  const latest: ForumItem[] = (data as Row[]).map(({ forum_comments, ...p }) => ({ ...p, answers: forum_comments?.[0]?.count ?? 0 }));
  const sinceP = seen("posts", uid);
  const newPosts = latest.filter((p) => p.author_id !== uid && p.created_at > sinceP).length;

  let replies: ForumReply[] = [];
  const mine = await supabase.from("forum_posts").select("id, title").eq("author_id", uid).eq("hidden", false).limit(50);
  const ids = (mine.data ?? []).map((p) => p.id as number);
  if (ids.length) {
    const r = await supabase
      .from("forum_comments")
      .select("post_id, author_name, author_id, created_at")
      .in("post_id", ids)
      .neq("author_id", uid)
      .eq("hidden", false)
      .gt("created_at", seen("replies", uid))
      .order("created_at", { ascending: false })
      .limit(20);
    const titles = new Map((mine.data ?? []).map((p) => [p.id as number, p.title as string]));
    replies = (r.data ?? []).map((c) => ({ post_id: c.post_id as number, title: titles.get(c.post_id as number) ?? "", author_name: c.author_name as string, created_at: c.created_at as string }));
  }
  if (gen !== generation) return null;
  const result = { newPosts, replies, latest };
  cache = { uid, at: Date.now(), data: result };
  return result;
}

/** Se actualiza al abrir la app, al volver a ella y al marcar algo como visto. */
export function useForumActivity(uid: string | undefined): ForumActivity | null {
  const [data, setData] = useState<ForumActivity | null>(null);
  const load = useCallback(() => {
    if (!uid) return;
    void loadForumActivity(uid).then((d) => d && setData(d));
  }, [uid]);
  useEffect(() => {
    load();
    const again = () => load();
    const visible = () => document.visibilityState === "visible" && load();
    window.addEventListener(EVENT, again);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener(EVENT, again);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load]);
  return uid ? data : null;
}

/** Número del punto rojo: preguntas nuevas + respuestas nuevas a mis preguntas. */
export const forumBadge = (a: ForumActivity | null) => (a ? a.newPosts + a.replies.length : 0);
