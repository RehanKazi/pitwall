import type { Race } from "../data/schedule";

const dayFormat: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
const timeFormat: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

/**
 * Session start times for a race weekend that hasn't been run yet — FP1–3,
 * sprint qualifying and sprint (on sprint weekends), qualifying and the race —
 * shown in the visitor's own time zone. Times appear once the clock is known
 * on the client (`now`), so the server render doesn't show UTC times that
 * would then change.
 */
export default function WeekendSchedule({ race, now }: { race: Race; now: number | null }) {
  return (
    <div className="border-t border-navy-800 p-4 sm:p-6">
      <h3 className="text-xs font-medium uppercase tracking-wider text-navy-400">
        Weekend schedule
      </h3>

      {race.sessions.length === 0 ? (
        <p className="mt-3 text-sm text-navy-400">Session times haven&apos;t been confirmed yet.</p>
      ) : (
        <>
          <ol className="mt-2 divide-y divide-navy-800/70">
            {race.sessions.map((s) => {
              const start = new Date(s.start);
              const isSprint = s.name.startsWith("Sprint");
              const isMain = s.name === "Race" || s.name === "Qualifying";
              return (
                <li key={s.name} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className={`flex min-w-0 items-center gap-2 ${
                      isMain ? "font-semibold text-navy-50" : "text-navy-200"
                    }`}
                  >
                    {isSprint && (
                      <span aria-hidden className="h-3.5 w-1 shrink-0 rounded-full bg-amber-400/80" />
                    )}
                    <span className="truncate">{s.name}</span>
                  </span>
                  <span className="ml-auto whitespace-nowrap text-navy-400">
                    {now !== null && start.toLocaleDateString(undefined, dayFormat)}
                  </span>
                  <span className="w-20 whitespace-nowrap text-right tabular-nums text-navy-50">
                    {now !== null && start.toLocaleTimeString(undefined, timeFormat)}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs text-navy-500">Times are in your time zone.</p>
        </>
      )}
    </div>
  );
}
