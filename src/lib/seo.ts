import { defaultLocale, locales, type Locale } from "@/lib/locales";
import { getSiteUrlString } from "@/lib/site-url";
import type { Post, PostSummary } from "@/lib/types";

const MAX_KEYWORDS = 32;

export function postPath(lang: Locale, id: string): string {
  return `/${lang}/post/${id}`;
}

export function homePath(lang: Locale): string {
  return `/${lang}`;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrlString();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** hreflang + x-default para a mesma nota em todos os idiomas do site. */
export function alternateLanguagesForPost(id: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of locales) {
    out[l] = postPath(l, id);
  }
  out["x-default"] = postPath(defaultLocale, id);
  return out;
}

export function alternateLanguagesForHome(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of locales) {
    out[l] = homePath(l);
  }
  out["x-default"] = homePath(defaultLocale);
  return out;
}

function dedupeKeywords(words: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    const k = w.trim();
    if (!k || k.length > 48) continue;
    const lower = k.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(k);
    if (out.length >= MAX_KEYWORDS) break;
  }
  return out;
}

export function keywordsForPost(post: Post): string[] {
  const fromTitle = post.title
    .split(/[\s–—,;:()[\]{}]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !/^\d+$/.test(s));
  return dedupeKeywords([...post.tags, ...fromTitle, "EDusik", "Eduardo Dusik"]);
}

export function keywordsForHome(posts: PostSummary[]): string[] {
  const tagSet: string[] = [];
  for (const p of posts) {
    tagSet.push(...p.tags);
  }
  return dedupeKeywords([...tagSet, "notas", "notes", "blog", "EDusik", "Eduardo Dusik"]);
}
