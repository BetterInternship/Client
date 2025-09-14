// app/hire/listings/create/page.tsx
"use client";

import CreateJobPage from '@/components/features/hire/listings/createJob'; 
import { Job } from "@/lib/db/db.types";
import { JobService } from '@/lib/api/services'; 


export default function CreateJobPageRoute() {
  const createJob = async (job: Partial<Job>) => {
    
    try {
      const response = await JobService.create_job(job);
      return response;
    } catch (error: any) {
      console.error('Server action error:', error);
      return { success: false, error: error.message || 'Failed to create job' };
    }
  };

  return <CreateJobPage createJob={createJob} />;
}

