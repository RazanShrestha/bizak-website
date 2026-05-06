import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../ui/utils";
import { Eyebrow } from "./Eyebrow";

const headingVariants = cva(
  "font-bold leading-[1.1] tracking-[-0.02em]",
  {
    variants: {
      level: {
        h1: "text-[clamp(40px,5.5vw,72px)] tracking-[-0.03em]",
        h2: "text-[clamp(30px,4vw,52px)]",
        h3: "text-[22px]",
      },
      tone: {
        dark:  "text-bz-text",
        light: "text-white",
      },
      align: {
        left: "text-left",
        center: "text-center",
      },
    },
    defaultVariants: {
      level: "h2",
      tone: "dark",
      align: "left",
    },
  },
);

type SectionHeadingProps = {
  eyebrow?: string;
  eyebrowTone?: "sage" | "accent";
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  /** Constrain text width when content gets long. */
  maxWidth?: number;
} & VariantProps<typeof headingVariants>;

export function SectionHeading({
  eyebrow,
  eyebrowTone = "sage",
  title,
  description,
  className,
  level = "h2",
  tone = "dark",
  align = "left",
  maxWidth,
}: SectionHeadingProps) {
  const Tag = (level === "h1" ? "h1" : level === "h3" ? "h3" : "h2") as React.ElementType;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center mx-auto",
        className,
      )}
      style={maxWidth ? { maxWidth } : undefined}
    >
      {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
      <Tag className={cn(headingVariants({ level, tone, align }))}>
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "text-[17px] leading-[1.7]",
            tone === "dark" ? "text-bz-text-muted" : "text-white/60",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
