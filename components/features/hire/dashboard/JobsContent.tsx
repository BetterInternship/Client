//contains the contents to display the job listings box

"use client";

import { Badge } from "@/components/ui/badge";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { JobListingsBox } from "./JobListingsBox";

//maybe add employers id to cross check
interface JobsContentProps {
    applications: EmployerApplication[];
    jobs: Job[];
    employerId: string;
    updateJob: (jobId: string, job: Partial<Job>) => Promise<any>;
    isLoading?: boolean;
}

export function JobsContent({
    applications,
    jobs,
    employerId,
    updateJob, 
    isLoading
}: JobsContentProps) {
    const sortedJobs = jobs.sort(
        (a,b) => 
       ((b.created_at ?? "") > (a.created_at ?? "")) ? 1 : -1
    );

    if(isLoading) {
        return (
        <div className="w-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Listings...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
            {jobs.length > 0
                ?
                (
                    sortedJobs.filter(job => job.employer_id === employerId
                    ).map((job) => (
                        <JobListingsBox
                            key={job.id}
                            job={job}
                            applications={applications}
                            update_job={updateJob}
                            isLoading={isLoading}
                        />
                    ))
                ) : (
                    <div className="p-2 m-4">
                        <Badge>No job listings currently.</Badge>
                    </div>
                )}
        </div>
    );
}