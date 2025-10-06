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
import { useState } from "react";

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

const CreateJobPage = ({ createJob: create_job }: CreateJobPageProps) => {
  const [creating, set_creating] = useState(false);
  const { formData, setField, setFields, fieldSetter } = useFormData<Job>();
  const { job_types, job_modes, job_pay_freq, job_allowances, job_categories } = useDbRefs();
  const router = useRouter();
  const profile = useProfile();

  const handleSaveEdit = async () => {
    // Validate required fields
    if (!formData.title?.trim()) {
      alert("Job title is required");
      return;
    }

    // if (formData.allowance === 0) {
    //   if (!formData.salary) {
    //     alert("Salary is required when compensation is set to salary");
    //     return;
    //   }
    //   if (!formData.salary_freq) {
    //     alert("Pay frequency is required when compensation is set to salary");
    //     return;
    //   }
    // }

    if (!formData.location?.trim()) {
      alert("Job location is required");
      return;
    }

    const job: Partial<Job> = {
      title: formData.title,
      category: formData.category,
      description: formData.description ?? "",
      requirements: formData.requirements ?? "",
      location: formData.location ?? profile.data?.location ?? "",
      allowance: formData.allowance,
      mode: formData.mode,
      type: formData.type,
      salary: formData.allowance === 0 ? formData.salary : undefined,
      salary_freq: formData.allowance === 0 ? formData.salary_freq : undefined,
      require_github: formData.require_github ?? false,
      require_portfolio: formData.require_portfolio ?? false,
      require_cover_letter: formData.require_cover_letter ?? false,
      is_unlisted: formData.is_unlisted ?? false,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_year_round: formData.is_year_round ?? false,
    };

    set_creating(true);
    try {
      const response = await create_job(job);
      if (!response?.success) {
        alert(response?.error || "Could not create job");
        set_creating(false);
        return;
      }
      set_creating(false);
      router.push("/listings"); // Redirect to jobs listing page
    } catch (error) {
      set_creating(false);
      alert("Error creating job");
    }
  };

  return (
    <>
      <Head>
        <title>Create New Job | Your App</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-0 z-50 shadow-sm pt-20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl text-gray-800">Create New Job: <span className="font-bold">{formData.title || "Untitled Job"}</span></h1>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                      if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                          router.push("/listings");
                      }
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                disabled={creating} 
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
                        checked={formData.title !== ""}
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
                  {/* <h2 className="text-lg font-bold text-gray-800 mb-2 break-words overflow-wrap-anywhere leading-tight">
                    Category <span className="text-destructive text-sm">*</span>
                  </h2>
                  <DropdownGroup>
                      <div className="space-y-2">
                        <FormDropdown
                          value={formData.category ?? undefined}
                          options={job_categories}
                          setter={fieldSetter("category")}
                          required={true}
                        />
                      </div>
                  </DropdownGroup> */}
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
                        checked={false}
                      />
                      Are you hiring credited and/or voluntary interns? <span className="text-destructive">*</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div
                      onClick={() => null}
                      className="flex items-start gap-4 p-3 border border-gray-200 hover:border-gray-300 rounded-[0.33em] 
                      cursor-pointer h-fit">
                          <FormCheckbox
                          checked={false}
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
                      <div className="flex items-start gap-4 p-3 border border-gray-200 hover:border-gray-300 rounded-[0.33em] 
                      cursor-pointer h-fit">
                          <FormCheckbox
                          checked={false}
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
                        checked={formData.location !== ""}
                      />
                      Job Location <span className="text-destructive text-sm">*</span>
                    </div>
                    <div className="w-full mb-6">
                      <div className="space-y-2 w-full">
                        <FormInput
                          //label="Location"
                          value={formData.location ?? profile.data?.location ?? ""}
                          maxLength={100}
                          setter={fieldSetter("location")}
                          required={false}
                          className="h-10"
                        />
                      </div>
                    </div>

                    {/* Work types */}
                    <div className="mb-8">
                      <div className="grid grid cols-1 md:grid-cols-1 gap-x-4">
                        {/* Old dropdowns */}
                        {/* <DropdownGroup>
                          <div className="space-y-2">
                          <FormDropdown
                          label="Work Load"
                          value={formData.type ?? undefined}
                          options={job_types}
                          setter={fieldSetter("type")}
                          />
                          </div>
                          <div className="space-y-2">
                          <FormDropdown
                            label="Work Mode"
                            value={formData.mode ?? undefined}
                            options={job_modes}
                            setter={fieldSetter("mode")}
                          />
                          </div>
                        </DropdownGroup> */}
                        <div>
                          <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                            <StepCheckIndicator
                              checked={formData.type !== undefined}
                            />
                            Work Load <span className="text-destructive">*</span>
                          </div>
                          <FormCheckBoxGroup 
                            required={true}
                            values={Array.isArray(formData.type) ? formData.type : []}
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
                            setter={fieldSetter("type")}
                          />
                        </div>

                        <div>
                          <div className="flex flex-row text-lg leading-tight font-medium text-gray-700 my-4">
                            <StepCheckIndicator
                              checked={formData.mode !== undefined}
                            />
                            Work Mode <span className="text-destructive">*</span>
                          </div>
                          <FormCheckBoxGroup 
                            required={true}
                            values={Array.isArray(formData.mode) ? formData.mode : []}
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
                            setter={fieldSetter("mode")}
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
                                value: "0",
                                label: "Yes",
                              },
                              {
                                value: "1",
                                label: "No",
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
                                    value={formData.salary ?? ""}
                                    onChange={(e) => setField("salary", e.target.value)}
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
                            checked={formData.is_year_round !== undefined}
                          />
                          When are you accepting interns for this listing? <span className="text-destructive">*</span>
                        </div>
                        <Card
                          className={`${formData.is_year_round === undefined ? 'border-gray-200' : 'border-primary border-opacity-85'}`}
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
                          value ={formData.is_year_round?.toString() ?? undefined}
                          setter={(value) => fieldSetter('is_year_round')(value === "true")}
                          />
                        {formData.is_year_round === false && (
                          <div className="flex flex-row gap-4 m-4 border-l-2 border-gray-300 pl-4">
                            <div className="space-y-2">
                              <Label className="flex flex-row text-sm font-medium text-gray-700">
                                  <StepCheckIndicator
                                    checked={formData.start_date !== undefined}
                                  />
                                  Start Date{" "}
                                  <span className="text-destructive">*</span>
                              </Label>
                              <FormDatePicker
                                date={formData.start_date ?? undefined}
                                setter={(date) => setField("start_date", date)}
                              />
                            </div>
                            {/* <span className="text-gray-500 self-center"> — </span> */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                  End Date{" "} <span className="text-sm text-gray-300">(Optional)</span>
                                  {/* <span className="text-destructive">*</span> */}
                              </Label>
                              <FormDatePicker
                                date={formData.end_date ?? undefined}
                                setter={(date) => setField("end_date", date)}
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
                          Description
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
                      Requirements
                    </div>
                    {/* <p className="text-gray-500 text-xs mb-3">*Note that resumes are already a given requirement for applicants</p> */}
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
                      onClick={() => setField("require_github", !formData.require_github)}
                      className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit
                      ${formData.require_github ? 'border-primary border-opacity-85': 'border-gray-200 hover:border-gray-300'}`}>
                          <FormCheckbox
                          checked={formData.require_github ?? false}
                          setter={fieldSetter("require_github")}
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
                      onClick={() => setField("require_portfolio", !formData.require_portfolio)}
                      className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit
                      ${formData.require_portfolio ? 'border-primary border-opacity-85': 'border-gray-200 hover:border-gray-300'}`}>
                          <FormCheckbox
                          checked={formData.require_portfolio ?? false}
                          setter={fieldSetter("require_portfolio")}
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
                      onClick={() => setField("require_cover_letter", !formData.require_cover_letter)}
                      className={`flex items-start gap-4 p-3 border rounded-[0.33em] transition-colors cursor-pointer h-fit
                      ${formData.require_cover_letter ? 'border-primary border-opacity-85': 'border-gray-200 hover:border-gray-300'}`}>
                          <FormCheckbox
                          checked={formData.require_cover_letter ?? false}
                          setter={fieldSetter("require_cover_letter")}
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
                    <p className="text-gray-500 text-sm mb-3">List any preferred courses, skills, and qualifications from applicants</p>
                    <div className="relative">
                      <MDXEditor
                        className="min-h-[200px] w-full border border-gray-200 rounded-[0.33em] overflow-y-auto"
                        markdown={formData.requirements ?? ""}
                        onChange={(value) => setField("requirements", value)}
                      />
                    </div>
                  </div>

                  {/* <div className="space-y-3">
                    <div className="text-xl tracking-tight font-medium text-gray-700 my-4">
                      Job Settings
                    </div>
                    <div
                      onClick={() => setField("is_unlisted", !formData.is_unlisted)}
                      className={`flex items-center justify-between p-3 border border-gray-200 rounded-[0.33em] transition-colors cursor-pointer h-fit
                      ${formData.is_unlisted ? 'border-primary border-opacity-85': 'border-gray-200 hover:border-gray-300'}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Unlisted Job
                        </p>
                        <p className="text-xs text-gray-500">
                          Only visible to applicants with the link
                        </p>
                      </div>
                      <FormCheckbox
                        checked={formData.is_unlisted ?? false}
                        setter={fieldSetter("is_unlisted")}
                      />
                    </div>
                  </div> */}
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

export default CreateJobPage;