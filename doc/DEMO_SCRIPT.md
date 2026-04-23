# DEMO_SCRIPT — Speaker Script

> Companion to [`DEMO_DECK.md`](./DEMO_DECK.md). The deck declares what
> appears on screen; this document declares what the speaker says, when
> to read slide text aloud verbatim, when to bridge between slides, and
> where to stay silent during the three live segments.
>
> Authored 2026-04-22 by Jiesen Huang for the DKU International Education
> Innovation Forum, 2026. Total runtime ~10 minutes.

## How to use this file

1. The script never re-prints slide text that the speaker should already
   read off the screen. When a slide is meant to be read aloud, the
   script says so and marks tempo only.
2. Bridging lines — sentences the speaker adds between slides, not shown
   on screen — appear *in italics* inside pull-quotes.
3. Beat markers: `〔beat · Ns〕` = deliberate pause; `〔···〕` = extended
   silence (hold the room). Silence is load-bearing — do not fill it.
4. Typographic emphasis (**bold**) marks the stressed word, not the
   loudest one.
5. The three live segments have prepared narration only at seams. The
   default state during live is silence.

## Speaking arc

```
0:00–1:00   Act I   · Slide 1, 2                  hook + frame
1:00–2:30   Act II  · [live instrument, Press 1]  no slides
2:30–4:20   Act III · Slide 3, 4, 5, 6            context engineering
4:20–7:40   Act IV  · Slide 7 → [live build]      orchestrator posture
7:40–9:10   Act V   · [live instrument, Press 2]  Yisu selects a chip
9:10–10:00  Act VI  · Slide 8, 9                  audit + close
```

---

## ACT I — Hook & Frame (0:00 – 1:00)

### 【SLIDE 1 — HOOK】

Walk to the lectern in silence. Do not greet. Do not thank. Look once
at the back row. Then read the slide.

> "The robot can make the broth now."

〔beat · 2s〕

> "The question that has not been asked is — **who teaches the robot to
> know whether the broth is good?**"

〔beat · 3s — let the question hang〕

> *(quieter, slower)* "That teacher is a contract — a standard of
> judgment — written before the robot was invited in."

〔···〕 Do not explain the word *contract*. Plant it. Move.

### 【SLIDE 2 — THE INSTRUMENT AS A THINKING MACHINE】

Bridge — one sentence, before reading the slide:

> *"What I just called a contract has a shape tonight. It is an
> instrument. It is called the AI Discourse Stress-Tester. It does not
> answer questions about AI and education. It **presses** them."*

Read the three numbered questions at the pace of someone reading a short
poem — not a memo. Let the Roman numerals do the work.

〔after III, brief pause, then point to the "+ one question" line〕

> *"And then — a fourth move. One sentence, in Yisu's register, that the
> claim was trying not to have asked of it."*

The closer stays on screen. Do not read it aloud — the slide says it.
Simply turn.

---

## ACT II — Live Press 1 (1:00 – 2:30)

### 【LIVE — browser, Press 1】

Bridge before switching screens:

> *"Rather than describe the instrument — let me press one claim now."*

Click a pre-selected chip. Return hands to sides. Do not narrate the
streaming output.

〔streaming · ~70s silence〕

When the stream completes, walk to the screen. One gesture at the
verified badges:

> "Every italicised sentence you just read — came from writings Yisu
> published. Nothing else was quoted. The instrument refuses to render
> anything it cannot verify against the source."

One gesture at the final question:

> "The fourth beat — the question — is the one the instrument will not
> answer. It leaves it with the room."

〔beat〕 Cut back to slides.

---

## ACT III — Context Engineering (2:30 – 4:20)

### 【SLIDE 3 — CONTEXT, AUTHORED FIRST】

Bridge:

> *"Before I press a second claim, I owe you the how. Because the
> interesting part of this build was **not the prompting**."*

Read the slide body at a slower tempo than the hook. Four words, four
beats:

> "Direction. Non-negotiable rules. Verification. Phases."

After the closer, add the translation — this is the only place in the
talk to name the jargon:

> *"In the current vocabulary of AI builders, this has a name. Context
> engineering. Translated plainly: I wrote the direction, the standards,
> and the phase contracts — and **then** the agent could move."*

### 【SLIDE 4 — TECH, CHOSEN ONCE】

Bridge:

> *"Three decisions, made before the first line of code. First — the
> stack."*

Read the `picked` column at clip pace, without emphasis — it is a list
of ordinary names. Then shift register, slower, for `refused`:

> "No state management library. No icon library. No component library
> beyond primitives. No database. No auth. No analytics."

〔beat〕

> *(reading the closer)* "Dependencies were a cap — **not** a budget."

If a small laugh lands on *refused* — accept it silently. Do not
explain.

### 【SLIDE 5 — DESIGN, DECLARED FIRST】

Bridge:

> *"Second — the design."*

Read the title:

> "One screen. One voice. One model call per press."

Do not read the full `picked` column — the audience is already looking
at it. Point instead at `refused`, one finger, rhythmic:

> "No icons. No illustrations. No gradients. No shadows. No cards. No
> dashboard chrome."

〔beat · 1s〕

> "Typography is the design. Everything else is **temptation**."

〔beat〕 This is the driest line in the deck. Do not smile at it. Let
the audience do that.

### 【SLIDE 6 — DELIVERY, IN PHASES】

Bridge:

> *"Third — the path."*

Read the title and the closer; do not narrate the table. After ~4s of
letting the audience read the table:

> "Each phase opens with an epic. Each phase closes with a verification
> script. The spec is the signature."

〔beat〕

> *"You will notice Phase 6 is marked — 'tonight, live'. That is where
> I am going next."*

---

## ACT IV — Live Build (4:20 – 7:40)

### 【SLIDE 7 — THE NEW COLLABORATION POSTURE】

Bridge:

> *"So — the posture. Where I sit. Where the agent sits."*

Read the slide:

> "Two jobs stay with the human. **Coordination.** And the decision at
> the seam — where human and machine meet."
>
> "Everything else — the typing, the lookup, the drafts, the wiring, the
> tests — goes to the agent."
>
> *(slower, final line)* "For the next three minutes, I will not type.
> I will guard."

Do not read "Orchestration begins now." Let the slide say it while the
screen switches.

### 【LIVE — Phase 6 build, 3 minutes】

Screen: editor + terminal + browser. Open `doc/phase-6/epic.md`, scroll
to acceptance criteria, hold 5s in silence so the back row can read.
Open `CLAUDE.md`, scroll to "Invariants a Claude Code agent must
respect", hold 3s.

Hand the task to Claude Code in one line derived from the epic. Say
nothing while it plans.

**Prepared narration for seams only — use if and only if triggered:**

- If the agent proposes a boundary-crossing change:
  > "The spec forbids that. Pulling it back."

- If verification fails or the prompt misfires:
  > "That is not a code error. That is a prompt contract that is too
  > loose. Tightening it and pressing again."

- At the moment the ruler renders on Axis I:
  *One gesture at the ruler. No words.*

- If the rehearsed small failure does not occur naturally:
  > "This build obeyed the contract tonight. The version I rehearsed
  > last night did not — and that is where the seam was. That is where
  > I came back in."

Do not improvise beyond these lines. Silence is the correct default in
this act.

---

## ACT V — Live Press 2 (7:40 – 9:10)

### 【LIVE — instrument, Yisu's chip】

Return to the main page.

> *"One more press. This one not by me."*

Gesture to Yisu:

> "周老师 — please, choose one."

*(If delivering the talk fully in English:)*

> "Yisu — please choose one."

〔streaming · ~70s silence〕

Do not rescue a weak reading. A weak reading is still a reading produced
under contract — that is the point. Let Yisu speak first, even if only
a syllable.

---

## ACT VI — Audit & Close (9:10 – 10:00)

### 【SLIDE 8 — AUDIT】

Read `main` plainly, no affect:

> "Every quotation you heard tonight was verbatim. If it was not
> verbatim, it was not shown."

〔beat · 2s〕

Read the accent line quieter, slower:

> "A verification rule gated the render. The system enforced academic
> integrity — not the operator."

〔beat · 2s〕 Do not rush past *academic integrity* — that is the word
this room is built to hear. This is also the moment where the idea
planted in Slide 1 — *contract* as a standard of judgment — is shown
to have been rendered as a machine-readable rule.

### 【SLIDE 9 — CLOSE】

Read at the pace of the hook. Same pace. Closing the loop.

> "Orchestration is not abandoning the work."

〔beat · 2s〕

> "It is designing the workflow **so carefully** — that you only have
> to re-enter at the broken seams."

〔··· 3s silence 〕

Step back from the lectern. The slide stays on. Do not say *thank you*.
Do not invite questions. Leave the stage, or stand in stillness until
the moderator speaks.

---

## 排练笔记

1. **不要记稿,记节拍**。全稿 spoken 约 750 词,关键不在字句而在节奏标
   记。先跑节拍再跑内容。
2. **"有趣"只在四个点**:Slide 4 的 "Dependencies were a cap — not a
   budget"、Slide 5 的 "temptation"、Live Build 的 seam 修复台词、
   Slide 7 的 "I will guard"。其他地方越平淡越好,**反差让笑点自动成
   立**。
3. **最大风险是 Live Build 那 3 分钟**。排练时必须准备两种结局:agent
   乖 / agent 出错。出错的版本是更好的版本——prepared line 都写好了,
   观众会看到 orchestrator posture 真的在工作。不要回避失败。
4. **Yisu press 那段是全场最脆弱的 90 秒**。如果 reading 确实弱,
   **不要救**。deck 已经给了台阶:"a weak reading is itself a
   demonstration"。但你口头不能说这句,只能用沉默承接。
5. **最后三秒的沉默比整稿都重要**。不要吞掉它。

---

## Delivery contract (non-negotiable)

- No opening greeting. No "good evening." No thank-you at close. No Q&A
  invitation.
- No narration over streaming output during Press 1 or Press 2.
- No improvised lines during Live Build beyond the four prepared
  seam-lines above.
- Every quotation referenced on stage must be one the instrument has
  actually rendered from the corpus during the live press — never a
  quote recalled from rehearsal.
- If the instrument fails to render during a live segment, do not
  narrate a rescue. Acknowledge the failure in one sentence, return to
  slides, and continue.

---

*Script authored 2026-04-22 by Jiesen Huang. Intellectual frame: Yisu
Zhou, used with permission. Delivered at the DKU International
Education Innovation Forum, 2026.*
