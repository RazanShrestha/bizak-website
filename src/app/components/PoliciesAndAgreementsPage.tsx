import { useState } from "react";
import {
  FileText,
  FileCode2,
  Download,
  Shield,
  Building2,
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
  fileUrl: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Data & Privacy",
] as const;

type DocCategory = (typeof CATEGORIES)[number];

const DOCS: PolicyDoc[] = [
  // Corporate
  {
    id: "aup",
    title: "Hosting & Support Delivery Policy",
    description: "The infrastructure, security safeguards, support services and service-level commitments applicable to the Bizak ERP Service.",
    category: "Data & Privacy",
    fileType: "PDF",
    size: "84 KB",
    updated: "Jan 2026",
    fileUrl: "https://your-bucket-url/Bizak-Acceptable-Use-Policy.pdf",
  }
];

// ─── Category icon map ────────────────────────────────────────────────────────

function categoryIcon(cat: string) {
  switch (cat) {
    case "Data & Privacy":
      return Shield;
    default:
      return Building2;
  }
}

// ─── Document card ────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: PolicyDoc }) {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleDownload() {
    if (status !== "idle") return;
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.fileUrl.split("/").pop() ?? doc.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
