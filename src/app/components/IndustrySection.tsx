import svgPaths from "../../imports/svg-eyvfmiiac4";

const cards = [
  {
    stat: '40%',
    label: 'Productivity Gain',
    desc: 'Average increase in operational speed reported by our mid-market partners within the first 6 months.',
    chart: true,
  },
  {
    stat: 'Zero',
    label: 'Paper Management',
    desc: '100% cloud-native document storage with OCR capability and secure digital archiving for audit trails.',
    progress: true,
  },
  {
    stat: '24/7',
    label: 'Expert Support',
    desc: 'Direct access to ERP implementation experts and a dedicated account manager for enterprise plans.',
    avatars: true,
  },
];

export function IndustrySection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-[#7a826d] tracking-widest uppercase mb-2"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, letterSpacing: '1.4px' }}>
            Impact
          </p>
          <h2 className="text-[#333] tracking-tight mb-4"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2, letterSpacing: '-1.2px' }}>
            Proven Success Across Every Industry
          </h2>
          <p className="text-[#666] max-w-lg"
            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 18, lineHeight: 1.625 }}>
            Real numbers from companies that made the switch.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {cards.map((card, i) => (
            <div key={i} className="bg-white border border-[#e8eae4] rounded-lg p-8 flex flex-col gap-2 shadow-sm">
              <div className="text-[#333] tracking-tight"
                style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 36, lineHeight: 1.11 }}>
                {card.stat}
              </div>
              <div className="text-[rgba(51,51,51,0.8)] uppercase tracking-wide"
                style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, letterSpacing: '0.7px' }}>
                {card.label}
              </div>
              <p className="text-[#666] pt-2"
                style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>
                {card.desc}
              </p>

              {/* Chart */}
              {card.chart && (
                <div className="h-20 flex items-end gap-1.5 mt-4">
                  {[12.8, 22.4, 32, 28.8, 48, 57.6].map((h, j) => (
                    <div key={j} className="flex-1 rounded-sm"
                      style={{
                        height: h,
                        background: j === 5 ? '#7a826d' : `rgba(122,130,109,${0.1 + j * 0.07})`
                      }}></div>
                  ))}
                </div>
              )}

              {/* Progress */}
              {card.progress && (
                <div className="bg-[#f8f9f7] border border-[#e8eae4] rounded flex items-center gap-3 p-4 mt-4">
                  <svg width="15" height="19" viewBox="0 0 14.9999 18.9999" fill="none">
                    <path d={svgPaths.p713f7c0} fill="#7A826D" />
                  </svg>
                  <div className="flex-1 h-1.5 bg-[#e8eae4] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7a826d] w-full rounded-full"></div>
                  </div>
                </div>
              )}

              {/* Avatars */}
              {card.avatars && (
                <div className="flex items-center mt-4 pt-4">
                  {[
                    { bg: 'bg-[#e8eae4]' },
                    { bg: 'bg-[rgba(122,130,109,0.2)]' },
                    { bg: 'bg-[rgba(122,130,109,0.4)]' },
                    { bg: 'bg-[#7a826d]', text: '+12' },
                  ].map((av, j) => (
                    <div key={j} className={`size-9 rounded-full ${av.bg} flex items-center justify-center border-2 border-white ${j > 0 ? '-ml-2' : ''}`}>
                      {av.text && <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>{av.text}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
