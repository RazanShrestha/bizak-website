import {
  Section, Container, SectionHeading, Button, Card,
  IconBadge, HeroBadge, HeroCentered, PillBadge,
} from "./marketing";
import {
  Layers, ClipboardList, CalendarRange, Workflow, ShieldCheck, DollarSign,
  TrendingUp, RefreshCw, BarChart3, Lock, Warehouse, Settings,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { Icon: Layers,         title: "Bill of Materials",       desc: "Multi-level BOM with version control, phantom items, by-product handling, and component substitution." },
  { Icon: ClipboardList,  title: "Work Order Management",   desc: "Release, schedule, and track production orders end-to-end with real-time status and exception alerts." },
  { Icon: CalendarRange,  title: "Production Scheduling",   desc: "Capacity-aware scheduling across all work centers with forward and backward scheduling logic." },
  { Icon: Workflow,       title: "Routing & Operations",    desc: "Define multi-step operations with time standards, labor rates, machine assignments, and setup times." },
  { Icon: ShieldCheck,    title: "Quality Control",         desc: "Inline QC checkpoints at each operation with rejection tracking and automatic rework order creation." },
  { Icon: DollarSign,     title: "Manufacturing Costing",   desc: "Actual vs. standard cost analysis with variance reporting across materials, labor, and overhead." },
];

const METRICS = [
  { value: "35%",   label: "Faster Cycle Time",  desc: "Capacity-aware scheduling and routing optimizations cut average production time by more than a third." },
  { value: "28%",   label: "Scrap Reduction",     desc: "Inline quality checkpoints catch defects at the source, preventing rework from propagating downstream." },
  { value: "96.2%", label: "On-Time Delivery",    desc: "Accurate lead time calculation and real-time WO tracking keep customer commitments consistently met." },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function HeroDashboard() {
  const stats = [
    { label: "Active Work Orders", value: "47",    unit: "In Progress" },
    { label: "OEE Score",          value: "87.3%", unit: "This Week", accent: true },
    { label: "Machine Utilization",value: "92%",   unit: "Rate" },
    { label: "Today's Output",     value: "2,840", unit: "Units" },
  ];
  const gantt = [
    { center: "Assembly",      jobs: [{ id: "WO-1042", start: 0,  width: 37, primary: true  }, { id: "WO-1046", start: 44, width: 28, primary: false }] },
    { center: "CNC Machining", jobs: [{ id: "WO-1043", start: 8,  width: 54, primary: false }] },
    { center: "Painting",      jobs: [{ id: "WO-1041", start: 0,  width: 16, primary: false }, { id: "WO-1044", start: 22, width: 44, primary: true  }] },
    { center: "QC Station",    jobs: [{ id: "WO-1045", start: 34, width: 33, primary: false }] },
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="max-w-[1100px] mx-auto rounded-bz-2xl border border-white/[0.08] overflow-hidden bg-bz-deep">
      <div className="px-8 py-4 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <span className="text-[11px] font-bold text-white/30 tracking-[0.1em]">BIZAK · PRODUCTION CONTROL</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-bz-accent biz-pulse-glow" />
          <span className="text-[10px] font-bold text-bz-accent">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-4 border-b border-white/[0.05]">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-7 py-6 text-left${i > 0 ? " border-l border-white/[0.05]" : ""}`}>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">{s.label}</div>
            <div className={`text-[28px] font-extrabold tracking-[-0.03em] leading-none ${s.accent ? "text-bz-accent" : "text-white"}`}>{s.value}</div>
            <div className="text-[10px] text-white/40 mt-1">{s.unit}</div>
          </div>
        ))}
      </div>

      <div className="px-9 pt-8 pb-11 bg-[#111412]">
        <div className="flex justify-between items-center mb-5">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">Production Schedule — Week 19</span>
          <span className="text-[10px] font-bold text-bz-accent">47 Active Work Orders</span>
        </div>
        <div className="grid grid-cols-[116px_1fr] mb-2.5">
          <div />
          <div className="grid grid-cols-5">
            {days.map(d => (
              <div key={d} className="text-[9px] font-bold text-white/30 uppercase tracking-[0.08em] text-center">{d}</div>
            ))}
          </div>
        </div>
        {gantt.map((row, ri) => (
          <div key={row.center} className={`grid grid-cols-[116px_1fr] items-center${ri < gantt.length - 1 ? " mb-2.5" : ""}`}>
            <span className="text-[10px] font-bold text-white/40">{row.center}</span>
            <div className="relative h-[34px] bg-white/[0.03] rounded-bz-md overflow-hidden">
              <div className="absolute top-0 bottom-0 left-[40%] w-px bg-bz-accent/35 z-[2]" />
              {row.jobs.map(j => (
                <div
                  key={j.id}
                  className={`absolute top-[5px] bottom-[5px] flex items-center pl-2 overflow-hidden rounded ${
                    j.primary ? "bg-bz-accent" : "bg-bz-accent/35"
                  }`}
                  style={{ left: `${j.start}%`, width: `${j.width}%` }}
                >
                  <span className={`text-[9px] font-bold whitespace-nowrap ${j.primary ? "text-bz-text" : "text-white/75"}`}>{j.id}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-5 flex gap-5 items-center">
          <div className="flex gap-1.5 items-center">
            <div className="w-3 h-1 rounded-sm bg-bz-accent" />
            <span className="text-[9px] text-white/40 font-bold">In Progress</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="w-3 h-1 rounded-sm bg-bz-accent/35" />
            <span className="text-[9px] text-white/40 font-bold">Scheduled</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="w-px h-3 bg-bz-accent/35" />
            <span className="text-[9px] text-white/40 font-bold">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TECH SHOWCASE ────────────────────────────────────────────────────────────

type BomNode = { label: string; code: string; level: number; qty: number; type: "FG" | "SFG" | "RM" };
const BOM: BomNode[] = [
  { label: "Hydraulic Pump Assembly", code: "FG-0201",  level: 0, qty: 1, type: "FG"  },
  { label: "Motor Unit",              code: "SFG-0110", level: 1, qty: 1, type: "SFG" },
  { label: "Stator Core",             code: "RM-0441",  level: 2, qty: 1, type: "RM"  },
  { label: "Rotor Assembly",          code: "RM-0442",  level: 2, qty: 1, type: "RM"  },
  { label: "Bearing Set",             code: "RM-0115",  level: 2, qty: 2, type: "RM"  },
  { label: "Pump Casing",             code: "SFG-0120", level: 1, qty: 1, type: "SFG" },
  { label: "Cast Iron Body",          code: "RM-0203",  level: 2, qty: 1, type: "RM"  },
  { label: "Fastener Pack",           code: "RM-0022",  level: 1, qty: 4, type: "RM"  },
];
const TYPE_DOT: Record<BomNode["type"], string> = { FG: "bg-bz-accent", SFG: "bg-bz-accent/60", RM: "bg-white/30" };
const TYPE_LABEL: Record<BomNode["type"], string> = { FG: "Finished Good", SFG: "Sub-Assembly", RM: "Raw Material" };

function TechShowcaseSection() {
  const woFeed = [
    { id: "WO-1042", item: "Pump Assembly × 50", status: "Running", color: "accent" as const },
    { id: "WO-1043", item: "Motor Unit × 120",   status: "Queued",  color: "muted"  as const },
    { id: "WO-1044", item: "Casing Coat × 80",   status: "Running", color: "accent" as const },
    { id: "WO-1045", item: "QC Final Batch #18", status: "On Hold", color: "amber"  as const },
  ];
  const machines = [
    { name: "CNC Mill #1", pct: 94 },
    { name: "CNC Mill #2", pct: 71 },
    { name: "Lathe #4",    pct: 88 },
    { name: "Paint Booth", pct: 52 },
  ];

  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Technical Showcase"
          title="Precision tools for the modern shop floor"
          tone="light"
          maxWidth={680}
          className="mb-16"
        />

        <div className="grid grid-cols-3 gap-5 mb-5">
          {/* BOM Exploder */}
          <div className="col-span-2 bg-white/[0.03] rounded-[28px] border border-white/[0.06] p-11">
            <Layers className="size-[22px] text-white/30" />
            <h3 className="text-[22px] font-bold text-white mt-4 mb-2.5">BOM Exploder</h3>
            <p className="text-[13px] text-white/40 max-w-[380px] leading-[1.65] mb-8">
              Multi-level bill of materials with real-time availability check against current stock.
            </p>
            <div className="bg-black/25 rounded-bz-2xl border border-white/[0.05] p-6">
              <div className="flex gap-5 mb-5 pb-4 border-b border-white/[0.05]">
                {(["FG", "SFG", "RM"] as BomNode["type"][]).map(t => (
                  <div key={t} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-sm ${TYPE_DOT[t]}`} />
                    <span className="text-[9px] text-white/40 font-bold">{TYPE_LABEL[t]}</span>
                  </div>
                ))}
              </div>
              {BOM.map((node, i) => (
                <div
                  key={node.code}
                  className={`flex items-center gap-2.5 py-2${i < BOM.length - 1 ? " border-b border-white/[0.03]" : ""}`}
                  style={{ paddingLeft: node.level * 24 }}
                >
                  {node.level > 0 && (
                    <span className="text-[11px] text-white/30 flex-shrink-0">{node.level === 2 ? "└─" : "├─"}</span>
                  )}
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[node.type]}`} />
                  <span className={`text-[12px] flex-1 ${node.level === 0 ? "font-bold text-white" : "font-semibold text-white/60"}`}>{node.label}</span>
                  <span className="text-[10px] text-white/40 tracking-tight font-semibold">{node.code}</span>
                  <span className="text-[10px] font-bold text-white/40 ml-2">×{node.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Work Orders */}
          <div className="bg-white/[0.03] rounded-[28px] border border-white/[0.06] p-9 flex flex-col">
            <ClipboardList className="size-[22px] text-white/30" />
            <h3 className="text-[22px] font-bold text-white mt-4 mb-2.5">Live Work Orders</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] mb-7 flex-1">
              Real-time status feed across all active production orders with priority routing.
            </p>
            <div className="flex flex-col gap-2.5">
              {woFeed.map(wo => (
                <div key={wo.id} className="bg-white/[0.04] rounded-bz-lg border border-white/[0.05] px-4 py-3.5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    wo.color === "accent" ? "bg-bz-accent" :
                    wo.color === "amber"  ? "bg-amber-500"  :
                                            "bg-bz-accent/50"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-white tracking-tight">{wo.id}</div>
                    <div className="text-[10px] text-white/40 mt-0.5 truncate">{wo.item}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    wo.status === "Running" ? "bg-bz-accent/15 text-bz-accent" :
                    wo.status === "On Hold" ? "bg-amber-500/15 text-amber-500" :
                                              "bg-white/[0.05] text-white/40"
                  }`}>{wo.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Machine + Quality */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-5 bg-white/[0.03] rounded-[28px] border border-white/[0.06] p-9">
            <Settings className="size-[22px] text-white/30" />
            <h3 className="text-[20px] font-bold text-white mt-4 mb-2.5">Machine Utilization</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] mb-7">
              Real-time capacity tracking with downtime classification across all work centers.
            </p>
            <div className="flex flex-col gap-4">
              {machines.map(m => (
                <div key={m.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] text-white/60 font-bold">{m.name}</span>
                    <span className="text-[11px] text-white/40">{m.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-bz-accent rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-7 bg-white/[0.03] rounded-[28px] border border-white/[0.06] p-9 relative">
            <div className="absolute top-9 right-9 text-right">
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">Pass Rate</div>
              <div className="text-[26px] font-black text-bz-accent">99.2%</div>
            </div>
            <ShieldCheck className="size-[22px] text-white/30" />
            <h3 className="text-[20px] font-bold text-white mt-4 mb-2.5">Quality Control</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] max-w-[340px] mb-7">
              Per-operation inspection with real-time defect classification and rework routing.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Work Order", "Operation", "Inspected", "Result"].map((h, i) => (
                    <th key={h} className={`text-[9px] font-bold uppercase tracking-[0.1em] text-white/40 pb-3 ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { wo: "WO-1042", op: "Final Assembly", qty: 50, pass: true  },
                  { wo: "WO-1039", op: "Pressure Test",  qty: 80, pass: true  },
                  { wo: "WO-1038", op: "Surface Coat",   qty: 60, pass: false },
                ].map(row => (
                  <tr key={row.wo} className="border-b border-white/[0.04]">
                    <td className="text-[11px] font-bold text-white tracking-tight py-3">{row.wo}</td>
                    <td className="text-[11px] text-white/60 py-3">{row.op}</td>
                    <td className="text-[11px] text-white/40 py-3">{row.qty} pcs</td>
                    <td className="py-3 text-right">
                      <PillBadge tone={row.pass ? "accent" : "neutral"} dot>
                        {row.pass ? "Pass" : "Rework"}
                      </PillBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PRODUCTION INTELLIGENCE ──────────────────────────────────────────────────

function IntelligenceSection() {
  const factors = [
    { label: "Availability", value: 94, desc: "Planned vs actual uptime" },
    { label: "Performance",  value: 93, desc: "Actual vs theoretical speed" },
    { label: "Quality",      value: 99, desc: "Good units vs total produced" },
  ];
  const kpis = [
    { Icon: TrendingUp,  label: "OEE",            value: "87.3%", sub: "↑ 2.1% vs last month",pos: true  },
    { Icon: RefreshCw,   label: "Avg Cycle Time", value: "4.2h",  sub: "↓ 0.6h vs target",    pos: true  },
    { Icon: BarChart3,   label: "Throughput",     value: "2,840", sub: "Units today",         pos: false },
    { Icon: Lock,        label: "Scrap Rate",     value: "0.8%",  sub: "↓ 0.2% this quarter", pos: true  },
  ];

  return (
    <Section tone="light">
      <Container>
        <SectionHeading eyebrow="Analytics" title="Production Intelligence" align="center" className="mb-16" />

        <div className="grid grid-cols-[3fr_1fr] gap-5 items-start">
          <div className="bg-bz-surface border border-bz-border rounded-[32px] p-11">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-[18px] font-bold text-bz-text mb-1.5">Overall Equipment Effectiveness</h3>
                <p className="text-[13px] text-bz-text-muted">Real-time OEE breakdown across all production lines</p>
              </div>
              <span className="px-3 py-1 bg-bz-bg rounded-bz-sm text-[10px] font-bold text-bz-text-muted">Week 19</span>
            </div>

            <div className="flex items-center gap-3 mb-11">
              {factors.map((f, i) => (
                <div key={f.label} className="flex items-center flex-1 gap-3">
                  <div className="flex-1 bg-bz-bg rounded-bz-2xl border border-bz-border p-5 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-bz-text-muted mb-2.5">{f.label}</div>
                    <div className="text-[30px] font-black text-bz-text tracking-[-0.03em] mb-2">{f.value}%</div>
                    <div className="h-1 bg-bz-border rounded-full overflow-hidden">
                      <div className="h-full bg-bz-text rounded-full" style={{ width: `${f.value}%` }} />
                    </div>
                    <div className="text-[10px] text-bz-text-muted mt-2">{f.desc}</div>
                  </div>
                  {i < factors.length - 1 && (
                    <span className="text-[18px] font-black text-bz-border flex-shrink-0">×</span>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[18px] font-black text-bz-border">=</span>
                <div className="bg-bz-deep rounded-bz-2xl p-5 text-center min-w-[120px]">
                  <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/50 mb-2.5">OEE Score</div>
                  <div className="text-[30px] font-black text-bz-accent tracking-[-0.03em] mb-2">87.3%</div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-bz-accent rounded-full" style={{ width: "87.3%" }} />
                  </div>
                  <div className="text-[10px] text-white/40 mt-2">World class: 85%+</div>
                </div>
              </div>
            </div>

            <div className="relative h-[100px]">
              <svg viewBox="0 0 800 100" fill="none" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mfgGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%"   stopColor="var(--bz-sage)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--bz-sage)" stopOpacity="0"    />
                  </linearGradient>
                </defs>
                <path d="M0 70C100 70 150 45 200 50C280 58 320 80 400 65C480 50 530 25 600 30C670 35 720 55 800 40L800 100 0 100Z" fill="url(#mfgGrad)" />
                <path d="M0 70C100 70 150 45 200 50C280 58 320 80 400 65C480 50 530 25 600 30C670 35 720 55 800 40" stroke="var(--bz-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="absolute top-[10%] left-[54%] bg-bz-surface border border-bz-border px-3.5 py-2 rounded-bz-md text-center shadow-md">
                <div className="text-[8px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-0.5">Peak OEE</div>
                <div className="text-[14px] font-bold text-bz-text">91.4% — Wk 14</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {kpis.map(k => (
              <div key={k.label} className="bg-bz-bg rounded-[24px] border border-bz-border p-5">
                <k.Icon className="size-5 text-bz-text" />
                <div className="mt-4">
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-1">{k.label}</div>
                  <div className="text-[20px] font-bold text-bz-text tracking-[-0.02em]">{k.value}</div>
                  <div className={`text-[10px] font-bold mt-1 ${k.pos ? "text-green-700" : "text-bz-text-muted"}`}>{k.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── CONNECTIVITY ─────────────────────────────────────────────────────────────

function ConnectivitySection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Seamless Connectivity"
          title={<>Manufacturing connected directly<br />to inventory and finance</>}
          tone="light"
          align="center"
          maxWidth={560}
          className="mb-24"
        />
        <div className="flex items-center justify-center flex-wrap">
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <Warehouse className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Inventory</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Material availability checked before WO release. Consumption auto-posted on completion.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">MATERIAL ISSUE</span>
              <span className="text-[9px] font-bold text-bz-accent">Auto-Posted</span>
            </div>
          </div>

          <div className="w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-bz-accent flex items-center justify-center">
              <Settings className="size-10 text-bz-text" strokeWidth={1.6} />
            </div>
            <div className="text-[10px] font-black tracking-[0.3em] text-bz-accent uppercase">Manufacturing Hub</div>
          </div>

          <div className="w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <DollarSign className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Finance</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Actual production costs — material, labor, and overhead — journal-posted instantly.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">COST VARIANCE</span>
              <span className="text-[9px] font-bold text-bz-accent">Auto Journaled</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export function ManufacturingProductPage() {
  return (
    <>
      <HeroCentered
        badge={<HeroBadge>Manufacturing Module</HeroBadge>}
        title={<>From raw material to finished goods —<br /><span className="text-bz-sage">on time, every run</span></>}
        description="Plan production, manage BOMs, schedule work orders, and monitor shop floor performance — all in one unified system."
        actions={
          <>
            <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
            <Button variant="outline" size="lg">Explore Features</Button>
          </>
        }
        visual={<HeroDashboard />}
      />

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Core Capabilities"
            title={<>Every production process,<br />engineered to run leaner</>}
            maxWidth={680}
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {CAPABILITIES.map(({ Icon, title, desc }) => (
              <Card key={title} hover="lift" pad="md">
                <IconBadge tone="sage" size="md" className="mb-6">
                  <Icon className="size-5" />
                </IconBadge>
                <h3 className="font-bold text-[16px] text-bz-text mb-2.5">{title}</h3>
                <p className="text-[13px] text-bz-text-muted leading-[1.65]">{desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <TechShowcaseSection />
      <IntelligenceSection />
      <ConnectivitySection />

      <Section tone="white">
        <Container>
          <SectionHeading eyebrow="Efficiency" title="Measurable impact on the shop floor" align="center" className="mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {METRICS.map(m => (
              <Card key={m.label} hover="lift" pad="lg" className="text-center">
                <div className="text-[52px] font-black text-bz-text tracking-[-0.04em] mb-3">{m.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-4">{m.label}</div>
                <p className="text-[13px] text-bz-text-muted leading-[1.65]">{m.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="dark">
        <Container width="narrow">
          <SectionHeading
            title={<>Run your factory floor<br /><span className="text-bz-accent">with complete precision</span></>}
            description="Join 500+ manufacturers optimizing the shop floor with Bizak's end-to-end production management system."
            tone="light"
            align="center"
            maxWidth={580}
            className="mb-10"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="accent" size="lg" href="https://system.bizakerp.com/account/self-register" withArrow>
              Start Free Trial
            </Button>
            <Button variant="ghostDark" size="lg" href="/contact">
              Book a Demo
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
