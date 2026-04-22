# Phase 6 - Closeout

> Run against the main deployed instrument after the inline ruler is in
> place. The goal is to prove that the new control behaves like a quiet
> companion reading, not a second product surface.

## Pre-conditions

- The main instrument is deployed and reachable.
- `/api/press` returns the authored three-axis reading as usual.
- The Epistemological Axis may also return an optional placement band.

## Verification script

1. **At-rest audit**
   - Load the main page.
   - **Expect:** the page matches the existing single-screen instrument
     at rest.
   - **Expect:** no standalone companion panel, no extra title, no extra
     result card.

2. **Primary press**
   - Paste: `AI tutors will replace TAs within five years.`
   - Submit once.
   - **Expect:** exactly one model request is issued.
   - **Expect:** the standard results area opens as before.

3. **Ruler placement audit**
   - Inspect Axis I.
   - **Expect:** a thin five-stop ruler appears beneath the subtitle and
     above the prose.
   - **Expect:** the ruler contains no visible explanatory copy beyond
     the endpoint labels `Verifiable` and `Novelty`.
   - **Expect:** the marker lands on one discrete stop when placement is
     present.

4. **Typography audit**
   - Read the whole result area.
   - **Expect:** the ruler reads as subordinate to the section heading,
     not as a separate widget.
   - **Expect:** spacing, weight, and line length still feel like the
     letter-style main page, not a dashboard.

5. **Fallback tolerance**
   - Trigger another valid claim.
   - **Expect:** if placement is delayed or absent, the prose reading
     still streams correctly and the page remains coherent.

6. **No-regression audit**
   - Confirm the other two axes, quotes, verification badges,
     provenance drawer behavior, and final question still work.
   - **Expect:** Phase 4 and Phase 5 behavior remains intact.

## Pass criteria

- The app still reads as one authored page.
- The ruler lives only inside Axis I.
- No extra companion copy is visible beyond the endpoint labels.
- The ruler does not require or trigger a second model call.
- Existing instrument behavior remains intact.

## Failure handling

- If the ruler starts reading like a standalone widget, cut visible
  chrome before adjusting prose.
- If the marker logic requires a second request, remove the feature and
  redesign the contract.
- If projection testing shows the unlabeled ruler is too opaque, add the
  smallest possible interpretive hint and rerun the audit.
- If the control begins to distort the page rhythm, reduce its size
  rather than adding surrounding explanation.
