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
  FormCheckbox,
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
  className?: string;
  /** Super listings only: the challenge applicants must complete. */
  challenge?: {
    title: string;
    description: string;
    setTitle: (v: string) => void;
    setDescription: (v: string) => void;
  };
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

const WORK_LOAD_OPTIONS: IAutocompleteOption<number>[] = [
  { id: 1, name: "Part-time (approx. 20 hours/week)" },
  { id: 2, name: "Full-time (approx. 40 hours/week)" },
  { id: 3, name: "Flexible/Project-based" },
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
  className,
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

  return (
    <PageContainer className={cn("mt-20 pb-20 lg:pb-0", className)}>
      <div className="flex flex-col gap-4">
        {/* Essentials */}
        <div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-flow-col lg:grid-cols-[3fr_1fr_1fr] lg:grid-rows-[auto_auto]">
            <div className="sm:col-span-2 lg:col-span-1">
              <FormInput
                label="Title"
                required
                value={formData.title ?? ""}
                setter={(v) => setField("title", v)}
                placeholder="e.g. Marketing Intern"
                maxLength={100}
                labelAddon={
                  <span className="flex h-5 items-center text-xs leading-none text-muted-foreground tabular-nums">
                    <AnimatedCount value={titleLength} />
                    /100
                  </span>
                }
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <FormInput
                label="Location"
                required
                value={formData.location ?? ""}
                setter={(v) => setField("location", v)}
                placeholder="e.g. Makati City, or Remote"
                maxLength={100}
              />
            </div>

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
              <LabelWithTooltip label="Intern type" required />
              <AutocompleteMulti
                options={INTERNSHIP_TYPE_OPTIONS}
                value={internshipTypes}
                setter={handleInternshipTypesChange}
                placeholder="Select"
                mobileDropdownMode="inline"
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
              <LabelWithTooltip label="Work load" required />
              <AutocompleteMulti
                options={WORK_LOAD_OPTIONS}
                value={prefs?.job_commitment_ids ?? []}
                setter={(next) => setPrefs({ job_commitment_ids: next })}
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
              className="h-full overflow-y-auto rounded-[0.33em] border border-gray-300"
              markdown={formData.description ?? ""}
              onChange={(value) => setField("description", value)}
            />
          </div>
        </div>

        {/* Optional details */}
        <Accordion
          type="single"
          collapsible
          className="w-full border border-gray-300 rounded-[0.33em]"
        >
          <AccordionItem
            value="optional-details"
            className="[&_[data-slot=accordion-content][data-state=open]]:overflow-visible"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="">Optional details</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Pay and requirements
                  </span>
                </span>
              </span>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-gray-300 p-4 md:grid-cols-2">
                {/* Paid */}
                <div>
                  <LabelWithTooltip label="Is the internship paid?" />
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
                          className="text-sm"
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
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PageContainer>
  );
};
