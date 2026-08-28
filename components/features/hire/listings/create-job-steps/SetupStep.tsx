"use client";

import {
  FormCheckbox,
  FormCheckBoxGroup,
  FormDatePicker,
  FormRadio,
} from "@/components/EditForm";
import { Card, PageHeader } from "@betterinternship/components";
import { GroupableRadioDropdown } from "@/components/ui/dropdown";
import { Input, Label } from "@betterinternship/components";
import { cn } from "@betterinternship/components";
import { useMobile } from "@/hooks/use-mobile";
import { Job } from "@/lib/db/db.types";

interface SetupStepProps {
  formData: Partial<Job>;
  setField: (key: keyof Job, value: any) => void;
  fieldSetter: (key: keyof Job) => (value: any) => void;
  job_pay_freq: { id: string | number; name: string }[];
}

export const SetupStep = ({
  formData,
  setField,
  fieldSetter,
  job_pay_freq,
}: SetupStepProps) => {
  const { isMobile } = useMobile();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internship setup"
        description="Tell us how this internship will work."
      />

      <Card className="px-4 space-y-6">
        {/* Internship type */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Are you hiring credited and/or voluntary interns?
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() =>
                setField("internship_preferences", {
                  ...formData.internship_preferences,
                  internship_types:
                    formData.internship_preferences?.internship_types?.includes(
                      "credited",
                    )
                      ? [
                          ...formData.internship_preferences?.internship_types.filter(
                            (it) => it !== "credited",
                          ),
                        ]
                      : [
                          ...(formData.internship_preferences
                            ?.internship_types ?? []),
                          "credited",
                        ],
                })
              }
              className="flex items-start gap-4 p-3 border border-gray-200 hover:border-gray-300 rounded-[0.33em] cursor-pointer h-fit"
            >
              <FormCheckbox
                checked={formData.internship_preferences?.internship_types?.includes(
                  "credited",
                )}
              />
              <div>
                <Label className="text-xs font-medium text-gray-900">
                  Credited Interns (Practicum)
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Required by schools (300-600 hours) and needs Memorandum of
                  Agreement (MOA) from university
                </p>
              </div>
            </div>
            <div
              onClick={() =>
                setField("internship_preferences", {
                  ...formData.internship_preferences,
                  internship_types:
                    formData.internship_preferences?.internship_types?.includes(
                      "voluntary",
                    )
                      ? [
                          ...formData.internship_preferences?.internship_types.filter(
                            (it) => it !== "voluntary",
                          ),
                        ]
                      : [
                          ...(formData.internship_preferences
                            ?.internship_types ?? []),
                          "voluntary",
                        ],
                })
              }
              className="flex items-start gap-4 p-3 border border-gray-200 hover:border-gray-300 rounded-[0.33em] cursor-pointer h-fit"
            >
              <FormCheckbox
                checked={formData.internship_preferences?.internship_types?.includes(
                  "voluntary",
                )}
              />
              <div>
                <Label className="text-xs font-medium text-gray-900">
                  Voluntary Interns
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Flexible schedule, available for hire anytime, and work is
                  usually on top of academic load
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Load */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Work Load
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <FormCheckBoxGroup
            required
            values={formData.internship_preferences?.job_commitment_ids ?? []}
            options={[
              {
                value: 1,
                label: "Part-time",
                description: "(Approx 20 hours/week)",
              },
              {
                value: 2,
                label: "Full-time",
                description: "(Approx 40 hours/week)",
              },
              {
                value: 3,
                label: "Flexible/Project-based",
              },
            ]}
            setter={(v) =>
              setField("internship_preferences", {
                ...formData.internship_preferences,
                job_commitment_ids: v,
              })
            }
          />
        </div>

        {/* Work Mode */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Work Mode
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <FormCheckBoxGroup
            required
            values={formData.internship_preferences?.job_setup_ids ?? []}
            options={[
              { value: 0, label: "On-site" },
              { value: 1, label: "Hybrid" },
              { value: 2, label: "Remote" },
            ]}
            setter={(v) =>
              setField("internship_preferences", {
                ...formData.internship_preferences,
                job_setup_ids: v,
              })
            }
          />
        </div>

        {/* Paid */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Is the internship paid?
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <Card
            className={`${formData.allowance === undefined ? "border-gray-200" : "border-primary border-opacity-85"}`}
          >
            <div className="p-3">
              <FormRadio
                required
                options={[
                  { value: "1", label: "No" },
                  { value: "0", label: "Yes" },
                ]}
                value={formData.allowance?.toString() ?? undefined}
                setter={(value) => fieldSetter("allowance")(parseInt(value))}
              />
              {formData.allowance === 0 && (
                <div
                  className={cn(
                    "border-l-2 border-gray-300 pl-4 gap-4 mt-4",
                    isMobile ? "" : "flex flex-row",
                  )}
                >
                  <div className="space-y-2 mb-4 flex-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Allowance{" "}
                      <span
                        className={cn(
                          "text-muted-foreground/50",
                          isMobile ? "text-xs" : "text-xs",
                        )}
                      >
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.salary ?? ""}
                      onChange={(e) => setField("salary", parseInt(e.target.value))}
                      placeholder="Enter salary amount"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label
                      className={cn(
                        "text-xs font-medium",
                        !formData.salary
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground",
                      )}
                    >
                      Pay Frequency{" "}
                      {!formData.salary ? null : (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <GroupableRadioDropdown
                      name="pay_freq"
                      defaultValue={formData.salary_freq}
                      options={job_pay_freq}
                      onChange={fieldSetter("salary_freq")}
                      disabled={!formData.salary}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Start date */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              When are you accepting interns for this listing?
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <Card
            className={`${formData.internship_preferences?.expected_start_date === undefined ? "border-gray-200" : "border-primary border-opacity-85"}`}
          >
            <div className="p-3">
              <FormRadio
                required
                options={[
                  { value: "true", label: "As soon as possible" },
                  { value: "false", label: "I have a future date in mind" },
                ]}
                value={
                  (formData.internship_preferences?.expected_start_date ===
                    undefined) +
                  ""
                }
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    expected_start_date: v === "true" ? undefined : 0,
                  })
                }
              />
              {formData.internship_preferences?.expected_start_date !==
                undefined && (
                <div className="flex flex-row gap-4 mt-4 border-l-2 border-gray-300 pl-4">
                  <div className="space-y-2">
                    <Label className="flex flex-row text-xs font-medium text-muted-foreground">
                      Start Date{" "}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <FormDatePicker
                      date={
                        formData.internship_preferences
                          ?.expected_start_date ?? undefined
                      }
                      setter={(v) =>
                        setField("internship_preferences", {
                          ...formData.internship_preferences,
                          expected_start_date: v,
                        })
                      }
                      disabledDays={{ before: new Date() }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        You can edit the setup anytime before publishing.
      </p>
    </div>
  );
};
