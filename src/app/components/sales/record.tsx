import * as React from "react";
import { useNavigate } from "react-router";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, Minimize2, MoreHorizontal, Printer, X } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, ICON_BTN, LABEL, NUM, Popover, Segmented, ToastMsg } from "./bzw";
import { Amount, AuditRow, Attachment, Comment, HistoryEvent, Order, OrderLine, TAX_LABEL, fmtQty, itemById, lineDiscount, lineGross, lineNet, lineTax, personById, totalsOf } from "./orders";
import { DIMENSIONS, LINE_FIELDS, subsidiaryById, tdsById } from "./master";
import { Cell, CellGrid, Dual, FilesSection, GLRow, GLSection, RelatedSection, SystemSection, customFieldCells } from "./parts";
import { hrefFor, relatedFor, useSales } from "./flow";
import { PrintPreview } from "./print";

// ════════════════════════════════════════════════════════════════════════════
// RECORD — the one panel every sales document opens in
//
// The order panel set the grammar; every other document reuses it so a reader
// who has learned one record has learned all six:
//
//   head      number · status · walk · print · full page · ⋯ · close
//             who and how much on one line, the facts that matter beneath
//   next step what the document is waiting for, and the one button that does it
//   blocks    lines + totals, then the details grid — one scroll, no tabs
//   sections  Related records · Files · GL impact · System information, each a
//             quiet collapsed line until it is wanted
//   activity  notes and history, with the note composer as the panel's foot
// ════════════════════════════════════════════════════════════════════════════

export type ShellCtx = {
  docked: boolean;
  full: boolean;
  position: { index: number; total: number } | null;
  onPrev: () => void;
  onNext: () => void;
  onToggleFull: () => void;
  onClose: () => void;
  show: (kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"], duration?: number) => void;
};

export function RecordShell({
  ctx,
  no,
  chips,
  title,
  amount,
  meta,
  menu,
  back,
  printNo,
  children,
  foot,
}: {
  ctx: ShellCtx;
  no: string;
  chips?: React.ReactNode;
  title: React.ReactNode;
  amount?: React.ReactNode;
  meta?: React.ReactNode[];
  menu?: (close: () => void) => React.ReactNode;
  back?: { label: string; onClick: () => void };
  /** The record to print; the print button, ⌘P and the preview come with it. */
  printNo?: string;
  children: React.ReactNode;
  foot?: React.ReactNode;
}) {
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [printing, setPrinting] = React.useState(false);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [no]);
  React.useEffect(() => {
    if (!printNo || back) return;
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPrinting(true);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [printNo, back]);

  return (
    <section className={cn("flex h-full min-h-0 flex-col bg-bz-surface", ctx.docked && !ctx.full && "border-l border-bz-line", !ctx.docked && "shadow-[var(--bz-shadow-panel)]")}>
      <header className="shrink-0 border-b border-bz-line-soft px-5 pb-3.5 pt-3">
        <div className="flex items-center gap-2">
          {back ? (
            <button type="button" onClick={back.onClick} className="-ml-1.5 inline-flex h-7 items-center gap-1 rounded-bz-md px-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
              <ArrowLeft size={13} /> {back.label}
            </button>
          ) : (
            <span className={cn("whitespace-nowrap text-[11px] font-semibold text-bz-text-soft", NUM)}>{no}</span>
          )}
          {!back && <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">{chips}</span>}
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {ctx.position && !back && (
              <>
                <span className={cn("mr-1 hidden text-[10.5px] text-bz-text-soft sm:inline", NUM)}>
                  {ctx.position.index + 1} / {ctx.position.total}
                </span>
                <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={ctx.onPrev} title="Previous (K)">
                  <ChevronLeft size={15} />
                </button>
                <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={ctx.onNext} title="Next (J)">
                  <ChevronRight size={15} />
                </button>
              </>
            )}
            {printNo && !back && (
              <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={() => setPrinting(true)} title="Print (⌘P)">
                <Printer size={14} />
              </button>
            )}
            {ctx.docked && (
              <button type="button" className={cn(ICON_BTN, "hidden md:inline-flex")} onClick={ctx.onToggleFull} title={ctx.full ? "Back beside the list" : "Full page"}>
                {ctx.full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
            {menu && !back && (
              <button ref={moreRef} type="button" className={ICON_BTN} onClick={() => setMoreOpen(true)} title="More">
                <MoreHorizontal size={15} />
              </button>
            )}
            <button type="button" className={ICON_BTN} onClick={ctx.onClose} title="Close (Esc)">
              <X size={15} />
            </button>
          </div>
        </div>
        {menu && (
          <Popover open={moreOpen} anchor={moreRef.current} onClose={() => setMoreOpen(false)} align="right" width={240}>
            {menu(() => setMoreOpen(false))}
          </Popover>
        )}
        <div className="mt-2 flex items-start gap-3">
          <h2 className="m-0 min-w-0 flex-1 text-[17px] font-semibold leading-snug tracking-tight text-bz-text">{title}</h2>
          {amount && <div className="shrink-0 text-right text-[17px] font-semibold tracking-tight text-bz-text">{amount}</div>}
        </div>
        {meta && meta.filter(Boolean).length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted">
            {meta.filter(Boolean).map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span aria-hidden className="size-[3px] rounded-bz-pill bg-bz-line" />}
                {m}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>
      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        {children}
      </div>
      {foot}
      {printNo && <PrintPreview no={printNo} open={printing} onClose={() => setPrinting(false)} onToast={(t) => ctx.show("success", t)} />}
    </section>
  );
}

/** A customer name that opens the customer's 360 — the app's customer record. */
export function CustomerTitle({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group inline text-left hover:underline hover:underline-offset-4" title="Open customer">
      {name}
      <ArrowUpRight size={13} className="ml-1 inline align-[-1px] text-bz-text-soft opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

/** What this document is waiting for, and the one button that does it. */
export function StepCard({
  icon,
  title,
  sub,
  actions,
  tone = "plain",
  children,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: "plain" | "quiet" | "danger" | "done";
  children?: React.ReactNode;
}) {
  return (
    <div className="px-5 pt-4">
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-bz-lg border px-3.5 py-3",
          tone === "danger" ? "border-transparent bg-bz-red-soft" : tone === "plain" ? "border-bz-line bg-bz-paper" : "border-bz-line-soft bg-bz-paper",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-bz-md",
            tone === "danger" ? "bg-bz-surface/60 text-bz-red" : tone === "done" ? "bg-bz-fire/20 text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("m-0 text-[12.5px] font-semibold", tone === "danger" ? "text-bz-red" : "text-bz-text")}>{title}</p>
          {sub && <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{sub}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        {children && <div className="w-full">{children}</div>}
      </div>
    </div>
  );
}

export function Block({ title, count, right, children }: { title: string; count?: number; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-bz-line-soft px-5 py-4">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h3>
        {count !== undefined && <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{count}</span>}
        {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
      </div>
      {children}
    </section>
  );
}

// ── Lines ───────────────────────────────────────────────────────────────────

/**
 * Lines of any document. The row carries what is scanned — item, quantity in
 * its unit, rate, discount, net; a click opens the rest of the line (price
 * level, gross, tax code and amount, HS code, description, the tenant's line
 * fields) instead of widening the table past the panel.
 */
export function LinesTable({
  rows,
  qtyLabel = "Qty",
}: {
  rows: { line: OrderLine; qty: number; sub?: React.ReactNode; detail?: React.ReactNode }[];
  qtyLabel?: string;
}) {
  const [open, setOpen] = React.useState<number | null>(null);
  const cols = "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_76px_96px_64px_112px]";
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
      <div className={cn("hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", cols, LABEL)}>
        <span className="pl-[17px]">Item</span>
        <span className="text-right">{qtyLabel}</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Disc</span>
        <span className="text-right">Net</span>
      </div>
      {rows.map(({ line, qty, sub, detail }, i) => {
        const it = itemById(line.itemId)!;
        const scaled = { ...line, qty, discountAmt: line.discountAmt ? (line.discountAmt * qty) / line.qty : undefined };
        const isOpen = open === i;
        const unit = line.unit ?? it.unit;
        return (
          <div key={`${line.id}-${i}`} className="border-b border-bz-line-soft last:border-0">
            <button type="button" onClick={() => setOpen(isOpen ? null : i)} className={cn("grid w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-bz-paper-warm", cols, isOpen && "bg-bz-paper-warm")}>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <ChevronRight size={11} className={cn("shrink-0 text-bz-text-soft transition-transform", isOpen && "rotate-90")} />
                  <span className="truncate text-[12.5px] text-bz-text">{it.name}</span>
                </span>
                <span className={cn("ml-[17px] block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                  {it.code}
                  {line.tax !== "VAT13" && ` · ${TAX_LABEL[line.tax]}`}
                  {sub && <> · {sub}</>}
                </span>
              </span>
              <span className={cn("hidden text-right text-[12.5px] text-bz-text sm:block", NUM)}>
                {fmtQty(qty)} <span className="text-[10.5px] text-bz-text-soft">{unit}</span>
              </span>
              <span className="hidden text-right text-[12.5px] text-bz-text sm:block">
                <Amount value={line.rate} />
              </span>
              <span className={cn("hidden text-right text-[12px] sm:block", NUM, lineDiscount(scaled) ? "text-bz-text" : "text-bz-text-soft")}>
                {line.discountAmt ? <Amount value={lineDiscount(scaled)} /> : line.discountPct ? `${line.discountPct}%` : "—"}
              </span>
              <span className="text-right text-[12.5px] font-semibold text-bz-text">
                <Amount value={lineGross(scaled)} />
                <span className={cn("block text-[10.5px] font-normal text-bz-text-soft sm:hidden", NUM)}>
                  {fmtQty(qty)} {unit} × <Amount value={line.rate} className="text-bz-text-soft" />
                </span>
              </span>
            </button>
            {detail && <div className="px-3 pb-2 pl-[29px]">{detail}</div>}
            {isOpen && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 bg-bz-paper px-3 pb-3 pl-[29px] pt-2 text-[11.5px] sm:grid-cols-4">
                <KV label="Unit" value={unit === it.unit ? unit : `${unit} (${fmtQty(it.units?.find((u) => u.code === unit)?.factor ?? 1)} ${it.unit})`} />
                <KV label="Price level" value={line.priceLevel ?? "Custom rate"} />
                <KV label="Gross" value={<Amount value={qty * line.rate} />} />
                <KV label="Discount" value={lineDiscount(scaled) ? <><Amount value={lineDiscount(scaled)} />{line.discountPct ? <span className="text-bz-text-soft"> ({line.discountPct}%)</span> : null}</> : "—"} />
                <KV label="Tax code" value={TAX_LABEL[line.tax]} />
                <KV label="Tax amount" value={<Amount value={lineTax(scaled)} />} />
                <KV label="Net with tax" value={<Amount value={lineNet(scaled)} />} />
                <KV label="HS code" value={<span className={NUM}>{it.hs}</span>} />
                {LINE_FIELDS.map((f) => (
                  <KV key={f.key} label={f.label} value={line.custom?.[f.key] || <span className="text-bz-text-soft">—</span>} />
                ))}
                {line.description && <KV label="Description" value={line.description} className="col-span-full" />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function KV({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn(LABEL, "m-0 mb-0.5")}>{label}</p>
      <p className="m-0 truncate text-bz-text">{value}</p>
    </div>
  );
}

// ── Money ───────────────────────────────────────────────────────────────────

type MoneyRow = { label: React.ReactNode; value: React.ReactNode; strong?: boolean; danger?: boolean; soft?: boolean };

/** Label / figure pairs, right-aligned; a `strong` row carries a rule above it. */
export function MoneyList({ rows, className }: { rows: MoneyRow[]; className?: string }) {
  return (
    <dl className={cn("ml-auto mt-3 grid w-full max-w-[340px] grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-[12px]", className)}>
      {rows.map((r, i) => (
        <React.Fragment key={i}>
          <dt className={cn(r.strong ? "mt-1 border-t border-bz-line-soft pt-2 text-[12.5px] font-semibold text-bz-text" : r.soft ? "text-bz-text-soft" : "text-bz-text-muted")}>{r.label}</dt>
          <dd className={cn("m-0 text-right", r.strong ? "mt-1 border-t border-bz-line-soft pt-2 text-[13px] font-semibold" : "", r.danger ? "font-semibold text-bz-red" : r.soft ? "text-bz-text-soft" : "text-bz-text")}>{r.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/** The totals every priced document shows: per tax code, bill discount, TDS, and the NPR figure for a foreign currency. */
export function totalsRows(t: ReturnType<typeof totalsOf>, o: { currency: string; exchangeRate: number; tdsCode?: string | null; totalLabel?: string }): MoneyRow[] {
  return [
    { label: "Subtotal", value: <Amount value={t.subtotal} /> },
    ...(t.discount > 0 ? [{ label: "Line discounts", value: <>−<Amount value={t.discount} /></> }] : []),
    ...(t.bill > 0 ? [{ label: "Bill discount", value: <>−<Amount value={t.bill} /></> }] : []),
    ...t.byTax.map((x) => ({
      label: <>{x.label} <span className="text-bz-text-soft">on <Amount value={x.base} className="text-bz-text-soft" /></span></>,
      value: <Amount value={x.tax} />,
    })),
    { label: o.totalLabel ?? "Total", value: <Amount value={t.total} currency={o.currency} />, strong: true },
    ...(o.currency !== "NPR" ? [{ label: <>at {o.exchangeRate}</>, value: <>≈ <Amount value={t.total * o.exchangeRate} currency="NPR" /></>, soft: true }] : []),
    ...(t.tds > 0 ? [{ label: `TDS · ${tdsById(o.tdsCode)?.name ?? ""}`, value: <>−<Amount value={t.tds} /></> }, { label: "Receivable", value: <Amount value={t.receivable} currency={o.currency} /> }] : []),
  ];
}

// ── Details ─────────────────────────────────────────────────────────────────

/**
 * The header facts every document shares, in one grid: subsidiary, dates (AD
 * with BS), currency and rate, the tenant's custom fields, classification and
 * memo. `lead` cells go first — whatever is particular to the document.
 */
export function DetailsBlock({
  lead,
  subsidiaryId,
  dates,
  currency,
  exchangeRate,
  custom,
  dims,
  memo,
  right,
}: {
  lead?: React.ReactNode;
  subsidiaryId: string;
  dates: [string, string | null | undefined][];
  currency?: string;
  exchangeRate?: number;
  custom?: Record<string, string>;
  dims?: Order["dims"];
  memo?: string;
  right?: React.ReactNode;
}) {
  const sub = subsidiaryById(subsidiaryId);
  const setDims = DIMENSIONS.filter((d) => dims?.[d.key]);
  return (
    <Block title="Details" right={right}>
      <CellGrid>
        {lead}
        <Cell label="Subsidiary">
          {sub.name}
          <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>PAN {sub.pan}</span>
        </Cell>
        {currency && (
          <Cell label="Currency">
            {currency}
            {currency !== "NPR" && <span className={cn("ml-1 text-bz-text-soft", NUM)}>@ {exchangeRate}</span>}
          </Cell>
        )}
        {dates.map(([label, iso]) => (
          <Cell key={label} label={label}>
            <Dual iso={iso} />
          </Cell>
        ))}
        {custom && customFieldCells(custom)}
        {setDims.map((d) => (
          <Cell key={d.key} label={d.label}>
            {dims![d.key]}
          </Cell>
        ))}
        {memo && (
          <Cell label="Memo" wide>
            <span className="whitespace-pre-wrap leading-relaxed">{memo}</span>
          </Cell>
        )}
      </CellGrid>
    </Block>
  );
}

// ── Sections at the foot ────────────────────────────────────────────────────

export function RecordSections({
  no,
  files,
  onAttach,
  onToast,
  created,
  history,
  audit,
  gl,
}: {
  no: string;
  files: Attachment[];
  onAttach: () => void;
  onToast: (t: string) => void;
  created: { byId: string; on: string };
  history: HistoryEvent[];
  audit: AuditRow[];
  /** Omitted for documents that never post (orders, estimates). */
  gl?: GLRow[];
}) {
  const data = useSales();
  const navigate = useNavigate();
  const related = React.useMemo(() => relatedFor(no, data), [no, data]);
  return (
    <div className="border-b border-bz-line-soft">
      <RelatedSection rows={related} onOpen={(n) => (n.startsWith("OPP-") ? onToast(`${n} opens in CRM`) : navigate(hrefFor(n)))} />
      <FilesSection files={files} onAdd={onAttach} onToast={onToast} />
      {gl && <GLSection rows={gl} />}
      <SystemSection created={created} history={history} audit={audit} />
    </div>
  );
}

// ── Activity ────────────────────────────────────────────────────────────────

const MONTH: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const whenKey = (w: string) => {
  const m = /^(\w{3}) (\d+), (\d+):(\d+)/.exec(w);
  if (!m) return 99_99_99_99;
  return MONTH[m[1]] * 1_000_000 + Number(m[2]) * 10_000 + Number(m[3]) * 100 + Number(m[4]);
};

/** Notes (with their title and direction, when they have one) and history, interleaved by time. */
export function ActivityList({ comments, history }: { comments: Comment[]; history: HistoryEvent[] }) {
  const [show, setShow] = React.useState<"all" | "notes" | "history">("all");
  const items = [
    ...comments.map((c) => ({ kind: "c" as const, key: c.id, when: c.when, who: c.authorId, body: c.body, title: c.title, direction: c.direction })),
    ...history.map((h) => ({ kind: "h" as const, key: h.id, when: h.when, who: h.whoId, body: h.what, title: undefined, direction: undefined })),
  ]
    .filter((x) => show === "all" || (show === "notes" ? x.kind === "c" : x.kind === "h"))
    .sort((a, b) => whenKey(a.when) - whenKey(b.when));
  return (
    <section className="px-5 py-4">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">Activity</h3>
        <div className="ml-auto">
          <Segmented
            size="sm"
            value={show}
            onChange={setShow}
            options={[
              { value: "all", label: "All" },
              { value: "notes", label: "Notes", count: comments.length },
              { value: "history", label: "History" },
            ]}
          />
        </div>
      </div>
      {items.length === 0 && <p className="m-0 text-[11.5px] text-bz-text-soft">{show === "notes" ? "No notes yet." : "Nothing yet."}</p>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((x) =>
          x.kind === "c" ? (
            <li key={x.key} className="flex gap-2.5">
              <Avatar person={personById(x.who)} size={22} />
              <div className="min-w-0 flex-1">
                <p className="m-0 flex flex-wrap items-center gap-x-2 text-[11.5px]">
                  <span className="font-semibold text-bz-text">{personById(x.who)?.name}</span>
                  {x.direction && (
                    <span className="inline-flex items-center gap-0.5 text-[10.5px] text-bz-text-muted" title={x.direction === "Inbound" ? "From the customer" : "To the customer"}>
                      {x.direction === "Inbound" ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />} {x.direction}
                    </span>
                  )}
                  <span className={cn("text-bz-text-soft", NUM)}>{x.when}</span>
                </p>
                {x.title && <p className="m-0 mt-0.5 text-[12px] font-semibold text-bz-text">{x.title}</p>}
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed text-bz-text">{x.body}</p>
              </div>
            </li>
          ) : (
            <li key={x.key} className="flex items-center gap-2.5 pl-[7px] text-[11.5px] text-bz-text-muted">
              <span className="size-2 shrink-0 rounded-bz-pill border border-bz-line bg-bz-surface" />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-bz-text">{personById(x.who)?.name}</span> {x.body}
              </span>
              <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{x.when}</span>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}
