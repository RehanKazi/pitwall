import Image from "next/image";
import type { ReactNode } from "react";
import type { DriverProfile } from "../data/driverProfiles";
import type { Team } from "../data/standings";

const bornFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** One career-stat tile, e.g. "208 / Podiums". */
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex w-20 flex-col items-center">
      <span className="text-4xl font-black leading-none tabular-nums text-white">
        {value}
      </span>
      <span className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
        {label}
      </span>
    </span>
  );
}

/**
 * White version of the team logo — the colour one would vanish on its own
 * team colour (e.g. orange McLaren on orange).
 */
function TeamLogo({ team }: { team: Team }) {
  return (
    <Image
      src={team.logoWhite}
      alt=""
      width={20}
      height={20}
      unoptimized
      className="h-5 w-5 shrink-0 object-contain"
    />
  );
}

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/** One stat in the expanded panel. */
function DetailStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white/[0.04] px-2.5 py-2.5 ring-1 ring-white/[0.06]">
      <dt className="whitespace-nowrap text-[10.5px] font-medium uppercase tracking-wide text-navy-300">
        {label}
      </dt>
      <dd
        className={`mt-1 text-2xl font-bold leading-none tabular-nums ${
          accent ? "text-white" : "text-navy-50"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function StatsSection({
  title,
  subtitle,
  color,
  columns,
  children,
}: {
  title: string;
  subtitle?: string;
  color: string;
  /** Tiles per row from the sm breakpoint up — sized so every row is full. */
  columns: 3 | 4;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <span aria-hidden className="h-3 w-1 self-center rounded-full" style={{ background: color }} />
        <h3 className="text-base font-semibold text-navy-50">{title}</h3>
        {subtitle && <span className="text-xs text-navy-400">{subtitle}</span>}
      </div>
      <dl className={`grid grid-cols-2 gap-2 ${columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        {children}
      </dl>
    </section>
  );
}

/**
 * Large driver card on the team's colour, with the driver's portrait rising
 * out of the right-hand side. Clicking the card toggles a panel underneath
 * with 2026 season and career stats. The card's id is the driver's slug so
 * other pages can link straight to it (/drivers#lando-norris).
 */
export default function DriverCard({
  id,
  name,
  portrait,
  team,
  profile,
  expanded,
  onToggle,
  eager = false,
  asOf,
}: {
  /** Element id — the driver's slug, used for deep links. */
  id: string;
  name: string;
  portrait: string;
  team: Team;
  profile: DriverProfile;
  expanded: boolean;
  onToggle: () => void;
  /** Load the portrait immediately (for cards visible on first paint). */
  eager?: boolean;
  /** Which round the season stats run to, e.g. "After round 19 · Mexico City GP". */
  asOf?: string;
}) {
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  const panelId = `${id}-stats`;
  const { season, career } = profile;

  return (
    <article
      id={id}
      className={`scroll-mt-6 overflow-hidden rounded-2xl shadow-lg shadow-black/30 transition ${
        expanded ? "" : "hover:-translate-y-1 hover:shadow-xl"
      }`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="group relative isolate block h-72 w-full overflow-hidden text-left sm:h-64 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
        style={{
          // Darker on the left (behind the text), full team colour behind the photo.
          background: `linear-gradient(100deg, color-mix(in srgb, ${team.color} 40%, black) 0%, color-mix(in srgb, ${team.color} 70%, black) 45%, ${team.color} 100%)`,
        }}
      >
        {/* Same fine dot texture as the expanded stats panel */}
        <span aria-hidden className="dither-dots pointer-events-none absolute inset-0 -z-20" />
        {/* Big race number watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-[18%] -z-10 dither-text select-none text-[9rem] font-black leading-none tabular-nums sm:-bottom-10 sm:right-[22%] sm:text-[13rem]"
        >
          {profile.number}
        </span>

        {/* Portrait — anchored to the bottom, filling the card's height */}
        <Image
          src={portrait}
          alt=""
          width={400}
          height={440}
          loading={eager ? "eager" : "lazy"}
          className="pointer-events-none absolute -right-4 bottom-0 h-[86%] w-auto object-contain object-bottom sm:right-4 sm:h-[96%] drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.03] sm:right-10"
        />

        {/* Phones: narrower text column so it clears the portrait. */}
        <span className="relative flex h-full max-w-[64%] flex-col justify-center gap-2.5 p-5 pb-11 sm:max-w-[72%] sm:gap-3 sm:p-7">
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-white/80">
            <TeamLogo team={team} />
            <span className="truncate">{team.name}</span>
            <span aria-hidden className="text-white/40">·</span>
            <span className="font-bold tabular-nums text-white">#{profile.number}</span>
          </span>

          <span className="flex items-end justify-between gap-6">
            <span className="min-w-0 leading-none text-white">
              <span className="block text-lg font-medium sm:text-xl">{first}</span>
              <span className="block truncate text-3xl font-black uppercase tracking-tight sm:text-4xl">
                {last}
              </span>
            </span>

            {/* Career highlights; on phones they're in the expanded panel instead. */}
            <span className="mr-10 hidden shrink-0 -translate-y-3 gap-3 self-start md:flex">
              <Stat value={career.titles} label={career.titles === 1 ? "Title" : "Titles"} />
              <Stat value={career.podiums} label="Podiums" />
              <Stat value={career.poles} label="Poles" />
            </span>
          </span>

          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/75">
            <Image
              src={`/flags/${profile.countryCode}.png`}
              alt=""
              width={20}
              height={14}
              className="h-3.5 w-5 rounded-[2px] object-cover ring-1 ring-black/20"
            />
            {profile.nationality}
            <span aria-hidden className="text-white/40">·</span>
            Born {bornFormat.format(new Date(`${profile.born}T00:00:00Z`))}
          </span>

          <span className="line-clamp-3 text-[13px] leading-snug text-white/85 sm:line-clamp-2 sm:text-sm">
            {profile.bio}
          </span>
        </span>

        {/* Expand hint */}
        <span className="absolute bottom-4 left-5 flex sm:left-7 items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white/70 transition-colors group-hover:text-white">
          {expanded ? "Hide stats" : "More stats"}
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className={`h-3.5 w-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* Expanding stats panel (0fr -> 1fr grid rows animates to content height) */}
      <div
        id={panelId}
        role="region"
        aria-label={`${name} stats`}
        inert={!expanded}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className="dither-panel grid gap-6 border-t-2 p-4 sm:p-6 md:grid-cols-2"
            style={{ borderTopColor: team.color }}
          >
            <StatsSection
              title="2026 Season"
              subtitle={asOf}
              color={team.color}
              columns={4}
            >
              <DetailStat label="Position" value={season.position ? `P${season.position}` : "–"} accent />
              <DetailStat label="Points" value={numberFormat.format(season.points)} accent />
              <DetailStat label="Wins" value={season.wins} />
              <DetailStat label="Podiums" value={season.podiums} />
              <DetailStat label="Poles" value={season.poles} />
              <DetailStat label="Fastest laps" value={season.fastestLaps} />
              <DetailStat label="DNFs" value={season.dnfs} />
              <DetailStat label="Starts" value={season.starts} />
            </StatsSection>

            <StatsSection
              title="Career"
              subtitle="All-time totals"
              color={team.color}
              columns={3}
            >
              <DetailStat label={career.titles === 1 ? "Title" : "Titles"} value={career.titles} accent />
              <DetailStat label="Points" value={numberFormat.format(career.points)} accent />
              <DetailStat label="Wins" value={career.wins} />
              <DetailStat label="Podiums" value={career.podiums} />
              <DetailStat label="Poles" value={career.poles} />
              <DetailStat label="Debut" value={career.debut} />
            </StatsSection>
          </div>
        </div>
      </div>
    </article>
  );
}
