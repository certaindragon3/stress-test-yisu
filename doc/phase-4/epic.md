# Phase 4 — Performance Hardening + Robust Retrieval

> Bring the instrument's production press latency back inside the
> Phase 3 budget without weakening its authored frame, trust floor,
> corpus breadth, or single-screen shape.

## Goal

The production instrument at `https://stress-test.jiesen-huang.com`
meets BUILD_SPEC §12.2 in the only place that matters: the deployed
site. Phase 4's goal is now explicitly dual: a press on any of the five
seeded claims must complete in under 20 seconds, while the retrieval
path must also remain robust enough that the reading draws on Yisu's
broader corpus rather than collapsing back onto a single canonical
essay. The deployed instrument must therefore stay fast, stream
throughout, and avoid regressing quote verification, source
attribution, corpus breadth, or the Phase 2 provenance drawer.

Phase 4 exists because Phase 3 is currently blocked on runtime rather
than deployment mechanics. The site is reachable, but the live press
path misses the budget badly enough that "works on my laptop" is not a
useful proxy for the auditorium. Follow-up testing on 2026-04-21 also
surfaced a second production risk: when retrieval is narrowed to meet
latency, the model can collapse back onto *Software 3.0 and the Future
of the Academy* for all three axes, or regain breadth only by becoming
less reliable about exact quotations. Phase 4 therefore now covers both
latency and the robustness of a multi-source retrieval path.

## Baseline on 2026-04-21

- Local `next start` (`http://localhost:3005/api/press`) for
  `"Prompting is the new literacy."`:
  `time_starttransfer ≈ 15.4s`, `time_total ≈ 17.7s`.
- Production `https://stress-test.jiesen-huang.com/api/press` for the
  same claim:
  `time_starttransfer ≈ 1.2s`, `time_total ≈ 51.8s`.
- Current request context size is materially large:
  authored system prompt ≈ `1,605` words / `10,457` chars; baked corpus
  ≈ `7,083` words / `130,153` chars; combined input ≈ `8,688` words /
  `140,610` chars before the claim itself.

These numbers do not yet prove a single root cause, but they are enough
to establish the problem: the press path is over budget in production by
roughly 2.5x to 3x, and the current implementation sends substantially
more context than the budget appears to tolerate.

## Follow-up findings on 2026-04-21

- The latency path can be brought back under budget by retrieval,
  transport, and model-setting changes; production timings in the
  current Phase 4 branch are no longer the primary blocker.
- However, source-diversity testing against the five seeded claims
  showed that the default press path could still collapse all three
  axis quotations onto *Software 3.0 and the Future of the Academy*,
  even when the retrieved context contained other relevant essays.
- Broadening retrieval context improves essay diversity, but in the same
  runs can also increase quote-verification failures, which means Phase
  4 cannot treat "more sources" and "trust floor" as separable concerns.
- The practical requirement is now a **multi-source, verification-safe
  retrieval path**: the instrument should regularly surface more than
  one Yisu text across the three axes, without fabricating breadth and
  without pushing verified quotations off the screen.

## Working diagnosis

- Every press currently sends the full authored system prompt plus the
  full baked corpus to the model.
- The production path returns headers quickly but keeps the response
  open for roughly 50 seconds, which suggests the main problem is not
  simple route reachability.
- The most likely bottlenecks are a combination of:
  1. oversized per-press model context,
  2. structured-generation overhead on the current AI SDK path, and
  3. deployment-path amplification on Cloudflare Workers relative to the
     local Node server.

Phase 4 is where these hypotheses are tested and reduced to measured
engineering changes.

## In scope

- Add a repeatable latency harness for the press route so local and
  production timings can be compared claim-by-claim.
- Add a repeatable source-diversity harness for the press route so local
  and production runs can be compared claim-by-claim at the essay-title
  level, not only at the section-caption level.
- Reduce per-press context volume **without** paraphrasing Yisu's
  writings and **without** editing files under `content/corpus/`.
- If retrieval is introduced, it must pass corpus material verbatim from
  the sacred corpus; no summaries, no synthetic "compressed corpus", no
  authorial paraphrase.
- If retrieval is introduced, it must be robust against single-essay
  collapse. In particular, the retrieval/indexing path should not make
  it trivially easy for the model to quote *Software 3.0 and the Future
  of the Academy* for all three axes when other corpus pieces more
  honestly fit mastery or jurisdiction.
- Precompute any indexing or lookup data at build time if it removes
  runtime work from the Worker path.
- Evaluate whether the current `streamObject` transport should remain,
  or whether a lower-overhead structured streaming path is warranted.
- Remove avoidable post-generation latency in quote verification and
  client rendering, provided the trust floor remains intact.
- Strengthen the connection between quote verification and source
  attribution if testing shows the model can copy a real substring while
  attaching the wrong essay title or section label.
- Keep the existing single view, single press route, and single model
  call per press.

## Out of scope

- Rewriting the authored text in `lib/system-prompt.ts` for style,
  tone, or argument shape. If prompt wording itself must change for
  performance, that change requires a separate authorial decision.
- Changing the corpus contents, abridging essays, or replacing them
  with summaries.
- Caching model responses across claims or users.
- Adding routes, settings, history, analytics, or other product
  surface.
- Relaxing the verification gate or rendering unverified quotations.

## Acceptance criteria

1. The deployed site completes a press for each of the five seeded
   claims in `BUILD_SPEC.md §11` in `≤ 20s`, measured on production.
2. Streaming remains visible during the press; Phase 4 does not "solve"
   latency by buffering until the end.
3. Across the same five production presses, every rendered blockquote
   carries `✓ verified`, and zero unverified quotations appear.
4. Across the same five production presses, the instrument does not
   systematically collapse to a single essay title when the corpus
   honestly supports broader grounding. The intended shape is that the
   seeded suite regularly surfaces at least two distinct essay titles
   across a reading's three verified axis quotes, and often three.
5. The source caption shown under a verified blockquote is consistent
   with what the provenance drawer resolves for that quote; Phase 4
   does not trade speed for ambiguous or misleading source labels.
6. The Phase 2 provenance drawer still opens correctly for verified
   quotes after the performance work lands.
7. The implementation preserves the authored prompt invariant, the
   sacred-corpus invariant, and the one-screen / one-model-call
   invariant.
8. The repository contains a documented benchmark procedure so future
   regressions can be detected before the demo.

## Open questions / risks

- Is the dominant gain going to come from corpus retrieval, transport
  changes, or both?
- Does Cloudflare's Node runtime amplify the current AI SDK streaming
  path in a way that local benchmarking understates?
- If retrieval is introduced, how much corpus can be removed before
  quote quality or axis breadth regresses?
- Does the current verification floor check only quote text, when Phase
  4 in practice also needs source-label fidelity?
- If essay diversity improves but verified-quote yield falls, what is
  the right fallback: `quote: null`, server-side source reconciliation,
  or a more opinionated retrieval layout?
- If prompt wording turns out to be a major contributor, does the author
  want a separate prompt-revision phase, or should performance work stop
  short of touching the authored object?

## Reference

- `BUILD_SPEC.md` §5, §7, §8, §12
- `doc/phase-2/epic.md`
- `doc/phase-3/epic.md`
