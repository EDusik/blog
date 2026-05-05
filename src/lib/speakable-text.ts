import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";

export type SpeakableWord = {
  index: number;
  start: number;
  end: number;
  text: string;
};

export type SpeakableTextModel = {
  plainText: string;
  words: SpeakableWord[];
};

type Segment = {
  segment: string;
  isWordLike?: boolean;
};

/**
 * Keep segmentation identical in Node (SSR) and the browser. `Intl.Segmenter`
 * can differ across runtimes and break hydration; the regex path is stable for
 * Latin scripts (pt-BR / en).
 */
function segmentText(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) != null) {
    const s = m[0];
    out.push({ segment: s, isWordLike: /[\p{L}\p{N}]/u.test(s) });
  }
  return out;
}

/** `className` on `<code>` in HAST — block fences use `language-*` here. */
function codeLooksBlock(properties: Record<string, unknown> | null | undefined): boolean {
  if (!properties || !Object.hasOwn(properties, "className")) return false;
  const cls = properties.className;
  if (Array.isArray(cls)) return cls.some((c) => typeof c === "string" && c.length > 0);
  return typeof cls === "string" && cls.length > 0;
}

/** Same markdown → HAST pipeline as `react-markdown` (remark-gfm + rehype, raw → text like its post-pass). */
function markdownToTransformedHast(markdown: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true });
  const file = new VFile(markdown);
  const tree = processor.runSync(processor.parse(file), file);
  visit(tree, (node, index, parent) => {
    if (node?.type !== "raw" || parent == null || typeof index !== "number") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parent.children[index] = { type: "text", value: String((node as any).value ?? "") } as any;
  });
  return tree;
}

/** Walk HAST matching speakable rules (same as article body): skip `<pre>` (fenced code); skip block `<code>`. */
function collectSpeakableChunksFromHast(tree: unknown): Array<{ text: string }> {
  const chunks: Array<{ text: string }> = [];

  function walk(node: unknown, mute: boolean): void {
    if (node == null || typeof node !== "object") return;
    const n = node as { type?: string; value?: string; tagName?: string; properties?: Record<string, unknown>; children?: unknown[] };
    if (n.type === "text") {
      if (!mute && typeof n.value === "string" && n.value.length > 0) {
        chunks.push({ text: n.value });
      }
      return;
    }
    const children = n.children;
    if (!Array.isArray(children)) return;
    if (n.type !== "element" || typeof n.tagName !== "string") {
      for (const c of children) walk(c, mute);
      return;
    }

    const tag = n.tagName;

    if (tag === "pre") {
      for (const c of children) walk(c, true);
      return;
    }
    if (tag === "code") {
      const block = codeLooksBlock(n.properties);
      for (const c of children) walk(c, mute || block);
      return;
    }
    for (const c of children) walk(c, mute);
  }

  walk(tree, false);
  return chunks;
}

export function buildSpeakableTextModelFromMarkdown(markdown: string): SpeakableTextModel {
  const hast = markdownToTransformedHast(markdown);
  return buildSpeakableTextModel(collectSpeakableChunksFromHast(hast));
}

export function buildSpeakableTextModel(chunks: Array<{ text: string; includeInSpeech?: boolean }>): SpeakableTextModel {
  let plainText = "";
  const words: SpeakableWord[] = [];
  let wordIndex = 0;

  for (const chunk of chunks) {
    if (chunk.includeInSpeech === false) continue;
    const parts = segmentText(chunk.text);
    for (const part of parts) {
      const start = plainText.length;
      plainText += part.segment;
      if (part.isWordLike) {
        words.push({
          index: wordIndex,
          start,
          end: start + part.segment.length,
          text: part.segment,
        });
        wordIndex += 1;
      }
    }
  }

  return { plainText, words };
}

