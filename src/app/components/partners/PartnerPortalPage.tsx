import {
  KeyRound,
  GraduationCap,
  Megaphone,
  Banknote,
  ListChecks,
  FileBadge2,
  LineChart,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";
import {
  Container,
  Section,
  SectionHeading,
  Button,
  Card,
  IconBadge,
  PillBadge,
  HeroBadge,
  HeroPanel,
} from "../marketing";
import { Header } from "../Header";
import { Footer } from "../Footer";

const TOOLS = [
  {
    Icon: GraduationCap,
    title: "Architect Academy",
    body: "All certification tracks, exam scheduling, and continuing-ed credits in one place.",
  },
  {
    Icon: ListChecks,
    title: "Deal registration",
    body: "Lock pricing and protection on opportunities. Status, decay, and conflicts visible in one queue.",
  },
  {
    Icon: Megaphone,
    title: "Marketing Vault",
    body: "Co-branded decks, landing pages, ad creative, and case-study templates ready to deploy.",
  },
  {
    Icon: Banknote,
    title: "Commission ledger",
    body: "Real-time view of accruals, holds, paid, and pending — by deal, by quarter, by tier.",
  },
  {
    Icon: FileBadge2,
    title: "Sandbox tenants",
    body: "Spin up demo environments seeded with industry data. Reset on demand, share with prospects.",
  },
  {
    Icon: LineChart,
    title: "Pipeline analytics",
    body: "Joint dashboards with your regional partner manager. Forecast vs. actual, conversion, velocity.",
  },
];

const PORTAL_KPIS = [
  { label: "Deals registered (Q2)", val: "47",   delta: "+12%" },
  { label: "Pipeline value",         val: "$4.8M", delta: "+18%" },
  { label: "Commission YTD",         val: "$386K", delta: "Paid" },
  { label: "Certifications active",  val: "11",    delta: "9 valid" },
];

const RECENT_ACTIVITY = [
  { Icon: ListChecks,    text: "Deal #DR-2418 approved",      time: "2m ago",   tone: "accent" as const },
  { Icon: GraduationCap, text: "Solution Architect cert · Maya R.",  time: "1h ago",   tone: "sage" as const   },
  { Icon: Megaphone,     text: "Q3 campaign assets published", time: "Today",   tone: "neutral" as const },
  { Icon: Banknote,      text: "Commission run · $48,200",     time: "Yesterday", tone: "live" as const   },
];

function PortalPreviewPanel() {
  return (
    <Card tone="dark" pad="md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-md bg-bz-accent/15 text-bz-accent flex items-center justify-center">
            <KeyRound className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/35">
              Partner Portal · Preview
            </div>
            <div className="text-[16px] font-bold mt-0.5">Acme Solutions Ltd.</div>
          </div>
        </div>
        <PillBadge tone="accent">Gold tier</PillBadge>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {PORTAL_KPIS.map((k) => (
          <div
            key={k.label}
            className="bg-white/[0.04] border border-white/10 rounded-bz-md px-3.5 py-3"
          >
            <div className="text-[18px] font-bold tabular-nums">{k.val}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{k.label}</div>
            <div className="text-[10px] text-bz-accent/80 mt-0.5">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/30 mb-3">
          Recent activity
        </div>
        {RECENT_ACTIVITY.map((a, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 ${i < RECENT_ACTIVITY.length - 1 ? "mb-3" : ""}`}
          >
            <div className="size-7 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/70">
              <a.Icon className="size-3.5" />
            </div>
            <div className="flex-1 text-[13px] text-white/70">{a.text}</div>
            <span className="text-[11px] text-white/40">{a.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HeroSection() {
  return (
    <HeroPanel
      badge={<HeroBadge tone="dark">Partner Portal</HeroBadge>}
      title={
        <>
          Run your partner practice<br />
          <span className="text-bz-accent">from one console.</span>
        </>
      }
      description="Training, sales tools, deal registration, MDF requests, and live commission ledger — every program tool in one console. Your team, your pipeline, your earnings, in real time."
      actions={
        <>
          <Button variant="accent" size="lg" href="https://portal.bizakerp.com" withArrow>
            Sign in to Portal
          </Button>
          <Button variant="ghostDark" size="lg" href="/partners">
            Become a Partner
          </Button>
        </>
      }
      stats={[
        { value: "640+",  label: "Active firms" },
        { value: "24/7",  label: "Concierge" },
        { value: "100%",  label: "Real-time data" },
      ]}
      panel={<PortalPreviewPanel />}
    />
  );
}

function ToolsSection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <SectionHeading
          eyebrow="What's inside"
          title="Six tools that move the needle."
          description="The portal is the one place we send our regional teams to look up partner state, approve deals, and run enablement. It's the tool we use ourselves — that's why every screen has a job."
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map(({ Icon, title, body }) => (
            <Card key={title} tone="light" pad="md" hover="lift">
              <IconBadge tone="sage" size="md" className="mb-5">
                <Icon className="size-5" />
              </IconBadge>
              <div className="text-[16.5px] font-bold mb-2">{title}</div>
              <p className="text-[13.5px] text-bz-text-muted leading-[1.65]">{body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SecuritySection() {
  return (
    <Section tone="light">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-center">
          <SectionHeading
            eyebrow="Identity & access"
            title={<>Your team. Your access. <span className="text-bz-sage">Audited end-to-end.</span></>}
            description="The portal supports SSO, scoped roles, and per-deal access controls. Every action — registration, MDF claim, certification — is timestamped and audit-tracked, the same as inside Bizak ERP."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { Icon: ShieldCheck, t: "SAML / OIDC SSO",        d: "Okta · Azure AD · Google Workspace · Generic SAML" },
              { Icon: KeyRound,    t: "Role-based access",      d: "Sales · Architects · Finance · Admins — separate permissions" },
              { Icon: ListChecks,  t: "Per-deal sharing",       d: "Invite a teammate to one deal without giving full access" },
              { Icon: CalendarClock, t: "Session & device log", d: "Every login, every device, every export — visible to admins" },
            ].map(({ Icon, t, d }, i) => (
              <Card key={t} tone={i % 2 === 0 ? "soft" : "light"} pad="md" hover="lift">
                <IconBadge tone="sage" size="sm" className="mb-4">
                  <Icon className="size-4" />
                </IconBadge>
                <div className="text-[14.5px] font-bold mb-1.5">{t}</div>
                <p className="text-[12.5px] text-bz-text-muted leading-[1.6]">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          title={<>Already a partner?</>}
          description="Sign in with your firm's credentials. New to the network? Apply and get your Portal account provisioned in week one."
          tone="light"
          align="center"
          maxWidth={620}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="https://portal.bizakerp.com" withArrow>
            Sign in to Portal
          </Button>
          <Button variant="ghostDark" size="lg" href="/partners#apply">
            Apply for Access
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export function PartnerPortalPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <ToolsSection />
        <SecuritySection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
