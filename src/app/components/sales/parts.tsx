import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  Lock,
  MessageSquarePlus,
  Paperclip,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  X,
  CalendarRange,
  Check,
  Hash,
} from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, CARD, Chip, DANGER_BTN, Dialog, GHOST, GHOST_SM, INPUT, INPUT_SM, LABEL, MenuItem, NUM, PLAIN_BTN, Popover, Segmented, Select, TEXTAREA, Tone } from "./bzw";
import { Amount, Attachment, AuditRow, CUSTOMERS, Comment, HistoryEvent, ITEMS, ME, TODAY, addDays, fmtQty, fmtShort, personById, termById } from "./orders";
import { DEPOSIT_LEDGERS, FieldDef, HEADER_FIELDS, PAYMENT_METHODS, WorkflowAction, actionsFor, bsDate, methodById } from "./master";

// ════════════════════════════════════════════════════════════════════════════
// PARTS — the record sections every sales document shares
//
// The current app puts Activity, Files, Related records, System information
// and GL Impact in tabs. Here they are SECTIONS at the foot of the record:
// collapsed to one quiet line until opened, so the record stays calm and
// nothing is behind a tab nobody clicks. Each one is drawn ONCE, here.
// ════════════════════════════════════════════════════════════════════════════

// ── A collapsible section ───────────────────────────────────────────────────

export function Section({
  title,
  count,
  summary,
  right,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  summary?: React.ReactNode;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section className="border-b border-bz-line-soft px-5 last:border-0">
      <div className="flex min-h-11 items-center gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left" aria-expanded={open}>
          {open ? <ChevronDown size={13} className="shrink-0 text-bz-text-soft" /> : <ChevronRight size={13} className="shrink-0 text-bz-text-soft" />}
          <h3 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h3>
          {count !== undefined && <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{count}</span>}
          {!open && summary && <span className="min-w-0 truncate text-[11px] text-bz-text-soft">{summary}</span>}
        </button>
        {right && <div className="flex shrink-0 items-center gap-1.5">{right}</div>}
      </div>
      {open && <div className="pb-4">{children}</div>}
    </section>
  );
}

/** "Sep 4, 2026" with the BS date beneath — the app shows both. */
export function Dual({ iso, className, inline }: { iso: string | null | undefined; className?: string; inline?: boolean }) {
  if (!iso) return <span className="text-bz-text-soft">—</span>;
  return inline ? (
    <span className={cn(NUM, className)}>
      {fmtShort(iso)}, {iso.slice(0, 4)} <span className="text-bz-text-soft">· BS {bsDate(iso)}</span>
    </span>
  ) : (
    <span className={cn("inline-flex flex-col leading-tight", NUM, className)}>
      <span>{fmtShort(iso)}, {iso.slice(0, 4)}</span>
      <span className="text-[10.5px] text-bz-text-soft">BS {bsDate(iso)}</span>
    </span>
  );
}

export function Cell({ label, children, wide, required }: { label: string; children: React.ReactNode; wide?: boolean; required?: boolean }) {
  return (
    <div className={cn("min-w-0 bg-bz-surface px-3 py-2.5", wide && "sm:col-span-2")}>
      <p className={cn(LABEL, "m-0 mb-1")}>
        {label}
        {required && <span className="ml-0.5 text-bz-red">*</span>}
      </p>
      <div className="text-[12px] text-bz-text">{children}</div>
    </div>
  );
}

export function CellGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-line-soft sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">{children}</div>;
}

// ── Custom fields ───────────────────────────────────────────────────────────

export function customFieldCells(values: Record<string, string> | undefined, defs: FieldDef[] = HEADER_FIELDS) {
  return defs.map((d) => (
    <Cell key={d.key} label={d.label}>
      {values?.[d.key] ? values[d.key] : <span className="text-bz-text-soft">—</span>}
    </Cell>
  ));
}

export function CustomFieldInput({ def, value, onChange, invalid, compact }: { def: FieldDef; value: string; onChange: (v: string) => void; invalid?: boolean; compact?: boolean }) {
  if (def.type === "select")
    return (
      <Select
        trigger="ghost"
        className={cn("w-full justify-between", compact ? "h-8" : "h-9", invalid && "border-bz-red-mark")}
        label={value || <span className="font-normal text-bz-text-soft">Choose…</span>}
        value={value || null}
        onChange={onChange}
        width={220}
        options={(def.options ?? []).map((o) => ({ value: o, label: o }))}
      />
    );
  return <input type={def.type === "date" ? "date" : "text"} value={value} onChange={(e) => onChange(e.target.value)} className={cn(compact ? INPUT_SM : INPUT, invalid && "border-bz-red-mark")} />;
}

/**
 * An address on a DOCUMENT — where it is billed, or where it is going. It
 * reads as the customer's address, because it is, until someone changes it,
 * and it opens in place for the invoice that has to go somewhere else. The
 * override is stored on the document; the customer record is never touched,
 * and the PAN is always the customer record's — two versions of a tax number
 * is how a return gets rejected.
 */
export function AddressField({ label, value, fallback, onChange, className }: { label: string; value: string; fallback: string; onChange: (v: string) => void; className?: string }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value, open]);
  const changed = value.trim() !== fallback.trim();
  const commit = () => {
    onChange(draft.trim() || fallback);
    setOpen(false);
  };
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(true)}
        title={changed ? `${label} — changed on this document` : `${label} — click to change it on this document`}
        className={cn("max-w-full truncate rounded-bz-sm px-0.5 text-left underline decoration-dotted underline-offset-2 hover:bg-bz-paper-warm hover:decoration-solid", changed ? "font-medium text-bz-text" : "decoration-bz-line", className)}
      >
        {value}
      </button>
      <Popover open={open} anchor={ref.current} onClose={commit} width={300}>
        <div className="p-1">
          <p className={cn(LABEL, "m-0 mb-1.5")}>{label}</p>
          <textarea
            autoFocus
            value={draft}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && commit()}
            className={cn(TEXTAREA, "min-h-[64px] text-[12px]")}
          />
          <div className="mt-2 flex items-center gap-2">
            {draft.trim() !== fallback.trim() ? (
              <button type="button" className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text" onClick={() => setDraft(fallback)}>
                Use the customer's address
              </button>
            ) : (
              <span className="text-[10.5px] text-bz-text-soft">From the customer record</span>
            )}
            <button type="button" className={cn(GHOST_SM, "ml-auto")} onClick={commit}>
              Done
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
}

// ── The chip line: the one way a document's terms are set ───────────────────
//
// Labelled boxes in a grid cost a row each and shout every field name at a
// reader who is looking for one of them. A document's terms are a SENTENCE —
// date, where from, whose, in what currency — so they are written as one, and
// only the values are dark enough to scan.

export function ChipRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-x-1 gap-y-2 border-y border-bz-line-soft py-2.5 text-[12px] text-bz-text-muted", className)}>{children}</div>;
}

export const Sep = () => <span aria-hidden className="mx-1 size-[3px] rounded-bz-pill bg-bz-line" />;

export function TermChip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="text-bz-text-soft">{label}</span>
      {children}
    </span>
  );
}

export function ChipFace({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-bz-sm px-1.5 text-[12px] font-medium hover:bg-bz-paper-warm", muted ? "text-bz-text-soft" : "text-bz-text")}>
      {children}
      <ChevronDown size={11} className="text-bz-text-soft" />
    </span>
  );
}

export function DateChip({ value, onChange, min, max }: { value: string | null; onChange: (v: string) => void; min?: string; max?: string }) {
  return (
    <label className="relative inline-flex h-7 items-center rounded-bz-sm px-1.5 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm" title={value ? `BS ${bsDate(value)}` : undefined}>
      <span className={NUM}>{value ? fmtShort(value) : "no date"}</span>
      <input type="date" value={value ?? ""} min={min} max={max} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
    </label>
  );
}

/** A chip you type into — a vehicle number, a reference. */
export function TextChip({ value, onChange, placeholder, width = 120 }: { value: string; onChange: (v: string) => void; placeholder: string; width?: number }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width }}
      className={cn("h-7 rounded-bz-sm border border-transparent bg-transparent px-1.5 text-[12px] font-medium text-bz-text outline-none placeholder:font-normal placeholder:text-bz-text-soft hover:bg-bz-paper-warm focus:border-bz-line focus:bg-bz-surface", NUM)}
    />
  );
}

/** A chip you pick from. */
export function PickChip({ label, value, onChange, options, width = 220, muted }: { label: React.ReactNode; value: string | null; onChange: (v: string) => void; options: { value: string; label: string; hint?: string }[]; width?: number; muted?: boolean }) {
  return (
    <Select trigger="plain" value={value} onChange={onChange} width={width} options={options}>
      <ChipFace muted={muted}>{label}</ChipFace>
    </Select>
  );
}

// ── Money in ────────────────────────────────────────────────────────────────

/**
 * A figure you type. It READS as money — grouped, two decimals — and only
 * becomes a bare number while the caret is in it, so the reader never has to
 * parse 180827.6 and the typist never has to fight a comma.
 */
export function AmountInput({
  value,
  onChange,
  className,
  ariaLabel,
  invalid,
  placeholder = "0.00",
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  ariaLabel?: string;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [raw, setRaw] = React.useState<string | null>(null);
  const shown = raw ?? (value ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
  return (
    <input
      inputMode="decimal"
      aria-label={ariaLabel}
      value={shown}
      placeholder={placeholder}
      onFocus={(e) => {
        setRaw(value ? String(value) : "");
        window.setTimeout(() => e.target.select(), 0);
      }}
      onBlur={() => setRaw(null)}
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d.]/g, "");
        setRaw(t);
        onChange(Number(t) || 0);
      }}
      className={cn(INPUT_SM, "text-right", NUM, invalid && "border-bz-red-mark", className)}
    />
  );
}

// ── Serial numbers ──────────────────────────────────────────────────────────

/**
 * One serial per unit, and only two situations:
 *
 *   PICK   the units already exist — going out of a warehouse, or coming back
 *          on a return. Then the serials are a list to choose from, with "take
 *          the next N" for the ordinary case and a scan box for the unusual one.
 *   NEW    the units are arriving from a supplier and have no record yet, so
 *          the run is generated from the first number, or scanned in.
 *
 * Either way the count is the contract: `n of q`, and the commit refuses until
 * they match.
 */
export function SerialField({
  qty,
  value,
  onChange,
  code,
  label,
  invalid,
  options,
}: {
  qty: number;
  value: string[];
  onChange: (v: string[]) => void;
  code: string;
  label?: string;
  invalid?: boolean;
  /** Present ⇒ pick from these. Absent ⇒ the units are new, so make the numbers. */
  options?: { serial: string; batch?: string }[];
}) {
  const [first, setFirst] = React.useState(value[0] ?? "");
  const [scan, setScan] = React.useState("");
  const [all, setAll] = React.useState(false);
  const pick = !!options;
  const list = options ?? [];
  const needle = scan.trim().toLowerCase();
  // Typing in the scan box doubles as a filter — a scanner types the whole
  // number and presses Enter; a person types four digits and looks.
  const matches = needle ? list.filter((o) => o.serial.toLowerCase().includes(needle) || (o.batch ?? "").toLowerCase().includes(needle)) : list;
  const shownOptions = all || matches.length <= 12 ? matches : matches.slice(0, 12);

  const toggle = (s: string) => onChange(value.includes(s) ? value.filter((x) => x !== s) : value.length < qty ? [...value, s] : value);
  const take = () => onChange(list.slice(0, qty).map((s) => s.serial));

  return (
    <div className="py-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", invalid ? "text-bz-red" : "text-bz-text-muted", NUM)}>
          <Hash size={11} />
          {label ? `${label} · ` : ""}
          {value.length} of {fmtQty(qty)}
        </span>
        {pick ? (
          <>
            {list.length === 0 ? (
              <span className="text-[11px] text-bz-red">None of these in stock here.</span>
            ) : (
              <button type="button" onClick={take} className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text">
                Take next {fmtQty(Math.min(qty, list.length))}
              </button>
            )}
            {value.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="text-[11px] text-bz-text-soft underline underline-offset-2 hover:text-bz-text">
                Clear
              </button>
            )}
          </>
        ) : (
          <>
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder={`First — ${code}-0001`} className={cn(INPUT_SM, "h-7 w-[150px] text-[11.5px]", NUM)} aria-label="First serial" />
            <button type="button" disabled={!/\d/.test(first)} onClick={() => onChange(serialRun(first, qty))} className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text disabled:no-underline disabled:opacity-45">
              Fill {fmtQty(qty)}
            </button>
          </>
        )}
        <input
          value={scan}
          onChange={(e) => setScan(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || !scan.trim()) return;
            e.preventDefault();
            const s = scan.trim();
            const hit = list.find((x) => x.serial.toLowerCase() === s.toLowerCase()) ?? (matches.length === 1 ? matches[0] : undefined);
            if (pick && !hit) return;
            const add = pick ? hit!.serial : s;
            if (!value.includes(add) && value.length < qty) onChange([...value, add]);
            setScan("");
          }}
          placeholder={pick ? "scan or find" : "scan + ↵"}
          className={cn(INPUT_SM, "h-7 w-[112px] text-[11.5px]", NUM)}
          aria-label="Scan a serial"
        />
      </div>

      {pick ? (
        (list.length > 0 || !!needle) && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {shownOptions.map((o) => {
              const on = value.includes(o.serial);
              return (
                <button
                  key={o.serial}
                  type="button"
                  onClick={() => toggle(o.serial)}
                  title={o.batch ? `Batch ${o.batch}` : undefined}
                  className={cn("rounded-bz-sm border px-1.5 py-px text-[10.5px] transition-colors", NUM, on ? "border-bz-olive bg-bz-fire/20 font-medium text-bz-text" : "border-bz-line-soft text-bz-text-muted hover:border-bz-text-soft")}
                >
                  {o.serial}
                </button>
              );
            })}
            {matches.length > shownOptions.length && (
              <button type="button" onClick={() => setAll(true)} className="px-1 text-[10.5px] text-bz-text-soft underline underline-offset-2 hover:text-bz-text">
                +{matches.length - shownOptions.length} more
              </button>
            )}
            {needle && matches.length === 0 && <span className="px-1 text-[10.5px] text-bz-red">No serial here matches “{scan.trim()}”.</span>}
          </div>
        )
      ) : (
        value.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {(value.length > 6 ? [...value.slice(0, 3), "…", ...value.slice(-2)] : value).map((s, i) =>
              s === "…" ? (
                <span key={i} className="px-0.5 text-[11px] text-bz-text-soft">…</span>
              ) : (
                <span key={s} className={cn("inline-flex items-center gap-0.5 rounded-bz-sm bg-bz-paper-warm py-px pl-1.5 pr-0.5 text-[10.5px] text-bz-text", NUM)}>
                  {s}
                  <button type="button" className="flex size-3.5 items-center justify-center text-bz-text-soft hover:text-bz-text" onClick={() => onChange(value.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                    <X size={9} />
                  </button>
                </span>
              ),
            )}
            <button type="button" className="ml-1 text-[10.5px] text-bz-text-soft underline underline-offset-2 hover:text-bz-text" onClick={() => onChange([])}>
              Clear
            </button>
          </div>
        )
      )}
    </div>
  );
}

/** RTR-26-0451 → the next n, keeping the prefix and the padding. */
export function serialRun(first: string, n: number) {
  const m = /^(.*?)(\d+)$/.exec(first.trim());
  if (!m) return [];
  const width = m[2].length;
  return Array.from({ length: n }, (_, i) => `${m[1]}${String(Number(m[2]) + i).padStart(width, "0")}`);
}

// ── Workflow ────────────────────────────────────────────────────────────────

/**
 * Whatever actions the tenant's workflow state offers. The first "approve" is
 * the primary; the rest are quiet; past two, they fold into one menu so a
 * state with five transitions does not become a toolbar.
 */
export function WorkflowButtons({ actions, onRun }: { actions: WorkflowAction[]; onRun: (a: WorkflowAction) => void }) {
  const primary = actions.find((a) => a.kind === "approve") ?? actions[0];
  const rest = actions.filter((a) => a !== primary);
  const shown = rest.slice(0, 1);
  const folded = rest.slice(1);
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      {folded.length > 0 && (
        <>
          <button ref={ref} type="button" className={GHOST_SM} onClick={() => setOpen(true)}>
            More <ChevronDown size={11} />
          </button>
          <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align="right" width={240}>
            {folded.map((a) => (
              <MenuItem key={a.label} hint={a.hint} onClick={() => (setOpen(false), onRun(a))}>
                {a.label}
              </MenuItem>
            ))}
          </Popover>
        </>
      )}
      {shown.map((a) => (
        <button key={a.label} type="button" className={GHOST_SM} title={a.hint} onClick={() => onRun(a)}>
          {a.label}
        </button>
      ))}
      <button type="button" className={cn(BTN, "h-8")} onClick={() => onRun(primary)}>
        <Check size={13} /> {primary.label}
      </button>
    </>
  );
}

/**
 * The tenant's actions for a workflow state, wired: approve runs at once (and
 * on A), a send-back asks for its reason, a move names where it goes.
 */
export function WorkflowActions({ no, stateName, onApprove, onReject, onMove }: { no: string; stateName?: string; onApprove: () => void; onReject: (reason: string) => void; onMove?: (to: string) => void }) {
  const actions = actionsFor(stateName).filter((a) => a.kind !== "move" || onMove);
  const [asking, setAsking] = React.useState<WorkflowAction | null>(null);
  const approveRef = React.useRef(onApprove);
  approveRef.current = onApprove;
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (e.key.toLowerCase() === "a" && !e.metaKey && !e.ctrlKey && !document.querySelector("[data-bzw-dialog]")) approveRef.current();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  return (
    <>
      <WorkflowButtons actions={actions} onRun={(a) => (a.kind === "approve" ? onApprove() : a.kind === "move" ? onMove?.(a.to!) : setAsking(a))} />
      <ReasonDialog
        open={!!asking}
        eyebrow={no}
        title={`${asking?.label ?? "Send back"} ${no}?`}
        body="The person who raised it sees your reason on the document."
        confirm={asking?.label ?? "Send back"}
        danger
        onClose={() => setAsking(null)}
        onConfirm={(r) => (setAsking(null), onReject(r))}
      />
    </>
  );
}

// ── Payment taken now (an invoice paid at save) ─────────────────────────────

export type PayNow = { methodId: string; fields: Record<string, string>; depositTo: string; amount: number };

/** Method from the master, the fields that method needs, and where the money goes. */
export function PaymentFields({ value, onChange, max, currency, tried }: { value: PayNow; onChange: (v: PayNow) => void; max: number; currency: string; tried?: boolean }) {
  const m = methodById(value.methodId);
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <MiniLabel label="Method">
        <Select trigger="ghost" className="h-8 w-full justify-between" label={m.name} value={value.methodId} onChange={(v) => onChange({ ...value, methodId: v, fields: {} })} width={220} options={PAYMENT_METHODS.map((x) => ({ value: x.id, label: x.name }))} />
      </MiniLabel>
      <MiniLabel label="Deposit to">
        <Select trigger="ghost" className="h-8 w-full justify-between" label={value.depositTo.split(" · ")[0]} value={value.depositTo} onChange={(v) => onChange({ ...value, depositTo: v })} width={270} options={DEPOSIT_LEDGERS.map((d) => ({ value: d, label: d, hint: d === "Undeposited funds" ? "Post it to a bank later" : undefined }))} />
      </MiniLabel>
      {m.fields.map((f) => (
        <MiniLabel key={f.key} label={f.label} required={f.required}>
          <CustomFieldInput def={f} compact value={value.fields[f.key] ?? ""} invalid={tried && f.required && !value.fields[f.key]} onChange={(v) => onChange({ ...value, fields: { ...value.fields, [f.key]: v } })} />
        </MiniLabel>
      ))}
      <MiniLabel label={`Amount (${currency})`}>
        <AmountInput value={Math.round(value.amount * 100) / 100} onChange={(n) => onChange({ ...value, amount: n })} invalid={value.amount > max + 0.005} className="font-semibold" />
      </MiniLabel>
    </div>
  );
}

export const missingPayFields = (p: PayNow) => methodById(p.methodId).fields.filter((f) => f.required && !p.fields[f.key]).map((f) => f.label.toLowerCase());

export function MiniLabel({ label, children, required, optional, className }: { label: string; children: React.ReactNode; required?: boolean; optional?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-[11px] font-semibold text-bz-text-muted">
        {label}
        {required && <span className="ml-0.5 text-bz-red">*</span>}
        {optional && <span className="ml-1 font-normal text-bz-text-soft">optional</span>}
      </span>
      {children}
    </div>
  );
}

/** Memo and the tenant's header fields, folded until wanted — every sheet has them. */
export function MoreFields({ memo, onMemo, custom, onCustom, tried, children }: { memo: string; onMemo: (v: string) => void; custom: Record<string, string>; onCustom: (v: Record<string, string>) => void; tried?: boolean; children?: React.ReactNode }) {
  const missing = HEADER_FIELDS.some((f) => f.required && !custom[f.key]);
  const [open, setOpen] = React.useState(false);
  const shown = open || (tried && missing);
  const set = [memo && 1, ...HEADER_FIELDS.map((f) => (custom[f.key] ? 1 : 0))].reduce<number>((a, b) => a + (Number(b) || 0), 0);
  return (
    <div className="border-t border-bz-line-soft px-5 py-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-bz-text">
        {shown ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Memo & custom fields
        {!shown && <span className="font-normal text-bz-text-soft">{set ? `${set} set` : "none set"}</span>}
      </button>
      {shown && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniLabel label="Memo" className="sm:col-span-2">
            <textarea value={memo} onChange={(e) => onMemo(e.target.value)} placeholder="Printed on the document" className={cn(TEXTAREA, "min-h-[56px]")} />
          </MiniLabel>
          {HEADER_FIELDS.map((f) => (
            <MiniLabel key={f.key} label={f.label} required={f.required}>
              <CustomFieldInput def={f} compact value={custom[f.key] ?? ""} invalid={tried && f.required && !custom[f.key]} onChange={(v) => onCustom({ ...custom, [f.key]: v })} />
            </MiniLabel>
          ))}
          {children}
        </div>
      )}
    </div>
  );
}

// ── Dialogs ─────────────────────────────────────────────────────────────────

export function ReasonDialog({
  open,
  eyebrow,
  title,
  body,
  label = "Reason",
  confirm,
  danger,
  onClose,
  onConfirm,
}: {
  open: boolean;
  eyebrow?: string;
  title: string;
  body?: React.ReactNode;
  label?: string;
  confirm: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (open) (setReason(""), setTried(false));
  }, [open]);
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={eyebrow}
      title={title}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={danger ? DANGER_BTN : BTN} onClick={() => (reason.trim() ? onConfirm(reason.trim()) : setTried(true))}>
            {confirm}
          </button>
        </>
      }
    >
      {body && <p className="m-0 mb-3 text-[12px] leading-relaxed text-bz-text-muted">{body}</p>}
      <label className="flex flex-col gap-1">
        <span className="text-[11.5px] font-semibold text-bz-text">
          {label} <span className="text-bz-red">*</span>
        </span>
        <textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} className={cn(TEXTAREA, "min-h-[64px]", tried && !reason.trim() && "border-bz-red-mark")} />
        {tried && !reason.trim() && <span className="text-[10.5px] text-bz-red">A reason is required.</span>}
      </label>
    </Dialog>
  );
}

export function ConfirmDialog({ open, eyebrow, title, body, confirm, danger, onClose, onConfirm }: { open: boolean; eyebrow?: string; title: string; body: React.ReactNode; confirm: string; danger?: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={eyebrow}
      title={title}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={danger ? DANGER_BTN : BTN} onClick={onConfirm}>
            {confirm}
          </button>
        </>
      }
    >
      <p className="m-0 text-[12px] leading-relaxed text-bz-text-muted">{body}</p>
    </Dialog>
  );
}

/** Edit · Copy · Cancel · Delete — one lifecycle, the same dialogs on every document. */
export function useLifecycle(no: string) {
  const [dialog, setDialog] = React.useState<null | "cancel" | "delete" | "close">(null);
  return {
    open: (d: "cancel" | "delete" | "close") => setDialog(d),
    dialogs: (h: { onCancel?: (reason: string) => void; onDelete?: () => void; onClose?: () => void; cancelBody?: React.ReactNode; deleteBody?: React.ReactNode; closeBody?: React.ReactNode }) => (
      <>
        <ReasonDialog open={dialog === "cancel"} eyebrow={no} title={`Cancel ${no}?`} body={h.cancelBody} confirm="Cancel document" danger onClose={() => setDialog(null)} onConfirm={(r) => (setDialog(null), h.onCancel?.(r))} />
        <ConfirmDialog open={dialog === "delete"} eyebrow={no} title={`Delete ${no}?`} body={h.deleteBody ?? "It is removed for good. This can't be undone."} confirm="Delete" danger onClose={() => setDialog(null)} onConfirm={() => (setDialog(null), h.onDelete?.())} />
        <ConfirmDialog open={dialog === "close"} eyebrow={no} title={`Close ${no}?`} body={h.closeBody ?? "Nothing more will be delivered or billed."} confirm="Close" onClose={() => setDialog(null)} onConfirm={() => (setDialog(null), h.onClose?.())} />
      </>
    ),
  };
}

// ── Files ───────────────────────────────────────────────────────────────────

const fileIcon = (name: string) => (/\.(png|jpe?g|gif|webp)$/i.test(name) ? FileImage : /\.(xlsx?|csv)$/i.test(name) ? FileSpreadsheet : FileText);

export function FilesSection({ files, onAdd, onRemove, onToast }: { files: Attachment[]; onAdd: () => void; onRemove?: (name: string) => void; onToast: (t: string) => void }) {
  const [preview, setPreview] = React.useState<Attachment | null>(null);
  return (
    <Section
      title="Files"
      count={files.length}
      summary={files.length ? files.map((f) => f.name).join(", ") : "None"}
      right={
        <button type="button" className={GHOST_SM} onClick={onAdd}>
          <Plus size={11} /> Add
        </button>
      }
      defaultOpen={files.length > 0}
    >
      {files.length === 0 ? (
        <button type="button" onClick={onAdd} className="w-full rounded-bz-md border border-dashed border-bz-line px-3 py-3 text-[11.5px] text-bz-text-soft hover:border-bz-text-soft hover:text-bz-text-muted">
          Drop files here, or browse
        </button>
      ) : (
        <div className="flex flex-col">
          {files.map((f) => {
            const Icon = fileIcon(f.name);
            return (
              <div key={f.name} className="group flex items-center gap-2.5 rounded-bz-sm px-1 py-1.5 hover:bg-bz-paper-warm">
                <Icon size={14} className="shrink-0 text-bz-text-soft" />
                <button type="button" onClick={() => setPreview(f)} className="min-w-0 flex-1 truncate text-left text-[12px] text-bz-text hover:underline">
                  {f.name}
                </button>
                <span className={cn("hidden text-[10.5px] text-bz-text-soft sm:inline", NUM)}>
                  {f.size}
                  {f.byId && <> · {personById(f.byId)?.name.split(" ")[0]}</>}
                  {f.on && <> · {f.on}</>}
                </span>
                <span className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <button type="button" className={cn(PLAIN_BTN, "mx-1")} onClick={() => setPreview(f)} aria-label="Preview">
                    <Eye size={12} />
                  </button>
                  <button type="button" className={cn(PLAIN_BTN, "mx-1")} onClick={() => onToast(`Downloading ${f.name}…`)} aria-label="Download">
                    <Download size={12} />
                  </button>
                  {onRemove && (
                    <button type="button" className={cn(PLAIN_BTN, "mx-1")} onClick={() => onRemove(f.name)} aria-label="Remove">
                      <Trash2 size={12} />
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <Dialog
        open={!!preview}
        size="wide"
        eyebrow="Preview"
        title={preview?.name ?? ""}
        onClose={() => setPreview(null)}
        foot={
          <>
            <button type="button" className={GHOST} onClick={() => setPreview(null)}>
              Close
            </button>
            <button type="button" className={BTN} onClick={() => preview && onToast(`Downloading ${preview.name}…`)}>
              <Download size={13} /> Download
            </button>
          </>
        }
      >
        <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft">
          {preview && React.createElement(fileIcon(preview.name), { size: 32 })}
          <span className="text-[11.5px]">
            {preview?.size}
            {preview?.byId && ` · uploaded by ${personById(preview.byId)?.name}`}
          </span>
        </div>
      </Dialog>
    </Section>
  );
}

// ── Related records ─────────────────────────────────────────────────────────

export function RelatedSection({ rows, onOpen }: { rows: { no: string; kind: string; date: string; party: string; status: string; tone: Tone }[]; onOpen: (no: string) => void }) {
  const kinds = Array.from(new Set(rows.map((r) => r.kind)));
  const [kind, setKind] = React.useState("all");
  const shown = rows.filter((r) => kind === "all" || r.kind === kind);
  // One party across every row says nothing — drop the column.
  const party = new Set(rows.map((r) => r.party)).size > 1;
  const cols = party ? "sm:grid-cols-[76px_96px_minmax(0,1fr)_minmax(0,1fr)_130px]" : "sm:grid-cols-[76px_110px_minmax(0,1fr)_130px]";
  return (
    <Section title="Related records" count={rows.length} summary={kinds.join(" · ") || "None"} defaultOpen={rows.length > 0 && rows.length <= 4}>
      {rows.length === 0 ? (
        <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing linked yet.</p>
      ) : (
        <>
          {kinds.length > 1 && (
            <div className="mb-2">
              <Segmented size="sm" value={kind} onChange={setKind} options={[{ value: "all", label: "All" }, ...kinds.map((k) => ({ value: k, label: k, count: rows.filter((r) => r.kind === k).length }))]} />
            </div>
          )}
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn("hidden gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", cols, LABEL)}>
              <span>Date</span>
              <span>Type</span>
              <span>Document</span>
              {party && <span>Party</span>}
              <span>Status</span>
            </div>
            {shown.map((r) => (
              <button
                key={r.no}
                type="button"
                onClick={() => onOpen(r.no)}
                className={cn("grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-left text-[12px] last:border-0 hover:bg-bz-paper-warm", cols)}
              >
                <span className={cn("hidden text-bz-text-muted sm:block", NUM)}>{fmtShort(r.date)}</span>
                <span className="hidden text-bz-text-muted sm:block">{r.kind}</span>
                <span className={cn("font-medium text-bz-text", NUM)}>
                  {r.no}
                  <span className="block text-[10.5px] font-normal text-bz-text-soft sm:hidden">
                    {r.kind} · {fmtShort(r.date)}
                  </span>
                </span>
                {party && <span className="hidden truncate text-bz-text-muted sm:block">{r.party}</span>}
                <span>
                  <Chip tone={r.tone}>{r.status}</Chip>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

// ── System information ──────────────────────────────────────────────────────

export function SystemSection({ created, history, audit }: { created: { byId: string; on: string }; history: HistoryEvent[]; audit: AuditRow[] }) {
  const workflow = history.filter((h) => /approv|reject|sent|send back|escalat|hold|clear|releas|cancel/i.test(h.what));
  const last = history[history.length - 1];
  return (
    <Section title="System information" summary={`Created by ${personById(created.byId)?.name} · ${fmtShort(created.on)}`}>
      <CellGrid>
        <Cell label="Created">
          <span className="inline-flex items-center gap-1.5">
            <Avatar person={personById(created.byId)} size={16} /> {personById(created.byId)?.name}
          </span>
          <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{fmtShort(created.on)}, {created.on.slice(0, 4)}</span>
        </Cell>
        <Cell label="Last modified">
          {last ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Avatar person={personById(last.whoId)} size={16} /> {personById(last.whoId)?.name}
              </span>
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{last.when}</span>
            </>
          ) : (
            <span className="text-bz-text-soft">—</span>
          )}
        </Cell>
      </CellGrid>

      <p className={cn(LABEL, "m-0 mb-1.5 mt-4")}>Field changes</p>
      {audit.length === 0 ? (
        <p className="m-0 text-[11.5px] text-bz-text-soft">No fields changed since it was created.</p>
      ) : (
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          {audit.map((a, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 border-b border-bz-line-soft px-3 py-2 text-[11.5px] last:border-0 sm:grid-cols-[96px_minmax(0,0.9fr)_minmax(0,1.4fr)]">
              <span className={cn("text-bz-text-soft", NUM)}>{a.when}</span>
              <span className="truncate text-bz-text">{a.field}</span>
              <span className="col-span-2 truncate text-bz-text-muted sm:col-span-1">
                <span className="line-through decoration-bz-text-soft">{a.from}</span> → <span className="text-bz-text">{a.to}</span>
                <span className="ml-1.5 text-bz-text-soft">· {personById(a.whoId)?.name.split(" ")[0]}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <p className={cn(LABEL, "m-0 mb-1.5 mt-4")}>Workflow history</p>
      {workflow.length === 0 ? (
        <p className="m-0 text-[11.5px] text-bz-text-soft">No workflow on this document.</p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {workflow.map((h) => (
            <li key={h.id} className="flex items-center gap-2 text-[11.5px]">
              <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-leaf-deep" />
              <span className="min-w-0 flex-1 truncate text-bz-text-muted">
                <span className="font-medium text-bz-text">{personById(h.whoId)?.name}</span> {h.what}
              </span>
              <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{h.when}</span>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

// ── GL impact ───────────────────────────────────────────────────────────────

export type GLRow = { account: string; debit: number; credit: number };

export function GLSection({ rows, note }: { rows: GLRow[]; note?: string }) {
  const dr = rows.reduce((s, r) => s + r.debit, 0);
  const cr = rows.reduce((s, r) => s + r.credit, 0);
  return (
    <Section title="GL impact" summary={note ?? (rows.length ? `${rows.length} postings · balanced` : "Posts nothing yet")}>
      {rows.length === 0 ? (
        <p className="m-0 text-[11.5px] text-bz-text-soft">{note ?? "Posts to the ledger when approved."}</p>
      ) : (
        <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
          <div className={cn("grid grid-cols-[minmax(0,1fr)_110px_110px] gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5", LABEL)}>
            <span>Account</span>
            <span className="text-right">Debit</span>
            <span className="text-right">Credit</span>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_110px_110px] gap-3 border-b border-bz-line-soft px-3 py-2 text-[12px] last:border-0">
              <span className={cn("truncate text-bz-text", r.credit > 0 && "pl-4")}>{r.account}</span>
              <span className="text-right text-bz-text">{r.debit ? <Amount value={r.debit} /> : ""}</span>
              <span className="text-right text-bz-text">{r.credit ? <Amount value={r.credit} /> : ""}</span>
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1fr)_110px_110px] gap-3 bg-bz-paper px-3 py-2 text-[12px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-bz-text">
              Total <Chip tone={Math.abs(dr - cr) < 0.01 ? "positive" : "danger"} dot={false}>{Math.abs(dr - cr) < 0.01 ? "Balanced" : "Out by " + (dr - cr).toFixed(2)}</Chip>
            </span>
            <span className="text-right text-bz-text"><Amount value={dr} /></span>
            <span className="text-right text-bz-text"><Amount value={cr} /></span>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Activity: notes with a title and a direction ────────────────────────────

/**
 * The foot of a record. A quick note is one line; the details (title,
 * direction, date) open only when wanted — the app's USER_NOTE shape without a
 * five-field form sitting under every document.
 */
export function NoteFoot({ onSend }: { onSend: (n: Omit<Comment, "id" | "authorId" | "when">) => void }) {
  const [body, setBody] = React.useState("");
  const [more, setMore] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [direction, setDirection] = React.useState<"Inbound" | "Outbound">("Outbound");
  const send = () => {
    if (!body.trim()) return;
    onSend({ body: body.trim(), title: more && title.trim() ? title.trim() : undefined, direction: more ? direction : undefined });
    setBody("");
    setTitle("");
    setMore(false);
  };
  return (
    <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-2.5">
      {more && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Call with buyer)" className={cn(INPUT_SM, "min-w-[180px] flex-1")} />
          <Segmented size="sm" value={direction} onChange={setDirection} options={[{ value: "Outbound", label: "Outbound" }, { value: "Inbound", label: "Inbound" }]} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Avatar person={ME} size={24} />
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Add a note… @ to mention"
          className="h-8 min-w-0 flex-1 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft hover:border-bz-text-soft focus:border-bz-text-muted"
        />
        <button type="button" onClick={() => setMore((v) => !v)} className={cn(PLAIN_BTN, "mx-1", more && "text-bz-text")} title="Title and direction" aria-label="Note details">
          <MessageSquarePlus size={14} />
        </button>
        <button type="button" onClick={send} disabled={!body.trim()} className={cn(BTN, "h-8 px-3")}>
          <Send size={12} /> Send
        </button>
      </div>
    </div>
  );
}

// ── Advanced search (the picker's "more" door) ──────────────────────────────

export function AdvancedSearch({ open, kind, onClose, onPick }: { open: boolean; kind: "customer" | "item"; onClose: () => void; onPick: (id: string) => void }) {
  const [q, setQ] = React.useState("");
  const rows =
    kind === "customer"
      ? CUSTOMERS.filter((c) => `${c.name} ${c.code} ${c.pan} ${c.address}`.toLowerCase().includes(q.toLowerCase())).map((c) => ({
          id: c.id,
          cells: [c.code, c.name, c.pan, c.address, termById(c.termId)?.name ?? "", c.isProspect ? "Prospect" : c.currency],
        }))
      : ITEMS.filter((i) => `${i.name} ${i.code} ${i.hs}`.toLowerCase().includes(q.toLowerCase())).map((i) => ({ id: i.id, cells: [i.code, i.name, i.hs, i.unit, i.rate.toLocaleString("en-US"), String(Object.values(i.onHand).reduce((a, b) => a + b, 0) || "—")] }));
  const head = kind === "customer" ? ["Code", "Name", "PAN", "Address", "Term", "Type"] : ["Code", "Name", "HS", "Unit", "Rate", "On hand"];
  return (
    <Dialog
      open={open}
      size="wide"
      eyebrow="Advanced search"
      title={kind === "customer" ? "Find a customer" : "Find an item"}
      onClose={onClose}
      foot={
        <button type="button" className={GHOST} onClick={onClose}>
          Close
        </button>
      }
    >
      <label className="relative mb-3 block">
        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-soft" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={kind === "customer" ? "Name, code, PAN or address" : "Name, code or HS code"} className={cn(INPUT_SM, "pl-8")} />
      </label>
      <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
        <div className={cn("grid grid-cols-[70px_minmax(0,1.4fr)_90px_minmax(0,1fr)_70px_70px] gap-2 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5", LABEL)}>
          {head.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {rows.map((r) => (
            <button key={r.id} type="button" onClick={() => (onPick(r.id), onClose())} className="grid w-full grid-cols-[70px_minmax(0,1.4fr)_90px_minmax(0,1fr)_70px_70px] gap-2 border-b border-bz-line-soft px-3 py-2 text-left text-[11.5px] last:border-0 hover:bg-bz-paper-warm">
              {r.cells.map((c, i) => (
                <span key={i} className={cn("truncate", i === 1 ? "font-medium text-bz-text" : "text-bz-text-muted", NUM)}>
                  {c}
                </span>
              ))}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

// ── List tools: period, export ──────────────────────────────────────────────

export type Period = { key: string; label: string; from: string | null; to: string | null };

/** Presets resolve the FISCAL calendar (FY starts Shrawan 1 ≈ Jul 17) — like the app's FiscalPeriodService. */
export const PERIODS: Period[] = [
  { key: "all", label: "Any date", from: null, to: null },
  { key: "30d", label: "Last 30 days", from: addDays(TODAY, -30), to: TODAY },
  { key: "month", label: "This month (Bhadra)", from: "2026-08-17", to: "2026-09-16" },
  { key: "quarter", label: "This quarter", from: "2026-07-17", to: "2026-10-17" },
  { key: "year", label: "This fiscal year", from: "2026-07-17", to: "2027-07-16" },
];

export function PeriodSelect({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [from, setFrom] = React.useState(value.from ?? "");
  const [to, setTo] = React.useState(value.to ?? "");
  const on = value.key !== "all";
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(true)}
        className={cn("inline-flex h-8 items-center gap-1.5 rounded-bz-md border bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm", on ? "border-bz-text-muted font-semibold" : "border-bz-line-soft")}
      >
        <CalendarRange size={12} className="text-bz-text-muted" />
        {value.key === "custom" ? `${value.from ? fmtShort(value.from) : "…"} – ${value.to ? fmtShort(value.to) : "…"}` : value.label}
        <ChevronDown size={12} className="text-bz-text-soft" />
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} width={260}>
        {PERIODS.map((p) => (
          <MenuItem key={p.key} active={value.key === p.key} onClick={() => (onChange(p), setOpen(false))}>
            {p.label}
          </MenuItem>
        ))}
        <div className="mt-1 border-t border-bz-line-soft px-2 pb-1 pt-2">
          <p className={cn(LABEL, "m-0 mb-1.5")}>Custom range</p>
          <div className="grid grid-cols-2 gap-1.5">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={cn(INPUT_SM, "px-1.5 text-[11px]", NUM)} />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={cn(INPUT_SM, "px-1.5 text-[11px]", NUM)} />
          </div>
          <button type="button" className={cn(GHOST_SM, "mt-2 w-full")} onClick={() => (onChange({ key: "custom", label: "Custom", from: from || null, to: to || null }), setOpen(false))}>
            Apply range
          </button>
        </div>
      </Popover>
    </>
  );
}

export function ExportMenu({ onExport }: { onExport: (kind: "summary" | "detail") => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button ref={ref} type="button" className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" title="Export" onClick={() => setOpen(true)}>
        <Download size={14} />
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align="right" width={240}>
        <MenuItem icon={FileSpreadsheet} hint="One row per document, with the filters applied" onClick={() => (setOpen(false), onExport("summary"))}>
          Summary (Excel)
        </MenuItem>
        <MenuItem icon={FileSpreadsheet} hint="One row per line item" onClick={() => (setOpen(false), onExport("detail"))}>
          Item detail (Excel)
        </MenuItem>
      </Popover>
    </>
  );
}

export { Lock, Paperclip, SlidersHorizontal, X, fmtQty, CARD };
