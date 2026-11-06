import type { Metadata } from "next";
import ScheduleCard from "../components/ScheduleCard";
import ScrollToCurrentRace from "../components/ScrollToCurrentRace";
import { raceEndMs } from "../data/schedule";
import { loadTrack } from "../data/tracks";
import { getSeason } from "../lib/f1";

export const metadata: Metadata = { title: "Schedule · Pitwall" };

export default async function SchedulePage() {
  const season = await getSeason();
  const races = season.map((race) => ({
    race,
    track: loadTrack(race.trackImage),
  }));
  const nextRound = season.find((r) => !r.result)?.round;
  // The page picks the current race from the visitor's clock, like the home page.
  const ends = season.map((r) => ({ round: r.round, end: raceEndMs(r) }));

  return (
    <main className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
      <ScrollToCurrentRace ends={ends} />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
