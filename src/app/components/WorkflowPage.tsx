import React from "react";
import {
  Section,
  Container,
  SectionHead,
  BigCard,
  StepCard,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  StatusChip,
  DotGrid,
} from "./bz";
import { Settings, Check, ChevronRight } from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const APPROVAL_MATRIX = [
  { type: "Purchase Orders", submitted: 3, reviewing: 2, approved: 18 },
  { type: "Expense Claims",  submitted: 5, reviewing: 1, approved: 41 },
  { type: "Vendor Invoices", submitted: 2, reviewing: 3, approved: 27 },
  { type: "Work Orders",     submitted: 1, reviewing: 1, approved: 9  },
];

const PIPELINE_STAGES = [
  { label: "Submitted",   state: "done"    as const },
  { label: "Dept. Head",  state: "done"    as const },
  { label: "Finance Mgr", state: "active"  as const },
  { label: "CFO Sign-off",state: "pending" as const },
];

const ROUTING_RULES_HERO = [
  { condition: "PO > $5,000",    assignee: "Finance Manager" },
  { condition: "Expense > $500", assignee: "Department Head" },
  { condition: "Any Invoice",    assignee: "AP Team"         },
];

const LIVE_EVENTS = [
  { module: "Procurement", ref: "PO-9402",  event: "Routed to Finance Manager",  stat: "$14,200", live: true  },
  { module: "Expenses",    ref: "EXP-882",  event: "Escalated to CFO",           stat: "$450",    live: true  },
  { module: "Purchases",   ref: "PO-9188",  event: "Approved by Dept. Head",     stat: "$2,800",  live: false },
  { module: "Invoices",    ref: "INV-2210", event: "Forwarded to AP Team",       stat: "$7,500",  live: false },
  { module: "Work Orders", ref: "WO-441",   event: "Signed off by Operations",   stat: "—",       live: false },
  { module: "Payroll",     ref: "PR-119",   event: "Final approval triggered",   stat: "$84,000", live: false },
];

const FUNCTION_PROFILES = [
  { name: "Finance",      tagline: "Spend control",         kpis: ["PO approvals", "Invoice sign-off", "Budget compliance"], active: true  },
  { name: "Operations",   tagline: "Work order sign-off",   kpis: ["Work orders", "Maintenance flows", "Supplier approval"], active: false },
  { name: "Management",   tagline: "Multi-level oversight", kpis: ["Escalation queue", "Cross-dept flow", "SLA reporting"],  active: false },
  { name: "HR & Payroll", tagline: "HR disbursements",      kpis: ["Timesheet review", "Payroll approval", "Reimbursements"],active: false },
];

const ROUTE_STEPS = [
  { ref: "PO-9402", label: "Received",             state: "done"   as const },
  { ref: "Rule",    label: "Matched: PO > $5,000", state: "done"   as const },
  { ref: "Step 2",  label: "Routed → Finance Mgr", state: "active" as const },
];

const AUDIT_EVENTS = [
  { ref: "PO-9402",  action: "approved",  user: "Arjun Mehta", dept: "Finance",     time: "10:47 AM",  type: "approve"  as const },
  { ref: "EXP-882",  action: "escalated", user: "System",      dept: "Auto",        time: "9:23 AM",   type: "escalate" as const },
  { ref: "INV-2210", action: "forwarded", user: "Priya Nair",  dept: "Procurement", time: "Yesterday", type: "forward"  as const },
];

const IMPACT_STATS = [
  {
    value: "80%",
    label: "Faster approvals",
    desc: "Rule-based routing eliminates manual assignment every request reaches the right approver instantly.",
  },
  {
    value: "100%",
    label: "Decision audit trail",
    desc: "Every approval, rejection, and escalation is logged with user, timestamp, and full chain of custody.",
  },
  {
    value: "Zero",
    label: "Lost approvals",
    desc: "Automatic escalation means stalled requests surface before they become compliance issues.",
  },
];

// ─── HERO MOCK ─────────────────────────────────────────────────────────────────

// Top: full-width dark approval matrix command panel
function HeroApprovalMatrix() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive px-5 py-5">
      <DotGrid tone="dark" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
              Workflow Engine · Active
            </span>
          </div>
          <StatusChip variant="live">Live</StatusChip>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-4 gap-2 mb-2 px-3">
          <div className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/30">Type</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/30 text-center">Submitted</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/30 text-center">In Review</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/30 text-center">Approved</div>
        </div>

        {/* Matrix rows */}
        <div className="flex flex-col gap-2">
          {APPROVAL_MATRIX.map((row, i) => (
            <div
              key={row.type}
              className={`grid grid-cols-4 gap-2 rounded-bz-lg px-3 py-3 ${
                i === 0
                  ? "bg-white/[0.08] border border-bz-fire/20"
                  : "bg-white/[0.04]"
              }`}
            >
              <span className="text-[11px] font-medium text-white/70 truncate">{row.type}</span>
              <span className={`text-[13px] md:text-[15px] font-bold tabular-nums text-center ${
                row.submitted > 0 ? "text-bz-fire" : "text-white/30"
              }`}>
                {row.submitted}
              </span>
              <span className="text-[13px] md:text-[15px] font-bold tabular-nums text-center text-white/60">
                {row.reviewing}
              </span>
              <span className="text-[13px] md:text-[15px] font-bold tabular-nums text-center text-white/40">
                {row.approved}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Bottom-left: active approval pipeline progress tracker
function HeroPipelineProgress() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-surface overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">PO-9402 · In Progress</span>
        <span className="text-[9px] font-semibold text-bz-text-muted bg-bz-paper-warm px-2 py-0.5 rounded-bz-pill">
          Step 3 of 4
        </span>
      </div>

      <div className="flex flex-col flex-1 px-5 pt-5 pb-4 gap-3">
        {PIPELINE_STAGES.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              s.state === "done"    ? "bg-bz-olive" :
              s.state === "active" ? "bg-bz-fire"  :
              "bg-bz-paper-warm border border-bz-line"
            }`}>
              {s.state === "done"    && <Check size={10} className="text-white" strokeWidth={3} />}
              {s.state === "active"  && <div className="w-2 h-2 rounded-full bg-bz-text" />}
              {s.state === "pending" && <div className="w-1.5 h-1.5 rounded-full bg-bz-line" />}
            </div>
            <span className={`text-[12px] flex-1 ${
              s.state === "done"    ? "text-bz-text-muted line-through" :
              s.state === "active"  ? "font-bold text-bz-text"          :
              "text-bz-text-soft"
            }`}>
              {s.label}
            </span>
            {s.state === "active" && (
              <span className="text-[9px] font-bold text-bz-leaf-deep uppercase tracking-[0.1em] shrink-0">
                Pending
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-3.5 border-t border-bz-line-soft bg-bz-paper-warm/40 shrink-0">
        <p className="text-[10.5px] text-bz-text-muted leading-snug">
          <span className="font-semibold text-bz-text">Escalates</span>
          {" "}· in 6h if no action
        </p>
      </div>
    </div>
  );
}

// Bottom-right: routing rules summary panel
function HeroRoutingRules() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-paper overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">Routing rules</span>
        <span className="text-[9px] font-semibold text-bz-text-muted bg-bz-paper-warm px-2 py-0.5 rounded-bz-pill">
          3 active
        </span>
      </div>

      <div className="flex flex-col divide-y divide-bz-line-soft flex-1">
        {ROUTING_RULES_HERO.map((r) => (
          <div key={r.condition} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
              <p className="text-[12px] font-medium text-bz-text truncate">{r.condition}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <ChevronRight size={10} className="text-bz-text-soft" />
              <span className="text-[10px] font-bold text-bz-text-muted">{r.assignee}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3.5 border-t border-bz-line-soft bg-bz-paper-warm/40 shrink-0">
        <p className="text-[10.5px] text-bz-text-muted leading-snug">
          <span className="font-semibold text-bz-text">No code</span>
          {" "}· configure in settings
        </p>
      </div>
    </div>
  );
}

// ─── STEP CARD VISUAL ─────────────────────────────────────────────────────────

function RouteStepVisual() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {ROUTE_STEPS.map((s, i) => (
        <div
          key={s.ref}
          className={`rounded-bz-lg border px-4 py-3 ${
            i === 0
              ? "border-bz-fire/40 bg-bz-fire/[0.06]"
              : "border-bz-line-soft bg-bz-surface"
          }`}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-bz-text-muted mb-1">
            {s.ref}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className={`text-[12.5px] font-semibold leading-snug ${
              i === 0 ? "text-bz-text" : "text-bz-text-muted"
            }`}>
              {s.label}
            </p>
            {s.state === "active" && (
              <span className="text-[9px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded shrink-0">
                Live
              </span>
            )}
            {s.state === "done" && (
              <Check size={12} className="text-bz-olive shrink-0" strokeWidth={3} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AUDIT LOG VISUAL (BigCard) ────────────────────────────────────────────────

function AuditLogVisual() {
  return (
    <div className="w-full flex flex-col gap-5">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/40 mb-3">
          Decision log · today
        </p>
        <div className="flex flex-col gap-2">
          {AUDIT_EVENTS.map((e) => (
            <div
              key={e.ref}
              className="flex items-start gap-3 rounded-bz-md bg-white/[0.05] px-3 py-2.5"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                e.type === "approve" ? "bg-bz-fire" : "bg-white/10"
              }`}>
                {e.type === "approve"  && <Check size={10} className="text-bz-text" strokeWidth={3} />}
                {e.type === "escalate" && <span className="text-[9px] font-bold text-bz-fire">↑</span>}
                {e.type === "forward"  && <ChevronRight size={10} className="text-white/50" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-bold text-white">
                    {e.ref}{" "}
                    <span className="font-medium text-white/50">{e.action}</span>
                  </span>
                  <span className="text-[10px] text-white/30 flex-shrink-0">{e.time}</span>
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">{e.user} · {e.dept}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-end">
        <span className="text-[11px] font-bold text-white/40">3 decisions · 100% logged</span>
      </div>
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Workflow Automation</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Stop chasing approvals. Routes, escalates,{" "}
            <Heading.Muted>and closes automatically.</Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill
              variant="dark"
              withArrowUpRight
              href="https://system.bizakerp.com/account/self-register"
            >
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        {/* Mosaic: full-width approval matrix + pipeline tracker + routing rules */}
        <div className="bz-hero-visual mx-auto w-full max-w-[1140px] flex flex-col gap-3">
          <HeroApprovalMatrix />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <HeroPipelineProgress />
            </div>
            <div className="hidden md:block md:col-span-1">
              <HeroRoutingRules />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Live workflow event stream every module's approval activity, real-time
function LiveActivitySection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Live activity"
          title={
            <>
              Every request.{" "}
              <Heading.Muted>Every decision, live.</Heading.Muted>
            </>
          }
          description="Every approval submission, routing decision, and escalation across every module posts to your workflow stream the moment it happens."
        />

        <div className="rounded-bz-xl overflow-hidden border border-bz-line-soft">
          {/* Stream header */}
          <div className="flex items-center justify-between px-5 py-3 bg-bz-paper border-b border-bz-line-soft">
            <div className="flex items-center gap-2.5">
              <StatusChip variant="live">Live</StatusChip>
              <span className="text-[10px] font-medium text-bz-text-muted">
                6 modules routing
              </span>
            </div>
            <span className="text-[10px] text-bz-text-muted hidden sm:inline">
              142 decisions today
            </span>
          </div>

          {/* Stream rows */}
          <div className="flex flex-col divide-y divide-bz-line-soft">
            {LIVE_EVENTS.map((entry) => (
              <div
                key={entry.ref}
                className={`flex items-center gap-4 px-5 py-4 ${
                  entry.live ? "bg-bz-fire/[0.03]" : ""
                }`}
              >
                {/* Module tag */}
                <span
                  className={`text-[10.5px] font-semibold shrink-0 w-28 hidden sm:block uppercase tracking-[0.07em] ${
                    entry.live ? "text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  {entry.module}
                </span>

                {/* Ref */}
                <span className="text-[11px] text-bz-text-soft w-20 shrink-0 hidden md:block tabular-nums">
                  {entry.ref}
                </span>

                {/* Event description */}
                <p
                  className={`flex-1 text-[13px] min-w-0 truncate ${
                    entry.live ? "font-medium text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  <span className="sm:hidden font-semibold text-bz-text">
                    {entry.module} ·{" "}
                  </span>
                  {entry.event}
                </p>

                {/* Stat */}
                <span
                  className={`text-[12.5px] font-bold tabular-nums shrink-0 ${
                    entry.live ? "text-bz-text" : "text-bz-text-soft"
                  }`}
                >
                  {entry.stat}
                </span>

                {/* Live indicator */}
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.live ? "bg-bz-fire" : "bg-bz-line"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Function-based approval control flat 4-col panel inside a dark section
function TeamControlSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          tone="dark"
          index="02"
          label="Function-based control"
          title={
            <>
              Every team.{" "}
              <Heading.Muted>Their approval view, by default.</Heading.Muted>
            </>
          }
          description="Finance, Operations, Management, and HR each get a pre-configured approval queue scoped to the workflows they own."
        />

        {/* Function panel: gap-px grid creates thin dividers without per-item border logic */}
        <div className="rounded-bz-2xl overflow-hidden bg-bz-olive-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08]">
            {FUNCTION_PROFILES.map((r) => (
              <div
                key={r.name}
                className={`flex flex-col gap-5 p-7 lg:p-8 ${
                  r.active ? "bg-bz-olive-dark" : "bg-bz-olive-soft"
                }`}
              >
                <div>
                  <p
                    className={`text-[22px] font-bold leading-none mb-1.5 ${
                      r.active ? "text-bz-fire" : "text-bz-text-on-dark"
                    }`}
                  >
                    {r.name}
                  </p>
                  <p className="text-[11px] text-white/50">{r.tagline}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {r.kpis.map((kpi) => (
                    <div key={kpi} className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full shrink-0 ${
                          r.active ? "bg-bz-fire" : "bg-white/30"
                        }`}
                      />
                      <span
                        className={`text-[12.5px] ${
                          r.active ? "text-white/90" : "text-white/55"
                        }`}
                      >
                        {kpi}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.10em] px-2.5 py-1 rounded-bz-pill ${
                      r.active
                        ? "bg-bz-fire/[0.15] text-bz-fire"
                        : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {r.active ? "Active" : "Default"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customisation note */}
        <div className="mt-4 rounded-bz-xl border border-white/[0.08] bg-white/[0.03] px-5 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="hidden sm:flex w-8 h-8 rounded-bz-md bg-white/[0.06] items-center justify-center shrink-0">
              <Settings size={14} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-bz-text-on-dark mb-1">
                Teams customise their approval queue on top of defaults
              </p>
              <p className="text-[12px] text-white/55 leading-relaxed">
                Add filters, reorder columns, or scope by department, amount range, or module no admin required.
              </p>
            </div>
            <div className="flex items-baseline gap-1.5 sm:shrink-0">
              <span className="text-[32px] font-bold text-bz-text-on-dark leading-none">8+</span>
              <span className="text-[11px] text-white/50">workflow types</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Routing logic StepCard showing the rule-match-to-route moment
function RoutingSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="Routing logic"
          title={
            <>
              Submit once.{" "}
              <Heading.Muted>Routed in seconds.</Heading.Muted>
            </>
          }
          description="Every request is matched to your approval rules and routed to the right person the instant it's submitted."
          titleMaxWidth={720}
          spacing="tight"
        />
        <StepCard
          number="03"
          tag="Submit → Match → Route"
          title="From submission to the right approver in seconds."
          bullets={[
            "Every incoming request is matched against your configured rules.",
          ]}
          visual={<RouteStepVisual />}
        />
      </Container>
    </Section>
  );
}

// Audit & compliance BigCard (dark 2-col) with decision log visual
function AuditSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Audit & compliance"
          title={
            <>
              Every decision.{" "}
              <Heading.Muted>Logged automatically.</Heading.Muted>
            </>
          }
          description="Every approval, rejection, and escalation is logged with user, timestamp."
        />
        <BigCard
          text={{
            title: "100% compliance-ready, out of the box.",
            body: "Every decision logged with full chain of custody, exportable on demand.",
            bullets: [
              // "SOC 2 and local regulatory compliance built in",
              "Drill from any summary to the originating request in one click",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<AuditLogVisual />}
        />
      </Container>
    </Section>
  );
}

// Impact horizontal typographic stat strip, no cards
function ImpactSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="05"
          label="Efficiency"
          title={
            <>
              Measurable results.{" "}
              <Heading.Muted>Every team.</Heading.Muted>
            </>
          }
          spacing="tight"
          titleMaxWidth={520}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-bz-line-soft pt-10">
          {IMPACT_STATS.map((s, i) => (
            <div
              key={s.label}
              className={[
                "py-8 sm:py-0",
                i === 0 && "sm:pr-10",
                i === 1 && "sm:px-10 sm:border-l sm:border-r sm:border-bz-line-soft",
                i === 2 && "sm:pl-10",
                i < 2 && "border-b border-bz-line-soft sm:border-b-0",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="bz-stat-num" style={{ fontSize: 52, marginBottom: 10 }}>
                {s.value}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-bz-text-muted mb-3">
                {s.label}
              </div>
              <p className="text-[13.5px] text-bz-text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function WorkflowPage() {
  return (
    <>
      <HeroSection />
      <LiveActivitySection />
      <TeamControlSection />
      <RoutingSection />
      <AuditSection />
      <ImpactSection />
    </>
  );
}
