import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Static placeholder shapes; the surrounding loading region supplies one label. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block rounded-[0.16em] bg-gray-200/80", className)}
    />
  );
}

export function SkeletonRegion({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
