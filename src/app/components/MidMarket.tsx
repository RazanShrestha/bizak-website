import "../../styles/style.css";
import * as React from "react";
import {
  ArrowRight, BarChart3, Building2, Check, CheckCircle2,
  ChevronDown, ChevronRight, CreditCard, FolderOpen, GitMerge,
  Globe, Landmark, Layers, Mail, Rocket, Server, Table2, TrendingUp,
  UploadCloud, Users, Workflow, type LucideIcon,
} from "lucide-react";
import {
  Accordion, BadgeGreen, BigCard, Container, DotGrid, Heading, Pill, PillGroup,
  Section, SectionHead, StatusChip, StepCard, Tick,
} from "./bz";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FLOW: { icon: LucideIcon; module: string; title: string; detail: string }[] = [
  { icon: Building2, module: "Multi-company", title: "Branches close",  detail: "Kathmandu, Delhi and Dhaka post locally" },
  { icon: GitMerge,  module: "Intercompany",  title: "Entries matched", detail: "Interco balances auto-eliminated" },
  { icon: Layers,    module: "Consolidation", title: "Group rolled up", detail: "Three currencies translated to group" },
  { icon: BarChart3, module: "Reporting",     title: "Board pack live", detail: "Consolidated P&L ready to send" },
];

const SYMPTOMS = [
  "Month-end close means a week of exporting, re-keying and reconciling across every entity.",
  "Approvals live in email chains, so no one can prove who signed off on what.",
];

const STACK: { icon: LucideIcon; name: string; cat: string; tag: string }[] = [
  { icon: Server,     name: "Entry-level ERP",  cat: "Core accounting",       tag: "Maxed out" },
  { icon: Table2,     name: "Excel",            cat: "Group consolidation",   tag: "Manual, monthly" },
  { icon: Mail,       name: "Email threads",    cat: "Purchase approvals",    tag: "No audit trail" },
  { icon: BarChart3,  name: "Standalone BI",    cat: "Board reporting",       tag: "$240/mo" },
  { icon: CreditCard, name: "Separate payroll", cat: "HR & payroll",          tag: "Disconnected" },
  { icon: FolderOpen, name: "Shared drive",     cat: "Contracts & documents", tag: "Untracked" },
];

const REPLACES: { old: string; icon: LucideIcon; module: string }[] = [
  { old: "Entry-level ERP",  icon: Landmark,   module: "Multi-Entity Financials" },
  { old: "Excel",            icon: Layers,     module: "Group Consolidation" },
  { old: "Email threads",    icon: Workflow,   module: "Approval Workflows" },
  { old: "Standalone BI",    icon: BarChart3,  module: "Executive Dashboards" },
  { old: "Separate payroll", icon: Users,      module: "HR & Payroll" },
  { old: "Shared drive",     icon: FolderOpen, module: "Document Management" },
];

const STAGES: {
  icon: LucideIcon; stage: string; range: string; desc: string;
  modules: string[]; current: boolean;
}[] = [
  {
    icon: Building2, stage: "Multi-entity", range: "25 – 250 people", current: true,
    desc: "Run several branches and currencies on one consolidated set of books.",
    modules: ["Multi-entity financials", "Approval workflows", "Executive dashboards"],
  },
  {
    icon: TrendingUp, stage: "Multi-region group", range: "250 – 500 people", current: false,
    desc: "Add depth as entities and regions multiply no migration, no new vendor.",
    modules: ["Multi-currency consolidation", "Intercompany eliminations", "Advanced RBAC"],
  },
  {
    icon: Globe, stage: "Enterprise scale", range: "500+ people", current: false,
    desc: "Run a regional group with the controls, SLAs and governance enterprise demands.",
    modules: ["Unlimited entities", "SSO, SCIM and custom SLA", "Dedicated success team"],
  },
];

const FAQS = [
  { q: "How long does a multi-entity rollout actually take?",            a: "Most groups go live in about thirty days. We migrate each entity's ledger and open balances, configure your branches and approval chains, then onboard every team no eighteen-month implementation and no IT project." },
  { q: "Can Bizak consolidate entities in different currencies?",        a: "Yes. Each branch keeps its own books in its local currency, and Bizak translates and rolls them up into one group view automatically. Intercompany balances are matched and eliminated for you, every close." },
  { q: "Do we need a consultant or in-house IT to customise it?",        a: "No. Entities, currencies, approval chains and permissions are all configured in the product no custom code and no professional-services contract. Your finance team owns the setup, not IT." },
  { q: "We've already invested in an ERP. Why switch to Bizak?",         a: "Because an entry-level system bills you for every workaround you build to keep it alive. Bizak includes multi-entity consolidation, approval workflows and executive reporting in one plan so the system grows with the group, not against it." },
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
              One close · every entity
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
          <BadgeGreen style={{ marginBottom: 28 }}>For Mid-Market Companies</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Outgrown your entry-level ERP?{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>
              Run every branch on one platform.
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
          Your current setup
        </span>
        <span className="text-[11px] font-medium text-bz-text-muted">6 systems</span>
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
          <span className="font-medium text-bz-text-on-dark">≈ 9 days</span> on every close ·{" "}
          <span className="font-medium text-bz-text-on-dark">3 entities</span> reconciled by hand ·{" "}
          <span className="font-medium text-bz-fire">0</span> real-time group view
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
                  Your ERP worked at one entity.{" "}
                  <Heading.Muted>At three, it quietly costs you.</Heading.Muted>
                </>
              }
              description="An entry-level ERP gets a single company off the ground."
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
              Stop paying enterprise prices for half a system.{" "}
              <Heading.Muted>Run the whole group on one platform.</Heading.Muted>
            </>
          }
          description="Every system you've bolted together maps to a Bizak module. The difference: one shared database across every entity, instead of six that need reconciling."
          titleMaxWidth={780}
        />
        <BigCard
          text={{
            title: "One platform, sized for a multi-entity group.",
            bullets: [
              "Every entity, currency and approval on one consolidated ledger.",
              "Group books update in real time, the moment a branch posts.",
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

// ─── 03 · ROLLOUT ─────────────────────────────────────────────────────────────

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
    { name: "kathmandu-hq.csv", meta: "Ledger + balances", done: true },
    { name: "delhi.csv",        meta: "Ledger + balances", done: true },
    { name: "dhaka.csv",        meta: "importing…",        done: false },
  ];
  return (
    <StepVisualShell label="Entity migration">
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
    { label: "Multi-entity ledger", on: true },
    { label: "Approval workflows",  on: true },
    { label: "Consolidation",       on: true },
    { label: "Advanced RBAC",       on: false },
  ];
  return (
    <StepVisualShell label="Configure modules">
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
    { v: "$4.24M", l: "Group revenue · MTD" },
    { v: "3",      l: "Entities consolidated" },
  ];
  return (
    <StepVisualShell label="You're live">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-bz-xl border border-bz-line-soft bg-bz-surface p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire">
            <Rocket size={15} strokeWidth={1.9} className="text-bz-deep" />
          </span>
          <div>
            <p className="text-[12.5px] font-medium text-bz-text">Your group is live</p>
            <p className="text-[10.5px] text-bz-text-muted">5 teams · 3 entities consolidated</p>
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
          label="Rollout"
          title={
            <>
              Live in thirty days <Heading.Muted>not eighteen months.</Heading.Muted>
            </>
          }
          description="Bizak rolls out without an IT project. Most groups migrate their entities, configure their approvals and onboard every team inside thirty working days."
          titleMaxWidth={720}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Week one"
            title="Bring every entity in"
            bullets={[
              "Migrate the chart of accounts, customers and open balances for each branch.",
              "A guided importer maps every column and flags issues before anything saves.",
            ]}
            visual={<StepImportVisual />}
          />
          <StepCard
            number="02"
            tag="Week two"
            title="Map entities and approval chains"
            bullets={[
              "Configure each branch, currency and intercompany rule with no custom code.",
              "Build role-based approval chains for POs, budgets and journals same system.",
            ]}
            visual={<StepActivateVisual />}
          />
          <StepCard
            number="03"
            tag="Week three"
            title="Onboard the group and go live"
            bullets={[
              "Role-based access for every team across every entity no IT bottleneck.",
              "Consolidated dashboards light up the moment your first branch posts.",
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
          description="Start with what a multi-entity group needs today. Switch on the rest as you expand into new regions."
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

export function MidMarket() {
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
