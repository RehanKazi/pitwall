"use client";

import { useEffect, useState } from "react";
import { driverSlug, type DriverProfile } from "../data/driverProfiles";
import { teams, type DriverStanding } from "../data/standings";
import DriverCard from "./DriverCard";

/**
 * The list of driver cards on /drivers. Any number of cards can be open.
 *
 * Deep links: /drivers#lando-norris opens that driver's card and scrolls to
 * it. This runs whenever the page is shown — Next keeps visited pages alive
 * but hidden, and React re-runs effects each time a hidden page is revealed,
 * so following a new link from the standings table works every time.
 */
export default function DriverList({
  drivers,
  profiles,
}: {
  drivers: DriverStanding[];
  profiles: Record<string, DriverProfile>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let frame = 0;
    const openFromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!slug || !drivers.some((d) => driverSlug(d.name) === slug)) return;
      // A deep link shows just that driver, open.
      setExpanded(new Set([slug]));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.getElementById(slug)?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    };

    // On arrival (or when this kept-alive page is shown again) …
    openFromHash();
    // … and when only the hash changes while already on this page.
    window.addEventListener("hashchange", openFromHash);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      cancelAnimationFrame(frame);
    };
  }, [drivers]);

  const toggle = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <ol className="mt-8 flex flex-col gap-5">
      {drivers.map((d, i) => {
        const slug = driverSlug(d.name);
        return (
          <li key={d.name}>
            <DriverCard
              id={slug}
              name={d.name}
              portrait={d.portrait}
              team={teams[d.team]}
              profile={profiles[d.name]}
              expanded={expanded.has(slug)}
              onToggle={() => toggle(slug)}
              eager={i < 2}
            />
          </li>
        );
      })}
    </ol>
  );
}
