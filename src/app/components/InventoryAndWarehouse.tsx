import {
  ClipboardCheck,
  MapPin,
  PackagePlus,
  RefreshCw,
  ScanBarcode,

  Truck,
  Warehouse,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  BigCard,
  Container,
  DataRow,
  DotGrid,
  Heading,
  HeroCanvas,
  JournalRow,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StepCard,
  StripeBar,
  Tick,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════════

const ZONES = [
  { id: "A", name: "Zone A · Main floor",   units: "3,842 units", pct: 78 },
  { id: "B", name: "Zone B · Cold storage", units: "1,206 units", pct: 62 },
];

const LIVE_FEED = [
  // { id: "PICK-7714", what: "Pick · SO-1041",            flow: "Allocated · Zone A",            t: "1m"  },
  { id: "TR-318",    what: "Transfer · A → C",          flow: "212 units moved",               t: "4m"  },
  { id: "GRN-2045",  what: "Goods receipt · 96 units",  flow: "DR Inventory · CR GR clearing", t: "9m"  },
];

const CORE_FEATURES = [
  { icon: Warehouse,   title: "Multi-warehouse",       desc: "Zones, racks and bin-level addresses across every site, in one view." },
  { icon: ScanBarcode, title: "Lot, serial & barcode", desc: "Trace every unit by lot, serial or batch — receipt to dispatch." },
  { icon: RefreshCw,   title: "Smart replenishment",   desc: "Reorder points with auto-PO routing — stockouts caught before they hit." },
];

const VALUATION_METHODS = ["FIFO", "LIFO", "Weighted average"];

const CYCLE_COUNT_ROWS = [
  { ref: "CC-441", loc: "Zone A · Rack 14", variance: "+2"  },
  { ref: "CC-440", loc: "Zone B · Shelf 3", variance: "0"  },
];

const HERO_TREE = [
  { id: "wh",  depth: 0, label: "Dubai Distribution Hub", tag: "Warehouse"                  },
  { id: "b1",  depth: 1, label: "Bay A-1",                tag: "Bay"                        },
  { id: "bn3", depth: 2, label: "Bin B-3",                tag: "Bin"                        },
  { id: "r14", depth: 3, label: "Rack 14",                tag: "Rack",      selected: true  },
  { id: "s3",  depth: 4, label: "Shelf S-3",              tag: "Shelf"                      },
  { id: "b2",  depth: 1, label: "Bay A-2",                tag: "Bay",       muted: true     },
];

// ════════════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Live stock on every shelf</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Know what's on every shelf, right now{" "}
            <Heading.Muted>and every movement, on the same ledger.</Heading.Muted>
          </Heading>

          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        <HeroCanvas className="flex flex-col !p-0 [&>.bz-hero-cards]:flex-1 [&>.bz-hero-cards]:flex [&>.bz-hero-cards]:flex-col [&>.bz-hero-cards]:items-stretch">
          <div className="flex flex-1 flex-col p-[56px] max-[720px]:p-9 max-[480px]:p-4">
            <WarehouseFlowPanel />
          </div>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

function WarehouseFlowPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live · 3 sites</StatusChip>
        <p className="text-[13px] font-semibold tabular-nums text-bz-text">6,358 units on-hand</p>
      </div>

      {/* Body — stacks on mobile, side-by-side on sm+ */}
      <div className="grid flex-1 grid-cols-1 divide-y divide-bz-line-soft sm:grid-cols-[3fr_2fr] sm:divide-x sm:divide-y-0">

        {/* Left — location hierarchy tree */}
        <div className="p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Location hierarchy
          </p>
          <div className="flex flex-col gap-0.5">
            {HERO_TREE.map((n) => (
              <div
                key={n.id}
                className={[
                  "flex items-center gap-2 rounded-bz-sm py-1.5 pr-2",
                  n.selected ? "bg-[var(--bz-fire-soft)]" : "",
                ].join(" ")}
                style={{ paddingLeft: n.depth * 14 + 8 }}
              >
                <span
                  className={[
                    "h-[5px] w-[5px] shrink-0 rounded-full",
                    n.selected
                      ? "bg-bz-fire"
                      : n.depth === 0
                      ? "bg-bz-olive"
                      : n.depth === 1
                      ? "bg-bz-leaf-deep"
                      : "bg-bz-text-soft",
                    n.muted ? "opacity-40" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "flex-1 text-[11.5px]",
                    n.selected
                      ? "font-medium text-bz-text"
                      : n.depth === 0
                      ? "font-semibold text-bz-text"
                      : n.muted
                      ? "text-bz-text-soft"
                      : "text-bz-text",
                  ].join(" ")}
                >
                  {n.label}
                </span>
                <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
                  {n.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — selected location detail */}
        <div className="p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Selected location
          </p>

          <div className="mb-3 text-[10.5px] text-bz-text-muted">
            Bay A-1 · Bin B-3 · Rack 14
          </div>

          <div className="bz-stat-num mb-0.5" style={{ fontSize: 24 }}>1,204</div>
          <div className="mb-4 text-[10.5px] text-bz-text-muted">units on-hand</div>

          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10.5px] text-bz-text-muted">Occupancy</span>
            <span className="text-[10.5px] font-medium text-bz-text">78%</span>
          </div>
          <StripeBar pct={78} />

          <div className="mt-3">
            <DataRow label="Active lot" value="L-204" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] LIVE FLOOR — the bespoke "where every unit is" panel
// ════════════════════════════════════════════════════════════════════════════

function LiveFloorSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Live floor"
          title={<>Where every unit is, <Heading.Muted>right this second.</Heading.Muted></>}
          titleMaxWidth={720}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" href="/contact">Request Demo</Pill>
            </PillGroup>
          }
        />

        <WarehouseMap />

        <BentoGrid cols={3} className="mt-[18px]">
          {CORE_FEATURES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover minHeight={200}>
              <Bento.Header
                title={title}
                icon={<Icon size={22} strokeWidth={1.4} color="#1F3422" />}
              />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function WarehouseMap() {
  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
      {/* Zone map */}
      <div className="relative flex flex-col overflow-hidden rounded-bz-2xl bg-bz-olive p-7">
        <DotGrid tone="dark" />
        <div className="relative flex flex-col flex-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/[0.55]">
                Warehouse map · all sites
              </div>
              {/* <div className="mt-1 text-[18px] font-medium text-bz-text-on-dark">
                4 sites · 12 zones · 6,358 units
              </div> */}
            </div>
            <StatusChip variant="live">Live</StatusChip>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ZONES.map((z) => (
              <div
                key={z.id}
                className="rounded-bz-xl border border-white/[0.06] bg-white/[0.04] p-3.5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-bz-pill bg-bz-leaf text-[10.5px] font-semibold text-[#1F3422]">
                      {z.id}
                    </span>
                    <span className="text-[11.5px] font-medium text-bz-text-on-dark">
                      {z.name}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-white/[0.72]">{z.units}</span>
                </div>
                <StripeBar pct={z.pct} tone="dark" />
                <div className="mt-1.5 text-[10px] text-white/[0.55]">
                  Utilisation {z.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live feed */}
      <div className="rounded-bz-2xl border border-bz-line-soft bg-bz-paper p-6">
        <div className="mb-4 flex items-start justify-between gap-3 pb-24">
          <div>
            <div className="text-[11px] text-bz-text-muted">Live movement feed</div>
            <div className="bz-stat-num" style={{ fontSize: 20 }}>last 60 seconds</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-bz-pill bg-bz-leaf-deep" />
            <span className="text-[10.5px] font-medium text-bz-text">Streaming</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {LIVE_FEED.map((f) => (
            <div key={f.id} className="rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11.5px] font-medium text-bz-text">{f.id}</span>
                <span className="text-[10.5px] text-bz-text-muted">{f.t}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <span className="text-[11px] text-bz-text-muted">{f.what}</span>
                <span className="text-[10.5px] text-bz-text">{f.flow}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] RECEIVE → STORE → SHIP
// ════════════════════════════════════════════════════════════════════════════

function FlowSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="The flow"
          title={<>Receive, store, ship <Heading.Muted>every step traced, every journal posted.</Heading.Muted></>}
          titleMaxWidth={820}
        />

        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Receive"
            title="Scan in goods, post journals automatically"
            bullets={[
              "GRN posts DR Inventory · CR GR clearing the moment you scan.",
            ]}
            visual={<ReceiveVisual />}
          />
          <StepCard
            number="02"
            tag="Store"
            title="Live bin map, smart put-away"
            bullets={[
              "Zone, rack and bin addresses — system suggests the best slot.",
            ]}
            visual={<StoreVisual />}
          />
          <StepCard
            number="03"
            tag="Ship"
            title="Pick, pack and post COGS automatically"
            bullets={[
              "Allocate against the open sales order — FIFO, LIFO or weighted average.",
            ]}
            visual={<ShipVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

function ReceiveVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">Scan to receive</span>
        <StatusChip variant="live">Live</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="mb-1 flex items-center gap-2">
          <ScanBarcode size={14} color="#1F3422" />
          <span className="text-[11.5px] font-medium text-bz-text">SKU-4821 · Lot L-204</span>
        </div>
        <div className="text-[10.5px] text-bz-text-muted">480 units · Zone A · Rack 14</div>
      </div>
      <JournalRow txn="GRN-2046 posted" debit="Inventory" credit="GR clearing" />
    </div>
  );
}

function StoreVisual() {
  // Compact bin grid — one suggested slot (fire), occupied (olive), free (paper).
  const tiles: ("occupied" | "suggested" | "free")[] = [
    "occupied", "occupied", "free",      "occupied", "free",       "free",
    "free",     "occupied", "suggested", "free",     "occupied",   "free",
    "occupied", "free",     "free",      "occupied", "free",       "free",
  ];
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">Zone A · put-away</span>
        <span className="text-[10.5px] text-bz-text">Suggested · Rack 14</span>
      </div>
      <div className="mb-3 grid grid-cols-6 gap-1.5">
        {tiles.map((t, i) => (
          <div
            key={i}
            className={
              t === "occupied"
                ? "aspect-square rounded-bz-sm bg-bz-olive"
                : t === "suggested"
                ? "aspect-square rounded-bz-sm bg-bz-fire"
                : "aspect-square rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm"
            }
          />
        ))}
      </div>
      <DataRow label="Free slots" value="42 of 72" emphasis />
    </div>
  );
}

function ShipVisual() {
  const picks = [
    // { sku: "SKU-4821", qty: "12 × Lot L-204", bin: "A · R14" },
    { sku: "SKU-3902", qty: "4 × Lot L-198",  bin: "A · R12" },
    // { sku: "SKU-1207", qty: "1 × Lot L-211",  bin: "B · S3"  },
  ];
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">Pick list · SO-1041</span>
        <StatusChip variant="posted">Picked</StatusChip>
      </div>
      <div className="mb-3 flex flex-col gap-1.5">
        {picks.map((p) => (
          <div
            key={p.sku}
            className="flex items-center justify-between gap-3 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <span className="text-[11px] font-medium text-bz-text">{p.sku}</span>
            <span className="text-[10.5px] text-bz-text-muted">{p.qty} · {p.bin}</span>
          </div>
        ))}
      </div>
      <JournalRow txn="SH-882 dispatched" debit="COGS" credit="Inventory" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] COUNTS YOU CAN TRUST
// ════════════════════════════════════════════════════════════════════════════

function CountsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Trust"
          title={<>Counts you can trust, <Heading.Muted>valuation that holds up to audit.</Heading.Muted></>}
          titleMaxWidth={720}
        />
        <BigCard
          text={{
            title: "One cycle-count log. Every unit, every method.",
            // body: "Blind, visible or location-cycle counts feed straight into the ledger — with valuation in FIFO, LIFO or weighted average, picked per warehouse.",
            bullets: [
              "Lot, serial and batch trace, end to end",
              "Variance reconciliation, fully audited",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Talk to Sales" },
          }}
          visual={<CountSheetVisual />}
        />
      </Container>
    </Section>
  );
}

function CountSheetVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="text-[11.5px] text-bz-text-muted">Cycle count · today</div>
        <ClipboardCheck size={16} color="#1F3422" />
      </div>
      <div className="bz-stat-num" style={{ fontSize: 28 }}>99.8%</div>
      <div className="mb-4 pb-6 text-[11px] text-bz-text-muted">Variance-free reconciliation</div>

      <div className="flex flex-col gap-1.5">
        {CYCLE_COUNT_ROWS.slice(0, 2).map((r) => (
          <div
            key={r.ref}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Tick size="sm" />
              <span className="text-[11px] font-medium text-bz-text">{r.ref}</span>
              <span className="truncate text-[10.5px] text-bz-text-muted">{r.loc}</span>
            </div>
            <span className="text-[10.5px] font-medium text-bz-text">{r.variance}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 pt-8">
        {VALUATION_METHODS.map((m) => (
          <span
            key={m}
            className="rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1 text-[10.5px] font-medium text-bz-text"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] EVERY MOVEMENT, ON ONE LEDGER
// ════════════════════════════════════════════════════════════════════════════

function OneLedgerSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="04"
          label="One ledger"
          tone="dark"
          title={<>Every movement, <Heading.Muted>auto-posted on the same ledger that closes the books.</Heading.Muted></>}
          titleMaxWidth={780}
        />

        <BentoGrid cols={3}>
          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Goods receipt → <br />Inventory up</>}
              icon={<PackagePlus size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Receipts post DR Inventory.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="GRN-2046 · 480 units" debit="Inventory" credit="GR clearing" />
              {/* <JournalRow tone="dark" txn="GRN-2045 · 96 units"  debit="Inventory" credit="GR clearing" /> */}
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Shipment → <br />COGS recognised</>}
              icon={<Truck size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Dispatches post DR COGS.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="SH-882 · SO-1041" debit="COGS" credit="Inventory" />
              {/* <JournalRow tone="dark" txn="SH-881 · SO-1037" debit="COGS" credit="Inventory" /> */}
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Transfer → <br />zero P&amp;L drift</>}
              icon={<MapPin size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Internal transfers move stock.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="TR-318 · A → C" debit="Zone C stock" credit="Zone A stock" />
              {/* <JournalRow tone="dark" txn="TR-317 · B → A" debit="Zone A stock" credit="Zone B stock" /> */}
            </Bento.Footer>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function InventoryAndWarehousePage() {
  return (
    <main>
      <HeroSection />
      <LiveFloorSection />
      <FlowSection />
      <CountsSection />
      <OneLedgerSection />
    </main>
  );
}
