import * as React from "react";
import { cn } from "../ui/utils";

// The section-opening label. Two visual modes:
//   <Eyebrow>How it works</Eyebrow>                       → "HOW IT WORKS"
//   <Eyebrow index="01">How it works</Eyebrow>            → "[01] HOW IT WORKS"
//
// `tone` describes the SURFACE this label sits on (same convention as
// <Section>). tone="light" (default) → renders dark text on light bg.
// tone="dark" → renders muted-paper text for dark surfaces.
//
// Paint: .bz-eyebrow / .bz-eyebrow-light in style.css.

export type EyebrowProps = {
  /** Optional bracketed index prefix — e.g. "01" renders as "[01]". */
  index?: string;
  /** The SURFACE this element sits on. "light" = light bg, dark text (default). "dark" = dark bg, paper text. */
  tone?: "light" | "dark";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">;

export function Eyebrow({
  index,
  tone = "light",
  className,
  children,
  ...rest
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "bz-eyebrow",
        tone === "dark" && "bz-eyebrow-light",
        className,
      )}
      {...rest}
    >
      {index && <span style={{ marginRight: 6 }}>[{index}]</span>}
      {children}
    </span>
  );
}
