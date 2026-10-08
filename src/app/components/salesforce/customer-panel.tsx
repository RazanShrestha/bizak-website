import * as React from "react";
import { useNavigate } from "react-router";
import { CirclePause, CirclePlay, Pencil, Plus, Shapes, ShieldAlert, Trash2, UserPlus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, DANGER_BTN, Dialog, Field, GHOST, GHOST_SM, INPUT, MenuItem, MenuSep, NUM, Segmented, Select, Stat, Statline, TEXTAREA } from "../sales/bzw";
import type { SelectOption, Tone } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { OFFER_LABEL, OFFER_TONE, latestVersion, offerReading } from "../sales/estimate-offer";
import { estimatesStore } from "../sales/flow";
import { Amount } from "../sales/orders";
import { Cell, CellGrid, RelatedSection, Section } from "../sales/parts";
import { Block, RecordShell, StepCard } from "../sales/record";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Claim, Customer, HubOrder, LedgerEntry, ModuleKey } from "./data";
import { STAGE_LABEL as BRANDING_LABEL, STAGE_TONE as BRANDING_TONE } from "./activationKit";
import { STAGE_LABEL, STAGE_TONE } from "./deals";
import { accountOf, creditCheck, day, dayTime, evaluate, typeOf } from "./engine";
import { estimatePath, openEstimateOf } from "./estimates";
import { OUTLET_STATUS } from "./field-data";
import { coordsText, osmEmbedUrl } from "./geo";
import type { GeoPoint } from "./geo";
import { CoordsDialog, MapEmbed, MapLink, UseMyLocation } from "./geo-kit";
import { More } from "./network-form";
import { PORTAL_LABEL, STATUS_LABEL, STATUS_TONE, childrenOf, descendantsOf, getsSentence, limitText, mechanicText, repById, schemesNow } from "./network-model";
import { SOURCE_NAME, STATUS_META, estimateRef, forText } from "./orders-parts";
import { CustomerFields, CustomerMoreFields } from "./QuickAddDialogs";
import type { CustomerDraft } from "./QuickAddDialogs";
import { openQuickAdd, quickAddStore } from "./quickadd";
import { logEvent } from "./records";
import { moveCustomerToRoute, plannedText, removeStop, restoreStop, routeName } from "./routes";
import { SfActivity, SfNoteFoot, TypeMark, Who, chipTone, sfPath } from "./sf";
import { brandingStore, claimsStore, customersStore, hubStore, ledgerStore, modulesStore, opportunitiesStore, playbooksStore, repsStore, routePlanStore, routesStore, schemesStore, typesStore, visitsStore } from "./store";
import { NOTE, QUIET_LINK, ROW, ROW_LINK, Rows, SUB, markRemoved } from "./customers-kit";

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMER — one customer, in the desk's record panel
//
// Head (code · status · type) → what stops its orders, when something does →
// its account on one line (counted from the ledger; credit from
// engine.creditCheck — never stored on the customer) → details → folded
// sections: who it serves, where it is, who signs in for it, its open deals,
// orders, ledger, offers and everything else filed against it → activity.
// Everything about the customer itself is edited in one "Edit" dialog.
// ════════════════════════════════════════════════════════════════════════════

type Role = Customer["portalUsers"][number]["role"];
type Ask = null | "edit" | "hold" | "invite" | "delete";

const CLAIM_STATUS: Record<Claim["status"], { label: string; tone: Tone }> = {
  submitted: { label: "Submitted", tone: "pending" },
  approved: { label: "Approved", tone: "partial" },
  settled: { label: "Settled", tone: "positive" },
  rejected: { label: "Rejected", tone: "neutral" },
};

const patch = (id: string, p: Partial<Customer>) => customersStore.set((cs) => cs.map((x) => (x.id === id ? { ...x, ...p } : x)));

/** Hold and release, as the desk's bulk bar and the record both do them. */
export function holdCustomer(c: Customer, reason = "") {
  patch(c.id, { status: "on hold" });
  logEvent(c.id, `put it on hold${reason.trim() ? ` — ${reason.trim()}` : ""}`);
}
export function releaseCustomer(c: Customer) {
  patch(c.id, { status: "active" });
  logEvent(c.id, "released the hold");
}

export function CustomerPanel({ c, ctx }: { c: Customer; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const playbooks = useStore(playbooksStore);
  const schemes = useStore(schemesStore);
  const hub = useStore(hubStore);
  const reps = useStore(repsStore);
  const ledger = useStore(ledgerStore);
  const opportunities = useStore(opportunitiesStore);
  const estimates = useStore(estimatesStore);
  const visits = useStore(visitsStore);
  const branding = useStore(brandingStore);
  const claims = useStore(claimsStore);
  const modules = useStore(modulesStore);
  const [ask, setAsk] = React.useState<Ask>(null);
  const [allKids, setAllKids] = React.useState(false);

  const hasType = types.some((t) => t.id === c.typeId);
  const t = typeOf(c);
  const parent = c.parentId ? customers.find((x) => x.id === c.parentId) : undefined;
  const kids = childrenOf(c.id, customers);
  const network = descendantsOf(c.id, customers).length;
  const rep = repById(c.repId, reps);
  const playbook = playbooks.find((p) => p.id === t.playbookId);
  // A shop also sees the orders our rep took for it and billed to its distributor (decision #26).
  const orders = hub.filter((o) => o.customerId === c.id || o.forCustomerId === c.id).sort((a, b) => b.at.localeCompare(a.at));
  // Deals still in play (decision #27): a won one shows as its order, a lost one only in Opportunities.
  const deals = opportunities.filter((o) => o.customerId === c.id && o.stage !== "won" && o.stage !== "lost").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const now = schemesNow(c, schemes);
  const soon = schemes.filter((s) => s.status === "scheduled" && s.from > SF_TODAY && (!s.typeIds.length || s.typeIds.includes(c.typeId)));
  const account = accountOf(c.id, ledger);
  const credit = creditCheck(c, 0);
  const rows = ledger.filter((r) => r.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const used = credit.limit ? (account.outstanding / credit.limit) * 100 : 0;

  const moduleOn = (k: ModuleKey) => modules.find((m) => m.key === k)?.on !== false;
  const related = [
    ...(moduleOn("field") ? visits.filter((v) => v.customerId === c.id).map((v) => ({ no: v.id, kind: "Visit", date: v.date.slice(0, 10), party: c.name, status: OUTLET_STATUS[v.state].label, tone: chipTone(OUTLET_STATUS[v.state].tone) })) : []),
    ...(moduleOn("branding") ? branding.filter((b) => b.customerId === c.id).map((b) => ({ no: b.id, kind: "Branding", date: b.requestedOn.slice(0, 10), party: c.name, status: BRANDING_LABEL[b.stage], tone: chipTone(BRANDING_TONE[b.stage]) })) : []),
    ...(moduleOn("claims") ? claims.filter((x) => x.partyKind === "customer" && x.party === c.id).map((x) => ({ no: x.id, kind: "Claim", date: x.raisedOn.slice(0, 10), party: c.name, status: CLAIM_STATUS[x.status].label, tone: CLAIM_STATUS[x.status].tone })) : []),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const openRelated = (no: string) => {
    const kind = related.find((x) => x.no === no)?.kind;
    navigate(sfPath(`${kind === "Visit" ? "visits" : kind === "Branding" ? "branding" : "claims"}/${no}`));
  };

  const release = () => {
    releaseCustomer(c);
    ctx.show("success", `${c.name} released`);
  };
  const removeUser = (i: number) => {
    const u = c.portalUsers[i];
    patch(c.id, { portalUsers: c.portalUsers.filter((_, k) => k !== i) });
    logEvent(c.id, `removed ${u.name} from the portal`);
    ctx.show("info", `${u.name} removed from the portal`, { label: "Undo", run: () => customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, portalUsers: [...x.portalUsers, u] } : x))) });
  };
  const newOrder = () => navigate(`${sfPath("orders/new")}?customer=${c.id}`);
  const newOpportunity = () => navigate(`${sfPath("opportunities/new")}?customer=${c.id}`);

  const step =
    c.status === "on hold" ? (
      <StepCard
        tone="danger"
        icon={<CirclePause size={15} />}
        title="On hold"
        sub="New orders from every channel are blocked."
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={release}>
            <CirclePlay size={13} /> Release
          </button>
        }
      />
    ) : !credit.ok ? (
      <StepCard
        tone="danger"
        icon={<ShieldAlert size={15} />}
        title={credit.reason ?? "Fails the credit check"}
        sub={`New orders ${credit.stop === "hard" ? "are blocked unless someone overrides it" : "go through with a warning"}.`}
        actions={
          <button type="button" className={GHOST_SM} onClick={() => navigate(sfPath("payments"))}>
            Receipts
          </button>
        }
      />
    ) : !hasType ? (
      <StepCard
        icon={<Shapes size={15} />}
        title="No type"
        sub="It pays the list price, with no credit terms and no portal."
        actions={
          <button type="button" className={cn(BTN, "h-8")} onClick={() => setAsk("edit")}>
            Set a type
          </button>
        }
      />
    ) : null;

  return (
    <RecordShell
      ctx={ctx}
      no={c.code}
      chips={<Chip tone={chipTone(STATUS_TONE[c.status])}>{STATUS_LABEL[c.status]}</Chip>}
      title={c.name}
      meta={[
        <TypeMark key="t" name={hasType ? t.name : "No type"} color={t.color} />,
        ...(c.city ? [<span key="p">{c.city}</span>] : []),
        rep ? (
          <span key="r" className="inline-flex items-center gap-1.5">
            <Who name={rep.name} size={16} /> {rep.name}
          </span>
        ) : (
          <span key="r">No rep</span>
        ),
        ...(c.phone
          ? [
              <span key="ph" className={NUM}>
                {c.phone}
              </span>,
            ]
          : []),
      ]}
      menu={(close) => (
        <>
          <MenuItem icon={Plus} onClick={() => (close(), newOrder())}>
            New order
          </MenuItem>
          <MenuItem icon={Plus} onClick={() => (close(), newOpportunity())}>
            New opportunity
          </MenuItem>
          <MenuItem icon={Pencil} onClick={() => (close(), setAsk("edit"))}>
            Edit customer…
          </MenuItem>
          <MenuSep />
          {c.status === "on hold" ? (
            <MenuItem icon={CirclePlay} onClick={() => (close(), release())}>
              Release the hold
            </MenuItem>
          ) : (
            <MenuItem icon={CirclePause} onClick={() => (close(), setAsk("hold"))}>
              Put on hold…
            </MenuItem>
          )}
          <MenuItem icon={Trash2} danger onClick={() => (close(), setAsk("delete"))}>
            Delete customer…
          </MenuItem>
        </>
      )}
      foot={<SfNoteFoot id={c.id} />}
    >
      {step}

      <div className="border-b border-bz-line-soft px-5 pb-3 pt-1">
        <Statline className="pt-3">
          <Stat label="Credit limit" value={credit.limit === null ? "No check" : credit.limit === 0 ? "Cash only" : <Amount value={credit.limit} />} />
          <Stat label="Owes" value={<Amount value={account.outstanding} />} />
          {account.overdue > 0 && <Stat label="Overdue" value={<Amount value={account.overdue} />} danger />}
          {credit.available !== null && <Stat label="Available" value={<Amount value={credit.available} />} />}
          {credit.limit !== null && credit.limit > 0 && <Stat label="Used" meter={used} value={`${Math.round(used)}%`} />}
          {account.pending > 0 && <Stat label="To confirm" value={<Amount value={account.pending} />} title="Paid, waiting for accounts to confirm it in Receipts" />}
        </Statline>
      </div>

      <Block
        title="Details"
        right={
          <button type="button" className={cn(GHOST_SM, "h-7")} onClick={() => setAsk("edit")}>
            <Pencil size={11} /> Edit
          </button>
        }
      >
        <CellGrid>
          <Cell label="Type">
            <span title={hasType ? getsSentence(t, playbooks) : undefined}>
              <TypeMark name={hasType ? t.name : "No type"} color={t.color} className="text-[12px] text-bz-text" />
            </span>
            <span className={SUB}>Tier {c.tier}</span>
          </Cell>
          <Cell label="Served by">
            {parent ? (
              <button type="button" onClick={() => ctx.go(parent.id)} className="max-w-full truncate text-left hover:underline hover:underline-offset-4">
                {parent.name}
              </button>
            ) : c.parentId ? (
              <span className="text-bz-red">A deleted customer</span>
            ) : (
              "You"
            )}
            <span className={SUB}>{parent ? "Bills this customer" : c.parentId ? "Pick another in Edit" : "Billed direct"}</span>
          </Cell>
          <Cell label="Route">
            <RouteCell c={c} show={ctx.show} />
          </Cell>
          <Cell label="Rep">
            {rep ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Who name={rep.name} size={16} /> {rep.name}
                </span>
                <span className={SUB}>{rep.role}</span>
              </>
            ) : (
              <span className="text-bz-text-soft">No rep</span>
            )}
          </Cell>
          {hasType && (
            <>
              <Cell label="Price">{t.priceOff ? `${t.priceOff}% off list` : "List price"}</Cell>
              <Cell label="Credit terms">
                <span className={NUM}>{t.creditDays} days</span>
                <span className={cn(SUB, NUM)}>
                  {t.creditStop === "hard" ? "Blocks" : "Warns"} past {t.graceDays} days overdue
                </span>
              </Cell>
              <Cell label="Portal">{PORTAL_LABEL[t.portal]}</Cell>
              <Cell label="Playbook">
                {playbook?.name ?? "None"}
                <span className={cn(SUB, NUM)}>{t.visitsPer4w ? `${t.visitsPer4w} ${t.visitsPer4w === 1 ? "visit" : "visits"} every 4 weeks` : "Not visited"}</span>
              </Cell>
            </>
          )}
        </CellGrid>
      </Block>

      <div className="border-b border-bz-line-soft">
        {(t.ownCustomers || kids.length > 0) && (
          <Section title="Its customers" count={kids.length} summary={kids.length === 0 ? "None" : network > kids.length ? `${network} in its whole network` : kids.slice(0, 3).map((k) => k.name).join(" · ")} defaultOpen={kids.length > 0 && kids.length <= 6}>
            {kids.length === 0 ? (
              <p className={NOTE}>None yet.</p>
            ) : (
              <>
                <Rows>
                  {(allKids ? kids : kids.slice(0, 6)).map((k) => {
                    const ka = accountOf(k.id, ledger);
                    return (
                      <button key={k.id} type="button" onClick={() => ctx.go(k.id)} className={ROW_LINK}>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-bz-text">{k.name}</span>
                          <span className={SUB}>{[typeOf(k).name, k.city].filter(Boolean).join(" · ")}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <Amount value={ka.outstanding} className={ka.outstanding ? "text-bz-text" : "text-bz-text-soft"} />
                          {ka.overdue > 0 && (
                            <span className="block text-[10.5px] text-bz-red">
                              <Amount value={ka.overdue} className="text-bz-red" /> overdue
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </Rows>
                {kids.length > 6 && (
                  <button type="button" onClick={() => setAllKids((v) => !v)} className={cn(QUIET_LINK, "mt-2")}>
                    {allKids ? "Show fewer" : `Show all ${kids.length}`}
                  </button>
                )}
              </>
            )}
          </Section>
        )}

        <LocationSection c={c} ctx={ctx} />

        {(t.portal !== "none" || c.portalUsers.length > 0) && (
          <Section
            title={t.portal === "retailer" ? "Retailer app users" : "Portal users"}
            count={c.portalUsers.length}
            summary={c.portalUsers.length ? c.portalUsers.map((u) => u.name).join(" · ") : "None"}
            defaultOpen={c.portalUsers.length > 0 && c.portalUsers.length <= 4}
            right={
              t.portal !== "none" && (
                <button type="button" onClick={() => setAsk("invite")} className={cn(GHOST_SM, "h-7")} title="Invite user" aria-label="Invite user">
                  <UserPlus size={12} /> <span className="hidden sm:inline">Invite user</span>
                </button>
              )
            }
          >
            {c.portalUsers.length === 0 ? (
              <p className={NOTE}>Nobody can sign in yet.</p>
            ) : (
              <Rows>
                {c.portalUsers.map((u, i) => (
                  <div key={`${u.name}-${i}`} className={ROW}>
                    <Who name={u.name} size={22} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-bz-text">{u.name}</span>
                      <span className={SUB}>{u.role}</span>
                    </span>
                    <span className={cn("shrink-0 text-[11px]", NUM, u.lastSeen ? "text-bz-text-muted" : "text-bz-text-soft")}>{u.lastSeen ? `Seen ${u.lastSeen === SF_TODAY ? "today" : day(u.lastSeen)}` : "Not signed in yet"}</span>
                    <button type="button" onClick={() => removeUser(i)} className={QUIET_LINK}>
                      Remove
                    </button>
                  </div>
                ))}
              </Rows>
            )}
            {t.portal === "none" && <p className={cn(NOTE, "mt-2")}>Its type has no portal.</p>}
          </Section>
        )}

        <Section
          title="Opportunities and estimates"
          count={deals.length}
          summary={deals.length ? deals.map((o) => o.title).join(" · ") : "Nothing open"}
          defaultOpen={deals.length > 0 && deals.length <= 4}
          right={
            <button type="button" onClick={newOpportunity} className={cn(GHOST_SM, "h-7")} title="New opportunity" aria-label="New opportunity">
              <Plus size={12} /> <span className="hidden sm:inline">New opportunity</span>
            </button>
          }
        >
          {deals.length === 0 ? (
            <p className={NOTE}>Nothing open.</p>
          ) : (
            <Rows>
              {deals.map((o) => {
                // The estimate is the sales desk's: its row opens it there.
                const est = openEstimateOf(o.id, estimates);
                const sent = est ? latestVersion(est) : undefined;
                return (
                  <React.Fragment key={o.id}>
                    <button type="button" onClick={() => navigate(sfPath(`opportunities/${o.id}`))} className={ROW_LINK}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-bz-text">{o.title}</span>
                        <span className={cn(SUB, NUM)}>{[o.id, o.rfqNo, dayTime(o.createdAt)].filter(Boolean).join(" · ")}</span>
                      </span>
                      <Chip tone={chipTone(STAGE_TONE[o.stage])} className="hidden sm:inline-flex">
                        {STAGE_LABEL[o.stage]}
                      </Chip>
                      <Amount value={o.expectedValue} className="w-[96px] shrink-0 text-right font-semibold text-bz-text" />
                    </button>
                    {est && (
                      <button type="button" onClick={() => navigate(estimatePath(est.no))} className={cn(ROW_LINK, "bg-bz-paper pl-6")}>
                        <span className={cn("min-w-0 flex-1 truncate text-[11.5px] text-bz-text-muted", NUM)}>{sent ? `${est.no} · version ${sent.no} · valid till ${day(sent.validTill)}` : est.no}</span>
                        <Chip tone={OFFER_TONE[offerReading(est)]}>{OFFER_LABEL[offerReading(est)]}</Chip>
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </Rows>
          )}
        </Section>

        <Section
          title="Orders"
          count={orders.length}
          summary={orders.length ? `Last ${dayTime(orders[0].at)}` : "None"}
          right={
            c.status !== "on hold" && (
              <button type="button" onClick={newOrder} className={cn(GHOST_SM, "h-7")} title="New order" aria-label="New order">
                <Plus size={12} /> <span className="hidden sm:inline">New order</span>
              </button>
            )
          }
        >
          {orders.length === 0 ? (
            <p className={NOTE}>No orders yet.</p>
          ) : (
            <>
              <Rows>
                {orders.slice(0, 5).map((o) => (
                  <OrderLine key={o.id} o={o} total={evaluate(o.customerId, o.lines, schemes).total} onOpen={() => navigate(sfPath(`orders/${o.id}`))} />
                ))}
              </Rows>
              <button type="button" onClick={() => navigate(sfPath("orders"))} className={cn(QUIET_LINK, "mt-2")}>
                {orders.length > 5 ? `${orders.length - 5} older in Orders` : "Open Orders"}
              </button>
            </>
          )}
        </Section>

        <Section
          title="Ledger"
          count={rows.length}
          summary={rows.length ? `${rows[0].doc} · ${day(rows[0].date)}` : "Nothing billed or paid yet"}
          right={
            <button type="button" onClick={() => navigate(sfPath("payments"))} className={cn(GHOST_SM, "h-7")}>
              Receipts
            </button>
          }
        >
          {rows.length === 0 ? (
            <p className={NOTE}>Nothing billed or paid yet.</p>
          ) : (
            <Rows>
              {rows.slice(0, 5).map((r) => (
                <LedgerLine key={r.id} r={r} />
              ))}
            </Rows>
          )}
          {rows.length > 5 && <p className={cn(NOTE, "mt-2", NUM)}>{rows.length - 5} older entries.</p>}
        </Section>

        <Section title="Offers it gets now" count={now.length} summary={now.length ? now.map((s) => s.name).join(" · ") : "None"}>
          {now.length === 0 ? (
            <p className={NOTE}>No live scheme covers it today.</p>
          ) : (
            <Rows>
              {now.map((s) => (
                <button key={s.id} type="button" onClick={() => navigate(sfPath(`schemes/${s.id}`))} className={ROW_LINK}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-bz-text">{s.name}</span>
                    <span className={cn(SUB, NUM)}>
                      {mechanicText(s.mechanic)} · until {day(s.to)}
                      {s.applies === "payment" ? " · on payment" : s.applies === "claim" ? " · by claim" : s.applies === "period" ? " · end of period" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </Rows>
          )}
          {soon.length > 0 && <p className={cn(NOTE, "mt-2", NUM)}>Starting soon: {soon.map((s) => `${s.name} (${day(s.from)})`).join(", ")}.</p>}
        </Section>

        {related.length > 0 && <RelatedSection rows={related} onOpen={openRelated} />}
      </div>

      <SfActivity ids={[c.id]} />

      <EditDialog open={ask === "edit"} c={c} onClose={() => setAsk(null)} onDone={(m) => ctx.show("success", m)} />
      <HoldDialog open={ask === "hold"} c={c} onClose={() => setAsk(null)} onDone={(m) => ctx.show("info", m)} />
      <InviteDialog open={ask === "invite"} c={c} onClose={() => setAsk(null)} onDone={(m) => ctx.show("success", m)} />
      <DeleteDialog open={ask === "delete"} c={c} onClose={() => setAsk(null)} onDeleted={() => ctx.go(null)} />
    </RecordShell>
  );
}

const NEW_ROUTE = "__new";

/**
 * The route(s) the customer is walked on (owner decision #28), each a link to it with the days it runs — and
 * "Change", which moves the customer to another route. A customer whose type asks for visits and that is on no
 * route is said so in amber: nobody is due there.
 */
function RouteCell({ c, show }: { c: Customer; show: PanelCtx["show"] }) {
  const navigate = useNavigate();
  const routes = useStore(routesStore);
  // The days under each name come from the plan.
  useStore(routePlanStore);
  const on = routes.filter((r) => r.stops.some((s) => s.customerId === c.id));
  const asks = typeOf(c).visitsPer4w > 0;
  const options: SelectOption[] = [
    ...[...routes].sort((a, b) => a.name.localeCompare(b.name)).map((r) => ({ value: r.id, label: r.name, hint: on.includes(r) ? "It is on this route" : plannedText(r.id), disabled: on.includes(r) })),
    { value: NEW_ROUTE, label: "New route" },
  ];
  const move = (id: string) => {
    if (id === NEW_ROUTE) return navigate(`${sfPath("routes/new")}?customer=${encodeURIComponent(c.id)}`);
    const before = on.map((r) => {
      const index = r.stops.findIndex((s) => s.customerId === c.id);
      return { routeId: r.id, stop: r.stops[index], index };
    });
    const refusal = moveCustomerToRoute(c.id, id);
    if (refusal) return show("error", refusal);
    show("success", `${c.name} ${before.length ? "moved to" : "put on"} ${routeName(id)}`, {
      label: "Undo",
      run: () => {
        removeStop(id, c.id);
        before.forEach((b) => restoreStop(b.routeId, b.stop, b.index));
      },
    });
  };
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        {on.length === 0 ? (
          <span className={asks ? "text-bz-amber-ink" : "text-bz-text-soft"}>No route</span>
        ) : (
          on.map((r) => (
            <React.Fragment key={r.id}>
              <button type="button" onClick={() => navigate(sfPath(`routes/${r.id}`))} className="block max-w-full truncate text-left hover:underline hover:underline-offset-4">
                {r.name}
              </button>
              <span className={SUB}>{plannedText(r.id)}</span>
            </React.Fragment>
          ))
        )}
      </div>
      <Select trigger="plain" align="right" width={280} placeholder="Route" title={on.length ? "Move it to another route" : "Put it on a route"} value={null} onChange={move} options={options} className={QUIET_LINK}>
        {on.length ? "Change" : "Choose"}
      </Select>
    </div>
  );
}

/** Where the outlet is. Reps' check-ins measure from it; a rep can also save it from a visit. */
function LocationSection({ c, ctx }: { c: Customer; ctx: PanelCtx }) {
  const [entering, setEntering] = React.useState(false);
  const loc = c.location ?? null;
  const save = (next: GeoPoint | null, what: string) => {
    patch(c.id, { location: next });
    logEvent(c.id, what);
  };
  const was = loc ? ` (was ${coordsText(loc)})` : "";
  const remove = () => {
    if (!loc) return;
    save(null, `removed its location${was}`);
    ctx.show("info", "Location removed", { label: "Undo", run: () => save(loc, `put its location back at ${coordsText(loc)}`) });
  };
  return (
    <Section title="Location" summary={loc ? <span className={NUM}>{coordsText(loc)}</span> : "Not set"} right={loc ? <MapLink p={loc}>Google Maps</MapLink> : undefined}>
      {loc && (
        <>
          <p className={cn("m-0 text-[12px] text-bz-text", NUM)}>{coordsText(loc)}</p>
          <MapEmbed src={osmEmbedUrl(loc.lat, loc.lng)} title={`Map: ${c.name}`} className="mt-2.5" />
        </>
      )}
      <div className={cn("flex flex-wrap items-start gap-2", loc && "mt-3")}>
        <UseMyLocation
          small
          onFix={(f) => {
            save({ lat: f.lat, lng: f.lng }, `set its location from this device to ${coordsText(f)} (± ${f.accuracy} m)${was}`);
            ctx.show("success", "Location saved");
          }}
        />
        <button type="button" className={GHOST_SM} onClick={() => setEntering(true)}>
          Enter coordinates
        </button>
        {loc && (
          <button type="button" className={GHOST_SM} onClick={remove}>
            Remove
          </button>
        )}
      </div>
      <CoordsDialog
        open={entering}
        eyebrow={c.name}
        initial={loc}
        onClose={() => setEntering(false)}
        onSave={(p) => {
          setEntering(false);
          if (loc && loc.lat === p.lat && loc.lng === p.lng) return;
          save(p, `entered its location as ${coordsText(p)}${was}`);
          ctx.show("success", "Location saved");
        }}
      />
    </Section>
  );
}

function LedgerLine({ r }: { r: LedgerEntry }) {
  const amount = r.debit || r.credit;
  return (
    <div className={ROW}>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-bz-text", NUM)}>
          {r.doc} <span className="text-bz-text-soft">· {r.kind}</span>
        </span>
        <span className={cn(SUB, NUM)}>
          {day(r.date)}
          {r.due && r.debit > 0 && ` · due ${day(r.due)}`}
          {r.pending && " · waiting to be confirmed"}
        </span>
      </span>
      <span className={cn("shrink-0", r.pending ? "text-bz-text-soft" : r.debit ? "text-bz-text" : "text-bz-pos-deep")}>
        {r.debit ? "" : "−"}
        <Amount value={amount} className={r.pending ? "text-bz-text-soft" : undefined} />
      </span>
    </div>
  );
}

function OrderLine({ o, total, onOpen }: { o: HubOrder; total: number; onOpen: () => void }) {
  const st = STATUS_META[o.status];
  return (
    <button type="button" onClick={onOpen} className={ROW_LINK}>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-bz-text", NUM)}>{o.id}</span>
        <span className={cn(SUB, NUM)}>{[dayTime(o.at), SOURCE_NAME[o.source], o.byName, forText(o), estimateRef(o) ? `from estimate ${estimateRef(o)}` : ""].filter(Boolean).join(" · ")}</span>
      </span>
      <Chip tone={chipTone(st.tone)} className="hidden sm:inline-flex">
        {st.label}
      </Chip>
      <Amount value={total} className="w-[96px] shrink-0 text-right font-semibold text-bz-text" />
    </button>
  );
}

// ── Dialogs ─────────────────────────────────────────────────────────────────

const draftOf = (c: Customer): CustomerDraft => ({
  name: c.name,
  typeId: c.typeId,
  repId: c.repId ?? "",
  parentId: c.parentId ?? "",
  tier: c.tier,
  city: c.city,
  phone: c.phone,
  creditLimit: c.creditLimit,
});

function EditDialog({ open, c, onClose, onDone }: { open: boolean; c: Customer; onClose: () => void; onDone: (m: string) => void }) {
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const reps = useStore(repsStore);
  // A quick-add opened from a picker here replaces this dialog while it is up; the draft stays.
  const quick = useStore(quickAddStore);
  const [d, setD] = React.useState<CustomerDraft>(() => draftOf(c));
  const [status, setStatus] = React.useState<Customer["status"]>(c.status);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setD(draftOf(c));
    setStatus(c.status);
    setTried(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = <K extends keyof CustomerDraft>(k: K, v: CustomerDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const name = d.name.trim();
  const below = new Set(descendantsOf(c.id, customers).map((x) => x.id));
  const error = !name ? "A name is required." : !d.typeId ? "Choose a customer type." : customers.some((x) => x.id !== c.id && x.name.trim().toLowerCase() === name.toLowerCase()) ? `There is already a customer called ${name}.` : null;

  const save = () => {
    setTried(true);
    if (error) return;
    const next: Customer = { ...c, name, typeId: d.typeId, repId: d.repId || null, parentId: d.parentId || null, tier: d.tier, city: d.city.trim(), phone: d.phone.trim(), creditLimit: d.creditLimit, status };
    customersStore.set((cs) => cs.map((x) => (x.id === c.id ? next : x)));
    const tName = (id: string) => types.find((t) => t.id === id)?.name ?? "no type";
    const cName = (id: string | null) => (id ? (customers.find((x) => x.id === id)?.name ?? "a deleted customer") : "you directly");
    const w: string[] = [];
    if (next.name !== c.name) w.push(`renamed it from ${c.name} to ${next.name}`);
    if (next.typeId !== c.typeId) w.push(`changed the type from ${tName(c.typeId)} to ${tName(next.typeId)}`);
    if (next.parentId !== c.parentId) w.push(`changed who serves it from ${cName(c.parentId)} to ${cName(next.parentId)}`);
    if (next.repId !== c.repId) w.push(`gave it to ${reps.find((r) => r.id === next.repId)?.name ?? "no rep"}`);
    if (next.creditLimit !== c.creditLimit) w.push(`changed the credit limit from ${limitText(c.creditLimit).toLowerCase()} to ${limitText(next.creditLimit).toLowerCase()}`);
    if (next.tier !== c.tier) w.push(`changed the tier from ${c.tier} to ${next.tier}`);
    if (next.status !== c.status) w.push(`set the status to ${STATUS_LABEL[next.status].toLowerCase()}`);
    if (next.city !== c.city || next.phone !== c.phone) w.push("changed its city or phone");
    w.forEach((x) => logEvent(c.id, x));
    onDone(w.length ? `${next.name} saved` : "Nothing changed");
    onClose();
  };

  return (
    <Dialog
      open={open && !quick}
      eyebrow={c.code}
      title={`Edit ${c.name}`}
      onClose={onClose}
      foot={
        <>
          {tried && error && <span className="mr-auto text-[11.5px] text-bz-red">{error}</span>}
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Name" required>
          <input value={d.name} onChange={(e) => set("name", e.target.value)} className={cn(INPUT, tried && !name && "border-bz-red-mark")} />
        </Field>
        <CustomerFields d={d} set={set} selfId={c.id} blockedParents={below} onAdd={(kind, onCreated, preset) => openQuickAdd(kind, { onCreated, preset })} />
        <More>
          <CustomerMoreFields d={d} set={set} />
          <Field label="Status">
            <Segmented<Customer["status"]>
              size="sm"
              value={status}
              onChange={setStatus}
              options={[
                { value: "active", label: STATUS_LABEL.active },
                { value: "onboarding", label: STATUS_LABEL.onboarding, title: "Still being set up — orders are allowed" },
                { value: "on hold", label: STATUS_LABEL["on hold"], title: "New orders from every channel are blocked" },
              ]}
            />
          </Field>
        </More>
      </div>
    </Dialog>
  );
}

function HoldDialog({ open, c, onClose, onDone }: { open: boolean; c: Customer; onClose: () => void; onDone: (m: string) => void }) {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => setReason(""), [open]);
  const save = () => {
    holdCustomer(c, reason);
    onDone(`${c.name} put on hold`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={c.code}
      title={`Put ${c.name} on hold?`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={DANGER_BTN} onClick={save}>
            Put on hold
          </button>
        </>
      }
    >
      <p className="m-0 mb-3 text-[12px] leading-relaxed text-bz-text-muted">New orders from every channel are blocked until it is released.</p>
      <Field label="Reason">
        <textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} className={cn(TEXTAREA, "min-h-[64px]")} />
      </Field>
    </Dialog>
  );
}

const ROLE_HINT: Record<Role, string> = { Owner: "Everything, including adding users", Buyer: "Places and tracks orders", Accounts: "Sees the statement, pays and raises claims" };

function InviteDialog({ open, c, onClose, onDone }: { open: boolean; c: Customer; onClose: () => void; onDone: (m: string) => void }) {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<Role>("Owner");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    setName("");
    setRole(c.portalUsers.length ? "Buyer" : "Owner");
    setTried(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = name.trim();
  const taken = c.portalUsers.some((u) => u.name.trim().toLowerCase() === n.toLowerCase());
  const error = !n ? "A name is required." : taken ? `${n} is already a user here.` : null;
  const save = () => {
    setTried(true);
    if (error) return;
    customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, portalUsers: [...x.portalUsers, { name: n, role, lastSeen: null }] } : x)));
    logEvent(c.id, `invited ${n} to the portal as ${role}`);
    onDone(`${n} invited as ${role}`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={c.name}
      title="Invite a portal user"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            Invite
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Name" required>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), save())} className={cn(INPUT, tried && error && "border-bz-red-mark")} placeholder="Full name" />
          {tried && error && (
            <span role="alert" className="text-[10.5px] text-bz-red">
              {error}
            </span>
          )}
        </Field>
        <Field label="Role">
          <Segmented<Role> size="sm" value={role} onChange={setRole} options={(["Owner", "Buyer", "Accounts"] as const).map((r) => ({ value: r, label: r, title: ROLE_HINT[r] }))} />
        </Field>
      </div>
    </Dialog>
  );
}

function DeleteDialog({ open, c, onClose, onDeleted }: { open: boolean; c: Customer; onClose: () => void; onDeleted: () => void }) {
  const customers = useStore(customersStore);
  const ledger = useStore(ledgerStore);
  const hub = useStore(hubStore);
  const kids = childrenOf(c.id, customers).length;
  const rows = ledger.filter((r) => r.customerId === c.id).length;
  const orders = hub.filter((o) => o.customerId === c.id).length;
  const why = kids ? `${kids} ${kids === 1 ? "customer is" : "customers are"} served by it. Change who serves ${kids === 1 ? "it" : "them"} first.` : rows ? "It has entries in its account. Put it on hold instead." : orders ? "It has orders. Put it on hold instead." : null;
  const remove = () => {
    onClose();
    // Leave the record as it goes, so the desk never draws "not available" for a customer just deleted.
    markRemoved(c.id);
    onDeleted();
    customersStore.set((cs) => cs.filter((x) => x.id !== c.id));
    logEvent(c.id, `deleted ${c.name}`);
  };
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={c.code}
      title={why ? `${c.name} can't be deleted` : `Delete ${c.name}?`}
      onClose={onClose}
      foot={
        why ? (
          <button type="button" className={GHOST} onClick={onClose}>
            Close
          </button>
        ) : (
          <>
            <button type="button" className={GHOST} onClick={onClose}>
              Keep it
            </button>
            <button type="button" className={DANGER_BTN} onClick={remove}>
              Delete
            </button>
          </>
        )
      }
    >
      <p className="m-0 text-[12px] leading-relaxed text-bz-text-muted">{why ?? "It leaves the customer list. Its history is kept."}</p>
    </Dialog>
  );
}
