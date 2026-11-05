"use client";

import { useId, useSyncExternalStore } from "react";

export type Track = { d: string; viewBox: string };

export type LapMarker = {
  /** Changes whenever a new lap should start from the line. */
  key: string;
  driverName: string;
  photo: string;
  color: string;
  /** Real lap time in seconds; the animation plays it faster. */
  lapSeconds: number;
};

/** Animation runs this many times faster than the real lap. */
export const LAP_SPEEDUP = 6;

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotion = () => false;

/** First "M x y" of a path — where the marker sits when not animating. */
/**
 * Starts the lap from the line when a marker mounts. Module-level so its
 * identity is stable — an inline callback would re-run (and restart the lap)
 * on every re-render, and the parent re-renders every second for its clock.
 */
function startLap(el: SVGAnimateMotionElement | null) {
  el?.beginElement();
}

function startPoint(d: string) {
  const m = d.match(/^M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : { x: 0, y: 0 };
}

export default function TrackMap({
  track,
  label,
  lap,
}: {
  track: Track;
  label: string;
  lap?: LapMarker | null;
}) {
  const uid = useId().replace(/:/g, "");
  const pathId = `track-${uid}`;
  const clipId = `face-${uid}`;
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const start = startPoint(track.d);

  return (
    <svg
      viewBox={track.viewBox}
      role="img"
      aria-label={label}
      className="h-auto w-full max-w-md overflow-visible"
    >
      <path
        id={pathId}
        d={track.d}
        fill="none"
        stroke="#fff"
        strokeWidth={3.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {lap && (
        <g
          key={lap.key}
          transform={reducedMotion ? `translate(${start.x} ${start.y})` : undefined}
        >
          {!reducedMotion && (
            <animateMotion
              begin="indefinite"
              dur={`${(lap.lapSeconds / LAP_SPEEDUP).toFixed(2)}s`}
              repeatCount="indefinite"
              ref={startLap}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          )}
          <title>{lap.driverName}</title>
          <defs>
            <clipPath id={clipId}>
              <circle r={13} />
            </clipPath>
          </defs>
          <circle r={14.5} fill={lap.color} stroke="#fff" strokeWidth={1.5} />
          <image
            href={lap.photo}
            x={-13}
            y={-13}
            width={26}
            height={26}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      )}
    </svg>
  );
}
