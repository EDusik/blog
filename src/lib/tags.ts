/** Chave normalizada para comparar labels de tag (case-insensitive). */
export function tagKey(s: string): string {
  return s.trim().toLowerCase();
}

export function tagEquals(a: string, b: string): boolean {
  return tagKey(a) === tagKey(b);
}

function addIfNew(seen: Set<string>, label: string, out: string[]): void {
  const k = tagKey(label);
  if (!k || seen.has(k)) return;
  seen.add(k);
  out.push(label.trim());
}

/** Remove blocos ``` para não contar `#` ou `[[]]` dentro de exemplos de código. */
export function stripFencedCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "\n");
}

/** Remove linhas de heading ATX para que `# título` não vire hashtag. */
export function stripAtxHeadingLines(markdown: string): string {
  return markdown.replace(/^\s{0,3}#{1,6}\s+.*$/gm, "\n");
}

type TagHit = { index: number; label: string };

function wikiLinkHits(markdown: string): TagHit[] {
  const hits: TagHit[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const inner = m[1].split("|")[0].trim();
    if (inner) hits.push({ index: m.index, label: inner });
  }
  return hits;
}

function hashTagHits(markdown: string): TagHit[] {
  const hits: TagHit[] = [];
  const re = /(?:^|[^\w#])#([\w\u00C0-\u024F/-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    hits.push({ index: m.index, label: m[1] });
  }
  return hits;
}

/**
 * Tags do frontmatter primeiro; em seguida, labels do corpo na ordem de aparição
 * (`[[wikilinks]]` e hashtags estilo `#tag`, sem duplicar por case).
 */
export function mergePostTags(frontmatterTags: string[], bodyMarkdown: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of frontmatterTags) {
    addIfNew(seen, t, out);
  }
  const body = stripAtxHeadingLines(stripFencedCodeBlocks(bodyMarkdown));
  const combined = [...wikiLinkHits(body), ...hashTagHits(body)];
  combined.sort((a, b) => a.index - b.index);
  for (const h of combined) {
    addIfNew(seen, h.label, out);
  }
  return out;
}
