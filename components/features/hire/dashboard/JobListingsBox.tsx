// ui for the job box or card

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { cn, formatCurrency } from "@/lib/utils";
import { Building, Check, Pause } from "lucide-react";
import { useRouter } from "next/navigation";

interface JobListingProps {
  job: Job;
  applications: EmployerApplication[];
  isLoading?: boolean;
}

export function JobListingsBox({
  job,
  applications,
  isLoading,
}: JobListingProps) {
  const { to_job_pay_freq_name } = useDbRefs();
  const isSuperListing = Boolean(job.challenge);
  const applicants = applications.filter(
    (application) =>
      application.job_id === job.id &&
      application.status !== 7 &&
      application.status !== 5,
  );

  const handleClick = () => {
    if (job.id && job.title !== undefined) {
      router.push(`/dashboard/manage?jobId=${job.id}`);
    } else {
      return;
    }
  };

  const router = useRouter();

  if (isLoading) {
    return <Loader>Loading...</Loader>;
  }

  return (
    // <Link href={{
    //     pathname: pathName(),
    //     query: { jobId: job.id }
    // }}>
    <Card
      className={cn(
        "flex flex-col hover:cursor-pointer gap-4",
        isSuperListing
          ? "border-amber-300 bg-amber-50/40 hover:bg-amber-100/50"
          : "hover:bg-primary/10",
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col w-full">
        <div className="flex justify-between gap-2">
          <h1
            className={cn(
              "text-base truncate",
              isSuperListing && job.is_active
                ? "font-bold text-amber-700"
                : job.is_active
                  ? "font-bold text-primary"
                  : "font-normal text-muted-foreground",
            )}
          >
            {job.title}
          </h1>
          <div className="flex items-center gap-2">
            {isSuperListing && (
              <Badge
                strength="default"
                className="border border-amber-300 bg-amber-100 text-amber-800"
              >
                Super Listing
              </Badge>
            )}
            <Badge
              strength="default"
              type="accent"
              className={cn(
                "flex gap-1",
                job.is_active
                  ? "bg-supportive text-white"
                  : "text-muted-foreground flex items-center font-normal",
              )}
            >
              {job.is_active ? (
                <Check size={16} />
              ) : (
                <Pause fill="hsl(var(--muted-foreground))" size={16} />
              )}
              <span>{job.is_active ? "Active" : "Paused"}</span>
            </Badge>
          </div>
        </div>
        {job.location ? (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Building className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        ) : (
          <br />
        )}
        {job.salary !== undefined && job.allowance === 0 ? (
          <span className="text-sm mt-2">
            {formatCurrency(job.salary!)}/
            {to_job_pay_freq_name(job.salary_freq)}
          </span>
        ) : (
          <br />
        )}
      </div>
      <div className="flex flex-row gap-2 rounded-sm">
        <Badge strength={"medium"}>
          {applicants.length} total applicant
          {applicants.length !== 1 ? "s" : ""}
        </Badge>
        <Badge
          type={
            applicants.filter((a) => a.status === 0).length > 0
              ? "primary"
              : "default"
          }
          strength={"default"}
        >
          {applicants.filter((a) => a.status === 0).length} new applicant
          {applicants.filter((a) => a.status === 0).length !== 1 ? "s" : ""}
        </Badge>
      </div>
    </Card>
    // </Link>
  );
}
