import * as React from "react";
import { useNavigate } from "react-router";
import { Ban, Check, CircleCheck, FileText, Image as ImageIcon, ListTree, Scale, ShieldAlert, ShieldCheck, Table2, UserRound, Wallet } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Dialog, DocLink, Field, GHOST, GHOST_SM, MenuItem, MenuSep, NUM, Segmented, Select, Stat, Statline, TEXTAREA } from "../sales/bzw";
import type { Tone } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { SheetFrame } from "../sales/FulfilSheet";
import { Amount } from "../sales/orders";
import { Cell, CellGrid, ConfirmDialog, ReasonDialog } from "../sales/parts";
import { Block, CustomerTitle, RecordShell, StepCard } from "../sales/record";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Claim, ClaimKind, Customer, HubOrder, LedgerEntry, Scheme } from "./data";
import { customerById, day, eligible, evaluate, npr, typeOf } from "./engine";
import { nextId, persistentStore } from "./persist";
import { STAFF_NAME, logEvent } from "./records";
import { claimsStore, customersStore, hubStore, ledgerStore, repsStore, schemesStore } from "./store";
import { FxDate, FxDesk, pillTone } from "./fx-desk";
import { SfActivity, SfNoteFoot, TypeMark, sfPath } from "./sf";
import { addDaysIso, qualifyingCart, ruleText } from "./schemes-kit";
import { CustomerPick, MoneyInput, RepPick } from "./sell-kit";
import { isFirstOrder } from "./orders-parts";

// ════════════════════════════════════════════════════════════════════════════
// TRADE · CLAIMS — the money loop that closes a scheme (research/C §3.2–3.3)
//
// Decide (approve, approve part, reject), then settle: a customer's claim by a
// credit note, which is a ledger row that lowers what they owe; a rep's by a
// payment, which touches no customer (decision #11). For scheme and display
// claims the panel puts the system's own figure next to the claimed one —
// worked out through `evaluate`, never a second copy of the scheme maths — so
// an over-claim is visible before anyone approves it.
// ════════════════════════════════════════════════════════════════════════════

type Status = Claim["status"];
const STATUS: Record<Status, { label: string; tone: Tone }> = {
  submitted: { label: "To decide", tone: "pending" },
  approved: { label: "Approved", tone: "partial" },
  settled: { label: "Settled", tone: "positive" },
  rejected: { label: "Rejected", tone: "neutral" },
};
const KINDS: ClaimKind[] = ["Scheme", "Display", "Damage", "Price difference", "Expense"];
const KIND_HINT: Record<ClaimKind, string> = {
  Scheme: "Offer benefits the customer passed on and wants back",
  Display: "A display offer, paid on photo proof",
  Damage: "Goods that arrived broken or spoiled",
  "Price difference": "Stock bought before a price drop",
  Expense: "A rep's travel or field costs",
};

type Settle = "Credit note" | "Payment";
/** What the Claim shape has no field for yet — the decision and the settlement. */
type Decision = { approvedAmount?: number; reason?: string; decidedOn?: string; settledOn?: string; via?: Settle };
const decisionsStore = persistentStore<Record<string, Decision>>("money.claimDecisions", {}, () => ({
  "CL-550": { approvedAmount: 1_500, decidedOn: "2026-09-02" },
  "CL-547": { approvedAmount: 61_200, decidedOn: "2026-08-27", settledOn: "2026-08-29", via: "Credit note" },
  "CL-546": { reason: "Price protection covers stock bought after 1 Aug only.", decidedOn: "2026-08-24" },
}));

export const partyName = (c: Claim) => (c.partyKind === "rep" ? repsStore.get().find((r) => r.id === c.party)?.name ?? "Removed rep" : customerById(c.party)?.name ?? "Removed customer");
const approvedOf = (c: Claim, d: Decision | undefined) => d?.approvedAmount ?? c.amount;

// ── The decision and the settlement ─────────────────────────────────────────

function decide(c: Claim, patch: Partial<Claim>, dec: Decision, what: string) {
  claimsStore.set((list) => list.map((x) => (x.id === c.id ? { ...x, ...patch } : x)));
  decisionsStore.set((s) => ({ ...s, [c.id]: { ...s[c.id], ...dec } }));
  logEvent(c.id, what);
}

const approveClaim = (c: Claim, amount: number, note = "") =>
  decide(c, { status: "approved" }, { approvedAmount: amount, decidedOn: SF_TODAY, reason: note || undefined }, `approved NPR ${npr(amount)}${amount < c.amount ? ` of ${npr(c.amount)}` : ""}${note ? ` — ${note}` : ""}`);

const rejectClaim = (c: Claim, reason: string) => decide(c, { status: "rejected" }, { reason, decidedOn: SF_TODAY }, `rejected it — ${reason}`);

/** A customer is settled by a credit note on the ledger, a rep by a payment that touches no customer. Returns the document's number. */
function settleClaim(c: Claim): string {
  const approved = approvedOf(c, decisionsStore.get()[c.id]);
  if (c.partyKind === "customer") {
    const all = ledgerStore.get();
    const no = nextId("CN-", all.map((r) => r.doc), 4);
    const row: LedgerEntry = { id: `L-${no}`, customerId: c.party, date: SF_TODAY, doc: no, kind: "Credit note", debit: 0, credit: approved, due: null, by: STAFF_NAME, note: `Claim ${c.id} · ${c.kind}` };
    ledgerStore.set((l) => [...l, row]);
    logEvent(c.party, `credit note ${no} for NPR ${npr(approved)} settled claim ${c.id}`);
    decide(c, { status: "settled", settledBy: no }, { settledOn: SF_TODAY, via: "Credit note" }, `settled it by credit note ${no}`);
    return no;
  }
  const no = nextId("PMT-", claimsStore.get().map((x) => x.settledBy ?? ""), 4);
  decide(c, { status: "settled", settledBy: no }, { settledOn: SF_TODAY, via: "Payment" }, `paid it — ${no}`);
  return no;
}

// ── The system's own figure ─────────────────────────────────────────────────

type Check = { value: number; lines: string[] };

/** The scheme as the engine would have run it on `date`: live and without the budget stop, since the claim is about goods already given. */
const asRun = (s: Scheme): Scheme => ({ ...s, status: "live", budget: null });
const clampDate = (s: Scheme, iso: string) => (iso < s.from ? s.from : iso > s.to ? s.to : iso);

function systemFigure(c: Claim, s: Scheme | undefined, customers: Customer[], hub: HubOrder[]): Check | null {
  if (!s || c.partyKind !== "customer" || (c.kind !== "Scheme" && c.kind !== "Display")) return null;
  const run = asRun(s);
  const m = s.mechanic;

  if (m.kind === "display") {
    const cust = customerById(c.party);
    const date = clampDate(s, addDaysIso(c.raisedOn, -1));
    const why = eligible(run, cust, date);
    if (why) return { value: 0, lines: [`${partyName(c)} can't get this offer: ${why.toLowerCase()}.`] };
    return { value: m.amount, lines: [`One month at the offer's rate of NPR ${npr(m.amount)}.`] };
  }

  if (s.applies !== "order") return { value: 0, lines: ["This offer is not paid on a claim."] };

  // A secondary scheme: the distributor gave it to its retailers and claims it back. Count only the retailers it
  // serves that the scheme is for; price each one's hub orders with the engine, or one qualifying order when the
  // hub has none (secondary sales are not in the hub).
  const date = clampDate(s, c.raisedOn);
  const retailers = customers.filter((r) => r.parentId === c.party && !eligible(run, r, date));
  if (!retailers.length) return { value: 0, lines: [`No customer served by ${partyName(c)} can get this offer.`] };
  let fromHub = 0;
  let withOrders = 0;
  let estimated = 0;
  for (const r of retailers) {
    const orders = hub.filter((o) => o.customerId === r.id && o.status !== "rejected" && o.at.slice(0, 10) >= s.from && o.at.slice(0, 10) <= s.to);
    const got = orders.reduce((sum, o) => sum + (evaluate(r.id, o.lines, [run], { date: o.at.slice(0, 10), firstOrder: isFirstOrder(o, hub) }).applied.find((a) => a.schemeId === s.id)?.benefit ?? 0), 0);
    if (got > 0) {
      fromHub += got;
      withOrders++;
    } else {
      estimated += evaluate(r.id, qualifyingCart(m), [run], { date }).applied.find((a) => a.schemeId === s.id)?.benefit ?? 0;
    }
  }
  const said = /(\d+) retailers/.exec(c.basis)?.[1];
  const lines = [`${retailers.length} customers served by ${partyName(c)} can get this offer${said ? ` — the claim says ${said}` : ""}.`];
  if (withOrders) lines.push(`${withOrders} have orders with it: NPR ${npr(fromHub)}.`);
  if (retailers.length - withOrders > 0) lines.push(`${retailers.length - withOrders} counted at one qualifying order each: NPR ${npr(estimated)}.`);
  return { value: fromHub + estimated, lines };
}

// ── Evidence ────────────────────────────────────────────────────────────────

function evidenceOf(c: Claim) {
  const photos = Number(/(\d+) photos?/.exec(c.basis)?.[1] ?? 0);
  const bills = /bills? attached/i.test(c.basis) ? 2 : 0;
  return {
    blurred: /blurred/i.test(c.basis),
    files: [...Array.from({ length: photos }, (_, i) => ({ icon: ImageIcon, label: `Photo ${i + 1}` })), ...Array.from({ length: bills }, (_, i) => ({ icon: FileText, label: `Bill ${i + 1}` }))],
  };
}

// ── The desk ────────────────────────────────────────────────────────────────

type Row = { c: Claim; d: Decision | undefined; name: string; approved: number; shown: number; partial: boolean };

const is = (s: Status) => (r: Row) => r.c.status === s;
const settledThisMonth = (r: Row) => r.c.status === "settled" && (r.d?.settledOn ?? "").slice(0, 7) === SF_TODAY.slice(0, 7);
const sum = (rs: Row[]) => rs.reduce((a, r) => a + r.shown, 0);
const count = (n: number) => `${n} ${n === 1 ? "claim" : "claims"}`;

export function ClaimsPage() {
  const navigate = useNavigate();
  const claims = useStore(claimsStore);
  const decisions = useStore(decisionsStore);
  const customers = useStore(customersStore);
  const reps = useStore(repsStore);
  const [settling, setSettling] = React.useState<string | null>(null);

  const rows = React.useMemo<Row[]>(
    () =>
      [...claims]
        .sort((a, b) => b.raisedOn.localeCompare(a.raisedOn) || b.id.localeCompare(a.id))
        .map((c) => {
          const d = decisions[c.id];
          const approved = approvedOf(c, d);
          const decided = c.status === "approved" || c.status === "settled";
          return { c, d, name: partyName(c), approved, shown: decided ? approved : c.amount, partial: decided && approved !== c.amount };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [claims, decisions, customers, reps],
  );
  const total = (rs: Row[]) => (rs.length ? <Amount value={sum(rs)} currency="NPR" /> : undefined);
  const parties = Array.from(new Map(rows.map((r) => [r.c.party, r.name])));
  const toSettle = rows.find((r) => r.c.id === settling && r.c.status === "approved");

  /** Over the system's own figure — a bulk approve leaves these for a person to look at. */
  const overFigure = (c: Claim) => {
    const check = systemFigure(c, schemesStore.get().find((s) => s.id === c.schemeId), customers, hubStore.get());
    return !!check && c.amount - check.value >= 1;
  };

  return (
    <FxDesk<Row>
      place="claims"
      section="salesforce/claims"
      noun={["claim", "claims"]}
      partyLabel="Claimed by"
      rows={rows}
      noOf={(r) => r.c.id}
      numberWidth="76px"
      dateOf={(r) => r.c.raisedOn}
      searchText={(r) => `${r.c.id} ${r.name} ${r.c.kind} ${r.c.basis} ${r.c.settledBy ?? ""}`}
      searchPlaceholder="Number, name or kind"
      picks={[
        { key: "decide", label: "To decide", value: <Amount value={sum(rows.filter(is("submitted")))} currency="NPR" />, test: is("submitted"), title: count(rows.filter(is("submitted")).length) },
        { key: "settle", label: "To settle", value: <Amount value={sum(rows.filter(is("approved")))} currency="NPR" />, test: is("approved"), title: `Approved, not settled · ${count(rows.filter(is("approved")).length)}` },
        { key: "month", label: "Settled this month", value: <Amount value={sum(rows.filter(settledThisMonth))} currency="NPR" />, test: settledThisMonth, title: count(rows.filter(settledThisMonth).length) },
      ]}
      views={[
        {
          key: "queue",
          label: "Queue",
          icon: ListTree,
          groups: (rs) => [
            { key: "submitted", label: "To decide", rows: rs.filter(is("submitted")), right: total(rs.filter(is("submitted"))), empty: "Nothing to decide." },
            { key: "approved", label: "Approved, to settle", rows: rs.filter(is("approved")), right: total(rs.filter(is("approved"))) },
            { key: "settled", label: "Settled", collapsed: true, rows: rs.filter(is("settled")) },
            { key: "rejected", label: "Rejected", collapsed: true, rows: rs.filter(is("rejected")) },
          ],
        },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...(Object.keys(STATUS) as Status[]).map((s) => ({ value: `st:${s}`, label: STATUS[s].label, group: "Status", test: is(s) })),
        ...KINDS.map((k) => ({ value: `k:${k}`, label: k, group: "Kind", test: (r: Row) => r.c.kind === k })),
        ...parties.map(([id, name]) => ({ value: `by:${id}`, label: name, group: "Claimed by", test: (r: Row) => r.c.party === id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (r) => r.c.raisedOn + r.c.id, desc: true },
        { key: "old", label: "Oldest", by: (r) => r.c.raisedOn + r.c.id },
        { key: "val", label: "Amount", by: (r) => r.shown, desc: true },
        { key: "by", label: "Claimed by", by: (r) => r.name },
      ]}
      columns={[
        { key: "raised", label: "Raised", width: "76px", render: (r) => <FxDate iso={r.c.raisedOn} /> },
        { key: "kind", label: "Kind", width: "104px", render: (r) => r.c.kind },
      ]}
      primary={(r) => ({ title: r.name, sub: r.c.basis, subOnDesktop: true })}
      status={(r) => ({ label: STATUS[r.c.status].label, tone: pillTone(STATUS[r.c.status].tone) })}
      amount={(r) => ({
        value: <Amount value={r.shown} />,
        sub: [r.c.status === "settled" && r.c.settledBy ? r.c.settledBy : "", r.partial ? `of ${npr(r.c.amount)}` : ""].filter(Boolean).join(" · ") || undefined,
      })}
      rowVerb={(r) =>
        r.c.status === "submitted"
          ? { label: "Review", icon: ShieldCheck, run: () => navigate(sfPath(`claims/${r.c.id}`)) }
          : r.c.status === "approved"
            ? { label: r.c.partyKind === "rep" ? "Pay" : "Settle", icon: Wallet, run: () => setSettling(r.c.id) }
            : null
      }
      bulk={[
        {
          label: "Approve",
          icon: Check,
          enabled: (rs) => rs.some(is("submitted")),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => {
              if (r.c.status !== "submitted") skipped.push(`${r.c.id} is ${STATUS[r.c.status].label.toLowerCase()}`);
              else if (overFigure(r.c)) skipped.push(`${r.c.id} is over our figure`);
              else {
                approveClaim(r.c, r.c.amount);
                done++;
              }
            });
            return { done, skipped, verb: "approved" };
          },
        },
        {
          label: "Settle",
          icon: Wallet,
          enabled: (rs) => rs.some(is("approved")),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => {
              if (r.c.status === "approved") {
                settleClaim(r.c);
                done++;
              } else skipped.push(`${r.c.id} is ${r.c.status === "submitted" ? "not approved yet" : STATUS[r.c.status].label.toLowerCase()}`);
            });
            return { done, skipped, verb: "settled" };
          },
        },
      ]}
      newLabel="New claim"
      onNew={() => navigate(sfPath("claims/new"))}
      renderNew={(ctx) => <NewClaim ctx={ctx} />}
      renderExtra={({ show }) =>
        toSettle ? (
          <ConfirmDialog
            open
            eyebrow={toSettle.c.id}
            title={toSettle.c.partyKind === "rep" ? `Pay ${toSettle.c.id}?` : `Settle ${toSettle.c.id} by credit note?`}
            body={
              toSettle.c.partyKind === "rep"
                ? `NPR ${npr(toSettle.approved)} is paid to ${toSettle.name} from the bank or cash. No customer's account changes.`
                : `A credit note for NPR ${npr(toSettle.approved)} goes on ${toSettle.name}'s account and lowers what they owe.`
            }
            confirm={toSettle.c.partyKind === "rep" ? "Pay rep" : "Raise credit note"}
            onClose={() => setSettling(null)}
            onConfirm={() => {
              const no = settleClaim(toSettle.c);
              setSettling(null);
              show("success", toSettle.c.partyKind === "rep" ? `${toSettle.c.id} paid · ${no}` : `${toSettle.c.id} settled · ${no} raised`);
            }}
          />
        ) : null
      }
      renderPanel={(r, ctx) => <ClaimPanel key={r.c.id} r={r} ctx={ctx} onSettle={() => setSettling(r.c.id)} />}
    />
  );
}

// ── The record ──────────────────────────────────────────────────────────────

function ClaimPanel({ r, ctx, onSettle }: { r: Row; ctx: PanelCtx; onSettle: () => void }) {
  const navigate = useNavigate();
  const schemes = useStore(schemesStore);
  const customers = useStore(customersStore);
  const hub = useStore(hubStore);
  const ledger = useStore(ledgerStore);
  const [ask, setAsk] = React.useState<null | "part" | "reject">(null);
  const { c, d, name, approved, partial } = r;
  const rep = c.partyKind === "rep";
  const scheme = schemes.find((s) => s.id === c.schemeId);
  const check = React.useMemo(() => systemFigure(c, scheme, customers, hub), [c, scheme, customers, hub]);
  const diff = check ? c.amount - check.value : 0;
  const cust = rep ? undefined : customerById(c.party);
  const creditNote = c.settledBy ? ledger.find((x) => x.kind === "Credit note" && x.doc === c.settledBy) : undefined;
  // The portal writes the order a claim is about into its basis ("Order SO-5012.").
  const order = hub.find((o) => o.id === /\bOrder (SO-[\w-]+)/.exec(c.basis)?.[1]);
  const evidence = evidenceOf(c);
  const openCustomer = () => navigate(sfPath(`customers/${c.party}`));

  const approve = (amount: number, note = "") => {
    approveClaim(c, amount, note);
    setAsk(null);
    ctx.show("success", `${c.id} approved`);
  };

  const step =
    c.status === "submitted" ? (
      <StepCard
        tone={check && diff >= 1 ? "danger" : "plain"}
        icon={check && diff >= 1 ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
        title={check && diff >= 1 ? `Over our figure by NPR ${npr(diff)}` : "To decide"}
        sub={check && diff < 1 ? (Math.abs(diff) < 1 ? "Matches our figure." : `NPR ${npr(-diff)} under our figure.`) : undefined}
        actions={
          <>
            <button type="button" className={GHOST_SM} onClick={() => setAsk("reject")}>
              Reject
            </button>
            <button type="button" className={cn(BTN, "h-8")} onClick={() => approve(c.amount)}>
              <Check size={13} /> Approve
            </button>
          </>
        }
      />
    ) : c.status === "approved" ? (
      <StepCard
        icon={<Wallet size={15} />}
        title={`Approved${d?.decidedOn ? ` on ${day(d.decidedOn)}` : ""}`}
        sub={[partial ? `NPR ${npr(approved)} of ${npr(c.amount)}` : "", d?.reason ?? ""].filter(Boolean).join(" — ") || undefined}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={onSettle}>
            {rep ? "Pay rep" : "Settle by credit note"}
          </button>
        }
      />
    ) : c.status === "settled" ? (
      <StepCard
        tone="done"
        icon={<CircleCheck size={15} />}
        title={rep ? `Paid · ${c.settledBy ?? ""}` : `Settled by credit note ${c.settledBy ?? ""}`}
        sub={[d?.settledOn ? day(d.settledOn) : "", creditNote ? `on ${name}'s account` : ""].filter(Boolean).join(" · ") || undefined}
      />
    ) : (
      <StepCard tone="quiet" icon={<Ban size={15} />} title="Rejected" sub={d?.reason} />
    );

  return (
    <RecordShell
      ctx={ctx}
      no={c.id}
      chips={<Chip tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Chip>}
      title={cust ? <CustomerTitle name={name} onOpen={openCustomer} /> : name}
      amount={<Amount value={r.shown} currency="NPR" />}
      meta={[
        <span key="k">{c.kind} claim</span>,
        <span key="d" className={NUM}>
          Raised {day(c.raisedOn)}
        </span>,
        ...(cust ? [<TypeMark key="t" name={typeOf(cust).name} color={typeOf(cust).color} />] : rep ? [<span key="t">Sales rep</span>] : []),
        ...(scheme ? [<DocLink key="s" no={scheme.id} kind="Offer" onClick={() => navigate(sfPath(`schemes/${scheme.id}`))} />] : []),
        ...(order ? [<DocLink key="o" no={order.id} kind="Order" onClick={() => navigate(sfPath(`orders/${order.id}`))} />] : []),
      ]}
      menu={
        cust || c.status === "submitted"
          ? (close) => (
              <>
                {c.status === "submitted" && (
                  <MenuItem icon={Scale} onClick={() => (close(), setAsk("part"))}>
                    Approve part…
                  </MenuItem>
                )}
                {cust && (
                  <MenuItem icon={UserRound} onClick={() => (close(), openCustomer())}>
                    Open customer
                  </MenuItem>
                )}
                {c.status === "submitted" && (
                  <>
                    <MenuSep />
                    <MenuItem icon={Ban} danger onClick={() => (close(), setAsk("reject"))}>
                      Reject claim…
                    </MenuItem>
                  </>
                )}
              </>
            )
          : undefined
      }
      foot={<SfNoteFoot id={c.id} />}
    >
      {step}

      {(check || partial) && (
        <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
          <Statline className="pt-3">
            <Stat label="Claimed" value={<Amount value={c.amount} />} />
            {check && <Stat label="Our figure" value={<Amount value={check.value} />} title="What the engine gives for the same goods" />}
            {check && <Stat label="Difference" danger={diff >= 1} value={Math.abs(diff) < 1 ? "Matches" : diff > 0 ? <>Over by <Amount value={diff} /></> : <><Amount value={-diff} /> under</>} />}
            {partial && <Stat label="Approved" value={<Amount value={approved} />} />}
          </Statline>
          {check && (
            <ul className="m-0 mt-1.5 flex list-none flex-col gap-0.5 p-0 text-[11.5px] text-bz-text-muted">
              {check.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Block title="Details">
        <CellGrid>
          <Cell label="Claimed by">
            {name}
            <span className="block text-[10.5px] text-bz-text-soft">{cust ? [typeOf(cust).name, `Tier ${cust.tier}`, cust.city].filter(Boolean).join(" · ") : rep ? "Sales rep" : "Customer"}</span>
          </Cell>
          <Cell label="Kind">{c.kind}</Cell>
          {c.schemeId && (
            <Cell label="Offer" wide>
              {scheme ? (
                <>
                  <button type="button" onClick={() => navigate(sfPath(`schemes/${scheme.id}`))} className="text-left text-bz-text hover:underline hover:underline-offset-2">
                    {scheme.name}
                  </button>
                  <span className="block text-[10.5px] text-bz-text-soft">{ruleText(scheme.mechanic)}</span>
                </>
              ) : (
                <span className="text-bz-text-soft">Removed offer</span>
              )}
            </Cell>
          )}
          <Cell label="Basis" wide>
            <span className="whitespace-pre-wrap leading-relaxed">{c.basis}</span>
          </Cell>
        </CellGrid>
      </Block>

      <Block title="Evidence" count={evidence.files.length}>
        {evidence.files.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing attached.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {evidence.files.map((f) => (
              <span key={f.label} className="inline-flex h-7 items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2 text-[11.5px] text-bz-text-muted">
                <f.icon size={12} className="text-bz-text-soft" /> {f.label}
              </span>
            ))}
            {evidence.blurred && <span className="text-[11px] text-bz-text-soft">The photo is marked as blurred.</span>}
          </div>
        )}
      </Block>

      <SfActivity ids={[c.id, ...(c.settledBy ? [c.settledBy] : [])]} />

      <AmountDialog open={ask === "part"} c={c} figure={check && check.value > 0 && check.value < c.amount ? Math.round(check.value) : null} onClose={() => setAsk(null)} onConfirm={approve} />
      <ReasonDialog
        open={ask === "reject"}
        eyebrow={c.id}
        title={`Reject ${c.id}?`}
        body={`${name} sees this reason.`}
        confirm="Reject claim"
        danger
        onClose={() => setAsk(null)}
        onConfirm={(reason) => {
          rejectClaim(c, reason);
          setAsk(null);
          ctx.show("info", `${c.id} rejected`);
        }}
      />
    </RecordShell>
  );
}

/** Approve part: starts at the system's figure when it is lower than the claim, else at 80%. */
function AmountDialog({ open, c, figure, onClose, onConfirm }: { open: boolean; c: Claim; figure: number | null; onClose: () => void; onConfirm: (amount: number, note: string) => void }) {
  const suggest = figure ?? Math.round(c.amount * 0.8);
  const [amount, setAmount] = React.useState(suggest);
  const [note, setNote] = React.useState("");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (open) (setAmount(suggest), setNote(""), setTried(false));
  }, [open, suggest]);
  const bad = amount <= 0 || amount >= c.amount;
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={c.id}
      title="Approve part of the claim"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={BTN} onClick={() => (bad ? setTried(true) : onConfirm(amount, note.trim()))}>
            Approve NPR {npr(amount)}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Amount to approve" hint={<span className={NUM}>Claimed NPR {npr(c.amount)}{figure !== null ? ` · our figure NPR ${npr(figure)}` : ""}</span>}>
          <MoneyInput autoFocus label="Amount to approve" value={amount} onChange={setAmount} invalid={tried && bad} />
          {tried && bad && (
            <span role="alert" className="text-[10.5px] text-bz-red">
              Enter an amount above 0 and below the claim.
            </span>
          )}
        </Field>
        <Field label="Why">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shown to the customer" className={cn(TEXTAREA, "min-h-[56px]")} />
        </Field>
      </div>
    </Dialog>
  );
}

// ── A claim typed in by the office ──────────────────────────────────────────

function NewClaim({ ctx }: { ctx: PanelCtx }) {
  const schemes = useStore(schemesStore);
  const [partyKind, setPartyKind] = React.useState<Claim["partyKind"]>("customer");
  const [party, setParty] = React.useState<string | null>(null);
  const [kind, setKind] = React.useState<ClaimKind>("Damage");
  const [amount, setAmount] = React.useState(0);
  const [basis, setBasis] = React.useState("");
  const [schemeId, setSchemeId] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const needsScheme = kind === "Scheme" || kind === "Display";
  const missing = !party ? "Choose who is claiming." : amount <= 0 ? "Enter the amount." : !basis.trim() ? "Say what the claim is for." : null;
  const create = () => {
    if (missing) return (setTried(true), setRefusal(missing));
    const id = nextId("CL-", claimsStore.get().map((c) => c.id), 3);
    const claim: Claim = { id, kind, party: party!, partyKind, amount, raisedOn: SF_TODAY, status: "submitted", basis: basis.trim(), schemeId: needsScheme ? schemeId : null, settledBy: null };
    claimsStore.set((list) => [claim, ...list]);
    logEvent(id, `entered the claim for NPR ${npr(amount)} on behalf of ${partyName(claim)}`);
    ctx.show("success", `${id} created`);
    ctx.go(id);
  };
  const invalid = (bad: boolean) => (tried && bad ? "border-bz-red-mark" : undefined);

  return (
    <RecordShell ctx={ctx} no="" back={{ label: "Claims", onClick: () => ctx.go(null) }} title="New claim" amount={amount > 0 ? <Amount value={amount} currency="NPR" /> : undefined}>
      <div className="flex h-full min-h-0 flex-col">
        <SheetFrame
          onCommit={create}
          refusal={refusal}
          onDismissRefusal={() => setRefusal(null)}
          foot={
            <>
              <button type="button" className={cn(GHOST, "ml-auto")} onClick={() => ctx.go(null)}>
                Cancel
              </button>
              <button type="button" className={BTN} onClick={create}>
                Create claim
              </button>
            </>
          }
        >
          <div className="grid max-w-[720px] grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
            <Field label="Claimed by" required className="sm:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <Segmented<Claim["partyKind"]>
                  value={partyKind}
                  onChange={(v) => (setPartyKind(v), setParty(null), setKind(v === "rep" ? "Expense" : "Damage"))}
                  options={[
                    { value: "customer", label: "Customer" },
                    { value: "rep", label: "Rep" },
                  ]}
                />
                <div className="min-w-[200px] flex-1">{partyKind === "rep" ? <RepPick value={party} onChange={setParty} className={invalid(!party)} /> : <CustomerPick value={party} onChange={setParty} className={invalid(!party)} />}</div>
              </div>
            </Field>
            <Field label="Kind">
              <Select value={kind} onChange={(v) => setKind(v as ClaimKind)} options={KINDS.map((k) => ({ value: k, label: k, hint: KIND_HINT[k] }))} label={kind} width={300} className="h-9 w-full justify-between" />
            </Field>
            <Field label="Amount" required>
              <MoneyInput label="Amount" value={amount} onChange={setAmount} invalid={tried && amount <= 0} />
            </Field>
            {needsScheme && (
              <Field label="Offer" className="sm:col-span-2">
                <Select
                  value={schemeId ?? "none"}
                  onChange={(v) => setSchemeId(v === "none" ? null : v)}
                  options={[{ value: "none", label: "None" }, ...schemes.map((s) => ({ value: s.id, label: s.name, hint: s.id }))]}
                  label={schemes.find((s) => s.id === schemeId)?.name ?? <span className="font-normal text-bz-text-soft">None</span>}
                  width={320}
                  className="h-9 w-full justify-between"
                />
              </Field>
            )}
            <Field label="Basis" required className="sm:col-span-2">
              <textarea value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="What happened and what is attached" className={cn(TEXTAREA, invalid(!basis.trim()))} />
            </Field>
          </div>
        </SheetFrame>
      </div>
    </RecordShell>
  );
}

// ── For a host that is not this page (the Today queue) ──────────────────────

/** One claim's record, by id, with its own settle confirmation. */
export function ClaimPeek({ id, ctx }: { id: string; ctx: PanelCtx }) {
  const claims = useStore(claimsStore);
  const decisions = useStore(decisionsStore);
  useStore(customersStore);
  useStore(repsStore);
  const [settling, setSettling] = React.useState(false);
  const c = claims.find((x) => x.id === id);
  if (!c) return null;
  const d = decisions[c.id];
  const approved = approvedOf(c, d);
  const decided = c.status === "approved" || c.status === "settled";
  const name = partyName(c);
  const rep = c.partyKind === "rep";
  return (
    <>
      <ClaimPanel key={c.id} r={{ c, d, name, approved, shown: decided ? approved : c.amount, partial: decided && approved !== c.amount }} ctx={ctx} onSettle={() => setSettling(true)} />
      <ConfirmDialog
        open={settling}
        eyebrow={c.id}
        title={rep ? `Pay ${c.id}?` : `Settle ${c.id} by credit note?`}
        body={rep ? `NPR ${npr(approved)} is paid to ${name} from the bank or cash. No customer's account changes.` : `A credit note for NPR ${npr(approved)} goes on ${name}'s account and lowers what they owe.`}
        confirm={rep ? "Pay rep" : "Raise credit note"}
        onClose={() => setSettling(false)}
        onConfirm={() => {
          const no = settleClaim(c);
          setSettling(false);
          ctx.show("success", rep ? `${c.id} paid · ${no}` : `${c.id} settled · ${no} raised`);
        }}
      />
    </>
  );
}

export const CLAIMS_ROUTES = [
  { path: "design/salesforce/claims", Component: ClaimsPage },
  { path: "design/salesforce/claims/:no", Component: ClaimsPage },
];
