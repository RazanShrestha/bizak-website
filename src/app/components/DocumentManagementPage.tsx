import {
  Section, Container, SectionHead, BentoGrid, Bento, Pill, PillGroup, Heading,
  BadgeGreen, StepCard, BigCard, StatusChip,
} from "./bz";
import {
  FileText, Folder, Paperclip, ShieldCheck, Search, Upload,
  Clock, Lock, FileImage, File, CheckCircle2,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const HERO_FILES = [
  { ext: "PDF",  name: "Signed Quotation.pdf",    size: "1.2 MB", by: "Sarah K.", fire: true,  fade: ""           },
  { ext: "DOCX", name: "Product Spec Sheet.docx", size: "340 KB", by: "Omar T.",  fire: false, fade: "opacity-80" },
  { ext: "JPG",  name: "Warehouse Photos.jpg",    size: "4.1 MB", by: "Priya M.", fire: true,  fade: "opacity-60" },
  { ext: "XLSX", name: "Delivery Schedule.xlsx",  size: "820 KB", by: "David R.", fire: false, fade: "opacity-40" },
];

const LINE_ITEMS = [
  { sku: "SKU-201", desc: "Design Consultation", qty: "×50", total: "$12,500" },
  { sku: "SKU-304", desc: "Delivery Service",    qty: "×5",  total: "$8,000"  },
  { sku: "",        desc: "Shipping & Handling",  qty: "",    total: "$4,000"  },
];

const RECORD_TYPES = [
  { icon: FileText,    module: "Sales Orders",    files: 4 },
  { icon: Folder,      module: "Purchase Orders", files: 2 },
  { icon: Paperclip,   module: "Customers",       files: 7 },
  { icon: ShieldCheck, module: "Employees",       files: 3 },
  { icon: FileImage,   module: "Fixed Assets",    files: 5 },
  { icon: File,        module: "Expenses",        files: 2 },
];

const TRUST_FEATURES = [
  {
    icon: Lock,
    title: "Role-based access",
    desc: "Finance reports stay with Finance. HR contracts stay with HR. Every file is scoped to the roles that need it no over-sharing, no accidental exposure.",
  },
  {
    icon: ShieldCheck,
    title: "100% audit compliance",
    desc: "Every upload, view, and download is logged with user, timestamp, and IP. Full chain of custody on every file, automatically.",
  },
  {
    icon: Clock,
    title: "Version history",
    desc: "Every revision of every document is retained. See who changed what and when and roll back to any earlier version in one click.",
  },
];

// ─── HERO MOCK ────────────────────────────────────────────────────────────────

function RecordAttachmentMock() {
  return (
    <div className="w-full rounded-bz-2xl border border-bz-line bg-bz-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-bz-line bg-bz-paper-warm flex items-center gap-1.5">
        <span className="text-[11px] text-bz-text-muted">Sales</span>
        <span className="text-[11px] text-bz-text-muted">/</span>
        <span className="text-[11px] font-semibold text-bz-text">SO-1042</span>
        <div className="ml-auto"><StatusChip variant="posted">Posted</StatusChip></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] divide-y md:divide-y-0 md:divide-x divide-bz-line">
        <div className="p-5 md:p-6">
          <div className="text-[10.5px] text-bz-text-muted mb-0.5">Sales Order</div>
          <div className="text-[22px] font-bold text-bz-text leading-none mb-1">SO-1042</div>
          <div className="text-[12.5px] text-bz-text-muted mb-5">ACME Corp Inc. · Apr 12, 2025</div>

          <div className="text-[10px] font-semibold text-bz-text-muted uppercase tracking-[0.09em] mb-2">Line Items</div>
          <div className="flex flex-col">
            {LINE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-bz-line-soft last:border-0">
                {item.sku && (
                  <span className="w-[52px] flex-shrink-0 text-[9.5px] font-semibold text-bz-text-muted">{item.sku}</span>
                )}
                <span className="flex-1 text-[12px] text-bz-text">{item.desc}</span>
                {item.qty && <span className="text-[11px] text-bz-text-muted">{item.qty}</span>}
                <span className="text-[12px] font-semibold text-bz-text tabular-nums">{item.total}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-bz-line">
            <span className="text-[12px] font-semibold text-bz-text-muted">Total</span>
            <span className="text-[18px] font-bold text-bz-text">$24,500.00</span>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="text-[10px] font-semibold text-bz-text-muted uppercase tracking-[0.09em] mb-3">
            Attachments ({HERO_FILES.length})
          </div>
          <div className="flex flex-col gap-2.5">
            {HERO_FILES.map((f) => (
              <div
                key={f.name}
                className={`flex items-center gap-2.5 p-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm ${f.fade}`}
              >
                <div
                  className={`w-9 h-9 rounded-[8px] flex-shrink-0 flex items-center justify-center ${
                    f.fire
                      ? "bg-bz-fire/[0.15] border border-bz-fire/[0.25]"
                      : "bg-bz-leaf/[0.22] border border-bz-leaf/[0.35]"
                  }`}
                >
                  <span className="text-[8px] font-black tracking-[0.04em] text-bz-text">{f.ext}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] font-semibold text-bz-text truncate">{f.name}</div>
                  <div className="text-[10px] text-bz-text-muted mt-0.5">{f.size} · {f.by}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

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
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">Request Demo</Pill>
          </PillGroup>
        </div>
        <div className="bz-hero-visual">
          <RecordAttachmentMock />
        </div>
      </Container>
    </Section>
  );
}

// ─── STEP VISUALS ─────────────────────────────────────────────────────────────

function UploadVisual() {
  return (
    <div className="w-full max-w-[400px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-5 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="border-2 border-dashed border-bz-line rounded-bz-lg px-5 py-8 flex flex-col items-center gap-3">
        <Upload size={22} className="text-bz-text-muted" />
        <span className="text-[12px] font-semibold text-bz-text-muted text-center">
          Drag any file here, or click to browse
        </span>
        <div className="flex flex-wrap gap-1.5 justify-center mt-0.5">
          {["PDF", "DOCX", "XLSX", "JPG", "ZIP"].map((ext) => (
            <span
              key={ext}
              className="text-[9px] font-bold px-2 py-0.5 rounded-bz-pill bg-bz-paper-warm border border-bz-line text-bz-text-muted"
            >
              {ext}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-bz-text-muted">
        <span>148 file types supported</span>
        <span className="font-semibold text-bz-text">No size limit</span>
      </div>
    </div>
  );
}

function AttachVisual() {
  return (
    <div className="w-full max-w-[400px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-5 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold text-bz-text-muted">Sales Order</span>
        <StatusChip variant="posted">Posted</StatusChip>
      </div>
      <div className="text-[16px] font-bold text-bz-text mb-0.5">SO-1042</div>
      <div className="text-[12px] text-bz-text-muted mb-4">ACME Corp · $24,500.00</div>
      <div className="text-[10px] font-semibold text-bz-text-muted uppercase tracking-[0.09em] mb-1.5">
        Attachments (1)
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 p-2.5 rounded-bz-md bg-bz-paper-warm border border-bz-line-soft">
          <span className="text-[8px] font-black text-bz-text bg-bz-fire rounded px-1.5 py-0.5 flex-shrink-0">PDF</span>
          <span className="text-[11px] text-bz-text flex-1 truncate font-medium">Signed Quotation.pdf</span>
          <CheckCircle2 size={12} className="text-bz-text-muted flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-bz-md border border-dashed border-bz-line">
          <Paperclip size={11} className="text-bz-text-muted" />
          <span className="text-[11px] text-bz-text-muted">Attach another file…</span>
        </div>
      </div>
    </div>
  );
}

function RetrieveVisual() {
  const results = [
    { name: "Signed Quotation - ACME Corp.pdf", record: "SO-1042 · Sales Orders" },
    { name: "Signed Quotation - BDC Ltd.pdf",   record: "SO-0987 · Sales Orders" },
  ];
  return (
    <div className="w-full max-w-[400px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-5 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-bz-lg bg-bz-paper-warm border border-bz-line mb-3">
        <Search size={12} className="text-bz-text-muted flex-shrink-0" />
        <span className="text-[12px] font-semibold text-bz-text">signed quotation</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {results.map((r) => (
          <div key={r.name} className="flex items-center gap-2.5 p-2.5 rounded-bz-md bg-bz-paper-warm border border-bz-line-soft">
            <span className="text-[8px] font-black text-bz-text bg-bz-fire rounded px-1.5 py-0.5 flex-shrink-0">PDF</span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-bz-text truncate">{r.name}</div>
              <div className="text-[9.5px] text-bz-text-muted mt-0.5">{r.record}</div>
            </div>
          </div>
        ))}
        <div className="text-[10px] text-bz-text-muted text-center pt-1">2 results · instant search</div>
      </div>
    </div>
  );
}

// ─── WORKFLOW ─────────────────────────────────────────────────────────────────

function DocumentWorkflowSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="How it works"
          title={<>Upload, attach, and retrieve{" "}<Heading.Muted>three steps to go paperless.</Heading.Muted></>}
          titleMaxWidth={640}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Upload"
            title="Drop any file type into Bizak"
            bullets={[
              "PDFs, spreadsheets, images, videos, archives all supported.",
              "Drag and drop from your desktop, or upload from any device.",
            ]}
            visual={<UploadVisual />}
          />
          <StepCard
            number="02"
            tag="Attach"
            title="Link files to the records they belong to"
            bullets={[
              "Attach a signed quotation to its sales order. Pin a supplier invoice to the PO.",
              "Files stay linked as records move through every workflow stage.",
            ]}
            visual={<AttachVisual />}
          />
          <StepCard
            number="03"
            tag="Retrieve"
            title="Find any file in seconds, from anywhere"
            bullets={[
              "Search by file name, type, linked record, or uploader.",
              "Open any record and every attachment is right there no folder hunting.",
            ]}
            visual={<RetrieveVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ─── RECORD CONTEXT ───────────────────────────────────────────────────────────

function RecordTypesVisual() {
  return (
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {RECORD_TYPES.map(({ icon: Icon, module, files }) => (
        <div
          key={module}
          className="flex items-center gap-2.5 p-3 rounded-bz-lg bg-white/[0.05] border border-white/[0.08]"
        >
          <div className="w-8 h-8 rounded-[8px] bg-bz-fire/[0.10] flex items-center justify-center flex-shrink-0">
            <Icon size={13} className="text-bz-fire" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">{module}</div>
            <div className="text-[9.5px] text-white/40">{files} files</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecordContextSection() {
  return (
    <Section tone="b">
      <Container>
        <BigCard
          text={{
            title: "Files that follow every record.",
            body: "Every module in Bizak carries its own document panel. Open a purchase order, a customer profile, an employee record, or a fixed asset and every related file is right there, in context.",
            bullets: [
              "Attach files during record creation no separate upload step",
              "Files travel with the record through every status change",
              "Every attachment auto-links to the originating transaction",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Request Demo" },
          }}
          visual={<RecordTypesVisual />}
        />
      </Container>
    </Section>
  );
}

// ─── TRUST ────────────────────────────────────────────────────────────────────

function TrustSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="02"
          label="Security & compliance"
          title={<>Sensitive files,{" "}<Heading.Muted>in the right hands.</Heading.Muted></>}
        />
        <BentoGrid cols={3}>
          {TRUST_FEATURES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <Bento.Header title={title} icon={<Icon size={18} />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function DocumentManagementPage() {
  return (
    <>
      <HeroSection />
      <DocumentWorkflowSection />
      <RecordContextSection />
      <TrustSection />
    </>
  );
}
