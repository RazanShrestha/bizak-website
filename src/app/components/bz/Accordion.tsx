import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "../ui/utils";

// FAQ accordion. Compound:
//   <Accordion defaultOpen={0}>
//     <Accordion.Item question="How long does Bizak take to deploy?">
//       Most teams go live in one business day.
//     </Accordion.Item>
//     <Accordion.Item question="Can we adopt module by module?">
//       Yes. Start with finance and add the rest later.
//     </Accordion.Item>
//   </Accordion>
//
// Paint: .bz-faq-item / .bz-faq-trigger / .bz-faq-icon / .bz-faq-content
// in style.css. Single-open behaviour: opening one collapses the others.

export type AccordionProps = {
  /** Index of the item that starts open. Default 0. Pass null for all-closed. */
  defaultOpen?: number | null;
  /** Allow multiple to be open at once. Default false. */
  multi?: boolean;
  className?: string;
  children: React.ReactNode;
};

export type AccordionItemProps = {
  question: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

// Internal context for index + open state
type Ctx = {
  isOpen: (index: number) => boolean;
  toggle: (index: number) => void;
  register: () => number;
};
const AccordionCtx = React.createContext<Ctx | null>(null);

function AccordionRoot({
  defaultOpen = 0,
  multi = false,
  className,
  children,
}: AccordionProps) {
  const [open, setOpen] = React.useState<Set<number>>(
    () => new Set(defaultOpen === null ? [] : [defaultOpen]),
  );

  const indexRef = React.useRef(0);
  const register = React.useCallback(() => {
    const i = indexRef.current;
    indexRef.current += 1;
    return i;
  }, []);

  // Reset index counter on every render so React.Children-driven indices stay
  // stable across re-renders.
  indexRef.current = 0;

  const isOpen = React.useCallback((i: number) => open.has(i), [open]);
  const toggle = React.useCallback(
    (i: number) => {
      setOpen((prev) => {
        const next = multi ? new Set(prev) : new Set<number>();
        if (prev.has(i)) {
          next.delete(i);
        } else {
          next.add(i);
        }
        return next;
      });
    },
    [multi],
  );

  return (
    <AccordionCtx.Provider value={{ isOpen, toggle, register }}>
      <div className={className}>{children}</div>
    </AccordionCtx.Provider>
  );
}

function AccordionItem({ question, className, children }: AccordionItemProps) {
  const ctx = React.useContext(AccordionCtx);
  if (!ctx) throw new Error("Accordion.Item must be a child of <Accordion>");
  const indexRef = React.useRef<number | null>(null);
  if (indexRef.current === null) {
    indexRef.current = ctx.register();
  }
  const i = indexRef.current!;
  const open = ctx.isOpen(i);

  return (
    <div className={cn("bz-faq-item", className)}>
      <button
        type="button"
        onClick={() => ctx.toggle(i)}
        aria-expanded={open}
        className="bz-faq-trigger"
      >
        <span>{question}</span>
        <span className="bz-faq-icon" aria-hidden="true">
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <div className={cn("bz-faq-content", open && "is-open")}>
        <div className="bz-faq-body">{children}</div>
      </div>
    </div>
  );
}

export const Accordion = Object.assign(AccordionRoot, { Item: AccordionItem });
