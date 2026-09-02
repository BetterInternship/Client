"use client";

import {
  FormCheckBoxGroup,
  FormDatePicker,
  FormRadio,
} from "@/components/EditForm";
import { Card, PageHeader } from "@betterinternship/components";
import { GroupableRadioDropdown } from "@/components/ui/dropdown";
import { Input, Label, Button } from "@betterinternship/components";
import { cn } from "@betterinternship/components";
import { useMobile } from "@/hooks/use-mobile";
import { useMoaUniversities } from "@/hooks/use-employer-api";
import { useModalRegistry } from "@/components/modals/modal-registry";
import { usePostHog } from "@posthog/react";
import { Job } from "@/lib/db/db.types";
import { SetupStepIllustration } from "./illustrations/SetupStepIllustration";
import { FileUp, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useBlurTransition } from "@/components/animata/blur";

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
  const { universityIds } = useMoaUniversities();
  const activeMoaCount = universityIds?.length ?? 0;
  const registry = useModalRegistry();
  const posthog = usePostHog();

  const internshipTypes =
    formData.internship_preferences?.internship_types ?? [];
  const isCreditedSelected = internshipTypes.includes("credited");

  useEffect(() => {
    posthog.capture("hire_credited_benefits_viewed", {
      source: "create_listing_setup",
      activeMoaCount,
      isCreditedSelected,
    });
  }, [activeMoaCount, isCreditedSelected, posthog]);

  const handleInternshipTypeToggle = (
    value: string | number,
    checked: boolean,
  ) => {
    if (value === "credited") {
      posthog.capture("hire_credited_toggle_clicked", {
        value: checked,
        activeMoaCount,
        source: "create_listing_setup",
      });
    }
  };

  const handleUploadClick = () => {
    posthog.capture("hire_moa_upload_started", {
      source: "create_listing_setup_inline",
      activeMoaCount,
    });
    registry.moaUpload.open({
      onDone: () => {
        posthog.capture("hire_moa_upload_completed", {
          source: "create_listing_setup",
        });
      },
    });
  };

  const blurTransition = useBlurTransition();

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between">
        <PageHeader
          title="2. Internship setup"
          description="Tell us how this internship will work."
        />
        <SetupStepIllustration className="w-24" />
      </div>

      <Card className="px-4 space-y-6">
        {/* Internship type */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              What types of interns are you searching for?
            </span>
            <span className="text-destructive text-xs">*</span>
          </div>
          <FormCheckBoxGroup
            columns={2}
            values={internshipTypes}
            options={[
              {
                value: "credited",
                label: "Credited (Practicum)",
                description:
                  "Practicum students needing a Memorandum of Agreement.",
              },
              {
                value: "voluntary",
                label: "Voluntary",
                description: "Flexible, non-credit internships",
              },
            ]}
            onToggle={handleInternshipTypeToggle}
            setter={(v) =>
              setField("internship_preferences", {
                ...formData.internship_preferences,
                internship_types: v,
              })
            }
          />

          {/* Inline credited benefits - nudge, not gate */}
          <div className="space-y-2">
            <AnimatePresence>
              {isCreditedSelected && (
                <motion.div {...blurTransition}>
                  <Card className="py-3 px-4 bg-primary/10 border-primary">
                    <div className="space-y-1">
                      {activeMoaCount > 0 ? (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {isCreditedSelected
                              ? "You're accepting credited interns"
                              : "Get interns 10x faster by hiring credited interns"}
                          </p>
                          <p className="text-xs leading-relaxed">
                            You have {activeMoaCount} active MOA
                            {activeMoaCount > 1 ? "s" : ""} with{" "}
                            {activeMoaCount}{" "}
                            {activeMoaCount === 1
                              ? "university"
                              : "universities"}
                            . If you want to partner with more universities, you
                            can go to the{" "}
                            <Link
                              href="https://moa.betterinternship.com/company/verification"
                              className="font-bold underline"
                            >
                              Partners Portal
                            </Link>
                            {". "}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {isCreditedSelected
                              ? "You're not yet verified"
                              : "Get verified to reach more students"}
                          </p>
                          <p className="text-xs leading-relaxed">
                            Credited interns require a Memorandum of Agreement
                            (MOA). Verify instantly via the{" "}
                            <Link
                              href="https://moa.betterinternship.com/company/verification"
                              className="font-bold underline"
                            >
                              Partners Portal
                            </Link>{" "}
                            or upload an existing file.
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            posthog.capture("hire_moa_iom_link_clicked", {
                              source: "create_listing_setup",
                            });
                            window.open(
                              "https://moa.betterinternship.com/company/verification",
                              "_blank",
                            );
                          }}
                          className="h-8 gap-1"
                        >
                          Get instant MOAs <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUploadClick}
                          className="h-8 gap-1"
                        >
                          <FileUp className="h-4 w-4" />
                          Upload MOA
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
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
                      onChange={(e) =>
                        setField("salary", parseInt(e.target.value))
                      }
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
                        formData.internship_preferences?.expected_start_date ??
                        undefined
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
    </div>
  );
};
