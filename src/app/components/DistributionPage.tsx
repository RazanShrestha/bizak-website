import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Icon } from "./marketing/Icon";
import {
  IndustryHero,
  HeroVisual,
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
  MonoTable,
  MethodGrid,
  InsightsBlock,
  ChartFrame,
  WorkflowStrip,
  type WorkflowStep,
  IndustryCta,
} from "./solutions/by-industry";

// ─── Hero ────────────────────────────────────────────────────────────────────

function DistributionHeroVisual() {
  return (
    <HeroVisual
      main={
        <div className="biz-card-main biz-glass biz-float">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
              <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
              <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
            </div>
            <div
              style={{ height: 14, width: 112, background: "rgba(122,130,109,0.1)", borderRadius: 99 }}
            />
          </div>
          <div className="biz-card-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="biz-skeleton-line" />
              <div className="biz-skeleton-line" style={{ width: "80%" }} />
              <div
                className="biz-skeleton-box"
                style={{
                  background: "rgba(122,130,109,0.05)",
                  border: "1px solid rgba(122,130,109,0.1)",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="biz-skeleton-line" />
              <div className="biz-skeleton-line" style={{ width: "75%" }} />
              <div
                className="biz-skeleton-box"
                style={{
                  background: "rgba(199,255,53,0.08)",
                  border: "1px solid rgba(199,255,53,0.18)",
                }}
              />
            </div>
          </div>
        </div>
      }
      inventory={
        <HeroInventoryCard
          iconName="inventory"
          eyebrow="Live Inventory"
          value="14,204 SKU"
          barLabel="In Stock"
          barValue="88%"
          barPct={88}
        />
      }
      globe={
        <HeroGlobeCard iconName="globe" eyebrow="Global Shipments">
          <div
            style={{
              position: "relative",
              height: 80,
              background: "rgba(232,234,228,0.3)",
              borderRadius: 8,
              border: "1px solid rgba(232,234,228,0.5)",
              overflow: "hidden",
            }}
          >
            <svg
              style={{ position: "absolute", inset: 0, opacity: 0.2 }}
              viewBox="0 0 200 80"
              fill="none"
            >
              <path
                d="M20,40 Q60,15 100,40 T180,40"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            {[
              { top: "50%", left: "25%", delay: "0s" },
              { top: "33%", left: "65%", delay: "0.5s" },
              { top: "65%", left: "50%", delay: "1s" },
            ].map((p, i) => (
              <div
                key={i}
                className="biz-data-dot biz-pulse-glow"
                style={{
                  top: p.top,
                  left: p.left,
                  animationDelay: p.delay,
                  transform: "translate(-50%,-50%)",
                }}
              />
            ))}
          </div>
        </HeroGlobeCard>
      }
      circle={<HeroCircleCard eyebrow="Warehouse Util." value="72%" progressPct={40} />}
    />
  );
}

function HeroSection() {
  return (
    <IndustryHero
      eyebrow="Unified Distribution Platform"
      title={
        <>
          ERP for Trading &amp;&nbsp;<span>Distribution</span> Companies
        </>
      }
      description="Consolidate your purchasing, warehouse inventory, and multi-channel sales into a single source of truth. Scale without the operational complexity."
      primaryCta={{ label: "Request Demo" }}
      secondaryCta={{ label: "See How It Works" }}
      stats={[
        { value: "99.9%", label: "Inventory Accuracy" },
        { value: "24/7", label: "Real-time Sync" },
      ]}
      visual={<DistributionHeroVisual />}
    />
  );
}

// ─── Challenges ──────────────────────────────────────────────────────────────

function ChallengesSection() {
  return (
    <ChallengesGrid
      eyebrow="Challenges"
      title="Distribution operations become complex as you grow"
      description="Legacy systems and fragmented processes can't keep up with the demands of modern scaling distributors."
    >
      {/* 1 · Stock Discrepancies */}
      <ChallengeCard
        icon="inventory"
        title="Stock Discrepancies"
        description="Mismatches between physical counts and system records lead to overselling and customer dissatisfaction."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              flex: 1,
              height: 6,
              background: "#f3f3f3",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #f87171, #fde68a, #7A826D)",
                width: "100%",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "var(--bz-sage)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            Correction Active
          </span>
        </div>
      </ChallengeCard>

      {/* 2 · Manual Tracking */}
      <ChallengeCard
        icon="edit-note"
        title="Manual Tracking"
        description="Reliance on spreadsheets creates bottlenecks and critical human error in daily data entry and verification."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Human Error Rate
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171" }}>High</span>
          </div>
          <div
            style={{
              height: 6,
              background: "#f3f3f3",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div style={{ height: "100%", background: "#f87171", width: "85%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div
              className="biz-pulse-glow"
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }}
            />
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--bz-sage)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Sync Pending
            </span>
          </div>
        </div>
      </ChallengeCard>

      {/* 3 · Fulfillment Delays */}
      <ChallengeCard
        icon="truck"
        title="Fulfillment Delays"
        description="Disconnected warehouse teams and archaic pick-lists slow down the pace of delivery to your customers."
      >
        <div style={{ position: "relative", height: 40, width: "100%", display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", width: "100%", height: 1, background: "#e5e7eb" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: "40%",
              height: 2,
              background: "#f87171",
              top: "calc(50% - 2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: "90%",
              height: 2,
              background: "rgba(199,255,53,0.6)",
              top: "calc(50% + 1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--bz-sage)",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "40%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f87171",
              top: "50%",
              transform: "translate(-50%,-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "5%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--bz-accent)",
              boxShadow: "0 0 8px var(--bz-accent)",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 0,
              left: "33%",
              fontSize: 8,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Delayed
          </span>
          <span
            style={{
              position: "absolute",
              bottom: 0,
              left: "58%",
              fontSize: 8,
              fontWeight: 700,
              color: "var(--bz-sage)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Bizak Optimized
          </span>
        </div>
      </ChallengeCard>

      {/* 4 · Visibility Gap */}
      <ChallengeCard
        icon="eye-off"
        title="Visibility Gap"
        description="Inability to track goods in transit or multi-location stock levels in real-time results in inefficient ordering."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              position: "relative",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              className="biz-radar-ping"
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(199,255,53,0.12)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                background: "var(--bz-accent)",
                borderRadius: "50%",
                boxShadow: "0 0 8px var(--bz-accent)",
                position: "relative",
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 4,
                height: 4,
                background: "rgba(122,130,109,0.4)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 14,
                width: 4,
                height: 4,
                background: "rgba(122,130,109,0.4)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--bz-sage)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Warehouse Radar
            </div>
            <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
              Illuminating Blind Spots
            </div>
          </div>
        </div>
      </ChallengeCard>

      {/* 5 · Siloed Data */}
      <ChallengeCard
        icon="hub"
        title="Siloed Data"
        description="Purchasing and Sales teams working off different versions of truth across your multi-branch locations."
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, height: 44 }}>
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
            <div style={{ width: "100%", height: 1, background: "rgba(122,130,109,0.15)" }} />
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
            Data Ingestion
          </span>
        </div>
      </ChallengeCard>

      {/* 6 · Compliance Risk */}
      <ChallengeCard
        icon="shield"
        title="Compliance Risk"
        description="Difficulties tracking lot numbers, expiry dates, and required regulatory paperwork as volume increases."
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: 44, height: 44 }}>
            <svg
              style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
              viewBox="0 0 48 48"
            >
              <circle cx="24" cy="24" r="18" fill="transparent" stroke="#f3f3f3" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="transparent"
                stroke="#f87171"
                strokeWidth="4"
                strokeDasharray="113"
                strokeDashoffset="40"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171" }}>65%</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#f87171",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Regulatory Check
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                className="biz-pulse-glow"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--bz-accent)",
                  boxShadow: "0 0 8px var(--bz-accent)",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--bz-sage)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Audit Ready
              </span>
            </div>
          </div>
        </div>
      </ChallengeCard>
    </ChallengesGrid>
  );
}

// ─── Solution ────────────────────────────────────────────────────────────────

const SOLUTIONS: SolutionItem[] = [
  {
    icon: "warehouse",
    title: "Centralized Inventory",
    desc: "Real-time visibility across all warehouses, transit hubs, and retail points in a single dashboard.",
  },
  {
    icon: "cart",
    title: "Efficient Purchasing",
    desc: "Automate replenishment based on lead times and demand forecasts to optimize cash flow.",
  },
  {
    icon: "bolt",
    title: "Faster Fulfillment",
    desc: "Integrated picking, packing, and shipping workflows with direct carrier connections for speed.",
  },
  {
    icon: "settings",
    title: "Warehouse Control",
    desc: "Sophisticated bin management and barcode scanning for 99.9% inventory accuracy levels.",
  },
  {
    icon: "insights",
    title: "Financial Visibility",
    desc: "Real-time P&L per SKU, including accurate landed costs and multi-currency conversions.",
  },
  {
    icon: "account-tree",
    title: "Multi-branch Sync",
    desc: "Manage global entities with ease, keeping local compliance and global reporting perfectly aligned.",
  },
];

// ─── Capabilities ────────────────────────────────────────────────────────────

function CapabilitiesSection() {
  return (
    <CapabilitiesGrid
      eyebrow="Capabilities"
      title="Built for the operational demands of distributors."
    >
      {/* Row 1: Batch & Lot | Pick & Pack */}
      <CapabilityCard span={3} minHeight={440}>
        <div>
          <h3>Batch &amp; Lot Tracking</h3>
          <p>
            Full traceability from manufacturer to end customer. Perfect for food, chemical, or
            electronics distribution where provenance is critical.
          </p>
        </div>
        <MonoTable
          headers={["BATCH_ID", "EXP_DATE", "STATUS"]}
          rows={[
            { values: ["#B-2024-001", "2025-12-30", "PASSED"], statusColor: "#4ade80" },
            { values: ["#B-2024-002", "2026-04-15", "PENDING"], statusColor: "#fbbf24" },
          ]}
        />
      </CapabilityCard>

      <CapabilityCard span={3} minHeight={440}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h3>Pick &amp; Pack Rules</h3>
            <p>
              FIFO, FEFO, or LIFO automated routing. Optimize warehouse floor walk paths and
              expiration management.
            </p>
          </div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(199,255,53,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bz-accent)",
              flexShrink: 0,
            }}
          >
            <Icon name="list" size={26} />
          </div>
        </div>
        <MethodGrid
          items={[
            { label: "FIFO", sub: "First In" },
            { label: "FEFO", sub: "Expiry" },
            { label: "LIFO", sub: "Last In" },
          ]}
        />
      </CapabilityCard>

      {/* Row 2: Stock Transfers | Low Stock (neon) | Unit Conversions */}
      <SimpleFeatureCard
        iconName="sync"
        title="Stock Transfers"
        body="Inter-warehouse logistics and inventory balancing across entities with ease."
        minHeight={260}
      />
      <SimpleFeatureCard
        iconName="bell"
        title="Low Stock Alerts"
        body="Automated reorder triggers synchronized with supplier lead times."
        minHeight={260}
        neon
        cornerBadge="High Priority"
      />
      <SimpleFeatureCard
        iconName="package"
        title="Unit Conversions"
        body="Buy in pallets, sell in units, track in kilograms effortlessly."
        minHeight={260}
        progressPct={66}
      />

      {/* Row 3: Full-width Inventory Precision */}
      <CapabilityCard span={6}>
        <div className="biz-precision-card">
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div>
              <div className="biz-mini-stat">99.8%</div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 6,
                }}
              >
                Accuracy
              </p>
            </div>
            <div style={{ maxWidth: 400 }}>
              <h4 style={{ fontWeight: 700, fontSize: 19, color: "#fff", marginBottom: 8 }}>
                Inventory Precision
              </h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                Our enterprise customers maintain near-perfect inventory levels through automated
                reconciliation and digital cycle counting.
              </p>
            </div>
          </div>
          <button className="biz-read-btn">Read Audit Report</button>
        </div>
      </CapabilityCard>
    </CapabilitiesGrid>
  );
}

// ─── Insights ────────────────────────────────────────────────────────────────

function DistributionChart() {
  return (
    <ChartFrame
      tooltip={{ title: "PROFIT MARGIN: 24.2%", subtitle: "↑ 2.4% vs last month" }}
      glowSide="right"
    >
      <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" fill="none">
        <path
          d="M0 150 C 50 140, 100 80, 150 100 S 250 20, 400 50"
          stroke="var(--bz-sage)"
          strokeWidth="3"
        />
        <path
          d="M0 150 C 50 140, 100 80, 150 100 S 250 20, 400 50 V 200 H 0 Z"
          fill="rgba(122,130,109,0.05)"
        />
        <circle cx="150" cy="100" r="5" fill="var(--bz-accent)" stroke="var(--bz-sage)" strokeWidth="2" />
      </svg>
    </ChartFrame>
  );
}

// ─── Workflow ────────────────────────────────────────────────────────────────

const STEPS: WorkflowStep[] = [
  { icon: "payments", label: "Purchase" },
  { icon: "inbox", label: "Receive" },
  { icon: "gps", label: "Track" },
  { icon: "manufacturing", label: "Process" },
  { icon: "truck", label: "Ship" },
  { icon: "invoice", label: "Invoice" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export function DistributionPage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <ChallengesSection />
        <SolutionGrid
          eyebrow="The Solution"
          title="A complete operational platform for modern distributors"
          items={SOLUTIONS}
        />
        <CapabilitiesSection />
        <InsightsBlock
          eyebrow="Strategic Insights"
          title="Make faster, smarter operational decisions."
          description="Stop guessing. Use real-time demand forecasting and profit margin analytics to steer your distribution business with confidence."
          bullets={[
            { bold: "Demand Forecasting", rest: " — AI-driven stock prediction." },
            { bold: "Real-time Margin Tracking", rest: " — Profitability per order." },
          ]}
          chart={<DistributionChart />}
        />
        <WorkflowStrip
          eyebrow="Optimization Engine"
          title="End-to-End Distribution Workflow"
          steps={STEPS}
        />
        <IndustryCta
          title="Run your distribution business with complete control."
          description="Join the next generation of global traders. Start your journey with Bizak today and eliminate the complexity."
        />
      </main>
      <Footer />
    </div>
  );
}
