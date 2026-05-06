import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

function Icon({ name, size = 24, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const icons: Record<string, JSX.Element> = {
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    plug: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M9 2v6" /><path d="M15 2v6" />
        <path d="M6 8h12v3a6 6 0 0 1-12 0V8z" /><path d="M12 17v5" />
      </svg>
    ),
    link: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
      </svg>
    ),
    "link-broken": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 0 1 4 8" />
        <path d="m22 22-5-5" /><path d="m17 22 5-5" />
      </svg>
    ),
    shuffle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 18h1.4a4 4 0 0 0 3.3-1.7l6.6-9.6A4 4 0 0 1 16.6 5H22" />
        <path d="m18 2 4 3-4 3" /><path d="M2 6h1.9a4 4 0 0 1 3.5 2.1" />
        <path d="M22 18h-5.6a4 4 0 0 1-3.3-1.7l-.7-1" /><path d="m18 14 4 4-4 4" />
      </svg>
    ),
    hub: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    webhook: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
        <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
        <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
      </svg>
    ),
    retry: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    key: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="7.5" cy="15.5" r="3.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    alert: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m21.7 16.4-7.4-12.8a2.6 2.6 0 0 0-4.5 0L2.3 16.4A2.6 2.6 0 0 0 4.6 20h14.8a2.6 2.6 0 0 0 2.3-3.6Z" />
        <path d="M12 9v4" /><path d="M12 17h.01" />
      </svg>
    ),
    "check-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" />
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    code: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    "file-text": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="9" x2="15" y1="13" y2="13" /><line x1="9" x2="15" y1="17" y2="17" />
      </svg>
    ),
    bell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    branch: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    ),
    upload: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
      </svg>
    ),
    cloud: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 0 0 4.16 11.5a4.4 4.4 0 0 0 .34 7.5z" />
      </svg>
    ),
    fragment: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
      </svg>
    ),
    sparkles: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 3l1.9 4.6L19 9.5l-4.6 1.9L12 16l-1.9-4.6L5 9.5l4.6-1.9L12 3z" />
        <path d="M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

const HUB_NODES = [
  { abbr: "STR", name: "Stripe",     x: 30,  y: 18,  pull: true  },
  { abbr: "SHO", name: "Shopify",    x: 138, y: 8,   pull: false },
  { abbr: "HUB", name: "HubSpot",    x: 246, y: 18,  pull: true  },
  { abbr: "QBO", name: "QuickBooks", x: 30,  y: 132, pull: false },
  { abbr: "AWS", name: "S3",         x: 138, y: 142, pull: true  },
  { abbr: "SAL", name: "Salesforce", x: 246, y: 132, pull: false },
];

function HeroSection() {
  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)", left: "50%" }} />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>Integrations</span>
            <h1 className="biz-h1">
              Every system in your stack, <br /><span>speaking the same language.</span>
            </h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              Bizak connects banks, ecommerce, payments, payroll, and 200+ external systems with bidirectional sync, automatic retries, and audit-grade lineage — so your ERP is always the single source of truth.
            </p>
            <div className="biz-hero-cta-row">
              <button className="biz-shimmer-btn biz-shimmer-lg">Request Demo</button>
              <button className="biz-btn-outline">
                Browse Connector Library <Icon name="play" size={16} />
              </button>
            </div>
            <div className="biz-hero-stats">
              <div>
                <div className="biz-stat-value">200+</div>
                <div className="biz-stat-label">Connectors</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">99.99%</div>
                <div className="biz-stat-label">Sync Uptime</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">&lt; 60s</div>
                <div className="biz-stat-label">Sync Latency</div>
              </div>
            </div>
          </div>

          <div className="biz-hero-visual">
            <div className="biz-vis-glow" />

            <div className="biz-card-main biz-glass biz-float">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(122,130,109,0.65)" }}>
                  Bizak · Sync Hub
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", color: "#7A826D", textTransform: "uppercase" }}>Live</span>
                </div>
              </div>

              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <svg viewBox="0 0 280 160" style={{ width: "100%", height: "100%" }} fill="none">
                  <defs>
                    <radialGradient id="hubGlow" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="140" cy="80" r="50" fill="url(#hubGlow)" />
                  {HUB_NODES.map((n) => {
                    const cx1 = n.x + 22;
                    const cy1 = n.y + 12;
                    return (
                      <g key={n.abbr}>
                        <line x1="140" y1="80" x2={cx1} y2={cy1} stroke="rgba(122,130,109,0.18)" strokeWidth="1" />
                        <line x1={n.pull ? cx1 : 140} y1={n.pull ? cy1 : 80} x2={n.pull ? 140 : cx1} y2={n.pull ? 80 : cy1}
                              className="biz-flow" stroke="#C7FF35" strokeWidth="1.4"
                              strokeDasharray="3 7" strokeLinecap="round" opacity="0.85" />
                      </g>
                    );
                  })}
                  <circle cx="140" cy="80" r="22" fill="rgba(199,255,53,0.18)" stroke="#C7FF35" strokeWidth="1.4" />
                  <text x="140" y="83" textAnchor="middle" fontSize="9" fontWeight="800" fill="#7A826D" letterSpacing="0.5">BIZAK</text>
                  {HUB_NODES.map((n) => (
                    <g key={n.abbr}>
                      <rect x={n.x} y={n.y} width="44" height="24" rx="5"
                            fill="rgba(255,255,255,0.85)" stroke="rgba(122,130,109,0.25)" strokeWidth="1" />
                      <text x={n.x + 22} y={n.y + 16} textAnchor="middle" fontSize="9" fontWeight="800" fill="#333" letterSpacing="0.5">{n.abbr}</text>
                      <circle cx={n.x + 38} cy={n.y + 5} r="2.2" fill={n.pull ? "#16a34a" : "#C7FF35"} />
                    </g>
                  ))}
                </svg>
              </div>

              <div style={{ borderTop: "1px solid rgba(122,130,109,0.1)", paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Event Stream</span>
                  <span style={{ fontSize: 7, fontWeight: 700, color: "#16a34a" }}>2,184 today</span>
                </div>
                {[
                  { code: "SO-1182", arrow: "→", target: "Shopify",  ago: "2s",  ok: true },
                  { code: "INV-947", arrow: "←", target: "QuickBooks", ago: "8s",  ok: true },
                  { code: "PAY-3002", arrow: "→", target: "Stripe",   ago: "12s", ok: true },
                ].map((e) => (
                  <div key={e.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 8, padding: "2px 0" }}>
                    <span style={{ color: "#555", fontFamily: "monospace", fontWeight: 700 }}>{e.code}</span>
                    <span style={{ color: "#7A826D" }}>{e.arrow} {e.target}</span>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>{e.ago}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="biz-card-inventory biz-glass-dark biz-float-d">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(199,255,53,0.15)", color: "#C7FF35" }}>
                  <Icon name="plug" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Active Connectors</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>47 live</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { lbl: "Healthy",  pct: 92, c: "#C7FF35" },
                  { lbl: "Degraded", pct: 6,  c: "#fbbf24" },
                  { lbl: "Failed",   pct: 2,  c: "#f87171" },
                ].map((r) => (
                  <div key={r.lbl}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{r.lbl}</span>
                      <span style={{ fontSize: 8, color: r.c, fontWeight: 700 }}>{r.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${r.pct}%`, background: r.c }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="biz-card-globe biz-glass biz-float-s">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(122,130,109,0.1)", color: "#7A826D" }}>
                  <Icon name="webhook" size={18} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Webhook Queue</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 26, marginBottom: 6 }}>
                {[28, 44, 22, 60, 38, 72, 48, 66, 82, 54, 74, 90].map((h, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${h}%`,
                    background: i === 11 ? "#C7FF35" : "rgba(122,130,109,0.32)",
                    borderRadius: 1.5,
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: "#888" }}>Events · 60 min</span>
                <span style={{ fontSize: 9, color: "#7A826D", fontWeight: 700 }}>0 in DLQ</span>
              </div>
            </div>

            <div className="biz-card-circle biz-glass biz-float">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 12 }}>Sync Health</div>
              <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(199,255,53,0.18)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="0" />
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="#C7FF35" strokeWidth="8" strokeDasharray="201" strokeDashoffset="2" />
                </svg>
                <div style={{ position: "absolute", fontSize: 12, fontWeight: 700, color: "#333" }}>99.99%</div>
              </div>
            </div>

            {[{ top: "30%", left: "52%", delay: "0s" }, { top: "58%", left: "32%", delay: "1.5s" }, { top: "40%", left: "70%", delay: "2.5s" }].map((p, i) => (
              <div key={i} className="biz-data-dot biz-particle" style={{ top: p.top, left: p.left, animationDelay: p.delay }} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function ChallengesSection() {
  return (
    <section className="biz-section" style={{ background: "#F8F9F7" }}>
      <div className="biz-container">
        <div style={{ marginBottom: 48 }}>
          <span className="biz-label">The Integration Gap</span>
          <h2 className="biz-h2" style={{ marginTop: 16, maxWidth: 720 }}>
            Six systems, six truths — and a thousand CSV files in between.
          </h2>
          <p className="biz-section-intro">
            Most ERP stacks are surrounded by a graveyard of brittle SFTP jobs, ad-hoc Zapier flows, and half-written webhooks. By the time the data reaches the ledger, the answers are already wrong.
          </p>
        </div>

        <div className="biz-bento-grid">

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="fragment" size={22} /></div>
            <h3 className="biz-card-title">Disconnected Systems</h3>
            <p className="biz-card-desc">Sales lives in a CRM, payments in a gateway, inventory in a WMS. None of them know the others exist — until reconciliation day.</p>
            <div className="biz-card-footer">
              <div style={{ position: "relative", height: 56 }}>
                {[
                  { x: "8%",  y: "10%", l: "CRM" },
                  { x: "44%", y: "5%",  l: "WMS" },
                  { x: "80%", y: "15%", l: "POS" },
                  { x: "4%",  y: "62%", l: "FIN" },
                  { x: "42%", y: "70%", l: "PAY" },
                  { x: "78%", y: "58%", l: "BNK" },
                ].map((n) => (
                  <div key={n.l} style={{
                    position: "absolute", left: n.x, top: n.y,
                    width: 26, height: 22, borderRadius: 4,
                    background: "rgba(248,113,113,0.08)",
                    border: "1px dashed rgba(248,113,113,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, fontWeight: 800, color: "#f87171", letterSpacing: "0.04em",
                  }}>{n.l}</div>
                ))}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>6 islands · 0 bridges</span>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="upload" size={22} /></div>
            <h3 className="biz-card-title">Manual CSV Loop</h3>
            <p className="biz-card-desc">Export from system A, clean in Excel, import into system B. Repeat every Monday. Repeat for every entity. Repeat for every team.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { task: "Export from CRM", h: "2.0h", w: 50 },
                  { task: "Reformat in Excel", h: "3.5h", w: 80 },
                  { task: "Import to ERP",   h: "1.5h", w: 38 },
                ].map((t) => (
                  <div key={t.task} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 8, color: "#666", minWidth: 80 }}>{t.task}</span>
                    <div style={{ flex: 1, height: 6, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${t.w}%`, background: "rgba(248,113,113,0.55)", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", minWidth: 28, textAlign: "right" }}>{t.h}</span>
                  </div>
                ))}
                <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>≈ 7h / week / ops lead</span>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="link-broken" size={22} /></div>
            <h3 className="biz-card-title">Brittle Webhooks</h3>
            <p className="biz-card-desc">A vendor changes a field name and your sync silently breaks. By the time someone notices, the ledger has drifted by hundreds of orders.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 8, color: "#888", minWidth: 56 }}>DIY stack</span>
                  <div style={{ flex: 1, display: "flex", gap: 1.5, height: 12 }}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} style={{
                        flex: 1, borderRadius: 1,
                        background: [3, 7, 11, 16, 19, 22].includes(i) ? "rgba(248,113,113,0.7)" : "rgba(122,130,109,0.12)",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171" }}>6 fail/d</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 8, color: "#888", minWidth: 56 }}>Bizak</span>
                  <div style={{ flex: 1, display: "flex", gap: 1.5, height: 12 }}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} style={{
                        flex: 1, borderRadius: 1,
                        background: "rgba(199,255,53,0.55)",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D" }}>0 fail/d</span>
                </div>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="activity" size={22} /></div>
            <h3 className="biz-card-title">Silent Sync Drift</h3>
            <p className="biz-card-desc">Two systems drift apart line-by-line. By month-end, the bank, the CRM, and the ledger all disagree — and nobody knows which one to trust.</p>
            <div className="biz-card-footer">
              <div style={{ position: "relative", height: 50 }}>
                <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 200 50" preserveAspectRatio="none" fill="none">
                  <path d="M0 25 L40 23 L80 26 L120 22 L160 28 L200 24" stroke="#7A826D" strokeWidth="1.6" />
                  <path d="M0 25 L40 27 L80 30 L120 35 L160 41 L200 46" stroke="#f87171" strokeWidth="1.6" strokeDasharray="3 3" />
                  <line x1="0" y1="25" x2="200" y2="25" stroke="rgba(122,130,109,0.1)" strokeWidth="0.5" />
                </svg>
                <div style={{ position: "absolute", top: -2, right: 0, fontSize: 8, fontWeight: 700, color: "#7A826D" }}>Source · CRM</div>
                <div style={{ position: "absolute", bottom: -2, right: 0, fontSize: 8, fontWeight: 700, color: "#f87171" }}>Target · ERP (drift)</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>Δ $84k variance</span>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="shield" size={22} /></div>
            <h3 className="biz-card-title">No Audit Lineage</h3>
            <p className="biz-card-desc">When a number looks wrong, can you trace it back to the original webhook payload? Most stacks can&apos;t — and your auditor will notice.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { lvl: "ERP entry",  v: "$12,480",   ok: true },
                  { lvl: "Mid-tier",   v: "?",         ok: false },
                  { lvl: "Source API", v: "?",         ok: false },
                ].map((row, i) => (
                  <div key={row.lvl} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "5px 8px", borderRadius: 4,
                    background: row.ok ? "rgba(199,255,53,0.1)" : "rgba(248,113,113,0.06)",
                    border: `1px solid ${row.ok ? "rgba(199,255,53,0.3)" : "rgba(248,113,113,0.18)"}`,
                    marginLeft: i * 12,
                  }}>
                    <span style={{ fontSize: 9, color: row.ok ? "#555" : "#bbb", fontWeight: 600 }}>{row.lvl}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: row.ok ? "#7A826D" : "#f87171" }}>{row.ok ? row.v : "✕ untraceable"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="key" size={22} /></div>
            <h3 className="biz-card-title">Credential Sprawl</h3>
            <p className="biz-card-desc">API keys live in a junior developer&apos;s .env file. Rotation is manual, scopes are overgrown, and revoking access takes a sprint.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { lbl: "Stripe key", scope: "full",      bad: true  },
                  { lbl: "Shopify",    scope: "read+write", bad: true  },
                  { lbl: "Bank SFTP",  scope: "shared",    bad: true  },
                  { lbl: "Bizak",      scope: "scoped · rotated", bad: false },
                ].map((row) => (
                  <div key={row.lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, color: "#666", fontFamily: "monospace", fontWeight: 600 }}>{row.lbl}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 700,
                      padding: "2px 7px", borderRadius: 4,
                      background: row.bad ? "rgba(248,113,113,0.12)" : "rgba(199,255,53,0.18)",
                      color: row.bad ? "#f87171" : "#7A826D",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{row.scope}</span>
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

const SOLUTIONS = [
  { icon: "layers",   title: "200+ Pre-Built Connectors", desc: "From Stripe and Shopify to SAP and SWIFT — drop in a connector, authenticate, and the data flows. No glue code, no maintenance burden." },
  { icon: "shuffle",  title: "Bidirectional Sync",        desc: "Push and pull on the same channel. Sales orders flow in, fulfillment status flows out — with conflict resolution and idempotency baked in." },
  { icon: "branch",   title: "Visual Field Mapper",       desc: "Map source schemas to Bizak entities through a drag-and-drop canvas. Transform, lookup, and route values without writing scripts." },
  { icon: "retry",    title: "Retry & Dead-Letter Queue", desc: "Transient failures retry with exponential backoff. Permanent failures land in the DLQ with full payload — replay or fix-and-resume in one click." },
  { icon: "shield",   title: "Audit-Grade Lineage",       desc: "Every record carries the originating payload, transform, and timestamp. Trace any ledger row back to the API response that produced it." },
  { icon: "code",     title: "Low-Code Recipe Builder",   desc: "When pre-builts aren’t enough, compose a recipe with HTTP, JSON, and conditional logic. Ship custom integrations in hours, not sprints." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>One integration layer for every system you run</h2>
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

function CapabilitiesSection() {
  return (
    <section className="biz-dark-section">
      <div className="biz-container">
        <div style={{ marginBottom: 64, maxWidth: 580 }}>
          <span className="biz-label">Capabilities</span>
          <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
            A connector platform built into your ERP, not bolted on.
          </h2>
        </div>

        <div className="biz-caps-grid">

          <div className="biz-dark-card biz-col-6" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0 }}>
                <div className="biz-mini-stat">200+</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Connectors · Marketplace</p>
                <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
                  {[{ val: "8", lbl: "Categories" }, { val: "<2 min", lbl: "Avg Setup" }].map((s) => (
                    <div key={s.lbl}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 280 }}>
                <h4 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>The Connector Marketplace</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                  Every connector is versioned, certified, and maintained — so vendor API changes never become your problem.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { abbr: "STR", cat: "Payments" },
                    { abbr: "SHO", cat: "Commerce" },
                    { abbr: "QBO", cat: "Ledger" },
                    { abbr: "SAL", cat: "CRM" },
                    { abbr: "BNK", cat: "Banking" },
                    { abbr: "PAY", cat: "Payroll" },
                    { abbr: "SAP", cat: "ERP" },
                    { abbr: "AWS", cat: "Storage" },
                  ].map((c) => (
                    <div key={c.abbr} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "10px 8px",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#C7FF35", letterSpacing: "0.04em" }}>{c.abbr}</div>
                      <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{c.cat}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div>
              <h3>Field Mapper</h3>
              <p>Drag source fields onto Bizak entities. Add transforms, lookups, and conditional routes — without writing a line of code.</p>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>SOURCE</span><span>→</span><span>TARGET</span>
              </div>
              {[
                { src: "stripe.charge.id",       tgt: "tx_external_id",    ok: true },
                { src: "stripe.amount / 100",    tgt: "tx_amount_usd",     ok: true },
                { src: "stripe.metadata.so",     tgt: "sales_order.code",  ok: true },
                { src: "stripe.created · ISO",   tgt: "tx_posted_at",      ok: true },
              ].map((r) => (
                <div key={r.src} className="biz-mono-row">
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>{r.src}</span>
                  <span style={{ color: "#C7FF35" }}>→</span>
                  <span style={{ color: "#4ade80" }}>{r.tgt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Retry &amp; Replay</h3>
                <p>Failures retry automatically with exponential backoff. The unrecoverable ones land in a queryable dead-letter queue — replay any payload in a click.</p>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                <Icon name="retry" size={24} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["3", "Auto Retries"], ["5m", "Backoff Cap"], ["1-click", "DLQ Replay"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260 }}>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="webhook" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Webhook Router</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Receive, validate, dedupe, and fan out events to any module. Sub-second routing with HMAC verification on every payload.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2 biz-neon-border" style={{ minHeight: 260, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 22 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>Watching</span>
            </div>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="eye" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Health Monitoring</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Per-connector dashboards with throughput, error rate, and latency percentiles. Alerts fire only on real degradation, not noise.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260, justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="shield" size={34} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Vault &amp; Scoped Secrets</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                Credentials encrypted at rest, scoped per connector, and rotated on a schedule. SOC 2 logged, never logged in plaintext.
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["AES-256", "HMAC", "OAuth", "mTLS"].map((b) => (
                  <span key={b} style={{
                    fontSize: 9, fontWeight: 700, padding: "4px 8px", borderRadius: 4,
                    background: "rgba(199,255,53,0.1)", color: "#C7FF35",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{b}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function InsightsSection() {
  const lanes = [
    { lbl: "Inbound · Webhooks", v: 84, color: "#C7FF35" },
    { lbl: "Outbound · API",     v: 62, color: "rgba(199,255,53,0.55)" },
    { lbl: "Scheduled Pulls",    v: 38, color: "rgba(122,130,109,0.5)" },
    { lbl: "Bulk Imports",       v: 24, color: "rgba(122,130,109,0.3)" },
  ];
  return (
    <section className="biz-section" style={{ background: "#fff" }}>
      <div className="biz-container">
        <div className="biz-insights-grid">

          <div style={{ position: "relative" }}>
            <div className="biz-chart-frame biz-glass">
              <div className="biz-chart-inner">
                <div className="biz-chart-topbar">
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Sync Volume · 24h</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginTop: 4 }}>2.18M <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>+8.6%</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", padding: "3px 8px", background: "rgba(22,163,74,0.1)", borderRadius: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>● Healthy</span>
                  </div>
                </div>

                <div style={{ height: 220, background: "#fff", borderRadius: 8, border: "1px solid rgba(232,234,228,0.5)", padding: "20px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", justifyContent: "center" }}>
                    {lanes.map((l) => (
                      <div key={l.lbl} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 9, color: "#666", minWidth: 110, fontWeight: 600 }}>{l.lbl}</span>
                        <div style={{ flex: 1, height: 16, background: "rgba(122,130,109,0.06)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                          <div style={{ height: "100%", width: `${l.v}%`, background: l.color, borderRadius: 4 }} />
                          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, transparent 0%, transparent 50%, rgba(255,255,255,0.4) 50%, transparent 60%)", backgroundSize: "20px 100%" }} />
                        </div>
                        <span style={{ fontSize: 9, color: "#7A826D", fontWeight: 700, minWidth: 32, textAlign: "right" }}>{l.v * 18}k</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    position: "absolute", top: 10, right: 14,
                    background: "#fff", border: "1px solid var(--biz-sage-soft)",
                    borderRadius: 6, padding: "8px 12px", fontSize: 10,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>p95 latency · 412ms</div>
                    <div style={{ fontSize: 9, color: "#16a34a", fontWeight: 700, marginTop: 2 }}>▼ 18% vs last week</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, background: "rgba(199,255,53,0.06)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          </div>

          <div>
            <span className="biz-label">Reliability That Compounds</span>
            <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
              Plug it in once, then forget it.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              Bizak Integrations are versioned, certified, and self-healing. When a vendor changes their API, the connector updates — your recipes and dashboards keep working without a sprint of regression fixes.
            </p>
            <ul className="biz-check-list">
              {[
                { bold: "Idempotent by Default", rest: " — Every payload carries a deterministic key, so duplicate webhooks never double-post." },
                { bold: "Schema-Aware Mapping",  rest: " — Source schema changes surface as warnings before they break the ledger." },
                { bold: "Replay Without Drift",  rest: " — DLQ payloads can be replayed on demand with full transform context preserved." },
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

const STEPS = [
  { icon: "plug",     label: "Connect"  },
  { icon: "key",      label: "Authorize" },
  { icon: "branch",   label: "Map"      },
  { icon: "shuffle",  label: "Test"     },
  { icon: "calendar", label: "Schedule" },
  { icon: "eye",      label: "Monitor"  },
];

function WorkflowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">From Handshake to Heartbeat</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>The end-to-end integration workflow</h2>
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

function CTASection() {
  return (
    <section className="biz-cta-section">
      <div className="biz-cta-glow" />
      <div className="biz-container" style={{ position: "relative", zIndex: 10 }}>
        <h2 className="biz-cta-title">Plug Bizak in. Stop hand-wiring data.</h2>
        <p className="biz-cta-sub">
          Trade brittle CSVs and one-off webhooks for a governed integration layer. Your ERP, every system around it, one source of truth.
        </p>
        <div className="biz-cta-btn-row">
          <button className="biz-shimmer-btn" style={{ fontSize: 17, fontWeight: 700, padding: "16px 44px", borderRadius: 8, boxShadow: "0 0 20px rgba(199,255,53,0.38)" }}>
            Request Demo
          </button>
          <button className="biz-btn-ghost">Browse Connectors</button>
        </div>
      </div>
    </section>
  );
}

export function Integrations() {
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
