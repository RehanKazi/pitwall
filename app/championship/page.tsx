import type { Metadata } from "next";
import ChampionshipView from "../components/ChampionshipView";
import { buildPointsEvolution } from "../data/championship";
import { getSeason } from "../lib/f1";

export const metadata: Metadata = { title: "Championship · Pitwall" };

export default async function ChampionshipPage() {
  const { rounds, drivers, constructors } = buildPointsEvolution(await getSeason());

  return (
    <main className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
        <ChampionshipView rounds={rounds} drivers={drivers} constructors={constructors} />
      </div>
    </main>
  );
}
