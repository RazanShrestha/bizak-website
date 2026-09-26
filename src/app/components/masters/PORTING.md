# Masters — porting checklist

Spec: `bizak-app/docs/masters-redesign/MASTERS-DESIGN-SPEC.md` §9.4. One section per work package.

## WP0 · the kit (`masters/kit/`, bench at `/design/masters/kit`, alias `/_kit`)

### New atoms → `_bzw-*.scss` + a BZW-ATOMS section each

| Website export | Angular target | Partial |
|---|---|---|
| `Grid`, `useStagedRows` (`kit/Grid.tsx`) | `<bzw-grid>` `.bzw-grid` (`__head __row __cell __input __sel __act __err __group __foot`; `.is-ghost .is-dirty .is-invalid .is-locked .is-selected .is-removed`; tracks from `--bzw-grid-cols`) | `_bzw-surfaces.scss` |
| `RecordPage`, `RecordSection`, `RelatedBlock`, `Facts`, `PageField`, `goToField` | `<bzw-record-page>` `.bzw-recpage` (`__head __sticky __facts __body __section __sectionhead __related __band`) | `_bzw-pages.scss` |
| `SectionNav` | `<bzw-section-nav>` `.bzw-secnav` (`__item.is-current`, `__mark--error/--setup/--count/--empty/--lock`) | `_bzw-pages.scss` |
| `SaveDock`, `useUnsavedGuard` | `<bzw-save-dock>` `.bzw-savedock` + `BzwUnsavedGuard` (CanDeactivate + beforeunload) | `_bzw-surfaces.scss` |
| `InlineField` | `<bzw-inline-field>` `.bzw-inline` (`.is-editing .is-saving .is-saved .is-refused`) | `_bzw-controls.scss` |
| `MasterSheet`, `SheetContext` | `<bzw-master-sheet>` `.bzw-msheet` on `.bzw-drawer--peek` (10 % dim, pointer passes through) | `_bzw-surfaces.scss` |
| `MastersHub`, `MasterTable`, `MasterKindConfig`, `usageBands` | `<bzw-masters-hub>` `.bzw-hub` + `<bzw-master-table>` | `_bzw-pages.scss` |
| `Lock`, `Source`, `Usage`, `CopyText`, `LineOffer` | `<bzw-lock>`, `<bzw-source>`, `<bzw-usage>`, `<bzw-copy>`, `<bzw-line-offer>` | `_bzw-marks.scss` |
| `Failed`, `Retry` | already in the app: `.bzw-failed(--compact)`, `.bzw-retry` — ported here, not new | — |
| `RatePop`, `DatedRates`, `useDatedRates`, `DateField` | `<bzw-rate-pop>`; the Rates block is `<bzw-grid>` staged; `DateField` = a `.bzw-input` date with `t` / ↑ ↓ | `_bzw-surfaces.scss` |
| `AskFirst` | `<bzw-ask-first>` | `_bzw-surfaces.scss` |
| `AmountPop` | one-amount popover (bulk / group "Set price") — not named in §6.3; see "Kit as built" | `_bzw-surfaces.scss` |

### Shared-file edits (additive; name them in the commit)

- `sales/bzw.tsx` — `Checkbox.tabIndex`; `Select.tabIndex` + `Select.onClose`; `Field.label` takes a node; `SkeletonRows.text`; `Dialog` leaves Escape to an editor (`[data-bzw-editing]`) or an open menu; `Popover` marks itself `data-bzw-popover`, only the topmost answers Esc, a scroll inside any open panel is not "outside".
- `sales/DocDesk.tsx` — `numberLabel`, `amountLabel`, `showPeriod`, `rail`; `dateOf` optional; loading line says `Loading <noun>…`.
- `sales/AppFrame.tsx` — rail `Inventory` → `/design/masters/items`; the Settings glyph links to `/design/masters/currencies`.
- `sales/FulfilSheet.tsx` — `SheetFrame.onCommit(e)` receives the key event (⇧⌘↵ vs ⌘↵).
- `routes.tsx` — `design/masters/kit` and `design/masters/_kit`.

Angular twins of these: `<bzw-doc-desk>` `numberLabel/amountLabel/showPeriod`; `<bzw-select>` needs a `tabIndex` input and a closed output for grid cells; `.bzw-dialog-host` Escape must yield to `[data-bzw-editing]`.

### Lucide icons used by the kit

`ArrowUpRight` (the ↗ door — already carried as `arrow-up-right`), `CalendarDays`, `Check`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `Copy`, `Loader2`, `Lock`, `MoreHorizontal`, `Pencil`, `Plus`, `RotateCcw`, `SearchX`, `TriangleAlert` (= `alert-triangle`), `X`.
Not yet in `BzwIconName` (BZW-ATOMS §2's list): `calendar-days`, `chevron-left`, `copy` (the last is in spec §6.3's list). Already carried: `arrow-up-right`, `check`, `chevron-down`, `chevron-right`, `loader-2`, `lock`, `more-horizontal`, `pencil`, `plus`, `rotate-ccw`, `search-x`, `alert-triangle`, `x`. The bench page also uses `boxes`, `package`, `receipt`, `shopping-cart`.

### Invented data

None in the kit components. The bench page's seed rows echo spec §0 / §9.2 and exist only to show states.

## WP2 · the masters hub (`masters/hub/`, `/design/masters[/:kind[/:no]]`)

Files: `hub/MastersHubPage.tsx` (route, one component for every URL) · `hub/shared.tsx` (HubCtx, read states,
subsidiary chips, used-by list, delete dialog) · `hub/kinds/{currency,unit,tax,department,location}.tsx`
(configs + the tax / location sheets) · `hub/CurrencySheet.tsx` · `hub/BaseStrip.tsx` · `hub/FixCodeDialog.tsx`
· `hub/UpdateRatesDialog.tsx` · `hub/currencyActions.ts` (every write and every refusal sentence of §8.2) ·
seeds `seed/{currencies,units,taxes,departments,locations}.ts`.

Mockup switches (per kind, in the URL): `?slow=1` first read · `?fail=1` failed read + Retry · `?empty=1` none yet
· `?perm=read` view only · `?perm=none` no access (the kind leaves the list). `?q=` / `?pick=` are live.

### Kit extensions made here (additive)

| Piece | Change | Angular twin |
|---|---|---|
| `Grid` | `tree` (depth indent + caret in the first column; → / ← open / fold); an add row now appears when `ghost` arrives after the first render | `<bzw-grid>` `[tree]`, `.bzw-grid__caret`, `--bzw-grid-indent` |
| `MastersHub` | `query`/`onQuery` (URL-held `?q=` `?pick=`); config `filters` (desk `FilterOption`s → Filter select + chips + Clear all), `tree`, `minWidth`, `readOnly`, `denied`, `usageNoun`; statline and tools hidden while the read loads / failed; the band holding the open row is never folded; `MasterTable` keyed per kind | `<bzw-masters-hub>` inputs of the same names |
| `Usage` | a count with no list to open is a plain line in the popover, not a disabled button | `<bzw-usage>` |
| `DatedRates` | `readOnly` (view-only sheet) | `<bzw-grid>` readonly |
| `RatePop` | a long "to" label (a base named, not coded) truncates inside the popover | — |
| `sales/parts.tsx` `Section` | the title never wraps (`shrink-0 whitespace-nowrap`) — a long summary had pushed "Used by" onto two lines | `.bzw-section__toggle h3` |

### Fields → columns / endpoints

| Surface | Field | Backed by |
|---|---|---|
| Currency table | Code · Name · Symbol · Latest rate · As of · Used by | `SHORTCUT` · `NAME` · `SYMBOL` (+`SYMBOL_PLACEMENT` in the title) · B-C2 newest dated row per foreign base · that row's `DATE` · B-C3 |
| Currency statline | In use · Base · No rate · Rate older than 7 days · Code to fix · Archived | B-C10 `counts` (mock computes them from the seed) |
| Base strip | subsidiary → base; Change… | `api/currency/base?organisation_id=` ✔ · B-C1 `PUT api/currency/base` (refusal names the posted count, D-4) |
| Fix code | code; "Archive it and use NPR" | B-C4 archive of the other row + B-C5 PATCH `SHORTCUT` (B-C6 skips archived rows in the duplicate check) |
| Rate popover / Update today's rates | dated rate, inverse, % change | B-C2 `POST …/rates` (one or many); same-date unused row updated, used row refused |
| Currency sheet | Code*, Name*, Symbol, Placement, Rates (per base), Subsidiaries (+ Apply to child), Used by, Custom fields (formType 58) | `SHORTCUT`, `NAME`, `SYMBOL`, `SYMBOL_PLACEMENT`, B-C2, `CURRENCY_MAP_ORGANISATION` delta (B-C5), `APPLY_TO_CHILD`, B-C3, custom fields ✔ |
| Unit table | Code*, Name*, Converted on, Used by | `CODE` (≤ 20), `UNIT_NAME`, count of `ITEM_UNIT_CONVERSION_RATE_MAP.POSSIBLE_UNIT_ID`, B-C3 over `STANDARD_UNIT_ID` + `UNIT_ID` |
| Tax table / sheet | Code, Rate, Sales / Purchase tax account, the six flags, Description, Subsidiaries, Used by, Custom fields (60) | `NAME`, `RATE`, `LIABILITY_ACCOUNT_ID`, `ASSETS_ACCOUNT_ID`, `REVERSE_CHARGE`…`EXCLUDE_FROM_VAT_REPORTS`, `DESCRIPTION`, `TAX_MAP_ORGANISATION`, B-C3 |
| Department table | Name*, Parent, Description, Used by | `DEPARTMENT_NAME`, `PARENT_ID`, `DESCRIPTION`, B-C3 |
| Location table / sheet | Name*, Type, Address*, Parent, Description; More: prefixes, capacities, threshold, fiscal year, lat/long; "Holds stock of N items" | `LOCATION_NAME` (≤ 100), `LOCATION_TYPE`, `ADDRESS`, `PARENT_ID`, `DESCRIPTION`, `DOCUMENT_/TRANSACTION_NUMBER_PREFIX`, `MIN_/MAX_STORAGE_CAPACITY`, `THRESSHOLD`, `FISCAL_YEAR`, `LATITUDE`/`LONGITUDE`; the availability read |

Not shown on purpose: `EXCHANGE_RATE` (dead), `IS_BASE_CURRENCY` on the currency row (home flag), `FOR_BUYING`/`FOR_SELLING`
(no reader), `EFFECTIVE_FROM`/`VALID_TILL` (phantom), `IS_INVENTORY_AVAILABLE`/`USE_BINS` (no reader).

### Refusal sentences (the port finds them in `currencyActions.ts` and the kinds)

Server today, verbatim: "Currency with same short_cut already exists." · "This record already exits in the system" (unit
CODE) · "A department can't be moved under one of its own sub-departments." New (B-C1/B-C2/B-C6/B-C8): "yejagoj has
1,284 posted documents, so its base can't change." · "The rate for 23 Sep is used by 12 documents, so it can't change." ·
"Use a 2–5 letter code, like USD." · "NPR is used by another currency that nothing uses. Archive it and use NPR here?" ·
"USD is used by another currency on 41 documents." · "It is the base of yejagoj." · "vat 13 is already a tax code." ·
"A location can't sit under itself or one of its own sub-locations."

### Lucide icons

`RefreshCw` (refresh-cw ✔), `TriangleAlert` (alert-triangle ✔), `Plus` ✔, `X` ✔, `Lock` ✔, `ChevronDown`/`ChevronRight` ✔
(tree caret), `SearchX` ✔, `ArrowUpRight` ✔, `MoreHorizontal` ✔, `SlidersHorizontal` (the desk's Filter glyph — check
`BzwIconName` has `sliders-horizontal`; the desks already draw it).

### Invented data (mock only; each is a §8 read)

Usage counts (B-C3), rate `used` counts (B-C2), posted-document counts per subsidiary (B-C1), `itemsInStock` per
location (availability read), EUR in use with a rate dated 11 Sep (to show "Rate older than 7 days"), symbols `$` / `₹`
(as the spec draws them; dev has one symbol), tax rows "Service VAT 13", "Reverse charge 13", "VAT 10 (old)", the archived location "Old Thamel shop", and the department
names past the spec's examples — to fill the row counts dev has (12 taxes, 11 departments).

## WP1 · items (`masters/items/`, `masters/seed/items.ts`; routes `/design/masters/items[/new|/:id|/:id/page]`)

### Files

`items/ItemsDesk.tsx` (DocDesk host: views, picks, filters, sort, bulk, keys, scan, states) · `items/ItemPeek.tsx`
(RecordShell peek, InlineField edits, `PrimaryAction`, `ActionsMenu`, `HistoryLines`) · `items/ItemPage.tsx` (RecordPage,
all 12 sections, SaveDock, leave guard, conflict, TypeDialog, FamilyStock) · `items/ItemCreateSheet.tsx` (MasterSheet
create) · `items/VariantsSection.tsx` · `items/AxesDialog.tsx` (AxesEditor, preview, generate) · `items/actions.tsx`
(quick actions, AskFirst + VariantPicker flow, archive / restore / delete dialogs, label dialog) · `items/model.ts` (every
derived rule: types, required ledgers, availability, gaps, open lines, PATCH + history).

### Shared-file edits (additive; name them in the commit)

- `sales/DocDesk.tsx` — `numberOf`, `numberWidth`, `canExpand`, `fullOpen` (the record page takes the page, the list
  stays mounted), `onOpenPage` (Enter), `cursorKeys` (Space / X / ⇧X), `keyHints` + `?`, `failed`, `refreshing`,
  `emptyAction`, `exportMenu`, `scanToSearch` + `onSearchEnter`, `keepParams` (`?org=` kept on every link), `renderExtra`
  (host sheets and dialogs inside the frame), `initialFilters` (`?unit=` from the unit hub); `View.groups(rows, narrowed)`;
  `BulkAction.choose` / `.hidden`; `BulkResult.skippedIds`; `rowVerb.run(e)`; `PanelCtx.neighbour`; `?q=` read on arrival.
  Angular twin: the same inputs on `<bzw-doc-desk>`. A document desk passes none of them and is unchanged.
- `sales/record.tsx` — `RecordShell.image`, `RecordShell.onFullPage` (⤢ navigates to the page, at every width).
- `sales/parts.tsx` — `FilesSection.bare` (list + drop zone only, inside a host's section head).
- `masters/kit/RecordPage.tsx` — `railNote` ("Finish setting up" after a create).
- `masters/kit/marks.tsx` — `CopyText`'s glyph sits outside the text box (a code in a meta line kept a gap).
- `masters/kit/VariantPicker.tsx` (new, exported) — the website port of `<bzw-variant-picker>` (BZW-ATOMS §13b).
- `routes.tsx` — the four item routes, before `design/masters/:kind`.

### Atoms → Angular

No new `.bzw-*` block beyond the kit's. The create sheet's type cards are `.bzw-optrow` drawn with a resting
`--bz-line-soft` border so four read as cards (an `--card` modifier). The split primary ("New sales order ▾") is two
`.bzw-btn` with the joining radii dropped (a `.bzw-btn-split` part if the port wants one).

### Fields → columns / endpoints

| Surface | Field | Backed by |
|---|---|---|
| Desk row | Code · Item (+ category / "12 variants" / "Variant of X") · Type · Unit · Available · Sell price | `ITEM_CODE` · `ITEM_NAME`, `ITEM_CATEGORY_ID`, `PARENT_ID` · `SPECIAL_TYPE` + template flag · `STANDARD_UNIT_ID` · B-I1 `available` · `INITIAL_SALES_RATE` (base code via `CurrencyLabel`) |
| Desk statline | Negative · Below reorder · Out of stock · No sell price · Accounts missing · Archived | B-I1 `counts` |
| Peek / page facts | Available · On order · Unit cost · Sell · Margin · Reorder at · Sold 30 days · Open orders · Variants · Missing barcodes | B-I2 `stock`, B-I9, B-I2 `unit_cost`, `INITIAL_SALES_RATE`, derived, `REORDER_MINIMUN_QUANTITY`, B-I15, B-I9, B-I2 `family` |
| Essentials | Name*, Code, Type, Used for, Subscription, Category, Brand, Description, HS code; More: Short name, Sales / Purchase description, Weight, Manufacturer, MPN, Country; Image | `ITEM_NAME`, `ITEM_CODE` (B-I7), `SPECIAL_TYPE`, `SUB_TYPE`, `IS_SUBSCRIPTION_TYPE`, `ITEM_CATEGORY_ID`, `BRAND_ID`, `ITEM_DESCRIPTION`, `HS_CODE`, `SHORT_CUT`, `SALES_/PURCHASE_DESCRIPTION`, `ITEM_WEIGHT`, `MANUFACTURER`, `MPN`, `MANUFACTURER_COUNTRY`; DEFAULT_FILE (B-I13) |
| Units | Base unit*, conversions, Purchase / Sales / Stock / Consumption unit | `STANDARD_UNIT_ID`, `ITEM_UNIT_CONVERSION_RATE_MAP` (B-I3 `conversions`), `PURCHASE_/SALES_/STOCK_/CONSUMPTION_OUT_UNIT_ID` |
| Prices | Sell, Purchase, Margin, price-level ladder, Discount allowed + % ⇄ amount, Min / Max sale qty, Grant commission, barcode-price read-out, POS price list | `INITIAL_SALES_RATE`, `INITIAL_PURCHASE_RATE`, derived, `ACCOUNTING_LIST` type 8 `DISCOUNT_RATE`, `IS_DISCOUNT_ALLOWED`, `DEFAULT_DISCOUNT_PERCENTAGE` / `_AMOUNT`, `MINIMUN_SALES_QUANTITY`, `MAX_SALES_QUANTITY`, `IS_GRANT_COMISION`, `ITEM_BAR_CODE.SALES_RATE`, `api/item-price/all-by-item` count |
| Tax & accounts | Tax code (+ `IS_TAXABLE`), Income / Expense / Asset / COGS, kept accounts, other ledgers; More: Withholding tax, Non-posting | `TAX_ID`, `IS_TAXABLE`, `INCOME_/EXPENSE_/ASSET_/COGS_ACCOUNT_ID` (variant: ItemFamilyDefaults), the 7 variance ledgers read-only, `WH_TAX_CODE`, `IS_NON_POSTING`; "Use default" = `GLOBAL_DEFAULTS` |
| Stock & reordering | Costing, Reorder point, Safety stock, Lead time, Min / Max order qty, Preferred vendor | `COSTING_METHOD` (B-I4 lock), `REORDER_MINIMUN_QUANTITY`, `SAFETY_STOCK_LEVEL`, `LEAD_TIME_IN_DAYS`, `MINIMUN_/MAXIMUM_ORDER_QUANTITY`, `VENDOR_ID` |
| Tracking | Serial, Batch, Shelf life, End of life, Warranty + period, Storage condition, Cold chain, Controlled | `IS_SERIALIZED`, `IS_BATCH_NO` (B-I4 lock), `LIFE_IN_DAYS`, `END_OF_LIFE`, `HAS_WARRANTY`, `WARRANTY_PERIOD`, `STORAGE_CONDITION`, `IS_COLD_CHAIN`, `IS_CONTROLLED` |
| Variants | axes; Values · Code · Barcode · Sell · Buy · Stock; drift | `ITEM_MATRIX_ATTRIBUTE`, `ITEM_VARIANT_ATTRIBUTE_VALUE`, child `ITEM_CODE`, `ITEM_BAR_CODE`, child `INITIAL_SALES_/PURCHASE_RATE` (B-I3 `variants`, D-6), `api/item-matrix/{id}/matrix`, `family-drift` / `apply-family-settings`, `preview` / `generate` |
| Barcodes | Barcode · Unit · Price (blank = item price) · Discount | `ITEM_BAR_CODE` (B-I3 `barcodes`, `SALES_RATE` null when blank) |
| Subsidiaries | chips, Apply to child | `ITEM_MAP_ORGANISATION` (B-I3 delta), `APPLY_TO_CHILD` |
| Custom fields · Files · History | entity 41 values · FILE_ENTITY_MAP · record history | `field-list?entityType=41` · B-I13 · B-I8 |

Not shown on purpose (spec §3.3): Allow negative stock (D-11), item-level manufacture / expiry dates, landed-cost toggle,
default location, thresholds, tolerances, gain / loss account, per-unit conversion rates, `MANUFACTURER_NAME`.

### Refusal / copy sentences

Server today, verbatim: `'ZZ-CLAUDE-MX2 Tee' is a matrix template; scan one of its variant barcodes.` (the scan route).
New (B-I3 / B-I4 / B-I7): "Code already used by Mounting Plate Set." · "This barcode is already used by …" · "Sneha
Maharjan saved this item at 14:02." (409) · "Locked · this item has stock movements." · "Pokhara Branch has stock or
documents with this item, so it can't be removed." (the B-I3 org-removal guard; the spec names no sentence, this one is
the mock's). Client: "A name is required." · "Choose a base unit." · "Enter a number above 0." · "Fill Warranty terms." ·
"A price is 0 or more." · "Below purchase price." · "Taxable with no code — bills at 13 %. Pick a code or None."

### Lucide icons

`Archive`, `ArchiveRestore`, `ArrowLeftRight`, `ArrowUpRight`, `Barcode`, `Boxes`, `Check`, `ChevronDown/Left/Right`,
`Clock3`, `Copy`, `Download`, `FileSpreadsheet`, `FileText`, `Grid2x2`, `History`, `ImageOff`, `LayoutGrid`, `Maximize2`,
`MoreHorizontal`, `Package`, `PackagePlus`, `Percent`, `Plus`, `Printer`, `Receipt`, `SearchX`, `ShoppingBag`,
`ShoppingCart`, `SlidersHorizontal`, `Tag`, `Trash2`, `TriangleAlert`, `Warehouse`, `X`. Add to `BzwIconName` + its
`ngSwitchCase` whatever the app's list lacks.

### Invented data (mock only)

Figures a §8 read answers: stock rows of the ZZ and new rows (B-I2), unit costs, usage counts (B-I5), open lines of the
ZZ items (B-I9), sold-30-days (B-I15), POS price-list counts, history lines (B-I8). Seed rows past dev: the second
`MPS-006` item, AMC-01 with no base unit, the buying-only carton, the discount and kit items, the archived router, the
fresh mug, the brands, the two custom fields, the price levels (spec §3.2's 0 / 5 / 8 %), and "Sneha Maharjan" as the
other saver in the 409. The sales items' stock, committed quantities and open lines are READ from the sales and purchase
mockup stores, not seeded.

## WP3 · the transaction → master jump (`masters/jump/`, the sales composer)

### Files

`jump/ItemJumpSheet.tsx` (the item's MasterSheet opened from a line: "On this invoice" band, Prices · Tax & accounts ·
Essentials, Save, the page door) · `jump/CurrencyJump.tsx` (the hub's CurrencySheet in use mode: document context, D-1
rate, "Use this rate on the invoice", "Add rate for <date>") · `jump/offers.ts` (line offers — which fields, what the
composer's pricing gives, the words) · `jump/bridge.ts` (the sales seed ↔ the masters seeds: items, tax codes, units,
the document's base currency) · `jump/channel.ts` (`BroadcastChannel("bzk-masters")`).

### Shared-file edits (additive; name them in the commit)

- `sales/OrderComposer.tsx` — props `today` (the composer's clock) and `itemSeed` (B-F1); exports `ItemSeed`,
  `readItemSeed`, `itemSeedKey`; the item pencil (`EditTrigger reveal`) and ⌥↵ on the item cell; `LineOffer` under a
  line; the currency pencil; the base from the document's subsidiary (B-F6) and D-1 prefill / re-date offer / new-row
  offer; "Add rate for <date>"; the exchange rate is now required when foreign ("an exchange rate" in Needs); the picker
  footer "New item “…”" → create-and-use; archived items leave the picker and a line holding one says so; ⌘↵ / ⌘S
  yield to an open sheet or dialog.
- `sales/InvoicesDesk.tsx`, `sales/OrderDeskDesignPage.tsx`, `sales/EstimatesDesk.tsx` — `…/new` reads
  `?item=&qty=&unit=&cust=`, keys the composer by the seed (trap 30) and dates a NEW document on the masters' clock.
- `masters/kit/marks.tsx` + `index.ts` — `EditTrigger` (the app's `<bzw-edit-trigger>`, ported).
- `masters/kit/RatePop.tsx` — optional `date` (the effective date it opens on).
- `masters/hub/CurrencySheet.tsx` — optional `use: { context, bases, door }` (use mode: the document's band replaces the
  state band, rates against the document's base even on another subsidiary's base, the page door, commit "Save").
- `masters/items/ItemCreateSheet.tsx` — optional `use: { name, onCreated }` ("Create and use", no draft, no navigation).
- `masters/items/actions.tsx` — `pickableVariants()` extracted (the quick actions and the composer share it).
- `masters/items/ItemsDesk.tsx`, `masters/hub/MastersHubPage.tsx` — `useMastersChannel()`.

### Atoms → Angular

No new `.bzw-*` block. `<bzw-edit-trigger>` already exists (the composer's `oc__reveal` hover reveal; a touch screen
shows it always). `<bzw-line-offer>` and `<bzw-master-sheet>` are WP0's. The composer's line gains a sibling offer row.

### Fields → columns / endpoints

| Surface | Field | Backed by |
|---|---|---|
| Item jump band | customer + level, available at the document's location, line qty/unit/rate/tax, item price → level rate | the composer's own state; B-I2 summary with `locationId`; `ACCOUNTING_LIST` type 8 via the composer's rule |
| Item jump sections | Sell / Purchase price, Tax code, the type's posting ledgers, Name, Code (D-14), Category; Type, Base unit, Costing read (🔒 D-8) | `PATCH api/item/{id}` (B-I3) of the changed fields |
| Line offer | rate (re-levelled), tax code, sales unit | client-side, from the PATCH's fields; B-F7 for a save in another tab |
| Currency jump band | document rate (entered / date rate / stored), rate effective on the document date | the composer's state; B-C2 dated rows (D-1) against `api/currency/base?organisation_id=<document org>` |
| Add rate for <date> | a dated row | B-C2 `POST …/rates` |

### Refusal / copy sentences

"Couldn't save — the server didn't answer. Try again." (a failed PATCH, `?savefail=1`) · "Sneha Maharjan saved this
item at 14:02." + Reload (409, `?conflict=1`) · "Sell price is now 275.00 · Dealer −8 % = 253.00 (line has 230.00)." ·
"The rate on 24 Sep is 133.42." · "Today's rate is now 134.10 (this invoice has 133.42)." · "No rate on or before
12 Sep." · "This is Bizak Gandaki's base currency." · "Archived — hidden from pickers; this line keeps it" ·
"<item> was saved in another tab".

### Lucide icons

`Pencil` (✔ `pencil`), `ArrowUpRight` (✔), plus the kit's. Nothing new for `BzwIconName`.

### Invented data (mock only)

None new. The two seeds are bridged, not extended: a master item the sales seed lacks is appended to `ITEMS` on first
use (as "New customer" appends to `CUSTOMERS`). Mock-only plumbing: each tab has its own in-memory "server", so an
opening tab says `hello` on the channel and the opener answers with its changed items / rates (the app reads the server).

## Design review (spec §16) · what the Angular port must carry

### Tokens
- **Dark `--bz-text-soft` raised** (owner, 2026-09-26): `#85857F` → `#95958F` (4.8:1 on paper-warm, 5.4:1 on surface). Port it to `$bz-dark-text-soft` in `_variables.scss` — app-wide, it is the locked dark palette's soft ink.
- **`--bz-amber-ink`** — amber as TEXT (rate age "14d ago", "not a code", typo warnings, "Below purchase price.").
  Light `#B45309` (4.9:1 on paper), dark `#F3A83B`. Add `$bz-amber-ink` / `$bz-dark-amber-ink` in `_variables.scss`,
  `--bz-amber-ink` in `_theme-light.scss`, the re-point in `_bzw-dark.scss`. `--bz-amber` stays the GLYPH tone
  (⚠ marks); never use it for text (3.1:1).

### Focus contracts (website `sales/bzw.tsx`; each needs its `.bzw-*` twin and a BZW-ATOMS note)
- **`.bzw-dialog`**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` = the title element. On open, focus the
  panel (`tabindex="-1"`, no outline) unless a field inside already took focus; Tab / ⇧Tab wrap inside the panel; on
  close, focus returns to the element that opened it — or, when that was a menu item that no longer exists, to the
  trigger of the menu it came from. The close × carries `title="Close (Esc)"`.
- **`<bzk-popover>` / `<bzw-select>` / menus**: on open, focus moves INTO the panel one tick later, only if it is still
  outside (a panel that focuses its own field wins): a field, else the picked option (`data-picked`), else the first
  item that is not a close. ↑ ↓ Home End walk the panel's buttons (↓ from a Select's search enters the list). On close,
  focus returns to the trigger when it would otherwise land on `<body>`. Items and options draw the lime ring on
  `:focus-visible`.
- **`BzwToastService` host**: the toast is `role="status"` + `aria-live="polite"`; Undo and × get the ring; × is a
  24px hit area with `title="Dismiss"`.
- **`<bzw-grid>` Esc**: Esc on a row, not editing, while a master sheet is open BESIDE the grid (not containing it)
  is the sheet's — it closes and the cursor stays on the row. Inside a sheet's own grid, Esc leaves the grid first.
- **Grid add row**: `ghost.onAdd` may answer `{ text, col }`; the cursor goes to that cell, editing it (a duplicate
  unit code refuses on Code, not Name).
- **Inline field** (`<bzw-inline-field>`): the read face's accessible name is "<label>: <value>" (a visually hidden
  label + the value) — never an `aria-label` that hides the value; the hint is the `title`. One empty face: "—".
- **A refused create sheet** says each field's sentence once, under the field, and focuses it (the type cards when
  the type is missing); the sheet foot's refusal is for server sentences only.

### Kit / shared-file edits made by the review (additive)
`DocDesk` `rowLabel` / `expandLabel` (the row checkbox names the item, the caret says "Show variants") · `Grid`
select chevron shown on row hover / focus only (always on touch and on the add row) · `MasterSheet` foot: below 640px
the commit is a full-width row · `AppFrame` rail compacts below 760px viewport height (32px tiles, 2px gap, hidden
scrollbar) · currency `DatedRates`: no Source column in v1 (an imported row shows "Import" in its By cell), the base
in the column head ("1 USD in NPR"), `minWidth` 420 so it fits the 480px sheet.
