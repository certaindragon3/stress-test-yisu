"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import { AxisSection } from "@/components/axis-section"
import { ClaimInput } from "@/components/claim-input"
import { FinalQuestion } from "@/components/final-question"
import { LoadingBridge } from "@/components/loading-bridge"
import {
  createPendingVerifications,
  mergeReading,
  type PartialReading,
  type PressStreamEvent,
  type VerificationMap,
} from "@/lib/press-stream"

type StreamError = Error | null
type MotionPhase = "idle" | "arming" | "waiting" | "streaming" | "complete"

const AXES = [
  {
    key: "epistemological",
    numeral: "I",
    title: "The Epistemological Axis",
    subtitle:
      "Is this claim about questions with checkable answers, or judgments that still depend on people?",
  },
  {
    key: "mastery",
    numeral: "II",
    title: "The Mastery Pipeline",
    subtitle:
      "What training does this make the next generation skip before judgment can form?",
  },
  {
    key: "jurisdictional",
    numeral: "III",
    title: "The Jurisdictional Move",
    subtitle:
      "Whose professional work is being reassigned here, and who gains by that move?",
  },
] as const

function toError(message: string): Error {
  return new Error(message || "The instrument failed to respond.")
}

function parseEvents(buffer: string): {
  rest: string
  events: PressStreamEvent[]
} {
  const events: PressStreamEvent[] = []
  let cursor = 0

  while (true) {
    const newlineIndex = buffer.indexOf("\n", cursor)
    if (newlineIndex < 0) {
      return { rest: buffer.slice(cursor), events }
    }

    const line = buffer.slice(cursor, newlineIndex).trim()
    cursor = newlineIndex + 1
    if (!line) continue
    events.push(JSON.parse(line) as PressStreamEvent)
  }
}

function hasVisibleReading(reading: PartialReading): boolean {
  if (reading.question?.trim()) {
    return true
  }

  return AXES.some(({ key }) => {
    const axis = reading[key]
    return Boolean(
      axis?.prose?.trim() ||
      axis?.quote?.text?.trim() ||
      axis?.quote?.source?.trim()
    )
  })
}

export default function Page() {
  const [claim, setClaim] = useState("")
  const [hasPressed, setHasPressed] = useState(false)
  const [reading, setReading] = useState<PartialReading>({})
  const [verifications, setVerifications] = useState<VerificationMap>(
    createPendingVerifications()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<StreamError>(null)
  const [motionPhase, setMotionPhase] = useState<MotionPhase>("idle")
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  function resetStreamState() {
    abortRef.current?.abort()
    abortRef.current = null
    setReading({})
    setVerifications(createPendingVerifications())
    setError(null)
    setIsLoading(false)
    setMotionPhase("idle")
  }

  async function streamPress(nextClaim: string) {
    const controller = new AbortController()
    abortRef.current = controller
    setIsLoading(true)
    let currentReading: PartialReading = {}

    try {
      const res = await fetch("/api/press", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ claim: nextClaim }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        throw toError(`The instrument failed to respond. ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let finished = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parsed = parseEvents(buffer)
        buffer = parsed.rest

        for (const event of parsed.events) {
          if (event.type === "error") {
            throw toError(event.message)
          }

          currentReading = mergeReading(currentReading, event.reading)
          setReading((current) => mergeReading(current, event.reading))
          setVerifications(event.verifications)

          if (hasVisibleReading(currentReading)) {
            setMotionPhase((current) =>
              current === "complete" ? current : "streaming"
            )
          }

          if (event.type === "finish") {
            finished = true
            setMotionPhase("complete")
            setIsLoading(false)
          }
        }
      }

      buffer += decoder.decode()
      const parsed = parseEvents(buffer)
      for (const event of parsed.events) {
        if (event.type === "error") {
          throw toError(event.message)
        }
        currentReading = mergeReading(currentReading, event.reading)
        setReading((current) => mergeReading(current, event.reading))
        setVerifications(event.verifications)
        if (hasVisibleReading(currentReading)) {
          setMotionPhase((current) =>
            current === "complete" ? current : "streaming"
          )
        }
        if (event.type === "finish") {
          finished = true
          setMotionPhase("complete")
        }
      }

      if (!finished && !controller.signal.aborted) {
        setIsLoading(false)
        setMotionPhase(hasVisibleReading(currentReading) ? "complete" : "idle")
      }
    } catch (streamError) {
      if (controller.signal.aborted) return
      setError(
        streamError instanceof Error
          ? streamError
          : toError("The instrument failed to respond.")
      )
      setIsLoading(false)
      setMotionPhase("idle")
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }

  function handlePress() {
    const nextClaim = claim.trim()
    if (nextClaim.length === 0) return

    setHasPressed(true)
    resetStreamState()
    setMotionPhase("arming")
    requestAnimationFrame(() => {
      setMotionPhase((current) => (current === "arming" ? "waiting" : current))
    })
    void streamPress(nextClaim)
  }

  function handlePressAgain() {
    resetStreamState()
    setHasPressed(false)
    setClaim("")
  }

  return (
    <main className="mx-auto min-h-svh max-w-2xl px-6 py-16 md:py-24">
      <header className="mb-16">
        <p className="small-caps text-xs text-neutral-500">
          A thinking instrument, after Yisu Zhou
        </p>
        <h1 className="mt-2 text-3xl font-medium text-ink md:text-4xl">
          The AI Discourse Stress-Tester
        </h1>
      </header>

      <ClaimInput
        claim={claim}
        onClaimChange={setClaim}
        onPress={handlePress}
        isLoading={isLoading}
        isPressActive={motionPhase !== "idle" && motionPhase !== "complete"}
      />

      {error ? (
        <p className="mt-12 text-sm text-red-700">
          The instrument failed to respond. {error.message}
        </p>
      ) : null}

      {hasPressed ? (
        <div className="mt-16 border-t border-neutral-200">
          <LoadingBridge
            active={motionPhase === "arming" || motionPhase === "waiting"}
          />

          {AXES.map(({ key, numeral, title, subtitle }, index) => (
            <AxisSection
              key={key}
              index={index}
              numeral={numeral}
              title={title}
              subtitle={subtitle}
              prose={reading[key]?.prose}
              quote={reading[key]?.quote ?? null}
              verification={verifications[key]}
            />
          ))}

          <div
            className="motion-axis-header flex items-baseline gap-4 border-t border-neutral-200 pt-16"
            style={{ "--motion-index": 3 } as CSSProperties}
          >
            <span className="roman-numeral text-2xl text-ink">IV.</span>
            <h2 className="small-caps text-base text-neutral-700">
              A Question Yisu Might Ask in Response
            </h2>
          </div>
          <FinalQuestion question={reading.question} />

          {!isLoading && reading.question ? (
            <button
              type="button"
              onClick={handlePressAgain}
              className="motion-tail-enter small-caps text-xs text-neutral-500 hover:text-ink"
            >
              Press again ↑
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  )
}
