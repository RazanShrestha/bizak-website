import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "../ui/utils";

// Floating "scroll to top" affordance. Mounted once in RootLayout so it
// appears on every page automatically. Shows after the user scrolls past
// `threshold` (default 480px) and smooth-scrolls to the top on click.

export type BackToTopProps = {
  threshold?: number;
  className?: string;
};

export function BackToTop({ threshold = 480, className }: BackToTopProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const onClick = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed z-50 inline-flex size-11 items-center justify-center rounded-bz-md border border-white/[0.08] bg-bz-olive text-bz-paper shadow-[0_10px_28px_-10px_rgba(15,20,17,0.45)] transition-all duration-200 hover:bg-bz-olive-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bz-fire/60",
        "bottom-5 right-5 md:bottom-8 md:right-8",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
        className,
      )}
    >
      <ArrowUp size={18} strokeWidth={1.8} />
    </button>
  );
}
