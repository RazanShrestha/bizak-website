import * as React from "react";
import { ConfirmDialog } from "../sales/parts";
import { HEAD_BTN, Panel } from "./fx";
import { dataMode, resetPrototype } from "./persist";
import type { DataMode } from "./persist";
import { SfShell } from "./sf";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · PROTOTYPE DATA — start again, empty or with the sample business
//
// A convenience of the prototype, not a setting of the product: everything the
// prototype saved in this browser is wiped first, then the page reloads.
// ════════════════════════════════════════════════════════════════════════════

export function DataPlace() {
  const [ask, setAsk] = React.useState<DataMode | null>(null);
  const mode = dataMode();
  return (
    <SfShell current="setup:data">
      <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
        <Panel className="max-w-[720px]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="min-w-0 flex-1 basis-[220px] text-[13px] text-bz-text">{mode === "sample" ? "Sample business loaded." : "Your own data, saved in this browser."}</span>
            <span className="flex flex-wrap items-center gap-2">
              <button type="button" className={HEAD_BTN} onClick={() => setAsk("clean")}>
                Start clean
              </button>
              <button type="button" className={HEAD_BTN} onClick={() => setAsk("sample")}>
                Load sample data
              </button>
            </span>
          </div>
        </Panel>
      </div>
      <ConfirmDialog
        open={ask === "clean"}
        title="Start clean?"
        body="Everything you entered is deleted and the prototype starts empty."
        confirm="Start clean"
        danger
        onClose={() => setAsk(null)}
        onConfirm={() => resetPrototype("clean")}
      />
      <ConfirmDialog
        open={ask === "sample"}
        title="Load sample data?"
        body="Everything you entered is replaced by a sample business with customers, products, offers and orders."
        confirm="Load sample data"
        danger
        onClose={() => setAsk(null)}
        onConfirm={() => resetPrototype("sample")}
      />
    </SfShell>
  );
}
