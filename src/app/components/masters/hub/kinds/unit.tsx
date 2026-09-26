import * as React from "react";
import { useNavigate } from "react-router";
import { cn } from "../../../ui/utils";
import { MenuItem, MenuSep } from "../../../sales/bzw";
import { useStore } from "../../../sales/store";
import { useMedia } from "../../../sales/orders";
import { LINK } from "../../kit";
import { usageBands } from "../../kit";
import type { CellValue, GridColumn, MasterKindConfig } from "../../kit";
import { newUnitId, unitDuplicate, unitStore, unitUsed } from "../../seed/units";
import type { Unit } from "../../seed/units";
import { DeleteDialog } from "../shared";
import type { HubCtx, KindBundle } from "../shared";

// ════════════════════════════════════════════════════════════════════════════
// UNITS — tier 3: edited in the row, no sheet (spec §4.5 Unit)
//
// "+ Add unit" waits at the top: code, Tab, name, Enter → saved and a fresh
// add row takes the cursor. A saved row edits in place and commits on Enter
// (or when the cursor leaves the row); the change shows at once and a toast
// offers Undo; a refusal reverts the row and shows the server's sentence
// under it. Duplicate CODE is the server's check today, in its own words.
// ════════════════════════════════════════════════════════════════════════════

type Row = Unit & { used: number };

/** A refusal and the cell it is about, so the add row can put the cursor there. */
function refuse(all: Unit[], code: string, name: string, except?: string): { text: string; col: "code" | "name" } | null {
  if (!code.trim()) return { text: "Enter a code.", col: "code" };
  if (code.trim().length > 20) return { text: "Keep the code under 20 characters.", col: "code" };
  if (!name.trim()) return { text: "A name is required.", col: "name" };
  const holder = all.find((u) => u.id !== except && u.code.trim().toLowerCase() === code.trim().toLowerCase());
  if (holder) return { text: unitDuplicate(code, holder.name), col: "code" };
  return null;
}

export function useUnitKind(ctx: HubCtx): KindBundle {
  const units = useStore(unitStore);
  const navigate = useNavigate();
  const narrow = !useMedia("(min-width: 768px)");
  const [deleting, setDeleting] = React.useState<Unit | null>(null);
  // A unit just added is unused, so it lands in the folded "Available" band — keep that band open to show it.
  const [recent, setRecent] = React.useState<string | null>(null);
  const ro = ctx.perm !== "full";
  const { show } = ctx;
  const rows: Row[] = ctx.read.empty ? [] : units.map((u) => ({ ...u, used: unitUsed(u) }));
  const live = rows.filter((u) => !u.archived);
  const before = () => unitStore.get();
  const undo = (snap: Unit[]) => () => unitStore.set(() => snap);

  const columns: GridColumn<Row>[] = [
    { key: "code", label: "Code", width: narrow ? "88px" : "132px", placeholder: "Code" },
    { key: "name", label: "Name", width: "minmax(0,1fr)", placeholder: "Name" },
    ...(!narrow
      ? [
          {
            key: "convertedOn",
            label: "Converted on",
            width: "116px",
            kind: "readonly" as const,
            title: (u: Row) => (u.convertedOn ? `Items with a conversion in ${u.name}` : undefined),
            render: (u: Row) =>
              u.convertedOn ? (
                <button type="button" tabIndex={-1} className={cn(LINK, "text-[12px]")} onClick={(e) => (e.stopPropagation(), navigate(`/design/masters/items?unit=${encodeURIComponent(u.id)}`))}>
                  {u.convertedOn} item{u.convertedOn === 1 ? "" : "s"}
                </button>
              ) : (
                <span className="text-bz-text-soft">—</span>
              ),
          },
        ]
      : []),
  ];

  const config: MasterKindConfig<Row> = {
    key: "units",
    label: "Units",
    group: "Items",
    count: live.length,
    tier: 3,
    noun: ["unit", "units"],
    rows,
    columns,
    minWidth: narrow ? 0 : undefined,
    bands: (rs) => usageBands(rs).map((g) => (recent && g.rowIds.includes(recent) ? { ...g, forceOpen: true } : g)),
    searchText: (u) => `${u.code} ${u.name}`,
    usage: (u) => [
      { label: "Items (base unit)", count: u.baseOf },
      { label: "Document lines", count: u.lines },
    ],
    usageNoun: "records",
    picks: [
      { key: "in-use", label: "In use", value: live.filter((u) => u.used > 0).length, test: (u) => !u.archived && u.used > 0 },
      { key: "unused", label: "Not used", value: live.filter((u) => !u.used).length, test: (u) => !u.archived && !u.used },
      { key: "archived", label: "Archived", value: rows.filter((u) => u.archived).length, test: (u) => u.archived, showZero: true },
    ],
    newLabel: "New unit",
    blank: () => ({ id: "ghost", code: "", name: "", archived: false, orgs: ["186", "194"], convertedOn: 0, baseOf: 0, lines: 0, used: 0 }),
    addLabel: "Add unit",
    onAdd: (r) => {
      const err = refuse(unitStore.get(), r.code, r.name);
      if (err) return err;
      const snap = before();
      const u: Unit = { id: newUnitId(), code: r.code.trim(), name: r.name.trim(), archived: false, orgs: ["186", "194"], convertedOn: 0, baseOf: 0, lines: 0 };
      unitStore.set((us) => [u, ...us]);
      setRecent(u.id);
      show("success", `${u.name} added`, { label: "Undo", run: undo(snap) }, 8000);
      return null;
    },
    onCommitRow: (id, patch: Record<string, CellValue>) => {
      const cur = unitStore.get().find((u) => u.id === id);
      if (!cur) return null;
      const code = typeof patch.code === "string" ? patch.code : cur.code;
      const name = typeof patch.name === "string" ? patch.name : cur.name;
      const err = refuse(unitStore.get(), code, name, id);
      if (err) return err.text;
      const snap = before();
      unitStore.set((us) => us.map((u) => (u.id === id ? { ...u, code: code.trim(), name: name.trim() } : u)));
      show("success", "Unit saved", { label: "Undo", run: undo(snap) }, 8000);
      return null;
    },
    rowMenu: ro
      ? undefined
      : (u, close) => (
          <>
            <MenuItem
              onClick={() => {
                close();
                const snap = before();
                unitStore.set((us) => us.map((x) => (x.id === u.id ? { ...x, archived: !x.archived } : x)));
                show("success", u.archived ? "Restored" : "Archived", { label: "Undo", run: undo(snap) }, 8000);
              }}
            >
              {u.archived ? "Restore" : "Archive"}
            </MenuItem>
            {u.used === 0 && u.convertedOn === 0 && (
              <>
                <MenuSep />
                <MenuItem danger onClick={() => (close(), setDeleting(u))}>
                  Delete
                </MenuItem>
              </>
            )}
          </>
        ),
    readOnly: ro,
    denied: ctx.perm === "none",
    loading: ctx.read.loading,
    failed: ctx.read.failed,
    onRetry: ctx.read.retry,
  };

  return {
    config,
    overlays: (
      <DeleteDialog
        open={!!deleting}
        name={deleting?.name ?? ""}
        noun="unit"
        onClose={() => setDeleting(null)}
        onDelete={() => {
          const d = deleting!;
          setDeleting(null);
          unitStore.set((us) => us.filter((u) => u.id !== d.id));
          show("success", `${d.name} deleted`);
        }}
      />
    ),
  };
}
