import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Plug, Unlink, Shuffle, Webhook, RefreshCw, Shield, Key,
  Eye, CheckCircle, Calendar, Layers, Code, GitBranch, Upload, Activity,
  Boxes,
} from "lucide-react";
import {
  Section, Container, SectionHeading, Button, Card, IconBadge, HeroBadge, HeroCentered, PillBadge, Stat,
} from "./marketing";

// ─── HERO VISUAL ─────────────────────────────────────────────────────────────
const HUB_NODES = [
  { abbr: "STR", x: 30,  y: 18,  pull: true  },
  { abbr: "SHO", x: 138, y: 8,   pull: false },
  { abbr: "HUB", x: 246, y: 18,  pull: true  },
  { abbr: "QBO", x: 30,  y: 132, pull: false },
  { abbr: "AWS", x: 138, y: 142, pull: true  },
  { abbr: "SAL", x: 246, y: 132, pull: false },
];

function SyncHubVisual() {
  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="rounded-bz-lg border border-white/20 bg-white/[0.06] p-1.5 shadow-[0_0_60px_rgba(199,255,53,0.12)]">
        <div className="rounded-bz-md bg-white/[0.04] px-4 py-5 sm:px-6 flex flex-col gap-4">

          {/* Window chrome */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(["#ff5f57", "#ffbd2e", "#28c840"] as const).map((bg) => (
                <div key={bg} style={{ background: bg }} className="w-2.5 h-2.5 rounded-full" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.12em]">
              Bizak · Sync Hub
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="biz-pulse-glow w-1.5 h-1.5 rounded-full bg-bz-accent shrink-0"
                style={{ boxShadow: "0 0 8px #C7FF35" }}
              />
              <span className="text-[9px] font-bold text-bz-accent uppercase tracking-[0.14em]">Live</span>
            </div>
          </div>

          {/* Hub SVG — node labels use white fill for visibility on dark bg */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 280 160" className="w-full max-w-[420px] h-auto" fill="none">
              <defs>
                <radialGradient id="hubGlow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="var(--bz-accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--bz-accent)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="140" cy="80" r="50" fill="url(#hubGlow)" />
              {HUB_NODES.map((n) => {
                const cx1 = n.x + 22;
                const cy1 = n.y + 12;
                return (
                  <g key={n.abbr}>
                    <line x1="140" y1="80" x2={cx1} y2={cy1} stroke="rgba(122,130,109,0.18)" strokeWidth="1" />
                    <line
                      x1={n.pull ? cx1 : 140} y1={n.pull ? cy1 : 80}
                      x2={n.pull ? 140 : cx1} y2={n.pull ? 80 : cy1}
                      className="biz-flow" stroke="var(--bz-accent)" strokeWidth="1.4"
                      strokeDasharray="3 7" strokeLinecap="round" opacity="0.85"
                    />
                  </g>
                );
              })}
              <circle cx="140" cy="80" r="22" fill="rgba(199,255,53,0.18)" stroke="var(--bz-accent)" strokeWidth="1.4" />
              <text x="140" y="83" textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--bz-sage)" letterSpacing="0.5">BIZAK</text>
              {HUB_NODES.map((n) => (
                <g key={n.abbr}>
                  <rect x={n.x} y={n.y} width="44" height="24" rx="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <text x={n.x + 22} y={n.y + 16} textAnchor="middle" fontSize="9" fontWeight="800" fill="white" letterSpacing="0.5">{n.abbr}</text>
                  <circle cx={n.x + 38} cy={n.y + 5} r="2.2" fill={n.pull ? "#16a34a" : "var(--bz-accent)"} />
                </g>
              ))}
            </svg>
          </div>

          {/* Live event stream */}
          <div className="border-t border-white/[0.07] pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-bz-sage uppercase tracking-[0.1em]">Live Event Stream</span>
              <span className="text-[9px] font-bold text-[#16a34a]">2,184 today</span>
            </div>
            {[
              { code: "SO-1182",  arrow: "→", target: "Shopify",    ago: "2s"  },
              { code: "INV-947",  arrow: "←", target: "QuickBooks", ago: "8s"  },
              { code: "PAY-3002", arrow: "→", target: "Stripe",     ago: "12s" },
            ].map((e) => (
              <div key={e.code} className="flex justify-between text-[10px] py-1 border-t border-white/[0.04]">
                <span className="text-white font-bold tracking-[0.04em]">{e.code}</span>
                <span className="text-bz-sage">{e.arrow} {e.target}</span>
                <span className="text-[#16a34a] font-bold">{e.ago}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── CHALLENGES ──────────────────────────────────────────────────────────────
const CHALLENGES = [
  { Icon: Boxes,    title: "Disconnected Systems", desc: "Sales lives in a CRM, payments in a gateway, inventory in a WMS. None of them know the others exist — until reconciliation day." },
  { Icon: Upload,   title: "Manual CSV Loop",      desc: "Export from system A, clean in Excel, import into system B. Repeat every Monday. Repeat for every entity. Repeat for every team." },
  { Icon: Unlink,   title: "Brittle Webhooks",     desc: "A vendor changes a field name and your sync silently breaks. By the time someone notices, the ledger has drifted by hundreds of orders." },
  { Icon: Activity, title: "Silent Sync Drift",    desc: "Two systems drift apart line-by-line. By month-end, the bank, the CRM, and the ledger all disagree — and nobody knows which one to trust." },
  { Icon: Shield,   title: "No Audit Lineage",     desc: "When a number looks wrong, can you trace it back to the original webhook payload? Most stacks can't — and your auditor will notice." },
  { Icon: Key,      title: "Credential Sprawl",    desc: "API keys live in a junior developer's .env file. Rotation is manual, scopes are overgrown, and revoking access takes a sprint." },
];

function ChallengesSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="The Integration Gap"
          title="Six systems, six truths — and a thousand CSV files in between."
          description="Most ERP stacks are surrounded by a graveyard of brittle SFTP jobs, ad-hoc Zapier flows, and half-written webhooks. By the time the data reaches the ledger, the answers are already wrong."
          maxWidth={760}
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHALLENGES.map(({ Icon: CIcon, title, desc }) => (
            <Card key={title} pad="lg" hover="lift">
              <IconBadge tone="sage" size="md" className="mb-5"><CIcon className="size-5" /></IconBadge>
              <h3 className="text-[16px] font-bold text-bz-text mb-2">{title}</h3>
              <p className="text-[13px] text-bz-text-muted leading-[1.7]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── SOLUTIONS ───────────────────────────────────────────────────────────────
const SOLUTIONS = [
  { Icon: Layers,    title: "200+ Pre-Built Connectors", desc: "From Stripe and Shopify to SAP and SWIFT — drop in a connector, authenticate, and the data flows. No glue code, no maintenance burden." },
  { Icon: Shuffle,   title: "Bidirectional Sync",        desc: "Push and pull on the same channel. Sales orders flow in, fulfillment status flows out — with conflict resolution and idempotency baked in." },
  { Icon: GitBranch, title: "Visual Field Mapper",       desc: "Map source schemas to Bizak entities through a drag-and-drop canvas. Transform, lookup, and route values without writing scripts." },
  { Icon: RefreshCw, title: "Retry & Dead-Letter Queue", desc: "Transient failures retry with exponential backoff. Permanent failures land in the DLQ with full payload — replay or fix-and-resume in one click." },
  { Icon: Shield,    title: "Audit-Grade Lineage",       desc: "Every record carries the originating payload, transform, and timestamp. Trace any ledger row back to the API response that produced it." },
  { Icon: Code,      title: "Low-Code Recipe Builder",   desc: "When pre-builts aren't enough, compose a recipe with HTTP, JSON, and conditional logic. Ship custom integrations in hours, not sprints." },
];

function SolutionSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="The Solution"
          title="One integration layer for every system you run"
          align="center"
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {SOLUTIONS.map(({ Icon: SIcon, title, desc }) => (
            <div key={title}>
              <IconBadge tone="sage" size="md" className="mb-4"><SIcon className="size-5" /></IconBadge>
              <h4 className="text-[16px] font-bold text-bz-text mb-2">{title}</h4>
              <p className="text-[13px] text-bz-text-muted leading-[1.7]">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── CAPABILITIES ────────────────────────────────────────────────────────────
function CapabilitiesSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="A connector platform built into your ERP, not bolted on."
          tone="light"
          maxWidth={620}
          className="mb-16"
        />
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
          {/* Connector marketplace — span 6 */}
          <Card tone="dark" pad="lg" className="lg:col-span-6">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
              <div>
                <div className="text-[44px] font-bold text-bz-accent leading-none">200+</div>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/45 mt-2">Connectors · Marketplace</p>
                <div className="flex gap-7 mt-5">
                  {[{ val: "8", lbl: "Categories" }, { val: "<2 min", lbl: "Avg Setup" }].map((s) => (
                    <div key={s.lbl}>
                      <div className="text-[22px] font-bold text-bz-accent">{s.val}</div>
                      <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/35 mt-1">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="text-[18px] font-bold text-white mb-2">The Connector Marketplace</h4>
                <p className="text-[13px] text-white/45 leading-[1.6] mb-5">
                  Every connector is versioned, certified, and maintained — so vendor API changes never become your problem.
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { abbr: "STR", cat: "Payments" }, { abbr: "SHO", cat: "Commerce" },
                    { abbr: "QBO", cat: "Ledger"   }, { abbr: "SAL", cat: "CRM"      },
                    { abbr: "BNK", cat: "Banking"  }, { abbr: "PAY", cat: "Payroll"  },
                    { abbr: "SAP", cat: "ERP"      }, { abbr: "AWS", cat: "Storage"  },
                  ].map((c) => (
                    <div key={c.abbr} className="bg-white/[0.04] border border-white/10 rounded-bz-md py-2.5 px-2 text-center">
                      <div className="text-[13px] font-extrabold text-bz-accent tracking-[0.04em]">{c.abbr}</div>
                      <div className="text-[8px] font-semibold tracking-[0.1em] uppercase text-white/35 mt-0.5">{c.cat}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Field mapper — span 3 */}
          <Card tone="dark" pad="lg" className="lg:col-span-3">
            <h3 className="text-[18px] font-bold text-white mb-2">Field Mapper</h3>
            <p className="text-[13px] text-white/50 leading-[1.6] mb-5">
              Drag source fields onto Bizak entities. Add transforms, lookups, and conditional routes — without writing a line of code.
            </p>
            <div className="border border-white/10 rounded-bz-md overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-3 py-2 bg-white/[0.04] text-[9px] font-bold tracking-[0.12em] uppercase text-white/45">
                <span>Source</span><span>→</span><span>Target</span>
              </div>
              {[
                { src: "stripe.charge.id",      tgt: "tx_external_id"   },
                { src: "stripe.amount / 100",   tgt: "tx_amount_usd"    },
                { src: "stripe.metadata.so",    tgt: "sales_order.code" },
                { src: "stripe.created · ISO",  tgt: "tx_posted_at"     },
              ].map((r) => (
                <div key={r.src} className="grid grid-cols-[1fr_auto_1fr] gap-2 px-3 py-2 text-[11px] border-t border-white/5">
                  <span className="text-white/55">{r.src}</span>
                  <span className="text-bz-accent">→</span>
                  <span className="text-[#4ade80]">{r.tgt}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Retry & Replay — span 3 */}
          <Card tone="dark" pad="lg" className="lg:col-span-3">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-[18px] font-bold text-white mb-2">Retry & Replay</h3>
                <p className="text-[13px] text-white/50 leading-[1.6]">
                  Failures retry automatically with exponential backoff. The unrecoverable ones land in a queryable dead-letter queue — replay any payload in a click.
                </p>
              </div>
              <IconBadge tone="accent" size="lg" className="flex-shrink-0"><RefreshCw className="size-5" /></IconBadge>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[["3", "Auto Retries"], ["5m", "Backoff Cap"], ["1-click", "DLQ Replay"]].map(([val, sub]) => (
                <div key={sub} className="bg-white/[0.04] border border-white/10 rounded-bz-md py-3 text-center">
                  <div className="text-[15px] font-bold text-bz-accent">{val}</div>
                  <div className="text-[9px] font-bold tracking-[0.08em] uppercase text-white/40 mt-1">{sub}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Webhook router — span 2 */}
          <Card tone="dark" pad="lg" className="lg:col-span-2">
            <IconBadge tone="accent" size="lg" className="mb-5"><Webhook className="size-5" /></IconBadge>
            <h4 className="text-[16px] font-bold text-white mb-2">Webhook Router</h4>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              Receive, validate, dedupe, and fan out events to any module. Sub-second routing with HMAC verification on every payload.
            </p>
          </Card>

          {/* Health monitoring — span 2 */}
          <Card tone="dark" pad="lg" className="lg:col-span-2 relative border-bz-accent/40">
            <span className="absolute top-4 right-5 text-[9px] font-bold text-bz-accent uppercase tracking-[0.2em] opacity-85">Watching</span>
            <IconBadge tone="accent" size="lg" className="mb-5"><Eye className="size-5" /></IconBadge>
            <h4 className="text-[16px] font-bold text-white mb-2">Health Monitoring</h4>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              Per-connector dashboards with throughput, error rate, and latency percentiles. Alerts fire only on real degradation, not noise.
            </p>
          </Card>

          {/* Vault — span 2 */}
          <Card tone="dark" pad="lg" className="lg:col-span-2 flex flex-col">
            <IconBadge tone="accent" size="lg" className="mb-5"><Shield className="size-5" /></IconBadge>
            <h4 className="text-[16px] font-bold text-white mb-2">Vault & Scoped Secrets</h4>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              Credentials encrypted at rest, scoped per connector, and rotated on a schedule. SOC 2 logged, never logged in plaintext.
            </p>
            <div className="mt-auto pt-4 flex gap-1.5 flex-wrap">
              {["AES-256", "HMAC", "OAuth", "mTLS"].map((b) => (
                <span key={b} className="text-[9px] font-bold px-2 py-1 rounded bg-bz-accent/10 text-bz-accent tracking-[0.06em] uppercase">{b}</span>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

// ─── INSIGHTS ────────────────────────────────────────────────────────────────
function InsightsSection() {
  const lanes = [
    { lbl: "Inbound · Webhooks", v: 84, color: "var(--bz-accent)" },
    { lbl: "Outbound · API",     v: 62, color: "rgba(199,255,53,0.55)" },
    { lbl: "Scheduled Pulls",    v: 38, color: "rgba(122,130,109,0.5)" },
    { lbl: "Bulk Imports",       v: 24, color: "rgba(122,130,109,0.3)" },
  ];
  return (
    <Section tone="white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Card pad="lg">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-bz-sage">Sync Volume · 24h</div>
                <div className="text-[24px] font-extrabold text-bz-text mt-1">2.18M <span className="text-[12px] text-[#16a34a] font-bold">+8.6%</span></div>
              </div>
              <PillBadge tone="accent" dot>Healthy</PillBadge>
            </div>
            <div className="flex flex-col gap-3.5 py-5">
              {lanes.map((l) => (
                <div key={l.lbl} className="flex items-center gap-2.5">
                  <span className="text-[10px] text-bz-text-muted font-semibold min-w-[110px]">{l.lbl}</span>
                  <div className="flex-1 h-4 bg-bz-sage/[0.06] rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${l.v}%`, background: l.color }} />
                  </div>
                  <span className="text-[10px] text-bz-sage font-bold min-w-[36px] text-right">{l.v * 18}k</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-4 border-t border-bz-border flex items-center justify-between">
              <span className="text-[11px] font-bold text-bz-text">p95 latency · 412ms</span>
              <span className="text-[10px] text-[#16a34a] font-bold">▼ 18% vs last week</span>
            </div>
          </Card>

          <div>
            <SectionHeading
              eyebrow="Reliability That Compounds"
              title="Plug it in once, then forget it."
              description="Bizak Integrations are versioned, certified, and self-healing. When a vendor changes their API, the connector updates — your recipes and dashboards keep working without a sprint of regression fixes."
              maxWidth={500}
              className="mb-6"
            />
            <ul className="flex flex-col gap-3">
              {[
                { bold: "Idempotent by Default", rest: " — Every payload carries a deterministic key, so duplicate webhooks never double-post." },
                { bold: "Schema-Aware Mapping",  rest: " — Source schema changes surface as warnings before they break the ledger." },
                { bold: "Replay Without Drift",  rest: " — DLQ payloads can be replayed on demand with full transform context preserved." },
              ].map((item) => (
                <li key={item.bold} className="flex gap-3">
                  <CheckCircle className="size-5 text-bz-sage flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-bz-text-muted leading-[1.7]">
                    <strong className="text-bz-text">{item.bold}</strong>{item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── WORKFLOW STRIP ──────────────────────────────────────────────────────────
const STEPS = [
  { Icon: Plug,      label: "Connect"   },
  { Icon: Key,       label: "Authorize" },
  { Icon: GitBranch, label: "Map"       },
  { Icon: Shuffle,   label: "Test"      },
  { Icon: Calendar,  label: "Schedule"  },
  { Icon: Eye,       label: "Monitor"   },
];

function WorkflowSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="From Handshake to Heartbeat"
          title="The end-to-end integration workflow"
          align="center"
          className="mb-14"
        />
        <div className="relative">
          <div className="hidden md:block absolute top-7 left-[8%] right-[8%] h-px bg-bz-border" />
          <div className="hidden md:block absolute top-7 left-[8%] right-[8%] h-px bg-bz-accent/60" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 relative">
            {STEPS.map(({ Icon: SIcon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-white border border-bz-border flex items-center justify-center mb-3 relative z-10">
                  <SIcon className="size-6 text-bz-sage" />
                </div>
                <span className="text-[13px] font-bold text-bz-text">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          title={<>Plug Bizak in.<br />Stop hand-wiring data.</>}
          description="Trade brittle CSVs and one-off webhooks for a governed integration layer. Your ERP, every system around it, one source of truth."
          tone="light"
          align="center"
          maxWidth={580}
          className="mb-10"
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="https://system.bizakerp.com/account/self-register" withArrow>Start Free Trial</Button>
          <Button variant="ghostDark" size="lg" href="/contact">Book a Demo</Button>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export function Integrations() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroCentered
          tone="dark"
          mesh={false}
          badge={<HeroBadge tone="dark">Integrations</HeroBadge>}
          title={<>Every system in your stack,<br /><span className="text-bz-sage">speaking the same language.</span></>}
          description="Bizak connects banks, ecommerce, payments, payroll, and 200+ external systems with bidirectional sync, automatic retries, and audit-grade lineage — so your ERP is always the single source of truth."
          actions={
            <>
              <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
              <Button variant="ghostDark" size="lg" href="#solutions">Browse Connectors</Button>
            </>
          }
          visual={
            <>
              <div className="flex flex-wrap justify-center gap-8 md:gap-14 py-6 mb-8 border-y border-white/10">
                {[
                  { value: "200+",   label: "Connectors"   },
                  { value: "99.99%", label: "Sync Uptime"  },
                  { value: "< 60s",  label: "Sync Latency" },
                ].map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} tone="light" size="md" align="center" />
                ))}
              </div>
              <SyncHubVisual />
            </>
          }
        />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <InsightsSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

