import React from "react";
 import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── HERO ─────────────────────────────────────────────────────────────────────
function ExcelSide() {
  const rows = [
    [{ t: "INV_01", cls: "" }, { t: "Missing", cls: "error" }, { t: "$2,400", cls: "" }, { t: "Pending", cls: "" }, { t: "Manual", cls: "" }],
    [{ t: "INV_02", cls: "" }, { t: "Shipment", cls: "" }, { t: "#REF!", cls: "error" }, { t: "Delayed", cls: "" }, { t: "Manual", cls: "" }],
    [{ t: "INV_03", cls: "" }, { t: "Warehouse", cls: "" }, { t: "$12,000", cls: "" }, { t: "Overstock", cls: "" }, { t: "Broken", cls: "" }],
    [{ t: "INV_04", cls: "" }, { t: "Pending", cls: "" }, { t: "$400", cls: "" }, { t: "In Review", cls: "" }, { t: "Manual", cls: "" }],
  ];
  const dots = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="wb-excel-side">
      <div className="wb-excel-topbar">
        <div className="wb-excel-tabs">
          {[0,1,2].map(i => <div className="wb-excel-tab" key={i} />)}
        </div>
        <span className="wb-excel-error">#REF! ERROR</span>
      </div>
      <div className="wb-excel-grid">
        {/* Header row */}
        <div className="wb-cell header">A1</div>
        <div className="wb-cell header">Data</div>
        <div className="wb-cell header">#VAL</div>
        <div className="wb-cell header">10/22</div>
        <div className="wb-cell header">ERR</div>
        {dots.map(i => <div className="wb-cell header" key={i}>...</div>)}

        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "contents" }}>
            {row.map((cell, ci) => (
              <div key={ci} className={`wb-cell ${cell.cls}`}>{cell.t}</div>
            ))}
            {dots.map(i => <div className="wb-cell" key={i}>...</div>)}
          </div>
        ))}

        <div className="wb-cell span10">Manual Data Entry Hell</div>
      </div>
    </div>
  );
}

function BizakSide() {
  return (
    <div className="wb-bizak-side">
      <div className="wb-bizak-topbar">
        <div className="wb-bizak-brand">
          <div className="wb-bizak-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
          </div>
          <div className="wb-bizak-topbar-line" />
        </div>
        <div className="wb-live-badge">
          <div className="wb-live-dot" />
          <span className="wb-live-text">System Live</span>
        </div>
      </div>

      <div className="wb-revenue-card">
        <div className="wb-revenue-label">Real-time Revenue</div>
        <div className="wb-revenue-value">$242,250.00</div>
        <div className="wb-chart-area">
          <svg width="100%" height="100%" viewBox="0 0 400 100">
            <path d="M0 80 Q 50 20 100 60 T 200 40 T 300 10 T 400 30 V 100 H 0 Z" fill="rgba(199,255,53,0.06)" />
            <path d="M0 80 Q 50 20 100 60 T 200 40 T 300 10 T 400 30" fill="none" stroke="#C7FF35" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="wb-mini-row">
        <div className="wb-mini-card">
          <div>
            <div className="wb-mini-label">Inventory</div>
            <div className="wb-mini-value">98.2% Optimal</div>
          </div>
        </div>
        <div className="wb-mini-card">
          <span className="material-symbols-outlined wb-sync-icon">autorenew</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(51,51,51,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Syncing…</span>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="wb-hero">
      <div className="wb-inner">
        {/* Text */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div className="wb-hero-badge">Transition from Chaos to Control</div>
          </div>
          <h1 className="wb-hero-title">Still running your business on Excel?</h1>
          <p className="wb-hero-sub">
            Move beyond brittle spreadsheets. Bizak is the unified platform for modern enterprises to
            automate operations, finances, and scale without the manual errors.
          </p>
          <div className="wb-hero-btns">
            <button className="wb-btn-dark">Book a Demo</button>
            <button className="wb-btn-outline">See How Bizak Works</button>
          </div>
        </div>

        {/* Comparison split */}
        <div className="wb-comparison">
          <ExcelSide />
          <BizakSide />
          <div className="wb-split-glow" />
        </div>
      </div>
    </section>
  );
}

// ─── PAIN POINTS ──────────────────────────────────────────────────────────────
const PAINS = [
  {
    icon: "warning",
    color: "red",
    title: "Manual Data Entry",
    desc: "Wasting hours on data input that could be automated, leading to inevitable human errors and typos.",
  },
  {
    icon: "hourglass_empty",
    color: "orange",
    title: "Slow Reports",
    desc: "Waiting days or weeks for consolidated reports that are already outdated by the time they reach your desk.",
  },
  {
    icon: "link_off",
    color: "slate",
    title: "Disconnected Silos",
    desc: "Finance doesn't see Inventory, and Sales doesn't see fulfillment. Total lack of cross-department visibility.",
  },
];

function PainPointsSection() {
  return (
    <section className="wb-pain">
      <div className="wb-inner">
        <div className="wb-pain-header">
          <span className="wb-sub-label" style={{ textAlign: "center", display: "block" }}>The Cost of Inefficiency</span>
          <h2 className="wb-section-title" style={{ textAlign: "center" }}>Why spreadsheets fail your business</h2>
        </div>
        <div className="wb-pain-grid">
          {PAINS.map((p) => (
            <div className="wb-pain-card" key={p.title}>
              <div className={`wb-pain-icon ${p.color}`}>
                <span className="material-symbols-outlined">{p.icon}</span>
              </div>
              <div className="wb-pain-title">{p.title}</div>
              <p className="wb-pain-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SOLUTION ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "inventory_2", title: "Real-time Inventory", desc: "Automated stock tracking across multiple warehouses with AI demand forecasting.", active: true },
  { icon: "account_balance", title: "Unified Finance", desc: "Automated general ledger, tax compliance, and multi-currency reconciliation.", active: false },
  { icon: "bolt", title: "Process Automation", desc: "Eliminate repetitive tasks with custom workflow triggers and smart approvals.", active: false },
];

function VizPanel() {
  const streams = [
    { path: "path('M60,80 L440,80')", delay: "0s",   dur: "2.5s" },
    { path: "path('M60,80 L440,80')", delay: "0.8s",  dur: "2.5s" },
    { path: "path('M60,80 L440,80')", delay: "1.6s",  dur: "2.5s" },
  ];

  return (
    <div className="wb-viz-panel">
      <div className="wb-viz-glow" />

      {/* Finance card */}
      <div className="wb-finance-card">
        <div className="wb-fc-header">
          <span className="wb-fc-label">Financial Health</span>
          <div className="wb-fc-live">
            <div className="wb-fc-neon-dot" />
            <span className="wb-fc-live-text">Live Ingestion</span>
          </div>
        </div>
        <div className="wb-fc-amount">
          <div className="wb-fc-num">$1,420,500<span className="dim">.00</span></div>
          <div className="wb-fc-pct">+12.4%</div>
        </div>
        <div className="wb-fc-bar-bg">
          <div className="wb-fc-bar-fill" />
        </div>
        <div className="wb-fc-sparkline">
          <svg width="100%" height="100%" viewBox="0 0 400 100">
            <path
              d="M0 80 Q 50 40 100 70 T 200 50 T 300 20 T 400 40"
              fill="none"
              stroke="#C7FF35"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Stream row */}
      <div className="wb-stream-row">
        {/* Source */}
        <div className="wb-stream-source">
          <div className="wb-stream-source-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>table</span>
          </div>
          <div className="wb-stream-source-label">Legacy Excel</div>
        </div>

        {/* SVG dashed path + data packets */}
        <div className="wb-stream-svg">
          <svg width="100%" height="100%" viewBox="0 0 500 160">
            <path d="M60,80 L440,80" stroke="rgba(199,255,53,0.14)" strokeDasharray="4 4" strokeWidth="1" />
          </svg>
          {streams.map((s, i) => (
            <div
              key={i}
              className="wb-data-packet"
              style={{
                offsetPath: s.path,
                animation: `wb-stream ${s.dur} linear ${s.delay} infinite`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Hub */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 20 }}>
          <div className="wb-stream-hub">
            <div className="wb-stream-hub-ring" />
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>rocket_launch</span>
          </div>
          <div className="wb-stream-hub-label">Bizak Core</div>
        </div>
      </div>
    </div>
  );
}

function SolutionSection() {
  return (
    <section className="wb-solution">
      <div className="wb-inner">
        <div className="wb-solution-header">
          <span className="wb-sub-label" style={{ textAlign: "center", display: "block" }}>The Solution</span>
          <h2 className="wb-section-title" style={{ textAlign: "center" }}>Bizak replaces spreadsheets</h2>
          <p className="wb-section-desc" style={{ textAlign: "center", marginTop: 14, maxWidth: 560, margin: "14px auto 0" }}>
            One unified platform that connects every aspect of your enterprise operations with intelligent automation.
          </p>
        </div>
        <div className="wb-solution-grid">
          {/* Feature list */}
          <div className="wb-feature-list">
            {FEATURES.map((f) => (
              <div key={f.title} className={`wb-feature-card ${f.active ? "active" : ""}`}>
                <div className="wb-feature-header">
                  <div className={`wb-feature-icon ${f.active ? "dark" : "light"}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{f.icon}</span>
                  </div>
                  <span className="wb-feature-title">{f.title}</span>
                </div>
                <p className="wb-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Dark visualization */}
          <VizPanel />
        </div>
      </div>
    </section>
  );
}

// ─── COMPARISON TABLE ─────────────────────────────────────────────────────────
const MANUAL_ITEMS = [
  { title: "Fragmented Data",      desc: "Values scattered across 50+ different files."          },
  { title: "Reactive Operations",  desc: "Finding out you're out of stock after the sale."       },
  { title: "Security Risks",       desc: "Critical sheets stored on local desktops."             },
];

const BIZAK_ITEMS = [
  { title: "Single Source of Truth", desc: "Every department views the same real-time data."         },
  { title: "Predictive Insights",    desc: "Anticipate bottlenecks before they happen."              },
  { title: "Enterprise Security",    desc: "SOC-2 compliant with role-based permissions."            },
];

function ComparisonSection() {
  return (
    <section className="wb-compare">
      <div className="wb-inner" style={{ maxWidth: 900 }}>
        <div className="wb-compare-header">
          <span className="wb-sub-label" style={{ textAlign: "center", display: "block" }}>The Transition</span>
          <h2 className="wb-section-title" style={{ textAlign: "center" }}>Manual Excel vs Automated Workflows</h2>
        </div>
        <div className="wb-compare-grid">
          {/* Manual col */}
          <div className="wb-compare-col manual">
            <div className="wb-compare-col-title muted">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
              Traditional Manual
            </div>
            <div className="wb-compare-items">
              {MANUAL_ITEMS.map((item) => (
                <div className="wb-compare-item" key={item.title}>
                  <span className="material-symbols-outlined wb-compare-icon bad">close</span>
                  <div>
                    <div className="wb-compare-item-title">{item.title}</div>
                    <div className="wb-compare-item-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bizak col */}
          <div className="wb-compare-col bizak">
            <div className="wb-compare-col-title active">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#C7FF35" }}>verified</span>
              Bizak Automated
            </div>
            <div className="wb-compare-items">
              {BIZAK_ITEMS.map((item) => (
                <div className="wb-compare-item" key={item.title}>
                  <span className="material-symbols-outlined wb-compare-icon good">check_circle</span>
                  <div>
                    <div className="wb-compare-item-title">{item.title}</div>
                    <div className="wb-compare-item-desc">{item.desc}</div>
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

// ─── STATS ────────────────────────────────────────────────────────────────────
const STATS = [
  { num: "70%",  label: "Reduction in Work",  desc: "Average decrease in manual administrative tasks reported by Bizak users." },
  { num: "3.5x", label: "Faster Audits",       desc: "Consolidate quarterly and annual financial data in a fraction of the time." },
  { num: "99.9%",label: "Accuracy Rate",       desc: "Eliminate the manual errors that cost traditional enterprises thousands." },
   { num: "98.9%",label: "Compliance Improvement",       desc: "focuses on regulatory or standards adherence." },
];

function StatsSection() {
  return (
    <section className="wb-stats">
      <div className="wb-stats-inner">
        <div className="wb-stats-grid">
          {STATS.map((s) => (
            <div className="wb-stat-card" key={s.label}>
              <div className="wb-stat-num">{s.num}</div>
              <div className="wb-stat-label">{s.label}</div>
              <p className="wb-stat-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="wb-trust-label">Trusted by scaling market leaders</div>
        <div className="wb-logos">
          {[128, 96, 144, 112, 128].map((w, i) => (
            <div key={i} className="wb-logo-block" style={{ width: w }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    // <section className="wb-cta">
    //   <div className="wb-inner" style={{ maxWidth: 1100 }}>
    //     <div className="wb-cta-card">
    //       <div className="wb-cta-glow" />
    //       <h2 className="wb-cta-title">Stop managing your business in spreadsheets</h2>
    //       <p className="wb-cta-sub">
    //         Join over 5,000+ scaling companies that have graduated from Excel to the Bizak ERP ecosystem.
    //         Automate your operations today.
    //       </p>
    //       <div className="wb-cta-btns">
    //         <button className="wb-btn-neon">Schedule Demo</button>
    //         <button className="wb-btn-ghost-white">View Pricing</button>
    //       </div>
    //     </div>
    //   </div>
    // </section>




 <section className="hp-final-cta">
      <div className="hp-cta-glow-center" />
      <div className="hp-cta-glow-right" />
      <div className="hp-inner">
        <div className="hp-cta-inner">
          <h2 className="hp-cta-title">Stop managing your business in spreadsheets</h2>
          <p className="hp-cta-sub">
             Join over 5,000+ scaling companies that have graduated from Excel to the Bizak ERP ecosystem.
          Automate your operations today.
          </p>
          <div className="hp-cta-btns">
            <button className="hp-cta-btn-primary">Schedule Demo</button>
            <button className="hp-cta-btn-outline">View Pricing</button>
          </div>
        </div>
      </div>
    </section>




  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function WhyBizakPage() {
  return (
    <div className="wb-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <PainPointsSection />
        <SolutionSection />
        <ComparisonSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}