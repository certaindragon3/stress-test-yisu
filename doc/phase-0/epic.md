# Phase 0 — Scaffold

> Stand the instrument up end-to-end with an empty corpus, so that the
> moment a reviewed Yisu piece lands in `content/corpus/`, the demo runs
> for real with zero further wiring.

## Goal

A single press from the example chips produces a four-part streaming
reading on the screen, the API talks to Gemini 3.1 Pro, and the
verification pathway is in place even though it currently returns
`unverified` for everything (because the corpus is empty). No
fabricated quote can ever reach the page — the system prompt and
`verifyQuote()` together guarantee this.

## In scope

- `lib/system-prompt.ts` reproducing the authored prompt verbatim from
  CLAUDE.md, plus `buildSystemPrompt(corpus)` to wrap the corpus.
- `lib/corpus.ts` reading every `.md` under `content/corpus/` at module
  load time. Empty directory yields an empty string.
- `lib/schema.ts` (Zod) for the four-part `Reading`.
- `lib/verify.ts` with whitespace-normalized substring match.
- `app/api/press/route.ts` calling `streamObject` with
  `gemini-3.1-pro-preview`.
- `app/api/verify/route.ts` returning `{ verified: boolean }`.
- `app/page.tsx` with textarea, five chip claims (per BUILD_SPEC §11),
  Press button, four streamed sections, `Press again ↑` link.
- Four components under `components/`: `claim-input`, `axis-section`,
  `quote-block`, `final-question`.
- Layout reset to EB Garamond + ink green + white. No theme toggle, no
  navbar, no footer.
- All UI radii unified to `rounded-none` to match the book aesthetic.

## Out of scope

- Any reviewed Yisu text in `content/corpus/`. The corpus stays empty
  through Phase 0; that is Phase 1's job.
- Cloudflare deployment. Local Node runtime is sufficient for Phase 0.
- Provenance drawer, retrieval, or any visualization of rationale.

## Acceptance criteria

1. `pnpm typecheck` and `pnpm build` both succeed.
2. With `GEMINI_API_KEY` set in `.env.local`, `pnpm dev` starts and
   `http://localhost:3000` renders the empty form.
3. Clicking any chip populates the textarea with the chip text.
4. Pressing the Press button starts a stream within 3 seconds and
   completes within 30 seconds for the chip claims.
5. The four section headers (`I.`, `II.`, `III.`, `IV.`) appear in
   order. Prose streams into each.
6. Because the corpus is empty, no `✓ verified` badge appears anywhere
   on the page across five rehearsal presses. Quote blocks either
   render as `unverified — not rendered` or do not render at all.
7. After streaming completes, the `Press again ↑` link appears and
   resets the form when clicked.
8. There is exactly one route (`/`), one API endpoint pair
   (`/api/press`, `/api/verify`), and one model call per press.

## Open questions / risks

- `gemini-3.1-pro-preview` may change behavior or be sunset before the
  forum. If structured output regresses, fall back to `gemini-2.5-pro`
  by editing `MODEL_ID` in `app/api/press/route.ts`.
- The `runtime = "nodejs"` choice on the API routes is incompatible
  with `@cloudflare/next-on-pages`. Phase 3 must convert the corpus to
  a build-time-generated TypeScript string and switch to Edge runtime.

## Reference

- `BUILD_SPEC.md` §1–§10 (the engineering spec)
- `CLAUDE.md` (the authored manual and full system prompt)
