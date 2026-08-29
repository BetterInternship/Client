"use client";

import { FormCheckbox } from "@/components/EditForm";
import { MDXEditor } from "@/components/MDXEditor";
import { Card, PageHeader } from "@betterinternship/components";
import { Label } from "@betterinternship/components";
import { Job } from "@/lib/db/db.types";
import { DetailsStepIllustration } from "./illustrations/DetailsStepIllustration";

interface DetailsStepProps {
  formData: Partial<Job>;
  setField: (key: keyof Job, value: any) => void;
}

export const DetailsStep = ({ formData, setField }: DetailsStepProps) => {
  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between">
        <PageHeader
          title="3. Details"
          description="Describe the role and what you're looking for."
        />
        <DetailsStepIllustration className="w-24" />
      </div>

      <Card className="px-4 space-y-6">
        {/* Description — merged with requirements */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Description
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">
            Describe the role, tasks, and any requirements (course, skills,
            qualifications). Add a "Requirements:" heading at the end if needed.
          </p>
          <div className="relative">
            <MDXEditor
              className="min-h-[240px] border border-gray-200 rounded-[0.33em] overflow-y-auto"
              markdown={formData.description ?? ""}
              onChange={(value) => setField("description", value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: include requirements directly here.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">(Optional)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() =>
                setField("internship_preferences", {
                  ...formData.internship_preferences,
                  require_github:
                    !formData.internship_preferences?.require_github,
                })
              }
              className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit ${formData.internship_preferences?.require_github ? "border-primary border-opacity-85" : "border-gray-200 hover:border-gray-300"}`}
            >
              <FormCheckbox
                checked={
                  formData.internship_preferences?.require_github ?? false
                }
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    require_github: v,
                  })
                }
              />
              <div>
                <Label className="text-xs font-medium text-gray-900">
                  GitHub Repository
                </Label>
                <p className="text-xs text-muted-foreground">
                  Require GitHub link
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                setField("internship_preferences", {
                  ...formData.internship_preferences,
                  require_portfolio:
                    !formData.internship_preferences?.require_portfolio,
                })
              }
              className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit ${formData.internship_preferences?.require_portfolio ? "border-primary border-opacity-85" : "border-gray-200 hover:border-gray-300"}`}
            >
              <FormCheckbox
                checked={
                  formData.internship_preferences?.require_portfolio ?? false
                }
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    require_portfolio: v,
                  })
                }
              />
              <div>
                <Label className="text-xs font-medium text-gray-900">
                  Portfolio
                </Label>
                <p className="text-xs text-muted-foreground">
                  Require portfolio link
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
