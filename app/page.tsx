import type { ResultsRow } from "./components/ResultsTable";
import PageHeader from "./components/PageHeader";
import StandingsPanel from "./components/StandingsPanel";
import UpcomingRaces from "./components/UpcomingRaces";
import { buildPointsEvolution, type EvolutionSeries } from "./data/championship";
import { driverSlug } from "./data/driverProfiles";
import { loadTrack } from "./data/tracks";
import { driverStandings, teams } from "./data/standings";
import { getSeason } from "./lib/f1";

/** Only drivers on the grid have a card on the Drivers page (stand-ins don't). */
const onGrid = new Set(driverStandings.map((d) => d.name));
/** Link to a driver's (auto-expanded) card on the Drivers page. */
const driverHref = (name: string) =>
  onGrid.has(name) ? `/drivers#${driverSlug(name)}` : undefined;

/** Standings rows in championship order (ties already split by countback). */
function toStandingsRows(series: EvolutionSeries[]): ResultsRow[] {
  const leader = series[0]?.cumulative.at(-1) ?? 0;
  return series.map((s, i) => {
    const points = s.cumulative.at(-1) ?? 0;
    return {
      position: s.ranks.at(-1) ?? i + 1,
      name: s.name,
      team: teams[s.team],
      value: String(points),
      sub: i === 0 ? undefined : String(points - leader),
    };
  });
}

// Max points a driver can still score: 25 per race not yet run (no sprints
// remain this season, and there's no fastest-lap point). Anyone further
// behind the leader than that can no longer win the title.
const POINTS_PER_RACE = 25;

export default async function Home() {
  const season = await getSeason({ weekends: true });
  const { rounds, drivers: driverSeries, constructors: teamSeries } =
    buildPointsEvolution(season);

  const pointsAvailable =
    season.filter((r) => !r.result).length * POINTS_PER_RACE;
  const leaderPoints = driverSeries[0]?.cumulative.at(-1) ?? 0;
  const drivers = toStandingsRows(driverSeries).map((row) => ({
    ...row,
    muted: leaderPoints - Number(row.value) > pointsAvailable,
    href: driverHref(row.name),
  }));
  const constructors = toStandingsRows(teamSeries);

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

  const racesWithTracks = season.map((race) => ({
    ...race,
    track: loadTrack(race.trackImage),
  }));

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <PageHeader title="Home" />
        <div className="flex-1 p-6">
          <UpcomingRaces races={racesWithTracks} />
        </div>
      </main>
      <aside className="w-96 shrink-0 overflow-y-auto border-l border-navy-800 dither-panel">
        <StandingsPanel
          constructors={constructors}
          drivers={drivers}
          driversNote={`Greyed out: can no longer win the title (${pointsAvailable} pts left to play for)`}
          lastRace={{ name: last?.name ?? "No races yet", rows: lastRaceRows }}
        />
      </aside>
    </>
  );
}
