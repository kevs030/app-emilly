import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { deleteContent, deleteSponsor, dismissReports, setHidden, toggleSponsor } from "./actions";
import { SponsorForm } from "./SponsorForm";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

type Stats = { users: number; users_7d: number; personalized: number; posts: number; comments: number; hidden: number; reports: number; sponsor_clicks: number };
type Report = { id: number; post_id: number | null; comment_id: number | null; reason: string; created_at: string };
type Item = { kind: "post" | "comment"; id: number; postId: number; title: string; body: string; author: string; hidden: boolean; reasons: string[] };

/**
 * Panel privado. Quien no sea admin (o no haya iniciado sesión) recibe un 404,
 * igual que si la página no existiera. La base de datos vuelve a comprobar cada operación.
 */
export default async function AdminPage() {
  if (!supabaseConfigured()) notFound();
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) notFound();

  const [{ data: statsData }, { data: reportsData }, { data: sponsors }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase.from("forum_reports").select("id, post_id, comment_id, reason, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("sponsors").select("id, title, body, cta, url, placement, active, clicks, created_at").order("created_at", { ascending: false }),
  ]);
  const stats = statsData as Stats | null;
  const reports = (reportsData ?? []) as Report[];

  const postIds = [...new Set(reports.map((r) => r.post_id).filter((x): x is number => x !== null))];
  const commentIds = [...new Set(reports.map((r) => r.comment_id).filter((x): x is number => x !== null))];
  const [{ data: posts }, { data: comments }] = await Promise.all([
    postIds.length ? supabase.from("forum_posts").select("id, title, body, author_name, hidden").in("id", postIds) : Promise.resolve({ data: [] }),
    commentIds.length ? supabase.from("forum_comments").select("id, post_id, body, author_name, hidden").in("id", commentIds) : Promise.resolve({ data: [] }),
  ]);
  const items: Item[] = [
    ...(posts ?? []).map((p) => ({ kind: "post" as const, id: p.id, postId: p.id, title: p.title, body: p.body, author: p.author_name, hidden: p.hidden, reasons: reports.filter((r) => r.post_id === p.id).map((r) => r.reason) })),
    ...(comments ?? []).map((c) => ({ kind: "comment" as const, id: c.id, postId: c.post_id, title: "Comentario", body: c.body, author: c.author_name, hidden: c.hidden, reasons: reports.filter((r) => r.comment_id === c.id).map((r) => r.reason) })),
  ].sort((a, b) => b.reasons.length - a.reasons.length);

  const tiles: [string, number | undefined][] = [
    ["Usuarios", stats?.users],
    ["Nuevos (7 días)", stats?.users_7d],
    ["Con perfil personalizado", stats?.personalized],
    ["Preguntas del foro", stats?.posts],
    ["Respuestas", stats?.comments],
    ["Contenidos ocultos", stats?.hidden],
    ["Denuncias abiertas", stats?.reports],
    ["Clics en anuncios", stats?.sponsor_clicks],
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panel de administración</h1>
        <p className="mt-1 text-sm text-muted">Solo tú puedes ver esta página. Para los demás no existe.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-3xl font-bold tabular-nums">{value ?? "–"}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Denuncias del foro</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No hay denuncias pendientes.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {items.map((it) => (
              <li key={`${it.kind}-${it.id}`} className="card">
                <p className="text-xs text-muted">
                  {it.kind === "post" ? "Pregunta" : "Comentario"} de {it.author} · {it.reasons.length} denuncia(s) · {it.hidden ? "OCULTO" : "visible"} ·{" "}
                  <Link href={`/foro/${it.postId}`} className="underline">
                    ver en el foro
                  </Link>
                </p>
                {it.kind === "post" && <p className="mt-1 font-semibold">{it.title}</p>}
                <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm">{it.body}</p>
                <p className="mt-2 text-sm text-warn-fg">Motivos: {it.reasons.join(" · ")}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <form action={dismissReports}>
                    <input type="hidden" name="kind" value={it.kind} />
                    <input type="hidden" name="id" value={it.id} />
                    <button className="btn-ghost py-1.5">Es correcto: cerrar denuncias</button>
                  </form>
                  <form action={setHidden}>
                    <input type="hidden" name="kind" value={it.kind} />
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="hidden" value={String(!it.hidden)} />
                    <button className="btn-ghost py-1.5">{it.hidden ? "Volver a mostrar" : "Ocultar"}</button>
                  </form>
                  <form action={deleteContent}>
                    <input type="hidden" name="kind" value={it.kind} />
                    <input type="hidden" name="id" value={it.id} />
                    <button className="btn-ghost border-danger py-1.5 text-danger">Borrar definitivamente</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Publicidad</h2>
        <p className="mt-1 text-sm text-muted">
          Anuncios de texto que aparecen etiquetados como «Publicidad». Acepta solo servicios legales y útiles; nunca «contratos de trabajo», «visados» ni préstamos abusivos.
        </p>
        <div className="card mt-3">
          <SponsorForm />
        </div>
        <ul className="mt-3 space-y-2">
          {(sponsors ?? []).map((sp) => (
            <li key={sp.id} className="card flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">
                  {sp.title} <span className="font-normal text-muted">· {sp.placement} · {sp.active ? "activo" : "pausado"}</span>
                </p>
                <p className="text-muted">{sp.body}</p>
                <p className="truncate text-xs text-muted">{sp.url}</p>
              </div>
              <p className="text-center">
                <span className="block text-2xl font-bold tabular-nums">{sp.clicks}</span>
                <span className="text-xs text-muted">clics</span>
              </p>
              <div className="flex gap-2 text-sm">
                <form action={toggleSponsor}>
                  <input type="hidden" name="id" value={sp.id} />
                  <input type="hidden" name="active" value={String(!sp.active)} />
                  <button className="btn-ghost py-1.5">{sp.active ? "Pausar" : "Activar"}</button>
                </form>
                <form action={deleteSponsor}>
                  <input type="hidden" name="id" value={sp.id} />
                  <button className="btn-ghost border-danger py-1.5 text-danger">Borrar</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
