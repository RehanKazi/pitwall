import type { Metadata } from "next";
import TeamList from "../components/TeamList";
import { buildPointsEvolution } from "../data/championship";
import { constructorOrder2025 } from "../data/driverProfiles";
import { buildTeamProfiles } from "../data/teamProfiles";
import { getSeason } from "../lib/f1";

export const metadata: Metadata = { title: "Teams · Pitwall" };

export default async function TeamsPage() {
  const season = await getSeason();
  const { rounds, drivers, constructors } = buildPointsEvolution(season);
  const profiles = buildTeamProfiles(season, constructors, drivers);
  const lastRound = rounds.at(-1);

  return (
    <main className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Same order as the Drivers page: 2025 constructors' championship. */}
        <TeamList
          order={constructorOrder2025.map((t) => t.team)}
          profiles={profiles}
          asOf={
            lastRound
              ? `After round ${lastRound.round} · ${lastRound.name.replace("Grand Prix", "GP")}`
              : undefined
          }
        />
      </div>
    </main>
  );
}
