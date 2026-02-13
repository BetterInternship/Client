"use client";

import ContentLayout from "@/components/features/hire/content-layout";
import JobHeader from "@/components/features/hire/dashboard/JobHeader";
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

  const handleJobUpdate = (updates: Partial<Job>) => {
    setJobData(prev => prev ? { ...prev, ...updates } : null);
  };

  if (loading || !jobData) {
    return (
      <ContentLayout>
        <Loader>Loading listing information...</Loader>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout className="!p-0">
      <div className="w-full h-full">
        <JobHeader
          job={jobData}
          onJobUpdate={handleJobUpdate}
        />
        <div className="flex-1 overflow-auto pt-4 px-2 sm:px-8">
          <JobDetailsPage
            job={jobData}
          />
        </div>
      </div>
    </ContentLayout>
  )
}