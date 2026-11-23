/* Fase 11 — Comunidad visible: pestaña con punto rojo, tarjeta en el inicio, «Sin respuesta: ayuda»
   y aviso a quien preguntó cuando le responden. Uso: npm run build && npm run preview & ; node tests/e2e/fase11.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
const ago = (ms) => new Date(Date.now() - ms).toISOString();

(async () => {
  const br = await chromium.launch();
  const res = []; const errs = [];
  const check = (n, ok, x = "") => res.push(`${ok ? "OK   " : "FALLA"} ${n}${x ? " — " + x : ""}`);
  const { p, login } = await makeApp(br, errs, {});
  const posts = [
    { id: 1, title: "Links de empresas", body: "¿Qué empresas contratan extranjeros?", author_name: "Laury", author_id: "otra", category: "lavoro", created_at: ago(3600e3), forum_comments: [{ count: 0 }] },
    { id: 2, title: "Mi pregunta sobre el permiso", body: "¿Cuánto tarda?", author_name: "Ana", author_id: "u1", category: "permesso", created_at: ago(2 * 86400e3), forum_comments: [{ count: 1 }] },
  ];
  const comments = [{ id: 9, post_id: 2, author_name: "Marco", author_id: "otro", body: "Unos 2 meses.", created_at: ago(1800e3) }];
  await p.route("https://emuyxcrtkfqizavslwfj.supabase.co/rest/v1/forum_**", async (r) => {
    const req = r.request(), u = new URL(req.url());
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    const json = (b) => r.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify(b) });
    const single = (req.headers()["accept"] || "").includes("vnd.pgrst.object");
    if (u.pathname.endsWith("/forum_posts")) {
      if (u.searchParams.get("author_id") === "eq.u1") return json(posts.filter((x) => x.author_id === "u1").map(({ id, title }) => ({ id, title })));
      const id = u.searchParams.get("id");
      if (id) { const one = posts.find((x) => `eq.${x.id}` === id); return json(single ? one ?? null : one ? [one] : []); }
      return json(posts);
    }
    if (u.pathname.endsWith("/forum_comments")) {
      const pid = u.searchParams.get("post_id") || "";
      if (pid.startsWith("eq.")) return json(comments.filter((c) => `eq.${c.post_id}` === pid));
      const gt = (u.searchParams.get("created_at") || "").replace(/^gt\./, "");
      return json(comments.filter((c) => !gt || c.created_at > gt));
    }
    return json([]);
  });
  await login();
  await p.waitForTimeout(800);
  const badge = async () => ((await p.locator('[data-testid="community-badge"]').count()) ? (await p.locator('[data-testid="community-badge"]').innerText()).trim() : "0");
  const tab = p.locator('nav[aria-label="Principal"] a', { hasText: "Comunidad" });
  check("barra de abajo: pestaña «Comunidad»", (await tab.count()) === 1);
  check("punto rojo: 1 pregunta nueva + 1 respuesta a mi pregunta = 2", (await badge()) === "2", await badge());
  const card = p.locator('[data-testid="community-card"]');
  check("inicio: tarjeta de Comunidad visible", await card.isVisible());
  check("inicio: avisa «Te respondieron a tu pregunta» (Marco)", (await card.locator('[data-testid="community-reply"]').innerText()).includes("Marco"));
  check("inicio: la pregunta sin respuesta invita a ayudar", (await card.innerText()).includes("Sin respuesta · ¿Sabes la respuesta? Ayuda"));
  await p.goto(ORIGIN + PREFIX + "/notifications"); await p.waitForSelector("h1");
  check("avisos: la respuesta nueva aparece en «Avisos»", (await p.locator('[data-testid="notif-replies"]').innerText()).includes("Mi pregunta sobre el permiso"));
  await tab.click(); await p.waitForURL(/\/community$/); await p.waitForTimeout(600);
  check("comunidad: «Todavía sin respuesta: ¿puedes ayudar?» con la pregunta de Laury", (await p.locator('[data-testid="community-help"]').innerText()).includes("Links de empresas"));
  check("comunidad: al abrirla, las preguntas nuevas pasan a vistas (queda 1 en el punto rojo)", (await badge()) === "1", await badge());
  await p.goto(ORIGIN + PREFIX + "/community/2"); await p.waitForSelector("article"); await p.waitForTimeout(600);
  check("mi pregunta: al abrirla, el punto rojo se apaga", (await badge()) === "0", await badge());
  check("sin desbordamiento con 5 pestañas", await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  await p.goto(ORIGIN + PREFIX + "/"); await p.waitForSelector('[data-testid="community-card"]');
  await p.locator('[data-testid="community-card"]').scrollIntoViewIfNeeded();
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})().catch((e) => { console.log("ERROR DE LA PRUEBA:", e.message.split("\n").slice(0, 3).join(" / ")); process.exit(1); });
