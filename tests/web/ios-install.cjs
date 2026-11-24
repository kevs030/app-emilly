/* Instalación en iPhone como app web (PWA): botón de /descargar y aviso de /app según el navegador.
   Uso: npm run build && npx next start -p 3000 & ; node tests/web/ios-install.cjs */
const { chromium, devices } = require("playwright");
const B = "http://localhost:3000";
const iphone = devices["iPhone 13"];
const UA = {
  safari: iphone.userAgent,
  chrome: iphone.userAgent.replace(/Version\/\S+ (Mobile\/\S+) Safari\/\S+/, "CriOS/120.0.6099.119 $1 Safari/604.1"),
  instagram: iphone.userAgent.replace(/Version\/\S+ (Mobile\/\S+) Safari\/\S+/, "$1 Instagram 312.0.0.32.112 (iPhone14,5; iOS 17_2; es_ES)"),
};
const res = []; const check = (n, ok, x = "") => res.push(`${ok ? "OK   " : "FALLA"} ${n}${x ? " — " + x : ""}`);
(async () => {
  const br = await chromium.launch();
  const ctxFor = async (o, standalone = false) => {
    const { tablet, ...rest } = o; const ctx = await br.newContext({ locale: "es-ES", ...rest });
    if (tablet) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, "maxTouchPoints", { get: () => 5 }));
    if (standalone) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, "standalone", { get: () => true }));
    return ctx;
  };
  const dl = async (o, standalone) => { const ctx = await ctxFor(o, standalone); const p = await ctx.newPage(); await p.goto(B + "/descargar#iphone"); await p.waitForSelector("#iphone"); await p.waitForTimeout(400); return { p, ctx }; };

  // 1) iPhone Safari
  let { p, ctx } = await dl({ ...iphone });
  check("descargar: ningún enlace al perfil .mobileconfig", (await p.locator('a[href*="mobileconfig"]').count()) === 0);
  check("iPhone Safari: botón «Instalar A POSTO en iPhone»", (await p.locator('[data-testid="ios-install-btn"]').innerText()).includes("Instalar A POSTO en iPhone"));
  check("iPhone Safari: detectado como Safari", (await p.getAttribute('[data-testid="ios-install"]', "data-where")) === "safari");
  await p.click('[data-testid="ios-install-btn"]');
  const steps = await p.locator('[data-testid="ios-steps"] li').allInnerTexts();
  check("iPhone Safari: 5 pasos (abrir en Safari, Compartir, Añadir, «Abrir como app web», Añadir)", steps.length === 5 && /Compartir/.test(steps[1]) && /Añadir a pantalla de inicio/.test(steps[2]) && /Abrir como app web/.test(steps[3]) && /Añadir/.test(steps[4]), steps.map((s) => s.slice(0, 30)).join(" | "));
  check("iPhone Safari: botón «Abrir A Posto en Safari» lleva a /app", (await p.getAttribute('[data-testid="ios-open-app"]', "href")) === "/app");
  check("iPhone Safari: no promete descarga automática ni descarga nada", (await p.locator("text=/instalador|se descarga/i").count()) === 0);
  await ctx.close();
  // 2) Chrome en iPhone
  ({ p, ctx } = await dl({ ...iphone, userAgent: UA.chrome })); await p.click('[data-testid="ios-install-btn"]');
  check("iPhone Chrome: explica que hay que abrirlo en Safari", (await p.locator('[data-testid="ios-inapp"]').innerText()).includes("Chrome") && (await p.locator('[data-testid="ios-inapp"]').innerText()).includes("Safari"));
  await ctx.close();
  // 3) Instagram
  ({ p, ctx } = await dl({ ...iphone, userAgent: UA.instagram })); await p.click('[data-testid="ios-install-btn"]');
  check("Instagram (iPhone): explica que hay que abrirlo en Safari", (await p.locator('[data-testid="ios-inapp"]').innerText()).includes("Instagram"));
  await ctx.close();
  // 4) iPad (se presenta como Mac con pantalla táctil)
  ({ p, ctx } = await dl({ ...devices["iPad Pro 11"], userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15", tablet: true }));
  check("iPad Safari: detectado como iPhone/iPad en Safari", (await p.getAttribute('[data-testid="ios-install"]', "data-where")) === "safari");
  await ctx.close();
  // 5) Ya instalada
  ({ p, ctx } = await dl({ ...iphone }, true));
  check("ya instalada: dice que la abra desde su icono", (await p.locator('[data-testid="ios-installed"]').innerText()).includes("ya está instalada"));
  await ctx.close();
  // 6) Android y escritorio: Android intacto
  ({ p, ctx } = await dl({ ...devices["Pixel 7"] }));
  check("Android: sección APK intacta con su descarga", (await p.locator('#apk a[href*=".apk"]').count()) >= 1 && (await p.getAttribute('[data-testid="ios-install"]', "data-where")) === "other");
  await ctx.close();
  ({ p, ctx } = await dl({ viewport: { width: 1280, height: 900 } })); await p.click('[data-testid="ios-install-btn"]');
  check("escritorio: indica que se haga desde el iPhone", (await p.locator('[data-testid="ios-other"]').count()) === 1);
  await ctx.close();
  // 7) La app en /app (lo que se instala)
  const app = async (o, standalone) => { const c = await ctxFor(o, standalone); const q = await c.newPage(); const errs = []; q.on("pageerror", (e) => errs.push(String(e))); await q.goto(B + "/app"); await q.waitForSelector("#langs-title", { timeout: 20000 }); await q.waitForTimeout(500); return { q, c, errs }; };
  let r = await app({ ...iphone });
  check("/app en iPhone Safari: aviso con Compartir → Añadir → «Abrir como app web»", (await r.q.getAttribute('[data-testid="ios-install"]', "data-where")) === "safari" && /Compartir/.test(await r.q.locator('[data-testid="ios-install"]').innerText()));
  check("/app: el aviso no enlaza al perfil", (await r.q.locator('a[href*="mobileconfig"]').count()) === 0);
  check("/app: portada con registro e inicio de sesión", (await r.q.locator("button", { hasText: "Crear cuenta" }).count()) >= 1 && (await r.q.locator("button", { hasText: "Entrar" }).count()) >= 1);
  check("/app: sin errores de JavaScript", r.errs.length === 0, r.errs.join(" | "));
  await r.c.close();
  r = await app({ ...iphone, userAgent: UA.chrome });
  check("/app en Chrome iPhone: pide abrir en Safari", (await r.q.getAttribute('[data-testid="ios-install"]', "data-where")) === "inapp");
  await r.c.close();
  r = await app({ ...iphone }, true);
  check("/app abierta desde el icono (standalone): sin aviso de instalar", (await r.q.locator('[data-testid="ios-install"]').count()) === 0);
  await r.c.close();
  r = await app({ ...devices["Pixel 7"] });
  check("/app en Android: sin aviso de iPhone", (await r.q.locator('[data-testid="ios-install"]').count()) === 0);
  await r.c.close();
  console.log(res.join("\n")); await br.close(); process.exit(res.some((x) => x.startsWith("FALLA")) ? 1 : 0);
})();
