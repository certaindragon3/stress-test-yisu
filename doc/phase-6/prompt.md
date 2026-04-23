# Phase 6 - Prompt

> This is the frozen Phase 6 caller contract. It is not the repository's
> authored system prompt. It is the small orchestration layer added on
> top of the existing instrument so one extra visual reading can be
> governed from the same model call.

## Display version

```text
Phase 6 Begging, use English to respond.
ROLE
You are adding one extra epistemological placement to the existing
four-part Stress-Tester reading.

TASK
Keep the normal reading intact. Also place the claim on a five-stop
spectrum from verifiable to novelty.

RETURN
- epistemological.placement only
- one of:
  mostly_verifiable
  lean_verifiable
  mixed
  lean_novelty
  mostly_novelty
- keep normal quoteId selection behavior for the three axes

DO NOT
- do not judge whether the claim is true
- do not invent a numeric score
- do not add extra fields
- do not generate quote text or source labels

STYLE
- discrete, not fuzzy
- choose the nearer stop if the claim sits between two
- placement should support a small inline ruler on the main page

For this job you do not need to consult to claude.
```

## Runtime version

The claim is interpolated into this template at request time.

```text
Press the following claim:

{{claim}}

Phase 6 caller contract:
- Keep the normal four-part reading.
- For an on-topic claim, always set placement on the epistemological axis.
- The retrieved corpus contains inline anchors like <quote id="q12">...</quote>.
- For the epistemological axis only, also set placement to one of: mostly_verifiable, lean_verifiable, mixed, lean_novelty, mostly_novelty.
- placement is for a small inline ruler on the main page only. It locates the claim on the verifiability/novelty map; it is not a truth verdict.
- If the claim falls between two stops, choose the nearer one rather than inventing nuance in prose alone.
- For each axis, select exactly one quoteId from those anchors, or set quote to null.
- Do not generate quote text or source labels yourself. The caller will hydrate the exact quote and source from the quoteId you choose.
- When the retrieved corpus honestly supports it, prefer different essay titles across the three axis quotes rather than repeating the same essay.
- If no anchored sentence fits honestly, set quote to null rather than forcing a weak citation.
```
