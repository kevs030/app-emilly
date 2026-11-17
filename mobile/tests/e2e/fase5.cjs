/* Fase 5 — publicidad: anuncios propios etiquetados y «ver un anuncio = 1 pregunta».
   Uso: npm run build && npm run preview & ; node tests/e2e/fase5.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";
const SUPA = "https://emuyxcrtkfqizavslwfj.supabase.co";
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`);

  const { p, login } = await makeApp(br, errs);
  await p.clock.install();
  const sponsors = [{ id: 3, title: "Clases de italiano B1", body: "Prepárate para el examen B1 con profesores nativos en tu ciudad.", cta: "Ver cursos" }];
  const clicks = [];
  const server = { left: 3, credits: 0, claims: [], started: 0 };
  await p.route(`${SUPA}/rest/v1/sponsors*`, (r) => r.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify(sponsors) }));
  await p.route(`${SUPA}/rest/v1/rpc/sponsor_click`, (r) => { clicks.push(JSON.parse(r.request().postData()).p_id); return r.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify("https://example.com/cursos") }); });
  await p.route(`${SUPA}/rest/v1/ai_wallets*`, (r) => r.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify({ credits: server.credits }) }));
  await p.route("**/api/ads", async (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    const b = JSON.parse(r.request().postData());
    const json = (s, o) => r.fulfill({ status: s, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify(o) });
    if (b.action === "status") return json(200, { available: server.left > 0, left: server.left, limit: 3, seconds: 15 });
    if (b.action === "start") { server.started++; return server.left > 0 ? json(200, { sponsor: sponsors[0], token: "tok-" + server.started + "-xxxxxxxxxxxxxxxxxxxx", seconds: 15, left: server.left }) : json(429, { error: "daily_limit", left: 0 }); }
    if (b.action === "claim") { server.claims.push(b.token); server.left--; server.credits++; return json(200, { ok: true, credits: server.credits, left: server.left }); }
  });
  const popups = [];
  p.context().on("page", (pg) => popups.push(pg.url()));

  await login();
  // Banner en el inicio
  await p.waitForSelector('aside[aria-label="Publicidad"]');
  const banner = p.locator('aside[aria-label="Publicidad"]');
  check("inicio: anuncio propio etiquetado «Publicidad»", (await banner.innerText()).includes("PUBLICIDAD") || (await banner.innerText()).includes("Publicidad"));
  check("inicio: muestra el anuncio del patrocinador", (await banner.innerText()).includes("Clases de italiano B1"));
  await banner.locator("button").click(); await p.waitForTimeout(500);
  check("al tocar se cuenta el clic", clicks.length === 1 && clicks[0] === 3);
  check("y se abre una pestaña nueva con el anunciante", popups.some((u) => u.startsWith("https://example.com/cursos")) || popups.length === 1, popups.join(","));

  // Asistente sin preguntas: ofrece ver un anuncio
  await p.goto(ORIGIN + PREFIX + "/assistant"); await p.waitForSelector("text=Has usado tus preguntas");
  check("sin preguntas: ofrece «Ver un anuncio y ganar 1 pregunta»", (await p.locator('button:has-text("Ver un anuncio y ganar 1 pregunta")').count()) === 1);
  check("indica cuántos quedan hoy", (await p.locator("text=Te quedan 3 hoy").count()) === 1);
  await p.click('button:has-text("Ver un anuncio y ganar 1 pregunta")');
  await p.waitForSelector('[role="dialog"]');
  check("el anuncio se ve a pantalla completa y etiquetado", (await p.locator('[role="dialog"]').innerText()).includes("Clases de italiano B1") && (await p.locator('[role="dialog"]').innerText()).toLowerCase().includes("publicidad"));
  check("antes de 15 s no se puede cobrar", (await p.locator('button:has-text("Recibir mi pregunta")').count()) === 0 && (await p.locator("text=/Espera \\d+ s/").count()) === 1);
  await p.clock.runFor(6000);
  check("a los 6 s todavía no se ha cobrado nada", server.claims.length === 0);
  await p.clock.runFor(10000); await p.waitForSelector('button:has-text("Recibir mi pregunta")');
  await p.click('button:has-text("Recibir mi pregunta")'); await p.waitForSelector("text=¡Tienes 1 pregunta más!");
  check("al terminar, el servidor suma la pregunta", server.claims.length === 1 && server.credits === 1);
  await p.click('button:has-text("Volver al asistente")');
  await p.waitForSelector("textarea");
  check("el asistente vuelve a estar disponible con 1 pregunta", (await p.locator("text=/^1 /").count()) > 0 && (await p.locator("text=Has usado tus preguntas").count()) === 0);
  await p.waitForSelector('button:has-text("+1 pregunta")', { timeout: 5000 }).catch(() => {});
  check("con preguntas, el botón «+1 pregunta» sigue a mano", (await p.locator('button:has-text("+1 pregunta")').count()) === 1);

  // Límite diario
  server.left = 0;
  await p.goto(ORIGIN + PREFIX + "/assistant"); await p.waitForSelector("textarea"); await p.waitForTimeout(300);
  check("límite diario alcanzado: el botón desaparece", (await p.locator('button:has-text("+1 pregunta")').count()) === 0);

  // Sin anuncios en la base: nada de huecos vacíos
  sponsors.length = 0;
  await p.goto(ORIGIN + PREFIX + "/"); await p.waitForSelector("text=Hola, Ana"); await p.waitForTimeout(300);
  check("sin anuncios activos no aparece ningún hueco", (await p.locator('aside[aria-label="Publicidad"]').count()) === 0);

  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})();
