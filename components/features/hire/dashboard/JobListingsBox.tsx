import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmployerApplication, Job } from "@/lib/db/db.types";


interface JobListingProps {
    job: Job;
    applications: EmployerApplication[];
    // onJobListingClick: (job_id: string) => void;
    statusID: number;
}

export function JobListingsBox ({
    job,
    applications,
    // onJobListingClick,
    statusID }: JobListingProps) {
        const applicants = applications.filter((application) => application.job_id === job.id);
        const statusFilteredApplicants = applicants.filter((application) => application.status === statusID);

    return(
        <Card className="m-4 hover:bg-primary/25 hover:cursor-pointer">
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
