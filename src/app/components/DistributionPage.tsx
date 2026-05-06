// import "./distribution-page.css";
import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── SVG Icon Helper ──────────────────────────────────────────────────────────
function Icon({ name, size = 24, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const icons: Record<string, JSX.Element> = {
    rocket: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l7-7-3-3-7 7Z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    inventory: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 7h20" /><path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /><rect width="20" height="14" x="2" y="7" rx="2" /><path d="M10 12h4" />
      </svg>
    ),
    "edit-note": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      </svg>
    ),
    truck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect width="9" height="13" x="12" y="4" rx="2" /><circle cx="17.5" cy="17.5" r="2.5" /><circle cx="5.5" cy="17.5" r="2.5" />
      </svg>
    ),
    "eye-off": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" x2="23" y1="1" y2="23" />
      </svg>
    ),
    hub: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    warehouse: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m2 7 10-5 10 5v14H2V7Z" /><path d="M9 22V12h6v10" />
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
    bolt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
    insights: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 20h20" /><path d="m5 20-2-9 7-4 3 6 4-3 5 10H5Z" />
      </svg>
    ),
    "account-tree": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="6" height="4" x="9" y="2" rx="1" />
        <rect width="6" height="4" x="1" y="16" rx="1" />
        <rect width="6" height="4" x="17" y="16" rx="1" />
        <path d="M12 6v4m0 4-4 2m8-2 4 2M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    sync: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      </svg>
    ),
    bell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
    "check-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
      </svg>
    ),
    list: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" />
        <line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" />
        <line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
      </svg>
    ),
    payments: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
    inbox: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
      </svg>
    ),
    gps: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    manufacturing: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 20V8l4-3 4 3 4-3 4 3v12H2Z" /><path d="M10 20v-6h4v6" />
      </svg>
    ),
    invoice: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" x2="15" y1="13" y2="13" /><line x1="9" x2="15" y1="17" y2="17" />
      </svg>
    ),
  };

  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)", right: 0, left: "50%" }} />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">
          {/* ── Copy ── */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>Unified Distribution Platform</span>
            <h1 className="biz-h1">
              ERP for Trading &amp;&nbsp;<span>Distribution</span> Companies
            </h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              Consolidate your purchasing, warehouse inventory, and multi-channel sales into a single source of truth. Scale without the operational complexity.
            </p>
            <div className="biz-hero-cta-row">
              <button className="biz-shimmer-btn biz-shimmer-lg">Request Demo</button>
              <button className="biz-btn-outline">
                See How It Works
                <Icon name="play" size={16} />
              </button>
            </div>
            <div className="biz-hero-stats">
              <div>
                <div className="biz-stat-value">99.9%</div>
                <div className="biz-stat-label">Inventory Accuracy</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">24/7</div>
                <div className="biz-stat-label">Real-time Sync</div>
              </div>
            </div>
          </div>

          {/* ── Visual ── */}
          <div className="biz-hero-visual">
            <div className="biz-vis-glow" />
            {/* Main glass panel */}
            <div className="biz-card-main biz-glass biz-float">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
                </div>
                <div style={{ height: 14, width: 112, background: "rgba(122,130,109,0.1)", borderRadius: 99 }} />
              </div>
              <div className="biz-card-row">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="biz-skeleton-line" />
                  <div className="biz-skeleton-line" style={{ width: "80%" }} />
                  <div className="biz-skeleton-box" style={{ background: "rgba(122,130,109,0.05)", border: "1px solid rgba(122,130,109,0.1)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="biz-skeleton-line" />
                  <div className="biz-skeleton-line" style={{ width: "75%" }} />
                  <div className="biz-skeleton-box" style={{ background: "rgba(199,255,53,0.08)", border: "1px solid rgba(199,255,53,0.18)" }} />
                </div>
              </div>
            </div>
            {/* Inventory card (dark) */}
            <div className="biz-card-inventory biz-glass-dark biz-float-d">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(199,255,53,0.15)", color: "#C7FF35" }}>
                  <Icon name="inventory" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Live Inventory</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>14,204 SKU</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>In Stock</span>
                <span style={{ fontSize: 9, color: "#C7FF35", fontWeight: 700 }}>88%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div className="biz-accent-bar" style={{ width: "88%" }} />
              </div>
            </div>
            {/* Globe card */}
            <div className="biz-card-globe biz-glass biz-float-s">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(122,130,109,0.1)", color: "#7A826D" }}>
                  <Icon name="globe" size={18} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Global Shipments</div>
              </div>
              <div style={{ position: "relative", height: 80, background: "rgba(232,234,228,0.3)", borderRadius: 8, border: "1px solid rgba(232,234,228,0.5)", overflow: "hidden" }}>
                <svg style={{ position: "absolute", inset: 0, opacity: 0.2 }} viewBox="0 0 200 80" fill="none">
                  <path d="M20,40 Q60,15 100,40 T180,40" stroke="currentColor" strokeWidth="1" />
                </svg>
                {[{ top: "50%", left: "25%", delay: "0s" }, { top: "33%", left: "65%", delay: "0.5s" }, { top: "65%", left: "50%", delay: "1s" }].map((p, i) => (
                  <div key={i} className="biz-data-dot biz-pulse-glow"
                    style={{ top: p.top, left: p.left, animationDelay: p.delay, transform: "translate(-50%,-50%)" }} />
                ))}
              </div>
            </div>
            {/* Warehouse utilisation */}
            <div className="biz-card-circle biz-glass biz-float">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 12 }}>Warehouse Util.</div>
              <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(199,255,53,0.18)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="60" />
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="#C7FF35" strokeWidth="8" strokeDasharray="201" strokeDashoffset="120" />
                </svg>
                <div style={{ position: "absolute", fontSize: 13, fontWeight: 700, color: "#333" }}>72%</div>
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
            Distribution operations become complex as you grow
          </h2>
          <p className="biz-section-intro">
            Legacy systems and fragmented processes can't keep up with the demands of modern scaling distributors.
          </p>
        </div>

        <div className="biz-bento-grid">

          {/* 1 · Stock Discrepancies */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="inventory" size={22} /></div>
            <h3 className="biz-card-title">Stock Discrepancies</h3>
            <p className="biz-card-desc">Mismatches between physical counts and system records lead to overselling and customer dissatisfaction.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 6, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, #f87171, #fde68a, #7A826D)", width: "100%" }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  Correction Active
                </span>
              </div>
            </div>
          </div>

          {/* 2 · Manual Tracking */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="edit-note" size={22} /></div>
            <h3 className="biz-card-title">Manual Tracking</h3>
            <p className="biz-card-desc">Reliance on spreadsheets creates bottlenecks and critical human error in daily data entry and verification.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Human Error Rate</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171" }}>High</span>
                </div>
                <div style={{ height: 6, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#f87171", width: "85%" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24", animation: "bizPulseGlow 2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sync Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 · Fulfillment Delays */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="truck" size={22} /></div>
            <h3 className="biz-card-title">Fulfillment Delays</h3>
            <p className="biz-card-desc">Disconnected warehouse teams and archaic pick-lists slow down the pace of delivery to your customers.</p>
            <div className="biz-card-footer">
              {/* Timeline visualization */}
              <div style={{ position: "relative", height: 40, width: "100%", display: "flex", alignItems: "center" }}>
                {/* Base track */}
                <div style={{ position: "absolute", width: "100%", height: 1, background: "#e5e7eb" }} />
                {/* Delayed path */}
                <div style={{ position: "absolute", left: 0, width: "40%", height: 2, background: "#f87171", top: "calc(50% - 2px)" }} />
                {/* Optimized path */}
                <div style={{ position: "absolute", left: 0, width: "90%", height: 2, background: "rgba(199,255,53,0.6)", top: "calc(50% + 1px)" }} />
                {/* Dots */}
                <div style={{ position: "absolute", left: 0, width: 8, height: 8, borderRadius: "50%", background: "#7A826D", top: "50%", transform: "translateY(-50%)" }} />
                <div style={{ position: "absolute", left: "40%", width: 8, height: 8, borderRadius: "50%", background: "#f87171", top: "50%", transform: "translate(-50%,-50%)" }} />
                <div style={{ position: "absolute", right: "5%", width: 8, height: 8, borderRadius: "50%", background: "#C7FF35", boxShadow: "0 0 8px #C7FF35", top: "50%", transform: "translateY(-50%)" }} />
                {/* Labels */}
                <span style={{ position: "absolute", top: 0, left: "33%", fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.05em" }}>Delayed</span>
                <span style={{ position: "absolute", bottom: 0, left: "58%", fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bizak Optimized</span>
              </div>
            </div>
          </div>

          {/* 4 · Visibility Gap */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="eye-off" size={22} /></div>
            <h3 className="biz-card-title">Visibility Gap</h3>
            <p className="biz-card-desc">Inability to track goods in transit or multi-location stock levels in real-time results in inefficient ordering.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Radar ping */}
                <div style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div className="biz-radar-ping" style={{ position: "absolute", inset: 0, background: "rgba(199,255,53,0.12)", borderRadius: "50%" }} />
                  <div style={{ width: 6, height: 6, background: "#C7FF35", borderRadius: "50%", boxShadow: "0 0 8px #C7FF35", position: "relative", zIndex: 10 }} />
                  <div style={{ position: "absolute", top: 8, right: 8, width: 4, height: 4, background: "rgba(122,130,109,0.4)", borderRadius: "50%" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 14, width: 4, height: 4, background: "rgba(122,130,109,0.4)", borderRadius: "50%" }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Warehouse Radar</div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>Illuminating Blind Spots</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 · Siloed Data */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="hub" size={22} /></div>
            <h3 className="biz-card-title">Siloed Data</h3>
            <p className="biz-card-desc">Purchasing and Sales teams working off different versions of truth across your multi-branch locations.</p>
            <div className="biz-card-footer">
              {/* Connected nodes */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, height: 44 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(122,130,109,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, background: "rgba(122,130,109,0.4)", borderRadius: "50%" }} />
                </div>
                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", height: 2 }}>
                  <div style={{ width: "100%", height: 1, background: "rgba(122,130,109,0.15)" }} />
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
                <span style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Data Ingestion</span>
              </div>
            </div>
          </div>

          {/* 6 · Compliance Risk */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="shield" size={22} /></div>
            <h3 className="biz-card-title">Compliance Risk</h3>
            <p className="biz-card-desc">Difficulties tracking lot numbers, expiry dates, and required regulatory paperwork as volume increases.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Circular gauge */}
                <div style={{ position: "relative", width: 44, height: 44 }}>
                  <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="18" fill="transparent" stroke="#f3f3f3" strokeWidth="4" />
                    <circle cx="24" cy="24" r="18" fill="transparent" stroke="#f87171" strokeWidth="4"
                      strokeDasharray="113" strokeDashoffset="40" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171" }}>65%</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>Regulatory Check</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="biz-pulse-glow" style={{ width: 8, height: 8, borderRadius: "50%", background: "#C7FF35", boxShadow: "0 0 8px #C7FF35" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em" }}>Audit Ready</span>
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

// ─── Solution Section ─────────────────────────────────────────────────────────
const SOLUTIONS = [
  { icon: "warehouse",    title: "Centralized Inventory",  desc: "Real-time visibility across all warehouses, transit hubs, and retail points in a single dashboard." },
  { icon: "cart",         title: "Efficient Purchasing",   desc: "Automate replenishment based on lead times and demand forecasts to optimize cash flow." },
  { icon: "bolt",         title: "Faster Fulfillment",     desc: "Integrated picking, packing, and shipping workflows with direct carrier connections for speed." },
  { icon: "settings",     title: "Warehouse Control",      desc: "Sophisticated bin management and barcode scanning for 99.9% inventory accuracy levels." },
  { icon: "insights",     title: "Financial Visibility",   desc: "Real-time P&L per SKU, including accurate landed costs and multi-currency conversions." },
  { icon: "account-tree", title: "Multi-branch Sync",      desc: "Manage global entities with ease, keeping local compliance and global reporting perfectly aligned." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>A complete operational platform for modern distributors</h2>
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
            Built for the operational demands of distributors.
          </h2>
        </div>

        <div className="biz-caps-grid">

          {/* ── Row 1: Batch & Lot | Pick & Pack ── */}
          <div className="biz-dark-card biz-col-3" style={{ minHeight: 440 }}>
            <div>
              <h3>Batch &amp; Lot Tracking</h3>
              <p>Full traceability from manufacturer to end customer. Perfect for food, chemical, or electronics distribution where provenance is critical.</p>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>BATCH_ID</span><span>EXP_DATE</span><span>STATUS</span>
              </div>
              <div className="biz-mono-row">
                <span>#B-2024-001</span><span>2025-12-30</span>
                <span style={{ color: "#4ade80" }}>PASSED</span>
              </div>
              <div className="biz-mono-row">
                <span>#B-2024-002</span><span>2026-04-15</span>
                <span style={{ color: "#fbbf24" }}>PENDING</span>
              </div>
            </div>
          </div>

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Pick &amp; Pack Rules</h3>
                <p>FIFO, FEFO, or LIFO automated routing. Optimize warehouse floor walk paths and expiration management.</p>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                <Icon name="list" size={26} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["FIFO", "First In"], ["FEFO", "Expiry"], ["LIFO", "Last In"]].map(([label, sub]) => (
                <div key={label} className="biz-method-box">
                  <div className="biz-method-label">{label}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 2: Stock Transfers | Low Stock (neon) | Unit Conversions ── */}
          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260 }}>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="sync" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Stock Transfers</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Inter-warehouse logistics and inventory balancing across entities with ease.
            </p>
          </div>

          {/* Low Stock — neon highlight border + "High Priority" badge */}
          <div className="biz-dark-card biz-col-2 biz-neon-border" style={{ minHeight: 260, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 22 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>High Priority</span>
            </div>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="bell" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Low Stock Alerts</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Automated reorder triggers synchronized with supplier lead times.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260, justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="package" size={34} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Unit Conversions</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                Buy in pallets, sell in units, track in kilograms effortlessly.
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "66%", background: "#C7FF35" }} />
              </div>
            </div>
          </div>

          {/* ── Row 3: Full-width Inventory Precision stat ── */}
          <div className="biz-dark-card biz-col-6">
            <div className="biz-precision-card">
              <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                <div>
                  <div className="biz-mini-stat">99.8%</div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Accuracy</p>
                </div>
                <div style={{ maxWidth: 400 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 19, color: "#fff", marginBottom: 8 }}>Inventory Precision</h4>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                    Our enterprise customers maintain near-perfect inventory levels through automated reconciliation and digital cycle counting.
                  </p>
                </div>
              </div>
              <button className="biz-read-btn">Read Audit Report</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Strategic Insights Section ───────────────────────────────────────────────
function InsightsSection() {
  return (
    <section className="biz-section" style={{ background: "#fff" }}>
      <div className="biz-container">
        <div className="biz-insights-grid">
          <div>
            <span className="biz-label">Strategic Insights</span>
            <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
              Make faster, smarter operational decisions.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              Stop guessing. Use real-time demand forecasting and profit margin analytics to
              steer your distribution business with confidence.
            </p>
            <ul className="biz-check-list">
              {[{ bold: "Demand Forecasting", rest: " — AI-driven stock prediction." }, { bold: "Real-time Margin Tracking", rest: " — Profitability per order." }].map((item) => (
                <li key={item.bold} className="biz-check-item">
                  <span className="biz-check-icon"><Icon name="check-circle" size={20} /></span>
                  <span><strong>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ position: "relative" }}>
            <div className="biz-chart-frame biz-glass">
              <div className="biz-chart-inner">
                <div className="biz-chart-topbar">
                  <div style={{ height: 36, width: 148, background: "#e8eae4", borderRadius: 8 }} />
                  <div style={{ height: 36, width: 88, background: "rgba(122,130,109,0.18)", borderRadius: 8 }} />
                </div>
                <div style={{ height: 240, background: "#fff", borderRadius: 8, border: "1px solid rgba(232,234,228,0.5)", position: "relative", padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" fill="none">
                    <path d="M0 150 C 50 140, 100 80, 150 100 S 250 20, 400 50" stroke="#7A826D" strokeWidth="3" />
                    <path d="M0 150 C 50 140, 100 80, 150 100 S 250 20, 400 50 V 200 H 0 Z" fill="rgba(122,130,109,0.05)" />
                    <circle cx="150" cy="100" r="5" fill="#C7FF35" stroke="#7A826D" strokeWidth="2" />
                  </svg>
                  <div className="biz-tooltip">
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>PROFIT MARGIN: 24.2%</div>
                    <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>↑ 2.4% vs last month</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -40, right: -40, width: 180, height: 180, background: "rgba(122,130,109,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Workflow Section ─────────────────────────────────────────────────────────
const STEPS = [
  { icon: "payments",      label: "Purchase" },
  { icon: "inbox",         label: "Receive"  },
  { icon: "gps",           label: "Track"    },
  { icon: "manufacturing", label: "Process"  },
  { icon: "truck",         label: "Ship"     },
  { icon: "invoice",       label: "Invoice"  },
];

function WorkflowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">Optimization Engine</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>End-to-End Distribution Workflow</h2>
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
        <h2 className="biz-cta-title">Run your distribution business with complete control.</h2>
        <p className="biz-cta-sub">
          Join the next generation of global traders. Start your journey with Bizak today and eliminate the complexity.
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
export function DistributionPage() {
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