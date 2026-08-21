"use client";

import { PageContainer } from "@betterinternship/components/page-header";
import JobTabs from "@/components/features/hire/dashboard/JobTabs";
import { Job } from "@/lib/db/db.types";
import { JobService } from "@/lib/api/services";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import JobHeader from "@/components/features/hire/dashboard/JobHeader";
import { useProfile } from "@/hooks/use-employer-api";
import { Clock } from "lucide-react";

function ManageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [jobData, setJobData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const profile = useProfile();

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
    setJobData((prev) => (prev ? { ...prev, ...updates } : null));
  };

  if (loading || !jobData) {
    return (
      <PageContainer>
        <Loader>Loading job...</Loader>
      </PageContainer>
    );
  }

  return (
    <>
      <JobHeader
        job={jobData}
        onJobUpdate={handleJobUpdate}
        backHref="/dashboard"
      />
      <PageContainer>
        {profile.data?.is_verified === false ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 py-24 text-gray-500">
            <Clock className="w-8 h-8 mb-2" />
            <p className="font-medium text-gray-700">
              Applications will appear here once we verify your account.
            </p>
            <p className="text-sm">
              Your listings aren't visible to students yet.
            </p>
          </div>
        ) : (
          <JobTabs selectedJob={jobData} onJobUpdate={handleJobUpdate} />
        )}
      </PageContainer>
    </>
  );
}

export default function Manage() {
  return (
    <Suspense>
      <ManageContent />
    </Suspense>
  );
}
