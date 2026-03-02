"use client";

import { ChevronLeft } from "lucide-react";
import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { FormFillerRenderer } from "@/components/features/student/forms/FormFillerRenderer";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { FormInput } from "@/components/EditForm";
import { useMemo, useState } from "react";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { useFormFiller } from "@/components/features/student/forms/form-filler.ctx";
import { useMyAutofill } from "@/hooks/use-my-autofill";
import {
  getBlockField,
  isBlockField,
} from "@/components/features/student/forms/utils";

interface SigningRecipient {
  signatory_title: string;
  signatory_source?: {
    _id?: string;
  };
}

interface FlowTestSigningLayoutProps {
  formLabel?: string;
  documentUrl?: string;
  recipients: SigningRecipient[];
  onBack: () => void;
}

export function FlowTestSigningLayout({
  formLabel,
  documentUrl,
  recipients,
  onBack,
}: FlowTestSigningLayoutProps) {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const [values, setValues] = useState({});
  const [recipientEmails, setRecipientEmails] = useState<
    Record<string, string>
  >({});
  const [rightPaneStep, setRightPaneStep] = useState<"timeline" | "fields">(
    "timeline",
  );

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
    switch (rightPaneStep) {
      case "timeline":
        return recipients.every(
          (recipient) =>
            !!recipientEmails[recipient.signatory_title] ||
            recipient.signatory_source?._id !== "initiator",
        );
      case "fields":
        return true;
    }
  }, [recipients, recipientEmails, rightPaneStep]);

  return (
    <div className="h-full min-h-0 flex flex-col bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          {formLabel}
        </h3>
        <Button
          variant="outline"
          className="text-sm"
          scheme="primary"
          onClick={() => {
            setRightPaneStep("timeline");
            onBack();
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Templates
        </Button>
      </div>

      <div className="min-h-0 flex-1 px-6">
        <div className="mx-auto h-full w-full max-w-7xl overflow-hidden rounded-[0.33em] border border-gray-300 bg-white">
          <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_600px]">
            <div className="min-h-0 bg-white rounded-r-none">
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

            <div className="relative min-h-0 flex flex-1 flex-col overflow-hidden bg-white">
              <div
                className={`absolute inset-0 flex min-h-0 flex-col transition-all duration-300 ease-in-out ${
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
                        return (
                          <TimelineItem
                            key={`${recipient.signatory_title}-${index}`}
                            number={index + 1}
                            fromMe={fromMe}
                            title={recipient.signatory_title}
                            subtitle={
                              fromMe && (
                                <FormInput
                                  value={
                                    recipientEmails[recipient.signatory_title]
                                  }
                                  placeholder={"recipient@email.com"}
                                  className="mt-1"
                                  setter={(value) =>
                                    setRecipientEmails({
                                      ...recipientEmails,
                                      [recipient.signatory_title]: value,
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
                      <span className="text-primary italic">
                        Don't know the recipient emails? That's okay:
                        <br />
                        Enter a contact who can forward it to the correct
                        address.
                      </span>
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-300 bg-gray-100 p-3">
                  <div className="flex justify-end">
                    <Button
                      disabled={!nextEnabled}
                      className="w-full text-base sm:w-60"
                      onClick={() => setRightPaneStep("fields")}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              <div
                className={`absolute inset-0 min-h-0 transition-all duration-300 ease-in-out ${
                  rightPaneStep === "fields"
                    ? "translate-x-0 opacity-100 pointer-events-auto"
                    : "translate-x-6 opacity-0 pointer-events-none"
                }`}
              >
                <div className="min-h-0 flex h-full flex-1">
                  <FormFillerRenderer onValuesChange={setValues} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
