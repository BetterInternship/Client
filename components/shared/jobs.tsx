import { Badge, BoolBadge } from "@/components/ui/badge";
import {
  EditableCheckbox,
  EditableGroupableRadioDropdown,
  EditableInput,
} from "@/components/ui/editable";
import { Job } from "@/lib/db/db.types";
import { useDbMoa } from "@/lib/db/use-bi-moa";
import { useDbRefs } from "@/lib/db/use-refs";
import { useFormData } from "@/lib/form-data";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  EyeOff,
  Monitor,
  PhilippinePeso,
  UserCheck,
} from "lucide-react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { MDXEditor } from "../MDXEditor";
import { Card } from "../ui/card";
import { Divider } from "../ui/divider";
import { DropdownGroup } from "../ui/dropdown";
import { JobBooleanLabel, JobTitleLabel, Property } from "../ui/labels";
import { Toggle } from "../ui/toggle";
import { FormDatePicker, FormRadio } from "../EditForm";
import { Label } from "../ui/label";

export const JobHead = ({
  title,
  employer,
  size = "",
}: {
  title: string | null | undefined;
  employer: string | null | undefined;
  size?: string;
}) => {
  return (
    <div className="flex-1 min-w-0 text-wrap">
      <h1
        className={cn(
          "text-" + size + "xl",
          "font-semibold text-gray-800 leading-tight line-clamp-2 transition-colors"
        )}
      >
        {title}
      </h1>
      <div className="flex items-center gap-2 text-gray-700 mb-2 sm:mb-3 mt-1">
        <p className="text-sm text-gray-600 font-medium">
          {employer ?? "Unknown"}
        </p>
      </div>
    </div>
  );
};

export const JobLocation = ({
  location,
}: {
  location: string | null | undefined;
}) => {
  return location ? (
    <div className="flex items-center text-sm text-gray-500">
      <Building className="w-4 h-4 mr-1 flex-shrink-0" />
      <span className="truncate">{location}</span>
    </div>
  ) : (
    <></>
  );
};

export const JobType = ({ type }: { type: number | null | undefined }) => {
  const { isNotNull: ref_is_not_null, to_job_type_name } = useDbRefs();
  return ref_is_not_null(type) ? (
    <Badge>{to_job_type_name(type)}</Badge>
  ) : (
    <></>
  );
};

export const JobMode = ({ mode }: { mode: number | null | undefined }) => {
  const { isNotNull: ref_is_not_null, to_job_mode_name } = useDbRefs();
  return ref_is_not_null(mode) ? (
    <Badge>{to_job_mode_name(mode)}</Badge>
  ) : (
    <></>
  );
};

export const JobCategory = ({ category }: { category: string | undefined }) => {
  const { isNotNull: ref_is_not_null, to_job_category_name } = useDbRefs();
  return ref_is_not_null(category) ? (
    <Badge>{to_job_category_name(category)}</Badge>
  ) : (
    <></>
  );
};

export const JobSalary = ({
  salary,
  salary_freq,
}: {
  salary: number | null | undefined;
  salary_freq: number | null | undefined;
}) => {
  const { to_job_pay_freq_name } = useDbRefs();
  return salary ? (
    <Badge>
      ₱{salary}/{to_job_pay_freq_name(salary_freq)}
    </Badge>
  ) : (
    <></>
  );
};

export const JobApplicationRequirements = ({ job }: { job: Job }) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-sm border">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Application Requirements:
      </h4>
      <div className="flex flex-wrap gap-4">
        <BoolBadge
          state={true}
          onScheme="primary"
          onValue="Resume"
          offValue="Resume"
        />
        <BoolBadge
          state={job.internship_preferences?.require_github}
          onScheme="primary"
          onValue="Github Profile"
          offValue="Github Profile"
        />
        <BoolBadge
          state={job.internship_preferences?.require_portfolio}
          onScheme="primary"
          onValue="Portfolio"
          offValue="Portfolio"
        />
        <BoolBadge
          state={job.internship_preferences?.require_cover_letter}
          onScheme="primary"
          onValue="Cover Letter"
          offValue="Cover Letter"
        />
      </div>
    </div>
  );
};

export const JobBadges = ({
  job,
  excludes = [],
}: {
  job: Job;
  excludes?: string[];
}) => {
  const { universities } = useDbRefs();

  const workModes = job.internship_preferences?.job_setup_ids ?? [];
  const workLoads = job.internship_preferences?.job_commitment_ids ?? [];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {!excludes.includes("moa") && (
        <EmployerMOA
          employer_id={job.employer_id}
          university_id={universities[0]?.id}
        />
      )}
      {!excludes.includes("unlisted") && job.is_unlisted && (
        <Badge type="warning">
          <EyeOff className="w-3 h-3 mr-1" />
          Unlisted
        </Badge>
      )}
      {!excludes.includes("type") &&
        workModes.map((mode) => <JobType type={mode} />)}

      {!excludes.includes("salary") && (
        <JobSalary salary={job.salary} salary_freq={job.salary_freq} />
      )}
      {!excludes.includes("mode") &&
        workLoads.map((load) => <JobMode mode={load} />)}
    </div>
  );
};

export const EmployerMOA = ({
  university_id,
  employer_id,
}: {
  university_id: string | null | undefined;
  employer_id: string | null | undefined;
}) => {
  const { check } = useDbMoa();
  const { get_university } = useDbRefs();

  return check(employer_id ?? "", university_id ?? "") ? (
    <Badge type="supportive">
      <CheckCircle className="w-3 h-3 mr-1" />
      {get_university(university_id)?.name?.split(" ")[0]} MOA
    </Badge>
  ) : (
    <></>
  );
};

/**
 * The scrollable job card component.
 * Used in both hire and student UI.
 *
 * @component
 */
export const JobCard = ({
  job,
  selected,
  on_click,
}: {
  job: Job;
  selected?: boolean;
  on_click?: (job: Job) => void;
}) => {
  return (
    <Card
      key={job.id}
      onClick={() => on_click && on_click(job)}
      className={cn(
        "group relative overflow-hidden",
        selected
          ? "ring-1 ring-primary ring-offset-1"
          : "hover:shadow-sm hover:border-gray-300 cursor-pointer"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <JobHead title={job.title} employer={job.employer?.name} />
        </div>
        <JobLocation location={job.location} />
        <JobBadges job={job} />
      </div>
    </Card>
  );
};

/**
 * The scrollable job card component.
 * Used in both hire and student UI.
 *
 * @component
 */
export const EmployerJobCard = ({
  job,
  selected,
  on_click,
  update_job,
  set_is_editing,
}: {
  job: Job;
  selected?: boolean;
  on_click?: (job: Job) => void;
  update_job: (
    job_id: string,
    job: Partial<Job>
  ) => Promise<{ success: boolean }>;
  set_is_editing: (is_editing: boolean) => void;
}) => {
  return (
    <Card
      key={job.id}
      onClick={() => on_click && on_click(job)}
      className={cn(
        selected ? "selected ring-1 ring-primary ring-offset-1" : "",
        !job.is_active ? "opacity-50" : "cursor-pointer"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <JobHead title={job.title} employer={job.employer?.name} />
          <div className="flex items-center gap-2 relative z-20">
            <Toggle
              state={job.is_active}
              onClick={async () => {
                if (!job.id) return;
                await update_job(job.id, {
                  is_active: !job.is_active,
                });
              }}
            />
          </div>
        </div>
        <JobLocation location={job.location} />
        <JobBadges job={job} excludes={["moa"]} />
      </div>
    </Card>
  );
};

/**
 * The mobile version of the job card.
 *
 * @component
 */
export const MobileJobCard = ({
  job,
  on_click,
}: {
  job: Job;
  on_click: () => void;
}) => {
  return (
    <div className="card hover-lift p-6 animate-fade-in" onClick={on_click}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Building className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{job.employer?.name}</span>
          </div>
        </div>
      </div>
      <JobBadges job={job} />
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
        {job.description || "No description available."}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <JobLocation location={job.location} />{" "}
      </div>
    </div>
  );
};

export const MobileJobDetails = ({}) => {};

/**
 * The right panel that describes job details.
 *
 * @component
 */
export const EmployerJobDetails = ({
  job,
  is_editing = false,
  set_is_editing = () => {},
  saving = false,
  update_job,
  actions = [],
}: {
  job: Job;
  is_editing: boolean;
  set_is_editing: (is_editing: boolean) => void;
  saving?: boolean;
  update_job: (
    job_id: string,
    job: Partial<Job>
  ) => Promise<{ success: boolean }>;
  actions?: React.ReactNode[];
}) => {
  const {
    job_modes,
    job_types,
    job_allowances,
    job_pay_freq,
    to_job_pay_freq_name,
    to_job_allowance_name,
  } = useDbRefs();
  const { formData, setField, setFields, fieldSetter } = useFormData<Job>();

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
          if (!updated_job) alert("Invalid input provided for job update.");
          set_is_editing(false);
        }
      );
    }
  }, [saving]);

  return (
    <div className="flex-1 border-gray-200 rounded-lg ml-4 p-6 pt-10 overflow-y-auto overflow-x-hidden">
      <div className="mb-6">
        <div className="max-w-prose">
          <EditableInput
            is_editing={is_editing}
            value={formData.title ?? "Not specified"}
            setter={fieldSetter("title")}
            maxLength={100}
          >
            <JobTitleLabel />
          </EditableInput>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-gray-600 mb-4 mt-2">{job.employer?.name}</p>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>

      {/* Job Details Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Job Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Location */}
          <div className="flex flex-col items-start gap-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              Location:
            </label>
            <EditableInput
              is_editing={is_editing}
              value={formData.location ?? "Not specified"}
              setter={fieldSetter("location")}
              maxLength={100}
            >
              <Property className="line-clamp-2 break-words max-w-[100%]" />
            </EditableInput>
          </div>

          {/* Mode */}
          {formData.internship_preferences?.job_setup_ids?.[0] && (
            <div className="flex flex-col items-start gap-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Monitor className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                Work Mode:
              </label>
              <EditableGroupableRadioDropdown
                is_editing={is_editing}
                name={"job_mode"}
                value={formData.internship_preferences?.job_setup_ids?.[0]}
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    job_setup_ids: [v],
                  })
                }
                options={job_modes}
              >
                <Property />
              </EditableGroupableRadioDropdown>
            </div>
          )}

          {/* Work Schedule */}
          {formData.internship_preferences?.job_commitment_ids?.[0] && (
            <div className="flex flex-col items-start gap-3 max-w-prose">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                Work Load:
              </label>
              <EditableGroupableRadioDropdown
                is_editing={is_editing}
                value={formData.internship_preferences?.job_commitment_ids?.[0]}
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    job_commitment_ids: [v],
                  })
                }
                name={"job_type"}
                options={job_types}
              >
                <Property />
              </EditableGroupableRadioDropdown>
            </div>
          )}

          {/* Salary Section */}
          {is_editing ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                    Compensation:
                  </label>
                  <EditableGroupableRadioDropdown
                    is_editing={is_editing}
                    name="allowance"
                    value={formData.allowance}
                    options={job_allowances}
                    setter={fieldSetter("allowance")}
                  >
                    <Property />
                  </EditableGroupableRadioDropdown>
                </div>

                {formData.allowance === 0 && (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        Salary Amount:
                      </label>
                      <EditableInput
                        is_editing={is_editing}
                        value={formData.salary?.toString() ?? "Not specified"}
                        setter={fieldSetter("salary")}
                      >
                        <Property />
                      </EditableInput>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        Pay Frequency:
                      </label>
                      <EditableGroupableRadioDropdown
                        name="pay_freq"
                        is_editing={is_editing}
                        value={formData.salary_freq}
                        options={job_pay_freq}
                        setter={fieldSetter("salary_freq")}
                      >
                        <Property fallback="" />
                      </EditableGroupableRadioDropdown>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                {formData.allowance ? "Allowance:" : "Salary:"}
              </label>
              <Property
                value={
                  formData.allowance
                    ? to_job_allowance_name(formData.allowance)
                    : formData.salary
                    ? `${formData.salary}/${to_job_pay_freq_name(
                        formData.salary_freq
                      )}`
                    : "Paid (Amount not specified)"
                }
              />
            </div>
          )}

          {/* Settings Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 gap-6">
              {/* Unlisted */}
              <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4">
                <div className="flex flex-row items-start gap-3">
                  <EditableCheckbox
                    is_editing={is_editing}
                    value={formData.is_unlisted}
                    setter={fieldSetter("is_unlisted")}
                  >
                    <JobBooleanLabel />
                  </EditableCheckbox>
                  <label className="text-sm font-semibold text-gray-700">
                    Unlisted?
                  </label>
                </div>
                <p className="block text-sm text-gray-500 max-w-prose">
                  Unlisted jobs can only be viewed through a direct link and
                  will not show up when searching through the platform. Use this
                  when you want to share a job only with specific people.
                </p>
              </div>

              {/* Year Round */}
              <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <FormRadio
                    required={true}
                    options={[
                      {
                        value: "true",
                        label: "As soon as possible",
                      },
                      {
                        value: "false",
                        label: "I have a future date in mind",
                      },
                    ]}
                    value={
                      !formData.internship_preferences?.expected_start_date + ""
                    }
                    setter={(v) =>
                      setField("internship_preferences", {
                        ...formData.internship_preferences,
                        expected_start_date: v === "true" ? 0 : undefined,
                      })
                    }
                  />
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    When do you need applicants?
                  </label>
                </div>
                {formData.internship_preferences?.expected_start_date !== 0 && (
                  <div className="flex flex-row gap-4 m-4 border-l-2 border-gray-300 pl-4">
                    <div className="space-y-2">
                      <Label className="flex flex-row text-sm font-medium text-gray-700">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <FormDatePicker
                        date={
                          formData.internship_preferences
                            ?.expected_start_date ?? undefined
                        }
                        setter={(v) =>
                          setField("internship_preferences", {
                            ...formData.internship_preferences,
                            expected_start_date: v,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Description and Requirements - Side by Side */}
      <hr />
      <div className="mb-6 mt-8">
        <h1 className="text-3xl font-heading font-bold text-gray-700 mb-4">
          Description
        </h1>
        {!is_editing ? (
          <div className="markdown">
            <ReactMarkdown>{job.description?.replace("/", ";")}</ReactMarkdown>
          </div>
        ) : (
          <MDXEditor
            className="min-h-[300px] border border-gray-200 rounded-lg overflow-y-scroll"
            markdown={formData.description ?? ""}
            onChange={(value) => setField("description", value)}
          />
        )}
      </div>

      {/* Job Requirements */}
      <hr />
      <div className="mb-6 mt-8">
        <h1 className="text-3xl font-heading font-bold text-gray-700 mb-4">
          Requirements
        </h1>

        {/* Application Requirements - Checkboxes */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Application Requirements:
          </h4>
          <div className="flex flex-wrap gap-4">
            <div
              className={cn(
                "flex flex-row items-start gap-3 max-w-prose",
                is_editing ? "opacity-50" : ""
              )}
            >
              <EditableCheckbox
                is_editing={is_editing}
                value={true}
                setter={() => {}}
              >
                <JobBooleanLabel />
              </EditableCheckbox>
              <label className="text-sm font-semibold text-gray-700">
                Require Resume?
              </label>
            </div>
            <div className="flex flex-row items-start gap-3 max-w-prose">
              <EditableCheckbox
                is_editing={is_editing}
                value={formData.internship_preferences?.require_github}
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    require_github: v,
                  })
                }
              >
                <JobBooleanLabel />
              </EditableCheckbox>
              <label className="text-sm font-semibold text-gray-700">
                Require Github?
              </label>
            </div>
            <div className="flex flex-row items-start gap-3 max-w-prose">
              <EditableCheckbox
                is_editing={is_editing}
                value={formData.internship_preferences?.require_portfolio}
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    require_portfolio: v,
                  })
                }
              >
                <JobBooleanLabel />
              </EditableCheckbox>
              <label className="text-sm font-semibold text-gray-700">
                Require Portfolio?
              </label>
            </div>
            <div className="flex flex-row items-start gap-3 max-w-prose">
              <EditableCheckbox
                is_editing={is_editing}
                value={formData.internship_preferences?.require_cover_letter}
                setter={(v) =>
                  setField("internship_preferences", {
                    ...formData.internship_preferences,
                    require_cover_letter: v,
                  })
                }
              >
                <JobBooleanLabel />
              </EditableCheckbox>
              <label className="text-sm font-semibold text-gray-700">
                Require Cover Letter?
              </label>
            </div>
          </div>
          {is_editing && (
            <p className="text-sm text-gray-700 my-3">
              *Note that resumes will always be required for applicants.
            </p>
          )}
        </div>

        {/* Requirements Content */}
        {!is_editing ? (
          <div className="markdown">
            {job.requirements && (
              <ReactMarkdown>{job.requirements}</ReactMarkdown>
            )}
          </div>
        ) : (
          <MDXEditor
            className="min-h-[300px] border border-gray-200 rounded-lg overflow-y-scroll"
            markdown={formData.requirements ?? ""}
            onChange={(value) => setField("requirements", value)}
          />
        )}
      </div>
    </div>
  );
};

export const JobDetailsSummary = ({ job }: { job: Job }) => {
  const { to_job_mode_name, to_job_type_name, to_job_pay_freq_name } =
    useDbRefs();

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

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <DropdownGroup>
          <div className="flex items-start gap-2">
            <Monitor className="h-5 w-5 text-gray-400" />
            <div>
              <label className="flex items-center text-sm text-gray-700">
                Work Mode:
              </label>
              <Property value={workModes} />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <label className="flex items-center text-sm text-gray-700">
                Work Load:
              </label>
              <Property value={workLoads} />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <PhilippinePeso className="h-5 w-5 text-gray-400" />
            <div>
              <label className="flex items-center text-sm text-gray-700">
                Salary:
              </label>
              <Property
                value={
                  job.salary
                    ? `${job.salary}/${to_job_pay_freq_name(job.salary_freq)}`
                    : "None"
                }
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <UserCheck className="h-5 w-5 text-gray-400" />
            <div>
              <label className="flex items-center text-sm text-gray-700">
                Type:
              </label>
              <Property value={internshipTypes} />
            </div>
          </div>
        </DropdownGroup>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Header + Actions (side-by-side)
   ────────────────────────────────────────────── */
function HeaderWithActions({
  job,
  actions,
  disabled,
}: {
  job: Job;
  actions: React.ReactNode[];
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      {/* left: title/employer/location */}
      <div className="min-w-0">
        <h1 className="text-4xl font-semibold text-gray-900 leading-tight truncate">
          {job.title}
        </h1>
        <p className="text-xl text-gray-600 truncate">{job.employer?.name}</p>
        {job.location && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Building className="h-4 w-4" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        {/* <p className="text-s text-gray-500 mt-1">
          Listed on {formatDate(job.created_at ?? "")}
        </p> */}
      </div>

      {/* right: CTAs */}
      <div className="shrink-0 sm:mt-1">
        <div className="flex items-center gap-2">
          {actions.map((a, i) => (
            <div key={i} className="inline-flex">
              {a}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReqPill({ ok, label }: { ok: boolean; label: string }) {
  return <BoolBadge state={ok} onValue={label} offValue={label} />;
}

export function MissingNotice({
  show,
  needsGithub,
  needsPortfolio,
}: {
  show: boolean;
  needsGithub: boolean;
  needsPortfolio: boolean;
}) {
  if (!show) return null;
  return (
    <div className="flex items-start md:items-center gap-2 border-b border-gray-400 bg-warning px-5 py-3">
      <AlertTriangle className="h-5 w-5 text-warning-foreground/90" />
      <p className="text-sm text-warning-foreground/90 leading-snug">
        This job requires{" "}
        {needsGithub && needsPortfolio ? (
          <b>GitHub and Portfolio</b>
        ) : needsGithub ? (
          <b>GitHub</b>
        ) : (
          <b>Portfolio</b>
        )}
        . Update your profile to meet these requirements.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function MarkdownBlock({ text }: { text?: string | null }) {
  if (!text) return <p className=" text-gray-600">No details provided.</p>;
  return (
    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main JobDetails
   ────────────────────────────────────────────── */

export function JobDetails({
  job,
  user,
  actions = [],
  applyDisabledText = "Complete required items to apply.",
}: {
  job: Job;
  user?: {
    github_link?: string | null;
    portfolio_link?: string | null;
  };
  actions?: React.ReactNode[];
  applyDisabledText?: string;
}) {
  const hasGithub = !!user?.github_link?.trim();
  const hasPortfolio = !!user?.portfolio_link?.trim();

  const needsCover = !!job.internship_preferences?.require_cover_letter;
  const needsGithub = !!job.internship_preferences?.require_github;
  const needsPortfolio = !!job.internship_preferences?.require_portfolio;

  const missingRequired =
    (needsGithub && !hasGithub) || (needsPortfolio && !hasPortfolio);

  return (
    <>
      <MissingNotice
        show={missingRequired}
        needsGithub={needsGithub && !hasGithub}
        needsPortfolio={needsPortfolio && !hasPortfolio}
      />
      <div className="flex-1 px-8 pt-7 overflow-y-auto space-y-5">
        <HeaderWithActions
          job={job}
          actions={actions}
          disabled={missingRequired}
        />

        <Section title="Job Details">
          <JobDetailsSummary job={job} />
        </Section>
        <Divider />

        {/* sections */}
        <Section title="Role overview">
          <MarkdownBlock text={job.description} />
        </Section>

        {(job.requirements || needsCover || needsGithub || needsPortfolio) && (
          <Divider />
        )}

        {(job.requirements || needsCover || needsGithub || needsPortfolio) && (
          <Section title="Requirements">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 mt-2">
                {needsCover && <ReqPill ok={true} label="Cover letter" />}
                {needsGithub && (
                  <ReqPill ok={hasGithub} label="GitHub profile" />
                )}
                {needsPortfolio && (
                  <ReqPill ok={hasPortfolio} label="Portfolio link" />
                )}
              </div>
              <MarkdownBlock text={job.requirements} />
            </div>
          </Section>
        )}

        {/* Space */}
        <div className="h-16"></div>
      </div>
    </>
  );
}
