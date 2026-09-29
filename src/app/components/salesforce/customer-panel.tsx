import * as React from "react";
import { Link } from "react-router";
import { ArrowRightLeft, CirclePause, CirclePlay, MoreHorizontal, Network as NetworkIcon, Tag, UserPlus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, DANGER_BTN, Dialog, Field, GHOST, GHOST_SM, ICON_BTN, INPUT, MenuItem, NUM, Popover, Segmented, Select, TEXTAREA, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Customer, HubOrder, HubStatus, Source } from "./data";
import { day, dayTime, evaluate, npr } from "./engine";
import { customersStore, hubStore, playbooksStore, schemesStore, typesStore } from "./store";
import { sfPath } from "./shell";
import { Dot, Fact, Money, Progress, Section, SidePanel, TypeMark } from "./ui";
import { RecordActivity, RecordNoteFoot, logChange } from "./network-log";
import {
  LEVEL_LABEL,
  PORTAL_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  childrenOf,
  descendantsOf,
  eligibleNow,
  getsSentence,
  mechanicText,
  parentOf,
  repById,
  supplyStore,
  terrPath,
  typeIn,
} from "./network-model";

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMER PANEL — one customer in the trade network
//
// Top to bottom: what its type gives it, who serves it (and whom it serves),
// its credit, its recent orders from every channel, the schemes it qualifies
// for today, its portal users, then History and Notes. The actions are the
// ones a sales manager takes from here: change type, change who serves it,
// hold/release, invite a portal user, start an order.
// ════════════════════════════════════════════════════════════════════════════

const SOURCE: Record<Source, string> = { rep: "Rep", portal: "Dealer portal", whatsapp: "WhatsApp", "retailer-app": "Retailer app", "back-office": "Back office" };
const HUB_TONE: Record<HubStatus, { tone: "danger" | "info" | "good" | "off"; label: string }> = {
  review: { tone: "danger", label: "Needs review" },
  ready: { tone: "info", label: "Ready" },
  approved: { tone: "good", label: "Approved" },
  rejected: { tone: "off", label: "Rejected" },
};

export function CustomerPanel({ id, onClose, onOpen }: { id: string; onClose: () => void; onOpen: (id: string) => void }) {
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const playbooks = useStore(playbooksStore);
  const schemes = useStore(schemesStore);
  const hub = useStore(hubStore);
  const supply = useStore(supplyStore);
  const { toast, show, dismiss } = useToast();
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = React.useState(false);
  const [dialog, setDialog] = React.useState<null | "type" | "parent" | "hold" | "invite">(null);
  const [allKids, setAllKids] = React.useState(false);
  React.useEffect(() => setAllKids(false), [id]);

  const c = customers.find((x) => x.id === id);
  if (!c) {
    return (
      <SidePanel open onClose={onClose} title="Customer not found">
        <p className="m-0 text-[12.5px] text-bz-text-muted">This customer is not in the list any more. Close the panel and pick another.</p>
      </SidePanel>
    );
  }
  const t = typeIn(types, c.typeId);
  const parentId = parentOf(c, supply);
  const parent = customers.find((x) => x.id === parentId);
  const kids = childrenOf(c.id, customers, supply);
  const rep = repById(c.repId);
  const path = terrPath(c.territoryId);
  const orders = hub.filter((o) => o.customerId === c.id).sort((a, b) => b.at.localeCompare(a.at));
  const live = schemes.filter((s) => s.status === "live" && s.applies !== "payment" && eligibleNow(s, c) === null);
  const payment = schemes.filter((s) => s.status === "live" && s.applies === "payment" && eligibleNow(s, c) === null);
  const soon = schemes.filter((s) => s.status === "scheduled" && eligibleNow(s, c, s.from) === null);
  const available = Math.max(0, c.creditLimit - c.outstanding);
  const used = c.creditLimit ? (c.outstanding / c.creditLimit) * 100 : 0;
  const subject = `customer:${c.id}`;

  const update = (patch: Partial<Customer>) => customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, ...patch } : x)));
  const release = () => {
    update({ status: "active" });
    logChange(subject, "released the hold");
    show("success", `${c.name} is released. New orders go through again.`, { label: "Undo", run: () => update({ status: "on hold" }) });
  };

  return (
    <SidePanel
      open
      width={640}
      onClose={onClose}
      eyebrow={
        <span className="inline-flex items-center gap-2">
          <TypeMark name={t.name} color={t.color} className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft" />
          <span className={NUM}>{c.code}</span>
        </span>
      }
      title={c.name}
      meta={
        <>
          <Dot tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Dot>
          <span>{path.map((p) => p.name).join(" › ")}</span>
          <span>{rep ? rep.name : "No rep"}</span>
          <span className={NUM}>Since {c.since.slice(0, 4)}</span>
        </>
      }
      actions={
        <>
          <Link to={sfPath("orders")} className={cn(GHOST_SM, "hidden sm:inline-flex")}>
            New order
          </Link>
          <button ref={menuRef} type="button" onClick={() => setMenu(true)} className={ICON_BTN} aria-label="More actions" title="More actions">
            <MoreHorizontal size={15} />
          </button>
          <Popover open={menu} anchor={menuRef.current} onClose={() => setMenu(false)} align="right" width={230}>
            <MenuItem icon={Tag} onClick={() => (setMenu(false), setDialog("type"))}>
              Change type
            </MenuItem>
            <MenuItem icon={ArrowRightLeft} onClick={() => (setMenu(false), setDialog("parent"))}>
              Change who serves it
            </MenuItem>
            {t.portal !== "none" && (
              <MenuItem icon={UserPlus} onClick={() => (setMenu(false), setDialog("invite"))}>
                Invite a portal user
              </MenuItem>
            )}
            {c.status === "on hold" ? (
              <MenuItem icon={CirclePlay} onClick={() => (setMenu(false), release())}>
                Release
              </MenuItem>
            ) : (
              <MenuItem icon={CirclePause} danger onClick={() => (setMenu(false), setDialog("hold"))}>
                Put on hold
              </MenuItem>
            )}
            <div className="sm:hidden">
              <Link to={sfPath("orders")} className="flex w-full rounded-bz-sm px-2 py-1.5 text-[12.5px] text-bz-text hover:bg-bz-paper-warm">
                New order
              </Link>
            </div>
          </Popover>
        </>
      }
      foot={<RecordNoteFoot subject={subject} />}
    >
      {c.status === "on hold" && (
        <div className="mb-6 flex items-center gap-3 rounded-bz-md bg-bz-red-soft px-3 py-2.5 text-[12px] text-bz-red">
          <span className="min-w-0 flex-1">On hold — new orders from any channel are blocked.</span>
          <button type="button" onClick={release} className="shrink-0 text-[11.5px] font-semibold underline underline-offset-2">
            Release
          </button>
        </div>
      )}

      <Section title={`What a ${t.name.toLowerCase()} gets`} className="mt-2" action={<button type="button" onClick={() => setDialog("type")} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">Change type</button>}>
        <p className="m-0 text-[12.5px] leading-relaxed text-bz-text">{getsSentence(t, playbooks)}</p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Fact label="Price list">{t.priceOff ? `−${t.priceOff}%` : "List price"}</Fact>
          <Fact label="Credit">{t.creditDays} days · {t.creditStop === "hard" ? "block" : "warn"}</Fact>
          <Fact label="Portal">{PORTAL_LABEL[t.portal]}</Fact>
          <Fact label="Playbook">{playbooks.find((p) => p.id === t.playbookId)?.name ?? "None"}</Fact>
        </div>
      </Section>

      <Section title="Network" className="mt-8">
        <div className="flex items-center gap-2 text-[12.5px]">
          <NetworkIcon size={13} className="shrink-0 text-bz-text-soft" />
          {parent ? (
            <span className="min-w-0 flex-1 text-bz-text-muted">
              Served by{" "}
              <button type="button" onClick={() => onOpen(parent.id)} className="font-medium text-bz-text hover:underline">
                {parent.name}
              </button>{" "}
              <span className="text-bz-text-soft">· {typeIn(types, parent.typeId).name.toLowerCase()}</span>
            </span>
          ) : (
            <span className="min-w-0 flex-1 text-bz-text-muted">Billed by you directly — no distributor in between.</span>
          )}
          <button type="button" onClick={() => setDialog("parent")} className="shrink-0 text-[11.5px] text-bz-text-soft hover:text-bz-text">
            Change
          </button>
        </div>
        {(t.ownCustomers || kids.length > 0) && (
          <div className="mt-4">
            <p className="m-0 mb-2 text-[11.5px] text-bz-text-muted">
              Its own customers <span className={cn("text-bz-text-soft", NUM)}>{kids.length}</span>
              {kids.length > 0 && (
                <span className="text-bz-text-soft">
                  {" "}
                  · {descendantsOf(c.id, customers, supply).length} in its whole network · <Money value={kids.reduce((s, k) => s + k.outstanding, 0)} /> owed to it
                </span>
              )}
            </p>
            {kids.length === 0 ? (
              <p className="m-0 text-[11.5px] text-bz-text-soft">No customers linked yet. Link a retailer from its own panel with “Change who serves it”.</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
                {(allKids ? kids : kids.slice(0, 6)).map((k) => {
                  const kt = typeIn(types, k.typeId);
                  return (
                    <li key={k.id}>
                      <button type="button" onClick={() => onOpen(k.id)} className="flex w-full items-center gap-3 px-1 py-2 text-left hover:bg-bz-paper-warm/60">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium text-bz-text">{k.name}</span>
                          <span className="block truncate text-[11px] text-bz-text-soft">
                            {kt.name} · {k.city}
                          </span>
                        </span>
                        {k.overdue > 0 && <span className={cn("shrink-0 text-[11px] text-bz-red", NUM)}>{npr(k.overdue)} overdue</span>}
                        <Money value={k.outstanding} code={false} className="shrink-0 text-[12px] text-bz-text" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {kids.length > 6 && (
              <button type="button" onClick={() => setAllKids((v) => !v)} className="mt-2 text-[11.5px] text-bz-text-soft hover:text-bz-text">
                {allKids ? "Show fewer" : `Show all ${kids.length}`}
              </button>
            )}
          </div>
        )}
      </Section>

      <Section title="Credit" className="mt-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Fact label="Limit">
            <Money value={c.creditLimit} />
          </Fact>
          <Fact label="Outstanding">
            <Money value={c.outstanding} />
          </Fact>
          <Fact label="Overdue">
            <Money value={c.overdue} className={c.overdue ? "text-bz-red" : "text-bz-text-soft"} />
          </Fact>
          <Fact label="Available">
            <Money value={available} />
          </Fact>
        </div>
        <Progress pct={used} tone={c.overdue ? "danger" : used > 85 ? "warn" : "good"} className="mt-4" />
        <p className="m-0 mt-2 text-[11px] text-bz-text-soft">
          {c.overdue > 0
            ? `New orders go to review until the ${npr(c.overdue)} overdue is paid.`
            : used > 85
              ? `${Math.round(used)}% of the limit is used. An order over NPR ${npr(available)} is ${t.creditStop === "hard" ? "blocked" : "sent to review"}.`
              : `${Math.round(used)}% of the limit is used.`}
        </p>
      </Section>

      <Section title="Recent orders" count={orders.length} className="mt-8" action={<Link to={sfPath("orders")} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">Orders hub</Link>}>
        {orders.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No orders in the hub yet.</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {orders.slice(0, 5).map((o) => (
              <OrderLine key={o.id} o={o} total={evaluate(o.customerId, o.lines, schemes).total} />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Schemes it gets today" count={live.length + payment.length} className="mt-8">
        {live.length + payment.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No live scheme covers a {t.name.toLowerCase()} in {path[path.length - 1]?.name ?? "this territory"}.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {[...live, ...payment].map((s) => (
              <li key={s.id}>
                <Link to={sfPath(`schemes/${s.id}`)} className="group block">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text group-hover:underline">{s.name}</span>
                  <span className="block truncate text-[11px] text-bz-text-soft">
                    {mechanicText(s.mechanic)} · until {day(s.to)}
                    {s.applies === "payment" ? " · on payment" : s.applies === "claim" ? " · by claim" : s.applies === "period" ? " · end of period" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {soon.length > 0 && <p className="m-0 mt-3 text-[11px] text-bz-text-soft">Starting soon: {soon.map((s) => `${s.name} (${day(s.from)})`).join(", ")}.</p>}
      </Section>

      {t.portal !== "none" && (
        <Section
          title={t.portal === "dealer" ? "Portal users" : "Retailer app users"}
          count={c.portalUsers.length}
          className="mt-8"
          action={
            <button type="button" onClick={() => setDialog("invite")} className={GHOST_SM}>
              <UserPlus size={12} /> Invite user
            </button>
          }
        >
          {c.portalUsers.length === 0 ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">Nobody from {c.name} can sign in yet.</p>
          ) : (
            <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {c.portalUsers.map((u, i) => (
                <li key={`${u.name}-${i}`} className="flex items-center gap-3 px-1 py-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[10px] font-semibold text-bz-text-muted">
                    {u.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-bz-text">{u.name}</span>
                    <span className="block text-[11px] text-bz-text-soft">{u.role}</span>
                  </span>
                  <span className={cn("shrink-0 text-[11px]", u.lastSeen ? "text-bz-text-muted" : "text-bz-text-soft")}>
                    {u.lastSeen ? `Seen ${u.lastSeen === SF_TODAY ? "today" : day(u.lastSeen)}` : "Invited, not signed in"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <RecordActivity subject={subject} />

      <ChangeTypeDialog open={dialog === "type"} c={c} onClose={() => setDialog(null)} onDone={(msg) => show("success", msg)} />
      <ServedByDialog open={dialog === "parent"} c={c} onClose={() => setDialog(null)} onDone={(msg) => show("success", msg)} />
      <HoldDialog open={dialog === "hold"} c={c} onClose={() => setDialog(null)} onDone={(msg) => show("info", msg, { label: "Undo", run: () => update({ status: "active" }) })} />
      <InviteDialog open={dialog === "invite"} c={c} onClose={() => setDialog(null)} onDone={(msg) => show("success", msg)} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SidePanel>
  );
}

function OrderLine({ o, total }: { o: HubOrder; total: number }) {
  const st = HUB_TONE[o.status];
  return (
    <li>
      <Link to={sfPath(`orders/${o.id}`)} className="flex items-center gap-3 px-1 py-2 hover:bg-bz-paper-warm/60">
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[12px] font-medium text-bz-text", NUM)}>
            {o.id}
            {o.soNo && <span className="font-normal text-bz-text-soft"> → {o.soNo}</span>}
          </span>
          <span className="block truncate text-[11px] text-bz-text-soft">
            {dayTime(o.at)} · {SOURCE[o.source]} · {o.byName}
          </span>
        </span>
        <Dot tone={st.tone} className="hidden sm:inline-flex">
          {st.label}
        </Dot>
        <Money value={total} code={false} className="shrink-0 text-[12px] text-bz-text" />
      </Link>
    </li>
  );
}

// ── Dialogs ─────────────────────────────────────────────────────────────────

function ChangeTypeDialog({ open, c, onClose, onDone }: { open: boolean; c: Customer; onClose: () => void; onDone: (msg: string) => void }) {
  const types = useStore(typesStore);
  const playbooks = useStore(playbooksStore);
  const [to, setTo] = React.useState(c.typeId);
  React.useEffect(() => setTo(c.typeId), [open, c.typeId]);
  const next = typeIn(types, to);
  const save = () => {
    const from = typeIn(types, c.typeId);
    customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, typeId: to } : x)));
    logChange(`customer:${c.id}`, `changed the type from ${from.name} to ${next.name}`);
    onDone(`${c.name} is now a ${next.name.toLowerCase()}.`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      eyebrow={c.name}
      title="Change type"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save} disabled={to === c.typeId}>
            Change type
          </button>
        </>
      }
    >
      <Field label="Type">
        <Select
          trigger="ghost"
          width={300}
          value={to}
          onChange={setTo}
          label={next.name}
          className="w-full justify-between"
          options={types.map((t) => ({ value: t.id, label: t.name, hint: `${LEVEL_LABEL[t.level]} · ${t.priceOff ? `${t.priceOff}% off` : "list price"} · ${PORTAL_LABEL[t.portal]}` }))}
        />
      </Field>
      <p className="m-0 mt-4 text-[12px] leading-relaxed text-bz-text">{getsSentence(next, playbooks)}</p>
      <p className="m-0 mt-2 text-[11px] text-bz-text-soft">Open orders keep their prices. The new terms apply from the next order.</p>
    </Dialog>
  );
}

function ServedByDialog({ open, c, onClose, onDone }: { open: boolean; c: Customer; onClose: () => void; onDone: (msg: string) => void }) {
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const supply = useStore(supplyStore);
  const current = parentOf(c, supply) ?? "direct";
  const [to, setTo] = React.useState(current);
  React.useEffect(() => setTo(current), [open, current]);
  const below = new Set(descendantsOf(c.id, customers, supply).map((x) => x.id));
  const options = [
    { value: "direct", label: "Billed by you directly", hint: "No distributor in between" },
    ...customers
      .filter((x) => x.id !== c.id && !below.has(x.id) && typeIn(types, x.typeId).ownCustomers)
      .map((x) => ({ value: x.id, label: x.name, hint: `${typeIn(types, x.typeId).name} · ${x.city}`, group: typeIn(types, x.typeId).plural })),
  ];
  const name = (v: string) => (v === "direct" ? "you directly" : customers.find((x) => x.id === v)?.name ?? v);
  const save = () => {
    const parentId = to === "direct" ? null : to;
    customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, parentId } : x)));
    supplyStore.set((s) => {
      const n = { ...s };
      delete n[c.id];
      return n;
    });
    logChange(`customer:${c.id}`, `changed who serves it from ${name(current)} to ${name(to)}`);
    onDone(parentId ? `${c.name} is now served by ${name(to)}.` : `${c.name} is now billed by you directly.`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      eyebrow={c.name}
      title="Change who serves it"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save} disabled={to === current}>
            Save
          </button>
        </>
      }
    >
      <Field label="Served by" hint="Only types that have their own customers can serve another customer.">
        <Select trigger="ghost" width={320} value={to} onChange={setTo} label={to === "direct" ? "Billed by you directly" : name(to)} className="w-full justify-between" options={options} searchable />
      </Field>
      <p className="m-0 mt-4 text-[11px] text-bz-text-soft">The distributor bills this customer from its next order. Its orders so far stay where they are.</p>
    </Dialog>
  );
}

function HoldDialog({ open, c, onClose, onDone }: { open: boolean; c: Customer; onClose: () => void; onDone: (msg: string) => void }) {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => setReason(""), [open]);
  const save = () => {
    customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: "on hold" } : x)));
    logChange(`customer:${c.id}`, `put the customer on hold${reason.trim() ? ` — ${reason.trim()}` : ""}`);
    onDone(`${c.name} is on hold. New orders are blocked.`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={c.name}
      title="Put on hold"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={DANGER_BTN} onClick={save}>
            Put on hold
          </button>
        </>
      }
    >
      <p className="m-0 mb-3 text-[12px] text-bz-text">New orders from reps, the portal and the back office are blocked until you release it.</p>
      <Field label="Reason" hint="Shown in its history.">
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={TEXTAREA} placeholder="e.g. Cheque bounced on 2 Sep" />
      </Field>
    </Dialog>
  );
}

function InviteDialog({ open, c, onClose, onDone }: { open: boolean; c: Customer; onClose: () => void; onDone: (msg: string) => void }) {
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [role, setRole] = React.useState<"Owner" | "Buyer" | "Accounts">("Buyer");
  React.useEffect(() => {
    setName("");
    setContact("");
    setRole(c.portalUsers.length ? "Buyer" : "Owner");
  }, [open, c.portalUsers.length]);
  const ok = name.trim().length > 1 && contact.trim().length > 5;
  const save = () => {
    customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, portalUsers: [...x.portalUsers, { name: name.trim(), role, lastSeen: null }] } : x)));
    logChange(`customer:${c.id}`, `invited ${name.trim()} to the portal as ${role}`);
    onDone(`Invite sent to ${name.trim()}.`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      eyebrow={c.name}
      title="Invite a portal user"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save} disabled={!ok}>
            Send invite
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Name" required>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={INPUT} placeholder="Full name" />
        </Field>
        <Field label="Mobile or email" required hint="The invite link goes here.">
          <input value={contact} onChange={(e) => setContact(e.target.value)} className={INPUT} placeholder="98XXXXXXXX or name@company.com" />
        </Field>
        <Field label="Role" hint={role === "Owner" ? "Everything, including adding users." : role === "Buyer" ? "Places and tracks orders." : "Sees statements, pays and raises claims."}>
          <Segmented<"Owner" | "Buyer" | "Accounts"> value={role} onChange={setRole} options={[{ value: "Owner", label: "Owner" }, { value: "Buyer", label: "Buyer" }, { value: "Accounts", label: "Accounts" }]} />
        </Field>
      </div>
    </Dialog>
  );
}
