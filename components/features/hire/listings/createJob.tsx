"use client";

import {
  Button,
  PageContainer,
  PageHeader,
} from "@betterinternship/components";
import { Input } from "@betterinternship/components";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/use-employer-api";
import { CreateJobChallengeListingPayload, Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useFormData } from "@/lib/form-data";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { useModal } from "@/hooks/use-modal";
import { TriangleAlert } from "lucide-react";
import { cn } from "@betterinternship/components";
import { BasicStep } from "./create-job-steps/BasicStep";
import { SetupStep } from "./create-job-steps/SetupStep";
import { DetailsStep } from "./create-job-steps/DetailsStep";

interface CreateJobPageProps {
  createJob?: (job: Partial<Job>) => Promise<any>;
  createSuperJob?: (job: CreateJobChallengeListingPayload) => Promise<any>;
  isSuperListing?: boolean;
}

const CreateJobPage = ({
  createJob,
  createSuperJob,
  isSuperListing = false,
}: CreateJobPageProps) => {
  const [creating, set_creating] = useState(false);
  const [isMissing, setMissing] = useState(false);
  const [step, setStep] = useState(0);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const { formData, setField, fieldSetter } = useFormData<Job>();
  const { job_pay_freq, isNotNull } = useDbRefs();
  const router = useRouter();
  const profile = useProfile();
  const { isMobile } = useMobile();

  const isSalaryFilled = typeof formData.salary === "number" && formData.salary;
  const payFreqMissing = isSalaryFilled && !isNotNull(formData.salary_freq);

  const { job_categories } = useDbRefs();

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

  // create category groups
  const category_items =
    job_categories
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // use order col as sort
      .map((category) => {
        if (
          tempDisable.includes(category.id) ||
          category.parent_id == null || // for the subheaders
          category.name == "Engineering" // ! this is temp bc engineering is a subheader but its placed under others for now
        )
          return null;

        return {
          id: category.id,
          name: category.name,
        };
      })
      .filter(Boolean) ?? [];

  const {
    open: openAlertModal,
    close: closeAlertModal,
    Modal: AlertModal,
  } = useModal("alert-modal", { showCloseButton: false });

  const listingInternshipPreferences = () => ({
    internship_types: formData.internship_preferences?.internship_types,
    job_setup_ids: formData.internship_preferences?.job_setup_ids,
    job_category_ids: formData.internship_preferences?.job_category_ids,
    job_commitment_ids: formData.internship_preferences?.job_commitment_ids,
    expected_start_date: formData.internship_preferences?.expected_start_date,
    require_github: formData.internship_preferences?.require_github,
    require_portfolio: formData.internship_preferences?.require_portfolio,
  });

  const handleSaveEdit = async () => {
    // Validate required fields

    const missingFields = [];

    if (!formData.title?.trim()) {
      missingFields.push("Title");
    }

    if (!formData.location?.trim()) {
      missingFields.push("Location");
    }

    if (!formData.description?.trim()) {
      missingFields.push("Description");
    }

    if (!formData.requirements?.trim()) {
      missingFields.push("Requirements");
    }

    if (formData.internship_preferences?.internship_types === null) {
      missingFields.push("Internship Types");
    }

    if (formData.internship_preferences?.job_setup_ids === null) {
      missingFields.push("Set-up");
    }

    if (formData.internship_preferences?.job_commitment_ids === null) {
      missingFields.push("Commitment");
    }

    if (formData.internship_preferences?.job_category_ids === null) {
      missingFields.push("Category");
    }

    if (
      isSalaryFilled &&
      formData.salary_freq === null &&
      formData.salary_freq === undefined
    ) {
      missingFields.push("Pay Frequency");
    }

    if (isSuperListing && !challengeTitle.trim()) {
      missingFields.push("Challenge Title");
    }

    if (isSuperListing && !challengeDescription.trim()) {
      missingFields.push("Challenge Description");
    }

    if (missingFields.length > 0) {
      alert("Incomplete form");
      return;
    }

    const job: Partial<Job> = {
      title: formData.title,
      description: formData.description ?? "",
      requirements: formData.requirements ?? "",
      location: formData.location ?? profile.data?.location ?? "",
      allowance: formData.allowance,
      salary: formData.allowance === 0 ? formData.salary : undefined,
      salary_freq: formData.allowance === 0 ? formData.salary_freq : undefined,
      is_unlisted: formData.is_unlisted ?? false,
      internship_preferences: listingInternshipPreferences(),
    };

    set_creating(true);
    try {
      if (isSuperListing && !createSuperJob) {
        alert("Super listing creator is not configured.");
        set_creating(false);
        return;
      }

      if (!isSuperListing && !createJob) {
        alert("Listing creator is not configured.");
        set_creating(false);
        return;
      }

      const response = isSuperListing
        ? await createSuperJob?.({
            ...job,
            challenge: {
              title: challengeTitle.trim(),
              description: challengeDescription.trim(),
            },
          })
        : await createJob(job);
      if (!response?.success) {
        alert(response?.error || "Could not create job");
        set_creating(false);
        return;
      }
      set_creating(false);
      router.push("/dashboard"); // Redirect to dashboard
    } catch (error) {
      set_creating(false);
      alert("Error creating job");
    }
  };

  useEffect(() => {
    setField("location", profile.data?.location);
  }, []);

  useEffect(() => {
    const missing = !!(
      !formData.title?.trim() ||
      !formData.location?.trim() ||
      !formData.description?.trim() ||
      !formData.requirements?.trim() ||
      formData.allowance === undefined ||
      !formData.internship_preferences?.internship_types?.length ||
      !formData.internship_preferences?.job_commitment_ids?.length ||
      !formData.internship_preferences?.job_setup_ids?.length ||
      !formData.internship_preferences?.job_category_ids?.length ||
      (isSuperListing && !challengeTitle.trim()) ||
      (isSuperListing && !challengeDescription.trim()) ||
      payFreqMissing
    );

    setMissing(missing);
  }, [
    formData.title,
    formData.location,
    formData.description,
    formData.requirements,
    formData.allowance,
    formData.internship_preferences?.internship_types,
    formData.internship_preferences?.job_commitment_ids,
    formData.internship_preferences?.job_setup_ids,
    formData.internship_preferences?.job_category_ids,
    formData.salary,
    formData.salary_freq,
    challengeTitle,
    challengeDescription,
    isSuperListing,
  ]);

  // step count
  const totalSteps = 3;

  const isBasicValid =
    !!formData.title?.trim() &&
    !!formData.location?.trim() &&
    !!(
      formData.internship_preferences?.job_category_ids &&
      (Array.isArray(formData.internship_preferences?.job_category_ids)
        ? (formData.internship_preferences?.job_category_ids as any).length > 0
        : true)
    );

  const isSetupValid =
    !!formData.internship_preferences?.internship_types?.length &&
    !!formData.internship_preferences?.job_commitment_ids?.length &&
    !!formData.internship_preferences?.job_setup_ids?.length &&
    formData.allowance !== undefined &&
    !payFreqMissing &&
    !(
      formData.internship_preferences?.expected_start_date !== undefined &&
      formData.internship_preferences?.expected_start_date !== null &&
      formData.internship_preferences?.expected_start_date <= 0
    );

  const canGoNext =
    step === 0 ? isBasicValid : step === 1 ? isSetupValid : true;

  const isLastStep = step === totalSteps - 1;

  const handleNext = () => {
    if (step < totalSteps - 1 && canGoNext) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <>
      {/* Header */}
      <div
        className={cn(
          "bg-white border-b fixed top-0 right-0 left-0 z-30",
          isMobile ? "pt-20" : "mt-20",
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <div className="flex gap-4 items-center">
            <PageHeader
              title={`${isSuperListing ? "Create New Super Listing" : "Create new listing"}`}
            />
            <span className="text-sm text-muted-foreground">
              {totalSteps > 1 ? `Step ${step + 1} of ${totalSteps}` : undefined}
            </span>
          </div>

          <div className="flex gap-3 items-center">
            {/* Desktop actions */}
            {!isMobile ? (
              <>
                <Button
                  variant="outline"
                  onClick={openAlertModal}
                  disabled={creating}
                >
                  Cancel
                </Button>
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={creating}
                  >
                    Back
                  </Button>
                )}
                {isLastStep ? (
                  <Button
                    disabled={creating || isMissing}
                    onClick={handleSaveEdit}
                    className="flex items-center"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </>
                    ) : isSuperListing ? (
                      "Publish Super Listing"
                    ) : (
                      "Publish Listing"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={creating || !canGoNext}
                    className="flex items-center"
                  >
                    Next
                  </Button>
                )}
              </>
            ) : null}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 w-full">
          <div
            className="h-0.5 rounded-[0.33em] bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Mobile fixed footer */}
      {isMobile && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 fixed bottom-0 right-0 left-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={openAlertModal}
              disabled={creating}
              className="h-10"
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={creating || step < 1 || step > totalSteps}
                  className="h-10"
                >
                  Back
                </Button>
              )}
              {isLastStep ? (
                <Button
                  disabled={creating || isMissing || step >= totalSteps}
                  onClick={handleSaveEdit}
                  className="flex items-center h-10"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    "Publish"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={creating || !canGoNext}
                  className="flex items-center h-10"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <PageContainer className={cn("mt-20", isMobile ? "pb-20" : "")}>
        {step === 0 && (
          <>
            {isSuperListing && (
              <div
                className={cn(
                  "border border-gray-200 rounded-[0.33em] bg-yellow-50/50 mb-6 p-6 space-y-4",
                  isMobile ? "px-4" : "px-6",
                )}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Challenge Title
                      </span>
                      <span className="text-destructive text-xs">*</span>
                    </div>
                    <Input
                      value={challengeTitle}
                      onChange={(e) => setChallengeTitle(e.target.value)}
                      className="text-base font-medium h-10"
                      placeholder="Enter challenge title..."
                      maxLength={120}
                      required
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {challengeTitle.length}/120 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Challenge Description
                      </span>
                      <span className="text-destructive text-xs">*</span>
                    </div>
                    <Textarea
                      value={challengeDescription}
                      onChange={(e) => setChallengeDescription(e.target.value)}
                      className="text-sm min-h-[120px]"
                      placeholder="Describe the challenge submission expected from applicants..."
                      maxLength={4000}
                      required
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {challengeDescription.length}/4000 characters
                    </p>
                  </div>
                </div>
              </div>
            )}
            <BasicStep
              formData={formData}
              fieldSetter={fieldSetter}
              setField={setField}
              categoryOptions={category_items as any}
              step={1}
              totalSteps={totalSteps}
            />
          </>
        )}

        {step === 1 && (
          <SetupStep
            formData={formData}
            setField={setField}
            fieldSetter={fieldSetter}
            job_pay_freq={job_pay_freq as any}
          />
        )}

        {step === 2 && <DetailsStep formData={formData} setField={setField} />}
      </PageContainer>
      <AlertModal>
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <TriangleAlert className="text-primary h-8 w-8 mb-4" />
            <div className="flex flex-col items-center">
              <h3 className="text-lg">Are you sure you want to cancel?</h3>
              <p className="text-gray-500 text-sm">
                All unsaved changes will be lost.
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-6">
            <Button
              className="bg-white text-primary hover:bg-gray-100 border-solid border-2"
              onClick={() => {
                router.push(`/dashboard`);
              }}
            >
              Discard Listing
            </Button>
            <Button onClick={closeAlertModal}>Continue Editing</Button>
          </div>
        </div>
      </AlertModal>
    </>
  );
};

export default CreateJobPage;
