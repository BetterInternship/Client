// ui for the job box or card

import { Card } from "@/components/ui/card";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, } from 'lucide-react';
import Link from "next/link";
import { useDbRefs } from "@/lib/db/use-refs";


interface JobListingProps {
    job: Job;
    applications: EmployerApplication[];
    onJobListingClick: (jobId: string, jobTitle: string) => void;
    update_job: (
        job_id: string,
        job: Partial<Job>,
    ) => Promise<{ success: boolean }>;
}

export function JobListingsBox({
    job,
    applications,
    onJobListingClick,
    update_job
}: JobListingProps) {
    const { to_job_pay_freq_name } = useDbRefs();
    const applicants = applications.filter(
        (application) => application.job_id === job.id
    );

    const handleClick = () => {
        if (job.id && job.title !== undefined && job.is_active) {
            onJobListingClick(job.id, job.title);
        } else {
            return;
        }
    };

    const pathName = () => {
        if (job.is_active) {
            return "/dashboard/manage";
        } else {
            return "/dashboard"
        }
    }

    return (
        <Link href={{
            pathname: pathName(),
            query: { jobId: job.id }
        }}>
            <Card className={cn("flex flex-col hover:bg-primary/25 hover:cursor-pointer gap-4",
                !job.is_active ? "opacity-50" : "cursor-pointer",
            )}
                onClick={handleClick}
            >
                <div className="flex flex-row justify-between">
                    <div className="min-w-0">
                        <h1 className="font-bold text-primary text-base truncate">{job.title}</h1>
                        {job.location &&
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                                <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{job.location}</span>
                            </div>
                        }
                        {job.salary !== undefined && job.allowance === 0 &&
                            <span className="text-sm mt-2">₱{job.salary}/{to_job_pay_freq_name(job.salary_freq)}</span>
                        }
                    </div>
                    <div className="justify-self-end">
                        <Toggle
                            state={job.is_active}
                            onClick={() => {
                                if (!job.id) return;
                                void update_job(job.id, {
                                    is_active: !job.is_active,
                                });
                            }}
                        />
                    </div>
                </div>
                <div className="flex flex-row gap-6 rounded-sm">
                    <div>
                        <h3 className="text-lg text-primary">{applicants.length}</h3>
                        <p className="text-sm text-gray-500">Total Applicants</p>
                    </div>
                    <div>
                        <h3 className="text-lg text-primary">0</h3> {/* TODO: query database for this information */}
                        <p className="text-sm text-gray-500">New Applicants</p>
                    </div>
                </div>

            </Card>
        </Link>
    );
}
