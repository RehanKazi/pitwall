"use client";

import { useEffect, useRef, useState } from "react";

/** Shared bits of the Championship page's charts. */

export type ChampionshipKind = "drivers" | "constructors";

/** Short label for tight spots: a driver's surname, or the team name as-is. */
export const shortLabel = (name: string, kind: ChampionshipKind) =>
  kind === "constructors" ? name : name.split(" ").slice(1).join(" ") || name;

/** Tracks an element's width (charts redraw to fit instead of scaling their text). */
export function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Little line sample for legends — solid or dashed like the chart line. */
export function Swatch({ color, dashed }: { color: string; dashed: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 4" className="h-1 w-4 shrink-0 overflow-visible">
      <line
        x1="1"
        y1="2"
        x2="15"
        y2="2"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={dashed ? "3 3" : undefined}
      />
    </svg>
  );
}
