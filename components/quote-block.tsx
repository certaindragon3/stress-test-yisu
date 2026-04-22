import { Streamdown } from "streamdown"

import { ProvenanceDrawer } from "@/components/provenance-drawer"

type Verification = "pending" | "verified" | "unverified"

export function QuoteBlock({
  text,
  source,
  verification,
}: {
  text: string
  source: string
  verification: Verification
}) {
  if (verification === "unverified") {
    return (
      <p className="small-caps mt-6 text-xs text-neutral-400">
        unverified — not rendered
      </p>
    )
  }

  if (verification === "pending") {
    return null
  }

  return (
    <figure className="motion-quote-enter mt-8 border-l-2 border-ink pl-6">
      <blockquote className="text-xl leading-relaxed text-neutral-800 italic [&_em]:not-italic [&_p]:m-0 [&_strong]:font-medium">
        <Streamdown parseIncompleteMarkdown={false}>{text}</Streamdown>
      </blockquote>
      <figcaption className="mt-3 flex items-baseline gap-3 text-sm text-neutral-500">
        <span>— {source}</span>
        <span className="small-caps text-[10px] text-ink">✓ verified</span>
      </figcaption>
      <ProvenanceDrawer source={source} text={text} />
    </figure>
  )
}
