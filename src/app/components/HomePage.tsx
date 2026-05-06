import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";

const AVATAR_URL = "https://images.unsplash.com/photo-1659353221237-6a1cfb73fd90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25maWRlbnQlMjBtYWxlJTIwQ0VPJTIwZXhlY3V0aXZlJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyMTY3OTY5fDA&ixlib=rb-4.1.0&q=80&w=1080";

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroDashboard() {
  return (
    <div className="hp-dashboard-wrap">
      <div className="hp-iso">
        <div className="hp-dashboard-shell">
          <div className="hp-dashboard-inner">
            {/* Sidebar */}
            <div className="hp-sidebar">
              <div className="hp-sidebar-icon-active">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
              </div>
              {["payments","inventory_2","group","analytics"].map((icon, i) => (
                <div className="hp-sidebar-icon" key={i} style={{ position: i === 1 ? "relative" : undefined }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                  {i === 1 && (
                    <>
                      <div className="hp-hotspot-ring" style={{ top: -2, right: -2 }} />
                      <div className="hp-hotspot-dot" style={{ top: -2, right: -2 }} />
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="hp-dashboard-main">
              <div className="hp-db-topbar">
                <div className="hp-db-topbar-left" />
                <div className="hp-db-topbar-right">
                  <div className="hp-db-avatar" />
                  <div className="hp-db-btn" />
                </div>
              </div>

              {/* Chart card */}
              <div className="hp-chart-card">
                <div className="hp-chart-header">
                  <div>
                    <div className="hp-chart-label" />
                    <div className="hp-chart-amount">$242,250.00</div>
                  </div>
                  <div className="hp-chart-pills">
                    <div className="hp-chart-pill" />
                    <div className="hp-chart-pill-ghost" />
                  </div>
                </div>
                {/* Chart SVG */}
                <div className="hp-chart-area">
                  <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <path d="M0 150 C 150 140, 200 60, 400 100 S 650 20, 1000 80 V 200 H 0 Z" fill="rgba(122,130,109,0.14)" />
                    <path d="M0 150 C 150 140, 200 60, 400 100 S 650 20, 1000 80" fill="none" stroke="#7A826D" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="400" cy="100" r="6" fill="#7A826D" stroke="white" strokeWidth="2" />
                  </svg>
                  <div className="hp-hotspot-ring" style={{ left: "calc(40% - 8px)", top: "20px" }} />
                  <div className="hp-hotspot-dot" style={{ left: "calc(40% - 4px)", top: "24px" }} />
                </div>
              </div>

              {/* Mini cards row */}
              <div className="hp-mini-cards">
                <div className="hp-mini-card">
                  <div className="hp-mini-card-lines">
                    <div className="hp-mini-line" style={{ width: 72 }} />
                    <div className="hp-mini-line-dark" />
                  </div>
                  <div className="hp-mini-bars">
                    {[60,80,50,90,70,100,85].map((h,i)=>(
                      <div key={i} className="hp-mini-bar" style={{ height: `${h}%`, background: i % 2 === 0 ? "rgba(122,130,109,0.15)" : "rgba(122,130,109,0.35)", width: 6 }} />
                    ))}
                  </div>
                </div>
                <div className="hp-mini-card">
                  <div>
                    <div className="hp-mini-line" style={{ width: 56, marginBottom: 8 }} />
                    <div style={{ height: 6, width: "90%", background: "rgba(232,234,228,0.6)", borderRadius: 999, marginBottom: 4 }} />
                    <div style={{ height: 6, width: "60%", background: "rgba(232,234,228,0.6)", borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─ Floating card: Global Ledger ─ */}
        <div className="hp-float-card left hp-glass" style={{ borderRadius: 18 }}>
          <div className="hp-fc-label">
            Global Ledger Syncing
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#7A826D" }}>sync</span>
          </div>
          <div className="hp-fc-sync-row">
            <div className="hp-fc-node"><div className="hp-fc-node-code">LDN</div><div className="hp-fc-node-sub">Node 01</div></div>
            <div className="hp-sync-bar"><div className="hp-sync-bar-fill" /></div>
            <div className="hp-fc-node"><div className="hp-fc-node-code">NYC</div><div className="hp-fc-node-sub">Node 04</div></div>
          </div>
          <div className="hp-fc-meta">
            <span>TX_ID: 8829x-BZ</span>
            <span className="hp-fc-meta-live">LIVE</span>
          </div>
        </div>

        {/* ─ Floating card: Automation ─ */}
        <div className="hp-float-card right-bottom hp-glass" style={{ borderRadius: 18 }}>
          <div className="hp-auto-row">
            <div className="hp-auto-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>
            </div>
            <div>
              <div className="hp-auto-tag-label">Automation Triggered</div>
              <div className="hp-auto-title">Low Stock Alert: SK-402</div>
            </div>
          </div>
          <div className="hp-auto-action">
            <div className="hp-auto-action-row">
              <span className="hp-auto-action-key">Action</span>
              <span className="hp-auto-pill">Generating RFQ</span>
            </div>
            <div className="hp-auto-action-text">Drafting Purchase Order for Apex Logistics...</div>
          </div>
        </div>

        {/* ─ Floating card: Financial Health ─ */}
        <div className="hp-float-card bottom-center hp-glass-dark" style={{ borderRadius: 18, padding: "20px 22px" }}>
          <div className="hp-health-top">
            <span className="hp-health-label">Financial Health</span>
            <div className="hp-neon-dot" />
          </div>
          <div className="hp-health-value">98.2<span style={{ color: "#C7FF35", fontWeight: 400 }}>%</span></div>
          <div className="hp-health-sub">STABLE / OPTIMAL</div>
          <div className="hp-health-bar-bg">
            <div className="hp-health-bar-fill" />
          </div>
        </div>

        {/* ─ Floating card: Performance Metrics ─ */}
        <div className="hp-float-card top-right hp-glass" style={{ borderRadius: 18, position: "absolute" }}>
          <div className="hp-perf-header">
            <span className="hp-perf-title">Performance Metrics</span>
            <span className="hp-perf-badge">P&L</span>
          </div>
          <div className="hp-perf-grid">
            <div><div className="hp-perf-num">$242k</div><div className="hp-perf-key">Gross Revenue</div></div>
            <div><div className="hp-perf-num">$102k</div><div className="hp-perf-key">Net Margin</div></div>
          </div>
          <div className="hp-perf-connector" />
        </div>

        {/* ─ Floating card: Liquid Assets ─ */}
        <div className="hp-float-card right-small hp-glass-dark" style={{ borderRadius: 18, padding: "20px 22px" }}>
          <div className="hp-liq-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_balance_wallet</span>
          </div>
          <div className="hp-liq-value">$44.2K</div>
          <div className="hp-liq-label">Liquid Assets</div>
          <div className="hp-liq-pill">MARKET STABLE</div>
        </div>
      </div>

      {/* Trust logos */}
      <div className="hp-trust">
        <div className="hp-trust-label">Trusted by 5,000+ scaling companies</div>
        <div className="hp-logos">
          {[128,96,144,112,128].map((w, i) => (
            <div key={i} className="hp-logo-block" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hp-hero">
      <div className="hp-hero-content">
        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div className="hp-badge">
            <span className="hp-badge-new">NEW</span>
            <span className="hp-badge-dot" />
            <span>Now available for global businesses</span>
            {/* <a href="#" className="hp-badge-link">
              Learn more
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </a> */}
          </div>
        </div>
        <h1 className="hp-hero-title">The Operating System for Modern Business</h1>
        <p className="hp-hero-sub">
          A comprehensive ERP for SMEs and mid-market companies built for scale, automation, and total visibility.
        </p>
        <div className="hp-hero-btns">
          <a className="hp-btn-primary" href="https://system.bizakerp.com/account/self-register" target="blank">Start free trial</a>
          <button className="hp-btn-ghost">
            Book a demo
          </button>
        </div>
      </div>
      <div className="hp-inner">
        <HeroDashboard />
      </div>
    </section>
  );
}

// ─── MODULES ──────────────────────────────────────────────────────────────────
const MODULES = [
  {
    icon: "receipt_long",
    title: "E-Billing",
    desc: "Automated tax compliance, electronic signatures, and localized invoice templates.",
    preview: (
      <div className="hp-module-preview">
        <div className="hp-prev-row">
          <div className="hp-prev-line" style={{ width: 64 }} />
          <div className="hp-prev-line dark" style={{ width: 32 }} />
        </div>
        <div className="hp-prev-line" style={{ width: "100%", marginBottom: 4 }} />
        <div className="hp-prev-line" style={{ width: "66%" }} />
      </div>
    ),
  },
  {
    icon: "trending_up",
    title: "Advanced Sales",
    desc: "CRM-integrated pipeline management, automated quotes, and sales forecasting.",
    preview: (
      <div className="hp-module-preview">
        <div className="hp-bars">
          {[50,75,33,100].map((h,i) => (
            <div key={i} className="hp-bar" style={{ height: `${h}%`, background: i%2===0 ? "#e8eae4" : "#7A826D" }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: "shopping_cart_checkout",
    title: "Purchase & Procurement",
    desc: "RFQ automation, landed cost calculation, and vendor performance analytics.",
    preview: (
      <div className="hp-rfq-row">
        <div className="hp-rfq-btn">RFQ #01</div>
        <div className="hp-rfq-btn">RFQ #02</div>
      </div>
    ),
  },
  {
    icon: "inventory_2",
    title: "Inventory Control",
    desc: "Real-time stock tracking, multi-warehouse management, and barcode integration.",
    preview: (
      <div className="hp-module-preview">
        <div className="hp-barcode-icon">
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#e8eae4" }}>barcode_scanner</span>
        </div>
      </div>
    ),
  },
  {
    icon: "account_balance",
    title: "Finance & Accounts",
    desc: "Journal entries, bank reconciliation, and real-time P&L reporting.",
    preview: (
      <div className="hp-module-preview">
        <div className="hp-ledger">
          <div className="hp-ledger-row"><span>Debit</span><span className="debit">$12,400.00</span></div>
          <div className="hp-ledger-row"><span>Credit</span><span className="credit">$12,400.00</span></div>
        </div>
      </div>
    ),
  },
];

function ModulesSection() {
  return (
    <section className="hp-modules">
      <div className="hp-inner">
        <div className="hp-modules-header">
          <span className="hp-sub-label">Core Modules</span>
          <h2 className="hp-section-title" style={{ textAlign: "center" }}>Everything you need in one place</h2>
          <p className="hp-section-desc" style={{ textAlign: "center", marginTop: 12 }}>
            The unified infrastructure for your entire business lifecycle.
          </p>
        </div>
        <div className="hp-modules-grid">
          {MODULES.map((m) => (
            <div className="hp-module-card" key={m.title}>
              <div className="hp-module-icon">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>{m.icon}</span>
              </div>
              <div className="hp-module-title">{m.title}</div>
              <div className="hp-module-desc">{m.desc}</div>
              {m.preview}
            </div>
          ))}
          {/* CTA tile */}
          <div className="hp-module-card hp-module-dark">
            <span className="material-symbols-outlined hp-module-dark-icon">add_circle</span>
            <div className="hp-module-dark-title">Need more?</div>
            <div className="hp-module-dark-desc">Explore 20+ additional specialized modules.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function Step1Visual() {
  return (
    <div className="hp-config-card" style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <div className="hp-config-topbar">
        <div className="hp-config-topbar-left" />
        <div className="hp-toggle-on"><div className="hp-toggle-knob" /></div>
      </div>
      <div className="hp-config-rows">
        {[
          { icon: "settings_applications", label: "Global Ruleset", active: true },
          { icon: "account_tree",          label: "Node Mapping",   active: true },
          { icon: "security",              label: "Role Access",    active: false },
        ].map((row) => (
          <div key={row.label} className={`hp-config-row ${row.active ? "bg-off" : "bg-white"}`}>
            <div className="hp-config-row-left">
              <span className="material-symbols-outlined hp-config-row-icon">{row.icon}</span>
              <span className="hp-config-row-label">{row.label}</span>
            </div>
            {row.active
              ? <span className="material-symbols-outlined hp-toggle-active">toggle_on</span>
              : <div className="hp-toggle-off" />
            }
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2Visual() {
  return (
    <div className="hp-migration-card" style={{ width: "100%", maxWidth: 540, margin: "0 auto" }}>
      <div className="hp-mig-grid-bg" />
      <div className="hp-mig-glow" />

      {/* Sources */}
      <div className="hp-mig-sources">
        {[
          { icon: "corporate_fare", name: "Enterprise ERP",     sub: "Multi-cloud Instance" },
          { icon: "cloud_done",     name: "Cloud Storage",      sub: "Global Data Lakes"    },
          { icon: "database",       name: "Legacy Databases",   sub: "SQL/NoSQL Archives"   },
        ].map((s) => (
          <div className="hp-mig-source" key={s.name}>
            <div className="hp-mig-source-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div>
              <div className="hp-mig-source-name">{s.name}</div>
              <div className="hp-mig-source-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SVG stream lines */}
      <div className="hp-mig-streams">
        <svg width="100%" height="100%" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(199,255,53,0)" />
              <stop offset="30%" stopColor="rgba(199,255,53,0.18)" />
              <stop offset="100%" stopColor="rgba(199,255,53,0.5)" />
            </linearGradient>
          </defs>
          <path d="M120,68 C280,68 320,150 420,150" stroke="url(#sg)" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.3" />
          <path d="M120,150 L420,150" stroke="url(#sg)" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.3" />
          <path d="M120,232 C280,232 320,150 420,150" stroke="url(#sg)" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.3" />
        </svg>
        {/* Data packets */}
        {[
          { path: "path('M120,68 C280,68 320,150 420,150')",       delay: "0.2s",  dur: "2.5s"  },
          { path: "path('M120,68 C280,68 320,150 420,150')",       delay: "0.9s",  dur: "1.8s"  },
          { path: "path('M120,150 L420,150')",                     delay: "0.5s",  dur: "1.8s"  },
          { path: "path('M120,150 L420,150')",                     delay: "1.4s",  dur: "2.5s"  },
          { path: "path('M120,232 C280,232 320,150 420,150')",     delay: "0s",    dur: "3.5s"  },
          { path: "path('M120,232 C280,232 320,150 420,150')",     delay: "1.8s",  dur: "1.8s"  },
        ].map((p, i) => (
          <div
            key={i}
            className="hp-data-packet"
            style={{
              offsetPath: p.path,
              animation: `hp-stream ${p.dur} linear ${p.delay} infinite`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Hub */}
      <div className="hp-mig-hub">
        <div className="hp-glass-core">
          <div className="hp-mig-hub-ring-outer" />
          <div className="hp-mig-hub-ring-inner" />
          <div className="hp-glass-core-inner" />
          <div className="hp-mig-hub-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#7A826D" }}>shield_with_heart</span>
          </div>
          <div className="hp-mig-hub-badge">
            <span className="material-symbols-outlined" style={{ fontSize: 10, color: "#fff" }}>verified</span>
          </div>
        </div>
        <div className="hp-mig-hub-label">Bizak Data Core</div>
        <div className="hp-live-badge">
          <div className="hp-live-dot" />
          <span className="hp-live-text">Live Ingestion</span>
        </div>
      </div>
    </div>
  );
}

function Step3Visual() {
  return (
    <div className="hp-deploy-card" style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <div className="hp-avatar-stack">
        <div className="hp-avatar a1">JD</div>
        <div className="hp-avatar a2">SM</div>
        <div className="hp-avatar a3">AK</div>
        <div className="hp-avatar a4">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        </div>
      </div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <div className="hp-deploy-ready">Ready for Launch</div>
        <button className="hp-go-live-btn">
          Go Live Now
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rocket_launch</span>
        </button>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section className="hp-how">
      <div className="hp-inner">
        <div className="hp-how-header">
          <span className="hp-sub-label" style={{ textAlign: "center", display: "block" }}>Implementation</span>
          <h2 className="hp-section-title" style={{ textAlign: "center" }}>How Bizak Works</h2>
          <p className="hp-section-desc" style={{ textAlign: "center", marginTop: 12 }}>
            A refined transition from legacy systems to a unified workspace.
          </p>
        </div>

        <div className="hp-timeline-line" />

        {/* Step 1 */}
        <div className="hp-step">
          <div style={{ order: 2 }}>
            <Step1Visual />
          </div>
          <div style={{ order: 1 }}>
            <div className="hp-step-label">
              <div className="hp-step-num">01</div>
              <span className="hp-step-tag">Configuration</span>
            </div>
            <h3 className="hp-step-title">Instantly configure</h3>
            <p className="hp-step-desc">
              Define your organizational structure and business units with a dynamic configurator that sets up your entire infrastructure in minutes.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="hp-step">
          <div className="hp-step-text-right" style={{ order: 1 }}>
            <div className="hp-step-label" style={{ flexDirection: "row-reverse", justifyContent: "flex-end" }}>
              <div className="hp-step-num">02</div>
              <span className="hp-step-tag">Data Flow</span>
            </div>
            <h3 className="hp-step-title">Migrate your data</h3>
            <p className="hp-step-desc">
              Seamlessly transition legacy assets. Our data-stream engine maps your historical records into the Bizak cloud with zero downtime.
            </p>
          </div>
          <div style={{ order: 2 }}>
            <Step2Visual />
          </div>
        </div>

        {/* Step 3 */}
        <div className="hp-step" style={{ marginBottom: 0 }}>
          <div style={{ order: 2 }}>
            <Step3Visual />
          </div>
          <div style={{ order: 1 }}>
            <div className="hp-step-label">
              <div className="hp-step-num">03</div>
              <span className="hp-step-tag">Deployment</span>
            </div>
            <h3 className="hp-step-title">Go Live and invite Team</h3>
            <p className="hp-step-desc">
              Activate your global workspace. Seamlessly onboard your entire team with role-specific access and start operating with total clarity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ENTERPRISE BENEFITS ──────────────────────────────────────────────────────
function EnterpriseSection() {
  return (
    <section className="hp-enterprise">
      <div className="hp-inner">
        <div className="hp-enterprise-header">
          <span className="hp-sub-label" style={{ textAlign: "center", display: "block" }}>Enterprise-Grade Benefits</span>
          <h2 className="hp-section-title hp-enterprise-title" style={{ textAlign: "center" }}>
            Built for scale, speed, and absolute reliability.
          </h2>
          <p className="hp-section-desc hp-enterprise-desc" style={{ textAlign: "center", marginTop: 12 }}>
            Unlock the potential of your operations with tools designed for mid-market leaders.
          </p>
        </div>

        <div className="hp-ent-grid">
          {/* ROI Growth – wide */}
          <div className="hp-ent-card wide">
            <div className="hp-ent-icon">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>trending_up</span>
            </div>
            <h3 className="hp-ent-title">Proven ROI Growth</h3>
            <p className="hp-ent-desc">
              Experience an average of 25% reduction in operational overhead within the first 6 months.
            </p>
            <div className="hp-ent-stats">
              <div><div className="hp-ent-stat-num">25%</div><div className="hp-ent-stat-label">Cost Saved</div></div>
              <div><div className="hp-ent-stat-num white">1.4x</div><div className="hp-ent-stat-label">Output Yield</div></div>
            </div>
            <div className="hp-bar-chart">
              {[
                { h: "30%", bg: "rgba(255,255,255,0.05)" },
                { h: "45%", bg: "rgba(255,255,255,0.05)" },
                { h: "65%", bg: "rgba(122,130,109,0.22)" },
                { h: "80%", bg: "rgba(122,130,109,0.4)"  },
                { h: "100%",bg: "#C7FF35", shadow: "0 0 12px rgba(199,255,53,0.7)" },
              ].map((b, i) => (
                <div key={i} className="hp-bc-bar" style={{ height: b.h, background: b.bg, boxShadow: b.shadow }} />
              ))}
            </div>
          </div>

          {/* Productivity – narrow */}
          <div className="hp-ent-card narrow">
            <div className="hp-ent-icon">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>bolt</span>
            </div>
            <h3 className="hp-ent-title">Productivity Tools</h3>
            <p className="hp-ent-desc-sm">Integrated task management using AI to prioritize high-value operations.</p>
            <div className="hp-task-list">
              <div className="hp-task-row">
                <span className="hp-task-name">Task Automation</span>
                <span className="hp-task-status">92% Done</span>
              </div>
              <div className="hp-task-row">
                <span className="hp-task-name">Resource Sync</span>
                <span className="hp-task-active"><span className="hp-task-active-dot" />Active</span>
              </div>
              <div className="hp-task-row" style={{ opacity: 0.45 }}>
                <span className="hp-task-name">Batch Exporting</span>
                <span className="hp-task-waiting">Waiting…</span>
              </div>
            </div>
          </div>

          {/* Smart Docs – half */}
          <div className="hp-ent-card half">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="hp-ent-icon">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>description</span>
                </div>
                <h3 className="hp-ent-title">Smart Documents</h3>
                <p className="hp-ent-desc-sm">Bank-grade encryption and automated indexing for instant retrieval across departments.</p>
              </div>
              <span className="material-symbols-outlined hp-ent-folder-icon" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>folder_shared</span>
            </div>
            <div className="hp-ent-avatars">
              {[0.1, 0.15, 0.2].map((o, i) => (
                <div key={i} className="hp-ent-avatar" style={{ background: `rgba(255,255,255,${o})` }} />
              ))}
              <div className="hp-ent-avatar-count">+12</div>
            </div>
          </div>

          {/* SOC-2 – half centered */}
          <div className="hp-ent-card half center">
            <div className="hp-soc-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>verified_user</span>
            </div>
            <h3 className="hp-ent-title">SOC-2 Certified</h3>
            <p className="hp-soc-desc">
              Meeting the highest standards of enterprise security and data privacy protocols globally.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── IMPACT ───────────────────────────────────────────────────────────────────
function ImpactSection() {
  return (
    <section className="hp-impact">
      <div className="hp-inner">
        <div className="hp-impact-header">
          <span className="hp-sub-label" style={{ textAlign: "center", display: "block" }}>Impact</span>
          <h2 className="hp-section-title" style={{ textAlign: "center" }}>Proven Success Across Every Industry</h2>
          <p className="hp-section-desc" style={{ textAlign: "center", marginTop: 12 }}>
            Real numbers from companies that made the switch.
          </p>
        </div>
        <div className="hp-impact-grid">
          {/* 40% */}
          <div className="hp-impact-card">
            <div className="hp-impact-num">40%</div>
            <div className="hp-impact-title">Productivity Gain</div>
            <p className="hp-impact-desc">Average increase in operational speed reported by our mid-market partners within the first 6 months.</p>
            <div className="hp-impact-bars">
              {[20,35,50,45,75,90].map((h, i) => (
                <div key={i} className="hp-impact-bar" style={{ height: `${h}%`, background: `rgba(122,130,109,${0.1 + i * 0.1})` }} />
              ))}
            </div>
          </div>

          {/* Zero */}
          <div className="hp-impact-card">
            <div className="hp-impact-num">Zero</div>
            <div className="hp-impact-title">Paper Management</div>
            <p className="hp-impact-desc">100% cloud-native document storage with OCR capability and secure digital archiving for audit trails.</p>
            <div className="hp-impact-doc-row">
              <span className="material-symbols-outlined" style={{ color: "#7A826D", fontVariationSettings: "'FILL' 0, 'wght' 300" }}>description</span>
              <div className="hp-impact-doc-bar"><div className="hp-impact-doc-fill" /></div>
            </div>
          </div>

          {/* 24/7 */}
          <div className="hp-impact-card">
            <div className="hp-impact-num">24/7</div>
            <div className="hp-impact-title">Expert Support</div>
            <p className="hp-impact-desc">Direct access to ERP implementation experts and a dedicated account manager for enterprise plans.</p>
            <div className="hp-impact-avatars">
              {[{ bg: "#e8eae4" }, { bg: "rgba(122,130,109,0.2)" }, { bg: "rgba(122,130,109,0.4)" }].map((a, i) => (
                <div key={i} className="hp-impact-avatar" style={{ background: a.bg }} />
              ))}
              <div className="hp-impact-avatar-count">+12</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIAL ─────────────────────────────────────────────────────────────
function TestimonialSection() {
  return (
    <section className="hp-testimonial">
      <div className="hp-inner">
        <div className="hp-testimonial-inner">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 44 }}>
            <div className="hp-testimonial-source"><span>APEX</span></div>
          </div>
          <blockquote className="hp-testimonial-quote">
            "Bizak is the first ERP that actually understands the complexity of global
            operations without the typical bloat."
          </blockquote>
          <div className="hp-testimonial-avatar">
            <img src={AVATAR_URL} alt="David Richardson" />
          </div>
          <div className="hp-testimonial-name">David Richardson</div>
          <div className="hp-testimonial-role">CEO, Apex Manufacturing</div>
        </div>
      </div>
    </section>
  );
}

// ─── GLOBAL STATS ─────────────────────────────────────────────────────────────
function GlobalStatsSection() {
  return (
    <section className="hp-global">
      <div className="hp-inner">
        <div className="hp-global-separator">
          <div className="hp-separator-line" />
          <div className="hp-separator-icon">
            <span className="material-symbols-outlined" style={{ color: "#7A826D", fontSize: 24 }}>public</span>
          </div>
          <div className="hp-separator-line right" />
        </div>
        <h2 className="hp-global-title">
          Powering modern enterprises<br />across the globe
        </h2>
        <div className="hp-global-stats">
          {[
            { label: "Active businesses powered", num: "50,000+" },
            { label: "Countries supported",       num: "120+"    },
            { label: "Annual revenue managed",    num: "$50B+"   },
          ].map((s) => (
            <div key={s.label}>
              <div className="hp-global-stat-label">{s.label}</div>
              <div className="hp-global-stat-num">{s.num}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
  


 <section className="blog-newsletter">
      <div className="blog-newsletter-grid-bg" />
      <div className="blog-newsletter-glow" />
      <div style={{ position: "relative", zIndex: 10 }}>
        <h2 className="blog-newsletter-title">Get ERP insights delivered to your inbox</h2>
        <p className="blog-newsletter-sub">
          Join 5,000+ operations leaders receiving our bi-weekly breakdown of scaling
          strategies and technical innovations.
        </p>
        {submitted ? (
          <div style={{ color: "#C7FF35", fontWeight: 700, fontSize: 16, letterSpacing: "0.02em" }}>
            ✓ You're subscribed — thanks for joining!
          </div>
        ) : (
          <form className="blog-newsletter-form" onSubmit={handleSubmit}>
            <input
              className="blog-newsletter-input"
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="blog-newsletter-btn">Subscribe</button>
          </form>
        )}
        <p className="blog-newsletter-fine">Zero spam. Pure intelligence. Unsubscribe anytime.</p>
      </div>
    </section>




  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <div className="hp-page">
      <Header />
      <main style={{ paddingTop: 76, paddingLeft:24, paddingRight:24 }}>
        <HeroSection />
        <ModulesSection />
        <HowItWorksSection />
        <EnterpriseSection />
        <ImpactSection />
        <TestimonialSection />
        <GlobalStatsSection />
        {/* <FinalCTASection /> */}
      </main>
      <Footer />
    </div>
  );
}
