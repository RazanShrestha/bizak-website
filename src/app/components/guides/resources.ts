// Single source of truth for the Guides & Playbooks library.
// Both the library grid and the per-resource detail page read from this list.

import {
  BarChart3,
  BookMarked,
  BookOpen,
  Compass,
  Database,
  Factory,
  FileSpreadsheet,
  FileText,
  LineChart,
  PlayCircle,
  Receipt,
  Rocket,
  ShieldCheck,
  Truck,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryKey =
  | "implementation"
  | "finance"
  | "inventory"
  | "manufacturing"
  | "sales"
  | "people";

export type Format = "Playbook" | "Guide" | "Template" | "Video";

export type Difficulty = "Foundational" | "Intermediate" | "Advanced";

export type Chapter = {
  id: string;
  title: string;
  intro: string;
  tasks: { title: string; detail: string }[];
  callout?: { title: string; body: string };
  outputs?: string[];
};

export type Download = {
  icon: LucideIcon;
  format: string;
  title: string;
  description: string;
  href: string;
};

export type Resource = {
  slug: string;
  category: CategoryKey;
  format: Format;
  title: string;
  summary: string;
  readTime: string;
  steps?: number;
  difficulty: Difficulty;
  updated: string;
  version?: string;
  // Optional flag — surfaces in the library grid as a featured card.
  featured?: boolean;
  // Detail-page content
  longSummary: string;
  factRows?: { label: string; value: string }[];
  prerequisites?: { title: string; body: string }[];
  pullQuote?: { quote: string; attribution: string };
  chapters: Chapter[];
  downloads?: Download[];
  faqs?: { q: string; a: string }[];
};

// ─── Category metadata ────────────────────────────────────────────────────────

export const CATEGORY_META: Record<CategoryKey, { label: string; icon: LucideIcon }> = {
  implementation: { label: "Implementation",     icon: Compass   },
  finance:        { label: "Finance",            icon: Receipt   },
  inventory:      { label: "Inventory",          icon: Truck     },
  manufacturing:  { label: "Manufacturing",      icon: Factory   },
  sales:          { label: "Sales & CRM",        icon: BarChart3 },
  people:         { label: "People & training",  icon: Users     },
};

export function formatIcon(format: Format): LucideIcon {
  switch (format) {
    case "Playbook": return BookMarked;
    case "Guide":    return BookOpen;
    case "Template": return FileText;
    case "Video":    return PlayCircle;
  }
}

export function formatTone(format: Format): "sage" | "accent" | "neutral" {
  switch (format) {
    case "Playbook": return "accent";
    case "Guide":    return "sage";
    case "Template": return "neutral";
    case "Video":    return "neutral";
  }
}

// ─── Resources ────────────────────────────────────────────────────────────────

export const RESOURCES: Resource[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Featured implementation playbook (also the hero card)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "sixty-day-implementation",
    category: "implementation",
    format: "Playbook",
    title: "From kickoff to go-live: the 60-day Bizak implementation playbook",
    summary:
      "A week-by-week field guide for the operations lead running a Bizak rollout — every milestone, owner, and decision gate.",
    readTime: "60 min",
    steps: 12,
    difficulty: "Intermediate",
    updated: "May 2026",
    version: "v2026.1",
    featured: true,
    longSummary:
      "Every Bizak rollout — whether a 25-person distributor or a multi-entity manufacturer — follows the same six-phase arc. The phases are sequential, but the artefacts overlap: discovery feeds configuration, configuration informs migration, migration shapes training. This playbook walks each phase, names the owner, lists the gate criteria, and links to the templates we use on every customer rollout.",
    pullQuote: {
      quote:
        "We compressed an estimated 18-week rollout into 9. The decision gates were the difference — they kept us honest and forced the conversations finance and ops would otherwise have postponed.",
      attribution: "Priya Bansal, CFO, Northwood Logistics",
    },
    prerequisites: [
      {
        title: "An executive sponsor with calendar time",
        body: "Not a sign-off-and-disappear sponsor. Someone who attends weekly steerco, breaks ties, and owns the budget.",
      },
      {
        title: "A named project lead — full-time",
        body: "60% allocation is not enough. Implementations are decision factories; you need someone whose only job is to keep them flowing.",
      },
      {
        title: "A clean view of your existing data",
        body: "Run a data-quality scan before kickoff. Knowing what's broken is half the migration battle.",
      },
    ],
    chapters: [
      {
        id: "discover",
        title: "Phase 1 · Discover (Week 1 – 2)",
        intro:
          "Map the operating model, agree on the modules in scope, and name owners for every workstream — before a single record moves.",
        tasks: [
          {
            title: "Run the two-day discovery workshop",
            detail:
              "Block calendars across finance, ops, and IT. Walk every transaction end-to-end, capture exceptions, and surface the integrations you can't live without.",
          },
          {
            title: "Author the solution-design doc",
            detail:
              "One source of truth: modules in scope, master-data sources, integration map, reporting requirements, and the named owner for each.",
          },
          {
            title: "Lock the workstream RACI",
            detail:
              "Decide who's responsible, accountable, consulted, and informed for finance, inventory, sales, and integrations.",
          },
        ],
        callout: {
          title: "Decision gate",
          body: "Solution-design doc signed by the executive sponsor and the project lead. No phase-2 work starts until the gate is passed.",
        },
        outputs: ["Solution-design doc", "Workstream RACI", "Integration map"],
      },
      {
        id: "configure",
        title: "Phase 2 · Configure (Week 2 – 4)",
        intro:
          "Stand up Bizak to mirror how your business actually runs — chart of accounts, item master, approval flows, branding.",
        tasks: [
          {
            title: "Build the chart of accounts",
            detail:
              "Pull the Bizak COA template, mirror your structure, and tag every account to the right financial statement and segment.",
          },
          {
            title: "Configure approval matrices",
            detail:
              "Decide thresholds for POs, expenses, discounts, and credit limits. Bizak Workflow Automation handles the rest — no code, full audit trail.",
          },
          {
            title: "Set up roles and permissions",
            detail:
              "Use the role library as a starting point. Customise field-level access only where you have to.",
          },
        ],
        callout: {
          title: "Decision gate",
          body: "Sandbox tenant ready, COA approved by finance, role library reviewed by IT — and a screenshot pack signed off by each module owner.",
        },
        outputs: ["Configured tenant", "Role library", "Doc templates"],
      },
      {
        id: "migrate",
        title: "Phase 3 · Migrate (Week 3 – 5)",
        intro:
          "Move master data and opening balances using validated templates — every record reconciled against your source system.",
        tasks: [
          {
            title: "Cleanse master data",
            detail:
              "Clean it before you load it. The Bizak validation workbook flags duplicates, broken references, and missing required fields.",
          },
          {
            title: "Load customers, items, vendors, COA, balances",
            detail:
              "Use the migration import templates in the order documented — dependencies matter. Validate row counts after every load.",
          },
          {
            title: "Run a full mock cutover",
            detail:
              "Drop a snapshot of live data into the sandbox, freeze it, and reconcile to the cent against the source.",
          },
        ],
        callout: {
          title: "Decision gate",
          body: "Mock-cutover reconciliation signed off — opening balances tie out to the source system, parallel-run results pass three consecutive days.",
        },
        outputs: ["Reconciled balances", "Migration audit log", "Mock-cut sign-off"],
      },
      {
        id: "train",
        title: "Phase 4 · Train (Week 5 – 7)",
        intro:
          "Role-based enablement so each team learns the workflows they'll actually run — measured by certification, not by attendance.",
        tasks: [
          {
            title: "Build role-based curricula",
            detail:
              "Finance, Sales, Ops, and Managers each get a tailored track. Skip generic system tours.",
          },
          {
            title: "Use in-product certifications",
            detail:
              "Each curriculum ends in a real task in the sandbox. Pass the task, get certified — no PowerPoint exam.",
          },
          {
            title: "Recruit a champions network",
            detail:
              "One champion per team, pre-trained, equipped with the operator field guide. They handle 80% of day-one questions internally.",
          },
        ],
        callout: {
          title: "Decision gate",
          body: "≥90% of named end-users certified on their role-based track. Champions network in place and on-call for go-live week.",
        },
        outputs: ["Certified users", "Quick-reference cards", "Champion roster"],
      },
      {
        id: "golive",
        title: "Phase 5 · Go-live (Week 7 – 8)",
        intro:
          "Cut over on a controlled weekend, switch users on Monday, and run a hyper-care war-room for the first two weeks.",
        tasks: [
          {
            title: "Run the cutover hour-by-hour",
            detail:
              "Use the runbook. Every step has an owner, a duration, and a rollback gate.",
          },
          {
            title: "Stand up a hyper-care war-room",
            detail:
              "First week: a Bizak engineer on call, daily standups, a shared incident log.",
          },
          {
            title: "Monitor every workflow on day one",
            detail:
              "Watch the live transaction feed, the failed-event queue, and the user-feedback inbox.",
          },
        ],
        callout: {
          title: "Decision gate",
          body: "Day-30 health report green: transaction error rate <0.5%, user adoption ≥85%, no open severity-1 incidents.",
        },
        outputs: ["Live system", "Hyper-care log", "Day-30 health report"],
      },
      {
        id: "optimise",
        title: "Phase 6 · Optimise (Day 30 – 90+)",
        intro:
          "Tune dashboards, automate the workflows you deferred, and graduate to advanced modules once the foundation is stable.",
        tasks: [
          {
            title: "Calibrate dashboards and KPIs",
            detail:
              "Review what's actually being used. Cull the noise. Add the two or three numbers your leadership team checks every Monday.",
          },
          {
            title: "Clear the automation backlog",
            detail:
              "Two-week sprints. Take the deferred workflows from phase 2 and automate them now that the team knows the system.",
          },
          {
            title: "Plan the next module",
            detail:
              "Manufacturing? Project costing? Multi-entity consolidation? Graduate to the next thing on your roadmap.",
          },
        ],
        outputs: ["KPI dashboards", "Automation library", "Roadmap plan"],
      },
    ],
    downloads: [
      {
        icon: FileSpreadsheet,
        format: "XLSX · 184 KB",
        title: "Master-data migration workbook",
        description:
          "Pre-formatted sheets for customers, items, vendors, COA, opening balances — with validation built in.",
        href: "#",
      },
      {
        icon: ShieldCheck,
        format: "PDF · 1.2 MB",
        title: "Go-live readiness checklist",
        description: "The 48-item gate review your project lead runs the week before cutover.",
        href: "#",
      },
      {
        icon: Workflow,
        format: "JSON · 12 KB",
        title: "Approval workflow library",
        description: "Drop-in approval chains for discounts, POs, expenses, and credit limits.",
        href: "#",
      },
    ],
    faqs: [
      {
        q: "Can the rollout actually happen in 60 days?",
        a: "The 60-day arc fits a clean mid-market scope — single entity, standard modules, a project lead with executive air-cover. Multi-entity, complex integrations, or contested data ownership push it to 12 weeks or more. The phases stay the same; the durations stretch.",
      },
      {
        q: "Who needs to be on the project team?",
        a: "An executive sponsor, a full-time project lead, and one named owner per module workstream. Plus a Bizak implementation lead and a solutions architect on our side.",
      },
      {
        q: "What's the most common reason rollouts slip?",
        a: "Data quality. Teams underestimate how dirty their existing master data is and discover it during phase 3. Build slack into the migration phase and start the cleanse in week 2 — not week 5.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Implementation
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "discovery-workshop",
    category: "implementation",
    format: "Playbook",
    title: "Running a clean Bizak discovery workshop",
    summary:
      "The two-day structured discovery our consultants run with new customers — agenda, worksheets, and the outputs your build team needs.",
    readTime: "22 min",
    steps: 9,
    difficulty: "Foundational",
    updated: "Apr 2026",
    longSummary:
      "Discovery is where bad rollouts are made. Skip it and you'll find your gaps in week six, when fixing them is ten times harder. This playbook gives you the agenda, the worksheets, and the artefacts to leave the workshop with — so the build team starts day one knowing exactly what to ship.",
    chapters: [
      {
        id: "agenda",
        title: "The two-day agenda",
        intro:
          "Day one belongs to process. Day two belongs to data. Keep the rooms separate, keep the right people in each, and don't try to compress them into one.",
        tasks: [
          { title: "Day one — process walks", detail: "End-to-end transaction walks for finance, sales, inventory, and any module in scope. One scribe per session." },
          { title: "Day two — data and integrations", detail: "Source systems, master-data owners, integration list, and the reporting requirements that drive the schema." },
          { title: "Wrap-up — gaps and risks", detail: "30 minutes at the end: every open question, every risk, every dependency captured in one register." },
        ],
        outputs: ["Process maps", "Data inventory", "Risk register"],
      },
      {
        id: "outputs",
        title: "What you leave with",
        intro:
          "Discovery succeeds when the next phase can start without going back. Three artefacts make that possible.",
        tasks: [
          { title: "Solution-design document", detail: "Modules in scope, integration list, reporting requirements, named owners." },
          { title: "Workstream RACI", detail: "Every module + every integration, mapped to a responsible, accountable, consulted, informed owner." },
          { title: "Phased timeline", detail: "Six phases, eight weeks, with the gate criteria for each." },
        ],
      },
    ],
    downloads: [
      {
        icon: FileText,
        format: "PDF · 480 KB",
        title: "Discovery workshop agenda",
        description: "Hour-by-hour run sheet for both days, with worksheet templates inline.",
        href: "#",
      },
      {
        icon: FileSpreadsheet,
        format: "XLSX · 96 KB",
        title: "Workstream RACI template",
        description: "Pre-populated with the standard Bizak workstreams. Edit to fit your scope.",
        href: "#",
      },
    ],
    faqs: [
      {
        q: "Can we run discovery remotely?",
        a: "Yes — and many customers do. The agenda still works; just shorten sessions to 60 minutes and add more breaks. Have a single shared whiteboard tool and one facilitator.",
      },
      {
        q: "Who absolutely must be in the room?",
        a: "Executive sponsor (at least for the kickoff and wrap-up), project lead, and one decision-maker per module. Without decision-makers, you'll leave with questions instead of answers.",
      },
    ],
  },
  {
    slug: "cutover-runbook",
    category: "implementation",
    format: "Guide",
    title: "Cutover weekend: the hour-by-hour runbook",
    summary:
      "Sequence opening balances, freeze legacy data, verify reconciliations, and switch users — without a single missed transaction.",
    readTime: "18 min",
    steps: 14,
    difficulty: "Advanced",
    updated: "May 2026",
    longSummary:
      "The cutover weekend is when months of preparation either land or fall apart. There's no improvisation in a good cutover — every step is scripted, owned, and gated. This is the runbook our consultants use on every Bizak go-live.",
    chapters: [
      {
        id: "friday",
        title: "Friday evening — freeze",
        intro:
          "By 5pm Friday, the legacy system is read-only and every in-flight transaction is closed or carried forward. The cutover team is on a shared bridge and the war-room is open.",
        tasks: [
          { title: "Communicate the freeze to all users", detail: "Pre-scheduled email + Slack + on-system banner. No surprises at 4:55pm." },
          { title: "Lock legacy posting", detail: "Set period-close on the legacy ledger. Generate the final trial balance and snapshot." },
          { title: "Take the master-data snapshot", detail: "Final extract of customers, items, vendors, COA. This is the source of truth for the load." },
        ],
        outputs: ["Trial-balance snapshot", "Master-data extract", "Freeze confirmation"],
      },
      {
        id: "saturday",
        title: "Saturday — load and reconcile",
        intro:
          "Load opening balances, then master data, then transactions in dependency order. Reconcile after every batch — never let a discrepancy compound.",
        tasks: [
          { title: "Load opening balances", detail: "Per-entity, per-currency, with reconciliation against the trial balance after each post." },
          { title: "Run the reconciliation script", detail: "Bizak balances → legacy trial balance. Investigate anything that doesn't tie before moving on." },
          { title: "Smoke-test core workflows", detail: "Create a sales order, post a journal, run a stock movement. Document the result." },
        ],
        callout: {
          title: "Rollback gate",
          body: "If reconciliation fails by more than the agreed tolerance, stop. Don't proceed to Sunday until the variance is explained or rollback is triggered.",
        },
      },
      {
        id: "sunday",
        title: "Sunday — verify and arm",
        intro:
          "The system is loaded. Now you prove it works for the people who'll touch it Monday morning.",
        tasks: [
          { title: "Functional walkthrough with module owners", detail: "Each owner runs the workflows their team will run on Monday. Sign-off on a printed checklist." },
          { title: "Email Monday-morning instructions", detail: "Login URL, what's changed, where to find the help desk, the war-room contact." },
          { title: "Pre-open the war-room", detail: "Bridge live by 7am Monday. First standup at 9am. Rotate breaks." },
        ],
        outputs: ["Sign-off checklist", "Monday brief", "War-room schedule"],
      },
    ],
    downloads: [
      {
        icon: ShieldCheck,
        format: "PDF · 720 KB",
        title: "Cutover runbook template",
        description: "The hour-by-hour script. Edit owners, durations, and rollback thresholds for your environment.",
        href: "#",
      },
      {
        icon: FileText,
        format: "DOCX · 240 KB",
        title: "Freeze communication pack",
        description: "Email + on-system banner copy you can adapt and schedule.",
        href: "#",
      },
    ],
  },
  {
    slug: "data-migration-workbook",
    category: "implementation",
    format: "Template",
    title: "Master-data migration workbook",
    summary:
      "Pre-formatted XLSX templates for customers, items, vendors, COA, and opening balances — with validation rules baked in.",
    readTime: "Download",
    difficulty: "Foundational",
    updated: "Apr 2026",
    longSummary:
      "Migration goes wrong because data shows up dirty, undocumented, or in the wrong order. This workbook fixes all three: every sheet has the required-field validation, the Bizak data model is documented inline, and the load order is enforced.",
    chapters: [
      {
        id: "what-is-it",
        title: "What's in the workbook",
        intro: "Eight tabs, each pre-formatted to the Bizak import schema, with cell-level validation and inline guidance.",
        tasks: [
          { title: "Master sheets", detail: "Customers, items, vendors, COA, employees, warehouses, currencies, tax codes." },
          { title: "Opening-balance sheets", detail: "Trial balance, AR aging, AP aging, inventory snapshot, fixed-asset register." },
          { title: "Validation pack", detail: "Cell-level rules, dependency checks, and a summary tab that highlights every error before you upload." },
        ],
      },
      {
        id: "how-to-use",
        title: "How to use it",
        intro: "Use it sequentially — the workbook enforces dependencies you can't see in the data.",
        tasks: [
          { title: "Fill master sheets first", detail: "Items can't reference vendors that don't exist yet. The workbook stops you from getting the order wrong." },
          { title: "Run the validation tab", detail: "It highlights every error cell. Don't import until the summary count is zero." },
          { title: "Export the CSV bundle", detail: "One click generates the import bundle Bizak's import wizard accepts." },
        ],
      },
    ],
    downloads: [
      {
        icon: FileSpreadsheet,
        format: "XLSX · 184 KB",
        title: "Migration workbook (current version)",
        description: "Latest schema, validated against Bizak v2026.1.",
        href: "#",
      },
      {
        icon: FileText,
        format: "PDF · 320 KB",
        title: "Field-mapping reference",
        description: "Every column in every sheet, with the matching Bizak field and validation rule.",
        href: "#",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Finance
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "five-day-close",
    category: "finance",
    format: "Playbook",
    title: "Close the books in 5 days, not 5 weeks",
    summary:
      "How modern finance teams shorten month-end with auto-posted journals, scheduled reconciliations, and a tight checklist.",
    readTime: "26 min",
    steps: 11,
    difficulty: "Intermediate",
    updated: "Apr 2026",
    longSummary:
      "The five-day close isn't a tooling problem; it's a process problem. The tooling matters — auto-posting from sub-ledgers, scheduled bank reconciliations, real-time consolidation — but the breakthrough is treating close as a daily discipline instead of a monthly event.",
    pullQuote: {
      quote: "We went from 23 days to 5. The math wasn't magic — it was killing manual journals and refusing to wait for spreadsheets.",
      attribution: "Marcus Tan, Group Controller, Helmsmith",
    },
    chapters: [
      {
        id: "always-on",
        title: "Make the close always-on",
        intro:
          "If you only think about close at month-end, you're already two weeks late. Push the work into the days it happens.",
        tasks: [
          { title: "Auto-post sub-ledger entries", detail: "Sales orders, shipments, invoices, payroll — the journal is posted the moment the event happens." },
          { title: "Reconcile banks daily, not monthly", detail: "Schedule the bank-feed import nightly. Investigate breaks the next morning, not 25 days later." },
          { title: "Run continuous flux analysis", detail: "Bizak compares month-to-date against prior period as it builds. Surprises surface in week one, not week four." },
        ],
        callout: {
          title: "The principle",
          body: "Every transaction that can be posted automatically should be. Manual journals are a smell, not a default.",
        },
      },
      {
        id: "five-day-arc",
        title: "The five-day close arc",
        intro: "Day 1: cutoff. Day 2: reconciliations. Day 3: accruals & FX. Day 4: review. Day 5: report and lock.",
        tasks: [
          { title: "Day 1 — cutoff", detail: "Hard stop on prior-period postings. Run the cutoff scripts. Generate the working trial balance." },
          { title: "Day 2-3 — recs and accruals", detail: "Bank, AR, AP, inventory, intercompany. Then accruals, FX revaluation, and prepaid amortisation." },
          { title: "Day 4 — review and adjust", detail: "Controller reviews flux, signs off on adjustments, and approves the consolidation pack." },
          { title: "Day 5 — report and lock", detail: "Distribute reports, lock the period, archive the close pack for audit." },
        ],
        outputs: ["Closed period", "Audit-ready close pack", "Flux analysis"],
      },
    ],
    downloads: [
      {
        icon: ShieldCheck,
        format: "PDF · 640 KB",
        title: "Five-day close checklist",
        description: "Day-by-day task list with owner columns and dependency markers.",
        href: "#",
      },
      {
        icon: FileSpreadsheet,
        format: "XLSX · 128 KB",
        title: "Reconciliation template pack",
        description: "Bank, AR, AP, intercompany, inventory — formula-driven and Bizak-export-friendly.",
        href: "#",
      },
    ],
    faqs: [
      {
        q: "Is five days realistic for a multi-entity group?",
        a: "Yes, if consolidation is automated and intercompany is reconciled in-month. We see five days at single-entity, seven at three-entity groups, and ten at large multi-currency groups. The arc is the same; the duration scales.",
      },
      {
        q: "What's the first thing to fix?",
        a: "Manual journals. Audit the last three months — what categories of journal showed up every month? Each one is a candidate for automation, and each one you eliminate cuts hours from your close.",
      },
    ],
  },
  {
    slug: "multi-entity-consolidation",
    category: "finance",
    format: "Guide",
    title: "Multi-entity consolidation, step by step",
    summary:
      "Configure intercompany accounts, FX revaluation, and elimination rules — then produce a consolidated P&L in one click.",
    readTime: "20 min",
    steps: 8,
    difficulty: "Advanced",
    updated: "Mar 2026",
    longSummary:
      "Multi-entity consolidation in Bizak is a configuration exercise, not a manual process. Set the entities, the parent, the elimination rules, and the FX policy once — then close in minutes instead of days.",
    chapters: [
      {
        id: "structure",
        title: "Model the legal structure",
        intro: "Get the entities, branches, and ownership percentages right before you touch elimination rules.",
        tasks: [
          { title: "Define entities and branches", detail: "Each legal entity is a Bizak company. Branches/cost centres live inside each entity." },
          { title: "Set ownership percentages", detail: "Tag each subsidiary with its parent and the % owned. Bizak handles minority interest from there." },
          { title: "Establish presentation currency", detail: "One presentation currency for the group. Each entity keeps its functional currency." },
        ],
      },
      {
        id: "intercompany",
        title: "Wire intercompany",
        intro: "If both sides of every intercompany transaction live in Bizak, eliminations become automatic.",
        tasks: [
          { title: "Create intercompany account pairs", detail: "Mirror accounts on both sides. Bizak validates the pairing on every post." },
          { title: "Enable auto-elimination", detail: "Tag each pair as eliminating. The consolidation engine zeros them at group level." },
          { title: "Reconcile monthly", detail: "Even with automation, reconcile balances monthly. Catches mistimed bookings before they compound." },
        ],
        callout: {
          title: "Why this works",
          body: "Manual elimination spreadsheets are where consolidation errors live. Once Bizak sees both sides, the math is deterministic.",
        },
      },
      {
        id: "fx",
        title: "FX revaluation policy",
        intro: "Pick a policy, document it, and let Bizak run it on schedule.",
        tasks: [
          { title: "Choose your rate sources", detail: "ECB, central bank, vendor rate — set the source per currency." },
          { title: "Schedule the FX revaluation job", detail: "Monthly is standard. Weekly for high-volatility currencies." },
          { title: "Configure reporting currency conversion", detail: "Translate at period-end rates for balance-sheet, average rates for P&L. Bizak handles the convention." },
        ],
        outputs: ["Group P&L", "Consolidated balance sheet", "FX revaluation log"],
      },
    ],
    downloads: [
      {
        icon: FileText,
        format: "PDF · 540 KB",
        title: "Consolidation configuration guide",
        description: "Step-by-step screens for the consolidation setup wizard, with worked examples.",
        href: "#",
      },
    ],
  },
  {
    slug: "vat-tds-templates",
    category: "finance",
    format: "Template",
    title: "VAT & TDS reporting templates",
    summary:
      "Filing-ready tax templates aligned to IRD formats, with formulas wired to Bizak's standard ledger exports.",
    readTime: "Download",
    difficulty: "Foundational",
    updated: "May 2026",
    longSummary:
      "Each template maps directly to a Bizak ledger export — drop the export in, the filing summary populates. No formula edits, no rebuild every month.",
    chapters: [
      {
        id: "whats-included",
        title: "What's in the pack",
        intro: "Eight templates covering the most-asked filings, plus a setup guide for tagging tax codes correctly in Bizak.",
        tasks: [
          { title: "VAT — monthly summary", detail: "Outputs, inputs, net liability, with carry-forward logic." },
          { title: "TDS — by section, by deductee", detail: "Section-wise summary plus deductee-level detail tab." },
          { title: "Tagging guide", detail: "How to tag tax codes in Bizak so the templates work without rework." },
        ],
      },
    ],
    downloads: [
      {
        icon: FileSpreadsheet,
        format: "XLSX · 96 KB",
        title: "VAT filing template",
        description: "Monthly VAT summary with formula-driven liability calculation.",
        href: "#",
      },
      {
        icon: FileSpreadsheet,
        format: "XLSX · 112 KB",
        title: "TDS reporting pack",
        description: "Section-wise + deductee-wise tabs, formatted for IRD upload.",
        href: "#",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Inventory
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "cycle-counting",
    category: "inventory",
    format: "Playbook",
    title: "Cycle counting that actually keeps stock accurate",
    summary:
      "Pick the right ABC strategy, schedule counts, reconcile variances, and graduate from yearly audits to continuous accuracy.",
    readTime: "16 min",
    steps: 7,
    difficulty: "Intermediate",
    updated: "Apr 2026",
    longSummary:
      "Annual stock-takes are theatre. Real inventory accuracy comes from counting a slice every day — the right slice — and using variances as a signal, not a surprise.",
    chapters: [
      {
        id: "abc",
        title: "Get the ABC strategy right",
        intro: "Not all SKUs deserve the same attention. Sort by value contribution, count high-value items often, count tail items rarely.",
        tasks: [
          { title: "Run the ABC analysis", detail: "Bizak's stock-value report ranks SKUs by 12-month value. A items: top 80%. B: next 15%. C: tail 5%." },
          { title: "Set count frequencies", detail: "A items: monthly. B items: quarterly. C items: annually. Tune from there based on variance trends." },
          { title: "Schedule in Bizak", detail: "Cycle-count tasks auto-generate based on the frequency. Counters open them on mobile, count, submit." },
        ],
      },
      {
        id: "variances",
        title: "Make variances a signal, not a panic",
        intro: "Every variance has a cause. Investigate the recurring ones — that's where process is broken.",
        tasks: [
          { title: "Set variance thresholds", detail: "Auto-accept variances under 1% on B/C items. Investigate everything above. A items: investigate every variance." },
          { title: "Tag the root cause", detail: "Picking error, receiving error, theft, system mis-post. The tag drives the corrective action." },
          { title: "Review monthly", detail: "Trends matter more than incidents. If picking errors spike, the process needs work — not the count." },
        ],
        outputs: ["Cycle-count schedule", "Variance log", "Root-cause trends"],
      },
    ],
    downloads: [
      {
        icon: ShieldCheck,
        format: "PDF · 380 KB",
        title: "Cycle-count program template",
        description: "ABC tiering rules, count frequencies, variance thresholds — edit to fit your warehouse.",
        href: "#",
      },
    ],
  },
  {
    slug: "multi-warehouse-setup",
    category: "inventory",
    format: "Guide",
    title: "Multi-warehouse setup for distribution teams",
    summary:
      "Model bins, transfer routes, reorder rules, and 3PL handoffs in Bizak — without losing the single-source-of-truth.",
    readTime: "19 min",
    steps: 10,
    difficulty: "Intermediate",
    updated: "Mar 2026",
    longSummary:
      "Multi-warehouse complexity comes from getting the model wrong, not from the number of warehouses. Get the bin hierarchy, transfer rules, and 3PL boundaries right and the rest is configuration.",
    chapters: [
      {
        id: "model",
        title: "Model the warehouse hierarchy",
        intro: "Warehouse → zone → aisle → rack → bin. Most teams don't need all five — pick the depth that matches how you actually pick.",
        tasks: [
          { title: "Pick a depth that matches operations", detail: "Two-zone warehouse? Don't model aisles. Pick-by-zone warehouse? Don't model racks." },
          { title: "Define bin types", detail: "Receiving, putaway, pick, ship, quarantine. Each has different rules." },
          { title: "Set capacity constraints", detail: "Where it matters — high-velocity bins, refrigerated zones, hazmat areas." },
        ],
      },
      {
        id: "transfers",
        title: "Transfer rules that don't lose stock",
        intro: "Every transfer is an in-transit balance somewhere. Make that balance visible and own it.",
        tasks: [
          { title: "Enable in-transit accounts", detail: "Stock leaves source warehouse, sits in in-transit, arrives at destination. Visible on every report." },
          { title: "Require dispatch + receipt confirmations", detail: "Two-step transfer prevents losing stock between sites." },
          { title: "Reconcile in-transit weekly", detail: "Anything in-transit longer than the agreed lead time is a trigger to investigate." },
        ],
        callout: {
          title: "3PL boundary",
          body: "Treat 3PLs as a Bizak warehouse with restricted permissions. Stock movements still post in Bizak; the 3PL just has a narrower view.",
        },
        outputs: ["Warehouse model", "Transfer ruleset", "3PL access matrix"],
      },
    ],
    downloads: [
      {
        icon: FileText,
        format: "PDF · 420 KB",
        title: "Warehouse modeling worksheet",
        description: "Decide depth, bin types, and transfer rules before you configure.",
        href: "#",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Manufacturing
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "bom-design",
    category: "manufacturing",
    format: "Guide",
    title: "Building a BOM your floor will actually follow",
    summary:
      "Routings, scrap factors, alternate components, and revisions — modelled so production reflects what really happens at the line.",
    readTime: "24 min",
    steps: 9,
    difficulty: "Advanced",
    updated: "Apr 2026",
    longSummary:
      "BOMs that don't match the line cause yield problems, costing problems, and trust problems. Get the BOM right and the rest of manufacturing — work orders, MRP, costing — falls into place.",
    chapters: [
      {
        id: "structure",
        title: "Structure the BOM around the line",
        intro: "Model the BOM the way the line builds the product, not the way engineering drew it.",
        tasks: [
          { title: "Phantom assemblies for in-line subs", detail: "If a sub-assembly is built and consumed in the same WO, make it phantom. Cleaner reporting, accurate costing." },
          { title: "Alternates with priority", detail: "List substitutes in priority order. MRP picks the highest-priority available." },
          { title: "Scrap factors per operation", detail: "Per-operation scrap is more accurate than a single line-level factor and surfaces where waste is concentrated." },
        ],
      },
      {
        id: "routings",
        title: "Routings that match the floor",
        intro: "Time-and-motion the routing — don't cut and paste from the engineering doc.",
        tasks: [
          { title: "Define each operation", detail: "Setup time, run time per unit, work centre, required skills." },
          { title: "Capture move and queue time", detail: "Real lead time = setup + run + move + queue. Skip these and your MRP underestimates." },
          { title: "Tag inspection points", detail: "First-piece, in-process, final. Each generates a quality task in Bizak." },
        ],
      },
      {
        id: "revisions",
        title: "Revisions without breaking history",
        intro: "Engineering changes happen. Manage them so you can still cost, audit, and trace anything you've ever built.",
        tasks: [
          { title: "Effective-date your changes", detail: "Bizak applies revisions based on WO start date — old WOs stay on old BOM." },
          { title: "Tag the change reason", detail: "Cost reduction, quality fix, supplier change. Searchable later when you need to explain a yield blip." },
          { title: "Review revision impact", detail: "Bizak shows MRP, open WO, and cost impact before you release the change." },
        ],
        outputs: ["Production-ready BOM", "Routing pack", "Change log"],
      },
    ],
    downloads: [
      {
        icon: FileSpreadsheet,
        format: "XLSX · 144 KB",
        title: "BOM import template",
        description: "Multi-level BOM with phantoms, alternates, scrap factors — pre-validated.",
        href: "#",
      },
    ],
  },
  {
    slug: "real-time-oee",
    category: "manufacturing",
    format: "Playbook",
    title: "Standing up real-time OEE in 14 days",
    summary:
      "Wire shop-floor signals into Bizak, define availability/performance/quality, and publish your first live OEE dashboard.",
    readTime: "21 min",
    steps: 8,
    difficulty: "Advanced",
    updated: "Apr 2026",
    longSummary:
      "OEE in fourteen days is achievable when you stop trying to instrument everything and focus on the bottleneck. Get one live cell instrumented, prove the dashboard, then expand.",
    pullQuote: {
      quote:
        "Day one we saw the bottleneck wasn't the press, it was the changeover. We'd been wrong about that for two years.",
      attribution: "Hiroshi Watanabe, Plant Manager, Daikin Tools",
    },
    chapters: [
      {
        id: "scope",
        title: "Pick the smallest worthwhile scope",
        intro:
          "Don't instrument the whole plant in week one. Pick one cell — ideally the bottleneck — and prove the model.",
        tasks: [
          { title: "Identify the bottleneck cell", detail: "The cell whose output gates plant throughput. That's where OEE matters most." },
          { title: "Confirm signal availability", detail: "Cycle counts, downtime reasons, scrap counts. Do you have them, and how often?" },
          { title: "Define the baseline", detail: "Manually estimate current OEE so you have something to compare against." },
        ],
      },
      {
        id: "wire-it",
        title: "Wire the signals",
        intro:
          "Three signals: machine state (running/down), cycle count, scrap count. Anything else is layer-two.",
        tasks: [
          { title: "Connect via Bizak Manufacturing connector", detail: "PLC → Bizak edge agent → cloud. Standard middleware for all major PLC families." },
          { title: "Map downtime reasons", detail: "Operator tablets prompt for reasons on each downtime event. Limit to ten reasons; expand later." },
          { title: "Validate against manual logs", detail: "First week: run both systems. Reconcile daily. Calibrate." },
        ],
        callout: {
          title: "Don't over-engineer",
          body: "OEE accuracy gets to 'good enough' fast. Spend time on what you do with the data, not on chasing the last 2% of signal fidelity.",
        },
      },
      {
        id: "dashboard",
        title: "Publish a dashboard people use",
        intro: "If the dashboard isn't on a screen the line lead checks every shift, you've built the wrong dashboard.",
        tasks: [
          { title: "Build the live OEE view", detail: "Real-time A x P x Q with shift-to-date trend." },
          { title: "Add downtime Pareto", detail: "Top reasons, ranked. Updated live. The conversation starter at every shift huddle." },
          { title: "Surface on the floor", detail: "TV at the cell. Tablet in the supervisor's pocket. Mobile alert when downtime exceeds threshold." },
        ],
        outputs: ["Live OEE dashboard", "Downtime Pareto", "Shift-handover view"],
      },
    ],
    downloads: [
      {
        icon: FileText,
        format: "PDF · 580 KB",
        title: "OEE rollout checklist",
        description: "14-day calendar with daily tasks and gate criteria.",
        href: "#",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Sales
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "pipeline-design",
    category: "sales",
    format: "Playbook",
    title: "Designing a pipeline that finance trusts",
    summary:
      "Align stages, weight forecasts, and tie quotes-to-cash so finance and sales share one number — every Monday.",
    readTime: "17 min",
    steps: 6,
    difficulty: "Intermediate",
    updated: "Mar 2026",
    longSummary:
      "Sales and finance argue about the forecast because they're looking at different numbers. The fix isn't a better dashboard — it's a pipeline both teams have signed off on.",
    chapters: [
      {
        id: "stages",
        title: "Define stages with exit criteria",
        intro: "A stage isn't a feeling. Each one has objective entry and exit criteria everyone agrees on.",
        tasks: [
          { title: "Six stages, no more", detail: "Lead, Qualified, Discovery, Proposal, Negotiation, Closed. Anything more is internal politics." },
          { title: "Document exit criteria", detail: "Stage 3 → 4: champion identified, decision criteria written, budget confirmed. Either it's done or it isn't." },
          { title: "Audit weekly", detail: "Sales ops randomly samples 10 deals/week. Stages used wrong = a coaching moment, not a hidden forecast." },
        ],
      },
      {
        id: "forecast",
        title: "Weight the forecast honestly",
        intro: "Probability per stage, not per rep mood. Document it, calibrate it quarterly.",
        tasks: [
          { title: "Set base probabilities per stage", detail: "Discovery 25%, Proposal 50%, Negotiation 75%, Verbal 90%. Adjust based on win-rate history." },
          { title: "Track stage-conversion rates", detail: "Bizak shows the actual conversion rate per stage. If your assumed % drifts from actual, recalibrate." },
          { title: "Publish the weighted forecast", detail: "One view, everyone reads it. Sales, finance, leadership." },
        ],
        outputs: ["Pipeline definition", "Weighted forecast", "Conversion benchmarks"],
      },
    ],
    downloads: [
      {
        icon: FileText,
        format: "PDF · 320 KB",
        title: "Pipeline definition template",
        description: "Six stages with exit criteria, fill in your specifics.",
        href: "#",
      },
    ],
  },
  {
    slug: "quote-to-invoice-templates",
    category: "sales",
    format: "Template",
    title: "Quote-to-invoice workflow templates",
    summary:
      "Pre-built approval flows for discounts, margins, and credit limits — drop into Bizak Workflow Automation.",
    readTime: "Download",
    difficulty: "Foundational",
    updated: "May 2026",
    longSummary:
      "Quote-to-invoice slows down because of human approval bottlenecks. These templates encode the policy your CFO has signed off on, route automatically, and audit themselves.",
    chapters: [
      {
        id: "whats-included",
        title: "Pack contents",
        intro: "Three workflow JSONs, ready to import. Edit thresholds, edit approvers, ship.",
        tasks: [
          { title: "Discount approval flow", detail: "Tiered: under 5% auto-approve, 5–15% manager, 15%+ CFO." },
          { title: "Credit-limit override flow", detail: "Routes overrides above customer credit limit to AR + finance." },
          { title: "Margin-floor exception flow", detail: "Trips when quote margin drops below your floor. Routes to commercial lead." },
        ],
      },
    ],
    downloads: [
      {
        icon: Workflow,
        format: "JSON · 14 KB",
        title: "Quote-to-invoice workflow pack",
        description: "Three JSONs, edit thresholds and approvers in the import wizard.",
        href: "#",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // People & enablement
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "user-training-rollout",
    category: "people",
    format: "Playbook",
    title: "Train 100 users in two weeks",
    summary:
      "Role-based curricula, certification path, and the 'shadow & switch' rollout that gets adoption above 90%.",
    readTime: "15 min",
    steps: 7,
    difficulty: "Foundational",
    updated: "Apr 2026",
    longSummary:
      "Adoption isn't a training problem; it's a confidence problem. Train people on the workflow they'll actually run, certify them in the tool, and they'll switch the day you ask them to.",
    chapters: [
      {
        id: "curriculum",
        title: "Role-based curricula, not generic tours",
        intro: "An AP clerk doesn't need to see the manufacturing module. Cut the curriculum to what each role does.",
        tasks: [
          { title: "Map roles to workflows", detail: "Finance: invoicing, AP, recs, close. Sales: leads, quotes, orders. Each role gets exactly the workflows they own." },
          { title: "Build certification tasks", detail: "Each curriculum ends in a sandbox task. Pass it = certified. No theory exam." },
          { title: "Set a certification deadline", detail: "Two weeks before go-live, every named user must be certified or escalated." },
        ],
      },
      {
        id: "shadow-switch",
        title: "Shadow & switch",
        intro: "Don't tell people to use the new system. Have them shadow someone who already does, then switch.",
        tasks: [
          { title: "Pair learners with champions", detail: "Each new user shadows a champion for one full workflow run." },
          { title: "Do the switch on a quiet day", detail: "Pick the day of the week with the lowest transaction volume. Reduces stakes." },
          { title: "Measure adoption daily", detail: "Bizak shows per-user activity. Anyone <80% of expected volume in week one gets a coaching call." },
        ],
        outputs: ["Certified users", "Champion pairings", "Adoption dashboard"],
      },
    ],
    downloads: [
      {
        icon: FileText,
        format: "PDF · 360 KB",
        title: "Role-based curriculum templates",
        description: "Finance, Sales, Ops, Manager — pre-built modules to adapt.",
        href: "#",
      },
    ],
  },
  {
    slug: "guided-product-tour",
    category: "people",
    format: "Video",
    title: "Bizak in 30 minutes — guided product tour",
    summary:
      "A narrated walkthrough of the modules that matter on day one. Share it with new joiners before their first login.",
    readTime: "32 min watch",
    difficulty: "Foundational",
    updated: "May 2026",
    longSummary:
      "Thirty minutes to the operator's mental model: where things live, how the modules connect, and what the most-used workflows look like. Built for new joiners on day one.",
    chapters: [
      {
        id: "what-you-see",
        title: "What the tour covers",
        intro: "Six chapters, played in order, each focused on a different operator's day.",
        tasks: [
          { title: "00:00 — The Bizak shape", detail: "How modules connect, how navigation works, where to find help." },
          { title: "05:00 — Finance basics", detail: "Invoicing, AP, recs — the daily finance workflows." },
          { title: "12:00 — Sales basics", detail: "Leads to quotes to orders — the customer-facing arc." },
          { title: "20:00 — Inventory & operations", detail: "Stock, transfers, work orders — the physical-world basics." },
          { title: "27:00 — Reporting", detail: "Dashboards, drill-down, scheduled reports — the manager's view." },
        ],
      },
    ],
    downloads: [
      {
        icon: PlayCircle,
        format: "MP4 · 320 MB",
        title: "Download the full tour",
        description: "1080p MP4 for offline viewing or LMS upload.",
        href: "#",
      },
    ],
  },
];

// ─── Lookups ──────────────────────────────────────────────────────────────────

export function findResourceBySlug(slug: string | undefined): Resource | undefined {
  if (!slug) return undefined;
  return RESOURCES.find((r) => r.slug === slug);
}

export function findRelatedResources(resource: Resource, limit = 3): Resource[] {
  // Same category first, then fill from any other category if short.
  const sameCat = RESOURCES.filter((r) => r.category === resource.category && r.slug !== resource.slug);
  const others = RESOURCES.filter((r) => r.category !== resource.category && r.slug !== resource.slug);
  return [...sameCat, ...others].slice(0, limit);
}
