import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormTemplate } from "@/lib/db/use-moa-backend";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-2.5">
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
            className="group w-full text-left"
          >
            <Card
              className={cn(
                "rounded-[0.33em] border p-4 transition-all duration-200",
                isActive
                  ? "border-primary/40 bg-primary/10 shadow-sm ring-1 ring-primary/20"
                  : "border-gray-200/90 bg-white hover:border-primary/20 hover:bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2
                    className={cn(
                      "text-base font-semibold leading-snug text-gray-900 sm:text-lg whitespace-normal break-words",
                    )}
                  >
                    {template.formLabel}
                  </h2>
                </div>
                <ChevronRight
                  className={cn(
                    "mt-1 h-4 w-4 shrink-0 text-gray-400 transition-all duration-200",
                    isActive
                      ? "translate-x-0.5 text-primary/80"
                      : "group-hover:translate-x-0.5 group-hover:text-primary/70",
                  )}
                />
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
};
