import * as React from "react";
import { Search, Plus, HelpCircle, Bell, ChevronDown } from "lucide-react";

// ════════════════════════════════════════════════════════════════════════════
// TOP BAR  breadcrumb · global search · quick-create · bell · help
// ════════════════════════════════════════════════════════════════════════════

export function TopBar({
  breadcrumb,
  tone = "paper",
}: {
  breadcrumb: React.ReactNode;
  tone?: "paper" | "section";
}) {
  return (
    <header
      className={`flex h-14 shrink-0 items-center gap-3 border-b border-bz-line px-4 md:px-6 ${
        tone === "section" ? "bg-bz-section-b" : "bg-bz-paper"
      }`}
    >
      {/* Breadcrumb */}
      <nav className="flex min-w-0 items-center gap-1.5 text-[12px]">
        {breadcrumb}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <button className="flex size-9 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm">
          <Plus size={14} />
        </button>
        <button className="flex size-9 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm">
          <HelpCircle size={14} />
        </button>
        <button className="relative flex size-9 items-center justify-center rounded-bz-md text-bz-text-muted hover:bg-bz-paper-warm">
          <Bell size={14} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-bz-pill bg-bz-fire ring-2 ring-bz-paper" />
        </button>
      </div>

      {/* User chip */}
      <button className="ml-1 hidden items-center gap-2 rounded-bz-pill border border-bz-line bg-bz-surface px-1.5 py-1 md:flex">
        <span className="flex size-6 items-center justify-center rounded-bz-pill bg-bz-fire/30 text-[10px] font-semibold text-bz-text">
          MS
        </span>
        <span className="text-[11.5px] font-medium text-bz-text">Manas</span>
        <ChevronDown size={11} className="text-bz-text-muted" />
      </button>
    </header>
  );
}
