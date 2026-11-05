/** Pulsing red "live" indicator. */
export default function LiveDot({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";
  return (
    <span className={`relative inline-flex shrink-0 ${dim}`} aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
      <span className={`relative inline-flex rounded-full bg-red-500 ${dim}`} />
    </span>
  );
}
