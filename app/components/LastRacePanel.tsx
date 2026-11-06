import ResultsTable, { type ResultsRow } from "./ResultsTable";

/** Home page side panel: the last race's classification, with each driver's championship move. */
export default function LastRacePanel({ name, rows }: { name: string; rows: ResultsRow[] }) {
  return (
    <section className="flex flex-col">
      {/* Stays put while the results scroll (in the side column or the drawer). */}
      <div className="sticky top-0 z-10 border-b border-navy-800 dither-panel px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-navy-400">Last Race</p>
        <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-navy-50">{name}</h2>
      </div>
      <ResultsTable nameHeader="Driver" valueHeader="Champ. Pos." rows={rows} />
    </section>
  );
}
