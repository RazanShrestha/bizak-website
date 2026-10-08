import * as React from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { Ban, ChevronRight, CircleCheck, FilePlus2, FileText, Inbox, ListTree, MessageSquareText, RotateCcw, Send, Table2, TimerOff, UserRound, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, DocLink, Field, GHOST, GHOST_SM, INPUT, LABEL, MenuItem, MenuSep, NUM, NumberField, PLAIN_BTN, TEXTAREA } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { OFFER_LABEL, OFFER_TONE, latestVersion, offerOf, offerReading, openRequests, roundsOf } from "../sales/estimate-offer";
import { estimatesStore } from "../sales/flow";
import type { Estimate } from "../sales/flow";
import { SheetFrame } from "../sales/FulfilSheet";
import { Amount, totalsOf } from "../sales/orders";
import { Cell, CellGrid, ReasonDialog, RelatedSection } from "../sales/parts";
import { Block, CustomerTitle, RecordShell, StepCard } from "../sales/record";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Customer, OppSource, OppStage, Opportunity, RfqLine } from "./data";
import { customerById, day, dayTime, npr, productById, typeOf } from "./engine";
import { SOURCE_TEXT, STAGE_LABEL, STAGE_TONE, STAGES, createOpportunity, estimatePathFor, markLost, reopenOpportunity } from "./deals";
import { estimatePath, estimatesOf, openEstimateOf } from "./estimates";
import { STATUS_META } from "./orders-parts";
import { customersStore, hubStore, opportunitiesStore, productsStore, repsStore } from "./store";
import { FxDate, FxDesk, pillTone } from "./fx-desk";
import { SfActivity, SfNoteFoot, Who, chipTone, sfPath } from "./sf";
import { CustomerPick, ProductAdd } from "./sell-kit";

// ════════════════════════════════════════════════════════════════════════════
// TRADE · OPPORTUNITIES — every deal being chased (owner decisions #27, #32)
//
// A dealer's price request on the portal lands here as a new opportunity; a
// rep or the office can log one too. The tenant answers with an estimate — the
// sales desk's own estimate, made and sent there — and the opportunity's stage
// then follows that estimate on its own (estimates.ts): New request → Estimate
// sent → In negotiation → Won / Lost. So the stage is read here, never set —
// the only verbs are create the estimate, mark it lost and reopen it.
// ════════════════════════════════════════════════════════════════════════════

type Row = { o: Opportunity; c: Customer | undefined };

const OPEN: OppStage[] = ["new", "proposal", "negotiation"];
const SOURCES = Object.keys(SOURCE_TEXT) as OppSource[];
/** The source in a list column; the record spells it out (deals.SOURCE_TEXT). */
const SOURCE_SHORT: Record<OppSource, string> = { "portal-rfq": "Dealer portal", rep: "Rep", office: "Office" };
const DASH = <span className="text-bz-text-soft">—</span>;
const sum = (rs: Row[]) => rs.reduce((s, r) => s + r.o.expectedValue, 0);
/** Where an estimate stands with the customer: "Not sent", "Sent v2", "Changes asked", "Expired"… */
const offerWord = (e: Estimate) => {
  const reading = offerReading(e);
  const v = latestVersion(e);
  return reading === "sent" && v ? `Sent v${v.no}` : OFFER_LABEL[reading];
};

export function OpportunitiesPage() {
  const navigate = useNavigate();
  const opportunities = useStore(opportunitiesStore);
  const estimates = useStore(estimatesStore);
  const hub = useStore(hubStore);
  const reps = useStore(repsStore);
  const customers = useStore(customersStore);
  // Search and the expanded row read product names.
  useStore(productsStore);

  const rows = React.useMemo<Row[]>(() => [...opportunities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((o) => ({ o, c: customerById(o.customerId) })), [opportunities, customers]);
  const is = (s: OppStage) => (r: Row) => r.o.stage === s;
  const open = (r: Row) => OPEN.includes(r.o.stage);
  // An opportunity carries no "won on" date: the order it became is when it was won.
  const wonOn = (o: Opportunity) => hub.find((h) => h.id === o.orderId)?.at ?? o.createdAt;
  const wonNow = (r: Row) => r.o.stage === "won" && wonOn(r.o).slice(0, 7) === SF_TODAY.slice(0, 7);
  const total = (rs: Row[]) => (rs.length ? <Amount value={sum(rs)} currency="NPR" /> : undefined);
  const repName = (r: Row) => reps.find((p) => p.id === r.o.repId)?.name;

  return (
    <FxDesk<Row>
      place="opportunities"
      section="salesforce/opportunities"
      noun={["opportunity", "opportunities"]}
      rows={rows}
      noOf={(r) => r.o.id}
      dateOf={(r) => r.o.createdAt.slice(0, 10)}
      searchText={(r) => `${r.o.id} ${r.o.rfqNo ?? ""} ${r.c?.name ?? ""} ${r.o.title} ${repName(r) ?? ""} ${(r.o.request?.lines ?? []).map((l) => productById(l.productId).name).join(" ")}`}
      searchPlaceholder="Number, customer or product"
      stats={[
        { label: "Open", value: rows.filter(open).length },
        { label: "Open value", value: <Amount value={sum(rows.filter(open))} currency="NPR" />, title: "The latest estimate's total, or the expected value before one exists" },
      ]}
      picks={[
        { key: "new", label: "New requests", value: rows.filter(is("new")).length, test: is("new"), title: "Waiting for an estimate" },
        { key: "negotiation", label: "In negotiation", value: rows.filter(is("negotiation")).length, test: is("negotiation") },
        { key: "won", label: "Won this month", value: <Amount value={sum(rows.filter(wonNow))} />, test: wonNow },
      ]}
      views={[
        {
          key: "queue",
          label: "Queue",
          icon: ListTree,
          groups: (rs, narrowed) => [
            { key: "new", label: STAGE_LABEL.new, icon: <Inbox size={12} className="text-bz-text-muted" />, rows: rs.filter(is("new")), right: total(rs.filter(is("new"))), empty: narrowed ? undefined : "Nothing waiting for an estimate." },
            { key: "proposal", label: STAGE_LABEL.proposal, rows: rs.filter(is("proposal")), right: total(rs.filter(is("proposal"))) },
            { key: "negotiation", label: STAGE_LABEL.negotiation, rows: rs.filter(is("negotiation")), right: total(rs.filter(is("negotiation"))) },
            { key: "won", label: STAGE_LABEL.won, rows: rs.filter(is("won")), right: total(rs.filter(is("won"))) },
            { key: "lost", label: STAGE_LABEL.lost, collapsed: true, rows: rs.filter(is("lost")) },
          ],
        },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...STAGES.map((s) => ({ value: `st:${s}`, label: STAGE_LABEL[s], group: "Stage", test: is(s) })),
        ...SOURCES.map((s) => ({ value: `src:${s}`, label: SOURCE_TEXT[s], group: "Source", test: (r: Row) => r.o.source === s })),
        ...reps.map((p) => ({ value: `rep:${p.id}`, label: p.name, group: "Rep", test: (r: Row) => r.o.repId === p.id })),
        ...customers.map((c) => ({ value: `cus:${c.id}`, label: c.name, hint: c.code, group: "Customer", test: (r: Row) => r.o.customerId === c.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (r) => r.o.createdAt + r.o.id, desc: true },
        { key: "old", label: "Oldest", by: (r) => r.o.createdAt + r.o.id },
        { key: "val", label: "Value", by: (r) => r.o.expectedValue, desc: true },
        { key: "close", label: "Expected close", by: (r) => r.o.expectedClose ?? "9999" },
        { key: "cus", label: "Customer", by: (r) => r.c?.name ?? "" },
      ]}
      columns={[
        { key: "date", label: "Date", width: "76px", render: (r) => <FxDate iso={r.o.createdAt.slice(0, 10)} /> },
        { key: "source", label: "Source", width: "100px", render: (r) => SOURCE_SHORT[r.o.source] },
        { key: "rep", label: "Rep", width: "24px", render: (r) => <Who name={repName(r)} /> },
        { key: "close", label: "Close by", width: "76px", render: (r) => (r.o.expectedClose ? <FxDate iso={r.o.expectedClose} /> : DASH) },
      ]}
      primary={(r) => ({ title: r.c?.name ?? "Removed customer", sub: [r.o.title, r.o.rfqNo].filter(Boolean).join(" · "), subOnDesktop: true })}
      status={(r) => ({ label: STAGE_LABEL[r.o.stage], tone: pillTone(STAGE_TONE[r.o.stage]) })}
      amount={(r) => ({ value: <Amount value={r.o.expectedValue} /> })}
      rowVerb={(r) => (open(r) && !openEstimateOf(r.o.id, estimates) ? { label: "Estimate", icon: FilePlus2, run: () => navigate(estimatePathFor(r.o)) } : null)}
      bulk={[
        {
          label: "Reopen",
          icon: RotateCcw,
          title: "Puts a lost opportunity back in play",
          enabled: (rs) => rs.some(is("lost")),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => {
              if (r.o.stage === "lost") {
                reopenOpportunity(r.o.id);
                done++;
              } else skipped.push(`${r.o.id} is not lost`);
            });
            return { done, skipped, verb: "reopened" };
          },
        },
      ]}
      newLabel="New opportunity"
      onNew={() => navigate(sfPath("opportunities/new"))}
      renderNew={(ctx) => <NewOpportunity ctx={ctx} />}
      renderPanel={(r, ctx) => <OpportunityPanel key={r.o.id} r={r} ctx={ctx} />}
    />
  );
}

// ── The record ──────────────────────────────────────────────────────────────

/** What was asked for: product and quantity. The price comes with the estimate. */
function AskedLines({ lines }: { lines: RfqLine[] }) {
  const cols = "grid-cols-[minmax(0,1fr)_96px]";
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
      <div className={cn("grid items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5", cols, LABEL)}>
        <span>Item</span>
        <span className="text-right">Qty</span>
      </div>
      {lines.map((l) => {
        const p = productById(l.productId);
        return (
          <div key={l.productId} className={cn("grid items-start gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0", cols)}>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] text-bz-text">{p.name}</span>
              {(p.code || l.note) && <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>{[p.code, l.note].filter(Boolean).join(" · ")}</span>}
            </span>
            <span className={cn("text-right text-[12px] text-bz-text", NUM)}>
              {l.qty} <span className="text-bz-text-soft">{p.unit}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OpportunityPanel({ r, ctx }: { r: Row; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const all = useStore(estimatesStore);
  const hub = useStore(hubStore);
  const reps = useStore(repsStore);
  useStore(productsStore);
  const [losing, setLosing] = React.useState(false);
  const { o, c } = r;

  const rep = reps.find((p) => p.id === o.repId);
  const estimates = estimatesOf(o.id, all);
  const inPlay = openEstimateOf(o.id, all);
  // The estimate this record reads: the accepted one, else the one in play, else the newest still standing.
  const est = estimates.find((e) => offerOf(e).status === "accepted" && !e.cancelled) ?? inPlay ?? estimates.find((e) => !e.cancelled);
  const version = est ? latestVersion(est) : undefined;
  const asked = est ? openRequests(est).slice(-1)[0] : undefined;
  const rounds = est ? roundsOf(est) : [];
  const reading = inPlay ? offerReading(inPlay) : null;
  const order = o.orderId ? hub.find((h) => h.id === o.orderId) : undefined;
  const rq = o.request;
  const live = OPEN.includes(o.stage);

  const makeEstimate = () => navigate(estimatePathFor(o));
  const openEstimate = () => inPlay && navigate(estimatePath(inPlay.no));
  const reopen = () => {
    reopenOpportunity(o.id);
    ctx.show("success", `${o.id} reopened`);
  };
  const lose = (
    <button type="button" className={GHOST_SM} onClick={() => setLosing(true)}>
      Mark lost
    </button>
  );

  const step =
    o.stage === "won" ? (
      <StepCard
        tone="done"
        icon={<CircleCheck size={15} />}
        title={o.orderId ? `Won as ${o.orderId}` : "Won"}
        sub={o.orderId && !order ? `${o.orderId} is no longer in Orders.` : undefined}
        actions={
          order ? (
            <button type="button" className={GHOST_SM} onClick={() => navigate(sfPath(`orders/${order.id}`))}>
              Open order
            </button>
          ) : undefined
        }
      />
    ) : o.stage === "lost" ? (
      <StepCard
        tone="quiet"
        icon={<Ban size={15} />}
        title="Lost"
        sub={o.lostReason ?? undefined}
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={reopen}>
            <RotateCcw size={13} /> Reopen
          </button>
        }
      />
    ) : inPlay ? (
      <StepCard
        icon={asked ? <MessageSquareText size={15} /> : reading === "expired" ? <TimerOff size={15} /> : reading === "not-sent" ? <FileText size={15} /> : <Send size={15} />}
        title={
          asked
            ? `${asked.byName} asked for changes`
            : version
              ? `Version ${version.no} ${reading === "expired" ? "expired" : "sent · valid till"} ${day(version.validTill)}`
              : inPlay.approval.state === "pending"
                ? "The estimate waits for approval"
                : "The estimate is not sent yet"
        }
        actions={
          <>
            {lose}
            <button type="button" className={cn(BTN, "h-8")} onClick={openEstimate}>
              Open estimate
            </button>
          </>
        }
      />
    ) : (
      <StepCard
        icon={<FilePlus2 size={15} />}
        title={estimates.some((e) => !e.cancelled) ? "Waiting for a new estimate" : "Waiting for an estimate"}
        sub={rq ? `${rq.byName} · ${dayTime(rq.at)}` : undefined}
        actions={
          <>
            {lose}
            <button type="button" className={cn(BTN, "h-8")} onClick={makeEstimate}>
              <FilePlus2 size={13} /> Create estimate
            </button>
          </>
        }
      />
    );

  const related = [
    ...estimates.map((e) => ({ no: e.no, kind: "Estimate", date: e.date, party: c?.name ?? "", status: e.cancelled ? "Cancelled" : offerWord(e), tone: e.cancelled ? ("neutral" as const) : OFFER_TONE[offerReading(e)] })),
    ...(order ? [{ no: order.id, kind: "Order", date: order.at.slice(0, 10), party: c?.name ?? "", status: STATUS_META[order.status].label, tone: chipTone(STATUS_META[order.status].tone) }] : []),
  ];

  return (
    <RecordShell
      ctx={ctx}
      no={o.id}
      chips={<Chip tone={chipTone(STAGE_TONE[o.stage])}>{STAGE_LABEL[o.stage]}</Chip>}
      title={c ? <CustomerTitle name={c.name} onOpen={() => navigate(sfPath(`customers/${c.id}`))} /> : "Removed customer"}
      amount={<Amount value={o.expectedValue} currency="NPR" />}
      meta={[
        <span key="t" className="text-bz-text">
          {o.title}
        </span>,
        <span key="d" className={NUM}>
          {dayTime(o.createdAt)}
        </span>,
        ...(rep
          ? [
              <span key="r" className="inline-flex items-center gap-1.5">
                <Who name={rep.name} size={16} /> {rep.name}
              </span>,
            ]
          : []),
        ...(o.rfqNo ? [<DocLink key="q" no={o.rfqNo} kind="Price request" />] : []),
      ]}
      menu={
        c || o.stage !== "won"
          ? (close) => (
              <>
                {live &&
                  (inPlay ? (
                    <MenuItem icon={FileText} onClick={() => (close(), openEstimate())}>
                      Open estimate
                    </MenuItem>
                  ) : (
                    <MenuItem icon={FilePlus2} onClick={() => (close(), makeEstimate())}>
                      Create estimate
                    </MenuItem>
                  ))}
                {c && (
                  <MenuItem icon={UserRound} onClick={() => (close(), navigate(sfPath(`customers/${c.id}`)))}>
                    Open customer
                  </MenuItem>
                )}
                {c && o.stage !== "won" && <MenuSep />}
                {live && (
                  <MenuItem icon={Ban} danger onClick={() => (close(), setLosing(true))}>
                    Mark lost…
                  </MenuItem>
                )}
                {o.stage === "lost" && (
                  <MenuItem icon={RotateCcw} onClick={() => (close(), reopen())}>
                    Reopen
                  </MenuItem>
                )}
              </>
            )
          : undefined
      }
      foot={<SfNoteFoot id={o.id} />}
    >
      {step}

      {est && (
        <Block title="Estimate">
          <button type="button" onClick={() => navigate(estimatePath(est.no))} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-bz-md border border-bz-line-soft px-3 py-2.5 text-left transition-colors hover:bg-bz-paper-warm">
            <span className={cn("text-[12.5px] font-medium text-bz-text", NUM)}>{est.no}</span>
            <Chip tone={OFFER_TONE[offerReading(est)]}>{offerWord(est)}</Chip>
            <span className="ml-auto text-[12.5px] font-semibold text-bz-text">
              <Amount value={version?.total ?? totalsOf(est.lines).total} currency={est.currency} />
            </span>
          </button>
          {rounds.length > 1 && (
            <p className={cn("m-0 mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-bz-text-muted", NUM)}>
              {rounds.map((x, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight size={11} className="shrink-0 text-bz-text-soft" aria-hidden />}
                  <span className={cn(i === rounds.length - 1 && "font-medium text-bz-text")}>{x.kind === "version" ? `Version ${x.version.no} · ${npr(x.version.total)}` : "Changes asked"}</span>
                </React.Fragment>
              ))}
            </p>
          )}
        </Block>
      )}

      <Block title="What they asked for" count={rq?.lines.length || undefined}>
        {!rq ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing noted.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rq.lines.length > 0 && <AskedLines lines={rq.lines} />}
            <CellGrid>
              <Cell label="Wanted by">{rq.deliverBy ? <span className={NUM}>{day(rq.deliverBy)}</span> : DASH}</Cell>
              <Cell label="Payment wish">{rq.paymentWish || DASH}</Cell>
              {rq.note && (
                <Cell label="Note" wide>
                  <span className="whitespace-pre-wrap leading-relaxed">{rq.note}</span>
                </Cell>
              )}
            </CellGrid>
          </div>
        )}
      </Block>

      <Block title="Details">
        <CellGrid>
          <Cell label="Customer">
            {c?.name ?? "Removed customer"}
            {c && <span className="block text-[10.5px] text-bz-text-soft">{[typeOf(c).name, c.city].filter(Boolean).join(" · ")}</span>}
          </Cell>
          <Cell label="Source">
            {SOURCE_TEXT[o.source]}
            {rq && (
              <span className={cn("block text-[10.5px] text-bz-text-soft", NUM)}>
                {rq.byName} · {dayTime(rq.at)}
              </span>
            )}
          </Cell>
          <Cell label="Expected close">{o.expectedClose ? <span className={NUM}>{day(o.expectedClose)}</span> : DASH}</Cell>
          <Cell label="Rep">{rep?.name ?? DASH}</Cell>
        </CellGrid>
      </Block>

      {related.length > 0 && (
        <div className="border-b border-bz-line-soft">
          <RelatedSection rows={related} onOpen={(no) => navigate(no.startsWith("EST-") ? estimatePath(no) : sfPath(`orders/${no}`))} />
        </div>
      )}

      <SfActivity ids={[o.id, ...estimates.map((e) => e.no)]} />

      <ReasonDialog
        open={losing}
        eyebrow={o.id}
        title={`Mark ${o.id} lost?`}
        body={inPlay ? `${inPlay.no} is closed as lost too. You can reopen the opportunity later.` : "You can reopen it later."}
        confirm="Mark lost"
        danger
        onClose={() => setLosing(false)}
        onConfirm={(reason) => {
          setLosing(false);
          markLost(o.id, reason);
          ctx.show("info", `${o.id} marked lost`);
        }}
      />
    </RecordShell>
  );
}

// ── An opportunity logged by the office ─────────────────────────────────────

function NewOpportunity({ ctx }: { ctx: PanelCtx }) {
  const [params] = useSearchParams();
  useStore(productsStore);
  useStore(customersStore);
  // A link from a customer's record arrives with that customer picked.
  const [customerId, setCustomerId] = React.useState<string | null>(() => customerById(params.get("customer"))?.id ?? null);
  const [title, setTitle] = React.useState("");
  const [lines, setLines] = React.useState<RfqLine[]>([]);
  const [note, setNote] = React.useState("");
  const [close, setClose] = React.useState("");
  const [refusal, setRefusal] = React.useState<string | null>(null);

  const wanted = lines.filter((l) => l.qty > 0);
  const commit = () => {
    if (!customerId) return setRefusal("Pick a customer.");
    if (!title.trim() && !wanted.length) return setRefusal("Give it a title or add a product.");
    const o = createOpportunity({ customerId, title, source: "office", lines: wanted, note, expectedClose: close || null });
    ctx.show("success", `${o.id} created`);
    ctx.go(o.id);
  };

  return (
    <RecordShell ctx={ctx} no="" back={{ label: "Opportunities", onClick: () => ctx.go(null) }} title="New opportunity">
      <div className="flex h-full min-h-0 flex-col">
        <SheetFrame
          onCommit={commit}
          refusal={refusal}
          onDismissRefusal={() => setRefusal(null)}
          foot={
            <>
              <button type="button" className={cn(GHOST, "ml-auto")} onClick={() => ctx.go(null)}>
                Cancel
              </button>
              <button type="button" className={BTN} onClick={commit}>
                Create opportunity
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
            <Field label="Customer" required>
              <CustomerPick value={customerId} onChange={setCustomerId} />
            </Field>
            <Field label="Expected close">
              <input type="date" value={close} min={SF_TODAY} onChange={(e) => setClose(e.target.value)} className={cn(INPUT, NUM)} />
            </Field>
            <Field label="Title" className="sm:col-span-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Named after the products when left empty" className={INPUT} />
            </Field>
          </div>

          <Block title="What they want" count={lines.length} right={<ProductAdd exclude={lines.map((l) => l.productId)} onPick={(id) => setLines((ls) => (ls.some((l) => l.productId === id) ? ls : [...ls, { productId: id, qty: 1 }]))} />}>
            {lines.length === 0 ? (
              <p className="m-0 text-[11.5px] text-bz-text-soft">No products added.</p>
            ) : (
              <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
                {lines.map((l) => {
                  const p = productById(l.productId);
                  return (
                    <div key={l.productId} className="flex items-center gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] text-bz-text">{p.name}</span>
                        <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{[p.code, p.pack, p.unit && `per ${p.unit}`].filter(Boolean).join(" · ")}</span>
                      </span>
                      <NumberField value={l.qty} onChange={(v) => setLines((ls) => ls.map((x) => (x.productId === l.productId ? { ...x, qty: v } : x)))} className="w-[104px] shrink-0" ariaLabel={`Quantity of ${p.name}`} />
                      <button type="button" className={PLAIN_BTN} aria-label={`Remove ${p.name}`} title="Remove" onClick={() => setLines((ls) => ls.filter((x) => x.productId !== l.productId))}>
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Block>

          <div className="px-5 py-4">
            <Field label="Note">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} className={TEXTAREA} />
            </Field>
          </div>
        </SheetFrame>
      </div>
    </RecordShell>
  );
}

// ── For a host that is not this page (the Today queue) ──────────────────────

/** One opportunity's record, by id. */
export function OpportunityPeek({ id, ctx }: { id: string; ctx: PanelCtx }) {
  const opportunities = useStore(opportunitiesStore);
  useStore(customersStore);
  const o = opportunities.find((x) => x.id === id);
  if (!o) return null;
  return <OpportunityPanel key={o.id} r={{ o, c: customerById(o.customerId) }} ctx={ctx} />;
}

/**
 * Sales force kept an estimate of its own until owner decision #32; the estimate is the sales desk's now. An old link —
 * `estimates`, `estimates/EST-0007`, `estimates/new?opportunity=OPP-0001` — lands where that estimate, or the
 * opportunity it was to be made for, is today.
 */
function ToSalesEstimate() {
  const { no } = useParams();
  const [search] = useSearchParams();
  const opportunity = search.get("opportunity");
  return <Navigate to={no === "new" ? sfPath(opportunity ? `opportunities/${opportunity}` : "opportunities") : estimatePath(no)} replace />;
}

export const OPPORTUNITIES_ROUTES = [
  { path: "design/salesforce/opportunities", Component: OpportunitiesPage },
  { path: "design/salesforce/opportunities/:no", Component: OpportunitiesPage },
  { path: "design/salesforce/estimates", Component: ToSalesEstimate },
  { path: "design/salesforce/estimates/:no", Component: ToSalesEstimate },
];
