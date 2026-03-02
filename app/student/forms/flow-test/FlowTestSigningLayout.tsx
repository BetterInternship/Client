"use client";

import { ArrowLeft } from "lucide-react";
import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { FormFillerRenderer } from "@/components/features/student/forms/FormFillerRenderer";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { FormInput } from "@/components/EditForm";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
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
  const [values, setValues] = useState({});
  const [recipientEmails, setRecipientEmails] = useState<
    Record<string, string>
  >({});
  const [rightPaneStep, setRightPaneStep] = useState<
    "timeline" | "fields" | "confirm"
  >("timeline");

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
      case "confirm":
        return true;
    }
  }, [recipients, recipientEmails, rightPaneStep]);
  const stepNumber =
    rightPaneStep === "timeline" ? 1 : rightPaneStep === "fields" ? 2 : 3;

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {formLabel}
              </h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setRightPaneStep("timeline");
                onBack();
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 px-6 py-4 max-w-7xl mx-auto",
          rightPaneStep === "confirm" ? "" : "w-full",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[0.33em] border border-gray-300 ">
          <div
            className="grid min-h-0 flex-1 grid-cols-1 transition-[grid-template-columns] duration-500 ease-in-out xl:[grid-template-columns:minmax(0,1fr)_var(--right-pane-width)]"
            style={
              {
                "--right-pane-width":
                  rightPaneStep === "confirm" ? "0px" : "600px",
              } as React.CSSProperties
            }
          >
            <div
              className={cn(
                "min-h-0 bg-white rounded-r-none transition-[transform] duration-500 ease-in-out",
                rightPaneStep === "confirm"
                  ? "xl:scale-[1.01]"
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
                "relative min-h-0 flex flex-1 flex-col overflow-hidden bg-white transition-[opacity,transform] duration-300 ease-in-out",
                rightPaneStep === "confirm"
                  ? "opacity-0 pointer-events-none translate-x-6"
                  : "opacity-100 pointer-events-auto translate-x-0",
              )}
            >
              <div className="flex h-[58px] items-center border-b border-gray-300 px-6">
                <span className="text-sm font-medium text-gray-700">
                  Step {stepNumber} of 3
                </span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">
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
                  <div className="border-t border-gray-300 bg-gray-200 p-3">
                    <div className="flex w-full justify-between gap-2">
                      <Button
                        size="lg"
                        className="flex-1 opacity-0 pointer-events-none"
                      >
                        Next
                      </Button>
                      <Button
                        size="lg"
                        disabled={!nextEnabled}
                        className="flex-1"
                        onClick={() => {
                          setRightPaneStep("fields");
                        }}
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
                  <div className="min-h-0 flex h-full flex-1 flex-col pt-8">
                    <div className="min-h-0 flex-1">
                      <FormFillerRenderer onValuesChange={setValues} />
                    </div>
                    <div className="border-t border-gray-300 bg-gray-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          size="lg"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setRightPaneStep("timeline")}
                        >
                          Previous
                        </Button>
                        <Button
                          size="lg"
                          className="flex-1"
                          onClick={() => setRightPaneStep("confirm")}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {rightPaneStep === "confirm" && (
            <div className="border-t border-gray-300 bg-gray-200 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setRightPaneStep("fields")}
                >
                  Go back and edit details
                </Button>
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  scheme="supportive"
                >
                  I confirm the details are correct
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
