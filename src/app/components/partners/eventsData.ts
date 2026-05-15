import {
  Mic2,
  GraduationCap,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type EventType   = "Summit" | "Training" | "Webinar" | "Workshop";
export type EventFormat = "In-person" | "Virtual" | "Hybrid";

export interface PartnerEvent {
  slug: string;
  type: EventType;
  format: EventFormat;
  title: string;
  date: string;
  duration: string;
  location: string;
  speakers: string[];
  desc: string;
  Icon: LucideIcon;
  /** Long-form bullets shown on the register/enroll page. */
  highlights?: string[];
  /** Training-only module breakdown for the enrollment page. */
  curriculum?: { week: string; topic: string; hours: number }[];
  /** Training-only cohort meta. */
  cohort?: {
    seats: number;
    seatsTaken: number;
    priceLabel: string;
    feePartner: string;
    investmentNote: string;
  };
  /** Optional flagship flag (used to highlight in the calendar). */
  flagship?: boolean;
}

export const EVENTS: PartnerEvent[] = [
  {
    slug: "bizakconnect-2026",
    type: "Summit",
    format: "Hybrid",
    title: "BizakConnect 2026",
    date: "Sep 24–26, 2026",
    duration: "3 days",
    location: "Kathmandu + Live stream",
    speakers: ["Bizak Leadership", "Partner network", "Customer panels"],
    desc: "The annual partner summit. Three days of keynotes, breakouts, hands-on labs, the Partner Awards, and the network's biggest in-person gathering of the year.",
    Icon: Mic2,
    flagship: true,
    highlights: [
      "Keynotes from Bizak product, engineering, and partnerships leadership",
      "Breakouts across industry, technical, and go-to-market tracks",
      "Hands-on Architect Labs early access to Bizak v2.4",
      "The Partner Awards ceremony, live on the main stage",
      "Two evening networking events (in-person attendees)",
    ],
  },
  {
    slug: "solution-architect-cohort-12",
    type: "Training",
    format: "Virtual",
    title: "Solution Architect Certification Cohort 12",
    date: "Jun 3–28, 2026",
    duration: "4 wks · 32 hrs",
    location: "Live online",
    speakers: ["Bizak Architects", "Industry mentors"],
    desc: "Cohort-based deep dive into the Bizak data model, multi-entity, integrations, and migration playbooks. Exam on the final day.",
    Icon: GraduationCap,
    cohort: {
      seats: 60,
      seatsTaken: 41,
      priceLabel: "Free for active partners",
      feePartner: "First 3 seats per firm on us",
      investmentNote: "Subsequent seats: $1,200 / consultant",
    },
    curriculum: [
      { week: "Week 1", topic: "Bizak data model · entities · access · audit trail", hours: 8 },
      { week: "Week 2", topic: "Multi-entity, intercompany, consolidations",         hours: 8 },
      { week: "Week 3", topic: "Integrations · API · webhooks · OAuth scopes",       hours: 8 },
      { week: "Week 4", topic: "Migration playbooks + capstone exam",                 hours: 8 },
    ],
    highlights: [
      "Live cohort-paced 32 hours over 4 weeks",
      "Two architect-tier mentors per cohort",
      "Sandbox tenants seeded with industry data",
      "Exam on the final day · architect-tier badge on pass",
    ],
  },
  {
    slug: "fast-close-co-sell-playbook",
    type: "Webinar",
    format: "Virtual",
    title: "Closing Books in 5 Days A Co-Sell Playbook",
    date: "May 21, 2026",
    duration: "60 min",
    location: "Zoom",
    speakers: ["Bizak Finance team", "Northbeam Consulting"],
    desc: "How partners are pitching the 'fast close' story to mid-market CFOs. Includes objection-handling scripts and the live demo flow.",
    Icon: Video,
    highlights: [
      "Live demo of the 5-day close motion",
      "Objection-handling scripts for the top 6 CFO concerns",
      "Working artifacts pitch deck, ROI calculator, sample SOW",
      "Replay + chapter markers sent the next morning",
    ],
  },
  {
    slug: "apac-architects-day-bengaluru",
    type: "Workshop",
    format: "In-person",
    title: "South Asia Architects Day Bengaluru",
    date: "Jun 14, 2026",
    duration: "1 day",
    location: "Bengaluru, India",
    speakers: ["Atlas SI", "Lattice Solutions", "Bizak South Asia"],
    desc: "Whiteboard sessions on complex deployments. Network with regional architects, share migration patterns, get early access to v2.4 features.",
    Icon: Wrench,
    highlights: [
      "Whiteboard sessions on complex multi-entity deployments",
      "Migration pattern teardowns from Atlas SI and Lattice Solutions",
      "Early-access preview of Bizak v2.4 features",
      "Closed-room peer roundtable for senior architects",
    ],
  },
  {
    slug: "manufacturing-live-oee-30min",
    type: "Webinar",
    format: "Virtual",
    title: "Manufacturing Showcase Live OEE in 30 Minutes",
    date: "Jun 4, 2026",
    duration: "45 min",
    location: "Zoom",
    speakers: ["Bizak Manufacturing", "Verdant Ops"],
    desc: "Walk through configuring real-time OEE dashboards. For partners building manufacturing implementations.",
    Icon: Video,
    highlights: [
      "Configure real-time OEE end-to-end on a live tenant",
      "Reference layouts: Cutting · Welding · Assembly · QA",
      "Connect to your floor MQTT, OPC-UA, or CSV adapter",
      "Replay and config exports shared after the session",
    ],
  },
  {
    slug: "implementation-lead-cutover-bootcamp",
    type: "Training",
    format: "Virtual",
    title: "Implementation Lead Cutover Bootcamp",
    date: "Jul 8–10, 2026",
    duration: "3 days · 18 hrs",
    location: "Live online",
    speakers: ["Bizak Hypercare", "Senior partners"],
    desc: "Cutover, hypercare, and change management for partner-led go-lives. Real cutover replays and post-mortems.",
    Icon: GraduationCap,
    cohort: {
      seats: 40,
      seatsTaken: 22,
      priceLabel: "Free for active partners",
      feePartner: "First 3 seats per firm on us",
      investmentNote: "Subsequent seats: $850 / consultant",
    },
    curriculum: [
      { week: "Day 1", topic: "Cutover planning · runbook · rollback decision tree", hours: 6 },
      { week: "Day 2", topic: "Hypercare · severity calls · escalation into Bizak",   hours: 6 },
      { week: "Day 3", topic: "Change management · adoption · post-mortem capstone",  hours: 6 },
    ],
    highlights: [
      "Real cutover replays wins and post-mortems",
      "Runbook templates partners are using in production",
      "Live drill: handle a sev-1 escalation under 60 minutes",
      "Capstone exercise on the final day",
    ],
  },
];

export function findEventBySlug(slug?: string): PartnerEvent | undefined {
  if (!slug) return undefined;
  return EVENTS.find((e) => e.slug === slug);
}
