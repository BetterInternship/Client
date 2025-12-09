"use client"

import { JobDetails } from "@/components/shared/jobs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/ctx-app";
import { Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface JobDetailsPageProps {
  job: Job;
};

const JobDetailsPage = ({
  job,
}: JobDetailsPageProps) => {
  const router = useRouter();
  const { isMobile } = useAppContext();

  const handleBack = () => {
    router.push(`/dashboard/manage?jobId=${job.id}`)
  };

  return (
    <div className={cn(
      "py-2",
      isMobile ? "px-1" : ""
    )}>
      <button
        onClick={handleBack}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors m-4"
      >
        <ArrowLeft className="s-8" />
      </button>
      <Card>
        <JobDetails
          job={job}
        />
      </Card>
    </div>
  )
}

export default JobDetailsPage;