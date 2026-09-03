"use client";

import {
  Button,
  PageContainer,
  PageHeader,
} from "@betterinternship/components";
import { TriangleAlert } from "lucide-react";
import { cn } from "@betterinternship/components";
import { BasicStep } from "./create-job-steps/BasicStep";
import { SetupStep } from "./create-job-steps/SetupStep";
import { DetailsStep } from "./create-job-steps/DetailsStep";
import { useModalRegistry } from "@/components/modals/modal-registry";
import { useProfile } from "@/hooks/use-employer-api";
import { Job, UpdateJobChallengeListingPayload } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useFormData } from "@/lib/form-data";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMobile } from "@/hooks/use-mobile";

interface EditJobPageProps {
  job: Job;
  is_editing: boolean;
  set_is_editing: (is_editing: boolean) => void;
  saving?: boolean;
  update_job: (
    job_id: string,
    job: UpdateJobChallengeListingPayload,
  ) => Promise<{ success: boolean }>;
  actions?: React.ReactNode[];
}

const EditJobPage = ({
  job,
  is_editing = false,
  set_is_editing = () => {},
  saving = false,
  update_job,
  actions = [],
}: EditJobPageProps) => {
  const { job_pay_freq, isNotNull } = useDbRefs();
  const { isMobile } = useMobile();
  const [isMissing, setMissing] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const { formData, setField, setFields, fieldSetter } = useFormData<Job>(job);
  const router = useRouter();
  const profile = useProfile();
  const searchParams = useSearchParams();
  const isSuperListing = Boolean(job.challenge);

  const refreshFlag = searchParams.get("refresh");

  const { job_categories } = useDbRefs();

  // keep duplicate tempDisable per instruction
  const tempDisable = [
    "f5bd5b55-14e3-44c7-be02-477e3ae446d2",
    "381239bf-7c82-4f87-a1b8-39d952f8876b",
    "8b323584-9340-41e8-928e-f9345f1ad59e",
    "e5a73819-ee90-43fb-b71b-7ba12f0a4dbf",
    "642e5b8e-41ac-478f-bc28-ed03ef653c78",
    "91b180be-3d23-4f0a-bd64-c82cef9d3ae5",
    "0a28afa9-f9aa-4782-b29a-adaf18e1f388",
    "63624cde-383a-406e-af54-c58bd2af425f",
    "94a29ca7-a014-474f-8958-68fc5c10e734",
    "06a890ac-5f7f-4763-b733-9e45cb03defd",
    "657da8d0-69a7-4312-8da1-7bd97145310b",
  ];

  // create category groups - copied from createJob
  const category_items =
    job_categories
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((category) => {
        if (
          tempDisable.includes(category.id) ||
          category.parent_id == null ||
          category.name == "Engineering"
        )
          return null;

        return {
          id: category.id,
          name: category.name,
        };
      })
      .filter(Boolean) ?? [];

  const registry = useModalRegistry();

  const isSalaryFilled = typeof formData.salary === "number" && formData.salary;
  const payFreqMissing = isSalaryFilled && !isNotNull(formData.salary_freq);

  const listingInternshipPreferences = () => ({
    internship_types: formData.internship_preferences?.internship_types,
    job_setup_ids: formData.internship_preferences?.job_setup_ids,
    job_category_ids: formData.internship_preferences?.job_category_ids,
    job_commitment_ids: formData.internship_preferences?.job_commitment_ids,
    expected_start_date: formData.internship_preferences?.expected_start_date,
    require_github: formData.internship_preferences?.require_github,
    require_portfolio: formData.internship_preferences?.require_portfolio,
  });

  useEffect(() => {
    if (refreshFlag === "true") {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("refresh");
      window.history.replaceState({}, "", newUrl.toString());
      window.location.reload();
    }
  }, [refreshFlag]);

  const handleSaveEdit = async () => {
    if (!formData.title?.trim()) {
      alert("Job title is required");
      return;
    }

    if (!formData.location?.trim()) {
      alert("Job location is required");
      return;
    }

    if (!formData.description?.trim()) {
      alert("Job description is required");
      return;
    }

    if (isSuperListing && !challengeTitle.trim()) {
      alert("Challenge title is required");
      return;
    }

    const edited_job: UpdateJobChallengeListingPayload = {
      title: formData.title,
      description: formData.description ?? "",
      requirements: null,
      location: formData.location ?? profile.data?.location ?? "",
      allowance: formData.allowance,
      salary: formData.allowance === 0 ? formData.salary : undefined,
      salary_freq: formData.allowance === 0 ? formData.salary_freq : undefined,
      is_unlisted: formData.is_unlisted ?? false,
      internship_preferences: listingInternshipPreferences(),
      ...(isSuperListing
        ? {
            challenge: {
              title: challengeTitle.trim(),
              description: challengeDescription.trim() || null,
            },
          }
        : {}),
    };

    if (job.id) {
      const result = await update_job(job.id, edited_job);
      if (result.success) {
        router.push(`/dashboard/manage?jobId=${job.id}`);
      }
    }
  };

  useEffect(() => {
    if (job) {
      const merged = job.requirements?.trim()
        ? `${job.description ?? ""}\n\n### Requirements\n${job.requirements}`.trim()
        : (job.description ?? "");
      setFields({ ...job, description: merged, requirements: null } as Job);
      setChallengeTitle(job.challenge?.title ?? "");
      setChallengeDescription(job.challenge?.description ?? "");
    }
  }, [job]);

  useEffect(() => {
    if (job && saving) {
      const edited_job: UpdateJobChallengeListingPayload = {
        id: formData.id,
        title: formData.title ?? "",
        description: formData.description ?? "",
        requirements: null,
        location: formData.location ?? "",
        allowance: formData.allowance ?? undefined,
        salary: formData.salary ?? null,
        salary_freq: formData.salary_freq ?? undefined,
        is_unlisted: formData.is_unlisted,
        internship_preferences: listingInternshipPreferences(),
        ...(isSuperListing
          ? {
              challenge: {
                title: challengeTitle.trim(),
                description: challengeDescription.trim() || null,
              },
            }
          : {}),
      };

      update_job(edited_job.id ?? "", edited_job).then(
        // @ts-ignore
        ({ job: updated_job }) => {
          set_is_editing(false);
        },
      );
    }
  }, [saving]);

  useEffect(() => {
    const missing =
      !formData.title?.trim() ||
      !formData.location?.trim() ||
      !formData.description?.trim() ||
      formData.allowance === undefined ||
      !formData.internship_preferences?.internship_types?.length ||
      !formData.internship_preferences?.job_commitment_ids?.length ||
      !formData.internship_preferences?.job_setup_ids?.length ||
      !formData.internship_preferences?.job_category_ids?.length ||
      (isSuperListing && !challengeTitle.trim()) ||
      payFreqMissing;

    setMissing(missing);
  }, [
    formData.title,
    formData.location,
    formData.description,
    formData.allowance,
    formData.internship_preferences?.internship_types,
    formData.internship_preferences?.job_commitment_ids,
    formData.internship_preferences?.job_setup_ids,
    formData.internship_preferences?.job_category_ids,
    formData.salary,
    formData.salary_freq,
    challengeTitle,
    isSuperListing,
  ]);

  const openDiscardModal = () =>
    registry.warning.open({
      icon: TriangleAlert,
      iconColor: "text-primary",
      title: "Are you sure you want to cancel?",
      message: "All unsaved changes will be lost.",
      primaryAction: { label: "Continue Editing", onClick: () => {} },
      secondaryAction: {
        label: "Discard Edits",
        onClick: () => router.push(`/dashboard/manage?jobId=${job.id}`),
      },
      panelClassName: "sm:max-w-md",
    });

  return (
    <>
      {!isMobile && (
        <div className="sticky top-[56px] z-20 border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-4">
            <PageHeader title="Edit listing" />
            <div className="flex gap-3 items-center">
              <Button
                variant="outline"
                onClick={openDiscardModal}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                disabled={saving || isMissing}
                onClick={handleSaveEdit}
                className="flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Editing...
                  </>
                ) : (
                  "Save Edits"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      <PageContainer
        className={cn(
          "pb-24 sm:pb-8 flex flex-col gap-8",
          isMobile ? "pb-20" : "",
        )}
      >
        <div className="space-y-24">
          <BasicStep
            formData={formData}
            fieldSetter={fieldSetter}
            setField={setField}
            categoryOptions={category_items as any}
            isSuperListing={isSuperListing}
            challengeTitle={challengeTitle}
            challengeDescription={challengeDescription}
            setChallengeTitle={setChallengeTitle}
            setChallengeDescription={setChallengeDescription}
          />
          <SetupStep
            formData={formData}
            setField={setField}
            fieldSetter={fieldSetter}
            job_pay_freq={job_pay_freq as any}
          />
          <DetailsStep formData={formData} setField={setField} />
        </div>
      </PageContainer>
      {isMobile && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 fixed bottom-0 right-0 left-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={openDiscardModal}
              disabled={saving}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              disabled={saving || isMissing}
              onClick={handleSaveEdit}
              className="flex items-center h-10"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Editing...
                </>
              ) : (
                "Save Edits"
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default EditJobPage;
