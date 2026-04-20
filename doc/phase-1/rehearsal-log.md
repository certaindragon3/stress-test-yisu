# Phase 1 — Rehearsal Log

> Five presses per chip, 25 presses total. Filled in during live
> rehearsal against a running `pnpm dev`. See `closeout.md` for the
> driving script and pass criteria.

## Conventions

- **B** = count of rendered `<blockquote>` elements on the page.
- **V** = count of `✓ verified` badges on the page.
- **A** = count of axes whose streamed `quote` field was non-null
  (i.e. quotes attempted — regardless of whether they rendered).
- Trust-floor invariant: across every press, `B === V` must hold.
  Any single violation fails the phase outright.
- Per-run aggregate verification rate is `sum(V) / sum(A)` across the
  25 presses; must be `≥ 0.80`.

## Rehearsal environment

- Date: 2026-04-20
- Operator: Codex
- Model: `gemini-3.1-pro-preview`
- Corpus SHA: _not yet available; corpus expansion is currently
  uncommitted_
- Notes: The initial smoke test used `pnpm build` followed by
  `pnpm exec next start -p 3001`. The formal closeout used a fresh
  `pnpm dev` on `localhost:3000` and an `agent-browser` browser session.
  Because repeated long-running `agent-browser eval` calls made the
  daemon intermittently busy, the browser was launched and managed by
  `agent-browser`, then driven through its Chrome DevTools Protocol
  endpoint for the 25-press loop. The audited surface remained the
  rendered browser DOM plus `/api/verify` responses.

## API smoke test — 2026-04-20

This was a one-press-per-chip API check after expanding the corpus from
7 to 10 pieces and making quote verification tolerant of lightweight
Markdown/HTML markup. It is a rehearsal signal, not the formal 25-press
closeout.

| Chip | A | V | Rate | Final question | Notes |
|------|---|---|------|----------------|-------|
| Prompting is the new literacy. | 3 | 2 | 66.7% | 1 sentence | One attempted quote failed verification and would not render as a blockquote. |
| AI tutors will replace TAs within five years. | 3 | 3 | 100% | 1 sentence | All attempted quotes verified. |
| Kids shouldn't learn to code — leave it up to AI. | 3 | 2 | 66.7% | 1 sentence | One attempted quote failed verification and would not render as a blockquote. |
| The essay is dead. | 3 | 3 | 100% | 1 sentence | All attempted quotes verified. |
| Within ten years, AI will replace many doctors and teachers. | 3 | 3 | 100% | 1 sentence | All attempted quotes verified. |

Smoke subtotal: `A=15  V=13  rate=86.7%`

Verification checks also confirmed that newly promoted Chinese passages
from `《信睿周报》2023年终特辑问卷_周忆粟`,
`新京报2020周忆粟老师采访提纲`, and
`什么样的高中，什么样的教育` are reachable through
`pnpm corpus:check`.

## Per-press records

### Chip 1 — "Prompting is the new literacy."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 2 | 2 | 2 | 3 | yes | One quote failed verification and rendered only as placeholder. |
| 3 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 4 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 5 | 3 | 3 | 3 | yes | All attempted quotes verified. |

Chip subtotal: `A=15  V=14  rate=93.3%`

### Chip 2 — "AI tutors will replace TAs within five years."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 2 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 3 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 4 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 5 | 1 | 1 | 3 | yes | Two quotes failed verification and rendered only as placeholders. |

Chip subtotal: `A=15  V=13  rate=86.7%`

### Chip 3 — "Kids shouldn't learn to code — leave it up to AI."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 2 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 3 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 4 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 5 | 2 | 2 | 3 | yes | One quote failed verification and rendered only as placeholder. |

Chip subtotal: `A=15  V=14  rate=93.3%`

### Chip 4 — "The essay is dead."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 2 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 3 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 4 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 5 | 3 | 3 | 3 | yes | All attempted quotes verified. |

Chip subtotal: `A=15  V=15  rate=100%`

### Chip 5 — "Within ten years, AI will replace many doctors and teachers."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 | 2 | 2 | 3 | yes | One quote failed verification and rendered only as placeholder. |
| 2 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 3 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 4 | 3 | 3 | 3 | yes | All attempted quotes verified. |
| 5 | 3 | 3 | 3 | yes | All attempted quotes verified. |

Chip subtotal: `A=15  V=14  rate=93.3%`

## Run-level aggregate

| Metric | Value | Threshold |
|--------|-------|-----------|
| Total quotes attempted (sum A) | 75 | — |
| Total quotes verified (sum V) | 70 | — |
| Verification rate | 93.3% | ≥ 80% |
| Unverified blockquotes rendered (sum of `B − V`) | 0 | = 0 |
| Presses where final question ≠ exactly one sentence | 0 | = 0 |

## Failures / observations

- Five attempted quotes failed verification across the full run. Each
  rendered as `unverified — not rendered`, never as a blockquote.
- No rendered blockquote lacked the `✓ verified` badge.
- No final question violated the one-sentence requirement.
- No page-level failure message appeared.
- The browser automation required a CDP fallback after long-running
  `agent-browser eval` calls made the daemon intermittently busy. The
  tested browser was still launched and owned by `agent-browser`.

## Outcome

- [x] All five per-press audits pass (`B === V` every time).
- [x] Aggregate verification rate ≥ 80%.
- [x] Trust floor: zero unverified blockquotes rendered.
- [x] Every final question is exactly one sentence.

_Phase 1 declared complete on: 2026-04-20  by: Codex_
