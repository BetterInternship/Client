import { useApplications } from "./api/student.api";
import { Job } from "./db/db.types";

/**
 * Applies to a given job.
 * 
 * @param coverLetter 
 * @returns 
 */
export const applyToJob = async (job?: Job | null, coverLetter?: string): Promise<{ success?: true, message?: string }> => {
  const applications = useApplications();
  const text = (coverLetter ?? "").trim();

  if (!job) return { message: 'Job does not exist.' };
  if ((job?.require_cover_letter ?? true) && !text)
    return { message: 'A cover letter is required for this job.'};

  const response = await applications
    .create({
      job_id: job.id ?? "",
      cover_letter: text,
    })

  if (response.message) return { message: response.message }
  if (applications.createError) 
    return { message: applications.createError?.message }
  return { success: true };
};