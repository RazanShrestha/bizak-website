import svgPaths from "./svg-eyvfmiiac4";
import imgVerticalDivider from "figma:asset/f2e380d17eac162241d624859384640c4ef342fe.png";
import imgDavidRichardson from "figma:asset/3e82d3d8b29c7a80834369bb24dc368dc5afc1de.png";

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[58px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[48px] text-center tracking-[-1.2px] w-[738.41px]">
        <p className="leading-[57.6px] whitespace-pre-wrap">Everything you need in one place</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[18px] text-center w-[502.56px]">
        <p className="leading-[29.25px] whitespace-pre-wrap">The unified infrastructure for your entire business lifecycle.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[14px] text-center tracking-[1.4px] uppercase w-[128.73px]">
        <p className="leading-[21px] whitespace-pre-wrap">Core Modules</p>
      </div>
      <Heading1 />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[18.808px] relative shrink-0 w-[17px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.9999 18.8076">
        <g id="Container">
          <path d={svgPaths.p8158820} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[32px] p-px rounded-[4px] size-[40px] top-[32px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container4 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[96px]" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[18px] w-[73.36px]">
        <p className="leading-[28px] whitespace-pre-wrap">E-Billing</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[0.625px] right-[32px] top-[134.88px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-[287.98px] whitespace-pre-wrap">
        <p className="mb-0">Automated tax compliance, electronic</p>
        <p>signatures, and localized invoice templates.</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[16px] right-[16px] top-[16px]" data-name="Container">
      <div className="bg-[#e8eae4] h-[8px] rounded-[4px] shrink-0 w-[64px]" data-name="Background" />
      <div className="bg-[rgba(122,130,109,0.1)] h-[8px] rounded-[4px] shrink-0 w-[32px]" data-name="Overlay" />
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="absolute bg-white border border-[#e8eae4] border-solid h-[66px] left-[32px] right-[32px] rounded-[4px] top-[205.5px]" data-name="Background+Border">
      <Container6 />
      <div className="absolute bg-[#f8f9f7] h-[6px] left-[16px] right-[16px] rounded-[4px] top-[32px]" data-name="Background" />
      <div className="absolute bg-[#f8f9f7] h-[6px] left-[calc(5.26%-0.89px)] right-[calc(35.09%-0.3px)] rounded-[4px] top-[42px]" data-name="Background" />
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-[#f8f9f7] border border-[#e8eae4] border-solid h-[321.5px] left-0 right-[842.67px] rounded-[8px] top-0" data-name="Background+Border">
      <BackgroundBorderShadow />
      <Heading3 />
      <Container5 />
      <BackgroundBorder1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[11px] relative shrink-0 w-[19px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9999 10.9999">
        <g id="Container">
          <path d={svgPaths.p23b42200} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorderShadow1() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[32px] p-px rounded-[4px] size-[40px] top-[32px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container7 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[96px]" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[18px] w-[141.67px]">
        <p className="leading-[28px] whitespace-pre-wrap">Advanced Sales</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[0.625px] right-[32px] top-[134.88px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-[272.83px] whitespace-pre-wrap">
        <p className="mb-0">CRM-integrated pipeline management,</p>
        <p>automated quotes, and sales forecasting.</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-end justify-center relative size-full">
        <div className="bg-[#e8eae4] flex-[1_0_0] h-[24px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Background" />
        <div className="bg-[#7a826d] flex-[1_0_0] h-[36px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Background" />
        <div className="bg-[#e8eae4] flex-[1_0_0] h-[16px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Background" />
        <div className="bg-[#7a826d] flex-[1_0_0] h-full min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Background" />
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[32px] p-[17px] right-[32px] rounded-[4px] top-[205.5px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Container9 />
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="absolute bg-[#f8f9f7] border border-[#e8eae4] border-solid h-[321.5px] left-[421.33px] right-[421.34px] rounded-[8px] top-0" data-name="Background+Border">
      <BackgroundBorderShadow1 />
      <Heading4 />
      <Container8 />
      <BackgroundBorder3 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[19.308px] relative shrink-0 w-[19.527px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5268 19.3076">
        <g id="Container">
          <path d={svgPaths.p3d3c400} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorderShadow2() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[32px] p-px rounded-[4px] size-[40px] top-[32px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container10 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[96px]" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[18px] w-[217.38px]">
        <p className="leading-[28px] whitespace-pre-wrap">{`Purchase & Procurement`}</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[0.625px] right-[32px] top-[134.88px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-[298.92px] whitespace-pre-wrap">
        <p className="mb-0">RFQ automation, landed cost calculation, and</p>
        <p>vendor performance analytics.</p>
      </div>
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[4px] self-stretch" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center p-[13px] relative size-full">
          <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(51,51,51,0.4)] text-center tracking-[-0.25px] uppercase w-[38.38px]">
            <p className="leading-[15px] whitespace-pre-wrap">RFQ #01</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder6() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[4px] self-stretch" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center p-[13px] relative size-full">
          <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(51,51,51,0.4)] text-center tracking-[-0.25px] uppercase w-[40.36px]">
            <p className="leading-[15px] whitespace-pre-wrap">RFQ #02</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-start justify-center left-[32px] right-[32px] top-[205.5px]" data-name="Container">
      <BackgroundBorder5 />
      <BackgroundBorder6 />
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="absolute bg-[#f8f9f7] border border-[#e8eae4] border-solid h-[321.5px] left-[842.66px] right-0 rounded-[8px] top-0" data-name="Background+Border">
      <BackgroundBorderShadow2 />
      <Heading5 />
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 size-[19px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9999 18.9999">
        <g id="Container">
          <path d={svgPaths.p18aed800} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorderShadow3() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[32px] p-px rounded-[4px] size-[40px] top-[32px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container13 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[96px]" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[18px] w-[153.48px]">
        <p className="leading-[28px] whitespace-pre-wrap">Inventory Control</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[0.625px] right-[32px] top-[134.88px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-[280.17px] whitespace-pre-wrap">
        <p className="mb-0">Real-time stock tracking, multi-warehouse</p>
        <p>management, and barcode integration.</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[17.5px] relative shrink-0 w-[21.5px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.5 17.5">
        <g id="Container">
          <path d={svgPaths.p37735b40} fill="var(--fill-0, #E8EAE4)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder8() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[32px] p-[17px] right-[32px] rounded-[4px] top-[205.5px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Container15 />
    </div>
  );
}

function BackgroundBorder7() {
  return (
    <div className="absolute bg-[#f8f9f7] border border-[#e8eae4] border-solid h-[307.5px] left-0 right-[842.67px] rounded-[8px] top-[353.5px]" data-name="Background+Border">
      <BackgroundBorderShadow3 />
      <Heading6 />
      <Container14 />
      <BackgroundBorder8 />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[18.942px] relative shrink-0 w-[18.461px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4614 18.9422">
        <g id="Container">
          <path d={svgPaths.pd19dfc0} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorderShadow4() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[32px] p-px rounded-[4px] size-[40px] top-[32px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container16 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[96px]" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[18px] w-[174.44px]">
        <p className="leading-[28px] whitespace-pre-wrap">{`Finance & Accounts`}</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pb-[0.625px] right-[32px] top-[134.88px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-[299.59px] whitespace-pre-wrap">
        <p className="mb-0">Journal entries, bank reconciliation, and real-</p>
        <p>{`time P&L reporting.`}</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Liberation_Mono:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(51,51,51,0.6)] w-[30.02px]">
        <p className="leading-[15px] whitespace-pre-wrap">Debit</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Liberation_Mono:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[10px] w-[60.02px]">
        <p className="leading-[15px] whitespace-pre-wrap">$12,400.00</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container19 />
        <Container20 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Liberation_Mono:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(51,51,51,0.6)] w-[36.02px]">
        <p className="leading-[15px] whitespace-pre-wrap">Credit</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Liberation_Mono:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(51,51,51,0.4)] w-[60.02px]">
        <p className="leading-[15px] whitespace-pre-wrap">$12,400.00</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container22 />
        <Container23 />
      </div>
    </div>
  );
}

function BackgroundBorder10() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[4px] items-start left-[32px] p-[17px] right-[32px] rounded-[4px] top-[205.5px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Container18 />
      <Container21 />
    </div>
  );
}

function BackgroundBorder9() {
  return (
    <div className="absolute bg-[#f8f9f7] border border-[#e8eae4] border-solid h-[307.5px] left-[421.33px] right-[421.34px] rounded-[8px] top-[353.5px]" data-name="Background+Border">
      <BackgroundBorderShadow4 />
      <Heading7 />
      <Container17 />
      <BackgroundBorder10 />
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 size-[19px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9999 18.9999">
        <g id="Container">
          <path d={svgPaths.p498c600} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0" data-name="Margin">
      <Container24 />
    </div>
  );
}

function Heading8() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white w-[105.94px]">
        <p className="leading-[28px] whitespace-pre-wrap">Need more?</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-center opacity-60 relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[291.19px]">
        <p className="leading-[20px] whitespace-pre-wrap">Explore 20+ additional specialized modules.</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <Container25 />
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#333] content-stretch flex flex-col items-center justify-center left-[842.66px] px-[32px] py-[105.75px] right-0 rounded-[8px] top-[353.5px]" data-name="Background">
      <Margin />
      <Heading8 />
      <Margin1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[661px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder />
      <BackgroundBorder2 />
      <BackgroundBorder4 />
      <BackgroundBorder7 />
      <BackgroundBorder9 />
      <Background />
    </div>
  );
}

function Container() {
  return (
    <div className="max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[48px] items-start max-w-[inherit] px-[24px] relative w-full">
        <Container1 />
        <Container3 />
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 py-[96px] right-0 top-[1655px]" data-name="Section">
      <Container />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[24px] w-[21.306px]">
        <p className="leading-[24px] whitespace-pre-wrap">grid_view</p>
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="-translate-x-1/2 absolute bg-[rgba(122,130,109,0.2)] content-stretch flex h-[36.146px] items-center justify-center left-[calc(50%-1.92px)] pl-[6.586px] pr-[7.45px] rounded-[4px] top-[21.06px] w-[35.462px]" data-name="Overlay">
      <Container28 />
      <div className="absolute bg-[#7a826d] h-[10.821px] right-[-3.78px] rounded-[9999px] top-[-4.22px] w-[10.673px]" data-name="Background+Border">
        <div aria-hidden="true" className="absolute border-2 border-[#121212] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[21.439px]">
        <p className="leading-[24px] whitespace-pre-wrap">payments</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex h-[29.341px] items-center justify-center left-[calc(50%-5.65px)] opacity-40 top-[78.86px] w-[28.559px]" data-name="Container">
      <Container30 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[21.573px]">
        <p className="leading-[24px] whitespace-pre-wrap">inventory_2</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex h-[29.724px] items-center justify-center left-[calc(50%-8.95px)] opacity-40 top-[130.23px] w-[28.754px]" data-name="Container">
      <Container32 />
      <div className="absolute bg-[rgba(122,130,109,0.4)] h-[14.849px] right-[-3.83px] rounded-[9999px] top-[-3.92px] w-[14.402px]" data-name="Overlay" />
      <div className="absolute bg-[#7a826d] h-[7.414px] right-[-3.83px] rounded-[9999px] top-[-4px] w-[7.211px]" data-name="Background+Border+Shadow">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_25px_0px_rgba(122,130,109,0.5)]" />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[21.719px]">
        <p className="leading-[24px] whitespace-pre-wrap">group</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex h-[30.117px] items-center justify-center left-[calc(50%-12.29px)] opacity-40 top-[182.29px] w-[28.931px]" data-name="Container">
      <Container34 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[21.854px]">
        <p className="leading-[24px] whitespace-pre-wrap">analytics</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex h-[30.532px] items-center justify-center left-[calc(50%-15.68px)] opacity-40 top-[235.04px] w-[29.118px]" data-name="Container">
      <Container36 />
    </div>
  );
}

function BackgroundVerticalBorder() {
  return (
    <div className="bg-[#121212] h-full mr-[-0.02px] relative shrink-0 w-[70.739px]" data-name="Background+VerticalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.05)] border-r border-solid inset-0 pointer-events-none" />
      <Overlay />
      <Container29 />
      <Container31 />
      <Container33 />
      <Container35 />
    </div>
  );
}

function Container38() {
  return (
    <div className="-translate-y-1/2 absolute h-[31.273px] left-[824.62px] top-[calc(50%-16.45px)] w-[151.536px]" data-name="Container">
      <div className="absolute bg-[rgba(51,51,51,0.05)] h-[31.273px] left-0 rounded-[9999px] top-0 w-[33.34px]" data-name="Overlay" />
      <div className="absolute bg-[rgba(51,51,51,0.05)] h-[31.422px] left-[50.06px] rounded-[6px] top-[-1.06px] w-[101.461px]" data-name="Overlay" />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute h-[29.13px] left-[26.93px] right-[31.91px] top-[28.19px]" data-name="Container">
      <div className="-translate-y-1/2 absolute bg-[rgba(51,51,51,0.05)] h-[29.13px] left-0 rounded-[6px] top-1/2 w-[175.157px]" data-name="Overlay" />
      <Container38 />
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute bottom-0 left-0 top-0 w-[179.969px]" data-name="Container">
      <div className="absolute bg-[rgba(51,51,51,0.05)] h-[14.946px] left-0 rounded-[4px] top-0 w-[118.195px]" data-name="Overlay" />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Bold',sans-serif] h-[36px] justify-center leading-[0] left-[-0.97px] not-italic text-[#333] text-[30px] top-[35.6px] w-[180.393px]">
        <p className="leading-[36px] whitespace-pre-wrap">$242,250.00</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute bottom-[6.21px] left-[812.65px] top-[-10.09px] w-[110.72px]" data-name="Container">
      <div className="absolute bg-[rgba(122,130,109,0.1)] h-[24.094px] left-0 rounded-[4px] top-0 w-[50.845px]" data-name="Overlay" />
      <div className="absolute bg-[rgba(51,51,51,0.05)] h-[24.21px] left-[59.35px] rounded-[4px] top-[-0.73px] w-[51.363px]" data-name="Overlay" />
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[52.557px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container40 />
        <Container41 />
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[155.191px] overflow-clip relative shrink-0 w-full" data-name="SVG">
      <div className="absolute inset-[31.43%_0_0_0]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 998.794 106.412">
          <path d={svgPaths.p2f46c000} fill="var(--fill-0, #7A826D)" fillOpacity="0.15" id="Vector" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 left-0 right-0 top-[31.43%]" data-name="Vector">
        <div className="absolute inset-[-2.62%_-0.18%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1002.34 71.1641">
            <path d={svgPaths.p72ce200} id="Vector" stroke="var(--stroke-0, #7A826D)" strokeLinecap="round" strokeWidth="3.5495" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[47%_59.4%_47%_39.4%]" data-name="Vector">
        <div className="absolute inset-[-9.53%_-7.4%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.7603 11.0862">
            <g id="Vector">
              <path d={svgPaths.p33dd2dc0} fill="var(--fill-0, #7A826D)" />
              <path d={svgPaths.p33dd2dc0} stroke="var(--stroke-0, white)" strokeWidth="1.77475" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute bottom-[1.17px] h-[155.191px] left-[-5.71px] right-[-8.06px] rounded-bl-[12px] rounded-br-[12px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Svg />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute left-[374.43px] size-0 top-[130.93px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <div className="absolute bg-[rgba(122,130,109,0.4)] h-[15.812px] left-0 rounded-[9999px] top-0 w-[15.788px]" data-name="Overlay" />
        <div className="absolute bg-[#7a826d] border border-solid border-white h-[7.901px] left-0 rounded-[9999px] shadow-[0px_0px_25px_0px_rgba(122,130,109,0.5)] top-0 w-[7.884px]" data-name="Background+Border+Shadow" />
      </div>
    </div>
  );
}

function BackgroundBorderShadow5() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[275.147px] items-start left-[23.27px] pb-[192.444px] pl-[28.364px] pr-[33.23px] pt-[30.145px] right-[26.9px] rounded-[12px] top-[93.96px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[rgba(232,234,228,0.3)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container39 />
      <Container42 />
      <Container43 />
    </div>
  );
}

function Container45() {
  return (
    <div className="-translate-y-1/2 absolute h-[44.579px] left-[20.29px] top-[calc(50%-0.09px)] w-[122.63px]" data-name="Container">
      <div className="absolute bg-[rgba(51,51,51,0.05)] h-[12.11px] left-0 rounded-[4px] top-0 w-[76.318px]" data-name="Overlay" />
      <div className="absolute bg-[rgba(51,51,51,0.1)] h-[24.375px] left-[-1.06px] rounded-[4px] top-[20.18px] w-[122.927px]" data-name="Overlay" />
    </div>
  );
}

function BackgroundBorder11() {
  return (
    <div className="absolute bg-white border border-[rgba(232,234,228,0.3)] border-solid h-[129.426px] left-0 right-[547.83px] rounded-[12px] top-0" data-name="Background+Border">
      <Container45 />
      <div className="-translate-y-1/2 absolute h-[50.313px] left-[401.68px] opacity-20 top-[calc(50%+6.83px)] w-[48.915px]" data-name="Rectangle" />
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[12.609px] relative shrink-0 w-[471.073px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <div className="-translate-y-1/2 absolute bg-[rgba(51,51,51,0.05)] h-[12.609px] left-0 rounded-[4px] top-1/2 w-[66.643px]" data-name="Overlay" />
        <div className="-translate-y-1/2 absolute bg-[rgba(122,130,109,0.2)] h-[13.129px] left-[435.22px] rounded-[4px] top-[calc(50%+6.58px)] w-[35.807px]" data-name="Overlay" />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8.481px] items-start relative w-full">
        <div className="bg-[rgba(51,51,51,0.05)] h-[8.472px] rounded-[4px] shrink-0 w-full" data-name="Overlay" />
        <div className="bg-[rgba(51,51,51,0.05)] h-[8.503px] rounded-[4px] shrink-0 w-[311.644px]" data-name="Overlay" />
      </div>
    </div>
  );
}

function BackgroundBorder12() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[16.88px] h-[135.394px] items-start left-[501.68px] pb-[53.981px] pl-[25.99px] pr-[24.049px] pt-[26.467px] right-[0.04px] rounded-[12px] top-[6.13px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(232,234,228,0.3)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container46 />
      <Container47 />
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute h-[129.426px] left-[6.62px] right-[3.61px] top-[392.45px]" data-name="Container">
      <BackgroundBorder11 />
      <BackgroundBorder12 />
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(248,249,247,0.8)] flex-[1_0_0] h-[538.295px] min-h-px min-w-px mr-[-0.02px] relative" data-name="Overlay">
      <Container37 />
      <BackgroundBorderShadow5 />
      <Container44 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[534.97px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pr-[0.02px] relative size-full">
        <BackgroundVerticalBorder />
        <Overlay1 />
      </div>
    </div>
  );
}

function OverlayBorderShadowOverlayBlur() {
  return (
    <div className="backdrop-blur-[8px] bg-[rgba(255,255,255,0.7)] relative rounded-[24px] shrink-0 w-[1114.95px]" data-name="Overlay+Border+Shadow+OverlayBlur">
      <div className="content-stretch flex flex-col items-start overflow-clip pb-[5.033px] pl-[4.074px] pr-[4.969px] pt-[4.35px] relative rounded-[inherit] w-full">
        <Container27 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_12px_40px_-12px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container49() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-[-0.37px] top-[calc(50%-0.58px)]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[10px] tracking-[1px] uppercase w-[135.26px]">
        <p className="leading-[15px] whitespace-pre-wrap">Global Ledger Syncing</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-[198.59px] top-[calc(50%-2.97px)]" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[24px] w-[21.927px]">
        <p className="leading-[24px] whitespace-pre-wrap">sync</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute h-[21.886px] left-[16.93px] right-[20.13px] top-[18.67px]" data-name="Container">
      <Container49 />
      <Container50 />
    </div>
  );
}

function Container53() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 pl-[2.793px] pr-[2.814px] top-[-1.14px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[12px] text-center w-[21.766px]">
        <p className="leading-[16px] whitespace-pre-wrap">LDN</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[-1.18px] top-[14.66px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[8px] text-center w-[27.424px]">
        <p className="leading-[12px] whitespace-pre-wrap">Node 01</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="-translate-y-1/2 absolute h-[25.783px] left-0 top-1/2 w-[27.373px]" data-name="Container">
      <Container53 />
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 pl-[2.996px] pr-[3.027px] top-[-1.03px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[12px] text-center w-[24.092px]">
        <p className="leading-[16px] whitespace-pre-wrap">NYC</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[-0.82px] top-[14.93px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[8px] text-center w-[30.177px]">
        <p className="leading-[12px] whitespace-pre-wrap">Node 04</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="-translate-y-1/2 absolute h-[26.195px] left-[191.4px] top-[calc(50%-2.19px)] w-[30.115px]" data-name="Container">
      <Container56 />
      <Container57 />
    </div>
  );
}

function Background1() {
  return <div className="-translate-y-1/2 absolute bg-[#e8eae4] h-[3.698px] left-[40.8px] right-[45.32px] rounded-[9999px] top-[calc(50%-0.53px)]" data-name="Background" />;
}

function Container51() {
  return (
    <div className="absolute h-[25.783px] left-[14.16px] right-[21.91px] top-[55.1px]" data-name="Container">
      <Container52 />
      <Container55 />
      <Background1 />
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-start left-[-0.07px] top-[-1.01px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[10px] w-[72.373px]">
        <p className="leading-[15px] whitespace-pre-wrap">TX_ID: 8829x-BZ</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute bottom-[1.59px] content-stretch flex flex-col items-start left-[202.18px] top-[-2.73px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[10px] w-[20.295px]">
        <p className="leading-[15px] whitespace-pre-wrap">LIVE</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute h-[13.918px] left-[11.37px] right-[23.7px] top-[91.88px]" data-name="Container">
      <Container59 />
      <Container60 />
    </div>
  );
}

function OverlayBorderOverlayBlur() {
  return (
    <div className="absolute backdrop-blur-[8px] bg-[rgba(255,255,255,0.7)] h-[125.764px] left-[-75.31px] rounded-[12px] top-[73.07px] w-[257.601px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-[3.61px] left-0 rounded-[12px] shadow-[0px_12px_40px_-12px_rgba(0,0,0,0.1)] top-0 w-[253.75px]" data-name="Overlay+Shadow" />
      <Container48 />
      <Container51 />
      <Container58 />
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.783px] pt-[0.808px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#d97706] text-[24px] w-[26.101px]">
        <p className="leading-[24px] whitespace-pre-wrap">bolt</p>
      </div>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(245,158,11,0.1)] content-stretch flex h-[34.107px] items-center justify-center relative rounded-[6px] shrink-0 w-[34.771px]" data-name="Overlay">
      <Container62 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="font-['Inter:Bold',sans-serif] h-[33.186px] leading-[0] not-italic relative shrink-0 w-[164.685px]" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col h-[15px] justify-center left-[0.06px] text-[#d97706] text-[10px] top-[7.48px] tracking-[1px] uppercase w-[164.716px]">
        <p className="leading-[15px] whitespace-pre-wrap">Automation Triggered</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col h-[16px] justify-center left-[0.87px] text-[#333] text-[12px] top-[24.05px] w-[159.785px]">
        <p className="leading-[16px] whitespace-pre-wrap">Low Stock Alert: SK-402</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute content-stretch flex gap-[13.118px] items-center left-[23.71px] right-[21.95px] top-[22.35px]" data-name="Container">
      <Overlay2 />
      <Paragraph />
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[1.174px] pt-[0.073px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[10px] w-[33.194px]">
        <p className="leading-[15px] whitespace-pre-wrap">Action</p>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#7a826d] content-stretch flex flex-col items-start pb-[3.414px] pl-[6.997px] pr-[6.615px] pt-[2.486px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white uppercase w-[99.703px]">
        <p className="leading-[15px] whitespace-pre-wrap">Generating RFQ</p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-[13.9px] pl-[0.106px] pr-[0.017px] pt-[2.163px] right-[12.69px] top-[13.18px]" data-name="Container">
      <Container64 />
      <Background2 />
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[15.38px] pb-[0.78px] pt-[0.218px] right-[10.12px] top-[42.41px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[11px] w-[264.138px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Drafting Purchase Order for Apex Logistics...</p>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.5)] border border-[rgba(232,234,228,0.3)] border-solid h-[75.403px] left-[26.21px] right-[17.34px] rounded-[8px] top-[73.56px]" data-name="Overlay+Border">
      <Container63 />
      <Container65 />
    </div>
  );
}

function OverlayBorderOverlayBlur1() {
  return (
    <div className="absolute backdrop-blur-[8px] bg-[rgba(255,255,255,0.7)] bottom-[22.55px] h-[184.809px] right-[-135.29px] rounded-[12px] w-[354.729px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-[6.39px] right-[5.69px] rounded-[12px] shadow-[0px_12px_40px_-12px_rgba(0,0,0,0.1)] top-0 w-[349.04px]" data-name="Overlay+Shadow" />
      <Container61 />
      <OverlayBorder />
    </div>
  );
}

function Container67() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-0 pb-[1.136px] pt-[0.05px] top-1/2" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] tracking-[1px] uppercase w-[118.85px]">
        <p className="leading-[15px] whitespace-pre-wrap">Financial Health</p>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute h-[16.186px] left-[21.82px] right-[22.02px] top-[23.06px]" data-name="Container">
      <Container67 />
      <div className="-translate-y-1/2 absolute bg-[#7a826d] h-[8.808px] left-[218.6px] rounded-[9999px] top-[calc(50%+5.74px)] w-[8.657px]" data-name="Background" />
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-start left-0 pb-[1.996px] pt-[0.89px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[81.484px]">
        <p className="whitespace-pre-wrap">
          <span className="leading-[32px]">98.2</span>
          <span className="font-['Inter:Regular',sans-serif] leading-[32px] not-italic text-[#7a826d]">%</span>
        </p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[130.16px] pb-[5.482px] pt-[0.234px] top-[18px]" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.4)] w-[98.418px]">
        <p className="leading-[15px] whitespace-pre-wrap">STABLE / OPTIMAL</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="absolute h-[34.886px] left-[21.9px] right-[20.97px] top-[56.57px]" data-name="Container">
      <Container69 />
      <Margin2 />
    </div>
  );
}

function Overlay3() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.05)] h-[6.588px] left-[22.03px] right-[19.45px] rounded-[9999px] top-[104.61px]" data-name="Overlay">
      <div className="absolute bg-[#7a826d] inset-[0_2.04%_0_0] shadow-[0px_0px_10px_0px_rgba(122,130,109,0.8)]" data-name="Background+Shadow" />
    </div>
  );
}

function OverlayBorderOverlayBlur2() {
  return (
    <div className="-translate-x-1/2 absolute backdrop-blur-[6px] bg-[rgba(18,18,18,0.8)] bottom-[-116.32px] h-[133.581px] left-[calc(50%+107.36px)] rounded-[12px] w-[271.044px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="-translate-x-1/2 absolute bg-[rgba(255,255,255,0)] bottom-[4.34px] left-[calc(50%-2.28px)] rounded-[12px] shadow-[0px_20px_40px_-15px_rgba(0,0,0,0.15)] top-0 w-[266.48px]" data-name="Overlay+Shadow" />
      <Container66 />
      <Container68 />
      <Overlay3 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-[-0.02px] top-[calc(50%-0.23px)]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(51,51,51,0.6)] tracking-[1.1px] uppercase w-[149.535px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Performance Metrics</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#7a826d] content-stretch flex flex-col items-start pb-[1.557px] pt-[0.651px] px-[8px] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[14px] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-white w-[16.227px]">
        <p className="leading-[13.5px] whitespace-pre-wrap">{`P&L`}</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex items-start left-[225.57px] top-[calc(50%-6.35px)]" data-name="Container">
      <Background3 />
    </div>
  );
}

function Container70() {
  return (
    <div className="h-[15.906px] relative shrink-0 w-[257.446px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading2 />
        <Container71 />
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-2.126px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[20px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">$242k</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-2.126px] relative shrink-0 w-[120.629px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[14px] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(51,51,51,0.3)] tracking-[0.9px] uppercase w-[83.017px]">
        <p className="leading-[13.5px] whitespace-pre-wrap">Gross Revenue</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute content-stretch flex flex-col items-end left-0 pb-[2.126px] right-[139.04px] top-[-1.14px]" data-name="Container">
      <Container74 />
      <Container75 />
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1.909px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[20px] w-full">
        <p className="leading-[28px] whitespace-pre-wrap">$102k</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-1.909px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(51,51,51,0.3)] tracking-[0.9px] uppercase w-full">
        <p className="leading-[13.5px] whitespace-pre-wrap">Net Margin</p>
      </div>
    </div>
  );
}

function Container76() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[135.5px] pb-[1.909px] right-[0.58px] top-[-4.43px]" data-name="Container">
      <Container77 />
      <Container78 />
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[38.204px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container73 />
        <Container76 />
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur3() {
  return (
    <div className="absolute backdrop-blur-[8px] bg-[rgba(255,255,255,0.7)] content-stretch flex flex-col gap-[21.906px] items-end left-[345.63px] pb-[23.691px] pl-[21.888px] pr-[24.098px] pt-[21.889px] rounded-[12px] top-[-81.01px] w-[304.234px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-[3.82px] left-0 rounded-[12px] shadow-[0px_12px_40px_-12px_rgba(0,0,0,0.1)] top-0 w-[299.87px]" data-name="Overlay+Shadow" />
      <Container70 />
      <Container72 />
      <div className="-translate-x-1/2 absolute bg-gradient-to-t bottom-[-52.86px] from-[#7a826d] h-[56.859px] left-[calc(50%-2.67px)] opacity-40 to-[rgba(122,130,109,0)] w-[0.965px]" data-name="Vertical Divider" />
    </div>
  );
}

function Container79() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Material_Symbols_Outlined:Thin',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[24px] w-[25.208px]">
        <p className="leading-[24px] whitespace-pre-wrap">account_balance_wallet</p>
      </div>
    </div>
  );
}

function Overlay4() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.1)] content-stretch flex h-[31.769px] items-center justify-center left-[22.93px] rounded-[6px] top-[20.29px] w-[33.586px]" data-name="Overlay">
      <Container79 />
    </div>
  );
}

function Container80() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[25.36px] pb-[0.596px] right-[17.43px] top-[67.98px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[93.17px]">
        <p className="leading-[32px] whitespace-pre-wrap">$44.2K</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[27.2px] pb-[0.604px] right-[14.64px] top-[104.14px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] tracking-[1px] uppercase w-[94.528px]">
        <p className="leading-[15px] whitespace-pre-wrap">Liquid Assets</p>
      </div>
    </div>
  );
}

function OverlayBorder1() {
  return (
    <div className="absolute bg-[rgba(122,130,109,0.2)] content-stretch flex flex-col items-center left-[28.79px] px-[13px] py-[7px] right-[12.21px] rounded-[9999px] top-[135.54px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(122,130,109,0.3)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[14px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[9px] text-center w-[81.493px]">
        <p className="leading-[13.5px] whitespace-pre-wrap">MARKET STABLE</p>
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur4() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(18,18,18,0.8)] h-[185.444px] right-[-21.82px] rounded-[12px] top-[55.86px] w-[237.635px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-[6.43px] right-[3.54px] rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] top-0 w-[234.09px]" data-name="Overlay+Shadow" />
      <Overlay4 />
      <Container80 />
      <Container81 />
      <OverlayBorder1 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[1.819px] relative w-full" data-name="Container">
      <OverlayBorderShadowOverlayBlur />
      <OverlayBorderOverlayBlur />
      <OverlayBorderOverlayBlur1 />
      <OverlayBorderOverlayBlur2 />
      <OverlayBorderOverlayBlur3 />
      <OverlayBorderOverlayBlur4 />
    </div>
  );
}

function Container83() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(51,51,51,0.4)] text-center tracking-[2.4px] uppercase w-[338.14px]">
        <p className="leading-[16px] whitespace-pre-wrap">Trusted by 5,000+ scaling companies</p>
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="content-stretch flex gap-[48px] items-center justify-center relative shrink-0 w-full" data-name="Background">
      <div aria-hidden="true" className="absolute bg-white inset-0 mix-blend-saturation pointer-events-none" />
      <div className="bg-[rgba(51,51,51,0.1)] h-[32px] rounded-[4px] shrink-0 w-[128px]" data-name="Overlay" />
      <div className="bg-[rgba(51,51,51,0.1)] h-[32px] rounded-[4px] shrink-0 w-[96px]" data-name="Overlay" />
      <div className="bg-[rgba(51,51,51,0.1)] h-[32px] rounded-[4px] shrink-0 w-[144px]" data-name="Overlay" />
      <div className="bg-[rgba(51,51,51,0.1)] h-[32px] rounded-[4px] shrink-0 w-[112px]" data-name="Overlay" />
      <div className="bg-[rgba(51,51,51,0.1)] h-[32px] rounded-[4px] shrink-0 w-[128px]" data-name="Overlay" />
    </div>
  );
}

function Container82() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[48px] items-start left-0 max-w-[1280px] opacity-40 px-[24px] right-0 top-[1383px]" data-name="Container">
      <Container83 />
      <Background4 />
    </div>
  );
}

function Container86() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] text-center tracking-[-0.3px] w-[28px]">
          <p className="leading-[16px] whitespace-pre-wrap">NEW</p>
        </div>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[12px] text-center tracking-[-0.3px] w-[229.58px]">
          <p className="leading-[16px] whitespace-pre-wrap">All-in-one business management platform</p>
        </div>
      </div>
    </div>
  );
}

function Container88() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 14.9999">
        <g id="Container">
          <path d={svgPaths.p19722680} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] text-center tracking-[-0.3px] w-[62.86px]">
        <p className="leading-[16px] whitespace-pre-wrap">Learn more</p>
      </div>
      <Container88 />
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="relative shrink-0" data-name="Link:margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] relative">
        <Link />
      </div>
    </div>
  );
}

function BackgroundBorderShadow6() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[17px] py-[9px] relative rounded-[9999px] self-stretch shrink-0" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container86 />
      <div className="bg-[rgba(51,51,51,0.3)] rounded-[9999px] shrink-0 size-[4px]" data-name="Overlay" />
      <Container87 />
      <LinkMargin />
    </div>
  );
}

function Container85() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <BackgroundBorderShadow6 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[896px] relative shrink-0 w-[896px]" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[144px] justify-center leading-[72px] not-italic relative shrink-0 text-[#333] text-[72px] text-center tracking-[-1.8px] w-[859.48px] whitespace-pre-wrap">
        <p className="mb-0">The Operating System for</p>
        <p>Modern Business</p>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[65px] justify-center leading-[32.5px] not-italic relative shrink-0 text-[#666] text-[20px] text-center w-[642.02px] whitespace-pre-wrap">
        <p className="mb-0">A comprehensive ERP for SMEs and mid-market companies built for</p>
        <p>scale, automation, and total visibility.</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <a href="https://system.bizakerp.com/account/self-register" target="_blank" rel="noopener noreferrer">
      <div className="bg-[#7a826d] content-stretch flex flex-col items-center justify-center px-[32px] py-[17px] relative rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Button">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white w-[107.94px]">
          <p className="leading-[24px] whitespace-pre-wrap">Start free trial</p>
        </div>
      </div>
    </a>
  );
}

function Button1() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center px-[33px] py-[17px] relative rounded-[6px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] text-center w-[100.39px]">
        <p className="leading-[24px] whitespace-pre-wrap">Book a demo</p>
      </div>
    </div>
  );
}

function Container90() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-center pt-[8px] relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Container84() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] items-center left-0 max-w-[1280px] px-[24px] right-0 top-[160px]" data-name="Container">
      <Container85 />
      <Heading />
      <Container89 />
      <Container90 />
    </div>
  );
}

function Section1() {
  return (
    <div className="absolute bg-[#fbfbfb] h-[1655px] left-0 overflow-clip right-0 top-0" data-name="Section">
      <div className="absolute flex items-center justify-center left-[108.67px] max-w-[1152px] right-[53.99px] top-[677.89px]">
        <div className="flex-none h-[528.43px] rotate-[-0.65deg] skew-x-[-2.69deg] w-[1098.64px]">
          <Container26 />
        </div>
      </div>
      <Container82 />
      <Container84 />
    </div>
  );
}

function Heading9() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[58px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[48px] text-center tracking-[-1.2px] w-[390.05px]">
        <p className="leading-[57.6px] whitespace-pre-wrap">How Bizak Works</p>
      </div>
    </div>
  );
}

function Container93() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] pt-[8.01px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-[rgba(102,102,102,0.8)] text-center w-[547.11px]">
        <p className="leading-[29.25px] whitespace-pre-wrap">A refined transition from legacy systems to a unified workspace.</p>
      </div>
    </div>
  );
}

function Container92() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[14px] text-center tracking-[1.4px] uppercase w-[146.33px]">
        <p className="leading-[21px] whitespace-pre-wrap">Implementation</p>
      </div>
      <Heading9 />
      <Container93 />
    </div>
  );
}

function Overlay5() {
  return (
    <div className="bg-[rgba(122,130,109,0.2)] h-[16px] overflow-clip relative rounded-[9999px] shrink-0 w-[32px]" data-name="Overlay">
      <div className="absolute bg-[#7a826d] right-[4px] rounded-[9999px] size-[12px] top-[2px]" data-name="Background" />
    </div>
  );
}

function Container98() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <Overlay5 />
    </div>
  );
}

function Container97() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <div className="bg-[rgba(232,234,228,0.5)] h-[8px] rounded-[9999px] shrink-0 w-[128px]" data-name="Overlay" />
        <Container98 />
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p30227100} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container102() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(51,51,51,0.7)] uppercase w-[105.13px]">
        <p className="leading-[16px] whitespace-pre-wrap">Global Ruleset</p>
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container101 />
        <Container102 />
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div className="h-[12px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 12">
        <g id="Container">
          <path d={svgPaths.p11a11ee0} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder13() {
  return (
    <div className="bg-[#f8f9f7] relative rounded-[8px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(232,234,228,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container100 />
          <Container103 />
        </div>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div className="h-[18px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
        <g id="Container">
          <path d={svgPaths.p18964900} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container106() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(51,51,51,0.7)] uppercase w-[94.41px]">
        <p className="leading-[16px] whitespace-pre-wrap">Node Mapping</p>
      </div>
    </div>
  );
}

function Container104() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container105 />
        <Container106 />
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div className="h-[12px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 12">
        <g id="Container">
          <path d={svgPaths.p11a11ee0} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder14() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container104 />
          <Container107 />
        </div>
      </div>
    </div>
  );
}

function Container109() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.p2bdb86e0} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container110() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(51,51,51,0.7)] uppercase w-[83.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">Role Access</p>
      </div>
    </div>
  );
}

function Container108() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Container109 />
        <Container110 />
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#e8eae4] h-[20px] relative rounded-[9999px] shrink-0 w-[40px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <div className="absolute bg-white left-[4px] rounded-[9999px] size-[12px] top-[4px]" data-name="Background" />
      </div>
    </div>
  );
}

function BackgroundBorder15() {
  return (
    <div className="bg-[#f8f9f7] relative rounded-[8px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(232,234,228,0.5)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container108 />
          <Background5 />
        </div>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start relative w-full">
        <BackgroundBorder13 />
        <BackgroundBorder14 />
        <BackgroundBorder15 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow7() {
  return (
    <div className="bg-white max-w-[448px] relative rounded-[12px] self-stretch shrink-0 w-[448px]" data-name="Background+Border+Shadow">
      <div className="content-stretch flex flex-col gap-[32px] items-start max-w-[inherit] overflow-clip p-[33px] relative rounded-[inherit] size-full">
        <Container97 />
        <Container99 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,234,228,0.3)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,0,0,0.02),0px_20px_25px_-5px_rgba(0,0,0,0.01)]" />
    </div>
  );
}

function Container96() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start justify-center min-h-px min-w-px relative" data-name="Container">
      <BackgroundBorderShadow7 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#e8eae4] content-stretch flex items-center justify-center relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[40px]" data-name="Background+Shadow">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[16px] text-center w-[17.69px]">
        <p className="leading-[24px] whitespace-pre-wrap">01</p>
      </div>
    </div>
  );
}

function Container113() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] tracking-[1.2px] uppercase w-[116.63px]">
        <p className="leading-[16px] whitespace-pre-wrap">Configuration</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <BackgroundShadow />
      <Container113 />
    </div>
  );
}

function Heading10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[30px] tracking-[-0.75px] w-full">
        <p className="leading-[36px] whitespace-pre-wrap">Instantly configure</p>
      </div>
    </div>
  );
}

function Container114() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[384px] relative shrink-0 w-[384px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[78px] justify-center leading-[26px] not-italic relative shrink-0 text-[#666] text-[16px] w-[383.48px] whitespace-pre-wrap">
        <p className="mb-0">Define your organizational structure and business</p>
        <p className="mb-0">units with a dynamic configurator that sets up your</p>
        <p>entire infrastructure in minutes.</p>
      </div>
    </div>
  );
}

function Container111() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col gap-[16px] items-start pl-[48px] relative w-full">
        <Container112 />
        <Heading10 />
        <Container114 />
      </div>
    </div>
  );
}

function Container95() {
  return (
    <div className="content-stretch flex gap-[64px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container96 />
      <Container111 />
    </div>
  );
}

function Container118() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] text-right tracking-[1.2px] uppercase w-[80.5px]">
        <p className="leading-[16px] whitespace-pre-wrap">Data Flow</p>
      </div>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-[#e8eae4] content-stretch flex items-center justify-center relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[40px]" data-name="Background+Shadow">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[16px] text-center w-[20.88px]">
        <p className="leading-[24px] whitespace-pre-wrap">02</p>
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-end relative shrink-0 w-full" data-name="Container">
      <Container118 />
      <BackgroundShadow1 />
    </div>
  );
}

function Heading11() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[30px] text-right tracking-[-0.75px] w-[245.98px]">
        <p className="leading-[36px] whitespace-pre-wrap">Migrate your data</p>
      </div>
    </div>
  );
}

function Container119() {
  return (
    <div className="content-stretch flex flex-col items-end max-w-[384px] relative shrink-0 w-[384px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[78px] justify-center leading-[26px] not-italic relative shrink-0 text-[#666] text-[16px] text-right w-[359.66px] whitespace-pre-wrap">
        <p className="mb-0">Seamlessly transition legacy assets. Our data-</p>
        <p className="mb-0">stream engine maps your historical records into</p>
        <p>the Bizak cloud with zero downtime.</p>
      </div>
    </div>
  );
}

function Container116() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col items-end size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-end pr-[48px] relative w-full">
          <Container117 />
          <Heading11 />
          <Container119 />
        </div>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="absolute h-[227px] left-0 top-0 w-[422px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 422 227">
        <g id="SVG">
          <path d={svgPaths.p5bac000} id="Vector" opacity="0.3" stroke="url(#paint0_linear_1_801)" strokeDasharray="3.03 3.03" strokeWidth="0.5675" />
          <path d="M112.633 113.5H339.633" id="Vector_2" opacity="0.3" stroke="url(#paint1_linear_1_801)" strokeDasharray="3.03 3.03" strokeWidth="0.5675" />
          <path d={svgPaths.p215c8f90} id="Vector_3" opacity="0.3" stroke="url(#paint2_linear_1_801)" strokeDasharray="3.03 3.03" strokeWidth="0.5675" />
          <path d={svgPaths.p5bac000} id="mPath1" opacity="0" stroke="var(--stroke-0, white)" strokeWidth="0.756667" />
          <path d="M112.633 113.5H339.633" id="mPath2" opacity="0" stroke="var(--stroke-0, white)" strokeWidth="0.756667" />
          <path d={svgPaths.p215c8f90} id="mPath3" opacity="0" stroke="var(--stroke-0, white)" strokeWidth="0.756667" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_801" x1="112.633" x2="339.633" y1="51.4533" y2="51.4533">
            <stop stopColor="#7A826D" stopOpacity="0" />
            <stop offset="0.3" stopColor="#7A826D" stopOpacity="0.3" />
            <stop offset="1" stopColor="#7A826D" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_801" x1="112.633" x2="339.633" y1="113.5" y2="113.5">
            <stop stopColor="#7A826D" stopOpacity="0" />
            <stop offset="0.3" stopColor="#7A826D" stopOpacity="0.3" />
            <stop offset="1" stopColor="#7A826D" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_801" x1="112.633" x2="339.633" y1="113.5" y2="113.5">
            <stop stopColor="#7A826D" stopOpacity="0" />
            <stop offset="0.3" stopColor="#7A826D" stopOpacity="0.3" />
            <stop offset="1" stopColor="#7A826D" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Container125() {
  return (
    <div className="h-[17.5px] relative shrink-0 w-[19.269px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.2692 17.5">
        <g id="Container">
          <path d={svgPaths.p1b752c80} fill="var(--fill-0, white)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorderOverlayBlur5() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center p-px relative rounded-[12px] shrink-0 size-[56px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[56px] top-0" data-name="Overlay+Shadow" />
      <Container125 />
      <div className="absolute bg-[rgba(122,130,109,0.4)] right-[-3px] rounded-[9999px] size-[6px] top-[-3px]" data-name="Overlay" />
      <div className="absolute bg-[rgba(122,130,109,0.2)] bottom-[-3px] left-[-3px] rounded-[9999px] size-[6px]" data-name="Overlay" />
    </div>
  );
}

function Container124() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="absolute bg-[rgba(122,130,109,0.2)] blur-[12px] inset-0 opacity-0" data-name="Overlay+Blur" />
      <OverlayBorderOverlayBlur5 />
    </div>
  );
}

function Container127() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.8)] tracking-[1.1px] uppercase w-[105.97px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Enterprise ERP</p>
      </div>
    </div>
  );
}

function Container128() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.3)] w-full">
        <p className="leading-[13.5px] whitespace-pre-wrap">Multi-cloud Instance</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container128 />
    </div>
  );
}

function Container126() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container127 />
      <Margin3 />
    </div>
  );
}

function Container123() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Container124 />
      <Container126 />
    </div>
  );
}

function Container131() {
  return (
    <div className="h-[15px] relative shrink-0 w-[21px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.9999 14.9999">
        <g id="Container">
          <path d={svgPaths.p18938530} fill="var(--fill-0, white)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorderOverlayBlur6() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center p-px relative rounded-[12px] shrink-0 size-[56px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[56px] top-0" data-name="Overlay+Shadow" />
      <Container131 />
      <div className="-translate-y-1/2 absolute bg-[rgba(122,130,109,0.4)] right-[-5px] rounded-[9999px] size-[6px] top-1/2" data-name="Overlay" />
    </div>
  );
}

function Container130() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="absolute bg-[rgba(122,130,109,0.2)] blur-[12px] inset-0 opacity-0" data-name="Overlay+Blur" />
      <OverlayBorderOverlayBlur6 />
    </div>
  );
}

function Container133() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.8)] tracking-[1.1px] uppercase w-[107.42px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Cloud Storage</p>
      </div>
    </div>
  );
}

function Container134() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.3)] w-full">
        <p className="leading-[13.5px] whitespace-pre-wrap">Global Data Lakes</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container134 />
    </div>
  );
}

function Container132() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container133 />
      <Margin4 />
    </div>
  );
}

function Container129() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Container130 />
      <Container132 />
    </div>
  );
}

function Container137() {
  return (
    <div className="relative shrink-0 size-[17px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.9999 16.9999">
        <g id="Container">
          <path d={svgPaths.p1e630f90} fill="var(--fill-0, white)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorderOverlayBlur7() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center p-px relative rounded-[12px] shrink-0 size-[56px]" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[56px] top-0" data-name="Overlay+Shadow" />
      <Container137 />
      <div className="absolute bg-[rgba(122,130,109,0.2)] left-[17px] rounded-[9999px] size-[6px] top-[-3px]" data-name="Overlay" />
    </div>
  );
}

function Container136() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="absolute bg-[rgba(122,130,109,0.2)] blur-[12px] inset-0 opacity-0" data-name="Overlay+Blur" />
      <OverlayBorderOverlayBlur7 />
    </div>
  );
}

function Container139() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.8)] tracking-[1.1px] uppercase w-[128.69px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Legacy Databases</p>
      </div>
    </div>
  );
}

function Container140() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.3)] w-full">
        <p className="leading-[13.5px] whitespace-pre-wrap">SQL/NoSQL Archives</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container140 />
    </div>
  );
}

function Container138() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container139 />
      <Margin5 />
    </div>
  );
}

function Container135() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Container136 />
      <Container138 />
    </div>
  );
}

function Container122() {
  return (
    <div className="content-stretch flex flex-col gap-[56px] items-start relative shrink-0" data-name="Container">
      <Container123 />
      <Container129 />
      <Container135 />
    </div>
  );
}

function Overlay6() {
  return (
    <div className="absolute bg-[rgba(122,130,109,0.1)] inset-[17px] opacity-40 rounded-[9999px]" data-name="Overlay">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="bg-[rgba(255,255,255,0)] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[9999px]" data-name="Overlay+Border+Shadow">
          <div aria-hidden="true" className="absolute border border-[rgba(122,130,109,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_30px_0px_rgba(122,130,109,0.2)]" />
        </div>
      </div>
    </div>
  );
}

function Container143() {
  return (
    <div className="h-[18.942px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 18.9422">
        <g id="Container">
          <path d={svgPaths.p7482800} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorderShadow9() {
  return (
    <div className="bg-[#121212] relative rounded-[12px] shrink-0 size-[64px]" data-name="Background+Border+Shadow">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Container143 />
        <div className="absolute flex inset-[-106.38%_-38.56%_-67.63%_-135.44%] items-center justify-center">
          <div className="flex-none rotate-45 size-[124px]">
            <div className="size-full" data-name="Gradient" style={{ backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 100%)" }} />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container144() {
  return (
    <div className="h-[21px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 21">
        <g id="Container">
          <path d={svgPaths.p13774060} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorderShadow10() {
  return (
    <div className="absolute bg-[#7a826d] right-[-3px] rounded-[9999px] size-[32px] top-[-3px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border-3 border-[#0a0a0a] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_25px_0px_rgba(122,130,109,0.5)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[3px] relative size-full">
        <Container144 />
      </div>
    </div>
  );
}

function BackgroundBorderShadowOverlayBlur() {
  return (
    <div className="backdrop-blur-[10px] content-stretch flex items-center justify-center p-px relative rounded-[9999px] shrink-0 size-[128px]" data-name="Background+Border+Shadow+OverlayBlur" style={{ backgroundImage: "linear-gradient(135deg, rgba(122, 130, 109, 0.1) 0%, rgba(122, 130, 109, 0.05) 100%)" }}>
      <div aria-hidden="true" className="absolute border border-[rgba(122,130,109,0.3)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Overlay6 />
      <BackgroundBorderShadow9 />
      <BackgroundBorderShadow10 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_20px_0px_rgba(122,130,109,0.2)]" />
    </div>
  );
}

function Container142() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 z-[2]" data-name="Container">
      <div className="absolute inset-[-40px] opacity-20 rounded-[9999px]" data-name="Border">
        <div aria-hidden="true" className="absolute border border-[rgba(122,130,109,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="absolute inset-[-20px] opacity-30 rounded-[9999px]" data-name="Border">
        <div aria-hidden="true" className="absolute border border-[rgba(122,130,109,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <BackgroundBorderShadowOverlayBlur />
    </div>
  );
}

function Container146() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] tracking-[3.6px] uppercase w-[161.81px]">
        <p className="leading-[18px] whitespace-pre-wrap">Bizak Data Core</p>
      </div>
    </div>
  );
}

function Container147() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[14px] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.7)] tracking-[0.9px] uppercase w-[84.3px]">
          <p className="leading-[13.5px] whitespace-pre-wrap">Live Ingestion</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorderOverlayBlur8() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.05)] content-stretch flex gap-[8px] items-center px-[17px] py-[7px] relative rounded-[9999px] shrink-0" data-name="Overlay+Border+OverlayBlur">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="bg-[#22c55e] rounded-[9999px] shadow-[0px_0px_8px_0px_#22c55e] shrink-0 size-[6px]" data-name="Background+Shadow" />
      <Container147 />
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0" data-name="Margin">
      <OverlayBorderOverlayBlur8 />
    </div>
  );
}

function Container145() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 z-[1]" data-name="Container">
      <Container146 />
      <Margin7 />
    </div>
  );
}

function Container141() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] isolate items-center relative shrink-0" data-name="Container">
      <Container142 />
      <Container145 />
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[8px] relative shrink-0" data-name="Margin">
      <Container141 />
    </div>
  );
}

function Container121() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Svg1 />
        <Container122 />
        <Margin6 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow8() {
  return (
    <div className="bg-[#0a0a0a] flex-[1_0_0] max-w-[576px] min-h-px min-w-px relative rounded-[24px] self-stretch" data-name="Background+Border+Shadow">
      <div className="flex flex-row items-center justify-center max-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center max-w-[inherit] p-[49px] relative size-full">
          <div className="absolute inset-px opacity-20" data-name="Gradient" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 518 323\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(39.694 0 0 39.694 362.6 161.5)\\'><stop stop-color=\\'rgba(122,130,109,0.15)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(122,130,109,0)\\' offset=\\'0.6\\'/></radialGradient></defs></svg>')" }} />
          <div className="absolute inset-px opacity-3" data-name="Gradient" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 2.5%, rgba(255, 255, 255, 0) 2.5%), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 2.5%, rgba(255, 255, 255, 0) 2.5%)" }} />
          <div className="-translate-y-1/2 absolute bg-[rgba(122,130,109,0.2)] blur-[20px] h-[192px] left-[47.94%] opacity-30 right-[15.13%] rounded-[9999px] top-1/2" data-name="Overlay+Blur" />
          <Container121 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container120() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start justify-center min-h-px min-w-px relative" data-name="Container">
      <BackgroundBorderShadow8 />
    </div>
  );
}

function Container115() {
  return (
    <div className="content-stretch flex gap-[64px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container116 />
      <Container120 />
    </div>
  );
}

function OverlayBorderShadow() {
  return (
    <div className="bg-[rgba(122,130,109,0.2)] content-stretch flex items-center justify-center pb-[16.5px] pt-[15.5px] px-[4px] relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay+Border+Shadow">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_25px_0px_rgba(122,130,109,0.5)]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] text-center w-[15.68px]">
        <p className="leading-[16px] whitespace-pre-wrap">JD</p>
      </div>
    </div>
  );
}

function OverlayBorderShadowCssTransform() {
  return (
    <div className="content-stretch flex flex-col h-[60px] items-start pb-[12px] relative shrink-0" data-name="Overlay+Border+Shadow:css-transform">
      <OverlayBorderShadow />
    </div>
  );
}

function OverlayBorder2() {
  return (
    <div className="absolute bg-[rgba(51,51,51,0.1)] content-stretch flex items-center justify-center left-[-12px] pb-[16.5px] pt-[15.5px] px-[4px] rounded-[9999px] size-[48px] top-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(51,51,51,0.6)] text-center w-[19.05px]">
        <p className="leading-[16px] whitespace-pre-wrap">SM</p>
      </div>
    </div>
  );
}

function Margin9() {
  return (
    <div className="h-[48px] relative shrink-0 w-[36px]" data-name="Margin">
      <OverlayBorder2 />
    </div>
  );
}

function MarginCssTransform() {
  return (
    <div className="content-stretch flex flex-col h-[60px] items-start pb-[12px] relative shrink-0" data-name="Margin:css-transform">
      <Margin9 />
    </div>
  );
}

function OverlayBorder3() {
  return (
    <div className="absolute bg-[rgba(122,130,109,0.3)] content-stretch flex items-center justify-center left-[-12px] pb-[16.5px] pt-[15.5px] px-[4px] rounded-[9999px] size-[48px] top-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] text-center w-[17.6px]">
        <p className="leading-[16px] whitespace-pre-wrap">AK</p>
      </div>
    </div>
  );
}

function Margin10() {
  return (
    <div className="h-[48px] relative shrink-0 w-[36px]" data-name="Margin">
      <OverlayBorder3 />
    </div>
  );
}

function MarginCssTransform1() {
  return (
    <div className="content-stretch flex flex-col h-[60px] items-start pb-[12px] relative shrink-0" data-name="Margin:css-transform">
      <Margin10 />
    </div>
  );
}

function Container151() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Container">
          <path d={svgPaths.p2bb32400} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder16() {
  return (
    <div className="absolute bg-[#e8eae4] content-stretch flex items-center justify-center left-[-12px] p-[4px] rounded-[9999px] size-[48px] top-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <Container151 />
    </div>
  );
}

function Margin11() {
  return (
    <div className="h-[48px] relative shrink-0 w-[36px]" data-name="Margin">
      <BackgroundBorder16 />
    </div>
  );
}

function MarginCssTransform2() {
  return (
    <div className="content-stretch flex flex-col h-[60px] items-start pb-[12px] relative shrink-0" data-name="Margin:css-transform">
      <Margin11 />
    </div>
  );
}

function Container150() {
  return (
    <div className="absolute content-stretch flex items-start left-0 top-[-12px]" data-name="Container">
      <OverlayBorderShadowCssTransform />
      <MarginCssTransform />
      <MarginCssTransform1 />
      <MarginCssTransform2 />
    </div>
  );
}

function Margin8() {
  return (
    <div className="h-[88px] relative shrink-0 w-[156px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container150 />
      </div>
    </div>
  );
}

function Container153() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[10px] text-center tracking-[2px] uppercase w-[133.83px]">
        <p className="leading-[15px] whitespace-pre-wrap">Ready for Launch</p>
      </div>
    </div>
  );
}

function Container154() {
  return (
    <div className="h-[20.071px] relative shrink-0 w-[20.047px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.0467 20.0706">
        <g id="Container">
          <path d={svgPaths.p6551200} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#7a826d] content-stretch flex gap-[8px] items-center justify-center py-[16px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_0_0.07px_0] rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" data-name="Button:shadow" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white tracking-[1.2px] uppercase w-[94.09px]">
        <p className="leading-[16px] whitespace-pre-wrap">Go Live Now</p>
      </div>
      <Container154 />
    </div>
  );
}

function Container152() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Container153 />
        <Button2 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow11() {
  return (
    <div className="bg-white max-w-[448px] relative rounded-[12px] self-stretch shrink-0 w-[448px]" data-name="Background+Border+Shadow">
      <div className="content-stretch flex flex-col items-center max-w-[inherit] overflow-clip p-[33px] relative rounded-[inherit] size-full">
        <Margin8 />
        <Container152 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(232,234,228,0.3)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,0,0,0.02),0px_20px_25px_-5px_rgba(0,0,0,0.01)]" />
    </div>
  );
}

function Container149() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start justify-center min-h-px min-w-px relative" data-name="Container">
      <BackgroundBorderShadow11 />
    </div>
  );
}

function BackgroundShadow2() {
  return (
    <div className="bg-[#e8eae4] content-stretch flex items-center justify-center relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[40px]" data-name="Background+Shadow">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[16px] text-center w-[21.13px]">
        <p className="leading-[24px] whitespace-pre-wrap">03</p>
      </div>
    </div>
  );
}

function Container157() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[12px] tracking-[1.2px] uppercase w-[95.31px]">
        <p className="leading-[16px] whitespace-pre-wrap">Deployment</p>
      </div>
    </div>
  );
}

function Container156() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <BackgroundShadow2 />
      <Container157 />
    </div>
  );
}

function Heading12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[30px] tracking-[-0.75px] w-full">
        <p className="leading-[36px] whitespace-pre-wrap">Go Live and invite Team</p>
      </div>
    </div>
  );
}

function Container158() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[384px] relative shrink-0 w-[384px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[78px] justify-center leading-[26px] not-italic relative shrink-0 text-[#666] text-[16px] w-[333.16px] whitespace-pre-wrap">
        <p className="mb-0">Activate your global workspace. Seamlessly</p>
        <p className="mb-0">onboard your entire team with role-specific</p>
        <p>access and start operating with total clarity.</p>
      </div>
    </div>
  );
}

function Container155() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col gap-[16px] items-start pl-[48px] relative w-full">
        <Container156 />
        <Heading12 />
        <Container158 />
      </div>
    </div>
  );
}

function Container148() {
  return (
    <div className="content-stretch flex gap-[64px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container149 />
      <Container155 />
    </div>
  );
}

function Container94() {
  return (
    <div className="content-stretch flex flex-col gap-[160px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="-translate-x-1/2 absolute bottom-[0.07px] left-1/2 top-0 w-px" data-name="Vertical Divider">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgVerticalDivider} />
      </div>
      <Container95 />
      <Container115 />
      <Container148 />
    </div>
  );
}

function Container91() {
  return (
    <div className="max-w-[1152px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[96.01px] items-start max-w-[inherit] px-[24px] relative w-full">
        <Container92 />
        <Container94 />
      </div>
    </div>
  );
}

function Section2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 overflow-clip px-[64px] py-[128px] right-0 top-[2663.84px]" data-name="Section">
      <Container91 />
    </div>
  );
}

function Heading13() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[58px] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-center text-white tracking-[-1.2px] w-[1004.08px]">
        <p className="leading-[57.6px] whitespace-pre-wrap">Built for scale, speed, and absolute reliability.</p>
      </div>
    </div>
  );
}

function Container161() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[59px] justify-center leading-[29.25px] not-italic relative shrink-0 text-[18px] text-[rgba(255,255,255,0.5)] text-center w-[665.54px] whitespace-pre-wrap">
        <p className="mb-0">Unlock the potential of your operations with tools designed for the mid-market</p>
        <p>leaders.</p>
      </div>
    </div>
  );
}

function Container160() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[14px] text-center tracking-[1.4px] uppercase w-[247.25px]">
        <p className="leading-[21px] whitespace-pre-wrap">Enterprise-Grade Benefits</p>
      </div>
      <Heading13 />
      <Container161 />
    </div>
  );
}

function Container163() {
  return (
    <div className="absolute bottom-[33px] h-[128px] right-[33px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] h-full items-end relative">
        <div className="bg-[rgba(255,255,255,0.05)] h-[38.39px] rounded-[2px] shrink-0 w-[16px]" data-name="Overlay" />
        <div className="bg-[rgba(255,255,255,0.05)] h-[57.59px] rounded-[2px] shrink-0 w-[16px]" data-name="Overlay" />
        <div className="bg-[rgba(122,130,109,0.2)] h-[83.19px] rounded-[2px] shrink-0 w-[16px]" data-name="Overlay" />
        <div className="bg-[rgba(122,130,109,0.4)] h-[102.39px] rounded-[2px] shrink-0 w-[16px]" data-name="Overlay" />
        <div className="bg-[#7a826d] h-full rounded-[2px] shrink-0 w-[16px]" data-name="Background" />
      </div>
    </div>
  );
}

function Container165() {
  return (
    <div className="h-[11px] relative shrink-0 w-[19px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9999 10.9999">
        <g id="Container">
          <path d={svgPaths.p23b42200} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder4() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center left-0 p-px rounded-[6px] size-[40px] top-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container165 />
    </div>
  );
}

function Heading14() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[64px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-[220.38px]">
        <p className="leading-[32px] whitespace-pre-wrap">Proven ROI Growth</p>
      </div>
    </div>
  );
}

function Container166() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 max-w-[448px] right-[299.33px] top-[108px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[52px] justify-center leading-[26px] not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0.4)] w-[415.81px] whitespace-pre-wrap">
        <p className="mb-0">Experience an average of 25% reduction in operational</p>
        <p>overhead within the first 6 months.</p>
      </div>
    </div>
  );
}

function Container169() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[30px] w-[68.03px]">
        <p className="leading-[36px] whitespace-pre-wrap">25%</p>
      </div>
    </div>
  );
}

function Container170() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.3)] tracking-[1px] uppercase w-[74.45px]">
        <p className="leading-[15px] whitespace-pre-wrap">Cost Saved</p>
      </div>
    </div>
  );
}

function Container168() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative self-stretch shrink-0" data-name="Container">
      <Container169 />
      <Container170 />
    </div>
  );
}

function Container172() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-white w-[60.66px]">
        <p className="leading-[36px] whitespace-pre-wrap">1.4x</p>
      </div>
    </div>
  );
}

function Container173() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.3)] tracking-[1px] uppercase w-[85.61px]">
        <p className="leading-[15px] whitespace-pre-wrap">Output Yield</p>
      </div>
    </div>
  );
}

function Container171() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative self-stretch shrink-0" data-name="Container">
      <Container172 />
      <Container173 />
    </div>
  );
}

function Container167() {
  return (
    <div className="absolute bottom-0 content-stretch flex gap-[48px] items-start left-0 right-0" data-name="Container">
      <Container168 />
      <Container171 />
    </div>
  );
}

function Container164() {
  return (
    <div className="h-[263px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <OverlayBorder4 />
        <Heading14 />
        <Container166 />
        <Container167 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow12() {
  return (
    <div className="absolute bg-[#252822] left-0 right-[418.67px] rounded-[12px] top-0" data-name="Background+Border+Shadow">
      <div className="content-stretch flex flex-col items-start overflow-clip pb-[137.5px] pt-[33px] px-[33px] relative rounded-[inherit] w-full">
        <Container163 />
        <Container164 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Container174() {
  return (
    <div className="h-[18.836px] relative shrink-0 w-[13.981px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9806 18.8365">
        <g id="Container">
          <path d={svgPaths.pfc1d700} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder5() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center p-px relative rounded-[6px] shrink-0 size-[40px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container174 />
    </div>
  );
}

function Margin12() {
  return (
    <div className="h-[64px] relative shrink-0 w-[40px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[24px] relative size-full">
        <OverlayBorder5 />
      </div>
    </div>
  );
}

function Heading15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white w-full">
        <p className="leading-[32px] whitespace-pre-wrap">Productivity Tools</p>
      </div>
    </div>
  );
}

function Heading3Margin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3:margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] relative w-full">
        <Heading15 />
      </div>
    </div>
  );
}

function Container175() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.625px] right-0 top-[-1.13px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-[316.73px] whitespace-pre-wrap">
        <p className="mb-0">Integrated task management that uses AI to</p>
        <p>prioritize high-value operations over busy work.</p>
      </div>
    </div>
  );
}

function Margin13() {
  return (
    <div className="h-[77.5px] relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container175 />
      </div>
    </div>
  );
}

function Container177() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.7)] w-[96.14px]">
          <p className="leading-[16px] whitespace-pre-wrap">Task Automation</p>
        </div>
      </div>
    </div>
  );
}

function Container178() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[10px] uppercase w-[53.95px]">
          <p className="leading-[15px] whitespace-pre-wrap">92% Done</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder18() {
  return (
    <div className="bg-[#1a1c18] relative rounded-[8px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container177 />
          <Container178 />
        </div>
      </div>
    </div>
  );
}

function Container179() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.7)] w-[85.98px]">
          <p className="leading-[16px] whitespace-pre-wrap">Resource Sync</p>
        </div>
      </div>
    </div>
  );
}

function Container180() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center relative">
        <div className="bg-[#7a826d] rounded-[9999px] shrink-0 size-[6px]" data-name="Background" />
        <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[10px] tracking-[0.25px] uppercase w-[38.97px]">
          <p className="leading-[15px] whitespace-pre-wrap">Active</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder19() {
  return (
    <div className="bg-[#1a1c18] relative rounded-[8px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container179 />
          <Container180 />
        </div>
      </div>
    </div>
  );
}

function Container181() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.7)] w-[91.2px]">
          <p className="leading-[16px] whitespace-pre-wrap">Batch Exporting</p>
        </div>
      </div>
    </div>
  );
}

function Container182() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.3)] uppercase w-[54.56px]">
          <p className="leading-[15px] whitespace-pre-wrap">Waiting...</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder20() {
  return (
    <div className="bg-[#1a1c18] opacity-50 relative rounded-[8px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[17px] relative w-full">
          <Container181 />
          <Container182 />
        </div>
      </div>
    </div>
  );
}

function Container176() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <BackgroundBorder18 />
        <BackgroundBorder19 />
        <BackgroundBorder20 />
      </div>
    </div>
  );
}

function BackgroundBorder17() {
  return (
    <div className="absolute bg-[#252822] content-stretch flex flex-col items-start left-[837.33px] p-[33px] right-0 rounded-[12px] top-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" data-name="Overlay+Shadow" />
      <Margin12 />
      <Heading3Margin />
      <Margin13 />
      <Container176 />
    </div>
  );
}

function Container185() {
  return (
    <div className="h-[19px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 18.9999">
        <g id="Container">
          <path d={svgPaths.p713f7c0} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder6() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center left-0 p-px rounded-[6px] size-[40px] top-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container185 />
    </div>
  );
}

function Heading16() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[64px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white w-[175.48px]">
        <p className="leading-[28px] whitespace-pre-wrap">Smart Documents</p>
      </div>
    </div>
  );
}

function Container186() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.625px] right-0 top-[102.88px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-[491.14px] whitespace-pre-wrap">
        <p className="mb-0">Bank-grade encryption and automated indexing for instant retrieval across</p>
        <p>departments.</p>
      </div>
    </div>
  );
}

function Container184() {
  return (
    <div className="h-[173.5px] relative shrink-0 w-[513.98px]" data-name="Container">
      <OverlayBorder6 />
      <Heading16 />
      <Container186 />
    </div>
  );
}

function Container183() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative w-full">
        <Container184 />
        <div className="h-[15px] relative shrink-0 w-[19px]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9999 14.9999">
            <path d={svgPaths.p3043b600} fill="var(--fill-0, #7A826D)" id="Icon" opacity="0.2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Margin14() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-12px] relative shrink-0 size-[36px]" data-name="Margin">
      <div className="bg-[rgba(255,255,255,0.15)] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Overlay+Border">
        <div aria-hidden="true" className="absolute border-2 border-[#252822] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Margin15() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-12px] relative shrink-0 size-[36px]" data-name="Margin">
      <div className="bg-[rgba(255,255,255,0.2)] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Overlay+Border">
        <div aria-hidden="true" className="absolute border-2 border-[#252822] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function BackgroundBorder22() {
  return (
    <div className="bg-[#7a826d] content-stretch flex items-center justify-center pb-[11px] pt-[10px] px-[2px] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-[#252822] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[17.41px]">
        <p className="leading-[15px] whitespace-pre-wrap">+12</p>
      </div>
    </div>
  );
}

function Margin16() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-12px] relative shrink-0 size-[36px]" data-name="Margin">
      <BackgroundBorder22 />
    </div>
  );
}

function Container187() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pr-[12px] relative w-full">
        <div className="bg-[rgba(255,255,255,0.1)] mr-[-12px] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Overlay+Border">
          <div aria-hidden="true" className="absolute border-2 border-[#252822] border-solid inset-0 pointer-events-none rounded-[9999px]" />
        </div>
        <Margin14 />
        <Margin15 />
        <Margin16 />
      </div>
    </div>
  );
}

function BackgroundBorder21() {
  return (
    <div className="absolute bg-[#252822] content-stretch flex flex-col gap-[16px] items-start left-0 p-[33px] right-[628px] rounded-[12px] top-[457.5px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" data-name="Overlay+Shadow" />
      <Container183 />
      <Container187 />
    </div>
  );
}

function Container188() {
  return (
    <div className="h-[18.942px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 18.9422">
        <g id="Container">
          <path d={svgPaths.p3919a3dc} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder7() {
  return (
    <div className="bg-[rgba(122,130,109,0.1)] content-stretch flex items-center justify-center p-px relative rounded-[9999px] shrink-0 size-[64px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(122,130,109,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container188 />
    </div>
  );
}

function Margin17() {
  return (
    <div className="absolute content-stretch flex flex-col h-[88px] items-start left-[269px] pb-[24px] top-[58px] w-[64px]" data-name="Margin">
      <OverlayBorder7 />
    </div>
  );
}

function Heading17() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-white w-[155.63px]">
        <p className="leading-[28px] whitespace-pre-wrap">SOC-2 Certified</p>
      </div>
    </div>
  );
}

function Heading3Margin1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[223.19px] pb-[12px] top-[146px]" data-name="Heading 3:margin">
      <Heading17 />
    </div>
  );
}

function Container189() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-center left-1/2 max-w-[320px] pb-[0.625px] px-[13.8px] top-[calc(50%+63.44px)]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] text-center w-[292.4px] whitespace-pre-wrap">
        <p className="mb-0">Meeting the highest standards of enterprise</p>
        <p>security and data privacy protocols globally.</p>
      </div>
    </div>
  );
}

function BackgroundBorder23() {
  return (
    <div className="absolute bg-[#252822] border border-[rgba(255,255,255,0.05)] border-solid h-[291.5px] left-[628px] right-0 rounded-[12px] top-[457.5px]" data-name="Background+Border">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[-1px] rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" data-name="Overlay+Shadow" />
      <Margin17 />
      <Heading3Margin1 />
      <Container189 />
    </div>
  );
}

function Container162() {
  return (
    <div className="h-[749px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorderShadow12 />
      <BackgroundBorder17 />
      <BackgroundBorder21 />
      <BackgroundBorder23 />
    </div>
  );
}

function Container159() {
  return (
    <div className="max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[48px] items-start max-w-[inherit] px-[24px] relative w-full">
        <Container160 />
        <Container162 />
      </div>
    </div>
  );
}

function Section3() {
  return (
    <div className="absolute bg-[#1a1c18] content-stretch flex flex-col items-start left-0 overflow-clip py-[96px] right-0 top-[4369.69px]" data-name="Section">
      <div className="absolute inset-[0_0_-0.09px_0]" data-name="Gradient" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1280 1127.1\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(170.48 0 0 170.64 0 0)\\'><stop stop-color=\\'rgba(122,130,109,0.05)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(122,130,109,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>')" }} />
      <Container159 />
    </div>
  );
}

function Heading18() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[58px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[48px] text-center tracking-[-1.2px] w-[863.45px]">
        <p className="leading-[57.6px] whitespace-pre-wrap">Proven Success Across Every Industry</p>
      </div>
    </div>
  );
}

function Container191() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[18px] text-center w-[446.94px]">
        <p className="leading-[29.25px] whitespace-pre-wrap">Real numbers from companies that made the switch.</p>
      </div>
    </div>
  );
}

function Container190() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[14px] text-center tracking-[1.4px] uppercase w-[62.86px]">
        <p className="leading-[21px] whitespace-pre-wrap">Impact</p>
      </div>
      <Heading18 />
      <Container191 />
    </div>
  );
}

function Heading19() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[36px] w-full">
          <p className="leading-[40px] whitespace-pre-wrap">40%</p>
        </div>
      </div>
    </div>
  );
}

function Container193() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(51,51,51,0.8)] tracking-[0.7px] uppercase w-full">
          <p className="leading-[20px] whitespace-pre-wrap">Productivity Gain</p>
        </div>
      </div>
    </div>
  );
}

function Container194() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[6.75px] relative w-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-full whitespace-pre-wrap">
          <p className="mb-0">Average increase in operational speed</p>
          <p className="mb-0">reported by our mid-market partners within the</p>
          <p>first 6 months.</p>
        </div>
      </div>
    </div>
  );
}

function Container195() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-end justify-center relative size-full">
        <div className="bg-[rgba(122,130,109,0.1)] flex-[1_0_0] h-[12.8px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Overlay" />
        <div className="bg-[rgba(122,130,109,0.15)] flex-[1_0_0] h-[22.39px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Overlay" />
        <div className="bg-[rgba(122,130,109,0.2)] flex-[1_0_0] h-[32px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Overlay" />
        <div className="bg-[rgba(122,130,109,0.3)] flex-[1_0_0] h-[28.8px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Overlay" />
        <div className="bg-[rgba(122,130,109,0.5)] flex-[1_0_0] h-[48px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Overlay" />
        <div className="bg-[#7a826d] flex-[1_0_0] h-[57.59px] min-h-px min-w-px rounded-tl-[2px] rounded-tr-[2px]" data-name="Background" />
      </div>
    </div>
  );
}

function BackgroundBorderShadow13() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[33px] relative rounded-[8px] self-stretch shrink-0 w-[378.66px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05),0px_1px_2px_0px_rgba(0,0,0,0.02)]" />
      <Heading19 />
      <Container193 />
      <Container194 />
      <Container195 />
    </div>
  );
}

function Heading20() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[36px] w-full">
          <p className="leading-[40px] whitespace-pre-wrap">Zero</p>
        </div>
      </div>
    </div>
  );
}

function Container196() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(51,51,51,0.8)] tracking-[0.7px] uppercase w-full">
          <p className="leading-[20px] whitespace-pre-wrap">Paper Management</p>
        </div>
      </div>
    </div>
  );
}

function Container197() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[16px] pt-[6.75px] relative w-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-full whitespace-pre-wrap">
          <p className="mb-0">100% cloud-native document storage with</p>
          <p className="mb-0">OCR capability and secure digital archiving for</p>
          <p>audit trails.</p>
        </div>
      </div>
    </div>
  );
}

function Container198() {
  return (
    <div className="h-[19px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 18.9999">
        <g id="Container">
          <path d={svgPaths.p713f7c0} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#e8eae4] flex-[1_0_0] h-[6px] min-h-px min-w-px relative rounded-[9999px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <div className="bg-[#7a826d] flex-[1_0_0] min-h-px min-w-px w-full" data-name="Background" />
      </div>
    </div>
  );
}

function BackgroundBorder24() {
  return (
    <div className="bg-[#f8f9f7] relative rounded-[4px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.99px] items-center p-[17px] relative w-full">
          <Container198 />
          <Background7 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorderShadow14() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[33px] relative rounded-[8px] self-stretch shrink-0 w-[378.67px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05),0px_1px_2px_0px_rgba(0,0,0,0.02)]" />
      <Heading20 />
      <Container196 />
      <Container197 />
      <BackgroundBorder24 />
    </div>
  );
}

function Heading21() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[36px] w-full">
          <p className="leading-[40px] whitespace-pre-wrap">24/7</p>
        </div>
      </div>
    </div>
  );
}

function Container199() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(51,51,51,0.8)] tracking-[0.7px] uppercase w-full">
          <p className="leading-[20px] whitespace-pre-wrap">Expert Support</p>
        </div>
      </div>
    </div>
  );
}

function Container200() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[6.75px] relative w-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#666] text-[14px] w-full whitespace-pre-wrap">
          <p className="mb-0">Direct access to ERP implementation experts</p>
          <p className="mb-0">and a dedicated account manager for</p>
          <p>enterprise plans.</p>
        </div>
      </div>
    </div>
  );
}

function Margin18() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[36px]" data-name="Margin">
      <div className="bg-[rgba(122,130,109,0.2)] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Overlay+Border">
        <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Margin19() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[36px]" data-name="Margin">
      <div className="bg-[rgba(122,130,109,0.4)] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Overlay+Border">
        <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function BackgroundBorder25() {
  return (
    <div className="bg-[#7a826d] content-stretch flex items-center justify-center pb-[11px] pt-[10px] px-[2px] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[17.41px]">
        <p className="leading-[15px] whitespace-pre-wrap">+12</p>
      </div>
    </div>
  );
}

function Margin20() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[36px]" data-name="Margin">
      <BackgroundBorder25 />
    </div>
  );
}

function Container201() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pr-[8px] pt-[16px] relative w-full">
        <div className="bg-[#e8eae4] mr-[-8px] relative rounded-[9999px] shrink-0 size-[36px]" data-name="Background+Border">
          <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
        </div>
        <Margin18 />
        <Margin19 />
        <Margin20 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow15() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[33px] relative rounded-[8px] self-stretch shrink-0 w-[378.66px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#e8eae4] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05),0px_1px_2px_0px_rgba(0,0,0,0.02)]" />
      <Heading21 />
      <Container199 />
      <Container200 />
      <Container201 />
    </div>
  );
}

function Container192() {
  return (
    <div className="content-stretch flex gap-[48px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <BackgroundBorderShadow13 />
      <BackgroundBorderShadow14 />
      <BackgroundBorderShadow15 />
    </div>
  );
}

function Section4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[48.01px] items-start left-0 max-w-[1280px] px-[24px] right-0 top-[96px]" data-name="Section">
      <Container190 />
      <Container192 />
    </div>
  );
}

function Border() {
  return (
    <div className="content-stretch flex flex-col items-center px-[18px] py-[8px] relative self-stretch shrink-0" data-name="Border">
      <div aria-hidden="true" className="absolute border-2 border-[#333] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-center tracking-[1.4px] uppercase w-[43.97px]">
        <p className="leading-[20px] whitespace-pre-wrap">APEX</p>
      </div>
    </div>
  );
}

function Container203() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Border />
    </div>
  );
}

function Blockquote() {
  return (
    <div className="relative shrink-0 w-full" data-name="Blockquote">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[16px] relative w-full">
          <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[144px] justify-center leading-[48px] not-italic relative shrink-0 text-[#333] text-[48px] text-center tracking-[-1.2px] w-[829.89px] whitespace-pre-wrap">
            <p className="mb-0">{`"Bizak is the first ERP that actually`}</p>
            <p className="mb-0">understands the complexity of global</p>
            <p>{`operations without the typical bloat."`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DavidRichardson() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="David Richardson">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgDavidRichardson} />
      </div>
    </div>
  );
}

function OverlayShadow() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[80px]" data-name="Overlay+Shadow">
      <DavidRichardson />
    </div>
  );
}

function Margin21() {
  return (
    <div className="content-stretch flex flex-col h-[104px] items-start pb-[24px] relative shrink-0 w-[80px]" data-name="Margin">
      <OverlayShadow />
    </div>
  );
}

function Container206() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[11px] text-center tracking-[2.2px] uppercase w-[208.78px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">CEO, Apex Manufacturing</p>
      </div>
    </div>
  );
}

function Margin22() {
  return (
    <div className="content-stretch flex flex-col items-start mb-[-0.25px] pt-[4px] relative shrink-0" data-name="Margin">
      <Container206 />
    </div>
  );
}

function Container205() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.25px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[17px] justify-center leading-[0] mb-[-0.25px] not-italic relative shrink-0 text-[#333] text-[11px] text-center tracking-[2.2px] uppercase w-[146px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">David Richardson</p>
      </div>
      <Margin22 />
    </div>
  );
}

function Container204() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Margin21 />
      <Container205 />
    </div>
  );
}

function Container202() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start max-w-[896px] relative shrink-0 w-full" data-name="Container">
      <Container203 />
      <Blockquote />
      <Container204 />
    </div>
  );
}

function Section5() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 px-[192px] py-[96px] right-0 top-[654.1px]" data-name="Section">
      <Container202 />
    </div>
  );
}

function Container209() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.pf778600} fill="var(--fill-0, #7A826D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder26() {
  return (
    <div className="bg-[#333] content-stretch flex items-center justify-center p-px relative rounded-[8px] shrink-0 size-[56px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(255,255,255,0)] left-1/2 rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[56px] top-1/2" data-name="Overlay+Shadow" />
      <Container209 />
    </div>
  );
}

function Margin23() {
  return (
    <div className="absolute content-stretch flex flex-col h-[56px] items-start left-[556px] px-[32px] top-0 w-[120px]" data-name="Margin">
      <BackgroundBorder26 />
    </div>
  );
}

function Container208() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div className="-translate-y-1/2 absolute bg-gradient-to-l from-[rgba(122,130,109,0.5)] h-[2px] left-0 right-[676px] to-[rgba(122,130,109,0)] top-1/2" data-name="Horizontal Divider" />
      <div className="-translate-y-1/2 absolute bg-gradient-to-r from-[rgba(122,130,109,0.5)] h-[2px] left-[676px] right-0 to-[rgba(122,130,109,0)] top-1/2" data-name="Horizontal Divider" />
      <Margin23 />
    </div>
  );
}

function Heading22() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[116px] justify-center leading-[57.6px] not-italic relative shrink-0 text-[#333] text-[48px] text-center tracking-[-1.2px] w-[662.88px] whitespace-pre-wrap">
        <p className="mb-0">Powering modern enterprises</p>
        <p>across the globe</p>
      </div>
    </div>
  );
}

function Container212() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[11px] text-center tracking-[2.2px] uppercase w-[225.69px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Active businesses powered</p>
      </div>
    </div>
  );
}

function Margin24() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0" data-name="Margin">
      <Container212 />
    </div>
  );
}

function Container213() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[60px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[60px] text-center tracking-[-1.5px] w-[245.94px]">
        <p className="leading-[60px] whitespace-pre-wrap">50,000+</p>
      </div>
    </div>
  );
}

function Margin25() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0" data-name="Margin">
      <Container213 />
    </div>
  );
}

function Container211() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Margin24 />
      <Margin25 />
    </div>
  );
}

function Container215() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[11px] text-center tracking-[2.2px] uppercase w-[176.17px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Countries supported</p>
      </div>
    </div>
  );
}

function Margin26() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0" data-name="Margin">
      <Container215 />
    </div>
  );
}

function Container216() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[60px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[60px] text-center tracking-[-1.5px] w-[138.84px]">
        <p className="leading-[60px] whitespace-pre-wrap">120+</p>
      </div>
    </div>
  );
}

function Margin27() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0" data-name="Margin">
      <Container216 />
    </div>
  );
}

function Container214() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Margin26 />
      <Margin27 />
    </div>
  );
}

function Container218() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[#7a826d] text-[11px] text-center tracking-[2.2px] uppercase w-[210.27px]">
        <p className="leading-[16.5px] whitespace-pre-wrap">Annual revenue managed</p>
      </div>
    </div>
  );
}

function Margin28() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0" data-name="Margin">
      <Container218 />
    </div>
  );
}

function Container219() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[60px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[60px] text-center tracking-[-1.5px] w-[190px]">
        <p className="leading-[60px] whitespace-pre-wrap">$50B+</p>
      </div>
    </div>
  );
}

function Margin29() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0" data-name="Margin">
      <Container219 />
    </div>
  );
}

function Container217() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Margin28 />
      <Margin29 />
    </div>
  );
}

function Container210() {
  return (
    <div className="content-stretch flex gap-[64px] items-start justify-center pt-[32.69px] relative shrink-0 w-full" data-name="Container">
      <Container211 />
      <Container214 />
      <Container217 />
    </div>
  );
}

function Container207() {
  return (
    <div className="max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[47.3px] items-center max-w-[inherit] px-[24px] relative w-full">
          <Container208 />
          <Heading22 />
          <Container210 />
        </div>
      </div>
    </div>
  );
}

function Section6() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 overflow-clip py-[96px] right-0 top-[1279.1px]" data-name="Section">
      <Container207 />
    </div>
  );
}

function Background6() {
  return (
    <div className="absolute bg-white h-[1870.78px] left-0 right-0 top-[5495.78px]" data-name="Background">
      <Section4 />
      <Section5 />
      <Section6 />
    </div>
  );
}

function Container220() {
  return (
    <div className="absolute inset-[0_0_0.11px_0] overflow-clip" data-name="Container">
      <div className="absolute bottom-[-145.05px] h-[580.19px] left-[-128px] w-[1536px]" data-name="Gradient" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1536 580.19\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(82.096 0 0 82.096 768 290.1)\\'><stop stop-color=\\'rgba(122,130,109,0.1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(122,130,109,0)\\' offset=\\'0.7\\'/></radialGradient></defs></svg>')" }} />
      <div className="absolute bg-[rgba(122,130,109,0.1)] blur-[50px] right-[-80px] rounded-[9999px] size-[384px] top-[145.05px]" data-name="Overlay+Blur" />
    </div>
  );
}

function Heading23() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[116px] justify-center leading-[57.6px] not-italic relative shrink-0 text-[48px] text-center text-white tracking-[-1.2px] w-[750.22px] whitespace-pre-wrap">
        <p className="mb-0">Experience the future of business</p>
        <p>operations.</p>
      </div>
    </div>
  );
}

function Container222() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[65px] justify-center leading-[32.5px] not-italic relative shrink-0 text-[20px] text-[rgba(255,255,255,0.5)] text-center w-[668.89px] whitespace-pre-wrap">
        <p className="mb-0">Join 50,000+ companies scaling with Bizak. Start your 14-day free trial</p>
        <p>today.</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <a href="https://system.bizakerp.com/account/self-register" target="_blank" rel="noopener noreferrer">
      <div className="bg-[#7a826d] content-stretch flex flex-col items-center justify-center px-[40px] py-[20px] relative rounded-[6px] shrink-0" data-name="Button">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[6px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-name="Button:shadow" />
        <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white w-[121.42px]">
          <p className="leading-[28px] whitespace-pre-wrap">Start free trial</p>
        </div>
      </div>
    </a>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[42px] py-[22px] relative rounded-[6px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white w-[112.95px]">
        <p className="leading-[28px] whitespace-pre-wrap">Book a demo</p>
      </div>
    </div>
  );
}

function Container223() {
  return (
    <div className="content-stretch flex gap-[24px] items-center justify-center pt-[24px] relative shrink-0 w-full" data-name="Container">
      <Button3 />
      <Button4 />
    </div>
  );
}

function Container221() {
  return (
    <div className="max-w-[896px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-center max-w-[inherit] px-[24px] relative w-full">
          <Heading23 />
          <Container222 />
          <Container223 />
        </div>
      </div>
    </div>
  );
}

function Section7() {
  return (
    <div className="absolute bg-[#121212] content-stretch flex flex-col items-start left-0 overflow-clip pb-[128px] pt-[127.3px] px-[192px] right-0 top-[7366.56px]" data-name="Section">
      <Container220 />
      <Container221 />
    </div>
  );
}

function Main() {
  return (
    <div className="h-[7946.75px] relative shrink-0 w-full" data-name="Main">
      <Section />
      <Section1 />
      <Section2 />
      <Section3 />
      <Background6 />
      <Section7 />
    </div>
  );
}

function Container228() {
  return (
    <div className="h-[18.422px] relative shrink-0 w-[18.416px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4161 18.4217">
        <g id="Container">
          <path d={svgPaths.p10b1cb80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#7a826d] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container228 />
    </div>
  );
}

function Container229() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white tracking-[-0.5px] w-[50.83px]">
        <p className="leading-[28px] whitespace-pre-wrap">Bizak</p>
      </div>
    </div>
  );
}

function Container227() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Background8 />
      <Container229 />
    </div>
  );
}

function Container230() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[320px] relative shrink-0 w-[320px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[69px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-[310.69px] whitespace-pre-wrap">
        <p className="mb-0">Empowering modern businesses with an all-in-</p>
        <p className="mb-0">one ERP that is flexible, powerful, and easy to</p>
        <p>use.</p>
      </div>
    </div>
  );
}

function Container226() {
  return (
    <div className="content-stretch flex flex-col gap-[22.75px] items-start relative self-stretch shrink-0 w-[464px]" data-name="Container">
      <Container227 />
      <Container230 />
    </div>
  );
}

function Heading24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-white tracking-[0.55px] uppercase w-full">
        <p className="leading-[16.5px] whitespace-pre-wrap">Product</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Features</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Pricing</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Integrations</p>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Changelog</p>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="List">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Container231() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative self-stretch shrink-0 w-[208px]" data-name="Container">
      <Heading24 />
      <List />
    </div>
  );
}

function Heading25() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-white tracking-[0.55px] uppercase w-full">
        <p className="leading-[16.5px] whitespace-pre-wrap">Resources</p>
      </div>
    </div>
  );
}

function Item4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Documentation</p>
      </div>
    </div>
  );
}

function Item5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Help Center</p>
      </div>
    </div>
  );
}

function Item6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Blog</p>
      </div>
    </div>
  );
}

function Item7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Customer Stories</p>
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="List">
      <Item4 />
      <Item5 />
      <Item6 />
      <Item7 />
    </div>
  );
}

function Container232() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative self-stretch shrink-0 w-[208px]" data-name="Container">
      <Heading25 />
      <List1 />
    </div>
  );
}

function Heading26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-white tracking-[0.55px] uppercase w-full">
        <p className="leading-[16.5px] whitespace-pre-wrap">Company</p>
      </div>
    </div>
  );
}

function Item8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">About Us</p>
      </div>
    </div>
  );
}

function Item9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Careers</p>
      </div>
    </div>
  );
}

function Item10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Contact</p>
      </div>
    </div>
  );
}

function Item11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.4)] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">Privacy Policy</p>
      </div>
    </div>
  );
}

function List2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="List">
      <Item8 />
      <Item9 />
      <Item10 />
      <Item11 />
    </div>
  );
}

function Container233() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative self-stretch shrink-0 w-[208px]" data-name="Container">
      <Heading26 />
      <List2 />
    </div>
  );
}

function Container225() {
  return (
    <div className="content-stretch flex gap-[48px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container226 />
      <Container231 />
      <Container232 />
      <Container233 />
    </div>
  );
}

function Container234() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.2)] w-[287px]">
          <p className="leading-[16.5px] whitespace-pre-wrap">© 2024 BIZAK SYSTEMS INC. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="relative shrink-0 size-[19px]" data-name="Link">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9999 18.9999">
        <g id="Link">
          <path d={svgPaths.p1a75c680} fill="var(--fill-0, white)" fillOpacity="0.2" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[15px] relative shrink-0 w-[19px]" data-name="Link">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9999 14.9999">
        <g id="Link">
          <path d={svgPaths.p3f52f0c0} fill="var(--fill-0, white)" fillOpacity="0.2" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link3() {
  return (
    <div className="h-[19px] relative shrink-0 w-[17px]" data-name="Link">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.9999 18.9999">
        <g id="Link">
          <path d={svgPaths.p9aabd00} fill="var(--fill-0, white)" fillOpacity="0.2" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container235() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative">
        <Link1 />
        <Link2 />
        <Link3 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex items-center justify-between pt-[33px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.05)] border-solid border-t inset-0 pointer-events-none" />
      <Container234 />
      <Container235 />
    </div>
  );
}

function Container224() {
  return (
    <div className="max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[64px] items-start max-w-[inherit] px-[24px] relative w-full">
        <Container225 />
        <HorizontalBorder />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="bg-[#121212] content-stretch flex flex-col items-start pb-[64px] pt-[65px] relative shrink-0 w-full" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.05)] border-solid border-t inset-0 pointer-events-none" />
      <Container224 />
    </div>
  );
}

function Container239() {
  return (
    <div className="h-[18.422px] relative shrink-0 w-[18.416px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4161 18.4217">
        <g id="Container">
          <path d={svgPaths.p10b1cb80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#7a826d] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container239 />
    </div>
  );
}

function Container240() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[20px] tracking-[-0.5px] w-[50.83px]">
        <p className="leading-[28px] whitespace-pre-wrap">Bizak</p>
      </div>
    </div>
  );
}

function Container238() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Background9 />
      <Container240 />
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(51,51,51,0.7)] w-[62.17px]">
        <p className="leading-[20px] whitespace-pre-wrap">Solutions</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(51,51,51,0.7)] w-[57.61px]">
        <p className="leading-[20px] whitespace-pre-wrap">Modules</p>
      </div>
    </div>
  );
}

function Link6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(51,51,51,0.7)] w-[46.75px]">
        <p className="leading-[20px] whitespace-pre-wrap">Pricing</p>
      </div>
    </div>
  );
}

function Link7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(51,51,51,0.7)] w-[70.52px]">
        <p className="leading-[20px] whitespace-pre-wrap">Resources</p>
      </div>
    </div>
  );
}

function Container241() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Container">
      <Link4 />
      <Link5 />
      <Link6 />
      <Link7 />
    </div>
  );
}

function Container237() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Container">
      <Container238 />
      <Container241 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center px-[16px] py-[8px] relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[40.97px]">
        <p className="leading-[20px] whitespace-pre-wrap">Log in</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#7a826d] content-stretch flex flex-col items-center justify-center px-[20px] py-[8px] relative rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[98.02px]">
        <p className="leading-[20px] whitespace-pre-wrap">Start your trial</p>
      </div>
    </div>
  );
}

function Container242() {
  return (
    <div className="content-stretch flex gap-[15.99px] items-center relative shrink-0" data-name="Container">
      <Button5 />
      <Button6 />
    </div>
  );
}

function Container236() {
  return (
    <div className="h-[64px] max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between max-w-[inherit] px-[24px] relative size-full">
          <Container237 />
          <Container242 />
        </div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="absolute backdrop-blur-[8px] bg-[rgba(255,255,255,0.7)] content-stretch flex flex-col items-start left-0 p-px top-0 w-[1280px]" data-name="Nav">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none" />
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-0 left-0 shadow-[0px_12px_40px_-12px_rgba(0,0,0,0.1)] top-0 w-[1280px]" data-name="Nav:shadow" />
      <Container236 />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#f8f9f7] content-stretch flex flex-col items-start relative size-full" data-name="Home Page">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] w-[48.08px]">
        <p className="leading-[24px] whitespace-pre-wrap">```html</p>
      </div>
      <Main />
      <Footer />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] w-[15.5px]">
        <p className="leading-[24px] whitespace-pre-wrap">```</p>
      </div>
      <Nav />
    </div>
  );
}