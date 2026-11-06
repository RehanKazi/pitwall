import type { EvolutionSeries } from "./championship";
import type { Race } from "./schedule";
import { driverStandings, teams, type TeamId } from "./standings";
import { teamHistoryBefore2026 } from "./teamHistory";

export type PhotoCredit = {
  author: string;
  license: string;
  licenseUrl: string;
  /** The file's page on Wikimedia Commons. */
  source: string;
};

/** Hand-maintained facts about a team for 2026. */
type TeamInfo = {
  base: string;
  /** ISO 3166 alpha-2 — matches /public/flags/<code>.png */
  baseCountry: string;
  powerUnit: string;
  principal: {
    name: string;
    role: string;
    /**
     * Head-and-shoulders cut-out in /public/principals, framed like the driver
     * portraits and named after the person — a new principal gets a new file
     * name, so no cached copy of the old photo can show up. Null shows a
     * neutral silhouette.
     */
    photo: string | null;
    /** Only for Wikimedia Commons photos, whose licences require attribution. */
    credit?: PhotoCredit;
  };
};

const BY_SA_4 = { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };
const BY_4 = { license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" };
const CC0 = { license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" };
const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

/**
 * Team principals as of November 2026 (Cadillac: Marcin Budkowski since
 * 12 Aug 2026; Alpine is run by executive advisor Flavio Briatore).
 *
 * Photos: McLaren, Mercedes, Red Bull, Aston Martin, Racing Bulls, Haas and
 * Cadillac are from assets/teamprincipals (supplied cut-outs); Ferrari, Alpine,
 * Williams and Audi are Wikimedia Commons photos with the background removed,
 * credited below. All are framed to match the driver portraits.
 */
export const teamInfo: Record<TeamId, TeamInfo> = {
  mclaren: {
    base: "Woking", baseCountry: "gb", powerUnit: "Mercedes",
    principal: { name: "Andrea Stella", role: "Team Principal", photo: "/principals/andrea-stella.webp" },
  },
  ferrari: {
    base: "Maranello", baseCountry: "it", powerUnit: "Ferrari",
    principal: { name: "Fred Vasseur", role: "Team Principal", photo: "/principals/fred-vasseur.webp",
      credit: { author: "Race Service for Ferrari S.p.A. / Danyele", ...BY_SA_4,
        source: commons("MJXKPW_240117_SF_F1_FVasseur_Red_PR_AN_076161-1920x0_YRHUGH_(close-up).jpg") } },
  },
  redbull: {
    base: "Milton Keynes", baseCountry: "gb", powerUnit: "Red Bull Ford",
    principal: { name: "Laurent Mekies", role: "Team Principal", photo: "/principals/laurent-mekies.webp" },
  },
  mercedes: {
    base: "Brackley", baseCountry: "gb", powerUnit: "Mercedes",
    principal: { name: "Toto Wolff", role: "Team Principal", photo: "/principals/toto-wolff.webp" },
  },
  astonmartin: {
    base: "Silverstone", baseCountry: "gb", powerUnit: "Honda",
    principal: { name: "Adrian Newey", role: "Team Principal", photo: "/principals/adrian-newey.webp" },
  },
  alpine: {
    base: "Enstone", baseCountry: "gb", powerUnit: "Mercedes",
    principal: { name: "Flavio Briatore", role: "Executive Advisor", photo: "/principals/flavio-briatore.webp",
      credit: { author: "Minerva97", ...BY_SA_4,
        source: commons("Briatore_66%C3%A8me_Festival_de_Venise_(Mostra)_-_cropped.jpg") } },
  },
  williams: {
    base: "Grove", baseCountry: "gb", powerUnit: "Mercedes",
    principal: { name: "James Vowles", role: "Team Principal", photo: "/principals/james-vowles.webp",
      credit: { author: "Wf1fan", ...CC0, source: commons("James_Vowles_at_Goodwood_FOS.png") } },
  },
  racingbulls: {
    base: "Faenza", baseCountry: "it", powerUnit: "Red Bull Ford",
    principal: { name: "Alan Permane", role: "Team Principal", photo: "/principals/alan-permane.webp" },
  },
  haas: {
    base: "Kannapolis", baseCountry: "us", powerUnit: "Ferrari",
    principal: { name: "Ayao Komatsu", role: "Team Principal", photo: "/principals/ayao-komatsu.webp" },
  },
  audi: {
    base: "Hinwil", baseCountry: "ch", powerUnit: "Audi",
    principal: { name: "Jonathan Wheatley", role: "Team Principal", photo: "/principals/jonathan-wheatley.webp",
      credit: { author: "Liauzh", ...BY_4, source: commons("2026_Chinese_GP_-_Jonathan_Wheatley_(cropped).jpg") } },
  },
  cadillac: {
    base: "Fishers", baseCountry: "us", powerUnit: "Ferrari",
    principal: { name: "Marcin Budkowski", role: "Team Principal", photo: "/principals/marcin-budkowski.webp" },
  },
};

export type TeamProfile = TeamInfo & {
  id: TeamId;
  /** The team's two race drivers, higher-scoring first. */
  drivers: { name: string; portrait: string; photo: string; points: number; position: number | null }[];
  season: {
    /** Constructors' championship position; null before the first round. */
    position: number | null;
    points: number;
    wins: number;
    /** Podium finishes (both cars count). */
    podiums: number;
    poles: number;
    oneTwos: number;
    fastestLaps: number;
    dnfs: number;
  };
  /** All-time totals for this constructor, including 2026 so far. */
  allTime: { titles: number; wins: number; podiums: number; poles: number };
};

/**
 * Each team's 2026 numbers worked out from the race results (Grands Prix only
 * for wins, podiums etc.; points include sprints), plus their all-time record:
 * the pre-2026 history from teamHistory.ts with this season added on top.
 */
export function buildTeamProfiles(
  season: Race[],
  constructors: EvolutionSeries[],
  drivers: EvolutionSeries[],
): Record<TeamId, TeamProfile> {
  const ids = Object.keys(teams) as TeamId[];
  const blank = (): TeamProfile["season"] => ({
    position: null, points: 0, wins: 0, podiums: 0, poles: 0, oneTwos: 0, fastestLaps: 0, dnfs: 0,
  });
  const stats = new Map(ids.map((id) => [id, blank()]));

  for (const race of season) {
    const rows = race.classification ?? [];
    for (const row of rows) {
      const s = stats.get(row.team);
      if (!s) continue;
      const pos = Number(row.position);
      if (pos === 1) s.wins++;
      if (pos >= 1 && pos <= 3) s.podiums++;
      if (row.fastestLap) s.fastestLaps++;
      if (row.position === "R" || row.position === "N") s.dnfs++;
    }
    if (rows[0] && rows[1] && rows[0].team === rows[1].team && rows[1].position === "2") {
      stats.get(rows[0].team)!.oneTwos++;
    }
    const poleTeam = rows.find((r) => r.name === race.result?.pole)?.team;
    if (poleTeam) stats.get(poleTeam)!.poles++;
  }
  for (const c of constructors) {
    const s = stats.get(c.team)!;
    s.points = c.cumulative.at(-1) ?? 0;
    s.position = c.ranks.at(-1) ?? null;
  }

  const driverStats = new Map(drivers.map((d) => [d.name, d]));
  return Object.fromEntries(
    ids.map((id) => {
      const s = stats.get(id)!;
      const before = teamHistoryBefore2026[id];
      const lineup = driverStandings
        .filter((d) => d.team === id)
        .map((d) => ({
          name: d.name,
          portrait: d.portrait,
          photo: d.photo,
          points: driverStats.get(d.name)?.cumulative.at(-1) ?? 0,
          position: driverStats.get(d.name)?.ranks.at(-1) ?? null,
        }))
        .sort((a, b) => b.points - a.points);
      return [
        id,
        {
          id,
          ...teamInfo[id],
          drivers: lineup,
          season: s,
          allTime: {
            titles: before.titles,
            wins: before.wins + s.wins,
            podiums: before.podiums + s.podiums,
            poles: before.poles + s.poles,
          },
        },
      ];
    }),
  ) as Record<TeamId, TeamProfile>;
}
