"use client";

import { FormInput } from "@/components/EditForm";
import { GroupableRadioDropdown } from "@/components/ui/dropdown";
import { Job } from "@/lib/db/db.types";
import { Card, PageHeader } from "@betterinternship/components";

interface BasicStepProps {
  formData: Partial<Job>;
  fieldSetter: (key: keyof Job) => (value: any) => void;
  setField: (key: keyof Job, value: any) => void;
  categoryOptions: { id: string | number; name: string }[];
  step?: number;
  totalSteps?: number;
}

const BasicStep = ({
  formData,
  fieldSetter,
  setField,
  categoryOptions,
  step = 1,
  totalSteps = 3,
}: BasicStepProps) => {
  const titleLength = (formData.title || "").length;
  const categoryValue = formData.internship_preferences
    ?.job_category_ids as any;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Basic information"
        description="Start with the essentials. This helps students find your listing."
      />

      <Card className="px-4">
        {/* Title */}
        <div className="space-y-2">
          <FormInput
            label="Listing title"
            required
            value={formData.title ?? ""}
            setter={fieldSetter("title")}
            placeholder="e.g. Marketing Intern, Frontend Developer Intern"
            maxLength={100}
            className="h-10"
          />
          <div className="flex justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Keep it clear and specific. “Frontend Intern” works better than
              “Intern”.
            </p>
            <p className="text-xs text-muted-foreground tabular-nums shrink-0">
              {titleLength}/100
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <FormInput
            label="Location"
            required
            value={formData.location ?? ""}
            setter={fieldSetter("location")}
            placeholder="e.g. Makati City, Cebu City, or Remote"
            maxLength={100}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            Where will the intern work? You can change this later.
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Category
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">
            Choose a category that describes the job (like Cybersecurity, Legal,
            Design, etc.).
          </p>
          <GroupableRadioDropdown
            name="category"
            defaultValue={categoryValue}
            options={categoryOptions}
            onChange={(value) =>
              setField("internship_preferences", {
                ...formData.internship_preferences,
                job_category_ids: value,
              })
            }
            fallback="Select a category"
          />
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        You can edit these details anytime before publishing.
      </p>
    </div>
  );
};

export { BasicStep };
