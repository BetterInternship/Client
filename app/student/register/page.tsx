"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AutocompleteTreeMulti } from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";
import { POSITION_TREE } from "@/lib/consts/positions";
import {
  FormDropdown,
  FormInput,
  FormMonthPicker,
} from "@/components/EditForm";
import { MultiChipSelect } from "@/components/ui/chip-select";
import { SinglePickerBig } from "@/components/features/student/SinglePickerBig";
import { useAuthContext } from "@/lib/ctx-auth";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Divider } from "/components/ui/divider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";

interface FormInputs {
  university?: string;
  internship_type?: "credited" | "voluntary" | null;
  job_setup_ids?: string[];
  job_commitment_ids?: string[];
  job_category_ids?: string[];
  expected_start_date?: number | null;
  expected_duration_hours?: number | null;
  auto_apply?: boolean; // TODO: CONNECT TO BACKEND
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-gray-600 mb-1 block">{children}</div>;
}

// Returns the UNIX timestamp of the first day of the current month
const getNearestMonthTimestamp = () => {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${(
    "0" + (date.getMonth() + 1).toString()
  ).slice(-2)}-01T00:00:00.000Z`;
  return Date.parse(dateString);
};

export default function RegisterPage() {
  const refs = useDbRefs();
  const auth = useAuthContext();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [isEduEmail, setIsEduEmail] = useState(false);
  const regForm = useForm<FormInputs>({
    defaultValues: {
      internship_type: null,
      job_setup_ids: [],
      job_commitment_ids: [],
      job_category_ids: [],
      expected_start_date: getNearestMonthTimestamp(),
      expected_duration_hours: 300,
      auto_apply: true,
    },
  });

  // Derived state
  const internshipType = regForm.watch("internship_type");
  const isCredited = internshipType === "credited";
  const isVoluntary = internshipType === "voluntary";

  // Build ALL ids for work modes and types
  const allJobModeIds = useMemo(
    () => (refs.job_modes ?? []).map((o: any) => String(o.id)),
    [refs.job_modes]
  );

  const allJobTypeIds = useMemo(
    () => (refs.job_types ?? []).map((o: any) => String(o.id)),
    [refs.job_types]
  );

  // Helpers to find specific ids
  const fullTimeJobTypeId = "2";
  const hybridModeId = "1";
  const remoteModeId = "2";

  /**
   * Handle form submit
   *
   * @param values
   */
  const handleSubmit = (values: FormInputs) => {
    setSubmitting(true);

    // Check for missing fields
    if (!values.university?.trim()) {
      alert("University is required.");
      setSubmitting(false);
      return;
    }

    if (values.job_category_ids?.length === 0) {
      alert("Desired internship role is required");
      setSubmitting(false);
      return;
    }

    // Cap internship hours
    if (
      (values.expected_duration_hours ?? 2000) > 2000 ||
      (values.expected_duration_hours ?? 100) < 100
    ) {
      alert("Duration hours must be between 100-2000..");
      setSubmitting(false);
      return;
    }

    // Extract fields
    const { university, ...internship_preferences } = values;

    auth
      .register({
        university,
        internship_preferences,
      })
      .then(() => {
        // We don't use router, because we need the reload for some reason
        location.href = "/search";
      })
      .catch((error) => {
        setSubmitting(false);
        console.log(error);
        alert("Something went wrong... Try again later.");
      });
  };

  // Auto-select job_commitment_ids per rules
  useEffect(() => {
    if (!refs.job_types?.length) return;

    if (internshipType === "credited") {
      if (allJobTypeIds.length) {
        regForm.setValue("job_commitment_ids", allJobTypeIds, {
          shouldDirty: true,
        });
      }
    } else if (internshipType === "voluntary") {
      const filtered = fullTimeJobTypeId
        ? allJobTypeIds.filter((id) => id !== fullTimeJobTypeId)
        : allJobTypeIds;
      regForm.setValue("job_commitment_ids", filtered, { shouldDirty: true });
    } else {
      regForm.setValue("job_commitment_ids", [], { shouldDirty: true });
    }
  }, [
    internshipType,
    refs.job_types,
    allJobTypeIds,
    fullTimeJobTypeId,
    regForm,
  ]);

  // Auto-select job_setup_ids per rules
  useEffect(() => {
    if (!refs.job_modes?.length) return;

    if (internshipType === "credited") {
      regForm.setValue("job_setup_ids", allJobModeIds, { shouldDirty: true });
    } else if (internshipType === "voluntary") {
      const filtered = [hybridModeId, remoteModeId].filter(Boolean) as string[];
      regForm.setValue("job_setup_ids", filtered, { shouldDirty: true });
    } else {
      regForm.setValue("job_setup_ids", [], { shouldDirty: true });
    }
  }, [
    internshipType,
    refs.job_modes,
    allJobModeIds,
    hybridModeId,
    remoteModeId,
    regForm,
  ]);

  // Keep job_commitment_ids valid when refs load late
  useEffect(() => {
    if (!refs.job_types?.length) return;
    const current = regForm.getValues("job_commitment_ids") || [];
    if (!current.length) return;
    const next = current.filter((id) => allJobTypeIds.includes(id));
    if (next.length !== current.length) {
      regForm.setValue("job_commitment_ids", next, { shouldDirty: true });
    }
  }, [refs.job_types, allJobTypeIds, regForm]);

  // Clear internship hours when switching to voluntary
  useEffect(() => {
    if (internshipType === "voluntary") {
      regForm.setValue("expected_duration_hours", 300, {
        shouldDirty: true,
      });
    }
  }, [internshipType, regForm]);

  useEffect(() => {
    const isEduEmail = JSON.parse(searchParams.get("edu-email") ?? "false");
    setIsEduEmail(isEduEmail);
  }, [searchParams]);

  return (
    <div className="min-h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <img
              src="/BetterInternshipLogo.png"
              className="w-36 mx-auto mb-3"
              alt="BetterInternship"
            />
            <h1 className="text-3xl font-bold">Welcome to BetterInternship!</h1>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="lg:col-span-2 space-y-2 max-w-lg w-full">
            <Card className="p-4 sm:p-6 block">
              <form
                className="space-y-6"
                id="reg-form"
                onSubmit={() => handleSubmit(regForm.getValues())}
              >
                {/* Q1: Voluntary or Credited */}
                <div className="space-y-2">
                  <SinglePickerBig
                    required
                    autoCollapse={false}
                    label="Are you looking for internship credit?"
                    options={[
                      {
                        value: "credited",
                        label: "Credited",
                        description: "Counts for OJT",
                      },
                      {
                        value: "voluntary",
                        label: "Voluntary",
                        description: "Outside practicum",
                      },
                    ]}
                    value={internshipType ?? null}
                    onClear={() => regForm.setValue("internship_type", null)}
                    onChange={(v) =>
                      regForm.setValue("internship_type", v, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                  />
                </div>

                {/* Start date + hours (only credited shows hours) */}
                {(isCredited || isVoluntary) && (
                  <div className="space-y-5">
                    <FormMonthPicker
                      label="Ideal internship start"
                      date={regForm.watch("expected_start_date") ?? undefined}
                      setter={(ms) =>
                        regForm.setValue("expected_start_date", ms ?? null, {
                          shouldDirty: true,
                        })
                      }
                      fromYear={2025}
                      toYear={2030}
                      placeholder="Select month"
                    />

                    {isCredited && (
                      <div className="space-y-1">
                        <FormInput
                          label="Total internship hours"
                          inputMode="numeric"
                          value={regForm.watch("expected_duration_hours") ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            const n = v === "" ? null : Number(v);
                            regForm.setValue(
                              "expected_duration_hours",
                              Number.isFinite(n as number)
                                ? (n as number)
                                : null,
                              { shouldDirty: true }
                            );
                          }}
                          required={false}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <AutocompleteTreeMulti
                        required
                        label="Desired internship role"
                        tree={POSITION_TREE}
                        value={regForm.watch("job_category_ids") || []}
                        setter={(vals: string[]) =>
                          regForm.setValue("job_category_ids", vals)
                        }
                        placeholder="Select one or more"
                      />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel>Work setup</FieldLabel>
                      <MultiChipSelect
                        className="justify-start"
                        value={regForm.watch("job_setup_ids") || []}
                        onChange={(vals) =>
                          regForm.setValue("job_setup_ids", vals)
                        }
                        options={(refs.job_modes || []).map((o: any) => ({
                          value: String(o.id),
                          label: o.name,
                        }))}
                      />
                    </div>

                    {/* Job types */}
                    <div className="space-y-2">
                      <FieldLabel>Work-time commitment</FieldLabel>
                      <MultiChipSelect
                        className="justify-start"
                        value={regForm.watch("job_commitment_ids") || []}
                        onChange={(vals) =>
                          regForm.setValue("job_commitment_ids", vals)
                        }
                        options={(refs.job_types || []).map((o: any) => ({
                          value: String(o.id),
                          label: o.name,
                        }))}
                      />
                    </div>

                    {/* University email */}
                    <div className="space-y-2">
                      <FormDropdown
                        label="Which university are you from?"
                        options={refs.universities}
                        setter={(value) =>
                          regForm.setValue("university", value)
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Switch
                        checked={!!regForm.watch("auto_apply")}
                        onCheckedChange={(checked) =>
                          regForm.setValue("auto_apply", checked, {
                            shouldDirty: true,
                          })
                        }
                        aria-label="Auto-apply"
                      />
                      <span className="text-sm text-gray-600">
                        Auto-apply for me when a job matches my profile.
                      </span>
                    </div>
                  </div>
                )}
              </form>
            </Card>

            {/* Submit button*/}
            {(isCredited || isVoluntary) && (
              <div className="flex justify-end">
                <Button
                  className="w-full sm:w-auto"
                  type="button"
                  disabled={submitting}
                  form="reg-form"
                  onClick={() => handleSubmit(regForm.getValues())}
                >
                  {submitting ? "Creating account..." : "Create account"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
