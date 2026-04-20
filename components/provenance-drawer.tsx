"use client";

import { useEffect, useRef, useState } from "react";

type ProvenanceSuccess = {
  piece: string;
  matchOffset: number;
  matchLength: number;
};

type ProvenanceError = { error: string };

type ProvenanceResponse = ProvenanceSuccess | ProvenanceError;

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: ProvenanceSuccess }
  | { kind: "error"; message: string };

export function ProvenanceDrawer({
  source,
  text,
}: {
  source: string;
  text: string;
}) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLElement | null>(null);

  function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    const next = e.currentTarget.open;
    setOpen(next);
    if (next && state.kind === "idle") {
      setState({ kind: "loading" });
      fetch("/api/provenance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source, text }),
      })
        .then((r) => r.json() as Promise<ProvenanceResponse>)
        .then((data) => {
          if ("error" in data) {
            setState({ kind: "error", message: data.error });
          } else {
            setState({ kind: "ok", data });
          }
        })
        .catch((err: Error) => {
          setState({ kind: "error", message: err.message });
        });
    }
  }

  useEffect(() => {
    if (!open || state.kind !== "ok") return;
    const panel = panelRef.current;
    const mark = markRef.current;
    if (!panel || !mark) return;
    const panelRect = panel.getBoundingClientRect();
    const markRect = mark.getBoundingClientRect();
    const target = markRect.top - panelRect.top - panelRect.height / 3;
    panel.scrollTop += target;
  }, [open, state]);

  return (
    <details
      className="mt-4 border-t border-neutral-100 pt-3"
      onToggle={handleToggle}
    >
      <summary className="small-caps cursor-pointer list-none text-[10px] text-neutral-500 hover:text-ink">
        {open ? "hide provenance ↑" : "show provenance ↓"}
      </summary>
      <div
        ref={panelRef}
        className="mt-4 max-h-80 overflow-y-auto border-l border-neutral-200 pl-6 text-sm leading-relaxed text-neutral-700"
      >
        {state.kind === "loading" ? (
          <p className="small-caps text-xs text-neutral-400">loading…</p>
        ) : null}
        {state.kind === "error" ? (
          <p className="small-caps text-xs text-neutral-400">{state.message}</p>
        ) : null}
        {state.kind === "ok" ? (
          <ProvenanceBody
            piece={state.data.piece}
            matchOffset={state.data.matchOffset}
            matchLength={state.data.matchLength}
            markRef={markRef}
          />
        ) : null}
      </div>
    </details>
  );
}

function ProvenanceBody({
  piece,
  matchOffset,
  matchLength,
  markRef,
}: {
  piece: string;
  matchOffset: number;
  matchLength: number;
  markRef: React.RefObject<HTMLElement | null>;
}) {
  const before = piece.slice(0, matchOffset);
  const match = piece.slice(matchOffset, matchOffset + matchLength);
  const after = piece.slice(matchOffset + matchLength);

  return (
    <div className="whitespace-pre-wrap break-words">
      {before}
      <mark ref={markRef} className="bg-ink-wash text-ink">
        {match}
      </mark>
      {after}
    </div>
  );
}
