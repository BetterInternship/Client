import { cn } from "@betterinternship/components";

/**
 * A placeholder with a light band sweeping across it, the loading convention
 * people already read without being told (and calmer than a spinning icon on
 * something as big as a poster).
 *
 * Size and position it from the outside — `absolute inset-0` over a card,
 * `size-full` in a box — so this only has to own the shine.
 *
 * @component
 */
export function Shimmer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none block overflow-hidden bg-gray-200",
        className,
      )}
    >
      <span className="absolute inset-y-0 -left-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent will-change-transform motion-reduce:animate-none" />
    </span>
  );
}
