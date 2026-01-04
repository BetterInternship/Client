"use client";

import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { FormService } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";
import { useMyForms } from "./myforms.ctx";
import { FormGenerateView } from "../../../components/forms/FormGenerateView";
import { FormHistoryView } from "../../../components/forms/FormHistoryView";
import { useFormsLayout } from "./layout";
import {
  FORM_TEMPLATES_STALE_TIME,
  FORM_TEMPLATES_GC_TIME,
} from "@/lib/consts/cache";
import { Card } from "@/components/ui/card";

/**
 * The forms page component - shows either history or generate based on form count
 *
 * @component
 */
export default function FormsPage() {
  const profile = useProfileData();
  const router = useRouter();
  const myForms = useMyForms();
  const { activeView } = useFormsLayout();

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

  if (!profile.data?.department && !profile.isPending) router.push("/profile");

  return (
    <div className="w-full mt-20">
      <Card className="mx-auto max-w-prose">
        <div className="text-4xl font-bold tracking-tight text-gray-700">
          Woah slow down!
        </div>
        <div className="max-w-prose text-lg text-gray-700 mt-4">
          We see you and a few others have stumbled on our form generation page,
          and we're glad you're excited! However, we were just in the midst of
          pushing a few things into production earlier this week. We promise
          this will be out before the week ends, so sit tight!
        </div>
      </Card>
    </div>
  );

  return (
    <>
      {/* Show the active view */}
      {activeView === "history" && myForms?.forms?.length > 0 ? (
        <FormHistoryView forms={myForms.forms} />
      ) : (
        <FormGenerateView formTemplates={formTemplates} isLoading={isLoading} />
      )}
    </>
  );
}
