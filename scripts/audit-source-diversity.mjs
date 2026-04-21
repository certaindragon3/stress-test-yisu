#!/usr/bin/env node

const DEFAULT_ENDPOINT = "https://stress-test.jiesen-huang.com/api/press";
const DEFAULT_ROUNDS = 1;
const CLAIMS = [
  "Prompting is the new literacy.",
  "AI tutors will replace TAs within five years.",
  "Kids shouldn't learn to code — leave it up to AI.",
  "The essay is dead.",
  "Within ten years, AI will replace many doctors and teachers.",
];
const AXES = ["epistemological", "mastery", "jurisdictional"];

const endpoint = process.argv[2] ?? DEFAULT_ENDPOINT;
const rounds = Number.parseInt(process.argv[3] ?? "", 10) || DEFAULT_ROUNDS;

function essayTitle(source) {
  if (!source) return null;
  const idx = source.indexOf(",");
  return idx >= 0 ? source.slice(0, idx).trim() : source.trim();
}

async function runClaim(claim) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ claim }),
  });

  const body = await response.text();
  const events = body
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const finish = [...events].reverse().find((event) => event.type === "finish");
  const error = [...events].reverse().find((event) => event.type === "error");

  if (!finish) {
    return {
      claim,
      status: response.status,
      modelId: response.headers.get("x-yisu-model-id"),
      error: error?.message ?? "No finish event received.",
    };
  }

  const essays = AXES.map((axis) =>
    essayTitle(finish.reading?.[axis]?.quote?.source ?? null),
  );

  return {
    claim,
    status: response.status,
    modelId: response.headers.get("x-yisu-model-id"),
    temperature: Number(response.headers.get("x-yisu-temperature") ?? 0),
    thinkingLevel: response.headers.get("x-yisu-thinking-level"),
    thinkingBudget:
      response.headers.get("x-yisu-thinking-budget") === ""
        ? null
        : Number(response.headers.get("x-yisu-thinking-budget") ?? 0),
    essays,
    uniqueEssayCount: new Set(essays.filter(Boolean)).size,
    verifications: finish.verifications,
  };
}

async function main() {
  console.log(
    JSON.stringify(
      {
        endpoint,
        rounds,
        measuredAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  for (let round = 1; round <= rounds; round += 1) {
    console.log(JSON.stringify({ round }, null, 2));
    for (const claim of CLAIMS) {
      console.log(JSON.stringify(await runClaim(claim), null, 2));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
