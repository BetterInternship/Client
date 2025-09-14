"use client";

import { Badge } from "@/components/ui/badge";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { JobListingsBox } from "./JobListingsBox";

interface JobsContentProps {
    applications: EmployerApplication[];
    jobs: Job[];
    statusId: number[];
    onJobListingClick: (jobId: string, statusId: number[]) => void;
}

export function JobsContent({
    applications,
    jobs,
    statusId,
    onJobListingClick
}: JobsContentProps) {
    
    return (
        <table className="relative table-auto border-separate border-spacing-0 w-full h-full max-h-full">
            <tbody className="w-full h-full max-h-full ">
                {jobs.length > 0 ? (
                    jobs.filter(job => 
                        applications.some(application => application.job_id === job.id && 
                            application.status !== undefined &&
                            statusId.includes(application.status))
                    ).map((job) => (
                        <JobListingsBox
                            key={job.id}
                            job={job}
                            applications={applications}
                            onJobListingClick={onJobListingClick}
                            statusId={statusId}
                        />
                    ))
                ) : (
                    <div className="p-2">
                        <Badge>No job listings with applications.</Badge>
                    </div>
                )}
            </tbody>
        </table>
    );
}