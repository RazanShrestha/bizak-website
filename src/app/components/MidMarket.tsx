import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── SVG Icon Helper ──────────────────────────────────────────────────────────
function Icon({ name, size = 24, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const icons: Record<string, JSX.Element> = {
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    "check-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    dollar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    bar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    plug: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" />
        <path d="M18 8H6a2 2 0 0 0-2 2v3a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-3a2 2 0 0 0-2-2Z" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    "alert-triangle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
    "trending-up": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    invoice: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" x2="15" y1="13" y2="13" /><line x1="9" x2="15" y1="17" y2="17" />
      </svg>
    ),
    puzzle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.926a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.926.968a.979.979 0 0 1-.276.836l-1.611 1.612a2.415 2.415 0 0 1-1.704.705 2.415 2.415 0 0 1-1.704-.705l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.415 2.415 0 0 1 1 11.005c0-.617.236-1.234.706-1.704L3.317 7.69a.979.979 0 0 1 .836-.276c.47.07.802.48.968.926a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.926-.968a.979.979 0 0 1 .276-.836l1.611-1.611a2.415 2.415 0 0 1 1.704-.705c.617 0 1.234.236 1.704.705l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z" />
      </svg>
    ),
    building: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" />
        <path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" />
        <path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
      </svg>
    ),
    "git-merge": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
        <path d="M6 21V9a9 9 0 0 0 9 9" />
      </svg>
    ),
    "pie-chart": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    "check-square": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    migrate: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      </svg>
    ),
    setup: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    rocket: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    go: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8l4 4-4 4" /><path d="M8 12h8" />
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// ─── Entity Node (used in Hero visual) ───────────────────────────────────────
function EntityNode({ label, value, unit, active }: { label: string; value: string; unit: string; active: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        border: `1.5px solid ${active ? "rgba(199,255,53,0.5)" : "rgba(122,130,109,0.18)"}`,
        background: active ? "rgba(199,255,53,0.06)" : "rgba(122,130,109,0.03)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        boxShadow: active ? "0 0 12px rgba(199,255,53,0.12)" : "none",
      }}>
        <Icon name={active ? "trending-up" : "bar"} size={17} style={{ color: active ? "#7A826D" : "#ccc" }} />
        <div style={{
          position: "absolute", top: -3, right: -3, width: 9, height: 9,
          borderRadius: "50%",
          background: active ? "#C7FF35" : "rgba(122,130,109,0.3)",
          boxShadow: active ? "0 0 5px #C7FF35" : "none",
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#1a1a1a" : "#aaa" }}>{value}</span>
      <span style={{ fontSize: 7, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{unit}</span>
      <span style={{ fontSize: 7, color: "#bbb", letterSpacing: "0.03em" }}>{label}</span>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const entities = [
    { label: "HQ – Dubai",    value: "$2.1M", unit: "Revenue",  active: true  },
    { label: "Branch – Cairo", value: "$840K", unit: "Revenue", active: true  },
    { label: "Branch – London",value: "$1.3M", unit: "Revenue", active: true  },
    { label: "Consolidation",  value: "98.5%", unit: "Accuracy",active: false },
  ];

  const pendingApprovals = [
    { id: "APV-0211", dept: "Procurement", amount: "$48,000", status: "pending", color: "#fbbf24" },
    { id: "APV-0212", dept: "Finance",     amount: "$12,400", status: "approved", color: "#C7FF35" },
    { id: "APV-0213", dept: "Operations",  amount: "$93,200", status: "review",  color: "#fb923c" },
  ];

  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)", left: "50%" }} />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">

          {/* ── Copy ── */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>ERP for Mid-Market Companies</span>
            <h1 className="biz-h1">
              Unify Operations.<br /><span>Scale</span> With Precision.
            </h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              Mid-market companies outgrow spreadsheets and entry-level ERPs fast. Bizak gives you multi-entity financials, advanced approval workflows, and consolidated reporting — without the enterprise price tag or 18-month rollout.
            </p>
            <div className="biz-hero-cta-row">
              <button className="biz-shimmer-btn biz-shimmer-lg">Request a Demo</button>
              <button className="biz-btn-outline">
                See It in Action <Icon name="play" size={16} />
              </button>
            </div>
            <div className="biz-hero-stats">
              <div>
                <div className="biz-stat-value">30 Days</div>
                <div className="biz-stat-label">Typical Go-Live</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">800+</div>
                <div className="biz-stat-label">Mid-Market Companies</div>
              </div>
            </div>
          </div>

          {/* ── Visual: Multi-Entity Command Center ── */}
          <div className="biz-hero-visual">
            <div className="biz-vis-glow" />

            {/* ── Main glass panel: consolidated view ── */}
            <div className="biz-card-main biz-glass biz-float">
              {/* Panel header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(122,130,109,0.65)" }}>
                  Bizak · Consolidated View
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", color: "#7A826D", textTransform: "uppercase" }}>Live</span>
                </div>
              </div>

              {/* Entity nodes */}
              <div style={{ position: "relative", marginBottom: 14 }}>
                <svg style={{ position: "absolute", top: "38%", left: "12.5%", width: "75%", height: 2, overflow: "visible", pointerEvents: "none" }} viewBox="0 0 300 2">
                  <line x1="0" y1="1" x2="300" y2="1" stroke="rgba(122,130,109,0.15)" strokeWidth="1.5" />
                  {[60, 150, 240].map((x, i) => (
                    <circle key={i} cx={x} cy="1" r="3" fill="#C7FF35" opacity={i === 1 ? "0.25" : "0.7"}>
                      <animate attributeName="cx" values={`${x - 60};${x + 60}`} dur={`${1.4 + i * 0.4}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;0.8;0" dur={`${1.4 + i * 0.4}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </svg>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                  {entities.map((e) => (
                    <EntityNode key={e.label} {...e} />
                  ))}
                </div>
              </div>

              {/* Pending approvals */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 10, borderTop: "1px solid rgba(122,130,109,0.1)" }}>
                {pendingApprovals.map((apv) => (
                  <div key={apv.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(122,130,109,0.7)", minWidth: 58 }}>{apv.id}</span>
                    <span style={{ fontSize: 8, color: "#888", flex: 1 }}>{apv.dept}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#333", minWidth: 44 }}>{apv.amount}</span>
                    <span style={{
                      fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                      background: apv.status === "approved" ? "rgba(199,255,53,0.15)" : apv.status === "pending" ? "rgba(251,191,36,0.12)" : "rgba(251,146,60,0.12)",
                      color: apv.status === "approved" ? "#7A826D" : apv.status === "pending" ? "#d97706" : "#ea580c",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{apv.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Dark card: Consolidated Revenue ── */}
            <div className="biz-card-inventory biz-glass-dark biz-float-d">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(199,255,53,0.15)", color: "#C7FF35" }}>
                  <Icon name="layers" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Consolidated</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>$4.24M</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>3 entities · live</span>
                <span style={{ fontSize: 9, color: "#C7FF35", fontWeight: 700 }}>+22% YoY</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div className="biz-accent-bar" style={{ width: "82%" }} />
              </div>
            </div>

            {/* ── Light card: Department health ── */}
            <div className="biz-card-globe biz-glass biz-float-s">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(122,130,109,0.1)", color: "#7A826D" }}>
                  <Icon name="bar" size={18} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Dept. Performance</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[{ label: "Finance", pct: 96 }, { label: "Supply Chain", pct: 88 }, { label: "Sales", pct: 74 }].map((m) => (
                  <div key={m.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#555" }}>{m.label}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#C7FF35" }}>{m.pct}%</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(122,130,109,0.12)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${m.pct}%`, background: "#C7FF35", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Circle card: Compliance score ── */}
            <div className="biz-card-circle biz-glass biz-float">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 12 }}>Audit Score</div>
              <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(199,255,53,0.18)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="0" />
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="#C7FF35" strokeWidth="8" strokeDasharray="201" strokeDashoffset="16" />
                </svg>
                <div style={{ position: "absolute", fontSize: 13, fontWeight: 700, color: "#333" }}>92%</div>
              </div>
            </div>

            {/* Particles */}
            {[{ top: "40%", left: "50%", delay: "0s" }, { top: "60%", left: "30%", delay: "1.5s" }, { top: "30%", left: "70%", delay: "2.5s" }].map((p, i) => (
              <div key={i} className="biz-data-dot biz-particle" style={{ top: p.top, left: p.left, animationDelay: p.delay }} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Challenges Section ───────────────────────────────────────────────────────
function ChallengesSection() {
  return (
    <section className="biz-section" style={{ background: "#F8F9F7" }}>
      <div className="biz-container">
        <div style={{ marginBottom: 48 }}>
          <span className="biz-label">Challenges</span>
          <h2 className="biz-h2" style={{ marginTop: 16, maxWidth: 680 }}>
            Growing fast is easy. Managing that growth is where mid-market companies break.
          </h2>
          <p className="biz-section-intro">
            At 50–500 employees, complexity compounds. Approval chains get long, entities multiply, and the systems built for 20 people can't keep up.
          </p>
        </div>

        <div className="biz-bento-grid">

          {/* 1 · Approval Bottlenecks */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="check-square" size={22} /></div>
            <h3 className="biz-card-title">Approval Bottlenecks</h3>
            <p className="biz-card-desc">Purchase orders, budget requests, and vendor invoices sit in email chains for days. Deals slow. Vendors send late-payment notices.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { id: "PO-3841", label: "IT Infrastructure PO",   days: "7d pending",  critical: true  },
                  { id: "PO-3842", label: "Marketing Budget Req.",   days: "4d pending",  critical: true  },
                  { id: "PO-3843", label: "Office Lease Renewal",    days: "12d pending", critical: true  },
                ].map((f) => (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 6, background: "rgba(248,113,113,0.06)" }}>
                    <Icon name="clock" size={12} style={{ color: "#f87171", flexShrink: 0 }} />
                    <span style={{ fontSize: 8, color: "#f87171", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.label}</span>
                    <span style={{ fontSize: 7, fontWeight: 700, color: "#f87171" }}>{f.days}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2 · Multi-Entity Chaos */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="building" size={22} /></div>
            <h3 className="biz-card-title">Multi-Entity Chaos</h3>
            <p className="biz-card-desc">Running three subsidiaries with separate spreadsheets means consolidation takes a full week every month-end. Errors are inevitable.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{ label: "HQ Consolidation", lag: "7 days manual" }, { label: "Interco Eliminations", lag: "3 days manual" }, { label: "FX Revaluation", lag: "2 days manual" }].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: "#666" }}>{row.label}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171" }}>{row.lag}</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171" }} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>12 days lost monthly</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 · Compliance & Audit Gaps */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="shield" size={22} /></div>
            <h3 className="biz-card-title">Compliance & Audit Gaps</h3>
            <p className="biz-card-desc">No clear audit trail, missing approval records, and manual journal entries make every audit a fire drill. Regulators and investors are watching.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { label: "Missing audit trail",    critical: true  },
                  { label: "Unapproved JE entries",  critical: true  },
                  { label: "Expired vendor certs",   critical: false },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: item.critical ? "#f87171" : "#666" }}>{item.label}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: item.critical ? "#f87171" : "#7A826D" }}>{item.critical ? "High risk" : "Medium"}</span>
                  </div>
                ))}
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>3 critical findings</span>
              </div>
            </div>
          </div>

          {/* 4 · Siloed Departments */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="puzzle" size={22} /></div>
            <h3 className="biz-card-title">Siloed Departments</h3>
            <p className="biz-card-desc">Finance doesn't see what Ops is ordering. Sales doesn't know inventory levels. Each department optimizes alone — and the business pays the cost.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 44, gap: 0 }}>
                {["FIN", "OPS", "SCM", "SLS"].map((dept, i) => (
                  <div key={dept} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(122,130,109,0.08)", border: "1.5px solid rgba(122,130,109,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 7, fontWeight: 700, color: "#7A826D" }}>{dept}</span>
                    </div>
                    {i < 3 && <div style={{ width: 16, height: 1, background: "rgba(248,113,113,0.4)" }} />}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em" }}>4 depts, 0 shared visibility</span>
              </div>
            </div>
          </div>

          {/* 5 · Reporting Delays */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="bar" size={22} /></div>
            <h3 className="biz-card-title">Reporting Takes Too Long</h3>
            <p className="biz-card-desc">Board packs assembled in PowerPoint. Management reports emailed as PDFs. By the time the data reaches decision-makers, it's already stale.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { sku: "Board Report",    level: 18, critical: true  },
                  { sku: "P&L Statement",   level: 12, critical: true  },
                  { sku: "Cashflow Fcst",   level: 5,  critical: false },
                ].map((m) => (
                  <div key={m.sku}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, color: "#888" }}>{m.sku}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: m.critical ? "#f87171" : "#7A826D" }}>
                        {m.level} days {m.critical ? "⚠" : ""}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((m.level / 20) * 100, 100)}%`, background: m.critical ? "#f87171" : "#7A826D", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6 · System Debt */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="alert-triangle" size={22} /></div>
            <h3 className="biz-card-title">Outgrown Your Current ERP</h3>
            <p className="biz-card-desc">That entry-level system worked at 20 users but breaks at 150. Custom workarounds multiply, and the vendor says the features you need are "roadmap."</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{ label: "Workaround Scripts", pct: 87, bad: true }, { label: "Native Automation", pct: 11, bad: true }].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#999", minWidth: 96, textTransform: "uppercase", letterSpacing: "0.04em" }}>{row.label}</span>
                    <div style={{ flex: 1, height: 7, background: "#f3f3f3", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${row.pct}%`, background: row.bad ? "rgba(248,113,113,0.6)" : "rgba(199,255,53,0.6)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: row.bad ? "#f87171" : "#7A826D" }}>{row.pct}%</span>
                  </div>
                ))}
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>Tech debt compounding</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Solution Section ─────────────────────────────────────────────────────────
const SOLUTIONS = [
  { icon: "layers",       title: "Multi-Entity Financials",    desc: "Manage multiple subsidiaries in one platform. Auto-consolidate, handle intercompany eliminations, and close books in hours — not days." },
  { icon: "check-square", title: "Advanced Approval Workflows", desc: "Build multi-level, role-based approval chains for POs, budgets, and expenses. Auto-escalate when thresholds are breached." },
  { icon: "shield",       title: "Audit-Ready Controls",       desc: "Full audit trail, segregation of duties, and policy enforcement baked in. Every change is logged, every approval is documented." },
  { icon: "bar",          title: "Executive Dashboards",       desc: "Board-level reporting in real time. P&L by entity, consolidated cashflow, and department KPIs available on any device." },
  { icon: "plug",         title: "Deep Integrations",          desc: "Connect your bank feeds, CRM, payroll, and logistics platforms. Bizak becomes the operational backbone of your entire org." },
  { icon: "lock",         title: "Role-Based Access Control",  desc: "Granular permissions ensure each team sees only what they need. Delegate without risk — from CFO to field rep." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>Built for the complexity mid-market demands</h2>
        </div>
        <div className="biz-solution-grid">
          {SOLUTIONS.map((s) => (
            <div key={s.title} style={{ display: "flex", flexDirection: "column" }}>
              <div className="biz-sol-icon"><Icon name={s.icon} size={22} /></div>
              <h4 className="biz-sol-title">{s.title}</h4>
              <p className="biz-sol-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Capabilities Section (dark) ─────────────────────────────────────────────
function CapabilitiesSection() {
  return (
    <section className="biz-dark-section">
      <div className="biz-container">
        <div style={{ marginBottom: 64, maxWidth: 560 }}>
          <span className="biz-label">Capabilities</span>
          <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
            Enterprise power. Mid-market agility.
          </h2>
        </div>

        <div className="biz-caps-grid">

          {/* ── Full-width: Consolidated Dashboard ── */}
          <div className="biz-dark-card biz-col-6" style={{ minHeight: 260 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
              {/* Left: headline stats */}
              <div style={{ flexShrink: 0 }}>
                <div className="biz-mini-stat">$4.24M</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Consolidated Revenue</p>
                <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
                  {[{ val: "+22%", lbl: "YoY Growth" }, { val: "3", lbl: "Active Entities" }].map((s) => (
                    <div key={s.lbl}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Approval queue table */}
              <div style={{ flex: 1, minWidth: 240 }}>
                <h4 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>Consolidated Oversight</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                  Revenue, costs, headcount, and approvals across all entities — live in a single board-ready view.
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Entity", "Revenue", "EBITDA", "Status"].map((h, i) => (
                        <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", paddingBottom: 10, textAlign: i > 1 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { entity: "Dubai HQ",     revenue: "$2.1M", ebitda: "24%", status: "healthy"  },
                      { entity: "Cairo Branch",  revenue: "$840K", ebitda: "18%", status: "healthy"  },
                      { entity: "London Branch", revenue: "$1.3M", ebitda: "21%", status: "review"   },
                    ].map((row) => (
                      <tr key={row.entity} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ fontSize: 11, color: "#fff", padding: "10px 0" }}>{row.entity}</td>
                        <td style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: "10px 0" }}>{row.revenue}</td>
                        <td style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", padding: "10px 0", textAlign: "right" }}>{row.ebitda}</td>
                        <td style={{ padding: "10px 0", textAlign: "right" }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                            background: row.status === "healthy" ? "rgba(199,255,53,0.12)" : "rgba(251,191,36,0.12)",
                            color: row.status === "healthy" ? "#C7FF35" : "#fbbf24",
                            textTransform: "uppercase", letterSpacing: "0.08em",
                          }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Advanced Approvals | Audit & Compliance ── */}
          <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div>
              <h3>Advanced Approvals</h3>
              <p>Multi-level, policy-driven approval chains across any module. Auto-escalate, auto-notify, and maintain a tamper-proof audit trail for every decision.</p>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>STEP</span><span>APPROVER</span><span>STATUS</span>
              </div>
              {[
                { step: "01", module: "Dept Head",   status: "DONE",    ok: true  },
                { step: "02", module: "Finance",     status: "DONE",    ok: true  },
                { step: "03", module: "CFO",         status: "ACTIVE",  ok: true  },
                { step: "04", module: "CEO",         status: "PENDING", ok: false },
              ].map((r) => (
                <div key={r.step} className="biz-mono-row">
                  <span>{r.step}</span><span>{r.module}</span>
                  <span style={{ color: r.ok ? "#4ade80" : "rgba(255,255,255,0.3)" }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Audit & Compliance</h3>
                <p>Complete audit log, segregation of duties, and policy enforcement. Prepare for any audit in minutes — not weeks.</p>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                <Icon name="shield" size={24} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["100%", "Audit Trail"], ["<1 Day", "Audit Prep"], ["SOX-lite", "Controls"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom row: 3 feature tiles ── */}
          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260 }}>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="layers" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Multi-Entity Management</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Manage subsidiaries, branches, and JVs from one platform. Intercompany transactions auto-eliminate at consolidation.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2 biz-neon-border" style={{ minHeight: 260, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 22 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>Real-time</span>
            </div>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="pie-chart" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Executive Reporting</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Board packs, management accounts, and KPI dashboards built live from your data — no Excel assembly required.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260, justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="lock" size={34} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Granular Access Control</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                Entity-level, department-level, and field-level permissions. Every user sees exactly what their role allows — nothing more.
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "97%", background: "#C7FF35" }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Insights Section ─────────────────────────────────────────────────────────
function InsightsSection() {
  return (
    <section className="biz-section" style={{ background: "#fff" }}>
      <div className="biz-container">
        <div className="biz-insights-grid">

          {/* ── Chart on LEFT ── */}
          <div style={{ position: "relative" }}>
            <div className="biz-chart-frame biz-glass">
              <div className="biz-chart-inner">
                <div className="biz-chart-topbar">
                  <div style={{ height: 36, width: 148, background: "#e8eae4", borderRadius: 8 }} />
                  <div style={{ height: 36, width: 88, background: "rgba(122,130,109,0.18)", borderRadius: 8 }} />
                </div>
                <div style={{ height: 240, background: "#fff", borderRadius: 8, border: "1px solid rgba(232,234,228,0.5)", position: "relative", padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" fill="none">
                    <defs>
                      <linearGradient id="mmGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.14" />
                        <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="mmGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7A826D" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#7A826D" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Entity 1 revenue line */}
                    <path d="M0 160 C 50 150, 100 135, 160 108 S 260 80, 320 60 S 370 44, 400 36" stroke="#7A826D" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0 160 C 50 150, 100 135, 160 108 S 260 80, 320 60 S 370 44, 400 36 V 200 H 0 Z" fill="url(#mmGrad1)" />
                    {/* Entity 2 dashed line */}
                    <path d="M0 175 C 40 170, 90 162, 150 148 S 240 128, 300 114 S 360 96, 400 88" stroke="rgba(122,130,109,0.4)" strokeWidth="2" strokeDasharray="6 4" />
                    <path d="M0 175 C 40 170, 90 162, 150 148 S 240 128, 300 114 S 360 96, 400 88 V 200 H 0 Z" fill="url(#mmGrad2)" />
                    <circle cx="320" cy="60" r="5" fill="#C7FF35" stroke="#7A826D" strokeWidth="2" />
                  </svg>
                  <div className="biz-tooltip">
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>Consolidated: $4.24M ↑</div>
                    <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>+22% vs last year</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, background: "rgba(122,130,109,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          </div>

          {/* ── Text on RIGHT ── */}
          <div>
            <span className="biz-label">Consolidated Intelligence</span>
            <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
              One view across every entity and department.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              Stop waiting for month-end reports. Bizak consolidates financials, approvals, inventory, and headcount across all your entities in real time — giving leadership instant clarity.
            </p>
            <ul className="biz-check-list">
              {[
                { bold: "Real-Time Consolidation", rest: " — P&L, balance sheet, and cashflow across all entities with intercompany eliminations handled automatically." },
                { bold: "Department-Level Visibility", rest: " — Every team's budget vs actuals, approval queue, and KPIs in one unified view." },
                { bold: "Board-Ready Reports", rest: " — Export investor-grade reports directly from live data — no spreadsheet assembly needed." },
              ].map((item) => (
                <li key={item.bold} className="biz-check-item">
                  <span className="biz-check-icon"><Icon name="check-circle" size={20} /></span>
                  <span><strong>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Workflow / Implementation Steps ─────────────────────────────────────────
const STEPS = [
  { icon: "migrate",      label: "Migrate Data"     },
  { icon: "setup",        label: "Configure"        },
  { icon: "layers",       label: "Map Entities"     },
  { icon: "users",        label: "Set Permissions"  },
  { icon: "plug",         label: "Integrate"        },
  { icon: "go",           label: "Go Live"          },
];

function WorkflowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">Implementation</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>Structured rollout. Zero disruption.</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7, maxWidth: 520, margin: "16px auto 0" }}>
            Our dedicated implementation team follows a proven 30-day playbook — phased go-live, data migration included, and handover training for every team.
          </p>
        </div>
        <div className="biz-workflow-steps">
          <div className="biz-workflow-line">
            <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
              <path d="M50,50 L950,50" stroke="#7A826D" strokeOpacity="0.15" strokeWidth="1" />
              <path className="biz-flow" d="M50,50 L950,50" stroke="#C7FF35" strokeDasharray="12 40" strokeLinecap="round" strokeWidth="3" />
            </svg>
          </div>
          <div className="biz-steps-grid">
            {STEPS.map((s) => (
              <div key={s.label} className="biz-step-item">
                <div className="biz-step-circle"><Icon name={s.icon} size={24} /></div>
                <span className="biz-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof / Testimonials ─────────────────────────────────────────────
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
    <section className="biz-section" style={{ background: "#F8F9F7", borderTop: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="biz-label">Customer Stories</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>Mid-market companies that made the move to Bizak</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{
              background: "#fff",
              border: "1px solid #e8eae4",
              borderRadius: 16,
              padding: "28px 28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="#C7FF35" stroke="#C7FF35" strokeWidth={1.5}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.7, fontStyle: "italic", flex: 1 }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{t.role}</div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#7A826D", textTransform: "uppercase",
                  letterSpacing: "0.06em", background: "rgba(122,130,109,0.08)",
                  padding: "5px 10px", borderRadius: 6,
                }}>
                  {t.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Teaser ───────────────────────────────────────────────────────────
function PricingTeaserSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="biz-label">Pricing</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>Mid-market power without the enterprise price tag</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7, maxWidth: 560, margin: "16px auto 0" }}>
            Transparent pricing that scales with your headcount and entity count. No hidden fees, no proprietary lock-in.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, maxWidth: 860, margin: "0 auto" }}>
          {[
            {
              tier: "Growth",
              price: "$49",
              sub: "per user / month",
              features: ["Up to 50 users", "2 Entities", "Advanced Workflows", "Executive Dashboards", "Priority Support"],
              highlight: false,
            },
            {
              tier: "Scale",
              price: "$89",
              sub: "per user / month",
              features: ["Up to 200 users", "Up to 5 Entities", "Multi-currency", "Audit Trail", "Consolidation Engine", "Dedicated CSM"],
              highlight: true,
              badge: "Best for Mid-Market",
            },
            {
              tier: "Enterprise",
              price: "Custom",
              sub: "200+ users",
              features: ["Unlimited entities", "Custom SLA", "SSO & SCIM", "Advanced RBAC", "On-premise option"],
              highlight: false,
            },
          ].map((plan) => (
            <div key={plan.tier} style={{
              background: plan.highlight ? "#1a1a1a" : "#fff",
              border: plan.highlight ? "2px solid rgba(199,255,53,0.4)" : "1px solid #e8eae4",
              borderRadius: 16,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              position: "relative",
              boxShadow: plan.highlight ? "0 8px 32px rgba(0,0,0,0.14)" : "none",
            }}>
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "#C7FF35", color: "#1a1a1a", fontSize: 10, fontWeight: 700,
                  padding: "4px 14px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{plan.tier}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: plan.highlight ? "#fff" : "#1a1a1a", lineHeight: 1, marginBottom: 4 }}>{plan.price}</div>
              <div style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.4)" : "#999", marginBottom: 28 }}>{plan.sub}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: plan.highlight ? "rgba(199,255,53,0.15)" : "rgba(122,130,109,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="check-circle" size={10} style={{ color: plan.highlight ? "#C7FF35" : "#7A826D" }} />
                    </div>
                    <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.75)" : "#555" }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/Contact" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "12px 20px", borderRadius: 9, textDecoration: "none",
                fontWeight: 600, fontSize: 14,
                background: plan.highlight ? "#C7FF35" : "transparent",
                color: plan.highlight ? "#1a1a1a" : "#555",
                border: plan.highlight ? "none" : "1px solid #e8eae4",
                transition: "opacity 0.15s ease",
              }}>
                {plan.price === "Custom" ? "Talk to Sales" : "Get Started"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="biz-cta-section">
      <div className="biz-cta-glow" />
      <div className="biz-container" style={{ position: "relative", zIndex: 10 }}>
        <h2 className="biz-cta-title">Your complexity deserves a system built for it.</h2>
        <p className="biz-cta-sub">
          Join 800+ mid-market companies that replaced fragmented tools with Bizak. Multi-entity. Audit-ready. Live in 30 days.
        </p>
        <div className="biz-cta-btn-row">
          <button className="biz-shimmer-btn" style={{ fontSize: 17, fontWeight: 700, padding: "16px 44px", borderRadius: 8, boxShadow: "0 0 20px rgba(199,255,53,0.38)" }}>
            Request a Demo
          </button>
          <button className="biz-btn-ghost">Talk to Sales</button>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function MidMarket() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <InsightsSection />
        <WorkflowSection />
        <TestimonialsSection />
        <PricingTeaserSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
