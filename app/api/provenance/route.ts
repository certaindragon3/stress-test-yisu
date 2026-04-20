import {
  findMatch,
  resolveSource,
  windowAroundMatch,
} from "@/lib/provenance";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { source, text } = (await req.json()) as {
    source?: string;
    text?: string;
  };
  if (!source || !text) {
    return Response.json({ error: "source and text required" });
  }

  const resolved = resolveSource(source);
  if (!resolved) {
    return Response.json({ error: "provenance unavailable for this source" });
  }

  const match = findMatch(resolved.body, text);
  if (!match) {
    return Response.json({ error: "provenance unavailable for this quote" });
  }

  const windowed = windowAroundMatch(resolved.body, match.start, match.end);
  return Response.json(windowed);
}
