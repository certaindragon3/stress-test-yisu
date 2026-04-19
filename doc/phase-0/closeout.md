# Phase 0 — Closeout

> Run with **agent-browser** against a local dev server. The agent
> reads each numbered step, performs the action, and asserts the
> expected result. A single failed assertion fails the phase.

## Pre-conditions

- `GEMINI_API_KEY` is set in `.env.local`.
- `pnpm dev` is running and `http://localhost:3000` returns 200.
- `content/corpus/` is empty except for `.gitkeep`. (This is correct
  for Phase 0; Phase 1 changes it.)

## Verification script

1. **Navigate** to `http://localhost:3000`.
   - **Expect:** the small-caps wordmark "A thinking instrument, after
     Yisu Zhou" and the title "The AI Discourse Stress-Tester".
   - **Expect:** an empty `<textarea>` and five chip buttons whose
     labels exactly match `BUILD_SPEC.md` §11.
   - **Expect:** the **Press** button is disabled.

2. **Click** the chip *"Prompting is the new literacy."*
   - **Expect:** the textarea now contains exactly that string.
   - **Expect:** the **Press** button becomes enabled.

3. **Click** the **Press** button.
   - **Expect:** within 3 seconds, a streaming response begins to
     appear under a horizontal rule below the form.
   - **Expect:** the four section headers — `I. The Epistemological
     Axis`, `II. The Mastery Pipeline`, `III. The Jurisdictional
     Move`, `IV. A Question Yisu Might Ask in Response` — appear in
     this order.

4. **Wait** for streaming to finish (at most 30 seconds).
   - **Expect:** the `Press again ↑` link appears at the bottom.
   - **Expect:** the page contains **zero** elements with the text
     `✓ verified`. (Corpus is empty; no quote can pass verification.)
   - **Expect:** any rendered quote block carries either the placeholder
     `unverified — not rendered` or no quote block at all. There is no
     blockquote rendered without a verified badge.
   - **Expect:** the final question is exactly one sentence, in italics,
     ink-green, occupying roughly the viewport height.

5. **Click** `Press again ↑`.
   - **Expect:** the textarea clears, the four sections disappear, the
     page returns to its initial state.

6. **Visual audit (one screenshot):**
   - All radii in the input cluster (textarea, chips, button) are
     square (`border-radius: 0`).
   - Body text is EB Garamond, not a sans-serif fallback.
   - Background is pure white, accent is ink green `#1f3a2e`.

## Pass criteria

All six steps pass without manual intervention. Network panel shows
exactly **one** request to `/api/press` per press, and **three**
requests to `/api/verify` (one per axis quote text) — even though all
return `{verified: false}` for now.

## Known limitations carried forward

- No quotation will display in this phase by design. Phase 1 lands the
  corpus and turns `✓ verified` on.
- Edge / Cloudflare deployment is not yet wired. Local Node only.
