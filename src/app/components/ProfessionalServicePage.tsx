import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

function Icon({ name, size = 24, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const icons: Record<string, JSX.Element> = {
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    briefcase: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    target: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    "file-text": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    dollar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    trending: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    "check-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    alert: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    receipt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <path d="M16 8H8M16 12H8M12 16H8" />
      </svg>
    ),
    message: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    folder: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    repeat: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    handshake: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
        <path d="M3 4h8" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
      </svg>
    ),
    award: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    book: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function EngagementRow({ code, client, hours, billable, color }: { code: string; client: string; hours: string; billable: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(122,130,109,0.7)", minWidth: 60 }}>{code}</span>
      <span style={{ fontSize: 8, color: "#aaa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client}</span>
      <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, color: "#444" }}>{hours}</span>
      <span style={{
        fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
        background: billable === "BILLABLE" ? "rgba(199,255,53,0.12)" : "rgba(122,130,109,0.1)",
        color: billable === "BILLABLE" ? "#7A826D" : "#999",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>{billable}</span>
    </div>
  );
}

function HeroSection() {
  const engagements = [
    { code: "ENG-4218", client: "Hartwell & Locke LLP",   hours: "02:48:11", billable: "BILLABLE", color: "#C7FF35" },
    { code: "ENG-4219", client: "Vector Capital Advisors", hours: "01:14:32", billable: "BILLABLE", color: "#60a5fa" },
    { code: "ENG-4220", client: "Internal · Bench Time",   hours: "00:42:08", billable: "INTERNAL", color: "rgba(122,130,109,0.4)" },
  ];

  const teamLoad = [
    { code: "SR", label: "Senior",  pct: 92, active: true  },
    { code: "MG", label: "Manager", pct: 76, active: true  },
    { code: "JR", label: "Analyst", pct: 64, active: false },
  ];

  return (
    <section className="biz-mesh" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)", left: "50%" }} />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>Professional Services ERP</span>
            <h1 className="biz-h1">
              Bill Every Hour.<br /><span>Deliver</span> Every Engagement.
            </h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              Run consultancies, agencies, and advisory firms on one platform. Capture every billable minute, plan utilisation in real time, and turn every engagement into a renewable, profitable client relationship.
            </p>
            <div className="biz-hero-cta-row">
              <button className="biz-shimmer-btn biz-shimmer-lg">Request Demo</button>
              <button className="biz-btn-outline">
                See How It Works <Icon name="play" size={16} />
              </button>
            </div>
            <div className="biz-hero-stats">
              <div>
                <div className="biz-stat-value">87%</div>
                <div className="biz-stat-label">Avg. Utilisation</div>
              </div>
              <div className="biz-divider-v" />
              <div>
                <div className="biz-stat-value">12 d</div>
                <div className="biz-stat-label">Faster Invoicing</div>
              </div>
            </div>
          </div>

          <div className="biz-hero-visual">
            <div className="biz-vis-glow" />

            <div className="biz-card-main biz-glass biz-float">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
                  <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(122,130,109,0.65)" }}>
                  Bizak · Practice Hub
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", color: "#7A826D", textTransform: "uppercase" }}>Tracking</span>
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: 10,
                background: "linear-gradient(135deg, rgba(199,255,53,0.08), rgba(199,255,53,0.02))",
                border: "1px solid rgba(199,255,53,0.22)", marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(199,255,53,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7A826D" }}>
                    <Icon name="clock" size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(122,130,109,0.7)" }}>Active Timer</div>
                    <div style={{ fontSize: 9, color: "#444", fontWeight: 600 }}>Hartwell &amp; Locke · M&amp;A Diligence</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="biz-pulse-glow" style={{ width: 5, height: 5, borderRadius: "50%", background: "#C7FF35" }} />
                  <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#333", letterSpacing: "0.05em" }}>02:48:11</span>
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  {teamLoad.map((t) => (
                    <div key={t.code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        border: `1.5px solid ${t.active ? "rgba(199,255,53,0.5)" : "rgba(122,130,109,0.18)"}`,
                        background: t.active ? "rgba(199,255,53,0.06)" : "rgba(122,130,109,0.03)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                        boxShadow: t.active ? "0 0 10px rgba(199,255,53,0.12)" : "none",
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: t.active ? "#7A826D" : "#bbb", letterSpacing: "0.04em" }}>{t.code}</span>
                        <div style={{
                          position: "absolute", top: -3, right: -3, width: 8, height: 8,
                          borderRadius: "50%",
                          background: t.active ? "#C7FF35" : "rgba(122,130,109,0.35)",
                          boxShadow: t.active ? "0 0 5px #C7FF35" : "none",
                        }} />
                      </div>
                      <span style={{ fontSize: 7, color: "#bbb", letterSpacing: "0.03em" }}>{t.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: t.active ? "#C7FF35" : "#bbb" }}>{t.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingTop: 10, borderTop: "1px solid rgba(122,130,109,0.1)" }}>
                {engagements.map((e) => (
                  <EngagementRow key={e.code} {...e} />
                ))}
              </div>
            </div>

            <div className="biz-card-inventory biz-glass-dark biz-float-d">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(199,255,53,0.15)", color: "#C7FF35" }}>
                  <Icon name="dollar" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Billable Today</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>$32,480</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>Realisation</span>
                <span style={{ fontSize: 9, color: "#C7FF35", fontWeight: 700 }}>94.2%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div className="biz-accent-bar" style={{ width: "94%" }} />
              </div>
            </div>

            <div className="biz-card-globe biz-glass biz-float-s">
              <div className="biz-tag-row">
                <div className="biz-icon-box" style={{ background: "rgba(122,130,109,0.1)", color: "#7A826D" }}>
                  <Icon name="calendar" size={18} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D" }}>This Week</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { day: "Mon", logged: 7.8, target: 8 },
                  { day: "Tue", logged: 8.4, target: 8 },
                  { day: "Wed", logged: 7.2, target: 8 },
                  { day: "Thu", logged: 8.1, target: 8 },
                  { day: "Fri", logged: 4.6, target: 8 },
                ].map((d) => (
                  <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 7, color: "#888", minWidth: 22, fontWeight: 600 }}>{d.day}</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(122,130,109,0.10)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${(d.logged / d.target) * 100}%`, background: d.logged >= d.target ? "#C7FF35" : "#7A826D", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 700, color: "#555", fontFamily: "monospace" }}>{d.logged}h</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="biz-card-circle biz-glass biz-float">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A826D", marginBottom: 12 }}>Utilisation</div>
              <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(199,255,53,0.18)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="0" />
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="#C7FF35" strokeWidth="8" strokeDasharray="201" strokeDashoffset="26" />
                </svg>
                <div style={{ position: "absolute", fontSize: 13, fontWeight: 700, color: "#333" }}>87%</div>
              </div>
            </div>

            {[{ top: "38%", left: "52%", delay: "0s" }, { top: "62%", left: "28%", delay: "1.6s" }, { top: "28%", left: "72%", delay: "2.8s" }].map((p, i) => (
              <div key={i} className="biz-data-dot biz-particle" style={{ top: p.top, left: p.left, animationDelay: p.delay }} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function ChallengesSection() {
  return (
    <section className="biz-section" style={{ background: "#F8F9F7" }}>
      <div className="biz-container">
        <div style={{ marginBottom: 48 }}>
          <span className="biz-label">Challenges</span>
          <h2 className="biz-h2" style={{ marginTop: 16, maxWidth: 720 }}>
            Every untracked minute is margin walking out the door
          </h2>
          <p className="biz-section-intro">
            Spreadsheet timesheets, scope drift, idle benches, and slow invoicing quietly drain the profitability of every engagement you deliver.
          </p>
        </div>

        <div className="biz-bento-grid">

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="clock" size={22} /></div>
            <h3 className="biz-card-title">Lost Billable Hours</h3>
            <p className="biz-card-desc">When time sheets are filled in on Friday afternoon from memory, an average of 14% of billable work simply disappears — never logged, never invoiced.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
                {[
                  { d: "M", logged: 38, real: 46 },
                  { d: "T", logged: 42, real: 48 },
                  { d: "W", logged: 36, real: 50 },
                  { d: "T", logged: 40, real: 52 },
                  { d: "F", logged: 28, real: 44 },
                ].map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", height: `${b.real}%`, background: "rgba(248,113,113,0.18)", borderRadius: "3px 3px 0 0", position: "relative" }}>
                      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${(b.logged / b.real) * 100}%`, background: "rgba(122,130,109,0.55)", borderRadius: "3px 3px 0 0" }} />
                    </div>
                    <span style={{ fontSize: 7, color: "#aaa" }}>{b.d}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171" }} />
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>14% leakage this week</span>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="target" size={22} /></div>
            <h3 className="biz-card-title">Scope Creep</h3>
            <p className="biz-card-desc">Without disciplined change-orders and live budget tracking, fixed-fee engagements quietly burn past their contracted hours.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {[
                  { label: "Quoted",  pct: 60, color: "rgba(122,130,109,0.4)", val: "180h" },
                  { label: "Burned",  pct: 92, color: "#f87171",                val: "276h" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#999", minWidth: 56, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</span>
                    <div style={{ flex: 1, height: 7, background: "#f3f3f3", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: row.color, fontFamily: "monospace" }}>{row.val}</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em" }}>+53% over budget</span>
                </div>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="users" size={22} /></div>
            <h3 className="biz-card-title">Idle Benches</h3>
            <p className="biz-card-desc">Without a real-time view of who's loaded and who's free, capable consultants sit idle while overworked teammates burn out.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { name: "A. Reyes", load: 102, status: "burn"  },
                  { name: "K. Ito",    load: 88,  status: "good"  },
                  { name: "M. Singh",  load: 41,  status: "idle"  },
                  { name: "J. Park",   load: 18,  status: "idle"  },
                ].map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 8, color: "#777", minWidth: 56 }}>{p.name}</span>
                    <div style={{ flex: 1, height: 5, background: "#f3f3f3", borderRadius: 99, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "85%", borderRight: "1px dashed rgba(122,130,109,0.4)", boxSizing: "border-box" }} />
                      <div style={{ height: "100%", width: `${Math.min(p.load, 100)}%`, background: p.status === "burn" ? "#f87171" : p.status === "idle" ? "rgba(122,130,109,0.3)" : "#C7FF35", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: p.status === "burn" ? "#f87171" : p.status === "idle" ? "#bbb" : "#7A826D", minWidth: 26, textAlign: "right" }}>{p.load}%</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em" }}>2 idle · 1 over-allocated</span>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="receipt" size={22} /></div>
            <h3 className="biz-card-title">Slow Invoicing &amp; DSO</h3>
            <p className="biz-card-desc">Manual invoice prep from scattered spreadsheets stretches days-sales-outstanding well past 60 days, starving cash flow.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", gap: 4, height: 36 }}>
                {[
                  { stage: "Work Done",     d: 0,  color: "rgba(122,130,109,0.55)" },
                  { stage: "Time Approved", d: 8,  color: "#fbbf24" },
                  { stage: "Invoice Sent",  d: 21, color: "#fbbf24" },
                  { stage: "Paid",          d: 67, color: "#f87171" },
                ].map((s, i, arr) => (
                  <div key={s.stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0, boxShadow: `0 0 0 3px ${s.color}22` }} />
                    {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(122,130,109,0.3), rgba(122,130,109,0.1))", margin: "0 4px" }} />}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {["D+0", "D+8", "D+21", "D+67"].map((d) => (
                  <span key={d} style={{ fontSize: 7, color: "#aaa", fontFamily: "monospace" }}>{d}</span>
                ))}
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>67-day DSO · cash trapped</span>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="folder" size={22} /></div>
            <h3 className="biz-card-title">Knowledge In Inboxes</h3>
            <p className="biz-card-desc">Deliverables, contracts, and client correspondence scattered across email, drives, and chat — onboarding a new lead takes days, not hours.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 56, gap: 0, position: "relative" }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 200 56" preserveAspectRatio="none">
                  <line x1="40" y1="20" x2="100" y2="40" stroke="rgba(122,130,109,0.18)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="160" y1="18" x2="100" y2="40" stroke="rgba(122,130,109,0.18)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="100" y1="10" x2="100" y2="40" stroke="rgba(122,130,109,0.18)" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
                {[
                  { x: "20%", y: "18%", lbl: "Email"  },
                  { x: "50%", y: "8%",  lbl: "Drive"  },
                  { x: "80%", y: "20%", lbl: "Chat"   },
                  { x: "50%", y: "70%", lbl: "?"      },
                ].map((n, i) => (
                  <div key={i} style={{ position: "absolute", top: n.y, left: n.x, transform: "translate(-50%, -50%)", textAlign: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: i === 3 ? "1.5px dashed #f87171" : "1.5px solid rgba(122,130,109,0.22)", background: i === 3 ? "rgba(248,113,113,0.06)" : "rgba(122,130,109,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: i === 3 ? "#f87171" : "#aaa" }}>
                      {n.lbl[0]}
                    </div>
                    <span style={{ fontSize: 7, color: i === 3 ? "#f87171" : "#999", marginTop: 2, display: "block" }}>{n.lbl}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 4 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em" }}>No single source of truth</span>
              </div>
            </div>
          </div>

          <div className="biz-bento-card">
            <div className="biz-icon-wrap"><Icon name="trending" size={22} /></div>
            <h3 className="biz-card-title">No Engagement Margin View</h3>
            <p className="biz-card-desc">Without live cost-to-bill tracking, you only know an engagement was unprofitable months after it closed — when it's far too late to act.</p>
            <div className="biz-card-footer">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 50 }}>
                {[
                  { label: "Eng. A", margin: 38, color: "#C7FF35",                val: "+38%" },
                  { label: "Eng. B", margin: 12, color: "rgba(122,130,109,0.45)", val: "+12%" },
                  { label: "Eng. C", margin: -8, color: "#f87171",                val: "−8%"  },
                  { label: "Eng. D", margin: 22, color: "rgba(199,255,53,0.55)",  val: "+22%" },
                ].map((b) => (
                  <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 7, fontWeight: 700, color: b.margin < 0 ? "#f87171" : "#555" }}>{b.val}</span>
                    <div style={{ width: "100%", height: Math.abs(b.margin) * 1.2 + 6, background: b.color, borderRadius: 4, opacity: b.margin < 0 ? 0.85 : 1 }} />
                    <span style={{ fontSize: 7, color: "#aaa" }}>{b.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#7A826D", textTransform: "uppercase", letterSpacing: "0.08em" }}>1 of 4 silently bleeding</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

const SOLUTIONS = [
  { icon: "briefcase",  title: "Engagement & Project Mgmt", desc: "Plan, staff, and run every engagement from proposal to close — phases, milestones, deliverables, and budget guardrails on one timeline." },
  { icon: "clock",       title: "Time & Expense Capture",   desc: "One-tap timers, mobile entry, and AI-suggested time entries. Approvals flow directly into invoices with zero re-keying." },
  { icon: "users",       title: "Resource Planning",        desc: "See who's loaded, who's free, and who's about to bench. Rebalance teams in real time and forecast hiring needs weeks ahead." },
  { icon: "receipt",     title: "Billing & Retainers",      desc: "Fixed-fee, T&M, milestone, retainer — Bizak handles every billing model with automated WIP-to-invoice generation." },
  { icon: "handshake",   title: "Client Portal & CRM",      desc: "A branded client workspace for proposals, deliverables, approvals, and statements — replaces ten back-and-forth emails." },
  { icon: "trending",    title: "Profitability Analytics",  desc: "Live cost-to-bill, realisation, and margin per engagement, partner, and practice — actionable while the work is still in flight." },
  { icon: "book",        title: "Knowledge & Document Vault", desc: "Versioned proposals, NDAs, deliverables, and templates — searchable across every engagement and securely shared with clients." },
];

function SolutionSection() {
  return (
    <section className="biz-section" style={{ background: "#fff", borderTop: "1px solid #e8eae4", borderBottom: "1px solid #e8eae4" }}>
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">The Solution</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>One platform for every engagement, every consultant, every client</h2>
        </div>
        <div className="biz-solution-grid">
          {SOLUTIONS.map((s) => (
            <div key={s.title} style={{ display: "flex", flexDirection: "column" }}>
              <div className="biz-sol-icon"><Icon name={s.icon} size={22} /></div>
              <h4 className="biz-sol-title">{s.title}</h4>
              <p className="biz-sol-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="biz-dark-section">
      <div className="biz-container">
        <div style={{ marginBottom: 64, maxWidth: 580 }}>
          <span className="biz-label">Capabilities</span>
          <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
            Built for the rhythm of professional practice.
          </h2>
        </div>

        <div className="biz-caps-grid">

          <div className="biz-dark-card biz-col-6 biz-neon-border" style={{ minHeight: 280 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>

              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(199,255,53,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                    <Icon name="clock" size={26} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Time &amp; Engagement Tracker</div>
                    <h4 style={{ fontWeight: 700, fontSize: 20, color: "#fff", margin: 0 }}>Capture Every Billable Minute</h4>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.7, marginBottom: 24 }}>
                  Live one-tap timers, AI-assisted time-entry from calendar and email signals, and approval chains that feed directly into invoices — eliminating the Friday-afternoon recall ritual that loses 14% of revenue every week.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { icon: "play",          text: "One-tap timers across web, mobile, and desktop with offline sync" },
                    { icon: "zap",           text: "AI suggests entries from calendar, mail, and document activity" },
                    { icon: "check-circle",  text: "Manager approval workflows with policy violation flags" },
                    { icon: "receipt",       text: "Approved time auto-flows to draft invoices and WIP reports" },
                  ].map((f) => (
                    <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(199,255,53,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0, marginTop: 1 }}>
                        <Icon name={f.icon} size={14} />
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flexShrink: 0, width: 280 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
                  <div style={{ background: "rgba(199,255,53,0.08)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#C7FF35", letterSpacing: "0.12em", textTransform: "uppercase" }}>Active Timesheet</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div className="biz-pulse-glow" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C7FF35" }} />
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Running</span>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(199,255,53,0.06)", border: "1px solid rgba(199,255,53,0.18)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hartwell &amp; Locke</span>
                        <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#fff" }}>02:48:11</span>
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>M&amp;A Diligence · Phase 2</span>
                    </div>
                    {[
                      { client: "Vector Capital",   task: "Strategy review",    dur: "01:14:32", rate: "$240" },
                      { client: "Northwind Health", task: "Compliance audit",   dur: "00:48:05", rate: "$185" },
                      { client: "Internal",         task: "Practice meeting",   dur: "00:30:00", rate: "—"    },
                    ].map((r) => (
                      <div key={r.client} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{r.client}</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{r.task}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{r.dur}</div>
                          <div style={{ fontSize: 9, color: "#C7FF35", marginTop: 1 }}>{r.rate}/h</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Today billable</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#C7FF35" }}>5h 20m</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {[{ val: "94%", lbl: "Realisation" }, { val: "$32k", lbl: "Today" }].map((s) => (
                    <div key={s.lbl} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#C7FF35" }}>{s.val}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 400 }}>
            <div>
              <h3>Resource Heatmap</h3>
              <p>A live grid of every consultant's allocation across the next four weeks — with overload warnings, idle alerts, and skill-aware suggestions for staffing the next engagement.</p>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "60px repeat(4, 1fr)", gap: 4, alignItems: "center" }}>
                <span />
                {["W1", "W2", "W3", "W4"].map((w) => (
                  <span key={w} style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)", textAlign: "center", letterSpacing: "0.08em" }}>{w}</span>
                ))}
                {[
                  { name: "A. Reyes",  loads: [102, 96, 88, 72] },
                  { name: "K. Ito",    loads: [88, 92, 84, 76]  },
                  { name: "M. Singh",  loads: [41, 58, 72, 80]  },
                  { name: "J. Park",   loads: [18, 24, 48, 64]  },
                  { name: "S. Patel",  loads: [78, 82, 90, 86]  },
                ].flatMap((p) => [
                  <span key={p.name + "-l"} style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", padding: "5px 0" }}>{p.name}</span>,
                  ...p.loads.map((l, i) => {
                    const bg = l > 100 ? "#f87171" : l > 85 ? "#C7FF35" : l > 60 ? "rgba(199,255,53,0.5)" : l > 40 ? "rgba(199,255,53,0.22)" : "rgba(255,255,255,0.06)";
                    const tc = l > 100 || (l > 85 && l <= 100) ? "#1A1D19" : "rgba(255,255,255,0.55)";
                    return (
                      <div key={p.name + i} style={{ height: 22, borderRadius: 5, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: tc }}>
                        {l}
                      </div>
                    );
                  }),
                ])}
              </div>
            </div>
          </div>

          <div className="biz-dark-card biz-col-3" style={{ minHeight: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3>Client 360</h3>
                <p>Every engagement, conversation, document, invoice, and outstanding balance for a client — unified in a single profile that travels with the relationship across partners.</p>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(199,255,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C7FF35", flexShrink: 0 }}>
                <Icon name="handshake" size={24} />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["$418k", "Lifetime Fees"], ["7", "Engagements"], ["96%", "NPS"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 240 }}>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="receipt" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Flexible Billing</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Fixed-fee, time-and-materials, milestone, retainer, and contingent — Bizak handles every engagement type with auto-generated invoices.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2 biz-neon-border" style={{ minHeight: 240, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, right: 22 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C7FF35", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.85 }}>AI</span>
            </div>
            <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="zap" size={34} /></div>
            <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>AI Time Suggest</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
              Bizak reads calendar events, email threads, and document edits — then proposes time entries that just need a one-click approval.
            </p>
          </div>

          <div className="biz-dark-card biz-col-2" style={{ minHeight: 240, justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#C7FF35", marginBottom: 20 }}><Icon name="award" size={34} /></div>
              <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>Compliance &amp; Trust</h4>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
                Conflict-of-interest checks, audit trails, retention policies, and SOC 2 controls — built in for regulated practices.
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "99%", background: "#C7FF35" }} />
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>SOC 2 · ISO 27001 · GDPR</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function InsightsSection() {
  return (
    <section className="biz-section" style={{ background: "#fff" }}>
      <div className="biz-container">
        <div className="biz-insights-grid">

          <div style={{ position: "relative" }}>
            <div className="biz-chart-frame biz-glass">
              <div className="biz-chart-inner">
                <div className="biz-chart-topbar">
                  <div style={{ height: 36, width: 168, background: "#e8eae4", borderRadius: 8 }} />
                  <div style={{ height: 36, width: 88, background: "rgba(122,130,109,0.18)", borderRadius: 8 }} />
                </div>
                <div style={{ height: 240, background: "#fff", borderRadius: 8, border: "1px solid rgba(232,234,228,0.5)", position: "relative", padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 400 200" fill="none">
                    <defs>
                      <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C7FF35" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#C7FF35" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[40, 80, 120, 160].map((y) => (
                      <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(122,130,109,0.06)" strokeWidth="1" />
                    ))}
                    <path d="M0 110 C 40 100, 80 92, 120 78 S 200 60, 240 50 S 320 40, 400 28" stroke="#7A826D" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0 110 C 40 100, 80 92, 120 78 S 200 60, 240 50 S 320 40, 400 28 V 200 H 0 Z" fill="url(#utilGrad)" />
                    <path d="M0 130 C 50 128, 100 124, 160 116 S 250 96, 310 84 S 370 70, 400 60" stroke="rgba(122,130,109,0.4)" strokeWidth="2" strokeDasharray="6 4" />
                    {[
                      { x: 60,  y: 95  },
                      { x: 140, y: 70  },
                      { x: 240, y: 50  },
                      { x: 340, y: 34  },
                    ].map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#C7FF35" stroke="#7A826D" strokeWidth="1.6" />
                    ))}
                    <line x1="240" y1="50" x2="240" y2="20" stroke="rgba(199,255,53,0.4)" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="246" y="18" fontSize="8" fill="#7A826D">New Hires Onboarded</text>
                  </svg>
                  <div className="biz-tooltip">
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#333" }}>Utilisation: 87%</div>
                    <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>Realisation: 94.2% · ↑ 6.1pp QoQ</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -40, right: -40, width: 180, height: 180, background: "rgba(199,255,53,0.04)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          </div>

          <div>
            <span className="biz-label">Practice Intelligence</span>
            <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
              Know which engagements make money — while the work is still in flight.
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7 }}>
              Stop discovering unprofitable engagements at quarter-close. Bizak surfaces live utilisation, realisation, and engagement-level margin so partners can adjust scope, staffing, or rate before it costs the firm.
            </p>
            <ul className="biz-check-list">
              {[
                { bold: "Utilisation × Realisation",  rest: " — Live ratio of billed hours to capacity, the two metrics that define a healthy practice." },
                { bold: "Engagement Margin",          rest: " — Burn rate vs. budget per project with predicted close margin and drift alerts." },
                { bold: "Partner Book Health",        rest: " — Pipeline, WIP, AR ageing, and client concentration in one partner-facing view." },
              ].map((item) => (
                <li key={item.bold} className="biz-check-item">
                  <span className="biz-check-icon"><Icon name="check-circle" size={20} /></span>
                  <span><strong>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: "search",     label: "Lead"     },
  { icon: "file-text",  label: "Proposal" },
  { icon: "handshake",  label: "Engage"   },
  { icon: "clock",      label: "Deliver"  },
  { icon: "receipt",    label: "Bill"     },
  { icon: "repeat",     label: "Renew"    },
];

function WorkflowSection() {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">Engagement Lifecycle</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>From First Conversation to Lifetime Client</h2>
        </div>
        <div className="biz-workflow-steps">
          <div className="biz-workflow-line">
            <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
              <path d="M50,50 L950,50" stroke="#7A826D" strokeOpacity="0.15" strokeWidth="1" />
              <path className="biz-flow" d="M50,50 L950,50" stroke="#C7FF35" strokeDasharray="12 40" strokeLinecap="round" strokeWidth="3" />
            </svg>
          </div>
          <div className="biz-steps-grid">
            {STEPS.map((s) => (
              <div key={s.label} className="biz-step-item">
                <div className="biz-step-circle"><Icon name={s.icon} size={24} /></div>
                <span className="biz-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="biz-cta-section">
      <div className="biz-cta-glow" />
      <div className="biz-container" style={{ position: "relative", zIndex: 10 }}>
        <h2 className="biz-cta-title">Run a profitable practice, not a busy one.</h2>
        <p className="biz-cta-sub">
          Unify time, talent, and clients on Bizak — and turn every billable hour into a lasting relationship.
        </p>
        <div className="biz-cta-btn-row">
          <button className="biz-shimmer-btn" style={{ fontSize: 17, fontWeight: 700, padding: "16px 44px", borderRadius: 8, boxShadow: "0 0 20px rgba(199,255,53,0.38)" }}>
            Request Demo
          </button>
          <button className="biz-btn-ghost">View Pricing</button>
        </div>
      </div>
    </section>
  );
}

export function ProfessionalServicePage() {
  return (
    <div className="biz-page" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <InsightsSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
