# Phase 3 — Closeout

> Run with **agent-browser** against the **production** URL,
> 24 hours before the panel, from the venue network.

## Pre-conditions

- `https://stress-test.jiesen-huang.com` resolves and serves over
  HTTPS.
- The demo laptop is on the venue Wi-Fi (or, failing that, the
  hotspot intended for the panel).
- The fallback video is at `~/Demo/stress-tester-fallback.mp4` and
  the keyboard shortcut is bound.

## Verification script

1. **Time-to-first-paint:** navigate to
   `https://stress-test.jiesen-huang.com`. Use the browser's
   Performance API (`performance.getEntriesByType("navigation")[0]`)
   to read `domContentLoadedEventEnd - startTime`.
   - **Expect:** value ≤ 1500ms.

2. **Initial render audit:**
   - **Expect:** EB Garamond renders (no Times New Roman fallback
     visible by reading `getComputedStyle` on the title).
   - **Expect:** the wordmark, title, textarea, five chips, and Press
     button render within one viewport.

3. **For each of the five chip claims** (BUILD_SPEC §11):
   1. Click the chip; assert textarea contains the chip text.
   2. Click **Press**; record the timestamp.
   3. Wait for streaming to finish; record the elapsed time.
      - **Expect:** elapsed time ≤ 20s.
   4. Audit the page:
      - Count `<blockquote>` and `✓ verified` badges. **Expect:**
        equal counts. Zero unverified blockquotes.
      - **Expect:** the final question is exactly one sentence.
   5. Open one provenance drawer; verify highlight scroll is correct
      (Phase 2 step 4 condition).
   6. Click `Press again ↑`.

4. **Network egress audit:** in DevTools, filter requests by
   `generativelanguage.googleapis.com`.
   - **Expect:** at least one request per press, none failing.
   - If any request 4xx/5xx, escalate immediately — venue firewall
     may be blocking.

5. **Fallback drill:**
   - Press the bound keyboard shortcut.
   - **Expect:** the fallback video begins playing full-screen within
     1 second, audio muted.
   - Watch through to the end (90s); **expect** clean playback with
     no buffering on the venue network (the file is local).

6. **Visibility audit ("scroll test at 10 feet"):**
   - Step ten feet back from the demo laptop.
   - Read aloud the title, the section headers, and the final
     question.
   - **Expect:** every line readable at this distance (BUILD_SPEC
     §12.5).

## Pass criteria

- All six steps pass on the venue network.
- Every per-press audit passes.
- The fallback drill completes in under 1 second to first frame.

## Known limitations carried forward

- None at this point — Phase 3 is the final pre-demo gate. Anything
  outstanding is a stage risk, not a phase carry.

## On the day

- Run a single dry press from the laptop 30 minutes before the
  panel begins.
- If any quote on stage lacks `✓ verified` — pause, kill the
  session, trigger fallback. Do not narrate the failure; the video
  carries the demo.
