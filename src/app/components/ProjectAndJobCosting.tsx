import "../../styles/style.css";
import * as React from "react";
import {

  HardHat,
  ClipboardList,
  Receipt,
  CheckCircle2,
  GitBranch,
  Layers,
  CalendarRange,
  CircleDot,
} from "lucide-react";
import {
  Section,
  Container,
  SectionHead,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  StatusChip,
  StripeBar,
  StepCard,
  Bento,
  BentoGrid,
  DataRow,
  StatTile,
  Tick,
  DotGrid,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const SCOREBOARD_KPIS = [
  { label: "Budget",    value: "$4.20M", sub: "Approved" },
  { label: "Committed", value: "$3.18M", sub: "76% of budget" },
  { label: "Actual",    value: "$2.74M", sub: "Posted to GL" },
  { label: "Margin",    value: "+19.4%", sub: "↑ 2.1% vs. estimate", accent: true },
] as const;

const SCOREBOARD_PHASES = [
  { code: "PLAN",  label: "Plan",     done: true  },
  { code: "EST",   label: "Estimate", done: true  },
  { code: "TRACK", label: "Track",    active: true },
  { code: "BILL",  label: "Bill" },
] as const;

const SCOREBOARD_FEED: { txn: string; code: string; amount: string }[] = [
  { txn: "PO #8841 — Concrete (Suncrest Aggregates)", code: "Cost code 03-300", amount: "+$1,200.00" },
  { txn: "Timesheet — Grade II crew, 18h × $48",      code: "Cost code 01-115", amount: "+$4,500.00" },
  { txn: "Material draw — Rebar (Bay 4 inventory)",   code: "Cost code 03-210", amount: "+$2,180.00" },
];

const CAPTURE_STEPS: {
  number: string;
  tag: string;
  title: React.ReactNode;
  bullets: string[];
  visualKind: "po" | "time" | "material";
}[] = [
  {
    number: "01",
    tag: "Field PO",
    title: (
      <>
        Every PO is tagged to a project before it&apos;s approved,{" "}
        <Heading.Muted>so cost lands on the right job.</Heading.Muted>
      </>
    ),
    bullets: [
      "Project + cost code are required fields on the PO header.",
      "3-way match against the project budget — over-runs route for approval.",
      "Vendor invoice posts to AP and the project at the same moment.",
    ],
    visualKind: "po",
  },
  {
    number: "02",
    tag: "Timesheet",
    title: (
      <>
        Crew hours flow straight into job cost,{" "}
        <Heading.Muted>burdened with the right multiplier.</Heading.Muted>
      </>
    ),
    bullets: [
      "Mobile timesheets capture hours by project + cost code, no re-keying.",
      "Burden rates (PTO, payroll tax, equipment) auto-apply per crew.",
      "Approved hours hit Labor Cost on the project P&L the same day.",
    ],
    visualKind: "time",
  },
  {
    number: "03",
    tag: "Material",
    title: (
      <>
        Material draws charge directly to the project,{" "}
        <Heading.Muted>not the warehouse cost centre.</Heading.Muted>
      </>
    ),
    bullets: [
      "Pick from inventory against a project code — stock decrements, cost moves.",
      "Item master + project BOM keeps unit costs consistent across runs.",
      "Returns reverse cleanly; the project P&L stays accurate every step.",
    ],
    visualKind: "material",
  },
];

const RESOURCE_CREW = [
  { name: "Grade II — Civil",   load: [0.9, 1.0, 1.0, 0.8, 0.6, 0.3, 0.2] },
  { name: "MEP — Electrical",   load: [0.4, 0.6, 0.9, 1.0, 1.0, 0.7, 0.5] },
  { name: "Finish — Carpentry", load: [0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 1.0] },
  { name: "Equipment — Cranes", load: [0.6, 0.8, 0.5, 0.3, 0.2, 0.4, 0.6] },
];
const RESOURCE_WEEKS = ["W21", "W22", "W23", "W24", "W25", "W26", "W27"];

const SCHEDULE_PROJECTS = [
  { name: "Metropolis Tower",    pctStart: 8,  pctEnd: 76, status: "On track", chip: "live" as const   },
  { name: "Bridge Deck A",        pctStart: 22, pctEnd: 88, status: "Watch",     chip: "neutral" as const },
  { name: "Riverside Warehouse",  pctStart: 4,  pctEnd: 54, status: "On track", chip: "posted" as const  },
  { name: "Helio Plant Retrofit", pctStart: 40, pctEnd: 96, status: "Ahead",    chip: "live" as const   },
];

const PNL_TREE = [
  { label: "Revenue (T&M + Progress)", value: "$3.42M",       depth: 0 },
  { label: "Direct Labor",              value: "$1.18M",       depth: 1 },
  { label: "Materials",                 value: "$0.94M",       depth: 1 },
  { label: "Subcontractors",            value: "$0.42M",       depth: 1 },
  { label: "Equipment",                 value: "$0.20M",       depth: 1, active: true },
  { label: "Direct Costs",              value: "$2.74M",       depth: 0 },
  { label: "Margin",                    value: "+19.4%",       depth: 0, accent: true },
];

const DRILL_TRAIL = [
  { label: "Account",      value: "Equipment Hire" },
  { label: "Project",      value: "Metropolis Tower" },
  { label: "Cost code",    value: "01-540 · Cranes" },
  { label: "Source PO",    value: "PO #8841" },
  { label: "Vendor",       value: "Suncrest Aggregates" },
  { label: "Approver",     value: "M. Ortiz · 18 Apr 10:42" },
];

const BILLING_SCHEDULE = [
  { period: "Apr — App. #04", billed: "$420,000", earned: "$438,500", chip: "Posted" },
  { period: "May — App. #05", billed: "$510,000", earned: "$502,200", chip: "Posted" },
  { period: "Jun — App. #06", billed: "$430,000", earned: "$447,800", chip: "Draft"  },
];

const WIP_ROWS = [
  { label: "Opening WIP",       value: "$1.84M" },
  { label: "+ Costs to date",   value: "$2.74M" },
  { label: "− Recognised",      value: "$3.18M" },
  { label: "= Closing WIP",     value: "$1.40M", emphasis: true },
];

const PORTFOLIO_STATS = [
  { value: "20%",  desc: "Lift in project margin once every cost lands on a project code in real time." },
  { value: "35%",  desc: "Reduction in uncaptured field cost — timesheets, materials, PO leakage." },
  { value: "100%", desc: "Drill-through audit coverage from margin down to the originating PO." },
];

// ════════════════════════════════════════════════════════════════════════════
// HERO — project P&L scoreboard on paper (no HeroCanvas, no HeroCard)
// ════════════════════════════════════════════════════════════════════════════

function ProjectScoreboardCard() {
  return (
    <div className="bz-hero-visual mx-auto w-full max-w-[1140px] rounded-bz-3xl border border-bz-line bg-bz-surface p-5 md:p-8 shadow-[0_24px_56px_-30px_rgba(15,20,17,0.18)]">
      {/* Header row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-bz-md bg-bz-olive text-bz-fire">
            <HardHat size={18} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
              Project · PRJ-0481
            </p>
            <p className="text-[14px] font-medium text-bz-text">
              Metropolis Tower · Foundations + Core
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip variant="live">Live margin</StatusChip>
          <StatusChip variant="posted">FY26 · Q2</StatusChip>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {SCOREBOARD_KPIS.map((k) => (
          <div
            key={k.label}
            className="rounded-bz-lg border border-bz-line-soft bg-bz-paper px-4 py-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
              {k.label}
            </p>
            <p
              className={
                "mt-1.5 text-[22px] font-medium tabular-nums leading-none " +
                (k.accent ? "text-bz-leaf-deep" : "text-bz-text")
              }
            >
              {k.value}
            </p>
            <p className="mt-2 text-[11px] text-bz-text-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Phase tracker */}
      <div className="mt-6 rounded-bz-lg border border-bz-line-soft bg-bz-paper px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-medium text-bz-text">
            Phase tracker
          </p>
          <p className="text-[11px] text-bz-text-muted">
            54 days remaining · cost forecast at 92% of budget
          </p>
        </div>
        <div className="mt-4">
          <div className="relative flex justify-between">
            <div
              className="absolute left-[18px] right-[18px] top-[14px] h-px bg-bz-line"
              aria-hidden="true"
            />
            {SCOREBOARD_PHASES.map((p) => {
              const filled = p.done || p.active;
              return (
                <div key={p.code} className="relative z-10 flex flex-col items-center gap-2">
                  <span
                    className={
                      "grid size-7 place-items-center rounded-full text-[9px] font-semibold tracking-[0.04em] " +
                      (p.active
                        ? "bg-bz-olive text-bz-fire"
                        : p.done
                        ? "bg-bz-leaf text-bz-text"
                        : "bg-bz-line-soft text-bz-text-muted")
                    }
                  >
                    {p.done && !p.active ? <CheckCircle2 size={13} strokeWidth={2.2} /> : p.code.slice(0, 1)}
                  </span>
                  <span
                    className={
                      "text-[10.5px] " +
                      (filled ? "font-medium text-bz-text" : "text-bz-text-muted")
                    }
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <StripeBar pct={62} />
          </div>
        </div>
      </div>

      {/* Today's cost feed */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-medium text-bz-text">
            Today on this project
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] text-bz-text-muted">
            <CircleDot size={9} className="text-bz-leaf-deep" /> streaming
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {SCOREBOARD_FEED.map((row) => (
            <div
              key={row.txn}
              className="flex flex-col gap-1 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-bz-text">{row.txn}</span>
                <span className="text-[10.5px] text-bz-text-muted">{row.code}</span>
              </div>
              <span className="text-[12px] font-medium tabular-nums text-bz-text">{row.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectScoreboardHero() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Project margin, live every day
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            See every project&apos;s margin while the work{" "}{<br/>}
            <Heading.Muted>
              is happening not after billing closes.
            </Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill
              variant="dark"
              withArrowUpRight
              href="https://system.bizakerp.com/account/self-register"
            >
              Get Started
            </Pill>
            <Pill
              variant="light"
              withArrow
              href="/contact"
            >
              Request Demo
            </Pill>
          </PillGroup>
        </div>
        <ProjectScoreboardCard />
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CAPTURE FLOW — three StepCards: PO, Timesheet, Material draw
// ════════════════════════════════════════════════════════════════════════════

function CaptureVisualPO() {
  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
          Purchase order
        </p>
        <p className="mt-1 text-[14px] font-medium text-bz-text">PO #8841</p>
        <div className="mt-3 flex flex-col gap-1.5">
          <DataRow label="Project"   value="Metropolis Tower" />
          <DataRow label="Cost code" value="03-300 · Concrete" />
          <DataRow label="Vendor"    value="Suncrest Aggregates" />
          <DataRow label="Amount"    value="+$1,200.00" emphasis />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-2.5">
        <span className="text-[10.5px] font-medium text-bz-text">3-way match</span>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-bz-leaf-deep">
          <Tick size="sm" /> matched
        </span>
      </div>
    </div>
  );
}

function CaptureVisualTime() {
  const hours = [4, 7, 8, 8, 9, 6, 4];
  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-[12.5px] font-medium text-bz-text">
            Crew · Grade II — Civil
          </p>
          <StatusChip variant="live">Approved</StatusChip>
        </div>
        <p className="mt-1 text-[10.5px] text-bz-text-muted">
          Hours by day · burden 1.42×
        </p>
        <div className="mt-4 flex items-end gap-1.5" style={{ height: 56 }}>
          {hours.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={
                  "w-full rounded-[3px] " +
                  (i === hours.length - 2 ? "bg-bz-olive" : "bg-bz-leaf")
                }
                style={{ height: `${(h / 10) * 100}%` }}
              />
              <span className="text-[8.5px] text-bz-text-muted">M{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-bz-lg bg-bz-paper-warm px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-bz-text-muted">Hours</p>
          <p className="text-[13px] font-medium tabular-nums text-bz-text">46.0h</p>
        </div>
        <div className="rounded-bz-lg bg-bz-paper-warm px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-bz-text-muted">Burdened</p>
          <p className="text-[13px] font-medium tabular-nums text-bz-text">$3,134.40</p>
        </div>
      </div>
    </div>
  );
}

function CaptureVisualMaterial() {
  const rows = [
    { item: "Rebar #5 · 600 ft",      stock: "Bay 4", amount: "$2,180.00" },
    { item: "Anchor bolts · 240 ea",   stock: "Bay 2", amount: "$ 410.00" },
    { item: "Tie wire spool · 12 ea",  stock: "Bay 4", amount: "$  72.00" },
  ];
  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <div className="flex items-center justify-between rounded-bz-lg border border-bz-line-soft bg-bz-surface px-4 py-2.5">
        <span className="text-[11px] font-medium text-bz-text">
          Material draw · Metropolis Tower
        </span>
        <StatusChip variant="live">Posted</StatusChip>
      </div>
      <div className="rounded-bz-lg border border-bz-line-soft bg-bz-surface">
        {rows.map((r, i) => (
          <div
            key={r.item}
            className={
              "flex items-center justify-between gap-3 px-4 py-2.5 " +
              (i < rows.length - 1 ? "border-b border-bz-line-soft" : "")
            }
          >
            <div>
              <p className="text-[11.5px] font-medium text-bz-text">{r.item}</p>
              <p className="text-[10px] text-bz-text-muted">From {r.stock}</p>
            </div>
            <span className="text-[11.5px] font-medium tabular-nums text-bz-text">{r.amount}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-2.5">
        <span className="text-[10.5px] font-medium text-bz-text">
          Inventory ↓ &nbsp;·&nbsp; Project cost ↑
        </span>
        <span className="text-[10.5px] font-medium tabular-nums text-bz-leaf-deep">
          $2,662.00
        </span>
      </div>
    </div>
  );
}

function CaptureVisual({ kind }: { kind: "po" | "time" | "material" }) {
  if (kind === "po") return <CaptureVisualPO />;
  if (kind === "time") return <CaptureVisualTime />;
  return <CaptureVisualMaterial />;
}

function CostCaptureFlow() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="No leak"
          title={
            <>
              Every project cost lands on its project code{" "}
              <Heading.Muted>the moment it&apos;s committed.</Heading.Muted>
            </>
          }
          description="Field POs, crew hours and material draws all carry a project + cost code as a required field — so margin updates the same day, not after month-end reconciliation."
          titleMaxWidth={780}
        />
        <div className="flex flex-col gap-5">
          {CAPTURE_STEPS.map((s) => (
            <StepCard
              key={s.number}
              number={s.number}
              tag={s.tag}
              title={s.title}
              bullets={s.bullets}
              visual={<CaptureVisual kind={s.visualKind} />}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PORTFOLIO COMMAND — resource heatmap + milestone Gantt (12-col bento)
// ════════════════════════════════════════════════════════════════════════════

function ResourceHeatmap() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        <div className="mb-3 grid grid-cols-[140px_repeat(7,minmax(0,1fr))] gap-1.5">
          <div />
          {RESOURCE_WEEKS.map((w) => (
            <div
              key={w}
              className="text-center text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-muted"
            >
              {w}
            </div>
          ))}
        </div>
        {RESOURCE_CREW.map((crew) => (
          <div
            key={crew.name}
            className="mb-1.5 grid grid-cols-[140px_repeat(7,minmax(0,1fr))] gap-1.5"
          >
            <div className="flex items-center text-[11px] font-medium text-bz-text">
              {crew.name}
            </div>
            {crew.load.map((load, i) => {
              const isHot = load > 0.95;
              const tint = isHot
                ? "bg-bz-olive"
                : "bg-bz-leaf";
              return (
                <div
                  key={i}
                  className={"aspect-square rounded-bz-sm " + tint}
                  style={{ opacity: Math.max(0.18, load) }}
                  title={`${Math.round(load * 100)}% utilised`}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-4 flex items-center gap-4 text-[10.5px] text-bz-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-[2px] bg-bz-leaf" /> nominal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-[2px] bg-bz-olive" /> over 95%
          </span>
        </div>
      </div>
    </div>
  );
}

function MilestoneSchedule() {
  return (
    <div className="flex flex-col gap-3">
      {SCHEDULE_PROJECTS.map((p) => {
        const width = Math.max(8, p.pctEnd - p.pctStart);
        return (
          <div key={p.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-bz-text">{p.name}</span>
              <StatusChip variant={p.chip}>{p.status}</StatusChip>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-bz-pill bg-bz-paper-warm">
              <div
                className="absolute top-0 h-full rounded-bz-pill bg-bz-olive"
                style={{ left: `${p.pctStart}%`, width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-2 flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-3 py-2 text-[10.5px] text-bz-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarRange size={12} /> Window: W21 — W34
        </span>
        <span>4 active · 1 ahead · 1 watch</span>
      </div>
    </div>
  );
}

function PortfolioCommand() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Portfolio command"
          title={
            <>
              One view across crews, equipment and milestones,{" "}
              <Heading.Muted>so the next bottleneck doesn&apos;t hit you blind.</Heading.Muted>
            </>
          }
          titleMaxWidth={820}
        />
        <BentoGrid cols={12} gap={20}>
          <Bento tone="paper" hover span={7} minHeight={420}>
            <Bento.Header
              title="Resource heatmap"
              icon={<Layers size={26} strokeWidth={1.4} color="#1F3422" />}
            />
            <Bento.Desc>
              Crew and equipment load across the next seven weeks. Bizak flags any
              cell over 95% so you can re-balance before it shows up as overtime.
            </Bento.Desc>
            <div className="mt-6">
              <ResourceHeatmap />
            </div>
          </Bento>

          <Bento tone="paper" hover span={5} minHeight={420}>
            <Bento.Header
              title="Milestone schedule"
              icon={<CalendarRange size={26} strokeWidth={1.4} color="#1F3422" />}
            />
            <Bento.Desc>
              Every active project on one timeline — start, finish, slack — coloured
              by status from the same data your cost ledger sees.
            </Bento.Desc>
            <div className="mt-6">
              <MilestoneSchedule />
            </div>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DRILL-THROUGH MARGIN — dark olive, one composite drill-down mock
// ════════════════════════════════════════════════════════════════════════════

function PnLTree() {
  return (
    <div className="flex flex-col gap-1.5">
      {PNL_TREE.map((row, i) => {
        const isHeader = row.depth === 0;
        return (
          <div
            key={i}
            className={
              "flex items-center justify-between rounded-bz-lg px-4 py-3 " +
              (row.active
                ? "bg-bz-fire/20 ring-1 ring-bz-fire/60"
                : isHeader
                ? "bg-white/[0.06]"
                : "bg-white/[0.03]")
            }
            style={{ paddingLeft: 16 + row.depth * 18 }}
          >
            <span
              className={
                "text-[12.5px] " +
                (isHeader ? "font-medium text-bz-text-on-dark" : "text-white/[0.78]")
              }
            >
              {row.label}
            </span>
            <span
              className={
                "text-[12.5px] font-medium tabular-nums " +
                (row.accent ? "text-bz-fire" : "text-bz-text-on-dark")
              }
            >
              {row.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DrillPanel() {
  return (
    <div className="rounded-bz-2xl border border-white/[0.08] bg-white/[0.04] p-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/[0.62]">
          Source of truth
        </p>
        <StatusChip variant="live">Drilling</StatusChip>
      </div>
      <p className="mt-2 text-[16px] font-medium tabular-nums text-bz-text-on-dark">
        Equipment Hire · $42,800
      </p>
      <p className="mt-1 text-[11.5px] text-white/[0.6]">
        One click on the project P&amp;L resolves to the exact transaction that
        booked the cost — vendor, approver, timestamp, everything.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {DRILL_TRAIL.map((row) => (
          <DataRow
            key={row.label}
            label={row.label}
            value={row.value}
            tone="dark"
          />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-bz-lg bg-white/[0.05] px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-white/[0.72]">
          <Receipt size={12} /> Linked: AP voucher AP-1748
        </span>
        <span className="text-[10.5px] text-bz-fire">Open →</span>
      </div>
    </div>
  );
}

function DrillThroughMargin() {
  return (
    <Section tone="dark">
      <DotGrid tone="dark" />
      <Container>
        <SectionHead
          index="03"
          label="Audit trail"
          tone="dark"
          title={
            <>
              Click any number on the project P&amp;L,{" "}
              <Heading.Muted>land on the transaction that booked it.</Heading.Muted>
            </>
          }
          description="No spreadsheet exports, no support tickets to finance — every figure on the project margin resolves to its source PO, timesheet, or material draw."
          titleMaxWidth={820}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-bz-2xl border border-white/[0.08] bg-white/[0.04] p-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/[0.62]">
                Project P&amp;L · Metropolis Tower
              </p>
              <span className="text-[11px] text-white/[0.6]">FY26 · YTD</span>
            </div>
            <div className="mt-4">
              <PnLTree />
            </div>
            <p className="mt-4 text-[10.5px] text-white/[0.55]">
              Click <span className="text-bz-fire">Equipment</span> →
            </p>
          </div>
          <DrillPanel />
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WIP + BILLING + PORTFOLIO METRICS — combined section
// ════════════════════════════════════════════════════════════════════════════

function BillingScheduleVisual() {
  return (
    <div className="flex flex-col gap-2">
      {BILLING_SCHEDULE.map((p, i) => (
        <div
          key={p.period}
          className="flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-3"
        >
          <div>
            <p className="text-[11.5px] font-medium text-bz-text">{p.period}</p>
            <p className="text-[10.5px] text-bz-text-muted">
              Billed {p.billed} · earned {p.earned}
            </p>
          </div>
          <StatusChip variant={i === BILLING_SCHEDULE.length - 1 ? "neutral" : "posted"}>
            {p.chip}
          </StatusChip>
        </div>
      ))}
    </div>
  );
}

function WipRollForward() {
  return (
    <div className="flex flex-col gap-2">
      {WIP_ROWS.map((row) => (
        <DataRow
          key={row.label}
          label={row.label}
          value={row.value}
          emphasis={row.emphasis}
        />
      ))}
      <div className="mt-2 rounded-bz-lg bg-bz-paper-warm px-3 py-2.5 text-[10.5px] text-bz-text-muted">
        <span className="font-medium text-bz-text">Percent-complete</span> on
        cost-to-cost — recalculated nightly from the live cost ledger.
      </div>
    </div>
  );
}

function WipAndBilling() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Billing & WIP"
          title={
            <>
              Progress billing posts on schedule,{" "}
              <Heading.Muted>WIP rolls forward from the same ledger.</Heading.Muted>
            </>
          }
          description="AIA-style applications, retention, and revenue recognition all run off the project cost ledger — one set of numbers from estimate to final invoice."
          titleMaxWidth={780}
        />
        <BentoGrid cols={2} gap={20}>
          <Bento tone="paper" hover minHeight={360}>
            <Bento.Header
              title="Progress billing schedule"
              icon={<ClipboardList size={26} strokeWidth={1.4} color="#1F3422" />}
            />
            <Bento.Desc>
              Application-style billings flow on the milestone schedule, with
              retention held back automatically until the final draw.
            </Bento.Desc>
            <div className="mt-6">
              <BillingScheduleVisual />
            </div>
          </Bento>
          <Bento tone="paper" hover minHeight={360}>
            <Bento.Header
              title="WIP roll-forward"
              icon={<GitBranch size={26} strokeWidth={1.4} color="#1F3422" />}
            />
            <Bento.Desc>
              Costs to date, earned revenue and recognised margin — drawn from
              the same project cost ledger your PMs already work in.
            </Bento.Desc>
            <div className="mt-6">
              <WipRollForward />
            </div>
          </Bento>
        </BentoGrid>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PORTFOLIO_STATS.map((s) => (
            <StatTile key={String(s.value)} value={s.value} desc={s.desc} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ════════════════════════════════════════════════════════════════════════════

export function ProjectAndJobCostingPage() {
  return (
    <main>
      <ProjectScoreboardHero />
      <CostCaptureFlow />
      <PortfolioCommand />
      <DrillThroughMargin />
      <WipAndBilling />
    </main>
  );
}
