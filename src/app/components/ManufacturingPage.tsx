import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { HeroSplit, HeroBadge, Button, Icon } from "./marketing";
import {
  HeroVisual,
  HeroMainCard,
  HeroInventoryCard,
  HeroGlobeCard,
  HeroCircleCard,
  Node,
  ChallengesGrid,
  ChallengeCard,
  SolutionGrid,
  type SolutionItem,
  CapabilitiesGrid,
  CapabilityCard,
  SimpleFeatureCard,
  MonoTable,
  MethodGrid,
  MiniStatBlock,
  InsightsBlock,
  ChartFrame,
  WorkflowStrip,
  type WorkflowStep,
  IndustryCta,
} from "./solutions/by-industry";

// ─── Hero ────────────────────────────────────────────────────────────────────

const WORK_CENTERS = [
  { code: "M-01", label: "Cutting", value: "89%", active: true },
  { code: "M-02", label: "Drilling", value: "92%", active: true },
  { code: "M-03", label: "Assembly", value: "—", active: false },
  { code: "M-04", label: "QC", value: "97%", active: true },
];

const ACTIVE_WO = [
  { id: "WO-2024-1204", pct: 78 },
  { id: "WO-2024-1205", pct: 52 },
];

const LINE_TARGETS = [
  { label: "Line A", pct: 84 },
  { label: "Line B", pct: 67 },
  { label: "Line C", pct: 91 },
];

function ManufacturingHeroVisual() {
  return (
    <HeroVisual
      main={
        <HeroMainCard panelTitle="Bizak · Production Control">
          {/* Work centers with SVG flow lines */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <svg
              style={{
                position: "absolute",
                top: "38%",
                left: "12.5%",
                width: "75%",
                height: 2,
                overflow: "visible",
                pointerEvents: "none",
              }}
              viewBox="0 0 300 2"
            >
              <line
                x1="0"
                y1="1"
                x2="300"
                y2="1"
                stroke="rgba(122,130,109,0.15)"
                strokeWidth="1.5"
              />
              {[60, 150, 240].map((x, i) => (
                <circle
                  key={i}
                  cx={x}
                  cy="1"
                  r="3"
                  fill="var(--bz-accent)"
                  opacity={i === 1 ? "0.25" : "0.7"}
                >
                  <animate
                    attributeName="cx"
                    values={`${x - 60};${x + 60}`}
                    dur={`${1.4 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.8;0"
                    dur={`${1.4 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </svg>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
              {WORK_CENTERS.map((wc) => (
                <Node key={wc.code} icon="floor" {...wc} />
              ))}
            </div>
          </div>

          {/* Active WO progress rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              paddingTop: 10,
              borderTop: "1px solid rgba(122,130,109,0.1)",
            }}
          >
            {ACTIVE_WO.map((wo) => (
              <div key={wo.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: "monospace",
                    color: "rgba(122,130,109,0.7)",
                    minWidth: 86,
                  }}
                >
                  {wo.id}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "rgba(122,130,109,0.1)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${wo.pct}%`,
                      background: "var(--bz-accent)",
                      borderRadius: 99,
                    }}
                  />
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, color: "var(--bz-sage)" }}>
                  {wo.pct}%
                </span>
              </div>
            ))}
          </div>
        </HeroMainCard>
      }
      inventory={
        <HeroInventoryCard
          iconName="work-order"
          eyebrow="Active Work Orders"
          value="248 WO"
          barLabel="On Schedule"
          barValue="92%"
          barPct={92}
        />
      }
      globe={
        <HeroGlobeCard iconName="schedule" eyebrow="Today's Line Targets">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {LINE_TARGETS.map((l) => (
              <div key={l.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#555" }}>{l.label}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "var(--bz-accent)" }}>
                    {l.pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "rgba(122,130,109,0.12)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${l.pct}%`,
                      background: "var(--bz-accent)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </HeroGlobeCard>
      }
      circle={<HeroCircleCard eyebrow="OEE Rate" value="87%" progressPct={75} />}
    />
  );
}

function HeroSection() {
  return (
    <HeroSplit
      badge={<HeroBadge>Smart Manufacturing Platform</HeroBadge>}
      title={
        <>
          Command the Floor.
          <br />
          <span className="text-bz-sage">Master</span> the Output.
        </>
      }
      description="Connect your BOMs, work orders, shop floor, and quality management into one intelligent command center. Drive throughput, cut waste, and hit every delivery date."
      actions={
        <>
          <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
          <Button variant="outline" size="lg">See How It Works</Button>
        </>
      }
      stats={[
        { value: "87.4%", label: "Average OEE" },
        { value: "96.2%", label: "On-Time Production" },
      ]}
      visual={<ManufacturingHeroVisual />}
    />
  );
}

// ─── Challenges ──────────────────────────────────────────────────────────────

function ChallengesSection() {
  return (
    <ChallengesGrid
      eyebrow="Challenges"
      title="Manufacturing complexity grows faster than your spreadsheets"
      description="Disconnected systems and reactive planning hold your factory back from its real throughput potential."
    >
      {/* 1 · Unplanned Downtime */}
      <ChallengeCard
        icon="downtime"
        title="Unplanned Downtime"
        description="Equipment failures and unscheduled stoppages disrupt production targets and cascade directly into customer delivery delays."
      >
        <div style={{ display: "flex", gap: 2, height: 14, marginBottom: 7 }}>
          {[8, 12, 2, 10, 1, 9, 2, 7, 3, 8, 1, 9].map((w, i) => {
            const isDown = [2, 4, 6, 10].includes(i);
            return (
              <div
                key={i}
                style={{
                  flex: w,
                  height: "100%",
                  borderRadius: 2,
                  background: isDown ? "#f87171" : "rgba(199,255,53,0.55)",
                  opacity: isDown ? 0.9 : 0.65,
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span
            style={{
              fontSize: 8,
              color: "var(--bz-sage)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: "rgba(199,255,53,0.55)",
                borderRadius: 2,
                display: "inline-block",
              }}
            />
            Running
          </span>
          <span style={{ fontSize: 8, color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: "#f87171",
                borderRadius: 2,
                display: "inline-block",
              }}
            />
            Downtime
          </span>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", marginLeft: "auto" }}>
            −14.2% OEE
          </span>
        </div>
      </ChallengeCard>

      {/* 2 · Manual Scheduling */}
      <ChallengeCard
        icon="edit-note"
        title="Manual Scheduling"
        description="Spreadsheet-based planning can't react to real-time floor changes, creating schedule variance that compounds across shifts."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            { label: "Planned", pct: 75, color: "rgba(122,130,109,0.4)" },
            { label: "Actual", pct: 97, color: "#f87171" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#999",
                  minWidth: 36,
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
                    width: `${Math.min(row.pct, 100)}%`,
                    background: row.color,
                    borderRadius: 3,
                  }}
                />
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, color: row.color }}>{row.pct}%</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              className="biz-pulse-glow"
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }}
            />
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: "var(--bz-sage)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              +29% Schedule Overrun
            </span>
          </div>
        </div>
      </ChallengeCard>

      {/* 3 · Late Quality Catches */}
      <ChallengeCard
        icon="defect"
        title="Late Quality Catches"
        description="Defects found at final inspection rather than inline cost 8× more to fix and erode customer confidence with every return."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { stage: "Cutting", rate: 1.1 },
            { stage: "Assembly", rate: 4.8 },
            { stage: "Final QC", rate: 11.6 },
          ].map((s) => {
            const color = s.rate > 7 ? "#f87171" : s.rate > 3 ? "#fbbf24" : "var(--bz-sage)";
            return (
              <div key={s.stage}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 8, color: "#888" }}>{s.stage}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color }}>{s.rate}%</span>
                </div>
                <div style={{ height: 5, background: "#f3f3f3", borderRadius: 99 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(s.rate / 14) * 100}%`,
                      background: color,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 3,
            }}
          >
            Downstream cost ×8
          </span>
        </div>
      </ChallengeCard>

      {/* 4 · Material Shortages */}
      <ChallengeCard
        icon="inventory"
        title="Material Shortages"
        description="Reactive purchasing without live MRP signals halts production lines when critical raw materials unexpectedly hit zero."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            { code: "RM-4021", level: 11, critical: true },
            { code: "RM-4022", level: 38, critical: false },
            { code: "RM-4031", level: 6, critical: true },
          ].map((m) => (
            <div key={m.code}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 8, fontFamily: "monospace", color: "#666" }}>{m.code}</span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: m.critical ? "#f87171" : "var(--bz-sage)",
                  }}
                >
                  {m.level}% {m.critical ? "⚠" : ""}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "#f3f3f3",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${m.level}%`,
                    background: m.critical ? "#f87171" : "var(--bz-sage)",
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
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
              2 Materials Critical
            </span>
          </div>
        </div>
      </ChallengeCard>

      {/* 5 · Disconnected Systems */}
      <ChallengeCard
        icon="hub"
        title="Disconnected Systems"
        description="Production, procurement, and finance operating off different data versions leads to costly miscommunication and duplicate work."
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            gap: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid rgba(122,130,109,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                background: "rgba(122,130,109,0.4)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", height: 2 }}>
            <div style={{ width: "100%", height: 1, background: "rgba(122,130,109,0.12)" }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              {[0, 0.5, 1].map((delay, i) => (
                <div
                  key={i}
                  className="biz-pulse-glow"
                  style={{
                    width: 4,
                    height: 4,
                    background: "var(--bz-accent)",
                    borderRadius: "50%",
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid rgba(199,255,53,0.6)",
              background: "rgba(199,255,53,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ width: 6, height: 6, background: "var(--bz-accent)", borderRadius: "50%" }} />
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "var(--bz-sage)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Unified Data Layer
          </span>
        </div>
      </ChallengeCard>

      {/* 6 · Hidden Cost Overruns */}
      <ChallengeCard
        icon="cost"
        title="Hidden Cost Overruns"
        description="Without real-time actual-vs-standard costing per work order, production losses only surface at month-end close — too late to act."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { cat: "Labour", std: 55, act: 70 },
            { cat: "Material", std: 78, act: 73 },
            { cat: "Overhead", std: 38, act: 56 },
          ].map((row) => (
            <div key={row.cat}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 8, color: "#888" }}>{row.cat}</span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: row.act > row.std ? "#f87171" : "var(--bz-sage)",
                  }}
                >
                  {row.act > row.std ? `+${row.act - row.std}% over` : "On budget"}
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 7,
                  background: "#f3f3f3",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${row.std}%`,
                    background: "rgba(122,130,109,0.28)",
                    borderRadius: 3,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${Math.min(row.act, 100)}%`,
                    background: row.act > row.std ? "rgba(248,113,113,0.55)" : "rgba(199,255,53,0.5)",
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChallengeCard>
    </ChallengesGrid>
  );
}

// ─── Solution ────────────────────────────────────────────────────────────────

const SOLUTIONS: SolutionItem[] = [
  {
    icon: "work-order",
    title: "Work Order Management",
    desc: "Create, schedule, and track production orders end-to-end with real-time status across every work center and shift.",
  },
  {
    icon: "bom",
    title: "Bill of Materials",
    desc: "Multi-level BOM with version control, automatic cost rollup, and configurable substitution rules for component shortages.",
  },
  {
    icon: "mrp",
    title: "MRP Automation",
    desc: "Demand-driven material planning that auto-generates time-phased purchase requests based on live production schedules.",
  },
  {
    icon: "floor",
    title: "Shop Floor Control",
    desc: "Real-time operator and machine status capture via barcode, QR, and mobile — no paper travellers, no manual entries.",
  },
  {
    icon: "quality",
    title: "Quality Management",
    desc: "Inline inspection checkpoints, defect logging, and QC hold workflows that prevent non-conformance from reaching the customer.",
  },
  {
    icon: "insights",
    title: "Cost Intelligence",
    desc: "Live actual-vs-standard cost analysis per order with variance breakdown across material, labour, and overhead in real time.",
  },
];

// ─── Capabilities ────────────────────────────────────────────────────────────

function CapabilitiesSection() {
  return (
    <CapabilitiesGrid
      eyebrow="Capabilities"
      title="Built for the precision demands of modern manufacturers."
    >
      {/* Row 1: Full-width Live Production Dashboard */}
      <CapabilityCard span={6} minHeight={260}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
          <MiniStatBlock
            value="248"
            label="Active Orders"
            secondary={[
              { value: "92%", label: "On-Time" },
              { value: "87.4%", label: "OEE" },
            ]}
          />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h4 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>
              Live Production Dashboard
            </h4>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Full visibility into every active work order, machine status, and production milestone
              from a single command screen.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Work Order", "Work Centre", "Progress", "Status"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.3)",
                        paddingBottom: 10,
                        textAlign: i > 1 ? "right" : "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { wo: "WO-2024-1204", wc: "M-01 Cutting", pct: 78, status: "running" },
                  { wo: "WO-2024-1205", wc: "M-02 Drilling", pct: 52, status: "running" },
                  { wo: "WO-2024-1206", wc: "M-03 Assembly", pct: 0, status: "queued" },
                ].map((row) => (
                  <tr key={row.wo} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td
                      style={{
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#fff",
                        padding: "10px 0",
                      }}
                    >
                      {row.wo}
                    </td>
                    <td
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.45)",
                        padding: "10px 0",
                      }}
                    >
                      {row.wc}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 60,
                            height: 4,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${row.pct}%`,
                              background: row.pct > 0 ? "var(--bz-accent)" : "transparent",
                              borderRadius: 99,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                          {row.pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background:
                            row.status === "running"
                              ? "rgba(199,255,53,0.12)"
                              : "rgba(255,255,255,0.06)",
                          color:
                            row.status === "running"
                              ? "var(--bz-accent)"
                              : "rgba(255,255,255,0.3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CapabilityCard>

      {/* Row 2: BOM & Routing | Quality Management */}
      <CapabilityCard span={3} minHeight={420}>
        <div>
          <h3>BOM &amp; Routing</h3>
          <p>
            Multi-level bill of materials with version control, cost rollup, and configurable
            routing operations per work center. Full substitution management included.
          </p>
        </div>
        <MonoTable
          headers={["COMPONENT", "QTY / UOM", "STATE"]}
          rows={[
            { values: ["RM-4021 Steel", "5.00 KG", "IN STOCK"], statusColor: "#4ade80" },
            { values: ["RM-4022 Bolt", "24 PCS", "LOW"], statusColor: "#fbbf24" },
            { values: ["RM-4031 Seal", "2 PCS", "IN STOCK"], statusColor: "#4ade80" },
          ]}
        />
      </CapabilityCard>

      <CapabilityCard span={3} minHeight={420}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h3>Quality Management</h3>
            <p>
              Inline inspection checkpoints at every operation. Defect classification, QC hold
              management, and first-pass yield tracking built into every work order.
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
            <Icon name="quality" size={24} />
          </div>
        </div>
        <MethodGrid
          items={[
            { label: "99.1%", sub: "First Pass" },
            { label: "0.3%", sub: "Scrap Rate" },
            { label: "100%", sub: "Traceability" },
          ]}
        />
      </CapabilityCard>

      {/* Row 3: MRP | Shop Floor (neon) | Cost Control */}
      <SimpleFeatureCard
        iconName="mrp"
        title="MRP Automation"
        body="Auto-generated purchase requests from live demand signals with configurable lead-time and safety-stock buffers."
        minHeight={260}
      />

      <SimpleFeatureCard
        iconName="floor"
        title="Shop Floor Control"
        body="Real-time operator and machine capture via barcode, QR, and mobile — no paper travellers, no manual entries."
        minHeight={260}
        neon
        cornerBadge="Live Tracking"
      />

      <SimpleFeatureCard
        iconName="cost"
        title="Cost Control"
        body="Actual-vs-standard variance per order, auto-posted to the general ledger. No month-end surprises."
        minHeight={260}
        progressPct={91}
      />
    </CapabilitiesGrid>
  );
}

// ─── Insights ────────────────────────────────────────────────────────────────

function ManufacturingChart() {
  return (
    <ChartFrame
      tooltip={{ title: "OEE: 87.4% ↑", subtitle: "+3.1% vs last quarter" }}
      glowSide="left"
    >
      <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" fill="none">
        <defs>
          <linearGradient id="mfgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* OEE trend line */}
        <path
          d="M0 155 C 50 145, 90 120, 140 105 S 220 80, 270 72 S 350 45, 400 38"
          stroke="var(--bz-sage)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 155 C 50 145, 90 120, 140 105 S 220 80, 270 72 S 350 45, 400 38 V 200 H 0 Z"
          fill="url(#mfgGrad)"
        />
        {/* Throughput dashed line */}
        <path
          d="M0 130 C 60 125, 110 140, 170 120 S 260 100, 320 95 S 380 70, 400 65"
          stroke="rgba(122,130,109,0.4)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <circle cx="270" cy="72" r="5" fill="var(--bz-accent)" stroke="var(--bz-sage)" strokeWidth="2" />
      </svg>
    </ChartFrame>
  );
}

// ─── Workflow ────────────────────────────────────────────────────────────────

const STEPS: WorkflowStep[] = [
  { icon: "bom", label: "Plan" },
  { icon: "source", label: "Source" },
  { icon: "floor", label: "Produce" },
  { icon: "inspect", label: "Inspect" },
  { icon: "package", label: "Package" },
  { icon: "truck", label: "Dispatch" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export function ManufacturingPage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <ChallengesSection />
        <SolutionGrid
          eyebrow="The Solution"
          title="A complete production platform for modern manufacturers"
          items={SOLUTIONS}
        />
        <CapabilitiesSection />
        <InsightsBlock
          eyebrow="Production Intelligence"
          title="Make faster, smarter production decisions."
          description="Stop firefighting the floor. Use real-time OEE dashboards and cost variance analytics to run your manufacturing operations with full confidence."
          bullets={[
            {
              bold: "Real-time OEE Monitoring",
              rest: " — Availability, performance, and quality in one live view.",
            },
            {
              bold: "First Pass Yield Tracking",
              rest: " — Know your defect rate before goods leave the line.",
            },
            {
              bold: "Work Order Cost Variance",
              rest: " — Actual vs. standard per order, auto-posted to GL.",
            },
          ]}
          chart={<ManufacturingChart />}
        />
        <WorkflowStrip
          eyebrow="Production Engine"
          title="End-to-End Manufacturing Workflow"
          steps={STEPS}
        />
        <IndustryCta
          title="Run your factory floor with complete precision."
          description="Join the next generation of manufacturers. Start your journey with Bizak and turn your production operations into a competitive advantage."
        />
      </main>
      <Footer />
    </div>
  );
}
