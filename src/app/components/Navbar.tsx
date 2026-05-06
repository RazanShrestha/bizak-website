import svgPaths from "../../imports/svg-eyvfmiiac4";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8eae4]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-[#333] flex items-center justify-center rounded size-8">
            <svg width="16" height="16" viewBox="0 0 18.4161 18.4217" fill="none">
              <path d={svgPaths.p10b1cb80} fill="white" />
            </svg>
          </div>
          <span className="text-[#333] tracking-tight" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18 }}>Bizak</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Product', 'Solutions', 'Pricing', 'Resources', 'Company'].map((item) => (
            <a key={item} href="#" className="text-[#666] hover:text-[#333] transition-colors" style={{ fontFamily: 'Inter', fontSize: 14 }}>
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <a href="#" className="text-[#333] hover:text-[#7a826d] transition-colors" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>
            Sign in
          </a>
          <a
            href="https://system.bizakerp.com/account/self-register"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#7a826d] text-white px-5 py-2 rounded-md hover:bg-[#666e5f] transition-colors shadow-sm cursor-pointer"
            style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14 }}
          >
            Start free trial
          </a>
        </div>
      </div>
    </nav>
  );
}
