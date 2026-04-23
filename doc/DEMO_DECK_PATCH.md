# DEMO_DECK_PATCH — Prompt for the slide agent

> A one-shot patch prompt to feed the slide agent that previously
> rendered `DEMO_DECK.md`. It applies the professor's 2026-04-23
> feedback (adjusted) to seven of the nine slides. All `forbidden_elements`,
> `layout`, `sizes`, `motion`, and archetype assignments from
> `DEMO_DECK.md` remain in force — do not regenerate them, do not
> restyle untouched slides.
>
> Usage: paste the **PROMPT** block below, as-is, into the slide agent
> that holds the current HTML deck. If the agent has lost the deck
> state, tell it to re-read `doc/DEMO_DECK.md` first, then apply this
> patch.

---

## PROMPT (paste from here to the end of this file)

You previously rendered the DKU keynote deck from `doc/DEMO_DECK.md`.
The source file has been amended. Apply the following targeted edits
and re-emit the affected slides only. Do not regenerate the deck end
to end. Do not change global tokens, layout archetypes, fonts,
colors, or motion. Do not introduce any element that the source
file's `forbidden_elements` list rejects. All nine slides must remain
in their current order.

### Invariants (do not violate)

- EB Garamond everywhere except the Slide 6 phase table, which stays
  in iA Writer Mono.
- Accent color `#1f3a2e` appears only in closer lines and at most one
  accent_line per deck; do not let it leak into titles, bodies,
  eyebrows, or attributions.
- No icons, gradients, shadows, rounded cards, dividers, backgrounds,
  logos, or page numbers — including in the slides you are
  regenerating.
- Do not alter Slide 4 (Tech, Chosen Once). It is unchanged.
- Do not alter speaker_notes on any slide you are not regenerating.

### Slide 1 — HOOK

Replace the `accent_line` with:

```
That teacher is a contract —
a standard of judgment —
written before the robot was invited in.
```

Keep the `main` block, `attribution`, and layout unchanged. The
appositive `a standard of judgment` must sit on its own line between
two em-dashes, not as a parenthetical.

### Slide 2 — THE INSTRUMENT AS A THINKING MACHINE

1. Replace the `eyebrow` with:

```
THE INSTRUMENT AS A THINKING MACHINE
```

(No em-dash between `INSTRUMENT` and `AS`.)

2. In the `body`, replace item II with:

```
II.  If institutions adopt this claim,
     which of the apprentice's foundational reps
     get skipped — and what mastery dies with them?
```

Items I, III, and the `+ one question` line stay as they are. Keep
the existing visual indentation where Roman numerals sit inline with
the first line of each item.

### Slide 3 — CONTEXT, AUTHORED FIRST

1. In the `body`, replace the four-word ladder with:

```
Direction.
Non-negotiable rules.
Verification.
Phases.
```

(`Non-negotiable rules` is one line, lowercase `r`, no italic, same
weight as the other three.)

2. Replace the `closer` with:

```
Macro judgment lives upstream of the code.
```

(Added the definite article `the` before `code`. The ink-green accent
treatment stays.)

### Slide 5 — DESIGN, DECLARED FIRST

Replace the `eyebrow` with:

```
II. DESIGN NORMS, WRITTEN AS CORE PRINCIPLES
```

Body columns and closer are unchanged.

### Slide 6 — DELIVERY, IN PHASES

1. In the monospace phase table, rename two rows:

```
2 · citation drawer (inline, not route)      ✓ shipped
6 · verifiability scale                      ← tonight, live
```

(`citation drawer` replaces `provenance drawer`; `verifiability scale`
replaces `epistemological ruler`. Column alignment must be preserved —
if the new strings are shorter than the old ones, keep the status
glyphs vertically aligned with the rest of the table by padding with
spaces, not tabs.)

2. Replace the final line of the `closer` with:

```
The spec is the signature.
```

The first two lines of the closer (`Each phase opens with an epic /
and closes with a verification script.`) remain unchanged. The
ink-green accent treatment stays.

### Slide 7 — THE NEW COLLABORATION POSTURE

Replace the `title` with:

```
Two jobs stay with the human.
Coordination. And the decision at the seam —
where human and machine meet.
```

Body and closer are unchanged. The appositive `where human and machine
meet` must sit on its own line, typographically subordinate in tempo
(same size, but the audience reads it as a continuation, not as a new
clause — this is carried by the em-dash and the line break).

### Slide 8 — AUDIT

Replace the `accent_line` with:

```
A verification rule gated the render.
The system enforced academic integrity —
not the operator.
```

Three lines, broken as shown. `academic integrity` must not be
emphasized with accent color, bold, or italic — typography alone
carries it. The `main` block stays as it was.

### Slide 9 — CLOSE

In `main`, change exactly one word: `leaving` → `abandoning`. The
rest of the slide (`It is designing the workflow so carefully that
you only have to re-enter at the broken seams.`) is unchanged. Line
breaks and pacing stay identical.

### After applying

- Re-emit only the seven regenerated slides (1, 2, 3, 5, 6, 7, 8, 9
  — all except 4).
- Confirm, at the end of the output, that the deck still contains
  exactly nine slides in original order, that no forbidden element
  was introduced, and that accent color appears only in closer lines
  and Slide 1's accent_line.
- Do not add a changelog slide. Do not add a cover slide. Do not
  announce the patch on any slide.

(End of prompt.)
