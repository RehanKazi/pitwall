"use client";

import Image from "next/image";
import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { EvolutionRound, EvolutionSeries } from "../data/championship";
import {
  COMPACT_WIDTH,
  flagAxis,
  shortLabel,
  useWidth,
  type ChampionshipKind,
} from "./chartParts";

// ---- Geometry ----

const M = { top: 14, bottom: 44, left: 36 };
/** Right-hand column: each position's label sits level with its row. */
const LABEL_W = 236;
const GAP = 18;
/** Phones: surname + points only. */
const COMPACT_LABEL_W = 116;
const COMPACT_GAP = 10;

/** Smooth S-bend between two rounds, like a bump chart. */
function bumpPath(points: { x: number; y: number }[]) {
  return points
    .map((p, i) => {
      if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      const prev = points[i - 1];
      const mx = (prev.x + p.x) / 2;
      return `C${mx.toFixed(1)},${prev.y.toFixed(1)} ${mx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join("");
}

/** "▲2" / "▼1" / "–" with colour; arrow + sign so it never relies on colour alone. */
function Change({ delta, x, y }: { delta: number | null; x: number; y: number }) {
  const text = delta === null ? "new" : delta > 0 ? `▲${delta}` : delta < 0 ? `▼${-delta}` : "–";
  const cls =
    delta === null
      ? "fill-navy-400"
      : delta > 0
        ? "fill-emerald-400"
        : delta < 0
          ? "fill-red-400"
          : "fill-navy-600";
  return (
    <text x={x} y={y} dy="0.32em" textAnchor="end" className={`text-[10.5px] tabular-nums ${cls}`}>
      {text}
    </text>
  );
}

/**
 * Championship position after each round as a bump chart: one smooth line
 * per driver (or team), position 1 at the top. The labels on the right sit
 * level with each position and read as the standings table.
 *
 * Hover: a dithered band marks the nearest round, the labels re-sort to the
 * standings after that round (points + places gained/lost that weekend), and
 * the line under the cursor is highlighted. Pointer off the chart = latest
 * standings. Labels highlight on hover and pin on click. Keyboard: focus the
 * chart, ← / → step through rounds, Esc clears.
 */
export default function RankingEvolutionChart({
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
  const [hoverName, setHoverName] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const focus = hoverName ?? pinned;

  const n = series.length;
  // Roomier rows when there are fewer lines (11 teams vs 24 drivers).
  const row = Math.max(26, Math.min(48, 560 / Math.max(1, n - 1)));
  const plotH = (n - 1) * row;
  const height = M.top + plotH + M.bottom;
  const compact = width < COMPACT_WIDTH;
  const labelW = compact ? COMPACT_LABEL_W : LABEL_W;
  const gap = compact ? COMPACT_GAP : GAP;
  const plotLeft = M.left + (compact ? 4 : 14);
  const plotRight = Math.max(plotLeft + 120, width - labelW - gap);
  const step = rounds.length > 1 ? (plotRight - plotLeft) / (rounds.length - 1) : 0;
  const xAt = (i: number) => plotLeft + i * step;
  const yAt = (rank: number) => M.top + (rank - 1) * row;
  const flags = flagAxis(step, rounds.length);

  const shownIndex = hoverIndex ?? rounds.length - 1;
  const shownRound = rounds[shownIndex];

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const i = Math.min(rounds.length - 1, Math.max(0, Math.round((x - plotLeft) / (step || 1))));
    setHoverIndex(i);
    // The line on the row under the pointer at this round.
    const rank = Math.round((y - M.top) / row) + 1;
    const hit = Math.abs(y - yAt(rank)) < row / 2 ? series.find((s) => s.ranks[i] === rank) : undefined;
    setHoverName(hit?.name ?? null);
  };

  const clearHover = () => {
    setHoverIndex(null);
    setHoverName(null);
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

  const ordered = focus
    ? [...series.filter((s) => s.name !== focus), ...series.filter((s) => s.name === focus)]
    : [...series].reverse();

  const labelX = plotRight + gap;

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKey}
      onBlur={clearHover}
      aria-label={`${kind === "drivers" ? "Drivers'" : "Constructors'"} championship positions after each of ${rounds.length} rounds. Use the arrow keys to step through rounds.`}
      className="relative rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-400"
    >
      {/* Which round the labels are showing */}
      <div
        aria-live="polite"
        className="mb-2 ml-auto flex h-5 items-center gap-1.5 text-[11px]"
        style={{ width: compact ? undefined : LABEL_W }}
      >
        {shownRound && (
          <>
            <Image
              src={`/flags/${shownRound.countryCode}.png`}
              alt=""
              width={16}
              height={11}
              className="h-[11px] w-4 shrink-0 rounded-[2px] object-cover"
            />
            <span className={`truncate ${hoverIndex !== null ? "text-navy-100" : "text-navy-400"}`}>
              After round {shownRound.round} · {shownRound.name}
            </span>
          </>
        )}
      </div>

      <svg width={width} height={height} className="block select-none" aria-hidden>
        <defs>
          <pattern id="rank-dither" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="var(--color-navy-300)" fillOpacity="0.35" />
          </pattern>
        </defs>

        {/* Row guides + position numbers — recessive */}
        {series.map((_, k) => (
          <g key={k}>
            <line
              x1={plotLeft}
              x2={plotRight}
              y1={yAt(k + 1)}
              y2={yAt(k + 1)}
              stroke="var(--color-navy-800)"
              strokeDasharray="2 5"
            />
            <text
              x={M.left - 6}
              y={yAt(k + 1)}
              dy="0.32em"
              textAnchor="end"
              className="fill-navy-400 text-[11px] tabular-nums"
            >
              {k + 1}
            </text>
          </g>
        ))}

        {/* Dithered band on the hovered round */}
        {hoverIndex !== null && (
          <rect
            x={xAt(hoverIndex) - Math.min(18, step * 0.4)}
            width={Math.min(36, step * 0.8)}
            y={M.top - row / 2}
            height={plotH + row}
            rx={6}
            fill="url(#rank-dither)"
          />
        )}

        {/* Lines */}
        {ordered.map((s) => {
          const pts = s.ranks
            .map((r, i) => (r === null ? null : { x: xAt(i), y: yAt(r), i }))
            .filter((p): p is { x: number; y: number; i: number } => p !== null);
          const dim = focus !== null && s.name !== focus;
          const isFocus = s.name === focus;
          const d = bumpPath(pts);
          return (
            <g key={s.name} opacity={dim ? 0.12 : 1} className="transition-opacity duration-150">
              {/* Soft halo behind the highlighted line */}
              {isFocus && <path d={d} fill="none" stroke={s.color} strokeOpacity={0.25} strokeWidth={9} strokeLinecap="round" />}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={isFocus ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={s.dashed ? "6 4" : undefined}
              />
              {pts.map((p) => (
                <circle
                  key={p.i}
                  cx={p.x}
                  cy={p.y}
                  r={hoverIndex === p.i && !dim ? 4 : isFocus ? 3 : 2.25}
                  fill={s.color}
                  stroke="var(--color-navy-975)"
                  strokeWidth={hoverIndex === p.i && !dim ? 1.5 : 0}
                />
              ))}
            </g>
          );
        })}

        {/* X axis: a flag per round, dot = sprint weekend */}
        {rounds.map((r, i) => (
          <g key={r.round} opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}>
            {(flags.shown(i) || hoverIndex === i) && (
              <image
                href={`/flags/${r.countryCode}.png`}
                x={xAt(i) - flags.w / 2}
                y={M.top + plotH + 16}
                width={flags.w}
                height={flags.h}
                preserveAspectRatio="xMidYMid slice"
              />
            )}
            {r.sprint && <circle cx={xAt(i)} cy={M.top + plotH + 38} r={2} fill="var(--color-navy-300)" />}
          </g>
        ))}

        {/* Pointer capture over the plot (bigger than the marks) */}
        <rect
          x={plotLeft - step / 2}
          y={M.top - row / 2}
          width={plotRight - plotLeft + step}
          height={plotH + row}
          fill="transparent"
          onPointerMove={onMove}
          // Touch: a tap picks the round and it stays until you tap elsewhere.
          onPointerDown={onMove}
          onPointerLeave={(e) => e.pointerType !== "touch" && clearHover()}
          onClick={() => hoverName && setPinned((p) => (p === hoverName ? null : hoverName))}
          className={hoverName ? "cursor-pointer" : "cursor-crosshair"}
        />

        {/* Position labels: standings after the shown round, each level with its row */}
        {series.map((s) => {
          const rank = s.ranks[shownIndex];
          if (rank === null) return null;
          const prev = shownIndex > 0 ? s.ranks[shownIndex - 1] : rank;
          const delta = prev === null ? null : prev - rank;
          const active = focus === s.name;
          const dim = focus !== null && !active;
          return (
            <g
              key={s.name}
              // Slides to its new row when the shown round changes.
              style={{ transform: `translateY(${yAt(rank)}px)`, transition: "transform 250ms ease-out" }}
              opacity={dim ? 0.4 : 1}
              className="cursor-pointer"
              onPointerEnter={() => setHoverName(s.name)}
              onPointerLeave={() => setHoverName(null)}
              onClick={() => setPinned((p) => (p === s.name ? null : s.name))}
            >
              <rect
                x={labelX - 6}
                y={-row / 2 + 2}
                width={labelW}
                height={row - 4}
                rx={5}
                fill={active ? "rgb(255 255 255 / 0.08)" : "transparent"}
              />
              <line
                x1={labelX}
                x2={labelX + 14}
                y1={0}
                y2={0}
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={s.dashed ? "3 3" : undefined}
              />
              <text
                x={labelX + 22}
                dy="0.32em"
                className={`text-xs ${active ? "fill-navy-50 font-semibold" : "fill-navy-200"}`}
              >
                {compact ? shortLabel(s.name, kind) : s.name}
              </text>
              <text
                x={labelX + labelW - (compact ? 8 : 48)}
                dy="0.32em"
                textAnchor="end"
                className="fill-navy-50 text-xs font-semibold tabular-nums"
              >
                {s.cumulative[shownIndex]}
              </text>
              {!compact && (
                <Change delta={shownIndex > 0 ? delta : 0} x={labelX + LABEL_W - 14} y={0} />
              )}
            </g>
          );
        })}
      </svg>

      <p className="mt-1 text-[11px] text-navy-500">
        Ties on points are split by countback (most wins, then most 2nds…). ▲▼ = places
        gained or lost that round.{kind === "drivers" ? " Dashed line: the lower-placed teammate." : ""}
      </p>
    </div>
  );
}
