# Field sales (SFM) mockup — porting notes

Design contract: `bizak-app-sfm/docs/sfm-redesign/SFM-DESIGN-SPEC.md` (branch `feature/sfm-redesign`), backend:
`BACKEND-NEEDS.md`, decisions: `DECISIONS.md`. This file maps the mockup to the Angular port.

## Routes (mockup → app)

| Mockup | App (proposed) | Replaces |
|---|---|---|
| `/design/sfm/today[/:repId][?day=]` | `/app/main/sfm/today[/:employeeId]` | Salesman On Map, Party On Map, Salesman Person Location, Visit Plan Report, EOD per day |
| `/design/sfm/plan[?week=&focus=]` | `/app/main/sfm/plan` | Employee Plan list + calendar |
| `/design/sfm/routes[/:id|/new]` | `/app/main/sfm/routes` | Route (user-management/master/sfm/route-setup), Party Route Map, Salesman Route Map |
| `/design/sfm/parties[/:id]` | `/app/main/sfm/parties` | — (new) |
| `/design/sfm/visits[/:id][?reps=]` | `/app/main/sfm/visits` | Customer Visit Summary/Detail/In Out, Customer Visit By Sales Rep (+Summary), Salesman Activity, Party Stock |
| `/design/sfm/performance[?period=&view=]` | `/app/main/sfm/performance` | Eod, Eod Report, the rep summaries |
| `?rep=` / `?party=` on any tab | same | rep sheet / party sheet |

Old URLs redirect to the matching tab (decision D-2).

## Files

| File | What it is |
|---|---|
| `seed.ts` | pure data (reps, routes, parties, plans, visits, orders, receipts, punches, fixes, closes). The sales seed imports it: `CUSTOMERS`, `ITEMS`, `PEOPLE`, today's `SEED_ORDERS` and receipts come from here |
| `model.ts` | the kernel: stores, `repDay`, `routeHealth`, `partyCoverage`, writes (`planRoute`, `movePlan`, `handOver`, `addPartiesToRoute`, …). **The rules at its head are the port's contract** |
| `kit.tsx` | `useField`, `SfmNav`/`SfmFrame`, `RouteChip`, `StopMark`/`StopStrip`/`StopLegend`, `Money`, `DayStepper`, `useSheetLinks` |
| `map.tsx` | `FieldMap` (SVG ground in the mockup) |
| `planning.tsx` | `PlanRoutePop`, `PlanRepPop`, `GivePop` |
| `sheets.tsx` | `RepSheet`, `PartySheet`, `SheetHost`, `Activity` + `ActivityFoot` (history + notes) |
| `day.tsx` | the Day panel |
| `TodayPage.tsx` · `PlanPage.tsx` · `RoutesDesk.tsx` + `RoutePanel.tsx` · `PartiesDesk.tsx` · `VisitsDesk.tsx` · `PerformancePage.tsx` | the six tabs |

## Atoms → Angular

| Mockup | Angular twin | Status |
|---|---|---|
| `SfmFrame` / `SfmNav` | `PageHeaderService` + `PageTabsService` top-bar tabs with counts | exists |
| `DocDesk` (Routes, Parties, Visits) | `<bzw-doc-desk>` | exists |
| `RecordShell`, `StepCard`, `Block`, `Section` | `.bzw-record`, `.bzw-step`, `.bzw-block`, section rows | exists |
| `Activity` + `ActivityFoot` | `section[bzwRecordHistory]` + `<bzw-note-foot>` | exists; needs SFM subjects in the history reader (BACKEND-NEEDS B10) |
| `MasterSheet` (rep, party) | `<bzw-master-sheet>` | exists |
| `Statline`/`Stat`, `Chip`, `Avatar`, `Meter`, `DocLink`, `Popover`, `Select`, `Segmented`, `BulkBar`, `ToastHost`, `Refusal` | the `.bzw-*` families / `<bzw-select>` / `BzwToastService` | exist |
| `StopMark` / `StopStrip` / `StopLegend` | **new** `<bzw-stop-strip>` (+ `.bzw-stopmark--productive|visited|pending|missed|here|unplanned`) | to build |
| `RouteChip` | **new** `.bzw-routechip` (3px identity bar + id + name) | to build |
| `DayStepper` | **new** `<bzw-day-stepper>` (← → T keys, date field) | to build |
| `FieldMap` | the tenant Google map in a **new** bzw wrapper `<bzw-field-map>` beside `<bzk-map-guard>`; pins = route tone, trail dotted | to build (bizak-maps skill) |
| Plan board grid (rep rows × day columns, drag chips, tray) | **new** `.bzw-planboard`; drag via the existing drag kit (`[bzwDropTarget]`, drag-pointer service) | to build |
| `PlanRoutePop` / `PlanRepPop` / `GivePop` | `<bzk-popover>` bodies | to build |
| `WeekStrip` (rep sheet), "Next 14 days" grid (route panel) | **new** `.bzw-daystrip` | to build |

## Tokens added (`theme.css`) — add to `_variables.scss` + dark

`--bz-route-1…8` (route identity), `--bz-map-land`, `--bz-map-block`, `--bz-map-water`, `--bz-map-road`, `--bz-map-ring`.

## Lucide icons used that `BzwIconName` lacks

`arrow-down`, `arrow-up`, `calendar-check`, `calendar-plus`, `calendar-range`, `camera`, `clock`, `crosshair`,
`file-down`, `footprints`, `log-in`, `log-out`, `map`, `map-pin`, `minus`, `panel-right-close`, `panel-right-open`,
`repeat`, `route`, `user-plus` (checked against `shared/ui/bzw-icon/bzw-icon.component.ts`, 2026-09-28).

## Shared-file edits made by this mockup

- `productivity/shared.tsx` — `PEOPLE` gains the 7 field reps (team "Field sales").
- `sales/orders.tsx` — `CUSTOMERS` gains the field parties, `ITEMS` the 6 field items, `SEED_ORDERS` today's field
  orders (SO-1054…).
- `sales/flow.tsx` — `receiptsStore` gains today's field receipts (RCP-0418…), untagged (advance).
- `sales/OrderDeskDesignPage.tsx` — `?cust=&rep=&day=` seeds a new order from a visit (the order lands on that rep-day).
- `sales/AppFrame.tsx` — rail entry "Field sales".
- `routes.tsx` — the `design/sfm/*` routes.
- `styles/theme.css` — the tokens above.

## Invented for the mockup (`needs:`)

- A rep's start time (09:30) — D-5.
- Stop order on a route — D-3 (`MAP_PARTY_ROUTE.SEQUENCE`).
- A party's outstanding balance — needs `InvoiceSettlementService` per customer.
- Historic orders before today are figures only (not sales documents); their DocLinks notify instead of navigating.
- The map ground is drawn SVG; the app uses the tenant's Google map.
- Idle 45 min / behind 2 stops thresholds — D-5.

## Mockup switches

`?slow=1` (loading), `?fail=1` (failed + Retry), `?empty=1` (no data) on every tab.
