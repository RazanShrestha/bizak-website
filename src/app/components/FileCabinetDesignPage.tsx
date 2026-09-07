import * as React from "react";
import { createPortal } from "react-dom";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FolderInput,
  FileText,
  FileSpreadsheet,
  FileType,
  FileImage,
  FileArchive,
  File as FileIcon,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Loader2,
  Check,
  HardDrive,
  Building2,
  Clock,
  Layers,
  Link2,
  Inbox,
  SearchX,
  CornerLeftUp,
  Home,
  List as ListIcon,
  LayoutGrid,
  RefreshCw,
  ChevronsUpDown,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// FILE CABINET  (documents · store · find · manage)
//
// A document-management surface: one org-scoped file store the user browses to
// FIND and RETRIEVE business documents. Judgement:
//   • Primary focus  = the file listing (scan / open / preview).
//   • Primary action = find a file — search up top + four browse modes.
//
// The whole surface is ONE calm browser card. Everything secondary is behind a
// disclosure so the default view reads clean:
//   • Header      title + a quiet org-scope selector + one prominent search.
//   • Mode row    Folders · By Record · Recent · Trash + a collapsed Storage strip.
//   • Body        a folder tree rail (Folders mode only) + the content listing,
//                 with a breadcrumb trail and quiet New-folder / Upload actions.
//
// Modes are shaped differently on purpose — Folders is tree+content, By Record
// is a full-width drill (module → menu → record → documents), Recent and Trash
// are full-width flat feeds. Upload, preview, storage insight and the org picker
// are all progressive-disclosure, never chrome shown all at once.
//
// The density switch is List / Grid; the tree rendering the brief also names is
// served by the persistent left rail, so it isn't duplicated as a third density.
// ════════════════════════════════════════════════════════════════════════════

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;
const NUM = "tabular-nums";

// ════════════════════════════════════════════════════════════════════════════
// TRANSFORMS  bytes · dates · type→icon · type label · preview eligibility
// ════════════════════════════════════════════════════════════════════════════

function formatBytes(b: number): string {
  if (!b || b < 1) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  const v = b / Math.pow(1024, i);
  return `${i === 0 ? Math.round(v) : v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y) return "—";
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const EXT_ICON: Record<string, LucideIcon> = {
  pdf: FileText,
  xlsx: FileSpreadsheet, xls: FileSpreadsheet, csv: FileSpreadsheet,
  doc: FileType, docx: FileType,
  png: FileImage, jpg: FileImage, jpeg: FileImage, gif: FileImage, webp: FileImage,
  zip: FileArchive, rar: FileArchive, "7z": FileArchive,
};
const EXT_LABEL: Record<string, string> = {
  pdf: "PDF", xlsx: "Spreadsheet", xls: "Spreadsheet", csv: "CSV",
  doc: "Document", docx: "Document",
  png: "Image", jpg: "Image", jpeg: "Image", gif: "Image", webp: "Image",
  zip: "Archive", rar: "Archive",
};
const fileIcon = (ext?: string): LucideIcon => (ext && EXT_ICON[ext.toLowerCase()]) || FileIcon;
const typeLabel = (ext?: string): string => (ext ? EXT_LABEL[ext.toLowerCase()] ?? ext.toUpperCase() : "File");
const PREVIEWABLE = new Set(["pdf", "png", "jpg", "jpeg", "gif", "webp"]);
const canPreview = (ext?: string) => !!ext && PREVIEWABLE.has(ext.toLowerCase());
const isImage = (ext?: string) => !!ext && ["png", "jpg", "jpeg", "gif", "webp"].includes(ext.toLowerCase());

const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");
// filenames are sanitized on intake — keep word chars, dot, dash, space; collapse the rest
const sanitize = (s: string) => s.replace(/[^\w.\- ]+/g, "").replace(/\s+/g, " ").trim() || "untitled";

// ════════════════════════════════════════════════════════════════════════════
// DATA MODEL  a normalized folder store (files live in folders)
// ════════════════════════════════════════════════════════════════════════════

type Node = {
  id: string;
  parentId: string | null;
  name: string;
  kind: "folder" | "file";
  ext?: string;
  bytes: number;
  modified: string;
  source?: "record" | "manual";
  recordRef?: string;
  childIds: string[];
  deletedAt: string | null;
};

type SeedNode = {
  name: string;
  ext?: string;
  bytes?: number;
  modified?: string;
  source?: "record" | "manual";
  recordRef?: string;
  recentRank?: number;
  children?: SeedNode[];
};

const KB = 1024;
const MB = 1024 * 1024;

// The manual folder hierarchy for the active organisation.
const SEED_TREE: SeedNode[] = [
  {
    name: "Finance",
    children: [
      {
        name: "Invoices",
        children: [
          { name: "INV-2046", ext: "pdf", bytes: 248 * KB, modified: "2026-06-28", source: "record", recordRef: "SO-1047", recentRank: 1 },
          { name: "INV-2045", ext: "pdf", bytes: 212 * KB, modified: "2026-06-24", source: "record", recordRef: "SO-1046" },
          { name: "INV-2046-scan", ext: "jpg", bytes: 1.8 * MB, modified: "2026-06-28", source: "manual", recentRank: 4 },
          { name: "INV-2041", ext: "pdf", bytes: 196 * KB, modified: "2026-06-18", source: "manual" },
          { name: "INV-2038", ext: "pdf", bytes: 203 * KB, modified: "2026-06-11", source: "manual" },
        ],
      },
      {
        name: "Tax Filings",
        children: [
          { name: "VAT-Return-Jestha", ext: "pdf", bytes: 180 * KB, modified: "2026-06-15", source: "manual", recentRank: 5 },
          { name: "TDS-Statement-Q4", ext: "xlsx", bytes: 96 * KB, modified: "2026-06-15", source: "manual" },
        ],
      },
      {
        name: "Bank Statements",
        children: [
          { name: "NIC-Asia-Jestha", ext: "pdf", bytes: 420 * KB, modified: "2026-06-05", source: "manual", recentRank: 6 },
          { name: "Nabil-Bank-Jestha", ext: "pdf", bytes: 388 * KB, modified: "2026-06-05", source: "manual" },
        ],
      },
    ],
  },
  {
    name: "Sales",
    children: [
      {
        name: "Sales Orders",
        children: [
          { name: "SO-1052-Quote", ext: "pdf", bytes: 142 * KB, modified: "2026-06-27", source: "record", recordRef: "SO-1052", recentRank: 2 },
          { name: "SO-1047-Contract", ext: "pdf", bytes: 265 * KB, modified: "2026-05-17", source: "record", recordRef: "SO-1047" },
        ],
      },
      {
        name: "Contracts",
        children: [
          { name: "MSA-Himalayan-Traders", ext: "pdf", bytes: 512 * KB, modified: "2026-04-30", source: "manual" },
          { name: "NDA-Everest-Hardware", ext: "docx", bytes: 78 * KB, modified: "2026-05-02", source: "manual", recentRank: 7 },
        ],
      },
    ],
  },
  {
    name: "Procurement",
    children: [
      {
        name: "Purchase Orders",
        children: [
          { name: "PO-3021", ext: "pdf", bytes: 158 * KB, modified: "2026-06-20", source: "manual" },
          { name: "PO-3018", ext: "pdf", bytes: 150 * KB, modified: "2026-06-12", source: "manual" },
        ],
      },
      {
        name: "Vendor Bills",
        children: [
          { name: "Bill-VN-4402", ext: "pdf", bytes: 132 * KB, modified: "2026-06-22", source: "record", recordRef: "PO-3021", recentRank: 3 },
          { name: "Bill-VN-4398", ext: "pdf", bytes: 128 * KB, modified: "2026-06-16", source: "manual" },
        ],
      },
    ],
  },
  {
    name: "HR",
    children: [
      {
        name: "Contracts",
        children: [
          { name: "Offer-Manas-Basnet", ext: "pdf", bytes: 88 * KB, modified: "2026-03-11", source: "manual" },
          { name: "Offer-Sita-Rai", ext: "pdf", bytes: 86 * KB, modified: "2026-03-18", source: "manual" },
        ],
      },
      { name: "Payroll", children: [{ name: "Payroll-Jestha", ext: "xlsx", bytes: 210 * KB, modified: "2026-06-30", source: "manual" }] },
      {
        name: "Policies",
        children: [
          { name: "Leave-Policy", ext: "docx", bytes: 64 * KB, modified: "2026-01-20", source: "manual" },
          { name: "Code-of-Conduct", ext: "pdf", bytes: 120 * KB, modified: "2026-01-20", source: "manual" },
        ],
      },
    ],
  },
  {
    name: "Legal",
    children: [
      {
        name: "Agreements",
        children: [
          { name: "Lease-Kathmandu-Warehouse", ext: "pdf", bytes: 340 * KB, modified: "2025-12-01", source: "manual" },
          { name: "Partnership-Deed", ext: "pdf", bytes: 288 * KB, modified: "2025-11-15", source: "manual" },
          { name: "Site-Plan", ext: "png", bytes: 2.4 * MB, modified: "2025-11-15", source: "manual" },
          { name: "Archive-2025", ext: "zip", bytes: 14.6 * MB, modified: "2026-01-02", source: "manual" },
        ],
      },
      { name: "Compliance", children: [] }, // empty folder → demonstrates the empty state
    ],
  },
];

const ROOT_ID = "root";

// ordered list of "recently added" file ids (populated while flattening the seed)
const RECENT_IDS: string[] = [];

// Flatten the seed tree into a normalized node map (deterministic ids).
const SEED_NODES: Record<string, Node> = (() => {
  const nodes: Record<string, Node> = {
    [ROOT_ID]: { id: ROOT_ID, parentId: null, name: "File Cabinet", kind: "folder", bytes: 0, modified: "", childIds: [], deletedAt: null },
  };
  const recent: { id: string; rank: number }[] = [];
  let counter = 0;
  const ingest = (seed: SeedNode, parentId: string): string => {
    const id = `n${++counter}`;
    const isFolder = !!seed.children;
    nodes[id] = {
      id,
      parentId,
      name: seed.name + (isFolder ? "" : seed.ext ? `.${seed.ext}` : ""),
      kind: isFolder ? "folder" : "file",
      ext: seed.ext,
      bytes: seed.bytes ?? 0,
      modified: seed.modified ?? "2026-06-01",
      source: seed.source,
      recordRef: seed.recordRef,
      childIds: [],
      deletedAt: null,
    };
    if (isFolder) nodes[id].childIds = seed.children!.map((c) => ingest(c, id));
    if (seed.recentRank) recent.push({ id, rank: seed.recentRank });
    return id;
  };
  nodes[ROOT_ID].childIds = SEED_TREE.map((s) => ingest(s, ROOT_ID));
  RECENT_IDS.push(...recent.sort((a, b) => a.rank - b.rank).map((r) => r.id));
  return nodes;
})();

// resolve a folder id by its name-path from root (used for the default location)
function resolvePath(names: string[]): string {
  let cur = ROOT_ID;
  for (const name of names) {
    const next = SEED_NODES[cur].childIds.find((c) => SEED_NODES[c].name === name);
    if (!next) return cur;
    cur = next;
  }
  return cur;
}
const DEFAULT_FOLDER = resolvePath(["Finance", "Invoices"]);

// ── by-record hierarchy (module → menu → record → documents) ──
type RecDoc = { name: string; ext: string; bytes: number; modified: string; primary?: boolean };
type RecRecord = { code: string; title: string; docs: RecDoc[] };
type RecMenu = { name: string; records: RecRecord[] };
type RecModule = { name: string; menus: RecMenu[] };

const RECORD_TREE: RecModule[] = [
  {
    name: "Sales",
    menus: [
      {
        name: "Sales Orders",
        records: [
          {
            code: "SO-1052", title: "Himalayan Traders",
            docs: [
              { name: "SO-1052-Quote.pdf", ext: "pdf", bytes: 142 * KB, modified: "2026-06-27", primary: true },
              { name: "Delivery-Note-DN-882.pdf", ext: "pdf", bytes: 98 * KB, modified: "2026-06-29" },
            ],
          },
          {
            code: "SO-1047", title: "Apex Manufacturing",
            docs: [
              { name: "SO-1047-Contract.pdf", ext: "pdf", bytes: 265 * KB, modified: "2026-05-17", primary: true },
              { name: "Signed-PO-Apex.pdf", ext: "pdf", bytes: 180 * KB, modified: "2026-05-16" },
              { name: "Site-Photo-Pokhara.jpg", ext: "jpg", bytes: 2.1 * MB, modified: "2026-05-20" },
            ],
          },
        ],
      },
      {
        name: "Quotations",
        records: [
          { code: "QO-2210", title: "Everest Hardware", docs: [{ name: "Quote-QO-2210.pdf", ext: "pdf", bytes: 110 * KB, modified: "2026-06-10", primary: true }] },
        ],
      },
    ],
  },
  {
    name: "Purchasing",
    menus: [
      {
        name: "Purchase Orders",
        records: [
          {
            code: "PO-3021", title: "Sagarmatha Steel",
            docs: [
              { name: "PO-3021.pdf", ext: "pdf", bytes: 158 * KB, modified: "2026-06-20", primary: true },
              { name: "Bill-VN-4402.pdf", ext: "pdf", bytes: 132 * KB, modified: "2026-06-22" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Finance",
    menus: [
      {
        name: "Sales Invoices",
        records: [
          { code: "INV-2046", title: "Apex Manufacturing", docs: [{ name: "INV-2046.pdf", ext: "pdf", bytes: 248 * KB, modified: "2026-06-28", primary: true }] },
          { code: "INV-2033", title: "Karnali Pharma", docs: [] }, // empty leaf → empty state
        ],
      },
    ],
  },
];

// organisations for the scope selector (long enough to demonstrate lazy windowing)
const ORGS = [
  "Bizak Nepal Pvt. Ltd.", "Bizak Nepal — Pokhara", "Himalayan Exports Ltd.", "Annapurna Distributors",
  "Everest Hardware Supplies", "Sagarmatha Steel Udyog", "Gandaki Auto Parts", "Lumbini Agro Pvt. Ltd.",
  "Bagmati Builders", "Janaki Textiles", "Mechi Trade Concern", "Karnali Pharma",
  "Pokhara Electronics", "Bhrikuti Paper Mills", "Manakamana Stores", "Siddhartha Glass Works",
  "Dhaulagiri Cement", "Rara Foods Pvt. Ltd.", "Pashupati Enterprises", "Apex Manufacturing Pvt. Ltd.",
  "Narayani Logistics", "Kailash Retail Group", "Trishuli Hydro Ltd.", "Lo Manthang Trading",
  "Gorkha Brewery Depot", "Butwal Industrial Co.", "Janakpur Cigarette Works", "Nepal Bitumen Corp.",
];

// ════════════════════════════════════════════════════════════════════════════
// STORE  reducer over the folder map + a trash list
// ════════════════════════════════════════════════════════════════════════════

type Store = { nodes: Record<string, Node>; trash: string[] };
type Action =
  | { t: "delete"; id: string; at: string }
  | { t: "restore"; id: string }
  | { t: "createFolder"; parentId: string; id: string; name: string; at: string }
  | { t: "upload"; parentId: string; at: string; files: { id: string; name: string; ext: string; bytes: number }[] };

const cloneNodes = (src: Record<string, Node>): Record<string, Node> => {
  const out: Record<string, Node> = {};
  for (const k in src) out[k] = { ...src[k], childIds: [...src[k].childIds] };
  return out;
};
const initStore = (): Store => ({ nodes: cloneNodes(SEED_NODES), trash: [] });

function reducer(s: Store, a: Action): Store {
  const nodes = cloneNodes(s.nodes);
  switch (a.t) {
    case "delete": {
      const n = nodes[a.id];
      if (!n) return s;
      n.deletedAt = a.at;
      const p = n.parentId ? nodes[n.parentId] : null;
      if (p) p.childIds = p.childIds.filter((x) => x !== a.id);
      return { nodes, trash: [a.id, ...s.trash] };
    }
    case "restore": {
      const n = nodes[a.id];
      if (!n) return s;
      n.deletedAt = null;
      const p = n.parentId ? nodes[n.parentId] : null;
      if (p && !p.childIds.includes(a.id)) p.childIds = [a.id, ...p.childIds];
      return { nodes, trash: s.trash.filter((x) => x !== a.id) };
    }
    case "createFolder": {
      nodes[a.id] = { id: a.id, parentId: a.parentId, name: a.name, kind: "folder", bytes: 0, modified: a.at, childIds: [], deletedAt: null };
      const p = nodes[a.parentId];
      if (p) p.childIds = [a.id, ...p.childIds];
      return { ...s, nodes };
    }
    case "upload": {
      for (const f of a.files)
        nodes[f.id] = { id: f.id, parentId: a.parentId, name: f.name, kind: "file", ext: f.ext, bytes: f.bytes, modified: a.at, source: "manual", childIds: [], deletedAt: null };
      const p = nodes[a.parentId];
      if (p) p.childIds = [...a.files.map((f) => f.id), ...p.childIds];
      return { ...s, nodes };
    }
  }
  return s;
}

// live folder size (childIds already exclude deleted nodes)
function folderSize(nodes: Record<string, Node>, id: string): number {
  const n = nodes[id];
  if (!n) return 0;
  if (n.kind === "file") return n.bytes;
  return n.childIds.reduce((sum, c) => sum + folderSize(nodes, c), 0);
}
// chain of ancestor folders from root's first child down to `id` (root excluded)
function pathChain(nodes: Record<string, Node>, id: string): Node[] {
  const out: Node[] = [];
  let cur: Node | undefined = nodes[id];
  while (cur && cur.id !== ROOT_ID) {
    out.unshift(cur);
    cur = cur.parentId ? nodes[cur.parentId] : undefined;
  }
  return out;
}
const folderPathLabel = (nodes: Record<string, Node>, parentId: string | null): string => {
  if (!parentId || parentId === ROOT_ID) return "File Cabinet";
  return "File Cabinet / " + pathChain(nodes, parentId).map((n) => n.name).join(" / ");
};

const TODAY = "2026-07-08";

// ════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ════════════════════════════════════════════════════════════════════════════

const GHOST_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45";
const PRIMARY_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-50";
const ICON_BTN =
  "flex size-8 shrink-0 items-center justify-center rounded-bz-md border border-bz-line bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text disabled:cursor-not-allowed disabled:opacity-45";

function PrimaryTag() {
  return (
    <span className="inline-flex items-center rounded-bz-sm bg-bz-fire/[0.20] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[0.08em] text-bz-text">
      Primary
    </span>
  );
}

// icon chip — folders get a soft fire tint, files a warm neutral chip
function ItemGlyph({ node, size = "md" }: { node: { kind: "folder" | "file"; ext?: string }; size?: "sm" | "md" }) {
  const Icon = node.kind === "folder" ? Folder : fileIcon(node.ext);
  const box = size === "sm" ? "size-7" : "size-9";
  const ic = size === "sm" ? 14 : 16;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-bz-md",
        box,
        node.kind === "folder" ? "bg-bz-fire/[0.16] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
      )}
    >
      <Icon size={ic} />
    </span>
  );
}

// ── anchored portal menu (outside-click / scroll / Esc close) ──
function AnchoredMenu({
  open, anchorRef, onClose, children, width = 180,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; right: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) return setPos(null);
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
  }, [open, anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(t) && anchorRef.current && !anchorRef.current.contains(t)) onClose();
    };
    const onScroll = (e: Event) => {
      // ignore scrolls that originate inside the floating surface itself
      const t = e.target as Node | null;
      if (t && ref.current && (ref.current === t || ref.current.contains(t))) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;
  return createPortal(
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      style={{ position: "fixed", top: pos.top, right: pos.right, width }}
      className="z-[70] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
    >
      {children}
    </div>,
    document.body,
  );
}

type MenuAction = { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean };

function ItemMenu({ actions }: { actions: MenuAction[] }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        ref={ref}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Item actions"
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-line/50 hover:text-bz-text",
          open && "bg-bz-line/50 text-bz-text",
        )}
      >
        <MoreHorizontal size={15} />
      </button>
      <AnchoredMenu open={open} anchorRef={ref} onClose={() => setOpen(false)}>
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={(e) => { e.stopPropagation(); setOpen(false); a.onClick(); }}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] font-medium hover:bg-bz-paper-warm",
              a.danger ? "text-[#9A2E29]" : "text-bz-text",
            )}
          >
            <a.icon size={14} className={a.danger ? "text-[#C0413A]" : "text-bz-text-muted"} />
            {a.label}
          </button>
        ))}
      </AnchoredMenu>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LISTING PRIMITIVES  the repeated file/folder unit (list row + grid tile)
// ════════════════════════════════════════════════════════════════════════════

type RowItem = {
  id: string;
  kind: "folder" | "file";
  ext?: string;
  name: string;
  meta: React.ReactNode; // contextual sub-line
  primary?: boolean;
  source?: "record" | "manual";
};

function SourceGlyph({ source, recordRef }: { source?: "record" | "manual"; recordRef?: string }) {
  if (!source) return null;
  return source === "record" ? (
    <span className="inline-flex items-center gap-1 text-[10.5px] text-bz-text-soft" title={`Attached to ${recordRef ?? "a record"}`}>
      <Link2 size={11} /> {recordRef ?? "Record"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10.5px] text-bz-text-soft" title="Filed manually">
      <FolderInput size={11} /> Filed
    </span>
  );
}

function FileRow({
  item, busy, selected, actions, primaryLabel, onPrimary, onActivate,
}: {
  item: RowItem;
  busy: boolean;
  selected: boolean;
  actions: MenuAction[];
  primaryLabel?: { icon: LucideIcon; label: string };
  onPrimary?: () => void;
  onActivate: () => void;
}) {
  return (
    <div
      onClick={busy ? undefined : onActivate}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 transition-colors md:px-4",
        busy ? "opacity-55" : "cursor-pointer hover:bg-bz-paper-warm/50",
        selected && "bg-bz-fire/[0.08]",
      )}
    >
      <ItemGlyph node={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-bz-text">{item.name}</span>
          {item.primary && <PrimaryTag />}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">{item.meta}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {busy ? (
          <Loader2 size={15} className="animate-spin text-bz-text-muted" />
        ) : (
          <>
            {primaryLabel && onPrimary && (
              <button
                onClick={onPrimary}
                className="hidden items-center gap-1.5 rounded-bz-sm border border-bz-line bg-bz-surface px-2.5 py-1 text-[11px] font-semibold text-bz-text hover:bg-bz-paper-warm sm:inline-flex"
              >
                <primaryLabel.icon size={12} /> {primaryLabel.label}
              </button>
            )}
            {actions.length > 0 && <ItemMenu actions={actions} />}
          </>
        )}
      </div>
    </div>
  );
}

function FileTile({
  item, busy, selected, actions, onActivate,
}: {
  item: RowItem;
  busy: boolean;
  selected: boolean;
  actions: MenuAction[];
  onActivate: () => void;
}) {
  return (
    <div
      onClick={busy ? undefined : onActivate}
      className={cn(
        "group relative flex flex-col items-center rounded-bz-md border bg-bz-surface p-4 text-center transition-colors",
        busy ? "opacity-55" : "cursor-pointer hover:border-bz-line hover:bg-bz-paper-warm/40",
        selected ? "border-bz-fire" : "border-bz-line-soft",
      )}
    >
      <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
        {busy ? <Loader2 size={14} className="animate-spin text-bz-text-muted" /> : actions.length > 0 && <ItemMenu actions={actions} />}
      </div>
      <ItemGlyph node={item} />
      <p className="mt-2.5 line-clamp-2 text-[12px] font-medium leading-tight text-bz-text">{item.name}</p>
      <p className="mt-1 text-[10.5px] text-bz-text-soft">{item.kind === "folder" ? "Folder" : typeLabel(item.ext)}</p>
      {item.primary && <span className="mt-1.5"><PrimaryTag /></span>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STATE PLACEHOLDERS
// ════════════════════════════════════════════════════════════════════════════

function ListSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 py-6 text-bz-text-muted">
        <Loader2 size={16} className="animate-spin text-bz-fire" />
        <span className="text-[12.5px] font-medium">Loading files…</span>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-bz-line-soft px-4 py-3">
          <div className="size-9 shrink-0 animate-pulse rounded-bz-md bg-bz-paper-warm" />
          <div className="h-3 w-44 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
          <div className="ml-auto h-3 w-16 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
        </div>
      ))}
    </div>
  );
}

function Empty({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <Icon size={22} />
      </span>
      <p className="text-[14px] font-semibold text-bz-text">{title}</p>
      <p className="max-w-xs text-[12px] text-bz-text-muted">{hint}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FOLDER TREE RAIL  (Folders mode) — accordion, single-open branch, lazy load
// ════════════════════════════════════════════════════════════════════════════

function TreeNode({
  id, depth, nodes, expanded, currentId, loadingId, onSelect, onToggle,
}: {
  id: string;
  depth: number;
  nodes: Record<string, Node>;
  expanded: Set<string>;
  currentId: string;
  loadingId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const node = nodes[id];
  if (!node || node.kind !== "folder") return null;
  const childFolders = node.childIds.map((c) => nodes[c]).filter((n): n is Node => !!n && n.kind === "folder");
  const isOpen = expanded.has(id);
  const isActive = currentId === id;
  const isLoading = loadingId === id;

  return (
    <div>
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-bz-sm py-1.5 pr-2 text-left",
          isActive ? "bg-bz-fire/[0.16]" : "hover:bg-bz-paper-warm",
        )}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onSelect(id)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); if (childFolders.length) onToggle(id); }}
          className={cn("flex size-4 shrink-0 items-center justify-center rounded-[4px] text-bz-text-soft", childFolders.length ? "hover:bg-bz-line/60 hover:text-bz-text" : "invisible")}
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          <ChevronRight size={12} className={cn("transition-transform", isOpen && "rotate-90")} />
        </button>
        {isActive ? <FolderOpen size={14} className="shrink-0 text-bz-text" /> : <Folder size={14} className="shrink-0 text-bz-text-muted" />}
        <span className={cn("truncate text-[12px]", isActive ? "font-semibold text-bz-text" : "text-bz-text-muted group-hover:text-bz-text")}>{node.name}</span>
      </div>
      {isOpen && (
        <div>
          {isLoading ? (
            <div className="flex items-center gap-1.5 py-1.5 text-[11px] text-bz-text-soft" style={{ paddingLeft: 8 + (depth + 1) * 14 + 4 }}>
              <Loader2 size={11} className="animate-spin text-bz-fire" /> Loading…
            </div>
          ) : childFolders.length ? (
            childFolders.map((c) => (
              <TreeNode key={c.id} id={c.id} depth={depth + 1} nodes={nodes} expanded={expanded} currentId={currentId} loadingId={loadingId} onSelect={onSelect} onToggle={onToggle} />
            ))
          ) : (
            <p className="py-1 text-[11px] italic text-bz-text-soft" style={{ paddingLeft: 8 + (depth + 1) * 14 + 4 }}>No subfolders</p>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STORAGE INSIGHTS  (collapsible strip) — total + per-root-folder meters
// ════════════════════════════════════════════════════════════════════════════

function StorageStrip({ nodes }: { nodes: Record<string, Node> }) {
  const roots = nodes[ROOT_ID].childIds.map((id) => ({ node: nodes[id], size: folderSize(nodes, id) }));
  const total = roots.reduce((s, r) => s + r.size, 0) || 1;
  return (
    <div className="border-b border-bz-line-soft bg-bz-paper-warm/40 px-4 py-4 md:px-6">
      <div className="mb-3 flex items-center gap-2">
        <HardDrive size={13} className="text-bz-text-muted" />
        <span className="text-[11.5px] font-semibold text-bz-text">Storage used</span>
        <span className={cn("text-[11.5px] font-semibold text-bz-text", NUM)}>· {formatBytes(total)}</span>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {roots
          .slice()
          .sort((a, b) => b.size - a.size)
          .map(({ node, size }) => {
            const pct = Math.round((size / total) * 100);
            return (
              <div key={node.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-[11.5px] text-bz-text-muted">{node.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-bz-pill bg-bz-line-soft">
                  <div className="h-full rounded-bz-pill bg-bz-leaf-deep" style={{ width: `${pct}%` }} />
                </div>
                <span className={cn("w-14 shrink-0 text-right text-[11px] font-medium text-bz-text", NUM)}>{formatBytes(size)}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORG-SCOPE SELECTOR  searchable single-select, lazy-windowed, portal
// ════════════════════════════════════════════════════════════════════════════

const ORG_PAGE = 14;

function OrgSelect({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [opening, setOpening] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [win, setWin] = React.useState(ORG_PAGE);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 264) });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setOpening(true);
    setQ("");
    setWin(ORG_PAGE);
    const t = window.setTimeout(() => setOpening(false), 260); // debounced/loading option-set
    const onDown = (e: MouseEvent) => {
      const t2 = e.target as HTMLElement;
      const panel = document.getElementById("org-panel");
      if (panel && !panel.contains(t2) && btnRef.current && !btnRef.current.contains(t2)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ORGS.filter((o) => o.toLowerCase().includes(s)) : ORGS;
  }, [q]);
  const shown = filtered.slice(0, win);
  const more = filtered.length > shown.length;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-bz-md border bg-bz-surface px-2.5 text-left sm:w-[240px]",
          open ? "border-bz-text" : "border-bz-line hover:bg-bz-paper-warm",
        )}
      >
        <Building2 size={14} className="shrink-0 text-bz-text-muted" />
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">Organisation</span>
          <span className="block truncate text-[12px] font-medium text-bz-text">{value}</span>
        </span>
        <ChevronsUpDown size={13} className="shrink-0 text-bz-text-muted" />
      </button>

      {open && pos &&
        createPortal(
          <div
            id="org-panel"
            style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
            className="z-[70] overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
          >
            <div className="border-b border-bz-line-soft p-2">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setWin(ORG_PAGE); }}
                  placeholder="Search organisations…"
                  className="h-8 w-full rounded-bz-sm border border-bz-line bg-bz-paper pl-8 pr-2 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
                />
              </div>
            </div>
            <div
              ref={listRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (more && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setWin((w) => w + ORG_PAGE);
              }}
              className="max-h-64 overflow-y-auto py-1"
            >
              {opening ? (
                <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-bz-text-muted">
                  <Loader2 size={14} className="animate-spin text-bz-fire" /> Loading…
                </div>
              ) : shown.length === 0 ? (
                <div className="px-3 py-6 text-center text-[12px] text-bz-text-muted">No organisations match “{q}”.</div>
              ) : (
                <>
                  {shown.map((o) => {
                    const active = o === value;
                    return (
                      <button
                        key={o}
                        onClick={() => { onSelect(o); setOpen(false); }}
                        className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-bz-paper-warm", active ? "font-semibold text-bz-text" : "text-bz-text-muted")}
                      >
                        <Building2 size={13} className={active ? "text-bz-text" : "text-bz-text-soft"} />
                        <span className="min-w-0 flex-1 truncate">{o}</span>
                        {active && <Check size={13} className="text-bz-leaf-deep" />}
                      </button>
                    );
                  })}
                  <div className="px-3 py-2 text-center text-[10.5px] text-bz-text-soft">
                    {more ? "Scroll for more…" : `End of list · ${filtered.length} organisations`}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW MODAL  image / pdf in place; else falls back to download
// ════════════════════════════════════════════════════════════════════════════

function PreviewModal({ file, onClose, onDownload }: { file: { name: string; ext?: string }; onClose: () => void; onDownload: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const image = isImage(file.ext);
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bz-olive/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[86vh] w-full max-w-[720px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_30px_80px_-30px_rgba(15,20,17,0.4)]">
        <div className="flex items-center gap-3 border-b border-bz-line-soft px-4 py-3">
          {React.createElement(fileIcon(file.ext), { size: 16, className: "shrink-0 text-bz-text-muted" })}
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-bz-text">{file.name}</span>
          <button onClick={onDownload} className={GHOST_BTN}>
            <Download size={14} /> <span className="hidden sm:inline">Download</span>
          </button>
          <button onClick={onClose} aria-label="Close" className={ICON_BTN}>
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-bz-paper-warm/50 p-6">
          {image ? (
            <div className="mx-auto flex aspect-[4/3] w-full max-w-[440px] flex-col items-center justify-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-soft">
              <FileImage size={40} />
              <span className={cn("text-[11px]", NUM)}>{typeLabel(file.ext)} preview</span>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[440px] rounded-bz-md border border-bz-line-soft bg-white p-6 shadow-sm">
              <div className="mb-4 h-2.5 w-1/3 rounded-bz-sm bg-bz-line-soft" />
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="mb-2.5 h-2 rounded-bz-sm bg-bz-line-soft" style={{ width: `${[96, 88, 92, 70, 84, 90, 60, 80, 40][i]}%` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// UPLOAD MODAL  click-or-drop, stage many, per-file remove, commit w/ progress
// ════════════════════════════════════════════════════════════════════════════

type Staged = { key: string; name: string; ext: string; bytes: number };

function UploadModal({
  folderName, onClose, onCommit,
}: {
  folderName: string;
  onClose: () => void;
  onCommit: (files: Staged[], done: () => void) => void;
}) {
  const [staged, setStaged] = React.useState<Staged[]>([]);
  const [drag, setDrag] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const keyRef = React.useRef(0);

  const add = (files: FileList | null) => {
    if (!files) return;
    const next: Staged[] = Array.from(files).map((f) => {
      const name = sanitize(f.name);
      return { key: `s${keyRef.current++}`, name, ext: extOf(name), bytes: f.size };
    });
    setStaged((prev) => [...prev, ...next]);
  };

  const commit = () => {
    if (!staged.length || busy) return;
    setBusy(true);
    setDone(0);
    // simulate a running per-file upload count
    let i = 0;
    const tick = () => {
      i += 1;
      setDone(i);
      if (i < staged.length) window.setTimeout(tick, 320);
      else window.setTimeout(() => onCommit(staged, onClose), 260);
    };
    window.setTimeout(tick, 320);
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bz-olive/45 backdrop-blur-[2px]" onClick={busy ? undefined : onClose} aria-hidden />
      <div className="relative flex max-h-[86vh] w-full max-w-[500px] flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface shadow-[0_30px_80px_-30px_rgba(15,20,17,0.4)]">
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire/[0.18] text-bz-text"><Upload size={16} /></span>
            <div>
              <p className="text-[14px] font-semibold text-bz-text">Upload files</p>
              <p className="truncate text-[11.5px] text-bz-text-muted">into {folderName}</p>
            </div>
          </div>
          <button onClick={busy ? undefined : onClose} disabled={busy} aria-label="Close" className={ICON_BTN}>
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-bz-md border-2 border-dashed px-4 py-8 text-center transition-colors",
              drag ? "border-bz-fire bg-bz-fire/[0.08]" : "border-bz-line bg-bz-paper-warm/40 hover:bg-bz-paper-warm",
            )}
          >
            <Upload size={22} className="text-bz-text-muted" />
            <span className="text-[12.5px] font-medium text-bz-text">Click to browse or drop files here</span>
            <span className="text-[11px] text-bz-text-soft">Multiple files supported</span>
          </button>

          {staged.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">
                Staged <span className={NUM}>· {staged.length}</span>
              </p>
              <div className="flex flex-col gap-1.5">
                {staged.map((f, i) => (
                  <div key={f.key} className="flex items-center gap-2.5 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 py-2">
                    {React.createElement(fileIcon(f.ext), { size: 15, className: "shrink-0 text-bz-text-muted" })}
                    <span className="min-w-0 flex-1 truncate text-[12px] text-bz-text">{f.name}</span>
                    <span className={cn("shrink-0 text-[11px] text-bz-text-soft", NUM)}>{formatBytes(f.bytes)}</span>
                    {busy ? (
                      i < done ? <Check size={14} className="text-bz-leaf-deep" /> : <Loader2 size={13} className="animate-spin text-bz-text-muted" />
                    ) : (
                      <button onClick={() => setStaged((prev) => prev.filter((x) => x.key !== f.key))} aria-label="Remove" className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-bz-line-soft bg-bz-paper-warm/50 px-5 py-3.5">
          <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
            {busy ? `Uploading ${done} of ${staged.length}…` : staged.length ? `${staged.length} ready to upload` : "No files staged"}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={busy ? undefined : onClose} disabled={busy} className={GHOST_BTN}>Cancel</button>
            <button onClick={commit} disabled={!staged.length || busy} className={PRIMARY_BTN}>
              {busy ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : <><Upload size={13} /> Upload {staged.length > 0 ? staged.length : ""}</>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  (with optional Undo)
// ════════════════════════════════════════════════════════════════════════════

type ToastState = { msg: string; tone?: "ok" | "warn"; undo?: () => void };

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-3 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", toast.tone === "warn" ? "bg-[#FBE7E5]" : "bg-bz-fire/[0.18]")}>
          {toast.tone === "warn" ? <Trash2 size={13} className="text-[#C0413A]" /> : <Check size={13} className="text-bz-leaf-deep" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.msg}</p>
        {toast.undo && (
          <button onClick={toast.undo} className="ml-1 rounded-bz-sm px-1.5 py-0.5 text-[12px] font-semibold text-bz-text underline-offset-2 hover:underline">
            Undo
          </button>
        )}
        <button onClick={onClose} aria-label="Dismiss" className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODE SEGMENTED CONTROL
// ════════════════════════════════════════════════════════════════════════════

type Mode = "folders" | "records" | "recent" | "trash";
const MODES: { key: Mode; label: string; icon: LucideIcon }[] = [
  { key: "folders", label: "Folders", icon: Folder },
  { key: "records", label: "By Record", icon: Layers },
  { key: "recent", label: "Recent", icon: Clock },
  { key: "trash", label: "Trash", icon: Trash2 },
];

function ModeTabs({ mode, onMode, trashCount }: { mode: Mode; onMode: (m: Mode) => void; trashCount: number }) {
  return (
    <div className="flex items-center gap-0.5 rounded-bz-md bg-bz-paper-warm p-0.5">
      {MODES.map((m) => {
        const active = mode === m.key;
        return (
          <button
            key={m.key}
            onClick={() => onMode(m.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              active ? "bg-bz-surface text-bz-text shadow-sm" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            <m.icon size={13} className={active ? "text-bz-text" : "text-bz-text-soft"} />
            <span className="hidden sm:inline">{m.label}</span>
            {m.key === "trash" && trashCount > 0 && (
              <span className={cn("ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-[#FBE5E2] px-1 text-[10px] font-semibold text-[#9A2E29]", NUM)}>{trashCount}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

const Breadcrumb = (
  <>
    <span className="text-bz-text-muted">Workspace</span>
    <ChevronRight size={11} className="text-bz-text-soft" />
    <span className="font-semibold text-bz-text">File Cabinet</span>
  </>
);

export function FileCabinetDesignPage() {
  const [store, dispatch] = React.useReducer(reducer, undefined, initStore);
  const nodes = store.nodes;

  const [org, setOrg] = React.useState(ORGS[0]);
  const [mode, setMode] = React.useState<Mode>("folders");
  const [density, setDensity] = React.useState<"list" | "grid">("list");
  const [currentFolderId, setCurrentFolderId] = React.useState(DEFAULT_FOLDER);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(pathChain(SEED_NODES, DEFAULT_FOLDER).map((n) => n.id)));
  const [treeLoadingId, setTreeLoadingId] = React.useState<string | null>(null);
  const [recordPath, setRecordPath] = React.useState<number[]>([]);
  const [search, setSearch] = React.useState("");
  const [storageOpen, setStorageOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [reloadNonce, setReloadNonce] = React.useState(0);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<{ name: string; ext?: string } | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [newFolderOpen, setNewFolderOpen] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState | null>(null);

  const newIdRef = React.useRef(1);
  const newId = (p: string) => `${p}${newIdRef.current++}`;
  const notify = (t: ToastState) => setToast(t);

  const recordKey = recordPath.join("-");

  // per-mode load flash on scope / mode / navigation / explicit refresh
  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(t);
  }, [org, mode, currentFolderId, recordKey, reloadNonce]);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const searchQ = search.trim();
  const searchActive = searchQ.length > 0;

  // ── navigation ──
  const navigateFolder = (id: string) => {
    setSearch("");
    setSelectedId(null);
    setCurrentFolderId(id);
    setExpanded(new Set(pathChain(nodes, id).map((n) => n.id))); // accordion: open only the active branch
    if (mode !== "folders") setMode("folders");
  };
  const toggleTree = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      const parentId = nodes[id].parentId ?? ROOT_ID;
      nodes[parentId].childIds.forEach((sid) => { if (sid !== id) next.delete(sid); }); // single-open branch
      next.add(id);
      return next;
    });
    if (!expanded.has(id)) {
      setTreeLoadingId(id);
      window.setTimeout(() => setTreeLoadingId(null), 320); // lazy-load children
    }
  };

  // ── actions ──
  const doDownload = (n: { name: string; kind: "folder" | "file" }) =>
    notify({ msg: n.kind === "folder" ? `Zipping ${n.name}.zip for download…` : `Downloading ${n.name}…` });

  const openFile = (f: { name: string; ext?: string }) => {
    if (canPreview(f.ext)) setPreview(f);
    else notify({ msg: `${f.name} can’t preview — downloading…` }); // preview-eligibility fallback
  };

  const doDelete = (n: Node) => {
    setBusyId(n.id);
    window.setTimeout(() => {
      dispatch({ t: "delete", id: n.id, at: TODAY });
      setBusyId(null);
      notify({ msg: `${n.name} moved to Trash`, tone: "warn", undo: () => { dispatch({ t: "restore", id: n.id }); setToast(null); } });
    }, 420);
  };
  const doRestore = (n: Node) => {
    setBusyId(n.id);
    window.setTimeout(() => {
      dispatch({ t: "restore", id: n.id });
      setBusyId(null);
      notify({ msg: `${n.name} restored to ${folderPathLabel(nodes, n.parentId)}` });
    }, 480);
  };
  const commitFolder = () => {
    const name = sanitize(newFolderName);
    if (!name || creating) return;
    setCreating(true);
    window.setTimeout(() => {
      const id = newId("f");
      dispatch({ t: "createFolder", parentId: currentFolderId, id, name, at: TODAY });
      setCreating(false);
      setNewFolderOpen(false);
      setNewFolderName("");
      setSelectedId(id); // re-select the new folder
      setReloadNonce((v) => v + 1);
      notify({ msg: `Folder “${name}” created` });
    }, 500);
  };
  const commitUpload = (files: Staged[], done: () => void) => {
    dispatch({ t: "upload", parentId: currentFolderId, at: TODAY, files: files.map((f) => ({ id: newId("u"), name: f.name, ext: f.ext, bytes: f.bytes })) });
    done();
    setReloadNonce((v) => v + 1);
    notify({ msg: `${files.length} file${files.length > 1 ? "s" : ""} uploaded to ${nodes[currentFolderId]?.name}` });
  };

  // ── derived listings ──
  const currentFolder = nodes[currentFolderId];
  const atRoot = currentFolderId === ROOT_ID;
  const folderChildren = React.useMemo(() => {
    const items = (currentFolder?.childIds ?? []).map((id) => nodes[id]).filter(Boolean);
    const folders = items.filter((n) => n.kind === "folder").sort((a, b) => a.name.localeCompare(b.name));
    const files = items.filter((n) => n.kind === "file").sort((a, b) => b.modified.localeCompare(a.modified));
    return [...folders, ...files];
  }, [currentFolder, nodes]);

  const recentItems = React.useMemo(() => RECENT_IDS.map((id) => nodes[id]).filter((n) => n && !n.deletedAt), [nodes]);
  const trashItems = React.useMemo(() => store.trash.map((id) => nodes[id]).filter(Boolean), [store.trash, nodes]);

  const searchResults = React.useMemo(() => {
    if (!searchActive) return [];
    const q = searchQ.toLowerCase();
    return Object.values(nodes)
      .filter((n) => n.id !== ROOT_ID && !n.deletedAt && n.name.toLowerCase().includes(q))
      .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "folder" ? -1 : 1));
  }, [searchActive, searchQ, nodes]);

  // by-record current level
  const rec = React.useMemo(() => {
    const [mi, ki, ri] = recordPath;
    const module = mi != null ? RECORD_TREE[mi] : null;
    const menu = module && ki != null ? module.menus[ki] : null;
    const record = menu && ri != null ? menu.records[ri] : null;
    return { module, menu, record, level: recordPath.length };
  }, [recordPath]);

  const totalStorage = React.useMemo(() => nodes[ROOT_ID].childIds.reduce((s, id) => s + folderSize(nodes, id), 0), [nodes]);

  const canUpload = mode === "folders" && !atRoot; // upload is available only inside a folder

  // ── build row items for the generic list ──
  const folderRow = (n: Node): RowItem => ({
    id: n.id, kind: n.kind, ext: n.ext, name: n.name,
    meta: n.kind === "folder" ? (
      <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{n.childIds.length} item{n.childIds.length === 1 ? "" : "s"}</span>
    ) : (
      <>
        <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{typeLabel(n.ext)} · {formatBytes(n.bytes)}</span>
        <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{fmtDate(n.modified)}</span>
        <SourceGlyph source={n.source} recordRef={n.recordRef} />
      </>
    ),
  });

  const newFolderBtnRef = React.useRef<HTMLButtonElement>(null);

  return (
    <AppShell
      breadcrumb={Breadcrumb}
      overlay={
        <>
          {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} onDownload={() => { doDownload({ name: preview.name, kind: "file" }); setPreview(null); }} />}
          {uploadOpen && <UploadModal folderName={nodes[currentFolderId]?.name ?? "this folder"} onClose={() => setUploadOpen(false)} onCommit={commitUpload} />}
          {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
        </>
      }
    >
      {/* ── page header: identity + org scope ── */}
      <header className="flex flex-col gap-4 px-4 pb-4 pt-5 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold tracking-tight text-bz-text">File Cabinet</h1>
          <p className="mt-1 text-[12.5px] text-bz-text-muted">Store, find and manage every business document — one organisation-scoped file store.</p>
        </div>
        <OrgSelect value={org} onSelect={setOrg} />
      </header>

      <div className="px-4 pb-10 md:px-8">
        <section className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
          {/* ── mode row: modes + search + storage ── */}
          <div className="flex flex-col gap-3 border-b border-bz-line-soft px-3 py-3 md:flex-row md:items-center md:px-4">
            <ModeTabs mode={mode} onMode={setMode} trashCount={trashItems.length} />
            <div className="relative min-w-0 flex-1 md:mx-2">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files across the cabinet…"
                className="h-9 w-full rounded-bz-md border border-bz-line bg-bz-paper py-2 pl-9 pr-8 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
                  <X size={12} />
                </button>
              )}
            </div>
            {totalStorage > 0 && (
              <button
                onClick={() => setStorageOpen((v) => !v)}
                className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-bz-md border px-3 text-[12px] font-semibold hover:bg-bz-paper-warm", storageOpen ? "border-bz-text bg-bz-surface text-bz-text" : "border-bz-line bg-bz-surface text-bz-text-muted")}
              >
                <HardDrive size={14} />
                <span className={cn("hidden sm:inline", NUM)}>{formatBytes(totalStorage)}</span>
                <ChevronDown size={12} className={cn("transition-transform", storageOpen && "rotate-180")} />
              </button>
            )}
          </div>

          {storageOpen && <StorageStrip nodes={nodes} />}

          {/* ── context row: breadcrumb / feed header + density + actions ── */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line-soft px-3 py-2.5 md:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              {searchActive ? (
                <span className={cn("text-[12px] text-bz-text-muted", NUM)}>
                  <span className="font-semibold text-bz-text">{searchResults.length}</span> result{searchResults.length === 1 ? "" : "s"} for “{searchQ}”
                </span>
              ) : mode === "folders" ? (
                <FolderBreadcrumb nodes={nodes} currentId={currentFolderId} onNavigate={navigateFolder} />
              ) : mode === "records" ? (
                <RecordBreadcrumb rec={rec} path={recordPath} onJump={(n) => setRecordPath(recordPath.slice(0, n))} />
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-bz-text">
                  {mode === "recent" ? <><Clock size={13} className="text-bz-text-muted" /> Recently added</> : <><Trash2 size={13} className="text-bz-text-muted" /> Deleted files</>}
                  <span className={cn("font-normal text-bz-text-muted", NUM)}>· {(mode === "recent" ? recentItems : trashItems).length}</span>
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {/* density switch */}
              <div className="flex items-center gap-0.5 rounded-bz-md bg-bz-paper-warm p-0.5">
                {([["list", ListIcon], ["grid", LayoutGrid]] as const).map(([d, Icon]) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    aria-label={`${d} view`}
                    className={cn("flex size-7 items-center justify-center rounded-[7px]", density === d ? "bg-bz-surface text-bz-text shadow-sm" : "text-bz-text-soft hover:text-bz-text")}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>

              <button onClick={() => setReloadNonce((v) => v + 1)} aria-label="Refresh" className={ICON_BTN}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>

              {mode === "folders" && (
                <>
                  <button ref={newFolderBtnRef} onClick={() => { setNewFolderOpen((v) => !v); setNewFolderName(""); }} className={GHOST_BTN}>
                    <FolderPlus size={14} /> <span className="hidden sm:inline">New folder</span>
                  </button>
                  <button onClick={() => setUploadOpen(true)} disabled={!canUpload} title={canUpload ? undefined : "Open a folder to upload files"} className={PRIMARY_BTN}>
                    <Upload size={14} /> <span className="hidden sm:inline">Upload</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* new-folder popover */}
          <AnchoredMenu open={newFolderOpen} anchorRef={newFolderBtnRef} onClose={() => !creating && setNewFolderOpen(false)} width={264}>
            <div className="p-2.5">
              <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">New folder in {currentFolder?.name}</p>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitFolder()}
                placeholder="Folder name"
                className="h-9 w-full rounded-bz-sm border border-bz-line bg-bz-paper px-2.5 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text-muted"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => !creating && setNewFolderOpen(false)} className="h-8 rounded-bz-sm px-2.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">Cancel</button>
                <button onClick={commitFolder} disabled={!sanitize(newFolderName) || creating} className={cn(PRIMARY_BTN, "h-8")}>
                  {creating ? <><Loader2 size={12} className="animate-spin" /> Creating…</> : <>Create</>}
                </button>
              </div>
            </div>
          </AnchoredMenu>

          {/* ── body: tree rail (folders mode) + content ── */}
          <div className="flex min-h-[440px]">
            {mode === "folders" && !searchActive && (
              <aside className="hidden w-[236px] shrink-0 border-r border-bz-line-soft py-3 pl-2 pr-1 lg:block">
                <div className="mb-1 flex items-center gap-1.5 px-2 py-1">
                  <button
                    onClick={() => navigateFolder(ROOT_ID)}
                    className={cn("flex flex-1 items-center gap-1.5 rounded-bz-sm px-1 py-1 text-left text-[11px] font-bold uppercase tracking-[0.1em]", atRoot ? "text-bz-text" : "text-bz-text-soft hover:text-bz-text")}
                  >
                    <Home size={12} /> File Cabinet
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  {nodes[ROOT_ID].childIds.map((id) => (
                    <TreeNode key={id} id={id} depth={0} nodes={nodes} expanded={expanded} currentId={currentFolderId} loadingId={treeLoadingId} onSelect={navigateFolder} onToggle={toggleTree} />
                  ))}
                </div>
              </aside>
            )}

            <div className="min-w-0 flex-1">
              {loading ? (
                <ListSkeleton />
              ) : searchActive ? (
                <SearchView
                  results={searchResults}
                  nodes={nodes}
                  density={density}
                  busyId={busyId}
                  onOpen={(n) => (n.kind === "folder" ? navigateFolder(n.id) : openFile(n))}
                  onPreview={(n) => openFile(n)}
                  onDownload={(n) => doDownload(n)}
                />
              ) : mode === "folders" ? (
                folderChildren.length === 0 ? (
                  <Empty icon={Inbox} title="This folder is empty" hint={canUpload ? "Upload files or create a subfolder to fill it." : "Open a folder, then upload files to fill it."} />
                ) : density === "grid" ? (
                  <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 xl:grid-cols-4 md:p-4">
                    {folderChildren.map((n) => (
                      <FileTile
                        key={n.id}
                        item={folderRow(n)}
                        busy={busyId === n.id}
                        selected={selectedId === n.id}
                        onActivate={() => (n.kind === "folder" ? navigateFolder(n.id) : openFile(n))}
                        actions={fileActions(n, { openFile, doDownload, doDelete })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-bz-line-soft">
                    {folderChildren.map((n) => (
                      <FileRow
                        key={n.id}
                        item={folderRow(n)}
                        busy={busyId === n.id}
                        selected={selectedId === n.id}
                        onActivate={() => (n.kind === "folder" ? navigateFolder(n.id) : openFile(n))}
                        actions={fileActions(n, { openFile, doDownload, doDelete })}
                      />
                    ))}
                  </div>
                )
              ) : mode === "records" ? (
                <RecordView rec={rec} density={density} onDrill={(i) => setRecordPath([...recordPath, i])} onOpen={openFile} onDownload={(d) => doDownload({ name: d.name, kind: "file" })} />
              ) : mode === "recent" ? (
                recentItems.length === 0 ? (
                  <Empty icon={Clock} title="Nothing added recently" hint="Newly added files across the cabinet show up here." />
                ) : (
                  <GenericFileList
                    items={recentItems}
                    density={density}
                    busyId={busyId}
                    metaFor={(n) => (
                      <>
                        <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{typeLabel(n.ext)} · {formatBytes(n.bytes)}</span>
                        <SourceGlyph source={n.source} recordRef={n.recordRef} />
                        <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{fmtDate(n.modified)}</span>
                      </>
                    )}
                    onActivate={(n) => openFile(n)}
                    actionsFor={(n) => fileActions(n, { openFile, doDownload, doDelete })}
                  />
                )
              ) : trashItems.length === 0 ? (
                <Empty icon={Trash2} title="Trash is empty" hint="Deleted files land here and can be restored to their original location." />
              ) : (
                <GenericFileList
                  items={trashItems}
                  density={density}
                  busyId={busyId}
                  metaFor={(n) => (
                    <>
                      <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{typeLabel(n.ext)} · {formatBytes(n.bytes)}</span>
                      <span className={cn("text-[11px] text-bz-text-soft", NUM)}>from {folderPathLabel(nodes, n.parentId).replace("File Cabinet / ", "")}</span>
                      <span className={cn("text-[11px] text-bz-text-soft", NUM)}>Deleted {fmtDate(n.deletedAt ?? TODAY)}</span>
                    </>
                  )}
                  onActivate={(n) => openFile(n)}
                  primaryFor={() => ({ icon: RotateCcw, label: "Restore" })}
                  onPrimary={(n) => doRestore(n)}
                  actionsFor={(n) => [
                    ...(canPreview(n.ext) ? [{ icon: Eye, label: "Preview", onClick: () => openFile(n) }] : []),
                    { icon: Download, label: "Download", onClick: () => doDownload(n) },
                    { icon: RotateCcw, label: "Restore", onClick: () => doRestore(n) },
                  ]}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

// ── per-item action set for the folders / recent / search contexts ──
function fileActions(
  n: Node,
  h: { openFile: (f: { name: string; ext?: string }) => void; doDownload: (n: { name: string; kind: "folder" | "file" }) => void; doDelete: (n: Node) => void },
): MenuAction[] {
  const out: MenuAction[] = [];
  if (n.kind === "file" && canPreview(n.ext)) out.push({ icon: Eye, label: "Preview", onClick: () => h.openFile(n) });
  out.push({ icon: Download, label: n.kind === "folder" ? "Download (.zip)" : "Download", onClick: () => h.doDownload(n) });
  out.push({ icon: Trash2, label: "Delete", danger: true, onClick: () => h.doDelete(n) });
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// BREADCRUMB TRAILS
// ════════════════════════════════════════════════════════════════════════════

function FolderBreadcrumb({ nodes, currentId, onNavigate }: { nodes: Record<string, Node>; currentId: string; onNavigate: (id: string) => void }) {
  const chain = pathChain(nodes, currentId);
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
      {chain.length > 0 && (
        <button
          onClick={() => onNavigate(chain.length >= 2 ? chain[chain.length - 2].id : ROOT_ID)}
          aria-label="Up one level"
          className="mr-0.5 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
        >
          <CornerLeftUp size={13} />
        </button>
      )}
      <button onClick={() => onNavigate(ROOT_ID)} className={cn("inline-flex shrink-0 items-center gap-1 rounded-bz-sm px-1.5 py-1 text-[12px] hover:bg-bz-paper-warm", chain.length === 0 ? "font-semibold text-bz-text" : "text-bz-text-muted")}>
        <Home size={12} /> Cabinet
      </button>
      {chain.map((n, i) => {
        const last = i === chain.length - 1;
        return (
          <React.Fragment key={n.id}>
            <ChevronRight size={12} className="shrink-0 text-bz-text-soft" />
            {last ? (
              <span className="shrink-0 whitespace-nowrap px-1 text-[12px] font-semibold text-bz-text">{n.name}</span>
            ) : (
              <button onClick={() => onNavigate(n.id)} className="shrink-0 whitespace-nowrap rounded-bz-sm px-1.5 py-1 text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">{n.name}</button>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RecordBreadcrumb({
  rec, path, onJump,
}: {
  rec: { module: RecModule | null; menu: RecMenu | null; record: RecRecord | null };
  path: number[];
  onJump: (n: number) => void;
}) {
  const steps = [
    { label: "By record", icon: Layers },
    ...(rec.module ? [{ label: rec.module.name }] : []),
    ...(rec.menu ? [{ label: rec.menu.name }] : []),
    ...(rec.record ? [{ label: rec.record.code }] : []),
  ];
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
      {path.length > 0 && (
        <button onClick={() => onJump(path.length - 1)} aria-label="Up one level" className="mr-0.5 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
          <CornerLeftUp size={13} />
        </button>
      )}
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const Icon = (s as { icon?: LucideIcon }).icon;
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={12} className="shrink-0 text-bz-text-soft" />}
            {last ? (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-1 text-[12px] font-semibold text-bz-text">{Icon && <Icon size={12} />}{s.label}</span>
            ) : (
              <button onClick={() => onJump(i)} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-bz-sm px-1.5 py-1 text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">{Icon && <Icon size={12} />}{s.label}</button>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GENERIC FILE LIST  (recent / trash / search share the same body)
// ════════════════════════════════════════════════════════════════════════════

function GenericFileList({
  items, density, busyId, metaFor, onActivate, actionsFor, primaryFor, onPrimary,
}: {
  items: Node[];
  density: "list" | "grid";
  busyId: string | null;
  metaFor: (n: Node) => React.ReactNode;
  onActivate: (n: Node) => void;
  actionsFor: (n: Node) => MenuAction[];
  primaryFor?: (n: Node) => { icon: LucideIcon; label: string };
  onPrimary?: (n: Node) => void;
}) {
  if (density === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 xl:grid-cols-4 md:p-4">
        {items.map((n) => (
          <FileTile key={n.id} item={{ id: n.id, kind: n.kind, ext: n.ext, name: n.name }} busy={busyId === n.id} selected={false} onActivate={() => onActivate(n)} actions={actionsFor(n)} />
        ))}
      </div>
    );
  }
  return (
    <div className="divide-y divide-bz-line-soft">
      {items.map((n) => (
        <FileRow
          key={n.id}
          item={{ id: n.id, kind: n.kind, ext: n.ext, name: n.name, meta: metaFor(n) }}
          busy={busyId === n.id}
          selected={false}
          onActivate={() => onActivate(n)}
          actions={actionsFor(n)}
          primaryLabel={primaryFor?.(n)}
          onPrimary={onPrimary ? () => onPrimary(n) : undefined}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH VIEW  hits with a path/location descriptor
// ════════════════════════════════════════════════════════════════════════════

function SearchView({
  results, nodes, density, busyId, onOpen, onPreview, onDownload,
}: {
  results: Node[];
  nodes: Record<string, Node>;
  density: "list" | "grid";
  busyId: string | null;
  onOpen: (n: Node) => void;
  onPreview: (n: Node) => void;
  onDownload: (n: Node) => void;
}) {
  if (results.length === 0) return <Empty icon={SearchX} title="No matches" hint="No files or folders match your search in this organisation. Try a shorter query." />;
  return (
    <GenericFileList
      items={results}
      density={density}
      busyId={busyId}
      metaFor={(n) => (
        <>
          <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{n.kind === "folder" ? "Folder" : `${typeLabel(n.ext)} · ${formatBytes(n.bytes)}`}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-soft"><Folder size={11} /> {folderPathLabel(nodes, n.parentId)}</span>
        </>
      )}
      onActivate={onOpen}
      actionsFor={(n) => [
        ...(n.kind === "file" && canPreview(n.ext) ? [{ icon: Eye, label: "Preview", onClick: () => onPreview(n) }] : []),
        { icon: Download, label: n.kind === "folder" ? "Download (.zip)" : "Download", onClick: () => onDownload(n) },
      ]}
    />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RECORD VIEW  drill: modules → menus → records → documents
// ════════════════════════════════════════════════════════════════════════════

function DrillRow({ icon: Icon, title, sub, count, onClick }: { icon: LucideIcon; title: string; sub?: string; count?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-bz-paper-warm/50 md:px-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Icon size={16} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-bz-text">{title}</p>
        {sub && <p className="truncate text-[11px] text-bz-text-muted">{sub}</p>}
      </div>
      {count != null && <span className={cn("shrink-0 text-[11px] text-bz-text-soft", NUM)}>{count}</span>}
      <ChevronRight size={15} className="shrink-0 text-bz-text-soft group-hover:text-bz-text-muted" />
    </button>
  );
}

function RecordView({
  rec, density, onDrill, onOpen, onDownload,
}: {
  rec: { module: RecModule | null; menu: RecMenu | null; record: RecRecord | null; level: number };
  density: "list" | "grid";
  onDrill: (i: number) => void;
  onOpen: (f: { name: string; ext?: string }) => void;
  onDownload: (d: RecDoc) => void;
}) {
  // level 0 — modules
  if (!rec.module) {
    return (
      <div className="divide-y divide-bz-line-soft">
        {RECORD_TREE.map((m, i) => (
          <DrillRow key={m.name} icon={Layers} title={m.name} sub={`${m.menus.length} record group${m.menus.length === 1 ? "" : "s"}`} count={m.menus.reduce((s, mn) => s + mn.records.length, 0)} onClick={() => onDrill(i)} />
        ))}
      </div>
    );
  }
  // level 1 — menus of a module
  if (!rec.menu) {
    return (
      <div className="divide-y divide-bz-line-soft">
        {rec.module.menus.map((mn, i) => (
          <DrillRow key={mn.name} icon={Folder} title={mn.name} sub={`${mn.records.length} record${mn.records.length === 1 ? "" : "s"}`} count={mn.records.length} onClick={() => onDrill(i)} />
        ))}
      </div>
    );
  }
  // level 2 — records of a menu
  if (!rec.record) {
    if (rec.menu.records.length === 0) return <Empty icon={Inbox} title="No records here" hint="This group has no records with attached documents yet." />;
    return (
      <div className="divide-y divide-bz-line-soft">
        {rec.menu.records.map((r, i) => (
          <DrillRow key={r.code} icon={FileText} title={r.code} sub={r.title} count={r.docs.length} onClick={() => onDrill(i)} />
        ))}
      </div>
    );
  }
  // level 3 — documents attached to a record
  const docs = rec.record.docs;
  if (docs.length === 0) return <Empty icon={Inbox} title="No documents attached" hint={`${rec.record.code} has no documents filed against it yet.`} />;

  const actionsFor = (d: RecDoc): MenuAction[] => [
    ...(canPreview(d.ext) ? [{ icon: Eye, label: "Preview", onClick: () => onOpen(d) }] : []),
    { icon: Download, label: "Download", onClick: () => onDownload(d) },
  ];

  if (density === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 xl:grid-cols-4 md:p-4">
        {docs.map((d, i) => (
          <FileTile key={i} item={{ id: `${i}`, kind: "file", ext: d.ext, name: d.name, primary: d.primary }} busy={false} selected={false} onActivate={() => onOpen(d)} actions={actionsFor(d)} />
        ))}
      </div>
    );
  }
  return (
    <div className="divide-y divide-bz-line-soft">
      {docs.map((d, i) => (
        <FileRow
          key={i}
          item={{
            id: `${i}`, kind: "file", ext: d.ext, name: d.name, primary: d.primary,
            meta: (
              <>
                <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{typeLabel(d.ext)} · {formatBytes(d.bytes)}</span>
                <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{fmtDate(d.modified)}</span>
              </>
            ),
          }}
          busy={false}
          selected={false}
          onActivate={() => onOpen(d)}
          actions={actionsFor(d)}
        />
      ))}
    </div>
  );
}
