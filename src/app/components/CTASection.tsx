import { Link } from "react-router";

export function CTASection() {
  return (
    <section className="bg-[#121212] py-32 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-[-80px] top-[145px] w-96 h-96 bg-[rgba(122,130,109,0.1)] blur-[50px] rounded-full"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(ellipse at center bottom, rgba(122,130,109,0.08) 0%, rgba(122,130,109,0) 70%)"
        }}></div>
      </div>

      <div className="max-w-[896px] mx-auto px-6 flex flex-col items-center text-center relative z-10">
        {/* Main headline */}
        <h2 className="text-white tracking-tight mb-6"
          style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2, letterSpacing: '-1.2px' }}>
          Experience the future of business operations.
        </h2>

        {/* Subtitle */}
        <p className="text-white/50 max-w-2xl mb-10"
          style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.625 }}>
          Join 50,000+ companies scaling with Bizak. Start your 14-day free trial today.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <a href="https://system.bizakerp.com/account/self-register" target="_blank" rel="noopener noreferrer">
            <button
              className="bg-[#7a826d] text-white px-10 py-5 rounded-md hover:bg-[#666e5f] transition-colors shadow-xl"
              style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18 }}>
              Start free trial
            </button>
          </a>
          <Link to="/contact">
            <button
              className="text-white px-10 py-5 rounded-md border-2 border-white/20 hover:border-white/40 transition-colors"
              style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18 }}>
              Book a demo
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
