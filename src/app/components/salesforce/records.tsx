import * as React from "react";
import { cn } from "../ui/utils";
import { useStore } from "../sales/store";
import { ME } from "../productivity/shared";
import { SF_NOW, SF_TODAY } from "./data";
import type { LogRow, Note } from "./data";
import { dayTime } from "./engine";
import { historyStore, notesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// HISTORY + NOTES — every record has both (repo rule, bizak-record-history)
//
// One store for the whole prototype, keyed by record id, so an order's notes
// are the same in Orders, on its sales order and on the dealer portal.
// A company note is private unless "Share with the customer" is ticked; the
// portal shows only shared notes (owner decision #19) and every note a dealer
// writes is shared by nature.
// ════════════════════════════════════════════════════════════════════════════

const stamp = () => `${SF_TODAY} ${SF_NOW}`;
let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** Company-side user name (the prototype's signed-in staff member). */
export const STAFF_NAME = ME.name;

/** Append a history line to a record: logEvent("SO-5012", "approved it and billed NPR 1,898"). */
export function logEvent(recordId: string, what: string, who: string = STAFF_NAME) {
  historyStore.set((h) => ({ ...h, [recordId]: [...(h[recordId] ?? []), { id: uid("h"), who, when: stamp(), what }] }));
}

export function addNote(recordId: string, body: string, opts: { who?: string; shared?: boolean } = {}) {
  const text = body.trim();
  if (!text) return;
  notesStore.set((n) => ({ ...n, [recordId]: [...(n[recordId] ?? []), { id: uid("n"), who: opts.who ?? STAFF_NAME, when: stamp(), body: text, shared: !!opts.shared }] }));
}

export function useHistory(recordId: string): LogRow[] {
  return useStore(historyStore)[recordId] ?? [];
}
export function useNotes(recordId: string, opts: { sharedOnly?: boolean } = {}): Note[] {
  const all = useStore(notesStore)[recordId] ?? [];
  return opts.sharedOnly ? all.filter((n) => n.shared) : all;
}

/**
 * The foot of every record panel: History and Notes in one quiet timeline, with a note box.
 * `recordIds` lets a record show history filed under related ids too (a price request and its estimates).
 * `audience`: "company" (default) can share a note with the customer; "portal" sees and writes shared notes only.
 */
export function RecordFoot({ recordId, recordIds, audience = "company", author, className }: { recordId: string; recordIds?: string[]; audience?: "company" | "portal"; author?: string; className?: string }) {
  const history = useStore(historyStore);
  const notes = useStore(notesStore);
  const ids = [recordId, ...(recordIds ?? [])];
  const [body, setBody] = React.useState("");
  const [share, setShare] = React.useState(false);
  const [show, setShow] = React.useState<"all" | "notes" | "history">("all");
  const portal = audience === "portal";

  const items = [
    ...ids.flatMap((id) => (notes[id] ?? []).filter((n) => !portal || n.shared).map((n) => ({ kind: "note" as const, ...n, text: n.body }))),
    ...(portal ? [] : ids.flatMap((id) => (history[id] ?? []).map((h) => ({ kind: "log" as const, ...h, text: h.what, shared: false })))),
  ]
    .filter((x) => show === "all" || (show === "notes" ? x.kind === "note" : x.kind === "log"))
    .sort((a, b) => a.when.localeCompare(b.when));

  const send = () => {
    if (!body.trim()) return;
    addNote(recordId, body, { who: author ?? STAFF_NAME, shared: portal || share });
    setBody("");
    setShare(false);
  };

  return (
    <section className={cn("border-t border-bz-line-soft pt-5", className)} aria-label="History and notes">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="m-0 text-[13px] font-semibold text-bz-text">{portal ? "Messages" : "History and notes"}</h3>
        {!portal && (
          <div className="ml-auto flex items-center gap-1 text-[11px]">
            {(["all", "notes", "history"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setShow(k)} className={cn("rounded-bz-pill px-2 py-0.5 capitalize", show === k ? "bg-bz-paper-warm font-semibold text-bz-text" : "text-bz-text-soft hover:text-bz-text")}>
                {k}
              </button>
            ))}
          </div>
        )}
      </div>
      {items.length === 0 ? (
        <p className="m-0 text-[11.5px] text-bz-text-soft">{portal ? "No messages yet." : "Nothing yet — changes and notes will show here."}</p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {items.map((x) => (
            <li key={x.id} className="flex gap-2.5 text-[12px]">
              <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-bz-pill", x.kind === "note" ? "bg-bz-text-muted" : "bg-bz-line")} />
              <span className="min-w-0 flex-1">
                <span className={x.kind === "note" ? "text-bz-text" : "text-bz-text-muted"}>
                  <span className="font-medium text-bz-text">{x.who}</span> {x.kind === "note" ? <>· {x.text}</> : x.text}
                </span>
                <span className="block text-[10.5px] text-bz-text-soft">
                  {dayTime(x.when)}
                  {x.kind === "note" && !portal && x.shared && " · shared with the customer"}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), send())}
          placeholder={portal ? "Write a message…" : "Add a note…"}
          className="h-8 min-w-0 flex-1 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
        />
        {!portal && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-bz-text-muted">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="accent-current" />
            Share with the customer
          </label>
        )}
        <button type="button" disabled={!body.trim()} onClick={send} className="h-8 rounded-bz-md border border-bz-line px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:opacity-40">
          {portal ? "Send" : "Add"}
        </button>
      </div>
    </section>
  );
}
