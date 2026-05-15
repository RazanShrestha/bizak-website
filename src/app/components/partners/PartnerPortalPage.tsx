import {
  LayoutDashboard,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  Banknote,
  Boxes,
  LineChart,
  Check,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  UserPlus,
  ScrollText,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StripeBar,
} from "../bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const NAV = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: ClipboardCheck, label: "Deal Registration" },
  { icon: GraduationCap, label: "Architect Academy" },
  { icon: Megaphone, label: "Marketing Vault" },
  { icon: Banknote, label: "Commissions" },
  { icon: Boxes, label: "Sandbox Tenants" },
];

const KPIS = [
  { val: "47", label: "Deals registered · Q2" },
  { val: "$4.8M", label: "Pipeline value" },
  { val: "$386K", label: "Commission YTD" },
];

const ACTIVITY = [
  { icon: CheckCircle2, text: "Deal DR-2418 approved", time: "2m" },
  { icon: Banknote, text: "Commission run · $48,200", time: "1h" },
  { icon: Megaphone, text: "Q3 campaign assets published", time: "Today" },
];

const TOOLS = [
  {
    icon: ClipboardCheck,
    title: "Deal registration",
    desc: "Lock pricing and 90-day protection on every opportunity. Status, decay and conflicts in one queue.",
  },
  {
    icon: LineChart,
    title: "Pipeline analytics",
    desc: "Joint forecast-vs-actual dashboards, shared live with your regional partner manager.",
  },
  {
    icon: Megaphone,
    title: "Marketing Vault",
    desc: "Co-branded decks, landing pages and campaign creative, ready to deploy.",
  },
  {
    icon: Banknote,
    title: "Commission ledger",
    desc: "Accruals, holds, paid and pending by deal, by quarter, by tier, in real time.",
  },
  {
    icon: GraduationCap,
    title: "Architect Academy",
    desc: "Certification tracks, exam scheduling and continuing-ed credits, all in one place.",
  },
  {
    icon: Boxes,
    title: "Sandbox tenants",
    desc: "Spin up demo environments seeded with industry data. Reset on demand, share with prospects.",
  },
];

const RECORD_VALUE = [
  "One record holds the deal's full history no email threads, no shared spreadsheet.",
  "Pricing, the protection countdown and commission all update live as the deal moves.",
];

const TIMELINE = [
  { title: "Registered", meta: "Apr 2 · pricing and 90-day protection locked" },
  { title: "Co-sell assigned", meta: "Bizak rep joined · conflict check cleared" },
  { title: "Closed-won", meta: "Apr 28 · $482,000 contract value" },
];

const ACCESS = [
  {
    icon: ShieldCheck,
    title: "SAML / OIDC SSO",
    desc: "Sign in through Okta, Azure AD, Google Workspace or any generic SAML provider.",
  },
  {
    icon: KeyRound,
    title: "Role-based access",
    desc: "Sales, architects, finance and admins each get their own scoped permissions.",
  },
  {
    icon: UserPlus,
    title: "Per-deal sharing",
    desc: "Invite a teammate to one opportunity without opening the rest of the portal.",
  },
  {
    icon: ScrollText,
    title: "Full audit log",
    desc: "Every login, registration and export is timestamped and visible to your admins.",
  },
];

const STATS = [
  { val: "20+", label: "Active partner firms" },
  { val: "Week 1", label: "Portal account provisioned" },
  { val: "24/7", label: "Partner concierge support" },
  { val: "< 1 day", label: "Deal conflict mediation" },
];

// ════════════════════════════════════════════════════════════════════════════
// [HERO] the portal app-shell console
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Partner Portal</BadgeGreen>

          <Heading level={2} className="max-w-[760px]" style={{ marginBottom: 36 }}>
            Run your entire partner practice{" "}
            <Heading.Muted>from a single login.</Heading.Muted>
          </Heading>

          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://portal.bizakerp.com">
              Sign in to Portal
            </Pill>
            <Pill variant="light" withArrow href="/partners">
              Become a Partner
            </Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual mx-auto w-full max-w-[1040px]">
          <PortalConsole />
        </div>
      </Container>
    </Section>
  );
}

function PortalConsole() {
  return (
    <div className="w-full overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface">
      {/* Window title bar */}
      <div className="flex items-center justify-between gap-3 bg-bz-olive px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-2 rounded-bz-pill bg-white/[0.22]" />
            ))}
          </div>
          <span className="h-3.5 w-px bg-white/[0.14]" />
          <span className="text-[12.5px] font-medium text-bz-text-on-dark">
            Partner Portal
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden text-[12px] text-white/[0.6] sm:inline">
            Acme Solutions Ltd.
          </span>
          <StatusChip variant="neutral">Gold tier</StatusChip>
        </div>
      </div>

      {/* Body sidebar + workspace */}
      <div className="flex">
        {/* Sidebar nav decorative, desktop only */}
        <aside className="hidden w-[212px] shrink-0 flex-col border-r border-bz-line-soft bg-bz-paper-warm p-3 md:flex">
          <p className="px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
            Workspace
          </p>
          {NAV.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 rounded-bz-md px-3 py-2 text-[12.5px] ${
                active
                  ? "bg-bz-olive font-medium text-bz-text-on-dark"
                  : "text-bz-text-muted"
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </div>
          ))}
        </aside>

        {/* Workspace */}
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-bz-text">Overview</p>
            <span className="text-[11px] text-bz-text-soft">Q2 · 2026</span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.55fr_1fr] lg:gap-5">
            {/* Primary column KPIs + activity */}
            <div>
              <div className="grid grid-cols-3 gap-2.5">
                {KPIS.map((k) => (
                  <div
                    key={k.label}
                    className="rounded-bz-md bg-bz-paper-warm px-3.5 py-3"
                  >
                    <p className="text-[17px] font-medium tabular-nums text-bz-text sm:text-[19px]">
                      {k.val}
                    </p>
                    <p className="mt-1 text-[10.5px] leading-tight text-bz-text-muted">
                      {k.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
                  <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
                  Recent activity
                </div>
                {ACTIVITY.map(({ icon: Icon, text, time }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 border-b border-bz-line-soft py-2.5 last:border-0"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-olive">
                      <Icon size={13} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text">
                      {text}
                    </span>
                    <span className="shrink-0 text-[11px] text-bz-text-soft">
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary panel tier progress, desktop only */}
            <div className="hidden rounded-bz-md border border-bz-line-soft bg-bz-paper p-4 lg:block">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
                Tier progress
              </p>
              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-[26px] font-medium leading-none tabular-nums text-bz-text">
                  78%
                </span>
                <span className="pb-0.5 text-[11px] text-bz-text-muted">
                  to Gold renewal
                </span>
              </div>
              <div className="mt-3.5">
                <StripeBar pct={78} />
              </div>
              <p className="mt-3.5 text-[11.5px] leading-[1.5] text-bz-text-muted">
                9 of 11 certifications valid · renews Sep 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] INSIDE THE PORTAL the six-tool launcher
// ════════════════════════════════════════════════════════════════════════════

function WorkspaceSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Inside the portal"
          title={
            <>
              Six tools,{" "}
              <Heading.Muted>one workspace.</Heading.Muted>
            </>
          }
          description="Training, deal registration, marketing assets and live commissions the portal is the one place your sales team, architects and finance all work."
          titleMaxWidth={680}
        />

        <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface">
          <div className="grid grid-cols-1 gap-px bg-bz-line-soft sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col bg-bz-surface p-6 sm:p-7">
                <span className="mb-4 flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-olive">
                  <Icon size={19} strokeWidth={1.6} />
                </span>
                <h3 className="text-[15.5px] font-medium tracking-tight text-bz-text">
                  {title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-bz-text-muted">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] DEAL REGISTRATION one record, registration to commission
// ════════════════════════════════════════════════════════════════════════════

function DealRecordSection() {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead
              index="02"
              label="Deal registration"
              tone="dark"
              title={
                <>
                  One record per deal,{" "}
                  <Heading.Muted>registration to commission.</Heading.Muted>
                </>
              }
              description="Register an opportunity and the portal carries it the whole way locking your pricing."
              spacing="none"
            />
            <ul className="mt-8 flex flex-col gap-3.5">
              {RECORD_VALUE.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 text-[13.5px] leading-[1.6] text-white/[0.8]"
                >
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <DealRecordCard />
        </div>
      </Container>
    </Section>
  );
}

function DealRecordCard() {
  return (
    <div className="rounded-bz-2xl bg-bz-surface p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-olive">
            <ClipboardCheck size={18} strokeWidth={1.7} />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
              Registered deal
            </p>
            <p className="text-[14px] font-medium text-bz-text">
              DR-2418 · Northwind Trading
            </p>
          </div>
        </div>
        <StatusChip variant="live">Active</StatusChip>
      </div>

      <div className="my-5 h-px bg-bz-line-soft" />

      <div className="flex flex-col">
        {TIMELINE.map((t, i) => (
          <div key={t.title} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span className="flex size-6 items-center justify-center rounded-bz-pill bg-bz-olive text-bz-fire">
                <Check size={12} strokeWidth={3} />
              </span>
              {i < TIMELINE.length - 1 && (
                <span className="my-1 w-px flex-1 bg-bz-line" />
              )}
            </div>
            <div className={i < TIMELINE.length - 1 ? "pb-5" : ""}>
              <p className="text-[13.5px] font-medium text-bz-text">{t.title}</p>
              <p className="mt-0.5 text-[12px] leading-[1.5] text-bz-text-muted">
                {t.meta}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 rounded-bz-lg bg-bz-paper-warm px-4 py-3.5">
        <div>
          <p className="text-[12.5px] font-medium text-bz-text">
            Commission accrued
          </p>
          <p className="mt-0.5 text-[10.5px] text-bz-text-soft">
            Recurs on every renewal
          </p>
        </div>
        <span className="text-[20px] font-medium tabular-nums text-bz-text">
          $48,200
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] IDENTITY & ACCESS one login, scoped to the role
// ════════════════════════════════════════════════════════════════════════════

function AccessSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="Identity & access"
          title={
            <>
              One login for the team,{" "}
              <Heading.Muted>scoped to the role.</Heading.Muted>
            </>
          }
          description="The portal runs the same access model as Bizak ERP itself single sign-on, scoped roles, and a timestamped trail behind every action."
          titleMaxWidth={680}
        />

        <BentoGrid cols={2}>
          {ACCESS.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <div className="flex items-center gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-olive">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <h3 className="text-[15.5px] font-medium tracking-tight text-bz-text">
                  {title}
                </h3>
              </div>
              <p className="mt-4 text-[13.5px] leading-[1.65] text-bz-text-muted">
                {desc}
              </p>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] THE NETWORK proof + onboarding
// ════════════════════════════════════════════════════════════════════════════

function NetworkSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="The network"
          title={
            <>
              The console behind{" "}
              <Heading.Muted>20+ partner firms.</Heading.Muted>
            </>
          }
          description="New firms are provisioned in week one training, sandbox tenants and deal registration are live from the first day."
          titleMaxWidth={680}
        />

        <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface">
          <div className="grid grid-cols-2 gap-px bg-bz-line-soft lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col bg-bz-surface p-6 sm:p-8">
                <span className="text-[30px] font-medium tracking-tight text-bz-text sm:text-[38px]">
                  {s.val}
                </span>
                <span className="mt-2 text-[12.5px] leading-[1.5] text-bz-text-muted">
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

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function PartnerPortalPage() {
  return (
    <main>
      <HeroSection />
      <WorkspaceSection />
      <DealRecordSection />
      <AccessSection />
      <NetworkSection />
    </main>
  );
}
