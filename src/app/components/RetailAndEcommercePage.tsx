import "../../styles/style.css";
import { Header } from "./Header";
import { Icon } from "./marketing/Icon";
import {
  Section,
  Container,
  SectionHeading,
  Card,
  Eyebrow,
  PillBadge,
  IconBadge,
  Button,
} from "./marketing";
import {
  Search,
  ShoppingCart,
  CreditCard,
  Zap,
  Truck,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
} from "./solutions/by-industry";
// Experimental: light-themed CTA + light footer for this page only.
// If approved, promote to shared primitives + update docs/skills/memory.
import bizakLogo from "../../assets/bizaklogo.png";
import svgPaths from "../../imports/svg-eyvfmiiac4";

// ─── Hero ────────────────────────────────────────────────────────────────────

const CHANNELS = [
  { code: "WEB", label: "Storefront", value: "54%", active: true, icon: "globe" },
  { code: "MOB", label: "Mobile App", value: "31%", active: true, icon: "smartphone" },
  { code: "MKT", label: "Marketplace", value: "15%", active: true, icon: "layers" },
];

const RECENT_ORDERS: Array<{
  id: string;
  item: string;
  amt: string;
  status: "paid" | "processing" | "shipped";
}> = [
  { id: "#ORD-9841", item: "Leather Bag", amt: "$129", status: "paid" },
  { id: "#ORD-9842", item: "Sneakers XR-7", amt: "$89", status: "processing" },
  { id: "#ORD-9843", item: "Wireless Buds", amt: "$64", status: "shipped" },
];

const ORDER_STATUS_STYLES: Record<
  "paid" | "processing" | "shipped",
  { bg: string; color: string }
> = {
  paid:       { bg: "rgba(199,255,53,0.12)",  color: "#C7FF35" },
  processing: { bg: "rgba(251,191,36,0.10)",  color: "#fbbf24" },
  shipped:    { bg: "rgba(96,165,250,0.10)",  color: "#60a5fa" },
};

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
            {RECENT_ORDERS.map((o) => {
              const tone = ORDER_STATUS_STYLES[o.status];
              return (
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
                      background: tone.bg,
                      color: tone.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {o.status}
                  </span>
                </div>
              );
            })}
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

// ─── Revenue Intelligence — creative redesign ────────────────────────────────
//   Replaces the legacy InsightsBlock with a 3-row "Live Retail Cockpit" bento:
//     Row 1: 4-up KPI strip
//     Row 2: GMV-by-channel chart (col-7) + Channel-mix donut (col-5)
//     Row 3: Conversion funnel (col-5) + Top SKUs by margin (col-7)
function RevenueIntelligenceSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Revenue Intelligence"
          title={
            <>
              Know what's selling, what's stalling,
              <br />
              <span className="text-bz-sage">and why.</span>
            </>
          }
          description="Stop guessing from weekly exports. Bizak surfaces live GMV, channel attribution, conversion drivers and SKU-level margin — so you can act within minutes, not days."
          maxWidth={780}
          className="mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <KPIStripCard />
          <GmvChannelChartCard />
          <ChannelMixDonutCard />
          <ConversionFunnelCard />
          <TopSkuMarginCard />
        </div>
      </Container>
    </Section>
  );
}

type Kpi = {
  eyebrow: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  intent: "good" | "bad";
};

function KPIStripCard() {
  const kpis: Kpi[] = [
    { eyebrow: "GMV TODAY",   value: "$48.3K", delta: "+18.4%",  trend: "up",   intent: "good" },
    { eyebrow: "CONVERSION",  value: "11.2%",  delta: "+1.4 pts",trend: "up",   intent: "good" },
    { eyebrow: "AVG ORDER",   value: "$89",    delta: "+6.0%",   trend: "up",   intent: "good" },
    { eyebrow: "RETURN RATE", value: "4.2%",   delta: "−0.8 pts",trend: "down", intent: "good" },
  ];
  return (
    <Card pad="lg" className="lg:col-span-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Eyebrow>Live KPIs</Eyebrow>
          <span className="text-[11px] text-bz-text-soft">· today, auto-refreshing</span>
        </div>
        <PillBadge tone="accent" dot>
          LIVE
        </PillBadge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 divide-y md:divide-y-0 md:divide-x divide-bz-border-soft">
        {kpis.map((k, i) => (
          <div key={k.eyebrow} className={["px-0 md:px-6", i === 0 && "md:pl-0"].filter(Boolean).join(" ")}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft mb-1.5">
              {k.eyebrow}
            </p>
            <p className="text-[clamp(26px,2.6vw,34px)] font-bold text-bz-text tracking-[-0.02em] tabular-nums leading-none">
              {k.value}
            </p>
            <KpiDeltaPill delta={k.delta} trend={k.trend} intent={k.intent} className="mt-3" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function KpiDeltaPill({
  delta,
  trend,
  intent,
  className,
}: {
  delta: string;
  trend: "up" | "down";
  intent: "good" | "bad";
  className?: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const tone =
    intent === "good"
      ? "bg-bz-sage-soft text-bz-sage"
      : "bg-rose-500/10 text-rose-500";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-bz-pill",
        "text-[10.5px] font-bold tabular-nums",
        tone,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <TrendIcon className="size-3" strokeWidth={2.4} />
      {delta}
    </span>
  );
}

function GmvChannelChartCard() {
  return (
    <Card pad="lg" className="lg:col-span-7">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <Eyebrow>GMV across channels</Eyebrow>
          <h3 className="text-[16px] font-bold text-bz-text mt-1.5">
            Today's revenue, broken down by channel
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { label: "24h", active: true },
            { label: "7d" },
            { label: "30d" },
          ].map((p) => (
            <span
              key={p.label}
              className={[
                "px-2.5 py-1 rounded-bz-pill text-[10.5px] font-bold uppercase tracking-[0.08em]",
                p.active
                  ? "bg-bz-text text-white"
                  : "bg-bz-bg text-bz-text-muted border border-bz-border",
              ].join(" ")}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-bz-lg bg-bz-bg border border-bz-border-soft p-5">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {[
            { label: "Storefront",  color: "var(--bz-sage)",   value: "$26.1k" },
            { label: "Mobile App",  color: "var(--bz-accent)", value: "$15.0k" },
            { label: "Marketplace", color: "#94a3b8",          value: "$5.8k"  },
          ].map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5 text-[11px]">
              <span
                className="size-2 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-bz-text-muted">{s.label}</span>
              <span className="font-bold tabular-nums text-bz-text">{s.value}</span>
            </span>
          ))}
        </div>

        <div className="relative h-[180px]">
          <svg
            viewBox="0 0 400 180"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* horizontal grid lines */}
            {[40, 80, 120, 160].map((y) => (
              <line
                key={y}
                x1="0"
                x2="400"
                y1={y}
                y2={y}
                stroke="var(--bz-border-soft)"
                strokeWidth="1"
              />
            ))}
            {/* Marketplace */}
            <path
              d="M0,150 C40,148 80,142 120,138 S200,128 240,118 S320,108 400,98"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Mobile App */}
            <path
              d="M0,130 C40,118 80,108 120,98 S200,84 240,68 S320,52 400,42"
              fill="none"
              stroke="var(--bz-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Storefront (primary, with flash-sale spike) */}
            <path
              d="M0,110 C30,98 60,88 90,76 C120,64 140,40 160,28 C180,42 200,56 240,52 C280,48 320,38 400,22"
              fill="none"
              stroke="var(--bz-sage)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Flash sale annotation marker */}
            <circle cx="160" cy="28" r="4.5" fill="var(--bz-accent)" stroke="var(--bz-sage)" strokeWidth="2" />
            <line x1="160" y1="28" x2="160" y2="6" stroke="var(--bz-sage)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          </svg>

          <div className="absolute top-0 left-[40%] -translate-x-1/2">
            <div className="rounded-bz-md bg-bz-deep text-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
              <p className="text-[8px] uppercase tracking-[0.12em] text-white/45 mb-0.5">
                Flash Sale · 11:00
              </p>
              <p className="text-[14px] font-bold tabular-nums">+$8,400 in 18 min</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] text-bz-text-soft tabular-nums">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>now</span>
        </div>
      </div>
    </Card>
  );
}

function ChannelMixDonutCard() {
  const slices = [
    { label: "Web Storefront", pct: 54, color: "var(--bz-sage)",   amount: "$26.1k" },
    { label: "Mobile App",     pct: 31, color: "var(--bz-accent)", amount: "$15.0k" },
    { label: "Marketplace",    pct: 12, color: "#94a3b8",          amount: "$5.8k"  },
    { label: "In-store POS",   pct: 3,  color: "#cbd5e1",          amount: "$1.4k"  },
  ];

  // Compute donut path strokes (cumulative offsets on a 100-unit dasharray)
  const C = 2 * Math.PI * 56; // circumference for r=56
  let cumulative = 0;
  const segments = slices.map((s) => {
    const len = (s.pct / 100) * C;
    const offset = -cumulative;
    cumulative += len;
    return { ...s, len, offset };
  });

  return (
    <Card pad="lg" className="lg:col-span-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <Eyebrow>Channel mix</Eyebrow>
          <h3 className="text-[16px] font-bold text-bz-text mt-1.5">Where today's GMV came from</h3>
        </div>
        <PillBadge tone="neutral">today</PillBadge>
      </div>

      <div className="flex items-center gap-7 flex-wrap">
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="56" fill="none" stroke="var(--bz-border-soft)" strokeWidth="16" />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="80"
                cy="80"
                r="56"
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${seg.len} ${C - seg.len}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="butt"
                transform="rotate(-90 80 80)"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[9.5px] uppercase tracking-[0.12em] text-bz-text-soft">Total</p>
            <p className="text-[20px] font-bold text-bz-text tabular-nums leading-none mt-0.5">
              $48.3K
            </p>
            <p className="text-[10px] text-bz-text-muted mt-1">1,847 orders</p>
          </div>
        </div>

        <div className="flex-1 min-w-[180px] flex flex-col gap-2.5">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-[12px] text-bz-text flex-1 truncate">{s.label}</span>
              <span className="text-[12px] font-bold text-bz-text-muted tabular-nums">{s.pct}%</span>
              <span className="text-[11px] text-bz-text-soft tabular-nums w-[52px] text-right">
                {s.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ConversionFunnelCard() {
  const stages: Array<{
    label: string;
    count: string;
    pct: number;
    drop?: { value: string; intent: "bad" | "warn" | "ok" };
  }> = [
    { label: "Visitors",    count: "12,400", pct: 100 },
    { label: "Add to Cart", count: "4,712",  pct: 38, drop: { value: "−62% drop", intent: "bad"  } },
    { label: "Checkout",    count: "2,344",  pct: 19, drop: { value: "−51% drop", intent: "warn" } },
    { label: "Purchased",   count: "1,397",  pct: 11, drop: { value: "−40% drop", intent: "warn" } },
  ];
  const dropTone: Record<"bad" | "warn" | "ok", string> = {
    bad:  "bg-rose-500/10 text-rose-500",
    warn: "bg-amber-500/10 text-amber-600",
    ok:   "bg-bz-sage-soft text-bz-sage",
  };

  return (
    <Card pad="lg" className="lg:col-span-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <Eyebrow>Conversion funnel</Eyebrow>
          <h3 className="text-[16px] font-bold text-bz-text mt-1.5">Where shoppers drop off</h3>
        </div>
        <PillBadge tone="neutral">12.4k visitors</PillBadge>
      </div>

      <div className="flex flex-col gap-2.5">
        {stages.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-medium text-bz-text">{s.label}</span>
              <span className="text-[12px] font-bold text-bz-text tabular-nums">{s.count}</span>
            </div>
            <div className="h-2.5 rounded-bz-pill bg-bz-bg overflow-hidden">
              <div
                className="h-full rounded-bz-pill bg-bz-sage"
                style={{ width: `${s.pct}%` }}
              />
            </div>
            {s.drop && i !== stages.length - 1 && (
              <div className="mt-2 mb-1 flex items-center gap-2">
                <span className="size-1 rounded-full bg-bz-border" />
                <span
                  className={[
                    "inline-flex items-center px-2 py-0.5 rounded-bz-pill",
                    "text-[9.5px] font-bold uppercase tracking-[0.08em] tabular-nums",
                    dropTone[s.drop.intent],
                  ].join(" ")}
                >
                  {s.drop.value}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-bz-border-soft flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] text-bz-text-muted">
          Auto-trigger: <span className="font-semibold text-bz-text">cart-recovery email</span>
        </span>
        <PillBadge tone="sage" dot>
          Enabled
        </PillBadge>
      </div>
    </Card>
  );
}

function TopSkuMarginCard() {
  const skus: Array<{
    sku: string;
    name: string;
    units: string;
    revenue: string;
    margin: string;
    intent: "good" | "warn" | "bad";
    spark: string;
  }> = [
    { sku: "BAG-LTH-BLK", name: "Leather Bag · Black",  units: "184", revenue: "$23.7k", margin: "62%", intent: "good", spark: "M0,12 L8,10 L16,11 L24,7 L32,5 L40,4 L48,2" },
    { sku: "SNK-XR7-RED", name: "Sneakers XR-7 · Red",  units: "128", revenue: "$11.4k", margin: "48%", intent: "good", spark: "M0,8 L8,9 L16,7 L24,8 L32,6 L40,5 L48,5" },
    { sku: "WRL-BUD-WHT", name: "Wireless Buds",        units: "210", revenue: "$13.4k", margin: "41%", intent: "good", spark: "M0,10 L8,8 L16,9 L24,7 L32,6 L40,5 L48,4" },
    { sku: "JKT-WIN-NVY", name: "Winter Jacket · Navy", units: "32",  revenue: "$8.9k",  margin: "28%", intent: "warn", spark: "M0,6 L8,7 L16,6 L24,8 L32,9 L40,8 L48,9" },
    { sku: "WAT-SPT-BLK", name: "Sport Watch · Black",  units: "47",  revenue: "$5.6k",  margin: "12%", intent: "bad",  spark: "M0,5 L8,6 L16,7 L24,8 L32,9 L40,10 L48,11" },
  ];
  const marginTone: Record<"good" | "warn" | "bad", string> = {
    good: "bg-bz-sage-soft text-bz-sage",
    warn: "bg-amber-500/10 text-amber-600",
    bad:  "bg-rose-500/10 text-rose-500",
  };

  return (
    <Card pad="lg" className="lg:col-span-7">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <Eyebrow>Top SKUs · margin contribution</Eyebrow>
          <h3 className="text-[16px] font-bold text-bz-text mt-1.5">
            Which products are paying the bills
          </h3>
        </div>
        <PillBadge tone="neutral">sorted by margin</PillBadge>
      </div>

      <div className="rounded-bz-lg border border-bz-border-soft overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_72px_84px_64px_72px] gap-3 px-4 py-2.5 bg-bz-bg
                        text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-soft">
          <span>SKU · Product</span>
          <span className="text-right">Units</span>
          <span className="text-right">Revenue</span>
          <span className="text-right">Margin</span>
          <span className="text-right">7-day</span>
        </div>
        {skus.map((s, i) => (
          <div
            key={s.sku}
            className={[
              "grid grid-cols-[1fr_72px_84px_64px_72px] gap-3 px-4 py-3 items-center",
              i !== skus.length - 1 && "border-b border-bz-border-soft",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold text-bz-text truncate">{s.name}</p>
              <p className="text-[10.5px] font-mono text-bz-text-soft truncate">{s.sku}</p>
            </div>
            <span className="text-right text-[12px] tabular-nums text-bz-text-muted">{s.units}</span>
            <span className="text-right text-[12.5px] font-bold tabular-nums text-bz-text">
              {s.revenue}
            </span>
            <span className="text-right">
              <span
                className={[
                  "inline-flex items-center px-2 py-0.5 rounded-bz-pill",
                  "text-[10.5px] font-bold tabular-nums",
                  marginTone[s.intent],
                ].join(" ")}
              >
                {s.margin}
              </span>
            </span>
            <svg viewBox="0 0 48 14" className="w-[60px] h-[18px] ml-auto">
              <path
                d={s.spark}
                fill="none"
                stroke={s.intent === "bad" ? "#ef4444" : s.intent === "warn" ? "#d97706" : "var(--bz-sage)"}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <span className="text-[11px] text-bz-text-muted">
          12 SKUs above target margin · 3 below
        </span>
        <a
          href="#"
          className="text-[11.5px] font-bold text-bz-sage hover:text-bz-sage-hover inline-flex items-center gap-1"
        >
          View all 248 SKUs
          <span aria-hidden>→</span>
        </a>
      </div>
    </Card>
  );
}

// ─── Order Lifecycle — creative redesign ─────────────────────────────────────
//   Replaces the legacy WorkflowStrip with a "Live order pipeline" stage:
//     Top:    6-stage pipeline with live counts + drop pills
//     Middle: 3 active orders progressing through the stages on individual tracks
//     Bottom: 3 summary stats
function OrderLifecycleSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Order Lifecycle"
          eyebrowTone="accent"
          title={
            <>
              From first click to{" "}
              <span className="text-bz-accent">five-star review.</span>
            </>
          }
          description="Every order, every channel, every stage — in one continuous live stream. No order falls off, no SLA gets missed, no customer waits in the dark."
          tone="light"
          align="center"
          maxWidth={760}
          className="mb-12"
        />

        <Card tone="dark" pad="lg">
          {/* Header strip */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <IconBadge tone="darkSurface" size="sm">
                <Zap className="size-4 text-bz-accent" strokeWidth={1.8} />
              </IconBadge>
              <div>
                <p className="text-[14px] font-bold text-white">Live order pipeline</p>
                <p className="text-[10.5px] uppercase tracking-[0.08em] text-white/40">
                  Auto-routing engine · 1,847 active
                </p>
              </div>
            </div>
            <PillBadge tone="accent" dot>
              LIVE
            </PillBadge>
          </div>

          <PipelineStages />
          <ActiveOrderTracks />
          <PipelineFooterStats />
        </Card>
      </Container>
    </Section>
  );
}

const STAGES: Array<{
  icon: React.ElementType;
  label: string;
  count: string;
  drop?: string;
  dropTone?: "bad" | "warn" | "ok";
}> = [
  { icon: Search,      label: "Browse",   count: "12.4k" },
  { icon: ShoppingCart,label: "Cart",     count: "4.7k", drop: "−62%", dropTone: "bad"  },
  { icon: CreditCard,  label: "Checkout", count: "2.3k", drop: "−51%", dropTone: "warn" },
  { icon: Zap,         label: "Fulfil",   count: "1.8k", drop: "−22%", dropTone: "warn" },
  { icon: Truck,       label: "Deliver",  count: "1.6k", drop: "−11%", dropTone: "ok"   },
  { icon: Star,        label: "Review",   count: "1.4k", drop: "−13%", dropTone: "ok"   },
];

function PipelineStages() {
  const dropTone: Record<"bad" | "warn" | "ok", string> = {
    bad:  "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    warn: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    ok:   "bg-bz-accent-soft text-bz-accent border border-bz-accent-mid",
  };

  return (
    <div className="rounded-bz-lg bg-white/[0.03] border border-white/10 p-5 md:p-7 mb-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-8 relative">
        {/* Connector line behind stages (lg+ only) */}
        <div className="hidden lg:block absolute top-[24px] left-[8.33%] right-[8.33%] h-px bg-white/10 pointer-events-none" />

        {STAGES.map((s, i) => {
          const Ico = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center text-center relative">
              {/* Animated dot heading from prev to this stage (lg+) */}
              {i > 0 && (
                <span
                  className="hidden lg:block absolute top-[20px] -left-3 size-1.5 rounded-full bg-bz-accent biz-pulse-glow pointer-events-none"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              )}

              <div className="relative z-10 mb-3">
                <span className="absolute inset-0 rounded-full bg-bz-accent/15 blur-md" aria-hidden />
                <span className="relative size-12 rounded-full bg-bz-deep ring-1 ring-white/15 inline-flex items-center justify-center text-bz-accent">
                  <Ico className="size-5" strokeWidth={1.8} />
                </span>
              </div>

              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/45">
                {s.label}
              </p>
              <p className="text-[20px] font-bold text-white tabular-nums leading-none mt-1.5">
                {s.count}
              </p>
              {s.drop && s.dropTone && (
                <span
                  className={[
                    "inline-flex items-center mt-2 px-2 py-0.5 rounded-bz-pill",
                    "text-[9.5px] font-bold tabular-nums",
                    dropTone[s.dropTone],
                  ].join(" ")}
                >
                  {s.drop}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ActiveOrder = {
  id: string;
  channel: string;
  /** Index into STAGES array (0..5). */
  position: number;
  elapsed: string;
  status: "paid" | "picking" | "shipped" | "delivered";
};

const ACTIVE_ORDERS: ActiveOrder[] = [
  { id: "#ORD-9841", channel: "Web Storefront", position: 2, elapsed: "4m 12s",   status: "paid"      },
  { id: "#ORD-9842", channel: "Mobile App",     position: 3, elapsed: "8m 20s",   status: "picking"   },
  { id: "#ORD-9843", channel: "Marketplace",    position: 4, elapsed: "28m 14s",  status: "shipped"   },
];

function ActiveOrderTracks() {
  const statusTone: Record<ActiveOrder["status"], string> = {
    paid:      "bg-bz-accent-soft text-bz-accent border border-bz-accent-mid",
    picking:   "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    shipped:   "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };

  return (
    <div className="rounded-bz-lg bg-white/[0.03] border border-white/10 p-5 md:p-6 mb-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
          Active orders · live
        </p>
        <span className="text-[10.5px] text-white/35 tabular-nums">3 of 1,847</span>
      </div>

      <div className="flex flex-col gap-3.5">
        {ACTIVE_ORDERS.map((o) => {
          const stage = STAGES[o.position];
          const positionPct = ((o.position + 0.5) / STAGES.length) * 100;
          return (
            <div
              key={o.id}
              className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-3 md:gap-4 items-center"
            >
              <div className="min-w-0">
                <p className="text-[11.5px] font-mono text-white">{o.id}</p>
                <p className="text-[10px] text-white/40 truncate">{o.channel}</p>
              </div>

              <div className="relative h-2.5">
                <div className="absolute inset-y-1 inset-x-0 rounded-bz-pill bg-white/[0.06] border border-white/10" />
                <div
                  className="absolute inset-y-1 left-0 rounded-bz-pill bg-bz-accent/70"
                  style={{ width: `${positionPct}%` }}
                />
                {/* Stage tick markers */}
                {STAGES.map((_, i) => {
                  const left = ((i + 0.5) / STAGES.length) * 100;
                  const reached = i <= o.position;
                  return (
                    <span
                      key={i}
                      className={[
                        "absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full",
                        reached ? "bg-bz-accent" : "bg-white/20",
                      ].join(" ")}
                      style={{ left: `${left}%`, transform: "translate(-50%, -50%)" }}
                    />
                  );
                })}
                {/* Current-position glowing dot */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-bz-accent
                             shadow-[0_0_12px_rgba(199,255,53,0.6)] biz-pulse-glow"
                  style={{ left: `${positionPct}%`, transform: "translate(-50%, -50%)" }}
                />
              </div>

              <div className="flex items-center gap-3 justify-self-end">
                <div className="text-right">
                  <p className="text-[11.5px] font-bold text-white">{stage.label}</p>
                  <p className="text-[10px] text-white/40 tabular-nums">{o.elapsed} elapsed</p>
                </div>
                <span
                  className={[
                    "inline-flex items-center px-2 py-0.5 rounded-bz-pill",
                    "text-[9.5px] font-bold uppercase tracking-[0.08em]",
                    statusTone[o.status],
                  ].join(" ")}
                >
                  {o.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PipelineFooterStats() {
  const stats = [
    { value: "1,847",  label: "Orders flowing today",         accent: false },
    { value: "4h 12m", label: "Avg cycle · click → delivery", accent: false },
    { value: "99.1%",  label: "On-time fulfilment",           accent: true  },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-bz-lg bg-white/[0.04] border border-white/10 px-5 py-4"
        >
          <p
            className={[
              "text-[clamp(22px,2.4vw,30px)] font-bold tracking-[-0.02em] tabular-nums leading-none",
              s.accent ? "text-bz-accent" : "text-white",
            ].join(" ")}
          >
            {s.value}
          </p>
          <p className="text-[11px] text-white/45 mt-2 uppercase tracking-[0.08em] font-semibold">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── EXPERIMENTAL: Light-themed CTA ──────────────────────────────────────────
//   Replacement for <IndustryCta /> on this page only. Light surface with a
//   soft accent + sage radial mesh applied inline. Primary/Outline button pair
//   for high contrast on light. Inline gradient is intentionally tunable —
//   if approved, promote to a `.biz-cta-mesh-light` class in style.css and
//   formalise in BIZAK_PRODUCT_OVERVIEW.md §7.1 + DESIGN_SYSTEM.md §3.7.
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
                Sell smarter across
                <br />
                <span className="text-bz-sage">every channel.</span>
              </>
            }
            description="Unify your retail operations with Bizak and turn every touchpoint into a seamless, profitable customer experience."
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
//   Replacement for the global <Footer /> on this page only. Mirrors the same
//   link data and layout but inverted onto a light surface (`bg-bz-bg-alt`)
//   with charcoal text + sage hover. Uses the header logo (designed for light
//   bg). If approved, lift this into `marketing/Footer.tsx` with a `tone`
//   prop and switch the routes/Layouts that want it.
const RETAIL_FOOTER_LINKS = [
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

function RetailFooterLight() {
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
            {RETAIL_FOOTER_LINKS.map((col) => (
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
        <RevenueIntelligenceSection />
        <OrderLifecycleSection />
        <LightCtaSection />
      </main>
      <RetailFooterLight />
    </div>
  );
}
