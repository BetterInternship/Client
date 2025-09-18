"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Autocomplete,
  AutocompleteMulti,
  AutocompleteTreeMulti,
} from "@/components/ui/autocomplete";
import { useDbRefs } from "@/lib/db/use-refs";
import ResumeUpload from "./ResumeUpload";
import { useAnalyzeResume } from "@/hooks/use-register";
import { FormDatePicker } from "@/components/EditForm";
import { isoToMs, msToISO } from "@/lib/utils/date-utils";
import { POSITION_TREE } from "@/lib/consts/positions";
import { ProcessingTransition } from "./ProcessingTransition";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/lib/ctx-auth";
import { useRouter } from "next/navigation";

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
  taking_for_credit?: boolean;
  expected_start_date?: string | null;
  expected_end_date?: string | null;
  expected_duration_hours?: number | null;
  job_mode_ids?: string[];
  job_type_ids?: string[];
  job_category_ids?: string[];
  auto_apply?: boolean;
}

// ------------------ Small UI Bits ------------------

function Stepper({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {step + 1} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-gray-500 mb-1">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xl sm:text-2xl tracking-tight font-semibold text-gray-800 mb-3">
      {children}
    </div>
  );
}

function SubtleNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500">{children}</p>;
}

function AIResumeStatus({
  isParsing,
  parsedKeys,
}: {
  isParsing: boolean;
  parsedKeys: string[];
}) {
  return (
    <>
      {isParsing ? (
        <>
          <div className="w-full">
            <ProcessingTransition promise={undefined} onComplete={() => {}} />
          </div>
          <div className="mt-4 text-[11px] text-gray-500 text-center px-2">
            We're scanning your profile. In the meantime, answer your{" "}
            <span className="font-medium">Internship Preferences</span>.
          </div>
        </>
      ) : (
        <Card className="p-4 sm:p-5 min-h-[260px]">
          <div className="w-full">
            <div className="text-sm font-medium text-emerald-600 text-center">
              Resume analysis finished
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Fields auto-filled:
            </div>
            <ul className="mt-1 space-y-1 text-xs">
              {parsedKeys.length === 0 ? (
                <li className="text-gray-400 italic">No fields detected.</li>
              ) : (
                parsedKeys.map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="capitalize">{k.replaceAll("_", " ")}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </Card>
      )}
    </>
  );
}

// ------------------ Page ------------------

const stepData = [
  { title: "Welcome to BetterInternship" }, // 0
  { title: "Let's set you up in a few quick steps" }, // 1
  { title: "Tell us about you" }, // 2 (skipped if resume provided)
  { title: "Internship preferences" }, // 3
  { title: "Review & submit" }, // 4
];

export default function RegisterPage() {
  // ------ resume parsing state ------
  const [file, setFile] = useState<File | null>(null);
  const [parsedKeys, setParsedKeys] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const { upload, fileInputRef, response } = useAnalyzeResume(file);
  const handledResponseRef = useRef<Promise<any> | null>(null);

  const hasResume = !!file;
  const { register } = useAuthContext();

  // ------ steps ------
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const visibleSteps = hasResume ? [1, 3, 4] : [1, 2, 3, 4];
  const currentVisibleIndex = Math.max(0, visibleSteps.indexOf(step));
  const stepCount = visibleSteps.length;

  // ------ forms ------
  const basicForm = useForm<BasicInputs>();
  const prefsForm = useForm<PrefInputs>({
    defaultValues: {
      taking_for_credit: false,
      expected_start_date: null,
      expected_end_date: null,
      expected_duration_hours: null,
      job_mode_ids: [],
      job_type_ids: [],
      job_category_ids: [],
      auto_apply: false,
    },
  });

  const refs = useDbRefs();
  const router = useRouter();

  // Use useWatch to avoid triggering memos on every render
  const university = useWatch({
    control: basicForm.control,
    name: "university",
  });

  const universityOptions = refs.universities;
  const collegeOptions = useMemo(
    () =>
      refs.colleges.filter((c) =>
        refs.get_colleges_by_university(university).includes(c.id)
      ),
    [university, refs]
  );
  const degreeOptions = useMemo(
    () =>
      refs.degrees.filter((d) =>
        refs.get_degrees_by_university(university).includes(d.id)
      ),
    [university, refs]
  );

  // Upload once per file change (keep deps minimal)
  useEffect(() => {
    if (!file) return;
    setIsParsing(true);
    upload(file);
    setStep(3); // jump straight to preferences
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Hydrate basic form ONCE per unique response promise
  useEffect(() => {
    if (!response || handledResponseRef.current === response) return;
    handledResponseRef.current = response;

    let cancelled = false;
    response
      .then(({ extractedUser }) => {
        if (cancelled || !extractedUser) return;
        const keys = Object.keys(extractedUser) as (keyof BasicInputs)[];
        const newlyParsed: string[] = [];
        keys.forEach((k) => {
          const v = extractedUser[k];
          if (v) {
            basicForm.setValue(k, v as any, {
              shouldDirty: true,
              shouldTouch: true,
            });
            newlyParsed.push(k as string);
          }
        });
        setParsedKeys((prev) => Array.from(new Set([...prev, ...newlyParsed])));
        setIsParsing(false);
      })
      .catch(() => setIsParsing(false));

    return () => {
      cancelled = true;
    };
  }, [response, basicForm]);

  const onSubmit: SubmitHandler<BasicInputs & PrefInputs> = (data) => {
    const merged = { ...data, ...prefsForm.getValues() };
    console.log("REGISTER payload:", merged);
  };

  return (
    <div className="min-h-screen bg-[#FEFCFF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <img
              src="/BetterInternshipLogo.png"
              className="w-36 mx-auto mb-3"
              alt="BetterInternship"
            />
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800">
              {stepData[step].title}
            </h1>
            <div className="mt-4">
              <Stepper step={currentVisibleIndex} total={stepCount} />
            </div>
          </div>
        </div>

        {/* Shell */}
        {/* items-start keeps both columns' first cards aligned to the top */}
        <div className="mt-8 flex flex-col items-center gap-2">
          {/* Right: Live AI parsing status */}
          {step > 1 && step < 4 && (
            <AIResumeStatus isParsing={isParsing} parsedKeys={parsedKeys} />
          )}
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6 max-w-lg w-full ">
            {/* Step 1: Upload Resume */}
            <div className={cn("w-full", step === 1 ? "block" : "hidden")}>
              <ResumeUpload
                ref={fileInputRef}
                promise={response}
                onSelect={(f) => {
                  setFile(f);
                }}
                onComplete={() => {}}
              />
              {isParsing && (
                <div className="mt-4 text-xs text-gray-500">
                  We're scanning your profile. Head over to{" "}
                  <b>Internship preferences</b> while this completes.
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => setStep(hasResume ? 3 : 2)}
                  disabled={!file && !isParsing}
                >
                  {hasResume ? "Go to preferences" : "Next"}
                </Button>
              </div>
            </div>

            {/* Step 2: Basic Identity (skipped if resume exists, but accessible for edits) */}
            <Card className={cn("p-4 sm:p-6", step === 2 ? "block" : "hidden")}>
              <form
                onSubmit={basicForm.handleSubmit(() => setStep(3))}
                className="space-y-4"
              >
                <SectionTitle>Tell us about you</SectionTitle>
                <SubtleNote>
                  Only edit if something looks off from the auto-fill.
                </SubtleNote>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <FieldLabel>First name</FieldLabel>
                    <Input
                      placeholder="First name"
                      {...basicForm.register("first_name", { required: true })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Middle name</FieldLabel>
                    <Input
                      placeholder="Middle name"
                      {...basicForm.register("middle_name")}
                    />
                  </div>
                  <div>
                    <FieldLabel>Last name</FieldLabel>
                    <Input
                      placeholder="Last name"
                      {...basicForm.register("last_name", { required: true })}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Phone number</FieldLabel>
                  <Input
                    placeholder="09XX…"
                    {...basicForm.register("phone_number", { required: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>University</FieldLabel>
                    <Autocomplete
                      value={basicForm.watch("university")}
                      options={universityOptions}
                      setter={(val: any) =>
                        basicForm.setValue("university", val)
                      }
                      placeholder="Select university…"
                    />
                  </div>
                  <div>
                    <FieldLabel>College</FieldLabel>
                    <Autocomplete
                      value={basicForm.watch("college")}
                      options={collegeOptions}
                      setter={(val: any) => basicForm.setValue("college", val)}
                      placeholder="Select college…"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Degree</FieldLabel>
                    <Autocomplete
                      value={basicForm.watch("degree")}
                      options={degreeOptions}
                      setter={(val: any) => basicForm.setValue("degree", val)}
                      placeholder="Select degree…"
                    />
                  </div>
                  <div>
                    <FieldLabel>Degree notes (optional)</FieldLabel>
                    <Input
                      placeholder="e.g., Major in…"
                      {...basicForm.register("degree_notes")}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(1);
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit">Save & continue</Button>
                </div>
              </form>
            </Card>

            {/* Step 3: Preferences */}
            <Card className={cn("p-4 sm:p-6", step === 3 ? "block" : "hidden")}>
              <form
                onSubmit={prefsForm.handleSubmit(() => setStep(4))}
                className="space-y-4"
              >
                <SectionTitle>Internship preferences</SectionTitle>
                <SubtleNote>
                  {isParsing ? (
                    <>
                      We're completing your profile scan. In the meantime,
                      answer these questions.
                    </>
                  ) : (
                    <>
                      Review your preferences below. If your personal details
                      look wrong,{" "}
                      <button
                        type="button"
                        className="underline hover:opacity-80"
                        onClick={() => setStep(2)}
                      >
                        edit your basic info
                      </button>
                      .
                    </>
                  )}
                </SubtleNote>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={!!prefsForm.watch("taking_for_credit")}
                    onChange={(e) =>
                      prefsForm.setValue("taking_for_credit", e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-600">
                    Taking internships for credit?
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Expected start date</FieldLabel>
                    <FormDatePicker
                      className="w-full"
                      date={isoToMs(prefsForm.watch("expected_start_date"))}
                      setter={(ms?: number) =>
                        prefsForm.setValue(
                          "expected_start_date",
                          msToISO(ms) ?? null
                        )
                      }
                      required={false}
                      label={undefined}
                    />
                  </div>
                  <div>
                    <FieldLabel>Expected end date</FieldLabel>
                    <FormDatePicker
                      className="w-full"
                      date={isoToMs(prefsForm.watch("expected_end_date"))}
                      setter={(ms?: number) =>
                        prefsForm.setValue(
                          "expected_end_date",
                          msToISO(ms) ?? null
                        )
                      }
                      required={false}
                      label={undefined}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Expected duration (hours)</FieldLabel>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={prefsForm.watch("expected_duration_hours") ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      const n = v === "" ? null : Number(v);
                      prefsForm.setValue(
                        "expected_duration_hours",
                        Number.isFinite(n as number) ? (n as number) : null
                      );
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Work modes</FieldLabel>
                    <AutocompleteMulti
                      options={refs.job_modes}
                      value={prefsForm.watch("job_mode_ids") || []}
                      setter={(vals: string[]) =>
                        prefsForm.setValue("job_mode_ids", vals)
                      }
                      placeholder="Select one or more"
                    />
                  </div>
                  <div>
                    <FieldLabel>Workload types</FieldLabel>
                    <AutocompleteMulti
                      options={refs.job_types}
                      value={prefsForm.watch("job_type_ids") || []}
                      setter={(vals: string[]) =>
                        prefsForm.setValue("job_type_ids", vals)
                      }
                      placeholder="Select one or more"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Positions / Categories</FieldLabel>
                  <AutocompleteTreeMulti
                    tree={POSITION_TREE}
                    value={prefsForm.watch("job_category_ids") || []}
                    setter={(vals: string[]) =>
                      prefsForm.setValue("job_category_ids", vals)
                    }
                    placeholder="Select one or more"
                  />
                </div>

                <Separator />
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={!!prefsForm.watch("auto_apply")}
                    onChange={(e) =>
                      prefsForm.setValue("auto_apply", e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-600">
                    Auto-apply for me using{" "}
                    <span className="font-semibold">SherwinAI</span> when a job
                    matches my profile
                  </span>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(hasResume ? 1 : 2);
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit">Next</Button>
                </div>
              </form>
            </Card>

            {/* Step 4: Review & Submit */}
            <Card className={cn("p-4 sm:p-6", step === 4 ? "block" : "hidden")}>
              <SectionTitle>Review & submit</SectionTitle>
              <p className="text-sm text-gray-600 mb-4">
                Quick glance before we create your account.
              </p>

              <div className="grid gap-4 text-sm">
                <div>
                  <div className="uppercase tracking-wide text-gray-500 mb-1">
                    Identity
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border">
                    <div className="font-semibold">
                      {basicForm.watch("first_name")}{" "}
                      {basicForm.watch("middle_name")}{" "}
                      {basicForm.watch("last_name")}
                    </div>
                    <div className="mt-1 text-gray-600">
                      Phone Number: {basicForm.watch("phone_number") || "—"}
                    </div>
                    <div className="mt-1 text-gray-600">
                      University:{" "}
                      {refs.get_university(basicForm.watch("university"))
                        ?.name || "—"}
                    </div>
                    <div className="mt-1 text-gray-600">
                      College:{" "}
                      {refs.get_college(basicForm.watch("college"))?.name ||
                        "—"}
                    </div>
                    <div className="mt-1 text-gray-600">
                      Degree:{" "}
                      {refs.get_degree(basicForm.watch("degree"))?.name || "—"}
                    </div>
                    <div className="mt-1 text-gray-600">
                      Notes: {basicForm.watch("degree_notes") || "—"}
                    </div>
                    <button
                      type="button"
                      className="text-xs underline mt-2"
                      onClick={() => setStep(2)}
                    >
                      Edit details
                    </button>
                  </div>
                </div>

                <div>
                  <div className="uppercase tracking-wide text-gray-500 mb-1">
                    Preferences
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border">
                    <div>
                      For credit:{" "}
                      {prefsForm.watch("taking_for_credit") ? "Yes" : "No"}
                    </div>
                    <div>
                      Dates: {prefsForm.watch("expected_start_date") || "—"} →{" "}
                      {prefsForm.watch("expected_end_date") || "—"}
                    </div>
                    <div>
                      Duration:{" "}
                      {prefsForm.watch("expected_duration_hours") || "—"} hrs
                    </div>
                    <div>
                      Work modes:{" "}
                      {(prefsForm.watch("job_mode_ids") || [])
                        .map(
                          (id) => refs.job_modes.find((m) => m.id === id)?.label
                        )
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                    <div>
                      Workload types:{" "}
                      {(prefsForm.watch("job_type_ids") || [])
                        .map(
                          (id) => refs.job_types.find((t) => t.id === id)?.label
                        )
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                    <div>
                      Positions:{" "}
                      {(prefsForm.watch("job_category_ids") || [])
                        .map(
                          (id) =>
                            refs.job_categories.find((c) => c.id === id)?.label
                        )
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                    <div>
                      Auto-apply with SherwinAI:{" "}
                      {prefsForm.watch("auto_apply") ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  disabled={submitting}
                  onClick={async () => {
                    type Payload = BasicInputs & PrefInputs & { resume: any };
                    const formData = new FormData();
                    const payload = {
                      ...basicForm.getValues(),
                      // ...prefsForm.getValues(),
                      resume: file,
                    } as Payload;
                    const keys = Object.keys(payload);
                    for (const key of keys) {
                      let value = payload[key];
                      try {
                        value = JSON.parse(payload[key]);
                      } catch {
                        value = payload[key];
                      }
                      formData.append(key, value);
                    }

                    setSubmitting(true);
                    await register(formData)
                      .then(() => router.push("/profile"))
                      .catch(() => router.push("/profile"));
                  }}
                >
                  {submitting ? "Creating account..." : "Create my account"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
