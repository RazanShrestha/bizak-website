import {
  Briefcase,
  Clock,
  Handshake,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  BigCard,
  Container,
  DataRow,
  DotGrid,
  Heading,
  HeroCanvas,
  JournalRow,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StepCard,
  StripeBar,
  Tick,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════════

const ACTIVE_TIMERS = [
  { id: "TM-0041", client: "Hartwell & Locke", pct: 78  },
  { id: "TM-0042", client: "Vector Capital",   pct: 52  },
  { id: "TM-0043", client: "Northwind Health", pct: 100 },
];

const BILLING_PIPELINE = [
  { label: "Logged",   pct: 94 },
  { label: "Approved", pct: 88 },
  { label: "Invoiced", pct: 82 },
];

const CONSULTANTS = [
  { id: "A. Reyes", badge: "A", name: "Partner", status: "Active", pct: 88 },
  { id: "K. Ito",   badge: "K", name: "Manager", status: "Active", pct: 72 },
];

const BILLING_EVENTS = [
  { id: "TM-0041",  what: "Timer stopped · Hartwell & Locke",    flow: "WIP posted · $2,880",  t: "2m" },
  { id: "INV-4218", what: "Invoice approved · Vector Capital",    flow: "GL posted · $10,200",  t: "5m" },
];

const CAPABILITIES = [
  {
    icon: Clock,
    title: "Time & Expense Capture",
    desc: "One-tap timers across web and mobile with AI-suggested entries from calendar and email. Offline sync. Zero re-keying.",
  },
  {
    icon: Briefcase,
    title: "Engagement Management",
    desc: "Plan, staff and run every engagement end-to-end phases, milestones, deliverables and budget guardrails on one timeline.",
  },
  {
    icon: Users,
    title: "Resource Planning",
    desc: "Live allocation view across every consultant. Spot over-loaded partners and idle analysts before the week is done.",
  },
  {
    icon: Receipt,
    title: "Flexible Billing",
    desc: "T&M, fixed-fee, milestone, retainer, contingent every billing model, with auto-generated invoices and WIP statements.",
  },
  {
    icon: Handshake,
    title: "Client Portal & CRM",
    desc: "A branded workspace for proposals, deliverables, approvals and statements replacing ten back-and-forth emails.",
  },
  {
    icon: TrendingUp,
    title: "Profitability Analytics",
    desc: "Live cost-to-bill, realisation and margin per engagement, partner and practice actionable while work is in flight.",
  },
];

const TIMER_ENTRIES = [
  { code: "TM-0041", name: "Partner hours",   qty: "8.5 hr"  },
  { code: "TM-0042", name: "Associate hours", qty: "12.0 hr" },
  { code: "TM-0043", name: "Analyst hours",   qty: "6.0 hr"  },
];

const APPROVED_ENGAGEMENTS = [
  { ref: "INV-4218", desc: "Hartwell & Locke",    status: "Auto-posted" },
  { ref: "INV-4217", desc: "Vector Capital", status: "Auto-posted" },
];

const BILLING_TYPES = ["Time", "Expenses", "Disbursements"];

// ════════════════════════════════════════════════════════════════════════════
// HERO MOCK
// ════════════════════════════════════════════════════════════════════════════

function PracticeCommandPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live · 5</StatusChip>
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-bold tabular-nums text-bz-text">87.2%</span>
          <span className="text-[10px] font-semibold text-bz-leaf-deep">↑ +4.3%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-bz-line-soft sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Active Timers
          </p>
          <div className="flex flex-col gap-4">
            {ACTIVE_TIMERS.map((t) => (
              <div key={t.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-medium text-bz-text">{t.id}</span>
                  <span className="text-[10px] text-bz-text-muted">{t.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <StripeBar pct={t.pct} />
                  </div>
                  <span className="w-8 text-right text-[10.5px] font-semibold tabular-nums text-bz-text">
                    {t.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Billing Pipeline
          </p>
          <div className="flex flex-col gap-4">
            {BILLING_PIPELINE.map((c) => (
              <div key={c.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] text-bz-text-muted">{c.label}</span>
                  <span className="text-[10.5px] font-semibold tabular-nums text-bz-text">{c.pct}%</span>
                </div>
                <StripeBar pct={c.pct} />
              </div>
            ))}
            <div className="mt-0.5 flex items-center justify-between border-t border-bz-line-soft pt-3">
              <span className="text-[10.5px] text-bz-text-muted">Realisation Rate</span>
              <span className="text-[11px] font-bold tabular-nums text-bz-text">87.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Log. Bill. Ledger.
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Capture every minute.{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>
              Know every margin in real time.
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

        <HeroCanvas className="flex flex-col !p-0 [&>.bz-hero-cards]:flex-1 [&>.bz-hero-cards]:flex [&>.bz-hero-cards]:flex-col [&>.bz-hero-cards]:items-stretch">
          <div className="flex flex-1 flex-col p-[56px] max-[720px]:p-9 max-[480px]:p-4">
            <PracticeCommandPanel />
          </div>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] THE PLATFORM consultant allocation map + event feed + feature bentos
// ════════════════════════════════════════════════════════════════════════════

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The platform"
          title={<>Six modules. <Heading.Muted>One practice system.</Heading.Muted></>}
          titleMaxWidth={620}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" href="/contact">Request Demo</Pill>
            </PillGroup>
          }
        />

        <PracticeAllocationPanel />

        <BentoGrid cols={3} className="mt-[18px]">
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover minHeight={200}>
              <Bento.Header title={title} icon={<Icon size={22} strokeWidth={1.4} color="#1F3422" />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function PracticeAllocationPanel() {
  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
      {/* Consultant allocation dark olive panel */}
      <div className="relative flex flex-col overflow-hidden rounded-bz-2xl bg-bz-olive p-7">
        <DotGrid tone="dark" />
        <div className="relative flex flex-col flex-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/[0.55]">
              Practice team · all consultants
            </div>
            <StatusChip variant="live">Live</StatusChip>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CONSULTANTS.map((c) => (
              <div
                key={c.id}
                className="rounded-bz-xl border border-white/[0.06] bg-white/[0.04] p-3.5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-bz-pill bg-bz-leaf text-[10.5px] font-semibold text-[#1F3422]">
                      {c.badge}
                    </span>
                    <span className="text-[11.5px] font-medium text-bz-text-on-dark">
                      {c.id} · {c.name}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-white/[0.72]">{c.status}</span>
                </div>
                <StripeBar pct={c.pct} tone="dark" />
                <div className="mt-1.5 text-[10px] text-white/[0.55]">
                  Utilisation {c.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing event feed light panel */}
      <div className="rounded-bz-2xl border border-bz-line-soft bg-bz-paper p-6">
        <div className="mb-4 flex items-start justify-between gap-3 pb-24">
          <div>
            <div className="text-[11px] text-bz-text-muted">Billing event feed</div>
            <div className="bz-stat-num" style={{ fontSize: 20 }}>last 60 seconds</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-bz-pill bg-bz-leaf-deep" />
            <span className="text-[10.5px] font-medium text-bz-text">Streaming</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {BILLING_EVENTS.map((f) => (
            <div key={f.id} className="rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11.5px] font-medium text-bz-text">{f.id}</span>
                <span className="text-[10.5px] text-bz-text-muted">{f.t}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <span className="text-[11px] text-bz-text-muted">{f.what}</span>
                <span className="text-[10.5px] text-bz-text">{f.flow}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP VISUALS
// ════════════════════════════════════════════════════════════════════════════

function TimeEntryVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">Engagement · Hartwell & Locke · M&A</span>
        <span className="rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10px] font-semibold text-bz-text">
          T&M
        </span>
      </div>
      <div className="mb-2 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="text-[11.5px] font-medium text-bz-text">ENG-0182 · M&A Diligence</div>
      </div>
      <div className="mb-3 ml-3 flex flex-col gap-1.5 border-l border-bz-line-soft pl-3">
        {TIMER_ENTRIES.map((e) => (
          <div
            key={e.code}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <span className="text-[11px] font-medium text-bz-text">{e.code}</span>
            <span className="text-[10.5px] text-bz-text-muted">{e.name} · {e.qty}</span>
          </div>
        ))}
      </div>
      <DataRow label="Billable value" value="$6,360.00" emphasis />
    </div>
  );
}

function InvoiceDraftVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">INV-4218 · Vector Capital</span>
        <StatusChip variant="live">Live</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="mb-0.5 text-[11.5px] font-medium text-bz-text">Approved by K. Ito</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[10px] text-bz-text-muted">Before</span>
          <div className="flex-1"><StripeBar pct={68} /></div>
          <span className="w-7 text-right text-[10px] tabular-nums text-bz-text-muted">68%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[10px] font-semibold text-bz-text">After</span>
          <div className="flex-1"><StripeBar pct={100} /></div>
          <span className="w-7 text-right text-[10px] font-semibold tabular-nums text-bz-text">100%</span>
        </div>
      </div>
      <div className="mt-3">
      </div>
    </div>
  );
}

function MarginReportVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">Realisation rate · May 2026</span>
        <StatusChip variant="posted">Healthy</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-4 py-3 text-center">
        <div className="bz-stat-num" style={{ fontSize: 32 }}>94.2%</div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft">
        {[
          { label: "Logged",      val: "312h" },
          { label: "Billed",      val: "294h" },
          { label: "Written off", val: "18h"  },
        ].map((s) => (
          <div key={s.label} className="py-2 text-center">
            <div className="text-[13px] font-bold tabular-nums text-bz-text">{s.val}</div>
            <div className="text-[9.5px] text-bz-text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] HOW IT WORKS
// ════════════════════════════════════════════════════════════════════════════

function HowItWorksSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="How it works"
          title={<>From first minute to final payment <Heading.Muted>tracked at every step.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Capture"
            title="Log time as it happens no Friday recall needed."
            bullets={["One-tap timers, AI-suggested entries from email and calendar."]}
            visual={<TimeEntryVisual />}
          />
          <StepCard
            number="02"
            tag="Approve"
            title="One-click partner approval triggers the invoice draft automatically."
            bullets={["Approved hours auto-flow to a draft invoice and WIP statement."]}
            visual={<InvoiceDraftVisual />}
          />
          <StepCard
            number="03"
            tag="Analyse"
            title="Realisation and margin tracked per engagement while work is still in flight."
            bullets={["Live cost-to-bill, write-off rate and partner contribution visible."]}
            visual={<MarginReportVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] TIME TO BOOKS
// ════════════════════════════════════════════════════════════════════════════

function BillingJournalVisual() {
  return (
    <div className="w-full rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="text-[11.5px] text-bz-text-muted">Invoice approvals · today</div>
        <Receipt size={16} color="#1F3422" />
      </div>
      <div className="bz-stat-num" style={{ fontSize: 28 }}>$989</div>
      <div className="mb-4 text-[11px] text-bz-text-muted"></div>

      <div className="flex flex-col gap-1.5">
        {APPROVED_ENGAGEMENTS.map((r) => (
          <div
            key={r.ref}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
              <Tick size="sm" className="shrink-0" />
              <span className="shrink-0 text-[11px] font-medium text-bz-text">{r.ref}</span>
              <span className="truncate text-[10.5px] text-bz-text-muted">{r.desc}</span>
            </div>
            <span className="shrink-0 text-[10.5px] font-medium text-bz-text">{r.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {/* {BILLING_TYPES.map((m) => (
          <span
            key={m}
            className="rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1 text-[10.5px] font-medium text-bz-text"
          >
            {m}
          </span>
        ))} */}
      </div>
    </div>
  );
}

function TimeToBooksSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Time to books"
          title={<>Every approval, <Heading.Muted>posted to the books automatically.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <BigCard
          text={{
            title: "Every approved hour posted to the books.",
            bullets: [
              "Realisation rate tracked.",
              "Time, expense and disbursements split.",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Talk to Sales" },
          }}
          visual={<BillingJournalVisual />}
        />
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] PRACTICE, ON ONE LEDGER
// ════════════════════════════════════════════════════════════════════════════

function OneLedgerSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="04"
          label="One ledger"
          tone="dark"
          title={<>Every engagement event, <Heading.Muted>auto-posted to the same ledger that closes the books.</Heading.Muted></>}
          titleMaxWidth={780}
        />

        <BentoGrid cols={3}>
          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Time approved →<br />WIP charged</>}
              icon={<Clock size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Approved time entries debit WIP at billing rate.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="TM-0041 · approve" debit="WIP Time" credit="Revenue Accrued" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Invoice sent →<br />Revenue recognised</>}
              icon={<Receipt size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Raising an invoice credits WIP and debits Accounts Receivable.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="INV-4218 · raise" debit="Accounts Receivable" credit="WIP Time" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Engagement close →<br />Margin posted</>}
              icon={<TrendingUp size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Write-offs and margin differences post to the variance account.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="ENG-0182 · close" debit="Write-off expense" credit="WIP Time" />
            </Bento.Footer>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function ProfessionalServicePage() {
  return (
    <main>
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <TimeToBooksSection />
      <OneLedgerSection />
    </main>
  );
}
