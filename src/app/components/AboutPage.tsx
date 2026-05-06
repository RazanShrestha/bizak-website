// import "./about-page.css";
import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// ─── Icon Helper (lucide-style SVG inline) ────────────────────────────────────
function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const d: Record<string, string> = {
    architecture:
      "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    terminal:
      "M4 17l6-6-6-6 M12 19h8",
    globe:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a14.5 14.5 0 0 1 0 20 14.5 14.5 0 0 1 0-20",
    person:
      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    shield:
      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    settings:
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
    bell:
      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    "check-circle":
      "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
    "map-pin":
      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    flag:
      "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7",
    wallet:
      "M20 12V7H4v13h16v-5 M20 12a2 2 0 0 1 0 4H14a2 2 0 0 1 0-4h6z",
    verified:
      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
    components:
      "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  };
  const paths = d[name];
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
    >
      {paths?.split(" M ").map((segment, i) => (
        <path key={i} d={i === 0 ? segment : "M " + segment} />
      ))}
    </svg>
  );
}

// ─── Hero / Dashboard Section ─────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="about-hero about-mesh">
      {/* ambient glow blobs */}
      <div className="about-hero-glow-1" />
      <div className="about-hero-glow-2" />

      <div className="about-container" style={{ position: "relative", zIndex: 20 }}>
        {/* headline */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 className="about-hero-title">
            Crafting the Future of Enterprise Control
          </h1>
          <p className="about-hero-sub">
            Bizak was founded on the belief that complexity shouldn't be the cost of
            growth. We're building the world's most precise operating system for
            modern business.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="about-dashboard-frame">
          {/* Main panel */}
          <div className="about-dashboard-panel">
            {/* Top-bar */}
            <div className="about-db-topbar">
              <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#333", letterSpacing: "-0.02em" }}>
                  bizak
                </span>
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { label: "Dashboard", active: false },
                    { label: "Analytics", active: true },
                    { label: "Transactions", active: false },
                  ].map((t) => (
                    <span
                      key={t.label}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: t.active ? "#7A826D" : "rgba(51,51,51,0.38)",
                        borderBottom: t.active ? "2px solid #7A826D" : "none",
                        paddingBottom: t.active ? 4 : 0,
                      }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e5e7eb" }} />
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8eae4" }} />
              </div>
            </div>

            {/* Body */}
            <div className="about-db-body">
              {/* Main chart card */}
              <div className="about-db-main-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 20 }}>
                      Performance Metrics
                    </div>
                    <div style={{ display: "flex", gap: 36 }}>
                      {[
                        { val: "242,250", lbl: "Gross Revenue" },
                        { val: "140,000", lbl: "Operations" },
                        { val: "102,250", lbl: "Net Margin" },
                      ].map((s, i) => (
                        <div key={s.lbl} className="about-count" style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className="about-db-stat-val">{s.val}</div>
                          <div className="about-db-stat-label">{s.lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", background: "#f9fafa", borderRadius: 8, padding: 4 }}>
                    {["P&L", "Growth"].map((t, i) => (
                      <button
                        key={t}
                        style={{
                          padding: "6px 14px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          background: i === 0 ? "#fff" : "transparent",
                          color: i === 0 ? "#333" : "#666",
                          boxShadow: i === 0 ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div style={{ marginTop: 28, height: 160, width: "100%" }}>
                  <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="aboutChartGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#7A826D" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#7A826D" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 160 Q 100 120, 200 140 T 400 100 T 600 150 T 800 80 L 800 200 L 0 200 Z"
                      fill="url(#aboutChartGrad)"
                    />
                    <path
                      className="about-draw"
                      d="M0 160 Q 100 120, 200 140 T 400 100 T 600 150 T 800 80"
                      fill="none"
                      stroke="#7A826D"
                      strokeWidth="3"
                      strokeDasharray="1000"
                      strokeDashoffset="1000"
                    />
                    {/* Data points */}
                    {([[200,140],[400,100],[600,150],[800,80]] as [number,number][]).map(([cx,cy]) => (
                      <circle key={cx} cx={cx} cy={cy} r="5" fill="#C7FF35" stroke="#7A826D" strokeWidth="2" />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Side column */}
              <div className="about-db-side">
                {/* Wallet card */}
                <div className="about-db-wallet">
                  <div style={{ position: "absolute", top: 8, right: 12, opacity: 0.08, fontSize: 56, color: "#fff", fontWeight: 900, lineHeight: 1 }}>
                    $
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.85)" }}>
                      <Icon name="wallet" size={18} />
                    </div>
                  </div>
                  <div className="about-count" style={{ animationDelay: "0.3s" }}>
                    <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}>44.2K</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                      Liquid Assets
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: 99, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>
                      Market Stable
                    </div>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="about-db-recent">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666" }}>Recent</span>
                    <span style={{ fontSize: 18, color: "#d1d5db", fontWeight: 400 }}>···</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { name: "Global Logistics Inc.", amount: "$12,450", neon: true },
                      { name: "Apex Retail Group",     amount: "$8,200",  neon: false },
                    ].map((r) => (
                      <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: r.neon ? "#C7FF35" : "#e5e7eb",
                          boxShadow: r.neon ? "0 0 8px #C7FF35" : "none",
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 500, color: "#333", flex: 1 }}>{r.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#666" }}>{r.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating widget: Action Center ── */}
          <div
            className="about-widget about-glass-widget about-float"
            style={{ top: -32, left: -24 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>
                Action Center
              </span>
              <div className="about-neon-dot about-pulse-neon" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: "flag",  title: "0 Orders Pending", sub: "Requires approval" },
                { icon: "check-circle", title: "1 Invoice Due", sub: "Payable within 48h" },
              ].map((a) => (
                <div key={a.title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: "#F8F9F7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", flexShrink: 0 }}>
                    <Icon name={a.icon} size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#333" }}>{a.title}</div>
                    <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Floating widget: Daily Logistics ── */}
          <div
            className="about-widget about-glass-widget about-float-delayed"
            style={{ bottom: -20, right: -24 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666" }}>
                Daily Logistics
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#7A826D", background: "#F8F9F7", border: "1px solid #e5e7eb", borderRadius: 4, padding: "2px 7px" }}>
                LIVE
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Donut */}
              <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />
                  <circle cx="32" cy="32" r="26" fill="transparent" stroke="#7A826D" strokeWidth="6"
                    strokeDasharray="163.4" strokeDashoffset="57.2" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#333" }}>
                  65%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>Status</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginTop: 2 }}>Healthy</div>
                <div style={{ fontSize: 9, fontWeight: 500, color: "#7A826D", marginTop: 3 }}>On-schedule</div>
              </div>
            </div>
          </div>

          {/* ambient blobs */}
          <div style={{ position: "absolute", top: "50%", left: 0, transform: "translate(-50%, -50%)", width: 120, height: 120, background: "rgba(199,255,53,0.12)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "25%", right: 0, transform: "translateX(25%)", width: 180, height: 180, background: "rgba(122,130,109,0.1)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Core Values Section ──────────────────────────────────────────────────────
const VALUES = [
  {
    icon: "architecture",
    title: "Product First",
    desc: "We prioritize functional excellence and intuitive design above marketing noise. Every pixel serves a purpose.",
    span: "col-span-4",
  },
  {
    icon: "terminal",
    title: "Technical Integrity",
    desc: "Our architecture is built for the long term. We don't ship debt; we ship robust, documented, and battle-tested code that powers global commerce without fail.",
    span: "col-span-8",
  },
  {
    icon: "globe",
    title: "Global Scalability",
    desc: "From single-user startups to multinational conglomerates, Bizak expands with you. Localized, multi-currency, and hyper-available.",
    span: "col-span-7",
  },
  {
    icon: "person",
    title: "User Centricity",
    desc: "Software should adapt to people, not the other way around. We build for the actual humans behind the dashboards.",
    span: "col-span-5",
  },
];

function CoreValuesSection() {
  return (
    <section className="about-values">
      <div className="about-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="about-label">Core Values</span>
          <h2 className="about-h2" style={{ marginTop: 10 }}>The Principles Behind the Platform</h2>
        </div>

        <div className="about-bento">
          {VALUES.map((v) => (
            <div key={v.title} className={`about-value-card ${v.span}`}>
              <div className="about-value-icon">
                <Icon name={v.icon} size={20} />
              </div>
              <h4 className="about-value-title">{v.title}</h4>
              <p className="about-value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Timeline Section ─────────────────────────────────────────────────────────
const TIMELINE = [
  {
    year: "2018: The Insight",
    title: "Observing spreadsheet chaos",
    desc: "Our founders saw enterprise teams struggling to manage millions in revenue through fragmented, outdated systems. The \u201cAha!\u201d moment came when they realized spreadsheets were being used as a primary database for global shipping logistics.",
    neon: false,
  },
  {
    year: "2020: The Core Engine",
    title: "Architecting the unified ledger",
    desc: "While the world paused, our engineering team spent two years building the Bizak Core Engine—a proprietary ledger system that maintains total data integrity across every module, from accounting to procurement.",
    neon: false,
  },
  {
    year: "Present: Global Expansion",
    title: "Powering 50k+ companies",
    desc: "Today, Bizak is the backbone for the world's most ambitious scale-ups. With 50,000+ customers and global support hubs, we are redefining what it means to run an efficient enterprise.",
    neon: true,
  },
];

function TimelineSection() {
  return (
    <section className="about-timeline-section">
      <div style={{ textAlign: "center", marginBottom: 64, padding: "0 24px" }}>
        <span className="about-label">Our Story</span>
        <h2 className="about-h2" style={{ marginTop: 10 }}>Our Evolution</h2>
      </div>

      <div className="about-timeline-wrap">
        <div className="about-timeline">
          {TIMELINE.map((item) => (
            <div key={item.year} className="about-timeline-item">
              <div className={`about-timeline-dot ${item.neon ? "about-timeline-dot-neon" : ""}`}>
                <div className="about-timeline-dot-inner" />
              </div>
              <span className="about-timeline-year">{item.year}</span>
              <h3 className="about-timeline-title">{item.title}</h3>
              <p className="about-timeline-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Philosophy Section ───────────────────────────────────────────────────────
function PhilosophySection() {
  return (
    <section className="about-philosophy">
      <div className="about-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="about-label about-label-neon">Philosophy</span>
          <h2 className="about-h2 about-h2-white" style={{ marginTop: 10 }}>Built for the Decades Ahead</h2>
        </div>

        <div className="about-phil-grid">
          {/* Security */}
          <div className="about-phil-card">
            <div style={{ position: "absolute", top: 20, right: 24 }}>
              <div className="about-neon-dot about-pulse-neon" />
            </div>
            <h3 className="about-phil-title">Security by Design</h3>
            <p className="about-phil-desc">
              We integrate security at the kernel level. Every transaction is encrypted,
              audited, and verified against our proprietary safety protocols.
            </p>
            <div className="about-phil-tag">
              <Icon name="verified" size={16} />
              Active Protection
            </div>
          </div>

          {/* Architecture */}
          <div className="about-phil-card">
            <div style={{ position: "absolute", top: 20, right: 24 }}>
              <div className="about-neon-dot" />
            </div>
            <h3 className="about-phil-title">Long-term Architecture</h3>
            <p className="about-phil-desc">
              We don't build for trends; we build for permanence. Our infrastructure
              is designed to survive technological shifts and scale infinitely.
            </p>
            <div className="about-phil-tag">
              <Icon name="components" size={16} />
              Zero Debt Protocol
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Founder Quote ────────────────────────────────────────────────────────────
function FounderSection() {
  return (
    <section className="about-quote-section">
      <div className="about-container">
        <blockquote className="about-quote-text">
          "Efficiency is not a feature; it is the foundation of growth."
        </blockquote>
        <div>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1592878995758-02b32ddabdd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBDRU8lMjBidXNpbmVzc21hbiUyMHBvcnRyYWl0JTIwc3VpdHxlbnwxfHx8fDE3NzIwODMyOTV8MA&ixlib=rb-4.1.0&q=80&w=400"
            alt="David Richardson"
            className="about-founder-img"
          />
          <div className="about-founder-name">David Richardson</div>
          <div className="about-founder-role">Founder &amp; CEO</div>
        </div>
      </div>
    </section>
  );
}

// ─── Global Vision ────────────────────────────────────────────────────────────
function GlobalSection() {
  return (
    <section className="about-global">
      <div className="about-container">
        <div style={{ textAlign: "center" }}>
          <div className="about-global-icon-wrap">
            <Icon name="globe" size={28} />
          </div>
          <h2 className="about-h2">One Unified Vision for a Connected World</h2>
          <div className="about-global-divider" />
        </div>

        <div className="about-global-stats">
          {[
            { num: "4",   tag: "Global Hubs"     },
            { num: "20+", tag: "Nationalities"   },
            { num: "1",   tag: "Unified Vision"  },
          ].map((s) => (
            <div key={s.tag}>
              <div className="about-global-num">{s.num}</div>
              <div className="about-global-tag">{s.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="about-cta">
      <div className="about-cta-glow" />
      <div className="about-container" style={{ position: "relative", zIndex: 10 }}>
        <h2 className="about-cta-title">Join us in redefining business operations.</h2>
        <p className="about-cta-sub">
          We are always looking for visionary engineers, designers, and thinkers to
          join our global collective.
        </p>
        <button className="about-cta-btn">View Open Positions</button>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <div className="about-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <CoreValuesSection />
        <TimelineSection />
        <PhilosophySection />
        <FounderSection />
        <GlobalSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}