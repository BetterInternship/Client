"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PenLineIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { Divider } from "@/components/ui/divider";
import { FormTemplate } from "@/lib/db/use-moa-backend";
import { Loader } from "@/components/ui/loader";
import { FormInput } from "@/components/EditForm";
import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FlowTestPreviewModal } from "./FlowTestPreviewModal";
import useModalRegistry from "@/components/modals/modal-registry";
import { useFormFiller } from "@/components/features/student/forms/form-filler.ctx";
import { useMyAutofill } from "@/hooks/use-my-autofill";
import { FormAndDocumentLayout } from "@/components/features/student/forms/FormFlowRouter";

export default function FlowTestPage({
  formTemplates,
  isLoading,
}: {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSigningFlow, setIsSigningFlow] = useState(false);
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const recipients = form.formMetadata.getSigningParties();
  const signingPartyBlocks =
    form.formMetadata.getSigningPartyBlocks("initiator");

  const modalRegistry = useModalRegistry();
  const autofillValues = useMyAutofill();
  const filteredTemplates = useMemo(
    () =>
      formTemplates
        ?.filter((template) =>
          searchQuery
            .toLowerCase()
            .split(" ")
            .every((q) => template.formLabel.toLowerCase().includes(q)),
        )
        ?.toSorted((a, b) => {
          const aLabel = a.formLabel.replaceAll(/[()[\]\-,]/g, "");
          const bLabel = b.formLabel.replaceAll(/[()[\]\-,]/g, "");
          return aLabel.localeCompare(bLabel);
        }) ?? [],
    [formTemplates, searchQuery],
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
          <div className="flex h-28 items-center bg-gray-50 border-b border-gray-200 px-10">
            <div className="flex flex-col w-full gap-2">
              <h1 className="text-2xl tracking-tight text-gray-700 sm:text-2xl font-bold">
                Form Templates
              </h1>
              <div className="flex flex-row w-full">
                <FormInput
                  className="flex-1 rounded-r-none border-r-0"
                  value={searchQuery}
                  setter={(value) => setSearchQuery(value)}
                ></FormInput>
                <Button className="rounded-l-none border-l-0 bg-slate-700 pointer-events-none">
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {filteredTemplates?.map((template) => {
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
          </div>
        </aside>

        <section
          className={cn(
            "flex min-h-0 flex-col bg-background overflow-hidden transition-[transform,opacity] duration-500 ease-in-out will-change-transform",
            isSigningFlow
              ? "md:-translate-x-2 opacity-100"
              : "md:translate-x-0 opacity-100",
          )}
        >
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
              <div className="relative h-full min-h-0 flex flex-col">
                <Button
                  variant="outline"
                  className="absolute text-sm my-6 mx-10"
                  onClick={() => setIsSigningFlow(false)}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="min-h-0 flex-1">
                  <FormAndDocumentLayout formName={selectedTemplateName} />
                </div>
              </div>
            </div>

            <div
              className={cn(
                "absolute inset-0 min-h-0 overflow-y-auto transition-opacity duration-300 ease-in-out",
                isSigningFlow
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 pointer-events-auto",
              )}
            >
              {form.loading || form.document.name !== selectedTemplateName ? (
                <Loader>Loading form template...</Loader>
              ) : (
                <div className="mx-auto flex max-w-4xl flex-col gap-4 bg-white h-full px-12 py-20">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                      {selectedTemplate?.formLabel}
                    </h3>
                    <Divider />
                  </div>

                  <div className="text-xl mt-4">
                    {recipients.length
                      ? "These people will receive a copy of this form, in this order:"
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
                          recipient.signatory_source?._id === "initiator" && (
                            <span className="text-warning font-bold text-sm">
                              {"you will specify this email"}
                            </span>
                          )
                        }
                        isLast={index === recipients.length - 1}
                      />
                    ))}
                  </Timeline>
                  <div className="flex flex-col items-start gap-3 border-t border-gray-200 pt-4 mt-8">
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
                          modalRegistry.specifySigningParties.open(
                            form.fields,
                            formFiller,
                            signingPartyBlocks,
                            handleSigningPartiesSubmit,
                            autofillValues,
                          )
                        }
                      >
                        <PenLineIcon className="w-5 h-5" />
                        Sign via BetterInternship
                      </Button>
                    </div>
                    <Button variant="link" className="h-auto p-0 sm:text-base">
                      or print for wet signature instead
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
