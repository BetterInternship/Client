"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Eye, FileSearch, PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { Divider } from "@/components/ui/divider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormTemplate } from "@/lib/db/use-moa-backend";
import { Loader } from "@/components/ui/loader";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FlowTestPreviewModal } from "./FlowTestPreviewModal";
import { FlowTestSigningLayout } from "./FlowTestSigningLayout";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { FormHistoryView } from "@/components/forms/FormHistoryView";

export default function FlowTestPage({
  generatedForms,
  formTemplates,
  isLoading,
}: {
  generatedForms: {
    form_process_id?: string;
    label: string;
    prefilled_document_id?: string | null;
    pending_document_id?: string | null;
    signed_document_id?: string | null;
    latest_document_url?: string | null;
    timestamp: string;
    signing_parties?: IFormSigningParty[];
    status?: string | null;
    rejection_reason?: string;
    pending?: boolean;
  }[];
  formTemplates: FormTemplate[];
  isLoading: boolean;
}) {
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const selectedTemplate = useMemo<FormTemplate | null>(
    () =>
      formTemplates?.find(
        (template) => template.formName === selectedTemplateName,
      ) ?? null,
    [formTemplates, selectedTemplateName],
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSigningFlow, setIsSigningFlow] = useState(false);
  const form = useFormRendererContext();
  const recipients = form.formMetadata.getSigningParties();
  const sortedTemplates = useMemo(
    () =>
      formTemplates?.toSorted((a, b) => {
        const aLabel = a.formLabel.replaceAll(/[()[\]\-,]/g, "");
        const bLabel = b.formLabel.replaceAll(/[()[\]\-,]/g, "");
        return aLabel.localeCompare(bLabel);
      }) ?? [],
    [formTemplates],
  );
  const hasHistoryLogs = useMemo(
    () =>
      (generatedForms ?? []).some(
        (entry) => entry.label === form.formLabel || !form.formLabel,
      ),
    [generatedForms, form.formLabel],
  );

  if (isLoading) return <Loader>Loading form templates...</Loader>;

  const handleSigningPartiesSubmit = async () => {
    setIsSigningFlow(true);
    return Promise.resolve({ success: true });
  };

  return (
    <div className="h-full min-h-0 w-full bg-gray-50">
      <div className="h-[2px] w-full bg-gray/60" />

      <div
        className={cn(
          "grid h-[calc(100%-2px)] min-h-0 transition-[grid-template-columns] duration-500 ease-in-out",
          isSigningFlow
            ? "grid-cols-[0px_minmax(0,1fr)]"
            : "grid-cols-[480px_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "flex min-h-0 flex-col border-b border-gray-300 bg-white md:border-b-0 md:border-r transition-all duration-500 ease-in-out overflow-hidden",
            isSigningFlow
              ? "-translate-x-8 opacity-0 pointer-events-none"
              : "translate-x-0 opacity-100",
          )}
        >
          <div className="flex h-20 items-center bg-gray-100 border-b border-gray-200 px-10">
            <div className="flex flex-col w-full gap-2">
              <h1 className="text-2xl tracking-tight text-gray-700 sm:text-2xl font-bold">
                Form Templates
              </h1>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {sortedTemplates.length ? (
              <div className="space-y-4">
                {sortedTemplates?.map((template) => {
                  const isActive = template.formName === selectedTemplateName;
                  return (
                    <button
                      key={template.formName}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateName(template.formName);
                        form.updateFormName(template.formName);
                      }}
                      className="w-full text-left"
                    >
                      <Card
                        className={cn(
                          "border transition",
                          isActive
                            ? "border-primary/40 ring-1 ring-primary/30 bg-primary/15"
                            : "border-gray-200 hover:bg-primary/5",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl">
                              {template.formLabel}
                            </h2>
                          </div>
                          <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                        </div>

                        {/* // ! ADD BACK TAGS ONCE IMPLEMENTED */}
                        {/* <div className="mt-4 flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <Badge
                            key={tag}
                            type="accent"
                            className="border-gray-400 opacity-75"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div> */}
                      </Card>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4">
                We currently don't automate forms for your department. <br />
                <br />
                Have a copy of your department's form templates? <br />
                <a
                  href="https://facebook.com/shi.sherwin"
                  className="underline"
                  target="_blank"
                >
                  Message us so we can help you out!
                </a>
              </div>
            )}
          </div>
        </aside>

        <section
          className={cn(
            "flex min-h-0 flex-col bg-background overflow-hidden transition-[transform,opacity] duration-500 ease-in-out will-change-transform w-full",
            isSigningFlow
              ? "md:-translate-x-2 opacity-100"
              : "md:translate-x-0 opacity-100 max-w-5xl mx-auto",
          )}
        >
          {selectedTemplateName ? (
            <div
              className={cn(
                "relative min-h-0 flex-1 bg-gray-100 transition-[padding] duration-500 ease-in-out",
                isSigningFlow ? "px-2 sm:px-4" : "px-4",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 min-h-0 overflow-y-auto transition-opacity duration-300 ease-in-out",
                  isSigningFlow
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none",
                )}
              >
                <FlowTestSigningLayout
                  formLabel={selectedTemplate?.formLabel}
                  documentUrl={form.document.url}
                  recipients={recipients}
                  onBack={() => setIsSigningFlow(false)}
                />
              </div>

              <div
                className={cn(
                  "absolute inset-0 min-h-0 overflow-y-auto bg-white transition-opacity duration-300 ease-in-out [scrollbar-gutter:stable]",
                  isSigningFlow
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100 pointer-events-auto",
                )}
              >
                {form.loading || form.document.name !== selectedTemplateName ? (
                  <Loader>Loading form template...</Loader>
                ) : (
                  <div className="mx-auto flex min-h-full max-w-4xl flex-col gap-4 bg-white px-12 py-20">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                        {selectedTemplate?.formLabel}
                      </h3>
                      <Divider />
                    </div>
                    {hasHistoryLogs ? (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="generate-another">
                          <AccordionTrigger className="text-xl px-6 font-semibold text-gray-800 hover:no-underline bg-gray-50 aria-expanded:rounded-b-none border-gray-300 border">
                            Generate another
                          </AccordionTrigger>
                          <AccordionContent className="p-6 rounded-b-[0.33em] border-gray-300 border border-t-0">
                            {recipients.length > 1 && (
                              <Timeline>
                                {recipients.map((recipient, index) => (
                                  <TimelineItem
                                    key={recipient.signatory_title}
                                    number={index + 1}
                                    title={
                                      <span className="text-base text-gray-700 sm:text-lg">
                                        {recipient.signatory_title}
                                      </span>
                                    }
                                    subtitle={
                                      recipient.signatory_source?._id ===
                                        "initiator" && (
                                        <span className="text-warning font-bold text-sm">
                                          {"you will specify this email"}
                                        </span>
                                      )
                                    }
                                    isLast={index === recipients.length - 1}
                                  />
                                ))}
                              </Timeline>
                            )}
                            <div className="mt-8 flex flex-col items-start gap-3 py-4">
                              <div className="flex flex-row gap-2">
                                <Button
                                  size="lg"
                                  className="w-full sm:w-auto text-lg"
                                  variant="outline"
                                  onClick={() => setIsPreviewOpen(true)}
                                >
                                  <Eye className="w-5 h-5" />
                                  Preview PDF
                                </Button>
                                <Button
                                  size="lg"
                                  className="w-full sm:w-auto text-lg"
                                  onClick={() =>
                                    void handleSigningPartiesSubmit()
                                  }
                                >
                                  <PenLineIcon className="w-5 h-5" />
                                  Sign via BetterInternship
                                </Button>
                              </div>
                              <Button
                                variant="link"
                                className="h-auto p-0 sm:text-base"
                              >
                                or print for wet signature instead
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <>
                        <div className="text-xl mt-4">
                          {recipients.length
                            ? "These people will receive this form, in this order:"
                            : "This form does not require any signatures."}
                        </div>

                        <Timeline>
                          {recipients.map((recipient, index) => (
                            <TimelineItem
                              key={recipient.signatory_title}
                              number={index + 1}
                              title={
                                <span className="text-base text-gray-700 sm:text-lg">
                                  {recipient.signatory_title}
                                </span>
                              }
                              subtitle={
                                recipient.signatory_source?._id ===
                                  "initiator" && (
                                  <span className="text-warning font-bold text-sm">
                                    {"you will specify this email"}
                                  </span>
                                )
                              }
                              isLast={index === recipients.length - 1}
                            />
                          ))}
                        </Timeline>
                        <div className="mt-8 flex flex-col items-start gap-3 border-b border-gray-200 pt-4 pb-8">
                          <div className="flex flex-row gap-2">
                            <Button
                              size="lg"
                              className="w-full sm:w-auto text-lg"
                              variant="outline"
                              onClick={() => setIsPreviewOpen(true)}
                            >
                              <Eye className="w-5 h-5" />
                              Preview PDF
                            </Button>
                            <Button
                              size="lg"
                              className="w-full sm:w-auto text-lg"
                              onClick={() => void handleSigningPartiesSubmit()}
                            >
                              <PenLineIcon className="w-5 h-5" />
                              Sign via BetterInternship
                            </Button>
                          </div>
                          <Button
                            variant="link"
                            className="h-auto p-0 sm:text-base"
                          >
                            or print for wet signature instead
                          </Button>
                        </div>
                      </>
                    )}
                    <FormHistoryView
                      forms={generatedForms ?? []}
                      formLabel={form.formLabel}
                    ></FormHistoryView>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto my-auto flex flex-col items-center gap-7">
              <FileSearch className="w-20 h-20 opacity-40" />
              {sortedTemplates.length ? (
                <div className="opacity-50">
                  Click on a form template to view.
                </div>
              ) : (
                <div className="opacity-50">
                  We don't have form templates for your department.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      {form.document.url && (
        <FlowTestPreviewModal
          documentUrl={form.document.url}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
