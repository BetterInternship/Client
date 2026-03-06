import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormTemplate } from "@/lib/db/use-moa-backend";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";

export const FormTemplatesList = ({
  templates,
  selectedTemplate,
  setSelectedTemplate,
}: {
  templates: FormTemplate[];
  selectedTemplate?: FormTemplate;
  setSelectedTemplate: (template: FormTemplate) => void;
}) => {
  const form = useFormRendererContext();
  const { isMobile } = useAppContext();

  return (
    <div className="space-y-4">
      {templates?.map((template) => {
        const isActive = template.formName === selectedTemplate?.formName;
        return (
          <button
            key={template.formName}
            type="button"
            onClick={() => {
              setSelectedTemplate(template);
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
                  <h2
                    className={cn(
                      "text-lg font-semibold leading-tight text-gray-900 sm:text-xl",
                      isMobile ? "" : "truncate whitespace-nowrap",
                    )}
                  >
                    {template.formLabel}
                  </h2>
                </div>
                <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
};
