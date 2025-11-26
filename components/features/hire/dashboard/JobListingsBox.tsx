// ui for the job box or card

import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useMobile } from "@/hooks/use-mobile";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { cn } from "@/lib/utils";
import { Building } from 'lucide-react';
import { useRouter } from "next/navigation";


interface JobListingProps {
    job: Job;
    applications: EmployerApplication[];
    update_job: (
        job_id: string,
        job: Partial<Job>,
    ) => Promise<{ success: boolean }>;
}

export function JobListingsBox({
    job,
    applications,
    update_job
}: JobListingProps) {
    const { to_job_pay_freq_name } = useDbRefs();
    const applicants = applications.filter(
        (application) => application.job_id === job.id
    );

    const router = useRouter();

    const handleClick = () => {
        if (job.id && job.title !== undefined) {
            router.push(`/dashboard/manage?jobId=${job.id}`)
        } else {
            return;
        }
    };

    const isMobile = useMobile();

    return (
        // <Link href={{
        //     pathname: pathName(),
        //     query: { jobId: job.id }
        // }}>
            <Card className={cn("flex flex-col hover:bg-primary/25 hover:cursor-pointer gap-4",
                !job.is_active ? "opacity-50" : "cursor-pointer",
            )}
                onClick={handleClick}
            >
                <div className="flex flex-row justify-between">
                    <div className="min-w-0">
                        <h1 className="font-bold text-primary text-base truncate">{job.title}</h1>
                        {(job.location) ?
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                                <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{job.location}</span>
                            </div> :
                            <br/>
                        }
                        {(job.salary !== undefined && job.allowance === 0) ?
                            <span className="text-sm mt-2">₱{job.salary}/{to_job_pay_freq_name(job.salary_freq)}</span> :
                            // <span className="text-sm mt-2">Unpaid</span>
                            <br/>
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
                        <h3 className={cn("text-primary", isMobile ? "text-base": "text-lg")}>{applicants.length}</h3>
                        <p className={cn("text-gray-500", isMobile ? "text-xs" : "text-sm")}>Total Applicants</p>
                    </div>
                    <div>
                        <h3 className={cn("text-primary", isMobile ? "text-base": "text-lg")}>{applicants.filter((applicant) => applicant.status === 0).length}</h3>
                        <p className={cn("text-gray-500", isMobile ? "text-xs" : "text-sm")}>New Applicants</p>
                    </div>
                </div>

            </Card>
        // </Link>
    );
}
