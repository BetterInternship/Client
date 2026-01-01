"use client";

import { useProfileData } from "@/lib/api/student.data.api";
import { useRouter } from "next/navigation";
import { FormService } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";
import { useMyForms } from "./myforms.ctx";
import { FormGenerateView } from "../../../components/forms/FormGenerateView";
import { FormHistoryView } from "../../../components/forms/FormHistoryView";
import { useFormsLayout } from "./layout";

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

  // ! refactor into a hook
  const { data: formTemplates, isLoading } = useQuery({
    queryKey: ["my-form-templates"],
    queryFn: () => FormService.getMyFormTemplates(),
    staleTime: 60 * 60 * 1000 * 24,
    gcTime: 60 * 60 * 1000 * 24,
  });

  if (!profile.data?.department && !profile.isPending) router.push("/profile");

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
