import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ApplicationService, UserService } from "./services";

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
      mutationFn: ApplicationService.createApplication,
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
    }),
    withdraw: useMutation({
      mutationFn: ApplicationService.withdrawApplication,
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
      mutationFn: UserService.saveJob,
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] }),
    }),
  };

  return actions;
}

/**
 * Actions on a user's profile.
 * 
 * @hook
 */
export const useProfileActions = () => {
  const queryClient = useQueryClient();
  const actions = {
    update: useMutation({
      mutationFn: UserService.updateMyProfile,
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
    }),
  };

  return actions;
}