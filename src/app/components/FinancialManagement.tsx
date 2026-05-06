// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
    deep: "#1A1D19",
  dark: "#0a0a0a",
  cardDark: "#1a1a1a",
  accent: "#d4f24d",
  accentDim: "rgba(212,242,77,0.15)",
  white: "#ffffff",
  fcfcfc: "#fcfcfc",
  f9: "#f9f9f9",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray800: "#1f2937",
  border: "#e5e7eb",
    bgDark: "#1a1d19",
  borderDark: "rgba(255,255,255,0.08)",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconClipboard({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}
function IconDollar({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconCheck({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconBuilding({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
function IconBox({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function IconChart({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  );
}
function IconShield({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function IconFile({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
function IconClock({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconBar({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconTrend({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function IconCart({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
function IconDoc({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconFinHub({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// ─── 1. HERO SECTION ─────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{ paddingTop: 80, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, background: C.fcfcfc }}>
      {/* Heading block */}
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", marginBottom: 64 }}>
        <span style={{
          display: "inline-block",
          padding: "4px 14px",
          background: "rgba(212,242,77,0.1)",
          border: "1px solid rgba(212,242,77,0.35)",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "1.6px",
          textTransform: "uppercase",
          color: C.gray600,
          marginBottom: 28,
        }}>Financial Module</span>

        <h1 style={{
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 700,
          color: C.dark,
          lineHeight: 1.15,
          marginBottom: 24,
          letterSpacing: "-0.02em",
        }}>
          Control your finances with<br />clarity and confidence
        </h1>

        <p style={{ fontSize: 17, color: C.gray500, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Streamline your financial operations from ledger to report. Centralize cash flow, automate reconciliation, and manage vendor payments in one high-fidelity interface.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <a href="/contact" style={{
            padding: "14px 32px",
            background: C.dark,
            color: "#fff",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            transition: "background 0.15s",
          }}>Request Demo</a>
          <button style={{
            padding: "14px 32px",
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            color: C.dark,
            cursor: "pointer",
            transition: "background 0.15s",
          }}>View features</button>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          background: C.white,
          borderRadius: 20,
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.12)",
          border: `1px solid ${C.border}`,
          overflow: "hidden",
          padding: 8,
        }}>
          <div style={{
            background: C.f9,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: 32,
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
          }}>
            {/* Sidebar mockup */}
            <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ height: 40, background: C.gray200, borderRadius: 8 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[0.75, 0.5, 0.65].map((w, i) => (
                  <div key={i} style={{ height: 14, background: C.gray100, borderRadius: 4, width: `${w * 100}%` }} />
                ))}
              </div>
              <div style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 32, background: C.gray100, borderRadius: 6 }} />
                <div style={{ height: 32, background: C.gray100, borderRadius: 6 }} />
              </div>
            </div>

            {/* Content mockup */}
            <div style={{ flex: 1, minWidth: 280 }}>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "CASH POSITION", value: "$1.24M" },
                  { label: "TOTAL LIABILITIES", value: "$482.4k" },
                  { label: "AVG. DPO", value: "34.2 Days" },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    padding: "20px 24px",
                    background: C.white,
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                  }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{stat.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: C.dark }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Workflow diagram */}
              <div style={{ padding: "28px 32px", background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <h4 style={{ fontWeight: 700, color: C.gray800, fontSize: 14 }}>Financial Workflow</h4>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    background: C.accent,
                    color: C.dark,
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: "0.5px",
                  }}>LIVE</span>
                </div>

                {/* Nodes */}
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px" }}>
                  {/* connector line */}
                  <div style={{
                    position: "absolute",
                    height: 2,
                    background: C.gray100,
                    left: 16,
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 0,
                  }} />
                  {[
                    { label: "JE", active: false },
                    { label: "AP", active: false },
                    { label: "RECO", active: true },
                    { label: "BS", active: false },
                  ].map((node) => (
                    <div key={node.label} style={{
                      position: "relative",
                      zIndex: 1,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: node.active ? C.gray800 : C.f9,
                      border: node.active ? `4px solid ${C.white}` : `1px solid ${C.gray200}`,
                      boxShadow: node.active ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: node.active ? C.white : C.gray400,
                    }}>{node.label}</div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "0 8px" }}>
                  {["Entry", "Approval", "Reconciliation", "Reporting"].map((lbl, i) => (
                    <span key={lbl} style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: i === 2 ? C.gray800 : C.gray400,
                    }}>{lbl}</span>
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

// ─── 2. FEATURE GRID ─────────────────────────────────────────────────────────
const features = [
  {
    icon: <IconClipboard size={18} color={C.gray600} />,
    title: "General Ledger",
    desc: "Centralize journal entries, chart of accounts, and financial periods with high-fidelity accuracy.",
  },
  {
    icon: <IconDollar size={18} color={C.gray600} />,
    title: "Accounts Payable",
    desc: "Automate invoice processing and vendor payments with dynamic multi-level approval chains.",
  },
  {
    icon: <IconCheck size={18} color={C.gray600} />,
    title: "Smart Reconciliation",
    desc: "AI-driven bank statement matching that instantly reconciles ledger accounts with real-world bank data.",
  },
  {
    icon: <IconBuilding size={18} color={C.gray600} />,
    title: "Multi-Entity Sync",
    desc: "Effortlessly manage global subsidiaries with automated intercompany eliminations and consolidations.",
  },
  {
    icon: <IconBox size={18} color={C.gray600} />,
    title: "Fixed Assets",
    desc: "Track depreciation, maintenance, and asset lifecycle events automatically within the ledger.",
  },
  {
    icon: <IconChart size={18} color={C.gray600} />,
    title: "Real-time Reporting",
    desc: "Generate GAAP and IFRS compliant financial statements instantly at the click of a button.",
  },
];

function FeatureGridSection() {
  return (
    <section style={{ padding: "96px 24px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray400 }}>Overview</span>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 700,
            color: C.dark,
            marginTop: 14,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            A structured financial system<br />built for operational control
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 50 }}>
          {features.map((f) => (
            <div key={f.title} style={{
              padding: "32px",
              background: C.f9,
              borderRadius: 14,
              border: `1px solid ${C.border}`,
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.gray300}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
            >
              <div style={{
                width: 40,
                height: 40,
                background: C.white,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: C.dark, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. TECHNICAL SHOWCASE (dark) ─────────────────────────────────────────────
function TechnicalShowcaseSection() {
  return (
    <section style={{ padding: "96px 24px", background: C.dark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray500 }}>Technical Showcase</span>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 700,
            color: C.white,
            marginTop: 14,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            High-fidelity tools for the<br />modern finance team
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 24 }}>

          {/* Card 1: Multi-Entity */}
          <div style={{
            background: C.cardDark,
            borderRadius: 20,
            padding: 32,
            border: `1px solid ${C.borderDark}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 420,
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.accent, marginBottom: 20,
              }}>
                <IconBuilding size={16} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Multi-Entity Management</h3>
              <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 40 }}>
                Consolidate multiple subsidiaries with varying currencies into a single source of truth in seconds.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              border: `1px solid rgba(255,255,255,0.1)`,
              padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 12, color: C.accent,
                }}>GL</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Global Entities</p>
                  <p style={{ fontSize: 10, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.5px" }}>4 Active Markets</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
                {[
                  { label: "CONSOLIDATED", value: "99.8%", color: C.accent },
                  { label: "TAX COMPL.", value: "A+", color: C.white },
                  { label: "ELIMINATIONS", value: "100%", color: C.white },
                ].map((m) => (
                  <div key={m.label}>
                    <p style={{ fontSize: 9, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{m.label}</p>
                    <p style={{ fontSize: 17, fontWeight: 700, color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Financial Control */}
          <div style={{
            background: C.cardDark,
            borderRadius: 20,
            padding: 32,
            border: `1px solid ${C.borderDark}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 420,
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <IconShield size={16} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Financial Control</h3>
              <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 28 }}>
                Maintain strict fiscal hygiene with intelligent conditional routing and budget checks.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { abbr: "M", label: "Manager Approval", color: "#3b82f6", bg: "rgba(59,130,246,0.2)", status: "green", pulse: false },
                { abbr: "CF", label: "CFO Review > $50k", color: C.accent, bg: `rgba(212,242,77,0.2)`, status: "yellow", pulse: true },
                { abbr: "L", label: "Compliance Log", color: C.gray500, bg: "rgba(107,114,128,0.2)", status: null, pulse: false },
              ].map((row) => (
                <div key={row.label} style={{
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 10,
                  border: `1px solid rgba(255,255,255,0.08)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: row.status === null ? 0.5 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6,
                      background: row.bg,
                      color: row.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                    }}>{row.abbr}</div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.white }}>{row.label}</span>
                  </div>
                  {row.status && (
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: row.status === "green" ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: row.status === "green" ? "#22c55e" : "#eab308",
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Cash Flow */}
          <div style={{
            background: C.cardDark,
            borderRadius: 20,
            padding: 32,
            border: `1px solid ${C.borderDark}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 360,
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <IconFile size={16} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Cash Flow Management</h3>
              <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 40 }}>
                Dynamic forecasting and debt management with real-time aging reports.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "14px 14px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              padding: 24,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { pct: "75%", color: C.accent },
                  { pct: "50%", color: C.gray400 },
                  { pct: "25%", color: "#60a5fa" },
                ].map((bar, i) => (
                  <div key={i} style={{
                    height: 8, background: "rgba(255,255,255,0.08)",
                    borderRadius: 99, position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0,
                      width: bar.pct,
                      background: bar.color,
                      borderRadius: 99,
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Financial Integration / Audit */}
          <div style={{
            background: C.cardDark,
            borderRadius: 20,
            padding: 32,
            border: `1px solid ${C.borderDark}`,
            minHeight: 360,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconClipboard size={16} color={C.accent} />
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Audit Score</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: C.accent }}>100%</p>
              </div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Financial Integration</h3>
            <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 28 }}>
              Direct ledger posting and automated 3-way matching for absolute financial integrity.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                paddingBottom: 10, borderBottom: `1px solid rgba(255,255,255,0.05)`,
                fontSize: 9, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.8px",
              }}>
                <span>Digital Trail</span><span>Source Node</span><span>State</span>
              </div>
              {[
                { trail: "Journal_Entry", ref: "#JE-2024-8821" },
                { trail: "Bank_Statement", ref: "#BS-990-22" },
                { trail: "Vendor_Invoice", ref: "#INV-AX-402" },
              ].map((row) => (
                <div key={row.trail} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: `1px solid rgba(255,255,255,0.04)`,
                  fontSize: 10, fontWeight: 700,
                }}>
                  <span style={{ color: C.white }}>{row.trail}</span>
                  <span style={{ color: C.gray400 }}>{row.ref}</span>
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: "rgba(34,197,94,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. INTELLIGENCE / REPORTING ─────────────────────────────────────────────
function IntelligenceSection() {
  return (
    <section style={{ padding: "96px 24px", background: C.fcfcfc }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray400 }}>Reporting</span>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 700,
            color: C.dark,
            marginTop: 14,
            letterSpacing: "-0.02em",
          }}>
            Finance intelligence that drives decisions
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20 }}>

          {/* Main chart card */}
          <div style={{
            background: C.white,
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            padding: 32,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              <div>
                <h3 style={{ fontWeight: 700, color: C.gray800, fontSize: 15 }}>Executive Revenue Analytics</h3>
                <p style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>Consolidated global entity performance</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: C.gray100, color: C.gray600,
                padding: "4px 10px", borderRadius: 6,
              }}>FY2024</span>
            </div>

            {/* SVG mock chart */}
            <div style={{ position: "relative", height: 200 }}>
              <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,20" fill="none" stroke={C.accent} strokeWidth="3" />
                <path d="M0,90 Q50,50 100,80 T200,60 T300,90 T400,50" fill="none" stroke={C.gray200} strokeDasharray="4 4" strokeWidth="2" />
              </svg>
              {/* Tooltip */}
              <div style={{
                position: "absolute",
                left: "50%",
                top: "28%",
                transform: "translateX(-50%)",
                background: C.dark,
                color: C.white,
                padding: "10px 16px",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}>
                <p style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.6, marginBottom: 4 }}>Peak Identified</p>
                <p style={{ fontSize: 18, fontWeight: 700 }}>$1.24M</p>
                <p style={{ fontSize: 8, opacity: 0.6 }}>Sector: Auto Manufacturing</p>
              </div>
            </div>
          </div>

          {/* Metric cards stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: <IconClock size={16} color={C.gray400} />, label: "TOTAL SPEND", value: "$428k", sub: "↓ 4.2%", subColor: "#22c55e" },
              { icon: <IconBar size={16} color={C.gray400} />, label: "VARIANCE", value: "0.82%", sub: "Target Optimized", subColor: C.gray400 },
              { icon: <IconTrend size={16} color={C.gray400} />, label: "CYCLE TIME", value: "3.2d", sub: "↓ 12%", subColor: "#22c55e" },
            ].map((m) => (
              <div key={m.label} style={{
                padding: 20,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32,
                    background: C.f9,
                    borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{m.icon}</div>
                  <IconDoc size={14} color={C.gray300} />
                </div>
                <p style={{ fontSize: 9, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>{m.value}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: m.subColor, marginTop: 4 }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. CONNECTED SYSTEM ─────────────────────────────────────────────────────
function ConnectedSystemSection() {
  return (
    <section style={{ padding: "96px 24px", background: C.dark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray500 }}>Seamless Connectivity</span>
        <h2 style={{
          fontSize: "clamp(26px, 3.5vw, 38px)",
          fontWeight: 700,
          color: C.white,
          marginTop: 14,
          marginBottom: 72,
          letterSpacing: "-0.02em",
        }}>
          Finance connected directly to<br />operations and sales
        </h2>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
          {/* Purchasing node */}
          <div style={{
            width: 128,
            height: 160,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.gray400,
            }}>
              <IconCart size={22} color={C.gray400} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Purchasing</p>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
            <p style={{ fontSize: 8, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Auto-Matching</p>
          </div>

          {/* Connector line */}
          <div style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(to right, transparent, rgba(212,242,77,0.5), transparent)`,
            minWidth: 40,
            maxWidth: 120,
          }} />

          {/* Finance Hub (center) */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute",
              inset: "-40px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,242,77,0.15) 0%, transparent 70%)",
              filter: "blur(20px)",
              zIndex: 0,
            }} />
            <div style={{
              position: "relative",
              zIndex: 1,
              width: 128,
              height: 128,
              borderRadius: "50%",
              background: C.accent,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: C.dark,
              boxShadow: `0 0 50px rgba(212,242,77,0.3)`,
              padding: 16,
            }}>
              <IconFinHub size={28} color={C.dark} />
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", marginTop: 6, lineHeight: 1.3 }}>Finance<br />Hub</p>
            </div>
          </div>

          {/* Connector line */}
          <div style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(to right, transparent, rgba(212,242,77,0.5), transparent)`,
            minWidth: 40,
            maxWidth: 120,
          }} />

          {/* Inventory node */}
          <div style={{
            width: 128,
            height: 160,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconBox size={22} color={C.gray400} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Inventory</p>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
            <p style={{ fontSize: 8, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Asset Sync</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. IMPACT METRICS ───────────────────────────────────────────────────────
function MetricsSection() {
  return (
    <section style={{ padding: "96px 24px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray400 }}>Efficiency</span>
        <h2 style={{
          fontSize: "clamp(26px, 3.5vw, 38px)",
          fontWeight: 700,
          color: C.dark,
          marginTop: 14,
          marginBottom: 72,
          letterSpacing: "-0.02em",
        }}>
          Measurable impact on financial operations
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 54 }}>
          {[
            {
              value: "60%",
              label: "Faster Month-End",
              desc: "Automated reconciliation and elimination workflows reduce close times by more than half.",
            },
            {
              value: "40%",
              label: "Reduced Errors",
              desc: "Eliminate manual data entry errors with direct bank feeds and automated ledger posting.",
            },
            {
              value: "100%",
              label: "Audit Compliance",
              desc: "A complete digital paper trail for every transaction, ensuring effortless regulatory reporting.",
            },
          ].map((m) => (
            <div key={m.label} style={{
              padding: 32,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              textAlign: "center",
              transition: "box-shadow 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <p style={{ fontSize: 52, fontWeight: 700, color: C.dark, marginBottom: 12, letterSpacing: "-0.03em" }}>{m.value}</p>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.4px", color: C.gray400, marginBottom: 16 }}>{m.label}</p>
              <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.65 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}





 
// ─── 7. CTA SECTION ──────────────────────────────────────────────────────────
// function CTASection() {
//   return (
//     <section style={{ background: C.bgDark, padding: "128px 192px", overflow: "hidden", position: "relative" }}>
//       {/* Subtle glow */}
//       <div style={{
//         position: "absolute", bottom: -293, left: -128, right: -128, height: 586,
//         background: "radial-gradient(ellipse at 50% 50%, rgba(199,255,53,0.03) 0%, transparent 70%)",
//         pointerEvents: "none",
//       }} />

//       <div style={{ maxWidth: 896, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 32, position: "relative", zIndex: 1 }}>
//         <h2 style={{
//           fontFamily: "Inter", fontWeight: 700,
//           fontSize: "clamp(36px, 4.5vw, 48px)",
//           lineHeight: 1.2, letterSpacing: "-1.2px",
//           color: "#fff", textAlign: "center", margin: 0,
//         }}>
//          Take full control of<br /> your financial operations
//         </h2>
//         <p style={{
//           fontFamily: "Inter", fontWeight: 400,
//           fontSize: 20, lineHeight: 1.625,
//           color: "rgba(255,255,255,0.4)",
//           textAlign: "center", margin: 0, maxWidth: 580,
//         }}>
//           Join 50,000+ companies scaling with FinCore. Start your 14-day free trial today.
//         </p>
//         <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
//           <button style={{
//             background: C.accent, color: C.dark, border: "none",
//             borderRadius: 4, padding: "20px 40px",
//             fontFamily: "Inter", fontWeight: 700, fontSize: 18,
//             cursor: "pointer", boxShadow: "0 0 20px rgba(199,255,53,0.4)",
//           }}>Request Demo</button>
//           <button style={{
//             background: "transparent", color: "#fff",
//             border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4,
//             padding: "20px 41px",
//             fontFamily: "Inter", fontWeight: 700, fontSize: 18, cursor: "pointer",
//           }}>Contact Sales</button>
//         </div>
//       </div>
//     </section>
//   );
// }



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
          Take full control of your{" "}<span style={{ color: C.accent }}> financial operations</span>
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
export function FinancialManagementPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <HeroSection />
      <FeatureGridSection />
      <TechnicalShowcaseSection />
      <IntelligenceSection />
      <ConnectedSystemSection />
      <MetricsSection />
       <CTASection />
    </div>
  );
}
