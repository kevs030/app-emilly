/* Fase 3 — idiomas visibles en la bienvenida y guía de primer uso. Uso: npm run build && npm run preview & ; node tests/e2e/fase3.cjs */
const { chromium } = require("playwright");
const { makeApp } = require("./mock.cjs");
const ORIGIN = process.env.APP_ORIGIN || "http://localhost:4173";
const PREFIX = process.env.APP_PREFIX || ""; // "/app" cuando se prueba la app servida dentro de la web
const path = () => new URL(p.url()).pathname.replace(PREFIX, "") || "/";
let p;

(async () => {
  const br = await chromium.launch();
  const errs = [];
  const res = [];
  const check = (name, ok, extra = "") => res.push(`${ok ? "OK   " : "FALLA"} ${name}${extra ? " — " + extra : ""}`);
  // Los enlaces dentro de una frase (la casilla de aceptación) están exentos, como permite WCAG 2.5.8.
  const small = () => p.locator("a, button").evaluateAll((els) => els.filter((e) => { const r = e.getBoundingClientRect(); return !e.closest("label") && r.width > 0 && (r.height < 44 || r.width < 44); }).map((e) => e.textContent.trim().slice(0, 30)));
  const app = await makeApp(br, errs);
  p = app.p;
  const { db, login } = app;
  p.on("response", (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`));

  // Bienvenida: los 9 idiomas se ven como botones, sin abrir ningún menú
  await p.goto(ORIGIN + PREFIX + "/welcome"); await p.waitForSelector("#langs-title");
  const chips = await p.locator('section[aria-labelledby="langs-title"] button').allInnerTexts();
  check("bienvenida: muestra 9 idiomas", chips.length === 9, chips.join(", "));
  await p.click('section[aria-labelledby="langs-title"] button:has-text("Italiano")');
  check("bienvenida: tocar «Italiano» cambia la pantalla al italiano", (await p.locator("h1").innerText()).includes("Benvenuto"));
  await p.click('section[aria-labelledby="langs-title"] button:has-text("العربية")');
  check("bienvenida: el árabe se muestra de derecha a izquierda", (await p.evaluate(() => document.documentElement.dir)) === "rtl");
  await p.click('section[aria-labelledby="langs-title"] button:has-text("Español")');
  check("bienvenida: botones de 44 px o más", (await small()).length === 0, (await small()).join(" | "));
  check("bienvenida: sin desbordamiento horizontal", await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  // Portada: bienvenida arriba y, debajo, la tarjeta para crear cuenta o entrar
  check("portada: dice «¡Bienvenido/a!»", (await p.locator("h1").innerText()) === "¡Bienvenido/a!");
  check("portada: ilustración con descripción para lectores de pantalla", (await p.locator('svg.ppl[role="img"]').getAttribute("aria-label")).includes("personas"));
  check("portada: formulario de registro visible sin pasar a otra pantalla", (await p.locator('input[type=email]').count()) === 1 && (await p.locator('input[type=password]').count()) === 1);
  check("portada: correo y contraseña preparados para que el teléfono guarde la contraseña", (await p.locator('input[type=email]').getAttribute("autocomplete")) === "username" && (await p.locator('input[type=password]').getAttribute("autocomplete")) === "new-password");
  check("portada: aviso de que el teléfono ofrecerá guardar la contraseña", (await p.locator("text=guardar la contraseña").count()) === 1);
  await p.click('button[aria-pressed]:has-text("Entrar")');
  check("portada: «Entrar» cambia a acceso (contraseña actual y «Olvidé mi contraseña»)", (await p.locator('input[type=password]').getAttribute("autocomplete")) === "current-password" && (await p.locator("text=Olvidé mi contraseña").count()) === 1);
  await p.click('[role=tab]:has-text("Celular")');
  check("portada: opción de entrar con el número de celular", (await p.locator('[role=tab][aria-selected="true"]').innerText()).includes("Celular"));
  await p.click('[role=tab]:has-text("Correo")');
  check("portada: botones de 44 px o más", (await small()).length === 0, (await small()).join(" | "));
  check("portada: sin desbordamiento horizontal", await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.goto(ORIGIN + PREFIX + "/"); await p.waitForURL(/\/welcome$/);
  check("sin cuenta no se puede entrar al resto de la app", path() === "/welcome");

  // Primera vez que se entra: se abre la guía
  await login({ tour: true });
  await p.waitForSelector("text=Bienvenida a A Posto");
  check("al entrar por primera vez se abre la guía", path() === "/tour");
  check("la guía ocupa toda la pantalla (sin barra inferior)", (await p.locator('nav[aria-label="Principal"]').count()) === 0);
  check("guía: 9 idiomas para elegir", (await p.locator('ul[aria-label] button[aria-pressed]').count()) === 9);
  await p.click('ul[aria-label] button:has-text("Italiano")'); await p.waitForTimeout(300);
  check("guía: elegir idioma traduce la guía", (await p.locator("h1").innerText()).includes("Benvenuta"));
  check("guía: el idioma elegido se guarda en el perfil", db.profile.preferred_language === "it");
  await p.click('ul[aria-label] button:has-text("Español")'); await p.waitForTimeout(300);
  check("guía: botones de 44 px o más", (await small()).length === 0, (await small()).join(" | "));

  check("guía: cada paso tiene su ilustración", (await p.locator("svg.ppl").count()) === 1);
  const titles = [];
  for (let n = 0; n < 4; n++) { await p.click('button.btn:has-text("Siguiente")'); await p.waitForTimeout(150); titles.push(await p.locator("h1").innerText()); }
  check("guía: 5 pasos con título", titles.length === 4 && titles.every((x) => x.length > 0), titles.join(" | "));
  check("guía: el último paso ofrece «Empezar» y no «Saltar»", (await p.locator('button:has-text("Empezar")').count()) === 1 && (await p.locator('button:has-text("Saltar")').count()) === 0);
  await p.click('button.btn:has-text("Volver")'); await p.waitForTimeout(150);
  check("guía: «Volver» regresa al paso anterior", (await p.locator("h1").innerText()) === titles[2]);
  const links = await p.locator("a.card").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
  check("guía: los accesos del paso llevan a pantallas reales", links.length === 2 && links.every((h) => /\/(appointments|map)$/.test(h)), links.join(", "));
  await p.click('button.btn:has-text("Siguiente")'); await p.click('button.btn:has-text("Empezar")');
  await p.waitForSelector("text=Hola, Ana");
  check("«Empezar» lleva al inicio", path() === "/");
  await p.goto(ORIGIN + PREFIX + "/"); await p.waitForSelector("text=Hola, Ana");
  check("la guía no vuelve a abrirse sola", path() === "/");

  await p.goto(ORIGIN + PREFIX + "/profile"); await p.waitForSelector("text=Cómo funciona");
  check("en el navegador no se ofrece la huella (solo existe en el teléfono)", (await p.locator('[role=switch]').count()) === 0);

  // Se puede volver a abrir desde el perfil, y «Saltar» funciona
  await p.goto(ORIGIN + PREFIX + "/profile"); await p.click('a:has-text("Cómo funciona")');
  await p.waitForSelector("text=Bienvenida a A Posto");
  check("perfil → «Cómo funciona» abre la guía", path() === "/tour");
  await p.click('button:has-text("Saltar")'); await p.waitForSelector("text=Hola, Ana");
  check("«Saltar» lleva al inicio", path() === "/");

  // Cada idioma tiene los textos de la guía traducidos (no caen al inglés)
  for (const [code, word] of [["fr", "Bienvenue"], ["ar", "مرحبًا"], ["ro", "Bine ai venit"], ["sq", "Mirë se vini"], ["uk", "Ласкаво"], ["bn", "স্বাগতম"]]) {
    await p.evaluate((c) => localStorage.setItem("aposto:lang", c), code); await p.goto(ORIGIN + PREFIX + "/tour"); await p.waitForSelector("h1");
    check(`guía traducida: ${code}`, (await p.locator("h1").innerText()).includes(word));
  }
  await p.evaluate(() => localStorage.setItem("aposto:lang", "es"));

  check("sin errores de JavaScript", errs.length === 0, errs.join(" | "));
  console.log(res.join("\n"));
  await br.close();
  process.exit(res.some((r) => r.startsWith("FALLA")) ? 1 : 0);
})();
