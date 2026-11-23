import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { adminSignOut, deleteContent, deleteSponsor, dismissReports, setHidden, toggleSponsor } from "./actions";
import { SponsorForm } from "./SponsorForm";
import { AdminLogin } from "./AdminLogin";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

type Stats = { users: number; users_7d: number; personalized: number; posts: number; comments: number; hidden: number; reports: number; sponsor_clicks: number };
type Usage = {
  users: number;
  consented: number;
  active_7d: number;
  active_30d: number;
  sessions_7d: number;
  avg_session_min: number;
  returning_30d: number;
  platforms: Record<string, number>;
  daily: { day: string; users: number; minutes: number }[];
  screens: { path: string; views: number; users: number }[];
  guides: { guide: string; views: number; started: number; finished: number }[];
};
type Report = { id: number; post_id: number | null; comment_id: number | null; reason: string; created_at: string };
type Item = { kind: "post" | "comment"; id: number; postId: number; title: string; body: string; author: string; hidden: boolean; reasons: string[] };

/**
 * Panel privado. Sin sesión se muestra el acceso; con una cuenta sin permiso, un aviso para cambiar de cuenta.
 * Las cifras y acciones solo se cargan para administración. La base de datos vuelve a comprobar cada operación.
 */
export default async function AdminPage() {
  if (!supabaseConfigured()) notFound();
  const supabase = await createClient();
  // Sin sesión: formulario para entrar aquí mismo. Con sesión pero sin permiso: «no existe».
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return <AdminLogin />;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    // Con una cuenta sin permiso: se dice con qué cuenta se entró y se ofrece cambiar de cuenta.
    return (
      <div className="mx-auto max-w-sm space-y-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Esta cuenta no es de administración</h1>
        <p className="text-sm text-muted">
          Has entrado como <strong className="break-all">{auth.user.email ?? auth.user.phone}</strong>. Cierra la sesión y entra con la cuenta de administración.
        </p>
        <form action={adminSignOut}>
          <button className="btn w-full">Cerrar sesión y cambiar de cuenta</button>
        </form>
      </div>
    );
  }

  const [{ data: statsData }, { data: reportsData }, { data: sponsors }, { data: usageData }, { data: forumData }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase.from("forum_reports").select("id, post_id, comment_id, reason, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("sponsors").select("id, title, body, cta, url, placement, active, clicks, created_at").order("created_at", { ascending: false }),
    supabase.rpc("admin_usage"),
    // Encargado del foro: todas las preguntas recientes con su número de respuestas.
    supabase.from("forum_posts").select("id, title, body, author_name, category, hidden, created_at, forum_comments(count)").order("created_at", { ascending: false }).limit(40),
  ]);
  const forum = ((forumData ?? []) as { id: number; title: string; body: string; author_name: string; category: string; hidden: boolean; created_at: string; forum_comments?: { count: number }[] }[]).map(({ forum_comments, ...p }) => ({ ...p, answers: forum_comments?.[0]?.count ?? 0 }));
  const unanswered = forum.filter((p) => p.answers === 0 && !p.hidden).length;
  const usage = usageData as Usage | null;
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

      {usage && <UsagePanel u={usage} />}

      <section data-testid="admin-forum">
        <h2 className="text-xl font-semibold">
          Foro: preguntas recientes{" "}
          {unanswered > 0 && <span className="ms-2 rounded-full bg-danger px-2.5 py-0.5 text-sm font-bold text-white">{unanswered} sin respuesta</span>}
        </h2>
        <p className="mt-1 text-sm text-muted">Para responder, abre la app → Comunidad. Las que nadie ha respondido aparecen primero marcadas en rojo.</p>
        {forum.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Todavía no hay preguntas.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {[...forum].sort((a, b) => Number(a.answers > 0) - Number(b.answers > 0)).map((p) => (
              <li key={p.id} className={`card ${p.answers === 0 && !p.hidden ? "border-danger" : ""}`}>
                <p className="text-xs text-muted">
                  {new Date(p.created_at).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {p.author_name} · {p.category} ·{" "}
                  {p.answers === 0 ? <strong className="text-danger">SIN RESPUESTA</strong> : `${p.answers} respuesta(s)`}
                  {p.hidden && " · OCULTA"}
                </p>
                <p className="mt-1 font-semibold">{p.title}</p>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm">{p.body}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <form action={setHidden}>
                    <input type="hidden" name="kind" value="post" />
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="hidden" value={String(!p.hidden)} />
                    <button className="btn-ghost py-1.5">{p.hidden ? "Volver a mostrar" : "Ocultar"}</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
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
                  {it.kind === "post" ? "Pregunta" : "Comentario"} de {it.author} · {it.reasons.length} denuncia(s) · {it.hidden ? "OCULTO" : "visible"} · pregunta n.º {it.postId} (verla en la app → Comunidad)
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

/** Uso de la app: solo totales y solo de quien aceptó las estadísticas. */
function UsagePanel({ u }: { u: Usage }) {
  const maxUsers = Math.max(1, ...u.daily.map((d) => d.users));
  const tiles: [string, string | number][] = [
    ["Aceptaron estadísticas", `${u.consented} de ${u.users}`],
    ["Activos (7 días)", u.active_7d],
    ["Activos (30 días)", u.active_30d],
    ["Vuelven otro día (30 días)", u.returning_30d],
    ["Sesiones (7 días)", u.sessions_7d],
    ["Minutos por sesión (media)", u.avg_session_min],
  ];
  return (
    <section className="space-y-4" data-testid="usage-panel">
      <div>
        <h2 className="text-xl font-semibold">Uso de la app</h2>
        <p className="text-sm text-muted">Solo totales y solo de las personas que aceptaron las estadísticas. Nunca nombres, correos ni lo que escriben.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="font-semibold">Personas activas por día (últimos 14 días)</h3>
        <div className="mt-4 flex h-32 items-end gap-1.5" role="img" aria-label="Personas activas por día">
          {u.daily.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.users} personas, ${d.minutes} min`}>
              <span className="text-[10px] tabular-nums text-muted">{d.users || ""}</span>
              <div className="w-full rounded-t bg-brand" style={{ height: `${(d.users / maxUsers) * 96}px`, minHeight: d.users ? 4 : 1, opacity: d.users ? 1 : 0.2 }} />
              <span className="text-[10px] text-muted">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Plataformas (30 días): {Object.entries(u.platforms).map(([k, v]) => `${k} ${v}`).join(" · ") || "sin datos aún"}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold">Pantallas más abiertas (30 días)</h3>
          {u.screens.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Aún no hay datos.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-1 font-medium">Pantalla</th>
                  <th className="py-1 text-right font-medium">Visitas</th>
                  <th className="py-1 text-right font-medium">Personas</th>
                </tr>
              </thead>
              <tbody>
                {u.screens.map((r) => (
                  <tr key={r.path} className="border-t border-border">
                    <td className="py-1.5 font-mono text-xs">{r.path}</td>
                    <td className="py-1.5 text-right tabular-nums">{r.views}</td>
                    <td className="py-1.5 text-right tabular-nums">{r.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold">Trámites: vistos, empezados y terminados (90 días)</h3>
          {u.guides.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Aún no hay datos.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-1 font-medium">Trámite</th>
                  <th className="py-1 text-right font-medium">Vistos</th>
                  <th className="py-1 text-right font-medium">Empezados</th>
                  <th className="py-1 text-right font-medium">Terminados</th>
                </tr>
              </thead>
              <tbody>
                {u.guides.map((r) => (
                  <tr key={r.guide} className="border-t border-border">
                    <td className="py-1.5">{r.guide}</td>
                    <td className="py-1.5 text-right tabular-nums">{r.views}</td>
                    <td className="py-1.5 text-right tabular-nums">{r.started}</td>
                    <td className="py-1.5 text-right tabular-nums">{r.finished}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-2 text-xs text-muted">Si muchos empiezan un trámite y pocos lo terminan, ahí hay algo que mejorar.</p>
        </div>
      </div>
    </section>
  );
}
