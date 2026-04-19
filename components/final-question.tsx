export function FinalQuestion({ question }: { question: string | undefined }) {
  if (!question) return null;
  return (
    <section className="py-32">
      <p className="text-3xl leading-snug italic text-ink md:text-4xl">
        {question}
      </p>
    </section>
  );
}
