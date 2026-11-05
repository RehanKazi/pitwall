"use client";

import { useState } from "react";
import type { ClassifiedRow } from "../data/raceResults";
import { teams } from "../data/standings";

/** "Lewis Hamilton" -> "L. Hamilton" */
function shortName(name: string) {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first[0]}. ${rest.join(" ")}` : name;
}

/** What goes in the right-hand slot: points scored, else DNF/DNS etc. for non-finishers. */
function trailing(r: ClassifiedRow, classified: boolean) {
  if (r.points > 0) return `+${r.points}`;
  return classified ? "" : r.gap;
}

function ResultsGrid({ rows }: { rows: ClassifiedRow[] }) {
  return (
    <ol
      // Fill down the first column, then the second: P1–P11 left, P12–P22 right.
      className="grid flex-1 grid-flow-col grid-cols-2 content-start gap-x-3 px-3 py-3"
      style={{ gridTemplateRows: `repeat(${Math.ceil(rows.length / 2)}, auto)` }}
    >
      {rows.map((r) => {
        const team = teams[r.team];
        const classified = /^\d+$/.test(r.position);
        const podium = classified && Number(r.position) <= 3;
        return (
          <li
            key={r.name}
            className={`grid min-w-0 grid-cols-[0.875rem_3px_minmax(0,1fr)_auto] items-center gap-x-1 py-[4px] text-xs leading-tight ${
              classified ? "" : "text-navy-500"
            }`}
          >
            <span
              className={`text-right text-[11px] font-semibold tabular-nums ${
                podium ? "text-navy-50" : classified ? "text-navy-400" : ""
              }`}
            >
              {classified ? r.position : "–"}
            </span>
            <span
              aria-hidden
              className="h-3 w-[3px] rounded-full"
              style={{ backgroundColor: team?.color, opacity: classified ? 1 : 0.4 }}
            />
            <span
              className={`truncate ${podium ? "font-semibold text-navy-50" : classified ? "text-navy-200" : ""}`}
              title={team ? `${r.name} · ${team.name}` : r.name}
            >
              {shortName(r.name)}
            </span>
            <span className="text-right text-[11px] tabular-nums text-navy-400">
              {trailing(r, classified)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Full classification laid over a finished race's card, shown while the card
 * is hovered or focused (the parent <article> is the `group`). Hidden with
 * `invisible`, not just opacity, so it can't be clicked by accident when
 * closed. Sprint weekends get a Race / Sprint switch at the top.
 */
export default function ResultsOverlay({
  title,
  round,
  race,
  sprint,
}: {
  title: string;
  round: number;
  race: ClassifiedRow[];
  sprint?: ClassifiedRow[];
}) {
  const [showSprint, setShowSprint] = useState(false);
  const rows = sprint && showSprint ? sprint : race;

  return (
    <div className="invisible absolute inset-0 z-20 flex flex-col bg-navy-975 opacity-0 transition-[opacity,visibility] duration-200 dither-dots group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
      <div className="flex items-center justify-between gap-2 border-b border-navy-800 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy-50">
            {title} {sprint && showSprint ? "sprint" : "results"}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-navy-500">
            Round {round}
          </p>
        </div>

        {sprint && (
          <div
            role="group"
            aria-label="Show results for"
            className="flex shrink-0 rounded-full bg-navy-900 p-0.5 ring-1 ring-navy-800"
          >
            {(["Race", "Sprint"] as const).map((label) => {
              const active = (label === "Sprint") === showSprint;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setShowSprint(label === "Sprint")}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active ? "bg-navy-700 text-navy-50" : "text-navy-400 hover:text-navy-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ResultsGrid rows={rows} />
    </div>
  );
}
