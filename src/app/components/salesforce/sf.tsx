import * as React from "react";
import { Link } from "react-router";
import { ChevronDown, Eye, EyeOff, Send, Settings2 } from "lucide-react";
import { cn } from "../ui/utils";
import { AppFrame } from "../sales/AppFrame";
import { estimatesStore } from "../sales/flow";
import { BTN, CARD, NUM, PLAIN_BTN, Popover, Segmented } from "../sales/bzw";
import type { Tone } from "../sales/bzw";
import { useStore } from "../sales/store";
import { FX_VARS } from "./fx";
import type { ModuleKey, Product } from "./data";
import { dayTime } from "./engine";
import { estimatesToAnswer } from "./estimates";
import { QuickAddHost } from "./QuickAddDialogs";
import { receiptTodo } from "./receipts";
import { STAFF_NAME, addNote } from "./records";
import { brandingStore, claimsStore, customersStore, historyStore, hubStore, ledgerStore, modulesStore, notesStore, opportunitiesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE · the module's frame
//
// One rail entry. Six areas across the top bar — Overview, Field, Trade,
// Customers, Growth, Team — and, on the page, a large title with that area's
// places as pills beside it. The page under it is free to be whatever its job
// needs: a board of figures, a map with panels floating on it, a queue, a
// roomy table. The visual kit is `fx.tsx`.
// ════════════════════════════════════════════════════════════════════════════

export const sfPath = (p: string) => `/design/salesforce${p ? `/${p}` : ""}`;

type Place = { key: string; label: string; path: string; module?: ModuleKey };

export const SF_SECTIONS: { key: string; label: string; places: Place[] }[] = [
  { key: "overview", label: "Overview", places: [{ key: "today", label: "Overview", path: "" }] },
  {
    key: "field",
    label: "Field",
    places: [
      { key: "live", label: "Live", path: "today", module: "field" },
      { key: "plan", label: "Plan", path: "plan", module: "field" },
      { key: "visits", label: "Visits", path: "visits", module: "field" },
    ],
  },
  {
    key: "trade",
    label: "Trade",
    places: [
      { key: "inbox", label: "To decide", path: "inbox" },
      { key: "orders", label: "Orders", path: "orders", module: "orders" },
      { key: "opportunities", label: "Opportunities", path: "opportunities" },
      { key: "payments", label: "Receipts", path: "payments" },
      { key: "claims", label: "Claims", path: "claims", module: "claims" },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    places: [
      { key: "customers", label: "Customers", path: "customers" },
      { key: "routes", label: "Routes", path: "routes", module: "field" },
      { key: "products", label: "Products", path: "products" },
    ],
  },
  {
    key: "growth",
    label: "Growth",
    places: [
      { key: "schemes", label: "Schemes", path: "schemes", module: "schemes" },
      { key: "campaigns", label: "Campaigns", path: "campaigns", module: "campaigns" },
      { key: "branding", label: "Branding", path: "branding", module: "branding" },
      { key: "events", label: "Events", path: "events", module: "events" },
    ],
  },
  {
    key: "team",
    label: "Team",
    places: [
      { key: "reps", label: "Reps", path: "team" },
      { key: "targets", label: "Targets", path: "targets", module: "targets" },
      { key: "insights", label: "Insights", path: "insights" },
    ],
  },
];

/** Setup is an area too — reached from the gear at the end of the top-bar row, not from a word. */
export const SF_SETUP: Place[] = [
  { key: "setup:types", label: "Customer types", path: "setup/types" },
  { key: "setup:playbooks", label: "Playbooks", path: "setup/playbooks" },
  { key: "setup:modules", label: "Modules", path: "setup/modules" },
  { key: "setup:portal", label: "Dealer portal", path: "setup/portal" },
  { key: "setup:data", label: "Prototype data", path: "setup/data" },
];

/** What waits at each place. A number here is work, never decoration. */
export function useWaiting(): Record<string, { n: number; danger?: boolean; title: string }> {
  const hub = useStore(hubStore);
  const opportunities = useStore(opportunitiesStore);
  // The estimate is the sales desk's (owner decision #32); the ones of our customers that wait for an answer are work here.
  const estimates = useStore(estimatesStore);
  useStore(customersStore);
  const ledger = useStore(ledgerStore);
  const claims = useStore(claimsStore);
  const branding = useStore(brandingStore);
  const orders = hub.filter((o) => o.status === "review").length;
  const ready = hub.filter((o) => o.status === "ready").length;
  const opps = opportunities.filter((o) => o.stage === "new").length;
  const ests = estimatesToAnswer(estimates).length;
  // A pending early-payment credit note is decided with its receipt, so it is not a decision of its own.
  const pays = ledger.filter((r) => r.pending && r.kind === "Receipt").length;
  // A confirmed receipt is applied by hand: one to apply, or with an order to change, is work too (decision #33).
  const toApply = ledger.filter((r) => !r.pending && r.kind === "Receipt" && receiptTodo(r.customerId, r.doc) !== null).length;
  const cls = claims.filter((c) => c.status === "submitted").length;
  const settle = claims.filter((c) => c.status === "approved").length;
  const brs = branding.filter((b) => b.stage === "requested").length;
  return {
    inbox: { n: orders + ready + opps + ests + pays + toApply + cls + settle + brs, danger: orders > 0, title: "Waiting for a decision" },
    orders: { n: orders, danger: true, title: "Need review" },
    // An estimate the customer asked to change waits under its opportunity: there is no Estimates place of our own.
    opportunities: { n: opps + ests, title: ests ? "New requests and estimate changes asked" : "New requests" },
    payments: { n: pays + toApply, title: toApply ? "To confirm, apply or change" : "To confirm" },
    claims: { n: cls, title: "To decide" },
    branding: { n: brs, title: "Requested" },
  };
}

function useOn() {
  const mods = useStore(modulesStore);
  return (m?: ModuleKey) => !m || mods.find((x) => x.key === m)?.on !== false;
}

type Waiting = ReturnType<typeof useWaiting>;

/** An area's places as a menu: the one you are on is marked, and a place with work waiting says how much. */
function PlaceMenu({ open, anchor, onClose, places, current, waiting }: { open: boolean; anchor: HTMLElement | null; onClose: () => void; places: Place[]; current: string; waiting: Waiting }) {
  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={216} className="p-1.5">
      {places.map((p) => {
        const on = p.key === current;
        const w = waiting[p.key];
        return (
          <Link
            key={p.key}
            to={sfPath(p.path)}
            onClick={onClose}
            aria-current={on ? "page" : undefined}
            className={cn("flex h-9 items-center gap-2.5 rounded-bz-md px-2.5 text-[13px] transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire", on ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text")}
          >
            <span className={cn("size-1.5 shrink-0 rounded-bz-pill", on ? "bg-bz-pos-deep" : "bg-transparent")} />
            <span className="min-w-0 flex-1 truncate">{p.label}</span>
            {w && w.n > 0 && (
              <span title={w.title} className={cn("min-w-[18px] shrink-0 rounded-bz-pill px-1 text-center text-[10.5px] font-semibold leading-[18px]", NUM, w.danger ? "bg-bz-red-soft text-bz-red" : "bg-bz-paper-warm text-bz-text-muted")}>
                {w.n}
              </span>
            )}
          </Link>
        );
      })}
    </Popover>
  );
}

const AREA_TAB = "relative inline-flex h-8 shrink-0 items-center gap-1 rounded-bz-md px-2.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-bz-fire";

/** One area in the top bar. An area with several places opens them as a menu; an area that is one place is a link. */
function AreaTab({ label, places, active, current, waiting, dot }: { label: string; places: Place[]; active: boolean; current: string; waiting: Waiting; dot?: "danger" | "quiet" }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const cls = cn(AREA_TAB, active ? "font-semibold text-bz-text" : "font-medium text-bz-text-soft hover:text-bz-text", open && "bg-bz-paper-warm text-bz-text");
  if (places.length === 1)
    return (
      <Link to={sfPath(places[0].path)} aria-current={active ? "page" : undefined} className={cls}>
        {label}
      </Link>
    );
  return (
    <>
      <button ref={ref} type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={cls}>
        {label}
        {dot && <span className={cn("size-1.5 rounded-bz-pill", dot === "danger" ? "bg-bz-red-mark" : "bg-bz-text-soft")} />}
        <ChevronDown size={12} className={cn("-mr-0.5 text-bz-text-soft transition-transform", open && "rotate-180")} />
      </button>
      <PlaceMenu open={open} anchor={ref.current} onClose={() => setOpen(false)} places={places} current={current} waiting={waiting} />
    </>
  );
}

function SetupTab({ active, current, waiting }: { active: boolean; current: string; waiting: Waiting }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button ref={ref} type="button" title="Setup" aria-label="Setup" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={cn("ml-1 flex size-8 shrink-0 items-center justify-center rounded-bz-md transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire", active || open ? "text-bz-text" : "text-bz-text-soft", open && "bg-bz-paper-warm")}>
        <Settings2 size={15} />
      </button>
      <PlaceMenu open={open} anchor={ref.current} onClose={() => setOpen(false)} places={SF_SETUP} current={current} waiting={waiting} />
    </>
  );
}

/**
 * The module's areas. An area whose every place is switched off leaves the row. They sit in the top bar beside the
 * title; a phone or a tablet has no room for both, so there (`row`) they are a row of their own under the bar.
 */
function SectionTabs({ section, current, row }: { section: string | null; current: string; row?: boolean }) {
  const on = useOn();
  const waiting = useWaiting();
  return (
    <nav
      aria-label="Sales force"
      className={cn(
        "min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        row ? "flex h-11 shrink-0 border-b border-bz-line bg-bz-paper px-2.5 lg:hidden" : "ml-3 hidden h-full border-l border-bz-line-soft pl-3 lg:flex",
      )}
    >
      {SF_SECTIONS.map((s) => {
        const places = s.places.filter((p) => on(p.module));
        if (!places.length) return null;
        return <AreaTab key={s.key} label={s.label} places={places} active={s.key === section} current={current} waiting={waiting} dot={s.key === "trade" && waiting.inbox.n > 0 ? (waiting.inbox.danger ? "danger" : "quiet") : undefined} />;
      })}
      <SetupTab active={section === "setup"} current={current} waiting={waiting} />
    </nav>
  );
}

/** The page's title. Where the area has other places, the title is also the way to them. */
function PageTitle({ title, places, current, waiting }: { title: React.ReactNode; places: Place[]; current: string; waiting: Waiting }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const H = "m-0 text-[24px] font-semibold leading-none tracking-tight text-bz-text";
  if (places.length < 2) return <h2 className={H}>{title}</h2>;
  return (
    <>
      <h2 className={H}>
        <button ref={ref} type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="-mx-1.5 inline-flex items-center gap-1.5 rounded-bz-md px-1.5 py-1 transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire">
          {title}
          <ChevronDown size={16} className={cn("mt-0.5 text-bz-text-soft transition-transform", open && "rotate-180")} />
        </button>
      </h2>
      <PlaceMenu open={open} anchor={ref.current} onClose={() => setOpen(false)} places={places} current={current} waiting={waiting} />
    </>
  );
}

/**
 * The frame of every Sales force place: the areas in the top bar (each opens its places), then the page's own head —
 * one large title and the page's actions — and the place itself below, filling what is left. There is no second
 * navigation band: the page starts at its title.
 * `title` defaults to the place's name; `head={false}` hands the whole page to the place.
 */
export function SfShell({ current, title, meta, actions, head = true, children }: { current: string; title?: React.ReactNode; /** A quiet line beside the title — a count, a total. */ meta?: React.ReactNode; actions?: React.ReactNode; head?: boolean; children: React.ReactNode }) {
  const on = useOn();
  const waiting = useWaiting();
  const setup = current.startsWith("setup");
  const section = SF_SECTIONS.find((s) => s.places.some((p) => p.key === current)) ?? null;
  const places = setup ? SF_SETUP : (section?.places ?? []).filter((p) => on(p.module));
  const place = places.find((p) => p.key === current);
  return (
    <AppFrame title="Sales force" rail="Sales force" titleAside={<SectionTabs section={section?.key ?? (setup ? "setup" : null)} current={current} />}>
      {/* The ground is paper in light mode — the same as the dealer portal — and the frame's own dark ground in dark. */}
      <div className={cn("flex h-full min-h-0 flex-col bg-bz-paper [.bzw-dark_&]:bg-bz-section-b", FX_VARS)}>
        <SectionTabs row section={section?.key ?? (setup ? "setup" : null)} current={current} />
        {head && (
          <header className="flex min-h-[68px] shrink-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 pb-3 pt-4 md:px-6">
            <PageTitle title={title ?? place?.label ?? "Sales force"} places={title ? [] : places} current={current} waiting={waiting} />
            {meta && <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-bz-text-muted", NUM)}>{meta}</div>}
            {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
          </header>
        )}
        <div className="relative min-h-0 min-w-0 flex-1">{children}</div>
      </div>
      <QuickAddHost />
    </AppFrame>
  );
}

/** For a page built on the shared desk (`DocDesk frame={sfDeskFrame("orders")}`): the desk sits inside the module's frame. */
export const sfDeskFrame = (current: string) => (body: React.ReactNode) => <SfShell current={current}>{body}</SfShell>;

/** The earlier tab keys → place keys. */
const SF_KEY: Record<string, string> = { overview: "today", today: "live" };

/** A page that is not a desk. `module` is unused now that the module has one frame. */
export function SfFrame({ current, children }: { module?: string; current: string; children: React.ReactNode }) {
  return <SfShell current={SF_KEY[current] ?? current}>{children}</SfShell>;
}

// ── People, by name ─────────────────────────────────────────────────────────

const TONES = ["bg-bz-olive text-bz-text-on-dark", "bg-bz-leaf text-bz-text", "bg-bz-fire text-bz-olive", "bg-bz-paper-warm text-bz-text", "bg-bz-olive-soft text-bz-text-on-dark"];
const hash = (s: string) => [...s].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";

/** The bzw Avatar for someone known only by name — a rep, a portal user (sales `Avatar` wants a staff Person). */
export function Who({ name, size = 20 }: { name: string | null | undefined; size?: number }) {
  if (!name)
    return (
      <span title="Unassigned" className="inline-flex shrink-0 items-center justify-center rounded-bz-pill border border-dashed border-bz-line text-bz-text-soft" style={{ width: size, height: size, fontSize: size * 0.42 }}>
        ?
      </span>
    );
  return (
    <span title={name} className={cn("inline-flex shrink-0 items-center justify-center rounded-bz-pill font-semibold leading-none", TONES[hash(name) % TONES.length])} style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}>
      {initialsOf(name)}
    </span>
  );
}

// ── Activity and notes (History + Notes on every record) ────────────────────

/**
 * The record's activity, in `ActivityList`'s anatomy, read from the shared history and notes stores. `ids` are the
 * record's own id first, then any related ids whose trail belongs here too (a visit and the order it took).
 * A portal reader sees notes that were shared with it, and no history.
 */
export function SfActivity({ ids, audience = "company" }: { ids: string[]; audience?: "company" | "portal" }) {
  const history = useStore(historyStore);
  const notes = useStore(notesStore);
  const portal = audience === "portal";
  const [show, setShow] = React.useState<"all" | "notes" | "history">("all");
  const noteRows = ids.flatMap((id) => (notes[id] ?? []).filter((n) => !portal || n.shared));
  const items = [
    ...noteRows.map((n) => ({ kind: "n" as const, key: n.id, when: n.when, who: n.who, body: n.body, shared: n.shared })),
    ...(portal ? [] : ids.flatMap((id) => (history[id] ?? []).map((h) => ({ kind: "h" as const, key: h.id, when: h.when, who: h.who, body: h.what, shared: false })))),
  ]
    .filter((x) => show === "all" || (show === "notes" ? x.kind === "n" : x.kind === "h"))
    .sort((a, b) => a.when.localeCompare(b.when));
  return (
    <section className="px-5 py-4">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">{portal ? "Messages" : "Activity"}</h3>
        {!portal && (
          <div className="ml-auto">
            <Segmented
              size="sm"
              value={show}
              onChange={(v) => setShow(v as typeof show)}
              options={[
                { value: "all", label: "All" },
                { value: "notes", label: "Notes", count: noteRows.length },
                { value: "history", label: "History" },
              ]}
            />
          </div>
        )}
      </div>
      {items.length === 0 && <p className="m-0 text-[11.5px] text-bz-text-soft">{portal ? "No messages yet." : show === "notes" ? "No notes yet." : "Nothing yet."}</p>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((x) =>
          x.kind === "n" ? (
            <li key={x.key} className="flex gap-2.5">
              <Who name={x.who} size={22} />
              <div className="min-w-0 flex-1">
                <p className="m-0 flex flex-wrap items-center gap-x-2 text-[11.5px]">
                  <span className="font-semibold text-bz-text">{x.who}</span>
                  {!portal && x.shared && (
                    <span className="inline-flex items-center gap-0.5 text-[10.5px] text-bz-text-muted" title="The customer sees this note on the portal">
                      <Eye size={11} /> Shared
                    </span>
                  )}
                  <span className={cn("text-bz-text-soft", NUM)}>{dayTime(x.when)}</span>
                </p>
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed text-bz-text">{x.body}</p>
              </div>
            </li>
          ) : (
            <li key={x.key} className="flex items-center gap-2.5 pl-[7px] text-[11.5px] text-bz-text-muted">
              <span className="size-2 shrink-0 rounded-bz-pill border border-bz-line bg-bz-surface" />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-bz-text">{x.who}</span> {x.body}
              </span>
              <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{dayTime(x.when)}</span>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}

/**
 * The panel's foot: one line to add a note. On the company side the eye decides whether the customer sees it on
 * the portal (owner decision #19); a portal note is always shared.
 */
export function SfNoteFoot({ id, audience = "company", author, tall }: { id: string; audience?: "company" | "portal"; author?: string; /** Phone surfaces: 40px controls. */ tall?: boolean }) {
  const portal = audience === "portal";
  // The portal is a phone surface: its controls are 40px.
  const big = tall || portal;
  const [body, setBody] = React.useState("");
  const [share, setShare] = React.useState(false);
  const who = author ?? STAFF_NAME;
  const send = () => {
    if (!body.trim()) return;
    addNote(id, body, { who, shared: portal || share });
    setBody("");
    setShare(false);
  };
  return (
    <div className="shrink-0 border-t border-bz-line-soft bg-bz-paper px-5 py-2.5">
      <div className="flex items-center gap-2">
        <Who name={who} size={24} />
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={portal ? "Write a message…" : "Add a note…"}
          className={cn(big ? "h-10" : "h-8", "min-w-0 flex-1 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft hover:border-bz-text-soft focus:border-bz-text-muted")}
        />
        {!portal && (
          <button type="button" onClick={() => setShare((v) => !v)} aria-pressed={share} className={cn(PLAIN_BTN, "mx-1", share && "text-bz-text")} title={share ? "The customer will see this note" : "Only your team sees this note"}>
            {share ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
        <button type="button" onClick={send} disabled={!body.trim()} className={cn(BTN, big ? "h-10" : "h-8", "px-3")}>
          <Send size={12} /> Send
        </button>
      </div>
    </div>
  );
}

// ── Lines (the record panel's lines table, in LinesTable's anatomy) ─────────

export type SfLine = {
  key: string;
  name: string;
  /** Code, the scheme that touched it, a note — one quiet line. */
  sub?: React.ReactNode;
  qty: React.ReactNode;
  rate: React.ReactNode;
  disc?: React.ReactNode;
  net: React.ReactNode;
};

/**
 * Item · Qty · Rate · Disc · Net, with the same tracks and type as `sales/record.tsx` LinesTable — that one reads the
 * sales item master, so a Sales force record draws the shape with its own rows. It never widens past the panel.
 */
export function SfLines({ rows, qtyLabel = "Qty" }: { rows: SfLine[]; qtyLabel?: string }) {
  const cols = "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_76px_96px_64px_112px]";
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
      <div className={cn("hidden items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft sm:grid", cols)}>
        <span>Item</span>
        <span className="text-right">{qtyLabel}</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Disc</span>
        <span className="text-right">Net</span>
      </div>
      {rows.map((r) => (
        <div key={r.key} className={cn("grid items-start gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0", cols)}>
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] text-bz-text">{r.name}</span>
            {r.sub && <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>{r.sub}</span>}
          </span>
          <span className={cn("hidden text-right text-[12px] text-bz-text sm:block", NUM)}>{r.qty}</span>
          <span className={cn("hidden text-right text-[12px] text-bz-text-muted sm:block", NUM)}>{r.rate}</span>
          <span className={cn("hidden text-right text-[12px] text-bz-text-muted sm:block", NUM)}>{r.disc ?? "—"}</span>
          <span className="text-right text-[12.5px] font-semibold text-bz-text">{r.net}</span>
        </div>
      ))}
    </div>
  );
}

// ── Identity marks ──────────────────────────────────────────────────────────

/** Identity colour of a customer type or a brand — the categorical tokens, never a status. */
export const idColor = (n: number) => `var(--bz-route-${((n - 1) % 8) + 1})`;

/** A customer type, as its colour square and name. */
export function TypeMark({ name, color, className }: { name: string; color: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px] text-bz-text-muted", className)}>
      <span className="size-2 shrink-0 rounded-[3px]" style={{ background: idColor(color) }} />
      {name}
    </span>
  );
}

/** A product's picture stand-in: brand colour and initials. */
export function ProductThumb({ product, size = 32 }: { product: Product; size?: number }) {
  const initials = product.brand
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span className="flex shrink-0 items-center justify-center rounded-bz-md font-bold tracking-wide text-bz-text-on-dark" style={{ width: size, height: size, background: idColor(product.tone), fontSize: Math.round(size * 0.3) }} aria-hidden>
      {initials}
    </span>
  );
}

/** The older label maps (`STATUS`, `CAMPAIGN_TONE`, `STAGE_TONE` …) name tones the old way; a `Chip` takes these. */
export const chipTone = (t: "good" | "warn" | "danger" | "info" | "neutral" | "off" | null | undefined): Tone =>
  t === "good" ? "positive" : t === "warn" ? "pending" : t === "danger" ? "danger" : t === "info" ? "partial" : "neutral";

// ── The page kit — bzw's numbers, so a place of any shape still reads as Bizak ──

/**
 * A place's page: an optional figures band and an optional toolbar, both on paper, then the body on the canvas.
 * `flush` hands the whole body to the place (a split view, a map, a board); otherwise it scrolls with the page gutter.
 */
export function SfPage({ band, bar, flush, children, className }: { band?: React.ReactNode; bar?: React.ReactNode; flush?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {band && <div className="shrink-0 border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">{band}</div>}
      {bar && <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-bz-line bg-bz-paper px-4 py-2 md:px-6">{bar}</div>}
      <div className={cn("min-h-0 flex-1", flush ? "relative" : "overflow-y-auto p-4 [scrollbar-width:thin] md:p-6", className)}>{children}</div>
    </div>
  );
}

/** A card on the canvas: a 12px title row (with a count and a right slot) over its rows. */
export function SfCard({ title, count, right, children, className }: { title?: React.ReactNode; count?: number; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(CARD, "overflow-hidden", className)}>
      {title && (
        <header className="flex min-h-10 items-center gap-2 border-b border-bz-line-soft px-3.5 py-2">
          <h2 className="m-0 text-[12px] font-semibold text-bz-text">{title}</h2>
          {count != null && count > 0 && <span className={cn("rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text-muted", NUM)}>{count}</span>}
          {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** A row in a card: title 12.5, second line 10.5, hairline under it. Add `SF_ROW_ON` for the selected one. */
export const SF_ROW = "relative flex w-full min-w-0 items-center gap-3 border-b border-bz-line-soft px-3 py-2.5 text-left transition-colors last:border-0";
export const SF_ROW_HOVER = "hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire";
export const SF_ROW_ON = "bg-bz-fire/10 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-bz-fire before:content-['']";
/** A quiet text link. */
export const SF_LINK = "inline-flex items-center gap-1 whitespace-nowrap text-[11.5px] font-medium text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline";
