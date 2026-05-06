import svgPaths from "../../imports/svg-eyvfmiiac4";

function ROICard() {
  return (
    <div className="absolute top-0 left-0 bg-[#252822] rounded-xl overflow-hidden"
      style={{ right: '33%', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="relative p-8 pb-36">
        {/* Bar chart decoration */}
        <div className="absolute bottom-8 right-8 flex items-end gap-2 h-32">
          {[38, 58, 83, 102, 128].map((h, i) => (
            <div key={i} className="w-4 rounded-sm"
              style={{
                height: h,
                background: i === 4 ? '#7a826d' : `rgba(122,130,109,${0.1 + i * 0.07})`
              }}></div>
          ))}
        </div>

        {/* Icon */}
        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md size-10 flex items-center justify-center mb-16">
          <svg width="19" height="11" viewBox="0 0 18.9999 10.9999" fill="none">
            <path d={svgPaths.p23b42200} fill="#7A826D" />
          </svg>
        </div>

        <h3 className="text-white mb-4"
          style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24, lineHeight: 1.33 }}>
          Proven ROI Growth
        </h3>
        <p className="text-white/40 max-w-sm"
          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: 1.625 }}>
          Experience an average of 25% reduction in operational overhead within the first 6 months.
        </p>

        {/* Stats */}
        <div className="flex gap-12 mt-8">
          <div>
            <div className="text-[#7a826d]" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 30 }}>25%</div>
            <div className="text-white/30 uppercase tracking-wide" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, letterSpacing: '1px' }}>Cost Saved</div>
          </div>
          <div>
            <div className="text-white" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 30 }}>1.4x</div>
            <div className="text-white/30 uppercase tracking-wide" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, letterSpacing: '1px' }}>Output Yield</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductivityCard() {
  return (
    <div className="absolute top-0 bg-[#252822] rounded-xl p-8"
      style={{ left: '67%', right: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Icon */}
      <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md size-10 flex items-center justify-center mb-4">
        <svg width="14" height="19" viewBox="0 0 14 19" fill="none">
          <path d={svgPaths.pfc1d700} fill="#7A826D" />
        </svg>
      </div>

      <h3 className="text-white mb-3"
        style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24, lineHeight: 1.33 }}>
        Productivity Tools
      </h3>
      <p className="text-white/40 mb-6"
        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>
        Integrated task management that uses AI to prioritize high-value operations over busy work.
      </p>

      {/* Task list */}
      <div className="space-y-4">
        {[
          { name: 'Task Automation', status: '92% Done', active: true },
          { name: 'Resource Sync', dot: true, active: true },
          { name: 'Batch Exporting', status: 'Waiting...', faded: true },
        ].map((task, i) => (
          <div key={i} className={`bg-[#1a1c18] rounded-lg flex items-center justify-between p-4 ${task.faded ? 'opacity-50' : ''}`}
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-white/70" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12 }}>{task.name}</span>
            {task.dot ? (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#7a826d] rounded-full"></div>
                <span className="text-[#7a826d] uppercase" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>Active</span>
              </div>
            ) : (
              <span className={`${task.faded ? 'text-white/30' : 'text-[#7a826d]'} uppercase`}
                style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>{task.status}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SmartDocsCard() {
  return (
    <div className="absolute bg-[#252822] rounded-xl p-8"
      style={{ top: '63%', left: 0, right: '49%', border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Icon */}
      <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md size-10 flex items-center justify-center mb-4">
        <svg width="15" height="19" viewBox="0 0 14.9999 18.9999" fill="none">
          <path d={svgPaths.p713f7c0} fill="#7A826D" />
        </svg>
      </div>

      <h3 className="text-white mb-3"
        style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, lineHeight: 1.4 }}>
        Smart Documents
      </h3>
      <p className="text-white/40 mb-4"
        style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>
        Bank-grade encryption and automated indexing for instant retrieval across departments.
      </p>

      {/* User avatars */}
      <div className="flex items-center">
        {[
          { bg: 'bg-white/10' },
          { bg: 'bg-white/15' },
          { bg: 'bg-white/20' },
          { bg: 'bg-[#7a826d]', text: '+12' },
        ].map((av, i) => (
          <div key={i} className={`size-9 rounded-full ${av.bg} flex items-center justify-center border-2 border-[#252822] ${i > 0 ? '-ml-3' : ''}`}>
            {av.text && <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>{av.text}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SOCCard() {
  return (
    <div className="absolute bg-[#252822] rounded-xl overflow-hidden"
      style={{ top: '63%', left: '51%', right: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="relative flex flex-col items-center justify-center p-8 min-h-[250px]">
        {/* Shield icon */}
        <div className="bg-[rgba(122,130,109,0.1)] border border-[rgba(122,130,109,0.2)] rounded-full size-16 flex items-center justify-center mb-4">
          <svg width="15" height="19" viewBox="0 0 14.9999 18.9422" fill="none">
            <path d={svgPaths.p3919a3dc} fill="#7A826D" />
          </svg>
        </div>

        <h3 className="text-white text-center mb-3"
          style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20 }}>
          SOC-2 Certified
        </h3>
        <p className="text-white/40 text-center max-w-xs"
          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>
          Meeting the highest standards of enterprise security and data privacy protocols globally.
        </p>
      </div>
    </div>
  );
}

export function EnterpriseSection() {
  return (
    <section className="bg-[#1a1c18] py-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-[#7a826d] tracking-widest uppercase mb-2"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, letterSpacing: '1.4px' }}>
            Enterprise-Grade Benefits
          </p>
          <h2 className="text-white tracking-tight mb-4 max-w-3xl"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2, letterSpacing: '-1.2px' }}>
            Built for scale, speed, and absolute reliability.
          </h2>
          <p className="text-white/50 max-w-xl"
            style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 18, lineHeight: 1.625 }}>
            Unlock the potential of your operations with tools designed for the mid-market leaders.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ROI Growth */}
          <div className="bg-[#252822] rounded-xl p-8 overflow-hidden relative"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Bar chart decoration */}
            <div className="absolute bottom-8 right-8 flex items-end gap-2 h-32">
              {[38, 58, 83, 102, 128].map((h, i) => (
                <div key={i} className="w-4 rounded-sm"
                  style={{
                    height: h,
                    background: i === 4 ? '#7a826d' : `rgba(122,130,109,${0.1 + i * 0.07})`
                  }}></div>
              ))}
            </div>
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md size-10 flex items-center justify-center mb-4">
              <svg width="19" height="11" viewBox="0 0 18.9999 10.9999" fill="none">
                <path d={svgPaths.p23b42200} fill="#7A826D" />
              </svg>
            </div>
            <h3 className="text-white mb-3" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24 }}>Proven ROI Growth</h3>
            <p className="text-white/40 max-w-sm mb-6" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: 1.625 }}>
              Experience an average of 25% reduction in operational overhead within the first 6 months.
            </p>
            <div className="flex gap-12">
              <div>
                <div className="text-[#7a826d]" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 30 }}>25%</div>
                <div className="text-white/30 uppercase tracking-wide" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>Cost Saved</div>
              </div>
              <div>
                <div className="text-white" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 30 }}>1.4x</div>
                <div className="text-white/30 uppercase tracking-wide" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>Output Yield</div>
              </div>
            </div>
          </div>

          {/* Productivity Tools */}
          <div className="bg-[#252822] rounded-xl p-8"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md size-10 flex items-center justify-center mb-4">
              <svg width="14" height="19" viewBox="0 0 14 19" fill="none">
                <path d={svgPaths.pfc1d700} fill="#7A826D" />
              </svg>
            </div>
            <h3 className="text-white mb-3" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24 }}>Productivity Tools</h3>
            <p className="text-white/40 mb-6" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>
              Integrated task management that uses AI to prioritize high-value operations over busy work.
            </p>
            <div className="space-y-4">
              {[
                { name: 'Task Automation', badge: '92% Done', color: 'text-[#7a826d]' },
                { name: 'Resource Sync', dot: true },
                { name: 'Batch Exporting', badge: 'Waiting...', faded: true },
              ].map((task, i) => (
                <div key={i} className={`bg-[#1a1c18] rounded-lg flex items-center justify-between p-4 ${task.faded ? 'opacity-50' : ''}`}
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-white/70" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12 }}>{task.name}</span>
                  {task.dot ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[#7a826d] rounded-full"></div>
                      <span className="text-[#7a826d] uppercase" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>Active</span>
                    </div>
                  ) : (
                    <span className={`${task.faded ? 'text-white/30' : 'text-[#7a826d]'} uppercase`}
                      style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>{task.badge}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Smart Documents */}
          <div className="bg-[#252822] rounded-xl p-8"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md size-10 flex items-center justify-center mb-4">
              <svg width="15" height="19" viewBox="0 0 14.9999 18.9999" fill="none">
                <path d={svgPaths.p713f7c0} fill="#7A826D" />
              </svg>
            </div>
            <h3 className="text-white mb-3" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20 }}>Smart Documents</h3>
            <p className="text-white/40 mb-6" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>
              Bank-grade encryption and automated indexing for instant retrieval across departments.
            </p>
            <div className="flex items-center">
              {[
                { bg: 'bg-white/10' },
                { bg: 'bg-white/15' },
                { bg: 'bg-white/20' },
                { bg: 'bg-[#7a826d]', text: '+12' },
              ].map((av, i) => (
                <div key={i} className={`size-9 rounded-full ${av.bg} flex items-center justify-center border-2 border-[#252822] ${i > 0 ? '-ml-3' : ''}`}>
                  {av.text && <span className="text-white" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10 }}>{av.text}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* SOC-2 */}
          <div className="bg-[#252822] rounded-xl p-8 flex flex-col items-center justify-center text-center"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="bg-[rgba(122,130,109,0.1)] border border-[rgba(122,130,109,0.2)] rounded-full size-16 flex items-center justify-center mb-4">
              <svg width="15" height="19" viewBox="0 0 14.9999 18.9422" fill="none">
                <path d={svgPaths.p3919a3dc} fill="#7A826D" />
              </svg>
            </div>
            <h3 className="text-white mb-3" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20 }}>SOC-2 Certified</h3>
            <p className="text-white/40 max-w-xs" style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: 1.625 }}>
              Meeting the highest standards of enterprise security and data privacy protocols globally.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}