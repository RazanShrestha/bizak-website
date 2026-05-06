import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TIERS = [
  {
    icon: "settings_suggest",
    title: "Implementation Partners",
    desc: "Specialized in precise deployment, configuration, and data migration workflows for mid-market clients.",
    items: ["Deployment Architecture", "Technical Configuration", "User Enablement"],
  },
  {
    icon: "query_stats",
    title: "Consulting & Advisory",
    desc: "Focused on business process optimization and long-term strategic transformation initiatives.",
    items: ["Process Re-engineering", "Change Management", "ROI Strategy"],
  },
  {
    icon: "integration_instructions",
    title: "Technology & Alliances",
    desc: "For ISVs and platform builders creating integrated solutions and ecosystem extensions.",
    items: ["API Integration", "Marketplace Listing", "Co-build Programs"],
  },
];

const TOOLS = [
  { icon: "school",       name: "Certification Academy",  desc: "Tiered learning paths for architects."         },
  { icon: "support_agent",name: "Priority Concierge",      desc: "24/7 technical hotline for live deployments."  },
  { icon: "inventory_2",  name: "Marketing Vault",         desc: "High-fidelity white-label assets."             },
];

const PROFILE = [
  "Enterprise Software Strategists",
  "Specialized Implementation Firms",
  "Digital Transformation Agencies",
  "Global IT Consulting Leaders",
];

const ROADMAP = [
  {
    phase: "Phase 01",
    title: "Technical Audit",
    desc: "Deep dive into your firm's technical capabilities and alignment.",
    side: "left",
  },
  {
    phase: "Phase 02",
    title: "Ecosystem Onboarding",
    desc: "Accelerated enablement through our Master Architect program.",
    side: "right",
  },
  {
    phase: "Phase 03",
    title: "Practice Ignition",
    desc: "Joint go-to-market execution and first lighthouse project.",
    side: "left",
  },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────
function HeroVisual() {
  return (
    <div className="pp-hero-visual">
      <div className="pp-orbit-wrap">
        {/* Orbital rings */}
        <div className="pp-orbit-ring r1" />
        <div className="pp-orbit-ring r2" />

        {/* Centre neon dot */}
        <div className="pp-orbit-center pp-neon-pulse" />

        {/* Glass card – top-left */}
        <div className="pp-glass-card top-left">
          <div className="pp-glass-card-inner">
            <div className="pp-glass-icon" style={{ background: "#1A1D19" }}>
              <span className="material-symbols-outlined" style={{ color: "#C7FF35", fontSize: 20 }}>hub</span>
            </div>
            <div className="pp-glass-lines">
              <div className="pp-glass-line" style={{ width: 80, background: "rgba(51,51,51,0.1)" }} />
              <div className="pp-glass-line" style={{ width: 56, background: "rgba(51,51,51,0.06)" }} />
            </div>
          </div>
        </div>

        {/* Glass card – bottom-right */}
        <div className="pp-glass-card bottom-right">
          <div className="pp-glass-card-inner">
            <div className="pp-glass-icon" style={{ background: "rgba(122,130,109,0.15)" }}>
              <span className="material-symbols-outlined" style={{ color: "#7A826D", fontSize: 20 }}>handshake</span>
            </div>
            <div className="pp-glass-lines">
              <div className="pp-glass-line" style={{ width: 64, background: "rgba(122,130,109,0.15)" }} />
              <div className="pp-glass-line" style={{ width: 80, background: "rgba(122,130,109,0.08)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="pp-hero">
      <div className="pp-hero-inner">
        <div className="pp-hero-content">
          <span className="pp-hero-eyebrow">World Class Ecosystem</span>
          <h1 className="pp-hero-title">
            Scale with the<br />world's most<br />
            <span className="muted">precise platform.</span>
          </h1>
          <p className="pp-hero-sub">
            Join an elite network of implementation architects and strategic consultants
            redefining enterprise infrastructure through the Architecture of Partnership.
          </p>
          <div className="pp-hero-btns">
            <button className="pp-btn-neon pp-btn-neon-lg">Apply to Become a Partner</button>
            <button className="pp-btn-ghost">Speak to an Advisor</button>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

// ─── ADVANTAGES ───────────────────────────────────────────────────────────────
function AdvantagesSection() {
  return (
    <section className="pp-advantages pp-section">
      <div className="pp-inner">
        <div className="pp-advantages-header">
          <span className="pp-section-label neon">The Advantage</span>
          <h2 className="pp-section-title white">Accelerate your practice growth.</h2>
        </div>

        <div className="pp-bento-grid">
          {/* Wide card – Implementation Opportunities */}
          <div className="pp-dark-card wide">
            <div className="pp-dark-card-left">
              <div className="pp-card-icon">
                <span className="material-symbols-outlined">precision_manufacturing</span>
              </div>
              <h3 className="pp-card-title-lg">Implementation Opportunities</h3>
              <p className="pp-card-desc-lg">
                Direct access to the Bizak deal flow pipeline. Lead large-scale digital
                transformations for global mid-market enterprises.
              </p>
            </div>
            <div className="pp-dark-card-right">
              <div className="pp-mock">
                <div className="pp-mock-bar">
                  <div className="pp-mock-bar-fill-a" />
                  <div className="pp-mock-bar-fill-b" />
                </div>
                <div className="pp-mock-cols">
                  {[{ w: 28, c: "rgba(199,255,53,0.25)" }, { w: 36, c: "rgba(122,130,109,0.18)" }, { w: 20, c: "rgba(255,255,255,0.08)" }].map((col, i) => (
                    <div className="pp-mock-col" key={i}>
                      <div className="pp-mock-col-bar" style={{ width: col.w, background: col.c }} />
                    </div>
                  ))}
                </div>
                <div className="pp-mock-panel">
                  <div className="pp-mock-row-header">
                    <div className="pp-mock-tag" style={{ width: 56, background: "rgba(255,255,255,0.08)" }} />
                    <div className="pp-mock-tag" style={{ width: 28, background: "rgba(199,255,53,0.35)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
                    <div style={{ height: 4, width: "75%", background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Revenue */}
          <div className="pp-dark-card tall">
            <div>
              <div className="pp-card-icon">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="pp-card-title">Recurring Revenue</h3>
              <p className="pp-card-desc">Industry-leading commission structure designed for long-term firm sustainability.</p>
            </div>
            <div className="pp-sparkline-wrap">
              <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0,40 Q25,35 50,20 T100,5 L100,40 L0,40 Z" fill="#C7FF35" fillOpacity="0.06" />
                <path d="M0,40 Q25,35 50,20 T100,5" fill="none" stroke="#C7FF35" strokeWidth="2" strokeLinecap="round" />
                <circle className="pp-neon-pulse" cx="100" cy="5" r="2.5" fill="#C7FF35" />
              </svg>
            </div>
          </div>

          {/* Growing Market */}
          <div className="pp-dark-card tall">
            <div>
              <div className="pp-card-icon">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <h3 className="pp-card-title">Growing Market</h3>
              <p className="pp-card-desc">Tap into the +22% CAGR of cloud ERP adoption among modern enterprises.</p>
            </div>
            <div className="pp-dots-visual">
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
                <line x1="25%" y1="50%" x2="50%" y2="34%" stroke="#C7FF35" strokeWidth="1" />
                <line x1="50%" y1="34%" x2="66%" y2="74%" stroke="#C7FF35" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "25%", width: 6, height: 6, background: "rgba(199,255,53,0.4)", borderRadius: "50%" }} />
              <div className="pp-neon-pulse" style={{ position: "absolute", top: "34%", left: "50%", width: 8, height: 8, background: "#C7FF35", borderRadius: "50%", boxShadow: "0 0 10px #C7FF35" }} />
              <div style={{ position: "absolute", top: "74%", left: "66%", width: 6, height: 6, background: "rgba(199,255,53,0.3)", borderRadius: "50%" }} />
            </div>
          </div>

          {/* Modern Platform */}
          <div className="pp-dark-card tall">
            <div>
              <div className="pp-card-icon">
                <span className="material-symbols-outlined">api</span>
              </div>
              <h3 className="pp-card-title">Modern Platform</h3>
              <p className="pp-card-desc">API-first, headless architecture built for the modern technical consultant.</p>
            </div>
            <div className="pp-sync-badge">
              <div className="pp-sync-dot-row">
                <div className="pp-sync-dot pp-neon-pulse" />
                <span className="pp-sync-label">Sync Active</span>
              </div>
              <div className="pp-sync-lines">
                <div className="pp-sync-line" style={{ width: "70%" }} />
                <div className="pp-sync-line" style={{ width: "45%" }} />
              </div>
            </div>
          </div>

          {/* Partner Portal */}
          <div className="pp-dark-card pp-portal-card">
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 className="pp-card-title">Partner Portal</h3>
              <p className="pp-card-desc" style={{ marginBottom: 24 }}>
                Access all tools, training, and lead management in one central interface.
              </p>
              <button className="pp-portal-link">
                Enter Portal
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
            <div className="pp-portal-glow" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TIERS ────────────────────────────────────────────────────────────────────
function TiersSection() {
  return (
    <section className="pp-tiers pp-section">
      <div className="pp-inner">
        <div style={{ textAlign: "center" }}>
          <span className="pp-section-label olive">Collaboration Framework</span>
          <h2 className="pp-section-title dark">Partnership Tiers</h2>
          <p className="pp-tiers-sub">
            Diverse engagement models tailored to your firm's unique capabilities and strategic objectives.
          </p>
        </div>

        <div className="pp-tiers-grid">
          {TIERS.map((tier) => (
            <div className="pp-tier-card" key={tier.title}>
              <div className="pp-tier-icon">
                <span className="material-symbols-outlined">{tier.icon}</span>
              </div>
              <h4 className="pp-tier-title">{tier.title}</h4>
              <p className="pp-tier-desc">{tier.desc}</p>
              <ul className="pp-tier-list">
                {tier.items.map((item) => (
                  <li className="pp-tier-item" key={item}>
                    <span className="material-symbols-outlined pp-tier-check">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TOOLS + PROFILE ─────────────────────────────────────────────────────────
function ToolsSection() {
  return (
    <section className="pp-tools" style={{ paddingBottom: 120 }}>
      <div className="pp-inner">
        <div className="pp-tools-grid">
          {/* Left: Tool cards */}
          <div>
            <h2 className="pp-tools-title">Tools for Success</h2>
            <div className="pp-tool-cards">
              {TOOLS.map((t) => (
                <div className="pp-tool-card" key={t.name}>
                  <div className="pp-tool-icon">
                    <span className="material-symbols-outlined">{t.icon}</span>
                  </div>
                  <div>
                    <div className="pp-tool-name">{t.name}</div>
                    <div className="pp-tool-desc">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Ideal partner profile */}
          <div className="pp-profile-card">
            <div className="pp-profile-glow" />
            <h3 className="pp-profile-title">Ideal Partner Profile</h3>
            <div className="pp-profile-list">
              {PROFILE.map((name) => (
                <div className="pp-profile-item" key={name}>
                  <span className="pp-profile-name">{name}</span>
                  <span className="material-symbols-outlined pp-profile-check">check_circle</span>
                </div>
              ))}
            </div>
            <p className="pp-profile-note">
              * We currently review 15% of total partnership applications annually.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ROADMAP ──────────────────────────────────────────────────────────────────
function RoadmapSection() {
  return (
    <section className="pp-roadmap pp-section">
      <div className="pp-inner">
        <div className="pp-roadmap-header">
          <span className="pp-section-label neon">Evolution Journey</span>
          <h2 className="pp-section-title white">The Partner Roadmap</h2>
        </div>

        <div className="pp-timeline-wrap">
          <div className="pp-timeline-axis" />
          <div className="pp-timeline-steps">
            {ROADMAP.map((step, i) => (
              <div className="pp-timeline-step" key={i}>
                {/* Left column: content when side=left, phase label when side=right */}
                <div className="pp-timeline-step-left-text">
                  {step.side === "left" ? (
                    <>
                      <h4 className="pp-step-title">{step.title}</h4>
                      <p className="pp-step-desc">{step.desc}</p>
                    </>
                  ) : (
                    <span className="pp-step-phase">{step.phase}</span>
                  )}
                </div>

                {/* Centre node */}
                <div className="pp-timeline-node-wrap">
                  <div className="pp-timeline-node pp-neon-pulse" />
                </div>

                {/* Right column: phase label when side=left, content when side=right */}
                <div className="pp-timeline-step-right-text show-desktop">
                  {step.side === "right" ? (
                    <>
                      <h4 className="pp-step-title">{step.title}</h4>
                      <p className="pp-step-desc">{step.desc}</p>
                    </>
                  ) : (
                    <span className="pp-step-phase">{step.phase}</span>
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

// ─── APPLICATION FORM ─────────────────────────────────────────────────────────
function ApplicationSection() {
  const [form, setForm] = useState({ name: "", org: "", email: "", focus: "Implementation & Technical" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <section className="pp-apply pp-section" id="apply">
      <div className="pp-inner">
        <div className="pp-apply-grid">
          {/* Stats */}
          <div>
            <h2 className="pp-apply-title">
              Architect your future<br />with Bizak.
            </h2>
            <div className="pp-stat-cards">
              <div className="pp-stat-card">
                <div className="pp-stat-number">94%</div>
                <div className="pp-stat-label">Partner retention rate over 3 years.</div>
              </div>
              <div className="pp-stat-card">
                <div className="pp-stat-number olive">$2.4M</div>
                <div className="pp-stat-label">Avg. practice revenue lift in Year 2.</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="pp-form-card">
            <h4 className="pp-form-title">Ecosystem Application</h4>
            {submitted ? (
              <div className="pp-form-success">
                ✓ Application received! Our partnerships team will review and respond within 5 business days.
              </div>
            ) : (
              <form className="pp-form" onSubmit={handleSubmit}>
                <div className="pp-form-row">
                  <div className="pp-field">
                    <label className="pp-label">Principal Contact</label>
                    <input className="pp-input" type="text" placeholder="Full Name" value={form.name} onChange={set("name")} required />
                  </div>
                  <div className="pp-field">
                    <label className="pp-label">Organization</label>
                    <input className="pp-input" type="text" placeholder="Legal Entity Name" value={form.org} onChange={set("org")} required />
                  </div>
                </div>
                <div className="pp-field">
                  <label className="pp-label">Institutional Email</label>
                  <input className="pp-input" type="email" placeholder="name@firm.com" value={form.email} onChange={set("email")} required />
                </div>
                <div className="pp-field">
                  <label className="pp-label">Partnership Focus</label>
                  <select className="pp-select" value={form.focus} onChange={set("focus")}>
                    <option>Implementation &amp; Technical</option>
                    <option>Strategic Consulting</option>
                    <option>ISV &amp; Integration</option>
                  </select>
                </div>
                <button type="submit" className="pp-btn-neon pp-submit-btn">Submit Application</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="pp-final-cta">
      <h2 className="pp-final-title">Ready to lead?</h2>
      <div className="pp-final-btns">
        <button className="pp-btn-neon" style={{ padding: "20px 48px", fontSize: 17 }}>Apply for Access</button>
        <button className="pp-btn-ghost-white">Talk to Partnerships</button>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function PartnerPage() {
  return (
    <div className="pp-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <AdvantagesSection />
        <TiersSection />
        <ToolsSection />
        <RoadmapSection />
        <ApplicationSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
