import * as React from "react";
import { Boxes, Package, Plus, Receipt, ShoppingCart } from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "../sales/AppFrame";
import { BTN, CARD, Chip, FrameContext, GHOST, GHOST_SM, INPUT, INPUT_SM, LABEL, MenuItem, NUM, Segmented, Select, ToastHost, useToast } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import { AmountInput, Section } from "../sales/parts";
import {
  AmountPop,
  AskFirst,
  CopyText,
  DatedRates,
  Facts,
  Failed,
  Grid,
  InlineField,
  goToField,
  LineOffer,
  Lock,
  MasterSheet,
  MastersHub,
  PageField,
  RatePop,
  RecordPage,
  RecordSection,
  RelatedBlock,
  SaveDock,
  SheetContext,
  Source,
  Usage,
  fmtDayMonth,
  fmtRate,
  useDatedRates,
  useStagedRows,
  useUnsavedGuard,
} from "./kit";
import type { CellValue, DatedRate, Fact, GridColumn, GridGroup, MasterKindConfig, PageSection, RowState, StagedChange } from "./kit";
import { unitDuplicate } from "./seed/units";

// ════════════════════════════════════════════════════════════════════════════
// MASTERS KIT — an internal bench for the shared pieces (spec §9.4 WP0: "a
// scratch route shows each state in both themes"). Every block is a live
// component in its states, so the builders of the item desk and the hub, and
// the reviewers, click the real thing. The theme switch here is the frame's.
// Seed values echo the dev data in spec §0 / §9.2.
// ════════════════════════════════════════════════════════════════════════════

const TODAY = "2026-09-25";
const ME = "Arun";
let uid = 0;
const nextId = (p: string) => `${p}-${++uid}`;
const money = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

const SECTIONS: { id: string; label: string }[] = [
  { id: "k-grid", label: "Grid" },
  { id: "k-variants", label: "Grid · groups" },
  { id: "k-states", label: "Grid · states" },
  { id: "k-inline", label: "Inline field" },
  { id: "k-marks", label: "Marks & facts" },
  { id: "k-rates", label: "Dated rates" },
  { id: "k-pops", label: "Popover forms" },
  { id: "k-sheet", label: "Master sheet" },
  { id: "k-hub", label: "Masters hub" },
  { id: "k-page", label: "Record page" },
];

type Toast = ReturnType<typeof useToast>["show"];

export function MastersKitPage() {
  return (
    <AppFrame title="Masters kit" rail="Settings">
      <KitBody />
    </AppFrame>
  );
}

function KitBody() {
  const { dark, setDark } = React.useContext(FrameContext);
  const { toast, show, dismiss } = useToast();
  const scroller = React.useRef<HTMLDivElement>(null);
  // Scroll the kit's own scroller only — scrollIntoView would also scroll the frame's overflow:hidden box.
  const jump = (id: string) => {
    const root = scroller.current;
    const el = root?.querySelector<HTMLElement>(`#${id}`);
    if (root && el) root.scrollTo({ top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 56, behavior: "smooth" });
  };
  return (
    <div ref={scroller} className="h-full overflow-y-auto [scrollbar-width:thin]">
      <div className="sticky top-0 z-40 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">
        <Segmented size="sm" value={dark ? "dark" : "light"} onChange={(v) => setDark(v === "dark")} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        <nav aria-label="Kit sections" className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => jump(s.id)} className="rounded-bz-sm px-1.5 py-0.5 text-[11.5px] text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire">
              {s.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-4 pb-24 md:p-6 md:pb-24">
        <ConversionsDemo show={show} />
        <VariantsDemo show={show} />
        <StatesDemo />
        <InlineDemo show={show} />
        <MarksDemo show={show} />
        <RatesDemo show={show} />
        <PopsDemo show={show} />
        <SheetDemo show={show} />
        <HubDemo show={show} />
        <PageDemo show={show} />
      </div>
      <ToastHost toast={toast} onDismiss={dismiss} />
    </div>
  );
}

function KitBlock({ id, title, states, children, right }: { id: string; title: string; states: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-14">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h2>
        <p className="m-0 text-[11.5px] text-bz-text-soft">{states}</p>
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </div>
      {children}
    </section>
  );
}

// ── 1 · Grid, staged: unit conversions ─────────────────────────────────────

type Conv = { id: string; unit: string | null; factor: number | null };
const UNIT_OPTS: SelectOption[] = ["ZZ-CLAUDE-QA-Carton", "Box", "Pack", "Dozen", "Bag", "Kit"].map((u) => ({ value: u, label: u }));

function ConversionsDemo({ show }: { show: Toast }) {
  const s = useStagedRows<Conv>([
    { id: "c1", unit: "ZZ-CLAUDE-QA-Carton", factor: 12 },
    { id: "c2", unit: "Box", factor: 6 },
  ]);
  const [tried, setTried] = React.useState(false);
  const errors = React.useMemo(() => {
    const out: Record<string, string> = {};
    const live = s.rows.filter((r) => !s.changes.removed.includes(r.id));
    for (const r of live) {
      if (!r.unit) out[r.id] = "Choose a unit.";
      else if (!(r.factor !== null && r.factor > 0)) out[r.id] = "Enter a number above 0.";
      else if (live.some((o) => o.id !== r.id && o.unit === r.unit)) out[r.id] = `${r.unit} is already listed.`;
    }
    return out;
  }, [s.rows, s.changes.removed]);
  const columns: GridColumn<Conv>[] = [
    { key: "unit", label: "Unit", width: "minmax(0,1.1fr)", kind: "select", options: UNIT_OPTS, placeholder: "Choose…" },
    { key: "factor", label: "= N Piece", width: "112px", kind: "number", placeholder: "—" },
    { key: "example", label: "Example", width: "minmax(0,1fr)", kind: "readonly", render: (r) => (r.unit && r.factor ? <span className="text-bz-text-muted">3 {r.unit} = {(3 * r.factor).toLocaleString("en-US")} Piece</span> : "") },
  ];
  const rowState = (r: Conv): RowState => ({ ...s.rowState(r), error: tried || s.rowState(r).dirty ? errors[r.id] ?? null : null });
  const save = () => {
    setTried(true);
    if (Object.keys(errors).length) return show("error", Object.values(errors)[0]);
    s.accept();
    setTried(false);
    show("success", "Conversions saved");
  };
  return (
    <KitBlock
      id="k-grid"
      title="Grid · staged"
      states="select + number cells, live example column, the waiting add row, dirty edge, removed (struck), a refused row with its sentence under it"
      right={
        s.dirty && (
          <>
            <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>{s.count} staged</span>
            <button type="button" className={GHOST_SM} onClick={() => (s.reset(), setTried(false))}>
              Discard
            </button>
            <button type="button" className={cn(BTN, "h-8")} onClick={save}>
              Save
            </button>
          </>
        )
      }
    >
      <Grid<Conv>
        ariaLabel="Unit conversions"
        columns={columns}
        rows={s.rows}
        rowState={rowState}
        onCell={s.setCell}
        onRemove={s.remove}
        ghost={{
          blank: () => ({ id: "ghost", unit: null, factor: null }),
          label: "Add a unit",
          onAdd: (r) => {
            if (!r.unit) return "Choose a unit.";
            if (!(r.factor !== null && r.factor > 0)) return "Enter a number above 0.";
            if (s.rows.some((o) => o.unit === r.unit && !s.changes.removed.includes(o.id))) return `${r.unit} is already listed.`;
            s.add({ ...r, id: nextId("c") });
            return null;
          },
        }}
        empty="No conversions yet."
        foot={<span>A document in a unit with no conversion moves stock 1:1.</span>}
      />
      <p className="m-0 mt-2 text-[11px] text-bz-text-soft">
        Keys: arrows · Enter / F2 edit · type to replace · Esc cancels (again: leaves) · Tab moves while editing · Ctrl+D or Alt+↓ fill down · Delete removes · ⇧Space selects.
      </p>
    </KitBlock>
  );
}

// ── 2 · Grid, groups: variants ─────────────────────────────────────────────

type Variant = { id: string; size: string; colour: string; code: string; sell: number | null; buy: number | null; available: number };
const SIZES = ["S", "M", "L", "XL"];
const COLOURS = [
  ["Red", "RED"],
  ["Blue", "BLU"],
  ["Black", "BLK"],
];
const T_SELL = 250;
const T_BUY = 120;
const VARIANTS: Variant[] = SIZES.flatMap((sz) =>
  COLOURS.map(([c, ab]) => ({ id: `v-${sz}-${ab}`, size: sz, colour: c, code: `ZZ-CLAUDE-MX2-${sz}-${ab}`, sell: (sz === "M" && ab === "RED") || (sz === "L" && ab === "BLU") ? 275 : T_SELL, buy: T_BUY, available: 0 })),
);

function VariantsDemo({ show }: { show: Toast }) {
  const s = useStagedRows<Variant>(VARIANTS);
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [pop, setPop] = React.useState<{ anchor: HTMLElement; ids: string[]; title: string } | null>(null);
  const columns: GridColumn<Variant>[] = [
    { key: "values", label: "Values", width: "minmax(0,0.8fr)", kind: "readonly", render: (r) => `${r.size} · ${r.colour}` },
    { key: "code", label: "Code", width: "minmax(0,1.4fr)", kind: "readonly", render: (r) => <span className="text-bz-text-muted">{r.code}</span> },
    {
      key: "sell",
      label: "Sell",
      width: "116px",
      kind: "number",
      format: (v) => money(v as number),
      muted: (r) => r.sell === T_SELL,
      render: (r) => (
        <span className="inline-flex items-center justify-end gap-0.5">
          {r.sell !== T_SELL && <Source kind="override" resetLabel="Reset to template price" onReset={() => s.setCell(r.id, "sell", T_SELL)} tabIndex={-1} />}
          {money(r.sell)}
        </span>
      ),
    },
    { key: "buy", label: "Buy", width: "96px", kind: "number", format: (v) => money(v as number), muted: (r) => r.buy === T_BUY },
    { key: "available", label: "Available", width: "84px", kind: "readonly", align: "right" },
  ];
  const groups: GridGroup[] = SIZES.map((sz) => ({
    key: sz,
    label: sz,
    rowIds: s.rows.filter((r) => r.size === sz).map((r) => r.id),
    collapsed: sz !== "S" && sz !== "M",
    right: (
      <button type="button" className={cn(GHOST_SM, "h-7")} onClick={(e) => setPop({ anchor: e.currentTarget, ids: s.rows.filter((r) => r.size === sz).map((r) => r.id), title: `Set sell price · all ${sz}` })}>
        Set price
      </button>
    ),
  }));
  return (
    <KitBlock
      id="k-variants"
      title="Grid · groups, selection, inherited values"
      states="bands with a group edit, collapsed bands (L, XL), muted = the template's value, full ink + ↺ = an override, row selection, bulk set price"
      right={
        <>
          {sel.size > 0 && (
            <>
              <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>{sel.size} selected</span>
              <button type="button" className={GHOST_SM} onClick={(e) => setPop({ anchor: e.currentTarget, ids: [...sel], title: `Set sell price · ${sel.size} variants` })}>
                Set price
              </button>
            </>
          )}
          {s.dirty && (
            <>
              <button type="button" className={GHOST_SM} onClick={s.reset}>
                Discard
              </button>
              <button type="button" className={cn(BTN, "h-8")} onClick={() => (s.accept(), show("success", `${s.count} variant${s.count === 1 ? "" : "s"} saved`))}>
                Save
              </button>
            </>
          )}
        </>
      }
    >
      <Grid<Variant> ariaLabel="Variants" columns={columns} rows={s.rows} groups={groups} rowState={s.rowState} onCell={s.setCell} selectable selected={sel} onSelect={setSel} />
      <AmountPop
        open={!!pop}
        anchor={pop?.anchor ?? null}
        onClose={() => setPop(null)}
        title={pop?.title ?? ""}
        label="Sell price"
        initial={T_SELL}
        suffix="NPR"
        onApply={(n) => {
          pop?.ids.forEach((id) => s.setCell(id, "sell", n));
          return null;
        }}
      />
    </KitBlock>
  );
}

// ── 3 · Grid states ────────────────────────────────────────────────────────

type Simple = { id: string; name: string; rate: number | null; used: number };
function StatesDemo() {
  const cols: GridColumn<Simple>[] = [
    { key: "name", label: "Name", width: "minmax(0,1fr)" },
    { key: "rate", label: "Rate %", width: "90px", kind: "number" },
    { key: "used", label: "Used", width: "64px", kind: "readonly", align: "right" },
  ];
  const ro: Simple[] = [
    { id: "a", name: "VAT 13", rate: 13, used: 212 },
    { id: "b", name: "Exempt", rate: 0, used: 9 },
  ];
  const [empty, setEmpty] = React.useState<Simple[]>([]);
  return (
    <KitBlock id="k-states" title="Grid · states" states="first read (skeleton rows) · empty = the add row + one line · readonly (arrows still move)">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Grid<Simple> ariaLabel="Loading" columns={cols} rows={[]} loading loadingText="Loading taxes…" minWidth={0} />
        <Grid<Simple>
          ariaLabel="Empty"
          columns={cols}
          rows={empty}
          ghost={{ blank: () => ({ id: "g", name: "", rate: null, used: 0 }), label: "Add a tax — name", onAdd: (r) => (r.name.trim() ? (setEmpty((e) => [...e, { ...r, id: nextId("t") }]), null) : "A name is required.") }}
          onCell={(id, key, v) => setEmpty((e) => e.map((x) => (x.id === id ? { ...x, [key]: v } : x)))}
          onRemove={(id) => setEmpty((e) => e.filter((x) => x.id !== id))}
          empty="No taxes yet."
          minWidth={0}
        />
        <Grid<Simple> ariaLabel="Read only" columns={cols} rows={ro} mode="readonly" minWidth={0} />
      </div>
    </KitBlock>
  );
}

// ── 4 · Inline field ───────────────────────────────────────────────────────

function InlineDemo({ show }: { show: Toast }) {
  const [sell, setSell] = React.useState<number | null>(null);
  const [buy, setBuy] = React.useState<number | null>(820);
  const [code, setCode] = React.useState("ZZ-CLAUDE-INV-2");
  const [cat, setCat] = React.useState<string | null>(null);
  const [reorder, setReorder] = React.useState<number | null>(null);
  const cats: SelectOption[] = ["Garments", "Industrial", "Groceries", "Networking"].map((c) => ({ value: c, label: c }));
  const saveMoney = (label: string, before: number | null, set: (v: number | null) => void) => async (v: CellValue) => {
    await wait(700);
    const n = typeof v === "number" ? v : null;
    set(n);
    show("success", `${label} saved`, { label: "Undo", run: () => set(before) }, 8000);
    return null;
  };
  const row = (label: string, control: React.ReactNode) => (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 border-b border-bz-line-soft py-1.5 last:border-0">
      <span className="text-[11.5px] text-bz-text-muted">{label}</span>
      {control}
    </div>
  );
  return (
    <KitBlock id="k-inline" title="Inline field" states="read · pencil on hover/focus · Enter commits one field · Esc cancels · blur keeps it open · saving · 600 ms tick · refused (try code MPS-006)">
      <div className={cn(CARD, "max-w-[520px] px-4 py-2")}>
        {row("Sell price", <InlineField label="Sell price" editor="amount" value={sell} display={sell === null ? undefined : money(sell)} suffix="NPR" onCommit={saveMoney("Sell price", sell, setSell)} />)}
        {row("Purchase price", <InlineField label="Purchase price" editor="amount" value={buy} display={buy === null ? undefined : money(buy)} suffix="NPR" onCommit={saveMoney("Purchase price", buy, setBuy)} />)}
        {row(
          "Code",
          <InlineField
            label="Code"
            value={code}
            onCommit={async (v) => {
              await wait(500);
              // D-14: a new or edited code another live item holds is refused, in the server's words.
              if (String(v).trim().toUpperCase() === "MPS-006") return "Code already used by Blue Mug.";
              setCode(String(v));
              show("success", "Code saved", { label: "Undo", run: () => setCode(code) }, 8000);
              return null;
            }}
          />,
        )}
        {row("Category", <InlineField label="Category" editor="select" options={cats} value={cat} onCommit={async (v) => (await wait(400), setCat(v as string), show("success", "Category saved", { label: "Undo", run: () => setCat(cat) }, 8000), null)} />)}
        {row("Reorder point", <InlineField label="Reorder point" editor="number" value={reorder} suffix="Piece" placeholder="Not set" onCommit={async (v) => (await wait(400), setReorder(v as number | null), null)} />)}
        {row("Type", <Lock compact className="px-1 text-[12px]">Stock item</Lock>)}
      </div>
    </KitBlock>
  );
}

// ── 5 · Marks and facts ────────────────────────────────────────────────────

function MarksDemo({ show }: { show: Toast }) {
  const [loading, setLoading] = React.useState(false);
  const [offer, setOffer] = React.useState(true);
  const [income, setIncome] = React.useState<string | null>(null);
  const facts: Fact[] = [
    { key: "avail", label: "Available", value: "−7", sub: "neg", danger: true, title: "More went out than came in at WH1 East.", onOpen: () => show("info", "Stock by location") },
    { key: "order", label: "On order", value: "—", onOpen: () => show("info", "Open documents") },
    { key: "cost", label: "Unit cost", value: "820.00", onOpen: () => show("info", "Valuation report") },
    { key: "sell", label: "Sell", value: "—" },
    { key: "margin", label: "Margin", value: "—", title: "Sell − unit cost, as % of sell" },
    { key: "reorder", label: "Reorder at", value: "—" },
  ];
  const cell = (label: string, children: React.ReactNode) => (
    <div className="min-w-0 bg-bz-surface px-3 py-2.5">
      <p className={cn(LABEL, "m-0 mb-1.5")}>{label}</p>
      <div className="text-[12px] text-bz-text">{children}</div>
    </div>
  );
  return (
    <KitBlock id="k-marks" title="Marks & the facts band" states="lock (read face + reason / compact) · source: inherited, override ↺, missing + use default · usage door / Not used · copy · line offer · failed + retry">
      <div className={cn(CARD, "mb-4 flex flex-wrap items-center gap-3 px-4 py-2")}>
        <Facts facts={facts} loading={loading} className="min-w-0 flex-1" />
        <button type="button" className={GHOST_SM} onClick={() => setLoading((v) => !v)}>
          {loading ? "Show values" : "Show loading"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-2 lg:grid-cols-3">
        {cell("Lock", <Lock>Piece</Lock>)}
        {cell("Lock · compact", <span className="inline-flex items-center gap-3">Unit <Lock compact>Piece</Lock></span>)}
        {cell("Source · inherited", <span className="inline-flex items-center gap-2">Sales Revenue <Source kind="inherited" from="from template" /></span>)}
        {cell("Source · override", <span className="inline-flex items-center gap-1">275.00 <Source kind="override" resetLabel="Reset to template price" onReset={() => show("info", "Back to 250.00")} /></span>)}
        {cell(
          "Source · missing",
          income ? (
            <span className="inline-flex items-center gap-2">
              {income} <Source kind="inherited" from="from Preference Setup" />
            </span>
          ) : (
            <Source kind="missing" useDefault={{ label: "Sales Revenue", onUse: () => setIncome("Sales Revenue") }} />
          ),
        )}
        {cell(
          "Usage",
          <span className="inline-flex items-center gap-4">
            <Usage counts={[{ label: "Invoices", count: 22, onOpen: () => show("info", "Invoices using USD") }, { label: "Receipts", count: 11 }, { label: "Customers", count: 4 }, { label: "Bank accounts", count: 1 }]} />
            <Usage counts={[{ label: "Invoices", count: 0 }]} />
          </span>,
        )}
        {cell(
          "Copy",
          <span className="inline-flex flex-wrap items-center gap-3">
            <CopyText text="ZZ-CLAUDE-INV-2" onCopied={() => show("success", "Copied")} />
            <CopyText text="8901234567890" />
          </span>,
        )}
        {cell(
          "Line offer",
          offer ? (
            <LineOffer text="Sell price is now 275.00 (line has 250.00)." use={{ label: "Use 275.00", onClick: () => (setOffer(false), show("success", "Line 2 now 275.00")) }} keep={{ label: "Keep 250.00", onClick: () => setOffer(false) }} />
          ) : (
            <button type="button" className={GHOST_SM} onClick={() => setOffer(true)}>
              Show again
            </button>
          ),
        )}
        {cell("Failed · compact", <Failed compact text="Couldn't load stock." onRetry={() => show("info", "Retrying…")} />)}
      </div>
    </KitBlock>
  );
}

// ── 6 · Dated rates ────────────────────────────────────────────────────────

const USD_RATES: DatedRate[] = [
  { id: "r5", date: "2026-09-25", rate: 134.1, source: "Manual", by: "Arun", used: 0 },
  { id: "r4", date: "2026-09-23", rate: 133.42, source: "Manual", by: "Arun", used: 12 },
  { id: "r3", date: "2026-09-01", rate: 132.8, source: "Manual", by: "Yepa", used: 29 },
  { id: "r2", date: "2026-08-15", rate: 132.35, source: "Import", by: "Yepa", used: 41 },
  { id: "r1", date: "2026-08-01", rate: 131.9, source: "Import", by: "Yepa", used: 57 },
];

function RatesDemo({ show }: { show: Toast }) {
  const rates = useDatedRates(USD_RATES, { today: TODAY, by: ME });
  const [tried, setTried] = React.useState(false);
  const save = () => {
    setTried(true);
    const first = Object.values(rates.errors)[0];
    if (first) return show("error", first);
    const n = rates.staged.count;
    rates.staged.accept();
    setTried(false);
    show("success", n === 1 ? "USD rate saved" : `${n} rates saved`);
  };
  return (
    <KitBlock
      id="k-rates"
      title="Dated rates"
      states="newest first · a used row is 🔒 (hover the lock) · an unused row edits in place · Add rate: today, prefilled, rate focused, live % · t / ↑ ↓ in the date cell · same date twice refused"
    >
      <div className={cn(CARD, "max-w-[720px] overflow-clip")}>
        <div className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-2.5">
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">Rates</h3>
          <span className="text-[11.5px] text-bz-text-soft">to NPR</span>
          <div className="ml-auto flex items-center gap-1.5">
            {rates.staged.dirty && (
              <>
                <button type="button" className={GHOST_SM} onClick={() => (rates.staged.reset(), setTried(false))}>
                  Discard
                </button>
                <button type="button" className={cn(BTN, "h-8")} onClick={save}>
                  Save
                </button>
              </>
            )}
            <button type="button" className={GHOST_SM} onClick={rates.add}>
              <Plus size={11} /> Add rate
            </button>
          </div>
        </div>
        <div className="p-3">
          <DatedRates rates={rates} from="USD" to="NPR" today={TODAY} />
          {tried && !rates.valid && <p className="m-0 mt-2 text-[11px] text-bz-red">Fix the rows marked in red, then save.</p>}
        </div>
      </div>
    </KitBlock>
  );
}

// ── 7 · Popover forms ──────────────────────────────────────────────────────

const CUSTOMERS: SelectOption[] = [
  { value: "c-ph", label: "Pokhara Hardware", group: "Bought this item", hint: "Last: 3 Piece · 12 Sep" },
  { value: "c-bt", label: "Butwal Traders", group: "Bought this item" },
  { value: "c-kt", label: "Kathmandu Tools Pvt. Ltd.", group: "All customers" },
  { value: "c-lb", label: "Lalitpur Builders", group: "All customers" },
  { value: "c-nm", label: "Narayani Machinery", group: "All customers" },
];

function PopsDemo({ show }: { show: Toast }) {
  const [rate, setRate] = React.useState<{ rate: number; date: string }>({ rate: 134.1, date: "2026-09-25" });
  const [history, setHistory] = React.useState<{ rate: number; date: string; used: number }[]>([
    { rate: 134.1, date: "2026-09-25", used: 0 },
    { rate: 133.42, date: "2026-09-23", used: 12 },
  ]);
  const [rateAnchor, setRateAnchor] = React.useState<HTMLElement | null>(null);
  const [ask, setAsk] = React.useState<{ anchor: HTMLElement; template: boolean } | null>(null);
  const [variant, setVariant] = React.useState<string | null>(null);
  return (
    <KitBlock id="k-pops" title="Popover forms" states="rate popover (R on a currency row): direction, inverse, % change, Enter saves · ask-first: customer + quantity, both skippable; a template asks for its variant">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={(e) => setRateAnchor(e.currentTarget)} className={cn(GHOST, NUM)} title="Change the rate (R)">
          1 USD = {fmtRate(rate.rate)} NPR <span className="font-normal text-bz-text-soft">· {fmtDayMonth(rate.date)}</span>
        </button>
        <button type="button" className={GHOST} onClick={(e) => setAsk({ anchor: e.currentTarget, template: false })}>
          <ShoppingCart size={13} /> New sales order
        </button>
        <button type="button" className={GHOST} onClick={(e) => (setVariant(null), setAsk({ anchor: e.currentTarget, template: true }))}>
          <ShoppingCart size={13} /> New sales order · template
        </button>
      </div>
      <RatePop
        open={!!rateAnchor}
        anchor={rateAnchor}
        onClose={() => setRateAnchor(null)}
        from="USD"
        to="NPR"
        last={rate}
        today={TODAY}
        onSave={(r) => {
          const same = history.find((h) => h.date === r.date);
          if (same && same.used > 0) return `There is already a rate for ${fmtDayMonth(r.date)}. Edit that one.`;
          const before = rate;
          setHistory((h) => [{ ...r, used: 0 }, ...h.filter((x) => x.date !== r.date)]);
          setRate(r);
          show("success", "USD rate saved", { label: "Undo", run: () => setRate(before) }, 8000);
          return null;
        }}
      />
      <AskFirst
        open={!!ask}
        anchor={ask?.anchor ?? null}
        onClose={() => setAsk(null)}
        title={ask?.template ? "New sales order · ZZ-CLAUDE-MX2 Tee" : "New sales order · ZZ-CLAUDE-INV2"}
        customers={CUSTOMERS}
        units={[
          { value: "Piece", label: "Piece" },
          { value: "ZZ-CLAUDE-QA-Carton", label: "ZZ-CLAUDE-QA-Carton", hint: "12 Piece" },
        ]}
        unit="Piece"
        variant={ask?.template ? { id: variant, label: variant, onChoose: () => setVariant("M · Red") } : undefined}
        onStart={(r) => {
          setAsk(null);
          const who = CUSTOMERS.find((c) => c.value === r.customerId)?.label;
          show("info", `Order opens${who ? ` for ${who}` : ""}${r.qty ? ` · ${r.qty} ${r.unit}` : ""}`);
        }}
      />
    </KitBlock>
  );
}

// ── 8 · Master sheet ───────────────────────────────────────────────────────

function SheetDemo({ show }: { show: Toast }) {
  const [open, setOpen] = React.useState<null | "currency" | "jump" | "create" | "view">(null);
  const [lineRate, setLineRate] = React.useState(250);
  const [itemSell, setItemSell] = React.useState(250);
  const [offer, setOffer] = React.useState(false);
  return (
    <KitBlock id="k-sheet" title="Master sheet" states="one component: edit (currency) · use (the jump from a line, dim 10 % and the page stays scrollable) · create (⇧⌘↵ add another) · view only · docked beside a table · Esc asks when dirty">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={GHOST} onClick={() => setOpen("currency")}>
          Currency sheet · edit
        </button>
        <button type="button" className={GHOST} onClick={() => setOpen("jump")}>
          Item jump sheet · from line 2
        </button>
        <button type="button" className={GHOST} onClick={() => setOpen("create")}>
          Create sheet
        </button>
        <button type="button" className={GHOST} onClick={() => setOpen("view")}>
          View only
        </button>
      </div>

      <div className={cn(CARD, "mt-3 max-w-[720px] px-4 py-2.5")}>
        <div className="grid grid-cols-[24px_minmax(0,1fr)_96px_104px] items-center gap-2 text-[12.5px]">
          <span className={cn("text-center text-[11px] text-bz-text-soft", NUM)}>2</span>
          <span className="truncate">ZZ-CLAUDE-INV2</span>
          <span className={cn("text-right", NUM)}>3 Piece</span>
          <span className={cn("text-right font-semibold", NUM)}>{money(lineRate)}</span>
        </div>
        {offer && (
          <LineOffer
            className="ml-8 mt-1.5"
            text={`Sell price is now ${money(itemSell)} (line has ${money(lineRate)}).`}
            use={{ label: `Use ${money(itemSell)}`, onClick: () => (setLineRate(itemSell), setOffer(false)) }}
            keep={{ label: `Keep ${money(lineRate)}`, onClick: () => setOffer(false) }}
          />
        )}
      </div>

      <div className={cn(CARD, "mt-4 flex h-[420px] overflow-hidden")}>
        <div className="min-w-0 flex-1 p-4 text-[12px] text-bz-text-muted">
          <p className={cn(LABEL, "m-0 mb-2")}>A table would sit here</p>
          <p className="m-0">The sheet docks beside it from 1280px — the same component, `docked`.</p>
        </div>
        <CurrencySheet docked onClose={() => show("info", "Closed")} show={show} />
      </div>

      {open === "currency" && <CurrencySheet onClose={() => setOpen(null)} show={show} />}
      {open === "jump" && (
        <ItemJumpSheet
          sell={itemSell}
          onClose={() => setOpen(null)}
          onSaved={(n) => {
            setItemSell(n);
            setOpen(null);
            show("success", "Item saved", { label: "Undo", run: () => setItemSell(itemSell) }, 8000);
            if (n !== lineRate) setOffer(true);
          }}
        />
      )}
      {open === "create" && <CreateSheet onClose={() => setOpen(null)} show={show} />}
      {open === "view" && (
        <MasterSheet
          mode="view"
          eyebrow="Item"
          title="ZZ-CLAUDE-INV2"
          meta={[<CopyText key="c" text="ZZ-CLAUDE-INV-2" />, "Stock item", "FIFO"]}
          chips={<Chip tone="neutral" dot={false}>View only</Chip>}
          image={<Package size={16} />}
          door={{ label: "Open item page", onOpen: () => show("info", "Item page opens in a new tab") }}
          footDoor
          onClose={() => setOpen(null)}
        >
          <Section title="Prices" defaultOpen>
            <CellPair label="Sell price" value="—" />
            <CellPair label="Purchase price" value="820.00" />
          </Section>
        </MasterSheet>
      )}
    </KitBlock>
  );
}

function CellPair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 py-1 text-[12px]">
      <span className="text-bz-text-muted">{label}</span>
      <span className={cn("text-bz-text", NUM)}>{value}</span>
    </div>
  );
}

function CurrencySheet({ onClose, show, docked }: { onClose: () => void; show: Toast; docked?: boolean }) {
  const [code, setCode] = React.useState("USD");
  const [name, setName] = React.useState("US Dollar");
  const [symbol, setSymbol] = React.useState("$");
  const [place, setPlace] = React.useState<"before" | "after">("before");
  const rates = useDatedRates(USD_RATES, { today: TODAY, by: ME });
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const identityDirty = code !== "USD" || name !== "US Dollar" || symbol !== "$" || place !== "before";
  const dirty = identityDirty || rates.staged.dirty;
  const codeBad = !/^[A-Za-z]{2,5}$/.test(code);
  const save = () => {
    if (codeBad) return setRefusal("Use a 2–5 letter code, like USD.");
    const first = Object.values(rates.errors)[0];
    if (first) return setRefusal(first);
    rates.staged.accept();
    show("success", "Currency saved");
    onClose();
  };
  return (
    <MasterSheet
      docked={docked}
      mode="edit"
      eyebrow="Currency"
      title={`${code} · ${name}`}
      meta={["In use · 41 documents"]}
      menu={(close) => (
        <MenuItem danger disabled title="Used by documents — archive it instead" onClick={close}>
          Delete
        </MenuItem>
      )}
      footLeft={
        <button type="button" className="text-[12px] font-medium text-bz-red underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-bz-fire" onClick={() => show("info", "Archive asks first")}>
          Archive
        </button>
      }
      onCommit={save}
      dirty={dirty}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <PageField label="Code" required error={codeBad ? "Use a 2–5 letter code, like USD." : null} dirty={code !== "USD"}>
          <input value={code} onChange={(e) => (setCode(e.target.value), setRefusal(null))} onBlur={() => setCode((c) => c.toUpperCase())} className={cn(INPUT, codeBad && "border-bz-red-mark")} />
        </PageField>
        <PageField label="Name" required dirty={name !== "US Dollar"}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
        </PageField>
        <PageField label="Symbol" dirty={symbol !== "$"} hint={symbol.length > 4 ? "A symbol longer than 4 characters isn't printed." : undefined}>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} className={INPUT} />
        </PageField>
        <PageField label="Placement" dirty={place !== "before"}>
          <div className="flex items-center gap-2">
            <Segmented size="sm" value={place} onChange={setPlace} options={[{ value: "before", label: "Before" }, { value: "after", label: "After" }]} />
            <span className={cn("text-[12px] text-bz-text-muted", NUM)}>{place === "before" ? `${symbol}1,250.00` : `1,250.00 ${symbol}`}</span>
          </div>
        </PageField>
      </div>
      <Section
        title="Rates"
        summary="to NPR"
        defaultOpen
        right={
          <button type="button" className={GHOST_SM} onClick={rates.add}>
            <Plus size={11} /> Add rate
          </button>
        }
      >
        <DatedRates rates={rates} from="USD" to="NPR" today={TODAY} />
      </Section>
      <Section title="Subsidiaries" summary="Bizak Nepal · Bizak Gandaki" defaultOpen>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="neutral" dot={false}>Bizak Nepal Pvt. Ltd.</Chip>
          <Chip tone="neutral" dot={false}>Bizak Gandaki</Chip>
        </div>
      </Section>
      <Section title="Used by" summary="Invoices 22 · Receipts 11 · Customers 4 · Bank accounts 1">
        <Usage counts={[{ label: "Invoices", count: 22 }, { label: "Receipts", count: 11 }, { label: "Customers", count: 4 }, { label: "Bank accounts", count: 1 }]} />
      </Section>
    </MasterSheet>
  );
}

function ItemJumpSheet({ sell, onClose, onSaved }: { sell: number; onClose: () => void; onSaved: (n: number) => void }) {
  const [price, setPrice] = React.useState(sell);
  const [buy, setBuy] = React.useState(120);
  const [tax, setTax] = React.useState("VAT 13");
  const [income, setIncome] = React.useState<string | null>(null);
  const dirty = price !== sell || buy !== 120 || tax !== "VAT 13" || income !== null;
  return (
    <MasterSheet
      mode="edit"
      eyebrow="Item · line 2"
      title="ZZ-CLAUDE-INV2"
      meta={[<CopyText key="c" text="ZZ-CLAUDE-INV-2" />, "Stock item", "FIFO"]}
      image={<Package size={16} />}
      door={{ label: "Open item page", onOpen: () => {} }}
      footDoor
      context={
        <SheetContext
          title="On this invoice"
          rows={[
            <span key="a">Pokhara Hardware · level Dealer −8 %</span>,
            <span key="b" className={NUM}>Available at ZZ-CLAUDE-LOC-A186 5 Piece</span>,
            <span key="c" className={NUM}>Line rate {money(sell)} · item price {money(sell)}</span>,
          ]}
        />
      }
      dirty={dirty}
      onCommit={() => onSaved(price)}
      onClose={onClose}
    >
      <Section title="Prices" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <PageField label="Sell price" dirty={price !== sell} hint={price !== sell ? `was ${money(sell)}` : undefined}>
            <AmountInput ariaLabel="Sell price" value={price} onChange={setPrice} className="h-9" />
          </PageField>
          <PageField label="Purchase price" dirty={buy !== 120} hint={price < buy ? "Below purchase price." : undefined}>
            <AmountInput ariaLabel="Purchase price" value={buy} onChange={setBuy} className="h-9" />
          </PageField>
        </div>
      </Section>
      <Section title="Tax & accounts" defaultOpen>
        <div className="flex flex-col gap-3">
          <PageField label="Tax" dirty={tax !== "VAT 13"}>
            <Select trigger="ghost" className="h-9 w-full justify-between" label={tax} value={tax} onChange={setTax} options={["VAT 13", "Exempt", "Zero-rated"].map((t) => ({ value: t, label: t }))} />
          </PageField>
          <PageField label="Income account" dirty={income !== null}>
            {income ? <span className="text-[12.5px] text-bz-text">{income}</span> : <Source kind="missing" useDefault={{ label: "Sales Revenue", onUse: () => setIncome("Sales Revenue") }} />}
          </PageField>
        </div>
      </Section>
      <Section title="Essentials" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <PageField label="Base unit">
            <Lock>Piece</Lock>
          </PageField>
          <PageField label="Costing">
            <Lock>FIFO</Lock>
          </PageField>
        </div>
      </Section>
    </MasterSheet>
  );
}

function CreateSheet({ onClose, show }: { onClose: () => void; show: Toast }) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const nameErr = tried && !name.trim() ? "A name is required." : null;
  const codeErr = code.trim().toUpperCase() === "MPS-006" ? "Code already used by Blue Mug." : null;
  const create = (again: boolean) => {
    setTried(true);
    if (!name.trim() || codeErr) return;
    show("success", `${name.trim()} created`, again ? undefined : { label: "Open", run: () => {} });
    if (again) (setName(""), setCode(""), setTried(false));
    else onClose();
  };
  return (
    <MasterSheet
      mode="create"
      width={520}
      title="New item"
      door={{ label: "Open the full page", onOpen: () => show("info", "The full page opens in a new tab") }}
      secondary={{ label: "Create and add another", run: () => create(true) }}
      onCommit={() => create(false)}
      dirty={!!name || !!code}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <PageField label="Name" required error={nameErr} className="col-span-2">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Blue Mug" className={cn(INPUT, nameErr && "border-bz-red-mark")} />
        </PageField>
        <PageField label="Code / SKU" error={codeErr} hint={!codeErr && code.trim() ? "✓ unique" : undefined}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MUG-BLU" className={cn(INPUT, codeErr && "border-bz-red-mark")} />
        </PageField>
        <PageField label="Base unit" required>
          <Select trigger="ghost" className="h-9 w-full justify-between" label={<span className="font-normal text-bz-text-soft">Choose…</span>} value={null} onChange={() => {}} options={["Piece", "Box", "Kit"].map((u) => ({ value: u, label: u }))} />
        </PageField>
      </div>
    </MasterSheet>
  );
}

// ── 9 · Masters hub ────────────────────────────────────────────────────────

type UnitRow = { id: string; code: string; name: string; convertedOn: number; used: number; archived?: boolean };
type TaxRow = { id: string; name: string; rate: number; sales: string | null; purchase: string | null; used: number; archived?: boolean };

function HubDemo({ show }: { show: Toast }) {
  const [units, setUnits] = React.useState<UnitRow[]>([
    { id: "u1", code: "PCS", name: "Piece", convertedOn: 0, used: 212 },
    { id: "u2", code: "BOX", name: "Box", convertedOn: 3, used: 41 },
    { id: "u3", code: "CTN", name: "ZZ-CLAUDE-QA-Carton", convertedOn: 1, used: 3 },
    { id: "u4", code: "HRS", name: "Hours", convertedOn: 0, used: 9 },
    { id: "u5", code: "PKG", name: "Package", convertedOn: 0, used: 0 },
    { id: "u6", code: "LEN", name: "Length", convertedOn: 0, used: 0 },
    { id: "u7", code: "REAM", name: "Old ream", convertedOn: 0, used: 0, archived: true },
  ]);
  const [taxes] = React.useState<TaxRow[]>([
    { id: "t1", name: "VAT 13", rate: 13, sales: "VAT Payable", purchase: "VAT Receivable", used: 212 },
    { id: "t2", name: "Exempt", rate: 0, sales: "VAT Payable", purchase: "VAT Receivable", used: 9 },
    { id: "t3", name: "ZZ-CLAUDE-MULTIORG-OK", rate: 13, sales: "VAT Payable", purchase: null, used: 2 },
    { id: "t4", name: "Zero-rated", rate: 0, sales: "VAT Payable", purchase: "VAT Receivable", used: 0 },
  ]);
  const [active, setActive] = React.useState("units");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const dup = (code: string, except?: string) => units.some((u) => u.id !== except && u.code.toUpperCase() === code.trim().toUpperCase());
  // The server's words today (ResponseMessageConstants.Dublicate), shown verbatim — B-C8 gives it a real sentence.
  const DUP = (code: string, except?: string) => unitDuplicate(code, units.find((u) => u.id !== except && u.code.trim().toLowerCase() === code.trim().toLowerCase())?.name ?? "another unit");

  const unitKind: MasterKindConfig<UnitRow> = {
    key: "units",
    label: "Units",
    group: "Items",
    count: units.filter((u) => !u.archived).length,
    tier: 3,
    noun: ["unit", "units"],
    rows: units,
    searchText: (u) => `${u.code} ${u.name}`,
    columns: [
      { key: "code", label: "Code", width: "110px", placeholder: "—" },
      { key: "name", label: "Name", width: "minmax(0,1fr)" },
      { key: "convertedOn", label: "Converted on", width: "124px", kind: "readonly", render: (u) => (u.convertedOn ? `${u.convertedOn} item${u.convertedOn === 1 ? "" : "s"}` : <span className="text-bz-text-soft">—</span>) },
    ],
    usage: (u) => [{ label: "Items", count: Math.round(u.used / 4) }, { label: "Documents", count: u.used - Math.round(u.used / 4) }],
    picks: [
      { key: "in-use", label: "In use", value: units.filter((u) => !u.archived && u.used > 0).length, test: (u) => !u.archived && u.used > 0 },
      { key: "unused", label: "Not used", value: units.filter((u) => !u.archived && !u.used).length, test: (u) => !u.archived && !u.used },
      { key: "archived", label: "Archived", value: units.filter((u) => u.archived).length, test: (u) => !!u.archived, showZero: true },
    ],
    newLabel: "New unit",
    blank: () => ({ id: "ghost", code: "", name: "", convertedOn: 0, used: 0 }),
    addLabel: "Add a unit",
    onAdd: (r) => {
      if (!r.code.trim()) return "Enter a code.";
      if (dup(r.code)) return DUP(r.code);
      setUnits((us) => [{ ...r, id: nextId("u"), code: r.code.trim().toUpperCase() }, ...us]);
      show("success", `${r.code.trim().toUpperCase()} added`);
      return null;
    },
    onCommitRow: (id, patch) => {
      if (typeof patch.code === "string" && dup(patch.code, id)) return DUP(patch.code, id);
      const before = units;
      setUnits((us) => us.map((u) => (u.id === id ? { ...u, ...(patch as Partial<UnitRow>) } : u)));
      show("success", "Unit saved", { label: "Undo", run: () => setUnits(before) });
      return null;
    },
    rowMenu: (u, close) => (
      <>
        <MenuItem onClick={() => (setUnits((us) => us.map((x) => (x.id === u.id ? { ...x, archived: !x.archived } : x))), close(), show("success", u.archived ? "Restored" : "Archived"))}>{u.archived ? "Restore" : "Archive"}</MenuItem>
        {!u.used && (
          <MenuItem danger onClick={() => (setUnits((us) => us.filter((x) => x.id !== u.id)), close())}>
            Delete
          </MenuItem>
        )}
      </>
    ),
  };

  const refuse = (t: TaxRow, side: "sales" | "purchase") => (t[side] ? t[side] : <span className="font-medium text-bz-red">{side === "sales" ? "Invoices will refuse" : "Bills will refuse"}</span>);
  const taxKind: MasterKindConfig<TaxRow> = {
    key: "taxes",
    label: "Tax codes",
    group: "Money",
    count: taxes.length,
    tier: 2,
    noun: ["tax code", "tax codes"],
    rows: taxes,
    searchText: (t) => t.name,
    columns: [
      { key: "name", label: "Code", width: "minmax(0,1.2fr)", kind: "readonly" },
      { key: "rate", label: "Rate", width: "64px", kind: "readonly", align: "right", render: (t) => `${t.rate} %` },
      { key: "sales", label: "Sales tax account", width: "minmax(0,1fr)", kind: "readonly", render: (t) => refuse(t, "sales") },
      { key: "purchase", label: "Purchase tax account", width: "minmax(0,1fr)", kind: "readonly", render: (t) => refuse(t, "purchase") },
    ],
    usage: (t) => [{ label: "Invoices", count: t.used }],
    picks: [
      { key: "in-use", label: "In use", value: taxes.filter((t) => t.used > 0).length, test: (t) => t.used > 0 },
      { key: "missing", label: "Missing accounts", value: taxes.filter((t) => !t.sales || !t.purchase).length, test: (t) => !t.sales || !t.purchase, danger: true },
      { key: "archived", label: "Archived", value: 0, test: (t) => !!t.archived, showZero: true },
    ],
    newLabel: "New tax code",
  };

  const kinds: MasterKindConfig<any>[] = [
    unitKind,
    { key: "categories", label: "Categories", group: "Items", count: 3, legacyHref: "/design/master-record" },
    { key: "attributes", label: "Attributes", group: "Items", legacyHref: "/design/master-record" },
    { key: "currencies", label: "Currencies", group: "Money", count: 154, legacyHref: "#" },
    taxKind,
    { key: "price-levels", label: "Price levels", group: "Money", legacyHref: "/design/master-record" },
    { key: "locations", label: "Locations", group: "Organisation", count: 5, legacyHref: "#" },
    { key: "departments", label: "Departments", group: "Organisation", count: 11, legacyHref: "#" },
    { key: "classes", label: "Classes", group: "Organisation", legacyHref: "/design/master-record" },
  ];
  const tax = taxes.find((t) => t.id === openId);

  return (
    <KitBlock id="k-hub" title="Masters hub" states="grouped kinds with counts, ↗ legacy kinds · tier 3 Units: add row at the top, row edit (Enter commits the row), duplicate code refused in the row · tier 2 Tax codes: row opens the sheet (docked ≥1280) · bands · picks · search">
      <div className={cn(CARD, "h-[600px] overflow-hidden")}>
        <MastersHub
          kinds={kinds}
          active={active}
          onPick={(k) => (k.legacyHref ? show("info", `${k.label} opens its current page`) : (setActive(k.key), setOpenId(null)))}
          openId={openId}
          onOpen={setOpenId}
          sheet={({ docked }) =>
            openId === "new" ? (
              <MasterSheet docked={docked} mode="create" title="New tax code" onClose={() => setOpenId(null)} onCommit={() => (setOpenId(null), show("success", "Tax code created"))}>
                <div className="px-5 py-4 text-[12px] text-bz-text-muted">Code, rate and both accounts — WP2 builds this sheet.</div>
              </MasterSheet>
            ) : tax ? (
              <MasterSheet docked={docked} mode="edit" eyebrow="Tax code" title={tax.name} meta={[`${tax.rate} %`, `Used on ${tax.used} invoices`]} onClose={() => setOpenId(null)} onCommit={() => setOpenId(null)}>
                <Section title="Accounts" defaultOpen>
                  <CellPair label="Sales tax account" value={refuse(tax, "sales")} />
                  <CellPair label="Purchase tax account" value={refuse(tax, "purchase")} />
                </Section>
              </MasterSheet>
            ) : null
          }
        />
      </div>
    </KitBlock>
  );
}

// ── 10 · Record page ───────────────────────────────────────────────────────

type ItemForm = { name: string; code: string; sell: number; buy: number; reorder: string; desc: string };
const SAVED: ItemForm = { name: "ZZ-CLAUDE-INV2", code: "ZZ-CLAUDE-INV-2", sell: 0, buy: 0, reorder: "", desc: "" };
const LABELS: Record<keyof ItemForm, string> = { name: "Name", code: "Code / SKU", sell: "Sell price", buy: "Purchase price", reorder: "Reorder point", desc: "Description" };

function PageDemo({ show }: { show: Toast }) {
  const [saved, setSaved] = React.useState<ItemForm>(SAVED);
  const [form, setForm] = React.useState<ItemForm>(SAVED);
  const [income, setIncome] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [refusal, setRefusal] = React.useState<{ text: string; conflict?: boolean } | null>(null);
  const [archived, setArchived] = React.useState(false);
  const [adv, setAdv] = React.useState(true);
  const host = React.useRef<HTMLDivElement>(null);
  const conv = useStagedRows<Conv>([{ id: "p1", unit: "ZZ-CLAUDE-QA-Carton", factor: 12 }]);

  const keys = Object.keys(LABELS) as (keyof ItemForm)[];
  const changed = keys.filter((k) => form[k] !== saved[k]);
  const goField = (k: string) => host.current && goToField(k, host.current);
  const changes: StagedChange[] = [
    ...changed.map((k) => ({ key: k, label: LABELS[k], onGo: () => goField(k) })),
    ...(income ? [{ key: "income", label: "Income account", onGo: () => goField("income") }] : []),
    ...(conv.dirty ? [{ key: "conv", label: `${conv.count} conversion${conv.count === 1 ? "" : "s"}`, onGo: () => goField("conv") }] : []),
  ];
  const nameErr = tried && !form.name.trim() ? "A name is required." : form.name.length > 200 ? "Keep the name under 200 characters." : null;
  const codeErr = form.code !== saved.code && form.code.trim().toUpperCase() === "MPS-006" ? "Code already used by Blue Mug." : null;

  const discard = () => (setForm(saved), setIncome(null), conv.reset(), setTried(false), setRefusal(null));
  const save = (): boolean => {
    setTried(true);
    if (!form.name.trim()) {
      setRefusal({ text: "A name is required." });
      goField("name");
      return false;
    }
    if (codeErr) {
      setRefusal({ text: codeErr });
      goField("code");
      return false;
    }
    setBusy(true);
    window.setTimeout(() => {
      const before = saved;
      setSaved(form);
      conv.accept();
      setBusy(false);
      setTried(false);
      setRefusal(null);
      show("success", "Item saved", { label: "Undo", run: () => (setSaved(before), setForm(before)) }, 8000);
    }, 600);
    return true;
  };
  const guard = useUnsavedGuard({ dirty: changes.length > 0, labels: changes.map((c) => c.label), onSave: save, onDiscard: discard });
  const set = <K extends keyof ItemForm>(k: K, v: ItemForm[K]) => (setForm((f) => ({ ...f, [k]: v })), setRefusal(null));

  const sections: PageSection[] = [
    { id: "p-essentials", label: "Essentials", mark: nameErr || codeErr ? { kind: "error" } : undefined },
    { id: "p-units", label: "Units", mark: { kind: "count", n: conv.rows.length } },
    { id: "p-prices", label: "Prices" },
    { id: "p-tax", label: "Tax & accounts", mark: income ? undefined : { kind: "setup" } },
    { id: "p-stock", label: "Stock", mark: { kind: "lock" } },
    { id: "p-tracking", label: "Tracking", mark: { kind: "empty" } },
    { id: "p-history", label: "History" },
  ];
  const facts: Fact[] = [
    { key: "avail", label: "Available", value: "−7", sub: "neg", danger: true, title: "More went out than came in at WH1 East." },
    { key: "order", label: "On order", value: "—" },
    { key: "cost", label: "Unit cost", value: "820.00" },
    { key: "sell", label: "Sell", value: saved.sell ? money(saved.sell) : "—" },
    { key: "margin", label: "Margin", value: saved.sell ? `${Math.round(((saved.sell - 820) / saved.sell) * 100)}%` : "—" },
    { key: "reorder", label: "Reorder at", value: saved.reorder || "—" },
  ];
  const related = [
    <RelatedBlock key="stock" title="Stock by location">
      <div className={cn("grid grid-cols-[minmax(0,1fr)_56px_64px] gap-x-2 gap-y-1 text-[11.5px]", NUM)}>
        <span className={LABEL}>Location</span>
        <span className={cn(LABEL, "text-right")}>On hand</span>
        <span className={cn(LABEL, "text-right")}>Available</span>
        <span className="truncate">ZZ-CLAUDE-QA-WH1 East</span>
        <span className="text-right">−12</span>
        <span className="text-right font-semibold text-bz-red">−12 neg</span>
        <span className="truncate">ZZ-CLAUDE-LOC-A186</span>
        <span className="text-right">5</span>
        <span className="text-right">5</span>
      </div>
    </RelatedBlock>,
    <RelatedBlock key="open" title="Open documents">
      <span className="text-bz-text-muted">To deliver 0 · To invoice 0 · To receive 0 · On transfer 0</span>
    </RelatedBlock>,
    <RelatedBlock key="moves" title="Recent movements" right={<button type="button" className={cn(GHOST_SM, "h-7")}>All ↗</button>}>
      <div className={cn("grid grid-cols-[48px_minmax(0,1fr)_36px] gap-x-2 text-[11.5px]", NUM)}>
        <span className="text-bz-text-soft">24 Sep</span>
        <span className="truncate">DC-0052 Delivery</span>
        <span className="text-right">−3</span>
      </div>
    </RelatedBlock>,
  ];

  return (
    <KitBlock
      id="k-page"
      title="Record page"
      states="head scrolls away → slim sticky bar · facts ≤ 6 · rail scroll-spy + marks (error, ⚠ setup, count, —, 🔒) · ⌥↑/⌥↓ · dirty dots · dock with the change list · ⌘S saves inside a field · refusal / conflict · leave guard (click the rail while dirty)"
      right={
        <>
          <button type="button" className={GHOST_SM} onClick={() => setArchived((v) => !v)}>
            {archived ? "Unarchive" : "Archived band"}
          </button>
          <button type="button" className={GHOST_SM} onClick={() => (set("sell", form.sell || 250), setRefusal({ text: "Arun Rai saved this item at 14:02.", conflict: true }))}>
            Simulate conflict
          </button>
        </>
      }
    >
      <div ref={host} className={cn(CARD, "h-[680px] overflow-hidden")}>
        <RecordPage
          back={{ label: "Items", onClick: () => guard.confirm(() => show("info", "Back to the item desk")) }}
          image={<Boxes size={16} />}
          title={saved.name}
          meta={[<CopyText key="c" text={saved.code} />, "Stock item", "FIFO", "Piece"]}
          chips={
            <>
              {archived && <Chip tone="neutral" dot={false}>Archived</Chip>}
              {!income && <Chip tone="danger">Needs accounts</Chip>}
            </>
          }
          actions={
            <>
              <button type="button" className={cn(BTN, "h-8")} onClick={() => show("info", "Ask-first popover")}>
                <Receipt size={13} /> New invoice
              </button>
            </>
          }
          walk={{ position: { index: 2, total: 46 }, onPrev: () => guard.confirm(() => show("info", "Previous item")), onNext: () => guard.confirm(() => show("info", "Next item")) }}
          band={
            archived ? (
              <span className="flex items-center gap-3">
                Archived — hidden from pickers.
                <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => setArchived(false)}>
                  Restore
                </button>
              </span>
            ) : undefined
          }
          facts={<Facts facts={facts} />}
          sections={sections}
          related={related}
          dock={
            <SaveDock
              changes={changes}
              busy={busy}
              onSave={save}
              onDiscard={discard}
              refusal={refusal?.text}
              refusalAction={refusal?.conflict ? { label: "Reload", onClick: () => (setRefusal(null), show("info", "Their values loaded; your edits stay staged")) } : undefined}
              onDismissRefusal={() => setRefusal(null)}
            />
          }
        >
          <RecordSection id="p-essentials" title="Essentials">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PageField label="Name" fieldKey="name" required dirty={form.name !== saved.name} error={nameErr} className="sm:col-span-2">
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className={cn(INPUT, nameErr && "border-bz-red-mark")} />
              </PageField>
              <PageField label="Code / SKU" fieldKey="code" dirty={form.code !== saved.code} error={codeErr} hint="Try MPS-006">
                <input value={form.code} onChange={(e) => set("code", e.target.value)} className={cn(INPUT, codeErr && "border-bz-red-mark")} />
              </PageField>
              <PageField label="Type">
                <Lock>Stock item</Lock>
              </PageField>
              <PageField label="Description" fieldKey="desc" dirty={form.desc !== saved.desc} className="sm:col-span-2">
                <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={2} className={cn(INPUT, "h-auto min-h-[64px] resize-y py-2 leading-relaxed")} />
              </PageField>
            </div>
          </RecordSection>
          <RecordSection id="p-units" title="Units & conversions">
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PageField label="Base unit">
                <Lock>Piece</Lock>
              </PageField>
            </div>
            <div data-field="conv">
              <Grid<Conv>
                ariaLabel="Unit conversions"
                columns={[
                  { key: "unit", label: "Unit", width: "minmax(0,1fr)", kind: "select", options: UNIT_OPTS, placeholder: "Choose…" },
                  { key: "factor", label: "= N Piece", width: "104px", kind: "number" },
                  { key: "example", label: "Example", width: "minmax(0,1fr)", kind: "readonly", render: (r) => (r.unit && r.factor ? <span className="text-bz-text-muted">3 {r.unit} = {(3 * r.factor).toLocaleString("en-US")} Piece</span> : "") },
                ]}
                {...conv.gridProps}
                ghost={{ blank: () => ({ id: "ghost", unit: null, factor: null }), label: "Add a unit", onAdd: (r) => (!r.unit ? "Choose a unit." : !(r.factor !== null && r.factor > 0) ? "Enter a number above 0." : (conv.add({ ...r, id: nextId("p") }), null)) }}
                empty="No conversions yet."
                stickyTop={56}
              />
              <p className="m-0 mt-2 text-[11px] text-bz-text-soft">A document in a unit with no conversion moves stock 1:1.</p>
            </div>
          </RecordSection>
          <RecordSection id="p-prices" title="Prices">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PageField label="Sell price" fieldKey="sell" dirty={form.sell !== saved.sell}>
                <AmountInput ariaLabel="Sell price" value={form.sell} onChange={(n) => set("sell", n)} className="h-9" />
              </PageField>
              <PageField label="Purchase price" fieldKey="buy" dirty={form.buy !== saved.buy} hint={form.sell && form.buy > form.sell ? "Below purchase price." : undefined}>
                <AmountInput ariaLabel="Purchase price" value={form.buy} onChange={(n) => set("buy", n)} className="h-9" />
              </PageField>
            </div>
          </RecordSection>
          <RecordSection id="p-tax" title="Tax & accounts">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PageField label="Income account" fieldKey="income" dirty={income !== null}>
                {income ? (
                  <span className="flex min-h-9 items-center gap-2 text-[12.5px]">
                    {income} <Source kind="inherited" from="from Preference Setup" />
                  </span>
                ) : (
                  <div className="flex min-h-9 items-center">
                    <Source kind="missing" useDefault={{ label: "Sales Revenue", onUse: () => setIncome("Sales Revenue") }} />
                  </div>
                )}
              </PageField>
              <PageField label="COGS account" aside={<Source kind="inherited" from="from template" />}>
                <span className="flex min-h-9 items-center text-[12.5px] text-bz-text-soft">Cost of Sales</span>
              </PageField>
            </div>
          </RecordSection>
          <RecordSection id="p-stock" title="Stock & reordering" collapsible collapsed={!adv} onToggle={(c) => setAdv(!c)}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PageField label="Costing method">
                <Lock>FIFO</Lock>
              </PageField>
              <PageField label="Reorder point" fieldKey="reorder" dirty={form.reorder !== saved.reorder} hint="For all locations">
                <input inputMode="decimal" value={form.reorder} onChange={(e) => set("reorder", e.target.value.replace(/[^\d.]/g, ""))} className={cn(INPUT_SM, "h-9 text-right", NUM)} />
              </PageField>
            </div>
          </RecordSection>
          <RecordSection id="p-tracking" title="Tracking">
            <p className="m-0 text-[12px] text-bz-text-soft">No serial numbers or batches.</p>
          </RecordSection>
          <RecordSection id="p-history" title="History">
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[11.5px] text-bz-text-muted">
              <li>
                <span className="font-medium text-bz-text">Arun Rai</span> changed Sell price 0 → 250 · 2h
              </li>
              <li>
                <span className="font-medium text-bz-text">Yepa Sherpa</span> created the item · 12 Sep
              </li>
            </ul>
          </RecordSection>
        </RecordPage>
      </div>
      {guard.dialog}
    </KitBlock>
  );
}
