// If you change this, mirror the change in scripts/corpus-check.mjs.
export function normalize(s: string): string {
  return s
    .replace(/[\u00a0\u3000]/g, " ")
    .replace(/[\u2018\u2019\u201b\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201e\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function verifyQuote(text: string, corpus: string): boolean {
  if (!text || !corpus) return false;
  return normalize(corpus).includes(normalize(text));
}
