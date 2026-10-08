import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, MoreVertical, Route, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { Empty, FrameContext, GHOST, ICON_BTN, MenuSep, Popover, Refusal, Switch, ToastHost } from "../sales/bzw";
import type { ToastMsg } from "../sales/bzw";
import { createStore, useStore } from "../sales/store";
import type { Rep } from "../salesforce/data";
import { Initials } from "../salesforce/field-kit";
import { sfPath } from "../salesforce/sf";
import { repSessionStore, repsStore } from "../salesforce/store";
import { FOOT, ListBlock, MenuRow, ROWS, ROW_TAP } from "./kit";

// ════════════════════════════════════════════════════════════════════════════
// REP APP · SHELL — a phone app, not the ERP frame
//
// A rep works from a phone, so the page is one phone-width column; on a desktop
// it sits centred. The column is the bzw frame at phone size: the 52px top bar
// carries the title (nothing repeats it on the page), the body scrolls, and the
// screen's one primary sits in a bottom bar. It carries its own FrameContext
// and portal root INSIDE its root (like the dealer portal) so bzw dialogs and
// popovers render in the app's theme — a portal on <body> would escape `.bzw-dark`.
// ════════════════════════════════════════════════════════════════════════════

export const repPath = (p = "") => `/design/rep${p ? `/${p}` : ""}`;

/** Which rep is signed in — null when none, or when that rep was removed. */
export function useRep(): Rep | undefined {
  const session = useStore(repSessionStore);
  const reps = useStore(repsStore);
  return reps.find((r) => r.id === session.repId);
}
export const signOut = () => repSessionStore.set(() => ({ repId: null }));

/** One message at a time, replaced, never stacked (UI state only — nothing to persist). */
const toastStore = createStore<ToastMsg | null>(null);
export function repToast(text: string, kind: ToastMsg["kind"] = "success") {
  toastStore.set(() => ({ id: Date.now(), kind, text }));
}

const THEME_KEY = "rep.theme";

function RepMenu({ rep, dark, setDark }: { rep: Rep | undefined; dark: boolean; setDark: (v: boolean) => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };
  return (
    <>
      <button ref={ref} type="button" onClick={() => setOpen(true)} className={cn(ICON_BTN, "size-10")} aria-label="Menu" title="Menu">
        {rep ? <Initials rep={rep} size={28} /> : <MoreVertical size={16} />}
      </button>
      <Popover open={open} anchor={ref.current} onClose={() => setOpen(false)} align="right" width={240}>
        {rep && (
          <div className="px-2 pb-2 pt-1.5">
            <p className="m-0 truncate text-[12.5px] font-semibold text-bz-text">{rep.name}</p>
            <p className="m-0 truncate text-[11px] text-bz-text-soft">{rep.role}</p>
          </div>
        )}
        {rep && <MenuSep />}
        {/* A label, so the whole 40px row flips the switch — the switch itself is a small target. */}
        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-bz-sm px-2 text-[12.5px] text-bz-text hover:bg-bz-paper-warm">
          <span className="min-w-0 flex-1">Dark mode</span>
          <Switch on={dark} onChange={setDark} label="Dark mode" />
        </label>
        <MenuRow icon={Route} onClick={() => go(() => navigate(sfPath("today")))}>
          Open Sales force
        </MenuRow>
        {rep && (
          <>
            <MenuSep />
            <MenuRow
              icon={Users}
              onClick={() =>
                go(() => {
                  signOut();
                  navigate(repPath());
                })
              }
            >
              Switch rep
            </MenuRow>
          </>
        )}
      </Popover>
    </>
  );
}

/**
 * The phone column. `back` shows a back arrow; `foot` is the bottom bar (the one primary of the screen lives
 * there); `sheet` is a full-height layer over the column (an order, a payment).
 */
export function RepShell({ title, sub, back, foot, sheet, children }: { title: string; sub?: React.ReactNode; back?: string; foot?: React.ReactNode; sheet?: React.ReactNode; children: React.ReactNode }) {
  const [dark, setDarkState] = React.useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark";
    } catch {
      return false;
    }
  });
  const setDark = React.useCallback((v: boolean) => {
    setDarkState(v);
    try {
      localStorage.setItem(THEME_KEY, v ? "dark" : "light");
    } catch {
      /* a private window keeps it for the session */
    }
  }, []);
  const [portal, setPortal] = React.useState<HTMLElement | null>(null);
  const toast = useStore(toastStore);
  const rep = useRep();

  React.useEffect(() => {
    const prev = document.title;
    document.title = `${title} · Rep app`;
    return () => {
      document.title = prev;
    };
  }, [title]);
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => toastStore.set(() => null), 3400);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <FrameContext.Provider value={{ portal, dark, setDark }}>
      <div className={cn("bzw-frame flex min-h-dvh w-full justify-center bg-bz-section-b text-[13px] leading-normal text-bz-text antialiased sm:items-center sm:py-6", dark && "bzw-dark")} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="relative flex h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-bz-surface sm:h-[min(880px,calc(100dvh-48px))] sm:rounded-bz-lg sm:border sm:border-bz-line">
          <header className="flex h-[52px] shrink-0 items-center gap-1 border-b border-bz-line bg-bz-paper px-1.5">
            {back && (
              <Link to={back} className={cn(ICON_BTN, "size-10")} aria-label="Back" title="Back">
                <ChevronLeft size={16} />
              </Link>
            )}
            <div className={cn("min-w-0 flex-1", back ? "pl-0.5" : "pl-3.5")}>
              <h1 className="m-0 truncate text-[17px] font-semibold leading-tight tracking-tight text-bz-text">{title}</h1>
              {sub && <p className="m-0 truncate text-[11px] leading-tight text-bz-text-soft">{sub}</p>}
            </div>
            <RepMenu rep={rep} dark={dark} setDark={setDark} />
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">{children}</main>
          {foot && <div className={FOOT}>{foot}</div>}
          {sheet}
        </div>
        <ToastHost toast={toast} onDismiss={() => toastStore.set(() => null)} lifted />
        <div id="frame-portal" ref={setPortal} />
      </div>
    </FrameContext.Provider>
  );
}

/**
 * A full-height layer over the phone column: the action as its title, its own scroll, its own one primary in the
 * foot. A commit that cannot go through says why in `refusal`, above the button — it stays until it is answered.
 */
export function Sheet({
  title,
  sub,
  onClose,
  foot,
  refusal,
  onDismissRefusal,
  children,
}: {
  title: string;
  sub?: React.ReactNode;
  onClose: () => void;
  foot?: React.ReactNode;
  refusal?: string | null;
  onDismissRefusal?: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[data-bzw-popover], [data-bzw-dialog]")) return;
      onClose();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="absolute inset-0 z-30 flex flex-col bg-bz-surface">
      <header className="flex h-[52px] shrink-0 items-center gap-1 border-b border-bz-line bg-bz-paper pl-1.5 pr-5">
        <button type="button" onClick={onClose} className={cn(ICON_BTN, "size-10")} aria-label="Back" title="Back (Esc)">
          <ChevronLeft size={16} />
        </button>
        <div className="min-w-0 flex-1 pl-0.5">
          <h2 className="m-0 truncate text-[17px] font-semibold leading-tight tracking-tight text-bz-text">{title}</h2>
          {sub && <p className="m-0 truncate text-[11px] leading-tight text-bz-text-soft">{sub}</p>}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">{children}</div>
      {(foot || refusal) && (
        <div className={FOOT}>
          {refusal && <Refusal text={refusal} onDismiss={onDismissRefusal ?? (() => {})} sticky className={foot ? "mb-2.5" : undefined} />}
          {foot}
        </div>
      )}
    </div>
  );
}

/** Who is using the app. The prototype has no passwords: the tester picks a rep. */
export function SignIn() {
  const reps = useStore(repsStore);
  if (!reps.length) {
    return (
      <Empty
        title="No reps yet."
        icon={Users}
        action={
          <Link to={sfPath("team")} className={cn(GHOST, "h-10")}>
            Add a rep
          </Link>
        }
      />
    );
  }
  return (
    <ListBlock title="Sign in as" count={reps.length}>
      <ul className={ROWS}>
        {reps.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => repSessionStore.set(() => ({ repId: r.id }))} className={ROW_TAP}>
              <Initials rep={r} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] text-bz-text">{r.name}</span>
                <span className="block truncate text-[10.5px] text-bz-text-soft">{r.role}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </ListBlock>
  );
}
