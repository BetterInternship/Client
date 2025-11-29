"use client";

import ContentLayout from "@/components/features/hire/content-layout";
import JobTabs from "@/components/features/hire/dashboard/JobTabs";
import { Job } from "@/lib/db/db.types";
import { JobService } from "@/lib/api/services";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ManageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [jobData, setJobData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await JobService.getAnyJobById(jobId);
        console.log(response);
        if (response?.success && response.job) {
          setJobData(response.job);
        } else {
          console.error("failed to load job data");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [jobId]);

  if (!jobData) {
    return;
  }

  return (
    <ContentLayout>
      <div className="w-full h-full">
        <JobTabs selectedJob={jobData} />
      </div>
    </ContentLayout>
  );
}

export default function Manage() {
  return (
    <Suspense>
      <ManageContent />
    </Suspense>
);
}
