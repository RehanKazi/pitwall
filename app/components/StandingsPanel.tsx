"use client";

import { useState } from "react";
import ResultsTable, { type ResultsRow } from "./ResultsTable";

type Props = {
  constructors: ResultsRow[];
  drivers: ResultsRow[];
  /** Small caption under the Drivers heading. */
  driversNote?: string;
  lastRace: { name: string; rows: ResultsRow[] };
};

const tabs = [
  { id: "constructors", label: "Constructors" },
  { id: "drivers", label: "Drivers" },
  { id: "lastRace", label: "Last Race" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function StandingsPanel({
  constructors,
  drivers,
  driversNote,
  lastRace,
}: Props) {
  const [active, setActive] = useState<TabId>("constructors");

  return (
    <section className="flex flex-col">
      <div
        role="tablist"
        aria-label="Standings"
        className="sticky top-0 z-10 flex gap-1 border-b border-navy-800 dither-panel p-3"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? "bg-navy-800 text-navy-50"
                  : "text-navy-400 hover:bg-navy-900 hover:text-navy-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${active}`}
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
      >
        <h2 className="px-4 pb-3 pt-4 text-lg font-semibold tracking-tight text-navy-50">
          {active === "constructors" && "2026 Constructor Standings"}
          {active === "drivers" && "2026 Driver Standings"}
          {active === "lastRace" && lastRace.name}
        </h2>
        {active === "drivers" && driversNote && (
          <p className="-mt-2 px-4 pb-3 text-xs text-navy-500">{driversNote}</p>
        )}
        {active === "constructors" && (
          <ResultsTable nameHeader="Constructor" rows={constructors} />
        )}
        {active === "drivers" && (
          <ResultsTable nameHeader="Driver" rows={drivers} />
        )}
        {active === "lastRace" && (
          <ResultsTable
            nameHeader="Driver"
            valueHeader="Champ. Pos."
            rows={lastRace.rows}
          />
        )}
      </div>
    </section>
  );
}
