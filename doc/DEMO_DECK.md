# DEMO_DECK — Orchestrator

> One-shot specification for the DKU International Education Innovation
> Forum keynote demo, authored by Jiesen Huang, delivered in ~10 minutes.
> This document is written to be fed in a single pass to an HTML slide
> agent. The agent should render nine slides following the visual
> tokens, layout archetypes, and per-slide content declared below.

## How to use this file

Feed the whole file, unedited, to the slide agent. The agent should:

1. Emit a single self-contained HTML deck (reveal.js, marp-html, or
   hand-rolled sections — agent's choice).
2. Follow the visual tokens exactly. The deck must be visually
   continuous with the live web instrument that will be shown between
   slides, whose palette and type are the same.
3. Treat `speaker_notes` as non-rendered metadata. They exist for the
   speaker's rehearsal, not the audience.
4. Preserve line breaks inside `main`, `body`, and `excerpt` blocks.
   Typographic rhythm is part of the content.

## Global visual tokens

```yaml
background: "#FFFFFF"          # pure white, not cream
ink:        "#111111"          # primary body text
accent:     "#1f3a2e"          # ink green, used sparingly
wash:       "#f4f6f3"          # almost-white green; avoid unless necessary
muted:      "#6b7a72"          # small attributions only

font_primary: "EB Garamond, Georgia, serif"
font_cjk:     "Noto Serif SC, serif"       # only if Chinese text appears
font_mono:    "iA Writer Mono, SF Mono, Menlo, monospace"  # phase table, nothing else

sizes:
  main:        60pt        # slide 1, 8, 9
  title:       44pt
  body:        28pt
  eyebrow:     22pt        # uppercase, letter-spacing 0.08em
  closer:      22pt        # ink green, roman (not italic)
  attribution: 18pt        # muted color
  min:         20pt        # nothing smaller than this, ever

layout:
  aspect:        "16:9"
  resolution:    "1920x1080"
  column_max:    "880px"
  side_margin:   "120px"   # minimum on each side
  vertical_rhythm: "1.35"  # line-height

motion:
  transition:   "fade 200ms"
  ease:         "cubic-bezier(0.2, 0.8, 0.2, 1)"
  forbidden:    "slide, zoom, wipe, flip, 3d, parallax"

forbidden_elements:
  - icons
  - illustrations
  - gradients
  - shadows (box-shadow, text-shadow)
  - rounded cards, pill buttons, chips
  - background patterns or textures
  - page numbers, progress bars, logos
  - decorative rules other than the single ink-green 2px line
    allowed inside the blockquote archetype
```

## Global rules

- All hierarchy is produced by size, weight, and whitespace. Never by
  color blocks, boxes, or dividers.
- The accent color is reserved for closer lines only. Title and body
  stay in ink. An accent word inside body is allowed once per slide at
  most.
- Every slide is centered vertically inside its column. No top-left
  dashboards, no header bars.
- No slide may contain more than ~50 words excluding attribution.
- No slide may be below 20pt in any part.
- The deck must read legibly from the back of a 200-person hall.

## Layout archetypes

### A. `solo_sentence`
A single centered block. Used for hook, audit, close.

- Fields: `main` (required), `accent_line` (optional, ink green),
  `attribution` (optional, muted, right-aligned below).
- No eyebrow. No title. No body.

### B. `eyebrow_title_body_closer`
The workhorse. Used for the thinking-machine slide and the operator
posture slide.

- Fields: `eyebrow` (uppercase, small), `title`, `body` (free-form
  prose, numbered lists, or labelled lines), `closer` (ink green).
- Body may span multiple paragraphs but keeps to the column max.

### C. `eyebrow_title_twocolumn_closer`
Two equal columns labelled `picked` / `refused` (Slide 4, 5) or used
for the phase table (Slide 6 uses a variant — see inline note).

- Fields: `eyebrow`, `title`, `picked` (left column), `refused` (right
  column), `closer`.
- Each column is a list of short lines. No bullets — indentation and
  whitespace carry the list.
- For Slide 6 only, the columns collapse into a single monospace
  table block; the archetype still applies, but `picked` holds the
  table and `refused` is omitted.

## Speaking arc (not rendered — for rehearsal only)

```
0:00–1:00   Act I   · Slide 1, 2                  (hook + frame)
1:00–2:30   Act II  · [live instrument, press 1]  (no slides)
2:30–4:20   Act III · Slide 3, 4, 5, 6            (context engineering)
4:20–7:40   Act IV  · Slide 7 → [live build]      (orchestrator posture)
                      Mid-build: speaker opens doc/phase-6/epic.md
                      and CLAUDE.md in the editor as evidence.
7:40–9:10   Act V   · [live instrument, press 2]  (Yisu selects a chip)
9:10–10:00  Act VI  · Slide 8, 9                  (audit + close)
```

---

## Slide 1 — HOOK

```yaml
layout: solo_sentence
duration: 22s
content:
  main: |
    The robot can make the broth now.

    The question that has not been asked is:
    who teaches the robot to know whether the broth is good?
  accent_line: |
    That teacher is a contract —
    a standard of judgment —
    written before the robot was invited in.
  attribution: after Yisu Zhou, Software 3.0 University
speaker_notes: |
  Open cold. Read the three lines slowly. Let the question hang.
  The accent line is the answer — read it once, do not explain it.
  Do not say the word "orchestration" yet. Let the contract keyword
  seed itself. The appositive "a standard of judgment" is there to
  prevent the educator ear from hearing "contract" as a legal
  document; it is not a pivot to be unpacked further.
```

---

## Slide 2 — THE INSTRUMENT AS A THINKING MACHINE

```yaml
layout: eyebrow_title_body_closer
duration: 40s
content:
  eyebrow: THE INSTRUMENT AS A THINKING MACHINE
  title: |
    Yisu Zhou asks three questions
    of any claim about AI and education.
  body: |
    I.   Is this claim on the side of knowledge
         where a machine can judge,
         or on the side where only humans can?
         And does it smuggle one for the other?

    II.  If institutions adopt this claim,
         which of the apprentice's foundational reps
         get skipped — and what mastery dies with them?

    III. Whose professional turf does this claim annex,
         and who gets silenced if it is accepted?

    + one question, in Yisu's register,
      that the claim was trying not to have asked of it.
  closer: |
    These are the frame. Everything tonight
    presses a claim through these three — and
    then asks the question.
speaker_notes: |
  This is the heaviest slide of the deck and it is supposed to be.
  Read the three questions slowly enough that an educator in the room
  can locate her own discipline inside one of them. The "+ one
  question" line is not a footnote — it is the instrument's fourth
  move, and it will matter in Act II. Point to it briefly.
render_hint: |
  The three numbered items should sit as visually indented paragraphs,
  not bullet list rows. Roman numerals stay inline with the first line
  of each item. The "+ one question" line sits with a clear vertical
  gap above it, so it reads as a distinct fourth beat, not as a sub-item
  of III.
```

---

## [LIVE — Press 1]

```yaml
no_slide: true
duration: 90s
action: |
  Switch to the browser running the AI Discourse Stress-Tester
  (production URL). Click a pre-selected chip. Let the reading
  stream. Do not narrate the output while it is streaming.
  When it finishes, point at the verified badges and the blockquote
  border once, then return to slides.
```

---

## Slide 3 — CONTEXT, AUTHORED FIRST

```yaml
layout: eyebrow_title_body_closer
duration: 18s
content:
  eyebrow: BEFORE THE BUILD
  title: |
    The real work was not prompting.
    It was setting the context.
  body: |
    Direction.
    Non-negotiable rules.
    Verification.
    Phases.

    The agent could execute
    because those standards were already written.
  closer: |
    Macro judgment lives upstream of the code.
speaker_notes: |
  This is the hinge into Act III.
  If you want to say the term, say it once:
  "In current AI-builder language, this is context engineering."
  Then translate it immediately:
  I set direction, standards, and phase contracts before the agent moved.
```

---

## Slide 4 — TECH, CHOSEN ONCE

```yaml
layout: eyebrow_title_twocolumn_closer
duration: 30s
content:
  eyebrow: I. TECHNICAL CHOICES, MADE BEFORE CODE
  title: A small stack, chosen to stay small.
  picked: |
    Next.js 15
    TypeScript
    Tailwind v4
    Vercel AI SDK
    Gemini 2.5 Pro
    Cloudflare Workers
  refused: |
    no state-management library
    no icon library
    no component library beyond shadcn primitives
    no database, no ORM
    no auth, no accounts
    no analytics
  closer: Dependencies were a cap — not a budget.
speaker_notes: |
  The "refused" column is the point. Read two or three of its lines
  aloud. The audience should feel that refusal is the act of design,
  not a lack of features.
render_hint: |
  Columns are labelled with a small uppercase word above each
  ("PICKED" / "REFUSED") in muted color, 20pt. No vertical divider
  between columns — whitespace carries the split.
```

---

## Slide 5 — DESIGN, DECLARED FIRST

```yaml
layout: eyebrow_title_twocolumn_closer
duration: 30s
content:
  eyebrow: II. DESIGN NORMS, WRITTEN AS CORE PRINCIPLES
  title: |
    One screen. One voice.
    One model call per press.
  picked: |
    container : max-w-2xl, centered
    typeface  : EB Garamond + Noto Serif SC
    color     : white + ink green #1f3a2e
    accent    : single, used sparingly
    motion    : 160 / 260 / 420 ms, one ease curve
  refused: |
    icons
    illustrations
    gradients
    shadows
    cards
    background patterns
    dashboard chrome
  closer: |
    Typography is the design.
    Everything else is temptation.
speaker_notes: |
  This slide is where the audience notices the deck itself obeys
  the same rules as the instrument they are about to see in build.
  If someone laughs quietly at "temptation", that is the right
  response. Do not explain.
```

---

## Slide 6 — DELIVERY, IN PHASES

```yaml
layout: eyebrow_title_twocolumn_closer   # variant — single column table
duration: 30s
content:
  eyebrow: III. THE PATH, CUT INTO PHASES
  title: |
    Seven phases. Each with a contract.
  picked: |
    0 · scaffold                                 ✓ shipped
    1 · corpus landing                           · in review
    2 · citation drawer (inline, not route)      ✓ shipped
    3 · demo readiness                           · in progress
    4 · performance hardening                    ✓ shipped
    5 · motion choreography                      ✓ shipped
    6 · verifiability scale                      ← tonight, live
  refused: ""   # intentionally omitted; this slide uses a single column
  closer: |
    Each phase opens with an epic
    and closes with a verification script.
    The spec is the signature.
speaker_notes: |
  This is the setup for Act IV. The phrase "← tonight, live" on the
  phase-6 row should be subtle, not highlighted with color. The
  audience will not recognize it as a cue until the build begins.
render_hint: |
  Render the `picked` block in the mono font (iA Writer Mono) at
  24pt so that the phase columns align. The rest of the deck stays
  in EB Garamond. This is the only place mono is permitted.
  Status glyphs: "✓" for shipped, "·" for in-progress/in-review,
  "←" for tonight. No color on glyphs — they stay ink.
```

---

## Slide 7 — THE NEW COLLABORATION POSTURE

```yaml
layout: eyebrow_title_body_closer
duration: 20s
content:
  eyebrow: THE NEW COLLABORATION POSTURE
  title: |
    Two jobs stay with the human.
    Coordination. And the decision at the seam —
    where human and machine meet.
  body: |
    Everything else — the typing, the lookup,
    the drafts, the wiring, the tests —
    goes to the agent.

    For the next three minutes,
    I will not type. I will guard.
  closer: Orchestration begins now.
speaker_notes: |
  This slide is the gate into live build. End on "I will guard"
  and cut to the editor. Do not finish the closer line aloud —
  let the slide say it while you switch the screen.
```

---

## [LIVE — Build Phase 6]

```yaml
no_slide: true
duration: 180s
action: |
  Switch to the editor + terminal + browser layout.
  Open doc/phase-6/epic.md in the editor; scroll to "Acceptance
  criteria" and hold for 5 seconds so the audience can read the
  four lines. Then open CLAUDE.md; scroll to "Invariants a Claude
  Code agent must respect"; hold for 3 seconds.
  Hand the task to Claude Code with a one-line instruction derived
  from the acceptance criteria. Narrate only at seams:
    - when the agent proposes a boundary-crossing change, say
      "the spec forbids that — pulling it back";
    - when verification fails (if it does), do not fix the code;
      correct the prompt contract and press again;
    - at completion, point at the five-stop ruler rendering on
      Axis I. Do not celebrate.
  If the rehearsed small failure does not occur naturally,
  do not fabricate one. Say: "this build obeyed the contract
  tonight. The version I rehearsed last night did not —
  that is where the seam was, and that is where I came back in."
```

---

## [LIVE — Press 2, Yisu's chip]

```yaml
no_slide: true
duration: 90s
action: |
  Switch back to the instrument's main page. Invite Yisu to select
  one of the pre-authored chips. Press. Let the reading stream.
  Stay silent. Let Yisu react first. Do not rescue a weak reading —
  a weak reading is itself a demonstration of the framework's
  discipline, because it was still produced under contract.
```

---

## Slide 8 — AUDIT

```yaml
layout: solo_sentence
duration: 20s
content:
  main: |
    Every quotation you heard tonight was verbatim.
    If it was not verbatim, it was not shown.
  accent_line: |
    A verification rule gated the render.
    The system enforced academic integrity —
    not the operator.
speaker_notes: |
  Read the main line plainly. Let the accent line sit on screen
  for a beat of silence before moving on. The phrase "academic
  integrity" is the one the room is built to hear — do not rush
  past it. This is also the moment where the audience remembers
  that "contract," planted in Slide 1, has now been rendered as a
  machine-readable rule.
```

---

## Slide 9 — CLOSE

```yaml
layout: solo_sentence
duration: 30s
content:
  main: |
    Orchestration is not abandoning the work.

    It is designing the workflow so carefully
    that you only have to re-enter
    at the broken seams.
speaker_notes: |
  Read slowly. No attribution. No "thank you". No Q&A prompt.
  Three seconds of silence after the last word, then step back
  from the lectern. The slide stays on screen during the silence.
```

---

## Deck-level acceptance (for the slide agent)

A correct render satisfies all of the following:

1. Nine slides, in the order above, with no extra title slide, no
   agenda slide, no thank-you slide, no Q&A slide.
2. White background on every slide. No gradient, no texture, no
   background image.
3. EB Garamond on every text element except the Slide 6 phase table,
   which uses iA Writer Mono. No other fonts anywhere.
4. Accent ink-green (`#1f3a2e`) appears only in `closer` lines and,
   at most, one `accent_line`. It does not appear in titles, body
   text, eyebrows, or attributions.
5. No icons, illustrations, gradients, shadows, rounded cards,
   dividers, backgrounds, logos, or page numbers anywhere.
6. Every slide is vertically centered inside a column capped at
   880px with minimum 120px side margins.
7. Transitions between slides are fade 200ms only.
8. `speaker_notes` blocks are not rendered on the slides themselves,
   but are preserved in the deck's speaker-notes metadata if the
   chosen framework supports it (e.g. reveal.js `<aside
   class="notes">`).

---

*Authored 2026-04-22 by Jiesen Huang. Intellectual frame: Yisu Zhou,
used with permission. This deck is for the DKU International Education
Innovation Forum, 2026.*
