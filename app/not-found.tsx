import type { Metadata } from "next";
import Link from "next/link";
import Logo from "./components/Logo";

export const metadata: Metadata = { title: "Page not found · Pitwall" };

/** 404: any unknown URL. Same look as the error screen; the sidebar stays. */
export default function NotFound() {
  return (
    <main className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center rounded-2xl border border-navy-800 dither-panel px-8 py-10 text-center">
          <Logo className="h-14 w-14 opacity-90 grayscale-[35%]" />
          <p className="mt-6 text-xs font-medium uppercase tracking-wider text-red-400">
            404 · Off track
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-50">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-navy-300">
            There&apos;s nothing at this address. Head back to the home page to
            see the next race.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-300"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
