import React, { useState } from "react";

const C = {
  deep: "#1A1D19",
  charcoal: "#333333",
  grey: "#666666",
  sage: "#7A826D",
  offWhite: "#F8F9F7",
  white: "#ffffff",
  accent: "#C7FF35",
  accentLow: "rgba(199,255,53,0.10)",
  accentMid: "rgba(199,255,53,0.20)",
  border: "#E8EAE4",
  borderDark: "rgba(255,255,255,0.07)",
  surfaceDark: "rgba(255,255,255,0.04)",
};

const DEPT_BARS = [
  { name: "Engineering", count: 47, open: 5, pct: 94 },
  { name: "Product", count: 12, open: 3, pct: 60 },
  { name: "Go-to-Market", count: 28, open: 4, pct: 78 },
  { name: "Finance & Ops", count: 8, open: 2, pct: 40 },
  { name: "Customer Ops", count: 15, open: 2, pct: 55 },
];

const RECENT_JOINS = [
  { name: "Priya S.", role: "Senior Backend", days: 3 },
  { name: "Marcus W.", role: "Enterprise AE", days: 12 },
  { name: "Aiko N.", role: "Product Designer", days: 18 },
];

const VALUES = [
  {
    num: "01",
    title: "Move with conviction",
    body: "We decide fast, commit fully, and course-correct with data — not committees. Velocity is a feature.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    num: "02",
    title: "Think in systems",
    body: "Every problem lives inside a larger system. We understand the whole before optimising a part. Depth over hacks.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    num: "03",
    title: "Own every outcome",
    body: "Responsibility doesn't stop at the handoff. We see things through, raise blockers early, and celebrate what ships.",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    num: "04",
    title: "Win as one team",
    body: "120 countries, one culture. We build bridges across timezones, functions, and backgrounds because the best ideas ignore org charts.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
];

const BENEFITS = [
  { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Competitive Salary", sub: "Top-of-market pay benchmarked quarterly" },
  { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "Equity Package", sub: "Meaningful ownership in what you build" },
  { icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Remote-First", sub: "Work from anywhere, always" },
  { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: "Flexible Hours", sub: "Async-first, no micromanagement" },
  { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: "Health & Wellness", sub: "Comprehensive medical, dental, vision" },
  { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "$2k Learning Budget", sub: "Books, courses, conferences — your call" },
  { icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Home Office Stipend", sub: "$800 to set up your ideal workspace" },
  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", label: "Team Retreats", sub: "Annual global offsite, quarterly meetups" },
];

type Job = {
  title: string;
  type: string;
  location: string;
};

type Department = {
  dept: string;
  color: string;
  jobs: Job[];
};

const OPEN_ROLES: Department[] = [
  {
    dept: "Engineering",
    color: "#4F8EF7",
    jobs: [
      { title: "Staff Frontend Engineer", type: "Full-time", location: "Remote" },
      { title: "Senior Backend Engineer", type: "Full-time", location: "Remote / Kathmandu" },
      { title: "Platform & DevOps Engineer", type: "Full-time", location: "Remote" },
      { title: "Senior Mobile Engineer (React Native)", type: "Full-time", location: "Remote" },
      { title: "Security Engineer", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Product & Design",
    color: "#B57BF5",
    jobs: [
      { title: "Senior Product Manager — ERP Core", type: "Full-time", location: "Remote" },
      { title: "Senior Product Designer", type: "Full-time", location: "Remote" },
      { title: "UX Researcher", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Go-to-Market",
    color: "#F5A623",
    jobs: [
      { title: "Enterprise Account Executive — APAC", type: "Full-time", location: "Singapore / Remote" },
      { title: "Senior Solutions Engineer", type: "Full-time", location: "Remote" },
      { title: "Head of Content & SEO", type: "Full-time", location: "Remote" },
      { title: "Sales Development Representative", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Finance & Operations",
    color: "#3ECFAD",
    jobs: [
      { title: "Senior Financial Analyst", type: "Full-time", location: "Kathmandu / Remote" },
      { title: "Revenue Operations Manager", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Customer Success",
    color: "#FF6B6B",
    jobs: [
      { title: "Senior Implementation Consultant", type: "Full-time", location: "Remote" },
      { title: "Customer Success Manager", type: "Full-time", location: "Remote" },
    ],
  },
];

const PROCESS_STEPS = [
  { num: "01", label: "Apply", detail: "5 min", desc: "Submit your application. No cover letter required — we value clarity over formality." },
  { num: "02", label: "Intro Call", detail: "30 min", desc: "A relaxed conversation with our recruiter. We want to understand your story and goals." },
  { num: "03", label: "Assessment", detail: "3–5 days", desc: "A focused take-home or live exercise relevant to your role. Fair, scoped, and paid." },
  { num: "04", label: "Team Rounds", detail: "2–3 hrs", desc: "Meet the people you'd work with. Ask hard questions — we'll do the same." },
  { num: "05", label: "Offer", detail: "48 hrs", desc: "We move fast. Expect a clear, competitive offer with full transparency on equity." },
];

function HeroSection() {
  const totalOpen = OPEN_ROLES.reduce((s, d) => s + d.jobs.length, 0);
  const totalTeam = DEPT_BARS.reduce((s, d) => s + d.count, 0);

  return (
    <section
      style={{
        background: C.deep,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "100px 0 80px",
      }}
    >
      {/* mesh bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(199,255,53,0.045) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />
      {/* glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "30%",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse, rgba(199,255,53,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "55fr 45fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.accentLow,
              border: `1px solid ${C.accentMid}`,
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 32,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, display: "block", boxShadow: `0 0 8px ${C.accent}` }} />
            <span style={{ color: C.accent, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}>
              {totalOpen} OPEN ROLES · HIRING NOW
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: "clamp(44px, 5.5vw, 72px)",
              fontWeight: 800,
              color: C.white,
              lineHeight: 1.05,
              margin: "0 0 24px",
              letterSpacing: "-0.03em",
            }}
          >
            Build what the{" "}
            <span style={{ color: C.accent }}>world runs on.</span>
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              color: "rgba(255,255,255,0.60)",
              lineHeight: 1.7,
              margin: "0 0 48px",
              maxWidth: 520,
            }}
          >
            Bizak powers over 50,000 businesses across 120+ countries. Join the team making enterprise software feel effortless — and building the next chapter of global commerce.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href="#open-roles"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.accent,
                color: C.deep,
                padding: "14px 32px",
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 32px rgba(199,255,53,0.35)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; (e.currentTarget as HTMLAnchorElement).style.boxShadow = ""; }}
            >
              View Open Roles
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </a>
            <a
              href="#culture"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.surfaceDark,
                color: C.white,
                padding: "14px 32px",
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                border: `1px solid ${C.borderDark}`,
              }}
            >
              Our Culture
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 40, marginTop: 56, paddingTop: 48, borderTop: `1px solid ${C.borderDark}` }}>
            {[
              { val: `${totalTeam}+`, label: "Team members" },
              { val: "120+", label: "Countries" },
              { val: `${totalOpen}`, label: "Open roles" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Team Pulse panel */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.borderDark}`,
            borderRadius: 20,
            padding: 28,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Team Pulse</div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, marginTop: 2 }}>Live Headcount</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.accentLow, border: `1px solid ${C.accentMid}`, borderRadius: 100, padding: "4px 10px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "block" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: C.accent }}>LIVE</span>
            </div>
          </div>

          {/* Dept bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {DEPT_BARS.map(d => (
              <div key={d.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{d.name}</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{d.count} total</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.accent, fontWeight: 600 }}>{d.open} open</span>
                  </div>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.sage}, ${C.accent})`, borderRadius: 100 }} />
                </div>
              </div>
            ))}
          </div>

          {/* KPI mini cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Avg. time to hire", val: "18 days" },
              { label: "Offer acceptance", val: "94%" },
              { label: "Internal mobility", val: "38%" },
              { label: "Employee NPS", val: "72" },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderDark}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, color: C.white }}>{kpi.val}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Recent joins */}
          <div style={{ borderTop: `1px solid ${C.borderDark}`, paddingTop: 18 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase", marginBottom: 12 }}>Recently joined</div>
            {RECENT_JOINS.map((j, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < RECENT_JOINS.length - 1 ? 10 : 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `hsl(${i * 120}, 55%, 50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: C.white, flexShrink: 0 }}>
                  {j.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.white, fontWeight: 500 }}>{j.name}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.40)" }}>{j.role}</div>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.accent }}>{j.days}d ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section
      id="culture"
      style={{
        background: C.white,
        padding: "100px 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        {/* Header */}
        <div style={{ maxWidth: 640, marginBottom: 64 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.sage, textTransform: "uppercase", marginBottom: 16 }}>Our Culture</div>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: C.charcoal, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.025em" }}>
            Principles that shape how we work
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: C.grey, lineHeight: 1.7, margin: 0 }}>
            We don't just ship software — we're building a company that attracts and keeps exceptional people. These aren't posters on a wall; they're the decisions we make every day.
          </p>
        </div>

        {/* 2×2 bento */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {VALUES.map((v, i) => (
            <div
              key={v.num}
              style={{
                background: i % 2 === 0 ? C.offWhite : C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "40px 40px 48px",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.25s, box-shadow 0.25s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
            >
              {/* Giant number watermark */}
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  right: 24,
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 120,
                  fontWeight: 900,
                  color: "rgba(122,130,109,0.07)",
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {v.num}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(122,130,109,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.icon} />
                </svg>
              </div>

              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: C.charcoal, marginBottom: 12, letterSpacing: "-0.015em" }}>{v.title}</div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.grey, lineHeight: 1.7, margin: 0 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section style={{ background: C.deep, padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(199,255,53,0.03) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, gap: 40, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", marginBottom: 16 }}>Why Bizak</div>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(30px, 3.8vw, 48px)", fontWeight: 800, color: C.white, lineHeight: 1.1, margin: 0, letterSpacing: "-0.025em" }}>
              Built-in perks, not an afterthought
            </h2>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.50)", lineHeight: 1.7, maxWidth: 380, margin: 0 }}>
            We invest in our people because building world-class software requires world-class conditions.
          </p>
        </div>

        {/* 4-col benefit grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {BENEFITS.map((b, i) => (
            <div
              key={b.label}
              style={{
                background: C.surfaceDark,
                border: `1px solid ${C.borderDark}`,
                borderRadius: 16,
                padding: "28px 24px",
                transition: "border-color 0.2s, background 0.2s",
                cursor: "default",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.accentMid; el.style.background = "rgba(199,255,53,0.04)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.borderDark; el.style.background = C.surfaceDark; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(199,255,53,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.icon} />
                </svg>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 6 }}>{b.label}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{b.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenRolesSection() {
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const displayed = activeDept ? OPEN_ROLES.filter(d => d.dept === activeDept) : OPEN_ROLES;

  return (
    <section id="open-roles" style={{ background: C.offWhite, padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.sage, textTransform: "uppercase", marginBottom: 16 }}>Open Roles</div>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(30px, 3.8vw, 48px)", fontWeight: 800, color: C.charcoal, lineHeight: 1.1, margin: 0, letterSpacing: "-0.025em" }}>
              Find your next challenge
            </h2>
          </div>
          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveDept(null)}
              style={{
                padding: "8px 16px",
                borderRadius: 100,
                border: `1px solid ${activeDept === null ? C.sage : C.border}`,
                background: activeDept === null ? C.sage : "transparent",
                color: activeDept === null ? C.white : C.grey,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              All
            </button>
            {OPEN_ROLES.map(d => (
              <button
                key={d.dept}
                onClick={() => setActiveDept(prev => prev === d.dept ? null : d.dept)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  border: `1px solid ${activeDept === d.dept ? d.color : C.border}`,
                  background: activeDept === d.dept ? `${d.color}18` : "transparent",
                  color: activeDept === d.dept ? d.color : C.grey,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {d.dept}
              </button>
            ))}
          </div>
        </div>

        {/* Role groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {displayed.map(group => (
            <div key={group.dept}>
              {/* Dept label */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: C.charcoal, letterSpacing: "0.02em" }}>{group.dept}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.grey }}>{group.jobs.length} roles</span>
              </div>

              {/* Job rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.jobs.map(job => (
                  <div
                    key={job.title}
                    style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = group.color + "60"; el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.05)`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.border; el.style.boxShadow = ""; }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>{job.title}</div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.grey }}>{job.type}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.border, alignSelf: "center", display: "block" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.grey }}>{job.location}</span>
                      </div>
                    </div>
                    <a
                      href="/contact"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 20px",
                        background: C.charcoal,
                        color: C.white,
                        borderRadius: 8,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        flexShrink: 0,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.deep; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.charcoal; }}
                    >
                      Apply
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section style={{ background: C.white, padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.sage, textTransform: "uppercase", marginBottom: 16 }}>Hiring Process</div>
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(30px, 3.8vw, 48px)", fontWeight: 800, color: C.charcoal, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: "-0.025em" }}>
            No mystery, no maze
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: C.grey, lineHeight: 1.7, margin: "0 auto", maxWidth: 500 }}>
            We respect your time. Here's exactly what to expect from first click to signed offer.
          </p>
        </div>

        {/* Horizontal steps flow */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, position: "relative" }}>
          {/* connector line */}
          <div style={{ position: "absolute", top: 32, left: "calc(10% + 20px)", right: "calc(10% + 20px)", height: 1, background: C.border, zIndex: 0 }} />

          {PROCESS_STEPS.map((step, i) => (
            <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 12px", position: "relative", zIndex: 1 }}>
              {/* Circle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: i === 0 ? C.deep : C.white,
                  border: `2px solid ${i === 0 ? C.deep : C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: i === 0 ? C.white : C.charcoal,
                    letterSpacing: "0.04em",
                  }}
                >
                  {step.num}
                </div>
              </div>

              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: C.charcoal, marginBottom: 4 }}>{step.label}</div>
              <div
                style={{
                  display: "inline-block",
                  background: "#F0F1EE",
                  color: C.sage,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 100,
                  marginBottom: 12,
                }}
              >
                {step.detail}
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.grey, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Promise banner */}
        <div
          style={{
            marginTop: 72,
            background: C.offWhite,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "28px 36px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.sage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Our commitment to every candidate</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.grey, lineHeight: 1.6 }}>
              You'll always hear back from us — even if it's a no. We share detailed feedback after every technical stage, and we'll never leave you ghosted or waiting more than 5 business days.
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
            {[{ val: "5", label: "day response SLA" }, { val: "100%", label: "feedback rate" }].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 800, color: C.charcoal }}>{s.val}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.grey }}>{s.label}</div>
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
    <section className="biz-cta-section" style={{ background: C.deep, padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(199,255,53,0.04) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(199,255,53,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: C.accentLow,
            border: `1px solid ${C.accentMid}`,
            borderRadius: 100,
            padding: "6px 18px",
            marginBottom: 32,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "block" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.08em" }}>OPEN TO ALL BACKGROUNDS</span>
        </div>

        <h2
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: "clamp(32px, 4.5vw, 58px)",
            fontWeight: 800,
            color: C.white,
            lineHeight: 1.08,
            margin: "0 0 20px",
            letterSpacing: "-0.03em",
          }}
        >
          Don't see the right fit?{" "}
          <span style={{ color: C.accent }}>We still want to hear from you.</span>
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7,
            margin: "0 auto 48px",
            maxWidth: 580,
          }}
        >
          We're always looking for exceptional people. Send us a note about who you are and what you'd want to build — the right role might not exist yet.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.accent,
              color: C.deep,
              padding: "15px 36px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 32px rgba(199,255,53,0.35)`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = ""; }}
          >
            Send a speculative application
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
          <a
            href="#open-roles"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              color: C.white,
              padding: "15px 36px",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              border: `1px solid ${C.borderDark}`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.borderDark; }}
          >
            Browse open roles
          </a>
        </div>

        {/* Social proof strip */}
        <div
          style={{
            marginTop: 64,
            padding: "28px 0 0",
            borderTop: `1px solid ${C.borderDark}`,
            display: "flex",
            justifyContent: "center",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          {[
            { val: "50,000+", label: "businesses powered" },
            { val: "120+", label: "countries" },
            { val: "4.9★", label: "Glassdoor rating" },
            { val: "Remote", label: "first culture" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, color: C.white }}>{s.val}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CareersPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <HeroSection />
      <ValuesSection />
      <BenefitsSection />
      <OpenRolesSection />
      <ProcessSection />
      <CTASection />
    </div>
  );
}
