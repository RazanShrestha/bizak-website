import React from "react";
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
    building: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" /><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
      </svg>
    ),
    buildings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v8h4" /><path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
        <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
      </svg>
    ),
    coins: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    "check-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    scale: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    ),
    consolidate: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M4 4h6v6H4z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h16v6H4z" />
        <path d="M7 10v2" /><path d="M17 10v2" />
      </svg>
    ),
    fragment: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
      </svg>
    ),
    spreadsheet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    flag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
      </svg>
    ),
    locked: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    pin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    handshake: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m11 17 2 2a1 1 0 0 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5 5 0 0 1 7.06 0l2.69 2.69a1 1 0 1 0 3-3l-1.5-1.5" />
        <path d="m18 13 1.32 1.32a1 1 0 1 0 3-3L17 6" /><path d="M2 12 7 7l3.88 3.88a3 3 0 0 1 0 4.24l-2.13 2.13" />
      </svg>
    ),
    tax: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="9" x2="15" y1="13" y2="17" /><circle cx="9.5" cy="13.5" r="1" /><circle cx="14.5" cy="16.5" r="1" />
      </svg>
    ),
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
    sync: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      </svg>
    ),
    "user-shield": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    map: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
        <line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" />
      </svg>
    ),
    branch: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    ),
    list: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" />
        <line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

const ENTITIES = [
  { code: "US", name: "Bizak US Inc.",        x: 22,  y: 24,  curr: "USD", live: true  },
  { code: "UK", name: "Bizak Europe Ltd.",    x: 132, y: 14,  curr: "GBP", live: true  },
  { code: "DE", name: "Bizak GmbH",           x: 240, y: 22,  curr: "EUR", live: true  },
  { code: "AE", name: "Bizak MEA FZ-LLC",     x: 22,  y: 124, curr: "AED", live: true  },
  { code: "SG", name: "Bizak APAC Pte.",      x: 132, y: 138, curr: "SGD", live: true  },
  { code: "AU", name: "Bizak Pacific Pty.",   x: 240, y: 124, curr: "AUD", live: false },
];

function HeroSection() {
  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)", left: "50%" }} />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>Multi-company &amp; Branches</span>
            <h1 className="biz-h1">
              One ERP. Many entities. <br /><span>Zero spreadsheet rollups.</span>
            </h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              Bizak runs every legal entity, branch, and warehouse on a single instance — with their own currency, chart of accounts, and tax rules — then consolidates the whole group on demand. No exports. No month-end fire drills.
            </p>
            <div className="biz-hero-cta-row">
              <button className="biz-shimmer-btn biz-shimmer-lg">Request Demo</button>
              <button className="biz-btn-outline">
                See Group Console <Icon name="play" size={16} />
              </button>
            </div>
            <div className="biz-hero-stats">
              <div>
                <div className="biz-stat-value">120+</div>
                <div className="biz-stat-label">Entities Supported</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">38</div>
                <div className="biz-stat-label">Local Tax Engines</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">&lt; 90s</div>
                <div className="biz-stat-label">Group Close</div>
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
                  Bizak · Group Console
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", color: "#7A826D", textTransform: "uppercase" }}>Consolidating</span>
                </div>
              </div>

              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <svg viewBox="0 0 290 160" style={{ width: "100%", height: "100%" }} fill="none">
                  <defs>
                    <radialGradient id="groupGlow" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="145" cy="80" r="50" fill="url(#groupGlow)" />
                  {ENTITIES.map((e) => {
                    const cx1 = e.x + 24;
                    const cy1 = e.y + 12;
                    return (
                      <g key={e.code}>
                        <line x1="145" y1="80" x2={cx1} y2={cy1} stroke="rgba(122,130,109,0.16)" strokeWidth="1" />
                        <line x1={cx1} y1={cy1} x2="145" y2="80"
                              className="biz-flow" stroke="#C7FF35" strokeWidth="1.4"
                              strokeDasharray="3 7" strokeLinecap="round" opacity={e.live ? 0.9 : 0.35} />
                      </g>
                    );
                  })}
                  <rect x="118" y="62" width="54" height="36" rx="6"
                        fill="rgba(199,255,53,0.18)" stroke="#C7FF35" strokeWidth="1.4" />
                  <text x="145" y="78" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7A826D" letterSpacing="0.4">GROUP</text>
                  <text x="145" y="92" textAnchor="middle" fontSize="10" fontWeight="800" fill="#333">$48.2M</text>
                  {ENTITIES.map((e) => (
                    <g key={e.code}>
                      <rect x={e.x} y={e.y} width="48" height="24" rx="5"
                            fill="rgba(255,255,255,0.88)" stroke="rgba(122,130,109,0.25)" strokeWidth="1" />
                      <text x={e.x + 11} y={e.y + 16} textAnchor="middle" fontSize="9" fontWeight="800" fill="#333" letterSpacing="0.5">{e.code}</text>
                      <line x1={e.x + 22} y1={e.y + 5} x2={e.x + 22} y2={e.y + 19} stroke="rgba(122,130,109,0.2)" strokeWidth="0.8" />
                      <text x={e.x + 36} y={e.y + 16} textAnchor="middle" fontSize="7" fontWeight="700" fill="#7A826D">{e.curr}</text>
                      <circle cx={e.x + 43} cy={e.y + 5} r="2.2" fill={e.live ? "#16a34a" : "rgba(122,130,109,0.4)"} />
                    </g>
                  ))}
                </svg>
              </div>

              <div style={{ borderTop: "1px solid rgba(122,130,109,0.1)", paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Intercompany Postings</span>
                  <span style={{ fontSize: 7, fontWeight: 700, color: "#16a34a" }}>14 today · auto</span>
                </div>
                {[
                  { code: "IC-2412", from: "US", to: "DE", amt: "$ 24,800", ago: "1m"  },
                  { code: "IC-2411", from: "UK", to: "AE", amt: "£ 12,400", ago: "6m"  },
                  { code: "IC-2410", from: "SG", to: "AU", amt: "S$ 18,900", ago: "14m" },
                ].map((e) => (
                  <div key={e.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 8, padding: "2px 0" }}>
                    <span style={{ color: "#555", fontFamily: "monospace", fontWeight: 700 }}>{e.code}</span>
                    <span style={{ color: "#7A826D" }}>{e.from} → {e.to}</span>
                    <span style={{ color: "#333", fontWeight: 700 }}>{e.amt}</span>
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>{e.ago}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="biz-card-inventory biz-glass-dark biz-float-d">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(199,255,53,0.15)", color: "#C7FF35" }}>
                  <Icon name="coins" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>FX Snapshot</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>6 Currencies</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { lbl: "GBP → USD", rate: "1.2614", up: true,  delta: "+0.18%" },
                  { lbl: "EUR → USD", rate: "1.0842", up: true,  delta: "+0.07%" },
                  { lbl: "AED → USD", rate: "0.2723", up: false, delta: "−0.01%" },
                ].map((r) => (
                  <div key={r.lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{r.lbl}</span>
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{r.rate}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: r.up ? "#C7FF35" : "#f87171" }}>{r.delta}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="biz-card-globe biz-glass biz-float-s">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(122,130,109,0.1)", color: "#7A826D" }}>
                  <Icon name="chart" size={18} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Revenue · By Entity</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 28, marginBottom: 6 }}>
                {[
                  { e: "US", h: 92, c: "#C7FF35" },
                  { e: "UK", h: 68, c: "rgba(199,255,53,0.7)" },
                  { e: "DE", h: 56, c: "rgba(199,255,53,0.55)" },
                  { e: "AE", h: 38, c: "rgba(122,130,109,0.55)" },
                  { e: "SG", h: 50, c: "rgba(122,130,109,0.4)" },
                  { e: "AU", h: 22, c: "rgba(122,130,109,0.3)" },
                ].map((r) => (
                  <div key={r.e} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", height: `${r.h}%`, background: r.c, borderRadius: 1.5 }} />
                    <span style={{ fontSize: 6, fontWeight: 700, color: "#888" }}>{r.e}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: "#888" }}>QTD · Group</span>
                <span style={{ fontSize: 9, color: "#7A826D", fontWeight: 700 }}>$48.2M</span>
              </div>
            </div>

            <div className="biz-card-circle biz-glass biz-float">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 12 }}>Close · Day 2</div>
              <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(199,255,53,0.18)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="0" />
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="#C7FF35" strokeWidth="8" strokeDasharray="201" strokeDashoffset="32" />
                </svg>
                <div style={{ position: "absolute", fontSize: 12, fontWeight: 700, color: "#333" }}>5 / 6</div>
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
          <span className="biz-label">The Group Tax</span>
          <h2 className="biz-h2" style={{ marginTop: 16, maxWidth: 720 }}>
            Six entities, six general ledgers — and one CFO running the rollup in Excel.
          </h2>
          <p className="biz-section-intro">
            Most ERPs were built for a single legal entity. Add a branch, an acquisition, or a foreign subsidiary, and the architecture starts to leak — through CSV exports, manual elimination journals, and a month-end that always arrives a week late.
          </p>
        </div>

        <div className="biz-bento-grid">

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="fragment" size={22} /></div>
            <h3 className="biz-card-title">Siloed Instances</h3>
            <p className="biz-card-desc">Every entity runs its own ERP, its own login, its own master data. Customers, items, and vendors get duplicated across the group with no shared truth.</p>
            <div className="biz-card-footer">
              <div style={{ position: "relative", height: 56 }}>
                {[
                  { x: "8%",  y: "10%", l: "US" },
                  { x: "44%", y: "5%",  l: "UK" },
                  { x: "80%", y: "15%", l: "DE" },
                  { x: "4%",  y: "62%", l: "AE" },
                  { x: "42%", y: "70%", l: "SG" },
                  { x: "78%", y: "58%", l: "AU" },
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
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>6 ERPs · 0 shared masters</span>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="spreadsheet" size={22} /></div>
            <h3 className="biz-card-title">Excel-Bound Consolidation</h3>
            <p className="biz-card-desc">Every quarter, the group controller pulls trial balances from each subsidiary, hand-translates the FX, and stitches them in a workbook nobody else can edit safely.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { task: "Pull TBs",       h: "1.5d", w: 36 },
                  { task: "FX translate",   h: "2.0d", w: 56 },
                  { task: "Eliminate IC",   h: "3.5d", w: 88 },
                  { task: "Build pack",     h: "1.0d", w: 24 },
                ].map((t) => (
                  <div key={t.task} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 8, color: "#666", minWidth: 80 }}>{t.task}</span>
                    <div style={{ flex: 1, height: 6, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${t.w}%`, background: "rgba(248,113,113,0.55)", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", minWidth: 28, textAlign: "right" }}>{t.h}</span>
                  </div>
                ))}
                <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>≈ 8 days · every close</span>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="handshake" size={22} /></div>
            <h3 className="biz-card-title">Manual Intercompany</h3>
            <p className="biz-card-desc">Sister entities transact with each other constantly — yet every IC invoice is keyed twice, reconciled by hand, and almost always out of balance at period end.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 8, color: "#888", minWidth: 56 }}>DIY stack</span>
                  <div style={{ flex: 1, display: "flex", gap: 1.5, height: 12 }}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} style={{
                        flex: 1, borderRadius: 1,
                        background: [2, 5, 9, 13, 16, 20, 22].includes(i) ? "rgba(248,113,113,0.7)" : "rgba(122,130,109,0.12)",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171" }}>7 unbal.</span>
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
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D" }}>0 unbal.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="tax" size={22} /></div>
            <h3 className="biz-card-title">Local-Tax Patchwork</h3>
            <p className="biz-card-desc">UK VAT, EU OSS, GCC VAT, US sales tax — each entity needs the local rules, but a single-CoA system forces compromises that fail the auditor.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { reg: "US · State Tax",     status: "patched",  bad: true  },
                  { reg: "UK · MTD VAT",       status: "external",  bad: true  },
                  { reg: "EU · OSS / IOSS",    status: "manual",    bad: true  },
                  { reg: "GCC · VAT 5%",       status: "skipped",   bad: true  },
                ].map((r) => (
                  <div key={r.reg} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, color: "#666", fontFamily: "monospace", fontWeight: 600 }}>{r.reg}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 700,
                      padding: "2px 7px", borderRadius: 4,
                      background: r.bad ? "rgba(248,113,113,0.12)" : "rgba(199,255,53,0.18)",
                      color: r.bad ? "#f87171" : "#7A826D",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="coins" size={22} /></div>
            <h3 className="biz-card-title">FX Drift &amp; Translation Loss</h3>
            <p className="biz-card-desc">Exchange rates set in spreadsheets at month-end produce reported margins that don&apos;t reconcile. Every revision sends a ripple through the group pack.</p>
            <div className="biz-card-footer">
              <div style={{ position: "relative", height: 50 }}>
                <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 200 50" preserveAspectRatio="none" fill="none">
                  <path d="M0 25 L40 24 L80 26 L120 23 L160 27 L200 25" stroke="#7A826D" strokeWidth="1.6" />
                  <path d="M0 25 L40 28 L80 33 L120 30 L160 39 L200 44" stroke="#f87171" strokeWidth="1.6" strokeDasharray="3 3" />
                  <line x1="0" y1="25" x2="200" y2="25" stroke="rgba(122,130,109,0.1)" strokeWidth="0.5" />
                </svg>
                <div style={{ position: "absolute", top: -2, right: 0, fontSize: 8, fontWeight: 700, color: "#7A826D" }}>Live FX · functional</div>
                <div style={{ position: "absolute", bottom: -2, right: 0, fontSize: 8, fontWeight: 700, color: "#f87171" }}>Stale FX · group (drift)</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>Δ $112k translation loss</span>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="locked" size={22} /></div>
            <h3 className="biz-card-title">Permission Sprawl</h3>
            <p className="biz-card-desc">Branch managers need to see their own P&amp;L — not the group&apos;s. A one-tenant ERP forces blunt access rules that leak data or block real work.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { lbl: "Branch admin",  scope: "sees all entities", bad: true  },
                  { lbl: "Country lead",  scope: "global writes",     bad: true  },
                  { lbl: "Auditor",       scope: "ad-hoc DB pulls",   bad: true  },
                  { lbl: "Bizak",         scope: "scoped per entity", bad: false },
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
  { icon: "buildings",   title: "Unlimited Legal Entities",     desc: "Spin up a new company, branch, or warehouse in minutes. Each gets its own currency, calendar, and chart of accounts — but shares masters and policies with the group." },
  { icon: "consolidate", title: "One-Click Consolidation",       desc: "Roll up trial balances across every entity with automatic FX translation, IC eliminations, and minority-interest splits. Refresh the group pack on demand." },
  { icon: "handshake",   title: "Auto Intercompany",             desc: "When entity A invoices entity B, the matching AR/AP entries post in both ledgers, in both currencies, with a shared IC reference — and reconcile themselves." },
  { icon: "tax",         title: "Local-Tax Engine per Entity",   desc: "VAT, GST, sales tax, withholding — every entity follows its country's rules out of the box. Filings, e-invoicing, and reverse charges are pre-wired." },
  { icon: "user-shield", title: "Entity-Scoped Permissions",     desc: "Roles and data scopes are aware of the entity tree. A branch manager sees only their branch; a CFO sees the group — without copying data anywhere." },
  { icon: "dashboard",   title: "Group + Entity Dashboards",     desc: "Switch between the group lens and any single entity in one click. Same data, same KPIs — different scopes, all in real time." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>Run every entity as itself — manage them as one group</h2>
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
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">Capabilities</span>
          <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
            Multi-entity architecture, baked into the core not bolted on top.
          </h2>
        </div>

        <div className="biz-caps-grid">

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div>
              <h3>Entity Tree &amp; Org Map</h3>
              <p>Model holding companies, subsidiaries, branches, and cost centres as a real tree. Roll up at any level — group, region, country, or business unit.</p>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>NODE</span><span>·</span><span>SCOPE</span>
              </div>
              {[
                { src: "Bizak Holdings",   tgt: "Group",     ind: 0 },
                { src: "Americas",         tgt: "Region",    ind: 1 },
                { src: "Bizak US Inc.",    tgt: "Entity",    ind: 2 },
                { src: "  ↳ Boston Branch",tgt: "Branch",    ind: 3 },
                { src: "  ↳ Austin WH",    tgt: "Warehouse", ind: 3 },
                { src: "EMEA",             tgt: "Region",    ind: 1 },
                { src: "Bizak GmbH",       tgt: "Entity",    ind: 2 },
              ].map((r, i) => (
                <div key={i} className="biz-mono-row">
                  <span style={{ color: "rgba(255,255,255,0.55)", paddingLeft: r.ind * 8 }}>{r.src}</span>
                  <span style={{ color: "#C7FF35" }}>·</span>
                  <span style={{ color: "#4ade80" }}>{r.tgt}</span>
                </div>
              ))}
            </div>
          </div>

 <div className="biz-dark-card biz-col-3" style={{ minHeight: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Auto Intercompany</h3>
                <p>Sell from one entity to another and Bizak posts both sides — AR in the seller, AP in the buyer — with matched references, FX, and elimination tags ready for close.</p>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                <Icon name="handshake" size={24} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["Auto", "Mirror Posting"], ["Live", "FX Reval"], ["1-click", "IC Match"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-dark-card biz-col-6" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0 }}>
                <div className="biz-mini-stat">120+</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Entities · Single Tenant</p>
                <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
                  {[{ val: "38", lbl: "Tax Engines" }, { val: "< 90s", lbl: "Group Close" }].map((s) => (
                    <div key={s.lbl}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 280 }}>
                <h4 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>The Group Console</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                  Switch from group view to any subsidiary in one click. Every entity carries its own books — and rolls up live to the parent without an export.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { abbr: "US", cat: "USD" },
                    { abbr: "UK", cat: "GBP" },
                    { abbr: "DE", cat: "EUR" },
                    { abbr: "FR", cat: "EUR" },
                    { abbr: "AE", cat: "AED" },
                    { abbr: "SG", cat: "SGD" },
                    { abbr: "AU", cat: "AUD" },
                    { abbr: "CA", cat: "CAD" },
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

         

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260 }}>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="tax" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Local Tax Engines</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Pre-configured rules for VAT, GST, sales tax, and withholding across 38 countries. E-invoicing, OSS/IOSS, and reverse-charge logic built in.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2 biz-neon-border" style={{ minHeight: 260, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 22 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>Closing</span>
            </div>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="consolidate" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Live Consolidation</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Group P&amp;L and balance sheet refresh on demand. FX translation, eliminations, and minority interest run in under 90 seconds.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 260, justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="user-shield" size={34} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Entity-Aware Roles</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                Permissions scope to any node of the entity tree. Branch managers see their branch, regional VPs see the region, the group CFO sees everything.
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["Group", "Region", "Entity", "Branch"].map((b) => (
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
  const entities = [
    { lbl: "Bizak US Inc.",       v: 88, color: "#C7FF35",                  rev: "$ 18.4M" },
    { lbl: "Bizak Europe Ltd.",   v: 64, color: "rgba(199,255,53,0.65)",    rev: "£ 9.6M"  },
    { lbl: "Bizak GmbH",          v: 52, color: "rgba(199,255,53,0.45)",    rev: "€ 7.8M"  },
    { lbl: "Bizak APAC Pte.",     v: 46, color: "rgba(122,130,109,0.55)",   rev: "S$ 11.2M"},
    { lbl: "Bizak MEA FZ-LLC",    v: 30, color: "rgba(122,130,109,0.4)",    rev: "AED 6.8M"},
  ];
  return (
    <section className="biz-section" style={{ background: "#fff" }}>
      <div className="biz-container">
        <div className="biz-insights-grid">

          <div>
            <span className="biz-label">Group Visibility</span>
            <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
              The whole group, on one screen — without leaving the ledger.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              No exports. No nightly batches. Bizak holds every entity in one tenant, so a group-level dashboard is just another scope on the same data your subsidiaries are posting into right now.
            </p>
            <ul className="biz-check-list">
              {[
                { bold: "Functional + Reporting Currency", rest: " — Each entity transacts in its functional currency; the group sees translated values live, with daily, monthly, or custom rate sets." },
                { bold: "Eliminations on the Fly",          rest: " — Intercompany invoices, loans, and inventory transfers eliminate automatically when you switch to group view." },
                { bold: "Drill from Group to Voucher",      rest: " — Click a group P&L line, drop into the entity, the journal, then the source document — without a different tool." },
              ].map((item) => (
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
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Revenue · Group QTD</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginTop: 4 }}>$48.2M <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>+12.4%</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", padding: "3px 8px", background: "rgba(22,163,74,0.1)", borderRadius: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>● Live</span>
                  </div>
                </div>

                <div style={{ height: 240, background: "#fff", borderRadius: 8, border: "1px solid rgba(232,234,228,0.5)", padding: "20px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", justifyContent: "center" }}>
                    {entities.map((l) => (
                      <div key={l.lbl} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 9, color: "#666", minWidth: 120, fontWeight: 600 }}>{l.lbl}</span>
                        <div style={{ flex: 1, height: 16, background: "rgba(122,130,109,0.06)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                          <div style={{ height: "100%", width: `${l.v}%`, background: l.color, borderRadius: 4 }} />
                          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, transparent 0%, transparent 50%, rgba(255,255,255,0.4) 50%, transparent 60%)", backgroundSize: "20px 100%" }} />
                        </div>
                        <span style={{ fontSize: 9, color: "#7A826D", fontWeight: 700, minWidth: 56, textAlign: "right", fontFamily: "monospace" }}>{l.rev}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    position: "absolute", top: 10, right: 14,
                    background: "#fff", border: "1px solid var(--biz-sage-soft)",
                    borderRadius: 6, padding: "8px 12px", fontSize: 10,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>IC eliminations · $4.1M</div>
                    <div style={{ fontSize: 9, color: "#16a34a", fontWeight: 700, marginTop: 2 }}>● auto-matched</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, background: "rgba(199,255,53,0.06)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          </div>

        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: "buildings", label: "Define Entity" },
  { icon: "globe",     label: "Set Currency"  },
  { icon: "tax",       label: "Wire Tax"      },
  { icon: "layers",    label: "Map Books"     },
  { icon: "user-shield", label: "Scope Access" },
  { icon: "consolidate", label: "Roll Up"     },
];

function WorkflowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">From New Entity to Group Close</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>Stand up a subsidiary in an afternoon</h2>
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
        <h2 className="biz-cta-title">Run the whole group on one ERP.</h2>
        <p className="biz-cta-sub">
          Stop stitching subsidiaries together in spreadsheets. Bizak gives every entity its own books — and your group a real-time consolidation, every day of the month.
        </p>
        <div className="biz-cta-btn-row">
          <button className="biz-shimmer-btn" style={{ fontSize: 17, fontWeight: 700, padding: "16px 44px", borderRadius: 8, boxShadow: "0 0 20px rgba(199,255,53,0.38)" }}>
            Request Demo
          </button>
          <button className="biz-btn-ghost">Tour the Group Console</button>
        </div>
      </div>
    </section>
  );
}

export function MulticompanyAndBranchesPage() {
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
