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
import { useMobile } from "@/hooks/use-mobile";
import { useModal } from "@/hooks/use-modal";
import { TriangleAlert } from 'lucide-react';
import { cn } from "@/lib/utils";


interface CreateJobPageProps {
  createJob: (job: Partial<Job>) => Promise<any>;
}

const StepCheckIndicator = ({ checked }: { checked: boolean }) => {
  return (
    <div className={checked ? "text-supportive" : ""}>
      <BooleanCheckIcon checked={checked} />
    </div>
  );
};

const CreateJobPage = ({ createJob }: CreateJobPageProps) => {
  const [creating, set_creating] = useState(false);
  const [isMissing, setMissing] = useState(false);
  const { formData, setField, fieldSetter } = useFormData<Job>();
  const { job_pay_freq } = useDbRefs();
  const router = useRouter();
  const profile = useProfile();
  const { isMobile } = useMobile();

  const {
    open: openAlertModal,
    close: closeAlertModal,
    Modal: AlertModal,
  } = useModal("alert-modal", {showCloseButton: false});

  const handleSaveEdit = async () => {
    // Validate required fields

    const missingFields = []

    if (!formData.title?.trim()) {
      missingFields.push("Title")
    }

    if (!formData.location?.trim()) {
      missingFields.push("Location")
    }

    if (!formData.description?.trim()) {
      missingFields.push("Description")
    }

    if (!formData.requirements?.trim()) {
      missingFields.push("Requirements");
    }

    if(formData.internship_preferences?.internship_types === null) {
      missingFields.push("Internship Types");
    }

    if(formData.internship_preferences?.job_setup_ids === null) {
      missingFields.push("Set-up");
    }

    if(formData.internship_preferences?.job_commitment_ids === null) {
      missingFields.push("Commitment");
    }

    if (missingFields.length > 0) {
      alert("Incomplete form");
      return;
    }

    const job: Partial<Job> = {
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

    set_creating(true);
    try {
      const response = await createJob(job);
      if (!response?.success) {
        alert(response?.error || "Could not create job");
        set_creating(false);
        return;
      }
      set_creating(false);
      router.push("/dashboard"); // Redirect to dashboard
    } catch (error) {
      set_creating(false);
      alert("Error creating job");
    }
  };

  useEffect(() => {
    setField("location", profile.data?.location)
  }, [])

  useEffect(() => {
    const missing = 
      !formData.title?.trim() ||
      !formData.location?.trim() ||
      !formData.description?.trim() ||
      !formData.requirements?.trim() ||
      formData.allowance === undefined ||
      !formData.internship_preferences?.internship_types?.length ||
      !formData.internship_preferences?.job_commitment_ids?.length ||
      !formData.internship_preferences?.job_setup_ids?.length;

    setMissing(missing);
  }, [
    formData.title,
    formData.location, 
    formData.description,
    formData.requirements,
    formData.allowance,
    formData.internship_preferences?.internship_types,
    formData.internship_preferences?.job_commitment_ids,
    formData.internship_preferences?.job_setup_ids
  ]);

  return (
    <>
      <Head>
        <title>Create New Job | Your App</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className={cn("bg-white border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-0 z-50 shadow-sm",
          isMobile ? "pt-20" : "mt-20"
        )}>
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className={cn("text-gray-800", isMobile ? "text-lg" : "text-2xl")}>Create New Job: <span className="font-bold">{formData.title || "Untitled Job"}</span></h1>
            <div className="flex gap-3">
              {!isMobile ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={openAlertModal}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={creating || isMissing} 
                    onClick={handleSaveEdit}
                    className="flex items-center"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </>
                    ) : (
                      "Publish Listing"
                    )}
                  </Button>
                </>
              ) : (
                // Fixed footer
                <div className="bg-white border border-gray-200 shadow-md px-6 py-4 fixed bottom-0 right-0 left-0 z-50 p-6">
                  <div className="max-w-5xl mx-auto flex justify-end items-end gap-4">
                    <Button 
                      variant="outline" 
                      onClick={openAlertModal}
                      disabled={creating}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                    <Button 
                      disabled={creating || isMissing} 
                      onClick={handleSaveEdit}
                      className="flex items-center h-10"
                    >
                      {creating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        "Publish Listing"
                      )}
                    </Button>
                  </div>
                </div>
              )}
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
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setField("title", e.target.value)}
                    className="text-base font-medium h-10"
                    placeholder="Enter job title here..."
                    maxLength={100}
                    required={true}
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
                          placeholder="Enter job location here..."
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
                                <div className={cn("border-l-2 border-gray-300 pl-4 gap-4 m-4",
                                        isMobile ? "" : "flex flex-row"
                                    )}>
                                  <div className="space-y-2 mb-4">
                                    <Label className="text-sm font-medium text-gray-700">
                                      Allowance <span className={cn("text-gray-300", isMobile ? "text-xs" : "text-sm")}>(Optional)</span>
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
                                    Pay Frequency{" "} <span className={cn("text-gray-300", isMobile ? "text-xs" : "text-sm")}>(Optional)</span>
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
                      {/* <div className="flex items-start gap-4 p-3 border border-primary border-opacity-85 rounded-[0.33em] h-fit">
                          <FormCheckbox
                          checked={true}
                          />
                          <div className="grid grid-rows-1 md:grid-rows-2">
                            <Label className="text-xs font-medium text-gray-900">
                              Resume
                            </Label>
                            <p className="text-xs text-gray-500">
                              Require resume
                            </p>
                          </div>
                        
                      </div> */}
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
      <AlertModal>
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <TriangleAlert className="text-primary h-8 w-8 mb-4"/>
            <div className="flex flex-col items-center">
              <h3 className="text-lg">Are you sure you want to cancel?</h3>
              <p className="text-gray-500 text-sm">All unsaved changes will be lost.</p>
            </div>
          </div>
          <div className="flex justify-center gap-6">
            <Button 
            className="bg-white text-primary hover:bg-gray-100 border-solid border-2"
            onClick={() => {
              router.push(`/dashboard`)
            }}
            >
              Discard Listing
            </Button>
            <Button
            onClick={closeAlertModal}
            >
              Continue Editing
            </Button>
          </div>
        </div>
      </AlertModal>
    </>
  );
};

export default CreateJobPage;