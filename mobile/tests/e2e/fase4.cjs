/* Fase 4 — privacidad: modo invitado, situación y documentos solo en el teléfono, traslado de datos antiguos.
   Uso: npm run build && npm run preview & ; node tests/e2e/fase4.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || ""; // "/app" cuando se prueba la app servida dentro de la web
const SUPA = "https://emuyxcrtkfqizavslwfj.supabase.co";

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`);

  // ── 1. Sin cuenta: se puede leer, no se puede guardar ──
  {
    const { p } = await makeApp(br, errs);
    const path = () => new URL(p.url()).pathname.replace(PREFIX, "") || "/";
    await p.goto(ORIGIN + PREFIX + "/welcome"); await p.waitForSelector("#langs-title");
    check("portada: botón «Ver las guías sin crear cuenta»", (await p.locator('a[href$="/guides"]:has-text("sin crear cuenta")').count()) === 1);
    await p.click('a:has-text("sin crear cuenta")'); await p.waitForSelector('[role="note"]');
    check("invitado: abre la lista de guías", path() === "/guides");
    check("invitado: aviso para crear cuenta, sin bloquear", (await p.locator('[role="note"]:has-text("sin cuenta")').count()) === 1);
    const tabs = await p.locator('nav[aria-label="Principal"] a').evaluateAll((a) => a.map((x) => x.getAttribute("href").replace(/^\/app/, "")));
    check("invitado: barra con Guías, Ayudas, Mapa y Entrar", JSON.stringify(tabs) === JSON.stringify(["/guides", "/benefits", "/map", "/welcome"]), tabs.join(","));
    await p.goto(ORIGIN + PREFIX + "/guides/codice-fiscale"); await p.waitForSelector("h1");
    check("invitado: lee una guía completa", (await p.locator("h1").innerText()).toLowerCase().includes("código fiscal"));
    check("invitado: en la guía se ofrece crear cuenta y no «Empezar trámite»", (await p.locator('section a[href$="/welcome"]').count()) === 1 && (await p.locator('button:has-text("Empezar")').count()) === 0);
    await p.goto(ORIGIN + PREFIX + "/benefits"); await p.waitForSelector("li.card");
    check("invitado: ve las ayudas", (await p.locator("li.card").count()) >= 4);
    await p.goto(ORIGIN + PREFIX + "/search"); await p.waitForSelector('input[type="search"]');
    check("invitado: usa el buscador", true);
    for (const priv of ["/", "/documents", "/profile", "/assistant"]) {
      await p.goto(ORIGIN + PREFIX + priv); await p.waitForURL(/\/welcome$/);
      check(`invitado: «${priv}» pide cuenta`, path() === "/welcome");
    }
    await p.context().close();
  }

  // ── 2. Cuenta antigua con la situación en el servidor: pasa al teléfono y se borra del servidor ──
  {
    const { p, db, login } = await makeApp(br, errs);
    Object.assign(db.profile, { permit_type: "nessuno", permit_expiry: null, has_children: true, consent_personalization: false });
    // Documento antiguo guardado en el servidor por una versión anterior
    const legacy = { id: 7, title: "Pasaporte", kind: "identita", storage_path: "u1/old.jpg", mime: "image/jpeg", expires_on: "2030-01-01", analysis: null, analysis_lang: null, created_at: "2026-10-01T10:00:00Z" };
    const server = { docs: [legacy], files: new Map([["u1/old.jpg", Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4])]]) };
    const assistantBodies = [];
    await p.route(`${SUPA}/rest/v1/documents*`, (r) => {
      const m = r.request().method(); const u = new URL(r.request().url());
      if (m === "DELETE") { const id = Number((u.searchParams.get("id") || "").replace("eq.", "")); server.docs = server.docs.filter((d) => d.id !== id); return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } }); }
      return r.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "content-type": "application/json" }, body: JSON.stringify(server.docs) });
    });
    await p.route(`${SUPA}/storage/v1/**`, (r) => {
      const req = r.request(); const path = new URL(req.url()).pathname.replace("/storage/v1/object/", "");
      const h = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
      if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers: h });
      if (req.method() === "GET" && path.startsWith("documents/")) { const f = server.files.get(path.replace("documents/", "")); return f ? r.fulfill({ status: 200, headers: { ...h, "content-type": "image/jpeg" }, body: f }) : r.fulfill({ status: 404, headers: h }); }
      if (req.method() === "DELETE") { JSON.parse(req.postData()).prefixes.forEach((k) => server.files.delete(k)); return r.fulfill({ status: 200, headers: { ...h, "content-type": "application/json" }, body: "[]" }); }
      return r.fulfill({ status: 400, headers: h });
    });
    await p.route("**/api/assistant", async (r) => {
      if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" } });
      assistantBodies.push(JSON.parse(r.request().postData()));
      return r.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "content-type": "text/plain", "x-credits-remaining": "2" }, body: "Hola." });
    });
    await login();
    await p.waitForTimeout(600);
    const sit = await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.startsWith("aposto:situation:")); return k ? JSON.parse(localStorage.getItem(k)) : null; });
    check("migración: la situación antigua pasa al teléfono", sit && sit.permit_type === "nessuno" && sit.has_children === true, JSON.stringify(sit));
    check("migración: y se borra del servidor", db.profile.permit_type === null && db.profile.has_children === null, JSON.stringify(db.profile));

    await p.goto(ORIGIN + PREFIX + "/file"); await p.waitForSelector("#permit");
    check("expediente: muestra la situación guardada en el teléfono", (await p.locator("#permit").inputValue()) === "nessuno" && (await p.locator("#children").inputValue()) === "yes");
    check("expediente: explica que se guarda solo en el teléfono", (await p.locator("text=solo en este teléfono").count()) >= 1);

    await p.goto(ORIGIN + PREFIX + "/documents"); await p.waitForSelector("li.card");
    await p.waitForTimeout(300);
    const copies = await p.locator("li.card", { hasText: "Pasaporte" }).count();
    check("migración: el documento antiguo se copia al teléfono (una sola vez)", copies === 1, `copias: ${copies}`);
    check("migración: después se borra del servidor (archivo y ficha)", server.docs.length === 0 && server.files.size === 0, JSON.stringify({ docs: server.docs.length, files: server.files.size }));
    check("documentos: el texto ya no habla de servidor", (await p.locator("text=solo en este teléfono, cifrados").count()) >= 1);
    await p.goto(ORIGIN + PREFIX + "/documents"); await p.waitForSelector("li.card");
    await p.waitForTimeout(300);
    check("migración: no se duplica al volver a entrar", (await p.locator("li.card", { hasText: "Pasaporte" }).count()) === 1);

    await p.goto(ORIGIN + PREFIX + "/assistant"); await p.waitForSelector("textarea");
    await p.fill("textarea", "¿Qué hago?"); await p.click('button[aria-label="Enviar"]'); await p.waitForSelector("text=Hola.");
    check("asistente: sin consentimiento NO recibe la situación", assistantBodies.length === 1 && assistantBodies[0].situation === undefined, JSON.stringify(assistantBodies[0] || {}));
    await p.context().close();
  }

  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})();
