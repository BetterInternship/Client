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
    onJobListingClick: (jobId: string, jobTitle: string) => void;
    updateJob: (jobId: string, job: Partial<Job>) => Promise<any>;
}

export function JobsContent({
    applications,
    jobs,
    employerId,
    onJobListingClick,
    updateJob
}: JobsContentProps) {
    const sortedJobs = jobs.sort(
        (a,b) => 
       ((b.created_at ?? "") > (a.created_at ?? "")) ? 1 : -1
    );

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
                            onJobListingClick={onJobListingClick}
                            update_job={updateJob}
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