"use client";

import ContentLayout from "@/components/features/hire/content-layout";
import JobTabs from "@/components/features/hire/dashboard/JobTabs";
import { Job } from "@/lib/db/db.types";
import { JobService } from "@/lib/api/services";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import JobHeader from "@/components/features/hire/dashboard/JobHeader";

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

  const handleJobUpdate = (updates: Partial<Job>) => {
    setJobData(prev => prev ? { ...prev, ...updates } : null);
  };

  if (loading || !jobData) {
    return (
      <ContentLayout>
        <Loader>Loading job...</Loader>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout className="!p-0">
      <div className="w-full h-full flex flex-col">
        <JobHeader
          job={jobData}
          onJobUpdate={handleJobUpdate}
        />
        <div className="flex-1 overflow-auto pt-4 px-2 sm:px-8">
          <JobTabs 
            selectedJob={jobData} 
            onJobUpdate={handleJobUpdate}
          />
        </div>
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
