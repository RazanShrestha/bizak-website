import * as React from "react";
import { cn } from "../ui/utils";

// Inter heading at the canonical type scale. Compound:
//   <Heading level={1}>
//     Replace spreadsheets,
//     <Heading.Muted> across every part of your business.</Heading.Muted>
//   </Heading>
//
// `tone` describes the SURFACE this heading sits on (same convention as
// <Section>). tone="light" (default) renders dark text on light bg.
// tone="dark" renders paper text on dark bg. <Heading.Muted> picks up the
// parent tone via context and switches its muted colour accordingly.
//
// Paint: .bz-h1 / .bz-h2 in style.css. Inter weight 500.

type HeadingLevel = 1 | 2 | 3;
type HeadingTone = "light" | "dark";

const HeadingToneContext = React.createContext<HeadingTone>("light");

export type HeadingProps = {
  level?: HeadingLevel;
  /** The SURFACE this heading sits on. "light" = light bg, dark text (default). "dark" = dark bg, paper text. */
  tone?: HeadingTone;
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
  tone = "light",
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = (`h${level}` as unknown) as keyof React.JSX.IntrinsicElements;
  return (
    <HeadingToneContext.Provider value={tone}>
      <Tag
        className={cn(
          LEVEL_CLASS[level],
          tone === "dark" ? "text-bz-text-on-dark" : "text-bz-text-heading",
          className,
        )}
        {...rest}
      >
        {children}
      </Tag>
    </HeadingToneContext.Provider>
  );
}

// Inline span that renders the "second-clause" muted span inside a heading.
// Always rendered as <span> — never breaks heading semantics.
// Inherits surface tone from the parent <Heading> via context so it stays
// legible on both light and dark surfaces.
function HeadingMuted({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  const tone = React.useContext(HeadingToneContext);
  return (
    <span
      className={cn(
        tone === "dark" ? "text-white/[0.72]" : "bz-h2-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export const Heading = Object.assign(HeadingRoot, {
  Muted: HeadingMuted,
});
