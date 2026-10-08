import { createStore } from "../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// QUICK ADD — create a master from anywhere, in a small dialog
//
// The "+ New" menu in the Sales force top bar and every "+ Add …" option inside
// a picker call openQuickAdd(kind). The dialogs themselves live in
// QuickAddDialogs.tsx (rendered once by SfShell). `onCreated` hands the new id
// back so a picker can select what was just made.
// ════════════════════════════════════════════════════════════════════════════

export type QuickAddKind = "customer" | "product" | "rep" | "type";

export const QUICK_ADD_LABEL: Record<QuickAddKind, string> = {
  customer: "Customer",
  product: "Product",
  rep: "Rep",
  type: "Customer type",
};

export const quickAddStore = createStore<{ kind: QuickAddKind; onCreated?: (id: string) => void; preset?: Record<string, string> } | null>(null);

export function openQuickAdd(kind: QuickAddKind, opts: { onCreated?: (id: string) => void; preset?: Record<string, string> } = {}) {
  quickAddStore.set(() => ({ kind, ...opts }));
}
export function closeQuickAdd() {
  quickAddStore.set(() => null);
}
