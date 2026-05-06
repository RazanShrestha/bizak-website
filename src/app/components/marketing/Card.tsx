import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../ui/utils";

const cardVariants = cva(
  "rounded-bz-xl transition-[transform,box-shadow,border-color] duration-200",
  {
    variants: {
      tone: {
        light: "bg-bz-surface border border-bz-border text-bz-text",
        soft:  "bg-bz-bg border border-bz-border text-bz-text",
        dark:  "bg-white/[0.04] border border-white/10 text-white backdrop-blur-md",
      },
      pad: {
        sm: "p-5",
        md: "p-7",
        lg: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-[2px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)]",
        glow: "hover:border-bz-accent/40 hover:bg-bz-accent/[0.04]",
      },
    },
    defaultVariants: {
      tone: "light",
      pad: "md",
      hover: "none",
    },
  },
);

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

export function Card({
  className,
  tone,
  pad,
  hover,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ tone, pad, hover }), className)}
      {...props}
    />
  );
}
