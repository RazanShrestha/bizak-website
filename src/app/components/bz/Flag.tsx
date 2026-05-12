import * as React from "react";
import { cn } from "../ui/utils";

// Small flag chip — wraps a country emoji in a circular paper-coloured chip.
//   <Flag>🇺🇸</Flag>
//
// Paint: .bz-flag in style.css.

export type FlagProps = {
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

export function Flag({ className, children, ...rest }: FlagProps) {
  return (
    <span className={cn("bz-flag", className)} {...rest}>
      {children}
    </span>
  );
}
