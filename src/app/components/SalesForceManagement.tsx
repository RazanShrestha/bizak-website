// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#010201",
  secondary: "#446900",
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
  borderDark: "1px solid rgba(255,255,255,0.06)",
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
  return (
    <section style={{ paddingTop: 96, paddingBottom: 80, paddingLeft: 32, paddingRight: 32, background: C.fcfcfc }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", marginBottom: 64 }}>
        <span style={{
          display: "inline-block",
          padding: "5px 14px",
          background: "rgba(174,248,49,0.2)",
          border: "1px solid rgba(174,248,49,0.4)",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          color: C.secondary,
          borderRadius: 999,
          marginBottom: 32,
        }}>Field Execution Platform</span>

        <h1 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(36px, 5.5vw, 60px)",
          fontWeight: 700,
          lineHeight: 1.1,
          color: C.primary,
          marginBottom: 28,
          letterSpacing: "-0.03em",
        }}>
          Empower your field sales team<br />to perform at scale
        </h1>

        <p style={{ fontSize: 17, color: C.onSurfaceVar, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Track field activity, manage routes, and monitor performance in real time with our intelligent sales force automation ecosystem.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
          <a href="/contact" style={{
            padding: "14px 32px", background: C.primary, color: C.white,
            borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}>Start Free Trial</a>
          <button style={{
            padding: "14px 32px", background: C.white,
            border: `1px solid ${C.borderLight}`,
            borderRadius: 8, fontWeight: 600, fontSize: 14, color: C.onSurface,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}>
            <Ico d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M10 8l6 4-6 4V8z" size={20} />
            Watch Demo
          </button>
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
              <div style={{ height: 36, background: "#e5e7eb", borderRadius: 8, marginBottom: 16 }} />
              <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, marginBottom: 8, width: "75%" }} />
              <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, marginBottom: 24, width: "50%" }} />
              <div style={{ height: 34, background: "#f3f4f6", borderRadius: 8, marginBottom: 8 }} />
              <div style={{ height: 34, background: "#f3f4f6", borderRadius: 8 }} />
            </div>

            {/* Main area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
                {[
                  { label: "TOTAL VISITS", value: "12.4k" },
                  { label: "TERRITORY COVERAGE", value: "94.2%" },
                  { label: "CONVERSION RATE", value: "22.8%" },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: "20px 24px", background: C.white, borderRadius: 12,
                    border: `1px solid ${C.borderLight}`,
                  }}>
                    <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 6 }}>{s.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: C.primary }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Heatmap card */}
              <div style={{
                background: C.white, borderRadius: 12,
                border: `1px solid ${C.borderLight}`,
                padding: 28, position: "relative", overflow: "hidden", minHeight: 200,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontWeight: 700, color: "#1f2937", fontSize: 14 }}>Real-time Coverage Heatmap</h4>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#f87171", "#aef831", "#010201"].map(col => (
                      <div key={col} style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
                    ))}
                  </div>
                </div>
                <div style={{ height: 120, borderRadius: 8, background: "#f3f4f6", position: "relative", overflow: "hidden" }}>
                  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <line key={`v${i}`} x1={`${i * 16.7}%`} y1="0" x2={`${i * 16.7}%`} y2="100%" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                    ))}
                    {[1, 2, 3].map(i => (
                      <line key={`h${i}`} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                    ))}
                    <circle cx="30%" cy="40%" r="45" fill="rgba(174,248,49,0.22)" />
                    <circle cx="62%" cy="55%" r="58" fill="rgba(68,105,0,0.10)" />
                    <circle cx="78%" cy="28%" r="32" fill="rgba(174,248,49,0.14)" />
                  </svg>
                </div>

                {/* Floating mobile card */}
                <div style={{
                  position: "absolute", bottom: 12, right: 12,
                  width: 80, background: C.finDark, borderRadius: 14,
                  padding: 5, border: "2px solid #1a1a1a",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                }}>
                  <div style={{
                    background: C.white, borderRadius: 10,
                    padding: "10px 6px",
                    display: "flex", flexDirection: "column" as const, alignItems: "center", textAlign: "center" as const,
                  }}>
                    <Ico d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" size={16} color={C.secondary} />
                    <p style={{ fontSize: 5.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" as const, marginTop: 5, letterSpacing: "0.08em" }}>Checked In</p>
                    <p style={{ fontSize: 6.5, fontWeight: 700, color: C.onSurface, lineHeight: 1.3, marginTop: 2 }}>Central Plaza Hub</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. CORE CAPABILITIES ─────────────────────────────────────────────────────
const features = [
  {
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    title: "Field Visit Tracking",
    desc: "Automated GPS-stamped visits and meeting logs ensure absolute transparency in field execution.",
  },
  {
    icon: "M3 5h18M3 12h18M9 19l3 3 3-3",
    title: "Route Planning",
    desc: "AI-driven daily route optimization reduces travel time and fuel costs for every field agent.",
  },
  {
    icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
    title: "Order Booking",
    desc: "Capture digital orders on-the-spot with instant cloud synchronization to central inventory.",
  },
  {
    icon: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8", "M16 11l2 2 4-4"],
    title: "Attendance & Check-ins",
    desc: "Geofenced check-ins eliminate proxy attendance and verify presence at client locations.",
  },
  {
    icon: "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16",
    title: "Territory Management",
    desc: "Dynamic visual mapping for territory balancing and efficient sales force assignment.",
  },
  {
    icon: "M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z M12 18h.01",
    title: "Mobile App Support",
    desc: "Robust offline-first capabilities ensure field reps stay productive even without a signal.",
  },
];

function CapabilitiesSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#9ca3af", display: "block", marginBottom: 18 }}>Features &amp; Utility</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          color: C.primary,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          maxWidth: 640,
          marginBottom: 56,
        }}>
          A structured management system<br />built for field sales control
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 27 }}>
          {features.map((f) => (
            <div key={f.title}
              style={{
                padding: 32, background: "#f9f9f9", borderRadius: 16,
                border: `1px solid ${C.borderLight}`, transition: "border-color 0.2s", cursor: "default",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(1,2,1,0.2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.borderLight}
            >
              <div style={{
                width: 40, height: 40, background: C.white, borderRadius: 8,
                border: `1px solid ${C.borderLight}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <Ico d={f.icon} size={18} color={C.onSurfaceVar} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: C.primary, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: C.onSurfaceVar, lineHeight: 1.65 }}>{f.desc}</p>
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
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#52525b", display: "block", marginBottom: 18 }}>Enterprise Control</span>
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
          High-fidelity tools for the<br />modern sales force
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {/* Card 1: Live Field Tracking */}
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
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24,
              }}>
                <Ico d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6a6 6 0 0 1 6 6 M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" size={18} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Live Field Tracking</h3>
              <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 48 }}>
                Real-time telemetry of every agent's movement, including idle time and visit duration metrics.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)", padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: C.accent, fontSize: 13,
                }}>FT</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 2 }}>Field Telemetry</p>
                  <p style={{ fontSize: 9, color: C.zinc500, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Active Agents: 124</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" as const, gap: 12 }}>
                {[
                  { label: "AVG. VISIT", value: "42m", color: C.accent },
                  { label: "EFFICIENCY", value: "A+", color: C.white },
                  { label: "IDLE TIME", value: "4.2%", color: C.white },
                ].map((m) => (
                  <div key={m.label}>
                    <p style={{ fontSize: 9, color: C.zinc500, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 4 }}>{m.label}</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Route Optimization */}
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
                <Ico d="M3 5h18M3 12h18M9 19l3 3 3-3" size={18} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Route Optimization</h3>
              <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 32 }}>
                Dynamic re-routing algorithms respond to real-time traffic conditions and urgent client requests.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {[
                { abbr: "TR", label: "Traffic Update", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", dot: "#22c55e", pulse: false, dim: false },
                { abbr: "AL", label: "Algo Re-routing", bg: "rgba(174,248,49,0.12)", color: C.accent, dot: "#eab308", pulse: true, dim: false },
                { abbr: "ST", label: "Static Path", bg: "rgba(113,113,122,0.15)", color: C.zinc400, dot: "", pulse: false, dim: true },
              ].map((row) => (
                <div key={row.label} style={{
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  opacity: row.dim ? 0.4 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: row.bg, color: row.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                    }}>{row.abbr}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.zinc400 }}>{row.label}</span>
                  </div>
                  {row.dot && (
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: `${row.dot}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: row.dot }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Performance Monitoring */}
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
                <Ico d="M18 20V10M12 20V4M6 20v-6" size={18} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Performance Monitoring</h3>
              <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 48 }}>
                Gamified leaderboards and individual KPI tracking drive healthy competition and team excellence.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "14px 14px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              padding: 24, flex: 1,
              display: "flex", flexDirection: "column" as const, justifyContent: "flex-end",
            }}>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                {[
                  { pct: 75, color: C.accent },
                  { pct: 50, color: "#9ca3af" },
                  { pct: 25, color: "#60a5fa" },
                ].map((bar, i) => (
                  <div key={i} style={{
                    height: 8, background: "rgba(255,255,255,0.08)",
                    borderRadius: 99, overflow: "hidden",
                  }}>
                    <div style={{ height: "100%", width: `${bar.pct}%`, background: bar.color, borderRadius: 99 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Offline-first Mobile Sync */}
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
                <Ico d="M18.36 6.64A9 9 0 0 1 20.77 15 M6.16 6.16a9 9 0 0 0 12.68 12.68 M2 2l20 20" size={18} color={C.accent} />
              </div>
              <div style={{ textAlign: "right" as const }}>
                <p style={{ fontSize: 9, color: C.zinc500, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 4 }}>Sync Score</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>100%</p>
              </div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 12, fontFamily: "Manrope, Inter, sans-serif" }}>Offline-first Mobile Sync</h3>
            <p style={{ fontSize: 13, color: C.zinc500, lineHeight: 1.65, marginBottom: 32 }}>
              Encrypted local storage with automatic delta-syncing when connectivity is restored.
            </p>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", paddingBottom: 8,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: 9, fontWeight: 700, color: C.zinc500, textTransform: "uppercase" as const,
              }}>
                <span>Activity Log</span><span>Rep ID</span><span>State</span>
              </div>
              {[
                { activity: "Order_Captured", id: "#RE-2024-81" },
                { activity: "Check_In_Log", id: "#CH-990-22" },
                { activity: "Route_Completion", id: "#RT-AX-402" },
              ].map((row) => (
                <div key={row.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.white, fontFamily: "monospace" }}>{row.activity}</span>
                  <span style={{ fontSize: 11, color: C.zinc500 }}>{row.id}</span>
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

// ─── 4. INTELLIGENCE ──────────────────────────────────────────────────────────
function IntelligenceSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.fcfcfc }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: 64 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#9ca3af", display: "block", marginBottom: 18 }}>Intelligence</span>
          <h2 style={{
            fontFamily: "Manrope, Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            color: C.primary,
            letterSpacing: "-0.02em",
          }}>Actionable intelligence that drives field results</h2>
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
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>Visits vs. Coverage Trend</h3>
                <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Field Productivity Feed</p>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, background: "#f3f4f6",
                padding: "4px 10px", borderRadius: 6, color: C.onSurfaceVar,
              }}>W42-2024</span>
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
                <p style={{ fontSize: 7, textTransform: "uppercase" as const, letterSpacing: "0.15em", opacity: 0.6, marginBottom: 4 }}>Peak Identified</p>
                <p style={{ fontSize: 18, fontWeight: 700 }}>12.4k</p>
                <p style={{ fontSize: 7, opacity: 0.6 }}>Territory: North-West</p>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {[
              { icon: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8"], label: "Visits per day", value: "12.4k", sub: "↑ 14%" },
              { icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", label: "Sales per rep", value: "$1.8k", sub: "↑ 8%" },
              { icon: ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"], label: "Coverage", value: "94%", sub: "↑ 2%" },
            ].map((m) => (
              <div key={m.label} style={{
                padding: 24, background: C.white,
                border: `1px solid ${C.borderLight}`,
                borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  width: 32, height: 32, background: "#f9fafb", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <Ico d={m.icon} size={16} color="#9ca3af" />
                </div>
                <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: C.primary }}>{m.value}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", marginTop: 4 }}>{m.sub}</p>
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
    <section style={{ padding: "96px 32px", background: C.finDark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" as const }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#52525b", display: "block", marginBottom: 20 }}>Universal Connectivity</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          color: C.white,
          letterSpacing: "-0.02em",
          maxWidth: 560,
          margin: "0 auto 96px",
          lineHeight: 1.2,
        }}>
          Field automation connected directly to<br />your core business systems
        </h2>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" as const }}>
          {/* Sales CRM */}
          <div style={{
            width: 130, minHeight: 160,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            display: "flex", flexDirection: "column" as const, alignItems: "center",
            justifyContent: "center", padding: 24, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(174,248,49,0.4)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <div style={{
              width: 40, height: 40, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <Ico d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M2 12h2 M20 12h2" size={20} color={C.zinc500} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 12 }}>Sales CRM</p>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />
            <p style={{ fontSize: 8, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Active Sync</p>
          </div>

          {/* Connector */}
          <div style={{
            flex: 1, maxWidth: 120, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(174,248,49,0.5), transparent)",
          }} />

          {/* SFA Hub */}
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
              <Ico d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" size={32} color={C.primary} strokeWidth={2} />
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.2em", textAlign: "center" as const, lineHeight: 1.2, marginTop: 4 }}>SFA<br />Hub</p>
            </div>
          </div>

          {/* Connector */}
          <div style={{
            flex: 1, maxWidth: 120, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(174,248,49,0.5), transparent)",
          }} />

          {/* Finance & ERP */}
          <div style={{
            width: 130, minHeight: 160,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            display: "flex", flexDirection: "column" as const, alignItems: "center",
            justifyContent: "center", padding: 24, transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(174,248,49,0.4)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <div style={{
              width: 40, height: 40, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              <Ico d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22 M16 14h.01" size={20} color={C.zinc500} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 12 }}>Finance &amp; ERP</p>
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />
            <p style={{ fontSize: 8, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Ledger Sync</p>
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
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#9ca3af", display: "block", marginBottom: 18 }}>Measurable impact</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          color: C.primary,
          letterSpacing: "-0.02em",
          marginBottom: 80,
        }}>The results of precision field management</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 55 }}>
          {[
            { value: "50%", label: "Better Visibility", desc: "Transparent tracking across all territories eliminates blind spots in execution." },
            { value: "30%", label: "Increased Productivity", desc: "AI-optimized routes and automated logs allow reps to focus on selling, not travel." },
            { value: "20%", label: "Higher Conversion", desc: "Seamless on-spot order booking reduces lead time and increases order accuracy." },
          ].map((m) => (
            <div key={m.label}
              style={{
                padding: 40, border: `1px solid ${C.borderLight}`,
                borderRadius: 20, textAlign: "center" as const, transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <p style={{ fontSize: 52, fontWeight: 900, color: C.primary, marginBottom: 16, letterSpacing: "-0.04em", fontFamily: "Manrope, Inter, sans-serif" }}>{m.value}</p>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "#9ca3af", marginBottom: 20 }}>{m.label}</p>
              <p style={{ fontSize: 13, color: C.onSurfaceVar, lineHeight: 1.65 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function SalesForceManagementPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <HeroSection />
      <CapabilitiesSection />
      <DarkShowcaseSection />
      <IntelligenceSection />
      <ConnectivitySection />
      <MetricsSection />
    </div>
  );
}
