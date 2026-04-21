# Phase 3 — Deploy runbook

> Hand-executed by Jiesen against Cloudflare Workers. Claude can't log
> into your Cloudflare account, so this is the step list you drive.

## 0. Pre-flight (once, before first deploy)

1. **Confirm Cloudflare plan**: Workers Paid / Workers Standard.
   Do not assume the current bundle needs a paid tier. Instead, use
   the dry-run in §1 to inspect the actual upload size against the
   current account limits. Log in to the dashboard and check
   *Workers & Pages → Plans* if the dry-run or deploy is rejected.
2. **Install wrangler** is already covered by devDependencies. Verify:
   ```bash
   pnpm wrangler --version
   ```
3. **Log in** (opens a browser once):
   ```bash
   pnpm wrangler login
   ```

## 1. First deploy

All commands run from the repo root.

```bash
# Build the worker bundle (prebuild → next build → opennextjs bundle)
pnpm cf:build

# Dry-run: show what wrangler will upload
pnpm cf:dry-run
```

Check the dry-run output for:
- **Worker upload size** under the plan's gzipped limit.
- `main = .open-next/worker.js` resolved.
- `assets` binding points at `.open-next/assets`.

Then:

```bash
pnpm wrangler deploy
```

Expected: `Deployed stress-tester triggers ... https://stress-tester.<your-account>.workers.dev`.

Visit that `workers.dev` URL — the form should render. The chips and
layout should be intact. **Do not press yet** — the secret is not
wired.

Note: `wrangler dev` is useful for route smoke tests, but do not use it
as the final judge of streaming behavior or TTFB. Local Miniflare-based
preview has been observed to buffer streamed responses that work
correctly once deployed.

## 2. Wire the Gemini secret

```bash
pnpm wrangler secret put GEMINI_API_KEY
# paste the key from .env.local, press enter
```

Redeploying is **not** required — secrets are live immediately. Press
one chip on the `workers.dev` URL. If the reading streams cleanly,
move on. If it errors, see §5 troubleshooting.

## 3. Bind the custom domain

Via dashboard (no wrangler CLI path is stable for this):

1. *Workers & Pages → stress-tester → Settings → Domains & Routes*.
2. *Add Custom Domain* → `stress-test.jiesen-huang.com`.
3. Cloudflare provisions SSL automatically. Wait for the status to
   flip from *Initializing* to *Active* (5–30 min typical; up to 24 h
   worst case).
4. `curl -I https://stress-test.jiesen-huang.com` returns 200 and a
   valid cert.

## 4. Production verification (sub-script of closeout.md)

From the demo laptop, on the venue network ideally, otherwise home:

```bash
# From any shell — does the page load?
curl -I https://stress-test.jiesen-huang.com

# Do the edge routes respond?
curl -s https://stress-test.jiesen-huang.com/api/verify \
  -H 'content-type: application/json' \
  -d '{"text":"placeholder"}'
```

Then open the page in the browser, press each of the five chips,
confirm every blockquote carries `✓ verified`. That satisfies the
per-press audit in `doc/phase-3/closeout.md §3`.

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `The edge runtime is not supported by @opennextjs/cloudflare` | A route exports `runtime = "edge"` | Revert the route to `runtime = "nodejs"` or remove the export and rebuild |
| Local `wrangler dev` appears not to stream until the response ends | Miniflare buffering in local preview | Treat it as a local-preview limitation; verify streaming and latency on the deployed Worker instead |
| `Script startup exceeded CPU time limit` | AI SDK cold start too slow | `compatibility_flags = ["nodejs_compat"]` is already set; if this still persists in production, reduce other work in the handler or fall back to the recorded demo |
| `Error: No such file or directory` during build | `content/corpus/` missing | `ls content/corpus/` — ensure corpus is checked in |
| `Uploaded script size` too large | Free plan | Upgrade to Paid |
| `fetch is not available` | Missing `global_fetch_strictly_public` flag | Already set in `wrangler.toml`; otherwise add |
| Press returns 500, logs show `GEMINI_API_KEY undefined` | Secret not wired | `pnpm wrangler secret put GEMINI_API_KEY` |
| SSL cert pending > 1 h | DNS or CAA record | Dashboard → DNS → check CAA allows Cloudflare |
| Stream stalls mid-reading | Gemini rate limit or network | Retry once; if persistent, fall back to video |

## 6. Rollback

```bash
# List recent deployments
pnpm wrangler deployments list

# Roll back to the previous version
pnpm wrangler rollback <deployment-id>
```

## 7. On the day (panel 2026-04-24)

- 30 min before: single dry press from the laptop.
- Any press missing `✓ verified`: trigger fallback video. Do not
  narrate the failure.
