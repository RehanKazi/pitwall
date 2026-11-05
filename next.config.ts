import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // app/data/tracks.ts reads these SVGs with fs. Pages re-render on the server
  // when their cached results revalidate, so the files must ship with the
  // server bundle (public/ isn't included by default on serverless hosts).
  outputFileTracingIncludes: {
    "/*": ["./public/tracks/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
