import * as React from "react";
import { cn } from "../ui/utils";

// Small inline pill used inside cards / heroes to label a piece of data.
//   <StatusChip variant="live">Live</StatusChip>          // pistachio bg
//   <StatusChip variant="posted">Posted</StatusChip>       // neutral light bg
//   <StatusChip variant="neutral">FY2024</StatusChip>      // muted light bg
//
// Uses inline styles for the chip background/text because there are no
// existing .bz-chip-* classes yet (the staged HomePage rolls these inline).
// If you find yourself adding a fourth variant, lift them into style.css.

type StatusChipVariant = "live" | "posted" | "neutral";

export type StatusChipProps = {
  variant?: StatusChipVariant;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

const VARIANT_CLASS: Record<StatusChipVariant, string> = {
  live: "bg-bz-leaf text-[#1F3422]",
  posted: "bg-black/[0.06] text-bz-text",
  neutral: "bg-white/[0.06] text-white/[0.85]",
};

export function StatusChip({
  variant = "neutral",
  className,
  children,
  ...rest
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-bz-pill px-[7px] py-[2px]",
        "text-[9.5px] font-semibold uppercase tracking-[0.06em]",
        VARIANT_CLASS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
