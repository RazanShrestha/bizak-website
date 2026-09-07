import * as React from "react";
import { createPortal } from "react-dom";
import { AppShell } from "./SalesOrderListDesignPage";
import {
  // Field-type icons
  Type,
  AlignLeft,
  Hash,
  Sigma,
  CircleDollarSign,
  Calendar,
  CalendarClock,
  CheckSquare,
  ListChecks,
  List,
  AtSign,
  Phone,
  Globe,
  Link2,
  Paperclip,
  // Chrome
  Plus,
  MoreHorizontal,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  Minimize2,
  X,
  Check,
  Undo2,
  Trash2,
  Copy,
  Search,
  AlertCircle,
  Sparkles,
  Loader2,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
} from "lucide-react";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA
//
// Bizak's "Custom Form" feature lets an admin extend any system document type
// (Sales Invoice, Inventory Location, Transfer Order, etc.) with extra fields.
// Each Custom Form is per-entity and owns:
//   - form-level properties (templates, flags, id)
//   - an ordered list of CustomField rows
//
// The schema here mirrors the actual properties Bizak's UI exposes (Label,
// Field Type, Display Order, Required, Display Mode, Default, Field Key,
// Description, Help Text, Max Length, Min Value, Max Value) — not the
// heavier ERPNext model.
// ════════════════════════════════════════════════════════════════════════════

type FieldType =
  | "Data"
  | "Long Text"
  | "Number"
  | "Decimal"
  | "Currency"
  | "Date"
  | "Datetime"
  | "Check"
  | "Select"
  | "Multi-Select"
  | "Email"
  | "Phone"
  | "URL"
  | "Link"
  | "Attach";

type DisplayMode = "Normal" | "Disabled" | "Hidden";

type CustomField = {
  id: string;
  label: string;
  fieldKey: string;
  fieldKeyTouched?: boolean;
  fieldType: FieldType;
  displayOrder: number;
  required?: boolean;
  displayMode: DisplayMode;
  defaultValue?: string;
  description?: string; // shown to admins
  helpText?: string; // shown to end users
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  /** Master table name (Select / Multi-Select / Link) or inline options (one per line). */
  options?: string;
};

type CustomForm = {
  entity: string;
  formId: number;
  emailMessageTemplate?: string;
  printTemplate?: string;
  emailTemplate?: string;
  allowAddMultiple?: boolean;
  inactive?: boolean;
  storeFormWithRecord?: boolean;
  formIsPreferred?: boolean;
  fields: CustomField[];
};

const FORM_SETTINGS_ID = "__FORM__";

type FieldTypeMeta = {
  type: FieldType;
  Icon: React.ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
  desc: string;
  group: "Text" | "Choice" | "Numeric" | "Date" | "Contact" | "Reference";
  hasOptions?: boolean;
  optionsLabel?: string;
  optionsHint?: string;
  optionsPlaceholder?: string;
};

const FIELD_TYPES: FieldTypeMeta[] = [
  { type: "Data",         Icon: Type,             desc: "Single-line text input.",         group: "Text" },
  { type: "Long Text",    Icon: AlignLeft,        desc: "Multi-paragraph text area.",      group: "Text" },
  { type: "Check",        Icon: CheckSquare,      desc: "Yes / no toggle.",                group: "Choice" },
  {
    type: "Select",
    Icon: ListChecks,
    desc: "Pick one from a list.",
    group: "Choice",
    hasOptions: true,
    optionsLabel: "Options",
    optionsHint: "One per line — or a master table name.",
    optionsPlaceholder: "Bronze\nSilver\nGold\nPlatinum",
  },
  {
    type: "Multi-Select",
    Icon: List,
    desc: "Pick many from a list.",
    group: "Choice",
    hasOptions: true,
    optionsLabel: "Options",
    optionsHint: "One per line — or a master table name.",
    optionsPlaceholder: "Email\nPhone\nWhatsApp\nIn person",
  },
  { type: "Number",       Icon: Hash,             desc: "Whole number.",                   group: "Numeric" },
  { type: "Decimal",      Icon: Sigma,            desc: "Decimal number.",                 group: "Numeric" },
  { type: "Currency",     Icon: CircleDollarSign, desc: "Monetary amount.",                group: "Numeric" },
  { type: "Date",         Icon: Calendar,         desc: "Calendar date.",                  group: "Date" },
  { type: "Datetime",     Icon: CalendarClock,    desc: "Date with time of day.",          group: "Date" },
  { type: "Email",        Icon: AtSign,           desc: "Email address.",                  group: "Contact" },
  { type: "Phone",        Icon: Phone,            desc: "Phone number.",                   group: "Contact" },
  { type: "URL",          Icon: Globe,            desc: "Web link.",                       group: "Contact" },
  {
    type: "Link",
    Icon: Link2,
    desc: "Reference to a master record.",
    group: "Reference",
    hasOptions: true,
    optionsLabel: "Linked entity",
    optionsHint: "Master table / custom record name.",
    optionsPlaceholder: "Employee",
  },
  { type: "Attach",       Icon: Paperclip,        desc: "Upload a single file.",           group: "Reference" },
];

const FIELD_TYPE_MAP = Object.fromEntries(
  FIELD_TYPES.map((f) => [f.type, f]),
) as Record<FieldType, FieldTypeMeta>;

const TYPE_GROUP_ORDER: FieldTypeMeta["group"][] = [
  "Text",
  "Choice",
  "Numeric",
  "Date",
  "Contact",
  "Reference",
];

const RESERVED_KEYS = new Set([
  "id",
  "name",
  "owner",
  "creation",
  "modified",
  "modified_by",
  "doctype",
  "parent",
  "docstatus",
  "idx",
]);

const TEXT_TYPES: FieldType[] = ["Data", "Long Text", "Email", "Phone", "URL"];
const NUMERIC_TYPES: FieldType[] = ["Number", "Decimal", "Currency"];

// ────────────────────────────────────────────────────────────────────────────
// Entity catalog — grouped by module, one Custom Form per entity.
// ────────────────────────────────────────────────────────────────────────────

type Entity = { name: string; hint: string };
type EntityGroup = { group: string; entities: Entity[] };

const ENTITY_GROUPS: EntityGroup[] = [
  {
    group: "Sales",
    entities: [
      { name: "Quotation",      hint: "QTN" },
      { name: "Sales Order",    hint: "SO" },
      { name: "Sales Invoice",  hint: "SI" },
      { name: "Delivery Note",  hint: "DN" },
      { name: "Credit Note",    hint: "CN" },
    ],
  },
  {
    group: "Purchasing",
    entities: [
      { name: "Purchase Order",    hint: "PO" },
      { name: "Purchase Invoice",  hint: "PI" },
      { name: "Receipt",           hint: "RCP" },
    ],
  },
  {
    group: "Inventory",
    entities: [
      { name: "Item",                  hint: "ITM" },
      { name: "Inventory Location",    hint: "LOC" },
      { name: "Transfer Order",        hint: "TRO" },
      { name: "Stock Adjustment",      hint: "ADJ" },
      { name: "Stock Reconciliation",  hint: "REC" },
    ],
  },
  {
    group: "Finance",
    entities: [
      { name: "Journal Entry",  hint: "JE" },
      { name: "Payment",        hint: "PMT" },
      { name: "Expense Claim",  hint: "EXP" },
    ],
  },
  {
    group: "CRM",
    entities: [
      { name: "Lead",      hint: "LD" },
      { name: "Customer",  hint: "CUST" },
      { name: "Supplier",  hint: "SUP" },
    ],
  },
  {
    group: "HR & Operations",
    entities: [
      { name: "Employee", hint: "EMP" },
      { name: "Project",  hint: "PRJ" },
    ],
  },
];

const ALL_ENTITIES: Entity[] = ENTITY_GROUPS.flatMap((g) => g.entities);
function entityHint(name: string): string {
  return ALL_ENTITIES.find((e) => e.name === name)?.hint ?? "";
}
function entityGroupOf(name: string): string | undefined {
  return ENTITY_GROUPS.find((g) =>
    g.entities.some((e) => e.name === name),
  )?.group;
}

// ════════════════════════════════════════════════════════════════════════════
// STATE + REDUCER
// ════════════════════════════════════════════════════════════════════════════

type State = {
  entity: string;
  forms: Record<string, CustomForm>;
  /**
   * Per-entity selection. The value is either FORM_SETTINGS_ID (the
   * form-level settings card) or a CustomField.id.
   */
  selectedIds: Record<string, string | null>;
  dirtyEntities: Record<string, boolean>;
  saving: boolean;
  savedAt: number | null;
  undoSnapshot: {
    entity: string;
    field: CustomField;
    index: number;
  } | null;
  toast:
    | { kind: "delete"; message: string; createdAt: number; undoable: true }
    | { kind: "save";   message: string; createdAt: number; undoable?: false }
    | null;
};

type Action =
  | { kind: "ADD_FIELD"; fieldType?: FieldType }
  | { kind: "DUPLICATE_FIELD"; id: string }
  | { kind: "DELETE_FIELD"; id: string }
  | { kind: "UNDO_DELETE" }
  | { kind: "UPDATE_FIELD"; id: string; patch: Partial<CustomField> }
  | { kind: "REORDER_FIELDS"; from: number; to: number }
  | { kind: "MOVE_FIELD"; id: string; direction: "up" | "down" }
  | {
      kind: "UPDATE_FORM";
      patch: Partial<Omit<CustomForm, "fields" | "entity" | "formId">>;
    }
  | { kind: "SELECT"; id: string | null }
  | { kind: "CHANGE_ENTITY"; entity: string }
  | { kind: "SAVE_START" }
  | { kind: "SAVE_DONE" }
  | { kind: "DISMISS_TOAST" };

function makeId(): string {
  return `f-${Math.random().toString(36).slice(2, 9)}`;
}

function toFieldKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function ensureUniqueKey(
  base: string,
  all: CustomField[],
  skipId?: string,
): string {
  const safe = base || "field";
  const taken = new Set(
    all.filter((f) => f.id !== skipId).map((f) => f.fieldKey),
  );
  if (!taken.has(safe) && !RESERVED_KEYS.has(safe)) return safe;
  let i = 2;
  while (taken.has(`${safe}_${i}`) || RESERVED_KEYS.has(`${safe}_${i}`)) i++;
  return `${safe}_${i}`;
}

function makeEmptyForm(entity: string, state: State): CustomForm {
  const allIds = Object.values(state.forms).map((f) => f.formId);
  const formId = allIds.length ? Math.max(...allIds) + 1 : 1001;
  return { entity, formId, fields: [] };
}

function getForm(state: State, entity?: string): CustomForm {
  const e = entity ?? state.entity;
  return state.forms[e] ?? makeEmptyForm(e, state);
}

function withForm(
  state: State,
  form: CustomForm,
  entity?: string,
): State {
  const e = entity ?? state.entity;
  return { ...state, forms: { ...state.forms, [e]: form } };
}

function markDirty(state: State, entity?: string): State {
  const e = entity ?? state.entity;
  if (state.dirtyEntities[e]) return state;
  return {
    ...state,
    dirtyEntities: { ...state.dirtyEntities, [e]: true },
  };
}

function withSelection(
  state: State,
  id: string | null,
  entity?: string,
): State {
  const e = entity ?? state.entity;
  return {
    ...state,
    selectedIds: { ...state.selectedIds, [e]: id },
  };
}

function renumber(fields: CustomField[]): CustomField[] {
  return fields.map((f, i) => ({ ...f, displayOrder: i + 1 }));
}

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case "ADD_FIELD": {
      const form = getForm(state);
      const id = makeId();
      const label = "New field";
      const fieldKey = ensureUniqueKey(toFieldKey(label), form.fields);
      const newField: CustomField = {
        id,
        label,
        fieldKey,
        fieldType: action.fieldType ?? "Data",
        displayOrder: form.fields.length + 1,
        displayMode: "Normal",
      };
      let next = withForm(state, {
        ...form,
        fields: [...form.fields, newField],
      });
      next = withSelection(next, id);
      return markDirty(next);
    }
    case "DUPLICATE_FIELD": {
      const form = getForm(state);
      const idx = form.fields.findIndex((f) => f.id === action.id);
      if (idx === -1) return state;
      const src = form.fields[idx];
      const id = makeId();
      const fieldKey = ensureUniqueKey(src.fieldKey, form.fields);
      const newField: CustomField = {
        ...src,
        id,
        fieldKey,
        label: `${src.label} (copy)`,
        fieldKeyTouched: true,
      };
      const fields = [...form.fields];
      fields.splice(idx + 1, 0, newField);
      let next = withForm(state, { ...form, fields: renumber(fields) });
      next = withSelection(next, id);
      return markDirty(next);
    }
    case "DELETE_FIELD": {
      const form = getForm(state);
      const idx = form.fields.findIndex((f) => f.id === action.id);
      if (idx === -1) return state;
      const field = form.fields[idx];
      const fields = renumber(form.fields.filter((f) => f.id !== action.id));
      const wasSelected =
        state.selectedIds[state.entity] === action.id;
      let next = withForm(state, { ...form, fields });
      if (wasSelected) {
        const nextSel =
          fields[idx]?.id ??
          fields[Math.max(0, idx - 1)]?.id ??
          FORM_SETTINGS_ID;
        next = withSelection(next, nextSel);
      }
      next = markDirty(next);
      return {
        ...next,
        undoSnapshot: { entity: state.entity, field, index: idx },
        toast: {
          kind: "delete",
          message: `Deleted "${field.label || FIELD_TYPE_MAP[field.fieldType].type}" from ${state.entity}`,
          createdAt: Date.now(),
          undoable: true,
        },
      };
    }
    case "UNDO_DELETE": {
      if (!state.undoSnapshot) return state;
      const { entity, field, index } = state.undoSnapshot;
      const form = getForm(state, entity);
      const fields = [...form.fields];
      fields.splice(Math.min(index, fields.length), 0, field);
      let next = withForm(
        state,
        { ...form, fields: renumber(fields) },
        entity,
      );
      next = withSelection(next, field.id, entity);
      return { ...next, entity, undoSnapshot: null, toast: null };
    }
    case "UPDATE_FIELD": {
      const form = getForm(state);
      const fields = form.fields.map((f) => {
        if (f.id !== action.id) return f;
        const merged: CustomField = { ...f, ...action.patch };
        if (action.patch.label !== undefined && !merged.fieldKeyTouched) {
          merged.fieldKey = ensureUniqueKey(
            toFieldKey(merged.label || "field"),
            form.fields,
            f.id,
          );
        }
        if (action.patch.fieldKey !== undefined) {
          merged.fieldKeyTouched = true;
        }
        return merged;
      });
      return markDirty(withForm(state, { ...form, fields }));
    }
    case "REORDER_FIELDS": {
      if (action.from === action.to || action.from === action.to - 1)
        return state;
      const form = getForm(state);
      const fields = [...form.fields];
      const [moved] = fields.splice(action.from, 1);
      const to = action.to > action.from ? action.to - 1 : action.to;
      fields.splice(to, 0, moved);
      return markDirty(withForm(state, { ...form, fields: renumber(fields) }));
    }
    case "MOVE_FIELD": {
      const form = getForm(state);
      const idx = form.fields.findIndex((f) => f.id === action.id);
      if (idx === -1) return state;
      const swap = action.direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= form.fields.length) return state;
      const fields = [...form.fields];
      [fields[idx], fields[swap]] = [fields[swap], fields[idx]];
      return markDirty(withForm(state, { ...form, fields: renumber(fields) }));
    }
    case "UPDATE_FORM": {
      const form = getForm(state);
      return markDirty(withForm(state, { ...form, ...action.patch }));
    }
    case "SELECT":
      return withSelection(state, action.id);
    case "CHANGE_ENTITY": {
      let next = state;
      if (!next.forms[action.entity]) {
        next = {
          ...next,
          forms: {
            ...next.forms,
            [action.entity]: makeEmptyForm(action.entity, next),
          },
        };
      }
      if (!(action.entity in next.selectedIds)) {
        next = {
          ...next,
          selectedIds: {
            ...next.selectedIds,
            [action.entity]: FORM_SETTINGS_ID,
          },
        };
      }
      return { ...next, entity: action.entity };
    }
    case "SAVE_START":
      return { ...state, saving: true };
    case "SAVE_DONE": {
      const nextDirty = { ...state.dirtyEntities };
      delete nextDirty[state.entity];
      return {
        ...state,
        saving: false,
        savedAt: Date.now(),
        dirtyEntities: nextDirty,
        undoSnapshot: null,
        toast: {
          kind: "save",
          message: `Saved Custom Form for ${state.entity}`,
          createdAt: Date.now(),
        },
      };
    }
    case "DISMISS_TOAST":
      return { ...state, toast: null };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SEED
// ════════════════════════════════════════════════════════════════════════════

const SEED_FORMS: Record<string, CustomForm> = {
  "Inventory Location": {
    entity: "Inventory Location",
    formId: 1001,
    emailMessageTemplate: "Location Notification",
    printTemplate: "Location Card",
    storeFormWithRecord: true,
    fields: [
      {
        id: "f-loc-1",
        label: "Branch Code",
        fieldKey: "branch_code",
        fieldType: "Data",
        displayOrder: 1,
        required: true,
        displayMode: "Normal",
        description: "3-letter branch code, e.g. KTM, PKR.",
        helpText: "Use the standard branch abbreviation.",
        maxLength: 8,
        fieldKeyTouched: true,
      },
      {
        id: "f-loc-2",
        label: "Capacity (sq.ft)",
        fieldKey: "capacity_sqft",
        fieldType: "Number",
        displayOrder: 2,
        displayMode: "Normal",
        description: "Total usable area.",
        minValue: 0,
        maxValue: 100000,
        fieldKeyTouched: true,
      },
      {
        id: "f-loc-3",
        label: "Storage Type",
        fieldKey: "storage_type",
        fieldType: "Select",
        displayOrder: 3,
        required: true,
        displayMode: "Normal",
        options: "Dry\nCold\nHazardous\nBonded",
        defaultValue: "Dry",
        fieldKeyTouched: true,
      },
      {
        id: "f-loc-4",
        label: "Location Manager",
        fieldKey: "location_manager",
        fieldType: "Link",
        displayOrder: 4,
        displayMode: "Normal",
        options: "Employee",
        helpText: "Person on duty for this location.",
        fieldKeyTouched: true,
      },
    ],
  },
  "Sales Invoice": {
    entity: "Sales Invoice",
    formId: 1002,
    printTemplate: "Standard Invoice",
    emailTemplate: "Invoice Sent",
    allowAddMultiple: true,
    fields: [
      {
        id: "f-si-1",
        label: "Tax ID Verified",
        fieldKey: "tax_id_verified",
        fieldType: "Check",
        displayOrder: 1,
        displayMode: "Normal",
        defaultValue: "0",
        description: "Mark after PAN/VAT cross-check.",
        fieldKeyTouched: true,
      },
      {
        id: "f-si-2",
        label: "Project Code",
        fieldKey: "project_code",
        fieldType: "Link",
        displayOrder: 2,
        required: true,
        displayMode: "Normal",
        options: "Project",
        helpText: "Tag this invoice to a project for cost tracking.",
        fieldKeyTouched: true,
      },
      {
        id: "f-si-3",
        label: "Approval Memo",
        fieldKey: "approval_memo",
        fieldType: "Long Text",
        displayOrder: 3,
        displayMode: "Normal",
        maxLength: 500,
        description: "Internal notes — not on the printed invoice.",
        fieldKeyTouched: true,
      },
    ],
  },
  "Sales Order": {
    entity: "Sales Order",
    formId: 1003,
    storeFormWithRecord: true,
    fields: [
      {
        id: "f-so-1",
        label: "Loyalty Tier",
        fieldKey: "loyalty_tier",
        fieldType: "Data",
        displayOrder: 1,
        displayMode: "Normal",
        maxLength: 32,
        description: "Bronze / Silver / Gold / Platinum.",
        fieldKeyTouched: true,
      },
      {
        id: "f-so-2",
        label: "Account Manager",
        fieldKey: "account_manager",
        fieldType: "Link",
        displayOrder: 2,
        required: true,
        displayMode: "Normal",
        options: "Employee",
        fieldKeyTouched: true,
      },
    ],
  },
  "Stock Adjustment": {
    entity: "Stock Adjustment",
    formId: 1004,
    fields: [
      {
        id: "f-adj-1",
        label: "Reason Code",
        fieldKey: "reason_code",
        fieldType: "Select",
        displayOrder: 1,
        required: true,
        displayMode: "Normal",
        options: "Damage\nLoss\nCount Variance\nReturn",
        defaultValue: "Damage",
        fieldKeyTouched: true,
      },
      {
        id: "f-adj-2",
        label: "Approval Memo",
        fieldKey: "approval_memo",
        fieldType: "Long Text",
        displayOrder: 2,
        displayMode: "Normal",
        maxLength: 500,
        fieldKeyTouched: true,
      },
    ],
  },
  "Transfer Order": {
    entity: "Transfer Order",
    formId: 1005,
    fields: [
      {
        id: "f-tro-1",
        label: "Origin Branch",
        fieldKey: "origin_branch",
        fieldType: "Link",
        displayOrder: 1,
        required: true,
        displayMode: "Normal",
        options: "Inventory Location",
        fieldKeyTouched: true,
      },
    ],
  },
  Customer: {
    entity: "Customer",
    formId: 1006,
    formIsPreferred: true,
    fields: [
      {
        id: "f-cust-1",
        label: "Loyalty Tier",
        fieldKey: "loyalty_tier",
        fieldType: "Data",
        displayOrder: 1,
        displayMode: "Normal",
        description: "Bronze / Silver / Gold / Platinum.",
        fieldKeyTouched: true,
      },
      {
        id: "f-cust-2",
        label: "Account Manager",
        fieldKey: "account_manager",
        fieldType: "Link",
        displayOrder: 2,
        required: true,
        displayMode: "Normal",
        options: "Employee",
        fieldKeyTouched: true,
      },
      {
        id: "f-cust-3",
        label: "Preferred Channel",
        fieldKey: "preferred_channel",
        fieldType: "Select",
        displayOrder: 3,
        displayMode: "Normal",
        options: "Email\nPhone\nWhatsApp\nIn person",
        defaultValue: "Email",
        fieldKeyTouched: true,
      },
      {
        id: "f-cust-4",
        label: "Auto-send invoices",
        fieldKey: "auto_send_invoices",
        fieldType: "Check",
        displayOrder: 4,
        displayMode: "Normal",
        defaultValue: "1",
        fieldKeyTouched: true,
      },
    ],
  },
  "Purchase Invoice": {
    entity: "Purchase Invoice",
    formId: 1007,
    fields: [
      {
        id: "f-pi-1",
        label: "Vendor Discount %",
        fieldKey: "vendor_discount_pct",
        fieldType: "Decimal",
        displayOrder: 1,
        displayMode: "Normal",
        minValue: 0,
        maxValue: 100,
        fieldKeyTouched: true,
      },
    ],
  },
};

const INITIAL_STATE: State = {
  entity: "Inventory Location",
  forms: SEED_FORMS,
  selectedIds: {
    "Inventory Location": FORM_SETTINGS_ID,
    "Sales Invoice": "f-si-2",
    "Sales Order": "f-so-2",
  },
  dirtyEntities: {},
  saving: false,
  savedAt: Date.now() - 1000 * 60 * 4,
  undoSnapshot: null,
  toast: null,
};

// ════════════════════════════════════════════════════════════════════════════
// POPOVER (portal-positioned, click-outside, esc-to-close)
// ════════════════════════════════════════════════════════════════════════════

type PopoverAlign = "start" | "end" | "center";

function Popover({
  anchorRef,
  open,
  onClose,
  align = "start",
  offset = 6,
  minWidth,
  maxWidth,
  className,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  align?: PopoverAlign;
  offset?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    anchorWidth: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + offset,
      left:
        align === "end"
          ? rect.right
          : align === "center"
            ? rect.left + rect.width / 2
            : rect.left,
      anchorWidth: rect.width,
    });
  }, [open, anchorRef, align, offset]);

  React.useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(t) &&
        anchorRef.current &&
        !anchorRef.current.contains(t)
      ) {
        onClose();
      }
    }
    function onScroll(e: Event) {
      // ignore scrolls that originate inside the floating surface itself
      const t = e.target as Node | null;
      if (t && ref.current && (ref.current === t || ref.current.contains(t))) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    top: pos.top,
    minWidth: minWidth ?? Math.max(pos.anchorWidth, 220),
    maxWidth: maxWidth ?? 380,
  };
  if (align === "end") {
    style.right = window.innerWidth - pos.left;
  } else if (align === "center") {
    style.left = pos.left;
    style.transform = "translateX(-50%)";
  } else {
    style.left = pos.left;
  }

  return createPortal(
    <div
      ref={ref}
      style={style}
      className={cn(
        "z-50 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface",
        "shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TYPE PICKER
// ════════════════════════════════════════════════════════════════════════════

function TypePicker({
  anchorRef,
  open,
  onClose,
  currentType,
  onSelect,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  currentType?: FieldType;
  onSelect: (type: FieldType) => void;
}) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? FIELD_TYPES.filter(
        (f) =>
          f.type.toLowerCase().includes(q) ||
          f.desc.toLowerCase().includes(q) ||
          f.group.toLowerCase().includes(q),
      )
    : FIELD_TYPES;

  const grouped: Record<string, FieldTypeMeta[]> = {};
  for (const ft of filtered) {
    (grouped[ft.group] ??= []).push(ft);
  }

  return (
    <Popover
      anchorRef={anchorRef}
      open={open}
      onClose={onClose}
      align="start"
      minWidth={360}
      maxWidth={400}
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-9 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search field types…"
            className="flex-1 bg-transparent text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"
              aria-label="Clear search"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-8 text-center text-[12px] text-bz-text-muted">
            No field types match "{query}".
          </p>
        ) : (
          TYPE_GROUP_ORDER.filter((g) => grouped[g]?.length).map((group, gi) => (
            <div key={group} className={gi === 0 ? "" : "mt-3"}>
              <p className="px-1.5 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                {group}
              </p>
              <div className="grid grid-cols-3 gap-1">
                {grouped[group].map((ft) => {
                  const active = currentType === ft.type;
                  const Icon = ft.Icon;
                  return (
                    <button
                      key={ft.type}
                      onClick={() => {
                        onSelect(ft.type);
                        onClose();
                      }}
                      title={ft.desc}
                      className={cn(
                        "group flex flex-col items-start gap-2 rounded-bz-sm border p-2.5 text-left transition-colors",
                        active
                          ? "border-bz-text bg-bz-fire/[0.10]"
                          : "border-transparent hover:border-bz-line-soft hover:bg-bz-paper-warm",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-bz-sm",
                          active
                            ? "bg-bz-fire/40 text-bz-text"
                            : "bg-bz-surface text-bz-text-muted group-hover:text-bz-text",
                        )}
                      >
                        <Icon size={13} strokeWidth={1.7} />
                      </span>
                      <span className="text-[11.5px] font-medium text-bz-text leading-tight">
                        {ft.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Popover>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// KEBAB MENU
// ════════════════════════════════════════════════════════════════════════════

type MenuItem = {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

function MenuList({
  groups,
  onClose,
}: {
  groups: MenuItem[][];
  onClose: () => void;
}) {
  return (
    <div className="py-1">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <div className="my-1 h-px bg-bz-line-soft" />}
          {group.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect();
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px]",
                  item.disabled
                    ? "cursor-not-allowed text-bz-text-soft"
                    : item.destructive
                      ? "text-[#9A2E29] hover:bg-[#FBE7E5]"
                      : "text-bz-text hover:bg-bz-paper-warm",
                )}
              >
                {Icon && (
                  <Icon
                    size={12}
                    className={cn(
                      item.destructive
                        ? "text-[#9A2E29]"
                        : item.disabled
                          ? "text-bz-text-soft"
                          : "text-bz-text-muted",
                    )}
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSPECTOR ATOMS (Switch, Checkbox, Segmented, TextRow, NumberRow, Textarea)
// ════════════════════════════════════════════════════════════════════════════

function InspectorSwitch({
  value,
  onChange,
  ariaLabel,
}: {
  value?: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!value}
      aria-label={ariaLabel}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value
          ? "border-bz-fire bg-bz-fire"
          : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute h-3 w-3 rounded-bz-pill bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.18)] transition-transform",
          value ? "translate-x-[14px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

function InspectorSegmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid w-full grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "h-7 rounded-bz-sm text-[12px] font-medium transition-colors",
              active
                ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]"
                : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function InspectorSection({
  title,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-bz-line-soft last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-bz-paper-warm/40"
      >
        <span className="flex items-center gap-2">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text-muted">
            {title}
          </span>
          {badge}
        </span>
        <ChevronDown
          size={12}
          className={cn(
            "text-bz-text-soft transition-transform",
            open ? "" : "-rotate-90",
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-3 px-4 pb-4 pt-1">{children}</div>
      )}
    </div>
  );
}

function InspectorTextRow({
  label,
  hint,
  value,
  onChange,
  placeholder,
  mono,
  inputRef,
  error,
  required,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  error?: string;
  required?: boolean;
  type?: "text" | "email" | "url" | "tel";
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] text-bz-text-muted">
          {label}
          {required && <span className="ml-0.5 text-bz-text">*</span>}
        </label>
        {error ? (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#9A2E29]">
            <AlertCircle size={10} /> {error}
          </span>
        ) : hint ? (
          <span className="text-[10px] text-bz-text-soft">{hint}</span>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-bz-md border bg-bz-surface px-3 text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft transition-colors",
          error
            ? "border-[#C0413A] focus:border-[#9A2E29]"
            : "border-bz-line-soft focus:border-bz-text",
          mono && "tracking-[0.005em]",
        )}
      />
    </div>
  );
}

function InspectorTextareaRow({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] text-bz-text-muted">{label}</label>
        {hint && <span className="text-[10px] text-bz-text-soft">{hint}</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
      />
    </div>
  );
}

function InspectorNumberRow({
  label,
  hint,
  value,
  onChange,
  placeholder,
  min,
  max,
  suffix,
}: {
  label: string;
  hint?: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] text-bz-text-muted">{label}</label>
        {hint && <span className="text-[10px] text-bz-text-soft">{hint}</span>}
      </div>
      <div className="flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 focus-within:border-bz-text">
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? undefined : Number(v));
          }}
          min={min}
          max={max}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-[13px] tabular-nums text-bz-text outline-none placeholder:text-bz-text-soft"
        />
        {suffix && (
          <span className="ml-2 text-[11px] text-bz-text-soft">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function InspectorToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-0.5">
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] text-bz-text">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-bz-text-soft">
            {hint}
          </p>
        )}
      </div>
      <InspectorSwitch value={value} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

/** Search-style picker row used by the form-settings templates. */
function InspectorPickerRow({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] text-bz-text-muted">{label}</label>
        {hint && <span className="text-[10px] text-bz-text-soft">{hint}</span>}
      </div>
      <div className="flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 focus-within:border-bz-text">
        <Search size={12} className="shrink-0 text-bz-text-muted" />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Search…"}
          className="h-full w-full bg-transparent text-[13px] text-bz-text outline-none placeholder:text-bz-text-soft"
        />
        {value ? (
          <button
            onClick={() => onChange("")}
            className="flex size-5 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
            aria-label="Clear"
          >
            <X size={10} />
          </button>
        ) : (
          <ChevronDown size={12} className="shrink-0 text-bz-text-muted" />
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD ROW — flat selectable row in the field list
// ════════════════════════════════════════════════════════════════════════════

function FieldRow({
  field,
  index,
  count,
  selected,
  isDragging,
  onSelect,
  onDuplicate,
  onDelete,
  onChangeType,
  onMove,
  onDragHandleMouseDown,
  onDragHandleMouseUp,
  rowRefSetter,
}: {
  field: CustomField;
  index: number;
  count: number;
  selected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onChangeType: (type: FieldType) => void;
  onMove: (direction: "up" | "down") => void;
  onDragHandleMouseDown: () => void;
  onDragHandleMouseUp: () => void;
  rowRefSetter: (el: HTMLDivElement | null) => void;
}) {
  const meta = FIELD_TYPE_MAP[field.fieldType];
  const Icon = meta.Icon;
  const typeRef = React.useRef<HTMLButtonElement>(null);
  const kebabRef = React.useRef<HTMLButtonElement>(null);
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [kebabOpen, setKebabOpen] = React.useState(false);

  const isDisabled = field.displayMode === "Disabled";
  const isHidden = field.displayMode === "Hidden";

  return (
    <div
      ref={rowRefSetter}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onFocus={onSelect}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("[data-row-action]")) return;
        onSelect();
      }}
      className={cn(
        "group relative flex h-12 items-center gap-2 rounded-bz-md border pl-1 pr-1.5 transition-colors",
        selected
          ? "border-bz-text bg-bz-surface shadow-[0_1px_2px_rgba(15,20,17,0.06)]"
          : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
        isDragging && "opacity-40",
        "cursor-pointer outline-none",
      )}
    >
      {/* Selection indicator bar */}
      <span
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-bz-pill bg-bz-fire transition-opacity",
          selected ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      {/* Drag handle */}
      <div
        data-row-action
        onMouseDown={onDragHandleMouseDown}
        onMouseUp={onDragHandleMouseUp}
        onMouseLeave={onDragHandleMouseUp}
        className={cn(
          "flex h-full w-6 cursor-grab items-center justify-center text-bz-text-soft opacity-0 transition-opacity",
          "group-hover:opacity-100 focus-within:opacity-100 active:cursor-grabbing",
          selected && "opacity-100",
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} strokeWidth={1.8} />
      </div>

      {/* Display-order chip */}
      <span className="hidden h-5 min-w-[28px] shrink-0 items-center justify-center rounded-bz-sm bg-bz-deep px-1.5 text-[10px] font-semibold tabular-nums text-bz-paper sm:inline-flex">
        #{field.displayOrder}
      </span>

      {/* Type icon (click to change type) */}
      <button
        ref={typeRef}
        data-row-action
        onClick={(e) => {
          e.stopPropagation();
          setTypeOpen((v) => !v);
        }}
        title={`${meta.type} — click to change type`}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-bz-sm border text-bz-text-muted transition-colors",
          typeOpen
            ? "border-bz-text bg-bz-paper-warm text-bz-text"
            : "border-transparent hover:border-bz-line-soft hover:bg-bz-paper-warm hover:text-bz-text",
        )}
      >
        <Icon size={13} strokeWidth={1.8} />
      </button>
      <TypePicker
        anchorRef={typeRef}
        open={typeOpen}
        onClose={() => setTypeOpen(false)}
        currentType={field.fieldType}
        onSelect={onChangeType}
      />

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[13px] font-medium",
            isHidden ? "text-bz-text-soft line-through" : "text-bz-text",
          )}
        >
          {field.label || (
            <span className="text-bz-text-soft">Untitled field</span>
          )}
        </p>
      </div>

      {/* Field key (small, muted, hidden on small screens) */}
      <p
        className="hidden truncate text-[11px] tracking-[0.005em] text-bz-text-soft md:block md:max-w-[160px] lg:max-w-[180px]"
        title={field.fieldKey}
      >
        {field.fieldKey}
      </p>

      {/* Type pill */}
      <span className="hidden shrink-0 items-center rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-medium text-bz-text-muted sm:inline-flex">
        {meta.type}
      </span>

      {/* Display-mode chip (only if not Normal) */}
      {(isDisabled || isHidden) && (
        <span
          className={cn(
            "shrink-0 rounded-bz-pill px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]",
            isHidden
              ? "bg-bz-paper-warm text-bz-text-soft"
              : "bg-bz-leaf/40 text-bz-text",
          )}
        >
          {field.displayMode}
        </span>
      )}

      {/* Required dot */}
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-bz-pill transition-opacity",
          field.required ? "bg-bz-fire opacity-100" : "opacity-0",
        )}
        title={field.required ? "Required" : undefined}
      />

      {/* Kebab */}
      <button
        ref={kebabRef}
        data-row-action
        onClick={(e) => {
          e.stopPropagation();
          setKebabOpen((v) => !v);
        }}
        className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
        aria-label="More actions"
      >
        <MoreHorizontal size={14} />
      </button>
      <Popover
        anchorRef={kebabRef}
        open={kebabOpen}
        onClose={() => setKebabOpen(false)}
        align="end"
        minWidth={172}
        maxWidth={220}
      >
        <MenuList
          onClose={() => setKebabOpen(false)}
          groups={[
            [
              { label: "Duplicate", icon: Copy, onSelect: onDuplicate },
              {
                label: "Move up",
                icon: ArrowUp,
                onSelect: () => onMove("up"),
                disabled: index === 0,
              },
              {
                label: "Move down",
                icon: ArrowDown,
                onSelect: () => onMove("down"),
                disabled: index === count - 1,
              },
            ],
            [
              {
                label: "Delete",
                icon: Trash2,
                onSelect: onDelete,
                destructive: true,
              },
            ],
          ]}
        />
      </Popover>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FORM SETTINGS CARD — the first selectable item in the list
// ════════════════════════════════════════════════════════════════════════════

function FormSettingsCard({
  form,
  selected,
  fieldCount,
  onSelect,
  rowRefSetter,
}: {
  form: CustomForm;
  selected: boolean;
  fieldCount: number;
  onSelect: () => void;
  rowRefSetter: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={rowRefSetter}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onFocus={onSelect}
      onClick={onSelect}
      className={cn(
        "relative flex items-center gap-3 rounded-bz-md border pl-2 pr-3 py-2.5 transition-colors cursor-pointer outline-none",
        selected
          ? "border-bz-text bg-bz-fire/[0.06] shadow-[0_1px_2px_rgba(15,20,17,0.06)]"
          : "border-bz-line-soft bg-bz-paper-warm/40 hover:border-bz-line hover:bg-bz-paper-warm",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-bz-pill bg-bz-fire transition-opacity",
          selected ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-bz-sm",
          selected
            ? "bg-bz-deep text-bz-paper"
            : "bg-bz-surface text-bz-text-muted",
        )}
      >
        <Settings size={14} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            Form Settings
          </p>
          <span className="hidden text-[10.5px] tabular-nums text-bz-text-soft sm:inline">
            · Form #{form.formId}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-bz-text">
          {form.entity}
        </p>
      </div>
      <span className="hidden shrink-0 text-[10.5px] tabular-nums text-bz-text-muted sm:inline">
        {fieldCount} {fieldCount === 1 ? "field" : "fields"}
      </span>
      <ChevronRight size={12} className="shrink-0 text-bz-text-soft" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIVE PREVIEW — renders the form mock as the end-user would see it
// ════════════════════════════════════════════════════════════════════════════

function PreviewFieldRow({ field }: { field: CustomField }) {
  if (field.displayMode === "Hidden") return null;
  const disabled = field.displayMode === "Disabled";
  const baseInput = cn(
    "flex h-9 w-full items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[13px] text-bz-text",
    disabled && "cursor-not-allowed bg-bz-paper-warm text-bz-text-muted",
  );
  const muted = "text-bz-text-soft";

  let input: React.ReactNode = null;
  switch (field.fieldType) {
    case "Data":
      input = (
        <div className={baseInput}>
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "Enter text…"}
          </span>
        </div>
      );
      break;
    case "Long Text":
      input = (
        <div
          className={cn(
            "flex min-h-[80px] w-full rounded-bz-md border border-bz-line-soft bg-bz-surface p-3 text-[13px]",
            disabled && "bg-bz-paper-warm text-bz-text-muted",
          )}
        >
          <span className={field.defaultValue ? "text-bz-text" : muted}>
            {field.defaultValue || "Long-form text…"}
          </span>
        </div>
      );
      break;
    case "Number":
      input = (
        <div className={cn(baseInput, "tabular-nums")}>
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "0"}
          </span>
        </div>
      );
      break;
    case "Decimal":
      input = (
        <div className={cn(baseInput, "tabular-nums")}>
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "0.00"}
          </span>
        </div>
      );
      break;
    case "Currency":
      input = (
        <div className={cn(baseInput, "gap-2 tabular-nums")}>
          <span className="text-[11px] font-semibold text-bz-text-soft">
            NPR
          </span>
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "0.00"}
          </span>
        </div>
      );
      break;
    case "Date":
      input = (
        <div className={cn(baseInput, "justify-between")}>
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "yyyy-mm-dd"}
          </span>
          <Calendar size={12} className="text-bz-text-muted" />
        </div>
      );
      break;
    case "Datetime":
      input = (
        <div className={cn(baseInput, "justify-between")}>
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "yyyy-mm-dd hh:mm"}
          </span>
          <CalendarClock size={12} className="text-bz-text-muted" />
        </div>
      );
      break;
    case "Check": {
      const isOn = (field.defaultValue ?? "").trim() === "1";
      return (
        <div className="flex items-start gap-2.5 py-1">
          <span
            className={cn(
              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-bz-sm border",
              isOn
                ? "border-bz-text bg-bz-text text-bz-paper"
                : "border-bz-line bg-bz-surface text-transparent",
              disabled && "opacity-60",
            )}
          >
            <Check size={11} strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] text-bz-text">
              {field.label || "Untitled"}
              {field.required && (
                <span className="ml-0.5 text-bz-text">*</span>
              )}
            </p>
            {field.helpText && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-bz-text-soft">
                {field.helpText}
              </p>
            )}
          </div>
        </div>
      );
    }
    case "Select": {
      const first = (field.options ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)[0];
      input = (
        <div className={cn(baseInput, "justify-between")}>
          <span className={field.defaultValue || first ? "" : muted}>
            {field.defaultValue || first || "Choose…"}
          </span>
          <ChevronDown size={12} className="text-bz-text-muted" />
        </div>
      );
      break;
    }
    case "Multi-Select": {
      const options = (field.options ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      input = (
        <div className={cn(baseInput, "h-auto min-h-9 flex-wrap gap-1 py-1.5")}>
          {options.slice(0, 2).length === 0 ? (
            <span className={muted}>Choose one or more…</span>
          ) : (
            options.slice(0, 2).map((o) => (
              <span
                key={o}
                className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-paper-warm px-1.5 py-0.5 text-[11px] text-bz-text"
              >
                {o}
                <X size={9} className="text-bz-text-muted" />
              </span>
            ))
          )}
        </div>
      );
      break;
    }
    case "Email":
      input = (
        <div className={cn(baseInput, "gap-2")}>
          <AtSign size={12} className="text-bz-text-muted" />
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "name@company.com"}
          </span>
        </div>
      );
      break;
    case "Phone":
      input = (
        <div className={cn(baseInput, "gap-2 tabular-nums")}>
          <Phone size={12} className="text-bz-text-muted" />
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "+977 98XXXXXXXX"}
          </span>
        </div>
      );
      break;
    case "URL":
      input = (
        <div className={cn(baseInput, "gap-2")}>
          <Globe size={12} className="text-bz-text-muted" />
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || "https://"}
          </span>
        </div>
      );
      break;
    case "Link": {
      const target = field.options?.trim() || "record";
      input = (
        <div className={cn(baseInput, "justify-between")}>
          <span className={field.defaultValue ? "" : muted}>
            {field.defaultValue || `Search ${target}…`}
          </span>
          <Search size={12} className="text-bz-text-muted" />
        </div>
      );
      break;
    }
    case "Attach":
      input = (
        <div className="flex h-12 w-full items-center justify-between rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/40 px-3">
          <span className="inline-flex items-center gap-2 text-[12px] text-bz-text-muted">
            <Paperclip size={12} /> Drop a file, or browse…
          </span>
          <span className="text-[10.5px] text-bz-text-soft">up to 25 MB</span>
        </div>
      );
      break;
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-[11px] font-medium text-bz-text-muted">
          {field.label || (
            <span className="text-bz-text-soft">Untitled</span>
          )}
          {field.required && <span className="ml-0.5 text-bz-text">*</span>}
        </label>
        {disabled && (
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-soft">
            Read-only
          </span>
        )}
      </div>
      {input}
      {field.helpText && field.fieldType !== "Check" && (
        <p className="mt-1 text-[11px] leading-relaxed text-bz-text-soft">
          {field.helpText}
        </p>
      )}
    </div>
  );
}

function LivePreview({
  form,
  fullscreen,
}: {
  form: CustomForm;
  fullscreen?: boolean;
}) {
  const visibleFields = form.fields
    .filter((f) => f.displayMode !== "Hidden")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-5 pb-1 pt-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bz-text-soft">
            Live preview
          </p>
          <p className="mt-1 text-[15px] font-semibold text-bz-text">
            New {form.entity}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-bz-pill border border-bz-line-soft bg-bz-surface px-2 py-0.5 text-[10px] font-medium text-bz-text-muted">
          <span className="size-1.5 rounded-bz-pill bg-bz-fire" /> Auto-syncs
        </span>
      </div>
      <div
        className={cn(
          "px-5 pb-8 pt-4",
          fullscreen ? "mx-auto w-full max-w-[820px]" : "",
        )}
      >
        {visibleFields.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-bz-lg border border-dashed border-bz-line bg-bz-paper-warm/40 p-12 text-center">
            <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted">
              <Sparkles size={14} />
            </span>
            <p className="mt-3 text-[12.5px] font-medium text-bz-text">
              Nothing to preview yet
            </p>
            <p className="mt-1 max-w-[260px] text-[11.5px] text-bz-text-muted">
              Add a field on the left and it will appear here as it'll look on
              the {form.entity} form.
            </p>
          </div>
        ) : (
          <section className="rounded-bz-lg border border-bz-line-soft bg-bz-surface p-5">
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-bz-text-muted">
              Custom fields
            </h3>
            <div className="flex flex-col gap-4">
              {visibleFields.map((f) => (
                <PreviewFieldRow key={f.id} field={f} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EMPTY STATE — when this entity has zero fields
// ════════════════════════════════════════════════════════════════════════════

function FieldListEmptyState({
  entity,
  onAdd,
}: {
  entity: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm/30 px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted">
        <Sparkles size={14} strokeWidth={1.6} />
      </span>
      <p className="mt-3 text-[14px] font-semibold text-bz-text">
        No custom fields on {entity} yet
      </p>
      <p className="mt-1 max-w-[360px] text-[12px] leading-relaxed text-bz-text-muted">
        Add one to extend the {entity} form with the data your team actually
        tracks.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:bg-[#1f2620]"
      >
        <Plus size={13} /> Add first field
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════════════

function Toast({
  state,
  onUndo,
  onDismiss,
}: {
  state: State;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  const toast = state.toast;
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 5500);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isDelete = toast.kind === "delete";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-bz-pill",
            isDelete ? "bg-bz-paper-warm" : "bg-bz-fire/[0.22]",
          )}
        >
          {isDelete ? (
            <Trash2 size={12} className="text-bz-text-muted" />
          ) : (
            <Check size={13} className="text-bz-leaf-deep" />
          )}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">
          {toast.message}
        </p>
        {isDelete && (
          <button
            onClick={onUndo}
            className="ml-1 inline-flex items-center gap-1.5 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2 py-1 text-[11.5px] font-semibold text-bz-text hover:border-bz-text"
          >
            <Undo2 size={11} /> Undo
          </button>
        )}
        <button
          onClick={onDismiss}
          className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
          aria-label="Dismiss"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SAVED-AT helper
// ════════════════════════════════════════════════════════════════════════════

function useRelative(ts: number | null, tickMs = 30_000) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!ts) return;
    const id = window.setInterval(() => setTick((t) => t + 1), tickMs);
    return () => window.clearInterval(id);
  }, [ts, tickMs]);
  if (!ts) return "never";
  const diff = Date.now() - ts;
  if (diff < 30_000) return "just now";
  if (diff < 60_000) return "less than a minute ago";
  const m = Math.round(diff / 60_000);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return `${Math.round(h / 24)} day${Math.round(h / 24) === 1 ? "" : "s"} ago`;
}

// ════════════════════════════════════════════════════════════════════════════
// INSPECTOR — FIELD
// ════════════════════════════════════════════════════════════════════════════

function FieldInspectorHeader({
  field,
  onDuplicate,
  onDelete,
}: {
  field: CustomField;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const meta = FIELD_TYPE_MAP[field.fieldType];
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-bz-line bg-bz-paper px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-sm bg-bz-deep text-[11px] font-bold tabular-nums text-bz-paper">
        #{field.displayOrder}
      </span>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-bz-sm",
          field.required
            ? "bg-bz-fire/[0.22] text-bz-text"
            : "bg-bz-paper-warm text-bz-text-muted",
        )}
      >
        <meta.Icon size={14} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-bz-text">
          {field.label || (
            <span className="text-bz-text-soft">Untitled field</span>
          )}
          {field.required && (
            <span className="ml-1.5 align-middle text-bz-fire" title="Required">
              *
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-bz-text-soft">
          {meta.type}
          <span className="mx-1.5 text-bz-text-soft">·</span>
          <span className="normal-case tracking-[0.005em]">
            {field.fieldKey}
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={onDuplicate}
        title="Duplicate field"
        className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text"
      >
        <Copy size={12} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Delete field"
        className="flex size-7 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-[#FBE7E5] hover:text-[#9A2E29]"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function InspectorFieldKeyRow({
  field,
  allFields,
  onChange,
}: {
  field: CustomField;
  allFields: CustomField[];
  onChange: (v: string) => void;
}) {
  const collision = React.useMemo(() => {
    const v = field.fieldKey.trim();
    if (!v) return "Field key is required";
    if (!/^[a-z][a-z0-9_]*$/.test(v))
      return "Use snake_case (a–z, 0–9, _)";
    if (RESERVED_KEYS.has(v)) return `"${v}" is reserved`;
    if (allFields.some((f) => f.id !== field.id && f.fieldKey === v))
      return "Already used";
    return undefined;
  }, [field.fieldKey, field.id, allFields]);
  return (
    <InspectorTextRow
      label="Field key"
      required
      hint={collision ? undefined : "Auto / unique id"}
      value={field.fieldKey}
      onChange={(v) => onChange(v.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
      placeholder="auto / unique id"
      mono
      error={collision}
    />
  );
}

function InspectorFieldTypeRow({
  field,
  onChangeType,
}: {
  field: CustomField;
  onChangeType: (type: FieldType) => void;
}) {
  const meta = FIELD_TYPE_MAP[field.fieldType];
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] text-bz-text-muted">
          Field type<span className="ml-0.5 text-bz-text">*</span>
        </label>
        {(field.fieldType === "Select" || field.fieldType === "Multi-Select") && (
          <span className="text-[10px] text-bz-text-soft">
            Wire to a master table below
          </span>
        )}
      </div>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-bz-md border bg-bz-surface px-3 text-left transition-colors",
          open ? "border-bz-text" : "border-bz-line-soft hover:border-bz-line",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted">
            <meta.Icon size={12} strokeWidth={1.8} />
          </span>
          <span className="truncate text-[13px] text-bz-text">{meta.type}</span>
        </span>
        <ChevronsUpDown size={12} className="shrink-0 text-bz-text-muted" />
      </button>
      <TypePicker
        anchorRef={ref}
        open={open}
        onClose={() => setOpen(false)}
        currentType={field.fieldType}
        onSelect={onChangeType}
      />
    </div>
  );
}

function FieldInspector({
  field,
  allFields,
  labelInputRef,
  onUpdate,
  onChangeType,
  onDuplicate,
  onDelete,
}: {
  field: CustomField;
  allFields: CustomField[];
  labelInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onUpdate: (id: string, patch: Partial<CustomField>) => void;
  onChangeType: (id: string, type: FieldType) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = FIELD_TYPE_MAP[field.fieldType];
  const isText = TEXT_TYPES.includes(field.fieldType);
  const isNumeric = NUMERIC_TYPES.includes(field.fieldType);
  const hasOptions = !!meta.hasOptions;

  return (
    <div className="flex flex-col">
      <FieldInspectorHeader
        field={field}
        onDuplicate={() => onDuplicate(field.id)}
        onDelete={() => onDelete(field.id)}
      />

      <div className="flex flex-col">
        {/* General */}
        <InspectorSection title="General" defaultOpen>
          <InspectorTextRow
            label="Label"
            required
            value={field.label}
            onChange={(v) => onUpdate(field.id, { label: v })}
            placeholder="e.g. Sales Person"
            inputRef={labelInputRef}
          />
          <InspectorFieldTypeRow
            field={field}
            onChangeType={(t) => onChangeType(field.id, t)}
          />
          {hasOptions && (
            <InspectorTextareaRow
              label={meta.optionsLabel ?? "Options"}
              hint={meta.optionsHint}
              value={field.options ?? ""}
              onChange={(v) => onUpdate(field.id, { options: v })}
              placeholder={meta.optionsPlaceholder}
              rows={field.fieldType === "Link" ? 1 : 4}
            />
          )}
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <InspectorFieldKeyRow
              field={field}
              allFields={allFields}
              onChange={(v) => onUpdate(field.id, { fieldKey: v })}
            />
            <div className="w-[110px]">
              <InspectorNumberRow
                label="Display order"
                value={field.displayOrder}
                onChange={(v) =>
                  v !== undefined && onUpdate(field.id, { displayOrder: v })
                }
                min={1}
              />
            </div>
          </div>
        </InspectorSection>

        {/* Behaviour */}
        <InspectorSection title="Behaviour" defaultOpen>
          <InspectorToggleRow
            label="Required"
            hint="The record can't be saved without a value."
            value={field.required}
            onChange={(v) => onUpdate(field.id, { required: v })}
          />
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <label className="text-[11px] text-bz-text-muted">
                Display mode
              </label>
              <span className="text-[10px] text-bz-text-soft">
                How the field is shown
              </span>
            </div>
            <InspectorSegmented
              options={["Normal", "Disabled", "Hidden"] as const}
              value={field.displayMode}
              onChange={(v) => onUpdate(field.id, { displayMode: v })}
            />
          </div>
          <InspectorTextRow
            label="Default value"
            value={field.defaultValue ?? ""}
            onChange={(v) => onUpdate(field.id, { defaultValue: v })}
            placeholder={
              field.fieldType === "Check" ? "0 or 1" : "Optional"
            }
            hint={
              field.fieldType === "Check"
                ? "1 = checked by default"
                : undefined
            }
          />
        </InspectorSection>

        {/* Help */}
        <InspectorSection title="Help text">
          <InspectorTextareaRow
            label="Description"
            hint="Shown to admins only"
            value={field.description ?? ""}
            onChange={(v) => onUpdate(field.id, { description: v })}
            placeholder="Internal notes about this field."
            rows={2}
          />
          <InspectorTextareaRow
            label="Help text"
            hint="Shown to end users below the input"
            value={field.helpText ?? ""}
            onChange={(v) => onUpdate(field.id, { helpText: v })}
            placeholder="A short hint for the person filling the form."
            rows={2}
          />
        </InspectorSection>

        {/* Validation */}
        {(isText || isNumeric) && (
          <InspectorSection title="Validation">
            {isText && (
              <InspectorNumberRow
                label="Max length"
                hint="Characters"
                value={field.maxLength}
                onChange={(v) => onUpdate(field.id, { maxLength: v })}
                placeholder="e.g. 140"
                min={1}
              />
            )}
            {isNumeric && (
              <div className="grid grid-cols-2 gap-3">
                <InspectorNumberRow
                  label="Min value"
                  value={field.minValue}
                  onChange={(v) => onUpdate(field.id, { minValue: v })}
                  placeholder="—"
                />
                <InspectorNumberRow
                  label="Max value"
                  value={field.maxValue}
                  onChange={(v) => onUpdate(field.id, { maxValue: v })}
                  placeholder="—"
                />
              </div>
            )}
          </InspectorSection>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSPECTOR — FORM SETTINGS
// ════════════════════════════════════════════════════════════════════════════

function FormInspectorHeader({ form }: { form: CustomForm }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-bz-line bg-bz-paper px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-bz-sm bg-bz-deep text-bz-paper">
        <Settings size={14} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] uppercase tracking-[0.14em] text-bz-text-soft">
          Form Settings
        </p>
        <p className="mt-0.5 truncate text-[14px] font-semibold text-bz-text">
          {form.entity}
        </p>
      </div>
      <span className="shrink-0 text-[10.5px] tabular-nums text-bz-text-soft">
        #{form.formId}
      </span>
    </div>
  );
}

function FormInspector({
  form,
  onUpdate,
}: {
  form: CustomForm;
  onUpdate: (
    patch: Partial<Omit<CustomForm, "fields" | "entity" | "formId">>,
  ) => void;
}) {
  return (
    <div className="flex flex-col">
      <FormInspectorHeader form={form} />

      <div className="flex flex-col">
        {/* General */}
        <InspectorSection title="General" defaultOpen>
          <div>
            <label className="mb-1 block text-[11px] text-bz-text-muted">
              Type<span className="ml-0.5 text-bz-text">*</span>
            </label>
            <div className="flex h-9 items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 text-[13px] text-bz-text">
              <span className="inline-flex items-center rounded-bz-sm bg-bz-deep px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-bz-paper">
                {entityHint(form.entity) || "—"}
              </span>
              <span>{form.entity}</span>
              <span className="ml-auto text-[10.5px] text-bz-text-soft">
                Switch via the page picker
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-bz-text-muted">
              Form ID
            </label>
            <div className="flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3 text-[13px] tabular-nums text-bz-text-muted">
              #{form.formId}
            </div>
          </div>
        </InspectorSection>

        {/* Templates */}
        <InspectorSection title="Templates" defaultOpen>
          <InspectorPickerRow
            label="Email message template"
            value={form.emailMessageTemplate}
            onChange={(v) => onUpdate({ emailMessageTemplate: v })}
            placeholder="Search Message Template"
          />
          <InspectorPickerRow
            label="Print template"
            value={form.printTemplate}
            onChange={(v) => onUpdate({ printTemplate: v })}
            placeholder="Search print template"
          />
          <InspectorPickerRow
            label="Email template"
            value={form.emailTemplate}
            onChange={(v) => onUpdate({ emailTemplate: v })}
            placeholder="Search Email Template"
          />
        </InspectorSection>

        {/* Behaviour */}
        <InspectorSection title="Behaviour" defaultOpen>
          <InspectorToggleRow
            label="Allow add multiple"
            hint="Multiple Custom Form variants can exist for this entity."
            value={form.allowAddMultiple}
            onChange={(v) => onUpdate({ allowAddMultiple: v })}
          />
          <InspectorToggleRow
            label="Inactive"
            hint="Hide this form everywhere without deleting it."
            value={form.inactive}
            onChange={(v) => onUpdate({ inactive: v })}
          />
          <InspectorToggleRow
            label="Store form with record"
            hint="Snapshot the form definition on every record save."
            value={form.storeFormWithRecord}
            onChange={(v) => onUpdate({ storeFormWithRecord: v })}
          />
          <InspectorToggleRow
            label="Form is preferred"
            hint="Pick this form by default when creating a new record."
            value={form.formIsPreferred}
            onChange={(v) => onUpdate({ formIsPreferred: v })}
          />
        </InspectorSection>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSPECTOR EMPTY STATE
// ════════════════════════════════════════════════════════════════════════════

function InspectorEmptyState({ form }: { form: CustomForm }) {
  const stats = React.useMemo(() => {
    const total = form.fields.length;
    return {
      total,
      required: form.fields.filter((f) => f.required).length,
      hidden: form.fields.filter((f) => f.displayMode === "Hidden").length,
      disabled: form.fields.filter((f) => f.displayMode === "Disabled").length,
    };
  }, [form]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <Sparkles size={16} strokeWidth={1.6} />
      </span>
      <p className="mt-4 text-[14px] font-semibold text-bz-text">
        Pick something to configure
      </p>
      <p className="mt-1 max-w-[280px] text-[11.5px] leading-relaxed text-bz-text-muted">
        Select <b>Form Settings</b> for templates and flags, or any field for
        its properties.
      </p>

      <div className="mt-6 w-full max-w-[300px] rounded-bz-md border border-bz-line-soft bg-bz-surface p-4 text-left">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
          {form.entity}
        </p>
        <dl className="mt-3 flex flex-col gap-2">
          <SummaryStatRow label="Custom fields" value={stats.total} />
          <SummaryStatRow label="Required" value={stats.required} />
          <SummaryStatRow label="Disabled" value={stats.disabled} />
          <SummaryStatRow label="Hidden" value={stats.hidden} />
        </dl>
      </div>
    </div>
  );
}

function SummaryStatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11.5px] text-bz-text-muted">{label}</span>
      <span className="text-[13px] font-semibold tabular-nums text-bz-text">
        {value}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DROP INDICATOR + ADD FIELD ROW
// ════════════════════════════════════════════════════════════════════════════

function DropIndicator() {
  return (
    <div className="relative my-0.5 h-0.5 rounded-bz-pill bg-bz-fire">
      <span className="absolute -left-1 -top-1 size-2.5 rounded-bz-pill border-2 border-bz-fire bg-bz-paper" />
    </div>
  );
}

function AddFieldRow({
  onAddData,
  onAddOther,
}: {
  onAddData: () => void;
  onAddOther: (type: FieldType) => void;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-3 flex flex-wrap items-stretch gap-1.5">
      <button
        onClick={onAddData}
        className="inline-flex h-10 min-w-[200px] flex-1 items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-transparent text-[12.5px] font-medium text-bz-text-muted hover:border-bz-text hover:bg-bz-surface hover:text-bz-text"
      >
        <Plus size={13} /> Add field
      </button>
      <button
        ref={ref}
        onClick={() => setOpen((v) => !v)}
        title="Pick a field type"
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-transparent px-3 text-[12.5px] font-medium text-bz-text-muted hover:border-bz-text hover:bg-bz-surface hover:text-bz-text"
      >
        <ChevronsUpDown size={13} /> Pick type
      </button>
      <TypePicker
        anchorRef={ref}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(t) => onAddOther(t)}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD LIST — Form Settings card + sortable field rows + Add field
// ════════════════════════════════════════════════════════════════════════════

function FieldList({
  state,
  dispatch,
  draggingId,
  armedDragId,
  dropIndex,
  setRowRef,
  focusLabelOnAddRef,
  armDrag,
  disarmDrag,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  draggingId: string | null;
  armedDragId: string | null;
  dropIndex: number | null;
  setRowRef: (id: string) => (el: HTMLDivElement | null) => void;
  focusLabelOnAddRef: React.MutableRefObject<boolean>;
  armDrag: (id: string) => void;
  disarmDrag: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const form = state.forms[state.entity];
  const fields = form?.fields ?? [];
  const selectedId = state.selectedIds[state.entity] ?? null;
  const count = fields.length;

  return (
    <div onDragOver={onDragOver} onDrop={onDrop} className="flex flex-col">
      {form && (
        <div className="mb-3">
          <FormSettingsCard
            form={form}
            selected={selectedId === FORM_SETTINGS_ID}
            fieldCount={count}
            onSelect={() =>
              dispatch({ kind: "SELECT", id: FORM_SETTINGS_ID })
            }
            rowRefSetter={setRowRef(FORM_SETTINGS_ID)}
          />
        </div>
      )}

      <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-muted">
          Fields
          <span className="ml-2 tabular-nums text-bz-text-soft">{count}</span>
        </p>
        <p className="hidden text-[10.5px] text-bz-text-soft sm:block">
          Drag to reorder · click to configure
        </p>
      </div>

      {fields.length === 0 ? (
        <FieldListEmptyState
          entity={state.entity}
          onAdd={() => {
            focusLabelOnAddRef.current = true;
            dispatch({ kind: "ADD_FIELD", fieldType: "Data" });
          }}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {fields.map((field, idx) => {
            const isSelected = selectedId === field.id;
            const isDragging = draggingId === field.id;

            const wrapperProps = {
              draggable: armedDragId === field.id,
              onDragStart: (e: React.DragEvent) => onDragStart(e, field.id),
              onDragEnd: () => {
                onDragEnd();
                disarmDrag();
              },
            };
            const onMoveFn = (direction: "up" | "down") =>
              dispatch({ kind: "MOVE_FIELD", id: field.id, direction });

            return (
              <React.Fragment key={field.id}>
                {dropIndex === idx && draggingId !== field.id && (
                  <DropIndicator />
                )}
                <div {...wrapperProps}>
                  <FieldRow
                    field={field}
                    index={idx}
                    count={count}
                    selected={isSelected}
                    isDragging={isDragging}
                    onSelect={() =>
                      dispatch({ kind: "SELECT", id: field.id })
                    }
                    onDuplicate={() =>
                      dispatch({ kind: "DUPLICATE_FIELD", id: field.id })
                    }
                    onDelete={() =>
                      dispatch({ kind: "DELETE_FIELD", id: field.id })
                    }
                    onChangeType={(type) =>
                      dispatch({
                        kind: "UPDATE_FIELD",
                        id: field.id,
                        patch: { fieldType: type },
                      })
                    }
                    onMove={onMoveFn}
                    onDragHandleMouseDown={() => armDrag(field.id)}
                    onDragHandleMouseUp={() => disarmDrag()}
                    rowRefSetter={setRowRef(field.id)}
                  />
                </div>
              </React.Fragment>
            );
          })}
          {dropIndex === count && <DropIndicator />}
        </div>
      )}

      {fields.length > 0 && (
        <AddFieldRow
          onAddData={() => {
            focusLabelOnAddRef.current = true;
            dispatch({ kind: "ADD_FIELD", fieldType: "Data" });
          }}
          onAddOther={(type) => {
            focusLabelOnAddRef.current = true;
            dispatch({ kind: "ADD_FIELD", fieldType: type });
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHROME PIECES — breadcrumb, save button
// ════════════════════════════════════════════════════════════════════════════

function CustomFormBreadcrumb() {
  return (
    <>
      <span className="text-bz-text-muted">Customize</span>
      <ChevronRight size={11} className="text-bz-text-soft" />
      <span className="font-semibold text-bz-text">Custom Form</span>
    </>
  );
}

function SaveButton({
  dirty,
  saving,
  onClick,
}: {
  dirty: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!dirty || saving}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-bz-md px-3.5 text-[12.5px] font-semibold transition-colors",
        !dirty
          ? "cursor-not-allowed bg-bz-paper-warm text-bz-text-soft"
          : "bg-bz-deep text-bz-text-on-dark hover:bg-[#1f2620]",
      )}
    >
      {saving ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Check size={12} />
      )}
      Save
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ENTITY PICKER (grouped, searchable, shows per-entity field counts)
// ════════════════════════════════════════════════════════════════════════════

function EntityPicker({
  state,
  anchorRef,
  open,
  onClose,
  onPick,
}: {
  state: State;
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  onPick: (entity: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (open) {
      setQuery("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const filteredGroups = ENTITY_GROUPS.map((g) => ({
    ...g,
    entities: g.entities.filter(
      (e) =>
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.hint.toLowerCase().includes(q),
    ),
  })).filter((g) => g.entities.length > 0);

  return (
    <Popover
      anchorRef={anchorRef}
      open={open}
      onClose={onClose}
      align="start"
      minWidth={320}
      maxWidth={420}
    >
      <div className="border-b border-bz-line-soft p-2">
        <div className="flex h-9 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entity types…"
            className="flex-1 bg-transparent text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="flex size-4 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[440px] overflow-y-auto py-1">
        {filteredGroups.length === 0 ? (
          <p className="px-3 py-8 text-center text-[12px] text-bz-text-muted">
            No entities match "{query}".
          </p>
        ) : (
          filteredGroups.map((g, gi) => (
            <div key={g.group} className={gi === 0 ? "" : "mt-2"}>
              <p className="px-3 pb-1 pt-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                {g.group}
              </p>
              {g.entities.map((ent) => {
                const active = ent.name === state.entity;
                const count = state.forms[ent.name]?.fields.length ?? 0;
                const isDirty = !!state.dirtyEntities[ent.name];
                return (
                  <button
                    key={ent.name}
                    onClick={() => {
                      onPick(ent.name);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left",
                      active
                        ? "bg-bz-fire/[0.10]"
                        : "hover:bg-bz-paper-warm",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 min-w-[36px] items-center justify-center rounded-bz-sm px-1.5 text-[9.5px] font-bold tabular-nums",
                        active
                          ? "bg-bz-deep text-bz-paper"
                          : "bg-bz-paper-warm text-bz-text-muted",
                      )}
                    >
                      {ent.hint}
                    </span>
                    <span
                      className={cn(
                        "flex-1 truncate text-[12.5px]",
                        active
                          ? "font-semibold text-bz-text"
                          : "text-bz-text",
                      )}
                    >
                      {ent.name}
                    </span>
                    {isDirty && (
                      <span
                        className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire"
                        title="Unsaved changes"
                      />
                    )}
                    <span
                      className={cn(
                        "shrink-0 text-[10.5px] tabular-nums",
                        active ? "text-bz-text" : "text-bz-text-soft",
                      )}
                    >
                      {count}
                    </span>
                    {active && (
                      <Check size={12} className="shrink-0 text-bz-text" />
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </Popover>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ════════════════════════════════════════════════════════════════════════════

export function CustomFieldsBuilderPage() {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE);

  // Preview mode
  const [previewMode, setPreviewMode] = React.useState<"side" | "fullscreen">(
    "side",
  );

  // Drag state
  const [armedDragId, setArmedDragId] = React.useState<string | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);
  const armDrag = React.useCallback(
    (id: string) => setArmedDragId(id),
    [],
  );
  const disarmDrag = React.useCallback(() => setArmedDragId(null), []);

  // Row refs for keyboard navigation
  const rowRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const setRowRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };

  // Inspector label focus after Add/Duplicate
  const focusLabelOnAddRef = React.useRef(false);
  const labelInputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (
      focusLabelOnAddRef.current &&
      state.selectedIds[state.entity] &&
      state.selectedIds[state.entity] !== FORM_SETTINGS_ID
    ) {
      focusLabelOnAddRef.current = false;
      const t = window.setTimeout(() => {
        labelInputRef.current?.focus();
        labelInputRef.current?.select();
      }, 30);
      return () => window.clearTimeout(t);
    }
  }, [state.entity, state.selectedIds]);

  // Entity dropdown
  const entityBtnRef = React.useRef<HTMLButtonElement>(null);
  const [entityOpen, setEntityOpen] = React.useState(false);

  // Derived
  const form = state.forms[state.entity];
  const fields = form?.fields ?? [];
  const selectedId = state.selectedIds[state.entity] ?? null;
  const selectedField = React.useMemo(() => {
    if (!selectedId || selectedId === FORM_SETTINGS_ID) return null;
    return fields.find((f) => f.id === selectedId) ?? null;
  }, [selectedId, fields]);
  const isFormSelected = selectedId === FORM_SETTINGS_ID;
  const fieldCount = fields.length;
  const isCurrentDirty = !!state.dirtyEntities[state.entity];
  const savedRel = useRelative(state.savedAt);

  // Save (mock)
  const handleSave = React.useCallback(async () => {
    if (state.saving || !isCurrentDirty) return;
    dispatch({ kind: "SAVE_START" });
    await new Promise((r) => setTimeout(r, 700));
    dispatch({ kind: "SAVE_DONE" });
  }, [state.saving, isCurrentDirty]);

  // Keyboard shortcuts
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inInput =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
        return;
      }
      if (inInput) {
        if (e.key === "Escape") (target as HTMLElement).blur();
        return;
      }
      const sel = state.selectedIds[state.entity] ?? null;
      if (!sel || sel === FORM_SETTINGS_ID) return;
      const idx = fields.findIndex((f) => f.id === sel);
      if (idx === -1) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        dispatch({ kind: "DUPLICATE_FIELD", id: sel });
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = fields[idx + 1];
        if (next) {
          dispatch({ kind: "SELECT", id: next.id });
          window.setTimeout(() => rowRefs.current.get(next.id)?.focus(), 0);
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx === 0) {
          dispatch({ kind: "SELECT", id: FORM_SETTINGS_ID });
          window.setTimeout(
            () => rowRefs.current.get(FORM_SETTINGS_ID)?.focus(),
            0,
          );
          return;
        }
        const prev = fields[idx - 1];
        if (prev) {
          dispatch({ kind: "SELECT", id: prev.id });
          window.setTimeout(() => rowRefs.current.get(prev.id)?.focus(), 0);
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        focusLabelOnAddRef.current = true;
        dispatch({ kind: "SELECT", id: sel });
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        dispatch({ kind: "DELETE_FIELD", id: sel });
        return;
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state.entity, state.selectedIds, fields, handleSave]);

  // DnD
  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }
  function onDragOverList(e: React.DragEvent) {
    if (!draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    let inserted = false;
    for (let i = 0; i < fields.length; i++) {
      const el = rowRefs.current.get(fields[i].id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        setDropIndex(i);
        inserted = true;
        break;
      }
    }
    if (!inserted) setDropIndex(fields.length);
  }
  function onDrop(e: React.DragEvent) {
    if (!draggingId || dropIndex === null) return;
    e.preventDefault();
    const from = fields.findIndex((f) => f.id === draggingId);
    if (from === -1) return;
    dispatch({ kind: "REORDER_FIELDS", from, to: dropIndex });
    setDraggingId(null);
    setDropIndex(null);
    setArmedDragId(null);
  }
  function onDragEnd() {
    setDraggingId(null);
    setDropIndex(null);
    setArmedDragId(null);
  }

  return (
    <AppShell breadcrumb={<CustomFormBreadcrumb />}>
      {previewMode === "fullscreen" ? (
        <>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bz-text-soft">
                Preview
              </p>
              <span className="text-[12px] text-bz-text-muted">·</span>
              <p className="truncate text-[13px] font-semibold text-bz-text">
                {state.entity}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setPreviewMode("side")}
                className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
              >
                <Minimize2 size={11} /> Exit preview
              </button>
              <SaveButton
                dirty={isCurrentDirty}
                saving={state.saving}
                onClick={handleSave}
              />
            </div>
          </div>
          {form && <LivePreview form={form} fullscreen />}
        </>
      ) : (
        <>
          {/* Page header */}
          <div className="flex flex-col gap-3 px-4 pb-3 pt-5 md:flex-row md:items-start md:px-6">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bz-text-soft">
                Custom Form
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  ref={entityBtnRef}
                  onClick={() => setEntityOpen((v) => !v)}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-bz-md border px-2.5 py-1 transition-colors",
                    entityOpen
                      ? "border-bz-text bg-bz-surface"
                      : "border-transparent hover:border-bz-line hover:bg-bz-surface",
                  )}
                >
                  <span className="inline-flex h-5 min-w-[36px] items-center justify-center rounded-bz-sm bg-bz-deep px-1.5 text-[9.5px] font-bold tabular-nums text-bz-paper">
                    {entityHint(state.entity)}
                  </span>
                  <h1 className="text-[22px] font-semibold tracking-[-0.018em] text-bz-text">
                    {state.entity}
                  </h1>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-bz-text-muted transition-transform",
                      entityOpen ? "rotate-180" : "",
                    )}
                  />
                </button>
                {entityGroupOf(state.entity) && (
                  <span className="hidden text-[11px] text-bz-text-soft sm:inline">
                    in {entityGroupOf(state.entity)}
                  </span>
                )}
              </div>
              <p className="text-[12.5px] text-bz-text-muted">
                {fieldCount}{" "}
                {fieldCount === 1 ? "custom field" : "custom fields"}
                {" · "}
                {state.saving ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> saving…
                  </span>
                ) : isCurrentDirty ? (
                  <span className="text-bz-text">unsaved changes</span>
                ) : (
                  <>last saved {savedRel}</>
                )}
              </p>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-1.5 md:justify-end">
              <button
                onClick={() => setPreviewMode("fullscreen")}
                className="inline-flex h-9 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm"
                title="Open the form preview full-screen"
              >
                <Eye size={12} /> Preview
              </button>
              <SaveButton
                dirty={isCurrentDirty}
                saving={state.saving}
                onClick={handleSave}
              />
            </div>

            <EntityPicker
              state={state}
              anchorRef={entityBtnRef}
              open={entityOpen}
              onClose={() => setEntityOpen(false)}
              onPick={(name) =>
                dispatch({ kind: "CHANGE_ENTITY", entity: name })
              }
            />
          </div>

          {/* Body grid */}
          <div className="grid grid-cols-1 gap-6 px-4 pb-12 pt-2 md:px-6 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_500px]">
            <div className="min-w-0">
              <FieldList
                state={state}
                dispatch={dispatch}
                draggingId={draggingId}
                armedDragId={armedDragId}
                dropIndex={dropIndex}
                setRowRef={setRowRef}
                focusLabelOnAddRef={focusLabelOnAddRef}
                armDrag={armDrag}
                disarmDrag={disarmDrag}
                onDragStart={onDragStart}
                onDragOver={onDragOverList}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
              />
            </div>

            <aside className="self-start overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper lg:sticky lg:top-4 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col">
              <div className="min-h-0 flex-1 lg:overflow-y-auto">
                {isFormSelected && form ? (
                  <FormInspector
                    form={form}
                    onUpdate={(patch) =>
                      dispatch({ kind: "UPDATE_FORM", patch })
                    }
                  />
                ) : selectedField ? (
                  <FieldInspector
                    field={selectedField}
                    allFields={fields}
                    labelInputRef={labelInputRef}
                    onUpdate={(id, patch) =>
                      dispatch({ kind: "UPDATE_FIELD", id, patch })
                    }
                    onChangeType={(id, type) =>
                      dispatch({
                        kind: "UPDATE_FIELD",
                        id,
                        patch: { fieldType: type },
                      })
                    }
                    onDuplicate={(id) =>
                      dispatch({ kind: "DUPLICATE_FIELD", id })
                    }
                    onDelete={(id) =>
                      dispatch({ kind: "DELETE_FIELD", id })
                    }
                  />
                ) : form ? (
                  <InspectorEmptyState form={form} />
                ) : null}
              </div>
            </aside>
          </div>

          {/* Mobile floating Preview button */}
          <button
            onClick={() => setPreviewMode("fullscreen")}
            className="fixed bottom-6 right-4 z-30 inline-flex h-11 items-center gap-1.5 rounded-bz-pill bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark shadow-[0_12px_28px_-8px_rgba(15,20,17,0.4)] lg:hidden"
          >
            <Eye size={13} /> Preview
          </button>
        </>
      )}

      <Toast
        state={state}
        onUndo={() => dispatch({ kind: "UNDO_DELETE" })}
        onDismiss={() => dispatch({ kind: "DISMISS_TOAST" })}
      />
    </AppShell>
  );
}
