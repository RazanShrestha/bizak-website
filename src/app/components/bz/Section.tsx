import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../ui/utils";

// Section wrapper for marketing content blocks. Encodes:
//  - the alternating background tones (a/b) — the new visual rhythm
//  - the section vertical padding from theme.css (--bz-section-y)
//  - the dark olive variant for showcase blocks
//
// Pages alternate `tone="a"` and `tone="b"` between consecutive content
// sections (e.g., hero(b) → §01(a) → §02(b) → §03(a) → testimonials(b) → FAQ(a)).
// `tone="dark"` is used sparingly for showcase / connectivity sections.
//
// Padding default = the generous spec from --bz-section-y (140 / 110 / 80).
// `pad="tight"` = --bz-section-y-tight (96 / 72 / 56).

const sectionVariants = cva("relative w-full", {
  variants: {
    tone: {
      a: "bg-bz-section-a text-bz-text",
      b: "bg-bz-section-b text-bz-text",
      dark: "bg-bz-olive text-bz-text-on-dark",
      paper: "bg-bz-paper text-bz-text",
    },
    pad: {
      default: "py-[80px] md:py-[110px] xl:py-[140px]",
      tight: "py-[56px] md:py-[72px] xl:py-[96px]",
      hero: "pt-[56px] pb-[80px] md:pt-[80px] md:pb-[96px]",
      none: "",
    },
  },
  defaultVariants: {
    tone: "a",
    pad: "default",
  },
});

export type SectionProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants>;

export function Section({
  className,
  tone,
  pad,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ tone, pad }), className)}
      {...props}
    />
  );
}
