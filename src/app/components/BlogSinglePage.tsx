import { useState, useEffect, useRef } from "react";
// import "./blog-single.css";
import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const AUTHOR_IMG =
  "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwYnVzaW5lc3MlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzE5ODIxNTJ8MA&ixlib=rb-4.1.0&q=80&w=400";

const TOC_SECTIONS = [
  { id: "intro",          label: "Introduction"    },
  { id: "role",           label: "Role of Spreadsheets" },
  { id: "breaking-point", label: "The Breaking Point"   },
  { id: "what-is-erp",    label: "The ERP System"       },
  { id: "comparison",     label: "Before vs After"      },
  { id: "checklist",      label: "Scaling Checklist"    },
];

// ─── Small Check SVG ─────────────────────────────────────────────────────────
function CheckMark() {
  return (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="1.5 6 4.5 9 10.5 3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setWidth(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="bsp-progress-bar"
      style={{ width: `${width}%` }}
      aria-hidden="true"
    />
  );
}

// ─── Dashboard Card (Hero right) ─────────────────────────────────────────────
function DashboardCard() {
  return (
    <div className="bsp-dashboard-wrap">
      <div className="bsp-dashboard-glow-a" />
      <div className="bsp-dashboard-glow-b" />
      <div className="bsp-dashboard-card">
        <h2 className="bsp-dashboard-title">Bizak Enterprise Hub</h2>
        <div className="bsp-dashboard-body">
          <div className="bsp-dashboard-stats">
            <div>
              <div className="bsp-stat-dot-row">
                <div className="bsp-stat-dot" style={{ background: "#e5e7eb" }} />
                <span className="bsp-stat-label">Total Transactions</span>
              </div>
              <div className="bsp-stat-value">$1,500,000</div>
            </div>
            <div>
              <div className="bsp-stat-dot-row">
                <div className="bsp-stat-dot" style={{ background: "#7A826D" }} />
                <span className="bsp-stat-label">Automated</span>
              </div>
              <div className="bsp-stat-value">$1,200,000</div>
            </div>
          </div>

          <div className="bsp-donut-wrap">
            <div className="bsp-donut" />
            <div className="bsp-donut-label">
              <div className="bsp-donut-pct">80%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="bsp-hero">
      <div className="bsp-hero-inner">
        {/* Left */}
        <div>
          <nav className="bsp-breadcrumb">
            <a href="/blog">Blog</a>
            <span className="bsp-breadcrumb-sep">→</span>
            <span className="bsp-breadcrumb-current">ERP Strategy</span>
          </nav>
          <div className="bsp-hero-date">October 24, 2024</div>
          <h1 className="bsp-hero-title">
            Replace Spreadsheets. Run your business in Bizak.
          </h1>
          <div className="bsp-author-row">
            <div className="bsp-author-avatar">
              <ImageWithFallback src={AUTHOR_IMG} alt="Bizak ERP Team" />
            </div>
            <div>
              <div className="bsp-author-name">Bizak ERP Team</div>
              <div className="bsp-author-role">Editorial Team</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <DashboardCard />
      </div>
    </section>
  );
}

// ─── TOC ─────────────────────────────────────────────────────────────────────
function TableOfContents({ active }: { active: string }) {
  return (
    <aside className="bsp-toc-aside">
      <div className="bsp-toc-sticky">
        <p className="bsp-toc-heading">On this page</p>
        <nav className="bsp-toc-nav">
          {TOC_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`bsp-toc-link${active === s.id ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

// ─── Right CTA Sidebar ───────────────────────────────────────────────────────
function RightSidebar() {
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);

  return (
    <aside className="bsp-right-aside">
      <div className="bsp-right-sticky">
        <div className="bsp-cta-widget">
          <div className="bsp-cta-glow" />
          <h4 className="bsp-cta-title">Ready to graduate from spreadsheets?</h4>
          <p className="bsp-cta-desc">
            Get a custom demo of the Bizak ERP ecosystem built for your specific scale.
          </p>
          <button className="bsp-cta-btn">Request Demo</button>
          <hr className="bsp-cta-divider" />
          <div className="bsp-cta-sub-label">Subscribe to Intel</div>
          {subbed ? (
            <p style={{ fontSize: 13, color: "#7A826D", fontWeight: 700 }}>✓ You're subscribed!</p>
          ) : (
            <>
              <input
                className="bsp-cta-email-input"
                type="email"
                placeholder="work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="bsp-cta-sub-link"
                onClick={() => { if (email) setSubbed(true); }}
              >
                Join our readers →
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Article Content ─────────────────────────────────────────────────────────
function ArticleContent() {
  return (
    <article className="bsp-article">

      {/* INTRO */}
      <div id="intro">
        <p className="bsp-article-intro">
          For decades, the humble spreadsheet has been the backbone of business operations.
          It's flexible, familiar, and accessible. However, as organizations scale, what was once
          an asset quickly transforms into a liability a phenomenon we call "the spreadsheet ceiling."
        </p>
      </div>

      {/* ROLE */}
      <div id="role">
        <h2>The Role of Spreadsheets in Early Growth</h2>
        <p>
          In the beginning, spreadsheets are perfectly adequate. They allow for rapid iteration
          without the need for complex database management. But they are islands of data.
        </p>

        <div className="bsp-bento-grid">
          <div className="bsp-bento-card">
            <span className="bsp-bento-icon" style={{ fontSize: 24 }}>💳</span>
            <div className="bsp-bento-title">Financial Tracking</div>
            <div className="bsp-bento-desc">Basic P&L management for lean teams.</div>
          </div>
          <div className="bsp-bento-card span2 olive-tint">
            <span className="bsp-bento-icon" style={{ fontSize: 24 }}>📊</span>
            <div className="bsp-bento-title">Operational Logic</div>
            <div className="bsp-bento-desc">
              Manual inventory counts and procurement logs managed by individual owners.
            </div>
          </div>
          <div className="bsp-bento-card span2">
            <span className="bsp-bento-icon" style={{ fontSize: 24 }}>📈</span>
            <div className="bsp-bento-title">Reporting</div>
            <div className="bsp-bento-desc">
              Static dashboards that require weekly manual syncs between departments.
            </div>
          </div>
          <div className="bsp-bento-card neon-tint">
            <span className="bsp-bento-icon" style={{ fontSize: 24 }}>⚡</span>
            <div className="bsp-bento-title">Pivot Capability</div>
            <div className="bsp-bento-desc">Quick changes for ad-hoc queries.</div>
          </div>
        </div>
      </div>

      {/* BREAKING POINT */}
      <div id="breaking-point">
        <h2>The Breaking Point</h2>
        <p>
          The transition from "efficient" to "chaotic" happens faster than most leaders anticipate.
          When your company hits 50+ employees, the volume of manual reconciliation creates a
          visibility gap.
        </p>

        <div className="bsp-ring-section">
          <div className="bsp-ring-wrap">
            <div className="bsp-ring-track" />
            <div className="bsp-ring-fill" />
            <div className="bsp-ring-center">
              <div className="bsp-ring-pct">65%</div>
              <div className="bsp-ring-sub">Manual Tasks</div>
            </div>
          </div>
          <p className="bsp-ring-caption">
            "The Visibility Gap: In fragmented systems, 65% of an employee's time is spent
            finding and cleaning data rather than analyzing it."
          </p>
        </div>
      </div>

      {/* WHAT IS ERP */}
      <div id="what-is-erp">
        <h2>What is ERP?</h2>
        <p>
          An ERP is a centralized operational system that serves as the "brain" of your enterprise.
          Instead of multiple files, you have a single source of truth that connects Finance, Sales,
          and Supply Chain in real-time.
        </p>
        <p>
          Modern ERP platforms like Bizak go further embedding AI-driven automation that reduces
          manual labor, surfaces anomalies instantly, and generates compliance-ready reports
          without human intervention.
        </p>
      </div>

      {/* COMPARISON */}
      <div id="comparison">
        <h2>Before vs. After</h2>

        <div className="bsp-table-wrap">
          <table className="bsp-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Spreadsheets</th>
                <th className="olive">Bizak ERP</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Data Integrity",  "Prone to formula errors",   "Automated validation"    ],
                ["Reporting",       "Delayed / Static",          "Real-time dashboards"    ],
                ["Collaboration",   "File locking / Versions",   "Multi-user concurrent"   ],
                ["Security",        "Limited / Passwords",       "Enterprise RBAC"         ],
              ].map(([cap, before, after]) => (
                <tr key={cap}>
                  <td>{cap}</td>
                  <td>{before}</td>
                  <td className="olive">{after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKLIST */}
      <div id="checklist">
        <div className="bsp-checklist-box">
          <h3>When to move to ERP?</h3>
          <ul className="bsp-checklist">
            {[
              "Monthly financial close takes longer than 7 business days.",
              "Inventory levels are tracked manually in multiple different sheets.",
              "Departments are reporting different \u201cfinal\u201d numbers for the same KPIs.",
              "You are planning to scale beyond 100 employees or 3 locations.",
            ].map((item) => (
              <li key={item}>
                <div className="bsp-check-icon"><CheckMark /></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AUTHOR BIO */}
      <div className="bsp-author-bio">
        <div className="bsp-author-bio-card">
          <div className="bsp-author-bio-avatar">
            <ImageWithFallback src={AUTHOR_IMG} alt="Bizak ERP Team" />
          </div>
          <div>
            <div className="bsp-author-bio-name">Bizak ERP Editorial Team</div>
            <p className="bsp-author-bio-desc">
              Dedicated to helping modern enterprises navigate the complexities of digital
              transformation and operational scaling through expert insights and technology.
            </p>
          </div>
        </div>
      </div>

    </article>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bsp-newsletter">
      <div className="bsp-newsletter-grid" />
      <h2 className="bsp-newsletter-title">Scale faster with better insights</h2>
      <p className="bsp-newsletter-sub">
        Join operations leaders receiving our bi-weekly breakdown of ERP innovations.
      </p>
      {submitted ? (
        <p style={{ color: "#C7FF35", fontWeight: 700, fontSize: 16, position: "relative", zIndex: 1 }}>
          ✓ You're subscribed thanks!
        </p>
      ) : (
        <form
          className="bsp-newsletter-form"
          onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
        >
          <input
            className="bsp-newsletter-input"
            type="email"
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="bsp-newsletter-btn">Subscribe</button>
        </form>
      )}
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function BlogSinglePage() {
  const [activeToc, setActiveToc] = useState("intro");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Bind section refs after mount & track scroll for TOC
  useEffect(() => {
    TOC_SECTIONS.forEach((s) => {
      sectionRefs.current[s.id] = document.getElementById(s.id);
    });

    const onScroll = () => {
      const scrollY = window.scrollY + 140;
      let current = TOC_SECTIONS[0].id;
      TOC_SECTIONS.forEach((s) => {
        const el = sectionRefs.current[s.id];
        if (el && el.offsetTop <= scrollY) current = s.id;
      });
      setActiveToc(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bsp-page">
      <Header />
      <ProgressBar />

      <main style={{ paddingTop: 76 }}>
        <HeroSection />

        {/* Three-column body */}
        <div className="bsp-body">
          <TableOfContents active={activeToc} />
          <ArticleContent />
          <RightSidebar />
        </div>

        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}