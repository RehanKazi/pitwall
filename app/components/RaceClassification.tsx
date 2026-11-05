"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { driverBios, driverSlug } from "../data/driverProfiles";
import type { ClassifiedRow } from "../data/raceResults";
import { teams } from "../data/standings";

const isClassified = (r: ClassifiedRow) => /^\d+$/.test(r.position);

/** The whole classification, P1 down to the last non-finisher. */
function ClassificationTable({ rows }: { rows: ClassifiedRow[] }) {
  return (
    <table className="w-full table-fixed border-collapse text-sm">
      {/* Fixed widths; the driver column gets whatever is left. */}
      <colgroup>
        <col className="w-10" />
        <col className="w-8" />
        <col />
        <col className="w-30" />
        <col className="w-10" />
      </colgroup>
      <thead>
        <tr className="text-xs uppercase tracking-wider text-navy-400">
          <th scope="col" className="py-2 pl-2 text-left font-medium">
            Pos.
          </th>
          <th scope="col" colSpan={2} className="py-2 text-left font-medium">
            Driver
          </th>
          <th scope="col" className="py-2 pr-6 text-right font-medium">
            Time / Gap
          </th>
          <th scope="col" className="py-2 pr-2 text-right font-medium">
            Pts
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const team = teams[r.team];
          const classified = isClassified(r);
          const podium = classified && Number(r.position) <= 3;
          return (
            <tr
              key={r.name}
              className={`border-t border-navy-800 hover:bg-navy-900 ${
                classified ? "" : "text-navy-500"
              }`}
            >
              <td
                className={`py-2 pl-2 tabular-nums ${
                  podium ? "font-semibold text-navy-50" : classified ? "text-navy-300" : ""
                }`}
              >
                {classified ? r.position : "–"}
              </td>
              <td className="py-2">
                <Image
                  src={team.logo}
                  alt={team.name}
                  title={team.name}
                  width={20}
                  height={20}
                  unoptimized
                  className={`h-5 w-5 object-contain ${classified ? "" : "opacity-50"}`}
                />
              </td>
              <td className="truncate py-2 pr-2">
                {/* Link to the driver's card — only current-grid drivers have one. */}
                {driverBios[r.name] ? (
                  <Link
                    href={`/drivers#${driverSlug(r.name)}`}
                    className={`hover:underline ${
                      podium ? "font-semibold text-navy-50" : classified ? "text-navy-100" : ""
                    }`}
                  >
                    {r.name}
                  </Link>
                ) : (
                  <span className={classified ? "text-navy-100" : ""}>{r.name}</span>
                )}
              </td>
              <td className="whitespace-nowrap py-2 pr-6 text-right text-xs tabular-nums text-navy-300">
                {r.gap}
              </td>
              <td
                className={`py-2 pr-2 text-right tabular-nums ${
                  r.points > 0 ? "font-semibold text-navy-50" : "text-navy-600"
                }`}
              >
                {r.points > 0 ? r.points : "–"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Full finishing order of a finished round, shown under its preview on the
 * homepage. Sprint weekends get a Race / Sprint switch. Remount it (key by
 * round) so each race opens on its Grand Prix result.
 */
export default function RaceClassification({
  race,
  sprint,
}: {
  race: ClassifiedRow[];
  sprint?: ClassifiedRow[];
}) {
  const [showSprint, setShowSprint] = useState(false);
  const rows = sprint && showSprint ? sprint : race;

  return (
    <div className="border-t border-navy-800 p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-navy-400">
          {sprint && showSprint ? "Sprint results" : "Race results"}
        </h3>

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
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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

      <ClassificationTable rows={rows} />
    </div>
  );
}
