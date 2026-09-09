"use client";

import { CheckSquare, Square } from "lucide-react";
import { cn } from "@betterinternship/components";
import { Paginator } from "@/components/ui/paginator";
import { Loader } from "@/components/ui/loader";
import { PageError } from "@/components/ui/error";
import { JobCard, JobDetails } from "@/components/shared/jobs";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { ShareJobButton } from "@/components/features/student/job/share-job-button";
import type { SearchResultsDesktopProps } from "./search-results.types";

/**
 * Desktop search results: a split view with the job list on the left and the
 * selected job's details on the right.
 *
 * @component
 */
export function SearchResultsDesktop({
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
  selectedJob,
  profileData,
  onSingleApply,
}: SearchResultsDesktopProps) {
  return (
    <>
      {/* Left: List */}
      <div className="relative w-1/3 border-r">
        <div
          ref={listRef}
          className={cn(
            "h-full overflow-x-hidden overflow-y-auto",
            jobs.error ? "p-2" : "p-6",
          )}
        >
          {jobs.error ? (
            <PageError
              title="Failed to load jobs."
              description="Please check your internet connection."
              image
              flush
              topAlign
              onRetry={() => void jobs.refetch()}
            />
          ) : (
            <>
              {jobsPage.length ? (
                <div className="space-y-3">
                  {jobsPage.map((job) => (
                    <div key={job.id} className="relative group">
                      {!job.challenge && !job.hibernating && (
                        <button
                          type="button"
                          aria-label={
                            isSelected(job.id) ? "Unselect job" : "Select job"
                          }
                          className={cn(
                            "absolute right-5 top-6 z-20 h-6 w-6 bg-white/95 backdrop-blur",
                            "flex items-center justify-center transition-opacity",
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!selectMode) setSelectMode(true);
                            toggleSelect(job);
                          }}
                        >
                          {isSelected(job.id) ? (
                            <CheckSquare
                              className="w-5 h-5 text-warning transition-all duration-200 scale-100"
                              strokeWidth={2}
                            />
                          ) : (
                            <Square
                              className="w-5 h-5 text-gray-400 transition-all duration-200 scale-100"
                              strokeWidth={2}
                            />
                          )}
                        </button>
                      )}

                      <div
                        className={cn(
                          "transition-all duration-300",
                          isSelected(job.id) &&
                            "ring-1 ring-primary ring-offset-[2px] rounded-[0.4em] shadow-sm",
                        )}
                        onClick={() => onJobCardClick(job)}
                      >
                        <JobCard
                          job={job}
                          selected={selectedJob?.id === job.id}
                          on_click={() => onJobCardClick(job)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="p-4">No jobs found.</p>
                </div>
              )}

              <div className="mt-2 mb-8">
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

      {/* Right: Details */}
      <div className="w-2/3 flex flex-col overflow-hidden p-6">
        {selectedJob?.id ? (
          <JobDetails
            user={{
              github_link: profileData?.github_link ?? null,
              portfolio_link: profileData?.portfolio_link ?? null,
            }}
            job={selectedJob}
            actions={[
              <ShareJobButton job={selectedJob} />,
              <SaveJobButton job={selectedJob} />,
              <ApplyToJobButton
                profile={profileData}
                job={selectedJob}
                onApply={onSingleApply}
              />,
            ]}
          />
        ) : (
          <div className="h-full m-auto">
            <div className="flex flex-col items-center pt-[25vh] h-screen">
              <div className="opacity-35 mb-10">
                <div className="flex flex-row justify-center w-full">
                  <h1 className="block text-6xl font-heading font-bold ">
                    BetterInternship
                  </h1>
                </div>
                <br />
                <div className="flex flex-row justify-center w-full">
                  <p className="block text-2xl tracking-tight">
                    Better Internships Start Here
                  </p>
                </div>
              </div>
              <div className="w-prose text-center border border-primary border-opacity-50 text-primary shadow-sm rounded-[0.33em] opacity-85 p-4 bg-white">
                Click on a job listing to view more details!
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
