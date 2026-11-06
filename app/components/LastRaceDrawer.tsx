"use client";

import { useEffect, useState, type MouseEvent } from "react";
import LastRacePanel from "./LastRacePanel";
import type { ResultsRow } from "./ResultsTable";

/**
 * Phones, tablets and small laptops (below xl): the last race lives in a
 * drawer that slides in from the right. A slim arrow tab on the screen's
 * right edge opens it; the tab rides along on the drawer's edge, flips to
 * point back, and closes it again. Tapping outside, Escape, or following a
 * driver link also closes it. From xl up the panel sits beside the races instead.
 */
export default function LastRaceDrawer({ name, rows }: { name: string; rows: ResultsRow[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Following a driver link leaves the page — don't leave the drawer open behind it.
  const closeOnLink = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  };

  return (
    <div className="xl:hidden">
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Between the top bar and the bottom tabs on phones; inset from the edges on the desktop shell. */}
      <div
        className={`fixed right-0 top-[4.5rem] bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 w-[min(85vw,24rem)] transition-transform duration-300 ease-out lg:top-6 lg:bottom-6 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls="last-race-drawer"
          aria-label={open ? "Hide last race results" : "Show last race results"}
          onClick={() => setOpen((o) => !o)}
          // Low on the right edge, near the thumb and clear of the race card's content.
          className="absolute bottom-6 left-0 flex h-16 w-7 -translate-x-full items-center justify-center rounded-l-xl border border-r-0 border-navy-700 bg-navy-900/95 text-navy-200 shadow-lg shadow-black/40 backdrop-blur transition-colors hover:text-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-300"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="m10 4-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          id="last-race-drawer"
          role="region"
          aria-label="Last race results"
          inert={!open}
          onClick={closeOnLink}
          className="h-full overflow-y-auto overscroll-contain rounded-l-2xl border border-r-0 border-navy-700 dither-panel shadow-2xl shadow-black/50"
        >
          <LastRacePanel name={name} rows={rows} />
        </div>
      </div>
    </div>
  );
}
