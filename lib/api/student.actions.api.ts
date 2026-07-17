/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-09-30 20:27:33
 * @ Modified time: 2026-05-01 23:42:55
 * @ Description:
 *
 * This file should contain all actions on the users side of the platform.
 * Preferable to group these by MAJOR FLOWS.
 * Keep this file clean!!
 */

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ApplicationService, JobService, UserService } from "./services";
import { PublicUser } from "../db/db.types";

/**
 * Provides a cleaner interface to handle interactions with the backend.
 * We're going to make one of these per MAJOR FLOW.
 * So something like the apply flow, search flow, user profile flow, intership requirements flow, etc.
 * NOTE that these hooks are meant to do mutations only, no querying from backend
 *
 * @hook
 */
export const useApplicationActions = () => {
  const queryClient = useQueryClient();
  const actions = {
    create: useMutation({
      mutationFn: (data: {
        job_id: string;
        resume_id: string;
        challenge_submission?: string;
        source?: "mass";
      }) => ApplicationService.createApplication(data),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
    }),
    withdraw: useMutation({
      mutationFn: (id: string) => ApplicationService.withdrawApplication(id),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
    }),
  };

  return actions;
};

/**
 * Actions on jobs, including saving.
 * Not sure what other stuff we might put here, might consider merging with application actions.
 *
 * @hook
 */
export const useJobActions = () => {
  const queryClient = useQueryClient();
  const actions = {
    toggleSave: useMutation({
      mutationFn: (jobId: string) => UserService.saveJob(jobId),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] }),
    }),
  };

  return actions;
};

/**
 * Join/leave a hibernating listing's waitlist ("job alert"). Invalidates the
 * shared my-waitlists query so every surface (hero banner, compact button,
 * applications page) stays in sync. No optimistic update — the banner/button
 * morph once the mutation settles; on-page copy shows no success toast, only
 * a failure one (see callers).
 *
 * @hook
 */
export const useWaitlistActions = () => {
  const queryClient = useQueryClient();
  const actions = {
    join: useMutation({
      mutationFn: (jobId: string) => JobService.joinWaitlist(jobId),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-waitlists"] }),
    }),
    leave: useMutation({
      mutationFn: (jobId: string) => JobService.leaveWaitlist(jobId),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-waitlists"] }),
    }),
  };

  return actions;
};

/**
 * Actions on a user's profile.
 *
 * @hook
 */
export const useProfileActions = () => {
  const queryClient = useQueryClient();
  const actions = {
    update: useMutation({
      mutationFn: (data: Partial<PublicUser>) =>
        UserService.updateMyProfile(data),
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        void queryClient.invalidateQueries({ queryKey: ["my-form-templates"] });
      },
    }),
  };

  return actions;
};
