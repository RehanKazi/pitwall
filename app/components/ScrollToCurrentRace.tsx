"use client";

import { useEffect } from "react";

/** Pause at the top first, so it's clear there are races above. */
const DELAY_MS = 450;
/** Glide time; long jumps get a little longer, but it stays quick. */
const MIN_DURATION_MS = 550;
const MAX_DURATION_MS = 1000;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** The element that actually scrolls: the page panel on desktop, the document on phones. */
function scrollParent(el: HTMLElement): HTMLElement {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if ((overflowY === "auto" || overflowY === "scroll") && p.scrollHeight > p.clientHeight) {
      return p;
    }
  }
  return document.scrollingElement as HTMLElement;
}

/**
 * On the schedule page: start at the top, then glide down to the current race
 * — the same one the home page shows first (the first weekend that isn't over).
 * Runs each time the page is shown. Any scroll input from the user cancels it,
 * and with reduced motion it jumps straight there.
 *
 * `ends` is each round's end time (ms); the card for a round has id `round-<n>`.
 */
export default function ScrollToCurrentRace({ ends }: { ends: { round: number; end: number }[] }) {
  useEffect(() => {
    const now = Date.now();
    const current = ends.find((r) => r.end > now) ?? ends.at(-1);
    const target = current && document.getElementById(`round-${current.round}`);
    if (!target) return;

    const scroller = scrollParent(target);
    scroller.scrollTop = 0;

    let frame = 0;
    let timer = 0;
    const cancel = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      stopListening();
    };
    // Hands off as soon as the user scrolls themselves.
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stopListening = () =>
      inputs.forEach((e) => window.removeEventListener(e, cancel, { capture: true }));
    inputs.forEach((e) => window.addEventListener(e, cancel, { capture: true, passive: true }));

    timer = window.setTimeout(() => {
      // Scroll margin keeps the card clear of the sticky mobile header.
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const isDocument = scroller === document.scrollingElement;
      const scrollerTop = isDocument ? 0 : scroller.getBoundingClientRect().top;
      const to = Math.min(
        scroller.scrollHeight - scroller.clientHeight,
        target.getBoundingClientRect().top - scrollerTop + scroller.scrollTop - margin,
      );
      const from = scroller.scrollTop;
      const distance = to - from;
      if (distance <= 0) return stopListening();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        scroller.scrollTop = to;
        return stopListening();
      }

      const duration = Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, distance / 6));
      const start = performance.now();
      const step = (t: number) => {
        const progress = Math.min(1, (t - start) / duration);
        scroller.scrollTop = from + distance * easeInOutCubic(progress);
        if (progress < 1) frame = requestAnimationFrame(step);
        else stopListening();
      };
      frame = requestAnimationFrame(step);
    }, DELAY_MS);

    return cancel;
  }, [ends]);

  return null;
}
