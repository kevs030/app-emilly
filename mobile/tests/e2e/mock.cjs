/* Servidor simulado para las pruebas de navegador: ninguna prueba toca datos reales. */
const { chromium, devices } = require('playwright');
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 36000, role: 'authenticated' })}.sig`;
const user = { id: 'u1', aud: 'authenticated', email: 'ana@example.com', phone: '', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
const session = { access_token: jwt, token_type: 'bearer', expires_in: 36000, expires_at: Math.floor(Date.now() / 1000) + 36000, refresh_token: 'r1', user };
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
async function makeApp(br, errs, opts) {
  const mk = async ({ missing = false, video = null, contextOptions = {} } = {}) => {
    // video: { dir, size } graba la sesión (lo usa el vídeo de demostración, no las pruebas).
    const ctx = await br.newContext({ ...devices['iPhone 13'], locale: 'es-ES', ...(video ? { recordVideo: video } : {}), ...contextOptions });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
    p.on('dialog', d => d.accept());
    const db = { procedures: [], procedure_items: [], reminders: [], user_facts: [], activity: [], profile: { display_name: 'Ana', preferred_language: 'es', country_of_origin: null, city: null, consent_personalization: false, consent_analytics: false } };
    let seq = 1; const rpc = [];
    const match = (row, u) => [...u.searchParams].every(([k, v]) => !v.startsWith('eq.') || String(row[k]) === v.slice(3));
    await p.route('https://emuyxcrtkfqizavslwfj.supabase.co/**', async r => {
      const req = r.request(); const u = new URL(req.url()); const m = req.method();
      if (m === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
      const json = (status, body) => r.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const body = () => JSON.parse(req.postData() || '{}');
      if (u.pathname === '/auth/v1/settings') return json(200, { external: { email: true, phone: false } });
      if (u.pathname === '/auth/v1/token') return json(200, session);
      if (u.pathname === '/rest/v1/profiles') { if (m === 'PATCH') Object.assign(db.profile, body()); return m === 'GET' ? json(200, db.profile) : r.fulfill({ status: 204, headers: cors }); }
      if (u.pathname.startsWith('/rest/v1/rpc/')) { const fn = u.pathname.split('/').pop(); rpc.push([fn, body()]);
        if (fn === 'session_start') return json(200, db.profile.consent_analytics ? 'sess-1' : null);
        if (fn === 'my_usage') return json(200, { sessions: 3, active_minutes: 12 });
        if (fn === 'export_my_data') return json(200, { profile: db.profile, procedures: db.procedures });
        return json(200, null); }
      if (u.pathname === '/rest/v1/ai_wallets') return json(200, { credits: 3 });
      const table = u.pathname.replace('/rest/v1/', '');
      if (['documents', 'forum_posts', 'ai_conversations', 'sponsors'].includes(table) && m === 'GET') return json(200, []);
      if (!(table in db)) return json(404, {});
      if (missing) return json(404, { code: 'PGRST205', message: 'Could not find the table' });
      if (m === 'GET') return json(200, db[table].filter(x => match(x, u)));
      if (m === 'POST') { const b = body(); const now = new Date().toISOString();
        if (table === 'procedures' && db.procedures.some(x => x.guide_slug === b.guide_slug)) return json(409, { code: '23505' });
        const row = table === 'procedures' ? { id: seq++, status: 'active', started_at: now, updated_at: now, completed_at: null, ...b }
          : table === 'procedure_items' ? { done_at: now, ...b } : table === 'reminders' ? { id: seq++, done: false, ...b }
          : table === 'user_facts' ? { id: seq++, source: 'user', confirmed: true, created_at: now, ...b } : { id: seq++, created_at: now, ...b };
        db[table].unshift(row); return r.fulfill({ status: 201, headers: cors }); }
      if (m === 'PATCH') { db[table].filter(x => match(x, u)).forEach(x => { Object.assign(x, body()); if (x.status === 'done') x.completed_at = new Date().toISOString(); }); return r.fulfill({ status: 204, headers: cors }); }
      if (m === 'DELETE') { db[table] = db[table].filter(x => !match(x, u)); if (table === 'procedures') db.procedure_items = []; return r.fulfill({ status: 204, headers: cors }); }
    });
    await p.route('**/api/points*', r => r.fulfill({ status: 200, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify({ points: [[41.9, 12.49, 'Questura di Roma', 'Via di San Vitale 15']] }) }));
    // Sin la web delante (prueba de la app sola), la imagen del vídeo tutorial no existe: se simula.
    if (!process.env.APP_PREFIX) await p.route('**/video/tutorial-es.*', r => r.fulfill({ status: 200, contentType: r.request().url().endsWith('.vtt') ? 'text/vtt' : 'image/jpeg', body: r.request().url().endsWith('.vtt') ? 'WEBVTT\n' : '' }));
    // Publicidad: por defecto no hay anuncios (fase 5 lo sobrescribe con los suyos).
    await p.route('**/api/ads', r => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: cors }) : r.fulfill({ status: 200, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify({ available: false }) }));
    const login = async ({ tour = false } = {}) => { await p.goto((process.env.APP_ORIGIN || 'http://localhost:4173') + (process.env.APP_PREFIX || '') + '/auth?mode=signin'); await p.fill('input[type=email]', 'ana@example.com'); await p.fill('input[type=password]', 'Correcta12345'); await p.click('button.btn:has-text("Entrar")'); if (tour) return; await p.waitForSelector('text=Saltar'); await p.click('button:has-text("Saltar")'); await p.waitForSelector('text=Hola, Ana'); };
    return { p, db, rpc, login, ctx };
  };
  return mk(opts);
}
module.exports = { makeApp };
