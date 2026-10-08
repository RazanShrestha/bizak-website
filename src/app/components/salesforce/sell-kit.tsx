import { Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { INPUT, NUM, Select } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { LedgerEntry, PayMethod } from "./data";
import { customerById, npr, typeOf } from "./engine";
import { openQuickAdd } from "./quickadd";
import { QUICK_ADD_LABEL } from "./quickadd";
import type { QuickAddKind } from "./quickadd";
import { senderOf } from "./receipts";
import { customersStore, productsStore, repsStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// SELLING + MONEY · SMALL SHARED PIECES
//
// The pickers every "new" dialog in Orders, Claims and Quotations uses, and
// how a receipt's method and sender read. Each picker ends with "+ Add …",
// which opens the shell's quick-add dialog and selects what was just created —
// so an empty prototype never dead-ends in a picker with nothing in it.
// ════════════════════════════════════════════════════════════════════════════

const ADD = "__add";
const addOption = (kind: QuickAddKind): SelectOption => ({ value: ADD, label: `New ${QUICK_ADD_LABEL[kind].toLowerCase()}` });

/** A single picker over a master, ending in "New <noun>". */
function MasterPick({ kind, value, onChange, options, label, placeholder, className }: { kind: QuickAddKind; value: string | null; onChange: (id: string) => void; options: SelectOption[]; label: string; placeholder: string; className?: string }) {
  return (
    <Select
      trigger="ghost"
      value={value}
      searchable={options.length >= 8}
      width={320}
      placeholder={placeholder}
      options={[...options, addOption(kind)]}
      label={label}
      className={cn("h-9 w-full justify-between", className)}
      onChange={(v) => (v === ADD ? openQuickAdd(kind, { onCreated: onChange }) : onChange(v))}
    />
  );
}

export function CustomerPick({ value, onChange, className }: { value: string | null; onChange: (id: string) => void; className?: string }) {
  const customers = useStore(customersStore);
  const options: SelectOption[] = customers.map((c) => ({ value: c.id, label: c.name, group: typeOf(c).plural, hint: [c.city, c.code].filter(Boolean).join(" · ") }));
  return <MasterPick kind="customer" value={value} onChange={onChange} options={options} label={customerById(value)?.name ?? "Pick a customer"} placeholder="Search customers…" className={className} />;
}

export function RepPick({ value, onChange, className }: { value: string | null; onChange: (id: string) => void; className?: string }) {
  const reps = useStore(repsStore);
  const options: SelectOption[] = reps.map((r) => ({ value: r.id, label: r.name, hint: r.role }));
  return <MasterPick kind="rep" value={value} onChange={onChange} options={options} label={reps.find((r) => r.id === value)?.name ?? "Pick a rep"} placeholder="Search reps…" className={className} />;
}

/** "Add a product" — picks one product to add to a list of lines; the ones already there are left out. */
export function ProductAdd({ exclude = [], onPick, label = "Add a product" }: { exclude?: string[]; onPick: (id: string) => void; label?: string }) {
  const products = useStore(productsStore);
  const options: SelectOption[] = products.filter((p) => !exclude.includes(p.id)).map((p) => ({ value: p.id, label: p.name, group: p.brand || p.category || "Products", hint: [p.code, p.pack].filter(Boolean).join(" · "), meta: `NPR ${npr(p.listPrice)}` }));
  if (!products.length) {
    return (
      <button type="button" onClick={() => openQuickAdd("product", { onCreated: onPick })} className="inline-flex h-8 items-center gap-1.5 text-[12px] font-medium text-bz-text hover:underline">
        <Plus size={13} /> New product
      </button>
    );
  }
  return (
    <Select
      value={null}
      searchable={options.length >= 8}
      width={320}
      placeholder="Search products…"
      options={[...options, addOption("product")]}
      label={label}
      icon={Plus}
      onChange={(v) => (v === ADD ? openQuickAdd("product", { onCreated: onPick }) : onPick(v))}
    />
  );
}

/** A whole-rupee amount field: "NPR 12,500". */
export function MoneyInput({ value, onChange, label, invalid, className, autoFocus }: { value: number; onChange: (n: number) => void; label: string; invalid?: boolean; className?: string; autoFocus?: boolean }) {
  return (
    <span className={cn("relative block", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
      <input
        aria-label={label}
        autoFocus={autoFocus}
        inputMode="numeric"
        value={value ? npr(value) : ""}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className={cn(INPUT, "pl-11 font-semibold", NUM, invalid && "border-bz-red-mark")}
      />
    </span>
  );
}

// ── Receipts ────────────────────────────────────────────────────────────────

export const METHOD_LABEL: Record<PayMethod, string> = { bank: "Bank transfer", cheque: "Cheque", cash: "Cash", wallet: "eSewa / Khalti" };

// Who sent a receipt is a rule (receipts.ts); the pages take it from here with its wording.
export { senderOf };
export const senderText = (r: LedgerEntry) => {
  const s = senderOf(r);
  if (!s) return "";
  return s.via === "rep" ? `collected by ${s.name}` : s.via === "portal" ? `sent by ${s.name} on the portal` : `recorded by ${s.name}`;
};
