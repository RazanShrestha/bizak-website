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
    "work-order": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect width="6" height="4" x="9" y="1" rx="1" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    bom: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="6" height="4" x="9" y="2" rx="1" />
        <rect width="6" height="4" x="1" y="16" rx="1" />
        <rect width="6" height="4" x="17" y="16" rx="1" />
        <path d="M12 6v4m0 4-4 2m8-2 4 2M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    floor: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 20V8l4-3 4 3 4-3 4 3v12H2Z" /><path d="M10 20v-6h4v6" /><path d="M2 12h20" />
      </svg>
    ),
    quality: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    mrp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      </svg>
    ),
    downtime: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
    "edit-note": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      </svg>
    ),
    defect: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><line x1="4.93" x2="19.07" y1="4.93" y2="19.07" />
      </svg>
    ),
    inventory: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 7h20" /><path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
        <rect width="20" height="14" x="2" y="7" rx="2" /><path d="M10 12h4" />
      </svg>
    ),
    hub: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    cost: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    insights: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 20h20" /><path d="m5 20-2-9 7-4 3 6 4-3 5 10H5Z" />
      </svg>
    ),
    "check-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    bell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
    list: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" />
        <line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" />
        <line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
      </svg>
    ),
    schedule: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    truck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect width="9" height="13" x="12" y="4" rx="2" /><circle cx="17.5" cy="17.5" r="2.5" /><circle cx="5.5" cy="17.5" r="2.5" />
      </svg>
    ),
    invoice: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" x2="15" y1="13" y2="13" /><line x1="9" x2="15" y1="17" y2="17" />
      </svg>
    ),
    source: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    inspect: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /><path d="m8 11 2 2 4-4" />
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// ─── Work Center node (used in Hero) ─────────────────────────────────────────
function WorkCenterNode({ label, code, oee, active }: { label: string; code: string; oee: string; active: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        border: `1.5px solid ${active ? "rgba(199,255,53,0.5)" : "rgba(122,130,109,0.18)"}`,
        background: active ? "rgba(199,255,53,0.06)" : "rgba(122,130,109,0.03)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        boxShadow: active ? "0 0 12px rgba(199,255,53,0.12)" : "none",
      }}>
        <Icon name="floor" size={17} style={{ color: active ? "#7A826D" : "#ccc" }} />
        <div style={{
          position: "absolute", top: -3, right: -3, width: 9, height: 9,
          borderRadius: "50%",
          background: active ? "#C7FF35" : "#fbbf24",
          boxShadow: active ? "0 0 5px #C7FF35" : "none",
        }} />
      </div>
      <span style={{ fontSize: 7, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{code}</span>
      <span style={{ fontSize: 7, color: "#bbb", letterSpacing: "0.03em" }}>{label}</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: active ? "#C7FF35" : "#bbb" }}>{oee}</span>
    </div>
  );
}

// ─── Hero Section — Production Command Center ─────────────────────────────────
function HeroSection() {
  const wcs = [
    { code: "M-01", label: "Cutting",  oee: "89%", active: true  },
    { code: "M-02", label: "Drilling", oee: "92%", active: true  },
    { code: "M-03", label: "Assembly", oee: "—",   active: false },
    { code: "M-04", label: "QC",       oee: "97%", active: true  },
  ];

  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)", left: "50%" }} />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">

          {/* ── Copy ── */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>Smart Manufacturing Platform</span>
            <h1 className="biz-h1">
              Command the Floor.<br /><span>Master</span> the Output.
            </h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              Connect your BOMs, work orders, shop floor, and quality management into one intelligent command center. Drive throughput, cut waste, and hit every delivery date.
            </p>
            <div className="biz-hero-cta-row">
              <button className="biz-shimmer-btn biz-shimmer-lg">Request Demo</button>
              <button className="biz-btn-outline">
                See How It Works <Icon name="play" size={16} />
              </button>
            </div>
            <div className="biz-hero-stats">
              <div>
                <div className="biz-stat-value">87.4%</div>
                <div className="biz-stat-label">Average OEE</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">96.2%</div>
                <div className="biz-stat-label">On-Time Production</div>
              </div>
            </div>
          </div>

          {/* ── Visual: Production Control Center ── */}
          <div className="biz-hero-visual">
            <div className="biz-vis-glow" />

            {/* ── Main glass panel: production floor HUD ── */}
            <div className="biz-card-main biz-glass biz-float">
              {/* Panel header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(122,130,109,0.65)" }}>
                  Bizak · Production Control
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", color: "#7A826D", textTransform: "uppercase" }}>Live</span>
                </div>
              </div>

              {/* Work centers with SVG flow lines */}
              <div style={{ position: "relative", marginBottom: 14 }}>
                {/* SVG connector lines behind nodes */}
                <svg style={{ position: "absolute", top: "38%", left: "12.5%", width: "75%", height: 2, overflow: "visible", pointerEvents: "none" }} viewBox="0 0 300 2">
                  <line x1="0" y1="1" x2="300" y2="1" stroke="rgba(122,130,109,0.15)" strokeWidth="1.5" />
                  {[60, 150, 240].map((x, i) => (
                    <circle key={i} cx={x} cy="1" r="3" fill="#C7FF35" opacity={i === 1 ? "0.25" : "0.7"}>
                      <animate attributeName="cx" values={`${x - 60};${x + 60}`} dur={`${1.4 + i * 0.4}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;0.8;0" dur={`${1.4 + i * 0.4}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </svg>
                {/* Nodes row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                  {wcs.map((wc) => (
                    <WorkCenterNode key={wc.code} {...wc} />
                  ))}
                </div>
              </div>

              {/* Active WO progress rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingTop: 10, borderTop: "1px solid rgba(122,130,109,0.1)" }}>
                {[
                  { id: "WO-2024-1204", pct: 78, status: "Running" },
                  { id: "WO-2024-1205", pct: 52, status: "Running" },
                ].map((wo) => (
                  <div key={wo.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(122,130,109,0.7)", minWidth: 86 }}>{wo.id}</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(122,130,109,0.1)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${wo.pct}%`, background: "linear-gradient(90deg, #C7FF35, rgba(199,255,53,0.4))", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D" }}>{wo.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Dark card: Active Work Orders ── */}
            <div className="biz-card-inventory biz-glass-dark biz-float-d">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(199,255,53,0.15)", color: "#C7FF35" }}>
                  <Icon name="work-order" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Active Work Orders</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>248 WO</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>On Schedule</span>
                <span style={{ fontSize: 9, color: "#C7FF35", fontWeight: 700 }}>92%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div className="biz-accent-bar" style={{ width: "92%" }} />
              </div>
            </div>

            {/* ── Light card: Line targets ── */}
            <div className="biz-card-globe biz-glass biz-float-s">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(122,130,109,0.1)", color: "#7A826D" }}>
                  <Icon name="schedule" size={18} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Today's Line Targets</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[{ label: "Line A", pct: 84 }, { label: "Line B", pct: 67 }, { label: "Line C", pct: 91 }].map((l) => (
                  <div key={l.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#555" }}>{l.label}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#C7FF35" }}>{l.pct}%</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(122,130,109,0.12)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${l.pct}%`, background: "#C7FF35", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Circle card: OEE gauge ── */}
            <div className="biz-card-circle biz-glass biz-float">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 12 }}>OEE Rate</div>
              <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(199,255,53,0.18)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="0" />
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="#C7FF35" strokeWidth="8" strokeDasharray="201" strokeDashoffset="51" />
                </svg>
                <div style={{ position: "absolute", fontSize: 13, fontWeight: 700, color: "#333" }}>87%</div>
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
            Manufacturing complexity grows faster than your spreadsheets
          </h2>
          <p className="biz-section-intro">
            Disconnected systems and reactive planning hold your factory back from its real throughput potential.
          </p>
        </div>

        <div className="biz-bento-grid">

          {/* 1 · Machine Downtime — uptime timeline */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="downtime" size={22} /></div>
            <h3 className="biz-card-title">Unplanned Downtime</h3>
            <p className="biz-card-desc">Equipment failures and unscheduled stoppages disrupt production targets and cascade directly into customer delivery delays.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", gap: 2, height: 14, marginBottom: 7 }}>
                {[8, 12, 2, 10, 1, 9, 2, 7, 3, 8, 1, 9].map((w, i) => {
                  const isDown = [2, 4, 6, 10].includes(i);
                  return (
                    <div key={i} style={{
                      flex: w, height: "100%", borderRadius: 2,
                      background: isDown ? "#f87171" : "rgba(199,255,53,0.55)",
                      opacity: isDown ? 0.9 : 0.65,
                    }} />
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 8, color: "#7A826D", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: "rgba(199,255,53,0.55)", borderRadius: 2, display: "inline-block" }} />Running
                </span>
                <span style={{ fontSize: 8, color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: "#f87171", borderRadius: 2, display: "inline-block" }} />Downtime
                </span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", marginLeft: "auto" }}>−14.2% OEE</span>
              </div>
            </div>
          </div>

          {/* 2 · Manual Scheduling — planned vs actual bars */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="edit-note" size={22} /></div>
            <h3 className="biz-card-title">Manual Scheduling</h3>
            <p className="biz-card-desc">Spreadsheet-based planning can't react to real-time floor changes, creating schedule variance that compounds across shifts.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {[{ label: "Planned", pct: 75, color: "rgba(122,130,109,0.4)" }, { label: "Actual", pct: 97, color: "#f87171" }].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#999", minWidth: 36, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</span>
                    <div style={{ flex: 1, height: 7, background: "#f3f3f3", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(row.pct, 100)}%`, background: row.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: row.color }}>{row.pct}%</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", animation: "bizPulseGlow 2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em" }}>+29% Schedule Overrun</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 · Quality Rejections — defect stage bars */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="defect" size={22} /></div>
            <h3 className="biz-card-title">Late Quality Catches</h3>
            <p className="biz-card-desc">Defects found at final inspection rather than inline cost 8× more to fix and erode customer confidence with every return.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[{ stage: "Cutting", rate: 1.1 }, { stage: "Assembly", rate: 4.8 }, { stage: "Final QC", rate: 11.6 }].map((s) => (
                  <div key={s.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, color: "#888" }}>{s.stage}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: s.rate > 7 ? "#f87171" : s.rate > 3 ? "#fbbf24" : "#7A826D" }}>{s.rate}%</span>
                    </div>
                    <div style={{ height: 5, background: "#f3f3f3", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${(s.rate / 14) * 100}%`, background: s.rate > 7 ? "#f87171" : s.rate > 3 ? "#fbbf24" : "#7A826D", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>Downstream cost ×8</span>
              </div>
            </div>
          </div>

          {/* 4 · Material Shortages — stock depletion indicators */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="inventory" size={22} /></div>
            <h3 className="biz-card-title">Material Shortages</h3>
            <p className="biz-card-desc">Reactive purchasing without live MRP signals halts production lines when critical raw materials unexpectedly hit zero.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { code: "RM-4021", level: 11, critical: true },
                  { code: "RM-4022", level: 38, critical: false },
                  { code: "RM-4031", level: 6, critical: true },
                ].map((m) => (
                  <div key={m.code}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, fontFamily: "monospace", color: "#666" }}>{m.code}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: m.critical ? "#f87171" : "#7A826D" }}>
                        {m.level}% {m.critical ? "⚠" : ""}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${m.level}%`, background: m.critical ? "#f87171" : "#7A826D", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171" }} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>2 Materials Critical</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5 · Disconnected Systems — node network */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="hub" size={22} /></div>
            <h3 className="biz-card-title">Disconnected Systems</h3>
            <p className="biz-card-desc">Production, procurement, and finance operating off different data versions leads to costly miscommunication and duplicate work.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 44, gap: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(122,130,109,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, background: "rgba(122,130,109,0.4)", borderRadius: "50%" }} />
                </div>
                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", height: 2 }}>
                  <div style={{ width: "100%", height: 1, background: "rgba(122,130,109,0.12)" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                    {[0, 0.5, 1].map((delay, i) => (
                      <div key={i} className="biz-pulse-glow" style={{ width: 4, height: 4, background: "#C7FF35", borderRadius: "50%", animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(199,255,53,0.6)", background: "rgba(199,255,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, background: "#C7FF35", borderRadius: "50%" }} />
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Unified Data Layer</span>
              </div>
            </div>
          </div>

          {/* 6 · Cost Overruns — actual vs standard bars */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="cost" size={22} /></div>
            <h3 className="biz-card-title">Hidden Cost Overruns</h3>
            <p className="biz-card-desc">Without real-time actual-vs-standard costing per work order, production losses only surface at month-end close — too late to act.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{ cat: "Labour", std: 55, act: 70 }, { cat: "Material", std: 78, act: 73 }, { cat: "Overhead", std: 38, act: 56 }].map((row) => (
                  <div key={row.cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 8, color: "#888" }}>{row.cat}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: row.act > row.std ? "#f87171" : "#7A826D" }}>
                        {row.act > row.std ? `+${row.act - row.std}% over` : "On budget"}
                      </span>
                    </div>
                    <div style={{ position: "relative", height: 7, background: "#f3f3f3", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${row.std}%`, background: "rgba(122,130,109,0.28)", borderRadius: 3 }} />
                      <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${Math.min(row.act, 100)}%`, background: row.act > row.std ? "rgba(248,113,113,0.55)" : "rgba(199,255,53,0.5)", borderRadius: 3 }} />
                    </div>
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

// ─── Solution Section ─────────────────────────────────────────────────────────
const SOLUTIONS = [
  { icon: "work-order", title: "Work Order Management",  desc: "Create, schedule, and track production orders end-to-end with real-time status across every work center and shift." },
  { icon: "bom",        title: "Bill of Materials",      desc: "Multi-level BOM with version control, automatic cost rollup, and configurable substitution rules for component shortages." },
  { icon: "mrp",        title: "MRP Automation",         desc: "Demand-driven material planning that auto-generates time-phased purchase requests based on live production schedules." },
  { icon: "floor",      title: "Shop Floor Control",     desc: "Real-time operator and machine status capture via barcode, QR, and mobile — no paper travellers, no manual entries." },
  { icon: "quality",    title: "Quality Management",     desc: "Inline inspection checkpoints, defect logging, and QC hold workflows that prevent non-conformance from reaching the customer." },
  { icon: "insights",   title: "Cost Intelligence",      desc: "Live actual-vs-standard cost analysis per order with variance breakdown across material, labour, and overhead in real time." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>A complete production platform for modern manufacturers</h2>
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

// ─── Capabilities Section (dark) — full-width showcase card first ─────────────
function CapabilitiesSection() {
  return (
    <section className="biz-dark-section">
      <div className="biz-container">
        <div style={{ marginBottom: 64, maxWidth: 560 }}>
          <span className="biz-label">Capabilities</span>
          <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
            Built for the precision demands of modern manufacturers.
          </h2>
        </div>

        <div className="biz-caps-grid">

          {/* ── Row 1 (first!): Full-width Live Production Dashboard ── */}
          <div className="biz-dark-card biz-col-6" style={{ minHeight: 260 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
              {/* Left: headline stats */}
              <div style={{ flexShrink: 0 }}>
                <div className="biz-mini-stat">248</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Active Orders</p>
                <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
                  {[{ val: "92%", lbl: "On-Time" }, { val: "87.4%", lbl: "OEE" }].map((s) => (
                    <div key={s.lbl}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: WO status table */}
              <div style={{ flex: 1, minWidth: 240 }}>
                <h4 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>Live Production Dashboard</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                  Full visibility into every active work order, machine status, and production milestone from a single command screen.
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Work Order", "Work Centre", "Progress", "Status"].map((h, i) => (
                        <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", paddingBottom: 10, textAlign: i > 1 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { wo: "WO-2024-1204", wc: "M-01 Cutting",  pct: 78, status: "running" },
                      { wo: "WO-2024-1205", wc: "M-02 Drilling", pct: 52, status: "running" },
                      { wo: "WO-2024-1206", wc: "M-03 Assembly", pct: 0,  status: "queued"  },
                    ].map((row) => (
                      <tr key={row.wo} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ fontSize: 11, fontFamily: "monospace", color: "#fff", padding: "10px 0" }}>{row.wo}</td>
                        <td style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: "10px 0" }}>{row.wc}</td>
                        <td style={{ padding: "10px 0", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${row.pct}%`, background: row.pct > 0 ? "#C7FF35" : "transparent", borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{row.pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 0", textAlign: "right" }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                            background: row.status === "running" ? "rgba(199,255,53,0.12)" : "rgba(255,255,255,0.06)",
                            color: row.status === "running" ? "#C7FF35" : "rgba(255,255,255,0.3)",
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

          {/* ── Row 2: BOM & Routing | Quality Management ── */}
          <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div>
              <h3>BOM &amp; Routing</h3>
              <p>Multi-level bill of materials with version control, cost rollup, and configurable routing operations per work center. Full substitution management included.</p>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>COMPONENT</span><span>QTY / UOM</span><span>STATE</span>
              </div>
              {[
                { comp: "RM-4021 Steel",  qty: "5.00 KG",  state: "IN STOCK", ok: true  },
                { comp: "RM-4022 Bolt",   qty: "24 PCS",   state: "LOW",      ok: false },
                { comp: "RM-4031 Seal",   qty: "2 PCS",    state: "IN STOCK", ok: true  },
              ].map((r) => (
                <div key={r.comp} className="biz-mono-row">
                  <span>{r.comp}</span><span>{r.qty}</span>
                  <span style={{ color: r.ok ? "#4ade80" : "#fbbf24" }}>{r.state}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Quality Management</h3>
                <p>Inline inspection checkpoints at every operation. Defect classification, QC hold management, and first-pass yield tracking built into every work order.</p>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                <Icon name="quality" size={24} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["99.1%", "First Pass"], ["0.3%", "Scrap Rate"], ["100%", "Traceability"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 3: MRP | Shop Floor (neon) | Cost Control ── */}
          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260 }}>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="mrp" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>MRP Automation</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Auto-generated purchase requests from live demand signals with configurable lead-time and safety-stock buffers.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2 biz-neon-border" style={{ minHeight: 260, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 22 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>Live Tracking</span>
            </div>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="floor" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Shop Floor Control</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Real-time operator and machine capture via barcode, QR, and mobile — no paper travellers, no manual entries.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260, justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="cost" size={34} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Cost Control</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                Actual-vs-standard variance per order, auto-posted to the general ledger. No month-end surprises.
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "91%", background: "#C7FF35" }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Insights Section — chart LEFT, text RIGHT (flipped from DistributionPage) ─
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
                      <linearGradient id="mfgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* OEE trend line */}
                    <path d="M0 155 C 50 145, 90 120, 140 105 S 220 80, 270 72 S 350 45, 400 38" stroke="#7A826D" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0 155 C 50 145, 90 120, 140 105 S 220 80, 270 72 S 350 45, 400 38 V 200 H 0 Z" fill="url(#mfgGrad)" />
                    {/* Throughput dashed line */}
                    <path d="M0 130 C 60 125, 110 140, 170 120 S 260 100, 320 95 S 380 70, 400 65" stroke="rgba(122,130,109,0.4)" strokeWidth="2" strokeDasharray="6 4" />
                    <circle cx="270" cy="72" r="5" fill="#C7FF35" stroke="#7A826D" strokeWidth="2" />
                  </svg>
                  <div className="biz-tooltip">
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>OEE: 87.4% ↑</div>
                    <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>+3.1% vs last quarter</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, background: "rgba(122,130,109,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          </div>

          {/* ── Text on RIGHT ── */}
          <div>
            <span className="biz-label">Production Intelligence</span>
            <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
              Make faster, smarter production decisions.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              Stop firefighting the floor. Use real-time OEE dashboards and cost variance analytics to run your manufacturing operations with full confidence.
            </p>
            <ul className="biz-check-list">
              {[
                { bold: "Real-time OEE Monitoring", rest: " — Availability, performance, and quality in one live view." },
                { bold: "First Pass Yield Tracking", rest: " — Know your defect rate before goods leave the line." },
                { bold: "Work Order Cost Variance", rest: " — Actual vs. standard per order, auto-posted to GL." },
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

// ─── Workflow Section ─────────────────────────────────────────────────────────
const STEPS = [
  { icon: "bom",      label: "Plan"     },
  { icon: "source",   label: "Source"   },
  { icon: "floor",    label: "Produce"  },
  { icon: "inspect",  label: "Inspect"  },
  { icon: "package",  label: "Package"  },
  { icon: "truck",    label: "Dispatch" },
];

function WorkflowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">Production Engine</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>End-to-End Manufacturing Workflow</h2>
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

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="biz-cta-section">
      <div className="biz-cta-glow" />
      <div className="biz-container" style={{ position: "relative", zIndex: 10 }}>
        <h2 className="biz-cta-title">Run your factory floor with complete precision.</h2>
        <p className="biz-cta-sub">
          Join the next generation of manufacturers. Start your journey with Bizak and turn your production operations into a competitive advantage.
        </p>
        <div className="biz-cta-btn-row">
          <button className="biz-shimmer-btn" style={{ fontSize: 17, fontWeight: 700, padding: "16px 44px", borderRadius: 8, boxShadow: "0 0 20px rgba(199,255,53,0.38)" }}>
            Request Demo
          </button>
          <button className="biz-btn-ghost">View Pricing</button>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ManufacturingPage() {
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
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
