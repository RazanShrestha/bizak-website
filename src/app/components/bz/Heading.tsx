import * as React from "react";
import { cn } from "../ui/utils";

// Inter heading at the canonical type scale. Compound:
//   <Heading level={1}>
//     Replace spreadsheets,
//     <Heading.Muted> across every part of your business.</Heading.Muted>
//   </Heading>
//
// Paint: .bz-h1 / .bz-h2 in style.css. Inter weight 500.
// The Muted subcomponent uses --bz-text-soft for the "second half" tone
// of a two-clause headline.

type HeadingLevel = 1 | 2 | 3;

export type HeadingProps = {
  level?: HeadingLevel;
  tone?: "dark" | "light";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLHeadingElement>, "children">;

const LEVEL_CLASS: Record<HeadingLevel, string> = {
  1: "bz-h1",
  2: "bz-h2",
  3: "bz-h2", // h3 reuses h2 paint for now; will get its own scale when needed
};

function HeadingRoot({
  level = 2,
  tone = "dark",
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = (`h${level}` as unknown) as keyof React.JSX.IntrinsicElements;
  return (
    <Tag
      className={cn(
        LEVEL_CLASS[level],
        tone === "light" && "text-bz-text-on-dark",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Inline span that renders the "second-clause" muted span inside a heading.
// Always rendered as <span> — never breaks heading semantics.
function HeadingMuted({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("bz-h2-muted", className)} {...rest}>
      {children}
    </span>
  );
}

export const Heading = Object.assign(HeadingRoot, {
  Muted: HeadingMuted,
});
