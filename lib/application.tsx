import { Job } from "./db/db.types";

/**
 * Applies to a given job.
 *
 * @returns
 */
export const applyToJob = async (
  applicationActions: any,
  job?: Job | null,
  payload?: {
    challengeSubmission?: string;
  },
): Promise<{ success?: true; message?: string }> => {
  const challengeSubmission = (payload?.challengeSubmission ?? "").trim();
  const isSuperListing = Boolean(job?.challenge);

  if (!job) return { message: "Job does not exist." };
  if (isSuperListing && !challengeSubmission)
    return { message: "A challenge submission is required for this job." };

  const requestBody: {
    job_id: string;
    challenge_submission?: string;
  } = {
    job_id: job.id ?? "",
  };

  if (isSuperListing) requestBody.challenge_submission = challengeSubmission;

  const response = await applicationActions.create.mutateAsync(requestBody);

  if (response.message) return { message: response.message };
  if (applicationActions.create.error)
    return { message: applicationActions.create?.error.message };
  return { success: true };
};
