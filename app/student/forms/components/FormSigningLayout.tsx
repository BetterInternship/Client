"use client";

import { ArrowLeft, LucideClipboardCheck } from "lucide-react";
import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { FormFillerRenderer } from "@/components/features/student/forms/FormFillerRenderer";
import { Button } from "@/components/ui/button";
import { cn, isValidEmail } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { FormSigningLayoutMobile } from "./FormSigningLayoutMobile";
import { FormSigningPartyTimeline } from "./FormSigningPartyTimeline";

interface FlowTestSigningLayoutProps {
  formLabel?: string;
  documentUrl?: string;
  recipients: IFormSigningParty[];
  noEsign?: boolean;
  onBack: () => void;
}

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
  const { isMobile } = useAppContext();
  const [values, setValues] = useState<FormValues>({});
  const [nextLoading, setNextLoading] = useState(false);
  const [recipientEmails, recipientEmailActions] = useStateRecord({});
  const [recipientErrors, recipientErrorActions] = useStateRecord({});
  const [confirmStepBuffering, setConfirmStepBuffering] = useState(false);
  const [rightPaneStep, setRightPaneStep] = useState<
    "timeline" | "fields" | "confirm"
  >("timeline");
  const [mobileActiveTab, setMobileActiveTab] = useState<"step" | "preview">(
    "step",
  );
  const [selectedFieldSource, setSelectedFieldSource] = useState<
    "form" | "pdf" | null
  >(null);
  const [selectionTick, setSelectionTick] = useState(0);

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
  const steps = noRecipientStep
    ? ["fields", "confirm"]
    : ["timeline", "fields", "confirm"];

  const previewKeyedFields = useMemo(
    () =>
      (form.keyedFields ?? []).map((field) => ({
        ...field,
        signing_party_id: fieldOwnerByName.get(field.field),
      })),
    [form.keyedFields, fieldOwnerByName],
  );

  const handlePdfFieldSelect = (fieldName: string) => {
    setSelectedFieldSource("pdf");
    setSelectionTick((prev) => prev + 1);
    form.setSelectedPreviewId(fieldName);
    if (isMobile) setMobileActiveTab("step");
    if (rightPaneStep !== "fields") {
      setRightPaneStep("fields");
    }
  };

  const handleFormFieldSelect = (fieldName: string) => {
    setSelectedFieldSource("form");
    setSelectionTick((prev) => prev + 1);
    form.setSelectedPreviewId(fieldName);
  };

  const nextEnabled = useMemo(() => {
    console.log(
      "VALS",
      form.fields.reduce(
        (acc, cur) => ((acc[cur.field] = values[cur.field]), acc),
        {} as Record<string, string>,
      ),
      form.fields.every(
        (field) =>
          field.signing_party_id !== "initiator" ||
          field.source !== "manual" ||
          !!values[field.field],
      ),
    );
    switch (rightPaneStep) {
      case "timeline":
        return recipients.every(
          (recipient) =>
            !!recipientEmails[
              form.formMetadata.getSigningPartyFieldName(recipient._id)
            ] || recipient.signatory_source?._id !== "initiator",
        );
      case "fields":
        return form.fields.every(
          (field) =>
            field.signing_party_id !== "initiator" ||
            field.source !== "manual" ||
            !!values[field.field],
        );
      case "confirm":
        return true;
    }
  }, [recipients, recipientEmails, rightPaneStep, form, values]);

  const checkRecipientErrors = (recipientEmails: Record<string, string>) => {
    const emailErrors: Record<string, string> = {};

    for (const [recipientKey, recipientEmail] of Object.entries(
      recipientEmails,
    )) {
      if (!isValidEmail(recipientEmail))
        emailErrors[recipientKey] = `${recipientEmail} is not a valid email.`;
    }

    return emailErrors;
  };

  const handleNext = useCallback(async () => {
    const additionalValues = { ...autofillValues, ...recipientEmails };
    const finalValues = formFiller.getFinalValues(additionalValues);
    const errors = formFiller.validate(form.fields, additionalValues);
    const emailErrors = checkRecipientErrors(recipientEmails);

    // So it doesn't look like it's hanging
    setNextLoading(true);

    switch (rightPaneStep) {
      case "timeline":
        if (Object.keys(emailErrors).length) {
          recipientErrorActions.overwrite(emailErrors);
          toast.error(
            "Some information is missing or incorrect",
            toastPresets.destructive,
          );
        } else {
          recipientErrorActions.clearAll();
          setRightPaneStep("fields");
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
          await updateAutofill(form.formName, form.fields, finalValues);
          setRightPaneStep("confirm");
        }

        setNextLoading(false);
        break;
      case "confirm":
        setNextLoading(false);
        break;
    }
  }, [recipients, recipientEmails, rightPaneStep, form, values]);

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
        email: recipientEmails[fieldName],
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
        setRightPaneStep("timeline");
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
          setRightPaneStep("timeline");
          onBack();
        },
        getFirstRecipient(),
      );
    }
    setNextLoading(false);
  }, [form, generateWithNoSignature, autofillValues]);

  // Clean up when switching form
  useEffect(() => {
    recipientEmailActions.clearAll();
    setValues({});
    setRightPaneStep(noRecipientStep ? "fields" : "timeline");
    setMobileActiveTab("step");
  }, [formLabel, noEsign, noRecipientStep]);

  // Buffer
  useEffect(() => {
    if (rightPaneStep === "confirm") setConfirmStepBuffering(true);
    const timeout = setTimeout(() => setConfirmStepBuffering(false), 2000);
    return () => clearTimeout(timeout);
  }, [rightPaneStep]);

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div
        className={cn(
          "min-h-0 flex-1 px-0 py-0 mx-auto w-full transition-[max-width] duration-500 ease-in-out sm:px-6 sm:py-4",
          "max-w-7xl",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[0.33em] border border-gray-300 ">
          {isMobile && (
            <FormSigningLayoutMobile
              activeTab={mobileActiveTab}
              onTabChange={setMobileActiveTab}
              stepLabel={`Step ${steps.indexOf(rightPaneStep) + 1} of ${steps.length}`}
            />
          )}
          <div
            className={cn(
              "grid min-h-0 flex-1 grid-cols-1 transition-[grid-template-columns] duration-500 ease-in-out xl:[grid-template-columns:minmax(0,1fr)_var(--right-pane-width)]",
              isMobile ? "relative overflow-hidden" : "",
            )}
            style={
              {
                "--right-pane-width": "600px",
              } as React.CSSProperties
            }
          >
            <div
              className={cn(
                "min-h-0 bg-white rounded-r-none transition-[transform] duration-500 ease-in-out xl:border-r xl:border-gray-200",
                isMobile
                  ? cn(
                      "absolute inset-0 z-10 transition-[transform,opacity] duration-300 ease-in-out",
                      mobileActiveTab === "preview"
                        ? "translate-x-0 opacity-100 pointer-events-auto"
                        : "translate-x-full opacity-0 pointer-events-none",
                    )
                  : "",
                rightPaneStep === "confirm"
                  ? "xl:scale-[1.005]"
                  : "xl:scale-100",
              )}
            >
              {documentUrl ? (
                <FormPreviewPdfDisplay
                  documentUrl={documentUrl}
                  blocks={previewKeyedFields}
                  values={values}
                  headerLeft={
                    !isMobile ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setRightPaneStep("timeline");
                          onBack();
                        }}
                        className="h-8 gap-2 px-2 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Templates
                      </Button>
                    ) : undefined
                  }
                  fieldErrors={formFiller.errors}
                  selectionTick={selectionTick}
                  autoScrollToSelectedField={selectedFieldSource === "form"}
                  signingParties={recipients}
                  onFieldClick={handlePdfFieldSelect}
                  selectedFieldId={form.selectedPreviewId ?? undefined}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  PDF preview unavailable.
                </div>
              )}
            </div>

            <div
              className={cn(
                "relative min-h-0 flex flex-1 flex-col overflow-hidden bg-white transition-[opacity,transform] duration-500 ease-in-out",
                isMobile
                  ? cn(
                      "absolute inset-0 z-20 transition-[transform,opacity] duration-300 ease-in-out",
                      mobileActiveTab === "step"
                        ? "translate-x-0 opacity-100 pointer-events-auto"
                        : "-translate-x-full opacity-0 pointer-events-none",
                    )
                  : "opacity-100 pointer-events-auto translate-x-0",
              )}
            >
              {!isMobile && (
                <div className="flex items-start gap-3 px-6 pt-4">
                  <div className="min-w-0 flex-1">
                    <span
                      className="block whitespace-normal break-words text-xl font-semibold leading-tight text-primary"
                      title={formLabel ?? ""}
                    >
                      {formLabel}
                    </span>
                  </div>
                  <span className="shrink-0 pt-0.5 text-xs font-medium text-gray-700">
                    Step {steps.indexOf(rightPaneStep) + 1} of {steps.length}
                  </span>
                </div>
              )}
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div
                  className={`absolute inset-0 flex min-h-0 flex-col transition-all duration-500 ease-in-out ${
                    rightPaneStep === "timeline"
                      ? "translate-x-0 opacity-100 pointer-events-auto"
                      : "-translate-x-6 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      <p className="text-gray-700 sm:text-base font-bold">
                        These people will receive this form, in this order:
                      </p>
                      <FormSigningPartyTimeline
                        recipientInputAPI={{
                          recipientEmails,
                          recipientErrors,
                          recipientEmailActions,
                        }}
                      />
                    </div>
                    <div className="my-4 mt-8">
                      <p className="text-sm text-gray-600 sm:text-base">
                        {!noRecipientStep && (
                          <span className="text-primary italic">
                            Don't know the recipient emails? That's okay:
                            <br />
                            Enter a contact who can forward it to the correct
                            address.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-3">
                    <div className="flex w-full justify-between gap-2">
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
                    rightPaneStep === "fields"
                      ? "translate-x-0 opacity-100 pointer-events-auto"
                      : "translate-x-6 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="min-h-0 flex h-full flex-1 flex-col">
                    <div className="min-h-0 flex-1">
                      <FormFillerRenderer
                        onValuesChange={setValues}
                        selectionTick={selectionTick}
                        autoScrollToSelectedField={
                          selectedFieldSource === "pdf"
                        }
                        onFieldSelect={handleFormFieldSelect}
                      />
                    </div>
                    <div className="bg-white p-3">
                      {isMobile ? (
                        <div className="flex items-center gap-2">
                          {!noRecipientStep && (
                            <Button
                              size="icon"
                              variant="outline"
                              disabled={nextLoading}
                              className="h-11 w-11 shrink-0"
                              onClick={() => setRightPaneStep("timeline")}
                              aria-label="Back"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                          )}
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
                            onClick={() => setRightPaneStep("timeline")}
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
                    rightPaneStep === "confirm"
                      ? "translate-x-0 opacity-100 pointer-events-auto"
                      : "translate-x-6 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="min-h-0 flex h-full flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto p-6 flex flex-col items-start justify-start  gap-4">
                      <LucideClipboardCheck className="w-16 h-16 min-h-16 opacity-30 -ml-2" />
                      <span className="text-gray-700 font-bold">
                        Please check if all your inputs are correct
                      </span>
                      {!noRecipientStep && (
                        <FormSigningPartyTimeline
                          recipientInputAPI={{
                            recipientEmails,
                            recipientErrors,
                            recipientEmailActions,
                          }}
                          isConfirmingRecipients
                        />
                      )}
                    </div>
                    <div className="bg-white p-3">
                      {isMobile ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-11 w-11 shrink-0"
                            disabled={confirmStepBuffering}
                            onClick={() => setRightPaneStep("fields")}
                            aria-label="Go back and edit details"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="lg"
                            className="flex-1 whitespace-nowrap"
                            scheme="supportive"
                            disabled={confirmStepBuffering || nextLoading}
                            onClick={() => void handleSubmit()}
                          >
                            <TextLoader
                              loading={confirmStepBuffering || nextLoading}
                            >
                              I confirm the details are correct
                            </TextLoader>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full whitespace-nowrap sm:min-w-[140px] sm:flex-1"
                            disabled={confirmStepBuffering}
                            onClick={() => setRightPaneStep("fields")}
                          >
                            Go back and edit details
                          </Button>
                          <Button
                            size="lg"
                            className="w-full whitespace-nowrap sm:min-w-[140px] sm:flex-1"
                            scheme="supportive"
                            disabled={confirmStepBuffering || nextLoading}
                            onClick={() => void handleSubmit()}
                          >
                            <TextLoader
                              loading={confirmStepBuffering || nextLoading}
                            >
                              I confirm the details are correct
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
