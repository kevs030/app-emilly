/* Fase 12 — Estado del permiso en la Questura y apoyo emocional por ciudad.
   Uso: npm run build && npm run preview & ; node tests/e2e/fase12.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";
(async () => {
  const br = await chromium.launch();
  const res = []; const errs = [];
  const check = (n, ok, x = "") => res.push(`${ok ? "OK   " : "FALLA"} ${n}${x ? " — " + x : ""}`);

  // ── Apoyo emocional, sin cuenta ──
  const g = await makeApp(br, errs, {});
  await g.p.goto(ORIGIN + PREFIX + "/support"); await g.p.waitForSelector("h1");
  check("apoyo: se abre sin cuenta, con «No estás solo»", (await g.p.locator("text=No estás solo").count()) >= 1);
  check("apoyo: emergencia 112 bien visible", (await g.p.locator('[data-testid="support-urgent"] a[href="tel:112"]').count()) === 1);
  check("apoyo: Telefono Amico con llamada y WhatsApp", (await g.p.locator('[data-testid="support-telefono-amico"] a[href="tel:+390223272327"]').count()) === 1 && (await g.p.locator('[data-testid="support-telefono-amico"] a[href="https://wa.me/393240117252"]').count()) === 1);
  check("apoyo: sin ciudad elegida, explica las opciones de toda Italia", (await g.p.locator('[data-testid="support-nocity"]').count()) === 1 && (await g.p.locator('[data-testid="support-caritas"]').count()) === 1 && (await g.p.locator('[data-testid="support-consultorio"]').count()) === 1);
  await g.p.selectOption('[data-testid="support-city"]', "Milano");
  check("apoyo: Milano → Milano Welcome Center y WASI", (await g.p.locator('[data-testid="support-milano-welcome"]').count()) === 1 && (await g.p.locator('[data-testid="support-milano-wasi"]').count()) === 1);
  const mapHref = await g.p.locator('[data-testid="support-milano-welcome"] a', { hasText: "Cómo llegar" }).getAttribute("href");
  check("apoyo: «Cómo llegar» abre la app de mapas con la dirección", /Sammartini/.test(decodeURIComponent(mapHref)), mapHref);
  await g.p.selectOption('[data-testid="support-city"]', "Torino");
  check("apoyo: Torino → Centro Frantz Fanon", (await g.p.locator('[data-testid="support-torino-fanon"]').count()) === 1);
  await g.p.reload(); await g.p.waitForSelector('[data-testid="support-city"]');
  check("apoyo: recuerda la ciudad elegida", (await g.p.inputValue('[data-testid="support-city"]')) === "Torino");

  // ── Estado del permiso ──
  const { p, login, ctx, db } = await makeApp(br, errs, {});
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);
  // La web oficial no se abre de verdad en las pruebas: se simula.
  await ctx.route("https://questure.poliziadistato.it/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<h1>Polizia di Stato</h1>" }));
  await login();
  check("inicio: tarjetas visibles «¿En qué punto está mi permiso?» y apoyo emocional", (await p.locator('[data-testid="home-permit"]').isVisible()) && (await p.locator('[data-testid="home-support"]').isVisible()));
  await p.click('[data-testid="home-permit"]'); await p.waitForURL(/permit-status/);
  await p.fill('[data-testid="permit-code"]', "12 34"); await p.click('[data-testid="permit-check"]');
  check("permiso: número incorrecto → aviso claro", (await p.locator("text=debe tener 10 caracteres o 12 números").count()) === 1);
  await p.fill('[data-testid="permit-code"]', "0512 3456 7890");
  const [popup] = await Promise.all([p.context().waitForEvent("page"), p.click('[data-testid="permit-check"]')]);
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  check("permiso: copia el número limpio y abre la web oficial de la Polizia di Stato", clip === "051234567890" && popup.url().startsWith("https://questure.poliziadistato.it/stranieri"), `${clip} → ${popup.url()}`);
  await popup.close();
  await p.click('[data-testid="permit-orange"]');
  check("permiso: naranja → explica que está en trámite", (await p.locator('[data-testid="permit-meaning"]').innerText()).includes("en trámite"));
  await p.click('[data-testid="permit-remind"]'); await p.waitForTimeout(400);
  check("permiso: recordatorio en 7 días guardado en Mis citas", db.reminders.some((r) => /permiso de residencia/.test(r.title)), JSON.stringify(db.reminders.map((r) => r.title)));
  await p.reload(); await p.waitForSelector('[data-testid="permit-code"]');
  check("permiso: el número y el color se recuerdan en el teléfono", (await p.inputValue('[data-testid="permit-code"]')) === "051234567890" && (await p.locator('[data-testid="permit-orange"][aria-pressed="true"]').count()) === 1);
  await p.click('[data-testid="permit-green"]');
  check("permiso: verde → ir a recoger con recibo y pasaporte", (await p.locator('[data-testid="permit-meaning"]').innerText()).includes("recogerlo"));
  await p.evaluate(() => localStorage.setItem("aposto:lang", "ar")); await p.reload(); await p.waitForSelector("h1");
  check("permiso: en árabe, de derecha a izquierda y sin desbordamiento", (await p.evaluate(() => document.documentElement.dir)) === "rtl" && (await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)));
  await p.evaluate(() => localStorage.setItem("aposto:lang", "es"));
  await p.goto(ORIGIN + PREFIX + "/guides/permesso-di-soggiorno"); await p.waitForSelector("h1");
  check("guía del permiso: enlace a «¿En qué punto está mi permiso?»", (await p.locator('[data-testid="guide-permit-status"]').count()) === 1);
  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})().catch((e) => { console.log("ERROR DE LA PRUEBA:", e.message.split("\n").slice(0, 3).join(" / ")); process.exit(1); });
