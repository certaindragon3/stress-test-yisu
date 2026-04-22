# Phase 4 — Closeout

> Run after the Phase 4 performance changes are deployed. The point of
> this closeout is simple: prove that the production press path is fast
> enough now, without having cheated the instrument's trust
> commitments.

## Pre-conditions

- Phase 4 performance work is deployed to
  `https://stress-test.jiesen-huang.com`.
- The five seeded chip claims in `BUILD_SPEC.md §11` are unchanged.
- The fallback video from Phase 3 still exists; performance work is not
  an excuse to weaken demo safety.

## Verification script

1. **Production reachability**
   - Load `https://stress-test.jiesen-huang.com`.
   - **Expect:** HTTP 200 and the single-page form renders normally.

2. **Per-chip press timing**
   - For each of the five chip claims:
     - Click the chip and verify the textarea is populated.
     - Start a timer on click of **Press**.
     - Stop the timer only when all of the following are true:
       - the final question has rendered,
       - every visible blockquote has a `✓ verified` badge,
       - `Press again ↑` is visible.
     - **Expect:** elapsed time `≤ 20s`.

3. **Streaming audit**
   - During each press, watch the first axis prose and later sections.
   - **Expect:** text appears progressively during generation; the page
     does not sit idle and then reveal a full reading at once.

4. **Trust-floor audit**
   - For each press, count rendered `<blockquote>` elements and visible
     `✓ verified` badges.
   - **Expect:** counts are equal.
   - **Expect:** zero unverified quote placeholders are shown.

5. **Source-diversity audit**
   - For each of the five seeded chip claims, note the essay title shown
     in each visible quote caption.
   - **Expect:** the suite does not regress into a default state where
     all three axes repeatedly cite only *Software 3.0 and the Future of
     the Academy*.
   - **Expect:** where multiple verified quotes are visible, at least
     some of the seeded claims clearly draw from more than one essay
     title across the three axes.

6. **Provenance / source-fidelity audit**
   - Open one verified quote's provenance drawer from a non-*Software
     3.0* source if available; otherwise use any verified quote.
   - **Expect:** the drawer resolves the same source title advertised in
     the visible quote caption.
   - **Expect:** highlight scroll and surrounding context still behave
     as in Phase 2.

7. **One-call invariant**
   - Inspect the network panel during a press.
   - **Expect:** exactly one `/api/press` request per press.
   - **Expect:** no second model-generation request is introduced as a
     hidden performance workaround.

## Pass criteria

- All five chip presses complete in `≤ 20s` on production.
- Streaming remains visibly progressive.
- Every trust-floor audit passes.
- The source-diversity audit shows that Phase 4 did not regain speed by
  collapsing the reading back onto a single essay.
- The provenance drawer still works.
- No new route or second model call has been introduced.

## Result

Closed out on April 21, 2026.

- Deployment: `https://stress-test.jiesen-huang.com`
- Worker version: `6a46d46d-dba9-44b3-bc0c-cc0654ff1c23`
- Production reachability: `HTTP 200`
- Browser per-chip press timing:
  `Prompting is the new literacy.` `≈ 5.0s`; `AI tutors will replace TAs within five years.` `≈ 4.6s`; `Kids shouldn't learn to code — leave it up to AI.` `≈ 5.1s`; `The essay is dead.` `≈ 4.5s`; `Within ten years, AI will replace many doctors and teachers.` `≈ 4.7s`
- API benchmark cross-check:
  `startTransfer ≈ 1.08s–1.24s`; `total ≈ 5.18s–5.81s`
- Streaming audit: first-axis prose appeared before the final
  blockquotes, badges, and `Press again ↑`; no buffered full-page reveal
  was observed
- Trust floor: `5/5` production presses rendered only verified
  blockquotes; zero unverified placeholders appeared
- Source diversity: `5/5` production audit presses surfaced three
  distinct essay titles across the axis quotes
- One-call invariant: browser verification showed exactly one
  `/api/press` request per press
- Provenance fidelity spot-check: a non-*Software 3.0* quote from
  `职业教育的政治经济学故事, 职业教育的失败` resolved in the drawer with the
  highlighted passage already scrolled into view

Outcome: **pass**

## Failure handling

- If timing passes locally but fails on production, Phase 4 is not done.
- If timing passes but quotes lose `✓ verified`, Phase 4 is not done.
- If timing passes but the source-diversity audit regresses to repeated
  single-essay readings, Phase 4 is not done.
- If timing passes by buffering until completion, Phase 4 is not done.

## On completion

- Re-run `doc/phase-3/closeout.md` end-to-end.
- Only after Phase 3 also passes may the instrument be considered demo
  ready.
