import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

import { getContentSourceLocale, isLocale, type Locale } from "@/lib/locales";
import { mergePostTags } from "@/lib/tags";
import { translateBetween } from "@/lib/translate";
import type { Post } from "@/types";

const WORDS_PER_MINUTE = 200;

type MatterData = {
  title?: unknown;
  date?: unknown;
  tags?: unknown;
  excerpt?: unknown;
  minutes?: unknown;
  contentLang?: unknown;
};

function assertString(v: unknown, field: string, id: string): string {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(
      `[content/${id}.md] Invalid front matter: "${field}" is required (non-empty string).`
    );
  }
  return v.trim();
}

function dateToIsoUtc(d: Date): string {
  if (Number.isNaN(d.getTime())) {
    throw new Error("[content] Invalid date derived from the file or front matter.");
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveDate(v: unknown, filePath: string): string {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return dateToIsoUtc(v);
  }
  if (typeof v === "string" && v.trim()) {
    return v.trim();
  }
  const st = fs.statSync(filePath);
  const birthMs = st.birthtimeMs;
  const useBirth = Number.isFinite(birthMs) && birthMs > 86400000;
  return dateToIsoUtc(useBirth ? st.birthtime : st.mtime);
}

function normalizeTags(tags: unknown): string[] {
  if (tags == null) return [];
  if (Array.isArray(tags))
    return tags
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof tags === "string")
    return tags
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function deriveMinutes(body: string, explicit: unknown): number {
  if (typeof explicit === "number" && Number.isFinite(explicit) && explicit > 0) {
    return Math.round(explicit);
  }
  if (typeof explicit === "string" && /^\d+$/.test(explicit.trim())) {
    return Math.max(1, parseInt(explicit.trim(), 10));
  }
  const w = wordCount(body);
  return Math.max(1, Math.round(w / WORDS_PER_MINUTE));
}

function deriveExcerpt(body: string, explicit: unknown): string {
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  const lines = body.trim().split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;
    if (t.startsWith("```")) continue;
    if (t.startsWith("---")) continue;
    const stripped = t.startsWith(">") ? t.replace(/^>\s*/, "") : t;
    const flat = stripped.replace(/\s+/g, " ").trim();
    if (flat) return flat.length > 220 ? `${flat.slice(0, 217)}...` : flat;
  }
  return "";
}

function resolveWrittenLang(data: MatterData, fileLocale: Locale): Locale {
  const c = data.contentLang;
  if (typeof c === "string") {
    const t = c.trim();
    if (isLocale(t)) return t;
  }
  return fileLocale;
}

type LoadedPost = { post: Post; writtenLang: Locale; fmTags: string[] };

function readPostFromPath(
  filePath: string,
  id: string,
  fileLocale: Locale
): LoadedPost | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const d = data as MatterData;
  const title = assertString(d.title, "title", id);
  const date = resolveDate(d.date, filePath);
  const bodyMarkdown = content.trim();
  const writtenLang = resolveWrittenLang(d, fileLocale);
  const fmTags = normalizeTags(d.tags);
  const post: Post = {
    id,
    date,
    title,
    tags: mergePostTags(fmTags, bodyMarkdown),
    excerpt: deriveExcerpt(bodyMarkdown, d.excerpt),
    minutes: deriveMinutes(bodyMarkdown, d.minutes),
    bodyMarkdown,
  };
  return { post, writtenLang, fmTags };
}

async function maybeTranslatePost(
  post: Post,
  fmTags: string[],
  from: Locale,
  to: Locale
): Promise<Post> {
  if (from === to) return post;
  try {
    const [title, excerpt, bodyMarkdown] = await Promise.all([
      translateBetween(post.title, from, to),
      translateBetween(post.excerpt, from, to),
      translateBetween(post.bodyMarkdown, from, to),
    ]);
    return {
      ...post,
      title,
      excerpt,
      bodyMarkdown,
      tags: mergePostTags(fmTags, bodyMarkdown),
      minutes: deriveMinutes(bodyMarkdown, undefined),
    };
  } catch (e) {
    console.warn(`[translate] post "${post.id}" (${from} → ${to}):`, e);
    return post;
  }
}

export const getPost = cache(
  async (locale: Locale, id: string): Promise<Post | undefined> => {
    const source = getContentSourceLocale();
    const filePath = path.join(process.cwd(), "content", source, `${id}.md`);
    const loaded = readPostFromPath(filePath, id, source);
    if (!loaded) return undefined;

    if (loaded.writtenLang !== locale) {
      return maybeTranslatePost(loaded.post, loaded.fmTags, loaded.writtenLang, locale);
    }
    return loaded.post;
  }
);

export async function getAllPostIds(): Promise<string[]> {
  const source = getContentSourceLocale();
  const dir = path.join(process.cwd(), "content", source);
  if (!fs.existsSync(dir)) return [];
  const ids: string[] = [];
  for (const n of fs.readdirSync(dir)) {
    if (n.endsWith(".md")) ids.push(n.slice(0, -3));
  }
  return ids.sort();
}

export const getPosts = cache(async (locale: Locale): Promise<Post[]> => {
  const ids = await getAllPostIds();
  const list = await Promise.all(ids.map((id) => getPost(locale, id)));
  const posts = list.filter((p): p is Post => p != null);
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
});
