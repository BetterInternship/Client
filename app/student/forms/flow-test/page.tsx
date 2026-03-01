"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, SearchIcon } from "lucide-react";
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
  const form = useFormRendererContext();
  const recipients = form.formMetadata.getSigningParties();
  const filteredTemplates = useMemo(
    () =>
      formTemplates
        .filter((template) =>
          searchQuery
            .toLowerCase()
            .split(" ")
            .every((q) => template.formLabel.toLowerCase().includes(q)),
        )
        .toSorted((a, b) => {
          const aLabel = a.formLabel.replaceAll(/[()[\]\-,]/g, "");
          const bLabel = b.formLabel.replaceAll(/[()[\]\-,]/g, "");
          return aLabel.localeCompare(bLabel);
        }),
    [formTemplates, searchQuery],
  );

  useEffect(() => {
    if (selectedTemplateName) form.updateFormName(selectedTemplateName);
  }, [selectedTemplateName, form]);

  if (isLoading) return <Loader>Loading form templates...</Loader>;

  return (
    <div className="h-full min-h-0 w-full bg-gray-50">
      <div className="h-[2px] w-full bg-gray/60" />

      <div className="grid h-[calc(100%-2px)] min-h-0 grid-cols-[480px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-gray-300 bg-white md:border-b-0 md:border-r">
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
                    onClick={() => setSelectedTemplateName(template.formName)}
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

        <section className="flex min-h-0 flex-col bg-background">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 bg-gray-100">
            {form.loading ? (
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
                      className="w-full sm:w-auto bg-black opacity-80 hover:bg-black/70 text-lg"
                      onClick={() => setIsPreviewOpen(true)}
                    >
                      Preview PDF
                    </Button>
                    <Button size="lg" className="w-full sm:w-auto text-lg">
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
