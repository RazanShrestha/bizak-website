// ════════════════════════════════════════════════════════════════════════════
// CASE STUDY DATA
//
// Dummy content for the Case Studies feature. This module is the single source
// of truth shared by:
//   • CaseStudiesPage.tsx  the listing (hero picks + "All Stories" grid)
//   • CaseStudyPage.tsx    the detail page rendered at /case-studies/:slug
//
// In production this is what an API/CMS would return; here it is hardcoded so
// every "Read Full Story" / "View Case Study" / story-card link resolves to a
// real, fully-rendered page. Look a study up with getCaseStudy(slug).
// ════════════════════════════════════════════════════════════════════════════

export interface CaseStudyStat {
  value: string;
  label: string;
}

export interface CaseStudyFact {
  label: string;
  value: string;
}

export interface CaseStudyNarrative {
  body: string;
  points: string[];
}

export interface CaseStudyQuote {
  text: string;
  name: string;
  role: string;
}

export interface CaseStudy {
  slug: string;
  /** Whether the study appears in the "All Stories" grid (vs. a hero-only feature). */
  listed: boolean;
  industry: string;
  title: string;
  /** Short copy for story cards. */
  excerpt: string;
  /** Longer copy for the detail-page hero. */
  summary: string;
  image: string;
  company: string;
  facts: CaseStudyFact[];
  modules: string[];
  stats: CaseStudyStat[];
  challenge: string;
  solution: CaseStudyNarrative;
  results: CaseStudyNarrative;
  quote: CaseStudyQuote;
}

// ─── IMAGES ───────────────────────────────────────────────────────────────────
const IMG_HERO_MAIN     = "https://images.unsplash.com/photo-1759092912815-cb0ee4a8a365?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwYnVzaW5lc3MlMjBvcGVyYXRpb25zJTIwZ2xvYmFsJTIwaGVhZHF1YXJ0ZXJzfGVufDF8fHx8MTc3MjEwOTAyNnww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_FINTECH       = "https://images.unsplash.com/photo-1733826544831-ad71d05c8423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW50ZWNoJTIwc3RhcnR1cCUyMHRlYW0lMjBvZmZpY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MjEwOTAyNnww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_LOGISTICS     = "https://images.unsplash.com/photo-1769752803940-0acb89683123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBzdXBwbHklMjBjaGFpbiUyMGxvZ2lzdGljcyUyMHdhcmVob3VzZXxlbnwxfHx8fDE3NzIxMDkwMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_RETAIL        = "https://images.unsplash.com/photo-1629828367134-690cd8bde95c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBjb21tZXJjZSUyMHNob3BwaW5nJTIwZWNvbW1lcmNlJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzIxMDkwMjl8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_MANUFACTURING = "https://images.unsplash.com/photo-1768796370672-3931e5d1ded7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwcHJlY2lzaW9uJTIwZW5naW5lZXJpbmclMjBmYWN0b3J5fGVufDF8fHx8MTc3MjEwOTAyOXww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_ANALYTICS     = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBmaW5hbmNlJTIwdGVhbSUyMGRhdGElMjBhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzcyMTA5MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080";

// ─── STUDIES master list ──────────────────────────────────────────────────────
const ALL_CASE_STUDIES: CaseStudy[] = [
  // ── Listed in the "All Stories" grid ──────────────────────────────────────
  {
    slug: "procurement-assets-500m-portfolio",
    listed: true,
    industry: "Fintech",
    title: "How procurement approvals are governed across a growing portfolio.",
    excerpt: "Automating the entire approval chain with custom-tailored ERP workflows built for the modern era.",
    summary:
      "A multi-strategy asset manager replaced a patchwork of spreadsheets and email approvals with one Bizak workflow engine governing every procurement decision across its portfolio.",
    image: IMG_ANALYTICS,
    company: "Meridian Capital Partners",
    facts: [
      { label: "Headquarters", value: "Kathmandu, Nepal" },
      { label: "Industry", value: "Asset Management" },
      { label: "Team size", value: "Mid-sized finance team" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Financial Management", "Workflow Automation", "Document Management", "Dashboards & Reporting"],
    stats: [
      { value: "One", label: "Workflow system of record" },
      { value: "Faster", label: "Approvals" },
      { value: "Full", label: "Audit coverage" },
    ],
    challenge:
      "Procurement approvals were scattered across email threads, shared spreadsheets and three disconnected finance tools. With no single audit trail, every quarter-end reconciliation took the controller's team the better part of two weeks, and exceptions slipped through unreviewed.",
    solution: {
      body: "Bizak's workflow engine became the system of record for every spend decision. Approval chains route automatically by amount, entity and category, and each step posts straight to the ledger.",
      points: [
        "Amount-based routing across four approval tiers",
        "Every approval posts a journal entry in real time",
        "Exception alerts surface stalled requests within the hour",
      ],
    },
    results: {
      body: "Approval cycle time fell sharply, and the controller's team now closes the quarter with a complete, queryable audit trail behind every figure.",
      points: [
        "Approval cycle cut from days to a single day",
        "No unreviewed exceptions since go-live",
        "Quarter-end reconciliation reduced from weeks to days",
      ],
    },
    quote: {
      text: "We used to chase approvals through inboxes. Now every procurement decision has a timestamp, an owner and a journal entry, without anyone lifting a finger.",
      name: "Priya Nadarajah",
      role: "Group Controller, Meridian Capital Partners",
    },
  },
  {
    slug: "retail-supply-chain-traceability",
    listed: true,
    industry: "Retail",
    title: "Traceability and transparency across a complex retail supply chain.",
    excerpt: "Providing granular visibility needed for ethical manufacturing and real-time inventory tracking.",
    summary:
      "A multi-store fashion retailer unified purchasing, inventory and supplier records in Bizak to trace every product back to its source factory in real time.",
    image: IMG_RETAIL,
    company: "Atelier North",
    facts: [
      { label: "Headquarters", value: "Pokhara, Nepal" },
      { label: "Industry", value: "Apparel Retail" },
      { label: "Team size", value: "Multi-store retailer" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Inventory & Warehouse", "Sales & CRM", "Point of Sale", "Dashboards & Reporting"],
    stats: [
      { value: "One", label: "Ledger for every store" },
      { value: "Real-time", label: "Stock visibility" },
      { value: "Fewer", label: "Stockouts" },
    ],
    challenge:
      "Stock data lived in each store's local system and synced overnight at best. Buyers had no reliable view of what was selling, and sustainability claims could not be backed by traceable supplier records.",
    solution: {
      body: "Bizak put every store, warehouse and supplier on one live inventory ledger. Each SKU carries its full sourcing history, and replenishment is driven by real demand signals.",
      points: [
        "Every store posts sales to one live ledger",
        "Per-SKU supplier and factory traceability",
        "Demand-driven replenishment across the network",
      ],
    },
    results: {
      body: "Buyers now act on live data, stockouts dropped noticeably, and every product page can prove where it was made.",
      points: [
        "Stockouts down sharply in the first season",
        "Overnight sync replaced by real-time posting",
        "Auditable sourcing trail across SKUs",
      ],
    },
    quote: {
      text: "For the first time we can answer 'where is this product, and where did it come from?' instantly, for any item, in any store.",
      name: "Mads Eriksen",
      role: "Head of Supply Chain, Atelier North",
    },
  },
  {
    slug: "precision-inventory-engineering",
    listed: true,
    industry: "Manufacturing",
    title: "Precision inventory management for mission-critical engineering.",
    excerpt: "Delivering real-time edge sync across distributed facilities with zero-latency processing.",
    summary:
      "A precision-components manufacturer connected every plant on a single Bizak inventory and production backbone, eliminating the spreadsheet handoffs that stalled mission-critical builds.",
    image: IMG_MANUFACTURING,
    company: "Halcyon Aerospace Components",
    facts: [
      { label: "Headquarters", value: "Chitwan, Nepal" },
      { label: "Industry", value: "Aerospace Manufacturing" },
      { label: "Team size", value: "Multi-plant manufacturer" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Manufacturing", "Inventory & Warehouse", "Project & Job Costing", "Multi-company & Branches"],
    stats: [
      { value: "Multi", label: "Plants synced live" },
      { value: "High", label: "Inventory accuracy" },
      { value: "Fewer", label: "Build delays" },
    ],
    challenge:
      "Each plant tracked components in its own system. A shortage in one facility was invisible to the others, so engineers discovered missing parts only when a build was already on the floor.",
    solution: {
      body: "Bizak unified every plant on one inventory and manufacturing ledger. Stock, work orders and job costs update live, so planners see the whole network at once.",
      points: [
        "Single live inventory across every plant",
        "Work orders linked to real-time component availability",
        "Job costing rolls up per programme automatically",
      ],
    },
    results: {
      body: "Inventory accuracy climbed and build delays fell, because shortages now surface before a job ever starts.",
      points: [
        "Inventory accuracy improved markedly",
        "Build delays reduced",
        "Cross-plant transfers approved in minutes, not days",
      ],
    },
    quote: {
      text: "Bizak gave our planners one screen for every plant. We catch a shortage weeks earlier, before it ever reaches the floor.",
      name: "Camille Dubois",
      role: "VP Operations, Halcyon Aerospace Components",
    },
  },
  {
    slug: "3pl-zero-downtime-migration",
    listed: true,
    industry: "Logistics",
    title: "Zero-downtime migration for a 3PL serving distribution centers across the region.",
    excerpt: "Full ERP cutover across multiple sites executed during off-peak windows with no service disruption.",
    summary:
      "A third-party logistics provider moved its distribution centers onto Bizak without pausing a single shipment, sequencing the cutover around regional off-peak windows.",
    image: IMG_LOGISTICS,
    company: "Transglobe 3PL",
    facts: [
      { label: "Headquarters", value: "Kathmandu, Nepal" },
      { label: "Industry", value: "Third-Party Logistics" },
      { label: "Team size", value: "Regional 3PL operator" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Inventory & Warehouse", "Multi-company & Branches", "Workflow Automation", "Dashboards & Reporting"],
    stats: [
      { value: "Multi", label: "Distribution centers" },
      { value: "0 hrs", label: "Downtime" },
      { value: "Fast", label: "End-to-end cutover" },
    ],
    challenge:
      "The incumbent ERP could not model centers across the region, and every previous migration attempt risked halting shipments customers depended on around the clock.",
    solution: {
      body: "Bizak rolled out site by site, each center going live in its own off-peak window while the rest of the network kept running on the live ledger.",
      points: [
        "Site-by-site cutover on off-peak windows",
        "Each center validated before the next began",
        "Unified multi-entity ledger from day one",
      ],
    },
    results: {
      body: "Every center was live within weeks, with not a single hour of shipment downtime.",
      points: [
        "Zero downtime across the entire migration",
        "Every center consolidated onto one ledger",
        "Network-wide reporting available immediately after cutover",
      ],
    },
    quote: {
      text: "We moved every center across the region and never stopped a truck. Our customers didn't notice a thing, which is exactly the point.",
      name: "Wei Lin Tan",
      role: "COO, Transglobe 3PL",
    },
  },
  {
    slug: "saas-scaleup-unified-platform",
    listed: true,
    industry: "Technology",
    title: "How a SaaS scale-up unified finance, HR, and ops on a single platform.",
    excerpt: "Eliminating a sprawl of point solutions in favor of one ERP backbone that grew with their headcount.",
    summary:
      "A fast-growing SaaS company retired its disconnected tools, consolidating finance, operations and reporting onto Bizak as its headcount grew.",
    image: IMG_FINTECH,
    company: "Northbeam Software",
    facts: [
      { label: "Headquarters", value: "Lalitpur, Nepal" },
      { label: "Industry", value: "B2B SaaS" },
      { label: "Team size", value: "Growing SaaS company" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Financial Management", "Workflow Automation", "Project & Job Costing", "Dashboards & Reporting"],
    stats: [
      { value: "One", label: "Platform, not many tools" },
      { value: "Scales", label: "With headcount" },
      { value: "Faster", label: "Month-end close" },
    ],
    challenge:
      "Rapid growth had left the team with a sprawl of overlapping tools and no shared source of truth. Finance reconciled by hand, and every new hire meant another set of logins to manage.",
    solution: {
      body: "Bizak replaced the tool sprawl with one backbone. Finance, approvals and project costing now share a single ledger that scales automatically with headcount.",
      points: [
        "Point solutions retired for one platform",
        "Approvals and spend controls standardised company-wide",
        "Project costing tied directly to the ledger",
      ],
    },
    results: {
      body: "Month-end close is markedly faster, and the same finance team now supports a much larger headcount without adding tools.",
      points: [
        "Month-end close significantly faster",
        "A sprawl of tools consolidated into one",
        "Same team scaled as headcount grew",
      ],
    },
    quote: {
      text: "Every tool we added used to add overhead. With Bizak, growth stopped meaning more software, it just meant more rows in the same ledger.",
      name: "Dana Whitfield",
      role: "VP Finance, Northbeam Software",
    },
  },
  {
    slug: "project-profitability-tracking",
    listed: true,
    industry: "Professional Services",
    title: "Real-time project profitability tracking across concurrent engagements.",
    excerpt: "Partners now close every month armed with live margin data instead of lagging reports.",
    summary:
      "A consultancy gave its partners live margin visibility across many concurrent engagements by moving time, billing and job costing onto Bizak.",
    image: IMG_HERO_MAIN,
    company: "Lattice Advisory Group",
    facts: [
      { label: "Headquarters", value: "Kathmandu, Nepal" },
      { label: "Industry", value: "Management Consulting" },
      { label: "Team size", value: "Professional services firm" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Project & Job Costing", "Financial Management", "Workflow Automation", "Dashboards & Reporting"],
    stats: [
      { value: "Many", label: "Live engagements" },
      { value: "Real-time", label: "Margin visibility" },
      { value: "Higher", label: "Average project margin" },
    ],
    challenge:
      "Project margins were calculated weeks after the fact in spreadsheets. By the time a partner saw an engagement slipping, the budget was already spent.",
    solution: {
      body: "Bizak ties every timesheet, expense and invoice to its engagement, so project profitability updates the moment work is logged.",
      points: [
        "Time and expenses post to engagements in real time",
        "Per-project P&L visible to every partner",
        "Budget alerts trigger before overruns occur",
      ],
    },
    results: {
      body: "Partners now manage margin live, and average project profitability rose across the portfolio.",
      points: [
        "Average project margin improved",
        "Lagging reports replaced by live dashboards",
        "Overruns flagged before they happen, not after",
      ],
    },
    quote: {
      text: "I used to learn an engagement lost money a month after it ended. Now I see the margin shift the same day, and I can still do something about it.",
      name: "Olivia Hartmann",
      role: "Managing Partner, Lattice Advisory Group",
    },
  },

  // ── Hero-only features (not in the grid) ──────────────────────────────────
  {
    slug: "fortune-500-hyper-scale-agility",
    listed: false,
    industry: "Enterprise",
    title: "How a multi-entity group uses Bizak for hyper-scale agility.",
    excerpt: "Complete digital transformation across many entities, setting new benchmarks for operational velocity.",
    summary:
      "Complete digital transformation across a multi-entity group in record time, setting new benchmarks for operational velocity.",
    image: IMG_HERO_MAIN,
    company: "Vanguard Industries",
    facts: [
      { label: "Headquarters", value: "Kathmandu, Nepal" },
      { label: "Industry", value: "Diversified Manufacturing" },
      { label: "Team size", value: "Multi-entity group" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Financial Management", "Multi-company & Branches", "Manufacturing", "Dashboards & Reporting"],
    stats: [
      { value: "Many", label: "Group entities" },
      { value: "Faster", label: "Reporting lead time" },
      { value: "1", label: "Consolidated close" },
    ],
    challenge:
      "Every entity ran on a mix of legacy ERPs and regional spreadsheets. Group consolidation took a month, and leadership steered the business on numbers that were already weeks old.",
    solution: {
      body: "Bizak became the single ledger for every entity. Multi-currency translation and intercompany elimination are built in, so a group close is one process, not many.",
      points: [
        "Every entity on one multi-currency ledger",
        "Intercompany elimination handled automatically",
        "Branch-level P&L available to every regional lead",
      ],
    },
    results: {
      body: "Group reporting lead time fell sharply, and the board now reviews live consolidated figures instead of month-old estimates.",
      points: [
        "Consolidated close cut by weeks",
        "One group close replaces many separate ones",
        "Live branch-level P&L across every region",
      ],
    },
    quote: {
      text: "We run a group balance sheet on numbers from this morning, not last month. That's the difference between reacting and leading.",
      name: "Gregory Mason",
      role: "Group CFO, Vanguard Industries",
    },
  },
  {
    slug: "fintech-seed-to-ipo-reporting",
    listed: false,
    industry: "Fintech",
    title: "Accelerating seed-to-IPO financial reporting.",
    excerpt: "Audit-ready books from day one, so the finance team scaled straight through to a public listing.",
    summary:
      "A high-growth fintech built audit-ready financial reporting on Bizak from its seed round, carrying the same ledger and controls all the way to a public listing.",
    image: IMG_FINTECH,
    company: "Cadence Pay",
    facts: [
      { label: "Headquarters", value: "Lalitpur, Nepal" },
      { label: "Industry", value: "Financial Technology" },
      { label: "Team size", value: "Growing fintech" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Financial Management", "Workflow Automation", "Document Management", "Dashboards & Reporting"],
    stats: [
      { value: "Seed → IPO", label: "One ledger throughout" },
      { value: "Fast", label: "Audit-ready close" },
      { value: "Full", label: "Source-linked figures" },
    ],
    challenge:
      "Most startups rebuild their finance stack at every funding stage. Cadence Pay needed books that were investor- and auditor-ready from the seed round, without a painful re-platforming before IPO.",
    solution: {
      body: "Bizak gave Cadence Pay enterprise-grade controls from day one. The same ledger, approval flows and audit trail scaled with each round.",
      points: [
        "Audit-ready controls live from the seed stage",
        "Every figure resolves to its source transaction",
        "Approval workflows tightened automatically as the company grew",
      ],
    },
    results: {
      body: "The finance team kept a fast monthly close throughout, and the IPO audit ran on the same ledger that booked the first seed transaction.",
      points: [
        "Audit-ready close kept fast, every month",
        "No finance re-platforming between funding stages",
        "IPO audit cleared on the existing ledger",
      ],
    },
    quote: {
      text: "We never had to rebuild finance to grow up. The ledger that booked our seed round is the one our IPO auditors signed off.",
      name: "Lena Hofmann",
      role: "CFO, Cadence Pay",
    },
  },
  {
    slug: "global-workforce-faster-close",
    listed: false,
    industry: "Enterprise",
    title: "Reducing monthly closing time dramatically for a regional workforce.",
    excerpt: "One ledger and auto-posted journals turned a multi-week month-end marathon into a short routine.",
    summary:
      "A regional workforce-services group replaced its month-end marathon with Bizak's auto-posting ledger, cutting the close from weeks to days.",
    image: IMG_LOGISTICS,
    company: "Continuum Workforce Group",
    facts: [
      { label: "Headquarters", value: "Kathmandu, Nepal" },
      { label: "Industry", value: "Workforce Services" },
      { label: "Team size", value: "Regional workforce group" },
      { label: "Live since", value: "2026" },
    ],
    modules: ["Financial Management", "Multi-company & Branches", "Workflow Automation", "Dashboards & Reporting"],
    stats: [
      { value: "Higher", label: "Efficiency" },
      { value: "Lower", label: "Operating cost" },
      { value: "Weeks → days", label: "Time to close" },
    ],
    challenge:
      "Payroll and billing for a regional workforce funnelled into a manual month-end. Finance spent weeks each cycle keying journals and chasing intercompany balances before the group books would tie out.",
    solution: {
      body: "Bizak auto-posts every payroll run, invoice and intercompany transfer to the right journals the moment it happens. Month-end becomes a review, not a rebuild.",
      points: [
        "Payroll and billing auto-post to the ledger in real time",
        "Intercompany balances reconcile continuously",
        "Consolidated group P&L available on demand",
      ],
    },
    results: {
      body: "The monthly close dropped from weeks to days, freeing the finance team to analyse results instead of assembling them.",
      points: [
        "Month-end close cut from weeks to days",
        "Manual journal entries reduced to near zero",
        "Finance time redirected from data entry to analysis",
      ],
    },
    quote: {
      text: "Month-end used to swallow three weeks. Now it's a short review, the journals were already posted while we slept.",
      name: "Sofie Bakker",
      role: "Group Financial Controller, Continuum Workforce Group",
    },
  },
];

// ─── DERIVED exports ──────────────────────────────────────────────────────────

/** All studies keyed by slug for detail-page lookup. */
export const CASE_STUDIES: Record<string, CaseStudy> = Object.fromEntries(
  ALL_CASE_STUDIES.map((c) => [c.slug, c]),
);

/** Ordered studies shown in the "All Stories" grid. */
export const CASE_STUDY_LIST: CaseStudy[] = ALL_CASE_STUDIES.filter((c) => c.listed);

/** The three hand-picked studies surfaced in the listing-page hero + spotlight. */
export const FEATURED_STUDIES = {
  hero: CASE_STUDIES["fortune-500-hyper-scale-agility"],
  fintech: CASE_STUDIES["fintech-seed-to-ipo-reporting"],
  spotlight: CASE_STUDIES["global-workforce-faster-close"],
};

/** Resolve a study by slug. Returns undefined for an unknown slug. */
export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES[slug];
}
