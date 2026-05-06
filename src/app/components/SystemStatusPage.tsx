import "../../styles/style.css";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  Database,
  Globe2,
  HardDrive,
  KeyRound,
  Mail,
  PlugZap,
  RefreshCw,
  Rss,
  Server,
  Shield,
  Smartphone,
  TrendingUp,
  Workflow,
  Zap,
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

// ─── Status vocabulary ────────────────────────────────────────────────────────

type Status = "operational" | "degraded" | "outage" | "maintenance";

const STATUS_META: Record<
  Status,
  { label: string; pill: string; dot: string; bar: string; barSoft: string }
> = {
  operational: {
    label: "Operational",
    pill: "bg-bz-sage-soft text-bz-sage border border-bz-sage-mid",
    dot: "bg-bz-sage",
    bar: "bg-bz-sage",
    barSoft: "bg-bz-sage/30",
  },
  degraded: {
    label: "Degraded performance",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    barSoft: "bg-amber-200",
  },
  outage: {
    label: "Partial outage",
    pill: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
    bar: "bg-red-500",
    barSoft: "bg-red-200",
  },
  maintenance: {
    label: "Under maintenance",
    pill: "bg-sky-50 text-sky-700 border border-sky-200",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
    barSoft: "bg-sky-200",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS: { value: string; label: string }[] = [
  { value: "99.992%", label: "90-day uptime" },
  { value: "142 ms", label: "Avg API response" },
  { value: "22 min", label: "Mean time to recover" },
  { value: "0", label: "Active incidents" },
];

type ServiceGroup = {
  name: string;
  description: string;
  services: Service[];
};

type Service = {
  icon: LucideIcon;
  name: string;
  description: string;
  status: Status;
  uptime: string;
  /** Sparse list of day indices (0..89) where the service was not 100%. */
  history: { degraded?: number[]; outage?: number[]; maintenance?: number[] };
};

const SERVICE_GROUPS: ServiceGroup[] = [
  {
    name: "Core platform",
    description:
      "The unified ledger, web application, and customer-facing surfaces.",
    services: [
      {
        icon: Globe2,
        name: "Bizak Web Application",
        description: "app.bizakerp.com — the primary operator console.",
        status: "operational",
        uptime: "99.998%",
        history: { degraded: [42] },
      },
      {
        icon: Smartphone,
        name: "Bizak Mobile",
        description: "iOS & Android companion apps.",
        status: "operational",
        uptime: "99.991%",
        history: { degraded: [12, 56] },
      },
      {
        icon: Database,
        name: "Unified Ledger",
        description: "Cross-module transaction store.",
        status: "operational",
        uptime: "100.000%",
        history: {},
      },
    ],
  },
  {
    name: "APIs & developer surface",
    description:
      "Public REST APIs, webhooks, and the partner integration layer.",
    services: [
      {
        icon: Server,
        name: "REST API (v2)",
        description: "Programmatic access to all modules.",
        status: "operational",
        uptime: "99.987%",
        history: { degraded: [31, 32], outage: [73] },
      },
      {
        icon: PlugZap,
        name: "Webhooks",
        description: "Event delivery for partner systems.",
        status: "operational",
        uptime: "99.971%",
        history: { degraded: [8, 60], outage: [73] },
      },
      {
        icon: Workflow,
        name: "Workflow Engine",
        description: "Approvals, triggers, and scheduled automations.",
        status: "operational",
        uptime: "99.994%",
        history: { degraded: [45] },
      },
    ],
  },
  {
    name: "Identity & access",
    description: "Authentication, SSO, and tenant administration.",
    services: [
      {
        icon: KeyRound,
        name: "Authentication",
        description: "Login, session, and OAuth flows.",
        status: "operational",
        uptime: "99.999%",
        history: {},
      },
      {
        icon: Shield,
        name: "Single Sign-On (SAML)",
        description: "Enterprise SSO via SAML 2.0 & SCIM provisioning.",
        status: "operational",
        uptime: "99.984%",
        history: { degraded: [27] },
      },
    ],
  },
  {
    name: "Infrastructure",
    description: "Storage, notifications, and partner integrations.",
    services: [
      {
        icon: HardDrive,
        name: "File & Document Storage",
        description: "Attachments, exports, and reports.",
        status: "operational",
        uptime: "99.996%",
        history: { degraded: [14] },
      },
      {
        icon: Bell,
        name: "Notifications & Email",
        description: "Transactional email, in-app, and digests.",
        status: "operational",
        uptime: "99.978%",
        history: { degraded: [4, 38, 67] },
      },
      {
        icon: PlugZap,
        name: "Third-party Integrations",
        description: "Banking, payments, ecommerce, and tax connectors.",
        status: "operational",
        uptime: "99.962%",
        history: { degraded: [18, 51], outage: [82] },
      },
    ],
  },
];

type Incident = {
  date: string; // ISO date
  duration: string;
  severity: "minor" | "major" | "info";
  title: string;
  affected: string;
  summary: string;
  timeline: { time: string; label: string; body: string }[];
};

const INCIDENTS: Incident[] = [
  {
    date: "2026-04-23",
    duration: "32 min",
    severity: "major",
    title: "Webhook deliveries delayed in EU region",
    affected: "Webhooks · REST API (v2)",
    summary:
      "A queue-broker failover in the EU cluster caused webhook delivery to fall behind by up to ~30 minutes. All queued events were drained and delivered once the secondary broker took over.",
    timeline: [
      {
        time: "14:42 UTC",
        label: "Resolved",
        body: "All webhook backlogs drained. Continuing to monitor delivery latency.",
      },
      {
        time: "14:21 UTC",
        label: "Monitoring",
        body: "Failover to secondary broker complete. Delivery latency back to baseline.",
      },
      {
        time: "14:11 UTC",
        label: "Identified",
        body: "Root cause identified as exhausted broker memory pool in eu-west-1.",
      },
      {
        time: "14:00 UTC",
        label: "Investigating",
        body: "We are investigating elevated webhook delivery latency in the EU cluster.",
      },
    ],
  },
  {
    date: "2026-04-09",
    duration: "11 min",
    severity: "minor",
    title: "Brief degraded response time on mobile clients",
    affected: "Bizak Mobile",
    summary:
      "A subset of mobile clients saw response times above 1.2s while a CDN edge re-warmed cache after a config rollout. No data was lost.",
    timeline: [
      { time: "08:39 UTC", label: "Resolved", body: "Latency recovered globally." },
      { time: "08:31 UTC", label: "Monitoring", body: "Cache warmed; recovery in progress." },
      { time: "08:28 UTC", label: "Investigating", body: "Investigating elevated mobile API latency." },
    ],
  },
  {
    date: "2026-03-21",
    duration: "8 min",
    severity: "info",
    title: "SSO login redirects intermittently failed for two tenants",
    affected: "Single Sign-On (SAML)",
    summary:
      "Two enterprise tenants experienced intermittent SAML redirect errors after a planned identity-provider key rotation. Mitigated by rolling forward to the new keychain.",
    timeline: [
      { time: "11:10 UTC", label: "Resolved", body: "Affected tenants confirmed login is restored." },
      { time: "11:04 UTC", label: "Monitoring", body: "Keychain rolled forward; testing affected tenants." },
      { time: "11:02 UTC", label: "Investigating", body: "Investigating SAML redirect failures." },
    ],
  },
  {
    date: "2026-02-14",
    duration: "1 hr 04 min",
    severity: "major",
    title: "Third-party banking connector outage",
    affected: "Third-party Integrations",
    summary:
      "An upstream banking provider experienced a regional outage affecting US-east transactions. Bizak retried failed syncs automatically once the provider recovered.",
    timeline: [
      {
        time: "16:48 UTC",
        label: "Resolved",
        body: "All deferred syncs caught up; balances reconciled.",
      },
      {
        time: "16:30 UTC",
        label: "Monitoring",
        body: "Upstream provider restored; running automated retries.",
      },
      {
        time: "15:44 UTC",
        label: "Identified",
        body: "Confirmed outage on upstream banking provider; pausing new syncs.",
      },
    ],
  },
];

type Maintenance = {
  date: string;
  window: string;
  region: string;
  title: string;
  summary: string;
  affected: string;
};

const MAINTENANCE: Maintenance[] = [
  {
    date: "2026-05-18",
    window: "02:00 – 03:30 UTC",
    region: "EU (eu-west-1)",
    title: "Scheduled database failover drill",
    summary:
      "Routine quarterly failover exercise. No customer-visible downtime expected; failover targets <30s and is fully automated.",
    affected: "Unified Ledger · REST API (v2)",
  },
  {
    date: "2026-05-26",
    window: "21:00 – 22:00 UTC",
    region: "Global",
    title: "Notifications subsystem upgrade",
    summary:
      "Rolling upgrade of the notifications worker fleet. In-app delivery may be deferred by up to ~2 minutes during the window.",
    affected: "Notifications & Email",
  },
];

const REGIONS: { name: string; code: string; status: Status; latency: string }[] = [
  { name: "Americas", code: "us-east-1", status: "operational", latency: "118 ms" },
  { name: "Americas", code: "us-west-2", status: "operational", latency: "126 ms" },
  { name: "Europe", code: "eu-west-1", status: "operational", latency: "138 ms" },
  { name: "Europe", code: "eu-central-1", status: "operational", latency: "144 ms" },
  { name: "APAC", code: "ap-south-1", status: "operational", latency: "162 ms" },
  { name: "APAC", code: "ap-southeast-1", status: "operational", latency: "171 ms" },
];

const LAST_UPDATED = "May 6, 2026 · 10:42 UTC";

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container width="narrow" className="relative">
        <div className="flex flex-col items-center text-center">
          <HeroBadge>System Status</HeroBadge>
          <h1 className="mt-4 max-w-[860px] text-[clamp(40px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
            All systems are{" "}
            <span className="relative inline-block">
              operational
              <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-[660px] text-[17px] leading-[1.7] text-bz-text-muted">
            Live uptime, performance, and incident reporting for the Bizak ERP
            platform — every service, every region, refreshed minute-by-minute.
            We publish what we measure, in plain language, the moment it
            changes.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg" href="#subscribe" withArrow>
              Subscribe to updates
            </Button>
            <Button variant="outline" size="lg" href="#history">
              View incident history
            </Button>
          </div>

          <div className="mt-14 grid w-full grid-cols-2 gap-x-6 gap-y-8 border-t border-bz-border pt-10 md:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center text-center md:items-start md:text-left"
              >
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

// ─── Overall status banner ────────────────────────────────────────────────────

function StatusBanner() {
  return (
    <Section tone="white" pad="compact">
      <Container>
        <Card
          tone="light"
          pad="lg"
          className="relative flex flex-col items-start gap-7 overflow-hidden border-bz-sage-mid md:flex-row md:items-center md:justify-between md:gap-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-bz-sage-soft blur-3xl"
          />
          <div className="relative flex items-start gap-5">
            <span className="relative mt-1 flex size-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bz-sage opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-bz-sage" />
            </span>
            <div>
              <PillBadge tone="sage" dot>
                Live
              </PillBadge>
              <h2 className="mt-3 text-[26px] font-bold tracking-[-0.01em] text-bz-text md:text-[30px]">
                All systems operational.
              </h2>
              <p className="mt-2 max-w-[560px] text-[15px] leading-[1.65] text-bz-text-muted">
                No active incidents. The platform is processing transactions
                normally across every region. Last full health check{" "}
                <span className="font-semibold text-bz-text">{LAST_UPDATED}</span>.
              </p>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-bz-md border border-bz-border bg-bz-bg px-3 py-2 text-[12.5px] text-bz-text-muted">
              <Clock className="size-[14px] text-bz-sage" strokeWidth={1.8} />
              Updated {LAST_UPDATED}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-bz-md border border-bz-border bg-bz-surface px-3 py-2 text-[12.5px] font-semibold text-bz-text transition-colors hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-sage"
            >
              <RefreshCw className="size-[14px]" strokeWidth={1.8} />
              Refresh
            </button>
          </div>
        </Card>
      </Container>
    </Section>
  );
}

// ─── Live metrics ─────────────────────────────────────────────────────────────

const METRICS: { icon: LucideIcon; label: string; value: string; trend: string }[] = [
  { icon: TrendingUp, label: "90-day uptime", value: "99.992%", trend: "+0.014% vs prior period" },
  { icon: Zap, label: "Avg API response", value: "142 ms", trend: "-8 ms vs 30-day mean" },
  { icon: Activity, label: "Incidents (90d)", value: "8 resolved", trend: "All within SLA" },
  { icon: Clock, label: "Mean time to recover", value: "22 min", trend: "-6 min vs 30-day mean" },
];

function MetricsSection() {
  return (
    <Section tone="light" pad="compact">
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(({ icon: Icon, label, value, trend }) => (
            <Card key={label} tone="light" pad="md" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <IconBadge size="md" tone="sage">
                  <Icon className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                  Live
                </span>
              </div>
              <div>
                <div className="text-[26px] font-bold tracking-[-0.02em] text-bz-text">
                  {value}
                </div>
                <div className="mt-1 text-[12.5px] uppercase tracking-[0.08em] text-bz-text-soft">
                  {label}
                </div>
              </div>
              <p className="text-[12.5px] leading-[1.5] text-bz-text-muted">
                {trend}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 90-day uptime bar ────────────────────────────────────────────────────────

function UptimeBar({ history }: { history: Service["history"] }) {
  const days = 90;
  const degraded = new Set(history.degraded ?? []);
  const outage = new Set(history.outage ?? []);
  const maintenance = new Set(history.maintenance ?? []);

  return (
    <div className="flex items-end gap-[2px]" aria-hidden>
      {Array.from({ length: days }, (_, i) => {
        let dayStatus: Status = "operational";
        if (outage.has(i)) dayStatus = "outage";
        else if (degraded.has(i)) dayStatus = "degraded";
        else if (maintenance.has(i)) dayStatus = "maintenance";

        const meta = STATUS_META[dayStatus];
        return (
          <span
            key={i}
            className={`block h-7 w-[4px] rounded-[1.5px] sm:w-[5px] md:h-8 ${meta.bar}`}
            title={`Day ${days - i} — ${meta.label}`}
          />
        );
      })}
    </div>
  );
}

// ─── Services list ────────────────────────────────────────────────────────────

function ServicesSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Components"
          title="Per-service status, refreshed every minute."
          description="Each component tracks its own uptime over a rolling 90-day window. Hover any bar to see the day's status."
          maxWidth={760}
          className="mb-12"
        />

        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-bz-lg border border-bz-border bg-bz-bg/60 px-5 py-3.5 text-[12.5px] text-bz-text-muted">
          <span className="font-semibold text-bz-text">Legend</span>
          {(
            [
              ["operational", "Operational"],
              ["degraded", "Degraded"],
              ["outage", "Outage"],
              ["maintenance", "Maintenance"],
            ] as [Status, string][]
          ).map(([s, label]) => (
            <span key={s} className="inline-flex items-center gap-2">
              <span className={`size-2.5 rounded-sm ${STATUS_META[s].bar}`} />
              {label}
            </span>
          ))}
          <span className="ml-auto hidden text-[12px] text-bz-text-soft md:inline">
            ← 90 days ago · today →
          </span>
        </div>

        <div className="flex flex-col gap-10">
          {SERVICE_GROUPS.map((group) => (
            <div key={group.name}>
              <div className="mb-5 flex flex-col gap-1.5 border-b border-bz-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <Eyebrow>{group.name}</Eyebrow>
                  <p className="mt-2 max-w-[520px] text-[14px] leading-[1.6] text-bz-text-muted">
                    {group.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 self-start rounded-bz-pill border border-bz-sage-mid bg-bz-sage-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-bz-sage sm:self-auto">
                  <CheckCircle2 className="size-[13px]" strokeWidth={2} />
                  All clear
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {group.services.map(({ icon: Icon, ...s }) => {
                  const meta = STATUS_META[s.status];
                  return (
                    <Card
                      key={s.name}
                      tone="light"
                      pad="md"
                      className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(280px,1fr)_minmax(360px,2fr)_auto] lg:items-center lg:gap-8"
                    >
                      <div className="flex items-start gap-4">
                        <IconBadge size="md" tone="sage">
                          <Icon className="size-5" strokeWidth={1.8} />
                        </IconBadge>
                        <div className="min-w-0">
                          <h3 className="text-[15.5px] font-bold tracking-[-0.01em] text-bz-text">
                            {s.name}
                          </h3>
                          <p className="mt-1 text-[13px] leading-[1.55] text-bz-text-muted">
                            {s.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11.5px] uppercase tracking-[0.08em] text-bz-text-soft">
                          <span>90-day history</span>
                          <span className="font-semibold text-bz-text">
                            {s.uptime} uptime
                          </span>
                        </div>
                        <UptimeBar history={s.history} />
                      </div>

                      <span
                        className={`inline-flex items-center gap-2 self-start rounded-bz-pill px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] lg:self-center ${meta.pill}`}
                      >
                        <span className={`size-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Regions ──────────────────────────────────────────────────────────────────

function RegionsSection() {
  return (
    <Section tone="light" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <Eyebrow>Global footprint</Eyebrow>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text md:text-[40px]">
              Six regions. One status.
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.7] text-bz-text-muted">
              Bizak runs active-active across three continents. Latency is
              measured from synthetic monitors in each region; status is
              derived from the worst component in that region.
            </p>
            <a
              href="#subscribe"
              className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
            >
              Subscribe to regional alerts
              <ArrowUpRight className="size-[14px]" strokeWidth={2} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {REGIONS.map((r) => {
              const meta = STATUS_META[r.status];
              return (
                <Card
                  key={r.code}
                  tone="light"
                  pad="md"
                  className="flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                      {r.name}
                    </span>
                    <div className="mt-1.5 text-[16px] font-bold tracking-[-0.01em] text-bz-text">
                      {r.code}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 text-[12.5px] text-bz-text-muted">
                      <Zap className="size-[13px] text-bz-sage" strokeWidth={1.8} />
                      {r.latency} avg latency
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 self-start rounded-bz-pill px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] ${meta.pill}`}
                  >
                    <span className={`size-1.5 rounded-full ${meta.dot}`} />
                    {meta.label.split(" ")[0]}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

function MaintenanceSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Scheduled maintenance"
          title="Planned work, announced ahead of time."
          description="Every maintenance window is published at least seven days in advance. We default to off-peak hours per region and design changes to be customer-invisible whenever possible."
          maxWidth={760}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MAINTENANCE.map((m) => (
            <Card
              key={m.title}
              tone="light"
              pad="lg"
              hover="lift"
              className="flex flex-col"
            >
              <div className="flex items-start justify-between gap-4">
                <IconBadge size="lg" tone="sage">
                  <CalendarClock className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <span className="inline-flex items-center gap-2 rounded-bz-pill border border-sky-200 bg-sky-50 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-sky-700">
                  <span className="size-1.5 rounded-full bg-sky-500" />
                  Upcoming
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-bz-text-muted">
                <span className="font-semibold text-bz-text">{m.date}</span>
                <span aria-hidden className="text-bz-text-soft">
                  ·
                </span>
                <span>{m.window}</span>
                <span aria-hidden className="text-bz-text-soft">
                  ·
                </span>
                <span>{m.region}</span>
              </div>

              <h3 className="mt-3 text-[19px] font-bold tracking-[-0.01em] text-bz-text">
                {m.title}
              </h3>
              <p className="mt-3 flex-1 text-[14px] leading-[1.7] text-bz-text-muted">
                {m.summary}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-bz-border-soft pt-5">
                <span className="text-[11.5px] uppercase tracking-[0.08em] text-bz-text-soft">
                  Affects
                </span>
                <span className="text-[12.5px] font-medium text-bz-text">
                  {m.affected}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Incident history ─────────────────────────────────────────────────────────

const SEVERITY_META: Record<
  Incident["severity"],
  { label: string; pill: string; dot: string }
> = {
  major: {
    label: "Major",
    pill: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  minor: {
    label: "Minor",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  info: {
    label: "Informational",
    pill: "bg-bz-sage-soft text-bz-sage border border-bz-sage-mid",
    dot: "bg-bz-sage",
  },
};

const TIMELINE_LABEL_TONE: Record<string, string> = {
  Resolved: "text-bz-sage",
  Monitoring: "text-sky-700",
  Identified: "text-amber-700",
  Investigating: "text-red-700",
};

function HistorySection() {
  return (
    <Section tone="light" pad="default" id="history">
      <Container>
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Incident history"
            title="Every incident, in plain language."
            description="Past 90 days. We publish a post-mortem within 72 hours of every major incident, including root cause and the long-term fix."
            maxWidth={680}
          />
          <a
            href="#"
            className="inline-flex items-center gap-1.5 self-start text-[13.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover md:self-end"
          >
            View full history
            <ArrowUpRight className="size-[14px]" strokeWidth={2} />
          </a>
        </div>

        <div className="flex flex-col gap-5">
          {INCIDENTS.map((inc) => {
            const sev = SEVERITY_META[inc.severity];
            return (
              <Card
                key={inc.title}
                tone="light"
                pad="lg"
                className="flex flex-col"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-bz-pill px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${sev.pill}`}
                    >
                      <span className={`size-1.5 rounded-full ${sev.dot}`} />
                      {sev.label}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[12.5px] text-bz-text-muted">
                      <CalendarClock
                        className="size-[14px] text-bz-sage"
                        strokeWidth={1.8}
                      />
                      {inc.date}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[12.5px] text-bz-text-muted">
                      <Clock
                        className="size-[14px] text-bz-sage"
                        strokeWidth={1.8}
                      />
                      Resolved in {inc.duration}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-bz-pill border border-bz-sage-mid bg-bz-sage-soft px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-bz-sage">
                    <CheckCircle2 className="size-[12px]" strokeWidth={2.2} />
                    Resolved
                  </span>
                </div>

                <h3 className="mt-5 text-[20px] font-bold tracking-[-0.01em] text-bz-text">
                  {inc.title}
                </h3>
                <div className="mt-1 text-[12.5px] uppercase tracking-[0.08em] text-bz-text-soft">
                  Affected: {inc.affected}
                </div>
                <p className="mt-4 text-[14.5px] leading-[1.7] text-bz-text-muted">
                  {inc.summary}
                </p>

                <ol className="mt-7 flex flex-col gap-4 border-t border-bz-border pt-6">
                  {inc.timeline.map((entry, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="flex shrink-0 flex-col items-center">
                        <span
                          className={`size-2.5 rounded-full ${
                            entry.label === "Resolved"
                              ? "bg-bz-sage"
                              : entry.label === "Monitoring"
                              ? "bg-sky-500"
                              : entry.label === "Identified"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        {i < inc.timeline.length - 1 && (
                          <span className="mt-1 h-9 w-px bg-bz-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span
                            className={`text-[12.5px] font-bold uppercase tracking-[0.08em] ${
                              TIMELINE_LABEL_TONE[entry.label] ?? "text-bz-text"
                            }`}
                          >
                            {entry.label}
                          </span>
                          <span className="text-[12px] text-bz-text-soft">
                            {entry.time}
                          </span>
                        </div>
                        <p className="mt-1 text-[13.5px] leading-[1.6] text-bz-text-muted">
                          {entry.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

function SubscribeSection() {
  return (
    <Section tone="light" pad="default" id="subscribe">
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
                Stay informed
              </PillBadge>
              <h2 className="mt-5 text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
                Be the first to know — before your team asks.
              </h2>
              <p className="mt-4 max-w-[560px] text-[16px] leading-[1.7] text-bz-text-muted">
                Get incident notifications by email, RSS, or webhook the moment
                a status changes. One subscription per channel, any region you
                care about, unsubscribe in one click.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex w-full max-w-[420px] items-center gap-2 rounded-bz-lg border border-bz-border bg-bz-surface p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-bz-sage-mid"
              >
                <Mail
                  className="ml-3 size-[16px] shrink-0 text-bz-text-soft"
                  strokeWidth={1.8}
                />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent px-1 py-2 text-[14px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-bz-md bg-bz-deep px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-black/85"
                >
                  Subscribe
                </button>
              </form>
              <span className="text-[12px] text-bz-text-soft">
                No marketing — incident notifications only.
              </span>
            </div>
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-bz-border pt-7 text-[13px] text-bz-text-muted">
            <a
              href="#"
              className="inline-flex items-center gap-2 transition-colors hover:text-bz-sage"
            >
              <Rss className="size-4 text-bz-sage" strokeWidth={1.8} />
              RSS feed
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 transition-colors hover:text-bz-sage"
            >
              <PlugZap className="size-4 text-bz-sage" strokeWidth={1.8} />
              Webhook endpoint
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 transition-colors hover:text-bz-sage"
            >
              <AlertTriangle className="size-4 text-bz-sage" strokeWidth={1.8} />
              Incident reporting policy
            </a>
            <span className="ml-auto inline-flex items-center gap-2 text-bz-text-soft">
              <Activity className="size-4 text-bz-sage" strokeWidth={1.8} />
              Status API · status.bizakerp.com/api
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SystemStatusPage() {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <StatusBanner />
        <MetricsSection />
        <ServicesSection />
        <RegionsSection />
        <MaintenanceSection />
        <HistorySection />
        <SubscribeSection />
      </main>
      <Footer />
    </div>
  );
}
