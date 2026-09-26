import * as React from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { cn } from "../../../ui/utils";
import { GHOST_SM, MenuItem, MenuSep, NUM } from "../../../sales/bzw";
import { useStore } from "../../../sales/store";
import { useMedia } from "../../../sales/orders";
import { LINK, RatePop, fmtDay, fmtRate } from "../../kit";
import type { GridColumn, GridGroup, MasterKindConfig } from "../../kit";
import {
  ago,
  baseOrgsOf,
  currencyStore,
  daysBetween,
  foreignBases,
  hasNoRate,
  isCodeShaped,
  isInUse,
  isStale,
  latestRate,
  MASTER_SUBSIDIARIES,
  rateUnit,
  STALE_DAYS,
  subsidiaryName,
  totalUsage,
} from "../../seed/currencies";
import type { Currency } from "../../seed/currencies";
import { BaseStrip } from "../BaseStrip";
import { CurrencySheet } from "../CurrencySheet";
import { FixCodeDialog } from "../FixCodeDialog";
import { UpdateRatesDialog } from "../UpdateRatesDialog";
import { archiveRefusal, canDelete, deleteCurrency, restore, saveRate, setArchived, snapshot } from "../currencyActions";
import { DeleteDialog } from "../shared";
import type { HubCtx, KindBundle } from "../shared";

// ════════════════════════════════════════════════════════════════════════════
// CURRENCIES — the hub's template kind (spec §4.1)
//
// statline  In use · Base · No rate · Rate older than 7 days · Code to fix ·
//           Archived — each a pick, zero hides (not Archived)
// strip     the base per subsidiary (BaseStrip)
// table     Code · Name · Symbol · Latest rate · As of · Used by, banded Base
//           currencies · In use · Available (folded — the ~150 onboarding
//           rows) · Archived (folded). A search opens the bands it matches.
// keys      Enter opens the sheet · R on a row opens the rate popover · N new
// ════════════════════════════════════════════════════════════════════════════

type Row = Currency & { used: number };

export function useCurrencyKind(ctx: HubCtx): KindBundle {
  const st = useStore(currencyStore);
  const narrow = !useMedia("(min-width: 768px)");
  const [fixing, setFixing] = React.useState<string | null>(null);
  const [bulk, setBulk] = React.useState(false);
  const [pop, setPop] = React.useState<{ anchor: HTMLElement; from: string; to: string } | null>(null);
  const [deleting, setDeleting] = React.useState<Currency | null>(null);
  const ro = ctx.perm !== "full";
  const { today, show } = ctx;

  const rows: Row[] = ctx.read.empty ? [] : st.currencies.map((c) => ({ ...c, used: totalUsage(c) }));
  const live = rows.filter((c) => !c.archived);

  const openRate = (anchor: HTMLElement, c: Currency, to: string) => setPop({ anchor, from: c.id, to });
  const rateKey = (c: Currency) => {
    const to = foreignBases(st, c)[0];
    const el = document.querySelector<HTMLElement>(`[data-rate-anchor="${c.id}"]`);
    if (to && el && !ro) openRate(el, c, to);
  };

  const latestCell = (c: Currency) => {
    const baseOf = baseOrgsOf(st, c.id);
    if (baseOf.length) return <span className="text-bz-text-soft">base · {baseOf.map(subsidiaryName).join(", ")}</span>;
    const bases = foreignBases(st, c);
    if (!bases.length) return <span className="text-bz-text-soft">—</span>;
    const to = bases[0];
    const r = latestRate(st, c.id, to);
    const toCur = st.currencies.find((x) => x.id === to);
    const more = bases.length > 1 ? <span className="ml-1 text-[10.5px] text-bz-text-soft">+{bases.length - 1}</span> : null;
    if (!r) {
      if (!isInUse(st, c)) return <span className="text-bz-text-soft">—</span>;
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-medium text-bz-red">No rate</span>
          {!ro && (
            <button type="button" tabIndex={-1} data-rate-anchor={c.id} className={cn(LINK, "text-[12px]")} onClick={(e) => (e.stopPropagation(), openRate(e.currentTarget, c, to))} title="Add a rate (R)">
              Add
            </button>
          )}
        </span>
      );
    }
    const text = `1 ${rateUnit(c)} = ${fmtRate(r.rate)} ${rateUnit(toCur)}`;
    return (
      <span className="inline-flex min-w-0 items-center">
        {ro ? (
          <span className={cn("truncate", NUM)}>{text}</span>
        ) : (
          <button
            type="button"
            tabIndex={-1}
            data-rate-anchor={c.id}
            onClick={(e) => (e.stopPropagation(), openRate(e.currentTarget, c, to))}
            title={`${text} · change the rate (R)`}
            className={cn("-mx-1 min-w-0 truncate rounded-bz-sm px-1 py-0.5 text-left text-[12.5px] text-bz-text underline decoration-bz-line underline-offset-2 hover:bg-bz-paper-warm hover:decoration-bz-text-soft focus-visible:outline-2 focus-visible:outline-bz-fire", NUM)}
          >
            {text}
          </button>
        )}
        {more}
      </span>
    );
  };

  const asOfCell = (c: Currency) => {
    const to = foreignBases(st, c)[0];
    const r = to && !baseOrgsOf(st, c.id).length ? latestRate(st, c.id, to) : null;
    if (!r) return <span className="text-bz-text-soft">—</span>;
    const stale = daysBetween(r.date, today) > STALE_DAYS;
    return (
      <span className={cn(stale ? "font-medium text-bz-amber-ink" : "text-bz-text-muted")} title={`${fmtDay(r.date)}${stale ? ` — older than ${STALE_DAYS} days` : ""}`}>
        {ago(r.date, today)}
      </span>
    );
  };

  const codeCell = (c: Currency) =>
    isCodeShaped(c.shortcut) ? (
      <span className="font-semibold">{c.shortcut}</span>
    ) : (
      <span className="inline-flex min-w-0 items-center gap-1" title="Not a code — amounts print without one.">
        <TriangleAlert size={12} className="shrink-0 text-bz-amber" aria-label="Not a code" />
        <span className="truncate font-semibold">{c.shortcut}</span>
      </span>
    );

  const columns: GridColumn<Row>[] = narrow
    ? [
        { key: "shortcut", label: "Code", width: "60px", kind: "readonly", render: codeCell, title: (c) => c.name },
        { key: "latest", label: "Latest rate", width: "minmax(0,1fr)", kind: "readonly", render: latestCell },
      ]
    : [
        { key: "shortcut", label: "Code", width: "minmax(0,0.9fr)", kind: "readonly", render: codeCell },
        { key: "name", label: "Name", width: "minmax(0,1.1fr)", kind: "readonly" },
        {
          key: "symbol",
          label: "Symbol",
          width: "64px",
          kind: "readonly",
          title: (c) =>
            !c.symbol
              ? "No symbol"
              : c.symbol.trim().length > 4 || c.symbol.trim().toLowerCase() === c.name.trim().toLowerCase()
                ? `Symbol “${c.symbol}” isn't printed`
                : c.placement === "before"
                  ? `${c.symbol}1,250.00`
                  : `1,250.00 ${c.symbol}`,
          // A symbol that can't print (longer than 4, or the name itself — dev 186's base) reads as none; its value is in the title.
          render: (c) => (c.symbol && c.symbol.trim().length <= 4 && c.symbol.trim().toLowerCase() !== c.name.trim().toLowerCase() ? <span className="truncate">{c.symbol}</span> : <span className="text-bz-text-soft">—</span>),
        },
        { key: "latest", label: "Latest rate", width: "minmax(0,1.5fr)", kind: "readonly", render: latestCell },
        { key: "asof", label: "As of", width: "72px", kind: "readonly", render: asOfCell },
      ];

  const bands = (rs: Row[]): GridGroup[] => {
    const isBase = (c: Row) => baseOrgsOf(st, c.id).length > 0;
    return [
      { key: "base", label: "Base currencies", rowIds: rs.filter((c) => !c.archived && isBase(c)).map((c) => c.id) },
      { key: "in-use", label: "In use", rowIds: rs.filter((c) => !c.archived && !isBase(c) && c.used > 0).map((c) => c.id) },
      { key: "available", label: "Available", rowIds: rs.filter((c) => !c.archived && !isBase(c) && c.used === 0).map((c) => c.id), collapsed: true, note: "not used by anything" },
      { key: "archived", label: "Archived", rowIds: rs.filter((c) => c.archived).map((c) => c.id), collapsed: true },
    ];
  };

  const config: MasterKindConfig<Row> = {
    key: "currencies",
    label: "Currencies",
    group: "Money",
    count: live.length,
    tier: 2,
    noun: ["currency", "currencies"],
    rows,
    columns,
    bands,
    minWidth: narrow ? 0 : undefined,
    searchText: (c) => `${c.shortcut} ${c.name}`,
    searchPlaceholder: "Code or name",
    usage: (c) => c.usage,
    usageNoun: "records",
    picks: [
      // ONE meaning for "In use", shared with its band: a foreign currency something uses. The bases have their
      // own figure (Base) and band — the pick once counted them too and read 6 beside a band of 4 (review §16.2 #3).
      { key: "in-use", label: "In use", value: live.filter((c) => !baseOrgsOf(st, c.id).length && totalUsage(c) > 0).length, test: (c) => !c.archived && !baseOrgsOf(st, c.id).length && c.used > 0, title: "Used by a document or a master (bases are counted under Base)" },
      { key: "base", label: "Base", value: live.filter((c) => baseOrgsOf(st, c.id).length).length, test: (c) => !c.archived && baseOrgsOf(st, c.id).length > 0, title: "A subsidiary's base currency" },
      { key: "no-rate", label: "No rate", value: live.filter((c) => hasNoRate(st, c)).length, test: (c) => hasNoRate(st, c), danger: true, title: "In use where it is foreign, with no rate against that base" },
      { key: "stale", label: `Rate older than ${STALE_DAYS} days`, value: live.filter((c) => isStale(st, c, today)).length, test: (c) => isStale(st, c, today), amber: true, title: `The newest rate is more than ${STALE_DAYS} days old` },
      { key: "code", label: "Code to fix", value: live.filter((c) => !isCodeShaped(c.shortcut)).length, test: (c) => !c.archived && !isCodeShaped(c.shortcut), title: "The code is not 2–5 letters, so amounts print without one" },
      { key: "archived", label: "Archived", value: rows.filter((c) => c.archived).length, test: (c) => c.archived, showZero: true },
    ],
    filters: [
      ...MASTER_SUBSIDIARIES.map((s) => ({ value: `org:${s.id}`, label: s.name, group: "Subsidiary", test: (c: Row) => c.orgs.includes(s.id) })),
      { value: "rate:has", label: "Has rate", group: "Rate", test: (c: Row) => foreignBases(st, c).some((b) => !!latestRate(st, c.id, b)) },
      { value: "rate:none", label: "No rate", group: "Rate", test: (c: Row) => !baseOrgsOf(st, c.id).length && !foreignBases(st, c).some((b) => !!latestRate(st, c.id, b)) },
      { value: "st:active", label: "Active", group: "Status", test: (c: Row) => !c.archived },
      { value: "st:archived", label: "Archived", group: "Status", test: (c: Row) => c.archived },
    ],
    strip: ctx.read.loading || ctx.read.failed ? undefined : <BaseStrip onFixCode={setFixing} readOnly={ro} show={show} />,
    tools: !ro && (
      <button type="button" className={cn(GHOST_SM, "h-8")} onClick={() => setBulk(true)} title="Enter today's rate for every currency in use">
        <RefreshCw size={12} /> <span className="hidden sm:inline">Update today's rates</span>
        <span className="sm:hidden">Rates</span>
      </button>
    ),
    newLabel: "New currency",
    readOnly: ro,
    denied: ctx.perm === "none",
    rowKeys: { r: (c) => rateKey(c) },
    rowMenu: (c, close) => {
      const refused = archiveRefusal(st, c.id);
      const to = foreignBases(st, c)[0];
      return (
        <>
          <MenuItem onClick={() => (close(), ctx.open(c.id))}>Open</MenuItem>
          {!ro && to && !c.archived && (
            <MenuItem
              kbd="R"
              onClick={() => {
                close();
                window.setTimeout(() => rateKey(c), 0);
              }}
            >
              Update rate
            </MenuItem>
          )}
          {!ro && (
            <>
              <MenuSep />
              {c.archived ? (
                <MenuItem
                  onClick={() => {
                    close();
                    const before = snapshot();
                    setArchived(c.id, false);
                    show("success", "Restored", { label: "Undo", run: () => restore(before) }, 8000);
                  }}
                >
                  Restore
                </MenuItem>
              ) : (
                <MenuItem
                  disabled={!!refused}
                  hint={refused ?? undefined}
                  onClick={() => {
                    close();
                    const before = snapshot();
                    setArchived(c.id, true);
                    show("success", "Archived", { label: "Undo", run: () => restore(before) }, 8000);
                  }}
                >
                  Archive
                </MenuItem>
              )}
              {canDelete(st, c) && (
                <MenuItem danger onClick={() => (close(), setDeleting(c))}>
                  Delete
                </MenuItem>
              )}
            </>
          )}
        </>
      );
    },
    loading: ctx.read.loading,
    failed: ctx.read.failed,
    onRetry: ctx.read.retry,
  };

  const popFrom = pop ? st.currencies.find((c) => c.id === pop.from) : undefined;
  const popTo = pop ? st.currencies.find((c) => c.id === pop.to) : undefined;
  const popLast = pop ? latestRate(st, pop.from, pop.to) : null;

  return {
    config,
    sheet: ({ docked }) =>
      ctx.openId ? (
        <CurrencySheet id={ctx.openId} docked={docked} readOnly={ro} today={today} show={show} onClose={() => ctx.open(null)} onCreated={(id) => ctx.open(id)} onFixCode={setFixing} />
      ) : null,
    overlays: (
      <>
        <RatePop
          open={!!pop}
          anchor={pop?.anchor ?? null}
          onClose={() => setPop(null)}
          from={rateUnit(popFrom)}
          to={rateUnit(popTo)}
          last={popLast ? { rate: popLast.rate, date: popLast.date } : null}
          today={today}
          onSave={(r) => {
            if (!pop) return null;
            const before = snapshot();
            const err = saveRate({ from: pop.from, to: pop.to, date: r.date, rate: r.rate });
            if (err) return err;
            show("success", `${rateUnit(popFrom)} rate saved`, { label: "Undo", run: () => restore(before) }, 8000);
            return null;
          }}
        />
        <FixCodeDialog currencyId={fixing} onClose={() => setFixing(null)} show={show} />
        <UpdateRatesDialog open={bulk} onClose={() => setBulk(false)} today={today} show={show} />
        <DeleteDialog
          open={!!deleting}
          name={deleting?.name ?? ""}
          noun="currency"
          onClose={() => setDeleting(null)}
          onDelete={() => {
            const d = deleting!;
            setDeleting(null);
            deleteCurrency(d.id);
            if (ctx.openId === d.id) ctx.open(null);
            show("success", `${d.shortcut} deleted`);
          }}
        />
      </>
    ),
  };
}
