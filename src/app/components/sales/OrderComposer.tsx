import * as React from "react";
import { ChevronDown, ChevronRight, Lock, Paperclip, Plus, Repeat2, Search, X, CircleCheck, CircleAlert } from "lucide-react";
import { cn } from "../ui/utils";
import {
  Amount,
  CUSTOMERS,
  Customer,
  ITEMS,
  LOCATIONS,
  ME,
  Order,
  OrderLine,
  PEOPLE,
  TAX_LABEL,
  TERMS,
  TODAY,
  TaxCode,
  addDays,
  customerById,
  fmtQty,
  fmtShort,
  itemById,
  lastOrderFor,
  lineNet,
  locationById,
  openOrdersFor,
  personById,
  termById,
  totalsOf,
} from "./orders";
import { Avatar, BTN, DocLink, GHOST, GHOST_SM, ICON_BTN, INPUT, Kbd, LABEL, NUM, PANEL, Portal, Refusal, Select, TEXTAREA } from "./bzw";

// ════════════════════════════════════════════════════════════════════════════
// ORDER COMPOSER — create, edit and copy are ONE surface
//
// Today there are four near-identical forms (create · update · copy · from
// estimate), ~95% the same template and already disagreeing with each other.
// Here there is one, and what differs is only its SEED and its LOCKS.
//
// It is written like a document, top to bottom, in the order an order is
// actually taken: who it is for → what they want → the terms, which are all
// defaulted from the customer and so cost no clicks unless they change.
//
//   • KEYBOARD FIRST. Type an item → Enter → quantity → Enter → the next line.
//     There is always one empty line waiting, so there is no "Add item" button
//     to find, and nothing is blocked "until every row is valid".
//   • THE STOCK IS IN THE PICKER. On-hand at the chosen warehouse sits beside
//     each item, so a short order is caught while it is being written.
//   • NEVER A DISABLED SAVE. Save refuses and NAMES what is missing, and jumps
//     to it — the app's one commit rule.
//   • A NEW ORDER IS A DRAFT UNTIL IT IS CREATED. It keeps itself (per user,
//     through USER_STATE — no new table) so closing the panel loses nothing
//     and consumes no document number.
//   • EDIT KNOWS WHAT HAS HAPPENED. A delivered line cannot drop below what
//     left the warehouse or be removed; the customer is fixed once anything
//     has been delivered or invoiced; and saving says when it will send the
//     order back for approval — before, not after.
// ════════════════════════════════════════════════════════════════════════════

type Draft = {
  key: string;
  lineId?: string;
  itemId: string | null;
  qty: number;
  rate: number;
  discountPct: number;
  tax: TaxCode;
  description: string;
  delivered: number;
  invoiced: number;
};

let keySeq = 0;
const blank = (): Draft => ({ key: `k${++keySeq}`, itemId: null, qty: 1, rate: 0, discountPct: 0, tax: "VAT13", description: "", delivered: 0, invoiced: 0 });
const fromLine = (l: OrderLine, keepProgress: boolean): Draft => ({
  key: `k${++keySeq}`,
  lineId: keepProgress ? l.id : undefined,
  itemId: l.itemId,
  qty: l.qty,
  rate: l.rate,
  discountPct: l.discountPct,
  tax: l.tax,
  description: l.description ?? "",
  delivered: keepProgress ? l.delivered : 0,
  invoiced: keepProgress ? l.invoiced : 0,
});

const DEPARTMENTS = ["Enterprise sales", "Industrial", "Retail", "Export"];
const CLASSES = ["Capital goods", "Consumables", "Services"];
const PROJECTS = ["NTC Branch Wi-Fi", "Everest Retail — ERP Rollout", "Pokhara Warehouse Fit-out"];
const PARTNERS = ["Himal Logistics", "Sagarmatha Distributors"];

export type ComposerMode =
  | { kind: "new" }
  | { kind: "edit"; order: Order }
  | { kind: "copy"; from: Order; source?: { kind: "Estimate" | "Sales order"; no: string } };

export function OrderComposer({
  mode,
  noun = "order",
  orders,
  onCancel,
  onSave,
}: {
  mode: ComposerMode;
  /** An estimate is written in the same composer — only its words differ. */
  noun?: "order" | "estimate";
  orders: Order[];
  onCancel: (draftKept: boolean) => void;
  onSave: (o: Omit<Order, "id" | "no"> & { id?: string; no?: string }) => void;
}) {
  const base = mode.kind === "edit" ? mode.order : mode.kind === "copy" ? mode.from : null;
  const editing = mode.kind === "edit" ? mode.order : null;
  const hasProgress = !!editing && editing.lines.some((l) => l.delivered > 0 || l.invoiced > 0);

  const [customerId, setCustomerId] = React.useState<string | null>(base?.customerId ?? null);
  const [locationId, setLocationId] = React.useState(base?.locationId ?? "L-KTM");
  const [expected, setExpected] = React.useState<string>(editing?.expected ?? addDays(TODAY, 7));
  const [termId, setTermId] = React.useState(base?.termId ?? "T30");
  const [repId, setRepId] = React.useState<string | null>(base?.repId ?? ME.id);
  const [customerPo, setCustomerPo] = React.useState(editing?.customerPo ?? "");
  const [memo, setMemo] = React.useState(base?.memo ?? "");
  const [dims, setDims] = React.useState<Order["dims"]>(base?.dims ?? {});
  const [files, setFiles] = React.useState(editing?.attachments ?? []);
  const [lines, setLines] = React.useState<Draft[]>(() => [...(base?.lines.map((l) => fromLine(l, !!editing)) ?? []), blank()]);
  const [moreOpen, setMoreOpen] = React.useState(!!base && (Object.values(base.dims).some(Boolean) || !!base.memo));
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);
  const [saved, setSaved] = React.useState<"idle" | "saving" | "saved">("idle");
  const dirty = React.useRef(false);

  const customer = customerById(customerId);
  const itemRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const qtyRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const customerRef = React.useRef<HTMLInputElement>(null);

  // The draft keeps itself — shown, never asked for.
  React.useEffect(() => {
    if (mode.kind !== "new" || !dirty.current) return;
    setSaved("saving");
    const id = window.setTimeout(() => setSaved("saved"), 700);
    return () => window.clearTimeout(id);
  }, [mode.kind, customerId, lines, expected, termId, repId, customerPo, memo, dims, locationId]);

  const touch = () => (dirty.current = true);

  const pickCustomer = (c: Customer) => {
    touch();
    setCustomerId(c.id);
    setTermId(c.termId);
    window.setTimeout(() => itemRefs.current[lines[0]?.key]?.focus(), 0);
  };

  const patch = (key: string, p: Partial<Draft>) => {
    touch();
    setLines((ls) => {
      const next = ls.map((l) => (l.key === key ? { ...l, ...p } : l));
      // There is always exactly one empty line waiting at the foot.
      if (next[next.length - 1].itemId) next.push(blank());
      return next;
    });
  };

  const removeLine = (key: string) => {
    touch();
    setLines((ls) => {
      const next = ls.filter((l) => l.key !== key);
      return next.length && !next[next.length - 1].itemId ? next : [...next, blank()];
    });
  };

  const repeatLast = () => {
    if (!customer) return;
    const last = lastOrderFor(orders, customer.id, editing?.id);
    if (!last) return;
    touch();
    setLines([...last.lines.map((l) => fromLine(l, false)), blank()]);
  };

  const filled = lines.filter((l) => l.itemId);
  const totals = totalsOf(filled);

  // What stands between this and a saved order — computed, named, jumpable.
  const missing: { label: string; focus: () => void }[] = [];
  if (!customer) missing.push({ label: "a customer", focus: () => customerRef.current?.focus() });
  if (filled.length === 0) missing.push({ label: "at least one line", focus: () => itemRefs.current[lines[0].key]?.focus() });
  filled.forEach((l, i) => {
    if (!(l.qty > 0)) missing.push({ label: `a quantity on line ${i + 1}`, focus: () => qtyRefs.current[l.key]?.focus() });
    if (l.qty < l.delivered) missing.push({ label: `line ${i + 1} can't go below the ${fmtQty(l.delivered)} delivered`, focus: () => qtyRefs.current[l.key]?.focus() });
  });

  const reapproval =
    !!editing &&
    editing.approval.state === "approved" &&
    (totals.total > totalsOf(editing.lines).total + 0.005 || filled.some((l) => l.discountPct > (editing.lines.find((x) => x.id === l.lineId)?.discountPct ?? 0)));

  const save = () => {
    setTried(true);
    if (missing.length) {
      setRefusal(`Add ${missing.map((m) => m.label).join(", ")}.`);
      missing[0].focus();
      return;
    }
    onSave({
      id: editing?.id,
      no: editing?.no,
      customerId: customer!.id,
      date: editing?.date ?? TODAY,
      expected: expected || null,
      locationId,
      repId,
      termId,
      customerPo: customerPo.trim() || null,
      currency: customer!.currency,
      exchangeRate: customer!.currency === "USD" ? 133.42 : 1,
      memo,
      source: editing?.source ?? (mode.kind === "copy" ? mode.source ?? { kind: "Sales order", no: mode.from.no } : null),
      approval: editing?.approval ?? { state: "none" },
      closed: false,
      cancelled: null,
      lines: filled.map((l, i) => ({
        id: l.lineId ?? `LN-N${Date.now()}-${i}`,
        itemId: l.itemId!,
        qty: l.qty,
        rate: l.rate,
        discountPct: l.discountPct,
        tax: l.tax,
        description: l.description || undefined,
        delivered: l.delivered,
        invoiced: l.invoiced,
      })),
      docs: editing?.docs ?? [],
      dims,
      attachments: files,
      comments: editing?.comments ?? [],
      history: editing?.history ?? [],
      advance: editing?.advance ?? 0,
    });
  };

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "Enter" || e.key.toLowerCase() === "s")) {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  const last = customer ? lastOrderFor(orders, customer.id, editing?.id) : undefined;

  return (
    <section className="flex h-full min-h-0 flex-col bg-bz-surface" aria-label="Order composer">
      {/* ── Head ───────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center gap-2 border-b border-bz-line-soft px-5 py-3">
        <span className="text-[11px] font-semibold text-bz-text-soft">{editing ? editing.no : noun === "estimate" ? "New estimate" : "New sales order"}</span>
        {mode.kind === "copy" && <DocLink no={mode.source?.no ?? mode.from.no} kind={mode.source?.kind === "Estimate" ? "From estimate · what isn't ordered yet" : "Copied from"} />}
        {mode.kind === "new" && saved !== "idle" && (
          <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-soft">
            <CircleCheck size={11} className={saved === "saved" ? "text-bz-pos-deep" : "text-bz-text-soft"} />
            {saved === "saving" ? "Saving draft…" : "Draft saved"}
          </span>
        )}
        <button type="button" className={cn(ICON_BTN, "ml-auto")} onClick={() => onCancel(mode.kind === "new" && dirty.current)} title="Close (Esc)">
          <X size={15} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="mx-auto w-full max-w-[1040px] px-5 pb-10 pt-5">
          {/* ── 1 · Who ──────────────────────────────────────────────── */}
          {customer ? (
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className={cn(LABEL, "m-0 mb-1")}>Order for</p>
                <div className="flex items-center gap-2">
                  <h2 className="m-0 truncate text-[20px] font-semibold tracking-tight text-bz-text">{customer.name}</h2>
                  {hasProgress ? (
                    <span title="Something has been delivered or invoiced, so the customer is fixed" className="text-bz-text-soft">
                      <Lock size={13} />
                    </span>
                  ) : (
                    <button type="button" className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => (touch(), setCustomerId(null))}>
                      Change
                    </button>
                  )}
                </div>
                <p className={cn("m-0 mt-0.5 text-[11.5px] text-bz-text-muted", NUM)}>
                  {customer.code} · PAN {customer.pan} · {customer.address} · {customer.priceLevel} prices
                  {openOrdersFor(orders, customer.id) > 0 && ` · ${openOrdersFor(orders, customer.id)} open order${openOrdersFor(orders, customer.id) === 1 ? "" : "s"}`}
                </p>
              </div>
              {last && mode.kind === "new" && (
                <button type="button" className={GHOST_SM} onClick={repeatLast} title={`Replaces the lines with ${last.no}'s`}>
                  <Repeat2 size={12} /> Repeat {last.no} · {fmtShort(last.date)}
                </button>
              )}
            </div>
          ) : (
            <CustomerPicker inputRef={customerRef} orders={orders} onPick={pickCustomer} invalid={tried} />
          )}

          {/* ── 2 · Terms, as one line ───────────────────────────────── */}
          <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 border-y border-bz-line-soft py-2.5 text-[12px] text-bz-text-muted">
            <TermChip label="Deliver from">
              <Select trigger="plain" value={locationId} onChange={(v) => (touch(), setLocationId(v))} width={220} options={LOCATIONS.map((l) => ({ value: l.id, label: l.name }))}>
                <ChipFace>{locationById(locationId)?.name}</ChipFace>
              </Select>
            </TermChip>
            <TermChip label="by">
              <label className="relative inline-flex h-7 items-center rounded-bz-sm px-1.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
                <span className={NUM}>{expected ? fmtShort(expected) : "no date"}</span>
                <input type="date" value={expected} min={TODAY} onChange={(e) => (touch(), setExpected(e.target.value))} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Expected delivery" />
              </label>
            </TermChip>
            <Sep />
            <TermChip label="Term">
              <Select trigger="plain" value={termId} onChange={(v) => (touch(), setTermId(v))} width={200} options={TERMS.map((t) => ({ value: t.id, label: t.name, hint: t.id === customer?.termId ? "Customer's default" : undefined }))}>
                <ChipFace>{termById(termId)?.name}</ChipFace>
              </Select>
            </TermChip>
            <Sep />
            <TermChip label="Rep">
              <Select
                trigger="plain"
                value={repId}
                onChange={(v) => (touch(), setRepId(v))}
                width={240}
                options={PEOPLE.map((p) => ({ value: p.id, label: p.name, hint: p.team, person: p }))}
              >
                <ChipFace>
                  <Avatar person={repId ? personById(repId) : undefined} size={16} /> {repId ? personById(repId)?.name : "None"}
                </ChipFace>
              </Select>
            </TermChip>
            <Sep />
            <TermChip label="Customer PO">
              <input
                value={customerPo}
                onChange={(e) => (touch(), setCustomerPo(e.target.value))}
                placeholder="none"
                className={cn("h-7 w-[120px] rounded-bz-sm border border-transparent bg-transparent px-1.5 text-[12px] font-medium text-bz-text outline-none placeholder:font-normal placeholder:text-bz-text-soft hover:bg-bz-paper-warm focus:border-bz-line focus:bg-bz-surface", NUM)}
              />
            </TermChip>
            {customer && (
              <>
                <Sep />
                <TermChip label="Currency">
                  <span className="px-1.5 text-[12px] font-medium text-bz-text" title="Set by the customer">
                    {customer.currency}
                    {customer.currency !== "NPR" && <span className={cn("ml-1 font-normal text-bz-text-soft", NUM)}>@ 133.42</span>}
                  </span>
                </TermChip>
              </>
            )}
          </div>

          {/* ── 3 · Lines ────────────────────────────────────────────── */}
          <div className="mt-5">
            <div className="hidden grid-cols-[28px_minmax(0,1fr)_96px_112px_72px_92px_120px_56px] items-center gap-2 px-2 pb-1.5 md:grid">
              <span className={LABEL}>#</span>
              <span className={LABEL}>Item</span>
              <span className={cn(LABEL, "text-right")}>Qty</span>
              <span className={cn(LABEL, "text-right")}>Rate</span>
              <span className={cn(LABEL, "text-right")}>Disc %</span>
              <span className={LABEL}>Tax</span>
              <span className={cn(LABEL, "text-right")}>Net</span>
              <span />
            </div>
            <div className="overflow-visible rounded-bz-md border border-bz-line-soft">
              {lines.map((l, i) => (
                <LineRow
                  key={l.key}
                  n={i + 1}
                  line={l}
                  isGhost={!l.itemId}
                  locationId={locationId}
                  itemRef={(el) => (itemRefs.current[l.key] = el)}
                  qtyRef={(el) => (qtyRefs.current[l.key] = el)}
                  flagged={tried}
                  onPatch={(p) => patch(l.key, p)}
                  onRemove={() => removeLine(l.key)}
                  onPicked={() => window.setTimeout(() => qtyRefs.current[l.key]?.focus(), 0)}
                  onNext={() => {
                    const nextKey = lines[i + 1]?.key;
                    window.setTimeout(() => (nextKey ? itemRefs.current[nextKey] : itemRefs.current[lines[lines.length - 1].key])?.focus(), 0);
                  }}
                />
              ))}
            </div>
            <p className="m-0 mt-2 px-2 text-[10.5px] text-bz-text-soft">
              <Kbd>↵</Kbd> moves on · <Kbd>⌘↵</Kbd> saves
            </p>

            <dl className="ml-auto mt-2 grid w-full max-w-[320px] grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-[12px]">
              <dt className="text-bz-text-muted">Subtotal</dt>
              <dd className="m-0 text-right text-bz-text"><Amount value={totals.subtotal} /></dd>
              {totals.discount > 0 && (
                <>
                  <dt className="text-bz-text-muted">Discount</dt>
                  <dd className="m-0 text-right text-bz-text">−<Amount value={totals.discount} /></dd>
                </>
              )}
              <dt className="text-bz-text-muted">VAT 13%</dt>
              <dd className="m-0 text-right text-bz-text"><Amount value={totals.tax} /></dd>
              <dt className="mt-1 border-t border-bz-line-soft pt-2 text-[12.5px] font-semibold text-bz-text">Total</dt>
              <dd className="m-0 mt-1 border-t border-bz-line-soft pt-2 text-right text-[14px] font-semibold text-bz-text">
                <Amount value={totals.total} currency={customer?.currency ?? "NPR"} />
              </dd>
            </dl>
          </div>

          {/* ── 4 · More ─────────────────────────────────────────────── */}
          <div className="mt-6 border-t border-bz-line-soft pt-3">
            <button type="button" onClick={() => setMoreOpen((v) => !v)} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-bz-text">
              {moreOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Memo, dimensions & files
              {!moreOpen && (
                <span className="font-normal text-bz-text-soft">
                  {[memo && "memo", Object.values(dims).filter(Boolean).length && `${Object.values(dims).filter(Boolean).length} dimension`, files.length && `${files.length} file`].filter(Boolean).join(" · ") || "none set"}
                </span>
              )}
            </button>
            {moreOpen && (
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 md:row-span-2">
                  <span className="text-[11.5px] font-semibold text-bz-text">Memo</span>
                  <textarea value={memo} onChange={(e) => (touch(), setMemo(e.target.value))} placeholder="Printed on the order" className={cn(TEXTAREA, "min-h-[118px]")} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["department", "Department", DEPARTMENTS],
                      ["class", "Class", CLASSES],
                      ["project", "Project", PROJECTS],
                      ["partner", "Partner", PARTNERS],
                    ] as const
                  ).map(([k, label, opts]) => (
                    <div key={k} className="flex min-w-0 flex-col gap-1">
                      <span className="text-[11.5px] font-semibold text-bz-text">{label}</span>
                      <Select
                        trigger="ghost"
                        className="h-8 w-full justify-between"
                        label={dims[k] ?? <span className="font-normal text-bz-text-soft">None</span>}
                        value={dims[k] ?? null}
                        onChange={(v) => (touch(), setDims((d) => ({ ...d, [k]: v === "__none" ? undefined : v })))}
                        width={240}
                        options={[{ value: "__none", label: "None" }, ...opts.map((o) => ({ value: o, label: o }))]}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11.5px] font-semibold text-bz-text">Files</span>
                  {files.map((f) => (
                    <div key={f.name} className="flex items-center gap-2 rounded-bz-sm px-1 py-1 text-[12px]">
                      <Paperclip size={12} className="text-bz-text-soft" />
                      <span className="min-w-0 flex-1 truncate text-bz-text">{f.name}</span>
                      <button type="button" className="text-bz-text-soft hover:text-bz-text" onClick={() => setFiles((fs) => fs.filter((x) => x.name !== f.name))} aria-label="Remove">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => (touch(), setFiles((fs) => [...fs, { name: `customer-po-${fs.length + 1}.pdf`, size: "164 KB" }]))}
                    className="rounded-bz-md border border-dashed border-bz-line px-3 py-2.5 text-[11.5px] text-bz-text-soft hover:border-bz-text-soft hover:text-bz-text-muted"
                  >
                    Drop the customer's PO here, or browse
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dock ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-3">
        {refusal && <Refusal text={refusal} onDismiss={() => setRefusal(null)} sticky className="mb-2.5" />}
        <div className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center gap-x-3 gap-y-2">
          <span className={cn("text-[12px] text-bz-text-muted", NUM)}>
            <span className="font-semibold text-bz-text">{filled.length}</span> line{filled.length === 1 ? "" : "s"} ·{" "}
            <span className="text-[13px] font-semibold text-bz-text">
              <Amount value={totals.total} currency={customer?.currency ?? "NPR"} />
            </span>
          </span>
          {missing.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
              <span className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" /> Ready
            </span>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-[11.5px] text-bz-text-soft">
              <CircleAlert size={12} /> Needs{" "}
              {missing.slice(0, 2).map((m, i) => (
                <button key={i} type="button" onClick={m.focus} className="font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text">
                  {m.label}
                </button>
              ))}
              {missing.length > 2 && <span>+{missing.length - 2}</span>}
            </span>
          )}
          {reapproval && <span className="text-[11.5px] font-medium text-bz-amber">Saving sends it back for approval</span>}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={GHOST} onClick={() => onCancel(mode.kind === "new" && dirty.current)}>
              Cancel
            </button>
            <button type="button" className={BTN} onClick={save}>
              {editing ? "Save changes" : noun === "estimate" ? "Create estimate" : mode.kind === "copy" && !mode.source ? "Create copy" : "Create order"} <Kbd>⌘↵</Kbd>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const Sep = () => <span aria-hidden className="mx-1 size-[3px] rounded-bz-pill bg-bz-line" />;

function TermChip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="text-bz-text-soft">{label}</span>
      {children}
    </span>
  );
}

function ChipFace({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-bz-sm px-1.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm">
      {children}
      <ChevronDown size={11} className="text-bz-text-soft" />
    </span>
  );
}

// ── Customer picker — recent first, searchable, the one big field ───────────

function CustomerPicker({ orders, onPick, inputRef, invalid }: { orders: Order[]; onPick: (c: Customer) => void; inputRef: React.RefObject<HTMLInputElement>; invalid: boolean }) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const wrap = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const recentIds = Array.from(new Set([...orders].sort((a, b) => b.date.localeCompare(a.date)).map((o) => o.customerId))).slice(0, 4);
  const list = q
    ? CUSTOMERS.filter((c) => `${c.name} ${c.code} ${c.pan}`.toLowerCase().includes(q.toLowerCase()))
    : recentIds.map((id) => customerById(id)!).filter(Boolean);

  return (
    <div ref={wrap} className="relative">
      <p className={cn(LABEL, "m-0 mb-1.5")}>Order for</p>
      <label className="relative block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bz-text-soft" />
        <input
          ref={inputRef}
          value={q}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(e) => (setQ(e.target.value), setHi(0), setOpen(true))}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setHi((h) => Math.min(h + 1, list.length - 1)));
            if (e.key === "ArrowUp") (e.preventDefault(), setHi((h) => Math.max(h - 1, 0)));
            if (e.key === "Enter" && list[hi]) (e.preventDefault(), onPick(list[hi]));
          }}
          placeholder="Customer name, code or PAN"
          className={cn(INPUT, "h-11 pl-9 text-[15px]", invalid && "border-bz-red-mark")}
        />
      </label>
      {open && (
        <div className={cn(PANEL, "absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden p-1.5")}>
          {!q && <p className={cn(LABEL, "m-0 px-2 pb-1 pt-1")}>Recent</p>}
          {list.length === 0 && <p className="m-0 px-2 py-2 text-[12px] text-bz-text-soft">No customer matches “{q}”.</p>}
          {list.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHi(i)}
              onClick={() => onPick(c)}
              className={cn("flex w-full items-center gap-3 rounded-bz-sm px-2 py-2 text-left", i === hi ? "bg-bz-paper-warm" : "")}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-bz-text">{c.name}</span>
                <span className={cn("block truncate text-[11px] text-bz-text-muted", NUM)}>
                  {c.code} · {c.address}
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-bz-text-soft">
                {termById(c.termId)?.name} · {c.currency}
              </span>
              {openOrdersFor(orders, c.id) > 0 && <span className={cn("shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{openOrdersFor(orders, c.id)} open</span>}
            </button>
          ))}
          <div className="mt-1 border-t border-bz-line-soft pt-1">
            <button type="button" onMouseDown={(e) => e.preventDefault()} className="flex w-full items-center gap-2 rounded-bz-sm px-2 py-1.5 text-left text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">
              <Plus size={12} /> New customer{q && <> “{q}”</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── One line ────────────────────────────────────────────────────────────────

function LineRow({
  n,
  line,
  isGhost,
  locationId,
  itemRef,
  qtyRef,
  flagged,
  onPatch,
  onRemove,
  onPicked,
  onNext,
}: {
  n: number;
  line: Draft;
  isGhost: boolean;
  locationId: string;
  itemRef: (el: HTMLInputElement | null) => void;
  qtyRef: (el: HTMLInputElement | null) => void;
  flagged: boolean;
  onPatch: (p: Partial<Draft>) => void;
  onRemove: () => void;
  onPicked: () => void;
  onNext: () => void;
}) {
  const it = line.itemId ? itemById(line.itemId) : undefined;
  const locked = line.delivered > 0 || line.invoiced > 0;
  const [expanded, setExpanded] = React.useState(false);
  const cell = "h-8 w-full rounded-bz-sm border border-transparent bg-transparent px-2 text-[12.5px] text-bz-text outline-none transition-colors hover:border-bz-line-soft focus:border-bz-text-muted focus:bg-bz-surface";
  const onHand = it ? it.onHand[locationId] : undefined;
  const short = it && onHand !== undefined && Object.keys(it.onHand).length > 0 && line.qty - line.delivered > onHand;

  return (
    <div className={cn("group border-b border-bz-line-soft last:border-0", isGhost ? "bg-bz-paper" : "bg-bz-surface")}>
      <div className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2 px-2 py-1.5 md:grid-cols-[28px_minmax(0,1fr)_96px_112px_72px_92px_120px_56px]">
        <span className={cn("text-center text-[11px] text-bz-text-soft", NUM)}>{isGhost ? <Plus size={12} className="mx-auto" /> : n}</span>

        <ItemPicker value={it} inputRef={itemRef} locationId={locationId} placeholder={isGhost ? "Add an item — name or code" : "Item"} disabled={locked} onPick={(item) => (onPatch({ itemId: item.id, rate: item.rate, tax: item.tax }), onPicked())} />

        {!isGhost && (
          <>
            <span className="col-span-2 grid grid-cols-[1fr_1.2fr_0.8fr_1fr] gap-2 pl-[36px] md:contents">
              <span className="relative">
                <input
                  ref={qtyRef}
                  inputMode="decimal"
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label={`Quantity, line ${n}`}
                  value={line.qty || ""}
                  onChange={(e) => onPatch({ qty: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onNext())}
                  className={cn(cell, "pr-9 text-right", NUM, flagged && (!(line.qty > 0) || line.qty < line.delivered) && "border-bz-red-mark")}
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-bz-text-soft">{it?.unit}</span>
              </span>
              <input
                inputMode="decimal"
                onFocus={(e) => e.currentTarget.select()}
                aria-label={`Rate, line ${n}`}
                value={line.rate || ""}
                onChange={(e) => onPatch({ rate: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onNext())}
                className={cn(cell, "text-right", NUM)}
              />
              <input
                inputMode="decimal"
                onFocus={(e) => e.currentTarget.select()}
                aria-label={`Discount percent, line ${n}`}
                value={line.discountPct || ""}
                placeholder="—"
                onChange={(e) => onPatch({ discountPct: Math.min(100, Number(e.target.value.replace(/[^\d.]/g, "")) || 0) })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onNext())}
                className={cn(cell, "text-right placeholder:text-bz-text-soft", NUM)}
              />
              <Select
                trigger="plain"
                value={line.tax}
                onChange={(v) => onPatch({ tax: v as TaxCode })}
                width={160}
                options={(Object.keys(TAX_LABEL) as TaxCode[]).map((k) => ({ value: k, label: TAX_LABEL[k] }))}
              >
                <span className="inline-flex h-8 w-full items-center justify-between gap-1 rounded-bz-sm px-2 text-[12px] text-bz-text hover:bg-bz-paper-warm">
                  {TAX_LABEL[line.tax]} <ChevronDown size={11} className="text-bz-text-soft" />
                </span>
              </Select>
            </span>
            <span className="hidden text-right text-[12.5px] font-semibold text-bz-text md:block">
              <Amount value={lineNet(line)} />
            </span>
            <span className="hidden items-center justify-end gap-0.5 md:flex">
              <button type="button" onClick={() => setExpanded((v) => !v)} className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft opacity-0 hover:bg-bz-paper-warm hover:text-bz-text group-hover:opacity-100" title="Description">
                <ChevronDown size={12} className={cn("transition-transform", expanded && "rotate-180")} />
              </button>
              {locked ? (
                <span className="flex size-6 items-center justify-center text-bz-text-soft" title={`${fmtQty(line.delivered)} delivered — this line can't be removed`}>
                  <Lock size={11} />
                </span>
              ) : (
                <button type="button" onClick={onRemove} className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-soft opacity-0 hover:bg-bz-paper-warm hover:text-bz-text group-hover:opacity-100" title="Remove line">
                  <X size={12} />
                </button>
              )}
            </span>
          </>
        )}
      </div>
      {!isGhost && (short || locked) && (
        <p className={cn("m-0 px-2 pb-1.5 pl-[46px] text-[10.5px]", NUM, short ? "text-bz-amber" : "text-bz-text-soft")}>
          {locked && `${fmtQty(line.delivered)} delivered · ${fmtQty(line.invoiced)} invoiced`}
          {locked && short && " · "}
          {short && `${fmtQty(onHand ?? 0)} on hand at ${locationById(locationId)?.name} — the rest will wait`}
        </p>
      )}
      {expanded && !isGhost && (
        <div className="px-2 pb-2 pl-[46px]">
          <input value={line.description} onChange={(e) => onPatch({ description: e.target.value })} placeholder="Description printed on the order" className={cn(INPUT, "h-8 text-[12px]")} />
        </div>
      )}
    </div>
  );
}

function ItemPicker({
  value,
  inputRef,
  locationId,
  placeholder,
  disabled,
  onPick,
}: {
  value: ReturnType<typeof itemById>;
  inputRef: (el: HTMLInputElement | null) => void;
  locationId: string;
  placeholder: string;
  disabled?: boolean;
  onPick: (i: NonNullable<ReturnType<typeof itemById>>) => void;
}) {
  const [q, setQ] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const el = React.useRef<HTMLInputElement | null>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const shown = focus ? (q ? ITEMS.filter((i) => `${i.name} ${i.code}`.toLowerCase().includes(q.toLowerCase())) : ITEMS).slice(0, 7) : [];

  React.useLayoutEffect(() => {
    if (focus && el.current) setRect(el.current.getBoundingClientRect());
  }, [focus, q]);

  const pick = (i: NonNullable<ReturnType<typeof itemById>>) => {
    onPick(i);
    setQ("");
    setFocus(false);
  };

  return (
    <>
      <input
        ref={(n) => {
          el.current = n;
          inputRef(n);
        }}
        disabled={disabled}
        title={disabled ? "Delivered or invoiced — the item can't change" : undefined}
        value={focus ? q : value ? `${value.name}` : ""}
        placeholder={focus && value ? value.name : placeholder}
        onFocus={() => (setFocus(true), setHi(0))}
        onBlur={() => window.setTimeout(() => (setFocus(false), setQ("")), 120)}
        onChange={(e) => (setQ(e.target.value), setHi(0))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") (e.preventDefault(), setHi((h) => Math.min(h + 1, shown.length - 1)));
          if (e.key === "ArrowUp") (e.preventDefault(), setHi((h) => Math.max(h - 1, 0)));
          if (e.key === "Enter" && shown[hi]) (e.preventDefault(), pick(shown[hi]));
          if (e.key === "Escape") (e.currentTarget.blur());
        }}
        className="h-8 w-full min-w-0 truncate rounded-bz-sm border border-transparent bg-transparent px-2 text-[12.5px] text-bz-text outline-none transition-colors placeholder:text-bz-text-soft hover:border-bz-line-soft focus:border-bz-text-muted focus:bg-bz-surface disabled:cursor-not-allowed disabled:text-bz-text-muted"
      />
      {focus && rect && (
        <Portal>
          <div className={cn(PANEL, "fixed z-[1071] p-1.5")} style={{ top: Math.min(rect.bottom + 4, window.innerHeight - 330), left: rect.left, width: Math.max(rect.width, 420) }}>
            {shown.length === 0 && <p className="m-0 px-2 py-2 text-[12px] text-bz-text-soft">No item matches “{q}”.</p>}
            {shown.map((i, idx) => {
              const stock = Object.keys(i.onHand).length > 0;
              const oh = i.onHand[locationId] ?? 0;
              return (
                <button
                  key={i.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHi(idx)}
                  onClick={() => pick(i)}
                  className={cn("flex w-full items-center gap-3 rounded-bz-sm px-2 py-1.5 text-left", idx === hi && "bg-bz-paper-warm")}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-bz-text">{i.name}</span>
                    <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                      {i.code} · {i.unit}
                      {i.lotTracked && " · lot-tracked"}
                    </span>
                  </span>
                  <span className={cn("shrink-0 text-right text-[11px]", NUM)}>
                    <Amount value={i.rate} className="text-bz-text" />
                    <span className={cn("block text-[10.5px]", !stock ? "text-bz-text-soft" : oh === 0 ? "font-semibold text-bz-red" : "text-bz-text-muted")}>
                      {stock ? `${fmtQty(oh)} at ${locationById(locationId)?.name}` : "service"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
}

