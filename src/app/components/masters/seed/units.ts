import { createStore } from "../../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// UNITS — tier 3, edited in the row (spec §4.5 Unit; SMM §2)
//
// UNIT → MAST_UNIT_SETUP: CODE (≤ 20, required), UNIT_NAME (required),
// IS_INACTIVE, + the subsidiaries map. Nothing else: conversions live on the
// ITEM (ITEM_UNIT_CONVERSION_RATE_MAP), so "Converted on" is a count of items
// read from there, and a unit carries no factor of its own.
//
// Rows: the dev tenant's 16, named after the ones the items and the sales
// mockup quote — Piece / Box / ZZ-CLAUDE-QA-Carton (the item master's dev
// items) and the sales ITEMS codes (pcs, pkg, hrs, ctn, bag, len, kit, pkt,
// bundle, ton) — plus one archived row.
//
// `used` splits the two readers B-C3 counts: items whose BASE unit it is
// (STANDARD_UNIT_ID — the only column today's delete check reads) and
// document lines in it (UNIT_ID — the one it misses).
// ════════════════════════════════════════════════════════════════════════════

export type Unit = {
  /** MAST_UNIT_SETUP.ID */
  id: string;
  /** CODE — ≤ 20; the server refuses a duplicate. */
  code: string;
  /** UNIT_NAME */
  name: string;
  /** IS_INACTIVE */
  archived: boolean;
  /** UNIT_MAP_ORGANISATION */
  orgs: string[];
  /** Items with a conversion row using this unit (ITEM_UNIT_CONVERSION_RATE_MAP.POSSIBLE_UNIT_ID). */
  convertedOn: number;
  /** Items whose base unit it is (STANDARD_UNIT_ID). */
  baseOf: number;
  /** Document lines in it (UNIT_ID, ~60 tables). */
  lines: number;
};

const U = (id: string, code: string, name: string, baseOf: number, lines: number, convertedOn = 0, archived = false): Unit => ({
  id,
  code,
  name,
  archived,
  orgs: ["186", "194"],
  convertedOn,
  baseOf,
  lines,
});

export const UNIT_SEED: Unit[] = [
  U("u-piece", "PC", "Piece", 6, 188),
  U("u-box", "BOX", "Box", 3, 41, 2),
  U("u-carton-qa", "ZZ-QA-CTN", "ZZ-CLAUDE-QA-Carton", 0, 3, 1),
  U("u-pcs", "pcs", "Pieces", 5, 212),
  U("u-pkg", "pkg", "Package", 1, 36),
  U("u-hrs", "hrs", "Hours", 1, 9),
  U("u-ctn", "ctn", "Carton", 1, 64),
  U("u-bag", "bag", "Bag", 3, 118),
  U("u-len", "len", "Length", 1, 22),
  U("u-kit", "kit", "Kit", 1, 7),
  U("u-pkt", "pkt", "Packet", 0, 14, 1),
  U("u-bundle", "bundle", "Bundle", 0, 2, 1),
  U("u-ton", "ton", "Tonne", 0, 5, 1),
  U("u-kg", "KG", "Kg", 0, 0),
  U("u-dzn", "DZN", "Dozen", 0, 0),
  U("u-ltr", "LTR", "Litre", 0, 0),
  U("u-ream", "REAM", "Ream", 0, 0, 0, true),
];

export const unitStore = createStore<Unit[]>(UNIT_SEED);
export const unitUsed = (u: Unit) => u.baseOf + u.lines;

let seq = 0;
export const newUnitId = () => `u-new-${++seq}`;

/**
 * The sentence B-C8 has the unit save return for a duplicate CODE. Today's server answers
 * `ResponseMessageConstants.Dublicate` ("This record already exits in the system" — misspelt, and it
 * names neither the code nor the unit holding it); the mockup shows the sentence the design needs,
 * which the UI then shows verbatim (design review §16).
 */
export const unitDuplicate = (code: string, holder: string) => `Code ${code.trim()} is already used by ${holder}.`;
