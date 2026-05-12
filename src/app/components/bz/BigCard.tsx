import * as React from "react";
import { cn } from "../ui/utils";
import { Tick } from "./Tick";
import { Pill, type PillProps } from "./Pill";

// The 2-column dark "marquee" card used for a page's hero feature
// (multi-entity consolidation on HomePage, the "this is the big idea"
// section). Text on the left, a custom visual on the right.
//
//   <BigCard
//     text={{
//       title: "Multi-entity consolidation",
//       body: "Roll up branches, currencies and subsidiaries…",
//       bullets: ["FX translation", "Intercompany elimination", "99.8% accuracy"],
//       cta: { variant: "accent", withArrow: true, href: "/x", children: "Learn more" },
//     }}
//     visual={<MultiEntityVisual/>}
//   />
//
// Paint: .bz-big-card + .bz-big-card-text + .bz-big-card-visual in style.css.

export type BigCardProps = {
  text: {
    title: React.ReactNode;
    body?: React.ReactNode;
    bullets?: React.ReactNode[];
    cta?: PillProps;
  };
  visual: React.ReactNode;
  /** Swap halves: visual on the left, text on the right. */
  reverse?: boolean;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function BigCard({
  text,
  visual,
  reverse,
  className,
  ...rest
}: BigCardProps) {
  return (
    <div
      className={cn(
        "bz-big-card bz-hover-card",
        reverse && "[&_>_:first-child]:order-2",
        className,
      )}
      {...rest}
    >
      <div className="bz-big-card-text">
        <div>
          <h3 className="bz-bento-title" style={{ marginBottom: 14 }}>
            {text.title}
          </h3>
          {text.body && (
            <p
              className="text-[14.5px] leading-[1.6] text-white/[0.62]"
              style={{ maxWidth: 460, marginBottom: text.bullets ? 24 : 0 }}
            >
              {text.body}
            </p>
          )}
          {text.bullets && (
            <ul
              className="flex flex-col gap-[10px]"
              style={{ maxWidth: 460, listStyle: "none", padding: 0, margin: 0 }}
            >
              {text.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-[10px] text-[13.5px] text-bz-text-on-dark"
                >
                  <Tick size="sm" className="mt-[2px]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {text.cta && (
          <div className="mt-7 flex flex-wrap gap-2">
            <Pill {...text.cta} />
          </div>
        )}
      </div>

      <div className="bz-big-card-visual">{visual}</div>
    </div>
  );
}
