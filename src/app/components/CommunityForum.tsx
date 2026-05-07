import { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/style.css";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  AtSign,
  Boxes,
  CheckCircle2,
  Eye,
  Factory,
  Flame,
  Hammer,
  HelpCircle,
  Layers,
  LayoutGrid,
  Lock,
  LogIn,
  LogOut,
  MessageCircle,
  PlugZap,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  Wallet,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Button,
  Container,
  HeroBadge,
  PillBadge,
  Section,
} from "./marketing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryKey =
  | "all"
  | "finance"
  | "inventory"
  | "manufacturing"
  | "sales"
  | "workflow"
  | "integrations"
  | "implementation"
  | "industry";

type StatusKey = "all" | "trending" | "open" | "solved";
type ThreadStatus = "open" | "solved" | "trending";

type User = {
  name: string;
  email: string;
  initials: string;
  role: string;
};

type Reply = {
  id: string;
  author: string;
  role: string;
  initials: string;
  posted: string;
  body: string;
  votes: number;
  isSolution?: boolean;
  isBizakTeam?: boolean;
  isYou?: boolean;
};

type Thread = {
  id: string;
  status: ThreadStatus;
  category: Exclude<CategoryKey, "all">;
  categoryLabel: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  role: string;
  initials: string;
  votes: number;
  replies: number;
  views: string;
  posted: string;
  lastReplyBy?: string;
  lastReplyAt?: string;
  replyList: Reply[];
  isYou?: boolean;
};

// ─── Filter config ────────────────────────────────────────────────────────────

const CATEGORIES: { key: CategoryKey; label: string; icon: LucideIcon }[] = [
  { key: "all",            label: "All",                 icon: LayoutGrid  },
  { key: "finance",        label: "Finance",             icon: Wallet      },
  { key: "inventory",      label: "Inventory",           icon: Boxes       },
  { key: "manufacturing",  label: "Manufacturing",       icon: Factory     },
  { key: "sales",          label: "Sales & CRM",         icon: TrendingUp  },
  { key: "workflow",       label: "Workflow",            icon: Workflow    },
  { key: "integrations",   label: "API & integrations",  icon: PlugZap     },
  { key: "implementation", label: "Implementation",      icon: Hammer      },
  { key: "industry",       label: "Industry talk",       icon: Layers      },
];

const STATUS_FILTERS: { key: StatusKey; label: string; icon: LucideIcon }[] = [
  { key: "all",      label: "All threads", icon: LayoutGrid    },
  { key: "trending", label: "Trending",    icon: Flame         },
  { key: "open",     label: "Open",        icon: HelpCircle    },
  { key: "solved",   label: "Solved",      icon: CheckCircle2  },
];

const COMPOSE_CATEGORIES = CATEGORIES.filter((c) => c.key !== "all") as {
  key: Exclude<CategoryKey, "all">;
  label: string;
  icon: LucideIcon;
}[];

// ─── Initial threads ──────────────────────────────────────────────────────────

const INITIAL_THREADS: Thread[] = [
  {
    id: "t-month-end-close",
    status: "trending",
    category: "finance",
    categoryLabel: "Finance",
    title: "How are you cutting month-end close from 9 days to under 48 hours on Bizak?",
    excerpt:
      "We're stuck on a 9-day close. Looking for the runbook — auto-posting rules, bank-feed cadence, reconciliation queues. What's the right sequence?",
    body:
      "We've been on Bizak for 4 cycles and our close is still 9 days. Tried automating recurring journals but bank-feed match is mostly manual, and we run reconciliations sequentially. Looking for a sequence that works at our scale (3 entities, 2 currencies, ~6k JEs/month). Specifically: (1) which auto-posting rules give the most leverage, (2) is daily bank-feed match worth the operator time, and (3) what reconciliation queues do you run in parallel without stepping on each other?",
    author: "Priya Adhikari",
    role: "Group Controller · Manufacturing",
    initials: "PA",
    votes: 214,
    replies: 87,
    views: "12.4k",
    posted: "2d ago",
    lastReplyBy: "SB",
    lastReplyAt: "12m ago",
    replyList: [
      {
        id: "r1",
        author: "Sagar Bizak",
        role: "Solutions Engineer · Bizak",
        initials: "SB",
        posted: "1d ago",
        body:
          "Three things matter, in this order: (1) auto-posting for recurring journals — depreciation, prepaid amortisation, accruals. (2) Daily bank-feed match instead of monthly; the cumulative cost of reconciling 30 days at month-end is the killer. (3) Parallel reconciliation queues by GL family, not by entity — auditors can review them concurrently. We've seen 40+ teams cut close to under 2 days with this exact pattern.",
        votes: 142,
        isSolution: true,
        isBizakTeam: true,
      },
      {
        id: "r2",
        author: "Anita Karki",
        role: "Plant Manager · Auto-parts",
        initials: "AK",
        posted: "20h ago",
        body:
          "+1 to Sagar. We added one more thing on top: auto-flag any unreconciled item over 5 days into a daily Slack channel for finance. Removed almost all the 'oh I forgot about that one' moments at close. Down from 8 days to 36 hours.",
        votes: 56,
      },
    ],
  },
  {
    id: "t-landed-cost",
    status: "open",
    category: "inventory",
    categoryLabel: "Inventory",
    title: "Best practice for landed cost on multi-leg international shipments?",
    excerpt:
      "Freight + duty + clearing across 3 currencies hitting the same PO. Allocating at receipt, at invoice, or via a periodic adjustment — which works for you?",
    body:
      "We import from 3 origins. Each shipment carries freight in one currency, customs duty in another, and a clearing fee in the local one. POs land in batches with partial receipts. Today we accrue at receipt with an estimate and reverse at invoice — but the variance is becoming material. Curious what the right pattern is. Doing it at receipt means inventory carries the wrong cost for days; doing it at invoice means COGS is wrong; periodic adjustment loses the per-PO traceability.",
    author: "Nabin Shrestha",
    role: "Head of Supply Chain · Distribution",
    initials: "NS",
    votes: 96,
    replies: 42,
    views: "5,820",
    posted: "6h ago",
    lastReplyBy: "DL",
    lastReplyAt: "31m ago",
    replyList: [
      {
        id: "r1",
        author: "Dipesh Lama",
        role: "Implementation Partner",
        initials: "DL",
        posted: "3h ago",
        body:
          "We accrue at receipt with a freight estimate locked from the shipping doc, then post the variance against COGS at invoice — never against inventory. Keeps the per-PO trail and avoids the COGS dance. The trick is to make the estimate routine, not heroic.",
        votes: 38,
      },
    ],
  },
  {
    id: "t-oee-drop",
    status: "solved",
    category: "manufacturing",
    categoryLabel: "Manufacturing",
    title: "OEE dropped 4 points after adding a second shift — how we found the cause",
    excerpt:
      "Walked back through work-order timestamps in the audit trail. Turned out we were starving the second shift on a single bottleneck SKU. Posting the fix and the SQL.",
    body:
      "Quick share for anyone running into the same. We added a second shift, expected OEE to climb, instead it dropped 4 points. Root cause was a single SKU on the bottleneck work-centre that wasn't being prepped during the handover — second shift started cold for ~25 minutes. Found it by joining work-order timestamps with the operator-attendance log. Fix: a 5-minute pre-shift kit walk added to the supervisor checklist. OEE is now +6 vs. baseline.",
    author: "Anita Karki",
    role: "Plant Manager · Auto-parts",
    initials: "AK",
    votes: 78,
    replies: 31,
    views: "4,210",
    posted: "1d ago",
    lastReplyBy: "PA",
    lastReplyAt: "3h ago",
    replyList: [
      {
        id: "r1",
        author: "Priya Adhikari",
        role: "Group Controller · Manufacturing",
        initials: "PA",
        posted: "12h ago",
        body:
          "Saving this. We have a similar second-shift handover gap on a paint line. Going to try the pre-shift kit walk this week and report back.",
        votes: 22,
      },
    ],
  },
  {
    id: "t-approval-chain",
    status: "open",
    category: "workflow",
    categoryLabel: "Workflow",
    title: "Approval chain pattern for capex POs above ₹10L — without becoming a bottleneck",
    excerpt:
      "Looking for a routing pattern that escalates only when committed spend trips a threshold against the open budget — not on every line item.",
    body:
      "Right now every capex line above ₹1L hits the CFO. The CFO inbox is the bottleneck. I want a smarter pattern that only escalates when the running committed total against an annual budget bucket trips 80%, OR when the line itself is above ₹10L. Anyone built this on Bizak's workflow engine? Looking for the rule shape, not just the idea.",
    author: "Suresh Maharjan",
    role: "FP&A Lead · Mid-market",
    initials: "SM",
    votes: 51,
    replies: 24,
    views: "3,140",
    posted: "9h ago",
    lastReplyBy: "RJ",
    lastReplyAt: "1h ago",
    replyList: [
      {
        id: "r1",
        author: "Ritika Joshi",
        role: "Engineering Manager · D2C brand",
        initials: "RJ",
        posted: "4h ago",
        body:
          "We do exactly this. The trick is a 'budget bucket' custom field on the cost-centre and a workflow condition that joins SUM(committed YTD) + line.amount against the bucket cap. Happy to share the JSON if useful.",
        votes: 28,
      },
    ],
  },
  {
    id: "t-webhook-fanout",
    status: "trending",
    category: "integrations",
    categoryLabel: "API & integrations",
    title: "Webhook fan-out: Bizak → Shopify, Razorpay, and our 3PL — clean pattern?",
    excerpt:
      "Sales order in Bizak should fire 3 downstream actions. Today we're polling. Anyone running the webhook + idempotency-key approach in production yet?",
    body:
      "We poll Bizak every 90s for new sales orders, then fan out to Shopify (mark fulfilled), Razorpay (capture authorisation), and our 3PL (create shipment). Polling is wasteful and slow. Want to flip to webhooks, but each downstream is at-least-once and we can't risk double-shipments. Looking for the idempotency-key pattern people are running in production and how you handle replay during the 3PL's occasional outages.",
    author: "Ritika Joshi",
    role: "Engineering Manager · D2C brand",
    initials: "RJ",
    votes: 44,
    replies: 19,
    views: "2,640",
    posted: "11h ago",
    lastReplyBy: "SB",
    lastReplyAt: "20m ago",
    replyList: [
      {
        id: "r1",
        author: "Sagar Bizak",
        role: "Solutions Engineer · Bizak",
        initials: "SB",
        posted: "5h ago",
        body:
          "The pattern that scales: SO id as the idempotency key for every downstream call, store {key, downstream, status, attempts} in your own table, and replay against missing/failed rows on a 5-minute cron. Bizak webhook signs the payload — verify before dispatch. Happy to share a reference repo if you want.",
        votes: 31,
      },
    ],
  },
  {
    id: "t-master-data-cleanup",
    status: "solved",
    category: "implementation",
    categoryLabel: "Implementation",
    title: "Master-data cleanup checklist before migration (the one I wish I'd had)",
    excerpt:
      "After two go-lives I've turned this into a 14-step doc covering chart of accounts, item master, customer master, opening balances. Sharing the full thing.",
    body:
      "Two go-lives in, here's the 14-step master-data cleanup that covered ~95% of issues: (1) freeze legacy edits 2 weeks before extract, (2) merge duplicate customers by tax-id, (3) close zero-activity items, (4) flatten chart of accounts to 3 levels, (5) reconcile opening AR/AP to GL, (6) round opening inventory to whole units, ... full doc in the link. Saves about 3 weeks of go-live grief.",
    author: "Dipesh Lama",
    role: "Implementation Partner",
    initials: "DL",
    votes: 132,
    replies: 56,
    views: "8,120",
    posted: "3d ago",
    lastReplyBy: "AK",
    lastReplyAt: "2h ago",
    replyList: [
      {
        id: "r1",
        author: "Anita Karki",
        role: "Plant Manager · Auto-parts",
        initials: "AK",
        posted: "1d ago",
        body:
          "Step 5 is the one that always gets us. We had a 0.4% AR mismatch between the legacy ledger and detail — 6 months later it was a 4% discrepancy nobody could trace. Reconcile before extract, every time.",
        votes: 41,
      },
    ],
  },
  {
    id: "t-quote-conversion",
    status: "open",
    category: "sales",
    categoryLabel: "Sales & CRM",
    title: "Tracking quote-to-order conversion across 4 sales reps — what to actually measure?",
    excerpt:
      "Beyond a simple win-rate, what KPIs actually correlate with sales coaching outcomes on Bizak? Trying to redesign our weekly pipeline review.",
    body:
      "Win-rate alone doesn't help with coaching — too lagging, too aggregate. Want metrics that point at where in the funnel a rep is leaking. Specifically: time-from-quote-to-first-touch, average revisions per quote before accept, and quote-decay-by-stage. Anyone built these on top of Bizak's CRM data?",
    author: "Kushal Rai",
    role: "Sales Director · B2B services",
    initials: "KR",
    votes: 28,
    replies: 14,
    views: "1,860",
    posted: "16h ago",
    lastReplyBy: "PA",
    lastReplyAt: "4h ago",
    replyList: [
      {
        id: "r1",
        author: "Priya Adhikari",
        role: "Group Controller · Manufacturing",
        initials: "PA",
        posted: "6h ago",
        body:
          "We added 'quote revisions before accept' to our weekly review and it changed the conversation overnight. Reps with 3+ revisions on average were almost always pricing-anxious — completely different coaching from the low-touch reps.",
        votes: 12,
      },
    ],
  },
  {
    id: "t-multi-entity",
    status: "open",
    category: "finance",
    categoryLabel: "Finance",
    title: "Multi-entity consolidation with intercompany eliminations — Bizak vs. spreadsheet?",
    excerpt:
      "Currently doing eliminations in Excel post-export. Curious whether the in-product consolidation is robust enough for our 7 entities + 3 currencies.",
    body:
      "We export from each entity, manually run eliminations in Excel, then re-import for consolidated reporting. Painful and error-prone. Bizak's consolidation module exists but I haven't seen anyone running it at our scale (7 entities, 3 functional currencies, intercompany loans + management fees). Anyone made the switch?",
    author: "Mariam Shakya",
    role: "Group CFO · Holding co.",
    initials: "MS",
    votes: 34,
    replies: 11,
    views: "1,540",
    posted: "1d ago",
    lastReplyBy: "DL",
    lastReplyAt: "5h ago",
    replyList: [
      {
        id: "r1",
        author: "Dipesh Lama",
        role: "Implementation Partner",
        initials: "DL",
        posted: "10h ago",
        body:
          "Yes, did this for an 8-entity group last year. The thing to plan for is the intercompany matching rules — set them up by counterparty + GL pair before you migrate, not after. Otherwise eliminations look right but the trial balance isn't.",
        votes: 19,
      },
    ],
  },
  {
    id: "t-tihar-forecast",
    status: "solved",
    category: "industry",
    categoryLabel: "Industry talk",
    title: "Distribution operators — how are you forecasting demand around Tihar / Diwali peak?",
    excerpt:
      "Three years on Bizak. Sharing the seasonality model that finally beat our gut feel — including the SKU groupings and the holiday calendar overlay.",
    body:
      "Sharing what works for us. Group SKUs into 4 demand-pattern clusters (steady, festive, weather, fad), apply a 3-year seasonality index per cluster, then overlay the religious holiday calendar (Tihar, Diwali, Dashain) as discrete uplift events. We're now within 6% of actual on the 4-week pre-festive window — used to be 22% off.",
    author: "Sandesh Khadka",
    role: "Ops Director · FMCG distribution",
    initials: "SK",
    votes: 67,
    replies: 22,
    views: "3,420",
    posted: "4d ago",
    lastReplyBy: "NS",
    lastReplyAt: "8h ago",
    replyList: [
      {
        id: "r1",
        author: "Nabin Shrestha",
        role: "Head of Supply Chain · Distribution",
        initials: "NS",
        posted: "2d ago",
        body:
          "Stealing this. The 4-cluster grouping is what we're missing — we treat everything as one pattern and it's killing the festive forecast. Going to retry this quarter.",
        votes: 18,
      },
    ],
  },
];

// ─── Status visual config ─────────────────────────────────────────────────────

const STATUS_CHIP: Record<
  ThreadStatus,
  { dot: string; label: string; chip: string; icon: LucideIcon }
> = {
  open: {
    dot: "bg-amber-400",
    label: "Open",
    chip: "bg-amber-50 text-amber-700",
    icon: HelpCircle,
  },
  solved: {
    dot: "bg-bz-sage",
    label: "Solved",
    chip: "bg-bz-sage-soft text-bz-sage",
    icon: CheckCircle2,
  },
  trending: {
    dot: "bg-bz-accent",
    label: "Trending",
    chip: "bg-bz-accent/20 text-bz-deep",
    icon: Flame,
  },
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function deriveInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "B";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  initials,
  size = "md",
  tone = "sage",
  status,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  tone?: "sage" | "deep" | "accent";
  status?: ThreadStatus;
}) {
  const sizeMap = {
    sm: "size-8 text-[11px]",
    md: "size-11 text-[13px]",
    lg: "size-14 text-[15px]",
  } as const;
  const toneMap = {
    sage: "bg-bz-sage-soft text-bz-sage",
    deep: "bg-bz-deep text-white",
    accent: "bg-bz-accent text-bz-deep",
  } as const;
  return (
    <span className="relative inline-block shrink-0">
      <span
        className={[
          "inline-flex items-center justify-center rounded-full font-bold",
          sizeMap[size],
          toneMap[tone],
        ].join(" ")}
      >
        {initials}
      </span>
      {status && (
        <span
          aria-hidden
          className={[
            "absolute -bottom-0.5 -right-0.5 inline-flex size-3.5 items-center justify-center rounded-full border-2 border-bz-surface",
            STATUS_CHIP[status].dot,
          ].join(" ")}
        />
      )}
    </span>
  );
}

// ─── LoginDialog ──────────────────────────────────────────────────────────────

function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
  intent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (u: User) => void;
  intent?: "ask" | "reply" | null;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when reopened
  useEffect(() => {
    if (open) {
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Tell us your name so the community can address you properly.");
      return;
    }
    setSubmitting(true);
    // Dummy: pretend to make a request, then succeed
    setTimeout(() => {
      const finalName =
        mode === "signup"
          ? name.trim()
          : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) =>
              c.toUpperCase(),
            );
      onSuccess({
        name: finalName,
        email: email.trim(),
        initials: deriveInitials(finalName),
        role: mode === "signup" ? "New community member" : "Bizak operator",
      });
    }, 350);
  }

  const intentMessage =
    intent === "ask"
      ? "Sign in to ask the community a question."
      : intent === "reply"
        ? "Sign in to reply to this thread."
        : "Sign in to join the conversation.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-bz-border bg-bz-surface p-0 sm:max-w-[440px]">
        <DialogTitle className="sr-only">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </DialogTitle>
        <DialogDescription className="sr-only">{intentMessage}</DialogDescription>

        {/* Header band */}
        <div className="relative overflow-hidden bg-bz-deep px-7 pb-7 pt-9 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-[180px] w-[180px] rounded-full bg-bz-accent/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-[160px] w-[160px] rounded-full bg-bz-sage/15 blur-3xl"
          />
          <div className="relative">
            <PillBadge tone="accent" dot>
              Bizak Community
            </PillBadge>
            <h2 className="mt-3 text-[24px] font-bold leading-[1.15] tracking-[-0.02em]">
              {mode === "signin"
                ? "Welcome back."
                : "Create your account."}
            </h2>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-white/65">
              {intentMessage}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-7 py-7">
          {mode === "signup" && (
            <FormField
              label="Full name"
              icon={UserIcon}
              type="text"
              value={name}
              onChange={setName}
              placeholder="e.g. Priya Adhikari"
              autoFocus
            />
          )}
          <FormField
            label="Work email"
            icon={AtSign}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
            autoFocus={mode === "signin"}
          />
          <FormField
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
          />

          {error && (
            <div className="rounded-bz-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex h-[46px] items-center justify-center gap-1.5 rounded-bz-pill bg-bz-deep px-5 text-[14px] font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="size-3 animate-pulse rounded-full bg-bz-accent" />
                {mode === "signin" ? "Signing in…" : "Creating your account…"}
              </>
            ) : (
              <>
                <LogIn className="size-[15px]" strokeWidth={2} />
                {mode === "signin" ? "Sign in" : "Create account"}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[12.5px] text-bz-text-soft">
            {mode === "signin"
              ? "New to the community?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
              <ArrowRight className="ml-0.5 inline size-[12px]" strokeWidth={2.4} />
            </button>
          </div>

          <p className="mt-1 text-center text-[11px] leading-[1.5] text-bz-text-soft">
            Demo experience — any details work. No data leaves your browser.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  icon: LucideIcon;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
        {label}
      </span>
      <span className="flex h-[46px] items-center gap-2.5 rounded-bz-md border border-bz-border bg-bz-surface px-3.5 transition-colors focus-within:border-bz-sage-mid focus-within:shadow-[0_0_0_3px_rgba(122,130,109,0.12)]">
        <Icon
          className="size-[15px] shrink-0 text-bz-text-soft"
          strokeWidth={1.8}
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-[14px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
        />
      </span>
    </label>
  );
}

// ─── ComposeDialog ────────────────────────────────────────────────────────────

function ComposeDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User;
  onSubmit: (data: {
    title: string;
    body: string;
    category: Exclude<CategoryKey, "all">;
    categoryLabel: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Exclude<CategoryKey, "all">>(
    "finance",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setCategory("finance");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const titleOk = title.trim().length >= 12;
  const bodyOk = body.trim().length >= 30;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!titleOk) {
      setError("Give your question a title of at least 12 characters.");
      return;
    }
    if (!bodyOk) {
      setError("Add 30+ characters of context — what have you tried?");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const found = COMPOSE_CATEGORIES.find((c) => c.key === category)!;
      onSubmit({
        title: title.trim(),
        body: body.trim(),
        category,
        categoryLabel: found.label,
      });
    }, 250);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-bz-border bg-bz-surface p-0 sm:max-w-[640px]">
        <DialogTitle className="sr-only">Ask the community</DialogTitle>
        <DialogDescription className="sr-only">
          Post a new question to the Bizak community forum.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-bz-border px-7 py-5">
          <Avatar initials={user.initials} size="md" tone="sage" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-bz-sage">
              Posting as
            </div>
            <div className="truncate text-[14px] font-bold text-bz-text">
              {user.name}
            </div>
          </div>
          <PillBadge tone="neutral">New question</PillBadge>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-7 py-6">
          {/* Title */}
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                Title
              </span>
              <span
                className={[
                  "text-[11px] tabular-nums",
                  titleOk ? "text-bz-sage" : "text-bz-text-soft",
                ].join(" ")}
              >
                {title.length} / 120
              </span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder="Be specific — what are you trying to do?"
              autoFocus
              className="h-[48px] rounded-bz-md border border-bz-border bg-bz-surface px-3.5 text-[15px] font-semibold text-bz-text transition-colors placeholder:font-normal placeholder:text-bz-text-soft focus:border-bz-sage-mid focus:shadow-[0_0_0_3px_rgba(122,130,109,0.12)] focus:outline-none"
            />
          </label>

          {/* Category picker */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
              Category
            </span>
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-max flex-nowrap gap-2">
                {COMPOSE_CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const isActive = c.key === category;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(c.key)}
                      className={[
                        "inline-flex shrink-0 items-center gap-1.5 rounded-bz-pill border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                        isActive
                          ? "border-bz-sage-mid bg-bz-sage-soft text-bz-sage"
                          : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:text-bz-text",
                      ].join(" ")}
                    >
                      <Icon className="size-[13px]" strokeWidth={1.8} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body */}
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                What's the question?
              </span>
              <span
                className={[
                  "text-[11px] tabular-nums",
                  bodyOk ? "text-bz-sage" : "text-bz-text-soft",
                ].join(" ")}
              >
                {body.length} chars
              </span>
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What were you trying to do, what did you try, what did you see? Specifics get specific answers."
              rows={6}
              className="resize-none rounded-bz-md border border-bz-border bg-bz-surface px-3.5 py-3 text-[14px] leading-[1.65] text-bz-text transition-colors placeholder:text-bz-text-soft focus:border-bz-sage-mid focus:shadow-[0_0_0_3px_rgba(122,130,109,0.12)] focus:outline-none"
            />
          </label>

          {error && (
            <div className="rounded-bz-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-bz-border-soft pt-5">
            <p className="max-w-[280px] text-[11.5px] leading-[1.5] text-bz-text-soft">
              Tip: include what you've tried. The forum's best answers come
              from threads that share the boring details.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-[42px] items-center justify-center rounded-bz-pill border border-bz-border bg-bz-surface px-4 text-[13px] font-semibold text-bz-text-muted transition-colors hover:border-bz-sage-mid hover:text-bz-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-bz-pill bg-bz-deep px-5 text-[13px] font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Posting…" : "Post question"}
                <Send className="size-[13px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({
  user,
  onAsk,
  onSignOut,
}: {
  user: User | null;
  onAsk: () => void;
  onSignOut: () => void;
}) {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* Left — text */}
          <div className="max-w-[640px]">
            <HeroBadge>Bizak Community</HeroBadge>
            <h1 className="mt-4 text-[clamp(40px,5.2vw,60px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              Ask the people who{" "}
              <span className="relative inline-block">
                actually run Bizak
                <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
              </span>
              .
            </h1>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.7] text-bz-text-muted">
              A simple forum for Bizak operators — finance, ops, manufacturing,
              and developers asking how-to questions and trading the runbooks
              that actually moved the number.
            </p>

            {user ? (
              <div className="mt-8 flex flex-wrap items-center gap-4 rounded-bz-2xl border border-bz-border bg-bz-surface px-4 py-3">
                <Avatar initials={user.initials} size="md" tone="sage" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold text-bz-text">
                    Welcome back, {user.name.split(" ")[0]}.
                  </div>
                  <div className="truncate text-[12px] text-bz-text-soft">
                    Signed in · {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onAsk}
                  className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-bz-pill bg-bz-deep px-4 text-[13px] font-bold text-white transition-colors hover:bg-black"
                >
                  <Plus className="size-[14px]" strokeWidth={2.4} />
                  Ask a question
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  aria-label="Sign out"
                  className="inline-flex size-9 items-center justify-center rounded-bz-pill text-bz-text-soft transition-colors hover:bg-bz-bg hover:text-bz-text"
                  title="Sign out"
                >
                  <LogOut className="size-[15px]" strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md" onClick={onAsk} withArrow>
                  Ask a question
                </Button>
                <Button variant="ghost" size="md" href="#forum">
                  Browse threads
                </Button>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle
                  className="size-[14px] text-bz-sage"
                  strokeWidth={1.8}
                />
                12,200 questions resolved
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Median first reply &lt; 6 hours</span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Free to read &amp; post</span>
            </div>
          </div>

          {/* Right — live thread preview */}
          <div className="relative mx-auto w-full max-w-[460px] lg:mx-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-3 left-3 right-3 h-[88%] rounded-bz-2xl border border-bz-border bg-bz-surface/70"
            />

            <div className="relative rounded-bz-2xl border border-bz-border bg-bz-surface p-7 shadow-[0_24px_64px_rgba(15,17,14,0.10)]">
              <div className="flex items-start gap-3">
                <Avatar initials="PA" size="md" tone="sage" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-bold text-bz-text">
                      Priya Adhikari
                    </span>
                    <span
                      aria-hidden
                      className="size-1 rounded-full bg-bz-text-soft/40"
                    />
                    <span className="truncate text-[12px] text-bz-text-soft">
                      2d ago
                    </span>
                  </div>
                  <div className="truncate text-[12px] text-bz-text-soft">
                    Group Controller · Manufacturing
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-accent/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-bz-deep">
                  <Flame className="size-[10px]" strokeWidth={2.4} />
                  Trending
                </span>
              </div>

              <h3 className="mt-5 text-[19px] font-bold leading-[1.3] tracking-[-0.01em] text-bz-text">
                How are you cutting month-end close from 9 days to under 48 hours?
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.65] text-bz-text-muted">
                Looking for the runbook — auto-posting rules, bank-feed cadence,
                and the reconciliation queues you run in parallel.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillBadge tone="sage">Financial Management</PillBadge>
                <PillBadge tone="neutral">Best practice</PillBadge>
              </div>

              <div className="mt-6 ml-5 rounded-bz-xl border border-bz-sage-mid/30 bg-bz-sage-soft/40 p-4">
                <div className="flex items-center gap-2.5">
                  <Avatar initials="SB" size="sm" tone="deep" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-bold text-bz-text">
                        Sagar Bizak
                      </span>
                      <span className="rounded-bz-pill bg-bz-deep px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-white">
                        Bizak team
                      </span>
                    </div>
                    <div className="truncate text-[11px] text-bz-text-soft">
                      Solutions Engineer · 1d ago
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-bz-pill bg-bz-sage px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    <CheckCircle2 className="size-[10px]" strokeWidth={2.5} />
                    Solution
                  </span>
                </div>
                <p className="mt-3 text-[12.5px] leading-[1.6] text-bz-text">
                  Three things matter: auto-posting for recurring journals,
                  daily bank-feed match instead of monthly, and parallel
                  reconciliation queues. 40+ teams cut close to under 2 days
                  with this exact pattern.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-5 border-t border-bz-border pt-4 text-[12.5px]">
                <span className="inline-flex items-center gap-1.5">
                  <ArrowUp className="size-[13px] text-bz-sage" strokeWidth={2.5} />
                  <span className="font-bold tabular-nums text-bz-text">214</span>
                  <span className="text-bz-text-soft">votes</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle
                    className="size-[13px] text-bz-text-soft"
                    strokeWidth={2}
                  />
                  <span className="font-bold tabular-nums text-bz-text">87</span>
                  <span className="text-bz-text-soft">replies</span>
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage">
                  Open thread
                  <ArrowUpRight className="size-[12px]" strokeWidth={2.2} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Thread row ───────────────────────────────────────────────────────────────

function ThreadRow({
  thread,
  divider,
  onSelect,
}: {
  thread: Thread;
  divider: boolean;
  onSelect: (t: Thread) => void;
}) {
  const status = STATUS_CHIP[thread.status];
  const StatusIcon = status.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(thread)}
      className={[
        "group flex w-full flex-col gap-5 px-6 py-6 text-left transition-colors hover:bg-bz-bg/60 md:flex-row md:items-start md:gap-6 md:px-8 md:py-7",
        divider ? "border-b border-bz-border-soft" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 md:w-[160px] md:flex-col md:items-start md:gap-3">
        <Avatar
          initials={thread.initials}
          size="md"
          tone={thread.isYou ? "deep" : "sage"}
          status={thread.status}
        />
        <div className="min-w-0 leading-tight md:mt-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate text-[13px] font-semibold text-bz-text">
              {thread.author}
            </span>
            {thread.isYou && (
              <span className="rounded-bz-pill bg-bz-accent/25 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-bz-deep">
                You
              </span>
            )}
          </div>
          <div className="truncate text-[11.5px] text-bz-text-soft">
            {thread.role}
          </div>
          <div className="mt-1 hidden text-[11px] uppercase tracking-[0.08em] text-bz-text-soft md:block">
            Posted {thread.posted}
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-1 rounded-bz-pill px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]",
              status.chip,
            ].join(" ")}
          >
            <StatusIcon className="size-[11px]" strokeWidth={2.4} />
            {status.label}
          </span>
          <PillBadge tone="neutral">{thread.categoryLabel}</PillBadge>
        </div>

        <h3 className="mt-3 text-[17px] font-bold leading-[1.35] tracking-[-0.01em] text-bz-text transition-colors group-hover:text-bz-sage md:text-[18px]">
          {thread.title}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-[680px] text-[14px] leading-[1.65] text-bz-text-muted">
          {thread.excerpt}
        </p>

        {thread.lastReplyBy && (
          <div className="mt-4 flex items-center gap-2 text-[12px] text-bz-text-soft">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-bz-bg text-[10px] font-bold text-bz-text">
              {thread.lastReplyBy}
            </span>
            <span>
              Latest reply{" "}
              <span className="font-semibold text-bz-text">
                {thread.lastReplyAt}
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 border-t border-bz-border-soft pt-4 md:flex-col md:items-end md:gap-4 md:border-t-0 md:pt-0">
        <span className="inline-flex items-center gap-1.5 text-[13px]">
          <ArrowUp className="size-[14px] text-bz-sage" strokeWidth={2.5} />
          <span className="font-bold tabular-nums text-bz-text">
            {thread.votes}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px]">
          <MessageCircle
            className="size-[13px] text-bz-text-soft"
            strokeWidth={2}
          />
          <span className="font-bold tabular-nums text-bz-text">
            {thread.replies}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-bz-text-soft">
          <Eye className="size-[13px]" strokeWidth={2} />
          <span className="tabular-nums">{thread.views}</span>
        </span>
      </div>
    </button>
  );
}

// ─── Forum section ────────────────────────────────────────────────────────────

function ForumSection({
  threads,
  onSelectThread,
  onAsk,
}: {
  threads: Thread[];
  onSelectThread: (t: Thread) => void;
  onAsk: () => void;
}) {
  const [status, setStatus] = useState<StatusKey>("all");
  const [category, setCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<CategoryKey, number> = {
      all: threads.length,
      finance: 0, inventory: 0, manufacturing: 0, sales: 0,
      workflow: 0, integrations: 0, implementation: 0, industry: 0,
    };
    threads.forEach((t) => {
      map[t.category] += 1;
    });
    return map;
  }, [threads]);

  const filtered = useMemo(() => {
    let list = threads;
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (status !== "all") {
      list = list.filter((t) => t.status === status);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.excerpt.toLowerCase().includes(q),
      );
    }
    return list;
  }, [threads, status, category, query]);

  const reset = () => {
    setStatus("all");
    setCategory("all");
    setQuery("");
  };

  const isFiltered =
    status !== "all" || category !== "all" || query.trim() !== "";

  return (
    <Section tone="white" pad="default" id="forum">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[560px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-bz-sage">
              The forum
            </span>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              Real questions, from real operators.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-bz-text-muted">
              How-to questions, debugging help, and the playbooks people are
              shipping. Pick a category, scan the threads, jump into the one
              that helps you.
            </p>
          </div>

          <button
            type="button"
            onClick={onAsk}
            className="inline-flex h-[44px] items-center justify-center gap-1.5 rounded-bz-pill bg-bz-deep px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-black"
          >
            <Plus className="size-[14px]" strokeWidth={2.4} />
            Ask a question
          </button>
        </div>

        {/* Search */}
        <div className="mt-10">
          <div className="flex h-[54px] items-center gap-3 rounded-bz-pill border border-bz-border bg-bz-surface pl-5 pr-2 shadow-[0_8px_28px_rgba(15,17,14,0.06)] focus-within:border-bz-sage-mid focus-within:shadow-[0_12px_36px_rgba(15,17,14,0.08)]">
            <Search
              className="size-5 shrink-0 text-bz-text-soft"
              strokeWidth={1.8}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search threads — close, OEE, webhook, landed cost…"
              aria-label="Search the forum"
              className="flex-1 bg-transparent text-[15px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="inline-flex size-8 items-center justify-center rounded-bz-pill text-bz-text-soft transition-colors hover:bg-bz-bg hover:text-bz-text"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 -mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
          <div className="inline-flex min-w-max items-center gap-1 rounded-bz-pill border border-bz-border bg-bz-surface p-1">
            {STATUS_FILTERS.map((s) => {
              const SIcon = s.icon;
              const isActive = s.key === status;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  aria-pressed={isActive}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-bz-pill px-4 py-2 text-[12.5px] font-semibold transition-colors",
                    isActive
                      ? "bg-bz-deep text-white"
                      : "text-bz-text-muted hover:text-bz-text",
                  ].join(" ")}
                >
                  <SIcon
                    className={[
                      "size-[13px]",
                      isActive ? "text-bz-accent" : "text-bz-text-soft",
                    ].join(" ")}
                    strokeWidth={2}
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 -mx-6 overflow-x-auto px-6 pb-1 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex min-w-max flex-nowrap items-center gap-2 lg:min-w-0 lg:flex-wrap">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isActive = c.key === category;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  aria-pressed={isActive}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-bz-pill border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                    isActive
                      ? "border-bz-sage-mid bg-bz-sage-soft text-bz-sage"
                      : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:text-bz-text",
                  ].join(" ")}
                >
                  <Icon className="size-[13px]" strokeWidth={1.8} />
                  {c.label}
                  <span
                    className={[
                      "rounded-bz-pill px-1.5 text-[10.5px] font-bold tabular-nums",
                      isActive ? "bg-bz-sage/15" : "bg-bz-bg",
                    ].join(" ")}
                  >
                    {counts[c.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-bz-border pb-4">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-bz-text">
            {filtered.length}{" "}
            <span className="font-normal text-bz-text-soft">
              {filtered.length === 1 ? "thread" : "threads"}
              {isFiltered ? " match your filters" : " in the forum"}
            </span>
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-bz-sage transition-colors hover:text-bz-sage-hover"
            >
              <X className="size-[12px]" strokeWidth={2.2} />
              Clear filters
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-surface">
            {filtered.map((t, i) => (
              <ThreadRow
                key={t.id}
                thread={t}
                divider={i !== filtered.length - 1}
                onSelect={onSelectThread}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center rounded-bz-2xl border border-dashed border-bz-border bg-bz-bg px-8 py-16 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-bz-pill bg-bz-surface text-bz-text-soft">
              <Search className="size-5" strokeWidth={1.8} />
            </span>
            <h3 className="mt-5 text-[20px] font-bold tracking-[-0.01em] text-bz-text">
              No threads match your filters
            </h3>
            <p className="mt-2 max-w-[420px] text-[14px] leading-[1.65] text-bz-text-muted">
              Try a different search term, switch category, or be the first to
              start the conversation.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-bz-pill border border-bz-border bg-bz-surface px-4 py-2 text-[13px] font-semibold text-bz-text transition-colors hover:border-bz-sage-mid hover:text-bz-sage"
              >
                Reset filters
                <ArrowRight className="size-[13px]" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={onAsk}
                className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-deep px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-black"
              >
                Ask a question
                <ArrowRight className="size-[13px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}

// ─── Thread detail view ───────────────────────────────────────────────────────

function ReplyCard({ reply }: { reply: Reply }) {
  const isHighlight = reply.isSolution;
  return (
    <div
      className={[
        "rounded-bz-2xl border p-6 transition-colors",
        isHighlight
          ? "border-bz-sage-mid/40 bg-bz-sage-soft/40"
          : reply.isYou
            ? "border-bz-accent/40 bg-bz-accent/10"
            : "border-bz-border bg-bz-surface",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <Avatar
          initials={reply.initials}
          size="md"
          tone={reply.isBizakTeam ? "deep" : reply.isYou ? "accent" : "sage"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold text-bz-text">
              {reply.author}
            </span>
            {reply.isBizakTeam && (
              <span className="rounded-bz-pill bg-bz-deep px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                Bizak team
              </span>
            )}
            {reply.isYou && (
              <span className="rounded-bz-pill bg-bz-accent/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-deep">
                You
              </span>
            )}
            {reply.isSolution && (
              <span className="inline-flex items-center gap-1 rounded-bz-pill bg-bz-sage px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                <CheckCircle2 className="size-[10px]" strokeWidth={2.5} />
                Solution
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[12px] text-bz-text-soft">
            {reply.role} · {reply.posted}
          </div>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line text-[14.5px] leading-[1.7] text-bz-text">
        {reply.body}
      </p>

      <div className="mt-5 flex items-center gap-4 border-t border-bz-border-soft pt-4 text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 text-bz-text-muted">
          <ArrowUp className="size-[13px] text-bz-sage" strokeWidth={2.5} />
          <span className="font-bold tabular-nums text-bz-text">
            {reply.votes}
          </span>
          <span className="text-bz-text-soft">votes</span>
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-bz-text-soft transition-colors hover:text-bz-sage"
        >
          <MessageCircle className="size-[12px]" strokeWidth={2} />
          Reply
        </button>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1 text-bz-text-soft transition-colors hover:text-bz-sage"
        >
          <Share2 className="size-[12px]" strokeWidth={2} />
          Share
        </button>
      </div>
    </div>
  );
}

function ThreadDetailView({
  thread,
  user,
  onBack,
  onReply,
  onRequireLogin,
}: {
  thread: Thread;
  user: User | null;
  onBack: () => void;
  onReply: (threadId: string, body: string) => void;
  onRequireLogin: () => void;
}) {
  const [replyBody, setReplyBody] = useState("");
  const [posting, setPosting] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const status = STATUS_CHIP[thread.status];
  const StatusIcon = status.icon;

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      onRequireLogin();
      return;
    }
    const body = replyBody.trim();
    if (body.length < 8) return;
    setPosting(true);
    setTimeout(() => {
      onReply(thread.id, body);
      setReplyBody("");
      setPosting(false);
    }, 250);
  }

  return (
    <Section tone="white" pad="default">
      <Container width="narrow">
        {/* Back nav */}
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-text-muted transition-colors hover:text-bz-sage"
        >
          <ArrowLeft
            className="size-[14px] transition-transform group-hover:-translate-x-0.5"
            strokeWidth={2.4}
          />
          Back to all threads
        </button>

        {/* Question */}
        <div className="mt-8 rounded-bz-2xl border border-bz-border bg-bz-surface p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1 rounded-bz-pill px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]",
                status.chip,
              ].join(" ")}
            >
              <StatusIcon className="size-[11px]" strokeWidth={2.4} />
              {status.label}
            </span>
            <PillBadge tone="sage">{thread.categoryLabel}</PillBadge>
          </div>

          <h1 className="mt-4 text-[clamp(24px,3vw,32px)] font-bold leading-[1.2] tracking-[-0.02em] text-bz-text">
            {thread.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Avatar
              initials={thread.initials}
              size="md"
              tone={thread.isYou ? "deep" : "sage"}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-bz-text">
                  {thread.author}
                </span>
                {thread.isYou && (
                  <span className="rounded-bz-pill bg-bz-accent/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-deep">
                    You
                  </span>
                )}
              </div>
              <div className="text-[12.5px] text-bz-text-soft">
                {thread.role}
              </div>
            </div>
            <span aria-hidden className="hidden h-5 w-px bg-bz-border md:block" />
            <span className="text-[12.5px] text-bz-text-soft">
              Posted {thread.posted}
            </span>
          </div>

          <p className="mt-6 whitespace-pre-line text-[15.5px] leading-[1.75] text-bz-text">
            {thread.body}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-bz-border pt-5 text-[13px] text-bz-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <ArrowUp className="size-[14px] text-bz-sage" strokeWidth={2.5} />
              <span className="font-bold tabular-nums text-bz-text">
                {thread.votes}
              </span>
              <span>votes</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle
                className="size-[13px] text-bz-text-soft"
                strokeWidth={2}
              />
              <span className="font-bold tabular-nums text-bz-text">
                {thread.replies}
              </span>
              <span>replies</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye
                className="size-[13px] text-bz-text-soft"
                strokeWidth={2}
              />
              <span className="font-bold tabular-nums text-bz-text">
                {thread.views}
              </span>
              <span>views</span>
            </span>
          </div>
        </div>

        {/* Replies header */}
        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3 border-b border-bz-border pb-4">
          <h2 className="text-[18px] font-bold tracking-[-0.01em] text-bz-text">
            {thread.replyList.length}{" "}
            {thread.replyList.length === 1 ? "reply" : "replies"}
          </h2>
          <span className="text-[12.5px] text-bz-text-soft">
            Sorted oldest first
          </span>
        </div>

        {/* Replies */}
        <div className="mt-6 flex flex-col gap-4">
          {thread.replyList.map((r) => (
            <ReplyCard key={r.id} reply={r} />
          ))}
          {thread.replyList.length === 0 && (
            <div className="rounded-bz-2xl border border-dashed border-bz-border bg-bz-bg px-6 py-12 text-center">
              <p className="text-[14px] text-bz-text-muted">
                No replies yet — be the first to weigh in.
              </p>
            </div>
          )}
        </div>

        {/* Reply composer */}
        <div className="mt-10">
          {user ? (
            <form
              onSubmit={handleReplySubmit}
              className="rounded-bz-2xl border border-bz-border bg-bz-surface p-6"
            >
              <div className="flex items-start gap-4">
                <Avatar initials={user.initials} size="md" tone="accent" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-bz-text">
                      {user.name}
                    </span>
                    <span className="rounded-bz-pill bg-bz-accent/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-bz-deep">
                      You
                    </span>
                  </div>
                  <div className="text-[12px] text-bz-text-soft">
                    Replying to {thread.author}
                  </div>
                </div>
              </div>

              <textarea
                ref={replyRef}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Share what you've tried, paste the runbook, or add context. Specifics win."
                rows={5}
                className="mt-4 w-full resize-none rounded-bz-md border border-bz-border bg-bz-surface px-3.5 py-3 text-[14px] leading-[1.65] text-bz-text transition-colors placeholder:text-bz-text-soft focus:border-bz-sage-mid focus:shadow-[0_0_0_3px_rgba(122,130,109,0.12)] focus:outline-none"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11.5px] text-bz-text-soft">
                  Posting as <span className="font-bold text-bz-text">{user.name}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyBody("")}
                    disabled={!replyBody.trim()}
                    className="inline-flex h-[40px] items-center justify-center rounded-bz-pill border border-bz-border bg-bz-surface px-4 text-[12.5px] font-semibold text-bz-text-muted transition-colors hover:border-bz-sage-mid hover:text-bz-text disabled:opacity-40"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={posting || replyBody.trim().length < 8}
                    className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-bz-pill bg-bz-deep px-5 text-[12.5px] font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {posting ? "Posting…" : "Post reply"}
                    <Send className="size-[12px]" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-bz-2xl border border-bz-border bg-bz-bg p-7 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-11 items-center justify-center rounded-bz-pill bg-bz-surface text-bz-text-soft">
                  <Lock className="size-[16px]" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-[15.5px] font-bold tracking-[-0.005em] text-bz-text">
                    Sign in to reply
                  </h3>
                  <p className="mt-1 max-w-[420px] text-[13px] leading-[1.6] text-bz-text-muted">
                    The community is free to read. To answer or post, you'll
                    need a Bizak Community account — takes 30 seconds.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequireLogin}
                className="inline-flex h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-bz-pill bg-bz-deep px-5 text-[13px] font-bold text-white transition-colors hover:bg-black"
              >
                <LogIn className="size-[13px]" strokeWidth={2} />
                Sign in to reply
              </button>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

// ─── Bottom strip ─────────────────────────────────────────────────────────────

function BottomStrip({
  user,
  onAsk,
}: {
  user: User | null;
  onAsk: () => void;
}) {
  return (
    <Section tone="light" pad="compact">
      <Container width="narrow">
        <div className="relative overflow-hidden rounded-bz-2xl bg-bz-deep p-9 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-bz-accent/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-[220px] w-[220px] rounded-full bg-bz-sage/15 blur-3xl"
          />

          <div className="relative grid grid-cols-1 items-end gap-8 md:grid-cols-[1.1fr_1fr]">
            <div>
              <PillBadge tone="accent" dot>
                {user ? "Welcome back" : "Got a question?"}
              </PillBadge>
              <h2 className="mt-4 text-[clamp(24px,3vw,34px)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                {user
                  ? `Ready to help, ${user.name.split(" ")[0]}?`
                  : "Ask the operators who've already shipped it."}
              </h2>
              <p className="mt-3 max-w-[480px] text-[14.5px] leading-[1.7] text-white/65">
                {user
                  ? "You're signed in. Open a thread to reply, or ask your own question — median first answer comes back inside 6 hours."
                  : "Free to read, free to post. Median first reply under six hours — and the answers come from operators running real businesses on Bizak, not a support script."}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <button
                type="button"
                onClick={onAsk}
                className="inline-flex h-[48px] items-center justify-center gap-1.5 rounded-bz-pill bg-bz-accent px-6 text-[14px] font-bold text-bz-deep transition-transform hover:scale-[1.02]"
              >
                {user ? (
                  <>
                    <Plus className="size-[14px]" strokeWidth={2.4} />
                    Ask a question
                  </>
                ) : (
                  <>
                    <LogIn className="size-[14px]" strokeWidth={2.4} />
                    Create your account
                  </>
                )}
                <ArrowRight className="size-[14px]" strokeWidth={2.4} />
              </button>
              <a
                href="/HelpCenter"
                className="inline-flex h-[44px] items-center justify-center rounded-bz-pill border border-white/15 bg-white/[0.04] px-5 text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/[0.08]"
              >
                Visit the Help Center
              </a>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles
                    className="size-3.5 text-bz-accent"
                    strokeWidth={1.8}
                  />
                  18,400+ members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-bz-accent"
                    strokeWidth={1.8}
                  />
                  94% answered
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CommunityForum() {
  const [user, setUser] = useState<User | null>(null);
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [intent, setIntent] = useState<"ask" | "reply" | null>(null);

  const selectedThread = useMemo(
    () => (selectedThreadId ? threads.find((t) => t.id === selectedThreadId) ?? null : null),
    [threads, selectedThreadId],
  );

  // Scroll to top when navigating between list <-> detail
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedThreadId]);

  function openLoginWithIntent(next: "ask" | "reply" | null) {
    setIntent(next);
    setLoginOpen(true);
  }

  function handleAskRequest() {
    if (user) {
      setComposeOpen(true);
    } else {
      openLoginWithIntent("ask");
    }
  }

  function handleLoginSuccess(u: User) {
    setUser(u);
    setLoginOpen(false);
    if (intent === "ask") {
      setComposeOpen(true);
    }
    setIntent(null);
  }

  function handleSignOut() {
    setUser(null);
    setIntent(null);
  }

  function handleSubmitThread(data: {
    title: string;
    body: string;
    category: Exclude<CategoryKey, "all">;
    categoryLabel: string;
  }) {
    if (!user) return;
    const newThread: Thread = {
      id: makeId("t"),
      status: "open",
      category: data.category,
      categoryLabel: data.categoryLabel,
      title: data.title,
      excerpt: data.body.slice(0, 200),
      body: data.body,
      author: user.name,
      role: user.role,
      initials: user.initials,
      votes: 0,
      replies: 0,
      views: "1",
      posted: "Just now",
      replyList: [],
      isYou: true,
    };
    setThreads((prev) => [newThread, ...prev]);
    setComposeOpen(false);
    setSelectedThreadId(newThread.id);
  }

  function handleReply(threadId: string, body: string) {
    if (!user) return;
    const newReply: Reply = {
      id: makeId("r"),
      author: user.name,
      role: user.role,
      initials: user.initials,
      posted: "Just now",
      body,
      votes: 0,
      isYou: true,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              replies: t.replies + 1,
              lastReplyBy: user.initials,
              lastReplyAt: "Just now",
              replyList: [...t.replyList, newReply],
            }
          : t,
      ),
    );
  }

  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        {selectedThread ? (
          <ThreadDetailView
            thread={selectedThread}
            user={user}
            onBack={() => setSelectedThreadId(null)}
            onReply={handleReply}
            onRequireLogin={() => openLoginWithIntent("reply")}
          />
        ) : (
          <>
            <HeroSection
              user={user}
              onAsk={handleAskRequest}
              onSignOut={handleSignOut}
            />
            <ForumSection
              threads={threads}
              onSelectThread={(t) => setSelectedThreadId(t.id)}
              onAsk={handleAskRequest}
            />
            <BottomStrip user={user} onAsk={handleAskRequest} />
          </>
        )}
      </main>
      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={(v) => {
          setLoginOpen(v);
          if (!v) setIntent(null);
        }}
        onSuccess={handleLoginSuccess}
        intent={intent}
      />
      {user && (
        <ComposeDialog
          open={composeOpen}
          onOpenChange={setComposeOpen}
          user={user}
          onSubmit={handleSubmitThread}
        />
      )}
    </div>
  );
}
