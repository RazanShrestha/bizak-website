import * as React from "react";
import { cn } from "../ui/utils";
import { Eyebrow } from "./Eyebrow";
import { Heading } from "./Heading";

// Opening row at the top of every content section:
//
//   [01] HOW IT WORKS
//   Replace spreadsheets and run smoothly,
//   across every part of your business.                         [Get Started] [Book a demo]
//
// The `actions` slot is a flex row of CTAs (typically two <Pill>s).
// When `actions` is provided, the title and actions are laid out as
// flex-row on desktop (title left, actions right, both end-aligned),
// stacked on mobile.
//
//   <SectionHead
//     index="01"
//     label="How it works"
//     title={<>Replace spreadsheets, <Heading.Muted>run smoothly.</Heading.Muted></>}
//     actions={<><Pill variant="dark" withTick>Get Started</Pill><Pill variant="light">Book a demo</Pill></>}
//   />

export type SectionHeadProps = {
  /** Bracketed index — e.g. "01" renders "[01]". Optional. */
  index?: string;
  /** The uppercase label after the index. */
  label?: React.ReactNode;
  /** Section title (h2). */
  title: React.ReactNode;
  /** Optional inline description below the title. */
  description?: React.ReactNode;
  /** Optional CTA row (right-aligned on desktop, stacked on mobile). */
  actions?: React.ReactNode;
  /** The SURFACE this section head sits on. "light" = light bg, dark text (default). "dark" = dark bg, paper text. Matches <Section> convention. */
  tone?: "light" | "dark";
  /** Max-width override on the title for narrower copy blocks. */
  titleMaxWidth?: number | string;
  className?: string;
  /** Bottom margin before the section body. Default 56px desktop / 40px mobile. */
  spacing?: "default" | "tight" | "none";
};

const SPACING_CLASS: Record<NonNullable<SectionHeadProps["spacing"]>, string> = {
  default: "mb-10 md:mb-14",
  tight: "mb-6 md:mb-8",
  none: "",
};

export function SectionHead({
  index,
  label,
  title,
  description,
  actions,
  tone = "light",
  titleMaxWidth,
  className,
  spacing = "default",
}: SectionHeadProps) {
  return (
    <div className={cn("flex flex-col", SPACING_CLASS[spacing], className)}>
      {(index || label) && (
        <Eyebrow index={index} tone={tone} className="mb-4 md:mb-5">
          {label}
        </Eyebrow>
      )}
      {actions ? (
        <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-8">
          <Heading
            level={2}
            tone={tone}
            style={titleMaxWidth ? { maxWidth: titleMaxWidth } : undefined}
            className="flex-1"
          >
            {title}
          </Heading>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
      ) : (
        <Heading
          level={2}
          tone={tone}
          style={titleMaxWidth ? { maxWidth: titleMaxWidth } : undefined}
        >
          {title}
        </Heading>
      )}
      {description && (
        <p
          className={cn(
            "mt-4 max-w-[640px] text-[15px] leading-[1.65]",
            tone === "dark" ? "text-white/[0.72]" : "text-bz-text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
