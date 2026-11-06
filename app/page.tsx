import type { ResultsRow } from "./components/ResultsTable";
import PageHeader from "./components/PageHeader";
import LastRaceDrawer from "./components/LastRaceDrawer";
import LastRacePanel from "./components/LastRacePanel";
import UpcomingRaces from "./components/UpcomingRaces";
import { buildPointsEvolution } from "./data/championship";
import { driverSlug } from "./data/driverProfiles";
import { loadTrack } from "./data/tracks";
import { driverStandings, teams } from "./data/standings";
import { getSeason } from "./lib/f1";

/** Only drivers on the grid have a card on the Drivers page (stand-ins don't). */
const onGrid = new Set(driverStandings.map((d) => d.name));
/** Link to a driver's (auto-expanded) card on the Drivers page. */
const driverHref = (name: string) =>
  onGrid.has(name) ? `/drivers#${driverSlug(name)}` : undefined;

export default async function Home() {
  const season = await getSeason({ weekends: true });
  const { rounds, drivers: driverSeries } = buildPointsEvolution(season);

  // Last race: its classification, with each driver's championship move.
  const last = season.find((r) => r.round === rounds.at(-1)?.round);
  const rankMove = new Map(
    driverSeries.map((s) => {
      const before = s.ranks.at(-2);
      const after = s.ranks.at(-1);
      return [s.name, before == null || after == null ? 0 : before - after];
    }),
  );
  const lastRaceRows: ResultsRow[] = (last?.classification ?? []).map((r, i) => {
    const change = rankMove.get(r.name) ?? 0;
    return {
      position: i + 1,
      name: r.name,
      team: teams[r.team],
      value: change > 0 ? `+${change}` : change < 0 ? `${change}` : "–",
      trend: change > 0 ? "up" : change < 0 ? "down" : undefined,
      href: driverHref(r.name),
    };
  });

  const lastName = last?.name ?? "No races yet";

  const racesWithTracks = season.map((race) => ({
    ...race,
    track: loadTrack(race.trackImage),
  }));

  return (
    // The last race sits beside the races from xl up; below that it's in a slide-out drawer.
    <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto xl:flex-row xl:overflow-hidden">
      <main className="flex min-w-0 flex-1 flex-col xl:overflow-y-auto">
        <PageHeader title="Home" />
        <div className="flex-1 p-4 sm:p-6">
          <UpcomingRaces races={racesWithTracks} />
        </div>
      </main>
      <aside className="hidden w-96 shrink-0 overflow-y-auto border-l border-navy-800 dither-panel xl:block">
        <LastRacePanel name={lastName} rows={lastRaceRows} />
      </aside>
      <LastRaceDrawer name={lastName} rows={lastRaceRows} />
    </div>
  );
}
