import { readFileSync } from "node:fs";
import path from "node:path";
import type { Track } from "../components/TrackMap";

/** Pull the outline path out of a /public/tracks SVG so it can be drawn inline. */
export function loadTrack(publicPath: string): Track {
  const svg = readFileSync(path.join(process.cwd(), "public", publicPath), "utf8");
  const d = svg.match(/<path[^>]*\sd="([^"]+)"/)?.[1];
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!d || !viewBox) throw new Error(`No track path found in ${publicPath}`);
  return { d, viewBox };
}
