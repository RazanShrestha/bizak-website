import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Archive, ArchiveRestore, Download, FileSpreadsheet, LayoutGrid, Printer, Receipt, ShoppingBag, Tag, Warehouse, Percent, TriangleAlert, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { Chip, GHOST, ICON_BTN, MenuItem, NUM, Popover } from "../../sales/bzw";
import { DocDesk } from "../../sales/DocDesk";
import type { BulkAction, Column, FilterOption, Group, Pick, Sort, View } from "../../sales/DocDesk";
import { useStore } from "../../sales/store";
import { VENDORS } from "../../purchase/receipts";
import { CopyText } from "../kit";
import { MASTER_SUBSIDIARIES } from "../seed/currencies";
import { locationStore } from "../seed/locations";
import { taxStore } from "../seed/taxes";
import { unitStore } from "../seed/units";
import { CATEGORIES, categoryName, itemsStore } from "../seed/items";
import type { Item } from "../seed/items";
import { ItemActionsLayer, ItemActionsProvider, useItemActions } from "./actions";
import { ItemCreateSheet } from "./ItemCreateSheet";
import { ItemPage } from "./ItemPage";
import { useMastersChannel } from "../jump/channel";
import { ItemPeek } from "./ItemPeek";
import {
  DEFAULT_ORG,
  TYPE_LABEL,
  accountsMissing,
  availableOf,
  belowReorder,
  childrenOf,
  duplicateCode,
  effRate,
  hasUnits,
  isStock,
  isTemplate,
  isVariant,
  money,
  negText,
  noSellPrice,
  noTaxCode,
  noUnit,
  orgName,
  patchItem,
  purchasable,
  sellable,
  stockBand,
  templateOf,
  typeText,
  unitName,
  useBaseCode,
  useFlag,
  useItems,
  valuesText,
} from "./model";

// ════════════════════════════════════════════════════════════════════════════
// THE ITEM DESK (spec §3.1) — DocDesk with its master props: a Code column,
// a Sell price column, no period, a peek beside the list and a record page
// that takes the page. Every URL is served by this one component
// (`items`, `items/new`, `items/:id`, `items/:id/page`), so the list keeps its
// view, search, picks and scroll while a record opens and closes.
//
//   views    Catalog (bands by category) · Stock (what needs stock work) ·
//            Setup gaps (what will refuse or mislead)
//   picks    the facts someone acts on — zero hides them, except Archived
//   rows     a template stands for its family (its caret shows the
//            variants); variants join the list when a search, pick or filter
//            narrows it, so a code or barcode still finds them
//   archived only in the Archived band / pick
//
// Mockup switches: ?empty=1 (a new tenant) · ?fail=1 · ?slow=1 · ?viewonly=1 ·
// ?conflict=1 (the page's Save gets a 409) · ?sumfail=1 (the summary read fails)
// · ?genfail=1 (matrix generation fails) · ?org=194 (read in Pokhara Branch).
// ════════════════════════════════════════════════════════════════════════════

const Ic = (c: unknown) => c as React.ComponentType<{ size?: number; className?: string }>;

export function ItemsDesk() {
  return (
    <ItemActionsProvider>
      <Desk />
    </ItemActionsProvider>
  );
}

function Desk() {
  // A page opened from a document (a new tab) reads the opener's state and announces its saves (spec 5.2, B-F7).
  useMastersChannel();
  const all = useItems();
  useStore(unitStore);
  useStore(taxStore);
  useStore(locationStore);
  const navigate = useNavigate();
  const location = useLocation();
  const { no } = useParams();
  const { run, setLabels } = useItemActions();
  const search = new URLSearchParams(location.search);
  const org = search.get("org") ?? DEFAULT_ORG;
  const code = useBaseCode(org);
  const onPage = location.pathname.endsWith("/page");
  // `items/new` is its own (static) route, so it carries no `:no` param.
  const creating = no === "new" || /\/items\/new\/?$/.test(location.pathname);

  const empty = useFlag("empty");
  const slow = useFlag("slow");
  const fail = useFlag("fail");
  const viewOnly = useFlag("viewonly");
  const conflict = useFlag("conflict");
  const [loading, setLoading] = React.useState(slow);
  const [failed, setFailed] = React.useState(fail);
  React.useEffect(() => {
    if (!slow) return;
    const t = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(t);
  }, [slow]);
  const retry = () => {
    setFailed(false);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  };

  const rows = empty ? [] : all;
  const live = rows.filter((r) => !r.archived);
  const found = !no || creating || rows.some((r) => r.id === no);

  // ── Picks (server counts in the app — B-I1 `counts`; never a sum of fetched rows) ──
  const defs: Pick<Item>[] = [
    { key: "negative", label: "Negative", title: `Stock items with less than 0 on hand in ${orgName(org)}`, danger: true, test: (r) => !r.archived && isStock(r) && !isTemplate(r) && (availableOf(all, r, org) ?? 0) < 0, value: 0 },
    { key: "below", label: "Below reorder", title: "A reorder point is set and available is under it", test: (r) => !r.archived && belowReorder(all, r, org), value: 0 },
    { key: "out", label: "Out of stock", title: "Stock items with nothing available (negative ones not counted)", test: (r) => !r.archived && isStock(r) && !isTemplate(r) && (availableOf(all, r, org) ?? 0) === 0, value: 0 },
    { key: "noprice", label: "No sell price", title: "Sellable, not a template, and 0 after the template's price", test: (r) => !r.archived && noSellPrice(all, r), value: 0 },
    { key: "accounts", label: "Accounts missing", title: "A ledger its type posts to is not set — documents will refuse", danger: true, test: (r) => !r.archived && accountsMissing(all, r), value: 0 },
    { key: "archived", label: "Archived", title: "Hidden from pickers; documents keep them", test: (r) => r.archived, value: 0 },
  ];
  const pickDefs = defs.map((p) => {
    const n = rows.filter(p.test).length;
    return { ...p, n, value: n, danger: p.danger && n > 0 };
  });
  // The counts come with the list read: none while it is loading or when it failed.
  const picks = loading || failed ? [] : pickDefs.filter((p) => p.n > 0 || p.key === "archived");

  // ── Views ──
  /** At rest a template stands for its variants; a search, pick or filter lists the matching variants too. */
  const shown = (rs: Item[], narrowed: boolean) => rs.filter((r) => narrowed || !isVariant(r));
  const archivedBand = (rs: Item[]): Group<Item> => {
    const a = rs.filter((r) => r.archived);
    return { key: "archived", label: "Archived", rows: a, collapsed: a.length !== rs.length };
  };
  const views: View<Item>[] = [
    {
      key: "catalog",
      label: "Catalog",
      icon: Ic(LayoutGrid),
      groups: (rs, narrowed) => {
        const liveRs = shown(rs, narrowed).filter((r) => !r.archived);
        const catOf = (r: Item) => (isVariant(r) ? templateOf(all, r)?.category_id ?? r.category_id : r.category_id);
        return [
          ...[...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ key: c.id, label: c.name, rows: liveRs.filter((r) => catOf(r) === c.id) })),
          { key: "none", label: "Uncategorised", rows: liveRs.filter((r) => !catOf(r)) },
          archivedBand(shown(rs, narrowed)),
        ];
      },
    },
    {
      key: "stock",
      label: "Stock",
      icon: Ic(Warehouse),
      groups: (rs) => {
        // Templates never transact: their variants stand here on their own.
        const liveRs = rs.filter((r) => !r.archived && !isTemplate(r));
        const band = (b: ReturnType<typeof stockBand>) => liveRs.filter((r) => stockBand(all, r, org) === b);
        return [
          { key: "negative", label: "Negative", alarm: true, rows: band("negative") },
          { key: "out", label: "Out of stock", rows: band("out") },
          { key: "below", label: "Below reorder", rows: band("below") },
          { key: "in", label: "In stock", rows: band("in") },
          { key: "none", label: "Not stocked", rows: band("none"), collapsed: true },
          archivedBand(rs.filter((r) => !isTemplate(r))),
        ];
      },
    },
    {
      key: "gaps",
      label: "Setup gaps",
      icon: Ic(TriangleAlert),
      groups: (rs) => {
        const liveRs = rs.filter((r) => !r.archived);
        const seen = new Set<string>();
        const take = (test: (r: Item) => boolean) =>
          liveRs.filter((r) => {
            if (seen.has(r.id) || !test(r)) return false;
            seen.add(r.id);
            return true;
          });
        return [
          { key: "accounts", label: "Accounts missing", alarm: true, rows: take((r) => accountsMissing(all, r)), right: "Documents refuse these" },
          { key: "dup", label: "Duplicate code", rows: take((r) => duplicateCode(all, r)), right: "Another item holds the same code" },
          { key: "noprice", label: "No sell price", rows: take((r) => noSellPrice(all, r)) },
          { key: "notax", label: "No tax code", rows: take((r) => noTaxCode(r)), right: "Taxable without a code" },
          { key: "nounit", label: "No unit", rows: take((r) => noUnit(r)) },
          { key: "ok", label: "Everything set", rows: take(() => true), collapsed: true },
        ];
      },
    },
  ];

  // ── Filters · sort ──
  const usedUnits = Array.from(new Set(rows.map((r) => r.unit_id).filter((u): u is string => !!u)));
  const unitParam = search.get("unit");
  const convUnits = Array.from(new Set([...rows.flatMap((r) => r.conversions.map((c) => c.unit_id)), unitParam].filter((u): u is string => !!u)));
  const filters: FilterOption<Item>[] = [
    ...(["inventory", "service", "non_inventory", "discount", "item_group", "kit"] as const).map((t) => ({ value: `t:${t}`, label: TYPE_LABEL[t], group: "Type", test: (r: Item) => r.type === t && !isTemplate(r) })),
    { value: "t:template", label: "Template", group: "Type", test: isTemplate },
    ...MASTER_SUBSIDIARIES.map((s) => ({ value: `org:${s.id}`, label: s.name, group: "Subsidiary", test: (r: Item) => r.orgs.includes(s.id) })),
    ...CATEGORIES.map((c) => ({ value: `c:${c.id}`, label: c.name, group: "Category", test: (r: Item) => (isVariant(r) ? templateOf(all, r)?.category_id : r.category_id) === c.id })),
    { value: "c:none", label: "Uncategorised", group: "Category", test: (r: Item) => !r.category_id },
    ...usedUnits.map((u) => ({ value: `u:${u}`, label: unitName(u) ?? u, group: "Unit", test: (r: Item) => r.unit_id === u })),
    // The unit hub's "Converted on" door lands here (`?unit=<id>`): items with a conversion to that unit.
    ...convUnits.map((u) => ({ value: `cv:${u}`, label: unitName(u) ?? u, group: "Converted to", test: (r: Item) => r.conversions.some((c) => c.unit_id === u) })),
    { value: "tr:serial", label: "Serial numbers", group: "Tracking", test: (r: Item) => r.serial },
    { value: "tr:batch", label: "Batches", group: "Tracking", test: (r: Item) => r.batch },
    { value: "v:yes", label: "Has variants", group: "Variants", test: isTemplate },
    ...VENDORS.map((v) => ({ value: `ven:${v.id}`, label: v.name, hint: v.code, group: "Preferred vendor", test: (r: Item) => r.vendor_id === v.id })),
  ];
  const sorts: Sort<Item>[] = [
    { key: "az", label: "A–Z", by: (r) => r.name.toLowerCase() },
    { key: "code", label: "Code", by: (r) => (r.code ?? "~").toLowerCase() },
    { key: "recent", label: "Recently changed", by: (r) => r.modified.on, desc: true },
    { key: "avail", label: "Available ↑", by: (r) => availableOf(all, r, org) ?? Number.MAX_SAFE_INTEGER },
    { key: "price", label: "Price ↓", by: (r) => effRate(all, r, "sales_rate").value, desc: true },
  ];

  // ── Columns ──
  const columns: Column<Item>[] = [
    {
      key: "type",
      label: "Type",
      width: "88px",
      render: (r) =>
        isTemplate(r) ? (
          <Chip tone="neutral" dot={false} className="px-1.5 py-0 text-[10.5px]">
            Template
          </Chip>
        ) : (
          typeText(r)
        ),
    },
    { key: "unit", label: "Unit", width: "76px", render: (r) => unitName(r.unit_id) ?? <span className="text-bz-text-soft">—</span> },
    {
      key: "avail",
      label: "Available",
      width: "84px",
      align: "right",
      render: (r) => {
        const a = availableOf(all, r, org);
        if (a === null) return <span className="text-bz-text-soft">—</span>;
        return (
          <span className={cn(NUM, a < 0 ? "font-semibold text-bz-red" : a === 0 ? "text-bz-text-soft" : "text-bz-text")} title={a < 0 ? "More went out than came in" : undefined}>
            {negText(a)}
            {a < 0 && <span className="ml-1 text-[10.5px]">neg</span>}
          </span>
        );
      },
    },
  ];

  const bulk: BulkAction<Item>[] = [
    {
      label: "Set category",
      icon: Ic(Tag),
      enabled: (rs) => rs.length > 0 && !viewOnly,
      choose: { options: [{ value: "", label: "Uncategorised" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.name }))], placeholder: "Category" },
      title: "PATCH api/item/bulk (B-I10)",
      run: (rs, v) => {
        rs.forEach((r) => patchItem(r.id, { category_id: v || null }));
        return { done: rs.length, skipped: [], verb: `moved to ${v ? categoryName(v) : "Uncategorised"}` };
      },
    },
    {
      label: "Set tax code",
      icon: Ic(Percent),
      enabled: (rs) => rs.length > 0 && !viewOnly,
      choose: { options: [{ value: "", label: "None" }, ...taxStore.get().filter((t) => !t.archived).map((t) => ({ value: t.id, label: t.name, meta: `${t.rate}%` }))], placeholder: "Tax code" },
      title: "PATCH api/item/bulk (B-I10)",
      run: (rs, v) => {
        const skip = rs.filter((r) => r.type === "item_group" || r.type === "kit");
        rs.filter((r) => !skip.includes(r)).forEach((r) => patchItem(r.id, { tax_id: v || null, taxable: !!v }));
        return { done: rs.length - skip.length, skipped: skip.map((r) => `${r.code ?? r.name} — a ${TYPE_LABEL[r.type].toLowerCase()} carries no tax`), skippedIds: skip.map((r) => r.id), verb: "updated" };
      },
    },
    {
      label: "Archive",
      icon: Ic(Archive),
      enabled: (rs) => rs.some((r) => !r.archived) && !viewOnly,
      hidden: (rs) => viewOnly || rs.every((r) => r.archived),
      run: (rs) => {
        const skip = rs.filter((r) => r.archived);
        const todo = rs.filter((r) => !r.archived);
        todo.forEach((r) => [r, ...(isTemplate(r) ? childrenOf(all, r.id) : [])].forEach((x) => patchItem(x.id, { archived: true })));
        return { done: todo.length, skipped: skip.map((r) => `${r.code ?? r.name} — already archived`), skippedIds: skip.map((r) => r.id), verb: "archived" };
      },
    },
    {
      label: "Restore",
      icon: Ic(ArchiveRestore),
      enabled: (rs) => rs.some((r) => r.archived) && !viewOnly,
      hidden: (rs) => viewOnly || !rs.some((r) => r.archived),
      run: (rs) => {
        const skip = rs.filter((r) => !r.archived);
        const todo = rs.filter((r) => r.archived);
        todo.forEach((r) => [r, ...(isTemplate(r) ? childrenOf(all, r.id) : [])].forEach((x) => patchItem(x.id, { archived: false })));
        return { done: todo.length, skipped: skip.map((r) => `${r.code ?? r.name} — not archived`), skippedIds: skip.map((r) => r.id), verb: "restored" };
      },
    },
    {
      label: "Export CSV",
      icon: Ic(FileSpreadsheet),
      enabled: (rs) => rs.length > 0,
      title: "POST api/item/export",
      run: (rs) => ({ done: rs.length, skipped: [], verb: "exported to CSV" }),
    },
    {
      label: "Print labels",
      icon: Ic(Printer),
      enabled: (rs) => rs.length > 0,
      run: (rs) => {
        const has = (r: Item) => (isTemplate(r) ? childrenOf(all, r.id).some((c) => c.barcodes.length) : r.barcodes.length > 0);
        const skip = rs.filter((r) => !has(r));
        const todo = rs.filter(has);
        if (todo.length) setLabels(todo);
        return { done: todo.length, skipped: skip.map((r) => `${r.code ?? r.name} — no barcode`), skippedIds: skip.map((r) => r.id), verb: "ready to print" };
      },
    },
  ];

  const keep = ["org", "viewonly", "conflict", "sumfail", "slow"];
  const qs = (extra?: Record<string, string>) => {
    const p = new URLSearchParams();
    keep.forEach((k) => {
      const v = search.get(k);
      if (v) p.set(k, v);
    });
    Object.entries(extra ?? {}).forEach(([k, v]) => p.set(k, v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const openPage = (r: Item, section?: string) => navigate(`/design/masters/items/${r.id}/page${qs()}${section ? `#${section}` : ""}`);

  /** An exact barcode opens its peek; a template's is refused in the server's words; none offers a new item. */
  const onSearchEnter = (q: string) => {
    const hit = all.find((i) => i.barcodes.some((b) => b.barcode?.trim().toLowerCase() === q.toLowerCase()));
    if (hit && isTemplate(hit)) {
      // The scan route's own refusal (ItemBarCodeController `barcode/{code}`), verbatim.
      showRef.current?.("error", `'${hit.name}' is a matrix template; scan one of its variant barcodes.`);
      return false;
    }
    if (hit) {
      navigate(`/design/masters/items/${hit.id}${qs()}`);
      return true;
    }
    if (/^\d{6,}$/.test(q)) {
      showRef.current?.("info", `No item has barcode ${q}.`, { label: "New item with it", run: () => navigate(`/design/masters/items/new${qs({ barcode: q })}`) }, 8000);
    }
    return false;
  };
  const showRef = React.useRef<((kind: "success" | "info" | "error", text: string, action?: { label: string; run: () => void }, duration?: number) => void) | null>(null);

  const [exportOpen, setExportOpen] = React.useState(false);
  const exportRef = React.useRef<HTMLButtonElement>(null);

  return (
    <DocDesk<Item>
      module="Items"
      section="masters/items"
      rail="Inventory"
      noun={["item", "items"]}
      numberLabel="Code"
      numberWidth="136px"
      initialFilters={unitParam ? [`cv:${unitParam}`] : undefined}
      amountLabel="Sell price"
      partyLabel="Item"
      showPeriod={false}
      searchPlaceholder="Name, code or barcode"
      rows={rows}
      loading={loading}
      failed={failed ? { text: "Couldn't load items.", onRetry: retry } : undefined}
      noOf={(r) => r.id}
      rowLabel={(r) => r.name}
      expandLabel="variants"
      numberOf={(r) =>
        r.code ? (
          <CopyText text={r.code} className={cn("text-[11.5px]", duplicateCode(all, r) && "text-bz-red")} onCopied={() => showRef.current?.("success", "Copied")} />
        ) : (
          <span className="text-bz-text-soft">—</span>
        )
      }
      searchText={(r) => [r.name, r.code, r.hs_code, ...r.barcodes.map((b) => b.barcode)].filter(Boolean).join(" ")}
      picks={picks}
      views={views}
      filters={filters}
      sorts={sorts}
      columns={columns}
      primary={(r) => {
        const t = isVariant(r) ? templateOf(all, r) : null;
        const cat = categoryName(t ? t.category_id : r.category_id);
        const kids = isTemplate(r) ? childrenOf(all, r.id).filter((c) => !c.archived).length : 0;
        return {
          title: r.name,
          sub: t ? <>Variant of {t.name}</> : isTemplate(r) ? <>{cat ?? "Uncategorised"} · {kids} variants</> : cat ?? undefined,
          subOnDesktop: true,
        };
      }}
      amount={(r) => {
        if (!sellable(r) && r.sales_rate === 0) return { value: <span className="font-normal text-bz-text-soft">—</span> };
        const e = effRate(all, r, "sales_rate");
        return {
          value: e.value ? (
            <span className={cn(NUM, e.source === "template" && "text-bz-text-muted")}>
              {code && <span className="mr-1 text-[0.72em] font-medium text-bz-text-soft">{code}</span>}
              {money(e.value)}
            </span>
          ) : (
            <span className="font-normal text-bz-text-soft">—</span>
          ),
        };
      }}
      rowVerb={(r) =>
        r.archived || viewOnly
          ? null
          : sellable(r)
            ? { label: "New invoice", icon: Ic(Receipt), run: (e) => run("invoice", r, e?.currentTarget ?? null) }
            : purchasable(r)
              ? { label: "New PO", icon: Ic(ShoppingBag), run: () => run("po", r) }
              : null
      }
      canExpand={isTemplate}
      renderExpand={(r) => (
        <div className="flex flex-col gap-1">
          {childrenOf(all, r.id)
            .filter((c) => !c.archived)
            .map((c) => {
              const a = availableOf(all, c, org) ?? 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/design/masters/items/${c.id}${qs()}`)}
                  className={cn("-mx-1 grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_72px_96px] gap-3 rounded-bz-sm px-1 py-0.5 text-left text-[11.5px] hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire", NUM)}
                >
                  <span className="truncate text-bz-text">{valuesText(all, c)}</span>
                  <span className="truncate text-bz-text-muted">{c.code}</span>
                  <span className={cn("text-right", a < 0 ? "font-semibold text-bz-red" : "text-bz-text-muted")}>
                    {negText(a)}
                    {a < 0 && " neg"}
                  </span>
                  <span className={cn("text-right", c.sales_rate === r.sales_rate ? "text-bz-text-muted" : "text-bz-text")}>{money(effRate(all, c, "sales_rate").value)}</span>
                </button>
              );
            })}
        </div>
      )}
      bulk={bulk}
      newLabel={viewOnly ? undefined : "New item"}
      onNew={viewOnly ? undefined : () => navigate(`/design/masters/items/new${qs()}`)}
      emptyAction={
        <button type="button" className={GHOST} onClick={() => showRef.current?.("info", "Data Import opens (the Excel import screen)")}>
          <FileSpreadsheet size={13} /> Import from Excel
        </button>
      }
      exportMenu={
        <>
          <button ref={exportRef} type="button" className={ICON_BTN} title="Export" aria-label="Export" onClick={() => setExportOpen(true)}>
            <Download size={14} />
          </button>
          <Popover open={exportOpen} anchor={exportRef.current} onClose={() => setExportOpen(false)} align="right" width={240}>
            <MenuItem icon={Ic(FileSpreadsheet)} hint="The items shown, the columns you pick next" onClick={() => (setExportOpen(false), showRef.current?.("success", "Items exported to CSV"))}>
              Export CSV
            </MenuItem>
          </Popover>
        </>
      }
      keyHints={[
        ["/", "Search (a scan lands here)"],
        ["J / K", "Next / previous"],
        ["Space", "Peek / close the peek"],
        ["↵", "Open the page"],
        ["N", "New item"],
        ["X", "Select the row"],
        ["⇧X", "Select its band"],
        ["E", "Edit the first field (peek)"],
        ["C", "Copy the code"],
        ["Esc", "Close / clear"],
      ]}
      cursorKeys
      scanToSearch
      onSearchEnter={onSearchEnter}
      onOpenPage={(r) => openPage(r)}
      fullOpen={onPage}
      keepParams={keep}
      renderPanel={(r, ctx) =>
        onPage ? (
          <ItemPage key={r.id} item={r} ctx={ctx} org={org} viewOnly={viewOnly} conflict={conflict} isNew={search.get("new") === "1"} />
        ) : (
          <ItemPeek key={r.id} item={r} ctx={ctx} org={org} viewOnly={viewOnly} onOpenPage={(section) => openPage(r, section)} />
        )
      }
      renderExtra={({ show }) => {
        showRef.current = show;
        return (
          <>
            <ItemActionsLayer show={show} org={org} onAfterDelete={() => navigate(`/design/masters/items${qs()}`)} />
            {creating && <ItemCreateSheet key={location.search} org={org} show={show} onClose={() => navigate(`/design/masters/items${qs()}`)} />}
            {!found && <NotAvailable onBack={() => navigate(`/design/masters/items${qs()}`)} />}
          </>
        );
      }}
    />
  );
}

/** A link to an item this reader can't open (another tenant's, a deleted one, a typo) — the desk's sentence (trap 30). */
function NotAvailable({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-y-0 right-0 z-50 flex w-full max-w-[720px] flex-col border-l border-bz-line bg-bz-surface shadow-[var(--bz-shadow-panel)]">
      <div className="flex justify-end px-3 pt-3">
        <button type="button" className={ICON_BTN} onClick={onBack} title="Close (Esc)" aria-label="Close">
          <X size={15} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-16 text-center">
        <p className="m-0 text-[13px] font-semibold text-bz-text">This item isn't available.</p>
        <button type="button" className={GHOST} onClick={onBack}>
          Back to items
        </button>
      </div>
    </div>
  );
}
