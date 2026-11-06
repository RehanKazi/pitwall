"use client"; // Error boundaries must be Client Components

import Logo from "./components/Logo";

/**
 * Last-resort screen for when the root layout itself fails. It replaces the
 * whole document and gets no global CSS, so it's styled inline.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1329",
          color: "#dde4f4",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <title>Something went wrong · Pitwall</title>
        <div style={{ padding: 24 }}>
          <div style={{ width: 56, height: 56, margin: "0 auto" }}>
            <Logo />
          </div>
          <h1 style={{ fontSize: 24, margin: "24px 0 8px", color: "#eef2fb" }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 24px", color: "#94a5cf" }}>
            Pitwall couldn&apos;t load. Please try again.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#dc2626",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
