import * as React from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, Boxes, ChevronDown, ImageOff, MoreHorizontal, Package } from "lucide-react";
import { cn } from "../../ui/utils";
import { BTN, Chip, GHOST_SM, ICON_BTN, LABEL, MenuItem, MenuSep, NUM, Popover, Select, Stat, Statline } from "../../sales/bzw";
import type { SelectOption } from "../../sales/bzw";
import { Block, RecordShell } from "../../sales/record";
import type { PanelCtx } from "../../sales/DocDesk";
import { CopyText, Failed, Grid, InlineField, Retry, Source } from "../kit";
import type { GridColumn, InlineValue } from "../kit";
import { CATEGORIES, PRICE_LEVELS } from "../seed/items";
import type { Item } from "../seed/items";
import { actionsFor, useItemActions } from "./actions";
import type { ActionDef } from "./actions";
import {
  ME,
  OPEN_LABEL,
  accountsMissing,
  availableOf,
  baseCode,
  childrenOf,
  codeTakenBy,
  duplicateCode,
  effImage,
  effLedger,
  effRate,
  isStock,
  isTemplate,
  isVariant,
  latency,
  ledgerName,
  ledgersFor,
  locationName,
  missingBarcodes,
  money,
  negText,
  openCounts,
  openLinesOf,
  orgName,
  patchItem,
  qty,
  relTime,
  restoreItem,
  shortDate,
  signed,
  stockIn,
  taxName,
  taxOptions,
  templateOf,
  typeText,
  unitName,
  useBaseCode,
  useFlag,
  useItems,
  valuesText,
  worstLocation,
} from "./model";

// ════════════════════════════════════════════════════════════════════════════
// THE PEEK (spec §3.2) — the item docked beside its list: for reading and
// one-field fixes. The head is the desk record head (RecordShell); ⤢ opens the
// record page. Six fields edit in place (InlineField: Enter commits that ONE
// field as a PATCH, Esc cancels, blur never saves) and toast an Undo; type,
// unit, costing, accounts and tracking are read here, with Page ↗ beside.
// Everything comes from ONE read (B-I2) — its loading and failure are per
// block, never a spinner over the whole panel.
// ════════════════════════════════════════════════════════════════════════════

/** The summary read's state (B-I2): `?slow=1` shows its first read, `?sumfail=1` its failure. */
export function useSummary(id: string) {
  const slow = useFlag("slow");
  const fail = useFlag("sumfail");
  const [state, setState] = React.useState<"loading" | "ok" | "failed">(slow ? "loading" : fail ? "failed" : "ok");
  React.useEffect(() => {
    if (!slow) return;
    setState("loading");
    const t = window.setTimeout(() => setState(fail ? "failed" : "ok"), 1100);
    return () => window.clearTimeout(t);
  }, [id, slow, fail]);
  const retry = () => {
    setState("loading");
    window.setTimeout(() => setState("ok"), 700);
  };
  return { loading: state === "loading", failed: state === "failed", retry };
}

/** The item's picture tile: the template's for a variant; a missing file says so. */
export function ItemImage({ state, size = 16 }: { state: "set" | "missing" | null; size?: number }) {
  if (state === "missing")
    return (
      <span title="Image file is missing." className="flex size-full items-center justify-center text-bz-text-soft">
        <ImageOff size={size} aria-label="Image file is missing." />
      </span>
    );
  if (state === "set")
    return (
      <span className="flex size-full items-center justify-center bg-bz-leaf/60 text-bz-text" aria-label="Item image">
        <Package size={size} />
      </span>
    );
  return <Boxes size={size} aria-label="No image" />;
}

/** The skeleton ink of a block that is still being read. */
export function SkeletonLines({ n = 3 }: { n?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="h-2.5 animate-pulse rounded-bz-pill bg-bz-line-soft" style={{ width: `${70 - i * 12}%` }} />
      ))}
    </div>
  );
}

/** Scroll a block into the peek's own scroller (scrollIntoView would move the frame too). */
function scrollBlock(el: HTMLElement | null) {
  const root = el?.closest<HTMLElement>(".overflow-y-auto");
  if (!el || !root) return;
  root.scrollTo({ top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 8, behavior: "smooth" });
}

/** The primary quick action and its ▾ (the other documents it can start). Shared with the page head. */
export function PrimaryAction({ item, actions, size = "sm" }: { item: Item; actions: ActionDef[]; size?: "sm" | "md" }) {
  const { run } = useItemActions();
  const mainRef = React.useRef<HTMLButtonElement>(null);
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const docs = actions.filter((a) => a.key === "order" || a.key === "invoice" || a.key === "estimate");
  const primary = docs[0] ?? actions.find((a) => a.key === "po") ?? null;
  if (!primary) return null;
  const rest = docs.slice(1);
  const h = size === "sm" ? "h-8" : "h-9";
  return (
    <span className="inline-flex shrink-0">
      <button ref={mainRef} type="button" className={cn(BTN, h, rest.length && "rounded-r-none")} onClick={(e) => run(primary.key, item, e.currentTarget)}>
        <primary.icon size={13} /> {primary.label}
      </button>
      {rest.length > 0 && (
        <>
          <button ref={moreRef} type="button" className={cn(BTN, h, "w-7 rounded-l-none border-l border-l-bz-primary-ink/25 px-0")} onClick={() => setOpen(true)} title="Other documents" aria-label="Other documents">
            <ChevronDown size={13} />
          </button>
          <Popover open={open} anchor={moreRef.current} onClose={() => setOpen(false)} align="right" width={200}>
            {rest.map((a) => (
              <MenuItem key={a.key} icon={a.icon} onClick={() => (setOpen(false), run(a.key, item, mainRef.current))}>
                {a.label}
              </MenuItem>
            ))}
          </Popover>
        </>
      )}
    </span>
  );
}

/** The ⋯ list: every action not already a button. */
export function ActionsMenu({ item, actions, close }: { item: Item; actions: ActionDef[]; close: () => void }) {
  const { run } = useItemActions();
  const groups: ActionDef["key"][][] = [
    ["order", "invoice", "estimate", "po"],
    ["receive", "adjust", "transfer", "movements", "labels"],
    ["duplicate", "archive", "restore", "delete"],
  ];
  const shown = groups.map((g) => actions.filter((a) => g.includes(a.key))).filter((g) => g.length);
  return (
    <>
      {shown.map((g, i) => (
        <React.Fragment key={i}>
          {i > 0 && <MenuSep />}
          {g.map((a) => (
            <MenuItem key={a.key} icon={a.icon} danger={a.danger} onClick={() => (close(), run(a.key, item, null))}>
              {a.label}
            </MenuItem>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

/** Which two actions sit beside the primary as buttons — the rest are in ⋯. */
const secondaryOf = (actions: ActionDef[]) => {
  const order: ActionDef["key"][] = ["adjust", "movements", "po", "labels", "duplicate"];
  const primaryKey = actions.find((a) => a.key === "order")?.key ?? actions.find((a) => a.key === "po")?.key;
  return order.filter((k) => k !== primaryKey).map((k) => actions.find((a) => a.key === k)).filter((a): a is ActionDef => !!a).slice(0, 2);
};

const CATEGORY_OPTS: SelectOption[] = [{ value: "", label: "Uncategorised" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.name }))];

export function ItemPeek({ item, ctx, org, viewOnly, onOpenPage }: { item: Item; ctx: PanelCtx; org: string; viewOnly: boolean; onOpenPage: (section?: string) => void }) {
  const all = useItems();
  const navigate = useNavigate();
  const { run } = useItemActions();
  const code = useBaseCode(org);
  const summary = useSummary(item.id);
  const [stockOrg, setStockOrg] = React.useState(org);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const firstField = React.useRef<HTMLButtonElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const section = React.useRef<string | undefined>(undefined);

  const tpl = isTemplate(item);
  const variant = isVariant(item);
  const parent = templateOf(all, item);
  const stock = isStock(item) && !tpl;
  const actions = actionsFor(all, item, org, !viewOnly);
  const secondary = item.archived ? [] : secondaryOf(actions);
  const avail = availableOf(all, item, org);
  const sell = effRate(all, item, "sales_rate");
  const buy = effRate(all, item, "purchase_rate");
  const open = openCounts(item);
  const worst = worstLocation(item, org);
  const kids = tpl ? childrenOf(all, item.id).filter((c) => !c.archived) : [];

  // The page opens at the section the peek was showing (Prices → #prices).
  React.useEffect(() => {
    const root = bodyRef.current?.closest<HTMLElement>(".overflow-y-auto");
    if (!root) return;
    const on = () => {
      const top = root.getBoundingClientRect().top + 24;
      let cur: string | undefined;
      root.querySelectorAll<HTMLElement>("[data-peek-sec]").forEach((el) => {
        if (el.getBoundingClientRect().top <= top) cur = el.dataset.peekSec;
      });
      section.current = cur;
    };
    root.addEventListener("scroll", on, { passive: true });
    return () => root.removeEventListener("scroll", on);
  }, []);

  // E first inline field · C copy code · . actions · ⇧↵ the page — never while typing or with a dialog up.
  const keyRef = React.useRef({ item, onOpenPage, viewOnly });
  keyRef.current = { item, onOpenPage, viewOnly };
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const a = document.activeElement as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (a && (["INPUT", "TEXTAREA", "SELECT"].includes(a.tagName) || a.isContentEditable)) return;
      if (document.querySelector("[data-bzw-dialog], [data-bzw-popover], [data-bzw-sheet], [data-bzw-editing]")) return;
      const { item: it, onOpenPage: page, viewOnly: vo } = keyRef.current;
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        page(section.current);
      } else if ((e.key === "e" || e.key === "E") && !vo) {
        e.preventDefault();
        firstField.current?.click();
      } else if ((e.key === "c" || e.key === "C") && it.code) {
        e.preventDefault();
        navigator.clipboard?.writeText(it.code).catch(() => {});
        ctx.show("success", "Copied");
      } else if (e.key === ".") {
        e.preventDefault();
        setMoreOpen(true);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** One field → one PATCH (B-I3); refusal sentences come back verbatim and keep the typed value. */
  const commit = (key: keyof Item, label: string) => async (v: InlineValue): Promise<string | null> => {
    let value: unknown = v;
    if (key === "sales_rate" || key === "purchase_rate") {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n) || n < 0) return "A price is 0 or more.";
      value = n;
    }
    if (key === "reorder") {
      if (v === null || v === "") value = null;
      else {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0) return "Enter a number above 0.";
        value = n;
      }
    }
    if (key === "code") {
      const t = String(v ?? "").trim();
      if (t.length > 500) return "Keep the code under 500 characters.";
      const taken = codeTakenBy(all, t, item.id);
      if (taken) return `Code already used by ${taken.name}.`;
      value = t || null;
    }
    if (key === "category_id") value = v ? String(v) : null;
    await latency();
    const extra: Partial<Item> = key === "tax_id" ? { tax_id: v ? String(v) : null, taxable: !!v } : { [key]: value };
    const before = patchItem(item.id, extra);
    ctx.show(
      "success",
      `${label} saved`,
      before ? { label: "Undo", run: () => restoreItem({ ...before, history: before.history }) } : undefined,
      8000,
    );
    return null;
  };

  const chips = (
    <>
      {tpl && <Chip tone="neutral" dot={false}>Template</Chip>}
      {item.archived && <Chip tone="neutral" dot={false}>Archived</Chip>}
      {accountsMissing(all, item) && <Chip tone="danger">Needs accounts</Chip>}
      {duplicateCode(all, item) && <Chip tone="danger" title="Another item holds this code">Duplicate code</Chip>}
      {viewOnly && <Chip tone="neutral" dot={false}>View only</Chip>}
    </>
  );

  const blocks = React.useRef<Record<string, HTMLElement | null>>({});
  const at = (k: string) => (el: HTMLElement | null) => {
    blocks.current[k] = el;
  };

  const facts = (() => {
    const f: { key: string; label: string; value: React.ReactNode; sub?: string; danger?: boolean; title?: string; onOpen?: () => void }[] = [];
    if (tpl) {
      const rates = kids.map((k) => effRate(all, k, "sales_rate").value).filter((n) => n > 0);
      const lo = Math.min(...rates, sell.value);
      const hi = Math.max(...rates, sell.value);
      f.push({ key: "variants", label: "Variants", value: kids.length, onOpen: () => scrollBlock(blocks.current.variants) });
      f.push({ key: "avail", label: "Available", value: negText(avail ?? 0), sub: (avail ?? 0) < 0 ? "neg" : undefined, danger: (avail ?? 0) < 0, onOpen: () => scrollBlock(blocks.current.variants) });
      f.push({ key: "sell", label: "Sell", value: lo === hi ? money(hi) : `${money(lo)}–${money(hi)}`, onOpen: () => scrollBlock(blocks.current.prices) });
      f.push({ key: "bc", label: "Missing barcodes", value: missingBarcodes(all, item), danger: missingBarcodes(all, item) > 0, onOpen: () => onOpenPage("variants") });
      return f;
    }
    if (stock) {
      f.push({
        key: "avail",
        label: "Available",
        value: avail === null ? "—" : negText(avail),
        sub: avail !== null && avail < 0 ? "neg" : undefined,
        danger: avail !== null && avail < 0,
        title: worst ? `More went out than came in at ${worst.name}.` : "On hand less committed, all locations",
        onOpen: () => scrollBlock(blocks.current.stock),
      });
      f.push({ key: "order", label: "On order", value: open.onOrder ? qty(open.onOrder) : "—", onOpen: () => scrollBlock(blocks.current.open) });
      f.push({ key: "cost", label: "Unit cost", value: item.unit_cost ? money(item.unit_cost) : "—", title: "Inventory valuation", onOpen: () => ctx.show("info", "Inventory valuation opens (report)") });
      f.push({ key: "sell", label: "Sell", value: sell.value ? money(sell.value) : "—", onOpen: () => scrollBlock(blocks.current.prices) });
      f.push({ key: "reorder", label: "Reorder at", value: item.reorder === null ? "—" : qty(item.reorder), danger: item.reorder !== null && avail !== null && avail < item.reorder, onOpen: () => scrollBlock(blocks.current.setup) });
      return f;
    }
    f.push({ key: "sell", label: "Sell", value: sell.value ? money(sell.value) : "—", onOpen: () => scrollBlock(blocks.current.prices) });
    f.push({ key: "buy", label: "Buy", value: buy.value ? money(buy.value) : "—", onOpen: () => scrollBlock(blocks.current.prices) });
    if (item.sold_30d) f.push({ key: "sold", label: "Sold 30 days", value: qty(item.sold_30d.qty), sub: money(item.sold_30d.amount) });
    f.push({ key: "open", label: "Open orders", value: open.deliver + open.invoice || "—", onOpen: () => scrollBlock(blocks.current.open) });
    return f;
  })();

  const stockRows = stockIn(item, stockOrg);
  const variantCols: GridColumn<Item>[] = [
    { key: "values", label: "Values", width: "minmax(0,0.9fr)", kind: "readonly", render: (r) => <span className="text-bz-text">{valuesText(all, r)}</span> },
    { key: "code", label: "Code", width: "minmax(0,1.5fr)", kind: "readonly", render: (r) => <span className="text-bz-text-muted">{r.code ?? "—"}</span> },
    { key: "available", label: "Available", width: "88px", kind: "readonly", align: "right", render: (r) => { const a = availableOf(all, r, org) ?? 0; return <span className={a < 0 ? "font-semibold text-bz-red" : undefined}>{negText(a)}{a < 0 && " neg"}</span>; } },
    { key: "price", label: "Price", width: "88px", kind: "readonly", align: "right", muted: (r) => effRate(all, r, "sales_rate").value === item.sales_rate, render: (r) => money(effRate(all, r, "sales_rate").value) },
  ];

  const ledgerLine = ledgersFor(item.type, item.sub_type).map((n) => {
    const e = effLedger(all, item, n.kind);
    return (
      <div key={n.kind} className="flex min-w-0 items-baseline justify-between gap-3 py-0.5">
        <span className="shrink-0 text-bz-text-muted">{n.label.replace(" account", "")}</span>
        {e.value ? (
          <span className="flex min-w-0 items-baseline gap-1.5 truncate text-right">
            <span className={e.source === "template" ? "text-bz-text-soft" : "text-bz-text"}>{ledgerName(e.value)}</span>
            {e.source === "template" && <Source kind="inherited" from="from template" />}
          </span>
        ) : (
          <Source kind="missing" text={n.refuse} />
        )}
      </div>
    );
  });

  const unit = unitName(item.unit_id);
  return (
    <RecordShell
      ctx={ctx}
      no=""
      chips={chips}
      image={<ItemImage state={effImage(all, item)} />}
      title={item.name}
      meta={[
        item.code ? <CopyText key="c" text={item.code} onCopied={() => ctx.show("success", "Copied")} /> : <span key="c" className="text-bz-text-soft">No code</span>,
        typeText(item),
        stock || (tpl && isStock(item)) ? item.costing ?? "FIFO" : null,
        unit,
      ]}
      menu={(close) => <ActionsMenu item={item} actions={actions} close={close} />}
      onFullPage={() => onOpenPage(section.current)}
    >
      <div ref={bodyRef}>
        {variant && parent && (
          <div className="border-b border-bz-line-soft bg-bz-paper-warm px-5 py-2 text-[12px] text-bz-text">
            Variant of{" "}
            <button type="button" className="font-semibold underline decoration-bz-line underline-offset-2 hover:decoration-bz-text-soft" onClick={() => ctx.go(parent.id)}>
              {parent.name}
            </button>
            <span className="text-bz-text-muted"> · {valuesText(all, item)}</span>
          </div>
        )}
        {item.archived && (
          <div className="flex items-center gap-3 border-b border-bz-line-soft bg-bz-paper-warm px-5 py-2 text-[12px] text-bz-text">
            Archived — hidden from pickers.
            {!viewOnly && (
              <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => run("restore", item)}>
                Restore
              </button>
            )}
          </div>
        )}

        {/* Quick actions: one primary, two secondary, the rest in More (and the head's ⋯). */}
        <div className="flex flex-wrap items-center gap-2 px-5 pt-3.5">
          {!item.archived && <PrimaryAction item={item} actions={actions} />}
          {secondary.map((a) => (
            <button key={a.key} type="button" className={GHOST_SM} onClick={(e) => run(a.key, item, e.currentTarget)}>
              <a.icon size={12} /> {a.label.replace("View movements", "Movements")}
            </button>
          ))}
          <button ref={moreRef} type="button" className={cn(ICON_BTN, "ml-auto")} onClick={() => setMoreOpen(true)} title="More actions (.)" aria-label="More actions">
            <MoreHorizontal size={15} />
          </button>
          <Popover open={moreOpen} anchor={moreRef.current} onClose={() => setMoreOpen(false)} align="right" width={220}>
            <ActionsMenu item={item} actions={actions} close={() => setMoreOpen(false)} />
          </Popover>
        </div>

        <div className="border-b border-bz-line-soft px-5 pb-2.5 pt-2">
          {summary.failed ? (
            <span role="alert" className="inline-flex items-center gap-2 text-[11.5px] text-bz-text-soft">
              Couldn't load figures. <Retry onClick={summary.retry} />
            </span>
          ) : (
            <Statline>
              {facts.map((f) => (
                <Stat
                  key={f.key}
                  label={f.label}
                  value={summary.loading ? <span aria-label="Loading" className="inline-block h-2.5 w-8 animate-pulse rounded-bz-pill bg-bz-line-soft align-middle" /> : f.value}
                  sub={summary.loading ? undefined : f.sub}
                  danger={!summary.loading && f.danger}
                  title={f.title}
                  onPick={summary.loading ? undefined : f.onOpen}
                />
              ))}
            </Statline>
          )}
        </div>

        {tpl && (
          <div ref={at("variants")} data-peek-sec="variants">
            <Block
              title="Variants"
              count={kids.length}
              right={
                <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => onOpenPage("variants")}>
                  Open variants <ArrowUpRight size={11} />
                </button>
              }
            >
              {summary.loading ? (
                <SkeletonLines n={4} />
              ) : (
                <Grid<Item> ariaLabel="Variants" mode="readonly" columns={variantCols} rows={kids} onOpenRow={(r) => ctx.go(r.id)} minWidth={420} />
              )}
            </Block>
          </div>
        )}

        {stock && (
          <div ref={at("stock")} data-peek-sec="stock">
            <Block
              title="Stock by location"
              right={
                item.orgs.length > 1 ? (
                  <Select trigger="ghost" className="h-7" value={stockOrg} onChange={setStockOrg} label={`In ${orgName(stockOrg)}`} options={item.orgs.map((o) => ({ value: o, label: orgName(o) }))} width={200} align="right" />
                ) : undefined
              }
            >
              {summary.loading ? (
                <SkeletonLines />
              ) : summary.failed ? (
                <Failed compact text="Couldn't load stock." onRetry={summary.retry} />
              ) : stockRows.length === 0 ? (
                <p className="m-0 text-[11.5px] text-bz-text-soft">No stock in {orgName(stockOrg)}.</p>
              ) : (
                <div className={cn("grid grid-cols-[minmax(0,1fr)_64px_76px_84px] gap-x-3 gap-y-1.5 text-[12px]", NUM)}>
                  <span className={LABEL}>Location</span>
                  <span className={cn(LABEL, "text-right")}>On hand</span>
                  <span className={cn(LABEL, "text-right")}>Committed</span>
                  <span className={cn(LABEL, "text-right")}>Available</span>
                  {stockRows.map((r) => (
                    <React.Fragment key={r.location_id}>
                      <span className="truncate text-bz-text">{r.name}</span>
                      <span className={cn("text-right", r.on_hand < 0 ? "text-bz-red" : "text-bz-text")}>{negText(r.on_hand)}</span>
                      <span className="text-right text-bz-text-muted">{qty(r.committed)}</span>
                      <span className={cn("text-right", r.available < 0 ? "font-semibold text-bz-red" : "text-bz-text")}>
                        {negText(r.available)}
                        {r.available < 0 && <span className="ml-1 text-[10.5px]">neg</span>}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </Block>
          </div>
        )}

        <div ref={at("prices")} data-peek-sec="prices">
          <Block title="Prices">
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-[12px] sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-[92px] shrink-0 text-bz-text-muted">Sell price</span>
                <InlineField
                  label="Sell price"
                  editor="amount"
                  value={item.sales_rate}
                  display={sell.value ? money(sell.value) : <span className="text-bz-text-soft">—</span>}
                  suffix={code ?? undefined}
                  readOnly={viewOnly}
                  buttonRef={(el) => (firstField.current = el)}
                  onCommit={commit("sales_rate", "Sell price")}
                  className={sell.source === "template" ? "text-bz-text-soft" : undefined}
                />
                {sell.source === "template" && <Source kind="inherited" from="from template" />}
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-[92px] shrink-0 text-bz-text-muted">Purchase price</span>
                <InlineField
                  label="Purchase price"
                  editor="amount"
                  value={item.purchase_rate}
                  display={buy.value ? money(buy.value) : <span className="text-bz-text-soft">—</span>}
                  suffix={code ?? undefined}
                  readOnly={viewOnly}
                  onCommit={commit("purchase_rate", "Purchase price")}
                />
                {buy.source === "template" && <Source kind="inherited" from="from template" />}
              </div>
            </div>
            <p className={cn("m-0 mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-bz-text-muted", NUM)}>
              <span className="text-bz-text-soft">At price levels</span>
              {PRICE_LEVELS.map((l) => (
                <span key={l.id}>
                  {l.name} {l.discount}% <span className="text-bz-text">{sell.value ? money((sell.value * (100 - l.discount)) / 100) : "—"}</span>
                </span>
              ))}
            </p>
          </Block>
        </div>

        <div ref={at("setup")} data-peek-sec="tax">
          <Block
            title="Setup"
            right={
              <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => onOpenPage("tax")}>
                Page <ArrowUpRight size={11} />
              </button>
            }
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-[92px] shrink-0 text-bz-text-muted">Code / SKU</span>
                {variant ? (
                  <span className="min-w-0 truncate px-1 text-bz-text-soft" title="Set by the template">
                    {item.code}
                  </span>
                ) : (
                  <InlineField label="Code" value={item.code} readOnly={viewOnly} onCommit={commit("code", "Code")} />
                )}
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-[92px] shrink-0 text-bz-text-muted">Category</span>
                <InlineField label="Category" editor="select" options={CATEGORY_OPTS} value={item.category_id ?? ""} placeholder="Uncategorised" readOnly={viewOnly} onCommit={commit("category_id", "Category")} />
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-[92px] shrink-0 text-bz-text-muted">Tax code</span>
                <InlineField
                  label="Tax code"
                  editor="select"
                  options={[{ value: "", label: "None" }, ...taxOptions().map((t) => ({ value: t.id, label: t.name, hint: `${t.rate}%` }))]}
                  value={item.tax_id ?? ""}
                  display={taxName(item.tax_id) ?? (item.taxable ? <span className="text-bz-red">None — taxable</span> : "None")}
                  readOnly={viewOnly}
                  onCommit={commit("tax_id", "Tax code")}
                />
              </div>
              {stock && (
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-[92px] shrink-0 text-bz-text-muted">Reorder point</span>
                  <InlineField label="Reorder point" editor="number" value={item.reorder} suffix={unit ?? undefined} readOnly={viewOnly} onCommit={commit("reorder", "Reorder point")} />
                </div>
              )}
            </div>
            {ledgersFor(item.type, item.sub_type).length > 0 && (
              <div className="mt-3 border-t border-bz-line-soft pt-2.5 text-[12px]">
                <p className={cn(LABEL, "m-0 mb-1")}>Posts to</p>
                {ledgerLine}
              </div>
            )}
          </Block>
        </div>

        <div ref={at("open")} data-peek-sec="stock">
          <Block title="Open documents">
            {summary.loading ? (
              <SkeletonLines n={2} />
            ) : (
              <>
                <Statline>
                  {(["deliver", "invoice", "receive", "transfer"] as const).map((k) => (
                    <Stat key={k} label={OPEN_LABEL[k]} value={open[k]} />
                  ))}
                </Statline>
                {openLinesOf(item).slice(0, 4).length > 0 && (
                  <div className="mt-2 flex flex-col">
                    {openLinesOf(item)
                      .slice(0, 4)
                      .map((l, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => (l.href ? navigate(l.href) : ctx.show("info", `${l.doc} opens`))}
                          className={cn("grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 rounded-bz-sm px-1 py-1 text-left text-[11.5px] hover:bg-bz-paper-warm", NUM)}
                        >
                          <span className="font-medium text-bz-text">{l.doc}</span>
                          <span className="truncate text-bz-text-muted">
                            {OPEN_LABEL[l.kind]} · {l.party}
                          </span>
                          <span className="text-bz-text">
                            {qty(l.qty)} <span className="text-bz-text-soft">{unit}</span>
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </>
            )}
          </Block>
        </div>

        {stock && (
          <div data-peek-sec="stock">
            <Block
              title="Recent movements"
              right={
                <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => run("movements", item)}>
                  All <ArrowUpRight size={11} />
                </button>
              }
            >
              {summary.loading ? (
                <SkeletonLines n={2} />
              ) : summary.failed ? (
                <Failed compact text="Couldn't load movements." onRetry={summary.retry} />
              ) : item.movements.length === 0 ? (
                <p className="m-0 text-[11.5px] text-bz-text-soft">None yet.</p>
              ) : (
                <div className={cn("grid grid-cols-[44px_64px_minmax(0,1fr)_44px_64px] gap-x-2 gap-y-1 text-[11.5px]", NUM)}>
                  {item.movements.slice(0, 5).map((m) => (
                    <React.Fragment key={m.doc}>
                      <span className="text-bz-text-soft">{shortDate(m.date)}</span>
                      <span className="font-medium text-bz-text">{m.doc}</span>
                      <span className="truncate text-bz-text-muted">
                        {m.kind} · {locationName(m.location_id)}
                      </span>
                      <span className={cn("text-right", m.qty < 0 ? "text-bz-text" : "text-bz-pos-deep")}>{signed(m.qty)}</span>
                      <span className={cn("text-right text-bz-text-soft", m.balance < 0 && "text-bz-red")}>bal {negText(m.balance)}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </Block>
          </div>
        )}

        <div data-peek-sec="history">
          <Block
            title="History"
            right={
              <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => onOpenPage("history")}>
                All <ArrowUpRight size={11} />
              </button>
            }
          >
            <HistoryLines entries={item.history.slice(0, 3)} />
          </Block>
        </div>
      </div>
    </RecordShell>
  );
}

/** History lines (B-I8): "Arun Rai changed Sell price 0.00 → 250.00 · 2h". */
export function HistoryLines({ entries, empty = "Nothing yet." }: { entries: Item["history"]; empty?: string }) {
  if (entries.length === 0) return <p className="m-0 text-[11.5px] text-bz-text-soft">{empty}</p>;
  return (
    <ol className="m-0 flex list-none flex-col gap-2 p-0">
      {entries.map((h) => (
        <li key={h.id} className="flex items-start gap-2.5 text-[11.5px]">
          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-bz-pill", h.kind === "note" ? "bg-bz-leaf-deep" : "border border-bz-line bg-bz-surface")} />
          <span className="min-w-0 flex-1 text-bz-text-muted">
            <span className="font-medium text-bz-text">{h.who === ME ? "You" : h.who}</span>
            {h.kind === "note" ? ": " : " "}
            {h.kind === "change" ? (
              <>
                changed {h.field} <span className={NUM}>{h.from}</span> → <span className={cn("text-bz-text", NUM)}>{h.to}</span>
              </>
            ) : h.kind === "note" ? (
              <span className="text-bz-text">{h.text}</span>
            ) : (
              "created the item"
            )}
          </span>
          <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{relTime(h.when)}</span>
        </li>
      ))}
    </ol>
  );
}

export { baseCode };
