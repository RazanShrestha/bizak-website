import { useState } from "react";
import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── Data ──────────────────────────────────────────────────────────────────────

const POPULAR_TOPICS = [
  "Getting Started", "Billing & Pricing", "Data Migration", "Integrations",
  "Security", "Mobile App",
];

const STATS = [
  { icon: "schedule", value: "< 4 hrs", label: "avg. response time" },
  { icon: "check_circle", value: "98%", label: "satisfaction rate" },
  { icon: "support_agent", value: "24/7", label: "live chat support" },
  { icon: "article", value: "200+", label: "help articles" },
];

const CHANNELS = [
  {
    icon: "chat",
    badge: "Fastest Response",
    title: "Live Support Chat",
    desc: "Connect with our support agents in real time. Get immediate help for urgent issues, guided walkthroughs, and troubleshooting without leaving your workflow.",
    detail: "support@bizakerp.com.np",
    detailIcon: "mail",
    cta: "Start Live Chat",
    href: "#",
  },
  {
    icon: "mail_outline",
    badge: "Always Available",
    title: "Email Support",
    desc: "Send a detailed message to our team and receive a thorough, documented response. Ideal for non-urgent questions, feedback, and complex technical queries.",
    detail: "support@bizakerp.com.np",
    detailIcon: "mail",
    cta: "Send an Email",
    href: "mailto:support@bizakerp.com.np",
  },
  {
    icon: "contact_support",
    badge: "Guided Process",
    title: "Submit a Request",
    desc: "Fill out our structured support form so we can route your query to the right specialist. Best for implementation issues, custom configurations, and data requests.",
    detail: "Typically 1 business day",
    detailIcon: "schedule",
    cta: "Open Support Form",
    href: "/contact",
  },
];

const CATEGORIES = [
  {
    icon: "info",
    title: "General Information",
    desc: "ERP fundamentals, company overview, and who Bizak is built for.",
    count: "12 articles",
  },
  {
    icon: "tune",
    title: "Features & Functionality",
    desc: "Deep dives on accounting, inventory, HR, CRM, and reporting modules.",
    count: "34 articles",
  },
  {
    icon: "integration_instructions",
    title: "Implementation & Integration",
    desc: "Setup phases, data migration, API connections, and third-party connectors.",
    count: "21 articles",
  },
  {
    icon: "school",
    title: "Training & Onboarding",
    desc: "On-site sessions, webinars, tutorials, and personalized training programs.",
    count: "18 articles",
  },
  {
    icon: "security",
    title: "Security & Data Privacy",
    desc: "Encryption standards, access controls, backups, and disaster recovery.",
    count: "15 articles",
  },
  {
    icon: "payments",
    title: "Pricing & Licensing",
    desc: "Subscription tiers, billing cycles, free trials, and optional add-ons.",
    count: "10 articles",
  },
  {
    icon: "settings_suggest",
    title: "Customization & Scalability",
    desc: "Custom workflows, fields, dashboards, and architecture for growing teams.",
    count: "16 articles",
  },
  {
    icon: "devices",
    title: "System Requirements",
    desc: "Browser compatibility, mobile apps, and cloud infrastructure details.",
    count: "8 articles",
  },
  {
    icon: "system_update",
    title: "Upgrades & Updates",
    desc: "How automatic cloud updates work and what's included in your plan.",
    count: "9 articles",
  },
  {
    icon: "swap_horiz",
    title: "Data Migration",
    desc: "Migrate from legacy systems with full assessment, mapping, and validation.",
    count: "13 articles",
  },
  {
    icon: "forum",
    title: "Feedback & Improvement",
    desc: "Submit feature requests, track status, and participate in product forums.",
    count: "7 articles",
  },
  {
    icon: "cancel",
    title: "Cancellation & Billing",
    desc: "Cancellation policy, data export on termination, and refund information.",
    count: "6 articles",
  },
];

// ─── FAQ Data by category ──────────────────────────────────────────────────────

type FaqCategory = {
  key: string;
  label: string;
  icon: string;
  faqs: { q: string; a: string }[];
};

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: "general",
    label: "General",
    icon: "info",
    faqs: [
      {
        q: "What is Bizak ERP and who is it designed for?",
        a: "Bizak ERP is a cloud-based enterprise resource planning platform built for businesses of all sizes — from startups and SMEs to large enterprises. It unifies accounting, inventory, sales, HR, CRM, and reporting into a single, scalable platform.",
      },
      {
        q: "What makes Bizak different from other ERP solutions?",
        a: "Bizak stands out through its user-friendly interface, robust functionality, scalability, and exceptional customer support. It is designed to be intuitive without sacrificing depth, enabling fast adoption without lengthy onboarding cycles.",
      },
      {
        q: "Is Bizak suitable for my industry?",
        a: "Yes. Bizak serves a wide range of industries including retail, distribution, manufacturing, professional services, and more. Industry-specific modules and configurable workflows adapt the platform to your operational context.",
      },
    ],
  },
  {
    key: "features",
    label: "Features",
    icon: "tune",
    faqs: [
      {
        q: "What core modules does Bizak ERP include?",
        a: "Core modules include accounting, inventory management with barcode scanning, sales and purchase management, human resources, CRM, and real-time reporting and analytics. Each module can be enabled independently or used together.",
      },
      {
        q: "Does Bizak support real-time collaboration?",
        a: "Yes. Bizak is built for distributed teams. All data is updated in real time so every user operates from a single source of truth, regardless of location or device.",
      },
      {
        q: "Can I automate financial processes?",
        a: "Absolutely. Bizak automates reconciliation, invoicing, expense tracking, payroll calculations, and tax reporting. Rules-based automation reduces manual entry and minimizes human error.",
      },
    ],
  },
  {
    key: "implementation",
    label: "Implementation",
    icon: "integration_instructions",
    faqs: [
      {
        q: "How long does a typical implementation take?",
        a: "Implementation timelines vary by complexity. Most mid-market deployments complete within 4 to 8 weeks. Enterprise-scale projects with multi-entity or multi-country requirements may take 8 to 16 weeks.",
      },
      {
        q: "What does the implementation process look like?",
        a: "Implementation follows a structured multi-phase approach: requirements gathering, platform configuration, data migration, user training, parallel testing, and go-live. Our team guides you through every step.",
      },
      {
        q: "Does Bizak integrate with third-party applications?",
        a: "Yes. Bizak offers RESTful APIs and pre-built connectors for popular tools including payment gateways, e-commerce platforms, logistics providers, and communication tools. Custom integrations are also supported.",
      },
    ],
  },
  {
    key: "security",
    label: "Security",
    icon: "security",
    faqs: [
      {
        q: "How does Bizak protect my business data?",
        a: "Bizak employs end-to-end SSL/TLS encryption, role-based access controls, firewalls, and intrusion detection systems. All infrastructure is hosted in certified data centers with industry-standard compliance frameworks.",
      },
      {
        q: "How frequently is data backed up?",
        a: "Data is backed up daily with offsite storage. Disaster recovery protocols are in place to ensure business continuity. Recovery time objectives are defined as part of your service agreement.",
      },
      {
        q: "Can I control who has access to specific data?",
        a: "Yes. Bizak provides granular, role-based access controls. Administrators can define what each user or user group can view, edit, approve, or export — at the module, record, and field level.",
      },
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    icon: "payments",
    faqs: [
      {
        q: "How is Bizak priced?",
        a: "Bizak uses a subscription-based model with flexible monthly and annual billing options. All plans include setup — there are no hidden onboarding fees. Optional add-on modules may carry additional costs.",
      },
      {
        q: "Is there a free trial available?",
        a: "Yes. Bizak offers a free trial so you can explore the platform before committing. Contact our sales team or register via our website to get started with no credit card required.",
      },
      {
        q: "What happens to my data if I cancel?",
        a: "Upon cancellation, you retain full access to your data. Our team provides data export assistance and, where needed, migration support to ensure a smooth transition with no data loss.",
      },
    ],
  },
];

const RESOURCES = [
  {
    icon: "play_circle",
    tag: "Video Tutorials",
    title: "Get started with Bizak in under 30 minutes",
    desc: "A guided video walkthrough covering account setup, core module activation, and your first day-to-day workflow.",
    cta: "Watch Tutorial",
    href: "#",
  },
  {
    icon: "description",
    tag: "Documentation",
    title: "Full API & Integration Reference",
    desc: "Technical documentation for developers connecting Bizak to third-party systems, custom apps, or data pipelines.",
    cta: "Read the Docs",
    href: "#",
  },
  {
    icon: "groups",
    tag: "Community",
    title: "Join the Bizak User Community",
    desc: "Ask questions, share best practices, and connect with thousands of Bizak users across industries and company sizes.",
    cta: "Join the Forum",
    href: "#",
  },
];

// ─── Search data (flat list for quick lookup) ─────────────────────────────────

const SEARCH_INDEX = FAQ_CATEGORIES.flatMap((cat) =>
  cat.faqs.map((f) => ({ q: f.q, category: cat.label, icon: cat.icon }))
);

// ─── Arrow icon ────────────────────────────────────────────────────────────────

function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = query.trim().length > 1
    ? SEARCH_INDEX.filter((item) =>
        item.q.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const showDropdown = focused && results.length > 0;

  return (
    <section className="hc-hero">
      <div className="hc-hero-inner">
        <div className="hc-hero-badge">
          <span className="hc-hero-badge-dot" />
          Support Hub
        </div>

        <h1 className="hc-hero-title">How can we help you?</h1>
        <p className="hc-hero-sub">
          Search our knowledge base, browse help categories, or reach our
          support team directly — we're here to make Bizak work for you.
        </p>

        <div className="hc-search-wrap">
          <span className="material-symbols-outlined hc-search-icon">search</span>
          <input
            className="hc-search-input"
            type="text"
            placeholder="Search articles, guides, FAQs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            aria-label="Search help center"
          />
          <button className="hc-search-btn" aria-label="Submit search">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          {showDropdown && (
            <div className="hc-search-results">
              {results.map((r, i) => (
                <a key={i} href="#faq" className="hc-search-result-item">
                  <span className="material-symbols-outlined hc-result-icon">{r.icon}</span>
                  <span className="hc-result-text">{r.q}</span>
                  <span className="hc-result-cat">{r.category}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="hc-popular">
          <span className="hc-popular-label">Popular:</span>
          {POPULAR_TOPICS.map((t) => (
            <a key={t} href="#faq" className="hc-popular-pill">{t}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <div className="hc-stats-bar">
      <div className="hc-stats-bar-inner">
        {STATS.map((s) => (
          <div className="hc-stat-item" key={s.label}>
            <span className="material-symbols-outlined hc-stat-icon">{s.icon}</span>
            <span className="hc-stat-text">
              {s.value} <span>{s.label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contact Channels ─────────────────────────────────────────────────────────

function ChannelsSection() {
  return (
    <div className="hc-section" style={{ paddingBottom: 64 }}>
      <div className="hc-section-header">
        <span className="hc-section-label">Get in touch</span>
        <h2 className="hc-section-title">Contact our support team</h2>
        <p className="hc-section-desc">
          Choose the channel that works best for you. Our team is available to
          help with any question, big or small.
        </p>
      </div>

      <div className="hc-channels-grid">
        {CHANNELS.map((c) => (
          <div className="hc-channel-card" key={c.title}>
            <div className="hc-channel-icon-wrap">
              <span className="material-symbols-outlined">{c.icon}</span>
            </div>
            <span className="hc-channel-badge">{c.badge}</span>
            <div className="hc-channel-title">{c.title}</div>
            <div className="hc-channel-desc">{c.desc}</div>
            <div className="hc-channel-detail">
              <span className="material-symbols-outlined">{c.detailIcon}</span>
              {c.detail}
            </div>
            <a href={c.href} className="hc-channel-btn">
              {c.cta} <ArrowRight />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function CategoriesSection() {
  return (
    <div className="hc-categories-wrap">
      <div className="hc-section">
        <div className="hc-section-header">
          <span className="hc-section-label">Knowledge base</span>
          <h2 className="hc-section-title">Browse by topic</h2>
          <p className="hc-section-desc">
            Find articles, guides, and answers organised by the area of Bizak
            you're working with.
          </p>
        </div>

        <div className="hc-categories-grid">
          {CATEGORIES.map((cat) => (
            <a href="#faq" className="hc-cat-card" key={cat.title}>
              <div className="hc-cat-icon-row">
                <div className="hc-cat-icon">
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <span className="hc-cat-count">{cat.count}</span>
              </div>
              <div className="hc-cat-title">{cat.title}</div>
              <div className="hc-cat-desc">{cat.desc}</div>
              <span className="material-symbols-outlined hc-cat-arrow">north_east</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────

function FAQSection() {
  const [activeKey, setActiveKey] = useState("general");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activeCat = FAQ_CATEGORIES.find((c) => c.key === activeKey) ?? FAQ_CATEGORIES[0];

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    setOpenIndex(null);
  };

  return (
    <div className="hc-section" id="faq">
      <div className="hc-section-header">
        <span className="hc-section-label">FAQ</span>
        <h2 className="hc-section-title">Frequently asked questions</h2>
        <p className="hc-section-desc">
          Answers to the most common questions about Bizak ERP — from getting
          started to enterprise-level configuration.
        </p>
      </div>

      <div className="hc-faq-layout">
        {/* Tab navigation */}
        <nav className="hc-faq-nav" aria-label="FAQ categories">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`hc-faq-nav-btn${activeKey === cat.key ? " active" : ""}`}
              onClick={() => handleTabChange(cat.key)}
            >
              <span className="material-symbols-outlined hc-faq-nav-icon">{cat.icon}</span>
              <span className="hc-faq-nav-text">{cat.label}</span>
            </button>
          ))}
        </nav>

        {/* FAQ list */}
        <div className="hc-faq-content">
          <div className="hc-faq-category-label">{activeCat.label}</div>
          <div className="hc-faq-list">
            {activeCat.faqs.map((faq, i) => (
              <div
                key={i}
                className={`hc-faq-item${openIndex === i ? " open" : ""}`}
              >
                <button
                  className="hc-faq-trigger"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="hc-faq-q">{faq.q}</span>
                  <span className="material-symbols-outlined hc-faq-chevron">expand_more</span>
                </button>
                <div className="hc-faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quote strip ─────────────────────────────────────────────────────────────

function QuoteStrip() {
  return (
    <div className="hc-quote-strip">
      <div className="hc-quote-strip-inner">
        <div className="hc-quote-strip-text">
          <p className="hc-quote-strip-q">
            "We understand the operational challenges of growth."
          </p>
          <p className="hc-quote-strip-body">
            Scaling a business shouldn't mean managing a mountain of
            spreadsheets. Our support team is here to ensure every Bizak user
            gets the most out of the platform — from day one through your
            largest milestones.
          </p>
        </div>
        <div className="hc-quote-strip-actions">
          <a href="/contact" className="hc-qstrip-btn-primary">
            Request a Demo <ArrowRight />
          </a>
          <a href="mailto:support@bizakerp.com.np" className="hc-qstrip-btn-ghost">
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Resources ────────────────────────────────────────────────────────────────

function ResourcesSection() {
  return (
    <div className="hc-section" style={{ paddingTop: 64 }}>
      <div className="hc-section-header">
        <span className="hc-section-label">Resources</span>
        <h2 className="hc-section-title">Learn & grow with Bizak</h2>
        <p className="hc-section-desc">
          Beyond the help center — explore tutorials, docs, and community
          discussions to get the most from your ERP investment.
        </p>
      </div>

      <div className="hc-resources-grid">
        {RESOURCES.map((r) => (
          <div className="hc-resource-card" key={r.title}>
            <div className="hc-resource-tag">
              <span className="material-symbols-outlined">{r.icon}</span>
              {r.tag}
            </div>
            <div className="hc-resource-title">{r.title}</div>
            <div className="hc-resource-desc">{r.desc}</div>
            <a href={r.href} className="hc-resource-link">
              {r.cta} <ArrowRight />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bottom CTA ──────────────────────────────────────────────────────────────

function BottomCTA() {
  return (
    <div className="hc-bottom-cta">
      <div className="hc-bottom-cta-inner">
        <p className="hc-bottom-cta-label">Still need help?</p>
        <h2 className="hc-bottom-cta-title">
          Our team is ready to assist you.
        </h2>
        <p className="hc-bottom-cta-sub">
          Can't find what you're looking for? Reach out directly and a Bizak
          specialist will get back to you within one business day.
        </p>
        <div className="hc-bottom-cta-btns">
          <a href="/contact" className="hc-cta-btn-primary">
            Contact Support <ArrowRight size={13} />
          </a>
          <a
            href="https://system.bizakerp.com/account/self-register"
            target="_blank"
            rel="noopener noreferrer"
            className="hc-cta-btn-ghost"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HelpCenter() {
  return (
    <div className="hc-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <StatsBar />
        <ChannelsSection />
        <CategoriesSection />
        <FAQSection />
        <QuoteStrip />
        <ResourcesSection />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
