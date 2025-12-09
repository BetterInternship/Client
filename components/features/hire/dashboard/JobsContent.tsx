//contains the contents to display the job listings box

"use client";

import { motion } from "framer-motion";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { JobListingsBox } from "./JobListingsBox";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";

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
    const { isMobile } = useAppContext();

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
        <>
            <motion.div
                initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
                animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
                exit={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {jobs.length > 0
                    ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                        {
                            sortedJobs.filter(job => job.employer_id === employerId
                            ).map((job) => (
                                <JobListingsBox
                                    key={job.id}
                                    job={job}
                                    applications={applications}
                                    isLoading={isLoading}
                                />
                            ))
                        }
                    </div>
                    ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                            <span className="text-muted-foreground">You haven't created any job listings.</span>
                            <div className={cn(
                                "flex gap-2",
                                isMobile
                                ? "flex-col items-center"
                                : ""
                            )}>
                                <Link
                                    href="/listings/create"
                                    className=""
                                >
                                    <Button
                                        className="px-8 py-6"
                                    >
                                        <Plus />
                                        Add a listing to get started.
                                    </Button>
                                </Link>
                                <Link
                                    href="https://calendar.app.google/boXRU8HEkisZT95D6"
                                >
                                    <Button
                                        className="px-8 py-6"
                                        variant="outline"
                                    >
                                        <Calendar />
                                        Need help? Book a demo.
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
            </motion.div>
        </>
    );
}