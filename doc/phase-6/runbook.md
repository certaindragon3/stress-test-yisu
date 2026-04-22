# Phase 6 - Runbook

> This is the operational SOP for reproducing the Phase 6 inline
> epistemological companion during demo prep. It is intentionally short.

## Freeze record

- Branch: `codex/phase-6-inline-companion`
- Pinned tag: `demo-phase6-v1`
- Prompt asset: `doc/phase-6/prompt.md`
- Spec asset: `doc/phase-6/epic.md`
- Verification asset: `doc/phase-6/closeout.md`
- Screenshot asset:
  - `doc/phase-6/assets/phase6-inline-companion-reference.png`
- Runtime files:
  - `app/api/press/route.ts`
  - `app/page.tsx`
  - `components/axis-section.tsx`
  - `components/placement-ruler.tsx`
  - `lib/press-stream.ts`
  - `lib/schema.ts`

## What this phase is

Phase 6 is not a separate app. It is a small inline control on the main
page: a five-stop ruler inside the Epistemological Axis header.

Its purpose is to show orchestration:

- the UI addition is tiny
- the model call is still singular
- the added contract is narrow and explicit

## Local dev

From the repo root:

```bash
pnpm dev
```

Expected local URL:

```text
http://localhost:3000
```

## Deploy path

Use the normal main-instrument path:

```bash
pnpm cf:deploy
```

This phase must not use a separate companion deployment target.

## Fast fallback deploy

If the live branch goes bad and you need the Phase 6 version fast:

```bash
git switch codex/phase-6-inline-companion
git pull --ff-only
pnpm cf:deploy
```

If branch switching is blocked by local changes:

```bash
git stash push -u -m "demo-emergency"
git switch codex/phase-6-inline-companion
git pull --ff-only
pnpm cf:deploy
```

The safer pre-demo setup is to keep one extra terminal already parked on
this branch.

## Canonical smoke claim

Primary:

```text
AI tutors will replace TAs within five years.
```

Useful secondary checks:

```text
Prompting is the new literacy.
The essay is dead.
Within ten years, AI will replace many doctors and teachers.
```

## What success looks like

- The page is still the normal Stress-Tester.
- Axis I shows a thin ruler beneath the subtitle.
- The ruler has only two tiny endpoint labels:
  - `Verifiable`
  - `Novelty`
- One marker lands on one of five stops.
- The prose, quote verification, and final question still behave as
  usual.
- The result still comes from one `Press`.

## What to say on stage

Keep the explanation to one sentence:

```text
This ruler does not judge whether the claim is true; it only places the claim between verifiable and novelty.
```

## Allowed failure

The allowed small failure is not a broken page. It is an imprecise or
missing placement instruction in the caller contract.

The preferred visible repair is:

1. reopen the prompt contract
2. tighten the placement instruction
3. rerun the same claim

## First place to edit

If the Phase 6 behavior drifts, start here:

1. `doc/phase-6/prompt.md`
2. `app/api/press/route.ts`
3. `components/placement-ruler.tsx`

## Pre-demo checklist

- `pnpm dev` starts cleanly.
- The canonical smoke claim returns a visible placement.
- The ruler still reads as subordinate to Axis I.
- No second route or separate companion surface has crept back in.
- The current commit hash is written into this file before rehearsal.
