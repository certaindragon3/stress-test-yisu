"use client"

import type { CSSProperties } from "react"

const NUMERALS = ["I.", "II.", "III.", "IV."] as const

export function LoadingBridge({ active }: { active: boolean }) {
  return (
    <div
      aria-live="polite"
      role="status"
      aria-hidden={!active}
      data-active={active}
      className="motion-bridge-shell"
    >
      <div className="motion-bridge-column">
        <div aria-hidden="true" className="motion-bridge-rail" />
        <p className="small-caps mt-4 text-[11px] text-neutral-500">
          A reading assembles in four movements
        </p>
        <div className="mt-4 flex items-baseline gap-4 text-sm text-ink/70">
          {NUMERALS.map((numeral, index) => (
            <span
              key={numeral}
              className="motion-bridge-numeral roman-numeral"
              style={{ "--motion-index": index } as CSSProperties}
            >
              {numeral}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
