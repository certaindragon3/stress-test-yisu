import { YISU_CORPUS } from "@/lib/corpus";
import { verifyQuote } from "@/lib/verify";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  const verified = verifyQuote(text ?? "", YISU_CORPUS);
  return Response.json({ verified });
}
