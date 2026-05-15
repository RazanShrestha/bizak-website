import "../../styles/style.css";
import {
  BarChart3, Check, CheckCircle2, DollarSign, Package,
  Plug, Rocket, Settings, ShoppingCart, Zap,
  type LucideIcon,
} from "lucide-react";
import {
  BadgeGreen, Bento, BentoGrid, BigCard, Container, Heading,
  Pill, PillGroup, Section, SectionHead, StatusChip, StepCard,
} from "./bz";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const BEFORE_TOOLS = [
  { name: "QuickBooks",     sub: "Finance",   lag: "30d stale"  },
  { name: "Excel",          sub: "Inventory", lag: "Manual"     },
  { name: "HubSpot",        sub: "CRM",       lag: "14d stale"  },
  { name: "Google Sheets",  sub: "Reporting", lag: "No sync"    },
];

const AFTER_MODULES = [
  "Financial Mgmt", "Sales & CRM",
  "Inventory",      "Purchasing",
  "Reporting",      "Workflow",
];

const PAINS = [
  {
    icon: Package,
    title: "Spreadsheet overload",
    desc: "Critical data scattered across Excel sheets leads to version conflicts, errors, and decisions based on numbers that are already out of date.",
    tone: "paper" as const,
    footer: (
      <div className="flex flex-col gap-1.5">
        {[
          { name: "Sales_Q1_FINAL.xlsx",     conflict: true  },
          { name: "Inventory_v7_ACTUAL.xlsx", conflict: true  },
          { name: "Finance_Mar_CORRECT.xlsx", conflict: false },
        ].map((f) => (
          <div key={f.name} className="flex items-center justify-between rounded-bz-md border border-bz-line bg-bz-paper px-2.5 py-1.5">
            <span className="text-[11px] text-bz-text truncate">{f.name}</span>
            {f.conflict && (
              <span className="shrink-0 ml-2 text-[9.5px] font-medium text-rose-500">Conflict</span>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "No real-time visibility",
    desc: "Finance closes monthly, inventory counted quarterly. By the time you see a problem, the damage is already done.",
    tone: "dark" as const,
    footer: (
      <div className="flex flex-col gap-1.5">
        {[
          { label: "Cash position",  lag: "30 days stale" },
          { label: "Stock levels",   lag: "3 wks stale"   },
          { label: "Sales pipeline", lag: "14 days stale" },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-bz-md bg-white/[0.06] px-2.5 py-1.5">
            <span className="text-[11px] text-bz-text-on-dark">{r.label}</span>
            <span className="text-[9.5px] font-medium text-rose-400">{r.lag}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Plug,
    title: "Patchwork app stack",
    desc: "Accounting in QuickBooks, CRM in HubSpot, inventory in another tool each integration is a fragile bridge that breaks at the worst time.",
    tone: "paper" as const,
    footer: (
      <div>
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {["QB", "HS", "SH", "GS"].map((app, i) => (
            <span key={app} className="flex items-center gap-1">
              <span className="size-7 rounded-bz-md bg-bz-paper-warm border border-bz-line flex items-center justify-center text-[9px] font-bold text-bz-text">
                {app}
              </span>
              {i < 3 && <span className="w-3 h-px bg-rose-300/60" />}
            </span>
          ))}
        </div>
        <p className="text-center text-[9.5px] font-medium uppercase tracking-wide text-bz-text-muted">
          4 tools · 0 single source of truth
        </p>
      </div>
    ),
  },
];

const MODULES: { icon: LucideIcon; label: string }[] = [
  { icon: DollarSign,   label: "Financial Mgmt" },
  { icon: ShoppingCart, label: "Sales & CRM"     },
  { icon: Package,      label: "Inventory"       },
  { icon: Settings,     label: "Purchasing"      },
  { icon: BarChart3,    label: "Reporting"       },
  { icon: Zap,          label: "Workflow"        },
];

const IMPACT_STATS = [
  {
    value: "50,000+",
    label: "Companies on Bizak",
    desc:  "From 5-person startups to 250-person mid-market businesses, all running on one platform.",
  },
  {
    value: "3 Days",
    label: "Average go-live",
    desc:  "Pre-configured modules for common SME workflows import data, invite your team, and ship.",
  },
  {
    value: "60%",
    label: "Faster month-end close",
    desc:  "Automated reconciliation and auto-posted journals cut close times in half.",
  },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────

function HeroBeforeCard() {
  return (
    <div className="rounded-bz-2xl border border-bz-line-soft bg-bz-surface p-5 flex flex-col sm:min-h-[340px]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
          Before Bizak
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-rose-500 uppercase tracking-wide">
          <span className="size-1.5 rounded-full bg-rose-400 shrink-0" />
          Fragmented
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {BEFORE_TOOLS.map((tool) => (
          <div
            key={tool.name}
            className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2.5"
          >
            <div>
              <p className="text-[12.5px] font-medium text-bz-text">{tool.name}</p>
              <p className="text-[10px] text-bz-text-muted">{tool.sub}</p>
            </div>
            <span className="shrink-0 ml-2 text-[9.5px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
              {tool.lag}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3.5 border-t border-bz-line-soft">
        <p className="text-[10px] font-medium uppercase tracking-wide text-rose-400">
          4 tools · 0 single source of truth
        </p>
      </div>
    </div>
  );
}

function HeroAfterCard() {
  return (
    <div className="rounded-bz-2xl overflow-hidden bg-bz-paper flex flex-col sm:min-h-[340px]">
      <div className="bg-bz-olive px-5 py-3.5 flex items-center justify-between">
        <span className="text-[14px] font-medium text-bz-text-on-dark">
          Bizak<sup className="ml-0.5 text-[8px] opacity-60">®</sup>
        </span>
        <StatusChip variant="live">Live</StatusChip>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="grid grid-cols-2 gap-2 flex-1">
          {AFTER_MODULES.map((mod) => (
            <div
              key={mod}
              className="flex items-center gap-2 rounded-bz-md bg-bz-paper-warm border border-bz-line-soft px-3 py-2.5"
            >
              <span className="size-4 rounded-full bg-bz-fire flex items-center justify-center shrink-0">
                <Check size={9} strokeWidth={2.5} className="text-bz-deep" />
              </span>
              <span className="text-[11.5px] font-medium text-bz-text truncate">{mod}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3.5 border-t border-bz-line-soft">
          <p className="text-[10px] font-medium uppercase tracking-wide text-bz-text-muted">
            6 modules · one platform · real-time
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>ERP for Startups & SMEs</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Replace your tools. Run your business{" "}
            <Heading.Muted>on one platform, live in three days.</Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>
        <div className="bz-hero-visual mx-auto w-full max-w-[1080px] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <HeroBeforeCard />
          <HeroAfterCard />
        </div>
      </Container>
    </Section>
  );
}

// ─── PAIN POINTS ──────────────────────────────────────────────────────────────

function PainSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The problem"
          title={
            <>
              Disconnected tools{" "}
              <Heading.Muted>don't scale with your business.</Heading.Muted>
            </>
          }
          description="Manual processes and patched-together apps work at ten employees. At fifty, they collapse and your team pays the price."
          titleMaxWidth={700}
        />
        <BentoGrid cols={3}>
          {PAINS.map(({ icon: Icon, title, desc, tone, footer }) => (
            <Bento key={title} tone={tone} hover dotGrid={tone === "dark"} minHeight={340}>
              <Bento.Header
                title={title}
                icon={
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                    color={tone === "dark" ? "#DBE9B8" : "#1F3422"}
                  />
                }
              />
              <Bento.Desc>{desc}</Bento.Desc>
              <Bento.Footer tone={tone === "dark" ? "dark" : "light"}>
                {footer}
              </Bento.Footer>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ─── PLATFORM OVERVIEW ────────────────────────────────────────────────────────

function ModuleGridVisual() {
  return (
    <div className="grid grid-cols-2 gap-2.5 p-6 md:p-8">
      {MODULES.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-bz-lg border border-white/[0.1] bg-white/[0.05] px-3 py-3"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-fire/10">
            <Icon size={14} strokeWidth={1.8} className="text-bz-fire" />
          </span>
          <span className="text-[12px] font-medium text-bz-text-on-dark">{label}</span>
        </div>
      ))}
    </div>
  );
}

function PlatformSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="One platform"
          title={
            <>
              Every module your business needs,{" "}
              <Heading.Muted>connected by design.</Heading.Muted>
            </>
          }
          titleMaxWidth={680}
        />
        <BigCard
          text={{
            title: "The operating system for growing businesses.",
            body: "Replace your disconnected tools with a single system where finance, sales, and inventory work together auto-posting every transaction to the ledger the moment it happens.",
            bullets: [
              "Finance, payables and reconciliation auto-posted",
              "Sales pipeline and CRM connected to inventory",
              "Purchasing, warehousing and reporting one ledger",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Talk to Sales",
            },
          }}
          visual={<ModuleGridVisual />}
        />
      </Container>
    </Section>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function StepImportVisual() {
  const files = [
    { name: "Customers.csv",  count: "1,240 records", done: true  },
    { name: "Products.csv",   count: "856 items",     done: true  },
    { name: "Invoices.csv",   count: "3,102 entries", done: false },
  ];
  return (
    <div className="flex flex-col gap-2 p-4 md:p-6">
      {files.map((f) => (
        <div
          key={f.name}
          className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2.5"
        >
          <div>
            <p className="text-[12.5px] font-medium text-bz-text">{f.name}</p>
            <p className="text-[10.5px] text-bz-text-muted">{f.count}</p>
          </div>
          {f.done
            ? <CheckCircle2 size={16} strokeWidth={1.8} className="text-emerald-500 shrink-0" />
            : <span className="size-2.5 rounded-full border-2 border-bz-line shrink-0 animate-pulse" />
          }
        </div>
      ))}
    </div>
  );
}

function StepModulesVisual() {
  const mods = [
    { label: "Financial Management", active: true  },
    { label: "Sales & CRM",          active: true  },
    { label: "Inventory",            active: true  },
    { label: "Purchasing",           active: false },
  ];
  return (
    <div className="flex flex-col gap-2 p-4 md:p-6">
      {mods.map((m) => (
        <div
          key={m.label}
          className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2.5"
        >
          <span className="text-[12.5px] font-medium text-bz-text">{m.label}</span>
          <span
            className={`text-[9.5px] font-medium uppercase tracking-wide px-2 py-0.5 rounded ${
              m.active
                ? "bg-bz-fire/20 text-[#1F3422]"
                : "bg-bz-paper-warm text-bz-text-muted"
            }`}
          >
            {m.active ? "Active" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );
}

function StepLiveVisual() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-bz-lg bg-bz-paper-warm border border-bz-line-soft px-4 py-3.5">
        <span className="size-8 rounded-full bg-bz-fire/20 flex items-center justify-center shrink-0">
          <Rocket size={15} strokeWidth={1.8} className="text-[#1F3422]" />
        </span>
        <div>
          <p className="text-[13px] font-medium text-bz-text">Your business is live</p>
          <p className="text-[10.5px] text-bz-text-muted">3 modules active · 4 users onboarded</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { val: "$84K",  lbl: "Revenue MRR"       },
          { val: "1,240", lbl: "Active Customers"  },
        ].map((s) => (
          <div
            key={s.lbl}
            className="rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2.5 text-center"
          >
            <p className="text-[18px] font-medium text-bz-text">{s.val}</p>
            <p className="text-[10px] text-bz-text-muted mt-0.5">{s.lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Quick start"
          title={
            <>
              From sign-up to live{" "}
              <Heading.Muted>in three days.</Heading.Muted>
            </>
          }
          description="Pre-configured modules for common SME workflows. Import your data, invite your team, and go live no consultant needed."
          titleMaxWidth={680}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Day 1"
            title="Import your existing data"
            bullets={[
              "Upload customers, products and historical transactions via CSV",
              "Our guided importer maps columns and validates in minutes",
            ]}
            visual={<StepImportVisual />}
          />
          <StepCard
            number="02"
            tag="Day 2"
            title="Activate the modules you need"
            bullets={[
              "Finance, Sales and Inventory ship pre-configured for SME workflows",
              "Add Purchasing, Projects or Reporting any time as your team grows",
            ]}
            visual={<StepModulesVisual />}
          />
          <StepCard
            number="03"
            tag="Day 3"
            title="Invite your team and go live"
            bullets={[
              "Role-based access for every team member no IT department required",
              "Real-time dashboards activate the moment your first transaction posts",
            ]}
            visual={<StepLiveVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ─── IMPACT ───────────────────────────────────────────────────────────────────

function ImpactSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="04"
          label="Impact"
          title={
            <>
              Real results{" "}
              <Heading.Muted>for growing businesses.</Heading.Muted>
            </>
          }
          titleMaxWidth={680}
        />
        <BentoGrid cols={3}>
          {IMPACT_STATS.map((s) => (
            <Bento key={s.label} tone="paper" hover minHeight={220}>
              <div className="bz-stat-num" style={{ fontSize: 48, marginBottom: 12 }}>
                {s.value}
              </div>
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
                {s.label}
              </div>
              <Bento.Desc>{s.desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function StartupsAndSmes() {
  return (
    <main>
      <HeroSection />
      <PainSection />
      <PlatformSection />
      <OnboardingSection />
      <ImpactSection />
    </main>
  );
}
