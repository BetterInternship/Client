"use client";

import { FormInput } from "@/components/EditForm";
import { GroupableRadioDropdown } from "@/components/ui/dropdown";
import { Job } from "@/lib/db/db.types";
import { AnimatedCount, Card, PageHeader } from "@betterinternship/components";
import { Input } from "@betterinternship/components";
import { Textarea } from "@/components/ui/textarea";
import { BasicStepIllustration } from "./illustrations/BasicStepIllustration";

interface BasicStepProps {
  formData: Partial<Job>;
  fieldSetter: (key: keyof Job) => (value: any) => void;
  setField: (key: keyof Job, value: any) => void;
  categoryOptions: { id: string | number; name: string }[];
  isSuperListing?: boolean;
  challengeTitle?: string;
  challengeDescription?: string;
  setChallengeTitle?: (v: string) => void;
  setChallengeDescription?: (v: string) => void;
}

const BasicStep = ({
  formData,
  fieldSetter,
  setField,
  categoryOptions,
  isSuperListing = false,
  challengeTitle = "",
  challengeDescription = "",
  setChallengeTitle,
  setChallengeDescription,
}: BasicStepProps) => {
  const titleLength = (formData.title || "").length;
  const categoryValue = formData.internship_preferences
    ?.job_category_ids as any;

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between">
        <PageHeader
          title="1. Basic information"
          description="Start with the essentials. This helps students find your listing."
        />
        <BasicStepIllustration className="w-24" />
      </div>

      <Card className="px-4">
        {isSuperListing && (
          <div className="space-y-4 pb-6 mb-6 border-b">
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Challenge Title
                </span>
                <span className="text-destructive text-xs">*</span>
              </div>
              <Input
                value={challengeTitle}
                onChange={(e) => setChallengeTitle?.(e.target.value)}
                className="text-base font-medium h-10"
                placeholder="Enter challenge title..."
                maxLength={120}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {challengeTitle.length}/120 characters
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Challenge Description
                </span>
                <span className="text-destructive text-xs">*</span>
              </div>
              <Textarea
                value={challengeDescription}
                onChange={(e) => setChallengeDescription?.(e.target.value)}
                className="text-sm min-h-[120px]"
                placeholder="Describe the challenge submission expected from applicants..."
                maxLength={4000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {challengeDescription.length}/4000 characters
              </p>
            </div>
          </div>
        )}
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
          <p className="text-xs text-muted-foreground tabular-nums shrink-0 text-right">
            <AnimatedCount value={titleLength} />
            /100
          </p>
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
        </div>

        {/* Category */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Category
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
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
            className="w-fit"
          />
        </div>
      </Card>
    </div>
  );
};

export { BasicStep };
