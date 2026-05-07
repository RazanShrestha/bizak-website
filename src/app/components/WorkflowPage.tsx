import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  User, Network, Landmark, Check, Layers, History, Clock, GitBranch,
  ShieldCheck, FileCheck, Bell, Mail,
} from "lucide-react";
import {
  Section, Container, SectionHeading, Button, Card, IconBadge, HeroBadge, PillBadge, HeroCentered, Stat,
} from "./marketing";

// ─── HERO VISUAL ─────────────────────────────────────────────────────────────
function NodeDiagram() {
  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="rounded-bz-lg border border-white/20 bg-white/[0.06] p-1.5 shadow-[0_0_60px_rgba(199,255,53,0.12)]">
        <div className="rounded-bz-md bg-white/[0.04] px-4 py-5 sm:px-6 flex flex-col gap-5">

          {/* Window chrome */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(["#ff5f57", "#ffbd2e", "#28c840"] as const).map((bg) => (
                <div key={bg} style={{ background: bg }} className="w-2.5 h-2.5 rounded-full" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.12em]">
              Workflow Engine
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="biz-pulse-glow w-1.5 h-1.5 rounded-full bg-bz-accent shrink-0"
                style={{ boxShadow: "0 0 8px #C7FF35" }}
              />
              <span className="text-[9px] font-bold text-bz-accent uppercase tracking-[0.14em]">Live</span>
            </div>
          </div>

          {/* Approval node flow */}
          <div className="relative flex items-center justify-between gap-2 py-4">
            <div className="absolute top-1/2 left-[12%] right-[12%] h-px bg-white/10 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-[12%] h-px bg-bz-accent/60 -translate-y-1/2"
              style={{ width: "55%" }}
            />
            {[
              { Icon: User,     cat: "Employee", title: "Expense Claim", state: "done"    },
              { Icon: Network,  cat: "Manager",  title: "Verification",  state: "active"  },
              { Icon: Landmark, cat: "Finance",  title: "Final Payout",  state: "pending" },
            ].map((n, i) => {
              const NIcon = n.Icon;
              const isActive = n.state === "active";
              const isDone   = n.state === "done";
              return (
                <div key={n.cat} className="relative flex flex-col items-center text-center px-2 z-10">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2.5"
                    style={{
                      background: isActive ? "var(--bz-accent)" : isDone ? "var(--bz-sage)" : "rgba(255,255,255,0.05)",
                      border: isActive ? "none" : isDone ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <NIcon className="size-5" color={isActive ? "#1A1D19" : isDone ? "#fff" : "rgba(255,255,255,0.45)"} />
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-white/40">{n.cat}</span>
                  <span className="text-[12px] font-bold text-white mt-1">{n.title}</span>
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bz-accent flex items-center justify-center border-2 border-bz-deep">
                      <Check className="size-3" color="#1A1D19" strokeWidth={3} />
                    </div>
                  )}
                  {i === 2 && <div className="absolute inset-0 rounded-full biz-pulse-glow pointer-events-none" />}
                </div>
              );
            })}
          </div>

          {/* Status bar */}
          <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-accent" />
              <span className="text-[11px] font-semibold text-white/70">Status: In Progress</span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/40">Step 2 of 3</span>
          </div>

          {/* Queue preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { ref: "PO-9402",  meta: "Logistics Hub · $14,200", active: true  },
              { ref: "INV-2210", meta: "Server Maint · $2,100",   active: false },
              { ref: "EXP-882",  meta: "Travel · $450",           active: false },
            ].map((row) => (
              <div
                key={row.ref}
                className="flex items-center gap-2.5 p-3 rounded-bz-md border border-white/[0.07] bg-white/[0.03]"
                style={{ opacity: row.active ? 1 : 0.5 }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: row.active ? "var(--bz-accent)" : "rgba(255,255,255,0.05)",
                    border: row.active ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: row.active ? "#1A1D19" : "rgba(255,255,255,0.3)" }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{row.ref}</div>
                  <div className="text-[9px] text-white/35 mt-0.5 truncate">{row.meta}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Layers,     title: "Multi-level approval", desc: "Chain approvals across departments with conditional logic based on budget or priority." },
  { Icon: History,    title: "Audit support",        desc: "Full historical logs of every decision made, ensuring SOC 2 and local tax compliance." },
  { Icon: Clock,      title: "Time-based triggers",  desc: "Automatically escalate tasks or send reminders if an approval window is nearing its limit." },
  { Icon: GitBranch,  title: "Cross-module sync",    desc: "Connect sales leads to procurement requests without leaving the Bizak interface." },
];

function FeaturesSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Standardize and Automate"
          title="Designed for operational excellence"
          maxWidth={640}
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ Icon: FIcon, title, desc }) => (
            <Card key={title} pad="md" hover="lift">
              <IconBadge tone="sage" size="md" className="mb-5"><FIcon className="size-5" /></IconBadge>
              <h3 className="text-[16px] font-bold text-bz-text mb-2">{title}</h3>
              <p className="text-[13px] text-bz-text-muted leading-[1.7]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── APPROVALS ───────────────────────────────────────────────────────────────
const APPROVAL_ROWS = [
  { ref: "PO-9402: Logistics Hub",       meta: "Priority: High · Amount: $14,200",   active: true,  opacity: 1 },
  { ref: "INV-2210: Server Maintenance", meta: "Priority: Medium · Amount: $2,100",  active: false, opacity: 0.7 },
  { ref: "EXP-882: Travel Reimbursement", meta: "Priority: Low · Amount: $450",       active: false, opacity: 0.45 },
];

function ApprovalsPanel() {
  return (
    <Card pad="md" className="w-full max-w-[520px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[13px] font-bold text-bz-text">Pending Approvals</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {APPROVAL_ROWS.map((row) => (
          <div
            key={row.ref}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-bz-md border border-bz-border bg-bz-bg/40"
            style={{ opacity: row.opacity }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: row.active ? "var(--bz-accent)" : "var(--bz-bg)", border: row.active ? "none" : "1px solid var(--bz-border)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: row.active ? "#1A1D19" : "var(--bz-text-muted)" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-bz-text truncate">{row.ref}</div>
                <div className="text-[10px] text-bz-text-muted mt-0.5 truncate">{row.meta}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 sm:ml-3">
              {row.active && (
                <button className="text-[11px] font-bold px-3 py-1.5 rounded-bz-md bg-bz-deep text-white hover:bg-black/85 transition-colors flex-1 sm:flex-none">Approve</button>
              )}
              <button className="text-[11px] font-bold px-3 py-1.5 rounded-bz-md border border-bz-border text-bz-text hover:bg-bz-bg transition-colors flex-1 sm:flex-none">
                {row.active ? "View" : "Review"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ApprovalSection() {
  return (
    <Section tone="light">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              eyebrow="Approval Control"
              title="Full visibility into every pending task."
              description="Managers get a unified dashboard of all active requests. No more hunting through emails for lost approval slips."
              maxWidth={460}
              className="mb-8"
            />
            <div className="flex flex-col gap-5">
              {[
                { Icon: ShieldCheck, title: "Centralized Command",  desc: "Review all module requests from one place" },
                { Icon: FileCheck,   title: "Rule-based Routing",   desc: "Auto-assign tasks to the right person instantly" },
              ].map(({ Icon: PIcon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <IconBadge tone="sage" size="md" className="flex-shrink-0"><PIcon className="size-5" /></IconBadge>
                  <div>
                    <div className="text-[15px] font-bold text-bz-text">{title}</div>
                    <div className="text-[13px] text-bz-text-muted mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ApprovalsPanel />
        </div>
      </Container>
    </Section>
  );
}

// ─── STATUS TRACKER ──────────────────────────────────────────────────────────
const TRACK_STEPS = [
  { label: "Submitted",        time: "9:00 AM",     state: "done"    },
  { label: "Manager Review",   time: "10:45 AM",    state: "done"    },
  { label: "Finance Approval", time: "IN PROGRESS", state: "active"  },
  { label: "Completed",        time: "--:--",       state: "pending" },
];

function StatusTracker() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Visibility & Tracking"
          title="Real-time status tracking"
          align="center"
          className="mb-14"
        />
        <div className="relative max-w-[920px] mx-auto">
          <div className="hidden sm:block absolute top-5 left-[8%] right-[8%] h-px bg-bz-border" />
          <div className="hidden sm:block absolute top-5 left-[8%] h-px bg-bz-accent" style={{ width: "42%" }} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">
            {TRACK_STEPS.map((step) => {
              const isDone = step.state === "done";
              const isActive = step.state === "active";
              return (
                <div key={step.label} className="flex flex-col items-center text-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3 relative bg-white"
                    style={{
                      background: isDone ? "var(--bz-sage)" : isActive ? "var(--bz-accent)" : "var(--bz-bg)",
                      border: isDone ? "none" : isActive ? "none" : "1px solid var(--bz-border)",
                    }}
                  >
                    {isDone && <Check className="size-4" color="#fff" strokeWidth={3} />}
                    {isActive && <div className="absolute inset-0 rounded-full biz-pulse-glow pointer-events-none" />}
                  </div>
                  <div className={isActive ? "text-[14px] font-bold text-bz-text" : isDone ? "text-[14px] font-bold text-bz-text" : "text-[14px] font-semibold text-bz-text-muted"}>
                    {step.label}
                  </div>
                  <div className={isActive ? "text-[10px] font-bold tracking-[0.12em] uppercase text-bz-sage mt-1" : "text-[11px] text-bz-text-muted mt-1"}>
                    {step.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── ALERTS ──────────────────────────────────────────────────────────────────
function AlertsSection() {
  return (
    <Section tone="light">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Card pad="lg" className="order-2 lg:order-1">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[13px] font-bold text-bz-text">System Alerts</span>
              <PillBadge tone="accent" dot>Live</PillBadge>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 p-4 rounded-bz-md bg-bz-accent/5 border border-bz-accent/30">
                <IconBadge tone="accent" size="sm" className="flex-shrink-0"><Bell className="size-4" /></IconBadge>
                <div>
                  <div className="text-[13px] font-bold text-bz-text">Action Required</div>
                  <div className="text-[12px] text-bz-text-muted mt-0.5">Procurement order #449 requires your sign-off.</div>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-bz-md border border-bz-border">
                <IconBadge tone="sage" size="sm" className="flex-shrink-0"><Mail className="size-4" /></IconBadge>
                <div>
                  <div className="text-[13px] font-bold text-bz-text">Weekly Recap</div>
                  <div className="text-[12px] text-bz-text-muted mt-0.5">You completed 14 workflows this week.</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Internal Control"
              title="Mitigate risks with automated alerts."
              description="Every process in Bizak includes built-in safeguards. Receive instant notifications on high-risk transactions or deviations from standard procedures."
              maxWidth={460}
            />
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
          title={<>Automate your business processes<br />with confidence</>}
          description="Ready to scale your operations without the manual overhead? Join thousands of enterprises optimizing with Bizak."
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
export function WorkflowPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroCentered
          tone="dark"
          mesh={false}
          badge={<HeroBadge tone="dark">Workflow Automation</HeroBadge>}
          title={<>Automate approvals and<br />business processes <span className="text-bz-sage">with confidence</span></>}
          description="Eliminate manual bottlenecks and ensure total compliance with Bizak's enterprise-grade workflow engine."
          actions={
            <>
              <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
              <Button variant="ghostDark" size="lg" href="/purchasing">Explore Purchasing</Button>
            </>
          }
          visual={
            <>
              <div className="flex flex-wrap justify-center gap-8 md:gap-14 py-6 mb-8 border-y border-white/10">
                {[
                  { value: "14h",  label: "Saved per week" },
                  { value: "100%", label: "Audit trail"    },
                ].map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} tone="light" size="md" align="center" />
                ))}
              </div>
              <NodeDiagram />
            </>
          }
        />
        <FeaturesSection />
        <ApprovalSection />
        <StatusTracker />
        <AlertsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
