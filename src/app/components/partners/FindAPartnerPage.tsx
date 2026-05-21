import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";
import {
  Section,
  Container,
  Heading,
  BadgeGreen,
  Pill,
  PillGroup,
  DotGrid,
  SectionHead,
  StatusChip,
} from "../bz";
import { cn } from "../ui/utils";
import anchorpointLogo from "../../../assets/partners/anchorpoint.jpeg";
import croweLogo from "../../../assets/partners/crowe.svg";

// ════════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════════

type Partner = {
  name: string;
  legalName?: string;
  description: string;
  country: string;
  code: string;       // ISO-2 country code matches geolocation API output
  flag: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo: string;
};

const PARTNERS: Partner[] = [
  {
    name: "Anchorpoint (Pvt.) Ltd",
    description:
      "Anchorpoint fuels startup success with expert guidance in launch, funding, and growth. From seamless IT solutions to strategic financial management, the firm equips entrepreneurs and established companies with the tools to thrive in competitive markets.",
    country: "Pakistan",
    code: "PK",
    flag: "🇵🇰",
    city: "Lahore",
    address:
      "35 A, Sector C, Commercial Area, Bahria Town, Lahore, Pakistan",
    phone: "+92-339-8586875",
    email: "asad.habib@anchorpoint.pro",
    website: "www.anchorpoint.pro",
    logo: anchorpointLogo,
  },
  {
    name: "Crowe Nepal",
    legalName: "B.K Agrawal & Co.",
    description:
      "An audit, tax, and advisory services firm in Nepal, backed by a network of highly qualified professionals across a range of disciplines and offering a comprehensive set of solutions to clients of every size.",
    country: "Nepal",
    code: "NP",
    flag: "🇳🇵",
    city: "Kathmandu",
    address:
      "Saraswati Vatika 122 Pannahiti Marg, Sifal, Ward No. 7, PO Box: 3761, Kathmandu, Nepal",
    phone: "+977-1-4481865",
    email: "info@crowe.com.np",
    website: "www.crowe.com/np",
    logo: croweLogo,
  },
];

type CountryEntry = { code: string; name: string; flag: string };

const COUNTRIES: CountryEntry[] = [
  { code: "PK", name: "Pakistan",   flag: "🇵🇰" },
  { code: "NP", name: "Nepal",      flag: "🇳🇵" },
  { code: "IN", name: "India",      flag: "🇮🇳" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka",  flag: "🇱🇰" },
];

// ════════════════════════════════════════════════════════════════════════════
// GEOLOCATION  detect user country once and cache for the session.
// Uses https://api.country.is/ free, no API key, returns { ip, country }.
// Falls back silently to null if the request fails or is blocked.
// ════════════════════════════════════════════════════════════════════════════

function useDetectedCountry(): string | null {
  const [country, setCountry] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("bz_detected_country");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (country) return;
    let cancelled = false;

    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch("https://api.country.is/", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) return;
        const data: { country?: string } = await res.json();
        if (cancelled || !data?.country) return;
        setCountry(data.country);
        try {
          sessionStorage.setItem("bz_detected_country", data.country);
        } catch {
          /* sessionStorage unavailable acceptable */
        }
      } catch {
        /* network failure / timeout / blocked silent fallback */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [country]);

  return country;
}

// Reorder the country list so the detected country sits first.
// If detection is null or not in the list, return the canonical order.
function orderCountries(
  list: CountryEntry[],
  detected: string | null,
): CountryEntry[] {
  if (!detected) return list;
  const idx = list.findIndex((c) => c.code === detected);
  if (idx <= 0) return list;
  return [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)];
}

// ════════════════════════════════════════════════════════════════════════════
// [HERO] dark olive surface, geo-detection indicator
// ════════════════════════════════════════════════════════════════════════════

function HeroSection({
  detectedCountry,
}: {
  detectedCountry: CountryEntry | null;
}) {
  return (
    <Section tone="dark" pad="hero" className="overflow-hidden">
      <DotGrid tone="dark" />
      <Container>
        <div className="relative flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Bizak Partner Network
          </BadgeGreen>

          <Heading
            level={2}
            tone="dark"
            className="max-w-[820px]"
            style={{ marginBottom: 28 }}
          >
            Find a certified Bizak partner{" "}
            <Heading.Muted>near you.</Heading.Muted>
          </Heading>

          <p
            className="max-w-[620px] text-[15px] leading-[1.7] text-white/72"
            style={{ marginBottom: 36 }}
          >
            Vetted implementation firms across the region. Every partner is
            exam-certified, renewed annually, and listed by country so you can
            reach the team closest to you.
          </p>

          <PillGroup>
            <Pill
              variant="accent"
              withArrowUpRight
              href="https://system.bizakerp.com/account/self-register"
            >
              Get Started
            </Pill>
            <Pill variant="ghostDark" withArrow href="/contact">
              Request Demo
            </Pill>
          </PillGroup>

          {detectedCountry && (
            <div className="mt-10 inline-flex items-center gap-2.5 rounded-bz-pill border border-white/10 bg-white/[0.04] px-4 py-2 text-[12.5px] text-white/72">
              <span
                aria-hidden
                className="size-1.5 rounded-bz-pill bg-bz-fire"
              />
              <span>
                Showing partners for{" "}
                <span className="font-medium text-bz-fire">
                  {detectedCountry.flag} {detectedCountry.name}
                </span>
              </span>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] DIRECTORY  location filters + partner list
// ════════════════════════════════════════════════════════════════════════════

function DirectorySection({ detected }: { detected: string | null }) {
  const orderedCountries = useMemo(
    () => orderCountries(COUNTRIES, detected),
    [detected],
  );

  // Choose initial filter: detected country if listed, else "ALL".
  const initial = useMemo<string>(() => {
    if (detected && COUNTRIES.some((c) => c.code === detected)) return detected;
    return "ALL";
  }, [detected]);

  const [filter, setFilter] = useState<string>(initial);
  const [userTouched, setUserTouched] = useState(false);

  // If detection resolves *after* first render (no cache), update the
  // selection but only if the user hasn't manually picked something.
  useEffect(() => {
    if (userTouched) return;
    if (!detected) return;
    if (COUNTRIES.some((c) => c.code === detected)) {
      setFilter(detected);
    }
  }, [detected, userTouched]);

  const handleSelect = (code: string) => {
    setUserTouched(true);
    setFilter(code);
  };

  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? PARTNERS
        : PARTNERS.filter((p) => p.code === filter),
    [filter],
  );

  const selectedName =
    filter === "ALL"
      ? "across all locations"
      : `in ${orderedCountries.find((c) => c.code === filter)?.name ?? filter}`;

  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Directory"
          title={
            <>
              Browse partners <Heading.Muted>by location.</Heading.Muted>
            </>
          }
          description="Every partner listed is exam-certified by the Bizak Architect Academy and renewed annually. Filter by country to find the team closest to you."
          titleMaxWidth={680}
        />

        {/* Location filter chips */}
        <div
          role="group"
          aria-label="Filter partners by country"
          className="mb-7 flex flex-wrap gap-2"
        >
          <FilterChip
            active={filter === "ALL"}
            onClick={() => handleSelect("ALL")}
          >
            <Globe size={13} strokeWidth={1.8} />
            All locations
          </FilterChip>
          {orderedCountries.map((c) => (
            <FilterChip
              key={c.code}
              active={filter === c.code}
              autoSuggested={!userTouched && c.code === detected}
              onClick={() => handleSelect(c.code)}
            >
              <span className="text-[13px] leading-none">{c.flag}</span>
              {c.name}
            </FilterChip>
          ))}
        </div>

        {/* Result count */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-[13px] text-bz-text-muted">
            <span className="font-medium text-bz-text tabular-nums">
              {filtered.length}
            </span>{" "}
            certified partner{filtered.length === 1 ? "" : "s"} {selectedName}
          </p>
        </div>

        {/* Partner cards */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filtered.map((p) => (
              <PartnerCard key={p.name} partner={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            country={
              orderedCountries.find((c) => c.code === filter)?.name ??
              "your country"
            }
          />
        )}
      </Container>
    </Section>
  );
}

// ── Filter chip ─────────────────────────────────────────────────────────────

function FilterChip({
  active,
  autoSuggested,
  onClick,
  children,
}: {
  active?: boolean;
  autoSuggested?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-bz-pill border px-3.5 text-[13px] font-medium transition-colors",
        active
          ? "border-bz-olive bg-bz-olive text-bz-paper"
          : "border-bz-line bg-bz-surface text-bz-text-muted hover:border-bz-olive/40 hover:bg-bz-paper-warm hover:text-bz-text",
      )}
    >
      {children}
      {autoSuggested && !active && (
        <span
          aria-hidden
          className="ml-0.5 inline-flex size-1.5 rounded-bz-pill bg-bz-leaf-deep"
        />
      )}
    </button>
  );
}

// ── Partner card ────────────────────────────────────────────────────────────

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:gap-7 sm:p-7">
        {/* Logo */}
        <div className="flex w-full shrink-0 justify-center sm:w-auto sm:justify-start">
          <div className="size-[120px] overflow-hidden rounded-bz-xl border border-bz-line bg-bz-paper-warm sm:size-[140px]">
            <img
              src={partner.logo}
              alt={`${partner.name} logo`}
              className="size-full object-contain p-3"
              loading="lazy"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-medium leading-tight tracking-tight text-bz-text sm:text-[20px]">
                {partner.name}
              </h3>
              {partner.legalName && (
                <p className="mt-1 text-[12.5px] text-bz-text-soft">
                  {partner.legalName}
                </p>
              )}
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-bz-text-muted">
                <span aria-hidden className="text-[13px] leading-none">
                  {partner.flag}
                </span>
                {partner.city}, {partner.country}
              </p>
            </div>
            <StatusChip variant="posted">
              <span className="inline-flex items-center gap-1">
                <BadgeCheck size={12} strokeWidth={2.2} /> Certified
              </span>
            </StatusChip>
          </div>

          <p className="text-[13.5px] leading-[1.7] text-bz-text-muted">
            {partner.description}
          </p>

          <p className="flex items-start gap-2 text-[12px] leading-[1.55] text-bz-text-soft">
            <MapPin
              size={12}
              strokeWidth={1.7}
              className="mt-[2px] shrink-0"
            />
            <span>{partner.address}</span>
          </p>

          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-4 border-t border-bz-line-soft pt-5">
            <ContactLink
              icon={Phone}
              label="Phone"
              value={partner.phone}
              href={`tel:${partner.phone.replace(/[^\d+]/g, "")}`}
            />
            <ContactLink
              icon={Mail}
              label="Email"
              value={partner.email}
              href={`mailto:${partner.email}`}
            />
            {partner.website && (
              <ContactLink
                icon={Globe}
                label="Website"
                value={partner.website}
                href={`https://${partner.website.replace(/^https?:\/\//, "")}`}
                external
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex min-w-[180px] flex-1 items-start gap-3 text-left"
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-olive transition-colors group-hover:bg-bz-fire-mid">
        <Icon size={14} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
          {label}
        </div>
        <div className="mt-0.5 truncate text-[13px] font-medium text-bz-text transition-colors group-hover:text-bz-olive">
          {value}
          {external && (
            <ArrowUpRight
              size={11}
              strokeWidth={1.8}
              className="ml-1 inline-block opacity-60"
            />
          )}
        </div>
      </div>
    </a>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ country }: { country: string }) {
  return (
    <div className="rounded-bz-2xl border border-dashed border-bz-line bg-bz-surface p-8 text-center sm:p-12">
      <h3 className="text-[18px] font-medium tracking-tight text-bz-text">
        No certified partners in {country} yet.
      </h3>
      <p className="mx-auto mt-3 max-w-[480px] text-[13.5px] leading-[1.65] text-bz-text-muted">
        We're actively expanding. While we onboard a local partner, our team
        can match you with a nearby firm or guide you through a direct
        rollout.
      </p>
      <div className="mt-6 flex justify-center">
        <PillGroup>
          <Pill variant="dark" withArrow href="/contact">
            Talk to Sales
          </Pill>
          <Pill variant="light" withArrow href="/partners">
            Become a Partner
          </Pill>
        </PillGroup>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function FindAPartnerPage() {
  const detected = useDetectedCountry();
  const detectedCountry = detected
    ? COUNTRIES.find((c) => c.code === detected) ?? null
    : null;

  return (
    <main>
      <HeroSection detectedCountry={detectedCountry} />
      <DirectorySection detected={detected} />
    </main>
  );
}
