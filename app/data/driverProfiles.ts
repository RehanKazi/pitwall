import type { EvolutionSeries } from "./championship";
import type { Race } from "./schedule";
import type { teams } from "./standings";

type TeamId = keyof typeof teams;

/**
 * Final 2025 constructors' championship order. Cadillac is new for 2026,
 * so it goes last. Audi took over Sauber's entry, which finished 9th.
 */
export const constructorOrder2025: { team: TeamId; position: number | null }[] = [
  { team: "mclaren", position: 1 },
  { team: "mercedes", position: 2 },
  { team: "redbull", position: 3 },
  { team: "ferrari", position: 4 },
  { team: "williams", position: 5 },
  { team: "racingbulls", position: 6 },
  { team: "astonmartin", position: 7 },
  { team: "haas", position: 8 },
  { team: "audi", position: 9 },
  { team: "alpine", position: 10 },
  { team: "cadillac", position: null },
];

type CareerTotals = {
  titles: number;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  /** Year of first Grand Prix start. */
  debut: number;
};

/** Hand-maintained facts about a driver. Season stats are worked out from results (app/lib/f1.ts). */
export type DriverBio = {
  number: number;
  /** ISO 3166 alpha-2 — matches /public/flags/<code>.png */
  countryCode: string;
  nationality: string;
  /** YYYY-MM-DD */
  born: string;
  /**
   * Career totals up to the end of 2025 (f1salaries.com/driver-stats). This
   * season's results are added on top. Update titles when the season ends.
   */
  careerBefore2026: CareerTotals;
  bio: string;
};

/** A driver's bio plus their 2026 season and career-to-date stats. */
export type DriverProfile = Omit<DriverBio, "careerBefore2026"> & {
  season: {
    /** Championship position; null before their first start. */
    position: number | null;
    points: number;
    wins: number;
    podiums: number;
    poles: number;
    fastestLaps: number;
    dnfs: number;
    starts: number;
  };
  career: CareerTotals;
};

// Keyed by the driver names used in standings.ts.
export const driverBios: Record<string, DriverBio> = {
  "Lando Norris": {
    number: 1, countryCode: "gb", nationality: "British", born: "1999-11-13",
    careerBefore2026: { titles: 1, wins: 11, podiums: 44, poles: 16, points: 1430, debut: 2019 },
    bio: "Reigning world champion after sealing the 2025 title at the Abu Dhabi finale. A McLaren lifer since his 2019 debut.",
  },
  "Oscar Piastri": {
    number: 81, countryCode: "au", nationality: "Australian", born: "2001-04-06",
    careerBefore2026: { titles: 0, wins: 9, podiums: 26, poles: 6, points: 799, debut: 2023 },
    bio: "Won the F3 and F2 titles in back-to-back rookie seasons before joining McLaren in 2023. Led the 2025 standings for much of the year.",
  },
  "George Russell": {
    number: 63, countryCode: "gb", nationality: "British", born: "1998-02-15",
    careerBefore2026: { titles: 0, wins: 5, podiums: 24, poles: 8, points: 1033, debut: 2019 },
    bio: "Williams graduate who joined Mercedes in 2022 and now leads the team following Lewis Hamilton's move to Ferrari.",
  },
  "Kimi Antonelli": {
    number: 12, countryCode: "it", nationality: "Italian", born: "2006-08-25",
    careerBefore2026: { titles: 0, wins: 0, podiums: 3, poles: 0, points: 150, debut: 2025 },
    bio: "Promoted straight from F2 to replace Hamilton in 2025, becoming one of the youngest drivers ever to start a Grand Prix.",
  },
  "Max Verstappen": {
    number: 3, countryCode: "nl", nationality: "Dutch", born: "1997-09-30",
    careerBefore2026: { titles: 4, wins: 71, podiums: 127, poles: 48, points: 3444.5, debut: 2015 },
    bio: "Four-time world champion (2021–2024) and the youngest driver ever to start and win a Grand Prix. Switched from #33 to #3 for 2026.",
  },
  "Isack Hadjar": {
    number: 6, countryCode: "fr", nationality: "French", born: "2004-09-28",
    careerBefore2026: { titles: 0, wins: 0, podiums: 1, poles: 0, points: 51, debut: 2025 },
    bio: "Stepped up from Racing Bulls after a standout 2025 rookie season that included a first podium at Zandvoort.",
  },
  "Charles Leclerc": {
    number: 16, countryCode: "mc", nationality: "Monégasque", born: "1997-10-16",
    careerBefore2026: { titles: 0, wins: 8, podiums: 50, poles: 27, points: 1672, debut: 2018 },
    bio: "Ferrari's leader since 2019 and one of the fastest qualifiers on the grid. Finally won his home Monaco Grand Prix in 2024.",
  },
  "Lewis Hamilton": {
    number: 44, countryCode: "gb", nationality: "British", born: "1985-01-07",
    careerBefore2026: { titles: 7, wins: 105, podiums: 202, poles: 105, points: 5018.5, debut: 2007 },
    bio: "Seven-time world champion and record holder for wins and pole positions. Joined Ferrari in 2025 after 12 seasons at Mercedes.",
  },
  "Alexander Albon": {
    number: 23, countryCode: "th", nationality: "Thai", born: "1996-03-23",
    careerBefore2026: { titles: 0, wins: 0, podiums: 2, poles: 0, points: 313, debut: 2019 },
    bio: "Former Red Bull driver who rebuilt his career at Williams from 2022 and became the cornerstone of the team's revival.",
  },
  "Carlos Sainz": {
    number: 55, countryCode: "es", nationality: "Spanish", born: "1994-09-01",
    careerBefore2026: { titles: 0, wins: 4, podiums: 29, poles: 6, points: 1336.5, debut: 2015 },
    bio: "Four-time Grand Prix winner who joined Williams in 2025 and brought the team back to the podium in Baku.",
  },
  "Liam Lawson": {
    number: 30, countryCode: "nz", nationality: "New Zealander", born: "2002-02-11",
    careerBefore2026: { titles: 0, wins: 0, podiums: 0, poles: 0, points: 44, debut: 2023 },
    bio: "Briefly partnered Verstappen at Red Bull in early 2025 before returning to Racing Bulls, where he has rebuilt his momentum.",
  },
  "Arvid Lindblad": {
    number: 41, countryCode: "gb", nationality: "British", born: "2007-08-08",
    careerBefore2026: { titles: 0, wins: 0, podiums: 0, poles: 0, points: 0, debut: 2026 },
    bio: "Red Bull junior making his debut in 2026 as the grid's only full-time rookie, and the first driver to race with #41.",
  },
  "Fernando Alonso": {
    number: 14, countryCode: "es", nationality: "Spanish", born: "1981-07-29",
    careerBefore2026: { titles: 2, wins: 32, podiums: 106, poles: 22, points: 2393, debut: 2001 },
    bio: "Two-time world champion (2005, 2006) and the most experienced driver in F1 history by race starts.",
  },
  "Lance Stroll": {
    number: 18, countryCode: "ca", nationality: "Canadian", born: "1998-10-29",
    careerBefore2026: { titles: 0, wins: 0, podiums: 3, poles: 1, points: 325, debut: 2017 },
    bio: "Scored a podium as a Williams rookie in 2017 and took pole in Turkey in 2020. Has raced for Aston Martin since 2021.",
  },
  "Oliver Bearman": {
    number: 87, countryCode: "gb", nationality: "British", born: "2005-05-08",
    careerBefore2026: { titles: 0, wins: 0, podiums: 0, poles: 0, points: 48, debut: 2024 },
    bio: "Made a headline debut as Ferrari's stand-in at Jeddah in 2024 before earning a full-time Haas seat in 2025.",
  },
  "Esteban Ocon": {
    number: 31, countryCode: "fr", nationality: "French", born: "1996-09-17",
    careerBefore2026: { titles: 0, wins: 1, podiums: 4, poles: 0, points: 483, debut: 2016 },
    bio: "Won the 2021 Hungarian Grand Prix with Alpine. Joined Haas in 2025 as the team's experienced lead driver.",
  },
  "Nico Hülkenberg": {
    number: 27, countryCode: "de", nationality: "German", born: "1987-08-19",
    careerBefore2026: { titles: 0, wins: 0, podiums: 1, poles: 1, points: 622, debut: 2010 },
    bio: "F1 veteran who finally scored his first podium at the 2025 British Grand Prix, ending one of the longest waits in the sport.",
  },
  "Gabriel Bortoleto": {
    number: 5, countryCode: "br", nationality: "Brazilian", born: "2004-10-14",
    careerBefore2026: { titles: 0, wins: 0, podiums: 0, poles: 0, points: 19, debut: 2025 },
    bio: "Won the F3 and F2 titles back-to-back before debuting with Sauber in 2025. Now part of Audi's works project.",
  },
  "Pierre Gasly": {
    number: 10, countryCode: "fr", nationality: "French", born: "1996-02-07",
    careerBefore2026: { titles: 0, wins: 1, podiums: 5, poles: 0, points: 458, debut: 2017 },
    bio: "Surprise winner of the 2020 Italian Grand Prix with AlphaTauri. Has led Alpine's line-up since 2023.",
  },
  "Franco Colapinto": {
    number: 43, countryCode: "ar", nationality: "Argentine", born: "2003-05-27",
    careerBefore2026: { titles: 0, wins: 0, podiums: 0, poles: 0, points: 5, debut: 2024 },
    bio: "Argentina's first F1 driver in over two decades. Debuted with Williams mid-2024 before moving to Alpine.",
  },
  "Sergio Pérez": {
    number: 11, countryCode: "mx", nationality: "Mexican", born: "1990-01-26",
    careerBefore2026: { titles: 0, wins: 6, podiums: 39, poles: 3, points: 1638, debut: 2011 },
    bio: "Six-time Grand Prix winner and former Red Bull driver, back after a year out to lead Cadillac's debut season.",
  },
  "Valtteri Bottas": {
    number: 77, countryCode: "fi", nationality: "Finnish", born: "1989-08-28",
    careerBefore2026: { titles: 0, wins: 10, podiums: 67, poles: 20, points: 1797, debut: 2013 },
    bio: "Ten-time Grand Prix winner and Hamilton's teammate through five Mercedes title-winning seasons. Returns with Cadillac.",
  },
};

/** URL-safe id for a driver, e.g. "Nico Hülkenberg" -> "nico-hulkenberg". */
export function driverSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Each driver's 2026 numbers, worked out from the race results: wins, podiums,
 * fastest laps, DNFs and starts count Grands Prix only (as F1 does); points
 * include sprints. Career = careerBefore2026 + this season.
 */
export function buildDriverProfiles(
  season: Race[],
  standings: EvolutionSeries[],
): Record<string, DriverProfile> {
  const blank = (): DriverProfile["season"] => ({
    position: null,
    points: 0,
    wins: 0,
    podiums: 0,
    poles: 0,
    fastestLaps: 0,
    dnfs: 0,
    starts: 0,
  });
  const stats = new Map(Object.keys(driverBios).map((name) => [name, blank()]));
  const of = (name: string) => stats.get(name);

  for (const race of season) {
    for (const row of race.classification ?? []) {
      const s = of(row.name);
      if (!s) continue;
      const pos = Number(row.position);
      if (pos === 1) s.wins++;
      if (pos >= 1 && pos <= 3) s.podiums++;
      if (row.fastestLap) s.fastestLaps++;
      // Retired or not classified; DNS (withdrawn) isn't a start.
      if (row.position === "R" || row.position === "N") s.dnfs++;
      if (row.position !== "W" && row.position !== "F") s.starts++;
    }
    const pole = race.result?.pole;
    if (pole && of(pole)) of(pole)!.poles++;
  }
  for (const series of standings) {
    const s = of(series.name);
    if (!s) continue;
    s.points = series.cumulative.at(-1) ?? 0;
    s.position = series.ranks.at(-1) ?? null;
  }

  return Object.fromEntries(
    Object.entries(driverBios).map(([name, { careerBefore2026: before, ...bio }]) => {
      const s = stats.get(name)!;
      return [
        name,
        {
          ...bio,
          season: s,
          career: {
            ...before,
            wins: before.wins + s.wins,
            podiums: before.podiums + s.podiums,
            poles: before.poles + s.poles,
            points: before.points + s.points,
          },
        },
      ];
    }),
  );
}
