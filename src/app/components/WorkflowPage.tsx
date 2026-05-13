import "../../styles/style.css";
import {
  Section, Container, SectionHead, Pill, Heading, BadgeGreen,
  Bento, BentoGrid, BigCard, StepCard, StatusChip,
} from "./bz";
import {
  Sparkles, Layers, Clock, GitBranch, ShieldCheck, FileCheck, Bell,
  Check, User, Network, Landmark, ChevronRight,
} from "lucide-react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { tone: "dark"  as const, icon: Layers,      title: "Multi-level approvals",   desc: "Chain approvals across departments with conditional logic based on amount, priority, or module." },
  { tone: "fire"  as const, icon: ShieldCheck, title: "100% audit trail",        desc: "Every decision logged with user, timestamp, and reasoning — SOC 2 and local compliance ready." },
  { tone: "paper" as const, icon: Clock,       title: "Time-based escalation",   desc: "Automatically escalate if an approver hasn't acted within a defined window. No chasing." },
  { tone: "paper" as const, icon: GitBranch,   title: "Cross-module routing",    desc: "POs, expenses, invoices, and work orders all flow through one unified approval engine." },
  { tone: "paper" as const, icon: FileCheck,   title: "Rule-based assignment",   desc: "Define who approves what — by department, amount threshold, or custom condition — once." },
  { tone: "paper" as const, icon: Bell,        title: "Smart notifications",     desc: "Actionable alerts in-app, by email, or via integration — no more lost approval emails." },
];

const QUEUE_ROWS = [
  { ref: "PO-9402",  label: "Logistics Hub",       amount: "$14,200", priority: "High",   active: true  },
  { ref: "INV-2210", label: "Server Maintenance",   amount: "$2,100",  priority: "Medium", active: false },
  { ref: "EXP-882",  label: "Travel Reimbursement", amount: "$450",    priority: "Low",    active: false },
];

const APPROVAL_STAGES = [
  { Icon: User,     cat: "Employee", title: "Expense Claim", state: "done"    },
  { Icon: Network,  cat: "Manager",  title: "Verification",  state: "active"  },
  { Icon: Landmark, cat: "Finance",  title: "Final Payout",  state: "pending" },
] as const;

// ── HERO VISUAL ───────────────────────────────────────────────────────────────

function ApprovalFlowMock() {
  return (
    <div className="w-full max-w-[820px] mx-auto mt-10">
      <div className="rounded-bz-xl border border-bz-line bg-bz-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-bz-line-soft bg-bz-paper-warm">
          <span className="text-[12px] font-semibold text-bz-text-muted uppercase tracking-[0.1em]">
            Approval Engine
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-bz-fire" />
            <span className="text-[10px] font-bold text-bz-text-muted uppercase tracking-[0.12em]">Live</span>
          </div>
        </div>

        <div className="px-6 py-7">
          {/* Stage flow */}
          <div className="relative flex items-start justify-around gap-4 mb-6">
            <div className="absolute top-5 left-[12%] right-[12%] h-px bg-bz-line-soft" />
            <div className="absolute top-5 left-[12%] h-px bg-bz-fire" style={{ width: "38%" }} />
            {APPROVAL_STAGES.map((s) => {
              const SIcon = s.Icon;
              const done   = s.state === "done";
              const active = s.state === "active";
              return (
                <div key={s.cat} className="relative flex flex-col items-center text-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    done ? "bg-bz-olive" : active ? "bg-bz-fire" : "bg-bz-paper-warm border border-bz-line"
                  }`}>
                    <SIcon className={`size-4 ${
                      done ? "text-bz-text-on-dark" : active ? "text-bz-text" : "text-bz-text-muted"
                    }`} />
                  </div>
                  {done && (
                    <div className="absolute -top-1 right-0 w-4 h-4 rounded-full bg-bz-fire flex items-center justify-center">
                      <Check className="size-2.5 text-bz-text" strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-bz-text-muted">{s.cat}</span>
                  <span className="text-[12px] font-bold text-bz-text mt-0.5">{s.title}</span>
                </div>
              );
            })}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between py-2.5 px-3 rounded-bz-md bg-bz-paper-warm border border-bz-line-soft mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-fire" />
              <span className="text-[12px] font-semibold text-bz-text">PO-9402 · Logistics Hub · $14,200</span>
            </div>
            <span className="text-[11px] text-bz-text-muted">Step 2 of 3 · In Progress</span>
          </div>

          {/* Queue strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUEUE_ROWS.map((row) => (
              <div
                key={row.ref}
                className={`flex items-center gap-2.5 p-2.5 rounded-bz-md border ${row.active ? "border-bz-fire" : "border-bz-line-soft"}`}
                style={row.active ? { background: "var(--bz-fire-soft)" } : { background: "var(--bz-paper-warm)" }}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${row.active ? "bg-bz-fire" : "bg-bz-section-b border border-bz-line"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${row.active ? "bg-bz-text" : "bg-bz-text-soft"}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-bz-text truncate">{row.ref}</div>
                  <div className="text-[9px] text-bz-text-muted mt-0.5 truncate">{row.label} · {row.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP CARD VISUALS ─────────────────────────────────────────────────────────

function StepVisualDefineRules() {
  const rules = [
    { condition: "PO > $5,000",      assignee: "Finance Manager" },
    { condition: "Expense > $500",   assignee: "Department Head" },
    { condition: "Invoice > $1,000", assignee: "CFO"             },
  ];
  return (
    <div className="rounded-bz-lg border border-bz-line bg-bz-surface p-4">
      <div className="text-[11px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-3">
        Approval Rules
      </div>
      <div className="flex flex-col gap-2">
        {rules.map((r) => (
          <div key={r.condition} className="flex items-center justify-between gap-2 px-3 py-2 rounded-bz-md bg-bz-paper-warm">
            <span className="text-[12px] font-medium text-bz-text">{r.condition}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ChevronRight className="size-3 text-bz-text-soft" />
              <span className="text-[11px] font-bold text-bz-text-muted">{r.assignee}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepVisualAutoRoute() {
  const log = [
    { label: "PO-9402 received",          done: true,  active: false },
    { label: "Matched: PO > $5,000",      done: true,  active: false },
    { label: "Routed to Finance Manager", done: false, active: true  },
  ];
  return (
    <div className="rounded-bz-lg border border-bz-line bg-bz-surface p-4">
      <div className="text-[11px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-3">
        Routing Log
      </div>
      <div className="flex flex-col gap-2.5">
        {log.map((l, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              l.active ? "bg-bz-fire" : l.done ? "bg-bz-olive" : "bg-bz-paper-warm border border-bz-line"
            }`}>
              {l.done   && <Check className="size-3 text-bz-text-on-dark" strokeWidth={3} />}
              {l.active && <div className="w-1.5 h-1.5 rounded-full bg-bz-text" />}
            </div>
            <span className={`text-[12px] flex-1 ${l.active ? "font-bold text-bz-text" : "font-medium text-bz-text-muted"}`}>
              {l.label}
            </span>
            {l.active && (
              <span className="text-[10px] font-bold text-bz-fire uppercase tracking-[0.1em]">Live</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepVisualEscalate() {
  const timeline = [
    { time: "0h",  label: "EXP-882 submitted",    state: "done"    },
    { time: "24h", label: "Reminder to D. Chen",  state: "done"    },
    { time: "48h", label: "Escalated to CFO",      state: "active"  },
    { time: "—",   label: "Awaiting resolution",   state: "pending" },
  ];
  return (
    <div className="rounded-bz-lg border border-bz-line bg-bz-surface p-4">
      <div className="text-[11px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-3">
        EXP-882 · $450
      </div>
      <div className="flex flex-col gap-3">
        {timeline.map((t) => (
          <div key={t.time} className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] w-9 text-right flex-shrink-0 ${
              t.state === "active" ? "text-bz-fire" : t.state === "done" ? "text-bz-text-muted" : "text-bz-text-soft"
            }`}>
              {t.time}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              t.state === "active" ? "bg-bz-fire" : t.state === "done" ? "bg-bz-olive" : "bg-bz-line"
            }`} />
            <span className={`text-[12px] ${
              t.state === "active" ? "font-bold text-bz-text" : t.state === "done" ? "font-medium text-bz-text-muted" : "text-bz-text-soft"
            }`}>
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AUDIT LOG VISUAL ──────────────────────────────────────────────────────────

function AuditLogVisual() {
  const events = [
    { ref: "PO-9402",  action: "approved",  user: "Arjun Mehta", dept: "Finance",     time: "10:47 AM",  type: "approve" as const },
    { ref: "EXP-882",  action: "rejected",  user: "Priya Nair",  dept: "Operations",  time: "9:23 AM",   type: "reject"  as const },
    { ref: "INV-2210", action: "forwarded", user: "Marcus Lee",  dept: "Procurement", time: "Yesterday", type: "forward" as const },
  ];
  return (
    <div className="rounded-bz-lg border border-white/[0.12] bg-white/[0.05] p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-4">
        Approval History
      </div>
      <div className="flex flex-col gap-3">
        {events.map((e) => (
          <div key={e.ref} className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${e.type === "approve" ? "bg-bz-fire" : "bg-white/10"}`}>
              {e.type === "approve" && <Check className="size-3.5 text-bz-text" strokeWidth={3} />}
              {e.type === "reject"  && <span className="text-[9px] font-bold text-white/60">✕</span>}
              {e.type === "forward" && <ChevronRight className="size-3 text-white/50" />}
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
      <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-end">
        <span className="text-[11px] font-bold text-white/40">3 decisions · 100% logged</span>
      </div>
    </div>
  );
}

// ── APPROVAL QUEUE PANEL ──────────────────────────────────────────────────────

function ApprovalQueuePanel() {
  return (
    <div className="rounded-bz-xl border border-bz-line bg-bz-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft bg-bz-paper-warm">
        <span className="text-[13px] font-bold text-bz-text">Pending Approvals</span>
        <StatusChip variant="live">Live</StatusChip>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {QUEUE_ROWS.map((row) => (
          <div
            key={row.ref}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-bz-md border ${row.active ? "border-bz-fire" : "border-bz-line-soft"}`}
            style={row.active ? { background: "var(--bz-fire-soft)" } : { background: "var(--bz-paper-warm)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${row.active ? "bg-bz-fire" : "bg-bz-section-b border border-bz-line"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${row.active ? "bg-bz-text" : "bg-bz-text-muted"}`} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-bz-text truncate">{row.ref}: {row.label}</div>
                <div className="text-[10px] text-bz-text-muted mt-0.5">Priority: {row.priority} · {row.amount}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {row.active && (
                <button className="text-[11px] font-bold px-3 py-1.5 rounded-bz-md bg-bz-olive text-bz-text-on-dark">
                  Approve
                </button>
              )}
              <button className="text-[11px] font-bold px-3 py-1.5 rounded-bz-md border border-bz-line text-bz-text">
                {row.active ? "View" : "Review"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SECTIONS ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Workflow Automation</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Stop chasing approvals.{" "}
            <Heading.Muted>Routes, escalates, and closes — automatically.</Heading.Muted>
          </Heading>
          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill variant="dark" withTick href="/contact">Request demo</Pill>
            <Pill variant="light" iconLeft={<Sparkles size={13} />} href="/purchasing">
              Explore purchasing
            </Pill>
          </div>
        </div>
        <ApprovalFlowMock />
      </Container>
    </Section>
  );
}

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="What it does"
          title={<>Every approval. Every rule.<br /><Heading.Muted>One engine.</Heading.Muted></>}
          description="Bizak's workflow engine handles multi-level approvals across every module — with conditional logic, time triggers, and a full audit trail baked in."
        />
        <BentoGrid cols={3}>
          {CAPABILITIES.map(({ tone, icon: Icon, title, desc }) => (
            <Bento key={title} tone={tone} hover>
              <Bento.Header title={title} icon={<Icon className="size-5" />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function ApprovalQueueSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <SectionHead
              index="02"
              label="Approval Control"
              title={<>Full visibility into<br /><Heading.Muted>every pending task.</Heading.Muted></>}
              description="Managers see every active request from every module in one queue — no hunting through emails for lost approval slips."
              spacing="none"
            />
            <div className="flex flex-col gap-4 mt-8">
              {[
                { Icon: ShieldCheck, title: "Centralized command",  desc: "Review all module requests from one place — POs, expenses, invoices, and more." },
                { Icon: FileCheck,   title: "Rule-based routing",   desc: "Auto-assign every request to the right approver the moment it's submitted." },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-bz-md bg-bz-paper-warm border border-bz-line flex items-center justify-center flex-shrink-0">
                    <Icon className="size-4 text-bz-text" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-bz-text">{title}</div>
                    <div className="text-[13px] text-bz-text-muted mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ApprovalQueuePanel />
        </div>
      </Container>
    </Section>
  );
}

function WorkflowStepsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="How it works"
          title={<>Three steps to<br /><Heading.Muted>zero manual overhead.</Heading.Muted></>}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Configure"
            title="Define your approval rules, once."
            bullets={[
              "Set thresholds by amount, module, department, or priority.",
              "Chain approvers in sequence — or in parallel for faster sign-off.",
            ]}
            visual={<StepVisualDefineRules />}
          />
          <StepCard
            number="02"
            tag="Route"
            title="Bizak routes every request automatically."
            bullets={[
              "Every submitted request is matched to your rules and routed instantly.",
              "No manual assignment. No waiting for someone to forward an email.",
            ]}
            visual={<StepVisualAutoRoute />}
          />
          <StepCard
            number="03"
            tag="Close"
            title="Escalate stalled approvals. Close the loop."
            bullets={[
              "If an approver hasn't acted within your window, Bizak escalates for them.",
              "Every decision — approve, reject, forward — is logged with full chain of custody.",
            ]}
            visual={<StepVisualEscalate />}
          />
        </div>
      </Container>
    </Section>
  );
}

function AuditTrailSection() {
  return (
    <Section tone="b">
      <Container>
        <BigCard
          text={{
            title: <>Click any approval,<br />see every decision.</>,
            body: "Every approval, rejection, and escalation is logged with user, timestamp, and reasoning — so you can satisfy any audit, any time, with a single click.",
            bullets: [
              "100% compliance-ready — SOC 2 and local tax requirements out of the box.",
              "Full chain of custody: who approved what, when, and why.",
              "Drill from any summary to the originating request in one click.",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "See it in action" },
          }}
          visual={<AuditLogVisual />}
        />
      </Container>
    </Section>
  );
}

// ── EXPORT ────────────────────────────────────────────────────────────────────

export function WorkflowPage() {
  return (
    <main>
      <HeroSection />
      <CapabilitiesSection />
      <ApprovalQueueSection />
      <WorkflowStepsSection />
      <AuditTrailSection />
    </main>
  );
}
