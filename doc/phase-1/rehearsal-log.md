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

- Date: _TBD_
- Operator: _TBD_
- Model: `gemini-3.1-pro-preview`
- Corpus SHA: _record `git rev-parse HEAD:content/corpus` before start_
- Notes: _any deviations from default_

## Per-press records

### Chip 1 — "Prompting is the new literacy."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 |   |   |   |         |       |
| 2 |   |   |   |         |       |
| 3 |   |   |   |         |       |
| 4 |   |   |   |         |       |
| 5 |   |   |   |         |       |

Chip subtotal: `A=__  V=__  rate=__%`

### Chip 2 — "AI tutors will replace TAs within five years."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 |   |   |   |         |       |
| 2 |   |   |   |         |       |
| 3 |   |   |   |         |       |
| 4 |   |   |   |         |       |
| 5 |   |   |   |         |       |

Chip subtotal: `A=__  V=__  rate=__%`

### Chip 3 — "AI tutors help students learn more in less time."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 |   |   |   |         |       |
| 2 |   |   |   |         |       |
| 3 |   |   |   |         |       |
| 4 |   |   |   |         |       |
| 5 |   |   |   |         |       |

Chip subtotal: `A=__  V=__  rate=__%`

### Chip 4 — "The essay is dead."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 |   |   |   |         |       |
| 2 |   |   |   |         |       |
| 3 |   |   |   |         |       |
| 4 |   |   |   |         |       |
| 5 |   |   |   |         |       |

Chip subtotal: `A=__  V=__  rate=__%`

### Chip 5 — "Teachers must not let AI substitute for teaching."

| # | B | V | A | Honest? | Notes |
|---|---|---|---|---------|-------|
| 1 |   |   |   |         |       |
| 2 |   |   |   |         |       |
| 3 |   |   |   |         |       |
| 4 |   |   |   |         |       |
| 5 |   |   |   |         |       |

Chip subtotal: `A=__  V=__  rate=__%`

## Run-level aggregate

| Metric | Value | Threshold |
|--------|-------|-----------|
| Total quotes attempted (sum A) | __ | — |
| Total quotes verified (sum V) | __ | — |
| Verification rate | __% | ≥ 80% |
| Unverified blockquotes rendered (sum of `B − V`) | __ | = 0 |
| Presses where final question ≠ exactly one sentence | __ | = 0 |

## Failures / observations

_Record any axis that produced a dishonest-but-verifiable quote (the
model found a verbatim match but used it out of context), any
verification false-negative (honest quote rejected), and any
stage-facing rough edges (latency, layout jitter, text selection)._

## Outcome

- [ ] All five per-press audits pass (`B === V` every time).
- [ ] Aggregate verification rate ≥ 80%.
- [ ] Trust floor: zero unverified blockquotes rendered.
- [ ] Every final question is exactly one sentence.

_Phase 1 declared complete on: ____________  by: _____________
