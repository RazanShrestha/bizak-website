import { useState, useRef, useEffect } from "react";
import { Pill } from "./bz";
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

// ─── Bizak wordmark (white) ───────────────────────────────────────────────────
// The "bizak" lettering lifted from the all-white horizontal lockup, with the
// leaf symbol dropped. Used by the dark header variant. fill="currentColor" so
// the colour is theme-driven.
function BizakWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="223.86 2.5 348.59 120.17"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M224.86,119.5V8.83h19.56v41.39h.81c4.9-9.87,12.81-14.81,23.72-14.81,4.83,0,9.31.94,13.45,2.81,4.14,1.87,7.76,4.58,10.86,8.11,3.1,3.53,5.53,8.02,7.29,13.48,1.76,5.46,2.65,11.56,2.65,18.29s-.86,12.77-2.59,18.21c-1.73,5.44-4.13,9.94-7.19,13.51-3.06,3.57-6.67,6.31-10.83,8.24-4.16,1.93-8.69,2.89-13.59,2.89-10.92,0-18.84-4.84-23.78-14.54h-1.13v13.08h-19.24ZM249.15,58.6c-3.4,4.76-5.11,11.22-5.11,19.4s1.71,14.71,5.13,19.59c3.42,4.88,8.21,7.32,14.37,7.32s11.12-2.48,14.56-7.43c3.44-4.95,5.16-11.45,5.16-19.48,0-5.22-.73-9.81-2.19-13.75-1.46-3.94-3.68-7.06-6.67-9.35-2.99-2.29-6.61-3.43-10.86-3.43-6.2,0-11,2.38-14.4,7.13Z" />
      <path d="M320.61,24.72c-3.13,0-5.81-1.03-8.02-3.11-2.22-2.07-3.32-4.57-3.32-7.48s1.11-5.47,3.32-7.54c2.21-2.07,4.89-3.11,8.02-3.11s5.75,1.04,7.97,3.11c2.22,2.07,3.32,4.58,3.32,7.54s-1.11,5.41-3.32,7.48-4.87,3.11-7.97,3.11ZM310.78,119.5V36.5h19.56v83h-19.56Z" />
      <path d="M340.23,119.5v-12.43l42.8-53.66v-.7h-41.39v-16.21h65.33v13.35l-40.74,52.74v.7h42.15v16.21h-68.14Z" />
      <path d="M441.55,121.17c-5.37,0-10.11-.93-14.24-2.78-4.13-1.85-7.41-4.69-9.86-8.51-2.45-3.82-3.67-8.38-3.67-13.67,0-3.6.59-6.81,1.78-9.62,1.19-2.81,2.73-5.1,4.62-6.86,1.89-1.77,4.26-3.27,7.11-4.51,2.85-1.24,5.67-2.16,8.48-2.76s5.98-1.09,9.51-1.49c8-.86,12.91-1.51,14.75-1.95,3.06-.72,4.9-1.93,5.51-3.62.18-.54.27-1.17.27-1.89v-.32c0-4.11-1.21-7.27-3.62-9.48-2.41-2.22-5.89-3.32-10.43-3.32s-8.21.99-11.1,2.97c-2.9,1.98-4.87,4.5-5.92,7.57l-18.26-2.59c2.13-7.42,6.3-13.09,12.51-17.02,6.21-3.93,13.77-5.89,22.67-5.89,3.35,0,6.56.28,9.62.84,3.06.56,6.09,1.53,9.08,2.92,2.99,1.39,5.57,3.13,7.75,5.24,2.18,2.11,3.93,4.84,5.27,8.19,1.33,3.35,2,7.13,2,11.35v55.55h-18.81v-11.4h-.65c-1.95,3.82-4.97,6.95-9.08,9.4-4.11,2.45-9.21,3.67-15.29,3.67ZM446.63,106.8c5.73,0,10.37-1.66,13.91-4.97,3.55-3.31,5.32-7.35,5.32-12.1v-9.78c-1.59,1.3-7.57,2.65-17.94,4.05-10.2,1.44-15.29,5.4-15.29,11.89,0,3.49,1.28,6.19,3.84,8.08,2.56,1.89,5.94,2.84,10.16,2.84Z" />
      <path d="M495.96,119.5V8.83h19.56v61.01h1.35l29.83-33.34h22.86l-32.15,35.83,34.04,47.17h-23.4l-25.4-35.5-7.13,7.62v27.88h-19.56Z" />
    </svg>
  );
}

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

interface FeaturedMenu {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  highlights: { value: string; label: string }[];
}

interface MegaMenuData {
  columns: MenuColumn[];
  featured?: FeaturedMenu;
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
    ],
    cta: { label: "Find the right Bizak solution for your team.", buttonLabel: "Explore Solutions" },
  },

  Customers: {
    columns: [],
    featured: {
      icon: <BarChart3 size={20} />,
      eyebrow: "Success Stories",
      title: "Case Studies",
      description:
        "Real metrics and measurable outcomes from teams running on Bizak: faster closes, cleaner books, and operations built to scale.",
      href: "/case-studies",
      ctaLabel: "Explore all case studies",
      highlights: [
        { value: "100%", label: "Cloud-based platform" },
        { value: "24/7", label: "Anytime, anywhere" },
        { value: "12+", label: "Industries served" },
      ],
    },
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
        ],
      },
      {
        heading: "Grow Together",
        items: [
          { icon: <Rocket size={16} />, title: "Become a Partner", description: "Join the network", href: "/partners" },
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
          { icon: <FileText size={16} />, title: "Blog", description: "ERP, finance, ops insights", href: "/blog" },
          { icon: <BookMarked size={16} />, title: "Guides & Playbooks", description: "Implementation guides", href: "/GuidesAndPlaybooks" },
        ],
      },
      {
        heading: "Support",
        items: [
          { icon: <HeadphonesIcon size={16} />, title: "Help Center", description: "Answers to common Qs", href: "/HelpCenter" },
          { icon: <GraduationCap size={16} />, title: "Training & Certification", description: "Courses & badges", href: "/TrainingAndCertification" },
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
        ],
      },
      {
        heading: "Connect",
        items: [
          { icon: <Briefcase size={16} />, title: "Careers", description: "Build the future of ERP", badge: "Hiring", href: "/careers" },
          { icon: <FileText size={16} />, title: "Press & Media", description: "News and brand kit", href: "/PressAndMedia" },
        ],
      },
      {
        heading: "Support & Trust",
        items: [
          { icon: <Mail size={16} />, title: "Contact Us", description: "Sales & support", href: "/contact" },
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

// ─── Featured Menu Panel (single-focus menus, e.g. Customers) ─────────────────

function FeaturedPanel({ data }: { data: FeaturedMenu }) {
  return (
    <a href={data.href} className="group block no-underline p-[22px]">
      <div className="flex items-center gap-3.5">
        <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-bz-olive text-bz-leaf">
          {data.icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium tracking-[0.2em] text-bz-text-soft uppercase leading-none">
            {data.eyebrow}
          </div>
          <div className="font-semibold text-[17px] text-bz-text tracking-[-0.01em] mt-[7px] leading-none">
            {data.title}
          </div>
        </div>
      </div>

      <p className="text-[13px] text-bz-text-muted mt-3.5 leading-[1.55] mb-0">
        {data.description}
      </p>

      <div className="grid grid-cols-3 mt-[18px] rounded-bz-2xl bg-bz-paper-warm overflow-hidden">
        {data.highlights.map((h, i) => (
          <div
            key={h.label}
            className={`px-4 py-3.5 ${i > 0 ? "border-l border-bz-line-soft" : ""}`}
          >
            <div className="text-[19px] font-semibold text-bz-text tracking-[-0.02em] leading-none">
              {h.value}
            </div>
            <div className="text-[11px] text-bz-text-muted mt-[7px] leading-[1.3]">
              {h.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-[18px] pt-[18px] border-t border-bz-line-soft">
        <span className="text-[13.5px] font-medium text-bz-text tracking-[-0.005em]">
          {data.ctaLabel}
        </span>
        <span className="w-7 h-7 rounded-full bg-bz-olive text-bz-leaf flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5">
          <ArrowRight size={14} />
        </span>
      </div>
    </a>
  );
}

// ─── Mega Menu Panel ──────────────────────────────────────────────────────────

function MegaPanel({ data, visible }: { data: MegaMenuData; visible: boolean }) {
  const colCount = data.columns.length;
  const width = data.featured
    ? "min(520px, calc(100vw - 32px))"
    : colCount === 3
      ? "min(1180px, calc(100vw - 32px))"
      : "min(820px, calc(100vw - 32px))";
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
        width,
        boxShadow: "0 4px 32px rgba(15,20,17,0.08)",
      }}
    >
      {data.featured ? (
        <FeaturedPanel data={data.featured} />
      ) : (
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
      )}
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
            <img src={bizakLogo} alt="Bizak ERP" className="h-6 w-auto" />
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
                  {data?.featured && (
                    <div className="px-1.5 pb-3 pt-1.5">
                      <a
                        href={data.featured.href}
                        onClick={onClose}
                        className="block no-underline rounded-bz-xl border border-bz-line-soft bg-bz-paper-warm p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-bz-olive text-bz-leaf flex items-center justify-center flex-shrink-0">
                            {data.featured.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-medium tracking-[0.18em] text-bz-text-soft uppercase">
                              {data.featured.eyebrow}
                            </div>
                            <div className="font-semibold text-[14px] text-bz-text mt-0.5">
                              {data.featured.title}
                            </div>
                          </div>
                        </div>
                        <p className="text-[12px] text-bz-text-muted mt-2.5 leading-[1.5] mb-0">
                          {data.featured.description}
                        </p>
                        <div className="grid grid-cols-3 gap-2.5 mt-3.5 pt-3.5 border-t border-bz-line-soft">
                          {data.featured.highlights.map((h) => (
                            <div key={h.label}>
                              <div className="text-[15px] font-semibold text-bz-text leading-none">
                                {h.value}
                              </div>
                              <div className="text-[10px] text-bz-text-muted mt-1 leading-[1.3]">
                                {h.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </a>
                    </div>
                  )}
                  {data && !data.featured && (
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
          <Pill
            variant="light"
            href="https://system.bizakerp.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="justify-center"
          >
            Sign in
          </Pill>
          <Pill
            variant="dark"
            href="/contact"
            onClick={onClose}
            className="justify-center"
            withArrow
          >
            Request Demo
          </Pill>
        </div>
      </div>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header({ dark = false }: { dark?: boolean } = {}) {
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
        className={`relative border-b py-1 lg:pt-2 lg:pb-3 ${
          dark ? "bz-nav--dark bg-bz-olive" : "bg-bz-section-b"
        }`}
        style={{ borderBottomColor: dark ? "transparent" : "rgba(15,20,17,0.08)" }}
      >
        <div className="bz-container-px" style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div className="bz-nav-card">

            {/* Logo */}
            <a
              href="/"
              aria-label="Bizak ERP"
              className="flex items-center no-underline flex-shrink-0 mr-7"
            >
              {dark ? (
                <BizakWordmark className="h-[22px] w-auto text-bz-paper" />
              ) : (
                <img src={bizakLogo} alt="Bizak ERP" className="h-6 w-auto" />
              )}
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
                            isActive
                              ? `rotate-180 ${dark ? "text-bz-text-on-dark" : "text-bz-text"}`
                              : dark
                                ? "text-white/55"
                                : "text-bz-text-soft"
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
              <Pill variant={dark ? "accent" : "dark"} href="/contact" withArrow>
                Request Demo
              </Pill>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`flex lg:hidden ml-auto w-11 h-11 items-center justify-center border-none bg-transparent cursor-pointer ${
                dark ? "text-bz-text-on-dark" : "text-bz-text"
              }`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={2} />
            </button>

          </div>
        </div>

        {/* Panels anchored to <header> left:50% centers on the full viewport width */}
        {Object.entries(megaMenus).map(([key, data]) => (
          <MegaPanel key={key} data={data} visible={activeMenu === key} />
        ))}
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
