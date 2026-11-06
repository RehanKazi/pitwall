import type { ClassifiedRow } from "./raceResults";
import type { teams } from "./standings";

export type SessionName = "FP1" | "FP2" | "FP3" | "Qualifying" | "Race";

export type Session = {
  name: SessionName;
  /** Start time in UTC (ISO 8601). */
  start: string;
};

/** A calendar entry — fixed for the season. */
export type RaceWeekend = {
  round: number;
  name: string;
  /** Short label for the tab. */
  shortName: string;
  circuit: string;
  location: string;
  /** Country the race is held in (ISO 3166 alpha-2) — /public/flags/<code>.png */
  countryCode: string;
  country: string;
  /** /public/tracks/<file> */
  trackImage: string;
  laps: number;
  /** Local race weekend dates for display (YYYY-MM-DD). */
  start: string;
  end: string;
  /**
   * Session start times, for weekends that need a countdown or timetable.
   * Empty for earlier races, which only need their dates.
   */
  sessions: Session[];
};

/** One driver's line in a practice / qualifying / race session, fastest first. */
export type SessionResult = {
  name: string;
  team: keyof typeof teams;
  /** Best lap ("1:17.400"), race time, or "DNF" / "No time" etc. */
  time: string;
  /** Gap to the fastest, e.g. "+0.133". */
  gap?: string;
};

export type SessionResults = Partial<Record<SessionName, SessionResult[]>>;

/** A calendar entry plus its results, once the race has been run (see app/lib/f1.ts). */
export type Race = RaceWeekend & {
  result?: {
    winner: string;
    pole: string;
    /** Top three finishers, P1 first. */
    podium: [string, string, string];
  };
  /** Full race classification. */
  classification?: ClassifiedRow[];
  /** Sprint classification, for sprint weekends only. */
  sprint?: ClassifiedRow[];
  /** Results of the weekend's finished sessions (weekends with a timetable only). */
  sessionResults?: SessionResults;
};

/** Session lengths in minutes — used to tell when a session is live / over. */
export const sessionMinutes: Record<SessionName, number> = {
  FP1: 60,
  FP2: 60,
  FP3: 60,
  Qualifying: 60,
  Race: 120,
};

/**
 * When a race weekend is over: its last session's end, or (for rounds stored
 * without session times) the day after its final day. The "current" race —
 * shown first on the home page, scrolled to on the schedule — is the first
 * one whose weekend isn't over yet.
 */
export function raceEndMs(race: RaceWeekend): number {
  const last = race.sessions.at(-1);
  return last
    ? new Date(last.start).getTime() + sessionMinutes[last.name] * 60_000
    : new Date(`${race.end}T00:00:00Z`).getTime() + 24 * 3600_000;
}

/**
 * The full 2026 calendar: 23 rounds. (The Saudi Arabian GP was cancelled and
 * the Bahrain GP moved to Sepang, Malaysia, because of the Iran war.)
 * Calendar: Wikipedia's 2026 season page. Lap counts are the
 * standard race distances. Session times (round 19 onward) are approximate,
 * and every weekend uses the standard format here — six earlier rounds were
 * sprint weekends.
 */
export const seasonRaces: RaceWeekend[] = [
  {
    round: 1,
    name: "Australian Grand Prix",
    shortName: "Australia",
    circuit: "Albert Park Circuit",
    location: "Melbourne",
    countryCode: "au",
    country: "Australia",
    trackImage: "/tracks/albertpark-line.svg",
    laps: 58,
    start: "2026-03-06",
    end: "2026-03-08",
    sessions: [],
  },
  {
    round: 2,
    name: "Chinese Grand Prix",
    shortName: "China",
    circuit: "Shanghai International Circuit",
    location: "Shanghai",
    countryCode: "cn",
    country: "China",
    trackImage: "/tracks/shanghai-line.svg",
    laps: 56,
    start: "2026-03-13",
    end: "2026-03-15",
    sessions: [],
  },
  {
    round: 3,
    name: "Japanese Grand Prix",
    shortName: "Japan",
    circuit: "Suzuka Circuit",
    location: "Suzuka",
    countryCode: "jp",
    country: "Japan",
    trackImage: "/tracks/suzuka-line.svg",
    laps: 53,
    start: "2026-03-27",
    end: "2026-03-29",
    sessions: [],
  },
  {
    round: 4,
    name: "Miami Grand Prix",
    shortName: "Miami",
    circuit: "Miami International Autodrome",
    location: "Miami Gardens",
    countryCode: "us",
    country: "United States",
    trackImage: "/tracks/miami-line.svg",
    laps: 57,
    start: "2026-05-01",
    end: "2026-05-03",
    sessions: [],
  },
  {
    round: 5,
    name: "Canadian Grand Prix",
    shortName: "Canada",
    circuit: "Circuit Gilles Villeneuve",
    location: "Montreal",
    countryCode: "ca",
    country: "Canada",
    trackImage: "/tracks/montreal-line.svg",
    laps: 70,
    start: "2026-05-22",
    end: "2026-05-24",
    sessions: [],
  },
  {
    round: 6,
    name: "Monaco Grand Prix",
    shortName: "Monaco",
    circuit: "Circuit de Monaco",
    location: "Monte Carlo",
    countryCode: "mc",
    country: "Monaco",
    trackImage: "/tracks/monaco-line.svg",
    laps: 78,
    start: "2026-06-05",
    end: "2026-06-07",
    sessions: [],
  },
  {
    round: 7,
    name: "Barcelona-Catalunya Grand Prix",
    shortName: "Barcelona",
    circuit: "Circuit de Barcelona-Catalunya",
    location: "Montmeló",
    countryCode: "es",
    country: "Spain",
    trackImage: "/tracks/catalunya-line.svg",
    laps: 66,
    start: "2026-06-12",
    end: "2026-06-14",
    sessions: [],
  },
  {
    round: 8,
    name: "Austrian Grand Prix",
    shortName: "Austria",
    circuit: "Red Bull Ring",
    location: "Spielberg",
    countryCode: "at",
    country: "Austria",
    trackImage: "/tracks/redbullring-line.svg",
    laps: 71,
    start: "2026-06-26",
    end: "2026-06-28",
    sessions: [],
  },
  {
    round: 9,
    name: "British Grand Prix",
    shortName: "Britain",
    circuit: "Silverstone Circuit",
    location: "Silverstone",
    countryCode: "gb",
    country: "United Kingdom",
    trackImage: "/tracks/silverstone-line.svg",
    laps: 52,
    start: "2026-07-03",
    end: "2026-07-05",
    sessions: [],
  },
  {
    round: 10,
    name: "Belgian Grand Prix",
    shortName: "Belgium",
    circuit: "Circuit de Spa-Francorchamps",
    location: "Stavelot",
    countryCode: "be",
    country: "Belgium",
    trackImage: "/tracks/spa-line.svg",
    laps: 44,
    start: "2026-07-17",
    end: "2026-07-19",
    sessions: [],
  },
  {
    round: 11,
    name: "Hungarian Grand Prix",
    shortName: "Hungary",
    circuit: "Hungaroring",
    location: "Mogyoród",
    countryCode: "hu",
    country: "Hungary",
    trackImage: "/tracks/hungaroring-line.svg",
    laps: 70,
    start: "2026-07-24",
    end: "2026-07-26",
    sessions: [],
  },
  {
    round: 12,
    name: "Dutch Grand Prix",
    shortName: "Netherlands",
    circuit: "Circuit Zandvoort",
    location: "Zandvoort",
    countryCode: "nl",
    country: "Netherlands",
    trackImage: "/tracks/zandvoort-line.svg",
    laps: 72,
    start: "2026-08-21",
    end: "2026-08-23",
    sessions: [],
  },
  {
    round: 13,
    name: "Italian Grand Prix",
    shortName: "Italy",
    circuit: "Monza Circuit",
    location: "Monza",
    countryCode: "it",
    country: "Italy",
    trackImage: "/tracks/monza-line.svg",
    laps: 53,
    start: "2026-09-04",
    end: "2026-09-06",
    sessions: [],
  },
  {
    round: 14,
    name: "Spanish Grand Prix",
    shortName: "Madrid",
    circuit: "Madring",
    location: "Madrid",
    countryCode: "es",
    country: "Spain",
    trackImage: "/tracks/madring-line.svg",
    laps: 57,
    start: "2026-09-11",
    end: "2026-09-13",
    sessions: [],
  },
  {
    round: 15,
    name: "Azerbaijan Grand Prix",
    shortName: "Azerbaijan",
    circuit: "Baku City Circuit",
    location: "Baku",
    countryCode: "az",
    country: "Azerbaijan",
    trackImage: "/tracks/baku-line.svg",
    laps: 51,
    start: "2026-09-24",
    end: "2026-09-26",
    sessions: [],
  },
  {
    round: 16,
    name: "Bahrain Grand Prix",
    shortName: "Sepang",
    circuit: "Sepang International Circuit",
    location: "Sepang, Malaysia",
    countryCode: "my",
    country: "Malaysia",
    trackImage: "/tracks/sepang-line.svg",
    laps: 56,
    start: "2026-10-02",
    end: "2026-10-04",
    sessions: [],
  },
  {
    round: 17,
    name: "Singapore Grand Prix",
    shortName: "Singapore",
    circuit: "Marina Bay Street Circuit",
    location: "Singapore",
    countryCode: "sg",
    country: "Singapore",
    trackImage: "/tracks/marinabay-line.svg",
    laps: 62,
    start: "2026-10-09",
    end: "2026-10-11",
    sessions: [],
  },
  {
    round: 18,
    name: "United States Grand Prix",
    shortName: "Austin",
    circuit: "Circuit of the Americas",
    location: "Austin",
    countryCode: "us",
    country: "United States",
    trackImage: "/tracks/cota-line.svg",
    laps: 56,
    start: "2026-10-23",
    end: "2026-10-25",
    sessions: [],
  },
  {
    round: 19,
    name: "Mexico City Grand Prix",
    shortName: "Mexico",
    circuit: "Autódromo Hermanos Rodríguez",
    location: "Mexico City",
    countryCode: "mx",
    country: "Mexico",
    trackImage: "/tracks/mexicocity-line.svg",
    laps: 71,
    start: "2026-10-30",
    end: "2026-11-01",
    sessions: [
      { name: "FP1", start: "2026-10-30T18:30:00Z" },
      { name: "FP2", start: "2026-10-30T22:00:00Z" },
      { name: "FP3", start: "2026-10-31T17:30:00Z" },
      { name: "Qualifying", start: "2026-10-31T21:00:00Z" },
      { name: "Race", start: "2026-11-01T20:00:00Z" },
    ],
  },
  {
    round: 20,
    name: "São Paulo Grand Prix",
    shortName: "São Paulo",
    circuit: "Autódromo José Carlos Pace (Interlagos)",
    location: "São Paulo",
    countryCode: "br",
    country: "Brazil",
    trackImage: "/tracks/interlagos-line.svg",
    laps: 71,
    start: "2026-11-06",
    end: "2026-11-08",
    sessions: [
      { name: "FP1", start: "2026-11-06T14:30:00Z" },
      { name: "FP2", start: "2026-11-06T18:00:00Z" },
      { name: "FP3", start: "2026-11-07T14:30:00Z" },
      { name: "Qualifying", start: "2026-11-07T18:00:00Z" },
      { name: "Race", start: "2026-11-08T17:00:00Z" },
    ],
  },
  {
    round: 21,
    name: "Las Vegas Grand Prix",
    shortName: "Las Vegas",
    circuit: "Las Vegas Strip Circuit",
    location: "Las Vegas",
    countryCode: "us",
    country: "United States",
    trackImage: "/tracks/lasvegas-line.svg",
    laps: 50,
    start: "2026-11-19",
    end: "2026-11-21",
    sessions: [
      { name: "FP1", start: "2026-11-20T02:30:00Z" },
      { name: "FP2", start: "2026-11-20T06:00:00Z" },
      { name: "FP3", start: "2026-11-21T02:30:00Z" },
      { name: "Qualifying", start: "2026-11-21T06:00:00Z" },
      { name: "Race", start: "2026-11-22T04:00:00Z" },
    ],
  },
  {
    round: 22,
    name: "Qatar Grand Prix",
    shortName: "Qatar",
    circuit: "Lusail International Circuit",
    location: "Lusail",
    countryCode: "qa",
    country: "Qatar",
    trackImage: "/tracks/lusail-line.svg",
    laps: 57,
    start: "2026-11-27",
    end: "2026-11-29",
    sessions: [
      { name: "FP1", start: "2026-11-27T13:30:00Z" },
      { name: "FP2", start: "2026-11-27T17:00:00Z" },
      { name: "FP3", start: "2026-11-28T14:30:00Z" },
      { name: "Qualifying", start: "2026-11-28T18:00:00Z" },
      { name: "Race", start: "2026-11-29T16:00:00Z" },
    ],
  },
  {
    round: 23,
    name: "Abu Dhabi Grand Prix",
    shortName: "Abu Dhabi",
    circuit: "Yas Marina Circuit",
    location: "Yas Island",
    countryCode: "ae",
    country: "United Arab Emirates",
    trackImage: "/tracks/yasmarina-line.svg",
    laps: 58,
    start: "2026-12-04",
    end: "2026-12-06",
    sessions: [
      { name: "FP1", start: "2026-12-04T09:30:00Z" },
      { name: "FP2", start: "2026-12-04T13:00:00Z" },
      { name: "FP3", start: "2026-12-05T10:30:00Z" },
      { name: "Qualifying", start: "2026-12-05T14:00:00Z" },
      { name: "Race", start: "2026-12-06T13:00:00Z" },
    ],
  },
];
