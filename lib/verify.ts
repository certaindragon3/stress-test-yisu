export function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

export function verifyQuote(text: string, corpus: string): boolean {
  if (!text || !corpus) return false;
  return normalize(corpus).includes(normalize(text));
}
