import * as React from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FolderTree,
  ListTree,
  Play,
  SearchX,
} from "lucide-react";
import { AppShell } from "../SalesOrderListDesignPage";
import { cn } from "../ui/utils";
import {
  CARD,
  Crumb,
  ExplainDot,
  FailedBlock,
  GHOST_BTN,
  GrantToggle,
  INPUT,
  LABEL,
  LoadingRows,
  Lookup,
  MeterBar,
  NUM,
  Nil,
  PROJECT_OPTIONS,
  PRIMARY_BTN,
  ReadState,
  StateBlock,
  StatePreview,
  Tile,
  Toast,
  Unresolved,
  fmtH,
  money,
  useDocumentTitle,
  useToast,
} from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// TIMESHEET · PROJECT COST  (surface E — hours rolled up a project hierarchy)
//
// PRIMARY ACTION: read what a project actually cost, and know how much of that
// reading you can trust. So the four hour measures are never merged into one
// number, and the honesty measure — hours whose person had no cost rate, which
// therefore contributed NOTHING to the cost figure — sits beside the cost with
// attention treatment whenever it is non-zero.
//
// The whole surface is designed twice over: with the money grant and without
// it. Without it the monetary measures are absent from the data entirely, and
// the reading is still complete on hours alone. That is not a degraded view —
// it is the view every person who files hours gets.
// ════════════════════════════════════════════════════════════════════════════

type Leaf = {
  kind: "task" | "notask";
  id: string;
  name: string;
  estimate?: number; // hours estimate — task lines only
  actual: number;
  committed: number;
  chargeable: number;
  rateMissing: number;
  cost?: number; // present only with the money grant
};

type Branch = {
  kind: "project" | "unassigned";
  id: string;
  name: string;
  meta?: string;
  budget?: number; // monetary budget — project nodes only
  children: Node[];
};

type Node = Branch | Leaf;
const isBranch = (n: Node): n is Branch => n.kind === "project" || n.kind === "unassigned";

const task = (id: string, name: string, estimate: number, actual: number, committed: number, chargeable: number, rateMissing: number, cost: number): Leaf => ({
  kind: "task", id, name, estimate, actual, committed, chargeable, rateMissing, cost,
});
const noTask = (id: string, actual: number, committed: number, chargeable: number, rateMissing: number, cost: number): Leaf => ({
  kind: "notask", id, name: "No task", actual, committed, chargeable, rateMissing, cost,
});

const TREE: Branch[] = [
  {
    kind: "project", id: "PRJ-014", name: "Apex ERP Rollout", meta: "Apex Manufacturing Pvt Ltd", budget: 4800000,
    children: [
      {
        kind: "project", id: "PRJ-014-1", name: "Phase 1 · Finance", budget: 2100000,
        children: [
          task("TSK-4410", "Chart of accounts migration", 180, 148, 24, 148, 0, 340400),
          task("TSK-4421", "Opening balance reconciliation", 90, 76, 0, 76, 0, 174800),
          noTask("PRJ-014-1-NT", 32, 8, 0, 0, 73600),
        ],
      },
      {
        kind: "project", id: "PRJ-014-2", name: "Phase 2 · Inventory", budget: 1700000,
        children: [
          {
            kind: "project", id: "PRJ-014-2-A", name: "Warehouse cutover", budget: 640000,
            children: [task("TSK-4455", "Warehouse bin mapping", 120, 136, 0, 136, 16, 276000)],
          },
          task("TSK-4437", "Stock take procedure", 60, 58, 16, 58, 0, 133400),
        ],
      },
    ],
  },
  {
    kind: "project", id: "PRJ-021", name: "Himalayan POS Deployment", meta: "Himalayan Traders", budget: 1650000,
    children: [
      task("TSK-4489", "Sprint 14 — POS receipts", 200, 188, 42, 188, 0, 432400),
      task("TSK-4494", "Terminal hardware pilot", 80, 74, 0, 74, 0, 170200),
      noTask("PRJ-021-NT", 12, 6, 0, 0, 27600),
    ],
  },
  {
    kind: "project", id: "PRJ-030", name: "Everest Portal Revamp", meta: "Everest Hardware Supplies", budget: 950000,
    children: [task("TSK-4502", "Client training — batch 2", 90, 118, 0, 118, 24, 216200)],
  },
  {
    kind: "project", id: "PRJ-002", name: "Internal R&D", meta: "no client · internal", budget: 1200000,
    children: [
      task("TSK-4530", "Costing engine spike", 60, 44, 12, 0, 0, 101200),
      noTask("PRJ-002-NT", 26, 4, 0, 0, 59800),
    ],
  },
  {
    kind: "unassigned", id: "UNASSIGNED", name: "Unassigned", meta: "hours that belong to no project",
    children: [
      task("TSK-4517", "Accessibility audit", 40, 46.5, 0, 0, 0, 106950),
      task("TSK-4523", "Support rota — May", 120, 96, 18, 0, 18, 179400),
      noTask("UNASSIGNED-NT", 38, 12, 0, 12, 59800),
    ],
  },
];

// ── rollup ──────────────────────────────────────────────────────────────────
type Roll = { actual: number; committed: number; chargeable: number; rateMissing: number; cost?: number };

function roll(n: Node): Roll {
  if (!isBranch(n)) return { actual: n.actual, committed: n.committed, chargeable: n.chargeable, rateMissing: n.rateMissing, cost: n.cost };
  return n.children.reduce<Roll>(
    (acc, c) => {
      const r = roll(c);
      return {
        actual: acc.actual + r.actual,
        committed: acc.committed + r.committed,
        chargeable: acc.chargeable + r.chargeable,
        rateMissing: acc.rateMissing + r.rateMissing,
        cost: acc.cost === undefined || r.cost === undefined ? undefined : acc.cost + r.cost,
      };
    },
    { actual: 0, committed: 0, chargeable: 0, rateMissing: 0, cost: 0 },
  );
}

/** Without the grant the monetary measures are not in the data at all. */
function stripMoney(nodes: Node[]): Node[] {
  return nodes.map((n) => {
    if (isBranch(n)) {
      const { budget: _b, ...rest } = n;
      return { ...rest, children: stripMoney(n.children) } as Branch;
    }
    const { cost: _c, ...rest } = n;
    return rest as Leaf;
  });
}

const topLevelIds = (nodes: Node[]) => new Set(nodes.filter(isBranch).map((n) => n.id));

// ════════════════════════════════════════════════════════════════════════════
// TREE ROW
// ════════════════════════════════════════════════════════════════════════════

const CELL = "px-2.5 py-2 text-right text-[12px] whitespace-nowrap";

function Measures({ r, node, hasMoney }: { r: Roll; node: Node; hasMoney: boolean }) {
  const branch = isBranch(node);
  const budget = branch ? (node as Branch).budget : undefined;
  const estimate = !branch ? (node as Leaf).estimate : undefined;
  const over = hasMoney && budget !== undefined && r.cost !== undefined && r.cost > budget;
  return (
    <>
      {/* estimate (tasks) / budget (projects) — one is always inapplicable */}
      <td className={cn(CELL, "text-bz-text-muted")}>
        {estimate !== undefined ? (
          <span className={NUM}>{fmtH(estimate)}</span>
        ) : hasMoney && budget !== undefined ? (
          <span className={NUM}>{money(budget)}</span>
        ) : (
          <Nil />
        )}
      </td>
      <td className={cn(CELL, "font-semibold text-bz-text")}>
        <span className={NUM}>{fmtH(r.actual)}</span>
      </td>
      <td className={cn(CELL, "text-bz-text-muted")}>
        {r.committed === 0 ? <Nil /> : <span className={NUM}>{fmtH(r.committed)}</span>}
      </td>
      <td className={cn(CELL, "text-bz-text-muted")}>
        {r.chargeable === 0 ? <Nil /> : <span className={NUM}>{fmtH(r.chargeable)}</span>}
      </td>
      <td className={CELL}>
        {r.rateMissing === 0 ? (
          <Nil />
        ) : (
          <span className={cn("inline-flex items-center gap-1 rounded-bz-sm bg-[#FBE5E2] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#9A2E29]", NUM)}>
            {fmtH(r.rateMissing)}
          </span>
        )}
      </td>
      {hasMoney && (
        <>
          <td className={cn(CELL, "font-semibold text-bz-text")}>
            {r.cost === undefined ? <Unresolved /> : <span className={NUM}>{money(r.cost)}</span>}
          </td>
          <td className="w-[128px] px-2.5 py-2">
            {budget === undefined || r.cost === undefined ? (
              <div className="text-right">
                <Nil />
              </div>
            ) : (
              <div>
                <MeterBar pct={(r.cost / budget) * 100} fill={over ? "#C0413A" : "var(--bz-olive)"} height="h-1.5" />
                <p className={cn("mt-1 text-right text-[10px]", NUM, over ? "font-semibold text-[#9A2E29]" : "text-bz-text-muted")}>
                  {Math.round((r.cost / budget) * 100)}%{over ? " · over budget" : ""}
                </p>
              </div>
            )}
          </td>
        </>
      )}
    </>
  );
}

function TreeRows({
  nodes,
  depth,
  expanded,
  onToggle,
  hasMoney,
}: {
  nodes: Node[];
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  hasMoney: boolean;
}): React.ReactElement {
  return (
    <>
      {nodes.map((n) => {
        const r = roll(n);
        const branch = isBranch(n);
        const open = expanded.has(n.id);
        const unassigned = n.kind === "unassigned" || n.kind === "notask";
        return (
          <React.Fragment key={n.id}>
            <tr
              onClick={() => branch && onToggle(n.id)}
              className={cn(
                "border-b border-bz-line-soft",
                branch && "cursor-pointer hover:bg-bz-paper-warm/50",
                depth === 0 && "bg-bz-paper-warm/30",
              )}
            >
              <td className="py-2 pl-2 pr-2">
                <div className="flex min-w-0 items-center gap-1.5" style={{ paddingLeft: depth * 18 }}>
                  {branch ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted">
                      {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </span>
                  ) : (
                    <span className="size-5 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-bz-sm",
                      unassigned ? "bg-bz-paper-warm text-bz-text-soft" : branch ? "bg-bz-olive/[0.08] text-bz-text" : "bg-bz-leaf/40 text-bz-text",
                    )}
                  >
                    {branch ? <FolderTree size={11} /> : <ListTree size={11} />}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block truncate", depth === 0 ? "text-[12.5px] font-semibold text-bz-text" : "text-[12.5px] text-bz-text")}>
                      {n.name}
                      {unassigned && (
                        <span className="ml-1.5 inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1 text-[9px] font-bold uppercase tracking-[0.05em] text-bz-text-soft">
                          unattributed
                        </span>
                      )}
                    </span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {isBranch(n) ? n.meta ?? n.id : n.kind === "task" ? n.id : "hours with no task on this project"}
                    </span>
                  </span>
                </div>
              </td>
              <Measures r={r} node={n} hasMoney={hasMoney} />
            </tr>
            {branch && open && <TreeRows nodes={(n as Branch).children} depth={depth + 1} expanded={expanded} onToggle={onToggle} hasMoney={hasMoney} />}
          </React.Fragment>
        );
      })}
    </>
  );
}

// mobile — the same tree, stacked, with the measures as a small grid
function TreeCards({
  nodes,
  depth,
  expanded,
  onToggle,
  hasMoney,
}: {
  nodes: Node[];
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  hasMoney: boolean;
}): React.ReactElement {
  return (
    <>
      {nodes.map((n) => {
        const r = roll(n);
        const branch = isBranch(n);
        const open = expanded.has(n.id);
        const budget = branch ? (n as Branch).budget : undefined;
        const over = hasMoney && budget !== undefined && r.cost !== undefined && r.cost > budget;
        return (
          <React.Fragment key={n.id}>
            <div
              onClick={() => branch && onToggle(n.id)}
              className={cn("border-b border-bz-line-soft px-3 py-3", branch && "cursor-pointer")}
              style={{ paddingLeft: 12 + depth * 14 }}
            >
              <div className="flex items-start gap-2">
                {branch ? (
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-bz-text-muted">
                    {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </span>
                ) : (
                  <span className="size-5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate", depth === 0 ? "text-[13px] font-semibold text-bz-text" : "text-[12.5px] text-bz-text")}>{n.name}</p>
                  <p className={cn("truncate text-[10.5px] text-bz-text-soft", NUM)}>{isBranch(n) ? n.meta ?? n.id : n.id}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-bz-sm bg-bz-paper-warm px-2 py-1.5">
                      <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">Actual</p>
                      <p className={cn("mt-0.5 text-[13px] font-semibold text-bz-text", NUM)}>{fmtH(r.actual)}</p>
                    </div>
                    <div className="rounded-bz-sm bg-bz-paper-warm/60 px-2 py-1.5">
                      <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">Committed</p>
                      <p className={cn("mt-0.5 text-[13px] text-bz-text-muted", NUM)}>{r.committed ? fmtH(r.committed) : "—"}</p>
                    </div>
                    <div className="rounded-bz-sm bg-bz-paper-warm/60 px-2 py-1.5">
                      <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">Chargeable</p>
                      <p className={cn("mt-0.5 text-[13px] text-bz-text-muted", NUM)}>{r.chargeable ? fmtH(r.chargeable) : "—"}</p>
                    </div>
                    <div className={cn("rounded-bz-sm px-2 py-1.5", r.rateMissing ? "bg-[#FBE5E2]" : "bg-bz-paper-warm/60")}>
                      <p className={cn("text-[9.5px] uppercase tracking-[0.06em]", r.rateMissing ? "text-[#9A2E29]" : "text-bz-text-soft")}>No rate</p>
                      <p className={cn("mt-0.5 text-[13px] font-semibold", NUM, r.rateMissing ? "text-[#9A2E29]" : "text-bz-text-soft")}>
                        {r.rateMissing ? fmtH(r.rateMissing) : "—"}
                      </p>
                    </div>
                    {hasMoney && (
                      <div className="col-span-2 rounded-bz-sm bg-bz-paper-warm px-2 py-1.5">
                        <p className="text-[9.5px] uppercase tracking-[0.06em] text-bz-text-soft">
                          Cost {budget !== undefined ? "vs budget" : ""}
                        </p>
                        <p className={cn("mt-0.5 text-[13px] font-semibold text-bz-text", NUM)}>
                          NPR {r.cost === undefined ? "—" : money(r.cost)}
                          {budget !== undefined && <span className="text-bz-text-muted"> / {money(budget)}</span>}
                        </p>
                        {budget !== undefined && r.cost !== undefined && (
                          <div className="mt-1.5">
                            <MeterBar pct={(r.cost / budget) * 100} fill={over ? "#C0413A" : "var(--bz-olive)"} height="h-1.5" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {branch && open && <TreeCards nodes={(n as Branch).children} depth={depth + 1} expanded={expanded} onToggle={onToggle} hasMoney={hasMoney} />}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function ProjectCostRollupDesignPage() {
  useDocumentTitle("Project Cost");
  const { toast, show, clear } = useToast();

  const [hasMoney, setHasMoney] = React.useState(true);
  const [read, setRead] = React.useState<ReadState>("loading");
  const [preview, setPreview] = React.useState<"ready" | "loading" | "empty" | "failed">("ready");

  // narrowing — month-to-date by default, and an EXPLICIT run
  const [from, setFrom] = React.useState("2026-06-01");
  const [to, setTo] = React.useState("2026-06-15");
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [draftDirty, setDraftDirty] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  const source = React.useMemo(() => (hasMoney ? (TREE as Node[]) : stripMoney(TREE as Node[])), [hasMoney]);
  const scoped = React.useMemo(() => {
    if (!projectId) return source;
    const find = (nodes: Node[]): Node | null => {
      for (const n of nodes) {
        if (n.id === projectId) return n;
        if (isBranch(n)) {
          const hit = find(n.children);
          if (hit) return hit;
        }
      }
      return null;
    };
    const hit = find(source);
    return hit ? [hit] : [];
  }, [source, projectId]);

  // a fresh query discards the reader's expansion and reopens the top level only
  const [expanded, setExpanded] = React.useState<Set<string>>(() => topLevelIds(TREE as Node[]));

  React.useEffect(() => {
    setRead("loading");
    const t = window.setTimeout(() => setRead(preview === "loading" ? "loading" : preview), 520);
    return () => window.clearTimeout(t);
  }, [preview]);

  const totals = React.useMemo(
    () =>
      scoped.reduce<Roll>(
        (acc, n) => {
          const r = roll(n);
          return {
            actual: acc.actual + r.actual,
            committed: acc.committed + r.committed,
            chargeable: acc.chargeable + r.chargeable,
            rateMissing: acc.rateMissing + r.rateMissing,
            cost: acc.cost === undefined || r.cost === undefined ? undefined : acc.cost + r.cost,
          };
        },
        { actual: 0, committed: 0, chargeable: 0, rateMissing: 0, cost: hasMoney ? 0 : undefined },
      ),
    [scoped, hasMoney],
  );

  const runQuery = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setDraftDirty(false);
      setExpanded(topLevelIds(scoped));
      show("info", "Re-queried — the tree reopens at the top level only.");
    }, 620);
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const empty = preview === "empty" || scoped.length === 0;

  return (
    <AppShell breadcrumb={<Crumb page="Project Cost" />} overlay={<Toast toast={toast} onDismiss={clear} offset="bottom-6" />}>
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Project Cost</h1>
            <p className="mt-1 max-w-[620px] text-[12.5px] leading-[1.55] text-bz-text-muted">
              Recorded hours rolled up a project hierarchy{hasMoney ? ", read against each project's budget" : ""}. Nothing is
              dropped on the way up — hours with no project and hours with no task are categories here, not errors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GrantToggle value={hasMoney} onChange={setHasMoney} />
            <StatePreview
              value={preview}
              onChange={setPreview}
              options={[
                { value: "ready", label: "Loaded" },
                { value: "loading", label: "Loading" },
                { value: "empty", label: "Nothing in range" },
                { value: "failed", label: "Failed read" },
              ]}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-10 pt-4 md:px-8">
        {/* ── narrowing with an explicit run ───────────────────────────── */}
        <div className={cn(CARD, "flex flex-wrap items-end gap-3 p-3.5")}>
          <div>
            <p className={cn(LABEL, "mb-1.5")}>From</p>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setDraftDirty(true);
              }}
              className={cn(INPUT, NUM, "w-[152px]")}
            />
          </div>
          <div>
            <p className={cn(LABEL, "mb-1.5")}>To</p>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setDraftDirty(true);
              }}
              className={cn(INPUT, NUM, "w-[152px]")}
            />
          </div>
          <div className="min-w-[220px] flex-1" style={{ maxWidth: 340 }}>
            <p className={cn(LABEL, "mb-1.5")}>Focus on one project</p>
            <Lookup
              value={projectId}
              options={PROJECT_OPTIONS}
              placeholder="Every project"
              searchPlaceholder="Search projects…"
              clearLabel="Every project"
              width={340}
              onChange={(v) => {
                setProjectId(v);
                setDraftDirty(true);
              }}
            />
          </div>
          <button onClick={runQuery} disabled={running} className={cn(PRIMARY_BTN, "h-9")}>
            <Play size={12} /> {running ? "Running…" : "Run"}
          </button>
          {draftDirty && (
            <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text">
              <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
              Narrowing changed — the reading below is still the previous query.
            </p>
          )}
        </div>

        {/* ── whole-query totals ───────────────────────────────────────── */}
        <div className={cn("grid gap-3", hasMoney ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4")}>
          <Tile
            label="Actual hours"
            hint={
              <ExplainDot
                title="Actual vs committed"
                body="Actual is settled hours — endorsed, and the only countable spend. Committed is recorded but not yet endorsed: a pipeline figure. Reading them as one number is the single most common way to draw the wrong conclusion here, so they are never added together."
              />
            }
          >
            <p className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>{fmtH(totals.actual)}</p>
            <p className="mt-1.5 text-[10.5px] text-bz-text-muted">settled — countable spend</p>
          </Tile>
          <Tile label="Committed hours" tone="quiet">
            <p className={cn("text-[19px] font-semibold leading-none text-bz-text-muted", NUM)}>{fmtH(totals.committed)}</p>
            <p className="mt-1.5 text-[10.5px] text-bz-text-soft">recorded, not yet endorsed</p>
          </Tile>
          <Tile label="Chargeable hours">
            <p className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>{fmtH(totals.chargeable)}</p>
            <p className="mt-1.5 text-[10.5px] text-bz-text-muted">
              {Math.round((totals.chargeable / Math.max(1, totals.actual)) * 100)}% of actual is billable
            </p>
          </Tile>
          <Tile
            label="Hours with no rate"
            tone={totals.rateMissing > 0 ? "attention" : "normal"}
            hint={
              <ExplainDot
                tone={totals.rateMissing > 0 ? "attention" : "neutral"}
                title="How much the cost reading is understated by"
                body="These are settled hours whose person had no applicable cost rate on the day they were worked. They contributed nothing at all to the cost figure — so the cost you are reading is short by exactly this much work."
                exit="Give those people a cost rate for the period, then re-run this query."
              />
            }
          >
            <p className={cn("text-[19px] font-semibold leading-none", NUM, totals.rateMissing > 0 ? "text-[#9A2E29]" : "text-bz-text")}>
              {fmtH(totals.rateMissing)}
            </p>
            <p className={cn("mt-1.5 text-[10.5px]", totals.rateMissing > 0 ? "text-[#9A2E29]" : "text-bz-text-muted")}>
              contributed nothing to cost
            </p>
          </Tile>
          {hasMoney && (
            <Tile label="Accumulated cost">
              <p className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-[11px] font-semibold text-bz-text-muted">NPR</span>
                <span className={cn("text-[19px] font-semibold leading-none text-bz-text", NUM)}>
                  {totals.cost === undefined ? "—" : money(totals.cost)}
                </span>
              </p>
              <p className="mt-1.5 text-[10.5px] text-bz-text-muted">resolved at the moment of reading, never stored on the timesheet</p>
            </Tile>
          )}
        </div>

        {!hasMoney && (
          <p className="flex items-start gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 text-[11.5px] leading-[1.55] text-bz-text-muted">
            <AlertTriangle size={12} className="mt-0.5 shrink-0 text-bz-text-soft" />
            You do not have the money grant, so cost and budget are not part of this reading at all — they were never sent. Everything
            above and below is complete on hours alone.
          </p>
        )}

        {/* ── the tree ─────────────────────────────────────────────────── */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bz-line-soft px-4 py-2.5">
            <p className="text-[12.5px] font-semibold text-bz-text">
              {projectId ? "One project" : "Every project"}
              <span className="ml-2 text-[11px] font-normal text-bz-text-muted">
                figures roll up from task lines through every level of nesting
              </span>
            </p>
            <button
              onClick={() => setExpanded(expanded.size > 0 ? new Set() : topLevelIds(scoped))}
              className={GHOST_BTN}
            >
              {expanded.size > 0 ? "Collapse all" : "Expand the top level"}
            </button>
          </div>

          {read === "loading" ? (
            <LoadingRows label="Rolling up the hierarchy…" />
          ) : read === "failed" ? (
            <FailedBlock what="the project rollup" detail="PROJECT_COST_ROLLUP · the costing service did not answer." onRetry={() => setPreview("ready")} />
          ) : empty ? (
            <StateBlock
              icon={<SearchX size={22} />}
              title="No hours were recorded in this range"
              body={
                <>
                  The totals above still stand for the query you ran — they are simply zero across the board. Widen the dates, or
                  clear the project focus, and run again.
                </>
              }
              action={
                <button
                  onClick={() => {
                    setPreview("ready");
                    setProjectId(null);
                  }}
                  className={cn(GHOST_BTN, "mt-1")}
                >
                  Clear the focus and re-run
                </button>
              }
            />
          ) : (
            <>
              {/* desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left" style={{ minWidth: hasMoney ? 1080 : 800 }}>
                  <thead>
                    <tr className="border-b border-bz-line bg-bz-paper-warm">
                      <th className="px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Project · task</th>
                      <th className="px-2.5 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">
                        {hasMoney ? "Estimate / budget" : "Estimate"}
                      </th>
                      <th className="px-2.5 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text">Actual</th>
                      <th className="px-2.5 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">Committed</th>
                      <th className="px-2.5 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Chargeable</th>
                      <th className="px-2.5 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">No rate</th>
                      {hasMoney && (
                        <>
                          <th className="px-2.5 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">Cost · NPR</th>
                          <th className="px-2.5 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.06em] text-bz-text-muted">vs budget</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <TreeRows nodes={scoped} depth={0} expanded={expanded} onToggle={toggle} hasMoney={hasMoney} />
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-bz-line bg-bz-paper-warm/60">
                      <td className="px-3 py-2.5 text-[11.5px] font-semibold text-bz-text">Whole query</td>
                      <td className={cn(CELL, "text-bz-text-soft")}>
                        <Nil />
                      </td>
                      <td className={cn(CELL, "text-[12.5px] font-semibold text-bz-text", NUM)}>{fmtH(totals.actual)}</td>
                      <td className={cn(CELL, "text-bz-text-muted", NUM)}>{fmtH(totals.committed)}</td>
                      <td className={cn(CELL, "text-bz-text-muted", NUM)}>{fmtH(totals.chargeable)}</td>
                      <td className={cn(CELL, NUM, totals.rateMissing > 0 ? "font-semibold text-[#9A2E29]" : "text-bz-text-soft")}>
                        {totals.rateMissing > 0 ? fmtH(totals.rateMissing) : <Nil />}
                      </td>
                      {hasMoney && (
                        <>
                          <td className={cn(CELL, "text-[12.5px] font-semibold text-bz-text", NUM)}>
                            {totals.cost === undefined ? <Unresolved /> : money(totals.cost)}
                          </td>
                          <td className={cn(CELL, "text-bz-text-soft")}>
                            <Nil />
                          </td>
                        </>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* mobile */}
              <div className="md:hidden">
                <TreeCards nodes={scoped} depth={0} expanded={expanded} onToggle={toggle} hasMoney={hasMoney} />
                <div className="flex flex-wrap items-center justify-between gap-2 bg-bz-paper-warm/60 px-4 py-3">
                  <p className="text-[11.5px] font-semibold text-bz-text">Whole query</p>
                  <p className={cn("text-[13px] font-semibold text-bz-text", NUM)}>{fmtH(totals.actual)} actual</p>
                </div>
              </div>
            </>
          )}
        </section>

        <p className="text-[10.5px] leading-[1.6] text-bz-text-soft">
          A dash means the measure does not apply to that kind of node — a budget on a task line, an hours estimate on a project —
          or that it is genuinely absent. A real zero is always printed as <span className={NUM}>0.00</span>, so the two never look
          alike.
        </p>
      </div>
    </AppShell>
  );
}
