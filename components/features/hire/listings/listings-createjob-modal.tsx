import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, FileEdit } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { MDXEditor } from "@/components/MDXEditor";
import { useFormData } from "@/lib/form-data";
import {
  DropdownGroup,
  GroupableRadioDropdown,
} from "@/components/ui/dropdown";
import {
  FormInput,
  FormDropdown,
  FormCheckbox,
  FormDatePicker,
} from "@/components/EditForm";

interface CreateJobModalFormProps {
  createJob: (job: Partial<Job>) => Promise<any>;
  close: () => void;
}

const CreateModalForm = ({
  createJob: create_job,
  close,
}: CreateJobModalFormProps) => {
  const [creating, set_creating] = useState(false);
  const { formData, setField, setFields, fieldSetter } = useFormData<Job>();
  const { job_types, job_modes, job_pay_freq, job_allowances } = useDbRefs();

  const handleSaveEdit = async () => {
    const job: Partial<Job> = {
      id: formData.id,
      title: formData.title,
      description: formData.description ?? "",
      requirements: formData.requirements ?? "",
      location: formData.location ?? "",
      allowance: formData.allowance,
      mode: formData.mode,
      type: formData.type,
      salary: formData.allowance === 0 ? formData.salary : null,
      salary_freq: formData.allowance === 0 ? formData.salary_freq : null,
      require_github: formData.require_github,
      require_portfolio: formData.require_portfolio,
      require_cover_letter: formData.require_cover_letter,
      is_unlisted: formData.is_unlisted,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_year_round: formData.is_year_round,
    };

    set_creating(true);
    try {
      const response = await create_job(job);
      if (!response?.success) {
        alert("Could not create job");
        set_creating(false);
        return;
      }
      set_creating(false);
      close(); // Ensure modal closes after successful creation
    } catch (error) {
      set_creating(false);
      alert("Error creating job");
    }
  };

  return (
    <>
      <div className="px-6 py-5 border-b border-gray-200 w-[600px] bg-white">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 break-words overflow-wrap-anywhere leading-tight">
                {formData.title || "Untitled Job"}
              </h2>
              <Input
                value={formData.title || ""}
                onChange={(e) => setField("title", e.target.value)}
                className="text-lg font-medium h-12"
                placeholder="Enter job title here..."
                maxLength={100}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {(formData.title || "").length}/100 characters
              </p>
              <div className="flex flex-row gap-3 mt-4">
                <Button disabled={creating} onClick={handleSaveEdit}>
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Publish Listing"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => close()}
                  className="px-4 py-2 text-sm font-medium"
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with improved layout */}
      <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="">
            <div className="text-2xl tracking-tight font-medium text-gray-700 my-6 mt-3">
              Basic Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-2">
                <FormInput
                  label="Location"
                  value={formData.location ?? ""}
                  maxLength={100}
                  setter={fieldSetter("location")}
                  required={false}
                />
              </div>

              <DropdownGroup>
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

                <div className="space-y-2">
                  <FormDropdown
                    label="Compensation"
                    value={formData.allowance ?? undefined}
                    options={job_allowances.reverse()}
                    setter={fieldSetter("allowance")}
                  />
                </div>

                {formData.allowance === 0 && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Salary <span className="text-destructive">*</span>
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
                        Pay Frequency{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <GroupableRadioDropdown
                        name="pay_freq"
                        defaultValue={formData.salary_freq}
                        options={job_pay_freq}
                        onChange={fieldSetter("salary_freq")}
                      />
                    </div>
                  </>
                )}
              </DropdownGroup>
            </div>
            <div>
              <div className="space-y-3 w-full mt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FormCheckbox
                      checked={formData.is_year_round ?? false}
                      setter={(value) =>
                        setFields({
                          is_year_round: !!value,
                        })
                      }
                    />
                    <span className="text-sm font-medium">Year Round</span>
                  </div>
                  {!formData.is_year_round && (
                    <div className="flex flex-row gap-4">
                      <FormDatePicker
                        label="Start Date"
                        date={formData.start_date ?? 0}
                        setter={(date) => setField("start_date", date)}
                      />
                      <FormDatePicker
                        label="End Date"
                        date={formData.end_date ?? 0}
                        setter={(date) => setField("end_date", date)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="">
              <div className="text-2xl tracking-tight font-medium text-gray-700 my-6">
                Job Description
              </div>
              <div className="relative">
                <MDXEditor
                  className="min-h-[500px] border border-gray-200 rounded-[0.33em] overflow-y-auto"
                  markdown={formData.description ?? ""}
                  onChange={(value) => setField("description", value)}
                />
              </div>
            </div>

            <div className="">
              <div className="text-2xl tracking-tight font-medium text-gray-700 my-6">
                Requirements
              </div>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-[0.33em] hover:border-gray-300 transition-colors">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      GitHub Repository
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Require GitHub link
                    </p>
                  </div>
                  <FormCheckbox
                    checked={formData.require_github ?? false}
                    setter={fieldSetter("require_github")}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-[0.33em] hover:border-gray-300 transition-colors">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Portfolio
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Require portfolio link
                    </p>
                  </div>
                  <FormCheckbox
                    checked={formData.require_portfolio ?? false}
                    setter={fieldSetter("require_portfolio")}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-[0.33em] hover:border-gray-300 transition-colors">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Cover Letter
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Require cover letter
                    </p>
                  </div>
                  <FormCheckbox
                    checked={formData.require_cover_letter ?? false}
                    setter={fieldSetter("require_cover_letter")}
                  />
                </div>
              </div>
              <div className="relative">
                <MDXEditor
                  className="min-h-[500px] w-full border border-gray-200 rounded-[0.33em] overflow-y-auto"
                  markdown={formData.requirements ?? ""}
                  onChange={(value) => setField("requirements", value)}
                />
              </div>
            </div>

            <div className="space-y-3 mt-4 mb-12">
              <div className="text-2xl tracking-tight font-medium text-gray-700 my-6">
                Job Settings
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-[0.33em] hover:border-gray-300 transition-colors">
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
            </div>
            <br />
          </div>
        </div>
      </div>
    </>
  );
};

export function ListingsCreateJobModal(props: CreateJobModalFormProps) {
  return <CreateModalForm {...props} />;
}
