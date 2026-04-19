import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CORPUS_DIR = join(process.cwd(), "content", "corpus");

function loadCorpus(): string {
  let entries: string[];
  try {
    entries = readdirSync(CORPUS_DIR);
  } catch {
    return "";
  }

  const pieces = entries
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const path = join(CORPUS_DIR, name);
      if (!statSync(path).isFile()) return "";
      const body = readFileSync(path, "utf8").trim();
      return `<!-- file: ${name} -->\n${body}`;
    })
    .filter(Boolean);

  return pieces.join("\n\n");
}

export const YISU_CORPUS = loadCorpus();
export const CORPUS_IS_EMPTY = YISU_CORPUS.length === 0;
