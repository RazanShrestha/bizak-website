import * as React from "react";
import { Link } from "react-router";
import { ArrowUpRight, Check, ChevronRight, X } from "lucide-react";
import { cn } from "../ui/utils";
import { GHOST_SM, ICON_BTN_SM, NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { typeOf } from "./engine";
import { PANEL, PANEL_TITLE, TickBar } from "./fx";
import { persistentStore } from "./persist";
import { QUICK_ADD_LABEL, openQuickAdd } from "./quickadd";
import type { QuickAddKind } from "./quickadd";
import { sfPath } from "./sf";
import { campaignsStore, claimsStore, customersStore, hubStore, ledgerStore, planStore, playbooksStore, productsStore, repsStore, routesStore, schemesStore, typesStore, visitsStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// GETTING STARTED — the module's one learning aid
//
// The prototype starts empty, so Overview carries a checklist that walks the
// business into being in the order the module depends on itself. Each step
// ticks itself off from the real data; the block goes when the last one does.
// ════════════════════════════════════════════════════════════════════════════

/** The reader put the checklist away; it stays away across reloads until they ask for it back. */
export const guideHiddenStore = persistentStore<boolean>("overview.guideHidden", false);

export type Step = { key: string; title: string; done: boolean; to: string; quick?: QuickAddKind; external?: boolean };

export function useSteps(): Step[] {
  const types = useStore(typesStore);
  const products = useStore(productsStore);
  const reps = useStore(repsStore);
  const customers = useStore(customersStore);
  const routes = useStore(routesStore);
  const playbooks = useStore(playbooksStore);
  const schemes = useStore(schemesStore);
  const plan = useStore(planStore);
  const visits = useStore(visitsStore);
  const hub = useStore(hubStore);
  const ledger = useStore(ledgerStore);
  const claims = useStore(claimsStore);
  const campaigns = useStore(campaignsStore);
  const portalReady = customers.some((c) => typeOf(c).portal === "dealer" && c.portalUsers.length > 0);
  return [
    { key: "type", title: "Create a customer type", done: types.length > 0, to: sfPath("setup/types"), quick: "type" },
    { key: "product", title: "Add your products", done: products.length > 0, to: sfPath("products"), quick: "product" },
    { key: "rep", title: "Add your reps", done: reps.length > 0, to: sfPath("team"), quick: "rep" },
    { key: "customer", title: "Add customers", done: customers.length > 0, to: sfPath("customers"), quick: "customer" },
    { key: "route", title: "Build a route", done: routes.length > 0, to: sfPath("routes/new") },
    { key: "playbook", title: "Build a visit playbook", done: playbooks.length > 0, to: sfPath("setup/playbooks") },
    { key: "scheme", title: "Create an offer", done: schemes.some((s) => s.status === "live"), to: sfPath("schemes/new") },
    { key: "plan", title: "Plan a rep's week", done: plan.length > 0, to: sfPath("plan") },
    { key: "visit", title: "Visit a customer in the rep app", done: visits.some((v) => v.state === "done"), to: "/design/rep", external: true },
    { key: "portal", title: "Give a dealer the portal", done: portalReady, to: sfPath("customers") },
    { key: "portal-order", title: "Order on the dealer portal", done: hub.some((o) => o.source === "portal"), to: "/design/dealer", external: true },
    { key: "approve", title: "Approve an order", done: hub.some((o) => o.status === "approved"), to: sfPath("orders") },
    { key: "pay", title: "Pay on the portal, confirm it here", done: ledger.some((r) => r.kind === "Receipt" && !r.pending), to: sfPath("payments") },
    { key: "claim", title: "Raise a claim and settle it", done: claims.some((c) => c.status === "settled"), to: sfPath("claims") },
    { key: "campaign", title: "Run a campaign", done: campaigns.length > 0, to: sfPath("campaigns") },
  ];
}

/** The steps still to do, each with its page behind the row and — where a master can be made in place — its quick add. */
export function GettingStarted({ steps, onHide }: { steps: Step[]; onHide: () => void }) {
  const done = steps.filter((s) => s.done).length;
  const [all, setAll] = React.useState(false);
  const left = steps.filter((s) => !s.done);
  return (
    <section className={cn(PANEL, "overflow-hidden")} aria-label="Getting started">
      <div className="flex min-h-[46px] items-center gap-3 pl-4 pr-2.5">
        <h2 className={PANEL_TITLE}>Getting started</h2>
        <TickBar pct={(done / steps.length) * 100} ink="accent" ticks={steps.length} className="w-24" />
        <span className={cn("text-[11px] text-bz-text-soft", NUM)}>
          {done} of {steps.length}
        </span>
        <button type="button" onClick={onHide} className={cn(ICON_BTN_SM, "ml-auto")} title="Hide" aria-label="Hide getting started">
          <X size={13} />
        </button>
      </div>
      <ol className="m-0 list-none p-0">
        {(all ? left : left.slice(0, 3)).map((s) => (
          <li key={s.key} className="flex items-center border-t border-bz-line-soft hover:bg-bz-paper-warm">
            <Link to={s.to} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-bz-pill border border-bz-line text-bz-line" aria-hidden>
                <Check size={10} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text">{s.title}</span>
              {!s.quick && (s.external ? <ArrowUpRight size={13} className="shrink-0 text-bz-text-soft" /> : <ChevronRight size={13} className="shrink-0 text-bz-text-soft" />)}
            </Link>
            {s.quick && (
              <button type="button" onClick={() => openQuickAdd(s.quick!)} className={cn(GHOST_SM, "mr-3 h-7 shrink-0 px-2")}>
                New {QUICK_ADD_LABEL[s.quick].toLowerCase()}
              </button>
            )}
          </li>
        ))}
      </ol>
      {left.length > 3 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="w-full border-t border-bz-line-soft px-4 py-2.5 text-left text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
          {all ? "Show fewer" : `${left.length - 3} more steps`}
        </button>
      )}
    </section>
  );
}
