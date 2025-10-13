// ui for the job box or card

import { Card } from "@/components/ui/card";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import Link from "next/link";


interface JobListingProps {
    job: Job;
    applications: EmployerApplication[];
    onJobListingClick: (jobId: string, jobTitle: string) => void;
}

export function JobListingsBox ({
    job,
    applications,
    onJobListingClick,
    }: JobListingProps) {
        const applicants = applications.filter(
            (application) => application.job_id === job.id
        );

        const handleClick = () => {
            if(job.id && job.title !== undefined){
                onJobListingClick(job.id, job.title);
            }
        };

    return(
        <Link href={{
            pathname:"/dashboard/manage",
            query: {jobId: job.id}
        }}>
            <Card className="m-4 hover:bg-primary/25 hover:cursor-pointer justify-between"
            onClick={handleClick}
            >
                <h1 className="font-bold text-gray-900 text-base">{job.title}</h1>
                <p className="text-sm text-gray-500">
                    Applicants: {applicants.length}
                    {/* <Badge strength="medium" className="bg-white">
                        Applicants: {statusFilteredApplicants.length}
                    </Badge> */}
                </p>
            </Card>
        </Link>
    );
}
