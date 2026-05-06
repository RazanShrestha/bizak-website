import { useState } from "react";
import { ArrowRight, Plus, ChevronRight } from "lucide-react";



import svgPaths from "../../imports/svg-74vzcjz4u1";
import imgModernFactoryFloor from "figma:asset/057723890bebb494a0193592a91cec67fedcf247.png";
import imgModernFinanceOffice from "figma:asset/3ba19eec4fd3cf07fba6be8524f24fddb8d27558.png";
import imgHighTechWarehouse from "figma:asset/c536d79bf67cf656cf1185c7e390cf1aac19463c.png"; 



// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  brand: "#7a826d",
  brandLight: "rgba(122,130,109,0.1)",
  dark: "#333",
  text: "#666",
  border: "#e8eae4",
  borderLight: "rgba(232,234,228,0.4)",
  bgLight: "#f8f9f7",
  bgWhite: "#ffffff",
  bgDark: "#121212",
  accent: "#c7ff35",
};

const T = (family = "Inter", weight = 400, size = 14, color = C.dark) => ({
  fontFamily: family,
  fontWeight: weight,
  fontSize: size,
  color,
});

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "4px",
        color: C.brand,
        textTransform: "uppercase",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHeading({
  children,
  align = "center",
  size = 40,
}: {
  children: React.ReactNode;
  align?: "center" | "left";
  size?: number;
}) {
  return (
    <h2
      style={{
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.18,
        letterSpacing: "-1px",
        color: C.dark,
        textAlign: align,
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

function AccentBar() {
  return (
    <div
      style={{
        width: 80,
        height: 4,
        background: C.brand,
        borderRadius: 2,
        margin: "0 auto",
      }}
    />
  );
}

// ─── 1. HERO SECTION ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", height: 480 }}>
        {/* Sidebar */}
        <div
          style={{
            background: C.bgDark,
            width: 64,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 0",
            gap: 24,
          }}
        >
          <div
            style={{
              background: C.brand,
              borderRadius: 4,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d={svgPaths.p20793584} fill="white" />
            </svg>
          </div>
          {[svgPaths.p26835240, svgPaths.p643d217, svgPaths.p39955c80].map((path, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.4,
              }}
            >
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <path d={path} fill="white" />
              </svg>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, background: "#f8f9f7", padding: 24, display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ background: "rgba(51,51,51,0.05)", borderRadius: 4, height: 24, width: 128 }} />

          {/* Metric cards */}
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Total Revenue", value: "$1.2M", accent: "rgba(122,130,109,0.05)" },
              { label: "Inventory Level", value: "84%", accent: "rgba(199,255,53,0.1)" },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e8eae4",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  padding: 17,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ ...T("Inter", 700, 10, "#666"), textTransform: "uppercase" }}>
                  {card.label}
                </div>
                <div style={{ ...T("Inter", 700, 20, C.dark) }}>{card.value}</div>
                <div
                  style={{
                    background: card.accent,
                    borderRadius: 4,
                    height: 44,
                    marginTop: 8,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Chart card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e8eae4",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              padding: "17px 25px 25px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ background: "rgba(51,51,51,0.05)", borderRadius: 4, height: 16, width: 96 }} />
              <div style={{ background: "rgba(51,51,51,0.05)", borderRadius: 4, height: 16, width: 48 }} />
            </div>
            <svg viewBox="0 0 243 63" fill="none" style={{ width: "100%", height: 80 }} preserveAspectRatio="none">
              <path d={svgPaths.p19b84d80} stroke={C.brand} strokeWidth="4.8" />
            </svg>
          </div>
        </div>

        {/* Right float card */}
        <div
          style={{
            width: 180,
            flexShrink: 0,
            background: "#fff",
            borderLeft: "1px solid #e8eae4",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Live Activity */}
          <div
            style={{
              background: "rgba(199,255,53,0.2)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path d={svgPaths.p12df5c00} fill={C.brand} />
            </svg>
          </div>
          <div style={{ ...T("Inter", 700, 10, "rgba(51,51,51,0.6)"), textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Live Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 0.7, 0.4].map((w, i) => (
              <div key={i} style={{ background: "rgba(51,51,51,0.05)", borderRadius: 4, height: 6, width: `${w * 100}%` }} />
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid #f0f1ed" }}>
            <div style={{ ...T("Inter", 700, 9, C.brand), textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.6px" }}>
              Financial Health
            </div>
            <div style={{ ...T("Inter", 700, 22, "#fff"), background: C.bgDark, borderRadius: 8, padding: 12 }}>
              98.2%
              <div style={{ ...T("Inter", 400, 9, "rgba(255,255,255,0.4)"), marginTop: 4 }}>STABLE / OPTIMAL</div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "98%", background: C.brand }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section style={{ background: "#fbfbfb", paddingTop: 160, paddingBottom: 128, overflow: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
          }}
          className="flex-col lg:flex-row"
        >
          {/* Left */}
          <div style={{ flex: "1 0 0", display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: C.brandLight,
                borderRadius: 9999,
                padding: "4px 12px",
                alignSelf: "flex-start",
              }}
            >
              <span style={{ ...T("Inter", 700, 12, C.brand), textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Bizak ERP Platform
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: "clamp(40px, 5vw, 64px)",
                lineHeight: 1.1,
                letterSpacing: "-1.6px",
                color: C.dark,
                margin: 0,
              }}
            >
              Complete Business<br />
              Management<br />
              Software
            </h1>

            {/* Description */}
            <p
              style={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: 20,
                lineHeight: 1.625,
                color: C.text,
                margin: 0,
                maxWidth: 520,
              }}
            >
              Manage finance, operations, inventory, sales, and projects—all from a single, unified platform.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 16, paddingTop: 8, flexWrap: "wrap" }}>
              <button
                style={{
                  background: C.dark,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "17px 32px",
                  ...T("Inter", 700, 16, "#fff"),
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Request a Demo <ArrowRight size={14} />
              </button>
              <button
                style={{
                  background: "#fff",
                  color: C.dark,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  padding: "17px 33px",
                  ...T("Inter", 700, 16, C.dark),
                  cursor: "pointer",
                }}
              >
                View Pricing
              </button>
            </div>
          </div>

          {/* Right – Dashboard */}
          <div style={{ flex: "1 0 0", position: "relative", minWidth: 0 }}>
            <DashboardMockup />
            {/* Floating badge */}
            <div
              style={{
                position: "absolute",
                top: 80,
                right: -40,
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 12,
                padding: 17,
                width: 192,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
              className="hidden xl:block"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    background: "rgba(199,255,53,0.2)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                    <path d={svgPaths.p12df5c00} fill={C.brand} />
                  </svg>
                </div>
                <span style={{ ...T("Inter", 700, 10, "rgba(51,51,51,0.6)"), textTransform: "uppercase" }}>Live Activity</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ background: "rgba(51,51,51,0.05)", borderRadius: 4, height: 6, width: "100%" }} />
                <div style={{ background: "rgba(51,51,51,0.05)", borderRadius: 4, height: 6, width: "60%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. WHY BIZAK (CORE VALUES) ───────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  desc,
  large = false,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  large?: boolean;
}) {
  return (
    <div
      style={{
        background: C.bgLight,
        borderRadius: 24,
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
        padding: large ? 41 : 33,
        display: "flex",
        flexDirection: "column",
        gap: large ? 24 : 16,
        height: "100%",
      }}
    >
      <div
        style={{
          background: C.brandLight,
          borderRadius: 8,
          width: large ? 48 : 40,
          height: large ? 48 : 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "Inter",
          fontWeight: 700,
          fontSize: large ? 24 : 18,
          lineHeight: 1.4,
          color: C.dark,
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "Inter",
          fontWeight: 400,
          fontSize: large ? 16 : 14,
          lineHeight: large ? 1.625 : 1.625,
          color: C.text,
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

function WhyBizakSection() {
  return (
    <section style={{ background: C.bgWhite, padding: "97px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 64 }}>
          <SectionLabel text="CORE VALUES" />
          <SectionHeading>Why Businesses Choose Bizak ERP</SectionHeading>
          <AccentBar />
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "auto auto",
            gap: 24,
            height: 460,
          }}
          className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Large card spans rows */}
          <div style={{ gridRow: "1 / 3" }}>
            <FeatureCard
              large
              icon={
                <svg width="24" height="23" viewBox="0 0 24 23" fill="none">
                  <path d={svgPaths.p80d2080} fill={C.brand} />
                </svg>
              }
              title="Unified Operations"
              desc="Consolidate all business units into a single source of truth for better coordination and unprecedented efficiency."
            />
          </div>
          {/* Top right small cards */}
          <div>
            <FeatureCard
              icon={
                <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
                  <path d={svgPaths.paad5c90} fill={C.brand} />
                </svg>
              }
              title="Real-time Insights"
              desc="Make data-driven decisions with live dashboards and predictive analytics."
            />
          </div>
          <div>
            <FeatureCard
              icon={
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path d={svgPaths.p15aec574} fill={C.brand} />
                </svg>
              }
              title="Secure & Reliable"
              desc="Enterprise-grade security protocols ensuring your data remains protected 24/7."
            />
          </div>
          {/* Bottom wide card */}
          <div style={{ gridColumn: "2 / 4" }}>
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 21.95 21.95" fill="none">
                  <path d={svgPaths.p56e8000} fill={C.brand} />
                </svg>
              }
              title="Scalable & Flexible"
              desc="Adapt and grow your infrastructure as your business complexity increases without the growing pains of legacy systems."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 3. MODULES (EVERYTHING YOUR BUSINESS NEEDS) ─────────────────────────────
const moduleTabs = [
  {
    id: "finance",
    label: "Finance",
    /*icon: svgPaths.p26835240,*/
    iconSize: [22, 16],
    title: "Financial Management",
    desc: "Complete financial control from general ledger to automated reporting. Manage receivables, payables, and multi-currency transactions in real time.",
    features: [
      "General Ledger & Chart of Accounts",
      "Accounts Receivable & Payable",
      "Bank Reconciliation",
      "Multi-currency & Multi-entity",
      "Financial Statements & Reports",
      "Tax Compliance & Automation",
    ],
  },
  {
    id: "operations",
    label: "Operations",
     /* icon: svgPaths.p30227100,*/
    iconSize: [18, 18],
    title: "Operations Management",
    desc: "Streamline your operational workflows with powerful planning and execution tools across inventory, procurement, and fulfillment.",
    features: [
      "Purchase Orders & Procurement",
      "Inventory & Warehouse Control",
      "Demand Planning",
      "Supplier Management",
      "Receiving & Putaway",
      "Returns & Quality Control",
    ],
  },
  {
    id: "sales",
    label: "Sales & CRM",
     /* icon: svgPaths.p5df3d80,*/
    iconSize: [24, 12],
    title: "Sales & CRM",
    desc: "Manage your entire revenue cycle from lead to cash — quotes, orders, invoicing, and customer relationships in one place.",
    features: [
      "Lead & Opportunity Management",
      "Quote & Proposal Builder",
      "Sales Orders & Fulfillment",
      "Customer Invoicing",
      "Commission & Incentive Tracking",
      "Customer Portal",
    ],
  },
  {
    id: "supply",
    label: "Supply Chain",
   /* icon: svgPaths.p146eb80,*/
    iconSize: [22, 16],
    title: "Supply Chain Management",
    desc: "End-to-end visibility and control over your supply chain. Optimize stock levels, reduce costs, and prevent disruptions.",
    features: [
      "Supplier Scorecards",
      "Replenishment Automation",
      "Multi-warehouse Management",
      "Batch & Serial Tracking",
      "Landed Cost Calculation",
      "Real-time Stock Visibility",
    ],
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
   /* icon: svgPaths.p11741000,*/
    iconSize: [20, 20],
    title: "Manufacturing",
    desc: "Plan, execute, and track production with full BOM management, shop-floor control, and costing across all production types.",
    features: [
      "Bill of Materials (BOM)",
      "Production Planning & Scheduling",
      "Work Orders & Routing",
      "Shop Floor Control",
      "Job Costing & Variance",
      "MRP & Capacity Planning",
    ],
  },
];

function ModulesSection() {
  const [activeTab, setActiveTab] = useState("finance");
  const active = moduleTabs.find((t) => t.id === activeTab)!;

  return (
    <section style={{ background: C.bgLight, padding: "128px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 80 }}>
          <SectionHeading>Everything Your Business Needs</SectionHeading>
          <p
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: 18,
              lineHeight: 1.555,
              color: C.text,
              textAlign: "center",
              margin: 0,
              maxWidth: 600,
            }}
          >
            From core financials to advanced manufacturing, Bizak offers a complete suite of integrated modules.
          </p>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          {/* Tab list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, width: 200 }}>
            {moduleTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "24px 27px",
                    borderRadius: "0 8px 8px 0",
                    border: "none",
                    borderLeft: `3px solid ${isActive ? C.accent : "transparent"}`,
                    background: isActive ? "rgba(122,130,109,0.05)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg
                    width={tab.iconSize[0]}
                    height={tab.iconSize[1]}
                    viewBox={`0 0 ${tab.iconSize[0]} ${tab.iconSize[1]}`}
                    fill="none"
                  >
                    <path d={tab.icon} fill={isActive ? C.brand : "#aaa"} />
                  </svg>
                  <span
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: "-0.45px",
                      color: isActive ? C.dark : C.text,
                      transition: "color 0.15s",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content panel */}
          <div
            style={{
              flex: 1,
              background: C.bgWhite,
              borderRadius: 32,
              border: "1px solid rgba(232,234,228,0.3)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              padding: "56px 48px",
              minHeight: 600,
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "Inter",
                  fontWeight: 700,
                  fontSize: 28,
                  letterSpacing: "-0.5px",
                  color: C.dark,
                  margin: "0 0 16px",
                }}
              >
                {active.title}
              </h3>
              <p
                style={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: C.text,
                  margin: 0,
                  maxWidth: 560,
                }}
              >
                {active.desc}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 32px",
              }}
            >
              {active.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.brand, flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: 15,
                      color: C.dark,
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${C.borderLight}` }}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "Inter",
                  fontWeight: 700,
                  fontSize: 14,
                  color: C.brand,
                  textDecoration: "none",
                }}
              >
                Explore {active.label} module <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. HOW IT WORKS ─────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Connect",
      desc: "Integrate your existing data sources and legacy systems with our secure migration engine.",
    },
    {
      num: "02",
      title: "Automate",
      desc: "Establish workflows and rules that handle routine tasks across departments automatically.",
    },
    {
      num: "03",
      title: "Grow",
      desc: "Scale your operations with confidence, powered by real-time visibility and optimized resources.",
    },
  ];

  return (
    <section style={{ background: C.bgWhite, padding: "128px 0", overflow: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 96 }}>
          <SectionHeading>Streamline Your Business in 3 Steps</SectionHeading>
          <AccentBar />
        </div>

        {/* Steps */}
        <div style={{ position: "relative" }}>
          {/* Connecting line */}
          <div
            style={{
              position: "absolute",
              top: 32,
              left: "16.67%",
              right: "16.67%",
              height: 1,
              background: C.border,
              zIndex: 0,
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 48,
              justifyContent: "center",
            }}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  flex: "1 0 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: C.bgWhite,
                    border: `2px solid ${C.brand}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginBottom: 32,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 700,
                      fontSize: 20,
                      color: C.brand,
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.dark,
                    margin: "0 0 16px",
                    textAlign: "center",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: 1.625,
                    color: C.text,
                    textAlign: "center",
                    margin: 0,
                    maxWidth: 280,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. INDUSTRY LEADERS (SUCCESS STORIES) ───────────────────────────────────
function IndustryCard({
  image,
  company,
  metric,
  metricLabel,
  quote,
}: {
  image: string;
  company: string;
  metric: string;
  metricLabel: string;
  quote: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        height: 540,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        background: C.dark,
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
      }}
    >
      {/* Background image */}
      <img
        src={image}
        alt={company}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.6,
        }}
      />
      {/* Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, #333 0%, rgba(51,51,51,0.2) 50%, rgba(51,51,51,0) 100%)",
        }}
      />
      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 32,
        }}
      >
        {/* Top: company badge */}
        <div style={{ alignSelf: "flex-start" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              padding: "5px 13px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 10,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {company}
            </span>
          </div>
        </div>

        {/* Middle: metric */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 48,
              letterSpacing: "-1.2px",
              color: "#fff",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {metric}
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "1.2px",
              color: C.accent,
              textTransform: "uppercase",
            }}
          >
            {metricLabel}
          </div>
        </div>

        {/* Bottom: quote and link */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <p
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 18,
              lineHeight: 1.25,
              color: "#fff",
              margin: 0,
            }}
          >
            {quote}
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textDecoration: "none",
            }}
          >
            READ CASE STUDY
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d={svgPaths.p27046300} fill="white" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function IndustryLeadersSection() {
  return (
    <section style={{ padding: "128px 0", background: C.bgLight }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 80 }}>
          <SectionLabel text="SUCCESS STORIES" />
          <SectionHeading>Transforming Industry Leaders</SectionHeading>
          <AccentBar />
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <IndustryCard
            image={imgModernFactoryFloor}
            company="INDUSFLOW"
            metric="+35%"
            metricLabel="Efficiency Increase"
            quote="Modernizing shop-floor automation for Indusflow."
          />
          <IndustryCard
            image={imgModernFinanceOffice}
            company="NORDIC CAP"
            metric="12"
            metricLabel="Countries Unified"
            quote="Real-time multi-currency consolidation for Nordic Capital."
          />
          <IndustryCard
            image={imgHighTechWarehouse}
            company="LOGISCALE"
            metric="99.9%"
            metricLabel="Inventory Accuracy"
            quote="Seamlessly scaling global supply chains for LogiScale."
          />
        </div>
      </div>
    </section>
  );
}

// ─── 6. FAQ ───────────────────────────────────────────────────────────────────
const faqData = [
  {
    q: "How long does the implementation process take?",
    a: "Typical implementations range from 4 to 12 weeks, depending on the complexity of your operations and the number of modules being deployed. Our dedicated success team guides you through every step of the migration.",
  },
  {
    q: "Can Bizak integrate with my existing CRM and legacy systems?",
    a: "Yes. Bizak comes with a comprehensive API library and pre-built connectors for popular CRMs, accounting tools, ecommerce platforms, and payment gateways. Custom integrations are also supported.",
  },
  {
    q: "What kind of security measures are in place?",
    a: "Bizak uses bank-grade encryption (AES-256), role-based access control, SSO support, audit logs, and is SOC 2 Type II certified. Data residency options are available for enterprise customers.",
  },
  {
    q: "Is there a mobile application available?",
    a: "Yes. Bizak offers native iOS and Android applications with full feature parity for key modules including approvals, reporting, sales orders, and expense management.",
  },
  {
    q: "Do you offer 24/7 technical support?",
    a: "All plans include business-hours support. Growth and Enterprise plans include 24/7 priority support with a guaranteed SLA and access to a dedicated Customer Success Manager.",
  },
  {
    q: "How does pricing scale with company growth?",
    a: "Bizak uses a user-based pricing model with volume discounts at key tiers. You can add or remove users and modules monthly. Annual commitments include additional savings. Contact sales for a custom quote.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section
      style={{
        background: C.bgLight,
        padding: "128px 192px",
        borderTop: `1px solid rgba(232,234,228,0.3)`,
      }}
      className="px-6 md:px-24 lg:px-48"
    >
      <div style={{ maxWidth: 896, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 64 }}>
          <SectionLabel text="RESOURCES" />
          <SectionHeading>Frequently Asked Questions</SectionHeading>
          <AccentBar />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {faqData.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: C.bgWhite,
                  borderRadius: 16,
                  border: "1px solid rgba(232,234,228,0.5)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "17px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: "-0.45px",
                      color: C.dark,
                      lineHeight: 1.55,
                    }}
                  >
                    {item.q}
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: C.brandLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "transform 0.2s ease",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <Plus size={14} color={C.brand} />
                  </div>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? 300 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <div style={{ padding: "0 24px 24px" }}>
                    <p
                      style={{
                        fontFamily: "Inter",
                        fontWeight: 400,
                        fontSize: 16,
                        lineHeight: 1.625,
                        color: C.text,
                        margin: 0,
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── 7. CTA SECTION ──────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: "0 24px 48px" }}>
      <div
        style={{
          background: C.bgDark,
          borderRadius: 32,
          padding: 96,
          overflow: "hidden",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(199,255,53,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          <h2
            style={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.2,
              letterSpacing: "-1.2px",
              color: "#fff",
              margin: 0,
              maxWidth: 680,
            }}
          >
            See How Bizak Can Transform Your Business
          </h2>

          <p
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: 20,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.5)",
              margin: 0,
              maxWidth: 520,
            }}
          >
            Join thousands of leaders who have modernized their business operations with Bizak.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              style={{
                background: C.brand,
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "21px 40px",
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
            >
              Request Demo
            </button>
            <button
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 4,
                padding: "21px 41px",
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────



export function ProductPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <HeroSection />
      <WhyBizakSection />
      <ModulesSection />
      <HowItWorksSection />
      <IndustryLeadersSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
