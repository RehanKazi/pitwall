import type { Metadata } from "next";
import DriverList from "../components/DriverList";
import PageHeader from "../components/PageHeader";
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
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Drivers" />
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-50">
          2026 Drivers
        </h1>
        <p className="mt-1 text-sm text-navy-200">
          Ordered by their team&apos;s finish in the 2025 constructors&apos;
          championship. Click a driver for season and career stats
          {lastRound ? ` — up to round ${lastRound.round}, ${lastRound.name}` : ""}.
        </p>

        <DriverList drivers={drivers} profiles={profiles} />
      </div>
    </main>
  );
}
