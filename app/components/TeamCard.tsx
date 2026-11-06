import Image from "next/image";
import Link from "next/link";
import { driverSlug } from "../data/driverProfiles";
import type { Team } from "../data/standings";
import type { TeamProfile } from "../data/teamProfiles";
import { DetailStat, numberFormat, Stat, StatsSection, TeamLogo } from "./DriverCard";

/** Shown for principals without a freely licensed photo. */
const PLACEHOLDER = "/principals/placeholder.webp";
/** How far (as a share of a portrait's width) each person tucks behind the next. */
const OVERLAP = 56;

function ExpandHint({ expanded, className = "" }: { expanded: boolean; className?: string }) {
  return (
    <span
      className={`items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white/70 transition-colors group-hover:text-white ${className}`}
    >
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
  );
}

/**
 * Large team card on the team's colour: team principal and both drivers side
 * by side, overlapping — principal at the back, drivers stepping forward.
 * Clicking it opens a panel with 2026 season and all-time stats, the line-up,
 * and the principal photo's credit. Its id is the team id (/teams#mclaren).
 */
export default function TeamCard({
  team,
  profile,
  expanded,
  onToggle,
  eager = false,
  asOf,
}: {
  team: Team;
  profile: TeamProfile;
  expanded: boolean;
  onToggle: () => void;
  eager?: boolean;
  asOf?: string;
}) {
  const { season, allTime, principal, drivers } = profile;
  const panelId = `${profile.id}-stats`;
  const people = [
    { key: "principal", src: principal.photo ?? PLACEHOLDER, alt: principal.name, isPrincipal: true },
    ...drivers.map((d) => ({ key: d.name, src: d.portrait, alt: d.name, isPrincipal: false })),
  ];

  return (
    <article
      id={profile.id}
      className={`scroll-mt-20 overflow-hidden rounded-2xl shadow-lg shadow-black/30 transition lg:scroll-mt-6 ${
        expanded ? "" : "hover:-translate-y-1 hover:shadow-xl"
      }`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        // Phones: text on top, people along the bottom. md+: text left, people right.
        className="group relative isolate block h-[23rem] w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white md:h-80"
        style={{
          background: `linear-gradient(100deg, color-mix(in srgb, ${team.color} 40%, black) 0%, color-mix(in srgb, ${team.color} 70%, black) 45%, ${team.color} 100%)`,
        }}
      >
        <span aria-hidden className="dither-dots pointer-events-none absolute inset-0 -z-20" />

        {/* Principal, then the two drivers — each one overlapping the last. */}
        {/*
          Smaller between md and xl, where the text column needs most of the width.
          Each person slides right by OVERLAP of their own width per place from the
          end, so they overlap a little at any size (the portraits have ~23%
          transparent margin each side, hence the large-looking number).
        */}
        <span className="pointer-events-none absolute bottom-0 right-1 flex h-44 w-max items-end md:right-4 md:h-[72%] xl:h-[92%]">
          {people.map((p, i) => (
            <Image
              key={p.key}
              src={p.src}
              alt=""
              width={400}
              height={440}
              loading={eager ? "eager" : "lazy"}
              style={{ zIndex: i, translate: `${(people.length - 1 - i) * OVERLAP}% 0` }}
              className={`relative w-auto shrink-0 object-contain object-bottom drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.02] ${
                p.isPrincipal ? "h-[92%]" : "h-full"
              }`}
            />
          ))}
        </span>

        {/* Full height so a button's built-in vertical centring can't push the text into the people on phones. */}
        <span className="relative flex h-full flex-col justify-start gap-2.5 p-5 md:max-w-[46%] md:justify-center md:gap-3 md:p-7 xl:max-w-[48%]">
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-white/80">
            <TeamLogo team={team} />
            {season.position ? (
              <>
                <span className="font-bold tabular-nums text-white">P{season.position}</span>
                <span aria-hidden className="text-white/40">·</span>
                <span className="tabular-nums">{numberFormat.format(season.points)} pts</span>
              </>
            ) : (
              <span>2026</span>
            )}
          </span>

          <span className="block text-3xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-4xl">
            {team.name}
          </span>

          {/* All-time highlights; on phones they're in the expanded panel. */}
          <span className="hidden gap-3 md:flex">
            <Stat value={allTime.titles} label={allTime.titles === 1 ? "Title" : "Titles"} />
            <Stat value={allTime.wins} label="Wins" />
            <Stat value={allTime.poles} label="Poles" />
          </span>

          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/75">
            <Image
              src={`/flags/${profile.baseCountry}.png`}
              alt=""
              width={20}
              height={14}
              className="h-3.5 w-5 rounded-[2px] object-cover ring-1 ring-black/20"
            />
            {profile.base}
            <span aria-hidden className="text-white/40">·</span>
            {profile.powerUnit} power
          </span>

          <span className="text-sm leading-snug text-white/85">
            <span className="text-white/60">{principal.role}:</span> {principal.name}
          </span>

          <ExpandHint expanded={expanded} className="mt-1 flex" />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={`${team.name} stats`}
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
            <StatsSection title="2026 Season" subtitle={asOf} color={team.color} columns={4}>
              <DetailStat label="Position" value={season.position ? `P${season.position}` : "–"} accent />
              <DetailStat label="Points" value={numberFormat.format(season.points)} accent />
              <DetailStat label="Wins" value={season.wins} />
              <DetailStat label="Podiums" value={season.podiums} />
              <DetailStat label="Poles" value={season.poles} />
              <DetailStat label="1–2s" value={season.oneTwos} />
              <DetailStat label="Fastest laps" value={season.fastestLaps} />
              <DetailStat label="DNFs" value={season.dnfs} />
            </StatsSection>

            <div className="flex flex-col gap-6">
              <StatsSection title="All-time" subtitle="As this constructor" color={team.color} columns={4}>
                <DetailStat label={allTime.titles === 1 ? "Title" : "Titles"} value={allTime.titles} accent />
                <DetailStat label="Wins" value={allTime.wins} accent />
                <DetailStat label="Podiums" value={allTime.podiums} />
                <DetailStat label="Poles" value={allTime.poles} />
              </StatsSection>

              <section>
                <div className="mb-3 flex items-baseline gap-2">
                  <span aria-hidden className="h-3 w-1 self-center rounded-full" style={{ background: team.color }} />
                  <h3 className="text-base font-semibold text-navy-50">Drivers</h3>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {drivers.map((d) => (
                    <li key={d.name}>
                      <Link
                        href={`/drivers#${driverSlug(d.name)}`}
                        className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-2.5 py-2 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.08]"
                      >
                        <span
                          className="block h-9 w-9 shrink-0 overflow-hidden rounded-full"
                          style={{ backgroundColor: team.color }}
                        >
                          <Image src={d.photo} alt="" width={36} height={36} className="h-full w-full object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-navy-50">{d.name}</span>
                          <span className="block text-xs tabular-nums text-navy-400">
                            {d.position ? `P${d.position} · ` : ""}
                            {numberFormat.format(d.points)} pts
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {principal.credit && (
              <p className="text-[11px] leading-snug text-navy-500 md:col-span-2">
                Photo of {principal.name}:{" "}
                <a href={principal.credit.source} className="underline hover:text-navy-300">
                  {principal.credit.author}
                </a>{" "}
                via Wikimedia Commons,{" "}
                <a href={principal.credit.licenseUrl} className="underline hover:text-navy-300">
                  {principal.credit.license}
                </a>{" "}
                — background removed.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
