import {
  Activity,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Handshake,
  Layers,
  Mail,
  Play,
  Receipt,
  Repeat,
  Search,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  BigCard,
  Container,
  DotGrid,
  Heading,
  HeroCanvas,
  Pill,
  Section,
  SectionHead,
  StatTile,
  StripeBar,
} from "./bz";

// ── Hero ─────────────────────────────────────────────────────────────────────

const HERO_PIPELINE = [
  { stage: "Logged",    value: "$32,480", note: "Today",    state: "done" },
  { stage: "Approved",  value: "$28,140", note: "5h ago",   state: "done" },
  { stage: "Invoiced",  value: "$24,900", note: "Drafting", state: "live" },
  { stage: "Collected", value: "$18,420", note: "DSO 21d",  state: "queued" },
] as const;

const HERO_TEAM = [
  { initials: "AR", name: "A. Reyes",  load: 102, state: "burn" },
  { initials: "KI", name: "K. Ito",    load:  88, state: "good" },
  { initials: "SP", name: "S. Patel",  load:  82, state: "good" },
  { initials: "MS", name: "M. Singh",  load:  41, state: "idle" },
  { initials: "JP", name: "J. Park",   load:  18, state: "idle" },
] as const;

function PracticeCommandMock() {
  return (
    <div className="relative z-[2] w-full pb-10">
      {/* Row 1 — running timer */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-4">
        <div className="rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-bz-fire" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-fire">
              Active timer · Live
            </span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-bz-lg bg-bz-fire/15 text-bz-fire">
                <Timer size={18} />
              </span>
              <div className="text-left">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/[0.62]">
                  Hartwell &amp; Locke · M&amp;A Diligence
                </div>
                <div className="text-[12px] text-white/[0.72]">Lead partner · Senior associate</div>
              </div>
            </div>
            <div className="text-bz-text-on-dark text-[42px] md:text-[52px] font-medium leading-none tabular-nums tracking-[-0.02em]">
              02:48:11
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-bz-md bg-white/[0.05] px-3 py-2 text-left">
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/[0.6]">Rate</div>
              <div className="text-[14px] font-medium text-bz-text-on-dark">$240 / hr</div>
            </div>
            <div className="rounded-bz-md bg-white/[0.05] px-3 py-2 text-left">
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/[0.6]">Billable today</div>
              <div className="text-[14px] font-medium text-bz-fire">$32,480</div>
            </div>
            <div className="rounded-bz-md bg-white/[0.05] px-3 py-2 text-left">
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/[0.6]">Realisation</div>
              <div className="text-[14px] font-medium text-bz-leaf">94.2%</div>
            </div>
          </div>
        </div>

        <div className="rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={12} className="text-bz-leaf" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">
              Practice utilisation · Week 21
            </span>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-bz-text-on-dark text-[44px] font-medium leading-none tabular-nums tracking-[-0.02em]">
              87%
            </div>
            <span className="mb-1 text-[11px] text-bz-leaf">↑ 6.1pp QoQ</span>
          </div>
          <div className="mt-4">
            <StripeBar pct={87} tone="dark" />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {[78, 84, 72, 81, 46].map((h, i) => (
              <div
                key={i}
                className="rounded-sm bg-bz-fire/70"
                style={{ height: 6 + (h / 100) * 28 }}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-5 text-center text-[9px] text-white/[0.48]">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 — team load strip */}
      <div className="rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">
            Team load · live
          </span>
          <span className="text-[10px] text-white/[0.5]">2 idle · 1 over-allocated</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {HERO_TEAM.map((m) => {
            const cap = Math.min(m.load, 100);
            const fill =
              m.state === "burn"
                ? "bg-[#f87171]"
                : m.state === "idle"
                ? "bg-white/[0.18]"
                : "bg-bz-fire";
            const lbl =
              m.state === "burn"
                ? "text-[#f87171]"
                : m.state === "idle"
                ? "text-white/[0.5]"
                : "text-bz-fire";
            return (
              <div key={m.initials} className="flex flex-col items-center text-center">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] text-[10px] font-medium text-white/[0.82] tracking-[0.06em]">
                  {m.initials}
                </span>
                <span className="mt-2 text-[10.5px] text-white/[0.62]">{m.name}</span>
                <div className="mt-2 h-1 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div className={`h-full ${fill}`} style={{ width: `${cap}%` }} />
                </div>
                <span className={`mt-1.5 text-[10px] font-medium tabular-nums ${lbl}`}>
                  {m.load}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3 — time → bill pipeline */}
      <div className="rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">
            Time → bill · today
          </span>
          <span className="text-[10px] text-bz-leaf">0 re-keyed entries</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HERO_PIPELINE.map((p, i) => (
            <div
              key={p.stage}
              className="rounded-bz-md border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.55]">
                  {String(i + 1).padStart(2, "0")} · {p.stage}
                </span>
                <span
                  className={`inline-flex h-1.5 w-1.5 rounded-full ${
                    p.state === "live"
                      ? "bg-bz-fire"
                      : p.state === "done"
                      ? "bg-bz-leaf"
                      : "bg-white/[0.25]"
                  }`}
                />
              </div>
              <div className="text-[18px] font-medium text-bz-text-on-dark tabular-nums tracking-[-0.01em]">
                {p.value}
              </div>
              <div className="text-[10px] text-white/[0.48] mt-0.5">{p.note}</div>
            </div>
          ))}
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
          <BadgeGreen style={{ marginBottom: 28 }}>Built for Practice Firms</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Bill every hour.{" "}
            <Heading.Muted>Deliver every engagement.</Heading.Muted>
          </Heading>
          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill
              variant="dark"
              withTick
              href="https://system.bizakerp.com/account/self-register"
            >
              Start free trial
            </Pill>
            <Pill variant="light" iconLeft={<Sparkles size={13} />} href="/contact">
              Book a demo
            </Pill>
          </div>
        </div>
        <HeroCanvas>
          <PracticeCommandMock />
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ── 02 · One tap to invoice ──────────────────────────────────────────────────

const ONE_TAP_BULLETS = [
  "One-tap timers across web, mobile and desktop with offline sync",
  "AI proposes entries from calendar, mail and document activity",
  "Approved time auto-flows to draft invoices and WIP reports",
  "Fixed-fee, T&M, milestone, retainer — every billing model",
];

function OneTapVisual() {
  return (
    <div className="flex flex-col gap-3 p-5 md:p-6">
      {/* Tile 1 — running timer */}
      <div className="rounded-bz-lg border border-white/[0.08] bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-bz-md bg-bz-fire/15 text-bz-fire">
              <Play size={12} />
            </span>
            <div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-bz-fire">
                One tap · started
              </div>
              <div className="text-[11px] text-white/[0.72]">Vector Capital · Strategy review</div>
            </div>
          </div>
          <div className="text-[15px] font-medium text-bz-text-on-dark tabular-nums">
            01:14:32
          </div>
        </div>
      </div>

      {/* Tile 2 — AI suggestions */}
      <div className="rounded-bz-lg border border-white/[0.08] bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="grid h-7 w-7 place-items-center rounded-bz-md bg-bz-leaf/15 text-bz-leaf">
            <Zap size={12} />
          </span>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-bz-leaf">
            AI suggested · ready to approve
          </span>
        </div>
        {[
          { src: "Calendar", task: "Northwind Health · Compliance audit", dur: "00:48" },
          { src: "Mail", task: "Hartwell & Locke · Diligence call", dur: "00:36" },
          { src: "Docs",    task: "Vector Capital · Memo edits",         dur: "00:24" },
        ].map((s) => (
          <div
            key={s.task}
            className="flex items-center gap-2.5 py-1.5 border-b border-white/[0.05] last:border-0"
          >
            <span className="rounded-sm bg-white/[0.06] px-1.5 py-0.5 text-[8.5px] font-medium uppercase tracking-[0.1em] text-white/[0.55] min-w-[44px] text-center">
              {s.src}
            </span>
            <span className="flex-1 text-[10.5px] text-white/[0.72] truncate">{s.task}</span>
            <span className="text-[10.5px] font-medium text-bz-text-on-dark tabular-nums">
              {s.dur}
            </span>
            <CheckCircle size={12} className="text-bz-fire" />
          </div>
        ))}
      </div>

      {/* Tile 3 — draft invoice */}
      <div className="rounded-bz-lg border border-bz-fire/30 bg-bz-fire/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-bz-fire">
              Draft invoice · INV-4218
            </div>
            <div className="text-[11px] text-white/[0.72]">Hartwell &amp; Locke · May 2026</div>
          </div>
          <Receipt size={16} className="text-bz-fire" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-white/[0.5]">Hours</div>
            <div className="text-[13px] font-medium text-bz-text-on-dark tabular-nums">42.5h</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-white/[0.5]">Rate</div>
            <div className="text-[13px] font-medium text-bz-text-on-dark tabular-nums">$240</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-white/[0.5]">Net</div>
            <div className="text-[13px] font-medium text-bz-fire tabular-nums">$10,200</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OneTapToInvoiceSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="From timer to invoice"
          title={
            <>
              One tap starts the clock.{" "}
              <Heading.Muted>Bizak does the rest, end-to-end.</Heading.Muted>
            </>
          }
          description="Friday-afternoon recall costs an average of 14% of revenue. Bizak captures time as it happens, lets AI propose the rest, and pushes approved hours straight into draft invoices — zero re-keying."
        />
        <BigCard
          text={{
            title: <>From the first tap to a paid invoice, on one platform.</>,
            body: "Every minute logged feeds the same database your finance team posts from. Time becomes WIP becomes invoice becomes ledger entry — no exports, no spreadsheets, no Friday-night reconciliations.",
            bullets: ONE_TAP_BULLETS,
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "See it in action",
            },
          }}
          visual={<OneTapVisual />}
        />
      </Container>
    </Section>
  );
}

// ── 03 · Resource heatmap ────────────────────────────────────────────────────

const HEATMAP_PEOPLE = [
  { name: "A. Reyes",  role: "Senior partner", loads: [102, 96, 88, 72] },
  { name: "K. Ito",    role: "Manager",        loads: [ 88, 92, 84, 76] },
  { name: "S. Patel",  role: "Senior",         loads: [ 78, 82, 90, 86] },
  { name: "M. Singh",  role: "Senior",         loads: [ 41, 58, 72, 80] },
  { name: "J. Park",   role: "Analyst",        loads: [ 18, 24, 48, 64] },
] as const;

function cellTone(load: number) {
  if (load > 100) return { bg: "bg-[#f87171]/90", text: "text-bz-text" };
  if (load > 85)  return { bg: "bg-bz-fire",       text: "text-bz-text" };
  if (load > 60)  return { bg: "bg-bz-fire/45",    text: "text-bz-text-on-dark" };
  if (load > 40)  return { bg: "bg-bz-fire/20",    text: "text-white/[0.72]" };
  return            { bg: "bg-white/[0.06]",     text: "text-white/[0.55]" };
}

function ResourceHeatmapSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="02"
          label="Real-time resourcing"
          tone="dark"
          title={
            <>
              See who's loaded, who's free,{" "}
              <Heading.Muted>and who's about to burn.</Heading.Muted>
            </>
          }
          description="A live four-week grid of every consultant's allocation — with overload warnings, idle alerts, and skill-aware suggestions for staffing the next engagement."
        />

        <div className="relative overflow-hidden rounded-bz-3xl border border-white/[0.08] bg-bz-olive-soft p-5 md:p-8">
          <DotGrid tone="dark" />
          <div className="relative z-[1] overflow-x-auto">
            <div className="grid min-w-[640px] grid-cols-[200px_repeat(4,1fr)] gap-2.5">
              <div />
              {["Week 21", "Week 22", "Week 23", "Week 24"].map((w) => (
                <div
                  key={w}
                  className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.62] text-center"
                >
                  {w}
                </div>
              ))}
              {HEATMAP_PEOPLE.map((p) => (
                <div key={p.name} className="contents">
                  <div className="flex flex-col justify-center pr-2">
                    <span className="text-[12.5px] font-medium text-bz-text-on-dark">
                      {p.name}
                    </span>
                    <span className="text-[10.5px] text-white/[0.5]">{p.role}</span>
                  </div>
                  {p.loads.map((l, i) => {
                    const t = cellTone(l);
                    return (
                      <div
                        key={i}
                        className={`grid h-12 place-items-center rounded-bz-md ${t.bg}`}
                      >
                        <span className={`text-[13px] font-medium tabular-nums ${t.text}`}>
                          {l}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-[1] mt-6 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/[0.62]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#f87171]/90" /> Over capacity
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-bz-fire" /> Healthy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-bz-fire/20" /> Idle
              </span>
            </div>
            <span className="text-[11px] text-bz-leaf">
              Suggestion · move J. Park onto Hartwell &amp; Locke (W23) — frees A. Reyes by 18%
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ── 04 · Practice capabilities ───────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: Briefcase,
    title: "Engagement & project management",
    desc: "Plan, staff and run every engagement from proposal to close — phases, milestones, deliverables and budget guardrails on one timeline.",
  },
  {
    icon: Clock,
    title: "Time & expense capture",
    desc: "One-tap timers, mobile entry, AI-suggested entries — and approval chains that feed invoices with zero re-keying.",
  },
  {
    icon: Users,
    title: "Resource planning",
    desc: "See who's loaded, who's free, and who's about to bench. Rebalance teams in real time and forecast hiring weeks ahead.",
  },
  {
    icon: Receipt,
    title: "Flexible billing & retainers",
    desc: "Fixed-fee, T&M, milestone, retainer, contingent — every model, with auto-generated invoices and WIP statements.",
  },
  {
    icon: Handshake,
    title: "Client portal & CRM",
    desc: "A branded client workspace for proposals, deliverables, approvals and statements — replacing ten back-and-forth emails.",
  },
  {
    icon: TrendingUp,
    title: "Profitability analytics",
    desc: "Live cost-to-bill, realisation and margin per engagement, partner and practice — actionable while work is still in flight.",
  },
] as const;

function PracticeCapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Practice operating picture"
          title={
            <>
              Every part of a modern firm,{" "}
              <Heading.Muted>on one connected platform.</Heading.Muted>
            </>
          }
          titleMaxWidth={760}
        />
        <BentoGrid cols={3}>
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <Bento.Header
                title={title}
                icon={
                  <span className="grid h-10 w-10 place-items-center rounded-bz-lg bg-bz-fire/15 text-bz-fire">
                    <Icon size={18} />
                  </span>
                }
              />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ── 05 · Engagement profitability ────────────────────────────────────────────

const MARGIN_ENGAGEMENTS = [
  { client: "Hartwell & Locke",       type: "T&M",        margin:  38, val: "+$42.1k" },
  { client: "Vector Capital",         type: "Retainer",   margin:  29, val: "+$31.4k" },
  { client: "Northwind Health",       type: "Milestone",  margin:  22, val: "+$18.7k" },
  { client: "Birchgrove Logistics",   type: "Fixed-fee",  margin:  12, val:  "+$8.2k" },
  { client: "Atlas Mineral Partners", type: "Fixed-fee",  margin:  -8, val:  "-$6.3k" },
] as const;

function EngagementProfitabilitySection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="04"
          label="Live engagement margin"
          title={
            <>
              Know which engagement is bleeding{" "}
              <Heading.Muted>while you can still fix it.</Heading.Muted>
            </>
          }
          description="Bizak posts cost and revenue per engagement in real time — so the partner reviewing this Friday sees the same number the analyst posted Wednesday."
        />

        <div className="rounded-bz-3xl border border-bz-line-soft bg-bz-surface p-5 md:p-8">
          <div className="flex flex-col gap-3.5">
            {MARGIN_ENGAGEMENTS.map((e) => {
              const neg = e.margin < 0;
              const pct = Math.min(Math.abs(e.margin) * 1.6, 60);
              return (
                <div
                  key={e.client}
                  className="grid grid-cols-1 md:grid-cols-[1.6fr_3fr_0.6fr] gap-3 md:items-center"
                >
                  <div>
                    <div className="text-[13.5px] font-medium text-bz-text">
                      {e.client}
                    </div>
                    <div className="text-[11.5px] text-bz-text-muted">{e.type}</div>
                  </div>

                  <div className="relative flex h-3 items-center">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-bz-line-soft" />
                    <div
                      className={`absolute h-full rounded-full ${
                        neg ? "bg-[#f87171]" : "bg-bz-fire"
                      }`}
                      style={
                        neg
                          ? { right: "50%", width: `${pct}%` }
                          : { left: "50%",  width: `${pct}%` }
                      }
                    />
                  </div>

                  <div
                    className={`text-right text-[13px] font-medium tabular-nums ${
                      neg ? "text-[#f87171]" : "text-bz-text"
                    }`}
                  >
                    {e.val}
                    <span className="ml-1 text-[10.5px] text-bz-text-muted">
                      ({e.margin > 0 ? "+" : ""}
                      {e.margin}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile value="87%" desc="Average utilisation across the practice." />
          <StatTile value="94.2%" desc="Realisation rate on approved time entries." />
          <StatTile value="12 d" desc="Faster from work-done to invoice sent." />
        </div>
      </Container>
    </Section>
  );
}

// ── 06 · Practice lifecycle ──────────────────────────────────────────────────

const LIFECYCLE = [
  { icon: Search,    label: "Lead",     desc: "Capture inbound, qualify, route to a partner." },
  { icon: FileText,  label: "Proposal", desc: "Scope, price and e-sign — from a template library." },
  { icon: Handshake, label: "Engage",   desc: "Staff the team, set milestones, kick off." },
  { icon: Timer,     label: "Deliver",  desc: "Track time, monitor budget, flag scope drift live." },
  { icon: Receipt,   label: "Bill",     desc: "Approved hours auto-post to invoices and the GL." },
  { icon: Repeat,    label: "Renew",    desc: "Client portal carries the relationship forward." },
] as const;

function PracticeLifecycleSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="05"
          label="Engagement lifecycle"
          title={
            <>
              From first conversation{" "}
              <Heading.Muted>to lifetime client.</Heading.Muted>
            </>
          }
          titleMaxWidth={680}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {LIFECYCLE.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className="relative rounded-bz-2xl border border-bz-line-soft bg-bz-surface p-5 flex flex-col gap-3"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bz-text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-bz-lg bg-bz-leaf/30 text-bz-text">
                <Icon size={18} />
              </span>
              <div>
                <div className="text-[15px] font-medium text-bz-text">{label}</div>
                <p className="mt-1 text-[12.5px] leading-[1.55] text-bz-text-muted">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-bz-2xl bg-bz-section-b p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-bz-lg bg-bz-fire/15 text-bz-fire">
              <Layers size={18} />
            </span>
            <div>
              <div className="text-[14.5px] font-medium text-bz-text">
                One database behind every step
              </div>
              <p className="mt-1 max-w-[560px] text-[12.5px] leading-[1.55] text-bz-text-muted">
                Lead becomes proposal becomes engagement becomes invoice becomes journal entry —
                without re-keying, exports, or a single spreadsheet.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill variant="dark" withTick href="https://system.bizakerp.com/account/self-register">
              Start free trial
            </Pill>
            <Pill variant="light" iconLeft={<Mail size={13} />} href="/contact">
              Talk to practice team
            </Pill>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function ProfessionalServicePage() {
  return (
    <main>
      <HeroSection />
      <OneTapToInvoiceSection />
      <ResourceHeatmapSection />
      <PracticeCapabilitiesSection />
      <EngagementProfitabilitySection />
      <PracticeLifecycleSection />
    </main>
  );
}
