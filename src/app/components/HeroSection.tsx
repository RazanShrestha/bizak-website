import { Link } from "react-router";

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

function GlobalLedgerPanel() {
  return (
    <div className="absolute -left-20 top-20 w-72 glass-panel p-5 rounded-2xl shadow-xl animate-float border border-white/40 z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-[#7a826d] tracking-widest uppercase">
          Global Ledger Syncing
        </span>
        <Icon name="sync" className="text-[#7a826d] !text-sm" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div className="text-xs font-bold text-[#333]">LDN</div>
          <div className="text-[8px] text-[#666]">Node 01</div>
        </div>
        <div className="flex-1 h-1 bg-[#e8eae4] rounded-full relative overflow-hidden">
          <div className="h-full w-1/3 bg-[#7a826d] animate-sync-slide rounded-full"></div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-[#333]">NYC</div>
          <div className="text-[8px] text-[#666]">Node 04</div>
        </div>
      </div>
      <div className="text-[10px] text-[#666] flex justify-between">
        <span>TX_ID: 8829x-BZ</span>
        <span className="text-[#7a826d] font-bold">LIVE</span>
      </div>
    </div>
  );
}

function AutomationPanel() {
  return (
    <div className="absolute -right-24 bottom-10 w-80 glass-panel p-5 rounded-2xl shadow-xl animate-float-delayed border border-white/40 z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
          <Icon name="bolt" className="!text-lg" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-amber-600 tracking-widest uppercase">
            Automation Triggered
          </div>
          <div className="text-xs font-bold text-[#333]">Low Stock Alert: SK-402</div>
        </div>
      </div>
      <div className="bg-white/50 border border-[#e8eae4]/30 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#666]">Action</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#7a826d] text-white rounded font-bold uppercase">
            Generating RFQ
          </span>
        </div>
        <div className="text-[11px] font-medium text-[#333]">
          Drafting Purchase Order for Apex Logistics...
        </div>
      </div>
    </div>
  );
}

function FinancialHealthPanel() {
  return (
    <div className="absolute left-1/2 -bottom-24 -translate-x-1/2 w-64 glass-dark p-5 rounded-2xl shadow-premium animate-float border border-white/10 z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">
          Financial Health
        </span>
        <div className="w-2 h-2 rounded-full bg-[#7a826d] animate-pulse"></div>
      </div>
      <div className="flex items-end justify-between mb-3">
        <div className="text-2xl font-bold text-white">
          98.2<span className="text-[#7a826d] font-normal">%</span>
        </div>
        <div className="text-[10px] text-white/40 mb-1">STABLE / OPTIMAL</div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7a826d] rounded-full"
          style={{ width: "98%", boxShadow: "0 0 10px rgba(122,130,109,0.8)" }}
        ></div>
      </div>
    </div>
  );
}

function PerformanceMetricsPanel() {
  return (
    <div className="absolute left-[380px] -top-10 w-80 glass-panel p-6 rounded-2xl shadow-premium border border-white/60 z-10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#333]/60">
          Performance Metrics
        </h3>
        <span className="px-2 py-0.5 bg-[#7a826d] text-white text-[9px] font-bold rounded">
          P&amp;L
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xl font-bold text-[#333]">$242k</div>
          <div className="text-[9px] font-bold text-[#333]/30 uppercase tracking-widest">
            Gross Revenue
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#333]">$102k</div>
          <div className="text-[9px] font-bold text-[#333]/30 uppercase tracking-widest">
            Net Margin
          </div>
        </div>
      </div>
      <div className="absolute -bottom-[60px] left-1/2 -translate-x-1/2 w-px h-[60px] bg-gradient-to-t from-[#7a826d] to-transparent opacity-40"></div>
    </div>
  );
}

function LiquidAssetsPanel() {
  return (
    <div className="absolute -right-4 top-20 w-56 glass-dark p-5 rounded-2xl shadow-2xl border border-white/10 text-white z-10">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#7a826d] mb-4">
        <Icon name="account_balance_wallet" className="!text-lg" />
      </div>
      <div className="text-2xl font-bold mb-1">$44.2K</div>
      <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">
        Liquid Assets
      </div>
      <div className="bg-[#7a826d]/20 text-[#7a826d] text-[9px] font-bold py-1.5 px-3 rounded-full text-center border border-[#7a826d]/30">
        MARKET STABLE
      </div>
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="relative max-w-[1400px] mx-auto pb-40 px-6">
      <div className="relative mx-auto w-full max-w-6xl pointer-events-none">
        {/* Main glass card */}
        <div className="glass-panel rounded-3xl p-1 shadow-premium overflow-hidden border border-white/80">
          <div className="flex h-[560px]">
            {/* Sidebar */}
            <div className="w-20 bg-[#121212] border-r border-white/5 flex flex-col items-center py-6 gap-6 rounded-l-3xl">
              <div className="w-10 h-10 bg-[#7a826d]/20 rounded-lg flex items-center justify-center relative">
                <Icon name="grid_view" className="text-[#7a826d] !text-xl" />
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-[#7a826d] rounded-full border-2 border-[#121212]"></div>
              </div>
              <div className="w-8 h-8 opacity-40 flex items-center justify-center">
                <Icon name="payments" className="text-white !text-xl" />
              </div>
              <div className="w-8 h-8 opacity-40 flex items-center justify-center relative">
                <Icon name="inventory_2" className="text-white !text-xl" />
                <div className="hotspot-ring -top-1 -right-1"></div>
                <div className="hotspot-dot -top-1 -right-1"></div>
              </div>
              <div className="w-8 h-8 opacity-40 flex items-center justify-center">
                <Icon name="group" className="text-white !text-xl" />
              </div>
              <div className="w-8 h-8 opacity-40 flex items-center justify-center">
                <Icon name="analytics" className="text-white !text-xl" />
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 bg-[#F8F9F7]/80 p-8 overflow-hidden">
              {/* Top bar */}
              <div className="flex justify-between items-center mb-10">
                <div className="h-8 w-48 bg-[#333]/5 rounded-lg"></div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 bg-[#333]/5 rounded-full"></div>
                  <div className="h-8 w-24 bg-[#333]/5 rounded-lg"></div>
                </div>
              </div>

              {/* Revenue chart card */}
              <div className="relative bg-white rounded-2xl p-8 border border-[#e8eae4]/30 shadow-sm h-72">
                <div className="flex justify-between mb-8">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-[#333]/5 rounded"></div>
                    <div className="text-3xl font-bold text-[#333]">$242,250.00</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-6 bg-[#7a826d]/10 rounded"></div>
                    <div className="w-12 h-6 bg-[#333]/5 rounded"></div>
                  </div>
                </div>
                {/* Chart */}
                <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden rounded-b-2xl">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                    <path
                      d="M0 150 C 150 140, 200 60, 400 100 S 650 20, 1000 80 V 200 H 0 Z"
                      fill="rgba(122, 130, 109, 0.15)"
                    />
                    <path
                      d="M0 150 C 150 140, 200 60, 400 100 S 650 20, 1000 80"
                      fill="none"
                      stroke="#7A826D"
                      strokeLinecap="round"
                      strokeWidth="4"
                    />
                    <circle
                      className="animate-pulse"
                      cx="400"
                      cy="100"
                      fill="#7A826D"
                      r="6"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                {/* Chart hotspot */}
                <div className="absolute left-[400px] top-[140px]">
                  <div className="hotspot-ring"></div>
                  <div className="hotspot-dot"></div>
                </div>
              </div>

              {/* Bottom mini cards */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="h-32 bg-white rounded-2xl border border-[#e8eae4]/30 p-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-[#333]/5 rounded"></div>
                    <div className="h-6 w-32 bg-[#333]/10 rounded"></div>
                  </div>
                  <div className="w-12 h-12 donut-chart-mini opacity-20 flex-shrink-0"></div>
                </div>
                <div className="h-32 bg-white rounded-2xl border border-[#e8eae4]/30 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-3 w-16 bg-[#333]/5 rounded"></div>
                    <div className="h-3 w-8 bg-[#7a826d]/20 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-[#333]/5 rounded"></div>
                    <div className="h-2 w-2/3 bg-[#333]/5 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating panels */}
        <GlobalLedgerPanel />
        <AutomationPanel />
        <FinancialHealthPanel />
        <PerformanceMetricsPanel />
        <LiquidAssetsPanel />
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden bg-[#FBFBFB]">
      {/* Subtle mesh background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 10%, hsla(78,25%,92%,0.8) 0, transparent 50%), radial-gradient(at 80% 5%, hsla(75,40%,95%,0.6) 0, transparent 50%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e8eae4] bg-white text-[#333] text-xs font-medium tracking-tight shadow-sm">
            <span className="font-bold text-[#7a826d]">NEW</span>
            <span className="w-1 h-1 bg-[#333]/30 rounded-full inline-block"></span>
            <span>All-in-one business management platform</span>
            <a
              href="#"
              className="flex items-center gap-1 text-[#7a826d] font-semibold ml-2 hover:opacity-80 transition-opacity"
            >
              Learn more
              <Icon name="arrow_forward" className="!text-sm" />
            </a>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="font-bold text-[#333] leading-[1.1] tracking-tight mb-8 max-w-4xl mx-auto"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            letterSpacing: "-1.8px",
          }}
        >
          The Operating System for Modern Business
        </h1>

        {/* Subtitle */}
        <p
          className="text-[#666] mb-10 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(16px, 2vw, 20px)" }}
        >
          A comprehensive ERP for SMEs and mid-market companies built for scale, automation, and
          total visibility.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          <a
            href="https://system.bizakerp.com/account/self-register"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="bg-[#7a826d] text-white text-base font-bold px-8 py-4 rounded-lg shadow-sm hover:bg-[#616857] transition-all"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Start free trial
            </button>
          </a>
          <Link to="/contact">
            <button
              className="bg-white border border-[#e8eae4] text-[#333] text-base font-bold px-8 py-4 rounded-lg hover:bg-[#F8F9F7] transition-all shadow-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Book a demo
            </button>
          </Link>
        </div>
      </div>

      {/* Dashboard */}
      <HeroDashboard />

      {/* Trusted companies */}
      <div className="max-w-7xl mx-auto px-6 mb-24 opacity-40">
        <p
          className="text-center text-xs font-bold text-[#333]/40 uppercase mb-12"
          style={{ letterSpacing: "0.2em" }}
        >
          Trusted by 5,000+ scaling companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 grayscale">
          {[128, 96, 144, 112, 128].map((w, i) => (
            <div key={i} className="h-8 bg-[#333]/10 rounded" style={{ width: w }}></div>
          ))}
        </div>
      </div>
    </section>
  );
}
