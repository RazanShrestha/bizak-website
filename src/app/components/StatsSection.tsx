import svgPaths from "../../imports/svg-eyvfmiiac4";

const stats = [
  { value: '50,000+', label: 'Active businesses powered' },
  { value: '120+', label: 'Countries supported' },
  { value: '$50B+', label: 'Annual revenue managed' },
];

export function StatsSection() {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Horizontal divider with centered icon */}
        <div className="relative flex items-center justify-center mb-12">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-[rgba(122,130,109,0.5)]"></div>
          <div className="mx-8 bg-[#333] rounded-lg size-14 flex items-center justify-center border border-[rgba(255,255,255,0.05)] shadow-md">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d={svgPaths.pf778600} fill="#7A826D" />
            </svg>
          </div>
          <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent to-[rgba(122,130,109,0.5)]"></div>
        </div>

        {/* Main heading */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-[#333] tracking-tight"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2, letterSpacing: '-1.2px' }}>
            Powering modern enterprises<br />across the globe
          </h2>
        </div>

        {/* Stats */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-16">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <p className="text-[#7a826d] uppercase tracking-widest text-center"
                style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, letterSpacing: '2.2px' }}>
                {stat.label}
              </p>
              <div className="text-[#333] text-center tracking-tight"
                style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: 1, letterSpacing: '-1.5px' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}