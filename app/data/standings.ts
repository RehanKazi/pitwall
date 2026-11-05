export type Team = {
  name: string;
  /**
   * Colour vector logo (official F1 SVG). Logos that are black in the
   * original were recoloured so they show on the dark navy theme.
   */
  logo: string;
  /** Official white SVG logo, for use on team-coloured backgrounds. */
  logoWhite: string;
  color: string;
};

export type TeamId = keyof typeof teams;

export const teams = {
  mclaren: { name: "McLaren", logo: "/teams/mclaren.svg", logoWhite: "/teams/mclaren-white.svg", color: "#FF8000" },
  ferrari: { name: "Ferrari", logo: "/teams/ferrari.svg", logoWhite: "/teams/ferrari-white.svg", color: "#E8002D" },
  redbull: { name: "Red Bull Racing", logo: "/teams/redbullracing.svg", logoWhite: "/teams/redbullracing-white.svg", color: "#3671C6" },
  mercedes: { name: "Mercedes", logo: "/teams/mercedes.svg", logoWhite: "/teams/mercedes-white.svg", color: "#27F4D2" },
  astonmartin: { name: "Aston Martin", logo: "/teams/astonmartin.svg", logoWhite: "/teams/astonmartin-white.svg", color: "#229971" },
  alpine: { name: "Alpine", logo: "/teams/alpine.svg", logoWhite: "/teams/alpine-white.svg", color: "#0093CC" },
  williams: { name: "Williams", logo: "/teams/williams.svg", logoWhite: "/teams/williams-white.svg", color: "#64C4FF" },
  racingbulls: { name: "Racing Bulls", logo: "/teams/racingbulls.svg", logoWhite: "/teams/racingbulls-white.svg", color: "#6692FF" },
  haas: { name: "Haas F1 Team", logo: "/teams/haasf1team.svg", logoWhite: "/teams/haasf1team-white.svg", color: "#B6BABD" },
  audi: { name: "Audi", logo: "/teams/audi.svg", logoWhite: "/teams/audi-white.svg", color: "#F50537" },
  cadillac: { name: "Cadillac", logo: "/teams/cadillac.svg", logoWhite: "/teams/cadillac-white.svg", color: "#AAAAAD" },
} satisfies Record<string, Team>;

export type DriverStanding = {
  name: string;
  team: keyof typeof teams;
  /** Face-cropped headshot in /public/drivers. */
  photo: string;
  /** Head-and-shoulders cut-out (transparent background) in /public/drivers/portrait. */
  portrait: string;
};

/** The 2026 grid. Championship points come from the race results (app/lib/f1.ts). */
export const driverStandings: DriverStanding[] = [
  { name: "Lando Norris", team: "mclaren", photo: "/drivers/lannor01.webp", portrait: "/drivers/portrait/lannor01.webp" },
  { name: "Max Verstappen", team: "redbull", photo: "/drivers/maxver01.webp", portrait: "/drivers/portrait/maxver01.webp" },
  { name: "Oscar Piastri", team: "mclaren", photo: "/drivers/oscpia01.webp", portrait: "/drivers/portrait/oscpia01.webp" },
  { name: "George Russell", team: "mercedes", photo: "/drivers/georus01.webp", portrait: "/drivers/portrait/georus01.webp" },
  { name: "Charles Leclerc", team: "ferrari", photo: "/drivers/chalec01.webp", portrait: "/drivers/portrait/chalec01.webp" },
  { name: "Lewis Hamilton", team: "ferrari", photo: "/drivers/lewham01.webp", portrait: "/drivers/portrait/lewham01.webp" },
  { name: "Kimi Antonelli", team: "mercedes", photo: "/drivers/andant01.webp", portrait: "/drivers/portrait/andant01.webp" },
  { name: "Isack Hadjar", team: "redbull", photo: "/drivers/isahad01.webp", portrait: "/drivers/portrait/isahad01.webp" },
  { name: "Carlos Sainz", team: "williams", photo: "/drivers/carsai01.webp", portrait: "/drivers/portrait/carsai01.webp" },
  { name: "Alexander Albon", team: "williams", photo: "/drivers/alealb01.webp", portrait: "/drivers/portrait/alealb01.webp" },
  { name: "Fernando Alonso", team: "astonmartin", photo: "/drivers/feralo01.webp", portrait: "/drivers/portrait/feralo01.webp" },
  { name: "Oliver Bearman", team: "haas", photo: "/drivers/olibea01.webp", portrait: "/drivers/portrait/olibea01.webp" },
  { name: "Liam Lawson", team: "racingbulls", photo: "/drivers/lialaw01.webp", portrait: "/drivers/portrait/lialaw01.webp" },
  { name: "Pierre Gasly", team: "alpine", photo: "/drivers/piegas01.webp", portrait: "/drivers/portrait/piegas01.webp" },
  { name: "Esteban Ocon", team: "haas", photo: "/drivers/estoco01.webp", portrait: "/drivers/portrait/estoco01.webp" },
  { name: "Nico Hülkenberg", team: "audi", photo: "/drivers/nichul01.webp", portrait: "/drivers/portrait/nichul01.webp" },
  { name: "Lance Stroll", team: "astonmartin", photo: "/drivers/lanstr01.webp", portrait: "/drivers/portrait/lanstr01.webp" },
  { name: "Arvid Lindblad", team: "racingbulls", photo: "/drivers/arvlin01.webp", portrait: "/drivers/portrait/arvlin01.webp" },
  { name: "Gabriel Bortoleto", team: "audi", photo: "/drivers/gabbor01.webp", portrait: "/drivers/portrait/gabbor01.webp" },
  { name: "Franco Colapinto", team: "alpine", photo: "/drivers/fracol01.webp", portrait: "/drivers/portrait/fracol01.webp" },
  { name: "Sergio Pérez", team: "cadillac", photo: "/drivers/serper01.webp", portrait: "/drivers/portrait/serper01.webp" },
  { name: "Valtteri Bottas", team: "cadillac", photo: "/drivers/valbot01.webp", portrait: "/drivers/portrait/valbot01.webp" },
];
