import "../../styles/style.css";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Receipt,
  Building2,
  ScanLine,
  PlusCircle,
  Zap,
  FileText,
  FolderOpen,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Section,
  Container,
  SectionHeading,
  Button,
  HeroBadge,
  HeroCentered,
} from "./marketing";

const AVATAR_URL = "https://images.unsplash.com/photo-1659353221237-6a1cfb73fd90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25maWRlbnQlMjBtYWxlJTIwQ0VPJTIwZXhlY3V0aXZlJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyMTY3OTY5fDA&ixlib=rb-4.1.0&q=80&w=1080";

const LOGOS_BASE = "https://raw.githubusercontent.com/gilbarbara/logos/main/logos";
const TRUST_ROW1 = [
  { slug: "microsoft",  alt: "Microsoft"  },
  { slug: "shopify",    alt: "Shopify"    },
  { slug: "slack",      alt: "Slack"      },
  { slug: "salesforce", alt: "Salesforce" },
  { slug: "hubspot",    alt: "HubSpot"    },
  { slug: "stripe",     alt: "Stripe"     },
];
const TRUST_ROW2 = [
  { slug: "adobe",      alt: "Adobe"      },
  { slug: "oracle",     alt: "Oracle"     },
  { slug: "zoom",       alt: "Zoom"       },
  { slug: "atlassian",  alt: "Atlassian"  },
  { slug: "mailchimp",  alt: "Mailchimp"  },
  { slug: "notion",     alt: "Notion"     },
  { slug: "figma",      alt: "Figma"      },
];

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
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </div>
              {["payments","inventory_2","group","analytics"].map((icon, i) => (
                <div className={`hp-sidebar-icon ${i === 1 ? "relative" : ""}`} key={i}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  {i === 1 && (
                    <>
                      <div className="hp-hotspot-ring -top-0.5 -right-0.5" />
                      <div className="hp-hotspot-dot -top-0.5 -right-0.5" />
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
                    <path d="M0 150 C 150 140, 200 60, 400 100 S 650 20, 1000 80 V 200 H 0 Z" fill="var(--bz-sage-soft)" />
                    <path d="M0 150 C 150 140, 200 60, 400 100 S 650 20, 1000 80" fill="none" stroke="var(--bz-sage)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="400" cy="100" r="6" fill="var(--bz-sage)" stroke="white" strokeWidth="2" />
                  </svg>
                  <div className="hp-hotspot-ring left-[calc(40%-8px)] top-[20px]" />
                  <div className="hp-hotspot-dot left-[calc(40%-4px)] top-[24px]" />
                </div>
              </div>

              {/* Mini cards row */}
              <div className="hp-mini-cards">
                <div className="hp-mini-card">
                  <div className="hp-mini-card-lines">
                    <div className="hp-mini-line w-[72px]" />
                    <div className="hp-mini-line-dark" />
                  </div>
                  <div className="hp-mini-bars">
                    {[60,80,50,90,70,100,85].map((h,i)=>(
                      <div
                        key={i}
                        className={`hp-mini-bar w-1.5 ${i % 2 === 0 ? "bg-[rgba(122,130,109,0.15)]" : "bg-[rgba(122,130,109,0.35)]"}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="hp-mini-card">
                  <div>
                    <div className="hp-mini-line w-14 mb-2" />
                    <div className="h-1.5 w-[90%] bg-[rgba(232,234,228,0.6)] rounded-full mb-1" />
                    <div className="h-1.5 w-[60%] bg-[rgba(232,234,228,0.6)] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─ Floating card: Global Ledger ─ */}
        <div className="hp-float-card left hp-glass rounded-[18px]">
          <div className="hp-fc-label">
            Global Ledger Syncing
            <span className="material-symbols-outlined text-bz-sage text-[16px]">sync</span>
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
        <div className="hp-float-card right-bottom hp-glass rounded-[18px]">
          <div className="hp-auto-row">
            <div className="hp-auto-icon">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
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
        <div className="hp-float-card bottom-center hp-glass-dark rounded-[18px] px-[22px] py-5">
          <div className="hp-health-top">
            <span className="hp-health-label">Financial Health</span>
            <div className="hp-neon-dot" />
          </div>
          <div className="hp-health-value">98.2<span className="text-bz-accent font-normal">%</span></div>
          <div className="hp-health-sub">STABLE / OPTIMAL</div>
          <div className="hp-health-bar-bg">
            <div className="hp-health-bar-fill" />
          </div>
        </div>

        {/* ─ Floating card: Performance Metrics ─ */}
        <div className="hp-float-card top-right hp-glass rounded-[18px] absolute">
          <div className="hp-perf-header">
            <span className="hp-perf-title">Performance Metrics</span>
            <span className="hp-perf-badge">P&amp;L</span>
          </div>
          <div className="hp-perf-grid">
            <div><div className="hp-perf-num">$242k</div><div className="hp-perf-key">Gross Revenue</div></div>
            <div><div className="hp-perf-num">$102k</div><div className="hp-perf-key">Net Margin</div></div>
          </div>
          <div className="hp-perf-connector" />
        </div>

        {/* ─ Floating card: Liquid Assets ─ */}
        <div className="hp-float-card right-small hp-glass-dark rounded-[18px] px-[22px] py-5">
          <div className="hp-liq-icon">
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
          </div>
          <div className="hp-liq-value">$44.2K</div>
          <div className="hp-liq-label">Liquid Assets</div>
          <div className="hp-liq-pill">MARKET STABLE</div>
        </div>
      </div>

      {/* Trust logos */}
      <div className="hp-trust">
        <div className="hp-trust-label">Trusted by the businesses.</div>
        <div className="hp-marquee-wrap">
          <div className="hp-marquee-row">
            <div className="hp-marquee-track">
              {[...TRUST_ROW1, ...TRUST_ROW2, ...TRUST_ROW1, ...TRUST_ROW2].map(({ slug, alt }, i) => (
                <img
                  key={`${slug}-${i}`}
                  src={`${LOGOS_BASE}/${slug}.svg`}
                  alt={alt}
                  className="hp-logo-block"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <HeroCentered
      badge={<HeroBadge>Now live, worldwide.</HeroBadge>}
      title={<>Your Business.<br className="sm:hidden" /> Your Way.</>}
      description="Built around your business, not the other way around. One platform that works the way you do."
      actions={
        <>
          <Button
            variant="primary"
            size="lg"
            href="https://system.bizakerp.com/account/self-register"
            target="_blank"
            rel="noreferrer"
          >
            Start free trial
          </Button>
          <Button variant="outline" size="lg">Book a demo</Button>
        </>
      }
      visual={<HeroDashboard />}
    />
  );
}

// ─── MODULES ──────────────────────────────────────────────────────────────────
const MODULES = [
  {
    Icon: Receipt,
    title: "E-Billing",
    desc: "Automated tax compliance, electronic signatures, and localized invoice templates.",
    preview: (
      <div className="hp-module-preview">
        <div className="hp-prev-row">
          <div className="hp-prev-line w-16" />
          <div className="hp-prev-line dark w-8" />
        </div>
        <div className="hp-prev-line w-full mb-1" />
        <div className="hp-prev-line w-2/3" />
      </div>
    ),
  },
  {
    Icon: TrendingUp,
    title: "Advanced Sales",
    desc: "CRM-integrated pipeline management, automated quotes, and sales forecasting.",
    preview: (
      <div className="hp-module-preview">
        <div className="hp-bars">
          {[50,75,33,100].map((h,i) => (
            <div
              key={i}
              className={`hp-bar ${i % 2 === 0 ? "bg-bz-border" : "bg-bz-sage"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    Icon: ShoppingCart,
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
    Icon: Package,
    title: "Inventory Control",
    desc: "Real-time stock tracking, multi-warehouse management, and barcode integration.",
    preview: (
      <div className="hp-module-preview">
        <div className="hp-barcode-icon">
          <ScanLine size={40} strokeWidth={1.5} className="text-bz-border" />
        </div>
      </div>
    ),
  },
  {
    Icon: Building2,
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
    <Section tone="white" pad="compact">
      <Container>
        <SectionHeading
          eyebrow="Core Modules"
          title="Everything you need in one place"
          description="The unified infrastructure for your entire business lifecycle."
          align="center"
          maxWidth={640}
          className="mb-12"
        />
        <div className="hp-modules-grid">
          {MODULES.map((m) => (
            <div className="hp-module-card" key={m.title}>
              <div className="hp-module-icon">
                <m.Icon size={22} strokeWidth={1.6} />
              </div>
              <div className="hp-module-title">{m.title}</div>
              <div className="hp-module-desc">{m.desc}</div>
              {m.preview}
            </div>
          ))}
          {/* CTA tile */}
          <div className="hp-module-card hp-module-dark">
            <PlusCircle size={40} strokeWidth={1.5} className="hp-module-dark-icon" />
            <div className="hp-module-dark-title">Need more?</div>
            <div className="hp-module-dark-desc">Explore 20+ additional specialized modules.</div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function Step1Visual() {
  return (
    <div className="hp-config-card w-full max-w-[420px] mx-auto">
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
    <div className="hp-migration-card w-full max-w-[540px] mx-auto">
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
              <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
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
            <span className="material-symbols-outlined text-bz-sage text-[28px]">shield_with_heart</span>
          </div>
          <div className="hp-mig-hub-badge">
            <span className="material-symbols-outlined text-white text-[10px]">verified</span>
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
    <div className="hp-deploy-card w-full max-w-[420px] mx-auto">
      <div className="hp-avatar-stack">
        <div className="hp-avatar a1">JD</div>
        <div className="hp-avatar a2">SM</div>
        <div className="hp-avatar a3">AK</div>
        <div className="hp-avatar a4">
          <span className="material-symbols-outlined text-[18px]">add</span>
        </div>
      </div>
      <div className="w-full text-center">
        <div className="hp-deploy-ready">Ready for Launch</div>
        <button className="hp-go-live-btn">
          Go Live Now
          <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
        </button>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <Section tone="white" pad="compact" className="overflow-hidden">
      <Container className="relative">
        <SectionHeading
          eyebrow="Implementation"
          title="How Bizak Works"
          description="A refined transition from legacy systems to a unified workspace."
          align="center"
          maxWidth={640}
          className="mb-20"
        />

        <div className="hp-timeline-line" />

        {/* Step 1 */}
        <div className="hp-step">
          <div className="order-2">
            <Step1Visual />
          </div>
          <div className="order-1">
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
          <div className="hp-step-text-right order-1">
            <div className="hp-step-label">
              <div className="hp-step-num">02</div>
              <span className="hp-step-tag">Data Flow</span>
            </div>
            <h3 className="hp-step-title">Migrate your data</h3>
            <p className="hp-step-desc">
              Seamlessly transition legacy assets. Our data-stream engine maps your historical records into the Bizak cloud with zero downtime.
            </p>
          </div>
          <div className="order-2">
            <Step2Visual />
          </div>
        </div>

        {/* Step 3 */}
        <div className="hp-step !mb-0">
          <div className="order-2">
            <Step3Visual />
          </div>
          <div className="order-1">
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
      </Container>
    </Section>
  );
}

// ─── ENTERPRISE BENEFITS ──────────────────────────────────────────────────────
function EnterpriseSection() {
  return (
    <Section tone="dark" pad="compact" className="overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="Enterprise-Grade Benefits"
          eyebrowTone="accent"
          title="Built for scale, speed, and absolute reliability."
          description="Unlock the potential of your operations with tools designed for mid-market leaders."
          tone="light"
          align="center"
          maxWidth={720}
          className="mb-12"
        />

        <div className="hp-ent-grid">
          {/* ROI Growth – wide */}
          <div className="hp-ent-card wide">
            <div className="hp-ent-icon">
              <TrendingUp size={20} strokeWidth={1.5} />
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
                { h: "30%",  bg: "rgba(255,255,255,0.05)" },
                { h: "45%",  bg: "rgba(255,255,255,0.05)" },
                { h: "65%",  bg: "rgba(122,130,109,0.22)" },
                { h: "80%",  bg: "rgba(122,130,109,0.4)"  },
                { h: "100%", bg: "var(--bz-accent)", shadow: "0 0 12px rgba(199,255,53,0.7)" },
              ].map((b, i) => (
                <div key={i} className="hp-bc-bar" style={{ height: b.h, background: b.bg, boxShadow: b.shadow }} />
              ))}
            </div>
          </div>

          {/* Productivity – narrow */}
          <div className="hp-ent-card narrow">
            <div className="hp-ent-icon">
              <Zap size={20} strokeWidth={1.5} />
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
              <div className="hp-task-row opacity-45">
                <span className="hp-task-name">Batch Exporting</span>
                <span className="hp-task-waiting">Waiting…</span>
              </div>
            </div>
          </div>

          {/* Smart Docs – half */}
          <div className="hp-ent-card half">
            <div className="flex justify-between items-start">
              <div>
                <div className="hp-ent-icon">
                  <FileText size={20} strokeWidth={1.5} />
                </div>
                <h3 className="hp-ent-title">Smart Documents</h3>
                <p className="hp-ent-desc-sm">Bank-grade encryption and automated indexing for instant retrieval across departments.</p>
              </div>
              <FolderOpen size={56} strokeWidth={1.2} className="hp-ent-folder-icon" />
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
              <ShieldCheck size={28} strokeWidth={1.4} />
            </div>
            <h3 className="hp-ent-title">SOC-2 Certified</h3>
            <p className="hp-soc-desc">
              Meeting the highest standards of enterprise security and data privacy protocols globally.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── IMPACT ───────────────────────────────────────────────────────────────────
function ImpactSection() {
  return (
    <Section tone="white" pad="compact">
      <Container>
        <SectionHeading
          eyebrow="Impact"
          title="Proven Success Across Every Industry"
          description="Real numbers from companies that made the switch."
          align="center"
          maxWidth={640}
          className="mb-12"
        />
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
              <FileText size={20} strokeWidth={1.5} className="text-bz-sage" />
              <div className="hp-impact-doc-bar"><div className="hp-impact-doc-fill" /></div>
            </div>
          </div>

          {/* 24/7 */}
          <div className="hp-impact-card">
            <div className="hp-impact-num">24/7</div>
            <div className="hp-impact-title">Expert Support</div>
            <p className="hp-impact-desc">Direct access to ERP implementation experts and a dedicated account manager for enterprise plans.</p>
            <div className="hp-impact-avatars">
              {[
                "bg-bz-border",
                "bg-[rgba(122,130,109,0.2)]",
                "bg-[rgba(122,130,109,0.4)]",
              ].map((bg, i) => (
                <div key={i} className={`hp-impact-avatar ${bg}`} />
              ))}
              <div className="hp-impact-avatar-count">+12</div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── TESTIMONIAL ─────────────────────────────────────────────────────────────
function TestimonialSection() {
  return (
    <Section tone="white" pad="compact">
      <Container>
        <div className="hp-testimonial-inner">
          <div className="flex justify-center mb-11">
            <div className="hp-testimonial-source"><span>APEX</span></div>
          </div>
          <blockquote className="hp-testimonial-quote">
            &ldquo;Bizak is the first ERP that actually understands the complexity of global
            operations without the typical bloat.&rdquo;
          </blockquote>
          <div className="hp-testimonial-avatar">
            <img src={AVATAR_URL} alt="David Richardson" />
          </div>
          <div className="hp-testimonial-name">David Richardson</div>
          <div className="hp-testimonial-role">CEO, Apex Manufacturing</div>
        </div>
      </Container>
    </Section>
  );
}

// ─── GLOBAL STATS ─────────────────────────────────────────────────────────────
function GlobalStatsSection() {
  return (
    <Section tone="white" pad="compact">
      <Container>
        <div className="hp-global-separator">
          <div className="hp-separator-line" />
          <div className="hp-separator-icon">
            <Globe size={24} strokeWidth={1.6} />
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
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function HomePage() {
  return (
    <div className="hp-page">
      <Header />
      <main>
        <HeroSection />
        <ModulesSection />
        <HowItWorksSection />
        <EnterpriseSection />
        <ImpactSection />
        <TestimonialSection />
        <GlobalStatsSection />
      </main>
      <Footer />
    </div>
  );
}
