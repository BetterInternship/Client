import { PDFPreview } from "@/components/shared/pdf-preview";
import { UserPfp } from "@/components/shared/pfp";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { HorizontalCollapsible } from "@/components/ui/horizontal-collapse";
import { useFile } from "@/hooks/use-file";
import { UserService } from "@/lib/api/services";
import { useAppContext } from "@/lib/ctx-app";
import { EmployerApplication, PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import {
  cn,
  Button,
  PageContainer,
  AnimatedCount,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@betterinternship/components";
import { DB_STATUS_MAP, UI_STATUS_MAP } from "@/lib/consts/application";
import {
  formatDateWithoutTime,
  formatMonth,
  formatTimestampDateWithoutTime,
} from "@/lib/utils/date-utils";
import {
  Archive,
  ArchiveRestore,
  Award,
  FileText,
  Phone,
  Mail,
  BriefcaseBusiness,
  Github,
  Linkedin,
  HandHelping,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Divider } from "@/components/ui/divider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader } from "@/components/ui/loader";
import { useAuthContext } from "@/app/hire/authctx";
import JobHeader from "./JobHeader";
import { useEmployerApplications } from "@/hooks/use-employer-api";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { HeaderTitle } from "@/components/ui/text";
import { ActionButton } from "@/components/ui/action-button";

interface ApplicantPageProps {
  jobId: string | undefined;
  application: EmployerApplication | undefined;
  userApplications?: EmployerApplication[] | undefined;
  statuses: DropdownMenuItem[];
  onArchive: () => void;
}

export function ApplicantPage({
  jobId,
  application,
  userApplications,
  statuses,
  onArchive,
}: ApplicantPageProps) {
  const user = application?.user as Partial<PublicUser>;
  const hasSocialLinks = Boolean(
    user?.portfolio_link || user?.github_link || user?.linkedin_link,
  );

  const otherApplicants =
    useEmployerApplications().employer_applications.filter(
      (app) => app.job_id === jobId && app.visibility === "visible",
    );
  const currentApplicantIndex = otherApplicants.findIndex(
    (app) => app.id === application?.id,
  );

  const previousApplicant =
    currentApplicantIndex > 0
      ? otherApplicants[currentApplicantIndex - 1]
      : undefined;
  const nextApplicant =
    currentApplicantIndex !== -1 &&
    currentApplicantIndex < otherApplicants.length - 1
      ? otherApplicants[currentApplicantIndex + 1]
      : undefined;
  const currentStatus = useMemo(
    () => ({ id: application?.status?.toString() ?? "0" }),
    [application?.status],
  );
  const internshipPreferences = user?.internship_preferences;
  const internshipTypeBadge =
    internshipPreferences?.internship_type === "credited" ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex w-fit items-center gap-1 text-sm font-medium text-emerald-700">
            <Award className="h-3.5 w-3.5" />
            Credited
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs text-muted-foreground">
            This applicant is looking for internships for credit
          </p>
        </TooltipContent>
      </Tooltip>
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex w-fit items-center gap-1 text-sm font-medium text-sky-700">
            <HandHelping className="h-3.5 w-3.5" />
            Voluntary
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs text-muted-foreground">
            This applicant is looking for internships voluntarily
          </p>
        </TooltipContent>
      </Tooltip>
    );

  const challengeSubmission = application?.challenge_submission?.trim() ?? "";
  const hasChallengeSubmission = challengeSubmission.length > 0;

  const { isMobile } = useAppContext();
  const { redirectIfNotLoggedIn, loading } = useAuthContext();

  redirectIfNotLoggedIn();

  const { to_university_name } = useDbRefs();

  const {
    url: resumeURL,
    sync: syncResumeURL,
    loading: resumeLoading,
  } = useFile({
    fetcher: useCallback(
      async () =>
        await UserService.getUserResumeURL(
          application?.user_id ?? "",
          application?.resume_id ?? "",
        ),
      [application?.user_id, application?.resume_id],
    ),
    route: useMemo(
      () =>
        application
          ? `/users/${application.user_id}/resume/${application.resume_id}`
          : "",
      [application?.user_id, application?.resume_id],
    ),
  });

  useEffect(() => {
    if (application?.user_id) {
      void syncResumeURL();
    }
  }, [application?.user_id, application?.resume_id, syncResumeURL]);

  if (loading || resumeLoading) {
    return <Loader>Getting applicant information...</Loader>;
  }

  if (!application || !jobId) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Card className="flex flex-col gap-4 p-12">
          <img src="/error.png" alt="Error" className="mx-auto w-96" />
          <HeaderTitle icon={HelpCircle} className="mb-0">
            Application not found.
          </HeaderTitle>
          <div className="flex justify-between">
            <Link href="/dashboard">
              <Button>Go to dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <JobHeader
        job={application.job!}
        backHref={`/dashboard/manage?jobId=${jobId}`}
        applicantActions={
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <ActionButton
              icon={Archive}
              label="Archive application"
              onClick={onArchive}
              className="text-gray-500 enabled:data-[destructive=false]:hover:bg-gray-100 enabled:hover:text-gray-800"
            />
            <DropdownMenu
              items={statuses}
              defaultItem={currentStatus}
              className="min-w-36"
              withDescriptions
            />
            {previousApplicant ? (
              <Link
                href={{
                  pathname: "/dashboard/applicant",
                  query: { applicationId: previousApplicant.id },
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Previous applicant"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                aria-label="Previous applicant"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              <AnimatedCount value={currentApplicantIndex + 1} /> /{" "}
              {otherApplicants.length}
            </span>
            {nextApplicant ? (
              <Link
                href={{
                  pathname: "/dashboard/applicant",
                  query: { applicationId: nextApplicant.id },
                }}
              >
                <Button variant="outline" size="sm" aria-label="Next applicant">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                aria-label="Next applicant"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />
      <PageContainer className="flex flex-col gap-2 py-0">
        <div
          key={application?.id}
          className="flex flex-col overflow-hidden rounded-[0.33em] border md:flex-row"
        >
          <div className="p-5 md:w-[55%] md:border-r md:p-6">
            {/* "header" ish portion */}
            <div className="mb-4">
              <div className="lg:flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn("relative", isMobile ? "mr-2" : "mr-4")}>
                    <UserPfp
                      user_id={user?.id || ""}
                      size={cn(isMobile ? "16" : "20")}
                    />
                  </div>
                  <div className="mx-2">
                    <h3 className="text-xl font-semibold">
                      {getFullName(application?.user)}
                    </h3>
                    <div
                      className={cn(
                        "items-center gap-2 text-sm text-muted-foreground",
                        isMobile ? "flex flex-col items-start" : "flex",
                      )}
                    >
                      {/* Contact info */}
                      {application?.user?.phone_number && (
                        <Link
                          href={`tel:${application?.user?.phone_number}`}
                          className="flex gap-1 text-sm hover:underline hover:text-primary"
                        >
                          <Phone className="h-4 w-4" />
                          {application?.user?.phone_number}
                        </Link>
                      )}
                      {application?.user?.email && (
                        <Link
                          href={`mailto:${application?.user?.email}`}
                          className="flex gap-1 hover:underline text-primary"
                        >
                          <Mail className="h-4 w-4 mt-0.5" />
                          {application?.user?.email}
                        </Link>
                      )}
                    </div>
                    {/* links */}
                    {hasSocialLinks && (
                      <div
                        className={cn(
                          "flex items-center gap-4",
                          isMobile ? "mt-2" : "mt-4",
                        )}
                      >
                        {user?.portfolio_link && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={user.portfolio_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <BriefcaseBusiness className="h-4 w-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs text-gray-500">
                                Applicant Portfolio
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {user?.github_link && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={user.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs text-gray-500">
                                Applicant Github
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {user?.linkedin_link && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={user.linkedin_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs text-gray-500">
                                Applicant Linkedin
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                  {onArchive && (
                    <ActionButton
                      icon={
                        application.visibility === "archived"
                          ? ArchiveRestore
                          : Archive
                      }
                      label={
                        application.visibility === "archived"
                          ? "Unarchive"
                          : "Archive"
                      }
                      enabled={
                        application.visibility === "archived" ||
                        application.status === 4 ||
                        application.status === 6
                      }
                      disabledLabel="Accept or reject this applicant before archiving them."
                      onClick={onArchive}
                    />
                  )}
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="flex flex-col gap-2">
                {hasChallengeSubmission && (
                  <HorizontalCollapsible
                    className="mt-5 flex flex-col border-t pt-5"
                    title="Challenge Submission"
                  >
                    <span className="text-sm/5 whitespace-pre-wrap wrap-break-word">
                      {challengeSubmission}
                    </span>
                  </HorizontalCollapsible>
                )}
                <Accordion type="multiple" className="border-t">
                  <AccordionItem
                    key={application?.user?.id as string}
                    value={application?.user?.id as string}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <span>Applicant Information</span>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      <div className="flex flex-col justify-between">
                        <span className="text-sm text-muted-foreground">
                          Education
                        </span>
                        <span className="text-sm font-medium">
                          {to_university_name(user?.university)}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="text-sm text-muted-foreground">
                          Degree
                        </span>
                        <span className="text-sm font-medium">
                          {user?.degree}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="text-sm text-muted-foreground">
                          Date Applied
                        </span>
                        <span className="text-sm font-medium">
                          {formatDateWithoutTime(application.applied_at)}
                        </span>
                      </div>
                      {user?.expected_graduation_date && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm text-muted-foreground">
                            Expected Graduation Date
                          </span>
                          <span className="text-sm font-medium">
                            {formatMonth(user.expected_graduation_date)}
                          </span>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Accordion type="multiple" className="border-t">
                  <AccordionItem
                    key={application?.user?.id as string}
                    value={application?.user?.id as string}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <span>Internship Requirements</span>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      <div className="flex flex-col justify-between">
                        <span className="text-sm text-muted-foreground">
                          Expected Start Date
                        </span>
                        <span className="text-sm font-medium">
                          {formatTimestampDateWithoutTime(
                            internshipPreferences?.expected_start_date,
                          )}
                        </span>
                      </div>
                      {internshipPreferences?.expected_duration_hours !=
                        null && (
                        <div className="flex flex-col justify-between">
                          <span className="text-sm text-muted-foreground">
                            Expected Duration (Hours)
                          </span>
                          <span className="text-sm font-medium">
                            {internshipPreferences.expected_duration_hours}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Internship Type
                        </span>
                        {internshipTypeBadge}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <>
                {hasChallengeSubmission && (
                  <HorizontalCollapsible
                    className="mt-5 flex flex-col border-t pt-5"
                    title="Challenge Submission"
                  >
                    <span className="text-sm/5 whitespace-pre-wrap break-words">
                      {challengeSubmission}
                    </span>
                  </HorizontalCollapsible>
                )}
                <div className="mt-5 border-t pt-5">
                  {application?.user?.bio && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {application?.user?.bio}
                      </p>
                      <Divider />
                    </div>
                  )}
                  <div className="items-center gap-3 mb-4 sm:mb-5">
                    <h3 className="text-base font-semibold text-gray-900">
                      Applicant Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="text-sm font-medium text-gray-900">
                        {to_university_name(user?.university)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Degree</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.degree}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date Applied</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateWithoutTime(application.applied_at)}
                      </p>
                    </div>
                    {user?.expected_graduation_date && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm text-gray-500">
                          Expected Graduation Date
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatMonth(user.expected_graduation_date)}
                        </p>
                      </div>
                    )}
                  </div>
                  <Divider />
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <h3 className="text-base font-semibold text-gray-900">
                      Internship Requirements
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        Expected Start Date
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatTimestampDateWithoutTime(
                          internshipPreferences?.expected_start_date,
                        )}
                      </p>
                    </div>
                    {internshipPreferences?.expected_duration_hours != null && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Expected Duration (Hours)
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {internshipPreferences.expected_duration_hours}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Internship Type</p>
                      {internshipTypeBadge}
                    </div>
                  </div>
                </div>

                {/* other roles *note: will make this look better */}
                <div className="mt-5 flex flex-col border-t pt-5">
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    {application?.job ? (
                      <h3 className="text-base font-semibold text-gray-900">
                        Other Applied Roles
                      </h3>
                    ) : (
                      <h3 className="text-base font-semibold text-gray-900">
                        Applied Roles
                      </h3>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {(userApplications?.length ?? 0) > 0 ? (
                      userApplications?.map((a) => {
                        if (!a.id) return null;

                        const status =
                          DB_STATUS_MAP[Number(a.status ?? 0)]?.key ??
                          "pending";
                        const statusConfig = UI_STATUS_MAP.get(status);
                        const StatusIcon = statusConfig?.icon;
                        const statusClasses: Record<string, string> = {
                          pending: "bg-amber-50 text-amber-700",
                          shortlisted: "bg-blue-50 text-blue-700",
                          accepted: "bg-emerald-50 text-emerald-700",
                          rejected: "bg-rose-50 text-rose-700",
                          archived: "bg-gray-100 text-gray-600",
                        };

                        return (
                          <Link
                            key={a.id}
                            href={{
                              pathname: "/dashboard/applicant",
                              query: { applicationId: a.id },
                            }}
                            className="group flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-gray-50"
                          >
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 group-hover:text-primary">
                              {a.job?.title ?? "Untitled role"}
                            </span>
                            <span className="flex shrink-0 items-center gap-3">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium capitalize",
                                  statusClasses[status],
                                )}
                              >
                                {StatusIcon && (
                                  <StatusIcon className="h-3 w-3" />
                                )}
                                {status}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-primary">
                                View application
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                              </span>
                            </span>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">
                        No other applied roles
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* resume */}
          {application?.resume_id ? (
            <div className="flex h-full min-w-0 w-full flex-col items-center justify-center overflow-hidden md:w-[45%]">
              <PDFPreview url={resumeURL} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-8 w-full">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h1 className="font-heading font-bold text-2xl mb-4 text-gray-700">
                  No Resume Available
                </h1>
                <div className="max-w-md text-center border border-red-200 text-red-600 bg-red-50 rounded-lg p-4">
                  This applicant has not uploaded a resume yet.
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
