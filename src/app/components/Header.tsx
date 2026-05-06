import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  Shield,
  Layers,
  DollarSign,
  ShoppingCart,
  Package,
  Factory,
  FolderKanban,
  BarChart3,
  Zap,
  Plug,
  Building2,
  Truck,
  Briefcase,
  Store,
  Users,
  Calculator,
  Tag,
  BookOpen,
  FileText,
  HeadphonesIcon,
  GraduationCap,
  MessageSquare,
  Globe,
  Award,
  Star,
  Heart,
  Rocket,
  Handshake,
  BookMarked,
  Video,
  Info,
  Target,
  UserCheck,
  Calendar,
  Mail,
  CheckCircle,
  Activity,
} from "lucide-react";
import svgPaths from "../../imports/svg-eyvfmiiac4";
import bizakLogo from "../../assets/bizaklogo.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
   href?: string; // ← Add this
 
}

interface MenuColumn {
  heading?: string;
  items: MenuItem[];
}

interface MegaMenuData {
  columns: MenuColumn[];
  cta?: {
    label: string;
    buttonLabel: string;
    highlight?: string;
  };
}

interface MegaMenuPanelProps {
  data: MegaMenuData;
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// ─── Mega Menu Content Data ───────────────────────────────────────────────────

const megaMenus: Record<string, MegaMenuData> = {
  Product: {
    columns: [
      {
        heading: "Overview",
        items: [
          {
            icon: <Layers size={15} />,
            title: "Bizak ERP Platform",
            description: "Unified system to manage finance, inventory, sales, and operations",
             href: "/product",
           
          },
          {
            icon: <Target size={15} />,
            title: "Why Bizak",
            description: "Replace spreadsheets and disconnected legacy systems",
                 href: "/why-bizak", // ← Add this
          },
          {
            icon: <Shield size={15} />,
            title: "Architecture & Security",
            description: "Enterprise-grade infrastructure and reliability",
          },
        ],
      },
      {
        heading: "Core Modules",
        items: [
          {
            icon: <DollarSign size={15} />,
            title: "Financial Management",
            description: "General ledger, receivables, payables, reporting",
             href: "/FinancialManagement", 
          },
          {
            icon: <ShoppingCart size={15} />,
            title: "Sales & CRM",
            description: "Quotes, sales orders, invoicing, customer tracking",
            badge: "Popular",
           href: "/SalesCrm", 
          },
          {
            icon: <Truck size={15} />,
            title: "Purchasing",
            description: "Vendor management and procurement workflows",
              href: "/Purchasing", // ← Add this
          },
          {
            icon: <Package size={15} />,
            title: "Inventory & Warehouse",
            description: "Real-time stock and warehouse control",
                 href: "/InventoryAndWarehouse",
          },
          {
            icon: <Factory size={15} />,
            title: "Manufacturing",
            description: "Production planning and costing",
           href: "/ManufacturingProduct",
          },
          {
            icon: <FolderKanban size={15} />,
            title: "Projects & Job Costing",
            description: "Track project profitability and resources",
               href: "/ProjectAndCosting",
          },

   {
            icon: <Target size={15} />,
            title: "Sales Force Management",
            description: "Improve productivity and track performance",
                 href: "/SalesForceManagement",
          },


             {
            icon: <Store size={15} />,
            title: "Point Of Sales",
            description: "Process in-store transactions, manage cashiers, and print receipts",
                 href: "/PointOfSales",
          },


        ],
      },





      {
        heading: "Platform Capabilities",
        items: [
          {
            icon: <BarChart3 size={15} />,
            title: "Dashboards & Reporting",
            description: "Real-time operational insights across your business",
               href: "/DashboardAndReporting", // ← Add this
          },
          {
            icon: <Zap size={15} />,
            title: "Workflow Automation",
            description: "Automate approvals and routine business processes",
                 href: "/workflow", // ← Add this
          },
          {
            icon: <Plug size={15} />,
            title: "Integrations",
            description: "Connect banks, ecommerce, and external systems",
            href: "/Integrations",
          },
          {
            icon: <Building2 size={15} />,
            title: "Multi-company & Multi-branch",
            description: "Manage multiple entities from one platform",
            href: "/MulticompanyAndBranches",
          },

    {
            icon: <FileText size={15} />,
            title: "Document Management",
            description: "File & Document of organisation",
            href: "/DocumentManagement",
          },


        ],
      },
    ],
    cta: {
      label: "See Bizak in action",
      buttonLabel: "Request Demo",
      highlight: "Live demo with a product expert",
    },
  },

  Solutions: {
    columns: [
      {
        heading: "By Industry",
        items: [
          {
            icon: <Factory size={15} />,
            title: "Manufacturing",
            description: "Production, BOM, costing, and supply chain",

             href: "/Manufacturing",
          },
          {
            icon: <Truck size={15} />,
            title: "Distribution & Logistics",
            description: "Warehouse, routing, and delivery management",
            href: "/Distribution", // ← Add this
          },
          {
            icon: <Briefcase size={15} />,
            title: "Professional Services",
            description: "Project tracking, billing, and resource planning",
               href: "/ProfessionalService", // ← Add this
          },
          {
            icon: <Store size={15} />,
            title: "Retail & E-Commerce",
            description: "POS, multi-channel, inventory, and returns",
                 href: "/Retail", // ← Add this
          },
        ],
      },
      {
        heading: "By Company Size",
        items: [
          {
            icon: <Rocket size={15} />,
            title: "Startups & SMEs",
            description: "Get started fast with pre-configured modules",
            href: "/StartupsAndSmes",
          },
          {
            icon: <Building2 size={15} />,
            title: "Mid-Market",
            description: "Scale operations with advanced workflows",
            href: "/MidMarket",
          },
          {
            icon: <Globe size={15} />,
            title: "Enterprise",
            description: "Multi-entity, multi-currency, global deployments",
                   href: "/Enterprise",
          },
        ],
      },
      {
        heading: "By Function",
        items: [
          {
            icon: <DollarSign size={15} />,
            title: "Finance Teams",
            description: "Automate close, compliance, and reporting",
          },
          {
            icon: <Package size={15} />,
            title: "Operations",
            description: "Streamline supply chain and fulfillment",
          },
          {
            icon: <Users size={15} />,
            title: "Sales & Revenue",
            description: "Accelerate pipeline and close faster",
          },
          {
            icon: <LayoutDashboard size={15} />,
            title: "IT & Admins",
            description: "Manage integrations, access, and system health",
          },
        ],
      },
    ],
    cta: {
      label: "Find your industry solution",
      buttonLabel: "Explore Solutions",
    },
  },

  Pricing: {
    columns: [
      {
        heading: "Plans",
        items: [
          {
            icon: <Rocket size={15} />,
            title: "Starter",
            description: "Core ERP modules for growing businesses up to 25 users",
          },
          {
            icon: <Building2 size={15} />,
            title: "Growth",
            description: "Advanced automation and multi-branch support",
            badge: "Most Popular",
          },
          {
            icon: <Globe size={15} />,
            title: "Enterprise",
            description: "Full suite with custom SLA and dedicated support",
          },
        ],
      },
      {
        heading: "Compare & Calculate",
        items: [
          {
            icon: <CheckCircle size={15} />,
            title: "Compare Plans",
            description: "Side-by-side feature comparison across all tiers",
          },
          {
            icon: <Calculator size={15} />,
            title: "ROI Calculator",
            description: "Estimate your savings and payback period",
          },
          {
            icon: <Tag size={15} />,
            title: "Volume Discounts",
            description: "Custom pricing for 100+ seat deployments",
          },
        ],
      },
      {
        heading: "Add-ons",
        items: [
          {
            icon: <Plug size={15} />,
            title: "Integration Pack",
            description: "Premium connectors for Shopify, Stripe, and Xero",
          },
          {
            icon: <Shield size={15} />,
            title: "Advanced Security",
            description: "SSO, audit logs, IP restrictions, and more",
          },
          {
            icon: <HeadphonesIcon size={15} />,
            title: "Priority Support",
            description: "Dedicated CSM and guaranteed SLA response times",
          },
        ],
      },
    ],
    cta: {
      label: "Not sure which plan fits your team?",
      buttonLabel: "Talk to Sales",
      highlight: "No long-term contracts",
    },
  },

  Customers: {
    columns: [
      {
        heading: "Success Stories",
        items: [
          {
            icon: <Star size={15} />,
            title: "Customer Stories",
            description: "How businesses scaled with Bizak ERP",
          },
          {
            icon: <BarChart3 size={15} />,
            title: "Case Studies",
            description: "Detailed results and metrics from real deployments",
                href: "/case-studies", // ← Add this
          },
          {
            icon: <Heart size={15} />,
            title: "Reviews & Ratings",
            description: "Verified reviews from G2, Capterra, and Trustpilot",
          },
        ],
      },


      
      {
        heading: "By Industry",
        items: [
          {
            icon: <Factory size={15} />,
            title: "Manufacturing Wins",
            description: "Production efficiency gains across the sector",
          },
          {
            icon: <Truck size={15} />,
            title: "Distribution Leaders",
            description: "Logistics and fulfillment transformation stories",
          },
          {
            icon: <Store size={15} />,
            title: "Retail Champions",
            description: "Omnichannel and POS success stories",
          },
        ],
      },
      {
        heading: "Community",
        items: [
          {
            icon: <Users size={15} />,
            title: "Customer Community",
            description: "Connect with 5,000+ Bizak users worldwide",
          },
          {
            icon: <Award size={15} />,
            title: "Customer Advisory Board",
            description: "Shape the future of the product with us",
          },
          {
            icon: <Calendar size={15} />,
            title: "User Conference",
            description: "BizakConnect 2025 — Join our annual summit",
            badge: "Sept 2025",
          },
        ],
      },
    ],
    cta: {
      label: "Join 5,000+ businesses growing with Bizak",
      buttonLabel: "Read Stories",
    },
  },

  Partners: {
    columns: [
      {
        heading: "Partner Types",
        items: [
          {
            icon: <Handshake size={15} />,
            title: "Resellers",
            description: "Sell and implement Bizak in your local market",
          },
          {
            icon: <UserCheck size={15} />,
            title: "Consultants & SIs",
            description: "Deliver Bizak implementations for clients",
          },
          {
            icon: <Plug size={15} />,
            title: "Technology Partners",
            description: "Build integrations on top of Bizak APIs",
          },
        ],
      },
      {
        heading: "Partner Resources",
        items: [
          {
            icon: <BookOpen size={15} />,
            title: "Partner Portal",
            description: "Access training, certifications, and sales tools",
          },
          {
            icon: <FileText size={15} />,
            title: "Marketplace",
            description: "Discover and list partner extensions",
          },
          {
            icon: <Globe size={15} />,
            title: "Find a Partner",
            description: "Locate a certified Bizak partner near you",
          },
        ],
      },
      {
        heading: "Grow Together",
        items: [
          {
            icon: <Rocket size={15} />,
            title: "Become a Partner",
            description: "Apply to join the Bizak Partner Network",
                  href: "/partners", // ← Add this
            
          },
          {
            icon: <Award size={15} />,
            title: "Partner Awards",
            description: "Recognizing excellence in our partner ecosystem",
          },
          {
            icon: <Calendar size={15} />,
            title: "Partner Events",
            description: "Upcoming training, summits, and webinars",
          },
        ],
      },
    ],
    cta: {
      label: "Grow your practice with Bizak",
      buttonLabel: "Become a Partner",
    },
  },

  Resources: {
    columns: [
      {
        heading: "Learn",
        items: [
          {
            icon: <BookOpen size={15} />,
            title: "Documentation",
            description: "Full technical docs for all modules and APIs",
          },
          {
            icon: <FileText size={15} />,
            title: "Blog",
            description: "Insights on ERP, finance, and operations",
   href: "/Blog", // ← Add this



          },
          {
            icon: <BookMarked size={15} />,
            title: "Guides & Playbooks",
            description: "Step-by-step implementation guides",
          },
        ],
      },
      {
        heading: "Support",
        items: [
          {
            icon: <HeadphonesIcon size={15} />,
            title: "Help Center",
            description: "Find answers to common questions",
               href: "/HelpCenter", // ← Add this
          },
          {
            icon: <MessageSquare size={15} />,
            title: "Community Forum",
            description: "Ask questions and share tips with peers",
          },
          {
            icon: <GraduationCap size={15} />,
            title: "Training & Certification",
            description: "Self-paced courses and official certifications",
          },
        ],
      },
      {
        heading: "Tools",
        items: [
          {
            icon: <Calculator size={15} />,
            title: "ROI Calculator",
            description: "Estimate your savings and payback period",
          },
          {
            icon: <FileText size={15} />,
            title: "Templates Library",
            description: "Ready-to-use finance and operations templates",
          },
          {
            icon: <Video size={15} />,
            title: "Webinars & Events",
            description: "Live and on-demand product sessions",
            badge: "Live",
          },
        ],
      },
    ],
    cta: {
      label: "Explore all resources",
      buttonLabel: "Visit Resource Center",
    },
  },

  Company: {
    columns: [
      {
        heading: "About",
        items: [
          {
            icon: <Info size={15} />,
            title: "About Bizak",
            description: "Our story, mission, and the team behind the product",
            href: "/About", // ← Add this
          },
          {
            icon: <Target size={15} />,
            title: "Our Mission",
            description: "Empowering businesses with clarity and control",
            href: "/OurMission",
          },
          {
            icon: <Users size={15} />,
            title: "Leadership Team",
            description: "Meet the people driving Bizak forward",
          },
        ],
      },
      {
        heading: "Connect",
        items: [
          {
            icon: <Briefcase size={15} />,
            title: "Careers",
            description: "Join a team building the future of enterprise ERP",
            badge: "Hiring",
            href: "/careers",
          },
          {
            icon: <FileText size={15} />,
            title: "Press & Media",
            description: "News, brand assets, and media kit",
          },
          {
            icon: <Calendar size={15} />,
            title: "Events",
            description: "Conferences, webinars, and roadshows",
          },
        ],
      },
      {
        heading: "Support & Trust",
        items: [
          {
            icon: <Mail size={15} />,
            title: "Contact Us",
            description: "Reach our team for sales and general support",
               href: "/Contact", // ← Add this

          },
          {
            icon: <Shield size={15} />,
            title: "Trust Center",
            description: "Compliance, certifications, and data policies",
          },
          {
            icon: <Activity size={15} />,
            title: "System Status",
            description: "Live uptime monitoring and incident reporting",
          },
        ],
      },
    ],
    cta: {
      label: "Want to learn more about Bizak?",
      buttonLabel: "Contact Us",
    },
  },
};

const NAV_ITEMS = [
  "Product",
  "Solutions",
  // "Pricing",
  "Customers",
  "Partners",
  "Resources",
  "Company",
];

// ─── MenuItem Component ───────────────────────────────────────────────────────

function MegaMenuItem({ item }: { item: MenuItem }) {
  return (
    <a
   

     href={item.href || "#"}          // ← Use item.href here
 onClick={item.href ? undefined : (e) => e.preventDefault()} // ← Only prevent default if no href

 
      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#f7f8f5] transition-all duration-150 cursor-pointer"
    >
      <div
        className="mt-0.5 flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center rounded-md transition-all duration-150"
        style={{ background: "#f2f3ef", color: "#7a826d" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#7a826d";
          (e.currentTarget as HTMLElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#f2f3ef";
          (e.currentTarget as HTMLElement).style.color = "#7a826d";
        }}
      >
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[#1c1c1c] group-hover:text-[#7a826d] transition-colors duration-150"
            style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 13.5, lineHeight: 1.3 }}
          >
            {item.title}
          </span>
          {item.badge && (
            <span
              className="flex-shrink-0 px-1.5 py-[2px] rounded"
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 9.5,
                letterSpacing: "0.4px",
                background: "rgba(122,130,109,0.12)",
                color: "#7a826d",
                textTransform: "uppercase",
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p
          className="text-[#999] leading-snug mt-[3px] group-hover:text-[#777] transition-colors"
          style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 12 }}
        >
          {item.description}
        </p>
      </div>
    </a>
  );
}

// ─── Mega Menu Panel ──────────────────────────────────────────────────────────

function MegaMenuPanel({
  data,
  visible,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: MegaMenuPanelProps) {
  const colCount = data.columns.length;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0px)"
          : "translateX(-50%) translateY(-10px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.18s ease, transform 0.2s ease",
        width: colCount === 3 ? "min(1080px, calc(100vw - 64px))" : "min(780px, calc(100vw - 64px))",
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid #eaece7",
        boxShadow: "0 8px 48px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      {/* Caret pointer */}
      <div
        style={{
          position: "absolute",
          top: -6,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 12,
          height: 12,
          background: "#ffffff",
          border: "1px solid #eaece7",
          borderBottom: "none",
          borderRight: "none",
        }}
      />

      <div style={{ padding: "28px 28px 24px" }}>
        {/* Column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            gap: "24px 32px",
          }}
        >
          {data.columns.map((col, colIdx) => (
            <div key={colIdx}>
              {col.heading && (
                <div
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: 10,
                    letterSpacing: "0.8px",
                    color: "#c0c0b8",
                    textTransform: "uppercase",
                    marginBottom: 10,
                    paddingBottom: 10,
                    borderBottom: "1px solid #f0f1ed",
                  }}
                >
                  {col.heading}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {col.items.map((item, itemIdx) => (
                  <MegaMenuItem key={itemIdx} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Bar */}
        {data.cta && (
          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px solid #f0f1ed",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: 13,
                  color: "#666",
                }}
              >
                {data.cta.label}
              </span>
              {data.cta.highlight && (
                <span
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: 12,
                    color: "#bbb",
                  }}
                >
                  — {data.cta.highlight}
                </span>
              )}
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="group flex-shrink-0 inline-flex items-center gap-2 hover:gap-3 transition-all duration-150"
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 13,
                color: "#fff",
                background: "#1a1a1a",
                padding: "10px 20px",
                borderRadius: 8,
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#3a3a3a")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#1a1a1a")
              }
            >
              {data.cta.buttonLabel}
              <ArrowRight size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Reset expansion when drawer closes
  useEffect(() => {
    if (!open) setExpandedItem(null);
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 45,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.22s ease",
        }}
      />

      {/* Slide-in panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 360,
          background: "#ffffff",
          zIndex: 50,
          overflowY: "auto",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: 76,
            borderBottom: "1px solid #f0f1ed",
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={bizakLogo}
              alt="Bizak ERP"
              style={{ height: 22, width: "auto", display: "block" }}
            />
          </a>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav accordion */}
        <div style={{ padding: "12px 12px 0" }}>
          {NAV_ITEMS.map((item) => {
            const menuData = megaMenus[item];
            const isExpanded = expandedItem === item;
            return (
              <div key={item}>
                <button
                  onClick={() => setExpandedItem(isExpanded ? null : item)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: isExpanded ? "#f7f8f5" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: 15,
                      color: isExpanded ? "#1a1a1a" : "#444",
                    }}
                  >
                    {item}
                  </span>
                  <ChevronDown
                    size={15}
                    color={isExpanded ? "#7a826d" : "#bbb"}
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {/* Accordion content */}
                <div
                  style={{
                    maxHeight: isExpanded ? 900 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.32s ease",
                  }}
                >
                  {menuData && (
                    <div style={{ padding: "4px 8px 12px 12px" }}>
                      {menuData.columns.map((col, cIdx) => (
                        <div key={cIdx} style={{ marginBottom: 12 }}>
                          {col.heading && (
                            <div
                              style={{
                                fontFamily: "Inter",
                                fontWeight: 600,
                                fontSize: 9.5,
                                letterSpacing: "0.7px",
                                color: "#ccc",
                                textTransform: "uppercase",
                                padding: "10px 12px 6px",
                              }}
                            >
                              {col.heading}
                            </div>
                          )}
                          {col.items.map((mItem, mIdx) => (
                            <a
                              key={mIdx}
                              href={mItem.href || "#"}
                              onClick={mItem.href ? undefined : (e) => e.preventDefault()}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 12px",
                                borderRadius: 8,
                                textDecoration: "none",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.background = "#f7f8f5")
                              }
                              onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.background = "transparent")
                              }
                            >
                              <div
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: 6,
                                  background: "#f2f3ef",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#7a826d",
                                  flexShrink: 0,
                                }}
                              >
                                {mItem.icon}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: 13.5,
                                    color: "#333",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  {mItem.title}
                                  {mItem.badge && (
                                    <span
                                      style={{
                                        fontSize: 9,
                                        fontWeight: 600,
                                        background: "rgba(122,130,109,0.12)",
                                        color: "#7a826d",
                                        padding: "1px 5px",
                                        borderRadius: 4,
                                        letterSpacing: "0.3px",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      {mItem.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            padding: "20px 20px 32px",
            marginTop: 8,
            borderTop: "1px solid #f0f1ed",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* <a
            href="https://system.bizakerp.com"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: 10,
              border: "1px solid #e8eae4",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 14,
              color: "#444",
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#f7f8f5")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            Log in
          </a> */}


          
    <a
            href="https://system.bizakerp.com" target="_blank"
           
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: 10,
              border: "1px solid #e8eae4",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 14,
              color: "#444",
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#f7f8f5")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            Log in
          </a> 


          <a
            href="/Contact"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px",
              borderRadius: 10,
              background: "#1a1a1a",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 14,
              color: "#fff",
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#333")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#1a1a1a")
            }
          >
            Request Demo
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </>
  );
}

// ─── Main Header Component ────────────────────────────────────────────────────

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega menu when clicking outside
  useEffect(() => {
    const onClick = () => setActiveMenu(null);
    if (activeMenu) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [activeMenu]);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setActiveMenu(null), 300);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handleNavEnter = (item: string) => {
    cancelClose();
    if (megaMenus[item]) setActiveMenu(item);
  };

  return (
    <>
      {/* Soft backdrop tint behind mega menu */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 35,
          background: activeMenu ? "rgba(0,0,0,0.05)" : "transparent",
          pointerEvents: "none",
          transition: "background 0.2s ease",
        }}
      />

      {/* ──────────────── Header Bar ──────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "#ffffff",
          boxShadow: scrolled || activeMenu
            ? "0 1px 0 rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.07)"
            : "0 1px 0 rgba(0,0,0,0.07)",
          transition: "box-shadow 0.25s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 24px",
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* ── Logo ── */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <img
              src={bizakLogo}
              alt="Bizak ERP"
              style={{ height: 25, width: "auto", display: "block" }}
            />
          </a>

          {/* ── Desktop Center Navigation ── */}
          <nav
            className="hidden lg:flex"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              alignItems: "center",
              gap: 2,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const hasMega = !!megaMenus[item];
              const isActive = activeMenu === item;
              return (
                <div
                  key={item}
                  style={{ position: "relative" }}
                  onMouseEnter={() => handleNavEnter(item)}
                  onMouseLeave={scheduleClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onMouseEnter={cancelClose}
                    onFocus={() => handleNavEnter(item)}
                    onBlur={scheduleClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "8px 13px",
                      borderRadius: 8,
                      border: "none",
                      background: isActive ? "#f5f5f2" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                      outline: "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: 14,
                        color: isActive ? "#1a1a1a" : "#555",
                        transition: "color 0.15s ease",
                      }}
                    >
                      {item}
                    </span>
                    {hasMega && (
                      <ChevronDown
                        size={13}
                        style={{
                          color: isActive ? "#7a826d" : "#c0c0b8",
                          transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease, color 0.15s ease",
                        }}
                      />
                    )}
                  </button>

                  {/* Bridge: transparent hover zone covering the gap between button and panel */}
                  {hasMega && (
                    <div
                      aria-hidden="true"
                      onMouseEnter={cancelClose}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "-20px",
                        right: "-20px",
                        height: "10px",
                        zIndex: 99,
                      }}
                    />
                  )}

                  {/* Mega Menu Panel */}
                  {hasMega && (
                    <MegaMenuPanel
                      data={megaMenus[item]}
                      visible={isActive}
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                      onFocus={cancelClose}
                      onBlur={scheduleClose}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── Right: Auth Actions ── */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            <a
              href="https://system.bizakerp.com" target="_blank"
         
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 14,
                color: "#555",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: 8,
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#f5f5f2";
                (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#555";
              }}
            >
              Log in
            </a>

            <div
              style={{ width: 1, height: 16, background: "#e8eae4", margin: "0 4px" }}
            />

            <a className="biz-shimmer-btn"
              href="/Contact"
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 13.5,
                color: "#1A1D19",
                // background: "#1a1a1a",
                padding: "10px 20px",
                borderRadius: 9,
                textDecoration: "none",
                height: 40,
                transition: "background 0.15s ease, gap 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#C7FF35";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#C7FF35";
              }}
            >
              Request Demo
              <ArrowRight size={13} />
            </a>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="flex lg:hidden"
            onClick={() => setMobileOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#f5f5f2")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}