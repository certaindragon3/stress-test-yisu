# Phase 3 — Demo Readiness

> Take the instrument from "works on my laptop" to "survives the DKU
> auditorium". Cloudflare-deployed, latency-tested, fallback-armed.

## Goal

`https://stress-test.jiesen-huang.com` loads and responds to a press
within the latency budget set by BUILD_SPEC §12, on the venue network,
24 hours before the panel. A single-keystroke fallback video sits on
the demo laptop in case the live instrument fails on stage.

## In scope

- Build-time corpus baking. A new script `scripts/bundle-corpus.mjs`
  walks `content/corpus/*.md`, concatenates them into a single
  TypeScript module `lib/corpus.generated.ts`, and writes a
  `CORPUS_SOURCES` map (filename → essay-title) for `/api/provenance`.
  `lib/corpus.ts` re-exports from the generated file. `pnpm build`
  runs the bundler in a `prebuild` hook.
- Switch `app/api/press/route.ts` and `app/api/verify/route.ts` to
  `export const runtime = "edge"` once the corpus is no longer
  filesystem-loaded. Same for `/api/provenance`.
- `next.config.mjs`: integrate `@cloudflare/next-on-pages` per
  BUILD_SPEC §13.
- `wrangler.toml` checked in with the project name and the
  `GEMINI_API_KEY` declared as a required env var (value not
  committed).
- Cloudflare Pages project created. `stress-test.jiesen-huang.com`
  bound to `stress-tester.pages.dev` via the dashboard.
- Pre-recorded fallback video at
  `~/Demo/stress-tester-fallback.mp4`, 90 seconds, 1080p, with audio
  off. Triggered by a single keystroke (e.g. a Keyboard Maestro macro
  bound to `⌃⌥⌘F`).

## Out of scope

- Analytics, telemetry, or logging beyond Cloudflare's defaults. No
  user identification, no event tracking — there are no users.
- Caching of model responses. Each press is a fresh reading; caching
  would betray the "one press, one reading" commitment.
- Custom error pages. A 500 falls through to the framework default;
  the fallback video is the real recovery path.

## Acceptance criteria

1. `pnpm build && pnpm dlx @cloudflare/next-on-pages` succeeds and
   `wrangler pages deploy .vercel/output/static` deploys cleanly.
2. `https://stress-test.jiesen-huang.com` returns 200 and renders the
   form within 1.5s on the venue network (BUILD_SPEC §12.1), measured
   24 hours before the panel.
3. Pressing any of the five chips on production produces a complete
   reading in under 20 seconds, streaming throughout (BUILD_SPEC
   §12.2).
4. Across five rehearsal presses on production, every rendered
   blockquote carries the `✓ verified` badge and zero unverified
   quotes appear (BUILD_SPEC §12.3).
5. The final question on production occupies roughly the viewport's
   vertical center on the demo laptop's display (BUILD_SPEC §12.4).
6. The "scroll test at 10 feet" passes on the demo laptop (BUILD_SPEC
   §12.5).
7. The fallback video plays on the first keystroke of the bound
   shortcut, full-screen, in under 1 second (BUILD_SPEC §12.6).
8. The Cloudflare Edge runtime build does not break Phase 2's
   provenance drawer.

## Open questions / risks

- **Edge runtime + AI SDK compatibility.** Verify that `streamObject`
  with `@ai-sdk/google` runs on Cloudflare Workers' V8 isolate. If
  not, fall back to `runtime = "nodejs"` and accept the cold-start
  cost, or self-host on a Vercel project (not Cloudflare) with same
  domain via DNS.
- **Venue network firewall.** Some auditorium networks block outbound
  to `generativelanguage.googleapis.com`. Test 24h in advance from
  the auditorium itself; if blocked, request a network exception or
  hotspot.
- **Domain SSL propagation.** A 24-hour buffer before the demo is the
  minimum to absorb Cloudflare SSL provisioning delay.

## Reference

- `BUILD_SPEC.md` §12 (completion criteria), §13 (deployment steps).
