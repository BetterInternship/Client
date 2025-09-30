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
import { BooleanCheckIcon } from "@/components/ui/icons";

interface FormInputs {
  university?: string;
  internship_type?: "credited" | "voluntary";
  job_setup_ids?: string[];
  job_commitment_ids?: string[];
  job_category_ids?: string[];
  expected_start_date?: number | null;
  expected_duration_hours?: number | null;
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

const StepCheckIndicator = ({ checked }: { checked: boolean }) => {
  return (
    <div className={checked ? "text-supportive" : ""}>
      <BooleanCheckIcon checked={checked} />
    </div>
  );
};

export default function RegisterPage() {
  const refs = useDbRefs();
  const auth = useAuthContext();
  const [submitting, setSubmitting] = useState(false);
  const regForm = useForm<FormInputs>({
    defaultValues: {
      internship_type: undefined,
      job_setup_ids: [],
      job_commitment_ids: [],
      job_category_ids: [],
      expected_start_date: getNearestMonthTimestamp(),
      expected_duration_hours: 300,
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
      .then((response) => {
        if (response?.message) {
          setSubmitting(false);
          alert(response.message);
          return;
        }

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
  }, [internshipType, regForm.getValues()]);

  return (
    <div className="min-h-fit bg-white">
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
          <div className="lg:col-span-2 space-y-2 max-w-lg w-full ">
            <Card className="p-4 sm:p-6 block bg-transparent border-0">
              <form
                className="space-y-6"
                id="reg-form"
                onSubmit={() => handleSubmit(regForm.getValues())}
              >
                {/* Q1: Voluntary or Credited */}
                <div className="flex flex-row space-between">
                  {(isCredited || isVoluntary) && (
                    <StepCheckIndicator
                      checked={!!regForm.watch("internship_type")}
                    />
                  )}
                  <div className="flex-1 space-y-2">
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
                      onClear={() =>
                        regForm.setValue("internship_type", undefined)
                      }
                      onChange={(v) =>
                        regForm.setValue("internship_type", v ?? undefined, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Start date + hours (only credited shows hours) */}
                {(isCredited || isVoluntary) && (
                  <div className="space-y-5">
                    <div className="w-full flex flex-row space-between">
                      <div
                        className={
                          !!regForm.watch("expected_start_date")
                            ? "text-supportive"
                            : ""
                        }
                      >
                        <StepCheckIndicator
                          checked={!!regForm.watch("expected_start_date")}
                        />
                      </div>
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
                        className="flex-1"
                      />
                    </div>

                    {isCredited && (
                      <div className="w-full flex flex-row space-between">
                        <StepCheckIndicator
                          checked={!!regForm.watch("expected_duration_hours")}
                        />
                        <div className="space-y-2 flex-1">
                          <FormInput
                            label="Total internship hours"
                            inputMode="numeric"
                            value={
                              regForm.watch("expected_duration_hours") ?? ""
                            }
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
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}

                    <div className="w-full flex flex-row space-between">
                      <StepCheckIndicator
                        checked={!!regForm.watch("job_category_ids")?.length}
                      />
                      <div className="space-y-2 flex-1">
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
                    </div>

                    <div className="w-full flex flex-row space-between">
                      <StepCheckIndicator checked={true} />
                      <div className="space-y-2 flex-1">
                        <div>
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
                      </div>
                    </div>

                    {/* Job types */}
                    <div className="w-full flex flex-row space-between">
                      <StepCheckIndicator checked={true} />
                      <div className="space-y-2 flex-1">
                        <div>
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
                      </div>
                    </div>

                    {/* University email */}
                    <div className="w-full flex flex-row space-between">
                      <StepCheckIndicator
                        checked={!!regForm.watch("university")}
                      />
                      <div className="space-y-2 flex-1">
                        <FormDropdown
                          label="Which university are you from?"
                          options={refs.universities}
                          setter={(value) =>
                            regForm.setValue("university", value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Card>

            {/* Submit button*/}
            {(isCredited || isVoluntary) && (
              <div className="flex justify-end px-6">
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
