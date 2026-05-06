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
    cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    tag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
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
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    truck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect width="9" height="13" x="12" y="4" rx="2" /><circle cx="17.5" cy="17.5" r="2.5" /><circle cx="5.5" cy="17.5" r="2.5" />
      </svg>
    ),
    bar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    repeat: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    alert: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
    funnel: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    "check-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    "credit-card": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="22" height="16" x="1" y="4" rx="2" ry="2" />
        <line x1="1" x2="23" y1="10" y2="10" />
      </svg>
    ),
    smartphone: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <line x1="12" x2="12.01" y1="18" y2="18" />
      </svg>
    ),
    receipt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <path d="M16 8H8M16 12H8M12 16H8" />
      </svg>
    ),
    monitor: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// ─── Channel node (used in Hero) ─────────────────────────────────────────────
function ChannelNode({ label, code, share, active }: { label: string; code: string; share: string; active: boolean }) {
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
        <Icon name={code === "WEB" ? "globe" : code === "MOB" ? "smartphone" : "layers"} size={17} style={{ color: active ? "#7A826D" : "#ccc" }} />
        <div style={{
          position: "absolute", top: -3, right: -3, width: 9, height: 9,
          borderRadius: "50%",
          background: active ? "#C7FF35" : "rgba(122,130,109,0.35)",
          boxShadow: active ? "0 0 5px #C7FF35" : "none",
        }} />
      </div>
      <span style={{ fontSize: 7, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{code}</span>
      <span style={{ fontSize: 7, color: "#bbb", letterSpacing: "0.03em" }}>{label}</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: active ? "#C7FF35" : "#bbb" }}>{share}</span>
    </div>
  );
}

// ─── Hero Section — Retail Command Center ─────────────────────────────────────
function HeroSection() {
  const channels = [
    { code: "WEB",  label: "Storefront",  share: "54%", active: true  },
    { code: "MOB",  label: "Mobile App",  share: "31%", active: true  },
    { code: "MKT",  label: "Marketplace", share: "15%", active: true  },
  ];

  const recentOrders = [
    { id: "#ORD-9841", item: "Leather Bag",     amt: "$129",  status: "paid",       color: "#C7FF35" },
    { id: "#ORD-9842", item: "Sneakers XR-7",   amt: "$89",   status: "processing", color: "#fbbf24" },
    { id: "#ORD-9843", item: "Wireless Buds",   amt: "$64",   status: "shipped",    color: "#60a5fa" },
  ];

  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)", left: "50%" }} />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">

          {/* ── Copy ── */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>Unified Retail & Ecommerce ERP</span>
            <h1 className="biz-h1">
              Sell Everywhere.<br /><span>Fulfil</span> Flawlessly.
            </h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              Connect your storefront, marketplace, inventory, and fulfilment into one intelligent retail command center. Drive conversions, eliminate stockouts, and delight every customer — across every channel.
            </p>
            <div className="biz-hero-cta-row">
              <button className="biz-shimmer-btn biz-shimmer-lg">Request Demo</button>
              <button className="biz-btn-outline">
                See How It Works <Icon name="play" size={16} />
              </button>
            </div>
            <div className="biz-hero-stats">
              <div>
                <div className="biz-stat-value">3.8×</div>
                <div className="biz-stat-label">Faster Fulfilment</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">99.1%</div>
                <div className="biz-stat-label">Inventory Accuracy</div>
              </div>
            </div>
          </div>

          {/* ── Visual: Retail Command Center ── */}
          <div className="biz-hero-visual">
            <div className="biz-vis-glow" />

            {/* ── Main glass panel: live order feed + channel sync ── */}
            <div className="biz-card-main biz-glass biz-float">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(122,130,109,0.65)" }}>
                  Bizak · Retail Hub
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", color: "#7A826D", textTransform: "uppercase" }}>Live</span>
                </div>
              </div>

              {/* Channel nodes with animated sync line */}
              <div style={{ position: "relative", marginBottom: 14 }}>
                <svg style={{ position: "absolute", top: "38%", left: "16%", width: "68%", height: 2, overflow: "visible", pointerEvents: "none" }} viewBox="0 0 300 2">
                  <line x1="0" y1="1" x2="300" y2="1" stroke="rgba(122,130,109,0.12)" strokeWidth="1.5" />
                  {[80, 160, 240].map((x, i) => (
                    <circle key={i} cx={x} cy="1" r="3" fill="#C7FF35" opacity="0.7">
                      <animate attributeName="cx" values={`${x - 80};${x + 80}`} dur={`${1.6 + i * 0.35}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;0.9;0" dur={`${1.6 + i * 0.35}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </svg>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                  {channels.map((ch) => <ChannelNode key={ch.code} {...ch} />)}
                </div>
              </div>

              {/* Recent order rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingTop: 10, borderTop: "1px solid rgba(122,130,109,0.1)" }}>
                {recentOrders.map((o) => (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(122,130,109,0.7)", minWidth: 72 }}>{o.id}</span>
                    <span style={{ fontSize: 8, color: "#aaa", flex: 1 }}>{o.item}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#444" }}>{o.amt}</span>
                    <span style={{
                      fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: o.color === "#C7FF35" ? "rgba(199,255,53,0.12)" : o.color === "#60a5fa" ? "rgba(96,165,250,0.1)" : "rgba(251,191,36,0.1)",
                      color: o.color, textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Dark card: Today's Revenue ── */}
            <div className="biz-card-inventory biz-glass-dark biz-float-d">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(199,255,53,0.15)", color: "#C7FF35" }}>
                  <Icon name="bar" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Today's Revenue</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>$48,320</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>vs. Yesterday</span>
                <span style={{ fontSize: 9, color: "#C7FF35", fontWeight: 700 }}>+18.4%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div className="biz-accent-bar" style={{ width: "72%" }} />
              </div>
            </div>

            {/* ── Light card: Conversion funnel ── */}
            <div className="biz-card-globe biz-glass biz-float-s">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(122,130,109,0.1)", color: "#7A826D" }}>
                  <Icon name="funnel" size={18} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>Conversion Funnel</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[{ label: "Visitors", pct: 100, abs: "12.4k" }, { label: "Add to Cart", pct: 38, abs: "4.7k" }, { label: "Checkout", pct: 19, abs: "2.3k" }, { label: "Purchased", pct: 11, abs: "1.4k" }].map((f) => (
                  <div key={f.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 7, color: "#666" }}>{f.label}</span>
                      <span style={{ fontSize: 7, fontWeight: 700, color: "#555" }}>{f.abs}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(122,130,109,0.10)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${f.pct}%`, background: f.pct === 100 ? "rgba(122,130,109,0.25)" : "#C7FF35", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Circle card: CVR gauge ── */}
            <div className="biz-card-circle biz-glass biz-float">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 12 }}>Conv. Rate</div>
              <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(199,255,53,0.18)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="0" />
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="#C7FF35" strokeWidth="8" strokeDasharray="201" strokeDashoffset="157" />
                </svg>
                <div style={{ position: "absolute", fontSize: 13, fontWeight: 700, color: "#333" }}>11%</div>
              </div>
            </div>

            {[{ top: "38%", left: "52%", delay: "0s" }, { top: "62%", left: "28%", delay: "1.6s" }, { top: "28%", left: "72%", delay: "2.8s" }].map((p, i) => (
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
            Retail is faster than your legacy systems can handle
          </h2>
          <p className="biz-section-intro">
            Fragmented channels, siloed data, and reactive inventory management leave revenue on the table every single day.
          </p>
        </div>

        <div className="biz-bento-grid">

          {/* 1 · Cart Abandonment — funnel drop visualization */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="funnel" size={22} /></div>
            <h3 className="biz-card-title">Cart Abandonment</h3>
            <p className="biz-card-desc">Over 70% of shoppers leave before purchasing. Without behavioral triggers and recovery flows, that revenue never returns.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[{ stage: "Add to Cart", pct: 100, w: "100%" }, { stage: "Begin Checkout", pct: 48, w: "48%" }, { stage: "Payment Info", pct: 29, w: "29%" }, { stage: "Purchased", pct: 11, w: "11%" }].map((f) => (
                  <div key={f.stage} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 7, color: "#888", minWidth: 78 }}>{f.stage}</span>
                    <div style={{ flex: 1, height: 5, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: f.w, background: f.pct < 30 ? "#f87171" : f.pct < 60 ? "#fbbf24" : "rgba(122,130,109,0.45)", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 700, color: f.pct < 30 ? "#f87171" : "#888" }}>{f.pct}%</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171" }} />
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>89% lost at cart</span>
              </div>
            </div>
          </div>

          {/* 2 · Inventory Oversell — stock level bars across channels */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="alert" size={22} /></div>
            <h3 className="biz-card-title">Oversells & Stockouts</h3>
            <p className="biz-card-desc">Selling from separate inventory pools per channel means the same SKU gets oversold online while warehouse stock sits untouched.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { sku: "SKU-2201",  ch: "Web",    stock: 0,   critical: true  },
                  { sku: "SKU-2201",  ch: "Mobile",  stock: 14,  critical: false },
                  { sku: "SKU-2201",  ch: "Mkt.",    stock: 0,   critical: true  },
                ].map((r, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, fontFamily: "monospace", color: "#666" }}>{r.sku} · {r.ch}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: r.critical ? "#f87171" : "#7A826D" }}>{r.stock === 0 ? "OUT ⚠" : `${r.stock} units`}</span>
                    </div>
                    <div style={{ height: 4, background: "#f3f3f3", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: r.critical ? "4%" : "58%", background: r.critical ? "#f87171" : "#7A826D", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>Desync across channels</span>
              </div>
            </div>
          </div>

          {/* 3 · Manual Order Processing — planned vs actual time bars */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="truck" size={22} /></div>
            <h3 className="biz-card-title">Slow Order Fulfilment</h3>
            <p className="biz-card-desc">Manual pick-pack-ship workflows with no routing intelligence mean orders miss SLA windows and customers leave negative reviews.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {[{ label: "SLA Target", pct: 60, color: "rgba(122,130,109,0.4)" }, { label: "Avg. Actual", pct: 94, color: "#f87171" }].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#999", minWidth: 60, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</span>
                    <div style={{ flex: 1, height: 7, background: "#f3f3f3", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(row.pct, 100)}%`, background: row.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: row.color }}>{row.pct}h</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em" }}>+57% SLA Breach Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 · Fragmented Channels — node network diagram */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="layers" size={22} /></div>
            <h3 className="biz-card-title">Fragmented Channels</h3>
            <p className="biz-card-desc">Web store, mobile app, and marketplace running on separate platforms means pricing, promotions, and inventory never align.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 48, gap: 0 }}>
                {["Web", "Mkt", "App"].map((node, i) => (
                  <div key={node} style={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(122,130,109,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 6, height: 6, background: "rgba(122,130,109,0.35)", borderRadius: "50%" }} />
                      </div>
                      <span style={{ fontSize: 7, color: "#aaa" }}>{node}</span>
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 1, background: "rgba(122,130,109,0.1)", margin: "0 4px", marginBottom: 12 }} />}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em" }}>No Unified Truth</span>
              </div>
            </div>
          </div>

          {/* 5 · Returns Chaos — return rate mini bars by category */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="repeat" size={22} /></div>
            <h3 className="biz-card-title">Returns Without Insight</h3>
            <p className="biz-card-desc">Processing returns manually with no root-cause data means the same defect reasons repeat, eroding margins and customer trust.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[{ cat: "Wrong size", rate: 38 }, { cat: "Damaged", rate: 24 }, { cat: "Not as described", rate: 19 }, { cat: "Changed mind", rate: 12 }].map((r) => (
                  <div key={r.cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 8, color: "#888" }}>{r.cat}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: r.rate > 30 ? "#f87171" : "#7A826D" }}>{r.rate}%</span>
                    </div>
                    <div style={{ height: 4, background: "#f3f3f3", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${r.rate * 2.2}%`, background: r.rate > 30 ? "#f87171" : "rgba(122,130,109,0.45)", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6 · No Customer Insight — LTV comparison */}
          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="users" size={22} /></div>
            <h3 className="biz-card-title">Zero Customer Visibility</h3>
            <p className="biz-card-desc">Without unified purchase history and CLV data, every campaign treats loyal customers the same as first-time buyers.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 44 }}>
                {[{ label: "New", h: 28, color: "rgba(122,130,109,0.3)", val: "$42" }, { label: "1× Return", h: 44, color: "rgba(199,255,53,0.45)", val: "$118" }, { label: "Loyal", h: 64, color: "#C7FF35", val: "$310" }].map((b) => (
                  <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 7, fontWeight: 700, color: "#555" }}>{b.val}</span>
                    <div style={{ width: "100%", height: b.h, background: b.color, borderRadius: 4 }} />
                    <span style={{ fontSize: 7, color: "#aaa" }}>{b.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em" }}>CLV by Segment</span>
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
  { icon: "cart",         title: "Omnichannel Order Mgmt",   desc: "Capture, route, and process orders from every channel in one unified queue — web, mobile app, marketplace, and POS." },
  { icon: "layers",       title: "Real-Time Inventory Sync", desc: "One inventory pool across all channels with live reservation, threshold alerts, and automatic reorder point triggers." },
  { icon: "receipt",      title: "POS Billing",              desc: "Touch-screen billing for retail chains and standalone stores. Multi-payment, barcode scan, loyalty redemption, and end-of-day cash reconciliation — all in one terminal." },
  { icon: "tag",          title: "Product Catalog Engine",   desc: "Centrally manage SKUs, variants, pricing rules, and promotions. Publish to all channels with a single update." },
  { icon: "users",        title: "Customer & Loyalty CRM",   desc: "Unified customer profiles with full purchase history, CLV scoring, segmentation, and loyalty point engine built in." },
  { icon: "truck",        title: "Smart Fulfilment Routing",  desc: "Automatically assign orders to the optimal warehouse or store based on stock proximity, carrier SLAs, and cost." },
  { icon: "bar",          title: "Revenue Intelligence",     desc: "Real-time GMV, conversion funnel, margin by SKU, and channel attribution — all in one live analytics layer." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>A complete retail platform for every channel, every customer</h2>
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
            Built for the speed and scale of modern retail.
          </h2>
        </div>

        <div className="biz-caps-grid">

          {/* ── Full-width: Live Order Dashboard ── */}
          <div className="biz-dark-card biz-col-6" style={{ minHeight: 260 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0 }}>
                <div className="biz-mini-stat">1,847</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Orders Today</p>
                <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
                  {[{ val: "$48.3k", lbl: "GMV" }, { val: "11.2%", lbl: "CVR" }].map((s) => (
                    <div key={s.lbl}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 240 }}>
                <h4 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>Live Order Dashboard</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                  Full visibility into every order across every channel — status, fulfilment stage, carrier, and customer — in one unified command screen.
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Order", "Channel", "Total", "Status"].map((h, i) => (
                        <th key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", paddingBottom: 10, textAlign: i > 1 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "#ORD-9841", ch: "Web Store",  amt: "$129",  status: "paid"      },
                      { id: "#ORD-9842", ch: "Mobile App", amt: "$89",   status: "picking"   },
                      { id: "#ORD-9843", ch: "Marketplace",amt: "$64",   status: "shipped"   },
                    ].map((row) => (
                      <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ fontSize: 11, fontFamily: "monospace", color: "#fff", padding: "10px 0" }}>{row.id}</td>
                        <td style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: "10px 0" }}>{row.ch}</td>
                        <td style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", padding: "10px 0", textAlign: "right" }}>{row.amt}</td>
                        <td style={{ padding: "10px 0", textAlign: "right" }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                            background: row.status === "paid" ? "rgba(199,255,53,0.12)" : row.status === "shipped" ? "rgba(96,165,250,0.12)" : "rgba(251,191,36,0.1)",
                            color: row.status === "paid" ? "#C7FF35" : row.status === "shipped" ? "#60a5fa" : "#fbbf24",
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

          {/* ── col-3: Product Catalog ── */}
          <div className="biz-dark-card biz-col-3" style={{ minHeight: 400 }}>
            <div>
              <h3>Product Catalog &amp; Pricing</h3>
              <p>Centralised SKU management with variant support, multi-currency pricing, promotional rules, and channel-specific overrides — all from a single place.</p>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>SKU</span><span>STOCK</span><span>PRICE</span>
              </div>
              {[
                { sku: "BAG-LTH-BLK", stock: "48 units", price: "$129", ok: true  },
                { sku: "SNK-XR7-RED",  stock: "3 units",  price: "$89",  ok: false },
                { sku: "WRL-BUD-WHT",  stock: "120 units",price: "$64",  ok: true  },
              ].map((r) => (
                <div key={r.sku} className="biz-mono-row">
                  <span>{r.sku}</span><span style={{ color: r.ok ? "#4ade80" : "#fbbf24" }}>{r.stock}</span><span>{r.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── col-3: Customer 360 ── */}
          <div className="biz-dark-card biz-col-3" style={{ minHeight: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Customer 360</h3>
                <p>Unified profiles with lifetime purchase history, CLV score, loyalty tier, and segmentation tags — enabling personalised campaigns and retention flows.</p>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                <Icon name="users" size={24} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["$310", "Avg CLV"], ["4.2×", "Repeat Rate"], ["94%", "Satisfaction"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Full-width: POS Billing ── */}
          <div className="biz-dark-card biz-col-6 biz-neon-border" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>

              {/* Left: copy + feature bullets */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(199,255,53,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                    <Icon name="monitor" size={26} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Point of Sale</div>
                    <h4 style={{ fontWeight: 700, fontSize: 20, color: "#fff", margin: 0 }}>POS Billing</h4>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.7, marginBottom: 24 }}>
                  A beautiful, fast billing terminal built for retail chains and standalone stores. Scan, bill, and close a sale in seconds — with every transaction feeding directly into inventory, accounts, and customer profiles.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { icon: "receipt",      text: "Itemised billing with barcode & QR scan — zero manual entry" },
                    { icon: "credit-card",  text: "Cash, card, UPI, wallet, split-pay & loyalty point redemption" },
                    { icon: "users",        text: "Customer lookup, loyalty earn/burn, and purchase history at checkout" },
                    { icon: "bar",          text: "End-of-day cash reconciliation, shift reports, and variance alerts" },
                  ].map((f) => (
                    <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(199,255,53,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0, marginTop: 1 }}>
                        <Icon name={f.icon} size={14} />
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: POS terminal mockup */}
              <div style={{ flexShrink: 0, width: 260 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
                  {/* Terminal header */}
                  <div style={{ background: "rgba(199,255,53,0.08)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#C7FF35", letterSpacing: "0.12em", textTransform: "uppercase" }}>Bizak POS</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Terminal 01</span>
                    </div>
                  </div>
                  {/* Bill line items */}
                  <div style={{ padding: "12px 16px" }}>
                    {[
                      { item: "Leather Bag",    qty: "×1", amt: "$129.00" },
                      { item: "Sneakers XR-7",  qty: "×2", amt: "$178.00" },
                      { item: "Wireless Buds",  qty: "×1", amt: "$64.00"  },
                    ].map((r) => (
                      <div key={r.item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{r.item}</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{r.qty}</div>
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{r.amt}</span>
                      </div>
                    ))}
                    {/* Subtotals */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Subtotal</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>$371.00</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Tax (13%)</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>$48.23</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(199,255,53,0.2)", marginTop: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Total</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#C7FF35" }}>$419.23</span>
                      </div>
                    </div>
                    {/* Payment method buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 14 }}>
                      {["Cash", "Card", "UPI", "Split"].map((m, i) => (
                        <div key={m} style={{
                          padding: "7px 0", borderRadius: 7, textAlign: "center",
                          background: i === 1 ? "#C7FF35" : "rgba(255,255,255,0.06)",
                          border: i === 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
                          fontSize: 10, fontWeight: 700,
                          color: i === 1 ? "#1A1D19" : "rgba(255,255,255,0.5)",
                          cursor: "pointer",
                        }}>{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Stat badges below terminal */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {[{ val: "342", lbl: "Txns today" }, { val: "$89", lbl: "Avg basket" }].map((s) => (
                    <div key={s.lbl} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── col-2: Omnichannel Sync (neon) ── */}
          <div className="biz-dark-card biz-col-2 biz-neon-border" style={{ minHeight: 240, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 22 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>Real-Time</span>
            </div>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="globe" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Omnichannel Sync</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Inventory, pricing, and promotions propagate to all channels the instant you make a change — zero lag, zero divergence.
            </p>
          </div>

          {/* ── col-2: Smart Fulfilment ── */}
          <div className="biz-dark-card biz-col-2" style={{ minHeight: 240 }}>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="zap" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Smart Fulfilment</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Auto-route each order to the closest stocked location with optimal carrier selection and cost-vs-speed trade-off engine.
            </p>
          </div>

          {/* ── col-2: Returns Automation ── */}
          <div className="biz-dark-card biz-col-2" style={{ minHeight: 240, justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="repeat" size={34} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Returns Automation</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                One-click return portal, automated restocking workflows, refund processing, and return reason analytics built in.
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "88%", background: "#C7FF35" }} />
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>88% auto-resolved</div>
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

          {/* ── Text LEFT ── */}
          <div>
            <span className="biz-label">Revenue Intelligence</span>
            <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
              Know what's selling, what's stalling, and why.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              Stop guessing from weekly exports. Bizak surfaces live GMV trends, channel attribution, margin by SKU, and conversion drivers so you can act within minutes, not days.
            </p>
            <ul className="biz-check-list">
              {[
                { bold: "Channel Attribution",    rest: " — See exactly which channel drove each sale and its true margin." },
                { bold: "Conversion Funnel",      rest: " — Pinpoint drop-off stages and trigger automated recovery flows." },
                { bold: "SKU-Level Profitability",rest: " — Live landed cost vs. selling price with return adjustments." },
              ].map((item) => (
                <li key={item.bold} className="biz-check-item">
                  <span className="biz-check-icon"><Icon name="check-circle" size={20} /></span>
                  <span><strong>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Chart RIGHT ── */}
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
                      <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* GMV trend line */}
                    <path d="M0 170 C 40 155, 80 140, 120 118 S 200 90, 240 72 S 320 48, 400 32" stroke="#7A826D" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0 170 C 40 155, 80 140, 120 118 S 200 90, 240 72 S 320 48, 400 32 V 200 H 0 Z" fill="url(#retailGrad)" />
                    {/* Orders dashed line */}
                    <path d="M0 148 C 50 142, 100 155, 160 130 S 250 105, 310 98 S 370 75, 400 68" stroke="rgba(122,130,109,0.38)" strokeWidth="2" strokeDasharray="6 4" />
                    {/* Highlight point */}
                    <circle cx="240" cy="72" r="5" fill="#C7FF35" stroke="#7A826D" strokeWidth="2" />
                    {/* Spike annotation */}
                    <line x1="240" y1="72" x2="240" y2="40" stroke="rgba(199,255,53,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="245" y="38" fontSize="8" fill="#7A826D">Flash Sale</text>
                  </svg>
                  <div className="biz-tooltip">
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>GMV: $48,320 ↑</div>
                    <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>+18.4% vs yesterday</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -40, right: -40, width: 180, height: 180, background: "rgba(199,255,53,0.04)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Workflow Section ─────────────────────────────────────────────────────────
const STEPS = [
  { icon: "search",       label: "Browse"   },
  { icon: "cart",         label: "Cart"     },
  { icon: "credit-card",  label: "Checkout" },
  { icon: "zap",          label: "Fulfil"   },
  { icon: "truck",        label: "Deliver"  },
  { icon: "star",         label: "Review"   },
];

function WorkflowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">Order Lifecycle</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>From First Click to Five-Star Review</h2>
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
        <h2 className="biz-cta-title">Sell smarter across every channel.</h2>
        <p className="biz-cta-sub">
          Unify your retail operations with Bizak and turn every touchpoint into a seamless, profitable customer experience.
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
export function RetailAndEcommercePage() {
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
