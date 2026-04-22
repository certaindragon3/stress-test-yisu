import type { CSSProperties } from "react"

import { QuoteBlock } from "@/components/quote-block"

type Verification = "pending" | "verified" | "unverified"

export function AxisSection({
  index,
  numeral,
  title,
  prose,
  quote,
  verification,
}: {
  index: number
  numeral: string
  title: string
  prose: string | undefined
  quote: { text?: string; source?: string } | null | undefined
  verification: Verification
}) {
  const proseVisible = Boolean(prose?.trim())

  return (
    <section className="py-16">
      <header
        className="motion-axis-header mb-8 flex items-baseline gap-4"
        style={{ "--motion-index": index } as CSSProperties}
      >
        <span className="roman-numeral text-2xl text-ink">{numeral}.</span>
        <h2 className="small-caps text-base text-neutral-700">{title}</h2>
      </header>
      <p
        data-revealed={proseVisible}
        className="motion-axis-prose min-h-[5.5rem] text-xl leading-relaxed text-neutral-900 md:min-h-[6rem]"
      >
        {proseVisible ? prose : "\u00A0"}
      </p>
      {quote?.text && quote?.source ? (
        <QuoteBlock
          text={quote.text}
          source={quote.source}
          verification={verification}
        />
      ) : null}
    </section>
  )
}
