import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Locale } from "@/lib/locales";

const CACHE_DIR = path.join(process.cwd(), ".translate-cache");

function mymemoryCode(loc: Locale): string {
  return loc === "pt-BR" ? "pt" : "en";
}

function cacheKey(from: Locale, to: Locale, text: string): string {
  return crypto
    .createHash("sha256")
    .update(`${from}\0${to}\0${text}`, "utf8")
    .digest("hex");
}

function readCache(key: string): string | undefined {
  try {
    const p = path.join(CACHE_DIR, `${key}.txt`);
    if (!fs.existsSync(p)) return undefined;
    return fs.readFileSync(p, "utf8");
  } catch {
    return undefined;
  }
}

function writeCache(key: string, value: string): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const p = path.join(CACHE_DIR, `${key}.txt`);
    fs.writeFileSync(p, value, "utf8");
  } catch {}
}

function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const parts: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + maxLen, text.length);
    if (end < text.length) {
      const slice = text.slice(i, end);
      const lastBreak = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "));
      if (lastBreak > maxLen * 0.3) end = i + lastBreak + 1;
    }
    parts.push(text.slice(i, end).trim());
    i = end;
  }
  return parts.filter(Boolean);
}

async function translateMyMemoryChunk(
  q: string,
  from: Locale,
  to: Locale
): Promise<string> {
  const fromC = mymemoryCode(from);
  const toC = mymemoryCode(to);
  const langpair = `${fromC}|${toC}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${langpair}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  const out = data.responseData?.translatedText;
  if (typeof out !== "string" || !out) throw new Error("MyMemory: empty response");
  if (data.responseStatus === 403 || /MYMEMORY/.test(out))
    throw new Error("MyMemory quota");
  return out;
}

async function translateWithMyMemory(
  text: string,
  from: Locale,
  to: Locale
): Promise<string> {
  if (from === to || !text.trim()) return text;
  const key = cacheKey(from, to, text);
  const hit = readCache(key);
  if (hit != null) return hit;
  const chunks = chunkText(text, 420);
  const out: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const pieceKey = cacheKey(from, to, c);
    let translated = readCache(pieceKey);
    if (translated == null) {
      translated = await translateMyMemoryChunk(c, from, to);
      writeCache(pieceKey, translated);
      if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, 350));
    }
    out.push(translated);
  }
  const joined = out.join("\n\n");
  writeCache(key, joined);
  return joined;
}

async function translateWithOpenAI(
  text: string,
  from: Locale,
  to: Locale
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const target = to === "pt-BR" ? "Brazilian Portuguese" : "English";
  const source = from === "pt-BR" ? "Brazilian Portuguese" : "English";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATE_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You translate text from ${source} to ${target}. Preserve Markdown structure, fenced code blocks, inline code, and links unchanged. Only translate human prose and image alt text if present. Return only the translated text, no preamble.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI translate failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const out = data.choices?.[0]?.message?.content?.trim();
  if (!out) throw new Error("OpenAI: empty completion");
  return out;
}

export async function translateBetween(
  text: string,
  from: Locale,
  to: Locale
): Promise<string> {
  if (from === to || !text.trim()) return text;
  const diskKey = cacheKey(from, to, text);
  const fullHit = readCache(`full-${diskKey}`);
  if (fullHit != null) return fullHit;
  let result: string;
  if (process.env.OPENAI_API_KEY) {
    try {
      result = await translateWithOpenAI(text, from, to);
    } catch {
      result = await translateWithMyMemory(text, from, to);
    }
  } else {
    result = await translateWithMyMemory(text, from, to);
  }
  writeCache(`full-${diskKey}`, result);
  return result;
}
