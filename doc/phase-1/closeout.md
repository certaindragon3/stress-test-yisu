# Phase 1 — Closeout

> Run with **agent-browser** against a local dev server, after
> reviewed pieces have been placed in `content/corpus/`.

## Pre-conditions

- Phase 0 closeout passes.
- `content/corpus/` contains at least three reviewed `.md` pieces,
  including the *Software 3.0 University* keynote.
- `pnpm dev` is running.

## Verification script

For each chip in `[Prompting is the new literacy., AI tutors will
replace TAs within five years., Kids shouldn't learn to code — leave
it up to AI., The essay is dead., Within ten years, AI will replace
many doctors and teachers.]`:

1. **Navigate** to `http://localhost:3000`.

2. **Click** the chip.
   - **Expect:** textarea contains the chip text.

3. **Click** **Press**. **Wait** until streaming completes.

4. **Audit the rendered page:**
   - Count blockquotes (`<blockquote>`). Call this `B`.
   - Count `✓ verified` badges. Call this `V`.
   - **Pass condition (per press):** `V === B`. Every rendered
     blockquote carries the badge. Zero unverified quotes on screen.
   - Record `(B, V)` for the rehearsal log.

5. **Open** the network panel. Find each `POST /api/verify` request.
   - **Expect:** the response body matches the on-screen rendering. If
     the API said `verified: false` for an axis, that axis must show
     either no quote block or the placeholder, never a blockquote.

After all five chips:

6. **Aggregate audit:**
   - Sum across the five presses: `total_quotes_attempted` (axes whose
     `quote` field was non-null in the streamed object) and
     `total_verified` (axes whose final on-screen quote carries the
     badge).
   - **Pass condition (run-level):** `total_verified /
     total_quotes_attempted >= 0.80`.

7. **Trust floor:** across all five presses, the count of rendered
   blockquotes lacking the `✓ verified` badge must be **exactly zero**.
   Any single violation fails the phase outright; this is the
   non-negotiable invariant from CLAUDE.md.

## Pass criteria

- All five per-press audits pass.
- Aggregate verification rate ≥ 80%.
- Trust floor: zero unverified blockquotes rendered.

## Known limitations carried forward

- Cloudflare deployment still pending (Phase 3).
- No provenance UI yet (Phase 2): the reader sees the quote and
  source, but not the surrounding corpus context.
