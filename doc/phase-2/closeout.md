# Phase 2 — Closeout

> Run with **agent-browser** against a local dev server, after the
> provenance drawer is implemented.

## Pre-conditions

- Phase 1 closeout passes (corpus produces verified quotes).
- `pnpm dev` is running.
- `http://localhost:3000` is reachable.

## Verification script

1. **Navigate** to `http://localhost:3000`.
   - **Expect:** initial form renders unchanged. No new chrome.
   - **Expect:** `app/` directory still has exactly one route entry
     for the page (`/`). Verify by reading the Network panel after
     interaction: only `/`, `/api/press`, `/api/verify`, and
     `/api/provenance` URLs appear.

2. **Click** the chip *"Prompting is the new literacy."* and press
   **Press**. **Wait** for streaming to finish.

3. **Inspect the reading:**
   - For each axis with a `✓ verified` badge, expect a sibling
     `show provenance ↓` element directly under the source caption.
   - For axes without a verified quote, expect **no** `show
     provenance` affordance.

4. **Click** the first `show provenance ↓`.
   - **Expect:** an inline panel expands beneath that axis. The page
     above does not reflow (sections I, II, III, IV stay in order).
   - **Expect:** the panel contains the full source piece body (or
     the windowed view if the piece is large).
   - **Expect:** within the panel, exactly one `<mark>` element wraps
     the quote text. The `<mark>` has the ink-green wash background.
   - **Expect:** the `<mark>` is in view inside the panel without
     manual scrolling — its bounding rect's `top` is between 10% and
     50% of the panel's visible height.
   - **Expect:** the affordance label has changed to
     `hide provenance ↑`.

5. **Click** `show provenance ↓` on a second axis (without closing
   the first).
   - **Expect:** the second drawer opens; the first stays open.
   - **Expect:** each drawer is scrolled to its own match.

6. **Click** `hide provenance ↑` on the first axis.
   - **Expect:** the first panel collapses; the second remains open.

7. **Click** `Press again ↑`.
   - **Expect:** all drawers close; the form resets.

8. **Negative test (provenance unavailable):**
   - Manually trigger a verify scenario where the source string is
     malformed — e.g., POST `/api/provenance` with
     `{ "source": "Nonexistent Essay", "text": "anything" }`.
   - **Expect:** HTTP 200 with a body that the drawer can render as
     `provenance unavailable for this source`. No 500.

## Pass criteria

- All eight steps pass.
- Network panel never shows a request to a route outside the four
  endpoints listed in step 1.
- Visual audit: opening and closing drawers does not introduce any
  layout shift in sections I–IV above.

## Known limitations carried forward

- The drawer is read-only. It is not a corpus browser; it shows only
  the piece a quote came from, windowed around the match.
- Cloudflare deployment still pending (Phase 3).
