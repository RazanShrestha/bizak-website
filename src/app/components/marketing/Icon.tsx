import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle,
  Circle,
  ClipboardCheck,
  Clock,
  CreditCard,
  DollarSign,
  EyeOff,
  Factory,
  FilePen,
  FileText,
  Filter,
  Folder,
  GitBranch,
  Globe,
  Handshake,
  Inbox,
  Layers,
  LineChart,
  List,
  LocateFixed,
  MessageSquare,
  Monitor,
  Network,
  Package,
  Play,
  Receipt,
  RefreshCw,
  Repeat,
  Rocket,
  Search,
  SearchCheck,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Star,
  Tag,
  Target,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";

const REGISTRY: Record<string, LucideIcon> = {
  // shared
  play: Play,
  "check-circle": CheckCircle,
  bell: Bell,
  package: Package,
  list: List,
  truck: Truck,
  globe: Globe,
  search: Search,
  cart: ShoppingCart,
  shield: Shield,
  inventory: Package,
  hub: Network,
  insights: LineChart,
  receipt: Receipt,
  invoice: FileText,
  star: Star,
  "credit-card": CreditCard,
  "file-text": FileText,
  rocket: Rocket,

  // manufacturing
  "work-order": ClipboardCheck,
  bom: Boxes,
  floor: Factory,
  quality: ShieldCheck,
  mrp: RefreshCw,
  downtime: AlertTriangle,
  "edit-note": FilePen,
  defect: XCircle,
  cost: DollarSign,
  schedule: CalendarDays,
  source: ShoppingBag,
  inspect: SearchCheck,
  manufacturing: Factory,

  // distribution
  "eye-off": EyeOff,
  warehouse: Warehouse,
  bolt: Zap,
  settings: Settings,
  "account-tree": GitBranch,
  sync: RefreshCw,
  payments: CreditCard,
  inbox: Inbox,
  gps: LocateFixed,

  // professional services
  clock: Clock,
  briefcase: Briefcase,
  target: Target,
  users: Users,
  dollar: DollarSign,
  trending: TrendingUp,
  calendar: Calendar,
  alert: AlertTriangle,
  layers: Layers,
  message: MessageSquare,
  folder: Folder,
  repeat: Repeat,
  zap: Zap,
  handshake: Handshake,
  award: Award,
  book: BookOpen,
  activity: Activity,

  // retail & ecommerce
  tag: Tag,
  bar: BarChart3,
  funnel: Filter,
  smartphone: Smartphone,
  monitor: Monitor,
};

export type IconName = keyof typeof REGISTRY;

export interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Bizak global icon registry. Wraps lucide-react with the legacy
 * page-level name aliases (`work-order`, `bom`, `mrp`, etc.) so the four
 * "By Industry" pages and any future page can share one source of truth.
 *
 * Default `strokeWidth` is `1.8` to match the look the industry pages
 * were originally drawn against (lucide's default is `2`).
 *
 * Unknown names fall back to a circle, matching the original behavior.
 */
export function Icon({
  name,
  size = 24,
  strokeWidth = 1.8,
  className,
  style,
}: IconProps) {
  const Component = REGISTRY[name] ?? Circle;
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
    />
  );
}
