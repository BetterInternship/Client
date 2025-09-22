"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AutocompleteTreeMulti } from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";
import { POSITION_TREE } from "@/lib/consts/positions";
import { FormInput, FormMonthPicker } from "@/components/EditForm";
import { MultiChipSelect } from "@/components/ui/chip-select";
import { SinglePickerBig } from "@/components/features/student/SinglePickerBig";
import { Separator } from "@/components/ui/separator";

type BasicInputs = {
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  university: string;
  college: string;
  degree: string;
  degree_notes: string;
};

interface PrefInputs {
  program_type_id?: "credited" | "voluntary" | null;
  job_mode_ids?: string[];
  job_type_ids?: string[];
  job_category_ids?: string[];
  internship_start?: number | null;
  expected_duration_hours?: number | null;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-gray-600 mb-1 block">{children}</div>;
}

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);

  const basicForm = useForm<BasicInputs>();
  const prefsForm = useForm<PrefInputs>({
    defaultValues: {
      program_type_id: null,
      job_mode_ids: [],
      job_type_ids: [],
      job_category_ids: [],
      internship_start: null,
      expected_duration_hours: null,
    },
  });

  const refs = useDbRefs();

  const onSubmit = () => {
    const merged = { ...basicForm.getValues(), ...prefsForm.getValues() };
    console.log("REGISTER payload:", merged);
  };

  // Derived state
  const programType = prefsForm.watch("program_type_id");
  const isCredited = programType === "credited";
  const isVoluntary = programType === "voluntary";

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
  const fullTimeJobTypeId = "2"
  const hybridModeId = "1"
  const remoteModeId = "2"

  // Auto-select job_type_ids per rules
  useEffect(() => {
    if (!refs.job_types?.length) return;

    if (programType === "credited") {
      if (allJobTypeIds.length) {
        prefsForm.setValue("job_type_ids", allJobTypeIds, { shouldDirty: true });
      }
    } else if (programType === "voluntary") {
      const filtered = fullTimeJobTypeId
        ? allJobTypeIds.filter((id) => id !== fullTimeJobTypeId)
        : allJobTypeIds;
      prefsForm.setValue("job_type_ids", filtered, { shouldDirty: true });
    } else {
      prefsForm.setValue("job_type_ids", [], { shouldDirty: true });
    }
  }, [programType, refs.job_types, allJobTypeIds, fullTimeJobTypeId, prefsForm]);

  // Auto-select job_mode_ids per rules
  useEffect(() => {
    if (!refs.job_modes?.length) return;

    if (programType === "credited") {
      prefsForm.setValue("job_mode_ids", allJobModeIds, { shouldDirty: true });
    } else if (programType === "voluntary") {
      const filtered = [hybridModeId, remoteModeId].filter(Boolean) as string[];
      prefsForm.setValue("job_mode_ids", filtered, { shouldDirty: true });
    } else {
      prefsForm.setValue("job_mode_ids", [], { shouldDirty: true });
    }
  }, [programType, refs.job_modes, allJobModeIds, hybridModeId, remoteModeId, prefsForm]);

  // Keep job_type_ids valid when refs load late
  useEffect(() => {
    if (!refs.job_types?.length) return;
    const current = prefsForm.getValues("job_type_ids") || [];
    if (!current.length) return;
    const next = current.filter((id) => allJobTypeIds.includes(id));
    if (next.length !== current.length) {
      prefsForm.setValue("job_type_ids", next, { shouldDirty: true });
    }
  }, [refs.job_types, allJobTypeIds, prefsForm]);

  // Clear internship hours when switching to voluntary
  useEffect(() => {
    if (programType === "voluntary") {
      prefsForm.setValue("expected_duration_hours", null, { shouldDirty: true });
    }
  }, [programType, prefsForm]);

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
          <div className="lg:col-span-2 space-y-6 max-w-lg w-full ">
            <Card className="p-4 sm:p-6 block">
              <form
                className="space-y-3"
                onSubmit={prefsForm.handleSubmit(onSubmit)}
                id="reg-form"
              >
                {/* Q1: Voluntary or Credited */}
                <div className="space-y-2">
                  <SinglePickerBig
                    autoCollapse={false}
                    label="What kind of internship are you looking for?"
                    options={[
                      { value: "credited", label: "Credited", description: "Counts for OJT" },
                      { value: "voluntary", label: "Voluntary", description: "Outside practicum" },
                    ]}
                    value={programType ?? null}
                    onChange={(v) =>
                      prefsForm.setValue("program_type_id", v, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                  />
                </div>

                {/* Start date + hours (only credited shows hours) */}
                {(isCredited || isVoluntary) && (
                  <div className="space-y-2">
                    <FormMonthPicker
                      label="Ideal internship start"
                      date={prefsForm.watch("internship_start") ?? undefined}
                      setter={(ms) =>
                        prefsForm.setValue("internship_start", ms ?? null, {
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
                          value={prefsForm.watch("expected_duration_hours") ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            const n = v === "" ? null : Number(v);
                            prefsForm.setValue(
                              "expected_duration_hours",
                              Number.isFinite(n as number) ? (n as number) : null,
                              { shouldDirty: true }
                            );
                          }}
                          required={false}
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <Separator className="mt-5 bg-gray-300" />
                      {/* Work modes */}
                      <div className="space-y-2">
                        <FieldLabel>Work setup</FieldLabel>
                        <MultiChipSelect
                          className="justify-start"
                          value={prefsForm.watch("job_mode_ids") || []}
                          onChange={(vals) =>
                            prefsForm.setValue("job_mode_ids", vals)
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
                          value={prefsForm.watch("job_type_ids") || []}
                          onChange={(vals) =>
                            prefsForm.setValue("job_type_ids", vals)
                          }
                          options={(refs.job_types || []).map((o: any) => ({
                            value: String(o.id),
                            label: o.name,
                          }))}
                        />
                      </div>

                      {/* Job categories */}
                      <div className="space-y-2">
                        <AutocompleteTreeMulti
                          label="Desired internship role"
                          tree={POSITION_TREE}
                          value={prefsForm.watch("job_category_ids") || []}
                          setter={(vals: string[]) =>
                            prefsForm.setValue("job_category_ids", vals)
                          }
                          placeholder="Select one or more"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Card>

            {/* Submit button*/}
            <div className="flex justify-end">
              <Button
                className="w-full sm:w-auto"
                type="submit"
                disabled={submitting}
                form="reg-form"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
