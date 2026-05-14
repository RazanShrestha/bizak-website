import React from "react";
import {
  Section,
  Container,
  SectionHead,
  BentoGrid,
  Bento,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  HeroCanvas,
  StatTile,
  DataRow,
  MiniBars,
  BigCard,
} from "./bz";
import {
  BarChart2,
  Layers,
  TrendingUp,
  FileSpreadsheet,

  Package,
  DollarSign,
  SlidersHorizontal,
  Eye,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const KPI_TILES = [
  { label: "Total Revenue", value: "$2.84M", delta: "+12.4%" },
  { label: "Net Margin", value: "18.4%", delta: "+2.1pp" },
  { label: "Active Orders", value: "2,841", delta: "+8.7%" },
  { label: "Cash Position", value: "$1.24M", delta: "Healthy" },
];

const HERO_BARS = [38, 45, 52, 60, 55, 68, 74, 80, 76, 85, 88, 94];

const REPORT_STREAM = [
  { name: "Executive P&L Report", time: "07:00 AM", fmt: "PDF", live: false },
  { name: "Cash Flow Summary", time: "07:05 AM", fmt: "XLS", live: false },
  { name: "AR Aging Report", time: "08:30 AM", fmt: "PDF", live: false },
  { name: "Operations Dashboard", time: "Live", fmt: null, live: true },
];

const REPORT_TYPES = [
  { abbr: "P&L", sub: "Income" },
  { abbr: "BS", sub: "Balance Sheet" },
  { abbr: "CF", sub: "Cash Flow" },
  { abbr: "AR", sub: "Aging Report" },
  { abbr: "BvA", sub: "Budget vs Actual" },
  { abbr: "TAX", sub: "Tax Summary" },
];

const SCHEDULES = [
  { name: "Executive P&L", freq: "Weekly · Mon 8AM", fmt: "PDF", to: "cfo@acmecorp.com" },
  { name: "Cash Flow Report", freq: "Daily · 7AM", fmt: "XLS", to: "finance@acmecorp.com" },
  { name: "Inventory Summary", freq: "Daily · 6AM", fmt: "CSV", to: "ops@acmecorp.com" },
];

const DRILL_CHAIN = [
  { type: "Dashboard KPI", label: "Net Income", value: "$920,400", active: true },
  { type: "P&L Report Line", label: "Marketing Expenses", value: "$48,200", active: false },
  { type: "Journal Entry", label: "JE-2841 · Auto-posted", value: "", active: false },
  { type: "Source Document", label: "Purchase Invoice PI-0492", value: "$48,200", active: false },
];

// ─── DRILL CHAIN VISUAL ───────────────────────────────────────────────────────

function DrillChainVisual() {
  return (
    <div className="flex flex-col gap-1">
      {DRILL_CHAIN.map((item, i) => (
        <React.Fragment key={item.type}>
          <div
            className={`rounded-bz-md px-4 py-3 border ${
              item.active
                ? "border-bz-fire/40 bg-bz-fire/[0.08]"
                : "border-white/[0.08] bg-white/[0.04]"
            }`}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.10em] mb-1 text-white/40">
              {item.type}
            </p>
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-[13px] font-semibold ${
                  item.active ? "text-bz-fire" : "text-white/80"
                }`}
              >
                {item.label}
              </p>
              {item.value && (
                <p
                  className={`text-[12px] font-bold shrink-0 ${
                    item.active ? "text-bz-fire" : "text-white/55"
                  }`}
                >
                  {item.value}
                </p>
              )}
            </div>
          </div>
          {i < DRILL_CHAIN.length - 1 && (
            <div className="ml-5 w-px h-3 bg-white/20" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── SCHEDULED DELIVERY VISUAL ────────────────────────────────────────────────

function ScheduledDeliveryVisual() {
  return (
    <div className="rounded-bz-lg border border-white/[0.08] bg-white/[0.04] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-white/45">
          Scheduled Reports
        </p>
      </div>
      <div className="flex flex-col divide-y divide-white/[0.06]">
        {SCHEDULES.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{s.name}</p>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">{s.to}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] text-white/40 hidden sm:block">{s.freq}</span>
              <span className="text-[9px] font-bold text-bz-fire bg-bz-fire/[0.12] px-2 py-0.5 rounded">
                {s.fmt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Analytics & Reporting</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Every number, live.{" "}
            <Heading.Muted>Every report, on demand.</Heading.Muted>
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

        <HeroCanvas>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 rounded-tl-[16px] rounded-tr-[16px] border border-b-0 border-white/[0.10] overflow-hidden">

            {/* Left — Live KPIs */}
            <div className="border-b md:border-b-0 md:border-r border-white/[0.08] px-6 pt-6 pb-0 flex flex-col">
              <div className="flex items-center gap-1.5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-bz-fire" />
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Live KPIs · All Entities
                </p>
              </div>

              <div className="flex flex-col">
                {KPI_TILES.map((kpi, i) => (
                  <div
                    key={kpi.label}
                    className={`flex items-center justify-between py-3.5 ${
                      i < KPI_TILES.length - 1 ? "border-b border-white/[0.06]" : ""
                    }`}
                  >
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-white/35 mb-1">
                        {kpi.label}
                      </p>
                      <p className="text-[20px] font-bold text-white leading-none">{kpi.value}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-bz-fire/[0.14] text-bz-fire px-2 py-1 rounded-bz-md">
                      {kpi.delta}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 pb-6 border-t border-white/[0.06] mt-4">
                <p className="text-[9px] text-white/30 uppercase tracking-[0.08em] mb-2.5">
                  Revenue trend · 12 weeks
                </p>
                <MiniBars values={HERO_BARS} tone="dark" height={32} highlightLast />
              </div>
            </div>

            {/* Right — Report stream */}
            <div className="px-6 pt-6 pb-0 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Reports · Today
                </p>
                <span className="text-[9px] font-bold text-bz-fire">47 generated</span>
              </div>

              <div className="flex flex-col flex-1">
                {REPORT_STREAM.map((r, i) => (
                  <div
                    key={r.name}
                    className={`flex items-center justify-between gap-3 py-3.5 ${
                      i < REPORT_STREAM.length - 1 ? "border-b border-white/[0.06]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          r.live ? "bg-bz-fire" : "bg-white/[0.18]"
                        }`}
                      />
                      <p
                        className={`text-[12px] truncate ${
                          r.live ? "text-white font-medium" : "text-white/60"
                        }`}
                      >
                        {r.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-white/25 hidden sm:block">{r.time}</span>
                      {r.fmt ? (
                        <span className="text-[9px] font-bold bg-white/[0.07] text-white/45 px-2 py-0.5 rounded">
                          {r.fmt}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-bz-fire/[0.15] text-bz-fire px-2 py-0.5 rounded">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 pb-6 border-t border-white/[0.06] mt-4 flex items-center justify-between">
                <p className="text-[9px] text-white/30 uppercase tracking-[0.08em]">Next delivery</p>
                <p className="text-[9px] font-semibold text-white/45">Tomorrow · 07:00 AM</p>
              </div>
            </div>

          </div>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

function RoleViewsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Dashboard flexibility"
          title={
            <>
              One system.{" "}
              <Heading.Muted>Every perspective.</Heading.Muted>
            </>
          }
          description="Bizak adapts to how your organisation works — preconfigured views for each function, personalised for every role."
        />
        <BentoGrid cols={3}>
          <Bento tone="dark" hover dotGrid>
            <Bento.Header title="Executive View" icon={<TrendingUp size={16} />} />
            <Bento.Desc>
              Board-ready P&amp;L, revenue trend, and forecast — updated the moment transactions post.
            </Bento.Desc>
            <Bento.Footer>
              <DataRow label="Net Revenue" value="$2.84M" tone="dark" emphasis />
              <DataRow label="EBITDA" value="32.4%" tone="dark" />
              <DataRow label="Forecast vs Target" value="↑ 8.2%" tone="dark" emphasis />
            </Bento.Footer>
          </Bento>

          <Bento tone="paper" hover>
            <Bento.Header title="Operations View" icon={<Package size={16} />} />
            <Bento.Desc>
              Live inventory levels, active orders, and fulfilment velocity — for ops managers who can't afford a lag.
            </Bento.Desc>
            <Bento.Footer>
              <DataRow label="Active Orders" value="2,841" />
              <DataRow label="In-transit SKUs" value="412" />
              <DataRow label="On-time Delivery" value="96.2%" emphasis />
            </Bento.Footer>
          </Bento>

          <Bento tone="paper" hover>
            <Bento.Header title="Finance View" icon={<DollarSign size={16} />} />
            <Bento.Desc>
              AP/AR aging, cash position, and budget vs. actual by cost centre — live, not last month.
            </Bento.Desc>
            <Bento.Footer>
              <DataRow label="Cash Position" value="$1.24M" emphasis />
              <DataRow label="AR Overdue" value="$38,400" />
              <DataRow label="Budget Utilisation" value="74.1%" />
            </Bento.Footer>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

function DrillDownSection() {
  return (
    <Section tone="b">
      <Container>
        <BigCard
          text={{
            title: (
              <>
                Click any number.
                <br />
                See its source.
              </>
            ),
            body: "Every KPI, every report line, every journal entry traces back to the originating transaction in one click. Not just readable — fully audit-ready.",
            bullets: [
              "Dashboard KPI → P&L line → journal entry → source invoice",
              "Every state change logged with user ID and timestamp",
              "100% audit compliance — zero unlinked transactions",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<DrillChainVisual />}
        />
      </Container>
    </Section>
  );
}

function ReportCatalogSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="02"
          label="Report library"
          title={
            <>
              40+ templates.{" "}
              <Heading.Muted>Zero setup.</Heading.Muted>
            </>
          }
          description="Every standard financial and operational report, pre-built and ready to run — or customised in minutes with the drag-and-drop builder."
        />
        <BentoGrid cols={12}>
          <Bento span={7} tone="paper" hover>
            <Bento.Header title="Built-in Report Library" icon={<FileSpreadsheet size={16} />} />
            <Bento.Desc>
              Covers every corner of your business — finance, ops, HR, and sales. No configuration required.
            </Bento.Desc>
            <Bento.Footer>
              <div className="grid grid-cols-3 gap-2">
                {REPORT_TYPES.map(({ abbr, sub }) => (
                  <div
                    key={abbr}
                    className="bg-bz-section-b border border-bz-line rounded-bz-md px-3 py-3 text-center"
                  >
                    <div className="text-[14px] font-bold text-bz-text mb-0.5">{abbr}</div>
                    <div className="text-[9px] text-bz-text-muted uppercase tracking-[0.06em]">{sub}</div>
                  </div>
                ))}
              </div>
            </Bento.Footer>
          </Bento>

          <Bento span={5} tone="dark">
            <Bento.Header title="Templates Ready" icon={<BarChart2 size={16} />} />
            <Bento.Footer>
              <StatTile
                value="40+"
                desc="Pre-built reports covering finance, ops, HR, and sales — ready in seconds, not hours of setup."
                tone="dark"
              />
            </Bento.Footer>
          </Bento>

          <Bento span={4} tone="paper" hover>
            <Bento.Header title="Custom Report Builder" icon={<SlidersHorizontal size={16} />} />
            <Bento.Desc>
              Drag-and-drop builder with conditional filters, custom groupings, and calculated columns.
            </Bento.Desc>
          </Bento>

          <Bento span={4} tone="paper" hover>
            <Bento.Header title="Role-based Views" icon={<Eye size={16} />} />
            <Bento.Desc>
              Every team member sees exactly the data relevant to their role — nothing beyond their scope.
            </Bento.Desc>
          </Bento>

          <Bento span={4} tone="paper" hover>
            <Bento.Header title="Multi-entity Reporting" icon={<Layers size={16} />} />
            <Bento.Desc>
              Consolidated and per-entity reports across all branches and subsidiaries in one click.
            </Bento.Desc>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

function AutoDeliverySection() {
  return (
    <Section tone="b">
      <Container>
        <BigCard
          reverse
          text={{
            title: (
              <>
                From entry to inbox.
                <br />
                Automatically.
              </>
            ),
            body: "Every transaction auto-syncs, KPIs update instantly, and scheduled reports land in the right inbox — on time, every time. No manual exports. No chasing.",
            bullets: [
              "Daily, weekly, or custom schedule per recipient",
              "PDF, Excel, and CSV — delivered in the right format",
              "Drill-down links preserved in every delivered report",
            ],
            cta: {
              variant: "accent",
              withArrowUpRight: true,
              href: "https://system.bizakerp.com/account/self-register",
              children: "Free Trial",
            },
          }}
          visual={<ScheduledDeliveryVisual />}
        />
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function DashboardAndReportingPage() {
  return (
    <>
      <HeroSection />
      <RoleViewsSection />
      <DrillDownSection />
      <ReportCatalogSection />
      <AutoDeliverySection />
    </>
  );
}
