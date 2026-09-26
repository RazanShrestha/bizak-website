import * as React from "react";
import { BTN, Dialog, GHOST, MenuItem, MenuSep } from "../../../sales/bzw";
import { useStore } from "../../../sales/store";
import { useMedia } from "../../../sales/orders";
import type { CellValue, GridColumn, GridGroup, MasterKindConfig } from "../../kit";
import { DEPARTMENT_CYCLE, departmentStore, departmentUsed, descendantsOf, newDepartmentId } from "../../seed/departments";
import type { Department } from "../../seed/departments";
import { DeleteDialog } from "../shared";
import type { HubCtx, KindBundle } from "../shared";

// ════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS — tier 3, a tree edited in the row (spec §4.5 Department)
//
// Rows sit indented under their parent; the caret (or ← / → on the name)
// folds a branch. Parent is a picker cell; a move under the department's own
// branch is refused in the server's words. Archiving a parent asks whether
// its sub-departments go too. Delete is offered only when nothing uses it and
// it has no sub-departments — and a refused delete shows the server's real
// answer (B-C8 fixes the controller that always answered Ok()).
//
// Bands: one "Active" band in tree order, then Archived (folded). A tree can't
// be split into In use / Available without tearing branches apart.
// ════════════════════════════════════════════════════════════════════════════

type Row = Department & { used: number };
const ROOT = "__root";

export function useDepartmentKind(ctx: HubCtx): KindBundle {
  const all = useStore(departmentStore);
  const narrow = !useMedia("(min-width: 768px)");
  const [folded, setFolded] = React.useState<Set<string>>(new Set());
  const [asking, setAsking] = React.useState<Department | null>(null);
  const [deleting, setDeleting] = React.useState<Department | null>(null);
  const ro = ctx.perm !== "full";
  const { show } = ctx;
  const rows: Row[] = ctx.read.empty ? [] : all.map((d) => ({ ...d, used: departmentUsed(d) }));
  const live = rows.filter((d) => !d.archived);
  const byId = new Map(all.map((d) => [d.id, d]));
  const depth = (d: Department) => {
    let n = 0;
    let p = d.parent;
    const seen = new Set<string>();
    while (p && byId.has(p) && !seen.has(p)) (seen.add(p), n++, (p = byId.get(p)!.parent));
    return n;
  };
  const kids = (id: string) => live.filter((d) => d.parent === id);
  const undo = (snap: Department[]) => () => departmentStore.set(() => snap);

  // Tree order of the live rows, skipping folded branches. A narrowed list shows every match, unfolded.
  const treeOrder = (rs: Row[], fold: boolean) => {
    const ids = new Set(rs.map((r) => r.id));
    const out: string[] = [];
    const walk = (parent: string | null, hidden: boolean) => {
      for (const d of live.filter((x) => (x.parent ?? null) === parent)) {
        if (!hidden && ids.has(d.id)) out.push(d.id);
        walk(d.id, hidden || (fold && folded.has(d.id)));
      }
    };
    walk(null, false);
    // Rows whose parent is archived still show (at the top level of their branch).
    rs.filter((r) => !r.archived && !out.includes(r.id) && !(fold && hiddenByFold(r))).forEach((r) => out.push(r.id));
    return out;
  };
  const hiddenByFold = (d: Department) => {
    let p = d.parent;
    while (p) {
      if (folded.has(p)) return true;
      p = byId.get(p)?.parent ?? null;
    }
    return false;
  };

  const parentOptions = (r: Row) => [
    { value: ROOT, label: "None — top level" },
    ...live.filter((d) => d.id !== r.id).map((d) => ({ value: d.id, label: d.name, hint: d.parent ? `under ${byId.get(d.parent)?.name ?? ""}` : undefined })),
  ];

  const columns: GridColumn<Row>[] = [
    { key: "name", label: "Name", width: "minmax(0,1.2fr)", placeholder: "Name" },
    // On a phone the tree's names get the room; the parent is readable from the indent.
    { key: "parent", label: "Parent", width: narrow ? "76px" : "minmax(0,0.9fr)", kind: "select", options: parentOptions, menuWidth: 240, placeholder: "—" },
    ...(!narrow ? [{ key: "description", label: "Description", width: "minmax(0,1.2fr)", placeholder: "—" } as GridColumn<Row>] : []),
  ];

  const refuse = (name: string, parent: string | null, id?: string): string | null => {
    if (!name.trim()) return "A name is required.";
    if (name.trim().length > 75) return "Keep the name under 75 characters.";
    if (id && parent) {
      if (parent === id || descendantsOf(all, id).some((d) => d.id === parent)) return DEPARTMENT_CYCLE;
    }
    return null;
  };
  const parentOf = (v: CellValue | undefined, fallback: string | null) => (v === undefined ? fallback : v === ROOT || v === null || v === "" ? null : String(v));

  const bands = (rs: Row[]): GridGroup[] => [
    // Folding applies only to the whole list; a search or a pick shows every match.
    { key: "active", label: "Active", rowIds: treeOrder(rs, rs.filter((r) => !r.archived).length === live.length) },
    { key: "archived", label: "Archived", rowIds: rs.filter((d) => d.archived).map((d) => d.id), collapsed: true },
  ];

  const archive = (d: Department, withKids: boolean) => {
    const snap = departmentStore.get();
    const ids = new Set([d.id, ...(withKids ? descendantsOf(all, d.id).map((x) => x.id) : [])]);
    departmentStore.set((ds) => ds.map((x) => (ids.has(x.id) ? { ...x, archived: true } : x)));
    show("success", ids.size > 1 ? `${ids.size} departments archived` : "Archived", { label: "Undo", run: undo(snap) }, 8000);
  };

  const config: MasterKindConfig<Row> = {
    key: "departments",
    label: "Departments",
    group: "Organisation",
    count: live.length,
    tier: 3,
    noun: ["department", "departments"],
    rows,
    columns,
    bands,
    minWidth: narrow ? 0 : undefined,
    searchText: (d) => `${d.name} ${d.description}`,
    searchPlaceholder: "Name",
    usage: (d) => d.usage,
    usageNoun: "records",
    tree: {
      depth: (r) => depth(r),
      hasChildren: (r) => !r.archived && kids(r.id).length > 0,
      open: (r) => !folded.has(r.id),
      onToggle: (r) =>
        setFolded((s) => {
          const t = new Set(s);
          t.has(r.id) ? t.delete(r.id) : t.add(r.id);
          return t;
        }),
    },
    picks: [
      { key: "in-use", label: "In use", value: live.filter((d) => d.used > 0).length, test: (d) => !d.archived && d.used > 0 },
      { key: "unused", label: "Not used", value: live.filter((d) => !d.used).length, test: (d) => !d.archived && !d.used },
      { key: "archived", label: "Archived", value: rows.filter((d) => d.archived).length, test: (d) => d.archived, showZero: true },
    ],
    newLabel: "New department",
    blank: () => ({ id: "ghost", name: "", parent: null, description: "", archived: false, orgs: ["186", "194"], usage: [], used: 0 }),
    addLabel: "Add department",
    onAdd: (r) => {
      const parent = parentOf(r.parent, null);
      const err = refuse(r.name, parent);
      if (err) return err;
      const snap = departmentStore.get();
      const d: Department = { id: newDepartmentId(), name: r.name.trim(), parent, description: (r.description ?? "").trim(), archived: false, orgs: ["186", "194"], usage: [] };
      departmentStore.set((ds) => [...ds, d]);
      if (parent) setFolded((s) => (s.has(parent) ? new Set([...s].filter((x) => x !== parent)) : s));
      show("success", `${d.name} added`, { label: "Undo", run: undo(snap) }, 8000);
      return null;
    },
    onCommitRow: (id, patch) => {
      const cur = departmentStore.get().find((d) => d.id === id);
      if (!cur) return null;
      const name = typeof patch.name === "string" ? patch.name : cur.name;
      const description = typeof patch.description === "string" ? patch.description : cur.description;
      const parent = parentOf("parent" in patch ? patch.parent : undefined, cur.parent);
      const err = refuse(name, parent, id);
      if (err) return err;
      const snap = departmentStore.get();
      departmentStore.set((ds) => ds.map((d) => (d.id === id ? { ...d, name: name.trim(), description: description.trim(), parent } : d)));
      show("success", "Department saved", { label: "Undo", run: undo(snap) }, 8000);
      return null;
    },
    rowMenu: ro
      ? undefined
      : (d, close) => (
          <>
            {d.archived ? (
              <MenuItem
                onClick={() => {
                  close();
                  const snap = departmentStore.get();
                  departmentStore.set((ds) => ds.map((x) => (x.id === d.id ? { ...x, archived: false } : x)));
                  show("success", "Restored", { label: "Undo", run: undo(snap) }, 8000);
                }}
              >
                Restore
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  close();
                  if (descendantsOf(all, d.id).some((x) => !x.archived)) setAsking(d);
                  else archive(d, false);
                }}
              >
                Archive
              </MenuItem>
            )}
            {d.used === 0 && !all.some((x) => x.parent === d.id) && (
              <>
                <MenuSep />
                <MenuItem danger onClick={() => (close(), setDeleting(d))}>
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

  const subs = asking ? descendantsOf(all, asking.id).filter((x) => !x.archived) : [];
  return {
    config,
    overlays: (
      <>
        <Dialog
          open={!!asking}
          size="sm"
          title={`Archive ${asking?.name ?? ""}?`}
          onClose={() => setAsking(null)}
          foot={
            <>
              <button type="button" className={GHOST} onClick={() => (archive(asking!, false), setAsking(null))}>
                Only {asking?.name}
              </button>
              <button type="button" className={BTN} onClick={() => (archive(asking!, true), setAsking(null))}>
                Archive all {subs.length + 1}
              </button>
            </>
          }
        >
          Archive its {subs.length} sub-department{subs.length === 1 ? "" : "s"} too?
        </Dialog>
        <DeleteDialog
          open={!!deleting}
          name={deleting?.name ?? ""}
          noun="department"
          onClose={() => setDeleting(null)}
          onDelete={() => {
            const d = deleting!;
            setDeleting(null);
            departmentStore.set((ds) => ds.filter((x) => x.id !== d.id));
            show("success", `${d.name} deleted`);
          }}
        />
      </>
    ),
  };
}
