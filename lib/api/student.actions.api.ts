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
import { ApplicationService, UserService } from "./services";
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
        cover_letter?: string;
        challenge_submission?: string;
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
