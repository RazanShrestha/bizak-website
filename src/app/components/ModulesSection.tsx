import svgPaths from "../../imports/svg-eyvfmiiac4";

const modules = [
  {
    icon: svgPaths.p8158820,
    name: "E-Billing",
    desc: "Automated tax compliance, electronic signatures, and localized invoice templates.",
    preview: (
      <div className="bg-white border border-[#e8eae4] rounded p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-2 bg-[#e8eae4] rounded w-16"></div>
          <div className="h-2 bg-[rgba(122,130,109,0.1)] rounded w-8"></div>
        </div>
        <div className="h-1.5 bg-[#f8f9f7] rounded w-full"></div>
        <div className="h-1.5 bg-[#f8f9f7] rounded w-3/4"></div>
      </div>
    ),
  },
  {
    icon: svgPaths.p23b42200,
    name: "Advanced Sales",
    desc: "CRM-integrated pipeline management, automated quotes, and sales forecasting.",
    preview: (
      <div className="bg-white border border-[#e8eae4] rounded p-4">
        <div className="flex items-end gap-1 h-12">
          {[24, 36, 16, 48].map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${i === 1 || i === 3 ? 'bg-[#7a826d]' : 'bg-[#e8eae4]'}`} style={{ height: h }}></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: svgPaths.p3d3c400,
    name: "Purchase & Procurement",
    desc: "RFQ automation, landed cost calculation, and vendor performance analytics.",
    preview: (
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-[#e8eae4] rounded p-3 text-center">
          <div className="text-[rgba(51,51,51,0.4)] uppercase tracking-wide" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>RFQ #01</div>
        </div>
        <div className="flex-1 bg-white border border-[#e8eae4] rounded p-3 text-center">
          <div className="text-[rgba(51,51,51,0.4)] uppercase tracking-wide" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>RFQ #02</div>
        </div>
      </div>
    ),
  },
  {
    icon: svgPaths.p18aed800,
    name: "Inventory Control",
    desc: "Real-time stock tracking, multi-warehouse management, and barcode integration.",
    preview: (
      <div className="bg-white border border-[#e8eae4] rounded p-4 flex items-center justify-center">
        <svg width="22" height="18" viewBox="0 0 21.5 17.5" fill="none">
          <path d={svgPaths.p37735b40} fill="#E8EAE4" />
        </svg>
      </div>
    ),
  },
  {
    icon: svgPaths.pd19dfc0,
    name: "Finance & Accounts",
    desc: "Journal entries, bank reconciliation, and real-time P&L reporting.",
    preview: (
      <div className="bg-white border border-[#e8eae4] rounded p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[rgba(51,51,51,0.6)]" style={{ fontFamily: 'monospace', fontSize: 10 }}>Debit</span>
          <span className="text-[#7a826d]" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 10 }}>$12,400.00</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[rgba(51,51,51,0.6)]" style={{ fontFamily: 'monospace', fontSize: 10 }}>Credit</span>
          <span className="text-[rgba(51,51,51,0.4)]" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 10 }}>$12,400.00</span>
        </div>
      </div>
    ),
  },
];

export function ModulesSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-[#7a826d] tracking-widest uppercase mb-4"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, letterSpacing: '1.4px' }}>
            Core Modules
          </p>
          <h2 className="text-[#333] tracking-tight mb-4"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2, letterSpacing: '-1.2px' }}>
            Everything you need in one place
          </h2>
          <p className="text-[#666] max-w-lg"
            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 18, lineHeight: 1.625 }}>
            The unified infrastructure for your entire business lifecycle.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <div key={i} className="bg-[#f8f9f7] border border-[#e8eae4] rounded-lg p-8 flex flex-col gap-4">
              {/* Icon */}
              <div className="bg-white border border-[#e8eae4] shadow-sm rounded flex items-center justify-center size-10">
                <svg width="17" height="19" viewBox="0 0 17 19" fill="none">
                  <path d={mod.icon} fill="#7A826D" />
                </svg>
              </div>
              {/* Title */}
              <h3 className="text-[#333]" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18 }}>{mod.name}</h3>
              {/* Description */}
              <p className="text-[#666]" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>{mod.desc}</p>
              {/* Preview */}
              <div className="mt-2">{mod.preview}</div>
            </div>
          ))}

          {/* Need more card */}
          <div className="bg-[#333] rounded-lg p-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="mb-2">
              <svg width="19" height="19" viewBox="0 0 18.9999 18.9999" fill="none">
                <path d={svgPaths.p498c600} fill="#7A826D" />
              </svg>
            </div>
            <h3 className="text-white" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18 }}>Need more?</h3>
            <p className="text-white/60" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14 }}>
              Explore 20+ additional specialized modules.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
