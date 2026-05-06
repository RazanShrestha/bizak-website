  import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brand: "#7a826d",
  brandLight: "rgba(122,130,109,0.1)",
  dark: "#333",
  text: "#666",
  border: "#e8eae4",
  bgLight: "#f8f9f7",
  bgDark: "#1a1d19",
  accent: "#c7ff35",
  accentLow: "rgba(199,255,53,0.1)",
};


// ─── HERO ─────────────────────────────────────────────────────────────────────
function NodeDiagram() {
  return (
    <div className="wa-node-diagram">
      <div className="wa-nodes-row">
        {/* Connector behind nodes */}
        <div className="wa-connector" />

        {/* Node 1 – Employee */}
        <div className="wa-node">
          <span className="material-symbols-outlined wa-node-icon">person</span>
          <span className="wa-node-cat">Employee</span>
          <span className="wa-node-title">Expense Claim</span>
        </div>

        {/* Node 2 – Manager (active) */}
        <div className="wa-node active">
          <span className="material-symbols-outlined wa-node-icon">network_manage</span>
          <span className="wa-node-cat">Manager</span>
          <span className="wa-node-title">Verification</span>
          <div className="wa-node-check">
            <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#333333", fontWeight: 700 }}>check</span>
          </div>
        </div>

        {/* Node 3 – Finance (final, pulsing) */}
        <div className="wa-node final">
          <div className="wa-node-pulse" />
          <span className="material-symbols-outlined wa-node-icon dark">account_balance</span>
          <span className="wa-node-cat">Finance</span>
          <span className="wa-node-title">Final Payout</span>
        </div>
      </div>

      {/* Footer status bar */}
      <div className="wa-diagram-footer">
        <div className="wa-diagram-status">
          <div className="wa-status-dot" />
          <span className="wa-status-text">Status: Approved</span>
        </div>
        <div className="wa-diagram-sep" />
        <span className="wa-diagram-step">Step 3 of 3</span>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="wa-hero">
      <div className="wa-inner">
        <div className="wa-hero-layout">
          {/* Left – text */}
          <div>
            <div className="wa-hero-badge">Workflow Automation</div>
            <h1 className="wa-hero-title">
              Automate approvals and business processes with confidence
            </h1>
            <p className="wa-hero-sub">
              Eliminate manual bottlenecks and ensure total compliance with Bizak's
              enterprise-grade workflow engine.
            </p>
            <div className="wa-hero-btns">
              <button className="wa-btn-dark">Request Demo</button>
              <button className="wa-btn-outline">Explore Purchasing</button>
            </div>
          </div>

     
          <NodeDiagram />
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES GRID ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "layers",
    title: "Multi-level approval",
    desc: "Chain approvals across departments with conditional logic based on budget or priority.",
  },
  {
    icon: "history_edu",
    title: "Audit support",
    desc: "Full historical logs of every decision made, ensuring SOC2 and local tax compliance.",
  },
  {
    icon: "schedule",
    title: "Time-based triggers",
    desc: "Automatically escalate tasks or send reminders if an approval window is nearing its limit.",
  },
  {
    icon: "hub",
    title: "Cross-module Sync",
    desc: "Connect sales leads to procurement requests without leaving the Bizak interface.",
  },
];

function FeaturesSection() {
  return (
    <section className="wa-features">
      <div className="wa-inner">
        <div className="wa-features-header">
          <span className="wa-sub-label">Standard and Automate</span>
          <h2 className="wa-section-title">Designed for operational excellence</h2>
        </div>
        <div className="wa-features-grid">
          {FEATURES.map((f) => (
            <div className="wa-feature-card" key={f.title}>
              <div className="wa-feature-icon">
                <span className="material-symbols-outlined">{f.icon}</span>
              </div>
              <div className="wa-feature-title">{f.title}</div>
              <p className="wa-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── APPROVAL CONTROL ─────────────────────────────────────────────────────────
const APPROVAL_ROWS = [
  {
    ref: "PO-9402: Logistics Hub",
    meta: "Priority: High • Amount: $14,200",
    active: true,
    dimClass: "",
    actions: ["approve", "view"],
  },
  {
    ref: "INV-2210: Server Maintenance",
    meta: "Priority: Medium • Amount: $2,100",
    active: false,
    dimClass: "dim",
    actions: ["review"],
  },
  {
    ref: "EXP-882: Travel Reimbursement",
    meta: "Priority: Low • Amount: $450",
    active: false,
    dimClass: "dimmer",
    actions: ["review"],
  },
];

function ApprovalsPanel() {
  return (
    <div className="wa-approvals-panel">
      <div className="wa-panel-topbar">
        <span className="wa-panel-title">Pending Approvals</span>
        <div className="wa-panel-dots">
          <div className="wa-dot-red" />
          <div className="wa-dot-amber" />
          <div className="wa-dot-green" />
        </div>
      </div>
      <div className="wa-approval-rows">
        {APPROVAL_ROWS.map((row) => (
          <div key={row.ref} className={`wa-approval-row ${row.dimClass}`}>
            <div className="wa-row-left">
              <div className={`wa-row-avatar ${row.active ? "active" : "inactive"}`}>
                {row.active ? <div className="wa-active-dot" /> : <div className="wa-inactive-dot" />}
              </div>
              <div>
                <div className="wa-row-ref">{row.ref}</div>
                <div className="wa-row-meta">{row.meta}</div>
              </div>
            </div>
            <div className="wa-row-actions">
              {row.actions.includes("approve") && (
                <button className="wa-approve-btn">Approve</button>
              )}
              <button className="wa-view-btn">
                {row.actions.includes("approve") ? "View" : "Review"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalSection() {
  return (
    <section className="wa-approval">
      <div className="wa-inner">
        <div className="wa-approval-layout">
          {/* Left – text */}
          <div>
            <span className="wa-approval-eyebrow">Approval Control</span>
            <h2 className="wa-approval-title">Full visibility into every pending task.</h2>
            <p className="wa-approval-desc">
              Managers get a unified dashboard of all active requests. No more hunting
              through emails for lost approval slips.
            </p>
            <div className="wa-approval-points">
              {[
                { icon: "verified",  title: "Centralized Command",  desc: "Review all module requests from one place" },
                { icon: "rule",      title: "Rule-based Routing",   desc: "Auto-assign tasks to the right person instantly" },
              ].map((pt) => (
                <div className="wa-approval-point" key={pt.title}>
                  <span className="material-symbols-outlined wa-ap-icon">{pt.icon}</span>
                  <div>
                    <div className="wa-ap-title">{pt.title}</div>
                    <div className="wa-ap-desc">{pt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – panel */}
          <ApprovalsPanel />
        </div>
      </div>
    </section>
  );
}

// ─── STATUS TRACKER ───────────────────────────────────────────────────────────
const TRACK_STEPS = [
  { label: "Submitted",        time: "9:00 AM",     state: "done"    },
  { label: "Manager Review",   time: "10:45 AM",    state: "done"    },
  { label: "Finance Approval", time: "IN PROGRESS", state: "active"  },
  { label: "Completed",        time: "--:--",       state: "pending" },
];

function StatusTracker() {
  return (
    <section className="wa-tracker">
      <div className="wa-tracker-inner">
        <div className="wa-tracker-header">
          <span className="wa-tracker-sub">Visibility &amp; Tracking</span>
          <h2 className="wa-tracker-title">Real-time status tracking</h2>
        </div>

        <div className="wa-timeline-wrap">
          <div className="wa-timeline-line" />
          <div className="wa-timeline-progress" />
          <div className="wa-timeline-steps">
            {TRACK_STEPS.map((step) => (
              <div className="wa-step" key={step.label}>
                <div className={`wa-step-node ${step.state}`}>
                  {step.state === "done" && (
                    <span className="material-symbols-outlined wa-step-node-icon">check</span>
                  )}
                </div>
                <div className={`wa-step-label ${step.state === "pending" ? "pending" : ""}`}>
                  {step.label}
                </div>
                <div className={`wa-step-time ${step.state === "active" ? "in-progress" : step.state === "pending" ? "pending" : ""}`}>
                  {step.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── INTERNAL ALERTS ──────────────────────────────────────────────────────────
function AlertsSection() {
  return (
    <section className="wa-alerts">
      <div className="wa-inner">
        <div className="wa-alerts-layout">
          {/* Left – glass panel (order-2 on mobile) */}
          <div style={{ order: 2 }}>
            <div className="wa-alerts-panel">
              <div className="wa-alerts-topbar">
                <span className="wa-alerts-title">System Alerts</span>
                <span className="wa-live-tag">Live</span>
              </div>
              <div className="wa-alert-items">
                <div className="wa-alert-item urgent">
                  <span className="material-symbols-outlined wa-alert-icon">notifications_active</span>
                  <div>
                    <div className="wa-alert-item-title">Action Required</div>
                    <div className="wa-alert-item-desc">Procurement order #449 requires your sign-off.</div>
                  </div>
                </div>
                <div className="wa-alert-item passive">
                  <span className="material-symbols-outlined wa-alert-icon dim">mail</span>
                  <div>
                    <div className="wa-alert-item-title">Weekly Recap</div>
                    <div className="wa-alert-item-desc">You completed 14 workflows this week.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right – text (order-1 on mobile) */}
          <div style={{ order: 1 }}>
            <span className="wa-alerts-eyebrow">Internal Control</span>
            <h2 className="wa-alerts-heading">Mitigate risks with automated alerts.</h2>
            <p className="wa-alerts-desc">
              Every process in Bizak includes built-in safeguards. Receive instant
              notifications on high-risk transactions or deviations from standard procedures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
// function CTASection() {
//   return (
//     <section className="wa-cta">
//       <div className="wa-inner" style={{ maxWidth: 900 }}>
//         <div className="wa-cta-card">
//           <div className="wa-cta-glow" />
//           <h2 className="wa-cta-title">Automate your business processes with confidence</h2>
//           <p className="wa-cta-sub">
//             Ready to scale your operations without the manual overhead? Join thousands of
//             enterprises optimizing with Bizak.
//           </p>
//           <div className="wa-cta-btns">
//             <button className="wa-btn-neon">Request Demo</button>
//             <button className="wa-btn-ghost-white">View Pricing</button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



// ─── 7. CTA SECTION ──────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ background: C.bgDark, padding: "128px 192px", overflow: "hidden", position: "relative" }}>
      {/* Subtle glow */}
      <div style={{
        position: "absolute", bottom: -293, left: -128, right: -128, height: 586,
        background: "radial-gradient(ellipse at 50% 50%, rgba(199,255,53,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 896, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 32, position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontFamily: "Inter", fontWeight: 700,
          fontSize: "clamp(36px, 4.5vw, 48px)",
          lineHeight: 1.2, letterSpacing: "-1.2px",
          color: "#fff", textAlign: "center", margin: 0,
        }}>
          Automate your business <br />processes with confidence
        </h2>
        <p style={{
          fontFamily: "Inter", fontWeight: 400,
          fontSize: 20, lineHeight: 1.625,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center", margin: 0, maxWidth: 580,
        }}>
            Ready to scale your operations without the manual overhead? Join thousands of
             enterprises optimizing with Bizak.
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
          <button style={{
            background: C.accent, color: C.dark, border: "none",
            borderRadius: 4, padding: "20px 40px",
            fontFamily: "Inter", fontWeight: 700, fontSize: 18,
            cursor: "pointer", boxShadow: "0 0 20px rgba(199,255,53,0.4)",
          }}>Request Demo</button>
          <button style={{
            background: "transparent", color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4,
            padding: "20px 41px",
            fontFamily: "Inter", fontWeight: 700, fontSize: 18, cursor: "pointer",
          }}>View Pricing</button>
        </div>
      </div>
    </section>
  );
}











// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function WorkflowPage() {
  return (
    <div className="wa-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
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
