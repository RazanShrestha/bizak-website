import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "../ui/utils";

const btnVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-bz-sage",
  {
    variants: {
      variant: {
        primary:
          "bg-bz-deep text-white hover:bg-black/85 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        accent:
          "bg-bz-accent text-bz-deep hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(199,255,53,0.35)]",
        outline:
          "bg-bz-surface text-bz-text border border-bz-border hover:bg-bz-bg",
        ghost:
          "bg-transparent text-bz-text hover:bg-bz-bg",
        ghostDark:
          "bg-white/[0.04] text-white border border-white/10 hover:border-white/25",
      },
      size: {
        sm: "h-9 px-4 text-[13px] rounded-bz-md",
        md: "h-11 px-6 text-[14px] rounded-bz-md",
        lg: "h-[52px] px-8 text-[15px] rounded-bz-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type CommonProps = VariantProps<typeof btnVariants> & {
  className?: string;
  /** Append a right-arrow icon. */
  withArrow?: boolean;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant, size, className, withArrow, children } = props;
  const classes = cn(btnVariants({ variant, size }), className);

  const content = (
    <>
      {children}
      {withArrow && <ArrowRight className="size-[14px]" />}
    </>
  );

  if ("href" in props && props.href) {
    const { href, withArrow: _w, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  const { withArrow: _w, variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } = props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}
