import type { Metadata } from "next";
import PageHeader from "../components/PageHeader";
import ChampionshipView from "../components/ChampionshipView";
import { buildPointsEvolution } from "../data/championship";
import { getSeason } from "../lib/f1";

export const metadata: Metadata = { title: "Championship · Pitwall" };

export default async function ChampionshipPage() {
  const { rounds, drivers, constructors } = buildPointsEvolution(await getSeason());
  const lastRound = rounds.at(-1);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Championship" />
      <div className="w-full px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-50">
          2026 Championship
        </h1>
        <p className="mt-1 text-sm text-navy-200">
          Championship points after every round of 2026 so far
          {lastRound ? ` — up to round ${lastRound.round}, ${lastRound.name}` : ""}.
          Sprint points are counted in their weekend&apos;s round.
        </p>

        <ChampionshipView rounds={rounds} drivers={drivers} constructors={constructors} />
      </div>
    </main>
  );
}
