"use client";

import {
  sessionMinutes,
  type Session,
  type SessionName,
  type Race,
  type SessionResult,
} from "../data/schedule";
import { driverStandings, teams } from "../data/standings";
import LiveDot from "./LiveDot";
import ResultsTable, { type ResultsRow } from "./ResultsTable";

export const driverInfo = new Map(
  driverStandings.map((d) => [d.name, { team: teams[d.team], photo: d.photo }]),
);

const startMs = (s: Session) => new Date(s.start).getTime();
const endMs = (s: Session) => startMs(s) + sessionMinutes[s.name] * 60_000;

/** "1:17.400" -> seconds */
export function lapSeconds(time: string) {
  const [m, s] = time.split(":");
  return Number(m) * 60 + Number(s);
}

function sessionStatus(s: Session, now: number) {
  if (now >= endMs(s)) return "done" as const;
  if (now >= startMs(s)) return "live" as const;
  return "upcoming" as const;
}

/** Finished sessions that have results, and which one to show (picked, else latest). */
export function resolveShownSession(
  race: Race,
  now: number,
  picked: SessionName | null,
): {
  selectable: Session[];
  shown: { session: Session; results: SessionResult[] } | null;
} {
  const results = race.sessionResults ?? {};
  const selectable = race.sessions.filter(
    (s) => sessionStatus(s, now) === "done" && results[s.name],
  );
  const session =
    selectable.find((s) => s.name === picked) ??
    selectable[selectable.length - 1];
  return {
    selectable,
    shown: session ? { session, results: results[session.name]! } : null,
  };
}

/**
 * Timetable for the current race weekend, plus results of the shown
 * finished session.
 */
export default function WeekendSessions({
  race,
  now,
  selectable,
  shown,
  onPick,
}: {
  race: Race;
  now: number;
  selectable: Session[];
  shown: { session: Session; results: SessionResult[] } | null;
  onPick: (name: SessionName) => void;
}) {
  const rows: ResultsRow[] = [];
  if (shown) {
    shown.results.forEach((r, i) => {
      rows.push({
        position: i + 1,
        name: r.name,
        team: teams[r.team],
        value: r.time,
        sub: r.gap,
      });
    });
  }

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-navy-800 dither-panel">
      <div className="flex items-center gap-2 px-6 pb-4 pt-5">
        <LiveDot />
        <h3 className="text-lg font-semibold tracking-tight text-navy-50">
          Weekend Timetable
        </h3>
      </div>

      <ol className="grid grid-cols-5 gap-2 px-6 pb-5">
        {race.sessions.map((s) => {
          const status = sessionStatus(s, now);
          const canPick = selectable.includes(s);
          const isShown = shown?.session === s;
          return (
            <li key={s.name}>
              <button
                type="button"
                disabled={!canPick}
                aria-pressed={canPick ? isShown : undefined}
                onClick={() => onPick(s.name)}
                className={`flex w-full flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${
                  isShown
                    ? "border-navy-600 bg-navy-800"
                    : status === "live"
                      ? "border-red-600/60 bg-red-950/30"
                      : "border-navy-800 enabled:hover:bg-navy-900"
                } disabled:cursor-default`}
              >
                <span className="text-sm font-semibold text-navy-50">
                  {s.name}
                </span>
                <span className="text-xs tabular-nums text-navy-400">
                  {new Date(s.start).toLocaleString(undefined, {
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
                  {status === "done" && (
                    <span className="text-navy-500">Finished</span>
                  )}
                  {status === "live" && (
                    <>
                      <LiveDot size="sm" />
                      <span className="text-red-400">Live</span>
                    </>
                  )}
                  {status === "upcoming" && (
                    <span className="text-navy-600">Upcoming</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-navy-800">
        {shown ? (
          <>
            <h4 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-navy-400">
              {shown.session.name} Results
            </h4>
            <ResultsTable
              nameHeader="Driver"
              valueHeader={shown.session.name === "Race" ? "Time" : "Best Lap"}
              rows={rows}
            />
          </>
        ) : (
          <p className="px-6 py-5 text-sm text-navy-400">
            No sessions finished yet — results will appear here after FP1.
          </p>
        )}
      </div>
    </section>
  );
}
