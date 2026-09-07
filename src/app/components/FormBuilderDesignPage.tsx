import * as React from "react";
import { createPortal } from "react-dom";
import { AppShell } from "./SalesOrderListDesignPage";
import {
  // question-type glyphs (resolved by NAME from the server catalogue)
  Type,
  AlignLeft,
  AtSign,
  Phone,
  Link2,
  Hash,
  Sigma,
  CircleDollarSign,
  Percent,
  Gauge,
  CircleDot,
  ListChecks,
  List,
  ToggleLeft,
  Star,
  Calendar,
  Clock,
  CalendarClock,
  CalendarRange,
  Database,
  Building2,
  UserRound,
  Package,
  Paperclip,
  Image as ImageIcon,
  PenLine,
  ScanLine,
  MapPin,
  Table2,
  Heading,
  FileText,
  Minus,
  HelpCircle,
  // chrome
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  Columns3,
  Filter,
  Sparkles,
  Settings2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Undo2,
  MoreHorizontal,
  ShieldCheck,
  Layers,
  Target,
  Inbox,
  Wand2,
  CornerDownRight,
} from "lucide-react";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// FORM BUILDER · design a questionnaire, publish it as a real ERP feature
//
// PRIMARY ACTION — add a question and word it. Everything else is depth the
// user is allowed to ignore, so the page is shaped like a document editor:
//
//   1. Identity band  the form NAME is the page title, edited in place (it is
//                     the only universally mandatory input on the screen), plus
//                     lifecycle, live-version readout and the commit cluster.
//   2. Mode tabs      four PEER concerns with live counts — Questions ·
//                     Response table · Lead hand-off (count suppressed while
//                     off) · Settings. No order, no gating, state persists.
//   3. Canvas         question CARDS inside named sections. Each card is typed
//                     into directly and renders a dead preview of the control
//                     the respondent will see. "Add question" sits at the end
//                     of every section, so the primary act is never far away.
//   4. Inspector      right rail on >=lg, expands inline inside the selected
//                     card below that. Contents are CONDITIONAL on the kind.
//   5. Docked bar     save / publish, never disabled for invalidity — publish
//                     always acts and then NAMES what blocked it, in a report
//                     whose rows JUMP to the question that caused them.
//
// The one-way gate is surfaced BEFORE it closes: Publish opens a consequence
// review naming every identifier about to lock and every question about to
// become withdraw-only.
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// SERVER-SUPPLIED VOCABULARY
//
// The catalogue, each entry's wording and each entry's glyph NAME arrive from
// the server. Nothing here is hardcoded on the client: the client only owns the
// name -> component lookup, and an unknown name degrades to a neutral fallback
// rather than rendering blank.
// ════════════════════════════════════════════════════════════════════════════

type LucideIcon = React.ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}>;

const GLYPHS: Record<string, LucideIcon> = {
  type: Type,
  "align-left": AlignLeft,
  "at-sign": AtSign,
  phone: Phone,
  link: Link2,
  hash: Hash,
  sigma: Sigma,
  currency: CircleDollarSign,
  percent: Percent,
  gauge: Gauge,
  "circle-dot": CircleDot,
  "list-checks": ListChecks,
  list: List,
  toggle: ToggleLeft,
  star: Star,
  calendar: Calendar,
  clock: Clock,
  "calendar-clock": CalendarClock,
  "calendar-range": CalendarRange,
  database: Database,
  building: Building2,
  "user-round": UserRound,
  package: Package,
  paperclip: Paperclip,
  image: ImageIcon,
  "pen-line": PenLine,
  "scan-line": ScanLine,
  "map-pin": MapPin,
  table: Table2,
  heading: Heading,
  "file-text": FileText,
  minus: Minus,
};

/** Unknown glyph name -> neutral fallback, never blank. */
function glyphFor(name?: string): LucideIcon {
  return (name && GLYPHS[name]) || HelpCircle;
}

type Family =
  | "text"
  | "number"
  | "choice"
  | "datetime"
  | "lookup"
  | "evidence"
  | "table"
  | "layout";

const FAMILY_LABEL: Record<Family, string> = {
  text: "Written answers",
  choice: "Pick from a list",
  number: "Numbers & measures",
  datetime: "Dates & times",
  lookup: "From your records",
  evidence: "Captured evidence",
  table: "Repeating rows",
  layout: "Page furniture",
};

const FAMILY_ORDER: Family[] = [
  "text",
  "choice",
  "number",
  "datetime",
  "lookup",
  "evidence",
  "table",
  "layout",
];

type CatalogueEntry = {
  id: string;
  label: string;
  glyph: string;
  family: Family;
  hint: string;
};

/** Fetched from the server on load — treated as data, never as code. */
const CATALOGUE: CatalogueEntry[] = [
  { id: "short_text", label: "Short answer", glyph: "type", family: "text", hint: "One line of writing" },
  { id: "long_text", label: "Paragraph", glyph: "align-left", family: "text", hint: "Several lines" },
  { id: "email", label: "Email address", glyph: "at-sign", family: "text", hint: "Checked as an address" },
  { id: "phone", label: "Phone number", glyph: "phone", family: "text", hint: "Dial-able number" },
  { id: "url", label: "Web link", glyph: "link", family: "text", hint: "A web address" },

  { id: "single_select", label: "Choose one", glyph: "circle-dot", family: "choice", hint: "Radio buttons" },
  { id: "multi_select", label: "Choose many", glyph: "list-checks", family: "choice", hint: "Tick boxes" },
  { id: "dropdown", label: "Dropdown", glyph: "list", family: "choice", hint: "One from a long list" },
  { id: "yes_no", label: "Yes / No", glyph: "toggle", family: "choice", hint: "A single switch" },
  { id: "rating", label: "Rating", glyph: "star", family: "choice", hint: "One to five" },

  { id: "number", label: "Whole number", glyph: "hash", family: "number", hint: "Counts and quantities" },
  { id: "decimal", label: "Decimal", glyph: "sigma", family: "number", hint: "Fractional values" },
  { id: "currency", label: "Amount", glyph: "currency", family: "number", hint: "Money, company currency" },
  { id: "percent", label: "Percentage", glyph: "percent", family: "number", hint: "0 to 100" },
  { id: "measure", label: "Measured value", glyph: "gauge", family: "number", hint: "Number with a unit" },

  { id: "date", label: "Date", glyph: "calendar", family: "datetime", hint: "A calendar day" },
  { id: "time", label: "Time", glyph: "clock", family: "datetime", hint: "A time of day" },
  { id: "datetime", label: "Date & time", glyph: "calendar-clock", family: "datetime", hint: "Both together" },
  { id: "date_range", label: "Date range", glyph: "calendar-range", family: "datetime", hint: "From and to" },

  { id: "link_master", label: "Master record", glyph: "database", family: "lookup", hint: "Values from a record list" },
  { id: "customer_lookup", label: "Customer", glyph: "building", family: "lookup", hint: "Pick a customer" },
  { id: "employee_lookup", label: "Staff member", glyph: "user-round", family: "lookup", hint: "Pick an employee" },
  { id: "item_lookup", label: "Item", glyph: "package", family: "lookup", hint: "Pick a stock item" },

  { id: "file", label: "File upload", glyph: "paperclip", family: "evidence", hint: "Any attachment" },
  { id: "image", label: "Photo", glyph: "image", family: "evidence", hint: "Camera or gallery" },
  { id: "signature", label: "Signature", glyph: "pen-line", family: "evidence", hint: "Drawn on screen" },
  { id: "barcode", label: "Scanned code", glyph: "scan-line", family: "evidence", hint: "Barcode or QR" },
  { id: "geo", label: "Location", glyph: "map-pin", family: "evidence", hint: "Where it was filled in" },

  { id: "sub_table", label: "Repeating rows", glyph: "table", family: "table", hint: "A small table of rows" },

  { id: "section_heading", label: "Heading", glyph: "heading", family: "layout", hint: "Carries no answer" },
  { id: "rich_text", label: "Instructions", glyph: "file-text", family: "layout", hint: "Free content block" },
  { id: "divider", label: "Divider", glyph: "minus", family: "layout", hint: "A dividing line" },
];

const CATALOGUE_MAP: Record<string, CatalogueEntry> = Object.fromEntries(
  CATALOGUE.map((c) => [c.id, c]),
);

/** Type id -> wording. Unknown ids degrade to a readable form of the id. */
function typeLabel(typeId: string): string {
  const entry = CATALOGUE_MAP[typeId];
  if (entry) return entry.label;
  return typeId.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function typeGlyph(typeId: string): LucideIcon {
  return glyphFor(CATALOGUE_MAP[typeId]?.glyph);
}
function typeFamily(typeId: string): Family | undefined {
  return CATALOGUE_MAP[typeId]?.family;
}
/** Layout furniture carries no answer. An unknown type is assumed to hold one. */
function holdsAnswer(typeId: string): boolean {
  return typeFamily(typeId) !== "layout";
}
function canBeSearchable(typeId: string): boolean {
  const f = typeFamily(typeId);
  if (!f) return true;
  return f !== "layout" && f !== "evidence" && f !== "table";
}
function hasChoices(typeId: string): boolean {
  return typeFamily(typeId) === "choice" && typeId !== "yes_no" && typeId !== "rating";
}
function isLookup(typeId: string): boolean {
  return typeFamily(typeId) === "lookup";
}
function takesBounds(typeId: string): boolean {
  const f = typeFamily(typeId);
  return f === "number" || f === "text";
}
function isMarkup(typeId: string): boolean {
  return typeId === "rich_text";
}

/** Intrinsic properties of a response — also server-supplied. */
const INTRINSIC: { id: string; label: string; hint: string }[] = [
  { id: "sys:ref_no", label: "Reference no.", hint: "FSV-0148" },
  { id: "sys:submitted_on", label: "Submitted on", hint: "Aug 12, 2026" },
  { id: "sys:state", label: "Status", hint: "Draft / Submitted" },
  { id: "sys:created_by", label: "Filled in by", hint: "Sujata Rai" },
  { id: "sys:updated_on", label: "Last edited", hint: "Aug 12, 2026" },
  { id: "sys:customer", label: "Linked customer", hint: "Himalayan Retail" },
  { id: "sys:employee", label: "Linked staff", hint: "EMP-0231" },
  { id: "sys:attachments", label: "Attachments", hint: "2 files" },
];
const INTRINSIC_MAP: Record<string, { id: string; label: string; hint: string }> =
  Object.fromEntries(INTRINSIC.map((i) => [i.id, i]));

/** The destination system's own fields, grouped the way it groups them. */
const LEAD_SECTIONS: { section: string; fields: { id: string; label: string }[] }[] = [
  {
    section: "Who the lead is",
    fields: [
      { id: "organisation_name", label: "Organisation name" },
      { id: "first_name", label: "First name" },
      { id: "last_name", label: "Last name" },
      { id: "salutation", label: "Salutation" },
    ],
  },
  {
    section: "How to reach them",
    fields: [
      { id: "email", label: "Email" },
      { id: "mobile", label: "Mobile" },
      { id: "phone", label: "Phone" },
      { id: "website", label: "Website" },
    ],
  },
  {
    section: "Qualification",
    fields: [
      { id: "source", label: "Lead source" },
      { id: "industry", label: "Industry" },
      { id: "territory", label: "Territory" },
      { id: "rating", label: "Rating" },
      { id: "employees", label: "No. of employees" },
    ],
  },
  { section: "Extra", fields: [{ id: "notes", label: "Notes" }] },
];

/** Master record lists that a lookup question can draw its choices from. */
const MASTER_SOURCES: { id: string; name: string; group: string; rows: number }[] = [
  { id: "104", name: "Branch / Site", group: "Operations", rows: 42 },
  { id: "118", name: "Equipment Class", group: "Operations", rows: 17 },
  { id: "121", name: "Fault Category", group: "Service", rows: 64 },
  { id: "133", name: "Service Contract Type", group: "Service", rows: 8 },
  { id: "147", name: "Region", group: "Geography", rows: 7 },
  { id: "152", name: "Municipality", group: "Geography", rows: 293 },
  { id: "168", name: "Cost Centre", group: "Finance", rows: 23 },
  { id: "170", name: "Project", group: "Finance", rows: 51 },
];

/** Navigation glyphs the published form can wear in the sidebar. */
const NAV_GLYPHS = [
  "file-text", "list-checks", "table", "map-pin", "package", "user-round",
  "building", "gauge", "star", "calendar", "scan-line", "database",
];

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA
// ════════════════════════════════════════════════════════════════════════════

type Op =
  | "equals"
  | "not_equals"
  | "contains"
  | "in_list"
  | "is_blank"
  | "is_answered"
  | "greater_than"
  | "less_than";

const OPS: { id: Op; label: string; needsValue: boolean }[] = [
  { id: "equals", label: "is exactly", needsValue: true },
  { id: "not_equals", label: "is not", needsValue: true },
  { id: "contains", label: "contains", needsValue: true },
  { id: "in_list", label: "is one of", needsValue: true },
  { id: "is_blank", label: "is left blank", needsValue: false },
  { id: "is_answered", label: "is answered", needsValue: false },
  { id: "greater_than", label: "is more than", needsValue: true },
  { id: "less_than", label: "is less than", needsValue: true },
];
const OP_MAP: Record<Op, { id: Op; label: string; needsValue: boolean }> =
  Object.fromEntries(OPS.map((o) => [o.id, o])) as Record<Op, { id: Op; label: string; needsValue: boolean }>;

type Rule = { source: string; op: Op; value: string };

type Choice = { id: string; label: string; value: string };

type SubColumn = {
  id: string;
  label: string;
  typeId: string;
  required?: boolean;
  searchable?: boolean;
  published?: boolean;
};

type Bounds = { min?: number; max?: number; minLen?: number; maxLen?: number };

type Question = {
  id: string;
  typeId: string;
  label: string;
  key: string;
  keyTouched?: boolean;
  help?: string;
  placeholder?: string;
  defaultValue?: string;
  width: "third" | "half" | "full";
  required?: boolean;
  searchable?: boolean;
  readOnly?: boolean;
  withdrawn?: boolean;
  /** existed at the last publish -> identifier is frozen, removal degrades to withdrawal */
  published?: boolean;
  answers?: number;
  choices?: Choice[];
  sourceId?: string;
  columns?: SubColumn[];
  bounds?: Bounds;
  markup?: string;
  rule?: Rule | null;
};

type SectionModel = { id: string; name: string; questions: Question[] };

type ColumnPick = { id: string; label?: string };

type LeadBind = { mode: "question" | "fixed"; question?: string; fixed?: string };

type Mode = "questions" | "table" | "lead" | "settings";

type Problem = { id: string; message: string };

type ToastState = { id: number; message: string; tone: "ok" | "note" } | null;

type State = {
  loading: boolean;
  /** identity */
  name: string;
  category: string;
  description: string;
  navGlyph: string;
  prefix: string;
  behaviours: {
    attachments: boolean;
    drafts: boolean;
    linkCustomer: boolean;
    linkEmployee: boolean;
    extraFields: boolean;
  };
  /** design */
  sections: SectionModel[];
  selectedId: string | null;
  mode: Mode;
  columns: ColumnPick[];
  filters: string[];
  lead: { enabled: boolean; map: Record<string, LeadBind> };
  /** lifecycle */
  publishedVersion: number | null;
  responseCount: number;
  dirty: boolean;
  savedAt: number | null;
  committing: null | "draft" | "publish";
  problems: Problem[] | null;
  toast: ToastState;
  canManage: boolean;
};

// ════════════════════════════════════════════════════════════════════════════
// TRANSFORMS
// ════════════════════════════════════════════════════════════════════════════

let SEQ = 0;
const uid = (p: string) => `${p}_${(SEQ += 1).toString(36)}`;

/** wording -> machine identifier: slug, collapse, cap, force a leading letter. */
function slugify(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  if (!base) return "field";
  return /^[a-z]/.test(base) ? base : `f_${base}`;
}

/** ...then disambiguate against every other identifier in the whole design. */
function uniquify(candidate: string, taken: Set<string>): string {
  if (!taken.has(candidate)) return candidate;
  let n = 2;
  while (taken.has(`${candidate}_${n}`)) n += 1;
  return `${candidate}_${n}`;
}

function allKeys(sections: SectionModel[], exceptId?: string): Set<string> {
  const s = new Set<string>();
  sections.forEach((sec) =>
    sec.questions.forEach((q) => {
      if (q.id !== exceptId) s.add(q.key);
    }),
  );
  return s;
}

/** A row is never nameless: wording -> type wording -> raw identifier. */
function displayName(q: Question): string {
  const w = q.label.trim();
  if (w) return w;
  const t = typeLabel(q.typeId);
  if (t) return t;
  return q.key;
}

function allQuestions(sections: SectionModel[]): Question[] {
  return sections.flatMap((s) => s.questions);
}
function findQuestion(sections: SectionModel[], id: string | null): Question | null {
  if (!id) return null;
  for (const s of sections) {
    const q = s.questions.find((x) => x.id === id);
    if (q) return q;
  }
  return null;
}
function sectionOf(sections: SectionModel[], id: string): SectionModel | undefined {
  return sections.find((s) => s.questions.some((q) => q.id === id));
}

// ════════════════════════════════════════════════════════════════════════════
// SEED — an in-progress second release of a live form, so both sides of the
// publish gate (frozen identifiers vs fluid ones) are visible at once.
// ════════════════════════════════════════════════════════════════════════════

function q(partial: Partial<Question> & { typeId: string; label: string; key: string }): Question {
  return {
    id: uid("q"),
    width: "full",
    searchable: canBeSearchable(partial.typeId),
    rule: null,
    ...partial,
  } as Question;
}

function seedSections(): SectionModel[] {
  return [
    {
      id: uid("s"),
      name: "Visit details",
      questions: [
        q({ typeId: "date", label: "Date of visit", key: "date_of_visit", required: true, published: true, answers: 148 }),
        q({
          typeId: "link_master",
          label: "Site / branch",
          key: "site_branch",
          required: true,
          help: "Which location the engineer attended.",
        }),
        q({ typeId: "employee_lookup", label: "Attending engineer", key: "attending_engineer", required: true, published: true, answers: 148 }),
        q({ typeId: "short_text", label: "Work order reference", key: "work_order_reference", published: true, answers: 141, width: "half" }),
      ],
    },
    {
      id: uid("s"),
      name: "What was found",
      questions: [
        q({
          typeId: "single_select",
          label: "Equipment condition",
          key: "equipment_condition",
          required: true,
          published: true,
          answers: 148,
          choices: [
            { id: uid("c"), label: "Good", value: "good" },
            { id: uid("c"), label: "Needs attention", value: "needs_attention" },
            { id: uid("c"), label: "Failed", value: "failed" },
          ],
        }),
        q({ typeId: "long_text", label: "Fault summary", key: "fault_summary", published: true, answers: 132, help: "What was wrong, in plain language." }),
        q({ typeId: "number", label: "Downtime (hours)", key: "downtime_hours", published: true, answers: 132, width: "third", bounds: { min: 0, max: 24 } }),
        q({ typeId: "section_heading", label: "Evidence", key: "evidence" }),
        q({ typeId: "image", label: "Site photos", key: "site_photos", searchable: false, help: "Up to six photos of the equipment." }),
        q({
          typeId: "sub_table",
          label: "Parts used",
          key: "parts_used",
          searchable: false,
          columns: [
            { id: uid("col"), label: "Item", typeId: "item_lookup", required: true, searchable: true, published: true },
            { id: uid("col"), label: "Quantity", typeId: "number", required: true, searchable: false, published: true },
            { id: uid("col"), label: "Unit cost", typeId: "currency", searchable: false },
          ],
          published: true,
          answers: 96,
        }),
        q({ typeId: "nps_scale", label: "Legacy satisfaction score", key: "legacy_satisfaction_score", published: true, answers: 148, withdrawn: true }),
      ],
    },
    {
      id: uid("s"),
      name: "Sign-off",
      questions: [
        q({ typeId: "yes_no", label: "Follow-up required", key: "follow_up_required", required: true }),
        q({ typeId: "long_text", label: "What the follow-up needs", key: "what_the_follow_up_needs", required: true }),
        q({ typeId: "signature", label: "Customer signature", key: "customer_signature", required: true, searchable: false }),
      ],
    },
  ];
}

function seedState(): State {
  const sections = seedSections();
  const followUp = sections[2].questions[0];
  const followUpNotes = sections[2].questions[1];
  followUpNotes.rule = { source: followUp.key, op: "equals", value: "Yes" };

  return {
    loading: true,
    name: "Field Service Visit Report",
    category: "Operations",
    description:
      "Filled in by the attending engineer at the end of every on-site visit.",
    navGlyph: "list-checks",
    prefix: "FSV-",
    behaviours: {
      attachments: true,
      drafts: true,
      linkCustomer: true,
      linkEmployee: false,
      extraFields: false,
    },
    sections,
    selectedId: null,
    mode: "questions",
    columns: [
      { id: "sys:ref_no" },
      { id: "sys:submitted_on", label: "Visit logged" },
      { id: "q:date_of_visit" },
      { id: "q:attending_engineer", label: "Engineer" },
      { id: "q:equipment_condition" },
      { id: "sys:state" },
    ],
    filters: ["equipment_condition", "attending_engineer"],
    lead: { enabled: false, map: {} },
    publishedVersion: 2,
    responseCount: 148,
    dirty: false,
    savedAt: Date.now() - 1000 * 60 * 26,
    committing: null,
    problems: null,
    toast: null,
    canManage: true,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE INTEGRITY — every rename / removal rewrites or purges every place
// that pointed at the identifier. The user never repairs a reference by hand.
// ════════════════════════════════════════════════════════════════════════════

function rewriteRefs(s: State, oldKey: string, newKey: string): State {
  if (oldKey === newKey) return s;
  return {
    ...s,
    columns: s.columns.map((c) => (c.id === `q:${oldKey}` ? { ...c, id: `q:${newKey}` } : c)),
    filters: s.filters.map((f) => (f === oldKey ? newKey : f)),
    lead: {
      ...s.lead,
      map: Object.fromEntries(
        Object.entries(s.lead.map).map(([k, v]) =>
          v.mode === "question" && v.question === oldKey ? [k, { ...v, question: newKey }] : [k, v],
        ),
      ),
    },
    sections: s.sections.map((sec) => ({
      ...sec,
      questions: sec.questions.map((qq) =>
        qq.rule && qq.rule.source === oldKey ? { ...qq, rule: { ...qq.rule, source: newKey } } : qq,
      ),
    })),
  };
}

/** dropRules=false keeps visibility rules pointing here (a withdrawn question
 *  may still drive a rule for historic responses). */
function purgeRefs(s: State, key: string, dropRules: boolean): State {
  const next: State = {
    ...s,
    columns: s.columns.filter((c) => c.id !== `q:${key}`),
    filters: s.filters.filter((f) => f !== key),
    lead: {
      ...s.lead,
      map: Object.fromEntries(
        Object.entries(s.lead.map).filter(
          ([, v]) => !(v.mode === "question" && v.question === key),
        ),
      ),
    },
  };
  if (!dropRules) return next;
  return {
    ...next,
    sections: next.sections.map((sec) => ({
      ...sec,
      questions: sec.questions.map((qq) =>
        qq.rule && qq.rule.source === key ? { ...qq, rule: null } : qq,
      ),
    })),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// REDUCER
// ════════════════════════════════════════════════════════════════════════════

type Action =
  | { kind: "HYDRATED" }
  | { kind: "SET_MODE"; mode: Mode }
  | { kind: "PATCH_IDENTITY"; patch: Partial<Pick<State, "name" | "category" | "description" | "navGlyph" | "prefix">> }
  | { kind: "PATCH_BEHAVIOUR"; patch: Partial<State["behaviours"]> }
  | { kind: "ADD_SECTION" }
  | { kind: "RENAME_SECTION"; id: string; name: string }
  | { kind: "DELETE_SECTION"; id: string }
  | { kind: "MOVE_SECTION"; id: string; dir: -1 | 1 }
  | { kind: "ADD_QUESTION"; typeId: string; sectionId?: string }
  | { kind: "SELECT"; id: string | null }
  | { kind: "PATCH_QUESTION"; id: string; patch: Partial<Question> }
  | { kind: "SET_KEY"; id: string; key: string }
  | { kind: "CHANGE_TYPE"; id: string; typeId: string }
  | { kind: "REMOVE_QUESTION"; id: string }
  | { kind: "RESTORE_QUESTION"; id: string }
  | { kind: "MOVE_QUESTION"; id: string; toSectionId: string; toIndex: number }
  | { kind: "ADD_CHOICE"; id: string }
  | { kind: "PATCH_CHOICE"; id: string; choiceId: string; patch: Partial<Choice> }
  | { kind: "REMOVE_CHOICE"; id: string; choiceId: string }
  | { kind: "ADD_COLUMN_DEF"; id: string }
  | { kind: "PATCH_COLUMN_DEF"; id: string; colId: string; patch: Partial<SubColumn> }
  | { kind: "REMOVE_COLUMN_DEF"; id: string; colId: string }
  | { kind: "SET_RULE"; id: string; rule: Rule | null }
  | { kind: "TOGGLE_COLUMN"; columnId: string }
  | { kind: "SET_COLUMN_LABEL"; columnId: string; label: string }
  | { kind: "MOVE_COLUMN"; from: number; to: number }
  | { kind: "AUTO_COLUMNS" }
  | { kind: "TOGGLE_FILTER"; key: string }
  | { kind: "SET_LEAD_ENABLED"; enabled: boolean }
  | { kind: "SET_LEAD_BIND"; field: string; bind: LeadBind | null }
  | { kind: "COMMIT_START"; intent: "draft" | "publish" }
  | { kind: "COMMIT_REFUSED"; problems: Problem[] }
  | { kind: "COMMIT_DONE"; intent: "draft" | "publish" }
  | { kind: "CLEAR_PROBLEMS" }
  | { kind: "TOAST"; message: string; tone?: "ok" | "note" }
  | { kind: "DISMISS_TOAST" }
  | { kind: "SET_CAN_MANAGE"; value: boolean };

function dirty(s: State): State {
  return { ...s, dirty: true };
}

function mapQuestion(s: State, id: string, fn: (q: Question) => Question): State {
  return {
    ...s,
    sections: s.sections.map((sec) => ({
      ...sec,
      questions: sec.questions.map((qq) => (qq.id === id ? fn(qq) : qq)),
    })),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case "HYDRATED":
      return { ...state, loading: false };

    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "PATCH_IDENTITY":
      return dirty({ ...state, ...action.patch });

    case "PATCH_BEHAVIOUR":
      return dirty({ ...state, behaviours: { ...state.behaviours, ...action.patch } });

    case "ADD_SECTION": {
      const sec: SectionModel = {
        id: uid("s"),
        name: `Section ${state.sections.length + 1}`,
        questions: [],
      };
      return dirty({ ...state, sections: [...state.sections, sec] });
    }

    case "RENAME_SECTION":
      return dirty({
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.id ? { ...s, name: action.name } : s,
        ),
      });

    case "DELETE_SECTION": {
      const sec = state.sections.find((s) => s.id === action.id);
      if (!sec) return state;
      // REFUSAL: a section holding published questions cannot be removed.
      if (sec.questions.some((q) => q.published)) {
        return {
          ...state,
          toast: {
            id: Date.now(),
            tone: "note",
            message: "That section holds published questions — remove those individually first.",
          },
        };
      }
      let next: State = { ...state, sections: state.sections.filter((s) => s.id !== action.id) };
      sec.questions.forEach((q) => {
        next = purgeRefs(next, q.key, true);
      });
      const stillThere = findQuestion(next.sections, next.selectedId);
      return dirty({ ...next, selectedId: stillThere ? next.selectedId : null });
    }

    case "MOVE_SECTION": {
      const i = state.sections.findIndex((s) => s.id === action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= state.sections.length) return state;
      const next = [...state.sections];
      [next[i], next[j]] = [next[j], next[i]];
      return dirty({ ...state, sections: next });
    }

    case "ADD_QUESTION": {
      // No refusal: if nothing exists to receive the question, make it.
      let sections = state.sections;
      let targetId = action.sectionId ?? sections[sections.length - 1]?.id;
      if (!targetId) {
        const sec: SectionModel = { id: uid("s"), name: "Section 1", questions: [] };
        sections = [sec];
        targetId = sec.id;
      }
      const label = "";
      const key = uniquify(slugify(typeLabel(action.typeId)), allKeys(sections));
      const seeded: Question = {
        id: uid("q"),
        typeId: action.typeId,
        label,
        key,
        width: "full",
        searchable: canBeSearchable(action.typeId),
        rule: null,
        ...(hasChoices(action.typeId)
          ? { choices: [{ id: uid("c"), label: "", value: "" }] }
          : {}),
        ...(action.typeId === "sub_table" ? { columns: [] } : {}),
        ...(isMarkup(action.typeId) ? { markup: "" } : {}),
      };
      return dirty({
        ...state,
        sections: sections.map((s) =>
          s.id === targetId ? { ...s, questions: [...s.questions, seeded] } : s,
        ),
        selectedId: seeded.id,
      });
    }

    case "SELECT":
      return { ...state, selectedId: action.id };

    case "PATCH_QUESTION": {
      const target = findQuestion(state.sections, action.id);
      if (!target) return state;
      let next = mapQuestion(state, action.id, (q) => ({ ...q, ...action.patch }));

      // wording -> identifier, live, while the identifier is still fluid
      if (
        action.patch.label !== undefined &&
        !target.published &&
        !target.keyTouched
      ) {
        const candidate = uniquify(
          slugify(action.patch.label || typeLabel(target.typeId)),
          allKeys(next.sections, target.id),
        );
        next = mapQuestion(next, action.id, (q) => ({ ...q, key: candidate }));
        next = rewriteRefs(next, target.key, candidate);
      }

      // eligibility: unsearchable -> drops out of the filter candidates at once
      if (action.patch.searchable === false) {
        next = { ...next, filters: next.filters.filter((f) => f !== target.key) };
      }
      return dirty(next);
    }

    case "SET_KEY": {
      const target = findQuestion(state.sections, action.id);
      if (!target || target.published) return state;
      const candidate = uniquify(
        slugify(action.key),
        allKeys(state.sections, target.id),
      );
      let next = mapQuestion(state, action.id, (q) => ({
        ...q,
        key: candidate,
        keyTouched: true,
      }));
      next = rewriteRefs(next, target.key, candidate);
      return dirty(next);
    }

    case "CHANGE_TYPE": {
      const target = findQuestion(state.sections, action.id);
      if (!target) return state;
      let next = mapQuestion(state, action.id, (q) => ({
        ...q,
        typeId: action.typeId,
        searchable: canBeSearchable(action.typeId) ? q.searchable : false,
        choices: hasChoices(action.typeId)
          ? (q.choices?.length ? q.choices : [{ id: uid("c"), label: "", value: "" }])
          : undefined,
        columns: action.typeId === "sub_table" ? (q.columns ?? []) : undefined,
        markup: isMarkup(action.typeId) ? (q.markup ?? "") : undefined,
        sourceId: isLookup(action.typeId) ? q.sourceId : undefined,
        bounds: takesBounds(action.typeId) ? q.bounds : undefined,
      }));
      if (!holdsAnswer(action.typeId) || !canBeSearchable(action.typeId)) {
        next = purgeRefs(next, target.key, false);
      }
      return dirty(next);
    }

    case "REMOVE_QUESTION": {
      const target = findQuestion(state.sections, action.id);
      if (!target) return state;
      if (target.published) {
        // withdrawal — answers stay readable, references are purged either way
        let next = mapQuestion(state, action.id, (q) => ({ ...q, withdrawn: true }));
        next = purgeRefs(next, target.key, false);
        return dirty({
          ...next,
          toast: {
            id: Date.now(),
            tone: "note",
            message: `"${displayName(target)}" removed from new responses. ${target.answers ?? 0} stored answers stay readable.`,
          },
        });
      }
      let next: State = {
        ...state,
        sections: state.sections.map((s) => ({
          ...s,
          questions: s.questions.filter((q) => q.id !== action.id),
        })),
      };
      next = purgeRefs(next, target.key, true);
      return dirty({
        ...next,
        selectedId: next.selectedId === action.id ? null : next.selectedId,
        toast: { id: Date.now(), tone: "ok", message: `"${displayName(target)}" deleted.` },
      });
    }

    case "RESTORE_QUESTION":
      return dirty(mapQuestion(state, action.id, (q) => ({ ...q, withdrawn: false })));

    case "MOVE_QUESTION": {
      const from = sectionOf(state.sections, action.id);
      const moving = findQuestion(state.sections, action.id);
      if (!from || !moving) return state;
      const stripped = state.sections.map((s) =>
        s.id === from.id ? { ...s, questions: s.questions.filter((q) => q.id !== action.id) } : s,
      );
      return dirty({
        ...state,
        sections: stripped.map((s) => {
          if (s.id !== action.toSectionId) return s;
          const list = [...s.questions];
          const at = Math.max(0, Math.min(action.toIndex, list.length));
          list.splice(at, 0, moving);
          return { ...s, questions: list };
        }),
      });
    }

    case "ADD_CHOICE":
      return dirty(
        mapQuestion(state, action.id, (q) => ({
          ...q,
          choices: [...(q.choices ?? []), { id: uid("c"), label: "", value: "" }],
        })),
      );

    case "PATCH_CHOICE":
      return dirty(
        mapQuestion(state, action.id, (q) => ({
          ...q,
          choices: (q.choices ?? []).map((c) =>
            c.id === action.choiceId
              ? {
                  ...c,
                  ...action.patch,
                  value:
                    action.patch.value !== undefined
                      ? action.patch.value
                      : action.patch.label !== undefined
                        ? slugify(action.patch.label)
                        : c.value,
                }
              : c,
          ),
        })),
      );

    case "REMOVE_CHOICE":
      return dirty(
        mapQuestion(state, action.id, (q) => ({
          ...q,
          choices: (q.choices ?? []).filter((c) => c.id !== action.choiceId),
        })),
      );

    case "ADD_COLUMN_DEF":
      return dirty(
        mapQuestion(state, action.id, (q) => ({
          ...q,
          columns: [
            ...(q.columns ?? []),
            { id: uid("col"), label: "", typeId: "short_text", searchable: false },
          ],
        })),
      );

    case "PATCH_COLUMN_DEF":
      return dirty(
        mapQuestion(state, action.id, (q) => ({
          ...q,
          columns: (q.columns ?? []).map((c) =>
            c.id === action.colId ? { ...c, ...action.patch } : c,
          ),
        })),
      );

    case "REMOVE_COLUMN_DEF": {
      const target = findQuestion(state.sections, action.id);
      const col = target?.columns?.find((c) => c.id === action.colId);
      if (col?.published) {
        return {
          ...state,
          toast: {
            id: Date.now(),
            tone: "note",
            message: "That column is already published — removing it would make stored rows unreadable.",
          },
        };
      }
      return dirty(
        mapQuestion(state, action.id, (q) => ({
          ...q,
          columns: (q.columns ?? []).filter((c) => c.id !== action.colId),
        })),
      );
    }

    case "SET_RULE":
      return dirty(mapQuestion(state, action.id, (q) => ({ ...q, rule: action.rule })));

    case "TOGGLE_COLUMN": {
      const on = state.columns.some((c) => c.id === action.columnId);
      return dirty({
        ...state,
        columns: on
          ? state.columns.filter((c) => c.id !== action.columnId)
          : [...state.columns, { id: action.columnId }],
      });
    }

    case "SET_COLUMN_LABEL":
      return dirty({
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, label: action.label || undefined } : c,
        ),
      });

    case "MOVE_COLUMN": {
      const list = [...state.columns];
      const [moved] = list.splice(action.from, 1);
      if (!moved) return state;
      list.splice(Math.max(0, Math.min(action.to, list.length)), 0, moved);
      return dirty({ ...state, columns: list });
    }

    case "AUTO_COLUMNS": {
      const answering = allQuestions(state.sections)
        .filter((q) => holdsAnswer(q.typeId) && !q.withdrawn)
        .slice(0, 4);
      return dirty({
        ...state,
        columns: [
          { id: "sys:ref_no" },
          { id: "sys:submitted_on" },
          ...answering.map((q) => ({ id: `q:${q.key}` })),
          { id: "sys:state" },
        ],
        toast: { id: Date.now(), tone: "ok", message: "Built a starting response table for you." },
      });
    }

    case "TOGGLE_FILTER":
      return dirty({
        ...state,
        filters: state.filters.includes(action.key)
          ? state.filters.filter((f) => f !== action.key)
          : [...state.filters, action.key],
      });

    case "SET_LEAD_ENABLED":
      return dirty({ ...state, lead: { ...state.lead, enabled: action.enabled } });

    case "SET_LEAD_BIND": {
      const map = { ...state.lead.map };
      if (action.bind === null) delete map[action.field];
      else map[action.field] = action.bind;
      return dirty({ ...state, lead: { ...state.lead, map } });
    }

    case "COMMIT_START":
      return { ...state, committing: action.intent, problems: null };

    case "COMMIT_REFUSED":
      return { ...state, committing: null, problems: action.problems };

    case "COMMIT_DONE": {
      if (action.intent === "draft") {
        return {
          ...state,
          committing: null,
          dirty: false,
          savedAt: Date.now(),
          problems: null,
          toast: { id: Date.now(), tone: "ok", message: "Draft saved. Nothing is live yet." },
        };
      }
      const version = (state.publishedVersion ?? 0) + 1;
      const columns = state.columns.length
        ? state.columns
        : [
            { id: "sys:ref_no" },
            { id: "sys:submitted_on" },
            ...allQuestions(state.sections)
              .filter((q) => holdsAnswer(q.typeId) && !q.withdrawn)
              .slice(0, 4)
              .map((q) => ({ id: `q:${q.key}` })),
            { id: "sys:state" },
          ];
      return {
        ...state,
        committing: null,
        dirty: false,
        savedAt: Date.now(),
        problems: null,
        publishedVersion: version,
        columns,
        // the gate closes: every question that existed at this moment freezes
        sections: state.sections.map((s) => ({
          ...s,
          questions: s.questions.map((q) => ({ ...q, published: true, answers: q.answers ?? 0 })),
        })),
        toast: {
          id: Date.now(),
          tone: "ok",
          message: `Release ${version} is live. Identifiers are now permanent.`,
        },
      };
    }

    case "CLEAR_PROBLEMS":
      return { ...state, problems: null };

    case "TOAST":
      return { ...state, toast: { id: Date.now(), message: action.message, tone: action.tone ?? "ok" } };

    case "DISMISS_TOAST":
      return { ...state, toast: null };

    case "SET_CAN_MANAGE":
      return { ...state, canManage: action.value };

    default:
      return state;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION — the server is authoritative. It answers with plain sentences and
// no machine link back to the cause, so the client INFERS the link by matching
// the wording, and turns each sentence into something you can jump from.
// ════════════════════════════════════════════════════════════════════════════

function validate(s: State): Problem[] {
  const out: Problem[] = [];
  // the one check the client owns
  if (!s.name.trim()) out.push({ id: "name", message: "This form needs a name before it can be saved." });

  const qs = allQuestions(s.sections);
  if (qs.length === 0) {
    out.push({ id: "empty", message: "Add at least one question before publishing." });
  }
  qs.forEach((q) => {
    const n = displayName(q);
    if (!q.label.trim() && holdsAnswer(q.typeId)) {
      out.push({ id: `${q.id}:label`, message: `The question "${q.key}" has no wording yet.` });
    }
    if (!/^[a-z][a-z0-9_]*$/.test(q.key)) {
      out.push({ id: `${q.id}:key`, message: `The identifier "${q.key}" is not a legal identifier.` });
    }
    if (isLookup(q.typeId) && !q.sourceId) {
      out.push({ id: `${q.id}:source`, message: `"${n}" does not say where its choices come from.` });
    }
    if (hasChoices(q.typeId) && !(q.choices ?? []).some((c) => c.label.trim())) {
      out.push({ id: `${q.id}:choices`, message: `"${n}" has no choices to pick from.` });
    }
    if (q.typeId === "sub_table" && !(q.columns ?? []).length) {
      out.push({ id: `${q.id}:columns`, message: `"${n}" has no columns defined.` });
    }
    if (isMarkup(q.typeId) && /<script|onerror=|onload=|<iframe/i.test(q.markup ?? "")) {
      out.push({ id: `${q.id}:markup`, message: `The content of "${n}" contains markup that is not allowed.` });
    }
  });
  s.filters.forEach((f) => {
    const target = qs.find((q) => q.key === f);
    if (!target || !target.searchable) {
      out.push({ id: `filter:${f}`, message: `The filter "${f}" is not on a searchable question.` });
    }
  });
  return out;
}

/** Infer which question a server sentence is about, from the wording. */
function inferTarget(message: string, sections: SectionModel[]): Question | null {
  const quoted = message.match(/"([^"]+)"/g)?.map((m) => m.slice(1, -1)) ?? [];
  if (!quoted.length) return null;
  for (const token of quoted) {
    const hit = allQuestions(sections).find(
      (q) => q.key === token || displayName(q).toLowerCase() === token.toLowerCase(),
    );
    if (hit) return hit;
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

function Switch({
  value,
  onChange,
  ariaLabel,
  disabled,
}: {
  value?: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-bz-pill border transition-colors",
        value ? "border-bz-fire bg-bz-fire" : "border-bz-line-soft bg-bz-paper-warm hover:border-bz-line",
        disabled && "cursor-not-allowed opacity-40",
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

function ToggleRow({
  label,
  hint,
  value,
  onChange,
  disabled,
  disabledNote,
}: {
  label: string;
  hint?: string;
  value?: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  disabledNote?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 py-1", disabled && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] text-bz-text">{label}</p>
        {(disabled && disabledNote ? disabledNote : hint) && (
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-bz-text-soft">
            {disabled && disabledNote ? disabledNote : hint}
          </p>
        )}
      </div>
      <Switch value={value} onChange={onChange} ariaLabel={label} disabled={disabled} />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  right,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] text-bz-text-muted">{label}</label>
        {right ?? (hint && <span className="text-[10px] text-bz-text-soft">{hint}</span>)}
      </div>
      {children}
    </div>
  );
}

const INPUT_CLS =
  "h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[13px] text-bz-text outline-none transition-colors placeholder:text-bz-text-soft focus:border-bz-text disabled:cursor-not-allowed disabled:bg-bz-paper-warm disabled:text-bz-text-muted";

function TextField(props: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <Field label={props.label} hint={props.hint}>
      <input
        ref={props.inputRef}
        type="text"
        value={props.value}
        disabled={props.disabled}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className={INPUT_CLS}
      />
    </Field>
  );
}

function TextArea(props: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Field label={props.label} hint={props.hint}>
      <textarea
        rows={props.rows ?? 3}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full resize-none rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 py-2 text-[13px] leading-relaxed text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
      />
    </Field>
  );
}

function NumberField(props: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <Field label={props.label}>
      <input
        type="number"
        value={props.value ?? ""}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={cn(INPUT_CLS, "tabular-nums")}
      />
    </Field>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid w-full grid-flow-col rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "h-7 rounded-bz-sm text-[11.5px] font-medium transition-colors",
            o.id === value
              ? "bg-bz-surface text-bz-text shadow-[0_1px_2px_rgba(15,20,17,0.06)]"
              : "text-bz-text-muted hover:text-bz-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Panel({
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
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
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-muted">
            {title}
          </span>
          {badge}
        </span>
        <ChevronDown size={12} className={cn("text-bz-text-soft transition-transform", open ? "" : "-rotate-90")} />
      </button>
      {open && <div className="flex flex-col gap-3 px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function MiniTag({
  children,
  tone = "quiet",
  icon: Icon,
}: {
  children: React.ReactNode;
  tone?: "quiet" | "accent" | "leaf" | "warn";
  icon?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-bz-sm px-1.5 py-0.5 text-[10px] font-medium",
        tone === "accent" && "bg-bz-fire/[0.22] text-bz-text",
        tone === "leaf" && "bg-bz-leaf/50 text-bz-text",
        tone === "warn" && "bg-[#FBE7E5] text-[#9A2E29]",
        tone === "quiet" && "bg-bz-paper-warm text-bz-text-muted",
      )}
    >
      {Icon && <Icon size={9} />}
      {children}
    </span>
  );
}

function Note({
  children,
  icon: Icon = ShieldCheck,
  tone = "quiet",
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  tone?: "quiet" | "warn" | "accent";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-bz-md border px-3 py-2",
        tone === "warn" && "border-[#F1C9C4] bg-[#FBE7E5]",
        tone === "accent" && "border-bz-line-soft bg-bz-fire/[0.10]",
        tone === "quiet" && "border-bz-line-soft bg-bz-paper-warm",
      )}
    >
      <Icon
        size={12}
        className={cn(
          "mt-[2px] shrink-0",
          tone === "warn" ? "text-[#9A2E29]" : "text-bz-text-muted",
        )}
      />
      <p
        className={cn(
          "text-[11px] leading-relaxed",
          tone === "warn" ? "text-[#9A2E29]" : "text-bz-text-muted",
        )}
      >
        {children}
      </p>
    </div>
  );
}

// ── portal popover ──────────────────────────────────────────────────────────

function Popover({
  anchorRef,
  open,
  onClose,
  align = "start",
  width,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  align?: "start" | "end";
  width?: number;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; right: number; w: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, right: window.innerWidth - r.right, w: r.width });
  }, [open, anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    // ignore scrolls that originate inside the floating surface itself
    const onScroll = (e: Event) => {
      const t = e.target as Node | null;
      if (t && ref.current && (ref.current === t || ref.current.contains(t))) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;
  const style: React.CSSProperties = {
    position: "fixed",
    top: pos.top,
    maxHeight: `calc(100vh - ${pos.top + 16}px)`,
    width: width ?? Math.max(pos.w, 260),
  };
  if (align === "end") style.right = pos.right;
  else style.left = Math.min(pos.left, Math.max(8, window.innerWidth - (width ?? 260) - 8));

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="z-[70] flex flex-col overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-[0_18px_44px_-20px_rgba(15,20,17,0.28)]"
    >
      {children}
    </div>,
    document.body,
  );
}

function MenuItem({
  icon: Icon,
  label,
  onSelect,
  destructive,
  disabled,
}: {
  icon?: LucideIcon;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px]",
        disabled
          ? "cursor-not-allowed text-bz-text-soft"
          : destructive
            ? "text-[#9A2E29] hover:bg-[#FBE7E5]"
            : "text-bz-text hover:bg-bz-paper-warm",
      )}
    >
      {Icon && <Icon size={12} className={destructive ? "text-[#9A2E29]" : "text-bz-text-muted"} />}
      {label}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TYPE CATALOGUE — the primary creative act, opened from every "add" affordance
// ════════════════════════════════════════════════════════════════════════════

function TypeCatalogue({
  anchorRef,
  open,
  onClose,
  onPick,
  current,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  onPick: (typeId: string) => void;
  current?: string;
}) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  const q = query.trim().toLowerCase();
  const matches = q
    ? CATALOGUE.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.hint.toLowerCase().includes(q) ||
          FAMILY_LABEL[c.family].toLowerCase().includes(q),
      )
    : CATALOGUE;

  const grouped: Partial<Record<Family, CatalogueEntry[]>> = {};
  matches.forEach((c) => {
    (grouped[c.family] ??= []).push(c);
  });

  return (
    <Popover anchorRef={anchorRef} open={open} onClose={onClose} width={392}>
      <div className="shrink-0 border-b border-bz-line-soft p-2">
        <div className="flex h-9 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5">
          <Search size={12} className="shrink-0 text-bz-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What kind of answer do you need?"
            className="flex-1 bg-transparent text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear" className="text-bz-text-muted hover:text-bz-text">
              <X size={11} />
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {matches.length === 0 ? (
          <p className="px-2 py-10 text-center text-[12px] text-bz-text-muted">
            Nothing matches “{query}”.
          </p>
        ) : (
          FAMILY_ORDER.filter((f) => grouped[f]?.length).map((family, i) => (
            <div key={family} className={i === 0 ? "" : "mt-3"}>
              <p className="px-1.5 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                {FAMILY_LABEL[family]}
              </p>
              <div className="grid grid-cols-3 gap-1">
                {grouped[family]!.map((entry) => {
                  const Icon = glyphFor(entry.glyph);
                  const active = current === entry.id;
                  return (
                    <button
                      key={entry.id}
                      title={entry.hint}
                      onClick={() => {
                        onPick(entry.id);
                        onClose();
                      }}
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
                            : "bg-bz-paper-warm text-bz-text-muted group-hover:text-bz-text",
                        )}
                      >
                        <Icon size={13} strokeWidth={1.7} />
                      </span>
                      <span className="text-[11.5px] font-medium leading-tight text-bz-text">
                        {entry.label}
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

// ── source picker: replaces the raw numeric identifier the user had to hunt ──

function SourcePicker({
  anchorRef,
  open,
  onClose,
  onPick,
  current,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  onPick: (id: string) => void;
  current?: string;
}) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const matches = MASTER_SOURCES.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.group.toLowerCase().includes(q),
  );
  return (
    <Popover anchorRef={anchorRef} open={open} onClose={onClose} width={320}>
      <div className="shrink-0 border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5">
          <Search size={11} className="text-bz-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a record list…"
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {matches.length === 0 ? (
          <p className="px-3 py-8 text-center text-[11.5px] text-bz-text-muted">No record list matches.</p>
        ) : (
          matches.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onPick(m.id);
                onClose();
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-bz-paper-warm",
                current === m.id && "bg-bz-fire/[0.10]",
              )}
            >
              <Database size={12} className="shrink-0 text-bz-text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] text-bz-text">{m.name}</span>
                <span className="block text-[10px] text-bz-text-soft">
                  {m.group} · <span className="tabular-nums">{m.rows}</span> records
                </span>
              </span>
              {current === m.id && <Check size={12} className="text-bz-leaf-deep" />}
            </button>
          ))
        )}
      </div>
      <div className="shrink-0 border-t border-bz-line-soft px-3 py-2">
        <p className="text-[10.5px] leading-relaxed text-bz-text-soft">
          Record lists are maintained under Administration › Master Records.
        </p>
      </div>
    </Popover>
  );
}

// ── question picker: used by rules, the response table and the lead mapper ───

function QuestionPicker({
  anchorRef,
  open,
  onClose,
  onPick,
  candidates,
  current,
  emptyNote,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  onPick: (key: string) => void;
  candidates: Question[];
  current?: string;
  emptyNote?: string;
}) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const matches = candidates.filter(
    (c) => !q || displayName(c).toLowerCase().includes(q) || c.key.includes(q),
  );
  return (
    <Popover anchorRef={anchorRef} open={open} onClose={onClose} width={300}>
      <div className="shrink-0 border-b border-bz-line-soft p-2">
        <div className="flex h-8 items-center gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5">
          <Search size={11} className="text-bz-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a question…"
            className="flex-1 bg-transparent text-[12px] text-bz-text outline-none placeholder:text-bz-text-muted"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {matches.length === 0 ? (
          <p className="px-3 py-8 text-center text-[11.5px] leading-relaxed text-bz-text-muted">
            {emptyNote ?? "No question is eligible yet."}
          </p>
        ) : (
          matches.map((c) => {
            const Icon = typeGlyph(c.typeId);
            return (
              <button
                key={c.id}
                onClick={() => {
                  onPick(c.key);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-bz-paper-warm",
                  current === c.key && "bg-bz-fire/[0.10]",
                )}
              >
                <Icon size={12} className="shrink-0 text-bz-text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-bz-text">{displayName(c)}</span>
                  <span className="block truncate text-[10px] tracking-[0.02em] text-bz-text-soft">{c.key}</span>
                </span>
                {c.withdrawn && <MiniTag>withdrawn</MiniTag>}
                {current === c.key && <Check size={12} className="text-bz-leaf-deep" />}
              </button>
            );
          })
        )}
      </div>
    </Popover>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REPEATER — one shape for every list a question owns (choices, sub-table
// columns). Collapsed by default, exactly one open, adding opens immediately.
// ════════════════════════════════════════════════════════════════════════════

function Repeater({
  items,
  addLabel,
  onAdd,
  emptyNote,
  renderSummary,
  renderBody,
  onRemove,
  removalBlocked,
}: {
  items: { id: string }[];
  addLabel: string;
  onAdd: () => void;
  emptyNote: string;
  renderSummary: (id: string, index: number) => React.ReactNode;
  renderBody: (id: string) => React.ReactNode;
  onRemove: (id: string) => void;
  removalBlocked?: (id: string) => string | undefined;
}) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const known = React.useRef<string[]>(items.map((i) => i.id));

  // adding an item opens it immediately; replacing the list resets the state
  React.useEffect(() => {
    const ids = items.map((i) => i.id);
    const added = ids.filter((id) => !known.current.includes(id));
    if (added.length === 1) setOpenId(added[0]);
    else if (added.length > 1) setOpenId(null);
    known.current = ids;
  }, [items]);

  return (
    <div className="flex flex-col gap-1.5">
      {items.length === 0 ? (
        <p className="rounded-bz-md border border-dashed border-bz-line bg-bz-paper-warm px-3 py-3 text-[11.5px] leading-relaxed text-bz-text-muted">
          {emptyNote}
        </p>
      ) : (
        items.map((item, i) => {
          const open = openId === item.id;
          const blocked = removalBlocked?.(item.id);
          return (
            <div
              key={item.id}
              className={cn(
                "overflow-hidden rounded-bz-md border bg-bz-surface transition-colors",
                open ? "border-bz-text" : "border-bz-line-soft",
              )}
            >
              <div className="flex items-center gap-1.5 pl-2 pr-1">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
                >
                  <ChevronDown
                    size={11}
                    className={cn("shrink-0 text-bz-text-soft transition-transform", open ? "" : "-rotate-90")}
                  />
                  <span className="w-4 shrink-0 text-[10px] tabular-nums text-bz-text-soft">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{renderSummary(item.id, i)}</span>
                </button>
                <button
                  type="button"
                  title={blocked ?? "Remove"}
                  onClick={() => onRemove(item.id)}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-bz-sm",
                    blocked
                      ? "cursor-not-allowed text-bz-text-soft"
                      : "text-bz-text-muted hover:bg-[#FBE7E5] hover:text-[#9A2E29]",
                  )}
                >
                  {blocked ? <Lock size={10} /> : <Trash2 size={11} />}
                </button>
              </div>
              {open && (
                <div className="flex flex-col gap-2.5 border-t border-bz-line-soft bg-bz-paper-warm/40 px-3 py-3">
                  {renderBody(item.id)}
                </div>
              )}
            </div>
          );
        })
      )}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-bz-md border border-dashed border-bz-line bg-bz-surface text-[11.5px] font-medium text-bz-text-muted hover:border-bz-text hover:text-bz-text"
      >
        <Plus size={11} /> {addLabel}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VISIBILITY RULE
// ════════════════════════════════════════════════════════════════════════════

function RuleBuilder({
  question,
  sources,
  onChange,
}: {
  question: Question;
  sources: Question[];
  onChange: (rule: Rule | null) => void;
}) {
  const sourceRef = React.useRef<HTMLButtonElement>(null);
  const opRef = React.useRef<HTMLButtonElement>(null);
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const [opOpen, setOpOpen] = React.useState(false);

  const rule = question.rule;

  if (!rule) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[11.5px] leading-relaxed text-bz-text-muted">
          This question is always shown. You can make it appear only when another answer says so.
        </p>
        <button
          type="button"
          disabled={sources.length === 0}
          onClick={() => onChange({ source: sources[0]?.key ?? "", op: "equals", value: "" })}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={11} /> Only show it sometimes
        </button>
        {sources.length === 0 && (
          <p className="text-[10.5px] text-bz-text-soft">
            No other question holds an answer yet, so there is nothing to depend on.
          </p>
        )}
      </div>
    );
  }

  const source = sources.find((s) => s.key === rule.source);
  const op = OP_MAP[rule.op];

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Show this when</span>
          <button
            ref={sourceRef}
            type="button"
            onClick={() => setSourceOpen((v) => !v)}
            className="flex h-8 items-center justify-between gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 text-left"
          >
            <span className={cn("truncate text-[12px]", source ? "text-bz-text" : "text-bz-text-soft")}>
              {source ? displayName(source) : "Pick a question"}
            </span>
            <ChevronDown size={11} className="shrink-0 text-bz-text-muted" />
          </button>
          <button
            ref={opRef}
            type="button"
            onClick={() => setOpOpen((v) => !v)}
            className="flex h-8 items-center justify-between gap-2 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 text-left"
          >
            <span className="truncate text-[12px] text-bz-text">{op.label}</span>
            <ChevronDown size={11} className="shrink-0 text-bz-text-muted" />
          </button>
          {op.needsValue && (
            <input
              value={rule.value}
              onChange={(e) => onChange({ ...rule, value: e.target.value })}
              placeholder={rule.op === "in_list" ? "Yes, Maybe" : "the answer to match"}
              className="h-8 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
            />
          )}
        </div>
      </div>

      <Note icon={ShieldCheck}>
        While it is hidden this question is never required, so a rule can never make the form
        impossible to submit.
      </Note>

      <button
        type="button"
        onClick={() => onChange(null)}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface text-[11.5px] font-medium text-bz-text-muted hover:border-[#C0413A] hover:text-[#9A2E29]"
      >
        <X size={11} /> Always show it
      </button>

      <QuestionPicker
        anchorRef={sourceRef}
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        candidates={sources}
        current={rule.source}
        onPick={(key) => onChange({ ...rule, source: key })}
        emptyNote="No other question holds an answer yet."
      />
      <Popover anchorRef={opRef} open={opOpen} onClose={() => setOpOpen(false)} width={220}>
        <div className="py-1">
          {OPS.map((o) => (
            <MenuItem
              key={o.id}
              label={o.label}
              onSelect={() => {
                onChange({ ...rule, op: o.id, value: o.needsValue ? rule.value : "" });
                setOpOpen(false);
              }}
            />
          ))}
        </div>
      </Popover>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REMOVE — one action, one honest consequence. Published questions cannot be
// deleted; the same button explains what will happen instead.
// ════════════════════════════════════════════════════════════════════════════

function RemoveControl({
  question,
  onRemove,
  onRestore,
  compact,
}: {
  question: Question;
  onRemove: () => void;
  onRestore: () => void;
  compact?: boolean;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const published = !!question.published;

  if (question.withdrawn) {
    return (
      <button
        type="button"
        onClick={onRestore}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface font-medium text-bz-text hover:bg-bz-paper-warm",
          compact ? "h-7 px-2 text-[11px]" : "h-8 w-full text-[11.5px]",
        )}
      >
        <Undo2 size={11} /> Put back into the form
      </button>
    );
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-bz-md border font-medium transition-colors",
          "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-[#C0413A] hover:bg-[#FBE7E5] hover:text-[#9A2E29]",
          compact ? "h-7 px-2 text-[11px]" : "h-8 w-full text-[11.5px]",
        )}
      >
        <Trash2 size={11} /> Remove
      </button>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)} align="end" width={296}>
        <div className="p-3">
          <p className="text-[12.5px] font-semibold text-bz-text">
            Remove “{displayName(question)}”?
          </p>
          {published ? (
            <>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">
                It stops appearing on new responses. The{" "}
                <span className="tabular-nums text-bz-text">{question.answers ?? 0}</span> answers already
                given stay stored and readable, so this cannot be a permanent delete.
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">
                It also drops out of the response table, the filters and any lead mapping. You can put
                it back at any time.
              </p>
            </>
          ) : (
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-bz-text-muted">
              Nobody has answered this yet, so it is deleted outright — along with any place that
              referenced it.
            </p>
          )}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-8 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Keep it
            </button>
            <button
              onClick={() => {
                onRemove();
                setOpen(false);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-[#9A2E29] px-3 text-[11.5px] font-semibold text-white hover:opacity-90"
            >
              {published ? <EyeOff size={11} /> : <Trash2 size={11} />}
              {published ? "Remove from new responses" : "Delete permanently"}
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSPECTOR — conditional on the kind of the selected question
// ════════════════════════════════════════════════════════════════════════════

function IdentifierRow({
  question,
  onChange,
}: {
  question: Question;
  onChange: (v: string) => void;
}) {
  const locked = !!question.published;
  return (
    <Field
      label="Identifier"
      right={
        locked ? (
          <MiniTag icon={Lock}>permanent</MiniTag>
        ) : (
          <span className="text-[10px] text-bz-text-soft">follows the wording</span>
        )
      }
    >
      <input
        value={question.key}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        className={cn(INPUT_CLS, "tracking-[0.02em]")}
      />
      <p className="mt-1 text-[10.5px] leading-relaxed text-bz-text-soft">
        {locked
          ? `Answers from ${question.answers ?? 0} responses are stored against this name, so it can never change again.`
          : "Change the wording and this follows automatically. Everywhere that points at it is rewritten in the same instant."}
      </p>
    </Field>
  );
}

function Inspector({
  question,
  state,
  dispatch,
  labelRef,
}: {
  question: Question;
  state: State;
  dispatch: React.Dispatch<Action>;
  labelRef?: React.Ref<HTMLInputElement>;
}) {
  const typeRef = React.useRef<HTMLButtonElement>(null);
  const sourceRef = React.useRef<HTMLButtonElement>(null);
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [sourceOpen, setSourceOpen] = React.useState(false);

  const answers = holdsAnswer(question.typeId);
  const Icon = typeGlyph(question.typeId);
  const known = !!CATALOGUE_MAP[question.typeId];
  const patch = (p: Partial<Question>) => dispatch({ kind: "PATCH_QUESTION", id: question.id, patch: p });

  const ruleSources = React.useMemo(
    () =>
      allQuestions(state.sections).filter(
        (x) => x.id !== question.id && holdsAnswer(x.typeId),
      ),
    [state.sections, question.id],
  );

  const source = MASTER_SOURCES.find((m) => m.id === question.sourceId);
  const [boundsOn, setBoundsOn] = React.useState(!!question.bounds);
  React.useEffect(() => setBoundsOn(!!question.bounds), [question.id, question.bounds]);

  return (
    <div className="flex flex-col">
      {/* head */}
      <div className="flex items-start gap-2.5 border-b border-bz-line-soft px-4 py-3">
        <button
          ref={typeRef}
          onClick={() => setTypeOpen((v) => !v)}
          title="Change the kind of answer"
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-bz-md border transition-colors",
            typeOpen ? "border-bz-text bg-bz-paper-warm" : "border-bz-line-soft bg-bz-surface hover:border-bz-line",
          )}
        >
          <Icon size={14} strokeWidth={1.7} className="text-bz-text" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-bz-text">{displayName(question)}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-bz-text-muted">
            {typeLabel(question.typeId)}
            {!known && <MiniTag tone="warn">unknown kind</MiniTag>}
            {question.published && <MiniTag icon={Lock}>published</MiniTag>}
            {question.withdrawn && <MiniTag>withdrawn</MiniTag>}
          </p>
        </div>
      </div>

      {question.withdrawn && (
        <div className="border-b border-bz-line-soft px-4 py-3">
          <Note icon={EyeOff}>
            This question no longer appears on new responses. Its{" "}
            <span className="tabular-nums">{question.answers ?? 0}</span> stored answers stay readable, and
            it can still drive a visibility rule for older responses.
          </Note>
        </div>
      )}

      {!known && (
        <div className="border-b border-bz-line-soft px-4 py-3">
          <Note icon={AlertCircle} tone="warn">
            This kind of question is not in the catalogue this workspace received. It still works and its
            answers are safe — it just cannot be previewed or re-configured here.
          </Note>
        </div>
      )}

      <Panel title="The question">
        <Field label="What you are asking" hint="shown to the person filling it in">
          <input
            ref={labelRef}
            value={question.label}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder={typeLabel(question.typeId)}
            className={INPUT_CLS}
          />
        </Field>
        <TextArea
          label="Helper text"
          hint="optional"
          rows={2}
          value={question.help ?? ""}
          onChange={(v) => patch({ help: v })}
          placeholder="A sentence of guidance under the question."
        />
        <Field label="How wide it sits">
          <Segmented
            value={question.width}
            onChange={(v) => patch({ width: v })}
            options={[
              { id: "third", label: "Third" },
              { id: "half", label: "Half" },
              { id: "full", label: "Full" },
            ]}
          />
        </Field>
        <IdentifierRow question={question} onChange={(v) => dispatch({ kind: "SET_KEY", id: question.id, key: v })} />
      </Panel>

      {isMarkup(question.typeId) && (
        <Panel title="Content">
          <TextArea
            label="What this block says"
            rows={5}
            value={question.markup ?? ""}
            onChange={(v) => patch({ markup: v })}
            placeholder="<p>Read the safety notice before continuing.</p>"
          />
          <Note>
            Basic formatting is kept. Scripts, event handlers and embedded frames are stripped when the
            form is published.
          </Note>
        </Panel>
      )}

      {hasChoices(question.typeId) && (
        <Panel title="Choices" badge={<MiniTag>{(question.choices ?? []).length}</MiniTag>}>
          <Repeater
            items={question.choices ?? []}
            addLabel="Add a choice"
            emptyNote="No choices yet — add the first one people can pick."
            onAdd={() => dispatch({ kind: "ADD_CHOICE", id: question.id })}
            onRemove={(cid) => dispatch({ kind: "REMOVE_CHOICE", id: question.id, choiceId: cid })}
            renderSummary={(cid) => {
              const c = (question.choices ?? []).find((x) => x.id === cid);
              return (
                <span className={cn("text-[12px]", c?.label ? "text-bz-text" : "text-bz-text-soft")}>
                  {c?.label || "Untitled choice"}
                </span>
              );
            }}
            renderBody={(cid) => {
              const c = (question.choices ?? []).find((x) => x.id === cid);
              if (!c) return null;
              return (
                <>
                  <TextField
                    label="Choice"
                    value={c.label}
                    onChange={(v) =>
                      dispatch({ kind: "PATCH_CHOICE", id: question.id, choiceId: cid, patch: { label: v } })
                    }
                    placeholder="Needs attention"
                  />
                  <TextField
                    label="Stored as"
                    hint="follows the choice"
                    value={c.value}
                    onChange={(v) =>
                      dispatch({ kind: "PATCH_CHOICE", id: question.id, choiceId: cid, patch: { value: v } })
                    }
                    placeholder="needs_attention"
                  />
                </>
              );
            }}
          />
        </Panel>
      )}

      {isLookup(question.typeId) && (
        <Panel title="Where the choices come from">
          <button
            ref={sourceRef}
            onClick={() => setSourceOpen((v) => !v)}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-bz-md border bg-bz-surface px-3 text-left transition-colors",
              source ? "border-bz-line-soft hover:border-bz-line" : "border-[#C0413A]",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Database size={12} className="shrink-0 text-bz-text-muted" />
              <span className={cn("truncate text-[13px]", source ? "text-bz-text" : "text-bz-text-soft")}>
                {source ? source.name : "Choose a record list"}
              </span>
            </span>
            {source ? (
              <span className="shrink-0 text-[10px] tabular-nums text-bz-text-soft">{source.rows} records</span>
            ) : (
              <ChevronDown size={12} className="shrink-0 text-bz-text-muted" />
            )}
          </button>
          <p className="text-[10.5px] leading-relaxed text-bz-text-soft">
            The list itself lives under Administration › Master Records — pick it here and every answer
            stays in step with it.
          </p>
          <SourcePicker
            anchorRef={sourceRef}
            open={sourceOpen}
            onClose={() => setSourceOpen(false)}
            current={question.sourceId}
            onPick={(id) => patch({ sourceId: id })}
          />
        </Panel>
      )}

      {question.typeId === "sub_table" && (
        <Panel title="Columns" badge={<MiniTag>{(question.columns ?? []).length}</MiniTag>}>
          <Repeater
            items={question.columns ?? []}
            addLabel="Add a column"
            emptyNote="This table has no columns yet, so there is nothing for people to fill in."
            onAdd={() => dispatch({ kind: "ADD_COLUMN_DEF", id: question.id })}
            onRemove={(cid) => dispatch({ kind: "REMOVE_COLUMN_DEF", id: question.id, colId: cid })}
            removalBlocked={(cid) => {
              const col = (question.columns ?? []).find((c) => c.id === cid);
              return col?.published
                ? "Already published — removing it would make stored rows unreadable"
                : undefined;
            }}
            renderSummary={(cid) => {
              const col = (question.columns ?? []).find((c) => c.id === cid);
              if (!col) return null;
              const CIcon = typeGlyph(col.typeId);
              return (
                <span className="flex items-center gap-1.5">
                  <CIcon size={11} className="shrink-0 text-bz-text-muted" />
                  <span className={cn("truncate text-[12px]", col.label ? "text-bz-text" : "text-bz-text-soft")}>
                    {col.label || "Untitled column"}
                  </span>
                  {col.required && <MiniTag tone="accent">must</MiniTag>}
                </span>
              );
            }}
            renderBody={(cid) => {
              const col = (question.columns ?? []).find((c) => c.id === cid);
              if (!col) return null;
              return (
                <ColumnBody
                  column={col}
                  onPatch={(p) =>
                    dispatch({ kind: "PATCH_COLUMN_DEF", id: question.id, colId: cid, patch: p })
                  }
                />
              );
            }}
          />
        </Panel>
      )}

      {answers && (
        <Panel title="How it behaves">
          <ToggleRow
            label="Must be answered"
            hint={question.rule ? "Only while the question is visible." : "The response cannot be submitted without it."}
            value={question.required}
            onChange={(v) => patch({ required: v })}
          />
          <ToggleRow
            label="Can be searched on"
            hint="Stores the answer in a way the response list can filter by."
            value={question.searchable}
            onChange={(v) => patch({ searchable: v })}
            disabled={!canBeSearchable(question.typeId)}
            disabledNote="This kind of answer has nothing to search against."
          />
          <ToggleRow
            label="Read-only"
            hint="Shown, but nobody can type into it."
            value={question.readOnly}
            onChange={(v) => patch({ readOnly: v })}
          />
        </Panel>
      )}

      {answers && (
        <Panel title="Prefilled" defaultOpen={false}>
          <TextField
            label="Placeholder"
            hint="ghost text"
            value={question.placeholder ?? ""}
            onChange={(v) => patch({ placeholder: v })}
            placeholder="e.g. Compressor room, north wing"
          />
          <TextField
            label="Default answer"
            value={question.defaultValue ?? ""}
            onChange={(v) => patch({ defaultValue: v })}
            placeholder="Filled in before anyone types"
          />
          {takesBounds(question.typeId) && (
            <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-2.5">
              <ToggleRow
                label="Limit what is accepted"
                hint="Off by default — most questions need no limits."
                value={boundsOn}
                onChange={(v) => {
                  setBoundsOn(v);
                  patch({ bounds: v ? (question.bounds ?? {}) : undefined });
                }}
              />
              {boundsOn && (
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {typeFamily(question.typeId) === "number" ? (
                    <>
                      <NumberField
                        label="Lowest"
                        value={question.bounds?.min}
                        onChange={(v) => patch({ bounds: { ...(question.bounds ?? {}), min: v } })}
                      />
                      <NumberField
                        label="Highest"
                        value={question.bounds?.max}
                        onChange={(v) => patch({ bounds: { ...(question.bounds ?? {}), max: v } })}
                      />
                    </>
                  ) : (
                    <>
                      <NumberField
                        label="Min length"
                        value={question.bounds?.minLen}
                        onChange={(v) => patch({ bounds: { ...(question.bounds ?? {}), minLen: v } })}
                      />
                      <NumberField
                        label="Max length"
                        value={question.bounds?.maxLen}
                        onChange={(v) => patch({ bounds: { ...(question.bounds ?? {}), maxLen: v } })}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </Panel>
      )}

      <Panel title="When it shows" badge={question.rule ? <MiniTag tone="accent">conditional</MiniTag> : undefined}>
        <RuleBuilder
          question={question}
          sources={ruleSources}
          onChange={(rule) => dispatch({ kind: "SET_RULE", id: question.id, rule })}
        />
      </Panel>

      <div className="px-4 py-3">
        <RemoveControl
          question={question}
          onRemove={() => dispatch({ kind: "REMOVE_QUESTION", id: question.id })}
          onRestore={() => dispatch({ kind: "RESTORE_QUESTION", id: question.id })}
        />
      </div>

      <TypeCatalogue
        anchorRef={typeRef}
        open={typeOpen}
        onClose={() => setTypeOpen(false)}
        current={question.typeId}
        onPick={(typeId) => dispatch({ kind: "CHANGE_TYPE", id: question.id, typeId })}
      />
    </div>
  );
}

function ColumnBody({
  column,
  onPatch,
}: {
  column: SubColumn;
  onPatch: (p: Partial<SubColumn>) => void;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const Icon = typeGlyph(column.typeId);
  return (
    <>
      <TextField
        label="Column heading"
        value={column.label}
        onChange={(v) => onPatch({ label: v })}
        placeholder="Quantity"
      />
      <Field label="Kind of answer">
        <button
          ref={ref}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-left hover:border-bz-line"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon size={12} className="shrink-0 text-bz-text-muted" />
            <span className="truncate text-[13px] text-bz-text">{typeLabel(column.typeId)}</span>
          </span>
          <ChevronDown size={12} className="shrink-0 text-bz-text-muted" />
        </button>
      </Field>
      <ToggleRow label="Must be answered" value={column.required} onChange={(v) => onPatch({ required: v })} />
      <ToggleRow
        label="Can be searched on"
        value={column.searchable}
        onChange={(v) => onPatch({ searchable: v })}
        disabled={!canBeSearchable(column.typeId)}
        disabledNote="This kind of answer has nothing to search against."
      />
      <TypeCatalogue
        anchorRef={ref}
        open={open}
        onClose={() => setOpen(false)}
        current={column.typeId}
        onPick={(typeId) => onPatch({ typeId })}
      />
    </>
  );
}

function InspectorEmpty({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-10 items-center justify-center rounded-bz-pill bg-bz-paper-warm">
        <CornerDownRight size={16} className="text-bz-text-muted" />
      </span>
      <p className="mt-3 text-[13px] font-semibold text-bz-text">Pick a question to edit it</p>
      <p className="mt-1.5 max-w-[240px] text-[11.5px] leading-relaxed text-bz-text-muted">
        {count === 0
          ? "Add your first question on the left — everything about it appears here."
          : "Click any question on the left. What you can change depends on the kind of answer it takes."}
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ANSWER PREVIEW — a dead rendering of the control the respondent will meet.
// This is what makes the canvas read as a document rather than a settings list.
// ════════════════════════════════════════════════════════════════════════════

const WIDTH_CLS: Record<Question["width"], string> = {
  third: "max-w-[240px]",
  half: "max-w-[420px]",
  full: "w-full",
};

function Ghost({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-8 items-center rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5 text-[11.5px] text-bz-text-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

function AnswerPreview({ question }: { question: Question }) {
  const { typeId } = question;
  const ph = question.placeholder || question.defaultValue || "";
  const family = typeFamily(typeId);
  const Icon = typeGlyph(typeId);
  const width = WIDTH_CLS[question.width];

  if (typeId === "divider") return <div className="h-px w-full bg-bz-line" />;
  if (typeId === "section_heading")
    return (
      <p className="text-[14px] font-semibold text-bz-text">{question.label || "Section heading"}</p>
    );
  if (typeId === "rich_text")
    return (
      <div className="rounded-bz-sm border border-dashed border-bz-line bg-bz-paper-warm px-3 py-2">
        <p className="line-clamp-2 text-[11.5px] leading-relaxed text-bz-text-muted">
          {(question.markup ?? "").replace(/<[^>]*>/g, "").trim() || "Your own content block."}
        </p>
      </div>
    );

  if (typeId === "long_text")
    return (
      <div className="flex h-16 w-full items-start rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5 py-2 text-[11.5px] text-bz-text-soft">
        {ph || "A few lines of writing…"}
      </div>
    );

  if (typeId === "yes_no")
    return (
      <div className="flex items-center gap-2">
        <span className="pointer-events-none inline-flex h-[18px] w-8 items-center rounded-bz-pill border border-bz-line-soft bg-bz-paper-warm">
          <span className="ml-[2px] h-3 w-3 rounded-bz-pill bg-bz-surface" />
        </span>
        <span className="text-[11.5px] text-bz-text-soft">Yes / No</span>
      </div>
    );

  if (typeId === "rating")
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={14} className="text-bz-line" />
        ))}
      </div>
    );

  if (hasChoices(typeId) && typeId !== "dropdown") {
    const choices = (question.choices ?? []).slice(0, 4);
    if (!choices.length)
      return <Ghost className={width}>No choices added yet</Ghost>;
    return (
      <div className="flex flex-col gap-1.5">
        {choices.map((c) => (
          <span key={c.id} className="flex items-center gap-2">
            <span
              className={cn(
                "size-3 shrink-0 border border-bz-line bg-bz-surface",
                typeId === "multi_select" ? "rounded-[3px]" : "rounded-bz-pill",
              )}
            />
            <span className={cn("text-[11.5px]", c.label ? "text-bz-text-muted" : "text-bz-text-soft")}>
              {c.label || "Untitled choice"}
            </span>
          </span>
        ))}
        {(question.choices ?? []).length > 4 && (
          <span className="text-[10.5px] text-bz-text-soft">
            +<span className="tabular-nums">{(question.choices ?? []).length - 4}</span> more
          </span>
        )}
      </div>
    );
  }

  if (typeId === "sub_table") {
    const cols = question.columns ?? [];
    if (!cols.length)
      return <Ghost className="w-full">No columns defined yet</Ghost>;
    return (
      <div className="overflow-hidden rounded-bz-sm border border-bz-line-soft">
        <div className="flex bg-bz-paper-warm">
          {cols.slice(0, 4).map((c) => (
            <span
              key={c.id}
              className="flex-1 truncate border-r border-bz-line-soft px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-bz-text-muted last:border-r-0"
            >
              {c.label || "Column"}
            </span>
          ))}
        </div>
        <div className="flex">
          {cols.slice(0, 4).map((c) => (
            <span key={c.id} className="h-7 flex-1 border-r border-bz-line-soft last:border-r-0" />
          ))}
        </div>
      </div>
    );
  }

  if (family === "evidence") {
    const label =
      typeId === "signature"
        ? "Signed on screen"
        : typeId === "image"
          ? "Photos from camera or gallery"
          : typeId === "barcode"
            ? "Scan a barcode or QR code"
            : typeId === "geo"
              ? "Position captured on submit"
              : "Drop a file, or browse";
    return (
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-bz-sm border border-dashed border-bz-line bg-bz-paper-warm px-3 text-[11.5px] text-bz-text-soft",
          width,
        )}
      >
        <Icon size={13} className="shrink-0" />
        {label}
      </div>
    );
  }

  if (family === "lookup") {
    const source = MASTER_SOURCES.find((m) => m.id === question.sourceId);
    return (
      <Ghost className={cn(width, !source && "border-[#E7BDB8]")}>
        <Icon size={12} className="mr-2 shrink-0" />
        <span className={cn("truncate", !source && "text-[#9A2E29]")}>
          {source ? `Pick from ${source.name}` : "Waiting for a record list"}
        </span>
        <ChevronDown size={12} className="ml-auto shrink-0" />
      </Ghost>
    );
  }

  if (family === "datetime" || typeId === "dropdown")
    return (
      <Ghost className={width}>
        <Icon size={12} className="mr-2 shrink-0" />
        <span className="truncate">{ph || typeLabel(typeId)}</span>
        <ChevronDown size={12} className="ml-auto shrink-0" />
      </Ghost>
    );

  if (family === "number")
    return (
      <Ghost className={cn(width, "tabular-nums")}>{ph || "0"}</Ghost>
    );

  if (family === "text")
    return <Ghost className={width}>{ph || "Type an answer…"}</Ghost>;

  // unknown kind -> neutral, never blank
  return (
    <Ghost className={width}>
      <Icon size={12} className="mr-2 shrink-0" />
      Answer captured by “{typeLabel(typeId)}”
    </Ghost>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// QUESTION CARD
// ════════════════════════════════════════════════════════════════════════════

function QuestionCard({
  question,
  state,
  dispatch,
  selected,
  dragging,
  onArmDrag,
  onDisarmDrag,
  armed,
  onDragStart,
  onDragEnd,
  cardRef,
  sections,
  labelRef,
}: {
  question: Question;
  state: State;
  dispatch: React.Dispatch<Action>;
  selected: boolean;
  dragging: boolean;
  armed: boolean;
  onArmDrag: () => void;
  onDisarmDrag: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  cardRef: (el: HTMLDivElement | null) => void;
  sections: SectionModel[];
  labelRef?: React.Ref<HTMLInputElement>;
}) {
  const typeRef = React.useRef<HTMLButtonElement>(null);
  const kebabRef = React.useRef<HTMLButtonElement>(null);
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [kebabOpen, setKebabOpen] = React.useState(false);
  const [moveOpen, setMoveOpen] = React.useState(false);
  const Icon = typeGlyph(question.typeId);
  const answers = holdsAnswer(question.typeId);
  const currentSection = sectionOf(sections, question.id);

  return (
    <div
      ref={cardRef}
      data-qid={question.id}
      draggable={armed}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-stop]")) return;
        dispatch({ kind: "SELECT", id: question.id });
      }}
      className={cn(
        "group relative cursor-pointer rounded-bz-lg border bg-bz-surface transition-colors",
        selected ? "border-bz-text shadow-[0_1px_3px_rgba(15,20,17,0.08)]" : "border-bz-line-soft hover:border-bz-line",
        dragging && "opacity-40",
        question.withdrawn && "bg-bz-paper-warm/60",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-4 h-7 w-[3px] rounded-r-bz-pill bg-bz-fire transition-opacity",
          selected ? "opacity-100" : "opacity-0",
        )}
      />

      {/* head */}
      <div className="flex items-start gap-2 px-2.5 pt-2.5 sm:px-3">
        <div
          data-stop
          onMouseDown={onArmDrag}
          onMouseUp={onDisarmDrag}
          onMouseLeave={onDisarmDrag}
          title="Drag to reorder — you can drop it into another section"
          className={cn(
            "mt-1 hidden h-7 w-4 cursor-grab items-center justify-center text-bz-text-soft transition-opacity active:cursor-grabbing sm:flex",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <GripVertical size={13} strokeWidth={1.8} />
        </div>

        <button
          ref={typeRef}
          data-stop
          onClick={() => setTypeOpen((v) => !v)}
          title={`${typeLabel(question.typeId)} — change the kind of answer`}
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-bz-sm border transition-colors",
            typeOpen ? "border-bz-text bg-bz-paper-warm" : "border-transparent hover:border-bz-line-soft hover:bg-bz-paper-warm",
          )}
        >
          <Icon size={13} strokeWidth={1.7} className="text-bz-text-muted" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <input
              ref={labelRef}
              data-stop
              value={question.label}
              onChange={(e) =>
                dispatch({ kind: "PATCH_QUESTION", id: question.id, patch: { label: e.target.value } })
              }
              onFocus={() => dispatch({ kind: "SELECT", id: question.id })}
              placeholder={`Untitled ${typeLabel(question.typeId).toLowerCase()}`}
              className={cn(
                "min-w-0 flex-1 border-b border-transparent bg-transparent pb-0.5 text-[14px] font-medium text-bz-text outline-none placeholder:font-normal placeholder:text-bz-text-soft",
                "focus:border-bz-fire",
                question.withdrawn && "line-through decoration-bz-line",
              )}
            />
            {question.required && answers && (
              <MiniTag tone="accent">{question.rule ? "must, when shown" : "must answer"}</MiniTag>
            )}
            {question.withdrawn && <MiniTag icon={EyeOff}>withdrawn</MiniTag>}
            {!CATALOGUE_MAP[question.typeId] && <MiniTag tone="warn">unknown kind</MiniTag>}
          </div>
          {question.help && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-bz-text-muted">{question.help}</p>
          )}
        </div>

        <button
          ref={kebabRef}
          data-stop
          onClick={() => setKebabOpen((v) => !v)}
          aria-label="More"
          className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      {/* preview */}
      <div className="px-3 pb-2.5 pt-2 sm:pl-[52px] sm:pr-3">
        <AnswerPreview question={question} />
      </div>

      {/* foot */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-bz-line-soft px-3 py-1.5 sm:pl-[52px]">
        <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.02em] text-bz-text-soft">
          {question.published && <Lock size={9} />}
          {question.key}
        </span>
        <span className="text-bz-line">·</span>
        <span className="text-[10px] text-bz-text-soft">{typeLabel(question.typeId)}</span>
        {question.searchable && answers && <MiniTag tone="leaf">searchable</MiniTag>}
        {question.readOnly && <MiniTag>read-only</MiniTag>}
        {question.rule && (
          <MiniTag icon={Eye}>
            shown when {question.rule.source} {OP_MAP[question.rule.op].label}
            {OP_MAP[question.rule.op].needsValue && question.rule.value ? ` ${question.rule.value}` : ""}
          </MiniTag>
        )}
        {question.published && (
          <span className="ml-auto text-[10px] tabular-nums text-bz-text-soft">
            {question.answers ?? 0} answers
          </span>
        )}
      </div>

      {/* inline editor below lg — the right rail does the job above it */}
      {selected && (
        <div className="border-t border-bz-line bg-bz-paper lg:hidden">
          <Inspector question={question} state={state} dispatch={dispatch} />
        </div>
      )}

      <TypeCatalogue
        anchorRef={typeRef}
        open={typeOpen}
        onClose={() => setTypeOpen(false)}
        current={question.typeId}
        onPick={(typeId) => dispatch({ kind: "CHANGE_TYPE", id: question.id, typeId })}
      />

      <Popover anchorRef={kebabRef} open={kebabOpen} onClose={() => setKebabOpen(false)} align="end" width={216}>
        <div className="py-1">
          <MenuItem
            icon={Settings2}
            label="Edit this question"
            onSelect={() => {
              dispatch({ kind: "SELECT", id: question.id });
              setKebabOpen(false);
            }}
          />
          <MenuItem
            icon={ArrowRight}
            label="Move to another section…"
            disabled={sections.length < 2}
            onSelect={() => {
              setKebabOpen(false);
              setMoveOpen(true);
            }}
          />
          <div className="my-1 h-px bg-bz-line-soft" />
          {question.withdrawn ? (
            <MenuItem
              icon={Undo2}
              label="Put back into the form"
              onSelect={() => {
                dispatch({ kind: "RESTORE_QUESTION", id: question.id });
                setKebabOpen(false);
              }}
            />
          ) : (
            <MenuItem
              icon={question.published ? EyeOff : Trash2}
              destructive
              label={question.published ? "Remove from new responses" : "Delete permanently"}
              onSelect={() => {
                dispatch({ kind: "REMOVE_QUESTION", id: question.id });
                setKebabOpen(false);
              }}
            />
          )}
        </div>
      </Popover>

      <Popover anchorRef={kebabRef} open={moveOpen} onClose={() => setMoveOpen(false)} align="end" width={216}>
        <div className="py-1">
          <p className="px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            Move to
          </p>
          {sections.map((s) => (
            <MenuItem
              key={s.id}
              label={s.name}
              disabled={s.id === currentSection?.id}
              onSelect={() => {
                dispatch({
                  kind: "MOVE_QUESTION",
                  id: question.id,
                  toSectionId: s.id,
                  toIndex: s.questions.length,
                });
                setMoveOpen(false);
              }}
            />
          ))}
        </div>
      </Popover>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADD-QUESTION AFFORDANCE — repeated at the end of every section, so the
// primary act is never more than one click away.
// ════════════════════════════════════════════════════════════════════════════

function AddQuestion({
  onPick,
  variant = "row",
}: {
  onPick: (typeId: string) => void;
  variant?: "row" | "solid";
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        ref={ref}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          variant === "solid"
            ? "inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95"
            : cn(
                "flex h-11 w-full items-center justify-center gap-2 rounded-bz-lg border border-dashed text-[12.5px] font-medium transition-colors",
                open
                  ? "border-bz-text bg-bz-fire/[0.12] text-bz-text"
                  : "border-bz-line bg-bz-surface/60 text-bz-text-muted hover:border-bz-text hover:bg-bz-surface hover:text-bz-text",
              ),
        )}
      >
        <Plus size={13} /> Add a question
      </button>
      <TypeCatalogue anchorRef={ref} open={open} onClose={() => setOpen(false)} onPick={onPick} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION BLOCK
// ════════════════════════════════════════════════════════════════════════════

function SectionBlock({
  section,
  index,
  total,
  state,
  dispatch,
  drag,
  labelRef,
}: {
  section: SectionModel;
  index: number;
  total: number;
  state: State;
  dispatch: React.Dispatch<Action>;
  drag: DragApi;
  labelRef: React.MutableRefObject<HTMLInputElement | null>;
}) {
  const kebabRef = React.useRef<HTMLButtonElement>(null);
  const [kebabOpen, setKebabOpen] = React.useState(false);
  const blocked = section.questions.some((q) => q.published);
  const live = section.questions.filter((q) => !q.withdrawn).length;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 pl-1">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-bz-sm bg-bz-deep text-[9.5px] font-bold tabular-nums text-bz-paper">
          {index + 1}
        </span>
        <input
          value={section.name}
          onChange={(e) => dispatch({ kind: "RENAME_SECTION", id: section.id, name: e.target.value })}
          placeholder="Name this section"
          className="min-w-0 flex-1 border-b border-transparent bg-transparent pb-0.5 text-[13px] font-semibold tracking-tight text-bz-text outline-none placeholder:font-normal placeholder:text-bz-text-soft focus:border-bz-fire"
        />
        <span className="shrink-0 text-[10.5px] tabular-nums text-bz-text-soft">
          {live} {live === 1 ? "question" : "questions"}
        </span>
        <button
          ref={kebabRef}
          onClick={() => setKebabOpen((v) => !v)}
          aria-label="Section options"
          className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-surface"
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      <div
        onDragOver={(e) => drag.onDragOver(e, section.id)}
        onDrop={(e) => drag.onDrop(e, section.id)}
        className="flex flex-col gap-2"
      >
        {section.questions.length === 0 ? (
          <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface/50 px-4 py-6 text-center">
            <p className="text-[12px] text-bz-text-muted">This section is empty.</p>
            <p className="mt-0.5 text-[11px] text-bz-text-soft">
              Add a question below, or drag one in from another section.
            </p>
          </div>
        ) : (
          section.questions.map((q, i) => (
            <React.Fragment key={q.id}>
              {drag.indicator(section.id, i)}
              <QuestionCard
                question={q}
                state={state}
                dispatch={dispatch}
                sections={state.sections}
                selected={state.selectedId === q.id}
                dragging={drag.draggingId === q.id}
                armed={drag.armedId === q.id}
                onArmDrag={() => drag.setArmedId(q.id)}
                onDisarmDrag={() => drag.setArmedId(null)}
                onDragStart={(e) => drag.onDragStart(e, q.id)}
                onDragEnd={drag.onDragEnd}
                cardRef={drag.setCardRef(q.id)}
                labelRef={state.selectedId === q.id ? labelRef : undefined}
              />
            </React.Fragment>
          ))
        )}
        {drag.indicator(section.id, section.questions.length)}
      </div>

      <AddQuestion
        onPick={(typeId) => dispatch({ kind: "ADD_QUESTION", typeId, sectionId: section.id })}
      />

      <Popover anchorRef={kebabRef} open={kebabOpen} onClose={() => setKebabOpen(false)} align="end" width={240}>
        <div className="py-1">
          <MenuItem
            icon={ArrowUp}
            label="Move section up"
            disabled={index === 0}
            onSelect={() => {
              dispatch({ kind: "MOVE_SECTION", id: section.id, dir: -1 });
              setKebabOpen(false);
            }}
          />
          <MenuItem
            icon={ArrowDown}
            label="Move section down"
            disabled={index === total - 1}
            onSelect={() => {
              dispatch({ kind: "MOVE_SECTION", id: section.id, dir: 1 });
              setKebabOpen(false);
            }}
          />
          <div className="my-1 h-px bg-bz-line-soft" />
          <MenuItem
            icon={Trash2}
            destructive
            label="Delete this section"
            onSelect={() => {
              dispatch({ kind: "DELETE_SECTION", id: section.id });
              setKebabOpen(false);
            }}
          />
          {blocked && (
            <p className="px-3 pb-2 pt-1 text-[10.5px] leading-relaxed text-bz-text-soft">
              This section holds published questions — remove those one at a time first, so their stored
              answers stay readable.
            </p>
          )}
        </div>
      </Popover>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DRAG — within a section and, unlike the old builder, ACROSS sections
// ════════════════════════════════════════════════════════════════════════════

type DragApi = {
  draggingId: string | null;
  armedId: string | null;
  setArmedId: (id: string | null) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, sectionId: string) => void;
  onDrop: (e: React.DragEvent, sectionId: string) => void;
  onDragEnd: () => void;
  setCardRef: (id: string) => (el: HTMLDivElement | null) => void;
  indicator: (sectionId: string, index: number) => React.ReactNode;
};

function useDrag(sections: SectionModel[], dispatch: React.Dispatch<Action>): DragApi {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [armedId, setArmedId] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ sectionId: string; index: number } | null>(null);
  const refs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  return {
    draggingId,
    armedId,
    setArmedId,
    setCardRef: (id) => (el) => {
      if (el) refs.current.set(id, el);
      else refs.current.delete(id);
    },
    onDragStart: (e, id) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      setDraggingId(id);
    },
    onDragOver: (e, sectionId) => {
      if (!draggingId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const list = sections.find((s) => s.id === sectionId)?.questions ?? [];
      let index = list.length;
      for (let i = 0; i < list.length; i += 1) {
        const el = refs.current.get(list[i].id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (e.clientY < r.top + r.height / 2) {
          index = i;
          break;
        }
      }
      setOver((prev) =>
        prev && prev.sectionId === sectionId && prev.index === index ? prev : { sectionId, index },
      );
    },
    onDrop: (e, sectionId) => {
      if (!draggingId || !over) return;
      e.preventDefault();
      dispatch({ kind: "MOVE_QUESTION", id: draggingId, toSectionId: sectionId, toIndex: over.index });
      setDraggingId(null);
      setOver(null);
      setArmedId(null);
    },
    onDragEnd: () => {
      setDraggingId(null);
      setOver(null);
      setArmedId(null);
    },
    indicator: (sectionId, index) =>
      draggingId && over && over.sectionId === sectionId && over.index === index ? (
        <div className="-my-1 h-0.5 rounded-bz-pill bg-bz-fire" />
      ) : null,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// MODE 2 — RESPONSE TABLE (optional: a sensible one is built at first publish)
// ════════════════════════════════════════════════════════════════════════════

function candidateLabel(id: string, questions: Question[]): string {
  if (id.startsWith("sys:")) return INTRINSIC_MAP[id]?.label ?? id.slice(4);
  const key = id.slice(2);
  const q = questions.find((x) => x.key === key);
  return q ? displayName(q) : key;
}

function ChosenColumn({
  column,
  index,
  total,
  questions,
  dispatch,
  drag,
}: {
  column: ColumnPick;
  index: number;
  total: number;
  questions: Question[];
  dispatch: React.Dispatch<Action>;
  drag: {
    draggingIndex: number | null;
    start: (e: React.DragEvent, i: number) => void;
    end: () => void;
  };
}) {
  const original = candidateLabel(column.id, questions);
  return (
    <div
      draggable
      onDragStart={(e) => drag.start(e, index)}
      onDragEnd={drag.end}
      className={cn(
        "flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface py-1.5 pl-1.5 pr-1",
        drag.draggingIndex === index && "opacity-40",
      )}
    >
      <span className="flex w-4 cursor-grab items-center justify-center text-bz-text-soft active:cursor-grabbing">
        <GripVertical size={12} strokeWidth={1.8} />
      </span>
      <span className="w-4 shrink-0 text-[10px] tabular-nums text-bz-text-soft">{index + 1}</span>
      <input
        value={column.label ?? ""}
        onChange={(e) => dispatch({ kind: "SET_COLUMN_LABEL", columnId: column.id, label: e.target.value })}
        placeholder={original}
        className="min-w-0 flex-1 border-b border-transparent bg-transparent pb-0.5 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-muted focus:border-bz-fire"
      />
      {column.label && column.label !== original && (
        <span className="hidden shrink-0 text-[10px] text-bz-text-soft sm:inline">was “{original}”</span>
      )}
      <div className="flex shrink-0 items-center">
        <button
          aria-label="Move up"
          disabled={index === 0}
          onClick={() => dispatch({ kind: "MOVE_COLUMN", from: index, to: index - 1 })}
          className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm disabled:opacity-30"
        >
          <ArrowUp size={11} />
        </button>
        <button
          aria-label="Move down"
          disabled={index === total - 1}
          onClick={() => dispatch({ kind: "MOVE_COLUMN", from: index, to: index + 1 })}
          className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm disabled:opacity-30"
        >
          <ArrowDown size={11} />
        </button>
        <button
          aria-label="Remove column"
          onClick={() => dispatch({ kind: "TOGGLE_COLUMN", columnId: column.id })}
          className="flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-[#FBE7E5] hover:text-[#9A2E29]"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

function TableMode({
  state,
  dispatch,
  answerQuestions,
  filterCandidates,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  answerQuestions: Question[];
  filterCandidates: Question[];
}) {
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
  const chosen = new Set(state.columns.map((c) => c.id));
  const allQ = allQuestions(state.sections);

  return (
    <div className="flex flex-col gap-4">
      <Note icon={Wand2} tone="accent">
        You can skip all of this. If you leave it alone we build a workable response list for you the
        first time this form goes live — this page is only here for when you want something different.
      </Note>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* columns */}
        <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper">
          <div className="flex items-center justify-between gap-2 border-b border-bz-line-soft px-4 py-3">
            <div className="flex items-center gap-2">
              <Columns3 size={13} className="text-bz-text-muted" />
              <h2 className="text-[13px] font-semibold text-bz-text">What the list shows</h2>
              <MiniTag>{state.columns.length}</MiniTag>
            </div>
            <button
              onClick={() => dispatch({ kind: "AUTO_COLUMNS" })}
              className="inline-flex h-7 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              <Sparkles size={11} /> Build it for me
            </button>
          </div>

          <div
            className="flex flex-col gap-1.5 px-4 py-3"
            onDragOver={(e) => {
              if (draggingIndex === null) return;
              e.preventDefault();
            }}
          >
            {state.columns.length === 0 ? (
              <div className="rounded-bz-md border border-dashed border-bz-line bg-bz-surface px-4 py-8 text-center">
                <Inbox size={16} className="mx-auto text-bz-text-muted" />
                <p className="mt-2 text-[12.5px] font-medium text-bz-text">Nothing chosen yet</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-bz-text-muted">
                  Tick anything below, or let us build a starting table for you.
                </p>
              </div>
            ) : (
              state.columns.map((c, i) => (
                <div
                  key={c.id}
                  onDragOver={(e) => {
                    if (draggingIndex === null || draggingIndex === i) return;
                    e.preventDefault();
                    dispatch({ kind: "MOVE_COLUMN", from: draggingIndex, to: i });
                    setDraggingIndex(i);
                  }}
                >
                  <ChosenColumn
                    column={c}
                    index={i}
                    total={state.columns.length}
                    questions={allQ}
                    dispatch={dispatch}
                    drag={{
                      draggingIndex,
                      start: (e, idx) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingIndex(idx);
                      },
                      end: () => setDraggingIndex(null),
                    }}
                  />
                </div>
              ))
            )}
          </div>

          <div className="border-t border-bz-line-soft px-4 py-3">
            <p className="pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
              About the response
            </p>
            <div className="flex flex-wrap gap-1.5">
              {INTRINSIC.map((i) => (
                <CandidateChip
                  key={i.id}
                  label={i.label}
                  hint={i.hint}
                  on={chosen.has(i.id)}
                  onToggle={() => dispatch({ kind: "TOGGLE_COLUMN", columnId: i.id })}
                />
              ))}
            </div>
            <p className="pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
              Answers people give
            </p>
            {answerQuestions.length === 0 ? (
              <p className="text-[11.5px] text-bz-text-muted">
                No question holds an answer yet, so there is nothing to show here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {answerQuestions.map((q) => (
                  <CandidateChip
                    key={q.id}
                    label={displayName(q)}
                    hint={typeLabel(q.typeId)}
                    on={chosen.has(`q:${q.key}`)}
                    onToggle={() => dispatch({ kind: "TOGGLE_COLUMN", columnId: `q:${q.key}` })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* filters */}
        <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper">
          <div className="flex items-center gap-2 border-b border-bz-line-soft px-4 py-3">
            <Filter size={13} className="text-bz-text-muted" />
            <h2 className="text-[13px] font-semibold text-bz-text">What people can filter by</h2>
            <MiniTag>{state.filters.length}</MiniTag>
          </div>
          {filterCandidates.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Filter size={16} className="mx-auto text-bz-text-muted" />
              <p className="mt-2 text-[12.5px] font-medium text-bz-text">Nothing can be filtered yet</p>
              <p className="mx-auto mt-1 max-w-[320px] text-[11.5px] leading-relaxed text-bz-text-muted">
                A question only becomes a filter once “Can be searched on” is switched on for it. Until
                then there is nothing stored for the filter to look at.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-bz-line-soft">
              {filterCandidates.map((q) => {
                const Icon = typeGlyph(q.typeId);
                const on = state.filters.includes(q.key);
                return (
                  <button
                    key={q.id}
                    onClick={() => dispatch({ kind: "TOGGLE_FILTER", key: q.key })}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-bz-paper-warm/50"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                        on ? "border-bz-fire bg-bz-fire" : "border-bz-line bg-bz-surface",
                      )}
                    >
                      {on && <Check size={10} className="text-bz-text" />}
                    </span>
                    <Icon size={12} className="shrink-0 text-bz-text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-bz-text">{displayName(q)}</span>
                      <span className="block truncate text-[10px] tracking-[0.02em] text-bz-text-soft">
                        {q.key}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="border-t border-bz-line-soft px-4 py-3">
            <Note>
              Turning “Can be searched on” off for a question drops it from this list straight away, and
              from any filter already chosen.
            </Note>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateChip({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      title={hint}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-bz-pill border px-2.5 py-1 text-[11.5px] transition-colors",
        on
          ? "border-bz-text bg-bz-fire/[0.18] text-bz-text"
          : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-line hover:text-bz-text",
      )}
    >
      {on ? <Check size={10} /> : <Plus size={10} />}
      <span className="truncate">{label}</span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODE 3 — LEAD HAND-OFF (off by default; the whole mapper is absent until on)
// ════════════════════════════════════════════════════════════════════════════

function LeadRow({
  field,
  bind,
  candidates,
  onChange,
}: {
  field: { id: string; label: string };
  bind?: LeadBind;
  candidates: Question[];
  onChange: (b: LeadBind | null) => void;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const mode = bind?.mode ?? "question";
  const bound = candidates.find((c) => c.key === bind?.question);

  return (
    <div className="grid grid-cols-1 gap-2 px-4 py-2.5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:items-center">
      <p className="truncate text-[12.5px] text-bz-text">{field.label}</p>
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="w-[124px] shrink-0">
          <Segmented
            value={mode}
            onChange={(m) =>
              onChange(
                m === "question"
                  ? { mode: "question", question: bind?.question }
                  : { mode: "fixed", fixed: bind?.fixed ?? "" },
              )
            }
            options={[
              { id: "question", label: "Answer" },
              { id: "fixed", label: "Fixed" },
            ]}
          />
        </div>
        {mode === "question" ? (
          <button
            ref={ref}
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 min-w-0 flex-1 items-center justify-between gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-left hover:border-bz-line"
          >
            <span className={cn("truncate text-[12px]", bound ? "text-bz-text" : "text-bz-text-soft")}>
              {bound ? displayName(bound) : "Not mapped"}
            </span>
            <ChevronDown size={11} className="shrink-0 text-bz-text-muted" />
          </button>
        ) : (
          <input
            value={bind?.fixed ?? ""}
            onChange={(e) => onChange({ mode: "fixed", fixed: e.target.value })}
            placeholder="The same value on every lead"
            className="h-8 min-w-0 flex-1 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 text-[12px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
          />
        )}
        {bind && (
          <button
            onClick={() => onChange(null)}
            aria-label="Clear"
            className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
          >
            <X size={11} />
          </button>
        )}
      </div>
      <QuestionPicker
        anchorRef={ref}
        open={open}
        onClose={() => setOpen(false)}
        candidates={candidates}
        current={bind?.question}
        onPick={(key) => onChange({ mode: "question", question: key })}
        emptyNote="No question holds an answer that could fill this in."
      />
    </div>
  );
}

function LeadMode({
  state,
  dispatch,
  answerQuestions,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  answerQuestions: Question[];
}) {
  const map = state.lead.map;
  const filled = (id: string) => {
    const b = map[id];
    if (!b) return false;
    return b.mode === "fixed" ? !!b.fixed?.trim() : !!b.question;
  };
  const missingName = !filled("organisation_name") && !(filled("first_name") && filled("last_name"));

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper">
        <div className="flex items-start justify-between gap-4 px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold text-bz-text">Turn a response into a sales lead</h2>
            <p className="mt-1 max-w-[560px] text-[11.5px] leading-relaxed text-bz-text-muted">
              Off unless you need it. Switch it on and each submitted response can be pushed into the
              lead pipeline, with the answers you choose already filled in.
            </p>
          </div>
          <Switch
            value={state.lead.enabled}
            onChange={(v) => dispatch({ kind: "SET_LEAD_ENABLED", enabled: v })}
            ariaLabel="Enable the lead hand-off"
          />
        </div>
      </div>

      {!state.lead.enabled ? (
        <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface/60 px-6 py-14 text-center">
          <Target size={18} className="mx-auto text-bz-text-muted" />
          <p className="mt-2.5 text-[13px] font-semibold text-bz-text">The hand-off is switched off</p>
          <p className="mx-auto mt-1.5 max-w-[380px] text-[11.5px] leading-relaxed text-bz-text-muted">
            Nothing here affects your form until you turn it on — and most forms never need it.
          </p>
        </div>
      ) : (
        <>
          {missingName && (
            <Note icon={AlertCircle} tone="warn">
              A lead cannot be created without a name. Map an{" "}
              <span className="font-semibold">organisation name</span>, or both a{" "}
              <span className="font-semibold">first</span> and{" "}
              <span className="font-semibold">last name</span>. You can still save this as it is — the
              hand-off just will not run until one of those is filled.
            </Note>
          )}

          {LEAD_SECTIONS.map((sec) => (
            <div key={sec.section} className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper">
              <p className="border-b border-bz-line-soft px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                {sec.section}
              </p>
              <div className="divide-y divide-bz-line-soft">
                {sec.fields.map((f) => (
                  <LeadRow
                    key={f.id}
                    field={f}
                    bind={map[f.id]}
                    candidates={answerQuestions}
                    onChange={(b) => dispatch({ kind: "SET_LEAD_BIND", field: f.id, bind: b })}
                  />
                ))}
              </div>
            </div>
          ))}

          <Note>
            The pipeline applies its own rules afterwards — its mandatory fields and its duplicate check
            still run. Anything you leave unmapped is simply filled in by hand on the lead itself.
          </Note>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MODE 4 — IDENTITY & BEHAVIOUR
// ════════════════════════════════════════════════════════════════════════════

function SettingsMode({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const nextNumber = `${state.prefix || "FORM-"}${String((state.responseCount ?? 0) + 1).padStart(4, "0")}`;
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper">
        <p className="border-b border-bz-line-soft px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
          How this form appears
        </p>
        <div className="flex flex-col gap-3.5 px-4 py-4">
          <TextField
            label="Form name"
            hint="required"
            value={state.name}
            onChange={(v) => dispatch({ kind: "PATCH_IDENTITY", patch: { name: v } })}
            placeholder="Field Service Visit Report"
          />
          <TextField
            label="Group it under"
            hint="optional"
            value={state.category}
            onChange={(v) => dispatch({ kind: "PATCH_IDENTITY", patch: { category: v } })}
            placeholder="Operations"
          />
          <TextArea
            label="Description"
            hint="optional"
            rows={2}
            value={state.description}
            onChange={(v) => dispatch({ kind: "PATCH_IDENTITY", patch: { description: v } })}
            placeholder="Who fills this in, and when."
          />
          <Field label="Menu icon">
            <div className="flex flex-wrap gap-1.5">
              {NAV_GLYPHS.map((g) => {
                const Icon = glyphFor(g);
                const on = state.navGlyph === g;
                return (
                  <button
                    key={g}
                    onClick={() => dispatch({ kind: "PATCH_IDENTITY", patch: { navGlyph: g } })}
                    aria-label={g}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-bz-md border transition-colors",
                      on
                        ? "border-bz-text bg-bz-fire/[0.18] text-bz-text"
                        : "border-bz-line-soft bg-bz-surface text-bz-text-muted hover:border-bz-line hover:text-bz-text",
                    )}
                  >
                    <Icon size={14} strokeWidth={1.7} />
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Response numbering" hint={`next: ${nextNumber}`}>
            <input
              value={state.prefix}
              onChange={(e) => dispatch({ kind: "PATCH_IDENTITY", patch: { prefix: e.target.value } })}
              placeholder="FSV-"
              className={cn(INPUT_CLS, "tracking-[0.02em]")}
            />
            <p className="mt-1 text-[10.5px] text-bz-text-soft">
              This form counts its own responses, separately from every other form.
            </p>
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper">
          <p className="border-b border-bz-line-soft px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            What a response can do
          </p>
          <div className="flex flex-col gap-1 px-4 py-3">
            <ToggleRow
              label="Carry file attachments"
              hint="People can attach documents to the whole response."
              value={state.behaviours.attachments}
              onChange={(v) => dispatch({ kind: "PATCH_BEHAVIOUR", patch: { attachments: v } })}
            />
            <ToggleRow
              label="Be parked as a draft"
              hint="Half-finished responses can be saved and picked up later."
              value={state.behaviours.drafts}
              onChange={(v) => dispatch({ kind: "PATCH_BEHAVIOUR", patch: { drafts: v } })}
            />
            <ToggleRow
              label="Be linked to a customer"
              value={state.behaviours.linkCustomer}
              onChange={(v) => dispatch({ kind: "PATCH_BEHAVIOUR", patch: { linkCustomer: v } })}
            />
            <ToggleRow
              label="Be linked to a staff member"
              value={state.behaviours.linkEmployee}
              onChange={(v) => dispatch({ kind: "PATCH_BEHAVIOUR", patch: { linkEmployee: v } })}
            />
            <ToggleRow
              label="Show your own extra fields"
              hint="Surfaces the custom fields defined for this record type."
              value={state.behaviours.extraFields}
              onChange={(v) => dispatch({ kind: "PATCH_BEHAVIOUR", patch: { extraFields: v } })}
            />
          </div>
        </div>

        {state.publishedVersion !== null && (
          <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper">
            <p className="border-b border-bz-line-soft px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
              What is live right now
            </p>
            <div className="flex flex-col gap-2.5 px-4 py-4">
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.12em] text-bz-text-soft">Release</span>
                  <span className="text-[20px] font-semibold tabular-nums tracking-tight text-bz-text">
                    v{state.publishedVersion}
                  </span>
                </span>
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.12em] text-bz-text-soft">Responses</span>
                  <span className="text-[20px] font-semibold tabular-nums tracking-tight text-bz-text">
                    {state.responseCount}
                  </span>
                </span>
              </div>
              <Note icon={ShieldCheck}>
                Every response keeps the questions it was actually asked. Editing this design never
                rewrites history — someone reading response #0031 sees the form as it stood the day it
                was filled in.
              </Note>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLISH — the one-way gate, shown BEFORE it closes
// ════════════════════════════════════════════════════════════════════════════

function PublishSheet({
  state,
  open,
  onClose,
  onConfirm,
}: {
  state: State;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const freezing = React.useMemo(
    () => allQuestions(state.sections).filter((q) => !q.published),
    [state.sections],
  );
  const total = allQuestions(state.sections).length;
  const version = (state.publishedVersion ?? 0) + 1;
  const first = state.publishedVersion === null;
  const busy = state.committing === "publish";

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(15,20,17,0.34)] px-3 py-3 sm:items-center sm:px-4 sm:py-8">
      <div className="flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-bz-lg border border-bz-line bg-bz-surface shadow-[0_28px_70px_-28px_rgba(15,20,17,0.5)]">
        <div className="flex items-start justify-between gap-3 border-b border-bz-line-soft px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
              {first ? "First release" : `Release ${version}`}
            </p>
            <h2 className="mt-1 text-[17px] font-semibold tracking-tight text-bz-text">
              {first ? "Make this form real" : `Publish release ${version}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
          >
            <X size={13} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-3.5">
            <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-bz-text">
                {first ? (
                  <>
                    “{state.name || "This form"}” gets its own menu entry, its own permissions, a page
                    listing every response and a page for reading one.
                  </>
                ) : (
                  <>
                    Everyone filling in “{state.name}” from now on gets this version. The{" "}
                    <span className="tabular-nums">{state.responseCount}</span> responses already given
                    keep the questions they were originally asked.
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                What changes permanently
              </p>
              {freezing.length === 0 ? (
                <Note icon={ShieldCheck}>
                  Nothing new locks this time — every question here was already published, so their
                  identifiers are already permanent.
                </Note>
              ) : (
                <div className="flex flex-col gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-surface p-3">
                  <p className="flex items-start gap-2 text-[12px] leading-relaxed text-bz-text">
                    <Lock size={12} className="mt-[3px] shrink-0 text-bz-text-muted" />
                    <span>
                      <span className="font-semibold tabular-nums">{freezing.length}</span>{" "}
                      {freezing.length === 1 ? "identifier becomes" : "identifiers become"} permanent.
                      Answers get stored against them, so they can never be renamed again.
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {freezing.map((q) => (
                      <span
                        key={q.id}
                        className="inline-flex items-center rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[10.5px] tracking-[0.02em] text-bz-text-muted"
                      >
                        {q.key}
                      </span>
                    ))}
                  </div>
                  <p className="flex items-start gap-2 border-t border-bz-line-soft pt-2.5 text-[12px] leading-relaxed text-bz-text">
                    <EyeOff size={12} className="mt-[3px] shrink-0 text-bz-text-muted" />
                    <span>
                      Those questions can no longer be deleted. Removing one afterwards takes it off new
                      responses instead, so the answers people already gave stay readable.
                    </span>
                  </p>
                </div>
              )}
            </div>

            {state.columns.length === 0 && (
              <Note icon={Wand2} tone="accent">
                You have not designed a response list, so we will build a workable one for you as part of
                this release. You can change it whenever you like.
              </Note>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-bz-md border border-bz-line-soft px-3.5 py-3">
              <Stat label="Sections" value={state.sections.length} />
              <Stat label="Questions" value={total} />
              <Stat label="Locked after this" value={total} />
              <Stat label="Filters" value={state.filters.length} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-5 py-3">
          <p className="hidden text-[11px] text-bz-text-muted sm:block">This cannot be undone.</p>
          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-bz-md border border-bz-line-soft bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
            >
              Not yet
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:opacity-60"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />}
              {first ? "Publish it" : `Publish release ${version}`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex flex-col">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">{label}</span>
      <span className="text-[15px] font-semibold tabular-nums text-bz-text">{value}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REFUSAL REPORT — every sentence carries a way back to what caused it
// ════════════════════════════════════════════════════════════════════════════

function RefusalReport({
  problems,
  sections,
  onJump,
  onDismiss,
}: {
  problems: Problem[];
  sections: SectionModel[];
  onJump: (questionId: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="border-t border-bz-line bg-bz-paper">
      <div className="flex items-start gap-3 px-4 py-3 md:px-6">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire/[0.22]">
          <AlertCircle size={12} className="text-bz-text" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-bz-text">
            Not published yet — <span className="tabular-nums">{problems.length}</span>{" "}
            {problems.length === 1 ? "thing needs" : "things need"} sorting out first
          </p>
          <ul className="mt-2 flex max-h-[168px] flex-col gap-1 overflow-y-auto pr-1">
            {problems.map((p) => {
              const target = inferTarget(p.message, sections);
              return (
                <li key={p.id} className="flex items-start gap-2">
                  <span className="mt-[7px] size-1 shrink-0 rounded-bz-pill bg-bz-text-soft" />
                  <span className="min-w-0 flex-1 text-[11.5px] leading-relaxed text-bz-text-muted">
                    {p.message}
                  </span>
                  {target && (
                    <button
                      onClick={() => onJump(target.id)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-bz-sm border border-bz-line-soft bg-bz-surface px-1.5 py-0.5 text-[10.5px] font-medium text-bz-text hover:border-bz-text"
                    >
                      Take me there <ArrowRight size={9} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMMIT BAR — three intents. Never disabled for being invalid: it acts, then
// names what stopped it.
// ════════════════════════════════════════════════════════════════════════════

function CommitBar({
  state,
  savedRel,
  onSaveDraft,
  onPublish,
  onLeave,
}: {
  state: State;
  savedRel: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onLeave: () => void;
}) {
  const busy = state.committing !== null;
  const locked = !state.canManage;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bz-line bg-bz-paper px-4 py-2.5 md:px-6">
      <p className="flex min-w-0 items-center gap-2 text-[11.5px] text-bz-text-muted">
        {locked ? (
          <>
            <Lock size={12} className="shrink-0 text-bz-text-muted" />
            <span className="truncate">You can look at this form, but not change it.</span>
          </>
        ) : busy ? (
          <>
            <Loader2 size={12} className="shrink-0 animate-spin text-bz-text" />
            <span className="truncate">
              {state.committing === "publish" ? "Publishing…" : "Saving your draft…"}
            </span>
          </>
        ) : state.dirty ? (
          <>
            <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
            <span className="truncate">Unsaved changes — nothing is saved until you say so.</span>
          </>
        ) : (
          <>
            <Check size={12} className="shrink-0 text-bz-leaf-deep" />
            <span className="truncate">Saved {savedRel}.</span>
          </>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onLeave}
          className="hidden h-8 items-center rounded-bz-md px-2.5 text-[12px] font-medium text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text sm:inline-flex"
        >
          Leave
        </button>
        <button
          onClick={onSaveDraft}
          disabled={busy || locked}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12px] font-medium text-bz-text hover:bg-bz-paper-warm disabled:cursor-not-allowed disabled:opacity-45"
        >
          {state.committing === "draft" ? <Loader2 size={11} className="animate-spin" /> : null}
          Save draft
        </button>
        <button
          onClick={onPublish}
          disabled={busy || locked}
          className="inline-flex h-8 items-center gap-1.5 rounded-bz-md bg-bz-deep px-3.5 text-[12px] font-semibold text-bz-text-on-dark hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Rocket size={12} />
          {state.publishedVersion === null ? "Publish" : `Publish v${state.publishedVersion + 1}`}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST — the notification channel has no alarm severity: confirmations and
// advisories only, never a red failure.
// ════════════════════════════════════════════════════════════════════════════

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[75] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[520px] items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-bz-pill",
            toast.tone === "ok" ? "bg-bz-fire/[0.22]" : "bg-bz-paper-warm",
          )}
        >
          {toast.tone === "ok" ? (
            <Check size={13} className="text-bz-leaf-deep" />
          ) : (
            <EyeOff size={12} className="text-bz-text-muted" />
          )}
        </span>
        <p className="text-[12.5px] font-medium leading-snug text-bz-text">{toast.message}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// IDENTITY BAND + MODE TABS
// ════════════════════════════════════════════════════════════════════════════

function ModeTabs({
  mode,
  counts,
  onChange,
}: {
  mode: Mode;
  counts: { questions: number; table: number; lead: number | null; settings: number };
  onChange: (m: Mode) => void;
}) {
  const tabs: { id: Mode; label: string; short: string; icon: LucideIcon; count: number | null }[] = [
    { id: "questions", label: "Questions", short: "Questions", icon: Layers, count: counts.questions },
    { id: "table", label: "Response list", short: "List", icon: Columns3, count: counts.table },
    { id: "lead", label: "Lead hand-off", short: "Leads", icon: Target, count: counts.lead },
    { id: "settings", label: "Form settings", short: "Settings", icon: Settings2, count: counts.settings },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto px-4 md:px-6">
      {tabs.map((t) => {
        const on = t.id === mode;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 px-2.5 pb-2.5 pt-1 text-[12.5px] transition-colors",
              on ? "font-semibold text-bz-text" : "text-bz-text-muted hover:text-bz-text",
            )}
          >
            <Icon size={12} className={on ? "text-bz-text" : "text-bz-text-soft"} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.short}</span>
            {t.count !== null && (
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-bz-pill px-1 text-[10px] font-semibold tabular-nums",
                  on ? "bg-bz-fire/[0.30] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
                )}
              >
                {t.count}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-1 bottom-0 h-[2px] rounded-t-bz-pill transition-colors",
                on ? "bg-bz-fire" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function IdentityBand({
  state,
  dispatch,
  counts,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
  counts: { questions: number; table: number; lead: number | null; settings: number };
}) {
  const kebabRef = React.useRef<HTMLButtonElement>(null);
  const [kebabOpen, setKebabOpen] = React.useState(false);
  const NavIcon = glyphFor(state.navGlyph);
  const live = state.publishedVersion !== null;

  return (
    <div className="sticky top-0 z-30 border-b border-bz-line bg-bz-paper">
      <div className="flex flex-col gap-2.5 px-4 pt-4 md:flex-row md:items-start md:gap-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-1 hidden size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-olive text-bz-fire sm:flex">
            <NavIcon size={16} strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bz-text-soft">
              Form builder · {state.publishedVersion === null ? "new form" : "editing a live form"}
            </p>
            <input
              value={state.name}
              onChange={(e) => dispatch({ kind: "PATCH_IDENTITY", patch: { name: e.target.value } })}
              placeholder="Name this form"
              aria-label="Form name"
              className={cn(
                "mt-0.5 w-full max-w-[560px] border-b border-transparent bg-transparent pb-0.5 text-[22px] font-semibold tracking-[-0.018em] text-bz-text outline-none",
                "placeholder:font-normal placeholder:text-bz-text-soft focus:border-bz-fire",
                !state.name.trim() && "border-[#E7BDB8]",
              )}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-bz-text-muted">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-bz-sm px-2 py-0.5 text-[11px] font-medium",
                  live ? "bg-bz-fire/[0.18] text-bz-text" : "bg-bz-paper-warm text-bz-text-muted",
                )}
              >
                <span className={cn("size-1.5 rounded-bz-pill", live ? "bg-bz-leaf-deep" : "bg-bz-line")} />
                {live ? `Live · v${state.publishedVersion}` : "Draft · never published"}
              </span>
              {live && (
                <>
                  <span className="text-bz-line">·</span>
                  <span className="tabular-nums">{state.responseCount} responses</span>
                </>
              )}
              {state.category && (
                <>
                  <span className="text-bz-line">·</span>
                  <span>{state.category}</span>
                </>
              )}
              {!state.name.trim() && (
                <MiniTag tone="warn" icon={AlertCircle}>
                  needs a name
                </MiniTag>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start">
          {state.mode === "questions" && (
            <div className="hidden sm:block">
              <AddQuestion
                variant="solid"
                onPick={(typeId) => dispatch({ kind: "ADD_QUESTION", typeId })}
              />
            </div>
          )}
          <button
            ref={kebabRef}
            onClick={() => setKebabOpen((v) => !v)}
            aria-label="More"
            className="flex size-9 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2.5">
        <ModeTabs mode={state.mode} counts={counts} onChange={(m) => dispatch({ kind: "SET_MODE", mode: m })} />
      </div>

      <Popover anchorRef={kebabRef} open={kebabOpen} onClose={() => setKebabOpen(false)} align="end" width={248}>
        <div className="py-1">
          <MenuItem
            icon={state.canManage ? Eye : Undo2}
            label={state.canManage ? "Look at it as a viewer" : "Back to editing"}
            onSelect={() => {
              dispatch({ kind: "SET_CAN_MANAGE", value: !state.canManage });
              setKebabOpen(false);
            }}
          />
          <MenuItem
            icon={Layers}
            label="Add a section"
            onSelect={() => {
              dispatch({ kind: "ADD_SECTION" });
              dispatch({ kind: "SET_MODE", mode: "questions" });
              setKebabOpen(false);
            }}
          />
          <div className="my-1 h-px bg-bz-line-soft" />
          <p className="px-3 pb-1.5 pt-1 text-[10.5px] leading-relaxed text-bz-text-soft">
            Viewers see the whole design but cannot save or publish it.
          </p>
        </div>
      </Popover>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LOADING
// ════════════════════════════════════════════════════════════════════════════

function LoadingCanvas() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-12 pt-5 md:px-6">
      <div className="flex items-center gap-2 text-[12px] text-bz-text-muted">
        <Loader2 size={13} className="animate-spin" /> Fetching this form…
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[104px] animate-pulse rounded-bz-lg border border-bz-line-soft bg-bz-surface"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
        <div className="hidden h-[420px] animate-pulse rounded-bz-lg border border-bz-line-soft bg-bz-paper lg:block" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RELATIVE TIME
// ════════════════════════════════════════════════════════════════════════════

function useRelative(ts: number | null) {
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    if (!ts) return;
    const id = window.setInterval(() => tick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, [ts]);
  if (!ts) return "never";
  const diff = Date.now() - ts;
  if (diff < 45_000) return "just now";
  const m = Math.round(diff / 60_000);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return `${Math.round(h / 24)} day${Math.round(h / 24) === 1 ? "" : "s"} ago`;
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════════

export function FormBuilderDesignPage() {
  const [state, rawDispatch] = React.useReducer(reducer, undefined, seedState);
  const focusOnAdd = React.useRef(false);
  const labelRef = React.useRef<HTMLInputElement | null>(null);
  const [publishOpen, setPublishOpen] = React.useState(false);

  const dispatch = React.useCallback((a: Action) => {
    if (a.kind === "ADD_QUESTION") focusOnAdd.current = true;
    rawDispatch(a);
  }, []);

  // initial retrieval of an existing design
  React.useEffect(() => {
    const t = window.setTimeout(() => rawDispatch({ kind: "HYDRATED" }), 900);
    return () => window.clearTimeout(t);
  }, []);

  // focus the wording of a question the moment it is created
  React.useEffect(() => {
    if (!focusOnAdd.current || !state.selectedId) return;
    focusOnAdd.current = false;
    const t = window.setTimeout(() => labelRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [state.selectedId]);

  // ── derived, live ─────────────────────────────────────────────────────────
  const questions = React.useMemo(() => allQuestions(state.sections), [state.sections]);
  const answerQuestions = React.useMemo(
    () => questions.filter((q) => holdsAnswer(q.typeId) && !q.withdrawn),
    [questions],
  );
  const filterCandidates = React.useMemo(
    () => answerQuestions.filter((q) => q.searchable && canBeSearchable(q.typeId)),
    [answerQuestions],
  );
  const leadMapped = React.useMemo(
    () =>
      Object.values(state.lead.map).filter((b) =>
        b.mode === "fixed" ? !!b.fixed?.trim() : !!b.question,
      ).length,
    [state.lead.map],
  );
  const behavioursOn = React.useMemo(
    () => Object.values(state.behaviours).filter(Boolean).length,
    [state.behaviours],
  );
  const counts = {
    questions: questions.length,
    table: state.columns.length,
    lead: state.lead.enabled ? leadMapped : null,
    settings: behavioursOn,
  };

  const selected = findQuestion(state.sections, state.selectedId);
  const savedRel = useRelative(state.savedAt);

  // ── commits ───────────────────────────────────────────────────────────────
  const commit = React.useCallback(
    async (intent: "draft" | "publish") => {
      if (state.committing || !state.canManage) return;
      rawDispatch({ kind: "COMMIT_START", intent });
      await new Promise((r) => window.setTimeout(r, 750));
      const problems = validate(state);
      if (problems.length) {
        rawDispatch({ kind: "COMMIT_REFUSED", problems });
        setPublishOpen(false);
        return;
      }
      rawDispatch({ kind: "COMMIT_DONE", intent });
      setPublishOpen(false);
    },
    [state],
  );

  // Cmd/Ctrl+S saves the draft
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        commit("draft");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [commit]);

  const jumpTo = React.useCallback((questionId: string) => {
    rawDispatch({ kind: "SET_MODE", mode: "questions" });
    rawDispatch({ kind: "SELECT", id: questionId });
    window.setTimeout(() => {
      document
        .querySelector(`[data-qid="${questionId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }, []);

  const drag = useDrag(state.sections, dispatch);

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Customize</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Form Builder</span>
        </>
      }
      overlay={
        <>
          {state.problems && state.problems.length > 0 && (
            <RefusalReport
              problems={state.problems}
              sections={state.sections}
              onJump={jumpTo}
              onDismiss={() => rawDispatch({ kind: "CLEAR_PROBLEMS" })}
            />
          )}
          <CommitBar
            state={state}
            savedRel={savedRel}
            onSaveDraft={() => commit("draft")}
            onPublish={() => setPublishOpen(true)}
            onLeave={() =>
              rawDispatch({
                kind: "TOAST",
                tone: "note",
                message: "Nothing was saved — this design is still exactly as you left it.",
              })
            }
          />
          <Toast toast={state.toast} onDismiss={() => rawDispatch({ kind: "DISMISS_TOAST" })} />
          <PublishSheet
            state={state}
            open={publishOpen}
            onClose={() => setPublishOpen(false)}
            onConfirm={() => commit("publish")}
          />
        </>
      }
    >
      <IdentityBand state={state} dispatch={dispatch} counts={counts} />

      {state.loading ? (
        <LoadingCanvas />
      ) : (
        <div className="px-4 pb-10 pt-5 md:px-6">
          {state.mode === "questions" ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_384px] xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="flex min-w-0 flex-col gap-6">
                {state.sections.length === 0 ? (
                  <div className="rounded-bz-lg border border-dashed border-bz-line bg-bz-surface/60 px-6 py-16 text-center">
                    <Layers size={18} className="mx-auto text-bz-text-muted" />
                    <p className="mt-2.5 text-[14px] font-semibold text-bz-text">
                      Start with your first question
                    </p>
                    <p className="mx-auto mt-1.5 max-w-[340px] text-[12px] leading-relaxed text-bz-text-muted">
                      Pick the kind of answer you need and we will make a section to hold it. Everything
                      else on this page has a sensible default.
                    </p>
                    <div className="mx-auto mt-4 max-w-[220px]">
                      <AddQuestion
                        variant="solid"
                        onPick={(typeId) => dispatch({ kind: "ADD_QUESTION", typeId })}
                      />
                    </div>
                  </div>
                ) : (
                  state.sections.map((sec, i) => (
                    <SectionBlock
                      key={sec.id}
                      section={sec}
                      index={i}
                      total={state.sections.length}
                      state={state}
                      dispatch={dispatch}
                      drag={drag}
                      labelRef={labelRef}
                    />
                  ))
                )}

                <button
                  onClick={() => dispatch({ kind: "ADD_SECTION" })}
                  className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-bz-md border border-bz-line-soft bg-bz-surface px-3 text-[12px] font-medium text-bz-text-muted hover:border-bz-text hover:text-bz-text"
                >
                  <Plus size={12} /> Add a section
                </button>
              </div>

              <aside className="hidden self-start overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper lg:sticky lg:top-[136px] lg:flex lg:max-h-[calc(100vh-16rem)] lg:flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {selected ? (
                    <Inspector
                      question={selected}
                      state={state}
                      dispatch={dispatch}
                      labelRef={undefined}
                    />
                  ) : (
                    <InspectorEmpty count={questions.length} />
                  )}
                </div>
              </aside>
            </div>
          ) : state.mode === "table" ? (
            <TableMode
              state={state}
              dispatch={dispatch}
              answerQuestions={answerQuestions}
              filterCandidates={filterCandidates}
            />
          ) : state.mode === "lead" ? (
            <LeadMode state={state} dispatch={dispatch} answerQuestions={answerQuestions} />
          ) : (
            <SettingsMode state={state} dispatch={dispatch} />
          )}
        </div>
      )}

      {/* below lg the primary act follows you down the page */}
      {!state.loading && state.mode === "questions" && (
        <div className="fixed bottom-[72px] right-4 z-30 sm:hidden">
          <AddQuestion variant="solid" onPick={(typeId) => dispatch({ kind: "ADD_QUESTION", typeId })} />
        </div>
      )}
    </AppShell>
  );
}
