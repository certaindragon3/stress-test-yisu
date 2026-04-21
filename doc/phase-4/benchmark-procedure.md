# Phase 4 Benchmark Procedure

Use `scripts/benchmark-press.mjs` to compare the press route across local
and production with the same five seeded claims from `doc/BUILD_SPEC.md §11`.
Use `scripts/audit-source-diversity.mjs` alongside it to check whether the
same runs are actually drawing on multiple essays, not only returning fast.

## Commands

Production:

```bash
node scripts/benchmark-press.mjs
node scripts/audit-source-diversity.mjs
```

Local `next start` on port `3005`:

```bash
pnpm build
pnpm exec next start --hostname 127.0.0.1 --port 3005
node scripts/benchmark-press.mjs http://127.0.0.1:3005/api/press
node scripts/audit-source-diversity.mjs http://127.0.0.1:3005/api/press
```

## What to record

- `startTransferMs`: time to first streamed byte
- `totalMs`: time until the response stream closes
- `contextMode`: whether the route used retrieved excerpts or the full corpus
- `contextChars`, `contextExcerpts`, `contextSources`: the request-context size sent to the model
- `modelId`, `temperature`, `thinkingLevel`, `thinkingBudget`: the
  model-side settings actually used for the run
- `essays`, `uniqueEssayCount`: which essay titles the three axis
  quotes came from, collapsed to the essay-title level rather than the
  full `title, section` caption
- `verifications`: whether each axis ended `verified`, `pending`, or
  `unverified`

Interpretation notes:

- A run that is fast but returns `uniqueEssayCount: 1` across most seeded
  claims is not a Phase 4 success; that usually signals single-essay
  collapse onto *Software 3.0 and the Future of the Academy*.
- A run that improves `uniqueEssayCount` but turns multiple axes
  `unverified` is also not a Phase 4 success; that usually signals that
  breadth was recovered by making quotation less exact.

These scripts measure the API path only. Phase 4 closeout still requires
the browser-level production checks in `doc/phase-4/closeout.md`.
