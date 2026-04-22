# Phase 6 - Inline Epistemological Companion

> Build one quiet measuring line inside the main page so the live demo
> can show orchestration without inventing a second product.

## One-sentence goal

Place an AI-and-education claim between `Verifiable` and `Novelty`
inside Axis I, using the existing single `Press` call.

## Why this exists

The first companion attempt was too separate. It looked like another
small app, not like an authored addition to the instrument.

Phase 6 exists to prove a narrower point: one carefully specified extra
reading can be extracted from the same model call when the human sets a
clear contract, a strict visual target, and a small enough failure
budget.

## Hard constraints

- One page.
- One claim input.
- One model call.
- No new route.
- No second product voice.
- No truth judgment.
- No circles, cards, gauges, or dashboard chrome.
- No explanatory copy beyond the endpoint labels.
- No system-prompt rewrite.

## Success shape

- A five-stop ruler appears only in Axis I.
- The marker lands on one discrete stop.
- The ruler reads as subordinate to the axis, not as a widget.
- The rest of the Stress-Tester remains structurally unchanged.
- The result is stage-legible in one glance.

## Interface contract

- Placement: under the Axis I subtitle, above the prose.
- Form:
  - one thin horizontal rail
  - five fixed ticks
  - one vertical marker
  - two tiny endpoint labels: `Verifiable`, `Novelty`
- Behavior:
  - before first press, nothing new appears
  - after press, the scaffold may appear quietly
  - when placement arrives, the marker settles

## Prompt contract

- Locate, do not adjudicate.
- Add placement only to the epistemological axis.
- Use one of five fixed states:
  - `mostly_verifiable`
  - `lean_verifiable`
  - `mixed`
  - `lean_novelty`
  - `mostly_novelty`
- Choose the nearer stop when a claim sits between two.
- Keep the normal four-part reading intact.
- Keep quote selection and hydration on the existing path.

The exact frozen caller contract lives in
`doc/phase-6/prompt.md`.

## Implementation path

1. Add an optional `placement` field to the structured result.
2. Hydrate it through the existing `/api/press` stream.
3. Render a silent ruler inside Axis I.
4. Remove any standalone companion surface.
5. Tighten prompt wording until the marker is reliable and the UI stays
   quiet.
6. Freeze the result as a reproducible demo pack.

## Failure budget

- One small failure is acceptable.
- The acceptable failure is imprecise placement behavior, not a broken
  page or broken deploy.
- The visible repair should happen by tightening the prompt contract,
  not by manually rewriting model prose.

## Repro pack

- Branch: `codex/phase-6-inline-companion`
- Tag: `demo-phase6-v1`
- Prompt: `doc/phase-6/prompt.md`
- Runbook: `doc/phase-6/runbook.md`
- Closeout: `doc/phase-6/closeout.md`
- Screenshot: `doc/phase-6/assets/phase6-inline-companion-reference.png`
- Runtime files:
  - `app/api/press/route.ts`
  - `app/page.tsx`
  - `components/axis-section.tsx`
  - `components/placement-ruler.tsx`
  - `lib/press-stream.ts`
  - `lib/schema.ts`

## Reference

- `doc/BUILD_SPEC.md`
- `doc/phase-2/epic.md`
- `doc/phase-5/epic.md`
- `content/corpus/software-3-university-and-the-future-of-the-academy.md`
