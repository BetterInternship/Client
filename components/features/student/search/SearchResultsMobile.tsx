"use client";

import { cn } from "@betterinternship/components";
import { Paginator } from "@/components/ui/paginator";
import { Loader } from "@/components/ui/loader";
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
        {jobs.error ? (
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
                  <div
                    key={job.id}
                    className="relative group"
                    onClick={() => onJobCardClick(job)}
                  >
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

                    <JobCard job={job} on_click={() => onJobCardClick(job)} />
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
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70">
          <Loader />
        </div>
      )}
    </div>
  );
}
