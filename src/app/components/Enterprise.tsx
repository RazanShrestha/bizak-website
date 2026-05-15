import "../../styles/style.css";
import * as React from "react";
import {
  ArrowLeftRight, ArrowRight, BarChart3, Building2, Cable, Check, CheckCircle2,
  ChevronDown, ChevronRight, Coins, Database, FileSpreadsheet, GitMerge, Globe,
  Landmark, Layers, Plug, Rocket, Server, ShieldCheck, Table2, TrendingUp,
  UploadCloud, type LucideIcon,
} from "lucide-react";
import {
  Accordion, BadgeGreen, BigCard, Container, DotGrid, Heading, Pill, PillGroup,
  Section, SectionHead, StatusChip, StepCard, Tick,
} from "./bz";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FLOW: { icon: LucideIcon; module: string; title: string; detail: string }[] = [
  { icon: Building2, module: "Entities",      title: "Books closed",        detail: "67 entities locked for the period" },
  { icon: Coins,     module: "Currencies",    title: "FX revalued",         detail: "40 currencies translated to group" },
  { icon: GitMerge,  module: "Consolidation", title: "Intercompany cleared", detail: "Eliminations posted automatically" },
  { icon: BarChart3, module: "Reporting",     title: "Group P&L live",      detail: "Board pack ready in real time" },
];

const SYMPTOMS = [
  "Month-end takes three weeks because every region closes on a different system.",
  "Every upgrade risks breaking a dozen brittle point-to-point integrations.",
];

const STACK: { icon: LucideIcon; name: string; cat: string; tag: string }[] = [
  { icon: Server,          name: "SAP ECC",            cat: "Core finance · HQ",        tag: "On-prem"           },
  { icon: Database,        name: "Oracle EBS",         cat: "APAC subsidiaries",        tag: "Separate instance" },
  { icon: Layers,          name: "Hyperion",           cat: "Group consolidation",      tag: "Manual upload"     },
  { icon: Table2,          name: "Excel",              cat: "Intercompany eliminations", tag: "Manual entry"      },
  { icon: FileSpreadsheet, name: "Local GL packages",  cat: "12 regional entities",     tag: "Unsynced"          },
  { icon: Cable,           name: "Point-to-point glue", cat: "Custom integrations",      tag: "Brittle"           },
];

const REPLACES: { old: string; icon: LucideIcon; module: string }[] = [
  { old: "SAP ECC",       icon: Landmark,      module: "Multi-entity Financials"   },
  { old: "Hyperion",      icon: GitMerge,      module: "Live Consolidation"        },
  { old: "Oracle EBS",    icon: Globe,         module: "Global Operations"         },
  { old: "Excel",         icon: ArrowLeftRight, module: "Intercompany Eliminations" },
  { old: "Manual filing", icon: ShieldCheck,   module: "Compliance Automation"     },
  { old: "Custom glue",   icon: Plug,          module: "Open Integration Platform" },
];

const STAGES: {
  icon: LucideIcon; stage: string; range: string; desc: string;
  modules: string[]; current: boolean;
}[] = [
  {
    icon: Building2, stage: "Your group today", range: "67 legal entities", current: true,
    desc: "Run your current structure on one consolidated ledger, closing every entity together.",
    modules: ["Multi-entity consolidation", "40+ currencies", "IFRS & GAAP reporting"],
  },
  {
    icon: TrendingUp, stage: "The next acquisition", range: "+ new entities", current: false,
    desc: "Onboard an acquired company onto the group books in days, not a migration project.",
    modules: ["New-entity templates", "Chart-of-accounts mapping", "Day-one consolidation"],
  },
  {
    icon: Globe, stage: "New markets", range: "+ new countries", current: false,
    desc: "Enter a jurisdiction without a new system local tax and statutory rules are built in.",
    modules: ["Local tax & VAT", "Data residency controls", "Statutory reporting"],
  },
];

const FAQS = [
  { q: "How long does an enterprise implementation take?",            a: "Most global rollouts go live in about 20 weeks. A dedicated enterprise team follows an SLA-backed playbook architecture review, a single-entity pilot, then a staged regional rollout. Every milestone is contractually guaranteed, so there are no surprises and no overruns." },
  { q: "Can Bizak replace SAP or Oracle?",                            a: "Yes. Bizak Enterprise carries multi-entity financials, consolidation, procurement, inventory and projects in one platform replacing a legacy ERP and the regional bolt-ons around it. Teams typically migrate in months, not the 18 to 36 a traditional re-implementation takes." },
  { q: "How does multi-entity consolidation work?",                   a: "Every legal entity keeps its own books, in its own currency, under its own statutory rules. Bizak rolls them into one live group view automatically with intercompany eliminations, FX revaluation and IFRS or GAAP-ready financials. Month-end close drops from three weeks to two days." },
  { q: "Is Bizak secure and compliant enough for regulated industries?", a: "Security is built into the core, not bolted on. Bizak Enterprise is SOC 2 Type II, ISO 27001 and PCI DSS certified, with GDPR and HIPAA coverage, SSO and SAML, SCIM provisioning, field-level RBAC and an immutable audit trail behind every figure." },
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

function HeroCloseFlow() {
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
          <BadgeGreen style={{ marginBottom: 28 }}>For Enterprise</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Outgrowing your legacy ERP?{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>
              Run every entity on one consolidated platform.
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
          <HeroCloseFlow />
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
          Your ERP landscape
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
          <span className="font-medium text-bz-text-on-dark">≈ $4.2M/yr</span> in licences ·{" "}
          <span className="font-medium text-bz-text-on-dark">3 weeks</span> to consolidate ·{" "}
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
                  Your ERP worked at one entity.{" "}
                  <Heading.Muted>At sixty-seven, it quietly costs you.</Heading.Muted>
                </>
              }
              description="A monolithic ERP and regional bolt-ons get a single market running."
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
              Stop paying the legacy-ERP tax.{" "}
              <Heading.Muted>Run every entity on one system.</Heading.Muted>
            </>
          }
          description="Every system you're stitching together maps to a Bizak capability. The difference: one shared database instead of a dozen that need reconciling."
          titleMaxWidth={780}
        />
        <BigCard
          text={{
            title: "One platform, sized for a global enterprise.",
            bullets: [
              "Compliance, multi-entity and security built into the core, never bolted on.",
              "Group books update in real time, the moment a regional entity posts.",
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

// ─── 03 · IMPLEMENTATION ──────────────────────────────────────────────────────

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

function StepArchitectureVisual() {
  const files = [
    { name: "Entity structure",     meta: "67 entities mapped", done: true  },
    { name: "Chart of accounts",    meta: "harmonised",         done: true  },
    { name: "Integration blueprint", meta: "in review…",         done: false },
  ];
  return (
    <StepVisualShell label="Architecture review">
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

function StepRolloutVisual() {
  const regions = [
    { label: "AMER · 14 entities", on: true  },
    { label: "EMEA · 21 entities", on: true  },
    { label: "APAC · 17 entities", on: true  },
    { label: "MEA · 15 entities",  on: false },
  ];
  return (
    <StepVisualShell label="Staged rollout">
      <div className="flex flex-col gap-2 rounded-bz-xl border border-bz-line-soft bg-bz-surface p-4">
        {regions.map((m) => (
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
    { v: "$1.2B",  l: "Consolidated revenue" },
    { v: "2 days", l: "Month-end close"      },
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
            <p className="text-[10.5px] text-bz-text-muted">67 entities · 40 currencies</p>
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
          label="Implementation"
          title={
            <>
              Live in 20 weeks, <Heading.Muted>not three years.</Heading.Muted>
            </>
          }
          description="Bizak Enterprise follows an SLA-backed playbook. A dedicated team maps your architecture, rolls out region by region, and stays through your first full close."
          titleMaxWidth={720}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Weeks 1 – 4"
            title="Map the architecture"
            bullets={[
              "We review your entity structure, chart of accounts and integration landscape.",
              "A blueprint maps every region, currency and system before any data moves.",
            ]}
            visual={<StepArchitectureVisual />}
          />
          <StepCard
            number="02"
            tag="Weeks 5 – 12"
            title="Pilot, then roll out region by region"
            bullets={[
              "A single entity goes live first, with the full team shadowing every close.",
              "Each region follows in a staged rollout no big-bang cutover, no downtime.",
            ]}
            visual={<StepRolloutVisual />}
          />
          <StepCard
            number="03"
            tag="Weeks 13 – 20"
            title="Consolidate and go live"
            bullets={[
              "Every entity rolls up into one live group P&L, balance sheet and cash view.",
              "A dedicated team stays through your first full close, then hands over to your CSM.",
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
              A platform you expand on,{" "}
              <Heading.Muted>never one you replace.</Heading.Muted>
            </>
          }
          description="Run the group you have today. Onboard the next acquisition and enter the next market on the same system."
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

export function Enterprise() {
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
