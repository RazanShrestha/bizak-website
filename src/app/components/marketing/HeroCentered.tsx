import { type ReactNode } from "react";
import { cn } from "../ui/utils";
import { Section } from "./Section";
import { Container } from "./Container";

export interface HeroCenteredProps {
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  visual?: ReactNode;
  tone?: "light" | "dark";
  mesh?: boolean;
  className?: string;
  containerWidth?: "default" | "narrow";
}

/**
 * Option 1 Centered hero (HomePage pattern).
 *
 * Centered text stack (badge → h1 → description → actions) with an optional
 * full-width `visual` slot rendered below the copy. Use this when the hero's
 * "showpiece" is one large illustration / dashboard mockup that benefits from
 * the full container width (vs. a side-by-side split).
 */
export function HeroCentered({
  badge,
  title,
  description,
  actions,
  visual,
  tone = "light",
  mesh = true,
  className,
  containerWidth = "default",
}: HeroCenteredProps) {
  return (
    <Section
      tone={tone}
      pad="hero"
      className={cn(mesh && "biz-mesh", "overflow-hidden !pb-12 md:!pb-16", className)}
    >
      <Container width={containerWidth}>
        <div className="text-center relative z-20 mb-12 md:mb-16">
          {badge && <div className="flex justify-center mb-8">{badge}</div>}
          <h1
            className={cn(
              "font-bold tracking-[-0.02em] max-w-[900px] mx-auto mb-6 md:mb-7 text-[clamp(32px,5vw,56px)] [line-height:1.15]",
              tone === "dark" ? "text-white" : "text-bz-text",
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "text-[15px] md:text-[17px] leading-[1.7] max-w-[560px] mx-auto mb-9",
                tone === "dark" ? "text-white/70" : "text-bz-text-muted",
              )}
            >
              {description}
            </p>
          )}
          {actions && (
            <div className="flex flex-wrap justify-center gap-1.5">{actions}</div>
          )}
        </div>
        {visual && <div className="relative">{visual}</div>}
      </Container>
    </Section>
  );
}
