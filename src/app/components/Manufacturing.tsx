// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#010201",
  accent: "#aef831",
  accentDim: "rgba(174,248,49,0.12)",
  accentGlow: "rgba(174,248,49,0.3)",
  white: "#ffffff",
  bg: "#f8faf9",
  surface: "#f8faf9",
  surfaceLow: "#f3f4f3",
  surfaceMid: "#edeeed",
  surfaceHigh: "#e7e8e7",
  dark: "#0a0b0a",
  darkBg: "#1a1d1a",
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
  border: "rgba(197,199,194,0.3)",
  borderDark: "rgba(255,255,255,0.06)",
  green: "#446900",
  red: "#ba1a1a",
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
  const stats = [
    { label: "Live Stock",  value: "1,402",  unit: "SKUs" },
    { label: "In Transit",  value: "248",    unit: "Orders" },
    { label: "Pending QC",  value: "12",     unit: "Batches" },
    { label: "Turn Over",   value: "4.2x",   unit: "Rate" },
  ];

  const flow = ["Receiving", "Storage", "Shipping"];

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
        }}>Inventory Module</div>

        <h1 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(36px, 5.5vw, 62px)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.04em",
          color: C.primary,
          maxWidth: 860,
          margin: "0 auto 28px",
        }}>
          Real-time inventory control<br />without the chaos
        </h1>

        <p style={{ fontSize: 17, color: C.onSurfaceVar, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Track every item across all warehouses in real time. Automate replenishment, manage movements, and close every cycle count with complete audit accuracy.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
          <a href="/contact" style={{
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
          }}>
            {/* Top bar */}
            <div style={{
              background: C.primary,
              padding: "16px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>BIZAK · WAREHOUSE CONTROL</div>
              <div style={{ width: 54 }} />
            </div>

            {/* Stats row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              borderBottom: `1px solid ${C.border}`,
            }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{
                  padding: "28px 32px",
                  borderLeft: i > 0 ? `1px solid ${C.border}` : "none",
                  textAlign: "left",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(68,72,68,0.6)", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: C.primary, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: C.onSurfaceVar, marginTop: 4 }}>{s.unit}</div>
                </div>
              ))}
            </div>

            {/* Warehouse flow */}
            <div style={{
              padding: "48px 48px 56px",
              background: "#f8faf9",
              backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
                {flow.map((step, i) => (
                  <div key={step} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      padding: "20px 40px",
                      background: C.white,
                      borderRadius: 16,
                      border: `1px solid ${C.border}`,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      minWidth: 130,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: i === 1 ? C.accent : C.surfaceHigh,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Ico
                          d={i === 0
                            ? "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            : i === 1
                            ? "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"
                            : "M5 12h14M12 5l7 7-7 7"}
                          size={20}
                          color={i === 1 ? C.primary : C.onSurfaceVar}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{step}</span>
                    </div>
                    {i < flow.length - 1 && (
                      <div style={{
                        width: 64, height: 2,
                        background: `linear-gradient(90deg, rgba(174,248,49,0.6), rgba(174,248,49,0.2))`,
                        margin: "0 -1px",
                        position: "relative",
                      }}>
                        <div style={{
                          position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                          width: 0, height: 0,
                          borderTop: "5px solid transparent", borderBottom: "5px solid transparent",
                          borderLeft: `6px solid rgba(174,248,49,0.5)`,
                        }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. CORE CAPABILITIES ─────────────────────────────────────────────────────
const capabilities = [
  {
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    title: "Multi-warehouse Management",
    desc: "Manage stock across multiple locations with unified visibility and zone-level control.",
  },
  {
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M12 12v6M9 15h6",
    title: "Live Stock Tracking",
    desc: "Real-time quantity updates on every movement — from receipt to dispatch to adjustment.",
  },
  {
    icon: "M5 8h14M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4",
    title: "Goods Receipt & Dispatch",
    desc: "Streamline inbound and outbound operations with automated GRN and delivery notes.",
  },
  {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15",
    title: "Reorder Management",
    desc: "Smart reorder points and automated purchase requests keep stock levels optimized.",
  },
  {
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    title: "Stock Valuation",
    desc: "FIFO, LIFO, and average cost methods with real-time valuation across all warehouses.",
  },
  {
    icon: "M18 20V10M12 20V4M6 20v-6",
    title: "Inventory Reporting",
    desc: "Comprehensive aging, movement, and valuation reports with one-click export.",
  },
];

function CapabilitiesSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.onSurfaceVar, display: "block", marginBottom: 18 }}>Core Capabilities</span>
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
          Every warehouse operation,<br />precisely under control
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
          {capabilities.map((cap) => (
            <div key={cap.title}
              style={{
                padding: 32,
                background: "rgba(243,244,243,0.5)",
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
                marginBottom: 28,
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
    <section style={{ padding: "96px 32px", background: C.darkBg, color: C.white }}>
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
        }}>High-fidelity tools for the<br />modern warehouse team</h2>

        {/* Top row: large + side */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Warehouse Control */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 44,
            border: `1px solid ${C.borderDark}`, position: "relative", overflow: "hidden",
          }}>
            <Ico d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Warehouse Control</h3>
            <p style={{ fontSize: 13, color: C.zinc500, maxWidth: 380, lineHeight: 1.65, marginBottom: 36 }}>
              Full zone-level visibility into live inventory quantities, batch status, and location accuracy across every rack.
            </p>
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 24,
              border: "1px solid rgba(255,255,255,0.06)", maxWidth: 400,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: C.accentDim,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: C.accent, fontSize: 14,
                }}>ZA</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Zone A — Main Warehouse</div>
                  <div style={{ fontSize: 10, color: C.zinc500, marginTop: 2 }}>• Active · Sector 3 · Rack 12–18</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {[
                  { label: "On-Hand Units", value: "3,842", color: C.accent },
                  { label: "Utilisation", value: "78%", color: C.white },
                  { label: "Last Audit", value: "2d ago", color: C.white },
                ].map((m) => (
                  <div key={m.label}>
                    <div style={{ fontSize: 9, color: C.zinc500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Replenishment */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 36,
            border: `1px solid ${C.borderDark}`, display: "flex", flexDirection: "column",
          }}>
            <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Smart Replenishment</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 32, flex: 1 }}>
              Auto-triggered purchase requests with configurable approval chains and priority routing.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "PO Approval Pending", dot: "accent", opacity: 1 },
                { label: "Low Stock Alert — SKU 4821", dot: "green", opacity: 1 },
                { label: "Reorder Queued", dot: "none", opacity: 0.4 },
              ].map((row) => (
                <div key={row.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(255,255,255,0.04)", padding: "14px 16px",
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

          {/* Movement Tracking */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 36, border: `1px solid ${C.borderDark}` }}>
            <Ico d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Movement Tracking</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 32 }}>
              Real-time transfer logs for every inbound and outbound movement with reference tracing.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Inbound Receipts", pct: 82, color: C.accent },
                { label: "Outbound Dispatches", pct: 64, color: "rgba(174,248,49,0.5)" },
                { label: "Internal Transfers", pct: 45, color: "rgba(174,248,49,0.25)" },
              ].map(bar => (
                <div key={bar.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: C.zinc400, fontWeight: 700 }}>{bar.label}</span>
                    <span style={{ fontSize: 10, color: C.zinc500 }}>{bar.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${bar.pct}%`, background: bar.color, borderRadius: 99, transition: "width 0.6s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cycle Counting */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 28, padding: 36, border: `1px solid ${C.borderDark}`, position: "relative" }}>
            <div style={{ position: "absolute", top: 36, right: 36, textAlign: "right" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Accuracy</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.accent }}>99.8%</div>
            </div>
            <Ico d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M12 12v6M9 15h6" size={22} color={C.zinc700} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "16px 0 10px" }}>Cycle Counting</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, maxWidth: 340, marginBottom: 32 }}>
              Scheduled and ad-hoc counts with variance detection and automated reconciliation records.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Count Ref", "Location", "Status"].map((h, i) => (
                    <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.zinc500, paddingBottom: 12, textAlign: i === 2 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { ref: "CC-2024-0441", loc: "Zone A / Rack 14" },
                  { ref: "CC-2024-0440", loc: "Zone B / Shelf 3" },
                  { ref: "CC-2024-0439", loc: "Zone A / Rack 12" },
                ].map((row) => (
                  <tr key={row.ref} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ fontSize: 11, fontFamily: "monospace", color: C.white, padding: "12px 0" }}>{row.ref}</td>
                    <td style={{ fontSize: 11, color: C.zinc400, padding: "12px 0" }}>{row.loc}</td>
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

// ─── 4. INVENTORY INTELLIGENCE ────────────────────────────────────────────────
function IntelligenceSection() {
  const stats = [
    { icon: "M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4", label: "Turn Over", value: "4.2x", sub: "↑ 0.3x", subColor: "#446900" },
    { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z", label: "Accuracy", value: "99.8%", sub: "Target Achieved", subColor: C.onSurfaceVar },
    { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Dead Stock", value: "0.82%", sub: "↓ 0.1%", subColor: "#446900" },
    { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z", label: "Fulfillment", value: "98.5%", bar: 98 },
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
          }}>Inventory Intelligence</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Chart card */}
          <div style={{
            background: C.white, padding: 44, borderRadius: 32,
            border: `1px solid rgba(197,199,194,0.3)`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 6 }}>Stock Movement Analytics</h3>
                <p style={{ fontSize: 13, color: C.onSurfaceVar }}>Inbound vs. outbound trends across all warehouses</p>
              </div>
              <span style={{
                padding: "4px 12px", background: C.surfaceHigh,
                borderRadius: 6, fontSize: 10, fontWeight: 700, color: C.onSurfaceVar,
              }}>FY2024</span>
            </div>

            <div style={{ position: "relative", height: 220 }}>
              <svg width="100%" height="100%" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#aef831" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#aef831" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 160C80 160 130 90 200 100C270 110 300 160 370 140C440 120 490 50 560 70C630 90 680 140 750 120L750 200 0 200Z" fill="url(#areaGrad)" />
                <path d="M0 160C80 160 130 90 200 100C270 110 300 160 370 140C440 120 490 50 560 70C630 90 680 140 750 120" stroke={C.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0 130C80 130 130 150 200 140C270 130 310 90 380 110C450 130 500 160 560 150C630 140 700 60 750 80" stroke={C.gray} strokeDasharray="8 8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div style={{
                position: "absolute", top: "28%", left: "50%", transform: "translateX(-50%)",
                background: C.white, border: `1px solid rgba(197,199,194,0.3)`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: "10px 18px", borderRadius: 14,
                textAlign: "center", whiteSpace: "nowrap",
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(68,72,68,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Peak Throughput</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>12,480 Units</div>
                <div style={{ fontSize: 8, color: C.zinc400 }}>Zone A · Week 42</div>
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
                <Ico d={s.icon} size={20} color={C.primary} />
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(68,72,68,0.6)", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.primary, letterSpacing: "-0.02em" }}>{s.value}</div>
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

// ─── 5. CONNECTED SYSTEM ──────────────────────────────────────────────────────
function ConnectedSystemSection() {
  return (
    <section style={{ padding: "112px 32px", background: C.dark, color: C.white, position: "relative", overflow: "hidden" }}>
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
        }}>Inventory connected directly to purchasing and finance</h2>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
          {/* Purchasing node */}
          <div style={{
            flex: 1, maxWidth: 280,
            background: "rgba(24,24,27,0.8)", padding: 36, borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.05)", textAlign: "left",
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: C.zinc800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Ico d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" size={28} color={C.zinc400} />
            </div>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12 }}>Purchasing</h4>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28 }}>Auto-generated POs when stock hits reorder thresholds, with full approval routing.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#000", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase" }}>AUTO PO</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.accent }}>Triggered</span>
            </div>
          </div>

          {/* Connector line */}
          <div style={{ width: 80, height: 1, background: `rgba(174,248,49,0.3)`, flexShrink: 0 }} />

          {/* Inventory Hub (center glow) */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: "-50px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(174,248,49,0.25) 0%, transparent 65%)`,
              filter: "blur(24px)",
              zIndex: 0,
            }} />
            <div style={{
              position: "relative", zIndex: 1,
              width: 120, height: 120, borderRadius: "50%",
              background: C.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 80px rgba(174,248,49,0.35)`,
            }}>
              <Ico d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" size={42} color={C.primary} strokeWidth={2} />
            </div>
            <div style={{ position: "absolute", bottom: -52, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.3em", color: C.accent, textTransform: "uppercase" }}>Inventory Hub</div>
            </div>
          </div>

          {/* Connector line */}
          <div style={{ width: 80, height: 1, background: `rgba(174,248,49,0.3)`, flexShrink: 0 }} />

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
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 28 }}>Real-time stock valuation feeds directly into the general ledger for instant P&L updates.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#000", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase" }}>VALUATION</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.accent }}>Auto Post</span>
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
            { value: "98%", label: "Inventory Accuracy", desc: "Cycle count discipline and real-time adjustments keep your records consistently reliable." },
            { value: "40%", label: "Lower Stockouts", desc: "Smart reorder rules prevent stock shortfalls before they impact customer commitments." },
            { value: "25%", label: "Carrying Cost Reduction", desc: "Optimized reorder quantities and dead-stock alerts cut unnecessary holding expenses." },
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

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function ManufacturingProductPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <HeroSection />
      <CapabilitiesSection />
      <TechShowcaseSection />
      <IntelligenceSection />
      <ConnectedSystemSection />
      <MetricsSection />
    </div>
  );
}
