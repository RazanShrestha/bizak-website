// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#010201",
  accent: "#aef831",
  white: "#ffffff",
  fcfcfc: "#fcfcfc",
  onSurface: "#191c1c",
  onSurfaceVar: "#444844",
  finDark: "#0a0a0a",
  finGray: "#1a1a1a",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  borderLight: "rgba(229,231,235,0.8)",
};

// ─── SVG Icon helper ──────────────────────────────────────────────────────────
function Ico({ d, size = 20, color = "currentColor", strokeWidth = 1.8 }: {
  d: string | string[]; size?: number; color?: string; strokeWidth?: number;
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
  const steps = ["PLAN", "EST", "TRACK", "BILL"];
  const labels = ["Planning", "Estimation", "Tracking", "Billing"];

  return (
    <section style={{ paddingTop: 96, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, background: C.fcfcfc }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" as const, marginBottom: 64 }}>
        <span style={{
          display: "inline-block",
          padding: "5px 14px",
          background: "rgba(174,248,49,0.1)",
          border: "1px solid rgba(174,248,49,0.3)",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          color: "#4b5563",
          borderRadius: 999,
          marginBottom: 32,
        }}>Enterprise Project Control</span>

        <h1 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(36px, 5.5vw, 60px)",
          fontWeight: 800,
          lineHeight: 1.1,
          color: C.primary,
          marginBottom: 28,
          letterSpacing: "-0.03em",
        }}>
          Track every cost.<br />Protect every project margin.
        </h1>

        <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Manage budgets, allocate resources, and monitor real-time project profitability with precision intelligence.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
          <a href="/contact" style={{
            padding: "14px 32px", background: C.primary, color: C.white,
            borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}>Request Demo</a>
          <button style={{
            padding: "14px 32px", background: C.white,
            border: `1px solid ${C.borderLight}`,
            borderRadius: 8, fontWeight: 700, fontSize: 14, color: C.primary, cursor: "pointer",
          }}>View features</button>
        </div>
      </div>

      {/* Dashboard Mockup */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          background: C.white, borderRadius: 20,
          boxShadow: "0 25px 60px -10px rgba(0,0,0,0.12)",
          border: `1px solid ${C.borderLight}`,
          overflow: "hidden", padding: 8,
        }}>
          <div style={{
            background: "#f9f9f9", borderRadius: 14,
            border: `1px solid ${C.borderLight}`,
            padding: 32, display: "flex", gap: 32, flexWrap: "wrap" as const,
          }}>
            {/* Sidebar skeleton */}
            <div style={{ width: 200, flexShrink: 0 }}>
              <div style={{ height: 40, background: "#e5e7eb", borderRadius: 8, marginBottom: 16 }} />
              <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, marginBottom: 8, width: "75%" }} />
              <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, marginBottom: 20, width: "50%" }} />
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: 32, background: C.white, border: `1px solid ${C.borderLight}`, borderRadius: 6 }} />
                ))}
              </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                <div style={{ padding: "20px 24px", background: C.white, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
                  <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 6 }}>PROJECT HEALTH</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: C.primary, display: "flex", alignItems: "center", gap: 8 }}>
                    92%
                    <span style={{
                      fontSize: 9, background: "rgba(174,248,49,0.15)", color: "#446900",
                      padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                    }}>STABLE</span>
                  </p>
                </div>
                <div style={{ padding: "20px 24px", background: C.white, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
                  <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 6 }}>BUDGET VS ACTUAL</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>+$124k</p>
                </div>
                <div style={{ padding: "20px 24px", background: C.white, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
                  <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 6 }}>COST BREAKDOWN</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: C.primary }}>4 Active</p>
                </div>
              </div>

              {/* Workflow card */}
              <div style={{ padding: 32, background: C.white, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
                  <h4 style={{ fontWeight: 700, color: "#1f2937", fontSize: 14 }}>Project Workflow: #PX-904</h4>
                  <span style={{
                    fontSize: 9, background: C.accent, color: C.primary,
                    padding: "3px 8px", borderRadius: 4, fontWeight: 700,
                  }}>LIVE</span>
                </div>

                {/* Step indicators */}
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px" }}>
                  <div style={{
                    position: "absolute", top: "50%", left: 16, right: 16,
                    height: 2, background: "#f3f4f6", transform: "translateY(-50%)", zIndex: 0,
                  }} />
                  {steps.map((step, i) => (
                    <div key={step} style={{
                      position: "relative", zIndex: 1,
                      width: 48, height: 48,
                      background: i === 2 ? C.primary : "#f9fafb",
                      border: i === 2 ? "4px solid #fff" : `1px solid ${C.borderLight}`,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                      color: i === 2 ? C.white : "#9ca3af",
                      boxShadow: i === 2 ? "0 4px 16px rgba(0,0,0,0.15)" : "none",
                    }}>{step}</div>
                  ))}
                </div>

                {/* Step labels */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "0 8px" }}>
                  {labels.map((label, i) => (
                    <span key={label} style={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                      color: i === 2 ? C.primary : "#9ca3af",
                    }}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. CAPABILITIES ──────────────────────────────────────────────────────────
const features = [
  {
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 0 2-2z",
    title: "Project Planning",
    desc: "Comprehensive multi-phase milestone tracking with dynamic Gantt visualization and dependency modeling.",
  },
  {
    icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22 M16 14h.01",
    title: "Budgeting & Estimation",
    desc: "Hierarchical cost modeling and automated margin protection guardrails powered by historical analysis.",
  },
  {
    icon: "M18 20V10M12 20V4M6 20v-6",
    title: "Cost Tracking",
    desc: "Real-time ledger integration captures every project expense the moment it's committed in the field.",
  },
  {
    icon: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
    title: "Resource Allocation",
    desc: "Optimize workforce and specialized equipment across the entire project portfolio for maximum utilization.",
  },
  {
    icon: "M12 2v20M2 12h20",
    title: "Timesheets",
    desc: "High-precision labor tracking linked to job cost codes and site-specific labor burden multipliers.",
  },
  {
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M14 2v7h7 M16 13H8 M16 17H8 M10 9H8",
    title: "Project Billing",
    desc: "Automated AIA-style progress billing based on verified site milestones or time-and-materials data.",
  },
];

function CapabilitiesSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#9ca3af", display: "block", marginBottom: 18 }}>Capabilities</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          color: C.primary,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          marginBottom: 56,
        }}>Precision Engineering for Projects</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 50 }}>
          {features.map((f) => (
            <div key={f.title}
              style={{
                padding: 32, background: "#f9f9f9", borderRadius: 16,
                border: `1px solid ${C.borderLight}`, transition: "border-color 0.2s", cursor: "default",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.accent}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.borderLight}
            >
              <div style={{
                width: 40, height: 40, background: C.white, borderRadius: 8,
                border: `1px solid ${C.borderLight}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <Ico d={f.icon} size={18} color="#4b5563" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: C.primary, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. DARK SHOWCASE ─────────────────────────────────────────────────────────
function DarkShowcaseSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.finDark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#52525b", display: "block", marginBottom: 18 }}>Technical Showcase</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          color: C.white,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: 640,
          marginBottom: 64,
        }}>
          High-fidelity tools for the<br />modern project team
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {/* Card 1: Real-time Job Costing */}
          <div style={{
            background: C.finGray, borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 36, display: "flex", flexDirection: "column" as const,
            justifyContent: "space-between", minHeight: 450,
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
              }}>
                <Ico d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" size={18} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Real-time Job Costing</h3>
              <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 48 }}>
                Track every PO and labor shift against project codes with live reconciliation.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)", padding: 24,
            }}>
              {[
                { label: "PO #8841: Concrete", value: "+$1,200" },
                { label: "Labor Shift: Grade II", value: "+$4,500" },
                { label: "Logistics: Haulage", value: "+$890" },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: i < 2 ? 16 : 0,
                  marginBottom: i < 2 ? 16 : 0,
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <span style={{ fontSize: 12, color: C.zinc400 }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Project Control */}
          <div style={{
            background: C.finGray, borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 36, display: "flex", flexDirection: "column" as const,
            justifyContent: "space-between", minHeight: 450,
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
              }}>
                <Ico d="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" size={18} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Project Control</h3>
              <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 32 }}>
                Maintain strict project hygiene with intelligent approval workflows and margin guardrails.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {[
                { abbr: "PM", label: "PM Approval", dot: "#22c55e", pulse: false },
                { abbr: "EX", label: "Exec Review > $100k", dot: "#eab308", pulse: true },
              ].map((row) => (
                <div key={row.label} style={{
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: "rgba(174,248,49,0.15)", color: C.accent,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                    }}>{row.abbr}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.zinc400 }}>{row.label}</span>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.dot }} />
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Resource Heatmap */}
          <div style={{
            background: C.finGray, borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 36, display: "flex", flexDirection: "column" as const,
            justifyContent: "space-between", minHeight: 400,
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
              }}>
                <Ico d="M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z" size={18} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Resource Heatmap</h3>
              <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 48 }}>
                Dynamic workforce utilization across all active job sites.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "14px 14px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              padding: 24, flex: 1,
              display: "flex", flexDirection: "column" as const, justifyContent: "center",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { opacity: 1 }, { opacity: 0.4 }, { opacity: 0.1 }, { opacity: 0.8 },
                ].map((cell, i) => (
                  <div key={i} style={{
                    aspectRatio: "1", borderRadius: 4,
                    background: `rgba(174,248,49,${cell.opacity})`,
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Profitability Analysis */}
          <div style={{
            background: C.finGray, borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 36, minHeight: 400,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ico d="M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6" size={18} color={C.accent} />
              </div>
              <div style={{ textAlign: "right" as const }}>
                <p style={{ fontSize: 9, color: C.zinc500, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 4 }}>NET ROI</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>+24.5%</p>
              </div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Profitability Analysis</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 32 }}>
              Direct job costing linked to automated revenue recognition for absolute margin integrity.
            </p>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
              {[
                { project: "Metropolis Tower", health: "A+ Health" },
                { project: "Bridge Deck A", health: "B+ Health" },
              ].map((row, i) => (
                <div key={row.project} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{row.project}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>{row.health}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. INTELLIGENCE ──────────────────────────────────────────────────────────
function IntelligenceSection() {
  const metrics = [
    { label: "MARGIN PER PROJECT", value: "+19.4%", sub: "↑ 2.1%", subColor: "#22c55e", accent: true },
    { label: "COST VARIANCE", value: "-2.1%", sub: "Optimized", subColor: "#9ca3af", accent: false },
    { label: "UTILIZATION %", value: "88.5%", sub: "", subColor: "", accent: false },
    { label: "COMPLETION RATE", value: "94.2%", sub: "", subColor: "", accent: false },
  ];

  return (
    <section style={{ padding: "96px 32px", background: C.fcfcfc }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: 64 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#9ca3af", display: "block", marginBottom: 18 }}>Reporting</span>
          <h2 style={{
            fontFamily: "Manrope, Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700, color: C.primary, letterSpacing: "-0.02em",
          }}>Executive Project Analytics</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 24, }}>
          {/* Chart */}
          <div style={{
            background: C.white, borderRadius: 24, padding: 40,
            border: `1px solid ${C.borderLight}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>Margin Trends &amp; Variances</h3>
                <p style={{ fontSize: 11, color: "#9ca3af" }}>Consolidated performance across 12 active sites</p>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, background: "#f3f4f6",
                padding: "4px 10px", borderRadius: 6, color: C.onSurfaceVar,
              }}>FY2024</span>
            </div>
            <div style={{ position: "relative", height: 240 }}>
              <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,20" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
                <path d="M0,90 Q50,50 100,80 T200,60 T300,90 T400,50" fill="none" stroke="#e5e7eb" strokeDasharray="4 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div style={{
                position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
                background: C.primary, color: C.white,
                padding: "12px 20px", borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)", textAlign: "center" as const, whiteSpace: "nowrap" as const,
              }}>
                <p style={{ fontSize: 7, textTransform: "uppercase" as const, letterSpacing: "0.15em", opacity: 0.6, marginBottom: 4 }}>Peak Margin</p>
                <p style={{ fontSize: 18, fontWeight: 700 }}>19.4%</p>
                <p style={{ fontSize: 7, opacity: 0.6 }}>Project: Metropolis</p>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {metrics.map((m) => (
              <div key={m.label} style={{
                padding: 24, background: C.white,
                border: `1px solid ${C.borderLight}`,
                borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: m.accent ? C.accent : C.primary }}>{m.value}</p>
                {m.sub && <p style={{ fontSize: 9, fontWeight: 700, color: m.subColor, marginTop: 4 }}>{m.sub}</p>}
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
    <section style={{ padding: "96px 32px", background: C.finDark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" as const }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#52525b", display: "block", marginBottom: 20 }}>Connected System</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700, color: C.white, letterSpacing: "-0.02em",
          margin: "0 auto 96px",
        }}>Project Intelligence Node</h2>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" as const }}>
          {/* Finance node */}
          <div style={{
            width: 130, minHeight: 160,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            display: "flex", flexDirection: "column" as const, alignItems: "center",
            justifyContent: "center", padding: 24, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.accent}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <div style={{
              width: 40, height: 40, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <Ico d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" size={20} color={C.zinc500} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 12 }}>Finance</p>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />
            <p style={{ fontSize: 8, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>ERP Sync</p>
          </div>

          {/* Connector */}
          <div style={{
            flex: 1, maxWidth: 120, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(174,248,49,0.5), transparent)",
          }} />

          {/* Project Hub */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: -48,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(174,248,49,0.25) 0%, transparent 65%)",
              filter: "blur(20px)", zIndex: 0,
            }} />
            <div style={{
              position: "relative", zIndex: 1,
              width: 120, height: 120, borderRadius: "50%",
              background: C.accent,
              display: "flex", flexDirection: "column" as const, alignItems: "center",
              justifyContent: "center", color: C.primary,
              boxShadow: "0 0 60px rgba(174,248,49,0.35)",
            }}>
              <Ico d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M2 12h2 M20 12h2" size={32} color={C.primary} strokeWidth={2} />
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.2em", textAlign: "center" as const, lineHeight: 1.2, marginTop: 4 }}>Project<br />Hub</p>
            </div>
          </div>

          {/* Connector */}
          <div style={{
            flex: 1, maxWidth: 120, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(174,248,49,0.5), transparent)",
          }} />

          {/* Inventory node */}
          <div style={{
            width: 130, minHeight: 160,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            display: "flex", flexDirection: "column" as const, alignItems: "center",
            justifyContent: "center", padding: 24, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.accent}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <div style={{
              width: 40, height: 40, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <Ico d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" size={20} color={C.zinc500} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 12 }}>Inventory</p>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />
            <p style={{ fontSize: 8, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Asset Sync</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. IMPACT METRICS ────────────────────────────────────────────────────────
function MetricsSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" as const }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#9ca3af", display: "block", marginBottom: 18 }}>Impact</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700, color: C.primary, letterSpacing: "-0.02em",
          marginBottom: 80,
        }}>Measurable impact on project margins</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 55 }}>
          {[
            { value: "20%", label: "Profitability Increase", desc: "Automated tracking and reconciliation workflows capture leaked revenue immediately.", accent: true },
            { value: "35%", label: "Better Cost Control", desc: "Reduce uncaptured site expenses and labor variances with real-time field data.", accent: false },
            { value: "100%", label: "Cost Visibility", desc: "Real-time margin visibility across the entire project lifecycle, from site to C-suite.", accent: false },
          ].map((m) => (
            <div key={m.label}
              style={{
                padding: 40, border: `1px solid ${C.borderLight}`,
                borderRadius: 20, textAlign: "center" as const, transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <p style={{
                fontSize: 52, fontWeight: 900, marginBottom: 16,
                letterSpacing: "-0.04em", fontFamily: "Manrope, Inter, sans-serif",
                color: m.accent ? C.accent : C.primary,
              }}>{m.value}</p>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "#9ca3af", marginBottom: 20 }}>{m.label}</p>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function ProjectAndJobCostingPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <HeroSection />
      <CapabilitiesSection />
      <DarkShowcaseSection />
      <IntelligenceSection />
      <ConnectedSystemSection />
      <MetricsSection />
    </div>
  );
}
