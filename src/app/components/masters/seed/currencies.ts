import { createStore } from "../../sales/store";

// ════════════════════════════════════════════════════════════════════════════
// CURRENCIES — the masters hub's currency seed (spec §4, §9.2; SMM §1)
//
// Shaped like the dev tenant of org 186, read 2026-09-25:
//   • 154 currencies. 152 are the world list the onboarding copies in; the
//     base of 186 is row 28146 whose SHORTCUT (and SYMBOL) is the name
//     "Nepalese Rupee" — not a code — and the world list's own NPR row 28238
//     sits beside it unused. That is the "Code to fix" state, on purpose.
//   • Subsidiaries: 186 "yejagoj" (base 28146) and 194 "Pokhara Branch"
//     (base HTG 28201). The base lives on the MAP row, one per subsidiary —
//     never on the currency (CURRENCY_MAP_ORGANISATION.IS_BASE_CURRENCY).
//   • ZZQ 42087 "ZZ-CLAUDE QA Dollar II" → Nepalese Rupee 131, dated 23 Sep
//     (the tenant's one real rate). USD's three dated rows are spec §9.2's.
//
// Mock additions beyond dev (each one exists to show a state the acceptance
// list needs, and every field is a real column or a §8 endpoint):
//   • usage counts (B-C3), rate `used` counts (B-C2), posted-document counts
//     (B-C1's refusal) — the server reads a redesign needs;
//   • EUR in use with a rate dated 11 Sep, so "Rate older than 7 days" and
//     the amber As of have a row to show;
//   • symbols "$" (USD) and "₹" (INR), as the spec draws them.
//
// Rates are ROWS, one per currency pair per date, tenant-wide (D-3). A
// document takes the row effective on ITS date (D-1): the newest DATE ≤ the
// document date, ties broken by CREATED_DATE — `rateEffectiveOn` below.
// ════════════════════════════════════════════════════════════════════════════

/** The mockup's clock for every master (the agreed "today"). */
export const MASTERS_TODAY = "2026-09-25";
/** Who the mockup is signed in as — "By" on a rate row. */
export const MASTERS_ME = "Arun";

export type MasterSubsidiary = {
  /** ORGANISATION.ID on dev. */
  id: string;
  name: string;
  /** The sales mockup's subsidiary for the same organisation (`sales/master.tsx`), so a document's org resolves here. */
  salesId: string;
  /** Approved, not-cancelled documents that wrote ACCOUNT_TRANSACTION rows in this org — B-C1 refuses a base change when > 0 (D-4). */
  posted: number;
};

export const MASTER_SUBSIDIARIES: MasterSubsidiary[] = [
  { id: "186", name: "yejagoj", salesId: "NP-01", posted: 1284 },
  { id: "194", name: "Pokhara Branch", salesId: "NP-02", posted: 0 },
];
export const subsidiaryName = (id: string) => MASTER_SUBSIDIARIES.find((s) => s.id === id)?.name ?? id;
/** The masters org for a sales-mockup subsidiary id (NP-01 → 186). */
export const orgOfSales = (salesId: string) => MASTER_SUBSIDIARIES.find((s) => s.salesId === salesId)?.id ?? MASTER_SUBSIDIARIES[0].id;

/** One `FindMasterReferences` label and its count (B-C3). */
export type UsageRow = { label: string; count: number };

export type Currency = {
  /** MAST_CURRENCY_SETUP.ID */
  id: string;
  /** NAME */
  name: string;
  /** SHORTCUT — the only "code" there is (no ISO column). */
  shortcut: string;
  /** SYMBOL */
  symbol: string | null;
  /** SYMBOL_PLACEMENT (before = 0 / after = 1). */
  placement: "before" | "after";
  /** IS_INACTIVE — "archived" in the design's words. */
  archived: boolean;
  /** CURRENCY_MAP_ORGANISATION membership. */
  orgs: string[];
  /** APPLY_TO_CHILD */
  applyToChild: boolean;
  /** B-C3: what references it, by table label. Documents and masters both count. */
  usage: UsageRow[];
  /** The subsidiaries whose documents use it — "foreign to a subsidiary where it is used" (the No rate figure). */
  usedIn: string[];
};

export type ExchangeRate = {
  /** CURRENCY_EXCHANGE_RATE.ID */
  id: string;
  /** AFFECTOR_CURRENCY_ID — the foreign one ("1 USD = …"). */
  from: string;
  /** AFFECTEE_CURRENCY_ID — the base it is against. */
  to: string;
  /** DATE — the effective date (never CREATED_DATE). */
  date: string;
  /** RATE: 1 affector = RATE affectee. */
  rate: number;
  /** SOURCE — new column (B-C2). Manual / Import in v1 (D-2). */
  source: "Manual" | "Import";
  /** CREATED_BY, as a name. */
  by: string;
  /** CREATED_DATE — only a tie-breaker (D-1). */
  created: string;
  /** Documents that took this row (B-C2 `used_count`). Used > 0 → locked. */
  used: number;
};

export type CurrencyState = {
  currencies: Currency[];
  /** org id → base currency id (the map row flagged IS_BASE_CURRENCY). */
  base: Record<string, string>;
  rates: ExchangeRate[];
};

// ── The world list (CountrySeedServiceImpl) — 152 rows, NPR included ────────
// [code, name]; ids follow the dev range, with the rows the spec names pinned.
const WORLD: [string, string][] = [
  ["AED", "UAE Dirham"], ["AFN", "Afghan Afghani"], ["ALL", "Albanian Lek"], ["AMD", "Armenian Dram"], ["ANG", "Netherlands Antillean Guilder"],
  ["AOA", "Angolan Kwanza"], ["ARS", "Argentine Peso"], ["AUD", "Australian Dollar"], ["AWG", "Aruban Florin"], ["AZN", "Azerbaijani Manat"],
  ["BAM", "Bosnia-Herzegovina Mark"], ["BBD", "Barbadian Dollar"], ["BDT", "Bangladeshi Taka"], ["BGN", "Bulgarian Lev"], ["BHD", "Bahraini Dinar"],
  ["BIF", "Burundian Franc"], ["BMD", "Bermudian Dollar"], ["BND", "Brunei Dollar"], ["BOB", "Bolivian Boliviano"], ["BRL", "Brazilian Real"],
  ["BSD", "Bahamian Dollar"], ["BTN", "Bhutanese Ngultrum"], ["BWP", "Botswana Pula"], ["BYN", "Belarusian Ruble"], ["BZD", "Belize Dollar"],
  ["CAD", "Canadian Dollar"], ["CDF", "Congolese Franc"], ["CHF", "Swiss Franc"], ["CLP", "Chilean Peso"], ["CNY", "Chinese Yuan"],
  ["COP", "Colombian Peso"], ["CRC", "Costa Rican Colón"], ["CUP", "Cuban Peso"], ["CVE", "Cape Verdean Escudo"], ["CZK", "Czech Koruna"],
  ["DJF", "Djiboutian Franc"], ["DKK", "Danish Krone"], ["DOP", "Dominican Peso"], ["DZD", "Algerian Dinar"], ["EGP", "Egyptian Pound"],
  ["ERN", "Eritrean Nakfa"], ["ETB", "Ethiopian Birr"], ["EUR", "Euro"], ["FJD", "Fijian Dollar"], ["FKP", "Falkland Islands Pound"],
  ["GBP", "British Pound"], ["GEL", "Georgian Lari"], ["GHS", "Ghanaian Cedi"], ["GIP", "Gibraltar Pound"], ["GMD", "Gambian Dalasi"],
  ["GNF", "Guinean Franc"], ["GTQ", "Guatemalan Quetzal"], ["GYD", "Guyanese Dollar"], ["HKD", "Hong Kong Dollar"], ["HNL", "Honduran Lempira"],
  ["HTG", "Haitian Gourde"], ["HUF", "Hungarian Forint"], ["IDR", "Indonesian Rupiah"], ["ILS", "Israeli New Shekel"], ["INR", "Indian Rupee"],
  ["IQD", "Iraqi Dinar"], ["IRR", "Iranian Rial"], ["ISK", "Icelandic Króna"], ["JMD", "Jamaican Dollar"], ["JOD", "Jordanian Dinar"],
  ["JPY", "Japanese Yen"], ["KES", "Kenyan Shilling"], ["KGS", "Kyrgyzstani Som"], ["KHR", "Cambodian Riel"], ["KMF", "Comorian Franc"],
  ["KRW", "South Korean Won"], ["KWD", "Kuwaiti Dinar"], ["KYD", "Cayman Islands Dollar"], ["KZT", "Kazakhstani Tenge"], ["LAK", "Lao Kip"],
  ["LBP", "Lebanese Pound"], ["LKR", "Sri Lankan Rupee"], ["LRD", "Liberian Dollar"], ["LSL", "Lesotho Loti"], ["LYD", "Libyan Dinar"],
  ["MAD", "Moroccan Dirham"], ["MDL", "Moldovan Leu"], ["MGA", "Malagasy Ariary"], ["MKD", "Macedonian Denar"], ["MMK", "Myanmar Kyat"],
  ["MNT", "Mongolian Tögrög"], ["MOP", "Macanese Pataca"], ["MRU", "Mauritanian Ouguiya"], ["MUR", "Mauritian Rupee"], ["MVR", "Maldivian Rufiyaa"],
  ["MWK", "Malawian Kwacha"], ["MXN", "Mexican Peso"], ["MYR", "Malaysian Ringgit"], ["MZN", "Mozambican Metical"], ["NAD", "Namibian Dollar"],
  ["NGN", "Nigerian Naira"], ["NIO", "Nicaraguan Córdoba"], ["NOK", "Norwegian Krone"], ["NPR", "Nepalese Rupee"], ["NZD", "New Zealand Dollar"],
  ["OMR", "Omani Rial"], ["PAB", "Panamanian Balboa"], ["PEN", "Peruvian Sol"], ["PGK", "Papua New Guinean Kina"], ["PHP", "Philippine Peso"],
  ["PKR", "Pakistani Rupee"], ["PLN", "Polish Złoty"], ["PYG", "Paraguayan Guaraní"], ["QAR", "Qatari Riyal"], ["RON", "Romanian Leu"],
  ["RSD", "Serbian Dinar"], ["RUB", "Russian Ruble"], ["RWF", "Rwandan Franc"], ["SAR", "Saudi Riyal"], ["SBD", "Solomon Islands Dollar"],
  ["SCR", "Seychellois Rupee"], ["SDG", "Sudanese Pound"], ["SEK", "Swedish Krona"], ["SGD", "Singapore Dollar"], ["SHP", "Saint Helena Pound"],
  ["SLE", "Sierra Leonean Leone"], ["SOS", "Somali Shilling"], ["SRD", "Surinamese Dollar"], ["SSP", "South Sudanese Pound"], ["STN", "São Tomé and Príncipe Dobra"],
  ["SYP", "Syrian Pound"], ["SZL", "Swazi Lilangeni"], ["THB", "Thai Baht"], ["TJS", "Tajikistani Somoni"], ["TMT", "Turkmenistani Manat"],
  ["TND", "Tunisian Dinar"], ["TOP", "Tongan Paʻanga"], ["TRY", "Turkish Lira"], ["TTD", "Trinidad and Tobago Dollar"], ["TWD", "New Taiwan Dollar"],
  ["TZS", "Tanzanian Shilling"], ["UAH", "Ukrainian Hryvnia"], ["UGX", "Ugandan Shilling"], ["USD", "US Dollar"], ["UYU", "Uruguayan Peso"],
  ["UZS", "Uzbekistani Som"], ["VES", "Venezuelan Bolívar"], ["VND", "Vietnamese Đồng"], ["VUV", "Vanuatu Vatu"], ["WST", "Samoan Tālā"],
  ["XAF", "Central African CFA Franc"], ["XCD", "East Caribbean Dollar"], ["XOF", "West African CFA Franc"], ["YER", "Yemeni Rial"], ["ZAR", "South African Rand"],
  ["ZMW", "Zambian Kwacha"], ["ZWL", "Zimbabwean Dollar"],
];

/** Dev ids the spec names (SMM §1.5, spec §0). */
const PINNED: Record<string, string> = { HTG: "28201", INR: "28206", NPR: "28238", USD: "28290", EUR: "28183" };

export const NR_BASE_ID = "28146"; // "Nepalese Rupee" — base of 186, code not code-shaped
export const NPR_ID = "28238"; // the world list's NPR row, unused
export const HTG_ID = "28201";
export const USD_ID = "28290";
export const INR_ID = "28206";
export const EUR_ID = "28183";
export const ZZQ_ID = "42087";

function seedCurrencies(): Currency[] {
  const taken = new Set(Object.values(PINNED));
  let next = 28147;
  const world: Currency[] = WORLD.map(([code, name]) => {
    let id = PINNED[code];
    if (!id) {
      while (taken.has(String(next))) next++;
      id = String(next++);
    }
    return { id, name, shortcut: code, symbol: null, placement: "before", archived: false, orgs: ["186"], applyToChild: false, usage: [], usedIn: [] };
  });
  const patch = (id: string, p: Partial<Currency>) => {
    const i = world.findIndex((c) => c.id === id);
    world[i] = { ...world[i], ...p };
  };
  // HTG: base of Pokhara Branch, and (as on dev) mapped to both subsidiaries.
  patch(HTG_ID, { orgs: ["186", "194"], usedIn: ["194"], usage: [{ label: "Sales orders", count: 4 }, { label: "Estimates", count: 3 }, { label: "Customers", count: 2 }] });
  patch(USD_ID, {
    symbol: "$",
    usedIn: ["186"],
    usage: [{ label: "Invoices", count: 22 }, { label: "Receipts", count: 11 }, { label: "Sales orders", count: 8 }, { label: "Customers", count: 4 }, { label: "Bank accounts", count: 1 }],
  });
  patch(INR_ID, { symbol: "₹", usedIn: ["186"], usage: [{ label: "Estimates", count: 2 }] });
  patch(EUR_ID, { usedIn: ["186"], usage: [{ label: "Invoices", count: 3 }, { label: "Customers", count: 1 }] });

  const base: Currency = {
    id: NR_BASE_ID,
    name: "Nepalese Rupee",
    shortcut: "Nepalese Rupee",
    symbol: "Nepalese Rupee",
    placement: "before",
    archived: false,
    orgs: ["186"],
    applyToChild: false,
    usedIn: ["186"],
    usage: [{ label: "Invoices", count: 96 }, { label: "Receipts", count: 58 }, { label: "Sales orders", count: 31 }, { label: "Journal vouchers", count: 17 }, { label: "Customers", count: 7 }, { label: "Bank accounts", count: 3 }],
  };
  const zzq: Currency = {
    id: ZZQ_ID,
    name: "ZZ-CLAUDE QA Dollar II",
    shortcut: "ZZQ",
    symbol: null,
    placement: "before",
    archived: false,
    orgs: ["186"],
    applyToChild: false,
    usedIn: ["186"],
    usage: [{ label: "Sales orders", count: 2 }, { label: "Invoices", count: 1 }],
  };
  return [base, ...world, zzq];
}

const R = (id: string, from: string, date: string, rate: number, used: number, by: string, source: ExchangeRate["source"] = "Manual"): ExchangeRate => ({
  id,
  from,
  to: NR_BASE_ID,
  date,
  rate,
  source,
  by,
  created: `${date}T10:00:00`,
  used,
});

const SEED: CurrencyState = {
  currencies: seedCurrencies(),
  base: { "186": NR_BASE_ID, "194": HTG_ID },
  rates: [
    R("r-usd-0925", USD_ID, "2026-09-25", 134.1, 0, "Arun"),
    R("r-usd-0923", USD_ID, "2026-09-23", 133.42, 12, "Arun"),
    R("r-usd-0901", USD_ID, "2026-09-01", 132.8, 29, "Yepa"),
    R("r-usd-0815", USD_ID, "2026-08-15", 132.35, 0, "Yepa", "Import"),
    R("r-usd-0801", USD_ID, "2026-08-01", 131.9, 0, "Yepa", "Import"),
    R("r-zzq-0923", ZZQ_ID, "2026-09-23", 131, 3, "Yepa"),
    R("r-eur-0911", EUR_ID, "2026-09-11", 148.2, 3, "Yepa"),
  ],
};

export const currencyStore = createStore<CurrencyState>(SEED);

let rateSeq = 0;
export const newRateId = () => `r-new-${++rateSeq}`;

// ── Rules ───────────────────────────────────────────────────────────────────

/** `CurrencyCode`: a SHORTCUT is a code when it reads as one (trimmed, 2–5 letters). */
export const CODE_SHAPE = /^[A-Za-z]{2,5}$/;
export const isCodeShaped = (s: string | null | undefined) => !!s && CODE_SHAPE.test(s.trim());

/**
 * `CurrencyLabel` (document-module §4): the code-shaped SHORTCUT, else a SHORT symbol (≤ 4, not the
 * name), else no label. A money figure uses this and nothing else.
 */
export function currencyLabel(c: Pick<Currency, "shortcut" | "symbol" | "name"> | undefined | null): string | null {
  if (!c) return null;
  if (isCodeShaped(c.shortcut)) return c.shortcut.trim().toUpperCase();
  const s = c.symbol?.trim();
  if (s && s.length <= 4 && s.toLowerCase() !== c.name.trim().toLowerCase()) return s;
  return null;
}

/**
 * The words a RATE's direction is spelled in ("1 USD = 133.42 NPR"). A base with no label (dev 186:
 * "Nepalese Rupee") is spelled by its name — a code would be invented, and "1 USD = 133.42" alone says
 * nothing about what it is against. Fixing the code turns it into "NPR" everywhere.
 */
export const rateUnit = (c: Currency | undefined | null) => currencyLabel(c) ?? c?.name ?? "—";

export const totalUsage = (c: Currency) => c.usage.reduce((s, u) => s + u.count, 0);
export const baseOfOrg = (st: CurrencyState, org: string) => st.currencies.find((c) => c.id === st.base[org]);
/** The subsidiaries a currency is the base of. */
export const baseOrgsOf = (st: CurrencyState, id: string) => Object.entries(st.base).filter(([, cid]) => cid === id).map(([org]) => org);
export const isInUse = (st: CurrencyState, c: Currency) => totalUsage(c) > 0 || baseOrgsOf(st, c.id).length > 0;

/** Newest first; one pair. */
export const ratesOf = (st: CurrencyState, from: string, to: string) =>
  st.rates.filter((r) => r.from === from && r.to === to).sort((a, b) => (a.date === b.date ? (a.created < b.created ? 1 : -1) : a.date < b.date ? 1 : -1));
export const latestRate = (st: CurrencyState, from: string, to: string) => ratesOf(st, from, to)[0] ?? null;

/**
 * D-1: the rate a document dated `date` takes — the newest row with DATE ≤ the document date, ties
 * broken by CREATED_DATE. None → null (the document's rate is blank and required).
 */
export function rateEffectiveOn(st: CurrencyState, from: string, to: string, date: string): ExchangeRate | null {
  return ratesOf(st, from, to).find((r) => r.date <= date) ?? null;
}

/**
 * The bases a currency is FOREIGN to where it matters: the bases of the subsidiaries that use it (or,
 * for one nothing uses, of the subsidiaries it is a member of), minus the ones it is the base of.
 */
export function foreignBases(st: CurrencyState, c: Currency): string[] {
  const orgs = c.usedIn.length ? c.usedIn : c.orgs;
  const out: string[] = [];
  for (const org of orgs) {
    const b = st.base[org];
    if (b && b !== c.id && !out.includes(b)) out.push(b);
  }
  return out;
}

/** In use, foreign to a subsidiary where it is used, and no rate against that base. */
export const hasNoRate = (st: CurrencyState, c: Currency) =>
  !c.archived && totalUsage(c) > 0 && c.usedIn.some((org) => st.base[org] && st.base[org] !== c.id && !latestRate(st, c.id, st.base[org]));

export const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
/** Spec §10.1 #17: a week-old rate is stale. */
export const STALE_DAYS = 7;
export const isStale = (st: CurrencyState, c: Currency, today: string) =>
  !c.archived && isInUse(st, c) && foreignBases(st, c).some((b) => {
    const r = latestRate(st, c.id, b);
    return !!r && daysBetween(r.date, today) > STALE_DAYS;
  });

/** "today" / "2d ago" — the As of column. */
export function ago(date: string, today: string) {
  const d = daysBetween(date, today);
  if (d <= 0) return "today";
  return `${d}d ago`;
}
