import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

const repoRoot = process.cwd()
const sourceRoot = path.join(repoRoot, "Yisu data")
const processedRoot = path.join(repoRoot, "data", "processed")
const manifestPath = path.join(processedRoot, "manifest.jsonl")
const markdownRoot = path.join(processedRoot, "markdown")
const mineruRoot = path.join(processedRoot, "mineru-output")
const mediaRoot = path.join(processedRoot, "media")
const reportPath = path.join(processedRoot, "conversion-report.jsonl")
const localMineruPython = path.join(repoRoot, ".venv-mineru", "bin", "python")
const mineruDirectParseScript = path.join(repoRoot, "scripts", "mineru-direct-parse.py")

const command = process.argv[2] ?? "help"
const args = process.argv.slice(3)
const flags = new Set(args.filter((arg) => !arg.includes("=")))

function toPosix(filePath) {
  return filePath.split(path.sep).join("/")
}

function stripExt(filePath) {
  return filePath.slice(0, -path.extname(filePath).length)
}

function argValue(name) {
  const prefix = `--${name}=`
  const arg = args.find((item) => item.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : null
}

function yamlString(value) {
  return JSON.stringify(value ?? "")
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

async function sha256(filePath) {
  const data = await fs.readFile(filePath)
  return createHash("sha256").update(data).digest("hex")
}

function classify(relativePath) {
  const parts = toPosix(relativePath).split("/")

  if (parts.includes("interview")) {
    return {
      collection: "interview",
      document_kind: "interview",
      corpus_policy: "candidate_requires_human_review",
    }
  }

  if (parts.includes("translation")) {
    return {
      collection: "translation",
      document_kind: "translation_or_background",
      corpus_policy: "background_not_direct_yisu_corpus",
    }
  }

  if (parts.includes("book_reviews")) {
    return {
      collection: "publications_2013-2026",
      document_kind: "book_review",
      corpus_policy: "candidate_requires_human_review",
    }
  }

  if (parts.includes("book_chapters")) {
    return {
      collection: "publications_2013-2026",
      document_kind: "book_chapter",
      corpus_policy: "candidate_requires_human_review",
    }
  }

  if (parts.includes("publications_2013-2026")) {
    return {
      collection: "publications_2013-2026",
      document_kind: "publication",
      corpus_policy: "candidate_requires_human_review",
    }
  }

  return {
    collection: "unknown",
    document_kind: "unknown",
    corpus_policy: "review_before_use",
  }
}

function languageGuess(relativePath) {
  return /[\u3400-\u9fff]/u.test(relativePath) ? "zh" : "en"
}

async function buildManifest() {
  if (!existsSync(sourceRoot)) {
    throw new Error(`Missing source directory: ${sourceRoot}`)
  }

  await fs.mkdir(processedRoot, { recursive: true })
  const files = await walk(sourceRoot)
  const records = []

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase()
    if (![".pdf", ".docx"].includes(ext)) continue

    const stat = await fs.stat(filePath)
    const relativePath = toPosix(path.relative(sourceRoot, filePath))
    const digest = await sha256(filePath)
    const classification = classify(relativePath)

    records.push({
      id: `${stripExt(relativePath)
        .replace(/[^a-zA-Z0-9\u3400-\u9fff]+/gu, "-")
        .replace(/^-|-$/g, "")}-${digest.slice(0, 8)}`,
      title: stripExt(path.basename(filePath)),
      source_path: toPosix(path.relative(repoRoot, filePath)),
      source_relative_path: relativePath,
      extension: ext.slice(1),
      size_bytes: stat.size,
      sha256: digest,
      modified_at: stat.mtime.toISOString(),
      language_guess: languageGuess(relativePath),
      entered_corpus: false,
      quoteable: false,
      ...classification,
    })
  }

  await fs.writeFile(
    manifestPath,
    `${records.map((record) => JSON.stringify(record)).join("\n")}\n`
  )

  return records
}

async function readManifest() {
  if (!existsSync(manifestPath)) {
    return buildManifest()
  }

  const raw = await fs.readFile(manifestPath, "utf8")
  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

function hasCommand(name) {
  const result = spawnSync("command", ["-v", name], {
    shell: true,
    stdio: "ignore",
  })
  return result.status === 0
}

function mineruPythonCommand() {
  if (existsSync(localMineruPython)) return localMineruPython
  return null
}

function mineruName(record) {
  return record.id
}

function frontmatter(record, tool) {
  return [
    "---",
    `id: ${yamlString(record.id)}`,
    `title: ${yamlString(record.title)}`,
    `source_path: ${yamlString(record.source_path)}`,
    `source_sha256: ${yamlString(record.sha256)}`,
    `collection: ${yamlString(record.collection)}`,
    `document_kind: ${yamlString(record.document_kind)}`,
    `language_guess: ${yamlString(record.language_guess)}`,
    "entered_corpus: false",
    "quoteable: false",
    `corpus_policy: ${yamlString(record.corpus_policy)}`,
    `extracted_by: ${yamlString(tool)}`,
    "status: machine_extracted",
    "---",
    "",
  ].join("\n")
}

async function convertDocx(record) {
  const src = path.join(repoRoot, record.source_path)
  const outputPath = path.join(
    markdownRoot,
    stripExt(record.source_relative_path) + ".md"
  )
  const mediaDir = path.join(mediaRoot, stripExt(record.source_relative_path))
  const tmpPath = `${outputPath}.tmp`

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.mkdir(mediaDir, { recursive: true })

  const result = spawnSync(
    "pandoc",
    [
      src,
      "--from=docx",
      "--to=gfm",
      "--wrap=none",
      `--extract-media=${mediaDir}`,
      "-o",
      tmpPath,
    ],
    { encoding: "utf8" }
  )

  if (result.status !== 0) {
    return {
      source_path: record.source_path,
      status: "failed",
      tool: "pandoc",
      stderr: result.stderr?.trim() ?? "",
    }
  }

  const body = await fs.readFile(tmpPath, "utf8")
  await fs.writeFile(
    outputPath,
    frontmatter(record, "pandoc") + body.trim() + "\n"
  )
  await fs.rm(tmpPath, { force: true })

  return {
    source_path: record.source_path,
    output_path: toPosix(path.relative(repoRoot, outputPath)),
    status: "converted",
    tool: "pandoc",
  }
}

async function findMarkdown(dir) {
  if (!existsSync(dir)) return null
  const files = await walk(dir)
  return (
    files.find((filePath) => path.extname(filePath).toLowerCase() === ".md") ??
    null
  )
}

async function convertPdf(record) {
  if (!flags.has("--pdf")) {
    return {
      source_path: record.source_path,
      status: "pending_ocr",
      tool: "mineru",
      note: "Run `pnpm yisu:convert -- --pdf` after installing MinerU.",
    }
  }

  const mineruPython = mineruPythonCommand()
  if (!mineruPython) {
    return {
      source_path: record.source_path,
      status: "skipped_missing_tool",
      tool: "mineru",
      note: "MinerU is not installed in .venv-mineru.",
    }
  }

  const src = path.join(repoRoot, record.source_path)
  const name = mineruName(record)
  const mineruOut = path.join(mineruRoot, name)
  const outputPath = path.join(
    markdownRoot,
    stripExt(record.source_relative_path) + ".md"
  )

  await fs.mkdir(mineruOut, { recursive: true })
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  if (existsSync(outputPath) && !flags.has("--force")) {
    return {
      source_path: record.source_path,
      output_path: toPosix(path.relative(repoRoot, outputPath)),
      status: "skipped_existing",
      tool: "mineru-direct",
    }
  }

  const lang = record.language_guess === "zh" ? "ch" : "en"
  console.log(`OCR ${record.source_path}`)
  const result = spawnSync(
    mineruPython,
    [
      mineruDirectParseScript,
      "--input",
      src,
      "--name",
      name,
      "--output",
      mineruOut,
      "--backend",
      "pipeline",
      "--method",
      "auto",
      "--lang",
      lang,
    ],
    {
      encoding: "utf8",
      env: { ...process.env, MINERU_MODEL_SOURCE: "modelscope" },
      maxBuffer: 1024 * 1024 * 64,
    }
  )

  if (result.status !== 0) {
    return {
      source_path: record.source_path,
      status: "failed",
      tool: "mineru-direct",
      stderr: result.stderr?.trim() ?? "",
    }
  }

  const mineruMarkdown = await findMarkdown(mineruOut)
  if (!mineruMarkdown) {
    return {
      source_path: record.source_path,
      status: "no_markdown_found",
      tool: "mineru-direct",
      output_dir: toPosix(path.relative(repoRoot, mineruOut)),
    }
  }

  const body = await fs.readFile(mineruMarkdown, "utf8")
  await fs.writeFile(
    outputPath,
    frontmatter(record, "mineru") + body.trim() + "\n"
  )

  return {
    source_path: record.source_path,
    output_path: toPosix(path.relative(repoRoot, outputPath)),
    status: "converted",
    tool: "mineru-direct",
  }
}

async function wrapMineruMarkdown(record, mineruOut) {
  const outputPath = path.join(
    markdownRoot,
    stripExt(record.source_relative_path) + ".md"
  )

  const mineruMarkdown = await findMarkdown(mineruOut)
  if (!mineruMarkdown) {
    return {
      source_path: record.source_path,
      status: "no_markdown_found",
      tool: "mineru-direct",
      output_dir: toPosix(path.relative(repoRoot, mineruOut)),
    }
  }

  const body = await fs.readFile(mineruMarkdown, "utf8")
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(
    outputPath,
    frontmatter(record, "mineru") + body.trim() + "\n"
  )

  return {
    source_path: record.source_path,
    output_path: toPosix(path.relative(repoRoot, outputPath)),
    status: "converted",
    tool: "mineru-direct",
  }
}

async function convertPdfBatch(records) {
  const mineruPython = mineruPythonCommand()
  if (!mineruPython) {
    return records.map((record) => ({
      source_path: record.source_path,
      status: "skipped_missing_tool",
      tool: "mineru",
      note: "MinerU is not installed in .venv-mineru.",
    }))
  }

  const report = []
  const pending = []

  for (const record of records) {
    const outputPath = path.join(
      markdownRoot,
      stripExt(record.source_relative_path) + ".md"
    )

    if (existsSync(outputPath) && !flags.has("--force")) {
      report.push({
        source_path: record.source_path,
        output_path: toPosix(path.relative(repoRoot, outputPath)),
        status: "skipped_existing",
        tool: "mineru-direct",
      })
    } else {
      pending.push(record)
    }
  }

  if (pending.length === 0) return report

  const mineruOut = mineruRoot
  const mineruArgs = [
    mineruDirectParseScript,
    "--output",
    mineruOut,
    "--backend",
    "pipeline",
    "--method",
    "auto",
  ]

  for (const record of pending) {
    const lang = record.language_guess === "zh" ? "ch" : "en"
    mineruArgs.push(
      "--input",
      path.join(repoRoot, record.source_path),
      "--name",
      mineruName(record),
      "--lang",
      lang
    )
  }

  await fs.mkdir(mineruOut, { recursive: true })
  console.log(`OCR batch ${pending.length} PDF files`)

  const result = spawnSync(mineruPython, mineruArgs, {
    encoding: "utf8",
    env: { ...process.env, MINERU_MODEL_SOURCE: "modelscope" },
    maxBuffer: 1024 * 1024 * 128,
  })

  if (result.status !== 0) {
    return report.concat(
      pending.map((record) => ({
        source_path: record.source_path,
        status: "failed",
        tool: "mineru-direct",
        stderr: result.stderr?.trim() ?? "",
      }))
    )
  }

  for (const record of pending) {
    report.push(
      await wrapMineruMarkdown(record, path.join(mineruOut, mineruName(record)))
    )
  }

  return report
}

async function convert() {
  let records = await buildManifest()
  const collection = argValue("collection")
  const limit = Number.parseInt(argValue("limit") ?? "", 10)
  const pdfOnly = flags.has("--pdf-only")
  const hasPandoc = hasCommand("pandoc")
  const report = []

  if (collection) {
    records = records.filter((record) => record.collection === collection)
  }

  if (Number.isInteger(limit) && limit > 0) {
    records = records.slice(0, limit)
  }

  await fs.mkdir(processedRoot, { recursive: true })

  if (pdfOnly && flags.has("--pdf")) {
    report.push(
      ...(await convertPdfBatch(
        records.filter((record) => record.extension === "pdf")
      ))
    )
    await fs.writeFile(
      reportPath,
      `${report.map((item) => JSON.stringify(item)).join("\n")}\n`
    )
    printConversionSummary(report)
    return
  }

  for (const record of records) {
    if (record.extension === "docx") {
      if (pdfOnly) continue

      if (!hasPandoc) {
        report.push({
          source_path: record.source_path,
          status: "skipped_missing_tool",
          tool: "pandoc",
        })
        continue
      }

      report.push(await convertDocx(record))
      continue
    }

    if (record.extension === "pdf") {
      report.push(await convertPdf(record))
    }
  }

  await fs.writeFile(
    reportPath,
    `${report.map((item) => JSON.stringify(item)).join("\n")}\n`
  )
  printConversionSummary(report)
}

function countBy(records, field) {
  return records.reduce((counts, record) => {
    const key = record[field] ?? "unknown"
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

function printCounts(title, counts) {
  console.log(title)
  for (const [key, count] of Object.entries(counts).sort()) {
    console.log(`  ${key}: ${count}`)
  }
}

function printConversionSummary(report) {
  printCounts("Conversion status", countBy(report, "status"))
  printCounts("Tools", countBy(report, "tool"))
  console.log(`Report: ${toPosix(path.relative(repoRoot, reportPath))}`)
}

async function audit() {
  const records = await readManifest()
  const markdownFiles = existsSync(markdownRoot)
    ? (await walk(markdownRoot)).filter(
        (filePath) => path.extname(filePath).toLowerCase() === ".md"
      )
    : []

  printCounts("Source extensions", countBy(records, "extension"))
  printCounts("Collections", countBy(records, "collection"))
  printCounts("Corpus policy", countBy(records, "corpus_policy"))
  console.log(`Markdown files: ${markdownFiles.length}`)
  console.log(`Manifest: ${toPosix(path.relative(repoRoot, manifestPath))}`)
}

function printHelp() {
  console.log(`Usage:
  node scripts/yisu-data.mjs manifest
  node scripts/yisu-data.mjs convert
  node scripts/yisu-data.mjs convert --pdf
  node scripts/yisu-data.mjs convert --pdf --pdf-only --collection=publications_2013-2026
  node scripts/yisu-data.mjs audit`)
}

if (command === "manifest") {
  const records = await buildManifest()
  console.log(
    `Wrote ${records.length} records to ${toPosix(path.relative(repoRoot, manifestPath))}`
  )
} else if (command === "convert") {
  await convert()
} else if (command === "audit") {
  await audit()
} else {
  printHelp()
}
