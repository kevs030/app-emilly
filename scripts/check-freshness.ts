/**
 * Revisión semanal del contenido (npm run check:freshness).
 *  1. Lista las guías, ayudas y contactos con más de 7 días sin verificar.
 *  2. Comprueba que los enlaces de las fuentes siguen respondiendo.
 * Sale con código 1 si hay algo que revisar, para usarlo en un aviso automático semanal.
 */
import { guides } from "../src/content/guides";
import { bonuses } from "../src/content/bonuses";
import { directory } from "../src/content/directory";
import { documents } from "../src/content/documents";

const MAX_DAYS = 7;
const now = Date.now();
const age = (d: string) => Math.floor((now - new Date(d + "T00:00:00Z").getTime()) / 86_400_000);

const items = [
  ...guides.map((g) => ({ kind: "guía", id: g.slug, lastVerified: g.lastVerified, urls: g.sources.map((s) => s.url) })),
  ...bonuses.map((b) => ({ kind: "ayuda", id: b.slug, lastVerified: b.lastVerified, urls: b.sources.map((s) => s.url) })),
  ...documents.map((d) => ({ kind: "documento", id: d.id, lastVerified: d.lastVerified, urls: [d.url] })),
  ...directory.map((d) => ({ kind: "contacto", id: d.id, lastVerified: d.lastVerified, urls: d.url ? [d.url] : [] })),
];

async function checkUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(20_000), headers: { "User-Agent": "Mozilla/5.0 (compatible; emilly-linkcheck)" } });
    return res.ok ? null : `HTTP ${res.status}`;
  } catch (e) {
    return (e as Error).name;
  }
}

async function main() {
  let problems = 0;
  console.log(`\n== Contenido con más de ${MAX_DAYS} días sin verificar ==`);
  for (const it of items) {
    const days = age(it.lastVerified);
    if (days > MAX_DAYS) {
      problems++;
      console.log(`  ⚠️  ${it.kind} "${it.id}": ${days} días (último: ${it.lastVerified})`);
    }
  }
  console.log("\n== Enlaces de las fuentes ==");
  const urls = [...new Set(items.flatMap((i) => i.urls))];
  const results = await Promise.all(urls.map(async (u) => [u, await checkUrl(u)] as const));
  for (const [u, err] of results) {
    if (err) {
      problems++;
      console.log(`  ❌ ${err}  ${u}`);
    }
  }
  console.log(problems ? `\n${problems} cosas por revisar.` : "\n✅ Todo al día.");
  process.exit(problems ? 1 : 0);
}

main();
