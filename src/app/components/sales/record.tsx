import * as React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Minimize2, MoreHorizontal, Printer, Send, X } from "lucide-react";
import { cn } from "../ui/utils";
import { Avatar, BTN, ICON_BTN, LABEL, NUM, Popover, Segmented } from "./bzw";
import { Amount, Comment, HistoryEvent, ME, OrderLine, fmtQty, itemById, lineNet, personById } from "./orders";

// ════════════════════════════════════════════════════════════════════════════
// RECORD — the one panel every sales document opens in
//
// The order panel set the grammar; every other document reuses it so a reader
// who has learned one record has learned all six: the same head (number ·
// state · walk · print · more · close), the customer and the money on one
// line, the NEXT STEP first, then blocks in one scroll, then the conversation.
// ════════════════════════════════════════════════════════════════════════════

export type ShellCtx = {
  docked: boolean;
  full: boolean;
  position: { index: number; total: number } | null;
  onPrev: () => void;
  onNext: () => void;
  onToggleFull: () => void;
  onClose: () => void;
};

export function RecordShell({
  ctx,
  no,
  chips,
  title,
  amount,
  meta,
  menu,
  back,
  onPrint,
  children,
  foot,
}: {
  ctx: ShellCtx;
  no: string;
  chips?: React.ReactNode;
  title: React.ReactNode;
  amount?: React.ReactNode;
  meta?: React.ReactNode[];
  menu?: (close: () => void) => React.ReactNode;
  back?: { label: string; onClick: () => void };
  onPrint?: () => void;
  children: React.ReactNode;
  foot?: React.ReactNode;
}) {
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [no]);

  return (
    <section className={cn("flex h-full min-h-0 flex-col bg-bz-surface", ctx.docked && !ctx.full && "border-l border-bz-line", !ctx.docked && "shadow-[var(--bz-shadow-panel)]")}>
      <header className="shrink-0 border-b border-bz-line-soft px-5 pb-3.5 pt-3">
        <div className="flex items-center gap-2">
          {back ? (
            <button type="button" onClick={back.onClick} className="-ml-1.5 inline-flex h-7 items-center gap-1 rounded-bz-md px-1.5 text-[11.5px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text">
              <ArrowLeft size={13} /> {back.label}
            </button>
          ) : (
            <span className={cn("whitespace-nowrap text-[11px] font-semibold text-bz-text-soft", NUM)}>{no}</span>
          )}
          {!back && chips}
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {ctx.position && !back && (
              <>
                <span className={cn("mr-1 hidden text-[10.5px] text-bz-text-soft sm:inline", NUM)}>
                  {ctx.position.index + 1} / {ctx.position.total}
                </span>
                <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={ctx.onPrev} title="Previous (K)">
                  <ChevronLeft size={15} />
                </button>
                <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={ctx.onNext} title="Next (J)">
                  <ChevronRight size={15} />
                </button>
              </>
            )}
            {onPrint && !back && (
              <button type="button" className={cn(ICON_BTN, "hidden sm:inline-flex")} onClick={onPrint} title="Print">
                <Printer size={14} />
              </button>
            )}
            {ctx.docked && (
              <button type="button" className={cn(ICON_BTN, "hidden md:inline-flex")} onClick={ctx.onToggleFull} title={ctx.full ? "Back beside the list" : "Full page"}>
                {ctx.full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
            {menu && !back && (
              <button ref={moreRef} type="button" className={ICON_BTN} onClick={() => setMoreOpen(true)} title="More">
                <MoreHorizontal size={15} />
              </button>
            )}
            <button type="button" className={ICON_BTN} onClick={ctx.onClose} title="Close (Esc)">
              <X size={15} />
            </button>
          </div>
        </div>
        {menu && (
          <Popover open={moreOpen} anchor={moreRef.current} onClose={() => setMoreOpen(false)} align="right" width={230}>
            {menu(() => setMoreOpen(false))}
          </Popover>
        )}
        <div className="mt-2 flex items-start gap-3">
          <h2 className="m-0 min-w-0 flex-1 text-[17px] font-semibold leading-snug tracking-tight text-bz-text">{title}</h2>
          {amount && <div className="shrink-0 text-right text-[17px] font-semibold tracking-tight text-bz-text">{amount}</div>}
        </div>
        {meta && meta.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted">
            {meta.filter(Boolean).map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span aria-hidden className="size-[3px] rounded-bz-pill bg-bz-line" />}
                {m}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>
      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        {children}
      </div>
      {foot}
    </section>
  );
}

/** What this document is waiting for, and the one button that does it. */
export function StepCard({
  icon,
  title,
  sub,
  actions,
  tone = "plain",
  children,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: "plain" | "quiet" | "danger" | "done";
  children?: React.ReactNode;
}) {
  return (
    <div className="px-5 pt-4">
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-bz-lg border px-3.5 py-3",
          tone === "danger" ? "border-transparent bg-bz-red-soft" : tone === "plain" ? "border-bz-line bg-bz-paper" : "border-bz-line-soft bg-bz-paper",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-bz-md",
            tone === "danger" ? "bg-bz-surface/60 text-bz-red" : tone === "done" ? "bg-bz-fire/20 text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("m-0 text-[12.5px] font-semibold", tone === "danger" ? "text-bz-red" : "text-bz-text")}>{title}</p>
          {sub && <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{sub}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        {children && <div className="w-full">{children}</div>}
      </div>
    </div>
  );
}

/** Lines of any document: name · qty · rate · net, collapsing on a phone. */
export function LinesTable({ rows, extraHead, qtyLabel = "Qty" }: { rows: { line: OrderLine; qty: number; sub?: React.ReactNode }[]; extraHead?: React.ReactNode; qtyLabel?: string }) {
  return (
    <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
      <div className={cn("hidden grid-cols-[minmax(0,1fr)_72px_100px_116px] items-center gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", LABEL)}>
        <span>Item {extraHead}</span>
        <span className="text-right">{qtyLabel}</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Net</span>
      </div>
      {rows.map(({ line, qty, sub }, i) => {
        const it = itemById(line.itemId)!;
        return (
          <div key={`${line.id}-${i}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_72px_100px_116px]">
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] text-bz-text">{it.name}</span>
              <span className={cn("block truncate text-[10.5px] text-bz-text-soft", NUM)}>
                {it.code}
                {line.discountPct > 0 && ` · ${line.discountPct}% off`}
                {sub && <> · {sub}</>}
              </span>
            </span>
            <span className={cn("hidden text-right text-[12.5px] text-bz-text sm:block", NUM)}>
              {fmtQty(qty)} <span className="text-[10.5px] text-bz-text-soft">{it.unit}</span>
            </span>
            <span className="hidden text-right text-[12.5px] text-bz-text sm:block">
              <Amount value={line.rate} />
            </span>
            <span className="text-right text-[12.5px] font-semibold text-bz-text">
              <Amount value={lineNet({ ...line, qty })} />
              <span className={cn("block text-[10.5px] font-normal text-bz-text-soft sm:hidden", NUM)}>
                {fmtQty(qty)} {it.unit} × <Amount value={line.rate} className="text-bz-text-soft" />
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Label / figure pairs, right-aligned, the last one the total. */
export function MoneyList({ rows, className }: { rows: { label: React.ReactNode; value: React.ReactNode; strong?: boolean; danger?: boolean; soft?: boolean }[]; className?: string }) {
  return (
    <dl className={cn("ml-auto mt-3 grid w-full max-w-[320px] grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-[12px]", className)}>
      {rows.map((r, i) => (
        <React.Fragment key={i}>
          <dt className={cn(r.strong ? "mt-1 border-t border-bz-line-soft pt-2 text-[12.5px] font-semibold text-bz-text" : r.soft ? "text-bz-text-soft" : "text-bz-text-muted")}>{r.label}</dt>
          <dd className={cn("m-0 text-right", r.strong ? "mt-1 border-t border-bz-line-soft pt-2 text-[13px] font-semibold" : "", r.danger ? "font-semibold text-bz-red" : r.soft ? "text-bz-text-soft" : "text-bz-text")}>{r.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/** Comments and history interleaved; the composer is the panel's foot. */
export function ActivityList({ comments, history }: { comments: Comment[]; history: HistoryEvent[] }) {
  const [show, setShow] = React.useState<"all" | "comments" | "history">("all");
  const items = [
    ...comments.map((c) => ({ kind: "c" as const, key: c.id, when: c.when, who: c.authorId, body: c.body })),
    ...history.map((h) => ({ kind: "h" as const, key: h.id, when: h.when, who: h.whoId, body: h.what })),
  ].filter((x) => show === "all" || (show === "comments" ? x.kind === "c" : x.kind === "h"));
  return (
    <section className="px-5 py-4">
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="m-0 text-[12px] font-semibold text-bz-text">Activity</h3>
        <div className="ml-auto">
          <Segmented
            size="sm"
            value={show}
            onChange={setShow}
            options={[
              { value: "all", label: "All" },
              { value: "comments", label: "Comments", count: comments.length },
              { value: "history", label: "History" },
            ]}
          />
        </div>
      </div>
      {items.length === 0 && <p className="m-0 text-[11.5px] text-bz-text-soft">Nothing yet.</p>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((x) =>
          x.kind === "c" ? (
            <li key={x.key} className="flex gap-2.5">
              <Avatar person={personById(x.who)} size={22} />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[11.5px]">
                  <span className="font-semibold text-bz-text">{personById(x.who)?.name}</span>
                  <span className={cn("ml-2 text-bz-text-soft", NUM)}>{x.when}</span>
                </p>
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed text-bz-text">{x.body}</p>
              </div>
            </li>
          ) : (
            <li key={x.key} className="flex items-center gap-2.5 pl-[7px] text-[11.5px] text-bz-text-muted">
              <span className="size-2 shrink-0 rounded-bz-pill border border-bz-line bg-bz-surface" />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-bz-text">{personById(x.who)?.name}</span> {x.body}
              </span>
              <span className={cn("shrink-0 text-[10.5px] text-bz-text-soft", NUM)}>{x.when}</span>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}

export function CommentFoot({ onSend }: { onSend: (body: string) => void }) {
  const [body, setBody] = React.useState("");
  const send = () => {
    if (!body.trim()) return;
    onSend(body.trim());
    setBody("");
  };
  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-bz-line-soft bg-bz-paper px-5 py-2.5">
      <Avatar person={ME} size={24} />
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), send())}
        placeholder="Comment… @ to mention"
        className="h-8 min-w-0 flex-1 rounded-bz-md border border-bz-line bg-bz-surface px-3 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft hover:border-bz-text-soft focus:border-bz-text-muted"
      />
      <button type="button" onClick={send} disabled={!body.trim()} className={cn(BTN, "h-8 px-3")}>
        <Send size={12} /> Send
      </button>
    </div>
  );
}
