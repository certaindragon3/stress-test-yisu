# Yisu Data Workflow

This workflow keeps machine-extracted research material separate from the
instrument corpus.

## Boundaries

- `Yisu data/` is the raw archive. Do not edit files in place.
- `data/processed/` is generated working material. It is ignored by Git.
- `content/corpus/` is the curated corpus used by the instrument. Do not move
  generated Markdown into it until the source, authorship, and quotation policy
  have been checked by a person.

## Commands

Build a source inventory:

```bash
pnpm yisu:manifest
```

Convert what can be converted without OCR:

```bash
pnpm yisu:convert
```

This converts DOCX files with Pandoc and marks PDF files as `pending_ocr` in the
conversion report.

After installing MinerU, run OCR for PDFs:

```bash
pnpm yisu:convert -- --pdf
```

For a resumable first pass over candidate publication PDFs, use:

```bash
pnpm yisu:convert -- --pdf --pdf-only --collection=publications_2013-2026
```

Existing Markdown outputs are skipped unless `--force` is supplied. The local
MinerU environment lives in `.venv-mineru/` and is ignored by Git.

Audit the current processed state:

```bash
pnpm yisu:audit
```

## Review Policy

The generated Markdown includes frontmatter with `entered_corpus: false` and
`quoteable: false`. Those flags should only change after human review.

Suggested review order:

1. Interview materials, because they are closest to Yisu's own spoken or edited
   register.
2. Single-authored publications or book reviews.
3. Co-authored publications, with care about whether a passage can be attributed
   to Yisu.
4. Translations, which should remain background material rather than direct
   Yisu corpus unless the instrument is explicitly redesigned for that purpose.

When a piece is promoted into `content/corpus/`, copy the whole reviewed text,
preserve its source title, and then run the quote verification checks before
using it in the live instrument.
