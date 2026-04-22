# Phase 5 — Motion Choreography

> Give the instrument temporal tact. The page should no longer sit
> inert between press and response, and secondary reveals should move
> with authored restraint rather than default browser mechanics.

## Status

Approved on 2026-04-21. Implemented locally and awaiting formal
closeout.

## Goal

The instrument remains a book, not a product demo, but it gains a
composed motion language: immediate tactile feedback on press, a
typographic loading cadence during the click-to-first-token gap,
non-linear reveals for axis text, verified quotations, and the final
question, plus a calmer and better-shaped open/close motion for the
provenance drawer. The work must make the interface feel more alive
without introducing spinners, dashboard chrome, a second route, or a
dependency-driven animation system.

## Research basis

This phase is grounded in a small set of external motion principles,
all filtered through BUILD_SPEC.md §4's "book, not dashboard"
constitution:

- [Apple Human Interface Guidelines — Motion](https://developer.apple.com/design/human-interface-guidelines/motion):
  add motion purposefully, make it optional, keep feedback brief and
  precise, and avoid making frequent interactions feel burdened by
  unnecessary animation.
- [Material Design — Duration & easing](https://m1.material.io/motion/duration-easing.html):
  desktop motion should stay short, durations should scale with
  distance and complexity, and asymmetrical easing reads more natural
  than mechanical symmetry.
- [MDN — `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/%40media/prefers-reduced-motion):
  non-essential motion must reduce or disappear when the operating
  system requests it.
- [web.dev — How to create high-performance CSS animations](https://web.dev/animations-guide/):
  default to `transform` and `opacity`, keep animation off layout and
  paint-heavy properties where possible, and use `will-change`
  sparingly.
- [MDN — `Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate):
  if CSS alone cannot give the provenance drawer a convincing open and
  close path, the native Web Animations API is available without
  adding a dependency.

These sources are implementation guardrails, not aesthetic authorities.
The authored object remains this repository's own visual constitution.

## Proposed decision

The BUILD_SPEC.md rule "No spinner anywhere in the application —
streaming is the loading state" stands.

Phase 5 therefore does **not** introduce a spinner, skeleton, shimmer,
or progress bar. Instead, the loading state becomes a typographic
bridge made from the interface's existing language: Roman numerals,
small caps, ink rules, whitespace, and restrained motion. It exists
only to carry the click-to-first-token gap and yields immediately once
real streamed text begins.

## In scope

- Define a small motion token set in CSS custom properties for
  duration, easing, distance, and reduced-motion overrides.
- Introduce an explicit motion-state model for the press lifecycle,
  likely `idle -> arming -> waiting -> streaming -> complete`, so the
  interface can choreograph the network gap instead of remaining
  visually inert.
- Add immediate tactile feedback to the Press button, example chips,
  and textarea lock state so the page acknowledges the action before
  the stream has meaningfully begun.
- Add a pre-stream waiting cue that uses only existing typographic
  ingredients. It should appear only while waiting for the first real
  content and should yield cleanly to streamed prose.
- Give each axis a restrained entrance pattern: header anchors first,
  prose settles in, verified quotation enters only after verification,
  and the final question receives the most spacious timing of the page.
- Replace the provenance drawer's current linear-feeling open with a
  shaped motion path. If height must be measured, use a tiny native
  `Element.animate()` helper rather than a library.
- Ensure all motion respects `prefers-reduced-motion: reduce`,
  degrading to immediate or opacity-only changes where appropriate.
- Keep the implementation inside the existing stack: CSS/Tailwind,
  minimal React state, and native browser primitives only.

## Out of scope

- Spinners, skeletons, progress bars, shimmers, Lottie files, particle
  effects, decorative cursors, ambient background animation, or any
  other ornamental loader pattern.
- `framer-motion` or any new dependency.
- Rewriting the authored system prompt or changing the instrument's
  verbal register.
- Changing EB Garamond, the ink palette, the `max-w-2xl` container,
  the blockquote structure, the `✓ verified` badge, or the final
  question's generous `py-32` spacing.
- New routes, navigation, settings, history, or any second-screen
  behavior.
- Using motion to disguise latency. Streaming must still begin as soon
  as it can; animation may bridge the wait, not conceal buffering.

## Acceptance criteria

1. Clicking **Press** produces deliberate visual feedback immediately,
   before the first streamed prose arrives.
2. If streamed content has not appeared yet, a typographic waiting cue
   is visible. It resolves smoothly once real content begins
   streaming.
3. Axis headers, prose, verified quotations, the provenance drawer,
   and the final question share a consistent motion language with
   non-linear easing. Opening motions are slightly longer than closing
   motions.
4. No spinner, skeleton, progress bar, decorative icon, or additional
   route is introduced.
5. With `prefers-reduced-motion: reduce`, non-essential translation or
   scale motion is removed or materially reduced, and the reading
   remains fully comprehensible.
6. The provenance drawer still auto-scrolls correctly to the
   highlighted passage after its new opening motion completes.
7. `pnpm typecheck` and `pnpm build` succeed, and the phase does not
   regress Phase 4's latency or trust-floor behavior.
8. The implementation stays within the existing stack and does not add
   an animation library.

## Open questions / risks

- How much movement can the Press button carry before a frequently
  repeated action starts feeling mannered rather than precise?
- Should the waiting cue yield on first byte, first partial prose
  token, or first completed axis fragment? The handoff point affects
  whether the page feels composed or jumpy.
- The provenance drawer is the one place where JavaScript-driven motion
  may be justified. If a WAAPI path proves brittle across browsers,
  fall back to a simpler CSS shape rather than adding a dependency.
- Projector refresh and auditorium lag can make subtle motion read
  slower than it does on a laptop. Re-test the chosen timing curves on
  the actual demo machine before shipping.
- Reduced-motion mode is not optional polish. If the default motion
  language relies on large vertical travel or scale to feel good, the
  phase should be re-scoped.

## Reference

- `BUILD_SPEC.md` §4, §5, §6
- `CLAUDE.md` work rules #4, #6, #7
- `doc/phase-2/epic.md`
- `doc/phase-4/epic.md`
