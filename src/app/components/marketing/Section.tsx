import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../ui/utils";

const sectionVariants = cva(
  "relative w-full",
  {
    variants: {
      tone: {
        light: "bg-bz-bg text-bz-text",
        white: "bg-bz-surface text-bz-text",
        dark:  "bg-bz-deep text-white",
        deeper: "bg-bz-deep-2 text-white",
      },
      pad: {
        default: "py-24 md:py-[96px]",
        compact: "py-16 md:py-20",
        hero:    "pt-[120px] pb-24 md:pt-[140px] md:pb-[96px]",
      },
    },
    defaultVariants: {
      tone: "light",
      pad: "default",
    },
  },
);

type SectionProps = React.HTMLAttributes<HTMLElement> &
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
