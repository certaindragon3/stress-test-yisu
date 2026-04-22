#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

const SEEDED_CLAIMS = [
  "Prompting is the new literacy.",
  "AI tutors will replace TAs within five years.",
  "Kids shouldn't learn to code — leave it up to AI.",
  "The essay is dead.",
  "Within ten years, AI will replace many doctors and teachers.",
];

const STRETCH_CLAIMS = [
  "AI tutors will be as good a tutor as any human ever could be.",
  "College is maybe not working great for most people — my kid will probably not go.",
  "AI chatbots will teach kids to read within 18 months — you'll be stunned by how it helps.",
];

const SUITES = {
  seeded: SEEDED_CLAIMS,
  stretch: STRETCH_CLAIMS,
  all: [...SEEDED_CLAIMS, ...STRETCH_CLAIMS],
};

function usage() {
  console.error(`Usage:
  node scripts/model-bakeoff.mjs \\
    --case label=http://127.0.0.1:3101/api/press \\
    --case other=http://127.0.0.1:3102/api/press \\
    [--suite seeded|stretch|all] \\
    [--out-dir tmp/model-bakeoff]
`);
}

function parseArgs(argv) {
  const args = {
    cases: [],
    suite: "all",
    outDir: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

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

    if (arg === "--suite") {
      const value = argv[i + 1];
      if (!value || !(value in SUITES)) {
        throw new Error(`Invalid --suite value: ${value ?? ""}`);
      }
      args.suite = value;
      i += 1;
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

function parseEvents(text) {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function essayTitle(source) {
  if (!source) return null;
  const idx = source.indexOf(",");
  return idx >= 0 ? source.slice(0, idx).trim() : source.trim();
}

function countVerified(verifications) {
  return Object.values(verifications ?? {}).filter(
    (value) => value === "verified",
  ).length;
}

function axisSummary(axis) {
  if (!axis) return null;
  return {
    prose: axis.prose ?? null,
    quote: axis.quote?.text ?? null,
    source: axis.quote?.source ?? null,
  };
}

async function captureReading({ label, endpoint, claim }) {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ claim }),
  });
  const body = await response.text();
  const totalMs = Math.round(performance.now() - started);

  let events = [];
  try {
    events = parseEvents(body);
  } catch (error) {
    return {
      label,
      endpoint,
      claim,
      startedAt,
      status: response.status,
      totalMs,
      modelId: response.headers.get("x-yisu-model-id"),
      parseError: error instanceof Error ? error.message : String(error),
      rawBody: body,
    };
  }

  const finish = [...events].reverse().find((event) => event.type === "finish");
  const streamError = [...events].reverse().find((event) => event.type === "error");
  const reading = finish?.reading ?? null;
  const essays = reading
    ? [
        essayTitle(reading.epistemological?.quote?.source ?? null),
        essayTitle(reading.mastery?.quote?.source ?? null),
        essayTitle(reading.jurisdictional?.quote?.source ?? null),
      ]
    : [];

  return {
    label,
    endpoint,
    claim,
    startedAt,
    status: response.status,
    totalMs,
    modelId: response.headers.get("x-yisu-model-id"),
    temperature: Number(response.headers.get("x-yisu-temperature") ?? 0),
    thinkingLevel: response.headers.get("x-yisu-thinking-level") || null,
    thinkingBudget:
      response.headers.get("x-yisu-thinking-budget") === ""
        ? null
        : Number(response.headers.get("x-yisu-thinking-budget") ?? 0),
    contextMode: response.headers.get("x-yisu-context-mode") || null,
    contextChars: Number(response.headers.get("x-yisu-context-chars") ?? 0),
    contextExcerpts: Number(response.headers.get("x-yisu-context-excerpts") ?? 0),
    contextSources: Number(response.headers.get("x-yisu-context-sources") ?? 0),
    error: streamError?.message ?? null,
    finishReceived: Boolean(finish),
    verifiedCount: countVerified(finish?.verifications),
    verifications: finish?.verifications ?? null,
    uniqueEssayCount: new Set(essays.filter(Boolean)).size,
    essays,
    question: reading?.question ?? null,
    axes: {
      epistemological: axisSummary(reading?.epistemological),
      mastery: axisSummary(reading?.mastery),
      jurisdictional: axisSummary(reading?.jurisdictional),
    },
  };
}

function compareRow(records, label) {
  return records.find((record) => record.label === label) ?? null;
}

function quoteSource(summary) {
  return summary?.source ? ` — ${summary.source}` : "";
}

function renderMarkdown({ cases, suite, claims, records, outDir }) {
  const lines = [];
  lines.push("# Model Bakeoff");
  lines.push("");
  lines.push(`- Suite: \`${suite}\``);
  lines.push(`- Captured: ${new Date().toISOString()}`);
  lines.push(`- Cases: ${cases.map((entry) => `\`${entry.label}\``).join(", ")}`);
  lines.push(`- Output dir: \`${outDir}\``);
  lines.push("");

  for (const claim of claims) {
    lines.push(`## ${claim}`);
    lines.push("");
    lines.push("| Case | Model | ms | Verified | Essays | Question |");
    lines.push("| --- | --- | ---: | ---: | ---: | --- |");

    for (const entry of cases) {
      const row = compareRow(
        records.filter((record) => record.claim === claim),
        entry.label,
      );
      if (!row) {
        lines.push(`| ${entry.label} | - | - | - | - | missing |`);
        continue;
      }
      const question = row.question
        ? row.question.replace(/\|/g, "\\|")
        : row.error ?? "no finish event";
      lines.push(
        `| ${row.label} | ${row.modelId ?? "-"} | ${row.totalMs} | ${row.verifiedCount}/3 | ${row.uniqueEssayCount} | ${question} |`,
      );
    }

    lines.push("");

    for (const entry of cases) {
      const row = compareRow(
        records.filter((record) => record.claim === claim),
        entry.label,
      );
      if (!row) continue;

      lines.push(`### ${row.label}`);
      lines.push("");
      lines.push(
        `- Model: \`${row.modelId ?? "-"}\` | Time: \`${row.totalMs}ms\` | Verified: \`${row.verifiedCount}/3\` | Essay diversity: \`${row.uniqueEssayCount}\``,
      );
      if (row.error) {
        lines.push(`- Error: ${row.error}`);
        lines.push("");
        continue;
      }
      lines.push(`- Question: ${row.question ?? "(missing)"}`);
      lines.push("");
      lines.push(`**Epistemological**${quoteSource(row.axes.epistemological)}`);
      lines.push("");
      lines.push(row.axes.epistemological?.prose ?? "(missing)");
      if (row.axes.epistemological?.quote) {
        lines.push("");
        lines.push(`> ${row.axes.epistemological.quote}`);
      }
      lines.push("");
      lines.push(`**Mastery**${quoteSource(row.axes.mastery)}`);
      lines.push("");
      lines.push(row.axes.mastery?.prose ?? "(missing)");
      if (row.axes.mastery?.quote) {
        lines.push("");
        lines.push(`> ${row.axes.mastery.quote}`);
      }
      lines.push("");
      lines.push(`**Jurisdictional**${quoteSource(row.axes.jurisdictional)}`);
      lines.push("");
      lines.push(row.axes.jurisdictional?.prose ?? "(missing)");
      if (row.axes.jurisdictional?.quote) {
        lines.push("");
        lines.push(`> ${row.axes.jurisdictional.quote}`);
      }
      lines.push("");
    }
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

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.resolve(
    args.outDir ?? `tmp/model-bakeoff-${timestamp}`,
  );
  const claims = SUITES[args.suite];
  const records = [];

  for (const claim of claims) {
    const results = await Promise.all(
      args.cases.map((entry) =>
        captureReading({
          label: entry.label,
          endpoint: entry.endpoint,
          claim,
        }),
      ),
    );
    records.push(...results);
    console.log(
      JSON.stringify(
        {
          claim,
          results: results.map((result) => ({
            label: result.label,
            modelId: result.modelId,
            totalMs: result.totalMs,
            verifiedCount: result.verifiedCount,
            uniqueEssayCount: result.uniqueEssayCount,
            error: result.error,
          })),
        },
        null,
        2,
      ),
    );
  }

  await fs.mkdir(outDir, { recursive: true });
  const payload = {
    capturedAt: new Date().toISOString(),
    suite: args.suite,
    cases: args.cases,
    claims,
    records,
  };
  await fs.writeFile(
    path.join(outDir, "results.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(outDir, "results.md"),
    renderMarkdown({
      cases: args.cases,
      suite: args.suite,
      claims,
      records,
      outDir: path.relative(process.cwd(), outDir),
    }),
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
