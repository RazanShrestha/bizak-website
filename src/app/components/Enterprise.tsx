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
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    bar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    "trending-up": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
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
    "alert-triangle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    cpu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
    key: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
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
    building: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" />
        <path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" />
        <path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
      </svg>
    ),
    "pie-chart": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    award: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    "check-square": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
    invoice: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" x2="15" y1="13" y2="13" /><line x1="9" x2="15" y1="17" y2="17" />
      </svg>
    ),
    sliders: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    ),
    "life-buoy": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
      </svg>
    ),
    "git-merge": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
        <path d="M6 21V9a9 9 0 0 0 9 9" />
      </svg>
    ),
    "arrow-right": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// ─── Checkmark SVG ────────────────────────────────────────────────────────────
function Check({ color = "#7A826D", size = 10 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
// Split layout: dramatic copy left, single-pane unified dashboard right
function HeroSection() {
  const regions = [
    { id: "AMER",   x: 72,  y: 90,  label: "AMER",  users: "3.2K", entities: 14 },
    { id: "EMEA",   x: 180, y: 52,  label: "EMEA",  users: "4.1K", entities: 21 },
    { id: "MEA",    x: 238, y: 90,  label: "MEA",   users: "1.8K", entities: 9  },
    { id: "AFRICA", x: 198, y: 130, label: "AFR",   users: "0.9K", entities: 6  },
    { id: "APAC",   x: 326, y: 72,  label: "APAC",  users: "2.8K", entities: 17 },
  ];
  const edges: [string, string][] = [
    ["AMER", "EMEA"], ["EMEA", "MEA"], ["MEA", "AFRICA"], ["MEA", "APAC"], ["EMEA", "AFRICA"],
  ];
  const getNode = (id: string) => regions.find(r => r.id === id)!;

  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(199,255,53,0.03) 0%, transparent 55%)", pointerEvents: "none" }} />

      <div className="biz-container" style={{ width: "100%", paddingTop: 88, paddingBottom: 88 }}>
        <div className="biz-hero-grid" style={{ gap: 56 }}>

          {/* ── Copy ── */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "6px 14px", borderRadius: 99, border: "1px solid rgba(122,130,109,0.2)", background: "rgba(122,130,109,0.06)", width: "fit-content" }}>
              <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.12em" }}>ERP for Enterprise</span>
            </div>

            <h1 className="biz-h1" style={{ lineHeight: 1.05 }}>
              Unified Command<br />
              for Global<br />
              <span>Operations.</span>
            </h1>

            <p className="biz-hero-sub" style={{ marginTop: 28, maxWidth: 460 }}>
              One platform. 10,000+ users. 67 legal entities. 150+ countries. Bizak Enterprise delivers governance at SAP depth with cloud-native deployment speed — live in 20 weeks, not 3 years.
            </p>

            <div className="biz-hero-cta-row" style={{ marginTop: 36 }}>
              <button className="biz-shimmer-btn biz-shimmer-lg">Request Enterprise Demo</button>
              <button className="biz-btn-outline">
                Watch Overview <Icon name="play" size={15} />
              </button>
            </div>

            <div className="biz-hero-stats" style={{ marginTop: 40 }}>
              {[
                { val: "99.99%", lbl: "Uptime SLA" },
                { val: "150+",   lbl: "Countries" },
                { val: "20 wk",  lbl: "SLA Go-Live" },
              ].map((s, i) => (
                <>
                  <div key={s.val}>
                    <div className="biz-stat-value">{s.val}</div>
                    <div className="biz-stat-label">{s.lbl}</div>
                  </div>
                  {i < 2 && <div key={`div-${i}`} className="biz-divider-v" />}
                </>
              ))}
            </div>
          </div>

          {/* ── Single-pane Command Center dashboard ── */}
          <div className="biz-hero-visual" style={{ perspective: "none", aspectRatio: "auto", minHeight: 480 }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>

              {/* Ambient glow */}
              <div style={{ position: "absolute", top: "20%", right: "10%", width: 280, height: 280, background: "rgba(199,255,53,0.07)", borderRadius: "50%", filter: "blur(90px)", pointerEvents: "none" }} />

              {/* Floating entity-count chip */}
              <div className="biz-glass-dark biz-float-d" style={{ position: "absolute", top: -12, right: -8, zIndex: 30, borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 50px rgba(0,0,0,0.28)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(199,255,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="building" size={18} style={{ color: "#C7FF35" }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>67</div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Legal Entities</div>
                </div>
              </div>

              {/* Main unified dashboard panel */}
              <div className="biz-glass biz-float" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 64px -16px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.65)", position: "relative", zIndex: 10 }}>

                {/* Browser-style titlebar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: "1px solid rgba(122,130,109,0.1)", background: "rgba(248,249,247,0.7)" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                    <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                    <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(122,130,109,0.6)" }}>
                    Bizak · Global Command Center
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                    <span style={{ fontSize: 7, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live</span>
                  </div>
                </div>

                {/* Dashboard body: map + compliance sidebar */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 116px" }}>

                  {/* Map */}
                  <div style={{ padding: "16px 16px 0 16px" }}>
                    <svg style={{ width: "100%", height: 158, display: "block" }} viewBox="0 0 390 158" fill="none" overflow="visible">
                      {[40, 80, 120].map(y => (
                        <line key={y} x1="0" y1={y} x2="390" y2={y} stroke="rgba(122,130,109,0.05)" strokeWidth="1" />
                      ))}
                      {[78, 156, 234, 312].map(x => (
                        <line key={x} x1={x} y1="0" x2={x} y2="158" stroke="rgba(122,130,109,0.05)" strokeWidth="1" />
                      ))}
                      {edges.map(([from, to]) => {
                        const a = getNode(from), b = getNode(to);
                        return (
                          <g key={`${from}-${to}`}>
                            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(199,255,53,0.18)" strokeWidth="1.5" />
                            <circle r="2.5" fill="#C7FF35" opacity="0.85">
                              <animateMotion dur={`${2.2 + Math.random() * 1.2}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
                              <animate attributeName="opacity" values="0;1;0" dur={`${2.2 + Math.random() * 1.2}s`} repeatCount="indefinite" />
                            </circle>
                          </g>
                        );
                      })}
                      {regions.map((r) => (
                        <g key={r.id}>
                          <circle cx={r.x} cy={r.y} r="14" fill="rgba(199,255,53,0.07)" stroke="rgba(199,255,53,0.28)" strokeWidth="1" />
                          <circle cx={r.x} cy={r.y} r="6" fill="#C7FF35" opacity="0.92" />
                          <circle cx={r.x} cy={r.y} r="10" fill="transparent" stroke="rgba(199,255,53,0.22)" strokeWidth="1">
                            <animate attributeName="r" values="6;16;6" dur="3.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.7;0;0.7" dur="3.2s" repeatCount="indefinite" />
                          </circle>
                          <text x={r.x} y={r.y + 26} textAnchor="middle" fill="rgba(122,130,109,0.8)" fontSize="6" fontWeight="700" letterSpacing="0.07em" fontFamily="monospace">
                            {r.label}
                          </text>
                          <text x={r.x} y={r.y + 35} textAnchor="middle" fill="rgba(122,130,109,0.45)" fontSize="5" fontFamily="monospace">
                            {r.entities} entities
                          </text>
                        </g>
                      ))}
                    </svg>

                    {/* Region stats bar */}
                    <div style={{ display: "flex", borderTop: "1px solid rgba(122,130,109,0.1)", padding: "10px 0 14px 0" }}>
                      {regions.map((r, i) => (
                        <div key={r.id} style={{ flex: 1, textAlign: "center", borderRight: i < regions.length - 1 ? "1px solid rgba(122,130,109,0.07)" : "none", padding: "0 2px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a" }}>{r.users}</div>
                          <div style={{ fontSize: 6, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance sidebar */}
                  <div style={{ borderLeft: "1px solid rgba(122,130,109,0.1)", padding: "18px 14px", display: "flex", flexDirection: "column", gap: 0, background: "rgba(248,249,247,0.4)" }}>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A826D", marginBottom: 14 }}>Compliance</div>
                    {[
                      { label: "SOC 2 II"  },
                      { label: "ISO 27001" },
                      { label: "GDPR"      },
                      { label: "HIPAA"     },
                      { label: "PCI DSS"   },
                    ].map((c) => (
                      <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 9, marginBottom: 9, borderBottom: "1px solid rgba(122,130,109,0.07)" }}>
                        <div style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(199,255,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check />
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 600, color: "#555" }}>{c.label}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(122,130,109,0.1)" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>99.99%</div>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 }}>Uptime SLA</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating revenue chip */}
              <div className="biz-glass biz-float-s" style={{ position: "absolute", bottom: 12, left: -20, zIndex: 20, borderRadius: 14, padding: "14px 18px", boxShadow: "0 16px 40px rgba(0,0,0,0.12)", minWidth: 160 }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 6 }}>Consolidated Revenue</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>$1.2B</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <div style={{ height: 3, flex: 1, background: "#e8eae4", borderRadius: 99, overflow: "hidden" }}>
                    <div className="biz-accent-bar" style={{ width: "78%" }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a" }}>+18%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Trust Strip ──────────────────────────────────────────────────────────────
// Redesigned: two-row layout with category label + enhanced badge styling
function TrustStrip() {
  const badges = [
    { label: "SOC 2 Type II",  sub: "Certified",   icon: "shield"  },
    { label: "ISO 27001:2022", sub: "Certified",   icon: "award"   },
    { label: "GDPR",           sub: "Compliant",   icon: "globe"   },
    { label: "HIPAA",          sub: "Compliant",   icon: "lock"    },
    { label: "IFRS / GAAP",    sub: "Ready",       icon: "invoice" },
    { label: "99.99% SLA",     sub: "Guaranteed",  icon: "trending-up" },
  ];

  return (
    <section style={{ background: "#1a1a1a", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "36px 0", overflow: "hidden" }}>
      <div className="biz-container">
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap", marginBottom: 4 }}>
              Built for regulated
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
              industries
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {badges.map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(199,255,53,0.15)", background: "rgba(199,255,53,0.04)", transition: "border-color 0.2s" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={b.icon} size={14} style={{ color: "#C7FF35" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.88)", lineHeight: 1.2 }}>{b.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(199,255,53,0.65)", fontWeight: 600, letterSpacing: "0.06em", marginTop: 1 }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Challenges Section ───────────────────────────────────────────────────────
// "System Audit" framing — challenges numbered as F-01 findings,
// asymmetric grid: one wide feature card + four compact cards
function ChallengesSection() {
  const findings = [
    {
      id: "F-02",
      icon: "award",
      title: "Global Compliance Complexity",
      desc: "Operating in 30 countries means 30 sets of tax laws, data residency rules, and audit requirements — all managed manually.",
      alerts: [
        { label: "GDPR (EU)",           status: "GAP",    color: "#f87171" },
        { label: "VAT Filing (15 co.)", status: "MANUAL", color: "#fbbf24" },
        { label: "Data Residency",      status: "RISK",   color: "#f87171" },
      ],
    },
    {
      id: "F-03",
      icon: "bar",
      title: "Zero Global Visibility",
      desc: "Finance waits 3 weeks for regional month-end packs. By the time the board sees numbers, decisions are already a month late.",
      stats: [
        { label: "Global P&L",      lag: "21 days stale" },
        { label: "Headcount Data",  lag: "14 days stale" },
        { label: "Cash Position",   lag: "7 days stale"  },
      ],
    },
    {
      id: "F-04",
      icon: "lock",
      title: "Access Control at Scale",
      desc: "8,000 users across 50 countries with different roles and entities. Granular RBAC without the right platform is an IT nightmare.",
      stats: [
        { label: "Users with excess access", lag: "34%"   },
        { label: "Orphaned accounts",        lag: "1,240" },
        { label: "Manual role reviews",      lag: "6 mos."},
      ],
    },
    {
      id: "F-05",
      icon: "plug",
      title: "Legacy Integration Debt",
      desc: "Hundreds of brittle point-to-point integrations — every upgrade risks breaking a dozen others.",
      bars: [
        { sku: "Salesforce → SAP",  level: 92 },
        { sku: "Oracle → Workday",  level: 78 },
        { sku: "EDI → Warehouse",   level: 45 },
      ],
    },
  ];

  return (
    <section className="biz-section" style={{ background: "#F8F9F7" }}>
      <div className="biz-container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "end", marginBottom: 52 }}>
          <div>
            <span className="biz-label">System Audit</span>
            <h2 className="biz-h2" style={{ marginTop: 14, maxWidth: 620 }}>
              Enterprise complexity exposes every weakness in legacy ERP
            </h2>
            <p className="biz-section-intro" style={{ marginTop: 14 }}>
              At scale, every inefficiency compounds. The systems that worked at 500 employees fracture under 5,000 users across 50 entities.
            </p>
          </div>
          <div style={{ padding: "10px 18px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f87171", lineHeight: 1 }}>5</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>Critical Findings</div>
          </div>
        </div>

        {/* Asymmetric grid: wide card + 4 compact cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gridTemplateRows: "auto auto", gap: 18 }}>

          {/* F-01: Wide featured card — Legacy ERP Migration Risk */}
          <div className="biz-bento-card" style={{ gridRow: "span 2", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -6, right: 16, fontSize: 56, fontWeight: 900, color: "rgba(248,113,113,0.05)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>F-01</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div className="biz-icon-wrap" style={{ marginBottom: 0, background: "rgba(248,113,113,0.07)" }}>
                <Icon name="database" size={22} style={{ color: "#f87171" }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.12em", background: "rgba(248,113,113,0.08)", padding: "3px 10px", borderRadius: 6 }}>Critical Finding</span>
            </div>
            <h3 className="biz-card-title">Legacy ERP Migration Risk</h3>
            <p className="biz-card-desc">SAP and Oracle implementations cost $10M–$100M and take 18–36 months. Customizations compound, consultants multiply, and business disruption is guaranteed. Yet staying on aging infrastructure is equally costly and exposes the organization to mounting technical and security debt.</p>

            <div className="biz-card-footer" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Avg. ERP implementation",  val: "28 months"  },
                { label: "Cost overrun rate",         val: "75% of cos." },
                { label: "On-time delivery rate",     val: "only 22%"   },
                { label: "Post-go-live satisfaction", val: "38%"        },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#777" }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{r.val}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171" }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>Industry average, 2024</span>
              </div>
            </div>
          </div>

          {/* Right column: 4 compact cards in 2x2 */}
          {findings.map((f) => (
            <div key={f.id} className="biz-bento-card" style={{ position: "relative", overflow: "hidden", padding: "24px 24px 20px" }}>
              <div style={{ position: "absolute", top: -4, right: 12, fontSize: 36, fontWeight: 900, color: "rgba(248,113,113,0.05)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>{f.id}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div className="biz-icon-wrap" style={{ width: 38, height: 38, marginBottom: 0, borderRadius: 9 }}>
                  <Icon name={f.icon} size={18} />
                </div>
              </div>
              <h3 className="biz-card-title" style={{ fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
              <p className="biz-card-desc" style={{ fontSize: 13, marginBottom: 16 }}>{f.desc}</p>
              <div className="biz-card-footer" style={{ paddingTop: 14 }}>
                {f.alerts && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {f.alerts.map((a) => (
                      <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 6, background: "rgba(248,113,113,0.05)" }}>
                        <Icon name="alert-triangle" size={11} style={{ color: a.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "#555", flex: 1 }}>{a.label}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, color: a.color, textTransform: "uppercase" }}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                )}
                {f.stats && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {f.stats.map((s) => (
                      <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#777" }}>{s.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#f87171" }}>{s.lag}</span>
                      </div>
                    ))}
                  </div>
                )}
                {f.bars && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {f.bars.map((b) => (
                      <div key={b.sku}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 9, color: "#999", fontFamily: "monospace" }}>{b.sku}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: b.level > 60 ? "#f87171" : "#7A826D" }}>{b.level}% fragile {b.level > 60 ? "⚠" : ""}</span>
                        </div>
                        <div style={{ height: 4, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${b.level}%`, background: b.level > 60 ? "#f87171" : "#7A826D", borderRadius: 99 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Solution Section ─────────────────────────────────────────────────────────
// Three "hero capability" pillars at top, three compact items below
const PILLARS = [
  {
    icon: "globe",
    color: "#C7FF35",
    colorBg: "rgba(199,255,53,0.1)",
    title: "Global Multi-Entity Engine",
    desc: "Manage unlimited legal entities, currencies, and jurisdictions from one platform. Auto-consolidate with intercompany eliminations, FX revaluation, and IFRS/GAAP-ready financials.",
    metrics: [
      { val: "67+", lbl: "Legal Entities" },
      { val: "40+", lbl: "Currencies"     },
    ],
  },
  {
    icon: "shield",
    color: "#7A826D",
    colorBg: "rgba(122,130,109,0.1)",
    title: "Enterprise Security & RBAC",
    desc: "SSO, SAML 2.0, SCIM provisioning, and field-level access control. Every user sees exactly what their role permits — from CEO to regional AR clerk.",
    metrics: [
      { val: "SAML", lbl: "SSO Ready" },
      { val: "SCIM", lbl: "Auto-Provision" },
    ],
  },
  {
    icon: "cpu",
    color: "#C7FF35",
    colorBg: "rgba(199,255,53,0.1)",
    title: "AI Decision Intelligence",
    desc: "Predictive cash flow, anomaly detection on transactions, and AI-generated variance analysis. Turn your ERP data into a board-ready strategic asset.",
    metrics: [
      { val: "13wk",  lbl: "Rolling Forecast" },
      { val: "Real-time", lbl: "Anomaly Detection" },
    ],
  },
];

const COMPACT_SOLUTIONS = [
  { icon: "award",      title: "Regulatory Compliance Suite", desc: "Built-in SOX, GDPR, VAT controls. One-click audit trail and compliance reporting." },
  { icon: "plug",       title: "Open Integration Platform",   desc: "RESTful APIs and 300+ pre-built connectors. Replace integration spaghetti with a governed data layer." },
  { icon: "life-buoy",  title: "White-Glove Implementation", desc: "Dedicated team, guaranteed go-live SLA, and hypercare through your first full close cycle." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 14 }}>Enterprise-grade from day one. Not bolted on later.</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7, maxWidth: 520, margin: "14px auto 0" }}>
            Every critical enterprise capability — compliance, multi-entity, security — is built into the platform core, not added as a module.
          </p>
        </div>

        {/* Three hero pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 20 }}>
          {PILLARS.map((p) => (
            <div key={p.title} style={{ border: "1px solid #e8eae4", borderRadius: 18, padding: "32px 28px", background: "#fff", display: "flex", flexDirection: "column", transition: "border-color 0.25s, box-shadow 0.25s", cursor: "default" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = p.color === "#C7FF35" ? "rgba(199,255,53,0.6)" : "rgba(122,130,109,0.4)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e8eae4"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 13, background: p.colorBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                <Icon name={p.icon} size={24} style={{ color: p.color === "#C7FF35" ? "#7A826D" : p.color }} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: "#1a1a1a", marginBottom: 12, lineHeight: 1.25 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, flex: 1 }}>{p.desc}</p>
              <div style={{ display: "flex", gap: 14, marginTop: 24, paddingTop: 20, borderTop: "1px solid #f2f2f2" }}>
                {p.metrics.map((m) => (
                  <div key={m.lbl}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>{m.val}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{m.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Three compact supporting items */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {COMPACT_SOLUTIONS.map((s) => (
            <div key={s.title} style={{ display: "flex", gap: 16, padding: "20px 22px", border: "1px solid #e8eae4", borderRadius: 13, background: "#F8F9F7", alignItems: "flex-start" }}>
              <div className="biz-sol-icon" style={{ width: 40, height: 40, marginBottom: 0, flexShrink: 0, borderRadius: 9 }}>
                <Icon name={s.icon} size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: "#777", lineHeight: 1.55 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Capabilities Section ─────────────────────────────────────────────────────
// Dark section restructured: full-width dashboard card + 2-col middle + 3 bottom tiles
function CapabilitiesSection() {
  return (
    <section className="biz-dark-section">
      <div className="biz-container">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 520 }}>
            <span className="biz-label" style={{ color: "rgba(199,255,53,0.7)" }}>Capabilities</span>
            <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
              Enterprise power. No implementation nightmare.
            </h2>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { val: "$1.2B", lbl: "Consolidated Revenue" },
              { val: "67",   lbl: "Legal Entities" },
              { val: "40+",  lbl: "Currencies" },
            ].map((s) => (
              <div key={s.lbl} style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#C7FF35", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 1: Full-width Global Dashboard */}
        <div className="biz-dark-card biz-col-6" style={{ marginBottom: 16, minHeight: 240 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Global Consolidated View</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 24 }}>
                Revenue, EBITDA, headcount, and compliance status across every entity — live, in a single board-ready view. No Excel. No waiting for regional packs.
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Region", "Revenue", "EBITDA", "Status"].map((h, i) => (
                      <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.28)", paddingBottom: 10, textAlign: i > 1 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { region: "AMER", revenue: "$420M", ebitda: "22%", status: "healthy" },
                    { region: "EMEA", revenue: "$510M", ebitda: "19%", status: "healthy" },
                    { region: "APAC", revenue: "$270M", ebitda: "17%", status: "review"  },
                  ].map((row) => (
                    <tr key={row.region} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ fontSize: 11, color: "#fff", padding: "10px 0", fontFamily: "monospace" }}>{row.region}</td>
                      <td style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: "10px 0" }}>{row.revenue}</td>
                      <td style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", padding: "10px 0", textAlign: "right" }}>{row.ebitda}</td>
                      <td style={{ padding: "10px 0", textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: row.status === "healthy" ? "rgba(199,255,53,0.12)" : "rgba(251,191,36,0.12)", color: row.status === "healthy" ? "#C7FF35" : "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right: Sparkline visual */}
            <div style={{ flexShrink: 0, minWidth: 220 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>12-Month Revenue Trend</div>
              <svg width="220" height="80" viewBox="0 0 220 80" fill="none">
                <defs>
                  <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 68 C 20 62, 40 55, 65 44 S 110 30, 145 22 S 185 14, 220 8" stroke="#C7FF35" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0 68 C 20 62, 40 55, 65 44 S 110 30, 145 22 S 185 14, 220 8 V 80 H 0 Z" fill="url(#capGrad)" />
                <circle cx="220" cy="8" r="5" fill="#C7FF35" />
                <circle cx="220" cy="8" r="9" fill="none" stroke="rgba(199,255,53,0.3)" strokeWidth="1.5">
                  <animate attributeName="r" values="5;12;5" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" />
                </circle>
              </svg>
              <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                {[{ val: "18%", lbl: "YoY Growth" }, { val: "Q1 2025", lbl: "Latest Close" }].map((s) => (
                  <div key={s.lbl}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Identity & Compliance side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="biz-dark-card" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Identity & Access</h3>
                <p>SSO, SAML 2.0, SCIM auto-provisioning, and MFA enforcement across all 67 entities.</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="key" size={20} style={{ color: "#C7FF35" }} />
              </div>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>PROTOCOL</span><span>PROVIDER</span><span>STATUS</span>
              </div>
              {[
                { step: "SAML", module: "Azure AD",    ok: true,  status: "ACTIVE" },
                { step: "SCIM", module: "Okta",         ok: true,  status: "ACTIVE" },
                { step: "MFA",  module: "All users",    ok: true,  status: "FORCED" },
                { step: "RBAC", module: "67 entities",  ok: true,  status: "LIVE"   },
              ].map((r) => (
                <div key={r.step} className="biz-mono-row">
                  <span>{r.step}</span><span>{r.module}</span>
                  <span style={{ color: r.ok ? "#4ade80" : "rgba(255,255,255,0.3)" }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-dark-card" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Compliance Automation</h3>
                <p>Automated VAT filing, transfer pricing docs, and audit-ready reports. Close books in 2 days, not 3 weeks.</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="award" size={20} style={{ color: "#C7FF35" }} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["2 Days", "Month Close"], ["100%", "Audit Trail"], ["40+", "Tax Regimes"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Three tech tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "cpu",     title: "AI Decision Intelligence", desc: "Predictive cashflow, anomaly detection, and AI-generated variance commentary for every monthly close." },
            { icon: "plug",    title: "Open Integration Platform", desc: "RESTful APIs, webhooks, and 300+ pre-built connectors to replace your integration spaghetti.", badge: "API-First" },
            { icon: "sliders", title: "Deployment Flexibility",    desc: "Cloud, private cloud, or hybrid. Data residency controls per region. Your infrastructure rules." },
          ].map((tile) => (
            <div key={tile.title} className={`biz-dark-card${tile.badge ? " biz-neon-border" : ""}`} style={{ minHeight: 220, position: "relative" }}>
              {tile.badge && (
                <div style={{ position: "absolute", top: 16, right: 18 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>{tile.badge}</span>
                </div>
              )}
              <div style={{ color: "#C7FF35", marginBottom: 18 }}><Icon name={tile.icon} size={32} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 10 }}>{tile.title}</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{tile.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Security & Compliance Section ───────────────────────────────────────────
// "Security Hub" layout: central score + certs + controls
function ComplianceSection() {
  const certifications = [
    { name: "SOC 2 Type II",    scope: "All modules",          renewed: "2025"    },
    { name: "ISO 27001:2022",   scope: "Global data centers",   renewed: "2025"    },
    { name: "GDPR",             scope: "EU data processing",    renewed: "Ongoing" },
    { name: "HIPAA",            scope: "Health sector clients", renewed: "Ongoing" },
    { name: "PCI DSS Level 1",  scope: "Payment processing",   renewed: "2025"    },
    { name: "CSA STAR Level 2", scope: "Cloud security",        renewed: "2025"    },
  ];

  const controls = [
    "End-to-end encryption at rest and in transit",
    "Field-level data masking for PII/PHI",
    "Immutable audit log — zero tampering possible",
    "Automated DSAR response tooling (GDPR Art. 17)",
    "Data residency enforcement per entity",
    "Penetration testing — bi-annual external audit",
  ];

  return (
    <section className="biz-section" style={{ background: "#F8F9F7", borderTop: "1px solid #e8eae4" }}>
      <div className="biz-container">

        {/* Security score hero card */}
        <div style={{ background: "#1a1a1a", borderRadius: 20, padding: "48px 52px", marginBottom: 40, display: "grid", gridTemplateColumns: "200px 1fr", gap: 56, alignItems: "center" }}>
          {/* Circular score */}
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                <circle cx="80" cy="80" r="68" fill="transparent" stroke="#C7FF35" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 68 * 0.999} ${2 * Math.PI * 68 * 0.001}`}
                  strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#C7FF35", lineHeight: 1 }}>A+</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>Security</div>
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>Zero critical findings<br />in 4 consecutive audits</div>
          </div>

          {/* Score breakdowns */}
          <div>
            <div style={{ marginBottom: 6 }}>
              <span className="biz-label" style={{ color: "rgba(199,255,53,0.65)" }}>Security & Trust</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              Enterprise security that passes every audit.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 28 }}>
              Security is not a feature at Bizak Enterprise — it's the foundation. Every module is built to meet the requirements of the world's most regulated industries.
            </p>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { val: "6",      lbl: "Major Certifications"  },
                { val: "100%",   lbl: "Audit Trail Coverage"  },
                { val: "Bi-ann", lbl: "External Pentest"      },
                { val: "0",      lbl: "Critical CVEs (2024)"  },
              ].map((s) => (
                <div key={s.lbl}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#C7FF35" }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications + Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>Certifications & Standards</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {certifications.map((c) => (
                <div key={c.name} style={{ background: "#fff", border: "1px solid #e8eae4", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{c.name}</span>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(199,255,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#888" }}>{c.scope}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.06em" }}>Renewed {c.renewed}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>Platform Security Controls</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {controls.map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "#fff", border: "1px solid #e8eae4", borderRadius: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(199,255,53,0.12)", border: "1.5px solid rgba(122,130,109,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check />
                  </div>
                  <span style={{ fontSize: 13, color: "#444", lineHeight: 1.4 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Insights Section ─────────────────────────────────────────────────────────
// Text left, live chart right — with region highlight tabs
function InsightsSection() {
  const regions = [
    { label: "AMER", revenue: "$420M", growth: "+14%" },
    { label: "EMEA", revenue: "$510M", growth: "+18%" },
    { label: "APAC", revenue: "$270M", growth: "+22%" },
  ];

  return (
    <section className="biz-section" style={{ background: "#fff" }}>
      <div className="biz-container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Text left */}
          <div>
            <span className="biz-label">Global Intelligence</span>
            <h2 className="biz-h2" style={{ marginTop: 14, marginBottom: 20, lineHeight: 1.2 }}>
              The global view your board actually needs.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              Stop assembling board packs from regional spreadsheets. Bizak Enterprise consolidates every entity, currency, and jurisdiction into a single live view — from P&L to cash position to headcount, in real time.
            </p>
            <ul className="biz-check-list">
              {[
                { bold: "Live Consolidation Engine",    rest: " — Multi-entity P&L, balance sheet, and cash with auto intercompany eliminations and FX revaluation." },
                { bold: "Board-Ready Reports on Demand", rest: " — Export IFRS or GAAP-compliant investor-grade packs directly from live data. No Excel required." },
                { bold: "Predictive Cashflow AI",        rest: " — 13-week rolling forecast with AI-powered variance analysis across every entity." },
              ].map((item) => (
                <li key={item.bold} className="biz-check-item">
                  <span className="biz-check-icon"><Icon name="check-circle" size={20} /></span>
                  <span><strong>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart right */}
          <div style={{ position: "relative" }}>
            <div className="biz-chart-frame biz-glass">
              <div className="biz-chart-inner">

                {/* Region tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {regions.map((r, i) => (
                    <div key={r.label} style={{
                      padding: "6px 14px", borderRadius: 8, cursor: "default",
                      background: i === 0 ? "#1a1a1a" : "rgba(122,130,109,0.1)",
                      color: i === 0 ? "#fff" : "#888",
                      fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {r.label}
                      {i === 0 && <span style={{ fontSize: 9, color: "#C7FF35", fontWeight: 700 }}>{r.growth}</span>}
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div style={{ height: 220, background: "#fff", borderRadius: 8, border: "1px solid rgba(232,234,228,0.5)", position: "relative", padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 360 180" fill="none">
                    <defs>
                      <linearGradient id="insGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="insGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7A826D" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#7A826D" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[45, 90, 135].map(y => (
                      <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="rgba(122,130,109,0.07)" strokeWidth="1" />
                    ))}
                    <path d="M0 145 C 45 132, 90 115, 145 92 S 240 64, 290 46 S 335 30, 360 22" stroke="#7A826D" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0 145 C 45 132, 90 115, 145 92 S 240 64, 290 46 S 335 30, 360 22 V 180 H 0 Z" fill="url(#insGrad1)" />
                    <path d="M0 158 C 45 152, 90 144, 145 132 S 240 116, 290 104 S 335 92, 360 86" stroke="rgba(122,130,109,0.45)" strokeWidth="2" strokeDasharray="5 4" />
                    <path d="M0 158 C 45 152, 90 144, 145 132 S 240 116, 290 104 S 335 92, 360 86 V 180 H 0 Z" fill="url(#insGrad2)" />
                    <circle cx="290" cy="46" r="5" fill="#C7FF35" stroke="#7A826D" strokeWidth="2" />
                    <text x="10" y="140" fill="rgba(122,130,109,0.6)" fontSize="8" fontFamily="monospace">AMER</text>
                    <text x="10" y="153" fill="rgba(122,130,109,0.45)" fontSize="8" fontFamily="monospace">EMEA</text>
                  </svg>
                  <div className="biz-tooltip">
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>Global: $1.2B ↑</div>
                    <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>+18% YoY consolidated</div>
                  </div>
                </div>

                {/* Region KPIs */}
                <div style={{ display: "flex", gap: 0, marginTop: 16 }}>
                  {regions.map((r, i) => (
                    <div key={r.label} style={{ flex: 1, textAlign: "center", borderRight: i < regions.length - 1 ? "1px solid #e8eae4" : "none", padding: "8px 4px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{r.revenue}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", marginTop: 2 }}>{r.label} · {r.growth}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -32, right: -32, width: 160, height: 160, background: "rgba(122,130,109,0.04)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Implementation Journey ───────────────────────────────────────────────────
// Horizontal timeline with alternating above/below labels
const PHASES = [
  { phase: "01", label: "Discovery",      duration: "Weeks 1–2",  icon: "database",  desc: "Architecture review, entity mapping, and data audit",              above: true  },
  { phase: "02", label: "Architecture",   duration: "Weeks 3–4",  icon: "layers",    desc: "Security config, RBAC design, and integration blueprint",          above: false },
  { phase: "03", label: "Pilot",          duration: "Weeks 5–8",  icon: "setup",     desc: "Single-entity go-live with full team shadowing",                   above: true  },
  { phase: "04", label: "Staged Rollout", duration: "Weeks 9–16", icon: "migrate",   desc: "Phased expansion across all entities and regions",                  above: false },
  { phase: "05", label: "Hypercare",      duration: "Weeks 17–20",icon: "life-buoy", desc: "Dedicated support through first full close cycle",                  above: true  },
  { phase: "06", label: "Steady State",   duration: "Week 21+",   icon: "go",        desc: "CSM-led optimization and continuous improvement program",            above: false },
];

function ImplementationSection() {
  const DOT_H = 52;
  const LABEL_H = 110;
  const TOTAL_H = LABEL_H + DOT_H + LABEL_H;

  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">Implementation</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>A proven path from contract to global go-live.</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7, maxWidth: 560, margin: "16px auto 0" }}>
            Our dedicated enterprise team follows a structured 20-week playbook. SLA-backed delivery milestones — no surprises, no overruns.
          </p>
        </div>

        {/* Horizontal timeline — horizontally scrollable on small screens */}
        <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: 8 }}>
          <div style={{ minWidth: 720, position: "relative", height: TOTAL_H + 32 }}>

            {/* Central connecting line with gradient */}
            <div style={{
              position: "absolute",
              top: LABEL_H + DOT_H / 2,
              left: "calc(100% / 12)",
              right: "calc(100% / 12)",
              height: 2,
              background: "linear-gradient(to right, rgba(122,130,109,0.15), #C7FF35 50%, rgba(122,130,109,0.15))",
              transform: "translateY(-50%)",
            }} />

            {/* Phase items */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${PHASES.length}, 1fr)`, height: "100%" }}>
              {PHASES.map((p) => (
                <div key={p.phase} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", position: "relative" }}>

                  {/* Above: label or spacer */}
                  <div style={{ height: LABEL_H, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 6px", textAlign: "center" }}>
                    {p.above && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{p.label}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a", background: "rgba(199,255,53,0.15)", padding: "2px 8px", borderRadius: 5, display: "inline-block", marginBottom: 6, alignSelf: "center" }}>
                          <span style={{ color: "#7A826D" }}>{p.duration}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#999", lineHeight: 1.4 }}>{p.desc}</div>
                      </>
                    )}
                  </div>

                  {/* Dot */}
                  <div style={{ position: "relative", zIndex: 10, width: DOT_H, height: DOT_H, flexShrink: 0 }}>
                    <div style={{ width: DOT_H, height: DOT_H, borderRadius: "50%", background: "#fff", border: "2px solid rgba(122,130,109,0.2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", position: "relative" }}>
                      <Icon name={p.icon} size={20} style={{ color: "#7A826D" }} />
                    </div>
                    <div style={{ position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, color: "rgba(199,255,53,0.9)", background: "#1a1a1a", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>
                      {p.phase}
                    </div>
                  </div>

                  {/* Below: label or spacer */}
                  <div style={{ flex: 1, paddingTop: 28, padding: "28px 6px 0", textAlign: "center" }}>
                    {!p.above && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{p.label}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#7A826D", background: "rgba(199,255,53,0.15)", padding: "2px 8px", borderRadius: 5, display: "inline-block", marginBottom: 6 }}>
                          {p.duration}
                        </div>
                        <div style={{ fontSize: 11, color: "#999", lineHeight: 1.4 }}>{p.desc}</div>
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLA commitment banner */}
        <div style={{ marginTop: 48, padding: "22px 30px", background: "#1a1a1a", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(199,255,53,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check-circle" size={22} style={{ color: "#C7FF35" }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>SLA-backed implementation milestones</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>Every delivery phase is contractually guaranteed. Miss a milestone? You receive service credits.</div>
            </div>
          </div>
          <a href="/Contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#C7FF35", color: "#1a1a1a", borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0 }}>
            Talk to Implementation Team <Icon name="arrow-right" size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
// Magazine layout: tall featured dark card left, two stacked cards right
const TESTIMONIALS = [
  {
    quote: "We replaced SAP R/3 across 14 subsidiaries in 18 months — half the time our previous integrator quoted. The consolidation engine alone saves our finance team 3 weeks every quarter.",
    name: "Fiona Lebedev",
    role: "Group CFO, Meridian Global Holdings",
    metric: "18-month global rollout",
    featured: true,
  },
  {
    quote: "The SSO integration and RBAC took two days to configure. Our previous ERP took 6 months and still had gaps.",
    name: "James Osei",
    role: "CTO, Stratum International",
    metric: "2-day security setup",
    featured: false,
  },
  {
    quote: "Our first external audit after deploying Bizak — zero findings. The audit trail and segregation of duties are exactly what the Big 4 need to see.",
    name: "Priya Nair",
    role: "Head of Internal Audit, TerraGroup",
    metric: "Zero audit findings",
    featured: false,
  },
];

function Stars({ size = 13 }: { size?: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#C7FF35" stroke="#C7FF35" strokeWidth={1.5}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection() {
  const featured = TESTIMONIALS.find(t => t.featured)!;
  const small = TESTIMONIALS.filter(t => !t.featured);

  return (
    <section className="biz-section" style={{ background: "#F8F9F7", borderTop: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="biz-label">Customer Stories</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>Enterprise teams that made the move to Bizak</h2>
        </div>

        {/* Magazine grid: 1/3 tall dark card + 2/3 two stacked */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: 20, alignItems: "stretch" }}>

          {/* Featured: tall dark card */}
          <div style={{ background: "#1a1a1a", borderRadius: 20, padding: "44px 36px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(199,255,53,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

            <Stars />

            <div style={{ fontSize: 80, lineHeight: 0.8, color: "rgba(199,255,53,0.12)", fontFamily: "Georgia, serif", marginTop: 20, flexShrink: 0 }}>"</div>

            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, fontStyle: "italic", flex: 1, marginTop: 12 }}>
              {featured.quote}
            </p>

            <div style={{ marginTop: 32 }}>
              <div style={{ width: 48, height: 1, background: "rgba(199,255,53,0.3)", marginBottom: 20 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{featured.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{featured.role}</div>
              <div style={{ marginTop: 16, fontSize: 11, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(199,255,53,0.1)", padding: "7px 14px", borderRadius: 8, display: "inline-block" }}>
                {featured.metric}
              </div>
            </div>
          </div>

          {/* Two stacked white cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {small.map((t) => (
              <div key={t.name} style={{ background: "#fff", border: "1px solid #e8eae4", borderRadius: 16, padding: "32px 32px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                <Stars size={12} />
                <p style={{ fontSize: 15, color: "#444", lineHeight: 1.7, fontStyle: "italic", flex: 1, marginTop: 16 }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{t.role}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.07em", background: "rgba(122,130,109,0.08)", padding: "6px 12px", borderRadius: 8 }}>
                    {t.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
// Immersive dark section with large decorative text, stats row, and dual CTAs
function CTASection() {
  return (
    <section style={{ background: "#1A1D19", padding: "120px 0", position: "relative", overflow: "hidden", textAlign: "center" }}>

      {/* Decorative large background text */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "clamp(64px, 12vw, 160px)", fontWeight: 900, color: "rgba(199,255,53,0.03)", whiteSpace: "nowrap", pointerEvents: "none", letterSpacing: "-0.04em", userSelect: "none", lineHeight: 1 }}>
        ENTERPRISE
      </div>

      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "15%", left: "8%", width: 360, height: 360, background: "rgba(199,255,53,0.05)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 280, height: 280, background: "rgba(122,130,109,0.08)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      <div className="biz-container" style={{ position: "relative", zIndex: 10 }}>

        <span className="biz-label" style={{ color: "rgba(199,255,53,0.6)" }}>Start Today</span>

        <h2 className="biz-cta-title" style={{ marginTop: 16, marginBottom: 20, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
          Enterprise ERP decisions are made once.<br />Make this one count.
        </h2>

        <p className="biz-cta-sub" style={{ maxWidth: 500 }}>
          Join global enterprises replacing SAP and Oracle with Bizak. Multi-entity. SOC 2 certified. Live in 20 weeks — with your name on the SLA.
        </p>

        {/* Key stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 48, flexWrap: "wrap" }}>
          {[
            { val: "99.99%",  lbl: "Uptime SLA"    },
            { val: "150+",    lbl: "Countries"      },
            { val: "20 wks",  lbl: "To Go-Live"     },
            { val: "0",       lbl: "Hidden Fees"    },
          ].map((s) => (
            <div key={s.lbl} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#C7FF35", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 5 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="biz-cta-btn-row">
          <button className="biz-shimmer-btn" style={{ fontSize: 16, fontWeight: 700, padding: "16px 44px", borderRadius: 9, boxShadow: "0 0 24px rgba(199,255,53,0.4)" }}>
            Request Enterprise Demo
          </button>
          <button className="biz-btn-ghost" style={{ color: "rgba(255,255,255,0.75)", borderColor: "rgba(255,255,255,0.14)", fontSize: 15 }}>
            Talk to Sales
          </button>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.02em" }}>
          No commitment required · Custom pricing for 500+ user organizations
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Enterprise() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <TrustStrip />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <ComplianceSection />
        <InsightsSection />
        <ImplementationSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
