import { z } from "zod";

export const QuoteSchema = z.object({
  text: z
    .string()
    .describe(
      "A short verbatim quotation from the Yisu corpus, ideally a single sentence copied exactly.",
    ),
  source: z
    .string()
    .describe("Essay title, and section heading where available."),
});

export const AxisSchema = z.object({
  prose: z
    .string()
    .describe("Diagnostic prose, 3 to 5 sentences, in Yisu's register."),
  quote: QuoteSchema.nullable().describe(
    "One supporting quotation from the corpus, or null when no honest quote fits.",
  ),
});

export const ReadingSchema = z.object({
  epistemological: AxisSchema,
  mastery: AxisSchema,
  jurisdictional: AxisSchema,
  question: z
    .string()
    .describe(
      "A single sentence written as a question, in Yisu's register. No leading 'So,' 'Thus,' 'Therefore,' or rhetorical 'But.'",
    ),
});

export const ModelQuoteSchema = z.object({
  quoteId: z
    .string()
    .describe(
      "The id of one retrieved quote sentence, copied exactly from a <quote id=\"...\"> tag in the retrieved corpus.",
    ),
});

export const ModelAxisSchema = z.object({
  prose: z
    .string()
    .describe("Diagnostic prose, 3 to 5 sentences, in Yisu's register."),
  quote: ModelQuoteSchema.nullable().describe(
    "Select one quoteId from the retrieved corpus, or null when no honest quote fits.",
  ),
});

export const ModelReadingSchema = z.object({
  epistemological: ModelAxisSchema,
  mastery: ModelAxisSchema,
  jurisdictional: ModelAxisSchema,
  question: z
    .string()
    .describe(
      "A single sentence written as a question, in Yisu's register. No leading 'So,' 'Thus,' 'Therefore,' or rhetorical 'But.'",
    ),
});

export type Quote = z.infer<typeof QuoteSchema>;
export type Axis = z.infer<typeof AxisSchema>;
export type Reading = z.infer<typeof ReadingSchema>;
export type ModelQuote = z.infer<typeof ModelQuoteSchema>;
export type ModelAxis = z.infer<typeof ModelAxisSchema>;
export type ModelReading = z.infer<typeof ModelReadingSchema>;
