const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
  mdash: "—",
  ndash: "–",
  hellip: "…",
};

function decodeEntity(match: string, code: string): string {
  try {
    if (code[0] === "#") {
      const cp =
        code[1] === "x" || code[1] === "X"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  } catch {
    return match;
  }
}

/**
 * Meta-description sanitizer: strips HTML, decodes entities, collapses
 * whitespace, and clamps at a word boundary (audit 2026-08-13 §B — blog
 * descriptions were unbounded; labs hard-cut at 160 mid-word with raw
 * entities).
 */
export function metaDescription(input: string, max = 155): string {
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, decodeEntity)
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const clamped = lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, max);
  return clamped.replace(/[\s,;:.–—-]+$/, "") + "…";
}
