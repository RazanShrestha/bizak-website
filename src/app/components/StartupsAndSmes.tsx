import "../../styles/style.css";
import * as React from "react";
import {
  ArrowRight, BarChart3, Building2, Calculator, Check, CheckCircle2,
  ChevronDown, ChevronRight, CreditCard, FileSpreadsheet, KanbanSquare,
  Landmark, Package, Receipt, Rocket, ShoppingCart, Table2, TrendingUp,
  UploadCloud, Users, Workflow, type LucideIcon,
} from "lucide-react";
import {
  Accordion, BadgeGreen, BigCard, Container, DotGrid, Heading, Pill, PillGroup,
  Section, SectionHead, StatusChip, StepCard, Tick,
} from "./bz";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FLOW: { icon: LucideIcon; module: string; title: string; detail: string }[] = [
  { icon: ShoppingCart, module: "Sales & CRM", title: "Order placed",   detail: "SO-1042 confirmed for $4,820" },
  { icon: Package,      module: "Inventory",   title: "Stock reserved",  detail: "3 items allocated · COGS recorded" },
  { icon: Receipt,      module: "Financial",   title: "Invoice raised",  detail: "INV-2046 sent · AR and tax posted" },
  { icon: BarChart3,    module: "Reporting",   title: "Books updated",   detail: "Revenue live on the P&L" },
];

const SYMPTOMS = [
  "The same figure lives in three files and no two of them agree.",
  "Every new hire needs six logins before they can get anything done.",
];

const STACK: { icon: LucideIcon; name: string; cat: string; tag: string }[] = [
  { icon: Calculator,      name: "QuickBooks",    cat: "Accounting & invoicing", tag: "$90/mo" },
  { icon: Users,           name: "HubSpot",       cat: "CRM & pipeline",         tag: "$180/mo" },
  { icon: Table2,          name: "Excel",         cat: "Inventory tracking",     tag: "Manual entry" },
  { icon: FileSpreadsheet, name: "Google Sheets", cat: "Reporting & dashboards", tag: "No live sync" },
  { icon: KanbanSquare,    name: "Trello",        cat: "Tasks & approvals",      tag: "$60/mo" },
  { icon: CreditCard,      name: "Bill.com",      cat: "Vendor payments",        tag: "$79/mo" },
];

const REPLACES: { old: string; icon: LucideIcon; module: string }[] = [
  { old: "QuickBooks",    icon: Landmark,     module: "Financial Management" },
  { old: "HubSpot",       icon: Users,        module: "Sales & CRM" },
  { old: "Excel",         icon: Package,      module: "Inventory" },
  { old: "Bill.com",      icon: ShoppingCart, module: "Purchasing" },
  { old: "Google Sheets", icon: BarChart3,    module: "Dashboards & Reporting" },
  { old: "Trello",        icon: Workflow,     module: "Workflow Automation" },
];

const STAGES: {
  icon: LucideIcon; stage: string; range: string; desc: string;
  modules: string[]; current: boolean;
}[] = [
  {
    icon: Rocket, stage: "Starting out", range: "1 – 25 people", current: true,
    desc: "The essentials, pre-configured invoice, sell and track stock from day one.",
    modules: ["Financial Management", "Sales & CRM", "Inventory"],
  },
  {
    icon: TrendingUp, stage: "Scaling up", range: "25 – 80 people", current: false,
    desc: "Add depth as headcount and order volume climb no migration, no new vendor.",
    modules: ["Purchasing & approvals", "Projects & job costing", "Workflow automation"],
  },
  {
    icon: Building2, stage: "Established", range: "80+ people", current: false,
    desc: "Run multiple branches and entities on one consolidated set of books.",
    modules: ["Multi-company & branches", "Manufacturing", "Advanced reporting"],
  },
];

const FAQS = [
  { q: "How long does it take to get up and running?",            a: "Most teams go live in about three working days. Upload customers, products and open invoices, switch on the modules you need, then invite the team no consultant, no IT project and no migration sprint." },
  { q: "Do I pay for modules I'm not using yet?",                 a: "No. Every module is included in one plan there are no add-ons and no per-seat surprises. Start with Finance, Sales and Inventory, then switch on Purchasing, Projects or Reporting whenever you're ready, on the same system." },
  { q: "Can Bizak import data from QuickBooks, HubSpot or spreadsheets?", a: "Yes. A guided importer pulls customers, products and open invoices straight from CSV exports or your old tools. It maps every column and flags issues before anything saves, so you start clean." },
  { q: "What happens when my team grows past the starter modules?", a: "Nothing breaks and nothing moves. As headcount and order volume climb you switch on Purchasing, job costing, workflow automation, multi-company and more all on the same shared database, with no new vendor and no re-platforming." },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────

function FlowCard({
  icon: Icon, module, title, detail, index,
}: (typeof FLOW)[number] & { index: number }) {
  return (
    <div className="flex flex-1 flex-col rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 md:p-[18px]">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-paper-warm">
          <Icon size={16} strokeWidth={1.7} className="text-bz-olive" />
        </span>
        <span className="text-[10px] font-semibold tabular-nums tracking-[0.08em] text-bz-text-soft">
          0{index}
        </span>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-bz-text-soft">
        {module}
      </span>
      <p className="mt-1.5 text-[14px] font-medium leading-[1.3] text-bz-text">{title}</p>
      <p className="mt-2 text-[11.5px] leading-[1.5] text-bz-text-muted">{detail}</p>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="flex shrink-0 items-center justify-center" aria-hidden>
      <ChevronDown size={15} strokeWidth={2.4} className="text-bz-fire md:hidden" />
      <ChevronRight size={15} strokeWidth={2.4} className="hidden text-bz-fire md:block" />
    </div>
  );
}

function HeroOrderFlow() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive p-5 md:py-18 md:px-16">
      <DotGrid tone="dark" />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-8">
          <span className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">
              One order · every module
            </span>
          </span>
          <StatusChip variant="live">Live</StatusChip>
        </div>

        <div className="flex flex-col gap-2.5 md:flex-row md:items-stretch md:gap-2">
          {FLOW.map((step, i) => (
            <React.Fragment key={step.title}>
              <FlowCard {...step} index={i + 1} />
              {i < FLOW.length - 1 && <FlowConnector />}
            </React.Fragment>
          ))}
        </div>

        <p className="mt-6 text-[12px] leading-[1.6] text-white/[0.55] md:mt-8">
        </p>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>For Startups & SMEs</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Outgrowing spreadsheets?{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>
              Run the whole business on one platform.
            </Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>
        <div className="bz-hero-visual">
          <HeroOrderFlow />
        </div>
      </Container>
    </Section>
  );
}

// ─── 01 · THE BREAKING POINT ──────────────────────────────────────────────────

function StackAuditPanel() {
  return (
    <div className="overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-surface">
      <div className="flex items-center justify-between border-b border-bz-line-soft bg-bz-paper-warm px-5 py-3.5">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">
          Your current stack
        </span>
        <span className="text-[11px] font-medium text-bz-text-muted">6 tools</span>
      </div>
      <div className="flex flex-col">
        {STACK.map(({ icon: Icon, name, cat, tag }) => (
          <div
            key={name}
            className="flex items-center gap-3 border-b border-bz-line-soft px-5 py-3.5 last:border-0"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm">
              <Icon size={15} strokeWidth={1.7} className="text-bz-olive" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-bz-text">{name}</p>
              <p className="text-[11px] text-bz-text-muted">{cat}</p>
            </div>
            <span className="shrink-0 rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">
              {tag}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-bz-olive px-5 py-4">
        <p className="text-[12px] leading-[1.6] text-white/[0.7]">
          <span className="font-medium text-bz-text-on-dark">≈ $410/mo</span> in subscriptions ·{" "}
          <span className="font-medium text-bz-text-on-dark">14 hrs/week</span> reconciling ·{" "}
          <span className="font-medium text-bz-fire">0</span> single source of truth
        </p>
      </div>
    </div>
  );
}

function StackCostSection() {
  return (
    <Section tone="a">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <SectionHead
              index="01"
              label="The breaking point"
              title={
                <>
                  Your stack worked at ten people.{" "}
                  <Heading.Muted>At fifty, it quietly costs you.</Heading.Muted>
                </>
              }
              description="Spreadsheets and single-purpose apps get a small team off the ground."
              spacing="none"
            />
            <ul
              className="flex flex-col gap-3.5"
              style={{ listStyle: "none", padding: 0, margin: "32px 0 0" }}
            >
              {SYMPTOMS.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-3 text-[14px] leading-[1.55] text-bz-text"
                >
                  <Tick size="sm" className="mt-[2px]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <StackAuditPanel />
        </div>
      </Container>
    </Section>
  );
}

// ─── 02 · ONE PLATFORM ────────────────────────────────────────────────────────

function ReplacesVisual() {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.4]">
          You leave behind
        </span>
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-bz-fire">
          You run on
        </span>
      </div>
      {REPLACES.map(({ old, icon: Icon, module }) => (
        <div
          key={module}
          className="flex items-center gap-2.5 rounded-bz-lg border border-white/[0.07] bg-white/[0.05] px-3 py-2.5"
        >
          <span className="w-[88px] shrink-0 text-[11.5px] text-white/[0.42] line-through">
            {old}
          </span>
          <ArrowRight size={13} strokeWidth={2} className="shrink-0 text-bz-fire" />
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <Icon size={13} strokeWidth={1.8} className="shrink-0 text-bz-leaf" />
            <span className="truncate text-[12.5px] font-medium text-bz-text-on-dark">
              {module}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function OnePlatformSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="One platform"
          title={
            <>
              Stop paying the integration tax.{" "}
              <Heading.Muted>Run the whole business on one system.</Heading.Muted>
            </>
          }
          description="Every tool you're juggling maps to a Bizak module. The difference: one shared database instead of six that need syncing."
          titleMaxWidth={780}
        />
        <BigCard
          text={{
            title: "One platform, sized for a growing business.",
            bullets: [
              "Six disconnected tools replaced by a single shared database.",
              "Every module included no add-ons, no per-seat surprises.",
              "Books update in real time, the moment a transaction happens.",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<ReplacesVisual />}
        />
      </Container>
    </Section>
  );
}

// ─── 03 · ONBOARDING ──────────────────────────────────────────────────────────

function StepVisualShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[320px]">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">
        {label}
      </p>
      {children}
    </div>
  );
}

function StepImportVisual() {
  const files = [
    { name: "customers.csv", meta: "1,240 records", done: true },
    { name: "products.csv",  meta: "856 items",     done: true },
    { name: "invoices.csv",  meta: "importing…",    done: false },
  ];
  return (
    <StepVisualShell label="Data import">
      <div className="flex flex-col gap-2 rounded-bz-xl border border-bz-line-soft bg-bz-surface p-4">
        {files.map((f) => (
          <div
            key={f.name}
            className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2.5"
          >
            <div>
              <p className="text-[12px] font-medium text-bz-text">{f.name}</p>
              <p className="text-[10px] text-bz-text-muted">{f.meta}</p>
            </div>
            {f.done ? (
              <CheckCircle2 size={15} strokeWidth={1.9} className="shrink-0 text-emerald-500" />
            ) : (
              <UploadCloud size={15} strokeWidth={1.8} className="shrink-0 text-bz-text-soft" />
            )}
          </div>
        ))}
      </div>
    </StepVisualShell>
  );
}

function StepActivateVisual() {
  const mods = [
    { label: "Financial Management", on: true },
    { label: "Sales & CRM",          on: true },
    { label: "Inventory",            on: true },
    { label: "Purchasing",           on: false },
  ];
  return (
    <StepVisualShell label="Activate modules">
      <div className="flex flex-col gap-2 rounded-bz-xl border border-bz-line-soft bg-bz-surface p-4">
        {mods.map((m) => (
          <div
            key={m.label}
            className={`flex items-center justify-between rounded-bz-md px-3 py-2.5 ${m.on ? "bg-bz-paper-warm" : "border border-bz-line-soft bg-bz-paper"}`}
          >
            <span className="text-[13px] text-bz-text">{m.label}</span>
            <div className={`relative h-4 w-7 rounded-bz-pill ${m.on ? "bg-bz-olive" : "bg-bz-line-soft"}`}>
              <div
                className={`absolute top-0.5 h-3 w-3 rounded-bz-pill ${m.on ? "right-0.5 bg-bz-leaf" : "left-0.5 bg-bz-paper"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </StepVisualShell>
  );
}

function StepLiveVisual() {
  const stats = [
    { v: "$84.2K", l: "Revenue · MTD" },
    { v: "1,240",  l: "Active customers" },
  ];
  return (
    <StepVisualShell label="You're live">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-bz-xl border border-bz-line-soft bg-bz-surface p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire">
            <Rocket size={15} strokeWidth={1.9} className="text-bz-deep" />
          </span>
          <div>
            <p className="text-[12.5px] font-medium text-bz-text">Your business is live</p>
            <p className="text-[10.5px] text-bz-text-muted">4 teammates · 3 modules running</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div
              key={s.l}
              className="rounded-bz-xl border border-bz-line-soft bg-bz-surface p-3.5 text-center"
            >
              <p className="text-[18px] font-medium tabular-nums text-bz-text">{s.v}</p>
              <p className="mt-1 text-[10px] text-bz-text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </StepVisualShell>
  );
}

function GoLiveSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Onboarding"
          title={
            <>
              Live this week <Heading.Muted>not next quarter.</Heading.Muted>
            </>
          }
          description="Bizak is built to be self-served. Most teams import their data, switch on their modules and onboard everyone inside three working days."
          titleMaxWidth={720}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Day one"
            title="Bring your data in"
            bullets={[
              "Upload customers, products and open invoices from CSV or your old tools.",
              "A guided importer maps every column and flags issues before anything saves.",
            ]}
            visual={<StepImportVisual />}
          />
          <StepCard
            number="02"
            tag="Day two"
            title="Switch on the modules you need"
            bullets={[
              "Finance, Sales and Inventory arrive pre-configured for common SME workflows.",
              "Turn on Purchasing, Projects or Reporting whenever you're ready same system.",
            ]}
            visual={<StepActivateVisual />}
          />
          <StepCard
            number="03"
            tag="Day three"
            title="Invite the team and go live"
            bullets={[
              "Role-based access for every teammate no IT admin or consultant required.",
              "Live dashboards light up the moment your first transaction posts.",
            ]}
            visual={<StepLiveVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ─── 04 · BUILT TO SCALE ──────────────────────────────────────────────────────

function StageCard({
  icon: Icon, stage, range, desc, modules, current,
}: (typeof STAGES)[number]) {
  return (
    <div
      className={`flex flex-col rounded-bz-2xl p-6 md:p-7 ${
        current
          ? "border border-bz-fire/35 bg-bz-olive-soft"
          : "border border-white/[0.08] bg-white/[0.03]"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-bz-md bg-white/[0.06]">
          <Icon
            size={18}
            strokeWidth={1.6}
            className={current ? "text-bz-fire" : "text-bz-leaf"}
          />
        </span>
        {current ? (
          <StatusChip variant="live">You are here</StatusChip>
        ) : (
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/[0.4]">
            Add later
          </span>
        )}
      </div>
      <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/[0.45]">
        {range}
      </p>
      <h3 className="bz-bento-title mt-1.5 text-bz-text-on-dark">{stage}</h3>
      <p className="text-[13px] leading-[1.6] text-white/[0.6]">{desc}</p>
      <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.08] pt-5">
        {modules.map((m) => (
          <div key={m} className="flex items-center gap-2.5">
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-bz-pill ${
                current ? "bg-bz-fire" : "bg-white/[0.1]"
              }`}
            >
              <Check
                size={9}
                strokeWidth={3}
                className={current ? "text-bz-deep" : "text-white/[0.55]"}
              />
            </span>
            <span className="text-[12.5px] text-white/[0.82]">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScaleSection() {
  return (
    <Section tone="dark">
      <DotGrid tone="dark" />
      <Container>
        <SectionHead
          index="04"
          label="Built to scale"
          tone="dark"
          title={
            <>
              A system you grow into,{" "}
              <Heading.Muted>never one you outgrow.</Heading.Muted>
            </>
          }
          description="Start with the modules a small team needs. Switch on the rest as you hire."
          titleMaxWidth={720}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {STAGES.map((s) => (
            <StageCard key={s.stage} {...s} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 05 · FAQ ─────────────────────────────────────────────────────────────────

function FAQSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr]">
          {/* Dark intro panel */}
          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-bz-2xl bg-bz-olive p-8 text-bz-text-on-dark">
            <DotGrid tone="dark" />
            <div className="relative">
              <SectionHead
                index="05"
                label="FAQ"
                tone="dark"
                title={<>Frequently asked <Heading.Muted>questions.</Heading.Muted></>}
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="https://system.bizakerp.com/account/self-register" withArrowUpRight>Get Started</Pill>
              <Pill variant="ghostDark" href="/contact" withArrow>Talk to Sales</Pill>
            </PillGroup>
          </div>

          {/* Accordion */}
          <Accordion defaultOpen={null}>
            {FAQS.map((item, i) => (
              <Accordion.Item key={i} question={item.q}>
                {item.a}
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function StartupsAndSmes() {
  return (
    <main>
      <HeroSection />
      <StackCostSection />
      <OnePlatformSection />
      <GoLiveSection />
      <ScaleSection />
      <FAQSection />
    </main>
  );
}
