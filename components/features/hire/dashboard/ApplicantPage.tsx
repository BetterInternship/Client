import { PDFPreview } from "@/components/shared/pdf-preview";
import { UserPfp } from "@/components/shared/pfp";
import { type DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { HorizontalCollapsible } from "@/components/ui/horizontal-collapse";
import { useFile } from "@/hooks/use-file";
import { UserService } from "@/lib/api/services";
import { useAppContext } from "@/lib/ctx-app";
import { EmployerApplication, PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { getFullName } from "@/lib/profile";
import {
  cn,
  Badge,
  Button,
  PageContainer,
  AnimatedCount,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@betterinternship/components";
import {
  formatMonth,
  formatOptionalTimestampDate,
} from "@/lib/utils/date-utils";
import {
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

interface ApplicantPageProps {
  jobId: string | undefined;
  application: EmployerApplication | undefined;
  userApplications?: EmployerApplication[] | undefined;
  statuses: DropdownMenuItem[];
}

export function ApplicantPage({
  jobId,
  application,
  userApplications,
  statuses,
}: ApplicantPageProps) {
  const user = application?.user as Partial<PublicUser>;

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

  const internshipPreferences = user?.internship_preferences;
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
        application ? `/users/${user?.id}/resume/${application.resume_id}` : "",
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
      />
      <PageContainer className="flex flex-col gap-2">
        {otherApplicants.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {previousApplicant ? (
              <Link
                href={{
                  pathname: "/dashboard/applicant",
                  query: { applicationId: previousApplicant.id },
                }}
              >
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Previous
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
                <Button variant="outline" size="sm" className="gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="gap-1">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <div key={application?.id} className="flex flex-col md:flex-row">
          <div className="p-4 rounded-[0.33em] border md:w-1/2">
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
                    <div className="flex gap-2">
                      <h3 className={cn(isMobile ? "text-lg" : "text-xl")}>
                        {getFullName(application?.user)}
                      </h3>
                      {internshipPreferences?.internship_type === "credited" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              type="supportive"
                              variant="solid"
                              className="gap-1"
                            >
                              <Award className="w-4 h-4" />
                              <span>Credited</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-muted-foreground text-xs">
                              This applicant is looking for internships for
                              credit
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="solid" className="gap-1">
                              <HandHelping className="w-4 h-4" />
                              <span>Voluntary</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-muted-foreground text-xs">
                              This applicant is looking for internships
                              voluntarily
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div
                      className={cn(
                        "items-center gap-2 text-xs text-muted-foreground",
                        isMobile ? "flex-col" : "flex",
                      )}
                    >
                      {/* Contact info */}
                      {application?.user?.phone_number !== null && (
                        <Link
                          href={`tel:${application?.user?.phone_number}`}
                          className="text-muted-foreground text-xs underline hover:text-primary flex gap-1"
                        >
                          <Phone className="h-4 w-4" />
                          {application?.user?.phone_number}
                        </Link>
                      )}
                      {!isMobile && (
                        <p className="text-xs text-muted-foreground"> | </p>
                      )}
                      {application?.user?.edu_verification_email !== null && (
                        <Link
                          href={`mailto:${application?.user?.edu_verification_email}`}
                          className="text-muted-foreground text-xs underline hover:text-primary flex gap-1"
                        >
                          <Mail className="h-4 w-4" />
                          {application?.user?.edu_verification_email}
                        </Link>
                      )}
                    </div>
                    {/* links */}
                    <div
                      className={cn(
                        "flex gap-4 items-center",
                        isMobile ? "mt-2" : "mt-4",
                      )}
                    >
                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {user?.portfolio_link ? (
                              <a
                                href={user?.portfolio_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <BriefcaseBusiness className="h-4 w-4" />
                              </a>
                            ) : (
                              <p className="text-gray-300 font-medium break-all text-xs cursor-default">
                                <BriefcaseBusiness className="h-4 w-4" />
                              </p>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs text-gray-500">
                              Applicant Portfolio
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {user?.github_link ? (
                              <a
                                href={user?.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            ) : (
                              <p className="text-gray-300 font-medium break-all text-xs cursor-default">
                                <Github className="h-4 w-4" />
                              </p>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs text-gray-500">
                              Applicant Github
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {user?.linkedin_link ? (
                              <a
                                href={user?.linkedin_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-950 hover:text-slate-500 ease-in-out font-medium break-all text-xs"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            ) : (
                              <p className="text-gray-300 font-medium break-all text-xs cursor-default">
                                <Linkedin className="h-4 w-4" />
                              </p>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs text-gray-500">
                              Applicant Linkedin
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="flex flex-col gap-2">
                {hasChallengeSubmission && (
                  <HorizontalCollapsible
                    className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200"
                    title="Challenge Submission"
                  >
                    <span className="text-sm/5 whitespace-pre-wrap wrap-break-word">
                      {challengeSubmission}
                    </span>
                  </HorizontalCollapsible>
                )}
                <Accordion
                  type="multiple"
                  className="rounded-[0.33em] border px-3"
                >
                  <AccordionItem
                    key={application?.user?.id as string}
                    value={application?.user?.id as string}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <span>Applicant Information</span>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      <div className="flex flex-col justify-between">
                        <span className="text-muted-foreground text-xs">
                          Education
                        </span>
                        <span className="font-medium">
                          {to_university_name(user?.university)}
                        </span>
                        <span className="text-xs">{user?.degree}</span>
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="text-muted-foreground text-xs">
                          Expected Graduation Date
                        </span>
                        <span className="font-medium">
                          {formatOptionalTimestampDate(
                            user?.expected_graduation_date,
                          )}
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Accordion
                  type="multiple"
                  className="rounded-[0.33em] border px-3"
                >
                  <AccordionItem
                    key={application?.user?.id as string}
                    value={application?.user?.id as string}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <span>Internship Requirements</span>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      <div className="flex flex-col justify-between">
                        <span className="text-muted-foreground text-xs">
                          Expected Start Date
                        </span>
                        <span className="font-medium">
                          {formatOptionalTimestampDate(
                            internshipPreferences?.expected_start_date,
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="text-xs text-muted-foreground">
                          Expected Duration (Hours)
                        </span>
                        <span className="font-medium">
                          {internshipPreferences?.expected_duration_hours ||
                            "No specified duration"}
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <>
                {hasChallengeSubmission && (
                  <HorizontalCollapsible
                    className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200"
                    title="Challenge Submission"
                  >
                    <span className="text-sm/5 whitespace-pre-wrap break-words">
                      {challengeSubmission}
                    </span>
                  </HorizontalCollapsible>
                )}
                <div className="bg-blue-50 rounded-[0.33em] p-4 border border-gray-200">
                  {application?.user?.bio ? (
                    <div>
                      <p className="text-xs">{application?.user?.bio}</p>
                      <Divider />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs">Applicant has not added a bio.</p>
                      <Divider />
                    </div>
                  )}
                  <div className="items-center gap-3 mb-4 sm:mb-5">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      Applicant Information
                    </h3>
                    {application?.job && (
                      <p className="text-xs text-gray-500 mb-2">
                        Applying for: {application?.job?.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <p className={cn("text-gray-500 text-xs")}>Education</p>
                      <p
                        className={cn(
                          "font-medium text-gray-900",
                          isMobile ? "text-xs" : "text-sm",
                        )}
                      >
                        {to_university_name(user?.university)}
                      </p>
                      <p className="text-xs text-gray-500">{user?.degree}</p>
                    </div>
                    <div>
                      <p className={cn("text-gray-500 text-xs")}>
                        Expected Graduation Date
                      </p>
                      <p
                        className={cn(
                          "font-medium text-gray-900",
                          isMobile ? "text-xs" : "text-sm",
                        )}
                      >
                        {formatMonth(user?.expected_graduation_date)}
                      </p>
                    </div>
                  </div>
                  <Divider />
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      Internship Requirements
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className={cn(isMobile ? "flex justify-between" : "")}>
                      <p
                        className={cn(
                          "text-gray-500",
                          isMobile ? "text-sm" : "text-xs",
                        )}
                      >
                        Expected Start Date
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatOptionalTimestampDate(
                          internshipPreferences?.expected_start_date,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Expected Duration (Hours)
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {internshipPreferences?.expected_duration_hours}
                      </p>
                    </div>
                  </div>
                </div>

                {/* other roles *note: will make this look better */}
                <div className="flex flex-col my-2 mt-2 bg-blue-50 rounded-[0.33em] p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    {application?.job ? (
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Other Applied Roles
                      </h3>
                    ) : (
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Applied Roles
                      </h3>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userApplications?.length !== 0 ? (
                      userApplications?.map((a) => (
                        <Badge>
                          <p className="inline-flex items-center text-gray-500 text-xs">
                            {a.job?.title}
                          </p>
                        </Badge>
                      ))
                    ) : (
                      <>
                        {application?.job ? (
                          <p className="text-gray-500 text-sm">
                            {" "}
                            No applied roles
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            {" "}
                            No other applied roles
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* resume */}
          {application?.resume_id ? (
            <div
              className={cn(
                "h-full flex flex-col justify-center items-center",
                isMobile ? "mt-4 w-full" : "",
              )}
            >
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
