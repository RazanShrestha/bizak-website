import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../ui/utils";

// Pistachio-circle + lime-check icon. Used as the bullet marker in step
// cards, multi-entity bullets, and as the suffix on primary pill CTAs
// (via <Pill withArrow>).
//   <Tick />
//   <Tick size="sm" />

export type TickProps = {
  size?: "sm" | "md";
  className?: string;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

export function Tick({ size = "md", className, ...rest }: TickProps) {
  const dim = size === "sm" ? 18 : 20;
  const stroke = size === "sm" ? 3 : 3;
  const icon = size === "sm" ? 10 : 11;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center rounded-bz-pill",
        "bg-bz-leaf text-[#1F3422]",
        className,
      )}
      style={{ width: dim, height: dim }}
      {...rest}
    >
      <Check size={icon} strokeWidth={stroke} />
    </span>
  );
}
