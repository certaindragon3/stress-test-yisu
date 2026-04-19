from __future__ import annotations

import argparse
from pathlib import Path

from mineru.cli.common import do_parse, read_fn
from mineru.utils.enum_class import MakeMode


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse one document with MinerU.")
    parser.add_argument("--input", action="append", required=True)
    parser.add_argument("--name", action="append")
    parser.add_argument("--output", required=True)
    parser.add_argument("--lang", action="append")
    parser.add_argument("--method", default="auto")
    parser.add_argument("--backend", default="pipeline")
    parser.add_argument("--formula", action="store_true")
    parser.add_argument("--no-table", action="store_true")
    args = parser.parse_args()

    sources = [Path(input_path) for input_path in args.input]
    names = args.name or [source.stem for source in sources]
    langs = args.lang or ["en"]

    if len(names) != len(sources):
        raise SystemExit("--name must be supplied once for each --input")

    if len(langs) == 1 and len(sources) > 1:
        langs = langs * len(sources)

    if len(langs) != len(sources):
        raise SystemExit("--lang must be supplied once or once for each --input")

    do_parse(
        output_dir=args.output,
        pdf_file_names=names,
        pdf_bytes_list=[
            read_fn(source, source.suffix.lower().lstrip(".")) for source in sources
        ],
        p_lang_list=langs,
        backend=args.backend,
        parse_method=args.method,
        formula_enable=args.formula,
        table_enable=not args.no_table,
        f_draw_layout_bbox=False,
        f_draw_span_bbox=False,
        f_dump_md=True,
        f_dump_middle_json=True,
        f_dump_model_output=False,
        f_dump_orig_pdf=False,
        f_dump_content_list=True,
        f_make_md_mode=MakeMode.MM_MD,
    )


if __name__ == "__main__":
    main()
