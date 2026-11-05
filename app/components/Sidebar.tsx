"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
    <aside className="flex w-64 shrink-0 flex-col border-r border-navy-800 dither-panel px-3 py-4">
      <Link href="/" className="flex items-center gap-3 px-2 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-lg font-bold italic text-white">
          P
        </div>
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
    </aside>
  );
}
