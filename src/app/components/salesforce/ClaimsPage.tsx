import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Dialog, GHOST, GHOST_SM, INPUT, NUM, Segmented, TEXTAREA, ToastHost, useToast } from "../sales/bzw";
import { createStore, useStore } from "../sales/store";
import { ReasonDialog } from "../sales/parts";
import type { HistoryEvent } from "../sales/orders";
import { REPS, SF_TODAY } from "./data";
import type { Claim, ClaimKind, Customer, HubOrder, Scheme } from "./data";
import { customerById, day, eligible, evaluate, npr, typeOf } from "./engine";
import { claimsStore, customersStore, hubStore, schemesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Fact, Figures, Flag, List, Money, Page, PageIntro, Row, SidePanel, TextTabs, TypeMark } from "./ui";
import { PanelSection, RecordActivity, RecordNoteFoot, addDaysIso, inTerritory, logEvent, qualifyingCart, ruleText, stamp } from "./schemes-kit";

// ════════════════════════════════════════════════════════════════════════════
// CLAIMS — the money loop that closes a scheme (research/C §3.2–3.3)
//
// Decide (approve, approve part, reject), then settle by credit note (a
// customer) or payment (a rep). For scheme and display claims the panel puts
// the system's own figure next to the claimed one — from the scheme and the
// hub orders through `evaluate`, never a second copy of the scheme maths — so
// an over-claim is visible before anyone approves it.
// ════════════════════════════════════════════════════════════════════════════

type Tab = Claim["status"];
const TAB_LABEL: Record<Tab, string> = { submitted: "To decide", approved: "Approved", settled: "Settled", rejected: "Rejected" };
const TONE: Record<Tab, "warn" | "info" | "good" | "off"> = { submitted: "warn", approved: "info", settled: "good", rejected: "off" };
const KIND_TEXT: Record<ClaimKind, string> = { Scheme: "Scheme", Display: "Display", Damage: "Damage", "Price difference": "Price difference", Expense: "Expense" };

type Settle = "Credit note" | "Payment";
/** What the Claim shape has no field for yet — the decision and the settlement (see the report's proposed diff). */
type Decision = { approvedAmount?: number; reason?: string; decidedOn?: string; settledOn?: string; via?: Settle };
const decisionsStore = createStore<Record<string, Decision>>({
  "CL-550": { approvedAmount: 1_500, decidedOn: "2026-09-02" },
  "CL-547": { approvedAmount: 61_200, decidedOn: "2026-08-27", settledOn: "2026-08-29", via: "Credit note" },
  "CL-546": { reason: "Price protection covers stock bought after 1 Aug only.", decidedOn: "2026-08-24" },
});

export const partyName = (c: Claim) => (c.partyKind === "rep" ? REPS.find((r) => r.id === c.party)?.name : customerById(c.party)?.name) ?? c.party;
const approvedOf = (c: Claim, d: Decision | undefined) => d?.approvedAmount ?? c.amount;

// ── The system's own figure ─────────────────────────────────────────────────

type Check = { value: number; lines: string[] };

/** The scheme as the engine would have run it on `date`: live and without the budget stop, since the claim is about goods already given. */
const asRun = (s: Scheme): Scheme => ({ ...s, status: "live", budget: null });
const clampDate = (s: Scheme, iso: string) => (iso < s.from ? s.from : iso > s.to ? s.to : iso);

function systemFigure(c: Claim, s: Scheme | undefined, customers: Customer[], hub: HubOrder[]): Check | null {
  if (!s || (c.kind !== "Scheme" && c.kind !== "Display")) return null;
  const run = asRun(s);
  const m = s.mechanic;

  if (m.kind === "display") {
    const cust = customerById(c.party);
    const date = clampDate(s, addDaysIso(c.raisedOn, -1));
    const why = eligible(run, cust, date) ?? (inTerritory(s, cust) ? null : "Not in its territories");
    if (why) return { value: 0, lines: [`${partyName(c)} can't get this scheme: ${why.toLowerCase()}.`] };
    return { value: m.amount, lines: [`One month at the scheme's rate of NPR ${npr(m.amount)}.`] };
  }

  if (s.applies !== "order") return { value: 0, lines: ["This scheme is not paid on a claim."] };

  // A secondary scheme: the distributor gave it to its retailers and claims it back. Count only the retailers it
  // serves that the scheme is for; price each one's hub orders with the engine, or one qualifying order when the
  // hub has none (secondary sales are not in the hub).
  const date = clampDate(s, c.raisedOn);
  const retailers = customers.filter((r) => r.parentId === c.party && !eligible(run, r, date) && inTerritory(s, r));
  let fromHub = 0;
  let withOrders = 0;
  let estimated = 0;
  for (const r of retailers) {
    const orders = hub.filter((o) => o.customerId === r.id && o.status !== "rejected" && o.at.slice(0, 10) >= s.from && o.at.slice(0, 10) <= s.to);
    const got = orders.reduce((sum, o) => sum + (evaluate(r.id, o.lines, [run], { date: o.at.slice(0, 10) }).applied.find((a) => a.schemeId === s.id)?.benefit ?? 0), 0);
    if (got > 0) {
      fromHub += got;
      withOrders++;
    } else {
      estimated += evaluate(r.id, qualifyingCart(m), [run], { date }).applied.find((a) => a.schemeId === s.id)?.benefit ?? 0;
    }
  }
  const said = /(\d+) retailers/.exec(c.basis)?.[1];
  const lines = [`${retailers.length} retailers served by ${partyName(c)} can get this scheme${said ? ` — the claim says ${said}` : ""}.`];
  if (withOrders) lines.push(`${withOrders} have hub orders with it: NPR ${npr(fromHub)}.`);
  if (retailers.length - withOrders > 0) lines.push(`${retailers.length - withOrders} counted at one qualifying order each: NPR ${npr(estimated)}.`);
  return { value: fromHub + estimated, lines };
}

// ── Evidence ────────────────────────────────────────────────────────────────

function Evidence({ c }: { c: Claim }) {
  const photos = Number(/(\d+) photos?/.exec(c.basis)?.[1] ?? 0);
  const bills = /bills? attached/i.test(c.basis) ? 2 : 0;
  const blurred = /blurred/i.test(c.basis);
  if (!photos && !bills) return <p className="m-0 text-[12px] text-bz-text-muted">Nothing attached.</p>;
  const tiles = [...Array.from({ length: photos }, (_, i) => ({ icon: ImageIcon, label: `Photo ${i + 1}` })), ...Array.from({ length: bills }, (_, i) => ({ icon: FileText, label: `Bill ${i + 1}` }))];
  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {tiles.map((t) => (
          <figure key={t.label} className="m-0 w-[84px]">
            <span className={cn("flex h-[84px] items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm text-bz-text-soft", blurred && t.icon === ImageIcon && "opacity-60 blur-[0.5px]")}>
              <t.icon size={18} />
            </span>
            <figcaption className="mt-1 text-[10.5px] text-bz-text-soft">{t.label}</figcaption>
          </figure>
        ))}
      </div>
      {blurred && <p className="m-0 mt-2 text-[11px] text-bz-text-soft">The rep marked the photo as blurred.</p>}
    </>
  );
}

// ── Dialogs ─────────────────────────────────────────────────────────────────

function AmountDialog({ open, c, suggest, onClose, onConfirm }: { open: boolean; c: Claim; suggest: number; onClose: () => void; onConfirm: (amount: number, note: string) => void }) {
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
      <p className="m-0 mb-3">
        Claimed NPR {npr(c.amount)}. {suggest < c.amount ? `Our figure is NPR ${npr(suggest)}.` : ""}
      </p>
      <label className="flex flex-col gap-1">
        <span className="text-[11.5px] font-semibold text-bz-text">Amount to approve</span>
        <input autoFocus inputMode="numeric" value={amount ? npr(amount) : ""} onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)} className={cn(INPUT, "font-semibold", NUM, tried && bad && "border-bz-red-mark")} />
        {tried && bad && <span className="text-[10.5px] text-bz-red">Enter an amount above 0 and below the claim.</span>}
      </label>
      <label className="mt-3 flex flex-col gap-1">
        <span className="text-[11.5px] font-semibold text-bz-text">Why</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shown to the customer" className={cn(TEXTAREA, "min-h-[56px]")} />
      </label>
    </Dialog>
  );
}

function SettleDialog({ open, c, amount, onClose, onConfirm }: { open: boolean; c: Claim; amount: number; onClose: () => void; onConfirm: (via: Settle) => void }) {
  const [via, setVia] = React.useState<Settle>(c.partyKind === "rep" ? "Payment" : "Credit note");
  React.useEffect(() => {
    if (open) setVia(c.partyKind === "rep" ? "Payment" : "Credit note");
  }, [open, c.partyKind]);
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={c.id}
      title="Settle the claim"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={BTN} onClick={() => onConfirm(via)}>
            Settle NPR {npr(amount)}
          </button>
        </>
      }
    >
      <Segmented<Settle>
        value={via}
        onChange={setVia}
        options={[
          { value: "Credit note", label: "Credit note" },
          { value: "Payment", label: "Payment" },
        ]}
      />
      <p className="m-0 mt-3">
        {via === "Credit note" ? `A credit note to ${partyName(c)}. It lowers what they owe; they can use it on the next invoice.` : `A payment to ${partyName(c)} from the bank or cash.`}
      </p>
    </Dialog>
  );
}

// ── Panel ───────────────────────────────────────────────────────────────────

function seedHistory(c: Claim, d: Decision | undefined): HistoryEvent[] {
  const who = partyName(c);
  const out: HistoryEvent[] = [{ id: `${c.id}-h1`, whoId: "", when: stamp(c.raisedOn, "10:20"), what: `${who} raised the claim${c.partyKind === "customer" && typeOf(customerById(c.party)).portal === "dealer" ? " on the dealer portal" : ""}` }];
  if (d?.decidedOn && c.status !== "submitted")
    out.push({ id: `${c.id}-h2`, whoId: "EMP-118", when: stamp(d.decidedOn, "16:05"), what: c.status === "rejected" ? `rejected it — ${d.reason ?? ""}` : `approved NPR ${npr(approvedOf(c, d))}` });
  if (d?.settledOn && c.settledBy) out.push({ id: `${c.id}-h3`, whoId: "EMP-118", when: stamp(d.settledOn, "11:30"), what: `settled it by ${d.via?.toLowerCase() ?? "credit note"} ${c.settledBy}` });
  return out;
}

function ClaimPanel({ c, onClose }: { c: Claim; onClose: () => void }) {
  const schemes = useStore(schemesStore);
  const customers = useStore(customersStore);
  const hub = useStore(hubStore);
  const claims = useStore(claimsStore);
  const d = useStore(decisionsStore)[c.id];
  const [dialog, setDialog] = React.useState<null | "part" | "reject" | "settle">(null);
  const { toast, show, dismiss } = useToast();
  const scheme = schemes.find((s) => s.id === c.schemeId);
  const check = React.useMemo(() => systemFigure(c, scheme, customers, hub), [c, scheme, customers, hub]);
  const diff = check ? c.amount - check.value : 0;
  const approved = approvedOf(c, d);
  const subject = `claim:${c.id}`;
  const cust = c.partyKind === "customer" ? customerById(c.party) : undefined;

  const update = (patch: Partial<Claim>, dec: Decision, what: string, toastText: string) => {
    claimsStore.set((list) => list.map((x) => (x.id === c.id ? { ...x, ...patch } : x)));
    decisionsStore.set((s) => ({ ...s, [c.id]: { ...s[c.id], ...dec } }));
    logEvent(subject, what);
    setDialog(null);
    show("success", toastText);
  };
  const approve = (amount: number, note = "") =>
    update({ status: "approved" }, { approvedAmount: amount, decidedOn: SF_TODAY, reason: note || undefined }, `approved NPR ${npr(amount)}${amount < c.amount ? ` of ${npr(c.amount)}` : ""}${note ? ` — ${note}` : ""}`, `${c.id} approved. Settle it when ready.`);
  const settle = (via: Settle) => {
    const prefix = via === "Credit note" ? "CN" : "PMT";
    const n = 40 + claims.filter((x) => x.settledBy?.startsWith(`${prefix}-`)).length + 1;
    const no = `${prefix}-${String(n).padStart(3, "0")}`;
    update({ status: "settled", settledBy: no }, { settledOn: SF_TODAY, via }, `settled it by ${via.toLowerCase()} ${no}`, `${no} raised for NPR ${npr(approved)}.`);
  };

  return (
    <SidePanel
      open
      onClose={onClose}
      width={580}
      eyebrow={`${c.id} · ${KIND_TEXT[c.kind]} claim`}
      title={partyName(c)}
      meta={
        <>
          <Dot tone={TONE[c.status]}>{TAB_LABEL[c.status]}</Dot>
          <span>Raised {day(c.raisedOn)}</span>
          {cust ? <TypeMark name={typeOf(cust).name} color={typeOf(cust).color} /> : <span>Sales rep</span>}
        </>
      }
      foot={<RecordNoteFoot subject={subject} />}
    >
      {c.status === "submitted" && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BTN} onClick={() => approve(c.amount)}>
            Approve NPR {npr(c.amount)}
          </button>
          <button type="button" className={GHOST} onClick={() => setDialog("part")}>
            Approve part
          </button>
          <button type="button" className={GHOST} onClick={() => setDialog("reject")}>
            Reject
          </button>
        </div>
      )}
      {c.status === "approved" && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={BTN} onClick={() => setDialog("settle")}>
            Settle
          </button>
          <span className="text-[11.5px] text-bz-text-muted">Approved NPR {npr(approved)}{d?.decidedOn ? ` on ${day(d.decidedOn)}` : ""}.</span>
        </div>
      )}
      {c.status === "settled" && (
        <p className="m-0 text-[12.5px] text-bz-text">
          Settled by {d?.via?.toLowerCase() ?? "credit note"} <span className={cn("font-semibold", NUM)}>{c.settledBy}</span>
          {d?.settledOn ? ` on ${day(d.settledOn)}` : ""}.
        </p>
      )}
      {c.status === "rejected" && <p className="m-0 text-[12.5px] text-bz-text">Rejected{d?.reason ? ` — ${d.reason}` : "."}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Fact label="Claimed">
          <Money value={c.amount} className="text-[13px] font-semibold" />
        </Fact>
        {check && (
          <Fact label="Our figure">
            <Money value={check.value} className="text-[13px] font-semibold" />
          </Fact>
        )}
        {check && (
          <Fact label="Difference">
            {Math.abs(diff) < 1 ? (
              <Dot tone="good">Matches</Dot>
            ) : diff > 0 ? (
              <Flag>Over by NPR {npr(diff)}</Flag>
            ) : (
              <Dot tone="neutral">NPR {npr(-diff)} under</Dot>
            )}
          </Fact>
        )}
        {(c.status === "approved" || c.status === "settled") && approved !== c.amount && (
          <Fact label="Approved">
            <Money value={approved} className="text-[13px] font-semibold" />
          </Fact>
        )}
      </div>
      {check && (
        <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0 text-[11.5px] text-bz-text-muted">
          {check.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}

      <PanelSection title="Basis">
        <p className="m-0 text-[12.5px] leading-relaxed text-bz-text">{c.basis}</p>
      </PanelSection>

      {scheme && (
        <PanelSection title="Scheme">
          <Link to={sfPath(`schemes/${scheme.id}`)} className="group block">
            <span className="block text-[12.5px] font-medium text-bz-text group-hover:underline">
              {scheme.name} <span className={cn("font-normal text-bz-text-soft", NUM)}>· {scheme.id}</span>
            </span>
            <span className="mt-0.5 block text-[11.5px] text-bz-text-muted">{ruleText(scheme.mechanic)}.</span>
          </Link>
        </PanelSection>
      )}

      <PanelSection title="Evidence">
        <Evidence c={c} />
      </PanelSection>

      <RecordActivity subject={subject} seed={seedHistory(c, d)} />

      <AmountDialog open={dialog === "part"} c={c} suggest={check && check.value > 0 && check.value < c.amount ? Math.round(check.value) : Math.round(c.amount * 0.8)} onClose={() => setDialog(null)} onConfirm={(a, note) => approve(a, note)} />
      <ReasonDialog
        open={dialog === "reject"}
        eyebrow={c.id}
        title="Reject the claim"
        body={`${partyName(c)} sees this reason.`}
        confirm="Reject claim"
        danger
        onClose={() => setDialog(null)}
        onConfirm={(reason) => update({ status: "rejected" }, { reason, decidedOn: SF_TODAY }, `rejected it — ${reason}`, `${c.id} rejected.`)}
      />
      <SettleDialog open={dialog === "settle"} c={c} amount={approved} onClose={() => setDialog(null)} onConfirm={settle} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SidePanel>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export function ClaimsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const claims = useStore(claimsStore);
  const decisions = useStore(decisionsStore);
  const selected = claims.find((c) => c.id === id);
  const [tab, setTab] = React.useState<Tab>(() => selected?.status ?? "submitted");

  const toDecide = claims.filter((c) => c.status === "submitted");
  const unsettled = claims.filter((c) => c.status === "approved");
  const settledMonth = claims.filter((c) => c.status === "settled" && (decisions[c.id]?.settledOn ?? "").slice(0, 7) === SF_TODAY.slice(0, 7));
  const sum = (list: Claim[], approvedFig = false) => list.reduce((a, c) => a + (approvedFig ? approvedOf(c, decisions[c.id]) : c.amount), 0);
  const rows = claims.filter((c) => c.status === tab).sort((a, b) => b.raisedOn.localeCompare(a.raisedOn) || b.id.localeCompare(a.id));
  const close = React.useCallback(() => navigate(sfPath("claims")), [navigate]);

  return (
    <SfShell page="claims" panel={selected ? <ClaimPanel key={selected.id} c={selected} onClose={close} /> : undefined}>
      <Page width="full">
        <PageIntro>Scheme, display, damage and expense claims. Decide, then settle by credit note or payment.</PageIntro>

        <Figures
          items={[
            { label: "To decide", value: <Money value={sum(toDecide)} />, sub: `${toDecide.length} claims`, onClick: () => setTab("submitted") },
            { label: "Approved, not settled", value: <Money value={sum(unsettled, true)} />, sub: `${unsettled.length} claims`, onClick: () => setTab("approved") },
            { label: "Settled this month", value: <Money value={sum(settledMonth, true)} />, sub: `${settledMonth.length} claims`, onClick: () => setTab("settled") },
          ]}
        />

        <TextTabs<Tab>
          className="mb-3 mt-10"
          value={tab}
          onChange={setTab}
          options={(Object.keys(TAB_LABEL) as Tab[]).map((t) => ({ value: t, label: TAB_LABEL[t], count: claims.filter((c) => c.status === t).length }))}
        />

        {rows.length === 0 ? (
          <EmptyNote>No claims {tab === "submitted" ? "to decide" : `${TAB_LABEL[tab].toLowerCase()}`}.</EmptyNote>
        ) : (
          <List>
            {rows.map((c) => {
              const d = decisions[c.id];
              return (
                <Row
                  key={c.id}
                  active={c.id === id}
                  onClick={() => navigate(sfPath(`claims/${c.id}`))}
                  title={partyName(c)}
                  sub={`${c.id} · ${day(c.raisedOn)} · ${c.basis}`}
                  meta={[
                    <span key="k" className="block w-[120px] truncate">{KIND_TEXT[c.kind]}</span>,
                    <span key="s" className="block w-[130px]">
                      <Dot tone={TONE[c.status]}>{c.status === "settled" && c.settledBy ? c.settledBy : TAB_LABEL[c.status]}</Dot>
                    </span>,
                  ]}
                  trail={
                    <span className="flex flex-col items-end">
                      <Money value={c.status === "approved" || c.status === "settled" ? approvedOf(c, d) : c.amount} code={false} />
                      {(c.status === "approved" || c.status === "settled") && approvedOf(c, d) !== c.amount && <span className={cn("text-[10.5px] font-normal text-bz-text-soft", NUM)}>of {npr(c.amount)}</span>}
                    </span>
                  }
                />
              );
            })}
          </List>
        )}
      </Page>
    </SfShell>
  );
}

export const CLAIMS_ROUTES = [
  { path: "design/salesforce/claims", Component: ClaimsPage },
  { path: "design/salesforce/claims/:id", Component: ClaimsPage },
];
