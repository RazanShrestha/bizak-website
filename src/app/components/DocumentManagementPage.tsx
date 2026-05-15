import {
  Section,
  Container,
  SectionHead,
  BigCard,
  StepCard,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  StatusChip,
  DotGrid,
  Accordion,
} from "./bz";
import {
  Folder,
  Search,
  FileText,
  ShoppingBag,
  Users,
  Briefcase,
  Boxes,
  Receipt,
  ShieldCheck,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const VAULT_MODULES = [
  { icon: FileText,    name: "Sales Orders",    count: "4", active: true  },
  { icon: ShoppingBag, name: "Purchase Orders", count: "2", active: false },
  { icon: Users,       name: "Customers",       count: "7", active: false },
  { icon: Briefcase,   name: "Employees",       count: "3", active: false },
  { icon: Boxes,       name: "Fixed Assets",    count: "5", active: false },
  { icon: Receipt,     name: "Expenses",        count: "2", active: false },
];

const VAULT_FILES = [
  { ext: "PDF",  name: "Signed Quotation.pdf",    size: "1.2 MB", by: "Sarah K.", rec: "SO-1042" },
  { ext: "DOCX", name: "Product Spec Sheet.docx", size: "340 KB", by: "Omar T.",  rec: "SO-1042" },
  { ext: "JPG",  name: "Warehouse Photos.jpg",    size: "4.1 MB", by: "Priya M.", rec: "SO-1042" },
  { ext: "XLSX", name: "Delivery Schedule.xlsx",  size: "820 KB", by: "David R.", rec: "SO-1042" },
];

const VAULT_METRICS = [
  { label: "Documents", value: "2,847" },
  { label: "Modules",   value: "6"     },
  { label: "Linked",    value: "100%"  },
];

const DOC_ACTIVITY = [
  { module: "Sales",      ref: "SO-1042", event: "Signed Quotation.pdf uploaded by Sarah K.",  stat: "1.2 MB", live: true  },
  { module: "Purchasing", ref: "PO-3318", event: "Supplier Invoice.pdf attached by Omar T.",   stat: "v2",     live: true  },
  { module: "HR",         ref: "EMP-204", event: "Employment Contract.pdf viewed by Priya M.", stat: "210 KB", live: false },
  { module: "Assets",     ref: "FA-77",   event: "Warehouse Photo.jpg replaced by David R.",   stat: "v3",     live: false },
  { module: "Sales",      ref: "SO-0987", event: "Delivery Note.pdf downloaded by Lena W.",    stat: "820 KB", live: false },
  { module: "Expenses",   ref: "EXP-118", event: "Receipt scan archived by Marco B.",          stat: "340 KB", live: false },
];

const ACCESS_ROLES = [
  { name: "Finance",    tagline: "Ledgers & statements", scopes: ["Invoices & receipts", "Bank statements", "Tax filings"],    active: true  },
  { name: "HR",         tagline: "People & contracts",   scopes: ["Employment contracts", "Payroll records", "ID documents"], active: false },
  { name: "Operations", tagline: "Orders & delivery",    scopes: ["Delivery notes", "Warehouse photos", "Inspection reports"], active: false },
  { name: "Sales",      tagline: "Quotes & agreements",  scopes: ["Signed quotations", "Customer contracts", "Order forms"],   active: false },
];

const VERSION_TRAIL = [
  { type: "Current version", value: "Signed Quotation.pdf · Sarah K.", stat: "Apr 12", depth: 0 },
  { type: "Version 3",       value: "Final pricing applied · Omar T.", stat: "Apr 10", depth: 1 },
  { type: "Version 2",       value: "Client edits merged · Sarah K.",  stat: "Apr 8",  depth: 2 },
  { type: "Version 1",       value: "Initial draft created · Sarah K.", stat: "Apr 5", depth: 3 },
];

const FILE_TYPES = [
  { abbr: "PDF",  sub: "Documents" },
  { abbr: "DOCX", sub: "Word"      },
  { abbr: "XLSX", sub: "Sheets"    },
  { abbr: "JPG",  sub: "Images"    },
  { abbr: "MP4",  sub: "Video"     },
  { abbr: "ZIP",  sub: "Archives"  },
  { abbr: "CSV",  sub: "Data"      },
  { abbr: "PNG",  sub: "Graphics"  },
];

const MODULE_PANELS = [
  { name: "Sales Orders",     note: "auto-linked", count: "4 files" },
  { name: "Purchase Orders",  note: "auto-linked", count: "2 files" },
  { name: "Customer Records", note: "auto-linked", count: "7 files" },
];

const FAQS = [
  { q: "How do files get linked to the right record?",   a: "Every upload auto-attaches to the transaction it belongs to. Drop a signed quotation on a sales order, a receipt on an expense claim, or a contract on an employee record, and the file travels with that record through every status change, with no folders to maintain." },
  { q: "Can I control who sees which documents?",        a: "Yes. Every document is scoped to roles such as Finance, HR, Operations and Sales, per module or per individual file. Grant, revoke or narrow access at any time; every change is timestamped and reversible." },
  { q: "What happens to older versions of a file?",      a: "Nothing is overwritten. Every revision is retained with the user and timestamp behind it. Open, compare or restore any earlier version in a single click, from first draft to signed copy." },
  { q: "Which file types can Bizak store?",              a: "148 formats, including PDFs, Word and Excel documents, images, video, archives and CSV. Whatever your business touches lives in one searchable home, indexed and linked to its record." },
];

// ─── FILE-TYPE ICON ────────────────────────────────────────────────────────────

// Flat colour-coded document marks for the file vault. The folded-document
// shape is the universal file-type convention; colours are tokens in
// theme.css. Unknown extensions fall back to a neutral grey mark.
const FILE_GLYPHS: Record<string, { label: string; color: string }> = {
  PDF:  { label: "PDF", color: "var(--bz-file-pdf)" },
  DOCX: { label: "DOC", color: "var(--bz-file-doc)" },
  XLSX: { label: "XLS", color: "var(--bz-file-xls)" },
  JPG:  { label: "JPG", color: "var(--bz-file-img)" },
};

function FileTypeIcon({ ext, className }: { ext: string; className?: string }) {
  const glyph = FILE_GLYPHS[ext] ?? { label: ext.slice(0, 3), color: "var(--bz-text-muted)" };
  return (
    <svg viewBox="0 0 36 44" className={className} aria-hidden="true">
      {/* document body */}
      <path
        d="M5.5 1H23l12 12v25.5A2.5 2.5 0 0 1 32.5 41h-27A2.5 2.5 0 0 1 3 38.5v-35A2.5 2.5 0 0 1 5.5 1Z"
        fill={glyph.color}
      />
      {/* folded corner */}
      <path
        d="M23 1l12 12h-9.5A2.5 2.5 0 0 1 23 10.5Z"
        fill="var(--bz-text-on-dark)"
        fillOpacity="0.92"
      />
      {/* extension label */}
      <text
        x="19"
        y="31.5"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="800"
        letterSpacing="0.4"
        fill="var(--bz-text-on-dark)"
      >
        {glyph.label}
      </text>
    </svg>
  );
}

// ─── HERO MOCK ─────────────────────────────────────────────────────────────────

// Document vault file-explorer: dark module sidebar + live file grid
function DocumentVaultMock() {
  return (
    <div className="w-full rounded-bz-2xl border border-bz-line bg-bz-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-bz-line bg-bz-paper-warm">
        <div className="flex items-center gap-1.5 shrink-0">
          <Folder size={13} className="text-bz-text-muted" />
          <span className="text-[11px] text-bz-text-muted hidden sm:inline">Documents</span>
          <span className="text-[11px] text-bz-text-muted hidden sm:inline">/</span>
          <span className="text-[11px] font-semibold text-bz-text">All Modules</span>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-bz-pill bg-bz-surface border border-bz-line min-w-0 flex-1 sm:flex-none sm:w-[260px]">
          <Search size={12} className="text-bz-text-muted shrink-0" />
          <span className="text-[11px] text-bz-text-muted truncate">Search 2,847 documents…</span>
        </div>
        <span className="hidden sm:inline-flex items-center text-[10px] font-semibold text-bz-text-muted bg-bz-surface border border-bz-line rounded-bz-pill px-2.5 py-1 shrink-0">
          6 modules
        </span>
      </div>

      {/* Body: dark module sidebar + file grid */}
      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr]">
        {/* Dark module sidebar */}
        <div className="relative overflow-hidden bg-bz-olive md:border-r md:border-white/[0.06]">
          <DotGrid tone="dark" />
          <div className="relative p-4 md:p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/40 mb-3">
              Modules
            </p>
            <div className="flex flex-col gap-1">
              {VAULT_MODULES.map(({ icon: Icon, name, count, active }) => (
                <div
                  key={name}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-bz-md ${
                    active ? "bg-bz-fire/[0.12]" : ""
                  }`}
                >
                  <Icon size={13} className={active ? "text-bz-fire" : "text-white/45"} />
                  <span
                    className={`text-[11.5px] flex-1 truncate ${
                      active ? "font-semibold text-bz-text-on-dark" : "text-white/60"
                    }`}
                  >
                    {name}
                  </span>
                  <span
                    className={`text-[10px] tabular-nums ${
                      active ? "text-bz-fire" : "text-white/35"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>

            {/* Storage meter */}
            <div className="mt-5 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/40">
                  Storage
                </span>
                <span className="text-[10px] font-semibold text-white/70">14.2 / 50 GB</span>
              </div>
              <div className="h-1.5 rounded-bz-pill bg-white/[0.08] overflow-hidden">
                <div className="h-full rounded-bz-pill bg-bz-fire" style={{ width: "28%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* File grid */}
        <div className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-bz-text">Recent files</span>
            <span className="text-[10px] text-bz-text-muted">Sales Orders · 4 files</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {VAULT_FILES.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-3 p-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm"
              >
                <FileTypeIcon ext={f.ext} className="h-10 w-auto shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] font-semibold text-bz-text truncate">{f.name}</div>
                  <div className="text-[10px] text-bz-text-muted mt-0.5">
                    {f.size} · {f.by}
                  </div>
                </div>
                <span className="hidden sm:inline text-[9px] font-semibold text-bz-text-muted bg-bz-surface border border-bz-line rounded-bz-pill px-2 py-0.5 shrink-0 tabular-nums">
                  {f.rec}
                </span>
              </div>
            ))}
          </div>

          {/* Footer metrics */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-bz-line-soft pt-3.5">
            {VAULT_METRICS.map((m) => (
              <div key={m.label}>
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted mb-1">
                  {m.label}
                </p>
                <p className="text-[13px] font-bold text-bz-text">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VERSION VISUAL ────────────────────────────────────────────────────────────

function VersionHistoryVisual() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {VERSION_TRAIL.map((l, i) => (
        <div
          key={l.type}
          className={`rounded-bz-lg border px-4 py-3 ${
            i === 0
              ? "border-bz-fire/40 bg-bz-fire/[0.06]"
              : "border-bz-line-soft bg-bz-surface"
          }`}
          style={{ marginLeft: `${l.depth * 10}px` }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-bz-text-muted mb-1">
            {l.type}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-[12.5px] font-semibold leading-snug ${
                i === 0 ? "text-bz-text" : "text-bz-text-muted"
              }`}
            >
              {l.value}
            </p>
            {l.stat && (
              <p
                className={`text-[11.5px] font-medium tabular-nums shrink-0 ${
                  i === 0 ? "text-bz-text" : "text-bz-text-soft"
                }`}
              >
                {l.stat}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FILES-IN-CONTEXT VISUAL ──────────────────────────────────────────────────

function FilesInContextVisual() {
  return (
    <div className="w-full flex flex-col gap-5">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/40 mb-3">
          148 file types supported
        </p>
        <div className="grid grid-cols-4 gap-2">
          {FILE_TYPES.map(({ abbr, sub }) => (
            <div key={abbr} className="bg-white/[0.08] rounded-bz-md py-3 text-center">
              <div className="text-[12px] font-bold text-bz-text-on-dark">{abbr}</div>
              <div className="text-[8px] text-white/40 uppercase tracking-[0.05em] mt-0.5 leading-tight">
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/40 mb-3">
          Document panels by module
        </p>
        <div className="flex flex-col gap-1.5">
          {MODULE_PANELS.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between gap-3 rounded-bz-md bg-white/[0.05] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1 h-1 rounded-full bg-bz-fire shrink-0" />
                <span className="text-[11px] text-white/80 truncate">{m.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-white/40 hidden sm:inline">{m.note}</span>
                <span className="text-[9px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded">
                  {m.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Platform Capability</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Every file, exactly{" "}
            <Heading.Muted>where it belongs.</Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill
              variant="dark"
              withArrowUpRight
              href="https://system.bizakerp.com/account/self-register"
            >
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual mx-auto w-full max-w-[1140px]">
          <DocumentVaultMock />
        </div>
      </Container>
    </Section>
  );
}

// Live activity stream every file event, logged the moment it happens
function ActivityLogSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Activity log"
          title={
            <>
              Every file event,{" "}
              <Heading.Muted>logged the moment it happens.</Heading.Muted>
            </>
          }
          description="Every upload, view, download and revision is recorded with the user, timestamp and the record it belongs to."
        />

        <div className="rounded-bz-xl overflow-hidden border border-bz-line-soft">
          {/* Stream header */}
          <div className="flex items-center justify-between px-5 py-3 bg-bz-paper border-b border-bz-line-soft">
            <div className="flex items-center gap-2.5">
              <StatusChip variant="live">Live</StatusChip>
              <span className="text-[10px] font-medium text-bz-text-muted">
                6 modules tracked
              </span>
            </div>
            <span className="text-[10px] text-bz-text-muted hidden sm:inline">
              1,284 events logged today
            </span>
          </div>

          {/* Stream rows */}
          <div className="flex flex-col divide-y divide-bz-line-soft">
            {DOC_ACTIVITY.map((entry) => (
              <div
                key={entry.ref}
                className={`flex items-center gap-4 px-5 py-4 ${
                  entry.live ? "bg-bz-fire/[0.03]" : ""
                }`}
              >
                {/* Module tag */}
                <span
                  className={`text-[10.5px] font-semibold shrink-0 w-28 hidden sm:block uppercase tracking-[0.07em] ${
                    entry.live ? "text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  {entry.module}
                </span>

                {/* Ref */}
                <span className="text-[11px] text-bz-text-soft w-20 shrink-0 hidden md:block tabular-nums">
                  {entry.ref}
                </span>

                {/* Event description */}
                <p
                  className={`flex-1 text-[13px] min-w-0 truncate ${
                    entry.live ? "font-medium text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  <span className="sm:hidden font-semibold text-bz-text">
                    {entry.module} ·{" "}
                  </span>
                  {entry.event}
                </p>

                {/* Stat */}
                <span
                  className={`text-[12.5px] font-bold tabular-nums shrink-0 ${
                    entry.live ? "text-bz-text" : "text-bz-text-soft"
                  }`}
                >
                  {entry.stat}
                </span>

                {/* Live indicator */}
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.live ? "bg-bz-fire" : "bg-bz-line"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Role-based access flat 4-col panel inside a dark section
function AccessControlSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          tone="dark"
          index="02"
          label="Role-based access"
          title={
            <>
              Every role.{" "}
              <Heading.Muted>Only the files they need.</Heading.Muted>
            </>
          }
          description="Every document is scoped to the roles that should see it.."
        />

        {/* Access panel: gap-px grid creates thin dividers without per-item border logic */}
        <div className="rounded-bz-2xl overflow-hidden bg-bz-olive-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08]">
            {ACCESS_ROLES.map((r) => (
              <div
                key={r.name}
                className={`flex flex-col gap-5 p-7 lg:p-8 ${
                  r.active ? "bg-bz-olive-dark" : "bg-bz-olive-soft"
                }`}
              >
                <div>
                  <p
                    className={`text-[22px] font-bold leading-none mb-1.5 ${
                      r.active ? "text-bz-fire" : "text-bz-text-on-dark"
                    }`}
                  >
                    {r.name}
                  </p>
                  <p className="text-[11px] text-white/50">{r.tagline}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {r.scopes.map((scope) => (
                    <div key={scope} className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full shrink-0 ${
                          r.active ? "bg-bz-fire" : "bg-white/30"
                        }`}
                      />
                      <span
                        className={`text-[12.5px] ${
                          r.active ? "text-white/90" : "text-white/55"
                        }`}
                      >
                        {scope}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.10em] px-2.5 py-1 rounded-bz-pill ${
                      r.active
                        ? "bg-bz-fire/[0.15] text-bz-fire"
                        : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {r.active ? "Active" : "Default"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit note */}
        <div className="mt-4 rounded-bz-xl border border-white/[0.08] bg-white/[0.03] px-5 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="hidden sm:flex w-8 h-8 rounded-bz-md bg-white/[0.06] items-center justify-center shrink-0">
              <ShieldCheck size={14} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-bz-text-on-dark mb-1">
                Every access change is logged and reversible
              </p>
              <p className="text-[12px] text-white/55 leading-relaxed">
                Grant, revoke or scope document access per role, per module, or per individual file. Every change is timestamped.
              </p>
            </div>
            <div className="flex items-baseline gap-1.5 sm:shrink-0">
              <span className="text-[32px] font-bold text-bz-text-on-dark leading-none">100%</span>
              <span className="text-[11px] text-white/50">access logged</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Version history StepCard showing the full revision trail
function VersionHistorySection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="Version history"
          title={
            <>
              Click any file.{" "}
              <Heading.Muted>Trace every revision.</Heading.Muted>
            </>
          }
          description="Every version of every document is retained who changed what, and when."
          titleMaxWidth={720}
          spacing="tight"
        />
        <StepCard
          number="03"
          tag="Draft → review → signed"
          title="From first draft to signed copy, every version preserved."
          bullets={[
            "Open, compare or restore any earlier version in a single click.",
          ]}
          visual={<VersionHistoryVisual />}
        />
      </Container>
    </Section>
  );
}

// Files in context BigCard (dark 2-col) with file-type catalog + module panels
function FilesInContextSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Files in context"
          title={
            <>
              Attached to records.{" "}
              <Heading.Muted>Organized automatically.</Heading.Muted>
            </>
          }
          description="Every module carries its own document panel. Files auto-link to the record they belong to, with no folders to maintain."
        />
        <BigCard
          text={{
            title: "Every record carries its own files.",
            body: "Open a sales order, a purchase order, a customer or a fixed asset and every related document is right there, in context.",
            bullets: [
              "148 file types PDFs, spreadsheets, images, video and archives",
              "Files travel with the record through every status change",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<FilesInContextVisual />}
        />
      </Container>
    </Section>
  );
}

// FAQ dark intro panel + accordion, all questions closed initially
function FAQSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr]">
          {/* Dark intro panel */}
          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-bz-2xl bg-bz-olive p-8 text-bz-text-on-dark">
            <DotGrid tone="dark" />
            <div className="relative">
              <SectionHead
                index="05"
                label="FAQ"
                tone="dark"
                title={<>Frequently asked <Heading.Muted>questions.</Heading.Muted></>}
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="https://system.bizakerp.com/account/self-register" withArrowUpRight>Get Started</Pill>
              <Pill variant="ghostDark" href="/contact" withArrow>Talk to Sales</Pill>
            </PillGroup>
          </div>

          {/* Accordion */}
          <Accordion defaultOpen={null}>
            {FAQS.map((item, i) => (
              <Accordion.Item key={i} question={item.q}>
                {item.a}
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function DocumentManagementPage() {
  return (
    <>
      <HeroSection />
      <ActivityLogSection />
      <AccessControlSection />
      <VersionHistorySection />
      <FilesInContextSection />
      <FAQSection />
    </>
  );
}
