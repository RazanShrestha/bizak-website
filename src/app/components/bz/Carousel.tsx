import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../ui/utils";

// Generic auto-advancing carousel. Renders one slide at a time via a
// `render(item)` prop and exposes prev/next buttons. Handles auto-advance,
// keyboard navigation (← / →), and ARIA.
//
//   <Carousel
//     items={TESTIMONIALS}
//     autoAdvance={6000}
//     render={(t) => <TestimonialQuote {...t} />}
//   />
//
// `tone` follows the surface convention: tone="dark" recolours the
// counter + prev/next controls for use on a dark (olive) surface.

export type CarouselProps<T> = {
  items: T[];
  render: (item: T, index: number) => React.ReactNode;
  /** Auto-advance interval in ms. 0 disables auto-advance. Default 6000. */
  autoAdvance?: number;
  /** Render the prev/next buttons. Default true. */
  showControls?: boolean;
  /** Pause auto-advance on hover. Default true. */
  pauseOnHover?: boolean;
  /** The SURFACE the carousel sits on dictates the control colours. Default "light". */
  tone?: "light" | "dark";
  className?: string;
};

export function Carousel<T>({
  items,
  render,
  autoAdvance = 6000,
  showControls = true,
  pauseOnHover = true,
  tone = "light",
  className,
}: CarouselProps<T>) {
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const len = items.length;

  const prev = React.useCallback(
    () => setI((p) => (p === 0 ? len - 1 : p - 1)),
    [len],
  );
  const next = React.useCallback(
    () => setI((p) => (p === len - 1 ? 0 : p + 1)),
    [len],
  );

  React.useEffect(() => {
    if (!autoAdvance || paused || len <= 1) return;
    const id = window.setInterval(next, autoAdvance);
    return () => window.clearInterval(id);
  }, [autoAdvance, paused, next, len]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (len === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      className={cn("relative", className)}
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    >
      <div aria-live="polite" aria-atomic="true">
        {render(items[i], i)}
      </div>

      {showControls && len > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span
            className={cn(
              "text-[12.5px]",
              tone === "dark" ? "text-white/55" : "text-bz-text-muted",
            )}
            aria-label={`Slide ${i + 1} of ${len}`}
          >
            {i + 1} / {len}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-bz-pill border",
                tone === "dark"
                  ? "border-white/[0.16] bg-white/[0.06] text-bz-text-on-dark hover:bg-white/[0.12]"
                  : "border-bz-line-soft bg-bz-surface text-bz-text hover:bg-bz-section-b",
              )}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-bz-pill border",
                tone === "dark"
                  ? "border-white/[0.16] bg-white/[0.06] text-bz-text-on-dark hover:bg-white/[0.12]"
                  : "border-bz-line-soft bg-bz-surface text-bz-text hover:bg-bz-section-b",
              )}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
