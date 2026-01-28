"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { JobCard, JobDetails } from "@/components/shared/jobs";
import { useJobsData } from "@/lib/api/student.data.api";
import { useMassApply } from "@/lib/api/god.api";
import { Job } from "@/lib/db/db.types";

interface MassApplyJobsSelectorProps {
  selectedStudentIds: Set<string>;
  onClose: () => void;
}

export function MassApplyJobsSelector({
  selectedStudentIds,
  onClose,
}: MassApplyJobsSelectorProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jobsPage, setJobsPage] = useState(1);
  const jobsPageSize = 10;
  const massApply = useMassApply();

  // Use the same hook as student search page to fetch jobs
  const jobs = useJobsData({
    search: searchTerm.trim() || undefined,
  });

  // Reset to page 1 when search term changes
  useEffect(() => {
    setJobsPage(1);
  }, [searchTerm]);

  // Filter jobs by search term
  const jobsPageData = useMemo(() => {
    return jobs.getJobsPage({ page: jobsPage, limit: jobsPageSize });
  }, [jobs, jobsPage]);

  const selectedJob = useMemo(
    () => jobs.filteredJobs?.find((j: Job) => j.id === selectedJobId),
    [jobs.filteredJobs, selectedJobId],
  );

  const handleApply = async () => {
    if (!selectedJobId) {
      alert("Please select a job");
      return;
    }

    if (!coverLetter.trim()) {
      alert("Please enter a cover letter");
      return;
    }

    try {
      await massApply.mutateAsync({
        jobId: selectedJobId,
        studentIds: Array.from(selectedStudentIds),
        coverLetter: coverLetter.trim(),
      });
      alert(
        `Successfully applied ${selectedStudentIds.size} student(s) to the job!`,
      );
      onClose();
    } catch (error) {
      console.error("Mass apply error:", error);
      alert("Failed to apply students. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col overflow-hidden h-[77vh] w-[72vw]">
      <div className="border-b px-4 py-2 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900">
          Apply {selectedStudentIds.size} Student
          {selectedStudentIds.size > 1 ? "s" : ""} to Job
        </h2>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 gap-0">
        {/* Job List - left side */}
        <div className="w-1/2 flex flex-col border-r overflow-hidden">
          <div className="px-2 py-1.5 border-b flex-shrink-0">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-1 py-0.5">
            {jobs.isPending ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-500">Loading jobs...</p>
              </div>
            ) : jobsPageData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-500">No jobs found</p>
              </div>
            ) : (
              jobsPageData.map((job: Job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedJobId === job.id}
                  on_click={() => setSelectedJobId(job.id ?? null)}
                />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {!jobs.isPending &&
            jobs.filteredJobs &&
            jobs.filteredJobs.length > jobsPageSize && (
              <div className="px-2 py-1.5 border-t flex items-center justify-between bg-gray-50 flex-shrink-0 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={jobsPage === 1}
                  onClick={() => setJobsPage((p) => Math.max(p - 1, 1))}
                  className="text-xs"
                >
                  Prev
                </Button>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {jobsPage}/
                  {Math.ceil((jobs.filteredJobs.length || 0) / jobsPageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    jobsPage >=
                    Math.ceil((jobs.filteredJobs.length || 0) / jobsPageSize)
                  }
                  onClick={() =>
                    setJobsPage((p) =>
                      Math.min(
                        p + 1,
                        Math.ceil(
                          (jobs.filteredJobs.length || 0) / jobsPageSize,
                        ),
                      ),
                    )
                  }
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            )}
        </div>

        {/* Job Details & Cover Letter - right side */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {selectedJob ? (
            <>
              <div className="flex-1 overflow-y-auto border-b min-h-0 px-3 py-2 text-sm">
                <JobDetails job={selectedJob} />
              </div>

              <div className="px-3 py-1.5 border-t flex-shrink-0 bg-white">
                <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                  Cover Letter
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a cover letter for all applications..."
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-12"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-xs">Select a job</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-2 flex justify-end gap-2  flex-shrink-0">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!selectedJobId || !coverLetter.trim() || massApply.isPending}
          onClick={() => void handleApply()}
        >
          {massApply.isPending
            ? "Applying..."
            : `Apply (${selectedStudentIds.size})`}
        </Button>
      </div>
    </div>
  );
}
