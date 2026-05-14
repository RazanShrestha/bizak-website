import * as React from "react";
import { cn } from "../ui/utils";
import { Tick } from "./Tick";
import { Pill, type PillProps } from "./Pill";

// The 2-column step card used in "How it works" sections. Number + tag +
// title + bullets + CTA on the left, a custom visual on the right.
//
//   <StepCard
//     number="01"
//     tag="Set up"
//     title="Pick your modules and go live"
//     bullets={["Finance, sales, inventory…", "Pre-configured for your industry."]}
//     cta={{ variant: "dark", withArrow: true, href: "/product", children: "Learn more" }}
//     visual={<StepVisualSetup/>}
//   />
//
// Paint: .bz-step-card + .bz-step-pad + .bz-step-visual in style.css.

export type StepCardProps = {
  /** Bracketed step number — e.g. "01". */
  number: string;
  /** Short tag — e.g. "Set up", "Connect", "Scale". */
  tag: string;
  title: React.ReactNode;
  bullets?: string[];
  cta?: PillProps;
  visual: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function StepCard({
  number,
  tag,
  title,
  bullets,
  cta,
  visual,
  className,
  ...rest
}: StepCardProps) {
  return (
    <div className={cn("bz-step-card", className)} {...rest}>
      <div className="bz-step-pad">
        <div className="mb-[14px] flex items-center gap-[10px]">
          <span
            className="rounded-bz-pill bg-[#F4F5EF] px-[10px] py-1 text-[12px] font-medium text-bz-text"
          >
            {number}
          </span>
          <span className="text-[12px] font-medium text-bz-text-muted">
            {tag}
          </span>
        </div>

        <h3
          className="bz-h2"
          style={{ fontSize: "clamp(16px, 2.6vw, 20px)", marginBottom: 24 }}
        >
          {title}
        </h3>

        {bullets && (
          <ul
            className="mb-[22px] flex flex-col gap-3"
            style={{ listStyle: "none", padding: 0, margin: "0 0 22px" }}
          >
            {bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-[10px] text-[14px] leading-[1.55] text-bz-text"
              >
                <Tick size="sm" className="mt-[2px]" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {cta && (
          <div className="mt-auto flex flex-wrap gap-2">
            <Pill {...cta} />
          </div>
        )}
      </div>

      <div className="bz-step-visual">{visual}</div>
    </div>
  );
}
