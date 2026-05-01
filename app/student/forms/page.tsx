"use client";

import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { FormService, UserService } from "@/lib/api/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMyForms } from "./myforms.ctx";
import {
  FORM_TEMPLATES_STALE_TIME,
  FORM_TEMPLATES_GC_TIME,
} from "@/lib/consts/cache";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/lib/ctx-auth";
import FormDashboard from "./components/FormDashboard";
import { FormsAccessGate } from "./components/FormsAccessGate";
import {
  useFormFilloutProcessHandled,
  useFormFilloutProcessPending,
  useFormFilloutProcessReader,
} from "@/hooks/forms/filloutFormProcess";
import { isProfileVerified } from "@/lib/profile";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";

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
  const isStudentAuthenticated = isAuthenticated();
  const [hasFormsAccess, setHasFormsAccess] = useState<boolean | null>(() =>
    profile.isPending ? null : !!profile.data?.form_group_id,
  );

  useEffect(() => {
    if (profile.isPending) return;

    setHasFormsAccess((currentAccess) => {
      if (currentAccess === true) return true;
      return !!profile.data?.form_group_id;
    });
  }, [profile.data?.form_group_id, profile.isPending]);

  // Auth redirect at body level (runs first)
  redirectIfNotLoggedIn();

  // Profile check only runs if authenticated
  useEffect(() => {
    if (!isStudentAuthenticated) {
      return; // Exit if not authenticated
    }
    if (profile.isPending) {
      return;
    }
    if (!isProfileVerified(profile.data)) {
      router.push("/register/verify");
      return;
    }
  }, [
    isStudentAuthenticated,
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
  const { data: { formTemplates, formGroupDescription } = {}, isLoading } =
    useQuery({
      queryKey: ["my-form-templates"],
      queryFn: () => FormService.getMyFormTemplates(),
      enabled: hasFormsAccess === true,
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

  const handleFormsAccessGranted = async (accessCode: string) => {
    const response = await UserService.joinFormGroup(accessCode);

    if (!response?.success) {
      alert("Could not access forms. Please check your code and try again.");
      console.error("Error: ", response.message);
      setHasFormsAccess(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    await queryClient.invalidateQueries({ queryKey: ["my-form-templates"] });
    await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
    setHasFormsAccess(true);
  };

  const isResolvingDestination =
    !isStudentAuthenticated ||
    profile.isPending ||
    !profile.data ||
    !isProfileVerified(profile.data) ||
    !profile.data.department;

  if (isResolvingDestination || hasFormsAccess === null) {
    return <Loader>Loading forms...</Loader>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!hasFormsAccess ? (
        <FormsAccessGate
          key="forms-access-card"
          onAccessGranted={handleFormsAccessGranted}
        />
      ) : (
        <motion.div
          key="forms-dashboard"
          className="h-full min-h-0 w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <FormDashboard
            generatedForms={[
              ...myForms.forms,
              ...handledForms,
              ...pendingForms,
            ]}
            formTemplates={formTemplates?.filter((ft) => !!ft) ?? []}
            formGroupDescription={formGroupDescription || ""}
            isLoading={isLoading || profile.isPending}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
