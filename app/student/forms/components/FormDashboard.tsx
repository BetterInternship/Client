"use client";

import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Divider } from "@/components/ui/divider";
import { FormTemplate } from "@/lib/db/use-moa-backend";
import { Loader } from "@/components/ui/loader";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormSigningLayout } from "./FormSigningLayout";
import { IFormSigningParty } from "@betterinternship/core/forms";
import { FormHistoryView } from "@/components/forms/FormHistoryView";
import { FormTemplatesList } from "./FormTemplatesList";
import { FormActionButtons } from "./FormActionButtons";
import { FormActionAccordion } from "./FormActionAccordion";
import { FormSigningPartyTimeline } from "./FormSigningPartyTimeline";

export default function FormDashboard({
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
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>();
  const [noEsign, setNoEsign] = useState(false);
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

  const handleSignViaBetterInternship = () => {
    setIsSigningFlow(true);
    setNoEsign(false);
  };

  const handlePrintForWetSignature = () => {
    setIsSigningFlow(true);
    setNoEsign(true);
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
              <FormTemplatesList
                templates={sortedTemplates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
              />
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
          {selectedTemplate ? (
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
                <FormSigningLayout
                  formLabel={selectedTemplate?.formLabel}
                  documentUrl={form.document.url}
                  recipients={recipients}
                  noEsign={noEsign}
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
                {form.loading ||
                form.document.name !== selectedTemplate.formName ? (
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
                      <FormActionAccordion
                        handleSignViaBetterInternship={
                          handleSignViaBetterInternship
                        }
                        handlePrintForWetSignature={handlePrintForWetSignature}
                      />
                    ) : (
                      <>
                        <div className="text-xl mt-4">
                          {recipients.length > 1
                            ? "These people will receive this form, in this order:"
                            : "This form does not require any signatures."}
                        </div>

                        <FormSigningPartyTimeline />
                        <div className="mt-8 flex flex-col items-start gap-3 border-b border-gray-200 pt-4 pb-8">
                          <FormActionButtons
                            handleSignViaBetterInternship={
                              handleSignViaBetterInternship
                            }
                            handlePrintForWetSignature={
                              handlePrintForWetSignature
                            }
                          />
                        </div>
                      </>
                    )}
                    <FormHistoryView
                      forms={generatedForms ?? []}
                      formLabel={form.formLabel}
                    />
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
    </div>
  );
}
