import "../../styles/style.css";
import { Header } from "./Header";
import { Icon } from "./marketing/Icon";
import {
  Section,
  Container,
  SectionHeading,
  Button,
} from "./marketing";
import {
  IndustryHero,
  HeroVisual,
  HeroMainCard,
  HeroInventoryCard,
  HeroGlobeCard,
  HeroCircleCard,
  ChallengesGrid,
  ChallengeCard,
  SolutionGrid,
  type SolutionItem,
  CapabilitiesGrid,
  CapabilityCard,
  SimpleFeatureCard,
  FeatureWithMockupCard,
  MethodGrid,
  InsightsBlock,
  ChartFrame,
  WorkflowStrip,
  type WorkflowStep,
} from "./solutions/by-industry";
// Experimental: light-themed CTA + light footer for this page only.
// Mirrors the pattern in RetailAndEcommercePage.tsx.
import bizakLogo from "../../assets/bizaklogo.png";
import svgPaths from "../../imports/svg-eyvfmiiac4";

// ─── Hero ────────────────────────────────────────────────────────────────────

const TEAM_LOAD = [
  { code: "SR", label: "Senior", pct: 92, active: true },
  { code: "MG", label: "Manager", pct: 76, active: true },
  { code: "JR", label: "Analyst", pct: 64, active: false },
];

const ENGAGEMENTS = [
  {
    code: "ENG-4218",
    client: "Hartwell & Locke LLP",
    hours: "02:48:11",
    billable: "BILLABLE",
    color: "#C7FF35",
  },
  {
    code: "ENG-4219",
    client: "Vector Capital Advisors",
    hours: "01:14:32",
    billable: "BILLABLE",
    color: "#60a5fa",
  },
  {
    code: "ENG-4220",
    client: "Internal · Bench Time",
    hours: "00:42:08",
    billable: "INTERNAL",
    color: "rgba(122,130,109,0.4)",
  },
];

const WEEK_HOURS = [
  { day: "Mon", logged: 7.8, target: 8 },
  { day: "Tue", logged: 8.4, target: 8 },
  { day: "Wed", logged: 7.2, target: 8 },
  { day: "Thu", logged: 8.1, target: 8 },
  { day: "Fri", logged: 4.6, target: 8 },
];

function TeamLoadNode({
  code,
  label,
  pct,
  active,
}: {
  code: string;
  label: string;
  pct: number;
  active: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `1.5px solid ${active ? "rgba(199,255,53,0.5)" : "rgba(122,130,109,0.18)"}`,
          background: active ? "rgba(199,255,53,0.06)" : "rgba(122,130,109,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: active ? "0 0 10px rgba(199,255,53,0.12)" : "none",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: active ? "var(--bz-sage)" : "#bbb",
            letterSpacing: "0.04em",
          }}
        >
          {code}
        </span>
        <div
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: active ? "var(--bz-accent)" : "rgba(122,130,109,0.35)",
            boxShadow: active ? "0 0 5px var(--bz-accent)" : "none",
          }}
        />
      </div>
      <span style={{ fontSize: 7, color: "#bbb", letterSpacing: "0.03em" }}>{label}</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: active ? "var(--bz-accent)" : "#bbb" }}>
        {pct}%
      </span>
    </div>
  );
}

function EngagementRow({
  code,
  client,
  hours,
  billable,
  color,
}: {
  code: string;
  client: string;
  hours: string;
  billable: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span
        style={{
          fontSize: 8,
          fontFamily: "monospace",
          color: "rgba(122,130,109,0.7)",
          minWidth: 60,
        }}
      >
        {code}
      </span>
      <span
        style={{
          fontSize: 8,
          color: "#aaa",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {client}
      </span>
      <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, color: "#444" }}>
        {hours}
      </span>
      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 4,
          background:
            billable === "BILLABLE" ? "rgba(199,255,53,0.12)" : "rgba(122,130,109,0.1)",
          color: billable === "BILLABLE" ? "var(--bz-sage)" : "#999",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {billable}
      </span>
    </div>
  );
}

function ProfessionalHeroVisual() {
  return (
    <HeroVisual
      main={
        <HeroMainCard panelTitle="Bizak · Practice Hub" liveLabel="Tracking">
          {/* Active timer pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(199,255,53,0.06)",
              border: "1px solid rgba(199,255,53,0.22)",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "rgba(199,255,53,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--bz-sage)",
                }}
              >
                <Icon name="clock" size={14} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(122,130,109,0.7)",
                  }}
                >
                  Active Timer
                </div>
                <div style={{ fontSize: 9, color: "#444", fontWeight: 600 }}>
                  Hartwell &amp; Locke · M&amp;A Diligence
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                className="biz-pulse-glow"
                style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bz-accent)" }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--bz-text)",
                  letterSpacing: "0.05em",
                }}
              >
                02:48:11
              </span>
            </div>
          </div>

          {/* Team load nodes */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              {TEAM_LOAD.map((t) => (
                <TeamLoadNode key={t.code} {...t} />
              ))}
            </div>
          </div>

          {/* Engagement rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              paddingTop: 10,
              borderTop: "1px solid rgba(122,130,109,0.1)",
            }}
          >
            {ENGAGEMENTS.map((e) => (
              <EngagementRow key={e.code} {...e} />
            ))}
          </div>
        </HeroMainCard>
      }
      inventory={
        <HeroInventoryCard
          iconName="dollar"
          eyebrow="Billable Today"
          value="$32,480"
          barLabel="Realisation"
          barValue="94.2%"
          barPct={94}
        />
      }
      globe={
        <HeroGlobeCard iconName="calendar" eyebrow="This Week">
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {WEEK_HOURS.map((d) => (
              <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 7, color: "#888", minWidth: 22, fontWeight: 600 }}>
                  {d.day}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "rgba(122,130,109,0.10)",
                    borderRadius: 99,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(d.logged / d.target) * 100}%`,
                      background: d.logged >= d.target ? "var(--bz-accent)" : "var(--bz-sage)",
                      borderRadius: 99,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 700,
                    color: "#555",
                    fontFamily: "monospace",
                  }}
                >
                  {d.logged}h
                </span>
              </div>
            ))}
          </div>
        </HeroGlobeCard>
      }
      circle={<HeroCircleCard eyebrow="Utilisation" value="87%" progressPct={87} />}
    />
  );
}

function HeroSection() {
  return (
    <IndustryHero
      eyebrow="Professional Services ERP"
      title={
        <>
          Bill Every Hour.
          <br />
          <span>Deliver</span> Every Engagement.
        </>
      }
      description="Run consultancies, agencies, and advisory firms on one platform. Capture every billable minute, plan utilisation in real time, and turn every engagement into a renewable, profitable client relationship."
      primaryCta={{ label: "Request Demo" }}
      secondaryCta={{ label: "See How It Works" }}
      stats={[
        { value: "87%", label: "Avg. Utilisation" },
        { value: "12 d", label: "Faster Invoicing" },
      ]}
      visual={<ProfessionalHeroVisual />}
    />
  );
}

// ─── Challenges ──────────────────────────────────────────────────────────────

function ChallengesSection() {
  return (
    <ChallengesGrid
      eyebrow="Challenges"
      title="Every untracked minute is margin walking out the door"
      description="Spreadsheet timesheets, scope drift, idle benches, and slow invoicing quietly drain the profitability of every engagement you deliver."
      headlineMaxWidth={720}
    >
      {/* 1 · Lost Billable Hours */}
      <ChallengeCard
        icon="clock"
        title="Lost Billable Hours"
        description="When time sheets are filled in on Friday afternoon from memory, an average of 14% of billable work simply disappears — never logged, never invoiced."
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
          {[
            { d: "M", logged: 38, real: 46 },
            { d: "T", logged: 42, real: 48 },
            { d: "W", logged: 36, real: 50 },
            { d: "T", logged: 40, real: 52 },
            { d: "F", logged: 28, real: 44 },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${b.real}%`,
                  background: "rgba(248,113,113,0.18)",
                  borderRadius: "3px 3px 0 0",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: `${(b.logged / b.real) * 100}%`,
                    background: "rgba(122,130,109,0.55)",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
              </div>
              <span style={{ fontSize: 7, color: "#aaa" }}>{b.d}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <div
            className="biz-pulse-glow"
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171" }}
          />
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            14% leakage this week
          </span>
        </div>
      </ChallengeCard>

      {/* 2 · Scope Creep */}
      <ChallengeCard
        icon="target"
        title="Scope Creep"
        description="Without disciplined change-orders and live budget tracking, fixed-fee engagements quietly burn past their contracted hours."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            { label: "Quoted", pct: 60, color: "rgba(122,130,109,0.4)", val: "180h" },
            { label: "Burned", pct: 92, color: "#f87171", val: "276h" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#999",
                  minWidth: 56,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {row.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 7,
                  background: "#f3f3f3",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${row.pct}%`,
                    background: row.color,
                    borderRadius: 3,
                  }}
                />
              </div>
              <span
                style={{ fontSize: 8, fontWeight: 700, color: row.color, fontFamily: "monospace" }}
              >
                {row.val}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: "var(--bz-sage)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              +53% over budget
            </span>
          </div>
        </div>
      </ChallengeCard>

      {/* 3 · Idle Benches */}
      <ChallengeCard
        icon="users"
        title="Idle Benches"
        description="Without a real-time view of who's loaded and who's free, capable consultants sit idle while overworked teammates burn out."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { name: "A. Reyes", load: 102, status: "burn" },
            { name: "K. Ito", load: 88, status: "good" },
            { name: "M. Singh", load: 41, status: "idle" },
            { name: "J. Park", load: 18, status: "idle" },
          ].map((p) => {
            const color =
              p.status === "burn"
                ? "#f87171"
                : p.status === "idle"
                ? "rgba(122,130,109,0.3)"
                : "var(--bz-accent)";
            return (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 8, color: "#777", minWidth: 56 }}>{p.name}</span>
                <div
                  style={{
                    flex: 1,
                    height: 5,
                    background: "#f3f3f3",
                    borderRadius: 99,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "85%",
                      borderRight: "1px dashed rgba(122,130,109,0.4)",
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(p.load, 100)}%`,
                      background: color,
                      borderRadius: 99,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color:
                      p.status === "burn"
                        ? "#f87171"
                        : p.status === "idle"
                        ? "#bbb"
                        : "var(--bz-sage)",
                    minWidth: 26,
                    textAlign: "right",
                  }}
                >
                  {p.load}%
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8 }}>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "var(--bz-sage)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            2 idle · 1 over-allocated
          </span>
        </div>
      </ChallengeCard>

      {/* 4 · Slow Invoicing & DSO */}
      <ChallengeCard
        icon="receipt"
        title="Slow Invoicing & DSO"
        description="Manual invoice prep from scattered spreadsheets stretches days-sales-outstanding well past 60 days, starving cash flow."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: 36 }}>
          {[
            { stage: "Work Done", color: "rgba(122,130,109,0.55)" },
            { stage: "Time Approved", color: "#fbbf24" },
            { stage: "Invoice Sent", color: "#fbbf24" },
            { stage: "Paid", color: "#f87171" },
          ].map((s, i, arr) => (
            <div key={s.stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: s.color,
                  flexShrink: 0,
                  boxShadow: `0 0 0 3px ${s.color}22`,
                }}
              />
              {i < arr.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "linear-gradient(to right, rgba(122,130,109,0.3), rgba(122,130,109,0.1))",
                    margin: "0 4px",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["D+0", "D+8", "D+21", "D+67"].map((d) => (
            <span key={d} style={{ fontSize: 7, color: "#aaa", fontFamily: "monospace" }}>
              {d}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 6 }}>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            67-day DSO · cash trapped
          </span>
        </div>
      </ChallengeCard>

      {/* 5 · Knowledge In Inboxes */}
      <ChallengeCard
        icon="folder"
        title="Knowledge In Inboxes"
        description="Deliverables, contracts, and client correspondence scattered across email, drives, and chat — onboarding a new lead takes days, not hours."
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 56,
            gap: 0,
            position: "relative",
          }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 200 56"
            preserveAspectRatio="none"
          >
            <line
              x1="40"
              y1="20"
              x2="100"
              y2="40"
              stroke="rgba(122,130,109,0.18)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line
              x1="160"
              y1="18"
              x2="100"
              y2="40"
              stroke="rgba(122,130,109,0.18)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line
              x1="100"
              y1="10"
              x2="100"
              y2="40"
              stroke="rgba(122,130,109,0.18)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </svg>
          {[
            { x: "20%", y: "18%", lbl: "Email" },
            { x: "50%", y: "8%", lbl: "Drive" },
            { x: "80%", y: "20%", lbl: "Chat" },
            { x: "50%", y: "70%", lbl: "?" },
          ].map((n, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: n.y,
                left: n.x,
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border:
                    i === 3
                      ? "1.5px dashed #f87171"
                      : "1.5px solid rgba(122,130,109,0.22)",
                  background:
                    i === 3 ? "rgba(248,113,113,0.06)" : "rgba(122,130,109,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  fontWeight: 700,
                  color: i === 3 ? "#f87171" : "#aaa",
                }}
              >
                {n.lbl[0]}
              </div>
              <span
                style={{
                  fontSize: 7,
                  color: i === 3 ? "#f87171" : "#999",
                  marginTop: 2,
                  display: "block",
                }}
              >
                {n.lbl}
              </span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            No single source of truth
          </span>
        </div>
      </ChallengeCard>

      {/* 6 · No Engagement Margin View */}
      <ChallengeCard
        icon="trending"
        title="No Engagement Margin View"
        description="Without live cost-to-bill tracking, you only know an engagement was unprofitable months after it closed — when it's far too late to act."
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 50 }}>
          {[
            { label: "Eng. A", margin: 38, color: "var(--bz-accent)", val: "+38%" },
            { label: "Eng. B", margin: 12, color: "rgba(122,130,109,0.45)", val: "+12%" },
            { label: "Eng. C", margin: -8, color: "#f87171", val: "−8%" },
            { label: "Eng. D", margin: 22, color: "rgba(199,255,53,0.55)", val: "+22%" },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span style={{ fontSize: 7, fontWeight: 700, color: b.margin < 0 ? "#f87171" : "#555" }}>
                {b.val}
              </span>
              <div
                style={{
                  width: "100%",
                  height: Math.abs(b.margin) * 1.2 + 6,
                  background: b.color,
                  borderRadius: 4,
                  opacity: b.margin < 0 ? 0.85 : 1,
                }}
              />
              <span style={{ fontSize: 7, color: "#aaa" }}>{b.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "var(--bz-sage)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            1 of 4 silently bleeding
          </span>
        </div>
      </ChallengeCard>
    </ChallengesGrid>
  );
}

// ─── Solution ────────────────────────────────────────────────────────────────

const SOLUTIONS: SolutionItem[] = [
  {
    icon: "briefcase",
    title: "Engagement & Project Mgmt",
    desc: "Plan, staff, and run every engagement from proposal to close — phases, milestones, deliverables, and budget guardrails on one timeline.",
  },
  {
    icon: "clock",
    title: "Time & Expense Capture",
    desc: "One-tap timers, mobile entry, and AI-suggested time entries. Approvals flow directly into invoices with zero re-keying.",
  },
  {
    icon: "users",
    title: "Resource Planning",
    desc: "See who's loaded, who's free, and who's about to bench. Rebalance teams in real time and forecast hiring needs weeks ahead.",
  },
  {
    icon: "receipt",
    title: "Billing & Retainers",
    desc: "Fixed-fee, T&M, milestone, retainer — Bizak handles every billing model with automated WIP-to-invoice generation.",
  },
  {
    icon: "handshake",
    title: "Client Portal & CRM",
    desc: "A branded client workspace for proposals, deliverables, approvals, and statements — replaces ten back-and-forth emails.",
  },
  {
    icon: "trending",
    title: "Profitability Analytics",
    desc: "Live cost-to-bill, realisation, and margin per engagement, partner, and practice — actionable while the work is still in flight.",
  },
  {
    icon: "book",
    title: "Knowledge & Document Vault",
    desc: "Versioned proposals, NDAs, deliverables, and templates — searchable across every engagement and securely shared with clients.",
  },
];

// ─── Capabilities ────────────────────────────────────────────────────────────

function TimesheetMockupBody() {
  return (
    <div style={{ padding: "14px 16px" }}>
      <div
        style={{
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(199,255,53,0.06)",
          border: "1px solid rgba(199,255,53,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "var(--bz-accent)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Hartwell &amp; Locke
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#fff" }}>
            02:48:11
          </span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
          M&amp;A Diligence · Phase 2
        </span>
      </div>
      {[
        { client: "Vector Capital", task: "Strategy review", dur: "01:14:32", rate: "$240" },
        { client: "Northwind Health", task: "Compliance audit", dur: "00:48:05", rate: "$185" },
        { client: "Internal", task: "Practice meeting", dur: "00:30:00", rate: "—" },
      ].map((r) => (
        <div
          key={r.client}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 8,
            marginBottom: 8,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {r.client}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{r.task}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              {r.dur}
            </div>
            <div style={{ fontSize: 9, color: "var(--bz-accent)", marginTop: 1 }}>{r.rate}/h</div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Today billable</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bz-accent)" }}>5h 20m</span>
      </div>
    </div>
  );
}

function TimeTrackerCard() {
  return (
    <FeatureWithMockupCard
      iconName="clock"
      eyebrow="Time & Engagement Tracker"
      title="Capture Every Billable Minute"
      description="Live one-tap timers, AI-assisted time-entry from calendar and email signals, and approval chains that feed directly into invoices — eliminating the Friday-afternoon recall ritual that loses 14% of revenue every week."
      features={[
        { icon: "play", text: "One-tap timers across web, mobile, and desktop with offline sync" },
        { icon: "zap", text: "AI suggests entries from calendar, mail, and document activity" },
        { icon: "check-circle", text: "Manager approval workflows with policy violation flags" },
        { icon: "receipt", text: "Approved time auto-flows to draft invoices and WIP reports" },
      ]}
      mockupHeader={{ title: "Active Timesheet", rightLabel: "Running" }}
      mockupBody={<TimesheetMockupBody />}
      mockupBadges={[
        { val: "94%", lbl: "Realisation" },
        { val: "$32k", lbl: "Today" },
      ]}
      neon
    />
  );
}

function CapabilitiesSection() {
  return (
    <CapabilitiesGrid
      eyebrow="Capabilities"
      title="Built for the rhythm of professional practice."
      headlineMaxWidth={580}
    >
      <TimeTrackerCard />

      {/* Resource Heatmap */}
      <CapabilityCard span={3} minHeight={400}>
        <div>
          <h3>Resource Heatmap</h3>
          <p>
            A live grid of every consultant's allocation across the next four weeks — with overload
            warnings, idle alerts, and skill-aware suggestions for staffing the next engagement.
          </p>
        </div>
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px repeat(4, 1fr)",
              gap: 4,
              alignItems: "center",
            }}
          >
            <span />
            {["W1", "W2", "W3", "W4"].map((w) => (
              <span
                key={w}
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.35)",
                  textAlign: "center",
                  letterSpacing: "0.08em",
                }}
              >
                {w}
              </span>
            ))}
            {[
              { name: "A. Reyes", loads: [102, 96, 88, 72] },
              { name: "K. Ito", loads: [88, 92, 84, 76] },
              { name: "M. Singh", loads: [41, 58, 72, 80] },
              { name: "J. Park", loads: [18, 24, 48, 64] },
              { name: "S. Patel", loads: [78, 82, 90, 86] },
            ].flatMap((p) => [
              <span
                key={p.name + "-l"}
                style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", padding: "5px 0" }}
              >
                {p.name}
              </span>,
              ...p.loads.map((l, i) => {
                const bg =
                  l > 100
                    ? "#f87171"
                    : l > 85
                    ? "#C7FF35"
                    : l > 60
                    ? "rgba(199,255,53,0.5)"
                    : l > 40
                    ? "rgba(199,255,53,0.22)"
                    : "rgba(255,255,255,0.06)";
                const tc =
                  l > 100 || (l > 85 && l <= 100) ? "#1A1D19" : "rgba(255,255,255,0.55)";
                return (
                  <div
                    key={p.name + i}
                    style={{
                      height: 22,
                      borderRadius: 5,
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: tc,
                    }}
                  >
                    {l}
                  </div>
                );
              }),
            ])}
          </div>
        </div>
      </CapabilityCard>

      {/* Client 360 */}
      <CapabilityCard span={3} minHeight={400}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h3>Client 360</h3>
            <p>
              Every engagement, conversation, document, invoice, and outstanding balance for a
              client — unified in a single profile that travels with the relationship across
              partners.
            </p>
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(199,255,53,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bz-accent)",
              flexShrink: 0,
            }}
          >
            <Icon name="handshake" size={24} />
          </div>
        </div>
        <MethodGrid
          items={[
            { label: "$418k", sub: "Lifetime Fees" },
            { label: "7", sub: "Engagements" },
            { label: "96%", sub: "NPS" },
          ]}
        />
      </CapabilityCard>

      {/* Row 3: simple cards */}
      <SimpleFeatureCard
        iconName="receipt"
        title="Flexible Billing"
        body="Fixed-fee, time-and-materials, milestone, retainer, and contingent — Bizak handles every engagement type with auto-generated invoices."
        minHeight={240}
      />
      <SimpleFeatureCard
        iconName="zap"
        title="AI Time Suggest"
        body="Bizak reads calendar events, email threads, and document edits — then proposes time entries that just need a one-click approval."
        minHeight={240}
        neon
        cornerBadge="AI"
      />
      <SimpleFeatureCard
        iconName="award"
        title="Compliance & Trust"
        body="Conflict-of-interest checks, audit trails, retention policies, and SOC 2 controls — built in for regulated practices."
        minHeight={240}
        progressPct={99}
        progressLabel="SOC 2 · ISO 27001 · GDPR"
      />
    </CapabilitiesGrid>
  );
}

// ─── Insights ────────────────────────────────────────────────────────────────

function ProfessionalChart() {
  return (
    <ChartFrame
      tooltip={{ title: "Utilisation: 87%", subtitle: "Realisation: 94.2% · ↑ 6.1pp QoQ" }}
      glowSide="right"
    >
      <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" fill="none">
        <defs>
          <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(122,130,109,0.06)" strokeWidth="1" />
        ))}
        <path
          d="M0 110 C 40 100, 80 92, 120 78 S 200 60, 240 50 S 320 40, 400 28"
          stroke="var(--bz-sage)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 110 C 40 100, 80 92, 120 78 S 200 60, 240 50 S 320 40, 400 28 V 200 H 0 Z"
          fill="url(#utilGrad)"
        />
        <path
          d="M0 130 C 50 128, 100 124, 160 116 S 250 96, 310 84 S 370 70, 400 60"
          stroke="rgba(122,130,109,0.4)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        {[
          { x: 60, y: 95 },
          { x: 140, y: 70 },
          { x: 240, y: 50 },
          { x: 340, y: 34 },
        ].map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--bz-accent)"
            stroke="var(--bz-sage)"
            strokeWidth="1.6"
          />
        ))}
        <line
          x1="240"
          y1="50"
          x2="240"
          y2="20"
          stroke="rgba(199,255,53,0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text x="246" y="18" fontSize="8" fill="var(--bz-sage)">
          New Hires Onboarded
        </text>
      </svg>
    </ChartFrame>
  );
}

// ─── Workflow ────────────────────────────────────────────────────────────────

const STEPS: WorkflowStep[] = [
  { icon: "search", label: "Lead" },
  { icon: "file-text", label: "Proposal" },
  { icon: "handshake", label: "Engage" },
  { icon: "clock", label: "Deliver" },
  { icon: "receipt", label: "Bill" },
  { icon: "repeat", label: "Renew" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export function ProfessionalServicePage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <ChallengesSection />
        <SolutionGrid
          eyebrow="The Solution"
          title="One platform for every engagement, every consultant, every client"
          items={SOLUTIONS}
        />
        <CapabilitiesSection />
        <WorkflowStrip
          eyebrow="Engagement Lifecycle"
          title="From First Conversation to Lifetime Client"
          steps={STEPS}
        />
        <LightCtaSection />
      </main>
      <ProfessionalFooterLight />
    </div>
  );
}

// ─── EXPERIMENTAL: Light-themed CTA ──────────────────────────────────────────
//   Replacement for <IndustryCta /> on this page only. Mirrors the pattern
//   used in RetailAndEcommercePage.tsx.
function LightCtaSection() {
  return (
    <Section
      tone="light"
      pad="default"
      className="overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 70% 60% at 100% 100%, rgba(199,255,53,0.30) 0%, transparent 55%),
          radial-gradient(ellipse 60% 60% at 0% 0%, rgba(122,130,109,0.12) 0%, transparent 55%)
        `,
      }}
    >
      <Container width="narrow">
        <div className="flex flex-col items-center text-center gap-7 relative z-10">
          <SectionHeading
            eyebrow="Get started"
            title={
              <>
                Run a profitable practice,
                <br />
                <span className="text-bz-sage">not a busy one.</span>
              </>
            }
            description="Unify time, talent, and clients on Bizak — and turn every billable hour into a lasting relationship."
            tone="dark"
            align="center"
            maxWidth={680}
          />
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="lg" href="/contact" withArrow>
              Request Demo
            </Button>
            <Button variant="outline" size="lg" href="/contact">
              View Pricing
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-bz-text-muted">
            {[
              "No credit card required",
              "14-day free trial",
              "Cancel anytime",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-bz-sage" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── EXPERIMENTAL: Light-themed Footer ───────────────────────────────────────
//   Replacement for the global <Footer /> on this page only. Mirrors the
//   pattern used in RetailAndEcommercePage.tsx.
const PROFESSIONAL_FOOTER_LINKS = [
  {
    heading: "Product",
    items: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "Documentation", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Blog", href: "/blog" },
      { label: "Customer Stories", href: "#" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
];

function ProfessionalFooterLight() {
  return (
    <footer className="bg-bz-bg-alt border-t border-bz-border">
      <div className="max-w-[1320px] mx-auto px-5 py-16">
        <div className="flex flex-col lg:flex-row gap-12 justify-between">
          {/* Brand column */}
          <div className="lg:w-[464px]">
            <div className="flex items-center gap-2 mb-6">
              <img src={bizakLogo} alt="Bizak" className="h-8 w-auto" />
            </div>
            <p className="text-bz-text-muted text-[14px] leading-[1.625] max-w-[310px]">
              Empowering modern businesses with an all-in-one ERP that is flexible, powerful, and
              easy to use.
            </p>
          </div>

          {/* Links columns */}
          <div className="flex flex-col sm:flex-row gap-12">
            {PROFESSIONAL_FOOTER_LINKS.map((col) => (
              <div key={col.heading} className="w-52">
                <h5 className="text-bz-text uppercase mb-6 text-[11px] font-bold tracking-[0.05em]">
                  {col.heading}
                </h5>
                <ul className="space-y-4">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-bz-text-muted hover:text-bz-sage transition-colors text-[14px]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-bz-border-soft">
          <p className="text-bz-text-soft text-[11px] font-medium tracking-[0.05em]">
            © 2024 BIZAK SYSTEMS INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" aria-label="Social link" className="text-bz-text-soft hover:text-bz-sage transition-colors">
              <svg width="19" height="19" viewBox="0 0 18.9999 18.9999" fill="none">
                <path d={svgPaths.p1a75c680} fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="Social link" className="text-bz-text-soft hover:text-bz-sage transition-colors">
              <svg width="19" height="15" viewBox="0 0 18.9999 14.9999" fill="none">
                <path d={svgPaths.p3f52f0c0} fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="Social link" className="text-bz-text-soft hover:text-bz-sage transition-colors">
              <svg width="17" height="19" viewBox="0 0 16.9999 18.9999" fill="none">
                <path d={svgPaths.p9aabd00} fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
