"use client";

import { useState } from "react";
import type { EvolutionRound, EvolutionSeries } from "../data/championship";
import type { ChampionshipKind } from "./chartParts";
import PointsEvolutionChart from "./PointsEvolutionChart";
import RankingEvolutionChart from "./RankingEvolutionChart";

const views: { kind: ChampionshipKind; label: string; noun: string }[] = [
  { kind: "drivers", label: "Drivers", noun: "Driver" },
  { kind: "constructors", label: "Constructors", noun: "Constructor" },
];

/**
 * The Championship page's charts — points evolution, then position
 * evolution — with one Drivers / Constructors switch driving both.
 */
export default function ChampionshipView({
  rounds,
  drivers,
  constructors,
}: {
  rounds: EvolutionRound[];
  drivers: EvolutionSeries[];
  constructors: EvolutionSeries[];
}) {
  const [kind, setKind] = useState<ChampionshipKind>("drivers");
  const view = views.find((v) => v.kind === kind)!;
  const series = kind === "drivers" ? drivers : constructors;

  return (
    <>
      <div className="mt-6 flex justify-end">
        <div
          role="group"
          aria-label="Championship"
          className="flex shrink-0 rounded-full bg-navy-900 p-0.5 ring-1 ring-navy-800"
        >
          {views.map((v) => (
            <button
              key={v.kind}
              type="button"
              aria-pressed={v.kind === kind}
              onClick={() => setKind(v.kind)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                v.kind === kind ? "bg-navy-700 text-navy-50" : "text-navy-400 hover:text-navy-100"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-3 rounded-xl border border-navy-800 p-4 dither-panel sm:p-6">
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-navy-50">
          {view.noun} Points Evolution
        </h2>
        {/* Keyed so a pinned highlight doesn't carry over between views. */}
        <PointsEvolutionChart key={kind} kind={kind} rounds={rounds} series={series} />
      </section>

      <section className="mt-6 rounded-xl border border-navy-800 p-4 dither-panel sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-navy-50">
          {view.noun} Ranking Evolution
        </h2>
        <RankingEvolutionChart key={kind} kind={kind} rounds={rounds} series={series} />
      </section>
    </>
  );
}
