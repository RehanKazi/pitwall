import type { Race } from "./schedule";
import { driverStandings, teams } from "./standings";

export type EvolutionRound = {
  round: number;
  name: string;
  shortName: string;
  countryCode: string;
  sprint: boolean;
};

export type EvolutionSeries = {
  name: string;
  team: keyof typeof teams;
  color: string;
  /** The lower-scoring teammate is drawn dashed, so teammates sharing a colour can be told apart. */
  dashed: boolean;
  /** Championship points after each round (same order as `rounds`). */
  cumulative: number[];
  /** Championship position after each round; null before their first start. */
  ranks: (number | null)[];
};

/**
 * Positions after each round. Ties on points are split by countback, as in
 * the official standings: most Grand Prix wins, then most 2nds, and so on.
 * Anyone yet to start (e.g. a mid-season stand-in) isn't ranked until they do.
 */
function rankEachRound(
  entries: { cumulative: number[]; finishes: number[][]; firstIndex: number }[],
): (number | null)[][] {
  const ranks = entries.map(() => new Array<number | null>(entries[0]?.cumulative.length ?? 0).fill(null));
  const rounds = entries[0]?.cumulative.length ?? 0;
  for (let i = 0; i < rounds; i++) {
    // finishes[i][p] = number of P(p+1) Grand Prix finishes up to and including round i.
    const order = entries
      .map((e, idx) => ({ e, idx }))
      .filter(({ e }) => e.firstIndex <= i)
      .sort((a, b) => {
        const d = b.e.cumulative[i] - a.e.cumulative[i];
        if (d) return d;
        const fa = a.e.finishes[i];
        const fb = b.e.finishes[i];
        for (let p = 0; p < Math.max(fa.length, fb.length); p++) {
          const c = (fb[p] ?? 0) - (fa[p] ?? 0);
          if (c) return c;
        }
        return 0;
      });
    order.forEach(({ idx }, r) => (ranks[idx][i] = r + 1));
  }
  return ranks;
}

/**
 * Drivers' and constructors' championship points after every finished round, rebuilt from the
 * race + sprint classifications. Includes everyone who started a race,
 * stand-ins too, so totals and positions match the official table.
 */
export function buildPointsEvolution(season: Race[]) {
  const finished = season.filter((r) => r.classification?.length);
  const rounds: EvolutionRound[] = finished.map((r) => ({
    round: r.round,
    name: r.name,
    shortName: r.shortName,
    countryCode: r.countryCode,
    sprint: !!r.sprint,
  }));

  // Every driver's team: grid line-up first, then whatever the results say.
  const teamOf = new Map(driverStandings.map((d) => [d.name, d.team]));
  const perRound = new Map<string, number[]>();
  // Grand Prix finishing positions (for countback) and first round entered.
  const gpFinishes = new Map<string, number[][]>();
  const teamGpFinishes = new Map<string, number[][]>();
  const firstIndex = new Map<string, number>();
  const addFinish = (store: Map<string, number[][]>, key: string, i: number, pos: number) => {
    const rows = store.get(key) ?? finished.map(() => [] as number[]);
    rows[i][pos - 1] = (rows[i][pos - 1] ?? 0) + 1;
    store.set(key, rows);
  };
  // Constructors score whatever their car scored that round, whoever drove it.
  const teamPerRound = new Map<keyof typeof teams, number[]>(
    (Object.keys(teams) as (keyof typeof teams)[]).map((t) => [t, new Array(finished.length).fill(0)]),
  );
  finished.forEach((race, i) => {
    for (const rows of [race.classification!, race.sprint ?? []]) {
      for (const row of rows) {
        if (!teamOf.has(row.name)) teamOf.set(row.name, row.team);
        const pts = perRound.get(row.name) ?? new Array(finished.length).fill(0);
        pts[i] += row.points;
        perRound.set(row.name, pts);
        teamPerRound.get(row.team)![i] += row.points;
        if (!firstIndex.has(row.name)) firstIndex.set(row.name, i);
      }
    }
    for (const row of race.classification!) {
      if (!/^\d+$/.test(row.position)) continue;
      addFinish(gpFinishes, row.name, i, Number(row.position));
      addFinish(teamGpFinishes, row.team, i, Number(row.position));
    }
  });
  const accumulateFinishes = (rows: number[][] | undefined) => {
    const out: number[][] = [];
    let running: number[] = [];
    for (let i = 0; i < finished.length; i++) {
      const cur = rows?.[i] ?? [];
      running = Array.from({ length: Math.max(running.length, cur.length) }, (_, p) => (running[p] ?? 0) + (cur[p] ?? 0));
      out.push(running);
    }
    return out;
  };
  const accumulate = (pts: number[]) => {
    let sum = 0;
    return pts.map((p) => (sum += p));
  };

  // Everyone who started a session counts, stand-ins included, so the order
  // matches the official table.
  const series = [...perRound.entries()]
    .map(([name, pts]) => ({ name, cumulative: accumulate(pts) }))
    .sort((a, b) => b.cumulative.at(-1)! - a.cumulative.at(-1)!);

  // Dash every driver after the first (highest-scoring) one of each team.
  const seenTeam = new Set<string>();
  const driverRanks = rankEachRound(
    series.map((s) => ({
      cumulative: s.cumulative,
      finishes: accumulateFinishes(gpFinishes.get(s.name)),
      firstIndex: firstIndex.get(s.name) ?? 0,
    })),
  );
  const result: EvolutionSeries[] = series.map((s, k) => {
    const team = teamOf.get(s.name)!;
    const dashed = seenTeam.has(team);
    seenTeam.add(team);
    return { ...s, team, color: teams[team].color, dashed, ranks: driverRanks[k] };
  });

  const teamEntries = [...teamPerRound.entries()].map(([team, pts]) => ({
    team,
    cumulative: accumulate(pts),
    finishes: accumulateFinishes(teamGpFinishes.get(team)),
    firstIndex: 0,
  }));
  const teamRanks = rankEachRound(teamEntries);
  const constructors: EvolutionSeries[] = teamEntries
    .map((t, k) => ({
      name: teams[t.team].name,
      team: t.team,
      color: teams[t.team].color,
      dashed: false,
      cumulative: t.cumulative,
      ranks: teamRanks[k],
    }))
    .sort((a, b) => a.ranks.at(-1)! - b.ranks.at(-1)!);

  result.sort((a, b) => a.ranks.at(-1)! - b.ranks.at(-1)!);
  return { rounds, drivers: result, constructors };
}
