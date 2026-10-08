import * as React from "react";
import { useNavigate } from "react-router";
import { PackagePlus, Pencil, ShieldAlert, Table2, Truck } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Dialog, Field, GHOST, GHOST_SM, INPUT, LABEL, MenuItem, NUM, NumberField } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { Amount } from "../sales/orders";
import { Cell, CellGrid } from "../sales/parts";
import { Block, RecordShell, StepCard } from "../sales/record";
import type { ShellCtx } from "../sales/record";
import { useStore } from "../sales/store";
import type { BrandingJob, PosmItem } from "./data";
import { day, npr } from "./engine";
import { nextId } from "./persist";
import { logEvent } from "./records";
import { brandingStore, customersStore, posmStore } from "./store";
import { PillTabs } from "./fx";
import { FxDesk } from "./fx-desk";
import { SfActivity, SfNoteFoot, chipTone, sfPath } from "./sf";
import { STAGE_LABEL, STAGE_TONE, customerName } from "./activationKit";
import { MoneyInput, More, SuggestInput } from "./network-form";

// ════════════════════════════════════════════════════════════════════════════
// GROWTH · BRANDING · MATERIALS — the stock the requests draw from
//
// Sign boards, standees, coolers: what is held, what the open requests ask
// for and what is up at shops. Stock goes in by receiving and out by approving
// a request (BrandingPage); rejecting an approved request puts it back.
// ════════════════════════════════════════════════════════════════════════════

export type Show = ShellCtx["show"];
export const DASH = <span className="text-bz-text-soft">—</span>;
export const materialPath = (id: string) => `${sfPath(`branding/${id}`)}?view=materials`;
export const moveStock = (posmId: string, by: number) => posmStore.set((ps) => ps.map((p) => (p.id === posmId ? { ...p, stock: p.stock + by } : p)));

/**
 * Requests · Materials. Each is its own `FxDesk` (their columns, figures and "New" differ), so the switch between
 * them is a pill tray in the desk's `viewTabs` slot, first in the controls row.
 */
export function DeskTabs({ view }: { view: "requests" | "materials" }) {
  const waiting = useStore(brandingStore).filter((j) => j.stage === "requested").length;
  return (
    <PillTabs<"requests" | "materials">
      value={view}
      options={[
        { value: "requests", label: "Requests", count: waiting, to: sfPath("branding") },
        { value: "materials", label: "Materials", to: `${sfPath("branding")}?view=materials` },
      ]}
    />
  );
}

type MRow = { p: PosmItem; jobs: BrandingJob[]; need: number; out: number };

export function MaterialsDesk() {
  const jobs = useStore(brandingStore);
  const posm = useStore(posmStore);
  useStore(customersStore);
  const showRef = React.useRef<Show | null>(null);
  const [itemDialog, setItemDialog] = React.useState<{ item?: PosmItem } | null>(null);
  const [receive, setReceive] = React.useState<PosmItem | null>(null);

  const rows: MRow[] = posm.map((p) => {
    const mine = jobs.filter((j) => j.posmId === p.id).sort((a, b) => b.requestedOn.localeCompare(a.requestedOn));
    return { p, jobs: mine, need: mine.filter((j) => j.stage === "requested").reduce((s, j) => s + j.qty, 0), out: mine.filter((j) => j.stage === "installed").reduce((s, j) => s + j.qty, 0) };
  });
  const vendors = [...new Set(posm.map((p) => p.vendor.trim()).filter(Boolean))];
  const outOf = rows.filter((r) => r.p.stock === 0).length;
  const short = (r: MRow) => r.p.stock < r.need;

  return (
    <FxDesk<MRow>
      place="branding"
      section="salesforce/branding"
      noun={["material", "materials"]}
      partyLabel="Material"
      amountLabel="Unit cost"
      showPeriod={false}
      keepParams={["view"]}
      rows={rows}
      noOf={(r) => r.p.id}
      rowLabel={(r) => r.p.name}
      searchText={(r) => `${r.p.id} ${r.p.name} ${r.p.vendor}`}
      searchPlaceholder="Name or vendor"
      stats={[{ label: "Stock value", value: <Amount value={posm.reduce((s, p) => s + p.stock * p.cost, 0)} currency="NPR" /> }]}
      picks={[
        { key: "out", label: "Out of stock", value: outOf, test: (r) => r.p.stock === 0, danger: outOf > 0 },
        { key: "short", label: "Short of stock", value: rows.filter(short).length, test: short, title: "Less in stock than the open requests ask for" },
      ]}
      views={[{ key: "all", label: "", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] }]}
      filters={vendors.map((v) => ({ value: `v:${v}`, label: v, group: "Vendor", test: (r: MRow) => r.p.vendor.trim() === v }))}
      sorts={[
        { key: "name", label: "Name", by: (r) => r.p.name.toLowerCase() },
        { key: "stock", label: "Lowest stock", by: (r) => r.p.stock },
        { key: "cost", label: "Unit cost", by: (r) => r.p.cost, desc: true },
      ]}
      columns={[
        {
          key: "stock",
          label: "In stock",
          width: "104px",
          align: "right",
          render: (r) =>
            r.p.stock === 0 ? (
              <span className="font-semibold text-bz-red">Out of stock</span>
            ) : (
              <span className={NUM}>
                {r.p.stock} <span className="text-bz-text-soft">{r.p.unit}</span>
              </span>
            ),
        },
        { key: "asked", label: "Asked for", width: "84px", align: "right", render: (r) => (r.need ? <span className={cn(NUM, short(r) && "font-semibold text-bz-red")}>{r.need}</span> : DASH) },
        { key: "shops", label: "At shops", width: "84px", align: "right", render: (r) => (r.out ? <span className={NUM}>{r.out}</span> : DASH) },
      ]}
      primary={(r) => ({ title: r.p.name, sub: r.p.vendor || "No vendor", subOnDesktop: true })}
      amount={(r) => ({ value: <Amount value={r.p.cost} />, sub: `per ${r.p.unit}` })}
      rowVerb={(r) => ({ label: "Receive", icon: PackagePlus, run: () => setReceive(r.p) })}
      bulk={[
        {
          label: "Set vendor",
          icon: Truck,
          enabled: (rs) => rs.length > 0 && vendors.length > 0,
          choose: { options: vendors.map((v) => ({ value: v, label: v })), placeholder: "Find a vendor…" },
          run: (rs, v) => {
            const to = v ?? "";
            const skipped = rs.filter((r) => r.p.vendor === to).map((r) => `${r.p.id} already has ${to}`);
            const ids = rs.filter((r) => r.p.vendor !== to).map((r) => r.p.id);
            posmStore.set((ps) => ps.map((p) => (ids.includes(p.id) ? { ...p, vendor: to } : p)));
            ids.forEach((id) => logEvent(id, "changed the vendor"));
            return { done: ids.length, skipped, verb: `now from ${to}` };
          },
        },
      ]}
      newLabel="New material"
      onNew={() => setItemDialog({})}
      renderPanel={(r, ctx) => <MaterialPanel key={r.p.id} r={r} ctx={ctx} onEdit={() => setItemDialog({ item: r.p })} onReceive={() => setReceive(r.p)} />}
      viewTabs={<DeskTabs view="materials" />}
      renderExtra={({ show, go }) => {
        showRef.current = show;
        return (
          <>
            <MaterialDialog
              open={!!itemDialog}
              item={itemDialog?.item}
              onClose={() => setItemDialog(null)}
              onSaved={(id, created) => {
                show("success", created ? "Material added" : "Material saved");
                if (created) go(id);
              }}
            />
            <ReceiveDialog item={receive} onClose={() => setReceive(null)} show={show} />
          </>
        );
      }}
    />
  );
}

function MaterialPanel({ r, ctx, onEdit, onReceive }: { r: MRow; ctx: PanelCtx; onEdit: () => void; onReceive: () => void }) {
  const navigate = useNavigate();
  const { p, need, out } = r;
  const empty = p.stock === 0;
  const short = p.stock < need;
  return (
    <RecordShell
      ctx={ctx}
      no={p.id}
      chips={empty ? <Chip tone="danger">Out of stock</Chip> : short ? <Chip tone="pending">Short of stock</Chip> : <Chip tone="neutral">In stock</Chip>}
      title={p.name}
      amount={
        <span className={cn("text-[13px] font-medium text-bz-text-muted", NUM)}>
          {p.stock} {p.unit}
        </span>
      }
      meta={[
        p.vendor && <span key="v">{p.vendor}</span>,
        <span key="c" className={NUM}>
          NPR {npr(p.cost)} per {p.unit}
        </span>,
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} onClick={() => (close(), onEdit())}>
            Edit material…
          </MenuItem>
          <MenuItem icon={PackagePlus} onClick={() => (close(), onReceive())}>
            Receive stock…
          </MenuItem>
        </>
      )}
      foot={<SfNoteFoot id={p.id} />}
    >
      {(empty || short) && (
        <StepCard
          tone={empty ? "danger" : "plain"}
          icon={<ShieldAlert size={15} />}
          title={empty ? "Out of stock" : "Short of stock"}
          sub={need ? `${need} ${p.unit} asked for, ${p.stock} in stock.` : undefined}
          actions={
            <button type="button" className={cn(BTN, "h-8")} onClick={onReceive}>
              <PackagePlus size={13} /> Receive stock
            </button>
          }
        />
      )}

      <Block
        title="Stock"
        right={
          // While the step card above asks for stock, it holds the one Receive button.
          empty || short ? undefined : (
            <button type="button" className={GHOST_SM} onClick={onReceive}>
              <PackagePlus size={11} /> Receive stock
            </button>
          )
        }
      >
        <CellGrid>
          <Cell label="In stock">
            <span className={NUM}>
              {p.stock} {p.unit}
            </span>
          </Cell>
          <Cell label="Stock value">
            <Amount value={p.cost * p.stock} currency="NPR" />
          </Cell>
          <Cell label="Asked for">{need ? <span className={cn(NUM, short && "font-semibold text-bz-red")}>{`${need} ${p.unit}`}</span> : DASH}</Cell>
          <Cell label="Up at shops">{out ? <span className={NUM}>{`${out} ${p.unit}`}</span> : DASH}</Cell>
        </CellGrid>
      </Block>

      <Block
        title="Details"
        right={
          <button type="button" className={GHOST_SM} onClick={onEdit}>
            <Pencil size={11} /> Edit
          </button>
        }
      >
        <CellGrid>
          <Cell label="Unit cost">
            <Amount value={p.cost} currency="NPR" />
          </Cell>
          <Cell label="Vendor">{p.vendor || DASH}</Cell>
        </CellGrid>
      </Block>

      <Block title="Requests" count={r.jobs.length}>
        {r.jobs.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No requests yet.</p>
        ) : (
          <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
            <div className={cn("hidden grid-cols-[76px_minmax(0,1fr)_88px_110px] gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
              <span>Request</span>
              <span>Customer</span>
              <span className="text-right">Qty</span>
              <span>Stage</span>
            </div>
            {r.jobs.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => navigate(sfPath(`branding/${j.id}`))}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-bz-line-soft px-3 py-2 text-left text-[12px] last:border-0 hover:bg-bz-paper-warm sm:grid-cols-[76px_minmax(0,1fr)_88px_110px]"
              >
                <span className={cn("hidden font-medium text-bz-text sm:block", NUM)}>{j.id}</span>
                <span className="min-w-0">
                  <span className="block truncate text-bz-text">{customerName(j.customerId)}</span>
                  <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                    <span className="sm:hidden">
                      {j.id} · {j.qty} {p.unit} ·{" "}
                    </span>
                    {j.requestedBy} · {day(j.requestedOn)}
                  </span>
                </span>
                <span className={cn("hidden text-right text-bz-text-muted sm:block", NUM)}>
                  {j.qty} {p.unit}
                </span>
                <span>
                  <Chip tone={chipTone(STAGE_TONE[j.stage])}>{STAGE_LABEL[j.stage]}</Chip>
                </span>
              </button>
            ))}
          </div>
        )}
      </Block>

      <SfActivity ids={[p.id]} />
    </RecordShell>
  );
}

// ── Stock in, and the material itself ───────────────────────────────────────

export function ReceiveDialog({ item, onClose, show }: { item: PosmItem | null; onClose: () => void; show: Show }) {
  const [qty, setQty] = React.useState(10);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (item) (setQty(10), setTried(false));
  }, [item]);
  const add = () => {
    if (!item) return;
    if (qty <= 0) return setTried(true);
    moveStock(item.id, qty);
    logEvent(item.id, `received ${qty} ${item.unit} · ${item.stock + qty} in stock`);
    show("success", `${qty} ${item.unit} of ${item.name.toLowerCase()} received`);
    onClose();
  };
  return (
    <Dialog
      open={!!item}
      size="sm"
      title="Receive stock"
      eyebrow={item?.name}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={add}>
            Receive
          </button>
        </>
      }
    >
      <Field label="Quantity">
        <span className="flex items-center gap-2">
          <NumberField value={qty} onChange={setQty} min={1} invalid={tried && qty <= 0} className="w-28" ariaLabel="Quantity" />
          <span className={cn("text-[11.5px] text-bz-text-muted", NUM)}>
            {item?.unit} · {item?.stock} in stock
          </span>
        </span>
        {tried && qty <= 0 && <span className="text-[10.5px] text-bz-red">Enter a number above 0.</span>}
      </Field>
    </Dialog>
  );
}

/** New material, or edit one. Stock changes by receiving, approving and rejecting — only a new material sets it. */
export function MaterialDialog({ open, item, onClose, onSaved }: { open: boolean; item?: PosmItem; onClose: () => void; onSaved: (id: string, created: boolean) => void }) {
  const posm = useStore(posmStore);
  const [name, setName] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [cost, setCost] = React.useState<number | null>(null);
  const [stock, setStock] = React.useState(0);
  const [vendor, setVendor] = React.useState("");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setName(item?.name ?? "");
    setUnit(item?.unit ?? "");
    setCost(item ? item.cost : null);
    setStock(item?.stock ?? 0);
    setVendor(item?.vendor ?? "");
    setTried(false);
  }, [open, item]);

  const missing = !name.trim() || !unit.trim();
  const save = () => {
    setTried(true);
    if (missing) return;
    const costN = cost ?? 0;
    if (item) {
      const next = { ...item, name: name.trim(), unit: unit.trim(), cost: costN, vendor: vendor.trim() };
      posmStore.set((ps) => ps.map((p) => (p.id === item.id ? { ...p, name: next.name, unit: next.unit, cost: next.cost, vendor: next.vendor } : p)));
      const changed = [item.name !== next.name && "name", item.unit !== next.unit && "unit", item.cost !== next.cost && `cost to NPR ${npr(costN)}`, item.vendor !== next.vendor && "vendor"].filter(Boolean);
      if (changed.length) logEvent(item.id, `changed the ${changed.join(", ")}`);
      onClose();
      onSaved(item.id, false);
      return;
    }
    const id = nextId("PM-", posmStore.get().map((p) => p.id));
    posmStore.set((ps) => [...ps, { id, name: name.trim(), unit: unit.trim(), cost: costN, stock, vendor: vendor.trim() }]);
    logEvent(id, `added the item with ${stock} ${unit.trim()} in stock`);
    onClose();
    onSaved(id, true);
  };

  return (
    <Dialog
      open={open}
      title={item ? "Edit material" : "New material"}
      eyebrow={item?.id}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            {item ? "Save" : "Add material"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Name" required>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={cn(INPUT, tried && !name.trim() && "border-bz-red-mark")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit" required>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="board, piece, set" className={cn(INPUT, tried && !unit.trim() && "border-bz-red-mark")} />
          </Field>
          <Field label="Cost per unit">
            <MoneyInput value={cost} onChange={setCost} blank ariaLabel="Cost per unit" />
          </Field>
        </div>
        {!item && (
          <Field label="In stock now">
            <NumberField value={stock} onChange={setStock} min={0} className="h-9 w-28" ariaLabel="In stock now" />
          </Field>
        )}
        {tried && missing && <p className="m-0 text-[11.5px] text-bz-red">Enter a name and a unit.</p>}
        <More defaultOpen={!!item?.vendor}>
          <Field label="Vendor">
            <SuggestInput value={vendor} onChange={setVendor} suggestions={posm.map((p) => p.vendor)} />
          </Field>
        </More>
      </div>
    </Dialog>
  );
}
