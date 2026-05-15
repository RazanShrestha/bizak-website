import { useState } from "react";
import "../../styles/style.css";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CreditCard,
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
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  Heading,
  Section,
  SectionHead,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

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

type Channel = {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  detailLabel: string;
  detail: string;
  cta: string;
  href: string;
  highlight?: boolean;
};

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const POPULAR_TOPICS: { label: string; key: FaqKey }[] = [
  { label: "Getting started", key: "general" },
  { label: "Pricing & billing", key: "pricing" },
  { label: "Data migration", key: "migration" },
  { label: "Integrations", key: "implementation" },
  { label: "Security", key: "security" },
  { label: "Mobile app", key: "system" },
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
    title: "General information",
    description: "What Bizak ERP is, who it's built for, and how it differs from typical accounting software.",
    count: "12 articles",
    filter: "general",
  },
  {
    icon: Sparkles,
    title: "Features & functionality",
    description: "Accounting, inventory, sales, HR, CRM, and reporting every core module explained.",
    count: "34 articles",
    filter: "features",
  },
  {
    icon: Workflow,
    title: "Implementation & integration",
    description: "Setup phases, data migration, third-party connectors, and rollout best practices.",
    count: "21 articles",
    filter: "implementation",
  },
  {
    icon: Users,
    title: "Training & onboarding",
    description: "On-site sessions, webinars, video tutorials, and personalised training plans.",
    count: "18 articles",
    filter: "training",
  },
  {
    icon: Shield,
    title: "Security & data privacy",
    description: "Encryption, access controls, audit logs, backups, and disaster recovery.",
    count: "15 articles",
    filter: "security",
  },
  {
    icon: CreditCard,
    title: "Pricing & licensing",
    description: "Subscription tiers, billing cycles, free trials, and optional add-on modules.",
    count: "10 articles",
    filter: "pricing",
  },
  {
    icon: Settings2,
    title: "Customisation & scalability",
    description: "Custom workflows, fields, dashboards, and architecture for growing teams.",
    count: "16 articles",
    filter: "customisation",
  },
  {
    icon: Monitor,
    title: "System requirements",
    description: "Browsers, mobile apps, bandwidth, and multi-platform compatibility.",
    count: "8 articles",
    filter: "system",
  },
  {
    icon: RefreshCcw,
    title: "Upgrades & updates",
    description: "How automatic cloud updates work and what's included in your plan.",
    count: "9 articles",
    filter: "upgrades",
  },
  {
    icon: TrendingUp,
    title: "Migration from existing systems",
    description: "Move from legacy systems with full assessment, mapping, and validation.",
    count: "13 articles",
    filter: "migration",
  },
  {
    icon: MessageSquare,
    title: "Feedback & improvement",
    description: "Submit feature requests, track status, and join product roadmap conversations.",
    count: "7 articles",
    filter: "feedback",
  },
  {
    icon: XCircle,
    title: "Cancellation & termination",
    description: "Cancellation policy, fees, and how your data is exported on termination.",
    count: "6 articles",
    filter: "cancellation",
  },
];

const CHANNELS: Channel[] = [
  {
    icon: MessageSquare,
    badge: "Fastest response",
    title: "Live chat",
    description:
      "Talk to a Bizak specialist in real time. Best for urgent product issues, guided walkthroughs, and live troubleshooting.",
    detailLabel: "Available",
    detail: "Mon to Fri, 9am to 8pm NPT",
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
      "Open a ticket and we'll route it to the right specialist: implementation, billing, integrations, or data.",
    detailLabel: "First reply",
    detail: "Within 1 business day",
    cta: "Open the form",
    href: "/contact",
  },
];

const SUPPORT_STATS: { value: string; label: string }[] = [
  { value: "Same day", label: "Typical first response" },
  { value: "Specialist", label: "Routed to the right team" },
  { value: "Mon to Fri", label: "Live chat coverage" },
];

const RESOURCES: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
}[] = [
  {
    icon: BookOpen,
    title: "Product & API documentation",
    description:
      "The full reference for every module, every endpoint, and every webhook. Built for both end users and integration developers.",
    cta: "Open the docs",
    href: "/Documentation",
  },
  {
    icon: PlayCircle,
    title: "Get started in 30 minutes",
    description:
      "A guided video walkthrough: sign up, configure your first modules, and run a full day-one workflow. No prior ERP experience required.",
    cta: "Watch the series",
    href: "/TrainingAndCertification",
  },
  {
    icon: Users,
    title: "Bizak user community",
    description:
      "Trade playbooks with other Bizak users, get answers from the team, and influence the roadmap. Open to every customer at every plan.",
    cta: "Join the forum",
    href: "/CommunityForum",
  },
];

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
        a: "Mid-market deployments typically complete in 4 to 8 weeks. Enterprise rollouts with multi-entity, multi-currency, or complex integration requirements may take 8 to 16 weeks. We'll give you a realistic timeline once we understand your scope.",
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

// Flat index of every question used by the hero search field.
const SEARCH_INDEX: { q: string; group: string; key: FaqKey }[] = FAQ_GROUPS.flatMap(
  (g) => g.faqs.map((f) => ({ q: f.q, group: g.label, key: g.key })),
);

// ════════════════════════════════════════════════════════════════════════════
// [HERO] search-led entry point
// ════════════════════════════════════════════════════════════════════════════

function HeroSection({ onPickTopic }: { onPickTopic: (key: FaqKey) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const trimmed = query.trim().toLowerCase();
  const results =
    trimmed.length > 1
      ? SEARCH_INDEX.filter((i) => i.q.toLowerCase().includes(trimmed)).slice(0, 6)
      : [];
  const showPanel = focused && trimmed.length > 1;

  const pick = (key: FaqKey) => {
    setFocused(false);
    onPickTopic(key);
  };

  return (
    <Section tone="dark" pad="hero">
      <Container>
        <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Bizak Help Center</BadgeGreen>

          <Heading level={1} tone="dark" style={{ marginBottom: 20 }}>
            How can we <Heading.Muted>help you today?</Heading.Muted>
          </Heading>

          <p className="max-w-[540px] text-[15px] leading-[1.7] text-bz-text-on-dark-muted md:text-[17px]">
            Search the knowledge base, browse help by topic, or talk to a Bizak specialist.
          </p>

          {/* Search field the page's primary entry point */}
          <div className="relative mt-9 w-full max-w-[620px]">
            <div className="flex h-[58px] items-center gap-2.5 rounded-bz-lg border border-bz-line bg-bz-surface pl-5 pr-2 transition-colors focus-within:border-bz-text-muted">
              <Search size={18} strokeWidth={1.8} className="shrink-0 text-bz-text-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results.length > 0) pick(results[0].key);
                }}
                placeholder="Search articles, guides and FAQs"
                aria-label="Search the help center"
                className="min-w-0 flex-1 bg-transparent text-[14.5px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
              />
              <button
                type="button"
                onClick={() => results.length > 0 && pick(results[0].key)}
                className="inline-flex h-[44px] shrink-0 items-center rounded-bz-md bg-bz-deep px-5 text-[13px] font-medium text-bz-text-on-dark transition-colors hover:bg-bz-olive"
              >
                Search
              </button>
            </div>

            {showPanel && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface text-left shadow-[0_24px_60px_-22px_rgba(15,20,17,0.28)]">
                {results.length > 0 ? (
                  results.map((r) => (
                    <button
                      key={r.q}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(r.key);
                      }}
                      className="flex w-full items-center gap-3 border-b border-bz-line-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-bz-paper-warm"
                    >
                      <Search size={13} strokeWidth={2} className="shrink-0 text-bz-text-soft" />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-bz-text">
                        {r.q}
                      </span>
                      <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
                        {r.group}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-5 text-[13px] leading-[1.6] text-bz-text-muted">
                    No articles match that search. Try a different term, or browse
                    topics below.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] TOPIC DIRECTORY a hairline index of the knowledge base
// ════════════════════════════════════════════════════════════════════════════

function TopicDirectorySection({ onPick }: { onPick: (key: FaqKey) => void }) {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Knowledge base"
          title={
            <>
              Find your topic,{" "}
              <Heading.Muted>read the answers.</Heading.Muted>
            </>
          }
          description="Twelve focus areas covering everything from your first day on Bizak to enterprise-scale configuration. Pick one to jump straight to its questions."
          titleMaxWidth={620}
        />

        <div className="grid grid-cols-1 border-t border-bz-line-soft md:grid-cols-2 md:gap-x-12">
          {CATEGORIES.map(({ icon: Icon, ...cat }) => (
            <button
              key={cat.title}
              type="button"
              onClick={() => onPick(cat.filter)}
              className="group flex cursor-pointer items-center gap-4 border-b border-bz-line-soft py-5 text-left"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text transition-colors group-hover:border-bz-text-soft">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-bz-text">
                  {cat.title}
                </span>
                <span className="mt-0.5 hidden truncate text-[13px] text-bz-text-muted sm:block">
                  {cat.description}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3 pl-2">
                <span className="text-[12px] tabular-nums text-bz-text-soft">
                  {cat.count}
                </span>
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  className="text-bz-text-soft transition-all group-hover:translate-x-0.5 group-hover:text-bz-text"
                />
              </span>
            </button>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] FAQ topic-filtered accordion
// ════════════════════════════════════════════════════════════════════════════

function FaqSection({
  activeKey,
  onChange,
}: {
  activeKey: FaqKey;
  onChange: (key: FaqKey) => void;
}) {
  const activeGroup = FAQ_GROUPS.find((g) => g.key === activeKey) ?? FAQ_GROUPS[0];

  return (
    <Section tone="b" id="faq">
      <Container>
        <div className="mx-auto max-w-[820px]">
          <SectionHead
            index="02"
            label="Answers"
            title={
              <>
                Frequently asked,{" "}
                <Heading.Muted>clearly answered.</Heading.Muted>
              </>
            }
            description="Pick a topic to filter the list, or search from the top of the page."
          />

          {/* Topic filter chips */}
          <div className="flex flex-wrap gap-2">
            {FAQ_GROUPS.map((g) => {
              const active = g.key === activeKey;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => onChange(g.key)}
                  aria-pressed={active}
                  className={
                    "rounded-bz-sm border px-3.5 py-2 text-[12.5px] font-medium transition-colors " +
                    (active
                      ? "border-bz-deep bg-bz-deep text-bz-text-on-dark"
                      : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text")
                  }
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* Accordion remounts on topic change so it resets to the first item */}
          <div className="mt-9">
            <div className="flex items-baseline justify-between border-b border-bz-line-soft pb-3">
              <span className="text-[13px] font-medium text-bz-text">
                {activeGroup.label}
              </span>
              <span className="text-[12px] tabular-nums text-bz-text-soft">
                {activeGroup.faqs.length} questions
              </span>
            </div>
            <Accordion key={activeKey} defaultOpen={0}>
              {activeGroup.faqs.map((f) => (
                <Accordion.Item key={f.q} question={f.q}>
                  {f.a}
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] TALK TO US support channels on a dark canvas
// ════════════════════════════════════════════════════════════════════════════

function ChannelCard({
  icon: Icon,
  badge,
  title,
  description,
  detailLabel,
  detail,
  cta,
  href,
  highlight,
}: Channel) {
  return (
    <div
      className={
        "flex flex-col rounded-bz-xl border bg-white/[0.04] p-6 " +
        (highlight ? "border-white/[0.18]" : "border-white/[0.08]")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            "flex size-10 items-center justify-center rounded-bz-md " +
            (highlight
              ? "bg-bz-fire text-bz-olive"
              : "bg-white/[0.06] text-bz-text-on-dark")
          }
        >
          <Icon size={17} strokeWidth={1.8} />
        </span>
        <span
          className={
            "text-[10px] font-semibold uppercase tracking-[0.1em] " +
            (highlight ? "text-bz-fire" : "text-white/[0.5]")
          }
        >
          {badge}
        </span>
      </div>

      <h3 className="mt-5 text-[17px] font-medium text-bz-text-on-dark">{title}</h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-[1.65] text-white/[0.6]">
        {description}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
        <span className="shrink-0 text-[11px] uppercase tracking-[0.08em] text-white/[0.45]">
          {detailLabel}
        </span>
        <span className="min-w-0 truncate text-[12px] font-medium text-bz-text-on-dark">
          {detail}
        </span>
      </div>

      <a
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-bz-fire transition-opacity hover:opacity-70"
      >
        {cta}
        <ArrowRight size={14} strokeWidth={2} />
      </a>
    </div>
  );
}

function ContactSection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHead
          tone="dark"
          index="03"
          label="Talk to us"
          title={
            <>
              Prefer a human?{" "}
              <Heading.Muted>We're one message away.</Heading.Muted>
            </>
          }
          description="Three ways to reach the support team. Every message gets answered, and routed to the right specialist."
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <ChannelCard key={c.title} {...c} />
          ))}
        </div>

        {/* Support promise the numbers behind the channels */}
        <div className="mt-3 grid grid-cols-1 divide-y divide-white/[0.08] rounded-bz-xl border border-white/[0.08] bg-white/[0.03] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {SUPPORT_STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center px-6 py-7 text-center"
            >
              <span className="text-[26px] font-medium tabular-nums text-bz-text-on-dark">
                {s.value}
              </span>
              <span className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-white/[0.5]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] RESOURCES ways to go deeper
// ════════════════════════════════════════════════════════════════════════════

function ResourcesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Keep learning"
          title={
            <>
              Beyond the help center,{" "}
              <Heading.Muted>everything to go deeper.</Heading.Muted>
            </>
          }
          titleMaxWidth={640}
        />

        <BentoGrid cols={3}>
          {RESOURCES.map(({ icon: Icon, ...r }) => (
            <Bento key={r.title} tone="paper" hover minHeight={250}>
              <Bento.Header
                title={r.title}
                icon={<Icon size={24} strokeWidth={1.5} className="text-bz-olive" />}
              />
              <Bento.Desc className="flex-1">{r.description}</Bento.Desc>
              <Bento.Cta variant="light" withArrow href={r.href}>
                {r.cta}
              </Bento.Cta>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function HelpCenter() {
  const [activeTopic, setActiveTopic] = useState<FaqKey>("general");

  const pickTopic = (key: FaqKey) => {
    setActiveTopic(key);
    if (typeof document !== "undefined") {
      document.getElementById("faq")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main>
      <HeroSection onPickTopic={pickTopic} />
      <TopicDirectorySection onPick={pickTopic} />
      <FaqSection activeKey={activeTopic} onChange={setActiveTopic} />
      <ContactSection />
      <ResourcesSection />
    </main>
  );
}
