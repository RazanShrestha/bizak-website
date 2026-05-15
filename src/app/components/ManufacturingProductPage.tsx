import "../../styles/style.css";
import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Cog,
  Factory,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Gauge,
  Layers,
  Package,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DotGrid,
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
    title: "Work Orders",
    desc: "Create, release and close production runs end-to-end BOM check, routing, QC sign-off and auto-costing in one flow.",
  },
  {
    icon: Layers,
    title: "Bills of Material",
    desc: "Multi-level FG, sub-assembly and raw-material BOMs with version control, effective dates and ECN log.",
  },
  {
    icon: CalendarRange,
    title: "Capacity Planning",
    desc: "Capacity-aware scheduler places every operation across work centres, honouring machine availability and setup time.",
  },
  {
    icon: Cog,
    title: "Shop-floor Control",
    desc: "Operators clock in per operation; QC checkpoints and scrap recording happen at the machine, not the back office.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Management",
    desc: "Inline QC gates, lot and serial traceability, and reject analysis woven into every production run.",
  },
  {
    icon: TrendingUp,
    title: "Cost Tracking",
    desc: "Material, labour and overhead roll into WIP automatically variance journaled to finance the moment the WO closes.",
  },
] as const;

const METRICS = [
  {
    value: "OEE",
    label: "Live efficiency",
    desc: "Availability × Performance × Quality tracked live across every machine and shift.",
  },
  {
    value: "Faster",
    label: "WO close",
    desc: "Auto-costing and direct ledger posting eliminate end-of-run data entry entirely.",
  },
  {
    value: "Less scrap",
    label: "Inline QC",
    desc: "Inline QC checkpoints and real-time defect capture keep scrap to a minimum.",
  },
] as const;

const SOURCES_TOP = [
  { icon: ShoppingCart, label: "Sales",       sub: "Sales order → WO trigger" },
  { icon: Package,      label: "Inventory",   sub: "Stock draw · BOM check"   },
  { icon: Layers,       label: "Engineering", sub: "BOM · Routing · ECN"      },
] as const;

const SOURCES_BOTTOM = [
  { icon: CircleDollarSign, label: "Finance",     sub: "WIP · COGS · Variance" },
  { icon: FolderKanban,     label: "Projects",    sub: "Project BOM · Cost"    },
  { icon: Wrench,           label: "Maintenance", sub: "Downtime · MTTR"       },
] as const;

const WO_EVENTS = [
  { time: "09:14", source: "WO-1042 · Release",  debit: "WIP",        credit: "Inventory",  amt: "$4,820",  fresh: true  },
  { time: "09:08", source: "WO-1042 · Labour",   debit: "Labour",     credit: "WIP",        amt: "$640"                  },
  { time: "09:01", source: "WO-1041 · Close",    debit: "Fin. Goods", credit: "WIP",        amt: "$11,200"               },
  { time: "08:55", source: "WO-1040 · Variance", debit: "Variance",   credit: "WIP",        amt: "−$184"                 },
  { time: "08:44", source: "QC · Line A",         debit: "Scrap",      credit: "WIP",        amt: "$92"                   },
];

// ════════════════════════════════════════════════════════════════════════════
// [HERO]
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Manufacturing Module</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Command the floor. From raw material to{" "}{<br/>}
            <Heading.Muted>finished good, on time, every run.</Heading.Muted>
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

        {/* Page-specific mock editorial dark panel + production card ─── */}
        <div className="bz-hero-visual mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-5">
          <HeroFloorPanel />
          <HeroProductionCard />
        </div>
      </Container>
    </Section>
  );
}

function HeroFloorPanel() {
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
          Floor status
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Running WO chip */}
          <div className="flex items-center justify-between rounded-bz-lg bg-bz-paper p-3 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-bz-pill border border-bz-line text-bz-text">
                <Cog size={14} strokeWidth={2} />
              </span>
              <span className="text-[13px] font-medium text-bz-text">
                WO-1042
              </span>
            </div>
            <span className="rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">
              Running
            </span>
          </div>

          {/* Primary action pill-dark button */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-bz-lg bg-bz-deep py-3.5 text-[13.5px] font-medium text-bz-text-on-dark transition-colors hover:bg-bz-olive-dark"
          >
            View production floor
            <ArrowUpRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroProductionCard() {
  const rows = [
    { label: "Units completed", value: "2,840" },
    { label: "In progress",    value: "",      muted: true },
    { label: "Scrap (0.8%)",   value: "",      muted: true },
  ];
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-paper sm:col-span-3 sm:min-h-[460px]">
      {/* Dark olive header strip */}
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
        {/* Plant / Week pair */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Plant", value: "Line A · B"     },
            { label: "Week",  value: "Week 19 · 2024" },
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
          Live production output
        </p>

        {/* Output rows */}
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
                      <Factory size={13} strokeWidth={1.8} />
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

        {/* OEE total row */}
        <div className="mt-1 flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-3.5">
          <span className="text-[13px] text-bz-text-muted">OEE · Week 19</span>
          <span className="text-[22px] font-medium tabular-nums text-bz-text">
            87.3%
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] FOUNDATIONS
// ════════════════════════════════════════════════════════════════════════════

function FoundationsSection() {
  return (
    <Section tone="a" id="features">
      <Container>
        <SectionHead
          index="01"
          label="Overview"
          title={
            <>
              A complete manufacturing system,{" "}
              <Heading.Muted>built for floor-to-finance control.</Heading.Muted>
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
              <Heading.Muted>for the modern factory floor.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={2}>
          <BomShowcaseBento />
          <SchedulingBento />
          <OeeBento />
          <CostPostingBento />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function BomShowcaseBento() {
  const nodes = [
    { label: "Hydraulic Pump", type: "FG",  ok: true  },
    { label: "Motor Unit",     type: "SFG", ok: true  },
    { label: "Rotor Assembly", type: "RM",  ok: false },
  ];
  return (
    <Bento tone="paper" hover minHeight={360}>
      <Bento.Header
        title="Multi-level BOM"
        icon={<Layers size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc>
        FG, sub-assembly and raw material nodes tied to the same item master version-controlled and ECN-linked.
      </Bento.Desc>
      <Bento.Footer tone="light" className="flex flex-col gap-1.5">
        {nodes.map((n) => (
          <div
            key={n.label}
            className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={
                  n.type === "FG"
                    ? "h-1.5 w-1.5 flex-shrink-0 rounded-bz-pill bg-bz-olive"
                    : n.type === "SFG"
                    ? "h-1.5 w-1.5 flex-shrink-0 rounded-bz-pill bg-bz-leaf-deep"
                    : "h-1.5 w-1.5 flex-shrink-0 rounded-bz-pill bg-bz-line"
                }
              />
              <span className="text-[12px] text-bz-text">{n.label}</span>
            </div>
            <span
              className={
                n.ok
                  ? "rounded-bz-pill bg-bz-leaf px-2 py-[1px] text-[9.5px] font-semibold text-[#1F3422]"
                  : "rounded-bz-pill bg-bz-fire px-2 py-[1px] text-[9.5px] font-semibold text-[#1F3422]"
              }
            >
              {n.ok ? "In stock" : "Short"}
            </span>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function SchedulingBento() {
  const rows: Array<{
    abbr: string;
    label: string;
    status: "ok" | "review" | "muted";
  }> = [
    { abbr: "A", label: "CNC Mill #1 · 94% util.", status: "ok"     },
    { abbr: "Q", label: "QC Station · Scheduled",  status: "review" },
  ];
  return (
    <Bento tone="dark" hover dotGrid minHeight={360}>
      <Bento.Header
        title="Capacity scheduling"
        icon={<CalendarRange size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Capacity-aware scheduler slots each operation on the right work centre, honouring setup time.
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

function OeeBento() {
  const factors = [
    { label: "Availability", pct: 94 },
    { label: "Performance",  pct: 93 },
    { label: "Quality",      pct: 99 },
  ];
  return (
    <Bento tone="leaf" hover minHeight={300}>
      <Bento.Header
        title="OEE monitoring"
        icon={<Gauge size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc style={{ color: "#1F3422", opacity: 0.78 }}>
        Availability, performance and quality tracked live OEE calculated and trended across every shift.
      </Bento.Desc>
      <Bento.Footer className="bg-[rgba(31,52,34,0.08)] flex flex-col gap-2.5">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#1F3422]">
              <span>{f.label}</span>
              <span className="font-medium">{f.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-bz-pill bg-[rgba(31,52,34,0.12)]">
              <div
                className="h-full rounded-bz-pill bg-[#1F3422]"
                style={{ width: `${f.pct}%` }}
              />
            </div>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function CostPostingBento() {
  const entries = [
    { label: "WO-1042 · Material", ref: "WIP → Inventory" },
    { label: "WO-1042 · Labour",   ref: "WIP → Wages"     },
  ];
  return (
    <Bento tone="dark" hover minHeight={300}>
      <Bento.Header
        title="Cost auto-posting"
        icon={<PackageCheck size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        WO close auto-debits COGS / WIP and credits Inventory no manual journal, no re-keying.
      </Bento.Desc>
      <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
        {entries.map((e) => (
          <div
            key={e.label}
            className="flex items-center justify-between rounded-bz-md bg-white/[0.04] px-3 py-2"
          >
            <span className="text-[11.5px] text-bz-text-on-dark">{e.label}</span>
            <span className="text-[10.5px] text-white/[0.62]">{e.ref}</span>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] REPORTING "Click any number, see its source."
// ════════════════════════════════════════════════════════════════════════════

function ReportingSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Reporting"
          title={
            <>
              Click any number,{" "}
              <Heading.Muted>see its source.</Heading.Muted>
            </>
          }
          description="From the production summary down to the originating work order every figure is live, traceable and audit-ready."
          titleMaxWidth={780}
        />

        <BentoGrid cols={2} gap={20}>
          <ReportingCell
            title="Output, scrap and WIP in one summary"
            body="Units completed, scrap count and WIP value auto-consolidated across every line, shift and work centre."
            visual={<ProductionMockVisual />}
          />
          <ReportingCell
            title="Drill from totals to WO"
            body="Every production figure resolves to its source work order in a single click."
            visual={<WoDrillVisual />}
          />
          <ReportingCell
            title="Anomaly detection, built-in"
            body="Machine downtime spikes and scrap rate shifts surfaced the moment they happen nothing falls through the cracks."
            visual={<QualityAnomalyVisual />}
          />
          <ReportingCell
            title="Export the way auditors want it"
            body="Work order summaries, batch traceability logs and production reports in PDF, Excel or XML on demand."
            visual={<ComplianceExportVisual />}
          />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function ReportingCell({
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

// ── Reporting visuals ────────────────────────────────────────────────────────

function ProductionMockVisual() {
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
          <span className="block h-[3px] w-16 rounded-bz-pill bg-bz-line-soft" />
          <span className="text-[10.5px] uppercase tracking-[0.08em] text-bz-text-soft">
            Week 19 · All lines
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
            <span className="text-[12px] text-bz-text-muted">Units completed</span>
            <span className="text-[14px] font-medium tabular-nums text-bz-text">2,840</span>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[11.5px] text-bz-text-muted">Scrap</span>
            <span className="block h-[3px] w-12 rounded-bz-pill bg-bz-line-soft" />
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[11.5px] text-bz-text-muted">WIP value</span>
            <span className="block h-[3px] w-16 rounded-bz-pill bg-bz-line-soft" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WoDrillVisual() {
  const path = [
    { label: "Output" },
    { label: "Line A" },
    { label: "CNC Mill #1" },
    { label: "WO-1042", final: true },
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

function QualityAnomalyVisual() {
  const alerts = [
    {
      icon: AlertTriangle,
      title: "Machine downtime · CNC #2",
      delta: "+12 min",
      tone: "bad" as const,
    },
    {
      icon: TrendingDown,
      title: "Scrap rate · Line A",
      delta: "−0.2%",
      tone: "good" as const,
    },
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
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-bz-md ${chip}`}
            >
              <Icon size={14} strokeWidth={2} />
            </span>
            <span className="flex-1 text-left text-[12.5px] font-medium text-bz-text">
              {title}
            </span>
            <span
              className={`rounded-bz-pill px-2 py-0.5 text-[10.5px] font-medium tabular-nums ${chip}`}
            >
              {delta}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ComplianceExportVisual() {
  const formats = [
    { icon: FileText,        label: "PDF",   active: true  },
    { icon: FileSpreadsheet, label: "Excel"                },
    { icon: BookOpen,        label: "XML"                  },
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
// [04] CONNECTIVITY "One floor. Every system."
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
              One floor.{" "}
              <Heading.Muted>Every system.</Heading.Muted>
            </>
          }
          description="Every work order event in Bizak auto-posts to costing, inventory and finance in real time."
          titleMaxWidth={760}
        />
        <div className="pb-8"></div>

        <div className="relative mx-auto max-w-[1100px]">
          {/* Top row of sources */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {SOURCES_TOP.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>

          {/* Connector row */}
          <div className="hidden h-8 grid-cols-3 gap-4 sm:grid">
            {SOURCES_TOP.map((_, i) => (
              <Connector key={i} />
            ))}
          </div>

          {/* Live WO event panel */}
          <div className="relative my-4 overflow-hidden rounded-bz-2xl bg-bz-olive-soft p-5 sm:my-0 sm:p-7">
            <DotGrid tone="dark" />
            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire text-[#1F3422]">
                    <Factory size={15} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-bz-text-on-dark">Work Order Engine</p>
                    <p className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                      Auto-costing engine
                    </p>
                  </div>
                </div>
                <StatusChip variant="live">Live</StatusChip>
              </div>

              <div className="overflow-x-auto rounded-bz-lg border border-white/[0.08]">
                <div className="flex flex-col">
                  {WO_EVENTS.map((r, i) => (
                    <div
                      key={i}
                      className={[
                        "flex items-center gap-3 px-4 py-3 min-w-[480px]",
                        i !== WO_EVENTS.length - 1 && "border-b border-white/[0.06]",
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
                  <Factory size={13} strokeWidth={2} className="text-bz-fire" />
                  <span className="font-medium tabular-nums text-bz-text-on-dark">47</span> work orders
                  active today
                </span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.08em]">
                  0 manual cost entries
                </span>
              </div>
            </div>
          </div>

          {/* Connector row */}
          <div className="hidden h-8 grid-cols-3 gap-4 sm:grid">
            {SOURCES_BOTTOM.map((_, i) => (
              <Connector key={i} />
            ))}
          </div>

          {/* Bottom row of sources */}
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
              <Heading.Muted>on manufacturing operations.</Heading.Muted>
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

export function ManufacturingProductPage() {
  return (
    <main>
      <HeroSection />
      <FoundationsSection />
      <TechnicalShowcaseSection />
      <ReportingSection />
      <ConnectivitySection />
      <MetricsSection />
    </main>
  );
}
