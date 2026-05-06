import type { CSSProperties, ReactNode } from "react";
import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

const C = {
  deep: "#1A1D19",
  dark: "#0a0a0a",
  cardDark: "#161916",
  accent: "#C7FF35",
  white: "#ffffff",
  fcfcfc: "#fcfcfc",
  f9: "#f9f9f9",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray800: "#1f2937",
  border: "#e5e7eb",
  borderDark: "rgba(255,255,255,0.08)",
};

function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  const icons: Record<string, ReactNode> = {
    terminal: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
    card: <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>,
    cashier: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
    bag: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></>,
    offline: <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01M2 2l20 20" />,
    chart: <path d="M18 20V10M12 20V4M6 20v-6" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    sync: <><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0115-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 01-15 6.7L3 16" /></>,
    printer: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    hub: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></>,
    inventory: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    finance: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    crm: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.96 12 19.79 19.79 0 01.9 3.38 2 2 0 012.88 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trend: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    store: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  };
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
      {icons[name]}
    </svg>
  );
}

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{
      background: C.deep,
      padding: "96px 24px 80px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(199,255,53,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: -160, right: -160,
        width: 560, height: 560,
        background: "radial-gradient(circle, rgba(199,255,53,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="biz-hero-grid">

          {/* LEFT */}
          <div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px",
              background: "rgba(199,255,53,0.08)",
              border: "1px solid rgba(199,255,53,0.25)",
              borderRadius: 999,
              fontSize: 10, fontWeight: 700,
              letterSpacing: "1.6px", textTransform: "uppercase",
              color: C.accent, marginBottom: 28,
            }}>
              <span
                style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "block", flexShrink: 0 }}
                className="biz-pulse-glow"
              />
              POS Module
            </span>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: 800, color: C.white,
              lineHeight: 1.1, letterSpacing: "-0.03em",
              marginBottom: 24,
            }}>
              Ring up sales.<br />
              Close shifts.<br />
              <span style={{ color: C.accent }}>Stay in control.</span>
            </h1>

            <p style={{
              fontSize: 17, color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7, maxWidth: 460, marginBottom: 36,
            }}>
              A full-featured point of sale built for speed. Process any payment, track every item, and sync with your entire business in real time.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
              <a href="/contact" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.accent, color: C.deep,
                padding: "14px 28px", borderRadius: 10,
                fontWeight: 700, fontSize: 14,
                textDecoration: "none",
                boxShadow: "0 0 24px rgba(199,255,53,0.25)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 32px rgba(199,255,53,0.35)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "0 0 24px rgba(199,255,53,0.25)"; }}
              >
                Request Demo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
              </a>
              <a href="#features" style={{
                display: "inline-flex", alignItems: "center",
                background: "transparent", color: C.white,
                padding: "14px 28px", borderRadius: 10,
                fontWeight: 600, fontSize: 14,
                textDecoration: "none",
                border: `1px solid ${C.borderDark}`,
                transition: "border-color 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.borderDark; }}
              >
                View Features
              </a>
            </div>

            <div style={{ display: "flex", gap: 32, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { val: "< 3s", lbl: "Avg. Checkout" },
                { val: "99.9%", lbl: "Uptime SLA" },
                { val: "12+", lbl: "Payment Methods" },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 4 }}>{s.val}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>{s.lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — POS Terminal Mockup */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: "100%", maxWidth: 420,
              background: "#0e110e",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 80px rgba(199,255,53,0.08), 0 40px 80px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}>
              {/* Traffic-light titlebar */}
              <div style={{
                padding: "12px 20px",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
                <span style={{ marginLeft: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                  Register #1 — Morning Shift
                </span>
              </div>

              <div style={{ padding: "20px 24px" }}>
                {/* Column headers */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>Item</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>Total</span>
                </div>

                {/* Line items */}
                {[
                  { name: "Espresso Double", qty: "× 2", price: "$7.60", accent: false },
                  { name: "Almond Croissant", qty: "× 1", price: "$4.20", accent: false },
                  { name: "Sparkling Water",  qty: "× 3", price: "$8.10", accent: false },
                  { name: "Loyalty Discount", qty: "",    price: "−$2.00", accent: true  },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0",
                    borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: item.accent ? C.accent : C.white }}>{item.name}</p>
                      {item.qty && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{item.qty}</p>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.accent ? C.accent : C.white }}>{item.price}</span>
                  </div>
                ))}

                {/* Totals */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  {[
                    { label: "Subtotal", value: "$17.90" },
                    { label: "Tax (13%)", value: "$2.33" },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{r.label}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.white }}>Total</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: C.accent }}>$20.23</span>
                  </div>
                </div>

                {/* Payment method selector */}
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Cash",   icon: "finance", active: false },
                    { label: "Card",   icon: "card",    active: true  },
                    { label: "QR Pay", icon: "phone",   active: false },
                    { label: "Split",  icon: "zap",     active: false },
                  ].map(m => (
                    <div key={m.label} style={{
                      padding: "10px 8px",
                      background: m.active ? "rgba(199,255,53,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${m.active ? "rgba(199,255,53,0.35)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 8, textAlign: "center",
                    }}>
                      <div style={{ color: m.active ? C.accent : "rgba(255,255,255,0.38)", display: "flex", justifyContent: "center", marginBottom: 4 }}>
                        <Icon name={m.icon} size={14} />
                      </div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: m.active ? C.accent : "rgba(255,255,255,0.38)" }}>{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Status pill */}
                <div style={{
                  marginTop: 14,
                  padding: "11px",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.28)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} className="biz-pulse-glow" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "1.5px", textTransform: "uppercase" }}>Transaction Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. FEATURE GRID ─────────────────────────────────────────────────────────
const posFeatures = [
  {
    icon: "zap",
    title: "Lightning Checkout",
    desc: "Sub-3-second transaction processing keeps queues short and customers happy at peak hours.",
  },
  {
    icon: "card",
    title: "Multi-Payment Support",
    desc: "Accept cash, card, QR, mobile wallets, and split payments — all from a single interface.",
  },
  {
    icon: "receipt",
    title: "Smart Receipts",
    desc: "Print or email branded receipts instantly. Customize layouts, add promotions, and embed QR codes.",
  },
  {
    icon: "clock",
    title: "Shift Management",
    desc: "Open and close cash drawers with automated float counting, cashier-level reports, and variance alerts.",
  },
  {
    icon: "offline",
    title: "Full Offline Mode",
    desc: "Keep selling when the internet drops. Transactions sync automatically once connectivity is restored.",
  },
  {
    icon: "sync",
    title: "Instant Inventory Sync",
    desc: "Every item sold deducts from stock in real time — no manual reconciliation, no overselling.",
  },
];

function FeatureGridSection() {
  return (
    <section id="features" style={{ padding: "96px 24px", background: C.fcfcfc }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <span className="biz-label">Features</span>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 700, color: C.dark,
            marginTop: 14, letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            Everything the modern<br />checkout demands
          </h2>
        </div>

        <div className="biz-bento-grid">
          {posFeatures.map(f => (
            <div key={f.title} className="biz-bento-card">
              <div className="biz-icon-wrap">
                <Icon name={f.icon} size={22} />
              </div>
              <h3 className="biz-card-title">{f.title}</h3>
              <p className="biz-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. TRANSACTION ENGINE (dark) ────────────────────────────────────────────
function TransactionEngineSection() {
  return (
    <section style={{ padding: "96px 24px", background: C.dark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray500 }}>Under the Hood</span>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 700, color: C.white,
            marginTop: 14, letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            A transaction engine built<br />for the shop floor
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 24 }}>

          {/* Card 1: Payment Methods */}
          <div style={{
            background: C.cardDark, borderRadius: 20,
            padding: 32, border: `1px solid ${C.borderDark}`,
            minHeight: 400,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              border: `1px solid rgba(255,255,255,0.1)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <Icon name="card" size={16} style={{ color: C.accent }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Universal Payments</h3>
            <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 32 }}>
              Accept every tender type your customers carry — no integrations to bolt on later.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "VISA", color: "#1a56f0" },
                { label: "MASTERCARD", color: "#eb6c2a" },
                { label: "CASH", color: C.gray600 },
                { label: "QR PAY", color: "#22c55e" },
                { label: "APPLE PAY", color: C.gray400 },
                { label: "BANK", color: "#6366f1" },
              ].map(m => (
                <div key={m.label} className="biz-method-box">
                  <p className="biz-method-label" style={{ color: m.color, fontSize: 10 }}>{m.label}</p>
                  <p className="biz-method-sub">Enabled</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} className="biz-pulse-glow" />
              <span style={{ fontSize: 11, color: C.gray400 }}>All methods active — 0 gateway errors today</span>
            </div>
          </div>

          {/* Card 2: Receipt Engine */}
          <div style={{
            background: C.cardDark, borderRadius: 20,
            padding: 32, border: `1px solid ${C.borderDark}`,
            minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <Icon name="printer" size={16} style={{ color: C.accent }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Receipt Engine</h3>
              <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 28 }}>
                Branded digital and thermal receipts with custom fields, promotions, and QR return links.
              </p>
            </div>
            {/* Mini receipt preview */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: 20,
              fontFamily: "monospace",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.white, textAlign: "center", marginBottom: 12, letterSpacing: "2px" }}>BIZAK RETAIL</p>
              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.12)", paddingTop: 10 }}>
                {[
                  { item: "Espresso x2", amt: "$7.60" },
                  { item: "Croissant  x1", amt: "$4.20" },
                ].map(r => (
                  <div key={r.item} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: C.gray400 }}>{r.item}</span>
                    <span style={{ fontSize: 10, color: C.gray400 }}>{r.amt}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.12)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.white }}>TOTAL</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>$13.54</span>
              </div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 10 10" fill="currentColor" style={{ color: "rgba(199,255,53,0.6)" }}>
                    <rect x="0" y="0" width="4" height="4" /><rect x="6" y="0" width="4" height="4" />
                    <rect x="0" y="6" width="4" height="4" /><rect x="1" y="1" width="2" height="2" fill={C.dark} />
                    <rect x="7" y="1" width="2" height="2" fill={C.dark} /><rect x="1" y="7" width="2" height="2" fill={C.dark} />
                    <rect x="6" y="6" width="1" height="1" /><rect x="8" y="6" width="2" height="2" />
                    <rect x="6" y="8" width="2" height="1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Shift Dashboard */}
          <div style={{
            background: C.cardDark, borderRadius: 20,
            padding: 32, border: `1px solid ${C.borderDark}`,
            minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <Icon name="cashier" size={16} style={{ color: C.accent }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Shift Dashboard</h3>
              <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 28 }}>
                Open and close shifts with automated cash counting, variance flags, and per-cashier breakdowns.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { tender: "Card Payments", amount: "$1,842.00", pct: "72%", color: C.accent },
                { tender: "Cash", amount: "$519.50", pct: "20%", color: "#60a5fa" },
                { tender: "QR / Mobile", amount: "$206.00", pct: "8%", color: C.gray400 },
              ].map(row => (
                <div key={row.tender} style={{
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.white }}>{row.tender}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.amount}</p>
                    <p style={{ fontSize: 9, color: C.gray500, textTransform: "uppercase" }}>{row.pct} of shift</p>
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 4, padding: "10px 14px",
                background: "rgba(199,255,53,0.06)", borderRadius: 8,
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>Shift Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>$2,567.50</span>
              </div>
            </div>
          </div>

          {/* Card 4: Audit Log */}
          <div style={{
            background: C.cardDark, borderRadius: 20,
            padding: 32, border: `1px solid ${C.borderDark}`,
            minHeight: 360,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="shield" size={16} style={{ color: C.accent }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Integrity</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: C.accent }}>100%</p>
              </div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 12 }}>Transaction Audit Log</h3>
            <p style={{ fontSize: 13, color: C.gray400, lineHeight: 1.65, marginBottom: 24 }}>
              Every sale, void, refund, and discount is timestamped and linked to a cashier for a complete paper trail.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 9, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.8px",
              }}>
                <span>Transaction</span><span>Cashier</span><span>Status</span>
              </div>
              {[
                { id: "#TXN-0091", cashier: "Sarah K.", ok: true },
                { id: "#TXN-0090", cashier: "James M.", ok: true },
                { id: "#TXN-0089", cashier: "Sarah K.", ok: true },
              ].map(row => (
                <div key={row.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: 10, fontWeight: 700,
                }}>
                  <span style={{ color: C.white }}>{row.id}</span>
                  <span style={{ color: C.gray400 }}>{row.cashier}</span>
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

// ─── 4. SALES INTELLIGENCE ───────────────────────────────────────────────────
function SalesIntelligenceSection() {
  const barHeights = [30, 55, 45, 70, 90, 65, 80, 50, 40, 60, 75, 85];
  return (
    <section style={{ padding: "96px 24px", background: C.fcfcfc }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray400 }}>Sales Intelligence</span>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 700, color: C.dark,
            marginTop: 14, letterSpacing: "-0.02em",
          }}>
            Know your busiest hours.<br />Act before the rush.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20 }}>
          {/* Main chart card */}
          <div style={{
            background: C.white, borderRadius: 20,
            border: `1px solid ${C.border}`, padding: 32,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
              <div>
                <h3 style={{ fontWeight: 700, color: C.gray800, fontSize: 15 }}>Hourly Revenue — Today</h3>
                <p style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>Register #1, Morning to Close</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: C.gray100, color: C.gray600,
                padding: "4px 10px", borderRadius: 6,
              }}>LIVE</span>
            </div>

            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
              {barHeights.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%", height: h,
                    background: i === 10 ? C.accent : i === 4 ? "rgba(199,255,53,0.45)" : C.gray100,
                    borderRadius: "4px 4px 0 0",
                    transition: "background 0.2s",
                    boxShadow: i === 10 ? "0 0 12px rgba(199,255,53,0.4)" : "none",
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm"].map(t => (
                <span key={t} style={{ fontSize: 8, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.3px" }}>{t}</span>
              ))}
            </div>

            {/* Summary row */}
            <div style={{ marginTop: 24, display: "flex", gap: 32, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              {[
                { label: "Peak Hour", value: "6 PM", sub: "↑ 42% vs yesterday" },
                { label: "Transactions", value: "214", sub: "Avg. 2.8 min/txn" },
                { label: "Avg. Basket", value: "$18.40", sub: "↑ $1.20 this week" },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: C.gray400, marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, marginTop: 2 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "tag",   label: "TOP PRODUCT", value: "Espresso", sub: "63 sold today" },
              { icon: "trend", label: "REVENUE TREND", value: "+18%", sub: "vs. last Tuesday" },
              { icon: "chart", label: "ITEMS / TXTN",  value: "2.7", sub: "Basket depth" },
            ].map(m => (
              <div key={m.label} style={{
                padding: 20, background: C.white,
                border: `1px solid ${C.border}`, borderRadius: 14,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32, background: C.f9,
                    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    color: C.gray400,
                  }}>
                    <Icon name={m.icon} size={16} />
                  </div>
                </div>
                <p style={{ fontSize: 9, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: C.dark }}>{m.value}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: C.gray500, marginTop: 4 }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. ECOSYSTEM ────────────────────────────────────────────────────────────
function EcosystemSection() {
  const node = (icon: string, label: string, sub: string) => (
    <div style={{
      width: 128, height: 160,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(255,255,255,0.1)`,
      borderRadius: 14,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 20, gap: 12, flexShrink: 0,
    }}>
      <div style={{
        width: 40, height: 40,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.gray400,
      }}>
        <Icon name={icon} size={22} />
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{label}</p>
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
      <p style={{ fontSize: 8, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>{sub}</p>
    </div>
  );

  const connector = (
    <div style={{
      flex: 1, height: 1,
      background: "linear-gradient(to right, transparent, rgba(199,255,53,0.5), transparent)",
      minWidth: 40, maxWidth: 120,
    }} />
  );

  return (
    <section style={{ padding: "96px 24px", background: C.dark, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray500 }}>Connected System</span>
        <h2 style={{
          fontSize: "clamp(26px, 3.5vw, 38px)",
          fontWeight: 700, color: C.white,
          marginTop: 14, marginBottom: 72, letterSpacing: "-0.02em",
        }}>
          POS at the centre of<br />your entire operation
        </h2>

        {/* Hub diagram row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", marginBottom: 40 }}>
          {node("inventory", "Inventory", "Auto Stock-Out")}
          {connector}

          {/* POS Hub */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute", inset: "-40px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(199,255,53,0.15) 0%, transparent 70%)",
              filter: "blur(20px)", zIndex: 0,
            }} />
            <div style={{
              position: "relative", zIndex: 1,
              width: 128, height: 128, borderRadius: "50%",
              background: C.accent,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              color: C.deep,
              boxShadow: "0 0 50px rgba(199,255,53,0.3)",
              padding: 16,
            }}>
              <Icon name="terminal" size={28} />
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", marginTop: 6, lineHeight: 1.3 }}>POS<br />Hub</p>
            </div>
          </div>

          {connector}
          {node("finance", "Finance", "Auto Posting")}
        </div>

        {/* Bottom node */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(199,255,53,0.5), transparent)" }} />
          {node("crm", "CRM", "Purchase History")}
        </div>
      </div>
    </section>
  );
}

// ─── 6. METRICS ──────────────────────────────────────────────────────────────
function MetricsSection() {
  return (
    <section style={{ padding: "96px 24px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.6px", color: C.gray400 }}>Impact</span>
        <h2 style={{
          fontSize: "clamp(26px, 3.5vw, 38px)",
          fontWeight: 700, color: C.dark,
          marginTop: 14, marginBottom: 72, letterSpacing: "-0.02em",
        }}>
          Measurable lift from day one
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 54 }}>
          {[
            {
              value: "< 3s",
              label: "Average Checkout",
              desc: "Faster transactions mean shorter queues, higher throughput, and more revenue per hour.",
            },
            {
              value: "99.9%",
              label: "Uptime Guaranteed",
              desc: "Built-in offline mode and redundant sync ensure you never lose a sale due to connectivity.",
            },
            {
              value: "Zero",
              label: "Sync Errors",
              desc: "Atomic inventory deductions and idempotent posting eliminate stock discrepancies permanently.",
            },
          ].map(m => (
            <div key={m.label} style={{
              padding: 32, border: `1px solid ${C.border}`,
              borderRadius: 20, textAlign: "center",
              transition: "box-shadow 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <p style={{ fontSize: 52, fontWeight: 700, color: C.dark, marginBottom: 12, letterSpacing: "-0.03em" }}>{m.value}</p>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.4px", color: C.gray400, marginBottom: 16 }}>{m.label}</p>
              <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.65 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. CTA ───────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="biz-cta-section" style={{ background: C.deep, padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(199,255,53,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(199,255,53,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: "clamp(32px, 4.5vw, 58px)",
          fontWeight: 800, color: C.white,
          lineHeight: 1.08, margin: "0 0 20px",
          letterSpacing: "-0.03em",
        }}>
          Start selling smarter<br /><span style={{ color: C.accent }}>from your first transaction</span>
        </h2>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 18, color: "rgba(255,255,255,0.55)",
          lineHeight: 1.7, margin: "0 auto 48px", maxWidth: 520,
        }}>
          Join thousands of retailers on Bizak POS. Get up and running in minutes — no hardware lock-in.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://system.bizakerp.com/account/self-register"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.accent, color: C.deep,
              padding: "15px 36px", borderRadius: 10,
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 32px rgba(199,255,53,0.35)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = ""; }}
          >
            Start Free Trial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
          <a
            href="/contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "transparent", color: C.white,
              padding: "15px 36px", borderRadius: 10,
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15,
              textDecoration: "none",
              border: `1px solid ${C.borderDark}`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.borderDark; }}
          >
            Book a Demo
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function PointOfSalesPage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <FeatureGridSection />
        <TransactionEngineSection />
        <SalesIntelligenceSection />
        <EcosystemSection />
        <MetricsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
