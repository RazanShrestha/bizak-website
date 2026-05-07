import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FileText, Folder, Paperclip, ShieldCheck, Search } from "lucide-react";
import {
  Section, Container, SectionHeading, Button, Card, IconBadge, HeroBadge, HeroCentered, Stat,
} from "./marketing";

// ─── HERO VISUAL ─────────────────────────────────────────────────────────────
const FILES = [
  { name: "Signed Quotation - ACME Corp.pdf", ext: "PDF", size: "1.2 MB", tag: "Sales Order #1042", tagColor: "#3b82f6" },
  { name: "Product Catalog 2025.xlsx",         ext: "XLSX", size: "2.4 MB", tag: "Inventory",         tagColor: "#22c55e" },
  { name: "Vendor Agreement.docx",             ext: "DOCX", size: "320 KB", tag: "Supplier #204",     tagColor: "#f97316" },
  { name: "Warehouse Photo Apr.jpg",           ext: "JPG",  size: "4.1 MB", tag: "Fixed Assets",      tagColor: "#8b5cf6" },
];

function FileCabinetVisual() {
  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="rounded-bz-lg border border-white/20 bg-white/[0.06] p-1.5 shadow-[0_0_60px_rgba(199,255,53,0.12)]">
        <div className="rounded-bz-md bg-white/[0.04] overflow-hidden">

          {/* Titlebar */}
          <div className="px-5 py-3.5 flex items-center justify-between bg-white/[0.04] border-b border-white/10">
            <div className="flex gap-1.5">
              {(["#ff5f57", "#ffbd2e", "#28c840"] as const).map((c) => (
                <div key={c} style={{ background: c }} className="w-2.5 h-2.5 rounded-full" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.12em]">
              Bizak · File Cabinet
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-accent" />
              <span className="text-[9px] font-bold text-bz-accent uppercase tracking-[0.14em]">Synced</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center gap-2">
            <Search className="size-3 text-white/25" />
            <span className="text-[12px] text-white/25">Search files...</span>
            <div className="ml-auto">
              <span className="text-[9px] font-bold px-2 py-0.5 bg-white/10 rounded text-white/35 uppercase tracking-[0.08em]">
                All Types
              </span>
            </div>
          </div>

          {/* File rows — dark themed */}
          {FILES.map((f, i) => (
            <div
              key={f.name}
              className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] last:border-0"
              style={{
                background: i === 0 ? "rgba(199,255,53,0.04)" : "transparent",
                borderLeft: `3px solid ${i === 0 ? "var(--bz-accent)" : "transparent"}`,
                opacity: i === 0 ? 1 : i === 1 ? 0.75 : i === 2 ? 0.5 : 0.3,
              }}
            >
              <div
                className="flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center"
                style={{ background: `${f.tagColor}20`, border: `1px solid ${f.tagColor}30` }}
              >
                <span className="text-[7px] font-black tracking-[0.04em]" style={{ color: f.tagColor }}>
                  {f.ext}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-white truncate">{f.name}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{f.size}</div>
              </div>
              <div
                className="text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap hidden sm:block"
                style={{ background: `${f.tagColor}18`, color: f.tagColor, border: `1px solid ${f.tagColor}30` }}
              >
                {f.tag}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
            <span className="text-[10px] text-white/40 font-semibold">148 files · 2.1 GB</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-accent" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.12em]">Synced</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── FILE TYPES ───────────────────────────────────────────────────────────────
const FILE_TYPES = [
  { ext: "PDF",  color: "#ef4444", label: "Documents & reports" },
  { ext: "XLSX", color: "#22c55e", label: "Spreadsheets" },
  { ext: "DOCX", color: "#3b82f6", label: "Word documents" },
  { ext: "JPG",  color: "#f97316", label: "Images & photos" },
  { ext: "PNG",  color: "#8b5cf6", label: "Graphics & screenshots" },
  { ext: "ZIP",  color: "#64748b", label: "Archives & bundles" },
  { ext: "MP4",  color: "#ec4899", label: "Videos & demos" },
  { ext: "CSV",  color: "#14b8a6", label: "Data exports" },
];

function FileTypesSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Supported Formats"
          title={<>Upload any file type<br />your business uses</>}
          description="From signed quotations to product images — if your team works with it, Bizak stores it."
          maxWidth={560}
          className="mb-14"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FILE_TYPES.map((ft) => (
            <div
              key={ft.ext}
              className="flex items-center gap-4 p-5 rounded-bz-lg border border-bz-border/30 bg-bz-bg/50 hover:border-bz-text/20 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                style={{ background: `${ft.color}14`, border: `1px solid ${ft.color}28` }}
              >
                <span className="text-[10px] font-black tracking-[0.04em]" style={{ color: ft.color }}>{ft.ext}</span>
              </div>
              <div>
                <div className="text-[13px] font-bold text-bz-text">.{ft.ext.toLowerCase()}</div>
                <div className="text-[12px] text-bz-text-muted mt-0.5">{ft.label}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── ATTACH TO RECORDS ────────────────────────────────────────────────────────
const RECORDS = [
  { label: "Sales Order #1042",   file: "Signed Quotation.pdf",     color: "#3b82f6" },
  { label: "Purchase Order #219", file: "Supplier Invoice.pdf",     color: "#f97316" },
  { label: "Customer: ACME Corp", file: "KYC Documents.zip",        color: "#22c55e" },
  { label: "Employee: John D.",   file: "Employment Contract.docx", color: "#8b5cf6" },
];

function AttachToRecordsSection() {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <SectionHeading
              eyebrow="Contextual Attachments"
              title={<>Attach files directly<br />to any business record</>}
              description="When creating a sales order, attach the signed quotation. On a purchase order, pin the supplier invoice. Every record in Bizak can carry its own files — always in context, never lost."
              tone="light"
              align="left"
              maxWidth={440}
              className="mb-10"
            />
            <div
              className="p-6 bg-white/[0.04] rounded-bz-lg border border-white/[0.07]"
              style={{ borderLeft: "3px solid var(--bz-accent)" }}
            >
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2.5">Example</div>
              <p className="text-[13px] text-white/50 leading-[1.65] m-0">
                A sales rep creates a Sales Order for ACME Corp. Instead of emailing the signed quotation
                separately, they attach it from the File Cabinet — it stays linked to that order forever.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {RECORDS.map((r, i) => (
              <div
                key={r.label}
                className="flex items-center gap-3.5 p-4 rounded-bz-lg bg-white/[0.04] border border-white/[0.06]"
                style={{ opacity: i === 0 ? 1 : i === 1 ? 0.75 : i === 2 ? 0.52 : 0.32 }}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                  style={{ background: `${r.color}20`, border: `1px solid ${r.color}30` }}
                >
                  <FileText size={16} style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-white">{r.label}</div>
                  <div className="text-[10px] mt-0.5">
                    <span style={{ color: r.color }}>↗ {r.file}</span>
                    <span className="text-white/40"> attached</span>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-[7px] flex-shrink-0 flex items-center justify-center bg-bz-accent/10">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--bz-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17 4 12" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── BENEFITS ─────────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    Icon: Folder,
    title: "Central File Hub",
    desc: "All business media — documents, images, contracts — stored in one place, accessible to your entire team from anywhere in the system.",
  },
  {
    Icon: Paperclip,
    title: "Always In Context",
    desc: "Files are linked to the exact record they belong to. Open a sales order and every related attachment is right there — no separate folder hunting.",
  },
  {
    Icon: ShieldCheck,
    title: "Secure & Controlled",
    desc: "Role-based access ensures sensitive files — contracts, financial reports, HR documents — are only visible to the right people in your organization.",
  },
];

function BenefitsSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Why It Matters"
          title="Go paperless. Stay organized."
          align="center"
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BENEFITS.map(({ Icon: BIcon, title, desc }) => (
            <Card key={title} pad="lg" hover="lift">
              <IconBadge tone="sage" size="md" className="mb-6">
                <BIcon className="size-5" />
              </IconBadge>
              <h3 className="text-[17px] font-bold text-bz-text mb-3">{title}</h3>
              <p className="text-[14px] text-bz-text-muted leading-[1.7]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          title={<>Stop digging through folders.<br />Start attaching files.</>}
          description="Bizak's File Cabinet keeps every document exactly where it belongs — attached to the record that needs it."
          tone="light"
          align="center"
          maxWidth={560}
          className="mb-10"
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="https://system.bizakerp.com/account/self-register" withArrow>Start Free Trial</Button>
          <Button variant="ghostDark" size="lg" href="/contact">Book a Demo</Button>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function DocumentManagementPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroCentered
          tone="dark"
          mesh={false}
          badge={<HeroBadge tone="dark">File Cabinet</HeroBadge>}
          title={<>Every file,<br />right where you need it.</>}
          description="Store images, PDFs, spreadsheets, and any other file — then attach them directly to sales orders, invoices, or any record in Bizak. One hub. Zero lost files."
          actions={
            <>
              <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
              <Button variant="ghostDark" size="lg" href="#features">See How It Works</Button>
            </>
          }
          visual={
            <>
              <div className="flex flex-wrap justify-center gap-8 md:gap-14 py-6 mb-8 border-y border-white/10">
                {[
                  { value: "148+", label: "File types supported" },
                  { value: "100%", label: "Linked to records"    },
                ].map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} tone="light" size="md" align="center" />
                ))}
              </div>
              <FileCabinetVisual />
            </>
          }
        />
        <FileTypesSection />
        <AttachToRecordsSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
