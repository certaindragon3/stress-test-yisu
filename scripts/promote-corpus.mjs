import { spawnSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

const repoRoot = process.cwd()
const corpusRoot = path.join(repoRoot, "content", "corpus")
const processedRoot = path.join(repoRoot, "data", "processed", "markdown")

const KEYNOTE_URL = "https://zhouyisu.org/blog/2026-04-01-the-software-3/"

const pieces = [
  {
    filename: "education-technology-prospects-and-challenges.md",
    title: "教育技术的展望和挑战",
    source: "interview/教育技术的展望和挑战.md",
  },
  {
    filename: "fruits-of-opportunism.md",
    title: "机会主义的橘与枳──读蔺乐的《机会主义的果实》有感",
    aliases: ["机会主义的橘与枳── 读蔺乐的《机会主义的果实》有感"],
    source: "interview/机会主义的果实_周忆粟.md",
  },
  {
    filename: "political-sociology-of-the-education-market.md",
    title: "教育市场的政治社会学",
    source: "interview/教育市场的政治社会学.md",
  },
  {
    filename: "political-economy-of-vocational-education.md",
    title: "职业教育的政治经济学故事",
    source: "publications_2013-2026/tvet-wenzong.md",
  },
  {
    filename: "knowledge-exchange-and-modern-universities.md",
    title: "Knowledge Exchange and Modern Universities",
    source: "publications_2013-2026/book_reviews/zhou2022a.md",
  },
  {
    filename: "meritocracys-disguise.md",
    title: "Meritocracy’s Disguise",
    source: "publications_2013-2026/book_reviews/zhou2022b.md",
  },
]

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, "").trim()
}

function stripMachineArtifacts(markdown) {
  return markdown
    .split("\n")
    .filter((line) => !line.trim().startsWith("![]("))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function withH1(title, body, aliases = []) {
  let withoutLeadingTitle = body.trim()

  for (const candidate of [title, ...aliases]) {
    withoutLeadingTitle = withoutLeadingTitle
      .replace(new RegExp(`^#\\s+${escapeRegExp(candidate)}\\s*\\n+`), "")
      .replace(new RegExp(`^\\*\\*${escapeRegExp(candidate)}\\*\\*\\s*\\n+`), "")
      .replace(new RegExp(`^${escapeRegExp(candidate)}\\s*\\n+`), "")
      .trim()
  }

  withoutLeadingTitle = withoutLeadingTitle.replace(/^# /gm, "## ")

  return `# ${title}\n\n${withoutLeadingTitle}\n`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function cleanKeynote(markdown) {
  return markdown
    .replace(/<a href="[^"]+" class="anchor" hidden=""\s+aria-hidden="true">#<\/a>/g, "")
    .replace(/<sup>\[\^(\d+)\]<\/sup>/g, "[^$1]")
    .replace(/<div[^>]*>/g, "")
    .replace(/<\/div>/g, "")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function fetchKeynote() {
  const response = await fetch(KEYNOTE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch keynote: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const match = html.match(/<div class="post-content">([\s\S]*?)\n\s*<\/div>\n\n\s*<footer class="post-footer">/)
  if (!match) {
    throw new Error("Could not find keynote post content in fetched HTML.")
  }

  const result = spawnSync("pandoc", ["-f", "html", "-t", "gfm", "--wrap=none"], {
    input: match[1],
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || "pandoc failed while converting keynote HTML.")
  }

  return withH1(
    "The Software 3.0 University and the Future of the Academy",
    cleanKeynote(result.stdout),
  )
}

async function promoteProcessedPiece(piece) {
  const raw = await fs.readFile(path.join(processedRoot, piece.source), "utf8")
  const body = stripMachineArtifacts(stripFrontmatter(raw))
  await fs.writeFile(
    path.join(corpusRoot, piece.filename),
    withH1(piece.title, body, piece.aliases),
  )
}

await fs.mkdir(corpusRoot, { recursive: true })
await fs.rm(path.join(corpusRoot, ".gitkeep"), { force: true })

await fs.writeFile(
  path.join(corpusRoot, "software-3-university-and-the-future-of-the-academy.md"),
  await fetchKeynote(),
)

for (const piece of pieces) {
  await promoteProcessedPiece(piece)
}

console.log(`Promoted ${pieces.length + 1} corpus files to content/corpus`)
