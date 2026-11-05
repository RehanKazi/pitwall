import type { Metadata } from "next";
import PageHeader from "../components/PageHeader";
import ScheduleCard from "../components/ScheduleCard";
import { loadTrack } from "../data/tracks";
import { getSeason } from "../lib/f1";

export const metadata: Metadata = { title: "Schedule · Pitwall" };

export default async function SchedulePage() {
  const season = await getSeason();
  const races = season.map((race) => ({
    race,
    track: loadTrack(race.trackImage),
  }));
  const completed = season.filter((r) => r.result).length;
  const nextRound = season.find((r) => !r.result)?.round;

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Schedule" />
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-50">
          2026 Calendar
        </h1>
        <p className="mt-1 text-sm text-navy-200">
          {season.length} rounds · {completed} completed,{" "}
          {season.length - completed} to go. Finished races show their podium.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {races.map(({ race, track }) => (
            <ScheduleCard
              key={race.round}
              race={race}
              track={track}
              isNext={race.round === nextRound}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
