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
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const updateJob = async (job_id: string, job: Partial<Job>): Promise<{ success: boolean }> => {
        try {
            setSaving(true);
            console.log('Sending job data:', JSON.stringify(job, null, 2));
            const response = await JobService.updateJob(job_id, job);
            console.log('API response:', response);
        return { 
                success: response?.success || false
            };
        } catch (error: any) {
            console.error('Server action error details:', error);
            return { success: false };
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const fetchJobData = async () => {
            if(!jobId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await JobService.getJobById(jobId);
                if(response?.success && response.job) {
                    setJobData(response.job);
                } else {
                    console.error('failed to load job data');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobData()
    }, [jobId])

    if (!jobData) {
        return;
    }

    return <EditJobPage
            job={jobData}
            is_editing={isEditing}
            set_is_editing={setIsEditing}
            saving={saving}
            update_job={updateJob}
            />;
}

