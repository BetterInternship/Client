"use client";

import { ArrowLeft, LucideClipboardCheck, MailWarningIcon } from "lucide-react";
import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { FormFillerRenderer } from "@/components/features/student/forms/FormFillerRenderer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { useFormFiller } from "@/components/features/student/forms/form-filler.ctx";
import { useMyAutofill, useMyAutofillUpdate } from "@/hooks/use-my-autofill";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { FormValues, IFormSigningParty } from "@betterinternship/core/forms";
import { TextLoader } from "@/components/ui/loader";
import { FormService } from "@/lib/api/services";
import useModalRegistry from "@/components/modals/modal-registry";
import { getClientAudit } from "@/lib/audit";
import { useQueryClient } from "@tanstack/react-query";
import { useStateRecord } from "@/hooks/base/useStateRecord";
import { useFormFilloutProcessRunner } from "@/hooks/forms/filloutFormProcess";
import { useAppContext } from "@/lib/ctx-app";
import { FormSigningPartyTimeline } from "./FormSigningPartyTimeline";
import { getFreshHistoryCutoffMsFromStorage } from "../fresh-history";
import { getRecipientEmailErrors } from "./recipient-email-validation";
import { useSignContext } from "@/components/providers/sign.ctx";

interface FlowTestSigningLayoutProps {
  formLabel?: string;
  documentUrl?: string;
  recipients: IFormSigningParty[];
  noEsign?: boolean;
  onBack: () => void;
}

const getFieldValue = (values: Record<string, string>, fieldKey: string) => {
  if (Object.prototype.hasOwnProperty.call(values, fieldKey)) {
    return values[fieldKey];
  }

  const defaultKey = `${fieldKey}:default`;
  if (Object.prototype.hasOwnProperty.call(values, defaultKey)) {
    return values[defaultKey];
  }

  if (fieldKey.endsWith(":default")) {
    const baseKey = fieldKey.slice(0, -8);
    if (Object.prototype.hasOwnProperty.call(values, baseKey)) {
      return values[baseKey];
    }
  }

  return undefined;
};

const areFormValuesEqual = (
  left: Record<string, string>,
  right: Record<string, string>,
) => {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);

  if (leftEntries.length !== rightEntries.length) return false;

  return leftEntries.every(([key, value]) => right[key] === value);
};

type SigningStep = "timeline" | "fields" | "preview-review" | "confirm";

const DESKTOP_BACK_STEP_RESET_DELAY_MS = 320;
const COMPACT_SIGNING_LAYOUT_BREAKPOINT_PX = 1150;

export function FormSigningLayout({
  formLabel,
  documentUrl,
  recipients,
  noEsign,
  onBack,
}: FlowTestSigningLayoutProps) {
  const form = useFormRendererContext();
  const modalRegistry = useModalRegistry();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const updateAutofill = useMyAutofillUpdate();
  const queryClient = useQueryClient();
  const signContext = useSignContext();
  const { isMobile } = useAppContext();
  const [isCompactSigningLayout, setIsCompactSigningLayout] = useState(false);
  const isMobileLayout = isMobile || isCompactSigningLayout;
  const isFreshFormsModeEnabled = getFreshHistoryCutoffMsFromStorage() !== null;
  const hasInitiatorRecipient = recipients.some(
    (recipient) => recipient.signatory_source?._id === "initiator",
  );
  const initialNoRecipientStep = !hasInitiatorRecipient || !!noEsign;
  const initialStep: SigningStep = isMobileLayout
    ? initialNoRecipientStep
      ? "fields"
      : "timeline"
    : initialNoRecipientStep
      ? "fields"
      : "timeline";
  const hasInitializedFieldValuesRef = useRef(false);
  const latestValuesRef = useRef<FormValues>({});
  const [previewValues, setPreviewValues] = useState<FormValues>({});
  const [nextLoading, setNextLoading] = useState(false);
  const [recipientEmails, recipientEmailActions] = useStateRecord({});
  const [recipientErrors, recipientErrorActions] = useStateRecord({});
  const [hasConfirmedDetails, setHasConfirmedDetails] = useState(false);
  const [areRequiredFieldsComplete, setAreRequiredFieldsComplete] =
    useState(false);
  const [currentStep, setCurrentStep] = useState<SigningStep>(initialStep);
  const [mobileFieldsTab, setMobileFieldsTab] = useState<"form" | "preview">(
    "form",
  );
  const [mobilePreviewNeedsAttention, setMobilePreviewNeedsAttention] =
    useState(false);
  const [selectedFieldSource, setSelectedFieldSource] = useState<
    "form" | "pdf" | null
  >(null);
  const [selectionTick, setSelectionTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateCompactSigningLayout = () => {
      setIsCompactSigningLayout(
        window.innerWidth < COMPACT_SIGNING_LAYOUT_BREAKPOINT_PX,
      );
    };

    updateCompactSigningLayout();
    window.addEventListener("resize", updateCompactSigningLayout);
    return () =>
      window.removeEventListener("resize", updateCompactSigningLayout);
  }, []);

  const fieldOwnerByName = useMemo(() => {
    const ownerMap = new Map<string, string>();
    const allBlocks = form.formMetadata.getBlocksForEditorService();
    allBlocks.forEach((block) => {
      const fieldName =
        block.field_schema?.field ?? block.phantom_field_schema?.field;
      if (!fieldName || ownerMap.has(fieldName)) return;
      ownerMap.set(fieldName, block.signing_party_id);
    });
    return ownerMap;
  }, [form.formMetadata, form.formName]);
  const formFilloutProcess = useFormFilloutProcessRunner();
  const fromMe = useMemo(
    () =>
      recipients.some(
        (recipient) => recipient.signatory_source?._id === "initiator",
      ),
    [recipients],
  );
  const noRecipientStep = useMemo(() => !fromMe || noEsign, [fromMe, noEsign]);
  const generateWithNoSignature = useMemo(
    () => !recipients.length || noEsign,
    [recipients, noEsign],
  );
  const desktopSteps: SigningStep[] = noRecipientStep
    ? ["fields", "confirm"]
    : ["timeline", "fields", "confirm"];
  const mobileSteps: SigningStep[] = noRecipientStep
    ? ["fields", "preview-review", "confirm"]
    : ["timeline", "fields", "preview-review", "confirm"];
  const steps = isMobileLayout ? mobileSteps : desktopSteps;
  const isMobilePreviewTabActive =
    isMobileLayout && currentStep === "fields" && mobileFieldsTab === "preview";
  const isMobilePreviewReviewStep =
    isMobileLayout && currentStep === "preview-review";
  const isMobilePreviewPaneActive =
    isMobileLayout && (isMobilePreviewTabActive || isMobilePreviewReviewStep);
  const stepNumber = Math.max(steps.indexOf(currentStep) + 1, 1);
  const desktopStepNumber = Math.max(desktopSteps.indexOf(currentStep) + 1, 1);
  const desktopTotalSteps = desktopSteps.length;
  const desktopCurrentTaskTitle =
    currentStep === "timeline"
      ? "Recipients"
      : currentStep === "confirm"
        ? "Review"
        : "Fill Details";
  const desktopProgressPercent =
    desktopTotalSteps <= 1
      ? 100
      : (desktopStepNumber / desktopTotalSteps) * 100;
  const mobileStepIndexByStep = useMemo(
    () => new Map(mobileSteps.map((step, index) => [step, index])),
    [mobileSteps],
  );
  const mobileStepPaneHiddenClass = "opacity-0 pointer-events-none invisible";

  const getMobileStepHiddenClass = useCallback(
    (step: SigningStep) => {
      const currentIndex = mobileStepIndexByStep.get(currentStep) ?? 0;
      const stepIndex = mobileStepIndexByStep.get(step) ?? 0;

      return stepIndex < currentIndex
        ? "-translate-x-6 opacity-0 pointer-events-none invisible"
        : "translate-x-6 opacity-0 pointer-events-none invisible";
    },
    [currentStep, mobileStepIndexByStep],
  );

  const blurActiveFormControl = useCallback(() => {
    if (typeof document === "undefined") return;
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) return;

    const tagName = activeElement.tagName;
    const isFormControl =
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT" ||
      activeElement.isContentEditable;

    if (isFormControl) activeElement.blur();
  }, []);

  const goToStep = useCallback((nextStep: SigningStep) => {
    setCurrentStep(nextStep);
  }, []);

  const handleMobileFieldsTabChange = useCallback(
    (nextTab: "form" | "preview") => {
      setMobileFieldsTab(nextTab);

      if (nextTab === "preview") {
        setPreviewValues((prev) =>
          areFormValuesEqual(prev, latestValuesRef.current)
            ? prev
            : latestValuesRef.current,
        );
        setMobilePreviewNeedsAttention(false);
      }
    },
    [],
  );

  const previewKeyedFields = useMemo(
    () =>
      (form.keyedFields ?? []).map((field) => ({
        ...field,
        signing_party_id: fieldOwnerByName.get(field.field),
      })),
    [form.keyedFields, fieldOwnerByName],
  );
  const initiatorManualFieldKeys = useMemo(
    () =>
      form.fields
        .filter(
          (field) =>
            field.signing_party_id === "initiator" && field.source === "manual",
        )
        .map((field) => field.field),
    [form.fields],
  );

  const computeRequiredFieldsComplete = useCallback(
    (nextValues: FormValues) =>
      initiatorManualFieldKeys.every(
        (fieldKey) => !!getFieldValue(nextValues, fieldKey),
      ),
    [initiatorManualFieldKeys],
  );

  const handleValuesChange = useCallback(
    (nextValues: FormValues) => {
      const didValuesChange = !areFormValuesEqual(
        latestValuesRef.current,
        nextValues,
      );
      const hasInitializedFieldValues = hasInitializedFieldValuesRef.current;
      latestValuesRef.current = nextValues;
      hasInitializedFieldValuesRef.current = true;
      const nextRequiredFieldsComplete =
        computeRequiredFieldsComplete(nextValues);

      setAreRequiredFieldsComplete((prev) =>
        prev === nextRequiredFieldsComplete ? prev : nextRequiredFieldsComplete,
      );

      setPreviewValues((prev) =>
        areFormValuesEqual(prev, nextValues) ? prev : nextValues,
      );

      if (
        hasInitializedFieldValues &&
        didValuesChange &&
        isMobileLayout &&
        currentStep === "fields" &&
        mobileFieldsTab !== "preview"
      ) {
        setMobilePreviewNeedsAttention(true);
      }
    },
    [
      computeRequiredFieldsComplete,
      currentStep,
      isMobileLayout,
      mobileFieldsTab,
    ],
  );

  useEffect(() => {
    if (!isMobileLayout || currentStep === "fields") return;

    setPreviewValues((prev) =>
      areFormValuesEqual(prev, latestValuesRef.current)
        ? prev
        : latestValuesRef.current,
    );
  }, [currentStep, isMobileLayout]);

  useEffect(() => {
    if (isMobileLayout) return;
    if (currentStep !== "preview-review") return;
    setCurrentStep("confirm");
  }, [currentStep, isMobileLayout]);

  useEffect(() => {
    if (!isMobileLayout) return;
    const shouldBlur =
      currentStep !== "fields" ||
      mobileFieldsTab === "preview" ||
      isMobilePreviewReviewStep;
    if (shouldBlur) blurActiveFormControl();
  }, [
    blurActiveFormControl,
    currentStep,
    isMobileLayout,
    isMobilePreviewReviewStep,
    mobileFieldsTab,
  ]);

  const handlePdfFieldSelect = (fieldName: string) => {
    setSelectedFieldSource("pdf");
    setSelectionTick((prev) => prev + 1);
    form.setSelectedPreviewId(fieldName);
    if (isMobileLayout && currentStep === "fields") {
      handleMobileFieldsTabChange("form");
    } else if (currentStep !== "fields") {
      goToStep("fields");
    }
  };

  const handleFormFieldSelect = (fieldName: string) => {
    setSelectedFieldSource("form");
    setSelectionTick((prev) => prev + 1);
    form.setSelectedPreviewId(fieldName);
  };

  const recipientEmailErrors = useMemo(
    () => getRecipientEmailErrors(recipientEmails),
    [recipientEmails],
  );

  const nextEnabled = useMemo(() => {
    switch (currentStep) {
      case "timeline":
        return (
          recipients.every((recipient) => {
            if (recipient.signatory_source?._id !== "initiator") return true;

            const recipientEmail =
              recipientEmails[
                form.formMetadata.getSigningPartyFieldName(recipient._id)
              ];

            return !!recipientEmail?.trim();
          }) && Object.keys(recipientEmailErrors).length === 0
        );
      case "fields":
        return areRequiredFieldsComplete && signContext.hasAgreed;
      case "preview-review":
        return true;
      case "confirm":
        return true;
    }
  }, [
    areRequiredFieldsComplete,
    currentStep,
    recipients,
    recipientEmailErrors,
    recipientEmails,
    signContext,
    form,
  ]);

  const handleNext = useCallback(async () => {
    const additionalValues = { ...autofillValues, ...recipientEmails };
    const finalValues = formFiller.getFinalValues(additionalValues);
    const errors = formFiller.validate(form.fields, additionalValues);
    const emailErrors = recipientEmailErrors;

    // So it doesn't look like it's hanging
    setNextLoading(true);

    switch (currentStep) {
      case "timeline":
        if (Object.keys(emailErrors).length) {
          recipientErrorActions.overwrite(emailErrors);
          toast.error(
            "Some information is missing or incorrect",
            toastPresets.destructive,
          );
        } else {
          recipientErrorActions.clearAll();
          handleMobileFieldsTabChange("form");
          goToStep("fields");
        }

        setNextLoading(false);
        break;
      case "fields":
        if (Object.keys(errors).length) {
          toast.error(
            "Some information is missing or incorrect",
            toastPresets.destructive,
          );
        } else {
          if (!isFreshFormsModeEnabled)
            await updateAutofill(form.formName, form.fields, finalValues);
          if (isMobileLayout) {
            setMobilePreviewNeedsAttention(false);
            goToStep("preview-review");
          } else {
            goToStep("confirm");
          }
        }

        setNextLoading(false);
        break;
      case "preview-review":
        goToStep("confirm");
        setNextLoading(false);
        break;
      case "confirm":
        setNextLoading(false);
        break;
    }
  }, [
    autofillValues,
    currentStep,
    form,
    formFiller,
    isFreshFormsModeEnabled,
    handleMobileFieldsTabChange,
    isMobileLayout,
    recipientEmailErrors,
    recipientEmails,
    recipientErrorActions,
    updateAutofill,
  ]);

  const getFirstRecipient = useCallback((): IFormSigningParty | undefined => {
    const firstRecipient = recipients.find(
      (recipient) =>
        recipient.signatory_source?._id === "initiator" ||
        !!recipient.signatory_account?.email,
    );
    if (!firstRecipient) return;
    const fieldName = form.formMetadata.getSigningPartyFieldName(
      firstRecipient._id,
    );

    return {
      ...firstRecipient,
      signatory_account: {
        email:
          (recipientEmails[fieldName] ||
            firstRecipient.signatory_account?.email) ??
          "",
      },
    };
  }, [form, recipients, recipientEmails]);

  const handleSubmit = useCallback(async () => {
    setNextLoading(true);
    const finalValues = formFiller.getFinalValues({
      ...autofillValues,
      ...recipientEmails,
    });

    if (generateWithNoSignature) {
      const response = await formFilloutProcess.run(
        {
          formName: form.formName,
          formVersion: form.formVersion,
          values: finalValues,
        },
        {
          label: form.formLabel,
          timestamp: new Date().toISOString(),
        },
      );

      if (!response.success) {
        setNextLoading(false);
        alert("Something went wrong, please try again.");
        console.error(response.message);
        return;
      }

      modalRegistry.formSubmissionSuccess.open("manual", () => {
        setCurrentStep(initialStep);
        onBack();
      });
    } else {
      const response = await FormService.initiateForm({
        formName: form.formName,
        formVersion: form.formVersion,
        values: finalValues,
        audit: getClientAudit(),
      });

      if (!response.success) {
        setNextLoading(false);
        alert("Something went wrong, please try again.");
        console.error(response.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["my-forms"] });
      modalRegistry.formSubmissionSuccess.open(
        "esign",
        () => {
          setCurrentStep(initialStep);
          onBack();
        },
        getFirstRecipient(),
      );
    }
    setNextLoading(false);
  }, [
    autofillValues,
    form,
    formFilloutProcess,
    generateWithNoSignature,
    getFirstRecipient,
    initialStep,
    modalRegistry.formSubmissionSuccess,
    onBack,
    queryClient,
    recipientEmails,
  ]);

  // Clean up when switching form
  useEffect(() => {
    recipientEmailActions.clearAll();
    hasInitializedFieldValuesRef.current = false;
    latestValuesRef.current = {};
    setPreviewValues({});
    setMobileFieldsTab("form");
    setMobilePreviewNeedsAttention(false);
    setHasConfirmedDetails(false);
    setAreRequiredFieldsComplete(initiatorManualFieldKeys.length === 0);
    setCurrentStep(initialStep);
  }, [formLabel, initialStep, initiatorManualFieldKeys.length, noEsign]);

  useEffect(() => {
    if (currentStep === "confirm") {
      setHasConfirmedDetails(false);
    }
  }, [currentStep]);

  const renderMobileFieldsTabs = () =>
    isMobileLayout && currentStep === "fields" ? (
      <div className="border-b border-gray-200 bg-white">
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-100">
          <button
            type="button"
            className={cn(
              "flex items-center justify-center border-r border-gray-200 px-3 py-2 text-sm font-medium transition-colors",
              mobileFieldsTab === "form"
                ? "bg-slate-50 text-primary"
                : "text-gray-600",
            )}
            onClick={() => handleMobileFieldsTabChange("form")}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-4 py-1.5 transition-colors",
                mobileFieldsTab === "form" ? "bg-primary/10" : "bg-transparent",
              )}
            >
              Fill Details
            </span>
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors",
              mobileFieldsTab === "preview" ? "text-primary" : "text-gray-600",
              mobileFieldsTab === "preview"
                ? "bg-slate-50"
                : mobilePreviewNeedsAttention
                  ? "bg-blue-100"
                  : "bg-transparent",
            )}
            onClick={() => handleMobileFieldsTabChange("preview")}
          >
            <span
              className={cn(
                "relative inline-flex items-center justify-center rounded-full px-4 py-1.5 transition-[transform,background-color] duration-200",
                mobileFieldsTab === "preview"
                  ? "bg-primary/10"
                  : "bg-transparent",
                mobilePreviewNeedsAttention
                  ? "translate-x-1.5"
                  : "translate-x-0",
              )}
            >
              <span
                className="absolute -left-4 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "block h-2.5 w-2.5 rounded-full bg-primary transition-all duration-200",
                    mobilePreviewNeedsAttention
                      ? "tab-attention-dot-jitter scale-100 opacity-100"
                      : "scale-75 opacity-0",
                  )}
                />
              </span>
              <span
                className={cn(
                  mobilePreviewNeedsAttention && "tab-attention-jitter",
                )}
              >
                PDF Preview
              </span>
            </span>
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div
        className={cn(
          "min-h-0 flex-1 px-0 py-0 mx-auto w-full transition-[max-width] duration-500 ease-in-out sm:px-6 sm:py-4",
          "max-w-7xl",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[0.33em] border border-gray-300 ">
          {!isMobileLayout && (
            <div className="animate-fade-in border-b border-gray-300 bg-white">
              <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onBack();
                    setTimeout(
                      () => setCurrentStep(initialStep),
                      DESKTOP_BACK_STEP_RESET_DELAY_MS,
                    );
                  }}
                  className="h-7 w-7 shrink-0 p-0 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Back to templates"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold tracking-tight text-primary">
                    {formLabel}
                  </span>
                </div>
                <div className="hidden md:flex min-w-[210px] flex-col items-end gap-1">
                  <span className="text-[11px] font-medium text-gray-500">
                    {desktopCurrentTaskTitle}
                    <span className="px-1.5 text-gray-300">•</span>
                    Step {desktopStepNumber} of {desktopTotalSteps}
                  </span>
                  <Progress
                    value={desktopProgressPercent}
                    className="h-[3px] w-[210px] bg-gray-200 [&>div]:bg-primary/75"
                  />
                </div>
              </div>
            </div>
          )}
          {isMobileLayout && (
            <div className="border-b border-gray-300 bg-gray-100 px-4 py-3">
              <div className="text-xs font-medium text-gray-700">
                Step {stepNumber} of {steps.length}
              </div>
            </div>
          )}
          <div
            className={cn(
              "grid min-h-0 flex-1 transition-[grid-template-columns] duration-500 ease-in-out",
              isMobileLayout
                ? "grid-cols-1"
                : "grid-cols-2 divide-x divide-gray-300",
              isMobileLayout ? "relative overflow-hidden" : "",
            )}
          >
            <div
              className={cn(
                "min-h-0 min-w-0 bg-white rounded-r-none transition-[transform] duration-500 ease-in-out",
                isMobileLayout
                  ? cn(
                      "absolute inset-0 z-10 min-h-0 bg-white",
                      isMobilePreviewPaneActive
                        ? "flex flex-col pointer-events-auto"
                        : "hidden pointer-events-none",
                    )
                  : "",
                !isMobileLayout && currentStep === "confirm"
                  ? "scale-[1.005]"
                  : "scale-100",
              )}
            >
              {renderMobileFieldsTabs()}
              {isMobilePreviewReviewStep && (
                <div className="border-b border-gray-200 bg-white px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    Please review your inputs
                  </div>
                </div>
              )}
              {documentUrl ? (
                <>
                  <FormPreviewPdfDisplay
                    key={isMobileLayout ? "mobile-preview" : "desktop-preview"}
                    documentUrl={documentUrl}
                    blocks={previewKeyedFields}
                    values={previewValues}
                    fieldErrors={formFiller.errors}
                    selectionTick={selectionTick}
                    autoScrollToSelectedField={
                      !isMobileLayout && selectedFieldSource === "form"
                    }
                    signingParties={recipients}
                    onFieldClick={handlePdfFieldSelect}
                    selectedFieldId={form.selectedPreviewId ?? undefined}
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  PDF preview unavailable.
                </div>
              )}
              {isMobilePreviewReviewStep && (
                <div className="border-t border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 shrink-0"
                      onClick={() => {
                        handleMobileFieldsTabChange("form");
                        goToStep("fields");
                      }}
                      aria-label="Back to form fields"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 whitespace-nowrap"
                      disabled={nextLoading}
                      onClick={() => void handleNext()}
                    >
                      <TextLoader loading={nextLoading}>Next</TextLoader>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div
              className={cn(
                "relative min-h-0 min-w-0 flex flex-1 flex-col overflow-hidden bg-white transition-[opacity,transform] duration-500 ease-in-out",
                isMobileLayout
                  ? cn(
                      "absolute inset-0 z-20 transition-[transform,opacity] duration-300 ease-in-out",
                      !isMobilePreviewPaneActive
                        ? "translate-x-0 opacity-100 pointer-events-auto"
                        : mobileStepPaneHiddenClass,
                    )
                  : "opacity-100 pointer-events-auto translate-x-0",
              )}
            >
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div
                  className={`absolute inset-0 flex min-h-0 flex-col transition-all duration-500 ease-in-out ${
                    currentStep === "timeline"
                      ? "translate-x-0 opacity-100 pointer-events-auto"
                      : getMobileStepHiddenClass("timeline")
                  }`}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      <p className="text-gray-700 sm:text-base font-semibold tracking-tight">
                        These people will receive this form, in this order:
                      </p>
                      <FormSigningPartyTimeline
                        recipientInputAPI={{
                          recipientEmails,
                          recipientErrors,
                          recipientEmailActions,
                          recipientErrorActions,
                        }}
                      />
                    </div>
                    <div className="my-4 mt-8">
                      <p className="text-sm text-gray-600 sm:text-base">
                        {!noRecipientStep && (
                          <div className="flex flex-row gap-2 border border-primary bg-primary/5 p-4 rounded-[0.33em]">
                            <MailWarningIcon />
                            <span className="text-primary tracking-tight">
                              Don't know the recipient emails? That's okay!
                              <br />
                              Enter a contact who can forward it to the correct
                              address.
                            </span>
                          </div>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-3">
                    <div className="flex w-full justify-between gap-2">
                      {isMobileLayout && (
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={nextLoading}
                          className="h-11 w-11 shrink-0"
                          onClick={() => {
                            onBack();
                            setCurrentStep(initialStep);
                          }}
                          aria-label="Back"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="lg"
                        disabled={!nextEnabled || nextLoading}
                        className="sm:flex-1 whitespace-nowrap w-full sm:min-w-[140px]"
                        onClick={() => void handleNext()}
                      >
                        <TextLoader loading={nextLoading}>Next</TextLoader>
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 min-h-0 transition-all duration-500 ease-in-out ${
                    currentStep === "fields"
                      ? "translate-x-0 opacity-100 pointer-events-auto"
                      : getMobileStepHiddenClass("fields")
                  }`}
                >
                  <div className="min-h-0 flex h-full flex-1 flex-col">
                    {renderMobileFieldsTabs()}
                    <div className="min-h-0 flex-1">
                      <FormFillerRenderer
                        onValuesChange={handleValuesChange}
                        selectionTick={selectionTick}
                        autoScrollToSelectedField={
                          selectedFieldSource === "pdf"
                        }
                        onFieldSelect={handleFormFieldSelect}
                      />
                    </div>
                    <div
                      className={cn(
                        isMobileLayout
                          ? "overflow-hidden bg-white transition-all duration-300 ease-in-out"
                          : "bg-white p-3",
                        isMobileLayout &&
                          (isMobilePreviewTabActive
                            ? "max-h-0 translate-y-full opacity-0 pointer-events-none"
                            : "max-h-24 translate-y-0 opacity-100"),
                      )}
                    >
                      {isMobileLayout ? (
                        <div className="flex items-center gap-2 p-3">
                          <Button
                            size="icon"
                            variant="outline"
                            disabled={nextLoading}
                            className="h-11 w-11 shrink-0"
                            onClick={() => {
                              if (noRecipientStep) {
                                onBack();
                                setCurrentStep(initialStep);
                                return;
                              }

                              goToStep("timeline");
                            }}
                            aria-label="Back"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="lg"
                            className="flex-1 whitespace-nowrap"
                            disabled={!nextEnabled || nextLoading}
                            onClick={() => void handleNext()}
                          >
                            <TextLoader loading={nextLoading}>Next</TextLoader>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            size="lg"
                            variant="outline"
                            disabled={nextLoading}
                            className={cn(
                              "w-full whitespace-nowrap sm:min-w-[140px] sm:flex-1",
                              noRecipientStep
                                ? "opacity-0 pointer-events-none"
                                : "",
                            )}
                            onClick={() => goToStep("timeline")}
                          >
                            Back
                          </Button>
                          <Button
                            size="lg"
                            className="w-full whitespace-nowrap sm:min-w-[140px] sm:flex-1"
                            disabled={!nextEnabled || nextLoading}
                            onClick={() => void handleNext()}
                          >
                            <TextLoader loading={nextLoading}>Next</TextLoader>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 min-h-0 transition-all duration-500 ease-in-out ${
                    currentStep === "confirm"
                      ? "translate-x-0 opacity-100 pointer-events-auto"
                      : getMobileStepHiddenClass("confirm")
                  }`}
                >
                  <div className="min-h-0 flex h-full flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto p-6 flex flex-col items-start justify-start  gap-4">
                      <LucideClipboardCheck className="w-16 h-16 min-h-16 opacity-30 -ml-2" />
                      <span className="text-gray-700 font-semibold">
                        Please check if all your inputs are correct
                      </span>
                      {!noRecipientStep && (
                        <FormSigningPartyTimeline
                          recipientInputAPI={{
                            recipientEmails,
                            recipientErrors,
                            recipientEmailActions,
                            recipientErrorActions,
                          }}
                          isConfirmingRecipients
                        />
                      )}
                      <label className="flex cursor-pointer items-center gap-3 rounded-[0.33em] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                        <Checkbox
                          checked={hasConfirmedDetails}
                          className={cn(
                            "h-5 w-5 rounded-[0.33em] border",
                            hasConfirmedDetails
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-gray-300 bg-white",
                          )}
                          onCheckedChange={(checked) =>
                            setHasConfirmedDetails(checked === true)
                          }
                        />
                        <span>I confirm all the details are correct</span>
                      </label>
                    </div>
                    <div className="bg-white p-3">
                      {isMobileLayout ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-11 w-11 shrink-0"
                            onClick={() => {
                              if (isMobileLayout) {
                                goToStep("preview-review");
                                return;
                              }

                              goToStep("fields");
                            }}
                            aria-label="Go back and edit details"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="lg"
                            className="flex-1 whitespace-nowrap"
                            scheme="supportive"
                            disabled={!hasConfirmedDetails || nextLoading}
                            onClick={() => void handleSubmit()}
                          >
                            <TextLoader loading={nextLoading}>
                              Submit
                            </TextLoader>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full whitespace-nowrap sm:min-w-[140px] sm:flex-1"
                            onClick={() => goToStep("fields")}
                          >
                            Go back and edit details
                          </Button>
                          <Button
                            size="lg"
                            className="w-full whitespace-nowrap sm:min-w-[140px] sm:flex-1"
                            scheme="supportive"
                            disabled={!hasConfirmedDetails || nextLoading}
                            onClick={() => void handleSubmit()}
                          >
                            <TextLoader loading={nextLoading}>
                              Submit
                            </TextLoader>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
