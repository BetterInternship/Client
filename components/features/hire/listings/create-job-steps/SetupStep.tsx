"use client";

import {
  FormCheckbox,
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
import {
  Star,
  ChevronDown,
  ChevronUp,
  FileUp,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

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
  const { data: moaData } = useMoaUniversities();
  const activeMoaCount = moaData?.universityIds?.length ?? 0;
  const registry = useModalRegistry();
  const posthog = usePostHog();
  const [showDetails, setShowDetails] = useState(false);

  const isCreditedSelected =
    !!formData.internship_preferences?.internship_types?.includes("credited");
  const isVoluntarySelected =
    !!formData.internship_preferences?.internship_types?.includes("voluntary");

  useEffect(() => {
    posthog.capture("hire_credited_benefits_viewed", {
      source: "create_listing_setup",
      activeMoaCount,
      isCreditedSelected,
    });
  }, [activeMoaCount, isCreditedSelected, posthog]);

  const handleCreditedToggle = () => {
    const willBeChecked = !isCreditedSelected;
    posthog.capture("hire_credited_toggle_clicked", {
      value: willBeChecked,
      activeMoaCount,
      source: "create_listing_setup",
    });
    setField("internship_preferences", {
      ...formData.internship_preferences,
      internship_types: willBeChecked
        ? [
            ...(formData.internship_preferences?.internship_types ?? []),
            "credited",
          ]
        : (formData.internship_preferences?.internship_types.filter(
            (it) => it !== "credited",
          ) ?? []),
    });
  };

  const handleVoluntaryToggle = () => {
    setField("internship_preferences", {
      ...formData.internship_preferences,
      internship_types: isVoluntarySelected
        ? (formData.internship_preferences?.internship_types.filter(
            (it) => it !== "voluntary",
          ) ?? [])
        : [
            ...(formData.internship_preferences?.internship_types ?? []),
            "voluntary",
          ],
    });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={handleCreditedToggle}
              className={`flex items-start gap-4 p-3 border rounded-[0.33em] cursor-pointer h-fit transition-colors ${
                isCreditedSelected
                  ? "border-primary border-opacity-85 bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <FormCheckbox checked={isCreditedSelected} />
              <div>
                <Label className="text-xs font-medium text-gray-900">
                  Credited (Practicum)
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Practicum students needing a Memorandum of Agreement.
                </p>
              </div>
            </div>
            <div
              onClick={handleVoluntaryToggle}
              className="flex items-start gap-4 p-3 border border-gray-200 hover:border-gray-300 rounded-[0.33em] cursor-pointer h-fit"
            >
              <FormCheckbox checked={isVoluntarySelected} />
              <div>
                <Label className="text-xs font-medium text-gray-900">
                  Voluntary
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Flexible, non-credit internships
                </p>
              </div>
            </div>
          </div>

          {/* Inline credited benefits - nudge, not gate */}
          <div className="space-y-2">
            {activeMoaCount > 0 ? (
              <Card className="py-3 px-4">
                You have {activeMoaCount} active MOA
                {activeMoaCount > 1 ? "s" : ""} — visible to credited students
                at {activeMoaCount} universitie
                {activeMoaCount === 1 ? "y" : "s"}.
                {isCreditedSelected
                  ? " Selecting credited makes you discoverable there."
                  : " Select credited to reach them — listings that accept credited get interns 10x faster."}
              </Card>
            ) : (
              <Card className="py-3 px-4 bg-primary/10 border-primary">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {isCreditedSelected
                      ? "You can accept credited interns — but you’re not yet verified"
                      : "Get interns 10x faster"}
                  </p>
                  <p className="text-xs leading-relaxed">
                    Credited interns require a Memorandum of Agreement (MOA) —
                    one agreement per university. You can get MOAs instantly
                    verified with our partner universities at the{" "}
                    <Link
                      href="https://moa.betterinternship.com/company/verification"
                      className="font-bold underline"
                    >
                      Partners Portal
                    </Link>{" "}
                    or upload your existing MOAs here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    className="text-xs font-medium flex items-center gap-1 hover:cursor-pointer"
                  >
                    {showDetails ? (
                      <>
                        Hide benefits <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Show benefits <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                  {showDetails && (
                    <ul className="text-xs leading-relaxed list-disc pl-4 space-y-1 pt-1">
                      <li>
                        <span className="font-medium">CHED-compliant:</span>{" "}
                        practicum credit requires a university-signed Standard
                        MOA.
                      </li>
                      <li>
                        <span className="font-medium">
                          Larger pool, faster fill:
                        </span>{" "}
                        credited pool is curricula-mandated, hence 10x faster
                        fulfillment.
                      </li>
                      <li>
                        <span className="font-medium">
                          One partnership. One agreement:
                        </span>{" "}
                        create, sign, and manage institutional MOAs in one
                        secure place.
                      </li>
                    </ul>
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
                      Get instant MOAs at the Partners Portal{" "}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUploadClick}
                      className="h-8 gap-1"
                    >
                      <FileUp className="h-4 w-4" />
                      Upload MOA documents
                    </Button>
                  </div>
                </div>
              </Card>
            )}
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
