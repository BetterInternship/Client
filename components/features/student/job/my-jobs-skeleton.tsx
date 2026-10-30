import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";

type JobTab = "applications" | "saved" | "alerts";

/** Matches the actual My Jobs cards: badges, title/employer, then the action row. */
export function JobListSkeleton({
  label = "Loading your jobs",
  tab = "applications",
}: {
  label?: string;
  tab?: JobTab;
}) {
  return (
    <SkeletonRegion label={label}>
      <div className="space-y-3">
        {[0, 1, 2].map((card) => (
          <Card
            key={card}
            className={tab === "applications" ? "rounded-[0.16em]" : undefined}
          >
            <div className="space-y-3">
              {tab !== "saved" && (
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              )}
              <div className="space-y-2">
                <Skeleton
                  className={`h-6 max-w-[85%] ${card === 1 ? "w-60" : "w-72"}`}
                />
                <Skeleton className="h-4 w-44 max-w-[70%]" />
              </div>
              {tab === "saved" && (
                <div className="space-y-2 py-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              )}
              <div
                className={
                  tab === "applications" ? "flex pt-1" : "flex justify-end pt-1"
                }
              >
                {tab === "applications" ? (
                  <span className="inline-flex h-10 items-center gap-2 rounded-[0.33em] border border-gray-300 px-4 text-sm font-medium text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    Preview Resume
                  </span>
                ) : (
                  <Skeleton className="h-10 w-24 border border-gray-300 bg-gray-100" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SkeletonRegion>
  );
}

export function MyJobsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <SkeletonRegion label="Loading your jobs">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900 sm:mb-8">
          My Jobs
        </h1>
        <div className="mb-8 flex rounded-[0.33em] border border-gray-300 bg-gray-50 text-center text-xs font-medium text-gray-500 sm:text-sm">
          {["Applications", "Saved", "Alerts"].map((tab) => (
            <span key={tab} className="flex-1 py-2">
              {tab}
            </span>
          ))}
        </div>
        <JobListSkeleton />
      </SkeletonRegion>
    </div>
  );
}
