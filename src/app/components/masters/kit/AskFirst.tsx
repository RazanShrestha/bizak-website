import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, Clear, GHOST_SM, Kbd, NumberField, PLAIN_BTN, Popover, Select } from "../../sales/bzw";
import type { SelectOption } from "../../sales/bzw";

// ════════════════════════════════════════════════════════════════════════════
// ASK FIRST — the quick action's small popover (spec §3.6, `<bzw-ask-first>`)
//
// "New sales order" from an item asks the two things the composer would ask
// first — the customer (this item's recent customers first) and a quantity —
// so the order opens with its line filled. Both are optional: Enter starts
// with whatever is filled, and "Skip" starts with nothing. A template asks
// for its variant (the host opens the variant picker).
// ════════════════════════════════════════════════════════════════════════════

export type AskFirstResult = { customerId: string | null; qty: number | null; unit: string; variantId: string | null };

export function AskFirst({
  open,
  anchor,
  onClose,
  title,
  customers,
  units,
  unit,
  variant,
  commitLabel = "Start order",
  onStart,
}: {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  /** "New sales order · ZZ-CLAUDE-INV2" */
  title: string;
  /** Put the item's recent customers first, under their own `group`. */
  customers: SelectOption[];
  /** The base unit and the converted ones. */
  units: SelectOption[];
  unit: string;
  /** A template only: the chosen variant and the door to the variant picker. */
  variant?: { id: string | null; label: string | null; onChoose: () => void };
  commitLabel?: string;
  onStart: (r: AskFirstResult) => void;
}) {
  const [customer, setCustomer] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState(1);
  const [u, setU] = React.useState(unit);
  const qtyRef = React.useRef<HTMLDivElement>(null);
  const seedUnit = React.useRef(unit);
  seedUnit.current = unit;

  React.useEffect(() => {
    if (!open) return;
    setCustomer(null);
    setQty(1);
    setU(seedUnit.current);
    const id = window.setTimeout(() => qtyRef.current?.querySelector("input")?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const start = () => onStart({ customerId: customer, qty: qty > 0 ? qty : null, unit: u, variantId: variant?.id ?? null });
  const name = customers.find((c) => c.value === customer)?.label;

  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={300} className="p-0">
      <div
        className="p-3"
        onKeyDown={(e) => {
          // Enter starts from a typed field; on a button it presses that button.
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
            start();
          }
        }}
      >
        <div className="mb-3 flex items-start gap-2">
          <p className="m-0 min-w-0 flex-1 truncate text-[13px] font-semibold text-bz-text">{title}</p>
          <button type="button" className={PLAIN_BTN} onClick={onClose} aria-label="Close" title="Close (Esc)">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-2 gap-y-2.5 text-[12px]">
          <span className="text-bz-text-muted">Customer</span>
          <Select
            trigger="ghost"
            searchable
            className="h-8 w-full justify-between"
            label={name ?? <span className="font-normal text-bz-text-soft">Search customers…</span>}
            value={customer}
            onChange={setCustomer}
            options={customers}
            width={260}
            placeholder="Name, code or PAN"
          />
          <span className="text-bz-text-muted">Quantity</span>
          <div ref={qtyRef} className="flex items-center gap-1.5">
            <NumberField value={qty} onChange={setQty} min={0} ariaLabel="Quantity" className="w-[104px]" />
            <Select trigger="plain" value={u} onChange={setU} options={units} width={180}>
              <span className="inline-flex h-8 items-center gap-0.5 rounded-bz-sm px-1.5 text-[12px] text-bz-text-muted hover:bg-bz-paper-warm">
                {units.find((x) => x.value === u)?.label ?? u}
                <ChevronDown size={11} className="text-bz-text-soft" />
              </span>
            </Select>
          </div>
          {variant && (
            <>
              <span className="text-bz-text-muted">Variant</span>
              <button type="button" className={cn(GHOST_SM, "w-full justify-start")} onClick={variant.onChoose}>
                {variant.label ?? <span className="font-normal text-bz-text-soft">Choose…</span>}
              </button>
            </>
          )}
        </div>
        <div className="mt-3.5 flex items-center gap-2">
          <Clear label="Skip — choose in the order" onClear={() => onStart({ customerId: null, qty: null, unit, variantId: null })} />
          <button type="button" className={cn(BTN, "ml-auto h-8")} onClick={start}>
            {commitLabel} <Kbd>↵</Kbd>
          </button>
        </div>
      </div>
    </Popover>
  );
}
