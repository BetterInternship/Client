"use client";

import ContentLayout from "@/components/features/hire/content-layout";
import JobDetailsPage from "@/components/features/hire/listings/jobDetails";
import { Loader } from "@/components/ui/loader";
import { JobService } from "@/lib/api/services";
import { Job } from "@/lib/db/db.types";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function JobDetailsPageRoute() {
  return (
    <Suspense>
      <JobDetailsPageRouteContent></JobDetailsPageRouteContent>
    </Suspense>
  )
}

function JobDetailsPageRouteContent() {
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

  if (loading || !jobData) {
    return (
      <ContentLayout>
        <Loader>Loading listing information...</Loader>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="w-full h-full">
        <JobDetailsPage
          job={jobData}
        />
      </div>
    </ContentLayout>
  )
}