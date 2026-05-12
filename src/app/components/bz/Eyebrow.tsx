import * as React from "react";
import { cn } from "../ui/utils";

// The section-opening label. Two visual modes:
//   <Eyebrow>How it works</Eyebrow>                  → "HOW IT WORKS"
//   <Eyebrow index="01">How it works</Eyebrow>       → "[01] HOW IT WORKS"
//
// Tone "light" is for use on dark surfaces (renders with on-dark muted text).
// Paint: .bz-eyebrow / .bz-eyebrow-light in style.css.

export type EyebrowProps = {
  /** Optional bracketed index prefix — e.g. "01" renders as "[01]". */
  index?: string;
  tone?: "dark" | "light";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

export function Eyebrow({
  index,
  tone = "dark",
  className,
  children,
  ...rest
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "bz-eyebrow",
        tone === "light" && "bz-eyebrow-light",
        className,
      )}
      {...rest}
    >
      {index && <span style={{ marginRight: 6 }}>[{index}]</span>}
      {children}
    </span>
  );
}
