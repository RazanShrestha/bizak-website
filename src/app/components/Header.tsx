import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
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
  Activity,
} from "lucide-react";
import bizakLogo from "../../assets/bizaklogo.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  href?: string;
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
    href?: string;
  };
}

// ─── Mega Menu Data ───────────────────────────────────────────────────────────

const megaMenus: Record<string, MegaMenuData> = {
  Product: {
    columns: [
      {
        heading: "Main Flow",
        items: [
          { icon: <Layers size={16} />, title: "Bizak ERP Platform", description: "One system for finance, inventory, sales, operations", href: "/product" },
          { icon: <Target size={16} />, title: "Why Bizak", description: "Replace spreadsheets, unify your stack", href: "/why-bizak" },
          { icon: <Shield size={16} />, title: "Architecture & Security", description: "Enterprise-grade infrastructure" },
        ],
      },
      {
        heading: "Core Modules",
        items: [
          { icon: <DollarSign size={16} />, title: "Financial Management", description: "Ledger, AR, AP, reporting", href: "/FinancialManagement" },
          { icon: <ShoppingCart size={16} />, title: "Sales & CRM", description: "Quotes, orders, invoicing", badge: "Popular", href: "/SalesCrm" },
          { icon: <Truck size={16} />, title: "Purchasing", description: "Vendor and procurement", href: "/purchasing" },
          { icon: <Package size={16} />, title: "Inventory", description: "Real-time stock control", href: "/InventoryAndWarehouse" },
          { icon: <Factory size={16} />, title: "Manufacturing", description: "Production planning", href: "/ManufacturingProduct" },
          { icon: <FolderKanban size={16} />, title: "Projects & Job Costing", description: "Project profitability", href: "/ProjectAndCosting" },
        ],
      },
      {
        heading: "Capabilities",
        items: [
          { icon: <BarChart3 size={16} />, title: "Dashboards & Reporting", description: "Real-time insights", href: "/DashboardAndReporting" },
          { icon: <Zap size={16} />, title: "Workflow Automation", description: "Automate approvals", href: "/workflow" },
          { icon: <Plug size={16} />, title: "Integrations", description: "Banks, ecommerce, APIs", href: "/Integrations" },
          { icon: <Building2 size={16} />, title: "Multi-company", description: "Multiple entities, one place", href: "/MulticompanyAndBranches" },
          { icon: <FileText size={16} />, title: "Document Management", description: "Files, contracts, archives", href: "/DocumentManagement" },
        ],
      },
    ],
    cta: { label: "See Bizak in action with a product expert.", buttonLabel: "Get Started", href: "/contact" },
  },

  Solutions: {
    columns: [
      {
        heading: "By Industry",
        items: [
          { icon: <Factory size={16} />, title: "Manufacturing", description: "Production, BOM, supply chain", href: "/manufacturing" },
          { icon: <Truck size={16} />, title: "Distribution", description: "Warehouse, routing, delivery", href: "/distribution" },
          { icon: <Briefcase size={16} />, title: "Professional Services", description: "Project tracking, billing", href: "/ProfessionalService" },
          { icon: <Store size={16} />, title: "Retail & E-Commerce", description: "POS, omnichannel", href: "/Retail" },
        ],
      },
      {
        heading: "By Company Size",
        items: [
          { icon: <Rocket size={16} />, title: "Startups & SMEs", description: "Pre-configured modules", href: "/StartupsAndSmes" },
          { icon: <Building2 size={16} />, title: "Mid-Market", description: "Advanced workflows", href: "/MidMarket" },
          { icon: <Globe size={16} />, title: "Enterprise", description: "Multi-entity, global", href: "/Enterprise" },
        ],
      },
      {
        heading: "By Function",
        items: [
          { icon: <DollarSign size={16} />, title: "Finance Teams", description: "Close, compliance, reporting" },
          { icon: <Package size={16} />, title: "Operations", description: "Supply chain, fulfillment" },
          { icon: <Users size={16} />, title: "Sales & Revenue", description: "Pipeline acceleration" },
          { icon: <LayoutDashboard size={16} />, title: "IT & Admins", description: "Integrations, access control" },
        ],
      },
    ],
    cta: { label: "Find the right Bizak solution for your team.", buttonLabel: "Explore Solutions" },
  },

  Customers: {
    columns: [
      {
        heading: "Success Stories",
        items: [
          { icon: <Star size={16} />, title: "Customer Stories", description: "How teams scaled with Bizak" },
          { icon: <BarChart3 size={16} />, title: "Case Studies", description: "Metrics and outcomes", href: "/case-studies" },
          { icon: <Heart size={16} />, title: "Reviews & Ratings", description: "Verified G2, Capterra reviews" },
        ],
      },
      {
        heading: "By Industry",
        items: [
          { icon: <Factory size={16} />, title: "Manufacturing Wins", description: "Production efficiency gains" },
          { icon: <Truck size={16} />, title: "Distribution Leaders", description: "Logistics transformations" },
          { icon: <Store size={16} />, title: "Retail Champions", description: "Omnichannel POS wins" },
        ],
      },
      {
        heading: "Community",
        items: [
          { icon: <Users size={16} />, title: "Customer Community", description: "5,000+ Bizak users" },
          { icon: <Award size={16} />, title: "Customer Advisory Board", description: "Shape the roadmap" },
          { icon: <Calendar size={16} />, title: "BizakConnect", description: "Annual user summit", badge: "Sept 2025" },
        ],
      },
    ],
    cta: { label: "Join 5,000+ businesses growing with Bizak.", buttonLabel: "Read Stories" },
  },

  Partners: {
    columns: [
      {
        heading: "Partner Types",
        items: [
          { icon: <Handshake size={16} />, title: "Resellers", description: "Sell in your market", href: "/partners/resellers" },
          { icon: <UserCheck size={16} />, title: "Consultants & SIs", description: "Implement for clients", href: "/partners/consultants" },
          { icon: <Plug size={16} />, title: "Technology Partners", description: "Build on Bizak APIs", href: "/partners/technology" },
        ],
      },
      {
        heading: "Resources",
        items: [
          { icon: <BookOpen size={16} />, title: "Partner Portal", description: "Training & sales tools", href: "/partners/portal" },
          { icon: <FileText size={16} />, title: "Marketplace", description: "List your extensions", href: "/partners/marketplace" },
          { icon: <Globe size={16} />, title: "Find a Partner", description: "Locate certified partners", href: "/partners/find" },
        ],
      },
      {
        heading: "Grow Together",
        items: [
          { icon: <Rocket size={16} />, title: "Become a Partner", description: "Join the network", href: "/partners" },
          { icon: <Award size={16} />, title: "Partner Awards", description: "Recognizing excellence", href: "/partners/awards" },
          { icon: <Calendar size={16} />, title: "Partner Events", description: "Training & summits", href: "/partners/events" },
        ],
      },
    ],
    cta: { label: "Grow your practice with Bizak.", buttonLabel: "Become a Partner", href: "/partners" },
  },

  Resources: {
    columns: [
      {
        heading: "Learn",
        items: [
          { icon: <BookOpen size={16} />, title: "Documentation", description: "Technical docs and APIs", href: "/documentation" },
          { icon: <FileText size={16} />, title: "Blog", description: "ERP, finance, ops insights", href: "/blog" },
          { icon: <BookMarked size={16} />, title: "Guides & Playbooks", description: "Implementation guides", href: "/GuidesAndPlaybooks" },
        ],
      },
      {
        heading: "Support",
        items: [
          { icon: <HeadphonesIcon size={16} />, title: "Help Center", description: "Answers to common Qs", href: "/HelpCenter" },
          { icon: <MessageSquare size={16} />, title: "Community Forum", description: "Ask peers, share tips", href: "/CommunityForum" },
          { icon: <GraduationCap size={16} />, title: "Training & Certification", description: "Courses & badges", href: "/TrainingAndCertification" },
        ],
      },
      {
        heading: "Tools",
        items: [
          { icon: <Calculator size={16} />, title: "ROI Calculator", description: "Estimate your savings" },
          { icon: <FileText size={16} />, title: "Templates Library", description: "Finance & ops templates" },
          { icon: <Video size={16} />, title: "Webinars & Events", description: "Live & on-demand", badge: "Live", href: "/WebinarsAndEvents" },
        ],
      },
    ],
    cta: { label: "Everything you need to get value from Bizak.", buttonLabel: "Visit Resource Center" },
  },

  Company: {
    columns: [
      {
        heading: "About",
        items: [
          { icon: <Info size={16} />, title: "About Bizak", description: "Our story and mission", href: "/about" },
          { icon: <Target size={16} />, title: "Our Mission", description: "Clarity and control", href: "/OurMission" },
          { icon: <Users size={16} />, title: "Leadership Team", description: "Meet the team", href: "/LeadershipTeam" },
        ],
      },
      {
        heading: "Connect",
        items: [
          { icon: <Briefcase size={16} />, title: "Careers", description: "Build the future of ERP", badge: "Hiring", href: "/careers" },
          { icon: <FileText size={16} />, title: "Press & Media", description: "News and brand kit", href: "/PressAndMedia" },
          { icon: <Calendar size={16} />, title: "Events", description: "Conferences and webinars" },
        ],
      },
      {
        heading: "Support & Trust",
        items: [
          { icon: <Mail size={16} />, title: "Contact Us", description: "Sales & support", href: "/contact" },
          { icon: <Shield size={16} />, title: "Trust Center", description: "Compliance & policies" },
          { icon: <Activity size={16} />, title: "System Status", description: "Live uptime monitoring", href: "/system-status" },
        ],
      },
    ],
    cta: { label: "Want to talk to us directly?", buttonLabel: "Contact Us", href: "/contact" },
  },
};

const NAV_ITEMS = ["Product", "Solutions", "Customers", "Partners", "Resources", "Company"];

// ─── Ruul-style Mega Menu Item ────────────────────────────────────────────────

function MegaItem({ item }: { item: MenuItem }) {
  return (
    <a
      href={item.href || "#"}
      onClick={item.href ? undefined : (e) => e.preventDefault()}
      className="group flex items-start gap-3 p-3 rounded-2xl transition-colors duration-150"
      style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#F4F5EF";
        const icon = e.currentTarget.querySelector("[data-icon-circle]") as HTMLElement | null;
        if (icon) {
          icon.style.background = "#1A2D20";
          icon.style.color = "#DBE9B8";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        const icon = e.currentTarget.querySelector("[data-icon-circle]") as HTMLElement | null;
        if (icon) {
          icon.style.background = "#F4F5EF";
          icon.style.color = "#1F3422";
        }
      }}
    >
      <div
        data-icon-circle
        className="mt-0.5 flex-shrink-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: "#F4F5EF",
          color: "#1F3422",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.18s ease, color 0.18s ease",
        }}
      >
        {item.icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 14,
              color: "#1A1D19",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </span>
          {item.badge && (
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 999,
                background: "#DBE9B8",
                color: "#1F3422",
                fontFamily: "Inter",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p
          style={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: 12.5,
            color: "#6E7466",
            marginTop: 4,
            lineHeight: 1.45,
          }}
        >
          {item.description}
        </p>
      </div>
      <ArrowUpRight
        size={14}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "#1F3422", marginTop: 4 }}
      />
    </a>
  );
}

// ─── Ruul-style Mega Menu Panel ───────────────────────────────────────────────

function MegaPanel({ data, visible }: { data: MegaMenuData; visible: boolean }) {
  const colCount = data.columns.length;
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-6px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.2s ease, transform 0.22s ease",
        width: colCount === 3 ? "min(1180px, calc(100vw - 32px))" : "min(820px, calc(100vw - 32px))",
        background: "#FCFCF7",
        borderRadius: 24,
        border: "1px solid #E5E5E0",
        boxShadow: "0 1px 0 rgba(15,20,17,0.03), 0 24px 64px rgba(15,20,17,0.10)",
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      <div style={{ padding: "26px 26px 22px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            columnGap: 24,
            rowGap: 12,
          }}
        >
          {data.columns.map((col, ci) => (
            <div key={ci} style={{ position: "relative" }}>
              {ci > 0 && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: -12,
                    top: 8,
                    bottom: 8,
                    width: 1,
                    background: "#E5E5E0",
                  }}
                />
              )}
              {col.heading && (
                <div
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    color: "#9CA08F",
                    textTransform: "uppercase",
                    padding: "0 12px 12px",
                  }}
                >
                  {col.heading}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {col.items.map((it, ii) => (
                  <MegaItem key={ii} item={it} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {data.cta && (
          <div
            style={{
              marginTop: 18,
              padding: "16px 18px",
              borderRadius: 18,
              background: "#1A2D20",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 14,
                fontWeight: 500,
                color: "#FCFCF7",
                letterSpacing: "-0.005em",
              }}
            >
              {data.cta.label}
            </div>
            <a
              href={data.cta.href || "#"}
              onClick={!data.cta.href ? (e) => e.preventDefault() : undefined}
              className="bz-pill bz-pill-accent"
            >
              {data.cta.buttonLabel}
              <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 45,
          background: "rgba(15,20,17,0.32)",
          backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.22s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 380,
          background: "#FCFCF7",
          zIndex: 50,
          overflowY: "auto",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-8px 0 40px rgba(15,20,17,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: 80,
            borderBottom: "1px solid #E5E5E0",
          }}
        >
          <a href="/" onClick={onClose} style={{ display: "flex" }}>
            <img src={bizakLogo} alt="Bizak ERP" style={{ height: 28, width: "auto" }} />
          </a>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              border: "1px solid #E5E5E0",
              background: "#FCFCF7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1A1D19",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "16px 14px 0" }}>
          {NAV_ITEMS.map((item) => {
            const data = megaMenus[item];
            const isOpen = expanded === item;
            return (
              <div key={item}>
                <button
                  onClick={() => setExpanded(isOpen ? null : item)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 16px",
                    borderRadius: 16,
                    border: "none",
                    background: isOpen ? "#F4F5EF" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: 16,
                      color: "#1A1D19",
                    }}
                  >
                    {item}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: "#9CA08F",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.22s ease",
                    }}
                  />
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 1200 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.32s ease",
                  }}
                >
                  {data && (
                    <div style={{ padding: "4px 6px 10px" }}>
                      {data.columns.map((col, ci) => (
                        <div key={ci} style={{ marginBottom: 8 }}>
                          {col.heading && (
                            <div
                              style={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: 10,
                                letterSpacing: "0.18em",
                                color: "#9CA08F",
                                textTransform: "uppercase",
                                padding: "10px 14px 6px",
                              }}
                            >
                              {col.heading}
                            </div>
                          )}
                          {col.items.map((mi, mid) => (
                            <a
                              key={mid}
                              href={mi.href || "#"}
                              onClick={(e) => {
                                if (!mi.href) {
                                  e.preventDefault();
                                  return;
                                }
                                onClose();
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 14px",
                                borderRadius: 12,
                                textDecoration: "none",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 999,
                                  background: "#F4F5EF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#1F3422",
                                  flexShrink: 0,
                                }}
                              >
                                {mi.icon}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: 14,
                                    color: "#1A1D19",
                                  }}
                                >
                                  {mi.title}
                                </div>
                                <div
                                  style={{
                                    fontFamily: "Inter",
                                    fontSize: 12,
                                    color: "#6E7466",
                                    marginTop: 2,
                                  }}
                                >
                                  {mi.description}
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

        <div
          style={{
            padding: "20px 20px 32px",
            marginTop: 16,
            borderTop: "1px solid #E5E5E0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <a
            href="https://system.bizakerp.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="bz-pill bz-pill-light"
            style={{ justifyContent: "center" }}
          >
            Sign in
          </a>
          <a href="/contact" onClick={onClose} className="bz-pill bz-pill-dark" style={{ justifyContent: "center" }}>
            Request Demo <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </>
  );
}

// ─── Header (Ruul: NOT sticky, click-to-open) ─────────────────────────────────

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // Click-outside closes the open menu
  useEffect(() => {
    if (!activeMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [activeMenu]);

  // Escape key closes the open menu
  useEffect(() => {
    if (!activeMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMenu]);

  const toggle = (item: string) => {
    if (megaMenus[item]) {
      setActiveMenu((prev) => (prev === item ? null : item));
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "relative",
          padding: "8px 24px 12px",
          background: "#efefe9",
          borderBottom: "1px solid rgba(15, 20, 17, 0.08)",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
          <div className="bz-nav-card">
            {/* Logo */}
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                flexShrink: 0,
                marginRight: 28,
              }}
            >
              <img src={bizakLogo} alt="Bizak ERP" style={{ height: 28, width: "auto" }} />
            </a>

            {/* Desktop nav — click-to-open */}
            <nav className="hidden lg:flex" style={{ flex: 1, gap: 0, alignItems: "center" }}>
              {NAV_ITEMS.map((item) => {
                const hasMega = !!megaMenus[item];
                const isActive = activeMenu === item;
                return (
                  <div key={item} style={{ position: "relative" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(item);
                      }}
                      aria-expanded={isActive}
                      aria-haspopup={hasMega || undefined}
                      className={`bz-nav-link ${isActive ? "is-active" : ""}`}
                    >
                      {item}
                      {hasMega && (
                        <ChevronDown
                          size={13}
                          style={{
                            color: isActive ? "#1F3422" : "#9CA08F",
                            transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.22s ease, color 0.15s ease",
                            marginLeft: 2,
                          }}
                        />
                      )}
                    </button>

                    {hasMega && <MegaPanel data={megaMenus[item]} visible={isActive} />}
                  </div>
                );
              })}
            </nav>

            {/* Right CTAs (desktop) */}
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 6, flexShrink: 0 }}>
              <a
                href="https://system.bizakerp.com"
                target="_blank"
                rel="noreferrer"
                className="bz-nav-link"
              >
                Sign in
              </a>
              <a href="/contact" className="bz-pill bz-pill-dark" style={{ padding: "10px 18px" }}>
                Request Demo
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="flex lg:hidden"
              onClick={() => setMobileOpen(true)}
              style={{
                marginLeft: "auto",
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "1px solid #E5E5E0",
                background: "#FCFCF7",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                color: "#1A1D19",
              }}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
