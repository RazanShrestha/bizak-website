import {
  Activity,
  Briefcase,
  Clock,
  FileText,
  Handshake,
  Layers,
  Receipt,
  Repeat,
  Search,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DotGrid,
  Heading,
  HeroCanvas,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatTile,
  StripeBar,
  Tick,
} from "./bz";

// ── Hero ─────────────────────────────────────────────────────────────────────

const HERO_PIPELINE = [
  { stage: "Logged",    value: "$32,480", note: "Today",    state: "done"   },
  { stage: "Approved",  value: "$28,140", note: "5h ago",   state: "done"   },
  { stage: "Invoiced",  value: "$24,900", note: "Drafting", state: "live"   },
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
      {/* Row 1 — timer + utilisation */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3 mb-3">
        {/* Timer — always visible */}
        <div className="rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-bz-fire" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-fire">
              Active timer · Live
            </span>
          </div>
          {/* Stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-bz-lg bg-bz-fire/15 text-bz-fire">
                <Timer size={16} />
              </span>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/[0.62]">
                  Hartwell &amp; Locke · M&amp;A Diligence
                </div>
                <div className="text-[11px] text-white/[0.6]">Lead partner · Senior associate</div>
              </div>
            </div>
            <div className="text-[28px] sm:text-[40px] md:text-[52px] font-medium leading-none tabular-nums tracking-[-0.02em] text-bz-text-on-dark">
              02:48:11
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Rate",         value: "$240 / hr",  cls: "text-bz-text-on-dark" },
              { label: "Billable today", value: "$32,480",  cls: "text-bz-fire"         },
              { label: "Realisation",  value: "94.2%",      cls: "text-bz-leaf"         },
            ].map(({ label, value, cls }) => (
              <div key={label} className="rounded-bz-md bg-white/[0.05] px-3 py-2">
                <div className="text-[9.5px] uppercase tracking-[0.12em] text-white/[0.55]">{label}</div>
                <div className={`text-[13px] font-medium ${cls}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilisation — hidden on small mobile to keep hero clean */}
        <div className="hidden sm:flex flex-col rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={12} className="text-bz-leaf" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">
              Practice utilisation · Week 21
            </span>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-[34px] md:text-[44px] font-medium leading-none tabular-nums tracking-[-0.02em] text-bz-text-on-dark">
              87%
            </div>
            <span className="mb-1 text-[11px] text-bz-leaf">↑ 6.1pp QoQ</span>
          </div>
          <div className="mt-4">
            <StripeBar pct={87} tone="dark" />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {[78, 84, 72, 81, 46].map((h, i) => (
              <div key={i} className="rounded-sm bg-bz-fire/70" style={{ height: 6 + (h / 100) * 28 }} />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-5 text-center text-[9px] text-white/[0.45]">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => <span key={d}>{d}</span>)}
          </div>
        </div>
      </div>

      {/* Row 2 — team load · too cramped below sm */}
      <div className="hidden sm:block rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-4 md:p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">Team load · live</span>
          <span className="text-[10px] text-white/[0.5]">2 idle · 1 over-allocated</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {HERO_TEAM.map((m) => {
            const cap = Math.min(m.load, 100);
            const fill = m.state === "burn" ? "bg-[#f87171]" : m.state === "idle" ? "bg-white/[0.18]" : "bg-bz-fire";
            const lbl  = m.state === "burn" ? "text-[#f87171]" : m.state === "idle" ? "text-white/[0.5]" : "text-bz-fire";
            return (
              <div key={m.initials} className="flex flex-col items-center text-center">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] text-[10px] font-medium text-white/[0.82] tracking-[0.06em]">
                  {m.initials}
                </span>
                <span className="mt-2 text-[10px] text-white/[0.6]">{m.name}</span>
                <div className="mt-2 h-1 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div className={`h-full ${fill}`} style={{ width: `${cap}%` }} />
                </div>
                <span className={`mt-1.5 text-[10px] font-medium tabular-nums ${lbl}`}>{m.load}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3 — time → bill pipeline */}
      <div className="rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/[0.62]">Time → bill · today</span>
          <span className="text-[10px] text-bz-leaf">0 re-keyed entries</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {HERO_PIPELINE.map((p, i) => (
            <div key={p.stage} className="rounded-bz-md border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/[0.5]">
                  {String(i + 1).padStart(2, "0")} · {p.stage}
                </span>
                <span className={`inline-flex h-1.5 w-1.5 rounded-full ${
                  p.state === "live" ? "bg-bz-fire" : p.state === "done" ? "bg-bz-leaf" : "bg-white/[0.25]"
                }`} />
              </div>
              <div className="text-[17px] font-medium text-bz-text-on-dark tabular-nums">{p.value}</div>
              <div className="text-[10px] text-white/[0.45] mt-0.5">{p.note}</div>
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
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>
        <HeroCanvas>
          <PracticeCommandMock />
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ── 01 · One tap to invoice ──────────────────────────────────────────────────

const ONE_TAP_BULLETS = [
  "One-tap timers across web, mobile and desktop with offline sync",
  "AI proposes entries from calendar, mail and document activity",
  "Approved time auto-flows to draft invoices and WIP reports",
  "Fixed-fee, T&M, milestone, retainer — every billing model",
];

function OneTapVisual() {
  return (
    <div className="flex flex-col gap-3">
      {/* Timer running */}
      <div className="rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-bz-fire" />
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-bz-fire">
            Active · 01:14:32
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-medium text-bz-text-on-dark">Vector Capital</div>
            <div className="text-[11px] text-white/[0.6] mt-0.5">Strategy review · $240 / hr</div>
          </div>
          <span className="rounded-bz-md bg-bz-fire/15 px-3 py-1.5 text-[12px] font-medium text-bz-fire tabular-nums">
            $298.00
          </span>
        </div>
      </div>

      {/* Connector */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35]">
          approved · auto-posted
        </span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* Draft invoice */}
      <div className="rounded-bz-xl border border-bz-fire/25 bg-bz-fire/[0.04] p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-bz-fire">
              Draft invoice · INV-4218
            </div>
            <div className="text-[11px] text-white/[0.6] mt-0.5">Hartwell &amp; Locke · May 2026</div>
          </div>
          <Receipt size={15} className="text-bz-fire mt-0.5" />
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="flex gap-5">
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-white/[0.45]">Hours</div>
              <div className="text-[13px] font-medium text-bz-text-on-dark tabular-nums">42.5h</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-white/[0.45]">Rate</div>
              <div className="text-[13px] font-medium text-bz-text-on-dark tabular-nums">$240</div>
            </div>
          </div>
          <div className="text-[22px] font-medium text-bz-fire tabular-nums tracking-[-0.01em]">
            $10,200
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
              <Heading.Muted>Bizak does the rest.</Heading.Muted>
            </>
          }
          description="Friday-afternoon recall costs an average of 14% of revenue. Bizak captures time as it happens, lets AI propose the rest, and pushes approved hours straight into draft invoices — zero re-keying."
        />
        {/* 1-col on mobile (text above, panel below), 2-col on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <ul className="flex flex-col gap-3.5 mb-8">
              {ONE_TAP_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[14px] leading-[1.65] text-bz-text">
                  <Tick size="sm" className="mt-[2px] shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Pill variant="dark" withArrow href="/contact">Request Demo</Pill>
          </div>
          <div className="rounded-bz-3xl bg-bz-olive overflow-hidden p-5 md:p-6">
            <OneTapVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ── 02 · Resource heatmap ────────────────────────────────────────────────────

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
            <div className="grid min-w-[520px] grid-cols-[150px_repeat(4,1fr)] gap-2">
              <div />
              {["Week 21", "Week 22", "Week 23", "Week 24"].map((w) => (
                <div key={w} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/[0.55] text-center">
                  {w}
                </div>
              ))}
              {HEATMAP_PEOPLE.map((p) => (
                <div key={p.name} className="contents">
                  <div className="flex flex-col justify-center pr-2">
                    <span className="text-[12px] font-medium text-bz-text-on-dark">{p.name}</span>
                    <span className="text-[10px] text-white/[0.5]">{p.role}</span>
                  </div>
                  {p.loads.map((l, i) => {
                    const t = cellTone(l);
                    return (
                      <div key={i} className={`grid h-11 place-items-center rounded-bz-md ${t.bg}`}>
                        <span className={`text-[12px] font-medium tabular-nums ${t.text}`}>{l}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-[1] mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/[0.62]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#f87171]/90" /> Over capacity</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-bz-fire" /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-bz-fire/20" /> Idle</span>
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

// ── 03 · Practice capabilities ───────────────────────────────────────────────

const CAPABILITIES = [
  { icon: Briefcase,  title: "Engagement & project management", desc: "Plan, staff and run every engagement from proposal to close — phases, milestones, deliverables and budget guardrails on one timeline." },
  { icon: Clock,      title: "Time & expense capture",          desc: "One-tap timers, mobile entry, AI-suggested entries — and approval chains that feed invoices with zero re-keying." },
  { icon: Users,      title: "Resource planning",               desc: "See who's loaded, who's free, and who's about to bench. Rebalance teams in real time and forecast hiring weeks ahead." },
  { icon: Receipt,    title: "Flexible billing & retainers",    desc: "Fixed-fee, T&M, milestone, retainer, contingent — every model, with auto-generated invoices and WIP statements." },
  { icon: Handshake,  title: "Client portal & CRM",             desc: "A branded client workspace for proposals, deliverables, approvals and statements — replacing ten back-and-forth emails." },
  { icon: TrendingUp, title: "Profitability analytics",         desc: "Live cost-to-bill, realisation and margin per engagement, partner and practice — actionable while work is still in flight." },
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

// ── 04 · Engagement profitability ────────────────────────────────────────────

const MARGIN_ENGAGEMENTS = [
  { client: "Hartwell & Locke",       type: "T&M",       margin:  38, val: "+$42.1k" },
  { client: "Vector Capital",         type: "Retainer",  margin:  29, val: "+$31.4k" },
  { client: "Northwind Health",       type: "Milestone", margin:  22, val: "+$18.7k" },
  { client: "Birchgrove Logistics",   type: "Fixed-fee", margin:  12, val:  "+$8.2k" },
  { client: "Atlas Mineral Partners", type: "Fixed-fee", margin:  -8, val:  "-$6.3k" },
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
          <div className="flex flex-col">
            {MARGIN_ENGAGEMENTS.map((e) => {
              const neg = e.margin < 0;
              const pct = Math.min(Math.abs(e.margin) * 1.6, 60);
              return (
                <div
                  key={e.client}
                  // Mobile: single flex row (name + value). Desktop: 3-col with bar.
                  className="flex items-center justify-between gap-3 border-b border-bz-line-soft last:border-0 py-3 md:grid md:grid-cols-[1.6fr_3fr_0.6fr] md:items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-bz-text truncate">{e.client}</div>
                    <div className="text-[11.5px] text-bz-text-muted">{e.type}</div>
                  </div>

                  <div className="hidden md:flex relative h-3 items-center">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-bz-line-soft" />
                    <div
                      className={`absolute h-full rounded-full ${neg ? "bg-[#f87171]" : "bg-bz-fire"}`}
                      style={neg ? { right: "50%", width: `${pct}%` } : { left: "50%", width: `${pct}%` }}
                    />
                  </div>

                  <div className={`shrink-0 text-right text-[13px] font-medium tabular-nums ${neg ? "text-[#f87171]" : "text-bz-text"}`}>
                    {e.val}
                    <span className="ml-1 text-[10.5px] text-bz-text-muted hidden sm:inline">
                      ({e.margin > 0 ? "+" : ""}{e.margin}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile value="87%"  desc="Average utilisation across the practice." />
          <StatTile value="94.2%" desc="Realisation rate on approved time entries." />
          <StatTile value="12 d" desc="Faster from work-done to invoice sent." />
        </div>
      </Container>
    </Section>
  );
}

// ── 05 · Practice lifecycle ──────────────────────────────────────────────────

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

        {/* 2-col on mobile, 3-col on sm, 6-col on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LIFECYCLE.map(({ icon: Icon, label, desc }, i) => (
            <div key={label} className="rounded-bz-2xl border border-bz-line-soft bg-bz-surface p-4 flex flex-col gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-bz-text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-bz-lg bg-bz-leaf/30 text-bz-text">
                <Icon size={16} />
              </span>
              <div>
                <div className="text-[14px] font-medium text-bz-text">{label}</div>
                <p className="mt-1 text-[12px] leading-[1.5] text-bz-text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-bz-2xl bg-bz-section-b p-5 md:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-bz-lg bg-bz-fire/15 text-bz-fire">
              <Layers size={16} />
            </span>
            <div>
              <div className="text-[14px] font-medium text-bz-text">One database behind every step</div>
              <p className="mt-1 max-w-[560px] text-[12.5px] leading-[1.55] text-bz-text-muted">
                Lead becomes proposal becomes engagement becomes invoice becomes journal entry —
                without re-keying, exports, or a single spreadsheet.
              </p>
            </div>
          </div>
          <PillGroup className="shrink-0">
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Free Trial</Pill>
            <Pill variant="light" withArrow href="/contact">Talk to Sales</Pill>
          </PillGroup>
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
