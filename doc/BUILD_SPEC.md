# Build Spec — The AI Discourse Stress-Tester

> A thinking instrument, after Yisu Zhou.
> Built for the DKU International Education Innovation Forum, 2026.

---

## 1. What this is

A single-page web instrument. A reader pastes a **claim about AI and
education** — a slogan, a headline, a LinkedIn paragraph, a CEO quote — and
presses one button. The instrument responds by pressing the claim through
three dimensions drawn from Yisu Zhou's *Software 3.0 University* keynote:

1. **The Epistemological Axis** — does this claim belong to the
   *verifiability* side or the *novelty* side of knowledge, and does it
   smuggle one as the other?
2. **The Mastery Pipeline** — what are the second-order effects on the
   training ground of the next generation, if this claim is widely adopted?
3. **The Jurisdictional Move** — whose professional turf is being claimed,
   who benefits, who is silenced?

It closes with a single line: **a question Yisu might ask in response.**

The instrument is not a chatbot. It is not a summarizer. It performs one
well-defined intellectual operation, and it performs it with taste.

## 2. Why this shape

The forum's organizing tension is *execution vs. orchestration* — the worry
that students who rely on AI will bypass the productive friction of deep
learning. A live demo that merely shows "look how fast AI builds an app"
would reinforce that worry rather than answer it.

This instrument answers it by being:

- **Interpretive, not executive.** It works on the "noisy" side of
  knowledge where the keynote itself says AI is weaker. The goal is to
  show that with the right authorial framing, AI can do respectable work
  on that side too — and that the framing is where the human judgment
  lives.
- **Grounded, not generative.** Every quotation the instrument produces
  must be verbatim from Yisu's corpus. Paraphrase-as-quotation is
  forbidden. A small verification layer enforces this.
- **Authored, not assembled.** The system prompt is an authored artifact
  in its own right. The demo makes it visible: the prompt is projected
  on screen, and three specific clauses are read aloud as the site of
  human judgment.

## 3. Audience constraints

- Audience: international educators and institutional leaders. Panel
  language is English.
- Venue: auditorium with large projection. Anyone in the back row must be
  able to read the output comfortably. Implication: generous type, high
  contrast, no small UI chrome.
- Demo budget: ~10 minutes total. The instrument must load and respond
  without ceremony. No auth, no onboarding, no cookies prompt, no modal.

## 4. Visual constitution

The aesthetic is a book, not a dashboard.

- **Palette**: white background (`#ffffff`), body text `neutral-900`,
  captions `neutral-500`, one accent: **ink green** `#1f3a2e`
  (hover `#2d4a3a`, wash `#f4f6f3`).
- **Type**: **EB Garamond** across the entire interface. Weights 400,
  500, 600, 700, plus italic. No second typeface. The UI is typeset, not
  designed.
- **Container**: `max-w-2xl` centered. The page reads like a letter.
- **Whitespace**: section breaks at `py-16` to `py-32`. The final question
  gets `py-32` on both sides — it occupies a screen of its own.
- **Section markers**: Roman numerals with small-caps labels, tracked
  wide. `I.  The Epistemological Axis`. This is journal typography, not
  product copy.
- **Quotations**: `border-l-2 border-ink pl-6`, serif italic, followed by
  a source caption and a tiny `✓ verified` badge when the quote passes
  corpus verification.
- **Streaming**: all generated text streams, one token at a time. No
  spinner anywhere in the application — streaming *is* the loading state.
- **Forbidden**: navbars, sidebars, footers, gradients, shadows beyond
  `shadow-sm`, rounded-xl chrome, icons-for-decoration, emoji,
  placeholder illustrations, skeleton loaders competing with streaming
  text.

## 5. Interaction

One view. No routes.

1. The page loads with an empty textarea and five example claims shown
   as chips below it. The chips are specific, pre-selected claims that
   Yisu has flagged as worth pressing. Clicking a chip populates the
   textarea.
2. The user presses the primary button labelled **Press**.
3. The instrument streams four sections in order: three axes, then the
   final question. Each section's header appears first, then its prose
   streams in below it, then its supporting quotation fades in once the
   verification check passes.
4. When streaming completes, a subtle `Press again ↑` link appears at
   the bottom. There is no "share" button, no "export" button, no
   "history" panel. One press, one reading.

## 6. Technical stack

| Layer        | Choice                                       | Rationale                                                          |
|--------------|----------------------------------------------|--------------------------------------------------------------------|
| Framework    | **Next.js 15 (App Router)**                  | Author is fluent; streaming via Route Handlers is native.          |
| Language     | TypeScript, strict mode                      | Non-negotiable for a document this short.                          |
| Styling      | **Tailwind CSS v4**                          | Utility-first; no design tokens outside the palette above.         |
| Components   | **shadcn/ui** (Button, Textarea, Badge only) | Pre-installed via MCP. No other primitives needed.                 |
| AI SDK       | **Vercel AI SDK v5** (`streamText`)          | Cleanest streaming primitive for Google Gemini.                    |
| Model        | **`gemini-3.1-pro`**                         | Right balance of quality and latency for a live demo.              |
| Deployment   | **Cloudflare Pages** via `@cloudflare/next-on-pages` | Author already operates this domain.                       |
| Domain       | **`stress-test.jiesen-huang.com`**           | Locked 24 hours before the demo. No changes after.                 |
| Font loading | `next/font/google` for EB Garamond           | Self-hosted, no FOUT.                                              |

### Libraries *not* to use

Do not introduce: react-router, framer-motion, react-query, zustand,
redux, any chart library, any icon library other than lucide-react if
strictly needed, any UI library other than shadcn, any CMS, any database,
any ORM, any auth provider.

## 7. Architecture

```
┌─────────────────────┐
│  app/page.tsx       │  Single client component. Textarea, chips,
│  (the entire UI)    │  output rendering, consumes the stream.
└──────────┬──────────┘
           │ POST /api/press
           ▼
┌─────────────────────┐
│  app/api/press/     │  Route Handler. Assembles system prompt +
│  route.ts           │  corpus, calls streamText, returns a stream.
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Vercel AI SDK      │  streamText({ model: google('gemini-3.1-pro') })
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Google Gemini API  │
└─────────────────────┘
```

The response is a **structured stream**. The instrument uses Vercel AI
SDK's `streamObject` pattern so each of the four sections arrives as a
typed partial:

```ts
type Reading = {
  epistemological: { prose: string; quote: Quote | null };
  mastery:         { prose: string; quote: Quote | null };
  jurisdictional:  { prose: string; quote: Quote | null };
  question:        string;
};

type Quote = { text: string; source: string; verified: boolean };
```

## 8. Quote verification

Every `quote.text` returned by the model is checked against the corpus
before the `verified` flag is set. The check is a whitespace-normalized
substring match.

```ts
function verifyQuote(text: string, corpus: string): boolean {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  return norm(corpus).includes(norm(text));
}
```

If a quote fails verification, the UI renders the quote block with a
muted `unverified — not rendered` placeholder, and the quote text itself
is dropped. This is a trust commitment, not a nicety: in the demo, Yisu
is in the room and will spot a fabricated citation instantly.

## 9. File structure

```
stress-tester/
├── CLAUDE.md                        # Claude Code's working manual for this repo.
├── BUILD_SPEC.md                    # This file.
├── README.md                        # Minimal.
├── package.json
├── tsconfig.json
├── tailwind.config.ts               # Contains the ink palette.
├── next.config.ts                   # Cloudflare adapter config.
├── app/
│   ├── layout.tsx                   # EB Garamond, metadata, nothing else.
│   ├── page.tsx                     # The single view.
│   └── api/
│       └── press/
│           └── route.ts             # streamText route handler.
├── lib/
│   ├── corpus.ts                    # Exports YISU_CORPUS as a single string.
│   ├── system-prompt.ts             # Exports the assembled system prompt.
│   ├── schema.ts                    # Zod schema for Reading + Quote.
│   └── verify.ts                    # verifyQuote().
├── content/
│   └── corpus/                      # Source texts, one file per piece.
│       ├── software-3.md
│       ├── <other-yisu-pieces>.md
│       └── ...
└── components/
    ├── claim-input.tsx              # Textarea + chips + Press button.
    ├── axis-section.tsx             # Header + prose + quote block.
    ├── quote-block.tsx              # border-l-2 blockquote with badge.
    └── final-question.tsx           # The py-32 reveal.
```

## 10. Environment

```
# .env.local (not committed)
GEMINI_API_KEY=...
```

The Cloudflare Pages project binds the same key as an environment
variable. No other secrets.

## 11. Example claims (seed the chips)

These are five chip-seed claims — three drawn from the *Software 3.0
University* keynote's framing, two sharpened against live public
AI-education discourse (see `doc/phase-1/claim-bank.md` for sources
and axis hooks). Final list to be confirmed with Yisu in the co-design
meeting.

- *"Prompting is the new literacy."*
- *"AI tutors will replace TAs within five years."*
- *"Kids shouldn't learn to code — leave it up to AI."*
- *"The essay is dead."*
- *"Within ten years, AI will replace many doctors and teachers."*

## 12. Completion criteria

The build is **done for demo** when all of the following hold:

1. The site loads at `stress-test.jiesen-huang.com` in under 1.5 seconds
   on the venue network, tested 24 hours in advance.
2. Pressing any of the five chip claims produces a complete reading in
   under 20 seconds, streaming throughout.
3. Every quotation rendered in the final output carries the `✓ verified`
   badge. Zero unverified quotes appear on screen during any of the
   five rehearsal runs.
4. The final question always arrives as a **single sentence**, in
   italics, at a size that occupies roughly the viewport's vertical
   center on a 1920×1080 projector.
5. The page passes a "scroll test at 10 feet": read aloud from ten feet
   away from a 13" laptop, every line is legible.
6. A pre-recorded 90-second fallback video is saved locally on the demo
   laptop and can be triggered by a single keystroke if the live
   instrument fails.

## 13. Deployment steps

```bash
# first-time setup
pnpm install
pnpm dlx shadcn@latest add button textarea badge
cp .env.local.example .env.local  # paste GEMINI_API_KEY

# local dev
pnpm dev

# production build
pnpm build
pnpm dlx @cloudflare/next-on-pages

# deploy
wrangler pages deploy .vercel/output/static \
  --project-name=stress-tester \
  --branch=main

# bind domain (one-time, via Cloudflare dashboard)
# stress-test.jiesen-huang.com → stress-tester.pages.dev
```

## 14. What this build is *not*

To forestall drift during implementation:

- It is **not** a research tool. It does not retrieve, index, or search
  beyond its in-context corpus.
- It is **not** a general-purpose AI analyzer. It has one frame and one
  voice.
- It is **not** a persistent application. There is no account, no saved
  history, no user. Each press is a fresh reading.
- It is **not** a neutral referee. It takes Yisu's frame as given and
  presses the claim through that frame. The honesty of the instrument
  lies in naming its frame, not in pretending to have none.

---

*The system prompt that animates this instrument lives in `CLAUDE.md`.
Read it next.*
