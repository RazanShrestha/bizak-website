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
import bizakLogo from "../../assets/logo/SVG/all-black-horizontal-lockup.svg";

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

// ─── Mega Menu Item ───────────────────────────────────────────────────────────

function MegaItem({ item }: { item: MenuItem }) {
  return (
    <a
      href={item.href || "#"}
      onClick={item.href ? undefined : (e) => e.preventDefault()}
      className="group flex items-start gap-3 p-3 rounded-bz-2xl hover:bg-bz-paper-warm transition-colors duration-150 no-underline"
    >
      <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-bz-paper-warm text-bz-olive group-hover:bg-bz-olive group-hover:text-bz-leaf transition-colors duration-[180ms]">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[14px] text-bz-text tracking-[-0.01em] leading-[1.3]">
            {item.title}
          </span>
          {item.badge && (
            <span className="px-[7px] py-[2px] rounded-full bg-bz-leaf text-bz-olive text-[10px] font-semibold tracking-[0.04em] uppercase">
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-bz-text-muted mt-1 leading-[1.45] mb-0">
          {item.description}
        </p>
      </div>
      <ArrowUpRight
        size={14}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-bz-olive mt-1"
      />
    </a>
  );
}

// ─── Mega Menu Panel ──────────────────────────────────────────────────────────

function MegaPanel({ data, visible }: { data: MegaMenuData; visible: boolean }) {
  const colCount = data.columns.length;
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute z-[100] bg-bz-paper rounded-bz-3xl border border-bz-line-soft overflow-hidden"
      style={{
        top: "calc(100% + 10px)",
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-6px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.2s ease, transform 0.22s ease",
        width: colCount === 3 ? "min(1180px, calc(100vw - 32px))" : "min(820px, calc(100vw - 32px))",
        boxShadow: "0 4px 32px rgba(15,20,17,0.08)",
      }}
    >
      <div className="px-[26px] pt-[26px] pb-[22px]">
        <div
          className="grid gap-x-6 gap-y-3"
          style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
        >
          {data.columns.map((col, ci) => (
            <div key={ci} className="relative">
              {ci > 0 && (
                <div aria-hidden className="absolute left-[-12px] top-2 bottom-2 w-px bg-bz-line-soft" />
              )}
              {col.heading && (
                <div className="text-[11px] font-medium tracking-[0.2em] text-bz-text-soft uppercase px-3 pb-3">
                  {col.heading}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {col.items.map((it, ii) => (
                  <MegaItem key={ii} item={it} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {data.cta && (
          <div className="mt-[18px] px-[18px] py-4 rounded-bz-xl bg-bz-olive flex items-center justify-between gap-[14px] flex-wrap">
            <div className="text-[14px] font-medium text-bz-text-on-dark tracking-[-0.005em]">
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
        className="fixed inset-0 z-[45] backdrop-blur-sm"
        style={{
          background: "rgba(15,20,17,0.32)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.22s ease",
        }}
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-[380px] bg-bz-paper z-50 overflow-y-auto"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-8px 0 40px rgba(15,20,17,0.12)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-20 border-b border-bz-line-soft">
          <a href="/" onClick={onClose} className="flex">
            <img src={bizakLogo} alt="Bizak ERP" className="h-7 w-auto" />
          </a>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-bz-line-soft bg-bz-paper flex items-center justify-center text-bz-text cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav sections */}
        <div className="px-3.5 pt-4">
          {NAV_ITEMS.map((item) => {
            const data = megaMenus[item];
            const isOpen = expanded === item;
            return (
              <div key={item}>
                <button
                  onClick={() => setExpanded(isOpen ? null : item)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-bz-xl border-none cursor-pointer transition-colors duration-150 ${isOpen ? "bg-bz-paper-warm" : "bg-transparent"}`}
                >
                  <span className="font-medium text-base text-bz-text">{item}</span>
                  <ChevronDown
                    size={16}
                    className={`text-bz-text-soft transition-transform duration-[220ms] ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? 1200 : 0,
                    transition: "max-height 0.32s ease",
                  }}
                >
                  {data && (
                    <div className="px-1.5 pb-2.5 pt-1">
                      {data.columns.map((col, ci) => (
                        <div key={ci} className="mb-2">
                          {col.heading && (
                            <div className="text-[10px] font-medium tracking-[0.18em] text-bz-text-soft uppercase px-3.5 pt-2.5 pb-1.5">
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
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-bz-lg no-underline"
                            >
                              <div className="w-8 h-8 rounded-full bg-bz-paper-warm flex items-center justify-center text-bz-olive flex-shrink-0">
                                {mi.icon}
                              </div>
                              <div>
                                <div className="font-medium text-[14px] text-bz-text">{mi.title}</div>
                                <div className="text-[12px] text-bz-text-muted mt-0.5">{mi.description}</div>
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

        {/* CTA buttons */}
        <div className="px-5 pt-5 pb-8 mt-4 border-t border-bz-line-soft flex flex-col gap-2.5">
          <a
            href="https://system.bizakerp.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="bz-pill bz-pill-light justify-center"
          >
            Sign in
          </a>
          <a href="/contact" onClick={onClose} className="bz-pill bz-pill-dark justify-center">
            Request Demo <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!activeMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [activeMenu]);

  useEffect(() => {
    if (!activeMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMenu]);

  const toggle = (item: string) => {
    if (megaMenus[item]) setActiveMenu((prev) => (prev === item ? null : item));
  };

  return (
    <>
      <header
        ref={headerRef}
        className="relative bg-bz-section-b border-b"
        style={{ padding: "8px 0 12px", borderBottomColor: "rgba(15,20,17,0.08)" }}
      >
        <div className="bz-container-px" style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div className="bz-nav-card">

            {/* Logo */}
            <a href="/" className="flex items-center no-underline flex-shrink-0 mr-7">
              <img src={bizakLogo} alt="Bizak ERP" className="h-7 w-auto" />
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex flex-1 items-center">
              {NAV_ITEMS.map((item) => {
                const hasMega = !!megaMenus[item];
                const isActive = activeMenu === item;
                return (
                  <div key={item}>
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
                          className={`ml-0.5 transition-[transform,color] duration-200 ${
                            isActive ? "text-bz-text rotate-180" : "text-bz-text-soft"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* Right CTAs */}
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
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
              className="flex lg:hidden ml-auto w-11 h-11 items-center justify-center border-none bg-transparent cursor-pointer text-bz-text"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={2} />
            </button>

          </div>
        </div>

        {/* Panels anchored to <header> — left:50% centers on the full viewport width */}
        {Object.entries(megaMenus).map(([key, data]) => (
          <MegaPanel key={key} data={data} visible={activeMenu === key} />
        ))}
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
