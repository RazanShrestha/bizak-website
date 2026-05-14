import {
  Activity,
  ClipboardList,
  Factory,
  PackageSearch,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  BigCard,
  Container,
  DataRow,
  DotGrid,
  Heading,
  HeroCanvas,
  JournalRow,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StepCard,
  StripeBar,
  Tick,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════════

const WORK_ORDERS = [
  { id: "WO-1204", center: "M-01 Cutting",  pct: 78  },
  { id: "WO-1205", center: "M-02 Drilling", pct: 52  },
  { id: "WO-1206", center: "M-04 QC",       pct: 100 },
];

const OEE_COMPONENTS = [
  { label: "Availability", pct: 94 },
  { label: "Performance",  pct: 93 },
  { label: "Quality",      pct: 99 },
];

const MACHINES = [
  { id: "M-01", badge: "C", name: "Cutting",  status: "Running", pct: 78 },
  { id: "M-02", badge: "D", name: "Drilling", status: "Running", pct: 52 },
];

const FLOOR_EVENTS = [
  { id: "WO-1204", what: "Work order · Cutting",     flow: "WIP posted · $5,400",  t: "2m" },
  { id: "WO-1205", what: "Operator scan · Drilling", flow: "Progress 45% → 52%",   t: "5m" },
];

const CAPABILITIES = [
  {
    icon: ClipboardList,
    title: "Work Order Management",
    desc: "Create, schedule and track production orders end-to-end. Real-time status across every work centre and shift.",
  },
  {
    icon: PackageSearch,
    title: "Bill of Materials",
    desc: "Multi-level BOM with version control, automatic cost rollup and configurable substitution rules.",
  },
  {
    icon: Activity,
    title: "MRP Automation",
    desc: "Demand-driven planning that auto-generates time-phased purchase requests from live production schedules.",
  },
  {
    icon: Factory,
    title: "Shop Floor Control",
    desc: "Real-time operator and machine status capture via barcode, QR and mobile no paper travellers.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Management",
    desc: "Inline inspection checkpoints, defect logging and QC hold workflows at every operation.",
  },
  {
    icon: Settings2,
    title: "Cost Intelligence",
    desc: "Live actual-vs-standard variance per order with automatic posting to the general ledger.",
  },
];

const BOM_COMPONENTS = [
  { code: "RM-4021", name: "Steel Sheet",  qty: "5 KG"   },
  { code: "RM-4022", name: "Bolt Set",     qty: "24 PCS" },
  { code: "RM-4031", name: "Bearing Seal", qty: "2 PCS"  },
];

const COMPLETED_ORDERS = [
  { ref: "WO-1204", desc: "Steel Frame · 240 EA",    status: "Auto-posted" },
  { ref: "WO-1203", desc: "Shaft Assembly · 80 EA",  status: "Auto-posted" },
];

const COST_SPLIT = ["Labour", "Material", "Overhead"];

// ════════════════════════════════════════════════════════════════════════════
// HERO MOCK
// ════════════════════════════════════════════════════════════════════════════

function ProductionCommandPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live · 4</StatusChip>
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-bold tabular-nums text-bz-text">87.4%</span>
          <span className="text-[10px] font-semibold text-bz-leaf-deep">↑ +3.1%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-bz-line-soft sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Active Work Orders
          </p>
          <div className="flex flex-col gap-4">
            {WORK_ORDERS.map((wo) => (
              <div key={wo.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-medium text-bz-text">{wo.id}</span>
                  <span className="text-[10px] text-bz-text-muted">{wo.center}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <StripeBar pct={wo.pct} />
                  </div>
                  <span className="w-8 text-right text-[10.5px] font-semibold tabular-nums text-bz-text">
                    {wo.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            OEE Breakdown
          </p>
          <div className="flex flex-col gap-4">
            {OEE_COMPONENTS.map((c) => (
              <div key={c.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] text-bz-text-muted">{c.label}</span>
                  <span className="text-[10.5px] font-semibold tabular-nums text-bz-text">{c.pct}%</span>
                </div>
                <StripeBar pct={c.pct} />
              </div>
            ))}
            <div className="mt-0.5 flex items-center justify-between border-t border-bz-line-soft pt-3">
              <span className="text-[10.5px] text-bz-text-muted">Composite OEE</span>
              <span className="text-[11px] font-bold tabular-nums text-bz-text">87.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Floor to Finance
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Command the floor. Ship on time and{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>
              know every production cost.
            </Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        <HeroCanvas className="flex flex-col !p-0 [&>.bz-hero-cards]:flex-1 [&>.bz-hero-cards]:flex [&>.bz-hero-cards]:flex-col [&>.bz-hero-cards]:items-stretch">
          <div className="flex flex-1 flex-col p-[56px] max-[720px]:p-9 max-[480px]:p-4">
            <ProductionCommandPanel />
          </div>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] THE PLATFORM machine status map + event feed + feature bentos
// ════════════════════════════════════════════════════════════════════════════

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The platform"
          title={<>Six modules. <Heading.Muted>One production system.</Heading.Muted></>}
          titleMaxWidth={620}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" href="/contact">Request Demo</Pill>
            </PillGroup>
          }
        />

        <ProductionFloorMap />

        <BentoGrid cols={3} className="mt-[18px]">
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover minHeight={200}>
              <Bento.Header title={title} icon={<Icon size={22} strokeWidth={1.4} color="#1F3422" />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function ProductionFloorMap() {
  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
      {/* Machine status dark olive panel */}
      <div className="relative flex flex-col overflow-hidden rounded-bz-2xl bg-bz-olive p-7">
        <DotGrid tone="dark" />
        <div className="relative flex flex-col flex-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/[0.55]">
              Production floor · all centres
            </div>
            <StatusChip variant="live">Live</StatusChip>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {MACHINES.map((m) => (
              <div
                key={m.id}
                className="rounded-bz-xl border border-white/[0.06] bg-white/[0.04] p-3.5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-bz-pill bg-bz-leaf text-[10.5px] font-semibold text-[#1F3422]">
                      {m.badge}
                    </span>
                    <span className="text-[11.5px] font-medium text-bz-text-on-dark">
                      {m.id} · {m.name}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-white/[0.72]">{m.status}</span>
                </div>
                <StripeBar pct={m.pct} tone="dark" />
                <div className="mt-1.5 text-[10px] text-white/[0.55]">
                  Completion {m.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floor event feed light panel */}
      <div className="rounded-bz-2xl border border-bz-line-soft bg-bz-paper p-6">
        <div className="mb-4 flex items-start justify-between gap-3 pb-24">
          <div>
            <div className="text-[11px] text-bz-text-muted">Floor event feed</div>
            <div className="bz-stat-num" style={{ fontSize: 20 }}>last 60 seconds</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-bz-pill bg-bz-leaf-deep" />
            <span className="text-[10.5px] font-medium text-bz-text">Streaming</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {FLOOR_EVENTS.map((f) => (
            <div key={f.id} className="rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11.5px] font-medium text-bz-text">{f.id}</span>
                <span className="text-[10.5px] text-bz-text-muted">{f.t}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <span className="text-[11px] text-bz-text-muted">{f.what}</span>
                <span className="text-[10.5px] text-bz-text">{f.flow}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP VISUALS
// ════════════════════════════════════════════════════════════════════════════

function BomVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">BOM · FG-200 · Steel Frame</span>
        <span className="rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10px] font-semibold text-bz-text">
          v3.2
        </span>
      </div>
      <div className="mb-2 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="text-[11.5px] font-medium text-bz-text">FG-200 · Steel Frame</div>
        <div className="text-[10.5px] text-bz-text-muted">Finished good · 1 EA</div>
      </div>
      <div className="mb-3 ml-3 flex flex-col gap-1.5 border-l border-bz-line-soft pl-3">
        {BOM_COMPONENTS.map((c) => (
          <div
            key={c.code}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <span className="text-[11px] font-medium text-bz-text">{c.code}</span>
            <span className="text-[10.5px] text-bz-text-muted">{c.name} · {c.qty}</span>
          </div>
        ))}
      </div>
      <DataRow label="Cost rollup" value="$7,500.00" emphasis />
    </div>
  );
}

function ShopFloorVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">WO-1205 · M-02 Drilling</span>
        <StatusChip variant="live">Live</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="mb-0.5 text-[11.5px] font-medium text-bz-text">Operator #12</div>
        <div className="text-[10.5px] text-bz-text-muted">09:41:22 · barcode scan</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] text-bz-text-muted">Before</span>
          <div className="flex-1"><StripeBar pct={45} /></div>
          <span className="w-7 text-right text-[10px] tabular-nums text-bz-text-muted">45%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] font-semibold text-bz-text">After</span>
          <div className="flex-1"><StripeBar pct={52} /></div>
          <span className="w-7 text-right text-[10px] font-semibold tabular-nums text-bz-text">52%</span>
        </div>
      </div>
      <div className="mt-3">
        <DataRow label="Progress logged via" value="barcode scan" />
      </div>
    </div>
  );
}

function QualityCheckVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">First pass yield · Shift 1</span>
        <StatusChip variant="posted">Passed</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-4 py-3 text-center">
        <div className="bz-stat-num" style={{ fontSize: 32 }}>99.1%</div>
        <div className="text-[10.5px] text-bz-text-muted">of units without rework</div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft">
        {[
          { label: "Inspected", val: "248" },
          { label: "Passed",    val: "246" },
          { label: "Held",      val: "2"   },
        ].map((s) => (
          <div key={s.label} className="py-2 text-center">
            <div className="text-[13px] font-bold tabular-nums text-bz-text">{s.val}</div>
            <div className="text-[9.5px] text-bz-text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] HOW IT WORKS
// ════════════════════════════════════════════════════════════════════════════

function HowItWorksSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="How it works"
          title={<>From BOM to finished good <Heading.Muted>tracked at every step.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Plan"
            title="Define your BOM and production schedule."
            bullets={["Multi-level bill of materials with version control, full cost rollup, and MRP-driven purchase requests."]}
            visual={<BomVisual />}
          />
          <StepCard
            number="02"
            tag="Execute"
            title="Capture the floor in real time no paper, no re-keying."
            bullets={["Operators log progress via barcode, QR or mobile machine availability feeds the live OEE dashboard automatically."]}
            visual={<ShopFloorVisual />}
          />
          <StepCard
            number="03"
            tag="Inspect"
            title="Quality checkpoints built into every operation, not bolted on at the end."
            bullets={["QC holds prevent non-conforming goods from reaching dispatch first-pass yield tracked per work order, per shift."]}
            visual={<QualityCheckVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] FLOOR TO LEDGER
// ════════════════════════════════════════════════════════════════════════════

function CostJournalVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="text-[11.5px] text-bz-text-muted">WO completions · today</div>
        <Factory size={16} color="#1F3422" />
      </div>
      <div className="bz-stat-num" style={{ fontSize: 28 }}>$0</div>
      <div className="mb-4 pb-6 text-[11px] text-bz-text-muted">Manual entries at production close</div>

      <div className="flex flex-col gap-1.5">
        {COMPLETED_ORDERS.map((r) => (
          <div
            key={r.ref}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Tick size="sm" />
              <span className="text-[11px] font-medium text-bz-text">{r.ref}</span>
              <span className="truncate text-[10.5px] text-bz-text-muted">{r.desc}</span>
            </div>
            <span className="text-[10.5px] font-medium text-bz-text">{r.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 pt-8">
        {COST_SPLIT.map((m) => (
          <span
            key={m}
            className="rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1 text-[10.5px] font-medium text-bz-text"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function FloorToLedgerSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Floor to ledger"
          title={<>Every completion, <Heading.Muted>posted to the books automatically.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <BigCard
          text={{
            title: "Every completion auto-posts to the books.",
            bullets: [
              "Actual-vs-standard variance calculated per work order in real time.",
              "Labour, material and overhead split in every journal entry.",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Talk to Sales" },
          }}
          visual={<CostJournalVisual />}
        />
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] PRODUCTION, ON ONE LEDGER
// ════════════════════════════════════════════════════════════════════════════

function OneLedgerSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="04"
          label="One ledger"
          tone="dark"
          title={<>Every production event, <Heading.Muted>auto-posted to the same ledger that closes the books.</Heading.Muted></>}
          titleMaxWidth={780}
        />

        <BentoGrid cols={3}>
          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Material issue →<br />WIP charged</>}
              icon={<Factory size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Raw material issues debit WIP at standard cost the moment the operator scans.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="WO-1204 · issue" debit="WIP Inventory" credit="Raw Material" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Work order close →<br />FG recognised</>}
              icon={<PackageSearch size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Closing the order credits WIP and debits Finished Goods zero manual entries.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="WO-1204 · close" debit="Finished Goods" credit="WIP Inventory" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Variance →<br />GL auto-posted</>}
              icon={<Activity size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Actual-vs-standard difference posts to the variance account on work order close.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="WO-1204 · variance" debit="Mfg variance" credit="WIP Inventory" />
            </Bento.Footer>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function ManufacturingPage() {
  return (
    <main>
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <FloorToLedgerSection />
      <OneLedgerSection />
    </main>
  );
}
