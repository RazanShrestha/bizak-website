import * as React from "react";
import { cn } from "../ui/utils";

type HeroBadgeProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Hero pill used as the eyebrow above a hero <h1>. Has the brand
 * accent→sage gradient. Pair with <Section className="biz-mesh" ...>
 * (or any hero-mesh section) for the canonical hero treatment.
 */
export function HeroBadge({ className, children, ...props }: HeroBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-bz-pill",
        "px-4 py-[5px]",
        "text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text",
        "border border-bz-sage-mid",
        "shadow-[0_1px_6px_rgba(122,130,109,0.18),inset_0_0_0_1px_rgba(255,255,255,0.4)]",
        "bg-white",
        "bg-[image:linear-gradient(135deg,rgba(199,255,53,0.55)_0%,rgba(199,255,53,0.18)_45%,rgba(122,130,109,0.22)_100%)]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
