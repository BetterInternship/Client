"use client";

import {
    FormCheckbox,
    FormCheckBoxGroup,
    FormDatePicker,
    FormInput,
    FormRadio,
} from "@/components/EditForm";
import { MDXEditor } from "@/components/MDXEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    GroupableRadioDropdown
} from "@/components/ui/dropdown";
import { BooleanCheckIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-employer-api";
import { Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useFormData } from "@/lib/form-data";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditJobPageProps {
    job: Job;
    is_editing: boolean;
    set_is_editing: (is_editing: boolean) => void;
    saving?: boolean;
    update_job: (
        job_id: string,
        job: Partial<Job>
    ) => Promise<{ success: boolean }>;
    actions?: React.ReactNode[];
}

const StepCheckIndicator = ({ checked }: { checked: boolean }) => {
    return (
    <div className={checked ? "text-supportive" : ""}>
        <BooleanCheckIcon checked={checked} />
    </div>
    );
};

const EditJobPage = ({ 
    job,
    is_editing = false,
    set_is_editing = () => { },
    saving = false,
    update_job,
    actions = [],
 }: EditJobPageProps) => {
    const {
    job_modes,
    job_types,
    job_allowances,
    job_pay_freq,
    to_job_pay_freq_name,
    to_job_allowance_name,
    to_job_mode_name,
    to_job_type_name
    } = useDbRefs();
    const [editing, set_editing] = useState(false);
    const { formData, setField, setFields, fieldSetter } = useFormData<Job>();
    const router = useRouter();
    const profile = useProfile();

    const workModes =
    (job.internship_preferences?.job_setup_ids ?? [])
    .map((id) => to_job_mode_name(id))
    .filter(Boolean)
    .join(", ") || "None";

    const workLoads =
    (job.internship_preferences?.job_commitment_ids ?? [])
    .map((id) => to_job_type_name(id))
    .filter(Boolean)
    .join(", ") || "None";

    const internshipTypes =
    (job.internship_preferences?.internship_types ?? [])
    .filter(Boolean)
    .map((type) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase())
    .join(", ") || "None";

    const handleSaveEdit = async () => {
    // Validate required fields
    if (!formData.title?.trim()) {
        alert("Job title is required");
        return;
    }

    if (!formData.location?.trim()) {
        alert("Job location is required");
        return;
    }

    if (!formData.description?.trim()) {
        alert("Job description is required");
        return;
    }

    if (!formData.requirements?.trim()) {
        alert("Job requirements is required");
        return;
    }

    const edited_job: Partial<Job> = {
        title: formData.title,
        description: formData.description ?? "",
        requirements: formData.requirements ?? "",
        location: formData.location ?? profile.data?.location ?? "",
        allowance: formData.allowance,
        salary: formData.allowance === 0 ? formData.salary : undefined,
        salary_freq: formData.allowance === 0 ? formData.salary_freq : undefined,
        is_unlisted: formData.is_unlisted ?? false,
        internship_preferences: formData.internship_preferences,
    };

    set_editing(true);

    if (job.id) {
            const result = await update_job(job.id, edited_job);
            if (result.success) {
                router.push("/listings"); 
            }
        }
    // try {
    //   const response = await editJob(edited_job);
    //   if (!response?.success) {
    //     alert(response?.error || "Could not edit job");
    //     set_editing(false);
    //     return;
    //   }
    //   set_editing(false);
    //   router.push("/listings"); // Redirect to jobs listing page
    // } catch (error) {
    //   set_editing(false);
    //   alert("Error editing job");
    // }
  };

    useEffect(() => {
    if (job) {
        setFields(job);
    }
    }, [job, is_editing]);

    useEffect(() => {
    if (job && saving) {
        const edited_job: Partial<Job> = {
        id: formData.id,
        title: formData.title ?? "",
        description: formData.description ?? "",
        requirements: formData.requirements ?? "",
        location: formData.location ?? "",
        allowance: formData.allowance ?? undefined,
        salary: formData.salary ?? null,
        salary_freq: formData.salary_freq ?? undefined,
        is_unlisted: formData.is_unlisted,
        internship_preferences: formData.internship_preferences ?? {},
        };

    update_job(edited_job.id ?? "", edited_job).then(
        // @ts-ignore
        ({ job: updated_job }) => {
        // if (!updated_job) alert("Invalid input provided for job update.");
        set_is_editing(false);
        }
    );
    }
    }, [saving]);

    return (
    <>
        <Head>
            <title>Edit Job | Your App</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-0 z-50 shadow-sm pt-20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl text-gray-800">Edit Job: <span className="font-bold">{formData.title || "Untitled Job"}</span></h1>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                    router.push("/listings");
                  }
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                disabled={saving} 
                onClick={handleSaveEdit}
                className="flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Editing...
                  </>
                ) : (
                  "Save Edits"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <div className="p-6 mt-20">
          <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Title Section */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="flex flex-row text-lg font-bold text-gray-800 mb-2 break-words overflow-wrap-anywhere leading-tight">
                    <StepCheckIndicator
                        checked={formData.title !== "" && formData.title !== undefined && formData.title !== null}
                      />
                    Job Title/Role <span className="text-destructive text-sm">*</span>
                  </h2>
                  <FormInput
                    value={formData.title ?? ""}
                    onChange={(e) => setField("title", e.target.value)}
                    className="text-base font-medium h-10"
                    placeholder="Enter job title here..."
                    maxLength={100}
                    required={true}
                    setter={fieldSetter("title")}
                    />
                    <p className="text-xs text-gray-500 text-right mt-1">
                    {(formData.title || "").length}/100 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-hidden">
              <div className="space-y-8">
                <div>
                  {/* Credit Boxes */}
                  <div>
                    <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                      <StepCheckIndicator
                        checked={!!formData.internship_preferences?.internship_types?.length}
                      />
                      Are you hiring credited and/or voluntary interns? <span className="text-destructive">*</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div
                        onClick={() => setField("internship_preferences", {
                          ...formData.internship_preferences,
                          internship_types: formData.internship_preferences?.internship_types?.includes("credited") 
                            ? [...formData.internship_preferences?.internship_types.filter(it => it !== "credited")]
                            : [...(formData.internship_preferences?.internship_types ?? []), "credited"]
                        })}
                        className="flex items-start gap-4 p-3 border border-gray-200 hover:border-gray-300 rounded-[0.33em] cursor-pointer h-fit">
                          <FormCheckbox
                            checked={formData.internship_preferences?.internship_types?.includes("credited")}
                          />
                          <div>
                            <Label className="text-xs font-medium text-gray-900">
                              Credited Interns (Practicum)
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Required by schools (300-600 hours) and needs Memorandum of Agreement (MOA) from university
                            </p>
                          </div>
                      </div>
                      <div 
                        onClick={() => setField("internship_preferences", {
                          ...formData.internship_preferences,
                          internship_types: formData.internship_preferences?.internship_types?.includes("voluntary") 
                            ? [...formData.internship_preferences?.internship_types.filter(it => it !== "voluntary")]
                            : [...(formData.internship_preferences?.internship_types ?? []), "voluntary"]
                        })}
                        className="flex items-start gap-4 p-3 border border-gray-200 hover:border-gray-300 rounded-[0.33em] cursor-pointer h-fit"
                        >
                          <FormCheckbox
                            checked={formData.internship_preferences?.internship_types?.includes("voluntary")}
                          />
                          <div>
                            <Label className="text-xs font-medium text-gray-900">
                              Voluntary Interns
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Flexbile schedule, available for hire anytime, and work is usually on top of academic load
                            </p>
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  {/*Location Input */}
                    <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                      <StepCheckIndicator
                        checked={formData.location !== "" && formData.location !== undefined && formData.location !== null}
                      />
                      Job Location <span className="text-destructive text-sm">*</span>
                    </div>
                    <div className="w-full mb-6">
                      <div className="space-y-2 w-full">
                        <FormInput
                          value={formData.location ?? ""}
                          maxLength={100}
                          setter={fieldSetter("location")}
                          required={false}
                          className="h-10"
                        />
                      </div>
                    </div>

                    {/* Work types */}
                    <div className="mb-8">
                      <div className="grid cols-1 md:grid-cols-1 gap-x-4">
                        <div>
                          <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                            <StepCheckIndicator
                              checked={formData.internship_preferences?.job_commitment_ids !== undefined
                                && formData.internship_preferences?.job_commitment_ids !== null
                                && formData.internship_preferences?.job_commitment_ids.length !== 0}
                            />
                            Work Load <span className="text-destructive">*</span>
                          </div>
                          <FormCheckBoxGroup 
                            required={true}
                            values={formData.internship_preferences?.job_commitment_ids ?? []}
                            options={[
                              {
                                value: 1,
                                label: "Part-time",
                                description: "(Approx 20 hours/week)"
                              },
                              {
                                value: 2,
                                label: "Full-time",
                                description: "(Approx 40 hours/week)"
                              },
                              {
                                value: 3,
                                label: "Flexible/Project-based"
                              },
                            ]}
                            setter={(v) => setField("internship_preferences", {
                              ...formData.internship_preferences,
                              job_commitment_ids: v,
                            })}
                          />
                        </div>

                        <div>
                          <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                            <StepCheckIndicator
                              checked={formData.internship_preferences?.job_setup_ids !== undefined
                                && formData.internship_preferences?.job_setup_ids !== null
                                && formData.internship_preferences?.job_setup_ids.length !== 0
                              }
                            />
                            Work Mode <span className="text-destructive">*</span>
                          </div>
                          <FormCheckBoxGroup 
                            required={true}
                            values={formData.internship_preferences?.job_setup_ids ?? []}
                            options={[
                              {
                                value: 0,
                                label: "On-site"
                              },
                              {
                                value: 1,
                                label: "Hybrid"
                              },
                              {
                                value: 2,
                                label: "Remote"
                              },
                            ]}
                            setter={(v) => setField("internship_preferences", {
                              ...formData.internship_preferences,
                              job_setup_ids: v,
                            })}
                          />
                          
                        </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                          <StepCheckIndicator
                            checked={formData.allowance !== undefined}
                          />
                          Is the internship paid? <span className="text-destructive">*</span>
                        </div>
                          <Card
                            className={`${formData.allowance === undefined ? 'border-gray-200' : 'border-primary border-opacity-85'}`}
                          >
                          <div>
                            <FormRadio
                            required={true}
                            options = {[
                              {
                                value: "1",
                                label: "No",
                              },
                              {
                                value: "0",
                                label: "Yes",
                              },
                            ]}
                            value={formData.allowance?.toString() ?? undefined}
                            setter={(value) => fieldSetter('allowance')(parseInt(value))}
                            />
                            {formData.allowance === 0 && (
                              <div className="flex flex-row gap-4 m-4">
                                <div className="space-y-2 border-l-2 border-gray-300 pl-4">
                                  <Label className="text-sm font-medium text-gray-700">
                                    Salary <span className="text-sm text-gray-300">(Optional)</span>
                                  </Label>
                                  <Input
                                    type="number"
                                    value={formData.salary ?? ""}
                                    onChange={(e) => setField("salary", parseInt(e.target.value))}
                                    placeholder="Enter salary amount"
                                    className="text-sm"
                                  />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Pay Frequency{" "} <span className="text-sm text-gray-300">(Optional)</span>
                                </Label>
                                <GroupableRadioDropdown
                                  name="pay_freq"
                                  defaultValue={formData.salary_freq}
                                  options={job_pay_freq}
                                  onChange={fieldSetter("salary_freq")}
                                />
                              </div>
                          </div>
                          )}
                        </div>
                        </Card>
                          
                        <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                          <StepCheckIndicator
                            checked={formData.internship_preferences?.expected_start_date === undefined || 
                              formData.internship_preferences?.expected_start_date! > 0}
                          />
                          When are you accepting interns for this listing? <span className="text-destructive">*</span>
                        </div>
                        <Card
                          className={`${formData.internship_preferences?.expected_start_date === undefined ? 'border-gray-200' : 'border-primary border-opacity-85'}`}
                        >
                          <FormRadio
                          required={true}
                          options = {[
                            {
                              value: "true",
                              label: "As soon as possible",
                            },
                            {
                              value: "false",
                              label: "I have a future date in mind",
                            },
                          ]}
                          value ={(formData.internship_preferences?.expected_start_date === undefined) + ""}
                          setter={(v) => setField("internship_preferences", {
                            ...formData.internship_preferences,
                            expected_start_date: v === "true" ? undefined : 0,
                          })}
                          />
                        {formData.internship_preferences?.expected_start_date !== undefined && (
                          <div className="flex flex-row gap-4 m-4 border-l-2 border-gray-300 pl-4">
                            <div className="space-y-2">
                              <Label className="flex flex-row text-sm font-medium text-gray-700">
                                Start Date{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <FormDatePicker
                                date={formData.internship_preferences?.expected_start_date ?? undefined}
                                setter={(v) => setField("internship_preferences", {
                                  ...formData.internship_preferences,
                                  expected_start_date: v,
                                })}
                                disabledDays={{before: new Date()}}
                              />
                            </div>
                          </div>
                        )}
                        </Card>
                    </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className="text-xl tracking-tight font-medium my-4">
                      <div className="text-lg tracking-tight font-medium text-gray-700 my-4">
                          Description<span className="text-destructive">*</span>
                      </div>
                      <p className="text-gray-500 text-sm font-normal">What will the intern do? Briefly describe their tasks, projects, or roles in your company</p>
                    </div>
                    <div className="relative">
                      <MDXEditor
                        className="min-h-[250px] border border-gray-200 rounded-[0.33em] overflow-y-auto"
                        markdown={formData.description ?? ""}
                        onChange={(value) => setField("description", value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xl tracking-tight font-medium text-gray-700 my-4">
                      Requirements<span className="text-destructive">*</span>
                    </div>
                    {/* <p className="text-gray-500 text-xs mb-3">*Note that resumes are already a given requirement for applicants</p> */}
                    <p className="text-gray-500 text-sm mb-3">List preferred courses, skills, and qualifications from applicants</p>
                    <div className="relative mb-4">
                      <MDXEditor
                        className="min-h-[200px] w-full border border-gray-200 rounded-[0.33em] overflow-y-auto"
                        markdown={formData.requirements ?? ""}
                        onChange={(value) => setField("requirements", value)}
                      />
                    </div>
                    <p className="text-sm text-gray-300 mb-1">(Optional)</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div
                        onClick={() => setField("internship_preferences", {
                          ...formData.internship_preferences,
                          require_github: !formData.internship_preferences?.require_github,
                        })}
                        className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit
                        ${formData.internship_preferences?.require_github ? 'border-primary border-opacity-85': 'border-gray-200 hover:border-gray-300'}`}>
                            <FormCheckbox
                            checked={formData.internship_preferences?.require_github ?? false}
                            setter={(v) => setField("internship_preferences", {
                              ...formData.internship_preferences,
                              require_github: v,
                            })}
                            />
                            <div className="grid grid-rows-1 md:grid-rows-2">
                              <Label className="text-xs font-medium text-gray-900">
                                GitHub Repository
                              </Label>
                              <p className="text-xs text-gray-500">
                                Require GitHub link
                              </p>
                            </div>
                        </div>

                        <div 
                        onClick={() => setField("internship_preferences", {
                          ...formData.internship_preferences,
                          require_portfolio: !formData.internship_preferences?.require_portfolio,
                        })}
                        className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit
                        ${formData.internship_preferences?.require_portfolio ? 'border-primary border-opacity-85': 'border-gray-200 hover:border-gray-300'}`}>
                            <FormCheckbox
                            checked={formData.internship_preferences?.require_portfolio ?? false}
                            setter={(v) => setField("internship_preferences", {
                              ...formData.internship_preferences,
                              require_portfolio: v,
                            })}
                            />
                            <div className="grid grid-rows-1 md:grid-rows-2">
                              <Label className="text-xs font-medium text-gray-900">
                                Portfolio
                              </Label>
                              <p className="text-xs text-gray-500">
                                Require portfolio link
                              </p>
                            </div>
                        </div>

                        <div 
                        onClick={() => setField("internship_preferences", {
                          ...formData.internship_preferences,
                          require_cover_letter: !formData.internship_preferences?.require_cover_letter,
                        })}
                        className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit
                        ${formData.internship_preferences?.require_cover_letter ? 'border-primary border-opacity-85': 'border-gray-200 hover:border-gray-300'}`}>
                            <FormCheckbox
                            checked={formData.internship_preferences?.require_cover_letter ?? false}
                            setter={() => setField("internship_preferences", {
                              ...formData.internship_preferences,
                              require_cover_letter: !formData.internship_preferences?.require_cover_letter,
                            })}
                            />
                            <div className="grid grid-rows-1 md:grid-rows-2">
                              <Label className="text-xs font-medium text-gray-900">
                                Cover Letter
                              </Label>
                            <p className="text-xs text-gray-500">
                              Require cover letter
                            </p>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  );
};

export default EditJobPage;