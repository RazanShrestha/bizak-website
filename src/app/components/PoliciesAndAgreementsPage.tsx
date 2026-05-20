import { useState } from "react";
import {
  FileText,
  FileCode2,
  Download,
  Shield,
  ShieldCheck,
  Users,
  Building2,
  FileCheck,
  CheckCircle,
  Info,
} from "lucide-react";
import { LegalHero } from "./legal";
import { Section, Container } from "./bz";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileType = "PDF" | "DOCX";

interface PolicyDoc {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: FileType;
  size: string;
  updated: string;
  filename: string;
}

// ─── Download utility ─────────────────────────────────────────────────────────
// Generates a real downloadable file in the browser. PDF uses a minimal valid
// PDF blob; DOCX uses a plain-text stub with the correct MIME type. Both
// produce a real browser download — the server will supply actual content
// once the document management backend is wired up.

function triggerDownload(filename: string, type: FileType) {
  let blob: Blob;

  if (type === "DOCX") {
    blob = new Blob(
      [
        `${filename.replace(".docx", "")}\r\n\r\nThis is a placeholder document.\r\nFull content will be available from the Bizak document server.\r\n\r\n\xA9 2026 Bizak Technologies`,
      ],
      {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }
    );
  } else {
    // Minimal valid PDF-1.0 (blank single page, renders in every viewer)
    const PDF_B64 =
      "JVBERi0xLjAKMSAwIG9iajw8L1BhZ2VzIDIgMCBSPj5lbmRvYmoKMiAwIG9iajw8L0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvTWVkaWFCb3hbMCAwIDMgM10+PmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxNDUKJUVPRgo=";
    const raw = atob(PDF_B64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    blob = new Blob([arr], { type: "application/pdf" });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Corporate",
  "Data & Privacy",
  "Security",
  "Partner Agreements",
  "Compliance",
] as const;

type DocCategory = (typeof CATEGORIES)[number];

const DOCS: PolicyDoc[] = [
  // Corporate
  {
    id: "aup",
    title: "Acceptable Use Policy",
    description:
      "Governs how Bizak software and services may be used by customers, employees, and partners.",
    category: "Corporate",
    fileType: "PDF",
    size: "84 KB",
    updated: "Jan 2026",
    filename: "Bizak-Acceptable-Use-Policy.pdf",
  },
  {
    id: "data-retention",
    title: "Data Retention Policy",
    description:
      "Defines how long Bizak retains customer data and the procedures for deletion upon request or contract end.",
    category: "Corporate",
    fileType: "PDF",
    size: "112 KB",
    updated: "Jan 2026",
    filename: "Bizak-Data-Retention-Policy.pdf",
  },
  {
    id: "whistleblower",
    title: "Whistleblower Policy",
    description:
      "Protected disclosure procedures for reporting ethical concerns within Bizak and its partner network.",
    category: "Corporate",
    fileType: "PDF",
    size: "68 KB",
    updated: "Dec 2025",
    filename: "Bizak-Whistleblower-Policy.pdf",
  },

  // Data & Privacy
  {
    id: "privacy",
    title: "Privacy Policy",
    description:
      "How Bizak collects, uses, and safeguards personal information across the marketing site and ERP platform.",
    category: "Data & Privacy",
    fileType: "PDF",
    size: "210 KB",
    updated: "Jan 2026",
    filename: "Bizak-Privacy-Policy.pdf",
  },
  {
    id: "dpa",
    title: "Data Processing Agreement (DPA)",
    description:
      "Standard DPA for customers requiring GDPR-compliant processing terms. Sign and return to activate.",
    category: "Data & Privacy",
    fileType: "DOCX",
    size: "148 KB",
    updated: "Jan 2026",
    filename: "Bizak-Data-Processing-Agreement.docx",
  },
  {
    id: "cookie",
    title: "Cookie Policy",
    description:
      "Details the essential cookies used by Bizak and how they support authentication and platform security.",
    category: "Data & Privacy",
    fileType: "PDF",
    size: "56 KB",
    updated: "Jan 2026",
    filename: "Bizak-Cookie-Policy.pdf",
  },

  // Security
  {
    id: "infosec",
    title: "Information Security Policy",
    description:
      "Bizak's internal framework for protecting customer data at rest, in transit, and in cloud infrastructure.",
    category: "Security",
    fileType: "PDF",
    size: "176 KB",
    updated: "Feb 2026",
    filename: "Bizak-Information-Security-Policy.pdf",
  },
  {
    id: "vdp",
    title: "Vulnerability Disclosure Policy",
    description:
      "How to responsibly disclose security vulnerabilities to Bizak and what protections apply to researchers.",
    category: "Security",
    fileType: "PDF",
    size: "94 KB",
    updated: "Nov 2025",
    filename: "Bizak-Vulnerability-Disclosure-Policy.pdf",
  },

  // Partner Agreements
  {
    id: "reseller-agreement",
    title: "Reseller Agreement Template",
    description:
      "Standard agreement for Bizak Authorised Resellers covering licensing, pricing, and support obligations.",
    category: "Partner Agreements",
    fileType: "DOCX",
    size: "228 KB",
    updated: "Mar 2026",
    filename: "Bizak-Reseller-Agreement.docx",
  },
  {
    id: "tech-partner",
    title: "Technology Partner Agreement",
    description:
      "Integration and co-marketing terms for ISVs and technology partners connecting to Bizak APIs.",
    category: "Partner Agreements",
    fileType: "DOCX",
    size: "192 KB",
    updated: "Feb 2026",
    filename: "Bizak-Technology-Partner-Agreement.docx",
  },
  {
    id: "consultant-agreement",
    title: "Consultant & SI Agreement",
    description:
      "Framework agreement for implementation consultants and system integrators under the Bizak partner programme.",
    category: "Partner Agreements",
    fileType: "PDF",
    size: "164 KB",
    updated: "Jan 2026",
    filename: "Bizak-Consultant-SI-Agreement.pdf",
  },

  // Compliance
  {
    id: "gdpr-overview",
    title: "GDPR Compliance Overview",
    description:
      "Summary of Bizak's technical and organisational measures to meet GDPR obligations for EU customers.",
    category: "Compliance",
    fileType: "PDF",
    size: "138 KB",
    updated: "Jan 2026",
    filename: "Bizak-GDPR-Compliance-Overview.pdf",
  },
  {
    id: "soc2",
    title: "SOC 2 Type II Summary",
    description:
      "Executive summary of Bizak's SOC 2 Type II audit findings covering Security, Availability, and Confidentiality.",
    category: "Compliance",
    fileType: "PDF",
    size: "256 KB",
    updated: "Apr 2026",
    filename: "Bizak-SOC2-Type-II-Summary.pdf",
  },
];

// ─── Category icon map ────────────────────────────────────────────────────────

function categoryIcon(cat: string) {
  switch (cat) {
    case "Data & Privacy":
      return Shield;
    case "Security":
      return ShieldCheck;
    case "Partner Agreements":
      return Users;
    case "Compliance":
      return FileCheck;
    default:
      return Building2;
  }
}

// ─── Document card ────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: PolicyDoc }) {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleDownload() {
    if (status !== "idle") return;
    triggerDownload(doc.filename, doc.fileType);
    setStatus("done");
    setTimeout(() => setStatus("idle"), 2200);
  }

  const FileIcon = doc.fileType === "DOCX" ? FileCode2 : FileText;
  const CatIcon = categoryIcon(doc.category);

  return (
    <div className="flex flex-col rounded-bz-xl border border-bz-line bg-bz-surface p-5 transition-colors hover:border-bz-text-soft">
      {/* Icon + category badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm">
          <CatIcon size={16} className="text-bz-olive" />
        </div>
        <span className="rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2 py-[3px] text-[10px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
          {doc.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="m-0 mb-2 text-[14px] font-semibold leading-[1.35] tracking-tight text-bz-text">
        {doc.title}
      </h3>

      {/* Description — flex-1 pushes meta + button to the bottom */}
      <p className="m-0 flex-1 text-[12.5px] leading-[1.65] text-bz-text-muted">
        {doc.description}
      </p>

      {/* Meta row */}
      <div className="mt-5 mb-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-bz-text-soft">
        <span className="flex items-center gap-1">
          <FileIcon size={10} />
          {doc.fileType}
        </span>
        <span aria-hidden>·</span>
        <span>{doc.size}</span>
        <span aria-hidden>·</span>
        <span>{doc.updated}</span>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={status !== "idle"}
        className={`flex items-center justify-center gap-2 rounded-bz-md border px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
          status === "done"
            ? "border-bz-leaf-deep bg-bz-paper-warm text-bz-leaf-deep"
            : "border-bz-line bg-transparent text-bz-text hover:border-bz-olive hover:text-bz-olive"
        }`}
      >
        {status === "done" ? (
          <>
            <CheckCircle size={13} />
            Downloaded
          </>
        ) : (
          <>
            <Download size={13} />
            Download {doc.fileType}
          </>
        )}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PoliciesAndAgreementsPage() {
  const [active, setActive] = useState<DocCategory>("All");

  const visible =
    active === "All" ? DOCS : DOCS.filter((d) => d.category === active);

  return (
    <>
      <LegalHero
        badge="Policies & Agreements"
        title="Bizak policy library"
        summary="All Bizak policies, agreements and compliance documents in one place. Download any file to share with your legal, compliance, or procurement team."
        meta="Last reviewed April 2026"
      />

      <Section tone="a">
        <Container width="narrow">
          {/* Category filter tabs */}
          <div className="mb-7 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? DOCS.length
                  : DOCS.filter((d) => d.category === cat).length;
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-bz-pill border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                    isActive
                      ? "border-bz-olive bg-bz-olive text-white"
                      : "border-bz-line bg-transparent text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text"
                  }`}
                >
                  {cat}
                  <span
                    className={`tabular-nums text-[11px] ${
                      isActive ? "text-white/60" : "text-bz-text-soft"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result count */}
          <p className="mb-6 m-0 text-[12.5px] text-bz-text-soft">
            {visible.length} {visible.length === 1 ? "document" : "documents"}
          </p>

          {/* Document grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-12 flex gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm p-4">
            <Info
              size={15}
              strokeWidth={1.8}
              className="mt-[2px] shrink-0 text-bz-olive"
            />
            <p className="m-0 text-[13px] leading-[1.65] text-bz-text-muted">
              Can't find what you need? Contact{" "}
              <a
                href="mailto:legal@bizakerp.com"
                className="font-medium text-bz-text underline decoration-bz-line underline-offset-[3px] transition-colors hover:decoration-bz-text"
              >
                legal@bizakerp.com
              </a>{" "}
              and we'll send the relevant document directly.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
