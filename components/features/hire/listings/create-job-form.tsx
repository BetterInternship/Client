"use client";

import { usePostHog } from "@posthog/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedCount,
  Button,
  Input,
  PageContainer,
  cn,
} from "@betterinternship/components";
import {
  FormCheckBoxGroup,
  FormCheckbox,
  FormDatePicker,
  FormInput,
  LabelWithTooltip,
} from "@/components/EditForm";
import { MDXEditor } from "@/components/MDXEditor";
import {
  AutocompleteMulti,
  type IAutocompleteOption,
} from "@/components/ui/autocomplete";
import { GroupableRadioDropdown } from "@/components/ui/dropdown";
import { Textarea } from "@/components/ui/textarea";
import { useMoaUniversities } from "@/hooks/use-employer-api";
import { Job } from "@/lib/db/db.types";

interface CreateJobProps {
  formData: Partial<Job>;
  setField: (key: keyof Job, value: any) => void;
  categoryOptions: { id: string | number; name: string }[];
  job_pay_freq: { id: string | number; name: string }[];
  isSuperListing?: boolean;
  challengeTitle?: string;
  challengeDescription?: string;
  setChallengeTitle?: (v: string) => void;
  setChallengeDescription?: (v: string) => void;
}

type InternshipType = "credited" | "voluntary";

const INTERNSHIP_TYPE_OPTIONS: IAutocompleteOption<InternshipType>[] = [
  { id: "credited", name: "Credited (Practicum)" },
  { id: "voluntary", name: "Voluntary" },
];

const WORK_MODE_OPTIONS: IAutocompleteOption<number>[] = [
  { id: 0, name: "On-site" },
  { id: 1, name: "Hybrid" },
  { id: 2, name: "Remote" },
];

const WORK_LOAD_OPTIONS = [
  { value: 1, label: "Part-time", description: "(Approx 20 hours/week)" },
  { value: 2, label: "Full-time", description: "(Approx 40 hours/week)" },
  { value: 3, label: "Flexible/Project-based" },
];

// `allowance` has always been stored inverted: 0 = paid, 1 = unpaid.
const PAID_OPTIONS = [
  { value: 1, label: "No" },
  { value: 0, label: "Yes" },
];

export const CreateJobForm = ({
  formData,
  setField,
  categoryOptions,
  job_pay_freq,
  isSuperListing = false,
  challengeTitle = "",
  challengeDescription = "",
  setChallengeTitle,
  setChallengeDescription,
}: CreateJobProps) => {
  const posthog = usePostHog();
  const { universityIds } = useMoaUniversities();
  const activeMoaCount = universityIds?.length ?? 0;

  const prefs = formData.internship_preferences;
  const titleLength = (formData.title || "").length;
  const categoryValue = prefs?.job_category_ids;
  const internshipTypes = prefs?.internship_types ?? [];

  const setPrefs = (patch: NonNullable<Job["internship_preferences"]>) =>
    setField("internship_preferences", {
      ...formData.internship_preferences,
      ...patch,
    });

  const handleInternshipTypesChange = (next: InternshipType[]) => {
    const wasCredited = internshipTypes.includes("credited");
    const isCredited = next.includes("credited");
    if (wasCredited !== isCredited) {
      posthog.capture("hire_credited_toggle_clicked", {
        value: isCredited,
        activeMoaCount,
        source: "create_listing_setup",
      });
    }
    setPrefs({ internship_types: next });
  };

  const missingInOptional = [
    !prefs?.job_commitment_ids?.length && "Work load",
    formData.allowance === undefined && "Paid",
  ].filter(Boolean) as string[];

  return (
    <PageContainer className="mt-20 pb-20 md:pb-0">
      <div className="flex flex-col gap-4">
        {/* Essentials */}
        <div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1.2fr_1fr_1fr]">
            <div className="sm:col-span-2 lg:col-span-1">
              <FormInput
                label="Listing title"
                required
                value={formData.title ?? ""}
                setter={(v) => setField("title", v)}
                placeholder="e.g. Marketing Intern"
                maxLength={100}
                className="h-9"
                labelAddon={
                  <span className="text-xs text-muted-foreground tabular-nums">
                    <AnimatedCount value={titleLength} />
                    /100
                  </span>
                }
              />
            </div>

            <FormInput
              label="Location"
              required
              value={formData.location ?? ""}
              setter={(v) => setField("location", v)}
              placeholder="e.g. Makati City, or Remote"
              maxLength={100}
              className="h-9"
            />

            <div>
              <LabelWithTooltip label="Category" required />
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

            <div>
              <LabelWithTooltip label="Work mode" required />
              <AutocompleteMulti
                options={WORK_MODE_OPTIONS}
                value={prefs?.job_setup_ids ?? []}
                setter={(next) => setPrefs({ job_setup_ids: next })}
                placeholder="Select"
                mobileDropdownMode="inline"
              />
            </div>

            <div>
              <LabelWithTooltip label="Intern type" required />
              <AutocompleteMulti
                options={INTERNSHIP_TYPE_OPTIONS}
                value={internshipTypes}
                setter={handleInternshipTypesChange}
                placeholder="Select"
                mobileDropdownMode="inline"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <LabelWithTooltip label="Description" required />
          <p className="mb-2 text-xs text-muted-foreground">
            Describe the role, tasks, and any requirements (course, skills,
            qualifications).
          </p>
          <div className="relative h-[clamp(240px,36vh,460px)]">
            <MDXEditor
              className="h-full overflow-y-auto rounded-[0.33em] border border-gray-200"
              markdown={formData.description ?? ""}
              onChange={(value) => setField("description", value)}
            />
          </div>
        </div>

        {/* Super listings also need a challenge for applicants */}
        {isSuperListing && (
          <div className="p-4">
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-[1fr_2fr]">
              <div>
                <LabelWithTooltip
                  label="Challenge title"
                  required
                  labelAddon={
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {challengeTitle.length}/120
                    </span>
                  }
                />
                <Input
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle?.(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="Enter challenge title..."
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <LabelWithTooltip
                  label="Challenge description"
                  required
                  labelAddon={
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {challengeDescription.length}/4000
                    </span>
                  }
                />
                <Textarea
                  value={challengeDescription}
                  onChange={(e) => setChallengeDescription?.(e.target.value)}
                  className="min-h-20 text-sm"
                  placeholder="Describe the challenge submission expected from applicants..."
                  maxLength={4000}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Optional details */}
        <Accordion
          type="single"
          collapsible
          className="w-full border rounded-[0.33em]"
        >
          <AccordionItem
            value="optional-details"
            className="[&_[data-slot=accordion-content][data-state=open]]:overflow-visible"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-sm font-medium text-gray-900">
                    Optional details
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Work load, pay, requirements, deadline
                  </span>
                </span>
                {missingInOptional.length > 0 && (
                  <span className="text-xs font-normal text-destructive">
                    Required: {missingInOptional.join(", ")}
                  </span>
                )}
              </span>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-gray-200 p-4 md:grid-cols-2">
                {/* Work load */}
                <div className="md:col-span-2">
                  <FormCheckBoxGroup
                    label="Work load"
                    required
                    hint={null}
                    showSelectedCount={false}
                    values={prefs?.job_commitment_ids ?? []}
                    options={WORK_LOAD_OPTIONS}
                    setter={(v) =>
                      setPrefs({ job_commitment_ids: v as number[] })
                    }
                  />
                </div>

                {/* Paid */}
                <div>
                  <LabelWithTooltip label="Is the internship paid?" required />
                  <div className="flex gap-2">
                    {PAID_OPTIONS.map((option) => {
                      const selected = formData.allowance === option.value;
                      return (
                        <Button
                          key={option.label}
                          type="button"
                          size="sm"
                          variant={selected ? undefined : "outline"}
                          aria-pressed={selected}
                          onClick={() => setField("allowance", option.value)}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                  {formData.allowance === 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-3 border-l-2 border-gray-300 pl-4 sm:grid-cols-2">
                      <div>
                        <LabelWithTooltip label="Allowance (optional)" />
                        <Input
                          type="number"
                          value={formData.salary ?? ""}
                          onChange={(e) =>
                            setField(
                              "salary",
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value, 10),
                            )
                          }
                          placeholder="Amount"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <LabelWithTooltip
                          label="Pay frequency"
                          required={!!formData.salary}
                        />
                        <GroupableRadioDropdown
                          name="pay_freq"
                          defaultValue={formData.salary_freq}
                          options={job_pay_freq}
                          onChange={(value) => setField("salary_freq", value)}
                          disabled={!formData.salary}
                          fallback="Select"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Requirements */}
                  <div>
                    <LabelWithTooltip label="Require applicants to submit" />
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <FormCheckbox
                        checked={prefs?.require_github ?? false}
                        setter={(v) => setPrefs({ require_github: v })}
                        sentence="GitHub repository"
                      />
                      <FormCheckbox
                        checked={prefs?.require_portfolio ?? false}
                        setter={(v) => setPrefs({ require_portfolio: v })}
                        sentence="Portfolio link"
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <FormDatePicker
                    label="Application deadline"
                    date={formData.application_deadline ?? undefined}
                    setter={(v) => setField("application_deadline", v)}
                    placeholder="No deadline"
                    disabledDays={{ before: new Date() }}
                    className="w-full sm:w-56"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PageContainer>
  );
};
