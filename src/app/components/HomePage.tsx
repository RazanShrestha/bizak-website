import "../../styles/style.css";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Globe2,
  Activity,
  Layers,
  Receipt,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── Tiny shared atoms ────────────────────────────────────────────────────────

function Container({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="bz-container" style={style}>{children}</div>;
}

function SectionLabel({ index, label, tone = "dark" }: { index: string; label: string; tone?: "dark" | "light" }) {
  const color = tone === "dark" ? "var(--bz-text-muted)" : "rgba(252,252,247,0.55)";
  return (
    <div
      style={{
        fontFamily: "var(--bz-body-font)",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        marginBottom: 18,
      }}
    >
      <span style={{ marginRight: 6 }}>[{index}]</span>
      {label}
    </div>
  );
}

function PillTickButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a href={href} className="bz-pill bz-pill-dark" style={{ paddingRight: 8 }}>
      {children}
      <span className="bz-pill-tick"><Check size={11} strokeWidth={3} /></span>
    </a>
  );
}


// Hero card #1 — Live revenue snapshot
function HeroCardLedger() {
  return (
    <div className="bz-hero-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 999, background: "#1A2D20", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={12} color="#DBE9B8" />
          </div>
          <span style={{ fontFamily: "var(--bz-body-font)", fontWeight: 500, fontSize: 12.5, color: "#1A1D19" }}>Live ledger</span>
        </div>
        <span style={{ padding: "2px 7px", borderRadius: 999, background: "#DBE9B8", color: "#1F3422", fontFamily: "var(--bz-body-font)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Live
        </span>
      </div>

      <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#6E7466" }}>Cash position</div>
      <div style={{ fontFamily: "var(--bz-heading-font)", fontSize: 24, fontWeight: 400, color: "#1A1D19", letterSpacing: "-0.02em", marginTop: 2 }}>
        $1,242,180
      </div>

      <div style={{ marginTop: 12, padding: 12, background: "#F4F5EF", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, color: "#6E7466" }}>Today's journal entries</span>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, fontWeight: 500, color: "#1F3422" }}>247 auto-posted</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
          {[40, 65, 50, 80, 60, 88, 92].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? "#1A2D20" : "rgba(15,20,17,0.14)", borderRadius: 3 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Hero card #2 — Auto-posted invoice
function HeroCardInvoice() {
  return (
    <div className="bz-hero-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 999, background: "#1A2D20", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Receipt size={12} color="#DBE9B8" />
          </div>
          <span style={{ fontFamily: "var(--bz-body-font)", fontWeight: 500, fontSize: 12.5, color: "#1A1D19" }}>Invoice INV-2046</span>
        </div>
        <span style={{ padding: "2px 7px", borderRadius: 999, background: "rgba(15,20,17,0.06)", color: "#1A1D19", fontFamily: "var(--bz-body-font)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Posted
        </span>
      </div>

      <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#6E7466" }}>Apex Manufacturing GmbH</div>
      <div style={{ fontFamily: "var(--bz-heading-font)", fontSize: 24, fontWeight: 400, color: "#1A1D19", letterSpacing: "-0.02em", marginTop: 2 }}>
        $12,400.00
      </div>

      <div style={{ marginTop: 12, padding: "10px 12px", background: "#F4F5EF", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, color: "#6E7466" }}>AR</span>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, color: "#1A1D19", fontWeight: 500 }}>+$12,400.00</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, color: "#6E7466" }}>Revenue · VAT 19%</span>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, color: "#1A1D19", fontWeight: 500 }}>+$11,000 · +$1,400</span>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section style={{ padding: "56px 16px 96px", background: "#efefe9" }}>
      <Container>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div className="bz-badge-green" role="button" style={{ marginBottom: 28 }}>
            Now Live, Globally 🎉
          </div>

          <h1 className="bz-h2" style={{ marginBottom: 36 }}>
            The operating system for modern business,{" "}
            <span className="bz-h2-muted">handling finance, inventory and operations in one place.</span>
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            <PillTickButton href="https://system.bizakerp.com/account/self-register">Get Started</PillTickButton>
            <a href="/contact" className="bz-pill bz-pill-light">
              <Sparkles size={13} />
              Book a demo
            </a>
          </div>
        </div>

        {/* Hero canvas — dark olive with 2 floating cards */}
        <div className="bz-hero-canvas">
          <div className="bz-hero-canvas-grid" />
          <div className="bz-hero-cards">
            <HeroCardLedger />
            <HeroCardInvoice />
          </div>
        </div>

        <LogoStrip />
      </Container>
    </section>
  );
}

// ─── LOGO STRIP ───────────────────────────────────────────────────────────────

const LOGOS_BASE = "https://raw.githubusercontent.com/gilbarbara/logos/main/logos";
const LOGOS = ["microsoft", "shopify", "slack", "salesforce", "hubspot", "stripe", "adobe", "oracle", "atlassian", "notion", "figma"];

function LogoStrip() {
  return (
    <div style={{ marginTop: 56, marginBottom: 8 }}>
      <p style={{ textAlign: "center", fontFamily: "var(--bz-body-font)", fontSize: 12.5, color: "#6E7466", marginBottom: 22 }}>
        Trusted by thousands of teams &amp; organisations
      </p>
      <div className="bz-marquee-mask">
        <div className="bz-marquee-track">
          {[...LOGOS, ...LOGOS].map((slug, i) => (
            <img key={`${slug}-${i}`} src={`${LOGOS_BASE}/${slug}.svg`} alt={slug} className="bz-marquee-logo" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── [01] HOW IT WORKS ───────────────────────────────────────────────────────

function StepVisualSetup() {
  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div style={{ background: "#FCFCF7", border: "1px solid #E5E5E0", borderRadius: 18, padding: 16, boxShadow: "0 10px 28px rgba(15,20,17,0.06)" }}>
        <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#6E7466", marginBottom: 12 }}>Pick your modules</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Financial Management", on: true },
            { label: "Sales & CRM", on: true },
            { label: "Inventory & Warehouse", on: true },
            { label: "Manufacturing", on: false },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 12px", borderRadius: 10,
              background: row.on ? "#F4F5EF" : "#FCFCF7",
              border: row.on ? "none" : "1px solid #E5E5E0",
            }}>
              <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 13, color: "#1A1D19" }}>{row.label}</span>
              <div style={{ width: 28, height: 16, borderRadius: 999, background: row.on ? "#1A2D20" : "#E5E5E0", position: "relative" }}>
                <div style={{ position: "absolute", top: 2, [row.on ? "right" : "left"]: 2, width: 12, height: 12, borderRadius: 999, background: row.on ? "#DBE9B8" : "#FCFCF7" } as React.CSSProperties} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepVisualConnect() {
  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div style={{ background: "#FCFCF7", border: "1px solid #E5E5E0", borderRadius: 18, padding: 16, boxShadow: "0 10px 28px rgba(15,20,17,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#6E7466" }}>Auto-posted today</span>
          <span style={{ fontFamily: "var(--bz-heading-font)", fontSize: 20, fontWeight: 400, color: "#1F3422", letterSpacing: "-0.02em" }}>247</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { txn: "Sales order SO-1041", debit: "AR", credit: "Revenue + VAT" },
            { txn: "Shipment SH-882", debit: "COGS", credit: "Inventory" },
            { txn: "Vendor bill VB-216", debit: "Expenses", credit: "AP" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, background: "#F4F5EF" }}>
              <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11.5, color: "#1A1D19" }}>{r.txn}</span>
              <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, color: "#6E7466" }}>{r.debit} → {r.credit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepVisualScale() {
  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div style={{ background: "#FCFCF7", border: "1px solid #E5E5E0", borderRadius: 18, padding: 16, boxShadow: "0 10px 28px rgba(15,20,17,0.06)" }}>
        <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#6E7466", marginBottom: 12 }}>Consolidated P&amp;L · Q1</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { entity: "Bizak US", flag: "🇺🇸", amount: "$1.24M" },
            { entity: "Bizak EU", flag: "🇪🇺", amount: "€880k" },
            { entity: "Bizak UK", flag: "🇬🇧", amount: "£420k" },
            { entity: "Bizak JP", flag: "🇯🇵", amount: "¥28M" },
          ].map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: "#F4F5EF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="bz-flag" style={{ fontSize: 12 }}>{e.flag}</span>
                <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 12.5, color: "#1A1D19" }}>{e.entity}</span>
              </div>
              <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 12, fontWeight: 500, color: "#1A1D19" }}>{e.amount}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E5E5E0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#6E7466" }}>Group total (USD)</span>
          <span style={{ fontFamily: "var(--bz-heading-font)", fontSize: 18, fontWeight: 400, color: "#1A1D19", letterSpacing: "-0.02em" }}>$3.18M</span>
        </div>
      </div>
    </div>
  );
}

interface Step {
  tag: string;
  number: string;
  title: string;
  bullets: string[];
  visual: React.ReactNode;
  href: string;
}

function StepCard({ s }: { s: Step }) {
  return (
    <div className="bz-step-card">
      <div className="bz-step-pad">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 12, fontWeight: 500, color: "#1A1D19", background: "#F4F5EF", padding: "4px 10px", borderRadius: 999 }}>
            {s.number}
          </span>
          <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 12, fontWeight: 500, color: "#6E7466" }}>{s.tag}</span>
        </div>

        <h3 className="bz-h2" style={{ fontSize: "clamp(22px,2.6vw,30px)", marginBottom: 24 }}>
          {s.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
          {s.bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 999, background: "#DBE9B8", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1F3422", flexShrink: 0, marginTop: 2 }}>
                <Check size={11} strokeWidth={3} />
              </div>
              <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 14, color: "#1A1D19", lineHeight: 1.55 }}>{b}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={s.href} className="bz-pill bz-pill-dark" style={{ paddingRight: 8 }}>
            Learn more
            <span className="bz-pill-tick"><Check size={11} strokeWidth={3} /></span>
          </a>
        </div>
      </div>
      <div className="bz-step-visual">{s.visual}</div>
    </div>
  );
}

function HowItWorksSection() {
  const steps: Step[] = [
    {
      tag: "Set up",
      number: "01",
      title: "Pick your modules and go live",
      bullets: [
        "Finance, sales, inventory, manufacturing — pick what you need.",
        "Pre-configured for your industry. Live in one business day.",
      ],
      visual: <StepVisualSetup />,
      href: "/product",
    },
    {
      tag: "Connect",
      number: "02",
      title: "Every transaction, live on one ledger",
      bullets: [
        "Sales, shipments, payroll — all auto-post the right journals.",
        "Real-time books. No close-the-books marathon.",
      ],
      visual: <StepVisualConnect />,
      href: "/FinancialManagement",
    },
    {
      tag: "Scale",
      number: "03",
      title: "From one branch to global",
      bullets: [
        "Multi-entity, multi-currency, branch-level P&L from day one.",
        "99.8% consolidation accuracy — no separate close tool.",
      ],
      visual: <StepVisualScale />,
      href: "/MulticompanyAndBranches",
    },
  ];

  return (
    <section className="bz-section">
      <Container>
        <div style={{ maxWidth: 820, marginBottom: 56 }}>
          <SectionLabel index="01" label="How it works" />
          <h2 className="bz-h2">
            Replace spreadsheets and run smoothly,{" "}
            <span className="bz-h2-muted">across every part of your business.</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {steps.map((s) => <StepCard key={s.number} s={s} />)}
        </div>

        <FlagsRow />
      </Container>
    </section>
  );
}

function FlagsRow() {
  const flags = ["🇺🇸", "🇬🇧", "🇩🇪", "🇫🇷", "🇪🇸", "🇮🇹", "🇳🇱", "🇨🇦", "🇯🇵", "🇸🇬", "🇦🇺", "🇧🇷", "🇮🇳"];
  return (
    <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "12px 18px", background: "#FCFCF7", border: "1px solid #E5E5E0", borderRadius: 999, maxWidth: "100%",
      }}>
        <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 13, fontWeight: 500, color: "#1A1D19" }}>
          Available in 120+ countries
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {flags.map((f, i) => <span key={i} className="bz-flag">{f}</span>)}
        </div>
        <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 13, color: "#6E7466" }}>
          with localised tax and compliance
        </span>
      </div>
    </div>
  );
}

// ─── [02] PLATFORM ────────────────────────────────────────────────────────────

function PlatformDashboard() {
  return (
    <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "#1A2D20", padding: 28, minHeight: 320 }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(252,252,247,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(252,252,247,0.05) 1px, transparent 1px)",
        backgroundSize: "20px 50px", pointerEvents: "none",
      }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18 }} className="bz-platform-grid">
        <div style={{ background: "rgba(252,252,247,0.04)", border: "1px solid rgba(252,252,247,0.06)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(252,252,247,0.45)", marginBottom: 12 }}>
            Modules
          </div>
          {[
            { label: "Dashboard", active: true },
            { label: "Finance", active: false },
            { label: "Inventory", active: false },
            { label: "Manufacturing", active: false },
            { label: "Sales & CRM", active: false },
          ].map((m, i) => (
            <div key={i} style={{
              padding: "8px 10px", borderRadius: 8, fontFamily: "var(--bz-body-font)", fontSize: 12.5,
              background: m.active ? "#DBE9B8" : "transparent", color: m.active ? "#1F3422" : "rgba(252,252,247,0.7)",
              fontWeight: m.active ? 500 : 400, marginBottom: 2,
            }}>
              {m.label}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#FCFCF7", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#6E7466" }}>Revenue · Q1</div>
                <div style={{ fontFamily: "var(--bz-heading-font)", fontSize: 26, fontWeight: 400, color: "#1A1D19", letterSpacing: "-0.02em" }}>$1.24M</div>
              </div>
              <span style={{ padding: "4px 8px", borderRadius: 999, background: "#DBE9B8", color: "#1F3422", fontFamily: "var(--bz-body-font)", fontSize: 10.5, fontWeight: 500 }}>+14.2%</span>
            </div>
            <svg viewBox="0 0 600 90" width="100%" height="90" preserveAspectRatio="none">
              <path d="M0 65 C 80 60, 140 22, 220 40 S 360 75, 440 45 600 22 600 22 V 90 H 0 Z" fill="rgba(122,130,109,0.18)" />
              <path d="M0 65 C 80 60, 140 22, 220 40 S 360 75, 440 45 600 22 600 22" stroke="#1A2D20" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Open invoices", value: "32" },
              { label: "Stock alerts", value: "6" },
            ].map((c) => (
              <div key={c.label} style={{
                background: "rgba(252,252,247,0.06)", borderRadius: 12, padding: "10px 12px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11.5, color: "rgba(252,252,247,0.62)" }}>{c.label}</span>
                <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 16, fontWeight: 500, color: "#FCFCF7" }}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .bz-platform-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function PlatformSection() {
  return (
    <section className="bz-section" style={{ background: "#efefe9" }}>
      <Container>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 56 }}>
          <SectionLabel index="02" label="Platform" />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <h2 className="bz-h2" style={{ maxWidth: 680 }}>
              A unified platform for finance,{" "}
              <span className="bz-h2-muted">inventory, sales and operations.</span>
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <PillTickButton href="https://system.bizakerp.com/account/self-register">Get Started</PillTickButton>
              <a href="/contact" className="bz-pill bz-pill-light"><Sparkles size={13} />Book a demo</a>
            </div>
          </div>
        </div>

        <PlatformDashboard />

        {/* Bento — 4 cards */}
        <div style={{
          marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 18,
        }} className="bz-platform-bento">
          <div className="bz-bento bz-bento-dark bz-hover-card">
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(252,252,247,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(252,252,247,0.05) 1px, transparent 1px)",
              backgroundSize: "20px 50px", pointerEvents: "none",
            }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <h3 className="bz-bento-title">One ledger,<br />every module</h3>
                <Layers size={26} strokeWidth={1.4} color="#DBE9B8" />
              </div>
              <p className="bz-bento-desc">Every transaction posts the right journals automatically — no re-keying.</p>
            </div>
          </div>

          <div className="bz-bento bz-bento-fire bz-hover-card">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <h3 className="bz-bento-title">Real-time,<br />not month-end</h3>
                <Activity size={26} strokeWidth={1.4} color="#1F3422" />
              </div>
              <p className="bz-bento-desc" style={{ color: "#1F3422", opacity: 0.78 }}>
                Live cash, AR, AP and inventory. No batch posting.
              </p>
            </div>
          </div>

          <div className="bz-bento bz-bento-paper bz-hover-card">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <h3 className="bz-bento-title">Click any number,<br />see its source</h3>
                <TrendingUp size={26} strokeWidth={1.4} color="#1F3422" />
              </div>
              <p className="bz-bento-desc">
                Drill from net income to the originating invoice. 100% audit coverage.
              </p>
            </div>
          </div>

          <div className="bz-bento bz-bento-paper bz-hover-card">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <h3 className="bz-bento-title">Multi-entity,<br />native</h3>
                <Globe2 size={26} strokeWidth={1.4} color="#1F3422" />
              </div>
              <p className="bz-bento-desc">
                Multi-currency, intercompany, branch-level P&amp;L — from day one.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 1100px) { .bz-platform-bento { grid-template-columns: 1fr 1fr !important; } }
          @media (max-width: 600px)  { .bz-platform-bento { grid-template-columns: 1fr !important; } }
        `}</style>

        <BanksRow />
      </Container>
    </section>
  );
}

function BanksRow() {
  const banks = ["microsoft-azure", "stripe", "xero", "quickbooks", "shopify", "salesforce", "hubspot", "slack", "zapier"];
  return (
    <div style={{ marginTop: 40 }}>
      <p style={{ textAlign: "center", fontFamily: "var(--bz-body-font)", fontSize: 12.5, color: "#6E7466", marginBottom: 18 }}>
        Works with the systems you already use.
      </p>
      <div className="bz-marquee-mask">
        <div className="bz-marquee-track" style={{ animationDuration: "44s" }}>
          {[...banks, ...banks].map((slug, i) => <img key={`${slug}-${i}`} src={`${LOGOS_BASE}/${slug}.svg`} alt={slug} className="bz-marquee-logo" />)}
        </div>
      </div>
    </div>
  );
}

// ─── [03] EXCLUSIVE ──────────────────────────────────────────────────────────

function ExclusiveSection() {
  return (
    <section className="bz-section">
      <Container>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 56 }}>
          <SectionLabel index="03" label="Exclusive to Bizak" />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <h2 className="bz-h2" style={{ maxWidth: 720 }}>
              More visibility, less manual work,{" "}
              <span className="bz-h2-muted">with features built for finance teams.</span>
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <PillTickButton href="https://system.bizakerp.com/account/self-register">Get Started</PillTickButton>
              <a href="/contact" className="bz-pill bz-pill-light"><Sparkles size={13} />Book a demo</a>
            </div>
          </div>
        </div>

        {/* 3 small cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }} className="bz-exclusive-grid">
          <div className="bz-bento bz-bento-dark bz-hover-card" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 className="bz-bento-title">Auto-posted journals</h3>
              <p className="bz-bento-desc" style={{ marginBottom: 22 }}>
                247 entries auto-coded yesterday — finance teams stop coding transactions.
              </p>
              <a href="/FinancialManagement" className="bz-pill bz-pill-leaf" style={{ alignSelf: "flex-start" }}>Learn more</a>

              <div style={{
                marginTop: 22, padding: 12, background: "rgba(252,252,247,0.07)", borderRadius: 12, flex: 1, minHeight: 90,
                display: "flex", flexDirection: "column", justifyContent: "center", gap: 6,
              }}>
                {[
                  { l: "Shipment → COGS / Inventory", v: "auto" },
                  { l: "Invoice → AR / Revenue", v: "auto" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11.5, color: "rgba(252,252,247,0.72)" }}>{r.l}</span>
                    <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, fontWeight: 500, color: "#DBE9B8" }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bz-bento bz-bento-paper bz-hover-card" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 className="bz-bento-title">Full audit trail</h3>
              <p className="bz-bento-desc" style={{ marginBottom: 22 }}>
                Every figure resolves to its source transaction with user and timestamp.
              </p>
              <a href="/DocumentManagement" className="bz-pill bz-pill-dark" style={{ alignSelf: "flex-start" }}>Learn more</a>

              <div style={{ marginTop: 22, flex: 1, minHeight: 90, background: "#F4F5EF", borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
                {[
                  { who: "Sara", what: "Approved INV-2046", t: "1m" },
                  { who: "James", what: "Updated SK-402", t: "3m" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 999, background: "#DBE9B8", color: "#1F3422", fontFamily: "var(--bz-body-font)", fontSize: 9.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {r.who[0]}
                      </div>
                      <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11, color: "#1A1D19" }}>{r.what}</span>
                    </div>
                    <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 10.5, color: "#6E7466" }}>{r.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bz-bento bz-bento-leaf bz-hover-card" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <h3 className="bz-bento-title">AI bank reconciliation</h3>
              <p className="bz-bento-desc" style={{ color: "#1F3422", opacity: 0.78, marginBottom: 22 }}>
                AI-driven matching that learns your transactions — 40% fewer manual fixes.
              </p>
              <a href="/DashboardAndReporting" className="bz-pill bz-pill-dark" style={{ alignSelf: "flex-start" }}>Learn more</a>

              <div style={{
                marginTop: 22, flex: 1, minHeight: 90, background: "rgba(31,52,34,0.08)", borderRadius: 12, padding: 12,
                display: "flex", flexDirection: "column", justifyContent: "center", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={12} color="#1F3422" />
                  <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11.5, fontWeight: 500, color: "#1F3422" }}>Bizak AI</span>
                </div>
                <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 12.5, color: "#1A1D19", lineHeight: 1.5 }}>
                  Matched <strong>184 statement lines</strong> to ledger entries this morning.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Big card — Multi-entity consolidation */}
        <div className="bz-big-card bz-hover-card" style={{ marginTop: 18 }}>
          <div className="bz-big-card-text">
            <div>
              <h3 className="bz-bento-title" style={{ marginBottom: 14 }}>Multi-entity consolidation</h3>
              <p style={{ fontFamily: "var(--bz-body-font)", fontSize: 14.5, color: "rgba(252,252,247,0.62)", lineHeight: 1.6, maxWidth: 460, marginBottom: 24 }}>
                Roll up branches, currencies and subsidiaries into one set of reports — no separate consolidation tool.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 460 }}>
                {[
                  "FX translation, applied automatically",
                  "Intercompany elimination with audit trail",
                  "99.8% consolidation accuracy",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 999, background: "#DBE9B8", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1F3422", marginTop: 2, flexShrink: 0 }}>
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 13.5, color: "#FCFCF7" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
              <a href="/MulticompanyAndBranches" className="bz-pill bz-pill-accent">Learn more<ArrowRight size={13} /></a>
            </div>
          </div>

          <div className="bz-big-card-visual">
            <div style={{ width: "100%", maxWidth: 360, background: "#FCFCF7", color: "#1A1D19", borderRadius: 18, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 11.5, color: "#6E7466" }}>Group total · Q1</div>
                <PiggyBank size={16} color="#1F3422" />
              </div>
              <div style={{ fontFamily: "var(--bz-heading-font)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em" }}>$4.82M</div>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { ccy: "USD", flag: "🇺🇸", amount: "$2.14M", pct: 44 },
                  { ccy: "EUR", flag: "🇪🇺", amount: "€1.28M", pct: 28 },
                  { ccy: "GBP", flag: "🇬🇧", amount: "£820k", pct: 18 },
                  { ccy: "JPY", flag: "🇯🇵", amount: "¥58.6M", pct: 10 },
                ].map((c) => (
                  <div key={c.ccy}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="bz-flag" style={{ width: 20, height: 20, fontSize: 11 }}>{c.flag}</span>
                        <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11.5, fontWeight: 500 }}>{c.ccy}</span>
                      </div>
                      <span style={{ fontFamily: "var(--bz-body-font)", fontSize: 11.5, color: "#1A1D19" }}>{c.amount}</span>
                    </div>
                    <div className="bz-stripe-bar"><div className="bz-stripe-bar-fill" style={{ width: `${c.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 1100px) { .bz-exclusive-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </Container>
    </section>
  );
}

// ─── TESTIMONIALS + STATS ────────────────────────────────────────────────────

const TESTIMONIALS = [
  { quote: "Bizak gave us one place for finance, inventory and sales. We replaced six disconnected tools in our first month.", name: "David Richardson", role: "CEO, Apex Manufacturing", initials: "DR" },
  { quote: "Month-end close dropped from 9 days to 2. Our finance team finally has time to actually look at the numbers.", name: "Sara Okafor", role: "CFO, Helio Distribution", initials: "SO" },
  { quote: "Multi-entity, multi-currency just works. Consolidation that used to need a separate tool is now built in.", name: "Anestis Goudas", role: "Group Controller, Northwind Retail", initials: "AG" },
];

function TestimonialsSection() {
  const [i, setI] = useState(0);
  const prev = () => setI((p) => (p === 0 ? TESTIMONIALS.length - 1 : p - 1));
  const next = () => setI((p) => (p === TESTIMONIALS.length - 1 ? 0 : p + 1));

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p === TESTIMONIALS.length - 1 ? 0 : p + 1)), 6000);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[i];
  return (
    <section className="bz-section" style={{ background: "#efefe9" }}>
      <Container>
        <div style={{ background: "#FCFCF7", borderRadius: 24, padding: 44 }} className="bz-testi-card">
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 44, alignItems: "stretch" }} className="bz-testi-grid">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 240 }}>
              <blockquote style={{
                fontFamily: "var(--bz-heading-font)",
                fontSize: "clamp(20px, 2.2vw, 26px)",
                fontWeight: 400,
                letterSpacing: "-0.015em",
                lineHeight: 1.35,
                color: "#1A1D19",
                margin: 0,
              }}>
                "{t.quote}"
              </blockquote>

              <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="bz-avatar-lg">{t.initials}</div>
                  <div>
                    <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 14, fontWeight: 500, color: "#1A1D19" }}>{t.name}</div>
                    <div style={{ fontFamily: "var(--bz-body-font)", fontSize: 12.5, color: "#6E7466" }}>{t.role}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={prev} aria-label="Previous" style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid #E5E5E0", background: "#FCFCF7", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1A1D19" }}>
                    <ChevronLeft size={15} />
                  </button>
                  <button onClick={next} aria-label="Next" style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid #E5E5E0", background: "#FCFCF7", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1A1D19" }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { num: "50,000+", desc: "Companies powered by Bizak." },
                { num: "60%", desc: "Faster month-end close." },
                { num: "99.8%", desc: "Consolidation accuracy." },
              ].map((s) => (
                <div key={s.num} style={{ background: "#F4F5EF", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="bz-stat-num" style={{ fontSize: 30 }}>{s.num}</div>
                  <p style={{ fontFamily: "var(--bz-body-font)", fontSize: 12.5, color: "#6E7466", margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 980px) {
            .bz-testi-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
            .bz-testi-card { padding: 28px !important; }
          }
        `}</style>
      </Container>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "How long does Bizak take to deploy?",
    a: "Most teams go live in one business day. Pick the modules you need (finance, inventory, sales, manufacturing, projects), invite your team, and start running. No 9-month implementation." },
  { q: "Can we adopt module by module?",
    a: "Yes. Start with one (e.g. finance) and add inventory, sales or manufacturing later. Existing tools can stay connected via 200+ integrations during the transition." },
  { q: "Is Bizak built for multi-entity, multi-currency?",
    a: "Yes, from day one. Multi-currency FX translation, intercompany elimination, branch-level P&L — without a separate consolidation tool. 99.8% consolidation accuracy." },
  { q: "Is Bizak secure and audit-ready?",
    a: "Yes. SOC-2 Type II, GDPR-ready, full audit trail on every change, role-based access, SSO. Every figure in a report resolves to its source transaction." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bz-section">
      <Container>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40, alignItems: "flex-start" }} className="bz-faq-grid">
          <div style={{
            position: "relative", borderRadius: 22, overflow: "hidden", background: "#1A2D20", padding: 32,
            minHeight: 320, color: "#FCFCF7", display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(252,252,247,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(252,252,247,0.05) 1px, transparent 1px)",
              backgroundSize: "20px 50px", pointerEvents: "none",
            }} />
            <div style={{ position: "relative" }}>
              <SectionLabel index="04" label="FAQ" tone="light" />
              <h2 className="bz-h2" style={{ color: "#FCFCF7" }}>
                Frequently asked{" "}
                <span style={{ color: "rgba(252,252,247,0.55)" }}>questions.</span>
              </h2>
            </div>
            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
              <a href="/HelpCenter" className="bz-pill bz-pill-accent">Visit help center<ArrowRight size={13} /></a>
              <a href="/contact" className="bz-pill bz-pill-ghost-dark">Talk to support</a>
            </div>
          </div>

          <div>
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="bz-faq-item">
                  <button onClick={() => setOpen(isOpen ? null : i)} className="bz-faq-trigger" aria-expanded={isOpen}>
                    {item.q}
                    <span className="bz-faq-icon">{isOpen ? <Minus size={14} /> : <Plus size={14} />}</span>
                  </button>
                  <div className={`bz-faq-content ${isOpen ? "is-open" : ""}`}>
                    <div className="bz-faq-body">{item.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          @media (max-width: 980px) { .bz-faq-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </Container>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <div className="bz-page">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <PlatformSection />
        <ExclusiveSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}

