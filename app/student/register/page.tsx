"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AutocompleteTreeMulti } from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";
import { POSITION_TREE } from "@/lib/consts/positions";
import { FormInput } from "@/components/EditForm";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  MultiChipSelect,
  SingleChipSelect,
  type Option as ChipOpt,
} from "@/components/ui/chip-select";

// ------------------ Types ------------------

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
  program_type_ids?: string[]; // ['credited','voluntary']
  job_mode_ids?: string[];
  job_type_ids?: string[];
  job_category_ids?: string[];

  credited_term?: "term1" | "term2" | "term3" | null;
  credited_hours?: number | null;

  voluntary_asap?: boolean;
  voluntary_duration?: "hours" | "months" | "flexible" | null;
  voluntary_hours?: number | null;
  voluntary_months?: number | null;

  taking_for_credit?: boolean;
  expected_start_date?: string | null;
  expected_end_date?: string | null;
  expected_duration_hours?: number | null;
  auto_apply?: boolean;
}

// ------------------ Small UI Bits ------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-gray-600 mb-1 block">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xl sm:text-2xl tracking-tight font-semibold text-gray-800 mb-3">
      {children}
    </div>
  );
}

// ------------------ Options ------------------

const PROGRAM_TYPES: ChipOpt[] = [
  { value: "credited", label: "Credited" },
  { value: "voluntary", label: "Voluntary" },
];

const CREDITED_TERMS: ChipOpt[] = [
  { value: "term1", label: "Term 1" },
  { value: "term2", label: "Term 2" },
  { value: "term3", label: "Term 3" },
];

const VOLUNTARY_DURATION: ChipOpt[] = [
  { value: "hours", label: "Hours" },
  { value: "months", label: "Months" },
  { value: "flexible", label: "Flexible" },
];

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);

  const basicForm = useForm<BasicInputs>();
  const prefsForm = useForm<PrefInputs>({
    defaultValues: {
      program_type_ids: [],
      job_mode_ids: [],
      job_type_ids: [],
      job_category_ids: [],

      credited_term: null,
      credited_hours: null,

      voluntary_asap: false,
      voluntary_duration: null,
      voluntary_hours: null,
      voluntary_months: null,

      taking_for_credit: false,
      expected_start_date: null,
      expected_end_date: null,
      expected_duration_hours: null,
      auto_apply: false,
    },
  });

  const refs = useDbRefs();

  const university = useWatch({
    control: basicForm.control,
    name: "university",
  });

  const onSubmit = () => {
    const merged = { ...basicForm.getValues(), ...prefsForm.getValues() };
    console.log("REGISTER payload:", merged);
  };

  // Derived state
  const programTypes = prefsForm.watch("program_type_ids") || [];
  const isCredited = programTypes.includes("credited");
  const isVoluntary = programTypes.includes("voluntary");

  const creditedTerm = prefsForm.watch("credited_term");
  const voluntaryDuration = prefsForm.watch("voluntary_duration");

  // Build "select all" ids for work modes
  const allJobModeIds = useMemo(
    () => (refs.job_modes ?? []).map((o: any) => String(o.id)),
    [refs.job_modes]
  );

  // Find "Full-time" job type id (robust regex)
  const fullTimeJobTypeId = useMemo(() => {
    const jt = (refs.job_types ?? []).find(
      (o: any) => /full[\s-]?time/i.test(o.name) || /\bft\b/i.test(o.name)
    );
    return jt ? String(jt.id) : null;
  }, [refs.job_types]);

  // Clear credited/voluntary-only fields when toggled off
  useEffect(() => {
    if (!isCredited) {
      prefsForm.setValue("credited_term", null);
      prefsForm.setValue("credited_hours", null);
    }
    if (!isVoluntary) {
      prefsForm.setValue("voluntary_asap", false);
      prefsForm.setValue("voluntary_duration", null);
      prefsForm.setValue("voluntary_hours", null);
      prefsForm.setValue("voluntary_months", null);
    }
  }, [isCredited, isVoluntary, prefsForm]);

  // Auto-prefill when "Credited" just turned ON
  const prevIsCredited = useRef(isCredited);
  useEffect(() => {
    const turnedOn = isCredited && !prevIsCredited.current;

    if (turnedOn) {
      // Modes: select ALL
      if (allJobModeIds.length) {
        prefsForm.setValue("job_mode_ids", allJobModeIds, {
          shouldDirty: true,
        });
      }
      // Types: set to Full-time (override)
      if (fullTimeJobTypeId) {
        prefsForm.setValue("job_type_ids", [fullTimeJobTypeId], {
          shouldDirty: true,
        });
      }
    }

    prevIsCredited.current = isCredited;
  }, [isCredited, allJobModeIds, fullTimeJobTypeId, prefsForm]);

  // Handle late-loaded refs while credited is ON
  useEffect(() => {
    if (!isCredited) return;

    const currentModes = prefsForm.getValues("job_mode_ids") || [];
    const sameModes =
      currentModes.length === allJobModeIds.length &&
      currentModes.every((id) => allJobModeIds.includes(id));
    if (!sameModes && allJobModeIds.length) {
      prefsForm.setValue("job_mode_ids", allJobModeIds, { shouldDirty: true });
    }

    const currentTypes = prefsForm.getValues("job_type_ids") || [];
    if (
      fullTimeJobTypeId &&
      (currentTypes.length !== 1 || currentTypes[0] !== fullTimeJobTypeId)
    ) {
      prefsForm.setValue("job_type_ids", [fullTimeJobTypeId], {
        shouldDirty: true,
      });
    }
  }, [isCredited, allJobModeIds, fullTimeJobTypeId, prefsForm]);

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
            <h1 className="text-3xl font-semibold">
              Welcome {university || "DLSU"} student!
            </h1>
            <div className="text-sm text-gray-500">
              Please fill this out before continuing
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="lg:col-span-2 space-y-6 max-w-lg w-full ">
            <Card className="p-4 sm:p-6 block">
              <form
                className="space-y-4"
                onSubmit={prefsForm.handleSubmit(onSubmit)}
              >
                <SectionTitle>Internship preferences</SectionTitle>

                {/* Q1: Voluntary or Credited */}
                <div className="space-y-2">
                  <FieldLabel>
                    Are you looking for a voluntary or credited internship?
                  </FieldLabel>
                  <MultiChipSelect
                    value={programTypes}
                    onChange={(v) => prefsForm.setValue("program_type_ids", v)}
                    options={PROGRAM_TYPES}
                    className="justify-start"
                  />
                </div>

                {/* Work modes / types */}
                <div className="space-y-2">
                  <FieldLabel>Work modes</FieldLabel>
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

                <div className="space-y-2">
                  <FieldLabel>Workload types</FieldLabel>
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

                {/* Job categories (unchanged) */}
                <div className="space-y-2">
                  <FieldLabel>Job categories</FieldLabel>
                  <AutocompleteTreeMulti
                    tree={POSITION_TREE}
                    value={prefsForm.watch("job_category_ids") || []}
                    setter={(vals: string[]) =>
                      prefsForm.setValue("job_category_ids", vals)
                    }
                    placeholder="Select one or more"
                  />
                </div>

                {/* If CREDITED selected */}
                {isCredited && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <SectionTitle>For credited internship</SectionTitle>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FieldLabel>When will the OJT be credited?</FieldLabel>
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex h-4 w-4 items-center justify-center">
                                <Info className="h-4 w-4 text-gray-500" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs max-w-xs">
                              {/* Replace with your real dates */}
                              <p>
                                <b>Term 1:</b> Sep–Dec 2025
                              </p>
                              <p>
                                <b>Term 2:</b> Jan–Apr 2026
                              </p>
                              <p>
                                <b>Term 3:</b> May–Aug 2026
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <SingleChipSelect
                        className="justify-start"
                        value={creditedTerm ?? null}
                        onChange={(v) =>
                          prefsForm.setValue(
                            "credited_term",
                            (v as PrefInputs["credited_term"]) || null
                          )
                        }
                        options={CREDITED_TERMS}
                      />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel>Hours to be credited</FieldLabel>
                      <FormInput
                        label={null}
                        type="number"
                        inputMode="numeric"
                        value={prefsForm.watch("credited_hours") ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          const n = v === "" ? null : Number(v);
                          prefsForm.setValue(
                            "credited_hours",
                            Number.isFinite(n as number) ? (n as number) : null
                          );
                        }}
                        required={false}
                      />
                    </div>
                  </div>
                )}

                {/* If VOLUNTARY selected */}
                {isVoluntary && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <SectionTitle>For voluntary internship</SectionTitle>

                    <div className="space-y-2">
                      <FieldLabel>
                        Are you looking for a voluntary internship ASAP?
                      </FieldLabel>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="asap"
                          checked={!!prefsForm.watch("voluntary_asap")}
                          onCheckedChange={(checked) =>
                            prefsForm.setValue("voluntary_asap", !!checked)
                          }
                        />
                        <label
                          htmlFor="asap"
                          className="text-sm text-gray-800 select-none"
                        >
                          ASAP
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FieldLabel>Preferred duration</FieldLabel>
                      <SingleChipSelect
                        className="justify-start"
                        value={voluntaryDuration ?? null}
                        onChange={(v) =>
                          prefsForm.setValue(
                            "voluntary_duration",
                            (v as PrefInputs["voluntary_duration"]) || null
                          )
                        }
                        options={VOLUNTARY_DURATION}
                      />
                    </div>

                    {voluntaryDuration === "hours" && (
                      <div className="space-y-1">
                        <FieldLabel>Target hours</FieldLabel>
                        <FormInput
                          label={null}
                          type="number"
                          inputMode="numeric"
                          value={prefsForm.watch("voluntary_hours") ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            const n = v === "" ? null : Number(v);
                            prefsForm.setValue(
                              "voluntary_hours",
                              Number.isFinite(n as number)
                                ? (n as number)
                                : null
                            );
                          }}
                          required={false}
                        />
                      </div>
                    )}

                    {voluntaryDuration === "months" && (
                      <div className="space-y-1">
                        <FieldLabel>Target months</FieldLabel>
                        <FormInput
                          label={null}
                          type="number"
                          inputMode="numeric"
                          value={prefsForm.watch("voluntary_months") ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            const n = v === "" ? null : Number(v);
                            prefsForm.setValue(
                              "voluntary_months",
                              Number.isFinite(n as number)
                                ? (n as number)
                                : null
                            );
                          }}
                          required={false}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button
                    className="w-full sm:w-auto"
                    type="submit"
                    disabled={submitting}
                  >
                    Next
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
