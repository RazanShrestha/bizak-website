import * as React from "react";
import { cn } from "../ui/utils";

// The pistachio confetti pill used in the hero badge slot.
//   <BadgeGreen>Now Live, Globally 🎉</BadgeGreen>
//
// Paint: .bz-badge-green in style.css.
// Use ONLY in the hero badge slot — non-hero contexts use <StatusChip>.

export type BadgeGreenProps = {
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

export function BadgeGreen({ className, children, ...rest }: BadgeGreenProps) {
  return (
    <span className={cn("bz-badge-green", className)} {...rest}>
      {children}
    </span>
  );
}
