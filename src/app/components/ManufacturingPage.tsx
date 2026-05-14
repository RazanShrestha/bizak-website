import {
  Activity,
  CheckCircle2,
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
  Heading,
  HeroCanvas,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatTile,
  StatusChip,
  StepCard,
  StripeBar,
} from "./bz";

// ── DATA ─────────────────────────────────────────────────────────────────────

const WORK_ORDERS = [
  { id: "WO-1204", center: "M-01 Cutting",  pct: 78 },
  { id: "WO-1205", center: "M-02 Drilling", pct: 52 },
  { id: "WO-1206", center: "M-04 QC",       pct: 100 },
];

const OEE_COMPONENTS = [
  { label: "Availability", pct: 94 },
  { label: "Performance",  pct: 93 },
  { label: "Quality",      pct: 99 },
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
    desc: "Real-time operator and machine status capture via barcode, QR and mobile — no paper travellers.",
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

// ── HERO MOCK ─────────────────────────────────────────────────────────────────

function ProductionCommandPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live · 4 work centres</StatusChip>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-bz-text-muted">OEE</span>
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

// ── HERO ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Live floor visibility, real-time costs 🏭
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Command the floor.{" "}
            <Heading.Muted>
              Hit every delivery date and know your production cost today.
            </Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">
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

// ── [01] CAPABILITIES ─────────────────────────────────────────────────────────

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The platform"
          title={<>Six modules. <Heading.Muted>One production system.</Heading.Muted></>}
          titleMaxWidth={620}
        />
        <BentoGrid cols={3}>
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <Bento.Header title={title} icon={<Icon size={16} />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ── STEP VISUALS ──────────────────────────────────────────────────────────────

// Plan — hierarchy diagram sitting directly on the panel background
function BomVisual() {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-6">

      {/* Root node */}
      <div className="flex w-full flex-col items-center">
        <div className="rounded-bz-lg border border-bz-line bg-white px-6 py-3 text-center shadow-sm">
          <div className="text-[13px] font-bold text-bz-text">FG-200 · Steel Frame</div>
          <div className="mt-0.5 text-[10px] text-bz-text-muted">Finished good · 1 EA · $7,500</div>
        </div>

        {/* Vertical stem */}
        <div className="h-7 w-px bg-bz-line" />

        {/* Horizontal rail */}
        <div className="relative flex w-full justify-around">
          <div className="absolute top-0 left-[13%] right-[13%] h-px bg-bz-line" />
          {[
            { code: "RM-4021", name: "Steel Sheet",   qty: "5 KG"   },
            { code: "RM-4022", name: "Bolt Set",      qty: "24 PCS" },
            { code: "RM-4031", name: "Bearing Seal",  qty: "2 PCS"  },
          ].map((c) => (
            <div key={c.code} className="flex flex-col items-center">
              <div className="h-6 w-px bg-bz-line" />
              <div className="rounded-bz-md border border-bz-line-soft bg-white px-3 py-2.5 text-center">
                <div className="text-[10px] font-bold text-bz-text">{c.code}</div>
                <div className="mt-0.5 text-[9px] text-bz-text-muted">{c.name}</div>
                <div className="mt-1.5 rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[9px] font-semibold text-bz-text">{c.qty}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost rollup bar */}
      <div className="flex w-full items-center justify-between rounded-bz-md border border-bz-line-soft bg-white px-4 py-2.5">
        <span className="text-[10.5px] text-bz-text-muted">Cost rollup</span>
        <span className="text-[13px] font-bold tabular-nums text-bz-text">$7,500.00</span>
      </div>
    </div>
  );
}

// Execute — open event layout directly on panel: no outer card, content owns the space
function ShopFloorVisual() {
  return (
    <div className="flex w-full flex-col gap-5">

      {/* Operator */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-bz-line bg-white text-[15px] font-bold text-bz-text">
          12
        </div>
        <div>
          <div className="text-[13px] font-semibold text-bz-text">Operator #12</div>
          <div className="text-[11px] text-bz-text-muted">M-02 Drilling · WO-1205 · 09:41:22</div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-bz-line-soft" />

      {/* Before/after progress */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-[10px] text-bz-text-muted">Before</span>
          <div className="flex-1"><StripeBar pct={45} /></div>
          <span className="w-7 text-right text-[10px] tabular-nums text-bz-text-muted">45%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-[10px] font-semibold text-bz-text">After</span>
          <div className="flex-1"><StripeBar pct={52} /></div>
          <span className="w-7 text-right text-[10px] font-semibold tabular-nums text-bz-text">52%</span>
        </div>
      </div>

      {/* Outcome */}
      <div className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-white px-4 py-2.5">
        <span className="text-[10.5px] text-bz-text-muted">Progress logged via barcode scan</span>
        <span className="text-[11px] font-bold text-bz-leaf-deep">+7 pts</span>
      </div>
    </div>
  );
}

// Inspect — open stat spotlight: number owns the space, no outer card
function QualityCheckVisual() {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-5">

      {/* Label */}
      <div className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
        First pass yield · Shift 1
      </div>

      {/* Big stat centred in the space */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="bz-stat-num" style={{ fontSize: 72, lineHeight: 1 }}>99.1%</div>
        <div className="mt-2 text-[12px] text-bz-text-muted">of units pass without rework</div>
      </div>

      {/* Three count chips */}
      <div className="grid w-full grid-cols-3 divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft bg-white">
        {[
          { label: "Inspected", val: "248" },
          { label: "Passed",    val: "246" },
          { label: "Held",      val: "2"   },
        ].map((s) => (
          <div key={s.label} className="py-3 text-center">
            <div className="text-[14px] font-bold tabular-nums text-bz-text">{s.val}</div>
            <div className="text-[9.5px] text-bz-text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── [02] HOW IT WORKS ─────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="How it works"
          title={<>From BOM to finished good — <Heading.Muted>tracked at every step.</Heading.Muted></>}
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
            title="Capture the floor in real time — no paper, no re-keying."
            bullets={["Operators log progress via barcode, QR or mobile — machine availability feeds the live OEE dashboard automatically."]}
            visual={<ShopFloorVisual />}
          />

          <StepCard
            number="03"
            tag="Inspect"
            title="Quality checkpoints built into every operation, not bolted on at the end."
            bullets={["QC holds prevent non-conforming goods from reaching dispatch — first-pass yield tracked per work order, per shift."]}
            visual={<QualityCheckVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ── [03] FLOOR-TO-LEDGER ──────────────────────────────────────────────────────

function CostJournalVisual() {
  return (
    <div className="rounded-bz-xl border border-bz-line-soft bg-bz-paper p-5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10.5px] font-semibold text-bz-text">WO-1204 · Steel Frame</span>
        <StatusChip variant="live">Completed</StatusChip>
      </div>
      <div className="mt-3 border-t border-bz-line-soft pt-3">
        <div className="mb-2.5 grid grid-cols-[1fr_auto] gap-x-6">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
            Account
          </span>
          <span className="text-right text-[9.5px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
            Amount
          </span>
        </div>
        {[
          { account: "DR  Raw Material",  amount: "5,400.00" },
          { account: "DR  Direct Labour", amount: "2,100.00" },
          { account: "CR  WIP Inventory", amount: "7,500.00" },
        ].map((row) => (
          <div key={row.account} className="grid grid-cols-[1fr_auto] gap-x-6 py-1.5">
            <span className="text-[11px] text-bz-text">{row.account}</span>
            <span className="text-right text-[11px] tabular-nums text-bz-text">{row.amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-bz-line-soft pt-2.5">
        <CheckCircle2 size={11} className="text-bz-fire" />
        <span className="text-[10px] font-medium text-bz-text-muted">
          Auto-posted to GL · 0 manual entries
        </span>
      </div>
    </div>
  );
}

function FloorToLedgerSection() {
  return (
    <Section tone="a">
      <Container>
        <BigCard
          text={{
            title: "Every completion auto-posts to the books.",
            body: "When a work order closes, Bizak debits raw material and labour, credits WIP, and posts the entry to the general ledger — automatically. Finance sees the cost the moment the floor finishes the run.",
            bullets: [
              "Actual-vs-standard variance calculated per work order in real time.",
              "Labour, material and overhead split in every journal entry.",
              "Zero re-keying between production and finance teams.",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<CostJournalVisual />}
        />
      </Container>
    </Section>
  );
}

// ── [04] METRICS ──────────────────────────────────────────────────────────────

function MetricsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="The results"
          title={<>Numbers manufacturers <Heading.Muted>actually move.</Heading.Muted></>}
          titleMaxWidth={540}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile value="87.4%" desc="Average OEE across Bizak-managed production lines." />
          <StatTile value="96.2%" desc="On-time delivery rate — schedule adherence across shifts." />
          <StatTile value="40%"   desc="Reduction in manual data-entry errors after go-live." />
          <StatTile value="0"     desc="Manual journal entries required at production close." />
        </div>
      </Container>
    </Section>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export function ManufacturingPage() {
  return (
    <main>
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <FloorToLedgerSection />
      <MetricsSection />
    </main>
  );
}
