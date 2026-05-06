import { useState } from "react";
import svgPaths from "../../imports/svg-o630xd7z2o";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brand: "#7a826d",
  brandLight: "rgba(122,130,109,0.1)",
  dark: "#333",
  text: "#666",
  border: "#e8eae4",
  bgLight: "#f8f9f7",
  bgDark: "#1a1d19",
  accent: "#c7ff35",
  accentLow: "rgba(199,255,53,0.1)",
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function SectionLabel({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div style={{
      fontFamily: "Inter",
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: "1.4px",
      color: light ? "rgba(255,255,255,0.4)" : C.brand,
      textTransform: "uppercase",
      textAlign: "center",
    }}>
      {text}
    </div>
  );
}

// ─── 1. HERO SECTION ─────────────────────────────────────────────────────────
function WorkflowStep({
  icon,
  label,
  active = false,
  viewBox,
  iw = 14,
  ih = 18,
}: {
  icon: string; label: string; active?: boolean;
  viewBox?: string; iw?: number; ih?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: active ? C.brand : "#fff",
        border: `2px solid ${active ? C.brand : C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: active ? "0 10px 15px -3px rgba(0,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}>
        <svg width={iw} height={ih} viewBox={viewBox || `0 0 ${iw} ${ih}`} fill="none">
          <path d={icon} fill={active ? "#fff" : C.brand} />
        </svg>
      </div>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 9, textTransform: "uppercase", color: C.dark }}>
        {label}
      </span>
    </div>
  );
}

function HeroDashboard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(8px)",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.5)",
      boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex" }}>
        {/* App Sidebar */}
        <div style={{
          background: "#121212",
          width: 56, flexShrink: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", padding: "20px 0", gap: 20,
        }}>
          <div style={{
            background: C.brand, borderRadius: 4,
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="10" height="12" viewBox="0 0 12.4999 15.8333" fill="none">
              <path d={svgPaths.p495d170} fill="white" />
            </svg>
          </div>
          {[svgPaths.p15aec574, svgPaths.p1f9e2300, svgPaths.p3002980].map((p, i) => (
            <div key={i} style={{ opacity: 0.35, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 25 25" fill="none">
                <path d={p} fill="white" />
              </svg>
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, background: "#f8f9f7", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Metric cards */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Open POs", value: "142" },
              { label: "Vendor Balances", value: "$84.2k" },
              { label: "Avg. Cycle", value: "4.2 Days" },
            ].map((m, i) => (
              <div key={i} style={{
                flex: 1, background: "#fff",
                borderRadius: 10, border: `1px solid ${C.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                padding: "12px 14px",
              }}>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 9, color: C.text, textTransform: "uppercase", marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: C.dark }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Workflow card */}
          <div style={{
            background: "#fff", borderRadius: 10,
            border: `1px solid ${C.border}`, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 13, color: C.dark }}>Procurement Workflow</span>
              <span style={{
                background: "rgba(199,255,53,0.2)", borderRadius: 4,
                padding: "2px 8px", fontFamily: "Inter", fontWeight: 700, fontSize: 9, color: C.dark,
              }}>LIVE</span>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-around", gap: 8 }}>
              <div style={{
                position: "absolute", top: 19, left: "5%", right: "5%",
                height: 1.5, background: C.border, zIndex: 0,
              }} />
              <WorkflowStep icon={svgPaths.p495d170} label="RFQ" active viewBox="0 0 12.4999 15.8333" iw={10} ih={12} />
              <WorkflowStep icon={svgPaths.p254e3700} label="Approval" active viewBox="0 0 25 22.5" iw={16} ih={14} />
              <WorkflowStep icon={svgPaths.p3002980} label="PO Issued" active viewBox="0 0 22.5 25" iw={14} ih={16} />
              <WorkflowStep icon={svgPaths.p34a70300} label="Delivery" viewBox="0 0 25 25" iw={16} ih={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section style={{ background: "#fff", paddingTop: 160, paddingBottom: 96, overflow: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{
            display: "inline-block",
            background: "rgba(232,234,228,0.3)",
            border: `1px solid ${C.border}`,
            borderRadius: 9999, padding: "4px 16px",
            fontFamily: "Inter", fontWeight: 700, fontSize: 12,
            letterSpacing: "1.2px", color: C.brand, textTransform: "uppercase",
          }}>Purchasing Module</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "Inter", fontWeight: 700,
          fontSize: "clamp(40px, 5.5vw, 72px)",
          lineHeight: 1.0, letterSpacing: "-1.8px",
          color: C.dark, textAlign: "center", margin: "0 0 24px",
          maxWidth: 896, marginLeft: "auto", marginRight: "auto",
        }}>
          Control purchasing and<br />
          vendor relationships with<br />
          precision
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: "Inter", fontWeight: 400,
          fontSize: 20, lineHeight: 1.625, color: C.text,
          textAlign: "center", margin: "0 auto 40px",
          maxWidth: 600,
        }}>
          Streamline your procurement lifecycle from RFQ to final payment. Centralize vendor communication and automate approval workflows in one high-fidelity interface.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 80 }}>
          <button style={{
            background: C.accent, color: C.dark, border: "none",
            borderRadius: 4, padding: "17px 32px",
            fontFamily: "Inter", fontWeight: 700, fontSize: 16,
            cursor: "pointer", boxShadow: "0 0 20px rgba(199,255,53,0.4)",
          }}>Request Demo</button>
          <button style={{
            background: "#fff", color: C.dark,
            border: `1px solid ${C.border}`, borderRadius: 4,
            padding: "17px 33px",
            fontFamily: "Inter", fontWeight: 700, fontSize: 16, cursor: "pointer",
          }}>View features</button>
        </div>

        {/* Dashboard mockup */}
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

// ─── 2. OVERVIEW FEATURE CARDS ────────────────────────────────────────────────
const overviewFeatures = [
  {
    title: "Vendor Management",
    desc: "Centralize supplier details, performance ratings, and contract history.",
    icon: svgPaths.p1f9e2300, vb: "0 0 25 25",
  },
  {
    title: "Custom Workflows",
    desc: "Dynamic approval chains based on amount, department, or project.",
    icon: svgPaths.p254e3700, vb: "0 0 25 22.5",
  },
  {
    title: "Automated Billing",
    desc: "Convert POs to invoices instantly with 3-way matching capabilities.",
    icon: svgPaths.p3002980, vb: "0 0 22.5 25",
  },
  {
    title: "Finance Integration",
    desc: "Direct ledger posting for real-time financial accuracy and reporting.",
    icon: svgPaths.p34a70300, vb: "0 0 25 25",
  },
  {
    title: "Inventory Sync",
    desc: "Stock levels update automatically upon purchase receipt confirmation.",
    icon: svgPaths.p2d4ee00, vb: "0 0 25 25",
  },
  {
    title: "Spend Analysis",
    desc: "Deep insights into purchasing patterns and cost-saving opportunities.",
    icon: svgPaths.p1f052000, vb: "0 0 22.5 22.5",
  },
];

function OverviewSection() {
  return (
    <section style={{ background: C.bgLight, padding: "96px 0", borderBottom: `1px solid rgba(232,234,228,0.3)` }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 14, letterSpacing: "1.4px", color: C.brand, textTransform: "uppercase", marginBottom: 16 }}>
            Overview
          </div>
          <h2 style={{
            fontFamily: "Inter", fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.2,
            letterSpacing: "-1.2px", color: C.dark, margin: 0,
          }}>
            A structured procurement system<br />built for operational control
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}>
          {overviewFeatures.map((f, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: "32px 32px 40px",
              position: "relative",
              minHeight: 206,
            }}>
              <div style={{
                background: C.brandLight, borderRadius: 8,
                width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <svg width="22" height="22" viewBox={f.vb} fill="none">
                  <path d={f.icon} fill={C.brand} />
                </svg>
              </div>
              <h3 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 18, color: C.dark, margin: "0 0 10px" }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: C.text, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. TECHNICAL SHOWCASE (dark) ─────────────────────────────────────────────
function ApprovalRow({
  label, status, active = false, muted = false,
}: { label: string; status: string; active?: boolean; muted?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: 16,
      background: "rgba(255,255,255,0.03)",
      borderRadius: 12,
      border: `1px solid rgba(255,255,255,${active ? "0.15" : "0.08"})`,
      boxShadow: active ? "0 0 15px rgba(199,255,53,0.1)" : "none",
      opacity: muted ? 0.3 : 1,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: active ? "rgba(199,255,53,0.2)" : "rgba(122,130,109,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? C.accent : C.brand }} />
      </div>
      <span style={{ flex: 1, fontFamily: "Inter", fontWeight: 700, fontSize: 12, color: active ? C.accent : "#fff" }}>
        {label}
      </span>
      <div style={{
        borderRadius: "50%", width: 11, height: 11,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="11" height="11" viewBox="0 0 11.6667 11.6667" fill="none">
          <path d={svgPaths.p1d9bcc00} fill={active ? C.accent : "rgba(255,255,255,0.2)"} />
        </svg>
      </div>
    </div>
  );
}

function TrailRow({ type, id }: { type: string; id: string }) {
  return (
    <div style={{
      display: "flex", gap: 16, alignItems: "center",
      padding: "11px 20px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: 9999,
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <span style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 10, color: C.brand, width: 90, flexShrink: 0 }}>
        {type}
      </span>
      <span style={{ flex: 1, fontFamily: "Inter", fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
        {id}
      </span>
      <svg width="12" height="12" viewBox="0 0 11.6667 11.6667" fill="none">
        <path d={svgPaths.p1d9bcc00} fill={C.accent} />
      </svg>
    </div>
  );
}

function TechnicalSection() {
  return (
    <section style={{ background: C.bgDark, padding: "160px 0", overflow: "hidden", position: "relative" }}>
      {/* Subtle radial glow */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 600, height: 600,
        background: "radial-gradient(circle at top right, rgba(199,255,53,0.03), transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 12, letterSpacing: "2.4px", color: C.brand, textTransform: "uppercase", marginBottom: 16 }}>
            Technical Showcase
          </div>
          <h2 style={{
            fontFamily: "Inter", fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 48px)",
            lineHeight: 1.25, letterSpacing: "-1.2px",
            color: "#fff", margin: 0, maxWidth: 600,
          }}>
            High-fidelity tools for the<br />modern procurement team
          </h2>
        </div>

        {/* Bento grid: 2 col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* === LEFT TALL: Vendor Management === */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 49, display: "flex", flexDirection: "column",
            justifyContent: "space-between", minHeight: 500,
            gridRow: "0 / 3",
          }}>
            {/* Header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path d={svgPaths.p15aec574} fill={C.brand} />
                </svg>
              </div>
              <h3 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 30, color: "#fff", margin: "0 0 12px" }}>
                Vendor Management
              </h3>
              <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 380 }}>
                Maintain a high-performance supplier network with automated ratings and real-time status tracking.
              </p>
            </div>

            {/* Supplier card */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              padding: 25,
            }}>
              {/* Supplier header */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(122,130,109,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: C.brand }}>AX</span>
                  </div>
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    width: 14, height: 14, borderRadius: "50%",
                    background: C.accent,
                    border: "2px solid #1a1d19",
                  }} />
                </div>
                <div>
                  <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 18, color: "#fff" }}>Axeon Logistics</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
                    <span style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                      Active Supplier • Enterprise Tier
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: 17,
                display: "flex", gap: 20,
              }}>
                {[
                  { label: "On-Time", value: "99.2%" },
                  { label: "Quality", value: "A+" },
                  { label: "Contracts", value: "12 Active" },
                ].map((m, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 10, color: C.brand, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                      {m.label}
                    </div>
                    <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: "#fff" }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === RIGHT TOP: Procurement Control === */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 33,
          }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                  <path d={svgPaths.p18964900} fill={C.brand} />
                </svg>
              </div>
              <h3 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "#fff", margin: "0 0 10px" }}>
                Procurement Control
              </h3>
              <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeight: 1.625, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                Dynamic multi-level approval chains with intelligent conditional routing logic.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ApprovalRow label="Manager Approval" status="done" />
              <ApprovalRow label="CFO Review > $50k" status="active" active />
              <ApprovalRow label="Compliance Log" status="pending" muted />
            </div>
          </div>

          {/* === LEFT BOTTOM: PO Management === */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 33,
          }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path d={svgPaths.pc679c40} fill={C.brand} />
                </svg>
              </div>
              <h3 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "#fff", margin: "0 0 10px" }}>
                PO Management
              </h3>
              <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeight: 1.625, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                High-fidelity purchase order generation with precision formatting and real-time status updates.
              </p>
            </div>
            <div style={{
              background: "rgba(0,0,0,0.4)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}>
              <div style={{
                background: "rgba(255,255,255,0.05)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                padding: "12px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>PO-2024-8821</span>
                <span style={{
                  background: "rgba(199,255,53,0.1)",
                  border: "1px solid rgba(199,255,53,0.2)",
                  borderRadius: 9999, padding: "2px 9px",
                  fontFamily: "Inter", fontWeight: 700, fontSize: 9, color: C.accent,
                }}>PENDING</span>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 6, width: "60%" }} />
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 6, width: "90%" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                  <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 14, width: 48 }} />
                  <div style={{ background: "rgba(199,255,53,0.2)", borderRadius: 4, height: 14, width: 64 }} />
                </div>
              </div>
            </div>
          </div>

          {/* === RIGHT BOTTOM: Financial Integration === */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 33,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d={svgPaths.p5df7b00} fill={C.brand} />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "#fff", margin: "0 0 10px" }}>
                  Financial Integration
                </h3>
                <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeight: 1.625, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 280 }}>
                  Direct ledger posting and automated 3-way matching for absolute financial integrity.
                </p>
              </div>
              {/* Audit score badge */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: 17, textAlign: "left",
              }}>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 12, color: C.accent, marginBottom: 4 }}>Audit Score</div>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 30, color: "#fff" }}>100%</div>
              </div>
            </div>

            {/* Digital trail */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 16, padding: "0 8px", marginBottom: 2 }}>
                {["DIGITAL TRAIL", "SOURCE NODE", "STATE"].map((h, i) => (
                  <span key={i} style={{
                    fontFamily: "Inter", fontWeight: 700, fontSize: 11,
                    color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.6px",
                    flex: i === 1 ? 1 : i === 0 ? "0 0 88px" : "0 0 44px",
                  }}>{h}</span>
                ))}
              </div>
              <TrailRow type="PURCHASE_ORDER" id="#PO-2024-8821" />
              <TrailRow type="REC_WAREHOUSE" id="#GRN-990-22" />
              <TrailRow type="VENDOR_INVOICE" id="#INV-AX-402" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. PROCUREMENT INTELLIGENCE ─────────────────────────────────────────────
function ProcurementIntelligenceSection() {
  return (
    <section style={{ background: C.bgLight, padding: "160px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 64 }}>
          <SectionLabel text="Reporting" />
          <h2 style={{
            fontFamily: "Inter", fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 48px)",
            letterSpacing: "-1.2px", color: C.dark, margin: 0, textAlign: "center",
          }}>Procurement Intelligence</h2>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Chart card */}
          <div style={{
            flex: 1, background: "#fff",
            borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)",
            padding: 41,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <h3 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: C.dark, margin: "0 0 4px" }}>
                  Executive Spend Analytics
                </h3>
                <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, color: C.text, margin: 0 }}>
                  Consolidated global entity performance
                </p>
              </div>
              <span style={{
                background: "rgba(232,234,228,0.3)",
                borderRadius: 9999, padding: "3px 12px",
                fontFamily: "Inter", fontWeight: 700, fontSize: 10, color: C.brand,
              }}>FY2024</span>
            </div>

            {/* SVG chart */}
            <div style={{ position: "relative", height: 260 }}>
              <svg viewBox="0 0 744.224 382.812" fill="none" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" gradientUnits="userSpaceOnUse" x1="6.447" x2="6.447" y1="6.448" y2="382.812">
                    <stop stopColor="#7A826D" stopOpacity="0.2" />
                    <stop offset="1" stopColor="#7A826D" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={svgPaths.p34390080} fill="url(#chartGrad)" />
                <path d={svgPaths.p1619bf00} stroke={C.brand} strokeLinecap="round" strokeWidth="12.89" />
                <path d={svgPaths.p20389900} stroke={C.brand} strokeDasharray="20.63 20.63" strokeOpacity="0.4" strokeWidth="7.73" />
              </svg>

              {/* Annotation card */}
              <div style={{
                position: "absolute", top: "24%", right: "18%",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid rgba(232,234,228,0.5)",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
                padding: 17,
              }}>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 10, color: C.brand, textTransform: "uppercase", marginBottom: 4 }}>
                  Peak Spend Identified
                </div>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: C.dark, marginBottom: 2 }}>$1.24M</div>
                <div style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 9, color: C.text }}>Vendor: Axis Manufacturing</div>
              </div>
            </div>
          </div>

          {/* 4 small metric cards (2×2) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: 380, flexShrink: 0 }}>
            {[
              {
                icon: svgPaths.pc297b80, vb: "0 0 18.3333 13.3333",
                label: "Vendor Spend", value: "$428k",
                sub: "-4.2%", subColor: "#16a34a", trend: "down",
              },
              {
                icon: svgPaths.p29628ac0, vb: "0 0 15.8333 18.3333",
                label: "Cost Variance", value: "0.82%",
                sub: "Target Optimized", subColor: C.brand, trend: "good",
              },
              {
                icon: svgPaths.p17052a00, vb: "0 0 15 15",
                label: "Cycle Time", value: "3.2d",
                sub: "-12%", subColor: "#16a34a", trend: "down",
              },
              {
                icon: svgPaths.p5a24aa0, vb: "0 0 16.6667 16.6667",
                label: "Budget Util.", value: "74%",
                sub: null, progress: 74, trend: "progress",
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 22,
                border: "1px solid rgba(0,0,0,0.04)",
                padding: 25,
                display: "flex", flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div style={{
                  background: "rgba(232,234,228,0.3)", borderRadius: 8,
                  width: 40, height: 40,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <svg width="17" height="17" viewBox={card.vb} fill="none">
                    <path d={card.icon} fill={C.brand} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 10, color: C.text, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: C.dark, marginBottom: 4 }}>
                    {card.value}
                  </div>
                  {card.trend === "progress" ? (
                    <div style={{
                      background: "rgba(232,234,228,0.3)",
                      borderRadius: 9999, height: 6, overflow: "hidden",
                    }}>
                      <div style={{ background: C.brand, height: "100%", width: `${card.progress}%` }} />
                    </div>
                  ) : (
                    <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 10, color: card.subColor }}>
                      {card.sub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. SEAMLESS CONNECTIVITY (dark) ─────────────────────────────────────────
function ConnectionCard({
  icon, vb = "0 0 25 25", title, desc, detail1, detail2, side,
}: {
  icon: string; vb?: string; title: string; desc: string;
  detail1: string; detail2: string; side: "left" | "right";
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 24,
      padding: "32px 32px",
      display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center",
      gap: 16,
      position: "relative",
    }}>
      {/* Connection line indicator */}
      <div style={{
        position: "absolute",
        top: "50%",
        [side === "left" ? "right" : "left"]: -24,
        width: 48, height: 4,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: 48, height: 2, background: "linear-gradient(to right, transparent, rgba(199,255,53,0.3), transparent)" }} />
      </div>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        width: 64, height: 64,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="24" height="24" viewBox={vb} fill="none">
          <path d={icon} fill={C.brand} />
        </svg>
      </div>

      <h3 style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: "#fff", margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeight: 1.625, color: "rgba(255,255,255,0.4)", margin: 0 }}>
        {desc}
      </p>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 12,
        padding: "12px 16px",
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
          {detail1}
        </span>
        <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 10, color: C.accent }}>
          {detail2}
        </span>
      </div>
    </div>
  );
}

function ConnectivitySection() {
  return (
    <section style={{ background: C.bgDark, padding: "160px 0", overflow: "hidden", position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, rgba(199,255,53,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginBottom: 80 }}>
          <SectionLabel text="Seamless Connectivity" light />
          <h2 style={{
            fontFamily: "Inter", fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 48px)",
            lineHeight: 1.2, letterSpacing: "-1.2px",
            color: "#fff", textAlign: "center", margin: 0,
          }}>
            Purchasing connected directly<br />to inventory and finance
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 1fr", gap: 24, alignItems: "center" }}>
          {/* Inventory card */}
          <ConnectionCard
            icon={svgPaths.p2d4ee00}
            title="Inventory"
            desc="Real-time stock reconciliation and automated replenishment alerts."
            detail1="Stock Update"
            detail2="+250 Units"
            side="right"
          />

          {/* Center hub */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 224, height: 224,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              {/* Outer ring */}
              <div style={{
                position: "absolute", inset: -32,
                borderRadius: "50%",
                border: "1px solid rgba(199,255,53,0.05)",
              }} />
              {/* Inner ring */}
              <div style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                border: "1px solid rgba(199,255,53,0.2)", opacity: 0.2,
              }} />
              {/* Blurred circle */}
              <div style={{
                width: 224, height: 224, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.37)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 16,
                position: "relative",
              }}>
                {/* Glowing icon */}
                <div style={{
                  width: 112, height: 112,
                  borderRadius: "50%",
                  background: "rgba(199,255,53,0.1)",
                  border: "1px solid rgba(199,255,53,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="56" height="56" viewBox="0 0 60 57.5" fill="none">
                    <path d={svgPaths.p32274d80} fill={C.accent} />
                  </svg>
                </div>
                <span style={{
                  fontFamily: "Inter", fontWeight: 700, fontSize: 11,
                  color: C.accent, textTransform: "uppercase", letterSpacing: "3.3px",
                }}>Purchasing Hub</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent }} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Finance card */}
          <ConnectionCard
            icon={svgPaths.p34a70300}
            title="Finance"
            desc="Direct general ledger posting and automated accounts payable."
            detail1="Ledger Entry"
            detail2="Auto-Match"
            side="left"
          />
        </div>
      </div>
    </section>
  );
}

// ─── 6. MEASURABLE IMPACT (stats) ────────────────────────────────────────────
function StatsSection() {
  const stats = [
    {
      value: "40%",
      label: "Faster Procurement",
      desc: "Automated RFQs and approval routing reduce manual cycle times significantly.",
    },
    {
      value: "12%",
      label: "Lower Costs",
      desc: "Leverage data-driven negotiation insights to lower your average cost per unit.",
    },
    {
      value: "100%",
      label: "Compliance",
      desc: "Every transaction is logged with a full audit trail for effortless regulatory reporting.",
    },
  ];

  return (
    <section style={{ background: "#fff", padding: "96px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 64 }}>
          <SectionLabel text="Efficiency" />
          <h2 style={{
            fontFamily: "Inter", fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 48px)",
            letterSpacing: "-1.2px", color: C.dark, margin: 0, textAlign: "center",
          }}>Measurable impact on operations</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: C.bgLight,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: 41,
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 48, color: C.dark, marginBottom: 12 }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: "Inter", fontWeight: 700, fontSize: 12,
                color: C.brand, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 14,
              }}>
                {s.label}
              </div>
              <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: C.text, margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. CTA SECTION ──────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ background: C.bgDark, padding: "128px 192px", overflow: "hidden", position: "relative" }}>
      {/* Subtle glow */}
      <div style={{
        position: "absolute", bottom: -293, left: -128, right: -128, height: 586,
        background: "radial-gradient(ellipse at 50% 50%, rgba(199,255,53,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 896, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 32, position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontFamily: "Inter", fontWeight: 700,
          fontSize: "clamp(36px, 4.5vw, 48px)",
          lineHeight: 1.2, letterSpacing: "-1.2px",
          color: "#fff", textAlign: "center", margin: 0,
        }}>
          Ready to transform your<br />purchasing department?
        </h2>
        <p style={{
          fontFamily: "Inter", fontWeight: 400,
          fontSize: 20, lineHeight: 1.625,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center", margin: 0, maxWidth: 580,
        }}>
          Join the world's most efficient organizations using Bizak to manage their global supply chains.
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
          <button style={{
            background: C.accent, color: C.dark, border: "none",
            borderRadius: 4, padding: "20px 40px",
            fontFamily: "Inter", fontWeight: 700, fontSize: 18,
            cursor: "pointer", boxShadow: "0 0 20px rgba(199,255,53,0.4)",
          }}>Request Demo</button>
          <button style={{
            background: "transparent", color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4,
            padding: "20px 41px",
            fontFamily: "Inter", fontWeight: 700, fontSize: 18, cursor: "pointer",
          }}>Contact Sales</button>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function PurchasingPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <HeroSection />
      <OverviewSection />
      <TechnicalSection />
      <ProcurementIntelligenceSection />
      <ConnectivitySection />
      <StatsSection />
      <CTASection />
    </div>
  );
}