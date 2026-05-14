import "../../styles/style.css";
import {
  Activity,

  Layers,
  ClipboardList,
  CalendarRange,
  Workflow,
  ShieldCheck,
  PackageCheck,
  Settings,
  Cog,
  Factory,
  Wrench,
  Gauge,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  Section,
  Container,
  SectionHead,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  HeroCanvas,
  HeroCard,
  Bento,
  BentoGrid,
  BigCard,
  DataRow,
  MiniBars,
  JournalRow,
  StatusChip,
  StripeBar,
  DotGrid,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

type WoStage = {
  number: string;
  tag: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

const WO_STAGES: WoStage[] = [
  {
    number: "01",
    tag: "Release",
    title: "BOM check, then release",
    body: "Availability ping against current stock; shortages flagged before the WO ever opens.",
    icon: ClipboardList,
  },
  {
    number: "02",
    tag: "Schedule",
    title: "Slot it across work centers",
    body: "Capacity-aware scheduler places each operation on the right machine, honouring setup time.",
    icon: CalendarRange,
  },
  {
    number: "03",
    tag: "Operate",
    title: "Run the floor in real time",
    body: "Operators clock in / out per operation; QC checkpoints catch defects at the source.",
    icon: Cog,
  },
  {
    number: "04",
    tag: "Close",
    title: "Auto-cost, auto-post",
    body: "Material, labour and overhead roll into WIP — variance journaled to finance instantly.",
    icon: PackageCheck,
  },
];

type BomNode = { label: string; code: string; level: 0 | 1 | 2; qty: number; type: "FG" | "SFG" | "RM"; ok: boolean };

const BOM: BomNode[] = [
  { label: "Hydraulic Pump Assembly", code: "FG-0201",  level: 0, qty: 1, type: "FG",  ok: true  },
  { label: "Motor Unit",              code: "SFG-0110", level: 1, qty: 1, type: "SFG", ok: true  },
  { label: "Stator Core",             code: "RM-0441",  level: 2, qty: 1, type: "RM",  ok: true  },
  { label: "Rotor Assembly",          code: "RM-0442",  level: 2, qty: 1, type: "RM",  ok: false },
  { label: "Pump Casing",             code: "SFG-0120", level: 1, qty: 1, type: "SFG", ok: true  },
  { label: "Cast Iron Body",          code: "RM-0203",  level: 2, qty: 1, type: "RM",  ok: true  },
  { label: "Fastener Pack",           code: "RM-0022",  level: 1, qty: 4, type: "RM",  ok: true  },
];

const TYPE_LABEL: Record<BomNode["type"], string> = {
  FG: "Finished Good",
  SFG: "Sub-Assembly",
  RM: "Raw Material",
};

const OEE_FACTORS = [
  { label: "Availability", value: 94, desc: "Planned vs actual uptime" },
  { label: "Performance",  value: 93, desc: "Actual vs theoretical speed" },
  { label: "Quality",      value: 99, desc: "Good units vs total produced" },
];

const OEE_KPIS = [
  { Icon: TrendingUp, label: "OEE",           value: "87.3%", sub: "+2.1% vs last month" },
  { Icon: Gauge,      label: "Avg cycle",     value: "4.2h",  sub: "0.6h under target" },
  { Icon: Activity,   label: "Throughput",    value: "2,840", sub: "Units today" },
  { Icon: ShieldCheck,label: "Scrap rate",    value: "0.8%",  sub: "Down 0.2% this quarter" },
];

const COST_BENTOS = [
  {
    tone: "dark" as const,
    icon: PackageCheck,
    title: <>Material consumption,<br />auto-posted</>,
    desc: "WO completion debits COGS / WIP and credits Inventory — quantities, lots and serials, no re-keying.",
    footer: (
      <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
        <DataRow tone="dark" label="WO-1042 closed · 50 pcs" value="auto" />
        <DataRow tone="dark" label="Inventory → WIP" value="$4,820" />
      </Bento.Footer>
    ),
  },
  {
    tone: "paper" as const,
    icon: Wrench,
    title: <>Labour & overhead,<br />rolled into WIP</>,
    desc: "Operator clock-ins and machine hours value-add to WIP at the rate you set per work centre.",
    footer: (
      <Bento.Footer tone="light" className="flex flex-col gap-1.5">
        <DataRow label="CNC Mill #1 · 6.4h" value="$512" />
        <DataRow label="Assembly · 9.2h" value="$640" />
      </Bento.Footer>
    ),
  },
  {
    tone: "leaf" as const,
    icon: TrendingUp,
    title: <>Variance journaled<br />at WO close</>,
    desc: "Actual vs standard split across material, labour and overhead — every figure drillable to the source operation.",
    footer: (
      <Bento.Footer className="bg-[rgba(31,52,34,0.08)] flex flex-col gap-1.5">
        <DataRow label="Material variance" value="−$184" />
        <DataRow label="Labour variance" value="+$92" />
      </Bento.Footer>
    ),
  },
];

// ════════════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Manufacturing module · live
          </BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Command the floor. From raw material to{" "}{<br/>}
            <Heading.Muted>finished good, on time, every run.</Heading.Muted>
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

        <HeroCanvas>
          <HeroCardWorkOrder />
          <HeroCardOee />
        </HeroCanvas>
      </Container>
    </Section>
  );
}

function HeroCardWorkOrder() {
  const ops = [
    { name: "CNC Machining", done: true },
    { name: "Assembly",      done: true },
    { name: "Painting",      done: false },
    { name: "QC final",      done: false },
  ];
  return (
    <HeroCard
      icon={<Cog size={12} />}
      title="WO-1042"
      badge="Running"
      badgeVariant="live"
      eyebrow="Hydraulic Pump · 50 pcs"
      value="62% complete"
    >
      <div className="rounded-bz-lg bg-bz-paper-warm p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-bz-text-muted">
            Operations
          </span>
          <span className="text-[10.5px] text-bz-text-muted">2 / 4</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {ops.map((o) => (
            <div key={o.name} className="flex items-center justify-between text-[11.5px]">
              <span className={o.done ? "text-bz-text" : "text-bz-text-muted"}>{o.name}</span>
              <span
                className={
                  o.done
                    ? "rounded-bz-pill bg-bz-leaf px-2 py-[1px] text-[9.5px] font-semibold text-[#1F3422]"
                    : "rounded-bz-pill border border-bz-line-soft px-2 py-[1px] text-[9.5px] font-medium text-bz-text-muted"
                }
              >
                {o.done ? "Done" : "Queued"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </HeroCard>
  );
}

function HeroCardOee() {
  return (
    <HeroCard
      icon={<Gauge size={12} />}
      title="OEE · Week 19"
      badge="Live"
      badgeVariant="live"
      eyebrow="Plant · Line A"
      value="87.3%"
    >
      <div className="rounded-bz-lg bg-bz-paper-warm p-3">
        <DataRow label="Availability · 94%" value="A" emphasis className="mb-1.5" />
        <MiniBars values={[78, 82, 85, 81, 88, 86, 87]} highlightLast />
        <div className="mt-2 flex items-center justify-between text-[10.5px] text-bz-text-muted">
          <span>Trend · 7 days</span>
          <span className="font-medium text-bz-text">World class 85%+</span>
        </div>
      </div>
    </HeroCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] WORK-ORDER LIFECYCLE — 4-stage horizontal pipeline
// ════════════════════════════════════════════════════════════════════════════

function WorkOrderLifecycleSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Work-order lifecycle"
          title={
            <>
              Every work order moves through one system,{" "}
              <Heading.Muted>from release to closing journal.</Heading.Muted>
            </>
          }
          titleMaxWidth={820}
        />

        <BentoGrid cols={4}>
          {WO_STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Bento key={s.number} tone="paper" hover minHeight={260}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1 text-[11px] font-medium text-bz-text">
                    {s.number}
                  </span>
                  <Icon size={20} strokeWidth={1.5} className="text-bz-text" />
                </div>
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
                  {s.tag}
                </div>
                <h3 className="bz-bento-title" style={{ fontSize: 18, marginTop: 6, marginBottom: 12 }}>
                  {s.title}
                </h3>
                <p className="text-[13.5px] leading-[1.6] text-bz-text-muted">{s.body}</p>
                {i < WO_STAGES.length - 1 && (
                  <div className="mt-auto hidden items-center gap-1.5 text-[10.5px] font-medium text-bz-text-muted lg:flex">
                    <span>Next</span>
                    <ArrowRight size={12} />
                  </div>
                )}
              </Bento>
            );
          })}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] BOM DEPTH — multi-level bill of materials, tied to inventory
// ════════════════════════════════════════════════════════════════════════════

function BomDepthSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Bills of material"
          title={
            <>
              Multi-level BOMs that talk to inventory{" "}
              <Heading.Muted>before a single screw is pulled.</Heading.Muted>
            </>
          }
          titleMaxWidth={780}
        />

        <BigCard
          text={{
            title: "Multi-level BOMs, version-controlled",
            body: "FG, sub-assembly, raw material — every node ties back to the same item master.",
            bullets: [
              "Availability ping against current stock at every level",
              "Version-controlled with effective dates and ECN log",
              "Component substitution + by-product handling built in",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/InventoryAndWarehouse",
              children: "See the inventory link",
            },
          }}
          visual={<BomTreeVisual />}
        />
      </Container>
    </Section>
  );
}

function BomTreeVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11.5px] text-bz-text-muted">BOM · FG-0201</div>
          <div className="text-[14px] font-medium text-bz-text">Hydraulic Pump Assembly</div>
        </div>
        <Layers size={16} className="text-bz-text" />
      </div>

      <div className="mt-3 flex gap-3 border-y border-bz-line-soft py-2.5">
        {(["FG", "SFG", "RM"] as BomNode["type"][]).map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span
              className={
                t === "FG"
                  ? "h-1.5 w-1.5 rounded-bz-pill bg-bz-olive"
                  : t === "SFG"
                  ? "h-1.5 w-1.5 rounded-bz-pill bg-bz-leaf-deep"
                  : "h-1.5 w-1.5 rounded-bz-pill bg-bz-line"
              }
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
              {TYPE_LABEL[t]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col">
        {BOM.map((n) => (
          <div
            key={n.code}
            className="flex items-center gap-2 border-b border-bz-line-soft/60 py-2 last:border-0"
            style={{ paddingLeft: n.level * 14 }}
          >
            {n.level > 0 && (
              <span className="text-[11px] text-bz-text-muted">{n.level === 2 ? "└─" : "├─"}</span>
            )}
            <span
              className={
                n.type === "FG"
                  ? "h-1.5 w-1.5 flex-shrink-0 rounded-bz-pill bg-bz-olive"
                  : n.type === "SFG"
                  ? "h-1.5 w-1.5 flex-shrink-0 rounded-bz-pill bg-bz-leaf-deep"
                  : "h-1.5 w-1.5 flex-shrink-0 rounded-bz-pill bg-bz-line"
              }
            />
            <span
              className={`flex-1 truncate text-[11.5px] ${
                n.level === 0 ? "font-semibold text-bz-text" : "text-bz-text"
              }`}
            >
              {n.label}
            </span>
            <span className="text-[10.5px] text-bz-text-muted">×{n.qty}</span>
            <span
              className={`rounded-bz-pill px-2 py-[1px] text-[9.5px] font-semibold ${
                n.ok
                  ? "bg-bz-leaf text-[#1F3422]"
                  : "bg-bz-fire text-[#1F3422]"
              }`}
            >
              {n.ok ? "In stock" : "Short"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] SHOP-FLOOR COMMAND — the marquee dark dashboard
// ════════════════════════════════════════════════════════════════════════════

function ShopFloorCommandSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="03"
          label="Shop-floor command"
          tone="dark"
          title={
            <>
              One screen for the whole plant.{" "}
              <Heading.Muted>Schedule, machines, work orders — live.</Heading.Muted>
            </>
          }
          titleMaxWidth={780}
        />

        <ShopFloorDashboard />
      </Container>
    </Section>
  );
}

function ShopFloorDashboard() {
  const stats = [
    { label: "Active work orders",   value: "47",    sub: "In progress" },
    { label: "OEE · this week",      value: "87.3%", sub: "World class 85%+", accent: true },
    { label: "Machine utilization",  value: "92%",   sub: "Plant average" },
    { label: "Output today",         value: "2,840", sub: "Units" },
  ];
  const gantt = [
    { center: "Assembly",      jobs: [{ id: "WO-1042", start: 0,  width: 37, primary: true  }, { id: "WO-1046", start: 44, width: 28, primary: false }] },
    { center: "CNC Machining", jobs: [{ id: "WO-1043", start: 8,  width: 54, primary: false }] },
    { center: "Painting",      jobs: [{ id: "WO-1041", start: 0,  width: 16, primary: false }, { id: "WO-1044", start: 22, width: 44, primary: true  }] },
    { center: "QC Station",    jobs: [{ id: "WO-1045", start: 34, width: 33, primary: false }] },
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const machines = [
    { name: "CNC Mill #1", pct: 94 },
    { name: "CNC Mill #2", pct: 71 },
    { name: "Lathe #4",    pct: 88 },
    { name: "Paint Booth", pct: 52 },
  ];
  const woFeed = [
    { id: "WO-1042", desc: "Pump Assembly · 50",  status: "Running", variant: "live"    as const },
    { id: "WO-1043", desc: "Motor Unit · 120",    status: "Queued",  variant: "neutral" as const },
    { id: "WO-1044", desc: "Casing Coat · 80",    status: "Running", variant: "live"    as const },
    { id: "WO-1045", desc: "QC Final batch #18",  status: "On hold", variant: "neutral" as const },
  ];

  return (
    <div className="relative overflow-hidden rounded-bz-2xl border border-white/[0.06] bg-bz-olive-soft p-4 md:p-6">
      <DotGrid tone="dark" />

      {/* KPI strip */}
      <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-bz-lg bg-white/[0.05] p-4">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/[0.55]">
              {s.label}
            </div>
            <div
              className={`mt-1.5 text-[24px] font-medium tracking-[-0.02em] ${
                s.accent ? "text-bz-fire" : "text-bz-text-on-dark"
              }`}
            >
              {s.value}
            </div>
            <div className="mt-1 text-[10.5px] text-white/[0.55]">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Gantt */}
      <div className="relative mt-4 rounded-bz-xl bg-white/[0.04] p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/[0.55]">
              Production schedule · Week 19
            </div>
            <div className="mt-0.5 text-[14px] text-bz-text-on-dark">
              Capacity-aware across every work centre
            </div>
          </div>
          <StatusChip variant="live">47 active</StatusChip>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[420px]">
            <div className="mb-2 grid grid-cols-[110px_1fr]">
              <div />
              <div className="grid grid-cols-5">
                {days.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-medium uppercase tracking-[0.1em] text-white/[0.45]"
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
            {gantt.map((row, ri) => (
              <div
                key={row.center}
                className={`grid grid-cols-[110px_1fr] items-center ${ri < gantt.length - 1 ? "mb-2" : ""}`}
              >
                <span className="text-[11px] font-medium text-white/[0.65]">{row.center}</span>
                <div className="relative h-[30px] overflow-hidden rounded-bz-md bg-white/[0.04]">
                  <div className="absolute inset-y-0 left-[40%] z-[2] w-px bg-bz-fire/40" />
                  {row.jobs.map((j) => (
                    <div
                      key={j.id}
                      className={`absolute top-[5px] bottom-[5px] flex items-center overflow-hidden rounded pl-2 ${
                        j.primary ? "bg-bz-fire" : "bg-bz-fire/30"
                      }`}
                      style={{ left: `${j.start}%`, width: `${j.width}%` }}
                    >
                      <span
                        className={`whitespace-nowrap text-[9.5px] font-semibold ${
                          j.primary ? "text-[#0F1411]" : "text-bz-text-on-dark"
                        }`}
                      >
                        {j.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[10.5px] text-white/[0.55]">
          <LegendDot label="In progress" className="bg-bz-fire" />
          <LegendDot label="Scheduled" className="bg-bz-fire/30" />
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-px bg-bz-fire/40" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Bottom: machine util + live WO feed */}
      <div className="relative mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-bz-xl bg-white/[0.04] p-4 md:p-6">
          <div className="mb-1 flex items-center gap-2">
            <Settings size={14} className="text-white/60" />
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/[0.55]">
              Machine utilization
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3.5">
            {machines.map((m) => (
              <div key={m.name}>
                <div className="mb-1.5 flex justify-between text-[11px]">
                  <span className="font-medium text-bz-text-on-dark">{m.name}</span>
                  <span className="text-white/[0.55]">{m.pct}%</span>
                </div>
                <StripeBar tone="dark" pct={m.pct} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-bz-xl bg-white/[0.04] p-4 md:p-6">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-white/60" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/[0.55]">
                Live work orders
              </span>
            </div>
            <span className="text-[10.5px] font-medium text-bz-fire">Streaming</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {woFeed.map((wo) => (
              <div
                key={wo.id}
                className="flex items-center gap-3 rounded-bz-lg bg-white/[0.05] px-3 py-2.5"
              >
                <span
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-bz-pill ${
                    wo.variant === "live" ? "bg-bz-fire" : "bg-white/30"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-medium text-bz-text-on-dark">{wo.id}</div>
                  <div className="truncate text-[10.5px] text-white/[0.55]">{wo.desc}</div>
                </div>
                <StatusChip variant={wo.variant}>{wo.status}</StatusChip>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1 w-3 rounded-sm ${className}`} />
      <span>{label}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [05] COSTS TO LEDGER — manufacturing cost auto-posted
// ════════════════════════════════════════════════════════════════════════════

function CostsToLedgerSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="05"
          label="Costs to ledger"
          title={
            <>
              Manufacturing isn't a silo.{" "}
              <Heading.Muted>Material, labour and variance post the right journals — the moment the WO closes.</Heading.Muted>
            </>
          }
          titleMaxWidth={880}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" withArrow href="/contact">
                Request Demo
              </Pill>
            </PillGroup>
          }
        />

        <BentoGrid cols={3}>
          {COST_BENTOS.map((b, i) => {
            const Icon = b.icon;
            const iconColor = b.tone === "dark" ? "#DBE9B8" : "#1F3422";
            return (
              <Bento key={i} tone={b.tone} hover minHeight={300} dotGrid={b.tone === "dark"}>
                <Bento.Header
                  title={b.title}
                  icon={<Icon size={22} strokeWidth={1.5} color={iconColor} />}
                />
                <Bento.Desc
                  style={b.tone === "leaf" ? { color: "#1F3422", opacity: 0.78 } : undefined}
                >
                  {b.desc}
                </Bento.Desc>
                {b.footer}
              </Bento>
            );
          })}
        </BentoGrid>

        <div className="mt-[18px] rounded-bz-2xl border border-bz-line-soft bg-bz-paper p-5 md:p-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory size={16} className="text-bz-text" />
              <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-bz-text-muted">
                Auto-posted at WO-1042 close
              </span>
            </div>
            <StatusChip variant="posted">Journaled</StatusChip>
          </div>
          <div className="flex flex-col gap-1.5">
            <JournalRow txn="Material consumption" debit="WIP" credit="Inventory" />
            <JournalRow txn="Labour absorption · 9.2h" debit="WIP" credit="Labour clearing" />
            <JournalRow txn="Overhead applied" debit="WIP" credit="Overhead clearing" />
            <JournalRow txn="WO close · 50 pcs" debit="Finished goods" credit="WIP" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ════════════════════════════════════════════════════════════════════════════

export function ManufacturingProductPage() {
  return (
    <main>
      <HeroSection />
      <WorkOrderLifecycleSection />
      <BomDepthSection />
      <ShopFloorCommandSection />
      <CostsToLedgerSection />
    </main>
  );
}
