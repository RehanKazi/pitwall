import Image from "next/image";
import Link from "next/link";
import type { Team } from "../data/standings";

export type ResultsRow = {
  position: number;
  name: string;
  team: Team;
  /** Main number on the right (points total, or points scored). */
  value: string;
  /** Small grey text after the value (e.g. gap to leader). */
  sub?: string;
  /** Colours the value green (up) or red (down). */
  trend?: "up" | "down";
  /** De-emphasised row (e.g. out of title contention): greyed and smaller. */
  muted?: boolean;
  /** Makes the name a link (e.g. to the driver's card on /drivers). */
  href?: string;
};

const trendClass = {
  up: "text-emerald-400",
  down: "text-red-400",
};

function TeamLogo({ team, small }: { team: Team; small?: boolean }) {
  const size = small ? "h-5 w-5" : "h-7 w-7";
  return (
    <Image
      src={team.logo}
      alt={team.name}
      title={team.name}
      width={28}
      height={28}
      // SVG — served as-is (the image optimiser only handles raster images).
      unoptimized
      className={`mx-auto object-contain ${size}`}
    />
  );
}

export default function ResultsTable({
  nameHeader,
  valueHeader = "Points",
  rows,
}: {
  nameHeader: string;
  valueHeader?: string;
  rows: ResultsRow[];
}) {
  const hasSub = rows.some((r) => r.sub);

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wider text-navy-400">
          <th scope="col" className="w-14 py-2 pl-4 text-left font-medium">
            Pos.
          </th>
          <th scope="col" colSpan={2} className="py-2 text-left font-medium">
            {nameHeader}
          </th>
          <th scope="col" className="py-2 pr-4 text-right font-medium">
            {valueHeader}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const cell = row.muted ? "py-1.5" : "py-2.5";
          return (
            <tr
              key={row.name}
              className={`border-t border-navy-800 hover:bg-navy-900 ${
                row.muted ? "text-xs text-navy-500" : ""
              }`}
            >
              <td
                className={`${cell} pl-4 tabular-nums ${
                  row.muted ? "" : "text-navy-300"
                }`}
              >
                {row.position}
              </td>
              <td className={`${cell} w-10 pr-3 ${row.muted ? "opacity-50" : ""}`}>
                <TeamLogo team={row.team} small={row.muted} />
              </td>
              <td
                className={`${cell} pr-2 ${
                  row.muted ? "" : "font-medium text-navy-100"
                }`}
              >
                {row.href ? (
                  <Link
                    href={row.href}
                    className="rounded-sm underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:text-navy-50 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-300"
                  >
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
              </td>
              <td className={`${cell} whitespace-nowrap pr-4 text-right tabular-nums`}>
                <span
                  className={
                    row.trend
                      ? `font-medium ${trendClass[row.trend]}`
                      : row.muted
                        ? ""
                        : "font-medium text-navy-100"
                  }
                >
                  {row.value}
                </span>
                {hasSub && (
                  <span
                    className={`ml-2 inline-block w-11 text-left text-xs ${
                      row.muted ? "text-navy-600" : "text-navy-500"
                    }`}
                  >
                    {row.sub}
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
