import * as React from "react";
import { useSearchParams } from "react-router";
import { ClipboardList, Gift, PackageX, Store, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { Dialog, Field, INPUT, NUM, Select, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import type { Claim, ClaimKind } from "../salesforce/data";
import { day, npr } from "../salesforce/engine";
import { nextId } from "../salesforce/persist";
import { RecordFoot, logEvent } from "../salesforce/records";
import { claimsStore, schemesStore } from "../salesforce/store";
import { Dot, EmptyNote, Fact, Money } from "../salesforce/ui";
import { DealerShell, pagesFor } from "./shell";
import { Drawer, LIME, PageHead, PhotoSlot, Pills, SOFT, Unavailable } from "./kit";
import { cap, notify, useDealer, useDealerOrders } from "./portal";
import type { Tone } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// CLAIMS — money the dealer is owed back
//
// A claim sent here lands in the company's Claims list as "submitted"; the
// company approves it and settles it with a credit note on this dealer's
// account. Slow, silent claims are what makes dealers give up on a portal, so
// every claim says in words where it is.
// ════════════════════════════════════════════════════════════════════════════

type DealerKind = Exclude<ClaimKind, "Expense">;
const KINDS: { value: DealerKind; label: string; icon: LucideIcon; ask: string }[] = [
  { value: "Scheme", label: "Offer I passed on", icon: Gift, ask: "Which retailers got the offer, and how much in total?" },
  { value: "Display", label: "Display", icon: Store, ask: "Where is the display, and for which month?" },
  { value: "Damage", label: "Damaged or expired", icon: PackageX, ask: "What was damaged, how many, and on which delivery?" },
  { value: "Price difference", label: "Price difference", icon: Tags, ask: "Which items, the old and the new price, and how much stock you held." },
];
const kindIcon = (k: ClaimKind) => KINDS.find((x) => x.value === k)?.icon ?? ClipboardList;

const STATE: Record<Claim["status"], { label: string; tone: Tone; line: (company: string) => string }> = {
  submitted: { label: "Sent", tone: "warn", line: (co) => `${cap(co)} is checking it.` },
  approved: { label: "Approved", tone: "info", line: () => "Approved. A credit note will follow on your account." },
  settled: { label: "Settled", tone: "good", line: () => "Settled with a credit note on your account." },
  rejected: { label: "Not accepted", tone: "danger", line: () => "Not accepted. Your sales rep can tell you why, or send it again with more proof." },
};

type Filter = "open" | "closed" | "all";
const isOpenClaim = (c: Claim) => c.status === "submitted" || c.status === "approved";

export function DealerClaimsPage() {
  return (
    <DealerShell page="claims">
      <Claims />
    </DealerShell>
  );
}

function Claims() {
  const s = useDealer();
  const claims = useStore(claimsStore);
  const schemes = useStore(schemesStore);
  const [params, setParams] = useSearchParams();
  const [f, setF] = React.useState<Filter>("all");
  const [form, setForm] = React.useState(() => !!params.get("order"));
  if (!pagesFor(s).has("claims")) return <Unavailable what="Claims" />;

  const mine = claims.filter((c) => c.partyKind === "customer" && c.party === s.c.id).sort((a, b) => b.raisedOn.localeCompare(a.raisedOn) || b.id.localeCompare(a.id));
  // The open claim lives in the URL (?id=CL-…) so it can be shared and survives a reload.
  const openId = params.get("id");
  const setOpenId = (id: string | null) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (id) n.set("id", id);
        else n.delete("id");
        return n;
      },
      { replace: !id },
    );
  const shown = mine.filter((c) => (f === "open" ? isOpenClaim(c) : f === "closed" ? !isOpenClaim(c) : true));
  const openClaim = mine.find((c) => c.id === openId) ?? null;
  const owedBack = mine.filter(isOpenClaim).reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <PageHead
        title="Claims"
        sub={`Money ${s.company} owes you back — for offers you passed on, displays, damaged goods and price changes.`}
        actions={
          <button type="button" onClick={() => setForm(true)} className={LIME}>
            New claim
          </button>
        }
      />
      {owedBack > 0 && (
        <p className={cn("m-0 mb-6 text-[12.5px] text-bz-text-muted", NUM)}>
          <span className="font-semibold text-bz-text">NPR {npr(owedBack)}</span> in claims is being checked or waiting for a credit note.
        </p>
      )}
      {mine.length > 0 && (
        <Pills<Filter>
          value={f}
          onChange={setF}
          options={[
            { value: "all", label: "All", count: mine.length },
            { value: "open", label: "In progress", count: mine.filter(isOpenClaim).length },
            { value: "closed", label: "Closed", count: mine.filter((c) => !isOpenClaim(c)).length },
          ]}
        />
      )}
      <div className="mt-6">
        {shown.length === 0 ? (
          <EmptyNote
            action={
              <button type="button" onClick={() => setForm(true)} className={SOFT}>
                New claim
              </button>
            }
          >
            {mine.length === 0 ? `Claims you send to ${s.company} show here with where each one is.` : "Nothing in this list."}
          </EmptyNote>
        ) : (
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {shown.map((c) => {
              const Icon = kindIcon(c.kind);
              const st = STATE[c.status];
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setOpenId(c.id)} className="grid min-h-[64px] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 px-1 py-3 text-left hover:bg-bz-paper-warm/60 md:grid-cols-[auto_minmax(0,1fr)_150px_110px]">
                    <span className="row-span-2 flex size-9 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted md:row-span-1">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium text-bz-text">
                        {c.kind} claim · {c.id}
                      </span>
                      <span className="block truncate text-[11px] text-bz-text-soft">
                        {day(c.raisedOn)} · {c.basis}
                      </span>
                    </span>
                    <span className="col-start-2 row-start-2 md:col-start-3 md:row-start-1">
                      <Dot tone={st.tone}>{st.label}</Dot>
                    </span>
                    <Money value={c.amount} code={false} className="col-start-3 row-span-2 row-start-1 text-right text-[12.5px] font-medium text-bz-text md:col-start-4 md:row-span-1" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Drawer open={!!openClaim} onClose={() => setOpenId(null)} eyebrow={openClaim ? `${openClaim.kind} claim` : undefined} title={openClaim?.id ?? ""}>
        {openClaim && (
          <>
            <p className="m-0 mb-5 flex flex-wrap items-center gap-2 text-[12px] text-bz-text-muted">
              <Dot tone={STATE[openClaim.status].tone}>{STATE[openClaim.status].label}</Dot>
              {STATE[openClaim.status].line(s.company)}
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Fact label="Amount">
                <Money value={openClaim.amount} />
              </Fact>
              <Fact label="Sent on">{day(openClaim.raisedOn)}</Fact>
              {openClaim.schemeId && <Fact label="Offer">{schemes.find((x) => x.id === openClaim.schemeId)?.name ?? openClaim.schemeId}</Fact>}
              {openClaim.settledBy && <Fact label="Credit note">{openClaim.settledBy}</Fact>}
            </div>
            <p className="m-0 mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">What happened</p>
            <p className="m-0 mt-1 whitespace-pre-wrap text-[12.5px] leading-relaxed text-bz-text">{openClaim.basis}</p>
            <RecordFoot recordId={openClaim.id} audience="portal" author={s.userName} className="mt-8" />
          </>
        )}
      </Drawer>

      <NewClaimDialog
        open={form}
        orderId={params.get("order")}
        onClose={() => {
          setForm(false);
          if (!params.get("order")) return;
          const n = new URLSearchParams(params);
          n.delete("order");
          setParams(n, { replace: true });
        }}
        onSent={(id) => {
          setForm(false);
          setParams({ id });
        }}
      />
    </>
  );
}

function NewClaimDialog({ open, orderId, onClose, onSent }: { open: boolean; orderId: string | null; onClose: () => void; onSent: (id: string) => void }) {
  const s = useDealer();
  const schemes = useStore(schemesStore);
  const orders = useDealerOrders(s.c.id, s.company);
  const [kind, setKind] = React.useState<DealerKind>("Scheme");
  const [schemeId, setSchemeId] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState(0);
  const [basis, setBasis] = React.useState("");
  const [photos, setPhotos] = React.useState(0);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setKind(orderId ? "Damage" : "Scheme");
    setOrder(orderId);
    setSchemeId(null);
    setAmount(0);
    setBasis("");
    setPhotos(0);
    setTried(false);
  }, [open, orderId]);

  const myType = s.c.typeId;
  const offers = schemes.filter((x) => x.status !== "draft" && (x.typeIds.length === 0 || x.typeIds.includes(myType)) && (kind !== "Display" || x.mechanic.kind === "display"));
  const received = orders.filter((o) => o.status === "approved");
  // An offer is asked for only when there is one to pick; with none the dealer describes it in words.
  const needScheme = (kind === "Scheme" || kind === "Display") && offers.length > 0;
  const valid = amount > 0 && basis.trim().length > 0 && (!needScheme || !!schemeId);
  const ask = KINDS.find((k) => k.value === kind)!.ask;

  const send = () => {
    setTried(true);
    if (!valid) return;
    const id = nextId("CL-", claimsStore.get().map((c) => c.id), 3);
    const extra = [order ? `Order ${order}.` : "", photos ? `${photos} photo${photos === 1 ? "" : "s"}.` : ""].filter(Boolean).join(" ");
    claimsStore.set((cs) => [{ id, kind, party: s.c.id, partyKind: "customer", amount, raisedOn: SF_TODAY, status: "submitted", basis: [basis.trim(), extra].filter(Boolean).join(" "), schemeId: needScheme ? schemeId : null, settledBy: null }, ...cs]);
    logEvent(id, "sent the claim in the dealer portal", s.userName);
    notify(`Claim ${id} sent to ${s.company}`);
    onSent(id);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow="New claim"
      title="What are you claiming for?"
      size="wide"
      foot={
        <>
          <button type="button" onClick={onClose} className={SOFT}>
            Cancel
          </button>
          <button type="button" onClick={send} className={LIME}>
            Send claim
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Kind of claim">
        {KINDS.map((k) => {
          const on = k.value === kind;
          return (
            <button
              key={k.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setKind(k.value);
                setSchemeId(null);
              }}
              className={cn("flex min-h-[56px] flex-col items-start justify-center gap-1 rounded-bz-md border px-3 py-2 text-left text-[12px] transition-colors", on ? "border-bz-text bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line text-bz-text-muted hover:bg-bz-paper-warm")}
            >
              <k.icon size={14} className={on ? "text-bz-text" : "text-bz-text-soft"} />
              {k.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {needScheme && (
          <Field label="Which offer" required>
            <Select
              trigger="ghost"
              className={cn("h-10 w-full justify-between text-[12.5px]", tried && !schemeId && "border-bz-red-mark")}
              value={schemeId}
              onChange={setSchemeId}
              label={schemeId ? schemes.find((x) => x.id === schemeId)?.name : "Choose an offer"}
              options={offers.map((x) => ({ value: x.id, label: x.name, hint: x.status === "ended" ? `Ended ${day(x.to)}` : `Until ${day(x.to)}` }))}
              width={320}
            />
          </Field>
        )}
        {kind === "Damage" && received.length > 0 && (
          <Field label="Which order" hint="Optional — it helps find the batch.">
            <Select
              trigger="ghost"
              className="h-10 w-full justify-between text-[12.5px]"
              value={order}
              onChange={setOrder}
              label={order ?? "Choose an order"}
              options={received.map((o) => ({ value: o.id, label: o.id, hint: day(o.at) }))}
              width={280}
            />
          </Field>
        )}
        <Field label="Amount" required>
          <span className="relative block sm:max-w-[240px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
            <input inputMode="numeric" value={amount ? amount.toLocaleString("en-US") : ""} onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)} className={cn(INPUT, "h-10 bg-bz-surface pl-11 text-[13px] font-semibold", NUM, tried && amount <= 0 && "border-bz-red-mark")} aria-label="Amount claimed" />
          </span>
        </Field>
        <Field label="What happened" required>
          <textarea value={basis} onChange={(e) => setBasis(e.target.value)} placeholder={ask} className={cn(TEXTAREA, "min-h-[84px] bg-bz-surface", tried && !basis.trim() && "border-bz-red-mark")} />
        </Field>
        <Field label="Photos" hint={kind === "Damage" ? "A photo of the damage and of the delivery note is usually enough." : undefined}>
          <PhotoSlot count={photos} onAdd={() => setPhotos((n) => Math.min(6, n + 1))} onClear={() => setPhotos(0)} />
        </Field>
        {tried && !valid && <p className="m-0 text-[11.5px] text-bz-red">Fill in the marked fields to send the claim.</p>}
      </div>
    </Dialog>
  );
}
