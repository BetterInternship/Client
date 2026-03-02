"use client";

import { ArrowLeft } from "lucide-react";
import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { FormFillerRenderer } from "@/components/features/student/forms/FormFillerRenderer";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { FormInput } from "@/components/EditForm";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import {
  getBlockField,
  isBlockField,
} from "@/components/features/student/forms/utils";
import { Badge } from "@/components/ui/badge";

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
  const fromMe = recipients.some(
    (recipient) => recipient.signatory_source?._id === "initiator",
  );
  const stepNumber =
    rightPaneStep === "timeline" ? 1 : rightPaneStep === "fields" ? 2 : 3;

  // Clean up when switching form
  useEffect(() => {
    setRecipientEmails({});
    setValues({});
  }, [formLabel]);

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
          rightPaneStep === "confirm" ? "max-w-3xl" : "max-w-7xl",
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
                "relative min-h-0 flex flex-1 flex-col overflow-hidden bg-white transition-[opacity,transform] duration-500 ease-in-out",
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
                        {fromMe && (
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
                      >
                        Next
                      </Button>
                      <Button
                        size="lg"
                        disabled={!nextEnabled}
                        className="flex-1 whitespace-nowrap sm:min-w-[140px]"
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
                          className="flex-1 whitespace-nowrap sm:min-w-[140px]"
                          onClick={() => setRightPaneStep("timeline")}
                        >
                          Previous
                        </Button>
                        <Button
                          size="lg"
                          className="flex-1 whitespace-nowrap sm:min-w-[140px]"
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
          <div
            className={cn(
              "border-t border-gray-300 bg-gray-200 transition-[opacity,transform,max-height] duration-500 ease-in-out ",
              rightPaneStep === "confirm"
                ? "opacity-100 translate-y-0 pointer-events-auto max-h-96"
                : "opacity-0 translate-y-2 max-h-0 pointer-events-none p-0 border-t-0",
            )}
          >
            <div className="flex flex-col w-full border-b border-b-gray-400 bg-white p-5 px-7 gap-2">
              These emails will receive the form at some point:
              {Object.entries(recipientEmails).map(
                ([recipientTitle, recipientEmail]) => {
                  return (
                    <div className="flex flex-row">
                      <Badge className="rounded-r-none gap-1">
                        <span className="text-gray-500">{recipientTitle}:</span>
                        <span className="font-bold text-primary">
                          {recipientEmail}
                        </span>
                      </Badge>
                    </div>
                  );
                },
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end p-3">
              <Button
                size="lg"
                variant="outline"
                className="w-full whitespace-nowrap sm:w-auto"
                onClick={() => setRightPaneStep("fields")}
              >
                Go back and edit details
              </Button>
              <Button
                size="lg"
                className="w-full whitespace-nowrap sm:w-auto"
                scheme="supportive"
              >
                I confirm the details are correct
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
