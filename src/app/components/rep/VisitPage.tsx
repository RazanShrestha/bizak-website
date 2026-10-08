import * as React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronRight, LocateFixed, MapPin, Phone, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Dialog, Empty, Field, GHOST, INPUT, NUM, Popover, Stat, Statline, Switch } from "../sales/bzw";
import { Amount } from "../sales/orders";
import { Block } from "../sales/record";
import { createStore, useStore } from "../sales/store";
import { SF_NOW, SF_TODAY } from "../salesforce/data";
import type { ActResult, Customer, Rep, Visit } from "../salesforce/data";
import { accountOf, creditCheck, customerById, typeOf } from "../salesforce/engine";
import { OUTLET_STATUS, actsFor, activityName, activityOf, beatOn, billedToText, orderById, orderTotal, shortDay } from "../salesforce/field-data";
import { useFieldStores } from "../salesforce/field-kit";
import { nextId } from "../salesforce/persist";
import { logEvent } from "../salesforce/records";
import { FENCE_LABEL, fenceFor, fenceState, fenceText, fmtDistance, geoHelp, getPosition, osmBoundsUrl, osmEmbedUrl, recordPing } from "../salesforce/geo";
import type { GeoError, GeoPoint, Geofence } from "../salesforce/geo";
import { Finding, MapEmbed, MapLink } from "../salesforce/geo-kit";
import { routeForVisitToday } from "../salesforce/routes";
import { SfActivity, SfNoteFoot, TypeMark, chipTone } from "../salesforce/sf";
import { customersStore, ledgerStore, visitsStore } from "../salesforce/store";
import { ChoiceList, Err, ListBlock, MenuRow, Meta, ORDER_STATE, PAD, ROW, ROWS, ROW_TAP, StepMark } from "./kit";
import type { StepState } from "./kit";
import { RepShell, SignIn, repPath, repToast, useRep } from "./shell";
import { AT_SHOP_ONLY, BrandingSheet, CollectSheet, OffersSheet, OrderSheet, PhotoSheet, PlainSheet, StockSheet, patchVisit } from "./steps";
import type { StepProps } from "./steps";

// ════════════════════════════════════════════════════════════════════════════
// REP APP · A VISIT — check in, follow the playbook, check out
//
// :id is a visit id (V-…) or, before check-in, a customer id. Check-in takes a
// GPS fix, measures it against the shop's saved location and creates the Visit
// with the playbook's steps as a snapshot; steps that need the rep at the shop
// only open while the geofence is ok (GPS within the radius, a shop location
// saved from here, or — with no fix at all — the rep's own word, which the
// office sees). Check-out asks for a reason for every required step not done,
// and for a no-order reason when no order was taken. Skip always asks why.
// ════════════════════════════════════════════════════════════════════════════

/** The last GPS failure per visit — UI state only, so a check-in that failed can explain itself on the next screen. */
const geoErrors = createStore<Record<string, GeoError | undefined>>({});
const setGeoError = (visitId: string, e: GeoError | undefined) => geoErrors.set((m) => ({ ...m, [visitId]: e }));

const SKIP_REASONS = ["Shop closed", "Owner not in", "Ran out of time", "Could not reach the shop", "Other"];
const NO_ORDER_REASONS = ["Has enough stock", "Owner not in", "Waiting for payment", "Price or offer not right", "Other"];

/** The steps that do something of their own. Every other step is ticked with a short result; a photo step counts photos. */
type SheetKind = "order" | "collection" | "stock-count" | "branding-audit" | "scheme-briefing";
const SHEETS: Record<SheetKind, (p: StepProps) => React.ReactElement> = {
  order: OrderSheet,
  collection: CollectSheet,
  "stock-count": StockSheet,
  "branding-audit": BrandingSheet,
  "scheme-briefing": OffersSheet,
};
const sheetOf = (activityId: string): SheetKind | null => {
  const k = activityOf(activityId)?.kind;
  return k && k in SHEETS ? (k as SheetKind) : null;
};

export function RepVisitPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const again = params.get("again") === "1";
  const navigate = useNavigate();
  const rep = useRep();
  const s = useFieldStores();
  useStore(ledgerStore);

  if (!rep) {
    return (
      <RepShell title="Rep app" back={repPath()}>
        <SignIn />
      </RepShell>
    );
  }

  const byId = s.visits.find((v) => v.id === id);
  const customerId = byId?.customerId ?? id;
  const c = customerById(customerId);
  const todays = s.visits.filter((v) => v.repId === rep.id && v.customerId === customerId && v.date === SF_TODAY);
  const visit = byId ?? todays.find((v) => v.state === "in-progress") ?? (again ? undefined : todays[todays.length - 1]);

  if (!c && !visit) {
    return (
      <RepShell title="Visit" back={repPath()}>
        <Empty
          title="This customer isn't available."
          action={
            <Link to={repPath()} className={cn(GHOST, "h-10")}>
              Back to today
            </Link>
          }
        />
      </RepShell>
    );
  }
  if (!visit) return <BeforeVisit rep={rep} customer={c!} />;
  if (visit.state === "in-progress" && visit.repId === rep.id) return <DuringVisit rep={rep} customer={c} visit={visit} />;
  return <AfterVisit rep={rep} customer={c} visit={visit} onAgain={visit.date === SF_TODAY && c ? () => navigate(repPath(`visit/${c.id}?again=1`)) : undefined} />;
}

// ── Customer header (before and during) ─────────────────────────────────────

function CustomerHead({ c, planned }: { c: Customer | undefined; planned: boolean }) {
  const t = typeOf(c);
  const a = c ? accountOf(c.id) : null;
  const credit = c ? creditCheck(c, 0) : null;
  // The shop's own account; an order billed to its distributor is checked against the distributor instead.
  const servedBy = c?.parentId && c.parentId !== c.id ? customerById(c.parentId) : undefined;
  return (
    <div className={cn("border-b border-bz-line-soft py-3", PAD)}>
      <Meta items={[<TypeMark name={t.name} color={t.color} />, c?.city || null, planned ? "On today's route" : "Not on today's routes", servedBy && `Served by ${servedBy.name}`]} />
      {a && (
        <Statline className="mt-1">
          <Stat label="Owes" value={<Amount value={a.outstanding} />} />
          {a.overdue > 0 && <Stat label="Overdue" value={<Amount value={a.overdue} />} danger />}
          <Stat label="Credit left" value={credit?.limit === null ? "No limit" : <Amount value={credit?.available ?? 0} />} />
        </Statline>
      )}
      {credit && !credit.ok && (
        <p role="status" className="m-0 mt-0.5 text-[11.5px] text-bz-red">
          {credit.reason}
        </p>
      )}
      {c?.phone && (
        <a href={`tel:${c.phone}`} className={cn(GHOST, "mt-2.5 h-10")}>
          <Phone size={13} /> <span className={NUM}>{c.phone}</span>
        </a>
      )}
    </div>
  );
}

/** The visit's history line for a geofence. */
function fenceLog(g: Geofence): string {
  const s = fenceState(g);
  if (s === "at") return `at the shop (${fmtDistance(g.metres ?? 0)}, ± ${g.accuracy ?? "?"} m)`;
  if (s === "away") return `${fmtDistance(g.metres ?? 0)} from the shop (± ${g.accuracy ?? "?"} m)`;
  if (s === "unmeasured") return "with a GPS fix; the shop has no saved location";
  return "without a GPS fix";
}

/**
 * The shop on a map, with the rep's own fix in the frame when there is one. It is a picture, not a control: an
 * embedded map that takes the touch traps the page's scroll on a phone, so panning happens in the map app.
 */
function ShopMap({ shop, me, name }: { shop: GeoPoint | null | undefined; me: GeoPoint | null; name: string }) {
  const focus = shop ?? me;
  if (!focus) return null;
  return (
    <>
      <MapEmbed src={shop && me ? osmBoundsUrl([shop, me], shop) : osmEmbedUrl(focus.lat, focus.lng)} title={shop ? `Map: ${name}` : "Map: where you are"} className="pointer-events-none h-[140px]" />
      <MapLink p={focus} className="min-h-10" />
    </>
  );
}

/**
 * Where the rep is against the shop, while checked in: the distance from the GPS, the shop's missing location
 * (save it from here), or no fix at all (try again, or say "I'm at the shop" — the office sees it had no GPS).
 */
function LocationBlock({ rep, customer, visit }: { rep: Rep; customer: Customer | undefined; visit: Visit }) {
  const errors = useStore(geoErrors);
  const [busy, setBusy] = React.useState(false);
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const g = visit.geofence;
  const st = fenceState(g);
  const hasFix = g?.lat != null && g?.lng != null;

  const locate = async () => {
    setBusy(true);
    setGeoError(visit.id, undefined);
    const r = await getPosition();
    if (alive.current) setBusy(false);
    if (!r.ok) {
      // The reason shows under the control that asked (below) — a failure with a place on screen is not a toast.
      setGeoError(visit.id, r.error);
      return;
    }
    // Measure against the shop as it is now — the office may have saved its location since check-in.
    const fence = fenceFor(customerById(visit.customerId), r.fix);
    patchVisit(visit.id, (v) => ({ ...v, geofence: fence }));
    recordPing({ repId: rep.id, fix: r.fix, kind: hasFix ? "update" : "check-in", visitId: visit.id, customerId: visit.customerId });
    logEvent(visit.id, `updated their location: ${fenceLog(fence)}`, rep.name);
  };
  const saveAsShop = () => {
    const now = customersStore.get().find((c) => c.id === visit.customerId);
    if (!now || g?.lat == null || g.lng == null) return;
    if (now.location) return repToast("This shop has a location now. Update yours to measure from it.", "info");
    const loc = { lat: g.lat, lng: g.lng };
    customersStore.set((cs) => cs.map((c) => (c.id === now.id ? { ...c, location: loc } : c)));
    logEvent(now.id, `set the shop's location on a visit (${visit.id})`, rep.name);
    patchVisit(visit.id, (v) => ({ ...v, geofence: { ...loc, accuracy: g.accuracy, ok: true, metres: 0 } }));
    logEvent(visit.id, "saved their location as the shop's", rep.name);
    repToast("Saved as the shop's location");
  };
  const setManual = (on: boolean) => {
    patchVisit(visit.id, (v) => ({ ...v, geofence: on ? { ok: true, metres: null, manual: true } : { ok: false, metres: null } }));
    logEvent(visit.id, on ? "said they are at the shop (no GPS)" : "took back \"I'm at the shop\"", rep.name);
  };

  const err = errors[visit.id];
  const noFix = st === "none" || st === "manual" || st === null;
  // The one thing the rep has to act on: a step that needs the shop is waiting and the geofence says "not here".
  const blocks = !g?.ok && visit.acts.some((a) => a.geofence && !a.done);
  const m = g?.metres ?? 0;
  const line =
    st === "at"
      ? m === 0
        ? "You are at the shop."
        : `You are ${fmtDistance(m)} from the shop.`
      : st === "away"
        ? `You are ${fmtDistance(m)} from the shop.`
        : st === "unmeasured"
          ? customer?.location
            ? "The shop has a saved location now."
            : "This shop has no saved location."
          : geoHelp(err);

  return (
    <Block title="Location" right={st && <Chip tone={blocks ? "danger" : chipTone(FENCE_LABEL[st].tone)}>{FENCE_LABEL[st].label}</Chip>}>
      <div className="flex flex-wrap gap-2">
        {st === "unmeasured" && customer && !customer.location && (
          <button type="button" className={cn(GHOST, "h-10")} onClick={saveAsShop} disabled={busy}>
            <MapPin size={13} /> Save as the shop's location
          </button>
        )}
        <button type="button" className={cn(GHOST, "h-10")} onClick={locate} disabled={busy}>
          <LocateFixed size={13} /> {noFix ? "Try again" : "Update location"}
        </button>
      </div>
      {busy ? (
        <Finding className="mt-2" />
      ) : (
        <p role="status" className={cn("m-0 mt-2 text-[11.5px] leading-snug", blocks ? "text-bz-red" : "text-bz-text-muted")}>
          {line}
          {hasFix && g?.accuracy != null && <span className={cn(blocks ? "" : "text-bz-text-soft", NUM)}> ± {g.accuracy} m</span>}
        </p>
      )}
      {!busy && err && !noFix && (
        <p role="alert" className="m-0 mt-1 text-[11px] leading-snug text-bz-red">
          {geoHelp(err)}
        </p>
      )}
      {noFix && (
        // A label, so the whole 40px row flips the switch — the switch itself is a small target.
        <label className="mt-1 flex min-h-10 cursor-pointer items-center gap-3 text-[12.5px] text-bz-text">
          <span className="min-w-0 flex-1">I'm at the shop (no GPS)</span>
          <Switch on={st === "manual"} onChange={setManual} label="I'm at the shop (no GPS)" />
        </label>
      )}
      {(customer?.location || hasFix) && (
        <div className="mt-2">
          <ShopMap shop={customer?.location} me={hasFix ? { lat: g!.lat!, lng: g!.lng! } : null} name={customer?.name ?? "the shop"} />
        </div>
      )}
    </Block>
  );
}

// ── Steps ───────────────────────────────────────────────────────────────────

const stepMeta = (a: ActResult) => `${a.required ? "Required" : "Optional"}${a.geofence ? " · at the shop" : ""}`;

/** One step: its number, its state mark, its name, and its result (or what it asks) underneath. `onOpen` makes the row the way in. */
function StepRow({ a, n, state, sub, onOpen }: { a: ActResult; n: number; state: StepState; sub: React.ReactNode; onOpen?: () => void }) {
  const body = (
    <>
      <span className={cn("w-4 shrink-0 text-right text-[11px] text-bz-text-soft", NUM)}>{n}</span>
      <StepMark state={state} />
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[12.5px]", state === "locked" ? "text-bz-text-muted" : "text-bz-text")}>{activityName(a.activityId)}</span>
        <span className="block break-words text-[10.5px] text-bz-text-soft">{sub}</span>
      </span>
      {onOpen && <ChevronRight size={13} className="shrink-0 text-bz-text-soft" />}
    </>
  );
  return (
    <li>
      {onOpen ? (
        <button type="button" onClick={onOpen} className={ROW_TAP}>
          {body}
        </button>
      ) : (
        <div className={ROW}>{body}</div>
      )}
    </li>
  );
}

const NoSteps = () => <p className={cn("m-0 border-t border-bz-line-soft py-3 text-[11.5px] text-bz-text-soft", PAD)}>No steps due today.</p>;

/** History and notes of the visit (and of the order it took), with the note line under them. Notes are the rep's. */
function Trail({ visit, rep }: { visit: Visit; rep: Rep }) {
  return (
    <>
      <SfActivity ids={[visit.id, ...(visit.orderId ? [visit.orderId] : [])]} />
      <SfNoteFoot id={visit.id} author={rep.name} tall />
    </>
  );
}

// ── Before: check in or skip ────────────────────────────────────────────────

function BeforeVisit({ rep, customer }: { rep: Rep; customer: Customer }) {
  const navigate = useNavigate();
  const [locating, setLocating] = React.useState(false);
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [skipping, setSkipping] = React.useState(false);
  const planned = beatOn(rep.id).some((e) => e.customerId === customer.id);
  const { acts } = actsFor(customer, SF_TODAY);
  const busy = visitsStore.get().find((v) => v.repId === rep.id && v.state === "in-progress" && v.customerId !== customer.id);
  const busyAt = busy ? customerById(busy.customerId)?.name : undefined;

  const checkIn = async () => {
    if (locating) return;
    setLocating(true);
    const r = await getPosition();
    // The rep left the screen while the phone was looking — no visit was started.
    if (!alive.current) return;
    setLocating(false);
    const open = visitsStore.get().find((v) => v.repId === rep.id && v.state === "in-progress");
    if (open) return navigate(repPath(`visit/${open.id}`), { replace: true });
    const id = nextId("V-", visitsStore.get().map((v) => v.id), 4);
    const geofence: Geofence = r.ok ? fenceFor(customersStore.get().find((c) => c.id === customer.id), r.fix) : { ok: false, metres: null };
    const v: Visit = { id, date: SF_TODAY, repId: rep.id, customerId: customer.id, planned, state: "in-progress", checkIn: SF_NOW, checkOut: null, geofence, orderId: null, routeId: routeForVisitToday(rep.id, customer.id), noOrderReason: null, skipReason: null, acts, photos: 0 };
    visitsStore.set((list) => [...list, v]);
    if (r.ok) recordPing({ repId: rep.id, fix: r.fix, kind: "check-in", visitId: id, customerId: customer.id });
    else setGeoError(id, r.error);
    logEvent(id, `checked in ${fenceLog(geofence)}`, rep.name);
    logEvent(customer.id, `visited by ${rep.name} (${id})`, rep.name);
    navigate(repPath(`visit/${id}`), { replace: true });
  };
  const skip = (reason: string) => {
    const id = nextId("V-", visitsStore.get().map((v) => v.id), 4);
    visitsStore.set((list) => [...list, { id, date: SF_TODAY, repId: rep.id, customerId: customer.id, planned, state: "skipped", checkIn: null, checkOut: null, geofence: null, orderId: null, routeId: routeForVisitToday(rep.id, customer.id), noOrderReason: null, skipReason: reason, acts, photos: 0 }]);
    logEvent(id, `skipped the visit: ${reason}`, rep.name);
    logEvent(customer.id, `visit skipped by ${rep.name}: ${reason}`, rep.name);
    repToast(`${customer.name} skipped`, "info");
    navigate(repPath());
  };

  return (
    <RepShell
      title={customer.name}
      sub={busy ? "Finish your other visit first" : "Not checked in"}
      back={repPath()}
      foot={
        busy ? (
          <button type="button" className={cn(BTN, "h-11 w-full")} onClick={() => navigate(repPath(`visit/${busy.id}`))}>
            Go to {busyAt ?? "your open visit"}
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" className={cn(GHOST, "h-11 px-4")} onClick={() => setSkipping(true)}>
              Skip
            </button>
            <button type="button" className={cn(BTN, "h-11 flex-1")} onClick={checkIn} disabled={locating}>
              {locating ? "Finding you…" : "Check in"}
            </button>
          </div>
        )
      }
    >
      <CustomerHead c={customer} planned={planned} />
      {busy ? (
        <p role="status" className={cn("m-0 border-b border-bz-line-soft py-3 text-[12px] text-bz-text", PAD)}>
          You are still checked in at {busyAt ?? "another customer"}.
        </p>
      ) : (
        <Block title="Location">
          {locating && <Finding className={customer.location ? "mb-2" : undefined} />}
          {!locating && !customer.location && <p className="m-0 text-[11.5px] text-bz-text-muted">This shop has no saved location.</p>}
          <ShopMap shop={customer.location} me={null} name={customer.name} />
        </Block>
      )}
      <ListBlock title="Steps" count={acts.length}>
        {acts.length === 0 ? (
          <NoSteps />
        ) : (
          <ol className={ROWS}>
            {acts.map((a, i) => (
              <StepRow key={`${a.activityId}-${i}`} a={a} n={i + 1} state="todo" sub={stepMeta(a)} />
            ))}
          </ol>
        )}
      </ListBlock>
      <ReasonDialog open={skipping} eyebrow={customer.code} title={`Skip ${customer.name}?`} reasons={SKIP_REASONS} verb="Skip visit" onClose={() => setSkipping(false)} onDone={skip} />
    </RepShell>
  );
}

// ── During: the steps ───────────────────────────────────────────────────────

function DuringVisit({ rep, customer, visit }: { rep: Rep; customer: Customer | undefined; visit: Visit }) {
  const navigate = useNavigate();
  const [sheet, setSheet] = React.useState<number | null>(null);
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [skipping, setSkipping] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const s = useFieldStores();
  const atShop = !!visit.geofence?.ok;

  const addStep = (activityId: string) => {
    setAdding(false);
    patchVisit(visit.id, (v) => ({ ...v, acts: [...v.acts, { activityId, required: false, geofence: false, done: false, result: "" }] }));
    logEvent(visit.id, `added the step "${activityName(activityId)}"`, rep.name);
  };
  const skip = (reason: string) => {
    patchVisit(visit.id, (v) => ({ ...v, state: "skipped", skipReason: reason, checkOut: SF_NOW }));
    logEvent(visit.id, `skipped the visit: ${reason}`, rep.name);
    if (customer) logEvent(customer.id, `visit ${visit.id} skipped by ${rep.name}: ${reason}`, rep.name);
    repToast("Visit skipped", "info");
    navigate(repPath());
  };
  const unusedActs = s.activities.filter((a) => !visit.acts.some((x) => x.activityId === a.id));
  const done = visit.acts.filter((a) => a.done).length;
  const lockedAt = (a: ActResult) => a.geofence && !atShop;

  // The open step's sheet. Order, payment, stock, branding and offers work on the customer record; a photo and a
  // plain step do not, so they still open when the customer was removed.
  const openAct = sheet === null ? undefined : visit.acts[sheet];
  let layer: React.ReactNode = null;
  if (openAct && sheet !== null) {
    const kind = sheetOf(openAct.activityId);
    const close = () => setSheet(null);
    if (kind) {
      const StepSheet = SHEETS[kind];
      layer = customer ? <StepSheet key={sheet} visit={visit} customer={customer} rep={rep} index={sheet} onClose={close} /> : null;
    } else if (activityOf(openAct.activityId)?.kind === "photo") layer = <PhotoSheet key={sheet} visit={visit} customer={customer} rep={rep} index={sheet} locked={lockedAt(openAct)} onClose={close} />;
    else layer = <PlainSheet key={sheet} visit={visit} customer={customer} rep={rep} index={sheet} locked={lockedAt(openAct)} onClose={close} />;
  }

  return (
    <RepShell
      title={customer?.name ?? "Removed customer"}
      sub={`Checked in at ${visit.checkIn}`}
      back={repPath()}
      foot={
        <div className="flex gap-2">
          <button type="button" className={cn(GHOST, "h-11 px-4")} onClick={() => setSkipping(true)}>
            Skip
          </button>
          <button type="button" className={cn(BTN, "h-11 flex-1")} onClick={() => setCheckingOut(true)}>
            Check out
          </button>
        </div>
      }
      sheet={layer}
    >
      <CustomerHead c={customer} planned={visit.planned} />
      <LocationBlock rep={rep} customer={customer} visit={visit} />

      <ListBlock title="Steps" count={`${done} of ${visit.acts.length}`}>
        {visit.acts.length === 0 && unusedActs.length === 0 ? (
          <NoSteps />
        ) : (
          <ol className={ROWS}>
            {visit.acts.map((a, i) => {
              // A step that needs the rep at the shop stays shut until the geofence is ok; once done it can be read.
              const locked = lockedAt(a) && !a.done;
              const canOpen = !locked && (!sheetOf(a.activityId) || !!customer);
              return <StepRow key={`${a.activityId}-${i}`} a={a} n={i + 1} state={a.done ? "done" : locked ? "locked" : "todo"} sub={locked ? AT_SHOP_ONLY : a.result || stepMeta(a)} onOpen={canOpen ? () => setSheet(i) : undefined} />;
            })}
            {unusedActs.length > 0 && (
              <li>
                <button ref={addRef} type="button" onClick={() => setAdding(true)} className={cn(ROW_TAP, "text-[12.5px] text-bz-text-muted")}>
                  <span className="w-4 shrink-0" />
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <Plus size={14} />
                  </span>
                  Add a step
                </button>
              </li>
            )}
          </ol>
        )}
        <Popover open={adding} anchor={addRef.current} onClose={() => setAdding(false)} width={280}>
          {unusedActs.map((a) => (
            <MenuRow key={a.id} onClick={() => addStep(a.id)} hint={a.detail}>
              {a.name}
            </MenuRow>
          ))}
        </Popover>
      </ListBlock>

      <Trail visit={visit} rep={rep} />

      {checkingOut && <CheckOutDialog visit={visit} rep={rep} customer={customer} onClose={() => setCheckingOut(false)} />}
      <ReasonDialog open={skipping} eyebrow={visit.id} title="Skip this visit?" reasons={SKIP_REASONS} verb="Skip visit" onClose={() => setSkipping(false)} onDone={skip} />
    </RepShell>
  );
}

function CheckOutDialog({ visit, rep, customer, onClose }: { visit: Visit; rep: Rep; customer: Customer | undefined; onClose: () => void }) {
  const navigate = useNavigate();
  const missing = visit.acts.map((a, i) => ({ a, i })).filter(({ a }) => a.required && !a.done);
  const [reasons, setReasons] = React.useState<Record<number, string>>({});
  const [noOrder, setNoOrder] = React.useState<string | null>(null);
  const [other, setOther] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const needOrderReason = !visit.orderId;
  const orderReason = noOrder === "Other" ? other.trim() : noOrder;
  const ok = missing.every(({ i }) => (reasons[i] ?? "").trim()) && (!needOrderReason || !!orderReason);

  const finish = () => {
    if (!ok) return setTried(true);
    patchVisit(visit.id, (v) => ({
      ...v,
      state: "done",
      checkOut: SF_NOW,
      noOrderReason: needOrderReason ? orderReason : null,
      acts: v.acts.map((a, i) => (reasons[i]?.trim() && !a.done ? { ...a, result: `Not done: ${reasons[i].trim()}` } : a)),
    }));
    for (const { a, i } of missing) logEvent(visit.id, `did not do "${activityName(a.activityId)}": ${reasons[i].trim()}`, rep.name);
    logEvent(visit.id, `checked out${needOrderReason ? `, no order: ${orderReason}` : ""}`, rep.name);
    if (customer && needOrderReason) logEvent(customer.id, `visit ${visit.id} ended with no order: ${orderReason}`, rep.name);
    // Where the rep left from — taken in the background, so a phone that can't find itself never holds up check-out.
    void getPosition().then((r) => {
      if (r.ok) recordPing({ repId: rep.id, fix: r.fix, kind: "check-out", visitId: visit.id, customerId: visit.customerId });
    });
    repToast(`Visit to ${customer?.name ?? "the customer"} done`);
    onClose();
    navigate(repPath());
  };

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={visit.id}
      title={`Check out of ${customer?.name ?? "this visit"}?`}
      foot={
        <>
          <button type="button" className={cn(GHOST, "h-10")} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={cn(BTN, "h-10")} onClick={finish}>
            Check out
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {missing.length === 0 && !needOrderReason && <p className="m-0">Every required step is done.</p>}
        {missing.map(({ a, i }) => {
          const bad = tried && !(reasons[i] ?? "").trim();
          return (
            <Field key={i} label={`Why was "${activityName(a.activityId)}" not done?`} required>
              <input className={cn(INPUT, "h-10", bad && "border-bz-red-mark")} value={reasons[i] ?? ""} onChange={(e) => setReasons((r) => ({ ...r, [i]: e.target.value }))} placeholder="A few words" aria-invalid={bad} />
              {bad && <Err>A reason is required.</Err>}
            </Field>
          );
        })}
        {needOrderReason && (
          <Field label="Why no order?" required>
            <ChoiceList label="Why no order?" value={noOrder} onChange={setNoOrder} options={NO_ORDER_REASONS.map((r) => ({ value: r, label: r }))} invalid={tried && !noOrder} />
            {noOrder === "Other" && <input autoFocus className={cn(INPUT, "h-10", tried && !other.trim() && "border-bz-red-mark")} value={other} onChange={(e) => setOther(e.target.value)} placeholder="The reason" aria-label="The reason" />}
            {tried && !orderReason && <Err>A reason is required.</Err>}
          </Field>
        )}
      </div>
    </Dialog>
  );
}

/** Skipping always says why: a reason from the list, or the rep's own words. */
function ReasonDialog({ open, eyebrow, title, reasons, verb, onClose, onDone }: { open: boolean; eyebrow?: string; title: string; reasons: string[]; verb: string; onClose: () => void; onDone: (reason: string) => void }) {
  const [pick, setPick] = React.useState<string | null>(null);
  const [other, setOther] = React.useState("");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (open) (setPick(null), setOther(""), setTried(false));
  }, [open]);
  const reason = pick === "Other" ? other.trim() : pick;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow={eyebrow}
      title={title}
      size="sm"
      foot={
        <>
          <button type="button" className={cn(GHOST, "h-10")} onClick={onClose}>
            Keep it
          </button>
          <button type="button" className={cn(BTN, "h-10")} onClick={() => (reason ? onDone(reason) : setTried(true))}>
            {verb}
          </button>
        </>
      }
    >
      <Field label="Reason" required>
        <ChoiceList label="Reason" value={pick} onChange={setPick} options={reasons.map((r) => ({ value: r, label: r }))} invalid={tried && !pick} />
        {pick === "Other" && <input autoFocus className={cn(INPUT, "h-10", tried && !other.trim() && "border-bz-red-mark")} value={other} onChange={(e) => setOther(e.target.value)} placeholder="The reason" aria-label="The reason" />}
        {tried && !reason && <Err>A reason is required.</Err>}
      </Field>
    </Dialog>
  );
}

// ── After: the summary ──────────────────────────────────────────────────────

function AfterVisit({ rep, customer, visit, onAgain }: { rep: Rep; customer: Customer | undefined; visit: Visit; onAgain?: () => void }) {
  const st = OUTLET_STATUS[visit.state];
  const o = orderById(visit.orderId);
  const other = visit.repId !== rep.id;
  // A finished visit keeps the steps it was done with; a playbook changed since then only shows on a new visit.
  const nowSteps = actsFor(customer, SF_TODAY).acts.map((a) => a.activityId).join();
  const stepsChanged = !!customer && nowSteps !== visit.acts.map((a) => a.activityId).join();
  const again = onAgain && !other ? onAgain : undefined;
  const done = visit.acts.filter((a) => a.done).length;
  return (
    <RepShell
      title={customer?.name ?? "Removed customer"}
      sub={`${visit.date === SF_TODAY ? "Today" : shortDay(visit.date)}${visit.checkIn ? ` · ${visit.checkIn} – ${visit.checkOut ?? "…"}` : ""}`}
      back={repPath()}
      foot={
        again ? (
          <button type="button" className={cn(GHOST, "h-11 w-full")} onClick={again}>
            Visit again
          </button>
        ) : undefined
      }
    >
      <div className={cn("border-b border-bz-line-soft py-3", PAD)}>
        <div className="flex items-center gap-2">
          <span className={cn("whitespace-nowrap text-[11px] font-semibold text-bz-text-soft", NUM)}>{visit.id}</span>
          <Chip tone={chipTone(st.tone)}>{st.label}</Chip>
        </div>
        <Meta
          className="mt-1.5"
          items={[visit.geofence && fenceText(visit.geofence), other && "By another rep", visit.state === "skipped" && `Skipped: ${visit.skipReason}`, !o && visit.noOrderReason && `No order: ${visit.noOrderReason}`, stepsChanged && again && "The steps have changed since"]}
        />
      </div>
      {o && (
        <ListBlock title="Order">
          <div className={cn(ROW, "border-t border-bz-line-soft")}>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-[12.5px] text-bz-text", NUM)}>{o.id}</span>
              <span className="block break-words text-[10.5px] text-bz-text-soft">{billedToText(o).replace(/^b/, "B")}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <Amount value={orderTotal(o)} currency="NPR" className="text-[12.5px] font-semibold text-bz-text" />
              <Chip tone={ORDER_STATE[o.status].tone}>{ORDER_STATE[o.status].label}</Chip>
            </span>
          </div>
        </ListBlock>
      )}
      {visit.acts.length > 0 && (
        <ListBlock title="Steps" count={`${done} of ${visit.acts.length}`}>
          <ol className={ROWS}>
            {visit.acts.map((a, i) => (
              <StepRow key={`${a.activityId}-${i}`} a={a} n={i + 1} state={a.done ? "done" : a.required ? "missed" : "left"} sub={a.result || stepMeta(a)} />
            ))}
          </ol>
        </ListBlock>
      )}
      <Trail visit={visit} rep={rep} />
    </RepShell>
  );
}
