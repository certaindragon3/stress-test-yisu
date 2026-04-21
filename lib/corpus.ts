// Runtime-safe corpus export. The real data is baked at build time by
// scripts/bundle-corpus.mjs into lib/corpus.generated.ts so that this
// module can be imported from Cloudflare-deployed route handlers without
// filesystem access. Do not reintroduce fs calls here.

import { YISU_CORPUS } from "./corpus.generated";

export { YISU_CORPUS };
export const CORPUS_IS_EMPTY = YISU_CORPUS.length === 0;
