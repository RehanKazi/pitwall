import type { Metadata } from "next";
import DriverList from "../components/DriverList";
import { buildPointsEvolution } from "../data/championship";
import { buildDriverProfiles, constructorOrder2025 } from "../data/driverProfiles";
import { driverStandings } from "../data/standings";
import { getSeason } from "../lib/f1";

export const metadata: Metadata = { title: "Drivers · Pitwall" };

// One flat list: teams in 2025 constructors' order, each team's drivers together.
const drivers = constructorOrder2025.flatMap(({ team }) =>
  driverStandings.filter((d) => d.team === team),
);

export default async function DriversPage() {
  const season = await getSeason();
  const { rounds, drivers: standings } = buildPointsEvolution(season);
  const profiles = buildDriverProfiles(season, standings);
  const lastRound = rounds.at(-1);

  return (
    <main className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <DriverList
          drivers={drivers}
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
