import * as React from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  X,
  Check,
  Loader2,
  Lock,
  Home,
  Share2,
  Archive,
  ArchiveRestore,
  Copy,
  Trash2,
  Bookmark,
  Store,
  Download,
  Sparkles,
  Inbox,
  SearchX,
  Ban,
  Info,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  UserRound,
  Blocks,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import {
  Popover,
  GhostButton,
  Modal,
  ConfirmDialog,
  Toast,
  MoodNotice,
  SimplePicker,
  FIGURES,
  type ConfirmSpec,
} from "./DashboardStudioDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARDS · LIBRARY — the entry point to the whole capability
//
// PRIMARY ACTION: get to a WORKING board. Not "manage records" — the person who
// lands here mostly wants to open the board they already read every morning, or
// to acquire one without assembling anything. So:
//   - the list is the page, and every row's biggest hit-target is "Open";
//   - the two ways to ACQUIRE a board (start one, or install one someone else
//     published) sit at the top as one primary and one ghost;
//   - everything administrative about a board (who can see it, whether it is
//     your landing page, who it is shared with, archive / duplicate / delete)
//     is folded INSIDE the row and only unfolds when asked for. One row open at
//     a time, so the page never presents more than one board's worth of choice.
//
// THREE TABS, because three genuinely different questions are asked here:
//   My boards · Catalogue (complete boards someone else published) · Saved
//   figures (the ONE home for "define once, reuse many").
//
// VOCABULARY FIX: "template" used to name two unrelated things. Here it names
// exactly one — a complete, installable board in the catalogue. The stripped,
// figure-less "layout template" is gone; it could only ever produce empty tiles.
//
// STATES NOT VISIBLE ON FIRST LOAD: delete the provided board to see the server
// refusal and the persistent error line; filter to Archived for no-results;
// delete every board to reach the first-run offer (whose assisted build refuses
// once, names what is missing, then succeeds on the second check); open
// "Retail Operations Pack" in the catalogue for a BLOCKED dry run; the update
// strip carries one breaking update that needs two deliberate acts.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

// ════════════════════════════════════════════════════════════════════════════
// MODEL
// ════════════════════════════════════════════════════════════════════════════

type Audience = "private" | "organisation";
type Grant = { id: string; kind: "person" | "role" | "department"; name: string; level: "view" | "edit" };

type BoardRow = {
  id: string;
  name: string;
  summary: string;
  tiles: number;
  updated: string;
  owner: string;
  mine: boolean;
  provided: boolean;
  archived: boolean;
  landing: boolean;
  audience: Audience;
  grants: Grant[];
};

const SEED_BOARDS: BoardRow[] = [
  {
    id: "bd-ops",
    name: "Trading — Monthly Command",
    summary: "Invoicing, collections, receivables and stock cover for the trading company.",
    tiles: 11,
    updated: "2 hours ago",
    owner: "You",
    mine: true,
    provided: false,
    archived: false,
    landing: true,
    audience: "organisation",
    grants: [
      { id: "g1", kind: "role", name: "Branch Manager", level: "view" },
      { id: "g2", kind: "person", name: "R. Gurung", level: "edit" },
    ],
  },
  {
    id: "bd-exec",
    name: "Executive Overview",
    summary: "Group revenue, spend and margin. Published and maintained by Bizak.",
    tiles: 5,
    updated: "Aug 30",
    owner: "Bizak",
    mine: false,
    provided: true,
    archived: false,
    landing: false,
    audience: "organisation",
    grants: [],
  },
  {
    id: "bd-wh",
    name: "Warehouse Floor",
    summary: "Movements, ageing and reorder pressure across the four depots.",
    tiles: 8,
    updated: "Yesterday",
    owner: "S. Tamang",
    mine: false,
    provided: false,
    archived: false,
    landing: false,
    audience: "organisation",
    grants: [],
  },
  {
    id: "bd-cash",
    name: "Cash Watch",
    summary: "Daily bank position, receipts and cheques in clearing.",
    tiles: 6,
    updated: "Sep 1",
    owner: "You",
    mine: true,
    provided: false,
    archived: false,
    landing: false,
    audience: "private",
    grants: [],
  },
  {
    id: "bd-fy24",
    name: "FY24 Close",
    summary: "Kept for reference after the year-end close.",
    tiles: 9,
    updated: "Jul 18",
    owner: "You",
    mine: true,
    provided: false,
    archived: true,
    landing: false,
    audience: "private",
    grants: [],
  },
];

const PRINCIPALS: { kind: Grant["kind"]; name: string }[] = [
  { kind: "person", name: "A. Shrestha" },
  { kind: "person", name: "P. Adhikari" },
  { kind: "person", name: "M. Rai" },
  { kind: "role", name: "Branch Manager" },
  { kind: "role", name: "Accountant" },
  { kind: "department", name: "Sales" },
  { kind: "department", name: "Warehouse" },
];

const GRANT_ICON: Record<Grant["kind"], React.ComponentType<{ size?: number; className?: string }>> = {
  person: UserRound,
  role: ShieldCheck,
  department: Building2,
};

// ── catalogue ───────────────────────────────────────────────────────────────

type CatalogueEntry = {
  id: string;
  name: string;
  summary: string;
  description: string;
  kind: "Finance" | "Operations" | "Retail" | "People";
  scope: "Bizak" | "Your organisation";
  industry: string;
  audience: string;
  version: string;
  installs: number;
  blocked?: string;
  history: { v: string; when: string; note: string; verified: boolean }[];
};

const CATALOGUE: CatalogueEntry[] = [
  {
    id: "cat-exec",
    name: "Executive Overview",
    summary: "Revenue, spend, margin and headcount on one screen.",
    description:
      "The board most finance leads start from. Five tiles: invoiced amount, supplier spend, gross margin, a branch league table and a headcount split. Every figure follows the range and branch chosen while reading.",
    kind: "Finance",
    scope: "Bizak",
    industry: "Any",
    audience: "Leadership",
    version: "4.0",
    installs: 1284,
    history: [
      { v: "4.0", when: "Aug 30, 2026", note: "Branch league table replaces the old regional pie.", verified: true },
      { v: "3.2", when: "May 12, 2026", note: "Margin now excludes intra-group transfers.", verified: true },
      { v: "3.0", when: "Jan 8, 2026", note: "First release for the new figure engine.", verified: true },
    ],
  },
  {
    id: "cat-recv",
    name: "Receivables Watch",
    summary: "Ageing, overdue balances and who to chase this week.",
    description:
      "Four tiles built for a credit controller: total overdue, ageing composition, the ten customers who owe the most, and average days to pay by branch.",
    kind: "Finance",
    scope: "Bizak",
    industry: "Trading",
    audience: "Credit control",
    version: "2.1",
    installs: 861,
    history: [
      { v: "2.1", when: "Aug 4, 2026", note: "Ageing buckets follow the company's credit policy.", verified: true },
      { v: "2.0", when: "Feb 2, 2026", note: "Adds days-to-pay by branch.", verified: true },
    ],
  },
  {
    id: "cat-retail",
    name: "Retail Operations Pack",
    summary: "Till performance, basket size and stock cover per outlet.",
    description:
      "Designed for multi-outlet retail. Needs the Point of Sale module — without it, four of its seven tiles have nothing to read.",
    kind: "Retail",
    scope: "Bizak",
    industry: "Multi-outlet",
    audience: "Store ops",
    version: "1.4",
    installs: 402,
    blocked: "Point of Sale is not enabled on this installation.",
    history: [{ v: "1.4", when: "Jul 22, 2026", note: "Adds basket-size trend.", verified: true }],
  },
  {
    id: "cat-wh",
    name: "Warehouse Floor",
    summary: "Movements, ageing and reorder pressure across depots.",
    description:
      "Six tiles covering inbound, outbound, stock value by warehouse, ageing composition and the items sitting below their reorder point.",
    kind: "Operations",
    scope: "Your organisation",
    industry: "Distribution",
    audience: "Warehouse",
    version: "1.1",
    installs: 37,
    history: [{ v: "1.1", when: "Aug 19, 2026", note: "Published internally by S. Tamang.", verified: false }],
  },
  {
    id: "cat-people",
    name: "People & Attendance",
    summary: "Headcount, attendance rate and departmental split.",
    description: "Three tiles that answer the questions an HR lead is asked in every Monday meeting.",
    kind: "People",
    scope: "Bizak",
    industry: "Any",
    audience: "HR",
    version: "1.0",
    installs: 219,
    history: [{ v: "1.0", when: "Jun 3, 2026", note: "First release.", verified: true }],
  },
];

type UpdateRow = { boardId: string; name: string; from: string; to: string; breaking: boolean; note: string };

const UPDATES: UpdateRow[] = [
  {
    boardId: "bd-exec",
    name: "Executive Overview",
    from: "4.0",
    to: "4.1",
    breaking: false,
    note: "Adds a collections tile; nothing existing changes.",
  },
  {
    boardId: "bd-wh",
    name: "Warehouse Floor",
    from: "1.1",
    to: "2.0",
    breaking: true,
    note: "Stock value is now measured at moving-average cost. Historical figures on this board will change.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

function Chip({
  icon: Icon,
  label,
  tone = "neutral",
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  tone?: "neutral" | "accent" | "quiet";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-bz-sm px-1.5 py-0.5 text-[10.5px] font-semibold",
        tone === "accent" ? "bg-bz-fire/[0.22] text-bz-text" : tone === "quiet" ? "bg-bz-paper-warm text-bz-text-muted" : "bg-bz-paper-warm text-bz-text",
      )}
    >
      {Icon && <Icon size={9} />}
      {label}
    </span>
  );
}

function Switch({ value, onChange, disabled, label }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[14px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn("grid w-full grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5", disabled && "opacity-50")}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={cn(
            "h-7 rounded-bz-sm px-2 text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed",
            o.id === value ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]" : "text-bz-text-muted hover:text-bz-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PromptDialog({
  title,
  body,
  label,
  initial,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string;
  body?: React.ReactNode;
  label: string;
  initial: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (v: string) => void;
}) {
  const [value, setValue] = React.useState(initial);
  const ok = value.trim().length > 0;
  return (
    <Modal onClose={onClose}>
      <div className="px-5 py-4">
        <p className="text-[14.5px] font-semibold tracking-tight text-bz-text">{title}</p>
        {body && <div className="mt-1.5 text-[12.5px] leading-[1.6] text-bz-text-muted">{body}</div>}
        <div className="mt-3.5">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{label}</p>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && ok) {
                onConfirm(value.trim());
                onClose();
              }
            }}
            className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[13px] text-bz-text placeholder:text-bz-text-soft focus:border-bz-text-soft focus:outline-none"
          />
          {!ok && <p className="mt-1.5 text-[11px] text-bz-text-muted">A name is needed before this can be created.</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <button
          disabled={!ok}
          onClick={() => { onConfirm(value.trim()); onClose(); }}
          className="inline-flex h-8 items-center rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-45"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BOARD ROW — collapsed it is a thing to OPEN; unfolded it carries every
// administrative choice about that one board, and only that one.
// ════════════════════════════════════════════════════════════════════════════

function ShareBlock({
  row,
  onGrant,
  onRevoke,
}: {
  row: BoardRow;
  onGrant: (g: Grant) => void;
  onRevoke: (id: string) => void;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [level, setLevel] = React.useState<"view" | "edit">("view");

  if (!row.mine) {
    return (
      <p className="text-[11.5px] leading-[1.55] text-bz-text-muted">
        {row.provided
          ? "This board is published by your provider. Sharing is decided by them."
          : `${row.owner} shared this board with you. A board that reached you through a share can’t be passed on.`}
      </p>
    );
  }

  const term = q.trim().toLowerCase();
  const candidates = PRINCIPALS.filter(
    (p) => (!term || p.name.toLowerCase().includes(term)) && !row.grants.some((gr) => gr.name === p.name),
  );

  return (
    <div className="flex flex-col gap-2">
      {row.grants.length ? (
        row.grants.map((gr) => {
          const Icon = GRANT_ICON[gr.kind];
          return (
            <div key={gr.id} className="flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/60 px-2.5 py-1.5">
              <Icon size={12} className="shrink-0 text-bz-text-muted" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{gr.name}</span>
              <span className="shrink-0 text-[11px] capitalize text-bz-text-muted">can {gr.level}</span>
              <button
                onClick={() => onRevoke(gr.id)}
                aria-label={`Revoke ${gr.name}`}
                className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"
              >
                <X size={11} />
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-[11.5px] text-bz-text-muted">Not shared with anyone yet.</p>
      )}

      <div className="flex gap-2">
        <button
          ref={ref}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-surface px-2.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
        >
          <Plus size={12} /> Share with someone
        </button>
      </div>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)} width={280}>
        <div className="border-b border-bz-line-soft px-3 py-2">
          <div className="flex items-center gap-2">
            <Search size={12} className="shrink-0 text-bz-text-soft" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="A person, a role or a department"
              className="h-6 w-full bg-transparent text-[12px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
            />
          </div>
          <div className="mt-2">
            <Segmented
              value={level}
              options={[
                { id: "view" as const, label: "Can view" },
                { id: "edit" as const, label: "Can edit" },
              ]}
              onChange={setLevel}
            />
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto py-1">
          {candidates.length ? (
            candidates.map((p) => {
              const Icon = GRANT_ICON[p.kind];
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    onGrant({ id: `g-${Math.random().toString(36).slice(2, 8)}`, kind: p.kind, name: p.name, level });
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-bz-paper-warm"
                >
                  <Icon size={12} className="shrink-0 text-bz-text-muted" />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{p.name}</span>
                  <span className="shrink-0 text-[10.5px] capitalize text-bz-text-soft">{p.kind}</span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-4 text-center text-[11.5px] text-bz-text-muted">Nobody left to add.</p>
          )}
        </div>
        <p className="border-t border-bz-line-soft bg-bz-paper-warm px-3 py-2 text-[10.5px] leading-[1.5] text-bz-text-muted">
          Sharing lets someone see or change the board. It never lets them delete it, archive it, or share it onward — that stays
          with you.
        </p>
      </Popover>
    </div>
  );
}

function BoardRowCard({
  row,
  expanded,
  onToggle,
  onOpen,
  onPatch,
  onSetLanding,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  row: BoardRow;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onPatch: (p: Partial<BoardRow>) => void;
  onSetLanding: (on: boolean) => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const editable = row.mine && !row.provided;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-bz-lg border bg-bz-surface transition-colors",
        expanded ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
        row.archived && "bg-bz-paper-warm/40",
      )}
    >
      <div className="flex flex-wrap items-start gap-3 px-4 py-3.5 sm:flex-nowrap">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-bz-md border",
            row.landing ? "border-bz-fire bg-bz-fire/[0.22]" : "border-bz-line-soft bg-bz-paper-warm",
          )}
        >
          <LayoutDashboard size={15} className="text-bz-text-muted" />
        </span>

        <button onClick={onToggle} className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("truncate text-[13.5px] font-semibold text-bz-text", row.archived && "text-bz-text-muted")}>
              {row.name}
            </span>
            {row.landing && <Chip icon={Home} label="Your landing page" tone="accent" />}
            {row.provided && <Chip icon={Lock} label="Provided · read-only" />}
            {!row.mine && !row.provided && <Chip icon={Share2} label="Shared with you" />}
            {row.archived && <Chip icon={Archive} label="Archived" tone="quiet" />}
          </span>
          <span className="mt-1 block truncate text-[11.5px] text-bz-text-muted">{row.summary}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-bz-text-soft">
            <span className={NUM}>{row.tiles} tiles</span>
            <span>·</span>
            <span>Updated {row.updated}</span>
            <span>·</span>
            <span>{row.audience === "private" ? "Only you" : "Everyone in your organisation"}</span>
            <span>·</span>
            <span>Owner: {row.owner}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpen}
            className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
          >
            Open
          </button>
          <button
            onClick={onToggle}
            aria-label={expanded ? "Hide settings" : "Show settings"}
            className="flex size-8 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"
          >
            <ChevronDown size={13} className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 gap-5 border-t border-bz-line-soft bg-bz-paper px-4 py-4 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Who can see it</p>
              <Segmented
                value={row.audience}
                disabled={!editable}
                options={[
                  { id: "private" as const, label: "Only me" },
                  { id: "organisation" as const, label: "My organisation" },
                ]}
                onChange={(a) => onPatch({ audience: a })}
              />
              <p className="mt-1.5 text-[11px] leading-[1.5] text-bz-text-muted">
                {editable
                  ? row.audience === "private"
                    ? "Nobody else can find this board unless you share it."
                    : "Anyone in your organisation can open it. Only you can change it."
                  : `Set by ${row.owner}. You can’t change it on a board you don’t own.`}
              </p>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Landing page</p>
              <div className="flex items-start gap-2.5">
                <Switch value={row.landing} onChange={onSetLanding} label={`Land on ${row.name}`} />
                <p className="text-[11.5px] leading-[1.5] text-bz-text-muted">
                  {row.landing
                    ? "This board replaces the standard home screen when you sign in with this role. Turning it off restores the standard one."
                    : "Turn on to land here instead of the standard home screen. Only one board at a time can hold it."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Shared with</p>
              <ShareBlock
                row={row}
                onGrant={(gr) => onPatch({ grants: [...row.grants, gr] })}
                onRevoke={(id) => onPatch({ grants: row.grants.filter((x) => x.id !== id) })}
              />
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Board actions</p>
              <div className="flex flex-wrap gap-2">
                <GhostButton icon={Copy} onClick={onDuplicate}>
                  Duplicate
                </GhostButton>
                {editable && (
                  <GhostButton icon={row.archived ? ArchiveRestore : Archive} onClick={onArchive}>
                    {row.archived ? "Restore" : "Archive"}
                  </GhostButton>
                )}
                <GhostButton icon={Trash2} danger onClick={onDelete}>
                  Delete
                </GhostButton>
              </div>
              {row.provided && (
                <p className="mt-1.5 text-[11px] leading-[1.5] text-bz-text-muted">
                  A provided board can be duplicated into your own editable copy. Deleting it is decided by the server, not here.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CATALOGUE — complete boards someone else published. This is the ONLY thing
// the word "template" now names.
// ════════════════════════════════════════════════════════════════════════════

type DryRun = { reuse: string[]; create: string[]; blocks: string[] };

function dryRunFor(entry: CatalogueEntry): DryRun {
  return {
    reuse: ["Sales Invoice figures", "Branch and department breakdowns"],
    create: [`“${entry.name}” board`, `${entry.kind} section layout`, "Tile configurations"],
    blocks: entry.blocked ? [entry.blocked] : [],
  };
}

function CatalogueCard({ entry, installed, onOpen }: { entry: CatalogueEntry; installed: boolean; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex flex-col gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-4 text-left transition-colors hover:border-bz-line"
    >
      <span className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm">
          <Blocks size={15} className="text-bz-text-muted" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-bz-text">{entry.name}</span>
          <span className="mt-0.5 block text-[11.5px] leading-[1.5] text-bz-text-muted">{entry.summary}</span>
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5">
        <Chip label={entry.kind} />
        <Chip label={entry.industry} tone="quiet" />
        <Chip label={entry.audience} tone="quiet" />
        {installed && <Chip icon={Check} label="Installed" tone="accent" />}
      </span>
      <span className="flex items-center gap-2 text-[11px] text-bz-text-soft">
        <span className={NUM}>v{entry.version}</span>
        <span>·</span>
        <span className={NUM}>{entry.installs.toLocaleString("en-US")} installs</span>
        <span>·</span>
        <span>{entry.scope}</span>
      </span>
    </button>
  );
}

function CatalogueDetail({
  entry,
  installed,
  onClose,
  onInstall,
}: {
  entry: CatalogueEntry;
  installed: boolean;
  onClose: () => void;
  onInstall: (mode: "linked" | "fork") => void;
}) {
  const [checking, setChecking] = React.useState(false);
  const [result, setResult] = React.useState<DryRun | null>(null);

  const runCheck = () => {
    setChecking(true);
    window.setTimeout(() => {
      setResult(dryRunFor(entry));
      setChecking(false);
    }, 800);
  };

  const blocked = !!result?.blocks.length;

  const List = ({ label, items, tone }: { label: string; items: string[]; tone: "reuse" | "create" | "block" }) => (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{label}</p>
      {items.length ? (
        <ul className="flex flex-col gap-1">
          {items.map((i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11.5px] leading-[1.5] text-bz-text">
              {tone === "block" ? (
                <Ban size={11} className="mt-0.5 shrink-0 text-[#C0413A]" />
              ) : tone === "create" ? (
                <Plus size={11} className="mt-0.5 shrink-0 text-bz-text-muted" />
              ) : (
                <Check size={11} className="mt-0.5 shrink-0 text-bz-leaf-deep" />
              )}
              {i}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11.5px] text-bz-text-muted">Nothing.</p>
      )}
    </div>
  );

  return (
    <Modal onClose={onClose} width={640}>
      <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight text-bz-text">{entry.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted">
            <span className={NUM}>v{entry.version}</span>
            <span>·</span>
            <span>{entry.scope}</span>
            <span>·</span>
            <span className={NUM}>{entry.installs.toLocaleString("en-US")} installs</span>
            {installed && <Chip icon={Check} label="Installed" tone="accent" />}
          </p>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">
        <p className="text-[12.5px] leading-[1.65] text-bz-text">{entry.description}</p>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Published versions</p>
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            {entry.history.map((h, i) => (
              <div key={h.v} className={cn("flex items-start gap-3 px-3 py-2", i % 2 ? "bg-bz-paper-warm/50" : "")}>
                <span className={cn("w-9 shrink-0 text-[11.5px] font-semibold text-bz-text", NUM)}>v{h.v}</span>
                <span className="min-w-0 flex-1 text-[11.5px] leading-[1.5] text-bz-text">{h.note}</span>
                <span className="shrink-0 text-[11px] text-bz-text-soft">{h.when}</span>
                {h.verified ? (
                  <ShieldCheck size={12} className="mt-0.5 shrink-0 text-bz-leaf-deep" />
                ) : (
                  <TriangleAlert size={12} className="mt-0.5 shrink-0 text-bz-text-soft" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-bz-text-muted">
            A shield means the published version's contents match what the publisher signed.
          </p>
        </div>

        <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12.5px] font-semibold text-bz-text">Before you install</p>
            <GhostButton icon={checking ? Loader2 : RefreshCw} onClick={runCheck} disabled={checking}>
              {result ? "Check again" : "Check what this would do"}
            </GhostButton>
          </div>
          {!result && !checking && (
            <p className="mt-1.5 text-[11.5px] leading-[1.55] text-bz-text-muted">
              Nothing is written yet. The check asks the server what installing would create, what it would reuse, and what would
              stop it.
            </p>
          )}
          {checking && (
            <p className="mt-2.5 flex items-center gap-2 text-[11.5px] text-bz-text-muted">
              <Loader2 size={12} className="animate-spin text-bz-text-soft" /> Asking the server…
            </p>
          )}
          {result && !checking && (
            <>
              <div className="mt-3">
                {blocked ? (
                  <MoodNotice mood="refused" title="Can't install">
                    {result.blocks[0]} Nothing was written.
                  </MoodNotice>
                ) : (
                  <MoodNotice mood="narrowed" title="Ready to install">
                    Everything this board needs is present. Installing always creates a new board for you — the published
                    original is never touched.
                  </MoodNotice>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <List label="Already here — reused" items={result.reuse} tone="reuse" />
                <List label="Would be created" items={result.create} tone="create" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        <p className="mr-auto max-w-[280px] text-[11px] leading-[1.5] text-bz-text-muted">
          A linked copy keeps following the publisher's latest version and can't be edited. An independent copy is yours to
          change and stops receiving updates.
        </p>
        <GhostButton icon={Download} disabled={blocked || !result} onClick={() => onInstall("linked")}>
          Linked copy
        </GhostButton>
        <button
          disabled={blocked || !result}
          onClick={() => onInstall("fork")}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-45"
        >
          <Download size={12} /> Independent copy
        </button>
      </div>
    </Modal>
  );
}

function UpdatesStrip({
  updates,
  onApply,
  onDecline,
  pendingBreaking,
}: {
  updates: UpdateRow[];
  onApply: (u: UpdateRow) => void;
  onDecline: (u: UpdateRow) => void;
  pendingBreaking: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  if (!updates.length) {
    return (
      <div className="flex items-center gap-2 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3">
        <ShieldCheck size={13} className="shrink-0 text-bz-leaf-deep" />
        <p className="text-[12px] text-bz-text-muted">Every installed board is on its latest published version.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-bz-paper-warm/50">
        <Info size={13} className="shrink-0 text-bz-text-muted" />
        <p className="min-w-0 flex-1 text-[12px] text-bz-text">
          <span className={cn("font-semibold", NUM)}>{updates.length}</span> installed{" "}
          {updates.length === 1 ? "board has" : "boards have"} a newer published version.
        </p>
        <ChevronDown size={13} className={cn("shrink-0 text-bz-text-soft transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-bz-line-soft">
          {updates.map((u) => (
            <div key={u.boardId} className="flex flex-wrap items-start gap-3 border-b border-bz-line-soft px-4 py-3 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-bz-text">
                  {u.name}
                  <span className={cn("text-[11px] font-normal text-bz-text-muted", NUM)}>
                    v{u.from} → v{u.to}
                  </span>
                  {u.breaking && <Chip icon={TriangleAlert} label="Changes your figures" />}
                </p>
                <p className="mt-1 text-[11.5px] leading-[1.5] text-bz-text-muted">{u.note}</p>
                {pendingBreaking === u.boardId && (
                  <div className="mt-2">
                    <MoodNotice mood="refused" title="Confirm required">
                      Nothing was changed. This update alters how existing figures are measured, so it takes a second, deliberate
                      act — press Apply again to go ahead.
                    </MoodNotice>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <GhostButton onClick={() => onDecline(u)}>Skip this version</GhostButton>
                <button
                  onClick={() => onApply(u)}
                  className="inline-flex h-8 items-center rounded-bz-md bg-bz-deep px-3 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95"
                >
                  {pendingBreaking === u.boardId ? "Apply anyway" : "Apply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SAVED FIGURES — the single home for "define once, reuse many". A figure gets
// here by being promoted from the tile that first asked for it; there is no
// second, parallel builder.
// ════════════════════════════════════════════════════════════════════════════

function SavedFigures({ removed, onRemove }: { removed: Set<string>; onRemove: (id: string, label: string, uses: number) => void }) {
  const saved = FIGURES.filter((f) => f.saved && !removed.has(f.id));
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3.5">
        <p className="text-[12.5px] font-semibold text-bz-text">One definition, every board</p>
        <p className="mt-1 text-[12px] leading-[1.6] text-bz-text-muted">
          A figure becomes reusable from inside the tile that first asked for it — open any tile in the studio and choose “Save
          this figure for reuse”. There is no separate builder to learn, and no second place these can live.
        </p>
      </div>

      {saved.length ? (
        <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          {saved.map((f, i) => (
            <div key={f.id} className={cn("flex flex-wrap items-start gap-3 px-4 py-3.5", i > 0 && "border-t border-bz-line-soft")}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm">
                <Bookmark size={13} className="text-bz-text-muted" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-bz-text">{f.label}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-bz-text-muted">{f.source}</p>
                <p className="mt-1 text-[11px] text-bz-text-soft">
                  Answers “{f.question}” · <span className={NUM}>{f.usedBy ?? 0}</span> {f.usedBy === 1 ? "tile uses" : "tiles use"} it
                </p>
              </div>
              <GhostButton icon={Trash2} danger onClick={() => onRemove(f.id, f.label, f.usedBy ?? 0)}>
                Remove
              </GhostButton>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-6 py-14 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm">
            <Bookmark size={18} className="text-bz-text-soft" />
          </span>
          <p className="mt-3.5 text-[15px] font-semibold tracking-tight text-bz-text">No reusable figures yet</p>
          <p className="mx-auto mt-1.5 max-w-[380px] text-[12.5px] leading-[1.6] text-bz-text-muted">
            Build a tile that answers something you ask often, then save its figure. Every board can bind to it afterwards.
          </p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIRST RUN
// ════════════════════════════════════════════════════════════════════════════

function FirstRun({ onStartEmpty, onAssisted }: { onStartEmpty: () => void; onAssisted: () => void }) {
  const [state, setState] = React.useState<"idle" | "checking" | "blocked">("idle");
  const attempts = React.useRef(0);

  const build = () => {
    setState("checking");
    attempts.current += 1;
    const willFail = attempts.current === 1;
    window.setTimeout(() => {
      if (willFail) setState("blocked");
      else {
        setState("idle");
        onAssisted();
      }
    }, 900);
  };

  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface px-6 py-10 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22]">
        <Sparkles size={19} className="text-bz-text" />
      </span>
      <p className="mt-4 text-[17px] font-semibold tracking-tight text-bz-text">You don't have a dashboard yet</p>
      <p className="mx-auto mt-1.5 max-w-[440px] text-[12.5px] leading-[1.65] text-bz-text-muted">
        Most people start with a ready-made one and change it later. If you would rather choose every figure yourself, start
        empty — nothing is lost either way.
      </p>

      {state === "blocked" && (
        <div className="mx-auto mt-4 max-w-[480px] text-left">
          <MoodNotice mood="refused" title="Can't build it yet">
            The tile catalogue has never been set up on this installation, so a starter board would come out full of tiles that
            can't render. An administrator needs to publish the tile kinds first. Nothing was created.
          </MoodNotice>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={build}
          disabled={state === "checking"}
          className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50"
        >
          {state === "checking" ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {state === "blocked" ? "Check again" : "Build one for me"}
        </button>
        <GhostButton icon={Plus} onClick={onStartEmpty}>
          Start empty
        </GhostButton>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

type Tab = "boards" | "catalogue" | "figures";

export function DashboardLibraryDesignPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<Tab>("boards");
  const [boards, setBoards] = React.useState<BoardRow[]>(SEED_BOARDS);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<"active" | "archived" | "all">("active");
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<ConfirmSpec | null>(null);
  const [prompt, setPrompt] = React.useState<React.ReactNode>(null);

  // catalogue
  const [entryOpen, setEntryOpen] = React.useState<CatalogueEntry | null>(null);
  const [catSearch, setCatSearch] = React.useState("");
  const [catKind, setCatKind] = React.useState<string>("all");
  const [catScope, setCatScope] = React.useState<string>("all");
  const [updates, setUpdates] = React.useState<UpdateRow[]>(UPDATES);
  const [pendingBreaking, setPendingBreaking] = React.useState<string | null>(null);

  // saved figures
  const [removedFigures, setRemovedFigures] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  const succeeded = (msg: string) => {
    setError(null);
    setToast(msg);
  };

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return boards.filter((b) => {
      if (stateFilter === "active" && b.archived) return false;
      if (stateFilter === "archived" && !b.archived) return false;
      if (q && !(b.name.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q) || b.owner.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [boards, search, stateFilter]);

  const counts = React.useMemo(
    () => ({
      total: boards.length,
      active: boards.filter((b) => !b.archived).length,
      archived: boards.filter((b) => b.archived).length,
      figures: FIGURES.filter((f) => f.saved && !removedFigures.has(f.id)).length,
    }),
    [boards, removedFigures],
  );

  const patch = (id: string, p: Partial<BoardRow>) => setBoards((bs) => bs.map((b) => (b.id === id ? { ...b, ...p } : b)));

  const setLanding = (id: string, on: boolean) => {
    setBoards((bs) => bs.map((b) => ({ ...b, landing: on ? b.id === id : b.id === id ? false : b.landing })));
    succeeded(on ? "This board is now where you land." : "Landing reverted to the standard home screen.");
  };

  const createBoard = (name: string) => {
    const row: BoardRow = {
      id: `bd-${Math.random().toString(36).slice(2, 7)}`,
      name,
      summary: "Nothing on it yet.",
      tiles: 0,
      updated: "Just now",
      owner: "You",
      mine: true,
      provided: false,
      archived: false,
      landing: false,
      audience: "private",
      grants: [],
    };
    setBoards((bs) => [row, ...bs]);
    setError(null);
    navigate("/design/dashboards/studio");
  };

  const askNewBoard = () =>
    setPrompt(
      <PromptDialog
        title="Name your new board"
        body="It starts empty and private to you. You can rename it, share it or make it your landing page at any time."
        label="Board name"
        initial=""
        confirmLabel="Create and open"
        onClose={() => setPrompt(null)}
        onConfirm={createBoard}
      />,
    );

  const askDuplicate = (row: BoardRow) =>
    setPrompt(
      <PromptDialog
        title={`Duplicate “${row.name}”`}
        body="The copy is yours, private, and independent — changing it never touches the original."
        label="Name for the copy"
        initial={`Copy of ${row.name}`}
        confirmLabel="Duplicate"
        onClose={() => setPrompt(null)}
        onConfirm={(name) => {
          setBoards((bs) => [
            { ...row, id: `bd-${Math.random().toString(36).slice(2, 7)}`, name, owner: "You", mine: true, provided: false, landing: false, archived: false, audience: "private", grants: [], updated: "Just now" },
            ...bs,
          ]);
          succeeded(`“${name}” created.`);
        }}
      />,
    );

  const askArchive = (row: BoardRow) => {
    if (row.archived) {
      patch(row.id, { archived: false });
      succeeded(`“${row.name}” restored.`);
      return;
    }
    setConfirm({
      title: `Archive “${row.name}”?`,
      body: (
        <>
          It stays in your library and keeps everything on it — it just moves out of the way. If it is your landing page, that
          goes back to the standard home screen.
        </>
      ),
      confirmLabel: "Archive",
      onConfirm: () => {
        patch(row.id, { archived: true, landing: false });
        succeeded(`“${row.name}” archived.`);
      },
    });
  };

  const askDelete = (row: BoardRow) =>
    setConfirm({
      title: `Delete “${row.name}”?`,
      body: (
        <>
          <span className={cn("font-semibold text-bz-text", NUM)}>{row.tiles}</span> configured{" "}
          {row.tiles === 1 ? "tile goes" : "tiles go"} with it, along with anything set up on{" "}
          {row.tiles === 1 ? "it" : "them"}. Anyone you shared it with loses access. This cannot be undone.
        </>
      ),
      confirmLabel: "Delete board",
      danger: true,
      onConfirm: () => {
        // the server, not the surface, decides — a provided board is refused
        if (row.provided) {
          setError(
            `The server refused to delete “${row.name}”: a board installed from your provider's catalogue can't be deleted here. Remove it from the catalogue instead.`,
          );
          return;
        }
        setBoards((bs) => bs.filter((b) => b.id !== row.id));
        setExpanded((e) => (e === row.id ? null : e));
        succeeded(`“${row.name}” deleted.`);
      },
    });

  const askRemoveFigure = (id: string, label: string, uses: number) =>
    setConfirm({
      title: `Remove “${label}”?`,
      body: (
        <>
          <span className={cn("font-semibold text-bz-text", NUM)}>{uses}</span> {uses === 1 ? "tile binds" : "tiles bind"} to this
          figure today. {uses === 1 ? "It" : "They"} will stop showing a value, and no tile can report which figure it lost.
          This cannot be undone.
        </>
      ),
      confirmLabel: "Remove figure",
      danger: true,
      onConfirm: () => {
        setRemovedFigures((s) => new Set(s).add(id));
        succeeded(`“${label}” removed.`);
      },
    });

  const install = (entry: CatalogueEntry, mode: "linked" | "fork") => {
    const row: BoardRow = {
      id: `bd-${Math.random().toString(36).slice(2, 7)}`,
      name: entry.name,
      summary: entry.summary,
      tiles: 5,
      updated: "Just now",
      owner: mode === "linked" ? entry.scope : "You",
      mine: mode !== "linked",
      provided: mode === "linked",
      archived: false,
      landing: false,
      audience: "private",
      grants: [],
    };
    setBoards((bs) => [row, ...bs]);
    setEntryOpen(null);
    setTab("boards");
    succeeded(
      mode === "linked"
        ? `“${entry.name}” installed as a linked copy — it follows the publisher's latest version.`
        : `“${entry.name}” installed as your own editable copy.`,
    );
  };

  const applyUpdate = (u: UpdateRow) => {
    if (u.breaking && pendingBreaking !== u.boardId) {
      setPendingBreaking(u.boardId);
      return;
    }
    setUpdates((us) => us.filter((x) => x.boardId !== u.boardId));
    setPendingBreaking(null);
    succeeded(`“${u.name}” updated to v${u.to}.`);
  };

  const catalogueVisible = React.useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    return CATALOGUE.filter(
      (e) =>
        (catKind === "all" || e.kind === catKind) &&
        (catScope === "all" || e.scope === catScope) &&
        (!q || e.name.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q) || e.industry.toLowerCase().includes(q)),
    );
  }, [catSearch, catKind, catScope]);

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "boards", label: "My boards", count: counts.total },
    { id: "catalogue", label: "Catalogue" },
    { id: "figures", label: "Saved figures", count: counts.figures },
  ];

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Dashboards</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Library</span>
        </>
      }
      overlay={
        <>
          <Toast text={toast} onDismiss={() => setToast(null)} />
          {confirm && <ConfirmDialog spec={confirm} onClose={() => setConfirm(null)} />}
          {prompt}
          {entryOpen && (
            <CatalogueDetail
              entry={entryOpen}
              installed={boards.some((b) => b.name === entryOpen.name)}
              onClose={() => setEntryOpen(null)}
              onInstall={(mode) => install(entryOpen, mode)}
            />
          )}
        </>
      }
    >
      {/* header */}
      <div className="border-b border-bz-line bg-bz-paper px-4 pt-5 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">Dashboards</h1>
            <p className="mt-1.5 max-w-[560px] text-[12.5px] leading-[1.6] text-bz-text-muted">
              Boards you read, boards you built, and boards other people published. Open one, or take a ready-made one and change
              what it is scoped to.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <GhostButton icon={Store} onClick={() => setTab("catalogue")}>
              Browse catalogue
            </GhostButton>
            <button
              onClick={askNewBoard}
              className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"
            >
              <Plus size={13} /> New board
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-[12.5px] font-medium transition-colors",
                tab === t.id ? "border-bz-text text-bz-text" : "border-transparent text-bz-text-muted hover:text-bz-text",
              )}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 md:px-6">
        {error && (
          <div className="mb-4">
            <MoodNotice
              mood="refused"
              title="Refused"
              action={
                <button
                  onClick={() => setError(null)}
                  className="inline-flex h-7 items-center rounded-bz-sm border border-[#C0413A]/40 bg-bz-surface px-2 text-[11.5px] font-semibold text-[#9A2E29]"
                >
                  Dismiss
                </button>
              }
            >
              {error}
            </MoodNotice>
          </div>
        )}

        {/* ── my boards ─────────────────────────────────────────────────── */}
        {tab === "boards" && (
          <>
            {loading ? (
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-4">
                    <div className="size-9 shrink-0 rounded-bz-md bg-bz-line-soft" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-48 rounded-bz-sm bg-bz-line-soft" />
                      <div className="mt-2 h-2.5 w-72 max-w-full rounded-bz-sm bg-bz-border-soft" />
                    </div>
                    <div className="h-8 w-16 shrink-0 rounded-bz-md bg-bz-line-soft" />
                  </div>
                ))}
              </div>
            ) : !boards.length ? (
              <FirstRun
                onStartEmpty={askNewBoard}
                onAssisted={() => {
                  createBoard("My first dashboard");
                }}
              />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <div className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-bz-md border border-bz-line bg-bz-surface px-3 sm:max-w-[320px]">
                    <Search size={13} className="shrink-0 text-bz-text-soft" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search your boards"
                      className="h-full w-full bg-transparent text-[12.5px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} aria-label="Clear" className="shrink-0 text-bz-text-soft hover:text-bz-text">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="w-full sm:w-[280px]">
                    <Segmented
                      value={stateFilter}
                      options={[
                        { id: "active" as const, label: `Active · ${counts.active}` },
                        { id: "archived" as const, label: `Archived · ${counts.archived}` },
                        { id: "all" as const, label: "All" },
                      ]}
                      onChange={setStateFilter}
                    />
                  </div>
                </div>

                {visible.length ? (
                  <div className="flex flex-col gap-2.5">
                    {visible.map((row) => (
                      <BoardRowCard
                        key={row.id}
                        row={row}
                        expanded={expanded === row.id}
                        onToggle={() => setExpanded((e) => (e === row.id ? null : row.id))}
                        onOpen={() => navigate(row.provided ? "/design/dashboards/studio" : "/design/dashboards/studio")}
                        onPatch={(p) => patch(row.id, p)}
                        onSetLanding={(on) => setLanding(row.id, on)}
                        onDuplicate={() => askDuplicate(row)}
                        onArchive={() => askArchive(row)}
                        onDelete={() => askDelete(row)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-6 py-12 text-center">
                    <span className="mx-auto flex size-10 items-center justify-center rounded-bz-pill bg-bz-paper-warm">
                      <SearchX size={16} className="text-bz-text-soft" />
                    </span>
                    <p className="mt-3 text-[13.5px] font-semibold text-bz-text">
                      {stateFilter === "archived" ? "Nothing archived" : "No board matches that"}
                    </p>
                    <p className="mx-auto mt-1.5 max-w-[340px] text-[12px] leading-[1.55] text-bz-text-muted">
                      {stateFilter === "archived"
                        ? "Archiving a board moves it out of the way without losing anything on it."
                        : "Try a shorter word, or clear the state filter."}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── catalogue ─────────────────────────────────────────────────── */}
        {tab === "catalogue" && (
          <div className="flex flex-col gap-4">
            <UpdatesStrip
              updates={updates}
              pendingBreaking={pendingBreaking}
              onApply={applyUpdate}
              onDecline={(u) => {
                setUpdates((us) => us.filter((x) => x.boardId !== u.boardId));
                setPendingBreaking(null);
                succeeded(`v${u.to} skipped for “${u.name}”. You'll be told about the next one.`);
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-bz-md border border-bz-line bg-bz-surface px-3 sm:max-w-[320px]">
                <Search size={13} className="shrink-0 text-bz-text-soft" />
                <input
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Search published boards"
                  className="h-full w-full bg-transparent text-[12.5px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
                />
              </div>
              <div className="w-[160px]">
                <SimplePicker
                  value={catKind}
                  options={[
                    { id: "all", label: "Every kind" },
                    { id: "Finance", label: "Finance" },
                    { id: "Operations", label: "Operations" },
                    { id: "Retail", label: "Retail" },
                    { id: "People", label: "People" },
                  ]}
                  onChange={setCatKind}
                  placeholder="Kind"
                />
              </div>
              <div className="w-[190px]">
                <SimplePicker
                  value={catScope}
                  options={[
                    { id: "all", label: "Anyone" },
                    { id: "Bizak", label: "Published by Bizak" },
                    { id: "Your organisation", label: "Published internally" },
                  ]}
                  onChange={setCatScope}
                  placeholder="Publisher"
                />
              </div>
            </div>

            {catalogueVisible.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {catalogueVisible.map((e) => (
                  <CatalogueCard
                    key={e.id}
                    entry={e}
                    installed={boards.some((b) => b.name === e.name)}
                    onOpen={() => setEntryOpen(e)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface px-6 py-12 text-center">
                <span className="mx-auto flex size-10 items-center justify-center rounded-bz-pill bg-bz-paper-warm">
                  <Inbox size={16} className="text-bz-text-soft" />
                </span>
                <p className="mt-3 text-[13.5px] font-semibold text-bz-text">Nothing published matches that</p>
                <p className="mx-auto mt-1.5 max-w-[340px] text-[12px] leading-[1.55] text-bz-text-muted">
                  Widen the filters, or build the board yourself — it takes one question to start.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── saved figures ─────────────────────────────────────────────── */}
        {tab === "figures" && <SavedFigures removed={removedFigures} onRemove={askRemoveFigure} />}
      </div>
    </AppShell>
  );
}
