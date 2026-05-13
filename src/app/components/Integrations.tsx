import {
  Section, Container, SectionHead, BentoGrid, Bento, Pill, Heading,
  BadgeGreen, BigCard, StepCard, DotGrid,
} from "./bz";
import {
  Boxes, Upload, Unlink, Activity, Shield, Key,
  GitBranch, RefreshCw, Webhook,
  CreditCard, Landmark, ShoppingBag, Users, Calculator,
  Mail, CalendarDays, Fingerprint, Scale, Truck, Layers, Wallet,
} from "lucide-react";

// ─── Hero visual ─────────────────────────────────────────────────────────────

const INTEGRATION_CATEGORIES = [
  { Icon: CreditCard,   name: "Payment Gateways",      desc: "Multi-gateway, multi-currency, auto-posted"         },
  { Icon: Landmark,     name: "Banks & Finance",        desc: "Direct feeds, auto-reconciliation, multi-bank"      },
  { Icon: ShoppingBag,  name: "E-Commerce",             desc: "Orders, returns, and catalogue in real time"        },
  { Icon: Users,        name: "CRM",                    desc: "Customer records flow into every module"            },
  { Icon: Calculator,   name: "Accounting",             desc: "Transactions auto-posted to the general ledger"     },
  { Icon: Mail,         name: "Email",                  desc: "Trigger workflows and alerts from inbox events"     },
  { Icon: CalendarDays, name: "Calendar & Scheduling",  desc: "Appointments, deadlines, and reminders synced"      },
  { Icon: Fingerprint,  name: "Biometric Devices",      desc: "Attendance and access control, captured live"       },
  { Icon: Scale,        name: "Weighing Bridges",        desc: "Real-time weight data for dispatch and billing"     },
  { Icon: Truck,        name: "Logistics & Shipping",   desc: "Carrier tracking piped into your ops layer"         },
  { Icon: Layers,       name: "ERP Systems",            desc: "Migrate from or co-run alongside any ERP"           },
  { Icon: Wallet,       name: "Payroll & HR",           desc: "Payslips, headcount, and benefits in sync"          },
];

function ConnectorShowcaseMock() {
  return (
    <div className="w-full mt-10 rounded-bz-xl overflow-hidden border border-white/[0.06]">
      {/* Header */}
      <div className="relative bg-bz-olive overflow-hidden px-7 py-5 border-b border-white/[0.06]">
        <DotGrid tone="dark" />
        <div className="relative flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-bz-text-on-dark-muted">
            Integration Categories
          </span>
          <span className="text-[11px] font-semibold text-bz-fire">200+ connectors available</span>
        </div>
      </div>

      {/* Category grid — gap-px trick: container bg bleeds 1px between cells */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/[0.08]">
        {INTEGRATION_CATEGORIES.map(({ Icon, name, desc }) => (
          <div key={name} className="flex items-start gap-3.5 px-6 py-5 bg-bz-olive">
            <Icon size={16} className="text-bz-fire shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-bz-text-on-dark leading-snug">{name}</div>
              <div className="text-[11px] text-bz-text-on-dark-muted mt-0.5 leading-snug">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 bg-bz-olive-dark border-t border-white/[0.06] divide-x divide-white/[0.06]">
        {[
          ["200+",   "Connectors"],
          ["25+",    "Categories"],
          ["<2 min", "Avg. Setup"],
        ].map(([v, l]) => (
          <div key={l} className="px-6 py-4 text-center">
            <div className="text-[20px] font-extrabold text-bz-text-on-dark leading-none">{v}</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-bz-text-on-dark-muted mt-1.5">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Connector library visual (inside BigCard) ────────────────────────────────

const CONNECTOR_CATS = [
  { abbr: "STR", cat: "Payments" }, { abbr: "SHO", cat: "Commerce" },
  { abbr: "QBO", cat: "Ledger"   }, { abbr: "SAL", cat: "CRM"      },
  { abbr: "BNK", cat: "Banking"  }, { abbr: "PAY", cat: "Payroll"  },
  { abbr: "SAP", cat: "ERP"      }, { abbr: "AWS", cat: "Storage"  },
];

function ConnectorGridVisual() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-baseline gap-5">
        <div className="text-[40px] font-extrabold text-bz-fire leading-none">200+</div>
        <div className="flex gap-5">
          {[["8", "Categories"], ["<2 min", "Avg Setup"]].map(([v, l]) => (
            <div key={l}>
              <div className="text-[18px] font-bold text-bz-fire">{v}</div>
              <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/40 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {CONNECTOR_CATS.map((c) => (
          <div
            key={c.abbr}
            className="bg-white/[0.05] border border-white/[0.10] rounded-bz-md py-2.5 text-center"
          >
            <div className="text-[12px] font-extrabold text-bz-fire tracking-[0.04em]">{c.abbr}</div>
            <div className="text-[8px] font-semibold tracking-[0.1em] uppercase text-white/35 mt-0.5">{c.cat}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sync volume visual (inside BigCard reverse) ──────────────────────────────

const SYNC_LANES = [
  { lbl: "Inbound Webhooks", v: 84 },
  { lbl: "Outbound API",     v: 62 },
  { lbl: "Scheduled Pulls",  v: 38 },
  { lbl: "Bulk Imports",     v: 24 },
];

function SyncVolumeVisual() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-white/40">Sync Volume · 24h</div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[28px] font-extrabold text-bz-text-on-dark leading-none">2.18M</span>
          <span className="text-[11px] font-bold text-bz-fire">+8.6%</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {SYNC_LANES.map((l) => (
          <div key={l.lbl} className="flex items-center gap-2.5">
            <span className="text-[10px] text-white/50 font-medium min-w-[110px]">{l.lbl}</span>
            <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-bz-fire" style={{ width: `${l.v}%` }} />
            </div>
            <span className="text-[10px] font-bold text-bz-fire min-w-[38px] text-right">{l.v * 18}k</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
        <span className="text-[11px] font-bold text-bz-text-on-dark">p95 latency · 412ms</span>
        <span className="text-[10px] font-bold text-bz-fire">▼ 18% vs last week</span>
      </div>
    </div>
  );
}

// ─── Capability bento mocks ──────────────────────────────────────────────────

function MapperRowsMock() {
  return (
    <div className="rounded-bz-md border border-bz-line-soft overflow-hidden text-[11px]">
      <div className="grid grid-cols-[1fr_16px_1fr] gap-1 px-3 py-1.5 bg-bz-section-b border-b border-bz-line-soft">
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Source</span>
        <span />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-bz-text-soft">Target</span>
      </div>
      {[
        ["stripe.amount / 100", "tx_amount_usd"],
        ["stripe.charge.id",    "tx_external_id"],
        ["stripe.metadata.so",  "sales_order.code"],
      ].map(([s, t]) => (
        <div key={s} className="grid grid-cols-[1fr_16px_1fr] gap-1 px-3 py-1.5 border-t border-bz-line-soft">
          <span className="text-bz-text-muted truncate">{s}</span>
          <span className="text-bz-olive font-bold text-center">→</span>
          <span className="text-bz-olive font-medium truncate">{t}</span>
        </div>
      ))}
    </div>
  );
}

function RetryStatsMock() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[["3×", "Auto Retries"], ["5 min", "Backoff Cap"], ["1-click", "DLQ Replay"]].map(([v, l]) => (
        <div key={l} className="rounded-bz-md border border-bz-line-soft bg-bz-section-b py-3 text-center">
          <div className="text-[14px] font-bold text-bz-text">{v}</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-bz-text-muted mt-0.5">{l}</div>
        </div>
      ))}
    </div>
  );
}

function VaultBadgesMock() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {["AES-256", "HMAC", "OAuth 2.0", "mTLS", "SOC 2"].map((b) => (
        <span
          key={b}
          className="text-[9px] font-bold px-2 py-1 rounded-bz-pill bg-bz-olive/[0.07] text-bz-olive tracking-[0.06em] uppercase"
        >
          {b}
        </span>
      ))}
    </div>
  );
}

// ─── Step card visuals ────────────────────────────────────────────────────────

function ConnectVisual() {
  return (
    <div className="flex flex-col gap-2.5">
      {[
        { name: "Stripe",  status: "Connected",    active: true  },
        { name: "Shopify", status: "Authorizing…", active: false },
      ].map((s) => (
        <div
          key={s.name}
          className="flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-4 py-3"
        >
          <span className="text-[13px] font-bold text-bz-text">{s.name}</span>
          <span className={`text-[11px] font-bold ${s.active ? "text-bz-olive" : "text-bz-text-muted"}`}>
            {s.status}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
        <span className="text-[10px] text-bz-text-muted">OAuth secured · AES-256 at rest</span>
      </div>
    </div>
  );
}

function MapDeployVisual() {
  return (
    <div className="rounded-bz-md border border-bz-line-soft overflow-hidden">
      <div className="grid grid-cols-[1fr_16px_1fr] gap-1 px-3 py-2 bg-bz-section-b text-[9px] font-bold tracking-[0.1em] uppercase text-bz-text-muted border-b border-bz-line-soft">
        <span>Source</span>
        <span />
        <span>Target</span>
      </div>
      {[
        ["stripe.amount / 100", "tx_amount_usd"],
        ["stripe.charge.id",    "tx_external_id"],
        ["stripe.metadata.so",  "sales_order.code"],
        ["stripe.created · ISO","tx_posted_at"],
      ].map(([s, t]) => (
        <div key={s} className="grid grid-cols-[1fr_16px_1fr] gap-1 px-3 py-1.5 text-[11px] border-t border-bz-line-soft">
          <span className="text-bz-text-muted truncate">{s}</span>
          <span className="text-bz-olive font-bold text-center">→</span>
          <span className="text-bz-olive font-medium truncate">{t}</span>
        </div>
      ))}
    </div>
  );
}

function MonitorVisual() {
  return (
    <div className="flex flex-col gap-2.5">
      {[
        { name: "Stripe · Payments",    uptime: "99.99%", latency: "182ms" },
        { name: "Shopify · Commerce",   uptime: "99.97%", latency: "241ms" },
        { name: "QuickBooks · Ledger",  uptime: "99.94%", latency: "318ms" },
      ].map((c) => (
        <div
          key={c.name}
          className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2.5"
        >
          <span className="text-[12px] font-bold text-bz-text flex-1">{c.name}</span>
          <span className="text-[10px] text-bz-text-muted">{c.latency}</span>
          <span className="text-[11px] font-bold text-bz-olive">{c.uptime}</span>
        </div>
      ))}
      <div className="text-[10px] text-bz-text-muted mt-1">
        p95 latency · alerts on real degradation only
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  { Icon: Boxes,    title: "Disconnected Systems", desc: "Sales in a CRM, payments in a gateway, inventory in a WMS — none know the others exist until reconciliation day." },
  { Icon: Upload,   title: "Manual CSV Loop",      desc: "Export from system A, clean in Excel, import into B. Repeat every Monday, every entity, every team." },
  { Icon: Unlink,   title: "Brittle Webhooks",     desc: "A vendor changes a field name and your sync silently breaks. By month-end the ledger has drifted by hundreds of orders." },
  { Icon: Activity, title: "Silent Sync Drift",    desc: "Two systems drift line-by-line. The bank, the CRM, and the ledger all disagree — and no one knows which one to trust." },
  { Icon: Shield,   title: "No Audit Lineage",     desc: "Can you trace a ledger row back to its originating webhook payload? Most stacks can't — and your auditor will notice." },
  { Icon: Key,      title: "Credential Sprawl",    desc: "API keys in .env files, overgrown scopes, manual rotation. Revoking access takes a sprint." },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>200+ Connectors · Live Data</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Every system in your stack,{" "}
            <Heading.Muted>speaking the same language.</Heading.Muted>
          </Heading>
          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill variant="dark" withTick href="https://system.bizakerp.com/account/self-register">
              Start free trial
            </Pill>
            <Pill variant="light" href="/contact">
              Book a demo
            </Pill>
          </div>
        </div>
        <ConnectorShowcaseMock />
      </Container>
    </Section>
  );
}

function DisconnectedStackSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The Integration Gap"
          title={
            <>
              Six systems, six truths —{" "}
              <Heading.Muted>and a thousand CSV files in between.</Heading.Muted>
            </>
          }
          description="Most ERP stacks are surrounded by brittle SFTP jobs, ad-hoc Zapier flows, and half-written webhooks. By the time data reaches the ledger, the answers are already wrong."
        />
        <BentoGrid cols={3}>
          {PAIN_POINTS.map(({ Icon: I, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <Bento.Header title={title} icon={<I size={16} />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function ConnectorLibrarySection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Connector Library"
          title={
            <>
              200+ connectors.{" "}
              <Heading.Muted>Pre-built, certified, maintained.</Heading.Muted>
            </>
          }
          description="Drop in a connector, authenticate, and the data flows. No glue code, no maintenance burden — Bizak handles vendor API changes so you don't have to."
        />
        <BigCard
          text={{
            title: "The Connector Marketplace",
            body: "Every connector is versioned, certified, and maintained. Vendor API updates are absorbed by Bizak — your recipes and dashboards keep working without a sprint of regression fixes.",
            bullets: [
              "8 categories: payments, commerce, banking, CRM, ERP, payroll, logistics, storage",
              "Average setup time under 2 minutes — authenticate and data flows",
              "Bidirectional sync with conflict resolution and idempotency built in",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Browse connectors" },
          }}
          visual={<ConnectorGridVisual />}
        />
      </Container>
    </Section>
  );
}

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Capabilities"
          title={
            <>
              Enterprise-grade integration,{" "}
              <Heading.Muted>built into your ERP.</Heading.Muted>
            </>
          }
          description="A connector platform that lives inside Bizak — not bolted on. Field mapping, retries, webhooks, and credential management in one governed layer."
        />
        <BentoGrid cols={12}>
          <Bento tone="paper" span={7}>
            <Bento.Header title="Visual Field Mapper" icon={<GitBranch size={16} />} />
            <Bento.Desc>
              Map source schemas to Bizak entities via drag-and-drop. Add transforms, lookups, and conditional routes — no scripting required.
            </Bento.Desc>
            <Bento.Footer>
              <MapperRowsMock />
            </Bento.Footer>
          </Bento>

          <Bento tone="paper" span={5}>
            <Bento.Header title="Retry & Dead-Letter Queue" icon={<RefreshCw size={16} />} />
            <Bento.Desc>
              Failures retry with exponential backoff. Unrecoverable payloads land in a queryable DLQ — replay any payload in one click.
            </Bento.Desc>
            <Bento.Footer>
              <RetryStatsMock />
            </Bento.Footer>
          </Bento>

          <Bento tone="paper" span={5}>
            <Bento.Header title="Webhook Router" icon={<Webhook size={16} />} />
            <Bento.Desc>
              Receive, validate, dedupe, and fan-out events to any module. Sub-second routing with HMAC verification on every payload.
            </Bento.Desc>
          </Bento>

          <Bento tone="paper" span={7}>
            <Bento.Header title="Vault & Scoped Secrets" icon={<Shield size={16} />} />
            <Bento.Desc>
              Credentials encrypted at rest, scoped per connector, rotated on schedule. SOC 2 logged — never in plaintext, never in a .env file.
            </Bento.Desc>
            <Bento.Footer>
              <VaultBadgesMock />
            </Bento.Footer>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

function ReliabilitySection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="04"
          label="Reliability That Compounds"
          title={
            <>
              Plug it in once.{" "}
              <Heading.Muted>Then forget it.</Heading.Muted>
            </>
          }
          description="Bizak integrations are versioned, certified, and self-healing. When a vendor changes their API, the connector updates — your dashboards keep working."
        />
        <BigCard
          reverse
          text={{
            title: "Self-healing by design",
            body: "Every payload carries a deterministic idempotency key so duplicate webhooks never double-post. Schema changes surface as warnings before they break the ledger.",
            bullets: [
              "Idempotent by default — deterministic key on every payload, no double-posts",
              "Schema-aware mapping — source changes warn before they reach the ledger",
              "Replay without drift — DLQ payloads replay with full transform context preserved",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Talk to an integration engineer" },
          }}
          visual={<SyncVolumeVisual />}
        />
      </Container>
    </Section>
  );
}

function SetupWorkflowSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="05"
          label="From Handshake to Heartbeat"
          title={
            <>
              Three steps from{" "}
              <Heading.Muted>first auth to live data.</Heading.Muted>
            </>
          }
          description="Most connectors are live within minutes. No glue code, no maintenance sprints — just authenticate, map, and monitor."
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Connect"
            title="Authenticate and the data flows"
            bullets={[
              "OAuth 2.0, API key, and mTLS authentication modes supported",
              "Credentials live in the Vault — encrypted at rest, never in code",
            ]}
            visual={<ConnectVisual />}
          />
          <StepCard
            number="02"
            tag="Configure"
            title="Map fields, define transforms, set the schedule"
            bullets={[
              "Drag source fields onto Bizak entities in the visual mapper",
              "Add transforms, lookups, and conditional routes without scripting",
            ]}
            visual={<MapDeployVisual />}
          />
          <StepCard
            number="03"
            tag="Monitor"
            title="Per-connector health dashboards watch for you"
            bullets={[
              "Throughput, error rate, and latency percentiles per connector",
              "Alerts fire on real degradation only — no noise from transient spikes",
            ]}
            visual={<MonitorVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Integrations() {
  return (
    <>
      <HeroSection />
      <DisconnectedStackSection />
      <ConnectorLibrarySection />
      <CapabilitiesSection />
      <ReliabilitySection />
      <SetupWorkflowSection />
    </>
  );
}
