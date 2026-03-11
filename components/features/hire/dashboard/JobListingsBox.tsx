// ui for the job box or card

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { EmployerApplication, Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowRight, Building, Check, Pause, Zap } from "lucide-react";
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
  const newApplicants = applicants.filter((a) => a.status === 0).length;

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
    <div className="relative">
      {/* <Link href={{
          pathname: pathName(),
          query: { jobId: job.id }
      }}> */}
      <Card
        className={cn(
          "flex flex-col gap-4 hover:cursor-pointer",
          isSuperListing
            ? "super-card group relative isolate rounded-[0.33em] bg-[radial-gradient(ellipse_at_top_left,rgba(254,240,138,0.5),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(251,146,60,0.18),transparent_35%),linear-gradient(150deg,rgba(255,251,235,1)_0%,rgba(255,255,255,1)_45%,rgba(254,243,199,0.98)_100%)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(245,158,11,0.25),0_0_80px_rgba(245,158,11,0.12),0_20px_40px_rgba(249,115,22,0.15)]"
            : "hover:bg-primary/10",
          !job.is_active ? "opacity-70" : "",
        )}
        onClick={handleClick}
      >
        <div className="flex flex-col w-full">
          {isSuperListing && (
            <div className="mb-2">
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white super-header-badge px-3 py-1.5 text-xs font-bold text-amber-900">
                <span className="text-sm leading-none">⚡</span>
                <span className="tracking-wide">Super Listing</span>
              </div>
            </div>
          )}
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
        {isSuperListing ? (
          <div className="flex w-full rounded-sm">
            <div className="super-cta-glow flex min-w-0 w-full items-center gap-2 rounded-xl border border-amber-400/80 bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_60%,#ea580c_100%)] px-3 py-2 text-xs font-bold text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1">
              <Zap className="h-3.5 w-3.5 shrink-0 fill-current drop-shadow-[0_0_4px_rgba(255,255,255,0.45)]" />
              <span className="min-w-0 flex-1 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                Action needed
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        ) : (
          <div className="flex flex-row gap-2 rounded-sm">
            <Badge strength={"medium"}>
              {applicants.length} total applicant
              {applicants.length !== 1 ? "s" : ""}
            </Badge>
            <Badge
              type={newApplicants > 0 ? "primary" : "default"}
              strength={"default"}
            >
              {newApplicants} new applicant{newApplicants !== 1 ? "s" : ""}
            </Badge>
          </div>
        )}
      </Card>
      {/* </Link> */}
    </div>
  );
}
