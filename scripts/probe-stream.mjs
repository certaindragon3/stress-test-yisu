#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

function usage() {
  console.error(`Usage:
  node scripts/probe-stream.mjs \\
    --claim "Prompting is the new literacy." \\
    --case label=http://127.0.0.1:3201/api/press \\
    --case other=http://127.0.0.1:3202/api/press \\
    [--out-dir tmp/stream-probe]
`);
}

function parseArgs(argv) {
  const args = {
    claim: "Prompting is the new literacy.",
    cases: [],
    outDir: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--claim") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--claim requires a value");
      }
      args.claim = value;
      i += 1;
      continue;
    }

    if (arg === "--case") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--case requires label=url");
      }
      i += 1;
      const eq = value.indexOf("=");
      if (eq <= 0 || eq === value.length - 1) {
        throw new Error(`Invalid --case value: ${value}`);
      }
      args.cases.push({
        label: value.slice(0, eq),
        endpoint: value.slice(eq + 1),
      });
      continue;
    }

    if (arg === "--out-dir") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--out-dir requires a path");
      }
      args.outDir = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (args.cases.length === 0) {
    throw new Error("At least one --case is required");
  }

  return args;
}

function parseLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return {
      type: "parse_error",
      raw: line,
    };
  }
}

async function probeCase({ label, endpoint, claim }) {
  const started = performance.now();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ claim }),
  });
  const responseAtMs = Math.round(performance.now() - started);
  const reader = response.body?.getReader();

  if (!reader) {
    return {
      label,
      endpoint,
      claim,
      status: response.status,
      responseAtMs,
      error: "Response body is not readable.",
    };
  }

  const decoder = new TextDecoder();
  let firstChunkAtMs = null;
  let bytes = 0;
  let buffer = "";
  const events = [];

  while (true) {
    const { value, done } = await reader.read();
    const nowMs = Math.round(performance.now() - started);

    if (done) {
      buffer += decoder.decode();
      break;
    }

    if (firstChunkAtMs === null) {
      firstChunkAtMs = nowMs;
    }

    bytes += value.byteLength;
    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const newline = buffer.indexOf("\n");
      if (newline < 0) break;
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;

      const parsed = parseLine(line);
      events.push({
        atMs: nowMs,
        event: parsed,
      });
    }
  }

  const firstEvent = events[0] ?? null;
  const partials = events.filter((entry) => entry.event?.type === "partial");
  const finish = events.findLast((entry) => entry.event?.type === "finish") ?? null;
  const error = events.findLast((entry) => entry.event?.type === "error") ?? null;

  return {
    label,
    endpoint,
    claim,
    status: response.status,
    responseAtMs,
    firstChunkAtMs,
    firstEventAtMs: firstEvent?.atMs ?? null,
    firstPartialAtMs: partials[0]?.atMs ?? null,
    finishAtMs: finish?.atMs ?? null,
    totalDurationMs: Math.round(performance.now() - started),
    bytes,
    modelId: response.headers.get("x-yisu-model-id"),
    temperature: response.headers.get("x-yisu-temperature"),
    thinkingLevel: response.headers.get("x-yisu-thinking-level"),
    thinkingBudget: response.headers.get("x-yisu-thinking-budget"),
    eventCount: events.length,
    partialCount: partials.length,
    hasFinish: Boolean(finish),
    error: error?.event?.message ?? null,
    eventTypes: events.map((entry) => entry.event?.type ?? "unknown"),
    samples: {
      firstPartial:
        partials[0]?.event?.reading?.epistemological?.prose ??
        partials[0]?.event?.reading?.mastery?.prose ??
        partials[0]?.event?.reading?.jurisdictional?.prose ??
        null,
      finishQuestion: finish?.event?.reading?.question ?? null,
    },
    events,
  };
}

function renderMarkdown(results) {
  const lines = [];
  lines.push("# Stream Probe");
  lines.push("");

  for (const result of results) {
    lines.push(`## ${result.label}`);
    lines.push("");
    lines.push(`- Endpoint: \`${result.endpoint}\``);
    lines.push(`- Model: \`${result.modelId ?? "-"}\``);
    lines.push(`- Status: \`${result.status}\``);
    lines.push(
      `- Timing: response \`${result.responseAtMs}ms\`, first chunk \`${result.firstChunkAtMs ?? "-"}ms\`, first partial \`${result.firstPartialAtMs ?? "-"}ms\`, finish \`${result.finishAtMs ?? "-"}ms\`, total \`${result.totalDurationMs}ms\``,
    );
    lines.push(
      `- Events: \`${result.eventCount}\` total, \`${result.partialCount}\` partials, finish=\`${result.hasFinish}\`, error=${result.error ? `\`${result.error}\`` : "`null`"}`,
    );
    lines.push(`- Event types: ${result.eventTypes.map((type) => `\`${type}\``).join(", ")}`);
    if (result.samples.firstPartial) {
      lines.push(`- First partial sample: ${result.samples.firstPartial}`);
    }
    if (result.samples.finishQuestion) {
      lines.push(`- Finish question: ${result.samples.finishQuestion}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    usage();
    throw error;
  }

  const outDir = path.resolve(
    args.outDir ??
      `tmp/stream-probe-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  );

  const results = [];
  for (const entry of args.cases) {
    const result = await probeCase({
      label: entry.label,
      endpoint: entry.endpoint,
      claim: args.claim,
    });
    results.push(result);
    console.log(
      JSON.stringify(
        {
          label: result.label,
          modelId: result.modelId,
          status: result.status,
          responseAtMs: result.responseAtMs,
          firstChunkAtMs: result.firstChunkAtMs,
          firstPartialAtMs: result.firstPartialAtMs,
          finishAtMs: result.finishAtMs,
          totalDurationMs: result.totalDurationMs,
          partialCount: result.partialCount,
          error: result.error,
        },
        null,
        2,
      ),
    );
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, "results.json"),
    `${JSON.stringify({ claim: args.claim, results }, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(outDir, "results.md"),
    renderMarkdown(results),
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
