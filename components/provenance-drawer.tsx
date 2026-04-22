"use client"

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react"

type ProvenanceSuccess = {
  piece: string
  matchOffset: number
  matchLength: number
}

type ProvenanceError = { error: string }

type ProvenanceResponse = ProvenanceSuccess | ProvenanceError

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: ProvenanceSuccess }
  | { kind: "error"; message: string }

type DrawerPhase = "closed" | "opening" | "open" | "closing"

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !("matchMedia" in window)) {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function ProvenanceDrawer({
  source,
  text,
}: {
  source: string
  text: string
}) {
  const [state, setState] = useState<State>({ kind: "idle" })
  const [phase, setPhase] = useState<DrawerPhase>("closed")
  const panelRef = useRef<HTMLDivElement | null>(null)
  const markRef = useRef<HTMLElement | null>(null)
  const animationRef = useRef<Animation | null>(null)

  function getExpandedHeight(panel: HTMLDivElement): number {
    const maxHeight = Number.parseFloat(getComputedStyle(panel).maxHeight)

    if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
      return panel.scrollHeight
    }

    return Math.min(panel.scrollHeight, maxHeight)
  }

  function settleAnimation(animation: Animation, applyFinalStyles: () => void) {
    animation.commitStyles?.()
    animation.cancel()
    applyFinalStyles()
  }

  function loadProvenance() {
    if (state.kind === "idle" || state.kind === "error") {
      setState({ kind: "loading" })
      fetch("/api/provenance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source, text }),
      })
        .then((r) => r.json() as Promise<ProvenanceResponse>)
        .then((data) => {
          if ("error" in data) {
            setState({ kind: "error", message: data.error })
          } else {
            setState({ kind: "ok", data })
          }
        })
        .catch((err: Error) => {
          setState({ kind: "error", message: err.message })
        })
    }
  }

  useEffect(() => {
    return () => {
      animationRef.current?.cancel()
    }
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    animationRef.current?.cancel()

    if (phase === "opening") {
      const targetHeight = getExpandedHeight(panel)

      panel.style.overflow = "hidden"
      panel.style.height = "0px"
      panel.style.opacity = "0"
      panel.style.transform = "translateY(8px)"

      const animation = panel.animate(
        [
          { height: "0px", opacity: 0, transform: "translateY(8px)" },
          {
            height: `${targetHeight}px`,
            opacity: 1,
            transform: "translateY(0px)",
          },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      )

      animationRef.current = animation
      animation.onfinish = () => {
        animationRef.current = null
        settleAnimation(animation, () => {
          panel.style.height = `${targetHeight}px`
          panel.style.opacity = "1"
          panel.style.transform = "translateY(0)"
          panel.style.overflowY = "auto"
          panel.style.overflowX = "hidden"
        })
        setPhase("open")
      }
      animation.oncancel = () => {
        animationRef.current = null
      }
      return
    }

    if (phase === "closing") {
      const startHeight = panel.getBoundingClientRect().height

      panel.style.overflow = "hidden"
      panel.style.height = `${startHeight}px`
      panel.style.opacity = "1"
      panel.style.transform = "translateY(0)"

      const animation = panel.animate(
        [
          {
            height: `${startHeight}px`,
            opacity: 1,
            transform: "translateY(0px)",
          },
          { height: "0px", opacity: 0, transform: "translateY(-4px)" },
        ],
        {
          duration: 240,
          easing: "cubic-bezier(0.32, 0, 0.67, 0)",
          fill: "forwards",
        }
      )

      animationRef.current = animation
      animation.onfinish = () => {
        animationRef.current = null
        settleAnimation(animation, () => {
          panel.style.height = "0px"
          panel.style.opacity = "0"
          panel.style.transform = "translateY(-4px)"
          panel.style.overflow = "hidden"
        })
        setPhase("closed")
      }
      animation.oncancel = () => {
        animationRef.current = null
      }
      return
    }

    if (phase === "open") {
      panel.style.height = `${getExpandedHeight(panel)}px`
      panel.style.opacity = "1"
      panel.style.transform = "translateY(0)"
      panel.style.overflowY = "auto"
      panel.style.overflowX = "hidden"
      return
    }

    panel.style.height = "0px"
    panel.style.opacity = "0"
    panel.style.transform = "translateY(-4px)"
    panel.style.overflow = "hidden"
  }, [phase])

  useEffect(() => {
    if (phase !== "open") return

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return

      panel.style.height = `${getExpandedHeight(panel)}px`
      panel.style.overflowY = "auto"
      panel.style.overflowX = "hidden"
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [phase, state])

  useEffect(() => {
    if (phase !== "open" || state.kind !== "ok") return
    const panel = panelRef.current
    const mark = markRef.current
    if (!panel || !mark) return
    const panelRect = panel.getBoundingClientRect()
    const markRect = mark.getBoundingClientRect()
    const target = markRect.top - panelRect.top - panelRect.height / 3
    panel.scrollTop += target
  }, [phase, state])

  function handleSummaryClick(e: ReactMouseEvent<HTMLElement>) {
    e.preventDefault()

    const reduceMotion = prefersReducedMotion()

    if (phase === "closed") {
      loadProvenance()
      setPhase(reduceMotion ? "open" : "opening")
      return
    }

    if (phase === "open") {
      setPhase(reduceMotion ? "closed" : "closing")
      return
    }

    if (phase === "closing") {
      loadProvenance()
      setPhase(reduceMotion ? "open" : "opening")
      return
    }

    setPhase(reduceMotion ? "closed" : "closing")
  }

  const isOpen = phase !== "closed"

  return (
    <details open={isOpen} className="mt-4 border-t border-neutral-100 pt-3">
      <summary
        onClick={handleSummaryClick}
        className="small-caps cursor-pointer list-none text-[10px] text-neutral-500 hover:text-ink"
      >
        {isOpen ? "hide provenance ↑" : "show provenance ↓"}
      </summary>
      <div
        ref={panelRef}
        data-phase={phase}
        className="mt-4 max-h-80 overflow-y-auto border-l border-neutral-200 pl-6 text-sm leading-relaxed text-neutral-700"
      >
        {state.kind === "loading" ? (
          <p className="small-caps text-xs text-neutral-400">loading…</p>
        ) : null}
        {state.kind === "error" ? (
          <p className="small-caps text-xs text-neutral-400">{state.message}</p>
        ) : null}
        {state.kind === "ok" ? (
          <ProvenanceBody
            piece={state.data.piece}
            matchOffset={state.data.matchOffset}
            matchLength={state.data.matchLength}
            markRef={markRef}
          />
        ) : null}
      </div>
    </details>
  )
}

function ProvenanceBody({
  piece,
  matchOffset,
  matchLength,
  markRef,
}: {
  piece: string
  matchOffset: number
  matchLength: number
  markRef: RefObject<HTMLElement | null>
}) {
  const before = piece.slice(0, matchOffset)
  const match = piece.slice(matchOffset, matchOffset + matchLength)
  const after = piece.slice(matchOffset + matchLength)

  return (
    <div className="break-words whitespace-pre-wrap">
      {before}
      <mark ref={markRef} className="bg-ink-wash text-ink">
        {match}
      </mark>
      {after}
    </div>
  )
}
