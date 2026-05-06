import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

const C = {
  accent: "#C7FF35",
  deep: "#1A1D19",
  charcoal: "#333333",
  grey: "#666666",
  olive: "#7A826D",
  offWhite: "#F8F9F7",
  white: "#ffffff",
};

const ICON_PATHS: Record<string, string> = {
  "chart-bar":
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "chart-line": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  download:
    "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  refresh:
    "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  table:
    "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
};

function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────────

const KPI_DATA = [
  { label: "Total Revenue", value: "$2.84M", delta: "+12.4%" },
  { label: "Net Margin", value: "18.4%", delta: "+2.1pp" },
  { label: "Active Orders", value: "2,841", delta: "+8.7%" },
  { label: "System Uptime", value: "99.2%", delta: "SLA Met" },
];

function DashboardMockup() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div
        className="biz-glass-dark biz-neon-border"
        style={{ borderRadius: 20, padding: 6 }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 15,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {(["#ff5f57", "#ffbd2e", "#28c840"] as const).map((bg) => (
                <div
                  key={bg}
                  style={{ width: 10, height: 10, borderRadius: "50%", background: bg }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Analytics Hub
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                className="biz-pulse-glow"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.accent,
                  boxShadow: "0 0 8px #C7FF35",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                Live
              </span>
            </div>
          </div>

          {/* KPI cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {KPI_DATA.map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: 8,
                  }}
                >
                  {kpi.label}
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                >
                  {kpi.value}
                </p>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    background: "rgba(199,255,53,0.12)",
                    color: C.accent,
                    padding: "2px 7px",
                    borderRadius: 4,
                  }}
                >
                  {kpi.delta}
                </span>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Revenue Trend
                </p>
                <p
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Q4 2024 · All Entities
                </p>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {[
                  { color: C.accent, label: "Current" },
                  { color: "rgba(255,255,255,0.2)", label: "Last Year" },
                ].map((leg) => (
                  <div
                    key={leg.label}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 2,
                        background: leg.color,
                        borderRadius: 1,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 8,
                        color: "rgba(255,255,255,0.35)",
                        fontWeight: 600,
                      }}
                    >
                      {leg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "relative", height: 90 }}>
              <svg
                width="100%"
                height="90"
                viewBox="0 0 400 90"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="dr-area-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C7FF35" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#C7FF35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path
                  d="M0,78 C40,64 80,58 120,50 S190,34 230,38 S290,26 330,18 L400,10 L400,90 L0,90 Z"
                  fill="url(#dr-area-fill)"
                />
                <path
                  d="M0,78 C40,64 80,58 120,50 S190,34 230,38 S290,26 330,18 L400,10"
                  fill="none"
                  stroke="#C7FF35"
                  strokeWidth="2"
                />
                <path
                  d="M0,84 C50,76 100,74 150,70 S230,62 290,58 S360,54 400,50"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
                <circle
                  cx="330"
                  cy="18"
                  r="4"
                  fill="#C7FF35"
                  className="biz-pulse-glow"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: "76%",
                  transform: "translateX(-50%)",
                  background: C.deep,
                  border: "1px solid rgba(199,255,53,0.3)",
                  borderRadius: 7,
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                <p
                  style={{
                    fontSize: 8,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 2,
                  }}
                >
                  Nov Peak
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  $284k
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="biz-dark-section"
      style={{ paddingTop: 80, paddingBottom: 96 }}
    >
      <div className="biz-container" style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "rgba(199,255,53,0.08)",
            border: "1px solid rgba(199,255,53,0.2)",
            borderRadius: 999,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.accent,
              boxShadow: "0 0 8px #C7FF35",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: C.accent,
            }}
          >
            Analytics & Reporting
          </span>
        </div>

        <h1
          className="biz-h2-white"
          style={{
            fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
            marginBottom: 24,
            lineHeight: 1.1,
          }}
        >
          Every number.
          <br />
          In real time.
        </h1>

        <p
          className="biz-hero-sub"
          style={{
            color: "rgba(255,255,255,0.45)",
            maxWidth: 520,
            margin: "0 auto 36px",
          }}
        >
          Bizak transforms scattered ERP data into instant clarity — live KPI
          dashboards, scheduled reports, and drill-down analysis built for the
          decisions that matter.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
            marginBottom: 56,
          }}
        >
          <button className="biz-shimmer-btn biz-shimmer-lg">
            Request Demo
          </button>
          <button className="biz-btn-ghost">Explore Features</button>
        </div>

        <div
          className="biz-hero-stats"
          style={{
            justifyContent: "center",
            marginTop: 0,
            marginBottom: 56,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div className="biz-stat-value" style={{ color: "#fff" }}>
              40+
            </div>
            <div className="biz-stat-label">Report Templates</div>
          </div>
          <div
            className="biz-divider-v"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div style={{ textAlign: "center" }}>
            <div className="biz-stat-value" style={{ color: "#fff" }}>
              Live
            </div>
            <div className="biz-stat-label">Real-time Data</div>
          </div>
          <div
            className="biz-divider-v"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div style={{ textAlign: "center" }}>
            <div className="biz-stat-value" style={{ color: "#fff" }}>
              99.9%
            </div>
            <div className="biz-stat-label">Uptime SLA</div>
          </div>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

// ─── FEATURES ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "zap",
    title: "Real-time KPIs",
    desc: "Live metrics that update as transactions occur — no manual refresh, no lag, no guesswork.",
    accent: true,
  },
  {
    icon: "filter",
    title: "Custom Report Builder",
    desc: "Drag-and-drop builder with conditional filters, custom groupings, and calculated columns.",
    accent: false,
  },
  {
    icon: "eye",
    title: "Role-based Views",
    desc: "Every team member sees exactly the data relevant to their role — nothing beyond their scope.",
    accent: false,
  },
  {
    icon: "calendar",
    title: "Scheduled Exports",
    desc: "Auto-deliver reports to any stakeholder by email on a daily, weekly, or custom schedule.",
    accent: false,
  },
  {
    icon: "chart-bar",
    title: "Drill-down Analysis",
    desc: "Click any KPI to trace it back to the originating transaction — a full audit-ready chain.",
    accent: false,
  },
  {
    icon: "layers",
    title: "Multi-entity Reporting",
    desc: "Consolidated and per-entity reports across all branches and subsidiaries in one click.",
    accent: false,
  },
];

function FeaturesSection() {
  return (
    <section className="biz-section biz-mesh">
      <div className="biz-container">
        <div style={{ marginBottom: 56 }}>
          <span className="biz-label">Core Capabilities</span>
          <h2 className="biz-h2" style={{ marginTop: 12, marginBottom: 16 }}>
            Built for every kind
            <br />
            of decision maker
          </h2>
          <p className="biz-section-intro">
            Whether you're a CFO tracking cash flow or an ops manager watching
            order velocity, Bizak surfaces the right data in the right format.
          </p>
        </div>

        <div className="biz-bento-grid">
          {FEATURES.map((f) => (
            <div className="biz-bento-card" key={f.title}>
              <div className="biz-icon-wrap">
                <Icon name={f.icon} size={22} />
              </div>
              <h3 className="biz-card-title">{f.title}</h3>
              <p className="biz-card-desc">{f.desc}</p>
              {f.accent && (
                <div className="biz-card-footer">
                  <div className="biz-accent-bar" style={{ width: "40%" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DASHBOARD TYPES ───────────────────────────────────────────────────────────

const TABS = ["Executive", "Operations", "Finance"] as const;

const CHECK_ITEMS = [
  {
    title: "Executive Summary View",
    desc: "Boardroom-ready P&L, revenue trend, and forecast at a glance.",
  },
  {
    title: "Operations Dashboard",
    desc: "Live inventory levels, order pipeline, and fulfillment velocity.",
  },
  {
    title: "Finance Dashboard",
    desc: "AP/AR aging, cash position, and budget vs. actual by cost center.",
  },
  {
    title: "Custom Workspace",
    desc: "Pin the KPIs that matter to your role — drag, resize, personalize.",
  },
];

function CheckCircleIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DashboardTypesSection() {
  return (
    <section className="biz-section" style={{ background: C.white }}>
      <div className="biz-container">
        <div className="biz-insights-grid">
          <div>
            <span className="biz-label">Dashboard Flexibility</span>
            <h2 className="biz-h2" style={{ marginTop: 12, marginBottom: 16 }}>
              One platform,
              <br />
              every perspective
            </h2>
            <p className="biz-section-intro">
              Bizak adapts to how your organization works — preconfigured views
              for every function, fully customizable for any role.
            </p>
            <ul className="biz-check-list">
              {CHECK_ITEMS.map((item) => (
                <li className="biz-check-item" key={item.title}>
                  <span className="biz-check-icon">
                    <CheckCircleIcon />
                  </span>
                  <div>
                    <span style={{ fontWeight: 700, color: C.charcoal }}>
                      {item.title}
                    </span>
                    <span style={{ color: C.grey }}> — {item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="biz-chart-frame">
            <div className="biz-chart-inner">
              <div className="biz-chart-topbar">
                {TABS.map((tab, i) => (
                  <span
                    key={tab}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: 6,
                      cursor: "default",
                      background: i === 0 ? C.accent : "transparent",
                      color: i === 0 ? C.deep : C.grey,
                      border: i === 0 ? "none" : "1px solid #E5E7EB",
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {[
                  {
                    label: "Net Revenue",
                    value: "$2.84M",
                    delta: "↑ 12.4%",
                  },
                  {
                    label: "Total Expenses",
                    value: "$1.92M",
                    delta: "↓ 3.1%",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: 16,
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: C.grey,
                        marginBottom: 8,
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: C.charcoal,
                        marginBottom: 4,
                      }}
                    >
                      {stat.value}
                    </p>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      {stat.delta}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ position: "relative" }}>
                <svg
                  width="100%"
                  height="90"
                  viewBox="0 0 300 90"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="dr-spark-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#C7FF35"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#C7FF35"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,72 C30,58 60,62 90,46 S150,22 180,30 S240,18 270,10 L300,6 L300,90 L0,90 Z"
                    fill="url(#dr-spark-fill)"
                  />
                  <path
                    d="M0,72 C30,58 60,62 90,46 S150,22 180,30 S240,18 270,10 L300,6"
                    fill="none"
                    stroke="#C7FF35"
                    strokeWidth="2"
                  />
                  <circle cx="270" cy="10" r="3.5" fill="#C7FF35" />
                </svg>
                <div
                  className="biz-tooltip"
                  style={{ top: "8%", left: "72%" }}
                >
                  <p style={{ fontWeight: 700, color: C.charcoal }}>
                    Peak: Nov 14
                  </p>
                  <p style={{ color: C.olive, marginTop: 2 }}>
                    Highest Revenue Day
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { abbr: "P&L", sub: "Income" },
  { abbr: "BS", sub: "Balance Sheet" },
  { abbr: "CF", sub: "Cash Flow" },
  { abbr: "AR", sub: "Aging Report" },
  { abbr: "BvA", sub: "Budget vs Actual" },
  { abbr: "TAX", sub: "Tax Summary" },
];

const TREND_ROWS = [
  { period: "Q2 2024", rev: "$680k", delta: "+9.2%" },
  { period: "Q3 2024", rev: "$812k", delta: "+19.4%" },
  { period: "Q4 2024", rev: "$1.01M", delta: "+24.4%" },
];

function AnalyticsSection() {
  return (
    <section className="biz-dark-section">
      <div className="biz-container">
        <div style={{ marginBottom: 56 }}>
          <span className="biz-label" style={{ color: C.olive }}>
            Deep Analytics
          </span>
          <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
            From raw data to
            <br />
            boardroom clarity
          </h2>
        </div>

        <div className="biz-caps-grid">
          {/* Trend chart — span 3 */}
          <div className="biz-dark-card biz-col-3">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Icon name="chart-line" size={16} style={{ color: C.accent }} />
            </div>
            <h3>Revenue Intelligence</h3>
            <p>
              Multi-period trend analysis with comparative benchmarks against
              budgets and prior-year actuals.
            </p>
            <svg
              width="100%"
              height="60"
              viewBox="0 0 300 60"
              preserveAspectRatio="none"
              style={{ margin: "24px 0 20px" }}
            >
              <path
                d="M0,52 C40,42 80,44 120,34 S180,18 210,22 S260,12 300,6"
                fill="none"
                stroke="#C7FF35"
                strokeWidth="2"
              />
              <path
                d="M0,56 C50,52 100,54 150,50 S220,44 300,40"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            </svg>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>Period</span>
                <span>Revenue</span>
                <span>Δ YoY</span>
              </div>
              {TREND_ROWS.map((row) => (
                <div className="biz-mono-row" key={row.period}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>
                    {row.period}
                  </span>
                  <span>{row.rev}</span>
                  <span style={{ color: C.accent }}>{row.delta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report types — span 3 */}
          <div className="biz-dark-card biz-col-3">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Icon name="table" size={16} style={{ color: C.accent }} />
            </div>
            <h3>Built-in Report Library</h3>
            <p>
              40+ ready-to-run templates covering every corner of your business
              — no configuration required.
            </p>
            <div className="biz-method-grid">
              {REPORT_TYPES.map(({ abbr, sub }) => (
                <div className="biz-method-box" key={abbr}>
                  <div className="biz-method-label">{abbr}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates count — span 2 */}
          <div className="biz-dark-card biz-col-2">
            <div className="biz-mini-stat">40+</div>
            <div
              className="biz-method-sub"
              style={{ marginTop: 8, fontSize: 11 }}
            >
              Report Templates
            </div>
            <p style={{ marginTop: 16 }}>
              Preconfigured for finance, ops, HR, and sales — ready in seconds,
              not hours of setup.
            </p>
          </div>

          {/* Export formats — span 2 */}
          <div className="biz-dark-card biz-col-2">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Icon name="download" size={16} style={{ color: C.accent }} />
            </div>
            <h3 style={{ fontSize: 16 }}>Export Any Format</h3>
            <p style={{ marginBottom: 20 }}>
              Deliver reports to any system in exactly the format it needs.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { fmt: "PDF", desc: "Branded, print-ready" },
                { fmt: "XLS", desc: "Excel with formulas" },
                { fmt: "CSV", desc: "Raw data pipeline" },
              ].map((f) => (
                <div
                  key={f.fmt}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{ fontSize: 11, fontWeight: 700, color: C.accent }}
                  >
                    {f.fmt}
                  </span>
                  <span
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}
                  >
                    {f.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Accuracy stat — span 2 */}
          <div className="biz-dark-card biz-col-2">
            <div className="biz-mini-stat">99.9%</div>
            <div
              className="biz-method-sub"
              style={{ marginTop: 8, fontSize: 11 }}
            >
              Data Accuracy
            </div>
            <p style={{ marginTop: 16 }}>
              Enterprise-grade reliability with bank-level encryption and
              zero-data-loss guarantees for every report.
            </p>
            <button className="biz-read-btn" style={{ marginTop: 20 }}>
              View SLA
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── REPORT FLOW ───────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  { icon: "table", label: "Data Entry" },
  { icon: "refresh", label: "Auto Sync" },
  { icon: "zap", label: "KPI Update" },
  { icon: "bell", label: "Alert Trigger" },
  { icon: "chart-bar", label: "Report Build" },
  { icon: "share", label: "Export & Share" },
];

function ReportFlowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span className="biz-label">Data Pipeline</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>
            From data entry to decision —
            <br />
            automatically
          </h2>
        </div>

        <div className="biz-workflow-steps">
          <div className="biz-workflow-line">
            <svg style={{ width: "80%", height: 2, overflow: "visible" }}>
              <line
                x1="0%"
                y1="1"
                x2="100%"
                y2="1"
                stroke="#C7FF35"
                strokeWidth="2"
                strokeDasharray="14 8"
                className="biz-flow"
              />
            </svg>
          </div>

          <div className="biz-steps-grid">
            {FLOW_STEPS.map((step) => (
              <div className="biz-step-item" key={step.label}>
                <div className="biz-step-circle">
                  <Icon name={step.icon} size={24} style={{ color: C.olive }} />
                </div>
                <div className="biz-step-label">{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="biz-cta-section">
      <div className="biz-cta-glow" />
      <div
        className="biz-container"
        style={{ position: "relative", zIndex: 1 }}
      >
        <h2 className="biz-cta-title">
          Make data your
          <br />
          competitive advantage
        </h2>
        <p className="biz-cta-sub">
          Join 10,000+ companies using Bizak to turn raw ERP data into instant
          strategic clarity — live dashboards, automated reports, zero manual
          effort.
        </p>
        <div className="biz-cta-btn-row">
          <button className="biz-shimmer-btn biz-shimmer-lg">
            Request Demo
          </button>
          <button className="biz-btn-ghost">View Pricing</button>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────────

export function DashboardAndReportingPage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <FeaturesSection />
        <DashboardTypesSection />
        <AnalyticsSection />
        <ReportFlowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
