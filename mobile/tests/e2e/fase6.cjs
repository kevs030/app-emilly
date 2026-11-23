/* Fase 6 — «Cómo funciona» en cada función a la que lleva un icono del inicio.
   Uso: npm run build && npm run preview & ; node tests/e2e/fase6.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || "";

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`);
  const { p, login } = await makeApp(br, errs);
  await login();

  // Cada icono del inicio (menos el perfil, que también lo tiene) abre una pantalla con su explicación.
  const links = await p.locator('nav[aria-label="Accesos"] a').evaluateAll((a) => a.filter((x) => x.target !== "_blank").map((x) => [x.textContent.trim(), x.getAttribute("href")]));
  let withHelp = 0;
  const missing = [];
  for (const [label, href] of links) {
    await p.goto(ORIGIN + href); await p.waitForSelector("h1");
    const card = p.locator("section.help-card");
    if (!(await card.count())) { missing.push(label); continue; }
    const rows = await card.locator("li").count();
    const img = await card.locator("img.ill").count();
    const texts = await card.locator("li").allInnerTexts();
    if (rows === 3 && img === 1 && texts.every((x) => x.trim().length > 20)) withHelp++;
    else missing.push(`${label} (filas ${rows}, imagen ${img})`);
  }
  check(`los ${links.length} iconos llevan a una pantalla con «Cómo funciona» completo`, withHelp === links.length, missing.join(", "));

  // Se cierra con «Entendido», se recuerda y se vuelve a abrir con «Ayuda»
  await p.goto(ORIGIN + PREFIX + "/documents"); await p.waitForSelector("section.help-card");
  check("documentos: explica que se guardan solo en el teléfono", (await p.locator("section.help-card").innerText()).includes("solo en este teléfono"));
  await p.click('section.help-card button:has-text("Entendido")');
  check("«Entendido» la cierra", (await p.locator("section.help-card").count()) === 0);
  await p.reload(); await p.waitForSelector("h1");
  check("al volver, sigue cerrada", (await p.locator("section.help-card").count()) === 0);
  await p.click('header button:has-text("Ayuda")');
  check("«Ayuda» la vuelve a abrir", (await p.locator("section.help-card").count()) === 1);

  // Imágenes cargadas de verdad
  await p.goto(ORIGIN + PREFIX + "/map"); await p.waitForSelector("section.help-card img.ill");
  await p.waitForFunction(() => { const i = document.querySelector("section.help-card img.ill"); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 8000 }).catch(() => {});
  check("la ilustración de la explicación carga", await p.locator("section.help-card img.ill").evaluate((i) => i.complete && i.naturalWidth > 0));

  // Otro idioma
  await p.evaluate(() => localStorage.setItem("aposto:lang", "ar"));
  await p.goto(ORIGIN + PREFIX + "/community"); await p.waitForSelector("section.help-card");
  check("traducida (árabe)", (await p.locator("section.help-card h2").innerText()).includes("كيف يعمل"));
  await p.evaluate(() => localStorage.setItem("aposto:lang", "es"));

  // Vídeo tutorial: ya NO sale al entrar (portada ni guía de inicio); está en Perfil, detrás de un botón
  await p.goto(ORIGIN + PREFIX + "/tour"); await p.waitForSelector("h1");
  check("guía de inicio: sin vídeo al entrar", (await p.locator("video").count()) === 0);
  await p.goto(ORIGIN + PREFIX + "/profile"); await p.waitForSelector("h1");
  check("perfil: el vídeo no se muestra hasta pulsar «Mira cómo se usa»", (await p.locator("video").count()) === 0 && (await p.locator('[data-testid="tutorial-open"]').count()) === 1);
  await p.click('[data-testid="tutorial-open"]');
  const v = p.locator("video");
  check("vídeo: no se descarga hasta pulsar «reproducir»", (await v.getAttribute("preload")) === "none" && /\/video\/tutorial-es\.mp4$/.test(await v.getAttribute("src")));
  check("vídeo: con imagen de portada y subtítulos", /tutorial-es\.jpg$/.test(await v.getAttribute("poster")) && (await p.locator('video track[kind="captions"]').count()) === 1);
  const guest = await makeApp(br, errs);
  await guest.p.goto(ORIGIN + PREFIX + "/welcome"); await guest.p.waitForSelector("#langs-title");
  check("portada: sin vídeo al entrar", (await guest.p.locator("video").count()) === 0);
  await guest.p.context().close();

  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})();
