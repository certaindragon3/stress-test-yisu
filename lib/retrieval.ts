import { YISU_CORPUS } from "./corpus";
import { CORPUS_SOURCES, type CorpusSource } from "./corpus.generated";
import { normalize } from "./verify";

type Axis = "epistemological" | "mastery" | "jurisdictional";

type CorpusChunk = {
  id: string;
  filename: string;
  title: string;
  section: string | null;
  body: string;
  norm: string;
  fileOrder: number;
  chunkOrder: number;
};

export type QuoteCandidate = {
  id: string;
  text: string;
  source: string;
};

export type CorpusSelection = {
  corpus: string;
  excerptCount: number;
  sourceCount: number;
  charCount: number;
  mode: "retrieved" | "full";
  quotes: Record<string, QuoteCandidate>;
};

const MAX_CHUNK_CHARS = 2_200;
const MAX_EXCERPTS = 8;
const EXTRA_OVERALL_EXCERPTS = 2;
const PRIMARY_FILE_CAP = 1;
const RELAXED_FILE_CAP = 2;
const SOFTWARE_FILE_CAP = 1;
const SOFTWARE_3_FILE = "software-3-university-and-the-future-of-the-academy.md";
const MIN_QUOTE_CHARS = 24;
const MAX_QUOTE_CHARS = 360;

const ENGLISH_STOPWORDS = new Set([
  "about",
  "again",
  "against",
  "ai",
  "all",
  "also",
  "and",
  "are",
  "because",
  "been",
  "being",
  "but",
  "can",
  "could",
  "dead",
  "does",
  "five",
  "for",
  "from",
  "have",
  "into",
  "its",
  "many",
  "new",
  "not",
  "replace",
  "should",
  "that",
  "the",
  "their",
  "them",
  "then",
  "therefore",
  "they",
  "this",
  "will",
  "within",
  "years",
]);

const AXIS_TERMS: Record<Axis, readonly string[]> = {
  epistemological: [
    "verifiability",
    "novelty",
    "knowledge",
    "logic",
    "proof",
    "referee",
    "peer",
    "theory",
    "narrative",
    "teaching",
    "writing",
    "mentor",
    "education",
    "school",
    "chatgpt",
    "software",
    "knowledge",
    "致知",
    "知识",
    "验证",
    "理论",
    "叙事",
    "同行",
    "教育",
    "技术",
    "机器",
  ],
  mastery: [
    "mastery",
    "apprentice",
    "apprenticeship",
    "reps",
    "practice",
    "training",
    "tacit",
    "skill",
    "judgment",
    "novice",
    "pipeline",
    "automation",
    "learning",
    "classroom",
    "训练",
    "技能",
    "学徒",
    "实践",
    "判断",
    "熟练",
    "学习",
    "劳动",
    "作业",
    "课堂",
  ],
  jurisdictional: [
    "jurisdiction",
    "profession",
    "professional",
    "expertise",
    "market",
    "authority",
    "institution",
    "teacher",
    "teachers",
    "doctor",
    "doctors",
    "labor",
    "domain",
    "expert",
    "职业",
    "专业",
    "权威",
    "机构",
    "市场",
    "教师",
    "医生",
    "专家",
    "领域",
    "劳动",
    "制度",
  ],
};

const AXIS_FILES: Record<Axis, readonly string[]> = {
  epistemological: [
    SOFTWARE_3_FILE,
    "education-technology-prospects-and-challenges.md",
  ],
  mastery: [
    "political-economy-of-vocational-education.md",
    "fruits-of-opportunism.md",
    "what-kind-of-high-school-what-kind-of-education.md",
    "meritocracys-disguise.md",
  ],
  jurisdictional: [
    "political-sociology-of-the-education-market.md",
    "knowledge-exchange-and-modern-universities.md",
    "beijing-news-2020-interview-outline.md",
    "xinrui-weekly-2023-year-end-questionnaire.md",
  ],
};

const CHUNKS = buildChunks(CORPUS_SOURCES);

function isHeading(paragraph: string): { level: number; text: string } | null {
  const match = /^(#{1,6})\s+(.+?)\s*$/.exec(paragraph);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}

function buildChunks(sources: readonly CorpusSource[]): CorpusChunk[] {
  return sources.flatMap((source, fileOrder) => chunkSource(source, fileOrder));
}

function chunkSource(source: CorpusSource, fileOrder: number): CorpusChunk[] {
  const paragraphs = source.body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: CorpusChunk[] = [];
  let section: string | null = null;
  let chunkOrder = 0;
  let buffer: string[] = [];
  let bufferChars = 0;

  const flush = () => {
    const body = buffer.join("\n\n").trim();
    if (!body) return;
    chunks.push({
      id: `${source.filename}#${chunkOrder}`,
      filename: source.filename,
      title: source.title,
      section,
      body,
      norm: normalize(body),
      fileOrder,
      chunkOrder,
    });
    chunkOrder += 1;
    buffer = [];
    bufferChars = 0;
  };

  for (const paragraph of paragraphs) {
    const heading = isHeading(paragraph);
    if (heading) {
      if (heading.level === 1) continue;
      if (bufferChars > 0) {
        flush();
      }
      section = heading.text;
      continue;
    }

    if (bufferChars > 0 && bufferChars + paragraph.length + 2 > MAX_CHUNK_CHARS) {
      flush();
    }

    buffer.push(paragraph);
    bufferChars += paragraph.length + 2;
  }

  flush();
  return chunks;
}

function unique<T>(items: Iterable<T>): T[] {
  return [...new Set(items)];
}

function expandChineseTerms(segment: string): string[] {
  if (segment.length <= 4) return [segment];

  const out: string[] = [segment];
  for (let i = 0; i < segment.length - 1; i += 1) {
    out.push(segment.slice(i, i + 2));
  }
  return out;
}

function claimTerms(claim: string): string[] {
  const norm = normalize(claim);
  const english = norm
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 3 && !ENGLISH_STOPWORDS.has(term));
  const chinese = [...norm.matchAll(/[\u4e00-\u9fff]+/g)].flatMap((match) =>
    expandChineseTerms(match[0]),
  );

  return unique([...english, ...chinese]);
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = 0;

  while (count < 3) {
    const found = haystack.indexOf(needle, index);
    if (found < 0) break;
    count += 1;
    index = found + needle.length;
  }

  return count;
}

function scoreChunk(chunk: CorpusChunk, terms: readonly string[], axis?: Axis): number {
  if (terms.length === 0) return 0;

  const header = normalize(
    `${chunk.title}${chunk.section ? ` ${chunk.section}` : ""}`,
  );
  let score = 0;

  for (const term of terms) {
    if (!term) continue;
    score += countOccurrences(header, term) * 6;
    score += countOccurrences(chunk.norm, term) * 2;
  }

  if (axis && AXIS_FILES[axis].includes(chunk.filename)) {
    score += 5;
  }
  if (axis === "epistemological" && chunk.filename === SOFTWARE_3_FILE) {
    score += 8;
  }

  return score;
}

function rankChunks(
  terms: readonly string[],
  options: {
    axis?: Axis;
    exclude?: Set<string>;
    excludeFiles?: Set<string>;
  } = {},
): CorpusChunk[] {
  const scored = CHUNKS.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, terms, options.axis),
  }))
    .filter(({ chunk, score }) => {
      if (score <= 0) return false;
      if (options.excludeFiles?.has(chunk.filename)) return false;
      return !options.exclude?.has(chunk.id);
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.chunk.fileOrder !== b.chunk.fileOrder) {
        return a.chunk.fileOrder - b.chunk.fileOrder;
      }
      return a.chunk.chunkOrder - b.chunk.chunkOrder;
    });

  return scored.map(({ chunk }) => chunk);
}

function sourceLabel(chunk: Pick<CorpusChunk, "title" | "section">): string {
  return chunk.section ? `${chunk.title}, ${chunk.section}` : chunk.title;
}

function isSentenceBoundary(text: string, index: number): boolean {
  const ch = text[index];
  if ("。！？!?".includes(ch)) return true;
  if (ch !== ".") return false;

  const prev = text[index - 1] ?? "";
  const next = text[index + 1] ?? "";
  if (/\d/.test(prev) && /\d/.test(next)) return false;
  if (next && !/[\s"'”’)\]】」』>]/.test(next) && next !== "[") return false;
  return true;
}

function sentenceSpans(paragraph: string): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];
  let cursor = 0;

  while (cursor < paragraph.length) {
    while (cursor < paragraph.length && /\s/.test(paragraph[cursor])) cursor += 1;
    if (cursor >= paragraph.length) break;

    let end = cursor;
    while (end < paragraph.length && !isSentenceBoundary(paragraph, end)) {
      end += 1;
    }

    if (end >= paragraph.length) {
      spans.push({ start: cursor, end: paragraph.length });
      break;
    }

    end += 1;
    while (
      end < paragraph.length &&
      `"'”’）)】]」』`.includes(paragraph[end])
    ) {
      end += 1;
    }

    while (true) {
      const citation = /^\s*\[(?:\^[^\]]+|\d+(?:\s*[,-]\s*\d+)*)\]/.exec(
        paragraph.slice(end),
      );
      if (!citation) break;
      end += citation[0].length;
    }

    spans.push({ start: cursor, end });
    cursor = end;
  }

  return spans;
}

function cleanQuoteText(text: string): string {
  return text
    .replace(/\s*\[(?:\^[^\]]+|\d+(?:\s*[,-]\s*\d+)*)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isEligibleQuote(paragraph: string, text: string): boolean {
  if (!text) return false;
  if (/^[-*]\s/.test(paragraph) || /^\d+\.\s/.test(paragraph)) return false;
  return text.length >= MIN_QUOTE_CHARS && text.length <= MAX_QUOTE_CHARS;
}

function annotateChunk(
  chunk: CorpusChunk,
  quoteCounter: number,
): { excerpt: string; quotes: QuoteCandidate[]; nextQuoteCounter: number } {
  const paragraphs = chunk.body.split(/\n\s*\n/);
  const quotes: QuoteCandidate[] = [];

  const excerptBody = paragraphs
    .map((paragraph) => {
      const spans = sentenceSpans(paragraph);
      if (spans.length === 0) return paragraph;

      let cursor = 0;
      let annotated = "";

      for (const span of spans) {
        annotated += paragraph.slice(cursor, span.start);
        const rawText = paragraph.slice(span.start, span.end);
        const text = cleanQuoteText(rawText);

        if (isEligibleQuote(paragraph, text)) {
          const id = `q${quoteCounter}`;
          quoteCounter += 1;
          quotes.push({
            id,
            text,
            source: sourceLabel(chunk),
          });
          annotated += `<quote id="${id}">${rawText}</quote>`;
        } else {
          annotated += rawText;
        }

        cursor = span.end;
      }

      annotated += paragraph.slice(cursor);
      return annotated;
    })
    .join("\n\n");

  const sectionHeading = chunk.section ? `\n## ${chunk.section}` : "";
  return {
    excerpt: `<!-- file: ${chunk.filename} -->\n# ${chunk.title}${sectionHeading}\n\n${excerptBody}`,
    quotes,
    nextQuoteCounter: quoteCounter,
  };
}

export function selectCorpusForClaim(claim: string): CorpusSelection {
  const dynamicTerms = claimTerms(claim);
  const selected: CorpusChunk[] = [];
  const seen = new Set<string>();
  const fileCounts = new Map<string, number>();

  const fileCap = (filename: string, relaxed: boolean) => {
    if (filename === SOFTWARE_3_FILE) return SOFTWARE_FILE_CAP;
    return relaxed ? RELAXED_FILE_CAP : PRIMARY_FILE_CAP;
  };

  const pick = (
    chunks: readonly CorpusChunk[],
    limit: number,
    options: { relaxed?: boolean } = {},
  ) => {
    for (const chunk of chunks) {
      if (selected.length >= MAX_EXCERPTS) return;
      if (seen.has(chunk.id)) continue;
      const cap = fileCap(chunk.filename, options.relaxed ?? false);
      const count = fileCounts.get(chunk.filename) ?? 0;
      if (count >= cap) continue;
      seen.add(chunk.id);
      selected.push(chunk);
      fileCounts.set(chunk.filename, count + 1);
      if (--limit === 0) return;
    }
  };

  pick(
    rankChunks(unique([...AXIS_TERMS.epistemological, ...dynamicTerms]), {
      axis: "epistemological",
      exclude: seen,
    }),
    2,
  );
  pick(
    rankChunks(unique([...AXIS_TERMS.mastery, ...dynamicTerms]), {
      axis: "mastery",
      exclude: seen,
      excludeFiles: new Set([SOFTWARE_3_FILE]),
    }),
    2,
  );
  pick(
    rankChunks(unique([...AXIS_TERMS.jurisdictional, ...dynamicTerms]), {
      axis: "jurisdictional",
      exclude: seen,
      excludeFiles: new Set([SOFTWARE_3_FILE]),
    }),
    2,
  );
  pick(rankChunks(dynamicTerms, { exclude: seen }), EXTRA_OVERALL_EXCERPTS);

  if (!selected.some((chunk) => chunk.filename === SOFTWARE_3_FILE)) {
    pick(
      rankChunks(AXIS_TERMS.epistemological, {
        axis: "epistemological",
        exclude: seen,
      }).filter((chunk) => chunk.filename === SOFTWARE_3_FILE),
      1,
    );
  }

  if (selected.length < MAX_EXCERPTS) {
    pick(
      rankChunks(dynamicTerms, { exclude: seen }),
      MAX_EXCERPTS - selected.length,
      { relaxed: true },
    );
  }

  if (selected.length === 0) {
    return {
      corpus: YISU_CORPUS,
      excerptCount: 0,
      sourceCount: CORPUS_SOURCES.length,
      charCount: YISU_CORPUS.length,
      mode: "full",
      quotes: {},
    };
  }

  const ordered = selected.slice(0, MAX_EXCERPTS);
  const excerpts: string[] = [];
  const quotes: QuoteCandidate[] = [];
  let quoteCounter = 1;

  for (const chunk of ordered) {
    const annotated = annotateChunk(chunk, quoteCounter);
    excerpts.push(annotated.excerpt);
    quotes.push(...annotated.quotes);
    quoteCounter = annotated.nextQuoteCounter;
  }

  const corpus = excerpts.join("\n\n");
  return {
    corpus,
    excerptCount: ordered.length,
    sourceCount: new Set(ordered.map((chunk) => chunk.filename)).size,
    charCount: corpus.length,
    mode: "retrieved",
    quotes: Object.fromEntries(quotes.map((quote) => [quote.id, quote])),
  };
}
