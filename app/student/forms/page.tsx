"use client";

import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { FormService } from "@/lib/api/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMyForms } from "./myforms.ctx";
import {
  FORM_TEMPLATES_STALE_TIME,
  FORM_TEMPLATES_GC_TIME,
} from "@/lib/consts/cache";
import { useEffect } from "react";
import { useAuthContext } from "@/lib/ctx-auth";
import FormDashboard from "./components/FormDashboard";
import {
  useFormFilloutProcessHandled,
  useFormFilloutProcessPending,
  useFormFilloutProcessReader,
} from "@/hooks/forms/filloutFormProcess";
import { isProfileVerified } from "@/lib/profile";

/**
 * The forms page component - shows either history or generate based on form count
 *
 * @component
 */
export default function FormsPage() {
  const profile = useProfileData();
  const router = useRouter();
  const myForms = useMyForms();
  const queryClient = useQueryClient();
  const { redirectIfNotLoggedIn, isAuthenticated } = useAuthContext();

  // Auth redirect at body level (runs first)
  redirectIfNotLoggedIn();

  // Profile check only runs if authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      return; // Exit if not authenticated
    }
    if (profile.isPending) {
      return;
    }
    if (!isProfileVerified(profile.data)) {
      router.push("/register/verify");
      return;
    }

    if (!profile.data?.department) router.push("/profile/complete-profile");
  }, [
    isAuthenticated,
    profile.data,
    profile.data?.department,
    profile.isPending,
    router,
  ]);

  // Query 1: Check for updates (cheap query - just a timestamp)
  // TODO: Enable this later for smart cache invalidation
  // const { data: updateInfo } = useQuery({
  //   queryKey: ["form-templates-last-updated"],
  //   queryFn: () => FormService.getFormTemplatesLastUpdated(),
  // });

  // console.log("Form templates last updated info:", updateInfo);

  // Query 2: Fetch full form data only if version changes
  // The queryKey includes the version, so React Query treats it as a new query when version changes
  // When re-enabling the smart update check, add updateInfo?.version back to queryKey
  // and change enabled to: enabled: !!updateInfo
  const { data: formTemplates, isLoading } = useQuery({
    queryKey: ["my-form-templates"],
    queryFn: () => FormService.getMyFormTemplates(),
    staleTime: FORM_TEMPLATES_STALE_TIME,
    gcTime: FORM_TEMPLATES_GC_TIME,
    refetchOnWindowFocus: true, // Refetch when user switches back to tab
    // enabled: !!updateInfo, // Only fetch after we have update info
  });

  // ? I think I can abstract this somehow in the future
  // ? How it works right now:
  // ? The form history renders a combination of the pulled forms (from the db) AND the pending forms (from the client process manager)
  // ? BUT when a pending form turns into a handled form, the pulled forms doesn't update right away
  // ? SO handled forms are also temporarily rendered WHILE they're not part of the pulled forms yet
  // ? All the logic below really does is make sure that once the handled forms are in the pulled forms, they're not rendered anymore
  // ? There has to be a better way to do this repeatably
  const formFilloutProcess = useFormFilloutProcessReader();
  const pendingForms = useFormFilloutProcessPending();
  const handledForms = useFormFilloutProcessHandled();

  // Refetch forms when no more pending left
  // Yeppers kinda janky I know
  useEffect(() => {
    if (!formFilloutProcess.getAllPending().length)
      void queryClient.invalidateQueries({ queryKey: ["my-forms"] });
  }, [formFilloutProcess.getAllPending()]);

  return (
    <FormDashboard
      generatedForms={[...myForms.forms, ...handledForms, ...pendingForms]}
      formTemplates={formTemplates?.filter((ft) => !!ft) ?? []}
      isLoading={isLoading}
    />
  );
}
