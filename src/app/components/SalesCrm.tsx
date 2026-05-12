import "../../styles/style.css";
import {
  ArrowRight,
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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  Container,
  DotGrid,
  Heading,
  Pill,
  Section,
  SectionHead,
  StatusChip,
  StripeBar,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// [HERO] — Pipeline command panel: KPI strip + funnel + live activity rail
// ════════════════════════════════════════════════════════════════════════════

const PIPELINE_STAGES: Array<{
  stage: string;
  count: number;
  value: string;
  share: number;
  focus?: boolean;
}> = [
  { stage: "Lead", count: 28, value: "$1.24M", share: 36 },
  { stage: "Qualified", count: 14, value: "$890K", share: 26 },
  { stage: "Proposal", count: 9, value: "$620K", share: 18, focus: true },
  { stage: "Negotiation", count: 4, value: "$320K", share: 9 },
  { stage: "Closed · Q3", count: 6, value: "$420K", share: 11 },
];

const PIPELINE_EVENTS: Array<{
  icon: typeof Mail;
  accent: "fire" | "leaf" | "neutral";
  who: string;
  what: string;
  tag: string;
  time: string;
}> = [
  {
    icon: Mail,
    accent: "fire",
    who: "Lumen Foods",
    what: "Proposal sent 3 days ago · no reply from buyer",
    tag: "Follow-up due",
    time: "Now",
  },
  {
    icon: CheckCircle2,
    accent: "leaf",
    who: "Atlas Cargo",
    what: "Quote QT-8819 accepted · auto-posted to AR ledger",
    tag: "Won · posted",
    time: "12m",
  },
  {
    icon: TrendingUp,
    accent: "neutral",
    who: "Northwind Retail",
    what: "Advanced Qualified → Proposal · weighted +$54K",
    tag: "Stage change",
    time: "1h",
  },
];

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

          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill variant="dark" withTick href="/contact">
              Request Demo
            </Pill>
            <Pill variant="light" iconLeft={<Sparkles size={13} />} href="#pipeline">
              See it in action
            </Pill>
          </div>
        </div>

        <PipelineCommandMock />
      </Container>
    </Section>
  );
}

function PipelineCommandMock() {
  return (
    <div id="pipeline" className="mt-12 md:mt-16">
      <div className="overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-paper">
        <PipelineHeaderBar />
        <PipelineFunnelStrip />
        <PipelineActivityRail />
      </div>
    </div>
  );
}

function PipelineHeaderBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip variant="live">Live pipeline · Q3</StatusChip>
        <span className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
          Synced just now
        </span>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
            Open weighted
          </p>
          <p className="text-[19px] font-medium tabular-nums leading-tight text-bz-text">
            $3.46M
          </p>
        </div>
        <div className="hidden h-8 w-px bg-bz-line-soft sm:block" />
        <div className="hidden sm:block">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
            Win rate
          </p>
          <p className="inline-flex items-baseline gap-1.5 text-[19px] font-medium leading-tight tabular-nums text-bz-text">
            38%
            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-emerald-700">
              <TrendingUp size={10} strokeWidth={2.2} />
              +4
            </span>
          </p>
        </div>
        <div className="hidden h-8 w-px bg-bz-line-soft md:block" />
        <div className="hidden md:block">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
            Advanced · 7d
          </p>
          <p className="text-[19px] font-medium tabular-nums leading-tight text-bz-text">
            32
          </p>
        </div>
      </div>
    </div>
  );
}

function PipelineFunnelStrip() {
  const max = Math.max(...PIPELINE_STAGES.map((s) => s.share));
  return (
    <div className="border-y border-bz-line-soft bg-bz-paper-warm px-4 py-5 md:px-6 md:py-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
          Pipeline by stage
        </p>
        <p className="text-[10.5px] tabular-nums text-bz-text-soft">
          5 stages · 61 open deals
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3">
        {PIPELINE_STAGES.map((s) => (
          <div
            key={s.stage}
            className={[
              "rounded-bz-md border bg-bz-paper px-3 py-3",
              s.focus ? "border-bz-leaf-deep" : "border-bz-line-soft",
            ].join(" ")}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-[10.5px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
                {s.stage}
              </p>
              {s.focus && (
                <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-fire px-1.5 py-0.5 text-[8.5px] font-medium uppercase tracking-[0.06em] text-bz-text">
                  Focus
                </span>
              )}
            </div>
            <p className="text-[26px] font-medium leading-none tabular-nums text-bz-text">
              {s.count}
            </p>
            <p className="mt-1 text-[11.5px] font-medium tabular-nums text-bz-text-muted">
              {s.value}
            </p>
            <div className="mt-2.5 h-1 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
              <div
                className={[
                  "h-full rounded-bz-pill",
                  s.focus ? "bg-bz-fire" : "bg-bz-leaf-deep",
                ].join(" ")}
                style={{ width: `${(s.share / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineActivityRail() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
          Live activity · last hour
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-bz-text hover:text-bz-text-muted"
        >
          Open queue
          <ArrowUpRight size={11} strokeWidth={2} />
        </a>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
        {PIPELINE_EVENTS.map((e) => (
          <div
            key={e.who}
            className="flex items-start gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 py-2.5"
          >
            <span
              className={[
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-md text-bz-text",
                e.accent === "fire"
                  ? "bg-bz-fire"
                  : e.accent === "leaf"
                  ? "bg-bz-leaf"
                  : "border border-bz-line-soft bg-bz-paper",
              ].join(" ")}
            >
              <e.icon size={13} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[12px] font-medium text-bz-text">{e.who}</p>
                <p className="shrink-0 text-[10px] tabular-nums text-bz-text-soft">
                  {e.time}
                </p>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-bz-text-muted">
                {e.what}
              </p>
              <p className="mt-1.5 text-[9.5px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
                {e.tag}
              </p>
            </div>
          </div>
        ))}
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
// [03] QUOTE TO CASH — document timeline + live ledger feed
// ════════════════════════════════════════════════════════════════════════════

type LedgerPost = { dr: string; cr: string; amt: string };

const CHAIN_STEPS: Array<{
  icon: typeof FileText;
  ref: string;
  label: string;
  amount: string;
  status: string;
  time: string;
  action: string;
  posts: LedgerPost[];
}> = [
  {
    icon: FileText,
    ref: "QT-2024-8821",
    label: "Quote",
    amount: "$112,400",
    status: "Sent · awaiting acceptance",
    time: "28 Sep · 09:14",
    action: "Accepted → one-click conversion to Sales Order",
    posts: [],
  },
  {
    icon: Receipt,
    ref: "SO-1041",
    label: "Sales Order",
    amount: "$112,400",
    status: "Approved · stock reserved at WH-A",
    time: "28 Sep · 11:02",
    action: "Inventory committed · ready to fulfil",
    posts: [],
  },
  {
    icon: FileSignature,
    ref: "INV-2046",
    label: "Invoice",
    amount: "$112,400",
    status: "Posted to accounts receivable",
    time: "28 Sep · 14:32",
    action: "Revenue recognised · VAT separated · AR debited",
    posts: [
      { dr: "AR · Axeon Logistics", cr: "Revenue", amt: "$104,200" },
      { dr: "AR · Axeon Logistics", cr: "VAT 19%", amt: "$8,200" },
    ],
  },
  {
    icon: DollarSign,
    ref: "PMT-441",
    label: "Payment",
    amount: "$112,400",
    status: "Cleared · USD operating",
    time: "02 Oct · 09:48",
    action: "Cash debited · AR cleared · books balanced",
    posts: [{ dr: "Cash · USD Operating", cr: "AR · Axeon", amt: "$112,400" }],
  },
];

function QuoteToCashSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Quote to cash"
          title={
            <>
              The document moves,{" "}
              <Heading.Muted>the ledger writes itself.</Heading.Muted>
            </>
          }
          description="One contract, one chain. Quote becomes order, order becomes invoice, invoice becomes cash — and the journal posts itself at every link. No re-keying, no reconciliation, no missing entry to chase at month-end."
          titleMaxWidth={820}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_1fr] lg:gap-5">
          <DocumentChain />
          <LedgerFeed />
        </div>
      </Container>
    </Section>
  );
}

function DocumentChain() {
  return (
    <div className="rounded-bz-lg border border-bz-line-soft bg-bz-paper p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12.5px] font-medium text-bz-text">Document chain</p>
          <p className="text-[10.5px] uppercase tracking-[0.08em] text-bz-text-soft">
            Axeon Logistics · DL-2046
          </p>
        </div>
        <StatusChip variant="live">4 of 4 linked</StatusChip>
      </div>

      <ol className="flex flex-col gap-3">
        {CHAIN_STEPS.map((s, i) => (
          <li key={s.ref} className="relative">
            {i < CHAIN_STEPS.length - 1 && (
              <span
                className="absolute left-[18px] top-10 h-[calc(100%-22px)] w-px bg-bz-line"
                aria-hidden
              />
            )}
            <div className="flex gap-3">
              <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-fire text-bz-text">
                <s.icon size={14} strokeWidth={1.8} />
              </span>
              <div className="flex-1 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3.5 py-3">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[12px] font-medium text-bz-text">
                    <span className="text-bz-text-soft">Step 0{i + 1}</span> · {s.label}
                  </p>
                  <p className="text-[10.5px] tabular-nums text-bz-text-soft">{s.time}</p>
                </div>
                <p className="text-[13.5px] font-medium tabular-nums text-bz-text">
                  {s.ref} · {s.amount}
                </p>
                <p className="mt-0.5 text-[11.5px] text-bz-text-muted">{s.status}</p>
                <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-bz-text">
                  <ArrowRight
                    size={11}
                    strokeWidth={2}
                    className="mt-[3px] shrink-0 text-bz-leaf-deep"
                  />
                  {s.action}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LedgerFeed() {
  const totalPosts = CHAIN_STEPS.reduce((acc, s) => acc + s.posts.length, 0);

  return (
    <div className="flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-paper p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12.5px] font-medium text-bz-text">Live ledger</p>
          <p className="text-[10.5px] uppercase tracking-[0.08em] text-bz-text-soft">
            General journal · auto-posted
          </p>
        </div>
        <StatusChip variant="posted">{totalPosts} entries</StatusChip>
      </div>

      <div className="flex flex-1 flex-col gap-3.5">
        {CHAIN_STEPS.map((s) => (
          <div key={s.ref}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
                From {s.ref}
              </span>
              <span className="h-px flex-1 bg-bz-line-soft" />
            </div>
            {s.posts.length === 0 ? (
              <div className="rounded-bz-md border border-dashed border-bz-line-soft px-3 py-2">
                <p className="text-[11.5px] italic text-bz-text-soft">
                  Workflow event · no posting required
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-paper-warm">
                {s.posts.map((p, j) => (
                  <div
                    key={p.dr + p.cr}
                    className={[
                      "grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-3 py-2.5",
                      j !== s.posts.length - 1 && "border-b border-bz-line-soft",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.08em] text-bz-text-soft">DR</p>
                      <p className="truncate text-[11.5px] font-medium text-bz-text">{p.dr}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.08em] text-bz-text-soft">CR</p>
                      <p className="truncate text-[11.5px] text-bz-text">{p.cr}</p>
                    </div>
                    <p className="text-right text-[12px] font-medium tabular-nums text-bz-text">
                      {p.amt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-bz-md bg-bz-leaf px-3.5 py-2.5">
        <p className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text">
          <CheckCircle2 size={13} strokeWidth={2.2} />
          Books balanced · DR = CR
        </p>
        <p className="text-[12px] font-medium tabular-nums text-bz-text">$112,400</p>
      </div>
    </div>
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
      <QuoteToCashSection />
      <ForecastImpactSection />
    </main>
  );
}
