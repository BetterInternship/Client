"use client";

import { JobDetails } from "@/components/shared/jobs";
import { Card } from "@/components/ui/card";
import { Job } from "@/lib/db/db.types";
import { PageContainer } from "@betterinternship/components";
import { ShareJobButton } from "@/components/features/student/job/share-job-button";
import { formatDateWithoutTime } from "@/lib/utils";
import { CalendarDays, History, Users } from "lucide-react";
import { useEmployerApplications } from "@/hooks/use-employer-api";

interface JobDetailsPageProps {
  job: Job;
}

const JobDetailsPage = ({ job }: JobDetailsPageProps) => {
  const applicationCount =
    useEmployerApplications().employer_applications.filter(
      (application) =>
        application.job_id === job.id && application.visibility !== "deleted",
    ).length;

  return (
    <PageContainer className="py-0">
      <div className="space-y-5">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">
            Listing Metadata
          </h2>
          <Card className="grid gap-4 px-4 py-3 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateWithoutTime(job.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Applications Received</p>
                <p className="text-sm font-medium text-gray-900">
                  {applicationCount}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <History className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateWithoutTime(job.updated_at)}
                </p>
              </div>
            </div>
          </Card>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">
            Listing Preview
          </h2>
          <Card>
            {/* Employers share to candidates too — same dialog, same endpoint,
              still a student-domain link (Docs/plans/JOB_SHORT_LINKS_IMPLEMENTATION_PLAN.md D14). */}
            <JobDetails
              job={job}
              actions={[<ShareJobButton key="share" job={job} />]}
            />
          </Card>
        </section>
      </div>
    </PageContainer>
  );
};

export default JobDetailsPage;
