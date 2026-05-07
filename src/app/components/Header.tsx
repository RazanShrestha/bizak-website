import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import bizakLogo from "../../assets/bizaklogo.png";
import imgBlogCover from "../../assets/3ba19eec4fd3cf07fba6be8524f24fddb8d27558.png";

// Mirrors `IMG_HERO_MAIN` on CaseStudiesPage so the Customers menu thumbnail
// matches the case-studies hero image.
const CASE_STUDIES_THUMB =
  "https://images.unsplash.com/photo-1759092912815-cb0ee4a8a365?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwYnVzaW5lc3MlMjBvcGVyYXRpb25zJTIwZ2xvYmFsJTIwaGVhZHF1YXJ0ZXJzfGVufDF8fHx8MTc3MjEwOTAyNnww&ixlib=rb-4.1.0&q=80&w=1080";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  title: string;
  description?: string;
  badge?: string;
  href?: string;
}

interface MenuColumn {
  heading?: string;
  items: MenuItem[];
}

interface MegaMenuData {
  columns: MenuColumn[];
}

// ─── Mega Menu Content Data ───────────────────────────────────────────────────
//
// Data is now content-only — no per-menu visual primitives. Each menu's
// layout composition lives in its own *Layout component below, which can
// hardcode menu-specific elements (stats, featured card, image slots).

const megaMenus: Record<string, MegaMenuData> = {
  Product: {
    columns: [
      {
        heading: "Overview",
        items: [
          {
            title: "Bizak ERP Platform",
            description: "Unified system for finance, inventory, sales and operations",
            href: "/product",
          },
          {
            title: "Why Bizak",
            description: "Replace spreadsheets and disconnected legacy tools",
            href: "/why-bizak",
          },
          {
            title: "Architecture & Security",
            description: "Enterprise-grade infrastructure and reliability",
          },
        ],
      },
      {
        heading: "Core Modules",
        items: [
          {
            title: "Financial Management",
            description: "GL, AR, AP, multi-entity consolidation",
            href: "/FinancialManagement",
          },
          {
            title: "Sales & CRM",
            description: "Quotes, orders, invoicing, pipeline",
            badge: "Popular",
            href: "/SalesCrm",
          },
          {
            title: "Purchasing",
            description: "Vendors, POs, 3-way matching",
            href: "/purchasing",
          },
          {
            title: "Inventory & Warehouse",
            description: "Real-time stock and multi-location control",
            href: "/InventoryAndWarehouse",
          },
          {
            title: "Manufacturing",
            description: "BOM, routing, work orders, MRP, OEE",
            href: "/ManufacturingProduct",
          },
          {
            title: "Projects & Job Costing",
            description: "Project P&L, time, milestones, billing",
            href: "/ProjectAndCosting",
          },
          {
            title: "Sales Force Management",
            description: "Field productivity, beat plans, targets",
            href: "/SalesForceManagement",
          },
          {
            title: "Point of Sales",
            description: "In-store transactions and cashier flow",
            href: "/PointOfSales",
          },
        ],
      },
      {
        heading: "Platform",
        items: [
          {
            title: "Dashboards & Reporting",
            description: "Real-time, cross-module insights",
            href: "/DashboardAndReporting",
          },
          {
            title: "Workflow Automation",
            description: "Approvals and rules without code",
            href: "/workflow",
          },
          {
            title: "Integrations",
            description: "Banks, ecommerce, shipping, tax",
            href: "/Integrations",
          },
          {
            title: "Multi-company & Multi-branch",
            description: "Inter-company elimination, consolidated books",
            href: "/MulticompanyAndBranches",
          },
          {
            title: "Document Management",
            description: "Attachments, e-sign, retention",
            href: "/DocumentManagement",
          },
        ],
      },
    ],
  },

  Solutions: {
    columns: [
      {
        heading: "By Industry",
        items: [
          {
            title: "Manufacturing",
            description: "Production, BOM, costing, supply chain",
            href: "/manufacturing",
          },
          {
            title: "Distribution & Logistics",
            description: "Warehouse, routing, multi-channel fulfilment",
            href: "/distribution",
          },
          {
            title: "Professional Services",
            description: "Project tracking, billing, utilisation",
            href: "/ProfessionalService",
          },
          {
            title: "Retail & E-Commerce",
            description: "POS, omnichannel, inventory, returns",
            href: "/Retail",
          },
        ],
      },
      {
        heading: "By Company Size",
        items: [
          {
            title: "Startups & SMEs",
            description: "Pre-configured modules to start fast",
            href: "/StartupsAndSmes",
          },
          {
            title: "Mid-Market",
            description: "Scale with advanced workflows",
            href: "/MidMarket",
          },
          {
            title: "Enterprise",
            description: "Multi-entity, multi-currency, global",
            href: "/Enterprise",
          },
        ],
      },
      {
        heading: "By Function",
        items: [
          { title: "Finance Teams", description: "Close, compliance, reporting" },
          { title: "Operations", description: "Supply chain and fulfilment" },
          { title: "Sales & Revenue", description: "Pipeline and faster close" },
          { title: "IT & Admins", description: "Integrations, access, system health" },
        ],
      },
    ],
  },

  Customers: {
    columns: [
      {
        heading: "Stories",
        items: [
          {
            title: "Case Studies",
            description: "Detailed results and metrics from real deployments",
            href: "/case-studies",
          },
        ],
      },
    ],
  },

  Partners: {
    columns: [
      {
        heading: "Partner Types",
        items: [
          {
            title: "Resellers",
            description: "Sell and implement Bizak in your market",
            href: "/partners/resellers",
          },
          {
            title: "Consultants & SIs",
            description: "Deliver implementations for clients",
            href: "/partners/consultants",
          },
          {
            title: "Technology Partners",
            description: "Build integrations on Bizak APIs",
            href: "/partners/technology",
          },
        ],
      },
      {
        heading: "Resources",
        items: [
          {
            title: "Partner Portal",
            description: "Training, certifications, sales tools",
            href: "/partners/portal",
          },
          {
            title: "Marketplace",
            description: "Discover and list partner extensions",
            href: "/partners/marketplace",
          },
          {
            title: "Find a Partner",
            description: "Locate a certified Bizak partner",
            href: "/partners/find",
          },
        ],
      },
      {
        heading: "Grow Together",
        items: [
          {
            title: "Become a Partner",
            description: "Apply to join the Bizak Partner Network",
            href: "/partners",
          },
          {
            title: "Partner Awards",
            description: "Recognising excellence in our ecosystem",
            href: "/partners/awards",
          },
          {
            title: "Partner Events",
            description: "Training, summits, and webinars",
            href: "/partners/events",
          },
        ],
      },
    ],
  },

  Resources: {
    columns: [
      {
        heading: "Learn",
        items: [
          {
            title: "Documentation",
            description: "Full technical docs for modules and APIs",
            href: "/documentation",
          },
          {
            title: "Blog",
            description: "Insights on ERP, finance, and operations",
            href: "/blog",
          },
          {
            title: "Guides & Playbooks",
            description: "Step-by-step implementation guides",
            href: "/GuidesAndPlaybooks",
          },
        ],
      },
      {
        heading: "Support",
        items: [
          {
            title: "Help Center",
            description: "Answers to common questions",
            href: "/HelpCenter",
          },
          {
            title: "Community Forum",
            description: "Ask and share with peers",
            href: "/CommunityForum",
          },
          {
            title: "Training & Certification",
            description: "Self-paced courses and certifications",
            href: "/TrainingAndCertification",
          },
        ],
      },
      {
        heading: "Tools",
        items: [
          { title: "ROI Calculator", description: "Estimate savings and payback" },
          { title: "Templates Library", description: "Ready-to-use templates" },
          {
            title: "Webinars & Events",
            description: "Live and on-demand sessions",
            href: "/WebinarsAndEvents",
            badge: "Live",
          },
        ],
      },
    ],
  },

  Company: {
    columns: [
      {
        heading: "About",
        items: [
          {
            title: "About Bizak",
            description: "Our story, mission and team",
            href: "/about",
          },
          {
            title: "Our Mission",
            description: "Empowering businesses with clarity and control",
            href: "/OurMission",
          },
          {
            title: "Leadership Team",
            description: "Meet the people driving Bizak forward",
            href: "/LeadershipTeam",
          },
        ],
      },
      {
        heading: "Connect",
        items: [
          {
            title: "Careers",
            description: "Join the team building enterprise ERP",
            badge: "Hiring",
            href: "/careers",
          },
          {
            title: "Press & Media",
            description: "News, brand assets, and media kit",
            href: "/PressAndMedia",
          },
          {
            title: "Contact Us",
            description: "Reach our team for sales and support",
            href: "/contact",
          },
        ],
      },
      {
        heading: "Trust",
        items: [
          {
            title: "System Status",
            description: "Live uptime and incident reporting",
            href: "/system-status",
          },
        ],
      },
    ],
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

// ─── Shared Mega-Menu Atoms ───────────────────────────────────────────────────
//
// Same primitives across every menu — only the layout composition varies.

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span aria-hidden className="block h-px w-3 bg-bz-sage" />
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
        {children}
      </span>
    </div>
  );
}

function MenuLink({
  item,
  dense = false,
  dark = false,
}: {
  item: MenuItem;
  dense?: boolean;
  dark?: boolean;
}) {
  const handleClick = item.href ? undefined : (e: React.MouseEvent) => e.preventDefault();
  return (
    <a
      href={item.href || "#"}
      onClick={handleClick}
      className={`group block ${dense ? "py-1.5" : "py-2"} px-3 -mx-3 rounded-bz-md transition-colors ${
        dark ? "hover:bg-white/[0.06]" : "hover:bg-bz-bg-alt"
      }`}
    >
      <span className="flex items-baseline gap-2">
        <span
          className={`text-[13.5px] font-semibold transition-colors leading-tight ${
            dark
              ? "text-white group-hover:text-bz-accent"
              : "text-bz-text group-hover:text-bz-sage"
          }`}
        >
          {item.title}
        </span>
        {item.badge && (
          <span
            className={`text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-[2px] rounded-bz-sm ${
              dark ? "bg-bz-accent/15 text-bz-accent" : "bg-bz-sage-soft text-bz-sage"
            }`}
          >
            {item.badge}
          </span>
        )}
      </span>
      {item.description && !dense && (
        <span
          className={`block text-[11.5px] mt-0.5 leading-snug ${
            dark ? "text-white/55" : "text-bz-text-soft"
          }`}
        >
          {item.description}
        </span>
      )}
    </a>
  );
}

function MenuColumnView({ column, dense = false }: { column: MenuColumn; dense?: boolean }) {
  return (
    <div>
      {column.heading && <ColumnHeading>{column.heading}</ColumnHeading>}
      <div className="flex flex-col">
        {column.items.map((item, i) => (
          <MenuLink key={i} item={item} dense={dense} />
        ))}
      </div>
    </div>
  );
}

// ─── Per-Menu Layouts ─────────────────────────────────────────────────────────
//
// Each layout shares the menu atoms but composes them differently to suit
// the section's narrative. Stats, callouts, and image slots only appear
// where they make sense — never as boilerplate.

/** Product — dark olive pane on the left holds the title + the Overview
 *  links (the title doubles as the column heading). The right area drops
 *  to 2 columns: Core Modules (dense) + Platform. */
function ProductLayout({ data }: { data: MegaMenuData }) {
  const overview = data.columns[0];
  const coreModules = data.columns[1];
  const platform = data.columns[2];
  return (
    <div className="grid grid-cols-[300px_1fr]">
      {/* Dark pane — title doubles as Overview column heading, links below */}
      <div className="flex flex-col bg-bz-deep px-6 py-7 text-white relative overflow-hidden">
        <span
          aria-hidden
          className="absolute -top-12 -right-12 size-40 rounded-full bg-bz-accent/10 blur-2xl"
        />
        <span className="relative text-[10px] font-bold uppercase tracking-[0.16em] text-bz-accent">
          The Platform
        </span>
        <h3 className="relative mt-2.5 text-[20px] font-bold leading-[1.2] tracking-[-0.015em] text-white">
          One system.
          <br />
          Every module.
        </h3>

        <div className="relative mt-5 pt-5 border-t border-white/10 flex flex-col">
          {overview.items.map((item, i) => (
            <MenuLink key={i} item={item} dark />
          ))}
        </div>

        <a
          href="/contact"
          className="group/cta relative mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-accent hover:text-white transition-colors w-fit"
        >
          Request Demo
          <ArrowUpRight
            size={14}
            className="transition-transform duration-150 group-hover/cta:translate-x-[1px] group-hover/cta:-translate-y-[1px]"
          />
        </a>
      </div>

      {/* Right — 2 link columns on white. Core Modules dense so titles don't
          dominate; Platform keeps descriptions. */}
      <div className="px-7 py-7 grid grid-cols-2 gap-x-10 bg-bz-surface">
        <MenuColumnView column={coreModules} dense />
        <MenuColumnView column={platform} />
      </div>
    </div>
  );
}

/** Solutions — clean 3-axis catalog. The leading "By Industry" column
 *  sits on a sage-soft tint to mark it as the headline category, with the
 *  primary "Talk to Sales →" CTA pinned to its bottom. */
function SolutionsLayout({ data }: { data: MegaMenuData }) {
  return (
    <div className="grid grid-cols-3 bg-bz-surface">
      <div className="flex flex-col bg-bz-sage-soft px-6 py-7 border-r border-bz-border-soft relative">
        <span
          aria-hidden
          className="absolute top-7 left-0 block w-[3px] h-9 bg-bz-sage rounded-r-full"
        />
        <MenuColumnView column={data.columns[0]} />
        <a
          href="/contact"
          className="group/cta mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-sage hover:text-bz-sage-hover transition-colors w-fit"
        >
          Talk to Sales
          <ArrowUpRight
            size={14}
            className="transition-transform duration-150 group-hover/cta:translate-x-[1px] group-hover/cta:-translate-y-[1px]"
          />
        </a>
      </div>
      <div className="px-6 py-7">
        <MenuColumnView column={data.columns[1]} />
      </div>
      <div className="px-6 py-7 border-l border-bz-border-soft">
        <MenuColumnView column={data.columns[2]} />
      </div>
    </div>
  );
}

/** Customers — same dark two-pane design with qualitative copy on the
 *  left (no numbers) and a single thumbnail card on the right that mirrors
 *  the hero image used on /case-studies. */
function CustomersLayout(_props: { data: MegaMenuData }) {
  return (
    <div className="grid grid-cols-[1.3fr_1fr] gap-10 px-7 py-7 bg-bz-deep relative overflow-hidden">
      <span
        aria-hidden
        className="absolute -top-20 -left-10 size-56 rounded-full bg-bz-accent/8 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-24 -right-10 size-64 rounded-full bg-bz-sage/15 blur-3xl"
      />

      <div className="relative flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-accent">
          Customer Stories
        </span>
        <h3 className="mt-2.5 text-[24px] font-bold leading-[1.15] tracking-[-0.015em] text-white">
          How real teams run on Bizak.
        </h3>
        <p className="mt-3 text-[13px] leading-[1.55] text-white/65 max-w-[440px]">
          See how operators across manufacturing, distribution, services and
          retail replaced spreadsheet chaos with a single source of truth —
          and what changed for the people running the books.
        </p>

        <a
          href="/case-studies"
          className="group/cta mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-accent hover:text-white transition-colors w-fit"
        >
          Read the case studies
          <ArrowUpRight
            size={14}
            className="transition-transform duration-150 group-hover/cta:translate-x-[1px] group-hover/cta:-translate-y-[1px]"
          />
        </a>
      </div>

      {/* Thumbnail card — mirrors the hero image on /case-studies */}
      <a
        href="/case-studies"
        className="group relative flex flex-col rounded-bz-lg overflow-hidden bg-black/25 border border-white/10 hover:border-bz-accent/50 transition-colors no-underline"
      >
        <div className="aspect-[4/3] relative">
          <img
            src={CASE_STUDIES_THUMB}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-[3px] bg-bz-accent text-bz-deep text-[9px] font-bold uppercase tracking-[0.14em] rounded-bz-pill">
            <span className="size-1.5 rounded-full bg-bz-deep" aria-hidden />
            Featured
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 p-3.5 bg-black/40">
          <span className="min-w-0">
            <span className="block text-[9.5px] font-bold uppercase tracking-[0.16em] text-bz-accent">
              Case Studies
            </span>
            <span className="block mt-0.5 text-[12.5px] font-semibold text-white truncate">
              Browse the full library
            </span>
          </span>
          <ArrowUpRight
            size={14}
            className="text-white/50 group-hover:text-bz-accent transition-all duration-150 group-hover:translate-x-[1px] group-hover:-translate-y-[1px] flex-shrink-0"
          />
        </div>
      </a>
    </div>
  );
}

/** Partners — sage-soft pane on the left holds the "Partner Types" column
 *  + the "Become a Partner →" CTA. The right area is 2 cols (Resources +
 *  Grow Together). Mirrors the Product pattern where the colored pane
 *  doubles as the first-column home. */
function PartnersLayout({ data }: { data: MegaMenuData }) {
  const types = data.columns[0];
  const resources = data.columns[1];
  const grow = data.columns[2];
  return (
    <div className="grid grid-cols-[300px_1fr]">
      <div className="flex flex-col bg-bz-sage-soft px-6 py-7 relative">
        <span
          aria-hidden
          className="absolute top-7 left-0 block w-[3px] h-9 bg-bz-sage rounded-r-full"
        />
        <MenuColumnView column={types} />
        <a
          href="/partners"
          className="group/cta mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-sage hover:text-bz-sage-hover transition-colors w-fit"
        >
          Become a Partner
          <ArrowUpRight
            size={14}
            className="transition-transform duration-150 group-hover/cta:translate-x-[1px] group-hover/cta:-translate-y-[1px]"
          />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-x-10 px-7 py-7 bg-bz-surface">
        <MenuColumnView column={resources} />
        <MenuColumnView column={grow} />
      </div>
    </div>
  );
}

/** Resources — white panel with a dark-toned featured card on the left
 *  carrying a real blog cover image. The dark card is the eye-catcher;
 *  "Visit Resource Center →" pins to the bottom of the left pane. */
function ResourcesLayout({ data }: { data: MegaMenuData }) {
  return (
    <div className="grid grid-cols-[280px_1fr] gap-8 px-7 py-7 bg-bz-surface">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-sage mb-3">
          Latest
        </span>
        <a
          href="/blog"
          className="group flex flex-col rounded-bz-lg overflow-hidden bg-bz-deep hover:shadow-[0_12px_28px_rgba(20,22,18,0.18)] transition-shadow no-underline"
        >
          <div className="aspect-[16/10] relative">
            <img
              src={imgBlogCover}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-[3px] bg-bz-accent text-bz-deep text-[9px] font-bold uppercase tracking-[0.14em] rounded-bz-pill">
              <span className="size-1.5 rounded-full bg-bz-deep" aria-hidden />
              Featured
            </span>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-accent">
              Blog
            </span>
            <h4 className="mt-1.5 text-[13.5px] font-semibold leading-[1.3] tracking-[-0.005em] text-white">
              Replace your spreadsheet stack: a step-by-step playbook
            </h4>
            <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-bz-accent">
              Read article
              <ArrowUpRight
                size={12}
                className="transition-transform duration-150 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
              />
            </span>
          </div>
        </a>
        <a
          href="/documentation"
          className="group/cta mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-sage hover:text-bz-sage-hover transition-colors w-fit"
        >
          Visit Resource Center
          <ArrowUpRight
            size={14}
            className="transition-transform duration-150 group-hover/cta:translate-x-[1px] group-hover/cta:-translate-y-[1px]"
          />
        </a>
      </div>
      <div className="grid grid-cols-3 gap-x-7">
        {data.columns.map((col, i) => (
          <MenuColumnView key={i} column={col} />
        ))}
      </div>
    </div>
  );
}

/** Company — dark "We're hiring" spotlight strip across the top
 *  (tappable, links to /careers), then a clean 3-col grid below. */
function CompanyLayout({ data }: { data: MegaMenuData }) {
  return (
    <div className="bg-bz-surface">
      <a
        href="/careers"
        className="group relative flex items-center justify-between gap-4 px-7 py-3.5 bg-bz-deep overflow-hidden no-underline"
      >
        <span
          aria-hidden
          className="absolute -left-10 -top-10 size-32 rounded-full bg-bz-accent/12 blur-2xl"
        />
        <span
          aria-hidden
          className="absolute -right-12 -bottom-12 size-32 rounded-full bg-bz-sage/15 blur-2xl"
        />
        <span className="relative flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-bz-sm bg-bz-accent text-bz-deep text-[9.5px] font-bold uppercase tracking-[0.18em] flex-shrink-0">
            Hiring
          </span>
          <span className="text-[13.5px] font-semibold text-white truncate">
            Join the team building the future of enterprise ERP.
          </span>
        </span>
        <span className="relative inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-bz-accent flex-shrink-0">
          View open roles
          <ArrowUpRight
            size={13}
            className="transition-transform duration-150 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
          />
        </span>
      </a>
      <div className="grid grid-cols-3 gap-x-10 px-7 py-7">
        {data.columns.map((col, i) => (
          <MenuColumnView key={i} column={col} />
        ))}
      </div>
    </div>
  );
}

// ─── Mega Menu Panel ──────────────────────────────────────────────────────────

interface MegaMenuPanelProps {
  menu: string;
  data: MegaMenuData;
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MegaMenuPanel({
  menu,
  data,
  visible,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuPanelProps) {
  let body: React.ReactNode;
  switch (menu) {
    case "Product":
      body = <ProductLayout data={data} />;
      break;
    case "Solutions":
      body = <SolutionsLayout data={data} />;
      break;
    case "Customers":
      body = <CustomersLayout data={data} />;
      break;
    case "Partners":
      body = <PartnersLayout data={data} />;
      break;
    case "Resources":
      body = <ResourcesLayout data={data} />;
      break;
    case "Company":
      body = <CompanyLayout data={data} />;
      break;
    default:
      body = <SolutionsLayout data={data} />;
  }

  // Customers uses a full-dark panel; everyone else stays light.
  const isDark = menu === "Customers";
  const chromeClass = isDark
    ? "rounded-bz-xl bg-bz-deep border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.30),0_4px_12px_rgba(0,0,0,0.18)] overflow-hidden"
    : "rounded-bz-xl bg-bz-surface border border-bz-border shadow-[0_10px_36px_rgba(20,22,18,0.07),0_2px_8px_rgba(20,22,18,0.04)] overflow-hidden";

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-6px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.18s ease, transform 0.22s ease",
        width: "min(1040px, calc(100vw - 48px))",
        marginTop: 10,
        zIndex: 100,
      }}
    >
      <div className={chromeClass}>{body}</div>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setExpandedItem(null);
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
        className="fixed inset-0 z-[45] bg-black/25 backdrop-blur-[4px] transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none" }}
      />

      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-[360px] bg-bz-surface z-50 overflow-y-auto shadow-[-8px_0_40px_rgba(0,0,0,0.12)]"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="flex items-center justify-between px-5 h-[76px] border-b border-bz-border-soft">
          <a href="/" onClick={onClose} className="flex items-center no-underline">
            <img src={bizakLogo} alt="Bizak ERP" className="h-[22px] w-auto block" />
          </a>
          <button
            onClick={onClose}
            className="size-9 rounded-bz-md bg-transparent hover:bg-bz-bg-alt text-bz-text-muted flex items-center justify-center transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 pt-3">
          {NAV_ITEMS.map((item) => {
            const menuData = megaMenus[item];
            const isExpanded = expandedItem === item;
            return (
              <div key={item}>
                <button
                  onClick={() => setExpandedItem(isExpanded ? null : item)}
                  className={`w-full flex items-center justify-between px-3.5 py-3.5 rounded-bz-lg border-0 cursor-pointer transition-colors ${
                    isExpanded ? "bg-bz-bg-alt text-bz-text" : "bg-transparent text-bz-text-muted"
                  }`}
                >
                  <span className="text-[15px] font-medium">{item}</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-bz-sage" : "text-bz-text-soft"
                    }`}
                  />
                </button>

                <div
                  className="overflow-hidden transition-[max-height] duration-300"
                  style={{ maxHeight: isExpanded ? 1400 : 0 }}
                >
                  {menuData && (
                    <div className="pt-1 pb-3 px-2">
                      {menuData.columns.map((col, cIdx) => (
                        <div key={cIdx} className="mb-3">
                          {col.heading && (
                            <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
                              <span aria-hidden className="block w-2.5 h-px bg-bz-sage" />
                              <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
                                {col.heading}
                              </span>
                            </div>
                          )}
                          {col.items.map((mItem, mIdx) => (
                            <a
                              key={mIdx}
                              href={mItem.href || "#"}
                              onClick={(e) => {
                                if (!mItem.href) {
                                  e.preventDefault();
                                  return;
                                }
                                onClose();
                              }}
                              className="block px-3 py-2 rounded-bz-md hover:bg-bz-bg-alt transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-[13.5px] font-semibold text-bz-text">
                                  {mItem.title}
                                </span>
                                {mItem.badge && (
                                  <span className="text-[9px] font-bold uppercase tracking-[0.06em] bg-bz-sage-soft text-bz-sage px-1.5 py-[1px] rounded-bz-sm">
                                    {mItem.badge}
                                  </span>
                                )}
                              </span>
                              {mItem.description && (
                                <span className="block text-[11.5px] text-bz-text-soft mt-0.5 leading-snug">
                                  {mItem.description}
                                </span>
                              )}
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

        <div className="px-5 pt-5 pb-8 mt-2 border-t border-bz-border-soft flex flex-col gap-2.5">
          <a
            href="https://system.bizakerp.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="block text-center py-3 rounded-bz-lg border border-bz-border text-[14px] font-medium text-bz-text-muted hover:bg-bz-bg-alt no-underline transition-colors"
          >
            Log in
          </a>
          <a
            href="/contact"
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-3 rounded-bz-lg bg-bz-deep hover:bg-black/85 text-white text-[14px] font-semibold no-underline transition-colors"
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
  const [renderedMenu, setRenderedMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (activeMenu) {
      setRenderedMenu(activeMenu);
      return;
    }
    const t = setTimeout(() => setRenderedMenu(null), 220);
    return () => clearTimeout(t);
  }, [activeMenu]);

  useEffect(() => {
    const onClick = () => setActiveMenu(null);
    if (activeMenu) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [activeMenu]);

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setActiveMenu(null), 220);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleNavEnter = (item: string) => {
    cancelClose();
    if (megaMenus[item]) setActiveMenu(item);
  };

  const panelData = renderedMenu ? megaMenus[renderedMenu] : null;
  const panelVisible = !!activeMenu && activeMenu === renderedMenu;

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-[35] pointer-events-none transition-colors duration-200"
        style={{ background: activeMenu ? "rgba(20,22,18,0.10)" : "transparent" }}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-bz-surface transition-shadow duration-200 ${
          scrolled || activeMenu
            ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.06)]"
            : "shadow-[0_1px_0_rgba(0,0,0,0.05)]"
        }`}
        onMouseLeave={scheduleClose}
      >
        <div
          className="relative mx-auto flex items-center justify-between"
          style={{ maxWidth: 1320, padding: "0 24px", height: 76 }}
        >
          <a href="/" className="flex items-center no-underline flex-shrink-0">
            <img src={bizakLogo} alt="Bizak ERP" className="h-[25px] w-auto block" />
          </a>

          <nav
            className="hidden lg:flex items-center gap-0.5"
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
            onMouseEnter={cancelClose}
          >
            {NAV_ITEMS.map((item) => {
              const hasMega = !!megaMenus[item];
              const isActive = activeMenu === item;
              return (
                <div
                  key={item}
                  className="relative"
                  onMouseEnter={() => handleNavEnter(item)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onFocus={() => handleNavEnter(item)}
                    onBlur={scheduleClose}
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-bz-md border-0 cursor-pointer outline-none transition-colors duration-150 ${
                      isActive
                        ? "bg-bz-bg-alt text-bz-text"
                        : "bg-transparent text-bz-text-muted hover:text-bz-text"
                    }`}
                  >
                    <span className="text-[14px] font-medium">{item}</span>
                    {hasMega && (
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                          isActive ? "rotate-180 text-bz-sage" : "text-bz-text-soft"
                        }`}
                      />
                    )}
                  </button>
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute left-3.5 right-3.5 -bottom-[3px] h-[2px] rounded-full bg-bz-sage"
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <a
              href="https://system.bizakerp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium text-bz-text-muted hover:text-bz-text hover:bg-bz-bg-alt px-3.5 py-2 rounded-bz-md transition-colors no-underline"
            >
              Log in
            </a>

            <span className="block w-px h-4 bg-bz-border mx-1" aria-hidden />

            <a
              className="biz-shimmer-btn inline-flex items-center gap-1.5 text-[13.5px] no-underline rounded-bz-md"
              href="/contact"
              style={{
                color: "var(--bz-deep)",
                padding: "10px 20px",
                height: 40,
              }}
            >
              Request Demo
              <ArrowRight size={13} />
            </a>
          </div>

          <button
            className="flex lg:hidden size-10 rounded-bz-md bg-transparent hover:bg-bz-bg-alt text-bz-text-muted items-center justify-center cursor-pointer transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Hover bridge — full-width strip below the header so cursor never
            falls through the gap on the way to the centered panel. */}
        {activeMenu && (
          <div
            aria-hidden
            onMouseEnter={cancelClose}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              height: 14,
              zIndex: 99,
            }}
          />
        )}

        {panelData && renderedMenu && (
          <MegaMenuPanel
            menu={renderedMenu}
            data={panelData}
            visible={panelVisible}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          />
        )}
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
