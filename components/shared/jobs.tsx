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
          <div className="absolute inset-x-0 bottom-0.5 h-[0.45em] rotate-[-0.8deg] rounded-sm bg-gradient-to-r from-amber-200/70 via-amber-300/50 to-amber-200/30" />
          <h3
            className={cn(
              "relative font-bold leading-tight text-gray-900 break-words tracking-tight",
              compact ? "text-lg" : "text-xl",
            )}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-amber-900/80">
            {employer ?? "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}

type SuperListingBadgeVariant = "default" | "gold";

export function SuperListingBadge({
  className,
  compact = false,
  variant = "default",
}: {
  className?: string;
  compact?: boolean;
  variant?: SuperListingBadgeVariant;
}) {
  const isGold = variant === "gold";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold",
        isGold
          ? "super-header-badge super-badge-gold text-amber-950"
          : "bg-white super-header-badge text-amber-900",
        className,
      )}
    >
      <Zap className="h-3.5 w-3.5" />
      <span className="tracking-wide">Super Listing</span>
      {!compact && (
        <>
          <span
            className={cn(isGold ? "text-amber-900/80" : "text-amber-600/80")}
          >
            ·
          </span>
          <span className={cn("font-semibold", isGold && "text-amber-900")}>
            Get a response in 24h
          </span>
        </>
      )}
    </div>
  );
}

function SuperListingBorderBadge({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-4 top-[1.25rem] z-20",
        mobile && "left-4 top-4",
      )}
    >
      <SuperListingBadge className={cn(mobile && "px-2.5 py-1 text-[11px]")} />
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
    <div className={cn("relative z-10 space-y-3.5", compact ? "p-0" : "p-0")}>
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
    <div className="relative py-3">
      <div
        onClick={onClick}
        className={cn(
          "super-card group relative isolate cursor-pointer overflow-hidden rounded-[0.33em]",
          "bg-[radial-gradient(ellipse_at_top_left,rgba(254,240,138,0.5),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(251,146,60,0.18),transparent_35%),linear-gradient(150deg,rgba(255,251,235,1)_0%,rgba(255,255,255,1)_45%,rgba(254,243,199,0.98)_100%)]",
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(245,158,11,0.25),0_0_80px_rgba(245,158,11,0.12),0_20px_40px_rgba(249,115,22,0.15)]",
          selected &&
            "shadow-[0_0_24px_rgba(245,158,11,0.25)] border-amber-500/70",
        )}
      >
        <SuperListingBorderBadge mobile={mobile} />
        <div
          className={cn(
            "relative z-10 space-y-4",
            mobile ? "px-5 pb-5 pt-12" : "px-5 pb-5 pt-[3.5rem]",
          )}
        >
          <SuperJobCardContent job={job} compact={mobile} />
        </div>
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
      <div
        className={cn(
          "super-cta-glow w-full rotate-[-0.8deg] rounded-2xl border border-amber-400/80",
          "bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_60%,#ea580c_100%)]",
          "px-4 py-3 text-sm font-bold text-white",
          "transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1 group-hover:rotate-[-0.3deg]",
          compact && "px-4 py-2.5 text-[13px]",
        )}
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4 fill-current drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
          <span className="min-w-0 flex-1 line-clamp-2 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
            {trimmedChallengeTitle || "Open Challenge"}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
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
    <div>
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

export function SuperChallengeDetails({
  job,
  mobile = false,
}: {
  job: Job;
  mobile?: boolean;
}) {
  const superChallengeTitle = job.challenge?.title?.trim();
  const superChallengeDescription = job.challenge?.description?.trim();

  if (!job.challenge) return null;

  return (
    <div className="relative py-3">
      <div
        className={cn(
          "super-challenge-card group relative isolate rounded-[0.33em] p-6 pt-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(245,158,11,0.25),0_0_80px_rgba(245,158,11,0.12),0_20px_40px_rgba(249,115,22,0.15)]",
          "bg-[radial-gradient(ellipse_at_top_left,rgba(254,240,138,0.5),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(251,146,60,0.18),transparent_35%),linear-gradient(150deg,rgba(255,251,235,1)_0%,rgba(255,255,255,1)_45%,rgba(254,243,199,0.98)_100%)]",
        )}
      >
        {/* Badge on the border */}
        <div
          className={cn(
            "absolute top-0 -translate-y-1/2 z-20",
            mobile ? "left-1/2 -translate-x-1/2" : "left-4",
          )}
        >
          <SuperListingBadge
            className={cn(mobile && "px-2.5 py-1 text-[11px]")}
          />
        </div>

        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute -left-8 top-4 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-6 bottom-2 h-24 w-24 rounded-full bg-orange-300/15 blur-2xl" />

        <div className="relative z-10 space-y-4">
          {/* Section label */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
              Challenge
            </span>

            <h3 className="relative mt-1 text-2xl font-bold leading-tight text-gray-900 tracking-tight">
              {superChallengeTitle || "Tell us your funniest joke."}
            </h3>
          </div>
          <div className="relative whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
            {superChallengeDescription || "No challenge description provided."}
          </div>
        </div>
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
        {isSuperListing && <SuperChallengeDetails job={job} />}
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
