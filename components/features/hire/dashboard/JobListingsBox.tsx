// ui for the job box or card

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmployerApplication, Job } from "@/lib/db/db.types";


interface JobListingProps {
    job: Job;
    applications: EmployerApplication[];
    onJobListingClick: (jobId: string, statusId: number[], jobTitle: string) => void;
    statusId: number[];
}

export function JobListingsBox ({
    job,
    applications,
    onJobListingClick,
    statusId }: JobListingProps) {
        const applicants = applications.filter((application) => application.job_id === job.id);
        const statusFilteredApplicants = applicants.filter((application) => application.status !== undefined &&
        statusId.includes(application.status));
        const handleClick = () => {
            if(job.id && job.title !== undefined){
                onJobListingClick(job.id, statusId, job.title);
            }
        };

    return(
        <Card className="m-4 hover:bg-primary/25 hover:cursor-pointer"
        onClick={handleClick}
        >
            <h1 className="font-bold text-gray-900 text-base">{job.title}</h1>
            <p className="text-sm text-gray-500">
                <Badge strength="medium" className="bg-white">
                    Applicants: {statusFilteredApplicants.length}
                </Badge>
                {/* Applicants: {statusFilteredApplicants.length} */}
            </p>
        </Card>
    );
}
