

import imgDavidRichardson from "../../assets/3e82d3d8b29c7a80834369bb24dc368dc5afc1de.png";



import { ImageWithFallback } from "./figma/ImageWithFallback";

export function TestimonialSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-[896px] mx-auto px-6 flex flex-col items-center gap-12">
        {/* Brand tag */}
        <div className="flex items-center justify-center">
          <div className="border-2 border-[#333] px-[18px] py-2">
            <span className="text-[#333] uppercase tracking-widest" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, letterSpacing: '1.4px' }}>APEX</span>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="text-[#333] text-center tracking-tight"
          style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(24px, 3.5vw, 48px)', lineHeight: 1.2, letterSpacing: '-1.2px' }}>
          "Bizak is the first ERP that actually understands the complexity of global operations without the typical bloat."
        </blockquote>

        {/* Author */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full overflow-hidden size-20 shadow-sm">
            <ImageWithFallback
              src={imgDavidRichardson}
              alt="David Richardson"
              className="size-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="text-[#333] uppercase tracking-widest"
              style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, letterSpacing: '2.2px' }}>
              David Richardson
            </div>
            <div className="text-[#666] uppercase tracking-widest"
              style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11, letterSpacing: '2.2px' }}>
              CEO, Apex Manufacturing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
