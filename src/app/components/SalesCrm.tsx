// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
     deep: "#1A1D19",
  primary: "#010201",
  accent: "#aef831",
  accentDim: "rgba(174,248,49,0.15)",
  accentGlow: "rgba(174,248,49,0.3)",
  white: "#ffffff",
  bg: "#f8faf9",
  surface: "#ffffff",
  surfaceLow: "#f3f4f3",
  surfaceMid: "#edeeed",
  surfaceHigh: "#e7e8e7",
  dark: "#0a0a0a",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  zinc300: "#d4d4d8",
  outline: "#c5c7c2",
  onSurface: "#191c1c",
  onSurfaceVar: "#444844",
  gray: "#757873",
    bgDark: "#1a1d19",
  border: "rgba(197,199,194,0.3)",
  borderDark: "rgba(255,255,255,0.05)",
  red: "#ba1a1a",
  green: "#446900",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
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

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function HeroSection() {
  const workflowSteps = [
    { label: "Lead", active: true, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
    { label: "Qualified", active: true, icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" },
    { label: "Proposal", active: false, icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
    { label: "Won", active: false, icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  ];

  return (
    <section style={{ paddingTop: 96, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, background: C.surface }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        {/* Badge */}
        <div style={{
          display: "inline-block",
          padding: "6px 18px",
          background: C.surfaceHigh,
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: C.onSurfaceVar,
          textTransform: "uppercase",
          marginBottom: 44,
        }}>Sales Module</div>

        <h1 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(36px, 5.5vw, 62px)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.04em",
          color: C.primary,
          maxWidth: 900,
          margin: "0 auto 28px",
        }}>
          Control sales and customer<br />relationships with precision
        </h1>

        <p style={{ fontSize: 17, color: C.onSurfaceVar, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Streamline your revenue lifecycle from lead to final payment. Centralize sales communication and automate approval workflows in one high-fidelity interface.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
          <a href="/Contact" style={{
            padding: "14px 32px", background: C.primary, color: C.white,
            borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}>Request Demo</a>
          <button style={{
            padding: "14px 32px", background: C.white,
            border: `1px solid rgba(197,199,194,0.5)`,
            borderRadius: 10, fontWeight: 700, fontSize: 14, color: C.primary, cursor: "pointer",
          }}>View features</button>
        </div>

        {/* Dashboard Mockup */}
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            background: C.white,
            borderRadius: 24,
            border: `1px solid ${C.border}`,
            boxShadow: "0 25px 60px -10px rgba(0,0,0,0.12)",
            overflow: "hidden",
            display: "flex",
            height: 480,
          }}>
            {/* Sidebar */}
            <div style={{ width: 200, background: C.primary, padding: 28, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>
              {[0.75, 0.5, 0.85, 0.6].map((w, i) => (
                <div key={i} style={{ height: 14, background: "rgba(255,255,255,0.1)", borderRadius: 4, width: `${w * 100}%` }} />
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: 40, background: C.surface, display: "flex", flexDirection: "column" }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 40 }}>
                {[
                  { label: "Open Leads", value: "142" },
                  { label: "Pipeline Value", value: "$84.2k" },
                  { label: "Avg. Cycle", value: "4.2 Days" },
                ].map((s, i) => (
                  <div key={s.label} style={{
                    textAlign: "left",
                    paddingLeft: i > 0 ? 28 : 0,
                    borderLeft: i > 0 ? `1px solid rgba(197,199,194,0.3)` : "none",
                    marginLeft: i > 0 ? 28 : 0,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(68,72,68,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: C.primary, letterSpacing: "-0.03em" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Workflow */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h4 style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>Sales Workflow</h4>
                  <span style={{ background: C.accent, color: C.primary, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>LIVE</span>
                </div>
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{
                    position: "absolute", left: 0, right: 0, height: 2,
                    background: "rgba(197,199,194,0.3)", top: "50%", transform: "translateY(-50%)", zIndex: 0,
                  }} />
                  {workflowSteps.map((step) => (
                    <div key={step.label} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: step.active ? C.primary : C.surfaceHigh,
                        border: step.active ? "none" : `1px solid rgba(197,199,194,0.5)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: step.active ? C.white : C.onSurfaceVar,
                      }}>
                        <Ico d={step.icon} size={16} color={step.active ? C.white : C.onSurfaceVar} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: step.active ? C.primary : C.onSurfaceVar }}>{step.label}</span>
                    </div>
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

// ─── 2. OVERVIEW / FEATURE GRID ───────────────────────────────────────────────
const capabilities = [
  {
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8M19 8v6M22 11h-6",
    title: "Lead Management",
    desc: "Centralize lead details, performance ratings, and contact history in a unified view.",
  },
  {
    icon: "M3 3h6l2 3H9M3 3v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7",
    title: "Deal Pipeline",
    desc: "Dynamic deal stages based on probability, department, or project complexity.",
  },
  {
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    title: "Customer 360",
    desc: "Instant customer insights with 3-way matching of communication, deals, and history.",
  },
  {
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    title: "Quotation & Orders",
    desc: "Direct quote generation for real-time financial accuracy and automated contract creation.",
  },
  {
    icon: "M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4",
    title: "Activity Tracking",
    desc: "Deal status updates automatically upon interaction receipt or stage movement.",
  },
  {
    icon: "M18 20V10M12 20V4M6 20v-6",
    title: "Sales Reporting",
    desc: "Deep insights into conversion patterns and revenue growth opportunities.",
  },
];

function OverviewSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.onSurfaceVar, display: "block", marginBottom: 18 }}>Overview</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 600,
          color: C.primary,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: 700,
          marginBottom: 56,
        }}>
          A structured sales system<br />built for operational control
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 50 }}>
          {capabilities.map((cap) => (
            <div key={cap.title}
              style={{
                padding: 32,
                background: "rgba(243,244,243,0.4)",
                borderRadius: 18,
                border: `1px solid rgba(197,199,194,0.2)`,
                transition: "border-color 0.2s",
                cursor: "default",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(1,2,1,0.2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(197,199,194,0.2)"}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: C.white, border: `1px solid rgba(197,199,194,0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 28, color: C.onSurface,
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

// ─── 3. DARK TECHNICAL SHOWCASE ───────────────────────────────────────────────
function TechShowcaseSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.dark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.zinc500, display: "block", marginBottom: 18 }}>Technical Showcase</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 600,
          color: C.white,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: 700,
          marginBottom: 64,
        }}>High-fidelity tools for the<br />modern sales team</h2>

        {/* Top row: large + side card */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Pipeline Intelligence */}
          <div style={{
            background: "rgba(24,24,27,0.5)", borderRadius: 28, padding: 44,
            border: `1px solid ${C.borderDark}`, position: "relative", overflow: "hidden",
          }}>
            <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Pipeline Intelligence</h3>
            <p style={{ fontSize: 13, color: C.zinc500, maxWidth: 380, lineHeight: 1.65, marginBottom: 40 }}>
              Maintain a high-performance sales engine with automated win-probability and real-time status tracking.
            </p>
            <div style={{
              background: "rgba(39,39,42,0.8)", borderRadius: 18, padding: 24,
              border: "1px solid rgba(255,255,255,0.1)", maxWidth: 380,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `rgba(174,248,49,0.1)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: C.accent, fontSize: 14,
                }}>AX</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Axeon Logistics</div>
                  <div style={{ fontSize: 10, color: C.zinc500, marginTop: 2 }}>• Active Prospect • Enterprise Tier</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {[
                  { label: "Win Probability", value: "92.4%", color: C.accent },
                  { label: "Lead Grade", value: "A+", color: C.white },
                  { label: "Touchpoints", value: "12 Total", color: C.white },
                ].map((m) => (
                  <div key={m.label}>
                    <div style={{ fontSize: 9, color: C.zinc500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Follow-ups */}
          <div style={{
            background: "rgba(24,24,27,0.5)", borderRadius: 28, padding: 36,
            border: `1px solid ${C.borderDark}`, display: "flex", flexDirection: "column",
          }}>
            <Ico d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Smart Follow-ups</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 32, flex: 1 }}>
              Dynamic multi-level engagement chains with intelligent conditional routing logic.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Sequence Approval", dot: "green", opacity: 1 },
                { label: "Review Pipeline > $50k", dot: "accent", opacity: 1 },
                { label: "Engagement Log", dot: "none", opacity: 0.4 },
              ].map((row) => (
                <div key={row.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(39,39,42,0.4)", padding: "14px 16px",
                  borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", opacity: row.opacity,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.zinc400 }}>{row.label}</span>
                  {row.dot === "green" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />}
                  {row.dot === "accent" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 20 }}>

          {/* Quotation Builder */}
          <div style={{ background: "rgba(24,24,27,0.5)", borderRadius: 28, padding: 36, border: `1px solid ${C.borderDark}` }}>
            <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Quotation Builder</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 36 }}>
              High-fidelity quote generation with precision formatting and real-time status updates.
            </p>
            <div style={{ background: "rgba(39,39,42,0.4)", padding: 20, borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 9, color: C.zinc400, fontWeight: 700, textTransform: "uppercase" }}>QT-2024-8821</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>Pending</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 6, background: "rgba(63,63,70,0.5)", borderRadius: 99, width: "100%" }} />
                <div style={{ height: 6, background: "rgba(63,63,70,0.5)", borderRadius: 99, width: "75%" }} />
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div style={{ background: "rgba(24,24,27,0.5)", borderRadius: 28, padding: 36, border: `1px solid ${C.borderDark}`, position: "relative" }}>
            <div style={{ position: "absolute", top: 36, right: 36, textAlign: "right" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Audit Score</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.accent }}>100%</div>
            </div>
            <Ico d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Customer Insights</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, maxWidth: 340, marginBottom: 36 }}>
              Direct ledger posting and automated 3-way matching for absolute financial integrity.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Digital Trail", "Source Node", "State"].map((h, i) => (
                    <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.zinc500, paddingBottom: 12, textAlign: i === 2 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { trail: "Purchase_Order", ref: "#PO-2024-8821" },
                  { trail: "Rec_Warehouse", ref: "#GRN-990-22" },
                  { trail: "Vendor_Invoice", ref: "#INV-AX-402" },
                ].map((row) => (
                  <tr key={row.trail} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ fontSize: 11, fontWeight: 600, color: C.white, padding: "12px 0" }}>{row.trail}</td>
                    <td style={{ fontSize: 11, fontFamily: "monospace", color: C.zinc400, padding: "12px 0" }}>{row.ref}</td>
                    <td style={{ padding: "12px 0", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "rgba(34,197,94,0.15)" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
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

// ─── 4. REPORTING / INTELLIGENCE ──────────────────────────────────────────────
function ReportingSection() {
  const stats = [
    { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Win Rate", value: "64.2%", sub: "↑ 4.2%", subColor: C.green },
    { icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", label: "Avg Deal", value: "$428k", sub: "Target Optimized", subColor: C.onSurfaceVar },
    { icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0", label: "Cycle Time", value: "3.2d", sub: "↓ 12%", subColor: C.red },
    { icon: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z", label: "Quota Util.", value: "74%", bar: 74 },
  ];

  return (
    <section style={{ padding: "96px 32px", background: C.surface }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.onSurfaceVar, display: "block", marginBottom: 14 }}>Reporting</span>
          <h2 style={{
            fontFamily: "Manrope, Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 600,
            color: C.primary,
            letterSpacing: "-0.02em",
          }}>Sales Intelligence</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Chart card */}
          <div style={{
            background: C.white, padding: 44, borderRadius: 32,
            border: `1px solid rgba(197,199,194,0.3)`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 52 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 6 }}>Executive Revenue Analytics</h3>
                <p style={{ fontSize: 13, color: C.onSurfaceVar }}>Consolidated global entity performance</p>
              </div>
              <span style={{
                padding: "4px 12px", background: C.surfaceHigh,
                borderRadius: 6, fontSize: 10, fontWeight: 700, color: C.onSurfaceVar,
              }}>FY2024</span>
            </div>

            <div style={{ position: "relative", height: 220 }}>
              <svg width="100%" height="100%" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 150C50 150 100 80 150 100C200 120 250 180 300 160C350 140 400 40 450 60C500 80 550 140 600 120C650 100 700 20 750 40" stroke={C.primary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0 120C50 120 100 150 150 130C200 110 250 80 300 100C350 120 400 160 450 140C500 120 550 40 600 60" stroke={C.gray} strokeDasharray="8 8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div style={{
                position: "absolute", top: "35%", left: "50%", transform: "translateX(-50%)",
                background: C.white, border: `1px solid rgba(197,199,194,0.3)`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: "10px 16px", borderRadius: 14,
                textAlign: "center", whiteSpace: "nowrap",
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(68,72,68,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Peak Rev. Identified</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>$1.24M</div>
                <div style={{ fontSize: 8, color: C.zinc400 }}>Vendor: Asia Manufacturing</div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                background: C.surfaceLow, padding: 20, borderRadius: 24,
                border: `1px solid rgba(197,199,194,0.2)`,
              }}>
                <Ico d={s.icon} size={22} color={C.primary} />
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(68,72,68,0.6)", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.primary, letterSpacing: "-0.02em" }}>{s.value}</div>
                  {s.sub && <div style={{ fontSize: 10, fontWeight: 700, color: s.subColor, marginTop: 4 }}>{s.sub}</div>}
                  {s.bar !== undefined && (
                    <div style={{ marginTop: 10, height: 4, background: "rgba(197,199,194,0.3)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.bar}%`, background: C.primary, borderRadius: 99 }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. CONNECTIVITY ──────────────────────────────────────────────────────────
function ConnectivitySection() {
  return (
    <section style={{ padding: "112px 32px", background: "#0a0b0a", color: C.white, position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.zinc500, display: "block", marginBottom: 20 }}>Seamless Connectivity</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 600,
          color: C.white,
          letterSpacing: "-0.02em",
          maxWidth: 520,
          margin: "0 auto 96px",
          lineHeight: 1.2,
        }}>Sales connected directly to inventory and finance</h2>

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
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28 }}>Real-time stock reconciliation and automated replenishment alerts.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#000", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase" }}>STOCK UPDATE</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.accent }}>+250 units</span>
            </div>
          </div>

          {/* Connector */}
          <div style={{ width: 80, height: 1, background: `rgba(174,248,49,0.3)`, flexShrink: 0 }} />

          {/* Sales Hub */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: "-50px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(174,248,49,0.2) 0%, transparent 65%)`,
              filter: "blur(20px)",
              zIndex: 0,
            }} />
            <div style={{
              position: "relative", zIndex: 1,
              width: 120, height: 120, borderRadius: "50%",
              background: C.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 80px rgba(174,248,49,0.3)`,
            }}>
              <Ico d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" size={42} color={C.primary} strokeWidth={2} />
            </div>
            <div style={{ position: "absolute", bottom: -52, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.3em", color: C.accent, textTransform: "uppercase" }}>Sales Hub</div>
            </div>
          </div>

          {/* Connector */}
          <div style={{ width: 80, height: 1, background: `rgba(174,248,49,0.3)`, flexShrink: 0 }} />

          {/* Finance node */}
          <div style={{
            flex: 1, maxWidth: 280,
            background: "rgba(24,24,27,0.8)", padding: 36, borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.05)", textAlign: "left",
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: C.zinc800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Ico d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" size={28} color={C.zinc400} />
            </div>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12 }}>Finance</h4>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28 }}>Direct ledger posting and automated accounts payable.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#000", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase" }}>LEDGER ENTRY</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.accent }}>Auto Match</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. IMPACT METRICS ────────────────────────────────────────────────────────
function MetricsSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white, borderBottom: `1px solid rgba(197,199,194,0.3)` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(68,72,68,0.6)", display: "block", marginBottom: 14 }}>Efficiency</span>
          <h2 style={{
            fontFamily: "Manrope, Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 600,
            color: C.primary,
            letterSpacing: "-0.02em",
          }}>Measurable impact on operations</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 50 }}>
          {[
            { value: "30%", label: "Faster Closure", desc: "Automated follow-ups and approval routing reduce sales cycle times significantly." },
            { value: "100%", label: "Visibility", desc: "Every interaction is logged with a full audit trail for effortless regulatory reporting." },
            { value: "25%", label: "Higher Conversion", desc: "Leverage data-driven negotiation insights to lower your average cost per lead." },
          ].map((m) => (
            <div key={m.label}
              style={{
                padding: 44, background: C.surfaceLow, borderRadius: 28,
                border: `1px solid rgba(197,199,194,0.2)`, textAlign: "center",
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


// ─── 7. CTA SECTION ──────────────────────────────────────────────────────────
 
function CTASection() {
  return (
    <section className="biz-cta-section" style={{ background: C.deep, padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(199,255,53,0.04) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(199,255,53,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: C.accentLow,
            border: `1px solid ${C.accentMid}`,
            borderRadius: 100,
            padding: "6px 18px",
            marginBottom: 32,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "block" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.08em" }}>OPEN TO ALL BACKGROUNDS</span>
        </div> */}

        <h2
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: "clamp(32px, 4.5vw, 58px)",
            fontWeight: 800,
            color: C.white,
            lineHeight: 1.08,
            margin: "0 0 20px",
            letterSpacing: "-0.03em",
          }}
        >
         Experience the future of {" "}<span style={{ color: C.accent }}>  business operations</span>
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7,
            margin: "0 auto 48px",
            maxWidth: 580,
          }}
        >
         Join 50,000+ companies scaling with FinCore. Start your <br></br>14-day free trial today.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
         href="https://system.bizakerp.com/account/self-register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.accent,
              color: C.deep,
              padding: "15px 36px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 32px rgba(199,255,53,0.35)`; }}
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
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              color: C.white,
              padding: "15px 36px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              border: `1px solid ${C.borderDark}`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.borderDark; }}
          >
           Book a demo
          </a>
        </div>

       
      </div>
    </section>
  );
}








// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function SalesAndCrmPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <HeroSection />
      <OverviewSection />
      <TechShowcaseSection />
      <ReportingSection />
      <ConnectivitySection />
      <MetricsSection />
      <CTASection/>
    </div>
  );
}
