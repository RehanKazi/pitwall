"use client";

import Image from "next/image";
import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { EvolutionRound, EvolutionSeries } from "../data/championship";
import {
  COMPACT_WIDTH,
  flagAxis,
  shortLabel,
  Swatch,
  useWidth,
  type ChampionshipKind,
} from "./chartParts";

// ---- Geometry ----

/** Chart height: shorter on phones so the standings stay close by. */
const HEIGHT = 520;
const COMPACT_HEIGHT = 380;
const M = { top: 16, right: 20, bottom: 44, left: 44 };
/** How close (px) the pointer must be to a line, at the hovered round, to pick that driver. */
const PICK_RADIUS = 18;

/** Round step for the y gridlines: 50s for a full season, finer early on. */
function yTicks(max: number) {
  const step = max > 200 ? 50 : max > 80 ? 25 : 10;
  const top = Math.max(step, Math.ceil(max / step) * step);
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
}

// ---- Chart ----

/**
 * Cumulative championship points after each round: one line per driver in
 * their team colour (the lower-scoring teammate dashed), or one per team.
 *
 * Hover: a crosshair snaps to the nearest round and the standings table
 * beside the chart switches to that round (re-ranked, with points gained that
 * weekend), going back to the latest standings when the pointer leaves; the
 * line nearest the cursor is highlighted with a dithered fill underneath. The legend highlights on hover and pins on click. Keyboard:
 * focus the chart, then ← / → step through rounds, Esc clears.
 */
export default function PointsEvolutionChart({
  rounds,
  series,
  kind,
}: {
  rounds: EvolutionRound[];
  series: EvolutionSeries[];
  kind: ChampionshipKind;
}) {
  const [wrapRef, width] = useWidth<HTMLDivElement>(900);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverDriver, setHoverDriver] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const focus = hoverDriver ?? pinned;

  const height = width < COMPACT_WIDTH ? COMPACT_HEIGHT : HEIGHT;
  const plotW = Math.max(120, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const { top, ticks } = yTicks(Math.max(...series.map((s) => s.cumulative.at(-1) ?? 0)));
  const step = rounds.length > 1 ? plotW / (rounds.length - 1) : 0;
  const xAt = (i: number) => M.left + i * step;
  const yAt = (v: number) => M.top + plotH - (v / top) * plotH;
  const flags = flagAxis(step, rounds.length);

  const path = (s: EvolutionSeries) =>
    s.cumulative.map((v, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join("");

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const i = Math.min(rounds.length - 1, Math.max(0, Math.round((x - M.left) / (step || 1))));
    setHoverIndex(i);
    // Nearest line at this round, if the pointer is close enough to it.
    let best: string | null = null;
    let bestDist = PICK_RADIUS;
    for (const s of series) {
      const d = Math.abs(yAt(s.cumulative[i]) - y);
      if (d < bestDist) {
        bestDist = d;
        best = s.name;
      }
    }
    setHoverDriver(best);
  };

  const clearHover = () => {
    setHoverIndex(null);
    setHoverDriver(null);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = rounds.length - 1;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : -1;
      setHoverIndex((i) => (i === null ? (d > 0 ? 0 : last) : Math.min(last, Math.max(0, i + d))));
    } else if (e.key === "Escape") {
      clearHover();
      setPinned(null);
    }
  };

  // Draw the focused driver last so it sits on top of the bundle.
  const ordered = focus
    ? [...series.filter((s) => s.name !== focus), ...series.filter((s) => s.name === focus)]
    : [...series].reverse(); // leaders on top by default
  const focused = series.find((s) => s.name === focus);
  const leader = series[0];

  // The table shows the hovered round's standings, else the latest.
  const shownIndex = hoverIndex ?? rounds.length - 1;
  const shownRound = rounds[shownIndex];
  const hovering = hoverIndex !== null;
  const tableRows = hovering
    ? [...series].sort((a, b) => b.cumulative[shownIndex] - a.cumulative[shownIndex])
    : series;

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div
        ref={wrapRef}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={clearHover}
        aria-label={`${kind === "drivers" ? "Drivers'" : "Constructors'"} championship points after each of ${rounds.length} rounds. Use the arrow keys to step through rounds.`}
        className="relative min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-400"
      >
        <svg width={width} height={height} className="block select-none" role="img" aria-hidden>
          <defs>
            {/* Dot pattern (in the theme's dither style) for the focused driver's area fill */}
            {focused && (
              <pattern id="evo-dither" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.9" fill={focused.color} fillOpacity="0.55" />
              </pattern>
            )}
          </defs>

          {/* Y gridlines + labels — recessive */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={M.left + plotW}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke="var(--color-navy-800)"
                strokeWidth={1}
                strokeDasharray={t === 0 ? undefined : "2 4"}
              />
              <text
                x={M.left - 10}
                y={yAt(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-navy-400 text-[11px] tabular-nums"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Crosshair */}
          {hoverIndex !== null && (
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={M.top}
              y2={M.top + plotH}
              stroke="var(--color-navy-500)"
              strokeWidth={1}
            />
          )}

          {/* Dithered area under the focused driver */}
          {focused && (
            <path
              d={`${path(focused)}L${xAt(rounds.length - 1)},${yAt(0)}L${xAt(0)},${yAt(0)}Z`}
              fill="url(#evo-dither)"
            />
          )}

          {/* Lines */}
          {ordered.map((s) => {
            const dim = focus !== null && s.name !== focus;
            const isFocus = s.name === focus;
            return (
              <g key={s.name} opacity={dim ? 0.12 : 1} className="transition-opacity duration-150">
                <path
                  d={path(s)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isFocus ? 3 : 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={s.dashed ? "6 4" : undefined}
                />
                {s.cumulative.map((v, i) => (
                  <circle
                    key={i}
                    cx={xAt(i)}
                    cy={yAt(v)}
                    r={hoverIndex === i && !dim ? 4 : isFocus ? 3 : 2}
                    fill={s.color}
                    // Surface ring keeps overlapping dots apart.
                    stroke="var(--color-navy-975)"
                    strokeWidth={hoverIndex === i && !dim ? 1.5 : 0}
                  />
                ))}
              </g>
            );
          })}

          {/* Direct label: the focused driver, else the leader, at the line's end */}
          {(focused ?? leader) && (() => {
            const s = focused ?? leader;
            const v = s.cumulative.at(-1)!;
            return (
              <text
                x={xAt(rounds.length - 1) - 8}
                y={yAt(v) - 10}
                textAnchor="end"
                className="fill-navy-50 text-xs font-semibold"
                style={{ paintOrder: "stroke", stroke: "var(--color-navy-975)", strokeWidth: 4 }}
              >
                {shortLabel(s.name, kind)} · {v}
              </text>
            );
          })()}

          {/* X axis: a flag per round */}
          {rounds.map((r, i) => (
            <g key={r.round} opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}>
              {(flags.shown(i) || hoverIndex === i) && (
                <image
                  href={`/flags/${r.countryCode}.png`}
                  x={xAt(i) - flags.w / 2}
                  y={M.top + plotH + 14}
                  width={flags.w}
                  height={flags.h}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {r.sprint && (
                <circle cx={xAt(i)} cy={M.top + plotH + 36} r={2} fill="var(--color-navy-300)" />
              )}
            </g>
          ))}

          {/* Pointer capture area (bigger than the marks) */}
          <rect
            x={M.left - step / 2}
            y={0}
            width={plotW + step}
            height={M.top + plotH + 8}
            fill="transparent"
            onPointerMove={onMove}
            // Touch: a tap picks the round and it stays until you tap elsewhere.
            onPointerDown={onMove}
            onPointerLeave={(e) => e.pointerType !== "touch" && clearHover()}
            onClick={() => hoverDriver && setPinned((p) => (p === hoverDriver ? null : hoverDriver))}
            className={hoverDriver ? "cursor-pointer" : "cursor-crosshair"}
          />
        </svg>

      </div>

      {/* Legend = current standings. Hover to highlight, click to pin. */}
      <div className="xl:w-64 xl:shrink-0">
        <div className="flex items-baseline justify-between px-2">
          <p className="text-xs font-medium uppercase tracking-wider text-navy-400">Standings</p>
          {pinned && (
            <button
              type="button"
              onClick={() => setPinned(null)}
              className="text-[11px] text-navy-400 hover:text-navy-100"
            >
              Clear
            </button>
          )}
        </div>
        {/* Which round the table is showing — fixed height so the list doesn't jump. */}
        <div aria-live="polite" className="mb-2 flex h-5 items-center gap-1.5 px-2 text-[11px]">
          {shownRound && (
            <>
              <Image
                src={`/flags/${shownRound.countryCode}.png`}
                alt=""
                width={16}
                height={11}
                className="h-[11px] w-4 shrink-0 rounded-[2px] object-cover"
              />
              <span className={`truncate ${hovering ? "text-navy-100" : "text-navy-400"}`}>
                After round {shownRound.round} · {shownRound.name}
                {shownRound.sprint ? " (incl. sprint)" : ""}
              </span>
            </>
          )}
        </div>
        {/* Columns fill top-down so the ranking reads 1, 2, 3… down each column. */}
        <ol className="columns-1 gap-x-4 sm:columns-2 md:columns-3 xl:columns-1">
          {tableRows.map((s, i) => {
            const active = focus === s.name;
            const gained =
              s.cumulative[shownIndex] - (shownIndex > 0 ? s.cumulative[shownIndex - 1] : 0);
            return (
              <li key={s.name} className="break-inside-avoid">
                <button
                  type="button"
                  aria-pressed={pinned === s.name}
                  onPointerEnter={() => setHoverDriver(s.name)}
                  onPointerLeave={() => setHoverDriver(null)}
                  onFocus={() => setHoverDriver(s.name)}
                  onBlur={() => setHoverDriver(null)}
                  onClick={() => setPinned((p) => (p === s.name ? null : s.name))}
                  className={`grid w-full grid-cols-[1.25rem_1rem_minmax(0,1fr)_2rem_2rem] items-center gap-x-2 rounded-md px-2 py-[3px] text-left text-xs transition-colors ${
                    active ? "bg-white/10" : "hover:bg-white/5"
                  } ${focus && !active ? "opacity-50" : ""}`}
                >
                  <span className="text-right tabular-nums text-navy-500">{i + 1}</span>
                  <Swatch color={s.color} dashed={s.dashed} />
                  <span className={`truncate ${active ? "font-semibold text-navy-50" : "text-navy-200"}`}>
                    {s.name}
                  </span>
                  {/* Points scored that weekend — only while a round is hovered. */}
                  <span className="text-right text-[11px] tabular-nums text-navy-400">
                    {hovering && gained > 0 ? `+${gained}` : ""}
                  </span>
                  <span className="text-right font-semibold tabular-nums text-navy-50">
                    {s.cumulative[shownIndex]}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 px-2 text-[11px] leading-snug text-navy-500">
          {kind === "drivers" && "Dashed line: the lower-scoring teammate. "}A dot under a
          flag marks a sprint weekend.
        </p>
      </div>
    </div>
  );
}
