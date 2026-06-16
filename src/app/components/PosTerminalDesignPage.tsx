import * as React from "react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import {
  ScanLine,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Keyboard,
  Power,
  LogOut,
  UserRound,
  UserPlus,
  Gift,
  Sparkles,
  Tag,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  PauseCircle,
  Inbox,
  RotateCcw,
  Receipt,
  Printer,
  AlertTriangle,
  Lock,
  PackageSearch,
  Coins,
  CornerDownLeft,
  Clock,
  Hash,
  CircleSlash,
  Loader2,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";
import {
  NUM,
  CURRENCY,
  fmt,
  fmt0,
  cur,
  Money,
  ItemToken,
  Kbd,
  SectionLabel,
  StatusChip,
  Modal,
  Toast,
  useToast,
  useAnchoredPos,
  useEscClose,
  Field,
  TextInput,
  Textarea,
  NumberInput,
  Segmented,
  Checkbox,
  CashCount,
  emptyCounts,
  cashTotal,
  type CashCounts,
  PRIMARY_BTN,
  GHOST_BTN,
  SUBTLE_BTN,
  DANGER_BTN,
  Spinner,
} from "./PosKit";

// ════════════════════════════════════════════════════════════════════════════
// POS · TERMINAL  (the live checkout — ring up a sale)
//
// Primary action = assemble a cart and take payment. The page is a RINGING
// workspace, not a list or a form:
//   • A session bar          identity + running float/sales + terminal controls.
//   • A wide ring column      the scan/search field (live results) + the cart.
//   • A money rail            customer + loyalty + the live totals breakdown +
//                             the one editable discount + cart operations.
//   • A docked charge bar     the always-visible Amount-due + Charge commit.
//
// Everything is LIVE: any edit to a cart line, the manual discount, the
// customer, or a loyalty redemption runs ONE recompute pass (computeSale) that
// re-derives every per-line tax and every total, and re-runs promotion matching
// (which injects locked "free" scheme lines). Transient flows — item picker,
// customer select, payment, park / held carts, returns, session close — are
// overlays that feed results back into this state.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE DATA  (Bizak Nepal · NPR · a coherent retail/trade catalogue)
// ════════════════════════════════════════════════════════════════════════════

type Price = { label: string; rate: number };
type Product = {
  id: string;
  name: string;
  code: string;
  unit: string;
  rate: number;
  taxable: boolean;
  taxRate: number;
  prices?: Price[];
};

const VAT = 13;
const CATALOG: Product[] = [
  { id: "P-RICE25", name: "Basmati Rice 25kg", code: "8901001", unit: "bag", rate: 3450, taxable: false, taxRate: 0 },
  { id: "P-OIL5", name: "Sunflower Oil 5L", code: "8901002", unit: "jar", rate: 1480, taxable: true, taxRate: VAT, prices: [{ label: "Retail", rate: 1480 }, { label: "Wholesale", rate: 1390 }, { label: "Bulk (12+)", rate: 1340 }] },
  { id: "P-FLOUR", name: "Wheat Flour 10kg", code: "8901003", unit: "bag", rate: 920, taxable: false, taxRate: 0 },
  { id: "P-SUGAR", name: "Refined Sugar 1kg", code: "8901004", unit: "pkt", rate: 118, taxable: false, taxRate: 0 },
  { id: "P-LENTIL", name: "Red Lentils 1kg", code: "8901005", unit: "pkt", rate: 210, taxable: false, taxRate: 0 },
  { id: "P-TEA", name: "Ilam Tea 500g", code: "8901006", unit: "box", rate: 365, taxable: true, taxRate: VAT },
  { id: "P-NOODLE", name: "Instant Noodles", code: "8901007", unit: "pcs", rate: 25, taxable: true, taxRate: VAT },
  { id: "P-BISCUIT", name: "Cream Biscuits Pack", code: "8901008", unit: "pack", rate: 95, taxable: true, taxRate: VAT },
  { id: "P-SOAP", name: "Bath Soap Bar", code: "8901009", unit: "pcs", rate: 72, taxable: true, taxRate: VAT },
  { id: "P-DETER", name: "Detergent Powder 1kg", code: "8901010", unit: "pkt", rate: 245, taxable: true, taxRate: VAT, prices: [{ label: "Retail", rate: 245 }, { label: "Wholesale", rate: 228 }] },
  { id: "P-PASTE", name: "Toothpaste 150g", code: "8901011", unit: "pcs", rate: 165, taxable: true, taxRate: VAT },
  { id: "P-SHAMP", name: "Shampoo 200ml", code: "8901012", unit: "pcs", rate: 285, taxable: true, taxRate: VAT },
  { id: "P-WATER", name: "Mineral Water 1L", code: "8901013", unit: "pcs", rate: 35, taxable: true, taxRate: VAT },
  { id: "P-CEMENT", name: "Portland Cement OPC", code: "8901014", unit: "bag", rate: 980, taxable: true, taxRate: VAT },
  { id: "P-BULB", name: "LED Bulb 9W", code: "8901015", unit: "pcs", rate: 145, taxable: true, taxRate: VAT },
  { id: "P-NOTE", name: "Notebook A4 200pg", code: "8901016", unit: "pcs", rate: 88, taxable: false, taxRate: 0 },
];
const CATALOG_BY_CODE = Object.fromEntries(CATALOG.map((p) => [p.code, p]));

// ── promotion schemes (automatic; the operator never authors these here) ──
const CEMENT_CODE = "8901014";
const SCHEME_BILL_THRESHOLD = 20000;
const SCHEME_BILL_PCT = 3;

// ── customers (category discount + loyalty balance) ──
type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  tier: string;
  categoryPct: number;
  points: number;
};
const CUSTOMERS: Customer[] = [
  { id: "M-2041", name: "Sunita Rai", phone: "+977 98510 22041", address: "Baluwatar, Kathmandu", tier: "Gold", categoryPct: 5, points: 1240 },
  { id: "M-2088", name: "Bikash Shrestha", phone: "+977 98410 55088", address: "Pulchowk, Lalitpur", tier: "Silver", categoryPct: 3, points: 560 },
  { id: "M-2102", name: "Anita Gurung", phone: "+977 98010 71102", address: "Lakeside, Pokhara", tier: "Platinum", categoryPct: 8, points: 3120 },
  { id: "M-2150", name: "Ramesh Thapa", phone: "+977 98610 09150", address: "Dharan, Sunsari", tier: "Bronze", categoryPct: 0, points: 80 },
  { id: "M-2173", name: "Pooja Maharjan", phone: "+977 98450 33173", address: "Kirtipur, Kathmandu", tier: "Silver", categoryPct: 3, points: 740 },
  { id: "M-2210", name: "Dipendra Karki", phone: "+977 98020 88210", address: "Itahari, Sunsari", tier: "Gold", categoryPct: 5, points: 1605 },
];

// ── loyalty: marginal tiered points → cash (greedy by highest band) ──
const LOYALTY_BANDS = [
  { upTo: 500, rate: 0.7 },
  { upTo: 1000, rate: 0.85 },
  { upTo: Infinity, rate: 1.0 },
];
function convertPoints(points: number): number {
  let remaining = points;
  let cash = 0;
  let prev = 0;
  for (const b of LOYALTY_BANDS) {
    if (remaining <= 0) break;
    const bandSize = b.upTo - prev;
    const take = Math.min(remaining, bandSize);
    cash += take * b.rate;
    remaining -= take;
    prev = b.upTo;
  }
  return Math.round(cash);
}

// ── prior POS invoices (for the sales-return flow) ──
type InvoiceLine = { name: string; code: string; unit: string; qty: number; rate: number; taxable: boolean; free?: boolean };
type Invoice = { id: string; customer: string; dateLabel: string; lines: InvoiceLine[] };
const PRIOR_INVOICES: Invoice[] = [
  {
    id: "INV-0614-019", customer: "Bikash Shrestha", dateLabel: "Today · 11:42",
    lines: [
      { name: "Sunflower Oil 5L", code: "8901002", unit: "jar", qty: 2, rate: 1480, taxable: true },
      { name: "Refined Sugar 1kg", code: "8901004", unit: "pkt", qty: 4, rate: 118, taxable: false },
      { name: "Detergent Powder 1kg", code: "8901010", unit: "pkt", qty: 3, rate: 245, taxable: true },
    ],
  },
  {
    id: "INV-0613-204", customer: "Walk-in", dateLabel: "Yesterday · 18:05",
    lines: [
      { name: "Portland Cement OPC", code: "8901014", unit: "bag", qty: 12, rate: 980, taxable: true },
      { name: "Portland Cement OPC (free)", code: "8901014", unit: "bag", qty: 2, rate: 0, taxable: false, free: true },
    ],
  },
  {
    id: "INV-0613-188", customer: "Anita Gurung", dateLabel: "Yesterday · 16:20",
    lines: [
      { name: "Shampoo 200ml", code: "8901012", unit: "pcs", qty: 3, rate: 285, taxable: true },
      { name: "Bath Soap Bar", code: "8901009", unit: "pcs", qty: 6, rate: 72, taxable: true },
    ],
  },
];

// ── session ──
const SESSION = {
  id: "POS-0614-03",
  counter: "Counter 01 · Front Desk",
  shift: "Morning · 08:00–16:00",
  float: 15000,
  cashier: "Manas Singh",
};

// ── held carts ──
type HeldCart = { id: string; label: string; value: number; age: string; items: number; lines: CartLine[] };

// ════════════════════════════════════════════════════════════════════════════
// CART MODEL + THE SINGLE RECOMPUTE PASS
// ════════════════════════════════════════════════════════════════════════════

type CartLine = {
  uid: string;
  productId: string;
  name: string;
  code: string;
  unit: string;
  rate: number;
  qty: number;
  discount: number; // flat per-line discount
  taxable: boolean;
  taxRate: number;
};

type FreeLine = { uid: string; name: string; code: string; unit: string; qty: number; scheme: string };

type LineCalc = CartLine & { gross: number; disc: number; lineBase: number; lineTax: number; net: number };

type Sale = {
  freeLines: FreeLine[];
  computed: LineCalc[];
  subtotal: number;
  itemDiscount: number;
  afterItem: number;
  categoryPct: number;
  categoryDiscount: number;
  schemeDiscount: number;
  manualDisc: number;
  loyaltyDisc: number;
  billDiscount: number;
  tax: number;
  effTaxPct: number;
  amountDue: number;
};

let _uid = 0;
const newUid = () => `ln-${(++_uid).toString(36)}`;

function computeSale(lines: CartLine[], customer: Customer | null, manualDiscount: number, loyaltyCash: number): Sale {
  // ── promotion engine: free scheme lines from cart contents ──
  const freeLines: FreeLine[] = [];
  const cementQty = lines.filter((l) => l.code === CEMENT_CODE).reduce((s, l) => s + l.qty, 0);
  const freeCement = Math.floor(cementQty / 6);
  if (freeCement > 0) {
    freeLines.push({ uid: "free-cement", name: "Portland Cement OPC", code: CEMENT_CODE, unit: "bag", qty: freeCement, scheme: "Buy 6 get 1 free" });
  }

  // ── per-line item-level ──
  let subtotal = 0;
  let itemDiscount = 0;
  const base = lines.map((l) => {
    const gross = l.qty * l.rate;
    const disc = Math.min(Math.max(0, l.discount || 0), gross); // clamp: never exceed gross
    subtotal += gross;
    itemDiscount += disc;
    return { ...l, gross, disc, lineBase: gross - disc };
  });
  const afterItem = subtotal - itemDiscount;

  // ── bill-level discounts ──
  const categoryPct = customer?.categoryPct ?? 0;
  const categoryDiscount = Math.round((afterItem * categoryPct) / 100);
  let schemeDiscount = 0;
  if (afterItem - categoryDiscount >= SCHEME_BILL_THRESHOLD) {
    schemeDiscount = Math.round((afterItem * SCHEME_BILL_PCT) / 100);
  }
  const manualCap = Math.max(0, afterItem - categoryDiscount - schemeDiscount);
  const manualDisc = Math.min(Math.max(0, manualDiscount || 0), manualCap);
  const loyaltyCap = Math.max(0, afterItem - categoryDiscount - schemeDiscount - manualDisc);
  const loyaltyDisc = Math.min(Math.max(0, loyaltyCash || 0), loyaltyCap);
  const billDiscount = categoryDiscount + schemeDiscount + manualDisc + loyaltyDisc;

  // ── distribute bill-level discount proportionally before per-line tax ──
  let tax = 0;
  const computed: LineCalc[] = base.map((l) => {
    const share = afterItem > 0 ? l.lineBase / afterItem : 0;
    const lineBill = billDiscount * share;
    const taxableAmt = Math.max(0, l.lineBase - lineBill);
    const lineTax = l.taxable ? (taxableAmt * l.taxRate) / 100 : 0;
    tax += lineTax;
    return { ...l, lineTax: Math.round(lineTax), net: l.lineBase - lineBill + lineTax };
  });
  tax = Math.round(tax);
  const taxedBase = afterItem - billDiscount;
  const effTaxPct = taxedBase > 0 ? (tax / taxedBase) * 100 : 0;
  const amountDue = Math.max(0, afterItem - billDiscount + tax);

  return {
    freeLines, computed, subtotal, itemDiscount, afterItem,
    categoryPct, categoryDiscount, schemeDiscount, manualDisc, loyaltyDisc,
    billDiscount, tax, effTaxPct, amountDue,
  };
}

// seed an in-progress cart so every state (lines, free line, totals, customer,
// loyalty) is visible on arrival; Void clears it to the empty placeholder.
function seedCart(): CartLine[] {
  return [
    { uid: newUid(), productId: "P-CEMENT", name: "Portland Cement OPC", code: "8901014", unit: "bag", rate: 980, qty: 12, discount: 0, taxable: true, taxRate: VAT },
    { uid: newUid(), productId: "P-OIL5", name: "Sunflower Oil 5L", code: "8901002", unit: "jar", rate: 1480, qty: 3, discount: 120, taxable: true, taxRate: VAT },
    { uid: newUid(), productId: "P-RICE25", name: "Basmati Rice 25kg", code: "8901001", unit: "bag", rate: 3450, qty: 2, discount: 0, taxable: false, taxRate: 0 },
    { uid: newUid(), productId: "P-TEA", name: "Ilam Tea 500g", code: "8901006", unit: "box", rate: 365, qty: 4, discount: 0, taxable: true, taxRate: VAT },
  ];
}

// a held cart stores a real line snapshot; its badge value is the cart's own
// (customer-independent) total via computeSale — so resuming restores exactly
// what the held-list showed.
function heldFrom(id: string, label: string, age: string, lines: CartLine[]): HeldCart {
  const s = computeSale(lines, null, 0, 0);
  return { id, label, value: s.amountDue, age, items: lines.length + s.freeLines.length, lines };
}
const HELD_SEED: HeldCart[] = [
  heldFrom("HOLD-7", "Mr. Tamang — wholesale", "12 min ago", [
    { uid: newUid(), productId: "P-OIL5", name: "Sunflower Oil 5L", code: "8901002", unit: "jar", rate: 1390, qty: 6, discount: 0, taxable: true, taxRate: VAT },
    { uid: newUid(), productId: "P-DETER", name: "Detergent Powder 1kg", code: "8901010", unit: "pkt", rate: 228, qty: 8, discount: 0, taxable: true, taxRate: VAT },
    { uid: newUid(), productId: "P-FLOUR", name: "Wheat Flour 10kg", code: "8901003", unit: "bag", rate: 920, qty: 4, discount: 0, taxable: false, taxRate: 0 },
  ]),
  heldFrom("HOLD-6", "Counter pickup #204", "31 min ago", [
    { uid: newUid(), productId: "P-WATER", name: "Mineral Water 1L", code: "8901013", unit: "pcs", rate: 35, qty: 12, discount: 0, taxable: true, taxRate: VAT },
    { uid: newUid(), productId: "P-BISCUIT", name: "Cream Biscuits Pack", code: "8901008", unit: "pack", rate: 95, qty: 6, discount: 0, taxable: true, taxRate: VAT },
  ]),
];

// ════════════════════════════════════════════════════════════════════════════
// LOCAL ATOMS
// ════════════════════════════════════════════════════════════════════════════

function QtyStepper({ qty, onChange, locked }: { qty: number; onChange: (q: number) => void; locked?: boolean }) {
  if (locked) {
    return <span className={cn("inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-bz-sm bg-bz-paper-warm px-2 text-[12.5px] font-medium text-bz-text-muted", NUM)}>{fmt0(qty)}</span>;
  }
  return (
    <div className="inline-flex items-center rounded-bz-sm border border-bz-line-soft bg-bz-surface">
      <button onClick={() => onChange(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="flex size-7 items-center justify-center rounded-l-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
        <Minus size={12} />
      </button>
      <input
        inputMode="numeric"
        value={String(qty)}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d]/g, "");
          onChange(v === "" ? 1 : Math.max(1, Number(v)));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); onChange(qty + 1); }
          if (e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(1, qty - 1)); }
        }}
        className={cn("h-7 w-9 border-x border-bz-line-soft bg-transparent text-center text-[12.5px] font-medium text-bz-text outline-none focus:bg-bz-paper-warm/60", NUM)}
      />
      <button onClick={() => onChange(qty + 1)} aria-label="Increase quantity" className="flex size-7 items-center justify-center rounded-r-bz-sm text-bz-text-muted hover:bg-bz-paper-warm">
        <Plus size={12} />
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SESSION BAR  identity + running figures + terminal controls
// ════════════════════════════════════════════════════════════════════════════

function SessionBar({
  sales, onShortcuts, onClose, onExit,
}: {
  sales: number;
  onShortcuts: () => void;
  onClose: () => void;
  onExit: () => void;
}) {
  return (
    <header className="border-b border-bz-line bg-bz-paper px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-fire">
              <ScanLine size={17} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={cn("text-[15px] font-semibold tracking-tight text-bz-text", NUM)}>{SESSION.id}</h1>
                <StatusChip label="Session open" tone="positive" />
              </div>
              <p className="text-[11px] text-bz-text-muted">{SESSION.counter} · {SESSION.cashier}</p>
            </div>
          </div>

          <div className="hidden items-center gap-5 border-l border-bz-line-soft pl-5 sm:flex">
            <Figure label="Opening float" value={SESSION.float} />
            <Figure label="Sales so far" value={sales} accent />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={onShortcuts} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm">
            <Keyboard size={13} /> <span className="hidden md:inline">Shortcuts</span> <Kbd>?</Kbd>
          </button>
          <button onClick={onClose} className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm">
            <Power size={13} /> <span className="hidden sm:inline">Close session</span>
          </button>
          <button onClick={onExit} className="flex size-8 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm" aria-label="Exit terminal">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Figure({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1">
        <span className="text-[10px] font-semibold text-bz-text-muted">{CURRENCY}</span>
        <span className={cn("text-[15px] font-semibold leading-none text-bz-text", NUM)}>{fmt0(value)}</span>
        {accent && <span className="ml-0.5 size-1.5 rounded-bz-pill bg-bz-fire" />}
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCAN / SEARCH  barcode + catalog search · live results · context-sensitive Enter
// ════════════════════════════════════════════════════════════════════════════

function ScanSearch({
  inputRef, onAdd, onBrowse, onPayShortcut, cartCount,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onAdd: (p: Product, rate?: number) => void;
  onBrowse: (seed: string) => void;
  onPayShortcut: () => void;
  cartCount: number;
}) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState<Product[]>([]);
  const [hi, setHi] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // debounced "fetch"
  React.useEffect(() => {
    const query = q.trim().toLowerCase();
    if (!query) { setResults([]); setOpen(false); setSearching(false); return; }
    setSearching(true);
    setOpen(true);
    const t = window.setTimeout(() => {
      const r = CATALOG.filter((p) => p.name.toLowerCase().includes(query) || p.code.includes(query)).slice(0, 7);
      setResults(r);
      setHi(0);
      setSearching(false);
    }, 240);
    return () => window.clearTimeout(t);
  }, [q]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (p: Product) => { onAdd(p); setQ(""); setOpen(false); setResults([]); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (results.length) { setOpen(true); setHi((h) => Math.min(h + 1, results.length - 1)); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Escape") { setOpen(false); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const query = q.trim();
      if (!query) {
        // empty field + non-empty cart → proceed to payment
        if (cartCount > 0) onPayShortcut();
        return;
      }
      if (open && results[hi]) { pick(results[hi]); return; }
      // resolve a typed code → exact match, else first name match
      const exact = CATALOG_BY_CODE[query];
      if (exact) { pick(exact); return; }
      const first = CATALOG.find((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.code.includes(query));
      if (first) pick(first);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <ScanLine size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => { if (results.length) setOpen(true); }}
            placeholder="Scan a barcode or search the catalogue…"
            className="h-12 w-full rounded-bz-lg border border-bz-line bg-bz-surface pl-11 pr-24 text-[14px] text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.04)] outline-none placeholder:text-bz-text-soft focus:border-bz-text"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            {searching ? (
              <Spinner size={15} className="text-bz-fire" />
            ) : q ? (
              <button onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear" className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"><X size={13} /></button>
            ) : (
              <Kbd>F2</Kbd>
            )}
          </div>
        </div>
        <button onClick={() => onBrowse(q)} className={cn(GHOST_BTN, "h-12 shrink-0 px-3.5")}>
          <PackageSearch size={15} /> <span className="hidden md:inline">Browse</span>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
          {searching ? (
            <div className="flex items-center justify-center gap-2 py-7 text-bz-text-muted">
              <Spinner size={14} className="text-bz-fire" /> <span className="text-[12px]">Searching the catalogue…</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-8 text-center">
              <Search size={17} className="text-bz-text-soft" />
              <p className="text-[12.5px] font-medium text-bz-text-muted">No items found for “{q}”</p>
              <button onClick={() => onBrowse(q)} className="mt-1 text-[11.5px] font-medium text-bz-text underline-offset-2 hover:underline">Browse the full catalogue</button>
            </div>
          ) : (
            <div className="max-h-[340px] overflow-y-auto py-1">
              {results.map((p, i) => (
                <button
                  key={p.id}
                  onMouseEnter={() => setHi(i)}
                  onClick={() => pick(p)}
                  className={cn("flex w-full items-center gap-3 px-3 py-2 text-left", i === hi ? "bg-bz-paper-warm" : "hover:bg-bz-paper-warm/60")}
                >
                  <ItemToken name={p.name} seed={p.id} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-bz-text">{p.name}</span>
                    <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{p.code} · per {p.unit}{!p.taxable && " · tax-free"}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Money n={p.rate} className="text-[12.5px] font-semibold text-bz-text" />
                  </span>
                  {i === hi && <CornerDownLeft size={13} className="shrink-0 text-bz-text-soft" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CART  the editable working set (heart of the page)
// ════════════════════════════════════════════════════════════════════════════

function CartLineRow({
  calc, flash, onQty, onDisc, onRemove,
}: {
  calc: LineCalc;
  flash: boolean;
  onQty: (q: number) => void;
  onDisc: (d: number | undefined) => void;
  onRemove: () => void;
}) {
  return (
    <div className={cn("px-3 py-2.5 transition-colors md:px-4", flash && "bg-bz-fire/[0.08]")}>
      <div className="flex items-start gap-3">
        <ItemToken name={calc.name} seed={calc.productId} size={36} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-bz-text">{calc.name}</p>
              <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>
                {calc.code} · {CURRENCY} {fmt(calc.rate)}/{calc.unit}{!calc.taxable && " · tax-free"}
              </p>
            </div>
            <button onClick={onRemove} aria-label={`Remove ${calc.name}`} className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]">
              <Trash2 size={13} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <QtyStepper qty={calc.qty} onChange={onQty} />
            <label className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">Disc</span>
              <NumberInput value={calc.discount || undefined} onChange={(v) => onDisc(v)} placeholder="0" prefix={CURRENCY} size="sm" align="right" max={calc.gross} className="w-[104px]" />
            </label>
            {calc.taxable ? (
              <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10px] font-medium text-bz-text-muted", NUM)}>{calc.taxRate}% VAT</span>
            ) : (
              <span className="text-[10.5px] text-bz-text-soft">Tax-free</span>
            )}
            <span className="ml-auto text-right">
              {calc.disc > 0 && <span className={cn("mr-2 text-[11px] text-bz-text-soft line-through", NUM)}>{fmt(calc.gross)}</span>}
              <Money n={calc.lineBase} className="text-[13.5px] font-semibold text-bz-text" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FreeLineRow({ line }: { line: FreeLine }) {
  return (
    <div className="bg-bz-fire/[0.05] px-3 py-2.5 md:px-4">
      <div className="flex items-center gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-fire/[0.25] text-bz-text">
          <Gift size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-medium text-bz-text">{line.name}</p>
            <span className="inline-flex items-center gap-1 rounded-bz-sm bg-bz-fire px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-bz-olive">Free</span>
          </div>
          <p className="text-[10.5px] text-bz-text-muted">Scheme · {line.scheme}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-bz-sm bg-bz-fire/[0.18] px-2 text-[12.5px] font-medium text-bz-text", NUM)}>{fmt0(line.qty)} {line.unit}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-soft"><Lock size={11} /></span>
          <Money n={0} className="w-[68px] text-right text-[13.5px] font-semibold text-bz-leaf-deep" />
        </div>
      </div>
    </div>
  );
}

function EmptyCart({ onFocus, onBrowse }: { onFocus: () => void; onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-bz-xl bg-bz-paper-warm text-bz-text-muted">
        <ScanLine size={26} />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-bz-text">The cart is empty</p>
        <p className="mt-1 max-w-xs text-[12px] text-bz-text-muted">Scan a barcode, search the catalogue, or browse items to start ringing up this sale.</p>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <button onClick={onFocus} className={cn(PRIMARY_BTN, "h-8")}><Search size={13} /> Scan or search</button>
        <button onClick={onBrowse} className={cn(GHOST_BTN, "h-8")}><PackageSearch size={13} /> Browse</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MONEY RAIL  customer · loyalty · totals breakdown · cart operations
// ════════════════════════════════════════════════════════════════════════════

function CustomerCard({
  customer, onAttach, onRedeem, onClearLoyalty, loyaltyActive,
}: {
  customer: Customer | null;
  onAttach: () => void;
  onRedeem: () => void;
  onClearLoyalty: () => void;
  loyaltyActive: boolean;
}) {
  if (!customer) {
    return (
      <button onClick={onAttach} className="group flex w-full items-center gap-3 rounded-bz-lg border border-dashed border-bz-line bg-bz-paper-warm/40 px-3.5 py-3 text-left hover:border-bz-text hover:bg-bz-paper-warm/70">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted group-hover:text-bz-text">
          <UserPlus size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-bz-text">Add a customer</p>
          <p className="text-[11px] text-bz-text-muted">Attach a member to apply category pricing & loyalty.</p>
        </div>
        <ChevronRight size={14} className="shrink-0 text-bz-text-soft" />
      </button>
    );
  }
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire/30 text-[12px] font-semibold text-bz-text">
          {customer.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-semibold text-bz-text">{customer.name}</p>
            <span className="shrink-0 rounded-bz-sm bg-bz-leaf/50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-bz-text">{customer.tier}</span>
          </div>
          <p className={cn("truncate text-[10.5px] text-bz-text-muted", NUM)}>{customer.id} · {customer.phone}</p>
        </div>
        <button onClick={onAttach} className="shrink-0 text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Change</button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-bz-md bg-bz-paper-warm/60 px-2.5 py-2">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">Category</p>
          <p className={cn("mt-0.5 text-[12.5px] font-semibold text-bz-text", NUM)}>{customer.categoryPct > 0 ? `${customer.categoryPct}% off` : "Standard"}</p>
        </div>
        <div className="rounded-bz-md bg-bz-paper-warm/60 px-2.5 py-2">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">Loyalty points</p>
          <p className={cn("mt-0.5 text-[12.5px] font-semibold text-bz-text", NUM)}>{fmt0(customer.points)}</p>
        </div>
      </div>

      {customer.points > 0 && (
        loyaltyActive ? (
          <button onClick={onClearLoyalty} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-bz-md border border-bz-line-soft px-3 py-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm">
            <X size={12} /> Remove loyalty redemption
          </button>
        ) : (
          <button onClick={onRedeem} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-bz-md bg-bz-fire/[0.16] px-3 py-1.5 text-[11.5px] font-semibold text-bz-text hover:bg-bz-fire/[0.28]">
            <Coins size={13} className="text-bz-leaf-deep" /> Redeem points
          </button>
        )
      )}
    </div>
  );
}

function SummaryRow({
  label, value, sub, deduction, strong, editable,
}: {
  label: React.ReactNode;
  value?: number;
  sub?: string;
  deduction?: boolean;
  strong?: boolean;
  editable?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-[5px]">
      <span className={cn("flex items-baseline gap-1.5 text-[12px]", strong ? "font-semibold text-bz-text" : "text-bz-text-muted")}>
        {label}
        {sub && <span className={cn("text-[10px] text-bz-text-soft", NUM)}>{sub}</span>}
      </span>
      {editable ?? (
        <span className={cn("text-[12.5px]", NUM, deduction ? "font-medium text-[#9A2E29]" : strong ? "font-semibold text-bz-text" : "text-bz-text")}>
          {deduction ? "−" : ""}{CURRENCY} {fmt(Math.abs(value ?? 0))}
        </span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

type OverlayKind = null | "items" | "customer" | "payment" | "park" | "held" | "return" | "close" | "shortcuts" | "redeem";

export function PosTerminalDesignPage() {
  const navigate = useNavigate();
  const { toast, show, clear } = useToast();
  const searchRef = React.useRef<HTMLInputElement>(null);

  const initialCart = React.useMemo(() => seedCart(), []);
  const [lines, setLines] = React.useState<CartLine[]>(initialCart);
  const [customer, setCustomer] = React.useState<Customer | null>(CUSTOMERS[0]);
  const [manualDiscount, setManualDiscount] = React.useState(0);
  const [loyaltyCash, setLoyaltyCash] = React.useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = React.useState(0);
  const [sales, setSales] = React.useState(84250);
  const [overlay, setOverlay] = React.useState<OverlayKind>(null);
  const [browseSeed, setBrowseSeed] = React.useState("");
  const [flashUid, setFlashUid] = React.useState<string | null>(null);
  // the most-recently-added line — drives the "+" shortcut (falls back to the
  // last line in the cart, so "+" works on the seeded cart from first load).
  const [lastUid, setLastUid] = React.useState<string | null>(initialCart[initialCart.length - 1]?.uid ?? null);
  const [held, setHeld] = React.useState<HeldCart[]>(HELD_SEED);

  const sale = React.useMemo(() => computeSale(lines, customer, manualDiscount, loyaltyCash), [lines, customer, manualDiscount, loyaltyCash]);
  const cartCount = lines.length + sale.freeLines.length;
  const closeOverlay = () => setOverlay(null);

  // ── mutations ──
  const addProduct = React.useCallback((p: Product, rate?: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id && l.rate === (rate ?? p.rate));
      if (existing) {
        setFlashUid(existing.uid);
        setLastUid(existing.uid);
        return prev.map((l) => (l.uid === existing.uid ? { ...l, qty: l.qty + 1 } : l));
      }
      const uid = newUid();
      setFlashUid(uid);
      setLastUid(uid);
      return [...prev, { uid, productId: p.id, name: p.name, code: p.code, unit: p.unit, rate: rate ?? p.rate, qty: 1, discount: 0, taxable: p.taxable, taxRate: p.taxRate }];
    });
  }, []);

  React.useEffect(() => {
    if (!flashUid) return;
    const t = window.setTimeout(() => setFlashUid(null), 900);
    return () => window.clearTimeout(t);
  }, [flashUid]);

  const setQty = (uid: string, qty: number) => setLines((prev) => prev.map((l) => (l.uid === uid ? { ...l, qty } : l)));
  const setDisc = (uid: string, d: number | undefined) => setLines((prev) => prev.map((l) => (l.uid === uid ? { ...l, discount: d ?? 0 } : l)));
  const removeLine = (uid: string) => {
    setLines((prev) => prev.filter((l) => l.uid !== uid));
    setLastUid((cur2) => (cur2 === uid ? null : cur2));
  };

  const voidCart = () => {
    if (lines.length === 0) { show("error", "Nothing to void — the cart is already empty."); return; }
    setLines([]);
    setManualDiscount(0);
    setLoyaltyCash(0);
    setLoyaltyPoints(0);
    setLastUid(null);
    show("info", "Cart voided.");
  };

  // "+" bumps the most-recently-added line; with none tracked it targets the
  // last line in the cart, so it works on the seeded cart even from an empty
  // search field.
  const incLast = () => {
    if (lines.length === 0) return;
    const target = lines.find((l) => l.uid === lastUid) ?? lines[lines.length - 1];
    setLines((prev) => prev.map((l) => (l.uid === target.uid ? { ...l, qty: l.qty + 1 } : l)));
    setFlashUid(target.uid);
    setLastUid(target.uid);
  };

  const onCloseSession = () => {
    if (lines.length > 0) { show("error", "Finish or park the cart before closing the session."); return; }
    setOverlay("close");
  };

  const completeSale = (total: number) => {
    setSales((s) => s + total);
    setLines([]);
    setManualDiscount(0);
    setLoyaltyCash(0);
    setLoyaltyPoints(0);
    setLastUid(null);
    closeOverlay();
    show("success", `Sale complete · ${cur(total)} · invoice saved.`);
  };

  const parkCart = (label: string) => {
    const snapshot = lines;
    const s = computeSale(snapshot, null, 0, 0);
    const id = `HOLD-${8 + held.length}`;
    setHeld((h) => [{ id, label, value: s.amountDue, age: "just now", items: snapshot.length + s.freeLines.length, lines: snapshot }, ...h]);
    setLines([]);
    setManualDiscount(0);
    setLoyaltyCash(0);
    setLoyaltyPoints(0);
    setLastUid(null);
    closeOverlay();
    show("success", `Cart parked as “${label}”.`);
  };

  const resumeHeld = (h: HeldCart) => {
    setLines(h.lines);
    setCustomer(null);
    setManualDiscount(0);
    setLoyaltyCash(0);
    setLoyaltyPoints(0);
    setLastUid(h.lines[h.lines.length - 1]?.uid ?? null);
    setHeld((prev) => prev.filter((x) => x.id !== h.id));
    closeOverlay();
    show("success", `Resumed “${h.label}”.`);
  };

  const applyLoyalty = (points: number) => {
    // cap to the same pre-tax base computeSale clamps to, so the toast never
    // announces more than is actually applied
    const cap = Math.max(0, sale.afterItem - sale.categoryDiscount - sale.schemeDiscount - sale.manualDisc);
    const cash = Math.min(convertPoints(points), cap);
    setLoyaltyPoints(points);
    setLoyaltyCash(cash);
    closeOverlay();
    show("success", `Redeemed ${fmt0(points)} points · ${cur(cash)} off.`);
  };

  // ── global keyboard command layer (context-aware) ──
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "Escape") { setOverlay(null); return; }
      if (typing) return; // single-key chords never hijack ordinary typing
      if (overlay) return;
      const k = e.key.toLowerCase();
      if (e.key === "F2" || e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      else if (k === "+" || k === "=") { e.preventDefault(); incLast(); }
      else if (k === "p") { if (lines.length) setOverlay("park"); }
      else if (k === "v") { voidCart(); }
      else if (k === "h") { setOverlay("held"); }
      else if (k === "r") { setOverlay("return"); }
      else if (k === "c") { setOverlay("customer"); }
      else if (k === "?") { setOverlay("shortcuts"); }
      else if (e.key === "Enter") { if (lines.length) setOverlay("payment"); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, lines.length, lastUid]);

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Point of Sale</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Terminal</span>
        </>
      }
      overlay={
        <>
          <ChargeBar amountDue={sale.amountDue} cartCount={cartCount} disabled={lines.length === 0} onCharge={() => setOverlay("payment")} />
          <Toast toast={toast} onDismiss={clear} />
        </>
      }
    >
      <SessionBar sales={sales} onShortcuts={() => setOverlay("shortcuts")} onClose={onCloseSession} onExit={() => navigate("/design/pos-session")} />

      <div className="grid grid-cols-1 gap-4 px-4 pb-28 pt-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_392px]">
        {/* ── ring column ── */}
        <div className="min-w-0">
          <ScanSearch
            inputRef={searchRef}
            onAdd={addProduct}
            onBrowse={(seed) => { setBrowseSeed(seed); setOverlay("items"); }}
            onPayShortcut={() => lines.length && setOverlay("payment")}
            cartCount={lines.length}
          />

          <div className="mt-4 overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface">
            <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft bg-bz-paper-warm/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <SectionLabel>Current cart</SectionLabel>
                <span className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-bz-pill bg-bz-deep px-1.5 text-[10.5px] font-semibold text-bz-paper", NUM)}>{cartCount}</span>
              </div>
              {lines.length > 0 && (
                <button onClick={voidCart} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-bz-text-muted hover:text-[#9A2E29]">
                  <Trash2 size={12} /> Void cart
                </button>
              )}
            </div>

            {cartCount === 0 ? (
              <EmptyCart onFocus={() => searchRef.current?.focus()} onBrowse={() => { setBrowseSeed(""); setOverlay("items"); }} />
            ) : (
              <div className="divide-y divide-bz-line-soft">
                {sale.computed.map((c) => (
                  <CartLineRow
                    key={c.uid}
                    calc={c}
                    flash={flashUid === c.uid}
                    onQty={(q) => setQty(c.uid, q)}
                    onDisc={(d) => setDisc(c.uid, d)}
                    onRemove={() => removeLine(c.uid)}
                  />
                ))}
                {sale.freeLines.map((f) => <FreeLineRow key={f.uid} line={f} />)}
              </div>
            )}
          </div>
        </div>

        {/* ── money rail ── */}
        <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <div className="flex flex-col gap-4">
            <CustomerCard
              customer={customer}
              onAttach={() => setOverlay("customer")}
              onRedeem={() => setOverlay("redeem")}
              onClearLoyalty={() => { setLoyaltyCash(0); setLoyaltyPoints(0); show("info", "Loyalty redemption removed."); }}
              loyaltyActive={loyaltyCash > 0}
            />

            {/* totals breakdown */}
            <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
              <SectionLabel className="mb-1">Summary</SectionLabel>
              <div className="divide-y divide-bz-line-soft/70">
                <div className="py-1">
                  <SummaryRow label="Gross" value={sale.subtotal} />
                  {sale.itemDiscount > 0 && <SummaryRow label="Item discounts" value={sale.itemDiscount} deduction />}
                </div>
                <div className="py-1">
                  {sale.categoryDiscount > 0 && <SummaryRow label="Category discount" sub={`${sale.categoryPct}%`} value={sale.categoryDiscount} deduction />}
                  {sale.schemeDiscount > 0 && (
                    <SummaryRow
                      label={<span className="inline-flex items-center gap-1.5"><Sparkles size={11} className="text-bz-leaf-deep" /> Scheme discount</span>}
                      sub={`${SCHEME_BILL_PCT}%`}
                      value={sale.schemeDiscount}
                      deduction
                    />
                  )}
                  {/* the one editable entry among the totals */}
                  <SummaryRow
                    label={<span className="inline-flex items-center gap-1.5"><Tag size={11} className="text-bz-text-muted" /> Bill discount</span>}
                    sub={sale.manualDisc > 0 && sale.afterItem > 0 ? `${((sale.manualDisc / sale.afterItem) * 100).toFixed(1)}%` : undefined}
                    editable={
                      <div className="w-[116px]">
                        <NumberInput value={manualDiscount || undefined} onChange={(v) => setManualDiscount(v ?? 0)} placeholder="0" prefix={CURRENCY} size="sm" align="right" max={sale.afterItem - sale.categoryDiscount - sale.schemeDiscount} />
                      </div>
                    }
                  />
                  {sale.loyaltyDisc > 0 && (
                    <SummaryRow
                      label={<span className="inline-flex items-center gap-1.5"><Coins size={11} className="text-bz-leaf-deep" /> Loyalty</span>}
                      sub={`${fmt0(loyaltyPoints)} pts`}
                      value={sale.loyaltyDisc}
                      deduction
                    />
                  )}
                </div>
                {sale.tax > 0 && (
                  <div className="py-1">
                    <SummaryRow label="VAT" sub={`${sale.effTaxPct.toFixed(1)}% eff.`} value={sale.tax} />
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-end justify-between gap-3 border-t border-bz-line pt-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-bz-text-muted">Amount due</span>
                <Money n={sale.amountDue} className="text-[22px] font-semibold leading-none text-bz-text" symbolClassName="text-[12px]" />
              </div>
            </div>

            {/* cart operations */}
            <div className="grid grid-cols-2 gap-2">
              <OpButton icon={PauseCircle} label="Park / hold" hint="P" onClick={() => { if (lines.length) setOverlay("park"); else show("error", "Nothing to park yet."); }} />
              <OpButton icon={Inbox} label="Held carts" hint="H" badge={held.length} onClick={() => setOverlay("held")} />
              <OpButton icon={RotateCcw} label="Return" hint="R" onClick={() => setOverlay("return")} />
              <OpButton icon={Trash2} label="Void" hint="V" danger onClick={voidCart} />
            </div>
          </div>
        </aside>
      </div>

      {/* ── overlays ── */}
      <ItemPicker open={overlay === "items"} seed={browseSeed} onClose={closeOverlay} onAdd={(p, rate) => addProduct(p, rate)} />
      <CustomerPicker open={overlay === "customer"} current={customer} onClose={closeOverlay} onPick={(c) => { setCustomer(c); setLoyaltyCash(0); setLoyaltyPoints(0); closeOverlay(); show("success", `${c.name} attached · ${c.categoryPct}% category, ${fmt0(c.points)} pts.`); }} />
      <RedeemModal open={overlay === "redeem"} customer={customer} payable={Math.max(0, sale.afterItem - sale.categoryDiscount - sale.schemeDiscount - sale.manualDisc)} onClose={closeOverlay} onApply={applyLoyalty} />
      <ParkModal open={overlay === "park"} amount={sale.amountDue} onClose={closeOverlay} onPark={parkCart} />
      <HeldCartsModal open={overlay === "held"} held={held} onClose={closeOverlay} onResume={resumeHeld} onDelete={(id) => { setHeld((h) => h.filter((x) => x.id !== id)); show("info", "Parked cart discarded."); }} />
      <ReturnModal open={overlay === "return"} onClose={closeOverlay} onCommit={(net) => { closeOverlay(); show("success", `Credit memo saved · ${cur(net)} returned.`); }} />
      <PaymentModal open={overlay === "payment"} sale={sale} customer={customer} onClose={closeOverlay} onComplete={completeSale} />
      <SessionCloseModal open={overlay === "close"} sales={sales} onClose={closeOverlay} onConfirm={() => { closeOverlay(); show("success", "Session closed. Routing to a new session…"); window.setTimeout(() => navigate("/design/pos-session"), 900); }} />
      <ShortcutsModal open={overlay === "shortcuts"} onClose={closeOverlay} />
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED CHARGE BAR  (overlay slot — always-visible primary action)
// ════════════════════════════════════════════════════════════════════════════

function ChargeBar({ amountDue, cartCount, disabled, onCharge }: { amountDue: number; cartCount: number; disabled: boolean; onCharge: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-bz-line bg-bz-paper px-4 py-3 md:px-6">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">Amount due · {cartCount} {cartCount === 1 ? "line" : "lines"}</p>
        <Money n={amountDue} className="text-[20px] font-semibold leading-tight text-bz-text" symbolClassName="text-[11px]" />
      </div>
      <button onClick={onCharge} disabled={disabled} className="inline-flex h-12 items-center gap-2 rounded-bz-lg bg-bz-deep px-5 text-[14px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40">
        <Wallet size={17} className="text-bz-fire" />
        Charge {!disabled && <span className="hidden sm:inline">{cur(amountDue)}</span>}
        <span className="hidden items-center gap-1 border-l border-bz-text-on-dark/15 pl-2 text-[11px] font-normal text-bz-text-on-dark-soft sm:inline-flex">
          <CornerDownLeft size={12} /> Enter
        </span>
      </button>
    </div>
  );
}

function OpButton({ icon: Icon, label, hint, badge, danger, onClick }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; hint: string; badge?: number; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2.5 rounded-bz-lg border bg-bz-surface px-3 py-2.5 text-left transition-colors",
        danger ? "border-bz-line-soft hover:border-[#E7B9B3] hover:bg-[#FBE7E5]" : "border-bz-line-soft hover:border-bz-line hover:bg-bz-paper-warm/60",
      )}
    >
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-bz-md", danger ? "bg-[#FBE7E5] text-[#9A2E29]" : "bg-bz-paper-warm text-bz-text-muted")}>
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium text-bz-text">{label}</span>
        <span className="text-[10px] text-bz-text-soft">Shortcut <span className="font-semibold">{hint}</span></span>
      </span>
      {badge !== undefined && badge > 0 && (
        <span className={cn("absolute right-2 top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill bg-bz-fire px-1 text-[9.5px] font-bold text-bz-olive", NUM)}>{badge}</span>
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · ITEM PICKER  (catalog browser — search · paginate · price choice)
// ════════════════════════════════════════════════════════════════════════════

const PICK_PAGE = 8;
function ItemPicker({ open, seed, onClose, onAdd }: { open: boolean; seed: string; onClose: () => void; onAdd: (p: Product, rate?: number) => void }) {
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [shown, setShown] = React.useState(PICK_PAGE);
  const [priceFor, setPriceFor] = React.useState<Product | null>(null);

  React.useEffect(() => {
    if (open) { setQ(seed); setPriceFor(null); setShown(PICK_PAGE); setLoading(true); const t = window.setTimeout(() => setLoading(false), 420); return () => window.clearTimeout(t); }
  }, [open, seed]);

  const query = q.trim().toLowerCase();
  const filtered = query ? CATALOG.filter((p) => p.name.toLowerCase().includes(query) || p.code.includes(query)) : CATALOG;
  const visible = filtered.slice(0, shown);

  return (
    <Modal open={open} onClose={onClose} title="Browse catalogue" subtitle="Search, then add an item. Items with multiple prices ask which to use." icon={PackageSearch} width={620} bodyClassName="p-0">
      <div className="border-b border-bz-line-soft p-3">
        <div className="flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
          <Search size={14} className="text-bz-text-muted" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or barcode…" className="flex-1 bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-muted" />
          <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{filtered.length}</span>
        </div>
      </div>

      {priceFor ? (
        <div className="p-4">
          <button onClick={() => setPriceFor(null)} className="mb-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"><ChevronLeft size={13} /> Back to results</button>
          <div className="mb-3 flex items-center gap-3">
            <ItemToken name={priceFor.name} seed={priceFor.id} size={40} />
            <div>
              <p className="text-[13.5px] font-semibold text-bz-text">{priceFor.name}</p>
              <p className={cn("text-[11px] text-bz-text-soft", NUM)}>{priceFor.code} · per {priceFor.unit}</p>
            </div>
          </div>
          <SectionLabel className="mb-2">Choose a price level</SectionLabel>
          <div className="flex flex-col gap-2">
            {priceFor.prices!.map((pr) => (
              <button key={pr.label} onClick={() => { onAdd(priceFor, pr.rate); onClose(); }} className="flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft px-3 py-2.5 text-left hover:border-bz-text hover:bg-bz-paper-warm/50">
                <span className="text-[12.5px] font-medium text-bz-text">{pr.label}</span>
                <Money n={pr.rate} className="text-[13px] font-semibold text-bz-text" />
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-bz-text-muted">
          <Spinner size={15} className="text-bz-fire" /> <span className="text-[12.5px]">Loading catalogue…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Search size={18} className="text-bz-text-soft" />
          <p className="text-[12.5px] font-medium text-bz-text-muted">No items match “{q}”.</p>
        </div>
      ) : (
        <div className="max-h-[52vh] overflow-y-auto p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {visible.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface p-2.5">
                <ItemToken name={p.name} seed={p.id} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-bz-text">{p.name}</p>
                  <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{p.code} · {CURRENCY} {fmt(p.rate)}{p.prices ? " +" : ""}</p>
                </div>
                <button
                  onClick={() => (p.prices ? setPriceFor(p) : (onAdd(p), onClose()))}
                  className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-deep text-bz-paper hover:opacity-90"
                  aria-label={`Add ${p.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
          {visible.length < filtered.length && (
            <button onClick={() => setShown((s) => s + PICK_PAGE)} className={cn(GHOST_BTN, "mt-3 w-full")}>
              Load more · {filtered.length - visible.length} remaining
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · CUSTOMER PICKER
// ════════════════════════════════════════════════════════════════════════════

function CustomerPicker({ open, current, onClose, onPick }: { open: boolean; current: Customer | null; onClose: () => void; onPick: (c: Customer) => void }) {
  const [q, setQ] = React.useState("");
  React.useEffect(() => { if (open) setQ(""); }, [open]);
  const query = q.trim().toLowerCase();
  const rows = query ? CUSTOMERS.filter((c) => c.name.toLowerCase().includes(query) || c.phone.includes(query) || c.id.toLowerCase().includes(query)) : CUSTOMERS;
  return (
    <Modal open={open} onClose={onClose} title="Attach customer" subtitle="Apply category pricing and loyalty to this sale." icon={UserRound} width={520}>
      <div className="mb-3 flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
        <Search size={14} className="text-bz-text-muted" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, member ID or phone…" className="flex-1 bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-muted" />
      </div>
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-10 text-center"><Search size={16} className="text-bz-text-soft" /><p className="text-[12px] text-bz-text-muted">No members match “{q}”.</p></div>
      ) : (
        <div className="flex max-h-[46vh] flex-col gap-1.5 overflow-y-auto">
          {rows.map((c) => {
            const selected = current?.id === c.id;
            return (
              <button key={c.id} onClick={() => onPick(c)} className={cn("flex items-center gap-3 rounded-bz-md border px-3 py-2.5 text-left transition-colors", selected ? "border-bz-text bg-bz-fire/[0.06]" : "border-bz-line-soft hover:border-bz-line hover:bg-bz-paper-warm/50")}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire/30 text-[12px] font-semibold text-bz-text">
                  {c.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-bz-text">{c.name}</p>
                    <span className="shrink-0 rounded-bz-sm bg-bz-leaf/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-bz-text">{c.tier}</span>
                  </div>
                  <p className={cn("truncate text-[10.5px] text-bz-text-soft", NUM)}>{c.id} · {c.phone} · {c.address}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("text-[11px] font-semibold text-bz-text", NUM)}>{c.categoryPct}% · {fmt0(c.points)}pt</p>
                </div>
                {selected && <Check size={15} className="shrink-0 text-bz-text" />}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · LOYALTY REDEMPTION
// ════════════════════════════════════════════════════════════════════════════

function RedeemModal({ open, customer, payable, onClose, onApply }: { open: boolean; customer: Customer | null; payable: number; onClose: () => void; onApply: (points: number) => void }) {
  const [points, setPoints] = React.useState<number | undefined>(undefined);
  React.useEffect(() => { if (open && customer) setPoints(Math.min(customer.points, 500)); }, [open, customer]);
  if (!customer) return null;
  const capped = Math.min(points ?? 0, customer.points);
  const cash = Math.min(convertPoints(capped), payable);
  const cashCapped = convertPoints(capped) > payable;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Redeem loyalty points"
      subtitle={`${customer.name} · ${fmt0(customer.points)} points available`}
      icon={Coins}
      width={440}
      footer={
        <>
          <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
          <button onClick={() => onApply(capped)} disabled={capped <= 0 || cash <= 0} className={PRIMARY_BTN}><Check size={14} /> Apply {cur(cash)}</button>
        </>
      }
    >
      <Field label="Points to redeem" hint={`max ${fmt0(customer.points)}`}>
        <NumberInput value={points} onChange={setPoints} placeholder="0" suffix="pts" align="right" max={customer.points} />
      </Field>
      <div className="mt-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] text-bz-text-muted">Converts to</span>
          <Money n={cash} className="text-[16px] font-semibold text-bz-text" />
        </div>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-bz-text-soft">
          Tiered rate · {fmt0(capped)} pts redeemed{cashCapped && <span className="text-[#9A2E29]"> · capped to the amount payable</span>}.
        </p>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · PARK CART  (name capture)
// ════════════════════════════════════════════════════════════════════════════

function ParkModal({ open, amount, onClose, onPark }: { open: boolean; amount: number; onClose: () => void; onPark: (label: string) => void }) {
  const [label, setLabel] = React.useState("");
  React.useEffect(() => { if (open) setLabel(""); }, [open]);
  const valid = label.trim().length > 0;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Park this cart"
      subtitle={`Hold ${cur(amount)} to ring up later. The cart clears once parked.`}
      icon={PauseCircle}
      width={420}
      footer={
        <>
          <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
          <button onClick={() => valid && onPark(label.trim())} disabled={!valid} className={PRIMARY_BTN}><PauseCircle size={14} /> Park cart</button>
        </>
      }
    >
      <Field label="Label this hold" required hint="e.g. customer name or token #">
        <TextInput value={label} onChange={setLabel} placeholder="Mr. Tamang — wholesale" />
      </Field>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · HELD CARTS  (resume / discard)
// ════════════════════════════════════════════════════════════════════════════

function HeldCartsModal({ open, held, onClose, onResume, onDelete }: { open: boolean; held: HeldCart[]; onClose: () => void; onResume: (h: HeldCart) => void; onDelete: (id: string) => void }) {
  const [q, setQ] = React.useState("");
  const [confirm, setConfirm] = React.useState<string | null>(null);
  React.useEffect(() => { if (open) { setQ(""); setConfirm(null); } }, [open]);
  const query = q.trim().toLowerCase();
  const rows = query ? held.filter((h) => h.label.toLowerCase().includes(query) || h.id.toLowerCase().includes(query)) : held;
  const total = rows.reduce((s, h) => s + h.value, 0);
  return (
    <Modal open={open} onClose={onClose} title="Held carts" subtitle="Resume a parked cart, or discard one you no longer need." icon={Inbox} width={520}>
      {held.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Inbox size={22} /></span>
          <p className="text-[13px] font-semibold text-bz-text">No parked carts</p>
          <p className="max-w-xs text-[11.5px] text-bz-text-muted">Carts you park show up here so you can pick them back up anytime during the session.</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
            <Search size={14} className="text-bz-text-muted" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter parked carts…" className="flex-1 bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-muted" />
          </div>
          {rows.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-bz-text-muted">No parked carts match “{q}”.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {rows.map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface p-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><PauseCircle size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-bz-text">{h.label}</p>
                    <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>{h.id} · {h.items} items · <Clock size={9} className="mb-px inline" /> {h.age}</p>
                  </div>
                  <Money n={h.value} className="shrink-0 text-[12.5px] font-semibold text-bz-text" />
                  {confirm === h.id ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => { onDelete(h.id); setConfirm(null); }} className="rounded-bz-sm bg-[#FBE7E5] px-2 py-1 text-[10.5px] font-semibold text-[#9A2E29]">Delete</button>
                      <button onClick={() => setConfirm(null)} className="rounded-bz-sm px-1.5 py-1 text-[10.5px] text-bz-text-muted hover:bg-bz-paper-warm">Keep</button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => onResume(h)} className="inline-flex h-7 items-center gap-1 rounded-bz-sm bg-bz-deep px-2.5 text-[11px] font-semibold text-bz-paper hover:opacity-90">Resume</button>
                      <button onClick={() => setConfirm(h.id)} aria-label="Discard" className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-[#FBE7E5] hover:text-[#9A2E29]"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between border-t border-bz-line-soft pt-2.5">
                <span className={cn("text-[11px] text-bz-text-muted", NUM)}>{rows.length} parked</span>
                <span className="text-[11.5px] text-bz-text-muted">Total held <Money n={total} className="ml-1 font-semibold text-bz-text" /></span>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · SALES RETURN  (find invoice → choose lines → credit memo)
// ════════════════════════════════════════════════════════════════════════════

function ReturnModal({ open, onClose, onCommit }: { open: boolean; onClose: () => void; onCommit: (net: number) => void }) {
  const [stage, setStage] = React.useState<"find" | "lines">("find");
  const [by, setBy] = React.useState<"invoice" | "customer">("invoice");
  const [q, setQ] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [loadingInv, setLoadingInv] = React.useState(false);
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [retQty, setRetQty] = React.useState<Record<number, number>>({});
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { if (open) { setStage("find"); setBy("invoice"); setQ(""); setInvoice(null); setRetQty({}); setReason(""); setSaving(false); } }, [open]);

  const query = q.trim().toLowerCase();
  const matches = PRIOR_INVOICES.filter((inv) => (by === "invoice" ? inv.id.toLowerCase().includes(query) : inv.customer.toLowerCase().includes(query)));

  const openInvoice = (inv: Invoice) => {
    setLoadingInv(true);
    window.setTimeout(() => {
      setInvoice(inv);
      // pre-include free lines whenever a regular line is selected → start empty, sync on edit
      setRetQty({});
      setStage("lines");
      setLoadingInv(false);
    }, 360);
  };

  const setLineQty = (idx: number, qty: number) => {
    setRetQty((prev) => {
      const next = { ...prev, [idx]: qty };
      // free/scheme lines auto-include when a regular line is selected
      if (invoice) {
        const anyRegular = invoice.lines.some((l, i) => !l.free && (next[i] ?? 0) > 0);
        invoice.lines.forEach((l, i) => { if (l.free) next[i] = anyRegular ? l.qty : 0; });
      }
      return next;
    });
  };

  const breakdown = React.useMemo(() => {
    if (!invoice) return { gross: 0, tax: 0, net: 0, count: 0 };
    let gross = 0, tax = 0, count = 0;
    invoice.lines.forEach((l, i) => {
      const q2 = retQty[i] ?? 0;
      if (q2 <= 0) return;
      count += 1;
      const g = q2 * l.rate;
      gross += g;
      if (l.taxable) tax += (g * VAT) / 100;
    });
    return { gross, tax: Math.round(tax), net: Math.round(gross + tax), count };
  }, [invoice, retQty]);

  const selectAll = () => { if (!invoice) return; const next: Record<number, number> = {}; invoice.lines.forEach((l, i) => (next[i] = l.qty)); setRetQty(next); };
  const clearAll = () => setRetQty({});

  const commit = () => {
    setSaving(true);
    window.setTimeout(() => { setSaving(false); onCommit(breakdown.net); }, 700);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sales return"
      subtitle={stage === "find" ? "Find the original POS invoice to credit." : `Returning against ${invoice?.id}`}
      icon={RotateCcw}
      width={600}
      footer={
        stage === "lines" ? (
          <>
            <button onClick={() => setStage("find")} className={GHOST_BTN}><ChevronLeft size={14} /> Back</button>
            <button onClick={commit} disabled={breakdown.count === 0 || saving} className={PRIMARY_BTN}>{saving ? <Spinner size={14} /> : <Check size={14} />} Issue credit · {cur(breakdown.net)}</button>
          </>
        ) : undefined
      }
    >
      {stage === "find" ? (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Segmented value={by} onChange={setBy} options={[{ id: "invoice", label: "By invoice #" }, { id: "customer", label: "By customer" }]} />
          </div>
          <div className="mb-3 flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3">
            <Search size={14} className="text-bz-text-muted" />
            <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setSearching(true); window.setTimeout(() => setSearching(false), 200); }} placeholder={by === "invoice" ? "Search invoice number…" : "Search customer…"} className="flex-1 bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-muted" />
            {searching && <Spinner size={13} className="text-bz-fire" />}
          </div>
          {matches.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-10 text-center"><Receipt size={17} className="text-bz-text-soft" /><p className="text-[12px] text-bz-text-muted">No invoices found for “{q}”.</p></div>
          ) : (
            <div className="flex flex-col gap-2">
              {matches.map((inv) => (
                <button key={inv.id} onClick={() => openInvoice(inv)} disabled={loadingInv} className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface p-2.5 text-left hover:border-bz-text hover:bg-bz-paper-warm/50 disabled:opacity-60">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted"><Receipt size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[12.5px] font-semibold text-bz-text", NUM)}>{inv.id}</p>
                    <p className="truncate text-[10.5px] text-bz-text-soft">{inv.customer} · {inv.dateLabel} · {inv.lines.length} lines</p>
                  </div>
                  {loadingInv ? <Spinner size={14} className="text-bz-fire" /> : <ChevronRight size={15} className="shrink-0 text-bz-text-soft" />}
                </button>
              ))}
            </div>
          )}
        </>
      ) : invoice ? (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] text-bz-text-muted">Choose return quantities (bounded by the original).</p>
            <div className="flex items-center gap-1.5">
              <button onClick={selectAll} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Select all</button>
              <span className="text-bz-line">·</span>
              <button onClick={clearAll} className="text-[11px] font-medium text-bz-text-muted hover:text-bz-text">Clear</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            {invoice.lines.map((l, i) => {
              const q2 = retQty[i] ?? 0;
              const selected = q2 > 0;
              return (
                <div key={i} className={cn("flex items-center gap-3 border-b border-bz-line-soft px-3 py-2.5 last:border-0", selected && "bg-bz-fire/[0.05]", l.free && "opacity-90")}>
                  <Checkbox value={selected} onChange={(v) => setLineQty(i, v ? l.qty : 0)} disabled={l.free} size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-bz-text">{l.name} {l.free && <span className="ml-1 rounded-bz-sm bg-bz-fire px-1 py-0.5 text-[8.5px] font-bold uppercase text-bz-olive">Free</span>}</p>
                    <p className={cn("text-[10.5px] text-bz-text-soft", NUM)}>sold {l.qty} {l.unit} · {CURRENCY} {fmt(l.rate)}</p>
                  </div>
                  {l.free ? (
                    <span className={cn("text-[11px] text-bz-text-soft", NUM)}>{q2}/{l.qty}</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setLineQty(i, Math.max(0, q2 - 1))} className="flex size-6 items-center justify-center rounded-bz-sm border border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm"><Minus size={11} /></button>
                      <span className={cn("w-10 text-center text-[12px] font-medium text-bz-text", NUM)}>{q2}/{l.qty}</span>
                      <button onClick={() => setLineQty(i, Math.min(l.qty, q2 + 1))} className="flex size-6 items-center justify-center rounded-bz-sm border border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm"><Plus size={11} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Reason for return">
              <Textarea value={reason} onChange={setReason} rows={3} placeholder="Damaged, wrong item, customer change of mind…" />
            </Field>
            <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3">
              <SectionLabel className="mb-2">Return total</SectionLabel>
              <div className="flex items-center justify-between py-0.5 text-[12px]"><span className="text-bz-text-muted">Gross</span><span className={cn("text-bz-text", NUM)}>{CURRENCY} {fmt(breakdown.gross)}</span></div>
              <div className="flex items-center justify-between py-0.5 text-[12px]"><span className="text-bz-text-muted">VAT</span><span className={cn("text-bz-text", NUM)}>{CURRENCY} {fmt(breakdown.tax)}</span></div>
              <div className="mt-1 flex items-center justify-between border-t border-bz-line-soft pt-2"><span className="text-[12px] font-semibold text-bz-text">Net credit</span><Money n={breakdown.net} className="text-[15px] font-semibold text-bz-text" /></div>
            </div>
          </div>
        </>
      ) : null}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · PAYMENT  (multiple tenders · change due · save invoice)
// ════════════════════════════════════════════════════════════════════════════

type TenderType = "cash" | "card" | "wallet" | "bank";
const TENDERS: { id: TenderType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Smartphone },
  { id: "bank", label: "Bank", icon: Landmark },
];
type Tender = { id: string; type: TenderType; amount: number };

function PaymentModal({ open, sale, customer, onClose, onComplete }: { open: boolean; sale: Sale; customer: Customer | null; onClose: () => void; onComplete: (total: number) => void }) {
  const [tenders, setTenders] = React.useState<Tender[]>([]);
  const [type, setType] = React.useState<TenderType>("cash");
  const [amount, setAmount] = React.useState<number | undefined>(undefined);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (open) { setTenders([]); setType("cash"); setAmount(sale.amountDue); setSaving(false); setError(null); }
  }, [open, sale.amountDue]);

  const tendered = tenders.reduce((s, t) => s + t.amount, 0);
  const remaining = Math.max(0, sale.amountDue - tendered);
  const change = Math.max(0, tendered - sale.amountDue);
  const settled = tendered >= sale.amountDue && sale.amountDue > 0;

  const addTender = () => {
    const amt = amount ?? 0;
    if (amt <= 0) { setError("Enter a tender amount."); return; }
    setTenders((t) => [...t, { id: `t-${++idRef.current}`, type, amount: amt }]);
    setError(null);
    const newRemaining = Math.max(0, sale.amountDue - (tendered + amt));
    setAmount(newRemaining > 0 ? newRemaining : undefined);
  };

  const save = () => {
    if (!settled) { setError("Collect the full amount due before saving."); return; }
    setSaving(true);
    setError(null);
    window.setTimeout(() => { setSaving(false); onComplete(sale.amountDue); }, 850);
  };

  const TypeIcon = TENDERS.find((t) => t.id === type)!.icon;

  return (
    <Modal open={open} onClose={onClose} title="Take payment" subtitle={customer ? `${customer.name} · split across as many tenders as you need` : "Walk-in sale · split across as many tenders as you need"} icon={Wallet} width={560}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* left: tender entry */}
        <div>
          <SectionLabel className="mb-2">Add a tender</SectionLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {TENDERS.map((t) => {
              const active = t.id === type;
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setType(t.id)} className={cn("flex flex-col items-center gap-1 rounded-bz-md border py-2 text-[10.5px] font-medium transition-colors", active ? "border-bz-text bg-bz-fire/[0.10] text-bz-text" : "border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm")}>
                  <Icon size={15} className={active ? "text-bz-text" : "text-bz-text-soft"} />
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <NumberInput value={amount} onChange={setAmount} prefix={CURRENCY} align="right" placeholder="0.00" />
            <button onClick={addTender} className={cn(PRIMARY_BTN, "shrink-0 px-3")}><Plus size={14} /> Add</button>
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <button onClick={() => setAmount(remaining)} className="rounded-bz-sm bg-bz-paper-warm px-2 py-1 text-[10.5px] font-medium text-bz-text-muted hover:bg-bz-line/40">Exact {cur(remaining)}</button>
          </div>

          {tenders.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {tenders.map((t) => {
                const Icon = TENDERS.find((x) => x.id === t.type)!.icon;
                return (
                  <div key={t.id} className="flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-1.5">
                    <Icon size={13} className="text-bz-text-muted" />
                    <span className="flex-1 text-[12px] capitalize text-bz-text">{t.type}</span>
                    <Money n={t.amount} className="text-[12px] font-semibold text-bz-text" />
                    <button onClick={() => setTenders((arr) => arr.filter((x) => x.id !== t.id))} aria-label="Remove tender" className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text"><X size={11} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* right: live summary */}
        <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 p-3.5">
          <div className="flex items-center justify-between py-1 text-[12px]"><span className="text-bz-text-muted">Amount due</span><Money n={sale.amountDue} className="font-semibold text-bz-text" /></div>
          <div className="flex items-center justify-between py-1 text-[12px]"><span className="text-bz-text-muted">Tendered</span><span className={cn("text-bz-text", NUM)}>{CURRENCY} {fmt(tendered)}</span></div>
          <div className="my-1.5 h-px bg-bz-line-soft" />
          {change > 0 ? (
            <div className="flex items-center justify-between py-1"><span className="text-[12px] font-semibold text-bz-text">Change due</span><Money n={change} className="text-[16px] font-semibold text-bz-leaf-deep" /></div>
          ) : (
            <div className="flex items-center justify-between py-1"><span className="text-[12px] font-semibold text-bz-text">Remaining</span><Money n={remaining} className="text-[16px] font-semibold text-bz-text" /></div>
          )}
          <div className="mt-2">
            {settled ? <StatusChip label="Fully tendered" tone="positive" /> : <StatusChip label="Awaiting full payment" tone="pending" />}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-bz-text-soft">
            <Receipt size={12} className="mt-px shrink-0" /> Saving distributes bill-level discounts across lines and recomputes per-line VAT before posting the invoice.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-bz-md bg-[#FBE7E5] px-3 py-2 text-[11.5px] font-medium text-[#9A2E29]">
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-bz-line-soft pt-3">
        <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
        <button className={SUBTLE_BTN} disabled={!settled || saving} onClick={save}><Printer size={14} /> Save & print</button>
        <button onClick={save} disabled={!settled || saving} className={PRIMARY_BTN}>{saving ? <Spinner size={14} /> : <Check size={14} />} {saving ? "Saving…" : "Save invoice"}</button>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · SESSION CLOSE  (cash reconciliation · variance · remarks gate)
// ════════════════════════════════════════════════════════════════════════════

const VARIANCE_THRESHOLD = 500;
function SessionCloseModal({ open, sales, onClose, onConfirm }: { open: boolean; sales: number; onClose: () => void; onConfirm: () => void }) {
  const [mode, setMode] = React.useState<"total" | "count">("total");
  const [closingTotal, setClosingTotal] = React.useState<number | undefined>(undefined);
  const [counts, setCounts] = React.useState<CashCounts>(emptyCounts());
  const [remarks, setRemarks] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const returns = 1840; // session returns so far

  React.useEffect(() => { if (open) { setMode("total"); setClosingTotal(undefined); setCounts(emptyCounts()); setRemarks(""); setSubmitting(false); } }, [open]);

  const expected = SESSION.float + sales - returns;
  const closing = mode === "total" ? (closingTotal ?? 0) : cashTotal(counts);
  const variance = closing - expected;
  const overThreshold = Math.abs(variance) > VARIANCE_THRESHOLD;
  const remarksNeeded = overThreshold && remarks.trim().length === 0;
  const canSubmit = closing > 0 && !remarksNeeded;

  const submit = () => {
    setSubmitting(true);
    window.setTimeout(() => { setSubmitting(false); onConfirm(); }, 800);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Close session"
      subtitle={`Reconcile the drawer for ${SESSION.id} before closing.`}
      icon={Power}
      width={560}
      footer={
        <>
          <button onClick={onClose} className={GHOST_BTN}>Cancel</button>
          <button onClick={submit} disabled={!canSubmit || submitting} className={PRIMARY_BTN}>{submitting ? <Spinner size={14} /> : <Power size={14} />} {submitting ? "Closing…" : "Close session"}</button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        <Stat3 label="Opening float" value={SESSION.float} />
        <Stat3 label="Cash sales" value={sales} />
        <Stat3 label="Returns" value={returns} deduct />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <SectionLabel>Count closing cash</SectionLabel>
        <Segmented value={mode} onChange={setMode} size="sm" options={[{ id: "total", label: "Single figure" }, { id: "count", label: "Count drawer" }]} />
      </div>

      <div className="mt-2">
        {mode === "total" ? (
          <Field label="Closing cash in drawer" required>
            <NumberInput value={closingTotal} onChange={setClosingTotal} prefix={CURRENCY} align="right" placeholder="0.00" />
          </Field>
        ) : (
          <CashCount counts={counts} onChange={setCounts} />
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm/40 px-3 py-2.5">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">Expected</p>
          <Money n={expected} dp={0} className="mt-0.5 text-[15px] font-semibold text-bz-text" />
        </div>
        <div className={cn("rounded-bz-md border px-3 py-2.5", overThreshold ? "border-[#E7B9B3] bg-[#FBE7E5]" : "border-bz-line-soft bg-bz-paper-warm/40")}>
          <p className={cn("text-[9.5px] font-semibold uppercase tracking-[0.08em]", overThreshold ? "text-[#9A2E29]" : "text-bz-text-soft")}>Variance</p>
          <p className={cn("mt-0.5 text-[15px] font-semibold", NUM, variance === 0 ? "text-bz-text" : overThreshold ? "text-[#9A2E29]" : "text-bz-text")}>
            {variance > 0 ? "+" : variance < 0 ? "−" : ""}{CURRENCY} {fmt0(Math.abs(variance))}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <Field label="Remarks" required={overThreshold} hint={overThreshold ? "required — variance over threshold" : "optional"}>
          <Textarea value={remarks} onChange={setRemarks} rows={2} placeholder={overThreshold ? "Explain the cash variance…" : "Notes about this session…"} />
        </Field>
        {remarksNeeded && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A2E29]"><AlertTriangle size={11} /> A remark is required to close with a variance over {cur(VARIANCE_THRESHOLD, 0)}.</p>
        )}
      </div>
    </Modal>
  );
}

function Stat3({ label, value, deduct }: { label: string; value: number; deduct?: boolean }) {
  return (
    <div className="rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-bz-text-soft">{label}</p>
      <p className={cn("mt-0.5 text-[13px] font-semibold", NUM, deduct ? "text-[#9A2E29]" : "text-bz-text")}>{deduct ? "−" : ""}{CURRENCY} {fmt0(value)}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERLAY · SHORTCUTS HELP
// ════════════════════════════════════════════════════════════════════════════

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["F2"], label: "Focus scan / search" },
  { keys: ["Enter"], label: "Charge (when search is empty)" },
  { keys: ["+"], label: "Add one of the last item" },
  { keys: ["P"], label: "Park / hold the cart" },
  { keys: ["H"], label: "Open held carts" },
  { keys: ["R"], label: "Start a sales return" },
  { keys: ["C"], label: "Change customer" },
  { keys: ["V"], label: "Void the cart" },
  { keys: ["?"], label: "Toggle this help" },
  { keys: ["Esc"], label: "Dismiss any overlay" },
];

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" subtitle="Ring up faster — most actions have a single-key chord." icon={Keyboard} width={440}>
      <div className="flex flex-col gap-1">
        {SHORTCUTS.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 rounded-bz-md px-2.5 py-2 hover:bg-bz-paper-warm/50">
            <span className="text-[12.5px] text-bz-text">{s.label}</span>
            <span className="flex items-center gap-1">{s.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
