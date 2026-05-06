import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

const C = {
      deep: "#1A1D19",
  primary: "#010201",
  accent: "#aef831",
  accentDim: "rgba(174,248,49,0.12)",
  white: "#ffffff",
  surface: "#f8faf9",
  surfaceLow: "#f3f4f3",
  surfaceHigh: "#e7e8e7",
  dark: "#0a0b0a",
  darkBg: "#1a1d1a",
  zinc700: "#3f3f46",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  onSurface: "#191c1c",
  onSurfaceVar: "#444844",
  border: "rgba(197,199,194,0.3)",
  borderDark: "rgba(255,255,255,0.06)",
};

function Ico({ d, size = 20, color = "currentColor", strokeWidth = 1.8 }: {
  d: string | string[]; size?: number; color?: string; strokeWidth?: number;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function FileCabinetVisual() {
  const files = [
    { name: "Signed Quotation - ACME Corp.pdf", ext: "PDF", size: "1.2 MB", tag: "Sales Order #1042", tagColor: "#3b82f6" },
    { name: "Product Catalog 2025.xlsx",         ext: "XLSX", size: "2.4 MB", tag: "Inventory",         tagColor: "#22c55e" },
    { name: "Vendor Agreement.docx",             ext: "DOCX", size: "320 KB", tag: "Supplier #204",     tagColor: "#f97316" },
    { name: "Warehouse Photo Apr.jpg",           ext: "JPG",  size: "4.1 MB", tag: "Fixed Assets",      tagColor: "#8b5cf6" },
  ];

  return (
    <div style={{
      background: C.white, borderRadius: 24,
      border: `1px solid ${C.border}`,
      boxShadow: "0 32px 80px -20px rgba(0,0,0,0.14)",
      overflow: "hidden", width: "100%", maxWidth: 480,
    }}>
      {/* Titlebar */}
      <div style={{
        background: C.primary, padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
        }}>Bizak · File Cabinet</span>
        <div style={{ width: 46 }} />
      </div>

      {/* Search */}
      <div style={{
        padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
        background: C.surface, display: "flex", alignItems: "center", gap: 8,
      }}>
        <Ico
          d={["M11 4a7 7 0 1 0 0 14A7 7 0 0 0 11 4z", "M21 21l-4.35-4.35"]}
          size={13} color="rgba(68,72,68,0.35)"
        />
        <span style={{ fontSize: 12, color: "rgba(68,72,68,0.3)" }}>Search files...</span>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 8px",
            background: C.surfaceHigh, borderRadius: 4,
            color: C.onSurfaceVar, textTransform: "uppercase", letterSpacing: "0.08em",
          }}>All Types</span>
        </div>
      </div>

      {/* File rows */}
      {files.map((f, i) => (
        <div key={f.name} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
          background: i === 0 ? "rgba(174,248,49,0.06)" : "transparent",
          borderLeft: `3px solid ${i === 0 ? C.accent : "transparent"}`,
          borderBottom: i < files.length - 1 ? `1px solid ${C.border}` : "none",
          opacity: i === 0 ? 1 : i === 1 ? 0.72 : i === 2 ? 0.5 : 0.3,
        }}>
          <div style={{
            minWidth: 38, height: 38, borderRadius: 8,
            background: i === 0 ? C.accentDim : C.surfaceHigh,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: 7, fontWeight: 900, letterSpacing: "0.04em",
              color: i === 0 ? "#446900" : C.onSurfaceVar,
            }}>{f.ext}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: C.primary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{f.name}</div>
            <div style={{ fontSize: 10, color: "rgba(68,72,68,0.45)", marginTop: 2 }}>{f.size}</div>
          </div>
          <div style={{
            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
            whiteSpace: "nowrap",
            background: `${f.tagColor}18`, color: f.tagColor,
            border: `1px solid ${f.tagColor}30`,
          }}>{f.tag}</div>
        </div>
      ))}

      {/* Footer */}
      <div style={{
        padding: "10px 16px", borderTop: `1px solid ${C.border}`,
        background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 10, color: "rgba(68,72,68,0.4)", fontWeight: 600 }}>148 files · 2.1 GB</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent }} />
          <span style={{
            fontSize: 10, fontWeight: 700, color: "rgba(68,72,68,0.4)",
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>Synced</span>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section style={{ padding: "96px 32px 80px", background: C.surface }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-block", padding: "6px 16px",
              background: C.surfaceHigh, borderRadius: 999,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              color: C.onSurfaceVar, textTransform: "uppercase", marginBottom: 32,
            }}>File Cabinet</div>

            <h1 style={{
              fontFamily: "Manrope, Inter, sans-serif",
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 700, lineHeight: 1.1,
              letterSpacing: "-0.04em", color: C.primary, marginBottom: 24,
            }}>
              Every file,<br />right where<br />you need it.
            </h1>

            <p style={{ fontSize: 17, color: C.onSurfaceVar, lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Store images, PDFs, spreadsheets, and any other file — then attach them directly to sales orders,
              invoices, or any record in Bizak. One hub. Zero lost files.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{
                padding: "14px 32px", background: C.primary, color: C.white,
                borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              }}>Request Demo</a>
              <button style={{
                padding: "14px 32px", background: C.white,
                border: "1px solid rgba(197,199,194,0.5)",
                borderRadius: 10, fontWeight: 700, fontSize: 14, color: C.primary, cursor: "pointer",
              }}>See How It Works</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <FileCabinetVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. SUPPORTED FILE TYPES ──────────────────────────────────────────────────
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
    <section style={{ padding: "96px 32px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.2em", color: C.onSurfaceVar, display: "block", marginBottom: 18,
        }}>Supported Formats</span>
        <h2 style={{
          fontFamily: "Manrope, Inter, sans-serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 600, color: C.primary, letterSpacing: "-0.02em",
          lineHeight: 1.2, maxWidth: 600, marginBottom: 20,
        }}>
          Upload any file type<br />your business uses
        </h2>
        <p style={{ fontSize: 15, color: C.onSurfaceVar, maxWidth: 520, lineHeight: 1.7, marginBottom: 56 }}>
          From signed quotations to product images — if your team works with it, Bizak stores it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {FILE_TYPES.map((ft) => (
            <div
              key={ft.ext}
              style={{
                padding: "20px 24px",
                background: "rgba(243,244,243,0.5)",
                borderRadius: 14, border: "1px solid rgba(197,199,194,0.2)",
                display: "flex", alignItems: "center", gap: 16,
                cursor: "default", transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(1,2,1,0.2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(197,199,194,0.2)"}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                background: `${ft.color}14`,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${ft.color}28`,
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: ft.color, letterSpacing: "0.04em" }}>{ft.ext}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>.{ft.ext.toLowerCase()}</div>
                <div style={{ fontSize: 12, color: C.onSurfaceVar, marginTop: 2 }}>{ft.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. ATTACH TO RECORDS (dark) ─────────────────────────────────────────────
const RECORDS = [
  { label: "Sales Order #1042",   file: "Signed Quotation.pdf",      color: "#3b82f6" },
  { label: "Purchase Order #219", file: "Supplier Invoice.pdf",       color: "#f97316" },
  { label: "Customer: ACME Corp", file: "KYC Documents.zip",          color: "#22c55e" },
  { label: "Employee: John D.",   file: "Employment Contract.docx",   color: "#8b5cf6" },
];

function AttachToRecordsSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.darkBg, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Text */}
          <div>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.2em", color: C.zinc500, display: "block", marginBottom: 20,
            }}>Contextual Attachments</span>
            <h2 style={{
              fontFamily: "Manrope, Inter, sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 600, color: C.white, letterSpacing: "-0.02em",
              lineHeight: 1.2, marginBottom: 24,
            }}>
              Attach files directly<br />to any business record
            </h2>
            <p style={{ fontSize: 15, color: C.zinc400, lineHeight: 1.7, marginBottom: 40, maxWidth: 440 }}>
              When creating a sales order, attach the signed quotation. On a purchase order,
              pin the supplier invoice. Every record in Bizak can carry its own files —
              always in context, never lost.
            </p>

            {/* Example callout */}
            <div style={{
              padding: "20px 24px", background: "rgba(255,255,255,0.04)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)",
              borderLeft: `3px solid ${C.accent}`,
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: C.zinc500,
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10,
              }}>Example</div>
              <p style={{ fontSize: 13, color: C.zinc400, lineHeight: 1.65, margin: 0 }}>
                A sales rep creates a Sales Order for ACME Corp. Instead of emailing the signed quotation
                separately, they attach it from the File Cabinet — it stays linked to that order forever.
              </p>
            </div>
          </div>

          {/* Record cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RECORDS.map((r, i) => (
              <div key={r.label} style={{
                background: "rgba(255,255,255,0.04)", borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 14,
                opacity: i === 0 ? 1 : i === 1 ? 0.75 : i === 2 ? 0.52 : 0.32,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${r.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${r.color}30`,
                }}>
                  <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" size={16} color={r.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: C.zinc500, marginTop: 3 }}>
                    <span style={{ color: r.color }}>↗ {r.file}</span>
                    {" "}attached
                  </div>
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: "rgba(174,248,49,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ico d="M20 6L9 17 4 12" size={13} color={C.accent} strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. KEY BENEFITS ─────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    title: "Central File Hub",
    desc: "All business media — documents, images, contracts — stored in one place, accessible to your entire team from anywhere in the system.",
  },
  {
    icon: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
    title: "Always In Context",
    desc: "Files are linked to the exact record they belong to. Open a sales order and every related attachment is right there — no separate folder hunting.",
  },
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "Secure & Controlled",
    desc: "Role-based access ensures sensitive files — contracts, financial reports, HR documents — are only visible to the right people in your organization.",
  },
];

function BenefitsSection() {
  return (
    <section style={{ padding: "96px 32px", background: C.surface }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.2em", color: C.onSurfaceVar, display: "block", marginBottom: 14,
          }}>Why It Matters</span>
          <h2 style={{
            fontFamily: "Manrope, Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 600, color: C.primary, letterSpacing: "-0.02em",
          }}>Go paperless. Stay organized.</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                padding: 36, background: C.white, borderRadius: 20,
                border: "1px solid rgba(197,199,194,0.2)",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.surfaceHigh, border: "1px solid rgba(197,199,194,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
              }}>
                <Ico d={b.icon} size={20} color={C.onSurface} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: C.primary, marginBottom: 12 }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: C.onSurfaceVar, lineHeight: 1.7 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. CTA ───────────────────────────────────────────────────────────────────
// function CTASection() {
//   return (
//     <section style={{ background: C.darkBg, padding: "128px 32px", overflow: "hidden", position: "relative" }}>
//       <div style={{
//         position: "absolute", bottom: -293, left: -128, right: -128, height: 586,
//         background: "radial-gradient(ellipse at 50% 50%, rgba(174,248,49,0.04) 0%, transparent 70%)",
//         pointerEvents: "none",
//       }} />
//       <div style={{
//         maxWidth: 896, margin: "0 auto",
//         display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
//         position: "relative", zIndex: 1,
//       }}>
//         <h2 style={{
//           fontFamily: "Manrope, Inter, sans-serif", fontWeight: 700,
//           fontSize: "clamp(32px, 4.5vw, 48px)",
//           lineHeight: 1.2, letterSpacing: "-0.03em",
//           color: "#fff", textAlign: "center", margin: 0,
//         }}>
//           Stop digging through folders.<br />Start attaching files.
//         </h2>
//         <p style={{
//           fontFamily: "Inter", fontWeight: 400,
//           fontSize: 18, lineHeight: 1.7,
//           color: "rgba(255,255,255,0.4)",
//           textAlign: "center", margin: 0, maxWidth: 520,
//         }}>
//           Bizak's File Cabinet keeps every document exactly where it belongs —
//           attached to the record that needs it.
//         </p>
//         <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
//           <button style={{
//             background: C.accent, color: C.dark, border: "none",
//             borderRadius: 10, padding: "16px 36px",
//             fontFamily: "Inter", fontWeight: 700, fontSize: 16,
//             cursor: "pointer", boxShadow: "0 0 20px rgba(174,248,49,0.35)",
//           }}>Request Demo</button>
//           <button style={{
//             background: "transparent", color: "#fff",
//             border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10,
//             padding: "16px 36px",
//             fontFamily: "Inter", fontWeight: 700, fontSize: 16, cursor: "pointer",
//           }}>View Pricing</button>
//         </div>
//       </div>
//     </section>
//   );
// }

function CTASection() {
  return (
    <section className="biz-cta-section" style={{ background: C.deep, padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(199,255,53,0.04) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(199,255,53,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: C.accentLow,
            border: `1px solid ${C.accentMid}`,
            borderRadius: 100,
            padding: "6px 18px",
            marginBottom: 32,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "block" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.08em" }}>OPEN TO ALL BACKGROUNDS</span>
        </div> */}

        <h2
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: "clamp(32px, 4.5vw, 58px)",
            fontWeight: 800,
            color: C.white,
            lineHeight: 1.08,
            margin: "0 0 20px",
            letterSpacing: "-0.03em",
          }}
        >
       
          Stop digging through folders.{" "}<span style={{ color: C.accent }}> Start attaching files.</span>
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7,
            margin: "0 auto 48px",
            maxWidth: 580,
          }}
        >
                 Bizak's File Cabinet keeps every document exactly where it belongs — attached to the record that needs it.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://system.bizakerp.com/account/self-register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.accent,
              color: C.deep,
              padding: "15px 36px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 32px rgba(199,255,53,0.35)`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = ""; }}
          >
      Start Free Trial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
          <a
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              color: C.white,
              padding: "15px 36px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              border: `1px solid ${C.borderDark}`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.borderDark; }}
          >
           Book a demo
          </a>
        </div>

       
      </div>
    </section>
  );
}




// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function DocumentManagementPage() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <FileTypesSection />
        <AttachToRecordsSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
