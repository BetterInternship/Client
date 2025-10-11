"use client";

import EditJobPage from '@/components/features/hire/listings/editJob';
import { JobService } from '@/lib/api/services';
import { Job } from "@/lib/db/db.types";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function EditJobPageRoute() {
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [jobData, setJobData] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    const editJob = async (job: Partial<Job>) => {
        try {
        console.log('Sending job data:', JSON.stringify(job, null, 2));
        if (job.id !== undefined){
            const response = await JobService.updateJob(job.id, job);
            console.log('API response:', response);

            if (!response?.success) {
                console.error('API error details:', response);
                return { success: false, error: response?.message || 'Could not edit job' };
            }
            return response;
            }
        } catch (error: any) {
        console.error('Server action error details:', error);
        return { success: false, error: error.message || 'Failed to edit job' };
        }
    };

    useEffect(() => {
        const fetchJobData = async () => {
            if(!jobId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true)
                if (jobId !== null) {
                    const response = await JobService.getJobById(jobId)
                    if(response?.success && response.job) {
                        setJobData(response.job)
                    } else {
                        console.error('failed to load job data');
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchJobData()
    }, [jobId])

    return <EditJobPage editJob={editJob} currJobData={jobData} />;
}

