// ui for the job box or card

import { Badge, BoolBadge } from "@/components/ui/badge";
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

    const handleClick = () => {
        if (job.id && job.title !== undefined) {
            router.push(`/dashboard/manage?jobId=${job.id}`)
        } else {
            return;
        }
    };

    const router = useRouter();
    const isMobile = useMobile();

    return (
        // <Link href={{
        //     pathname: pathName(),
        //     query: { jobId: job.id }
        // }}>
            <Card 
                className="flex flex-col hover:bg-primary/10 hover:cursor-pointer gap-4"
                onClick={handleClick}
            >
                <div className="flex flex-col w-full">
                    <div className="flex justify-between gap-2">
                        <h1 className={cn(
                            "text-base truncate",
                            job.is_active
                                ? "font-bold text-primary"
                                : "font-normal text-muted-foreground"
                        )}>
                            {job.title}
                        </h1>
                        <BoolBadge
                            state={job.is_active}
                            onValue="Active"
                            offValue="Paused"
                            onScheme="primary"
                            offScheme="default"
                            className="justify-self-end"
                        />
                    </div>
                    {(job.location) ?
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                        </div> :
                        <br/>
                    }
                    {(job.salary !== undefined && job.allowance === 0) ?
                        <span className="text-sm mt-2">₱{job.salary}/{to_job_pay_freq_name(job.salary_freq)}</span> :
                        <br/>
                    }
                </div>
                <div className="flex flex-row gap-2 rounded-sm">
                    <Badge 
                        strength={"medium"}
                    >
                        {applicants.length} total applicant{applicants.length !== 1 ? "s" : ""}
                    </Badge>
                    <Badge 
                        type={applicants.length > 0 ? "primary" : "default"}
                        strength={"default"}
                    >
                        {applicants.length} new applicant{applicants.length !== 1 ? "s" : ""}
                    </Badge>
                </div>

            </Card>
        // </Link>
    );
}
