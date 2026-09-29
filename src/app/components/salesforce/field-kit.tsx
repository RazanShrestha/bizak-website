import * as React from "react";
import { cn } from "../ui/utils";
import { GHOST_SM, NUM, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { Rep } from "./data";
import { ACT_SHORT, addNote, custById, historyStore, notesStore } from "./field-data";
import type { ActResult, HistoryItem, Visit, VisitState } from "./field-data";

// ════════════════════════════════════════════════════════════════════════════
// FIELD · SMALL PARTS shared by Today, Plan, Visits, Reps, Targets
//
// The sales record's ActivityList reads its people from the productivity seed,
// which has no reps, so the field pages keep a quiet History + Notes of their
// own (brief: every record surface shows both).
// ════════════════════════════════════════════════════════════════════════════

/** A person's initials in a calm circle — the reps are not in the shared PEOPLE seed that bzw's Avatar reads. */
export function Initials({ rep, size = 28, className }: { rep: Rep | undefined; size?: number; className?: string }) {
  return (
    <span
      title={rep?.name}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm font-semibold leading-none text-bz-text", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {rep?.initials ?? "?"}
    </span>
  );
}

/** A micro label (10px, tracked) — used as a sub-heading inside panels. */
export function Micro({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft", className)}>{children}</p>;
}

/** A panel block: 13px title, space above, one hairline — no box. */
export function Block({ title, aside, children, className }: { title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mt-6 border-t border-bz-line-soft pt-5", className)}>
      <div className="mb-3 flex items-baseline gap-2">
        <h3 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h3>
        {aside && <div className="ml-auto text-[11px] text-bz-text-soft">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** "Order ✓  Stock ✓  Photo –" — what the playbook asked for and what was done. */
export function Ticks({ acts, state, className }: { acts: ActResult[]; state: VisitState; className?: string }) {
  if (!acts.length) return <span className={cn("text-[11px] text-bz-text-soft", className)}>No playbook for this type</span>;
  const open = state === "pending" || state === "missed" || state === "skipped";
  return (
    <span className={cn("flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]", className)}>
      {acts.map((a) => (
        <span key={a.activityId} className={cn("whitespace-nowrap", a.done ? "text-bz-text-muted" : "text-bz-text-soft")} title={a.required ? "Required" : "Optional"}>
          {ACT_SHORT[a.activityId] ?? a.activityId}
          {!open && <span className={cn("ml-1", a.done ? "text-bz-pos-deep" : a.required ? "text-bz-red" : "text-bz-text-soft")}>{a.done ? "✓" : "–"}</span>}
        </span>
      ))}
    </span>
  );
}

/** The mark on a timeline or strip: filled = done, ringed = here now, hollow = not yet, red = missed. */
export function VisitMark({ state, size = 10, title }: { state: VisitState; size?: number; title?: string }) {
  const cls = {
    done: "bg-bz-pos-deep border-bz-pos-deep",
    "in-progress": "bg-bz-surface border-bz-leaf-deep border-2",
    skipped: "bg-bz-amber border-bz-amber",
    pending: "bg-bz-surface border-bz-line",
    missed: "bg-bz-red-mark border-bz-red-mark",
  }[state];
  return <span title={title} className={cn("inline-block shrink-0 rounded-bz-pill border", cls)} style={{ width: size, height: size }} />;
}

/** One line of what a visit came to: the order, the no-order reason, the skip, or where it stands. */
export function outcomeOf(v: Visit): string {
  if (v.state === "pending") return "Not visited yet";
  if (v.state === "missed") return "Missed — no check-in";
  if (v.state === "skipped") return `Skipped · ${v.skipReason}`;
  if (v.state === "in-progress") return `Here since ${v.checkIn}`;
  if (v.orderValue > 0) return `Order NPR ${Math.round(v.orderValue).toLocaleString("en-US")} · ${v.lines} lines`;
  if (v.noOrderReason) return `No order · ${v.noOrderReason}`;
  return "Visited";
}

/** A thin horizontal read: label and figure on one line, a progress line beneath. No chart library. */
export function BarLine({ label, figure, pct, sub, tone = "good", onClick }: { label: React.ReactNode; figure: React.ReactNode; pct: number; sub?: React.ReactNode; tone?: "good" | "warn" | "danger"; onClick?: () => void }) {
  const body = (
    <>
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px]">
        <span className="min-w-0 truncate text-bz-text">{label}</span>
        <span className={cn("shrink-0 text-bz-text-muted", NUM)}>{figure}</span>
      </span>
      <span className="block h-1 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
        <span className={cn("block h-full rounded-bz-pill", tone === "danger" ? "bg-bz-red-mark" : tone === "warn" ? "bg-bz-amber" : "bg-bz-pos-deep")} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </span>
      {sub && <span className="mt-1 block text-[11px] text-bz-text-soft">{sub}</span>}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="block w-full text-left hover:opacity-80">
      {body}
    </button>
  ) : (
    <div>{body}</div>
  );
}

/**
 * A quiet plot of a day's outlets on the map tokens — not a map. Positions come from the outlet id, so the same
 * outlet sits in the same place every time; the line joins the visits in the order they happened.
 */
export function DayPlot({ visits, height = 140 }: { visits: Visit[]; height?: number }) {
  const W = 520;
  const H = height;
  const pos = (id: string) => {
    let h = 0;
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return { x: 36 + (h % 1000) / 1000 * (W - 72), y: 22 + ((h >>> 10) % 1000) / 1000 * (H - 44) };
  };
  const pts = visits.map((v) => ({ v, ...pos(v.customerId) }));
  const trail = pts.filter((p) => p.v.checkIn).sort((a, b) => (a.v.checkIn! < b.v.checkIn! ? -1 : 1));
  const here = pts.find((p) => p.v.state === "in-progress");
  const fill: Record<VisitState, string> = { done: "var(--bz-pos-deep)", "in-progress": "var(--bz-surface)", skipped: "var(--bz-amber)", pending: "var(--bz-surface)", missed: "var(--bz-red-mark)" };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full rounded-bz-lg" role="img" aria-label="Where today's outlets are">
      <rect width={W} height={H} rx={10} fill="var(--bz-map-land)" />
      <path d={`M-10 ${H * 0.72} C ${W * 0.25} ${H * 0.55}, ${W * 0.45} ${H * 0.95}, ${W + 10} ${H * 0.8}`} stroke="var(--bz-map-water)" strokeWidth={14} fill="none" />
      <path d={`M${W * 0.18} -10 L ${W * 0.3} ${H + 10}`} stroke="var(--bz-map-road)" strokeWidth={6} />
      <path d={`M-10 ${H * 0.34} L ${W + 10} ${H * 0.26}`} stroke="var(--bz-map-road)" strokeWidth={6} />
      <path d={`M${W * 0.66} -10 L ${W * 0.74} ${H + 10}`} stroke="var(--bz-map-road)" strokeWidth={5} />
      {trail.length > 1 && <polyline points={trail.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--bz-text-soft)" strokeWidth={1.25} strokeDasharray="3 4" />}
      {here && <circle cx={here.x} cy={here.y} r={11} fill="var(--bz-map-ring)" />}
      {pts.map((p) => (
        <circle key={p.v.id} cx={p.x} cy={p.y} r={p.v.state === "in-progress" ? 5 : 4} fill={fill[p.v.state]} stroke={p.v.state === "pending" ? "var(--bz-line)" : p.v.state === "in-progress" ? "var(--bz-leaf-deep)" : "none"} strokeWidth={p.v.state === "in-progress" ? 2 : 1.25}>
          <title>{`${custById(p.v.customerId).name}${p.v.checkIn ? ` · ${p.v.checkIn}` : ""}`}</title>
        </circle>
      ))}
    </svg>
  );
}

/**
 * History and Notes at the foot of a record. `seed` is the record's own trail (check-ins, orders); anything done
 * on these pages (a target changed, a plan moved) is appended under `recordKey` in the history store.
 */
export function HistoryNotes({ recordKey, seed = [] }: { recordKey: string; seed?: HistoryItem[] }) {
  const extra = useStore(historyStore)[recordKey] ?? [];
  const notes = useStore(notesStore)[recordKey] ?? [];
  const [draft, setDraft] = React.useState("");
  React.useEffect(() => setDraft(""), [recordKey]);
  const history = [...seed, ...extra];
  const save = () => {
    const t = draft.trim();
    if (!t) return;
    addNote(recordKey, t);
    setDraft("");
  };
  return (
    <>
      <Block title="Notes" aside={notes.length ? `${notes.length}` : undefined}>
        {notes.length > 0 && (
          <ul className="m-0 mb-3 flex list-none flex-col gap-3 p-0">
            {notes.map((n) => (
              <li key={n.id}>
                <p className="m-0 text-[11px] text-bz-text-soft">
                  <span className="font-semibold text-bz-text">{n.who}</span> · <span className={NUM}>{n.when}</span>
                </p>
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-bz-text">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
        <textarea
          aria-label="Add a note"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
          }}
          placeholder="Add a note for the team"
          className={cn(TEXTAREA, "min-h-[60px]")}
        />
        {draft.trim() && (
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={save} className={GHOST_SM}>
              Add note
            </button>
          </div>
        )}
      </Block>
      <Block title="History">
        {history.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing yet.</p>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {history.map((h) => (
              <li key={h.id} className="flex items-baseline gap-2.5 text-[11.5px] text-bz-text-muted">
                <span className="relative top-[-1px] size-1.5 shrink-0 rounded-bz-pill bg-bz-line" />
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-bz-text">{h.who}</span> {h.what}
                </span>
                <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{h.when}</span>
              </li>
            ))}
          </ol>
        )}
      </Block>
    </>
  );
}

/** "Mon 31 Aug" from an ISO date. */
export function shortDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]} ${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
}
