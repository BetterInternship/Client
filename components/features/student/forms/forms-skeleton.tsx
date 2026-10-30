import { ChevronRight, FileSearch, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HeaderTitle } from "@/components/ui/text";
import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";

export function FormTemplateListSkeleton() {
  return (
    <SkeletonRegion label="Loading form templates">
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((template) => (
          <Card key={template} className="border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-3/4" />
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
            </div>
          </Card>
        ))}
      </div>
    </SkeletonRegion>
  );
}

export function FormDetailsSkeleton() {
  return (
    <SkeletonRegion label="Loading form details" className="p-6 lg:p-8">
      <div className="space-y-8">
        <Skeleton className="h-8 w-64 max-w-full" />
        <div className="space-y-4">
          {[0, 1].map((row) => (
            <div
              key={row}
              className="flex items-center gap-3 rounded-[0.33em] border border-gray-300 bg-white p-5"
            >
              <FileText className="h-5 w-5 text-gray-300" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          ))}
        </div>
        <div className="space-y-3 border-t pt-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
      </div>
    </SkeletonRegion>
  );
}

export function FormHistorySkeleton() {
  return (
    <SkeletonRegion label="Loading form history">
      <div className="space-y-3">
        {[0, 1].map((row) => (
          <Card key={row} className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-300" />
              <Skeleton className="h-4 w-44 max-w-full" />
            </div>
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Matches the actual initial dashboard: template cards and an unselected details pane. */
export function FormsSkeleton() {
  return (
    <div className="grid h-full min-h-[28rem] w-full grid-cols-1 md:grid-cols-[clamp(260px,32vw,460px)_minmax(0,1fr)]">
      <div className="border-gray-200 md:border-r">
        <SkeletonRegion label="Loading forms" className="p-4 md:px-6">
          <div className="py-2">
            <HeaderTitle icon={FileText}>Form Templates</HeaderTitle>
            <p className="mt-2 text-sm text-gray-600">
              We have a <span className="font-semibold">guide</span> for how to
              use the forms on our site.
              <br />
              If you encounter any issues,{" "}
              <span className="font-semibold text-primary">
                message us on Facebook.
              </span>
            </p>
          </div>
        </SkeletonRegion>
        <div className="border-t border-gray-300 p-3 sm:p-4 md:p-5">
          <FormTemplateListSkeleton />
        </div>
      </div>
      <div className="hidden items-center justify-center p-6 md:flex">
        <SkeletonRegion label="Loading template selection">
          <div className="flex flex-col items-center gap-7">
            <FileSearch className="h-20 w-20 text-gray-300" />
            <Skeleton className="h-4 w-60" />
          </div>
        </SkeletonRegion>
      </div>
    </div>
  );
}
