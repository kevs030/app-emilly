/* Fases 2–9 — documentos, traductor, avisos, expediente, asistente con historial, simulador, mapa y comunidad.
   Servidor simulado: ninguna prueba toca datos reales ni gasta créditos. Uso: npm run build && npm run preview & ; node tests/e2e/fase2.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || ""; // "/app" cuando se prueba la app servida dentro de la web


let PNG = Buffer.alloc(0); // se genera en el navegador tras iniciar sesión
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*", "access-control-expose-headers": "X-Credits-Remaining" };
const ANSWER = "[1] Qué es\nCarta del INPS sobre el Assegno Unico.\n[2] Qué pide\n1. Enviar el ISEE.\n[3] Fechas\n30/11/2026\n[4] Traducción\nEstimada señora…";

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => { res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`); console.log(res[res.length - 1]); };
  const { p, db, login } = await makeApp(br, errs);
  p.setDefaultTimeout(8000);
  p.on("response", (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url().slice(0, 110)}`));

  // ── tablas y servicios nuevos del servidor simulado ──
  const t = { documents: [], ai_conversations: [], ai_messages: [], forum_posts: [{ id: 50, author_id: "u2", author_name: "Luis", category: "casa", title: "¿Cómo registro mi contrato de alquiler?", body: "Acabo de firmar y no sé dónde ir.", hidden: false, created_at: new Date().toISOString() }], forum_comments: [], forum_reports: [] };
  const files = new Map();
  const calls = { document: [], assistant: [], storageDelete: [] };
  let seq = 100;
  const json = (r, status, body) => r.fulfill({ status, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify(body) });
  const match = (row, u) => [...u.searchParams].every(([k, v]) => (v.startsWith("eq.") ? String(row[k]) === v.slice(3) : true));
  await p.route("https://emuyxcrtkfqizavslwfj.supabase.co/rest/v1/**", async (r) => {
    const req = r.request(); const u = new URL(req.url()); const table = u.pathname.replace("/rest/v1/", ""); const m = req.method();
    if (!(table in t) || m === "OPTIONS") return r.fallback();
    const one = (req.headers()["accept"] || "").includes("vnd.pgrst.object");
    if (m === "GET") { const rows = t[table].filter((x) => match(x, u)); return one ? (rows[0] ? json(r, 200, rows[0]) : json(r, 406, {})) : json(r, 200, rows); }
    if (m === "POST") {
      const b = JSON.parse(req.postData());
      const row = { id: seq++, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), hidden: false, ...b };
      if (table === "documents") Object.assign(row, { note: null, analysis: null, analysis_lang: null });
      if (table.startsWith("forum_") && table !== "forum_reports") Object.assign(row, { author_id: "u1", author_name: "Ana" });
      t[table].unshift(row);
      return (req.headers()["prefer"] || "").includes("return=representation") ? json(r, 201, one ? row : [row]) : r.fulfill({ status: 201, headers: cors });
    }
    if (m === "PATCH") { t[table].filter((x) => match(x, u)).forEach((x) => Object.assign(x, JSON.parse(req.postData()))); return r.fulfill({ status: 204, headers: cors }); }
    if (m === "DELETE") { t[table] = t[table].filter((x) => !match(x, u)); if (table === "ai_conversations") t.ai_messages = t.ai_messages.filter((x) => t.ai_conversations.some((c) => c.id === x.conversation_id)); return r.fulfill({ status: 204, headers: cors }); }
  });
  await p.route("https://emuyxcrtkfqizavslwfj.supabase.co/storage/v1/**", async (r) => {
    const req = r.request(); const u = new URL(req.url()); const m = req.method(); const path = u.pathname.replace("/storage/v1/object/", "");
    if (m === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    if (path.startsWith("sign/documents/")) return json(r, 200, { signedURL: "/object/sign/documents/x?token=t" });
    if (path.startsWith("list/")) return json(r, 200, [...files.keys()].map((k) => ({ name: k.split("/")[1] })));
    if (m === "POST") { files.set(path.replace("documents/", ""), req.postDataBuffer()); return json(r, 200, { Key: path }); }
    if (m === "DELETE") { const b = JSON.parse(req.postData()); calls.storageDelete.push(b.prefixes); b.prefixes.forEach((k) => files.delete(k)); return json(r, 200, []); }
    if (m === "GET") return r.fulfill({ status: 200, headers: { ...cors, "content-type": "image/png" }, body: PNG });
  });
  await p.route("**/api/**", async (r) => {
    const req = r.request(); const u = new URL(req.url());
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    if (u.pathname === "/api/points") return json(r, 200, { points: [[45.4642, 9.19, "Questura di Milano", "Via Fatebenefratelli 11"], [41.9, 12.49, "Questura di Roma", "Via di San Vitale 15"]] });
    const body = JSON.parse(req.postData());
    const auth = (req.headers()["authorization"] || "").startsWith("Bearer ey");
    if (u.pathname === "/api/document") { calls.document.push({ lang: body.lang, mime: body.mime, size: body.image.length, auth }); return r.fulfill({ status: 200, headers: { ...cors, "content-type": "text/plain", "x-credits-remaining": "2" }, body: ANSWER }); }
    if (u.pathname === "/api/assistant") { calls.assistant.push({ n: body.messages.length, auth }); return r.fulfill({ status: 200, headers: { ...cors, "content-type": "text/plain", "x-credits-remaining": "1" }, body: "Te falta presentar el ISEE." }); }
  });
  await p.route("https://tile.openstreetmap.org/**", (r) => r.fulfill({ status: 200, headers: { "content-type": "image/png" }, body: PNG }));
  await p.route("https://nominatim.openstreetmap.org/**", (r) => json(r, 200, [{ lat: "45.4642", lon: "9.19" }]));
  const go = async (path, wait) => { await p.goto(ORIGIN + (PREFIX && path.startsWith(PREFIX + "/") ? "" : PREFIX) + path); if (wait) await p.waitForSelector(wait); };

  await login();
  PNG = Buffer.from(await p.evaluate(() => { const c = document.createElement("canvas"); c.width = 60; c.height = 80; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, 60, 80); x.fillStyle = "#000"; x.fillText("INPS", 5, 20); return c.toDataURL("image/png").split(",")[1]; }), "base64");
  // ── Inicio: 12 accesos, todos reales ──
  const links = await p.locator('nav[aria-label="Accesos"] a').evaluateAll((a) => a.map((x) => [x.textContent.trim(), x.getAttribute("href")]));
  check("el inicio muestra los 12 accesos", links.length === 12, links.map((l) => l[0]).join(", "));
  let opened = 0;
  for (const [, href] of links) { await go(href); await p.waitForTimeout(200); const h1 = await p.locator("h1").first().innerText().catch(() => ""); if (new URL(p.url()).pathname === href && h1) opened++; }
  check("cada acceso abre una pantalla con título", opened === 12, `${opened}/12`);
  await go("/", 'nav[aria-label="Accesos"]');
  const small = await p.locator("a, button").evaluateAll((els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); }).map((e) => e.textContent.trim().slice(0, 25)));
  check("inicio: botones ≥ 44 px y sin desbordamiento", small.length === 0 && (await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)), small.join(" | "));
  await p.screenshot({ path: "tests/e2e/out-inicio2.png", fullPage: true });

  // ── Mis documentos ──
  await go("/documents", "text=Añadir un documento");
  await p.locator('input[type=file]').nth(1).setInputFiles({ name: "permesso.png", mimeType: "image/png", buffer: PNG });
  await p.selectOption("#doc-kind", "permesso"); await p.fill('input[type=date]', "2027-03-01");
  await p.click('button.btn:has-text("Guardar")'); await p.waitForSelector("li.card >> text=permesso");
  const d = t.documents[0];
  check("documento: archivo en la carpeta privada de la persona", /^u1\/[0-9a-f-]{36}\.jpg$/.test(d.storage_path) && files.has(d.storage_path), d.storage_path);
  check("documento: ficha con tipo, tamaño y caducidad", d.kind === "permesso" && d.mime === "image/jpeg" && d.size_bytes > 0 && d.expires_on === "2027-03-01");
  check("antes de leer no se envía nada a la IA", calls.document.length === 0);
  await p.click('button:has-text("Leer y traducir")');
  check("leer: pide confirmación antes de enviar la foto", (await p.locator("text=Anthropic").count()) === 1 && calls.document.length === 0);
  await p.click('button:has-text("De acuerdo, leer")'); await p.waitForSelector("text=Qué te pide hacer");
  check("leer: se envía con sesión, en el idioma de la persona", calls.document.length === 1 && calls.document[0].auth && calls.document[0].lang === "es" && calls.document[0].mime === "image/jpeg");
  check("leer: muestra las 4 partes y el aviso de revisión", (await p.locator("li.card h3").count()) === 4 && (await p.locator("text=30/11/2026").count()) === 1 && (await p.locator("text=No es asesoramiento legal").count()) === 1);
  await p.waitForTimeout(300);
  check("leer: la explicación queda guardada en la ficha", (t.documents[0].analysis || "").includes("Carta del INPS") && t.documents[0].analysis_lang === "es");
  await p.screenshot({ path: "tests/e2e/out-documentos.png", fullPage: true });

  // ── Traductor ──
  await go("/scan", "text=Hacer una foto");
  await p.locator('input[type=file]').nth(1).setInputFiles({ name: "carta.png", mimeType: "image/png", buffer: PNG });
  await p.click('button:has-text("Leer y traducir")'); await p.click('button:has-text("De acuerdo, leer")'); await p.waitForSelector("text=Traducción");
  check("traductor: explica sin guardar nada", calls.document.length === 2 && t.documents.length === 1);
  await p.click('button:has-text("Guardar en Mis documentos")'); await p.waitForSelector("text=Guardado");
  check("traductor: guardar es opcional y conserva la explicación", t.documents.length === 2 && t.documents[0].kind === "lettera" && (t.documents[0].analysis || "").includes("Carta del INPS"));

  // ── borrar documento ──
  await go("/documents", "li.card");
  await p.locator('li.card button[aria-label="Borrar"]').first().click(); await p.waitForTimeout(400);
  check("borrar: se elimina el archivo y la ficha", t.documents.length === 1 && calls.storageDelete.length === 1 && files.size === 1);

  // ── Citas con calendario y Avisos ──
  await go("/appointments", "text=Pendientes");
  const day = new Date(); const target = new Date(day.getFullYear(), day.getMonth(), Math.min(28, day.getDate() + 2));
  const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
  await p.locator(`section button[aria-pressed]`).nth(target.getDate() - 1).click();
  await p.click('button:has-text("Añadir recordatorio")');
  check("calendario: al tocar un día, la fecha queda puesta", (await p.inputValue('input[type=date]')) === iso, iso);
  await p.fill('input[placeholder^="Ej."]', "Cita Questura"); await p.click('button.btn:has-text("Guardar")'); await p.waitForSelector("text=Cita Questura");
  check("calendario: el día queda marcado", (await p.locator(`section button[aria-pressed]`).nth(target.getDate() - 1).getAttribute("aria-label")).includes("tiene cita"));
  await go("/notifications", "text=Próximas fechas");
  check("avisos: muestra la cita próxima", (await p.locator("a.card:has-text('Cita Questura')").count()) === 1);
  check("avisos: en el navegador el interruptor está desactivado y lo explica", (await p.locator('[role=switch]').first().isDisabled()) && (await p.locator("text=app instalada").count()) === 1);

  // ── Mi expediente ──
  await go("/file", "text=Mi situación");
  await p.fill('input[autocomplete="address-level2"]', "Milano"); await p.selectOption("#permit", "lavoro"); await p.selectOption("#children", "yes");
  await p.click('button.btn:has-text("Guardar")'); await p.waitForSelector("text=Guardado");
  check("expediente: guarda situación", db.profile.city === "Milano" && db.profile.permit_type === "lavoro" && db.profile.has_children === true && db.profile.country_of_origin === null);
  check("expediente: compartir con el asistente empieza desactivado", (await p.locator('[role=switch]').getAttribute("aria-checked")) === "false");
  await p.click('[role=switch]'); await p.waitForTimeout(300);
  check("expediente: el consentimiento se guarda al activarlo", db.profile.consent_personalization === true);

  // ── Asistente con historial ──
  await go("/assistant", "textarea");
  await p.fill("textarea", "¿Qué me falta para el Assegno Unico?"); await p.click('button[aria-label="Enviar"]'); await p.waitForSelector("text=Te falta presentar el ISEE.");
  await p.waitForTimeout(400);
  check("asistente: responde y actualiza el saldo", calls.assistant.length === 1 && calls.assistant[0].auth && (await p.locator("text=1 preguntas").count() + await p.locator("text=/^1 /").count()) > 0);
  check("asistente: guarda la conversación (1) y sus 2 mensajes", t.ai_conversations.length === 1 && t.ai_messages.length === 2 && t.ai_messages.some((m) => m.role === "assistant"));
  await p.click('a:has-text("Historial")'); await p.waitForSelector("li.card");
  check("historial: lista la conversación por su primera pregunta", (await p.locator("li.card").innerText()).includes("Assegno Unico"));
  await p.click("li.card a"); await p.waitForSelector("text=Te falta presentar el ISEE.");
  check("historial: al abrirla se recuperan los mensajes", (await p.locator("text=¿Qué me falta para el Assegno Unico?").count()) === 1);
  await go("/assistant/history", "li.card");
  await p.click('li.card button[aria-label="Borrar"]'); await p.waitForSelector("text=Aún no hay conversaciones");
  check("historial: borrar elimina conversación y mensajes", t.ai_conversations.length === 0 && t.ai_messages.length === 0);

  // ── Simulador ──
  await go("/simulator", "text=Ver resultado");
  const before = { rest: 0 }; p.on("request", (rq) => rq.method() !== "GET" && before.rest++);
  const sets = await p.locator("fieldset").count();
  for (let i = 0; i < sets; i++) await p.locator("fieldset").nth(i).locator("button").nth(i === 0 ? 0 : 1).click(); // hijos: sí; resto: no
  check("simulador: no deja ver el resultado sin responder todo", await p.locator('button:has-text("Ver resultado")').isDisabled());
  await p.selectOption("#isee", "none"); await p.click('button:has-text("Ver resultado")'); await p.waitForSelector("text=Resultado orientativo");
  const cards = await p.locator("li.card").allInnerTexts();
  check("simulador: propone Assegno Unico y avisa del importe mínimo sin ISEE", cards.length === 1 && cards[0].includes("Assegno Unico") && cards[0].includes("importe mínimo") && cards[0].includes("Podría corresponderte"));
  check("simulador: las respuestas no salen del dispositivo", before.rest === 0);
  await p.screenshot({ path: "tests/e2e/out-simulador.png", fullPage: true });

  // ── Mapa ──
  await go("/map", "text=Questura di Roma");
  check("mapa: lista las oficinas más cercanas con distancia", (await p.locator("li.card").count()) === 2 && (await p.locator("li.card").first().innerText()).includes("km"));
  await p.fill('input[placeholder^="Ciudad"]', "Milano"); await p.click('button[aria-label="Buscar"]'); await p.waitForTimeout(900);
  check("mapa: al buscar Milano, la primera es la de Milano", (await p.locator("li.card").first().innerText()).includes("Milano"));
  check("mapa: «Cómo llegar» enlaza a la ruta", (await p.locator("li.card a").first().getAttribute("href")).startsWith("https://www.google.com/maps/dir/?api=1&destination=45.4642,9.19"));
  await p.screenshot({ path: "tests/e2e/out-mapa.png" });

  // ── Comunidad ──
  await go("/community", "text=¿Cómo registro mi contrato");
  await p.click('a:has-text("Hacer una pregunta")');
  await p.fill('input[minlength="5"]', "¿Dónde pido el ISEE gratis?"); await p.fill("#new-body", "Vivo en Milano y necesito el ISEE para una ayuda.");
  await p.click('button.btn:has-text("Publicar")'); await p.waitForSelector("h2:has-text('¿Dónde pido el ISEE gratis?')");
  check("comunidad: publica una pregunta", t.forum_posts[0].title.includes("ISEE") && t.forum_posts[0].lang === "es");
  await go("/community/50", "h2");
  await p.fill("#reply", "En la Agenzia delle Entrate, con el modelo RLI."); await p.click('button.btn:has-text("Publicar")'); await p.waitForSelector("text=modelo RLI");
  check("comunidad: responde a otra persona", t.forum_comments.length === 1 && t.forum_comments[0].post_id === 50);
  await p.locator('article button:has-text("Denunciar")').click(); await p.fill('article input', "Pide dinero"); await p.click('article button.btn:has-text("Denunciar")'); await p.waitForSelector("text=Denuncia enviada");
  check("comunidad: denuncia un contenido ajeno", t.forum_reports.length === 1 && t.forum_reports[0].post_id === 50);
  check("comunidad: lo propio se puede borrar y lo ajeno no", (await p.locator('article button:has-text("Borrar")').count()) === 0 && (await p.locator('li button:has-text("Borrar")').count()) === 1);

  check("sin errores de JavaScript ni peticiones fallidas", errs.length === 0, errs.join(" | "));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})().catch((e) => { console.error("ERROR DE LA PRUEBA:", e.message.split("\n").slice(0, 4).join(" / ")); process.exit(2); });
