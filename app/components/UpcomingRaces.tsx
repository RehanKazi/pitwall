"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  raceEndMs,
  sessionMinutes,
  type Session,
  type Race,
  type SessionName,
} from "../data/schedule";
import LiveDot from "./LiveDot";
import RaceClassification from "./RaceClassification";
import TrackMap, { LAP_SPEEDUP, type LapMarker, type Track } from "./TrackMap";
import WeekendSessions, {
  driverInfo,
  lapSeconds,
  resolveShownSession,
} from "./WeekendSessions";

export type RaceWithTrack = Race & { track: Track };

// ---- Clock: ticks once per second on the client, null during server render ----

function subscribeClock(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}
const getNow = () => Math.floor(Date.now() / 1000) * 1000;
const getServerNow = () => null;

function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, getNow, getServerNow);
}

// ---- Time helpers ----

const ms = (iso: string) => new Date(iso).getTime();
const sessionEnd = (s: Session) => ms(s.start) + sessionMinutes[s.name] * 60_000;
const raceOver = (race: Race, now: number) => raceEndMs(race) <= now;

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

/** What the countdown should show for a race at a given moment. */
function countdownTarget(race: Race, now: number) {
  const live = race.sessions.find(
    (s) => ms(s.start) <= now && now < sessionEnd(s),
  );
  if (live) return { kind: "live" as const, session: live };

  const next = race.sessions.find((s) => ms(s.start) > now);
  if (!next || raceOver(race, now)) return { kind: "done" as const };

  const weekendStarted = now >= ms(race.sessions[0].start);
  return {
    kind: "upcoming" as const,
    session: next,
    label: weekendStarted ? `${next.name} starts in` : "Race weekend starts in",
    remaining: ms(next.start) - now,
  };
}

// ---- Components ----

/** Winner (with photo on their team colour) and pole sitter of a finished race. */
function RaceResult({ result }: { result: NonNullable<Race["result"]> }) {
  const winner = driverInfo.get(result.winner);
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-navy-400">
        Race result
      </p>
      <div className="mt-2 flex items-center gap-3">
        {winner && (
          <span
            className="block h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/80"
            style={{ backgroundColor: winner.team.color }}
          >
            <Image src={winner.photo} alt="" width={48} height={48} className="h-full w-full object-cover" />
          </span>
        )}
        <div>
          <p className="text-lg font-semibold leading-tight text-navy-50">{result.winner}</p>
          <p className="text-xs text-navy-400">
            Winner{winner ? ` · ${winner.team.name}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-navy-300">
        <span className="text-navy-500">Pole position:</span> {result.pole}
      </p>
    </div>
  );
}

function Countdown({ race, now }: { race: Race; now: number | null }) {
  if (race.result) return <RaceResult result={race.result} />;
  if (now === null) {
    return <div className="h-[92px]" aria-hidden />;
  }

  const target = countdownTarget(race, now);

  if (target.kind === "done") {
    return <p className="text-sm text-navy-400">This race weekend is over.</p>;
  }

  if (target.kind === "live") {
    return (
      <div className="flex items-center gap-2">
        <LiveDot />
        <span className="text-lg font-semibold text-navy-50">
          {target.session.name} is live now
        </span>
      </div>
    );
  }

  const total = Math.max(0, Math.floor(target.remaining / 1000));
  const parts = [
    { label: "Days", value: Math.floor(total / 86400) },
    { label: "Hrs", value: Math.floor((total % 86400) / 3600) },
    { label: "Min", value: Math.floor((total % 3600) / 60) },
    { label: "Sec", value: total % 60 },
  ];
  const localStart = new Date(target.session.start).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-navy-400">
        {target.label}
      </p>
      <div className="mt-2 flex gap-2" role="timer" aria-live="off">
        {parts.map((p) => (
          <div
            key={p.label}
            className="flex w-16 flex-col items-center rounded-lg bg-navy-900 py-2"
          >
            <span className="text-2xl font-semibold tabular-nums text-navy-50">
              {String(p.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-navy-500">
              {p.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-navy-500">
        {target.session.name} · {localStart} (your time)
      </p>
    </div>
  );
}

function RacePreview({
  race,
  now,
  live,
  lap,
  lapCaption,
}: {
  race: RaceWithTrack;
  now: number | null;
  live: boolean;
  lap: LapMarker | null;
  lapCaption: string | null;
}) {
  return (
    <div className="grid gap-6 p-6 md:grid-cols-[1fr_minmax(0,1.1fr)] md:items-center">
      <div className="flex flex-col gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-navy-500">
            {live && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-600/15 px-2 py-0.5 text-red-400">
                <LiveDot size="sm" />
                Live
              </span>
            )}
            Round {race.round} · {formatRange(race.start, race.end)}
            {race.sprint && (
              <span className="rounded-full bg-navy-800 px-2 py-0.5 text-[10px] text-navy-200">
                Sprint
              </span>
            )}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-navy-50">
            {race.name}
          </h2>
          <p className="mt-1 text-sm text-navy-400">
            {race.circuit}, {race.location}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-navy-400">
            Laps
          </p>
          <p className="text-3xl font-semibold tabular-nums text-navy-50">
            {race.laps}
          </p>
        </div>

        <Countdown race={race} now={now} />
      </div>

      <div className="flex flex-col items-center justify-center gap-3">
        <TrackMap
          track={race.track}
          label={`Track layout of ${race.circuit}`}
          lap={lap}
        />
        {lapCaption && (
          <p className="text-center text-xs text-navy-500">{lapCaption}</p>
        )}
      </div>
    </div>
  );
}

/** Scroll arrow at either end of the race strip (for mouse users without a trackpad). */
function ScrollArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center self-stretch border-b border-navy-800 px-1">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={direction === "left" ? "Show earlier races" : "Show later races"}
        className="flex h-8 w-8 items-center justify-center rounded-full text-navy-300 transition-colors hover:bg-navy-800 hover:text-navy-50 disabled:pointer-events-none disabled:opacity-25"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path
            d={direction === "left" ? "m10 4-4 4 4 4" : "m6 4 4 4-4 4"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Every round of the season as a sideways-scrolling strip of tabs, with the
 * selected race's preview attached underneath. The strip starts scrolled so
 * the current/next race is at the far left; scroll back for finished rounds
 * (which show their result) or forward for later ones.
 */
export default function UpcomingRaces({ races }: { races: RaceWithTrack[] }) {
  const now = useNow();
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  // Session picked in the timetable, remembered per race.
  const [pickedSession, setPickedSession] = useState<{
    round: number;
    name: SessionName;
  } | null>(null);

  // The current race is the first one not yet finished. Before the clock is
  // known (server render) fall back to the first race without a result.
  const current =
    now === null
      ? races.find((r) => !r.result)
      : races.find((r) => !raceOver(r, now));
  const selected =
    races.find((r) => r.round === selectedRound) ?? current ?? races[races.length - 1];
  // The current race's weekend is "live" from FP1 until the race ends.
  const currentIsLive =
    !!current &&
    now !== null &&
    current.sessions.length > 0 &&
    now >= ms(current.sessions[0].start);

  // ---- Sideways scrolling ----
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  }, []);
  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Put the current race at the far left — on first load, and again if the
  // current race changes (e.g. a weekend ends while the page is open).
  const currentRound = current?.round;
  useEffect(() => {
    const el = scrollerRef.current;
    const tab = currentRound && document.getElementById(`race-tab-${currentRound}`);
    if (el && tab) el.scrollLeft = tab.offsetLeft;
    updateEdges();
  }, [currentRound, updateEdges]);

  useEffect(() => {
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const weekend =
    current && currentIsLive && now !== null
      ? resolveShownSession(
          current,
          now,
          pickedSession?.round === current.round ? pickedSession.name : null,
        )
      : null;

  // Fastest driver of the shown session, lapping the track map.
  let lap: LapMarker | null = null;
  let lapCaption: string | null = null;
  const top = weekend?.shown?.results[0];
  const topInfo = top && driverInfo.get(top.name);
  if (current && weekend?.shown && top && topInfo) {
    lap = {
      key: `${current.round}-${weekend.shown.session.name}`,
      driverName: top.name,
      photo: topInfo.photo,
      color: topInfo.team.color,
      lapSeconds: lapSeconds(top.time),
    };
    lapCaption = `Fastest in ${weekend.shown.session.name}: ${top.name} · ${top.time} (shown ${LAP_SPEEDUP}× speed)`;
  }

  return (
    <section>
      <div className="flex">
        <ScrollArrow direction="left" disabled={edges.atStart} onClick={() => scrollByPage(-1)} />

        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* The ::after line is the panel's top edge; the selected tab sits above it. */}
          <div
            role="tablist"
            aria-label="2026 races"
            className="relative flex w-max gap-1 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-navy-800"
          >
            {races.map((race) => {
              const isSelected = race.round === selected.round;
              const isPast = race.round < (current?.round ?? Infinity);
              return (
                <button
                  key={race.round}
                  id={`race-tab-${race.round}`}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  aria-controls="race-preview"
                  onClick={() => setSelectedRound(race.round)}
                  className={`flex w-44 shrink-0 items-center gap-2.5 rounded-t-xl border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "dither-panel relative z-10 border-navy-800 border-b-transparent"
                      : // Translucent backing keeps the text readable over the background glow.
                        `border-transparent bg-navy-975/70 hover:bg-navy-900 ${isPast ? "text-navy-400" : "text-navy-200"}`
                  }`}
                >
                  <Image
                    src={`/flags/${race.countryCode}.png`}
                    alt=""
                    width={32}
                    height={22}
                    className={`h-[22px] w-8 shrink-0 rounded-sm object-cover ring-1 ring-white/10 ${
                      isPast && !isSelected ? "opacity-60" : ""
                    }`}
                  />
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm font-medium ${
                        isSelected ? "text-navy-50" : ""
                      }`}
                    >
                      {race.shortName}
                    </span>
                    <span className="block truncate text-xs text-navy-400">
                      {race === current ? (
                        <span className="flex items-center gap-1.5 font-medium text-red-400">
                          {currentIsLive && <LiveDot size="sm" />}
                          {currentIsLive ? "Live weekend" : "Next"}
                        </span>
                      ) : (
                        // Tight dash so cross-month weekends (30 Oct–1 Nov) fit the tab.
                        `R${race.round} · ${formatRange(race.start, race.end).replace(" – ", "–")}`
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <ScrollArrow direction="right" disabled={edges.atEnd} onClick={() => scrollByPage(1)} />
      </div>

      <div
        id="race-preview"
        role="tabpanel"
        aria-labelledby={`race-tab-${selected.round}`}
        className="rounded-b-xl border border-t-0 border-navy-800 dither-panel"
      >
        <RacePreview
          race={selected}
          now={now}
          live={selected === current && currentIsLive}
          lap={selected === current ? lap : null}
          lapCaption={selected === current ? lapCaption : null}
        />
        {selected.classification && (
          <RaceClassification
            key={selected.round}
            race={selected.classification}
            sprint={selected.sprint}
          />
        )}
      </div>

      {current && selected === current && weekend && now !== null && (
        <WeekendSessions
          race={current}
          now={now}
          selectable={weekend.selectable}
          shown={weekend.shown}
          onPick={(name) => setPickedSession({ round: current.round, name })}
        />
      )}
    </section>
  );
}
