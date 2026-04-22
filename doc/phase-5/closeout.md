# Phase 5 — Closeout

> Run only after the author approves Phase 5 and the motion work has
> landed in the release candidate build. The point of this closeout is
> to prove that the instrument has gained tact, not chrome.

## Pre-conditions

- A build containing the Phase 5 motion work is running locally or in a
  preview environment.
- The five seeded chip claims in `BUILD_SPEC.md` §11 are unchanged.
- The browser used for verification can emulate
  `prefers-reduced-motion: reduce`.

## Verification script

1. **At-rest audit**
   - Load the instrument.
   - **Expect:** the page is visually still at rest. No ambient looping
     animation runs before interaction.

2. **Immediate press acknowledgement**
   - Click one seeded chip, then click **Press**.
   - **Expect:** the interface acknowledges the action immediately with
     visible state change on the button and surrounding input area.
   - **Expect:** this acknowledgement happens before the first streamed
     prose appears.
   - **Expect:** no spinner, skeleton, progress bar, or decorative
     loader icon appears.

3. **Waiting-to-stream handoff**
   - Watch the interval between click and first streamed text.
   - **Expect:** a typographic waiting cue is visible during the gap.
   - **Expect:** once real content begins streaming, the waiting cue
     yields cleanly without a flash, jump, or dead blank interval.

4. **Axis choreography audit**
   - Let a full reading complete.
   - **Expect:** each axis header establishes first or together with its
     prose; prose settles in rather than popping abruptly.
   - **Expect:** a verified quotation enters only after it is actually
     verified; unverified quote text never flashes on screen.
   - **Expect:** the motion is brief and readable, not theatrical.

5. **Final-question reveal**
   - Watch the last part of the reading.
   - **Expect:** the final question receives the most spacious reveal on
     the page while remaining easy to read at once.
   - **Expect:** `Press again ↑` appears only after the reading has
     fully resolved.

6. **Provenance drawer motion**
   - Open one verified quote's provenance drawer, then close it.
   - **Expect:** opening has a shaped, non-linear feel rather than an
     abrupt snap or a purely linear `max-height` slide.
   - **Expect:** auto-scroll still lands the highlighted passage in
     view.
   - **Expect:** closing is slightly faster than opening and does not
     cause surrounding content to lurch.

7. **Reduced-motion audit**
   - Emulate `prefers-reduced-motion: reduce` in the browser.
   - Repeat a press.
   - **Expect:** the interface still communicates state changes, but
     non-essential travel and scale motion are removed or materially
     reduced.
   - **Expect:** content completeness, verification behavior, and the
     provenance drawer remain intact.

8. **Phase 4 guardrail audit**
   - Inspect the network panel during a press.
   - **Expect:** exactly one `/api/press` request per press.
   - **Expect:** streaming remains visibly progressive.
   - **Expect:** the Phase 5 motion work does not reintroduce trust-floor
     regressions or obvious latency inflation.

## Pass criteria

- The page is calm at rest and responsive in motion.
- The click-to-first-token gap is visibly choreographed without using a
  spinner or other forbidden loader pattern.
- Verified quote and provenance behavior remain trustworthy.
- Reduced-motion mode works.
- Phase 4's one-call, streaming, and trust-floor invariants still hold.

## Result

Closed out on April 22, 2026.

- Deployment: `https://stress-test.jiesen-huang.com`
- Worker version: `bc8336ae-7ac4-4f23-b33e-384c17d66165`
- Local checks: `pnpm typecheck` and `pnpm build` passed
- At-rest audit: the page remained visually still before interaction;
  no ambient looping motion appeared
- Immediate acknowledgement: the chip, button, and input state changed
  immediately on press, before the full reading resolved
- Waiting-to-stream handoff: the typographic bridge was observed on the
  deployed build during the click-to-first-token gap, and on faster
  production responses the interface moved directly into streamed prose
  without a dead blank interval
- Axis choreography: production observation showed first-axis prose
  arriving before the full reading completed; verified quotations and
  the final question entered only once their content was ready, and
  `Press again ↑` appeared only after the reading resolved
- Provenance drawer: the drawer opened and closed with the shaped WAAPI
  motion path, auto-scrolled the highlighted passage into view, and did
  not collapse back to the earlier one-line-height bug
- Reduced-motion audit: verified in-browser with `agent-browser set
  media reduced-motion`; the reading still completed correctly and the
  provenance path remained intact with materially reduced motion
- Phase 4 guardrails: one production press still emitted exactly one
  `POST /api/press`; rendered quotations stayed on the trust floor with
  visible `✓ verified` badges only; opening provenance added one
  `POST /api/provenance` and no second generation request

Outcome: **pass**

## Failure handling

- If the page gains ambient decorative motion at rest, Phase 5 is not
  done.
- If the loading cue becomes a spinner, skeleton, or progress bar,
  Phase 5 is not done.
- If the drawer motion breaks auto-scroll or highlight visibility,
  Phase 5 is not done.
- If reduced-motion mode is missing or superficial, Phase 5 is not
  done.
- If motion work weakens streaming, quote verification, or the single
  `/api/press` invariant, Phase 5 is not done.

## On completion

- Re-run `doc/phase-4/closeout.md`.
- If Phase 5 is intended for the live demo build, re-run the relevant
  timing and visibility checks from `doc/phase-3/closeout.md`.
