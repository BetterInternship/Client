"use client";

import { ChevronLeft } from "lucide-react";
import { FormPreviewPdfDisplay } from "@/components/features/student/forms/previewer";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

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
  return (
    <div className="h-full min-h-0 flex flex-col bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-start px-4 py-4 sm:px-6">
        <Button
          variant="outline"
          className="text-sm"
          scheme="primary"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="min-h-0 flex-1 px-6">
        <div className="mx-auto h-full w-full max-w-7xl overflow-hidden rounded-[0.33em] border border-gray-300 bg-white">
          <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_600px]">
            <div className="min-h-0 bg-white rounded-r-none">
              {documentUrl ? (
                <FormPreviewPdfDisplay
                  documentUrl={documentUrl}
                  blocks={[]}
                  values={{}}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  PDF preview unavailable.
                </div>
              )}
            </div>

            <div className="min-h-0 overflow-y-auto bg-white px-10 py-16">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    {formLabel}
                  </h3>
                  <p className="my-4 text-sm text-gray-600 sm:text-base">
                    These people will receive a copy of this form, in this
                    order:
                  </p>
                </div>

                <Timeline>
                  {recipients.map((recipient, index) => (
                    <TimelineItem
                      key={`${recipient.signatory_title}-${index}`}
                      number={index + 1}
                      title={
                        <span className="text-base text-gray-700 sm:text-lg">
                          {recipient.signatory_title}
                        </span>
                      }
                      subtitle={
                        recipient.signatory_source?._id === "initiator" && (
                          <span className="text-warning text-sm font-bold">
                            you will specify this email
                          </span>
                        )
                      }
                      isLast={index === recipients.length - 1}
                    />
                  ))}
                </Timeline>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
