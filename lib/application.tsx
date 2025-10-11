import { useApplicationActions } from "./api/student.actions.api";
import { Job } from "./db/db.types";

/**
 * Applies to a given job.
 *
 * @param coverLetter
 * @returns
 */
export const applyToJob = async (
  applicationActions: any,
  job?: Job | null,
  coverLetter?: string
): Promise<{ success?: true; message?: string }> => {
  const text = (coverLetter ?? "").trim();

  if (!job) return { message: "Job does not exist." };
  if ((job?.internship_preferences?.require_cover_letter ?? true) && !text)
    return { message: "A cover letter is required for this job." };

  const response = await applicationActions.create.mutateAsync({
    job_id: job.id ?? "",
    cover_letter: text,
  });

  if (response.message) return { message: response.message };
  if (applicationActions.create.error)
    return { message: applicationActions.create?.error.message };
  return { success: true };
};
