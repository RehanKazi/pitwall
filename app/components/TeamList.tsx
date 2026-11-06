"use client";

import { useEffect, useState } from "react";
import { teams, type TeamId } from "../data/standings";
import type { TeamProfile } from "../data/teamProfiles";
import TeamCard from "./TeamCard";

/**
 * The list of team cards on /teams. Any number can be open; /teams#mclaren
 * opens that team's card and scrolls to it (same deep-link behaviour as Drivers).
 */
export default function TeamList({
  order,
  profiles,
  asOf,
}: {
  order: TeamId[];
  profiles: Record<TeamId, TeamProfile>;
  asOf?: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let frame = 0;
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!order.includes(id as TeamId)) return;
      setExpanded(new Set([id]));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      cancelAnimationFrame(frame);
    };
  }, [order]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ol className="flex flex-col gap-5">
      {order.map((id, i) => (
        <li key={id}>
          <TeamCard
            team={teams[id]}
            profile={profiles[id]}
            expanded={expanded.has(id)}
            onToggle={() => toggle(id)}
            eager={i < 2}
            asOf={asOf}
          />
        </li>
      ))}
    </ol>
  );
}
