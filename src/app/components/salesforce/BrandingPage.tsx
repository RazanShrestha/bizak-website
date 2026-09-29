import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Camera, ImageIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, DANGER_BTN, Dialog, Field, GHOST, GHOST_SM, MenuItem, NUM, NumberField, Popover, TEXTAREA, ToastHost, useToast } from "../sales/bzw";
import type { ToastMsg } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { HistoryEvent } from "../sales/orders";
import { BRANDING, POSM, SF_TODAY } from "./data";
import type { BrandingJob, BrandingStage, PosmItem } from "./data";
import { customerById, day, npr, typeOf } from "./engine";
import { brandingStore, campaignsStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Fact, Figures, Flag, List, Money, Page, PageIntro, Row, Section, SidePanel, TextTabs, TypeMark } from "./ui";
import { INSTALLERS, ME_ID, RecordActivity, RecordNoteFoot, SEED_INSTALLERS, STAGE_LABEL, STAGE_TONE, addDays, customerName, installerStore, logChange, personIdByName, posmStore, stamp } from "./activationKit";

// ════════════════════════════════════════════════════════════════════════════
// BRANDING (POSM) — requested → approved → installing → installed
//
// A rep, a dealer on the portal or a campaign asks for a sign board or a
// cooler; the manager approves it against POSM stock, a vendor or merchandiser
// installs it, and the after photo closes it (research/C §5.4). Each stage has
// one next step, so each stage has one lime button.
// ════════════════════════════════════════════════════════════════════════════

const STAGES: BrandingStage[] = ["requested", "approved", "installing", "installed", "rejected"];
type View = "requests" | "stock";
type Show = (kind: ToastMsg["kind"], text: string, action?: ToastMsg["action"]) => void;

// ── Stage moves (the server's job in the app) ───────────────────────────────

const setJob = (id: string, patch: Partial<BrandingJob>) => brandingStore.set((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)));
const giveBackStock = (j: BrandingJob) => posmStore.set((ps) => ps.map((p) => (p.id === j.posmId ? { ...p, stock: p.stock + j.qty } : p)));

function approve(j: BrandingJob, show: Show) {
  const p = posmStore.get().find((x) => x.id === j.posmId);
  if (!p) return;
  if (p.stock < j.qty) {
    show("error", `Only ${p.stock} ${p.unit} in stock, ${j.qty} needed. Receive stock first or reject the request.`);
    return;
  }
  posmStore.set((ps) => ps.map((x) => (x.id === p.id ? { ...x, stock: x.stock - j.qty } : x)));
  setJob(j.id, { stage: "approved" });
  logChange(`branding:${j.id}`, `approved it · ${j.qty} ${p.unit} taken from stock`);
  show("success", `Approved. ${p.stock - j.qty} ${p.unit} of ${p.name.toLowerCase()} left in stock.`);
}

function assign(j: BrandingJob, who: string, show: Show) {
  installerStore.set((m) => ({ ...m, [j.id]: who }));
  setJob(j.id, { stage: "installing" });
  logChange(`branding:${j.id}`, `assigned ${who} to install`);
  show("success", `${who} will install it. Mark it installed once the after photo is in.`);
}

function markInstalled(j: BrandingJob, show: Show) {
  if (!j.proof) return;
  setJob(j.id, { stage: "installed", installedOn: SF_TODAY });
  logChange(`branding:${j.id}`, "marked it installed with the after photo");
  show("success", "Marked installed. It now counts as a branded outlet.");
}

function reject(j: BrandingJob, reason: string, show: Show) {
  if (j.stage === "approved" || j.stage === "installing") giveBackStock(j);
  setJob(j.id, { stage: "rejected", note: reason || j.note });
  logChange(`branding:${j.id}`, `rejected it${reason ? `: ${reason}` : ""}`);
  show("info", j.stage === "requested" ? "Request rejected." : "Rejected. The items went back to stock.");
}

// ── Page ────────────────────────────────────────────────────────────────────

export function BrandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobs = useStore(brandingStore);
  const posm = useStore(posmStore);
  const campaigns = useStore(campaignsStore);
  const { toast, show, dismiss } = useToast();
  const [view, setView] = React.useState<View>("requests");
  const [stage, setStage] = React.useState<BrandingStage>("requested");

  const open = id ? jobs.find((j) => j.id === id) : undefined;
  React.useEffect(() => {
    if (!open) return;
    setView("requests");
    setStage(open.stage);
  }, [open?.id, open?.stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const posmOf = (j: BrandingJob) => posm.find((p) => p.id === j.posmId);
  const cost = (j: BrandingJob) => (posmOf(j)?.cost ?? 0) * j.qty;
  const count = (s: BrandingStage) => jobs.filter((j) => j.stage === s).length;
  const rows = jobs.filter((j) => j.stage === stage).sort((a, b) => b.requestedOn.localeCompare(a.requestedOn));
  const installedValue = jobs.filter((j) => j.stage === "installed").reduce((s, j) => s + cost(j), 0);
  const stockValue = posm.reduce((s, p) => s + p.stock * p.cost, 0);
  const openJob = (jid: string) => navigate(sfPath(`branding/${jid}`));
  const close = React.useCallback(() => navigate(sfPath("branding")), [navigate]);

  return (
    <SfShell page="branding" panel={open ? <BrandingPanel job={open} onClose={close} show={show} /> : null}>
      <Page width="full" className="max-w-[1160px]">
        <PageIntro
          actions={
            <TextTabs<View>
              value={view}
              onChange={setView}
              options={[
                { value: "requests", label: "Requests" },
                { value: "stock", label: "POSM stock" },
              ]}
            />
          }
        >
          Sign boards, standees and coolers asked for by reps, dealers and campaigns.
        </PageIntro>

        <Figures
          items={[
            { label: "Waiting for approval", value: count("requested"), onClick: () => (setView("requests"), setStage("requested")) },
            { label: "Being installed", value: count("approved") + count("installing"), sub: `${count("installing")} with an installer`, onClick: () => (setView("requests"), setStage("installing")) },
            { label: "Installed", value: <Money value={installedValue} />, sub: `${count("installed")} outlets branded`, onClick: () => (setView("requests"), setStage("installed")) },
            { label: "POSM in stock", value: <Money value={stockValue} />, sub: `${posm.filter((p) => p.stock === 0).length} items out`, onClick: () => setView("stock") },
          ]}
        />

        {view === "requests" ? (
          <section className="mt-12">
            <TextTabs<BrandingStage> className="mb-4" value={stage} onChange={setStage} options={STAGES.map((s) => ({ value: s, label: STAGE_LABEL[s], count: count(s) }))} />
            {rows.length === 0 ? (
              <EmptyNote>Nothing is {STAGE_LABEL[stage].toLowerCase()} right now.</EmptyNote>
            ) : (
              <List>
                {rows.map((j) => {
                  const p = posmOf(j);
                  const short = j.stage === "requested" && p && p.stock < j.qty;
                  return (
                    <Row
                      key={j.id}
                      active={j.id === id}
                      onClick={() => openJob(j.id)}
                      title={customerName(j.customerId)}
                      sub={
                        <>
                          {p?.name ?? j.posmId} × {j.qty}
                          <span className={open ? undefined : "md:hidden"}>
                            {" · "}
                            {j.requestedBy} · {day(j.requestedOn)}
                          </span>
                        </>
                      }
                      meta={open ? [] : [
                        <span key="r" className="inline-block w-[210px] truncate">
                          {j.requestedBy} <span className="text-bz-text-soft">· {day(j.requestedOn)}</span>
                        </span>,
                        <span key="c" className="inline-block w-[170px] truncate">
                          {j.campaignId ? campaigns.find((c) => c.id === j.campaignId)?.name ?? j.campaignId : <span className="text-bz-text-soft">No campaign</span>}
                        </span>,
                      ]}
                      trail={short ? <Flag>Short of stock</Flag> : <Money value={cost(j)} code={false} className="text-bz-text-muted" />}
                      action={
                        j.stage === "requested" && !short ? (
                          <button type="button" onClick={() => approve(j, show)} className="h-7 rounded-bz-md px-2 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm">
                            Approve
                          </button>
                        ) : undefined
                      }
                    />
                  );
                })}
              </List>
            )}
          </section>
        ) : (
          <PosmStock jobs={jobs} show={show} />
        )}
      </Page>
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfShell>
  );
}

// ── POSM stock ──────────────────────────────────────────────────────────────

function PosmStock({ jobs, show }: { jobs: BrandingJob[]; show: Show }) {
  const posm = useStore(posmStore);
  const [receive, setReceive] = React.useState<{ item: PosmItem; at: HTMLElement } | null>(null);
  const [qty, setQty] = React.useState(10);
  const asked = (p: PosmItem) => jobs.filter((j) => j.posmId === p.id && j.stage === "requested").reduce((s, j) => s + j.qty, 0);

  const add = () => {
    if (!receive || qty <= 0) return;
    const p = receive.item;
    posmStore.set((ps) => ps.map((x) => (x.id === p.id ? { ...x, stock: x.stock + qty } : x)));
    show("success", `${qty} ${p.unit} of ${p.name.toLowerCase()} received.`);
    setReceive(null);
  };

  return (
    <Section title="POSM stock" count={posm.length} className="mt-12" hint="what the requests draw from">
      <List>
        {posm.map((p) => {
          const need = asked(p);
          return (
            <Row
              key={p.id}
              title={p.name}
              sub={p.vendor}
              meta={[
                <span key="c" className={cn("inline-block w-[130px]", NUM)}>
                  NPR {npr(p.cost)} <span className="text-bz-text-soft">/ {p.unit}</span>
                </span>,
                <span key="a" className={cn("inline-block w-[110px] text-bz-text-soft", NUM)}>
                  {need ? `${need} asked for` : "—"}
                </span>,
              ]}
              trail={
                <span className="inline-block w-[120px] text-left">
                  <Dot tone={p.stock === 0 ? "danger" : p.stock < need ? "warn" : "neutral"}>
                    <span className={NUM}>{p.stock === 0 ? "Out of stock" : `${p.stock} ${p.unit}`}</span>
                  </Dot>
                </span>
              }
              action={
                <button
                  type="button"
                  onClick={(e) => {
                    setQty(10);
                    setReceive({ item: p, at: e.currentTarget });
                  }}
                  className="h-7 rounded-bz-md px-2 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
                >
                  Receive
                </button>
              }
            />
          );
        })}
      </List>
      <p className="m-0 mt-3 text-[11px] text-bz-text-soft">Approving a request takes its items from here; rejecting an approved one puts them back.</p>
      <Popover open={!!receive} anchor={receive?.at ?? null} onClose={() => setReceive(null)} align="right" width={240} className="p-3">
        <p className="m-0 mb-2 text-[12px] font-semibold text-bz-text">Receive {receive?.item.name.toLowerCase()}</p>
        <div className="flex items-center gap-2">
          <NumberField value={qty} onChange={setQty} min={1} className="w-24" ariaLabel="Quantity" />
          <span className="text-[11.5px] text-bz-text-muted">{receive?.item.unit}</span>
          <button type="button" onClick={add} className={cn(GHOST_SM, "ml-auto")}>
            Add
          </button>
        </div>
      </Popover>
    </Section>
  );
}

// ── The request ─────────────────────────────────────────────────────────────

function BrandingPanel({ job, onClose, show }: { job: BrandingJob; onClose: () => void; show: Show }) {
  const posm = useStore(posmStore);
  const installers = useStore(installerStore);
  const campaigns = useStore(campaignsStore);
  const [assignAt, setAssignAt] = React.useState<HTMLElement | null>(null);
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const p = posm.find((x) => x.id === job.posmId);
  const c = customerById(job.customerId);
  const t = c ? typeOf(c) : undefined;
  const installer = installers[job.id];
  const campaign = campaigns.find((x) => x.id === job.campaignId);
  const short = !!p && job.stage === "requested" && p.stock < job.qty;
  const canReject = job.stage === "requested" || job.stage === "approved" || job.stage === "installing";

  const seed = seedHistory(job.id);

  let primary: React.ReactNode = null;
  if (job.stage === "requested")
    primary = (
      <button type="button" className={BTN} disabled={short} title={short ? "Not enough in stock" : undefined} onClick={() => approve(job, show)}>
        Approve
      </button>
    );
  else if (job.stage === "approved")
    primary = (
      <button type="button" className={BTN} onClick={(e) => setAssignAt(e.currentTarget)}>
        Assign installer
      </button>
    );
  else if (job.stage === "installing")
    primary = (
      <button type="button" className={BTN} disabled={!job.proof} onClick={() => markInstalled(job, show)}>
        Mark installed
      </button>
    );

  return (
    <SidePanel
      open
      onClose={onClose}
      width={560}
      eyebrow={`Branding request · ${job.id}`}
      title={customerName(job.customerId)}
      meta={
        <>
          <Dot tone={STAGE_TONE[job.stage]}>{STAGE_LABEL[job.stage]}</Dot>
          {t && <TypeMark name={t.name} color={t.color} />}
          {c && <span>{c.city}</span>}
        </>
      }
      foot={
        <div className="-mx-6 -my-3 [&>div]:border-t-0">
          <RecordNoteFoot subject={`branding:${job.id}`} />
        </div>
      }
    >
      {(primary || canReject) && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {primary}
          {canReject && (
            <button type="button" className={GHOST} onClick={() => (setReason(""), setRejecting(true))}>
              Reject
            </button>
          )}
          {job.stage === "installing" && !job.proof && <span className="text-[11px] text-bz-text-soft">Add the after photo first.</span>}
          {short && <span className="text-[11px] text-bz-red">Only {p!.stock} in stock.</span>}
        </div>
      )}

      <Section title="Request" className="mt-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Fact label="Item">
            {p?.name ?? job.posmId} × {job.qty}
          </Fact>
          <Fact label="Requested">
            {job.requestedBy} <span className="text-bz-text-soft">· {day(job.requestedOn)}</span>
          </Fact>
          <Fact label="Campaign">
            {campaign ? (
              <Link to={sfPath(`campaigns/${campaign.id}`)} className="underline decoration-bz-line underline-offset-2 hover:decoration-bz-text">
                {campaign.name}
              </Link>
            ) : (
              <span className="text-bz-text-soft">None</span>
            )}
          </Fact>
          <Fact label={job.stage === "installed" ? "Installed" : "Installer"}>
            {job.stage === "installed" && job.installedOn ? `${day(job.installedOn)}${installer ? ` · ${installer}` : ""}` : installer ?? <span className="text-bz-text-soft">Not assigned</span>}
          </Fact>
        </div>
        {job.note && <p className="m-0 mt-4 text-[12px] leading-relaxed text-bz-text-muted">{job.stage === "rejected" ? `Why rejected: ${job.note}` : job.note}</p>}
      </Section>

      {p && (
        <Section title="POSM item" hint={p.vendor}>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <Fact label="In stock">
              <span className={cn(NUM, p.stock < job.qty && job.stage === "requested" && "text-bz-red")}>
                {p.stock} {p.unit}
              </span>
            </Fact>
            <Fact label="Unit cost">
              <Money value={p.cost} />
            </Fact>
            <Fact label="This job">
              <Money value={p.cost * job.qty} />
            </Fact>
          </div>
        </Section>
      )}

      <Section title="Photos" hint={job.proof ? "after photo in" : job.stage === "installing" ? "after photo needed" : undefined}>
        <div className="grid grid-cols-2 gap-3">
          <PhotoSlot label="Before" caption={`Site photo · ${day(job.requestedOn)}`} filled />
          <PhotoSlot
            label="After"
            caption={job.proof ? `Installed · geo-tagged${job.installedOn ? ` · ${day(job.installedOn)}` : ""}` : undefined}
            filled={job.proof}
            onAdd={job.stage === "installing" ? () => (setJob(job.id, { proof: true }), logChange(`branding:${job.id}`, "added the after photo")) : undefined}
            onRemove={job.stage === "installing" && job.proof ? () => (setJob(job.id, { proof: false }), logChange(`branding:${job.id}`, "removed the after photo")) : undefined}
          />
        </div>
      </Section>

      <div className="-mx-6 mt-8 border-t border-bz-line-soft px-1">
        <RecordActivity subject={`branding:${job.id}`} seed={seed} />
      </div>

      <Popover open={!!assignAt} anchor={assignAt} onClose={() => setAssignAt(null)} width={260}>
        <p className="m-0 px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Who installs it</p>
        {INSTALLERS.map((who) => (
          <MenuItem
            key={who}
            hint={p && who === p.vendor ? "Supplies this item" : who.includes("merchandiser") ? "Our team" : undefined}
            onClick={() => {
              setAssignAt(null);
              assign(job, who, show);
            }}
          >
            {who}
          </MenuItem>
        ))}
      </Popover>

      <Dialog
        open={rejecting}
        size="sm"
        title="Reject this request?"
        onClose={() => setRejecting(false)}
        foot={
          <>
            <button type="button" className={GHOST} onClick={() => setRejecting(false)}>
              Cancel
            </button>
            <button
              type="button"
              className={DANGER_BTN}
              onClick={() => {
                reject(job, reason.trim(), show);
                setRejecting(false);
              }}
            >
              Reject
            </button>
          </>
        }
      >
        <Field label="Reason" hint={job.stage === "requested" ? "The requester sees this." : "The items go back to POSM stock."}>
          <textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Shop too small for a standee." className={TEXTAREA} />
        </Field>
      </Dialog>
    </SidePanel>
  );
}

/**
 * The past of a seeded job, told from its SEED state — a move made here writes its own line through logChange,
 * so deriving from the live stage would tell it twice.
 */
function seedHistory(id: string): HistoryEvent[] {
  const job = BRANDING.find((j) => j.id === id);
  if (!job) return [];
  const p = POSM.find((x) => x.id === job.posmId);
  const installer = SEED_INSTALLERS[job.id];
  const requester = personIdByName(job.requestedBy);
  const past = (s: BrandingStage[]) => s.includes(job.stage);
  return [
    requester
      ? { id: `${id}-h1`, whoId: requester, when: stamp(job.requestedOn, "10:20"), what: `asked for ${job.qty} × ${p?.name.toLowerCase() ?? job.posmId}` }
      : { id: `${id}-h1`, whoId: ME_ID, when: stamp(job.requestedOn, "10:20"), what: `logged a request from ${job.requestedBy}` },
    ...(past(["approved", "installing", "installed"]) ? [{ id: `${id}-h2`, whoId: ME_ID, when: stamp(addDays(job.requestedOn, 1), "12:00"), what: "approved it" }] : []),
    ...(past(["installing", "installed"]) && installer ? [{ id: `${id}-h3`, whoId: ME_ID, when: stamp(addDays(job.requestedOn, 2), "09:40"), what: `assigned ${installer} to install` }] : []),
    ...(job.stage === "installed" && job.installedOn ? [{ id: `${id}-h4`, whoId: requester ?? ME_ID, when: stamp(job.installedOn, "16:15"), what: "added the after photo and marked it installed" }] : []),
    ...(job.stage === "rejected" ? [{ id: `${id}-h5`, whoId: ME_ID, when: stamp(addDays(job.requestedOn, 1), "11:00"), what: `rejected it${job.note ? `: ${job.note}` : ""}` }] : []),
  ];
}

function PhotoSlot({ label, caption, filled, onAdd, onRemove }: { label: string; caption?: string; filled: boolean; onAdd?: () => void; onRemove?: () => void }) {
  return (
    <div className="min-w-0">
      <div className={cn("flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-bz-md", filled ? "bg-bz-paper-warm" : "border border-dashed border-bz-line")}>
        {filled ? (
          <ImageIcon size={20} className="text-bz-text-soft" />
        ) : onAdd ? (
          <button type="button" onClick={onAdd} className={GHOST_SM}>
            <Camera size={12} /> Add photo
          </button>
        ) : (
          <span className="text-[11px] text-bz-text-soft">No photo yet</span>
        )}
      </div>
      <p className="m-0 mt-1.5 flex items-center gap-2 text-[11px] text-bz-text-muted">
        <span className="font-medium text-bz-text">{label}</span>
        <span className="min-w-0 flex-1 truncate">{caption}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="shrink-0 text-bz-text-soft underline underline-offset-2 hover:text-bz-text">
            Remove
          </button>
        )}
      </p>
    </div>
  );
}

export const BRANDING_ROUTES = [
  { path: "design/salesforce/branding", Component: BrandingPage },
  { path: "design/salesforce/branding/:id", Component: BrandingPage },
];
