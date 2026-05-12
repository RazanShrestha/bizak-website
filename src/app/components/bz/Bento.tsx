import * as React from "react";
import { cn } from "../ui/utils";
import { DotGrid } from "./DotGrid";

// The cornerstone repeating card shape. Compound API:
//
//   <Bento tone="dark" hover dotGrid span={6}>
//     <Bento.Header
//       title={<>One ledger,<br/>every module</>}
//       icon={<Layers/>}
//     />
//     <Bento.Desc>Every transaction posts the right journals automatically.</Bento.Desc>
//     <Bento.Cta href="/x" variant="leaf">Learn more</Bento.Cta>
//     <Bento.Footer>{/* mini-viz slot — DataRow / MiniBars / etc. */}</Bento.Footer>
//   </Bento>
//
// Paint: .bz-bento + .bz-bento-<tone> classes in style.css. The `span` prop
// is used when Bento sits inside a <BentoGrid cols={12}> for asymmetric
// 12-col layouts (col-span-N). Outside that, leave span undefined.

import type { PillProps } from "./Pill";
import { Pill } from "./Pill";

type BentoTone = "dark" | "fire" | "leaf" | "paper";

export type BentoProps = {
  tone?: BentoTone;
  /** Lift + slight shadow on hover. */
  hover?: boolean;
  /** Render a <DotGrid> overlay (only sensible on tone="dark"). */
  dotGrid?: boolean;
  /** Col-span in a <BentoGrid cols={12}>. 1-12. */
  span?: number;
  /** Min-height in px. Default 220. */
  minHeight?: number;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "style">;

const TONE_CLASS: Record<BentoTone, string> = {
  dark: "bz-bento bz-bento-dark",
  fire: "bz-bento bz-bento-fire",
  leaf: "bz-bento bz-bento-leaf",
  paper: "bz-bento bz-bento-paper",
};

function BentoRoot({
  tone = "paper",
  hover,
  dotGrid,
  span,
  minHeight = 220,
  className,
  children,
  style,
  ...rest
}: BentoProps) {
  const spanClass = span
    ? `col-span-full md:col-span-${span > 6 ? "12" : span} lg:col-span-${span}`
    : undefined;
  return (
    <div
      className={cn(TONE_CLASS[tone], hover && "bz-hover-card", spanClass, className)}
      style={{ minHeight, ...style }}
      {...rest}
    >
      {dotGrid && <DotGrid tone="dark" />}
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}

// ── Header: title (left) + optional icon (right) ─────────────────────────────
function BentoHeader({
  title,
  icon,
  className,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        className,
      )}
      style={{ marginBottom: 14 }}
    >
      <h3 className="bz-bento-title">{title}</h3>
      {icon && <span className="flex-shrink-0">{icon}</span>}
    </div>
  );
}

// ── Description text ─────────────────────────────────────────────────────────
function BentoDesc({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("bz-bento-desc", className)} {...rest}>
      {children}
    </p>
  );
}

// ── CTA slot — typically a <Pill>. Delegates to <Pill> by default. ───────────
function BentoCta(props: PillProps) {
  return (
    <div className="mt-5" style={{ alignSelf: "flex-start" }}>
      <Pill {...props} />
    </div>
  );
}

// ── Footer slot — for mini-viz (DataRow / MiniBars / etc.) ───────────────────
function BentoFooter({
  className,
  children,
  tone = "auto",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "auto" | "dark" | "light" }) {
  // tone="auto" uses a subtle tint based on parent surface (transparent here;
  // the parent dark/light Bento determines visible contrast via opacity).
  // Pass tone="dark" or tone="light" if you need explicit override.
  const toneClass =
    tone === "dark"
      ? "bg-white/[0.07]"
      : tone === "light"
      ? "bg-[#F4F5EF]"
      : "";
  return (
    <div
      className={cn(
        "mt-auto rounded-bz-lg p-3",
        toneClass,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Bento = Object.assign(BentoRoot, {
  Header: BentoHeader,
  Desc: BentoDesc,
  Cta: BentoCta,
  Footer: BentoFooter,
});
