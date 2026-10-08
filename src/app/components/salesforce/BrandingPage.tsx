import * as React from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { Ban, Camera, Check, CircleCheck, ListTree, Megaphone, Package, PackagePlus, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, DocLink, Field, GHOST, GHOST_SM, INPUT_SM, MenuItem, MenuLabel, MenuSep, NUM, NumberField, Popover, Select, TEXTAREA } from "../sales/bzw";
import type { PanelCtx } from "../sales/DocDesk";
import { SheetFrame } from "../sales/FulfilSheet";
import { Amount } from "../sales/orders";
import { Cell, CellGrid, ReasonDialog } from "../sales/parts";
import { Block, CustomerTitle, RecordShell, StepCard } from "../sales/record";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { BrandingJob, BrandingStage, Campaign, PosmItem } from "./data";
import { customerById, day, npr, typeOf } from "./engine";
import { nextId } from "./persist";
import { openQuickAdd } from "./quickadd";
import { STAFF_NAME, logEvent } from "./records";
import { brandingStore, campaignsStore, customersStore, posmStore } from "./store";
import { FxDate, FxDesk, pillTone } from "./fx-desk";
import { SfActivity, SfLines, SfNoteFoot, TypeMark, Who, chipTone, sfPath } from "./sf";
import { STAGE_LABEL, STAGE_TONE, campaignName, customerName, installerOptions, installerStore, linkToCampaign, statusNow } from "./activationKit";
import { More, Picker } from "./network-form";
import { DASH, DeskTabs, MaterialDialog, MaterialsDesk, ReceiveDialog, materialPath, moveStock } from "./branding-materials";
import type { Show } from "./branding-materials";

// ════════════════════════════════════════════════════════════════════════════
// GROWTH · BRANDING — requested → approved → installing → installed
//
// Sign boards, standees and coolers put up at a customer's shop. Two desks
// share the tab: Requests (here — a `FxDesk` grouped by stage, each stage with
// one next step) and Materials (branding-materials.tsx — the stock the requests
// draw from). Approving takes the items from stock, an installer puts them up,
// and the after photo closes the request (research/C §5.4).
// ════════════════════════════════════════════════════════════════════════════

const STAGES: BrandingStage[] = ["requested", "approved", "installing", "installed", "rejected"];

// ── Stage moves (the server's job in the app) ───────────────────────────────

const setJob = (id: string, patch: Partial<BrandingJob>) => brandingStore.set((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)));

/** Reads the live stock, so approving several requests for one material in a row stops when it runs out. */
export function approve(j: BrandingJob, show?: Show) {
  const p = posmStore.get().find((x) => x.id === j.posmId);
  if (!p) {
    show?.("error", "Its material was deleted. Reject the request.");
    return false;
  }
  if (p.stock < j.qty) {
    show?.("error", `Only ${p.stock} ${p.unit} in stock, ${j.qty} needed.`);
    return false;
  }
  moveStock(p.id, -j.qty);
  setJob(j.id, { stage: "approved" });
  logEvent(j.id, `approved it · ${j.qty} ${p.unit} taken from stock`);
  logEvent(p.id, `${j.qty} ${p.unit} taken for ${j.id} · ${p.stock - j.qty} left`);
  show?.("success", `${j.id} approved · ${p.stock - j.qty} ${p.unit} left in stock`);
  return true;
}

function assign(j: BrandingJob, who: string, show: Show) {
  installerStore.set((m) => ({ ...m, [j.id]: who }));
  setJob(j.id, { stage: "installing" });
  logEvent(j.id, `assigned ${who} to install`);
  show("success", `${j.id} assigned to ${who}`);
}

function markInstalled(j: BrandingJob, show: Show) {
  if (!j.proof) return;
  setJob(j.id, { stage: "installed", installedOn: SF_TODAY });
  logEvent(j.id, "marked it installed");
  show("success", `${j.id} marked installed`);
}

function reject(j: BrandingJob, reason: string, show: Show) {
  const back = j.stage === "approved" || j.stage === "installing";
  const p = posmStore.get().find((x) => x.id === j.posmId);
  if (back && p) {
    moveStock(p.id, j.qty);
    logEvent(p.id, `${j.qty} ${p.unit} back from ${j.id}`);
  }
  setJob(j.id, { stage: "rejected", note: reason || j.note });
  logEvent(j.id, `rejected it${reason ? `: ${reason}` : ""}${back && p ? ` · ${j.qty} ${p.unit} back to stock` : ""}`);
  show("info", back && p ? `${j.id} rejected · items back in stock` : `${j.id} rejected`);
}

// ── Page: which of the two desks the URL names ──────────────────────────────

export function BrandingPage() {
  const { no } = useParams();
  const [search] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const posm = useStore(posmStore);
  const view = search.get("view");
  const onMaterial = !!no && posm.some((p) => p.id === no);
  const materials = onMaterial || (view === "materials" && (!no || !brandingStore.get().some((j) => j.id === no)) && no !== "new");

  // A material opened by a bare link keeps the Materials desk under it when it closes.
  React.useEffect(() => {
    if (onMaterial && view !== "materials") navigate(`${pathname}?view=materials`, { replace: true });
  }, [onMaterial, view, pathname, navigate]);
  // `?new=1` is retired: an old link still lands on the new request.
  React.useEffect(() => {
    if (search.get("new") !== "1") return;
    const campaign = search.get("campaign");
    navigate(`${sfPath("branding/new")}${campaign ? `?campaign=${campaign}` : ""}`, { replace: true });
  }, [search, navigate]);

  return materials ? <MaterialsDesk /> : <RequestsDesk />;
}

// ── Requests ────────────────────────────────────────────────────────────────

type Row = { j: BrandingJob; p: PosmItem | undefined; cost: number; short: boolean; campaign: Campaign | undefined; customer: string };

function RequestsDesk() {
  const navigate = useNavigate();
  const jobs = useStore(brandingStore);
  const posm = useStore(posmStore);
  const campaigns = useStore(campaignsStore);
  useStore(customersStore);
  const showRef = React.useRef<Show | null>(null);

  const rows: Row[] = jobs.map((j) => {
    const p = posm.find((x) => x.id === j.posmId);
    return { j, p, cost: (p?.cost ?? 0) * j.qty, short: j.stage === "requested" && (!p || p.stock < j.qty), campaign: campaigns.find((c) => c.id === j.campaignId), customer: customerName(j.customerId) };
  });
  const is = (s: BrandingStage) => (r: Row) => r.j.stage === s;
  const count = (s: BrandingStage) => rows.filter(is(s)).length;
  const total = (rs: Row[]) => (rs.length ? <Amount value={rs.reduce((s, r) => s + r.cost, 0)} currency="NPR" /> : undefined);
  const installed = rows.filter(is("installed"));
  const live = campaigns.filter((c) => statusNow(c, SF_TODAY) !== "ended");

  return (
    <FxDesk<Row>
      place="branding"
      section="salesforce/branding"
      noun={["request", "requests"]}
      rows={rows}
      noOf={(r) => r.j.id}
      dateOf={(r) => r.j.requestedOn}
      searchText={(r) => `${r.j.id} ${r.customer} ${r.p?.name ?? ""} ${r.j.requestedBy} ${r.campaign?.name ?? ""}`}
      searchPlaceholder="Number, customer or material"
      stats={[{ label: "Outlets branded", value: new Set(installed.map((r) => r.j.customerId)).size, title: "Customers with an installed request" }]}
      picks={[
        { key: "requested", label: "Waiting for approval", value: count("requested"), test: is("requested") },
        { key: "progress", label: "Being installed", value: count("approved") + count("installing"), test: (r) => r.j.stage === "approved" || r.j.stage === "installing", title: `${count("installing")} with an installer` },
        { key: "installed", label: "Installed", value: <Amount value={installed.reduce((s, r) => s + r.cost, 0)} currency="NPR" />, test: is("installed"), title: "Cost of what is up at shops" },
      ]}
      views={[
        {
          key: "stage",
          label: "",
          icon: ListTree,
          groups: (rs, narrowed) =>
            STAGES.map((s) => ({
              key: s,
              label: STAGE_LABEL[s],
              rows: rs.filter(is(s)),
              right: s === "rejected" ? undefined : total(rs.filter(is(s))),
              collapsed: (s === "installed" || s === "rejected") && !narrowed,
            })),
        },
      ]}
      filters={[
        ...STAGES.map((s) => ({ value: `st:${s}`, label: STAGE_LABEL[s], group: "Stage", test: is(s) })),
        ...campaigns.filter((c) => jobs.some((j) => j.campaignId === c.id)).map((c) => ({ value: `cmp:${c.id}`, label: c.name, group: "Campaign", test: (r: Row) => r.j.campaignId === c.id })),
        { value: "cmp:none", label: "No campaign", group: "Campaign", test: (r: Row) => !r.j.campaignId },
        ...posm.map((p) => ({ value: `pm:${p.id}`, label: p.name, group: "Material", test: (r: Row) => r.j.posmId === p.id })),
      ]}
      sorts={[
        { key: "new", label: "Newest", by: (r) => r.j.requestedOn + r.j.id, desc: true },
        { key: "old", label: "Oldest", by: (r) => r.j.requestedOn + r.j.id },
        { key: "cost", label: "Cost", by: (r) => r.cost, desc: true },
        { key: "cus", label: "Customer", by: (r) => r.customer },
      ]}
      columns={[
        { key: "campaign", label: "Campaign", width: "120px", render: (r) => r.campaign?.name ?? (r.j.campaignId ? "Deleted campaign" : DASH) },
        { key: "date", label: "Requested", width: "76px", render: (r) => <FxDate iso={r.j.requestedOn} /> },
      ]}
      primary={(r) => ({ title: r.customer, sub: `${r.p?.name ?? "Deleted material"} × ${r.j.qty} · ${r.j.requestedBy}`, subOnDesktop: true })}
      status={(r) => ({ label: STAGE_LABEL[r.j.stage], tone: pillTone(STAGE_TONE[r.j.stage]) })}
      statusLabel="Stage"
      amount={(r) => ({ value: <Amount value={r.cost} />, sub: r.short ? <span className="text-bz-red">Short of stock</span> : undefined })}
      rowVerb={(r) =>
        r.j.stage === "requested" && !r.short
          ? { label: "Approve", icon: Check, run: () => void approve(r.j, showRef.current ?? undefined) }
          : r.j.stage === "approved"
            ? { label: "Assign", icon: UserRound, run: () => navigate(sfPath(`branding/${r.j.id}`)) }
            : r.j.stage === "installing"
              ? { label: "Complete", icon: CircleCheck, run: () => (r.j.proof && showRef.current ? markInstalled(r.j, showRef.current) : navigate(sfPath(`branding/${r.j.id}`))) }
              : null
      }
      bulk={[
        {
          label: "Approve",
          icon: Check,
          enabled: (rs) => rs.some(is("requested")),
          run: (rs) => {
            const skipped: string[] = [];
            let done = 0;
            rs.forEach((r) => {
              if (r.j.stage !== "requested") skipped.push(`${r.j.id} is ${STAGE_LABEL[r.j.stage].toLowerCase()}`);
              else if (approve(r.j)) done++;
              else skipped.push(`${r.j.id} is short of stock`);
            });
            return { done, skipped, verb: "approved" };
          },
        },
        {
          label: "Set campaign",
          icon: Megaphone,
          enabled: (rs) => rs.length > 0,
          choose: { options: [{ value: "none", label: "No campaign" }, ...live.map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))], placeholder: "Find a campaign…" },
          run: (rs, v) => {
            const to = !v || v === "none" ? null : v;
            const skipped = rs.filter((r) => r.j.campaignId === to).map((r) => `${r.j.id} is already there`);
            rs.filter((r) => r.j.campaignId !== to).forEach((r) => linkToCampaign("branding", r.j.id, to, r.j.id));
            return { done: rs.length - skipped.length, skipped, verb: to ? `put in ${campaignName(to)}` : "taken out of their campaign" };
          },
        },
      ]}
      newLabel="New request"
      onNew={() => navigate(sfPath("branding/new"))}
      renderNew={(ctx) => <NewRequest ctx={ctx} />}
      renderPanel={(r, ctx) => <RequestPanel key={r.j.id} r={r} ctx={ctx} />}
      viewTabs={<DeskTabs view="requests" />}
      renderExtra={({ show }) => {
        showRef.current = show;
        return null;
      }}
    />
  );
}

// ── The request ─────────────────────────────────────────────────────────────

function RequestPanel({ r, ctx }: { r: Row; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const installers = useStore(installerStore);
  const campaigns = useStore(campaignsStore);
  const { j, p } = r;
  const [assignAt, setAssignAt] = React.useState<HTMLElement | null>(null);
  const [other, setOther] = React.useState("");
  const [rejecting, setRejecting] = React.useState(false);
  const [receiving, setReceiving] = React.useState(false);
  const file = React.useRef<HTMLInputElement>(null);

  const c = customerById(j.customerId);
  const t = typeOf(c);
  const installer = installers[j.id];
  const canReject = j.stage === "requested" || j.stage === "approved" || j.stage === "installing";
  const fromStock = j.stage === "approved" || j.stage === "installing";
  const options = installerOptions();
  const campaignOptions = campaigns.filter((x) => x.id === j.campaignId || statusNow(x, SF_TODAY) !== "ended");

  const pick = (who: string) => {
    if (!who.trim()) return;
    setAssignAt(null);
    assign(j, who.trim(), ctx.show);
  };

  const rejectBtn = canReject && (
    <button type="button" className={GHOST_SM} onClick={() => setRejecting(true)}>
      Reject
    </button>
  );
  const step =
    j.stage === "requested" && r.short ? (
      <StepCard
        tone="danger"
        icon={<ShieldAlert size={15} />}
        title="Short of stock"
        sub={p ? `${p.stock} ${p.unit} in stock, ${j.qty} needed.` : "Its material was deleted."}
        actions={
          <>
            {rejectBtn}
            {p && (
              <button type="button" className={cn(BTN, "h-8")} onClick={() => setReceiving(true)}>
                <PackagePlus size={13} /> Receive stock
              </button>
            )}
          </>
        }
      />
    ) : j.stage === "requested" ? (
      <StepCard
        icon={<ShieldCheck size={15} />}
        title="Waiting for approval"
        sub={p ? `${p.stock} ${p.unit} in stock.` : undefined}
        actions={
          <>
            {rejectBtn}
            <button type="button" className={cn(BTN, "h-8")} onClick={() => void approve(j, ctx.show)}>
              <Check size={13} /> Approve
            </button>
          </>
        }
      />
    ) : j.stage === "approved" ? (
      <StepCard
        icon={<UserRound size={15} />}
        title="Approved, no installer yet"
        sub={p ? `${j.qty} ${p.unit} taken from stock.` : undefined}
        actions={
          <>
            {rejectBtn}
            <button type="button" className={cn(BTN, "h-8")} onClick={(e) => (setOther(""), setAssignAt(e.currentTarget))}>
              Assign installer
            </button>
          </>
        }
      />
    ) : j.stage === "installing" ? (
      <StepCard
        icon={j.proof ? <Check size={15} /> : <Camera size={15} />}
        title={j.proof ? "Photo is in" : "Waiting for the after photo"}
        sub={installer ? `${installer} is installing it.` : undefined}
        actions={
          <>
            {rejectBtn}
            {j.proof ? (
              <button type="button" className={cn(BTN, "h-8")} onClick={() => markInstalled(j, ctx.show)}>
                <Check size={13} /> Mark installed
              </button>
            ) : (
              <button type="button" className={cn(BTN, "h-8")} onClick={() => file.current?.click()}>
                <Camera size={13} /> Add photo
              </button>
            )}
          </>
        }
      />
    ) : j.stage === "installed" ? (
      <StepCard tone="done" icon={<CircleCheck size={15} />} title={j.installedOn ? `Installed on ${day(j.installedOn)}` : "Installed"} sub={installer ? `By ${installer}.` : undefined} />
    ) : (
      <StepCard tone="quiet" icon={<Ban size={15} />} title="Rejected" sub={j.note || undefined} />
    );

  return (
    <RecordShell
      ctx={ctx}
      no={j.id}
      chips={<Chip tone={chipTone(STAGE_TONE[j.stage])}>{STAGE_LABEL[j.stage]}</Chip>}
      title={c ? <CustomerTitle name={c.name} onOpen={() => navigate(sfPath(`customers/${c.id}`))} /> : r.customer}
      amount={<Amount value={r.cost} currency="NPR" />}
      meta={[
        <span key="d" className={NUM}>
          {day(j.requestedOn)}
        </span>,
        <span key="by" className="inline-flex items-center gap-1.5">
          <Who name={j.requestedBy} size={16} /> {j.requestedBy}
        </span>,
        c && <TypeMark key="t" name={t.name} color={t.color} />,
        c?.city && <span key="c">{c.city}</span>,
        r.campaign && <DocLink key="cmp" no={r.campaign.id} kind="Campaign" onClick={() => navigate(sfPath(`campaigns/${r.campaign!.id}`))} />,
      ]}
      menu={
        c || p || canReject
          ? (close) => (
              <>
                {c && (
                  <MenuItem icon={UserRound} onClick={() => (close(), navigate(sfPath(`customers/${c.id}`)))}>
                    Open customer
                  </MenuItem>
                )}
                {p && (
                  <MenuItem icon={Package} onClick={() => (close(), navigate(materialPath(p.id)))}>
                    Open material
                  </MenuItem>
                )}
                {canReject && (
                  <>
                    {(c || p) && <MenuSep />}
                    <MenuItem icon={Ban} danger onClick={() => (close(), setRejecting(true))}>
                      Reject request…
                    </MenuItem>
                  </>
                )}
              </>
            )
          : undefined
      }
      foot={<SfNoteFoot id={j.id} />}
    >
      {step}

      <Block title="Material" right={p ? <DocLink no={p.id} kind="Material" onClick={() => navigate(materialPath(p.id))} /> : undefined}>
        {p ? (
          <SfLines
            rows={[
              {
                key: p.id,
                name: p.name,
                sub: [p.vendor, `${p.stock} ${p.unit} in stock`].filter(Boolean).join(" · "),
                qty: (
                  <>
                    {j.qty} <span className="text-bz-text-soft">{p.unit}</span>
                  </>
                ),
                rate: <Amount value={p.cost} />,
                net: <Amount value={r.cost} />,
              },
            ]}
          />
        ) : (
          <p className="m-0 text-[11.5px] text-bz-text-soft">The material was deleted.</p>
        )}
      </Block>

      <Block title="Details">
        <CellGrid>
          <Cell label="Campaign">
            <Select
              trigger="plain"
              value={j.campaignId ?? "none"}
              onChange={(v) => linkToCampaign("branding", j.id, v === "none" ? null : v, j.id)}
              label={j.campaignId ? (r.campaign?.name ?? "Deleted campaign") : "None"}
              options={[{ value: "none", label: "None" }, ...campaignOptions.map((x) => ({ value: x.id, label: x.name, hint: `${day(x.from)} – ${day(x.to)}` }))]}
              className="underline decoration-bz-line underline-offset-2 hover:decoration-bz-text"
            />
          </Cell>
          <Cell label={j.stage === "installed" ? "Installed" : "Installer"}>
            {j.stage === "installed" && j.installedOn ? `${day(j.installedOn)}${installer ? ` · ${installer}` : ""}` : (installer ?? <span className="text-bz-text-soft">Not assigned</span>)}
          </Cell>
          {(j.stage === "installing" || j.stage === "installed" || j.proof) && (
            <Cell label="After photo">
              {j.proof ? (
                <span className="inline-flex items-center gap-2">
                  Added
                  {j.stage === "installing" && (
                    <button
                      type="button"
                      className="text-[11px] font-medium text-bz-text-muted underline underline-offset-2 hover:text-bz-text"
                      onClick={() => {
                        setJob(j.id, { proof: false });
                        logEvent(j.id, "removed the after photo");
                      }}
                    >
                      Remove
                    </button>
                  )}
                </span>
              ) : (
                <span className="text-bz-text-soft">Not added</span>
              )}
            </Cell>
          )}
          {j.note && j.stage !== "rejected" && (
            <Cell label="Note" wide>
              <span className="whitespace-pre-wrap leading-relaxed">{j.note}</span>
            </Cell>
          )}
        </CellGrid>
      </Block>

      <SfActivity ids={[j.id]} />

      {/* The prototype keeps no images: picking a file records that the photo is in. */}
      <input
        ref={file}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const name = e.target.files?.[0]?.name ?? null;
          setJob(j.id, { proof: true });
          logEvent(j.id, `added the after photo${name ? ` (${name})` : ""}`);
          e.target.value = "";
        }}
      />

      <Popover open={!!assignAt} anchor={assignAt} onClose={() => setAssignAt(null)} align="right" width={280}>
        <MenuLabel>Who installs it</MenuLabel>
        {options.map((who) => (
          <MenuItem key={who} hint={p && who === p.vendor ? "Supplies this material" : who.endsWith("(merchandiser)") ? "Our team" : undefined} onClick={() => pick(who)}>
            {who}
          </MenuItem>
        ))}
        <div className="flex items-center gap-1.5 px-1 pb-1 pt-1.5">
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), pick(other))}
            placeholder={options.length ? "Someone else" : "Installer's name"}
            aria-label="Installer's name"
            className={cn(INPUT_SM, "min-w-0 flex-1")}
          />
          <button type="button" className={GHOST_SM} disabled={!other.trim()} onClick={() => pick(other)}>
            Assign
          </button>
        </div>
      </Popover>

      <ReasonDialog
        open={rejecting}
        eyebrow={j.id}
        title={`Reject ${j.id}?`}
        body={fromStock && p ? "The items go back to stock." : undefined}
        confirm="Reject request"
        danger
        onClose={() => setRejecting(false)}
        onConfirm={(reason) => {
          reject(j, reason, ctx.show);
          setRejecting(false);
        }}
      />
      <ReceiveDialog item={receiving && p ? p : null} onClose={() => setReceiving(false)} show={ctx.show} />
    </RecordShell>
  );
}

// ── New request ─────────────────────────────────────────────────────────────

function NewRequest({ ctx }: { ctx: PanelCtx }) {
  const [search] = useSearchParams();
  const customers = useStore(customersStore);
  const posm = useStore(posmStore);
  const campaigns = useStore(campaignsStore);
  const [customerId, setCustomerId] = React.useState<string | null>(null);
  const [posmId, setPosmId] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState(1);
  const [note, setNote] = React.useState("");
  // A campaign's "New branding request" arrives with ?campaign=<id>.
  const [campaignId, setCampaignId] = React.useState(() => {
    const preset = search.get("campaign");
    return preset && campaignsStore.get().some((c) => c.id === preset) ? preset : "none";
  });
  const [refusal, setRefusal] = React.useState<string | null>(null);
  const [addingItem, setAddingItem] = React.useState(false);

  const item = posm.find((p) => p.id === posmId);
  const commit = () => {
    if (!customerId) return setRefusal("Pick a customer.");
    if (!posmId || !item) return setRefusal("Pick a material.");
    if (qty <= 0) return setRefusal("Enter a quantity above 0.");
    const id = nextId("BR-", brandingStore.get().map((b) => b.id));
    brandingStore.set((bs) => [{ id, customerId, posmId, qty, stage: "requested", requestedBy: STAFF_NAME, requestedOn: SF_TODAY, campaignId: null, proof: false, note: note.trim(), installedOn: null }, ...bs]);
    logEvent(id, `asked for ${qty} ${item.unit} ${item.name.toLowerCase()}`.replace(/\s+/g, " ").trim());
    if (campaignId !== "none") linkToCampaign("branding", id, campaignId, id);
    ctx.show("success", `${id} added`);
    ctx.go(id);
  };

  return (
    <RecordShell ctx={ctx} no="" back={{ label: "Branding", onClick: () => ctx.go(null) }} title="New request" amount={item ? <Amount value={item.cost * qty} currency="NPR" /> : undefined}>
      <div className="flex h-full min-h-0 flex-col">
        <SheetFrame
          onCommit={commit}
          refusal={refusal}
          onDismissRefusal={() => setRefusal(null)}
          foot={
            <>
              {item && item.stock < qty && (
                <span className={cn("text-[11.5px] text-bz-red", NUM)}>
                  Only {item.stock} {item.unit} in stock.
                </span>
              )}
              <button type="button" className={cn(GHOST, "ml-auto")} onClick={() => ctx.go(null)}>
                Cancel
              </button>
              <button type="button" className={BTN} onClick={commit}>
                Add request
              </button>
            </>
          }
        >
          <div className="grid max-w-[720px] grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
            <Field label="Customer" required>
              <Picker
                value={customerId}
                onChange={setCustomerId}
                placeholder="Pick a customer"
                ariaLabel="Customer"
                options={customers.map((c) => ({ value: c.id, label: c.name, hint: [typeOf(c).name, c.city].filter(Boolean).join(" · ") }))}
                addLabel="New customer"
                onAdd={() => openQuickAdd("customer", { onCreated: setCustomerId })}
              />
            </Field>
            <Field label="Material" required>
              <Picker
                value={posmId}
                onChange={setPosmId}
                placeholder="Pick a material"
                ariaLabel="Material"
                options={posm.map((p) => ({ value: p.id, label: p.name, hint: `${p.stock} ${p.unit} in stock · NPR ${npr(p.cost)} each` }))}
                addLabel="New material"
                onAdd={() => setAddingItem(true)}
              />
            </Field>
            <Field label="Quantity">
              <NumberField value={qty} onChange={setQty} min={1} className="h-9 w-full" ariaLabel="Quantity" />
            </Field>
            <Field label="Campaign">
              <Picker
                value={campaignId}
                onChange={setCampaignId}
                placeholder="No campaign"
                ariaLabel="Campaign"
                options={[{ value: "none", label: "No campaign" }, ...campaigns.filter((c) => c.id === campaignId || statusNow(c, SF_TODAY) !== "ended").map((c) => ({ value: c.id, label: c.name, hint: `${day(c.from)} – ${day(c.to)}` }))]}
              />
            </Field>
          </div>
          <div className="max-w-[720px] px-5 pb-5">
            <More defaultOpen={!!note}>
              <Field label="Note">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className={TEXTAREA} />
              </Field>
            </More>
          </div>
        </SheetFrame>
      </div>
      <MaterialDialog
        open={addingItem}
        onClose={() => setAddingItem(false)}
        onSaved={(id) => {
          setPosmId(id);
          ctx.show("success", "Material added");
        }}
      />
    </RecordShell>
  );
}

// ── For a host that is not this page (the Today queue) ──────────────────────

/** One branding request's record, by id. */
export function RequestPeek({ id, ctx }: { id: string; ctx: PanelCtx }) {
  const jobs = useStore(brandingStore);
  const posm = useStore(posmStore);
  const campaigns = useStore(campaignsStore);
  useStore(customersStore);
  const j = jobs.find((x) => x.id === id);
  if (!j) return null;
  const p = posm.find((x) => x.id === j.posmId);
  return <RequestPanel key={j.id} r={{ j, p, cost: (p?.cost ?? 0) * j.qty, short: j.stage === "requested" && (!p || p.stock < j.qty), campaign: campaigns.find((c) => c.id === j.campaignId), customer: customerName(j.customerId) }} ctx={ctx} />;
}

export const BRANDING_ROUTES = [
  { path: "design/salesforce/branding", Component: BrandingPage },
  { path: "design/salesforce/branding/:no", Component: BrandingPage },
];
