import svgPaths from "../../imports/svg-eyvfmiiac4";


/*
import imgVerticalDivider from "figma:asset/f2e380d17eac162241d624859384640c4ef342fe.png";*/

import imgVerticalDivider from "../../assets/f2e380d17eac162241d624859384640c4ef342fe.png";

import { ImageWithFallback } from "./figma/ImageWithFallback";

function ConfigureCard() {
  return (
    <div className="bg-white rounded-xl border border-[rgba(232,234,228,0.3)] shadow-md p-8 w-full max-w-md">
      {/* Toggle row */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-2 bg-[rgba(232,234,228,0.5)] rounded-full w-32"></div>
        <div className="relative w-8 h-4 bg-[rgba(122,130,109,0.2)] rounded-full overflow-hidden">
          <div className="absolute right-1 top-1 w-2.5 h-2.5 bg-[#7a826d] rounded-full"></div>
        </div>
      </div>
      {/* Config rows */}
      <div className="space-y-6">
        {[
          { icon: svgPaths.p30227100, label: 'Global Ruleset', toggle: true, active: false },
          { icon: svgPaths.p18964900, label: 'Node Mapping', toggle: false, arrow: true },
          { icon: svgPaths.p2bdb86e0, label: 'Role Access', toggle: true, inactive: true },
        ].map((item, i) => (
          <div key={i} className={`${i === 1 ? 'bg-white border border-[#e8eae4]' : 'bg-[#f8f9f7] border border-[rgba(232,234,228,0.5)]'} rounded-lg flex items-center justify-between p-4`}>
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d={item.icon} fill="#7A826D" />
              </svg>
              <span className="text-[rgba(51,51,51,0.7)] uppercase" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12 }}>{item.label}</span>
            </div>
            {item.arrow ? (
              <svg width="19" height="11" viewBox="0 0 18.9999 10.9999" fill="none">
                <path d={svgPaths.p11a11ee0} fill="#7A826D" />
              </svg>
            ) : (
              <div className={`w-10 h-5 rounded-full ${item.inactive ? 'bg-[#e8eae4]' : 'bg-[rgba(122,130,109,0.2)]'} overflow-hidden relative`}>
                <div className={`absolute ${item.inactive ? 'left-1' : 'right-1'} top-1 w-3 h-3 ${item.inactive ? 'bg-white' : 'bg-[#7a826d]'} rounded-full`}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DataMigrationCard() {
  return (
    <div className="bg-[#0a0a0a] rounded-3xl w-full max-w-xl p-12 flex items-center justify-between"
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Data sources */}
      <div className="space-y-14">
        {[
          { label: 'Enterprise ERP', sub: 'Multi-cloud Instance', icon: svgPaths.p1b752c80 },
          { label: 'Cloud Storage', sub: 'Global Data Lakes', icon: svgPaths.p18938530 },
          { label: 'Legacy Databases', sub: 'SQL/NoSQL Archives', icon: svgPaths.p1e630f90 },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-5">
            <div className="bg-white/5 rounded-xl size-14 flex items-center justify-center border border-white/10">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d={item.icon} fill="white" fillOpacity="0.4" />
              </svg>
            </div>
            <div>
              <div className="text-white/80 tracking-widest uppercase" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11 }}>{item.label}</div>
              <div className="text-white/30" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: 9 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection lines SVG */}
      <div className="relative w-32 mx-2">
        <svg viewBox="0 0 422 227" fill="none" className="w-full opacity-50">
          <path d={svgPaths.p5bac000} stroke="#7A826D" strokeWidth="0.57" strokeDasharray="3 3" strokeOpacity="0.4" />
          <path d="M112.633 113.5H339.633" stroke="#7A826D" strokeWidth="0.57" strokeDasharray="3 3" strokeOpacity="0.4" />
          <path d={svgPaths.p215c8f90} stroke="#7A826D" strokeWidth="0.57" strokeDasharray="3 3" strokeOpacity="0.4" />
        </svg>
      </div>

      {/* Core node */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[rgba(122,130,109,0.1)] opacity-20"></div>
          <div className="absolute inset-5 rounded-full border border-[rgba(122,130,109,0.2)] opacity-30"></div>
          <div className="bg-gradient-to-br from-[rgba(122,130,109,0.1)] to-[rgba(122,130,109,0.05)] rounded-full size-32 flex items-center justify-center border border-[rgba(122,130,109,0.3)] backdrop-blur-sm">
            <div className="bg-[#121212] rounded-xl size-16 flex items-center justify-center relative border border-white/10">
              <svg width="15" height="19" viewBox="0 0 14.9999 18.9422" fill="none">
                <path d={svgPaths.p7482800} fill="#7A826D" />
              </svg>
              <div className="absolute -top-1 -right-1 bg-[#7a826d] rounded-full size-8 flex items-center justify-center border-4 border-[#0a0a0a]">
                <svg width="14" height="13" viewBox="0 0 22 21" fill="none">
                  <path d={svgPaths.p13774060} fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[#7a826d] tracking-widest uppercase text-center" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, letterSpacing: '3.6px' }}>
          Bizak Data Core
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"></div>
          <span className="text-white/70 tracking-widest uppercase" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9 }}>Live Ingestion</span>
        </div>
      </div>
    </div>
  );
}

function GoLiveCard() {
  return (
    <div className="bg-white rounded-xl border border-[rgba(232,234,228,0.3)] shadow-md p-8 w-full max-w-md flex flex-col items-center">
      {/* Avatar stack */}
      <div className="flex items-center mb-6 self-start">
        {[
          { bg: 'bg-[rgba(122,130,109,0.2)]', label: 'JD', color: 'text-[#7a826d]', border: 'border-4 border-white shadow-[0_0_25px_rgba(122,130,109,0.5)]' },
          { bg: 'bg-[rgba(51,51,51,0.1)]', label: 'SM', color: 'text-[rgba(51,51,51,0.6)]', border: 'border-4 border-white' },
          { bg: 'bg-[rgba(122,130,109,0.3)]', label: 'AK', color: 'text-[#7a826d]', border: 'border-4 border-white' },
          { bg: 'bg-[#e8eae4]', label: '+', color: 'text-[#7a826d]', border: 'border-4 border-white', extra: true },
        ].map((av, i) => (
          <div key={i} className={`size-12 rounded-full ${av.bg} ${av.border} flex items-center justify-center ${i > 0 ? '-ml-3' : ''} relative z-${10 - i}`}>
            <span className={`${av.color}`} style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12 }}>
              {av.extra ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d={svgPaths.p2bb32400} fill="#7A826D" />
                </svg>
              ) : av.label}
            </span>
          </div>
        ))}
      </div>

      {/* Go live status */}
      <div className="w-full space-y-4">
        <p className="text-[#7a826d] tracking-widest uppercase text-center" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, letterSpacing: '2px' }}>
          Ready for Launch
        </p>
        <button className="w-full bg-[#7a826d] text-white rounded-lg py-4 flex items-center justify-center gap-2 shadow-md hover:bg-[#666e5f] transition-colors">
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, letterSpacing: '1.2px' }} className="uppercase">Go Live Now</span>
          <svg width="16" height="16" viewBox="0 0 20.0467 20.0706" fill="none">
            <path d={svgPaths.p6551200} fill="white" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const steps = [
  {
    number: '01',
    category: 'Configuration',
    title: 'Instantly configure',
    desc: 'Define your organizational structure and business units with a dynamic configurator that sets up your entire infrastructure in minutes.',
    card: <ConfigureCard />,
    reverse: false,
  },
  {
    number: '02',
    category: 'Data Flow',
    title: 'Migrate your data',
    desc: 'Seamlessly transition legacy assets. Our data-stream engine maps your historical records into the Bizak cloud with zero downtime.',
    card: <DataMigrationCard />,
    reverse: true,
  },
  {
    number: '03',
    category: 'Deployment',
    title: 'Go Live and invite Team',
    desc: 'Activate your global workspace. Seamlessly onboard your entire team with role-specific access and start operating with total clarity.',
    card: <GoLiveCard />,
    reverse: false,
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-white py-32 overflow-hidden">
      <div className="max-w-[1152px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-24">
          <p className="text-[#7a826d] tracking-widest uppercase mb-2"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, letterSpacing: '1.4px' }}>
            Implementation
          </p>
          <h2 className="text-[#333] tracking-tight mb-4"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2, letterSpacing: '-1.2px' }}>
            How Bizak Works
          </h2>
          <p className="text-[rgba(102,102,102,0.8)] max-w-xl"
            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 18, lineHeight: 1.625 }}>
            A refined transition from legacy systems to a unified workspace.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Center vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-px hidden lg:block">
            <ImageWithFallback src={imgVerticalDivider} alt="" className="h-full w-px object-cover" />
          </div>

          <div className="space-y-40">
            {steps.map((step, i) => (
              <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 ${step.reverse ? 'lg:flex-row-reverse' : ''}`}>
                {/* Card side */}
                <div className="flex-1 flex justify-center">
                  {step.card}
                </div>

                {/* Text side */}
                <div className={`flex-1 ${step.reverse ? 'lg:pr-12 text-right' : 'lg:pl-12'} flex flex-col gap-4 ${step.reverse ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-4 ${step.reverse ? 'flex-row-reverse' : ''}`}>
                    <div className="bg-[#e8eae4] rounded-full size-10 flex items-center justify-center shadow-sm">
                      <span className="text-[#7a826d]" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16 }}>{step.number}</span>
                    </div>
                    <span className="text-[#7a826d] tracking-widest uppercase"
                      style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, letterSpacing: '1.2px' }}>{step.category}</span>
                  </div>
                  <h3 className="text-[#333] tracking-tight"
                    style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 30, lineHeight: 1.2, letterSpacing: '-0.75px' }}>
                    {step.title}
                  </h3>
                  <p className="text-[#666] max-w-sm"
                    style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: 1.625 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
