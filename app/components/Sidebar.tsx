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

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop (lg and up): full-height sidebar with the menu. */
export default function Sidebar() {
  const isActive = useIsActive();

  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-navy-800 dither-panel px-3 py-4 lg:flex">
      <Link href="/" className="flex items-center gap-3 px-2 pb-6">
        <Logo className="h-9 w-9 shrink-0" />
        <span className="text-lg font-semibold tracking-tight text-navy-50">Pitwall</span>
      </Link>

      <p className="px-3 pb-2 text-xs font-medium text-navy-500">Menu</p>
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
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

/** Phones and tablets: slim top bar with the logo and the current page's name. */
export function MobileHeader() {
  const isActive = useIsActive();
  const current = navItems.find((item) => isActive(item.href));

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-navy-800 bg-navy-975/90 px-4 py-3 backdrop-blur lg:hidden">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo className="h-8 w-8 shrink-0" />
        <span className="text-base font-semibold tracking-tight text-navy-50">Pitwall</span>
      </Link>
      {current && current.href !== "/" && (
        <span className="ml-auto text-sm font-medium text-navy-300">{current.label}</span>
      )}
    </header>
  );
}

/** Phones and tablets: bottom tab bar, clear of the home indicator. */
export function MobileNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-navy-800 bg-navy-975/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
              active ? "text-navy-50" : "text-navy-400 hover:text-navy-100"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full ${
                active ? "bg-navy-800" : ""
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
