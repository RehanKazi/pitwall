"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import Logo from "./components/Logo";

/**
 * Shown in place of a page that crashed while rendering (the sidebar stays).
 * Data-source outages don't land here — they fall back to cached data — so
 * this is for genuine bugs.
 */
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // In production, server errors only carry a digest that matches the server logs.
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <main className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center rounded-2xl border border-navy-800 dither-panel px-8 py-10 text-center">
          <Logo className="h-14 w-14 opacity-90 grayscale-[35%]" />
          <p className="mt-6 text-xs font-medium uppercase tracking-wider text-red-400">
            Red flag
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-50">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-navy-300">
            This page hit an unexpected error. Try again, or head back to the
            home page.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-300"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-navy-700 px-4 py-2 text-sm font-medium text-navy-100 transition-colors hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-300"
            >
              Go home
            </Link>
          </div>

          {digest && (
            <p className="mt-6 font-mono text-[11px] text-navy-600">
              Error ID: {digest}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
