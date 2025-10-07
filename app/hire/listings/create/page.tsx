// app/hire/listings/create/page.tsx
"use client";

import CreateJobPage from '@/components/features/hire/listings/createJob';
import { JobService } from '@/lib/api/services';
import { Job } from "@/lib/db/db.types";


export default function CreateJobPageRoute() {
  const createJob = async (job: Partial<Job>) => {
    try {
      console.log('Sending job data:', JSON.stringify(job, null, 2));
      const response = await JobService.createJob(job);
      console.log('API response:', response);
      
      if (!response?.success) {
        console.error('API error details:', response);
        return { success: false, error: response?.message || 'Could not create job' };
      }
      return response;
    } catch (error: any) {
      console.error('Server action error details:', error);
      return { success: false, error: error.message || 'Failed to create job' };
    }
  };

  return <CreateJobPage createJob={createJob} />;
}

