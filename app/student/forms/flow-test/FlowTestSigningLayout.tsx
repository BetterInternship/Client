"use client";

import { ArrowLeft, LucideClipboardCheck } from "lucide-react";
import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { FormFillerRenderer } from "@/components/features/student/forms/FormFillerRenderer";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { FormInput } from "@/components/EditForm";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import {
  getBlockField,
  isBlockField,
} from "@/components/features/student/forms/utils";
import { Badge } from "@/components/ui/badge";
import { useFormFiller } from "@/components/features/student/forms/form-filler.ctx";
import { useMyAutofill, useMyAutofillUpdate } from "@/hooks/use-my-autofill";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { FormValues, IFormSigningParty } from "@betterinternship/core/forms";
import { TextLoader } from "@/components/ui/loader";
import { useClientProcess } from "@betterinternship/components";
import { FormService } from "@/lib/api/services";
import { FilloutFormProcessResult } from "../page";
import { useMyForms } from "../myforms.ctx";
import useModalRegistry from "@/components/modals/modal-registry";
import { getClientAudit } from "@/lib/audit";
import { useQueryClient } from "@tanstack/react-query";

interface FlowTestSigningLayoutProps {
  formLabel?: string;
  documentUrl?: string;
  recipients: IFormSigningParty[];
  noEsign?: boolean;
  onBack: () => void;
}

export function FlowTestSigningLayout({
  formLabel,
  documentUrl,
  recipients,
  noEsign,
  onBack,
}: FlowTestSigningLayoutProps) {
  const form = useFormRendererContext();
  const myForms = useMyForms();
  const modalRegistry = useModalRegistry();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const updateAutofill = useMyAutofillUpdate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<FormValues>({});
  const [nextLoading, setNextLoading] = useState(false);
  const [recipientEmails, setRecipientEmails] = useState<
    Record<string, string>
  >({});
  const [confirmStepBuffering, setConfirmStepBuffering] = useState(false);
  const [rightPaneStep, setRightPaneStep] = useState<
    "timeline" | "fields" | "confirm"
  >("timeline");

  const formFilloutProcess = useClientProcess({
    filterKey: "form-fillout",
    caller: FormService.filloutForm.bind(FormService),
    invalidator: useCallback(
      (result: FilloutFormProcessResult) => {
        return myForms.forms.some(
          (form) => form.form_process_id === result.formProcessId,
        );
      },
      [myForms.forms],
    ),
    onSuccess: (processId, _processName, result) => {
      toast.success(`Generated ${form.formLabel}!`, {
        id: processId,
        duration: 2000,
      });
      console.log("RESULT: ", result);
    },
    onFailure: (processId, _processName, error) => {
      toast.error(`Could not generate ${form.formLabel}: ${error}`, {
        id: processId,
        duration: 2000,
      });
      console.log("ERROR: ", error);
    },
  });

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

  const manualBlocks = useMemo(
    () =>
      form.blocks.filter(
        (block) =>
          isBlockField(block) && getBlockField(block)?.source === "manual",
      ),
    [form.blocks],
  );

  const manualKeyedFields = useMemo(() => {
    if (!form.keyedFields || form.keyedFields.length === 0) return [];

    // Get field names from manual blocks
    const manualFieldNames = new Set(
      manualBlocks.map((block) => getBlockField(block)?.field).filter(Boolean),
    );

    // Filter keyedFields to only those in manual blocks
    return form.keyedFields.filter((kf) => manualFieldNames.has(kf.field));
  }, [form.keyedFields, manualBlocks]);

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

  const handleNext = useCallback(async () => {
    const additionalValues = { ...autofillValues, ...recipientEmails };
    const finalValues = formFiller.getFinalValues(additionalValues);
    const errors = formFiller.validate(form.fields, additionalValues);

    // So it doesn't look like it's hanging
    setNextLoading(true);

    switch (rightPaneStep) {
      case "timeline":
        setRightPaneStep("fields");
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

  const handleSubmit = useCallback(async () => {
    setNextLoading(true);
    const finalValues = formFiller.getFinalValues(autofillValues);

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

      modalRegistry.formSubmissionSuccess.open("manual");
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
      modalRegistry.formSubmissionSuccess.open("esign");
    }
    setNextLoading(false);
  }, [form, generateWithNoSignature, autofillValues]);

  // Clean up when switching form
  useEffect(() => {
    setRecipientEmails({});
    setValues({});
    setRightPaneStep(noRecipientStep ? "fields" : "timeline");
  }, [formLabel, noEsign, noRecipientStep]);

  // Buffer
  useEffect(() => {
    if (rightPaneStep === "confirm") setConfirmStepBuffering(true);
    const timeout = setTimeout(() => setConfirmStepBuffering(false), 2000);
    return () => clearTimeout(timeout);
  }, [rightPaneStep]);

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <h3 className="truncate whitespace-nowrap text-xl font-semibold text-gray-900 sm:text-2xl">
                {formLabel}
              </h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setRightPaneStep("timeline");
                onBack();
              }}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 px-6 py-4 mx-auto w-full transition-[max-width] duration-500 ease-in-out",
          "max-w-7xl",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[0.33em] border border-gray-300 ">
          <div
            className="grid min-h-0 flex-1 grid-cols-1 transition-[grid-template-columns] duration-500 ease-in-out xl:[grid-template-columns:minmax(0,1fr)_var(--right-pane-width)]"
            style={
              {
                "--right-pane-width": "600px",
              } as React.CSSProperties
            }
          >
            <div
              className={cn(
                "min-h-0 bg-white rounded-r-none transition-[transform] duration-500 ease-in-out",
                rightPaneStep === "confirm"
                  ? "xl:scale-[1.005]"
                  : "xl:scale-100",
              )}
            >
              {documentUrl ? (
                <FormPreviewPdfDisplay
                  documentUrl={documentUrl}
                  blocks={manualKeyedFields}
                  values={values}
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
                "opacity-100 pointer-events-auto translate-x-0",
              )}
            >
              <div className="flex h-[58px] items-center border-b border-gray-300 px-6">
                <span className="text-sm font-medium text-gray-700">
                  Step {steps.indexOf(rightPaneStep) + 1} of {steps.length}
                </span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div
                  className={`absolute inset-0 flex min-h-0 flex-col transition-all duration-500 ease-in-out ${
                    rightPaneStep === "timeline"
                      ? "translate-x-0 opacity-100 pointer-events-auto"
                      : "-translate-x-6 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto px-10 py-16">
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600 sm:text-base">
                        These people will receive this form, in this order:
                      </p>
                      <Timeline>
                        {recipients.map((recipient, index) => {
                          const fromMe =
                            recipient.signatory_source?._id === "initiator";
                          const fieldName =
                            form.formMetadata.getSigningPartyFieldName(
                              recipient._id,
                            );
                          return (
                            <TimelineItem
                              key={`${fieldName}-${index}`}
                              number={index + 1}
                              fromMe={fromMe}
                              title={recipient.signatory_title}
                              subtitle={
                                fromMe && (
                                  <FormInput
                                    value={recipientEmails[fieldName]}
                                    placeholder={"recipient@email.com"}
                                    className="mt-1"
                                    setter={(value) =>
                                      setRecipientEmails({
                                        ...recipientEmails,
                                        [fieldName]: value,
                                      })
                                    }
                                  />
                                )
                              }
                              isLast={index === recipients.length - 1}
                            />
                          );
                        })}
                      </Timeline>
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
                  <div className="border-t border-gray-300 bg-gray-200 p-3">
                    <div className="flex w-full justify-between gap-2">
                      <Button
                        size="lg"
                        className="pointer-events-none flex-1 whitespace-nowrap opacity-0 sm:min-w-[140px]"
                      />
                      <Button
                        size="lg"
                        disabled={!nextEnabled || nextLoading}
                        className="flex-1 whitespace-nowrap sm:min-w-[140px]"
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
                  <div className="min-h-0 flex h-full flex-1 flex-col pt-8">
                    <div className="min-h-0 flex-1">
                      <FormFillerRenderer onValuesChange={setValues} />
                    </div>
                    <div className="border-t border-gray-300 bg-gray-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          size="lg"
                          variant="outline"
                          disabled={nextLoading}
                          className={cn(
                            "flex-1 whitespace-nowrap sm:min-w-[140px]",
                            noRecipientStep
                              ? "opacity-0 pointer-events-none"
                              : "",
                          )}
                          onClick={() => setRightPaneStep("timeline")}
                        >
                          Previous
                        </Button>
                        <Button
                          size="lg"
                          className="flex-1 whitespace-nowrap sm:min-w-[140px]"
                          disabled={!nextEnabled || nextLoading}
                          onClick={() => void handleNext()}
                        >
                          <TextLoader loading={nextLoading}>Next</TextLoader>
                        </Button>
                      </div>
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
                    <div className="min-h-0 flex-1 overflow-y-auto p-10 flex flex-col items-start justify-start pt-20 gap-4">
                      <LucideClipboardCheck className="w-16 h-16 opacity-40" />
                      Please check that all your inputs are correct
                      {!noRecipientStep && (
                        <div className="space-y-3 mt-8">
                          Make sure these emails are right:
                          <div className="space-y-2 mt-2">
                            {Object.entries(recipientEmails).map(
                              ([recipientTitle, recipientEmail], index) => (
                                <div
                                  key={`${recipientTitle}-${index}`}
                                  className="flex flex-row"
                                >
                                  <Badge className="rounded-r-none gap-1">
                                    <span className="text-gray-500">
                                      {index + 1}. {recipientTitle}:
                                    </span>
                                    <span className="font-bold text-primary">
                                      {recipientEmail}
                                    </span>
                                  </Badge>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-300 bg-gray-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          size="lg"
                          variant="outline"
                          className="flex-1 whitespace-nowrap sm:min-w-[140px]"
                          disabled={confirmStepBuffering}
                          onClick={() => setRightPaneStep("fields")}
                        >
                          Go back and edit details
                        </Button>
                        <Button
                          size="lg"
                          className="flex-1 whitespace-nowrap sm:min-w-[140px]"
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
