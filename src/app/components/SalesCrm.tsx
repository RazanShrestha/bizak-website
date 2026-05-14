import "../../styles/style.css";
import {
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  FileSignature,
  FileText,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  Receipt,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  Container,
  DotGrid,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StripeBar,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// [HERO] — Pipeline snapshot: stage track + key metrics + top deals
// ════════════════════════════════════════════════════════════════════════════

const PIPELINE_STAGES = [
  { stage: "Lead" },
  { stage: "Qualified" },
  { stage: "Proposal", focus: true },
  { stage: "Negotiation" },
  { stage: "Closed · Q3" },
];

const HERO_DEALS = [
  { who: "Lumen Foods",      stage: "Proposal",  value: "$220K", dot: "fire"    },
  { who: "Atlas Cargo",      stage: "Won · Q3",  value: "$95K",  dot: "leaf"    },
  { who: "Northwind Retail", stage: "Qualified", value: "$180K", dot: "neutral" },
] as const;

function PipelineHeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Sales &amp; CRM</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Every lead, every deal, every follow-up —{" "}
            <Heading.Muted>one connected pipeline on one ledger.</Heading.Muted>
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

        <PipelineSnapshotCard />
      </Container>
    </Section>
  );
}

function PipelineSnapshotCard() {
  const focusIdx = PIPELINE_STAGES.findIndex((s) => s.focus);
  return (
    <div id="pipeline" className="bz-hero-visual">
      <div className="overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-paper">

        {/* KPI header */}
        <div className="flex items-center justify-between border-b border-bz-line-soft px-6 py-4">
          <StatusChip variant="live">Live · Q3</StatusChip>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
                Open weighted
              </p>
              <p className="text-[17px] font-medium tabular-nums leading-tight text-bz-text">
                $3.46M
              </p>
            </div>
            <div className="h-6 w-px bg-bz-line-soft" />
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
                Win rate
              </p>
              <p className="text-[17px] font-medium tabular-nums leading-tight text-bz-text">
                38%
              </p>
            </div>
          </div>
        </div>

        {/* Stage track */}
        <div className="border-b border-bz-line-soft px-6 py-4">
          <div className="flex gap-1.5">
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s.stage} className="flex flex-1 flex-col gap-1.5">
                <div
                  className={[
                    "h-[3px] rounded-bz-pill",
                    i < focusIdx
                      ? "bg-bz-leaf-deep"
                      : i === focusIdx
                      ? "bg-bz-fire"
                      : "bg-bz-line-soft",
                  ].join(" ")}
                />
                <p className="truncate text-[9.5px] font-medium uppercase tracking-[0.06em] text-bz-text-soft">
                  {s.stage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Deal rows */}
        <div className="divide-y divide-bz-line-soft">
          {HERO_DEALS.map((d) => (
            <div key={d.who} className="flex items-center gap-3 px-6 py-3">
              <span
                className={[
                  "size-2 shrink-0 rounded-full",
                  d.dot === "fire"
                    ? "bg-bz-fire"
                    : d.dot === "leaf"
                    ? "bg-bz-leaf-deep"
                    : "bg-bz-line",
                ].join(" ")}
              />
              <p className="flex-1 text-[13px] font-medium text-bz-text">{d.who}</p>
              <p className="text-[11px] text-bz-text-muted">{d.stage}</p>
              <p className="text-[13px] font-medium tabular-nums text-bz-text">{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] DEAL COMMAND CENTER — single record, Customer 360
// ════════════════════════════════════════════════════════════════════════════

const DEAL_STAGES = [
  { label: "Lead", done: true },
  { label: "Qualified", done: true },
  { label: "Discovery", done: true },
  { label: "Proposal", done: true, current: true },
  { label: "Won", done: false },
];

const LINKED_DOCS = [
  { icon: FileText, ref: "QT-8821", label: "Quote · sent" },
  { icon: Receipt, ref: "SO-1041", label: "Sales order" },
  { icon: Paperclip, ref: "MSA-2024", label: "Contract" },
];

const ACTIVITY = [
  { icon: Mail, who: "Mariana", action: "emailed proposal v3 to Axeon", time: "3h ago" },
  { icon: Phone, who: "Priya", action: "logged a 22-min discovery call", time: "Yesterday" },
  { icon: FileSignature, who: "System", action: "quote QT-8821 approved · routed to AR", time: "2 days ago" },
  { icon: MessageCircle, who: "Axeon procurement", action: "replied: legal review by Fri", time: "3 days ago" },
];

function DealCommandSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="02"
          label="Deal command center"
          tone="dark"
          title={
            <>
              Click a deal —{" "}
              <Heading.Muted>see every email, quote and invoice attached to it.</Heading.Muted>
            </>
          }
          description="Customer 360, on the same screen. No tab switching, no spreadsheet exports, no 'let me find that email'."
          titleMaxWidth={780}
        />

        <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive-soft p-5 md:p-7">
          <DotGrid tone="dark" />
          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                      Deal #DL-2046
                    </span>
                    <StatusChip variant="live">Proposal</StatusChip>
                  </div>
                  <h3 className="text-[20px] font-medium text-bz-text-on-dark">
                    Axeon Logistics · Q3 Renewal
                  </h3>
                  <p className="mt-1 text-[12.5px] text-white/[0.62]">
                    Owner Mariana Rey · Created 14 Sep · Last touch 3h ago
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                    Weighted value
                  </div>
                  <div className="text-[22px] font-medium tabular-nums text-bz-fire">$112,400</div>
                  <div className="text-[10.5px] text-white/[0.55]">92% win probability</div>
                </div>
              </div>

              <div className="mb-5 rounded-bz-lg border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                  <span>Stage progress</span>
                  <span>4 of 5 complete</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {DEAL_STAGES.map((s) => (
                    <div key={s.label}>
                      <div
                        className={
                          s.done
                            ? "h-1 w-full rounded-bz-pill bg-bz-fire"
                            : "h-1 w-full rounded-bz-pill bg-white/[0.1]"
                        }
                      />
                      <p
                        className={
                          s.done
                            ? "mt-2 text-[10px] uppercase tracking-[0.06em] text-bz-text-on-dark"
                            : "mt-2 text-[10px] uppercase tracking-[0.06em] text-white/[0.4]"
                        }
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                    Linked documents
                  </span>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-fire hover:text-bz-fire/80"
                  >
                    View all 12
                    <ArrowUpRight size={11} strokeWidth={2} />
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {LINKED_DOCS.map(({ icon: Icon, ref, label }) => (
                    <div
                      key={ref}
                      className="flex items-center gap-2.5 rounded-bz-md border border-white/[0.08] bg-white/[0.04] px-3 py-2.5"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-white/[0.06] text-white/[0.85]">
                        <Icon size={13} strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-bz-text-on-dark">
                          {ref}
                        </p>
                        <p className="truncate text-[10px] uppercase tracking-[0.08em] text-white/[0.5]">
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-bz-lg border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                  Activity · last 7 days
                </span>
                <StatusChip variant="live">8 new</StatusChip>
              </div>
              <div className="flex flex-col gap-3">
                {ACTIVITY.map((a) => (
                  <div key={a.time + a.who} className="flex gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-bz-pill bg-white/[0.06] text-white/[0.85]">
                      <a.icon size={11} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-bz-text-on-dark">
                        <span className="font-medium">{a.who}</span> {a.action}
                      </p>
                      <p className="text-[10.5px] uppercase tracking-[0.06em] text-white/[0.45]">
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] FORECAST & IMPACT — close
// ════════════════════════════════════════════════════════════════════════════

const FORECAST_ROWS: Array<{
  label: string;
  pct: number;
  val: string;
  note: string;
  strong?: boolean;
}> = [
  { label: "Best case", pct: 100, val: "$4.82M", note: "All open deals" },
  { label: "Forecast", pct: 72, val: "$3.46M", note: "Probability-weighted", strong: true },
  { label: "Committed", pct: 48, val: "$2.31M", note: "Stage ≥ Proposal" },
  { label: "Closed-won YTD", pct: 32, val: "$1.54M", note: "Posted to revenue" },
];

const IMPACT = [
  { value: "30%", label: "Faster closure", desc: "Auto-routed follow-ups halve the sales-cycle." },
  { value: "100%", label: "Audit coverage", desc: "Every quote, order and invoice posts straight to the ledger." },
  { value: "0", label: "Manual entries", desc: "Quote → order → invoice → journal — no keystrokes." },
];

function ForecastImpactSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="04"
          label="Forecast & impact"
          title={
            <>
              See the forecast,{" "}
              <Heading.Muted>and the impact behind the numbers.</Heading.Muted>
            </>
          }
          titleMaxWidth={780}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Bento tone="paper">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
                  Q3 forecast · all entities
                </p>
                <h3 className="mt-1 text-[16px] font-medium text-bz-text">
                  Probability-weighted pipeline
                </h3>
              </div>
              <StatusChip variant="live">Updated 2 min ago</StatusChip>
            </div>

            <div className="flex flex-col gap-2.5">
              {FORECAST_ROWS.map((r) => (
                <div
                  key={r.label}
                  className={[
                    "rounded-bz-md border px-3.5 py-3",
                    r.strong
                      ? "border-bz-leaf-deep bg-bz-leaf"
                      : "border-bz-line-soft bg-bz-paper-warm",
                  ].join(" ")}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-medium text-bz-text">{r.label}</span>
                    <span className="text-[14px] font-medium tabular-nums text-bz-text">
                      {r.val}
                    </span>
                  </div>
                  <StripeBar pct={r.pct} />
                  <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.06em] text-bz-text-soft">
                    {r.note}
                  </p>
                </div>
              ))}
            </div>
          </Bento>

          <div className="flex flex-col gap-3">
            {IMPACT.map((m) => (
              <Bento key={m.label} tone="paper" hover>
                <div className="flex items-start gap-4">
                  <div className="text-[40px] font-medium leading-none tabular-nums text-bz-text">
                    {m.value}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
                      {m.label}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-bz-text-muted">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </Bento>
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

export function SalesAndCrmPage() {
  return (
    <main>
      <PipelineHeroSection />
      <DealCommandSection />
      <ForecastImpactSection />
    </main>
  );
}
