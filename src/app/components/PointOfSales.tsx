import {
  Section, Container, SectionHeading, Button, Card,
  IconBadge, HeroBadge, HeroCentered, PillBadge,
} from "./marketing";
import {
  Zap, CreditCard, ReceiptText, Clock, WifiOff, RefreshCw,
  Printer, ShieldCheck, User, Smartphone, DollarSign, Tag,
  TrendingUp, BarChart3, Terminal, Package, Users, Network,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { Icon: Zap,        title: "Lightning Checkout",      desc: "Sub-3-second transaction processing keeps queues short and customers happy at peak hours." },
  { Icon: CreditCard, title: "Multi-Payment Support",   desc: "Accept cash, card, QR, mobile wallets, and split payments all from a single interface." },
  { Icon: ReceiptText,title: "Smart Receipts",           desc: "Print or email branded receipts instantly. Customize layouts, add promotions, and embed QR codes." },
  { Icon: Clock,      title: "Shift Management",         desc: "Open and close cash drawers with automated float counting, cashier-level reports, and variance alerts." },
  { Icon: WifiOff,    title: "Full Offline Mode",        desc: "Keep selling when the internet drops. Transactions sync automatically once connectivity is restored." },
  { Icon: RefreshCw,  title: "Instant Inventory Sync",   desc: "Every item sold deducts from stock in real time no manual reconciliation, no overselling." },
];

const METRICS = [
  { value: "< 3s",  label: "Average Checkout",   desc: "Faster transactions mean shorter queues, higher throughput, and more revenue per hour." },
  { value: "99.9%", label: "Uptime Guaranteed",  desc: "Built-in offline mode and redundant sync ensure you never lose a sale due to connectivity." },
  { value: "Zero",  label: "Sync Errors",        desc: "Atomic inventory deductions and idempotent posting eliminate stock discrepancies permanently." },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function HeroDashboard() {
  const lineItems = [
    { name: "Espresso Double",   qty: "× 2", price: "$7.60",  accent: false },
    { name: "Almond Croissant",  qty: "× 1", price: "$4.20",  accent: false },
    { name: "Sparkling Water",   qty: "× 3", price: "$8.10",  accent: false },
    { name: "Loyalty Discount",  qty: "",    price: "−$2.00", accent: true  },
  ];
  const methods = [
    { Icon: DollarSign,  label: "Cash",   active: false },
    { Icon: CreditCard,  label: "Card",   active: true  },
    { Icon: Smartphone,  label: "QR Pay", active: false },
    { Icon: Zap,         label: "Split",  active: false },
  ];

  return (
    <div className="max-w-[440px] mx-auto rounded-bz-2xl border border-white/10 bg-bz-deep-2 overflow-hidden shadow-2xl">
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-3 text-[11px] text-white/30 tracking-tight font-semibold">Register #1 Morning Shift</span>
      </div>
      <div className="px-6 py-5">
        <div className="flex justify-between mb-2.5 pb-2 border-b border-white/[0.06]">
          <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/30">Item</span>
          <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/30">Total</span>
        </div>
        {lineItems.map((item, i) => (
          <div key={i} className={`flex justify-between items-center py-2${i < 3 ? " border-b border-white/[0.04]" : ""}`}>
            <div>
              <p className={`text-[12px] font-medium ${item.accent ? "text-bz-accent" : "text-white"}`}>{item.name}</p>
              {item.qty && <p className="text-[9px] text-white/30 mt-0.5">{item.qty}</p>}
            </div>
            <span className={`text-[13px] font-bold ${item.accent ? "text-bz-accent" : "text-white"}`}>{item.price}</span>
          </div>
        ))}

        <div className="mt-4 pt-3 border-t border-white/[0.08]">
          {[{ label: "Subtotal", value: "$17.90" }, { label: "Tax (13%)", value: "$2.33" }].map(r => (
            <div key={r.label} className="flex justify-between mb-1">
              <span className="text-[11px] text-white/40">{r.label}</span>
              <span className="text-[11px] text-white/40">{r.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-2">
            <span className="text-[15px] font-bold text-white">Total</span>
            <span className="text-[24px] font-extrabold text-bz-accent">$20.23</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {methods.map(m => (
            <div key={m.label} className={`px-2 py-2.5 rounded-bz-md text-center border ${
              m.active
                ? "bg-bz-accent/12 border-bz-accent/35"
                : "bg-white/5 border-white/[0.06]"
            }`}>
              <div className={`flex justify-center mb-1 ${m.active ? "text-bz-accent" : "text-white/40"}`}>
                <m.Icon className="size-3.5" />
              </div>
              <p className={`text-[9px] font-semibold ${m.active ? "text-bz-accent" : "text-white/40"}`}>{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 px-3 py-2.5 bg-green-500/10 border border-green-500/30 rounded-bz-md flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 biz-pulse-glow" />
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.15em]">Transaction Complete</span>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSACTION ENGINE ───────────────────────────────────────────────────────

function TransactionEngineSection() {
  const tenders = [
    { tender: "Card Payments", amount: "$1,842.00", pct: "72%", color: "bg-bz-accent"  },
    { tender: "Cash",          amount: "$519.50",   pct: "20%", color: "bg-blue-400"   },
    { tender: "QR / Mobile",   amount: "$206.00",   pct: "8%",  color: "bg-white/40"   },
  ];
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Under the Hood"
          title={<>A transaction engine built<br />for the shop floor</>}
          tone="light"
          maxWidth={640}
          className="mb-16"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Universal Payments */}
          <div className="bg-white/[0.03] rounded-bz-2xl border border-white/[0.08] p-8 min-h-[400px]">
            <IconBadge tone="darkSurface" size="md" className="mb-5">
              <CreditCard className="size-4 text-bz-accent" />
            </IconBadge>
            <h3 className="text-[18px] font-bold text-white mb-3">Universal Payments</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] mb-8">
              Accept every tender type your customers carry no integrations to bolt on later.
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "VISA",       color: "text-blue-500"  },
                { label: "MASTERCARD", color: "text-orange-500"},
                { label: "CASH",       color: "text-white/60"  },
                { label: "QR PAY",     color: "text-green-500" },
                { label: "APPLE PAY",  color: "text-white/40"  },
                { label: "BANK",       color: "text-indigo-400"},
              ].map(m => (
                <div key={m.label} className="bg-white/[0.04] border border-white/[0.05] rounded-bz-md p-3 text-center">
                  <p className={`text-[10px] font-bold ${m.color}`}>{m.label}</p>
                  <p className="text-[8px] text-white/30 uppercase tracking-[0.1em] mt-1">Enabled</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-500 biz-pulse-glow" />
              <span className="text-[11px] text-white/40">All methods active 0 gateway errors today</span>
            </div>
          </div>

          {/* Receipt Engine */}
          <div className="bg-white/[0.03] rounded-bz-2xl border border-white/[0.08] p-8 min-h-[400px] flex flex-col justify-between">
            <div>
              <IconBadge tone="darkSurface" size="md" className="mb-5">
                <Printer className="size-4 text-bz-accent" />
              </IconBadge>
              <h3 className="text-[18px] font-bold text-white mb-3">Receipt Engine</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-7">
                Branded digital and thermal receipts with custom fields, promotions, and QR return links.
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-bz-lg p-5 tracking-tight">
              <p className="text-[11px] font-bold text-white text-center mb-3 tracking-[0.2em]">BIZAK RETAIL</p>
              <div className="border-t border-dashed border-white/[0.12] pt-2.5">
                {[{ item: "Espresso × 2", amt: "$7.60" }, { item: "Croissant × 1", amt: "$4.20" }].map(r => (
                  <div key={r.item} className="flex justify-between mb-1">
                    <span className="text-[10px] text-white/40">{r.item}</span>
                    <span className="text-[10px] text-white/40">{r.amt}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-white/[0.12] mt-2 pt-2 flex justify-between">
                <span className="text-[11px] font-bold text-white">TOTAL</span>
                <span className="text-[11px] font-bold text-bz-accent">$13.54</span>
              </div>
              <div className="mt-3 flex justify-center">
                <div className="w-[52px] h-[52px] bg-white/[0.06] border border-white/10 rounded-bz-sm flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-0.5">
                    {[1, 0, 1, 0, 1, 0, 1, 1, 0].map((c, i) => (
                      <div key={i} className={`w-1.5 h-1.5 ${c ? "bg-bz-accent/60" : "bg-transparent"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Dashboard */}
          <div className="bg-white/[0.03] rounded-bz-2xl border border-white/[0.08] p-8 min-h-[360px] flex flex-col justify-between">
            <div>
              <IconBadge tone="darkSurface" size="md" className="mb-5">
                <User className="size-4 text-bz-accent" />
              </IconBadge>
              <h3 className="text-[18px] font-bold text-white mb-3">Shift Dashboard</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-7">
                Open and close shifts with automated cash counting, variance flags, and per-cashier breakdowns.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {tenders.map(row => (
                <div key={row.tender} className="px-3.5 py-3 bg-white/[0.04] border border-white/[0.07] rounded-bz-md flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${row.color}`} />
                    <span className="text-[12px] font-medium text-white">{row.tender}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-[13px] font-bold ${row.color === "bg-bz-accent" ? "text-bz-accent" : row.color === "bg-blue-400" ? "text-blue-400" : "text-white/60"}`}>{row.amount}</p>
                    <p className="text-[9px] text-white/40 uppercase">{row.pct} of shift</p>
                  </div>
                </div>
              ))}
              <div className="mt-1 px-3.5 py-2.5 bg-bz-accent/[0.06] rounded-bz-sm flex justify-between">
                <span className="text-[12px] font-bold text-white">Shift Total</span>
                <span className="text-[14px] font-bold text-bz-accent">$2,567.50</span>
              </div>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-white/[0.03] rounded-bz-2xl border border-white/[0.08] p-8 min-h-[360px]">
            <div className="flex justify-between items-start mb-5">
              <IconBadge tone="darkSurface" size="md">
                <ShieldCheck className="size-4 text-bz-accent" />
              </IconBadge>
              <div className="text-right">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">Integrity</p>
                <p className="text-[26px] font-bold text-bz-accent">100%</p>
              </div>
            </div>
            <h3 className="text-[18px] font-bold text-white mb-3">Transaction Audit Log</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] mb-6">
              Every sale, void, refund, and discount is timestamped and linked to a cashier for a complete paper trail.
            </p>
            <div>
              <div className="flex justify-between pb-2 border-b border-white/[0.06] text-[9px] font-bold text-white/40 uppercase tracking-[0.08em]">
                <span>Transaction</span><span>Cashier</span><span>Status</span>
              </div>
              {[
                { id: "#TXN-0091", cashier: "Sarah K." },
                { id: "#TXN-0090", cashier: "James M." },
                { id: "#TXN-0089", cashier: "Sarah K." },
              ].map(row => (
                <div key={row.id} className="flex justify-between items-center py-2.5 border-b border-white/[0.04] text-[10px] font-bold">
                  <span className="text-white">{row.id}</span>
                  <span className="text-white/60">{row.cashier}</span>
                  <div className="w-3 h-3 rounded-full bg-green-500/15 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── SALES INTELLIGENCE ───────────────────────────────────────────────────────

function SalesIntelligenceSection() {
  const bars = [30, 55, 45, 70, 90, 65, 80, 50, 40, 60, 75, 85];
  const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm"];
  const summary = [
    { label: "Peak Hour",     value: "6 PM",    sub: "↑ 42% vs yesterday" },
    { label: "Transactions",  value: "214",     sub: "Avg. 2.8 min/txn"   },
    { label: "Avg. Basket",   value: "$18.40",  sub: "↑ $1.20 this week"  },
  ];
  const cards = [
    { Icon: Tag,        label: "TOP PRODUCT",   value: "Espresso", sub: "63 sold today"   },
    { Icon: TrendingUp, label: "REVENUE TREND", value: "+18%",      sub: "vs. last Tuesday" },
    { Icon: BarChart3,  label: "ITEMS / TXN",    value: "2.7",       sub: "Basket depth"     },
  ];

  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Sales Intelligence"
          title={<>Know your busiest hours.<br />Act before the rush.</>}
          align="center"
          className="mb-14"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-5">
          <div className="bg-bz-surface rounded-bz-2xl border border-bz-border p-8 shadow-sm">
            <div className="flex justify-between items-start mb-9">
              <div>
                <h3 className="font-bold text-bz-text text-[15px]">Hourly Revenue Today</h3>
                <p className="text-[12px] text-bz-text-muted mt-1">Register #1, Morning to Close</p>
              </div>
              <PillBadge tone="accent" dot>LIVE</PillBadge>
            </div>

            <div className="flex items-end gap-1.5 h-[120px] pb-2 border-b border-bz-border">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-bz-sm ${
                      i === 10 ? "bg-bz-accent shadow-[0_0_12px_rgba(199,255,53,0.4)]" :
                      i === 4  ? "bg-bz-accent/45" :
                                  "bg-bz-bg"
                    }`}
                    style={{ height: h }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {hours.map(t => (
                <span key={t} className="text-[8px] text-bz-text-muted uppercase tracking-[0.04em]">{t}</span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-6 md:gap-8 pt-5 border-t border-bz-border">
              {summary.map(s => (
                <div key={s.label}>
                  <p className="text-[9px] font-bold text-bz-text-muted uppercase tracking-[0.08em] mb-1">{s.label}</p>
                  <p className="text-[20px] font-bold text-bz-text">{s.value}</p>
                  <p className="text-[10px] text-green-700 font-semibold mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {cards.map(c => (
              <div key={c.label} className="p-5 bg-bz-surface border border-bz-border rounded-bz-xl shadow-sm">
                <div className="w-8 h-8 bg-bz-bg rounded-bz-md flex items-center justify-center mb-3 text-bz-text-muted">
                  <c.Icon className="size-4" />
                </div>
                <p className="text-[9px] font-bold text-bz-text-muted uppercase tracking-[0.08em] mb-1">{c.label}</p>
                <p className="text-[20px] font-bold text-bz-text">{c.value}</p>
                <p className="text-[9px] font-bold text-bz-text-muted mt-1">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── ECOSYSTEM ────────────────────────────────────────────────────────────────

function EcosystemSection() {
  const Node = ({ Icon, label, sub }: { Icon: typeof Package; label: string; sub: string }) => (
    <div className="w-32 h-40 bg-white/[0.04] border border-white/10 rounded-bz-xl flex flex-col items-center justify-center gap-3 p-5 flex-shrink-0">
      <div className="w-10 h-10 bg-white/[0.04] border border-white/10 rounded-bz-md flex items-center justify-center text-white/60">
        <Icon className="size-5" />
      </div>
      <p className="text-[13px] font-bold text-white">{label}</p>
      <div className="w-full h-px bg-white/[0.08]" />
      <p className="text-[8px] text-white/40 uppercase tracking-[0.05em] text-center">{sub}</p>
    </div>
  );
  const Connector = () => (
    <div className="hidden md:flex flex-1 h-px max-w-[120px] min-w-[40px] bg-gradient-to-r from-transparent via-bz-accent/50 to-transparent" />
  );

  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Connected System"
          title={<>POS at the centre of<br />your entire operation</>}
          tone="light"
          align="center"
          className="mb-20"
        />
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-0 md:flex-wrap md:justify-center mb-10">
          <Node Icon={Package} label="Inventory" sub="Auto Stock-Out" />
          <Connector />
          <div className="relative flex-shrink-0 flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full bg-bz-accent flex flex-col items-center justify-center text-bz-text shadow-[0_0_50px_rgba(199,255,53,0.3)]">
              <Terminal className="size-7" strokeWidth={1.8} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 text-center leading-tight">POS<br />Hub</p>
            </div>
          </div>
          <Connector />
          <Node Icon={DollarSign} label="Finance" sub="Auto Posting" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-px h-10 bg-gradient-to-b from-bz-accent/50 to-transparent" />
          <Node Icon={Users} label="CRM" sub="Purchase History" />
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export function PointOfSalesPage() {
  return (
    <>
      <HeroCentered
        badge={<HeroBadge>Point of Sale Module</HeroBadge>}
        title={<>Ring up sales. Close shifts.<br /><span className="text-bz-sage">Stay in control.</span></>}
        description="A full-featured point of sale built for speed. Process any payment, track every item, and sync with your entire business in real time."
        actions={
          <>
            <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
            <Button variant="outline" size="lg" href="#features">View Features</Button>
          </>
        }
        visual={<HeroDashboard />}
      />

      <Section tone="white" id="features">
        <Container>
          <SectionHeading
            eyebrow="Features"
            title={<>Everything the modern<br />checkout demands</>}
            maxWidth={640}
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {FEATURES.map(({ Icon, title, desc }) => (
              <Card key={title} hover="lift" pad="md">
                <IconBadge tone="sage" size="md" className="mb-6">
                  <Icon className="size-5" />
                </IconBadge>
                <h3 className="font-bold text-[16px] text-bz-text mb-2.5">{title}</h3>
                <p className="text-[13px] text-bz-text-muted leading-[1.65]">{desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <TransactionEngineSection />
      <SalesIntelligenceSection />
      <EcosystemSection />

      <Section tone="white">
        <Container>
          <SectionHeading eyebrow="Impact" title="Measurable lift from day one" align="center" className="mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {METRICS.map(m => (
              <Card key={m.label} hover="lift" pad="lg" className="text-center">
                <div className="text-[52px] font-black text-bz-text tracking-[-0.04em] mb-3">{m.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-4">{m.label}</div>
                <p className="text-[13px] text-bz-text-muted leading-[1.65]">{m.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="dark">
        <Container width="narrow">
          <SectionHeading
            title={<>Start selling smarter<br /><span className="text-bz-accent">from your first transaction</span></>}
            description="Join thousands of retailers on Bizak POS. Get up and running in minutes no hardware lock-in."
            tone="light"
            align="center"
            maxWidth={520}
            className="mb-10"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="accent" size="lg" href="https://system.bizakerp.com/account/self-register" withArrow>
              Start Free Trial
            </Button>
            <Button variant="ghostDark" size="lg" href="/contact">
              Book a Demo
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
