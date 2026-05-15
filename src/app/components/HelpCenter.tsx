import { useState } from "react";
import "../../styles/style.css";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CreditCard,
  FileText,
  Info,
  LifeBuoy,
  Mail,
  MessageSquare,
  Monitor,
  PlayCircle,
  RefreshCcw,
  Search,
  Settings2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  HeroBadge,
  IconBadge,
  PillBadge,
  Section,
  SectionHeading,
} from "./marketing";

// ─── Data ─────────────────────────────────────────────────────────────────────

const POPULAR_TOPICS = [
  "Getting Started",
  "Pricing & Billing",
  "Data Migration",
  "Integrations",
  "Security",
  "Mobile App",
];

const HERO_STATS: { value: string; label: string }[] = [
  { value: "< 4 hrs", label: "Avg. response time" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "24 / 7", label: "Live chat coverage" },
  { value: "200+", label: "Help articles & guides" },
];

const CHANNELS: {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  detailLabel: string;
  detail: string;
  cta: string;
  href: string;
  highlight?: boolean;
}[] = [
  {
    icon: MessageSquare,
    badge: "Fastest response",
    title: "Live chat",
    description:
      "Talk to a Bizak specialist in real time. Best for urgent product issues, guided walkthroughs, and live troubleshooting.",
    detailLabel: "Available",
    detail: "Mon – Fri, 9am – 8pm NPT",
    cta: "Start a chat",
    href: "#",
    highlight: true,
  },
  {
    icon: Mail,
    badge: "Always on",
    title: "Email support",
    description:
      "Send a detailed message and get a documented response. Ideal for complex queries, account questions, and follow-ups.",
    detailLabel: "Write to",
    detail: "support@bizakerp.com.np",
    cta: "Send an email",
    href: "mailto:support@bizakerp.com.np",
  },
  {
    icon: LifeBuoy,
    badge: "Guided process",
    title: "Submit a request",
    description:
      "Open a ticket and we'll route it to the right specialist implementation, billing, integrations, or data.",
    detailLabel: "First reply",
    detail: "Within 1 business day",
    cta: "Open the form",
    href: "/contact",
  },
];

const CATEGORIES: {
  icon: LucideIcon;
  title: string;
  description: string;
  count: string;
  filter: FaqKey;
}[] = [
  {
    icon: Info,
    title: "General Information",
    description: "What Bizak ERP is, who it's built for, and how it differs from typical accounting software.",
    count: "12 articles",
    filter: "general",
  },
  {
    icon: Sparkles,
    title: "Features & Functionality",
    description: "Accounting, inventory, sales, HR, CRM, and reporting every core module explained.",
    count: "34 articles",
    filter: "features",
  },
  {
    icon: Workflow,
    title: "Implementation & Integration",
    description: "Setup phases, data migration, third-party connectors, and rollout best practices.",
    count: "21 articles",
    filter: "implementation",
  },
  {
    icon: Users,
    title: "Training & Onboarding",
    description: "On-site sessions, webinars, video tutorials, and personalised training plans.",
    count: "18 articles",
    filter: "training",
  },
  {
    icon: Shield,
    title: "Security & Data Privacy",
    description: "Encryption, access controls, audit logs, backups, and disaster recovery.",
    count: "15 articles",
    filter: "security",
  },
  {
    icon: CreditCard,
    title: "Pricing & Licensing",
    description: "Subscription tiers, billing cycles, free trials, and optional add-on modules.",
    count: "10 articles",
    filter: "pricing",
  },
  {
    icon: Settings2,
    title: "Customisation & Scalability",
    description: "Custom workflows, fields, dashboards, and architecture for growing teams.",
    count: "16 articles",
    filter: "customisation",
  },
  {
    icon: Monitor,
    title: "System Requirements",
    description: "Browsers, mobile apps, bandwidth, and multi-platform compatibility.",
    count: "8 articles",
    filter: "system",
  },
  {
    icon: RefreshCcw,
    title: "Upgrades & Updates",
    description: "How automatic cloud updates work and what's included in your plan.",
    count: "9 articles",
    filter: "upgrades",
  },
  {
    icon: TrendingUp,
    title: "Migration from Existing Systems",
    description: "Move from legacy systems with full assessment, mapping, and validation.",
    count: "13 articles",
    filter: "migration",
  },
  {
    icon: MessageSquare,
    title: "Feedback & Improvement",
    description: "Submit feature requests, track status, and join product roadmap conversations.",
    count: "7 articles",
    filter: "feedback",
  },
  {
    icon: XCircle,
    title: "Cancellation & Termination",
    description: "Cancellation policy, fees, and how your data is exported on termination.",
    count: "6 articles",
    filter: "cancellation",
  },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────

type FaqKey =
  | "general"
  | "features"
  | "implementation"
  | "training"
  | "security"
  | "pricing"
  | "customisation"
  | "system"
  | "upgrades"
  | "migration"
  | "feedback"
  | "cancellation";

type FaqGroup = {
  key: FaqKey;
  label: string;
  faqs: { q: string; a: string }[];
};

const FAQ_GROUPS: FaqGroup[] = [
  {
    key: "general",
    label: "General",
    faqs: [
      {
        q: "What is Bizak ERP and who is it built for?",
        a: "Bizak ERP is a cloud-based business operating system that brings accounting, inventory, sales, purchase, HR, CRM, and reporting into one connected platform. It's designed for businesses of every size from early-stage startups to multi-entity enterprises that want to replace fragmented spreadsheets and disconnected tools with a single source of truth.",
      },
      {
        q: "How is Bizak different from a typical ERP solution?",
        a: "Bizak combines a clean, modern interface with the depth large organisations expect. Modules are configurable, deployment is fast, and the platform is built to grow with you. You don't pay for what you don't use, and you don't outgrow the system as your business scales.",
      },
      {
        q: "Is Bizak suitable for businesses of all sizes?",
        a: "Yes. Small and mid-sized businesses use Bizak to consolidate operations on a single platform. Larger enterprises use it for multi-entity, multi-branch, and multi-currency operations. The same product scales across both, with modular pricing that adjusts to your usage.",
      },
      {
        q: "Which industries does Bizak support?",
        a: "Bizak supports manufacturing, distribution, retail, professional services, and more. Industry-specific modules and configurable workflows adapt the platform to your operating model whether you're running a factory floor, a retail chain, or a project-based services firm.",
      },
    ],
  },
  {
    key: "features",
    label: "Features",
    faqs: [
      {
        q: "Which core modules ship with Bizak ERP?",
        a: "Core modules include Accounting, Inventory Management, Sales & Purchase, Human Resources, CRM, and Reporting & Analytics. Optional add-ons cover manufacturing, point of sale, project management, and industry-specific extensions.",
      },
      {
        q: "How does Bizak handle inventory management?",
        a: "Bizak provides full stock control: real-time inventory levels across warehouses, automatic reorder points, batch and serial-number tracking, barcode scanning, multi-location transfers, and live stock valuation. It works for service businesses too just turn off the modules you don't need.",
      },
      {
        q: "Can Bizak automate financial workflows?",
        a: "Yes. Bizak automates invoicing, reconciliation, expense tracking, payments, and tax reporting. Bank feeds and payment gateway integrations cut manual entry, and approval workflows enforce policy before money moves.",
      },
      {
        q: "Does Bizak include CRM functionality?",
        a: "Yes. The CRM module covers leads, contacts, sales pipelines, marketing campaigns, and post-sale support. Customer data is unified with sales and accounting, so your team works from one record across the entire customer lifecycle.",
      },
      {
        q: "How does the platform support team collaboration?",
        a: "Bizak includes built-in messaging, task management, document sharing, and project tracking. Updates are real-time, so distributed teams stay aligned without bouncing between tools.",
      },
    ],
  },
  {
    key: "implementation",
    label: "Implementation",
    faqs: [
      {
        q: "What does the implementation process look like?",
        a: "Implementation runs in five phases: requirement discovery, system configuration, data migration, user training, and parallel testing before go-live. Each phase has clear owners and deliverables, and our team partners with you across the entire rollout.",
      },
      {
        q: "How long does implementation take?",
        a: "Mid-market deployments typically complete in 4 – 8 weeks. Enterprise rollouts with multi-entity, multi-currency, or complex integration requirements may take 8 – 16 weeks. We'll give you a realistic timeline once we understand your scope.",
      },
      {
        q: "Does Bizak integrate with my existing tools?",
        a: "Yes. Bizak offers RESTful APIs, pre-built connectors for popular SaaS tools, and middleware support for legacy systems. Custom integrations can be built when needed we've connected payment gateways, e-commerce platforms, logistics providers, and bespoke internal apps.",
      },
      {
        q: "Do you support us during implementation?",
        a: "Yes. Every implementation is led by a dedicated specialist supported by configuration consultants and technical engineers. We handle the heavy lifting you focus on the decisions only your team can make.",
      },
      {
        q: "What challenges should we plan for?",
        a: "The two most common are data quality and change management. Time spent cleaning master data before migration pays back many times over, and so does early communication with the teams whose workflows are about to change. We'll help you de-risk both.",
      },
    ],
  },
  {
    key: "training",
    label: "Training",
    faqs: [
      {
        q: "Do you provide user training?",
        a: "Yes. We deliver structured training programs that cover the modules your team uses day-to-day. Training is available on-site, virtual, or as recorded sessions we'll match the format to your team's needs.",
      },
      {
        q: "What learning resources are included?",
        a: "User guides, video tutorials, role-based playbooks, an interactive product demo, and a searchable knowledge base. New articles and videos are published regularly as features ship.",
      },
      {
        q: "Is support available after we go live?",
        a: "Yes. Every plan includes ongoing support and product updates. Higher tiers add priority response, dedicated success managers, and quarterly health checks.",
      },
      {
        q: "How do I reach support after launch?",
        a: "Through live chat, email, the in-app help portal, or for higher tiers a phone line and dedicated account contact. All channels are listed inside the product so the right one is always one click away.",
      },
    ],
  },
  {
    key: "security",
    label: "Security",
    faqs: [
      {
        q: "How does Bizak protect my business data?",
        a: "Bizak uses end-to-end SSL/TLS encryption, role-based access controls, web application firewalls, and intrusion detection. Infrastructure is hosted in certified data centres with 24/7 monitoring, and we conduct regular vulnerability assessments and penetration tests.",
      },
      {
        q: "Is my data encrypted at rest and in transit?",
        a: "Yes. Data is encrypted in transit using SSL/TLS and at rest using industry-standard AES encryption. Key management follows best-practice rotation and isolation.",
      },
      {
        q: "How often is my data backed up?",
        a: "Backups run daily and are stored in geographically separate locations. Disaster-recovery procedures are documented and tested, with recovery objectives defined as part of your service agreement.",
      },
      {
        q: "Can I control who sees what?",
        a: "Yes. Permissions are granular and role-based administrators control what each user or group can view, edit, approve, or export, down to module, record, and field level.",
      },
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    faqs: [
      {
        q: "How is Bizak priced?",
        a: "Bizak uses a subscription model with monthly and annual billing options. Pricing scales with users, modules, and transaction volume. There are no hidden setup fees implementation is included in standard plans.",
      },
      {
        q: "Are there hidden fees?",
        a: "No. The price you see is the price you pay. Optional modules, premium support tiers, or specialist services (like custom development or dedicated training) are quoted separately and agreed in advance.",
      },
      {
        q: "Do you offer different plans by company size?",
        a: "Yes. Plans are tiered by user count, transaction volume, and module needs. Custom enterprise pricing is available for multi-entity or high-volume deployments.",
      },
      {
        q: "Can I change my plan later?",
        a: "Yes. You can upgrade or downgrade at any time. Charges are prorated, and the customer success team helps with the transition so nothing breaks.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes. Bizak offers a free trial with full feature access so you can evaluate the platform before committing. No credit card required.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "Credit and debit cards, bank transfers, and electronic funds transfer. Enterprise customers can be invoiced on standard payment terms.",
      },
    ],
  },
  {
    key: "customisation",
    label: "Customisation",
    faqs: [
      {
        q: "Can I tailor Bizak to my workflows?",
        a: "Yes. Forms, fields, print templates, approval flows, reports, and dashboards are all configurable without writing code. Deeper customisation is supported through our extension framework.",
      },
      {
        q: "How well does Bizak scale as I grow?",
        a: "Bizak's modular architecture means you can start lean and add capacity, modules, users, and entities as you grow. The same platform supports a 5-person team and a 5,000-person enterprise.",
      },
      {
        q: "Are there limits on users or transactions?",
        a: "Plans define usage envelopes that fit most businesses comfortably. For high-volume operations, our enterprise plan removes most ceilings talk to us about your specific scale.",
      },
      {
        q: "Can I build custom reports and dashboards?",
        a: "Yes. The reporting builder lets non-technical users compose dashboards and KPIs from any data in the system. Power users can write SQL-like expressions and embed them anywhere.",
      },
    ],
  },
  {
    key: "system",
    label: "System",
    faqs: [
      {
        q: "What are the system requirements?",
        a: "Bizak is fully cloud-based. Any modern browser Chrome, Edge, Firefox, Safari runs the product without plugins or installs.",
      },
      {
        q: "Is there a mobile app?",
        a: "Yes. Native iOS and Android apps are available for on-the-go access. Most workflows also work in a mobile browser.",
      },
      {
        q: "What internet speed do I need?",
        a: "There's no hard minimum, but a stable broadband connection delivers the best experience. Bizak is designed to handle intermittent connectivity gracefully you won't lose work to a dropped link.",
      },
      {
        q: "Can I work from anywhere?",
        a: "Yes. Anywhere you have an internet connection, you have Bizak. Your team can collaborate in real time across offices, factories, branches, and the field.",
      },
    ],
  },
  {
    key: "upgrades",
    label: "Upgrades",
    faqs: [
      {
        q: "How often does Bizak release updates?",
        a: "We ship updates regularly small fixes ride out continuously, and larger feature releases are bundled into a clearly communicated cadence. Customers always run a recent, secure version.",
      },
      {
        q: "Are upgrades included in my subscription?",
        a: "Yes. Updates and upgrades are included at every tier. You always have access to the latest version of the product at no additional cost.",
      },
      {
        q: "Will updates disrupt my workflow?",
        a: "Updates are deployed seamlessly through the cloud, typically without downtime. Major maintenance windows are scheduled outside business hours and announced in advance.",
      },
      {
        q: "Where can I see what's new?",
        a: "Release notes are published in the help center and inside the product. Significant releases are also covered by an email digest so you can plan ahead for any workflow changes.",
      },
    ],
  },
  {
    key: "migration",
    label: "Migration",
    faqs: [
      {
        q: "Can Bizak migrate data from my current system?",
        a: "Yes. Our migration team handles assessment, field mapping, transformation, cleansing, and validation. Whether you're moving from spreadsheets, Tally, QuickBooks, or another ERP, we have the playbook.",
      },
      {
        q: "How does migration work?",
        a: "We extract data from your existing system, map fields to Bizak's data model, transform values where needed, validate against business rules, and migrate in stages with parallel testing before final cutover.",
      },
      {
        q: "Will you support us through the cutover?",
        a: "Yes. Cutover is a hands-on phase. Our team is on call during the transition, and we run extended monitoring afterwards to catch anything that needs adjustment.",
      },
    ],
  },
  {
    key: "feedback",
    label: "Feedback",
    faqs: [
      {
        q: "How do I submit feedback or feature requests?",
        a: "Through the in-app feedback form, the help center, or directly to your customer success contact. We track every request, and your account portal shows the status of items you've submitted.",
      },
      {
        q: "What happens to feedback once submitted?",
        a: "Feedback is reviewed weekly, categorised, and weighed against impact, demand, and roadmap priorities. Items that ship are announced in release notes and the customer who suggested them is credited.",
      },
      {
        q: "Can I track the status of my requests?",
        a: "Yes. The customer portal shows submitted requests with status under review, planned, in progress, shipped so you always know where things stand.",
      },
    ],
  },
  {
    key: "cancellation",
    label: "Cancellation",
    faqs: [
      {
        q: "How do I cancel my subscription?",
        a: "Submit a cancellation request through your customer success contact or the help center. We'll confirm details and process the request, and you'll keep access until the end of the current billing period.",
      },
      {
        q: "Are there cancellation fees?",
        a: "Standard plans have no termination fees. Specific contractual commitments like multi-year enterprise agreements with negotiated pricing may have terms attached, which are spelled out in your agreement.",
      },
      {
        q: "What happens to my data if I cancel?",
        a: "Your data belongs to you. We provide full data export and, where needed, migration support to your next system. You'll never be locked in by data ownership.",
      },
    ],
  },
];

const RESOURCES: { icon: LucideIcon; tag: string; title: string; description: string; cta: string; href: string }[] = [
  {
    icon: BookOpen,
    tag: "Documentation",
    title: "Product & API documentation",
    description:
      "The full reference for every module, every endpoint, and every webhook. Built for both end users and integration developers.",
    cta: "Open the docs",
    href: "#",
  },
  {
    icon: PlayCircle,
    tag: "Video tutorials",
    title: "Get started in 30 minutes",
    description:
      "A guided video walkthrough sign up, configure your first modules, and run a full day-one workflow. No prior ERP experience required.",
    cta: "Watch the series",
    href: "#",
  },
  {
    icon: Users,
    tag: "Community",
    title: "Bizak user community",
    description:
      "Trade playbooks with other Bizak users, get answers from the team, and influence the roadmap. Open to every customer at every plan.",
    cta: "Join the forum",
    href: "#",
  },
];

// ─── Search index ─────────────────────────────────────────────────────────────

const SEARCH_INDEX = FAQ_GROUPS.flatMap((g) =>
  g.faqs.map((f) => ({ q: f.q, group: g.label, key: g.key })),
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const trimmed = query.trim();
  const results =
    trimmed.length > 1
      ? SEARCH_INDEX.filter((item) => item.q.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 6)
      : [];

  const showDropdown = focused && results.length > 0;

  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container width="narrow" className="relative">
        <div className="flex flex-col items-center text-center">
          <HeroBadge>Bizak Help Center</HeroBadge>
          <h1 className="mt-4 max-w-[820px] text-[clamp(40px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
            How can we{" "}
            <span className="relative inline-block">
              help you
              <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
            </span>{" "}
            today?
          </h1>
          <p className="mt-5 max-w-[640px] text-[17px] leading-[1.7] text-bz-text-muted">
            Search the knowledge base, browse help by topic, or talk to a Bizak
            specialist directly. We're here to make your ERP work for you.
          </p>

          {/* Search */}
          <div className="relative mt-9 w-full max-w-[680px]">
            <div className="flex h-[58px] items-center gap-3 rounded-bz-pill border border-bz-border bg-bz-surface pl-5 pr-2 shadow-[0_8px_28px_rgba(15,17,14,0.06)] focus-within:border-bz-sage-mid focus-within:shadow-[0_12px_36px_rgba(15,17,14,0.08)]">
              <Search className="size-5 shrink-0 text-bz-text-soft" strokeWidth={1.8} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 180)}
                type="text"
                placeholder="Search articles, guides, FAQs…"
                aria-label="Search the help center"
                className="flex-1 bg-transparent text-[15px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
              />
              <button
                type="button"
                aria-label="Submit search"
                className="inline-flex h-[42px] items-center gap-1.5 rounded-bz-pill bg-bz-deep px-5 text-[13px] font-semibold text-white transition-colors hover:bg-black"
              >
                Search
                <ArrowRight className="size-[14px]" />
              </button>
            </div>

            {showDropdown && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface shadow-[0_24px_64px_rgba(15,17,14,0.12)]">
                {results.map((r, i) => (
                  <a
                    key={`${r.q}-${i}`}
                    href="#faq"
                    className="flex items-center gap-3 border-b border-bz-border-soft px-5 py-3 text-left last:border-b-0 hover:bg-bz-bg"
                  >
                    <Search className="size-[14px] text-bz-sage" strokeWidth={2} />
                    <span className="flex-1 truncate text-[14px] text-bz-text">{r.q}</span>
                    <span className="shrink-0 rounded-bz-pill bg-bz-sage-soft px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em] text-bz-sage">
                      {r.group}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Popular topics */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
              Popular
            </span>
            {POPULAR_TOPICS.map((t) => (
              <a
                key={t}
                href="#faq"
                className="rounded-bz-pill border border-bz-border bg-bz-surface px-3.5 py-1.5 text-[12.5px] font-medium text-bz-text-muted transition-colors hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text"
              >
                {t}
              </a>
            ))}
          </div>

          {/* Stats strip */}
          <div className="mt-14 grid w-full grid-cols-2 gap-x-6 gap-y-8 border-t border-bz-border pt-10 md:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center md:items-start md:text-left">
                <span className="text-[28px] font-bold tracking-[-0.02em] text-bz-text md:text-[32px]">
                  {s.value}
                </span>
                <span className="mt-1 text-[12px] uppercase tracking-[0.1em] text-bz-text-soft">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Channels ─────────────────────────────────────────────────────────────────

function ChannelsSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Talk to us"
          title="Three ways to reach the support team"
          description="Pick the channel that fits the moment. We answer every message, and we'll route you to the right specialist."
          maxWidth={720}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CHANNELS.map(({ icon: ChannelIcon, ...c }) => (
            <Card
              key={c.title}
              tone="light"
              pad="lg"
              hover="lift"
              className={c.highlight ? "border-bz-sage-mid" : ""}
            >
              <div className="flex items-start justify-between">
                <IconBadge size="lg" tone={c.highlight ? "accent" : "sage"}>
                  <ChannelIcon className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <PillBadge tone={c.highlight ? "accent" : "neutral"} dot={c.highlight}>
                  {c.badge}
                </PillBadge>
              </div>

              <h3 className="mt-7 text-[22px] font-bold tracking-[-0.01em] text-bz-text">
                {c.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">{c.description}</p>

              <div className="mt-7 flex items-center gap-3 rounded-bz-lg bg-bz-bg px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                  {c.detailLabel}
                </span>
                <span className="ml-auto text-[13px] font-semibold text-bz-text">{c.detail}</span>
              </div>

              <a
                href={c.href}
                className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
              >
                {c.cta}
                <ArrowRight className="size-[14px]" />
              </a>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function CategoriesSection({ onPick }: { onPick: (key: FaqKey) => void }) {
  return (
    <Section tone="light" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Knowledge base"
          title="Browse help by topic"
          description="Twelve focus areas covering everything from your first day on Bizak to enterprise-scale configuration."
          maxWidth={720}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ icon: CatIcon, ...cat }) => (
            <button
              key={cat.title}
              type="button"
              onClick={() => onPick(cat.filter)}
              className="group relative flex flex-col rounded-bz-xl border border-bz-border bg-bz-surface p-6 text-left transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
            >
              <div className="flex items-center justify-between">
                <IconBadge size="md" tone="sage">
                  <CatIcon className="size-[18px]" strokeWidth={1.8} />
                </IconBadge>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
                  {cat.count}
                </span>
              </div>
              <h3 className="mt-5 text-[16.5px] font-bold tracking-[-0.01em] text-bz-text">
                {cat.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.65] text-bz-text-muted">{cat.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
                Read articles
                <ArrowUpRight className="size-[13px]" strokeWidth={2.2} />
              </span>
            </button>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FaqSection({
  activeKey,
  onChange,
}: {
  activeKey: FaqKey;
  onChange: (key: FaqKey) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const activeGroup = FAQ_GROUPS.find((g) => g.key === activeKey) ?? FAQ_GROUPS[0];

  return (
    <Section tone="white" pad="default" id="faq">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[100px] lg:self-start">
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text md:text-[40px]">
              Answers, organised by topic.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.7] text-bz-text-muted">
              The questions Bizak users ask us most often. Pick a topic to filter
              or use the search bar at the top of the page.
            </p>

            {/* Topic filter */}
            <div className="mt-7 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {FAQ_GROUPS.map((g) => {
                const isActive = g.key === activeKey;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      onChange(g.key);
                      setOpenIndex(0);
                    }}
                    className={[
                      "inline-flex items-center justify-between rounded-bz-md px-4 py-2.5 text-[13.5px] font-semibold transition-colors",
                      isActive
                        ? "bg-bz-deep text-white"
                        : "bg-transparent text-bz-text-muted hover:bg-bz-bg hover:text-bz-text",
                    ].join(" ")}
                    aria-pressed={isActive}
                  >
                    <span>{g.label}</span>
                    <span
                      className={[
                        "ml-3 hidden text-[11px] font-bold tabular-nums lg:inline",
                        isActive ? "text-white/60" : "text-bz-text-soft",
                      ].join(" ")}
                    >
                      {String(g.faqs.length).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Accordion list */}
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-bz-border pb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-sage">
                  {activeGroup.label}
                </span>
                <h3 className="mt-1 text-[20px] font-bold text-bz-text">
                  {activeGroup.faqs.length} questions in this topic
                </h3>
              </div>
              <PillBadge tone="neutral">FAQ</PillBadge>
            </div>

            <div className="flex flex-col">
              {activeGroup.faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={faq.q} className="border-b border-bz-border">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-bz-sage"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[16.5px] font-semibold text-bz-text">{faq.q}</span>
                      <ChevronDown
                        className={[
                          "mt-0.5 size-5 shrink-0 text-bz-text-soft transition-transform duration-200",
                          isOpen && "rotate-180 text-bz-sage",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        strokeWidth={2}
                      />
                    </button>
                    <div
                      className={[
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        isOpen ? "grid-rows-[1fr] pb-7" : "grid-rows-[0fr]",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-[720px] text-[15px] leading-[1.75] text-bz-text-muted">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Resources (dark) ─────────────────────────────────────────────────────────

function ResourcesSection() {
  return (
    <Section tone="dark" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Learn & grow"
          eyebrowTone="accent"
          title="Beyond the help center"
          description="Tutorials, deep documentation, and a community of Bizak operators ready to share what's worked for them."
          tone="light"
          maxWidth={720}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {RESOURCES.map(({ icon: ResIcon, ...r }) => (
            <Card key={r.title} tone="dark" pad="lg" className="group flex flex-col">
              <div className="flex items-center gap-3">
                <IconBadge size="md" tone="darkSurface">
                  <ResIcon className="size-[18px]" strokeWidth={1.8} />
                </IconBadge>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                  {r.tag}
                </span>
              </div>
              <h3 className="mt-7 text-[20px] font-bold tracking-[-0.01em] text-white">
                {r.title}
              </h3>
              <p className="mt-3 flex-1 text-[14.5px] leading-[1.7] text-white/60">{r.description}</p>
              <a
                href={r.href}
                className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-bz-accent transition-transform duration-200 group-hover:translate-x-0.5"
              >
                {r.cta}
                <ArrowRight className="size-[14px]" />
              </a>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

function BottomCta() {
  return (
    <Section tone="light" pad="default">
      <Container width="narrow">
        <div className="relative overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-surface p-10 md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-bz-accent/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-bz-sage/10 blur-3xl"
          />

          <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <PillBadge tone="sage" dot>
                Still need help
              </PillBadge>
              <h2 className="mt-5 text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
                A Bizak specialist is one click away.
              </h2>
              <p className="mt-4 max-w-[560px] text-[16px] leading-[1.7] text-bz-text-muted">
                Can't find what you're looking for? Talk to our team and we'll
                get back to you within one business day or jump straight into
                a free trial and explore the platform yourself.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button variant="primary" size="lg" href="/contact" withArrow>
                Contact support
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="https://system.bizakerp.com/account/self-register"
              >
                Start a free trial
              </Button>
            </div>
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-bz-border pt-7 text-[13px] text-bz-text-muted">
            {[
              { icon: Wrench, label: "Free implementation guidance" },
              { icon: FileText, label: "No credit card required" },
              { icon: Shield, label: "Cancel anytime" },
            ].map(({ icon: Tick, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Tick className="size-4 text-bz-sage" strokeWidth={1.8} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HelpCenter() {
  const [activeFaq, setActiveFaq] = useState<FaqKey>("general");

  const handlePickCategory = (key: FaqKey) => {
    setActiveFaq(key);
    if (typeof window !== "undefined") {
      const el = document.getElementById("faq");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <ChannelsSection />
        <CategoriesSection onPick={handlePickCategory} />
        <FaqSection activeKey={activeFaq} onChange={setActiveFaq} />
        <ResourcesSection />
        <BottomCta />
      </main>
      <Footer />
    </div>
  );
}
