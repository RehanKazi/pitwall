import Image from "next/image";
import type { Race } from "../data/schedule";
import { driverStandings, teams } from "../data/standings";
import ResultsOverlay from "./ResultsOverlay";
import type { Track } from "./TrackMap";

// Built here rather than imported from WeekendSessions: that's a client
// module, so this server component would only get a reference to it.
const driverInfo = new Map(
  driverStandings.map((d) => [d.name, { team: teams[d.team], photo: d.photo }]),
);

const dayMonth = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatRange(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}–${dayMonth.format(e)}`;
  }
  return `${dayMonth.format(s)} – ${dayMonth.format(e)}`;
}

/** Podium blocks in the classic 2-1-3 order, tallest in the middle. */
const STEPS = [
  { place: 2, height: "h-7" },
  { place: 1, height: "h-10" },
  { place: 3, height: "h-5" },
] as const;

function Podium({ podium }: { podium: [string, string, string] }) {
  return (
    <ol className="grid grid-cols-3 items-end gap-1.5" aria-label="Podium">
      {STEPS.map(({ place, height }) => {
        const name = podium[place - 1];
        const info = driverInfo.get(name);
        const surname = name.split(" ").slice(1).join(" ") || name;
        return (
          // Listed visually as 2-1-3; `value` keeps the real finishing order for screen readers.
          <li key={place} value={place} className="flex min-w-0 flex-col items-center">
            <span
              className={`block shrink-0 overflow-hidden rounded-full ring-2 ${
                place === 1 ? "h-11 w-11 ring-white/80" : "h-9 w-9 ring-white/30"
              }`}
              style={{ backgroundColor: info?.team.color ?? "var(--color-navy-800)" }}
            >
              {info && (
                <Image
                  src={info.photo}
                  alt=""
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              )}
            </span>
            <span
              className={`mt-1.5 w-full truncate text-center text-xs ${
                place === 1 ? "font-semibold text-navy-50" : "text-navy-200"
              }`}
              title={name}
            >
              {surname}
            </span>
            {/* The step itself: team colour stripe on top, dithered block below. */}
            <span
              className={`dither-dots mt-1 flex w-full items-start justify-center rounded-t-md border-t-2 bg-navy-900 pt-0.5 text-[11px] font-semibold tabular-nums text-navy-300 ${height}`}
              style={{ borderTopColor: info?.team.color ?? "var(--color-navy-600)" }}
            >
              P{place}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * One round of the season. Finished rounds are greyed out (flag, track and
 * text dimmed) but keep their podium in colour; the next race is outlined
 * in red.
 */
export default function ScheduleCard({
  race,
  track,
  isNext,
}: {
  race: Race;
  track: Track;
  isNext: boolean;
}) {
  const past = !!race.result;
  const round = String(race.round).padStart(2, "0");
  const classification = race.classification;

  return (
    <article
      // Finished races are focusable so keyboard users can open the results too.
      tabIndex={classification ? 0 : undefined}
      className={`group relative isolate flex flex-col overflow-hidden rounded-2xl border p-5 dither-panel transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-300 ${
        isNext
          ? "border-red-500/50 shadow-lg shadow-red-950/40"
          : past
            ? "border-navy-800/70 hover:border-navy-600"
            : "border-navy-800 hover:-translate-y-0.5 hover:border-navy-700"
      }`}
    >
      {classification && (
        <ResultsOverlay
          title={race.shortName}
          round={race.round}
          race={classification}
          sprint={race.sprint}
        />
      )}
      {/* Big dot-pattern round number in the corner. */}
      <span
        aria-hidden
        className={`dither-text pointer-events-none absolute right-3 top-3 -z-10 select-none text-6xl font-black leading-none ${
          past ? "opacity-40" : "opacity-80"
        }`}
        // Coarser dots than the default so the digits read as dithered, not grey.
        style={{
          backgroundImage:
            "radial-gradient(rgb(255 255 255 / 0.45) 1px, transparent 1.25px)",
          backgroundSize: "5px 5px",
        }}
      >
        {round}
      </span>

      {/* Right padding keeps long names and dates clear of the round number. */}
      <header className={`pr-16 ${past ? "opacity-60" : ""}`}>
        <div className="flex items-center gap-2.5">
          <Image
            src={`/flags/${race.countryCode}.png`}
            alt=""
            width={32}
            height={22}
            className={`h-[22px] w-8 shrink-0 rounded-sm object-cover ring-1 ring-white/10 ${
              past ? "grayscale" : ""
            }`}
          />
          <p className="truncate whitespace-nowrap text-xs font-medium uppercase tracking-wider text-navy-400">
            Round {race.round} · {formatRange(race.start, race.end)}
          </p>
          {race.sprint && (
            <span className="shrink-0 rounded-full bg-navy-800 px-1.5 py-px text-[10px] font-medium uppercase tracking-wider text-navy-200">
              Sprint
            </span>
          )}
        </div>
        <h2
          className={`mt-3 text-lg font-semibold leading-tight tracking-tight ${
            past ? "text-navy-300" : "text-navy-50"
          }`}
        >
          {race.name}
        </h2>
        <p className="mt-0.5 truncate text-sm text-navy-400" title={race.circuit}>
          {race.circuit}, {race.location}
        </p>
      </header>

      <div className={`my-4 flex h-32 items-center justify-center ${past ? "opacity-40" : ""}`}>
        <svg
          viewBox={track.viewBox}
          role="img"
          aria-label={`Track layout of ${race.circuit}`}
          className="h-full w-auto max-w-full overflow-visible"
        >
          <path
            d={track.d}
            fill="none"
            stroke={past ? "var(--color-navy-300)" : "#fff"}
            strokeWidth={3.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="mt-auto">
        {race.result ? (
          <Podium podium={race.result.podium} />
        ) : (
          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]">
              <dt className="text-[10.5px] font-medium uppercase tracking-wide text-navy-400">
                Laps
              </dt>
              <dd className="mt-0.5 text-xl font-semibold tabular-nums text-navy-50">
                {race.laps}
              </dd>
            </div>
            <div className="rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]">
              <dt className="text-[10.5px] font-medium uppercase tracking-wide text-navy-400">
                Status
              </dt>
              <dd
                className={`mt-0.5 text-xl font-semibold ${
                  isNext ? "text-red-400" : "text-navy-200"
                }`}
              >
                {isNext ? "Next race" : "Upcoming"}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </article>
  );
}
