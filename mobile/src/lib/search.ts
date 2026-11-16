import { bonuses } from "@/content/bonuses";
import { documents } from "@/content/documents";
import { guides } from "@/content/guides";
import type { L10n } from "@/content/types";

export type SearchKind = "guide" | "benefit" | "form";
export type SearchResult = { kind: SearchKind; id: string; title: string; snippet: string; to?: string; href?: string; score: number };

type ContentLang = "es" | "it" | "en";

/** Minúsculas y sin acentos, para que «codigo» encuentre «código». */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9Ѐ-ӿ؀-ۿঀ-৿]+/g, " ")
    .trim();
}

const pick = (t: L10n, lang: ContentLang) => (lang === "it" ? (t.it ?? t.en) : t[lang]);
/** Se busca en el idioma de la persona y también en italiano, porque los trámites tienen nombre italiano. */
const both = (t: L10n, lang: ContentLang) => `${pick(t, lang)} ${t.it ?? ""}`;

type Entry = Omit<SearchResult, "score"> & { strong: string; weak: string };

function buildIndex(lang: ContentLang): Entry[] {
  return [
    ...guides.map((g) => ({
      kind: "guide" as const,
      id: g.slug,
      title: pick(g.title, lang),
      snippet: pick(g.summary, lang),
      to: `/guides/${g.slug}`,
      strong: normalize(`${both(g.title, lang)} ${g.slug.replace(/-/g, " ")}`),
      weak: normalize([both(g.summary, lang), ...g.steps.map((s) => `${both(s.title, lang)} ${pick(s.body, lang)}`), ...g.documents.map((d) => pick(d, lang))].join(" ")),
    })),
    ...bonuses.map((b) => ({
      kind: "benefit" as const,
      id: b.slug,
      title: pick(b.name, lang),
      snippet: pick(b.who, lang),
      to: `/benefits#${b.slug}`,
      strong: normalize(`${both(b.name, lang)} ${b.slug.replace(/-/g, " ")}`),
      weak: normalize([pick(b.who, lang), pick(b.amount, lang), ...b.requirements.map((r) => pick(r, lang))].join(" ")),
    })),
    ...documents.map((d) => ({
      kind: "form" as const,
      id: d.id,
      title: pick(d.title, lang),
      snippet: `${d.issuer} · ${pick(d.description, lang)}`,
      href: d.url,
      strong: normalize(`${both(d.title, lang)} ${d.issuer}`),
      weak: normalize(pick(d.description, lang)),
    })),
  ];
}

const cache = new Map<ContentLang, Entry[]>();

/** Buscador global sobre el contenido verificado: trámites, ayudas y formularios oficiales. */
export function search(query: string, lang: ContentLang, limit = 20): SearchResult[] {
  const words = normalize(query).split(" ").filter((w) => w.length >= 2);
  if (words.length === 0) return [];
  if (!cache.has(lang)) cache.set(lang, buildIndex(lang));
  const out: SearchResult[] = [];
  for (const { strong, weak, ...entry } of cache.get(lang)!) {
    let score = 0;
    let all = true;
    for (const w of words) {
      const inStrong = strong.includes(w);
      const inWeak = weak.includes(w);
      if (!inStrong && !inWeak) {
        all = false;
        break;
      }
      score += inStrong ? 10 : 2;
    }
    if (all) out.push({ ...entry, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
