import { Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";

/** Mirrors JobCard, including its 24px padding; no invented logo/avatar slot. */
export function SearchCardSkeleton() {
  return (
    <Card className="relative px-6 py-6">
      <span className="absolute right-5 top-6 h-6 w-6 rounded-[0.16em] border border-gray-200 bg-gray-50" />
      <div className="space-y-2 pr-6">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="mt-6 flex items-center gap-2 text-gray-300">
        <Building className="h-4 w-4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-6 w-24 border border-gray-300 bg-gray-100" />
        <Skeleton className="h-6 w-20 border border-gray-300 bg-gray-100" />
      </div>
    </Card>
  );
}

export function SearchListSkeleton() {
  return (
    <SkeletonRegion label="Loading internships">
      <div className="space-y-4 md:space-y-3">
        {[0, 1, 2, 3].map((card) => (
          <SearchCardSkeleton key={card} />
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Uses the existing JobDetails sections instead of a generic loading panel. */
export function JobDetailsSkeleton() {
  return (
    <SkeletonRegion
      label="Loading job details"
      className="min-w-0 flex-1 overflow-y-auto p-6"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-8 w-80 max-w-full" />
            <Skeleton className="h-5 w-48 max-w-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 border border-gray-300 bg-gray-100" />
            <Skeleton className="h-10 w-20 border border-gray-300 bg-gray-100" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="space-y-4 py-2">
          <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 border-t pt-5">
          <h2 className="text-lg font-semibold text-gray-900">Role overview</h2>
          <div className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}

/** Public results load independently of session verification. */
export function SearchSkeleton() {
  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      <div className="w-full overflow-y-auto px-3 pt-2 md:w-1/3 md:border-r md:p-6">
        <SearchListSkeleton />
      </div>
      <div className="hidden min-w-0 md:flex md:w-2/3">
        <JobDetailsSkeleton />
      </div>
    </div>
  );
}
