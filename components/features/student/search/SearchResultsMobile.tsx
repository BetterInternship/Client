"use client";

import Link from "next/link";
import { cn } from "@betterinternship/components";
import { Paginator } from "@/components/ui/paginator";
import { PageError } from "@/components/ui/error";
import { JobCard } from "@/components/shared/jobs";
import { FormCheckbox } from "@/components/EditForm";
import type { SearchResultsBaseProps } from "./search-results.types";

/**
 * Mobile search results: a single scrollable list of job cards. Tapping a card
 * opens the job detail modal (handled by the parent via `onJobCardClick`).
 *
 * @component
 */
export function SearchResultsMobile({
  jobs,
  jobsPage,
  jobsPageSize,
  currentPage,
  onPageChange,
  listRef,
  selectMode,
  setSelectMode,
  toggleSelect,
  isSelected,
  onJobCardClick,
}: SearchResultsBaseProps) {
  return (
    <div className="relative w-full flex flex-col h-full">
      <div ref={listRef} className="flex-1 overflow-y-auto pt-2 px-3">
        {jobs.error && jobsPage.length === 0 ? (
          <PageError
            title="Failed to load jobs."
            description="Please check your internet connection."
            image
            flush
            onRetry={() => void jobs.refetch()}
          />
        ) : (
          <>
            {jobsPage.length ? (
              <div className="space-y-4">
                {jobsPage.map((job) => (
                  <div key={job.id} className="relative group">
                    {!job.challenge && !job.hibernating && (
                      <div
                        className={cn("absolute right-4 top-5 z-10 p-1")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FormCheckbox
                          checked={isSelected(job.id)}
                          setter={() => {
                            if (!selectMode) setSelectMode(true);
                            toggleSelect(job);
                          }}
                        />
                      </div>
                    )}

                    {/* seo optimization */}
                    <Link
                      href={`/search/${job.id}`}
                      prefetch={false}
                      className="block"
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                        e.preventDefault();
                        onJobCardClick(job);
                      }}
                    >
                      <JobCard job={job} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="p-4">No jobs found.</p>
              </div>
            )}

            <div className="my-4">
              <Paginator
                totalItems={jobs.total}
                itemsPerPage={jobsPageSize}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            </div>
          </>
        )}
      </div>
      {jobs.isFetching && !jobs.isPending && (
        <div
          role="status"
          className="pointer-events-none absolute right-3 top-2 rounded border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 shadow-sm"
        >
          Updating results…
        </div>
      )}
    </div>
  );
}
