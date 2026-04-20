# Phase 1 — Corpus Landing

> The first reviewed Yisu pieces enter `content/corpus/`. The
> instrument starts producing real quotations with the `✓ verified`
> badge. The trust commitment becomes visible.

## Goal

At least three reviewed Yisu pieces — including the *Software 3.0
University* keynote — sit verbatim under `content/corpus/` as `.md`
files. Pressing the five canonical chip claims (BUILD_SPEC §11)
produces readings in which the majority of axes carry a quote that
passes `verifyQuote()` and renders with `✓ verified`. Whitespace and
Unicode-punctuation handling is robust enough that no honest quote is
falsely rejected.

## Current status

As of 2026-04-20, the corpus has been expanded to 10 reviewed pieces:
the original seven plus `xinrui-weekly-2023-year-end-questionnaire.md`,
`beijing-news-2020-interview-outline.md`, and
`what-kind-of-high-school-what-kind-of-education.md`. The expansion is
targeted at the current chip set's weak spots: ChatGPT and machine
knowing, data-driven claims about learning, RCT-to-policy extrapolation,
and skill formation.

An API smoke test against `next start` on port 3001 produced 15 attempted
quotes across the five chip claims, with 13 passing verification
(`86.7%`). This clears the Phase 1 rate threshold as a preliminary
signal, but it is not a replacement for the full 25-press browser
closeout in `closeout.md`.

## In scope

- Human curation of reviewed pieces from `Yisu data/` and
  `data/processed/` into `content/corpus/`. Whole pieces only — no
  excerpts, no abridgements (per CLAUDE.md "the corpus is sacred").
- Each file has a stable filename matching its essay title (e.g.
  `software-3-university.md`) and begins with a single H1 line carrying
  the title the model will cite.
- Tighten `verifyQuote()` to also normalize curly quotes (`" " ' '`)
  to ASCII equivalents and to fold non-breaking space to space, so
  copy-paste artifacts in the corpus do not break verification.
- Normalize lightweight Markdown/HTML markup before quote matching, so
  an honest quote is not rejected merely because the model omits
  emphasis markers around words that are italicized in the Markdown
  corpus.
- Add a `pnpm corpus:check` script that, given a quote text on stdin,
  reports whether it would pass verification — useful for rehearsal
  triage when a quote is rejected on stage.
- Manual rehearsal log under `doc/phase-1/rehearsal-log.md` recording
  five presses per chip, with verification rate per axis.

## Out of scope

- Any UI change. The page renders exactly as in Phase 0; only the
  presence of verified quotes is new.
- Provenance drawer, retrieval, visualization. That is Phase 2.
- Translations or co-authored passages. CLAUDE.md is explicit:
  "do not treat translations or co-authored passages as directly
  quoteable Yisu corpus without explicit review."

## Acceptance criteria

1. `content/corpus/` contains at least three `.md` files, each a whole
   reviewed Yisu piece. The *Software 3.0 University* keynote is one
   of them.
2. Total corpus length under ~50k tokens (the verification floor noted
   in CLAUDE.md). If exceeded, escalate the verification design.
3. Across five presses of each of the five chip claims (25 presses
   total), **at least 80%** of the axes that produce a quote produce
   one that passes `verifyQuote()` and renders the `✓ verified` badge.
4. Across the same 25 presses, **zero** rendered blockquotes appear
   without the `✓ verified` badge. (This is the trust floor; failing
   it fails the phase.)
5. The final question continues to be exactly one sentence on every
   press.
6. `pnpm typecheck` and `pnpm build` continue to succeed.

## Open questions / risks

- **Coverage gaps.** If the corpus does not cover one of the chip
  topics (e.g., nothing on TAs for "AI tutors will replace TAs"), the
  model will honestly say "Yisu has not written directly on this
  point." That is correct behavior, not a bug. Decide per-chip whether
  to swap it out or keep it as an honest negative result on stage.
- **Chunk-gated verification.** If the corpus crosses ~50k tokens,
  full-corpus substring scan stays correct but loses precision: a
  fragment from one essay may match a different essay's prose. At that
  point, switch to per-file verification with the model citing source
  filename, and `verifyQuote()` checks against that file only.
- **Smart-quote drift.** Markdown editors and Pandoc both like to
  rewrite quotes. The normalization layer must run before substring
  match; add tests for `" "` and `' '` round-trips.
- **Smoke test is not closeout.** The current API smoke test establishes
  that the corpus expansion moved the hit rate in the right direction.
  Phase 1 is not formally complete until the browser-driven 25-press
  closeout verifies rendered blockquotes, `✓ verified` badges, and
  one-sentence final questions end-to-end.

## Reference

- `CLAUDE.md` "Document processing context" section.
- `doc/YISU_DATA_WORKFLOW.md` — manifest, convert, audit pipeline.
