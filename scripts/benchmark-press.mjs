#!/usr/bin/env node

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_ENDPOINT = "https://stress-test.jiesen-huang.com/api/press";
const CLAIMS = [
  "Prompting is the new literacy.",
  "AI tutors will replace TAs within five years.",
  "Kids shouldn't learn to code — leave it up to AI.",
  "The essay is dead.",
  "Within ten years, AI will replace many doctors and teachers.",
];

const endpoint = process.argv[2] ?? DEFAULT_ENDPOINT;

function parseHeaders(raw) {
  const headers = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    headers.set(
      line.slice(0, idx).trim().toLowerCase(),
      line.slice(idx + 1).trim(),
    );
  }
  return headers;
}

function parseMetrics(raw) {
  const metrics = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    metrics.set(line.slice(0, idx), line.slice(idx + 1));
  }
  return metrics;
}

async function runClaim(claim) {
  const body = JSON.stringify({ claim });
  const format = [
    "http_code=%{http_code}",
    "time_starttransfer=%{time_starttransfer}",
    "time_total=%{time_total}",
    "size_download=%{size_download}",
  ].join("\\n");

  const { stdout } = await execFileAsync("curl", [
    "-sS",
    "--connect-timeout",
    "10",
    "--max-time",
    "90",
    "-D",
    "-",
    "-o",
    "/dev/null",
    "-w",
    format,
    "-H",
    "content-type: application/json",
    "-d",
    body,
    endpoint,
  ]);

  const splitAt = stdout.lastIndexOf("http_code=");
  const headerText = splitAt >= 0 ? stdout.slice(0, splitAt) : stdout;
  const metricText = splitAt >= 0 ? stdout.slice(splitAt) : "";
  const headers = parseHeaders(headerText);
  const metrics = parseMetrics(metricText);

  return {
    claim,
    status: Number(metrics.get("http_code") ?? 0),
    startTransferMs: Math.round(
      Number(metrics.get("time_starttransfer") ?? 0) * 1000,
    ),
    totalMs: Math.round(Number(metrics.get("time_total") ?? 0) * 1000),
    bytes: Number(metrics.get("size_download") ?? 0),
    contextMode: headers.get("x-yisu-context-mode") ?? null,
    contextChars: Number(headers.get("x-yisu-context-chars") ?? 0),
    contextExcerpts: Number(headers.get("x-yisu-context-excerpts") ?? 0),
    contextSources: Number(headers.get("x-yisu-context-sources") ?? 0),
    modelId: headers.get("x-yisu-model-id") ?? null,
    maxOutputTokens: Number(headers.get("x-yisu-max-output-tokens") ?? 0),
    temperature: Number(headers.get("x-yisu-temperature") ?? 0),
    thinkingLevel: headers.get("x-yisu-thinking-level") ?? null,
    thinkingBudget:
      headers.get("x-yisu-thinking-budget") === ""
        ? null
        : Number(headers.get("x-yisu-thinking-budget") ?? 0),
  };
}

async function main() {
  console.log(
    JSON.stringify(
      {
        endpoint,
        measuredAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  for (const claim of CLAIMS) {
    const result = await runClaim(claim);
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
