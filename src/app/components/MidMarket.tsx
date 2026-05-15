import "../../styles/style.css";
import { useRef, useEffect, type ReactNode } from "react";
import {
  Layers, ShieldCheck, BarChart3, Plug, Lock,
  CheckSquare, Building2, Puzzle, AlertTriangle, Clock,
  TrendingUp, RefreshCw, Settings, Users, CheckCircle, Rocket, PieChart,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Container, Section, SectionHeading, Button, Card,
  IconBadge, PillBadge, HeroPanel, HeroBadge,
} from "./marketing";

// ─── Hero panel ───────────────────────────────────────────────────────────────

const ENTITIES = [
  { label: "HQ – Dubai",      value: "$2.1M", unit: "Revenue",  active: true  },
  { label: "Cairo Branch",    value: "$840K", unit: "Revenue",  active: true  },
  { label: "London Branch",   value: "$1.3M", unit: "Revenue",  active: true  },
  { label: "Consolidation",   value: "98.5%", unit: "Accuracy", active: false },
];

const PENDING_APPROVALS = [
  { id: "APV-0211", dept: "Procurement", amount: "$48,000", status: "pending"  },
  { id: "APV-0212", dept: "Finance",     amount: "$12,400", status: "approved" },
  { id: "APV-0213", dept: "Operations",  amount: "$93,200", status: "review"   },
];

const DEPT_HEALTH = [
  { label: "Finance",      pct: 96 },
  { label: "Supply Chain", pct: 88 },
  { label: "Sales",        pct: 74 },
];

function ConsolidatedPanel() {
  return (
    <Card tone="dark" pad="md" className="w-full">
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400/50" />
          <div className="w-2 h-2 rounded-full bg-amber-400/50" />
          <div className="w-2 h-2 rounded-full bg-green-400/50" />
        </div>
        <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-bz-sage/65">Bizak · Consolidated View</span>
        <div className="flex items-center gap-1.5">
          <div className="biz-pulse-glow w-1.5 h-1.5 rounded-full bg-bz-accent" />
          <span className="text-[9px] font-bold tracking-[0.1em] text-bz-sage uppercase">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {ENTITIES.map((e) => (
          <div key={e.label} className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center border ${
              e.active ? "border-bz-accent/50 bg-bz-accent/[0.06]" : "border-bz-sage/[0.18] bg-bz-sage/[0.03]"
            }`}>
              {e.active
                ? <TrendingUp size={13} className="text-bz-sage" strokeWidth={1.8} />
                : <BarChart3 size={13} className="text-white/40" strokeWidth={1.8} />
              }
            </div>
            <span className={`text-[10px] font-bold ${e.active ? "text-white" : "text-white/40"}`}>{e.value}</span>
            <span className="text-[7px] font-bold uppercase tracking-wider text-white/40">{e.unit}</span>
            <span className="text-[7px] text-white/25 tracking-wide text-center">{e.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3.5 flex flex-col gap-2 mb-4">
        {PENDING_APPROVALS.map((apv) => {
          const tone =
            apv.status === "approved" ? "bg-bz-accent/15 text-bz-sage"
              : apv.status === "pending" ? "bg-amber-400/10 text-amber-400"
              : "bg-orange-400/10 text-orange-400";
          return (
            <div key={apv.id} className="flex items-center gap-2">
              <span className="text-[9px] text-bz-sage/70 min-w-[58px]">{apv.id}</span>
              <span className="text-[9px] text-white/50 flex-1">{apv.dept}</span>
              <span className="text-[9px] font-bold text-white/80 min-w-[44px] text-right">{apv.amount}</span>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${tone}`}>
                {apv.status}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 pt-3.5 flex flex-col gap-2">
        {DEPT_HEALTH.map((m) => (
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
      badge={<HeroBadge tone="dark">ERP for Mid-Market Companies</HeroBadge>}
      title={<>Unify Operations.<br /><span className="text-bz-accent">Scale</span> With Precision.</>}
      description="Mid-market companies outgrow spreadsheets and entry-level ERPs fast. Bizak gives you multi-entity financials, advanced approval workflows, and consolidated reporting without the enterprise price tag or 18-month rollout."
      actions={
        <>
          <Button variant="accent" size="lg" href="/contact" withArrow>Request a Demo</Button>
          <Button variant="ghostDark" size="lg" href="/contact">See It in Action</Button>
        </>
      }
      stats={[
        { value: "30 Days", label: "Typical Go-Live" },
        { value: "800+",    label: "Mid-Market Companies" },
      ]}
      panel={<ConsolidatedPanel />}
    />
  );
}

// ─── Challenges ───────────────────────────────────────────────────────────────

type ChallengeItem = { icon: LucideIcon; title: string; desc: string; footer: ReactNode };

const CHALLENGES: ChallengeItem[] = [
  {
    icon: CheckSquare,
    title: "Approval Bottlenecks",
    desc: "Purchase orders, budget requests, and vendor invoices sit in email chains for days. Deals slow. Vendors send late-payment notices.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { id: "PO-3841", label: "IT Infrastructure PO",   days: "7d pending"  },
          { id: "PO-3842", label: "Marketing Budget Req.",  days: "4d pending"  },
          { id: "PO-3843", label: "Office Lease Renewal",   days: "12d pending" },
        ].map((f) => (
          <div key={f.id} className="flex items-center gap-2 px-2 py-1 rounded-md bg-red-50">
            <Clock size={10} className="text-red-400 shrink-0" strokeWidth={1.8} />
            <span className="text-[8px] flex-1 truncate text-red-400">{f.label}</span>
            <span className="text-[8px] font-bold text-red-400">{f.days}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Building2,
    title: "Multi-Entity Chaos",
    desc: "Running three subsidiaries with separate spreadsheets means consolidation takes a full week every month-end. Errors are inevitable.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "HQ Consolidation",     lag: "7 days manual" },
          { label: "Interco Eliminations", lag: "3 days manual" },
          { label: "FX Revaluation",       lag: "2 days manual" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-[9px] text-bz-text-muted">{row.label}</span>
            <span className="text-[9px] font-bold text-red-400">{row.lag}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide">12 days lost monthly</span>
        </div>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Audit Gaps",
    desc: "No clear audit trail, missing approval records, and manual journal entries make every audit a fire drill. Regulators and investors are watching.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "Missing audit trail",   risk: "High risk", critical: true  },
          { label: "Unapproved JE entries", risk: "High risk", critical: true  },
          { label: "Expired vendor certs",  risk: "Medium",    critical: false },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className={`text-[9px] ${item.critical ? "text-red-400" : "text-bz-text-muted"}`}>{item.label}</span>
            <span className={`text-[9px] font-bold ${item.critical ? "text-red-400" : "text-bz-sage"}`}>{item.risk}</span>
          </div>
        ))}
        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide mt-1">3 critical findings</span>
      </div>
    ),
  },
  {
    icon: Puzzle,
    title: "Siloed Departments",
    desc: "Finance doesn't see what Ops is ordering. Sales doesn't know inventory levels. Each department optimizes alone and the business pays the cost.",
    footer: (
      <div className="mt-auto pt-4 border-t border-bz-border">
        <div className="flex items-center justify-center mb-3">
          {["FIN", "OPS", "SCM", "SLS"].map((dept, i) => (
            <div key={dept} className="flex items-center">
              <div className="w-7 h-7 rounded-lg bg-bz-bg border border-bz-border flex items-center justify-center">
                <span className="text-[8px] font-bold text-bz-sage">{dept}</span>
              </div>
              {i < 3 && <div className="w-4 h-px bg-red-300" />}
            </div>
          ))}
        </div>
        <p className="text-center text-[9px] font-bold text-red-400 uppercase tracking-wide">4 depts, 0 shared visibility</p>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Reporting Takes Too Long",
    desc: "Board packs assembled in PowerPoint. Management reports emailed as PDFs. By the time the data reaches decision-makers, it's already stale.",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "Board Report",  days: 18, critical: true  },
          { label: "P&L Statement", days: 12, critical: true  },
          { label: "Cashflow Fcst", days: 5,  critical: false },
        ].map((m) => (
          <div key={m.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[8px] text-bz-text-muted">{m.label}</span>
              <span className={`text-[8px] font-bold ${m.critical ? "text-red-400" : "text-bz-sage"}`}>
                {m.days} days{m.critical ? " ⚠" : ""}
              </span>
            </div>
            <div className="h-1 bg-bz-bg rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${m.critical ? "bg-red-400" : "bg-bz-sage"}`}
                style={{ width: `${Math.min((m.days / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    title: "Outgrown Your Current ERP",
    desc: "That entry-level system worked at 20 users but breaks at 150. Custom workarounds multiply, and the vendor says the features you need are \"roadmap.\"",
    footer: (
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-bz-border">
        {[
          { label: "Workaround Scripts", pct: 87 },
          { label: "Native Automation",  pct: 11 },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-bz-text-muted uppercase tracking-wide min-w-[96px]">{row.label}</span>
            <div className="flex-1 h-1.5 bg-bz-bg rounded overflow-hidden">
              <div className="h-full bg-red-300/60 rounded" style={{ width: `${row.pct}%` }} />
            </div>
            <span className="text-[8px] font-bold text-red-400">{row.pct}%</span>
          </div>
        ))}
        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide mt-1">Tech debt compounding</span>
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
          title="Growing fast is easy. Managing that growth is where mid-market companies break."
          description="At 50–500 employees, complexity compounds. Approval chains get long, entities multiply, and the systems built for 20 people can't keep up."
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
  { icon: Layers,      title: "Multi-Entity Financials",     desc: "Manage multiple subsidiaries in one platform. Auto-consolidate, handle intercompany eliminations, and close books in hours not days." },
  { icon: CheckSquare, title: "Advanced Approval Workflows", desc: "Build multi-level, role-based approval chains for POs, budgets, and expenses. Auto-escalate when thresholds are breached." },
  { icon: ShieldCheck, title: "Audit-Ready Controls",        desc: "Full audit trail, segregation of duties, and policy enforcement baked in. Every change is logged, every approval is documented." },
  { icon: BarChart3,   title: "Executive Dashboards",        desc: "Board-level reporting in real time. P&L by entity, consolidated cashflow, and department KPIs available on any device." },
  { icon: Plug,        title: "Deep Integrations",           desc: "Connect your bank feeds, CRM, payroll, and logistics platforms. Bizak becomes the operational backbone of your entire org." },
  { icon: Lock,        title: "Role-Based Access Control",   desc: "Granular permissions ensure each team sees only what they need. Delegate without risk from CFO to field rep." },
];

function SolutionSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="The Solution"
          title="Built for the complexity mid-market demands"
          align="left"
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

const ENTITY_TABLE = [
  { entity: "Dubai HQ",      revenue: "$2.1M", ebitda: "24%", status: "healthy" },
  { entity: "Cairo Branch",  revenue: "$840K", ebitda: "18%", status: "healthy" },
  { entity: "London Branch", revenue: "$1.3M", ebitda: "21%", status: "review"  },
];

const APPROVAL_STEPS = [
  { step: "01", role: "Dept Head", status: "DONE",    ok: true  },
  { step: "02", role: "Finance",   status: "DONE",    ok: true  },
  { step: "03", role: "CFO",       status: "ACTIVE",  ok: true  },
  { step: "04", role: "CEO",       status: "PENDING", ok: false },
];

const AUDIT_STATS: [string, string][] = [
  ["100%",    "Audit Trail"],
  ["<1 Day",  "Audit Prep"],
  ["SOX-lite", "Controls"],
];

function CapabilitiesSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="Enterprise power. Mid-market agility."
          tone="light"
          maxWidth={560}
          className="mb-16"
        />

        <div className="grid grid-cols-6 gap-4">

          {/* Consolidated Oversight */}
          <div className="col-span-6">
            <Card tone="dark" pad="lg" className="min-h-[260px]">
              <div className="flex items-start gap-12 flex-wrap">
                <div className="shrink-0">
                  <div className="text-[42px] font-bold text-white leading-tight">$4.24M</div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/45 mt-2">Consolidated Revenue</p>
                  <div className="flex gap-7 mt-5">
                    {[{ val: "+22%", lbl: "YoY Growth" }, { val: "3", lbl: "Active Entities" }].map((s) => (
                      <div key={s.lbl}>
                        <div className="text-[22px] font-bold text-bz-accent">{s.val}</div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35 mt-1">{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-[240px]">
                  <h4 className="text-[18px] font-bold text-white mb-2">Consolidated Oversight</h4>
                  <p className="text-[13px] text-white/50 leading-[1.6] mb-5">
                    Revenue, costs, headcount, and approvals across all entities live in a single board-ready view.
                  </p>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Entity", "Revenue", "EBITDA", "Status"].map((h, i) => (
                          <th key={h} className={`text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 pb-2.5 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ENTITY_TABLE.map((row) => (
                        <tr key={row.entity} className="border-b border-white/[0.04]">
                          <td className="text-[11px] text-white py-2.5">{row.entity}</td>
                          <td className="text-[11px] text-white/45 py-2.5">{row.revenue}</td>
                          <td className="text-[11px] font-bold text-white/80 py-2.5 text-right">{row.ebitda}</td>
                          <td className="py-2.5 text-right">
                            <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-[0.08em] ${
                              row.status === "healthy" ? "bg-bz-accent/[0.12] text-bz-accent" : "bg-amber-400/10 text-amber-400"
                            }`}>
                              {row.status}
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

          {/* Advanced Approvals */}
          <div className="col-span-6 lg:col-span-3">
            <Card tone="dark" pad="lg" className="h-full min-h-[420px] flex flex-col gap-6">
              <div>
                <h3 className="text-[18px] font-bold text-white mb-2">Advanced Approvals</h3>
                <p className="text-[13px] text-white/50 leading-[1.6]">Multi-level, policy-driven approval chains across any module. Auto-escalate, auto-notify, and maintain a tamper-proof audit trail for every decision.</p>
              </div>
              <div className="mt-auto">
                <div className="flex border-b border-white/[0.06] pb-2">
                  {["STEP", "APPROVER", "STATUS"].map((h) => (
                    <span key={h} className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 flex-1">{h}</span>
                  ))}
                </div>
                {APPROVAL_STEPS.map((r) => (
                  <div key={r.step} className="flex border-b border-white/[0.04] py-2.5">
                    <span className="text-[11px] text-white/50 flex-1">{r.step}</span>
                    <span className="text-[11px] text-white/70 flex-1">{r.role}</span>
                    <span className={`text-[11px] font-bold flex-1 ${r.ok ? "text-green-400" : "text-white/30"}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Audit & Compliance */}
          <div className="col-span-6 lg:col-span-3">
            <Card tone="dark" pad="lg" className="h-full min-h-[420px] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-white mb-2">Audit & Compliance</h3>
                  <p className="text-[13px] text-white/50 leading-[1.6]">Complete audit log, segregation of duties, and policy enforcement. Prepare for any audit in minutes not weeks.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-bz-accent/10 flex items-center justify-center text-bz-accent shrink-0 ml-4">
                  <ShieldCheck size={22} strokeWidth={1.8} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-auto">
                {AUDIT_STATS.map(([val, sub]) => (
                  <div key={sub} className="bg-white/[0.04] rounded-bz-md p-3 text-center">
                    <div className="text-[20px] font-bold text-bz-accent leading-tight">{val}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/40 mt-1">{sub}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Multi-Entity Management */}
          <div className="col-span-6 lg:col-span-2">
            <Card tone="dark" pad="lg" className="min-h-[240px]">
              <Layers size={32} className="text-bz-accent mb-5" strokeWidth={1.8} />
              <h4 className="text-[17px] font-bold text-white mb-2">Multi-Entity Management</h4>
              <p className="text-[13px] text-white/50 leading-[1.6]">Manage subsidiaries, branches, and JVs from one platform. Intercompany transactions auto-eliminate at consolidation.</p>
            </Card>
          </div>

          {/* Executive Reporting */}
          <div className="col-span-6 lg:col-span-2">
            <Card tone="dark" pad="lg" className="min-h-[240px] border-bz-accent/30 relative">
              <div className="absolute top-5 right-5">
                <PillBadge tone="accent" dot>Real-time</PillBadge>
              </div>
              <PieChart size={32} className="text-bz-accent mb-5" strokeWidth={1.8} />
              <h4 className="text-[17px] font-bold text-white mb-2">Executive Reporting</h4>
              <p className="text-[13px] text-white/50 leading-[1.6]">Board packs, management accounts, and KPI dashboards built live from your data no Excel assembly required.</p>
            </Card>
          </div>

          {/* Granular Access Control */}
          <div className="col-span-6 lg:col-span-2">
            <Card tone="dark" pad="lg" className="min-h-[240px] flex flex-col">
              <Lock size={32} className="text-bz-accent mb-5" strokeWidth={1.8} />
              <h4 className="text-[17px] font-bold text-white mb-2">Granular Access Control</h4>
              <p className="text-[13px] text-white/50 leading-[1.6]">Entity-level, department-level, and field-level permissions. Every user sees exactly what their role allows nothing more.</p>
              <div className="mt-auto pt-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-bz-accent rounded-full" style={{ width: "97%" }} />
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
  { bold: "Real-Time Consolidation",     rest: " P&L, balance sheet, and cashflow across all entities with intercompany eliminations handled automatically." },
  { bold: "Department-Level Visibility", rest: " Every team's budget vs actuals, approval queue, and KPIs in one unified view." },
  { bold: "Board-Ready Reports",         rest: " Export investor-grade reports directly from live data no spreadsheet assembly needed." },
];

// ─── Workflow ─────────────────────────────────────────────────────────────────

type WorkflowStep = { icon: LucideIcon; label: string };

const WORKFLOW_STEPS: WorkflowStep[] = [
  { icon: Settings,  label: "Configure"       },
  { icon: Users,     label: "Set Permissions" },
  { icon: Layers,    label: "Map Entities"    },
  { icon: RefreshCw, label: "Migrate Data"    },
  { icon: Plug,      label: "Integrate"       },
  { icon: Rocket,    label: "Go Live"         },
];

function WorkflowSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Implementation"
          title="Structured rollout. Zero disruption."
          description="Our dedicated implementation team follows a proven 30-day playbook phased go-live, data migration included, and handover training for every team."
          align="left"
          maxWidth={520}
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
    quote: "We consolidated three subsidiaries onto Bizak in 30 days. Month-end close dropped from 14 days to 3. Our CFO calls it a career highlight.",
    name: "Tariq Al-Hassan",
    role: "CEO, Meridian Holdings",
    metric: "3-day month close",
  },
  {
    quote: "The multi-level approval workflows alone saved us from two costly compliance findings in our last audit. Bizak paid for itself in the first quarter.",
    name: "Sophie Nkemdirim",
    role: "CFO, Stratum Group",
    metric: "Zero audit findings",
  },
  {
    quote: "We needed real-time visibility across four departments without giving everyone access to everything. Bizak's permission model is exactly what enterprises charge ten times more for.",
    name: "David Leung",
    role: "COO, Apex Distribution",
    metric: "4 depts, 1 platform",
  },
];

function TestimonialsSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Customer Stories"
          title="Mid-market companies that made the move to Bizak"
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
  tier: string; price: string; sub: string; subNote?: string;
  features: string[]; highlight: boolean; badge: string | null;
};

const PRICING_PLANS: PricingPlan[] = [
  {
    tier: "Growth", price: "$49", sub: "Includes 5 users", subNote: "+$10/user up to 10",
    features: ["1 Entity", "Advanced Workflows", "Executive Dashboards", "Standard Integrations", "Priority Support"],
    highlight: false, badge: null,
  },
  {
    tier: "Scale", price: "$89", sub: "Includes 10 users", subNote: "+$10/user up to 20",
    features: ["Up to 5 Entities", "Multi-currency", "Consolidation Engine", "Audit Trail", "Advanced RBAC", "Dedicated CSM"],
    highlight: true, badge: "Best for Mid-Market",
  },
  {
    tier: "Enterprise", price: "Custom", sub: "50+ users · volume pricing",
    features: ["Unlimited Entities", "Custom SLA", "SSO & SCIM", "On-premise Option", "Advanced RBAC", "Dedicated Account Manager"],
    highlight: false, badge: null,
  },
];

function PricingSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const scaleCard = el.children[1] as HTMLElement;
    if (scaleCard) el.scrollLeft = scaleCard.offsetLeft - el.offsetLeft;
  }, []);

  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Mid-market power without the enterprise price tag"
          description="Transparent pricing that scales with your headcount and entity count. No hidden fees, no proprietary lock-in."
          align="center"
          maxWidth={560}
          className="mb-14"
        />
        <div className="-mx-6 px-6 md:mx-0 md:px-0">
        <div ref={carouselRef} className="flex overflow-x-auto gap-4 pt-5 pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pt-0 md:max-w-[860px] md:mx-auto [&::-webkit-scrollbar]:hidden">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              tone={plan.highlight ? "dark" : "soft"}
              pad="lg"
              className={`shrink-0 w-[78vw] max-w-[300px] snap-center md:w-auto md:max-w-none flex flex-col relative ${plan.highlight ? "bg-bz-deep border-bz-accent/40" : ""}`}
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
                {plan.price !== "Custom" && (
                  <span className={`text-[15px] font-medium ml-0.5 ${plan.highlight ? "text-white/40" : "text-bz-text-muted"}`}>/mo</span>
                )}
              </div>
              {plan.subNote ? (
                <div className="flex flex-col gap-1.5 mb-7">
                  <div className={`inline-flex items-center gap-1.5 self-start text-[11px] font-semibold px-2.5 py-1 rounded-md ${plan.highlight ? "bg-bz-accent/15 text-bz-accent" : "bg-bz-sage/10 text-bz-sage"}`}>
                    <Users size={11} strokeWidth={2} />
                    {plan.sub}
                  </div>
                  <div className={`inline-flex items-center gap-1.5 self-start text-[11px] font-medium px-2.5 py-1 rounded-md ${plan.highlight ? "bg-white/[0.06] text-white/40" : "bg-bz-bg border border-bz-border text-bz-text-muted"}`}>
                    {plan.subNote}
                  </div>
                </div>
              ) : (
                <div className={`text-[13px] mb-7 ${plan.highlight ? "text-white/40" : "text-bz-text-muted"}`}>
                  {plan.sub}
                </div>
              )}
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
          title="Your complexity deserves a system built for it."
          description="Join 800+ mid-market companies that replaced fragmented tools with Bizak. Multi-entity. Audit-ready. Live in 30 days."
          tone="light"
          align="center"
          maxWidth={640}
          className="mb-10"
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/contact" withArrow>Request a Demo</Button>
          <Button variant="ghostDark" size="lg" href="/contact">Talk to Sales</Button>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MidMarket() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <WorkflowSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
