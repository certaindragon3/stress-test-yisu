import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const corpusDir = join(process.cwd(), "content", "corpus")

function normalize(s) {
  return s
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019\u201b\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201e\u2033]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function loadCorpus() {
  return readdirSync(corpusDir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const filePath = join(corpusDir, name)
      return statSync(filePath).isFile() ? readFileSync(filePath, "utf8").trim() : ""
    })
    .filter(Boolean)
    .join("\n\n")
}

function verifyQuote(text, corpus) {
  if (!text || !corpus) return false
  return normalize(corpus).includes(normalize(text))
}

let input = ""

process.stdin.setEncoding("utf8")
process.stdin.on("data", (chunk) => {
  input += chunk
})

process.stdin.on("end", () => {
  const verified = verifyQuote(input, loadCorpus())
  console.log(verified ? "verified" : "unverified")
  process.exitCode = verified ? 0 : 1
})
