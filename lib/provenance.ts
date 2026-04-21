import { CORPUS_SOURCES, type CorpusSource } from "./corpus.generated";
import { normalize } from "./verify";

const CONTEXT_PARAGRAPHS = 3;

type CorpusEntry = CorpusSource;

function loadIndex(): readonly CorpusEntry[] {
  return CORPUS_SOURCES;
}

export function resolveSource(
  source: string,
): { filename: string; body: string } | null {
  const needle = normalize(source);
  if (!needle) return null;
  const index = loadIndex();

  for (const entry of index) {
    if (normalize(entry.title) === needle) {
      return { filename: entry.filename, body: entry.body };
    }
  }
  for (const entry of index) {
    const t = normalize(entry.title);
    if (needle.startsWith(t) || t.startsWith(needle)) {
      return { filename: entry.filename, body: entry.body };
    }
  }
  return null;
}

// Mirror of verify.ts#normalize, but emits a parallel offset map:
// map[i] is the original index in `s` that produced normalized char i.
// Keep in sync with verify.ts#normalize.
function normalizeWithMap(s: string): { norm: string; map: number[] } {
  const out: string[] = [];
  const map: number[] = [];
  const curly1 = "\u2018\u2019\u201b\u2032";
  const curly2 = "\u201c\u201d\u201e\u2033";
  const dashes = "\u2013\u2014\u2212";
  const emphasis = "*_`";

  let i = 0;
  while (i < s.length) {
    const ch = s[i];

    if (ch === "[") {
      const rest = s.slice(i);
      const linkMatch = /^\[([^\]]+)\]\([^)]+\)/.exec(rest);
      if (linkMatch) {
        const text = linkMatch[1];
        for (let j = 0; j < text.length; j++) {
          out.push(text[j]);
          map.push(i + 1 + j);
        }
        i += linkMatch[0].length;
        continue;
      }
    }

    if (ch === "<") {
      const tagMatch = /^<\/?[^>]+>/.exec(s.slice(i));
      if (tagMatch) {
        i += tagMatch[0].length;
        continue;
      }
    }

    if (ch === "\\" && i + 1 < s.length && "[]()*_`".includes(s[i + 1])) {
      const nxt = s[i + 1];
      if (!emphasis.includes(nxt)) {
        out.push(nxt);
        map.push(i + 1);
      }
      i += 2;
      continue;
    }

    if (emphasis.includes(ch)) {
      i++;
      continue;
    }

    if (ch === "\u00a0" || ch === "\u3000") {
      out.push(" ");
      map.push(i);
      i++;
      continue;
    }

    if (curly1.includes(ch)) {
      out.push("'");
      map.push(i);
      i++;
      continue;
    }
    if (curly2.includes(ch)) {
      out.push('"');
      map.push(i);
      i++;
      continue;
    }
    if (dashes.includes(ch)) {
      out.push("-");
      map.push(i);
      i++;
      continue;
    }
    if (ch === "\u2026") {
      out.push(".", ".", ".");
      map.push(i, i, i);
      i++;
      continue;
    }

    if (/\s/.test(ch)) {
      const start = i;
      while (i < s.length && /\s/.test(s[i])) i++;
      out.push(" ");
      map.push(start);
      continue;
    }

    out.push(ch.toLowerCase());
    map.push(i);
    i++;
  }

  let lo = 0;
  while (lo < out.length && out[lo] === " ") lo++;
  let hi = out.length;
  while (hi > lo && out[hi - 1] === " ") hi--;

  return { norm: out.slice(lo, hi).join(""), map: map.slice(lo, hi) };
}

export function findMatch(
  body: string,
  text: string,
): { start: number; end: number } | null {
  const needle = normalize(text);
  if (!needle) return null;
  const { norm, map } = normalizeWithMap(body);
  const idx = norm.indexOf(needle);
  if (idx < 0) return null;
  const start = map[idx];
  const endTokenIdx = idx + needle.length;
  const end = endTokenIdx < map.length ? map[endTokenIdx] : body.length;
  return { start, end };
}

export function windowAroundMatch(
  body: string,
  start: number,
  end: number,
): { piece: string; matchOffset: number; matchLength: number } {
  const paragraphs: { start: number; end: number }[] = [];
  const splitRe = /\n\s*\n/g;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = splitRe.exec(body)) !== null) {
    paragraphs.push({ start: cursor, end: m.index });
    cursor = m.index + m[0].length;
  }
  paragraphs.push({ start: cursor, end: body.length });

  const findPara = (offset: number) =>
    paragraphs.findIndex((p) => offset >= p.start && offset <= p.end);
  const pStart = Math.max(0, findPara(start));
  const pEndRaw = findPara(end > start ? end - 1 : end);
  const pEnd = pEndRaw < 0 ? pStart : pEndRaw;

  const wStart = Math.max(0, pStart - CONTEXT_PARAGRAPHS);
  const wEnd = Math.min(paragraphs.length - 1, pEnd + CONTEXT_PARAGRAPHS);
  const windowStart = paragraphs[wStart].start;
  const windowEnd = paragraphs[wEnd].end;

  return {
    piece: body.slice(windowStart, windowEnd),
    matchOffset: start - windowStart,
    matchLength: end - start,
  };
}
