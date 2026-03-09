import { Badge, BoolBadge } from "@/components/ui/badge";
import { Job } from "@/lib/db/db.types";
import { useDbMoa } from "@/lib/db/use-bi-moa";
import { useDbRefs } from "@/lib/db/use-refs";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle,
  Clock,
  EyeOff,
  Monitor,
  PhilippinePeso,
  UserCheck,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "../ui/card";
import { Divider } from "../ui/divider";
import { DropdownGroup } from "../ui/dropdown";
import { Property } from "../ui/labels";
import { Toggle } from "../ui/toggle";
import { useMobile } from "@/hooks/use-mobile";
import { useAppContext } from "@/lib/ctx-app";
import { useAuthContext } from "@/lib/ctx-auth";

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
          "font-semibold text-gray-800 leading-tight transition-colors line-clamp-2 truncate break-words whitespace-pre-wrap",
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
      <div className="truncate">{location}</div>
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
        workModes.map((mode) => <JobMode mode={mode} />)}

      {!excludes.includes("salary") && (
        <JobSalary salary={job.salary} salary_freq={job.salary_freq} />
      )}
      {!excludes.includes("mode") &&
        workLoads.map((load) => <JobType type={load} />)}
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

function SuperListingDoodles({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 360 220"
        className="pointer-events-none absolute inset-0 h-full w-full text-amber-500/70"
        fill="none"
        preserveAspectRatio="none"
      >
        <rect
          x="6.5"
          y="6.5"
          width="347"
          height="207"
          rx="7"
          ry="7"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={mobile ? "6 7" : "7 8"}
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 120 36"
        className={cn(
          "pointer-events-none absolute left-0 top-0 w-32 text-amber-500/70",
          mobile && "w-24",
        )}
        fill="none"
      >
        <path
          d="M5 23C17 10 24 9 33 18C40 24 49 24 61 12C74 0 88 3 102 17"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M96 12L102 17L95 21"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 80 80"
        className={cn(
          "pointer-events-none absolute right-0 top-0 h-16 w-16 rotate-[8deg] text-amber-500/75",
          mobile && "h-14 w-14",
        )}
        fill="none"
      >
        <path
          d="M34 6L18 33H34L26 56L54 24H39L47 6Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 120 40"
        className={cn(
          "pointer-events-none absolute bottom-0 right-0 w-32 text-orange-400/70",
          mobile && "w-24",
        )}
        fill="none"
      >
        <path
          d="M10 10C31 28 53 31 84 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M78 13L84 18L77 24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M62 17C71 21 77 22 84 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

function SuperListingHeader({
  title,
  employer,
  compact = false,
}: {
  title: string | null | undefined;
  employer: string | null | undefined;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="space-y-1">
        <div className="relative inline-block max-w-full">
          <div className="absolute inset-x-0 bottom-1 h-4 rotate-[-1deg] rounded-sm bg-amber-200/55" />
          <h3
            className={cn(
              "relative font-semibold leading-tight text-gray-900 break-words",
              compact ? "text-lg" : "text-[1.35rem]",
            )}
          >
            {title}
          </h3>
        </div>
        <p className="text-sm font-medium text-gray-700">
          {employer ?? "Unknown"}
        </p>
      </div>
    </div>
  );
}

function SuperListingBorderBadge({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-4 top-[1.25rem] z-20 inline-flex rotate-[-3deg] items-center gap-2 rounded-full border border-amber-300 bg-white/95 px-3 py-1 text-xs font-semibold text-amber-800 shadow-[0_6px_16px_rgba(245,158,11,0.14)]",
        mobile && "left-4 top-4 px-2.5 py-0.5 text-xs  rotate-[-2.5deg]",
      )}
    >
      <Zap className="h-3.5 w-3.5 fill-current" />
      <span>Responds in 24h</span>
    </div>
  );
}

function SuperJobCardContent({
  job,
  compact = false,
}: {
  job: Job;
  compact?: boolean;
}) {
  return (
    <div className={cn("relative z-10 space-y-4", compact ? "p-0" : "p-0")}>
      <SuperListingHeader
        title={job.title}
        employer={job.employer?.name}
        compact={compact}
      />
      <div className="space-y-3">
        <JobBadges job={job} />
      </div>
      <SuperListingCTA
        compact={compact}
        challengeTitle={job.challenge?.title}
      />
    </div>
  );
}

function SuperJobCard({
  job,
  onClick,
  selected,
  mobile = false,
}: {
  job: Job;
  onClick?: () => void;
  selected?: boolean;
  mobile?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative isolate cursor-pointer overflow-hidden rounded-[0.33em] bg-[radial-gradient(circle_at_top_left,rgba(254,240,138,0.46),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.16),transparent_28%),linear-gradient(145deg,rgba(255,251,235,1)_0%,rgba(255,255,255,1)_42%,rgba(254,243,199,0.96)_100%)] shadow-[0_14px_34px_rgba(251,191,36,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(249,115,22,0.2)]",
        mobile ? "p-0" : "p-0",
        selected && "ring-1 ring-amber-400 ring-offset-1",
      )}
    >
      <SuperListingDoodles mobile={mobile} />
      <SuperListingBorderBadge mobile={mobile} />
      <div
        className={cn(
          "relative z-10 space-y-4",
          mobile ? "px-5 pb-5 pt-11" : "px-5 pb-[1.35rem] pt-[3.15rem]",
        )}
      >
        <SuperJobCardContent job={job} compact={mobile} />
      </div>
    </div>
  );
}

function SuperListingCTA({
  compact = false,
  challengeTitle,
}: {
  compact?: boolean;
  challengeTitle?: string | null;
}) {
  const trimmedChallengeTitle = challengeTitle?.trim();

  return (
    <div className="relative pt-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 110 32"
        className={cn(
          "pointer-events-none absolute right-3 top-0 h-8 w-24 text-amber-500/70",
          compact && "right-2 top-0 h-7 w-20",
        )}
        fill="none"
      >
        <path
          d="M6 22C25 7 46 6 70 15"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M63 10L70 15L62 19"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className={cn(
          "w-full rotate-[-1deg] rounded-[1.15rem] border border-amber-500 bg-[linear-gradient(180deg,#f59e0b_0%,#f97316_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(249,115,22,0.24)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
          compact && "px-4 py-2.5 text-[13px]",
        )}
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4 fill-current" />
          <span className="min-w-0 flex-1 line-clamp-2 text-center">
            {trimmedChallengeTitle || "Open Challenge"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

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
  const isSuperListing = Boolean(job.challenge);
  if (isSuperListing) {
    return (
      <SuperJobCard
        job={job}
        selected={selected}
        onClick={() => on_click && on_click(job)}
      />
    );
  }

  return (
    <Card
      key={job.id}
      onClick={() => on_click && on_click(job)}
      className={cn(
        "group relative isolate overflow-hidden",
        selected
          ? "ring-1 ring-primary ring-offset-1"
          : "hover:shadow-sm hover:border-gray-300 cursor-pointer",
      )}
    >
      <div className="relative z-10 space-y-3">
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
    job: Partial<Job>,
  ) => Promise<{ success: boolean }>;
  set_is_editing: (is_editing: boolean) => void;
}) => {
  return (
    <Card
      key={job.id}
      onClick={() => on_click && on_click(job)}
      className={cn(
        selected ? "selected ring-1 ring-primary ring-offset-1" : "",
        !job.is_active ? "opacity-50" : "cursor-pointer",
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <JobHead title={job.title} employer={job.employer?.name} />
          <div className="flex items-center gap-2 relative z-20">
            <Toggle
              state={job.is_active}
              onClick={() => {
                if (!job.id) return;
                void update_job(job.id, {
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
  const isSuperListing = Boolean(job.challenge);
  if (isSuperListing) {
    return <SuperJobCard job={job} onClick={on_click} mobile />;
  }

  return (
    <div
      className={cn(
        "card hover-lift relative isolate overflow-hidden p-6 animate-fade-in",
      )}
      onClick={on_click}
    >
      <>
        <div className="mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Building className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium truncate">{job.employer?.name}</span>
            </div>
          </div>
        </div>
        <JobBadges job={job} />
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description || "No description available."}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 min-w-0">
          <div className="flex-1 min-w-0">
            <JobLocation location={job.location} />
          </div>
        </div>
      </>
    </div>
  );
};

export const MobileJobDetails = ({}) => {};

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
  const { isMobile } = useMobile();
  return (
    <div
      className={cn(
        "items-start justify-between gap-3",
        isMobile ? "" : "flex",
      )}
    >
      {/* ctas on top for mobile */}
      {isMobile && (
        <div className="shrink-0 mb-4">
          <div className="flex items-center gap-2">
            {actions.map((a, i) => (
              <div key={i} className="inline-flex">
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* left: title/employer/location */}
      <div className="min-w-0">
        <h1
          className={cn(
            "font-semibold text-gray-900 leading-tight truncate",
            isMobile ? "text-xl" : "text-4xl",
          )}
        >
          {job.title}
        </h1>
        <p
          className={cn(
            "text-gray-600 truncate",
            isMobile ? "text-base" : "text-xl",
          )}
        >
          {job.employer?.name}
        </p>
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
      {!isMobile && (
        <div className="shrink-0 sm:mt-1">
          <div className="flex items-center gap-2">
            {actions.map((a, i) => (
              <div key={i} className="inline-flex">
                {a}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const JobDetailsSummary = ({ job }: { job: Job }) => {
  const { to_job_mode_name, to_job_type_name, to_job_pay_freq_name } =
    useDbRefs();

  const workModes =
    (job.internship_preferences?.job_setup_ids ?? [])
      .map((id) => to_job_mode_name(id))
      .filter(Boolean)
      .join(", ") || "";

  const workLoads =
    (job.internship_preferences?.job_commitment_ids ?? [])
      .map((id) => to_job_type_name(id))
      .filter(Boolean)
      .join(", ") || "";

  const internshipTypes =
    (job.internship_preferences?.internship_types ?? [])
      .filter(Boolean)
      .map((type) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase())
      .join(", ") || "";

  return (
    <div className="space-y-2">
      <div className="grid sm:grid-cols-4 gap-2">
        <DropdownGroup>
          {workModes ? (
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <label className="flex items-center text-sm text-gray-700">
                  Work Mode:
                </label>
                <Property key="work_modes" value={workModes} />
              </div>
            </div>
          ) : (
            <></>
          )}

          {workLoads ? (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <label className="flex items-center text-sm text-gray-700">
                  Work Load:
                </label>
                <Property key="workload" value={workLoads} />
              </div>
            </div>
          ) : (
            <></>
          )}

          {job.allowance === 0 ? (
            <div className="flex items-center gap-2">
              <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <label className="flex items-center text-sm text-gray-700">
                  Allowance:
                </label>
                <div className="flex">
                  <Property
                    key="salary"
                    value={
                      job.salary
                        ? to_job_pay_freq_name(job.salary_freq) !==
                          "Not specified"
                          ? `${formatCurrency(job.salary)}/${to_job_pay_freq_name(job.salary_freq)}`
                          : `${formatCurrency(job.salary)}`
                        : "With pay"
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          {internshipTypes ? (
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <label className="flex items-center text-sm text-gray-700">
                  Accepting:
                </label>
                <Property key="internship_type" value={internshipTypes} />
              </div>
            </div>
          ) : (
            <></>
          )}
        </DropdownGroup>
      </div>
    </div>
  );
};

/**
 * The right panel that describes job details.
 *
 * @component
 */
// export const EmployerJobDetails = ({
//   job,
//   is_editing = false,
//   set_is_editing = () => { },
//   saving = false,
//   update_job,
//   actions = [],
// }: {
//   job: Job;
//   is_editing: boolean;
//   set_is_editing: (is_editing: boolean) => void;
//   saving?: boolean;
//   update_job: (
//     job_id: string,
//     job: Partial<Job>
//   ) => Promise<{ success: boolean }>;
//   actions?: React.ReactNode[];
// }) => {
//   const {
//     job_modes,
//     job_types,
//     job_allowances,
//     job_pay_freq,
//     to_job_pay_freq_name,
//     to_job_allowance_name,
//     to_job_mode_name, to_job_type_name
//   } = useDbRefs();
//   const { formData, setField, setFields, fieldSetter } = useFormData<Job>();
//   const workModes =
//     (job.internship_preferences?.job_setup_ids ?? [])
//       .map((id) => to_job_mode_name(id))
//       .filter(Boolean)
//       .join(", ") || "None";

//   const workLoads =
//     (job.internship_preferences?.job_commitment_ids ?? [])
//       .map((id) => to_job_type_name(id))
//       .filter(Boolean)
//       .join(", ") || "None";

//   const internshipTypes =
//     (job.internship_preferences?.internship_types ?? [])
//       .filter(Boolean)
//       .map((type) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase())
//       .join(", ") || "None";

//   useEffect(() => {
//     if (job) {
//       setFields(job);
//     }
//   }, [job, is_editing]);

//   useEffect(() => {
//     if (job && saving) {
//       const edited_job: Partial<Job> = {
//         id: formData.id,
//         title: formData.title ?? "",
//         description: formData.description ?? "",
//         requirements: formData.requirements ?? "",
//         location: formData.location ?? "",
//         allowance: formData.allowance ?? undefined,
//         salary: formData.salary ?? null,
//         salary_freq: formData.salary_freq ?? undefined,
//         is_unlisted: formData.is_unlisted,
//         internship_preferences: formData.internship_preferences ?? {},
//       };

//       update_job(edited_job.id ?? "", edited_job).then(
//        // @ts-ignore
//         ({ job: updated_job }) => {
//           if (!updated_job) alert("Invalid input provided for job update.");
//           set_is_editing(false);
//         }
//       );
//     }
//   }, [saving]);

//   return (
//     <div className="flex-1 border-gray-200 rounded-lg ml-4 p-6 pt-10 overflow-y-auto overflow-x-hidden">
//       <div className="flex-1 px-8 pt-7 overflow-y-auto space-y-5">
//         <HeaderWithActions
//           job={job}
//           actions={actions}
//         />

//         <Section title="Job Details">
//           <JobDetailsSummary job={job} />
//         </Section>

//       {/* Job Details Grid */}
//       {/* <div className="mb-6">
//         <h3 className="text-lg font-semibold mb-4">Job Details</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="flex flex-col items-start gap-3">
//             <label className="flex items-center text-sm font-semibold text-gray-700">
//               <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
//               Location:
//             </label>
//             <EditableInput
//               is_editing={is_editing}
//               value={formData.location ?? "Not specified"}
//               setter={fieldSetter("location")}
//               maxLength={100}
//             >
//               <Property className="line-clamp-2 break-words max-w-[100%]" />
//             </EditableInput>
//           </div>

//           {formData.internship_preferences?.job_setup_ids?.[0] && (
//             <div className="flex flex-col items-start gap-3">
//               <label className="flex items-center text-sm font-semibold text-gray-700">
//                 <Monitor className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
//                 Work Mode:
//               </label>
//               <EditableGroupableRadioDropdown
//                 is_editing={is_editing}
//                 name={"job_mode"}
//                 value={formData.internship_preferences?.job_setup_ids?.[0]}
//                 setter={(v) =>
//                   setField("internship_preferences", {
//                     ...formData.internship_preferences,
//                     job_setup_ids: [v],
//                   })
//                 }
//                 options={job_modes}
//               >
//                 <Property />
//               </EditableGroupableRadioDropdown>
//             </div>
//           )}

//           {formData.internship_preferences?.job_commitment_ids?.[0] && (
//             <div className="flex flex-col items-start gap-3 max-w-prose">
//               <label className="flex items-center text-sm font-semibold text-gray-700">
//                 <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
//                 Work Load:
//               </label>
//               <EditableGroupableRadioDropdown
//                 is_editing={is_editing}
//                 value={formData.internship_preferences?.job_commitment_ids?.[0]}
//                 setter={(v) =>
//                   setField("internship_preferences", {
//                     ...formData.internship_preferences,
//                     job_commitment_ids: [v],
//                   })
//                 }
//                 name={"job_type"}
//                 options={job_types}
//               >
//                 <Property />
//               </EditableGroupableRadioDropdown>
//             </div>
//           )}

//           {is_editing ? (
//             <div className="col-span-1 md:col-span-2 lg:col-span-3">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <div className="space-y-2">
//                   <label className="flex items-center text-sm font-semibold text-gray-700">
//                     <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
//                     Compensation:
//                   </label>
//                   <EditableGroupableRadioDropdown
//                     is_editing={is_editing}
//                     name="allowance"
//                     value={formData.allowance}
//                     options={job_allowances}
//                     setter={fieldSetter("allowance")}
//                   >
//                     <Property />
//                   </EditableGroupableRadioDropdown>
//                 </div>

//                 {formData.allowance === 0 && (
//                   <>
//                     <div className="space-y-2">
//                       <label className="flex items-center text-sm font-semibold text-gray-700">
//                         <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
//                         Salary Amount:
//                       </label>
//                       <EditableInput
//                         is_editing={is_editing}
//                         value={formData.salary?.toString() ?? "Not specified"}
//                         setter={fieldSetter("salary")}
//                       >
//                         <Property />
//                       </EditableInput>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="flex items-center text-sm font-semibold text-gray-700">
//                         Pay Frequency:
//                       </label>
//                       <EditableGroupableRadioDropdown
//                         name="pay_freq"
//                         is_editing={is_editing}
//                         value={formData.salary_freq}
//                         options={job_pay_freq}
//                         setter={fieldSetter("salary_freq")}
//                       >
//                         <Property fallback="" />
//                       </EditableGroupableRadioDropdown>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               <label className="flex items-center text-sm font-semibold text-gray-700">
//                 <PhilippinePeso className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
//                 {formData.allowance ? "Allowance:" : "Salary:"}
//               </label>
//               <Property
//                 value={
//                   formData.allowance
//                     ? to_job_allowance_name(formData.allowance)
//                     : formData.salary
//                       ? `${formData.salary}/${to_job_pay_freq_name(
//                         formData.salary_freq
//                       )}`
//                       : "Paid (Amount not specified)"
//                 }
//               />
//             </div>
//           )}

//           <div className="col-span-1 md:col-span-2 lg:col-span-3">
//             <div className="grid grid-cols-1 gap-6">
//               <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4">
//                 <div className="flex flex-row items-start gap-3">
//                   <EditableCheckbox
//                     is_editing={is_editing}
//                     value={formData.is_unlisted}
//                     setter={fieldSetter("is_unlisted")}
//                   >
//                     <JobBooleanLabel />
//                   </EditableCheckbox>
//                   <label className="text-sm font-semibold text-gray-700">
//                     Unlisted?
//                   </label>
//                 </div>
//                 <p className="block text-sm text-gray-500 max-w-prose">
//                   Unlisted jobs can only be viewed through a direct link and
//                   will not show up when searching through the platform. Use this
//                   when you want to share a job only with specific people.
//                 </p>
//               </div>

//               <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4">
//                 <div className="flex items-center space-x-2">
//                   <FormRadio
//                     required={true}
//                     options={[
//                       {
//                         value: "true",
//                         label: "As soon as possible",
//                       },
//                       {
//                         value: "false",
//                         label: "I have a future date in mind",
//                       },
//                     ]}
//                     value={
//                       !formData.internship_preferences?.expected_start_date + ""
//                     }
//                     setter={(v) =>
//                       setField("internship_preferences", {
//                         ...formData.internship_preferences,
//                         expected_start_date: v === "true" ? 0 : undefined,
//                       })
//                     }
//                   />
//                   <label className="flex items-center text-sm font-semibold text-gray-700">
//                     When do you need applicants?
//                   </label>
//                 </div>
//                 {formData.internship_preferences?.expected_start_date !== 0 && (
//                   <div className="flex flex-row gap-4 m-4 border-l-2 border-gray-300 pl-4">
//                     <div className="space-y-2">
//                       <Label className="flex flex-row text-sm font-medium text-gray-700">
//                         Start Date <span className="text-destructive">*</span>
//                       </Label>
//                       <FormDatePicker
//                         date={
//                           formData.internship_preferences
//                             ?.expected_start_date ?? undefined
//                         }
//                         setter={(v) =>
//                           setField("internship_preferences", {
//                             ...formData.internship_preferences,
//                             expected_start_date: v,
//                           })
//                         }
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div> */}

//       {/* Job Description and Requirements - Side by Side */}
//       <hr />
//       {/* <div className="mb-6 mt-8">
//         <h1 className="text-3xl font-heading font-bold text-gray-700 mb-4">
//           Role overview
//         </h1>
//         {!is_editing ? (
//           <div className="markdown">
//             <ReactMarkdown>{job.description?.replace("/", ";")}</ReactMarkdown>
//           </div>
//         ) : (
//           <MDXEditor
//             className="min-h-[300px] border border-gray-200 rounded-lg overflow-y-scroll"
//             markdown={formData.description ?? ""}
//             onChange={(value) => setField("description", value)}
//           />
//         )}
//       </div> */}

//       <Section title="Role overview">
//           <MarkdownBlock text={job.description} />
//       </Section>

//       {/* Job Requirements */}
//       <hr />
//       <div className="mb-6 mt-8">
//         <h1 className="text-3xl font-heading font-bold text-gray-700 mb-4">
//           Requirements
//         </h1>

//         {/* Application Requirements - Checkboxes */}
//         <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
//           <h4 className="text-sm font-semibold text-gray-700 mb-3">
//             Application Requirements:
//           </h4>
//           <div className="flex flex-wrap gap-4">
//             <div
//               className={cn(
//                 "flex flex-row items-start gap-3 max-w-prose",
//                 is_editing ? "opacity-50" : ""
//               )}
//             >
//               <EditableCheckbox
//                 is_editing={is_editing}
//                 value={true}
//                 setter={() => { }}
//               >
//                 <JobBooleanLabel />
//               </EditableCheckbox>
//               <label className="text-sm font-semibold text-gray-700">
//                 Require Resume?
//               </label>
//             </div>
//             <div className="flex flex-row items-start gap-3 max-w-prose">
//               <EditableCheckbox
//                 is_editing={is_editing}
//                 value={formData.internship_preferences?.require_github}
//                 setter={(v) =>
//                   setField("internship_preferences", {
//                     ...formData.internship_preferences,
//                     require_github: v,
//                   })
//                 }
//               >
//                 <JobBooleanLabel />
//               </EditableCheckbox>
//               <label className="text-sm font-semibold text-gray-700">
//                 Require Github?
//               </label>
//             </div>
//             <div className="flex flex-row items-start gap-3 max-w-prose">
//               <EditableCheckbox
//                 is_editing={is_editing}
//                 value={formData.internship_preferences?.require_portfolio}
//                 setter={(v) =>
//                   setField("internship_preferences", {
//                     ...formData.internship_preferences,
//                     require_portfolio: v,
//                   })
//                 }
//               >
//                 <JobBooleanLabel />
//               </EditableCheckbox>
//               <label className="text-sm font-semibold text-gray-700">
//                 Require Portfolio?
//               </label>
//             </div>
//             <div className="flex flex-row items-start gap-3 max-w-prose">
//               <EditableCheckbox
//                 is_editing={is_editing}
//                 value={formData.internship_preferences?.require_cover_letter}
//                 setter={(v) =>
//                   setField("internship_preferences", {
//                     ...formData.internship_preferences,
//                     require_cover_letter: v,
//                   })
//                 }
//               >
//                 <JobBooleanLabel />
//               </EditableCheckbox>
//               <label className="text-sm font-semibold text-gray-700">
//                 Require Cover Letter?
//               </label>
//             </div>
//           </div>
//           {is_editing && (
//             <p className="text-sm text-gray-700 my-3">
//               *Note that resumes will always be required for applicants.
//             </p>
//           )}
//         </div>

//         {/* Requirements Content */}
//         {!is_editing ? (
//           <div className="markdown">
//             {job.requirements && (
//               <ReactMarkdown>{job.requirements}</ReactMarkdown>
//             )}
//           </div>
//         ) : (
//           <MDXEditor
//             className="min-h-[300px] border border-gray-200 rounded-lg overflow-y-scroll"
//             markdown={formData.requirements ?? ""}
//             onChange={(value) => setField("requirements", value)}
//           />
//         )}
//       </div>
//     </div>
//     </div>
//   );
// };

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
    <div className="flex items-start md:items-center gap-2 bg-warning px-5 py-3">
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

export function SuperChallengeDetails({ job }: { job: Job }) {
  const superChallengeTitle = job.challenge?.title?.trim();
  const superChallengeDescription = job.challenge?.description?.trim();

  if (!job.challenge) return null;

  return (
    <div className="rounded-[0.33em] border border-amber-300 bg-amber-50/70 p-4">
      <h3 className="text-base font-semibold text-amber-900">
        {superChallengeTitle || "Challenge"}
      </h3>
      <div className="mt-2 text-sm text-amber-900/90 whitespace-pre-wrap break-words">
        {superChallengeDescription || "No challenge description provided."}
      </div>
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
  isAuthenticated,
}: {
  job: Job;
  user?: {
    github_link?: string | null;
    portfolio_link?: string | null;
  };
  actions?: React.ReactNode[];
  applyDisabledText?: string;
  isAuthenticated: boolean;
}) {
  const hasGithub = !!user?.github_link?.trim();
  const hasPortfolio = !!user?.portfolio_link?.trim();
  const isSuperListing = Boolean(job.challenge);

  const needsCover = !!job.internship_preferences?.require_cover_letter;
  const needsGithub = !!job.internship_preferences?.require_github;
  const needsPortfolio = !!job.internship_preferences?.require_portfolio;

  const missingRequired =
    (needsGithub && !hasGithub) || (needsPortfolio && !hasPortfolio);

  const { isMobile } = useAppContext();

  return (
    <>
      {isAuthenticated && (
        <MissingNotice
          show={missingRequired}
          needsGithub={needsGithub && !hasGithub}
          needsPortfolio={needsPortfolio && !hasPortfolio}
        />
      )}
      <div
        className={cn(
          "flex-1 overflow-y-auto space-y-5",
          isMobile ? "px-3 py-4" : "px-8 pt-7",
        )}
      >
        <HeaderWithActions
          job={job}
          actions={actions}
          disabled={missingRequired}
        />

        <Section title="Job Details">
          <JobDetailsSummary job={job} />
        </Section>
        {isSuperListing && (
          <Section title="Super Challenge">
            <SuperChallengeDetails job={job} />
          </Section>
        )}
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
              <MarkdownBlock text={job.requirements} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {needsCover && <ReqPill ok={true} label="Cover letter" />}
                {needsGithub && <ReqPill ok={true} label="GitHub profile" />}
                {needsPortfolio && <ReqPill ok={true} label="Portfolio link" />}
              </div>
            </div>
          </Section>
        )}

        {/* Space */}
        <div className="h-16"></div>
      </div>
    </>
  );
}
