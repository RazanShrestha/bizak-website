import "../../styles/style.css";
import type { ReactNode } from "react";
import {
  DollarSign, ShoppingCart, Package, Zap, BarChart3, Plug,
  TrendingUp, AlertTriangle, FileSpreadsheet, Puzzle,
  RefreshCw, Settings, Users, CheckCircle, Rocket,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Container, Section, SectionHeading, Button, Card,
  IconBadge, PillBadge, HeroPanel, HeroBadge,
} from "./marketing";

// ─── Hero panel ───────────────────────────────────────────────────────────────

const METRICS = [
  { label: "Revenue",   value: "$84K",  unit: "MRR",     active: true  },
  { label: "Customers", value: "1,240", unit: "Active",  active: true  },
  { label: "Orders",    value: "328",   unit: "This Wk", active: true  },
  { label: "Stock",     value: "98.2%", unit: "Health",  active: false },
];

const RECENT_INVOICES = [
  { id: "INV-0041", client: "Nova Tech",   amount: "$3,400", paid: true  },
  { id: "INV-0042", client: "Pixel Works", amount: "$1,850", paid: false },
  { id: "INV-0043", client: "Blue Shift",  amount: "$6,200", paid: true  },
];

const MODULE_HEALTH = [
  { label: "Finance",   pct: 100 },
  { label: "Inventory", pct: 100 },
  { label: "Sales CRM", pct: 85  },
];

function BusinessOverviewPanel() {
  return (
    <Card tone="dark" pad="md" className="w-full">
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400/50" />
          <div className="w-2 h-2 rounded-full bg-amber-400/50" />
          <div className="w-2 h-2 rounded-full bg-green-400/50" />
        </div>
        <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-bz-sage/65">Bizak · Business Overview</span>
        <div className="flex items-center gap-1.5">
          <div className="biz-pulse-glow w-1.5 h-1.5 rounded-full bg-bz-accent" />
          <span className="text-[9px] font-bold tracking-[0.1em] text-bz-sage uppercase">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {METRICS.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center border ${
              m.active ? "border-bz-accent/50 bg-bz-accent/[0.06]" : "border-bz-sage/[0.18] bg-bz-sage/[0.03]"
            }`}>
              {m.active
                ? <TrendingUp size={13} className="text-bz-sage" strokeWidth={1.8} />
                : <BarChart3 size={13} className="text-white/40" strokeWidth={1.8} />
              }
            </div>
            <span className={`text-[10px] font-bold ${m.active ? "text-white" : "text-white/40"}`}>{m.value}</span>
            <span className="text-[7px] font-bold uppercase tracking-wider text-white/40">{m.unit}</span>
            <span className="text-[7px] text-white/25 tracking-wide">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3.5 flex flex-col gap-2 mb-4">
        {RECENT_INVOICES.map((inv) => (
          <div key={inv.id} className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-bz-sage/70 min-w-[58px]">{inv.id}</span>
            <span className="text-[9px] text-white/50 flex-1">{inv.client}</span>
            <span className="text-[9px] font-bold text-white/80 min-w-[36px] text-right">{inv.amount}</span>
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
              inv.paid ? "bg-bz-accent/15 text-bz-sage" : "bg-amber-400/10 text-amber-400"
            }`}>{inv.paid ? "Paid" : "Pending"}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3.5 flex flex-col gap-2">
        {MODULE_HEALTH.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-bold text-white/60">{m.label}</span>
              <span className="text-[9px] font-bold text-bz-accent">{m.pct}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-bz-accent rounded-full" style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <HeroPanel
      badge={<HeroBadge tone="dark">ERP for Startups & SMEs</HeroBadge>}
      title={<>Launch Fast.<br /><span className="text-bz-accent">Scale</span> Without Limits.</>}
      description="Replace your spreadsheets and disconnected tools with a single, pre-configured ERP built for growing businesses. Go live in days — not months — and scale every module as your team grows."
      actions={
        <>
          <Button variant="accent" size="lg" href="/contact" withArrow>Start Free Trial</Button>
          <Button variant="ghostDark" size="lg" href="/contact">See How It Works</Button>
        </>
      }
      stats={[
        { value: "3 Days",  label: "Average Go-Live"   },
        { value: "5,000+", label: "SMEs Running Bizak" },
      ]}
      panel={<BusinessOverviewPanel />}
    />
  );
}

// ─── Challenges ───────────────────────────────────────────────────────────────

type ChallengeItem = { icon: LucideIcon; title: string; desc: string; footer: ReactNode };

const CHALLENGES: ChallengeItem[] = [
  {
    icon: FileSpreadsheet,
    title: "Spreadsheet Overload",
    desc: "Critical data scattered across dozens of Excel sheets leads to version conflicts, errors, and decisions made on outdated numbers.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "Sales_Q1_FINAL.xlsx",      error: true  },
          { label: "Inventory_v7_ACTUAL.xlsx",  error: true  },
          { label: "Finance_Mar_CORRECT.xlsx",  error: false },
        ].map((f) => (
          <div key={f.label} className={`flex items-center gap-2 px-2 py-1 rounded-md ${f.error ? "bg-red-50" : "bg-bz-bg"}`}>
            <Package size={10} className={f.error ? "text-red-400 shrink-0" : "text-bz-sage shrink-0"} strokeWidth={1.8} />
            <span className={`text-[8px] font-mono flex-1 truncate ${f.error ? "text-red-400" : "text-bz-text-muted"}`}>{f.label}</span>
            {f.error && <span className="text-[8px] font-bold text-red-400">Conflict</span>}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Zero Real-Time Visibility",
    desc: "Finance closes monthly, inventory is counted quarterly. By the time you see a problem, the damage is already done.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "Cash Position",  lag: "30 days stale" },
          { label: "Stock Levels",   lag: "3 wks stale"   },
          { label: "Sales Pipeline", lag: "14 days stale" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-[9px] text-bz-text-muted">{row.label}</span>
            <span className="text-[9px] font-bold text-red-400">{row.lag}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide">No live data</span>
        </div>
      </div>
    ),
  },
  {
    icon: DollarSign,
    title: "Cash Flow Blind Spots",
    desc: "Chasing overdue invoices manually, missing payment reminders, and losing track of outstanding payables drains cash without warning.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "Overdue >60d",   amount: "$12,400", critical: true  },
          { label: "Overdue >30d",   amount: "$8,700",  critical: true  },
          { label: "Due this week",  amount: "$5,200",  critical: false },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className={`text-[9px] ${item.critical ? "text-red-400" : "text-bz-text-muted"}`}>{item.label}</span>
            <span className={`text-[9px] font-bold ${item.critical ? "text-red-400" : "text-bz-sage"}`}>{item.amount}</span>
          </div>
        ))}
        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide mt-1">$26K uncollected</span>
      </div>
    ),
  },
  {
    icon: Package,
    title: "Inventory Guesswork",
    desc: "Overstocking wastes capital while stockouts kill sales. Without live inventory data, every purchase order is a gamble.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { sku: "SKU-1102", name: "Blue T-Shirt M",  level: 5,   critical: true  },
          { sku: "SKU-1103", name: "Running Shoes L", level: 148, critical: false },
          { sku: "SKU-1104", name: "Wireless Mouse",  level: 2,   critical: true  },
        ].map((m) => (
          <div key={m.sku}>
            <div className="flex justify-between mb-1">
              <span className="text-[8px] text-bz-text-muted font-mono">{m.sku}</span>
              <span className={`text-[8px] font-bold ${m.critical ? "text-red-400" : "text-bz-sage"}`}>
                {m.level} units{m.critical ? " ⚠" : ""}
              </span>
            </div>
            <div className="h-1 bg-bz-bg rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${m.critical ? "bg-red-400" : "bg-bz-sage"}`}
                style={{ width: `${Math.min((m.level / 150) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Puzzle,
    title: "App Sprawl",
    desc: "Accounting in QuickBooks, CRM in HubSpot, inventory in a separate tool — each integration is a fragile bridge that breaks at the worst time.",
    footer: (
      <div className="mt-auto pt-4 border-t border-bz-border">
        <div className="flex items-center justify-center mb-3">
          {["QB", "HS", "SH", "GS"].map((app, i) => (
            <div key={app} className="flex items-center">
              <div className="w-7 h-7 rounded-lg bg-bz-bg border border-bz-border flex items-center justify-center">
                <span className="text-[8px] font-bold text-bz-sage">{app}</span>
              </div>
              {i < 3 && <div className="w-4 h-px bg-red-300" />}
            </div>
          ))}
        </div>
        <p className="text-center text-[9px] font-bold text-red-400 uppercase tracking-wide">4 tools, 0 single source of truth</p>
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    title: "Scaling Breaks Everything",
    desc: "What worked at 10 employees implodes at 50. Manual approvals, ad-hoc reporting, and copy-paste workflows collapse under growth pressure.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "Manual Processes", pct: 94 },
          { label: "Auto Workflows",   pct: 12 },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-bz-text-muted uppercase tracking-wide min-w-[88px]">{row.label}</span>
            <div className="flex-1 h-1.5 bg-bz-bg rounded overflow-hidden">
              <div className="h-full bg-red-300/60 rounded" style={{ width: `${row.pct}%` }} />
            </div>
            <span className="text-[8px] font-bold text-red-400">{row.pct}%</span>
          </div>
        ))}
        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide mt-1">Growth bottleneck detected</span>
      </div>
    ),
  },
];

function ChallengesSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Challenges"
          title="Spreadsheets and patchwork tools are holding your growth back"
          description="Manual processes and disconnected apps work at ten employees. At fifty, they collapse — and your team pays the price."
          maxWidth={680}
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHALLENGES.map(({ icon: ChalIcon, title, desc, footer }) => (
            <Card key={title} tone="soft" className="flex flex-col">
              <IconBadge tone="sage" size="md" className="mb-4">
                <ChalIcon className="size-5" />
              </IconBadge>
              <h3 className="text-[17px] font-bold text-bz-text mb-2">{title}</h3>
              <p className="text-[14px] text-bz-text-muted leading-[1.6]">{desc}</p>
              {footer}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Solution ─────────────────────────────────────────────────────────────────

type SolutionItem = { icon: LucideIcon; title: string; desc: string };

const SOLUTIONS: SolutionItem[] = [
  { icon: DollarSign,   title: "Financial Management",   desc: "Automated bookkeeping, invoicing, payables, and real-time P&L — your finance team gets hours back every week." },
  { icon: ShoppingCart, title: "Sales & CRM",            desc: "Manage your pipeline, quotes, orders, and customer relationships in a single unified view. Never lose a deal again." },
  { icon: Package,      title: "Inventory & Warehouse",  desc: "Real-time stock levels, automated reorder points, and multi-location support that scales with your business." },
  { icon: Zap,          title: "Workflow Automation",    desc: "Auto-approve purchase orders, send payment reminders, and trigger alerts — cut hours of manual admin every week." },
  { icon: BarChart3,    title: "Dashboards & Reporting", desc: "One live dashboard for revenue, cash, inventory, and sales. Real-time numbers, not last month's exports." },
  { icon: Plug,         title: "Integrations",           desc: "Connect your bank, Shopify, Stripe, and other tools in minutes. Bizak becomes the backbone of your entire stack." },
];

function SolutionSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="The Solution"
          title="Everything a growing business needs — in one place"
          align="center"
          className="mb-16"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SOLUTIONS.map(({ icon: SolIcon, title, desc }) => (
            <div key={title} className="flex flex-col">
              <IconBadge tone="sage" size="md" className="mb-4">
                <SolIcon className="size-5" />
              </IconBadge>
              <h4 className="text-[17px] font-bold text-bz-text mb-2">{title}</h4>
              <p className="text-[14px] text-bz-text-muted leading-[1.7]">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

const INVOICES_TABLE = [
  { inv: "INV-0041", customer: "Nova Tech",   amt: "$3,400", paid: true  },
  { inv: "INV-0042", customer: "Pixel Works", amt: "$1,850", paid: false },
  { inv: "INV-0043", customer: "Blue Shift",  amt: "$6,200", paid: true  },
];

const SETUP_STEPS = [
  { step: "01", module: "Finance",   status: "DONE",    ok: true  },
  { step: "02", module: "Inventory", status: "DONE",    ok: true  },
  { step: "03", module: "Sales CRM", status: "ACTIVE",  ok: true  },
  { step: "04", module: "Reporting", status: "PENDING", ok: false },
];

const FINANCE_STATS: [string, string][] = [
  ["99.4%", "Auto-Match"],
  ["2 hrs",  "Month Close"],
  ["$0",     "Manual Entry"],
];

function CapabilitiesSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="Designed for speed. Built for scale."
          tone="light"
          maxWidth={560}
          className="mb-16"
        />

        <div className="grid grid-cols-6 gap-4">

          {/* Live Business Dashboard */}
          <div className="col-span-6">
            <Card tone="dark" pad="lg" className="min-h-[260px]">
              <div className="flex items-start gap-12 flex-wrap">
                <div className="shrink-0">
                  <div className="text-[42px] font-bold text-white leading-tight">$84K</div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/45 mt-2">Monthly Revenue</p>
                  <div className="flex gap-7 mt-5">
                    {[{ val: "+38%", lbl: "MoM Growth" }, { val: "1,240", lbl: "Active Customers" }].map((s) => (
                      <div key={s.lbl}>
                        <div className="text-[22px] font-bold text-bz-accent">{s.val}</div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35 mt-1">{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-[240px]">
                  <h4 className="text-[18px] font-bold text-white mb-2">Live Business Dashboard</h4>
                  <p className="text-[13px] text-white/50 leading-[1.6] mb-5">
                    Real-time revenue, receivables, inventory, and sales activity — all in one place, always up to date.
                  </p>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Invoice", "Customer", "Amount", "Status"].map((h, i) => (
                          <th key={h} className={`text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 pb-2.5 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {INVOICES_TABLE.map((row) => (
                        <tr key={row.inv} className="border-b border-white/[0.04]">
                          <td className="text-[11px] font-mono text-white py-2.5">{row.inv}</td>
                          <td className="text-[11px] text-white/45 py-2.5">{row.customer}</td>
                          <td className="text-[11px] font-bold text-white/80 py-2.5 text-right">{row.amt}</td>
                          <td className="py-2.5 text-right">
                            <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-[0.08em] ${
                              row.paid ? "bg-bz-accent/[0.12] text-bz-accent" : "bg-amber-400/10 text-amber-400"
                            }`}>
                              {row.paid ? "Paid" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Setup */}
          <div className="col-span-6 lg:col-span-3">
            <Card tone="dark" pad="lg" className="h-full min-h-[420px] flex flex-col gap-6">
              <div>
                <h3 className="text-[18px] font-bold text-white mb-2">Quick Setup</h3>
                <p className="text-[13px] text-white/50 leading-[1.6]">Pre-configured modules for common SME workflows. Import your data, invite your team, and go live in days — not months.</p>
              </div>
              <div className="mt-auto">
                <div className="flex border-b border-white/[0.06] pb-2">
                  {["STEP", "MODULE", "STATUS"].map((h) => (
                    <span key={h} className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 flex-1">{h}</span>
                  ))}
                </div>
                {SETUP_STEPS.map((r) => (
                  <div key={r.step} className="flex border-b border-white/[0.04] py-2.5">
                    <span className="text-[11px] font-mono text-white/50 flex-1">{r.step}</span>
                    <span className="text-[11px] text-white/70 flex-1">{r.module}</span>
                    <span className={`text-[11px] font-bold flex-1 ${r.ok ? "text-green-400" : "text-white/30"}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Finance Automation */}
          <div className="col-span-6 lg:col-span-3">
            <Card tone="dark" pad="lg" className="h-full min-h-[420px] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-white mb-2">Finance Automation</h3>
                  <p className="text-[13px] text-white/50 leading-[1.6]">Auto-reconcile bank transactions, chase overdue invoices, and close your books in one click — not one week.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-bz-accent/10 flex items-center justify-center text-bz-accent shrink-0 ml-4">
                  <DollarSign size={22} strokeWidth={1.8} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-auto">
                {FINANCE_STATS.map(([val, sub]) => (
                  <div key={sub} className="bg-white/[0.04] rounded-bz-md p-3 text-center">
                    <div className="text-[20px] font-bold text-bz-accent leading-tight">{val}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/40 mt-1">{sub}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Workflow Automation */}
          <div className="col-span-6 lg:col-span-2">
            <Card tone="dark" pad="lg" className="min-h-[240px]">
              <Zap size={32} className="text-bz-accent mb-5" strokeWidth={1.8} />
              <h4 className="text-[17px] font-bold text-white mb-2">Workflow Automation</h4>
              <p className="text-[13px] text-white/50 leading-[1.6]">Auto-approve POs under threshold, send payment reminders, and trigger stock alerts — without any code.</p>
            </Card>
          </div>

          {/* Live Reporting */}
          <div className="col-span-6 lg:col-span-2">
            <Card tone="dark" pad="lg" className="min-h-[240px] border-bz-accent/30 relative">
              <div className="absolute top-5 right-5">
                <PillBadge tone="accent" dot>Real-time</PillBadge>
              </div>
              <BarChart3 size={32} className="text-bz-accent mb-5" strokeWidth={1.8} />
              <h4 className="text-[17px] font-bold text-white mb-2">Live Reporting</h4>
              <p className="text-[13px] text-white/50 leading-[1.6]">Revenue, expenses, inventory turns, and cash position — live on every device, always fresh.</p>
            </Card>
          </div>

          {/* One-Click Integrations */}
          <div className="col-span-6 lg:col-span-2">
            <Card tone="dark" pad="lg" className="min-h-[240px] flex flex-col">
              <Plug size={32} className="text-bz-accent mb-5" strokeWidth={1.8} />
              <h4 className="text-[17px] font-bold text-white mb-2">One-Click Integrations</h4>
              <p className="text-[13px] text-white/50 leading-[1.6]">Connect Stripe, Shopify, your bank, and shipping providers in minutes — no developer needed.</p>
              <div className="mt-auto pt-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-bz-accent rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
            </Card>
          </div>

        </div>
      </Container>
    </Section>
  );
}

// ─── Insights ─────────────────────────────────────────────────────────────────

const INSIGHT_BULLETS = [
  { bold: "Revenue & Cash Dashboards", rest: " — Live P&L, cash position, and receivables at a glance." },
  { bold: "Sales Pipeline Visibility", rest: " — Track deals, conversions, and customer lifetime value in real time." },
  { bold: "Inventory Intelligence",    rest: " — Know your fast-movers, slow stock, and reorder needs automatically." },
];

function InsightsSection() {
  return (
    <Section tone="white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="rounded-bz-xl border border-bz-border bg-bz-surface overflow-hidden p-6">
            <div className="flex gap-4 mb-4">
              <div className="h-8 w-36 bg-bz-bg rounded-lg" />
              <div className="h-8 w-20 bg-bz-bg rounded-lg" />
            </div>
            <div className="h-56 bg-bz-surface rounded-lg border border-bz-border/50 relative p-4">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                <defs>
                  <linearGradient id="smeRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A826D" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#7A826D" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 175 C 40 170, 80 158, 120 140 S 190 110, 240 88 S 330 52, 400 32" stroke="#7A826D" strokeWidth="3" strokeLinecap="round" />
                <path d="M0 175 C 40 170, 80 158, 120 140 S 190 110, 240 88 S 330 52, 400 32 V 200 H 0 Z" fill="url(#smeRevGrad)" />
                <path d="M0 160 C 50 155, 100 148, 160 132 S 260 108, 320 98 S 370 72, 400 62" stroke="rgba(122,130,109,0.4)" strokeWidth="2" strokeDasharray="6 4" />
                <circle cx="240" cy="88" r="5" fill="#C7FF35" stroke="#7A826D" strokeWidth="2" />
              </svg>
              <div className="absolute top-4 right-4 bg-bz-surface border border-bz-border rounded-lg p-2.5 shadow-sm">
                <div className="text-[11px] font-bold text-bz-text">Revenue: $84K ↑</div>
                <div className="text-[10px] font-bold text-green-600 mt-1">+38% vs last month</div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Business Intelligence"
              title="Make confident decisions with live data."
              description="Stop guessing. Replace end-of-month exports with real-time dashboards that show you exactly where your business stands — revenue, cash, stock, and sales — all live."
              maxWidth={560}
              className="mb-8"
            />
            <ul className="flex flex-col gap-4">
              {INSIGHT_BULLETS.map((item) => (
                <li key={item.bold} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-bz-sage shrink-0 mt-0.5" strokeWidth={1.8} />
                  <span className="text-[15px] text-bz-text leading-[1.7]">
                    <strong>{item.bold}</strong>{item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </Container>
    </Section>
  );
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

type WorkflowStep = { icon: LucideIcon; label: string };

const WORKFLOW_STEPS: WorkflowStep[] = [
  { icon: RefreshCw, label: "Import Data"  },
  { icon: Settings,  label: "Configure"    },
  { icon: Users,     label: "Invite Team"  },
  { icon: Plug,      label: "Connect Apps" },
  { icon: BarChart3, label: "Go Live"      },
  { icon: Rocket,    label: "Scale Up"     },
];

function WorkflowSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Onboarding"
          title="From Sign-Up to Go-Live in 3 Days"
          align="center"
          className="mb-16"
        />
        <div className="relative">
          <div className="hidden md:block absolute top-7 left-[8%] right-[8%] pointer-events-none">
            <svg className="w-full" height="4" viewBox="0 0 1000 4" fill="none" preserveAspectRatio="none">
              <line x1="0" y1="2" x2="1000" y2="2" stroke="rgba(122,130,109,0.15)" strokeWidth="1.5" />
              <path className="biz-flow" d="M0,2 L1000,2" stroke="#C7FF35" strokeDasharray="12 40" strokeLinecap="round" strokeWidth="3" />
            </svg>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {WORKFLOW_STEPS.map(({ icon: StepIcon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-bz-surface border border-bz-border flex items-center justify-center text-bz-sage relative z-10">
                  <StepIcon size={22} strokeWidth={1.8} />
                </div>
                <span className="text-[12px] font-bold text-bz-text-muted text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "We replaced four tools and two full-time data entry roles in our first month with Bizak. ROI was immediate.",
    name: "Priya Mehta",
    role: "Co-Founder, Nova Commerce",
    metric: "4× faster invoicing",
  },
  {
    quote: "Our team went live in two days. The pre-configured modules meant zero setup headaches — just instant value.",
    name: "James Okafor",
    role: "Operations Lead, Shift Logistics",
    metric: "2-day go-live",
  },
  {
    quote: "Finally I can see cash position, inventory, and pipeline in one screen. I make better decisions faster.",
    name: "Anika Torres",
    role: "CEO, BlueMark Retail",
    metric: "Real-time visibility",
  },
];

function TestimonialsSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Customer Stories"
          title="SMEs that switched to Bizak and never looked back"
          align="center"
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} tone="light" hover="lift" className="flex flex-col gap-5">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width={13} height={13} viewBox="0 0 24 24" fill="#C7FF35" stroke="#C7FF35" strokeWidth={1.5}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-[15px] text-bz-text-muted leading-[1.7] italic flex-1">"{t.quote}"</p>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[14px] font-bold text-bz-text">{t.name}</div>
                  <div className="text-[12px] text-bz-text-muted mt-0.5">{t.role}</div>
                </div>
                <span className="text-[10px] font-bold text-bz-sage uppercase tracking-[0.06em] bg-bz-sage/[0.08] px-2.5 py-1.5 rounded-md whitespace-nowrap ml-3">
                  {t.metric}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

type PricingPlan = {
  tier: string; price: string; sub: string;
  features: string[]; highlight: boolean; badge: string | null;
};

const PRICING_PLANS: PricingPlan[] = [
  {
    tier: "Starter", price: "Free",   sub: "Up to 5 users",
    features: ["Finance & Invoicing", "Basic Inventory", "Sales Quotes", "1 Integration"],
    highlight: false, badge: null,
  },
  {
    tier: "Growth",  price: "$49",    sub: "per user / month",
    features: ["All Starter features", "CRM & Pipeline", "Workflow Automation", "Unlimited Integrations", "Priority Support"],
    highlight: true, badge: "Most Popular",
  },
  {
    tier: "Scale",   price: "Custom", sub: "For 50+ users",
    features: ["All Growth features", "Multi-company", "Advanced Analytics", "Dedicated CSM", "Custom SLA"],
    highlight: false, badge: null,
  },
];

function PricingSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing that grows with you"
          description="Start with the core and add modules as you scale. No hidden fees, no long-term lock-in."
          align="center"
          maxWidth={560}
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[860px] mx-auto">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              tone={plan.highlight ? "dark" : "soft"}
              pad="lg"
              className={`flex flex-col relative ${plan.highlight ? "border-bz-accent/40" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bz-accent text-bz-deep text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-[0.06em] whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className={`text-[11px] font-bold uppercase tracking-[0.1em] mb-3 ${plan.highlight ? "text-white/50" : "text-bz-sage"}`}>
                {plan.tier}
              </div>
              <div className={`text-[36px] font-bold leading-tight mb-1 ${plan.highlight ? "text-white" : "text-bz-text"}`}>
                {plan.price}
              </div>
              <div className={`text-[13px] mb-7 ${plan.highlight ? "text-white/40" : "text-bz-text-muted"}`}>
                {plan.sub}
              </div>
              <div className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-bz-accent/15" : "bg-bz-sage/10"}`}>
                      <CheckCircle size={10} className={plan.highlight ? "text-bz-accent" : "text-bz-sage"} strokeWidth={2} />
                    </div>
                    <span className={`text-[13px] ${plan.highlight ? "text-white/75" : "text-bz-text-muted"}`}>{f}</span>
                  </div>
                ))}
              </div>
              <Button variant={plan.highlight ? "accent" : "outline"} href="/contact">
                {plan.price === "Custom" ? "Talk to Sales" : "Get Started"}
              </Button>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          title="Your business deserves better than spreadsheets."
          description="Join 5,000+ startups and SMEs that replaced their patchwork tools with Bizak. Go live in days and let your team focus on growth — not admin."
          tone="light"
          align="center"
          maxWidth={640}
          className="mb-10"
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/contact" withArrow>Start Free Trial</Button>
          <Button variant="ghostDark" size="lg" href="/contact">Request Demo</Button>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function StartupsAndSmes() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <InsightsSection />
        <WorkflowSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
