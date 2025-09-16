import { Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { cn } from "@/lib/utils";
import {
  Building,
  PhilippinePeso,
  MapPin,
  Monitor,
  Clock,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { Badge, BoolBadge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { useFormData } from "@/lib/form-data";
import {
  EditableCheckbox,
  EditableDatePicker,
  EditableGroupableRadioDropdown,
  EditableInput,
} from "@/components/ui/editable";
import { useEffect } from "react";
import { JobBooleanLabel, Property, JobTitleLabel } from "../ui/labels";
import { MDXEditor } from "../MDXEditor";
import { DropdownGroup } from "../ui/dropdown";
import { useMoa } from "@/lib/db/use-moa";
import { Toggle } from "../ui/toggle";
import { Card } from "../ui/card";

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
      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
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
          state={job.require_github}
          onScheme="primary"
          onValue="Github Profile"
          offValue="Github Profile"
        />
        <BoolBadge
          state={job.require_portfolio}
          onScheme="primary"
          onValue="Portfolio"
          offValue="Portfolio"
        />
        <BoolBadge
          state={job.require_cover_letter}
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
      {!excludes.includes("type") && <JobType type={job.type} />}
      {!excludes.includes("salary") && (
        <JobSalary salary={job.salary} salary_freq={job.salary_freq} />
      )}
      {!excludes.includes("mode") && <JobMode mode={job.mode} />}
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
  const { check } = useMoa();
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
        mode: formData.mode ?? undefined,
        type: formData.type ?? undefined,
        allowance: formData.allowance ?? undefined,
        salary: formData.salary ?? null,
        salary_freq: formData.salary_freq ?? undefined,
        require_github: formData.require_github,
        require_portfolio: formData.require_portfolio,
        require_cover_letter: formData.require_cover_letter,
        is_unlisted: formData.is_unlisted,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_year_round: formData.is_year_round,
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
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
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
          <div className="flex flex-col items-start gap-3">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Monitor className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              Work Mode:
            </label>
            <EditableGroupableRadioDropdown
              is_editing={is_editing}
              name={"job_mode"}
              value={formData.mode}
              setter={fieldSetter("mode")}
              options={job_modes}
            >
              <Property />
            </EditableGroupableRadioDropdown>
          </div>

          {/* Work Schedule */}
          <div className="flex flex-col items-start gap-3 max-w-prose">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              Work Load:
            </label>
            <EditableGroupableRadioDropdown
              is_editing={is_editing}
              value={formData.type}
              setter={fieldSetter("type")}
              name={"job_type"}
              options={job_types}
            >
              <Property />
            </EditableGroupableRadioDropdown>
          </div>

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
                  <EditableCheckbox
                    is_editing={is_editing}
                    value={formData.is_year_round ?? false}
                    setter={fieldSetter("is_year_round")}
                  >
                    <JobBooleanLabel />
                  </EditableCheckbox>
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    Year Round?
                  </label>
                </div>
                {/* Dates (when not year round) */}
                {!formData.is_year_round && (
                  <>
                    <br />
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Start Date
                          </label>
                          <EditableDatePicker
                            is_editing={is_editing}
                            value={
                              formData.start_date
                                ? new Date(formData.start_date)
                                : new Date()
                            }
                            // @ts-ignore
                            setter={fieldSetter("start_date")}
                          >
                            <Property />
                          </EditableDatePicker>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            End Date
                          </label>
                          <EditableDatePicker
                            is_editing={is_editing}
                            value={
                              formData.end_date
                                ? new Date(formData.end_date)
                                : new Date()
                            }
                            // @ts-ignore
                            setter={fieldSetter("end_date")}
                          >
                            <Property />
                          </EditableDatePicker>
                        </div>
                      </div>
                    </div>
                  </>
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
                value={formData.require_github}
                setter={fieldSetter("require_github")}
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
                value={formData.require_portfolio}
                setter={fieldSetter("require_portfolio")}
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
                value={formData.require_cover_letter}
                setter={fieldSetter("require_cover_letter")}
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

/**
 * The right panel that describes job details.
 *
 * @component
 */
export const JobDetails = ({
  job,
  actions = [],
}: {
  job: Job;
  actions?: React.ReactNode[];
}) => {
  const { to_job_mode_name, to_job_type_name, to_job_pay_freq_name } =
    useDbRefs();

  // Returns a non-editable version of it
  return (
    <div className="flex-1 border-gray-200 rounded-lg ml-4 p-6 pt-10 overflow-y-auto">
      <div className="mb-6 flex flex-col space-y-2">
        <div className="max-w-prose">
          <JobTitleLabel value={job.title} />
        </div>
        <div className="flex items-center">
          <p className="text-gray-600">{job.employer?.name}</p>
        </div>
        {job.location && (
          <>
            <JobLocation location={job.location} />
            <br />
          </>
        )}
        <div className="flex space-x-2 mt-4">{actions}</div>
      </div>

      {/* Job Details Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Job Details</h3>
        <div className="grid grid-cols-3 gap-6">
          <DropdownGroup>
            <div className="flex flex-col items-start gap-3">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Monitor className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                Work Mode:
              </label>
              <Property value={to_job_mode_name(job.mode)} />
            </div>

            <div className="flex flex-col items-start gap-3 max-w-prose">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
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
            <div className="flex flex-col items-start gap-3 max-w-prose">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                Work Load:
              </label>
              <Property value={to_job_type_name(job.type)} />
            </div>
          </DropdownGroup>

          {/* // ! checkbox labels */}
        </div>
      </div>

      {/* Job Description */}
      <hr />
      <div className="mb-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Description
        </h2>
        <div className="markdown prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
          <ReactMarkdown>{job.description}</ReactMarkdown>
        </div>
      </div>

      {/* Job Requirements */}
      <hr />
      <div className="mb-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Requirements
        </h2>

        <JobApplicationRequirements job={job} />

        {/* Requirements Content */}
        <div className="markdown prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed">
          {job.requirements && (
            <ReactMarkdown>{job.requirements}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};
