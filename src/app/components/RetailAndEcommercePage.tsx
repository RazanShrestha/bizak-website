import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Icon } from "./marketing/Icon";
import {
  IndustryHero,
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
  FeatureWithMockupCard,
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

const CHANNELS = [
  { code: "WEB", label: "Storefront", value: "54%", active: true, icon: "globe" },
  { code: "MOB", label: "Mobile App", value: "31%", active: true, icon: "smartphone" },
  { code: "MKT", label: "Marketplace", value: "15%", active: true, icon: "layers" },
];

const RECENT_ORDERS = [
  { id: "#ORD-9841", item: "Leather Bag", amt: "$129", status: "paid", color: "#C7FF35" },
  { id: "#ORD-9842", item: "Sneakers XR-7", amt: "$89", status: "processing", color: "#fbbf24" },
  { id: "#ORD-9843", item: "Wireless Buds", amt: "$64", status: "shipped", color: "#60a5fa" },
];

function RetailHeroVisual() {
  return (
    <HeroVisual
      main={
        <HeroMainCard panelTitle="Bizak · Retail Hub">
          {/* Channel nodes with sync line */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <svg
              style={{
                position: "absolute",
                top: "38%",
                left: "16%",
                width: "68%",
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
                stroke="rgba(122,130,109,0.12)"
                strokeWidth="1.5"
              />
              {[80, 160, 240].map((x, i) => (
                <circle key={i} cx={x} cy="1" r="3" fill="var(--bz-accent)" opacity="0.7">
                  <animate
                    attributeName="cx"
                    values={`${x - 80};${x + 80}`}
                    dur={`${1.6 + i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0"
                    dur={`${1.6 + i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </svg>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
              {CHANNELS.map((ch) => (
                <Node
                  key={ch.code}
                  icon={ch.icon}
                  code={ch.code}
                  label={ch.label}
                  value={ch.value}
                  active={ch.active}
                  inactiveDotColor="rgba(122,130,109,0.35)"
                />
              ))}
            </div>
          </div>

          {/* Recent order rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              paddingTop: 10,
              borderTop: "1px solid rgba(122,130,109,0.1)",
            }}
          >
            {RECENT_ORDERS.map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: "monospace",
                    color: "rgba(122,130,109,0.7)",
                    minWidth: 72,
                  }}
                >
                  {o.id}
                </span>
                <span style={{ fontSize: 8, color: "#aaa", flex: 1 }}>{o.item}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#444" }}>{o.amt}</span>
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background:
                      o.color === "#C7FF35"
                        ? "rgba(199,255,53,0.12)"
                        : o.color === "#60a5fa"
                        ? "rgba(96,165,250,0.1)"
                        : "rgba(251,191,36,0.1)",
                    color: o.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </HeroMainCard>
      }
      inventory={
        <HeroInventoryCard
          iconName="bar"
          eyebrow="Today's Revenue"
          value="$48,320"
          barLabel="vs. Yesterday"
          barValue="+18.4%"
          barPct={72}
        />
      }
      globe={
        <HeroGlobeCard iconName="funnel" eyebrow="Conversion Funnel">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Visitors", pct: 100, abs: "12.4k" },
              { label: "Add to Cart", pct: 38, abs: "4.7k" },
              { label: "Checkout", pct: 19, abs: "2.3k" },
              { label: "Purchased", pct: 11, abs: "1.4k" },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 7, color: "#666" }}>{f.label}</span>
                  <span style={{ fontSize: 7, fontWeight: 700, color: "#555" }}>{f.abs}</span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "rgba(122,130,109,0.10)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${f.pct}%`,
                      background: f.pct === 100 ? "rgba(122,130,109,0.25)" : "var(--bz-accent)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </HeroGlobeCard>
      }
      circle={<HeroCircleCard eyebrow="Conv. Rate" value="11%" progressPct={22} />}
    />
  );
}

function HeroSection() {
  return (
    <IndustryHero
      eyebrow="Unified Retail & Ecommerce ERP"
      title={
        <>
          Sell Everywhere.
          <br />
          <span>Fulfil</span> Flawlessly.
        </>
      }
      description="Connect your storefront, marketplace, inventory, and fulfilment into one intelligent retail command center. Drive conversions, eliminate stockouts, and delight every customer — across every channel."
      primaryCta={{ label: "Request Demo" }}
      secondaryCta={{ label: "See How It Works" }}
      stats={[
        { value: "3.8×", label: "Faster Fulfilment" },
        { value: "99.1%", label: "Inventory Accuracy" },
      ]}
      visual={<RetailHeroVisual />}
    />
  );
}

// ─── Challenges ──────────────────────────────────────────────────────────────

function ChallengesSection() {
  return (
    <ChallengesGrid
      eyebrow="Challenges"
      title="Retail is faster than your legacy systems can handle"
      description="Fragmented channels, siloed data, and reactive inventory management leave revenue on the table every single day."
    >
      {/* 1 · Cart Abandonment */}
      <ChallengeCard
        icon="funnel"
        title="Cart Abandonment"
        description="Over 70% of shoppers leave before purchasing. Without behavioral triggers and recovery flows, that revenue never returns."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { stage: "Add to Cart", pct: 100, w: "100%" },
            { stage: "Begin Checkout", pct: 48, w: "48%" },
            { stage: "Payment Info", pct: 29, w: "29%" },
            { stage: "Purchased", pct: 11, w: "11%" },
          ].map((f) => (
            <div key={f.stage} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 7, color: "#888", minWidth: 78 }}>{f.stage}</span>
              <div
                style={{
                  flex: 1,
                  height: 5,
                  background: "#f3f3f3",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: f.w,
                    background:
                      f.pct < 30 ? "#f87171" : f.pct < 60 ? "#fbbf24" : "rgba(122,130,109,0.45)",
                    borderRadius: 99,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  color: f.pct < 30 ? "#f87171" : "#888",
                }}
              >
                {f.pct}%
              </span>
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
            89% lost at cart
          </span>
        </div>
      </ChallengeCard>

      {/* 2 · Oversells & Stockouts */}
      <ChallengeCard
        icon="alert"
        title="Oversells & Stockouts"
        description="Selling from separate inventory pools per channel means the same SKU gets oversold online while warehouse stock sits untouched."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            { sku: "SKU-2201", ch: "Web", stock: 0, critical: true },
            { sku: "SKU-2201", ch: "Mobile", stock: 14, critical: false },
            { sku: "SKU-2201", ch: "Mkt.", stock: 0, critical: true },
          ].map((r, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 8, fontFamily: "monospace", color: "#666" }}>
                  {r.sku} · {r.ch}
                </span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: r.critical ? "#f87171" : "var(--bz-sage)",
                  }}
                >
                  {r.stock === 0 ? "OUT ⚠" : `${r.stock} units`}
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
                    width: r.critical ? "4%" : "58%",
                    background: r.critical ? "#f87171" : "var(--bz-sage)",
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 2,
            }}
          >
            Desync across channels
          </span>
        </div>
      </ChallengeCard>

      {/* 3 · Slow Order Fulfilment */}
      <ChallengeCard
        icon="truck"
        title="Slow Order Fulfilment"
        description="Manual pick-pack-ship workflows with no routing intelligence mean orders miss SLA windows and customers leave negative reviews."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            { label: "SLA Target", pct: 60, color: "rgba(122,130,109,0.4)" },
            { label: "Avg. Actual", pct: 94, color: "#f87171" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#999",
                  minWidth: 60,
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
              <span style={{ fontSize: 8, fontWeight: 700, color: row.color }}>{row.pct}h</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
              +57% SLA Breach Rate
            </span>
          </div>
        </div>
      </ChallengeCard>

      {/* 4 · Fragmented Channels */}
      <ChallengeCard
        icon="layers"
        title="Fragmented Channels"
        description="Web store, mobile app, and marketplace running on separate platforms means pricing, promotions, and inventory never align."
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            gap: 0,
          }}
        >
          {["Web", "Mkt", "App"].map((node, i) => (
            <div
              key={node}
              style={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "center" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(122,130,109,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      background: "rgba(122,130,109,0.35)",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <span style={{ fontSize: 7, color: "#aaa" }}>{node}</span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(122,130,109,0.1)",
                    margin: "0 4px",
                    marginBottom: 12,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            No Unified Truth
          </span>
        </div>
      </ChallengeCard>

      {/* 5 · Returns Without Insight */}
      <ChallengeCard
        icon="repeat"
        title="Returns Without Insight"
        description="Processing returns manually with no root-cause data means the same defect reasons repeat, eroding margins and customer trust."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { cat: "Wrong size", rate: 38 },
            { cat: "Damaged", rate: 24 },
            { cat: "Not as described", rate: 19 },
            { cat: "Changed mind", rate: 12 },
          ].map((r) => (
            <div key={r.cat}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 8, color: "#888" }}>{r.cat}</span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: r.rate > 30 ? "#f87171" : "var(--bz-sage)",
                  }}
                >
                  {r.rate}%
                </span>
              </div>
              <div style={{ height: 4, background: "#f3f3f3", borderRadius: 99 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${r.rate * 2.2}%`,
                    background: r.rate > 30 ? "#f87171" : "rgba(122,130,109,0.45)",
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChallengeCard>

      {/* 6 · Zero Customer Visibility */}
      <ChallengeCard
        icon="users"
        title="Zero Customer Visibility"
        description="Without unified purchase history and CLV data, every campaign treats loyal customers the same as first-time buyers."
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 44 }}>
          {[
            { label: "New", h: 28, color: "rgba(122,130,109,0.3)", val: "$42" },
            { label: "1× Return", h: 44, color: "rgba(199,255,53,0.45)", val: "$118" },
            { label: "Loyal", h: 64, color: "var(--bz-accent)", val: "$310" },
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
              <span style={{ fontSize: 7, fontWeight: 700, color: "#555" }}>{b.val}</span>
              <div
                style={{ width: "100%", height: b.h, background: b.color, borderRadius: 4 }}
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
            CLV by Segment
          </span>
        </div>
      </ChallengeCard>
    </ChallengesGrid>
  );
}

// ─── Solution ────────────────────────────────────────────────────────────────

const SOLUTIONS: SolutionItem[] = [
  {
    icon: "cart",
    title: "Omnichannel Order Mgmt",
    desc: "Capture, route, and process orders from every channel in one unified queue — web, mobile app, marketplace, and POS.",
  },
  {
    icon: "layers",
    title: "Real-Time Inventory Sync",
    desc: "One inventory pool across all channels with live reservation, threshold alerts, and automatic reorder point triggers.",
  },
  {
    icon: "receipt",
    title: "POS Billing",
    desc: "Touch-screen billing for retail chains and standalone stores. Multi-payment, barcode scan, loyalty redemption, and end-of-day cash reconciliation — all in one terminal.",
  },
  {
    icon: "tag",
    title: "Product Catalog Engine",
    desc: "Centrally manage SKUs, variants, pricing rules, and promotions. Publish to all channels with a single update.",
  },
  {
    icon: "users",
    title: "Customer & Loyalty CRM",
    desc: "Unified customer profiles with full purchase history, CLV scoring, segmentation, and loyalty point engine built in.",
  },
  {
    icon: "truck",
    title: "Smart Fulfilment Routing",
    desc: "Automatically assign orders to the optimal warehouse or store based on stock proximity, carrier SLAs, and cost.",
  },
  {
    icon: "bar",
    title: "Revenue Intelligence",
    desc: "Real-time GMV, conversion funnel, margin by SKU, and channel attribution — all in one live analytics layer.",
  },
];

// ─── Capabilities ────────────────────────────────────────────────────────────

function POSMockupBody() {
  return (
    <div style={{ padding: "12px 16px" }}>
      {[
        { item: "Leather Bag", qty: "×1", amt: "$129.00" },
        { item: "Sneakers XR-7", qty: "×2", amt: "$178.00" },
        { item: "Wireless Buds", qty: "×1", amt: "$64.00" },
      ].map((r) => (
        <div
          key={r.item}
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
              {r.item}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{r.qty}</div>
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
            {r.amt}
          </span>
        </div>
      ))}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Subtotal</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>$371.00</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Tax (13%)</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>$48.23</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 8,
            borderTop: "1px solid rgba(199,255,53,0.2)",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Total</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bz-accent)" }}>$419.23</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 14 }}>
        {["Cash", "Card", "UPI", "Split"].map((m, i) => (
          <div
            key={m}
            style={{
              padding: "7px 0",
              borderRadius: 7,
              textAlign: "center",
              background: i === 1 ? "var(--bz-accent)" : "rgba(255,255,255,0.06)",
              border: i === 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
              fontSize: 10,
              fontWeight: 700,
              color: i === 1 ? "var(--bz-deep)" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function CapabilitiesSection() {
  return (
    <CapabilitiesGrid
      eyebrow="Capabilities"
      title="Built for the speed and scale of modern retail."
    >
      {/* Full-width Live Order Dashboard */}
      <CapabilityCard span={6} minHeight={260}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
          <MiniStatBlock
            value="1,847"
            label="Orders Today"
            secondary={[
              { value: "$48.3k", label: "GMV" },
              { value: "11.2%", label: "CVR" },
            ]}
          />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h4 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>
              Live Order Dashboard
            </h4>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Full visibility into every order across every channel — status, fulfilment stage,
              carrier, and customer — in one unified command screen.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Order", "Channel", "Total", "Status"].map((h, i) => (
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
                  { id: "#ORD-9841", ch: "Web Store", amt: "$129", status: "paid" },
                  { id: "#ORD-9842", ch: "Mobile App", amt: "$89", status: "picking" },
                  { id: "#ORD-9843", ch: "Marketplace", amt: "$64", status: "shipped" },
                ].map((row) => {
                  const statusColor =
                    row.status === "paid"
                      ? "var(--bz-accent)"
                      : row.status === "shipped"
                      ? "#60a5fa"
                      : "#fbbf24";
                  const statusBg =
                    row.status === "paid"
                      ? "rgba(199,255,53,0.12)"
                      : row.status === "shipped"
                      ? "rgba(96,165,250,0.12)"
                      : "rgba(251,191,36,0.1)";
                  return (
                    <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td
                        style={{
                          fontSize: 11,
                          fontFamily: "monospace",
                          color: "#fff",
                          padding: "10px 0",
                        }}
                      >
                        {row.id}
                      </td>
                      <td
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.45)",
                          padding: "10px 0",
                        }}
                      >
                        {row.ch}
                      </td>
                      <td
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.6)",
                          padding: "10px 0",
                          textAlign: "right",
                        }}
                      >
                        {row.amt}
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: statusBg,
                            color: statusColor,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CapabilityCard>

      {/* Product Catalog */}
      <CapabilityCard span={3} minHeight={400}>
        <div>
          <h3>Product Catalog &amp; Pricing</h3>
          <p>
            Centralised SKU management with variant support, multi-currency pricing, promotional
            rules, and channel-specific overrides — all from a single place.
          </p>
        </div>
        <MonoTable
          headers={["SKU", "STOCK", "PRICE"]}
          rows={[
            { values: ["BAG-LTH-BLK", "48 units", "$129"], statusColor: "#4ade80" },
            { values: ["SNK-XR7-RED", "3 units", "$89"], statusColor: "#fbbf24" },
            { values: ["WRL-BUD-WHT", "120 units", "$64"], statusColor: "#4ade80" },
          ]}
        />
      </CapabilityCard>

      {/* Customer 360 */}
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
            <h3>Customer 360</h3>
            <p>
              Unified profiles with lifetime purchase history, CLV score, loyalty tier, and
              segmentation tags — enabling personalised campaigns and retention flows.
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
            <Icon name="users" size={24} />
          </div>
        </div>
        <MethodGrid
          items={[
            { label: "$310", sub: "Avg CLV" },
            { label: "4.2×", sub: "Repeat Rate" },
            { label: "94%", sub: "Satisfaction" },
          ]}
        />
      </CapabilityCard>

      {/* POS Billing — full-width feature with mockup */}
      <FeatureWithMockupCard
        iconName="monitor"
        eyebrow="Point of Sale"
        title="POS Billing"
        description="A beautiful, fast billing terminal built for retail chains and standalone stores. Scan, bill, and close a sale in seconds — with every transaction feeding directly into inventory, accounts, and customer profiles."
        features={[
          { icon: "receipt", text: "Itemised billing with barcode & QR scan — zero manual entry" },
          { icon: "credit-card", text: "Cash, card, UPI, wallet, split-pay & loyalty point redemption" },
          { icon: "users", text: "Customer lookup, loyalty earn/burn, and purchase history at checkout" },
          { icon: "bar", text: "End-of-day cash reconciliation, shift reports, and variance alerts" },
        ]}
        mockupHeader={{ title: "Bizak POS", rightLabel: "Terminal 01" }}
        mockupBody={<POSMockupBody />}
        mockupBadges={[
          { val: "342", lbl: "Txns today" },
          { val: "$89", lbl: "Avg basket" },
        ]}
        mockupWidth={260}
        neon
      />

      {/* Row of three simple cards */}
      <SimpleFeatureCard
        iconName="globe"
        title="Omnichannel Sync"
        body="Inventory, pricing, and promotions propagate to all channels the instant you make a change — zero lag, zero divergence."
        minHeight={240}
        neon
        cornerBadge="Real-Time"
      />
      <SimpleFeatureCard
        iconName="zap"
        title="Smart Fulfilment"
        body="Auto-route each order to the closest stocked location with optimal carrier selection and cost-vs-speed trade-off engine."
        minHeight={240}
      />
      <SimpleFeatureCard
        iconName="repeat"
        title="Returns Automation"
        body="One-click return portal, automated restocking workflows, refund processing, and return reason analytics built in."
        minHeight={240}
        progressPct={88}
        progressLabel="88% auto-resolved"
      />
    </CapabilitiesGrid>
  );
}

// ─── Insights ────────────────────────────────────────────────────────────────

function RetailChart() {
  return (
    <ChartFrame
      tooltip={{ title: "GMV: $48,320 ↑", subtitle: "+18.4% vs yesterday" }}
      glowSide="right"
    >
      <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" fill="none">
        <defs>
          <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 170 C 40 155, 80 140, 120 118 S 200 90, 240 72 S 320 48, 400 32"
          stroke="var(--bz-sage)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 170 C 40 155, 80 140, 120 118 S 200 90, 240 72 S 320 48, 400 32 V 200 H 0 Z"
          fill="url(#retailGrad)"
        />
        <path
          d="M0 148 C 50 142, 100 155, 160 130 S 250 105, 310 98 S 370 75, 400 68"
          stroke="rgba(122,130,109,0.38)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <circle cx="240" cy="72" r="5" fill="var(--bz-accent)" stroke="var(--bz-sage)" strokeWidth="2" />
        <line
          x1="240"
          y1="72"
          x2="240"
          y2="40"
          stroke="rgba(199,255,53,0.3)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text x="245" y="38" fontSize="8" fill="var(--bz-sage)">
          Flash Sale
        </text>
      </svg>
    </ChartFrame>
  );
}

// ─── Workflow ────────────────────────────────────────────────────────────────

const STEPS: WorkflowStep[] = [
  { icon: "search", label: "Browse" },
  { icon: "cart", label: "Cart" },
  { icon: "credit-card", label: "Checkout" },
  { icon: "zap", label: "Fulfil" },
  { icon: "truck", label: "Deliver" },
  { icon: "star", label: "Review" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export function RetailAndEcommercePage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <ChallengesSection />
        <SolutionGrid
          eyebrow="The Solution"
          title="A complete retail platform for every channel, every customer"
          items={SOLUTIONS}
        />
        <CapabilitiesSection />
        <InsightsBlock
          eyebrow="Revenue Intelligence"
          title="Know what's selling, what's stalling, and why."
          description="Stop guessing from weekly exports. Bizak surfaces live GMV trends, channel attribution, margin by SKU, and conversion drivers so you can act within minutes, not days."
          bullets={[
            {
              bold: "Channel Attribution",
              rest: " — See exactly which channel drove each sale and its true margin.",
            },
            {
              bold: "Conversion Funnel",
              rest: " — Pinpoint drop-off stages and trigger automated recovery flows.",
            },
            {
              bold: "SKU-Level Profitability",
              rest: " — Live landed cost vs. selling price with return adjustments.",
            },
          ]}
          chart={<RetailChart />}
        />
        <WorkflowStrip
          eyebrow="Order Lifecycle"
          title="From First Click to Five-Star Review"
          steps={STEPS}
        />
        <IndustryCta
          title="Sell smarter across every channel."
          description="Unify your retail operations with Bizak and turn every touchpoint into a seamless, profitable customer experience."
        />
      </main>
      <Footer />
    </div>
  );
}
