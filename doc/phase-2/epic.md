# Phase 2 — Provenance Drawer

> "Rationale visualization" without dashboards. For each axis, the
> reader can pull a small drawer that scrolls Yisu's original text to
> the exact paragraph the quote came from, with the quote span
> highlighted. The instrument shows its work — through typography, not
> charts.

## Decision (settled with the author, 2026-04-19)

Originally proposed as a parallel sub-page. Rejected: BUILD_SPEC §4
and CLAUDE.md invariant #4 prohibit additional routes. Instead, the
provenance view is an **inline drawer on the same page**, expanded
only on demand, hidden by default. Streaming and the final question
remain the dominant visual experience; provenance is a quiet
secondary affordance for the curious or skeptical reader.

## Goal

After a reading completes, each verified quote gains a small
small-caps affordance — `show provenance ↓` — beneath its caption.
Activating it expands a subtle inline panel that:

1. Renders the source piece's full Markdown body (or the relevant
   section if the piece is large).
2. Auto-scrolls within the panel to the matched span.
3. Highlights the matched span with the ink-green wash background.
4. Offers a `hide provenance ↑` to collapse the panel.

No new route. No icons. No animations beyond a `transition-[max-height]`
opening.

## In scope

- A new `/api/provenance` Route Handler that, given `{ source, text }`,
  returns `{ piece: string, matchOffset: number, matchLength: number }`
  by finding `text` in the named source file using the same normalized
  match as `verifyQuote()`. The response is read once per drawer open;
  no streaming.
- A `lib/provenance.ts` helper that walks `content/corpus/` to resolve
  a `source` (essay title) back to a filename and returns the file
  body. The mapping is the H1 of each file.
- A `<ProvenanceDrawer />` component used inside `<QuoteBlock />`.
  Uses `<details>`/`<summary>` for collapse semantics, styled to look
  like typeset marginalia rather than a UI control.
- Highlight rendering: split the piece body into
  `[before, match, after]`, render `match` inside a `<mark>` styled
  with `bg-ink-wash text-ink`. No HTML escapes lost.
- A `useEffect` in the drawer that scrolls the panel container so the
  `<mark>` sits at one-third from the top of the panel.

## Out of scope

- Retrieval, embedding search, or any "similar passages" feature.
  Provenance shows the exact match, nothing more. If a quote was
  fabricated and somehow passed verification (a bug to fix at the
  verifier), provenance would correctly fail to find it.
- Any visualization of the three axes themselves (no concept maps,
  radar charts, sentiment dials). Spec §4 forbids the chrome those
  would require.
- Any persistent state. Drawers reset on `Press again ↑`.

## Acceptance criteria

1. After a press completes, every axis with a `✓ verified` quote
   shows a `show provenance ↓` affordance.
2. Activating it expands an inline panel that contains the source
   piece's text and highlights the matched span in ink-green wash.
3. The matched span is visible without manual scrolling within the
   panel — the panel scrolls itself on open.
4. Activating `hide provenance ↑` collapses the panel back; expanding
   another axis's drawer does not collapse the first (independent
   `<details>` per axis).
5. The reading layout above the drawer is unchanged on initial render
   — the drawer only consumes vertical space when explicitly opened.
6. The page still has exactly one route (`/`); no new entries appear
   in `app/`'s routing tree.
7. The `Press again ↑` link still works and closes any open drawers.
8. `pnpm typecheck` and `pnpm build` continue to succeed; total
   TypeScript outside the corpus stays under ~600 lines (CLAUDE.md
   work-rule #5).

## Open questions / risks

- **Source resolution ambiguity.** If two pieces happen to contain the
  same quote text (rare for prose; common for short phrases), the
  `source` string the model produced is the tiebreaker. If the title
  in `source` does not exactly match any file's H1, `/api/provenance`
  must return a graceful error and the drawer must show
  `provenance unavailable for this source` rather than guessing.
- **Long pieces.** A 20-page essay rendered into a drawer is a wall
  of text. Mitigation: render only the paragraph containing the
  match plus three paragraphs of context on each side. Full piece is
  available behind a secondary `expand to full piece` link inside the
  drawer.
- **Stage demo cadence.** The drawer is for the curious reader, not
  the live demo. The 90-second stage performance does not open the
  drawer. Confirm with the author whether a single drawer opening is
  added to the demo script as proof-of-citation.

## Reference

- `BUILD_SPEC.md` §4 (visual constitution), §5 (interaction).
- `CLAUDE.md` invariant #4, #6 (no routes, no removed elements).
