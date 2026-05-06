import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

const C = {
  deep: "#1A1D19",
  primary: "#010201",
  accent: "#aef831",
  accentDim: "rgba(174,248,49,0.12)",
  accentGlow: "rgba(174,248,49,0.3)",
  white: "#ffffff",
  surface: "#f8faf9",
  surfaceLow: "#f3f4f3",
  surfaceHigh: "#e7e8e7",
  dark: "#0a0b0a",
  darkBg: "#1a1d1a",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  onSurface: "#191c1c",
  onSurfaceVar: "#444844",
  gray: "#757873",
  border: "rgba(197,199,194,0.3)",
  borderDark: "rgba(255,255,255,0.06)",
  green: "#446900",
  accentLow: "rgba(199,255,53,0.1)",
};

function Ico({ d, size = 20, color = "currentColor", strokeWidth = 1.8 }: {
  d: string | string[];
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function HeroSection() {
  const stats = [
    { label: "Active Work Orders", value: "47", unit: "In Progress" },
    { label: "OEE Score",          value: "87.3%", unit: "This Week"  },
    { label: "Machine Utilization", value: "92%",  unit: "Rate"       },
    { label: "Today's Output",     value: "2,840", unit: "Units"      },
  ];

  type GanttJob = { id: string; start: number; width: number; primary: boolean };
  type GanttRow = { center: string; jobs: GanttJob[] };

  const gantt: GanttRow[] = [
    { center: "Assembly",     jobs: [{ id: "WO-1042", start: 0,  width: 37, primary: true  }, { id: "WO-1046", start: 44, width: 28, primary: false }] },
    { center: "CNC Machining",jobs: [{ id: "WO-1043", start: 8,  width: 54, primary: false }] },
    { center: "Painting",     jobs: [{ id: "WO-1041", start: 0,  width: 16, primary: false }, { id: "WO-1044", start: 22, width: 44, primary: true  }] },
    { center: "QC Station",   jobs: [{ id: "WO-1045", start: 34, width: 33, primary: false }] },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <section style={{ paddingTop: 96, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, background: C.dark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 18px",
          background: C.accentDim,
          border: "1px solid rgba(174,248,49,0.2)",
          borderRadius: 999, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.2em", color: C.accent, textTransform: "uppercase",
          marginBottom: 44,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "block" }} />
          Manufacturing Module
        </div>

        <h1 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(36px, 5.5vw, 62px)", fontWeight: 700,
          lineHeight: 1.1, letterSpacing: "-0.04em", color: C.white,
          maxWidth: 860, margin: "0 auto 28px",
        }}>
          From raw material to finished goods —<br />
          <span style={{ color: C.accent }}>on time, every run</span>
        </h1>

        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Plan production, manage BOMs, schedule work orders, and monitor shop floor performance — all in one unified system.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
          <a href="/contact" style={{
            padding: "14px 32px", background: C.accent, color: C.dark,
            borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none",
            boxShadow: `0 8px 24px ${C.accentGlow}`,
          }}>Request Demo</a>
          <button style={{
            padding: "14px 32px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10, fontWeight: 700, fontSize: 14, color: C.white, cursor: "pointer",
          }}>Explore Features</button>
        </div>

        {/* Production Dashboard Mockup */}
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            background: C.darkBg, borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7)",
            overflow: "hidden",
          }}>
            {/* Chrome bar */}
            <div style={{
              background: C.zinc900, padding: "16px 32px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>BIZAK · PRODUCTION CONTROL</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
                <span style={{ fontSize: 10, color: C.accent, fontWeight: 700 }}>LIVE</span>
              </div>
            </div>

            {/* Stat tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{
                  padding: "24px 28px",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  textAlign: "left",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.zinc500, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: i === 1 ? C.accent : C.white, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: C.zinc500, marginTop: 4 }}>{s.unit}</div>
                </div>
              ))}
            </div>

            {/* Gantt production schedule */}
            <div style={{
              padding: "32px 36px 44px",
              background: "#111412",
              backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
              backgroundSize: "100% 48px, 20% 100%",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.zinc500, textTransform: "uppercase", letterSpacing: "0.1em" }}>Production Schedule — Week 19</span>
                <span style={{ fontSize: 10, color: C.accent, fontWeight: 700 }}>47 Active Work Orders</span>
              </div>

              {/* Day labels */}
              <div style={{ display: "grid", gridTemplateColumns: "116px 1fr", marginBottom: 10 }}>
                <div />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {days.map(d => (
                    <div key={d} style={{ fontSize: 9, fontWeight: 700, color: C.zinc700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>{d}</div>
                  ))}
                </div>
              </div>

              {gantt.map((row, ri) => (
                <div key={row.center} style={{
                  display: "grid", gridTemplateColumns: "116px 1fr", alignItems: "center",
                  marginBottom: ri < gantt.length - 1 ? 10 : 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.zinc500 }}>{row.center}</span>
                  <div style={{ position: "relative", height: 34, background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden" }}>
                    {/* Today marker at 40% */}
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: "40%", width: 1, background: "rgba(174,248,49,0.35)", zIndex: 2 }} />
                    {row.jobs.map((job) => (
                      <div key={job.id} style={{
                        position: "absolute", top: 5, bottom: 5,
                        left: `${job.start}%`, width: `${job.width}%`,
                        background: job.primary ? C.accent : "rgba(174,248,49,0.35)",
                        borderRadius: 4,
                        display: "flex", alignItems: "center", paddingLeft: 8, overflow: "hidden",
                        zIndex: 1,
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: job.primary ? C.dark : "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{job.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 20, display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 12, height: 4, borderRadius: 2, background: C.accent }} />
                  <span style={{ fontSize: 9, color: C.zinc500, fontWeight: 700 }}>In Progress</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 12, height: 4, borderRadius: 2, background: "rgba(174,248,49,0.35)" }} />
                  <span style={{ fontSize: 9, color: C.zinc500, fontWeight: 700 }}>Scheduled</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 1, height: 12, background: "rgba(174,248,49,0.35)" }} />
                  <span style={{ fontSize: 9, color: C.zinc500, fontWeight: 700 }}>Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. CAPABILITIES ─────────────────────────────────────────────────────────
const capabilities = [
  {
    icon: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
    title: "Bill of Materials",
    desc: "Multi-level BOM with version control, phantom items, by-product handling, and component substitution.",
  },
  {
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M12 12v6M9 15h6",
    title: "Work Order Management",
    desc: "Release, schedule, and track production orders end-to-end with real-time status and exception alerts.",
  },
  {
    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    title: "Production Scheduling",
    desc: "Capacity-aware scheduling across all work centers with forward and backward scheduling logic.",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7",
    title: "Routing & Operations",
    desc: "Define multi-step operations with time standards, labor rates, machine assignments, and setup times.",
  },
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z",
    title: "Quality Control",
    desc: "Inline QC checkpoints at each operation with rejection tracking and automatic rework order creation.",
  },
  {
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    title: "Manufacturing Costing",
    desc: "Actual vs. standard cost analysis with variance reporting across materials, labor, and overhead.",
  },
];

function CapabilitiesSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.onSurfaceVar, display: "block", marginBottom: 18 }}>Core Capabilities</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
          color: C.primary, letterSpacing: "-0.02em", lineHeight: 1.2,
          maxWidth: 680, marginBottom: 56,
        }}>
          Every production process,<br />engineered to run leaner
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              style={{
                padding: 32, background: "rgba(243,244,243,0.5)", borderRadius: 18,
                border: "1px solid rgba(197,199,194,0.2)", transition: "border-color 0.2s", cursor: "default",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(1,2,1,0.2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(197,199,194,0.2)"}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: C.white, border: "1px solid rgba(197,199,194,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28,
              }}>
                <Ico d={cap.icon} size={18} color={C.onSurface} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: C.primary, marginBottom: 10 }}>{cap.title}</h3>
              <p style={{ fontSize: 13, color: C.onSurfaceVar, lineHeight: 1.65 }}>{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. TECH SHOWCASE ────────────────────────────────────────────────────────
type BomNode = { label: string; code: string; level: number; qty: number; type: "FG" | "SFG" | "RM" };

const bomTree: BomNode[] = [
  { label: "Hydraulic Pump Assembly", code: "FG-0201",  level: 0, qty: 1, type: "FG"  },
  { label: "Motor Unit",              code: "SFG-0110", level: 1, qty: 1, type: "SFG" },
  { label: "Stator Core",             code: "RM-0441",  level: 2, qty: 1, type: "RM"  },
  { label: "Rotor Assembly",          code: "RM-0442",  level: 2, qty: 1, type: "RM"  },
  { label: "Bearing Set",             code: "RM-0115",  level: 2, qty: 2, type: "RM"  },
  { label: "Pump Casing",             code: "SFG-0120", level: 1, qty: 1, type: "SFG" },
  { label: "Cast Iron Body",          code: "RM-0203",  level: 2, qty: 1, type: "RM"  },
  { label: "Fastener Pack",           code: "RM-0022",  level: 1, qty: 4, type: "RM"  },
];

const typeColor: Record<BomNode["type"], string> = {
  FG:  C.accent,
  SFG: "rgba(174,248,49,0.6)",
  RM:  "rgba(255,255,255,0.3)",
};
const typeLabel: Record<BomNode["type"], string> = { FG: "Finished Good", SFG: "Sub-Assembly", RM: "Raw Material" };

function TechShowcaseSection() {
  const woFeed = [
    { id: "WO-1042", item: "Pump Assembly × 50",  status: "Running",  dot: C.accent         },
    { id: "WO-1043", item: "Motor Unit × 120",     status: "Queued",   dot: "rgba(174,248,49,0.5)" },
    { id: "WO-1044", item: "Casing Coat × 80",     status: "Running",  dot: C.accent         },
    { id: "WO-1045", item: "QC Final Batch #18",   status: "On Hold",  dot: "#f59e0b"        },
  ];

  const machines = [
    { name: "CNC Mill #1",   pct: 94, color: C.accent                   },
    { name: "CNC Mill #2",   pct: 71, color: "rgba(174,248,49,0.65)"    },
    { name: "Lathe #4",      pct: 88, color: "rgba(174,248,49,0.8)"     },
    { name: "Paint Booth",   pct: 52, color: "rgba(174,248,49,0.4)"     },
  ];

  return (
    <section style={{ padding: "96px 32px", background: C.darkBg, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.zinc500, display: "block", marginBottom: 18 }}>Technical Showcase</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
          color: C.white, letterSpacing: "-0.02em", lineHeight: 1.2, maxWidth: 680, marginBottom: 64,
        }}>Precision tools for the modern shop floor</h2>

        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* BOM Exploder */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 44,
            border: `1px solid ${C.borderDark}`, overflow: "hidden", position: "relative",
          }}>
            <Ico d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>BOM Exploder</h3>
            <p style={{ fontSize: 13, color: C.zinc500, maxWidth: 380, lineHeight: 1.65, marginBottom: 32 }}>
              Multi-level bill of materials with real-time availability check against current stock.
            </p>

            <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Legend */}
              <div style={{ display: "flex", gap: 20, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {(["FG", "SFG", "RM"] as BomNode["type"][]).map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: typeColor[t] }} />
                    <span style={{ fontSize: 9, color: C.zinc500, fontWeight: 700 }}>{typeLabel[t]}</span>
                  </div>
                ))}
              </div>

              {/* BOM rows */}
              {bomTree.map((node, i) => (
                <div key={node.code} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  paddingLeft: node.level * 24,
                  paddingTop: 8, paddingBottom: 8,
                  borderBottom: i < bomTree.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                }}>
                  {node.level > 0 && (
                    <span style={{ fontSize: 11, color: C.zinc700, fontFamily: "monospace", flexShrink: 0 }}>
                      {node.level === 2 ? "└─" : "├─"}
                    </span>
                  )}
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: typeColor[node.type],
                    boxShadow: node.type === "FG" ? `0 0 8px ${C.accentGlow}` : "none",
                  }} />
                  <span style={{ fontSize: 12, fontWeight: node.level === 0 ? 700 : 600, color: node.level === 0 ? C.white : C.zinc400, flex: 1 }}>{node.label}</span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: C.zinc500 }}>{node.code}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.zinc500, marginLeft: 8 }}>×{node.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Work Order Feed */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 36,
            border: `1px solid ${C.borderDark}`, display: "flex", flexDirection: "column",
          }}>
            <Ico d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Live Work Orders</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28, flex: 1 }}>
              Real-time status feed across all active production orders with priority routing.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {woFeed.map((wo) => (
                <div key={wo.id} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.05)",
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: wo.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: C.white, fontWeight: 700 }}>{wo.id}</div>
                    <div style={{ fontSize: 10, color: C.zinc500, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{wo.item}</div>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                    background: wo.status === "Running" ? C.accentDim : wo.status === "On Hold" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                    color: wo.status === "Running" ? C.accent : wo.status === "On Hold" ? "#f59e0b" : C.zinc500,
                  }}>{wo.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 20 }}>

          {/* Machine Utilization */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 36, border: `1px solid ${C.borderDark}` }}>
            <Ico d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Machine Utilization</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28 }}>
              Real-time capacity tracking with downtime classification across all work centers.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {machines.map(m => (
                <div key={m.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: C.zinc400, fontWeight: 700 }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: C.zinc500 }}>{m.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality & Output Table */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 36, border: `1px solid ${C.borderDark}`, position: "relative" }}>
            <div style={{ position: "absolute", top: 36, right: 36, textAlign: "right" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Pass Rate</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.accent }}>99.2%</div>
            </div>
            <Ico d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Quality Control</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, maxWidth: 340, marginBottom: 28 }}>
              Per-operation inspection with real-time defect classification and rework routing.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Work Order", "Operation", "Inspected", "Result"].map((h, i) => (
                    <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.zinc500, paddingBottom: 12, textAlign: i === 3 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { wo: "WO-1042", op: "Final Assembly", qty: 50, pass: true  },
                  { wo: "WO-1039", op: "Pressure Test",  qty: 80, pass: true  },
                  { wo: "WO-1038", op: "Surface Coat",   qty: 60, pass: false },
                ].map((row) => (
                  <tr key={row.wo} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ fontSize: 11, fontFamily: "monospace", color: C.white, padding: "12px 0" }}>{row.wo}</td>
                    <td style={{ fontSize: 11, color: C.zinc400, padding: "12px 0" }}>{row.op}</td>
                    <td style={{ fontSize: 11, color: C.zinc500, padding: "12px 0" }}>{row.qty} pcs</td>
                    <td style={{ padding: "12px 0", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: row.pass ? "rgba(174,248,49,0.1)" : "rgba(186,26,26,0.15)" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: row.pass ? C.accent : "#ef4444" }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: row.pass ? C.accent : "#ef4444" }}>{row.pass ? "Pass" : "Rework"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. PRODUCTION INTELLIGENCE ──────────────────────────────────────────────
function ProductionIntelligenceSection() {
  const oeeFactors = [
    { label: "Availability", value: 94, desc: "Planned vs actual uptime" },
    { label: "Performance",  value: 93, desc: "Actual vs theoretical speed" },
    { label: "Quality",      value: 99, desc: "Good units vs total produced" },
  ];

  const kpis = [
    { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "OEE",           value: "87.3%", sub: "↑ 2.1% vs last month", subColor: C.green },
    { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15", label: "Avg Cycle Time", value: "4.2h",  sub: "↓ 0.6h vs target", subColor: C.green },
    { icon: "M18 20V10M12 20V4M6 20v-6",       label: "Throughput",    value: "2,840", sub: "Units today",         subColor: C.onSurfaceVar },
    { icon: "M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 0 2-2m0 0V5a2 2 0 0 0 2-2h6a2 2 0 0 0 2 2v2M7 7h10", label: "Scrap Rate", value: "0.8%",  sub: "↓ 0.2% this quarter", subColor: C.green },
  ];

  return (
    <section style={{ padding: "96px 32px", background: C.surface }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.onSurfaceVar, display: "block", marginBottom: 14 }}>Analytics</span>
          <h2 style={{
            fontFamily: "Manrope, Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
            color: C.primary, letterSpacing: "-0.02em",
          }}>Production Intelligence</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20, alignItems: "start" }}>

          {/* OEE Breakdown card */}
          <div style={{
            background: C.white, padding: 44, borderRadius: 32,
            border: `1px solid rgba(197,199,194,0.3)`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 6 }}>Overall Equipment Effectiveness</h3>
                <p style={{ fontSize: 13, color: C.onSurfaceVar }}>Real-time OEE breakdown across all production lines</p>
              </div>
              <span style={{ padding: "4px 12px", background: C.surfaceHigh, borderRadius: 6, fontSize: 10, fontWeight: 700, color: C.onSurfaceVar }}>Week 19</span>
            </div>

            {/* OEE formula visual */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44 }}>
              {oeeFactors.map((f, i) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", flex: 1, gap: 12 }}>
                  <div style={{ flex: 1, background: "rgba(243,244,243,0.8)", borderRadius: 16, padding: "24px 20px", border: "1px solid rgba(197,199,194,0.2)", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.onSurfaceVar, marginBottom: 10 }}>{f.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: C.primary, letterSpacing: "-0.03em", marginBottom: 8 }}>{f.value}%</div>
                    <div style={{ height: 4, background: "rgba(197,199,194,0.3)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${f.value}%`, background: C.primary, borderRadius: 99 }} />
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(68,72,68,0.6)", marginTop: 8 }}>{f.desc}</div>
                  </div>
                  {i < oeeFactors.length - 1 && (
                    <span style={{ fontSize: 20, fontWeight: 900, color: "rgba(197,199,194,0.8)", flexShrink: 0 }}>×</span>
                  )}
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "rgba(197,199,194,0.8)" }}>=</span>
                <div style={{ background: C.primary, borderRadius: 16, padding: "24px 24px", textAlign: "center", minWidth: 120 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>OEE Score</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: C.accent, letterSpacing: "-0.03em", marginBottom: 8 }}>87.3%</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "87.3%", background: C.accent, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>World class: 85%+</div>
                </div>
              </div>
            </div>

            {/* Mini trend chart */}
            <div style={{ position: "relative", height: 100 }}>
              <svg width="100%" height="100%" viewBox="0 0 800 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="mfgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#aef831" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#aef831" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 70C100 70 150 45 200 50C280 58 320 80 400 65C480 50 530 25 600 30C670 35 720 55 800 40L800 100 0 100Z" fill="url(#mfgAreaGrad)" />
                <path d="M0 70C100 70 150 45 200 50C280 58 320 80 400 65C480 50 530 25 600 30C670 35 720 55 800 40" stroke={C.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{
                position: "absolute", top: "10%", left: "54%",
                background: C.white, border: `1px solid rgba(197,199,194,0.3)`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: "8px 14px", borderRadius: 10, textAlign: "center",
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(68,72,68,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Peak OEE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>91.4% — Wk 14</div>
              </div>
            </div>
          </div>

          {/* KPI stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {kpis.map((k) => (
              <div key={k.label} style={{
                background: "rgba(243,244,243,0.5)", padding: 20, borderRadius: 24,
                border: "1px solid rgba(197,199,194,0.2)",
              }}>
                <Ico d={k.icon} size={20} color={C.primary} />
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(68,72,68,0.6)", marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.primary, letterSpacing: "-0.02em" }}>{k.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: k.subColor, marginTop: 4 }}>{k.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. CONNECTED SYSTEM ──────────────────────────────────────────────────────
function ConnectedSystemSection() {
  return (
    <section style={{ padding: "112px 32px", background: C.dark, color: C.white, position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.zinc500, display: "block", marginBottom: 20 }}>Seamless Connectivity</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
          color: C.white, letterSpacing: "-0.02em", maxWidth: 560, margin: "0 auto 96px", lineHeight: 1.2,
        }}>Manufacturing connected directly to inventory and finance</h2>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>

          {/* Inventory node */}
          <div style={{
            flex: 1, maxWidth: 280,
            background: "rgba(24,24,27,0.8)", padding: 36, borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.05)", textAlign: "left",
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: C.zinc800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Ico d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" size={28} color={C.zinc400} />
            </div>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12 }}>Inventory</h4>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28 }}>Material availability checked before WO release. Consumption auto-posted on production completion.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#000", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase" }}>MATERIAL ISSUE</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.accent }}>Auto-Posted</span>
            </div>
          </div>

          {/* Connector */}
          <div style={{ width: 80, height: 1, background: "rgba(174,248,49,0.3)", flexShrink: 0 }} />

          {/* Manufacturing Hub */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: "-50px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(174,248,49,0.25) 0%, transparent 65%)",
              filter: "blur(24px)", zIndex: 0,
            }} />
            <div style={{
              position: "relative", zIndex: 1,
              width: 120, height: 120, borderRadius: "50%",
              background: C.accent, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 80px rgba(174,248,49,0.35)",
            }}>
              <Ico d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" size={44} color={C.primary} strokeWidth={1.5} />
            </div>
            <div style={{ position: "absolute", bottom: -52, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.3em", color: C.accent, textTransform: "uppercase" }}>Manufacturing Hub</div>
            </div>
          </div>

          {/* Connector */}
          <div style={{ width: 80, height: 1, background: "rgba(174,248,49,0.3)", flexShrink: 0 }} />

          {/* Finance node */}
          <div style={{
            flex: 1, maxWidth: 280,
            background: "rgba(24,24,27,0.8)", padding: 36, borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.05)", textAlign: "left",
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: C.zinc800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Ico d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" size={28} color={C.zinc400} />
            </div>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12 }}>Finance</h4>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28 }}>Actual production costs — material, labor, and overhead — journal-posted to the ledger instantly.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#000", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase" }}>COST VARIANCE</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.accent }}>Auto Journaled</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. IMPACT METRICS ───────────────────────────────────────────────────────
function MetricsSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white, borderBottom: `1px solid rgba(197,199,194,0.3)` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(68,72,68,0.6)", display: "block", marginBottom: 14 }}>Efficiency</span>
          <h2 style={{
            fontFamily: "Manrope, Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
            color: C.primary, letterSpacing: "-0.02em",
          }}>Measurable impact on the shop floor</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 50 }}>
          {[
            { value: "35%", label: "Faster Cycle Time",    desc: "Capacity-aware scheduling and routing optimizations cut average production time by more than a third." },
            { value: "28%", label: "Scrap Reduction",      desc: "Inline quality checkpoints catch defects at the source, preventing rework from propagating through the line." },
            { value: "99.2%", label: "On-Time Delivery",   desc: "Accurate lead time calculation and real-time WO tracking keeps customer commitments consistently met."   },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                padding: 44, background: "rgba(243,244,243,0.5)", borderRadius: 28,
                border: "1px solid rgba(197,199,194,0.2)", textAlign: "center",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <div style={{ fontSize: 52, fontWeight: 900, color: C.primary, marginBottom: 12, letterSpacing: "-0.04em", fontFamily: "Manrope, Inter, sans-serif" }}>{m.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.onSurfaceVar, marginBottom: 16 }}>{m.label}</div>
              <p style={{ fontSize: 13, color: "rgba(68,72,68,0.7)", lineHeight: 1.65 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. CTA ──────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ background: C.deep, padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(199,255,53,0.04) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(199,255,53,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: 800,
          color: C.white, lineHeight: 1.08, margin: "0 0 20px", letterSpacing: "-0.03em",
        }}>
          Start your next production run{" "}
          <span style={{ color: C.accent }}>with complete control</span>
        </h2>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 18, color: "rgba(255,255,255,0.55)",
          lineHeight: 1.7, margin: "0 auto 48px", maxWidth: 580,
        }}>
          Join 500+ manufacturers optimizing their shop floor with Bizak's end-to-end production management system.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://system.bizakerp.com/account/self-register"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.accent, color: C.deep, padding: "15px 36px", borderRadius: 10,
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 32px rgba(199,255,53,0.35)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = ""; }}
          >
            Start Free Trial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
          <a
            href="/contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "transparent", color: C.white, padding: "15px 36px", borderRadius: 10,
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15,
              textDecoration: "none", border: "1px solid rgba(255,255,255,0.06)",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
          >
            Book a Demo
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export function ManufacturingProductPage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <CapabilitiesSection />
        <TechShowcaseSection />
        <ProductionIntelligenceSection />
        <ConnectedSystemSection />
        <MetricsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
