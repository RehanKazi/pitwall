"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Logo from "./Logo";

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5 shrink-0",
};

const HomeIcon = () => (
  <svg {...iconProps}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </svg>
);

const DriversIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const ScheduleIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const ChampionshipIcon = () => (
  <svg {...iconProps}>
    <path d="M8 21h8M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M17 6h2.5a1.5 1.5 0 0 1 0 3H17M7 6H4.5a1.5 1.5 0 0 0 0 3H7" />
  </svg>
);

const navItems: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Home", icon: <HomeIcon /> },
  { href: "/drivers", label: "Drivers", icon: <DriversIcon /> },
  { href: "/schedule", label: "Schedule", icon: <ScheduleIcon /> },
  { href: "/championship", label: "Championship", icon: <ChampionshipIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-navy-800 dither-panel px-3 py-4">
      <Link href="/" className="flex items-center gap-3 px-2 pb-6">
        <Logo className="h-9 w-9 shrink-0" />
        <span className="text-lg font-semibold tracking-tight text-navy-50">Pitwall</span>
      </Link>

      <p className="px-3 pb-2 text-xs font-medium text-navy-500">Menu</p>
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-navy-800 text-navy-50"
                  : "text-navy-300 hover:bg-navy-900 hover:text-navy-50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <footer className="mt-auto space-y-2 px-3 pt-6 text-[11px] leading-relaxed text-navy-500">
        <p>
          Pitwall is an unofficial fan site and is not associated in any way
          with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA
          ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks
          of Formula One Licensing B.V.
        </p>
        <p>
          Team logos, names and driver images belong to their respective
          owners. Data from{" "}
          <a href="https://github.com/jolpica/jolpica-f1" className="underline hover:text-navy-300">
            Jolpica-F1
          </a>{" "}
          and{" "}
          <a href="https://openf1.org" className="underline hover:text-navy-300">
            OpenF1
          </a>
          .
        </p>
      </footer>
    </aside>
  );
}
