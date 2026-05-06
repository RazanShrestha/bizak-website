import { useMemo, useState } from "react";
import "../../styles/style.css";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Download,
  FileArchive,
  FileCode2,
  FileText,
  Layers,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Button,
  Container,
  HeroBadge,
  PillBadge,
  Section,
} from "./marketing";

// ─── Types & data ─────────────────────────────────────────────────────────────

type CategoryKey =
  | "all"
  | "product"
  | "api"
  | "ifrs"
  | "ird"
  | "integrations"
  | "implementation"
  | "security";

type DocFormat = "PDF" | "ZIP" | "DOCX";

type Doc = {
  category: Exclude<CategoryKey, "all">;
  format: DocFormat;
  title: string;
  description: string;
  pages?: number;
  size: string;
  version: string;
  updated: string;
  href: string;
};

const CATEGORIES: { key: CategoryKey; label: string; icon: LucideIcon }[] = [
  { key: "all",            label: "All",                 icon: Layers      },
  { key: "product",        label: "Product",             icon: Sparkles    },
  { key: "api",            label: "APIs & SDKs",         icon: FileCode2   },
  { key: "ifrs",           label: "IFRS accounting",     icon: Calculator  },
  { key: "ird",            label: "IRD & tax",           icon: Receipt     },
  { key: "integrations",   label: "Integrations",        icon: Workflow    },
  { key: "implementation", label: "Implementation",      icon: BookOpen    },
  { key: "security",       label: "Security",            icon: ShieldCheck },
];

const DOCS: Doc[] = [
  // ─── Product ──────────────────────────────────────────────────────────────
  {
    category: "product",
    format: "PDF",
    title: "Bizak Product Overview 2026",
    description:
      "The executive brief — what Bizak does, who it serves, and how the platform fits a modern operating model.",
    pages: 32,
    size: "4.1 MB",
    version: "v2025.4",
    updated: "May 2026",
    href: "#",
  },
  {
    category: "product",
    format: "PDF",
    title: "Module Catalogue",
    description:
      "A short-form reference for every Bizak module — accounting, inventory, sales, HR, manufacturing, and more.",
    pages: 24,
    size: "2.8 MB",
    version: "v2025.4",
    updated: "May 2026",
    href: "#",
  },
  {
    category: "product",
    format: "PDF",
    title: "Pricing & Licensing Guide",
    description:
      "Subscription tiers, billing cycles, optional add-ons, and how usage envelopes scale with your team.",
    pages: 12,
    size: "1.2 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },

  // ─── API & developers ─────────────────────────────────────────────────────
  {
    category: "api",
    format: "PDF",
    title: "REST API Reference",
    description:
      "The complete API surface: 180+ endpoints, request shapes, response schemas, and the full error catalogue.",
    pages: 184,
    size: "12.6 MB",
    version: "v2025.4",
    updated: "May 2026",
    href: "#",
  },
  {
    category: "api",
    format: "PDF",
    title: "Webhooks & Events Guide",
    description:
      "Subscribe to events with retries, signatures, replay, and delivery guarantees. Includes the full event catalogue.",
    pages: 28,
    size: "2.3 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "api",
    format: "ZIP",
    title: "Postman Collection & OpenAPI 3.1 Spec",
    description:
      "Pre-configured Postman collection, OpenAPI 3.1 specification, and a sandbox environment file — ready to import.",
    size: "1.8 MB",
    version: "v2025.4",
    updated: "May 2026",
    href: "#",
  },
  {
    category: "api",
    format: "PDF",
    title: "SDK Reference Pack",
    description:
      "Type-safe SDKs for Node.js, Python, PHP, Java, and .NET — installation, auth, and end-to-end examples.",
    pages: 64,
    size: "5.2 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },

  // ─── IFRS accounting ──────────────────────────────────────────────────────
  {
    category: "ifrs",
    format: "PDF",
    title: "IFRS Compliance Whitepaper",
    description:
      "How Bizak's accounting engine maps to each IFRS standard — recognition, measurement, presentation, and disclosure.",
    pages: 48,
    size: "3.9 MB",
    version: "2026 ed.",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "ifrs",
    format: "PDF",
    title: "Multi-Currency & FX Reference",
    description:
      "Functional vs. presentation currency, FX revaluation, hedge accounting, and the IAS 21 implementation in Bizak.",
    pages: 22,
    size: "1.9 MB",
    version: "v2025.4",
    updated: "Mar 2026",
    href: "#",
  },
  {
    category: "ifrs",
    format: "PDF",
    title: "Audit Trail & Journal Architecture",
    description:
      "Immutable journals, period locking, reversal entries, and the audit-trace primitives required by external auditors.",
    pages: 18,
    size: "1.6 MB",
    version: "v2025.4",
    updated: "Mar 2026",
    href: "#",
  },
  {
    category: "ifrs",
    format: "PDF",
    title: "Period Close Runbook",
    description:
      "The 12-step close process — reconciliations, accruals, FX revaluation, and final consolidation across entities.",
    pages: 26,
    size: "2.2 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },

  // ─── IRD / tax ────────────────────────────────────────────────────────────
  {
    category: "ird",
    format: "PDF",
    title: "IRD Compliance Statement (Nepal)",
    description:
      "Bizak's compliance posture against the Inland Revenue Department of Nepal — invoice formats, VAT, and statutory filings.",
    pages: 20,
    size: "2.0 MB",
    version: "FY 2082/83",
    updated: "May 2026",
    href: "#",
  },
  {
    category: "ird",
    format: "PDF",
    title: "VAT Setup & Filing Guide",
    description:
      "Step-by-step setup of VAT rates, invoice templates, schedule generation, and electronic filing with IRD.",
    pages: 24,
    size: "2.6 MB",
    version: "FY 2082/83",
    updated: "May 2026",
    href: "#",
  },
  {
    category: "ird",
    format: "PDF",
    title: "Tax Invoice Template Specification",
    description:
      "The IRD-compliant tax invoice format Bizak ships out of the box — fields, validations, and customisation rules.",
    pages: 12,
    size: "1.1 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "ird",
    format: "PDF",
    title: "Withholding Tax & TDS Reference",
    description:
      "Configuring TDS heads, automatic withholding on bills and payments, and the reconciliation report for filing.",
    pages: 16,
    size: "1.4 MB",
    version: "FY 2082/83",
    updated: "Mar 2026",
    href: "#",
  },

  // ─── Integrations ─────────────────────────────────────────────────────────
  {
    category: "integrations",
    format: "PDF",
    title: "Stripe Integration Guide",
    description:
      "Connect Stripe for online payments, subscription billing, and automatic reconciliation against Bizak invoices.",
    pages: 18,
    size: "1.8 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "integrations",
    format: "PDF",
    title: "Outlook & Microsoft 365 Integration",
    description:
      "Sync calendars, log emails to CRM accounts, and embed Bizak shortcuts inside Outlook for sales and service teams.",
    pages: 14,
    size: "1.5 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "integrations",
    format: "PDF",
    title: "Shopify & WooCommerce Connector",
    description:
      "Real-time order, inventory, and customer sync with major e-commerce platforms — including reconciliation reports.",
    pages: 22,
    size: "2.1 MB",
    version: "v2025.4",
    updated: "Mar 2026",
    href: "#",
  },
  {
    category: "integrations",
    format: "PDF",
    title: "Bank Feeds Catalogue",
    description:
      "Supported banks, payment gateways, and direct-debit providers — connection details and reconciliation rules.",
    pages: 16,
    size: "1.4 MB",
    version: "v2025.4",
    updated: "May 2026",
    href: "#",
  },
  {
    category: "integrations",
    format: "PDF",
    title: "Custom Connector Developer Guide",
    description:
      "Build your own connector with the SDK, package it for the marketplace, and ship updates without breaking customers.",
    pages: 30,
    size: "2.8 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },

  // ─── Implementation ───────────────────────────────────────────────────────
  {
    category: "implementation",
    format: "PDF",
    title: "Implementation Playbook",
    description:
      "The 5-phase Bizak implementation: discovery, configuration, migration, training, and parallel run before go-live.",
    pages: 42,
    size: "3.4 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "implementation",
    format: "ZIP",
    title: "Data Migration Toolkit",
    description:
      "Templates and scripts for migrating from spreadsheets, Tally, QuickBooks, and other ERPs — with validation rules.",
    size: "8.6 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "implementation",
    format: "PDF",
    title: "Training & Onboarding Curriculum",
    description:
      "Role-based learning paths for finance, ops, sales, and admin teams — with assessments and trainer notes.",
    pages: 36,
    size: "3.0 MB",
    version: "v2025.4",
    updated: "Mar 2026",
    href: "#",
  },
  {
    category: "implementation",
    format: "PDF",
    title: "Go-Live Checklist",
    description:
      "The 60-item checklist our customer success team uses to verify a deployment is production-ready before cutover.",
    pages: 8,
    size: "0.6 MB",
    version: "v2025.4",
    updated: "May 2026",
    href: "#",
  },

  // ─── Security ─────────────────────────────────────────────────────────────
  {
    category: "security",
    format: "PDF",
    title: "Security Whitepaper",
    description:
      "Architecture, encryption, key management, network controls, and the security posture behind every Bizak deployment.",
    pages: 38,
    size: "3.2 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "security",
    format: "PDF",
    title: "SOC 2 & ISO 27001 Statement",
    description:
      "Bizak's audit posture, control families covered, and how to request the latest report under NDA.",
    pages: 12,
    size: "1.0 MB",
    version: "2026 ed.",
    updated: "Mar 2026",
    href: "#",
  },
  {
    category: "security",
    format: "PDF",
    title: "Data Privacy & Retention Policy",
    description:
      "Where customer data lives, how long it's retained, who can access it, and the export and deletion workflows.",
    pages: 14,
    size: "1.2 MB",
    version: "v2025.4",
    updated: "Apr 2026",
    href: "#",
  },
  {
    category: "security",
    format: "PDF",
    title: "Disaster Recovery & Backup Runbook",
    description:
      "RPO and RTO commitments, backup cadence, restoration procedures, and the regional failover topology.",
    pages: 16,
    size: "1.3 MB",
    version: "v2025.4",
    updated: "Mar 2026",
    href: "#",
  },
];

const FEATURED = DOCS[0]; // Bizak Product Overview

const FORMAT_ICON: Record<DocFormat, LucideIcon> = {
  PDF:  FileText,
  ZIP:  FileArchive,
  DOCX: FileText,
};

const FORMAT_TONE: Record<
  DocFormat,
  { wrap: string; text: string; rail: string }
> = {
  PDF:  { wrap: "bg-rose-50",   text: "text-rose-600",   rail: "bg-rose-300/70"   },
  ZIP:  { wrap: "bg-amber-50",  text: "text-amber-700",  rail: "bg-amber-300/80"  },
  DOCX: { wrap: "bg-sky-50",    text: "text-sky-700",    rail: "bg-sky-300/70"    },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({
  query,
  onQuery,
}: {
  query: string;
  onQuery: (q: string) => void;
}) {
  const FeaturedIcon = FORMAT_ICON[FEATURED.format];
  const featuredTone = FORMAT_TONE[FEATURED.format];

  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          {/* Left — text & search */}
          <div className="max-w-[640px]">
            <HeroBadge>Document Library</HeroBadge>
            <h1 className="mt-4 text-[clamp(40px,5.2vw,60px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              Bizak documentation,{" "}
              <span className="relative inline-block">
                ready to download
                <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
              </span>
              .
            </h1>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.7] text-bz-text-muted">
              Product overviews, API references, IFRS &amp; IRD compliance
              papers, and integration guides — every document we publish, in
              one place.
            </p>

            {/* Search */}
            <div className="relative mt-8 w-full max-w-[560px]">
              <div className="flex h-[56px] items-center gap-3 rounded-bz-pill border border-bz-border bg-bz-surface pl-5 pr-2 shadow-[0_8px_28px_rgba(15,17,14,0.06)] focus-within:border-bz-sage-mid focus-within:shadow-[0_12px_36px_rgba(15,17,14,0.08)]">
                <Search
                  className="size-5 shrink-0 text-bz-text-soft"
                  strokeWidth={1.8}
                />
                <input
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  type="text"
                  placeholder="Search documents — IFRS, Stripe, API, VAT…"
                  aria-label="Search the document library"
                  className="flex-1 bg-transparent text-[15px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => onQuery("")}
                    aria-label="Clear search"
                    className="inline-flex size-8 items-center justify-center rounded-bz-pill text-bz-text-soft transition-colors hover:bg-bz-bg hover:text-bz-text"
                  >
                    <X className="size-4" strokeWidth={2} />
                  </button>
                ) : (
                  <kbd className="hidden h-7 items-center rounded-bz-md border border-bz-border bg-bz-bg px-2 text-[11px] font-semibold text-bz-text-soft md:inline-flex">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {/* Meta strip */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <FileText
                  className="size-[14px] text-bz-sage"
                  strokeWidth={1.8}
                />
                {DOCS.length} documents
              </span>
              <span
                className="size-1 rounded-full bg-bz-text-soft/40"
                aria-hidden
              />
              <span>Refreshed monthly</span>
              <span
                className="size-1 rounded-full bg-bz-text-soft/40"
                aria-hidden
              />
              <span>Free, no sign-up required</span>
            </div>
          </div>

          {/* Right — spotlight document */}
          <div className="relative mx-auto w-full max-w-[440px] lg:mx-0">
            {/* faux paper stack behind */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-3 left-3 right-3 h-[88%] rounded-bz-2xl border border-bz-border bg-bz-surface/70"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-1.5 left-1.5 right-1.5 h-[94%] rounded-bz-2xl border border-bz-border bg-bz-surface/85"
            />

            <a
              href={FEATURED.href}
              className="group relative block overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-surface shadow-[0_24px_64px_rgba(15,17,14,0.10)] transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Format rail */}
              <span
                aria-hidden
                className={[
                  "absolute inset-y-0 left-0 w-1.5",
                  featuredTone.rail,
                ].join(" ")}
              />

              {/* Top — format chip + featured pill */}
              <div className="flex items-center justify-between p-7 pb-0">
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-bz-md px-2.5 py-1.5",
                    featuredTone.wrap,
                  ].join(" ")}
                >
                  <FeaturedIcon
                    className={["size-[14px]", featuredTone.text].join(" ")}
                    strokeWidth={1.8}
                  />
                  <span
                    className={[
                      "text-[10.5px] font-bold uppercase tracking-[0.14em]",
                      featuredTone.text,
                    ].join(" ")}
                  >
                    {FEATURED.format}
                  </span>
                </span>
                <PillBadge tone="accent" dot>
                  Featured
                </PillBadge>
              </div>

              {/* Body */}
              <div className="p-7">
                <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">
                  {FEATURED.version} · {FEATURED.pages} pages
                </div>
                <h2 className="mt-3 text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                  {FEATURED.title}
                </h2>
                <p className="mt-3 text-[14px] leading-[1.65] text-bz-text-muted">
                  {FEATURED.description}
                </p>

                {/* Faux page lines — adds the "document" feel */}
                <div
                  aria-hidden
                  className="mt-6 flex flex-col gap-2 opacity-60"
                >
                  <span className="h-[6px] w-full rounded-full bg-bz-border" />
                  <span className="h-[6px] w-[88%] rounded-full bg-bz-border" />
                  <span className="h-[6px] w-[72%] rounded-full bg-bz-border" />
                </div>
              </div>

              {/* Footer — meta + download */}
              <div className="flex items-center justify-between border-t border-bz-border bg-bz-bg px-7 py-4">
                <span className="text-[12px] font-semibold text-bz-text-soft">
                  {FEATURED.size} · Updated {FEATURED.updated}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
                  Download
                  <Download className="size-[14px]" strokeWidth={2} />
                </span>
              </div>
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Document card ────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: Doc }) {
  const FormatIcon = FORMAT_ICON[doc.format];
  const tone = FORMAT_TONE[doc.format];

  return (
    <a
      href={doc.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface p-7 transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
      aria-label={`Download ${doc.title}`}
    >
      {/* Format rail */}
      <span
        aria-hidden
        className={[
          "absolute inset-y-0 left-0 w-1 transition-colors duration-200",
          tone.rail,
          "group-hover:opacity-100",
        ].join(" ")}
      />

      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={[
              "inline-flex size-10 items-center justify-center rounded-bz-md",
              tone.wrap,
            ].join(" ")}
          >
            <FormatIcon
              className={["size-[17px]", tone.text].join(" ")}
              strokeWidth={1.8}
            />
          </span>
          <div className="flex flex-col leading-tight">
            <span
              className={[
                "text-[10.5px] font-bold uppercase tracking-[0.14em]",
                tone.text,
              ].join(" ")}
            >
              {doc.format}
            </span>
            <span className="mt-0.5 text-[12px] font-semibold tracking-[0.04em] text-bz-text-soft">
              {doc.version}
            </span>
          </div>
        </div>

        <span className="inline-flex size-9 items-center justify-center rounded-bz-pill border border-bz-border bg-bz-bg text-bz-text-soft transition-colors duration-200 group-hover:border-bz-sage-mid group-hover:bg-bz-sage-soft group-hover:text-bz-sage">
          <Download className="size-[14px]" strokeWidth={2} />
        </span>
      </div>

      {/* Title + body */}
      <div className="mt-6 flex-1">
        <h3 className="text-[17px] font-bold tracking-[-0.01em] text-bz-text transition-colors duration-200 group-hover:text-bz-sage">
          {doc.title}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.65] text-bz-text-muted">
          {doc.description}
        </p>
      </div>

      {/* Footer meta */}
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-bz-border-soft pt-4 text-[12px] text-bz-text-soft">
        {doc.pages != null && (
          <>
            <span className="font-semibold text-bz-text-muted">
              {doc.pages} pages
            </span>
            <span className="size-1 rounded-full bg-bz-text-soft/40" aria-hidden />
          </>
        )}
        <span>{doc.size}</span>
        <span className="ml-auto whitespace-nowrap">Updated {doc.updated}</span>
      </div>
    </a>
  );
}

// ─── Library ──────────────────────────────────────────────────────────────────

function LibrarySection({
  activeCat,
  onCat,
  query,
  onResetFilters,
}: {
  activeCat: CategoryKey;
  onCat: (k: CategoryKey) => void;
  query: string;
  onResetFilters: () => void;
}) {
  const counts = useMemo(() => {
    const map: Record<CategoryKey, number> = {
      all: DOCS.length,
      product: 0,
      api: 0,
      ifrs: 0,
      ird: 0,
      integrations: 0,
      implementation: 0,
      security: 0,
    };
    DOCS.forEach((d) => {
      map[d.category] += 1;
    });
    return map;
  }, []);

  const filtered = useMemo(() => {
    let docs = DOCS;
    if (activeCat !== "all") docs = docs.filter((d) => d.category === activeCat);
    const q = query.trim().toLowerCase();
    if (q) {
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q),
      );
    }
    return docs;
  }, [activeCat, query]);

  const isFiltered = activeCat !== "all" || query.trim().length > 0;

  return (
    <Section tone="white" pad="default" id="library">
      <Container>
        {/* Filter bar */}
        <div className="-mx-6 overflow-x-auto px-6 pb-1 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex min-w-max flex-nowrap items-center gap-2 lg:min-w-0 lg:flex-wrap">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isActive = activeCat === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onCat(c.key)}
                  aria-pressed={isActive}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-bz-pill border px-4 py-2 text-[13px] font-semibold transition-colors",
                    isActive
                      ? "border-bz-deep bg-bz-deep text-white"
                      : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "size-[14px]",
                      isActive ? "text-bz-accent" : "text-bz-text-soft",
                    ].join(" ")}
                    strokeWidth={1.8}
                  />
                  <span>{c.label}</span>
                  <span
                    className={[
                      "rounded-bz-pill px-1.5 text-[11px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/15 text-white/75"
                        : "bg-bz-bg text-bz-text-soft",
                    ].join(" ")}
                  >
                    {counts[c.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Result summary */}
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 border-b border-bz-border pb-4">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-bz-text">
            {filtered.length}{" "}
            <span className="font-normal text-bz-text-soft">
              {filtered.length === 1 ? "document" : "documents"}
              {isFiltered ? " match your filters" : " in the library"}
            </span>
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-bz-sage transition-colors hover:text-bz-sage-hover"
            >
              <X className="size-[12px]" strokeWidth={2.2} />
              Clear filters
            </button>
          )}
        </div>

        {/* Doc grid OR empty state */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((d) => (
              <DocCard key={d.title} doc={d} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center rounded-bz-2xl border border-dashed border-bz-border bg-bz-bg px-8 py-16 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-bz-pill bg-bz-surface text-bz-text-soft">
              <Search className="size-5" strokeWidth={1.8} />
            </span>
            <h3 className="mt-5 text-[20px] font-bold tracking-[-0.01em] text-bz-text">
              No documents match your filters
            </h3>
            <p className="mt-2 max-w-[420px] text-[14px] leading-[1.65] text-bz-text-muted">
              Try a different search term or clear the active category to see
              the full library.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-6 inline-flex items-center gap-1.5 rounded-bz-pill border border-bz-border bg-bz-surface px-4 py-2 text-[13px] font-semibold text-bz-text transition-colors hover:border-bz-sage-mid hover:text-bz-sage"
            >
              Reset filters
              <ArrowRight className="size-[13px]" strokeWidth={2} />
            </button>
          </div>
        )}
      </Container>
    </Section>
  );
}

// ─── Bottom request strip ─────────────────────────────────────────────────────

function RequestStrip() {
  return (
    <Section tone="light" pad="compact">
      <Container width="narrow">
        <div className="relative overflow-hidden rounded-bz-2xl bg-bz-deep p-9 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-bz-accent/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-[220px] w-[220px] rounded-full bg-bz-sage/15 blur-3xl"
          />

          <div className="relative grid grid-cols-1 items-center gap-7 md:grid-cols-[1fr_auto]">
            <div>
              <PillBadge tone="accent" dot>
                Request a doc
              </PillBadge>
              <h2 className="mt-4 text-[clamp(24px,3vw,32px)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                Need a document we don't have?
              </h2>
              <p className="mt-3 max-w-[520px] text-[14.5px] leading-[1.7] text-white/65">
                Tell us what's missing and we'll write it. Most requested
                documents ship within two weeks of the next release cycle.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button variant="accent" size="md" href="/contact" withArrow>
                Request a document
              </Button>
              <Button variant="ghostDark" size="md" href="/HelpCenter">
                Visit the Help Center
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DocumentationPage() {
  const [activeCat, setActiveCat] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");

  const reset = () => {
    setActiveCat("all");
    setQuery("");
  };

  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection query={query} onQuery={setQuery} />
        <LibrarySection
          activeCat={activeCat}
          onCat={setActiveCat}
          query={query}
          onResetFilters={reset}
        />
        <RequestStrip />
      </main>
      <Footer />
    </div>
  );
}
