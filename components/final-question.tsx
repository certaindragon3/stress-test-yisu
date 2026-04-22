export function FinalQuestion({ question }: { question: string | undefined }) {
  if (!question) return null
  return (
    <section className="motion-question-enter py-32">
      <p className="text-3xl leading-snug text-ink italic md:text-4xl">
        {question}
      </p>
    </section>
  )
}
