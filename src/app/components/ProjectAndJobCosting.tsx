import "../../styles/style.css";
import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Database,
  DollarSign,
  Factory,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GitBranch,
  HardHat,
  Package,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DotGrid,
  EntityRow,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Cost Code Capture",
    desc: "Every field PO, crew timesheet and material draw carries a project and cost code as required fields cost lands on the right job the moment it's committed.",
  },
  {
    icon: DollarSign,
    title: "Live Project Margin",
    desc: "Budget, committed costs and actuals reconcile in real time against each project's P&L margin is visible today, not after billing close.",
  },
  {
    icon: Users,
    title: "Resource Management",
    desc: "Crew, equipment and subcontractor loads scheduled across the portfolio with utilisation heat maps, milestone tracking and over-allocation alerts.",
  },
  {
    icon: ShieldCheck,
    title: "Full Audit Trail",
    desc: "Every figure on the project P&L resolves to its originating PO, timesheet or material draw one click to source, no spreadsheet exports required.",
  },
  {
    icon: Receipt,
    title: "Progress Billing",
    desc: "AIA-style applications, retention tracking and milestone-based invoicing all flow from the same project cost ledger your finance team already works in.",
  },
  {
    icon: GitBranch,
    title: "WIP Accounting",
    desc: "Percent-complete revenue recognition and WIP roll-forward calculated nightly from the live cost ledger one set of numbers from estimate to final invoice.",
  },
] as const;

const METRICS = [
  {
    value: "20%",
    label: "Lift in project margin",
    desc: "Once every cost lands on a project code in real time, margin leakage closes and projects finish closer to estimate.",
  },
  {
    value: "35%",
    label: "Fewer uncaptured costs",
    desc: "Field timesheets, material draws and PO leakage captured automatically no reconciliation lag at month-end.",
  },
  {
    value: "100%",
    label: "Audit trail coverage",
    desc: "Every figure on the project margin resolves to its originating PO, timesheet or material draw fully audit-ready.",
  },
] as const;

const SOURCES_TOP = [
  { icon: Receipt,   label: "Purchase Order", sub: "Cost code · 3-way match"  },
  { icon: Users,     label: "Timesheets",     sub: "Crew hours · Burden rate" },
  { icon: Package,   label: "Material Draw",  sub: "Inventory → Project cost" },
] as const;

const SOURCES_BOTTOM = [
  { icon: Building2, label: "Subcontract",  sub: "PO · Milestone billing"  },
  { icon: Factory,   label: "Equipment",    sub: "Hire · Crane allocation"  },
  { icon: Database,  label: "Payroll",      sub: "Wages · Benefits burden" },
] as const;

const LEDGER_ROWS = [
  { time: "09:14", source: "PO #8841 · Concrete",    debit: "Job Cost",    credit: "AP",            amt: "$1,200",  fresh: true },
  { time: "09:02", source: "Timesheet · Grade II",   debit: "Labor Cost",  credit: "Wages Payable", amt: "$4,500"               },
  { time: "08:51", source: "Material · Rebar Bay 4", debit: "Job Cost",    credit: "Inventory",     amt: "$2,180"               },
  { time: "08:44", source: "Subcon · Electrical",    debit: "Subcontract", credit: "AP",            amt: "$12,400"              },
  { time: "08:38", source: "Equipment · Crane hire", debit: "Equipment",   credit: "AP",            amt: "$3,800"               },
];

// ════════════════════════════════════════════════════════════════════════════
// [HERO]
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Project & Job Costing</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            See every project's margin while the work{" "}{<br/>}
            <Heading.Muted>is happening, not after billing closes.</Heading.Muted>
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

        <div className="bz-hero-visual mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-5">
          <HeroOlivePanel />
          <HeroProjectCard />
        </div>
      </Container>
    </Section>
  );
}

function HeroOlivePanel() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive p-5 sm:col-span-2 sm:min-h-[460px]">
      <DotGrid tone="dark" />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-bz-pill bg-bz-olive-soft/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-36 rounded-bz-pill bg-bz-olive-soft/30"
      />

      <div className="relative flex h-full min-h-[280px] flex-col justify-between">
        <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/[0.55]">
          <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
          Live margin
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between rounded-bz-lg bg-bz-paper p-3 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-bz-pill border border-bz-line text-bz-text">
                <CheckCircle2 size={14} strokeWidth={2} />
              </span>
              <span className="text-[13px] font-medium text-bz-text">
                Cost capture
              </span>
            </div>
            <span className="rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">
              Auto-tagged
            </span>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-bz-lg bg-bz-deep py-3.5 text-[13.5px] font-medium text-bz-text-on-dark transition-colors hover:bg-bz-olive-dark"
          >
            View project margin
            <ArrowUpRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroProjectCard() {
  const rows = [
    { label: "Budget",    value: "$4,200,000" },
    { label: "Committed", value: "$3,180,000", muted: true },
    { label: "Variance",  value: "+$1,020,000", muted: true },
  ];
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-paper sm:col-span-3 sm:min-h-[460px]">
      <div className="flex items-center justify-between bg-bz-olive px-5 py-4">
        <span className="text-[16px] font-medium tracking-tight text-bz-text-on-dark">
          Bizak
          <sup className="ml-0.5 text-[8px] opacity-60">®</sup>
        </span>
        <div className="flex flex-col items-end gap-1.5">
          <span className="block h-[3px] w-9 rounded-bz-pill bg-white/30" />
          <span className="block h-[3px] w-7 rounded-bz-pill bg-white/20" />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Project", value: "Metropolis Tower" },
            { label: "Period",  value: "FY26 · Q2" },
          ].map((p) => (
            <div
              key={p.label}
              className="rounded-bz-md border border-bz-line-soft p-3"
            >
              <p className="text-[10px] uppercase tracking-[0.08em] text-bz-text-muted">
                {p.label}
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-bz-text">
                {p.value}
              </p>
              <span className="mt-2 block h-[3px] w-12 rounded-bz-pill bg-bz-line-soft" />
            </div>
          ))}
        </div>

        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
          Live project P&amp;L
        </p>

        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={
                i === 0
                  ? "flex items-center justify-between rounded-bz-md border border-bz-line-soft p-3"
                  : "flex items-center justify-between px-1"
              }
            >
              {i === 0 ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text">
                      <HardHat size={13} strokeWidth={1.8} />
                    </span>
                    <span className="text-[12.5px] font-medium text-bz-text">
                      {r.label}
                    </span>
                  </div>
                  <span className="text-[13px] font-medium tabular-nums text-bz-text">
                    {r.value}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[12px] text-bz-text-muted">{r.label}</span>
                  <span className="block h-[3px] w-16 rounded-bz-pill bg-bz-line-soft" />
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-1 flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-3.5">
          <span className="text-[13px] text-bz-text-muted">Live margin</span>
          <span className="text-[22px] font-medium tabular-nums text-bz-text">
            +19.4%
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] OVERVIEW
// ════════════════════════════════════════════════════════════════════════════

function OverviewSection() {
  return (
    <Section tone="a" id="features">
      <Container>
        <SectionHead
          index="01"
          label="Overview"
          title={
            <>
              A structured cost system,{" "}
              <Heading.Muted>built for project control.</Heading.Muted>
            </>
          }
          titleMaxWidth={760}
        />

        <BentoGrid cols={3}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover minHeight={220}>
              <Bento.Header
                title={title}
                icon={<Icon size={26} strokeWidth={1.4} color="#1F3422" />}
              />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] TECHNICAL SHOWCASE
// ════════════════════════════════════════════════════════════════════════════

function TechnicalShowcaseSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Technical showcase"
          title={
            <>
              High-fidelity tools{" "}
              <Heading.Muted>for the project finance team.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={2}>
          <PortfolioBento />
          <CostControlBento />
          <BudgetTrackingBento />
          <DrillThroughBento />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function PortfolioBento() {
  const rows = [
    { flag: "🏗️", name: "PRJ-0481 · Metropolis Tower",   amount: "$4.20M" },
    { flag: "🏢", name: "PRJ-0392 · Bridge Deck A",       amount: "$2.80M" },
    { flag: "🏭", name: "PRJ-0318 · Riverside Warehouse", amount: "$1.65M" },
  ];
  return (
    <Bento tone="paper" hover minHeight={360}>
      <Bento.Header
        title="Portfolio overview"
        icon={<FolderKanban size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc>
        All active projects tracked against budget in a single live margin dashboard.
      </Bento.Desc>
      <Bento.Footer tone="light" className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <EntityRow key={r.name} flag={r.flag} name={r.name} amount={r.amount} />
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function CostControlBento() {
  const rows: Array<{ abbr: string; label: string; status: "ok" | "review" | "muted" }> = [
    { abbr: "PM", label: "PM approval · all POs",   status: "ok"     },
    { abbr: "FD", label: "Finance director > $50k", status: "review" },
  ];
  return (
    <Bento tone="dark" hover dotGrid minHeight={360}>
      <Bento.Header
        title="Cost control"
        icon={<ShieldCheck size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Budget checks and conditional routing prevent over-runs before they hit the ledger.
      </Bento.Desc>
      <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-bz-md bg-white/[0.04] px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-6 items-center justify-center rounded-bz-sm bg-white/[0.06] text-[9.5px] font-semibold text-bz-leaf">
                {r.abbr}
              </span>
              <span className="text-[12px] text-bz-text-on-dark">{r.label}</span>
            </div>
            <span
              className={
                r.status === "ok"
                  ? "size-1.5 rounded-bz-pill bg-emerald-400"
                  : r.status === "review"
                  ? "size-1.5 rounded-bz-pill bg-bz-fire"
                  : "size-1.5 rounded-bz-pill bg-white/[0.22]"
              }
            />
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function BudgetTrackingBento() {
  const bars = [
    { label: "Direct labor",   pct: 72 },
    { label: "Materials",      pct: 54 },
    { label: "Subcontractors", pct: 38 },
  ];
  return (
    <Bento tone="leaf" hover minHeight={300}>
      <Bento.Header
        title="Budget tracking"
        icon={<BarChart2 size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc style={{ color: "#1F3422", opacity: 0.78 }}>
        Cost vs budget tracked live by category, with over-run alerts before they become problems.
      </Bento.Desc>
      <Bento.Footer className="bg-[rgba(31,52,34,0.08)] flex flex-col gap-2.5">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#1F3422]">
              <span>{b.label}</span>
              <span className="font-medium">{b.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-bz-pill bg-[rgba(31,52,34,0.12)]">
              <div
                className="h-full rounded-bz-pill bg-[#1F3422]"
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function DrillThroughBento() {
  const trail = [
    { trail: "Project_PnL",  ref: "#PRJ-0481" },
    { trail: "Cost_Code",    ref: "#03-300 · Concrete" },
  ];
  return (
    <Bento tone="dark" hover minHeight={300}>
      <Bento.Header
        title="Drill-through audit"
        icon={<ClipboardList size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Click any margin figure and land{<br/>}on the source transaction.
      </Bento.Desc>
      <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
        {trail.map((r) => (
          <div
            key={r.ref}
            className="flex items-center justify-between rounded-bz-md bg-white/[0.04] px-3 py-2"
          >
            <span className="text-[11.5px] text-bz-text-on-dark">{r.trail}</span>
            <span className="text-[10.5px] text-white/[0.62]">{r.ref}</span>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] AUDIT & REPORTING
// ════════════════════════════════════════════════════════════════════════════

function AuditSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Audit & reporting"
          title={
            <>
              Click any figure,{" "}
              <Heading.Muted>trace it to source.</Heading.Muted>
            </>
          }
          description="From the project margin summary down to the originating PO every number is live, traceable and audit-ready without exporting a spreadsheet."
          titleMaxWidth={780}
        />

        <BentoGrid cols={2} gap={20}>
          <AuditCell
            title="Live project P&L in one view"
            body="Budget, committed, actual and margin consolidated per project."
            visual={<ProjectPLVisual />}
          />
          <AuditCell
            title="Click any cost to reach its source"
            body="Every dollar on the margin resolves to its PO, timesheet or material draw in a single click."
            visual={<CostDrillVisual />}
          />
          <AuditCell
            title="Budget variance alerts, built in"
            body="Over-runs by cost code, category or crew surfaced automatically."
            visual={<VarianceVisual />}
          />
          <AuditCell
            title="Export for audit and billing"
            body="AIA schedules, retention reports and audit packages ready without manual assembly."
            visual={<BillingExportVisual />}
          />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function AuditCell({
  title,
  body,
  visual,
}: {
  title: string;
  body: string;
  visual: React.ReactNode;
}) {
  return (
    <Bento
      tone="paper"
      hover
      minHeight={460}
      style={{ background: "var(--bz-section-b)" }}
    >
      <div className="flex h-full flex-col items-center text-center text-wrap">
        <h3 className="bz-bento-title max-w-[440px] text-balance">{title}</h3>

        <div className="my-auto flex w-full items-center justify-center py-8">
          {visual}
        </div>

        <p className="max-w-[420px] text-[13.5px] leading-[1.65] text-bz-text-muted">
          {body}
        </p>
      </div>
    </Bento>
  );
}

// ── Audit visuals ────────────────────────────────────────────────────────────

function ProjectPLVisual() {
  return (
    <div className="w-full max-w-[300px] overflow-hidden rounded-bz-2xl bg-bz-paper-warm shadow-[0_18px_40px_-28px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between bg-bz-olive px-4 py-3">
        <span className="text-[13px] font-medium tracking-tight text-bz-text-on-dark">
          Bizak<sup className="ml-0.5 text-[7px] opacity-60">®</sup>
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className="block h-[3px] w-7 rounded-bz-pill bg-white/30" />
          <span className="block h-[3px] w-5 rounded-bz-pill bg-white/20" />
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-bz-paper p-4">
        <div className="flex items-center justify-between">
          <span className="block h-[3px] w-20 rounded-bz-pill bg-bz-line-soft" />
          <span className="text-[10.5px] uppercase tracking-[0.08em] text-bz-text-soft">
            Live margin
          </span>
        </div>
        <div className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
          <span className="block h-[3px] w-14 rounded-bz-pill bg-bz-line" />
          <span className="text-[18px] font-medium tabular-nums text-bz-text">
            +19.4%
          </span>
        </div>
      </div>
    </div>
  );
}

function CostDrillVisual() {
  const path = [
    { label: "Margin" },
    { label: "Equipment" },
    { label: "PO #8841" },
    { label: "Suncrest Agg.", final: true },
  ];
  return (
    <div className="flex max-w-[340px] flex-wrap items-center justify-center gap-1.5">
      {path.map((p, i) => (
        <React.Fragment key={p.label}>
          <span
            className={[
              "rounded-bz-md px-2.5 py-1.5 text-[11.5px] font-medium tabular-nums",
              p.final
                ? "bg-bz-olive text-bz-text-on-dark"
                : "border border-bz-line-soft bg-bz-paper text-bz-text",
            ].join(" ")}
          >
            {p.label}
          </span>
          {i !== path.length - 1 && (
            <ChevronRight size={12} strokeWidth={2.2} className="text-bz-text-soft" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function VarianceVisual() {
  const alerts = [
    { icon: AlertTriangle, title: "Labor · Grade II crew", delta: "+14%", tone: "bad"  as const },
    { icon: TrendingUp,    title: "Materials · Steel",     delta: "−8%",  tone: "good" as const },
  ];
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-2">
      {alerts.map(({ icon: Icon, title, delta, tone }) => {
        const chip =
          tone === "bad"
            ? "bg-rose-500/10 text-rose-600"
            : "bg-bz-leaf text-[#1F3422]";
        return (
          <div
            key={title}
            className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper px-3.5 py-3"
          >
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-bz-md ${chip}`}>
              <Icon size={14} strokeWidth={2} />
            </span>
            <span className="flex-1 text-left text-[12.5px] font-medium text-bz-text">
              {title}
            </span>
            <span className={`rounded-bz-pill px-2 py-0.5 text-[10.5px] font-medium tabular-nums ${chip}`}>
              {delta}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BillingExportVisual() {
  const formats = [
    { icon: FileText,        label: "AIA",   active: true },
    { icon: FileSpreadsheet, label: "Excel"               },
    { icon: BookOpen,        label: "Audit"               },
  ];
  return (
    <div className="flex w-full max-w-[320px] items-center justify-center gap-2.5">
      {formats.map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          className={[
            "flex w-[88px] flex-col items-center gap-2 rounded-bz-lg border px-3 py-4 transition-colors",
            active
              ? "border-bz-olive bg-bz-olive text-bz-text-on-dark"
              : "border-bz-line-soft bg-bz-paper text-bz-text",
          ].join(" ")}
        >
          <span
            className={[
              "flex size-9 items-center justify-center rounded-bz-md",
              active ? "bg-white/[0.08]" : "bg-bz-paper-warm",
            ].join(" ")}
          >
            <Icon size={15} strokeWidth={1.8} />
          </span>
          <span className="text-[11.5px] font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] CONNECTIVITY "One ledger. Every cost source."
// ════════════════════════════════════════════════════════════════════════════

function ConnectivitySection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHead
          index="04"
          label="Connected by design"
          tone="dark"
          title={
            <>
              One ledger.{" "}
              <Heading.Muted>Every cost source.</Heading.Muted>
            </>
          }
          description="Every field event in Bizak PO approval, timesheet submission, material draw auto-posts to the project ledger in real time."
          titleMaxWidth={760}
        />
        <div className="pb-8"></div>

        <div className="relative mx-auto max-w-[1100px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {SOURCES_TOP.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>

          <div className="hidden h-8 grid-cols-3 gap-4 sm:grid">
            {SOURCES_TOP.map((_, i) => (
              <Connector key={i} />
            ))}
          </div>

          <div className="relative my-4 overflow-hidden rounded-bz-2xl bg-bz-olive-soft p-5 sm:my-0 sm:p-7">
            <DotGrid tone="dark" />
            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire text-[#1F3422]">
                    <BookOpen size={15} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-bz-text-on-dark">Project Ledger</p>
                    <p className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                      Auto-posting engine
                    </p>
                  </div>
                </div>
                <StatusChip variant="live">Live</StatusChip>
              </div>

              <div className="overflow-x-auto rounded-bz-lg border border-white/[0.08]">
                <div className="flex flex-col">
                  {LEDGER_ROWS.map((r, i) => (
                    <div
                      key={i}
                      className={[
                        "flex items-center gap-3 px-4 py-3 min-w-[480px]",
                        i !== LEDGER_ROWS.length - 1 && "border-b border-white/[0.06]",
                        r.fresh && "bg-white/[0.04]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="w-[52px] shrink-0 text-[11px] tabular-nums text-white/[0.55]">
                        {r.time}
                      </span>
                      <span className="w-[140px] shrink-0 text-[11.5px] text-white/[0.72]">
                        {r.source}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[12px] text-white/[0.85]">
                        <span className="font-medium text-bz-text-on-dark">{r.debit}</span>
                        <span className="mx-1.5 text-white/[0.4]">→</span>
                        <span>{r.credit}</span>
                      </p>
                      <span className="w-[90px] shrink-0 text-right text-[12.5px] font-medium tabular-nums text-bz-text-on-dark">
                        {r.amt}
                      </span>
                      <span className="w-[60px] shrink-0 text-right">
                        {r.fresh ? (
                          <StatusChip variant="live">Just</StatusChip>
                        ) : (
                          <CheckCircle2 size={14} strokeWidth={1.8} className="ml-auto text-emerald-400/70" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/[0.55]">
                <span className="inline-flex items-center gap-2">
                  <CircleDollarSign size={13} strokeWidth={2} className="text-bz-fire" />
                  <span className="font-medium tabular-nums text-bz-text-on-dark">84</span> costs
                  auto-posted today
                </span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.08em]">
                  0 project codes missed
                </span>
              </div>
            </div>
          </div>

          <div className="hidden h-8 grid-cols-3 gap-4 sm:grid">
            {SOURCES_BOTTOM.map((_, i) => (
              <Connector key={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {SOURCES_BOTTOM.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function SourceChip({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-bz-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md border border-white/[0.08] bg-white/[0.06] text-white/[0.85]">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-medium text-bz-text-on-dark">{label}</p>
        <p className="truncate text-[10px] uppercase tracking-[0.08em] text-white/[0.55]">{sub}</p>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="relative flex items-center justify-center">
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.12]" />
      <span className="absolute bottom-0 size-1.5 rounded-bz-pill bg-bz-fire" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [05] METRICS
// ════════════════════════════════════════════════════════════════════════════

function MetricsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="05"
          label="Efficiency"
          title={
            <>
              Measurable impact{" "}
              <Heading.Muted>on project operations.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={3}>
          {METRICS.map((m) => (
            <Bento key={m.label} tone="paper" hover minHeight={220}>
              <div className="bz-stat-num" style={{ fontSize: 48, marginBottom: 12 }}>
                {m.value}
              </div>
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
                {m.label}
              </div>
              <Bento.Desc>{m.desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function ProjectAndJobCostingPage() {
  return (
    <main>
      <HeroSection />
      <OverviewSection />
      <TechnicalShowcaseSection />
      <AuditSection />
      <ConnectivitySection />
      <MetricsSection />
    </main>
  );
}
