//contains the contents to display the job listings box

"use client";

import { Plus } from "lucide-react";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { JobListingsBox } from "./JobListingsBox";
import { useAppContext } from "@/lib/ctx-app";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    const { isMobile } = useAppContext();
    const sortedJobs = jobs.sort(
        (a,b) => 
       ((b.created_at ?? "") > (a.created_at ?? "")) ? 1 : -1
    );

    return (
        <>
            {jobs.length > 0
                ?
                (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                        {
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
                        }
                    </div>
                ) : (
                    <div className={cn("grid place-items-center mt-[25vh]",
                        isMobile ? "" : "gap-4"
                    )}>
                        <p className="text-gray-500 text-lg">No job listings currently.</p>
                        {isMobile ? (
                            <p className="text-sm text-gray-400">Start creating jobs using the + button below.</p>
                        ):(
                            <Link href="listings/create">
                                <button className="flex text-primary rounded-sm p-4 gap-2 items-center border hover:opacity-60">
                                    <Plus className="h-5 w-5"/>
                                    <p className="text-primary text-sm">Start by creating a listing</p>
                                </button>
                            </Link>
                        )}
                    </div>
                )}
        </>
    );
}