import { cacheLife, cacheTag } from "next/cache";
import {
  poleSitters as snapshotPoles,
  raceResults as snapshotRaces,
  sprintResults as snapshotSprints,
  type ClassifiedRow,
} from "../data/raceResults";
import {
  seasonRaces,
  type Race,
  type RaceWeekend,
  type SessionName,
  type SessionResult,
  type SessionResults,
} from "../data/schedule";
import { driverStandings, teams, type TeamId } from "../data/standings";

/**
 * Live 2026 results from the Jolpica-F1 API (https://api.jolpi.ca — Ergast's
 * successor, no API key). Cached with `use cache`, so the API is hit at most
 * about once an hour, well within its rate limits (~4 req/s, a few hundred per hour).
 * If the API is down, the snapshot in app/data/raceResults.ts is served instead.
 */

const API = "https://api.jolpi.ca/ergast/f1/2026";
/** Jolpica caps `limit` at 100, so longer tables come in pages. */
const PAGE = 100;

export type SeasonResults = {
  races: Record<number, ClassifiedRow[]>;
  sprints: Record<number, ClassifiedRow[]>;
  poles: Record<number, string>;
  /** "snapshot" when the API couldn't be reached. */
  source: "live" | "snapshot";
};

// ---- Jolpica response shapes (just the fields we read) ----

type ApiDriver = { givenName: string; familyName: string };
type ApiResult = {
  positionText: string;
  points: string;
  laps: string;
  status: string;
  Time?: { time?: string };
  FastestLap?: { rank?: string };
  Driver: ApiDriver;
  Constructor: { constructorId: string };
};
type ApiRace = {
  round: string;
  Results?: ApiResult[];
  SprintResults?: ApiResult[];
  QualifyingResults?: { Driver: ApiDriver }[];
};
type ApiPage = {
  MRData: { total: string; RaceTable: { Races: ApiRace[] } };
};

/** Jolpica constructorId → our team id, where they differ. */
const TEAM_IDS: Record<string, TeamId> = {
  red_bull: "redbull",
  aston_martin: "astonmartin",
  rb: "racingbulls",
  sauber: "audi",
};

/** Family name → the display name used across the site (e.g. "Kimi Antonelli"). */
const displayNames = new Map(
  driverStandings.map((d) => [d.name.split(" ").slice(1).join(" "), d.name]),
);
const nameOf = (d: ApiDriver) =>
  displayNames.get(d.familyName) ?? `${d.givenName} ${d.familyName}`;

function teamOf(constructorId: string): TeamId {
  const id = TEAM_IDS[constructorId] ?? constructorId;
  if (!(id in teams)) throw new Error(`Unknown constructor "${constructorId}"`);
  return id as TeamId;
}

const STATUS_CODES: Record<string, string> = {
  R: "DNF",
  D: "DSQ",
  W: "DNS",
  N: "NC",
  E: "EXC",
  F: "DNQ",
};

/** Race time for the winner, gap for others on the lead lap, else laps down or the status. */
function gap(row: ApiResult, winnerLaps: number): string {
  if (/^\d+$/.test(row.positionText)) {
    // Laps down first: for lapped cars Jolpica's "time" isn't a gap to the winner.
    const down = winnerLaps - Number(row.laps);
    if (down > 0) return `+${down} lap${down > 1 ? "s" : ""}`;
    return row.Time?.time ?? row.status;
  }
  return STATUS_CODES[row.positionText] ?? row.status;
}

function classify(results: ApiResult[]): ClassifiedRow[] {
  const winnerLaps = Number(results[0]?.laps ?? 0);
  return results.map((r) => ({
    position: r.positionText,
    name: nameOf(r.Driver),
    team: teamOf(r.Constructor.constructorId),
    gap: gap(r, winnerLaps),
    points: Number(r.points),
    ...(r.FastestLap?.rank === "1" && { fastestLap: true }),
  }));
}

/** Every race in a paged endpoint. A race split across two pages is stitched back together. */
async function fetchAll(endpoint: string): Promise<ApiRace[]> {
  const byRound = new Map<string, ApiRace>();
  for (let offset = 0, total = 1; offset < total; offset += PAGE) {
    const res = await fetch(`${API}/${endpoint}.json?limit=${PAGE}&offset=${offset}`);
    if (!res.ok) throw new Error(`Jolpica ${endpoint}: HTTP ${res.status}`);
    const page: ApiPage = await res.json();
    total = Number(page.MRData.total);
    for (const race of page.MRData.RaceTable.Races) {
      const seen = byRound.get(race.round);
      if (!seen) {
        byRound.set(race.round, race);
        continue;
      }
      seen.Results?.push(...(race.Results ?? []));
      seen.SprintResults?.push(...(race.SprintResults ?? []));
    }
  }
  return [...byRound.values()];
}

async function fetchLive(): Promise<SeasonResults> {
  // One after another rather than in parallel, to stay under the per-second limit.
  const results = await fetchAll("results");
  const sprintRaces = await fetchAll("sprint");
  const qualifying = await fetchAll("qualifying/1");

  const races: SeasonResults["races"] = {};
  for (const r of results) if (r.Results?.length) races[Number(r.round)] = classify(r.Results);
  const sprints: SeasonResults["sprints"] = {};
  for (const r of sprintRaces)
    if (r.SprintResults?.length) sprints[Number(r.round)] = classify(r.SprintResults);
  const poles: SeasonResults["poles"] = {};
  for (const r of qualifying) {
    const d = r.QualifyingResults?.[0]?.Driver;
    if (d) poles[Number(r.round)] = nameOf(d);
  }
  return { races, sprints, poles, source: "live" };
}

/** Race, sprint and pole results for every round run so far. */
export async function getResults(): Promise<SeasonResults> {
  "use cache";
  cacheTag("f1-results");
  try {
    const live = await fetchLive();
    // The API can briefly return an empty season (e.g. mid-update); don't let
    // that replace a good snapshot.
    if (Object.keys(live.races).length >= Object.keys(snapshotRaces).length) {
      // Re-check hourly: new results appear within an hour of being published.
      cacheLife("hours");
      return live;
    }
    console.warn("Jolpica returned fewer races than the snapshot; using the snapshot");
  } catch (err) {
    console.error("Couldn't fetch results from Jolpica; using the snapshot", err);
  }
  // Retry soon rather than serving the fallback for an hour.
  cacheLife("minutes");
  return { races: snapshotRaces, sprints: snapshotSprints, poles: snapshotPoles, source: "snapshot" };
}

// ---- Practice and qualifying: OpenF1 (https://openf1.org) ----
//
// OpenF1's free tier serves each session's classification shortly after it
// ends (live timing during a session needs their paid tier). Free-tier limits
// are ~3 req/s and ~30 req/min, so everything here is cached as well.

const OPENF1 = "https://api.openf1.org/v1";

type OpenF1Session = {
  session_key: number;
  meeting_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  is_cancelled?: boolean;
};
type OpenF1Driver = {
  driver_number: number;
  first_name: string;
  last_name: string;
  team_name: string;
};
type OpenF1Result = {
  position: number | null;
  driver_number: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  /** Best lap (practice), [Q1, Q2, Q3] best laps (qualifying) or total time (race), in seconds. */
  duration: number | (number | null)[] | null;
  gap_to_leader: number | string | (number | string | null)[] | null;
};

const OPENF1_NAMES: Record<string, SessionName> = {
  "Practice 1": "FP1",
  "Practice 2": "FP2",
  "Practice 3": "FP3",
  Qualifying: "Qualifying",
  Race: "Race",
};

const DAY = 86_400_000;
const ms = (iso: string) => new Date(iso).getTime();

const sleep = (msec: number) => new Promise((r) => setTimeout(r, msec));

/** OpenF1 calls go out one at a time, at most ~2.5 a second, to stay under the free-tier limit. */
let queue: Promise<unknown> = Promise.resolve();
function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => {}).then(() => sleep(400));
  return run;
}

async function openF1<T>(path: string): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await throttled(() => fetch(`${OPENF1}/${path}`));
    if (res.status === 429 && attempt < 3) {
      // Rate limited: back off (Retry-After if given) and try again.
      await sleep(Number(res.headers.get("retry-after")) * 1000 || 2000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`OpenF1 ${path}: HTTP ${res.status}`);
    return res.json();
  }
}

/** Every 2026 session OpenF1 knows about (with exact start times). */
async function getOpenF1Sessions(): Promise<OpenF1Session[]> {
  "use cache";
  cacheTag("openf1-sessions");
  try {
    const sessions = await openF1<OpenF1Session[]>("sessions?year=2026");
    cacheLife("hours");
    return sessions.filter((s) => !s.is_cancelled);
  } catch (err) {
    console.error("Couldn't fetch the OpenF1 session list", err);
    cacheLife("minutes");
    return [];
  }
}

/** A weekend's OpenF1 sessions, keyed by our session name. Matched on dates, since round numbers aren't shared. */
function weekendSessions(weekend: RaceWeekend, all: OpenF1Session[]) {
  const from = ms(`${weekend.start}T00:00:00Z`) - DAY;
  const to = ms(`${weekend.end}T00:00:00Z`) + 2 * DAY;
  const out = new Map<SessionName, OpenF1Session>();
  for (const s of all) {
    const name = OPENF1_NAMES[s.session_name];
    if (name && ms(s.date_start) >= from && ms(s.date_start) < to) out.set(name, s);
  }
  return out;
}

/** 78.128 -> "1:18.128"; 5800.4 -> "1:36:40.400" */
function formatSeconds(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = (total % 60).toFixed(3).padStart(6, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function formatGap(gap: number | string | null | undefined): string | undefined {
  if (gap == null || gap === 0) return undefined;
  return typeof gap === "number" ? `+${gap.toFixed(3)}` : gap;
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Normalised last name -> our display name ("hulkenberg" -> "Nico Hülkenberg"). */
const rosterByLastName = new Map(
  driverStandings.map((d) => [normalize(d.name.split(" ").slice(1).join(" ")), d]),
);
const teamByName = new Map(
  (Object.entries(teams) as [TeamId, (typeof teams)[TeamId]][]).map(([id, t]) => [t.name, id]),
);

function sessionRows(results: OpenF1Result[], drivers: Map<number, OpenF1Driver>): SessionResult[] {
  const rows: SessionResult[] = [];
  const ordered = [...results].sort(
    (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
  );
  for (const r of ordered) {
    const d = drivers.get(r.driver_number);
    if (!d) continue;
    const onGrid = rosterByLastName.get(normalize(d.last_name));
    const team = teamByName.get(d.team_name) ?? onGrid?.team;
    if (!team) continue;
    // Qualifying gives one time per segment: show the last segment they ran in.
    const durations = Array.isArray(r.duration) ? r.duration : [r.duration];
    const segment = durations.findLastIndex((t) => t != null);
    const gaps = Array.isArray(r.gap_to_leader) ? r.gap_to_leader : [r.gap_to_leader];
    const time = durations[segment];
    rows.push({
      name: onGrid?.name ?? `${d.first_name} ${d.last_name}`,
      team,
      time:
        r.dsq ? "DSQ" : r.dns ? "DNS" : time != null ? formatSeconds(time) : r.dnf ? "DNF" : "No time",
      gap: time != null && !r.dsq ? formatGap(gaps[segment]) : undefined,
    });
  }
  return rows;
}

/**
 * Results of each finished session of a race weekend. Cached per round: a
 * finished weekend for days, a running one until its next session ends.
 */
async function getSessionResults(round: number): Promise<SessionResults> {
  "use cache";
  cacheTag("openf1-results");
  const weekend = seasonRaces.find((r) => r.round === round);
  const sessions = weekend ? weekendSessions(weekend, await getOpenF1Sessions()) : new Map<SessionName, OpenF1Session>();
  const now = Date.now();
  const ended = [...sessions].filter(([, s]) => ms(s.date_end) <= now);
  const nextEnd = Math.min(
    ...[...sessions.values()].map((s) => ms(s.date_end)).filter((t) => t > now),
  );

  const out: SessionResults = {};
  let missing = false;
  try {
    if (ended.length) {
      const meeting = ended[0][1].meeting_key;
      const drivers = new Map(
        (await openF1<OpenF1Driver[]>(`drivers?meeting_key=${meeting}`)).map((d) => [d.driver_number, d]),
      );
      for (const [name, s] of ended) {
        const rows = sessionRows(
          await openF1<OpenF1Result[]>(`session_result?session_key=${s.session_key}`),
          drivers,
        );
        if (rows.length) out[name] = rows;
        else missing = true; // Not published yet — usually takes a few minutes.
      }
    }
  } catch (err) {
    console.error(`Couldn't fetch OpenF1 session results for round ${round}`, err);
    missing = true;
  }

  if (missing) {
    cacheLife("minutes");
  } else if (Number.isFinite(nextEnd)) {
    // Refresh shortly after the next session ends.
    const revalidate = Math.max(300, Math.ceil((nextEnd - now) / 1000) + 300);
    cacheLife({ stale: 300, revalidate, expire: revalidate + 3600 });
  } else {
    cacheLife("days");
  }
  return out;
}

/**
 * The calendar, with each finished round's result and classifications filled
 * in. With `weekends: true` (the home page's timetable), weekends that have a
 * timetable also get OpenF1's exact session times and session results — the
 * other pages skip that to keep OpenF1 calls down.
 */
export async function getSeason({ weekends = false } = {}): Promise<Race[]> {
  const [{ races, sprints, poles }, openF1Sessions] = await Promise.all([
    getResults(),
    weekends ? getOpenF1Sessions() : [],
  ]);
  return Promise.all(
    seasonRaces.map(async (weekend): Promise<Race> => {
      const race: Race = { ...weekend };
      if (weekends && weekend.sessions.length) {
        const exact = weekendSessions(weekend, openF1Sessions);
        race.sessions = weekend.sessions.map((s) => {
          const match = exact.get(s.name);
          return match ? { ...s, start: new Date(match.date_start).toISOString().replace(".000Z", "Z") } : s;
        });
        race.sessionResults = await getSessionResults(weekend.round);
      }
      const classification = races[weekend.round];
      if (classification?.length) {
        const [p1, p2, p3] = classification.map((r) => r.name);
        race.classification = classification;
        race.sprint = sprints[weekend.round];
        race.result = { winner: p1, pole: poles[weekend.round] ?? "—", podium: [p1, p2, p3] };
      }
      return race;
    }),
  );
}
