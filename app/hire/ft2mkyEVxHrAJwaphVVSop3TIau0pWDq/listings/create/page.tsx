"use client";

import CreateJobPage from "@/components/features/hire/listings/createJob";
import { JobService } from "@/lib/api/services";
import { CreateJobChallengeListingPayload } from "@/lib/db/db.types";

export default function CreateSuperJobPageRoute() {
  const createSuperJob = async (job: CreateJobChallengeListingPayload) => {
    try {
      const response = await JobService.createSuperJob(job);
      if (!response?.success) {
        return {
          success: false,
          error: response?.message || "Could not create super listing",
        };
      }
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to create super listing",
      };
    }
  };

  return (
    <CreateJobPage createSuperJob={createSuperJob} isSuperListing={true} />
  );
}
