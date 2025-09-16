//contains the contents to display the job listings box

"use client";

import { Badge } from "@/components/ui/badge";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { JobListingsBox } from "./JobListingsBox";

//maybe add employers id to cross check
interface JobsContentProps {
    applications: EmployerApplication[];
    jobs: Job[];
    statusId: number[];
    employerId: string;
    onJobListingClick: (jobId: string, statusId: number[]) => void;
}

export function JobsContent({
    applications,
    jobs,
    statusId,
    employerId,
    onJobListingClick
}: JobsContentProps) {
    
    return (
        <table className="relative table-auto border-separate border-spacing-0 w-full h-full max-h-full">
            <tbody className="w-full h-full max-h-full ">
                {jobs.length > 0 
                ? 
                (
                    jobs.filter(job => job.employer_id === employerId
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
                        <Badge>No job listings currently.</Badge>
                    </div>
                )}
            </tbody>
        </table>
    );
}